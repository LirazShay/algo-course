# ‏14 — Recommendation Sheet: Score / Market Ranking

> ‏מקור לימודי עיקרי: `../14-SCORE-AND-MARKET-RANKING.md`.
>
> ‏מטרת הקובץ: לקבוע איך להפוך Features שכבר עברו Data/Safety/Executability filters לדירוג Cross-Sectional מדיד, ניתן להסבר וניתן להפרכה — בלי לבלבל בין `Rank #1` לבין Trade, בלי לאפשר ל־Signal חזק לפצות על Execution לא תקין, ובלי לבנות נוסחת Score מסובכת לפני שה־Baseline הפשוט הוכיח את עצמו.

---

## ‏1. Decision

‏אנחנו צריכים לענות על שתי שאלות שונות:

```text
Ranking:
Who is best among the eligible candidates now?

Trading:
Is the best candidate good enough to trade now?
```

‏מקטע 14 עוסק בשאלה הראשונה בלבד, תוך הכנה למקטע 15 שיענה על השנייה.

‏המערכת צריכה להפריד בין:

```text
Feature
Sub-Score
Score
Rank
Confidence
Eligibility
Trade / No Trade
```

‏ולאפשר לשחזר בדיעבד:

```text
why #1 was #1
how far #1 was ahead
what #2/#3 looked like
whether the ranking was stable
whether higher ranks actually produced better future executable outcomes
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Hard Gates קודמים ל־Ranking

‏Score לא נועד להציל מצב בלתי־תקין.

‏לפני דירוג מועמדות למסחר חי, כל Candidate צריכה כבר לעבור את ה־Hard Gates שהוגדרו במקטעים 07, 11 ו־12:

```text
data valid
critical state fresh
instrument tradable
not halted / status known
required execution state known
minimum executability preserved
```

‏Candidate שנכשלה ב־Hard Gate:

```text
NOT RANKED FOR TRADE
```

‏אפשר עדיין לחשב לה Research Score לצורך Shadow/Counterfactual, אבל אסור שהציון יחזיר אותה למסלול מסחר.

### ‏`P1 — Preferred Default`: Score ראשון פשוט, Cross-Sectional ו־Percentile-Based

‏גרסת המחקר הראשונה צריכה להיות פשוטה מספיק כדי להבין כל נקודה בה.

‏Baseline:

```text
raw features
→ valid eligible set at one as_of_time
→ per-feature percentile / robust rank normalization
→ simple sub-scores
→ simple fixed-weight prediction score
→ cross-sectional rank
→ Top-N snapshot
```

‏`Percentile` הוא ברירת מחדל טובה למחקר ראשוני משום שהוא:

- ‏מעמיד Features שונים על סקאלה דומה.
- ‏מתאים להשוואת כל השוק באותו רגע.
- ‏פחות תלוי ביחידות המקור.
- ‏קל להסבר ול־RCA.

‏אבל Percentile אינו מספיק בפני עצמו, משום שתמיד יהיה מקום ראשון גם ביום חלש.

### ‏`P1 — Preferred Default`: Prediction ו־Execution נשארים צירים נפרדים

‏ברירת המחדל אינה:

```text
FinalScore =
0.8 * Prediction
+ 0.2 * Execution
```

‏כאשר Execution גרוע יכול להיעלם בתוך ציון גבוה.

‏במקום זאת:

```text
Hard Execution Gates
        ↓
Prediction / Opportunity Ranking
        ↓
Top Candidates
        ↓
Fresh Execution Recheck
        ↓
Trade / No Trade
```

‏נשמור גם `ExecutionSubScore` לצורכי Research/Diagnostics אם הוא מועיל, אבל Execution קריטי אינו בר־פיצוי באמצעות Signal.

### ‏`P1 — Preferred Default`: Sub-Scores לפי משפחות ברורות

‏Baseline מומלץ:

```text
MomentumSubScore
ActivitySubScore
ConsistencySubScore
```

‏ו־Diagnostics נפרדים:

```text
ExecutionQuality
DataQuality
Confidence
```

‏לא כל אחד חייב להשתתף ב־Final Prediction Score.

‏למשל:

```text
MomentumSubScore
  return_1s percentile
  return_5s percentile
  return_10s percentile
  return_30s percentile
  return_60s percentile
  momentum_delta percentile

ActivitySubScore
  trade_rate percentile
  recent_vs_previous_activity percentile
  dollar_volume percentile when valid

ConsistencySubScore
  only promoted features with proven incremental value
```

‏Features שלא הוכחו אינם נכנסים רק כדי “למלא קטגוריה”.

### ‏`P1 — Preferred Default`: Fixed Weights כ־Baseline בלבד

‏משקלים ידניים מותרים כדי ליצור Baseline מחקרי, אך הם מוגדרים במפורש כ־`Judgment / Hypothesis`.

‏דוגמה רעיונית בלבד:

```text
PredictionScore =
    w_momentum   * MomentumSubScore
  + w_activity   * ActivitySubScore
  + w_consistency* ConsistencySubScore
```

‏המשקלים אינם Truth.

‏כל משפחת Feature וכל משקל צריכים לעבור:

```text
ablation
sensitivity analysis
out-of-sample
walk-forward
execution-adjusted evaluation
```

### ‏`P0 — Required`: Rank #1 אינו Trade

‏Ranking עונה:

```text
Who is best relative to the current eligible set?
```

‏הוא אינו עונה:

```text
Is the absolute opportunity good enough?
```

‏לכן:

```text
Rank #1
```

‏לעולם אינו גורר אוטומטית:

```text
BUY
```

‏מקטע 15 יגדיר את Candidate Gate של `TRADE / NO TRADE`.

### ‏`P1 — Preferred Default`: שמירת Absolute Values לצד Relative Rank

‏לכל Feature/Score נשמור גם:

```text
raw / absolute value
normalized value
cross-sectional percentile/rank
```

‏כך נמנע מהמלכודת:

```text
Top 1% of a weak market
!=
absolute good opportunity
```

### ‏`P1 — Preferred Default`: Top-N, לא רק Winner

‏לכל Ranking Cycle נשמור לפחות:

```text
Top 10
```

‏ובמחקר, כאשר העלות סבירה:

```text
all eligible candidates
```

‏לכל Candidate נשמור:

```text
rank
score
sub_scores
feature vector / feature snapshot reference
absolute values
normalized values
score contributions
```

‏בלי המתחרים אי אפשר לבצע Counterfactual Analysis אמין.

### ‏`P1 — Preferred Default`: Score Decomposition מלא

‏לכל רכיב משתתף:

```text
feature_id
raw_value
normalized_value
weight
contribution
sub_score
final_score
```

‏כך אפשר לענות:

```text
Why did AAA beat BBB?
```

‏במספרים ולא בניחוש.

### ‏`P1 — Preferred Default`: Deterministic Ranking

‏אותו:

```text
as_of_time
eligible set
feature versions
normalization state
score version
```

‏חייב להפיק בדיוק אותו:

```text
scores
ranks
tie-break decisions
```

‏ב־Research, Replay ו־Live.

### ‏`P1 — Preferred Default`: Tie-Break Contract מפורש

‏כאשר Scores שווים או כמעט שווים, לא משאירים סדר מקרי של DB/Hash/Threading.

‏נגדיר סדר deterministic, לדוגמה:

```text
1. higher primary score
2. higher primary-signal absolute quality
3. better validated execution-quality diagnostic
4. fresher state
5. stable symbol identifier as final deterministic fallback
```

‏ה־Tie-Break עצמו חייב להיות Versioned ונבדק שלא יוצר Bias סמוי.

---

## ‏3. Why

‏`Score` הוא מודל גם אם הוא רק נוסחה ידנית.

‏הוא מכיל:

```text
assumptions
normalization choices
weights
interactions
missing-data behavior
tie-break rules
```

‏ולכן הוא יכול להיכשל בדיוק כמו מודל ML.

‏הגישה המומלצת מגינה מפני כמה כשלים מרכזיים:

1. ‏Feature בעל יחידה גדולה שמשתלט על Score.
2. ‏Double counting של Features כמעט זהים.
3. ‏Signal חזק שמסתיר Execution גרוע.
4. ‏Winner's Curse — הקיצון מתוך אלפי Symbols הוא לפעמים Noise.
5. ‏Rank #1 ביום חלש שמאלץ עסקה גרועה.
6. ‏נוסחה שלא ניתן להסביר או לשחזר.
7. ‏שיפור In-Sample שנעלם Out-of-Sample.
8. ‏Score יפה שאינו משפר `Net Edge` לאחר ביצוע ועלויות.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏יש Universe רחב ומסונן.
- ‏Feature contracts כבר קיימים.
- ‏רוצים להשוות Candidates באותו `as_of_time`.
- ‏עדיין חשוב Explainability גבוהה.
- ‏רוצים Baseline שממנו אפשר למדוד תוספות אמיתיות.
- ‏צריך לבצע RCA של #1 מול #2/#3.
- ‏צריך לדעת האם Ranking מוסיף ערך מעבר ל־single-feature sorting.

---

## ‏5. Do Not Use When

‏אין להסתמך על Ranking כאשר:

```text
eligible set is corrupted
critical features are stale/invalid
as_of times are inconsistent
normalization population is incomplete/unknown
feature versions are mixed unintentionally
score version is unknown
```

‏במצבים כאלה:

```text
RANKING_STATE = INVALID
```

‏ולא פותחים Position חדשה על סמך הדירוג.

---

## ‏6. Alternatives

### ‏Alternative A — Single-Feature Rank

```text
rank by return_10s
```

‏זהו Baseline חשוב מאוד.

‏כל Score מורכב חייב לנצח אותו במחקר רלוונטי.

### ‏Alternative B — Weighted Percentile Score

‏ברירת המחדל המומלצת למחקר ראשוני.

### ‏Alternative C — Rank Aggregation

‏למשל שילוב דירוגים של כמה משפחות במקום Values מנורמלים.

‏יכול להיות Robust, אבל עדיין דורש Evidence.

### ‏Alternative D — Lexicographic Ranking

‏לדוגמה:

```text
primary signal quality
→ then activity
→ then execution-quality diagnostic
```

‏מתאים כאשר חשוב למנוע Trade-Off שרירותי בין צירים.

### ‏Alternative E — Prediction Score + Execution Gate

‏זו למעשה הארכיטקטורה המומלצת כרגע.

### ‏Alternative F — Expected Net Edge Ranking

```text
expected gross outcome
- expected entry cost
- expected exit cost
- fees
- slippage / fill risk
```

‏זה יעד עתידי חזק, אבל דורש מודלי Prediction ו־Execution אמינים יותר.

### ‏Alternative G — Probability / EV Model

‏למשל:

```text
P(target_before_stop)
Expected Net PnL
```

‏רק אם Calibration אמיתי תומך בפרשנות הזאת.

### ‏Alternative H — Learning to Rank / ML

‏`P3/P4` בלבד לאחר Baseline חזק, Labels אמינים ו־Walk-Forward תקין.

---

## ‏7. Trade-offs

### ‏Percentile

‏יתרונות:

- ‏פשוט.
- ‏Robust יחסית ליחידות שונות.
- ‏טבעי ל־Cross-Sectional ranking.

‏חסרונות:

- ‏מאבד חלק מהמרחק המוחלט.
- ‏תמיד מייצר Leader.
- ‏יכול להשתנות עם composition של ה־Universe.

### ‏Weighted Score

‏יתרונות:

- ‏קל להסבר.
- ‏קל לבצע Ablation.
- ‏מהיר ל־Live.

‏חסרונות:

- ‏המשקלים הם Parameters שקל לבצע להם Overfit.
- ‏Interaction לא־ליניארי עלול להיעלם.

### ‏Lexicographic

‏יתרונות:

- ‏שומר היררכיית החלטות ברורה.
- ‏מונע compensation לא רצוי.

‏חסרונות:

- ‏רגיש להגדרת “קרבה”.
- ‏עלול להתעלם מפשרה אמיתית בין צירים.

### ‏Expected Net Edge

‏יתרונות:

- ‏קרוב ליעד הכלכלי האמיתי.

‏חסרונות:

- ‏טעות באחד ממודלי המשנה מזהמת את כל התוצאה.
- ‏קשה יותר ל־Calibration ו־RCA.

---

## ‏8. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏50+ Features ב־Score.
- ‏Dynamic weights לפי כל שעה/מניה.
- ‏Auto-tuning Live.
- ‏Deep Learning.
- ‏Learning-to-Rank מתקדם.
- ‏Score שונה לכל Symbol.
- ‏עשרות Piecewise exceptions.
- ‏Execution cost בתוך Score אם הוא מאפשר compensation למצבי execution בלתי־קבילים.
- ‏Hysteresis לפני שמדדנו Rank Churn.
- ‏Score velocity/acceleration לפני שה־Score הבסיסי עצמו הוכח.
- ‏Confidence number שרירותי שמתחזה להסתברות.

‏נמנע במיוחד מ־`Score Spaghetti`:

```text
many bonuses
many penalties
many exceptions
no clear causal/research story
```

---

## ‏9. What to Add Later

‏בסדר עדיפות משוער:

1. ‏`Separation Gap` כ־research feature.
2. ‏`Rank Persistence` / `Top-K dwell time`.
3. ‏`Rank Churn` ו־candidate stability.
4. ‏`Score Velocity` אם יש incremental value.
5. ‏Robust cross-sectional normalization alternatives.
6. ‏Market/Session-aware calibration.
7. ‏Prediction horizon-specific scores.
8. ‏Confidence model.
9. ‏Expected Net Edge ranking.
10. ‏Lexicographic/Pareto alternatives.
11. ‏ML / Learning-to-Rank.
12. ‏Dynamic weights רק לאחר Evidence עקבי לפי Regime.
13. ‏Capital-efficiency / edge-per-unit-time objectives לאחר Risk integration.

---

## ‏10. Required Data / Evidence

‏לכל Ranking observation נשמור לפחות:

```text
decision_id
ranking_time
as_of_time
universe_version
universe_size
eligible_count
feature_set_version
filter_set_version
score_version
normalization_version
normalization_population_id
```

‏ולכל Candidate ב־Top-N:

```text
symbol
rank
raw_features
normalized_features
sub_scores
final_score
score_contributions
feature validity states
signal_age_ms
quote_age_ms
absolute signal values
```

‏ל־Leader נשמור גם:

```text
score_rank_2
score_rank_5
gap_1_2
gap_1_5
gap_1_top10_median
```

‏ולמחקר עתידי:

```text
rank_persistence
rank1_changes_per_minute
score_change
```

‏Labels:

```text
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
forward_return_30s
forward_return_60s
MFE
MAE
time_to_first_executable_profit
time_to_target
estimated_executable_return
realized_net_outcome when traded
```

‏חשוב לשמור Labels גם ל־#2/#3/Top-N, לא רק ל־Winner.

---

## ‏11. Promotion Criteria

‏Score/Ranking חדש יכול להחליף Baseline רק אם הוא מוכיח לפחות:

### ‏Ranking Quality

```text
higher score buckets
→ better future outcome buckets
```

‏או:

```text
higher rank
→ better future executable outcome
```

‏בצורה יציבה מספיק.

### ‏Top-1 Value

‏`Top 1` צריך להיות טוב יותר באופן עקבי מ־:

```text
Top 2
Top 5 average
Top 10 average
simple baseline rank
random eligible candidate
```

### ‏Execution-Adjusted Value

‏השיפור נשאר לאחר:

```text
spread
slippage
fees
fill probability / no-fill opportunity cost
latency
```

### ‏Robustness

‏השיפור שורד:

```text
out-of-sample
walk-forward
different days
different volatility regimes
different time-of-day buckets
different price/liquidity buckets
```

### ‏Ablation

‏כל Feature family חדשה מוסיפה incremental value מעבר למודל בלעדיה.

### ‏Sensitivity

‏אין תלות בנקודת משקל קסומה אחת.

‏נעדיף `robust region` של Parameters.

### ‏Operational Fit

‏ה־Score:

- ‏דטרמיניסטי.
- ‏מספיק מהיר.
- ‏ניתן ל־Replay.
- ‏Observable.
- ‏ניתן להסבר.
- ‏אינו מפר את latency budget.

---

## ‏12. Rejection Criteria

‏נדחה Score/Ranking change אם מתקיים אחד מאלה:

- ‏Top-1 אינו טוב יותר מה־Baseline.
- ‏Score buckets אינם מציגים ordering שימושי של outcome.
- ‏השיפור נובע מ־Outlier קטן.
- ‏השיפור נעלם אחרי עלויות.
- ‏השיפור נעלם Out-of-Sample.
- ‏משקל מדויק מאוד הוא הנקודה היחידה שעובדת.
- ‏Feature אחד משוכפל/נספר פעמיים במספר שמות.
- ‏Score תלוי ב־Leakage.
- ‏Missing data semantics שונות בין Research ו־Live.
- ‏Normalization אינו reproducible.
- ‏Ranking תלוי בסדר עיבוד לא deterministic.
- ‏Complexity עלתה ללא שיפור Net Outcome.
- ‏Rank Churn גדל משמעותית ללא שיפור Edge.
- ‏ה־Score מגדיל Trade Frequency אבל מוריד איכות נטו.

---

## ‏13. Metrics

### ‏Primary Ranking Metrics

```text
Top-1 executable forward outcome
Top-1 vs Top-5 delta
Top-1 vs Top-10 delta
rank-bucket outcome curve
score-bucket outcome curve
Spearman rank correlation / Rank IC
```

‏`Rank IC` אינו חובה במוצר הראשון, אבל הוא Metric מחקרי שימושי.

### ‏Economic Metrics

```text
expected net edge by rank
net PnL after all costs
net opportunity value per hour/day
opportunity capture rate
```

### ‏Fast-Horizon Metrics

```text
P(first executable profit <= 1s)
P(first executable profit <= 2s)
P(first executable profit <= 5s)
P(first executable profit <= 10s)
time_to_target
MFE / MAE by rank
```

### ‏Separation / Stability

```text
gap_1_2
gap_1_5
rank persistence
rank1_changes_per_minute
Top-K churn
```

### ‏Distribution / Calibration

```text
score distribution
score bucket count
score compression
missing/invalid rate by component
outcome by score bucket
```

### ‏Operational

```text
ranking_compute_ms P50/P95/P99
eligible_count
Top-N generation latency
replay mismatch count
determinism failures
```

---

## ‏14. Failure Modes

### ‏`Rank #1 = Trade`

‏המערכת מכריחה עסקה בכל Cycle.

‏תיקון:

```text
Ranking != Candidate Gate
```

### ‏Winner's Curse

‏הקיצון מתוך אלפי Symbols הוא בעיקר Noise.

‏סימנים:

- ‏Leader מתחלף מהר מאוד.
- ‏אין Separation.
- ‏Top-1 אינו טוב מ־Top-5.

### ‏Score Compensation Failure

‏Momentum קיצוני מפצה על Execution גרוע.

‏תיקון:

```text
critical execution remains a gate
```

### ‏Double Counting

‏למשל:

```text
return_10s
velocity_10s = return_10s / 10
```

‏מקבלים משקל כאילו הם Signals שונים.

### ‏Normalization Drift

‏אותה נוסחה מקבלת משמעות אחרת בגלל Population/Universe/Regime שונה.

### ‏Score Compression

‏כל Candidates באזור צר, והפרשי Rank הופכים כמעט מקריים.

### ‏Score Explosion

‏Outlier אחד שולט בסקאלה.

### ‏Rank Churn

‏המוביל מתחלף בקצב גבוה מדי ביחס ל־execution latency.

### ‏Hysteresis Trap

‏נשארים עם Candidate ישנה כי threshold להחלפה קשוח מדי.

### ‏Missing Data Compensation

‏Feature חסר מקבל ערך default שמעלה בטעות Candidate.

### ‏Overfitted Weights

‏מודל עובד רק ב־parameter point מדויק.

### ‏Single-Trade Patching

‏כל Loss מוליד עוד Rule/Weight.

### ‏Research / Live Skew

‏Normalization population או Feature timing שונים בין Backtest ל־Live.

---

## ‏15. User-Specific Application

‏לרובוט `Short-Horizon Momentum` שלנו, ה־flow המומלץ כרגע הוא:

```text
BASE UNIVERSE
    ↓
P0/P1 FILTERS
    ↓
FAST FEATURE VECTOR
    ↓
PERCENTILE NORMALIZATION @ common as_of_time
    ↓
MomentumSubScore
ActivitySubScore
ConsistencySubScore (only promoted features)
    ↓
PredictionScore
    ↓
Cross-sectional Rank
    ↓
Top-N retained
    ↓
Deep observation for shortlisted candidates
    ↓
Candidate Gate (segment 15)
    ↓
Fresh Execution Recheck
    ↓
TRADE / NO TRADE
```

‏ה־Baseline אינו מנסה לנבא “המניה הכי טובה היום”.

‏הוא מנסה לזהות:

> ‏איזו Candidate, מתוך המועמדות התקינות עכשיו, נראית עדיפה יחסית עבור Outcome קצר מאוד שעדיין ניתן למימוש אחרי Execution.

---

## ‏16. Concrete Baseline Contract

### ‏Input population

```text
all candidates that passed current hard filters
same logical ranking as_of_time
compatible feature versions
valid normalization inputs
```

### ‏Normalization

```text
cross-sectional percentile per promoted feature
```

‏Tie handling חייב להיות deterministic.

### ‏Sub-Scores

```text
MomentumSubScore
ActivitySubScore
ConsistencySubScore only when evidence exists
```

### ‏Prediction Score

```text
simple weighted combination
weights fixed by score_version
```

### ‏Not inside compensating Score

```text
halt / tradability
critical freshness
critical execution viability
account/broker safety
position reconciliation
```

### ‏Output

```text
rank
prediction_score
sub_scores
score decomposition
Top-N
separation diagnostics
confidence diagnostics
```

### ‏Decision boundary

```text
Rank #1 only identifies the leader.
It does not authorize an order.
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Score ו־Rank הם מושגים שונים.
- ‏Features ביחידות שונות דורשים normalization/transform לפני aggregation.
- ‏Top-1 צריך להיבדק מול Top-N ולא רק בפני עצמו.
- ‏Score צריך להיות reproducible, versioned ו־decomposable.
- ‏Hard execution/safety states לא צריכים להיות ברי־פיצוי ב־weighted score.
- ‏Out-of-sample / walk-forward / ablation חשובים יותר מ־In-Sample score יפה.

### ‏Medium Confidence

- ‏Percentile normalization היא ברירת המחדל הטובה ביותר למחקר הראשוני שלנו.
- ‏Momentum + Activity + promoted Consistency הוא baseline טוב ל־Prediction Score.
- ‏Top-10 retention הוא איזון סביר בין observability/storage לבין מחקר counterfactual.

### ‏Low / Evidence Required

- ‏המשקלים המדויקים.
- ‏Separation כמנבא חזק.
- ‏Rank persistence כ־entry confirmation.
- ‏Score velocity/acceleration.
- ‏Dynamic weights.
- ‏Expected Net Edge model.
- ‏Learning-to-Rank / ML.

---

## ‏18. Time-Sensitive Facts

‏המקטע הזה הוא בעיקר Methodology ואינו תלוי ב־Broker/Venue/API ספציפיים.

‏לכן אין Fact חיצוני תפעולי חדש שחייב Web verification כדי לקבע את ההמלצה.

‏עם זאת, כל Feature/Execution component שתלוי ב־Feed, Venue או Broker ממשיך לרשת את חובת ה־re-verification מהמקטעים 02–06 ו־11–13.

---

## ‏19. Current Verification Snapshot

‏נכון ל־2026-10-26:

- ‏לא בוצע Web verification נוסף במקטע 14 משום שהחלטות המקטע מתודולוגיות.
- ‏המקור האופרטיבי למקטע הוא פרק 14 בקורס והחוזים שכבר נקבעו במקטעים 05–13.
- ‏אין במקטע הזה Hard-Coded capability של ספק חיצוני.

---

## ‏20. Relationship to Later Sheets

### ‏מקטע 15 — Top Candidate / Trade No Trade

‏ייקח את:

```text
Rank #1
absolute quality
confidence
separation
signal age
execution readiness
```

‏ויחליט האם יש בכלל Trade.

### ‏מקטע 16 — Entry

‏יקבל רק Candidate שכבר עברה Candidate Gate.

### ‏מקטע 18 — Costs

‏יחזק את המעבר מ־Prediction Score לכיוון `Expected Net Edge`.

### ‏מקטעים 20–24

‏יבדקו:

```text
backtest realism
rank predictive validity
overfitting
experiments
score improvement
```

### ‏מקטע 25 — Regime Analysis

‏יכריע האם יש הצדקה ל־Regime-aware score/weights.

### ‏מקטעים מאוחרים יותר

‏יכולים לקדם:

```text
expected-value ranking
confidence models
learning-to-rank
feature retirement
production drift monitoring
```

---

## ‏Recommendation Summary

‏המלצת ה־Baseline למקטע 14:

```text
Hard Gates first
→ small promoted feature set
→ cross-sectional percentile normalization
→ simple role-aware sub-scores
→ simple fixed-weight PredictionScore
→ deterministic cross-sectional ranking
→ retain Top-N + full decomposition
→ measure Top-1 vs Top-N
→ Candidate Gate later
→ fresh execution recheck
```

‏לא נבנה Score “חכם” ככל האפשר.

‏נבנה Score **פשוט ככל האפשר, אבל מספיק חזק כדי להוכיח ש־Rank גבוה יותר באמת מוביל ל־future executable outcome טוב יותר**.

‏ורק אז נוסיף Separation, Stability, Confidence, Regime awareness, Expected Net Edge או ML.
