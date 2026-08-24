-- SRM data-quality gate for a planned 50:50 allocation.
-- For 1 degree of freedom, p = erfc(sqrt(chi_square / 2)).
-- Abramowitz-Stegun 7.1.26 approximation; maximum absolute error is about 1.5e-7.
CREATE TEMP FUNCTION chi_square_df1_p_value(x FLOAT64)
RETURNS FLOAT64
LANGUAGE js AS r'''
  if (x === null || x < 0) return null;
  const z = Math.sqrt(x / 2);
  const t = 1 / (1 + 0.3275911 * z);
  const erf = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t
    - 0.284496736) * t + 0.254829592) * t) * Math.exp(-z * z);
  return 1 - erf;
''';

WITH counts AS (
  SELECT
    COUNTIF(variant = 'A') AS observed_a,
    COUNTIF(variant = 'B') AS observed_b
  FROM `<gcp_project>.ab_lab.home_layout_v1_units`
),
test AS (
  SELECT
    *,
    SAFE_DIVIDE(observed_a + observed_b, 2) AS expected_each,
    SAFE_DIVIDE(
      POW(observed_a - (observed_a + observed_b) / 2, 2)
        + POW(observed_b - (observed_a + observed_b) / 2, 2),
      (observed_a + observed_b) / 2
    ) AS chi_square
  FROM counts
)
SELECT
  *,
  chi_square_df1_p_value(chi_square) AS srm_p_value,
  chi_square_df1_p_value(chi_square) < 0.01 AS stop_and_investigate
FROM test;
