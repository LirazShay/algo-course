# ‏Cross-Cutting 04 — Recommended Scanner Design

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Universe, Market Data, Features, Filters, Ranking, Negative Evidence, Scanner Best Practices ו־Scanner Diagnostics ל־Scanner אחד פשוט, deterministic, explainable ו־replayable עבור מערכת `Short-Horizon Momentum` מחקרית.
>
> ‏המסמך מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר Exposure או מינוף.

---

## ‏1. Decision

‏ה־Scanner המומלץ אינו:

```text
for each symbol:
    recompute everything
    choose max(score)
```

‏ואינו:

```text
Rank #1
→ action
```

‏אלא:

```text
Point-in-Time Universe
→ Market-Wide Data Readiness
→ Canonical Per-Symbol State
→ Incremental Fast Features
→ Hard Eligibility
→ Cheap Full-Universe Predictive Rank
→ High-Recall Top-N Funnel
→ Deep Evaluation
→ Negative Evidence / Veto
→ Execution Feasibility
→ Absolute Candidate Gate
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ Immutable Decision Packet
→ Pre-Effect Revalidation
```

‏העיקרון המנחה:

```text
Scanner quality =
correct comparison
+ fresh coverage
+ candidate recall
+ explainability
+ bounded latency
+ deterministic evidence
```

‏לא:

```text
Scanner quality = number of trades
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ה־Scanner אינו Execution Engine

‏ה־Scanner מייצר Candidate Evidence.

‏הוא אינו מחזיק Broker authority ואינו שולח order ישירות.

```text
Scanner
→ CandidateDecisionPacket
→ Decision / Risk / Compliance boundary
→ Paper / Simulator boundary
```

‏כך Winner ישן או stale אינו הופך side effect רק משום שנבחר קודם.

### ‏`P0 — Required`: Point-in-Time Universe הוא input מפורש

‏לכל `DecisionEpoch` נשמור:

```text
UniverseId
UniverseVersion
AsOfTime
ExpectedActiveUniverseCount
IncludedSymbols
ExcludedSymbols
ExclusionReasons
```

‏ה־Scanner אינו משווה silently universe חלקי כאילו היה השוק המלא.

### ‏`P0 — Required`: ‏`ScannerReadiness` לפני Actionable Ranking

‏Process alive אינו Scanner ready.

‏לפני Candidate actionable נדרש לפחות:

```text
UniverseReady
MarketDataReady
FreshCoverageSufficient
CriticalFeatureReadinessSufficient
TradingStatusKnown
ClockHealthy
BacklogWithinBudget
ConfigConsistent
DataGenerationValid
ScannerModeAllowsNewCandidate
```

‏Output readiness:

```text
READY
DEGRADED
NOT_READY
UNKNOWN
```

‏`UNKNOWN` קריטי אינו הופך ל־`NO_TRADE` רגיל.

### ‏`P0 — Required`: Market-Wide Data Gate לפני Winner

‏Rank #1 אמין רק כאשר ה־cross-section אמין.

‏בכל `DecisionEpoch` נמדוד לפחות:

```text
ExpectedUniverseCount
ObservedUniverseCount
FreshObservedUniverseCount
FreshEligibleUniverseCount
FreshCoverageRatio
MedianCriticalInputAge
P95CriticalInputAge
P99CriticalInputAge
FreshnessSkew
DataGeneration
```

‏אם רוב ה־Universe stale/חסר:

```text
RankActionable = false
Decision = UNKNOWN / NOT_READY
Reason = DATA_COVERAGE_OR_FAIRNESS
```

‏Candidate יחיד עם Quote טרי אינו מתקן cross-section שבור.

### ‏`P0 — Required`: ‏Freshness היא per-input ולא Timestamp יחיד

‏לכל Symbol נשמור לפי הצורך:

```text
TradeAge
QuoteAge
FeatureAge
ActivityAge
BookAge
TradingStatusAge
ScoreAge
RankAge
```

‏נפריד:

```text
fresh rank
!=
fresh features
!=
fresh market inputs
```

### ‏`P1 — Preferred`: Event-driven state + cadenced ranking

‏Baseline:

```text
Market events
→ incremental per-symbol state/features

Periodic or material-change DecisionEpoch
→ cross-sectional compare/rank
```

‏לא נבצע full-universe recomputation על כל tick כברירת מחדל.

‏ה־ranking cadence עצמו הוא `Judgment/Hypothesis` ונמדד מול signal half-life ו־latency budget.

### ‏`P1 — Preferred`: Canonical Per-Symbol State

‏לכל Symbol תהיה תמונת state לוגית אחת:

```text
Identity
UniverseMembership
TradingStatus
TradeState
QuoteState
RollingWindows
CheapFeatures
FeatureReadiness
Eligibility
QualityFlags
Versions
Diagnostics
```

‏Modules שונים אינם בונים מציאות עצמאית וסותרת לאותו Symbol.

### ‏`P1 — Preferred`: incremental features לפני scan

‏בעת Event:

```text
normalize
→ mutate canonical symbol state
→ update affected windows
→ update cheap features
→ update readiness / eligibility inputs
```

‏ב־DecisionEpoch ה־Scanner אמור בעיקר לבצע comparison על state שכבר מוכן.

‏לא:

```text
scan cycle
→ query history for 4,000 symbols
→ recompute all windows
→ parse everything again
```

### ‏`P0 — Required`: Hard Eligibility לפני Score actionable

‏Eligibility קודמת ל־Ranking כאשר failure אינו “פחות attractive” אלא invalid comparison.

‏Baseline hard eligibility includes:

```text
Instrument valid
Point-in-Time universe membership valid
Critical market data valid
Critical freshness valid
Required history ready
Required feature status VALID
Trading status known and acceptable for research mode
No incompatible generation/state
```

‏Candidate שאינה eligible יכולה לקבל Research diagnostics, אך לא לחזור למסלול actionable באמצעות Score גבוה.

### ‏`P0 — Required`: Missing / Stale / Invalid / Warming-Up אינם `0`

‏Feature status:

```text
VALID
MISSING
STALE
INVALID
WARMING_UP
UNKNOWN
```

‏Policy לכל Feature נדרש תהיה מפורשת:

```text
REJECT
ALLOW_RESEARCH_ONLY
USE_VALIDATED_FALLBACK
NOT_APPLICABLE
```

‏אין default סמוי שמטה Rank.

### ‏`P1 — Preferred`: Fast Path לכל ה־Universe

‏ה־Fast Path צריך להיות זול, explainable ובעל recall גבוה.

‏Baseline families:

```text
Freshness / readiness
Short-horizon return / momentum consistency
Activity / trade-rate
Basic liquidity / spread context
Simple explainable predictive score
```

‏המטרה:

```text
cheap + broad + high recall
```

‏לא maximum precision.

### ‏`P1 — Preferred`: Deep Path רק ל־Top-N

‏לאחר ranking זול:

```text
Top-N
→ richer feature/context evaluation
→ economic/execution diagnostics
→ negative evidence
→ re-rank / candidate gate
```

‏Deep Path יכול לכלול רק כאשר Evidence מצדיק:

```text
richer order flow
book context
adverse-selection signals
capacity / liquidity context
more expensive feature families
```

‏הוא אינו baseline לכל אלפי ה־Symbols.

### ‏`P1 — Preferred`: Fast Path optimizes Recall; Deep Path optimizes Precision

‏נמדוד:

```text
CandidateRecall
=
RetrospectivelyGoodEligibleCandidatesThatReachedDeepPath
/
AllRetrospectivelyGoodEligibleCandidates
```

‏Funnel שחוסך CPU אבל מפספס כמעט את כל ה־useful candidates אינו Optimization.

### ‏`P0 — Required`: Ranking ו־Negative Evidence נשארים channels נפרדים

‏ה־Scanner אינו ממיס הכול ל־Score יחיד.

```text
Positive Evidence
→ Predictive Rank

Negative Evidence
→ Hard Veto / Soft Penalty / Cooldown / Warning / Unknown

Execution Feasibility
→ separate economics/feasibility state
```

‏Validity/Safety failure אינו מתקזז על ידי Momentum גבוה.

### ‏`P0 — Required`: Hard Vetoes ראשוניים קטנים ולא “חכמים” מדי

‏Baseline Hard Vetoes:

```text
DATA_NOT_TRUSTWORTHY
TRADING_STATUS_NOT_ACTIONABLE
SIGNAL_EXPIRED
CRITICAL_STATE_UNKNOWN
EXECUTION_STATE_NOT_ESTABLISHED_FOR_RESEARCH_PATH
REMAINING_NET_EDGE_NOT_POSITIVE under the active cost model
```

‏Behavioral vetoes מורכבים יתחילו כ־Shadow evidence עד שמודדים false-veto cost.

### ‏`P0 — Required`: Relative Rank אינו מספיק

‏תמיד קיים Winner יחסי.

‏לכן Candidate final דורש:

```text
RelativeRankStrongEnough
AND
AbsoluteQualityStrongEnough
AND
ExecutionFeasibilityAcceptable
AND
NoHardVeto
AND
DecisionReadinessReady
```

‏אם לא:

```text
HEALTHY_NO_TRADE
```

‏כאשר ה־Scanner עצמו בריא.

### ‏`P0 — Required`: שלושה Outputs נפרדים

```text
TRADE_CANDIDATE
HEALTHY_NO_TRADE
UNKNOWN / NOT_READY
```

‏המשמעות:

```text
TRADE_CANDIDATE
= research/paper candidate passed scanner gates

HEALTHY_NO_TRADE
= scanner was trustworthy but no candidate qualified

UNKNOWN / NOT_READY
= scanner could not establish trustworthy decision state
```

‏אסור להשתמש ב־`NO_TRADE` כדי להסתיר Data/Scanner failure.

### ‏`P0 — Required`: Top-K Snapshot, לא Winner בלבד

‏בכל Decision משמעותי נשמור לפחות:

```text
Rank
SymbolId
RawScore
ScoreComponents
FeatureSnapshot
InputAges
FeatureAges
Eligibility
NegativeEvidence
ExecutionFeasibility
RankGap
RankPersistence
CandidateTTL
ReasonCodes
```

‏כך ניתן לבצע Winner's Curse analysis, missed-winner analysis, false-veto analysis ו־Champion/Challenger comparisons.

### ‏`P0 — Required`: Tie-breakers deterministic ו־versioned

‏אין Collection-order randomness.

‏Tie-break policy יהיה מפורש כחלק מ־`RankingPolicyVersion`.

### ‏`P0 — Required`: Candidate TTL

‏לכל Candidate:

```text
CandidateCreatedAt
CandidateExpiresAt
CandidateTTL
```

‏Deep evaluation שמגיע לאחר expiry:

```text
EXPIRED
```

‏ולא חוזר למסלול Candidate actionable.

‏TTL מספרי ייקבע לפי measurement ביחס ל־signal half-life, לא לפי intuition בלבד.

### ‏`P0 — Required`: Pre-Handoff Revalidation

‏לפני העברת Candidate ל־Paper/Execution research boundary נבדוק מחדש:

```text
CurrentReadiness
CurrentDataFreshness
CurrentEligibility
CurrentSignalValidity
CurrentSpread/Liquidity context
CurrentVetoState
CurrentExecutionFeasibility
CandidateAge
```

‏נשווה גם:

```text
OriginalRank vs CurrentRank
OriginalScore vs CurrentScore
OriginalDataAge vs CurrentDataAge
```

‏שיעור revalidation failure גבוה הוא Scanner/latency evidence, לא סתם “שוק מהיר”.

### ‏`P0 — Required`: ‏Decision Packet immutable

‏כל Decision Epoch משמעותי יקבל:

```text
DecisionEpoch
DecisionTime
ScannerMode
DecisionReadiness
UniverseVersion
ExpectedUniverseCount
FreshCoverageAtDecision
DataGeneration
RankGeneration
StrategyVersion
ConfigFingerprint
FeatureSetVersion
RankingPolicyVersion
VetoPolicyVersion
TopK
SelectedCandidate
Decision
ReasonCodes
```

‏זהו contract מרכזי ל־Replay, Daily Review, RCA ו־Research.

### ‏`P0 — Required`: deterministic semantics

‏אותו:

```text
canonical input state
+ evaluation time
+ universe version
+ feature versions
+ ranking/veto versions
+ config
```

‏צריך לייצר אותה:

```text
readiness
eligibility
score/rank
Top-K
veto state
decision
reason codes
```

‏כאשר אין stochastic component מוגדר.

### ‏`P1 — Preferred`: one logical writer per symbol state

‏המטרה היא ordered mutation ו־Replay semantics פשוטים יותר.

‏Physical partitioning יכול להגיע מאוחר יותר לפי throughput measurements.

### ‏`P0 — Required`: explicit gap / duplicate / late-event behavior

‏Data Event יכול להיות:

```text
DUPLICATE
LATE
OUT_OF_ORDER
GAPPED
REPLAYED
```

‏Scanner state update חייב לכבד את policy של Market Data Stack.

‏אסור למשל ש־duplicate trade יכפיל `trade_count` או volume.

### ‏`P0 — Required`: Warm-Up הוא Feature-aware

‏לאחר startup/reconnect:

```text
NOT_READY
PARTIALLY_READY
READY
```

‏Symbol יכול להיות ready ל־`10s` feature אך לא ל־`60s` feature.

‏Actionable ranking משתמש רק ב־features שה־active strategy דורשת ושהם ready.

### ‏`P0 — Required`: Backpressure משנה Decision Readiness

‏נמדוד:

```text
InputRate
ProcessingRate
QueueDepth
OldestItemAge
P95ItemAge
DeadlineMissRate
FreshCoverageRatio
```

‏אם backlog הופך state לישן:

```text
DEGRADED
→ reduced capabilities
or
NOT_READY for new candidate
```

‏Process שממשיך לעבוד על stale queue אינו healthy scanner.

### ‏`P1 — Preferred`: Progressive Degradation

‏Baseline:

```text
FULL
→ REDUCED_DEEP_PATH
→ FAST_ONLY_DIAGNOSTIC
→ BLOCK_NEW_CANDIDATES
```

‏כל transition מקבל:

```text
Mode
ReasonCode
StartedAt
CapabilityEffect
```

‏אין silent degradation.

### ‏`P1 — Preferred`: Load shedding מסיר Optional Work קודם

‏תחת overload אפשר לצמצם:

```text
optional enrichments
research-only diagnostics
Deep Path breadth
stale superseded rank jobs
noncritical UI work
```

‏אבל לא למחוק בשקט correctness/quality events שעליהם state תלוי.

### ‏`P1 — Preferred`: Fairness / starvation diagnostics

‏Hot-symbol prioritization יכול להיות Optimization, אך חייבים לשמור broad-coverage safeguard.

‏Metrics:

```text
LastProcessedAt
StarvationAge
DeadlineMisses
CanceledStaleTasks
WorkByPriority
```

‏אסור ליצור feedback loop שבו ה־Scanner “מוצא” רק Symbols שכבר קיבלו יותר compute.

### ‏`P0 — Required`: Scanner Diagnostics הם חלק מה־Design

‏Diagnostics אינם dashboard שמוסיפים בסוף.

‏בכל Decision Epoch צריך להיות אפשר לענות:

```text
Did we see enough of the expected universe?
Were inputs comparable in age?
Were required features ready?
Was ranking finished within budget?
Did Top-K receive fair enough processing?
Did deep path expire?
Why was candidate selected/rejected?
Was NO_TRADE healthy or broken?
```

### ‏`P0 — Required`: First Broken Boundary ל־RCA

‏Scanner RCA עובר לפי הסדר:

```text
Universe
→ Provider/Data
→ Canonical State
→ Features
→ Eligibility
→ Score
→ Rank
→ Deep Path
→ Negative Evidence
→ Candidate Gate
→ Revalidation
→ Handoff
```

‏החקירה מתחילה בנקודה הראשונה שבה actual diverged from expected.

### ‏`P1 — Preferred`: Scanner Health, Market Opportunity ו־Business Outcome נפרדים

```text
ScannerHealth
MarketOpportunity
ResearchOutcome
```

‏דוגמאות:

```text
HEALTHY scanner + no opportunity
→ HEALTHY_NO_TRADE

DEGRADED scanner + unknown comparison
→ NOT_READY / UNKNOWN

HEALTHY scanner + candidate + poor later outcome
→ valid research loss, not automatically scanner failure
```

### ‏`P0 — Required`: Version everything behavior-bearing

‏לפחות:

```text
UniverseVersion
FeatureSetVersion
EligibilityPolicyVersion
RankingPolicyVersion
VetoPolicyVersion
DeepPathVersion
CostModelVersion
ConfigFingerprint
CodeCommit / BuildIdentity
```

‏שינוי behavior אינו נבלע תחת אותו version.

### ‏`P0 — Required`: Replay parity

‏אותו Decision Core צריך לפעול ב־Replay ככל האפשר.

‏Replay צריך לשחזר:

```text
Feature readiness
Eligibility
Rank
Top-K
Vetoes
Candidate TTL
Decision output
ReasonCodes
```

‏פער ללא הסבר בין Replay ל־Shadow/Paper הוא blocker למחקר אמין.

### ‏`P1 — Preferred`: Scanner Review מזין Research Queue, לא auto-tuning

‏Review ימצא למשל:

```text
low funnel recall
excessive rank churn
false vetoes
stale Top1
coverage blind spots
revalidation failures
Deep Path expiry
latency tails
```

‏אבל שינוי threshold/feature/rank policy עובר Experiment נפרד.

---

## ‏3. Why

‏Whole-market scanner קצר־אופק נכשל בדרך כלל לא רק משום שה־Score “לא מספיק חכם”, אלא מפני שההשוואה עצמה יכולה להיות לא אמינה:

```text
partial universe
stale symbols
unequal input age
warming features
queue backlog
starvation
expired deep results
silent fallbacks
rank computed from mixed generations
```

‏לכן Scanner correctness קודמת ל־ranking sophistication.

‏ה־funnel גם שומר על KISS: עבודה זולה ורחבה לפני עבודה עמוקה ויקרה.

---

## ‏4. Use When

‏ה־Design מתאים כאשר:

- ‏יש Universe רחב של מאות/אלפי Symbols.
- ‏Features מתעדכנים לאורך זמן ולא רק Snapshot יחיד.
- ‏Signal horizon קצר מספיק כדי ש־freshness/latency matter.
- ‏רוצים לבחור Candidate יחסי אך גם לאפשר `NO_TRADE` אמיתי.
- ‏צריך Replay ו־RCA ברמת Decision.
- ‏יש Deep features יקרים שלא כדאי לחשב לכל השוק.

---

## ‏5. Do Not Use When

‏אין לפרש את ה־Scanner כ־:

- ‏הוכחה ש־Rank #1 ינצח.
- ‏תחליף ל־Execution feasibility.
- ‏תחליף ל־Risk/Compliance.
- ‏Permission ל־side effect.
- ‏מנגנון auto-tuning.
- ‏תירוץ להפעיל Rank כאשר coverage/quality אינם ידועים.

---

## ‏6. Alternatives

### ‏A — Full recomputation snapshot scanner

‏פשוט להבנה ויכול להתאים ל־Universe קטן או cadence איטי.

‏חסרונות: redundant work, latency גבוה יותר, פחות natural handling ל־streaming state.

### ‏B — Hybrid incremental scanner — Recommended

‏Event-driven updates + periodic/material-change rank + Top-N Deep Path.

‏זהו baseline המומלץ.

### ‏C — Rank-on-every-event

‏יכול להיות רלוונטי ל־Universe קטן/Latency requirement מיוחד.

‏ל־whole-market personal research הוא מגדיל compute ורעש לפני שהוכח צורך.

### ‏D — Multi-stage ML retrieval/ranker

‏אפשרי מאוחר יותר אם baseline פשוט מוגבל באופן מדיד.

‏לא baseline.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| incremental state | latency/compute טובים | יותר stateful correctness |
| cadenced rank | predictable work | עשוי לפספס שינוי בין epochs |
| Top-N funnel | deep compute זול | funnel recall חייב להימדד |
| hard eligibility | semantics ברורים | מצמצם opportunity set |
| explicit UNKNOWN | correctness | פחות apparent activity |
| Top-K persistence | RCA/research טובים | storage נוסף |
| broad fairness safeguards | פחות scanner bias | פחות aggressive hot-symbol prioritization |
| deterministic policies | replayability | פחות “convenient” heuristics בלתי מתועדים |

---

## ‏8. What I Would Avoid Initially

‏לא להוסיף כברירת מחדל:

- ‏Full-depth לכל ה־Universe.
- ‏עשרות Deep features לכל Symbol.
- ‏ML retrieval dependency.
- ‏Dynamic self-tuning thresholds.
- ‏עשרות Hard Vetoes התנהגותיים.
- ‏Per-tick global reranking.
- ‏Distributed scanner cluster.
- ‏Silent provider fallback.
- ‏Single composite `ScannerScore` שמערבב health, opportunity ו־outcome.
- ‏Winner-only persistence.

---

## ‏9. What to Add Later

‏רק לפי Evidence:

- ‏adaptive ranking cadence.
- ‏richer Top-N Deep Path.
- ‏order-flow/book features.
- ‏better scheduler / partitioning.
- ‏multi-provider comparison/failover architecture.
- ‏specialized retrieval models.
- ‏regime-aware candidate funnel.
- ‏dynamic compute budgets.

‏Promotion דורש Decision Impact או correctness/performance benefit מדיד.

---

## ‏10. Required Data / Evidence

### ‏Per Decision Epoch

```text
DecisionEpoch
DecisionTime
ScannerMode
DecisionReadiness
UniverseVersion
ExpectedUniverseCount
ObservedUniverseCount
FreshEligibleUniverseCount
FreshCoverageRatio
InputAgeDistribution
QueueAges
DataGeneration
RankGeneration
TopK
Decision
ReasonCodes
```

### ‏Per Top-K Candidate

```text
SymbolId
Rank
ScoreComponents
FeatureSnapshot
FeatureVersions
InputAges
FeatureAges
Eligibility
NegativeEvidence
ExecutionFeasibility
RankGap
RankPersistence
CandidateTTL
CandidateCreatedAt
CandidateExpiresAt
```

### ‏Funnel

```text
UniverseCount
DataValidCount
FeatureReadyCount
EligibleCount
FastPathCount
TopNCount
DeepPathCompletedCount
PassedVetoCount
PassedFeasibilityCount
FinalCandidateCount
```

### ‏Operational

```text
InputRate
ProcessingRate
QueueDepth
OldestItemAge
DeadlineMissRate
StarvationAge
DeepPathExpiryRate
RevalidationFailureRate
```

---

## ‏11. Promotion Criteria

‏Scanner design יכול להתקדם רק כאשר:

1. ‏Universe membership point-in-time ומזוהה בגרסה.
2. ‏Market-wide coverage/freshness נמדדים בזמן Decision.
3. ‏`UNKNOWN/NOT_READY` נפרדים מ־`HEALTHY_NO_TRADE`.
4. ‏Feature readiness מפורשת.
5. ‏Hard Eligibility אינה ניתנת לעקיפה ב־Score.
6. ‏Fast Path reproducible ומספיק זול ל־Universe היעד.
7. ‏Funnel Recall נמדד ולא רק throughput.
8. ‏Top-K נשמר.
9. ‏Deep Path expiry/TTL עובדים.
10. ‏Vetoes מפיקים ReasonCodes ו־false-veto evidence.
11. ‏Revalidation קיימת לפני handoff.
12. ‏Replay משחזר eligibility/rank/decision לפי SLO מוגדר.
13. ‏Backpressure יכול להוריד readiness במקום ליצור stale winner.
14. ‏Diagnostics מאפשרים First Broken Boundary.
15. ‏אין silent semantic degradation.

---

## ‏12. Rejection Criteria

‏אין לקדם Scanner אם:

- ‏Rank actionable נוצר על coverage חלקי שאינו מסומן.
- ‏Missing/Stale values הופכים ל־0.
- ‏Winner בלבד נשמר.
- ‏Tie-break תלוי collection order.
- ‏Duplicate/late events יכולים לשנות windows בשקט.
- ‏Deep result expired יכול לחזור למסלול Candidate.
- ‏Backlog אינו משנה readiness.
- ‏`NO_TRADE` מסתיר scanner failure.
- ‏Feature warm-up אינו tracked.
- ‏Rank אינו replayable.
- ‏Vetoes אינם versioned/explainable.
- ‏Hot-symbol scheduling יוצר starvation ללא מדידה.
- ‏Scanner שולח side effects ישירות.

---

## ‏13. Metrics

### ‏Data / Readiness

- ‏`FreshCoverageRatio`.
- ‏Input age `p50/p95/p99`.
- ‏Critical stale rate.
- ‏Feature readiness rate.
- ‏`READY/DEGRADED/NOT_READY/UNKNOWN` duration.

### ‏Funnel / Recall

- ‏Eligibility rate.
- ‏Top-N funnel size.
- ‏Candidate Recall.
- ‏Missed-good-candidate rate.
- ‏Deep Path completion/expiry rate.

### ‏Ranking/Decision interface

- ‏Top-K stability.
- ‏Rank churn.
- ‏RankGap.
- ‏Candidate TTL expiry.
- ‏`TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN` rates.
- ‏Veto rates by ReasonCode.
- ‏Revalidation failure rate.

### ‏Operational

- ‏Input/processing rate.
- ‏Queue depth/age.
- ‏Deadline misses.
- ‏Starvation age/count.
- ‏Decision latency `p50/p95/p99`.

### ‏Evidence Quality

- ‏Replay parity.
- ‏Decision Packet completeness.
- ‏Version identity completeness.
- ‏First-divergence resolvability.

---

## ‏14. Failure Modes

1. ‏`Rank #1 = Trade`.
2. ‏Partial-universe winner presented as market winner.
3. ‏Fresh rank over stale inputs.
4. ‏Feature `UNKNOWN` converted to zero.
5. ‏Fast Path loses recall but appears fast.
6. ‏Deep Path results arrive after TTL.
7. ‏Healthy and broken `NO_TRADE` mixed together.
8. ‏Backlog hidden by process uptime.
9. ‏Hot-symbol feedback loop starves broad universe.
10. ‏Winner-only logging prevents counterfactual analysis.
11. ‏Too many vetoes create rule overfitting.
12. ‏Score compensates for invalid state.
13. ‏Mixed data generations after reconnect.
14. ‏Silent reduced-compute mode changes semantics.
15. ‏Replay path uses different ranking logic.
16. ‏Scanner accidentally owns execution authority.

---

## ‏15. User-Specific Application

‏למערכת המחקרית הזו, שבה רוצים להשוות שוק רחב בטווחים קצרים, ה־Scanner baseline יהיה:

```text
Broad Point-in-Time Universe
→ continuous canonical state updates
→ small incremental feature set
→ explicit readiness / eligibility
→ periodic cross-sectional predictive rank
→ persist Top-K
→ Top-N deep evaluation
→ negative evidence
→ execution-feasibility diagnostics
→ absolute quality gate
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ decision packet
→ revalidation
```

‏הדגש הוא לא “למצוא תמיד משהו”, אלא לדעת מתי ההשוואה עצמה אמינה.

‏ל־KISS עדיף baseline קטן עם `10s / 30s / 60s` feature families כפי שכבר נקבע ב־MVP, מעט Hard Vetoes ו־Top-N קטן, מאשר scanner עם עשרות signals ו־vetoes שלא ניתן לייחס להם Decision Value.

---

## ‏16. Confidence

### ‏High

‏ב־principles:

- ‏Market-wide readiness לפני actionable rank.
- ‏Eligibility לפני Score כאשר state invalid.
- ‏Top-K evidence במקום Winner בלבד.
- ‏Fast Path + Deep Path architecture ל־wide universe.
- ‏`UNKNOWN` נפרד מ־healthy `NO_TRADE`.
- ‏Candidate TTL + revalidation.
- ‏Replay/versioning/diagnostics כחלק מה־Scanner core.

### ‏Medium

‏ב־defaults:

- ‏periodic/material-change ranking.
- ‏Top-N funnel architecture.
- ‏small initial Deep Path.
- ‏one logical writer per Symbol.

### ‏Low / Requires Experiment

‏בפרמטרים כגון:

- ‏ranking cadence.
- ‏Top-N size.
- ‏freshness thresholds.
- ‏CandidateTTL.
- ‏absolute quality floors.
- ‏feature weights.
- ‏behavioral veto thresholds.

---

## ‏17. Time-Sensitive Facts

‏ה־Scanner architecture עצמה אינה תלויה בספק מסוים.

‏לפני חיבור ל־Provider/Paper adapter יש לאמת מחדש כל Fact תלוי זמן לגבי:

- ‏feed coverage.
- ‏subscription semantics.
- ‏update/sequence behavior.
- ‏rate/connection limits.
- ‏market status semantics.
- ‏paper/external adapter behavior.

‏Facts אלה שייכים ל־Market Data / Broker references versioned, לא ל־Scanner logic hard-coded.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Whole-market ranking תמיד יכול להחזיר מקום ראשון גם כאשר כל המועמדים חלשים.
- ‏Rank מחושב כעת אינו מוכיח שה־inputs עצמם טריים.
- ‏בלי Top-K/rejected-candidate evidence אי־אפשר לבצע counterfactual ranking analysis מלא.
- ‏Backlog מגדיל את גיל ה־state גם אם התהליך נשאר alive.

### ‏Judgment

- ‏להעדיף Hybrid incremental scanner.
- ‏להשתמש ב־Fast Path לכל ה־Universe וב־Deep Path ל־Top-N.
- ‏להפריד readiness, opportunity ו־outcome.
- ‏להתחיל עם מעט Hard Vetoes ו־Behavioral Vetoes ב־Shadow.
- ‏לשמור immutable Decision Packet בכל epoch משמעותי.

### ‏Hypothesis

- ‏Fast Path קטן יכול לשמור recall מספיק גבוה למערכת הזו.
- ‏Top-N Deep Path ישפר precision/net executability מספיק כדי להצדיק את העלות.
- ‏ה־ranking cadence הראשוני ישמור signal utility בלי recomputation על כל event.

---

## ‏19. Recommended Scanner Baseline

```text
Universe:
Broad point-in-time US equities research universe

State:
Canonical per-symbol state
Event-driven incremental updates

Features:
Small versioned cheap feature set
10s / 30s / 60s baseline families

Readiness:
Market-wide coverage + freshness + feature readiness

Fast Path:
Hard eligibility
→ simple predictive score/rank
→ Top-N

Deep Path:
Only Top-N
→ richer context
→ negative evidence
→ execution-feasibility diagnostics

Decision:
Relative rank
+ absolute quality
+ no hard veto
+ readiness
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN

Evidence:
Top-K + full Decision Packet + ReasonCodes

Freshness:
Candidate TTL + pre-handoff revalidation

Operations:
FULL
→ REDUCED_DEEP_PATH
→ FAST_ONLY_DIAGNOSTIC
→ BLOCK_NEW_CANDIDATES

Replay:
Same scanner/decision semantics
No special easier historical path
```

---

## ‏20. Bottom Line

‏ה־Scanner המומלץ הוא **מנוע השוואה עם הוכחת readiness**, לא מכונת Winner.

```text
See enough
→ compare fairly
→ rank simply
→ investigate a small shortlist
→ reject bad/unknown evidence explicitly
→ require absolute quality
→ preserve Top-K evidence
→ revalidate before handoff
```

‏כאשר אי־אפשר להוכיח שההשוואה הייתה fresh, complete ו־fair, התוצאה הנכונה אינה Rank #1 חלש — אלא `UNKNOWN / NOT_READY`.