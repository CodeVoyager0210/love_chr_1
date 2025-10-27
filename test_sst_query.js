// 测试SST查询脚本 - 简化版本

import mysql from 'mysql2/promise';

async function testQuery() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    console.log('🔍 测试1: 基本查询');
    const [test1] = await connection.execute(
      'SELECT COUNT(*) as total FROM noaa LIMIT 1'
    );
    console.log('  总记录数:', test1[0].total);

    console.log('\n🔍 测试2: 精确坐标查询');
    const [test2] = await connection.execute(
      'SELECT * FROM noaa WHERE latitude = ? AND longitude = ? LIMIT 5',
      [25.5, -80.5]
    );
    console.log('  找到记录:', test2.length);

    console.log('\n🔍 测试3: 带日期的查询');
    const [test3] = await connection.execute(
      'SELECT id, latitude, longitude, date, sst FROM noaa WHERE latitude = ? AND longitude = ? AND date BETWEEN ? AND ? LIMIT 5',
      [25.5, -80.5, '2023-01-01', '2023-12-31']
    );
    console.log('  找到记录:', test3.length);
    test3.forEach(row => {
      console.log(`    ${row.date}: SST=${row.sst}°C`);
    });

    console.log('\n🔍 测试4: 区域查询');
    const [test4] = await connection.execute(
      'SELECT COUNT(*) as total FROM noaa WHERE latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?',
      [20, 30, -90, -70]
    );
    console.log('  区域内记录数:', test4[0].total);

    console.log('\n✅ 所有测试完成');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('错误代码:', error.code);
  } finally {
    await connection.end();
  }
}

testQuery();