-- Replace <gcp_project> and <ga4_dataset> before running.
-- One row per GA4 pseudonymous browser, assigned by its first valid exposure.
DECLARE start_suffix STRING DEFAULT 'YYYYMMDD';
DECLARE end_suffix STRING DEFAULT 'YYYYMMDD';
DECLARE attribution_window_micros INT64 DEFAULT 30 * 60 * 1000000;

CREATE OR REPLACE TABLE `<gcp_project>.ab_lab.home_layout_v1_units` AS
WITH experiment_events AS (
  SELECT
    event_timestamp,
    user_pseudo_id,
    event_name,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'experiment_id')
      AS experiment_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'variant') AS variant,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'exposure_id')
      AS exposure_id,
    (SELECT value.string_value FROM UNNEST(event_params) WHERE key = 'article_path')
      AS article_path
  FROM `<gcp_project>.<ga4_dataset>.events_*`
  WHERE
    _TABLE_SUFFIX BETWEEN start_suffix AND end_suffix
    AND event_name IN (
      'experiment_exposure',
      'home_article_click',
      'article_engaged_from_home',
      'home_client_error'
    )
),
valid_events AS (
  SELECT *
  FROM experiment_events
  WHERE experiment_id = 'home_layout_v1' AND user_pseudo_id IS NOT NULL
),
ranked_exposures AS (
  SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY user_pseudo_id ORDER BY event_timestamp, exposure_id) AS rn
  FROM valid_events
  WHERE event_name = 'experiment_exposure' AND variant IN ('A', 'B') AND exposure_id IS NOT NULL
),
first_exposures AS (
  SELECT
    user_pseudo_id,
    variant,
    exposure_id AS first_exposure_id,
    event_timestamp AS first_exposure_at
  FROM ranked_exposures
  WHERE rn = 1
),
crossover AS (
  SELECT user_pseudo_id, COUNT(DISTINCT variant) > 1 AS crossover_detected
  FROM valid_events
  WHERE event_name = 'experiment_exposure' AND variant IN ('A', 'B')
  GROUP BY user_pseudo_id
),
attributed_behavior AS (
  SELECT
    f.user_pseudo_id,
    f.variant,
    f.first_exposure_id,
    f.first_exposure_at,
    COUNTIF(e.event_name = 'home_article_click') AS click_events_within_30m,
    COUNTIF(e.event_name = 'article_engaged_from_home') AS engaged_events_within_30m,
    COUNTIF(e.event_name = 'home_client_error') AS home_error_events_within_30m,
    ARRAY_AGG(
      IF(e.event_name = 'home_article_click', e.article_path, NULL)
      IGNORE NULLS ORDER BY e.event_timestamp LIMIT 1
    )[SAFE_OFFSET(0)] AS first_article_path
  FROM first_exposures AS f
  LEFT JOIN valid_events AS e
    ON e.user_pseudo_id = f.user_pseudo_id
    AND e.variant = f.variant
    AND e.event_timestamp BETWEEN f.first_exposure_at
      AND f.first_exposure_at + attribution_window_micros
  GROUP BY f.user_pseudo_id, f.variant, f.first_exposure_id, f.first_exposure_at
)
SELECT
  b.*,
  b.click_events_within_30m > 0 AS clicked_within_30m,
  b.engaged_events_within_30m > 0 AS engaged_within_30m,
  b.home_error_events_within_30m > 0 AS had_home_client_error,
  COALESCE(c.crossover_detected, FALSE) AS crossover_detected
FROM attributed_behavior AS b
LEFT JOIN crossover AS c USING (user_pseudo_id);
