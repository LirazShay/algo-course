# ‏Final Recommended Baseline — Personal Short-Horizon Algo

> ‏מטרת המסמך: להיות ה־authoritative starting configuration של `Recommendation Playbook` עבור מערכת `Personal US Equities Short-Horizon Momentum` מחקרית. הוא מסנתז את Recommendation Sheets ‏`01–85A`, את `CC01–CC18` ואת `00-RECOMMENDATION-GAP-REVIEW.md` ל־baseline אחד מקצה לקצה.
>
> ‏ה־scope כאן הוא `Research / Backtest / Replay / Shadow / Paper / Production Engineering Readiness`. המסמך **אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, אינו מגדיר מינוף או סכום חשיפה אמיתי, ואינו מספק דרך לעקוף Broker / Account / Regulatory controls**. נקודת הסיום היא `ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW` בלבד.

---

## ‏1. Final Decision

‏ברירת המחדל המומלצת אינה “לבנות כמה שיותר מהר רובוט ששולח Orders”.

‏היא לבנות את המערכת הקטנה ביותר שמסוגלת להפיק Evidence אמין על שלוש שאלות:

```text
1. Is there reproducible predictive value?
2. Does that value survive executable costs / latency / fills?
3. Can the system preserve truth, safety and recoverability under failure?
```

‏ה־baseline הקנוני:

```text
Point-in-Time Broad Universe
→ Canonical Market Data
→ Incremental Features
→ Hard Data / Freshness / Eligibility Elimination
→ Small Explainable Predictive Ordering
→ Top-K Evidence
→ Negative Evidence / Veto
→ Execution + Economic Feasibility
→ Absolute Candidate Gate
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ Entry Permission
→ Semantic Price-Bounded Order Intent
→ Durable Execution Lifecycle
→ Fill / Partial / No-Fill / Unknown
→ Position Truth
→ Exit Policy
→ Authoritative Flat
→ Costs / Outcome / Evidence
→ Deterministic Replay / RCA
→ Daily Review
→ Research Queue
→ Controlled Champion / Challenger Learning
```

‏העיקרון העליון:

```text
Reduce business scope.
Do not reduce evidence correctness.
```

---

## ‏2. Authority / Precedence

‏כאשר שני מסמכים נראים שונים, סדר הסמכות הוא:

```text
1. Safety / Compliance / Known-State invariants
2. Explicit time-sensitive correction
3. Relevant Cross-Cutting Recommendation Pack
4. Numbered Recommendation Sheet as detailed domain reference
5. FINAL-RECOMMENDED-BASELINE as the selected starting configuration
```

‏כלומר:

```text
Critical safety invariant
>
positive score / rank / modeled edge
```

‏ו־:

```text
02A time-sensitive correction
>
stale factual wording in older material
```

‏ו־:

```text
CC08 / CC09 integrated semantics
>
older isolated order-tactic wording
```

‏ה־Final בוחר starting baseline; הוא אינו מוחק Alternatives, Evidence או caveats במסמכי המקור.

---

## ‏3. Classification of Claims

‏המסמך משתמש בשלושה סוגי טענות:

```text
Fact       = known / verified behavior or contract
Judgment   = recommended engineering or research starting point
Hypothesis = empirical claim that must be tested
```

‏בפרט, אלה **אינם Facts אוניברסליים**:

```text
10s / 30s / 60s horizons
long-only research baseline
single-position research baseline
fixed small research size
feature weights
minimum momentum
minimum activity
spread / liquidity thresholds
Top-K size
candidate TTL
order TTL
max holding time
profit capture threshold
no-progress threshold
latency budget
coverage threshold
```

‏הם starting `Judgment / Hypothesis`, נשמרים ב־versioned config ומשתנים רק דרך Evidence.

---

## ‏4. Scope Baseline

| Area | Recommended starting baseline |
|---|---|
| ‏Environment | `REPLAY + SHADOW + PAPER` |
| ‏Asset scope | Broad point-in-time U.S. equities research universe |
| ‏Direction | Long-only research simplification |
| ‏Concurrent exposure | Single position episode at a time |
| ‏Architecture | Modular monolith with strong logical boundaries |
| ‏Persistence | Local durable DB + append-only journal + snapshots + SQL-friendly research surface |
| ‏Data | Trades + broad/consolidated top-of-book where available + bid/ask sizes + timestamps + provenance + quality |
| ‏Features | Small, deterministic, incremental feature set |
| ‏Starting horizons | `10s / 30s / 60s` |
| ‏Decision style | Elimination-first + small explainable ordering |
| ‏Outcome states | `TRADE / NO_TRADE / UNKNOWN` |
| ‏Order abstraction | `Protected Price-Bounded Attempt` |
| ‏Execution | Versioned conservative simulator, then one isolated Paper adapter |
| ‏Sizing | Fixed small research size, then clamp by independent constraints |
| ‏Replay | Same core + virtual time + deterministic event ordering |
| ‏Learning | Daily Review → Research Queue → controlled experiments |
| ‏Promotion | Manual evidence governance; no auto-tuning, no auto-promotion |

‏`Long-only`, ‏single-position, local persistence ו־modular monolith נבחרו כדי לצמצם ambiguity, operational surface ו־causal attribution problems. הם אינם טענה שזו הארכיטקטורה הסופית לכל scale.

---

## ‏5. P0 Invariants — Non-Compensable

‏המערכת אינה רשאית לעקוף את החוזים הבאים בגלל Rank, PnL או modeled opportunity:

```text
Point-in-Time / As-Known-At correctness
Missing != Zero
Unknown != False
Critical UNKNOWN != Permission
Provider DTO != Strategy domain model
Fresh rank != fresh inputs
Rank #1 != Decision
TRADE_CANDIDATE != ENTRY_PERMISSION
Intent != Order != Execution Outcome
Sent != Accepted != Working != Filled
CancelRequested != Canceled
Partial Fill changes exposure immediately
UNKNOWN_EFFECT → RECONCILE
No blind side-effect retry
Position truth derives from authoritative fills / reconciliation
Exit Submitted != Flat
Flat requires authoritative zero exposure and no unresolved effect
Pending / Cancel-Pending / Unknown exposure counts toward risk
Safety / Compliance vetoes are non-compensable
Existing exposure has priority over new opportunities
Durable intent before meaningful external Paper side effect
Replay same inputs + versions + seed → same semantic outputs
Critical truth must be durably auditable
```

---

# ‏Part I — Market Evidence

## ‏6. Market Data Baseline

‏ה־Market Data pipeline:

```text
External Feed
→ Raw Capture
→ Parser + Provenance
→ Canonical Normalization
→ Ordering / Gap / Duplicate Validation
→ Canonical Event Log
→ Current Market State
→ Incremental Features
```

‏מינימום state שימושי:

```text
InstrumentId
LastPrice
BestBid
BestAsk
BidSize
AskSize
TradeTimestamp
QuoteTimestamp
ReceiveTimestamp
Generation
DataQualityState
```

‏`Last-only` יכול לשמש exploration צר, אך אינו מספיק ל־baseline שמבקש למדוד executability ו־net economics.

### ‏Quality states

```text
READY
STALE
GAPPED
INCOMPLETE
TORN_STATE
INVALID
NOT_READY
UNKNOWN
```

‏אין silent fallback ואין conversion של missing value ל־`0`.

### ‏Provider boundary

```text
Provider SDK / wire payload
→ Adapter
→ CanonicalMarketEvent / CanonicalMarketState
→ Strategy / Scanner / Replay
```

‏Market-data provider ו־execution broker הם boundaries נפרדים גם אם אותו Vendor מספק את שניהם.

### ‏Starting provider posture

‏`Judgment`: להתחיל עם primary provider אחד ו־broad/consolidated top-of-book ככל האפשר למחקר cross-sectional. ‏Full depth, active multi-provider merge ו־failover complexity אינם baseline.

---

## ‏7. Universe Baseline

‏ה־Universe הוא Point-in-Time input מפורש, לא רשימת symbols נוחה מהיום.

‏לכל epoch נשמור לפחות:

```text
UniverseId
UniverseVersion
AsOfTime
ExpectedUniverseCount
IncludedSymbols
ExcludedSymbols
ExclusionReasons
```

‏ה־baseline שומר broad universe כדי לא להחליף את שאלת המחקר:

```text
Which stock is strongest among the intended market?
```

‏בשאלה קלה יותר:

```text
Which stock is strongest among a hand-picked list?
```

---

## ‏8. Time / Event Model

‏המערכת תהיה event-driven ב־state updates, עם Decision/Ranking epochs cadence-controlled או material-change-driven.

‏נפריד לפחות:

```text
Source / Exchange Event Time
Provider Time when available
Receive Wall Time
Receive Monotonic Time
Process / Feature Ready Time
Rank Time
Decision Time
Intent Time
Execution event times
```

‏Business durations מקומיים יישענו על clock semantics מפורשים; Replay משתמש ב־`ReplayClock` ולא ב־wall clock.

---

# ‏Part II — Signal, Features and Scanner

## ‏9. Starting Feature Set

‏ה־Champion הראשוני נשאר קטן ומוסבר.

‏משפחות feature מועדפות להתחלה:

```text
Price / momentum change
Activity / trade intensity
Basic liquidity / executability context
Freshness / quality diagnostics
```

‏`Judgment`: starting research horizons:

```text
10s
30s
60s
```

‏Horizon נוסף הוא Research parameter / Challenger עד Evidence.

‏Feature ייכנס למסלול actionable רק כאשר:

```text
semantic definition known
input freshness known
warm-up satisfied
point-in-time correctness proven
version identity known
```

‏Classic indicators, microprice, imbalance, order-flow features, regime features ו־ML נשארים later candidates אלא אם Experiment ספציפי מוכיח incremental decision value.

---

## ‏10. Scanner Baseline — Elimination First

‏זהו ה־resolution של `S1` מה־Gap Review:

```text
Point-in-Time Universe
→ Market-Wide Data Readiness
→ Canonical Per-Symbol State
→ Incremental Fast Features
→ Data / Freshness / Eligibility Elimination
→ Small Explainable Ordering among survivors
→ Top-K
→ Negative Evidence / Veto
→ Execution / Economic Feasibility
→ Absolute Candidate Gate
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
```

‏Candidate שנכשלת ב־hard eligibility **אינה מקבלת score נמוך**; היא אינה actionable.

### ‏Market-wide trust לפני Winner

‏לכל Decision Epoch נמדוד לפחות:

```text
ExpectedUniverseCount
ObservedUniverseCount
FreshObservedUniverseCount
FreshEligibleUniverseCount
FreshCoverageRatio
CriticalInputAge percentiles
FreshnessSkew
DataGeneration
```

‏כאשר cross-section אינו trustworthy:

```text
UNKNOWN / NOT_READY
```

‏Candidate טרייה אחת אינה מתקנת Universe stale.

---

## ‏11. Ranking Baseline

‏ה־Champion:

```text
small validated raw features
→ robust / percentile normalization
→ small sub-score set or lexicographic ordering
→ deterministic rank
```

‏אין requirement להשתמש ב־single monolithic score. ההעדפה היא לשמור:

```text
Positive Predictive Evidence
Negative Evidence
Execution Feasibility
Cost Context
Risk / Safety / Compliance
```

‏כערוצים נפרדים.

‏ה־Final מאמץ:

```text
Relative Rank
AND
Absolute Candidate Gate
```

‏כלומר #1 יכול להסתיים ב־`HEALTHY_NO_TRADE`.

### ‏Top-K הוא Evidence

‏לכל Rank Epoch משמעותי נשמור Top-K קטן עם:

```text
Rank
Raw / normalized features
Sub-scores / ordering reasons
Input ages
Quality states
Rank gap
Execution diagnostics
Cost diagnostics
Reason codes
```

‏כך אפשר לבצע counterfactual analysis של #1 מול #2/#3 ולא רק winner logging.

---

## ‏12. Negative Evidence / Veto

‏Hard vetoes נשארים מחוץ ל־positive score.

‏Baseline categories:

```text
Data / freshness invalidity
Trading / instrument state invalidity
Critical execution infeasibility
Risk / Safety / Compliance block
Duplicate / ownership conflict
Critical unknown state
```

‏Behavioral vetoes כגון signal-shape failure, adverse-selection context או no-progress memory מתחילים ב־Shadow/Research ונכנסים ל־Champion רק לאחר false-veto / missed-opportunity analysis.

---

# ‏Part III — Candidate, Entry, Order and Execution

## ‏13. Candidate Decision

‏Output קנוני:

```text
TRADE_CANDIDATE
HEALTHY_NO_TRADE
UNKNOWN / NOT_READY
```

‏`HEALTHY_NO_TRADE` פירושו שהמערכת תקינה אך אין כרגע opportunity שעוברת Absolute Gate.

‏`UNKNOWN / NOT_READY` פירושו שאין Evidence מספיק אמין לקבל החלטה actionable.

‏אסור למזג ביניהם לצורך נוחות reporting.

---

## ‏14. Entry Policy

‏Entry היא permissioned state transition:

```text
TRADE_CANDIDATE
→ Candidate still valid?
→ Data still valid?
→ Signal still fresh?
→ Veto clear?
→ Execution feasible?
→ Remaining Net Edge sufficient?
→ Risk allows?
→ Safety allows?
→ Compliance allows?
→ State known?
→ freeze EntryIntent
→ final pre-effect revalidation
```

‏`OriginalEdge > 0` אינו מספיק; ההערכה הרלוונטית היא Remaining Edge בנקודת ההחלטה.

‏`SignalTTL`, ‏`CandidateTTL` ו־`DecisionTTL` הם concepts נפרדים. ערכיהם המספריים הם Hypotheses.

---

## ‏15. Order Policy — Normalized Baseline

‏זהו ה־resolution של `S3` מה־Gap Review.

‏ה־baseline אינו שם Broker-specific של order type, אלא semantic contract:

```text
Protected Price-Bounded Attempt
```

‏כל `OrderIntent` משמעותי כולל לפחות:

```text
OrderIntentId
DecisionId
Purpose
InstrumentId
RequestedQty
Urgency
CreatedAt
IntentTTL
ExecutionDeadline
HardPriceBound
ExecutionBudget
PartialFillPolicy
CancelPolicy
ReplacePolicy
RiskSnapshotId
PolicyVersions
Environment
```

‏ה־exact simulator/Paper primitive הוא capability mapping, לא Strategy truth.

### ‏Starting order-policy family

```text
Primary:
Protected Price-Bounded Attempt

Research comparator:
Simple Passive Attempt

Later challenger when semantics are verified:
Immediate-or-Cancel-style attempt
```

‏אין market-without-bound generic default, אין infinite chase ואין silent order-type fallback.

‏Pegged, midpoint, hidden, reserve, direct routing, broker algos ו־advanced venue-specific tactics נשארים `P3/P4` עד Evidence ו־current capability verification.

---

## ‏16. Execution Policy

‏Execution הוא durable economic state machine, לא API wrapper.

```text
Approved Intent
→ Risk / Safety / Compliance Reservation
→ Fresh Execution Context
→ Execution Budget + Hard Bounds
→ Durable Attempt
→ Simulator / Paper Side Effect
→ Canonical Async State
→ Fill / Partial / No Fill / Reject / Cancel / Unknown
→ Position + Pending Exposure Update
→ Revalidate / Reconcile
→ Continue / Abort / Exit / Flat
→ Edge Retention + Markout + Opportunity Cost
```

### ‏Stable identity

```text
DecisionId
→ OrderIntentId
→ AttemptId
→ ClientOrderId
→ Simulator/PaperOrderId
→ ExecutionIds
→ PositionEpisodeId
```

### ‏Unknown effect

```text
UNKNOWN_EFFECT
→ block duplicate risk-increasing action
→ query authoritative external/Paper truth
→ reconcile
→ resolve
→ only then choose next action
```

‏אין blind retry.

### ‏Execution quality

‏Fill Rate לבדו אינו success metric.

‏נמדוד:

```text
NetEdgeRetained
ImplementationShortfall
FillProbability
TimeToFirstFill
PartialFillRate
NoFillRate
Markout
AdverseSelection
MissedOpportunity
UnknownEffectRate
ReconciliationRate
```

---

# ‏Part IV — Position, Exit, Economics and Risk

## ‏17. Position Truth

‏Position מתחילה ב־first actual simulated/Paper fill, לא ב־requested quantity.

```text
actual_position_qty
remaining_position_qty
actual_avg_fill_price
confirmed executions
reconciled state
```

‏הם ה־truth שעליו Exit/Risk עובדים.

‏Partial Fill הוא Position אמיתית בתוך סביבת המחקר ולכן מפעיל Exit ownership מיד.

---

## ‏18. Exit Policy

‏Exit plan קיים **לפני** Entry Permission.

‏ה־Champion נשאר קטן ודטרמיניסטי:

```text
1. SYSTEM / SAFETY / EMERGENCY
2. HARD RISK
3. VALIDATED THESIS FAILURE / NO-PROGRESS when promoted
4. MAX HOLD TIME
5. SIMPLE REALIZABLE PROFIT CAPTURE
6. otherwise HOLD
```

‏Exact thresholds הם Hypotheses.

‏`No-Progress` ו־`Signal Decay` מתחילים כ־Shadow challengers אלא אם כבר קיימת Evidence מספקת לגרסה הרלוונטית.

‏Profit/Outcome נמדדים מול executable state ו־net economics, לא רק `Last`.

### ‏Terminal condition

```text
Exit Submitted != Flat
Partial Exit != Flat
```

‏ה־episode מסתיים רק כאשר:

```text
authoritative remaining position = 0
AND no potentially-live exposure remains
AND no unresolved execution effect remains
```

‏`TimeToFlat` הוא metric תפעולי מרכזי.

---

## ‏19. Cost / Net Edge Baseline

‏כל Decision משמעותי חוזר לשרשרת:

```text
ExpectedGrossOpportunity
- Entry friction
- Exit friction
- Fees / modeled costs
- Slippage
- Adverse selection
- Impact where material
- Latency decay
- Partial-fill effects
- No-fill / missed-opportunity effects
- Uncertainty allowance
= ExpectedNetExecutableEdge / RemainingEdge estimate
```

‏כאשר component אינו ניתן לאמידה באמינות, נשמור components ו־uncertainty במקום precision מזויף.

‏Net outcome הוא primary economic lens; Prediction accuracy, Win Rate או Fill Rate לבדם אינם מספיקים.

---

## ‏20. Risk Controls

‏Risk Engine עצמאי מה־Scanner ומה־Score.

‏Exposure truth:

```text
ActualFilledExposure
+ WorkingPotentialExposure
+ PendingSubmitExposure
+ CancelPendingExposure
+ ReplaceOverlapExposure
+ UnknownEffectConservativeExposure
= PotentialTotalExposure
```

### ‏Starting sizing baseline

‏`Judgment`: fixed small research/Paper size כדי להפריד signal-quality research מ־sizing research.

‏לאחר מכן:

```text
ApprovedQty = min(
  ResearchBudgetConstraint,
  TradeRiskConstraint,
  LiquidityConstraint,
  ExecutionCostConstraint,
  ExitCapacityConstraint,
  StrategyConstraint,
  EnvironmentConstraint
)
```

‏המסמך אינו קובע סכום כסף או אחוז סיכון אמיתי.

### ‏Risk states

```text
ALLOW
ALLOW_CLAMPED
REJECT
PAUSE_NEW_RISK
EXIT_ONLY
LOCKED
UNKNOWN
```

‏Critical `UNKNOWN` חוסם New Risk.

---

# ‏Part V — Safety, Compliance and Recovery

## ‏21. Safety Control Plane

‏Safety היא authority נפרדת מה־Strategy.

‏Baseline modes:

```text
NORMAL
BLOCK_NEW_ENTRIES
EXIT_ONLY
RECOVERING
FULL_HALT
```

‏Capability model:

```text
CanObserveMarket
CanRank
CanOpenNewExposure
CanIncreaseExposure
CanCancel
CanReduceExposure
CanExit
CanReconcile
CanPersistCriticalTruth
CanRecover
CanResume
```

‏`Process alive != Ready` ו־`Connection restored != Truth restored`.

### ‏Position-first priority

```text
Safety / Emergency
> Position / Exposure Truth
> Working Orders / Fills
> Reconciliation
> Exit / Risk Reduction
> New Entry
> Scanner enrichment
> Research diagnostics
```

‏Signal ניתן לזריקה כאשר הוא stale; exposure קיימת אינה disposable.

---

## ‏22. Conduct / Compliance Baseline

‏Compliance הוא independent hard gate.

‏Baseline defensive controls:

```text
Bona-fide intent / purpose metadata
Single logical execution owner
Duplicate-intent prevention
Related / opposing intent conflict detection
Unknown ownership block
Environment isolation
Manual-vs-automated conflict awareness
Idempotent retry / reconciliation
Self-trade prevention as defense-in-depth when supported
Full audit lineage
```

‏Compliance handling עוסק prevention, detection, governance ו־auditability בלבד.

---

## ‏23. Recovery Baseline

‏Recovery flow:

```text
Detect
→ Contain
→ Persist state / latch
→ Reconcile authoritative truth
→ Rebuild projections
→ Validate invariants
→ Validate readiness
→ Explicit ARM_RESUME
→ restore allowed capabilities
```

‏Restart אינו מנקה critical latch.

‏Startup מתחיל חסום ל־new exposure עד:

```text
build/config/environment identity valid
state restored
orders/fills/positions reconciled
market data ready
feature warm-up complete
clock/persistence/ownership healthy
required gates pass
```

---

# ‏Part VI — Architecture, Persistence and Observability

## ‏24. Architecture Baseline

‏`Judgment`: Modular Monolith עם boundaries לוגיים חזקים:

```text
MarketData
CanonicalState
FeatureEngine
Scanner / Ranking
Decision / Entry
Risk
Safety / Compliance
OrderPolicy
Execution
Position / Exit
Reconciliation
Journal / Persistence
Observability
Replay
Research / Learning
Control Plane
```

‏אותו process יכול להכיל כמה domains, אך ownership/contract boundaries נשמרים.

‏Microservices, distributed streaming platform, complex failover ו־multi-broker topology אינם baseline בלי measured failure-isolation או scaling need.

---

## ‏25. Persistence and Version Identity

‏Truth critical נשמר durably.

‏Baseline storage:

```text
Local durable DB
+ append-only event / state journal
+ periodic snapshots
+ immutable research artifacts
+ SQL-friendly analysis surface
```

‏כל Run משמעותי מקושר לפחות ל־:

```text
RunId
StrategyVersionId
CommitSha / BuildId
ResolvedConfigFingerprint
DataContractVersion
UniverseVersion
FeatureSetVersion
RankingPolicyVersion
VetoPolicyVersion
EntryPolicyVersion
ExitPolicyVersion
OrderPolicyVersion
ExecutionPolicyVersion
RiskPolicyVersion
SafetyPolicyVersion
CompliancePolicyVersion
CostModelVersion
Environment
```

‏`GitCommit != StrategyVersion`.

---

## ‏26. Observability Baseline

‏Observability היא Evidence Chain:

```text
Truth Ledgers
→ Structured Events
→ Metrics
→ Traces / Correlation
→ Incident / Replay Artifacts
```

‏Durable, non-sampled truth ledgers:

```text
Decision Ledger
Order Intent / Order Ledger
Fill Ledger
Position / Exposure Ledger
Risk / Safety / Compliance Ledger
Recovery Journal
Version / Config Change Journal
```

‏כל meaningful Decision Epoch שומר גם:

```text
TRADE / NO_TRADE / UNKNOWN
Top-K
ReasonCodes
Readiness
Data / Scanner health
Version context
```

‏Dashboard אינו Source of Truth.

---

# ‏Part VII — Backtest, Replay and Forward Validation

## ‏27. Backtest Policy

‏Backtest הוא causal evidence system.

‏החוק העליון:

```text
As-Known-At(T)
```

‏המערכת משתמשת רק במה שהיה ניתן לדעת ב־T.

‏ה־baseline:

```text
Fast Causal Screening
→ Event-Level Execution-Aware Backtest
→ Stress / Uncertainty Envelope
```

‏נפריד:

```text
Historical Market Reality
Observed / Available Reality
Decision Reality
Execution Reality
```

‏`Touch != Fill` ו־`Forward Return != Executable PnL`.

‏Execution model תומך ב־partial/no-fill, latency, costs ו־uncertainty. תוצאות משמעותיות מדווחות לפחות תחת `Optimistic / Base / Conservative` assumptions כאשר fidelity אינה מלאה.

---

## ‏28. Validation Policy

‏Baseline chronological validation:

```text
Discovery / Train
→ Later Validation
→ Locked Test / Holdout
→ Walk-Forward when material
```

‏Holdout שהשפיע על feature, threshold, weight, horizon, cost assumption או policy מסומן `USED_FOR_DEVELOPMENT` ואינו Final Holdout לאותו claim.

‏אין promotion על:

```text
one lucky period
one parameter spike
one best run among many hidden trials
in-sample PnL only
```

‏נשמור negative results ו־trial counts.

---

## ‏29. Replay Policy

‏Replay הוא executable time machine של **אותו Core**:

```text
Immutable Recorded Tape
→ Canonical Reader
→ Deterministic Ordering
→ ReplayClock
→ Shared Core
→ Simulated Execution Adapter
→ Ledgers / Hashes
→ Run Diff / First Divergence
```

‏Provenance נשמר בשלוש שכבות:

```text
RECORDED_FACT
DERIVED_STATE
SIMULATED_CONSEQUENCE
```

‏אותו tape + versions + config + seed חייב להפיק אותן semantic outputs.

---

## ‏30. Shadow / Paper Path

‏הסדר המחייב:

```text
Historical Validation
→ Deterministic Replay
→ Signal-Only Shadow
→ Execution Shadow
→ Paper Lifecycle
→ replay recorded forward sessions
→ First-Divergence / RCA
```

‏Shadow בודק live-data timing/parity ללא external Paper side effects.

‏Execution Shadow בודק hypothetical execution semantics.

‏Paper בודק בעיקר:

```text
Order lifecycle
Partial fills
Position truth
Exit lifecycle
Restart / reconnect
Unknown effects
Reconciliation
Observability
Recovery
```

‏Paper PnL אינו Proof of future/live economics.

---

# ‏Part VIII — Testing and Performance

## ‏31. Testing Strategy

‏Testing נמדד לפי contracts מוגנים, לא לפי line coverage.

‏Baseline pyramid:

```text
Fast Unit / Property / Invariant
→ Component / State-Machine
→ Deterministic Integration
→ Mini Golden Replay
→ Fault / Recovery
→ Large Replay / Stress / Performance
→ Controlled Paper / External Conformance
→ Small Acceptance Layer
```

‏Fast suite שומר deterministic, hermetic, network-free ו־wall-clock-sleep-free behavior ככל האפשר.

‏High-value invariants:

```text
No future knowledge
Duplicate event/fill idempotence
Exposure conservation
No duplicate economic effect
No overfill
Stale critical input blocks actionable entry
UNKNOWN_EFFECT blocks blind retry
Flat means truly flat
Safety block prevents risk-increasing side effect
Replay equality under same identity
```

‏Failure משמעותי או flake מוביל ל־RCA ו־regression protection; retry אינו מוחק את ה־first failure.

---

## ‏32. Performance Priorities

‏Performance = preservation of useful decision quality under realistic load.

‏סדר האופטימיזציה:

```text
L0 Measure end-to-end
→ Freshness / Queue Age / Backpressure
→ Remove unnecessary work
→ Incremental algorithms
→ Fast Path / Deep Path
→ Priority scheduling / bounded concurrency
→ measured allocation / copy / GC reductions
→ placement / runtime tuning
→ specialist low-level work only if evidence justifies
```

‏נמדוד `P50/P90/P95/P99`, לא Average בלבד.

‏Freshness ו־oldest queue age קודמים ל־microbenchmark.

‏תחת overload:

```text
Safety / Existing Position / Exit / Reconciliation
>
New Entry
>
Scanner enrichment
>
Research work
```

‏Work שפג semantic/economic TTL נזרק/coalesced/re-decided לפי contract; לא מעובד באיחור רק משום שהוא כבר בתור.

---

# ‏Part IX — Research and Learning

## ‏33. Research Stack

‏Research אינו Notebook-driven tuning.

‏ה־baseline:

```text
Observation
→ Falsifiable Hypothesis
→ Experiment Manifest
→ Frozen Champion
→ Point-in-Time Dataset
→ Controlled Run
→ Chronological Validation / OOS
→ Replay / Stress / RCA
→ Immutable Result Artifact
→ Decision Record
→ Research Queue
→ Shadow Challenger when justified
```

‏`Experiment Registry` הוא Source of Truth.

‏כל decisive experiment קובע מראש:

```text
Primary Metric
Guardrails
One Primary Change where feasible
Evidence Window
Promotion Criteria
Rejection Criteria
Stopping Rule
```

‏Metric שנבחר אחרי צפייה בתוצאה מייצר Experiment חדש.

---

## ‏34. Learning Loop

‏Decision Loop ו־Learning Loop נפרדים.

```text
Runtime / Research Evidence
→ Daily Review
→ First Divergence / RCA
→ Observation
→ Ranked Research Queue
→ Hypothesis
→ Controlled Experiment
→ OOS / Replay / Stress
→ Shadow Challenger
→ Promotion / Rejection / Retirement Review
→ New StrategyVersion when justified
→ Post-change Watch
```

‏עקרונות:

```text
Continuous Improvement != Continuous Change
RCA before Optimization
Negative Result = Knowledge
RETIRE != DELETE
No auto-tuning
No auto-promotion
```

‏ברירת המחדל היא `WIP` קטן: one primary hypothesis at a time כאשר attribution חשוב.

---

# ‏Part X — Promotion / Readiness Governance

## ‏35. Stage Model

```text
NOT_READY
→ RESEARCH_READY
→ REPLAY_READY
→ SHADOW_READY
→ PAPER_READY
→ PRODUCTION_ENGINEERING_READY
→ ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW
```

‏אין state פנימי בשם `LIVE_APPROVED` במסגרת Playbook זה.

‏כל מעבר הוא Gate חדש, scoped, versioned ו־expiring.

### ‏Promotion rule

```text
P0 FAIL or P0 UNKNOWN
→ STOP PROMOTION
```

‏אין Readiness Score משוקלל שמקזז blocker.

‏כל Promotion Packet מקושר ל־versions, config, evidence window, environment ו־open unknowns.

---

## ‏36. Readiness Dimensions

‏לפני `PRODUCTION_ENGINEERING_READY` נדרשת Evidence נפרדת לפחות עבור:

```text
Research
Point-in-Time Data
Universe / Scanner
Negative Evidence / Veto
Economics / Costs
Execution
Exit
Risk
Safety / Compliance
Reconciliation / Recovery
Testing
Observability
Performance
Versioning / Reproducibility
Operations / Security
Learning governance
```

‏`Production Engineering Ready != Economically Proven`.

‏`Economically promising != Operationally ready`.

---

## ‏37. Time-Sensitive Verification List

‏לפני כל שימוש תפעולי עתידי ב־external capability יש לבצע current verification ולשמור:

```text
Fact
Authoritative Source
VerifiedAt
ValidFrom when known
AffectedComponents
Capability / Rule Version
RevalidationTrigger
```

‏נושאים שדורשים re-verification כוללים במיוחד:

```text
Broker capabilities
Order / TIF semantics
Native vs simulated protections
Market-data entitlements / coverage / pacing
Fees
Account permissions / eligibility
Settlement rules
Regulatory requirements
Venue / route specific behavior
Session / auction / halt behavior where relevant
```

‏`02A-REG-NMS-TIME-SENSITIVE-CORRECTION.md` נשאר דוגמה לכך ש־current correction גובר על factual wording ישן.

---

# ‏Part XI — What We Deliberately Avoid Initially

## ‏38. Unified Avoid List

‏לא נכנסים ל־baseline הראשוני ללא Evidence שמצדיק:

```text
Black-box ML ranking
Huge feature library
Automatic parameter tuning
Automatic promotion
Many overlapping exit rules
Dynamic sizing / confidence sizing
Multi-position portfolio optimization
Full-depth whole-universe processing
Active multi-provider merge / failover
Complex venue / route optimization
Pegged / hidden / reserve / broker-algo tactics
Aggressive cancel/replace on every event
Infinite chase
Silent fallback to a different order semantic
Market-without-bound generic order policy
Full queue-position simulation without required fidelity
Microservices / distributed platform by default
HFT co-location / FPGA / kernel-bypass specialization
Premature CPU affinity / NUMA / busy-wait tuning
Winner-only logging
Average-latency-only dashboards
Readiness score averaging
Automatic retry under unknown external effect
Changing strategy because of one bad day
Deleting negative experiments or retired features
```

‏הסיבה המשותפת: complexity ו־failure surface צריכים לשלם עבור עצמם ב־measured incremental decision/economic value.

---

# ‏Part XII — Metrics and Evidence

## ‏39. Minimum Metric Families

### ‏Data / Scanner

```text
FreshCoverageRatio
Input-age percentiles
Gap / stale / invalid rates
ScannerReadiness distribution
EligibleCount
RankGap
RankChurn
Top-K turnover
Candidate persistence
HealthyNoTradeRate
UnknownRate
```

### ‏Prediction / Decision

```text
Forward outcome by rank bucket
Top-K recall
Absolute-gate pass rate
Veto rate
False-veto / missed-opportunity diagnostics
Decision disagreement set
First Divergence category
```

### ‏Execution

```text
FillProbability
TimeToFirstFill
TimeToFullFill
PartialFillRate
NoFillRate
ImplementationShortfall
Markout
AdverseSelection
MissedOpportunity
NetEdgeRetained
UnknownEffectRate
ReconciliationRate
```

### ‏Position / Exit

```text
PositionAge
MFE
MAE
Giveback
TimeToTarget
TimeToFlat
Exit reason distribution
Exit slippage
Partial-exit rate
```

### ‏Economics

```text
Gross opportunity
Modeled costs
Net executable outcome
Cost / gross-edge ratio
Edge decay across pipeline stages
Outcome by regime / episode
Tail outcomes
```

### ‏Operations / Safety

```text
Readiness state
Safety mode time
Queue age / backlog
P95 / P99 latency
Recovery time
Reconciliation blockers
Critical invariant violations
Persistence health
Duplicate / ownership conflicts
```

---

## ‏40. Evidence Artifact Baseline

‏כל meaningful decision/run צריך להיות traceable ל־:

```text
Dataset / Tape
Universe snapshot
Market / feature state
Top-K / candidate evidence
Decision packet
Risk / Safety / Compliance decisions
Order intent / attempts
Execution events
Position episode
Exit decisions
Costs / outcomes
Versions / config
Incident / RCA when applicable
```

‏המטרה היא שאפשר יהיה לענות בדיעבד:

```text
What did the system know?
Why did it choose this candidate?
Why did it not choose alternatives?
Was the decision still valid at handoff?
What happened during execution?
What exposure actually existed?
Why did it exit?
Where did edge disappear?
Can the same evidence reproduce the same decision?
```

---

# ‏Part XIII — Open Hypotheses / Validation Backlog

## ‏41. Questions the Baseline Does Not Pretend to Know

‏ה־Playbook אינו מניח תשובה לשאלות הבאות:

```text
Does short-horizon momentum have stable executable edge?
Are 10s / 30s / 60s the best horizon set?
Which eligibility filters add incremental value?
Which explainable ranking policy is best?
Which negative-evidence rules help OOS?
What Top-K size is most useful?
What candidate / signal TTL is justified?
Which order behavior retains most net edge?
How accurate is the execution / fill model?
What is the true latency / cost envelope?
What is practical capacity?
Does no-progress or signal-decay exit add value?
Does local or cloud placement improve net evidence materially?
When does depth / queue modeling become worth its complexity?
Does ML add incremental decision value beyond the simple baseline?
```

‏אלה הם Experiments עתידיים, לא gaps במסמך.

---

## ‏42. Promotion Rule for Any Challenger

‏Challenger יחליף Champion רק כאשר:

```text
1. Hypothesis was pre-specified enough to be falsifiable.
2. Comparison used a frozen baseline and comparable inputs.
3. Improvement survives chronological OOS / walk-forward where material.
4. Result survives realistic execution, cost and latency assumptions.
5. P0 correctness / safety / compliance guardrails remain PASS.
6. Improvement is not dependent on one narrow parameter spike.
7. Decision-level disagreement analysis supports the mechanism.
8. Complexity tax is justified by incremental value.
9. Replay remains deterministic.
10. Result is versioned, attributable and reproducible.
```

‏Negative או neutral result נשמר ב־Registry.

---

# ‏Part XIV — Implementation Order

## ‏43. Recommended Build Order

‏סדר הבנייה המומלץ:

```text
1. Canonical IDs / versions / config fingerprint
2. Raw capture + canonical L1 market state
3. Point-in-time universe + quality / freshness states
4. Local durable journal / DB / snapshots
5. Incremental 10s / 30s / 60s feature baseline
6. Hard eligibility / data gates
7. Small explainable ordering + Top-K evidence
8. Negative-evidence / veto channel
9. TRADE / NO_TRADE / UNKNOWN decision packet
10. Cost / executability components
11. Entry permission + immutable intent
12. Semantic price-bounded Order Policy
13. Conservative execution simulator
14. Position truth + Exit policy + TimeToFlat
15. Risk reservations + Safety / Compliance gates
16. Deterministic ReplayClock / replay parity
17. Fast invariant / property / mini-replay test suites
18. Observability ledgers + First-Divergence tooling
19. Shadow modes
20. Isolated Paper lifecycle + reconciliation / recovery
21. Production engineering hardening
22. Gate-by-gate readiness packets
23. Controlled Learning Loop / Champion-Challenger
```

‏אין צורך לחכות לסוף כדי לכתוב tests, logs או evidence contracts; הם נכנסים יחד עם כל capability. הרשימה מתארת dependency order, לא “קודם features ואחר כך correctness”.

---

# ‏Part XV — Final End-to-End Contract

## ‏44. The Baseline in One Flow

```text
BROAD POINT-IN-TIME UNIVERSE
→ CANONICAL FRESH MARKET STATE
→ INCREMENTAL 10s / 30s / 60s FEATURES
→ DATA / FRESHNESS / ELIGIBILITY ELIMINATION
→ SMALL EXPLAINABLE PREDICTIVE ORDERING
→ TOP-K EVIDENCE
→ NEGATIVE EVIDENCE / VETO
→ EXECUTION + COST FEASIBILITY
→ ABSOLUTE CANDIDATE GATE
→ TRADE_CANDIDATE / HEALTHY_NO_TRADE / UNKNOWN
→ ENTRY PERMISSION
→ IMMUTABLE SEMANTIC ORDER INTENT
→ PROTECTED PRICE-BOUNDED ATTEMPT
→ DURABLE EXECUTION STATE MACHINE
→ FILL / PARTIAL / NO-FILL / UNKNOWN
→ AUTHORITATIVE POSITION TRUTH
→ EXIT POLICY
→ FLAT_CONFIRMED
→ NET ECONOMIC OUTCOME
→ DURABLE EVIDENCE
→ DETERMINISTIC REPLAY / FIRST DIVERGENCE
→ DAILY REVIEW / RCA
→ RESEARCH QUEUE
→ CONTROLLED EXPERIMENT
→ CHAMPION / CHALLENGER GOVERNANCE
```

‏וסביב כל השרשרת:

```text
RISK
+ SAFETY
+ COMPLIANCE
+ VERSIONING
+ OBSERVABILITY
+ TESTING
+ RECOVERY
```

---

## ‏45. Final Recommended Priority Order

```text
1. Truth / Point-in-Time Correctness
2. Safety / Compliance / Known State
3. Existing Position / Exit / Reconciliation
4. Freshness / Coverage / Queue Age
5. Causal Research Validity
6. Executable Net Economics
7. Explainable Candidate Selection
8. Deterministic Replay / RCA
9. Operational Recoverability
10. Performance Headroom
11. Feature / Model Sophistication
```

‏אם Feature מתקדם, faster implementation או tactic מורכב מתנגש עם item גבוה יותר — הוא מפסיד עד Evidence חדש.

---

# ‏Final Scope Boundary

‏ה־Recommendation Playbook מסתיים כאן במסלול:

```text
Research
→ Replay
→ Shadow
→ Paper
→ Production Engineering Readiness
→ ELIGIBLE_FOR_EXTERNAL_LIVE_READINESS_REVIEW
```

‏אין automatic transition מעבר לנקודה הזו.

‏לפני כל review חיצוני עתידי נדרש current verification של Broker, account eligibility, data entitlements, fees, venue semantics, settlement/regulatory facts וכל capability תלוית־זמן.

---

# ‏Final Finding

> ‏**ה־baseline המומלץ הוא מערכת מחקרית קטנה, point-in-time, elimination-first, explainable, execution-aware, deterministic ו־fail-safe. מתחילים ב־broad L1 market evidence, horizons של `10s / 30s / 60s`, מעט Features, hard eligibility, ordering קטן, Top-K, vetoes, explicit `NO_TRADE / UNKNOWN`, semantic price-bounded execution, fixed small research size, simple exit ownership, full evidence, deterministic replay ו־controlled learning. Complexity נוספת נכנסת רק כאשר measured evidence מראה שהיא מוסיפה incremental net decision value בלי לפגוע ב־correctness, safety, reproducibility או recoverability.**