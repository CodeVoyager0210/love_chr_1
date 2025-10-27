import mysql from 'mysql2/promise';

async function checkDataFormat() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    console.log('🔍 检查实际数据格式...\n');

    // 1. 查看实际的经纬度值样本
    console.log('=== 经纬度数据样本 ===');
    const [samples] = await connection.execute(`
      SELECT DISTINCT latitude, longitude, date, sst
      FROM noaa
      ORDER BY date DESC, latitude, longitude
      LIMIT 20
    `);

    samples.forEach((row, i) => {
      console.log(`${i+1}. 纬度: ${row.latitude}, 经度: ${row.longitude}, 日期: ${row.date}, SST: ${row.sst}`);
    });

    // 2. 查看纬度分布
    console.log('\n=== 纬度分布 ===');
    const [latDist] = await connection.execute(`
      SELECT
        MIN(latitude) as min_lat,
        MAX(latitude) as max_lat,
        COUNT(DISTINCT latitude) as unique_lats,
        latitude
      FROM noaa
      GROUP BY latitude
      ORDER BY latitude
      LIMIT 10
    `);

    console.log(`纬度范围: ${latDist[0].min_lat} 到 ${latDist[latDist.length-1]?.max_lat || '未知'}`);
    console.log(`前10个纬度值:`);
    const [latValues] = await connection.execute(`
      SELECT DISTINCT latitude
      FROM noaa
      ORDER BY latitude
      LIMIT 10
    `);
    latValues.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.latitude}`);
    });

    // 3. 查看经度分布
    console.log('\n=== 经度分布 ===');
    const [lonValues] = await connection.execute(`
      SELECT DISTINCT longitude
      FROM noaa
      ORDER BY longitude
      LIMIT 10
    `);

    console.log(`前10个经度值:`);
    lonValues.forEach((row, i) => {
      console.log(`  ${i+1}. ${row.longitude}`);
    });

    // 4. 查看日期范围
    console.log('\n=== 日期范围 ===');
    const [dateRange] = await connection.execute(`
      SELECT MIN(date) as min_date, MAX(date) as max_date, COUNT(DISTINCT date) as unique_dates
      FROM noaa
    `);

    console.log(`日期范围: ${dateRange[0].min_date} 到 ${dateRange[0].max_date}`);
    console.log(`唯一日期数: ${dateRange[0].unique_dates.toLocaleString()}`);

    // 5. 测试一些实际的坐标查询
    console.log('\n=== 实际坐标查询测试 ===');
    if (samples.length > 0) {
      const testCoord = samples[0];
      console.log(`测试坐标: (${testCoord.latitude}, ${testCoord.longitude})`);

      const [testQuery] = await connection.execute(`
        SELECT date, sst
        FROM noaa
        WHERE latitude = ? AND longitude = ?
        ORDER BY date DESC
        LIMIT 5
      `, [testCoord.latitude, testCoord.longitude]);

      console.log(`找到 ${testQuery.length} 条记录:`);
      testQuery.forEach(row => {
        console.log(`  ${row.date}: SST=${row.sst}°C`);
      });
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await connection.end();
  }
}

checkDataFormat();