# ‏Cross-Cutting 09 — Recommended Execution Policy

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Entry, Exit, Order Policy, Execution Engine, Advanced Order Tactics, Costs, Risk, Recovery, Observability ו־Compliance למדיניות `Execution` אחת deterministic, auditable, recoverable ו־replayable עבור `Research / Replay / Shadow / Paper`.
>
> ‏המסמך אינו הוראה לבצע מסחר בכסף אמיתי ואינו אישור `Live`. הוא מגדיר את החוזה המחקרי והארכיטקטוני שלפיו Intent מאושר עובר דרך execution lifecycle ונמדד לפי edge שנשמר, state correctness ויכולת recovery.

---

## ‏1. Decision

‏`Execution` אינו:

```text
send order
→ wait for response
→ done
```

‏וגם אינו:

```text
high fill rate
=
good execution
```

‏אלא:

```text
Approved Semantic Intent
→ Risk / Safety / Compliance Reservation
→ Fresh Execution Context
→ Execution Budget + Hard Bounds
→ Immutable Attempt Record
→ Broker / Simulator Side Effect
→ Canonical Async State
→ Fill / Partial / No Fill / Reject / Cancel / Unknown
→ Position + Pending Exposure Update
→ Revalidation / Reconcile
→ Continue / Abort / Exit / Flat
→ Net Edge Retained + Markout + Opportunity Cost
→ Evidence / RCA / Research
```

‏העקרונות המחייבים:

```text
Intent != Order != Execution Outcome
Sent != Accepted != Working != Filled
Timeout != Reject
CancelRequested != Canceled
Partial Fill changes exposure immediately
UNKNOWN_EFFECT is a business state
Local expectation != external truth
Entry and Exit are economically asymmetric
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Execution Core הוא durable state machine

‏ה־Execution Core אחראי לפחות על:

```text
Intent lifecycle
Attempt lifecycle
idempotency
canonical order state
broker/simulator command orchestration
fill application
pending exposure
parent/child aggregation
reconciliation
execution readiness
```

‏הוא אינו wrapper דק סביב API.

### ‏`P0 — Required`: ‏Semantic ownership נשאר נפרד

```text
Strategy / Decision
→ whether opportunity is desired

Risk / Safety / Compliance
→ whether exposure-changing action is permitted

Order Policy
→ which primitive / tactic expresses the intent

Execution Core
→ how side effects are persisted, observed, reconciled and completed

Broker Adapter
→ provider-specific translation and capability mapping

Position Controller
→ desired / actual / potential position truth
```

‏אפשר לממש כמה שכבות באותו process, אך אסור למחוק את גבולות האחריות.

### ‏`P0 — Required`: ‏Stable identity + idempotency

‏נשמור correlation מפורש:

```text
DecisionId
→ OrderIntentId
→ AttemptId
→ ClientOrderId
→ BrokerOrderId / SimulatorOrderId
→ ExecutionIds
→ PositionId
```

‏אותו business intent אינו רשאי ליצור exposure כפול עקב:

```text
retry
timeout
reconnect
restart
duplicate callback
late callback
```

### ‏`P0 — Required`: ‏Persist before meaningful side effect

‏לפני `Submit`, ‏`Cancel` או `Replace` משמעותיים נשמור durable record שמספיק ל־Recovery.

‏Baseline journal:

```text
IntentCreated
RiskReserved
AttemptCreated
CommandPlanned
CommandAttempted
CommandAcknowledged
BrokerOrderObserved
PartialFillObserved
FillObserved
CancelRequested
CancelConfirmed
ReplaceRequested
UnknownEffectEntered
ReconciliationStarted
ReconciliationCompleted
IntentTerminal
```

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT → RECONCILE`

‏אם פקודה משנת־state אולי הגיעה לצד החיצוני אך התוצאה אינה ידועה:

```text
UNKNOWN_EFFECT
→ block duplicate exposure-increasing action
→ reconcile orders / executions / positions
→ restore authoritative truth
→ only then choose retry / recovery / terminate
```

‏אין blind retry.

### ‏`P0 — Required`: ‏Authoritative execution facts גוברים על local expectation

‏כאשר יש conflict:

```text
verified fills / executions
> semantically weaker external summaries
> local expected state
```

‏Fill מוכח אינו נמחק בגלל status callback ישן או projection מקומי.

### ‏`P0 — Required`: ‏Duplicate / out-of-order events idempotent

‏אותו authoritative fill יכול לשנות Position פעם אחת בלבד.

‏כל ingestion path צריך לתמוך ב־:

```text
duplicate events
late events
out-of-order statuses
fill-before-status
reconnect replay
```

### ‏`P0 — Required`: ‏Partial Fill הוא normal state

```text
requested_qty = 100
filled_qty = 37
remaining_qty = 63
```

‏מייד מתקבלים:

```text
actual_exposure = 37
potentially_live_exposure <= 63 more
exit_obligation = 37
remaining execution plan must be re-evaluated
```

‏אין assumption של `0 or full target`.

### ‏`P0 — Required`: ‏Pending Exposure הוא חלק מ־Risk Truth

‏נכלול לפחות:

```text
working orders
cancel-pending orders
replace overlap
unknown-effect orders
active child orders
```

‏Invariant:

```text
ActualFilledExposure
+
PotentiallyLiveExposure
<= MaximumAuthorizedExposure
```

### ‏`P0 — Required`: ‏Last-mile revalidation לפני פעולה שמגדילה Risk

‏לפני initial submit, aggressive replace או השלמת partial fill נבדוק מחדש:

```text
intent still valid
signal / decision TTL alive
market state fresh enough
hard price bound still valid
remaining edge still sufficient
risk reservation still valid
position truth known
pending exposure known
execution epoch current
no conflicting live intent/order
safety/compliance still permit
required capability supported
```

‏Critical `FAIL` או `UNKNOWN` חוסמים פעולה שמגדילה simulated/paper exposure.

### ‏`P0 — Required`: ‏Execution Budget

‏ה־Execution Policy פועלת בתוך budget כלכלי:

```text
MaximumExecutionBudget
=
PredictedGrossEdge
- UnavoidableCosts
- MinimumRequiredNetEdge
- RiskMargin
```

‏ה־budget יכול להיצרך על ידי:

```text
spread
fees
slippage
latency move
price deterioration
impact
adverse selection
```

‏אין chase שאינו מוגבל על ידי remaining economics.

### ‏`P0 — Required`: ‏Remaining Edge נבדק לאורך lifecycle

```text
RemainingEdge
=
UpdatedExpectedMove
- UpdatedExplicitCosts
- UpdatedSpreadSlippage
- UpdatedImpact
- UpdatedAdverseSelection
- UpdatedRiskMargin
```

‏ב־Entry:

```text
RemainingEdge insufficient
→ CANCEL / ABORT / NO_TRADE
```

‏אין sunk-cost justification להמשיך רק משום שכבר התחלנו ניסיון ביצוע.

### ‏`P0 — Required`: ‏Entry ו־Exit אינם סימטריים

‏Entry יכול להסתיים ב־:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת exposure.

‏לכן תחת contention/backpressure:

```text
Safety / Flatten
→ Cancel stale risk
→ Exit
→ Reconcile unknown
→ Entry
→ Background diagnostics
```

### ‏`P0 — Required`: ‏`TimeToFlat` הוא terminal execution metric ל־Exit

‏Exit אינו מסתיים ב־submit או ACK.

```text
Exit Intent
→ Submit
→ First Fill
→ Final Fill
→ Reconcile
→ Authoritative Flat
```

‏המדד המרכזי:

```text
exit_intent_to_flat_ms
```

### ‏`P1 — Preferred`: ‏Champion Execution Policy קטן ופשוט

‏ה־Champion הראשון יהיה:

```text
fresh execution context
→ bounded price protection
→ short economic TTL
→ pre-effect revalidation
→ simple order tactic
→ explicit pending exposure
→ deterministic cancel/abort behavior
→ fill/no-fill measurement
→ reconciliation support
```

‏המטרה היא benchmark שקל לשחזר ולהפריך — לא “טקטיקה חכמה” ככל האפשר.

### ‏`P1 — Preferred`: ‏Fill probability ו־Fill quality נמדדים יחד

‏לכל tactic נשמור:

```text
P(Fill)
ExpectedOutcomeGivenFill
ExpectedOutcomeGivenNoFill
TimeToFill
ExecutionPrice
PostFillMarkout
MissedOpportunity
SignalAgeAtFill
NetEdgeRetained
```

‏`Fill Rate` לבדו אינו KPI ראשי.

### ‏`P1 — Preferred`: ‏No Fill הוא outcome, לא row למחיקה

‏No-Fill / Cancel / Abort נשמרים כדי למדוד:

```text
missed opportunity
avoided adverse selection
future executable path
counterfactual tactics
selection bias
```

### ‏`P1 — Preferred`: ‏Single logical execution owner

‏ל־KISS, baseline הוא writer לוגי יחיד ל־critical execution state.

‏אם בעתיד יש active/passive או multi-instance, נדרשים ownership + fencing מפורשים; heartbeat בלבד אינו proof of authority.

---

## ‏3. Why

### ‏Fact

‏External side effects אינם transaction מקומי עם exactly-once guarantee.

### ‏Fact

‏Timeout אינו מוכיח שהפקודה נכשלה.

### ‏Fact

‏Cancel ו־Fill יכולים לחצות בזמן.

### ‏Fact

‏Partial Fill משנה exposure בפועל.

### ‏Fact

‏Fill מהיר אינו בהכרח Fill טוב אם post-fill markout והעלויות מוחקים את ה־edge.

### ‏Judgment

‏למערכת short-horizon עדיף baseline execution קטן, bounded ו־observable על policy adaptive עשירה לפני שיש telemetry איכותי.

### ‏Hypothesis

‏Policy דינמית שממפה signal half-life, liquidity, spread ו־remaining edge לרמת urgency עשויה לשפר `NetEdgeRetained`, אך היא Challenger בלבד עד OOS evidence.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏`OrderIntent` ו־Order Policy כבר קיימים.
- ‏יש authoritative/simulated execution events שניתנים ל־dedupe.
- ‏Position truth נגזרת מ־fills.
- ‏אפשר למדוד decision/attempt/ack/fill/cancel/reconcile timestamps.
- ‏Risk ו־pending exposure משותפים לאותו lifecycle.
- ‏Replay משתמש באותו Execution Core ככל האפשר.

---

## ‏5. Do Not Use When

‏אין להציג Execution כ־ready אם:

- ‏timeout גורר retry אוטומטי.
- ‏אין `IntentId`/`AttemptId` יציבים.
- ‏Partial Fill אינו state מפורש.
- ‏working/cancel-pending exposure לא נספר.
- ‏Restart מוחק broker/simulator reality.
- ‏לא ניתן ליישב mismatch בין local ל־external state.
- ‏Fill Rate הוא metric ההצלחה היחיד.
- ‏Replay ו־Paper משתמשים ב־state semantics שונים מהותית בלי versioned mapping.

---

## ‏6. Alternatives

### ‏Alternative A — Stateless API Wrapper

‏פשוט, אך אינו מתאים ל־failure semantics של side effects אסינכרוניים.

‏סטטוס: `Reject`.

### ‏Alternative B — Durable Single-Owner State Machine

‏Baseline המומלץ.

‏סטטוס: `P0/P1`.

### ‏Alternative C — Adaptive Execution Controller

‏משנה urgency/tactic לפי market state ו־remaining edge.

‏סטטוס: `P2/P3 Challenger` לאחר baseline telemetry.

### ‏Alternative D — Venue/Route-specialized Execution

‏יכול לשפר fill economics אך מוסיף capability, data ו־RCA complexity.

‏סטטוס: `P3/P4` בלבד עם Evidence.

### ‏Alternative E — Learned Execution Policy

‏דורש labels, counterfactual assumptions ו־strong OOS validation.

‏סטטוס: `P4 Specialist`.

---

## ‏7. Trade-offs

### ‏Persistence vs Latency

‏Durable journal מוסיף overhead קטן אך נותן recovery/audit correctness.

### ‏Aggression vs Cost

‏יותר urgency יכולה לשפר immediacy אך להגדיל spread/slippage/adverse selection.

### ‏Passive vs Opportunity Cost

‏Price improvement אפשרי מול no-fill, signal decay ו־queue uncertainty.

### ‏Simple Policy vs Adaptivity

‏פשטות משפרת replayability ו־RCA; adaptivity עשויה להוסיף edge רק אם נמדדת היטב.

### ‏Conservative Unknown Handling vs Throughput

‏Reconcile-before-retry עלול לעצור flow זמנית, אך מונע duplicate/excess exposure.

---

## ‏8. What I Would Avoid Initially

‏לא להתחיל עם:

```text
blind retries
multi-writer execution
continuous aggressive repricing
venue-specific optimization everywhere
many overlapping child orders
execution ML
hidden fallback semantics
fill-rate-only optimization
full L2 queue simulator as MVP requirement
silent capability downgrade
```

---

## ‏9. What to Add Later

‏לאחר Evidence:

```text
adaptive urgency
fill-probability model
queue-aware passive policy
midpoint / price-improvement challengers
route / venue experiments
impact-aware sizing/execution
better parent-child orchestration
outbox-style transport pattern
active/passive executor with fencing
learned execution policy
```

---

## ‏10. Required Data / Evidence

### ‏Intent / Attempt

```text
DecisionId
OrderIntentId
AttemptId
Purpose
InstrumentId
TargetPosition / Qty
Urgency
HardPriceBound
SignalTTL
ExecutionDeadline
ExecutionPolicyVersion
ExecutionEpoch
RiskSnapshotId
ComplianceDecisionId
```

### ‏Market Context

```text
bid / ask / sizes
spread
market generation
quote age
trade age
signal age
rank / score context
remaining edge components
```

### ‏Lifecycle

```text
intent_created_at
attempt_created_at
submit_attempted_at
ack_at
working_at
first_fill_at
last_fill_at
cancel_requested_at
cancel_confirmed_at
replace_requested_at
unknown_effect_at
reconcile_started_at
reconcile_completed_at
terminal_at
```

### ‏Outcome

```text
requested_qty
filled_qty
remaining_qty
pending_exposure
avg_fill_price
explicit_costs
slippage
markout
missed_opportunity
signal_age_at_fill
net_edge_retained
exit_intent_to_flat_ms
reconcile_count
unknown_effect_count
```

---

## ‏11. Promotion Criteria

‏Execution Challenger מתקדם רק אם:

- ‏משפר `NetEdgeRetained` OOS מול Champion.
- ‏השיפור נשאר אחרי no-fill/missed-opportunity accounting.
- ‏P95/P99 slippage/latency/tails אינם מתדרדרים מהותית.
- ‏unknown/reconciliation rate אינו עולה באופן בלתי־קביל.
- ‏ה־policy נשאר deterministic/replayable מספיק ל־RCA.
- ‏State correctness ו־risk invariants נשמרים בכל fault scenarios.

---

## ‏12. Rejection Criteria

‏נפסול או נוריד דרגה ל־Execution Policy אם:

- ‏Fill Rate עולה אך `NetEdgeRetained` יורד.
- ‏Average slippage משתפר אך tail slippage מחמיר משמעותית.
- ‏היא תלויה בהנחות fill אופטימיות.
- ‏היא מגדילה duplicate/unknown exposure.
- ‏היא דורשת silent fallback כאשר capability חסרה.
- ‏היא אינה reproducible ב־Replay.
- ‏היא מגדילה `TimeToFlat` במצבי Exit/Risk.
- ‏היא רגישה לפרמטר יחיד צר.

---

## ‏13. Metrics

### ‏Economics

```text
NetEdgeRetained
ImplementationShortfall
EffectiveSpread
RealizedSpread
PostFillMarkout
MissedOpportunity
ExecutionCostBps
```

### ‏Timing

```text
intent_to_submit
submit_to_ack
submit_to_first_fill
submit_to_final_fill
cancel_to_confirm
unknown_to_reconcile
exit_intent_to_flat
p50 / p95 / p99
```

### ‏State Correctness

```text
unknown_effect_rate
reconciliation_rate
position_mismatch_rate
orphan_order_rate
duplicate_event_rate
idempotency_violation_count
pending_exposure_mismatch_count
```

### ‏Behavior

```text
fill_rate
partial_fill_rate
no_fill_rate
cancel_rate
replace_rate
abort_rate
reprice_count
signal_age_at_fill
```

---

## ‏14. Failure Modes

### ‏Failure 1 — ACK Lost → Duplicate Submit

‏נמנע באמצעות `UNKNOWN_EFFECT + RECONCILE`.

### ‏Failure 2 — Cancel Requested → Local Order Forgotten

‏Late Fill יוצר exposure לא צפוי.

### ‏Failure 3 — Partial Fill Treated as Zero

‏Position קיימת בלי Exit/Risk ownership.

### ‏Failure 4 — Partial Fill Treated as Full Target

‏Risk ו־PnL projections שגויים.

### ‏Failure 5 — Fill Rate Optimization

‏המערכת לומדת “להתמלא” במחיר של adverse selection.

### ‏Failure 6 — Stale Intent Still Working

‏Order חוקי טכנית אך economics כבר מתו.

### ‏Failure 7 — Restart Forgets External Reality

‏Working order/fill נשאר מחוץ ל־local state.

### ‏Failure 8 — Replace Assumed Atomic

‏Old/New overlap יוצר excess pending exposure.

### ‏Failure 9 — Entry Competes With Exit

‏Scanner throughput מקבל קדימות על exposure קיים.

### ‏Failure 10 — Silent Capability Fallback

‏Order semantics משתנים בלי version/evidence.

---

## ‏15. User-Specific Application

‏עבור המחקר שלנו — Edge קצר בשניות, עם עדיפות ל־KISS ול־evidence — ה־Execution Champion צריך להיות קטן ומפורש.

‏המחקר הראשוני צריך לענות:

```text
How much predicted edge survives from decision to fill?
How much is lost to time, spread, slippage and adverse selection?
When is no-fill economically better than a bad fill?
How often do unknown/recovery states occur?
How fast can the system become flat after exit intent?
```

‏לא נתחיל מ־execution שמנסה להיות “חכם בכל מצב”.

---

## ‏16. Concrete Baseline Contract

```text
APPROVED INTENT
→ persist intent + risk reservation
→ final revalidation
→ create durable attempt
→ apply simple bounded order policy
→ invoke simulator/paper boundary
→ consume canonical async events
→ apply each authoritative fill exactly once
→ update actual + pending exposure
→ recompute remaining edge after meaningful state change
→ abort new-risk continuation if edge/state invalid
→ reconcile any unknown external effect
→ prioritize exit/flatten over new entry
→ declare terminal only when intent/position state is actually resolved
→ emit evidence packet
```

---

## ‏17. Confidence

### ‏High Confidence

- ‏Execution חייב להיות stateful, idempotent ו־recoverable.
- ‏`UNKNOWN_EFFECT` דורש reconciliation לפני retry.
- ‏Partial fills ו־pending exposure הם first-class states.
- ‏Fill quality חייבת להימדד לצד Fill probability.
- ‏Exit/Flatten מקבלים priority על Entry חדש.
- ‏Replay/Paper צריכים לשתף אותו execution semantics ככל האפשר.

### ‏Medium Confidence

- ‏Simple bounded execution policy הוא Champion נכון למחקר הראשוני.
- ‏`NetEdgeRetained` הוא metric synthesis מרכזי.
- ‏Single logical execution owner הוא baseline KISS מתאים.

### ‏Low / Unproven

- ‏Adaptive urgency superiority.
- ‏Venue/routing specialization.
- ‏Queue-aware dynamic execution.
- ‏Learned execution policy.

---

## ‏18. Time-Sensitive Facts

‏כל capability שתלויה ב־Broker/Venue/API נשארת Reference ולא invariant:

```text
supported order types
IOC/FOK semantics
replace behavior
client order-id rules
native vs simulated orders
routing capabilities
parent/child behavior
session support
rate limits
```

‏לפני שימוש תפעולי יש לאמת אותן מחדש מול מקור authoritative עדכני.

---

## ‏19. Recommendation Summary

```text
Semantic Intent
→ Permission / Reservation
→ Durable Attempt
→ Bounded Execution Policy
→ External Side Effect
→ Canonical Async State
→ Fill / Partial / No Fill / Unknown
→ Position + Pending Exposure Truth
→ Remaining Edge Recheck
→ Reconcile Uncertainty
→ Exit / Flat Priority
→ Net Edge Retained + Evidence
```

‏ה־Baseline המומלץ הוא **durable, bounded, single-owner, evidence-first execution core**. ‏Adaptive tactics, routing specialization ו־learned execution נכנסים רק כאשר הם מוסיפים ערך OOS בלי להחליש correctness, recovery או safety.