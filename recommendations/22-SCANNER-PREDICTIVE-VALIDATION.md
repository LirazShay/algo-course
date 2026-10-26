# ‏22 — Recommendation Sheet: Scanner Predictive Validation

> ‏מקור לימודי עיקרי: `../22-SCANNER-PREDICTIVE-VALIDATION.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי קבוע שמוכיח האם ה־`Scanner` באמת מנבא תוצאה עתידית שימושית, האם `Rank #1` עדיף על החלופות, כמה מהר ה־Edge מופיע, האם הוא שורד friction, והאם התוצאה יציבה מספיק כדי להצדיק מעבר ל־Replay/Shadow מתקדם. המסמך נשאר מחקרי ואינו מהווה המלצה להפעלת מסחר חי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Did the strategy make money in one backtest?
```

‏אלא:

```text
Given only information available at decision time,
does a higher scanner rank predict better future outcomes,
at the horizons we actually care about,
with enough consistency, magnitude and speed
to remain interesting after executable friction?
```

‏נפריד ארבע שאלות:

```text
Prediction Quality
→ Ranking Quality
→ Economic / Executable Quality
→ Robustness / Generalization
```

‏אין לקפוץ ישר ל־`PnL` מלא לפני שהשכבות האלה נבדקו בנפרד.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Prediction קודם ל־Execution

‏בשלב הזה המבחן הראשי של ה־Scanner הוא האם הוא מנבא.

‏נשמור שלוש שכבות תוצאה נפרדות:

```text
Gross / reference outcome
Executable outcome
Simulated net outcome
```

‏אם `Gross` חלש, אין טעם להאשים `Execution`.

‏אם `Gross` חזק אבל `Executable/Net` חלש, הבעיה כנראה אינה בהכרח ב־Scanner עצמו.

### ‏`P0 — Required`: Fixed Validation Scorecard

‏לכל `scanner_version` יהיה Report קבוע, כך שכל Experiment נמדד באותם מדדים בסיסיים.

‏Baseline:

```text
sample_count / episode_count
Top1 forward returns: 1s / 2s / 5s / 10s / 30s / 60s
Top1 median forward returns
Top1 MFE / MAE: 10s / 30s / 60s
time_to_first_profit
time_to_target_5bps
time_to_target_10bps
time_to_target_20bps
target_before_stop_rate
Top1 vs Top2-5
Top1 vs Top6-20
Top1 vs all survivors
Rank bucket monotonicity
Top1 premium
Lift vs baseline
Opportunity frequency
Gross / Executable / Net edge
Tail outcomes
```

### ‏`P0 — Required`: כמה Horizons, לא Horizon אחד

‏Baseline מחקרי:

```text
1s
2s
5s
10s
30s
60s
```

‏הסיבה היא שה־Edge יכול:

```text
appear early
peak
then decay or reverse
```

‏לכן כל גרסה צריכה להפיק `Forward Return Curve` ולא מספר בודד.

### ‏`P0 — Required`: Decision Time הוא `t0`

‏כל Label עתידי מתחיל רק אחרי הזמן שבו ההחלטה הייתה זמינה באמת.

‏נשמור, כאשר קיים:

```text
market_event_time
feature_ready_time
ranking_time
decision_time
```

‏`decision_time` הוא ברירת המחדל ל־`t0` של Scanner Validation.

### ‏`P0 — Required`: `Feature != Label`

‏Feature משתמש רק בעבר/הווה המותר עד `t0`.

‏Label משתמש בעתיד לאחר `t0`.

‏עדיף לוגית ופיזית להפריד:

```text
scanner_snapshot_table
outcome_label_table
```

‏כדי לצמצם סיכון ל־Leakage.

### ‏`P1 — Preferred Default`: Top-N נשמר תמיד

‏לא שומרים רק את הזוכה.

‏בכל Snapshot חשוב נשמור לפחות:

```text
#1
#2
#3
#5
#10
#20
```

‏וה־outcomes שלהם.

‏כך #2/#3/#10 הופכים לקבוצת ביקורת טבעית.

### ‏`P1 — Preferred Default`: Rank Buckets

‏Baseline buckets אפשרי:

```text
1
2-5
6-20
21-100
rest of eligible universe
```

‏לכל bucket נשמור:

```text
N
mean
median
p10 / p25 / p75 / p90
positive rate
MFE / MAE
time-to-target
net/executable metrics when available
```

‏אם ה־Ranking טוב, נרצה לראות מגמה סבירה שבה buckets טובים יותר מקבלים outcomes טובים יותר.

### ‏`P1 — Preferred Default`: Rank Monotonicity

‏לא נסתפק ב־Top1 טוב.

‏נבדוק:

> ‏האם סדר הדירוג עצמו מכיל מידע?

‏אם `Top 10` טובים אבל #1 אינו טוב יותר מה־Top 10, ייתכן שיש `Opportunity Set Edge` אבל לא מספיק `Ranking Edge`.

### ‏`P1 — Preferred Default`: Top1 Premium

```text
Top1Premium_h =
    Outcome_h(rank1)
    - AvgOutcome_h(rank2..rank10)
```

‏נחשב אותו בכמה Horizons ובכמה Metrics.

‏Promotion של `Rank #1` כמועמדת מיוחדת דורש Premium שחוזר לאורך זמן ולא רק Average יחיד.

### ‏`P1 — Preferred Default`: Baselines מחייבים

‏כל Scanner מורכב יושווה לפחות מול:

```text
random eligible candidate
simple momentum-only ranking
previous/champion scanner
market/survivor median
```

‏מודל מורכב שאינו מנצח Baseline פשוט אינו מצדיק Complexity נוספת.

### ‏`P1 — Preferred Default`: Lift

```text
Lift = HitRate(top_bucket) / HitRate(baseline)
```

‏נשמור גם Absolute Difference, לא רק Ratio:

```text
lift_ratio
hit_rate_delta
outcome_delta
```

‏כך Baseline נמוך מאוד לא ייצור יחס מרשים בלי משמעות כלכלית.

### ‏`P2 — Challenger`: Information Coefficient

‏אפשר למדוד `Spearman Rank Correlation` בין Score/Rank לבין future outcome בכל Snapshot או Episode.

‏הוא עוזר להבין האם יש מידע cross-sectional בסדר הדירוג.

‏אבל `IC` אינו תחליף ל־Top1 premium, executable edge או net economics.

### ‏`P1 — Preferred Default`: Path Metrics, לא רק Endpoint

‏לכל Horizon חשוב נמדוד:

```text
MFE
MAE
time_to_first_profit
time_to_target
time_to_MFE
target_before_stop
```

‏שתי מניות שמסיימות באותה תשואה יכולות להיות הזדמנויות שונות לחלוטין אם אחת ירדה עמוק לפני העלייה.

### ‏`P1 — Preferred Default`: Gross → Executable → Net

‏לכל Metric מרכזי נשמור שכבות:

```text
Mid/Reference Forward Outcome
Executable Forward Outcome
Simulated Net Outcome
```

‏מטרת ההפרדה:

```text
Prediction Truth
vs
Execution Truth
vs
Economic Truth
```

### ‏`P1 — Preferred Default`: `NO TRADE` Validation

‏גם Snapshot שהסתיים ב־`NO TRADE` נשמר למחקר.

‏נבדוק:

```text
what happened after no-trade?
```

‏אם הרבה `NO TRADE` מכילים future winners, ייתכן שה־Decision Gate קשיח מדי.

### ‏`P1 — Preferred Default`: Rejected Candidate Analysis

‏ל־Filters ו־Decision Gates נשווה:

```text
accepted distribution
vs
rejected distribution
```

‏Filter טוב צריך לשפר Distribution של מה שעובר.

‏אם rejected candidates כמעט זהים ל־accepted candidates, הערך של ה־Filter מוטל בספק.

### ‏`P0 — Required`: Opportunity Episode במקום Snapshot Count נאיבי

‏Signals רצופים מאותה מניה אינם בהכרח Samples עצמאיים.

‏נגדיר `candidate_episode` למשל לפי:

```text
same symbol
continuous top-rank / eligibility state
bounded time gap
```

‏ונשמור:

```text
episode_id
first_seen_time
first_rank1_time
first_trade_eligible_time
last_seen_time
peak_score
best_rank
episode_duration
```

‏Metrics ידווחו גם ברמת Snapshot וגם ברמת Episode.

### ‏`P0 — Required`: Overlapping Labels אינם Samples עצמאיים

‏אם מחשבים `forward_30s` כל שנייה, החלונות חופפים מאוד.

‏לכן:

```text
row_count != independent_sample_count
```

‏אין להשתמש ב־N עצום של Rows כהוכחת Confidence בלי להתחשב בתלות בזמן.

### ‏`P2 — Challenger`: Block Bootstrap

‏כאשר נרצה Confidence Intervals, נעדיף resampling ששומר חלק מהתלות בזמן/episodes, במקום bootstrap נאיבי של Rows בודדים.

### ‏`P1 — Preferred Default`: Precision + Recall

‏נמדוד שתי שאלות:

```text
Precision:
How often were our top-ranked candidates truly good?

Recall:
Where did future winners rank when they were still actionable?
```

‏למערכת שבוחרת מועמדת אחת, Precision בראש הדירוג חשובה במיוחד, אך Recall מגלה אם ה־Scanner מפספס משפחות של הזדמנויות.

### ‏`P2 — Challenger`: Future Winner Recall

‏נגדיר Winner רק כ־Label מחקרי Versioned, לדוגמה:

```text
future_winner_definition_v1
```

‏ואז נבדוק:

```text
% winners in Top10
% winners in Top50
% winners in Top100
```

‏אין לקבע threshold כעובדה; הוא כלי מחקרי שדורש sensitivity analysis.

### ‏`P1 — Preferred Default`: Signal Age / Rank Age

‏לכל Top Candidate נשמור:

```text
rank_age
signal_age
seconds_in_top1
seconds_in_top3
seconds_in_top10
```

‏ואז נבדוק:

```text
fresh rank1
vs
aged rank1
```

‏זה קריטי לאסטרטגיה שבה Edge אמור להופיע מהר.

### ‏`P2 — Challenger`: Rank Persistence / Churn / Velocity

‏נמדוד:

```text
rank_churn_rate
rank_persistence
rank_velocity
rank_acceleration
```

‏לא כ־Trading Rule אוטומטי אלא כ־Diagnostics/Feature Candidates.

### ‏`P1 — Preferred Default`: Signal Decay Curve

‏נמדוד Outcome לפי Signal Age:

```text
0-1s
1-3s
3-5s
5-10s
10s+
```

‏מכאן נוכל להעריך `Signal Half-Life` מחקרי.

‏ה־Half-Life ישפיע בהמשך על:

```text
scanner cadence
entry urgency
order TTL
latency budget
max hold / no-progress logic
```

### ‏`P1 — Preferred Default`: Edge-at-stage Attribution

‏נשמור:

```text
edge_at_signal
edge_at_submit
edge_at_fill
```

‏וכן:

```text
rank_at_signal
rank_at_submit
rank_at_fill
score_at_signal
score_at_submit
score_at_fill
```

‏כך ניתן להפריד:

```text
prediction failure
from
signal decay / execution delay
```

### ‏`P1 — Preferred Default`: Segmentation מתוכנן מראש

‏Baseline segments:

```text
time of day
liquidity bucket
price bucket
activity bucket
broad volatility/activity regime
```

‏מטרת segmentation היא להבין איפה Edge נשבר, לא לחפש בכוח Slice מנצח.

‏לכל Segment חובה להציג `N`.

### ‏`P0 — Required`: אין Slice Mining

‏אם עוברים על עשרות חלוקות עד שאחת נראית מצוין, התוצאה אינה Promotion evidence.

‏Slice חדש שנמצא ב־Discovery צריך להיבדק בתקופת Validation אחרת.

### ‏`P1 — Preferred Default`: Distribution לפני Average

‏לכל Metric מרכזי נשמור:

```text
mean
median
p10
p25
p75
p90
worst 5%
worst 1%
```

‏Average טוב שמגיע מ־outlier אחד אינו Evidence חזק.

### ‏`P1 — Preferred Default`: Edge Concentration

‏נמדוד:

```text
% edge from top day
% edge from top 5 days
% edge from top symbol
% edge from top 5 symbols
```

‏וכן ניסויי:

```text
remove best days
remove top symbols
leave-one-group-out
```

‏Edge רחב עדיף על Edge שתלוי באירוע יחיד.

### ‏`P1 — Preferred Default`: Threshold Curves, לא Magic Point

‏Decision thresholds ייבדקו כעקומה/Neighborhood.

‏אנחנו מחפשים:

```text
robust region
```

‏ולא:

```text
one perfect threshold
```

‏`Threshold Cliff` הוא Warning ל־noise/overfitting.

### ‏`P2 — Challenger`: Weight Surface / Perturbation

‏נשנה מעט weights/inputs ונבדוק אם Top1 וה־Metrics יציבים.

‏Scanner שבו שינוי זעיר הופך כל Ranking עשוי להיות שברירי מדי.

### ‏`P1 — Preferred Default`: Feature-Family Ablation

‏לכל משפחה חדשה נריץ:

```text
Champion baseline
vs
Champion - family X
vs
Champion + challenger family X
```

‏ונמדוד:

```text
Top1 premium
monotonicity
forward returns
MFE/MAE
net/executable edge
rank stability
opportunity frequency
```

‏השאלה היא `Marginal Edge`, לא האם Feature נשמע הגיוני.

### ‏`P0 — Required`: Predefined Metrics

‏לפני Experiment נרשום:

```text
hypothesis
primary metric
secondary metrics
expected direction
promotion bar
rejection bar
```

‏לא מחליפים Primary Metric אחרי שרואים את התוצאה.

### ‏`P1 — Preferred Default`: Primary Metric קטן וברור

‏נבחר Primary Metric אחד או מעט מאוד לכל Hypothesis.

‏לדוגמה רעיונית:

```text
Top1 net/executable outcome at target horizon
```

‏או:

```text
Top1 target-before-stop rate
```

‏הבחירה המדויקת חייבת להתאים לשאלה המחקרית ול־Fidelity הזמין.

### ‏`P0 — Required`: Experiment Registry

‏לכל ניסוי:

```text
experiment_id
parent_experiment_id
hypothesis
data_version
scanner_version
feature_version
filter_version
score_version
label_version
config_hash
primary_metric
secondary_metrics
result
interpretation
status
```

‏Negative Result נשמר בדיוק כמו Positive Result.

### ‏`P1 — Preferred Default`: Scanner Versioning

‏כל Observation נשמר עם:

```text
scanner_version
feature_version
filter_version
score_version
```

‏אין לערבב תוצאות מגרסאות שונות ללא סימון מפורש.

### ‏`P0 — Required`: Reproducibility

‏כל תוצאת Promotion חייבת להיות ניתנת להרצה מחדש באמצעות:

```text
data fingerprint
code commit
config hash
scanner versions
label version
random seed when relevant
```

### ‏`P1 — Preferred Default`: Champion / Challenger

‏כאשר Baseline יציב קיים:

```text
Champion Scanner
vs
Challenger Scanner
```

‏שניהם רצים על אותם Events ו־Labels.

‏בשלב מאוחר Challenger יכול לרוץ ב־Shadow בלבד לצורך Evidence, ללא שינוי בהחלטות מסחר אמיתיות.

---

## ‏3. Why

‏ה־Scanner הוא מנגנון Selection.

‏לכן השאלה אינה אם מניה כלשהי עלתה, אלא האם הסדר שהמערכת יצרה מכיל מידע על העתיד.

‏בלי Top-N, Buckets ו־Baselines אפשר לקבל Scanner שנראה משכנע למרות ש־#1 אינו טוב יותר מבחירה פשוטה.

‏בלי Path Metrics אפשר לפספס הזדמנות מהירה שהתרחשה לפני סוף החלון, או להתעלם מ־adverse path גדול.

‏בלי Episodes ותלות בזמן אפשר להציג Sample Size מנופח.

‏בלי Gross/Executable/Net separation אפשר לתקן את הרכיב הלא נכון.

‏בלי Rejected/No-Trade analysis אפשר לייעל Precision תוך הרס Recall.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏יש Point-in-Time snapshots אמינים.
- ‏ה־Scanner מדרג כמה Candidates באותו `as_of_time`.
- ‏יש Labels עתידיים נקיים מ־Leakage.
- ‏רוצים לדעת אם Ranking עצמו מוסיף מידע.
- ‏רוצים להשוות Scanner פשוט ומורכב.
- ‏רוצים להפריד Signal איכותי מ־Execution גרוע.
- ‏רוצים להחליט אם Feature/Filter/Weight חדש שווה Promotion.

---

## ‏5. Do Not Use When

‏אין להסיק מסקנות חזקות כאשר:

- ‏אין Point-in-Time Universe.
- ‏`t0` אינו ברור.
- ‏Features או Filters משתמשים בעתיד.
- ‏ה־Dataset מכיל gaps מהותיים לא מסומנים.
- ‏Top-N לא נשמר ולכן אין קבוצת ביקורת טבעית.
- ‏הגרסאות מעורבבות.
- ‏מספר ה־Episodes קטן מדי.
- ‏התוצאה תלויה רק בכמה Outliers.
- ‏Execution fidelity נמוך אך התוצאה מוצגת כ־Net Live expectation.

---

## ‏6. Alternatives

### ‏A. `PnL-only evaluation`

‏פשוט, אך מערבב Scanner, Entry, Exit, Cost, Sizing ו־Execution.

### ‏B. `Top1-only evaluation`

‏קל, אך אינו יודע אם Top1 עדיפה באמת על #2-#10.

### ‏C. `Classification-only metrics`

‏Precision/Recall/Hit Rate שימושיים, אך מאבדים magnitude, path ו־time-to-outcome.

### ‏D. `Correlation-only validation`

‏`IC/Spearman` שימושי, אך אינו מספיק ל־Top1 selection, economics או execution.

### ‏E. `Full trading backtest only`

‏נחוץ בהמשך, אבל אינו תחליף ל־Prediction diagnostics מבודדים.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| ‏הרבה Horizons | ‏מגלה Edge decay | ‏יותר Metrics / multiple testing |
| ‏Top-N מלא | ‏Counterfactual חזק | ‏אחסון/חישוב גבוה יותר |
| ‏Episodes | ‏Sample count אמין יותר | ‏צריך Episode definition |
| ‏Segmentation | ‏מגלה איפה Edge נשבר | ‏סיכון ל־slice mining |
| ‏Executable labels | ‏קרוב לכלכלה אמיתית | ‏תלוי Data fidelity |
| ‏Fixed scorecard | ‏השוואה עקבית | ‏פחות גמישות ad-hoc |
| ‏Ablation | ‏מבודד marginal value | ‏יותר Runs |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏אלפי Metrics בלי Primary Metric.
- ‏ML calibration מורכב.
- ‏מאות Segments.
- ‏Feature additions אחרי כל Trade כושל.
- ‏Threshold/weight search רחב ללא registry.
- ‏Score יחיד שמערבב Prediction ו־Execution.
- ‏Win Rate בלבד.
- ‏Average Return בלבד.
- ‏Top1 בלבד.
- ‏PnL בלבד.

---

## ‏9. What to Add Later

‏רק אם Baseline יציב:

- ‏Block-bootstrap confidence intervals.
- ‏Formal rank IC dashboards.
- ‏Calibrated probability models.
- ‏Survival-style target-time models.
- ‏Regime-specific champion/challenger.
- ‏Shadow ranking on new live data.
- ‏Advanced failure clustering.
- ‏Automated drift detection.

---

## ‏10. Required Data / Evidence

‏Snapshot בסיסי:

```text
as_of_time
symbol
rank
rank_percentile
score
score_gap
rank_age
signal_age
feature_snapshot_id
scanner_version
feature_version
filter_version
score_version
universe_version
```

‏Labels:

```text
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
mfe_10s
mae_10s
mfe_30s
mae_30s
mfe_60s
mae_60s
time_to_first_profit
time_to_target_5bps
time_to_target_10bps
time_to_target_20bps
target_before_stop
```

‏כאשר Fidelity מאפשר:

```text
executable_forward_*
net_forward_*
time_to_first_executable_profit
net_mfe
net_mae
```

‏לכל Observation נשמור גם:

```text
episode_id
session bucket
liquidity bucket
activity bucket
price bucket
regime labels
```

---

## ‏11. Promotion Criteria

‏Scanner/Feature/Weight חדש מתקדם רק אם רוב התנאים הבאים מתקיימים:

1. ‏Primary Metric משתפר מול Champion/Baseline בתקופת Validation שלא שימשה לפיתוח.
2. ‏Top1 premium חיובי בצורה עקבית, לא רק Average כולל.
3. ‏Rank buckets מציגים ordering שימושי או לפחות Top buckets עדיפים בבירור על baseline.
4. ‏השיפור קיים בכמה ימים/שבועות ואינו תלוי Outlier יחיד.
5. ‏התוצאה אינה נשברת תחת threshold/weight perturbation קטן.
6. ‏Tail outcomes אינם מתדרדרים מהותית.
7. ‏Opportunity frequency אינה נחתכת בצורה שהופכת את השיפור ללא שימושי.
8. ‏כאשר Execution fidelity קיים — חלק סביר מה־Gross edge שורד ל־Executable/Net.
9. ‏ה־Experiment reproducible ומתועד.
10. ‏Complexity החדשה מצדיקה את העלות התפעולית/חישובית שלה.

---

## ‏12. Rejection Criteria

‏נפסול/נעכב Promotion כאשר:

- ‏אין שיפור מול naive/simple baseline.
- ‏#2-#10 טובים כמו #1 לאורך זמן.
- ‏אין Rank monotonicity או Top-bucket separation שימושי.
- ‏השיפור מגיע רק מיום/סמל בודד.
- ‏ה־Edge נעלם כאשר מוציאים best days/top symbols.
- ‏השיפור קיים רק ב־magic threshold צר.
- ‏ה־Result מתהפך תחת perturbation קטן.
- ‏Gross edge נעלם לחלוטין לאחר executable friction סביר.
- ‏ה־Experiment משתמש ב־leakage או mixed versions.
- ‏N האפקטיבי קטן מדי.
- ‏היתרון מתגלה רק ב־slice שנמצא לאחר חיפוש רחב ולא אושר OOS.

---

## ‏13. Metrics

### ‏Prediction

```text
forward-return curve
MFE / MAE
time_to_first_profit
time_to_target
target_before_stop
positive rate
```

### ‏Ranking

```text
Top1 premium
rank-bucket monotonicity
rank percentile lift
Spearman / IC
selection regret
future-winner recall
rank persistence
rank churn
```

### ‏Economic

```text
gross edge
executable edge
net edge
cost-to-edge ratio
opportunity frequency
```

### ‏Robustness

```text
by day/week/month
by symbol group
by regime
by hour
leave-one-group-out
best-day/top-symbol exclusion
threshold neighborhood
weight perturbation
```

### ‏Operational

```text
report reproducibility
missing label rate
invalid snapshot rate
version-mix violations
episode count
```

---

## ‏14. Failure Modes

### ‏`PnL Confounding`

‏Scanner חלש נראה טוב בגלל Exit/Execution מקרי.

### ‏`Top1 Illusion`

‏#1 נראה טוב בלי השוואה ל־#2-#10.

### ‏`Snapshot Inflation`

‏אותו Episode נספר עשרות פעמים.

### ‏`Overlapping-Label Confidence`

‏מיליוני Rows מוצגים כאילו הם Samples עצמאיים.

### ‏`Winner's Curse`

‏בחירת הקיצון מתוך אלפי Symbols תופסת Noise קיצוני.

### ‏`Late Detection`

‏ה־Scanner מזהה מהלך רק אחרי שרובו כבר התרחש.

### ‏`Slice Mining`

‏נמצא Segment “מדהים” אחרי עשרות חיתוכים.

### ‏`Threshold Cliff`

‏Performance טוב רק בנקודה צרה מאוד.

### ‏`Outlier Edge`

‏רוב התוצאה מגיעה ממספר קטן של ימים/סמלים.

### ‏`Gross/Net Confusion`

‏Prediction טוב מוצג כאילו הוא Net Tradable Edge.

### ‏`Mixed-Version Dataset`

‏Observations מגרסאות Scanner שונות מחוברים בלי Version key.

### ‏`Trade-Only Bias`

‏נבדקים רק Signals שנשלחו ל־Execution, ולכן Ranking/No-Trade/Rejected evidence נעלם.

### ‏`Research Patch Loop`

‏כל הפסד מוסיף Filter חדש בלי Hypothesis מסודרת.

---

## ‏15. User-Specific Application

‏למערכת `Short-Horizon Momentum` שלנו, השאלה הראשונית היא:

> ‏כאשר המערכת בוחרת את המובילה מתוך אלפי מניות, האם היא ממשיכה מספיק מהר אחרי רגע ההחלטה כדי להצדיק בכלל מחקר ביצוע עמוק יותר?

‏Baseline מחקרי מומלץ:

```text
Whole-market point-in-time snapshots
→ rank all eligible symbols
→ save Top20
→ label 1/2/5/10/30/60s
→ compute MFE/MAE and target times
→ compare Top1 vs Top2-5 / Top6-20 / survivors
→ compare random and momentum-only baselines
→ convert snapshots into episodes
→ segment by session/liquidity/activity
→ only then add executable/net layer
```

‏ארבעת המדדים החשובים במיוחד:

```text
Top1 Premium
Time to First Profit / Target
Signal Decay by Age
Edge at Signal → Submit → Fill
```

‏אם Top1 אינה מקבלת Premium ברור או שה־Edge מופיע רק מאוחר מדי, אין הצדקה אוטומטית להאיץ Infrastructure או Execution.

---

## ‏16. Concrete Baseline Contract

```text
scanner_validation_version
experiment_id
backtest_run_id
data_version
scanner_version
feature_version
filter_version
score_version
label_version
as_of_time
episode_id
symbol
rank
rank_percentile
score
score_gap
rank_age_ms
signal_age_ms
forward_1s
forward_2s
forward_5s
forward_10s
forward_30s
forward_60s
mfe_10s
mae_10s
mfe_30s
mae_30s
mfe_60s
mae_60s
time_to_first_profit_ms
time_to_target_5bps_ms
time_to_target_10bps_ms
time_to_target_20bps_ms
target_before_stop
session_bucket
liquidity_bucket
activity_bucket
regime_bucket
label_validity
```

‏כאשר קיימת שכבת Execution:

```text
executable_forward_*
net_forward_*
edge_at_signal
edge_at_submit
edge_at_fill
rank_at_submit
rank_at_fill
score_at_submit
score_at_fill
```

---

## ‏17. Confidence

| המלצה | Confidence |
|---|---|
| ‏Prediction/Execution separation | `HIGH` |
| ‏Top-N + Rank Buckets | `HIGH` |
| ‏Multiple forward horizons | `HIGH` |
| ‏Episodes / dependence awareness | `HIGH` |
| ‏Gross → Executable → Net separation | `HIGH` |
| ‏Top1 premium as key diagnostic | `HIGH` |
| ‏Rank persistence/churn as predictive feature | `LOW / UNPROVEN` |
| ‏Signal-age conditioning | `MEDIUM`, predictive value must be measured |
| ‏IC/Spearman as supporting metric | `MEDIUM` |
| ‏Complex calibrated probabilities | `LOW until evidence` |

---

## ‏18. Time-Sensitive Facts

‏אין במקטע הזה Baseline שתלוי ב־Broker/API/Exchange capability עכשווית.

‏המתודולוגיה סטטיסטית/מחקרית בעיקרה.

‏כאשר מוסיפים `Executable/Net` labels יש להשתמש בגרסאות ה־Cost/Execution/Data semantics המאומתות של המקטעים הרלוונטיים ולא להניח שהן קבועות בזמן.

---

## ‏19. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע זה, משום שלא נוספה טענה תפעולית תלויה־זמן.

‏Source of Truth למתודולוגיה במקטע הוא פרק 22 וה־Recommendation Sheets הקודמים של Ranking, Backtest ו־Execution.

---

## ‏20. Relationship to Later Sheets

‏המקטע הבא, 23, יקבע כיצד מונעים מה־Validation עצמו לשקר לנו דרך:

```text
Overfitting
Data Leakage
Parameter Hunting
Multiple Testing
Improper Time Splits
Survivorship Bias
```

‏לכן 22 מגדיר **מה למדוד**, ו־23 יגדיר **איך להאמין למדידה בלי להתאים את המודל לעבר**.

‏בהמשך:

- ‏24 ישתמש ב־Scorecard הזה לשיפור Features/Score באופן ניסויי.
- ‏25 יעמיק ב־Regime Stability.
- ‏26 ישתמש ב־Failure Taxonomy ל־RCA.
- ‏Replay/Shadow יחברו Prediction Evidence להתנהגות מערכתית מחוץ ל־Historical Backtest.

---

# ‏Recommendation Summary

‏ה־Baseline למערכת שלנו הוא:

```text
Point-in-Time Whole-Market Ranking
→ Save Top-N + No-Trade + Rejected Candidates
→ Build Forward Labels at 1/2/5/10/30/60s
→ Measure MFE/MAE + Time-to-Target
→ Convert repeated snapshots into Candidate Episodes
→ Compare Rank Buckets
→ Measure Top1 Premium
→ Compare Random + Naive Momentum + Champion Baselines
→ Measure Precision / Recall / Lift
→ Analyze Signal Age + Rank Persistence/Churn
→ Segment only with predefined buckets
→ Report Distribution + Tail + Concentration
→ Run Ablation and Threshold/Weight Neighborhood Tests
→ Separate Gross / Executable / Net
→ Preserve Experiment Registry + Versions
→ Promote only on reproducible out-of-sample evidence
```

‏העיקרון המרכזי:

> ‏`Ranking יפה אינו Evidence`. Evidence הוא קשר עקבי, מדיד, ניתן לשחזור ובעל משמעות כלכלית בין מה שה־Scanner ידע בזמן ההחלטה לבין מה שקרה אחר כך.

‏ואם התוצאה היא:

```text
NO EDGE
```

‏זו מסקנת מחקר תקינה — לא כישלון שצריך להסתיר.