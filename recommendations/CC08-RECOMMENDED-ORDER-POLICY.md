# ‏Cross-Cutting 08 — Recommended Order Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Order Types, Entry/Exit, Advanced Order Tactics, Execution Subtleties, Execution Engine, Recovery ו־Compliance למדיניות `Order` אחת deterministic, explainable, recoverable ו־replayable עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו הוראה לבצע מסחר בכסף אמיתי, אינו אישור `Live`, ואינו מגדיר פקודות אופרטיביות לחשבון אמיתי. הוא מגדיר את החוזה הארכיטקטוני והמחקרי שלפיו `OrderIntent` מתורגם ל־simulated/paper order semantics ונמדד מול outcomes.

---

## ‏1. Decision

‏`Order Policy` אינה:

```text
signal says buy
→ choose Market / Limit
→ send
```

‏ואינה:

```text
Order Type name
=
economic behavior
```

‏אלא:

```text
Semantic Intent
→ Risk / Safety / Compliance Permission
→ Fresh Execution Context
→ Remaining Edge / Exit Obligation
→ Order Policy
→ Broker/Simulator Capability Mapping
→ Durable Attempt State
→ Submit / Working / Partial / Fill / Cancel / Reject / Unknown
→ Reconciliation
→ Outcome / Markout / Missed Opportunity
→ RCA / Research
```

‏העקרונות המחייבים:

```text
Intent != Order
Order Type != Execution Outcome
Sent != Accepted
Accepted != Working
Working != Filled
CancelRequested != Canceled
Timeout != Reject
Partial Fill != Full Position
UNKNOWN_EFFECT != Failure
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`OrderIntent` סמנטי קודם ל־Order Primitive

‏Strategy/Entry/Exit מגדירים **מה רוצים להשיג**.

‏Order Policy מגדירה כיצד לבטא זאת ב־primitive זמין.

‏`OrderIntent` יכיל לפחות:

```text
OrderIntentId
DecisionId
PositionId when relevant
InstrumentId
Purpose
SideOrTargetPosition
RequestedQty
Urgency
CreatedAt
IntentTTL
ExecutionDeadline
MaxPriceOrMinPrice
MaxSlippageOrExecutionBudget
PartialFillPolicy
CancelPolicy
ReplacePolicy
RiskSnapshotId
ComplianceDecisionId
StrategyVersion
OrderPolicyVersion
ExecutionPolicyVersion
Environment
```

‏אין לשכתב Intent בדיעבד כדי שיתאים ל־fill שהתקבל.

### ‏`P0 — Required`: ‏Order Policy אינה עוקפת Gates

‏Order generation מותר רק כאשר:

```text
Risk = ALLOW
Safety = ALLOW
Compliance = ALLOW
State = KNOWN
Environment = EXPECTED
```

‏Score, Rank או modeled profit אינם רשאים לקזז failure קריטי.

### ‏`P0 — Required`: ‏Hard Price Bound כאשר הפעולה מגדילה Risk

‏ל־entry/increase exposure מחקרי נדרש bound מפורש:

```text
Buy  → MaxAcceptablePrice
Sell → MinAcceptablePrice
```

‏ה־bound נגזר מ־remaining economics, costs, uncertainty ו־risk margin.

‏הוא אינו chase permission ואינו offset קבוע אוניברסלי.

### ‏`P0 — Required`: ‏Economic Lifetime מפורש

‏נפריד:

```text
SignalTTL
IntentTTL
OrderTTL
ExecutionDeadline
```

‏Order יכולה להיות חוקית אצל ה־broker/simulator גם לאחר שה־economic intent כבר פג.

‏לכן:

```text
EconomicExpiry
→ no new exposure from stale intent
→ cancel / reconcile according to state
```

### ‏`P0 — Required`: ‏Canonical Order State Machine

‏נשתמש ב־canonical semantics משלנו, לדוגמה:

```text
CREATED
APPROVED
SUBMITTING
ACKNOWLEDGED
WORKING
PARTIALLY_FILLED
CANCEL_REQUESTED
REPLACE_PENDING
CANCELED
FILLED
REJECTED
EXPIRED_LOCAL
UNKNOWN_EFFECT
RECONCILING
TERMINAL
```

‏Broker/vendor statuses ממופים ל־states האלה דרך Adapter versioned.

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT` הוא State עסקי

‏כאשר Submit/Cancel/Replace אולי הגיע ל־external boundary אך לא ניתן להוכיח את התוצאה:

```text
UNKNOWN_EFFECT
→ block exposure-increasing duplicate action
→ reconcile authoritative truth
→ only then continue
```

‏אין blind retry ל־state-changing command.

### ‏`P0 — Required`: ‏Partial Fill הוא First-Class State

‏Partial fill משנה מיד:

```text
ActualPosition
RemainingRequestedQty
PendingExposure
ExitObligation
RiskState
RemainingEconomics
```

‏Order Policy חייבת להגדיר מראש אם:

```text
keep_partial
cancel_remainder
attempt_remaining_qty
transition_to_exit_or_reduce
```

‏אין default סמוי של “להמשיך עד target”.

### ‏`P0 — Required`: ‏Cancel / Replace הם פעולות כלכליות, לא UI updates

‏כל Cancel/Replace משמעותי מקבל:

```text
ReasonCode
RequestedAt
ExpectedEffect
PolicyVersion
RevalidationResult
```

‏Replace שמגדיל aggressiveness דורש revalidation של:

```text
intent still alive
remaining edge sufficient
price bound valid
risk/safety/compliance still allow
external state known
```

### ‏`P0 — Required`: ‏Cancel אינו Terminal עד Truth מאומתת

```text
CancelRequested != Canceled
```

‏Fill יכול להתרחש בזמן cancel race.

‏לכן replacement או opposite intent אינם מניחים שה־order הקודמת נעלמה עד confirmation/reconciliation.

### ‏`P0 — Required`: ‏Order Ownership ו־Conflict Prevention

‏כל Order חייב להשתייך ל־owner ו־intent lineage אחד.

‏לפני יצירת Order נבדוק לפחות:

```text
DuplicateIntent
RelatedWorkingOrder
OpposingRelatedIntent
UnknownOrderOwnership
EnvironmentMismatch
RecoveryInProgress
ManualConflict when applicable
```

‏Conflict קריטי:

```text
BLOCK NEW RISK
→ reconcile
```

‏External STP/SMP, כאשר קיים, הוא defense-in-depth בלבד.

### ‏`P0 — Required`: ‏Environment Isolation

```text
REPLAY
SHADOW
PAPER
```

‏מקבלים boundaries נפרדים וברורים.

‏`SHADOW` מייצר `WouldHaveOrdered` בלבד.

‏Ambiguous environment חוסם side effect חיצוני.

### ‏`P1 — Preferred Default`: ‏Champion Order Family קטנה

‏ה־baseline אינו ספרייה של עשרות order types.

‏מספיקים בתחילת המחקר concepts פשוטים:

```text
Protected Price-Bounded Attempt
Simple Passive Comparison
Immediate-or-Cancel-style simulation where semantics are verified
Cancel / Replace under explicit policy
```

‏המטרה היא למדוד behavior, לא לאסוף features של broker.

### ‏`P1 — Preferred Default`: ‏Order Type הוא Implementation Detail של Policy

‏אותו `Limit` יכול להיות:

```text
passive
improved
marketable
```

‏לפי היחס שלו ל־book.

‏לכן telemetry תתעד economic behavior מפורש:

```text
AggressionMode
ReferencePrice
OrderPrice
HardBound
SpreadCrossed
OrderTTL
```

‏ולא רק:

```text
order_type = LIMIT
```

### ‏`P1 — Preferred Default`: ‏No-Fill הוא Outcome מלא

‏נשמור גם attempts שלא התמלאו.

‏נמדוד:

```text
FillProbability
TimeToFill
OutcomeGivenFill
OutcomeGivenNoFill
MissedOpportunity
AdverseSelectionAfterFill
SignalAgeAtFill
```

‏Fill Rate לבדו אינו מדד איכות.

### ‏`P0 — Required`: ‏Exit Orders אינם סימטריים ל־Entry Orders

‏Entry יכולה להסתיים ב־:

```text
NO_TRADE / ABORT
```

‏Exit מטפלת ב־existing exposure.

‏לכן Order Policy חייבת לקבל `Purpose` ו־`Urgency` ולהגן על risk-reduction path גם כאשר new-entry path חסום.

---

## ‏3. Recommended Policy Shape

‏ה־Order Policy המומלצת:

```text
OrderIntent
→ Validate Ownership / Environment
→ Check Risk / Safety / Compliance
→ Read Fresh Execution Context
→ Recompute Remaining Edge when risk-increasing
→ Select small policy mode
→ Map to supported simulator/paper primitive
→ Persist Attempt
→ Apply external side effect
→ Consume events idempotently
→ Update canonical order state
→ Update position / pending exposure
→ Reconcile unknowns
→ Close attempt only on proven terminal semantics
```

‏זו שכבה מתחת ל־Entry/Exit Decision ומעל ל־Broker/Simulator Adapter.

---

## ‏4. Why

### ‏Fact

‏Order acknowledgement אינו Fill.

### ‏Fact

‏Limit price מגדירה bound אך אינה מבטיחה execution.

### ‏Fact

‏Cancel ו־Fill יכולים לחצות בזמן.

### ‏Fact

‏Order capabilities ו־semantics יכולים להשתנות לפי Broker, Venue, Route, Product ו־Session.

### ‏Fact

‏Partial Fill יוצר state כלכלי שונה מ־No Fill ומ־Full Fill.

### ‏Judgment

‏למערכת short-horizon מחקרית, Order Policy קטנה, bounded ו־deterministic עדיפה על מגוון tactics גדול לפני שיש execution evidence.

### ‏Judgment

‏Hard bounds, TTL, ownership, idempotency ו־reconciliation הם חלק מ־correctness; אינם execution optimization אופציונלי.

### ‏Hypothesis

‏Adaptive order behavior יכול לשפר edge retention לעומת Policy קבועה, אך רק אם הוא מנצח Champion פשוט OOS בלי להגדיל tail cost, unknown states או complexity באופן לא מוצדק.

---

## ‏5. Use When

‏ה־baseline מתאים כאשר:

- ‏קיים `OrderIntent` versioned.
- ‏Entry/Exit policy כבר החליטו על objective ו־urgency.
- ‏Market state ו־execution context זמינים ומסומנים freshness/quality.
- ‏יש simulator או paper boundary שניתן למדוד.
- ‏יש state machine ו־reconciliation path.
- ‏Partial fill ו־cancel race נתמכים לוגית.
- ‏יש audit lineage מ־Decision עד Outcome.

---

## ‏6. Do Not Use When

‏אין לסמן Order layer כמוכנה כאשר:

```text
intent ownership unknown
external order state unknown and retry is automatic
partial fill unsupported
cancel requested treated as canceled
order lifetime disconnected from economic lifetime
broker status names treated as canonical truth
shadow/paper environment can cross boundary silently
opposing related intents can coexist without review
```

---

## ‏7. Alternatives

### ‏Alternative A — Minimal Price-Bounded Policy

‏Baseline המומלץ.

‏יתרונות:

- ‏קל להסביר.
- ‏קל ל־Replay.
- ‏קל למדוד Edge Retention.

‏חסרונות:

- ‏פחות adaptive.

### ‏Alternative B — Passive-First Policy

‏`P2 Challenger`.

‏נמדדת מול:

```text
price improvement
fill probability
queue delay
missed opportunity
adverse selection
```

### ‏Alternative C — Immediate/Binary Attempt

‏`P2 Challenger` למחקר של opportunity קצרה מאוד, רק תחת semantics מאומתים ב־simulator/paper adapter.

### ‏Alternative D — Stepwise Adaptive Escalation

```text
PASSIVE
→ IMPROVED
→ MORE_AGGRESSIVE_WITHIN_BOUND
→ ABORT
```

‏`P2/P3` לאחר baseline telemetry.

### ‏Alternative E — Venue / Route Specific Policy

‏`P3/P4` בלבד לאחר Evidence שיש route-specific value שאינו מוסבר רק על ידי data quality או latency artifacts.

### ‏Alternative F — Broker Algos / Advanced Pegged / Hidden / Reserve

‏`P4 Specialist`.

‏נדרשים current capability verification, simulator semantics, observability ו־incremental OOS value.

---

## ‏8. Trade-offs

### ‏Price Protection vs Fill Probability

‏Bound הדוק יותר מפחית tail price deterioration אך יכול להגדיל No-Fill.

### ‏Passive vs Aggressive

‏Passive יכולה לשפר price אך להגדיל delay, missed opportunity ו־adverse selection.

### ‏Cancel/Replace vs Stability

‏יותר updates יכולים לשפר proximity אך מגדילים race conditions, queue loss, complexity ו־audit burden.

### ‏Native Broker Feature vs Local Control

‏Native capability יכולה להיות יעילה, אך semantics תלויות־זמן וחייבות current verification.

### ‏Adaptivity vs Explainability

‏Policy adaptive יכולה לשפר fit למצב שוק אך מגדילה overfitting, replay complexity ו־RCA cost.

---

## ‏9. What I Would Avoid Initially

‏לא נתחיל עם:

```text
Always Market
Always Passive
Infinite Chase
Cancel/Replace on every tick
many broker-specific order types
venue-specific optimization
complex pegged logic
hidden/reserve logic as baseline
broker algos as default
auto retry after unknown effect
assumption that OCO/OCA/STP is atomic or universal
full L2 queue model as requirement for correctness
```

‏ובעיקר לא נשתמש בשם Order Type כתחליף ל־observed semantics.

---

## ‏10. What to Add Later

‏לפי Evidence:

```text
passive vs bounded-aggressive challenger
stepwise escalation
fill-probability model
queue-aware diagnostics
midpoint / price-improvement experiments
adaptive TTL
liquidity-bucket policies
route-specific experiments
advanced broker-native protections
```

‏רק לאחר מכן:

```text
complex broker algos
learned execution policy
multi-venue specialist logic
```

---

## ‏11. Required Data / Evidence

### ‏Intent

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
PolicyVersions
Environment
```

### ‏Market Context

```text
Bid
Ask
Sizes when available
Spread
ReferencePrice
QuoteAge
TradeAge
MarketGeneration
SessionState
```

### ‏Attempt

```text
AttemptId
ClientOrderId
BrokerOrSimulatorOrderId
PrimitiveType
AggressionMode
OrderPrice
TimeInForceSemantic
OrderTTL
SubmittedAt
```

### ‏Lifecycle

```text
AcknowledgedAt
WorkingAt
PartialFillEvents
FillEvents
CancelRequestedAt
CancelConfirmedAt
ReplaceRequestedAt
RejectAt
UnknownEffectAt
ReconciliationEvents
TerminalState
```

### ‏Economic Outcome

```text
FillRate
TimeToFirstFill
TimeToFinalFill
AverageFillPrice
ImplementationShortfall
SpreadCost
Slippage
PostFillMarkout
MissedOpportunity
SignalAgeAtFill
RemainingEdgeAtFill
TimeToFlat when exit-related
```

### ‏Compliance / Ownership

```text
OwnerId
ComplianceDecisionId
RelatedIntentCheck
EnvironmentCheck
ConflictReasonCodes
EvidenceRefs
```

---

## ‏12. Promotion Criteria

‏Order-policy Challenger מתקדם רק אם:

- ‏משפר net/executable outcome מול Champion על paired OOS evidence.
- ‏השיפור נשמר לאחר No-Fill ו־missed-opportunity accounting.
- ‏P95/P99 execution cost אינו מתדרדר באופן מהותי.
- ‏Unknown/reconciliation rate אינו גדל בצורה לא מקובלת.
- ‏Partial-fill behavior נשאר נכון וניתן לשחזור.
- ‏State machine נשאר deterministic.
- ‏ה־policy אינה תלויה ב־broker quirk שלא תועד/versioned.
- ‏ה־complexity tax מוצדק על ידי decision impact אמיתי.

---

## ‏13. Rejection Criteria

‏נדחה או נוריד דרגה ל־Order Policy אם:

```text
fill rate improves but net outcome worsens
better price hides larger missed opportunity
average improves but tail slippage worsens materially
policy only wins under optimistic fill assumptions
cancel/replace churn rises without incremental value
unknown states or duplicate-risk incidents increase
policy requires hidden mutable broker assumptions
replay/paper semantics diverge materially
one narrow parameter cell explains most of the improvement
```

---

## ‏14. Metrics

### ‏Correctness

```text
DuplicateIntentRate
DuplicateEffectRate
UnknownEffectRate
ReconciliationRate
OwnershipConflictRate
EnvironmentMismatchRate
InvalidTransitionRate
```

### ‏Execution

```text
FillRate
PartialFillRate
NoFillRate
CancelRate
ReplaceRate
RejectRate
TimeToFirstFill
TimeToTerminal
```

### ‏Economics

```text
ImplementationShortfall
SpreadCost
Slippage
PostFillMarkout
MissedOpportunity
EdgeRetention
RemainingEdgeAtFill
```

### ‏Operational

```text
StateTransitionLatency
CancelToConfirmedLatency
UnknownToReconciledLatency
StaleWorkingOrderCount
OrderAgeDistribution
```

---

## ‏15. Failure Modes

1. ‏`Order Type = Outcome` — מניחים ש־Limit הייתה passive או ש־Market הבטיחה fill semantics מסוימים.
2. ‏`Blind Retry` — timeout יוצר duplicate effect.
3. ‏`Cancel Means Gone` — fill מגיע בזמן cancel race.
4. ‏`Partial Fill Ignored` — position/risk אינם מתעדכנים.
5. ‏`Stale Remainder` — order נשארת עובדת לאחר מות ה־intent.
6. ‏`Infinite Chase` — execution budget נשחק ללא גבול.
7. ‏`Broker Status Leakage` — strategy תלויה בשמות vendor במקום canonical state.
8. ‏`Environment Crossing` — Shadow/Paper path מגיע ל־boundary הלא נכון.
9. ‏`Ownership Conflict` — שני intents/instances מחזיקים authority על אותו scope.
10. ‏`STP as Primary Control` — internal conflict prevention חסר.
11. ‏`Fill Rate Optimization` — ממקסמים fills במקום retained edge.
12. ‏`Advanced Feature Cargo Cult` — משתמשים ב־Pegged/Hidden/Algo ללא Evidence.

---

## ‏16. User-Specific Application

‏למערכת שלנו, שמחפשת Edge קצר ונמדד בשניות ולא microsecond-HFT, ברירת המחדל המחקרית צריכה להיות **Order Policy קטנה ומוגבלת היטב**.

‏ה־Champion צריך לענות בפשטות על:

```text
What is the intent?
How long is it economically valid?
What is the worst acceptable modeled price?
What happens on no fill?
What happens on partial fill?
What happens on cancel race?
What happens if the outcome becomes unknown?
How do we prove terminal state?
```

‏לפני שמוסיפים tactic מתקדם, צריך להוכיח שהבעיה האמיתית נמצאת ב־Order Policy ולא ב־prediction, data freshness, ranking, entry timing או exit logic.

---

## ‏17. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Order lifecycle אסינכרוני ויכול לכלול intermediate/unknown states.
- ‏Partial fills ו־cancel/fill races דורשים explicit state handling.
- ‏Broker/Venue capabilities ו־semantics תלויות מערכת ויכולות להשתנות.
- ‏No Fill ו־Fill הם outcomes שונים שדורשים מדידה נפרדת.

### ‏Judgment

- ‏Champion ראשוני צריך להיות קטן, bounded, deterministic ו־provider/broker-agnostic ככל האפשר.
- ‏Hard price/time/state contracts קודמים ל־advanced order features.
- ‏Internal ownership/conflict prevention קודמים ל־external STP/SMP.

### ‏Hypothesis

- ‏Passive, immediate או adaptive challengers עשויים לשפר edge retention בתנאים מסוימים.
- ‏הערך שלהם חייב להוכיח את עצמו OOS אחרי costs, no-fill, markout ו־complexity tax.

---

## ‏18. Confidence

### ‏High

- ‏Intent/Order/Outcome חייבים להיות שכבות נפרדות.
- ‏`UNKNOWN_EFFECT` מחייב reconciliation לפני exposure-increasing retry.
- ‏Partial Fill ו־Cancel Race הם first-class states.
- ‏Economic lifetime ו־order lifetime חייבים להיות מפורשים.
- ‏Order ownership/environment חייבים להיות ניתנים להוכחה.

### ‏Medium

- ‏Policy price-bounded פשוטה היא Champion מחקרי טוב.
- ‏מספר קטן של policy modes עדיף בתחילת הדרך על order zoo.

### ‏Low / Unproven

- ‏איזה tactic ספציפי ינצח בכל liquidity/regime bucket.
- ‏האם midpoint/passive/adaptive behavior מוסיף net edge.
- ‏האם routing או advanced broker algos מצדיקים complexity.

---

## ‏19. Time-Sensitive Facts

‏כל capability תלוי־Broker/Venue נשאר Reference בלבד ודורש re-verification לפני שימוש תפעולי, כולל:

```text
supported order types
TIF semantics
native vs simulated behavior
routing requirements
cancel/replace semantics
OCA/OCO behavior
STP/SMP support
session restrictions
partial-fill child behavior
```

‏אין להסיק semantics משם הפקודה בלבד.

---

## ‏20. Acceptance Tests

### ‏Test A — Lost ACK

```text
submit attempted
ack unknown
```

‏Expected:

```text
UNKNOWN_EFFECT
no blind duplicate
reconciliation required
```

### ‏Test B — Cancel / Fill Race

```text
cancel requested
fill arrives before terminal cancel truth
```

‏Expected:

```text
fill updates actual position exactly once
state does not assume canceled prematurely
```

### ‏Test C — Partial Fill

```text
requested = 100
filled = 37
```

‏Expected:

```text
actual exposure = 37
remaining/pending state explicit
exit obligation armed for 37
```

### ‏Test D — Economic Expiry

```text
order still working
intent TTL expired
```

‏Expected:

```text
no additional intended exposure
cancel/reconcile path according to policy
```

### ‏Test E — Duplicate Intent

```text
same business intent presented twice
```

‏Expected:

```text
at most one economic effect lineage
```

### ‏Test F — Environment Mismatch

```text
SHADOW intent reaches side-effect boundary
```

‏Expected:

```text
BLOCK
WouldHaveOrdered evidence only
```

### ‏Test G — Replay Determinism

‏אותו Intent + state + versions:

```text
same policy mode
same primitive semantics
same state transitions under same modeled events
```

---

## ‏21. Recommendation Summary

```text
Semantic Intent
→ Permission Gates
→ Fresh Execution Context
→ Economic Bounds / TTL
→ Small Versioned Order Policy
→ Durable Attempt
→ Canonical Async State Machine
→ Partial / Cancel / Unknown handling
→ Reconciliation
→ Terminal Truth
→ Execution Economics / RCA
```

‏ה־Order Policy המומלצת היא **קטנה, bounded, deterministic, ownership-aware ו־recoverable**. Advanced order types, routing, pegging ו־adaptive tactics נכנסים רק לאחר שהם מוכיחים incremental edge retention מעבר ל־Champion הפשוט, בלי לפגוע ב־correctness או observability.