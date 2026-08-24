# A/B test analysis

GA4 BigQuery Export가 연결된 뒤 아래 순서로 실행한다.

1. `sql/01_build_home_layout_v1_units.sql`
2. `sql/02_metric_summary.sql`
3. `sql/03_srm_check.sql`
4. `sql/04_web_vitals_guardrail.sql`

각 SQL의 `<gcp_project>`, `<ga4_dataset>`, `YYYYMMDD`를 실제 값으로 바꾼다. 먼저 BigQuery에 `ab_lab` dataset을 생성해야 한다. 원시 `user_pseudo_id`나 이벤트 CSV는 이 저장소에 저장하지 않는다.

`01`은 최초 유효 노출을 기준으로 브라우저당 한 행을 만든다. `02`는 지표의 point estimate, `03`은 50:50 SRM gate, `04`는 최초 홈 노출의 Web Vitals p75를 계산한다. 효과의 95% 신뢰구간과 Primary 가설검정 코드는 baseline 및 최종 통계 방식 동결 후 추가한다.
