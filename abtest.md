# 블로그 A/B 테스트 실험 명세 및 결과 기록

- 문서 상태: GA4→BigQuery Daily Export 연결 완료 — 첫 적재 및 A/A 검증 전
- 최초 작성: 2026-08-24
- 최종 수정: 2026-08-24
- 현재 실험: `home_layout_v1`

이 문서는 블로그 A/B 테스트의 사전 명세, 변경 이력, 최종 결과와 의사결정을 기록하는 기준 문서다. 방문자 단위 원자료는 이 문서나 Git 저장소에 넣지 않는다. 원자료는 GA4에서 수집하고 BigQuery에 보관하며, 재현 가능한 집계 SQL만 저장소에서 버전 관리한다.

## 1. 실험 운영 원칙

1. 실험 시작 전에 가설, 지표, 표본 수, 종료 조건을 확정한다.
2. A와 B는 같은 기간에 무작위로 노출한다. 기간을 나눠 A 다음 B를 보여주지 않는다.
3. IP 주소를 수집하거나 배정에 사용하지 않는다.
4. 최초 배정 결과를 실험용 first-party cookie에 저장해 같은 브라우저에는 같은 변형을 보여준다.
5. 실험 중 명세를 바꿔야 하면 기존 내용을 덮어쓰지 않고 변경 이력에 이유와 영향을 남긴다.
6. 유의확률만 보고 실험을 조기 종료하지 않는다.
7. 최종 보고에는 효과 크기, 95% 신뢰구간, 데이터 품질 문제와 한계를 함께 기록한다.

## 2. 실험 레지스트리

| 실험 ID          | 질문                                      | 상태           | 시작일 | 종료일 | 결정 |
| ---------------- | ----------------------------------------- | -------------- | ------ | ------ | ---- |
| `home_layout_v1` | 홈 디자인이 글 클릭 확률에 영향을 주는가? | 로컬 구현 완료 | TBD    | TBD    | TBD  |

상태는 `설계 중 → A/A 검증 → 실행 중 → 분석 중 → 종료` 순서로 관리한다.

---

## 3. 실험: `home_layout_v1`

### 3.1 의사결정 질문

새 홈페이지 디자인을 기본 디자인으로 배포할 것인가?

### 3.2 가설

- 귀무가설: A와 B의 홈→글 전환율은 같다.
- 대립가설: A와 B의 홈→글 전환율은 다르다.
- 기대 방향: B의 전환율이 A보다 높을 것으로 예상하지만, 1차 검정은 양측 검정으로 한다.

### 3.3 대상과 실험 단위

- 대상: 실험 기간 중 `/`을 랜딩 페이지로 처음 방문한 익명 브라우저
- 무작위 배정 단위: 익명 브라우저
- 분석 단위: 실험 기간 중 최초 유효 홈 노출을 가진 `user_pseudo_id` 한 건
- 배정 비율: A 50%, B 50%
- 배정 유지: `ab_home_layout_v1=A|B` cookie
- 제외 대상:
  - 운영자 및 QA용 브라우저
  - 로컬·preview 배포
  - 명백한 자동화 테스트
  - `user_pseudo_id` 또는 유효 노출 이벤트가 없는 관측치

광고 차단기나 동의 거부 때문에 GA4에 노출과 클릭이 모두 기록되지 않은 방문자는 분석 모집단에서 관측되지 않는다. 이 선택 편향 가능성은 결과의 한계에 기록한다.

### 3.4 변형

#### A — Control

현재 Quartz 홈페이지와 텍스트 중심 Recent Posts 목록을 그대로 사용한다.

- 소개 및 안내문
- Recent Posts의 제목과 날짜
- B와 동일한 글 6개와 동일한 순서
- 대표 이미지 없이 텍스트 위계만 사용

#### B — Treatment

대표 이미지 중심의 포트폴리오형 카드 갤러리를 사용한다. 첫 실험에서는 A와 같은 글 6개와 같은 순서를 유지하고 표현 방식만 바꾼다.

- 데스크톱 3열, 태블릿 2열, 모바일 1열
- 4:3 대표 이미지, 제목, 날짜 표시
- 카드 전체를 클릭 가능한 영역으로 사용
- 글 제목과 날짜는 A와 동일하게 유지
- 첫 두 카드 이미지는 eager, 나머지는 lazy loading

현재 Quartz 구현은 실제 최신 글 6개를 빌드 시점에 날짜순으로 선택한다. A와 B는 같은 배열을 공유하므로 글과 순서가 항상 같다. 실제 실험 전에는 이 6개와 최종 커버 이미지를 동결한다.

#### 공통 구현

- 프레임워크: 기존 Quartz 4
- 배포 대상: 기존 Cloudflare Pages 정적 배포
- 홈 HTML에 A와 B를 함께 생성하고, 페이지가 그려지기 전 실행되는 작은 스크립트가 한쪽만 표시
- 최초 방문 시 브라우저에서 50:50 배정하고 first-party cookie에 90일 보관
- `?variant=A|B`는 QA용 강제 미리보기이며 cookie와 실험 이벤트에 영향을 주지 않음
- production이 아닌 hostname에서는 GA4를 기본 차단하고, `?ab_debug=1`을 붙인 경우에만 `debug_mode=true`, `traffic_type=internal`로 전송
- A/B 모두 같은 Quartz 빌드, 원문 22개, 링크와 GA4 계측 코드를 공유

### 3.5 이벤트 계약

| 이벤트                      | 발생 조건                                                 | 용도                        | 필수 파라미터                                                       |
| --------------------------- | --------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------- |
| `experiment_exposure`       | 유효 대상에게 홈 변형이 실제 렌더링됨                     | 모든 지표의 분모            | `experiment_id`, `variant`, `exposure_id`, `exposed_at`             |
| `home_article_click`        | 홈의 측정 대상 글 링크를 클릭함                           | Primary                     | 위 공통값, `article_path`, `slot`, `position`, `clicked_at`         |
| `article_engaged_from_home` | 홈에서 이동한 글에서 30초 이상 체류하고 50% 이상 스크롤함 | Secondary·quality guardrail | 클릭 이벤트의 값, `engagement_seconds`, `scroll_ratio`              |
| `home_web_vital`            | 홈에서 LCP·INP·CLS 측정값이 확정·갱신됨                   | 성능 guardrail              | 공통값, `metric_name`, `metric_value`, `metric_id`, `metric_rating` |
| `home_client_error`         | 홈 노출 중 JS 오류 또는 처리되지 않은 Promise 거부 발생   | 안정성 guardrail            | 공통값, `error_type`                                                |

공통 값:

- `experiment_id`: `home_layout_v1`
- `variant`: `A` 또는 `B`
- `exposure_id`: 홈 페이지뷰마다 새로 생성되는 UUID. custom dimension으로 등록하지 않고 BigQuery 조인에만 사용
- `exposed_at`: 브라우저에서 기록한 노출 시각(ms). 최종 시간 기준은 GA4의 `event_timestamp` 사용
- `slot`: `recent_1`, `recent_2`처럼 화면 내 위치를 나타내는 저카디널리티 값

GA4 custom dimension으로 등록할 항목:

- `experiment_id` — event scope
- `variant` — event scope
- `slot` — event scope
- `metric_name` — event scope
- `metric_rating` — event scope

`user_pseudo_id`, `exposure_id`, `metric_id`, timestamp, 글 제목처럼 고카디널리티인 값은 custom dimension으로 등록하지 않는다. BigQuery export의 원래 필드·event parameter를 사용한다.

### 3.6 지표

#### Primary metric — Home-to-article conversion rate

실험 기간 중 최초 유효 홈 노출 후 30분 안에 측정 대상 글 링크를 한 번 이상 클릭한 익명 브라우저의 비율이다.

```text
Home-to-article CVR
= 글 링크를 1회 이상 클릭한 실험 단위 수 / 유효 홈 노출 실험 단위 수
```

이 지표는 한 사람이 여러 글을 클릭해도 1로 계산하는 사용자 단위 이진 지표다. 원시 클릭 수를 분자로 쓰지 않는다.

#### Secondary metric — Exposed-to-engaged rate

```text
Exposed-to-engaged rate
= 30분 안에 글 클릭 후 읽기 조건을 충족한 실험 단위 수 / 유효 홈 노출 실험 단위 수
```

클릭뿐 아니라 실제 읽기로 이어졌는지를 같은 무작위 배정 분모에서 측정한다. Primary와 분모가 같으므로 B가 만든 전체 퍼널 효과로 해석할 수 있다.

#### Diagnostic metrics

- Clicks per exposed user: 반복 클릭까지 포함한 탐색적 사용량
- Slot별 클릭 분포: 어느 위치의 글이 클릭되었는지
- 글별 클릭 분포와 디바이스별 효과: 원인 해석용이며 출시 판단용 확증 지표가 아님

#### Product guardrails

- Click-to-engaged rate: 클릭한 실험 단위 중 읽기 조건을 충족한 비율. B가 낚시성 클릭만 늘리지 않는지 확인한다.
- Home client error rate: 노출 실험 단위 중 `home_client_error`가 1회 이상 발생한 비율
- Core Web Vitals p75: LCP ≤ 2,500ms, INP ≤ 200ms, CLS ≤ 0.1을 절대 기준으로 삼는다.
- 상대적 성능·품질 비열등성 한계는 baseline 수집 후 실험 시작 전에 확정한다. 한계를 정하지 않은 상태에서 사후적으로 “의미 있는 악화”를 정의하지 않는다.

Click-to-engaged rate는 클릭 이후에 조건부로 선택된 집단의 지표라 B와 A의 클릭자 구성이 달라질 수 있다. 따라서 그 차이를 B의 순수한 읽기 효과로 해석하지 않고, 명백한 품질 훼손을 막는 guardrail로만 사용한다. 실제 전체 읽기 효과는 동일한 노출자 분모를 쓰는 Exposed-to-engaged rate로 판단한다.

#### Data-quality gates — 제품 guardrail과 별도

- SRM: 최초 노출 브라우저의 A:B가 예정한 50:50과 불일치하는지 카이제곱 검정한다. `p < 0.01`이면 결과 해석을 중단하고 원인을 조사한다.
- Crossover: 같은 `user_pseudo_id`에 A와 B가 모두 기록된 수와 비율을 보고한다.
- Event invariant: 클릭·engagement에는 앞선 유효 노출과 variant가 있어야 하며, `exposure_id` 누락률을 보고한다.
- Page-view invariant: 문서 이동 한 번에 `page_view`가 한 번만 기록되는지 A/A와 DebugView에서 확인한다.
- 봇·운영자·debug 트래픽은 사전 규칙으로 제외하고 결과를 본 뒤 제외 규칙을 만들지 않는다.

### 3.7 분석 원칙

- Primary 분석은 최초 관측된 배정에 따른 intent-to-treat 방식으로 한다.
- attribution window는 최초 유효 노출 이후 30분으로 고정한다.
- 같은 브라우저에서 A와 B가 모두 관측되면 최초 배정을 사용하고 crossover 건수를 별도로 보고한다.
- 효과는 다음을 모두 보고한다.
  - A/B 분모와 전환 수
  - A/B 전환율
  - 절대 차이(percentage point)
  - 상대 상승률
  - 95% 신뢰구간
  - 양측 검정 p-value
- 실험 전 A/A 단계에서 50:50 배정 이상 여부를 Sample Ratio Mismatch로 점검한다.
- 디바이스별 결과는 사전 지정하지 않는 한 탐색적 분석으로만 표시한다.
- Secondary·diagnostic 지표의 p-value를 여러 번 훑어 승자를 정하지 않는다. 확증적 의사결정은 하나의 Primary와 사전 고정한 guardrail만 사용한다.

### 3.8 출시 판정 규칙

아래 순서로 판단한다.

1. Data-quality gate 실패 시 실험 결과를 무효로 두고 원인을 수정한 뒤 다시 실행한다.
2. 필요한 표본 수와 최소 기간을 모두 채우지 못하면 `검정력 부족`으로 기록한다.
3. B의 Primary 효과가 사전 정의한 기준에서 통계적으로 유의한 양(+)의 효과이고 모든 product guardrail이 비열등성 한계 안이면 B를 채택한다.
4. Primary가 유의하지 않으면 “차이가 없다”가 아니라 현재 MDE보다 작은 효과를 구분하지 못했다고 해석한다.
5. Primary가 좋아도 guardrail이 실패하면 B를 채택하지 않는다.

### 3.9 표본 수와 종료 조건

아래 값은 baseline 계측 후 실험 시작 전에 확정한다.

| 항목                           | 값                    |
| ------------------------------ | --------------------- |
| Baseline CVR                   | TBD                   |
| 최소 검출 효과(MDE)            | TBD percentage points |
| 유의수준                       | 0.05, two-sided       |
| 검정력                         | 0.80                  |
| 필요한 표본 수                 | TBD per variant       |
| 최소 실행 기간                 | 14일                  |
| 최대 실행 기간                 | TBD                   |
| Click→engaged 비열등성 한계    | TBD percentage points |
| LCP·INP·CLS 상대 비열등성 한계 | TBD                   |

종료 조건은 `필요 표본 수 충족`과 `최소 14일 경과`를 모두 만족하는 것으로 한다. 최대 기간까지 표본 수가 부족하면 “효과 없음”이 아니라 “검정력 부족”으로 종료한다.

### 3.10 실행 전 체크리스트

- [x] GA4 property 접근 권한과 DebugView 데이터 유입 확인
- [x] GA4 BigQuery daily export 연결
- [x] BigQuery dataset 위치와 비용 정책 확인
- [ ] GA4 custom dimensions 등록
- [ ] 문서 이동 1회당 `page_view` 1회인지 DebugView에서 확인
- [ ] 다섯 custom event와 필수 파라미터를 DebugView에서 확인
- [ ] `home_web_vital`, `home_client_error`, `exposure_id`를 DebugView/BigQuery에서 확인
- [ ] 운영자/preview 트래픽 제외 확인
- [ ] cookie 재방문 시 동일 변형 유지 확인
- [ ] A/A 테스트에서 배정 및 이벤트 품질 확인
- [ ] B 디자인 동결
- [ ] baseline CVR, MDE, 표본 수, 최대 기간 동결
- [ ] Click→engaged와 Web Vitals 비열등성 한계 동결
- [ ] `analysis/sql/01`~`04`를 실제 dataset 이름으로 실행하고 결과 검산

로컬 구현 스파이크:

- [x] 기존 Quartz에서 강제 미리보기 `?variant=A|B` 동작
- [x] 최초 배정 cookie 발급 및 재방문 variant 유지
- [x] 데스크톱 3열, 태블릿 2열, 모바일 1열 갤러리 구현
- [x] A/B에서 실제 최신 글 6개의 제목·순서·날짜가 동일함을 확인
- [x] 기존 원문 22개, Obsidian 링크, 검색, 그래프, 댓글 구조 유지
- [x] `experiment_exposure`, `home_article_click`, `article_engaged_from_home` 코드 구현
- [x] 무작위 방문에서 노출·클릭 이벤트와 필수 파라미터 브라우저 검증
- [x] QA 미리보기에서 실험 이벤트가 기록되지 않음을 브라우저 검증
- [x] Quartz production build 통과 및 데스크톱·모바일 캡처 확인
- [x] Cloudflare 임시 Workers Static Assets HTTPS 배포에서 홈·글·이미지 200 응답 확인
- [x] Cloudflare 일반 preview에서 GA4 스크립트와 실험 이벤트 차단 확인
- [x] Cloudflare `ab_debug=1`에서 page view·노출·클릭·30초/50% engagement의 GA collect 요청 확인
- [x] headless Chromium에서 동일 `exposure_id`의 노출·클릭과 LCP·INP·CLS 이벤트 확인
- [x] 실제 GA4 DebugView 수신 검증
- [ ] 기존 Cloudflare Pages 프로젝트의 영구 preview 또는 production 배포

### 3.11 변경 이력

| 날짜       | 변경                                                | 이유                                                                                    | 실험 해석에 미치는 영향                                                                                                |
| ---------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 2026-08-24 | 최초 명세 초안 작성                                 | 계측 구현 전에 측정·분석 원칙을 동결하기 위함                                           | 없음 — 실험 시작 전                                                                                                    |
| 2026-08-24 | Astro 재구축 스파이크와 이미지 카드형 B 구현        | 장기적인 실험 유연성과 동일 런타임 내 A/B 비교를 확보하기 위함                          | A는 기존 Quartz가 아니라 Astro에서 재현한 text-list control이며, 추정 대상은 text list 대비 image gallery의 전체 효과  |
| 2026-08-24 | 실제 후보를 기존 Quartz 기반 구현으로 전환          | Astro 이관 과정에서 원문·기존 기능·디자인의 차이가 너무 커졌기 때문                     | A는 실제 기존 홈페이지가 되고 B도 동일 원문과 최신 글 배열을 사용해, 프레임워크 이관 효과 없이 표현 방식의 효과를 추정 |
| 2026-08-24 | A/B의 최신 글 수를 5개에서 6개로 확대               | B의 데스크톱 3열에서 두 행을 완성하고 A/B 입력을 동일하게 유지하기 위함                 | 노출되는 글 집합은 바뀌지만 실험 시작 전 변경이며, 두 변형에는 동일하게 적용됨                                         |
| 2026-08-24 | preview GA 차단과 `ab_debug=1` 계측 경로 추가       | 테스트 방문의 production 분석 혼입을 막으면서 DebugView 검증은 허용하기 위함            | production 자동 측정은 `bogeun.pages.dev`에서만 실행되며 debug 이벤트는 internal traffic으로 구분됨                    |
| 2026-08-24 | 지표 계층·Web Vitals·오류·노출 ID·BigQuery SQL 추가 | 클릭 증가와 읽기 품질, 성능, 데이터 신뢰성을 분리해 실제 출시 결정을 가능하게 하기 위함 | Primary는 사용자 단위 30분 CVR로 고정되고 guardrail 및 SRM 실패 시 출시하지 않음                                       |
| 2026-08-24 | GA4 BigQuery Daily Export 연결                      | 원시 이벤트를 사용자 단위로 재구성하고 재현 가능한 SQL 분석을 수행하기 위함             | `bg-blog-lab`, Seoul, Daily, Sandbox로 연결. 첫 적재 전 데이터는 BigQuery 분석 대상이 아님                             |

### 3.12 결과 기록

실험 종료 후 아래 표를 채운다. 방문자 단위 데이터나 GA4 CSV 원본은 이 문서에 첨부하지 않는다.

| 지표                   |   A |   B | B−A / 상대 차이 | 95% CI | p-value |
| ---------------------- | --: | --: | --------------: | -----: | ------: |
| 유효 실험 단위 수      | TBD | TBD |               — |      — |       — |
| 글 클릭 실험 단위 수   | TBD | TBD |               — |      — |       — |
| Home-to-article CVR    | TBD | TBD |             TBD |    TBD |     TBD |
| Engaged article rate   | TBD | TBD |             TBD |    TBD |     TBD |
| Click-to-engaged rate  | TBD | TBD |             TBD |    TBD |     TBD |
| Home client error rate | TBD | TBD |             TBD |    TBD |     TBD |
| LCP p75 (ms)           | TBD | TBD |             TBD |    TBD |     TBD |
| INP p75 (ms)           | TBD | TBD |             TBD |    TBD |     TBD |
| CLS p75                | TBD | TBD |             TBD |    TBD |     TBD |

데이터 품질:

- A:B 배정 비율: TBD
- SRM p-value: TBD
- crossover 수: TBD
- 이벤트 누락·중복·봇 의심 건: TBD

해석 및 결정:

- 결론: TBD
- 기본 홈페이지 변경 여부: TBD
- 숫자를 얼마나 믿는가: TBD
- 관측된 한계: TBD
- 후속 실험: TBD

---

## 4. 데이터 저장과 SQL 분석 구조

### 4.1 역할별 저장 위치

현재 Export 설정:

- Google Cloud project: `bg-blog-lab`
- location: `asia-northeast3` (Seoul)
- event export: Daily
- streaming·advertising identifiers·user-data export: off
- billing: BigQuery Sandbox. 원시 테이블은 60일 후 만료되므로 종료 결과는 이 문서에 영구 기록

| 대상                | 저장 위치                                         | 목적                          |
| ------------------- | ------------------------------------------------- | ----------------------------- |
| 원시 이벤트         | GA4 → BigQuery `analytics_<property_id>.events_*` | 재분석 가능한 source of truth |
| 실험 단위 테이블/뷰 | BigQuery의 별도 `ab_lab` dataset                  | 한 브라우저당 한 행으로 정제  |
| 재현 가능한 SQL     | 저장소 `analysis/sql/`                            | 쿼리 버전 관리와 리뷰         |
| 최종 숫자·해석·결정 | 이 `abtest.md`                                    | 사람이 읽는 실험 기록         |

방문자 단위 CSV, cookie 값, `user_pseudo_id`는 Git에 커밋하지 않는다.

### 4.2 권장 실험 단위 테이블

`ab_lab.home_layout_v1_units`는 다음처럼 한 실험 단위당 한 행을 갖도록 만든다.

| 컬럼                    | 설명                                     |
| ----------------------- | ---------------------------------------- |
| `user_pseudo_id`        | GA4 익명 브라우저 식별자; 외부 공유 금지 |
| `variant`               | 최초 노출 변형                           |
| `first_exposure_at`     | 최초 유효 홈 노출 시각                   |
| `first_exposure_id`     | 최초 홈 페이지뷰와 성능 이벤트 연결 키   |
| `clicked_within_30m`    | 30분 이내 글 클릭 여부                   |
| `engaged_within_30m`    | 30분 이내 조건을 만족한 글 읽기 여부     |
| `first_article_path`    | 최초 클릭 글 경로                        |
| `had_home_client_error` | 30분 이내 홈 JS 오류 여부                |
| `crossover_detected`    | A와 B가 모두 관측됐는지 여부             |

### 4.3 기본 집계 SQL 형태

실제 project와 dataset 이름은 BigQuery 연결 후 확정한다.

```sql
SELECT
  variant,
  COUNT(*) AS exposed_users,
  COUNTIF(clicked_within_30m) AS converted_users,
  SAFE_DIVIDE(COUNTIF(clicked_within_30m), COUNT(*)) AS conversion_rate,
  COUNTIF(engaged_after_home) AS engaged_users,
  SAFE_DIVIDE(COUNTIF(engaged_after_home), COUNT(*)) AS engaged_rate
FROM `<gcp_project>.ab_lab.home_layout_v1_units`
GROUP BY variant
ORDER BY variant;
```

저장소의 실행 순서는 다음과 같다.

1. `analysis/sql/01_build_home_layout_v1_units.sql`: 최초 노출 기준 실험 단위 테이블 생성
2. `analysis/sql/02_metric_summary.sql`: Primary·secondary·guardrail 집계
3. `analysis/sql/03_srm_check.sql`: 50:50 SRM 데이터 품질 판정
4. `analysis/sql/04_web_vitals_guardrail.sql`: 최초 홈 노출의 LCP·INP·CLS p50/p75/p95

SQL은 이벤트 정제, 실험 단위 생성, 지표 집계에 사용한다. 신뢰구간과 가설검정은 같은 집계 결과를 입력으로 하는 작은 분석 스크립트에서 계산하고, 사용한 코드와 결과를 함께 버전 관리한다.

### 4.4 데이터 보존 주의

- BigQuery export는 연결 완료 후 들어오는 데이터를 기준으로 사용한다. 실험 이벤트를 배포하기 전에 연결과 실제 적재를 확인한다.
- Daily export는 `events_YYYYMMDD` 테이블을 생성한다.
- 오늘 데이터가 반드시 필요하지 않으면 daily export부터 시작한다.
- BigQuery dataset region은 연결 후 변경이 번거로우므로 생성 전에 확정한다.
- 원시 데이터 접근 권한은 최소화하고 분석 결과에는 집계값만 사용한다.

## 5. 참고 문서

- [GA4 BigQuery Export 설정](https://support.google.com/analytics/answer/9823238)
- [GA4 BigQuery Export schema](https://support.google.com/analytics/answer/7029846)
- [GA4 BigQuery 기본 SQL 예제](https://developers.google.com/analytics/bigquery/basic-queries)
- [Cloudflare Pages cookie 기반 A/B 테스트](https://developers.cloudflare.com/pages/functions/examples/ab-testing/)
- [Microsoft Research — trustworthy experimentation metric taxonomy](https://www.microsoft.com/en-us/research/articles/patterns-of-trustworthy-experimentation-during-experiment-stage/)
- [Microsoft Research — Sample Ratio Mismatch](https://www.microsoft.com/en-us/research/publication/diagnosing-sample-ratio-mismatch-in-online-controlled-experiments-a-taxonomy-and-rules-of-thumb-for-practitioners/)
- [web.dev — Core Web Vitals thresholds](https://web.dev/articles/defining-core-web-vitals-thresholds)
- [web.dev — Web Vitals field measurement](https://web.dev/articles/vitals)
