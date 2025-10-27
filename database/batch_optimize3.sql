-- 批次3：辅助索引（可选）
-- 预计时间：30-60分钟
-- 在批次2完成后运行

-- 经度纬度单列索引 - 用于单独的坐标查询
ALTER TABLE noaa
ADD INDEX idx_noaa_lat (latitude)
COMMENT '纬度索引 - 批次3';

ALTER TABLE noaa
ADD INDEX idx_noaa_lon (longitude)
COMMENT '经度索引 - 批次3';

-- 最终分析表
ANALYZE TABLE noaa;

-- 显示所有索引
SELECT
    TABLE_NAME,
    INDEX_NAME,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) as columns,
    INDEX_TYPE
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'oisst' AND TABLE_NAME = 'noaa'
GROUP BY INDEX_NAME
ORDER BY INDEX_NAME;