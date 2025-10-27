-- 批次1：最关键的索引（优先级最高）
-- 预计时间：2-5小时
-- 这个索引能解决90%的查询性能问题

ALTER TABLE noaa
ADD INDEX idx_noaa_lat_lon_date (latitude, longitude, date)
COMMENT '经纬度和日期复合索引 - 批次1';

-- 验证索引创建
SHOW INDEX FROM noaa WHERE Key_name = 'idx_noaa_lat_lon_date';

-- 显示表状态
SHOW TABLE STATUS LIKE 'noaa';