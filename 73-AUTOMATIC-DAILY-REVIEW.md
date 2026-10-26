# ‏שלב 73 — `Automatic Daily Review`: להפוך כל יום מסחר ליחידת למידה מבוקרת

> ‏מטרת הפרק: לבנות תהליך אוטומטי שמסכם כל יום פעילות, מאתר פערים בין Expected ל־Actual, מודד Signal/Ranking/Veto/Execution/Exit/Cost/Operational performance, שומר Counterfactuals ומייצר Research Queue — בלי לשנות Strategy אוטומטית ובלי להסיק מסקנות חזקות ממדגם יומי קטן.
>
> ‏העיקרון המרכזי: **Daily Review אינו מנגנון “לשפר פרמטרים כל ערב”. הוא מנגנון Evidence, Attribution ו־Prioritization שמטרתו לזהות מה ראוי למחקר נוסף, מה דורש RCA, ומה עדיין אינו מצדיק שום שינוי.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה בכלל צריך Daily Review אוטומטי

‏מערכת Short-Horizon יכולה לייצר ביום אחד אלפי או מיליוני observations, מאות ranking decisions, עשרות vetoes, orders, fills, cancels, exits ו־state transitions.

‏אדם לא יכול לזכור את כל זה באופן אמין.

‏לכן צריך תהליך שמייצר בסוף כל יום:

```text
What happened?
What was expected?
Where did reality diverge?
Was the divergence predictive, data, execution, cost, risk or operational?
Which observations deserve research?
Which incidents require RCA?
What should NOT be changed yet?
```

---

# ‏2. Daily Review אינו Daily Optimization

‏זו הבחנה קריטית.

‏לא עושים:

```text
Yesterday parameter X lost money
→ change X today
```

‏במקום זאת:

```text
Observation
→ Evidence accumulation
→ Hypothesis
→ Controlled experiment
→ OOS / Replay / Shadow
→ Promotion decision
```

‏יום בודד יכול להיות Noise.

---

# ‏3. ארבע שכבות פלט

‏ה־Daily Review צריך להוציא לפחות ארבעה Outputs:

```text
Operational Summary
Economic Summary
Diagnostic Findings
Research Queue
```

‏כל אחד עונה על שאלה אחרת.

---

# ‏4. Operational Summary

‏מטרתו לענות האם המערכת עבדה נכון טכנית.

‏דוגמאות:

- ‏זמן startup.
- ‏זמן warm-up.
- ‏Market Data uptime.
- ‏Broker connectivity.
- ‏Reconnect count.
- ‏Queue lag.
- ‏Processing lag.
- ‏Dropped/coalesced updates.
- ‏DataGeneration changes.
- ‏Order-state inconsistencies.
- ‏Kill-switch events.
- ‏Manual interventions.
- ‏Recovery events.

---

# ‏5. Economic Summary

‏מטרתו להסביר את התוצאה הכלכלית — לא רק PnL.

‏צריך לפרק:

```text
Gross Predictive Edge
- Spread
- Slippage
- Fees
- Impact
- Adverse Selection
- Exit Giveback
- Borrow / Financing where relevant
= Net Realized Outcome
```

---

# ‏6. PnL לבדו כמעט חסר אבחנה

‏יום רווחי יכול להסתיר:

- ‏execution שהידרדר.
- ‏latency קיצונית.
- ‏luck חריג.
- ‏trade אחד גדול שמסתיר failures רבים.
- ‏risk violation שלא התממש לנזק.

‏יום מפסיד יכול להכיל process מצוין.

---

# ‏7. Expected מול Actual

‏לכל Candidate/Trade צריך ככל האפשר לשמור:

```text
ExpectedEdge
ExpectedCost
ExpectedFillProbability
ExpectedLatency
ExpectedHoldingTime
ExpectedExitFeasibility
```

‏מול:

```text
ActualFill
ActualCost
ActualLatency
ActualHoldingTime
ActualExit
ActualNetOutcome
```

---

# ‏8. `First Divergence`

‏לכל Trade רע או Trade שונה מהצפוי נשאל:

```text
What was the first meaningful divergence?
```

‏לדוגמה:

```text
Prediction wrong
Data stale
Feature wrong
Rank changed
Veto missing
Spread widened
Fill late
Partial fill
Exit late
Cost wrong
Broker state ambiguous
```

‏לא מתחילים ב־“למה הפסדנו כסף”.

---

# ‏9. Decision Funnel יומי

‏נרצה למדוד כמה Candidates עברו כל שלב:

```text
Observed
→ Data Valid
→ Feature Ready
→ Eligible
→ Ranked
→ Top-K
→ Passed Veto
→ Executable
→ Submitted
→ Filled
→ Exited
→ Net Positive
```

‏ה־drop-off בכל שלב חשוב.

---

# ‏10. Funnel Drift

‏אם היחסים משתנים בחדות לעומת baseline:

```text
EligibleRate
TopKRate
VetoRate
SubmitRate
FillRate
NetPositiveRate
```

‏זה Signal תפעולי/כלכלי בפני עצמו.

---

# ‏11. Review של Rank #1

‏בכל Decision Epoch חשוב לשמור לפחות:

- ‏מי היה Rank #1.
- ‏Top-K snapshot.
- ‏Rank Gap.
- ‏Score distribution.
- ‏freshness.
- ‏veto state.
- ‏execution feasibility.
- ‏האם בוצעה עסקה.

---

# ‏12. “מה קרה ל־#2 עד #K?”

‏זו אחת השאלות החשובות ביותר.

‏אם Rank #1 נכשל, אולי #2 הצליח.

‏אם כן, צריך לברר:

```text
Was ranking wrong?
Was the difference statistically meaningful?
Was #1 simply unlucky?
Did execution destroy only #1?
```

---

# ‏13. Counterfactual Candidates

‏גם Candidates שלא נסחרו צריכים להישמר למחקר.

‏אחרת נוצרת Selection Bias:

```text
We only learn from what we traded.
```

---

# ‏14. `NO TRADE` Review

‏גם החלטת `NO TRADE` היא החלטה.

‏צריך למדוד:

- ‏כמה פעמים לא סחרנו.
- ‏למה.
- ‏מה קרה לאחר מכן.
- ‏האם ה־NO TRADE חסך נזק.
- ‏האם הוא פספס הזדמנות.

---

# ‏15. Veto Review

‏לכל ReasonCode:

```text
TriggeredCount
WouldHaveLostCount
WouldHaveWonCount
UnknownCount
EstimatedDamageAvoided
EstimatedOpportunityMissed
```

---

# ‏16. False Veto

‏Veto יכול להיות “נכון לוגית” ועדיין יקר.

‏לכן צריך למדוד:

```text
FalseVetoRate
```

‏בהגדרה מחקרית ברורה מראש.

---

# ‏17. False Allow

‏הכשל ההפוך:

‏Candidate עבר למרות Evidence שלילי שהיה אמור לעצור אותו.

‏זה חומר חשוב ל־RCA.

---

# ‏18. Cooldown Review

‏אם יש Cooldown, צריך למדוד:

- ‏כמה פעמים הופעל.
- ‏כמה זמן היה פעיל.
- ‏כמה Candidates חסם.
- ‏מה קרה בתקופת החסימה.
- ‏האם TTL נראה ארוך/קצר מדי.

‏אבל אין לשנות TTL על סמך יום יחיד.

---

# ‏19. Signal Review

‏לכל Signal/Feature חשוב:

```text
Coverage
Freshness
Distribution
MissingRate
PredictiveRelationship
Stability
DecisionImpact
```

---

# ‏20. Feature Health מול Feature Performance

‏שתי שאלות שונות:

```text
Did the feature compute correctly?
Did the feature help predict useful outcomes?
```

‏Feature יכול להיות operationally healthy וכלכלית חסר ערך.

---

# ‏21. Distribution Shift

‏נשווה בין היום לבין baseline:

- ‏mean.
- ‏median.
- ‏quantiles.
- ‏variance.
- ‏missingness.
- ‏outlier rate.

‏ל־Features מרכזיים.

---

# ‏22. Drift אינו בהכרח Bug

‏שינוי distribution יכול להגיע מ:

- ‏Market regime.
- ‏Market structure.
- ‏Data provider.
- ‏Universe composition.
- ‏Software change.
- ‏Real behavioral change.

‏Daily Review צריך לזהות, לא לנחש סיבה.

---

# ‏23. Scanner Health

‏נמדוד לפחות:

```text
FreshCoverage
EligibleCount
Top1Age
TopKAge
RankChurn
RankGap
DeepPathLag
QueueAge
ScannerCycleLatency
```

---

# ‏24. Rank Churn Review

‏Churn גבוה יכול לנבוע מ:

- ‏שוק אמיתי מהיר.
- ‏noise.
- ‏asynchronous updates.
- ‏stale symbols.
- ‏unstable normalization.

‏לא “מתקנים” churn לפני RCA.

---

# ‏25. Rank Persistence

‏אפשר למדוד:

```text
TimeAtRank1
TopKPersistence
RankHalfLife
```

‏ואז לבדוק קשר ל־future outcome.

---

# ‏26. Rank Gap Review

‏נבדוק אם ימים שבהם Rank #1 מופרד היטב מהשאר שונים מימים עם score compression.

---

# ‏27. Score Distribution

‏שומרים:

- ‏quantiles.
- ‏tail size.
- ‏number above threshold.
- ‏dispersion.
- ‏compression.

‏כדי להבין אם “Rank #1” הגיע מתחרות אמיתית או מתפלגות חלשה.

---

# ‏28. Execution Review

‏לכל Order:

```text
DecisionTime
SubmitTime
AckTime
FirstFillTime
FinalFillTime
CancelRequestTime
CancelAckTime
ExitDecisionTime
FlatTime
```

---

# ‏29. Latency Decomposition

‏נפרק:

```text
DataLatency
FeatureLatency
DecisionLatency
SubmitLatency
BrokerAckLatency
FillLatency
ExitLatency
```

---

# ‏30. Tail Latency

‏לא להסתפק ב־Average.

‏נשמור:

```text
p50
p90
p95
p99
max
```

‏לכל שלב משמעותי.

---

# ‏31. `Latency Pressure`

‏לכל Candidate/Trade:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏זה יכול להסביר למה Signal טוב לא הפך ל־Edge ממומש.

---

# ‏32. Fill Review

‏נמדוד:

```text
FillRate
PartialFillRate
TimeToFirstFill
TimeToFullFill
CanceledUnfilledRate
```

---

# ‏33. Fill Quality

‏Fill אינו בהכרח הצלחה.

‏צריך למדוד Markout אחרי Fill:

```text
100ms
500ms
1s
2s
5s
10s
```

‏בהתאם ל־horizon.

---

# ‏34. Adverse Selection Review

‏אם fills טובים לכאורה מלווים ב־negative markout, ייתכן שהמערכת מתמלאת בעיקר כשהשוק עומד לנוע נגדה.

---

# ‏35. No-Fill Opportunity

‏גם Orders שלא התמלאו חשובים.

‏נשאל:

```text
What happened after the no-fill?
```

‏כך מעריכים opportunity cost.

---

# ‏36. Entry Review

‏נבדוק:

- ‏Edge at detection.
- ‏Edge at submit.
- ‏Edge at fill.
- ‏spread evolution.
- ‏rank evolution.
- ‏candidate age.

---

# ‏37. Exit Review

‏נמדוד:

```text
ExitTriggerReason
ExitDecisionLatency
ExitExecutionLatency
TimeToFlat
ExitSlippage
Giveback
```

---

# ‏38. MFE / MAE

‏לכל Trade:

```text
MFE = Maximum Favorable Excursion
MAE = Maximum Adverse Excursion
```

‏הם עוזרים להבין אם Exit policy לוקחת מעט מדי, מאוחר מדי או מגיבה מהר מדי.

---

# ‏39. Time to First Profit

‏לרובוט שלנו זה Metric משמעותי.

‏נמדוד distribution של:

```text
time_to_first_profit
```

‏ולא רק האם העסקה הייתה רווחית בסוף.

---

# ‏40. Time to Target

‏אם יש target research hypothesis, נשמור:

```text
time_to_target
```

‏לכל horizon.

---

# ‏41. Post-Target Giveback

‏אם Candidate הגיע ליעד ואז החזיר את הרווח לפני Exit, זו אינדיקציה ל־Exit/latency problem או ל־target mechanics.

---

# ‏42. Holding-Time Distribution

‏נשווה:

```text
ExpectedHoldingTime
vs
ActualHoldingTime
```

‏לפי regime ו־exit reason.

---

# ‏43. Cost Review

‏נפרק לפי Trade:

```text
Commission
RegulatoryFees
SpreadCost
Slippage
Impact
BorrowCost
Other
```

---

# ‏44. Cost Drift

‏נשווה Actual Cost Model מול assumptions ב־Backtest.

‏פער עקבי הוא Model Error.

---

# ‏45. `Edge Retention`

‏אפשר למדוד:

```text
EdgeRetention = RealizedNetEdge / EstimatedGrossEdge
```

‏כאשר ההגדרות עקביות.

---

# ‏46. Edge Consumption Attribution

‏ננסה להסביר איפה Edge נאכל:

```text
Signal decay
Latency
Spread
Slippage
Adverse selection
Exit delay
Fees
Impact
```

---

# ‏47. Data Quality Review

‏נמדוד:

- ‏gaps.
- ‏duplicates.
- ‏out-of-order.
- ‏stale quotes.
- ‏crossed/locked anomalies.
- ‏provider reconnects.
- ‏schema errors.
- ‏unknown trade conditions.

---

# ‏48. Data Impact, לא רק Data Error Count

‏100 anomalies שלא השפיעו על decisions שונות מ־anomaly אחת ששינתה Trade.

‏לכן נרצה:

```text
DecisionImpactCount
```

---

# ‏49. Data Lineage Review

‏לכל חריגה משמעותית צריך לדעת:

```text
Provider
Feed
SchemaVersion
DataGeneration
EventTime
ReceiveTime
ProcessingTime
```

---

# ‏50. Cross-Provider Review

‏אם יש יותר ממקור אחד, אפשר למדוד divergence בין providers.

‏לא כל divergence הוא bug.

---

# ‏51. Universe Review

‏נמדוד:

```text
ObservedUniverseSize
EligibleUniverseSize
ExcludedCountByReason
AddedSymbols
RemovedSymbols
```

---

# ‏52. Universe Drift

‏שינוי בהרכב universe יכול לשנות distributions של Score ו־Outcomes גם אם Strategy לא השתנתה.

---

# ‏53. Exclusion Review

‏לכל exclusion reason:

- ‏count.
- ‏duration.
- ‏affected symbols.
- ‏counterfactual outcome אם זמין.

---

# ‏54. Regime Review

‏נרצה לסמן Context/Regime שנמדד בזמן אמת ולסכם performance לפי state.

---

# ‏55. לא להמציא Regime בדיעבד

‏Daily Review יכול לנתח retrospectively, אבל אם Regime לא היה observable בזמן ההחלטה אסור להתייחס אליו כ־Feature שהיה זמין.

---

# ‏56. Session Review

‏נפריד לפחות מחקרית בין:

- ‏opening transition.
- ‏regular session states.
- ‏midday-like states.
- ‏closing transition.

‏אבל נשפוט לפי data ולא folklore.

---

# ‏57. Event Review

‏אם היום כלל events משמעותיים:

- ‏earnings-like states.
- ‏halts.
- ‏resume.
- ‏corporate actions.
- ‏market-wide event.

‏נסמן אותם כדי לא לערבב עם baseline days.

---

# ‏58. Trade Clusters

‏Trades אינם תמיד independent.

‏עשרה Trades בתוך אותו market burst יכולים להיות Episode אחד מבחינת Evidence.

---

# ‏59. Episode Analysis

‏נרכז Decisions סביב:

```text
Shared market event
Shared symbol burst
Shared reconnect
Shared latency incident
Shared regime transition
```

---

# ‏60. Effective Sample Size

‏Daily Review צריך להציג גם:

```text
RawSampleCount
EffectiveSampleEstimate
```

‏כאשר observations strongly correlated.

---

# ‏61. Winner's Curse Review

‏במערכת שבוחרת אחד מאלפי Symbols, Rank #1 הוא extreme selection.

‏נבדוק אם Top1 systematically regresses לעומת Top2–TopK.

---

# ‏62. Top-K Bucket Outcomes

‏לדוגמה:

```text
Rank 1
Rank 2-3
Rank 4-5
Rank 6-10
```

‏לא כדי לבחור bucket לפי יום אחד, אלא כדי לבנות Evidence לאורך זמן.

---

# ‏63. Predictive מול Executable Rank

‏נשווה:

```text
PredictiveRank
ExecutableRank
FinalActionRank
```

‏כדי להבין איפה candidate השתנה.

---

# ‏64. Veto Contribution

‏ננסה להפריד:

```text
Signal quality
Ranking quality
Veto value
Execution value
```

‏ולא לייחס הכול ל־Strategy אחת עמומה.

---

# ‏65. `ReasonCode` הוא נכס מחקרי

‏כל `NO TRADE`, reject, veto, exit, cancel ו־fallback צריך ReasonCode יציב.

‏בלי Reason Codes קשה לבצע attribution.

---

# ‏66. ReasonCode Versioning

‏אם semantics משתנים, צריך version.

‏אחרת ההיסטוריה נעשית בלתי ניתנת להשוואה.

---

# ‏67. Configuration Fingerprint

‏כל Daily Review חייב לדעת איזו configuration רצה.

```text
StrategyVersion
FeatureVersion
ScoreVersion
VetoVersion
ExecutionPolicyVersion
ConfigHash
BuildCommit
```

---

# ‏68. Deployment Awareness

‏אם deployment קרה באמצע היום, צריך split ברור לפני/אחרי deployment.

---

# ‏69. Cold Start Review

‏נבדוק:

- ‏warm-up duration.
- ‏features not ready.
- ‏false ranks בזמן התחלה.
- ‏trading disabled until ready.

---

# ‏70. Reconnect Review

‏לכל reconnect:

```text
DisconnectStart
ReconnectTime
ReconciliationComplete
TradingResumeTime
GenerationChange
```

---

# ‏71. Recovery Review

‏נבדוק אם Recovery:

- ‏שחזר positions.
- ‏שחזר open orders.
- ‏resolved UNKNOWN_EFFECT.
- ‏מנע duplicate intent.

---

# ‏72. Manual Intervention Review

‏כל התערבות ידנית צריכה להופיע בדוח:

```text
Who/What
When
Why
Action
Result
```

‏גם במערכת אישית, “מי” יכול להיות operator יחיד.

---

# ‏73. Safety Review

‏נבדוק:

- ‏kill switches.
- ‏limit hits.
- ‏risk reservations.
- ‏entry blocks.
- ‏forced flatten requests.
- ‏unexpected exposure.

---

# ‏74. Near Misses

‏אירוע שלא גרם נזק אך היה יכול לגרום הוא חומר חשוב יותר לעיתים מהפסד קטן רגיל.

---

# ‏75. Safety Success

‏גם מנגנון שהפסיק Trade מסוכן בהצלחה צריך להופיע.

‏אחרת רואים רק failures ולא את הערך של controls.

---

# ‏76. `Daily Incident Candidates`

‏התהליך האוטומטי יכול לייצר רשימה מדורגת של אירועים שדורשים RCA.

‏לדוגמה:

```text
P0 Safety violation
P1 Broker/local mismatch
P1 Unknown effect
P2 severe latency tail
P2 data gap with decision impact
P3 unusual rank churn
```

---

# ‏77. Daily Review לא עושה RCA מלא לכל דבר

‏הוא עושה triage.

‏RCA מלא נשמר לאירועים עם impact, recurrence או systemic risk.

---

# ‏78. Severity × Frequency × Impact

‏דרך פשוטה לתעדף:

```text
Priority = Severity × Frequency × DecisionImpact
```

‏לא כמדע מדויק אלא כ־triage framework.

---

# ‏79. Research Queue

‏פלט מרכזי:

```text
Observation
Evidence
Hypothesis
Why it matters
Required dataset
Proposed test
Expected decision impact
Priority
```

---

# ‏80. Observation אינו Hypothesis

‏לדוגמה:

```text
Observation:
Top1 failed 5 times during high spread.

Hypothesis:
Spread expansion above X condition reduces net edge.
```

‏אלה שני דברים שונים.

---

# ‏81. Hypothesis אינו Change Request

‏לפני שינוי Production:

```text
Hypothesis
→ Backtest / Replay
→ OOS
→ Shadow
→ Challenger
→ Promotion Gate
```

---

# ‏82. Auto-Tuning מסוכן

‏Daily Review לא צריך לעשות אוטומטית:

- ‏parameter optimization.
- ‏feature enable/disable.
- ‏threshold changes.
- ‏capital increase.
- ‏veto retirement.

‏בלי governance נפרד.

---

# ‏83. מה כן אפשר לאוטומט

‏אפשר לאוטומט:

- ‏data collection.
- ‏metrics.
- ‏comparisons.
- ‏anomaly detection.
- ‏candidate clustering.
- ‏report generation.
- ‏research suggestions.

---

# ‏84. Evidence Levels

‏אפשר לסווג Finding:

```text
ANECDOTAL
WEAK
MODERATE
STRONG
REPEATED
```

‏בהתאם לכמות, independence, consistency ו־validation.

---

# ‏85. One-Day Finding

‏ברירת מחדל:

```text
ANECDOTAL
```

‏אלא אם מדובר ב־deterministic correctness bug או safety violation.

---

# ‏86. Deterministic Bug שונה מ־Statistical Finding

‏אם Order ID הוכפל, לא צריך 30 ימים כדי לדעת שיש bug.

‏אם Feature נראה פחות predictive, כן צריך Evidence רחב יותר.

---

# ‏87. Rolling Windows

‏Daily Review יכול להציג:

```text
Today
Last 5 sessions
Last 20 sessions
Last 60 sessions
```

‏כדי לראות short/medium drift.

---

# ‏88. Baseline Comparison

‏כל Metric חשוב צריך baseline מוגדר.

‏למשל:

```text
Today vs Rolling Median
Today vs Previous Version
Today vs Shadow Challenger
```

---

# ‏89. Avoid Alert Fatigue

‏לא כל שינוי של 2% הוא Alert.

‏צריך thresholds שמבוססים על:

- ‏statistical variation.
- ‏economic impact.
- ‏safety severity.

---

# ‏90. Alerts מול Review Findings

‏Alert הוא real-time.

‏Daily Finding הוא retrospective.

‏לא להחליף אחד בשני.

---

# ‏91. Live Anomaly Detection

‏Daily Review יכול לסכם anomalies שנצפו בזמן אמת:

```text
Latency spike
Spread shock
Data gap
Rank churn spike
Fill-rate collapse
Broker reject cluster
```

---

# ‏92. Anomaly ≠ Failure

‏Anomaly דורש הסבר, לא בהכרח תיקון.

---

# ‏93. Root Cause Taxonomy

‏קטגוריות שימושיות:

```text
DATA
FEATURE
SCANNER
RANKING
VETO
EXECUTION
EXIT
RISK
BROKER
INFRA
CONFIG
OPERATOR
EXTERNAL
UNKNOWN
```

---

# ‏94. `UNKNOWN` הוא מצב לגיטימי

‏אסור להמציא Root Cause כדי לסגור דוח.

---

# ‏95. Unknown Backlog

‏Findings לא מוסברים צריכים backlog עם owner/status, גם אם owner הוא אתה.

---

# ‏96. Repeat Detector

‏Daily Review צריך לזהות אם אותו pattern חזר בימים קודמים.

---

# ‏97. Recurrence חשוב יותר מאירוע בודד

‏אירוע קטן שחוזר 30 פעמים יכול להיות חשוב יותר מאירוע גדול חד־פעמי.

---

# ‏98. Change Correlation

‏אם behavior השתנה מיד אחרי deployment/config change, זו clue חשובה.

‏לא הוכחת causality, אבל priority גבוהה לבדיקה.

---

# ‏99. Version-to-Version Review

‏נשווה גרסאות לפי:

- ‏decision counts.
- ‏rank distributions.
- ‏veto rates.
- ‏fills.
- ‏costs.
- ‏net outcomes.
- ‏latency.

---

# ‏100. Champion/Challenger Daily Comparison

‏אם Challenger רץ ב־Shadow:

```text
ChampionDecision
ChallengerDecision
DifferenceReason
CounterfactualOutcome
```

---

# ‏101. Decision Disagreement Rate

```text
DisagreementRate = DifferentDecisions / ComparableDecisionEpochs
```

‏Metric חשוב להבנת משמעות השינוי.

---

# ‏102. Improvement Without Decision Change

‏מודל יכול לשפר score metric אבל לא לשנות אף Decision.

‏אז ייתכן שאין Decision Value.

---

# ‏103. Decision Value

‏נמדוד האם שינוי היה צפוי להשפיע על:

```text
Trade selection
NO TRADE
Entry
Exit
Cost
Risk
```

---

# ‏104. Economic Attribution Tree

‏אפשר לבנות:

```text
Net Outcome
├─ Prediction
├─ Selection
├─ Entry
├─ Fill
├─ Holding
├─ Exit
├─ Costs
└─ Operational Effects
```

---

# ‏105. לא להאשים תמיד את Signal

‏Signal יכול להיות נכון וה־execution רע.

‏או להפך.

---

# ‏106. Positive RCA

‏גם Trade מצוין שווה ניתוח:

```text
Why was it good?
Was it repeatable?
Was it lucky?
Did all subsystems behave as designed?
```

---

# ‏107. Best Trades אינם בהכרח Best Process

‏Trade עם PnL גבוה יכול להיות violation מסוכן שהצליח במקרה.

---

# ‏108. Worst Trades אינם בהכרח Worst Process

‏Loss קטן בתוך policy יכול להיות outcome תקין.

---

# ‏109. Process Quality Score

‏אפשר לבנות report פנימי שמעריך:

```text
Data Correctness
Decision Correctness
Execution Correctness
Risk Correctness
Recovery Correctness
```

‏בלי לערבב עם PnL.

---

# ‏110. Daily Economic Scorecard

‏בנפרד:

```text
Gross Edge
Net Edge
Cost Ratio
Fill Quality
Exit Giveback
NO TRADE Value
```

---

# ‏111. Daily Research Scorecard

‏בנפרד:

```text
New Findings
Repeated Findings
Hypotheses Created
Hypotheses Strengthened
Hypotheses Weakened
Unknowns
```

---

# ‏112. Daily Operations Scorecard

‏בנפרד:

```text
Uptime
Reconnects
Incidents
Manual Actions
Recovery Time
Safety Events
```

---

# ‏113. Daily Data Scorecard

‏בנפרד:

```text
FreshCoverage
GapRate
StaleRate
DuplicateRate
OutOfOrderRate
DecisionImpactingDataIssues
```

---

# ‏114. Daily Execution Scorecard

‏בנפרד:

```text
SubmitLatency
AckLatency
FillLatency
FillRate
PartialFillRate
CancelLatency
ExitLatency
```

---

# ‏115. Daily Scanner Scorecard

‏בנפרד:

```text
EligibleCount
RankChurn
RankGap
Top1Age
TopKPersistence
DeepPathLag
```

---

# ‏116. Daily Veto Scorecard

```text
VetoCountByReason
FalseVetoEstimate
DamageAvoidedEstimate
CooldownOccupancy
```

---

# ‏117. Daily Risk Scorecard

```text
MaxExposure
UnexpectedExposure
RiskLimitHits
PendingExposurePeak
TimeToFlat
```

---

# ‏118. `Evidence Packet`

‏לכל Finding משמעותי נשמור package קטן:

```text
FindingId
TimeRange
Symbols
DecisionIds
OrderIds
RelevantMetrics
ConfigVersion
ReplayPointers
Hypothesis
Confidence
```

---

# ‏119. Replay Linkage

‏Daily Review צריך לאפשר להגיע ישירות ל־Replay של incident/finding.

---

# ‏120. Deterministic Reproduction

‏אם Replay של אותה evidence package נותן תוצאה שונה בלי סיבה, יש בעיית reproducibility.

---

# ‏121. Evidence Retention

‏לא שומרים רק summary.

‏צריך לשמור Raw/Canonical/Derived references מספיקות ל־RCA עתידי.

---

# ‏122. Storage Tiering

‏אפשר לחשוב על:

```text
Hot recent diagnostics
Warm replay datasets
Cold long-term evidence
```

‏בלי לאבד lineage.

---

# ‏123. Daily Review Idempotency

‏הרצה חוזרת על אותו day/version צריכה לתת אותו report, אלא אם inputs/version השתנו במפורש.

---

# ‏124. Report Versioning

‏גם ה־Review logic עצמו צריך version.

‏אחרת report היסטורי יכול להשתנות רטרואקטיבית ללא עקבות.

---

# ‏125. Late Data

‏אם Data מאוחר מגיע אחרי review ראשוני, אפשר להוציא:

```text
Preliminary Report
Finalized Report
```

‏עם versioning ברור.

---

# ‏126. As-Observed מול Corrected Review

‏שתי תצוגות יכולות להיות שימושיות:

```text
AsObservedAtRuntime
AsLaterCorrected
```

‏הפער ביניהן עצמו הוא Evidence.

---

# ‏127. Corporate Action Corrections

‏אם adjustment משתנה בדיעבד, אסור למחוק את מה שהמערכת ראתה בזמן אמת.

---

# ‏128. Clock Quality

‏Daily Review צריך לסמן clock-sync incidents כי timestamps שגויים יכולים להרוס latency attribution.

---

# ‏129. Time Zones

‏כל storage פנימי רצוי ב־UTC/instant semantics, עם session calendar מפורש.

‏Display יכול להיות local.

---

# ‏130. Trading Day Identity

‏Trading day צריך להיגזר מ־market calendar, לא רק מתאריך מקומי של השרת.

---

# ‏131. Partial Session

‏יום קצר או session חריג צריך להיות מסומן כדי לא להשוות אותו אוטומטית ליום רגיל.

---

# ‏132. Review Completeness

‏הדוח צריך לדעת אם חסר מידע.

```text
COMPLETE
PARTIAL
DEGRADED
UNKNOWN
```

---

# ‏133. Confidence per Finding

‏Finding בלי data מלא צריך confidence נמוך יותר.

---

# ‏134. No Silent Gaps

‏אם subsystem לא דיווח, זה Finding בפני עצמו.

---

# ‏135. `No Data` אינו `Zero`

‏עיקרון חשוב גם בדוחות.

---

# ‏136. Daily Review SLA

‏כדאי להגדיר מתי report נחשב מוכן:

```text
all source streams closed
broker reconciliation complete
ledger finalized enough
required labels available
```

---

# ‏137. Forward Labels Need Time

‏אם רוצים label של 60 שניות אחרי decision האחרון, אי אפשר לסגור report באותה millisecond.

‏צריך להמתין לחלון המחקר — לוגית, לא כאסינכרוניות של ChatGPT.

---

# ‏138. Multi-Horizon Daily Labels

‏למשל:

```text
+1s
+2s
+5s
+10s
+30s
+60s
```

‏לפי מטרות המחקר.

---

# ‏139. Label Quality

‏גם labels צריכים data-quality flags.

---

# ‏140. Executable Labels

‏בנוסף ל־raw future return, חשוב לחשוב על:

```text
ExecutableEntry
ExecutableExit
NetOutcome
```

---

# ‏141. Daily Review של Missed Best Candidate

‏שאלה חשובה:

```text
Did another eligible candidate outperform the selected candidate?
```

‏ואם כן — למה לא נבחר?

---

# ‏142. Candidate Opportunity Set

‏ההשוואה צריכה להיות רק מול Candidates שהיו באמת observable/eligible בזמן ההחלטה.

‏אחרת יש hindsight leakage.

---

# ‏143. Best Hindsight Candidate הוא לא Benchmark הוגן

‏לא משווים ל־“המניה שעלתה הכי הרבה אחר כך” אם בזמן ההחלטה היא לא הייתה בת־בחירה לפי constraints.

---

# ‏144. Daily `NO TRADE` Counterfactual

‏נבדוק האם היו times שבהם שום Candidate לא עבר gates — ומה קרה אחר כך.

---

# ‏145. Trade Frequency

‏יותר Trades אינם בהכרח טובים יותר.

‏נשווה:

```text
TradeCount
AverageNetEdge
TotalNetOutcome
ErrorRate
```

---

# ‏146. Opportunity Frequency

‏צריך להבדיל בין:

```text
No trades because no opportunity
```

‏לבין:

```text
No trades because system degraded
```

---

# ‏147. Quiet Day הוא Evidence

‏אם אין opportunities, זה outcome לגיטימי.

---

# ‏148. Daily Review לא צריך “לייצר תובנה” בכוח

‏דוח תקין יכול לומר:

```text
No material findings today.
```

---

# ‏149. Statistical Discipline

‏Daily Review לא יכריז:

```text
Feature X is better
```

‏על בסיס הבדל קטן ביום אחד.

---

# ‏150. Aggregate Evidence Store

‏Findings יומיים צריכים להצטבר למסד שמאפשר לשאול:

```text
How often has this pattern occurred?
Under which regimes?
With what economic impact?
```

---

# ‏151. Research Queue Deduplication

‏אותה hypothesis לא צריכה להיפתח מחדש כל יום.

‏צריך:

```text
HypothesisId
FirstSeen
LastSeen
Occurrences
AccumulatedEvidence
Status
```

---

# ‏152. Hypothesis Lifecycle

```text
OBSERVED
PROPOSED
UNDER_TEST
SUPPORTED
REJECTED
PROMOTED
RETIRED
```

---

# ‏153. Negative Results

‏גם Hypothesis שנכשלה היא ידע.

‏לא למחוק אותה.

---

# ‏154. Research Memory

‏כך נמנעים מלחזור כל כמה חודשים על רעיון שכבר נבדק ונכשל.

---

# ‏155. Automatic Suggestions

‏המערכת יכולה לומר:

```text
Investigate whether high RankChurn + low RankGap predicts worse net outcomes.
```

‏אבל לא:

```text
Set threshold to 0.37 tomorrow.
```

---

# ‏156. Daily Review ו־60A

‏Veto Engine צריך לקבל Evidence חזרה מה־Review, אבל שינוי rule עובר מחקר נפרד.

---

# ‏157. Daily Review ו־61

‏Backtest assumptions צריכים להתעדכן כאשר Live repeatedly shows simulation mismatch.

---

# ‏158. Daily Review ו־62

‏Live Drift metrics הם input מרכזי לדוח.

---

# ‏159. Daily Review ו־63

‏המטרה אינה רק PnL אלא `Edge Health`.

---

# ‏160. Daily Review ו־64

‏אם P0 readiness assumption נשבר, המסקנה יכולה להיות:

```text
NO-GO for next session
```

‏עד תיקון/אימות.

---

# ‏161. Review Before Next Session

‏כדאי להפריד בין:

```text
Yesterday Review
Next-Session Readiness
```

‏הראשון אבחנתי; השני operational gate.

---

# ‏162. Automatic Block Recommendation

‏Daily Review יכול לייצר המלצה:

```text
Block new entries until broker reconciliation issue is resolved.
```

‏אבל enforcement שייך ל־Safety/Readiness layer מוגדרת.

---

# ‏163. Daily Report Structure מומלץ

```text
1. Executive Summary
2. Data Health
3. Scanner / Ranking
4. Vetoes
5. Decisions / NO TRADE
6. Orders / Fills
7. Exit
8. Costs / Edge Retention
9. Risk / Safety
10. Incidents
11. Drift
12. Counterfactuals
13. Research Findings
14. Open Unknowns
15. Next-Session Readiness
```

---

# ‏164. Executive Summary

‏צריך להיות קצר מספיק כדי להבין את היום בדקה.

‏לא להחליף את ה־drill-down.

---

# ‏165. Drill-Down by Symbol

‏לכל Symbol משמעותי:

```text
Timeline
Features
Rank
Vetoes
Orders
Fills
Position
Exit
Outcome
```

---

# ‏166. Drill-Down by Decision

‏Decision-centric view לעיתים חשוב יותר מ־symbol view.

---

# ‏167. Drill-Down by Incident

‏לאירועים תפעוליים צריך timeline חוצה subsystems.

---

# ‏168. Correlation בין Failures

‏אם הרבה symbols נפגעו באותו זמן, ייתכן root cause משותף ולא Strategy issue לכל Symbol.

---

# ‏169. Market-Wide Failure Signature

‏דוגמה:

```text
Spread ↑
Latency ↑
Fill quality ↓
Rank churn ↑
```

‏עשוי להעיד על regime/stress משותף.

---

# ‏170. Infrastructure Failure Signature

‏דוגמה:

```text
Receive lag ↑
Queue age ↑
Feature age ↑
Top1 age ↑
```

‏יכול להצביע על pipeline issue.

---

# ‏171. Provider Failure Signature

```text
GapRate ↑
CrossProviderDivergence ↑
StaleRate ↑
```

---

# ‏172. Execution Failure Signature

```text
AckLatency ↑
FillRate ↓
CancelLatency ↑
AdverseSelection ↑
```

---

# ‏173. `Practitioner Secret`: הפסד קטן יכול לחשוף בעיה גדולה

‏אם הפסד של כמה סנטים חשף race condition ב־order state, זה Finding בעל ערך גדול בהרבה מה־PnL שלו.

---

# ‏174. `Practitioner Secret`: רווח גדול יכול להיות Red Flag

‏PnL חריג יכול להיות:

- ‏outlier luck.
- ‏bad risk control.
- ‏stale accounting.
- ‏incorrect fill assumption.

‏לכן גם winners נבדקים.

---

# ‏175. `Practitioner Secret`: Daily Review צריך לחפש precursors

‏לא רק failures.

‏לדוגמה:

```text
queue age gradually rising
before actual outage
```

---

# ‏176. `Practitioner Secret`: precursor metric יכול להיות שווה יותר מ־PnL metric

‏כי הוא מאפשר לעצור לפני נזק.

---

# ‏177. `Practitioner Secret`: repeated near-miss הוא incident

‏אל תחכה לכשל מלא כדי לתת לו severity.

---

# ‏178. `Practitioner Secret`: counterfactual logging הוא זול בזמן אמת ויקר מאוד לשחזר בדיעבד

‏שמור Top-K, vetoes ו־decision context בזמן אמת.

---

# ‏179. `Practitioner Secret`: “למה לא סחרנו?” חשוב כמו “למה סחרנו?”

‏מערכת טובה לומדת גם מהחלטות abstain.

---

# ‏180. `Practitioner Secret`: אל תמדוד רק Trades

‏היחידה הנכונה לעיתים היא `Decision Epoch`.

---

# ‏181. `Practitioner Secret`: אם אין configuration fingerprint, אין RCA אמין

‏אותו שם Strategy יכול להתייחס בפועל לשתי מערכות שונות.

---

# ‏182. `Practitioner Secret`: דוח אוטומטי צריך להגיד “לא יודע”

‏זה עדיף על explanation invented.

---

# ‏183. `Practitioner Secret`: שינוי קטן ב־Data יכול להיראות כשינוי Strategy

‏לכן Data Health קודם ל־Alpha conclusions.

---

# ‏184. `Practitioner Secret`: תהליך review טוב מגן גם מפני Recency Bias

‏לא משנים מערכת בגלל מה שקרה אתמול בלבד.

---

# ‏185. `Practitioner Secret`: ה־Review עצמו צריך Backtest

‏אם anomaly detector או finding rule מציעים המון noise, צריך לכייל גם אותם.

---

# ‏186. `Review Quality Metrics`

‏אפשר למדוד:

```text
UsefulFindingRate
FalseAlarmRate
RCAConversionRate
RepeatedUnknownRate
ResearchPromotionRate
```

---

# ‏187. Cost of Review Complexity

‏אם הדוח ענק ולא נקרא, הוא נכשל.

‏צריך:

```text
Summary → Ranked Findings → Drill-down
```

---

# ‏188. Evidence-first UI

‏כל Finding צריך קישור ל־evidence ולא רק טקסט מסכם.

---

# ‏189. Human Override

‏המשתמש צריך להיות מסוגל לסמן:

```text
Not Important
Needs RCA
Research Candidate
Known Issue
False Positive
```

‏בלי למחוק history.

---

# ‏190. Learning Without Self-Modification

‏הארכיטקטורה המועדפת:

```text
Production Strategy
        ↓
Evidence Collection
        ↓
Daily Review
        ↓
Research Queue
        ↓
Offline Experiment
        ↓
Replay / OOS
        ↓
Shadow Challenger
        ↓
Promotion Gate
        ↓
New Version
```

---

# ‏191. Baseline מומלץ למחקר שלנו

‏בשלב ראשון, Daily Review אוטומטי צריך להתמקד ב־high-value evidence:

```text
Data Health
Scanner Freshness
Top-K + Rank Gap
Veto Reasons
NO TRADE Reasons
Decision-to-Fill Timeline
Fill / Markout
Exit / Giveback
Costs
Risk / Safety
Counterfactual Top-K
Incidents
Drift
Research Candidates
```

‏בלי מערכת ML מורכבת שמנסה “ללמוד לבד” מהיום הראשון.

---

# ‏192. Definition of Done

‏Daily Review מקצועי קיים רק אם אפשר לענות בסוף כל Session על:

```text
1. Did the system operate correctly?
2. Did the data remain trustworthy?
3. Did ranking select good candidates?
4. Did vetoes help or hurt?
5. Did execution preserve the predicted edge?
6. Where was edge consumed?
7. Were exits timely?
8. Were any safety assumptions violated?
9. What materially drifted?
10. Which findings are deterministic bugs?
11. Which are statistical observations only?
12. Which hypotheses deserve controlled research?
13. What remains unknown?
14. Is the system eligible for the next session?
```

‏אם התשובה לחלק מהשאלות היא “לא ידוע”, הדוח צריך לומר זאת במפורש.

---

# ‏סיכום

‏המטרה של `Automatic Daily Review` אינה לגרום לרובוט לשנות את עצמו כל ערב.

‏המטרה היא ליצור מערכת למידה מבוקרת:

```text
Observe honestly
→ Attribute correctly
→ Preserve evidence
→ Detect drift
→ Find first divergence
→ Generate hypotheses
→ Validate separately
→ Promote only with evidence
```

‏כך כל יום מסחר מוסיף ידע — בלי להפוך רעש יומי להחלטת Production.