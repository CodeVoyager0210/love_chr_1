// 数据库索引优化执行脚本
// 运行此脚本来应用索引优化

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runOptimization() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst',
    multipleStatements: true
  });

  try {
    console.log('🚀 开始数据库索引优化...\n');

    // 读取并执行索引优化SQL
    const sqlPath = path.join(__dirname, 'optimize_oisst_indexes.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');

    console.log('📝 执行索引创建脚本...');
    const startTime = Date.now();

    // 分割SQL语句并逐个执行
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        try {
          console.log(`\n[${i + 1}/${statements.length}] 执行: ${stmt.substring(0, 50)}...`);
          await connection.execute(stmt);
        } catch (error) {
          // 忽略某些预期的错误
          if (error.code === 'ER_DUP_KEYNAME' ||
              error.code === 'ER_CANT_DROP_FIELD_OR_KEY' ||
              error.message.includes('Duplicate key name')) {
            console.log('  ⚠️  索引已存在，跳过');
          } else {
            throw error;
          }
        }
      }
    }

    const endTime = Date.now();
    console.log(`\n✅ 索引优化完成！耗时: ${(endTime - startTime) / 1000}秒\n`);

    // 验证索引
    console.log('🔍 验证创建的索引...');
    const [indexes] = await connection.execute(`
      SELECT
        TABLE_NAME,
        INDEX_NAME,
        GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns,
        INDEX_TYPE,
        COMMENT
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = 'oisst' AND TABLE_NAME = 'noaa'
      GROUP BY INDEX_NAME
      ORDER BY INDEX_NAME
    `);

    console.log('\n📊 已创建的索引:');
    indexes.forEach(idx => {
      console.log(`  - ${idx.INDEX_NAME} (${idx.columns}) - ${idx.INDEX_TYPE}`);
    });

    // 显示表状态
    const [tableStatus] = await connection.execute('SHOW TABLE STATUS LIKE "noaa"');
    console.log('\n📈 noaa表状态:');
    console.log(`  - 行数: ${tableStatus[0].Rows.toLocaleString()}`);
    console.log(`  - 数据大小: ${(tableStatus[0].Data_length / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`  - 索引大小: ${(tableStatus[0].Index_length / 1024 / 1024 / 1024).toFixed(2)} GB`);

    // 测试查询性能
    console.log('\n⚡ 测试查询性能...');
    const testQueries = [
      {
        name: '精确经纬度查询',
        sql: 'SELECT COUNT(*) as count FROM noaa WHERE latitude = 25.5 AND longitude = -80.5 AND date BETWEEN "2023-01-01" AND "2023-12-31"',
        params: []
      },
      {
        name: '区域范围查询',
        sql: 'SELECT COUNT(*) as count FROM noaa WHERE latitude BETWEEN 20 AND 30 AND longitude BETWEEN -90 AND -70 LIMIT 100000',
        params: []
      },
      {
        name: '日期范围查询',
        sql: 'SELECT COUNT(*) as count FROM noaa WHERE date BETWEEN "2023-01-01" AND "2023-12-31"',
        params: []
      }
    ];

    for (const query of testQueries) {
      console.log(`\n  📌 ${query.name}:`);
      const start = Date.now();
      const [result] = await connection.execute(query.sql, query.params);
      const time = Date.now() - start;
      console.log(`    结果: ${result[0].count} 条记录`);
      console.log(`    耗时: ${time}ms`);
    }

    console.log('\n✨ 优化完成！现在查询性能应该大幅提升！');
    console.log('\n📝 使用说明:');
    console.log('1. 重启服务器: npm run dev');
    console.log('2. 测试API: GET /api/sst-data?lat=25.5&lon=-80.5&startDate=2023-01-01&endDate=2023-12-31');
    console.log('3. 查询参数:');
    console.log('   - queryType=exact: 精确经纬度查询');
    console.log('   - queryType=range: 区域范围查询');
    console.log('   - queryType=nearby: 附近点查询');
    console.log('   - 限制查询范围避免超时');

  } catch (error) {
    console.error('❌ 优化失败:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// 运行优化
runOptimization();