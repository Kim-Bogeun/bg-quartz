-- Replace dataset/date placeholders. Uses the last report for each metric and exposure.
DECLARE start_suffix STRING DEFAULT 'YYYYMMDD';
DECLARE end_suffix STRING DEFAULT 'YYYYMMDD';

WITH reports AS (
  SELECT
    event_timestamp,
    user_pseudo_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'variant') AS variant,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'exposure_id')
      AS exposure_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'metric_name')
      AS metric_name,
    COALESCE(
      (SELECT value.double_value FROM UNNEST(event_params) WHERE key = 'metric_value'),
      CAST((SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'metric_value') AS FLOAT64),
      CAST((SELECT value.float_value FROM UNNEST(event_params) WHERE key = 'metric_value') AS FLOAT64)
    ) AS metric_value
  FROM `<gcp_project>.<ga4_dataset>.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN start_suffix AND end_suffix
    AND event_name = 'home_web_vital'
    AND (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experiment_id')
      = 'home_layout_v1'
),
last_report AS (
  SELECT * EXCEPT(event_timestamp)
  FROM reports
  WHERE exposure_id IS NOT NULL AND metric_name IN ('LCP', 'INP', 'CLS')
  QUALIFY ROW_NUMBER() OVER (
    PARTITION BY exposure_id, metric_name ORDER BY event_timestamp DESC
  ) = 1
),
first_exposure_reports AS (
  SELECT r.*
  FROM last_report AS r
  JOIN `<gcp_project>.ab_lab.home_layout_v1_units` AS u
    ON r.user_pseudo_id = u.user_pseudo_id
    AND r.exposure_id = u.first_exposure_id
    AND r.variant = u.variant
)
SELECT
  variant,
  metric_name,
  COUNT(*) AS measured_exposures,
  APPROX_QUANTILES(metric_value, 100)[OFFSET(50)] AS p50,
  APPROX_QUANTILES(metric_value, 100)[OFFSET(75)] AS p75,
  APPROX_QUANTILES(metric_value, 100)[OFFSET(95)] AS p95
FROM first_exposure_reports
GROUP BY variant, metric_name
ORDER BY metric_name, variant;
