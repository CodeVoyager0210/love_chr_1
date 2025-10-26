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