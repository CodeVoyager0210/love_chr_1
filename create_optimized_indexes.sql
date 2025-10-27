-- NOAA表精确查询索引优化方案
-- 专门针对exact查询类型优化

-- 1. 检查并删除重复的日期索引（如果存在）
-- DROP INDEX idx_date_optimized ON noaa;

-- 2. 为精确查询创建最优索引
-- 索引顺序：(latitude, longitude, date DESC)
-- 这样可以完美支持：WHERE latitude = ? AND longitude = ? AND date >= ? ORDER BY date DESC
CREATE INDEX idx_exact_query_lat_lon_date ON noaa (latitude, longitude, date DESC);

-- 3. 查看索引创建结果
SHOW INDEX FROM noaa;

-- 4. 测试精确查询的执行计划
EXPLAIN FORMAT=JSON
SELECT * FROM noaa
WHERE latitude = 89.875 AND longitude = 359.875
AND date >= '2025-01-01'
ORDER BY date DESC
LIMIT 100;

-- 5. 测试精确查询性能
SELECT SQL_NO_CACHE COUNT(*) as count
FROM noaa
WHERE latitude = 89.875 AND longitude = 359.875
AND date BETWEEN '2025-01-01' AND '2025-07-31';