# OISST数据库索引优化指南

## 问题说明

OISST数据库的`noaa`表包含约1.45亿条海洋表面温度记录，导致查询超时问题。本优化方案通过添加适当的数据库索引和优化查询逻辑来解决此问题。

## 优化方案

### 1. 数据库索引

创建以下索引来加速查询：

- `idx_noaa_lat_lon_date`: 经纬度和日期复合索引（最重要）
- `idx_noaa_date`: 日期单列索引
- `idx_noaa_lat`: 纬度索引
- `idx_noaa_lon`: 经度索引
- `idx_noaa_sst`: 海表温度索引
- `idx_noaa_year_month`: 年月复合索引

### 2. API优化

新增两个优化的API端点：

- `GET /api/sst-data`: 查询SST数据
- `GET /api/sst-stats`: 获取统计数据

## 实施步骤

### 第一步：应用数据库索引

```bash
# 进入database目录
cd database

# 运行索引优化脚本
node run_optimization.js
```

或手动执行SQL：

```bash
# 在MySQL中执行
mysql -u root -p oisst < optimize_oisst_indexes.sql
```

### 第二步：重启服务器

```bash
# 在项目根目录
npm run dev
```

### 第三步：测试API

测试精确经纬度查询：

```bash
curl "http://localhost:3000/api/sst-data?queryType=exact&lat=25.5&lon=-80.5&startDate=2023-01-01&endDate=2023-12-31&limit=100"
```

测试区域范围查询：

```bash
curl "http://localhost:3000/api/sst-data?queryType=range&lat_min=20&lat_max=30&lon_min=-90&lon_max=-70&startDate=2023-01-01&endDate=2023-12-31&limit=500"
```

测试统计数据：

```bash
curl "http://localhost:3000/api/sst-stats?lat_min=20&lat_max=30&lon_min=-90&lon_max=-70&startDate=2023-01-01&endDate=2023-12-31&groupBy=month"
```

## API参数说明

### /api/sst-data 参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| queryType | string | 查询类型: exact/range/nearby | exact |
| lat | float | 纬度（精确查询） | 25.5 |
| lon | float | 经度（精确查询） | -80.5 |
| lat_min/lat_max | float | 纬度范围（区域查询） | 20,30 |
| lon_min/lon_max | float | 经度范围（区域查询） | -90,-70 |
| startDate | string | 开始日期 | 2023-01-01 |
| endDate | string | 结束日期 | 2023-12-31 |
| sst_min/sst_max | float | 温度范围 | 15,30 |
| limit | integer | 返回条数（最大1000） | 500 |
| offset | integer | 偏移量（传统分页） | 0 |
| lastId | integer | 上一页最后ID（高效分页） | 12345 |

### 响应格式

```json
{
  "data": [
    {
      "id": 12345,
      "latitude": 25.5,
      "longitude": -80.5,
      "date": "2023-06-15",
      "sst": 28.5,
      "anom": 0.8,
      "ice": 0,
      "err": 0.2
    }
  ],
  "queryTime": "45ms",
  "count": 100,
  "total": 365,
  "hasMore": true,
  "nextId": 12245,
  "queryType": "exact",
  "message": null,
  "isNearbyData": false
}
```

## 性能优化建议

1. **限制查询范围**：始终使用日期范围限制查询
2. **使用复合索引**：优先使用经纬度和日期的组合查询
3. **分页查询**：使用`lastId`进行高效分页，避免使用`OFFSET`
4. **缓存结果**：对频繁查询的数据实现缓存机制
5. **监控查询时间**：查询超过3秒会返回警告信息

## 故障排除

### 查询超时

如果遇到查询超时：

1. 检查索引是否正确创建
2. 缩小查询范围（减少日期范围）
3. 使用区域查询代替精确查询
4. 添加温度限制条件

### 索引创建失败

如果索引创建失败：

1. 检查磁盘空间（需要约10-20GB空间）
2. 增加MySQL缓冲池大小
3. 分批创建索引，先创建最重要的索引

### 内存不足

如果服务器内存不足：

1. 调整MySQL配置：
   ```sql
   SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB
   ```
2. 减少并发连接数
3. 优化查询，减少返回数据量

## 维护建议

1. **定期分析表**：更新索引统计信息
   ```sql
   ANALYZE TABLE noaa;
   ```

2. **监控查询性能**：定期检查慢查询日志

3. **优化索引**：根据查询模式调整索引策略

4. **数据归档**：考虑将历史数据归档到单独的表