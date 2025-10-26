🚀 项目启动指南

  1. 启动前端开发服务器

  # 在项目根目录执行
  npm run dev
  # 或
  pnpm dev
  前端将在 http://localhost:5173 运行

  2. 启动后端API服务器 (选择一个版本)

  选择A: 基础优化版本 (推荐)

  # 在项目根目录执行
  node server.mjs
  或者
  npm run server 
  这两个命令是完全相同的，因为 package.json 中的 "server" 脚本就是 node server.mjs。
  选择B: 超高性能版本 (需要先创建索引)

  # 步骤1: 创建网格化索引 (可选，但强烈推荐)
  node create-spatial-index.mjs

  # 步骤2: 启动超优化服务器
  node server-ultra-optimized.mjs

  3. 启动顺序建议

  1. 先启动后端服务器:
  node server.mjs
  1. 确保看到 Server running on http://localhost:3000
  2. 再启动前端开发服务器:
  npm run dev
  2. 确保看到前端页面在 http://localhost:5173

  4. 访问应用

  - 海面温度查询页面: http://localhost:5173/sst-query
  - API健康检查: http://localhost:3000/api/health

  5. 测试数据

  推荐测试参数：
  - 纬度: -78.373
  - 经度: 165.876
  - 日期: 2025-02-15

  6. 故障排除

  如果遇到问题：

  1. 端口冲突:
  # 检查端口占用
  netstat -an | findstr :3000
  netstat -an | findstr :5173
  2. 数据库连接问题:
    - 确保MySQL服务正在运行
    - 检查密码是否正确 (3322929160@huhu)
  3. API无响应:
    - 检查后端控制台日志
    - 确认数据库连接

  7. 性能监控

  启动后可以访问：
  - http://localhost:3000/api/health - 检查系统状态
  - http://localhost:5173/sst-query - 进行海面温度查询

  📁 重要文件说明

  - server.mjs - 基础优化服务器 (立即可用)
  - server-ultra-optimized.mjs - 超高性能服务器 (需要索引)
  - create-spatial-index.mjs - 网格化索引创建脚本
  - test-complete-system.mjs - 完整系统测试脚本