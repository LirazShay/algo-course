# ‏65 — Recommendation Sheet: Classic Indicators

> ‏מקור לימודי עיקרי: `../65-CLASSIC-INDICATORS.md`.
>
> ‏מטרת הקובץ: להכריע כיצד להשתמש ב־Classic Indicators בתוך מערכת `Short-Horizon Momentum` שלנו. ברירת המחדל אינה להתייחס ל־RSI, ‏MACD, ‏Bollinger, ‏ATR, ‏VWAP או Indicators אחרים כאל “איתותי קנייה/מכירה”, אלא כ־Feature Templates שצריכים להוכיח מידע אינקרמנטלי, התאמה ל־horizon, parity בין Research ל־Online, וערך כלכלי לאחר latency, execution ועלויות.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה לבצע מסחר אמיתי ואינו מניח ש־Indicator כלשהו מייצר Edge.

---

## ‏1. Decision

‏ההחלטה אינה:

```text
Which classic indicator should we trade?
```

‏אלא:

```text
Does a mathematically understood indicator representation
add incremental, causal, timely and executable information
beyond our simpler existing features?
```

‏ה־Baseline:

```text
Raw Market Data
→ Canonical State
→ Simple Core Features
→ Indicator Candidate as Challenger
→ Formula / Timing Verification
→ Redundancy Check
→ Incremental OOS Test
→ Decision-Impact Test
→ Execution / Cost / Latency Test
→ Shadow Evaluation
→ Promote or Reject
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Indicator הוא Feature Candidate, לא Trade Rule

‏לא:

```text
RSI > 70 => SELL
MACD cross => BUY
Price above VWAP => BUY
```

‏אלא:

```text
IndicatorValue
+ Freshness
+ Readiness
+ Context
+ Incremental Evidence
→ possible input to decision system
```

‏כל Indicator עדיין חייב לעבור:

```text
Ranking
→ Negative Evidence
→ Freshness
→ Executability
→ Risk
→ TRADE / NO_TRADE
```

### ‏`P0 — Required`: Simple Core Features נשארים Champion

‏ברירת המחדל לרובוט שלנו נשארת:

```text
multi-horizon returns
activity / trade rate
short-horizon variability
spread / liquidity
order-flow evidence
freshness
rank persistence
negative evidence
execution feasibility
```

‏Classic Indicators ייכנסו תחילה כ־`Challenger Features`, לא כתחליף אוטומטי ל־core.

### ‏`P0 — Required`: כל Indicator מפורק למשמעות מתמטית

‏לפני ניסוי נכתוב:

```text
What raw inputs does it use?
What transformation does it apply?
What does it smooth or discard?
What lag does it introduce?
What simpler feature may already represent the same concept?
```

### ‏`P0 — Required`: לא סופרים שמות שונים כ־Evidence עצמאי

‏למשל:

```text
RSI
Stochastic
Williams %R
ROC
MACD
```

‏יכולים להיות במידה רבה transformations שונים של אותו price path.

‏לכן `Indicator Count` אינו `Evidence Count`.

---

## ‏3. Why

‏ה־horizon שלנו קצר מאוד. ב־milliseconds/seconds/tens-of-seconds, Indicator עם smoothing כבד יכול להיות מדויק סטטיסטית אך מאוחר כלכלית.

‏השאלה המרכזית:

```text
IndicatorLag / SignalHalfLife
```

‏אם היחס גדול מדי, ה־Feature אינו מתאים ל־Fast Path גם אם הוא נראה “נקי” יותר ב־chart.

---

## ‏4. Indicator Families במקום שמות

‏נארגן Candidates לפי family:

```text
Trend / Smoothed Level
Momentum
Directional Persistence
Range / Volatility
Position-in-Range
Volume / Activity
Benchmark Distance
Breakout / Level
Regime / Context
```

‏כך קל יותר לזהות redundancy ולהשוות representation פשוט מול classical implementation.

---

## ‏5. Family Recommendation Matrix

| Family | Classic examples | Baseline recommendation | Priority |
|---|---|---|---:|
| Trend / smoothed level | `SMA`, `EMA`, `WMA` | ‏להעדיף EWMA/decay מותאם ל־measured horizon; לא להשתמש ב־cross כ־rule אוטומטי | `P1/P2` |
| Momentum | `ROC`, `MACD` | ‏`ROC` כמעט חופף ל־multi-horizon returns; MACD הוא Challenger רק אם מוסיף מעבר ל־velocity/acceleration | `P1/P2` |
| Directional persistence | `RSI` | ‏לחקור representation של positive-vs-negative movement; thresholds קלאסיים אינם baseline | `P2` |
| Position in range | `Stochastic`, `Williams %R` | ‏להעדיף `PositionWithinRecentRange` פשוט ומנורמל | `P2` |
| Range / volatility | `ATR`, `Bollinger Bands` | ‏הרעיון שימושי ל־normalization/context; להתאים ל־short horizon במקום periods קלאסיים | `P1/P2` |
| Benchmark distance | `VWAP` | ‏שימוש אפשרי כ־context/benchmark רק עם anchor/window מפורשים | `P2` |
| Volume / activity | `RVOL`, volume MA, `MFI`, `OBV` | ‏להעדיף activity/flow ישירים; `RVOL` מותאם time-of-day הוא Challenger רציני יותר | `P1/P2` |
| Breakout / levels | `Donchian`, pivots | ‏להעדיף distance-to-recent-high/low + breakout quality + failed-breakout memory | `P1/P2` |
| Slow trend context | `ADX`, `Supertrend`, `Ichimoku` | ‏לא Fast-Path baseline; לכל היותר regime/context Challenger | `P3/P4` |
| Trailing logic | `Parabolic SAR` | ‏השראה ל־exit research בלבד; לא ברירת מחדל | `P3` |

---

## ‏6. Moving Averages

### ‏Recommended Default

‏אם צריך smoothing:

```text
EWMA / EMA-like state
with decay chosen from the phenomenon horizon
```

‏ולא:

```text
EMA(14) because 14 is conventional
```

### ‏Use When

- ‏צריך baseline מקומי יציב.
- ‏צריך להסיר חלק מה־micro-noise.
- ‏ה־lag קטן יחסית ל־signal half-life.
- ‏ה־decay ניתן להסבר ונבדק OOS.

### ‏Do Not Use When

- ‏ה־signal קצר מה־smoothing lag.
- ‏ה־MA רק משכפל multi-horizon returns שכבר קיימים.
- ‏Cross משמש rule שרירותי ללא incremental evidence.

---

## ‏7. MACD

‏נפרק אותו ל־:

```text
fast smoothed trend
-
slow smoothed trend
```

‏ול־Histogram כ־difference נוסף מול smoothed signal line.

‏ה־Preferred Default הוא לבדוק קודם:

```text
return_short
return_medium
velocity
acceleration
short_minus_medium_momentum
```

‏ורק אם MACD-like smoothing מוסיף OOS value לאחר lag — לקדם אותו.

---

## ‏8. RSI

‏RSI ייבחן כ־:

```text
NormalizedDirectionalPersistence
```

‏ולא כ־`overbought/oversold` rule.

‏לא נקבע מראש:

```text
70 = bearish
30 = bullish
```

‏Thresholds, אם בכלל, יגיעו מ־conditional empirical distributions.

---

## ‏9. Stochastic / Williams %R

‏נעדיף representation ישיר:

```text
PositionWithinRecentRange
```

‏מאחר ש־Stochastic ו־Williams %R קרובים מאוד מתמטית, לא נתייחס אליהם כשני מקורות Evidence עצמאיים.

---

## ‏10. Bollinger Concept

‏הרעיון המעניין יותר מן ה־bands עצמם:

```text
DistanceFromRecentMean / RecentDispersion
```

‏זה Candidate ל־standardized deviation.

‏Breakout מעל band אינו Trade signal בפני עצמו.

‏`BandWidth` יכול להיות Candidate ל־compression/expansion context אם הוא מוסיף מידע מעבר ל־short-horizon variability שכבר קיימת.

---

## ‏11. ATR Concept

‏ATR אינו directional.

‏אצלנו הערך העיקרי הוא רעיון ה־local movement scale:

```text
Move / LocalRangeScale
```

‏ב־Fast Path נעדיף short-horizon/event-aware range scale על פני bar-based ATR איטי אם הוא נותן semantics טובים יותר.

---

## ‏12. VWAP

‏`VWAP` חייב להיות מזוהה במפורש:

```text
SessionVWAP
RollingVWAP
AnchoredVWAP
```

‏Candidate features אפשריים:

```text
DistanceFromVWAP
VWAPSlope
TimeAboveVWAP
CrossingFrequency
```

‏אבל VWAP אינו “fair value” אוטומטי ואינו מבטיח mean reversion.

‏Anchor שנבחר בדיעבד אסור.

---

## ‏13. RVOL / Activity Normalization

‏מבין משפחת volume indicators, רעיון בעל התאמה טובה יחסית למערכת שלנו הוא:

```text
CurrentShortHorizonActivity
/
ExpectedActivityForComparableContext
```

‏ה־denominator צריך להיות context-aware, למשל:

```text
same minute-of-session
similar horizon
relevant liquidity/regime bucket
```

‏לא ממוצע יומי גס.

---

## ‏14. OBV / MFI / CMF / A-D

‏אלה אינם baseline ל־Fast Path שלנו.

‏הסיבה:

- ‏bar aggregation מאבד event ordering.
- ‏signing coarse.
- ‏trade-level flow יכול להיות ישיר יותר.
- ‏קיימת redundancy גבוהה מול price + volume features.

‏הם יכולים להישאר `P3 Challenger` רק אם ניסוי ספציפי מצדיק.

---

## ‏15. Donchian / Breakout Concepts

‏נעדיף features פשוטים:

```text
DistanceToRecentHigh
DistanceToRecentLow
RecentHighAge
RecentLowAge
BreakoutSpeed
BreakoutFollowThrough
FailedBreakoutCount
```

‏Breakout איכותי ייבחן גם מול:

```text
activity
flow
spread
liquidity
follow-through
giveback
```

---

## ‏16. ADX / Supertrend / Ichimoku

‏ב־short horizon הם אינם baseline trigger.

‏אם ייבדקו, תפקידם המועדף הוא:

```text
slow context / regime classifier
```

‏ולא:

```text
entry now because indicator changed state
```

‏כל transition חייב להיות causal, versioned ו־point-in-time correct.

---

## ‏17. Exit Indicators

‏Indicator שנבדק ל־Entry אינו promoted אוטומטית ל־Exit.

‏ל־Exit objective שונה:

```text
preserve remaining edge
reduce giveback
flatten reliably
```

‏ברירת המחדל שלנו תעדיף קודם Evidence ישיר יותר:

```text
price response failure
flow reversal
spread deterioration
rank collapse
veto activation
time-to-target failure
```

‏לפני המתנה ל־slow oscillator reversal.

---

## ‏18. Bars vs Event Time

‏`RSI(14)` אינו specification שלם.

‏צריך לדעת:

```text
14 what?
14 seconds?
14 trades?
14 volume bars?
14 minutes?
```

‏Bar construction הוא חלק מה־Feature definition.

‏ל־Fast Path נעדיף event-time or explicitly defined short-horizon state כאשר הדבר מפחית aliasing ו־bar-close delay.

---

## ‏19. Current Bar vs Finalized Bar

‏Feature live על bar פתוח שונה מהערך הסופי ההיסטורי שלו.

‏לכן לכל bar-based Indicator נגדיר:

```text
LIVE_EVOLVING
or
FINALIZED_ONLY
```

‏Backtest חייב להשתמש באותם semantics.

---

## ‏20. Multi-Timeframe

‏שילוב slow context + fast trigger יכול להיות שימושי:

```text
SlowRegimeContext
+
FastEventDrivenEvidence
```

‏אבל bar ארוך אינו זמין לפני שהסתיים.

‏Multi-timeframe alignment חייב להיות point-in-time correct.

---

## ‏21. Warm-Up / Readiness

‏לכל Indicator:

```text
NOT_READY
WARMING
READY
INVALID
```

‏Missing history אינו `0` ואינו neutral.

‏לאחר restart/reconnect/provider generation change ייתכן צורך ב־rewarm או recompute.

---

## ‏22. Feature Card — חובה לכל Indicator Candidate

```text
Name
Family
FormulaVersion
Inputs
Sampling / Bar Semantics
Horizon
Warmup
UpdateMode
ExpectedMechanism
ExpectedLag
Normalization
FreshnessContract
ReadinessState
FailureModes
RedundantWith
PrimaryMetric
DecisionImpactMetric
PromotionCriteria
RejectionCriteria
```

---

## ‏23. Formula Verification

‏Library name אינו specification.

‏Libraries שונות עשויות להבדיל ב־:

```text
initialization
smoothing
warmup
missing-data handling
current-bar semantics
```

‏לכן נשמור `Golden Vectors` לכל implementation promoted.

---

## ‏24. Online / Offline Parity

‏אותו event stream + אותה feature version חייבים לתת אותה תוצאה ב־:

```text
Research
Replay
Shadow
Online calculation
```

‏פער הוא `Parity Failure` עד הסבר.

---

## ‏25. Incremental Computation

‏ב־broad-universe scanner נעדיף rolling/incremental update כאשר אפשר.

‏Feature חדש לא יאושר ל־Fast Path בלי למדוד:

```text
CPU
memory
allocation pressure
update latency
queue impact
```

‏Predictive value שמגדיל Decision Age יותר משהוא מוסיף Edge הוא net negative.

---

## ‏26. Redundancy Gate

‏לפני ניסוי מתקדם נבדוק:

```text
Pearson / robust correlation when useful
rank correlation
conditional correlation
decision overlap
ablation impact
```

‏אם Indicator כמעט זהה ל־simple feature:

```text
Prefer simpler representation
```

‏אלא אם יש יתרון ברור ב־robustness, normalization או decision impact.

---

## ‏27. Incremental Evidence Gate

‏השאלה המרכזית:

```text
Does this indicator improve outcomes
conditional on our existing feature set?
```

‏לא:

```text
Does it correlate with future return in isolation?
```

---

## ‏28. Decision Impact

‏לכל Challenger נמדוד:

```text
How many candidate decisions changed?
How many TRADE / NO_TRADE decisions changed?
Which symbols/regimes changed?
Did changed decisions improve net executable outcome?
Did it mostly add trades or remove weak trades?
```

‏Feature שאינו משנה החלטה שימושית אינו מקבל Priority רק כי correlation שלו מעניין.

---

## ‏29. Orthogonal Evidence Preferred

‏עדיף stack שמחבר מקורות שונים:

```text
price momentum
+ activity
+ liquidity/executability
+ flow
+ freshness
+ negative evidence
```

‏מאשר stack של חמישה oscillators מאותו close series.

---

## ‏30. Threshold Policy

‏Threshold קלאסי אינו חוק טבע.

‏לא נאמץ אוטומטית:

```text
RSI 70/30
MACD zero-cross
Bollinger 2σ
ADX 25
```

‏Threshold חדש חייב לעבור:

```text
parameter neighborhood
OOS
regime analysis
multiple-testing discipline
execution-aware validation
```

---

## ‏31. Parameter Policy

‏נעדיף plateau:

```text
nearby settings behave similarly
```

‏על פני spike:

```text
one exact period / threshold works
neighbors fail
```

‏Spike הוא fragility warning.

---

## ‏32. Normalization

‏Cross-sectional comparison עשויה להשתמש ב־:

```text
percentile
robust z-like normalization
volatility normalization
spread normalization
liquidity bucket normalization
```

‏אך normalization חייב להיות point-in-time ולהשתמש רק ב־eligible/fresh population המתאימה להגדרה.

---

## ‏33. Freshness Contract

‏לכל Indicator נשמור לפחות:

```text
UnderlyingDataAge
ComputedAt
DataGeneration
FeatureVersion
Readiness
```

‏Composite feature אינו valid אם inputs שלו מגיעים מ־generations לא קוהרנטיים.

---

## ‏34. Leakage Controls

‏נבדוק במיוחד:

```text
bar close availability
current-bar evolution
multi-timeframe alignment
future-normalized percentiles
revised/backfilled data
corporate-action handling
historical universe membership
anchor selection
```

---

## ‏35. Regime Analysis

‏Indicator יכול להיות חיובי רק ב־subset של תנאים.

‏נחתוך לפי:

```text
trend / chop
volatility
liquidity
spread
activity
time of day
symbol bucket
```

‏Regime-conditioned use הוא `P3` עד שיש Evidence חזק ו־regime detection אמין בזמן אמת.

---

## ‏36. Primary Metrics

```text
IncrementalNetOutcome
DecisionImpactRate
OOSStability
NetEdgeRetained
IndicatorLag
FeatureComputeLatency
ChangedDecisionWinLossDistribution
AblationDelta
```

---

## ‏37. Diagnostic Metrics

```text
raw correlation
rank correlation
feature distribution
missingness
indicator age
warmup failure rate
redundancy / decision overlap
regime bucket performance
current-vs-finalized divergence
online-vs-offline parity error
```

---

## ‏38. Promotion Criteria

‏Classic Indicator Challenger מתקדם רק אם:

- ‏הנוסחה וה־timing semantics מוגדרים במדויק.
- ‏אין leakage.
- ‏Online/Replay parity מוכחת.
- ‏יש incremental OOS value מעבר ל־baseline.
- ‏השיפור שורד realistic costs ו־latency.
- ‏Decision Impact הוא ממשי ומובן.
- ‏השיפור אינו תלוי ב־parameter spike צר.
- ‏אין redundancy שמצדיק representation פשוט יותר.
- ‏ה־compute/latency cost סביר.
- ‏התוצאה ניתנת ל־RCA.
- ‏Shadow evaluation תואם את הציפיות.

---

## ‏39. Rejection Criteria

‏נדחה Indicator כאשר:

- ‏Standalone correlation קיים אך incremental value נעלם.
- ‏השיפור נעלם OOS.
- ‏רק parameter קטן מאוד עובד.
- ‏הוא laggy יחסית ל־signal half-life.
- ‏הוא משכפל feature פשוט יותר.
- ‏הוא משנה decisions אך לא משפר net executable outcome.
- ‏הוא משפר accuracy אך פוגע timing/execution economics.
- ‏הוא יקר מדי ל־Fast Path.
- ‏Online/Offline semantics אינם יציבים.
- ‏התוצאה נשענת על chart hindsight או subjective pattern.

---

## ‏40. Failure Modes

```text
indicator-as-oracle
threshold mythology
bar-close leakage
current-bar repainting mismatch
multi-timeframe leakage
warmup-as-zero
provider-generation mixing
redundant-signal stacking
parameter mining
chart familiarity bias
late-but-clean signal
standalone-correlation promotion
execution blindness
state explosion
feature-version ambiguity
```

---

## ‏41. What I Would Avoid Initially

‏לא הייתי מכניס ל־Fast Path הראשוני:

- ‏TA library מלאה עם עשרות/מאות Indicators.
- ‏stack גדול של oscillators correlated.
- ‏multi-layer smoothing כבד.
- ‏chart-only patterns שקשה להגדיר causally.
- ‏classic periods רק משום שהם נפוצים.
- ‏hard veto המבוסס על Indicator threshold לא מאומת.
- ‏ML model עמוס Indicators לפני ablation פשוט.
- ‏slow exit trigger שמחכה להיפוך Indicator.

---

## ‏42. What to Add Later

‏רק לאחר Evidence:

- ‏regime-conditioned indicator variants.
- ‏adaptive decay horizons.
- ‏cross-sectional percentile variants.
- ‏slow-context + fast-trigger combinations.
- ‏learned nonlinear interactions.
- ‏additional bar constructions אם event-time baseline לא מספיק.
- ‏specialized exit/context indicators.

---

## ‏43. Recommended Research Order

```text
1. Re-express classic indicator as plain math.
2. Map it to an existing feature family.
3. Reject obvious redundancy early.
4. Implement point-in-time correct version.
5. Verify with golden vectors.
6. Verify Replay/Online parity.
7. Measure standalone behavior only as diagnostic.
8. Measure incremental OOS value.
9. Measure decision impact.
10. Apply execution/cost/latency stress.
11. Run in Shadow.
12. Promote or reject.
```

---

## ‏44. Preferred Short-Horizon Challenger Set

‏אם נרצה להתחיל בכמה רעיונות בלבד:

```text
A. EWMA decay matched to measured signal half-life
B. short-minus-medium momentum spread
C. normalized directional persistence
D. standardized distance from local mean
E. position within recent range
F. context-normalized short-horizon activity
G. distance to recent high/low + breakout quality
```

‏אלה אינם promoted features; הם רשימת ניסויים מועדפת משום שהם פשוטים יחסית, interpretable וקרובים ל־phenomena שכבר חשובים למערכת.

---

## ‏45. User-Specific Application

‏לרובוט שלנו Classic Indicators לא אמורים להפוך את ה־Scanner ל־:

```text
RSI + MACD + Bollinger + ADX score
```

‏אלא לעזור לענות על שאלות ספציפיות:

```text
Is directional persistence stronger than raw return alone shows?
Is the move unusual relative to local variability?
Is activity unusually high for this context?
Is the candidate near/through a recent boundary?
Does a slow context filter improve fast-candidate precision?
```

‏כל תשובה נשארת Candidate Feature עד Validation.

---

## ‏46. Alternatives

### ‏Alternative A — No Classic Indicators

‏להישאר עם raw/interpretable features בלבד.

‏יתרונות:

- ‏פשוט.
- ‏מהיר.
- ‏קל ל־RCA.
- ‏פחות degrees of freedom.

‏חיסרון: ייתכן שנפסיד normalization או nonlinear compression שימושיים.

‏זהו Baseline לגיטימי מאוד.

### ‏Alternative B — Classic Indicators as Challengers

‏זהו ה־Preferred Default.

‏הם נבדקים אחד־אחד מול baseline.

### ‏Alternative C — Large Indicator Library / ML

‏רק `P4` לאחר data volume, research discipline ו־strong leakage/overfitting controls.

---

## ‏47. Trade-offs

| Choice | Advantage | Cost |
|---|---|---|
| Simple raw features | ‏מהירים, explainable | ‏יכולים להיות noisier |
| Smoothed indicators | ‏stability/normalization | ‏lag |
| Many indicators | ‏representation breadth | ‏redundancy, overfitting, CPU/RCA cost |
| Fixed thresholds | ‏פשוטים | ‏false certainty, regime fragility |
| Contextual thresholds | ‏מותאמים יותר | ‏complexity ו־estimation risk |
| Bar-based | ‏נוח ומוכר | ‏aggregation/aliasing/delay |
| Event-time | ‏מתאים ל־short horizon | ‏state/engineering complexity |

---

## ‏48. Required Evidence

‏לכל Candidate נשמור Experiment record שמכיל:

```text
FeatureVersion
Formula
SamplingSemantics
BaselineComparison
OOSWindows
RegimeBuckets
DecisionImpact
CostModelVersion
LatencyModelVersion
ExecutionModelVersion
ShadowResults
AblationResults
PromotionDecision
```

---

## ‏49. Fact / Judgment / Hypothesis

### ‏Fact / engineering semantics

- ‏Classic Indicators הם transformations של inputs היסטוריים כגון price, range ו־volume.
- ‏Smoothing מוסיף lag.
- ‏Indicator period תלוי ביחידת sampling/bar.
- ‏Current-bar value יכול להיות שונה מה־finalized value.
- ‏Warm-up ומימוש נוסחה יכולים לשנות output.
- ‏Indicators שונים יכולים להיות מתמטית redundant.

### ‏Judgment

- ‏עבור המערכת שלנו, simple raw-derived features צריכים להישאר Champion.
- ‏Classic Indicators צריכים להתחיל כ־Challengers או context features.
- ‏הרעיונות שמאחורי Indicator חשובים יותר מה־default periods וה־chart folklore.
- ‏Incremental decision economics חשוב יותר מ־standalone predictive correlation.

### ‏Hypothesis

- ‏EWMA מותאם half-life יכול לשפר noise/latency trade-off.
- ‏normalized directional persistence עשוי להוסיף מעבר ל־multi-horizon returns.
- ‏context-normalized activity עשוי להיות שימושי יותר מ־volume indicator קלאסי.
- ‏breakout-distance/quality features עשויים להוסיף selection/veto value.

---

## ‏50. Confidence

### ‏High Confidence

‏ב־:

```text
indicator != edge
popular threshold != evidence
smoothing creates lag
bar semantics matter
warmup/freshness matter
redundancy must be measured
execution can erase predictive value
```

### ‏Medium Confidence

‏ב־Preferred Baseline של simple features + small Challenger set.

### ‏Empirical / Must Validate

‏כל טענה על:

```text
which family adds edge
which horizon/decay works
which threshold works
which regime benefits
how much decision improvement occurs
```

---

## ‏51. Time-Sensitive Facts

‏העקרונות המתמטיים עצמם אינם תלויי זמן, אך implementation בפועל עשוי להיות תלוי ב־:

```text
market-data provider semantics
broker/feed timestamps
session definitions
corporate-action handling
library version / formula convention
runtime performance
```

‏אם משתמשים ב־library חיצונית או provider מסוים יש לאמת את ה־semantics והגרסה הרלוונטיים בזמן היישום.

---

## ‏52. Relationship to Earlier Sheets

### ‏08–10 — Momentum / Velocity / Activity

‏65 בודק אם Indicator מוסיף מידע מעבר ל־features הישירים שכבר הוגדרו שם.

### ‏13 — Feature Engineering

‏65 הוא specialization של feature engineering עבור classic TA transformations.

### ‏14–15 — Ranking / Trade-No-Trade

‏Indicator promoted עדיין אינו bypass ל־ranking, veto או decision gate.

### ‏18 — True Costs

‏Feature predictive שאינו משפר net outcome לאחר costs נדחה.

### ‏23–24 — Overfitting / Controlled Experiments

‏Parameter mining ו־indicator-library search כפופים לאותם multiple-testing ו־OOS controls.

### ‏25 — Regime

‏Indicator effectiveness עשויה להיות conditional; average result אינו מספיק.

### ‏49 — Quant Research Best Practices

‏ה־Experiment record, ablation ו־negative results נשמרים כחלק מ־research memory.

### ‏50 — Scanner Best Practices

‏Compute cost, incremental updates ו־freshness משפיעים על התאמת Indicator ל־Fast Path.

### ‏60A — Negative Evidence

‏Indicator יכול להפוך ל־Soft Penalty/Cooldown/Hard Veto רק לאחר Evidence מתאים, כאשר Hard Veto דורש רף גבוה יותר.

### ‏63 — Edge

‏65 אינו יוצר הגדרה חדשה ל־Edge; הוא רק מספק Candidates שצריכים להוכיח תרומה ל־Net Executable Edge.

---

## ‏53. Relationship to 66

‏65 שואל:

```text
Does this transformation add useful incremental information?
```

‏66 — `Statistical and Quantitative Foundations` — יעמיק בשאלה:

```text
How do we quantify uncertainty, dependence, effect size,
sampling error and multiple-testing risk
when deciding whether that apparent value is real?
```

---

## ‏54. Recommended Hierarchy

```text
Baseline
→ Simple causal raw-derived features

Preferred Default
→ Small, explainable classic-indicator Challenger set

Challenger
→ Re-expressed indicator concepts with horizon-specific parameters

Advanced Option
→ Regime-conditioned / cross-sectional variants

Specialist Option
→ Large feature libraries / learned interactions

Avoid Unless Evidence
→ Indicator stacking, folklore thresholds, chart-driven rules, parameter mining
```

---

## ‏55. Recommendation Summary

‏ברירת המחדל המומלצת היא להתייחס ל־Classic Indicators כאל **ספריית תבניות ל־Feature Engineering**, לא כאל Strategy.

‏החוזה:

```text
Understand Formula
+ Define Sampling Semantics
+ Measure Lag
+ Verify Point-in-Time Correctness
+ Check Redundancy
+ Measure Incremental OOS Value
+ Measure Decision Impact
+ Apply Cost / Latency / Execution Stress
+ Verify Online / Replay Parity
+ Shadow First
→ Promote only if the feature earns its complexity
```

‏לרובוט שלנו עדיף להתחיל מעט features פשוטים ומהירים, ולהוסיף Indicator רק כאשר הוא מוכיח שהוא משנה החלטות לטובה בזמן שבו ה־Edge עדיין ניתן למימוש.