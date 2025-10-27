-- SST数据查询优化SQL示例
-- 这些查询使用了上面创建的索引，可以大幅提升查询速度

-- 1. 精确经纬度和日期范围查询（最常用）
-- 使用索引：idx_noaa_lat_lon_date
SELECT
    id,
    latitude,
    longitude,
    date,
    sst,
    anom,
    ice,
    err
FROM noaa
WHERE latitude = ?
  AND longitude = ?
  AND date BETWEEN ? AND ?
ORDER BY date DESC
LIMIT 1000;

-- 2. 区域范围查询（矩形区域）
-- 使用索引：idx_noaa_lat, idx_noaa_lon, idx_noaa_date
SELECT
    id,
    latitude,
    longitude,
    date,
    sst,
    anom,
    ice,
    err
FROM noaa
WHERE latitude BETWEEN ? AND ?
  AND longitude BETWEEN ? AND ?
  AND date BETWEEN ? AND ?
ORDER BY date DESC, latitude, longitude
LIMIT 10000;

-- 3. 附近点查询（查找最近的海洋温度数据点）
-- 使用索引：idx_noaa_lat_lon_date
SELECT
    id,
    latitude,
    longitude,
    date,
    sst,
    ABS(latitude - ?) + ABS(longitude - ?) as distance,
    DATEDIFF(?, date) as day_diff
FROM noaa
WHERE latitude BETWEEN ? AND ?
  AND longitude BETWEEN ? AND ?
  AND date BETWEEN ? AND ?
ORDER BY distance, day_diff
LIMIT 100;

-- 4. 温度范围查询
-- 使用索引：idx_noaa_sst, idx_noaa_date
SELECT
    id,
    latitude,
    longitude,
    date,
    sst
FROM noaa
WHERE sst BETWEEN ? AND ?
  AND date BETWEEN ? AND ?
ORDER BY date DESC
LIMIT 5000;

-- 5. 聚合统计查询（快速获取统计信息）
-- 使用索引：idx_noaa_date
SELECT
    MIN(sst) as min_sst,
    MAX(sst) as max_sst,
    AVG(sst) as avg_sst,
    COUNT(*) as record_count
FROM noaa
WHERE date BETWEEN ? AND ?
  AND latitude BETWEEN ? AND ?
  AND longitude BETWEEN ? AND ?;

-- 6. 分页查询优化（使用ID分页避免OFFSET）
-- 使用索引：idx_noaa_lat_lon_date
-- 第一页
SELECT * FROM noaa
WHERE latitude = ?
  AND longitude = ?
  AND date <= ?
ORDER BY date DESC
LIMIT 100;

-- 下一页（使用上一页的最后一条记录的ID）
SELECT * FROM noaa
WHERE latitude = ?
  AND longitude = ?
  AND ((date = ? AND id < ?) OR date < ?)
ORDER BY date DESC, id DESC
LIMIT 100;

-- 7. 最近数据查询（获取最新的温度数据）
-- 使用索引：idx_noaa_lat_lon_date
SELECT
    latitude,
    longitude,
    date,
    sst
FROM noaa
WHERE date = (
    SELECT MAX(date) FROM noaa
)
  AND latitude BETWEEN ? AND ?
  AND longitude BETWEEN ? AND ?
ORDER BY latitude, longitude;

-- 8. 月度平均温度查询
-- 使用索引：idx_noaa_year_month, idx_noaa_lat_lon_date
SELECT
    YEAR(date) as year,
    MONTH(date) as month,
    AVG(sst) as avg_sst,
    MIN(sst) as min_sst,
    MAX(sst) as max_sst,
    COUNT(*) as record_count
FROM noaa
WHERE latitude BETWEEN ? AND ?
  AND longitude BETWEEN ? AND ?
  AND date BETWEEN ? AND ?
GROUP BY YEAR(date), MONTH(date)
ORDER BY year, month;

-- 查询参数示例：
-- 精确查询：lat = 25.5, lon = -80.5, startDate = '2023-01-01', endDate = '2023-12-31'
-- 区域查询：minLat = 20, maxLat = 30, minLon = -90, maxLon = -70
-- 温度查询：minSst = 15.0, maxSst = 30.0
-- 分页大小：建议100-1000条记录