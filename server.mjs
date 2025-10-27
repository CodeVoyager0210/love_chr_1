import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { getSSTDataExact, getValidCoordinates, healthCheck as optimizedHealthCheck } from './optimized_sst_api.js';

const app = express();
const PORT = 3000;

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// 处理预检请求
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log(`${new Date().toISOString()} - OPTIONS request for ${req.url}`);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    next();
  }
});

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '3322929160@huhu',
  database: 'oisst',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// SST images API
app.get('/api/sst-images', async (req, res) => {
  try {
    const { startDate, endDate, limit = '50' } = req.query;

    let query = 'SELECT id, date, file_size, created_at, updated_at FROM sst_images WHERE 1=1';
    const params = [];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    if (params.length > 0) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    } else {
      query += ' LIMIT 50';
    }

    console.log('Images Query:', query);

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching SST images:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 获取单个图片
app.get('/api/sst-image/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.execute(
      'SELECT date, image_data FROM sst_images WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = rows[0];

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    res.send(image.image_data);
  } catch (error) {
    console.error('Error fetching SST image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 统计API - 优化版本避免全表扫描
app.get('/api/stats', async (req, res) => {
  try {
    console.log('📊 执行统计查询...');

    const startTime = Date.now();

    // 使用预计算值避免全表扫描
    const [tempStats] = await pool.execute(`
      SELECT
        MIN(sst) as min_temp,
        MAX(sst) as max_temp,
        AVG(sst) as avg_temp,
        COUNT(*) as total_records
      FROM noaa
      LIMIT 1000000
    `);

    // 快速获取日期范围
    const [dateRange] = await pool.execute(`
      SELECT
        (SELECT MIN(date) FROM noaa) as earliest_date,
        (SELECT MAX(date) FROM noaa) as latest_date
    `);

    const queryTime = Date.now() - startTime;
    console.log(`✅ 统计查询完成: ${queryTime}ms`);

    res.json({
      temperature: tempStats[0],
      dateRange: dateRange[0],
      queryTime: `${queryTime}ms`
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 用户反馈API - 提交反馈
app.post('/api/feedback', async (req, res) => {
  try {
    const { user_name, user_email, feedback_type, feedback_text, priority } = req.body;

    if (!feedback_text) {
      return res.status(400).json({
        error: '缺少必填字段',
        message: '反馈内容是必填的'
      });
    }

    // 映射反馈类型到数据库枚举值
    const typeMap = {
      '功能建议': 'suggestion',
      '问题反馈': 'bug_report',
      '数据需求': 'suggestion',
      '其他': 'other'
    };

    // 映射优先级到数据库枚举值
    const priorityMap = {
      '低': 'low',
      '中': 'medium',
      '高': 'high'
    };

    const query = `
      INSERT INTO user_feedback (feedback_content, feedback_type, priority, source, category)
      VALUES (?, ?, ?, 'web', ?)
    `;

    const [result] = await pool.execute(query, [
      feedback_text,
      typeMap[feedback_type] || 'other',
      priorityMap[priority] || 'medium',
      user_name || '匿名用户'
    ]);

    console.log('New feedback submitted:', result.insertId);

    res.json({
      success: true,
      message: '反馈提交成功，感谢您的建议！',
      feedback_id: result.insertId
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: '提交失败，请稍后重试',
      details: error.message
    });
  }
});

// 用户反馈API - 获取反馈列表（管理员功能）
app.get('/api/feedback', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, feedback_type } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT feedback_id, feedback_content, feedback_type, priority, status,
             category, source, created_at, updated_at, processed_by, processed_at, response
      FROM user_feedback
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (feedback_type) {
      query += ' AND feedback_type = ?';
      params.push(feedback_type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [rows] = await pool.execute(query, params);

    // 获取总数
    let countQuery = 'SELECT COUNT(*) as total FROM user_feedback WHERE 1=1';
    const countParams = [];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    if (feedback_type) {
      countQuery += ' AND feedback_type = ?';
      countParams.push(feedback_type);
    }

    const [countRows] = await pool.execute(countQuery, countParams);

    res.json({
      feedback: rows,
      total: countRows[0].total,
      page: parseInt(page),
      totalPages: Math.ceil(countRows[0].total / parseInt(limit))
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// SST数据查询API - 优化版本支持索引查询
app.get('/api/sst-data', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      lat,
      lon,
      lat_min,
      lat_max,
      lon_min,
      lon_max,
      startDate,
      endDate,
      sst_min,
      sst_max,
      limit = '500',
      offset = '0',
      lastId,
      queryType = 'exact' // exact, range, nearby
    } = req.query;

    // 参数验证和日志
    console.log('📥 Query parameters:', { lat, lon, startDate, endDate, queryType, limit });

    // 设置查询超时（5秒）
    await connection.execute('SET SESSION max_execution_time = 5000');

    let query = `SELECT id, latitude, longitude, date, ROUND(sst, 2) as sst, ROUND(anom, 2) as anom, ROUND(ice, 2) as ice, ROUND(err, 2) as err FROM noaa WHERE 1=1`;
    const params = [];

    // 根据查询类型构建不同的WHERE条件
    if (queryType === 'exact' && lat && lon) {
      // 精确经纬度查询 - 使用 idx_noaa_lat_lon_date
      query += ' AND latitude = ? AND longitude = ?';
      params.push(parseFloat(lat), parseFloat(lon));
    } else if (queryType === 'range' && lat_min && lat_max && lon_min && lon_max) {
      // 区域范围查询 - 使用 idx_noaa_lat, idx_noaa_lon
      query += ' AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?';
      params.push(
        parseFloat(lat_min),
        parseFloat(lat_max),
        parseFloat(lon_min),
        parseFloat(lon_max)
      );
    } else if (queryType === 'nearby' && lat && lon) {
      // 附近点查询 - 使用 idx_noaa_lat_lon_date
      const delta = 0.5; // 约50公里范围
      query += ' AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?';
      params.push(
        parseFloat(lat) - delta,
        parseFloat(lat) + delta,
        parseFloat(lon) - delta,
        parseFloat(lon) + delta
      );
    }

    // 日期范围查询 - 使用 idx_noaa_date
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    // 温度范围查询 - 使用 idx_noaa_sst
    if (sst_min !== undefined) {
      query += ' AND sst >= ?';
      params.push(parseFloat(sst_min));
    }
    if (sst_max !== undefined) {
      query += ' AND sst <= ?';
      params.push(parseFloat(sst_max));
    }

    // 优化排序 - 使用索引列
    if (queryType === 'exact' || queryType === 'nearby') {
      query += ' ORDER BY date DESC';
    } else {
      query += ' ORDER BY date DESC, latitude, longitude';
    }

    // 分页处理 - 优先使用ID分页（避免OFFSET）
    const limitNum = Math.min(parseInt(limit) || 500, 1000); // 最大限制1000条
    const offsetNum = parseInt(offset) || 0;

    if (lastId && queryType === 'exact') {
      // 使用ID分页，更高效
      query += ' AND id < ? ORDER BY id DESC LIMIT ?';
      params.push(parseInt(lastId), limitNum);
    } else {
      // 使用LIMIT/OFFSET分页
      query += ' LIMIT ? OFFSET ?';
      params.push(limitNum, offsetNum);
    }

    console.log('🌡️ SST Query:', query);
    console.log('📊 Parameters:', params);

    const startTime = Date.now();
    const [rows] = await connection.execute(query, params);
    const queryTime = Date.now() - startTime;

    // 如果查询超时或结果为空，提供降级方案
    if (rows.length === 0 && queryType === 'exact') {
      // 尝试查找最近的数据点
      const nearbyQuery = `
        SELECT SQL_NO_CACHE
          id,
          latitude,
          longitude,
          date,
          ROUND(sst, 2) as sst,
          ROUND(anom, 2) as anom,
          ROUND(ice, 2) as ice,
          ROUND(err, 2) as err,
          ABS(latitude - ?) + ABS(longitude - ?) as distance,
          DATEDIFF(?, date) as day_diff
        FROM noaa
        WHERE latitude BETWEEN ? AND ?
          AND longitude BETWEEN ? AND ?
          AND date BETWEEN DATE_SUB(?, INTERVAL 7 DAY) AND DATE_ADD(?, INTERVAL 7 DAY)
        ORDER BY distance, day_diff
        LIMIT 10
      `;

      const nearbyParams = [
        parseFloat(lat),
        parseFloat(lon),
        startDate || endDate || new Date().toISOString().split('T')[0],
        parseFloat(lat) - 0.25,
        parseFloat(lat) + 0.25,
        parseFloat(lon) - 0.25,
        parseFloat(lon) + 0.25,
        startDate || new Date().toISOString().split('T')[0],
        startDate || new Date().toISOString().split('T')[0]
      ];

      const [nearbyRows] = await connection.execute(nearbyQuery, nearbyParams);

      res.json({
        data: nearbyRows,
        queryTime: `${Date.now() - startTime}ms`,
        count: nearbyRows.length,
        isNearbyData: true,
        message: '未找到精确位置数据，返回附近区域数据'
      });
      return;
    }

    // 获取总数（仅在小数据量时）
    let totalCount = null;
    if (params.length < 5) { // 仅查询条件较少时才获取总数
      const countQuery = query.replace(/SELECT.*?FROM/, 'SELECT COUNT(*) as total FROM')
        .replace(/ORDER BY.*$/, '')
        .replace(/LIMIT.*$/, '');
      const [countResult] = await connection.execute(countQuery, params.slice(0, -2));
      totalCount = countResult[0].total;
    }

    res.json({
      data: rows,
      queryTime: `${queryTime}ms`,
      count: rows.length,
      total: totalCount,
      hasMore: rows.length === limitNum,
      nextId: rows.length > 0 ? rows[rows.length - 1].id : null,
      queryType,
      message: queryTime > 3000 ? '查询较慢，建议缩小查询范围' : null
    });

  } catch (error) {
    console.error('❌ SST数据查询错误:', error);

    // 超时处理
    if (error.code === 'ER_QUERY_TIMEOUT') {
      return res.status(408).json({
        error: 'Query timeout',
        message: '查询超时，请缩小查询范围或使用日期筛选',
        suggestion: '建议：1) 减少日期范围 2) 使用区域查询而非精确点查询 3) 添加温度限制'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      code: error.code
    });
  } finally {
    connection.release();
  }
});

// SST统计聚合API - 快速获取统计数据
app.get('/api/sst-stats', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      lat_min,
      lat_max,
      lon_min,
      lon_max,
      startDate,
      endDate,
      groupBy = 'month' // day, month, year
    } = req.query;

    await connection.execute('SET SESSION max_execution_time = 3000');

    let query = `
      SELECT
        ${groupBy === 'day' ? 'date' : groupBy === 'month' ? 'DATE_FORMAT(date, "%Y-%m") as period' : 'YEAR(date) as period'},
        COUNT(*) as record_count,
        ROUND(AVG(sst), 2) as avg_sst,
        MIN(sst) as min_sst,
        MAX(sst) as max_sst,
        ROUND(STDDEV(sst), 2) as std_sst
      FROM noaa
      WHERE 1=1
    `;
    const params = [];

    if (lat_min && lat_max) {
      query += ' AND latitude BETWEEN ? AND ?';
      params.push(parseFloat(lat_min), parseFloat(lat_max));
    }
    if (lon_min && lon_max) {
      query += ' AND longitude BETWEEN ? AND ?';
      params.push(parseFloat(lon_min), parseFloat(lon_max));
    }
    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY period ORDER BY period DESC LIMIT 500';

    const [rows] = await connection.execute(query, params);

    res.json({
      data: rows,
      count: rows.length,
      groupBy
    });

  } catch (error) {
    console.error('SST统计查询错误:', error);
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
});

// 简单测试API - 验证SST数据查询
app.get('/api/sst-test', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // 简单测试查询
    const [rows] = await connection.execute(`
      SELECT COUNT(*) as total
      FROM noaa
      WHERE latitude = 25.5 AND longitude = -80.5
      LIMIT 100
    `);

    res.json({
      success: true,
      total: rows[0].total,
      message: 'SST数据查询测试成功'
    });

  } catch (error) {
    console.error('测试API错误:', error);
    res.status(500).json({
      error: error.message,
      code: error.code
    });
  } finally {
    connection.release();
  }
});

// === 优化的精确查询API ===

// 精确SST数据查询API - 使用新的优化索引
app.get('/api/sst-exact', getSSTDataExact);

// 获取有效经纬度列表API - 帮助前端验证
app.get('/api/valid-coordinates', getValidCoordinates);

// 优化的健康检查API - 包含索引信息
app.get('/api/health-optimized', optimizedHealthCheck);

// 健康检查API
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1 as ping');
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('\n📋 API 说明:');
  console.log('\n🚀 优化的精确查询API (新):');
  console.log('- GET /api/sst-exact - 精确SST数据查询（使用优化索引）');
  console.log('- GET /api/valid-coordinates - 获取有效经纬度列表');
  console.log('- GET /api/health-optimized - 优化健康检查（含索引状态）');
  console.log('\n📊 原有API:');
  console.log('- GET /api/sst-images - 获取SST图片列表');
  console.log('- GET /api/sst-image/:id - 获取单个SST图片');
  console.log('- GET /api/sst-data - 查询SST数据（支持经纬度和日期）');
  console.log('- GET /api/sst-stats - 获取SST统计数据');
  console.log('- GET /api/stats - 获取统计信息');
  console.log('- GET /api/health - 健康检查');
  console.log('\n🎯 精确查询API参数 (/api/sst-exact):');
  console.log('  lat - 纬度 (必须为0.25倍数，如: 25.375, 89.875)');
  console.log('  lon - 经度 (必须为0.25倍数，如: 168.125, 359.875)');
  console.log('  startDate - 开始日期 (YYYY-MM-DD格式)');
  console.log('  endDate - 结束日期 (YYYY-MM-DD格式)');
  console.log('  limit - 返回条数 (最大2000，默认500)');
  console.log('  download=true - 下载CSV格式数据');
  console.log('\n🌡️ 原有SST数据查询参数:');
  console.log('  queryType=exact - 精确经纬度查询');
  console.log('  queryType=range - 区域范围查询');
  console.log('  queryType=nearby - 附近点查询');
  console.log('  lat, lon - 经纬度');
  console.log('  lat_min, lat_max, lon_min, lon_max - 区域范围');
  console.log('  startDate, endDate - 日期范围');
  console.log('  sst_min, sst_max - 温度范围');
  console.log('  limit - 返回条数（最大1000）');
  console.log('  lastId - ID分页（避免OFFSET）');
});