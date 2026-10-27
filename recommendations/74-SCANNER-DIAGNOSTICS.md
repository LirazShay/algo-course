# ‏74 — Recommendation Sheet: Scanner Diagnostics

> ‏מקור לימודי עיקרי: `../74-SCANNER-DIAGNOSTICS.md`.
>
> ‏מטרת הקובץ: להגדיר שכבת Diagnostics שמוכיחה שה־Scanner ראה Universe מספיק שלם, fresh ובר־השוואה, שהחישוב הסתיים בזמן, שה־Top-K נוצר ללא starvation או stale-state artifacts, ושכל `TRADE / NO TRADE` ניתן להסבר ולשחזור.
>
> ‏המקטע מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture. הוא אינו הוראה לבצע מסחר בכסף אמיתי ואינו מניח ש־Rank גבוה או Scanner ירוק מוכיחים Edge.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Who is Rank #1?
```

‏אלא:

```text
At this DecisionEpoch,
did the scanner have a sufficiently complete,
fresh, fair and timely view of the relevant universe,
and can we prove why the selected candidate won
or why NO TRADE was the correct outcome?
```

‏שרשרת האבחון המומלצת:

```text
Expected Universe
→ Observed Universe
→ Fresh Comparable State
→ Feature Readiness
→ Eligibility
→ Score / Rank
→ Top-K Snapshot
→ Deep Path
→ Veto / Execution Feasibility
→ Decision Readiness
→ TRADE / NO TRADE Research Outcome
→ Replay / Daily Review / RCA
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: להפריד `Market Opportunity`, ‏`Scanner Health` ו־`Business Outcome`

‏שלושת הדברים אינם זהים:

```text
MarketOpportunity
ScannerHealth
BusinessOutcome
```

‏אפשר לקבל:

```text
healthy scanner + no opportunity → HEALTHY_NO_TRADE
```

‏ואפשר לקבל:

```text
scanner degraded + no decision → DEGRADED_NO_TRADE
```

‏אסור לשלב אותם תחת `0 trades` או `NO TRADE` יחיד.

### ‏`P0 — Required`: ‏`DecisionReadiness` מפורש

‏לכל Decision Epoch נשמור:

```text
READY
DEGRADED
NOT_READY
UNKNOWN
```

‏`ScannerHealth = GREEN` אינו אישור Strategy, ו־`RED` אינו אומר שהשוק רע.

‏כאשר critical state הוא `UNKNOWN` או לא ניתן להוכיח comparison תקין:

```text
No new actionable candidate
```

‏מחקר/diagnostics יכולים להמשיך, אבל הם מסומנים כלא־actionable.

### ‏`P0 — Required`: ‏Point-in-Time comparable cross-section

‏Ranking actionable דורש לא רק Rank חדש אלא Inputs בני־השוואה בזמן.

‏לכל Decision Epoch נשמור לפחות:

```text
ExpectedActiveUniverse
ObservedUniverseCount
FreshObservedUniverseCount
FreshEligibleUniverseCount
FreshCoverageAtDecision
median_input_age
p95_input_age
max_input_age
Top1DataAge
Top1FeatureAge
Top1ScoreAge
Top1RankAge
```

‏Cross-section שבו Candidate אחד בן `20ms` ואחר בן `2s` אינו אוטומטית ranking הוגן.

### ‏`P0 — Required`: ‏`Freshness != Boolean`

‏לכל Symbol/Candidate נפריד:

```text
QuoteAge
TradeAge
FeatureAge
ScoreAge
RankAge
DecisionAge
```

‏`FreshnessSpread` ו־age distribution חשובים לפחות כמו average freshness.

### ‏`P0 — Required`: ‏`Decision Packet` לכל החלטה משמעותית

```text
DecisionEpoch
DecisionTime
ExpectedUniverseCount
ObservedUniverseCount
EligibleUniverseCount
FreshCoverageAtDecision
TopK
RankGap
Top1Age
FeatureReadinessSummary
VetoSummary
ExecutionFeasibilitySummary
DecisionReadiness
Decision
ReasonCodes
ConfigFingerprint
DataGeneration
RankGeneration
```

‏זהו בסיס ה־Evidence ל־Replay, ‏Daily Review ו־RCA.

### ‏`P0 — Required`: ‏Top-K נשמר, לא רק Winner

‏לכל Candidate ב־Top-K:

```text
Symbol / SecurityId
Rank
RawScore
PredictiveScore
ExecutableScore
ScoreComponents
ScoreVersion
DataAge
FeatureAge
RankPersistence
Eligibility
VetoReasons
ExecutionFeasibility
CandidateTTL
```

‏בלי losers אי אפשר להעריך Winner's Curse, missed candidates, false veto או ranking error.

### ‏`P0 — Required`: ‏`First Broken Boundary`

‏RCA של Scanner עובר בסדר:

```text
Universe
→ Provider / Data
→ Canonical State
→ Feature
→ Eligibility
→ Score
→ Rank
→ Deep Path
→ Veto
→ Revalidation
→ Execution handoff
```

‏החקירה מתחילה בנקודה הראשונה שבה actual state סטה מ־expected state — לא ב־PnL הסופי.

### ‏`P0 — Required`: ‏Generation boundaries

‏לאחר reconnect, provider failover או discontinuity משמעותי:

```text
DataGeneration++
RankGeneration++ when required
```

‏Rank ישן אינו authoritative בתוך generation חדש עד warm-up/revalidation.

### ‏`P0 — Required`: ‏Expired Candidate אינו Candidate

‏לכל Candidate:

```text
CandidateCreatedAt
CandidateExpiresAt
CandidateTTL
```

‏Deep result שמגיע אחרי expiry מקבל:

```text
EXPIRED
```

‏ולא חוזר למסלול actionable.

### ‏`P0 — Required`: ‏Revalidation סמוך ל־handoff

‏לפני העברת Candidate לשכבת execution research נשווה:

```text
OriginalRank      vs CurrentRank
OriginalScore     vs CurrentScore
OriginalSpread    vs CurrentSpread
OriginalDataAge   vs CurrentDataAge
OriginalFeasibility vs CurrentFeasibility
```

‏שיעור גבוה של failures ברגע האחרון הוא evidence לכך שה־pipeline איטי מדי או שה־TTL אינו מתאים.

---

## ‏3. `P1` — Operational Diagnostics Baseline

### ‏Coverage

‏נשמור:

```text
ConfiguredUniverse
ExpectedActiveUniverse
ObservedUniverse
EligibleUniverse
ExcludedCountByReason
CoverageByBucket
```

‏`CoverageByBucket` כולל כאשר רלוונטי:

```text
sector
liquidity bucket
price bucket
activity bucket
listing venue
session phase
```

‏כך overall coverage גבוה לא מסתיר blind spot בקבוצה חשובה.

### ‏Fair Scheduling / Starvation

‏אין דרישה לשוויון compute מוחלט.

‏כן נדרש להבדיל:

```text
IntentionalPriority
AccidentalStarvation
```

‏Metrics:

```text
LastProcessedAt
StarvationAge
WorkAssignedByPriority
WorkCompletedByPriority
DeadlineMisses
StarvationCount
CanceledStaleTasks
```

‏Hot-symbol priority מותרת רק כאשר קיימת broad-coverage safeguard שמונעת feedback loop של “רואים רק את מי שכבר חם”.

### ‏Queue / Backpressure

‏נמדוד לפחות:

```text
InputQueueDepth
FeatureQueueDepth
RankQueueDepth
DeepAnalysisQueueDepth
OldestItemAge
InputRate
ProcessingRate
QueueGrowthRate
DroppedEvents
CoalescedEvents
```

‏`QueueAge` חשוב יותר מ־length לבדו.

### ‏Load Shedding

‏בעת overload סדר העדיפויות המומלץ ארכיטקטונית:

```text
1. preserve existing-position safety / reconciliation
2. preserve current high-value candidate state
3. preserve broad freshness
4. discard expired work
5. reduce low-value diagnostics / deferred analytics
```

‏ה־policy חייב להיות deterministic ומתועד.

### ‏Dropped / Coalesced Events

‏Drop או coalescing אינם בהכרח bug, אך לכל החלטה כזו נשמור:

```text
What
Why
PolicyVersion
AgeSaved
DecisionImpact
```

‏אין silent dropping.

---

## ‏4. `P1` — Feature / Ranking Diagnostics

### ‏Feature Readiness Matrix

```text
FeatureName
READY / PARTIAL / STALE / NOT_READY / INVALID
ReadyCount
StaleCount
MissingCount
InvalidCount
p95Age
```

‏`Missing != 0`.

‏כל Feature ערכי נושא לפחות:

```text
Value
Quality
Age
Reason
```

### ‏Feature Compute Lag

```text
FeatureComputeLag = FeatureAsOf - SourceDataAsOf
```

‏כך feed fresh + feature stale מזוהה כ־compute problem ולא כ־market-data problem.

### ‏Score Distribution

‏לכל Decision Epoch או sample מבוקר נשמור:

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
NearTieRate
ExactTieRate
```

‏נזהה לפחות:

```text
ScoreCollapse
ScoreExplosion
OutlierScore
Unit / normalization anomaly
```

### ‏Rank Gap / Churn / Persistence

```text
RankGap
RelativeRankGap
Top1ChangesPerSecond
TopKTurnover
RankCrossings
TimeAtRank1
TimeInTopK
RankVelocity
```

‏אף אחד מהם אינו Confidence לבדו.

‏כל interpretation דורש Freshness, data quality, market context ו־execution feasibility.

### ‏Deterministic Tie-Breaking

‏Near-ties חייבים deterministic rule.

‏אין להשאיר rank order תלוי scheduling, hash iteration order או floating-point noise בלתי מתועד.

---

## ‏5. `P1` — Candidate Funnel ו־Reason Codes

‏נמדוד:

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
→ SubmittedToResearchExecutionPath
```

‏לכל מעבר:

```text
PassRateByStage
DropRateByReason
TimeSpentByStage
```

‏Reason Codes לדוגמה:

```text
STALE_DATA
MISSING_FEATURE
LOW_ACTIVITY
WIDE_SPREAD
DEEP_TIMEOUT
CANDIDATE_EXPIRED
ALL_TOPK_VETOED
EXECUTION_NOT_FEASIBLE
EDGE_BELOW_COST
SYSTEM_DEGRADED
NO_ABSOLUTE_EDGE
```

‏Reason Code מגיע מה־decision logic עצמו, לא מ־guess בדיעבד.

---

## ‏6. `P1` — Fast / Deep Path Diagnostics

‏בארכיטקטורה:

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
DeepTimeoutRate
DecisionTTLExpiryRate
RevalidationFailureRate
```

‏Timeout לפי policy יכול להיות outcome תקין.

‏אבל timeout rate גבוה לאורך זמן הוא evidence שה־Top-N, ה־compute, ה־scheduler או ה־horizon אינם מתאימים זה לזה.

---

## ‏7. `P1` — Replayability / Determinism

‏היעד:

```text
same canonical input
+ same code
+ same config
+ same rule versions
+ same ordering assumptions
→ same decision
```

‏נשמור:

```text
EventTime
ProviderSequence when available
ReceiveTime
ProcessTime
DataGeneration
ConfigFingerprint
FeatureVersion
ScoreVersion
VetoVersion
```

‏Live vs Replay divergence הוא Finding בפני עצמו.

‏אם nondeterminism intentional, גם seed/policy נשמרים.

---

## ‏8. `P2` — Economic Diagnostics

‏Scanner Health אינו מספיק.

‏נמדוד offline/research:

```text
ForwardNetOutcomeByRank
ExecutableRateByRank
FillQualityByRank
AdverseSelectionByRank
TimeToTargetByRank
MFEByRank
MAEByRank
Rank1Lift
```

‏עדיף `NetForwardOutcome` על raw future return כאשר בוחנים usefulness למסחר, עם assumptions ברורים ל־spread/slippage/fees/exit cost.

‏Decision snapshot נשמר בנפרד מ־Outcome record כדי למנוע leakage.

### ‏Rank Bucket Calibration

```text
Rank 1
Ranks 2-5
Ranks 6-20
Ranks 21-100
```

‏נבדוק אם Rank 1 מוסיף lift אמיתי ביחס ל־comparison bucket, ולא רק נראה extreme בגלל Winner's Curse.

### ‏Missed Mover Analysis

‏שאלה מחקרית:

```text
Which symbols moved materially but never reached Top-K?
```

‏קטגוריות:

```text
NOT_OBSERVED
STALE
FEATURE_NOT_READY
FILTERED
SCORE_TOO_LOW
OUTSIDE_TOPK
VETOED
LATE_DEEP_RESULT
EXECUTION_INFEASIBLE
```

‏פספוס אינו bug אוטומטית; מטרת האבחון היא להבין אם הפספוס תואם design.

### ‏False Winner Analysis

‏ל־Rank #1 שנכשל נפריד:

```text
PREDICTION
DATA
RANKING
EXECUTION
COST
REGIME
RANDOM / UNEXPLAINED
```

---

## ‏9. `P2` — Decision Impact לפני Complexity

‏לכל Feature/rule/challenger נמדוד:

```text
ΔFeature
→ ΔScore
→ ΔRank
→ ΔDecision
```

‏והמדד החשוב:

```text
DecisionImpactRate
```

‏Feature עם importance גבוה אבל אפס Decision Impact אינו בהכרח מצדיק latency ו־failure surface נוספים.

‏כל Feature חדש משלם complexity tax:

```text
IncrementalDecisionValue
vs
LatencyCost
OperationalCost
FailureSurface
```

---

## ‏10. `P2` — Diagnostics UI / Observability

‏לא לבנות dashboard יחיד שמנסה לסכם הכול ב־Scanner Score.

‏שלוש תצוגות בסיס:

```text
Operational
- coverage
- freshness
- queues
- latency
- readiness

Ranking
- Top-K
- rank gap
- churn
- persistence
- feature readiness
- veto state

Economic
- rank-bucket outcomes
- executable rate
- adverse selection
- no-trade / missed-mover research
```

‏Dashboard אינו source of truth.

‏Metrics משמשים trends; Event Journal / Decision Packets משמשים forensics.

---

## ‏11. Observability Cost Budget

‏Diagnostics עצמם אינם רשאים להרוס את hot path.

‏נמדוד:

```text
TelemetryCPU
TelemetryAllocations
TelemetryQueueAge
DroppedTelemetry
```

‏Baseline:

```text
bounded logging
aggregation
sampling where safe
async export
raw evidence only where decision/RCA value justifies it
```

‏יש להימנע מ־high-cardinality metrics של `Symbol × Feature × DecisionEpoch` כאשר event journal מתאים יותר.

---

## ‏12. Scanner Health State

‏אפשר להחזיק:

```text
GREEN
YELLOW
RED
UNKNOWN
```

‏אך הוא נגזר מ־rules שקופים ולא מ־opaque score.

‏דוגמאות inputs:

```text
FreshCoverageAtDecision
critical component health
Clock health
DataGeneration state
p95/p99 latency pressure
Top1Age
DeepPath expiry rate
replay/state divergence
```

‏`UNKNOWN` אינו מומר ל־GREEN.

---

## ‏13. Use When

‏ה־baseline מתאים במיוחד כאשר:

- ‏Universe רחב ומספר Symbols גדול.
- ‏ה־horizon קצר ולכן freshness/latency יכולים למחוק signal.
- ‏קיים Fast/Deep path.
- ‏ranking cross-sectional משתמש ב־Symbols עם update cadence לא אחיד.
- ‏צריך להבחין בין quiet market לבין degraded scanner.
- ‏Replay/RCA הם חלק מתהליך המחקר.
- ‏קיימים Vetoes, eligibility filters או execution re-ranking שמשנים את ה־winner.

---

## ‏14. Do Not Use When

‏אין צורך במערכת Diagnostics מלאה כאשר מדובר בניסוי offline קטן עם dataset סטטי ו־single-pass deterministic ranking.

‏גם שם עדיין נדרשים correctness checks, אך לא כל telemetry/runtime machinery של scanner online.

---

## ‏15. Alternatives

### ‏Alternative A — Dashboard-only monitoring

‏פשוט יותר, אך חלש ב־RCA כי summary metrics אינם משחזרים החלטה.

### ‏Alternative B — Full distributed tracing לכל event

‏מפורט מאוד, אך עלול לעלות יותר מדי CPU/storage/latency ולהוסיף failure modes.

### ‏Alternative C — Single scanner health score

‏נוח ל־UI, אך מסתיר אם הכשל הוא Coverage, Freshness, Latency, Rank או Readiness.

### ‏Recommended

```text
bounded multidimensional metrics
+ Decision Packets
+ Incident Packets
+ replayable event evidence
```

---

## ‏16. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| Top-K evidence | RCA ומחקר טובים | storage |
| Per-symbol freshness | ranking fairness | state/telemetry volume |
| Fast fail on stale/unknown | correctness | יותר `NO TRADE` research outcomes |
| Deep-path deadlines | מונע late decisions | מוותר על analysis מאוחר |
| Broad coverage safeguards | מונע starvation | compute budget |
| Rich incident packets | RCA חזק | capture/storage complexity |
| Deterministic replay | אמינות מחקרית | engineering discipline |

---

## ‏17. What I Would Avoid Initially

‏לא להתחיל עם:

- ‏מאות charts.
- ‏opaque `ScannerScore` יחיד.
- ‏ML anomaly detector לפני deterministic metrics.
- ‏full tracing לכל event ללא budget.
- ‏auto-tuning מ־diagnostics.
- ‏auto-disable של features/vetoes.
- ‏hard-coded universal freshness threshold.
- ‏smoothing אוטומטי ל־RankChurn בלי RCA.
- ‏שמירת Rank #1 בלבד.
- ‏הנחה ש־low churn = healthy או high churn = broken.

---

## ‏18. What to Add Later

‏לאחר Baseline תקין:

1. ‏Rank bucket calibration לפי regimes.
2. ‏Missed-mover clustering.
3. ‏perturbation/sensitivity analysis.
4. ‏Champion/Challenger scanner comparison.
5. ‏independent-opportunity clustering.
6. ‏automatic root-cause grouping ל־alert storms.
7. ‏adaptive telemetry sampling שאינו פוגע ב־forensics.
8. ‏feature-retirement evidence feed.

---

## ‏19. Required Data / Evidence

‏כדי להפעיל Diagnostics אמינים צריך לפחות:

```text
Point-in-time universe membership
Canonical market events
Per-symbol freshness timestamps
Feature readiness + as-of times
Eligibility results + reasons
Score components + versions
Top-K snapshots
Veto results
Deep-path timing
Execution-feasibility snapshots
Decision packets
Config fingerprint
Generation identifiers
Outcome labels separated from decision state
```

‏בלי Decision-time evidence אין להסיק retrospectively שה־Scanner “היה צריך לדעת”.

---

## ‏20. Promotion Criteria

‏Promotion כאן פירושו קידום שכבת Diagnostics בין שלבי `Research / Replay / Shadow / Paper`, לא אישור למסחר חי.

‏Criteria:

```text
Decision packets complete on representative sessions
FreshCoverage calculations reproducible
Top-K snapshots replay correctly
Generation boundaries behave correctly
expired candidates cannot re-enter current decisions
reason-code coverage is high and stable
load tests preserve freshness / decision correctness
fault injection produces diagnosable incidents
telemetry overhead remains bounded
healthy NO TRADE and degraded NO TRADE are distinguishable
```

---

## ‏21. Rejection Criteria

‏לדחות design אם:

- ‏Health can be GREEN while critical freshness is unknown.
- ‏Rank #1 נשמר בלי comparable cross-section evidence.
- ‏reconnect משאיר stale Top-K authoritative.
- ‏Deep result יכול להגיע אחרי TTL ולהשפיע על current decision.
- ‏Reason Codes נוצרים רק בדיעבד.
- ‏Replay אינו מסוגל לשחזר decision ordering.
- ‏telemetry itself causes meaningful latency/backpressure.
- ‏coverage loss משפר apparent outcomes בלי detection.
- ‏NO TRADE תפעולי ועסקי אינם ניתנים להבחנה.

---

## ‏22. Metrics

### ‏Coverage / Freshness

```text
ObservedCoverage
FreshCoverageAtDecision
FreshEligibleCoverage
FreshnessSpread
Top1Age
TopKAgeDistribution
StarvationAge
```

### ‏Compute / Queue

```text
ProcessingLag
EndToDecisionLatency
LatencyPressure
QueueDepth
OldestItemAge
DeadlineMissRate
DeepTimeoutRate
DecisionTTLExpiryRate
```

### ‏Ranking

```text
RankGap
RelativeRankGap
RankChurn
RankPersistence
RankVelocity
NearTieRate
ScoreDistribution
```

### ‏Funnel

```text
PassRateByStage
DropRateByReason
VetoRate
RevalidationFailureRate
CandidateConversionRate
```

### ‏Economic Research

```text
Rank1Lift
NetForwardOutcomeByRank
ExecutableRateByRank
AdverseSelectionByRank
MissedMoverRate
FalseWinnerRate
```

### ‏Diagnostics Quality

```text
ReplayMatchRate
UnknownRootCauseRate
IncidentPacketCompleteness
ReasonCodeCoverage
TelemetryOverhead
```

---

## ‏23. Failure Modes

1. ‏`Stale Winner` — Candidate נשאר ראשון כי לא עודכן.
2. ‏`Torn Cross-Section` — ranking משווה states מזמנים שונים מדי.
3. ‏`Coverage Illusion` — overall count נראה טוב אך bucket חשוב חסר.
4. ‏`Starvation Loop` — scheduler רואה שוב ושוב רק את מי שכבר חם.
5. ‏`Backlog Masking` — throughput גבוה אבל queue age עתיק.
6. ‏`Feature Defaulting` — missing feature הופך ל־0 ונכנס ל־Score.
7. ‏`Score Collapse` — Rank קיים ללא separation משמעותי.
8. ‏`Score Explosion` — artifact/normalization bug נראה כמו Edge.
9. ‏`Late Deep Result` — analysis נכון מגיע אחרי שה־signal פג.
10. ‏`Generation Contamination` — state מלפני reconnect מתערבב עם state חדש.
11. ‏`Healthy-Looking Warmup` — Rank מופק למרות Feature readiness חלקית.
12. ‏`Telemetry Collapse` — diagnostics נעלמים בדיוק תחת overload.
13. ‏`Coverage-Induced Alpha` — data loss מסנן observations קשים ויוצר apparent edge.
14. ‏`Dashboard Truth` — UI summary נחשב בטעות ל־forensic source.
15. ‏`Hindsight Diagnostics` — outcome עתידי מזהם reconstruction של decision.

---

## ‏24. Testing

‏Baseline test pack:

### ‏Golden scenarios

```text
clean momentum
stale top1
near tie
provider gap
score outlier
all vetoed
fast-market burst
reconnect
late deep result
partial universe loss
```

### ‏Invariants

```text
STALE candidate cannot be READY
Ranked candidate has ScoreVersion
Decision has ConfigFingerprint
Expired candidate cannot become actionable
UNKNOWN critical state cannot silently become eligible
Hard veto cannot produce actionable candidate
```

### ‏Property tests

```text
Increasing critical data age cannot improve freshness state
Tie-break remains deterministic
Old generation results cannot mutate current generation
```

### ‏Fault injection

```text
provider disconnect
out-of-order events
slow feature engine
queue burst
GC/runtime pause
clock skew
partial universe loss
provider failover
```

### ‏Load / Soak

‏לא למדוד רק events/sec.

‏תחת load נדרש לבדוק:

```text
FreshCoverage
Top1Age
p95/p99 LatencyPressure
DeadlineMissRate
Decision correctness
memory growth
queue drift
```

---

## ‏25. User-Specific Application

‏למערכת המחקרית שלנו, שבה ה־Universe יכול לכלול אלפי מניות וה־signal horizon קצר, `Scanner Diagnostics` הוא חלק מה־correctness ולא רק Monitoring.

‏ה־Baseline המומלץ:

```text
Broad Universe
→ Expected/Observed/Fresh coverage
→ Incremental feature readiness
→ Cheap rank
→ Top-K decision packet
→ bounded deep path
→ veto / execution feasibility
→ pre-handoff revalidation
→ explicit READY / DEGRADED / NO_TRADE
→ replay + daily review
```

‏הדגש הוא לא “לסרוק מהר ככל האפשר”, אלא להוכיח שמה שנבחר הושווה מול opportunity set מספיק fresh ורלוונטי.

‏במיוחד יש לשמור:

```text
FreshCoverageAtDecision
Top1Age
Top-K snapshot
RankGap
RankChurn
DecisionTTL
DeepPathAge
ReasonCodes
ConfigFingerprint
DataGeneration
```

‏ולא להוסיף בשלב הראשון dashboard כבד או ML-based anomaly layer.

---

## ‏26. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Sort מחזיר Rank #1 גם כאשר אף Candidate אינו טוב אבסולוטית.
- ‏stale/asynchronous inputs יכולים לשנות cross-sectional ranking.
- ‏queue length לבדו אינו מודד waiting age.
- ‏reconnect/failover יכולים לשנות timing/semantics ולהצריך generation boundary.
- ‏late computation יכול להיות חסר ערך ל־short-lived signal גם אם התוצאה המתמטית נכונה.

### ‏Judgment

- ‏`FreshCoverageAtDecision`, ‏Top-K evidence, ‏DecisionReadiness ו־replayability צריכים להיות Baseline.
- ‏Diagnostics צריכים להיות multidimensional ולא Scanner Score יחיד.
- ‏unknown critical state צריך להיחשב לא־actionable.
- ‏Reason Codes ו־Decision Packets צריכים להגיע מה־runtime path עצמו.

### ‏Hypothesis

‏דורש בדיקה אמפירית:

- ‏מה freshness envelope האופטימלי לכל horizon.
- ‏איזה `Top-N` נותן recall מספיק בלי לפגוע ב־TTL.
- ‏האם Rank persistence/churn מוסיפים predictive value.
- ‏מה הקשר בין RankGap לבין NetForwardOutcome.
- ‏כמה exploration/coverage budget נדרש כדי למנוע starvation.
- ‏איזה telemetry sampling נותן מספיק evidence עם overhead נמוך.

---

## ‏27. Confidence

‏**High** לגבי הצורך להפריד health מ־market outcome, למדוד freshness/coverage point-in-time, לשמור Top-K/Reason Codes, להשתמש generations ולדרוש replayability.

‏**Medium** לגבי formulas/thresholds מסוימים כגון freshness envelope, ‏RankGap thresholds, exploration budget או Deep TTL — אלה חייבים להיקבע מתוך measurements וה־signal half-life של המערכת בפועל.

---

## ‏28. Time-Sensitive Facts

‏המקטע אינו נשען על כלל רגולטורי או Broker-specific fact מהותי.

‏כן יש facts תפעוליים שעשויים להשתנות עם implementation:

```text
provider timing semantics
provider sequence guarantees
feed coverage
runtime / GC behavior
hardware latency
broker / execution-adapter timing
```

‏אם משתמשים בהם לקביעת SLO/TTL, יש לתעד:

```text
VerifiedAt
EnvironmentVersion
ProviderVersion / Contract
BuildCommit
```

---

## ‏29. Summary

```text
Baseline
→ separate market opportunity from scanner health
→ point-in-time expected/observed/fresh coverage
→ per-symbol freshness, not one global timestamp
→ explicit DecisionReadiness
→ Top-K decision packets, not winner-only logs
→ queue age + tail latency + latency pressure
→ feature readiness and no silent defaulting
→ rank gap/churn/persistence with freshness context
→ candidate TTL and deep-path expiry
→ generation boundaries after discontinuities
→ pre-handoff revalidation
→ reason-coded candidate funnel
→ deterministic replay
→ multidimensional health, not one scanner score
→ bounded diagnostics overhead
→ offline economic diagnostics by rank bucket
→ feed evidence into Daily Review / RCA
→ promote only within Research / Replay / Shadow / Paper
```
