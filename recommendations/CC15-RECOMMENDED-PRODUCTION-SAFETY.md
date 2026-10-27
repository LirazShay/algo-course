# ‏Cross-Cutting 15 — Recommended Production Safety

> ‏מטרת המסמך: לסנתז את Recommendation Sheets של Safety Controls, Failure Recovery, Production State, Security/Operations, Risk, Execution, Observability, Testing, Readiness ו־Market Conduct למדיניות `Production Safety` אחת deterministic, durable, fail-safe ו־hard-to-bypass עבור `Research / Replay / Shadow / Paper` ותכנון `Production Engineering`.
>
> ‏המסמך אינו אישור `Live`, אינו מגדיר מעבר למסחר בכסף אמיתי ואינו מעניק הרשאה ליצירת חשיפה אמיתית. ‏`Production Safety` כאן פירושה שהמערכת מסוגלת להגן על Truth, State ו־Exposure מדומה/`Paper` גם כאשר המציאות אינה Happy Path.

---

## ‏1. Decision

‏`Production Safety` אצלנו אינה:

```text
one STOP button
```

‏ואינה:

```text
if healthy == false:
    shut everything down
```

‏אלא `Safety Control Plane` עצמאי לוגית שמחליט **אילו capabilities מותרות כרגע** על בסיס Evidence:

```text
Data Truth
+ Broker / Simulator Truth
+ Orders / Fills / Position Truth
+ Risk State
+ Compliance / Ownership State
+ Clock / Queue / Persistence Health
+ Build / Config / Environment Identity
            ↓
      Safety Evaluation
            ↓
      Capability Matrix
            ↓
New Risk / Cancel / Reduce / Exit / Reconcile / Resume permissions
```

‏העקרונות המחייבים:

```text
Critical UNKNOWN => no new risk

Stop / contain quickly
Resume only after evidence

Entry capability
!=
Risk-reduction capability

Connection restored
!=
Truth restored

Process alive
!=
Production ready
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Safety Authority נפרדת מה־Strategy

‏ה־Strategy יכולה ליצור `Decision` או `OrderIntent`; היא אינה רשאית להעניק לעצמה permission לבצע side effect.

‏השרשרת המומלצת:

```text
Decision
→ Risk Gate
→ Compliance / Ownership Gate
→ Safety Gate
→ Pre-effect Revalidation
→ Execution Adapter
```

‏`Rank`, ‏Score, Expected Edge או PnL אינם יכולים לעקוף Safety veto.

### ‏`P0 — Required`: ‏Capability-Based Safety, לא Boolean Health

‏נחשב לפחות:

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

‏כך failure אחד אינו מכריח semantics שגויים של `everything on` או `everything off`.

### ‏`P0 — Required`: ‏Baseline Safety Modes קטנים וברורים

```text
NORMAL
BLOCK_NEW_ENTRIES
EXIT_ONLY
RECOVERING
FULL_HALT
```

‏Commands כגון:

```text
CANCEL_PENDING_ENTRIES
CANCEL_ALL
RECOVER_RECONCILE
ARM_RESUME
```

‏הם workflows/commands — לא states חלופיים שמטשטשים lifecycle.

### ‏`P0 — Required`: ‏Fail Closed ל־New Risk כאשר Truth קריטי אינו ידוע

‏New exposure נחסם כאשר קיים לפחות אחד מ־:

```text
UNKNOWN_ORDER_EFFECT
POSITION_MISMATCH
OPEN_ORDER_MISMATCH
BROKER_UNSYNCED
UNTRUSTED_WHOLE_MARKET_STATE
CRITICAL_DATA_STALENESS
EXECUTION_OWNERSHIP_UNKNOWN
PERSISTENCE_CRITICAL_FAILURE
CLOCK_UNHEALTHY
ENVIRONMENT_MISMATCH
CONFIG_IDENTITY_MISMATCH
CRITICAL_INVARIANT_VIOLATION
```

‏`UNKNOWN` אינו `false`, אינו `0`, ואינו permission.

### ‏`P0 — Required`: ‏Preserve Risk-Reducing Capability כאשר זה בטוח

‏Safety אינה מסווגת פעולה לפי `Buy/Sell`, אלא לפי resulting exposure.

```text
Current Exposure
+ Working / Pending Exposure
+ Unknown Effect Allowance
+ Proposed Action
→ Expected Resulting Exposure
```

‏כאשר Entry חסום, פעולת reconciliation או פעולה שמקטינה exposure יכולה להישאר מותרת אם state מספיק ידוע כדי לבצע אותה בלי ליצור duplicate/reversal.

### ‏`P0 — Required`: ‏Position-First Priority

‏כאשר קיימת חשיפה או אי־ודאות לגביה:

```text
Position / Exposure Truth
> Working Orders
> Reconciliation
> Exit / Risk Reduction
> New Entry Decisions
> Scanner Enrichment
> Research / Diagnostics
```

‏Signal אפשר לזרוק. ‏Exposure קיימת אינה disposable.

### ‏`P0 — Required`: ‏Pending Exposure הוא Exposure

‏Safety/Risk אינם מסתכלים רק על confirmed position.

```text
EffectiveExposure
=
ConfirmedExposure
+ WorkingRiskIncreasingExposure
+ CancelPendingExposure
+ UnknownEffectHeadroom
```

‏כאשר unknown effect אינו ניתן לכימות אמין, New Risk נחסם.

### ‏`P0 — Required`: ‏`UNKNOWN_EFFECT → RECONCILE`, ללא Blind Retry

‏Timeout, disconnect או ACK חסר אינם מוכיחים שהפעולה לא התרחשה.

```text
External command attempted
→ effect uncertain
→ UNKNOWN_EFFECT
→ block duplicate risk
→ query external truth
→ reconcile
→ resolve state
→ only then decide next action
```

### ‏`P0 — Required`: ‏Durable Intent לפני External Effect

‏לפני side effect משמעותי נשמר durable record עם stable identity:

```text
IntentId
AttemptId
DecisionId
Environment
AccountScope
Purpose
RequestedEffect
SafetyEpoch
PolicyVersions
CreatedAt
```

‏אם אי־אפשר לשמור את evidence/intent שנדרש ל־recovery, New side effects נחסמים.

### ‏`P0 — Required`: ‏Single Execution Owner + Fencing

‏לכל execution scope יש authority יחידה.

```text
one active writer
+
execution epoch / generation
+
startup ownership validation
```

‏Intent מדור ישן אינו מקבל authority ליצור New Risk לאחר ownership/safety generation change.

### ‏`P0 — Required`: ‏Safety Epoch מבטל Intents ישנים

‏כל שינוי Safety משמעותי מעלה:

```text
SafetyEpoch++
```

‏Intent risk-increasing מחזיק:

```text
SafetyEpochAtCreation
```

‏לפני submit:

```text
SafetyEpochAtCreation == CurrentSafetyEpoch
```

‏Mismatch אינו מתוקן בשקט; ה־Intent נפסל ונדרשת החלטה חדשה.

### ‏`P0 — Required`: ‏Durable Critical Latches

‏Critical safety causes אינם נעלמים רק משום שמדד חזר להיות ירוק.

‏Baseline latched conditions:

```text
UNKNOWN_ORDER_EFFECT
POSITION_MISMATCH
OPEN_ORDER_MISMATCH
DUPLICATE_EXECUTOR
STATE_CORRUPTION
ENVIRONMENT_MISMATCH
CRITICAL_INVARIANT_VIOLATION
```

‏המסלול:

```text
trip
→ contain
→ persist latch
→ reconcile / validate
→ explicit eligible clear
→ arm
→ resume
```

‏Restart אינו מנקה latch.

### ‏`P0 — Required`: ‏Startup מתחיל חסום

‏Startup בטוח:

```text
STARTING
→ BLOCK_NEW_ENTRIES
→ validate build/config/environment
→ restore durable state
→ reconcile orders/fills/positions
→ restore data subscriptions
→ warm required features/state
→ validate clock/storage/ownership
→ readiness proof
→ explicit ARM
→ NORMAL
```

‏`process started` אינו `ready`.

### ‏`P0 — Required`: ‏Reconciliation לפני Resume

‏לאחר restart/reconnect/deployment/unknown effect/manual external action:

```text
Fetch authoritative external state
→ orders
→ executions / fills
→ positions
→ account / exposure state
→ match stable IDs
→ rebuild local projections
→ validate invariants
→ only then restore capabilities
```

### ‏`P0 — Required`: ‏Resume הוא Operation Risk-Increasing

‏`Resume` אינו side effect של “הכול שוב ירוק”.

‏`CanResume` דורש Evidence טרי לפחות על:

```text
market_data_ready
whole_market_trust_ready
broker/simulator_ready
reconciliation_clean
no_unknown_orders
positions_verified
working_orders_verified
risk_state_valid
compliance/ownership_valid
clock_healthy
critical_persistence_healthy
required_feature_warmup_complete
correct_build
correct_config
correct_environment
correct_account/simulator scope
no_blocking_latch
```

‏ואז:

```text
RECOVERY_VALIDATED
→ clear eligible latches
→ ARM_RESUME
→ NORMAL
```

### ‏`P0 — Required`: ‏Environment Isolation היא Hard Boundary

```text
REPLAY  → no external broker side effects
SHADOW  → no external broker side effects
PAPER   → isolated Paper adapter/environment only
```

‏Environment identity אינה Label ל־UI אלא input ל־Safety Gate.

‏Ambiguous environment:

```text
BLOCK external side effects
```

### ‏`P0 — Required`: ‏Build / Config Identity היא חלק מ־Safety

‏כל run משמעותי מקושר ל־:

```text
CommitSha
BuildId
ArtifactHash
StrategyVersion
ResolvedConfigHash
DataContractVersion
RiskPolicyVersion
SafetyPolicyVersion
CompliancePolicyVersion
ExecutionPolicyVersion
AdapterVersion
Environment
```

‏Missing/invalid dangerous config אינו מקבל permissive default.

### ‏`P0 — Required`: ‏Deployment מתחיל Side Effects Disabled

‏Production-engineering flow:

```text
build immutable artifact
→ verify
→ deploy disabled
→ restore / reconcile
→ run readiness checks
→ optional Shadow smoke
→ explicit bounded enablement for the allowed non-live environment
```

‏ה־artifact שנבדק הוא ה־artifact שמריצים; שינוי config מהותי מקבל identity חדשה.

### ‏`P0 — Required`: ‏Truth Persistence קודמת ל־Best-Effort Telemetry

‏כשל ב־dashboard/exporter אינו שווה בהכרח Safety trip.

‏כשל ב־:

```text
Order / Fill / Position truth
Durable Intent
Critical State Journal
Safety Latch Persistence
```

‏כן יכול לחסום New Risk, משום ש־recoverability נפגעה.

### ‏`P0 — Required`: ‏Compliance / Conduct הוא Gate עצמאי

‏Production Safety כולל prevention של:

```text
DUPLICATE_INTENT
UNKNOWN_ORDER_OWNERSHIP
RELATED_CONFLICTING_INTENT
ENVIRONMENT_MISMATCH
RECOVERY_IN_PROGRESS
MANUAL_ACTIVITY_CONFLICT
```

‏ה־output יכול להיות:

```text
ALLOW
BLOCK
REVIEW_REQUIRED
EXIT_ONLY
```

‏Positive strategy evidence אינו מקזז Compliance veto.

### ‏`P0 — Required`: ‏Manual Actions הן State-Changing Events

‏Operator action נשמר עם:

```text
CommandId
Actor
Action
Scope
RequestedAt
Reason
PreviousState
Result
CorrelationId
```

‏פעולה ידנית שמשנה external truth גוררת reconciliation לפני Resume.

### ‏`P0 — Required`: ‏Emergency / Kill Path אינו תלוי ב־Scanner

‏Safety Control Plane לא צריך להיות תלוי באותו hot path שעלול להיות תקוע.

‏Baseline KISS:

```text
few dependencies
few modes
few strong invariants
durable safety state
execution-boundary enforcement
```

‏Watchdog או process separation נוספים הם Challengers לאחר Evidence.

---

## ‏3. Why

### ‏Fact

‏מערכת event-driven עם side effects חיצוניים יכולה להישאר עם state לא ידוע לאחר timeout, disconnect, restart או callback race.

### ‏Fact

‏Working/cancel-pending orders יכולים לשנות Position גם לאחר שה־Strategy הפסיקה לרצות את הפעולה.

### ‏Fact

‏Reconnect או process restart אינם מוכיחים ש־external truth ו־local state שוב מסונכרנים.

### ‏Judgment

‏למערכת short-horizon שלנו, reliability של truth/recovery חשובה יותר מהמשך generation של Candidates בזמן degradation.

### ‏Judgment

‏מספר קטן של hard invariants ו־capability states עדיף כ־baseline על expert system גדול של מאות safety heuristics.

### ‏Hypothesis

‏Scoped degradation ו־capability restore הדרגתי יקטינו blast radius ו־downtime לעומת global stop/resume בינארי. את הערך נמדוד ב־fault/recovery evidence.

---

## ‏4. Use When

‏המדיניות חלה על:

- ‏Startup, restart ו־deployment.
- ‏Provider/Broker/Simulator reconnect.
- ‏Partial/stale whole-market state.
- ‏`UNKNOWN_EFFECT`.
- ‏Partial fill / cancel-fill race.
- ‏Position או Order mismatch.
- ‏Persistence failure.
- ‏Clock/queue/backpressure degradation.
- ‏Split-brain / duplicate execution ownership suspicion.
- ‏Config/environment mismatch.
- ‏Manual external changes.
- ‏Recovery ו־Resume.
- ‏Fault injection ו־Production Engineering acceptance.

---

## ‏5. Do Not Use When

‏Safety אינה:

- ‏תחליף ל־Strategy validation.
- ‏תחליף ל־Risk sizing.
- ‏תחליף ל־Execution Policy.
- ‏תחליף ל־Reconciliation.
- ‏דרך להפוך כל losing outcome ל־Kill event.
- ‏PnL optimizer.
- ‏Excuse להוסיף Rule לכל incident בלי RCA.
- ‏דרך להכריז `Production Engineering Ready` בלי Evidence.

---

## ‏6. Safety Capability Matrix

| Mode | New Risk | Increase Exposure | Cancel | Reduce / Exit | Reconcile | Resume |
|---|---:|---:|---:|---:|---:|---:|
| `NORMAL` | כן | כן | כן | כן | כן | לא רלוונטי |
| `BLOCK_NEW_ENTRIES` | לא | לא | כן | כן לפי Evidence | כן | רק אחרי validation |
| `EXIT_ONLY` | לא | לא | כן | כן לפי Evidence | כן | רק אחרי validation |
| `RECOVERING` | לא | לא | לפי Evidence | לפי Evidence | כן | לא עד `RECOVERY_VALIDATED` |
| `FULL_HALT` | לא | לא | רק דרך safe emergency path | רק דרך safe emergency path | כן/ידני | לא |

‏הטבלה מגדירה capabilities ולא Order Types. גם פעולה risk-reducing אינה מותרת כאשר execution truth אינו מספיק ידוע כדי לבצע אותה בלי duplicate או reversal.

---

## ‏7. Trigger Classes

### ‏Truth / Reconciliation

```text
UNKNOWN_ORDER_EFFECT
POSITION_MISMATCH
OPEN_ORDER_MISMATCH
ORPHAN_EXTERNAL_ORDER
DUPLICATE_EXECUTION_EVENT
```

### ‏Data / Decision Trust

```text
DATA_STALE
DATA_COVERAGE_LOW
SEQUENCE_INTEGRITY_FAILED
FEATURE_WARMUP_INCOMPLETE
RANK_TRUST_NOT_READY
```

### ‏Execution / Ownership

```text
DUPLICATE_EXECUTOR
STALE_EXECUTION_EPOCH
QUEUE_STALE
STALE_INTENT
```

### ‏Infrastructure / Identity

```text
PERSISTENCE_UNAVAILABLE
CLOCK_UNHEALTHY
CONFIG_MISMATCH
ENVIRONMENT_MISMATCH
BUILD_IDENTITY_UNKNOWN
```

### ‏Risk / Compliance

```text
RISK_LIMIT
PENDING_EXPOSURE_LIMIT
COMPLIANCE_BLOCK
MANUAL_ACTIVITY_CONFLICT
```

‏כל Trigger מקבל:

```text
RuleId
Scope
TripCondition
TripMode
Latched?
RecoveryCondition
ManualClearRequired?
PolicyVersion
Rationale
```

---

## ‏8. Scope and Blast Radius

‏Trigger יקבל scope מפורש:

```text
GLOBAL
ACCOUNT_OR_SIM_SCOPE
STRATEGY
SYMBOL
DATA_PROVIDER
EXECUTION_ADAPTER
```

‏ברירת המחדל היא scope מינימלי שמספיק לשמירת safety.

‏אבל כאשר truth משותף לכל ה־cross-section אינו אמין, אין לצמצם scope באופן מלאכותי רק כדי לשמור availability.

---

## ‏9. Recovery Contract

‏Recovery אינו Retry Loop.

```text
Detect
→ Contain
→ Reconcile
→ Rebuild
→ Validate
→ Explicit Resume
```

‏כל Recovery שומר:

```text
RecoveryId
IncidentId
Reason
Phase
PhaseStartedAt
AttemptCount
KnownExposure
KnownOrders
UnknownOrders
BlockerCodes
NextSafeAction
```

‏Retry budget הוא bounded; repeated failure מתקדם ל־degraded/manual-required state במקום loop אינסופי.

---

## ‏10. Deployment / Rollback Safety

‏Deployment ו־Rollback הם state migrations, לא copy-and-restart.

‏לפני activation נבדקים:

```text
artifact identity
config compatibility
schema compatibility
state compatibility
journal readability
reconciliation capability
environment identity
```

‏Rollback אינו נטען בכוח על persisted state שאינו compatible.

‏כאשר compatibility אינה מוכחת:

```text
BLOCK_NEW_ENTRIES
→ recovery / migration review
```

---

## ‏11. Observability Requirements

‏Safety state חייב להיות visible ו־auditable.

‏לפחות:

```text
CurrentSafetyMode
AllowedCapabilities
PrimaryReason
SecondaryReasons
LatchedReasons
SafetyEpoch
ConfirmedExposure
WorkingExposure
CancelPendingExposure
UnknownExposure
DataHealth
ExecutionHealth
PersistenceHealth
RecoveryPhase
ResumeBlockers
TimeSinceTrigger
PolicyVersions
```

‏Safety Alert אינו enforcement. ‏Containment חייב לעבוד גם אם alert exporter נכשל.

---

## ‏12. Testing / Acceptance Contract

‏Production Safety אינה `ready` בלי Golden/Fault coverage לפחות ל־:

```text
stale whole-market state during candidate selection
unknown effect after submit timeout
partial fill during safety trip
cancel/fill race
restart while EXIT_ONLY
position mismatch
orphan external order
duplicate executor attempt
old queued intent after SafetyEpoch change
resume before reconciliation
broker/simulator ready but feature warm-up incomplete
critical persistence failure
clock anomaly
queue backlog / stale intent
manual external action followed by reconciliation
wrong environment/config identity
rollback with incompatible persisted state
```

‏כל incident/near-miss משמעותי:

```text
Incident
→ RCA
→ Minimal Reproducer
→ Golden / Regression Scenario
→ Similar-Area Search
```

---

## ‏13. Alternatives

### ‏Alternative A — Global `STOP/RUN`

‏פשוט, אבל אינו מבחין בין Entry, Exit, Cancel ו־Reconcile ועלול לחסום גם risk-reduction path.

### ‏Alternative B — Strategy-Owned Safety

‏פחות plumbing, אבל Strategy יכולה לעקוף או לשנות rules שמטרתם להגביל אותה.

### ‏Alternative C — Broker/Platform Native Controls בלבד

‏שימושיים כ־defense-in-depth כאשר capability מאומתת, אך אינם מחליפים internal ownership, reconciliation, state durability ו־environment isolation.

### ‏Alternative D — Complex Distributed Safety Platform

‏יכול להיות מוצדק ב־multi-instance architecture גדולה; אינו Baseline למערכת אישית לפני bottleneck/failure-domain מוכח.

---

## ‏14. Trade-offs

| Choice | יתרון | מחיר |
|---|---|---|
| ‏Fail closed ל־New Risk | ‏מונע פעולה על Truth לא ידוע | ‏יותר `NO_TRADE`/downtime בזמן uncertainty |
| ‏Durable latches | ‏Restart אינו עוקף incident | ‏Recovery/Resume איטיים יותר |
| ‏Capability-based degradation | ‏Blast radius קטן יותר | ‏State machine עשיר יותר |
| ‏Single execution owner | ‏פחות duplicate/split-brain risk | ‏פחות HA אוטומטי |
| ‏Explicit arm/resume | ‏מונע silent restart | ‏עוד שלב תפעולי |
| ‏Environment isolation | ‏מקטין side-effect mistakes | ‏יותר config/credential separation |

---

## ‏15. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏מאות Safety rules.
- ‏PnL-only Kill Switch.
- ‏Auto-Resume ברגע שמדד חוזר לירוק.
- ‏`retry-all`.
- ‏`CANCEL_ALL` כאילו request שווה confirmation.
- ‏`FLATTEN` שמסתמך רק על local quantity.
- ‏Manual override שמבטל את כל hard gates.
- ‏Anomaly/ML safety שמחליף deterministic invariants.
- ‏Multi-instance active execution ללא צורך מוכח.
- ‏Distributed consensus/control plane מורכב מוקדם.
- ‏Safety state בזיכרון בלבד.
- ‏Environment selection כ־UI dropdown בלבד.

---

## ‏16. What to Add Later

### ‏`P2`

- ‏Scoped watchdog/control path עצמאי יותר.
- ‏Automated incident packet generation.
- ‏Shadow calibration של latency/execution degradation rules.
- ‏Scoped temporary overrides עם expiry/audit.
- ‏Policy comparison ב־Replay.
- ‏Richer deployment/rollback compatibility checks.

### ‏`P3`

- ‏Compound health rules לאחר Evidence.
- ‏Provider/Broker-specific defensive controls לאחר Current Verification.
- ‏Stronger process isolation של Execution authority אם fault evidence מצדיק.
- ‏Advanced anomaly detection כ־advisory layer.

### ‏`P4`

- ‏Distributed fencing/control architecture רק אם scale/HA requirements מצדיקים זאת.

---

## ‏17. Required Data / Evidence

‏כדי להצדיק Safety thresholds ו־degradation rules נדרשים:

```text
freshness / coverage distributions
queue age distributions
processing latency tails
ack/fill/cancel timing distributions
unknown-effect frequency
position/order mismatch incidents
recovery and near-miss corpus
persistence failures
clock anomalies
fault-injection timings
false-trip-like events
missed hazards
signal/decision TTL evidence
```

‏Hard correctness invariants אינם צריכים PnL justification.

---

## ‏18. Promotion Criteria

‏Safety rule או capability-control חדש מקודם ל־Baseline רק אם:

1. ‏ה־hazard מוגדר במפורש.
2. ‏ה־input observable ומוגדר סמנטית.
3. ‏Trip behavior deterministic.
4. ‏Scope ו־blast radius מוסברים.
5. ‏Latching/recovery semantics מפורשים.
6. ‏ה־rule אינו חוסם risk reduction שלא לצורך.
7. ‏עבר Unit/Property/State-transition tests.
8. ‏עבר Mini Replay / Golden scenario.
9. ‏עבר Fault Injection רלוונטי.
10. ‏False trips ומissed hazards נמדדו כאשר מדובר ב־threshold אמפירי.
11. ‏Policy versioned/audited.
12. ‏Resume path אינו יכול לעקוף failed gate.
13. ‏Critical state שורד restart.
14. ‏Observability ו־RCA evidence מספיקים להסביר כל trip.

---

## ‏19. Rejection Criteria

‏Design/Rule נדחה אם:

- ‏`UNKNOWN` מתפרש כ־Safe.
- ‏Strategy יכולה לעקוף Safety.
- ‏Restart מנקה Critical state.
- ‏Reconnect גורם Auto-Resume בלי reconciliation.
- ‏Blind retry יכול להכפיל side effect.
- ‏Cancel request נחשב terminal.
- ‏Pending exposure אינו נספר.
- ‏External truth מוחלף ב־local assumption.
- ‏Manual override יכול לעקוף Hard Invariant.
- ‏Rule תלוי במספר קסם ללא Evidence.
- ‏Rule אינו replayable/testable.
- ‏Telemetry failure מפיל critical truth path, או להפך — Truth failure נראה רק כ־dashboard warning.
- ‏Complexity גדולה מה־hazard שהיא פותרת.

---

## ‏20. Metrics

### ‏Safety Correctness

```text
risk_increase_after_critical_trip
stale_intent_effect_after_epoch_change
resume_without_reconciliation
critical_latch_lost_after_restart
duplicate_owner_side_effect
unresolved_truth_used_for_permission
```

‏ל־Hard Invariants היעד הוא `0 violations`; אין error budget שמכשיר duplicate exposure או bypass של Safety.

### ‏Containment / Recovery

```text
detection_latency
containment_latency
unknown_state_duration
cancel_pending_duration
reconciliation_duration
recovery_duration
resume_denial_count
stuck_recovery_count
```

### ‏Operational Safety

```text
trip_count_by_reason
mode_duration_by_state
blocked_entry_count
invalidated_stale_intent_count
active_latch_count
manual_safety_command_count
persistence_health_failures
ownership_conflict_count
```

### ‏Quality of Safety Rules

```text
would_block_count_in_shadow
false_trip_like_rate
missed_hazard_count
rule_flap_count
incident_recurrence_rate
```

---

## ‏21. Failure Modes

### ‏`S15-01 — GREEN_WHILE_UNKNOWN`

‏מערכת נראית ready בזמן external financial state לא ידוע.

### ‏`S15-02 — AUTO_RESUME_AFTER_RECONNECT`

‏Socket חזר ולכן capability הוחזרה ללא reconciliation.

### ‏`S15-03 — STALE_INTENT_ESCAPE`

‏Intent שנוצר לפני Safety trip מגיע ל־adapter אחרי trip.

### ‏`S15-04 — RESTART_CLEARS_LATCH`

‏Process restart הופך incident ל־NORMAL.

### ‏`S15-05 — BLIND_RETRY_DUPLICATE_EFFECT`

‏Timeout מתורגם ל־retry במקום `UNKNOWN_EFFECT`.

### ‏`S15-06 — CANCEL_IS_ASSUMED_FINAL`

‏Late fill לאחר cancel request יוצר unmanaged position.

### ‏`S15-07 — POSITION_NOT_FIRST`

‏Scanner חוזר לפעילות לפני ש־existing exposure נפתרה.

### ‏`S15-08 — DUPLICATE_EXECUTOR`

‏שני writers מקבלים authority לאותו execution scope.

### ‏`S15-09 — WRONG_ENVIRONMENT`

‏Process/Config/Adapter identity אינם תואמים environment המוצהר.

### ‏`S15-10 — TRUTH_PERSISTENCE_LOSS`

‏המערכת ממשיכה ליצור side effects בלי יכולת durable recovery.

### ‏`S15-11 — SAFETY_RULE_EXPLOSION`

‏מאות rules מסתירים cause ומגדילים flapping/complexity.

### ‏`S15-12 — SAFETY_BLOCKS_RECOVERY`

‏Global stop חוסם גם reconciliation/risk-reducing path הדרוש לתיקון.

---

## ‏22. User-Specific Application

‏למערכת whole-market short-horizon שלנו, ארבעה seams מקבלים עדיפות:

```text
1. Whole-market rank trust
2. Signal / Intent age
3. External order / position uncertainty
4. Position-first recovery
```

‏Baseline מותאם:

```text
Start blocked
→ verify immutable build/config/environment
→ restore durable safety state
→ reconcile execution truth
→ rebuild/warm whole-market state
→ validate coverage/freshness/clock/persistence
→ verify execution ownership
→ explicit arm
→ allow Paper-side new-risk capability only when all required gates pass
```

‏בכל critical incident:

```text
Block new risk first
→ invalidate stale queued intents
→ preserve callbacks + truth capture
→ resolve working / unknown effects
→ manage known exposure when safely possible
→ reconcile
→ rebuild data / feature state
→ validate readiness
→ resume explicitly
```

‏לא ננסה “להציל” short-lived candidate דרך outage. Candidate ישן נזרק; Truth ו־Exposure קודמים לו.

---

## ‏23. Readiness Integration

‏`Production Safety` אינה מקבלת ציון ממוצע.

‏ל־`Production Engineering Ready` נדרוש לפחות:

```text
SafetyGate            = PASS
RecoveryGate          = PASS
ExecutionTruthGate    = PASS
PersistenceGate       = PASS
EnvironmentGate       = PASS
OwnershipGate         = PASS
ObservabilityGate     = PASS
FaultAcceptanceGate   = PASS
CriticalUnknowns      = NONE for evaluated scope
```

‏`P0 FAIL` או `P0 UNKNOWN` חוסמים את ה־promotion הרלוונטי גם אם שאר המערכת ירוקה.

---

## ‏24. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Timeout של command חיצוני אינו הוכחה שה־effect לא קרה.
- ‏Working orders ו־late fills יכולים לשנות exposure לאחר decision המקורי.
- ‏Restart/reconnect אינם כשלעצמם הוכחת reconciliation.
- ‏Safety state שאינו durable יכול להיעלם בדיוק בזמן recovery.

### ‏Judgment

- ‏Independent Safety Authority.
- ‏Few strong invariants לפני heuristic rules.
- ‏`BLOCK_NEW_ENTRIES` כברירת startup/recovery.
- ‏Single execution owner ב־baseline.
- ‏Explicit arm/resume.
- ‏Capability-based degradation במקום `RUN/STOP` בינארי.

### ‏Hypothesis

- ‏איזה latency/coverage degradation צריך לעבור מ־Monitoring ל־enforced trip.
- ‏איזה scoped degradation נותן יחס availability/safety הטוב ביותר.
- ‏מתי watchdog/process isolation נוסף מצדיק את המורכבות.

---

## ‏25. Confidence

### ‏High

- ‏Fail closed ל־New Risk על critical unknown.
- ‏`UNKNOWN_EFFECT → RECONCILE`.
- ‏Position-first recovery.
- ‏Durable latches.
- ‏SafetyEpoch / stale-intent invalidation.
- ‏Environment/build/config identity gates.
- ‏Single-owner execution baseline.
- ‏Resume לאחר reconciliation בלבד.

### ‏Medium

- ‏ה־degradation ladder המדויק לכל failure class.
- ‏ה־scope האופטימלי של כל trip.
- ‏איזה controls כדאי להפריד ל־watchdog/process עצמאי.

### ‏Evidence Required

- ‏Numeric latency/coverage/reject/slippage thresholds.
- ‏Advanced anomaly-based containment.
- ‏Multi-instance distributed safety architecture.

---

## ‏26. Time-Sensitive Facts

‏המסמך אינו מקבע capabilities, limits, endpoints או native protections של Broker/Data Provider מסוים.

‏לפני שימוש עתידי ב־provider/broker-specific control יש לאמת מחדש ממקור רשמי:

```text
API/session semantics
cancel semantics
native safety / kill capability
server-side protection behavior
account/environment identifiers
authentication/authorization model
rate/connection limits
data retention / audit constraints
```

‏שינוי capability חיצוני אינו משנה את העקרונות הפנימיים של ownership, reconciliation, durability ו־fail-closed behavior.

---

## ‏27. Relationship to Other Cross-Cutting Packs

- ‏`CC03` — Data trust/freshness/coverage מספקים inputs ל־Safety.
- ‏`CC06–CC09` — Entry/Order/Execution חייבים לכבד Safety permission בכל side effect.
- ‏`CC10` — Risk מגדיר exposure constraints; Safety מגדירה certainty/capability constraints.
- ‏`CC12` — Replay משחזר trips, recovery ו־first divergence.
- ‏`CC13` — Testing מוכיח invariants, fault behavior ו־restart safety.
- ‏`CC14` — Observability מספקת detection/evidence; אינה enforcement.
- ‏`85A` — Compliance הוא veto עצמאי שאינו ניתן לקיזוז על ידי Strategy score.

---

## ‏28. Recommendation Summary

‏ה־Baseline:

```text
Independent Safety Control Plane
→ Explicit Capability Matrix
→ Few Strong Invariants
→ Fail Closed for New Risk on Critical Unknown
→ Preserve Safe Risk-Reduction / Reconciliation Paths
→ Position-First Priority
→ Count Pending + Unknown Exposure
→ Durable Intent + Durable Latches
→ Single Execution Owner + Epoch/Fencing
→ SafetyEpoch invalidates stale intents
→ Reconcile before trust
→ Startup blocked
→ Explicit Arm / Resume
→ Strong Environment + Build + Config Identity
→ Compliance / Ownership Gate
→ Fault-tested Recovery
→ Auditable Operator Actions
```

‏המשפט המנחה:

> ‏Production Safety טובה אינה מנסה לגרום למערכת “להמשיך בכל מחיר”. היא גורמת למערכת לדעת **מתי אסור ליצור סיכון חדש, מה עדיין בטוח לעשות, ומה Evidence חייב לחזור לפני שמחזירים capability**.