# ‏שלב 74 — `Scanner Diagnostics`: לדעת אם ה־Scanner באמת רואה את השוק נכון

> ‏מטרת הפרק: לבנות שכבת Diagnostics מקצועית ל־Scanner כך שנוכל להבדיל בין שוק שאין בו Opportunity לבין מערכת שלא רואה, מעבדת, מדרגת או מעבירה Candidates נכון. נלמד למדוד Coverage, Freshness, Lag, Rank Churn, Score Distribution, Starvation, Backpressure, Veto Flow, Deep-Path Delay, Candidate Aging, Decision Readiness ו־Replayability.
>
> ‏העיקרון המרכזי: **Scanner טוב אינו רק Scanner שמחזיר Rank #1. Scanner מקצועי חייב גם להיות מסוגל להוכיח שה־Universe כוסה, שהמידע היה fresh, שהחישוב הושלם בזמן, שהדירוג היה אמין, ושכל Candidate שנפסל או נבחר ניתן להסבר ולשחזור.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.

---

# ‏1. למה Scanner Diagnostics הוא רכיב עצמאי

‏במערכת שלנו ה־Scanner יושב בתחילת שרשרת ההחלטה:

```text
Market Data
→ Canonical State
→ Feature Computation
→ Eligibility
→ Score / Rank
→ Deep Analysis
→ Veto / Feasibility
→ Candidate
→ Execution
```

‏אם ה־Scanner טועה מוקדם, כל מה שמגיע אחריו יכול להיות “נכון” ועדיין לפעול על Candidate הלא נכון.

‏לכן צריך לשאול לא רק:

```text
Who is Rank #1?
```

‏אלא גם:

```text
Did we see everyone we intended to see?
Was their data equally fresh?
Did compute finish before the decision expired?
Was Rank #1 actually comparable to the rest?
Was any better candidate silently starved?
Was the deep path still relevant when it completed?
```

---

# ‏2. הבעיה הגדולה: `Healthy No-Trade` מול `Broken No-Trade`

‏שני ימים יכולים להסתיים ב־0 עסקאות.

‏ביום הראשון:

```text
FreshCoverage = 99.9%
EligibleUniverse = healthy
No candidate passed net-edge gate
Decision = NO TRADE
```

‏זה יכול להיות מצב תקין לחלוטין.

‏ביום השני:

```text
FreshCoverage = 41%
DeepPathLag = 3.8s
Top1Age = 2.6s
half the universe is stale
Decision = NO TRADE
```

‏גם כאן התוצאה היא 0 עסקאות — אבל המערכת שבורה.

‏לכן צריך להפריד בין:

```text
Business Outcome
System Health
```

---

# ‏3. ארבע שכבות Diagnostics

‏נשתמש בארבע שכבות עיקריות:

```text
1. Data Diagnostics
2. Scanner Compute Diagnostics
3. Ranking / Candidate Diagnostics
4. Decision Readiness Diagnostics
```

‏ועליהן שכבה חמישית:

```text
Economic Diagnostics
```

‏השכבה הכלכלית אינה אומרת אם המערכת “עובדת טכנית”, אלא אם התוצר שלה עדיין שומר Edge.

---

# ‏4. `ObservedUniverse`

‏זה מספר ה־Symbols שהמערכת קיבלה עליהם State כלשהו.

‏לדוגמה:

```text
ConfiguredUniverse = 4015
ObservedUniverse = 3998
```

‏הפער יכול לנבוע מ:

- ‏Symbol לא קיים עוד.
- ‏Subscription חסר.
- ‏Provider filtering.
- ‏Corporate Action.
- ‏Feed gap.
- ‏Parser error.
- ‏Session state.

‏אסור להסתפק ב־count.

‏צריך לדעת מי חסר ולמה.

---

# ‏5. `EligibleUniverse`

‏לא כל Symbol שנצפה הוא Candidate חוקי.

‏נגדיר:

```text
EligibleUniverse ⊆ ObservedUniverse
```

‏סיבות exclusion יכולות להיות:

- ‏Stale data.
- ‏Missing required feature.
- ‏Halt.
- ‏Unsupported security type.
- ‏Spread too wide.
- ‏Insufficient liquidity.
- ‏Pending order.
- ‏Already in position.
- ‏Cooldown.
- ‏Account restriction.
- ‏Borrow unavailable במקרה Short.

‏ה־Diagnostics חייב לשמור counts לפי reason.

---

# ‏6. `FreshCoverage`

‏אחד המדדים החשובים ביותר:

```text
FreshCoverage = FreshEligibleSymbols / ExpectedEligibleSymbols
```

‏אבל צריך להיזהר מהמכנה.

‏אם חלק מה־Universe אמור להיות inactive כרגע, לא נכון למדוד מול כל הרשימה באופן עיוור.

‏לכן נעדיף גם:

```text
ExpectedActiveUniverse
FreshObservedUniverse
FreshEligibleUniverse
```

---

# ‏7. Freshness אינה Boolean בלבד

‏במקום רק:

```text
Fresh = true / false
```

‏נשמור:

```text
QuoteAgeMs
TradeAgeMs
FeatureAgeMs
ScoreAgeMs
RankAgeMs
DecisionAgeMs
```

‏כך ניתן להבין איפה בדיוק נוצר ה־delay.

---

# ‏8. `Top1Age`

‏Rank #1 יכול להיות “הכי טוב” רק בגלל שהמידע שלו ישן יותר או חדש יותר מהשאר.

‏לכן נשמור:

```text
Top1QuoteAge
Top1FeatureAge
Top1ScoreAge
Top1RankAge
```

‏אם Top1 עצמו stale, אין משמעות אמיתית לדירוג.

---

# ‏9. `Freshness Spread`

‏צריך למדוד לא רק freshness ממוצע אלא שונות בין Symbols.

```text
FreshnessSpread = p95(SymbolAge) - p50(SymbolAge)
```

‏פער גדול יכול ליצור ranking unfairness.

‏Candidate עם data של עכשיו מתחרה מול Symbols שמייצגים שוק מלפני שנייה.

---

# ‏10. `Coverage by Bucket`

‏נמדוד coverage לפי:

- ‏Sector.
- ‏Liquidity bucket.
- ‏Price bucket.
- ‏Activity bucket.
- ‏Exchange/listing venue.
- ‏Regime.
- ‏Session phase.

‏כך נגלה מצב שבו overall coverage נראה טוב אבל קבוצה חשובה כמעט לא נסרקת.

---

# ‏11. Starvation

‏Starvation קורה כאשר Symbols מסוימים מקבלים פחות compute או פחות updates מאחרים.

‏לדוגמה:

```text
high-activity symbols → continuously updated
quiet symbols → repeatedly postponed
```

‏זה יכול להיות intentional optimization.

‏אבל הוא חייב להיות גלוי ומדוד.

---

# ‏12. `StarvationAge`

‏לכל Symbol אפשר לשמור:

```text
LastProcessedAt
NextEligibleProcessAt
StarvationAge
```

‏וכך לזהות Symbols שלא נבדקו זמן בלתי סביר.

---

# ‏13. Fairness אינו שוויון מוחלט

‏אין חובה לתת לכל Symbol אותו compute budget.

‏לעיתים נכון לתת עדיפות ל:

```text
hot symbols
current top candidates
open positions
pending orders
high-information events
```

‏אבל צריך להבדיל בין:

```text
Intentional Priority
Accidental Starvation
```

---

# ‏14. `ProcessingLag`

‏נמדוד:

```text
ProcessingLag = ProcessTime - ReceiveTime
```

‏זה אומר כמה זמן Event חיכה בתוך המערכת לפני שעובד.

---

# ‏15. `EndToDecisionLatency`

‏מדד חשוב יותר:

```text
EndToDecisionLatency = DecisionTime - EventTime
```

‏הוא כולל:

```text
provider delay
network delay
queue delay
feature compute
ranking compute
deep analysis
```

---

# ‏16. Tail Latency

‏הממוצע כמעט תמיד מסתיר את הבעיה.

‏נשמור:

```text
p50
p90
p95
p99
max
```

‏ובמיוחד:

```text
DecisionLatency / SignalHalfLife
```

---

# ‏17. `Latency Pressure`

‏כמו בפרקים קודמים:

```text
LatencyPressure = EndToEndLatency / SignalHalfLife
```

‏אם:

```text
LatencyPressure ≪ 1
```

‏אנחנו בזמן טוב יחסית.

‏אם:

```text
LatencyPressure ≈ 1
```

‏ה־Signal כבר מתקרב לסוף חייו.

---

# ‏18. Queue Depth Diagnostics

‏במערכת event-driven נמדוד:

```text
InputQueueDepth
FeatureQueueDepth
RankQueueDepth
DeepAnalysisQueueDepth
ExecutionQueueDepth
```

‏וכן:

```text
OldestItemAge
```

‏Queue קטנה עם item עתיק עדיין יכולה להיות בעיה.

---

# ‏19. Queue Age חשוב יותר מ־Queue Length לבדו

‏לדוגמה:

```text
QueueLength = 3
OldestItemAge = 2400ms
```

‏יכול להיות גרוע יותר מ:

```text
QueueLength = 200
OldestItemAge = 12ms
```

‏בהתאם ל־horizon.

---

# ‏20. Backpressure

‏Backpressure היא מצב שבו קצב העבודה הנכנס גבוה מיכולת העיבוד.

‏צריך לראות:

```text
InputRate
ProcessingRate
QueueGrowthRate
DroppedEvents
CoalescedEvents
```

---

# ‏21. `DroppedEvents`

‏Drop אינו תמיד bug.

‏במערכת Short-Horizon לעיתים event ישן כבר חסר ערך.

‏אבל צריך לדעת:

```text
what was dropped
why
under which policy
what decision impact it had
```

---

# ‏22. Coalescing

‏במקום לעבד כל event ישן בתור:

```text
A1
A2
A3
A4
```

‏אפשר לעיתים לדלג ישר ל־state האחרון.

‏אבל Coalescing משנה semantics.

‏צריך למדוד:

```text
CoalescedEventCount
CoalescedAgeSaved
CandidateImpact
```

---

# ‏23. Scanner Throughput

‏נמדוד:

```text
SymbolsProcessedPerSecond
FeatureEvaluationsPerSecond
RankUpdatesPerSecond
```

‏אבל throughput לבדו לא אומר freshness.

---

# ‏24. `ScanCycleTime`

‏אם יש scan cycle:

```text
ScanCycleTime = CycleEnd - CycleStart
```

‏ונמדוד:

```text
p50 / p95 / p99
```

‏לא רק average.

---

# ‏25. Full Scan מול Incremental Scan

‏Full Scan diagnostics:

```text
cycle duration
symbols visited
symbols skipped
freshness at cycle end
```

‏Incremental Scanner diagnostics:

```text
update rate
per-symbol age
priority fairness
state consistency
```

---

# ‏26. `FeatureReadiness`

‏לכל Candidate צריך לדעת:

```text
READY
PARTIAL
STALE
NOT_READY
INVALID
```

‏Missing feature לא צריך להפוך אוטומטית ל־0.

---

# ‏27. Feature Readiness Matrix

‏לכל Feature:

```text
FeatureName
ReadyCount
StaleCount
MissingCount
InvalidCount
p95Age
```

‏כך מזהים Feature בודד שמזהם את כל ה־Scanner.

---

# ‏28. `FeatureComputeLag`

‏אם Market Data fresh אבל Feature stale, הבעיה אינה ב־feed.

‏לכן:

```text
FeatureComputeLag = FeatureTime - SourceDataTime
```

---

# ‏29. Feature Error Rate

‏נעקוב אחרי:

```text
NaN
Infinity
Overflow
Invalid denominator
Insufficient history
Unexpected zero
```

‏וכמות ה־Candidates שהושפעו.

---

# ‏30. Silent Defaulting הוא מסוכן

‏דוגמה גרועה:

```text
if missing then value = 0
```

‏זה יכול להפוך `UNKNOWN` ל־signal אמיתי.

‏עדיף:

```text
Value
Quality
Age
Reason
```

---

# ‏31. Score Distribution

‏בכל Decision Epoch כדאי לשמור summary:

```text
min
p10
p25
median
p75
p90
p99
max
mean
stddev
```

‏המטרה אינה סטטיסטיקה לשם סטטיסטיקה.

‏המטרה היא לזהות שינוי באופי ה־Scanner.

---

# ‏32. Score Collapse

‏מצב שבו כמעט כל ה־Scores זהים.

```text
0.501
0.500
0.500
0.499
```

‏Rank #1 קיים — אבל separation כמעט אפסי.

---

# ‏33. Score Explosion

‏מצב שבו Score אחד קופץ בצורה חריגה.

‏זה יכול להיות:

- ‏Edge אמיתי.
- ‏Bad print.
- ‏Normalization failure.
- ‏Missing denominator.
- ‏Unit bug.
- ‏Provider artifact.

‏לכן extreme score הוא גם diagnostic event.

---

# ‏34. `RankGap`

```text
RankGap = Score1 - Score2
```

‏נשמור גם relative form.

‏Rank #1 ללא gap משמעותי הוא שונה מ־Rank #1 שמנותק מהקבוצה.

---

# ‏35. Rank Gap אינו Confidence בפני עצמו

‏Gap גדול יכול להיגרם מ־artifact.

‏לכן הוא דורש Context:

```text
DataQuality
Freshness
ScoreDistribution
ExecutionFeasibility
```

---

# ‏36. `RankChurn`

‏נמדוד כמה מהר ה־Top-K משתנה.

‏אפשר להגדיר:

```text
Top1ChangesPerSecond
TopKTurnover
RankCrossings
```

---

# ‏37. Churn יכול להיות Signal או תקלה

‏Churn גבוה יכול לנבוע מ:

- ‏שוק מהיר אמיתי.
- ‏Score noisy.
- ‏Asynchronous freshness.
- ‏Parameter sensitivity.
- ‏Provider batching.

‏Diagnostics צריך לעזור להבדיל ביניהם.

---

# ‏38. `RankPersistence`

‏לכל Candidate:

```text
TimeAtRank1
TimeInTop3
TimeInTopK
ConsecutiveDecisionEpochs
```

‏אבל persistence אינה תמיד טובה.

‏Signal קצר יכול להיות אמיתי גם אם הוא חי רק 300ms.

---

# ‏39. `RankVelocity`

‏אפשר למדוד:

```text
RankVelocity = PreviousRank - CurrentRank
```

‏למשל מעבר:

```text
rank 120 → 18 → 3 → 1
```

‏עשוי להיות שונה מהותית ממניה שישבה Rank #1 זמן רב.

---

# ‏40. `ScoreVelocity`

‏גם Score עצמו יכול להשתנות מהר.

```text
ScoreVelocity = ΔScore / Δt
```

‏צריך להיזהר מ־double counting אם אותן תנועות כבר משמשות Features.

---

# ‏41. Top-K Snapshot

‏בכל decision חשוב לשמור לפחות:

```text
Rank
Symbol
Score
ScoreComponents
DataAge
FeatureAge
Eligibility
VetoReasons
ExecutionState
```

‏ולא רק את winner.

---

# ‏42. למה לשמור Losers

‏אם שומרים רק Rank #1, אי אפשר לענות אחר כך:

```text
Was #2 actually better?
Did #1 fail because of noise?
Did veto save us?
Did we miss a better candidate?
```

---

# ‏43. Counterfactual Top-K

‏Daily Review צריך לדעת:

```text
What happened to #2..#K?
```

‏מבלי לטעון שהם היו fills אמיתיים.

‏זה Research Evidence, לא actual PnL.

---

# ‏44. `Candidate Funnel`

‏נרצה counts בכל שלב:

```text
Observed
→ Fresh
→ FeatureReady
→ Eligible
→ Scored
→ TopK
→ DeepAnalyzed
→ VetoPassed
→ ExecutionFeasible
→ Selected
→ Submitted
```

---

# ‏45. Funnel Drop Reasons

‏לכל מעבר נשמור:

```text
DropReasonCode
```

‏כגון:

```text
STALE_DATA
MISSING_FEATURE
LOW_ACTIVITY
WIDE_SPREAD
VETO_RECENT_GIVEBACK
DEEP_TIMEOUT
EDGE_BELOW_COST
```

---

# ‏46. Funnel Metrics

‏נמדוד:

```text
PassRateByStage
DropRateByReason
TimeSpentByStage
```

‏כך ניתן לזהות bottleneck לוגי, לא רק performance bottleneck.

---

# ‏47. `NO TRADE` Diagnostics

‏`NO TRADE` צריך Reason.

‏למשל:

```text
NO_ELIGIBLE_CANDIDATE
NO_SCORE_ABOVE_THRESHOLD
TOP_CANDIDATE_STALE
ALL_TOPK_VETOED
EXECUTION_NOT_FEASIBLE
INSUFFICIENT_NET_EDGE
SYSTEM_DEGRADED
```

---

# ‏48. Healthy NO TRADE

‏Healthy case:

```text
SystemHealth = GREEN
FreshCoverage = high
TopK computed
All gates evaluated
Decision = NO TRADE
```

---

# ‏49. Unhealthy NO TRADE

‏Unhealthy case:

```text
SystemHealth = RED
FreshCoverage = low
Deep analysis timed out
Decision unavailable
```

‏זה לא אותו אירוע.

---

# ‏50. `DecisionReadiness`

‏נגדיר state:

```text
READY
DEGRADED
NOT_READY
UNKNOWN
```

‏החלטת Trade דורשת `READY` או policy מפורש ל־degraded mode.

---

# ‏51. `DecisionReadiness` אינו System Health כללי

‏יכול להיות:

```text
logging degraded
but trading path safe
```

‏או להפך:

```text
UI healthy
but market data stale
```

‏צריך Health Model granular.

---

# ‏52. Component Health

‏נשמור states ל:

```text
MarketData
CanonicalState
FeatureEngine
Scanner
Ranker
DeepAnalyzer
VetoEngine
ExecutionAdapter
BrokerConnection
Persistence
Clock
```

---

# ‏53. `First Broken Boundary`

‏ב־incident נרצה לדעת איפה הופיעה הסטייה הראשונה.

```text
Provider good
→ Canonicalizer good
→ FeatureEngine stale
→ Ranking wrong
```

‏ה־RCA מתחיל שם.

---

# ‏54. `First Divergence`

‏ב־Replay:

```text
Expected state
vs
Actual state
```

‏נמצא את ה־timestamp הראשון שבו הם נפרדו.

---

# ‏55. Scanner SLA מול Scanner SLO

‏לא חייבים חוזה פורמלי, אבל כן צריך יעדים.

‏למשל:

```text
FreshCoverage target
p95 DecisionLatency target
max Top1Age
max DeepPathAge
```

‏המספרים עצמם צריכים להגיע ממדידה ו־Signal Half-Life.

---

# ‏56. SLO תלוי Horizon

‏Scanner של 30 דקות יכול לסבול latency שונה לחלוטין מ־Scanner של שניות.

‏לכן:

```text
AbsoluteLatency
```

‏פחות שימושי מ:

```text
LatencyPressure
```

---

# ‏57. SLO תלוי Regime

‏ב־fast market ייתכן שה־same infrastructure מפגרת יותר.

‏נמדוד diagnostics לפי regime.

---

# ‏58. `DeepPathLag`

‏בארכיטקטורת Fast/Deep:

```text
Fast Rank
→ Top-N
→ Deep Analysis
```

‏נמדוד:

```text
DeepStartDelay
DeepComputeTime
DeepResultAge
```

---

# ‏59. Late Deep Result

‏אם Deep Analysis מסיים אחרי שה־candidate כבר איבד relevance:

```text
result = EXPIRED
```

‏לא משתמשים בו כאילו הוא fresh.

---

# ‏60. `CandidateTTL`

‏לכל Candidate אפשר להגדיר TTL.

```text
CandidateCreatedAt
CandidateExpiresAt
```

‏אם analysis/validation חוצה אותו:

```text
NO_ACTION
```

---

# ‏61. `DecisionEpoch`

‏כל round של החלטה יקבל identifier מונוטוני.

```text
DecisionEpoch = 1849921
```

‏כך אפשר לקשור:

```text
TopK
Features
Vetoes
Context
Execution decision
```

‏לאותו רגע לוגי.

---

# ‏62. Candidate Identity

‏Ticker לבדו אינו מספיק.

‏עדיף לחשוב על:

```text
Symbol
Session
DataGeneration
DecisionEpoch
CandidateGeneration
```

---

# ‏63. `DataGeneration`

‏אחרי reconnect או provider failover, state ישן לא צריך להתערבב אוטומטית עם state חדש.

‏נגדיר generation חדש.

---

# ‏64. `RankGeneration`

‏גם Rank יכול לקבל generation.

‏אם underlying data generation השתנתה:

```text
old rank = invalid
```

---

# ‏65. Provider Failover Diagnostics

‏בעת מעבר Provider צריך לראות:

```text
ProviderBefore
ProviderAfter
TransitionTime
WarmupStatus
DistributionShift
CoverageImpact
```

---

# ‏66. Distribution Shift אחרי Failover

‏גם אם שני Providers נותנים “אותו שוק”, ייתכנו הבדלים ב:

- ‏timestamps.
- ‏trade conditions.
- ‏aggregation.
- ‏odd lots.
- ‏coverage.
- ‏latency.

‏לכן Scores עלולים להשתנות.

---

# ‏67. `ScoreVersion`

‏לכל Score נשמור:

```text
ScoreVersion
FeatureSetVersion
ConfigVersion
```

‏בלי זה קשה להשוות ימים.

---

# ‏68. `ConfigFingerprint`

‏Fingerprint צריך לכלול כל parameter שמשפיע על decision.

‏כך אפשר לשחזר Decision בדיוק.

---

# ‏69. Scanner Replayability

‏Scanner מקצועי צריך להיות replayable.

‏כלומר:

```text
same input
same config
same code
same ordering assumptions
→ same decision
```

‏אם יש nondeterminism intentional, גם seed/policy צריכים להישמר.

---

# ‏70. Online/Offline Parity

‏אותו logic של:

```text
features
eligibility
ranking
veto
```

‏צריך להיות משותף ככל האפשר ל־Live ול־Replay.

---

# ‏71. Ordering Bugs

‏שני events עם timestamps קרובים יכולים להגיע בסדר שונה.

‏Diagnostics צריך לשמור:

```text
EventTime
ProviderSequence
ReceiveTime
ProcessTime
```

---

# ‏72. Torn Cross-Section

‏Ranking cross-sectional יכול להשתמש ב־Symbols מזמנים שונים.

‏זה יוצר snapshot שאף פעם לא התקיים במציאות.

---

# ‏73. Cross-Section Age Map

‏נשמור distribution של age בעת ranking:

```text
minAge
medianAge
p95Age
maxAge
```

‏וכן Top-K ages.

---

# ‏74. `FreshCoverageAtDecision`

‏לא מספיק daily FreshCoverage.

‏נשמור אותו בכל decision משמעותי.

---

# ‏75. Rank Fairness

‏שאלה חשובה:

```text
Did all serious contenders have comparable opportunity to be evaluated?
```

‏אם לא, Rank #1 יכול להיות artifact של scheduler.

---

# ‏76. Scheduler Diagnostics

‏נמדוד:

```text
WorkAssignedByPriority
WorkCompletedByPriority
DeadlineMisses
StarvationCount
CanceledStaleTasks
```

---

# ‏77. Hot-Symbol Scheduling

‏Hot-symbol priority יכולה להיות נכונה.

‏אבל היא עלולה לגרום לכך ש־scanner “ממשיך לראות רק את מי שכבר חם”.

‏זו feedback loop מסוכנת.

---

# ‏78. Exploration Budget

‏אפשר לשמור חלק קטן מה־compute ל־coverage של Symbols שלא כרגע Top-K.

‏המטרה אינה Exploration אקראי למסחר.

‏המטרה היא למנוע blind spots של scanner.

---

# ‏79. `MissedMover Analysis`

‏אחרי השוק נשאל:

```text
Which symbols moved strongly but never entered Top-K?
```

‏ואז:

```text
Why?
```

---

# ‏80. Missed Mover Categories

‏סיבות אפשריות:

```text
not observed
stale
feature not ready
filtered
score too low
ranked but outside TopK
vetoed
late deep result
execution infeasible
```

---

# ‏81. Missed Opportunity אינו בהכרח Bug

‏Scanner טוב עדיין יפספס חלק מהמהלכים.

‏המטרה אינה hindsight perfection.

‏המטרה היא להבין אם הפספוס תואם את ה־design.

---

# ‏82. `False Winner Analysis`

‏נבדוק Candidates שהיו Rank #1 אך נכשלו.

‏נפריד:

```text
Prediction Failure
Data Failure
Ranking Failure
Execution Failure
Cost Failure
Regime Failure
Random Outcome
```

---

# ‏83. `Winner's Curse`

‏Rank #1 מתוך אלפי Candidates נוטה להיות extreme.

‏חלק מה־extremeness הוא Noise.

‏Diagnostics צריך להשוות:

```text
Rank1
Rank2-5
Rank6-20
```

‏ולא רק winner מול market average.

---

# ‏84. Rank Bucket Calibration

‏למשל:

```text
Rank 1
Ranks 2-5
Ranks 6-20
Ranks 21-100
```

‏ונמדוד future outcomes לכל bucket.

---

# ‏85. `Rank1Lift`

```text
Rank1Lift = Outcome(Rank1) - Outcome(ComparisonBucket)
```

‏כך בודקים אם המקום הראשון באמת מוסיף ערך.

---

# ‏86. Conditional Rank Diagnostics

‏נמדוד Rank performance לפי:

```text
RankGap
Freshness
Spread
Liquidity
Regime
Session
SignalAge
```

---

# ‏87. Ranking Stability under Perturbation

‏נשאל:

```text
What if one feature changes slightly?
```

‏אם Rank #1 קופץ דרמטית מכל noise קטן, המערכת fragile.

---

# ‏88. Score Sensitivity

‏ל־Research diagnostics:

```text
ΔFeature → ΔScore → ΔRank → ΔDecision
```

‏זה עוזר להבין leverage של כל Feature.

---

# ‏89. `DecisionImpact`

‏Feature או rule חשוב רק אם הוא משנה החלטות.

```text
DecisionImpactRate = DecisionsChanged / DecisionsEvaluated
```

---

# ‏90. High Importance, Low Decision Impact

‏Feature יכול להיראות חשוב סטטיסטית אבל כמעט לא לשנות Candidate בפועל.

‏זו הבחנה חשובה בין:

```text
Model Importance
Operational Importance
```

---

# ‏91. `Veto Diagnostics`

‏ל־60A נמדוד:

```text
VetoCountByReason
HardVetoRate
SoftPenaltyRate
CooldownRate
VetoedTop1Count
```

---

# ‏92. False Veto

‏ב־Research נבדוק:

```text
VetoedCandidate
→ what happened afterward?
```

‏לא כדי לבטל Veto אחרי יום אחד, אלא כדי למדוד Opportunity Cost.

---

# ‏93. False Allow

‏Candidate עבר את כל ה־vetoes ונכשל מיד.

‏צריך לבדוק אם היה Negative Evidence שלא נמדד.

---

# ‏94. Veto Saturation

‏אם כמעט הכול נפסל:

```text
VetoRate ≈ 100%
```

‏יכול להיות שאין הזדמנויות.

‏ויכול להיות שה־rules אגרסיביים מדי.

---

# ‏95. Veto Reason Concentration

‏אם reason אחד אחראי לרוב הפסילות:

```text
STALE_QUOTE = 82%
```

‏אולי הבעיה היא בכלל data pipeline ולא Strategy.

---

# ‏96. Eligibility Diagnostics

‏נשמור counts לפי reason לפני Ranking.

‏זה מונע מצב שבו Rank נראה יציב רק כי ה־Universe קטן בטעות.

---

# ‏97. `Observed → Eligible` Ratio

‏ירידה חדה ביחס יכולה להצביע על:

- ‏Data issue.
- ‏Rule drift.
- ‏Session transition.
- ‏Market regime.
- ‏Configuration bug.

---

# ‏98. Execution Feasibility Diagnostics

‏ל־Top-K נמדוד:

```text
Spread
Depth
ExpectedSlippage
FillProbability
ExitFeasibility
RemainingNetEdge
```

---

# ‏99. Predictive Rank מול Executable Rank

‏צריך לדעת כמה Candidates יורדים בדירוג בגלל execution reality.

‏זה מידע חשוב בפני עצמו.

---

# ‏100. `ExecutionRankDelta`

```text
ExecutionRankDelta = PredictiveRank - ExecutableRank
```

‏כך ניתן לראות מי “נראה טוב” אבל אינו Tradeable.

---

# ‏101. `PreSubmitRevalidation`

‏לפני Order צריך snapshot חדש.

‏Diagnostics ישמור:

```text
OriginalRank
CurrentRank
OriginalScore
CurrentScore
OriginalSpread
CurrentSpread
OriginalAge
CurrentAge
```

---

# ‏102. Revalidation Failure Rate

‏אם רבים מה־Candidates נכשלים רגע לפני submit, ייתכן שה־decision path איטי מדי.

---

# ‏103. `DecisionTTL Miss Rate`

```text
ExpiredBeforeDecision / Candidates
```

‏מדד קריטי ל־Short-Horizon.

---

# ‏104. `DeepTimeoutRate`

‏אם Deep Path timeout גבוה:

‏צריך להבין אם:

- ‏Top-N גדול מדי.
- ‏מודל כבד מדי.
- ‏scheduler לא נכון.
- ‏hardware saturated.
- ‏deadline קצר מדי.

---

# ‏105. Timeout אינו Error בהכרח

‏אם policy היא:

```text
late result = discard
```

‏זה יכול להיות behavior תקין.

‏אבל שיעור timeout גבוה יכול לומר שהארכיטקטורה לא מתאימה ל־horizon.

---

# ‏106. `CandidateConversionRate`

```text
Selected / TopK
Submitted / Selected
Filled / Submitted
```

‏לא כ־KPI של “יותר זה טוב”.

‏אלא כדי להבין את ה־funnel.

---

# ‏107. Low Trade Rate אינו בהכרח רע

‏ייתכן שה־`NO TRADE` gate עושה עבודה מצוינת.

‏לכן חייבים להשוות גם counterfactuals.

---

# ‏108. High Trade Rate אינו בהכרח טוב

‏יכול להעיד על threshold נמוך מדי או Veto חלש מדי.

---

# ‏109. Scanner Economic Diagnostics

‏מעבר לבריאות הטכנית:

```text
ForwardNetReturnByRank
ExecutableRateByRank
FillRateByRank
AdverseSelectionByRank
TimeToTargetByRank
MFEByRank
MAEByRank
```

---

# ‏110. `NetForwardOutcome`

‏עדיף על raw future return כאשר בוחנים Candidates למסחר.

‏ננסה לכלול:

```text
spread
slippage
fees
estimated exit cost
```

---

# ‏111. Rank Diagnostics ללא Leakage

‏כל metric post-event חייב להשתמש רק ב־future לצורך label, לא לצורך decision reconstruction.

---

# ‏112. Separate Decision Snapshot from Outcome

‏נשמור:

```text
DecisionSnapshot
OutcomeRecord
```

‏כשתי ישויות שונות.

---

# ‏113. `AsObserved` מול `AsLaterKnown`

‏ב־scanner diagnostics צריך לדעת מה המערכת ראתה בזמן אמת.

‏Data מתוקן מאוחר יותר אינו תחליף.

---

# ‏114. Replay Diagnostics

‏ב־Replay נשווה:

```text
LiveObservedRank
ReplayRank
```

‏ונחקור כל divergence.

---

# ‏115. Determinism Diagnostics

‏אותו input צריך להפיק אותו output.

‏אם לא:

```text
Ordering?
Clock?
Concurrency?
Floating point?
Randomness?
External dependency?
```

---

# ‏116. Floating-Point Tie Diagnostics

‏Ranks קרובים מאוד יכולים להשתנות עקב precision.

‏צריך deterministic tie-breaking.

---

# ‏117. Tie Rate

```text
NearTieRate
ExactTieRate
```

‏יכולים ללמד אם Score חסר resolution.

---

# ‏118. `ScoreEntropy`

‏אפשר להשתמש במדד concentration/entropy כדי להבין האם distribution מפוזר או שכל ה־mass מרוכז במספר קטן של Candidates.

‏זה diagnostic, לא trading rule אוטומטי.

---

# ‏119. Candidate Concentration

‏אם Top-K מגיע שוב ושוב מאותו:

- ‏Sector.
- ‏Theme.
- ‏Liquidity bucket.
- ‏Price bucket.

‏צריך להבין אם זו הזדמנות אמיתית או bias.

---

# ‏120. Correlated Winners

‏10 Candidates ב־Top-10 אינם בהכרח 10 רעיונות עצמאיים.

‏הם יכולים להיות manifestation של אותו market move.

---

# ‏121. `IndependentOpportunityCount`

‏אפשר לחקור מדד שמעריך כמה Opportunities אפקטיביות באמת יש, אחרי correlation/clustering.

---

# ‏122. Session Diagnostics

‏נפריד:

```text
Pre-open
Open transition
Regular session
Midday
Close transition
After-hours
```

‏בהתאם ל־scope של המערכת.

---

# ‏123. Cold Start Diagnostics

‏בתחילת session Features מסוימים עדיין לא מוכנים.

‏נמדוד:

```text
WarmupCompletion
FeatureReadyRatio
EligibleRatio
```

---

# ‏124. Warmup Illusion

‏מערכת יכולה להיראות “בריאה” כי היא מפיקה Rank — למרות שחצי מה־features defaulted.

‏לכן Rank לא מאשר readiness.

---

# ‏125. Reconnect Diagnostics

‏לאחר reconnect:

```text
DataGeneration changed?
State rebuilt?
Warmup complete?
Open orders reconciled?
Rank reset?
```

---

# ‏126. Stale Rank after Reconnect

‏אסור להשאיר Top-K קודם כ־authoritative אחרי data discontinuity ללא validation.

---

# ‏127. Scanner State Checkpoint

‏אפשר לשמור checkpoint לצורך diagnostics/recovery.

‏אבל authoritative market state צריך להגיע מהמקור הנכון לאחר reconnect.

---

# ‏128. Alerting Philosophy

‏לא כל metric deviation הוא alert.

‏נבדיל:

```text
Info
Warning
Action Required
Trading Block
```

---

# ‏129. Symptom vs Cause

‏דוגמה:

```text
Top1Age high
```

‏זו תוצאה.

‏הגורם יכול להיות:

```text
provider lag
queue backlog
feature compute
scheduler starvation
GC pause
```

---

# ‏130. Alerts צריכים להיות Actionable

‏Alert טוב עונה:

```text
What is wrong?
Which decisions are affected?
What state is system in?
What automatic protection is active?
What should operator inspect?
```

---

# ‏131. Alert Storm

‏Incident אחד יכול ליצור עשרות symptoms.

‏צריך correlation/root-cause grouping.

---

# ‏132. `TradingImpact`

‏לכל incident כדאי לחשב:

```text
NoImpact
ResearchOnly
CandidateSelectionImpact
ExecutionImpact
ExposureImpact
```

---

# ‏133. Fail Closed for Unknown Trading Impact

‏אם אי אפשר לדעת האם fault משפיע על Entry safety:

‏המדיניות הבטוחה היא בדרך כלל לחסום Entries חדשים עד reconciliation.

---

# ‏134. Exit Path Priority

‏גם כאשר Scanner degraded:

```text
position monitoring
exit logic
broker reconciliation
```

‏צריכים לקבל עדיפות על scanning חדש.

---

# ‏135. Business-Priority Load Shedding

‏בעת עומס:

```text
1. protect open positions
2. reconcile orders
3. maintain top candidates
4. preserve broad freshness
5. defer low-value diagnostics
```

‏הסדר המדויק צריך להיות policy מתועד.

---

# ‏136. Diagnostics יכולים בעצמם להעמיס

‏אסור ש־telemetry יהרוס את hot path.

‏נדרש:

```text
bounded logging
sampling
async export
aggregation
```

---

# ‏137. Observability Cost Budget

‏נמדוד גם:

```text
TelemetryCPU
TelemetryAllocations
TelemetryQueueAge
DroppedTelemetry
```

---

# ‏138. High-Cardinality Trap

‏Label לכל Symbol×Feature×DecisionEpoch יכול לפוצץ מערכת metrics.

‏לכן raw evidence ו־aggregated metrics הם שכבות שונות.

---

# ‏139. Metrics מול Event Journal

‏Metrics טובים ל־trends.

‏Event Journal טוב ל־forensics.

‏צריך את שניהם.

---

# ‏140. `Decision Packet`

‏לכל החלטה משמעותית נשמור packet קטן:

```text
DecisionEpoch
Timestamp
UniverseCounts
FreshCoverage
TopK
RankGap
Top1Age
VetoSummary
ExecutionFeasibility
Decision
ReasonCodes
ConfigFingerprint
```

---

# ‏141. Incident Packet

‏בעת anomaly נשמור context רחב יותר:

```text
queues
latencies
component health
provider state
GC/runtime stats
recent decisions
open exposure
```

---

# ‏142. `Why This Candidate?`

‏המערכת צריכה לענות:

```text
Why did XYZ become candidate?
```

‏עם component scores ו־gates.

---

# ‏143. `Why Not This Candidate?`

‏לא פחות חשוב:

```text
Why did ABC not trade?
```

‏יכול להיות:

```text
rank 2
hard veto
stale
spread
net edge
pending exposure
```

---

# ‏144. Explainability אינה רק UI

‏Reason Codes צריכים להגיע מה־decision logic עצמו.

‏לא ליצור explanation בדיעבד לפי guess.

---

# ‏145. Scanner Dashboard — Operational View

‏מינימום שימושי:

```text
Observed / Expected Universe
FreshCoverage
EligibleCount
Top1Age
p95 DecisionLatency
QueueAge
DeepTimeoutRate
SystemHealth
```

---

# ‏146. Scanner Dashboard — Ranking View

```text
Top-K
Score
RankGap
RankPersistence
RankChurn
FeatureReadiness
VetoState
```

---

# ‏147. Scanner Dashboard — Economic View

```text
RankBucketForwardOutcome
ExecutableRate
FillRate
AdverseSelection
NoTradeRate
MissedMoverRate
```

---

# ‏148. Dashboard אינו Source of Truth

‏ה־dashboard מציג state.

‏Event Journal / canonical stores הם evidence.

---

# ‏149. Daily Scanner Review

‏בסוף יום נרצה:

```text
Coverage summary
Freshness summary
Latency summary
Rank behavior
Veto flow
Missed movers
False winners
Decision health
Anomalies
```

---

# ‏150. Weekly Scanner Review

‏בשבועי נבדוק trends:

```text
FreshCoverage drift
Latency drift
Top1 success drift
Rank churn drift
Eligibility drift
Data-quality drift
```

---

# ‏151. Scanner Regression Detection

‏שינוי קוד יכול לגרום:

```text
same data
→ different ranks
```

‏לכן צריך golden replay datasets.

---

# ‏152. Golden Scanner Scenarios

‏נשמור scenarios כגון:

```text
clean momentum
stale top1
near tie
provider gap
score outlier
all vetoed
fast-market burst
reconnect
```

---

# ‏153. Invariants

‏דוגמאות:

```text
STALE candidate cannot be READY
Ranked candidate must have ScoreVersion
Decision must have ConfigFingerprint
Expired candidate cannot be submitted
UNKNOWN critical state cannot silently become eligible
```

---

# ‏154. Property-Based Tests

‏אפשר לבדוק properties כמו:

```text
Increasing data age never improves freshness state
Hard veto never produces TRADE
Tie-break is deterministic
Expired deep result cannot re-enter current generation
```

---

# ‏155. Metamorphic Tests

‏דוגמה:

‏אם מכפילים את כל prices בגלל split-adjusted representation נכון, Features יחסיים מסוימים אמורים להישאר שקולים.

‏אם לא — ייתכן unit/normalization bug.

---

# ‏156. Fault Injection

‏נבדוק Scanner תחת:

```text
provider disconnect
out-of-order events
slow feature engine
queue burst
GC pause
partial universe loss
clock skew
```

---

# ‏157. Load Test אינו רק Throughput

‏צריך לבדוק תחת load:

```text
FreshCoverage
Top1Age
DeadlineMissRate
Decision correctness
```

‏ולא רק events/sec.

---

# ‏158. Soak Test

‏מערכת יכולה להיות מהירה ל־5 דקות ולהידרדר אחרי שעות.

‏נבדוק:

- ‏memory growth.
- ‏queue drift.
- ‏timer drift.
- ‏state leaks.
- ‏latency tails.

---

# ‏159. Performance Regression Budget

‏שינוי Feature יכול להיות “נכון יותר” אבל להאריך Deep Path מעבר ל־TTL.

‏אז הוא עלול להיות גרוע כלכלית.

---

# ‏160. `Scanner Utility`

‏אפשר לחשוב על scanner utility כ:

```text
ScannerUtility
= PredictiveQuality
× Freshness
× Coverage
× DecisionTimeliness
× Executability
```

‏לא כנוסחה סופית אלא כמודל חשיבה.

---

# ‏161. אין Metric יחיד שמסכם Scanner

‏Metric יחיד מסתיר failure modes שונים.

‏לכן נעדיף dashboard רב־ממדי.

---

# ‏162. Operational Scorecard

‏אפשר לקבץ:

```text
Coverage
Freshness
Latency
Backpressure
Readiness
```

---

# ‏163. Economic Scorecard

```text
Rank Lift
Executable Rate
Net Forward Outcome
Adverse Selection
Missed Opportunity
```

---

# ‏164. Data Scorecard

```text
Gap Rate
Duplicate Rate
OutOfOrderRate
InvalidValueRate
StaleRate
ProviderMismatch
```

---

# ‏165. Decision Scorecard

```text
TradeRate
NoTradeRate
VetoRate
PreSubmitFailureRate
DecisionTTLExpiry
```

---

# ‏166. `Scanner Health State`

‏אפשר להחזיק state:

```text
GREEN
YELLOW
RED
UNKNOWN
```

‏אבל state זה צריך להיבנות מ־rules שקופים.

---

# ‏167. GREEN אינו “אפשר לסחור תמיד”

‏GREEN אומר:

```text
scanner health acceptable
```

‏עדיין Candidate יכול להיות `NO TRADE`.

---

# ‏168. RED אינו “השוק רע”

‏RED אומר:

```text
system observation/decision path not trustworthy enough
```

‏זו הבחנה קריטית.

---

# ‏169. UNKNOWN הוא State אמיתי

‏אם אין telemetry מספיק:

```text
Health = UNKNOWN
```

‏לא מנחשים GREEN.

---

# ‏170. Scanner Diagnostics ו־Kill Switch

‏Diagnostics יכולים להפעיל safety controls כאשר:

```text
FreshCoverage below critical level
Clock invalid
Provider generation unresolved
Decision latency beyond safe envelope
State divergence detected
```

---

# ‏171. אבל Diagnostics לא צריכים לנהל Strategy

‏הם מספקים state ו־evidence.

‏Strategy/Control Plane מחליטים מה לעשות עם זה לפי policy.

---

# ‏172. Scanner Diagnostics ו־Daily Review

‏שלב 73 משתמש בתוצרים של שלב 74 כדי לענות:

```text
Was today bad because market had no edge?
Or because scanner degraded?
```

---

# ‏173. Scanner Diagnostics ו־RCA

‏RCA טוב עובר בסדר:

```text
Universe
→ Data
→ Feature
→ Eligibility
→ Score
→ Rank
→ Deep Path
→ Veto
→ Revalidation
→ Execution
```

‏ומחפש את ה־First Divergence.

---

# ‏174. Scanner Diagnostics ו־Champion/Challenger

‏אפשר להריץ שני Rankers ב־Shadow:

```text
Champion
Challenger
```

‏ולמדוד:

```text
DecisionDisagreement
TopKOverlap
RankCorrelation
CounterfactualOutcome
ComputeCost
LatencyImpact
```

---

# ‏175. `TopKOverlap`

‏מדד פשוט:

```text
|TopK_A ∩ TopK_B| / K
```

‏נותן אינדיקציה כמה שני מנגנונים באמת שונים.

---

# ‏176. Rank Correlation

‏Spearman correlation יכול לעזור להבין similarity רחבה בין rankings.

‏אבל Decision Disagreement לעיתים חשוב יותר כלכלית.

---

# ‏177. `DecisionDisagreement`

```text
same candidate?
same trade/no-trade?
same veto?
same execution feasibility?
```

‏זה metric קרוב יותר לפעולה.

---

# ‏178. Scanner Diagnostics ו־Feature Retirement

‏אם Feature:

```text
rarely changes decisions
adds latency
creates instability
adds no OOS value
```

‏הוא candidate לפרישה.

---

# ‏179. Diagnostics נגד Complexity Creep

‏כל Feature חדש צריך לשלם “מס מורכבות”.

‏נמדוד:

```text
IncrementalDecisionValue
vs
LatencyCost
OperationalCost
FailureSurface
```

---

# ‏180. Scanner Diagnostics כ־Learning System

‏Diagnostics אינו רק monitoring.

‏הוא מייצר Evidence שמזין:

```text
Daily Review
→ Research Queue
→ Experiments
→ Challenger
→ Shadow
→ Promotion / Rejection
```

---

# ‏181. `Practitioner Secret`: Rank #1 תמיד קיים — Opportunity לא

‏אם יש לפחות Candidate אחד, sort תמיד יחזיר מקום ראשון.

‏זו אמת מתמטית בלבד.

‏היא לא אומרת שיש Trade ראוי.

---

# ‏182. `Practitioner Secret`: Coverage bug יכול להיראות כמו Alpha

‏אם Symbols “קשים” נופלים מה־pipeline, ה־remaining sample עלול להיראות איכותי יותר.

‏זו יכולה להיות אשליית Edge שנוצרה מ־data loss.

---

# ‏183. `Practitioner Secret`: Low churn אינו תמיד Stability טובה

‏Rank קפוא יכול להיות:

- ‏Signal יציב.
- ‏או Scanner שלא מתעדכן.

‏צריך freshness context.

---

# ‏184. `Practitioner Secret`: High churn אינו תמיד Noise

‏ב־fast market, churn אמיתי יכול להיות המידע עצמו.

‏Smoothing עיוור יכול למחוק Edge.

---

# ‏185. `Practitioner Secret`: Stale winner הוא failure mode מסוכן

‏Candidate יכול להישאר Rank #1 כי הוא פשוט לא עודכן בזמן ששאר השוק השתנה.

‏לכן Age חייב להיות חלק מה־diagnostics ומה־eligibility.

---

# ‏186. `Practitioner Secret`: Better ranking can be worse trading

‏Ranker כבד יותר יכול לשפר offline metric אך לסיים מאוחר מדי.

‏לכן:

```text
Offline Rank Quality
```

‏אינה מספיקה בלי:

```text
Decision Timeliness
```

---

# ‏187. `Practitioner Secret`: Missing losers destroys learning

‏אם שומרים רק Trades ו־Top1, אי אפשר ללמוד למה Ranker טעה.

‏Top-K + rejected candidates הם research gold.

---

# ‏188. `Practitioner Secret`: Health metrics need economic context

‏Latency degradation של 20ms יכולה להיות חסרת משמעות ל־Signal איטי וקריטית ל־Signal קצר.

‏לכן thresholds צריכים להתחבר ל־Signal Half-Life.

---

# ‏189. `Practitioner Secret`: Diagnostics must survive the incident

‏אם telemetry נעלמת בדיוק תחת overload, איבדנו את הרגע שבו הכי צריך אותה.

‏לכן diagnostics path עצמו צריך להיות bounded, durable מספיק ו־degradation-aware.

---

# ‏190. Baseline מוצע לרובוט שלנו

‏כ־baseline לימודי, לא recommendation production סופי:

```text
1. Maintain Expected / Observed / Eligible counts.
2. Track per-symbol freshness and FreshCoverage.
3. Track queue age and p95/p99 decision latency.
4. Store Top-K decision snapshots.
5. Store RankGap, RankChurn and Top1Age.
6. Track FeatureReadiness and feature age.
7. Track Veto funnel and ReasonCodes.
8. Track DeepPath deadlines and expirations.
9. Revalidate candidate immediately before submit.
10. Separate Healthy NO TRADE from System-Degraded NO TRADE.
11. Persist DecisionEpoch + ConfigFingerprint + DataGeneration.
12. Measure rank-bucket outcomes and missed movers offline.
13. Feed diagnostics into Daily Review and RCA.
```

---

# ‏191. מה לא הייתי עושה כ־Baseline

‏לא הייתי מתחיל מ:

- ‏Dashboard ענק עם מאות charts.
- ‏Single “Scanner Score” שמסתיר dimensions.
- ‏Full tracing של כל event ב־hot path ללא budget.
- ‏ML anomaly detector לפני שיש deterministic metrics.
- ‏Auto-tuning בעקבות diagnostics.
- ‏Auto-disable של rules בלי controlled workflow.

---

# ‏192. Contract מינימלי לכל Decision

```text
DecisionEpoch
ObservedUniverseCount
EligibleUniverseCount
FreshCoverage
TopK
RankGap
Top1Age
FeatureReadiness
VetoSummary
DecisionReadiness
Decision
ReasonCodes
ConfigFingerprint
DataGeneration
```

---

# ‏193. Contract מינימלי לכל Candidate ב־Top-K

```text
Symbol
Rank
RawScore
PredictiveScore
ExecutableScore
ScoreVersion
FeatureAge
DataAge
RankPersistence
Eligibility
VetoReasons
ExecutionFeasibility
CandidateTTL
```

---

# ‏194. Contract מינימלי לכל Incident

```text
IncidentId
FirstObservedAt
FirstBrokenBoundary
AffectedDecisionEpochs
ComponentHealth
QueueAges
FreshCoverage
TopKSnapshot
ExposureState
AutomaticProtection
RecoveryEvidence
```

---

# ‏195. Definition of Healthy Scanner

‏Scanner בריא הוא Scanner שבו:

```text
Universe coverage is known
Freshness is bounded and visible
Compute deadlines are met or explicitly failed
Ranking is deterministic and explainable
Top-K is preserved for research
Veto flow is visible
Decision readiness is explicit
Replay can reproduce decisions
Degradation cannot masquerade as NO TRADE
```

---

# ‏196. Definition of Diagnosable Failure

‏Failure הוא diagnosable כאשר אפשר לענות:

```text
When did it begin?
Which symbols were affected?
Which component diverged first?
Which decisions changed?
Was exposure affected?
Which protection activated?
Can replay reproduce it?
```

---

# ‏197. Definition of Useful Scanner Diagnostics

‏Diagnostics שימושי אם הוא עוזר לקבל לפחות אחת מהחלטות האלה:

```text
continue normally
enter degraded mode
block new entries
prioritize recovery
open RCA
create research hypothesis
retire a feature
reject a scanner change
```

---

# ‏198. שאלות שחייבים להיות מסוגלים לענות עליהן

1. ‏כמה מה־Universe באמת היה fresh בכל החלטה חשובה?
2. ‏האם Rank #1 ניצח מול Candidates שנמדדו באותו freshness envelope?
3. ‏כמה זמן עבר מ־market event עד decision?
4. ‏מה היה Top-K ומה היה RankGap?
5. ‏למה Candidate נפסל?
6. ‏למה לא בחרנו Rank #2?
7. ‏כמה Candidates פגו לפני decision?
8. ‏האם Deep Path מסיים לפני TTL?
9. ‏האם scheduler מרעיב Symbols מסוימים?
10. ‏האם Score distribution השתנה?
11. ‏האם provider failover שינה semantics?
12. ‏האם NO TRADE היה עסקי או תפעולי?
13. ‏האם אפשר לשחזר את ההחלטה ב־Replay?
14. ‏מה היה ה־First Divergence במקרה תקלה?
15. ‏האם Scanner health degradation כבר פוגע ב־economic outcome?

---

# ‏199. התמונה השלמה

```text
Market Data Health
        ↓
Fresh Canonical State
        ↓
Feature Readiness
        ↓
Eligibility
        ↓
Score / Rank
        ↓
Top-K Diagnostics
        ↓
Deep Analysis
        ↓
Veto / Feasibility
        ↓
Decision Readiness
        ↓
TRADE / NO TRADE
        ↓
Outcome + Counterfactuals
        ↓
Daily Review / RCA / Research
```

---

# ‏200. סיכום

‏Scanner Diagnostics אינו “מסך ניטור”.

‏הוא שכבת Evidence שמוכיחה שהחלטת Scanner נוצרה מתוך Universe שנצפה כראוי, Data fresh, Features מוכנים, compute בזמן, Ranking בר־השוואה, Vetoes שקופים ו־Decision state שניתן לשחזור.

‏המבחן המקצועי אינו רק:

```text
Did Rank #1 look good?
```

‏אלא:

```text
Did the scanner have a fair, fresh, complete and timely view of the relevant market,
and can we prove why this candidate won or why nobody should have traded?
```

‏זה ההבדל בין Scanner שמפיק רשימה לבין Scanner שאפשר לסמוך על תהליך ההחלטה שלו במחקר, Replay, Shadow ו־Production.