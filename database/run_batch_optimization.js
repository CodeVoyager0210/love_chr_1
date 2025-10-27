// 批次数据库索引优化脚本
// 分3个批次逐步创建索引，减少对系统的影响

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 批次配置
const batches = [
  {
    name: '批次1：核心索引',
    file: 'batch_optimize.sql',
    description: '创建最关键的经纬度+日期复合索引（2-5小时）',
    critical: true
  },
  {
    name: '批次2：日期温度索引',
    file: 'batch_optimize2.sql',
    description: '创建日期和温度相关索引（1-2小时）',
    critical: false
  },
  {
    name: '批次3：辅助索引',
    file: 'batch_optimize3.sql',
    description: '创建单列经纬度索引（30-60分钟）',
    critical: false
  }
];

async function runBatch(batchNum) {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    const batch = batches[batchNum - 1];
    console.log(`\n🚀 执行${batch.name}`);
    console.log(`📝 ${batch.description}`);
    console.log('=' .repeat(60));

    // 读取SQL文件
    const sqlPath = path.join(__dirname, batch.file);
    const sql = await fs.readFile(sqlPath, 'utf8');

    // 分割SQL语句
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    // 执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (stmt) {
        console.log(`\n[${i + 1}/${statements.length}] 执行: ${stmt.substring(0, 50)}...`);

        const startTime = Date.now();
        try {
          const [result] = await connection.execute(stmt);
          const elapsed = (Date.now() - startTime) / 1000;

          if (result.affectedRows !== undefined) {
            console.log(`  ✅ 完成 - 耗时: ${elapsed}秒`);
          } else if (result.length > 0) {
            console.log(`  ✅ 查询返回 ${result.length} 行 - 耗时: ${elapsed}秒`);
            if (i === statements.length - 2) { // 显示索引信息
              result.forEach(row => {
                console.log(`     索引: ${row.Key_name || row.INDEX_NAME} - ${row.Column_name || row.columns}`);
              });
            }
          }
        } catch (error) {
          // 如果是索引已存在错误，跳过
          if (error.code === 'ER_DUP_KEYNAME' ||
              error.message.includes('Duplicate key name') ||
              error.message.includes('already exists')) {
            console.log(`  ⚠️  索引已存在，跳过`);
          } else {
            throw error;
          }
        }
      }
    }

    // 验证当前索引状态
    console.log('\n📊 当前索引状态:');
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = 'oisst' AND TABLE_NAME = 'noaa'
      GROUP BY INDEX_NAME
      ORDER BY INDEX_NAME
    `);

    indexes.forEach(idx => {
      const status = idx.INDEX_NAME.includes('idx_noaa') ? '🆕' : '📁';
      console.log(`  ${status} ${idx.INDEX_NAME} (${idx.columns})`);
    });

    // 显示表状态
    const [tableStatus] = await connection.execute('SHOW TABLE STATUS LIKE "noaa"');
    console.log('\n📈 noaa表状态:');
    console.log(`  - 行数: ${tableStatus[0].Rows.toLocaleString()}`);
    console.log(`  - 数据大小: ${(tableStatus[0].Data_length / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`  - 索引大小: ${(tableStatus[0].Index_length / 1024 / 1024 / 1024).toFixed(2)} GB`);

    console.log(`\n✅ ${batch.name}完成！`);

    // 测试查询性能
    if (batchNum === 1) {
      console.log('\n⚡ 测试核心查询性能...');
      const testQueries = [
        {
          name: '精确经纬度查询',
          sql: 'SELECT COUNT(*) as count FROM noaa WHERE latitude = 25.5 AND longitude = -80.5 AND date BETWEEN "2023-01-01" AND "2023-12-31"'
        },
        {
          name: '日期范围查询',
          sql: 'SELECT COUNT(*) as count FROM noaa WHERE date BETWEEN "2023-01-01" AND "2023-12-31" LIMIT 100000'
        }
      ];

      for (const query of testQueries) {
        console.log(`\n  📌 ${query.name}:`);
        const start = Date.now();
        const [result] = await connection.execute(query.sql);
        const time = Date.now() - start;
        console.log(`    结果: ${result[0].count} 条记录`);
        console.log(`    耗时: ${time}ms`);
        if (time < 100) {
          console.log(`    🎉 性能优秀！`);
        }
      }
    }

    return true;

  } catch (error) {
    console.error('❌ 批次执行失败:', error);
    return false;
  } finally {
    await connection.end();
  }
}

async function showMenu() {
  console.log('\n🗂️  OISST数据库批次优化工具');
  console.log('=' .repeat(60));

  batches.forEach((batch, i) => {
    const status = batch.critical ? '🔴 必需' : '🟡 推荐';
    console.log(`\n${i + 1}. ${batch.name} ${status}`);
    console.log(`   ${batch.description}`);
  });

  console.log('\n0. 查看当前索引状态');
  console.log('Q. 退出');
  console.log('\n注意：');
  console.log('- 批次1必须先执行，解决90%的性能问题');
  console.log('- 每个批次完成后可以暂停，稍后继续');
  console.log('- 建议在低负载时执行');
}

async function showCurrentStatus() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '3322929160@huhu',
    database: 'oisst'
  });

  try {
    const [indexes] = await connection.execute(`
      SELECT INDEX_NAME, GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = 'oisst' AND TABLE_NAME = 'noaa'
      GROUP BY INDEX_NAME
      ORDER BY INDEX_NAME
    `);

    console.log('\n📊 当前索引状态:');
    if (indexes.length === 0) {
      console.log('  ❌ 没有找到索引');
    } else {
      indexes.forEach(idx => {
        const isOptimized = idx.INDEX_NAME.includes('idx_noaa');
        const status = isOptimized ? '✅' : '📁';
        console.log(`  ${status} ${idx.INDEX_NAME} (${idx.columns})`);
      });
    }

    const [tableStatus] = await connection.execute('SHOW TABLE STATUS LIKE "noaa"');
    console.log('\n📈 表状态:');
    console.log(`  - 行数: ${tableStatus[0].Rows.toLocaleString()}`);
    console.log(`  - 数据大小: ${(tableStatus[0].Data_length / 1024 / 1024 / 1024).toFixed(2)} GB`);
    console.log(`  - 索引大小: ${(tableStatus[0].Index_length / 1024 / 1024 / 1024).toFixed(2)} GB`);

  } catch (error) {
    console.error('❌ 获取状态失败:', error.message);
  } finally {
    await connection.end();
  }
}

// 主程序
async function main() {
  const args = process.argv.slice(2);

  // 如果提供了批次号，直接执行
  if (args[0] && ['1', '2', '3'].includes(args[0])) {
    console.log(`🚀 直接执行批次${args[0]}`);
    const success = await runBatch(parseInt(args[0]));
    if (success) {
      console.log('\n✨ 批次完成！可以继续执行下一个批次或稍后继续。');
    }
    return;
  }

  // 否则显示菜单
  await showMenu();

  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async (key) => {
    if (key === 'q' || key === 'Q') {
      console.log('\n👋 退出');
      process.exit(0);
    } else if (key === '0') {
      await showCurrentStatus();
      console.log('\n按任意键继续...');
    } else if (['1', '2', '3'].includes(key)) {
      const batchNum = parseInt(key);

      if (batchNum === 1 || key === 'y' || key === 'Y') {
        console.log(`\n⏳ 开始执行批次${batchNum}...`);
        const success = await runBatch(batchNum);

        if (success) {
          if (batchNum < 3) {
            console.log(`\n💡 提示：批次${batchNum}完成！`);
            console.log(`   - 现在可以测试API性能`);
            console.log(`   - 稍后可以运行 'node run_batch_optimization.js ${batchNum + 1}' 执行下一个批次`);
          } else {
            console.log('\n🎉 所有批次完成！索引优化全部完成！');
          }
        }
      }
    }

    // 重新显示菜单
    if (key !== '\u0003') { // Ctrl+C
      console.log('\n');
      await showMenu();
    }
  });
}

// 运行主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}