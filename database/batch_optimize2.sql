-- 批次2：日期和温度索引
-- 预计时间：1-2小时
-- 在批次1完成后运行

-- 日期索引 - 用于日期范围查询
ALTER TABLE noaa
ADD INDEX idx_noaa_date (date)
COMMENT '日期索引 - 批次2';

-- 温度索引 - 用于温度范围查询
ALTER TABLE noaa
ADD INDEX idx_noaa_sst (sst)
COMMENT '海表温度索引 - 批次2';

-- 年月索引 - 用于快速按年月分组
ALTER TABLE noaa
ADD INDEX idx_noaa_year_month (YEAR(date), MONTH(date))
COMMENT '年月复合索引 - 批次2';

-- 分析表以更新索引统计信息
ANALYZE TABLE noaa;

-- 显示表状态
SHOW TABLE STATUS LIKE 'noaa';