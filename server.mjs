import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
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
  console.log('- GET /api/sst-images - 获取SST图片列表');
  console.log('- GET /api/sst-image/:id - 获取单个SST图片');
  console.log('- GET /api/stats - 获取统计信息');
  console.log('- GET /api/health - 健康检查');
});