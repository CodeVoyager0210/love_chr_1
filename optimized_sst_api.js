// 优化的SST精确查询API模块
// 专门针对海洋表面温度的精确经纬度查询优化

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '3322929160@huhu',
  database: 'oisst',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 验证经纬度是否为0.25的倍数且在有效范围内
function validateCoordinate(value, type) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return { valid: false, error: `${type}必须是数字` };
  }

  // 验证是否符合0.25递增的格式（从0.125开始）
  const multiplied = num / 0.25;
  const fractionalPart = multiplied - Math.floor(multiplied);
  // 有效的值应该是x.5的形式，即小数部分是0.5
  if (Math.abs(fractionalPart - 0.5) > 0.001) {
    return { valid: false, error: `${type}必须是0.25递增的值（如：0.125, 0.375, 25.375, 168.125）` };
  }

  // 根据数据库中的实际数据范围验证
  if (type === 'latitude') {
    if (num < -78.375 || num > 89.875) {
      return { valid: false, error: `纬度必须在-78.375到89.875之间，间隔0.25` };
    }
  } else if (type === 'longitude') {
    if (num < 0.125 || num > 359.875) {
      return { valid: false, error: `经度必须在0.125到359.875之间，间隔0.25` };
    }
  }

  return { valid: true, value: num };
}

// 验证日期格式
function validateDate(dateStr, fieldName) {
  if (!dateStr) return { valid: true };

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName}日期格式无效，请使用YYYY-MM-DD格式` };
  }

  // 检查日期是否在数据范围内
  const minDate = new Date('2025-01-01');
  const maxDate = new Date('2025-07-31');

  if (date < minDate || date > maxDate) {
    return { valid: false, error: `${fieldName}必须在2025-01-01到2025-07-31之间` };
  }

  return { valid: true, value: dateStr };
}

// 主要的精确查询API
export async function getSSTDataExact(req, res) {
  const connection = await pool.getConnection();
  try {
    const {
      lat,
      lon,
      startDate,
      endDate,
      limit = '500',
      download = 'false'
    } = req.query;

    console.log('🌊 精确SST查询请求:', { lat, lon, startDate, endDate, limit, download });

    // 1. 参数验证
    const latValidation = validateCoordinate(lat, '纬度');
    if (!latValidation.valid) {
      return res.status(400).json({
        error: '参数错误',
        message: latValidation.error,
        examples: {
          validLatitude: ['0.125', '0.375', '25.375', '89.875', '359.875'],
          validLongitude: ['0.125', '0.375', '168.125', '359.875'],
          format: '必须是0.25的倍数'
        }
      });
    }

    const lonValidation = validateCoordinate(lon, '经度');
    if (!lonValidation.valid) {
      return res.status(400).json({
        error: '参数错误',
        message: lonValidation.error
      });
    }

    const startDateValidation = validateDate(startDate, '开始日期');
    if (!startDateValidation.valid) {
      return res.status(400).json({
        error: '参数错误',
        message: startDateValidation.error
      });
    }

    const endDateValidation = validateDate(endDate, '结束日期');
    if (!endDateValidation.valid) {
      return res.status(400).json({
        error: '参数错误',
        message: endDateValidation.error
      });
    }

    // 2. 设置查询超时（2秒，因为现在有优化索引）
    await connection.execute('SET SESSION max_execution_time = 2000');

    // 3. 构建优化查询 - 使用新的索引 idx_exact_query_lat_lon_date
    let query = `
      SELECT SQL_NO_CACHE
        id,
        latitude,
        longitude,
        date,
        ROUND(sst, 2) as sst,
        ROUND(anom, 2) as anom,
        ROUND(ice, 2) as ice,
        ROUND(err, 2) as err
      FROM noaa
      WHERE latitude = ? AND longitude = ?`;

    const params = [latValidation.value, lonValidation.value];

    // 添加日期范围条件
    if (startDate && endDate) {
      query += ' AND date BETWEEN ? AND ?';
      params.push(startDateValidation.value, endDateValidation.value);
    } else if (startDate) {
      query += ' AND date >= ?';
      params.push(startDateValidation.value);
    } else if (endDate) {
      query += ' AND date <= ?';
      params.push(endDateValidation.value);
    }

    // 使用索引排序 - 完美支持 ORDER BY date DESC
    query += ' ORDER BY date DESC';

    // 限制结果数量
    const limitNum = Math.min(parseInt(limit) || 500, 2000);
    query += ' LIMIT ' + limitNum;

    console.log('🚀 执行优化查询:', query);
    console.log('📊 查询参数:', params);

    // 4. 执行查询
    const startTime = Date.now();
    const [rows] = await connection.execute(query, params);
    const queryTime = Date.now() - startTime;

    console.log(`✅ 查询完成: ${queryTime}ms, 找到 ${rows.length} 条记录`);

    // 5. 如果是下载请求，返回CSV格式
    if (download === 'true') {
      if (rows.length === 0) {
        return res.status(404).json({
          error: '无数据',
          message: '指定经纬度和时间范围内没有找到数据'
        });
      }

      // 生成CSV内容
      const csvHeader = 'Date,Latitude,Longitude,SST(°C),Anomaly,Ice,Error\n';
      const csvData = rows.map(row =>
        `${row.date},${row.latitude},${row.longitude},${row.sst},${row.anom || ''},${row.ice || ''},${row.err || ''}`
      ).join('\n');

      const csv = csvHeader + csvData;

      // 设置响应头为CSV下载
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="sst_data_${latValidation.value}_${lonValidation.value}.csv"`);
      res.send(csv);
      return;
    }

    // 6. 返回JSON结果
    res.json({
      success: true,
      data: rows,
      queryTime: `${queryTime}ms`,
      count: rows.length,
      parameters: {
        latitude: latValidation.value,
        longitude: lonValidation.value,
        startDate: startDateValidation.value || null,
        endDate: endDateValidation.value || null,
        limit: limitNum
      },
      performance: {
        queryTimeMs: queryTime,
        indexUsed: 'idx_exact_query_lat_lon_date',
        message: queryTime > 1000 ? '查询较慢，建议缩小日期范围' : '查询优化成功'
      }
    });

  } catch (error) {
    console.error('❌ 精确SST查询错误:', error);

    // 详细的错误处理
    if (error.code === 'ER_QUERY_TIMEOUT') {
      return res.status(408).json({
        error: '查询超时',
        message: '查询时间过长，请缩小查询范围',
        suggestions: [
          '减少日期范围',
          '确保输入正确的经纬度格式',
          '检查网络连接'
        ]
      });
    }

    if (error.code === 'ER_NO_SUCH_TABLE') {
      return res.status(500).json({
        error: '数据库错误',
        message: '数据表不存在'
      });
    }

    res.status(500).json({
      error: '内部服务器错误',
      message: error.message,
      code: error.code
    });
  } finally {
    connection.release();
  }
}

// 获取有效的经纬度列表API - 帮助前端验证
export async function getValidCoordinates(req, res) {
  try {
    const [latValues] = await pool.execute(`
      SELECT DISTINCT latitude
      FROM noaa
      ORDER BY latitude
      LIMIT 20
    `);

    const [lonValues] = await pool.execute(`
      SELECT DISTINCT longitude
      FROM noaa
      ORDER BY longitude
      LIMIT 20
    `);

    res.json({
      validLatitudes: latValues.map(row => row.latitude),
      validLongitudes: lonValues.map(row => row.longitude),
      step: 0.25,
      latitudeRange: { min: 0.125, max: 359.875 },
      longitudeRange: { min: 0.125, max: 359.875 },
      examples: {
        coordinates: [
          { lat: 25.375, lon: 168.125 },
          { lat: 89.875, lon: 359.875 },
          { lat: 0.125, lon: 0.125 }
        ]
      }
    });
  } catch (error) {
    console.error('获取有效坐标错误:', error);
    res.status(500).json({ error: error.message });
  }
}

// 健康检查API - 包含索引信息
export async function healthCheck(req, res) {
  try {
    const [ping] = await pool.execute('SELECT 1 as ping');

    // 检查新索引是否存在
    const [indexes] = await pool.execute(`
      SELECT COUNT(*) as count
      FROM information_schema.statistics
      WHERE table_schema = 'oisst'
      AND table_name = 'noaa'
      AND index_name = 'idx_exact_query_lat_lon_date'
    `);

    const hasOptimizedIndex = indexes[0].count > 0;

    res.json({
      status: 'healthy',
      database: 'connected',
      optimizedIndex: hasOptimizedIndex,
      indexName: 'idx_exact_query_lat_lon_date',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message
    });
  }
}

export default {
  getSSTDataExact,
  getValidCoordinates,
  healthCheck
};