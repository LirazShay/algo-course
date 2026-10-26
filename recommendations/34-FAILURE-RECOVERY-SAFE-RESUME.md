# ‏34 — Recommendation Sheet: Failure Recovery / Safe Resume

> ‏מקור לימודי עיקרי: `../34-FAILURE-RECOVERY-AND-SAFE-RESUME.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ארכיטקטוני והתנהגותי להתאוששות מתקלות כך שהמערכת לא תחזור לפעילות בגלל ש־process או socket חזרו, אלא רק לאחר שהשיגה מחדש Evidence מספיק לגבי Orders, Fills, Positions, Market Data, Risk ו־State מקומי.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏Recovery אינו Restart ואינו Retry Loop.

‏ה־Baseline המחייב הוא:

```text
Detect
→ Contain
→ Reconcile
→ Rebuild
→ Validate
→ Explicit Resume
```

‏כאשר קיימת Exposure או קיים ספק לגביה, סדר העדיפויות משתנה ל־`Position-first recovery`:

```text
Know exposure
→ Protect/reduce exposure when safely possible
→ Resolve unknown orders
→ Reconcile broker truth
→ Restore market truth
→ Rebuild scanner state
→ Allow new entries last
```

‏העיקרון המרכזי:

```text
Connection restored != Recovery complete
Process running != State known
Timeout != Failure
Timeout != Success
UNKNOWN != permission to retry
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Recovery הוא State Machine משלו

‏Recovery lifecycle:

```text
RECOVERY_DETECTED
→ CONTAINING
→ RECONCILING
→ REBUILDING
→ VALIDATING
→ READY_TO_RESUME
```

‏ובמקרה של חסימה:

```text
RECOVERY_BLOCKED
```

‏כל phase חייב להחזיק:

```text
recovery_id
incident_id
reason
started_at
phase_started_at
attempt
previous_system_state
previous_trade_state
known_exposure
known_orders
unknown_orders
blockers
next_action
```

---

### ‏`P0 — Required`: Containment לפני Repair

‏בכל failure שמערער state פיננסי או execution truth:

```text
CanEnter = false
CanIncreaseRisk = false
```

‏Risk-reducing capabilities יכולות להישאר זמינות רק אם state מספיק ידוע כדי לבצע אותן בבטחה.

‏אין ניסיון “להמשיך כרגיל בזמן שאנחנו מתקנים”.

---

### ‏`P0 — Required`: Broker reconciliation לפני כל Entry חדש

‏אחרי `process restart`, ‏`broker reconnect`, ‏`unknown order effect`, ‏position/order mismatch או recovery פיננסי אחר:

```text
Fetch authoritative orders
→ Fetch executions/fills
→ Fetch positions
→ Fetch account/exposure state
→ Match stable identifiers
→ Rebuild local lifecycle
→ Validate invariants
```

‏רק אז Entry יכול לחזור להיות capability אפשרית.

---

### ‏`P0 — Required`: Timeout מייצר `UNKNOWN_EFFECT`

‏אם Command חיצוני הסתיים ב־timeout:

```text
PlaceOrder timeout
CancelOrder timeout
ModifyOrder timeout
```

‏ה־state אינו `FAILED` ואינו `SUCCEEDED`.

‏הוא:

```text
UNKNOWN_EFFECT
```

‏הפעולה הבאה היא Query/Reconciliation, לא blind retry.

---

### ‏`P0 — Required`: Retry Taxonomy

‏כל operation מסווג מראש:

```text
SAFE_TO_RETRY
RETRY_WITH_IDEMPOTENCY
RECONCILE_BEFORE_RETRY
NEVER_AUTO_RETRY
```

‏Queries הן לרוב candidates טובים יותר ל־retry.

‏Commands שמשנים state חיצוני דורשים idempotency/correlation/reconciliation.

---

### ‏`P0 — Required`: Stable identifiers ו־idempotency

‏נשמור לפחות:

```text
intent_id
command_id
client_order_id
broker_order_id when known
execution_id / fill_id when available
trade_workflow_id
recovery_id
incident_id
```

‏אותו Intent לא אמור ליצור unintentionally duplicate exposure גם תחת crash/retry/restart.

---

### ‏`P0 — Required`: Fill Ledger idempotent

‏Duplicate fill callback אינו רשאי להכפיל Position.

‏Late/out-of-order events אינם אמורים לגרום state regression שקט.

‏`cancel requested != cancelled`.

---

### ‏`P0 — Required`: Position-first Recovery

‏אם קיימת Position או שהכמות אינה ודאית:

```text
broker position truth
→ exact quantity
→ working exits / protection
→ unknown order resolution
→ exit capability
→ market-data readiness
→ scanner readiness
```

‏Scanner חדש לעולם אינו קודם ל־Exposure קיים.

---

### ‏`P0 — Required`: Safe Resume Contract

‏Resume מותר רק כאשר כל required capabilities מסומנות `VERIFIED` עם Evidence טרי.

‏Baseline:

```text
Broker:
  connected
  reconciled
  no unresolved unknown orders
  positions verified
  account verified

Market Data:
  connected
  freshness valid
  fresh coverage valid
  sequence integrity acceptable
  required subscriptions restored

Feature/Scanner:
  required windows warmed
  universe completeness acceptable
  ranking context valid

Risk:
  exposure known
  pending exposure known
  limits restored
  loss/session state restored
  safety state restored

System:
  clock healthy
  environment/account fingerprint valid
  versions known
  durable state readable
  critical invariants pass
```

---

### ‏`P0 — Required`: Resume הוא Event מפורש

‏המערכת אינה “מחליקה” ל־`READY` רק מפני שכל checks הפכו ירוקים.

‏נדרש Event מפורש:

```text
RECOVERY_VALIDATED
```

‏ואחריו Transition audit.

---

### ‏`P1 — Baseline`: Staged Capability Restore

‏Recovery אינו חייב להיות `OFF → ON`.

‏אפשר:

```text
RECOVERING
→ EXIT_ONLY
→ READY_NO_ENTRY
→ READY
```

‏או ישירות ל־`READY` כאשר אין Exposure, אין Unknowns וכל ה־gates עברו.

---

### ‏`P1 — Baseline`: Knowledge State

‏Facts תפעוליים חשובים מסווגים:

```text
KNOWN
INFERRED
UNKNOWN
```

‏ולכל Fact נשמר Evidence timestamp:

```text
orders_verified_at
positions_verified_at
market_data_verified_at
risk_verified_at
clock_verified_at
```

‏Fact שהיה `KNOWN` יכול להפוך stale.

---

### ‏`P1 — Baseline`: Desired vs Observed State

‏במקומות כמו subscriptions/orders/capabilities נשמור:

```text
Desired State
Observed State
Diff
Reconciliation Action
```

‏כך Recovery אינו תלוי בזיכרון implicit של adapters.

---

### ‏`P1 — Baseline`: Market Data Recovery כולל Universe integrity

‏חזרת WebSocket אינה מספיקה.

‏נדרש:

```text
restore subscriptions
→ detect gaps
→ validate fresh coverage
→ rebuild/warm features
→ validate cross-sectional ranking context
```

‏ל־Whole-Market Scanner, partial-universe recovery אינו full recovery.

---

### ‏`P1 — Baseline`: Never resurrect stale Entry Intent

‏Intent שנוצר לפני outage/restart אינו “מחכה לתורו”.

‏לאחר recovery:

```text
old signal
→ expire or revalidate
→ new decision evidence required
```

‏Entry intent disposable; Exposure existing is not.

---

### ‏`P1 — Baseline`: Durable local evidence

‏נשמור durably לפחות:

```text
intent
command attempts
order mappings
broker events
fills
position transitions
state transitions
recovery transitions
operator actions
versions
```

‏Broker truth יכול לשחזר execution state, אך אינו יכול לשחזר למה החלטנו לפעול.

---

### ‏`P1 — Baseline`: Append-only journal + snapshots

‏Baseline פשוט:

```text
append-only decision/broker/recovery journal
+
periodic durable snapshots
```

‏Snapshot כולל:

```text
schema_version
code_version
state_version
created_at
last_event_sequence
checksum
```

‏אין חובה ל־full Event Sourcing.

---

### ‏`P1 — Baseline`: Environment/Account Fingerprint

‏Recovery חייב לאמת שהוא מחובר לסביבה הנכונה.

```text
environment
account_id_hash
broker_endpoint
strategy_version
config_version
recovery_policy_version
```

‏Mismatch קריטי נכשל סגור.

---

### ‏`P1 — Baseline`: Single Execution Owner

‏כדי למנוע split brain, ב־Baseline יהיה execution writer אחד בלבד.

‏Multiple active execution instances אינם Baseline.

‏Lease/leadership/fencing הם Challengers רק אם architecture באמת דורשת HA multi-instance.

---

### ‏`P1 — Baseline`: Recovery Budget + Escalation

‏Retry אינסופי אסור.

‏לכל recovery נשמרים:

```text
attempt_count
last_attempt_at
next_attempt_at
unresolved_duration
last_error
```

‏הסלמה אפשרית:

```text
retry
→ DEGRADED
→ EXIT_ONLY
→ MANUAL_REQUIRED
→ FAULTED
```

‏המספרים עצמם אינם Magic Numbers; הם נמדדים ונקבעים לפי failure class/exposure.

---

### ‏`P1 — Baseline`: Severity לפי Financial Uncertainty

‏Severity נקבעת בעיקר לפי:

```text
Is exposure known?
Are working orders known?
Is risk-reducing action available?
Is there open exposure?
How stale is broker/data truth?
```

‏לא לפי כמה מפחיד נראה exception text.

---

### ‏`P1 — Baseline`: Auto Resume vs Manual Resume

‏Auto Resume מתאים רק כאשר:

```text
cause understood
recovery short/bounded
full reconciliation complete
no unknown financial state
no state corruption
no ownership ambiguity
all invariants pass
```

‏Manual approval נדרש כברירת מחדל כאשר יש:

```text
unexplained position mismatch
orphan broker order
state/data corruption
split-brain suspicion
repeated recovery failure
unsafe migration
ownership ambiguity
```

‏Manual Resume לעולם אינו עוקף failed gates.

---

## ‏3. Why

‏Failure Recovery הוא חלק מה־economic path של אסטרטגיה קצרה.

```text
Signal
→ Decision
→ Order
→ Fill
→ Position
→ Exit
```

‏כאשר failure קוטע שרשרת זו, הבעיה אינה רק uptime.

‏הוא יכול לגרום ל־:

```text
unknown exposure
duplicate exposure
late exit
unprotected position
stale ranking
missed opportunity
extra spread/slippage
manual intervention
```

‏לכן `Recovery correctness` קודם ל־`Recovery speed`, אבל שניהם נמדדים.

---

## ‏4. Use When

‏ה־Baseline חל על:

- ‏Process restart מכל סיבה.
- ‏Broker disconnect/reconnect.
- ‏Market-data outage מלא או חלקי.
- ‏`UNKNOWN_ORDER_EFFECT`.
- ‏Position/order mismatch.
- ‏Partial fill + crash.
- ‏Late fill / cancel-fill race.
- ‏Storage failure או state corruption.
- ‏Clock anomaly שמשפיע על timing correctness.
- ‏Subscription loss/gap.
- ‏Manual account/order change.
- ‏Deployment/restart בזמן lifecycle פעיל.

---

## ‏5. Do Not Use When

‏אין צורך להפעיל full Recovery workflow על כל metric blip קטן.

‏Events harmless שניתן להוכיח שהם idempotent/local בלבד יכולים להישאר תחת normal state handling.

‏אבל אם יש ספק לגבי `orders / fills / positions / exposure / rank trust / durable truth`, recovery trigger עדיף על assumption.

---

## ‏6. Alternatives

### ‏Alternative A — Restart and Continue

‏פשוט וזול.

‏נדחה.

‏אינו מוכיח state.

---

### ‏Alternative B — Auto Retry Everything

‏נדחה במיוחד עבור Commands שמשנים state חיצוני.

‏Timeout אינו Failure proof.

---

### ‏Alternative C — Fully Manual Recovery

‏מתאים אולי ל־POC ראשוני מאוד, אך איטי וקשה לשחזור.

‏Baseline יעדיף automation של containment/reconciliation/validation, עם manual approval כש־Evidence אינו מספיק.

---

### ‏Alternative D — Distributed HA / Consensus

‏`P3/P4` בלבד.

‏לא מוצדק לרובוט אישי לפני Evidence שה־single-process baseline אינו מספיק.

---

### ‏Alternative E — Full Event Sourcing

‏אפשרי אך אינו דרישת Baseline.

‏Append-only journals + durable snapshots + authoritative reconciliation מספקים ערך רב בפחות complexity.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| ‏Fail closed ל־Entries | מונע duplicate/unknown risk | missed opportunities |
| ‏Position-first recovery | מגן על Exposure קיים | Scanner חוזר מאוחר יותר |
| ‏Explicit Resume | trace/audit חזק | recovery מעט איטי יותר |
| ‏Append-only journal | rebuild/RCA טובים | storage/implementation |
| ‏No blind retry | מפחית duplicate side effects | דורש reconciliation logic |
| ‏Single execution writer | consistency פשוטה | פחות HA |
| ‏Warm-up אחרי Data recovery | Rank אמין יותר | delay לפני scanner resume |
| ‏Manual gate באנומליה | שמרני | operational burden |

---

## ‏8. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Active-active execution.
- ‏Distributed consensus מורכב.
- ‏Automatic broker/provider failover עם state blending.
- ‏Recovery heuristics שמנחשים Position/Order state.
- ‏Blind `placeOrder` retry.
- ‏Automatic resurrection של stale signal.
- ‏Full event-sourcing rewrite.
- ‏Complex self-healing לפני Observability מספקת.
- ‏Chaos experiments בסביבה שמסוגלת ליצור Exposure אמיתי.

---

## ‏9. What to Add Later

### ‏`P2`

- ‏Warm secondary Market Data standby.
- ‏Fault-injection suite רחב יותר.
- ‏Recovery state visualization.
- ‏Recovery SLO dashboards.
- ‏Automated incident packet generation.
- ‏Snapshot migration tooling.
- ‏Recovery replay diffing.

### ‏`P3`

- ‏Fencing/lease layer אם מוסיפים multiple instances.
- ‏Advanced outbox/inbox workflows.
- ‏Circuit breaker per dependency.
- ‏Bulkhead resource isolation.
- ‏Formal model-based recovery testing.

### ‏`P4`

- ‏HA execution architecture.
- ‏Cross-region recovery.
- ‏Distributed consensus.

---

## ‏10. Required Data / Evidence

‏כדי להוכיח Recovery נדרש לשמור לפחות:

```text
recovery_id
incident_id
failure_reason
failure_detected_at
containment_at
reconciliation_started_at
reconciliation_completed_at
rebuild_completed_at
validation_completed_at
resume_at

system_state_before
trading_state_before
broker_state_before
market_data_state_before
risk_state_before

local_orders_before
broker_orders_after
local_fills_before
broker_executions_after
local_position_before
broker_position_after

unknown_effects
orphan_orders
orphan_positions
manual_changes

market_data_freshness
fresh_coverage_ratio
sequence_gap_count
feature_warmup_state

retry_attempts
recovery_blockers
auto_or_manual_resume
final_recovery_result
```

‏לכל Incident משמעותי נשמור גם event window לפני/אחרי failure.

---

## ‏11. Promotion Criteria

‏Recovery capability מקודמת כאשר:

- ‏Restart בכל lifecycle state אינו יוצר duplicate exposure.
- ‏`UNKNOWN_ORDER_EFFECT` לעולם אינו מוביל blind retry.
- ‏Broker reconciliation converges ל־orders/fills/positions עקביים.
- ‏Duplicate fill callbacks אינם משנים final quantity.
- ‏Cancel/fill races מסתיימים ב־correct broker-reconciled state.
- ‏Market-data reconnect אינו מאפשר Rank לפני coverage/warm-up מספיקים.
- ‏Stale signals אינם נשלחים מחדש אוטומטית.
- ‏Open Position מקבלת קדימות על Scanner recovery.
- ‏No `READY` לפני successful reconciliation + invariant validation.
- ‏Recovery behavior deterministic ב־Replay עבור אותו incident/version.
- ‏Recovery blockers ברורים ומכונתיים.
- ‏Manual actions auditable.
- ‏Recovery latency ו־unknown duration measurable.

---

## ‏12. Rejection Criteria

‏Reject implementation אם:

- ‏`connected=true` מחזיר `READY` ישירות.
- ‏Timeout מסווג כ־Reject/Success ללא broker evidence.
- ‏Order retry יכול ליצור duplicate exposure.
- ‏Restart מניח `FLAT` לפני broker query.
- ‏Partial fill יכול להיעלם לאחר crash.
- ‏Position mismatch מתוקן בשקט.
- ‏Orphan order נעלם בלי Incident/Audit.
- ‏Data recovery מתעלם מ־partial-universe coverage.
- ‏Feature warm-up מקוצר באמצעות fake zeros/defaults.
- ‏Resume יכול לעקוף gates.
- ‏Recovery loops יכולים לרוץ לנצח.
- ‏Deployment יכול ליצור שני execution writers.
- ‏Operator actions אינן versioned/audited.

---

## ‏13. Metrics

### ‏Detection / Containment

```text
time_to_detect
time_to_contain
containment_failures
```

### ‏Reconciliation

```text
reconciliation_duration
orders_mismatch_count
position_mismatch_count
unknown_order_duration
orphan_order_count
```

### ‏Recovery

```text
recovery_count
recovery_duration
failed_recovery_count
auto_resume_count
manual_resume_count
recovery_attempts
state_flapping_rate
```

### ‏Trading-specific

```text
open_exposure_during_recovery
unprotected_position_duration
recovery_slippage
missed_entries_due_to_recovery
signal_expired_during_recovery
```

### ‏Readiness

```text
fresh_coverage_ratio
market_data_warmup_duration
last_broker_reconciliation_age
last_known_good_state_age
```

---

## ‏14. Failure Modes

### ‏`RESUME_TOO_EARLY`

‏חזרה ל־Ready לפני Evidence מלא.

### ‏`RESUME_TOO_LATE`

‏State כבר ידוע, אך Recovery design איטי באופן שמוסיף operational cost.

### ‏`RECONCILIATION_FAILED`

‏Broker/local truth לא converged.

### ‏`CONTAINMENT_FAILED`

‏Risk-increasing action נשלחה אחרי trigger.

### ‏`DUPLICATE_SIDE_EFFECT`

‏Retry/restart יצר command כפול.

### ‏`STATE_REBUILD_FAILED`

‏Snapshot/events/mappings אינם מספיקים לשחזור state.

### ‏`PARTIAL_UNIVERSE_FALSE_READY`

‏Feed חזר אך Rank נשען על Universe חלקי.

### ‏`STALE_INTENT_RESURRECTED`

‏Signal ישן נשלח אחרי recovery.

### ‏`SPLIT_BRAIN_EXECUTION`

‏שני execution writers פועלים.

### ‏`MANUAL_OWNERSHIP_AMBIGUOUS`

‏שינוי ידני לחשבון/Position אינו מזוהה נכון.

### ‏`RECOVERY_STORM`

‏Dependency flapping גורם ל־recovery חוזר בלי יציבות.

---

## ‏15. User-Specific Application

‏למערכת שלנו יש מאפיינים שמקשיחים את Recovery:

```text
whole-market ranking
short signal lifetime
Top-N candidate handoff
separate market data and broker
single-position research baseline
fast entry/exit horizons
```

‏לכן ארבעה כללים חשובים במיוחד:

1. ‏`Fresh Coverage` הוא חלק מ־Safe Resume, לא רק socket health.
2. ‏Signal ישן אחרי recovery אינו actionable בלי revalidation.
3. ‏Exposure קיים קודם תמיד ל־whole-market scanning.
4. ‏Recovery latency היא חלק מ־Execution Quality ונמדדת בהתאם.

‏Baseline היישום:

```text
Process starts/reconnects
→ RECOVERING
→ load durable intent/journal state
→ reconcile broker orders/fills/positions
→ establish exact exposure
→ restore exit/risk capability
→ connect/restore market data subscriptions
→ validate fresh coverage
→ warm feature windows
→ validate risk/clock/universe/versions
→ RECOVERY_VALIDATED
→ READY
```

---

## ‏16. Concrete Baseline Contract

### ‏Recovery record

```text
recovery_id
incident_id
reason
severity
phase
attempt
started_at
phase_started_at
previous_system_state
current_system_state
known_exposure_status
unknown_order_count
blocker_codes
auto_resume_allowed
manual_approval_required
recovery_policy_version
```

### ‏Evidence status

```text
broker_orders_status: KNOWN | INFERRED | UNKNOWN
broker_positions_status: KNOWN | INFERRED | UNKNOWN
market_data_status: KNOWN | INFERRED | UNKNOWN
risk_state_status: KNOWN | INFERRED | UNKNOWN
feature_state_status: KNOWN | INFERRED | UNKNOWN

orders_verified_at
positions_verified_at
market_data_verified_at
risk_verified_at
feature_state_verified_at
```

### ‏Retry classification

```text
operation_name
operation_kind: QUERY | COMMAND
retry_class:
  SAFE_TO_RETRY
  RETRY_WITH_IDEMPOTENCY
  RECONCILE_BEFORE_RETRY
  NEVER_AUTO_RETRY
idempotency_key
last_attempt_result
```

### ‏Safe resume

```text
broker_gate_passed
position_gate_passed
unknown_effect_gate_passed
market_data_gate_passed
coverage_gate_passed
feature_warmup_gate_passed
risk_gate_passed
clock_gate_passed
version_gate_passed
invariants_passed
resume_event_id
resume_actor
```

---

## ‏17. Confidence

### ‏High confidence

- ‏Restart אינו Recovery.
- ‏Reconciliation לפני new risk.
- ‏Timeout/unknown effect separation.
- ‏Stable IDs + dedupe/idempotency.
- ‏Position-first recovery.
- ‏Explicit Safe Resume gates.
- ‏Market-data coverage + warm-up לפני cross-sectional rank resume.
- ‏No blind financial command retry.

### ‏Medium confidence

- ‏Exact staged states כמו `READY_NO_ENTRY` מול capability-only representation.
- ‏Outbox/inbox value ביחס ל־complexity ברובוט אישי.
- ‏Snapshot cadence/design.
- ‏Auto-resume policy classes.

### ‏Low / evidence-dependent

- ‏Need for distributed fencing/HA.
- ‏Need for multi-provider automated failover.
- ‏Specific retry/recovery timeouts before workload evidence.

---

## ‏18. Time-Sensitive Facts

‏המקטע מתודולוגי ואינו מוסיף limit/capability חדש של Broker או Data Provider.

‏כאשר מממשים recovery מול Broker מסוים, צריך לאמת מחדש לפני שימוש תפעולי:

- ‏Order identifiers ו־idempotency semantics.
- ‏Order/execution query coverage after reconnect.
- ‏Paper-vs-live recovery behavior.
- ‏Native protective order semantics.
- ‏Session/authentication/reconnect requirements.
- ‏Market-data resubscription/backfill semantics.

‏אין להמיר את ה־Baseline הזה להנחות vendor-specific ללא current verification.

---

## ‏19. Relationship to Later Sheets

### ‏35 — Monitoring / Logging / Observability

‏יגדיר איך Recovery phases, blockers, unknown duration ו־reconciliation נראים ומתריעים בזמן אמת.

### ‏36 — Kill Switches / Safety Controls

‏יחבר Recovery failure ל־`EXIT_ONLY`, ‏entry freeze, operator actions ו־safety escalation.

### ‏Testing chapters

‏ירחיבו fault injection, model-based state testing ו־golden recovery traces.

### ‏Production synthesis

‏Recovery יהפוך Gate מחייב ב־Production Readiness וב־Path from Research to Live.

---

## ‏20. Recovery Runbooks — Baseline

### ‏Process crash

```text
Start in RECOVERING
→ load durable state
→ reconcile broker
→ rebuild lifecycle
→ establish exposure truth
→ restore data subscriptions
→ warm features
→ validate gates
→ explicit resume
```

### ‏Broker disconnect

```text
Block new risk
→ mark broker truth stale
→ reconnect
→ query orders/executions/positions
→ reconcile
→ resolve unknowns
→ validate
→ restore capabilities
```

### ‏Market-data outage

```text
Block entries
→ keep broker/position management alive
→ reconnect provider
→ restore subscriptions
→ validate gaps/fresh coverage
→ warm feature windows
→ validate ranking context
→ resume scanner
```

### ‏Unknown Order Effect

```text
Do not retry blindly
→ query broker truth
→ match stable IDs
→ inspect executions
→ resolve order state
→ rebuild exposure
→ choose next action
```

### ‏Position mismatch

```text
Freeze new entries
→ broker quantity wins for execution truth
→ inspect fills/manual actions/mappings
→ rebuild local state
→ restore protection
→ RCA mismatch cause
→ escalate if ownership unclear
```

---

## ‏21. Testing Strategy

### ‏Golden scenarios — `P0`

- ‏Crash before persist.
- ‏Crash between persist and submit.
- ‏Crash after submit before ACK.
- ‏Crash after ACK before Fill.
- ‏Crash after partial Fill.
- ‏Crash during Exit.
- ‏Broker disconnect while Flat.
- ‏Broker disconnect with Exposure.
- ‏Full Market Data outage.
- ‏Partial Universe loss.
- ‏Duplicate Fill event.
- ‏Out-of-order broker events.
- ‏Late Fill after cancel request.
- ‏Storage failure.
- ‏Manual broker Position change.
- ‏Unknown broker order.
- ‏Repeated dependency flapping.

### ‏Properties — `P0`

```text
same intent must not unintentionally duplicate exposure
broker/local position converges after reconciliation
UNKNOWN blocks new risk
restart does not turn exposure into FLAT
READY requires reconciliation
state repair is never silent
same incident + same versions => same recovery outcome
```

### ‏Fault injection — `P1/P2`

‏Failure injection רץ ב־Replay/Shadow/Paper בלבד עד שיש Safety architecture מוכחת.

---

## ‏22. Recommendation Summary

```text
Failure Detected
→ Assign Incident / Recovery ID
→ Freeze New Risk
→ Classify What Is KNOWN / INFERRED / UNKNOWN
→ Reconcile Broker Orders / Executions / Positions
→ Rebuild Local Lifecycle Deterministically
→ Restore/Verify Existing Exposure Protection
→ Restore Market Data Desired State
→ Validate Fresh Coverage + Gaps
→ Warm Required Features
→ Restore Risk / Clock / Universe / Version State
→ Evaluate Hard Invariants
→ RECOVERY_VALIDATED
→ Restore Capabilities Gradually
→ Explicit Resume
→ Capture Incident for Replay / RCA / Regression
```

‏משפט המפתח:

> ‏Recovery מוצלח אינו שהמערכת שוב רצה; Recovery מוצלח הוא שהמערכת שוב יודעת מה נכון, מה לא ידוע, ומה מותר לה לעשות.
