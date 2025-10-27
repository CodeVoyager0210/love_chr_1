import mysql from 'mysql2/promise';

async function analyzeNOAATable() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    console.log('🔍 分析 NOAA 表结构...\n');

    // 1. 查看表结构
    console.log('=== 表结构 ===');
    const [tableStructure] = await connection.execute('DESCRIBE noaa');
    tableStructure.forEach(col => {
      console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}) ${col.Key ? '[' + col.Key + ']' : ''}`);
    });

    // 2. 查看现有索引
    console.log('\n=== 现有索引 ===');
    const [indexes] = await connection.execute('SHOW INDEX FROM noaa');
    const indexMap = {};
    indexes.forEach(idx => {
      if (!indexMap[idx.Key_name]) {
        indexMap[idx.Key_name] = [];
      }
      indexMap[idx.Key_name].push(idx.Column_name);
    });

    Object.keys(indexMap).forEach(keyName => {
      console.log(`${keyName}: (${indexMap[keyName].join(', ')})`);
    });

    // 3. 查看表统计信息
    console.log('\n=== 表统计信息 ===');
    const [tableStatus] = await connection.execute("SHOW TABLE STATUS LIKE 'noaa'");
    const status = tableStatus[0];
    console.log(`数据行数: ${status.Rows.toLocaleString()}`);
    console.log(`数据大小: ${(status.Data_length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`索引大小: ${(status.Index_length / 1024 / 1024).toFixed(2)} MB`);
    console.log(`总大小: ${(status.Data_length + status.Index_length) / 1024 / 1024} MB`);

    // 4. 查看数据范围
    console.log('\n=== 数据范围 ===');
    const [dataRange] = await connection.execute(`
      SELECT
        MIN(latitude) as min_lat,
        MAX(latitude) as max_lat,
        MIN(longitude) as min_lon,
        MAX(longitude) as max_lon,
        MIN(date) as min_date,
        MAX(date) as max_date,
        COUNT(DISTINCT latitude) as unique_lats,
        COUNT(DISTINCT longitude) as unique_lons,
        COUNT(DISTINCT date) as unique_dates
      FROM noaa
    `);

    const range = dataRange[0];
    console.log(`纬度范围: ${range.min_lat} 到 ${range.max_lat}`);
    console.log(`经度范围: ${range.min_lon} 到 ${range.max_lon}`);
    console.log(`日期范围: ${range.min_date} 到 ${range.max_date}`);
    console.log(`唯一纬度数: ${range.unique_lats.toLocaleString()}`);
    console.log(`唯一经度数: ${range.unique_lons.toLocaleString()}`);
    console.log(`唯一日期数: ${range.unique_dates.toLocaleString()}`);

    // 5. 测试查询性能
    console.log('\n=== 查询性能测试 ===');

    // 测试精确经纬度查询
    console.log('测试精确经纬度查询...');
    const startTime = Date.now();
    const [exactQuery] = await connection.execute(`
      SELECT COUNT(*) as count, date, sst
      FROM noaa
      WHERE latitude = 25.5 AND longitude = -80.5
      AND date BETWEEN '2025-01-01' AND '2025-07-31'
      LIMIT 10
    `);
    const exactTime = Date.now() - startTime;
    console.log(`精确查询时间: ${exactTime}ms, 找到 ${exactQuery[0].count} 条记录`);

    // 测试日期范围查询
    console.log('测试日期范围查询...');
    const dateStartTime = Date.now();
    const [dateQuery] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM noaa
      WHERE date BETWEEN '2025-01-01' AND '2025-01-31'
      LIMIT 1000
    `);
    const dateTime = Date.now() - dateStartTime;
    console.log(`日期查询时间: ${dateTime}ms, 找到 ${dateQuery[0].count} 条记录`);

    // 6. 检查查询执行计划
    console.log('\n=== 查询执行计划分析 ===');
    const [explainPlan] = await connection.execute(`
      EXPLAIN FORMAT=JSON
      SELECT * FROM noaa
      WHERE latitude = 25.5 AND longitude = -80.5
      AND date >= '2025-01-01'
      ORDER BY date DESC
      LIMIT 100
    `);

    const explain = JSON.parse(explainPlan[0].EXPLAIN);
    console.log('执行计划:', JSON.stringify(explain.query_block, null, 2));

  } catch (error) {
    console.error('❌ 分析过程中出现错误:', error);
  } finally {
    await connection.end();
  }
}

analyzeNOAATable();