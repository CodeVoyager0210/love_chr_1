-- OISST数据库索引优化脚本
-- 针对noaa表的1.45亿条数据进行优化

-- 设置索引缓冲区大小以提高索引创建速度
SET GLOBAL innodb_buffer_pool_size = 2147483648; -- 2GB

-- 1. 删除可能存在的旧索引（避免重复）
-- 使用IGNORE错误避免IF EXISTS语法问题
DROP INDEX idx_noaa_lat_lon_date ON noaa;
DROP INDEX idx_noaa_date ON noaa;
DROP INDEX idx_noaa_lat ON noaa;
DROP INDEX idx_noaa_lon ON noaa;
DROP INDEX idx_noaa_sst ON noaa;
DROP INDEX idx_noaa_year_month ON noaa;

-- 2. 创建复合索引 - 最关键的索引
-- 用于根据经纬度和日期的查询
ALTER TABLE noaa
ADD INDEX idx_noaa_lat_lon_date (latitude, longitude, date) COMMENT '经纬度和日期复合索引';

-- 3. 创建日期索引 - 用于日期范围查询
ALTER TABLE noaa
ADD INDEX idx_noaa_date (date) COMMENT '日期单列索引';

-- 4. 创建经度纬度单列索引 - 用于单独的坐标查询
ALTER TABLE noaa
ADD INDEX idx_noaa_lat (latitude) COMMENT '纬度索引';
ALTER TABLE noaa
ADD INDEX idx_noaa_lon (longitude) COMMENT '经度索引';

-- 5. 创建SST温度索引 - 用于温度范围查询
ALTER TABLE noaa
ADD INDEX idx_noaa_sst (sst) COMMENT '海表温度索引';

-- 6. 创建年月索引 - 用于快速按年月分组
ALTER TABLE noaa
ADD INDEX idx_noaa_year_month (YEAR(date), MONTH(date)) COMMENT '年月复合索引';

-- 7. 创建空间索引（如果使用MySQL 8.0+且支持空间数据类型）
-- 注意：需要将经纬度转换为POINT类型
-- ALTER TABLE noaa ADD COLUMN coordinates POINT;
-- UPDATE noaa SET coordinates = ST_GeomFromText(CONCAT('POINT(', longitude, ' ', latitude, ')'));
-- ALTER TABLE noaa ADD SPATIAL INDEX idx_noaa_coordinates (coordinates);

-- 8. 分析表以更新索引统计信息
ANALYZE TABLE noaa;

-- 9. 检查索引创建情况
SELECT
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX,
    INDEX_TYPE,
    COMMENT
FROM
    information_schema.STATISTICS
WHERE
    TABLE_SCHEMA = 'oisst'
    AND TABLE_NAME = 'noaa'
ORDER BY
    INDEX_NAME, SEQ_IN_INDEX;

-- 10. 显示表状态
SHOW TABLE STATUS LIKE 'noaa';

-- 查询优化说明：
-- 1. 对于精确经纬度查询：使用 idx_noaa_lat_lon_date 索引
-- 2. 对于日期范围查询：使用 idx_noaa_date 索引
-- 3. 对于温度范围查询：使用 idx_noaa_sst 索引
-- 4. 对于区域查询（矩形范围）：使用 (latitude, longitude) 复合索引