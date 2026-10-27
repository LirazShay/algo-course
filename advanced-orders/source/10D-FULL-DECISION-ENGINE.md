# ‏חלק 10D — Full Decision Engine: Orchestration, Precedence ו־Single Decision Authority

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, חלק 10D מחבר את 10A, ‏10B ו־10C תחת Orchestrator יחיד. הוא מפריד בין `System Operating Mode`, ‏Semantic Decision, ‏`Application Execution Mode`, ‏`Behavior Candidate`, ‏Exit/Protection Authority ו־Broker lifecycle.

---

## ‏10D.1 המטרה: Orchestrator אחד, לא שלושה מנועים עצמאיים

‏התפקידים נשארים נפרדים:

```text
10A = Eligibility, constraints and elimination gates
10B = Entry mode + behavior selection
10C = Position, protection and exit decision
10D = Orchestration, precedence and command authority
```

‏אבל רק 10D מוסמכת להחליט איזו obligation מקבלת קדימות במחזור הנוכחי.

‏הלולאה הקנונית:

```text
Events
→ Normalize Facts
→ Persist Facts
→ Reduce State
→ Build Immutable Decision Snapshot
→ Orchestrator
→ Relevant 10A / 10B / 10C pipeline
→ Semantic Decision
→ Persist Decision / Command Intent
→ Command Dispatcher
→ Broker
→ New Events
```

> ‏`ENGINE INVARIANT` — Event אינה Command. ‏Callback, Timer, Scanner ו־Risk Monitor מייצרים Facts/Triggers בלבד; הם אינם שולחים fallback או replacement בעצמם.

---

## ‏10D.2 `Decision Engine` אינה Broker Adapter

‏ה־Decision Engine מחזירה Semantic Decision, למשל:

```text
NO_ACTION
NO_TRADE
DEFER
CANCEL_ENTRY
KEEP_ENTRY
SUBMIT_ENTRY
REEVALUATE_ENTRY
PROTECT_POSITION
SUBMIT_EXIT
CANCEL_EXIT
RECONCILE_ONLY
FREEZE_NEW_RISK
```

‏אם נבחרה Entry/Exit לביצוע, ה־Decision נושאת גם:

```text
application_execution_mode
behavior_candidate
constraints
reason_code
```

‏רק `Command Dispatcher` וה־Broker Adapter מתרגמים זאת ל־Order primitive, ‏TIF, attributes, route, broker algo ו־API fields.

---

## ‏10D.3 `System Operating Mode` אינו Semantic Action

‏ה־modes הגלובליים הם:

```text
BOOTING
RECOVERING
READY
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
EMERGENCY
FROZEN
```

‏Mode מגבילה אילו Decisions חוקיות; היא אינה בעצמה Broker command.

‏לדוגמה:

```text
SystemMode = EXIT_ONLY
Decision   = SUBMIT_EXIT
ExitMode   = FAST_EXIT
Behavior   = MARKETABLE_LIMIT_IOC
```

‏אלה ארבע שכבות שונות.

---

## ‏10D.4 כלל העל: Existing Risk קודם ל־Optional Risk

‏כאשר יש התנגשות בין Opportunity חדשה לבין:

```text
unknown position
unprotected position
cancel race
broker unreconciled
exit/protection already potentially executable
```

‏ה־precedence היא:

```text
resolve or contain existing risk first
```

‏Entry חדשה היא Optional Risk; Position קיימת היא Risk שכבר קיים.

---

## ‏10D.5 סדר עדיפויות גלובלי קנוני

```text
P0  CAPITAL / POSITION SAFETY
P1  BROKER TRUTH / RECONCILIATION
P2  PROTECTION OF EXISTING POSITION
P3  EXIT DECISION / RISK REDUCTION
P4  CANCEL / INVALIDATE STALE ENTRY
P5  NEW ENTRY DECISION
P6  EXECUTION OPTIMIZATION / PRICE IMPROVEMENT
P7  RESEARCH / SHADOW EVALUATION
```

‏Priority גבוהה יכולה לדכא נמוכה יותר גם אם ה־Signal החדשה אטרקטיבית מאוד.

---

## ‏10D.6 `DecisionCycle`

```text
1. read immutable state snapshot
2. validate snapshot consistency
3. classify System Operating Mode
4. derive obligations
5. select highest-priority legal obligation
6. invoke relevant 10A / 10B / 10C pipeline
7. emit Semantic Decision
8. persist Decision
9. derive and persist CommandIntent if needed
10. re-check command preconditions
11. dispatch side effect
12. wait for new Facts / timer trigger
13. repeat
```

‏אין loop פנימי של “שלח שוב עד Fill”.

---

## ‏10D.7 Snapshot חייב להיות Immutable בתוך Decision

```text
DecisionSnapshot {
  snapshot_id
  snapshot_ts
  policy_version
  config_snapshot_id
  market_version
  broker_state_version
  position_version
  capability_snapshot_id
  risk_version
}
```

‏Market או Broker Fact חדשה אינה משנה Decision שכבר רצה; היא יוצרת revision חדשה.

---

## ‏10D.8 `BOOTING`

‏ב־Boot:

```text
new entry = forbidden
load durable state
connect broker
initialize identifiers
load configuration
start market data
begin reconciliation
```

‏Signal חדש אינו גובר על חוסר ידיעה לגבי Broker truth.

---

## ‏10D.9 `RECOVERING`

```text
new entries = forbidden
position/protection actions = only under recovery policy
broker/order/position truth = being rebuilt
```

‏Recovery היא `Position-First` ו־`Ownership-First`.

> ‏`ENGINE RULE` — Recovery אינה מחיה Signal או Trade Intent שפגו בזמן שהמערכת הייתה לא זמינה.

---

## ‏10D.10 `READY` הוא Earned State

‏Reconnect לבדו אינו מספיק.

‏`READY` מתקבל רק לאחר שה־required invariants עברו, למשל:

```text
broker connected
open orders reconciled
executions reconciled
positions reconciled
unknown ownership classified
protection state reconciled
market data healthy enough
critical capabilities valid
risk engine healthy
persistence healthy
```

> ‏`ENGINE INVARIANT` — `CONNECTED != READY`.

---

## ‏10D.11 `ENTRY_DISABLED`

‏המערכת יכולה להיות בריאה מספיק לניהול Positions ועדיין לחסום Risk חדש, למשל בגלל:

```text
session policy
loss/risk limit
capability degradation
manual risk control
strategy disablement
```

‏Existing Positions עדיין מקבלות Protection/Exit management.

---

## ‏10D.12 `EXIT_ONLY`

```text
no new entries
no position increase
allow actions that preserve or reduce existing exposure
```

‏זה Mode טבעי כאשר Entry path אינה בטוחה אך Position קיימת עדיין דורשת ניהול.

---

## ‏10D.13 `DEGRADED`

‏`DEGRADED` אינו synonym ל־`UNKNOWN`.

‏הוא System Mode שבו חלק מהיכולות אינן תקינות, אך Policy יודעת אילו actions עדיין מותרות.

‏לדוגמה:

```text
one research capability disabled
core exits still healthy
=> DEGRADED, not necessarily FROZEN
```

---

## ‏10D.14 `EMERGENCY`

‏ב־Emergency:

```text
risk reduction > ordinary price optimization
```

‏אבל עדיין חלים:

```text
reconciled quantity bounds
existing-order overlap checks
duplicate prevention
session / halt awareness
explicit emergency Economic Price Bound policy
```

‏Emergency אינה `send Market blindly`.

---

## ‏10D.15 `FROZEN`

‏כאשר invariant קריטי נשבר ואין פעולה רגילה שניתן להצדיק בבטחה:

```text
normal new side effects = blocked
only explicitly authorized safety/recovery actions may remain
```

‏`FROZEN` היא control state. ‏`UNKNOWN` היא epistemic state. אין לערבב ביניהן.

---

## ‏10D.16 סדר ההכרעה בתוך Symbol

```text
1. MATERIAL UNKNOWN / INCONSISTENT STATE?
2. RECONCILED POSITION EXISTS?
3. PROTECTION RESPONSIBILITY SATISFIED?
4. EXIT / RISK REDUCTION REQUIRED?
5. ENTRY ORDER ALREADY POTENTIALLY EXECUTABLE?
6. EXISTING ENTRY STILL VALID?
7. NEW / ADD / REENTRY INTENT EXISTS?
8. RUN 10A
9. RUN 10B IF ALLOWED
```

‏Position קיימת אינה נבלעת בלוגיקת Scanner חדשה.

---

## ‏10D.17 `Position First`

‏ה־Position vocabulary הקנוני הוא:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏כאשר קיימת `reconciled_position` שאינה Flat, 10C מקבלת precedence לפני Entry חדשה.

‏אם Position truth עדיין אינה reconciled, אין להשתמש ב־local quantity כאילו היא Fact סופית.

---

## ‏10D.18 Entry חדשה, Add ו־Reentry הן Intents שונות

```text
OPEN_NEW_POSITION
ADD_TO_POSITION
REENTER_AFTER_EXIT
```

‏`ADD_TO_POSITION` אינה shortcut של Entry רגילה: היא דורשת Position/Protection/Exit ownership תקינים לפני הגדלת exposure.

‏`REENTER_AFTER_EXIT` דורשת `FLAT_CONFIRMED`, לא רק local quantity אפס.

---

## ‏10D.19 `FLAT_CONFIRMED` הוא Fact מורכב

‏נרצה לפחות:

```text
reconciled_position == 0
no potentially executable entry contradiction
no potentially executable exit/protection contradiction
no material unknown broker order
executions reconciled
broker position reconciled
```

‏רק אז ניתן להתייחס ל־Symbol כ־Flat מבחינת lifecycle חדש.

---

## ‏10D.20 Broker Event אינו Command Trigger אוטומטי

‏Anti-pattern:

```text
onPartialFill -> immediately submit remainder
onReject      -> immediately send fallback
onCancelAck   -> immediately submit replacement
```

‏המסלול הקנוני:

```text
event
→ normalize Fact
→ persist Fact
→ reduce State
→ trigger Decision
→ maybe NO_ACTION
```

---

## ‏10D.21 Events שמעוררים Re-evaluation

```text
ORDER_ACK
ORDER_REJECTED
ORDER_PARTIAL_FILL
ORDER_FILLED
ORDER_CANCELLED
ORDER_MODIFIED
STOP_TRIGGERED
CONNECTION_LOST
CONNECTION_RESTORED
POSITION_UPDATE
CAPABILITY_CONFLICT
MANUAL_ACTIVITY_DETECTED
TIMER_EXPIRED
MARKET_STATE_CHANGED
SIGNAL_CHANGED
```

‏Re-evaluation אינה הבטחה ל־side effect.

---

## ‏10D.22 `Decision Trigger` ו־`Decision Reason`

‏נשמור בנפרד:

```text
trigger = BROKER_FILL
reason  = POSITION_CHANGED
```

‏או:

```text
trigger = TIMER_EXPIRED
reason  = APPLICATION_ORDER_TTL_EXPIRED
```

‏כך אפשר למדוד מה עורר evaluation ומה באמת שינה policy outcome.

---

## ‏10D.23 Priority Queue של Obligations

```text
RECONCILE_BROKER
REPAIR_PROTECTION
REDUCE_EXPOSURE
CANCEL_STALE_ENTRY
MAINTAIN_VALID_EXIT
MAINTAIN_VALID_ENTRY
OPEN_NEW_POSITION
IMPROVE_EXECUTION
RUN_SHADOW_EVALUATION
```

‏ה־Orchestrator בוחר obligation בעלת precedence הגבוהה ביותר שמותר לבצע כרגע.

---

## ‏10D.24 Obligation אחת יכולה לדכא אחרת

‏לדוגמה:

```text
REPAIR_PROTECTION
```

‏מדכאת:

```text
OPEN_NEW_POSITION
IMPROVE_EXECUTION
```

‏עד ש־Protection responsibility חוזרת למצב תקין.

---

## ‏10D.25 `NO_ACTION`, ‏`NO_TRADE` ו־`DEFER` אינם אותו דבר

```text
NO_ACTION
=> no new side effect is required in this cycle

NO_TRADE
=> evaluated opportunity is not eligible for entry now

DEFER
=> temporary missing/uncertain fact requires a future fresh decision
```

‏`NO_ACTION` יכולה להיות החלטה נכונה כאשר קיימת Order תקפה שצריך להשאיר ללא שינוי.

---

## ‏10D.26 `HOLD` הוא Exit Disposition מפורש

‏כאשר Position קיימת:

```text
HOLD
=> position remains intentionally open
=> protection is acceptable
=> no exit obligation currently dominates
```

‏`HOLD` דורשת reason code; היא אינה absence of logic.

---

## ‏10D.27 Timers אינם Commands

‏ארבעת ה־clocks הקנוניים נשארים:

```text
signal_ttl
application_order_ttl
broker_tif
working_order_age
```

‏Timer של `application_order_ttl` שפג מפעיל Decision חדשה. הוא אינו מבצע Cancel ישירות מתוך scheduler.

---

## ‏10D.28 Decision Precedence — Skeleton

```text
if system_mode == FROZEN:
    return safety_or_recovery_decision(snapshot)

if material_broker_or_position_truth_unknown(snapshot):
    return RECONCILE_ONLY

if reconciled_position_exists(snapshot):
    exit_decision = run_10C(snapshot)
    if exit_decision.requires_action_or_hold:
        return exit_decision

existing_entry_decision = evaluate_existing_entry(snapshot)
if existing_entry_decision.requires_action:
    return existing_entry_decision

if system_mode != READY:
    return NO_ACTION

if no_new_entry_intent(snapshot):
    return NO_ACTION

envelope = run_10A(snapshot)
if envelope.disposition != ALLOW_ENTRY:
    return map_10A_disposition(envelope)

return run_10B(snapshot, envelope)
```

‏זהו contract ארכיטקטוני, לא המלצה לפזר `if` כאלה בכמה callbacks.

---

## ‏10D.29 Entry Plan אינה Side Effect עד Commit Point פנימי

```text
decision created
→ invariants checked
→ CommandIntent derived
→ CommandIntent persisted
→ dispatch preconditions rechecked
→ side effect dispatched
```

‏כך crash בין Decision לשליחה נשאר ניתן לשחזור.

---

## ‏10D.30 `CommandIntent` קנוני

```text
CommandIntent {
  command_id
  decision_id
  internal_order_id
  command_type
  expected_effect
  max_qty
  economic_price_bound
  broker_tif
  expires_at
  preconditions
  state_version
}
```

‏`economic_price_bound` הוא אותו מושג שנקבע ב־10A–10C; אין alias נפרד של `hard cap` ברמת Orchestrator.

---

## ‏10D.31 Precondition Check רגע לפני Send

```text
is state_version still current?
is reconciled quantity budget still valid?
is Decision still unexpired?
is System Operating Mode still compatible?
is required capability still enabled?
is ownership unchanged?
```

‏אם אחד מהם נכשל, CommandIntent אינה נשלחת ומופעל fresh decision.

---

## ‏10D.32 `Stale Decision Execution` היא Failure Class

‏תרחיש:

```text
Decision: BUY 100
before dispatch: old order fills 60
```

‏Command guard חייב לחסום את ה־BUY הישן אם quantity/exposure assumptions השתנו.

---

## ‏10D.33 Rejection Pipeline

```text
classify rejection
→ normalize Fact
→ update order/broker state
→ update capability evidence if relevant
→ update risk/ownership if relevant
→ fresh Decision
```

‏אין:

```text
onReject -> sendFallback()
```

---

## ‏10D.34 Failure Classes

```text
CAPABILITY_FAILURE
VALIDATION_FAILURE
PRICE_INCREMENT_FAILURE
TEMPORARY_PROCESSING_FAILURE
CONNECTIVITY_FAILURE
ROUTE_FAILURE
ORDER_ALREADY_TERMINAL
OWNERSHIP_CONFLICT
STATE_VERSION_CONFLICT
UNKNOWN_FAILURE
```

‏כל class מקבלת `failure_destination`; destination יכולה להיות `REDECIDE`, ‏`RECONCILE`, ‏`DISABLE_CANDIDATE`, ‏`EXIT_ONLY`, ‏`FROZEN` או Incident path לפי חומרה.

---

## ‏10D.35 `Fallback` אינה `Escalation`

### ‏Fallback

‏Implementation/Capability שנבחרה אינה זמינה או נכשלה; מעדכנים Facts וחוזרים ל־Decision חדשה. החלופה יכולה להיות פחות אגרסיבית, יותר אגרסיבית או `NO_TRADE`.

### ‏Escalation

‏Risk/Urgency/Market state השתנו כך ש־fresh decision מצדיקה Mode אגרסיבי יותר.

> ‏`ENGINE RULE` — Capability failure לבדה אינה authorization ל־Escalation.

---

## ‏10D.36 Escalation דורשת Economics מחדש

‏מעבר כגון:

```text
PASSIVE_JOIN
→ ADAPTIVE_LIMIT_URGENT
→ MARKETABLE_LIMIT_IOC
```

‏אפשרי רק אחרי fresh evaluation של:

```text
signal validity
remaining signal life
remaining executable edge
reconciled position/exposure
Economic Price Bound
exit feasibility
capability state
```

---

## ‏10D.37 Escalation Budget גלובלי ל־Intent

```text
attempt_count
total_elapsed_ms
cumulative_price_concession
cancel_replace_count
broker_algo_restart_count
```

‏כל Decision חדשה רואה את התקציב המצטבר שכבר נצרך.

---

## ‏10D.38 `Opportunity Supersession`

```text
new opportunity != old execution risk disappeared
```

‏Flow:

```text
mark old intent SUPERSEDED
request cancellation if required
keep old order in exposure budget until terminal evidence
apply/reconcile any late fills
protect/exit any resulting position
release only confirmed-safe capital
then evaluate new opportunity
```

---

## ‏10D.39 Capital Allocation היא State

```text
confirmed_cash_available
reserved_for_live_orders
reserved_for_cancel_requested_orders
reserved_for_cancel_pending_orders
reserved_for_unknown_orders
capital_locked_in_positions
```

‏כך מעבר מהיר בין Symbols אינו יוצר double allocation.

---

## ‏10D.40 Cross-Symbol Arbitration מגיעה אחרי Eligibility

‏הסדר הוא:

```text
filter eligible
→ verify capital / exposure / exit feasibility
→ rank surviving opportunities
```

‏ולא:

```text
rank everything
→ hope the winner is executable and safe
```

‏Strategy ranking אינה עוקפת Risk/Execution gates.

---

## ‏10D.41 `Single Decision Authority`

‏Scanner, Broker Adapter, Timer, Market Data handler ו־Risk Monitor מייצרים Events/Facts.

‏רק Decision Engine/Orchestrator מייצרת Semantic Action.

> ‏`ENGINE INVARIANT` — אין callback שמחליטה בעצמה `cancel`, ‏`replace`, ‏`retry`, ‏`fallback` או `escalate`.

---

## ‏10D.42 `Single Exit Authority`

‏בכל רגע יש authority אחת בלבד שיוזמת **intentional position reduction**:

```text
ExitAuthority =
  NONE
  LOCAL_ENGINE
  RECOVERY_CONTROLLER
```

‏Protection Authority נשמרת בנפרד:

```text
ProtectionAuthority =
  NONE
  BROKER_PROTECTION
  BROKER_BRACKET
  LOCAL_PROTECTION
```

‏Broker Protection עדיין יכולה להיות physically executable בזמן Handoff; לכן `Single Exit Authority` אינה טענה שרק Order אחת יכולה להתבצע.

---

## ‏10D.43 Handoff בין Exit ו־Protection Authorities אינו Atomic

‏ה־protocol:

```text
1. decide local exit is required
2. inspect reconciled position
3. inspect potentially executable protection/exits
4. derive safe overlap/quantity budget
5. request cancel/resize if policy requires
6. treat pending cancel as still executable
7. submit only quantity that remains safe under worst case
8. reconcile executions from all paths
9. earn FLAT_CONFIRMED or establish new protection state
```

‏אין רגע קסום שבו `cancel requested` הופך Protection ללא־קיימת.

---

## ‏10D.44 Emergency יכולה לשנות Handoff Policy — לא את Invariants

‏ב־Emergency Policy יכולה להרשות `OVERLAPPED_REPLACEMENT`/overlap מוגבל אם קיים quantity budget מפורש.

‏אבל:

```text
worst_case_total_exit_qty
```

‏עדיין חייב להיות תחום מול `reconciled_position` וה־risk policy.

---

## ‏10D.45 Reconciliation יכולה לקטוע כל Plan

‏אם מופיעה evidence כגון:

```text
position mismatch
unknown broker order
execution correction
manual activity
broker reconnect
ownership conflict
```

‏Plan קיימת יכולה להפוך invalid ומצב עובר ל־reconciliation.

‏Completion של Plan ישנה אינה חשובה יותר מ־current truth.

---

## ‏10D.46 `Decision Invalidation`

```text
signal invalidated
Economic Price Bound invalidated
state revision changed
position changed
capability changed
System Operating Mode changed
market data became stale
ownership changed
application_order_ttl expired
```

‏Decision יכולה להתבטל לפני dispatch או בזמן working lifecycle.

---

## ‏10D.47 Full Decision Matrix

| System / Position State | Signal / Obligation | Protection | Semantic Decision |
|---|---|---|---|
| `RECOVERING` | כל מצב | לא ידוע/לא reconciled | `RECONCILE_ONLY` או safety action לפי Risk |
| `FROZEN` | כל מצב | כל מצב | Safety/Recovery בלבד |
| `READY`, `FLAT_CONFIRMED` | אין Entry Intent | N/A | `NO_ACTION` |
| `READY`, `FLAT_CONFIRMED` | Entry Intent תקף | N/A | `10A → 10B` |
| Flat + stale live entry | Signal פג/בוטל | N/A | `CANCEL_ENTRY` |
| Position קיימת | Hold condition | תקינה | `HOLD` / `NO_ACTION` |
| Position קיימת | normal exit condition | תקינה | `EXECUTE_EXIT + NORMAL_EXIT` |
| Position קיימת | fast exit condition | תקינה | `EXECUTE_EXIT + FAST_EXIT` |
| Position קיימת | hard risk / emergency | כל מצב | `EXECUTE_EXIT + EMERGENCY_REDUCE` |
| Position קיימת | Protection חסרה | חסרה | `PROTECT_POSITION` / risk reduction |
| Position קיימת | ownership materially unknown | לא ידוע | `RECONCILE_ONLY` |
| `EXIT_ONLY` | Entry Intent חדש | N/A | `NO_TRADE` / Entry denied by mode |
| `ENTRY_DISABLED` | Entry Intent חדש | N/A | `NO_TRADE` / Entry denied by policy |

---

## ‏10D.48 Entry Modes ו־Behavior Candidates בתוך Orchestrator

‏דוגמאות בלבד, לאחר ש־10A כבר אישרה Entry:

| Context | Application Execution Mode | Behavior Candidates אפשריות |
|---|---|---|
| ‏Spread צר + urgency גבוהה | `AGGRESSIVE_CAPPED` | `MARKETABLE_LIMIT_IOC` |
| ‏Spread רחב + זמן קיים | `MIDPOINT_SEEKING` | `MIDPRICE`, `SNAP_MIDPOINT`, `PEGGED_MIDPOINT_DIRECT` |
| ‏Passive intent + quote migration | `BROKER_MANAGED` / `PASSIVE` | `RELATIVE_PRIMARY`, `PASSIVE_JOIN` |
| ‏Passive-only economics | `PASSIVE` | `PASSIVE_POST_ONLY` אם capability מאומתת |
| ‏Signal כמעט פג | `AGGRESSIVE_CAPPED` או none | `MARKETABLE_LIMIT_IOC` או `NO_TRADE` |
| ‏Depth חלשה | לפי survivors | size reduction / partial policy / `NO_TRADE` |

---

## ‏10D.49 Exit Modes, Behaviors ו־Protection Architectures אינם אותה Matrix

### ‏Exit Execution Modes

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

### ‏Behavior Candidates אפשריות

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Protection Architectures / Mechanisms

```text
CLIENT_MANAGED_EXIT
BROKER_BRACKET
HYBRID_PROTECTION
STOP_BACKSTOP
```

‏10C מחברת ביניהם לפי Position, Risk, Capability ו־Authority. אין enum יחיד שמערבב את שלושת הצירים.

---

## ‏10D.50 Pseudocode — Top Level

```text
function decide(snapshot):
    validate_snapshot(snapshot)

    system_mode = classify_system_mode(snapshot)

    if system_mode == FROZEN:
        return decide_safety_or_recovery(snapshot)

    if requires_reconciliation(snapshot):
        return RECONCILE_ONLY

    if has_reconciled_position(snapshot):
        exit_decision = run_10C(snapshot)
        if exit_decision.requires_action_or_hold:
            return exit_decision

    existing_entry = evaluate_existing_entry(snapshot)
    if existing_entry.requires_action:
        return existing_entry

    if system_mode != READY:
        return NO_ACTION

    if not snapshot.intent.new_entry:
        return NO_ACTION

    envelope = run_10A(snapshot)

    if envelope.disposition != ALLOW_ENTRY:
        return map_10A_disposition(envelope)

    return run_10B(snapshot, envelope)
```

---

## ‏10D.51 Pseudocode — Exit Pipeline

```text
function run_10C(snapshot):
    if exit_or_protection_ownership_unknown(snapshot):
        return RECONCILE_ONLY

    if protection_responsibility_unsatisfied(snapshot):
        return PROTECT_POSITION_OR_REDUCE

    if emergency_condition(snapshot):
        return plan_exit(EMERGENCY_REDUCE, snapshot)

    if fast_exit_condition(snapshot):
        return plan_exit(FAST_EXIT, snapshot)

    if normal_exit_condition(snapshot):
        return plan_exit(NORMAL_EXIT, snapshot)

    return HOLD
```

---

## ‏10D.52 Pseudocode — Existing Entry

```text
function evaluate_existing_entry(snapshot):
    if no_potentially_executable_entry(snapshot):
        return NO_ACTION

    if signal_invalid(snapshot):
        return CANCEL_ENTRY

    if entry_constraints_violated(snapshot):
        return CANCEL_ENTRY

    if application_order_ttl_expired(snapshot):
        return REEVALUATE_ENTRY

    return KEEP_ENTRY
```

‏`REEVALUATE_ENTRY` אינה `MODIFY_ENTRY`; היא חוזרת ל־fresh 10A/10B decision.

---

## ‏10D.53 Pseudocode — Command Guard

```text
function dispatch(command_intent, latest_state):
    if command_intent.expired:
        reject_locally(STALE_DECISION)

    if command_intent.state_version != latest_state.version:
        reject_locally(STATE_CHANGED)

    if ownership_changed(command_intent, latest_state):
        reject_locally(OWNERSHIP_CHANGED)

    if violates_quantity_budget(command_intent, latest_state):
        reject_locally(EXPOSURE_CHANGED)

    if capability_no_longer_enabled(command_intent, latest_state):
        reject_locally(CAPABILITY_CHANGED)

    persist_command_intent(command_intent)
    send_to_broker(command_intent)
```

---

## ‏10D.54 Global Invariants

```text
never increase risk while material broker/position truth is unknown
never apply the same execution fact twice
never assume pending cancel is dead
never submit entry beyond current exposure/capital budget
never submit exit beyond safe position/authority budget
never widen Economic Price Bound implicitly
never let expired signal create new entry
never let capability failure auto-escalate aggression
never call FLAT_CONFIRMED before reconciliation
never let callback/timer/adapter bypass Single Decision Authority
```

---

## ‏10D.55 `No Hidden Escalation`

‏שינוי מ־Passive ל־Aggressive, הגדלת Size, הרחבת `Economic Price Bound`, שינוי ל־immediate TIF או מעבר ל־different broker algo חייבים להופיע ב־Decision Trace כבחירה חדשה.

‏Adapter אינו רשאי “לעזור” על דעת עצמו.

---

## ‏10D.56 `DecisionTrace`

```text
DecisionTrace {
  decision_id
  parent_decision_id
  trigger
  reason_code
  snapshot_id
  policy_version
  system_mode
  obligations_considered
  gate_results
  candidates_considered
  selected_disposition
  application_execution_mode
  selected_behavior_candidate
  constraints
  rejected_alternatives
  command_ids
  expires_at
}
```

‏כך ניתן לשחזר שרשרת Decisions ולא רק Order בודדת.

---

## ‏10D.57 Parent Decision ו־Revision Chain

```text
D101 = PASSIVE_JOIN attempt
D102 = CANCEL_ENTRY after application TTL, parent=D101
D103 = fresh MARKETABLE_LIMIT_IOC decision, parent=D102
```

‏D103 אינה “שלב של D101”; היא Decision חדשה המקושרת היסטורית אליה.

---

## ‏10D.58 Decision Outcome

```text
FILLED_FULL
FILLED_PARTIAL
NO_FILL
CANCELLED
REJECTED
SUPERSEDED
EXPIRED
EXITED
EMERGENCY_EXITED
UNKNOWN_RECOVERED
```

‏Partial Fill אינה terminal continuation instruction; היא Fact שמייצרת Position/remaining-intent state חדשה.

---

## ‏10D.59 Execution Quality ו־Trade Outcome הם שני מדדים שונים

### ‏Execution Quality

```text
time_to_useful_fill
price_improvement
slippage_vs_bound
partial_fill_quality
cancel_latency
stale_fill_incidence
exit_completion_latency
```

### ‏Trade Outcome

```text
subsequent_price_move
holding_period_result
net_pnl_or_edge_realization
```

‏Order יכולה לקבל Execution Quality טובה ועדיין להשתייך ל־Trade גרועה, ולהפך.

---

## ‏10D.60 Metrics ברמת Decision Engine

```text
decisions_per_signal
decisions_per_trade
commands_per_decision
redecisions_after_fill
redecisions_after_cancel
reconciliation_interrupt_rate
stale_decision_block_rate
entry_to_exit_transition_ms
protection_repair_count
fallback_count
escalation_count
NO_ACTION_rate
NO_TRADE_rate
DEFER_rate
```

‏Decision churn הוא metric שצריך למדוד, לא מטרה.

---

## ‏10D.61 Safety / Correctness Metrics

```text
unprotected_time_ms
late_fill_incidents
double_exit_prevented_count
double_exit_incidents
orphan_order_incidents
state_mismatch_incidents
recovery_time_ms
ready_reentry_failures
capability_runtime_conflicts
```

---

## ‏10D.62 Acceptance Tests — Orchestrator

```text
1. healthy FLAT_CONFIRMED + valid signal -> 10A then 10B
2. expired signal -> no new entry
3. open position + new signal -> position/protection precedence first
4. unprotected position -> protection/risk reduction before new risk
5. broker unreconciled -> reconcile only
6. stale entry -> cancel before replacement
7. partial entry fill -> protect/reconcile position + fresh decision for remainder
8. IOC zero fill -> fresh re-decision, no blind retry
9. broker reject -> capability/reason update, no direct fallback
10. cancel-pending old entry blocks unsafe new entry
11. superseded symbol waits for confirmed-safe capital release
12. dynamic exit with broker protection follows authority handoff
13. late protection fill during local exit is reconciled
14. connection loss during entry -> no new risk
15. reconnect with live orders -> recovery before READY
16. state changes between decision and send -> command blocked
17. timer fires after order already filled -> no stale cancel side effect
18. duplicate broker event -> no duplicate business side effect
19. kill switch -> no new entries; safety exits remain policy-controlled
20. emergency mode -> risk reduction outranks price optimization
21. manual activity -> ownership/reconciliation before automated mutation
22. capability failure -> candidate disabled/redecision, not hidden aggression
```

---

## ‏10D.63 Property Tests

```text
unknown broker truth must never increase allowed exposure
invalidating a signal must never produce a new entry
reducing capability set must never create hidden aggressive fallback
adding potentially executable qty must not increase free exposure budget
Economic Price Bound must never widen without fresh economic decision
FROZEN must never emit normal entry command
EXIT_ONLY must never increase position
FLAT_CONFIRMED requires reconciled zero position and no material executable contradiction
partial fill must always produce a new decision state
manual ownership change must invalidate incompatible automation decisions
```

---

## ‏10D.64 Deterministic Replay

‏נרצה להזין:

```text
market events
signal events
broker acknowledgements
partial fills
cancel races
rejections
connection events
manual activity events
capability changes
```

‏ולדרוש:

```text
same normalized event stream
+ same config/policy versions
=> same reduced state
=> same semantic decisions
=> same command intents
```

---

## ‏10D.65 Fault Injection

```text
delayed ack
duplicate execution callback
late fill after cancel
child rejection
broker disconnect/reconnect
stale market data
position mismatch
unknown broker order
capability rejection
persistence failure
manual position change during automation
```

‏המטרה היא להוכיח safe state transitions, לא Happy Path בלבד.

---

## ‏10D.66 V1 — Core קטן בכוונה

‏V1 אינה צריכה להפעיל כל advanced order שלמדנו.

```text
System Operating Modes
10A elimination gates
single reducer
single orchestrator
single command dispatcher
reconciliation service
durable decision/command/execution log
```

### ‏Entry Behaviors ראשוניות

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Exit Modes

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

### ‏Exit Behaviors ראשוניות

```text
PASSIVE_JOIN where still legal
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

### ‏Protection בסיסית

```text
STOP_BACKSTOP
```

‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION` אינן נכנסות ל־Production רק משום שהן עשירות יותר; הן דורשות acceptance evidence ל־partial fills, ownership, reconnect ו־handoff.

---

## ‏10D.67 Decision Engine אינה Strategy

‏היא אינה מחליטה איזו מניה צפויה לעלות הכי מהר.

‏היא מקבלת Strategy Intent ושואלת:

```text
what action is legal now?
what existing risk must be handled first?
what execution constraints apply?
which behavior best expresses the current intent?
```

---

## ‏10D.68 Decision Engine אינה Capability Resolver

‏Capability Resolver עונה:

```text
which candidates are eligible in this product/route/API/account/session scope?
```

‏הוא **מסנן** Candidates; הוא אינו בוחר winner.

‏Decision Engine בוחרת רק מתוך survivors.

---

## ‏10D.69 Decision Engine אינה Broker Adapter

‏Broker Adapter אחראי ל־:

```text
concrete broker order construction
API calls
callback normalization
broker error normalization
runtime capability evidence
```

‏ה־Adapter אינו מחליט Strategy, escalation או fallback.

---

## ‏10D.70 Architecture מלאה — Orchestrator במרכז

```text
Scanner / Strategy
      ↓
Trade Intent
      ↓
Normalized Facts + Reducer ───────────────┐
      ↓                                   │
Immutable Decision Snapshot              │
      ↓                                   │
10D Orchestrator                          │
      ├── 10A Eligibility / Gates         │
      ├── 10B Entry Selection             │
      └── 10C Exit / Protection Decision  │
      ↓                                   │
Semantic Decision                         │
      ↓                                   │
Command Intent                            │
      ↓                                   │
Command Dispatcher                        │
      ↓                                   │
Broker Adapter                            │
      ↓                                   │
Broker / Venues                           │
      ↓                                   │
Normalized Events ────────────────────────┘
```

‏כך 10D אינה “אחרי” 10A/10B/10C; היא ה־authority שמחליטה מתי ואיזו מהן להפעיל.

---

## ‏10D.71 Practitioner Rules — Full Decision Engine

### ‏1. רוב הבאגים המסוכנים אינם בחירת Order Type

‏הם ownership, timing, stale state, overlap ו־duplicate side effects.

### ‏2. `NO_ACTION` היא Decision חשובה

‏מנוע טוב אינו משנה Order רק מפני שהגיע tick חדש.

### ‏3. Priority גוברת על Optimization

‏Reconciliation, Protection ו־Risk reduction קודמות ל־price improvement.

### ‏4. Event אינה הוראה

‏Event משנה Facts; Decision Engine מחליטה.

### ‏5. Timer אינה הוראה

‏Expiry מעורר re-evaluation.

### ‏6. Fallback אינה Aggression

‏Alternative יכולה להיות פחות אגרסיבית או `NO_TRADE`.

### ‏7. Decision יכולה להתיישן לפני Send

‏לכן state-version, quantity, ownership ו־capability preconditions קריטיים.

### ‏8. Flat הוא State שצריך להרוויח

‏לא Boolean מקומי.

### ‏9. Capital Reservation רואה גם Orders לא־סופיות

‏אחרת transition בין Symbols יוצר double allocation.

### ‏10. `Single Decision Authority` מפחיתה Race Conditions

‏Modules מדווחים Facts; Orchestrator אחד מחליט.

### ‏11. `Single Exit Authority` אינה מבטלת Broker Protection

‏היא מגדירה מי יוזם intentional reduction; Protection Authority ו־potentially executable Orders עדיין מנוהלות בנפרד.

### ‏12. Production Engine צריכה לדעת לומר `UNKNOWN`

‏`UNKNOWN` מוביל ל־reconciliation, degraded policy או freeze בהתאם לחומרה — לא לניחוש.

---

# ‏Checkpoint — סוף חלק 10D

‏10D מאחדת את 10A, ‏10B ו־10C תחת Orchestrator יחיד עם precedence ברור: Safety ו־Broker Truth לפני Protection, ‏Exit לפני Entry, ו־Optimization רק לאחר שכל החובות הגבוהות יותר סגורות. ‏System Operating Mode, Semantic Decision, ‏Execution Mode, ‏Behavior Candidate, ‏Exit Authority, ‏Protection Authority ו־Broker lifecycle נשארים dimensions נפרדים.

‏העיקרון המסכם: **Events משנים Facts; Reducer בונה State; Orchestrator מחליט; Dispatcher מבצע. שום callback, timer, capability failure או broker rejection אינם רשאים לעקוף את Single Decision Authority.**
