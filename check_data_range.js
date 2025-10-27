// 检查数据范围

import mysql from 'mysql2/promise';

async function checkDataRange() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    console.log('🗺️ 检查数据范围...');

    // 检查经纬度范围
    const [ranges] = await connection.execute(`
      SELECT
        MIN(latitude) as min_lat,
        MAX(latitude) as max_lat,
        MIN(longitude) as min_lon,
        MAX(longitude) as max_lon,
        MIN(date) as min_date,
        MAX(date) as max_date
      FROM noaa
      LIMIT 1
    `);

    console.log('\n📊 数据范围:');
    console.log(`  纬度: ${ranges[0].min_lat} 到 ${ranges[0].max_lat}`);
    console.log(`  经度: ${ranges[0].min_lon} 到 ${ranges[0].max_lon}`);
    console.log(`  日期: ${ranges[0].min_date} 到 ${ranges[0].max_date}`);

    // 获取一些实际数据点
    console.log('\n📍 随机数据点:');
    const [samples] = await connection.execute(`
      SELECT latitude, longitude, date, sst
      FROM noaa
      WHERE sst IS NOT NULL
      ORDER BY RAND()
      LIMIT 5
    `);

    samples.forEach(row => {
      console.log(`  坐标(${row.latitude}, ${row.longitude}), ${row.date}, SST=${row.sst}°C`);
    });

    // 检查特定海洋区域的数据
    console.log('\n🌊 检查主要海洋区域:');
    const regions = [
      { name: '大西洋', lat_min: 20, lat_max: 40, lon_min: -80, lon_max: -60 },
      { name: '太平洋', lat_min: 20, lat_max: 40, lon_min: 120, lon_max: 150 },
      { name: '印度洋', lat_min: -20, lat_max: 0, lon_min: 40, lon_max: 80 }
    ];

    for (const region of regions) {
      const [count] = await connection.execute(
        'SELECT COUNT(*) as total FROM noaa WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?',
        [region.lat_min, region.lat_max, region.lon_min, region.lon_max]
      );
      console.log(`  ${region.name}: ${count[0].total.toLocaleString()} 条记录`);
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
  }
}

checkDataRange();