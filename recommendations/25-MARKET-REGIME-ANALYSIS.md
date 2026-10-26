# ‏25 — Recommendation Sheet: Market Regime Analysis

> ‏מקור לימודי עיקרי: `../25-MARKET-REGIME-ANALYSIS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי שבו `Market Regime` הוא Context מדיד, point-in-time ומוסבר — לא תירוץ בדיעבד, לא Label עתידי ולא הזמנה לבנות עשרות אסטרטגיות נפרדות. קודם נשתמש ב־Context כדי להבין היכן `Prediction`, ‏`Execution` ו־`Net Economics` משתנים; רק לאחר Evidence יציב נשקול Policy תלויה־Regime.
>
> ‏המקטע ממשיך את 22–24: ‏22 הגדיר כיצד מודדים Predictive Quality, ‏23 כיצד מגינים מפני `Overfitting/Leakage`, ו־24 כיצד משפרים דרך ניסויים מבוקרים. ‏25 מוסיף את ממד ה־Context בלי לשבור את משטר ה־Evidence.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Which regime is profitable?
```

‏אלא:

```text
At decision time, what market context was actually observable,
and does that context change prediction quality,
execution quality or net economics in a stable, reproducible way?
```

‏נפריד שלוש שכבות:

```text
Prediction Regime
Execution Regime
Economic Regime
```

‏ורק אחר כך נשאל האם נדרש:

```text
same policy
stricter gate
execution adjustment
size adjustment
NO TRADE
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Regime ל־Live חייב להיות Point-in-Time

‏כל Context שמשפיע על Decision בזמן `T` חייב להיות מחושב רק ממידע שהיה ידוע עד `T`.

‏אסור להשתמש ב:

```text
full_day_return
full_day_high
full_day_low
full_day_volume
full_day_realized_volatility
final trend-day label
closing return
```

‏כאילו היו זמינים תוך־יומית.

‏ברירת המחדל:

```text
regime_feature_source_time <= decision_time
```

‏וכל Percentile/Normalization חייבים להיבנות רק מהיסטוריה שהייתה זמינה אז.

### ‏`P0 — Required`: Analysis Regime נפרד מ־Live Regime

‏מותר להשתמש ב־Post-Hoc labels כדי לגלות Hypothesis, למשל:

```text
trend day
shock day
news-driven day
```

‏אבל Label כזה אינו הופך אוטומטית ל־Live Feature.

‏אם הוא נראה מעניין, נדרש שלב תרגום:

```text
post-hoc pattern
→ real-time observable proxy
→ controlled experiment
→ OOS validation
```

### ‏`P1 — Preferred Default`: Continuous Context first, Buckets second

‏נשמור קודם ערכים רציפים, ורק מהם נגזור Buckets לצורך ניתוח.

‏Baseline context:

```text
seconds_since_open
market_return_10s
market_return_30s
market_breadth_10s
market_breadth_30s
market_activity_percentile
market_volatility_percentile
market_spread_percentile
candidate_count
rank1_rank2_gap
feed_latency_percentile
```

‏ה־Buckets הם View אנליטי; ה־Raw/continuous values הם מקור האמת.

### ‏`P1 — Preferred Default`: מעט Dimensions בהתחלה

‏נתחיל בחמישה Context dimensions מרכזיים:

```text
TIME_OF_DAY
MARKET_VOLATILITY
MARKET_ACTIVITY
MARKET_LIQUIDITY
MARKET_BREADTH
```

‏ונוסיף:

```text
CANDIDATE_DENSITY
RANK_SEPARATION
DATA_QUALITY / LATENCY
```

‏כ־scanner-specific context.

‏לא נתחיל מעשרות Labels ו־Cross-products.

### ‏`P1 — Preferred Default`: Regime קודם לניתוח, לא למסחר

‏השלב הראשון הוא:

```text
observe
segment
compare
validate
ablate
```

‏ולא:

```text
if HIGH_VOL then change everything
```

‏Policy תלויה־Regime תגיע רק לאחר Evidence.

---

## ‏3. Why

‏אותו `Score`, ‏Feature או Order Policy יכול להציג התנהגות שונה לחלוטין לפי Context.

‏דוגמאות:

- ‏מומנטום קצר יכול להיות אינפורמטיבי יותר בשוק פעיל מאשר בשוק שקט.
- ‏אותו `Gross Edge` יכול להיעלם כאשר spread/slippage מתרחבים.
- ‏Rank #1 יכול להיות משמעותי יותר כאשר `candidate_count` נמוך ו־`rank1_rank2_gap` גבוה.
- ‏Top-1 תמיד קיים, גם כאשר כל השוק זז יחד ואין Outlier אמיתי.
- ‏Latency/Data Quality יכולים להפוך “Regime טוב” ל־unsafe state.

‏לכן ממוצע יחיד על כל היום עלול להסתיר גם Opportunity וגם Failure Mode.

---

## ‏4. Use When

‏Regime Analysis מתאים כאשר רוצים להבין:

- ‏למה `Prediction Edge` חזק בתקופות מסוימות ונחלש באחרות.
- ‏למה `Net Edge` משתנה למרות שה־Gross Signal דומה.
- ‏האם `Rank Monotonicity` נשמרת בכל Context.
- ‏האם `time_to_first_profit` ו־`time_to_target` משתנים לפי מצב שוק.
- ‏האם spread, fill rate או slippage הם מקור השינוי.
- ‏האם Candidate Density או Rank Separation מסבירים Top-1 failures.
- ‏האם Policy פשוטה של `NO TRADE` במצב מסוים עדיפה על מודל מורכב יותר.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Regime Analysis כדי:

- ‏להסביר הפסד יחיד בדיעבד.
- ‏למצוא Slice קטן אחרי עשרות חיתוכים.
- ‏להשתמש ב־full-day labels בזמן החלטה תוך־יומית.
- ‏לייצר Model נפרד לכל Bucket בלי Evidence.
- ‏להחליף Risk Engine, Data Quality Gate או Execution Recheck.
- ‏להפוך Context ל־BUY/TRADE signal בפני עצמו.
- ‏להצדיק Retuning אחרי כל יום חלש.

---

## ‏6. Baseline Taxonomy

‏בשלב הראשון נשמור Context בכמה משפחות ברורות:

| Family | Baseline examples | Main question |
|---|---|---|
| `TIME` | `seconds_since_open`, session bucket | ‏האם איכות ה־Edge משתנה לאורך היום? |
| `VOLATILITY` | short realized vol, market vol percentile | ‏האם Signal/Costs משתנים עם תנודתיות? |
| `ACTIVITY` | trade-rate / dollar-volume percentile | ‏האם שוק פעיל משנה Prediction/Execution? |
| `LIQUIDITY` | market spread/depth/freshness | ‏האם ה־Edge נשחק בביצוע? |
| `BREADTH` | `% positive`, median market return | ‏האם Candidate ייחודית או חלק מגל שוק? |
| `CANDIDATE_DENSITY` | `candidate_count` | ‏כמה קשה לבחור #1 משמעותי? |
| `RANK_COMPETITION` | #1–#2 gap, score dispersion | ‏האם Winner מבודד או כמעט תיקו? |
| `DATA_QUALITY` | feed latency/gaps | ‏האם אפשר בכלל לסמוך על ההחלטה? |

---

## ‏7. Time-of-Day Baseline

‏נשמור תמיד:

```text
seconds_since_open
seconds_to_close
session
```

‏ולצורכי Report נוכל לגזור Buckets כגון:

```text
OPEN
EARLY
MIDDAY
LATE
CLOSE
```

‏אבל לא נניח מראש שהגבולות “נכונים”.

‏נבדוק גם Curve רציפה לפי דקות מאז הפתיחה.

---

## ‏8. Volatility Context

‏נפריד בין:

```text
market-wide volatility
cross-sectional dispersion
symbol volatility
```

‏כי הם מודדים דברים שונים.

‏ל־scanner cross-sectional חשוב במיוחד גם:

```text
cross_sectional_dispersion
```

‏כאשר Dispersion נמוך, Rank #1 יכול להיות Winner טכני בלבד בתוך שוק שבו כולם דומים.

---

## ‏9. Market Breadth Context

‏Baseline research features:

```text
pct_positive_10s
pct_positive_30s
median_return_10s
median_return_30s
```

‏המטרה:

```text
candidate move
vs
market-wide move
```

‏Challenger מאוחר יותר:

```text
sector breadth
sector median return
peer-relative return
```

---

## ‏10. Candidate Density

‏`candidate_count` הוא Context מרכזי עבור Scanner שבוחר Winner יחיד.

‏ננתח לפחות:

```text
candidate_count
eligible_count
candidate_rate = candidate_count / eligible_count
```

‏Hypothesis אפשרית למחקר:

> ‏ככל שיותר מניות עוברות Filters בו־זמנית, Raw Top-1 Rank עשוי להיות פחות ייחודי אלא אם Separation נשאר גבוה.

‏זו Hypothesis — לא כלל מסחר.

---

## ‏11. Rank Competition / Separation

‏נשמור:

```text
score_1
score_2
score_3
score_gap_1_2
score_gap_1_3
score_dispersion_topN
```

‏Gap גדול אינו הוכחת Edge.

‏הוא Context שצריך להיבדק מול Outcomes עתידיים.

---

## ‏12. Liquidity Regime

‏נפריד:

```text
market_liquidity_context
symbol_liquidity_state
```

‏Baseline market-wide:

```text
median_spread_bps
p75_spread_bps
quote_freshness_percentile
optional depth summary when reliable
```

‏Baseline symbol-level נשאר לפי מקטע 11.

‏Regime Analysis אינו מחליף Symbol Executability Gate.

---

## ‏13. Activity Context

‏נשמור market-wide measures כגון:

```text
market_trade_rate
market_dollar_volume_rate
market_activity_percentile
momentum_candidate_rate
```

‏המטרה היא להבין האם Candidate מופיעה בתוך Market Burst כללי או בתוך Opportunity מבודדת.

---

## ‏14. Data Quality / Latency Context

‏Data Quality אינו “עוד Feature” שמאפשר compensation.

‏מצבים כגון:

```text
FEED_GAP
SEQUENCE_GAP
PROVIDER_MISMATCH
CRITICAL_LATENCY
UNKNOWN_SOURCE_STATE
```

‏נשארים Safety/Data states.

‏הם יכולים להיכלל ב־Regime report, אך Critical state מוביל ל־Safety Gate ולא ל־Score adjustment.

---

## ‏15. Level, Change, Acceleration גם ב־Context

‏לא נשמור רק Level.

‏ל־Context מסוים יכולים להיות:

```text
volatility_level
volatility_delta
volatility_acceleration

spread_level
spread_delta

activity_level
activity_delta

breadth_level
breadth_delta
```

‏הבדלה בין `stable high` לבין `sudden shock` יכולה להיות חשובה יותר מה־Level לבדו.

---

## ‏16. Continuous First

‏ברירת המחדל היא לשמור:

```text
value
percentile
as_of_time
age_ms
status
```

‏לדוגמה:

```text
market_volatility_raw
market_volatility_percentile
```

‏ורק אחר כך:

```text
regime_vol_bucket
```

‏כך אפשר לשנות Bucket definitions בלי לאבד Raw history.

---

## ‏17. Point-in-Time Percentiles

‏Percentile היסטורי הוא תקין רק אם Reference Distribution הייתה זמינה בזמן `T`.

‏אסור:

```text
percentile = rank(value_T among full future dataset)
```

‏ברירת המחדל:

```text
reference_history_end <= T
```

‏וכל שינוי ב־lookback/reference population מקבל Version חדש.

---

## ‏18. Regime Snapshot Contract

‏בכל Decision נשמור לפחות:

```text
regime_model_version
as_of_time
context_values
context_percentiles
derived_buckets
regime_label_if_any
regime_confidence_if_any
context_status
```

‏בנוסף:

```text
candidate_count
rank1_rank2_gap
```

‏כי אלה Contexts טבעיים במיוחד למודל cross-sectional שלנו.

---

## ‏19. Regime Versioning

‏כל שינוי ב:

```text
formula
window
normalization
percentile reference
bucket threshold
hysteresis
dwell policy
```

‏יוצר `regime_model_version` חדש.

‏אין להשוות Results בין Versions בלי לציין זאת.

---

## ‏20. Performance Table by Regime

‏לכל Bucket/Segment נשמור לפחות:

```text
sample_count
episode_count
unique_days
unique_symbols
candidate_count
trade_count
hit_rate
mean_forward_return
median_forward_return
mfe
mae
time_to_first_profit
time_to_target
fill_rate
slippage
gross_edge
net_edge
```

‏נציג Distribution ולא Mean בלבד.

---

## ‏21. Prediction vs Execution Separation

‏זהו אחד החוקים החשובים במקטע.

‏לכל Regime נציג:

```text
PREDICTION
forward returns
rank monotonicity
Top1 premium
MFE/MAE
time-to-target

EXECUTION
spread
fill rate
slippage
time-to-fill
partial fills
signal-to-fill decay

ECONOMICS
gross edge
cost-to-edge
net edge
```

‏כך לא נשנה `Score` כאשר הבעיה האמיתית היא Execution.

---

## ‏22. Rank Curves by Regime

‏נבדוק האם Ranking נשאר אינפורמטיבי:

```text
Rank 1-5
Rank 6-20
Rank 21-100
```

‏ונמדוד:

```text
forward outcome by rank bucket
Top1 premium
rank monotonicity
```

‏אם כל Top-20 דומים ב־Regime מסוים, ייתכן שהבחירה המדויקת של #1 חלשה יותר באותו Context.

---

## ‏23. Horizon Curves by Regime

‏Baseline:

```text
1s
2s
5s
10s
30s
60s
```

‏נבדוק האם:

```text
edge appears sooner
edge lasts longer
edge reverses faster
```

‏לפי Context.

‏Regime יכול להשפיע על Signal Half-Life גם אם Direction זהה.

---

## ‏24. Candidate Funnel by Regime

‏נמדוד את ה־Funnel:

```text
Reference Universe
→ Data Valid
→ Tradable
→ Active
→ Momentum Candidate
→ Ranked
→ Trade Eligible
→ Trade / No Trade
```

‏לפי Regime.

‏כך אפשר להבדיל בין:

- ‏פחות Opportunities.
- ‏יותר Data rejects.
- ‏יותר spread rejects.
- ‏יותר weak-edge rejects.
- ‏יותר Execution failures.

---

## ‏25. Rejection Reasons by Regime

‏Reason Codes קיימים נשמרים, ונוסיף aggregation לפי Context.

‏לדוגמה:

```text
HIGH_VOL:
  SPREAD_TOO_WIDE = 28%
  QUOTE_STALE = 3%

NORMAL:
  SPREAD_TOO_WIDE = 7%
  QUOTE_STALE = 1%
```

‏זה מאפשר RCA בלי להמציא סיפור חדש לכל Trade.

---

## ‏26. Regime Is Not a Trade Signal

‏השרשרת נשארת:

```text
Market Context
→ Universe
→ Filters
→ Features
→ Ranking
→ Candidate Gate
→ Execution Recheck
→ Risk
```

‏`GOOD_REGIME` אינו אישור Trade.

‏`Risk Engine > regime preference`.

‏`Data Quality Gate > regime preference`.

---

## ‏27. First Promotion Target: Monitoring, not Policy

‏ה־Promotion הראשון של Regime Engine יהיה ל־Observability/RCA:

```text
collect context
report performance by context
track drift
explain weak days
```

‏ללא שינוי Trading behavior.

‏זה מאפשר לצבור Evidence בלי להכניס Complexity תפעולית מוקדם מדי.

---

## ‏28. Policy Ladder

‏כאשר Evidence מצטבר, סדר ההתקדמות המועדף:

```text
1. ANALYSIS ONLY
2. MONITORING / SHADOW RECOMMENDATION
3. SIMPLE TRADE GATE / THRESHOLD CHALLENGER
4. EXECUTION POLICY CHALLENGER
5. SIZE / EXIT CHALLENGER
6. REGIME-CONDITIONED SCORE
7. SEPARATE MODELS — only with strong evidence
```

‏כך Complexity נכנסת בהדרגה.

---

## ‏29. Preferred First Regime-Aware Experiment

‏לא נתחיל מ־Score שונה לכל Regime.

‏הניסוי הראשון המועדף הוא פשוט:

```text
Champion unchanged
vs
Champion + one regime-aware gate/threshold hypothesis
```

‏לדוגמה מחקרית בלבד:

```text
when market_spread_percentile is extreme,
require more execution headroom
```

‏או:

```text
when candidate_count is extremely high and rank gap is tiny,
raise absolute candidate-quality requirement
```

‏אבל כל Rule כזה חייב לעבור מקטע 24 במלואו.

---

## ‏30. Context Feature Before Multiple Models

‏כאשר Context אכן מוסיף Prediction value, נעדיף קודם לבדוק:

```text
single model + context feature
```

‏מול:

```text
separate model per regime
```

‏Separate Models יישקלו רק אם Feature/Outcome relationship משתנה materially ובאופן OOS יציב.

---

## ‏31. Dynamic Thresholds

‏`P2 — Challenger` בלבד.

‏Dynamic threshold עשוי להיות מוצדק כאשר:

- ‏Threshold אחיד מפספס שינוי יציב ב־Net quality.
- ‏Regime זמין בזמן אמת.
- ‏התוצאה יציבה סביב Neighborhood של threshold.
- ‏יש מספיק Samples לכל מצב.
- ‏השיפור שורד OOS ו־Shadow.

‏אחרת Threshold אחיד עדיף.

---

## ‏32. Dynamic Execution Policy

‏`P2/P3 — Challenger`.

‏Regime יכול להיבדק מול:

```text
aggressiveness
order TTL
max chase
partial-fill tolerance
acceptable execution headroom
```

‏זה רלוונטי במיוחד אם Prediction נשאר יציב אך spread/slippage/fill behavior משתנים.

---

## ‏33. Dynamic Size / Exit

‏`P3 — Advanced Challenger`.

‏אין לשנות Position Size או Exit Policy לפי Regime לפני שהוכח:

- ‏Context נמדד בזמן אמת.
- ‏Outcome relationship חוזר על עצמו.
- ‏Risk/Execution effect ברור.
- ‏Policy פשוטה יותר אינה נותנת כמעט אותה תוצאה.

---

## ‏34. Hysteresis / Dwell Time

‏אם Regime Label משמש Policy, צריך למדוד Churn.

‏נשמור:

```text
regime_transition_count
regime_dwell_time
policy_switch_count
```

‏`Hysteresis` ו־Minimum Dwell Time הם Challengers שמטרתם להפחית Flicker.

‏הם אינם Default מספרי קבוע.

---

## ‏35. Detection Latency

‏אם Regime משנה Policy, נמדוד:

```text
regime_change_time
regime_detected_time
regime_detection_latency
policy_applied_time
```

‏ב־Short Horizon, Regime שניתן לזהות רק מאוחר מדי אינו שימושי ל־Live Decision.

---

## ‏36. UNKNOWN Is First-Class

‏Regime Engine רשאי להחזיר:

```text
UNKNOWN
```

‏כאשר:

- ‏אין מספיק History.
- ‏Data stale/missing.
- ‏indicators סותרים זה את זה.
- ‏confidence נמוך.
- ‏transition אינו יציב.

‏אין forced classification.

‏Safety/Data Quality failures נשארים Safety failures, לא סתם `UNKNOWN` context.

---

## ‏37. Safe Fallback

‏אם Regime-aware Policy מקודמת בעתיד, חייבת להיות Baseline fallback ברורה.

‏ברירת המחדל:

```text
UNKNOWN regime
→ use conservative baseline policy
```

‏או `NO TRADE` כאשר חוסר הוודאות נובע מ־Data Quality קריטי.

---

## ‏38. Minimum Evidence per Regime

‏אין Promotion על סמך `row_count` בלבד.

‏נדרוש לפחות visibility של:

```text
episode_count
unique_days
unique_symbols
distinct market events
```

‏וכן uncertainty רחבה כאשר Effective Sample Size קטן.

‏מספר מינימלי קשיח אינו נקבע כאן; הוא תלוי Effect Size ותלות בין Samples.

---

## ‏39. Robustness Matrix

‏ל־Research משמעותי נבנה Matrix מוגבלת כגון:

```text
TimeOfDay × Volatility
TimeOfDay × Liquidity
Breadth × CandidateDensity
Activity × Spread
```

‏אבל לא Full Cartesian Explosion.

‏כל Matrix צריכה הצדקה, Sample diagnostics ו־predefined question.

---

## ‏40. Curse of Dimensionality Guard

‏כל Dimension חדש מגדיל Multiple Testing ו־Data sparsity.

‏לכן:

```text
few dimensions first
→ strong effect
→ replicate OOS
→ only then interaction
```

‏Cells קטנים יוצגו כ־`INSUFFICIENT_DATA`, לא כ־Winner.

---

## ‏41. Regime Contribution / Concentration

‏נמדוד:

```text
share_of_time_by_regime
share_of_opportunities_by_regime
share_of_trades_by_regime
share_of_net_outcome_by_regime
```

‏אם 5% מהזמן מסבירים 80% מהתוצאה, זו Observation חשובה שדורשת בדיקת Fragility ולא חגיגה אוטומטית.

---

## ‏42. Leave-One-Group-Out

‏לכל Regime claim מהותי נבדוק לפחות:

```text
leave-one-day-out
leave-one-symbol-out
leave-one-period-out
```

‏כאשר רלוונטי גם:

```text
leave-one-regime-episode-out
```

‏המטרה היא לזהות תלות באירוע בודד.

---

## ‏43. Drift Monitoring

‏Regime Engine עצמו עלול להזדקן.

‏ננטר:

```text
regime frequency
context distribution
transition rate
unknown rate
performance by regime
prediction by regime
execution by regime
net economics by regime
```

‏שינוי ב־frequency יכול להיות:

- ‏Market change.
- ‏Threshold aging.
- ‏Provider/data change.
- ‏Bug.

‏RCA קודם ל־retuning.

---

## ‏44. Regime as RCA Dimension

‏בכל Decision/Trade Snapshot נשמור את ה־Context כדי שאפשר יהיה לשאול:

```text
Was prediction weak?
Was ranking weak?
Was market context unfavorable?
Was execution unusually expensive?
Did context transition during order lifetime?
Was data quality degraded?
```

‏אבל Regime אינו Answer אוטומטי.

---

## ‏45. Promotion Criteria

‏Regime-aware component מתקדם מ־Analysis ל־Policy רק אם:

1. ‏ה־Regime ניתן לחישוב בזמן אמת ללא Future Data.
2. ‏הגדרה ו־Version מלאים.
3. ‏Raw values נשמרים בנוסף ל־Derived labels.
4. ‏יש מספיק Effective Samples בכמה ימים/Symbols.
5. ‏ה־Effect חוזר OOS/Walk-Forward.
6. ‏השיפור הוא ב־Net quality או Safety, לא רק Gross.
7. ‏Prediction ו־Execution attribution ברורים.
8. ‏Threshold/definition אינם Sharp Optimum שביר.
9. ‏Complexity Tax מוצדק.
10. ‏Shadow validation מאשרת behavior סביר.
11. ‏`UNKNOWN`/fallback/rollback מוגדרים.
12. ‏Regime Detection Latency מתאים ל־Horizon.

---

## ‏46. Rejection Criteria

‏נפסול או נשאיר Analysis-only כאשר:

- ‏ה־Label דורש מידע עתידי.
- ‏ה־Effect קיים רק ב־In-Sample.
- ‏הוא תלוי ביום/Symbol בודד.
- ‏אין מספיק Effective Samples.
- ‏הוא נעלם אחרי Costs.
- ‏הוא משפר Gross אך פוגע Net.
- ‏הוא דורש הרבה Policies/parameters נפרדים ללא Incremental Value ברור.
- ‏Regime churn יוצר operational instability.
- ‏Detection latency מאוחרת מדי.
- ‏Threshold קטן משנה תוצאה בצורה קיצונית.
- ‏Policy אחידה פשוטה נותנת כמעט אותה תוצאה.
- ‏ה־Regime אינו ניתן להסבר/Replay.

---

## ‏47. Metrics

### ‏Prediction

```text
forward_return_by_horizon
Top1 premium
rank monotonicity
MFE
MAE
time_to_first_profit
time_to_target
```

### ‏Execution

```text
spread_bps
fill_rate
partial_fill_rate
slippage_bps
time_to_fill
signal_to_fill_decay
```

### ‏Economics

```text
gross_edge_bps
cost_bps
net_edge_bps
cost_to_edge_ratio
opportunity_frequency
```

### ‏Regime engine

```text
frequency
transition_rate
dwell_time
unknown_rate
detection_latency
policy_switch_rate
```

### ‏Robustness

```text
unique_days
unique_symbols
episode_count
leave-one-group-out
OOS / walk-forward deltas
threshold sensitivity
```

---

## ‏48. Failure Modes

‏Failure modes מרכזיים:

- ‏Full-day leakage.
- ‏Future-aware percentile.
- ‏Post-hoc bucket mining.
- ‏Too many dimensions.
- ‏Insufficient sample per cell.
- ‏Regime label churn.
- ‏False precision from one hard threshold.
- ‏Prediction/Execution attribution confusion.
- ‏Using regime as excuse for every loss.
- ‏Multiple separate models too early.
- ‏Data-quality state treated as tradable context.
- ‏Regime drift mistaken for strategy failure.
- ‏Model drift mistaken for regime effect.
- ‏Policy switch latency longer than signal half-life.

---

## ‏49. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏Model נפרד לכל Regime.
- ‏Weights שונים לכל Regime.
- ‏Entry/Exit/Size שונים לכל Regime בו־זמנית.
- ‏Dozens of regime labels.
- ‏Complex clustering/ML regime detection.
- ‏Sector-level context לפני שיש Market-level evidence.
- ‏News/Event classification לפני המקטע הייעודי וה־data contract שלו.
- ‏Auto-switching Policy ללא Shadow.
- ‏Thresholds עם Precision מזויפת.

---

## ‏50. What to Add Later

‏לאחר Evidence:

- ‏Context-normalized features.
- ‏Market-relative / sector-relative momentum.
- ‏Transition/shock features.
- ‏Hysteresis/dwell rules.
- ‏Regime-conditioned execution policies.
- ‏Dynamic threshold challengers.
- ‏Dynamic size/exit challengers.
- ‏Separate models רק אם relationship משתנה באופן יציב.
- ‏ML regime classification רק לאחר Baseline explainable.

---

## ‏51. Required Data / Evidence

‏לכל Claim תלוי־Regime נדרש לפחות:

```text
point-in-time context snapshot
feature/rank/decision snapshot
forward labels
execution outcomes
cost outcomes
regime definition version
sample / episode counts
unique days / symbols
OOS or walk-forward evidence
```

‏Policy promotion דורשת גם Shadow evidence.

---

## ‏52. User-Specific Application

‏לרובוט שמחפש בכל רגע את המניה החזקה ביותר בשוק לזמן של שניות, שלושת Contexts החשובים במיוחד הם:

```text
candidate_count
market_breadth
rank1_rank2_gap
```

‏כי הם עוזרים לענות:

> ‏האם #1 באמת חריגה — או פשוט Winner טכני בתוך גל רחב שבו כמעט כל השוק חזק?

‏לצדם חשובים:

```text
market_activity_percentile
market_volatility_percentile
market_spread_percentile
```

‏כדי להפריד בין Predictive quality לבין Execution economics.

‏המלצה ראשונית: לשמור את כל ה־Context הזה ב־Snapshot ולנתח אותו לפני שמאפשרים לו לשנות Trading behavior.

---

## ‏53. Concrete Baseline Contract

```text
RegimeContextSnapshot
- as_of_time
- regime_model_version
- seconds_since_open
- market_return_10s
- market_return_30s
- market_breadth_10s
- market_breadth_30s
- market_activity_percentile
- market_volatility_percentile
- market_spread_percentile
- candidate_count
- eligible_count
- rank1_score
- rank2_score
- rank1_rank2_gap
- feed_latency_percentile
- context_status
- optional derived buckets
- optional regime_label
- optional regime_confidence
```

‏כל Decision Snapshot מפנה ל־Context Snapshot מדויק אחד.

---

## ‏54. Daily Regime Report

‏Baseline report יומי:

```text
Time spent by context bucket
Candidate episodes by bucket
Trade / No-Trade by bucket
Top1 predictive metrics by bucket
Gross edge by bucket
Net edge by bucket
Fill rate by bucket
Slippage by bucket
Reject reasons by bucket
Unknown/context-quality rate
```

---

## ‏55. Periodic Regime Report

‏דו"ח שבועי/חודשי יכלול:

```text
frequency drift
performance drift
unknown-rate drift
transition-rate drift
prediction-vs-execution attribution
threshold / percentile stability
champion performance by regime
```

‏כל שינוי חריג מוביל ל־RCA, לא ל־auto-retuning.

---

## ‏56. Testing Strategy

### ‏Unit tests

- ‏Full-day future data אינו נכנס ל־intraday context.
- ‏Percentile reference משתמש רק ב־past data.
- ‏Derived bucket תואם Raw value + version.
- ‏`UNKNOWN` נשמר כאשר input חסר.
- ‏Regime version משתנה כאשר definition משתנה.

### ‏Replay tests

- ‏אותם Raw Events יוצרים אותו Context Snapshot.
- ‏Context בזמן `T` אינו משתנה כאשר מוסיפים events אחרי `T`.
- ‏Transitions deterministic.

### ‏Research tests

- ‏Control ללא Regime policy זהה ל־Champion.
- ‏Treatment משנה רק planned policy.
- ‏Same opportunities / same cost model / same execution model.
- ‏Buckets דלים מסומנים insufficient ולא promoted.

---

## ‏57. Confidence

### ‏High confidence

- ‏Regime שמשפיע על Live Decision חייב להיות point-in-time.
- ‏Prediction ו־Execution חייבים להיבדק בנפרד.
- ‏Continuous values עדיפים כ־source-of-truth על labels בלבד.
- ‏יותר מדי Regime dimensions מגדילים Overfitting וסיכון sample sparsity.
- ‏Data Quality/Risk gates גוברים על Regime preference.

### ‏Medium confidence

- ‏Time-of-day, volatility, activity, liquidity ו־breadth הם Contexts ראשוניים שימושיים למחקר.
- ‏Candidate Density ו־Rank Gap הם Contexts טבעיים במיוחד לסורק cross-sectional.
- ‏Analysis-only / Shadow-first הוא מסלול promotion נכון לרובוט שלנו.

### ‏Low / Unproven

- ‏איזה Regime משפר בפועל את ה־Edge של האסטרטגיה.
- ‏האם Dynamic Thresholds טובים יותר.
- ‏האם Regime-aware Execution ישפר Net outcome.
- ‏האם Separate Models מוצדקים.
- ‏אילו Bucket boundaries אופטימליים.

---

## ‏58. Time-Sensitive Facts

‏המקטע מתודולוגי ואינו נשען על Capability משתנה של Broker/Provider.

‏כאשר בעתיד Context יישען על:

- ‏provider-specific market breadth fields,
- ‏LULD/halt feeds,
- ‏sector classifications,
- ‏news/event feeds,
- ‏depth data,

‏יש לאמת מחדש את source semantics, coverage, timestamps, latency ו־entitlements לפני Production.

---

## ‏59. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע זה.

‏ההמלצות כאן נגזרות ממתודולוגיית מחקר, point-in-time correctness ו־evidence discipline שכבר נקבעו במקטעים 20–24.

---

## ‏60. Relationship to Later Sheets

‏מקטע 25 מזין ישירות:

- ‏26 — `RCA` של Rank #1 שנכשל.
- ‏מקטעי Execution מתקדמים — attribution של spread/slippage לפי Context.
- ‏Observability/Monitoring — drift לפי Regime.
- ‏Production Safety — conservative behavior ב־unknown/stressed states.
- ‏Final Baseline — Context layer לפני Candidate/Execution policy.

‏מקטע 26 צריך להשתמש ב־`regime_snapshot` כ־RCA dimension, אך לא כ־explanation אוטומטי.

---

## ‏61. Recommendation Summary

```text
Baseline
→ capture point-in-time continuous market context
→ start with few explainable dimensions
→ store raw + percentile + derived bucket
→ analyze prediction, execution and net economics separately
→ measure candidate density and rank separation explicitly
→ keep regime analysis-only at first
→ validate OOS / walk-forward
→ promote one simple policy challenger at a time
→ shadow before production behavior changes
→ keep UNKNOWN + fallback + rollback
→ monitor regime frequency/performance drift
```

‏ההמלצה המרכזית: **Regime אינו Strategy חדשה; הוא Context layer.**

‏קודם נוכיח שהוא מסביר שינוי אמיתי ויציב ב־Prediction, ‏Execution או Net Economics. רק אחר כך ניתן לו כוח לשנות Threshold, ‏Execution, ‏Size, ‏Exit או `TRADE / NO TRADE`.
