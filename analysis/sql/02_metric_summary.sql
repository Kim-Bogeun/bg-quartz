-- Run after 01_build_home_layout_v1_units.sql.
-- Primary, secondary, and product guardrail point estimates.
SELECT
  variant,
  COUNT(*) AS exposed_users,
  COUNTIF(clicked_within_30m) AS converted_users,
  SAFE_DIVIDE(COUNTIF(clicked_within_30m), COUNT(*)) AS home_to_article_cvr,
  COUNTIF(engaged_within_30m) AS engaged_users,
  SAFE_DIVIDE(COUNTIF(engaged_within_30m), COUNT(*)) AS exposed_to_engaged_rate,
  SAFE_DIVIDE(
    COUNTIF(clicked_within_30m AND engaged_within_30m),
    COUNTIF(clicked_within_30m)
  ) AS click_to_engaged_rate,
  SAFE_DIVIDE(COUNTIF(had_home_client_error), COUNT(*)) AS home_client_error_rate,
  AVG(click_events_within_30m) AS clicks_per_exposed_user,
  COUNTIF(crossover_detected) AS crossover_users
FROM `<gcp_project>.ab_lab.home_layout_v1_units`
GROUP BY variant
ORDER BY variant;
