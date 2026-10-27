# ‏חלק 10D — Full Decision Engine: חיבור Gates, Entry, Exit ו־Protection למנוע אחד

> ‏מקטע עצמאי לקורס `Advanced Order Mastery`. בסוף הפרויקט הוא יאוחד חזרה למסמך הראשי.

---

## ‏10D.1 המטרה: מנוע החלטה אחד, לא שלושה מנועים נפרדים

‏אחרי `10A`, ‏`10B` ו־`10C` יש לנו שלוש שכבות שונות:

```text
10A = האם מותר לפעול ובאילו גבולות
10B = איך להיכנס אם Entry מותרת
10C = איך לנהל Position, Protection ו־Exit
```

‏הטעות הארכיטקטונית תהיה להפוך אותן לשלוש מערכות שמקבלות החלטות עצמאיות.

‏המטרה של 10D היא לבנות Orchestrator אחד:

```text
Market State
+ Signal State
+ Position State
+ Order State
+ Capability State
+ Risk State
+ System Health
→ Decision
→ Commands
→ Broker Events
→ New State
→ Decision Again
```

---

## ‏10D.2 `Decision Engine` אינה שולחת Orders ישירות

‏ה־Decision Engine מחזירה Intent תפעולי ברור, למשל:

```text
NO_ACTION
CANCEL_ENTRY
SUBMIT_ENTRY
MODIFY_ENTRY
PROTECT_POSITION
SUBMIT_EXIT
MODIFY_EXIT
CANCEL_EXIT
EMERGENCY_REDUCE
RECONCILE_ONLY
FREEZE_NEW_RISK
```

‏רק `Command Dispatcher` מתרגם את ה־Decision לפעולות Broker.

‏כך Decision נשארת deterministic וניתנת ל־replay, בעוד side effects מרוכזים במקום אחד.

---

## ‏10D.3 כלל העל: Risk Reduction גוברת על Opportunity Capture

‏כאשר קיימת התנגשות בין:

```text
new profitable-looking opportunity
```

‏לבין:

```text
unknown position
unprotected position
cancel race
broker unreconciled
exit already in flight
```

‏ה־precedence היא:

```text
resolve existing risk first
```

‏זה אינו אומר לצאת מכל Position בכל תקלה; זה אומר שאסור לקחת Risk חדש לפני שה־Risk הקיים מובן.

---

## ‏10D.4 סדר עדיפויות גלובלי

‏נגדיר precedence ראשונית:

```text
P0  CAPITAL / POSITION SAFETY
P1  BROKER TRUTH / RECONCILIATION
P2  PROTECTION OF EXISTING POSITION
P3  EXIT DECISION
P4  CANCEL / INVALIDATE STALE ENTRY
P5  ENTRY DECISION
P6  OPTIMIZATION / PRICE IMPROVEMENT
P7  RESEARCH / SHADOW EVALUATION
```

‏Priority גבוהה יותר יכולה לחסום נמוכה יותר.

---

## ‏10D.5 למה Exit מקבלת Priority גבוהה יותר מ־Entry

‏Entry היא Optional Risk.

‏Exit היא ניהול של Risk שכבר קיים.

‏לכן אם באותו Event Loop מופיעים:

```text
new BUY opportunity
+
existing position lost protection
```

‏המנוע אינו מתלבט איזו Opportunity טובה יותר. הוא קודם מטפל ב־Position הקיימת.

---

## ‏10D.6 `DecisionCycle`

‏כל מחזור החלטה עובד עקרונית כך:

```text
1. read immutable state snapshot
2. validate snapshot consistency
3. classify global operating mode
4. resolve highest-priority obligation
5. run relevant decision pipeline
6. emit semantic Decision
7. persist Decision
8. dispatch commands
9. wait for facts/events
10. repeat
```

‏אין loop פנימי ששולח שוב ושוב Orders עד Fill.

---

## ‏10D.7 Snapshot חייב להיות Immutable בתוך Decision

‏אם Quote משתנה בזמן החישוב, אין משנים את האובייקט שמתחת ל־Decision.

‏כל Decision מקבלת:

```text
snapshot_id
snapshot_ts
policy_version
market_version
broker_state_version
position_version
```

‏Market חדשה מייצרת Decision חדשה.

---

## ‏10D.8 Global Operating Modes

‏נרצה state גלובלי מפורש:

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

‏מצב גלובלי קובע איזה סוג Decisions בכלל חוקי.

---

## ‏10D.9 `BOOTING`

‏ב־Boot:

```text
no new entry
load durable state
connect broker
initialize identifiers
load configuration
start market data
```

‏אין משמעות ל־Signal טוב בזמן שהמערכת עדיין לא יודעת מה קיים אצל Broker.

---

## ‏10D.10 `RECOVERING`

‏ב־Recovery:

```text
new entries = forbidden
position-reducing actions = conditionally allowed
broker state = being reconciled
```

‏המטרה היא לעבור מ־unknown local truth ל־consistent broker truth.

---

## ‏10D.11 `READY`

‏רק כאשר:

```text
broker connected
broker reconciled
positions reconciled
market data healthy
critical capabilities valid
risk engine healthy
persistence healthy
```

‏מותר לקבל Entry חדשה.

---

## ‏10D.12 `ENTRY_DISABLED`

‏מצב שבו המערכת בריאה מספיק לניהול Positions, אך policy חוסמת Risk חדש.

‏לדוגמה:

```text
session near close
loss limit reached
capability degradation
manual risk switch
```

‏Existing Positions עדיין מנוהלות כרגיל.

---

## ‏10D.13 `EXIT_ONLY`

‏מצב חזק יותר:

```text
no new entries
no position increase
only actions that maintain or reduce exposure
```

‏זה mode טבעי בזמן Data degradation או uncertainty שאינה מצדיקה shutdown מוחלט.

---

## ‏10D.14 `EMERGENCY`

‏במצב חירום precedence משתנה:

```text
position reduction > price optimization
```

‏אבל גם Emergency אינה אומרת:

```text
send unlimited Market orders blindly
```

‏עדיין יש quantity guards, duplicate prevention, reconciliation ו־known-position bounds.

---

## ‏10D.15 `FROZEN`

‏כאשר invariant קריטי נכשל ואיננו יודעים לפעול בבטחה:

```text
new side effects = blocked
except explicitly approved safety/recovery actions
```

‏המנוע עובר ל־reconciliation/incident handling במקום להמשיך כאילו הכול תקין.

---

## ‏10D.16 סדר ההכרעה בתוך Symbol

‏לכל Symbol אפשר להשתמש ב־precedence:

```text
1. UNKNOWN / INCONSISTENT STATE?
2. POSITION EXISTS?
3. POSITION PROTECTION VALID?
4. EXIT REQUIRED?
5. ENTRY ORDER ALREADY LIVE?
6. EXISTING ENTRY STILL VALID?
7. NEW ENTRY INTENT EXISTS?
8. RUN 10A
9. RUN 10B
```

‏כך Position קיימת לעולם אינה נבלעת בתוך לוגיקת Scanner חדשה.

---

## ‏10D.17 `Position First`

‏אם:

```text
confirmed_position_qty > 0
```

‏המערכת קודם מריצה את `10C`.

‏גם אם קיימת Intent להוסיף Position, ההחלטה על הגדלה מגיעה רק אחרי שה־Position הנוכחית, ה־Protection וה־Exit ownership עקביים.

---

## ‏10D.18 Entry חדשה בזמן Position קיימת היא Intent מסוג אחר

‏הגדלת Position אינה אותו use case כמו Entry מ־Flat.

‏נבדיל:

```text
OPEN_NEW_POSITION
ADD_TO_POSITION
REENTER_AFTER_EXIT
```

‏כל אחד יכול לקבל thresholds ו־Risk Policy שונים.

---

## ‏10D.19 `Flat` חייב להיות `FLAT_CONFIRMED`

‏המנוע אינו מסתפק ב־:

```text
local_position_qty == 0
```

‏לפני Entry חדשה לאחר Exit נרצה לוודא שאין:

```text
live exit order
cancel-pending exit
unknown broker order
late execution not yet reconciled
```

‏רק אז:

```text
position_state = FLAT_CONFIRMED
```

---

## ‏10D.20 Event אינו Command Trigger אוטומטי

‏Anti-pattern:

```text
onPartialFill -> immediately submit remainder
```

‏נכון יותר:

```text
onPartialFill
→ normalize fact
→ persist fact
→ reduce state
→ rerun decision engine
```

‏ה־Decision החדשה יכולה לבחור retry, cancel, hold, protect או exit.

---

## ‏10D.21 כל Event מה־Broker מעורר Re-evaluation

‏אירועים רלוונטיים:

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
```

‏אבל re-evaluation אינה בהכרח side effect חדש. לעיתים התוצאה היא `NO_ACTION`.

---

## ‏10D.22 Market Event גם יכול לעורר Decision

‏למשל:

```text
signal reversal
quote deterioration
spread expansion
hard cap crossed
market data stale
signal expiry
```

‏אבל נרצה coalescing/debounce במקומות המתאימים כדי לא לייצר decision storm על כל tick חסר משמעות.

---

## ‏10D.23 `Decision Trigger` ו־`Decision Reason`

‏נשמור בנפרד:

```text
trigger = BROKER_FILL
reason = POSITION_CHANGED
```

‏או:

```text
trigger = MARKET_UPDATE
reason = ENTRY_EDGE_DECAYED
```

‏כך telemetry יכולה להראות אילו events באמת גורמות לשינויי execution.

---

## ‏10D.24 Priority Queue של Obligations

‏במקום שכל module שולח command, אפשר לייצר Obligations:

```text
RECONCILE_BROKER
PROTECT_POSITION
REDUCE_EXPOSURE
CANCEL_STALE_ENTRY
MAINTAIN_VALID_EXIT
OPEN_NEW_POSITION
IMPROVE_EXECUTION
```

‏ה־Orchestrator מטפל קודם ב־obligation בעלת priority הגבוהה ביותר.

---

## ‏10D.25 Obligation אחת יכולה לדכא אחרת

‏לדוגמה:

```text
PROTECT_POSITION
```

‏מדכאת זמנית:

```text
OPEN_NEW_POSITION
```

‏עד שה־Protection חוזרת למצב תקין.

---

## ‏10D.26 `NO_ACTION` היא Decision חוקית

‏אם המצב תקין ואין הצדקה לשינוי:

```text
NO_ACTION
```

‏עדיף בהרבה על מנוע שמרגיש צורך לעשות Modify בכל update.

‏יציבות היא תכונה מקצועית.

---

## ‏10D.27 `Hold` הוא מצב מפורש ב־Exit

‏כאשר יש Position, `HOLD` אינו absence of decision.

‏הוא אומר:

```text
position remains valid
protection is acceptable
no exit condition currently dominates
```

‏וכדאי לשמור את ה־reason שבגללו Hold עדיין חוקית.

---

## ‏10D.28 Re-evaluation Clock

‏חלק מה־Decisions צריכות expiry גם אם אין Event חדש.

‏לכן Output יכולה לכלול:

```text
reevaluate_at_monotonic
```

‏למשל Passive Entry שמותר להשאיר רק 200ms.

---

## ‏10D.29 Timers אינם Commands

‏Timer expiry לא אומר:

```text
cancel immediately
```

‏אלא:

```text
timer expired
→ decision trigger
→ evaluate current state
```

‏ייתכן שה־Order כבר התמלאה, Signal השתנתה או Market חדשה מצדיקה Behavior אחר.

---

## ‏10D.30 Decision Precedence לדוגמה

```text
if global_mode == FROZEN:
    return recovery_or_safety_only

if broker_truth_unknown:
    return RECONCILE_ONLY

if position_exists:
    if protection_invalid:
        return PROTECT_POSITION
    if emergency_exit_required:
        return EMERGENCY_REDUCE
    if fast_exit_required:
        return FAST_EXIT
    if normal_exit_required:
        return NORMAL_EXIT

if stale_entry_exists:
    return CANCEL_ENTRY

if new_entry_intent_exists:
    envelope = run_10A()
    if envelope.permission == ALLOW_ENTRY:
        return run_10B(envelope)

return NO_ACTION
```

‏זה skeleton; המימוש בפועל צריך לעבוד עם state machine ולא עם כמה `if` מפוזרים.

---

## ‏10D.31 Entry Plan אינה Side Effect עד Commit Point פנימי

‏נרצה flow:

```text
decision created
→ invariants checked
→ command intent persisted
→ side effect dispatched
```

‏כך crash בין Decision לשליחה ניתן לשחזור.

---

## ‏10D.32 `CommandIntent` מוצע

```text
CommandIntent {
  command_id
  decision_id
  internal_order_id
  command_type
  expected_effect
  max_qty
  price_boundary
  expires_at
  preconditions
  state_version
}
```

‏Dispatcher שולח command רק אם preconditions עדיין תקפים.

---

## ‏10D.33 Precondition Check רגע לפני Send

‏גם אם Decision התקבלה לפני 15ms, ייתכן שכבר הגיע Fill חדש.

‏לכן לפני side effect:

```text
is state_version still current?
is qty budget still valid?
is decision not expired?
is global mode still compatible?
```

‏אם לא — command נזרקת וחוזרים ל־Decision חדשה.

---

## ‏10D.34 זה מונע `Stale Decision Execution`

‏תרחיש:

```text
Decision says BUY 100
before send: old order fills 60
```

‏בלי precondition check נוכל להגיע ל־160.

‏עם version/quantity guard, command הישנה אינה נשלחת.

---

## ‏10D.35 Rejection Pipeline

‏Broker rejection עוברת:

```text
classify rejection
→ update broker/order state
→ update capability state if relevant
→ update risk state if relevant
→ rerun decision
```

‏אין `onReject -> send fallback` ישיר.

---

## ‏10D.36 Failure Classes

‏לפחות:

```text
CAPABILITY_FAILURE
VALIDATION_FAILURE
PRICE_INCREMENT_FAILURE
TEMPORARY_PROCESSING_FAILURE
CONNECTIVITY_FAILURE
ROUTE_FAILURE
ORDER_ALREADY_TERMINAL
UNKNOWN_FAILURE
```

‏לכל class fallback policy שונה.

---

## ‏10D.37 Fallback אינה Escalation

‏אם `MIDPRICE` אינה זמינה, fallback יכולה להיות Passive Limit — כלומר **פחות** אגרסיבית.

‏המילה fallback פירושה Alternative Implementation, לא בהכרח "תשלם יותר".

---

## ‏10D.38 Escalation דורשת אישור Economics מחדש

‏מעבר:

```text
PASSIVE -> ADAPTIVE -> IOC
```

‏מותר רק אם כל שלב חדש עבר שוב:

```text
signal validity
remaining edge
remaining life
position/exposure state
hard cap
exit feasibility
```

---

## ‏10D.39 Escalation Budget גלובלי ל־Intent

‏נשמור:

```text
attempt_count
total_elapsed_ms
cumulative_price_concession
cancel_replace_count
broker_algo_count
```

‏כל Decision חדשה רואה את התקציב שכבר נצרך.

---

## ‏10D.40 `Opportunity Supersession`

‏כאשר Scanner מוצא מניה טובה יותר:

```text
new opportunity does not erase old execution risk
```

‏Flow נכון:

```text
mark old intent SUPERSEDED
cancel old entry if needed
reconcile late fills
protect/exit any resulting position
release confirmed capital
then evaluate new opportunity
```

---

## ‏10D.41 Capital Allocation היא State, לא חישוב רגעי

‏נשמור:

```text
confirmed_cash_available
reserved_for_live_orders
reserved_for_cancel_pending_orders
reserved_for_unknown_orders
capital_locked_in_positions
```

‏כך "כל ההון למניה המובילה" אינו יוצר double allocation בזמן מעבר בין Symbols.

---

## ‏10D.42 Cross-Symbol Arbitration

‏אם כמה Symbols כשירות יחד, arbitration מגיעה **אחרי** שכל אחת עברה Gates.

‏ה־Scanner יכול לבחור את Opportunity המועדפת, אבל Execution Engine עדיין בודקת:

```text
capital available?
old exposure released?
new symbol exit feasible?
```

‏בחירה יחסית בין מניות אינה עוקפת Safety Gates.

---

## ‏10D.43 אין `Score` גלובלי גם בשכבת Arbitration

‏אפשר להשתמש בדירוג Strategy כדי לבחור Opportunity, אך predicates של Risk/Execution אינן נכנסות למשחק סכימה שמאפשר למניה חזקה "לפצות" על state מסוכן.

‏Flow:

```text
filter eligible
then rank survivors
```

‏ולא:

```text
rank everything
then hope top candidate is safe
```

---

## ‏10D.44 Position Protection ו־Exit Ownership משתלבים ב־Orchestrator

‏אם Broker Stop חיה והמנוע רוצה Dynamic Exit:

```text
10C defines handoff protocol
10D decides when handoff is allowed
```

‏Orchestrator אינה שולחת Exit חדשה לפני ש־ownership rules מאפשרות זאת.

---

## ‏10D.45 `EXIT_OWNER`

‏נחזיק state מפורש:

```text
BROKER_PROTECTION
LOCAL_DYNAMIC_EXIT
HANDOFF_TO_LOCAL
HANDOFF_TO_BROKER
EMERGENCY_CONTROLLER
NONE_FLAT
UNKNOWN
```

‏`UNKNOWN` חוסמת כל פעולה שעלולה ליצור double exit עד reconciliation.

---

## ‏10D.46 Handoff היא Transaction לוגית

‏מעבר Broker → Local יכול להיות:

```text
1. decide local exit required
2. compute potentially executable broker protection
3. cancel/resize protection as policy requires
4. treat pending-cancel as still executable
5. submit only safe local qty
6. reconcile fills from both paths
7. confirm final position
```

‏הפרטים תלויים Mode, אבל לעולם אין assumption שה־Stop "כבר לא קיימת" רק כי ביקשנו לבטל.

---

## ‏10D.47 `Emergency` יכולה לשנות Handoff Policy

‏במצב רגיל אפשר לחכות יותר ל־cancel confirmation.

‏במצב Emergency ייתכן שה־Risk Policy תאפשר overlap מוגבל ומחושב, אבל רק תחת bound מפורש:

```text
worst_case_exit_fill <= known_position + allowed_emergency_tolerance
```

‏זו capability מתקדמת, לא V1 default.

---

## ‏10D.48 Reconciliation יכולה לקטוע כל Decision

‏אם במהלך Decision cycle מתגלה mismatch:

```text
position mismatch
unknown order
execution correction
broker reconnect
```

‏ה־current plan מתבטלת ומצב עובר ל־reconciliation.

‏Correctness גוברת על completion של Plan קודמת.

---

## ‏10D.49 `Decision Invalidation`

‏לכל Decision יהיו conditions שמבטלות אותה לפני send או במהלך working state:

```text
signal invalidated
hard cap violated
state revision changed
position changed
capability changed
system mode changed
market data stale
```

‏זה עדיף מ־Decision שחיה עד timeout בלבד.

---

## ‏10D.50 Full Decision Matrix

| Global/Position State | Signal | Protection | Action Class |
|---|---|---|---|
| `RECOVERING` | כל מצב | לא ידוע | `RECONCILE_ONLY` |
| `FROZEN` | כל מצב | כל מצב | Safety/Recovery בלבד |
| `READY`, Flat | אין Signal | N/A | `NO_ACTION` |
| `READY`, Flat | Signal תקף | N/A | `10A -> 10B` |
| Flat + stale live entry | Signal מת | N/A | `CANCEL_ENTRY` |
| Position קיימת | Signal חיובי | תקינה | `HOLD` או Add Policy נפרדת |
| Position קיימת | weakening | תקינה | `NORMAL_EXIT` candidate |
| Position קיימת | reversal | תקינה | `FAST_EXIT` candidate |
| Position קיימת | emergency risk | כל מצב | `EMERGENCY_REDUCE` |
| Position קיימת | כל Signal | protection חסרה | `PROTECT_POSITION` לפני Entry חדשה |
| Position קיימת | כל מצב | ownership unknown | `RECONCILE_ONLY` |
| `EXIT_ONLY` | Signal Entry חדש | N/A | Reject Entry |
| `ENTRY_DISABLED` | Signal Entry חדש | N/A | Reject Entry |

---

## ‏10D.51 מטריצת Entry Behavior בתוך ה־Engine

| Context | Behavior candidates |
|---|---|
| ‏Spread צר + urgency גבוהה | `MARKETABLE_LIMIT_IOC`, `ADAPTIVE_URGENT` |
| ‏Spread רחב + זמן קיים | `MIDPRICE`, `SNAP_MIDPOINT`, Passive |
| ‏Passive intent + Quotes זזות | `RELATIVE_PRIMARY` |
| ‏Passive בלבד | `POST_ONLY` אם capability מאומתת |
| ‏Signal כמעט פג | `IOC` או `NO_TRADE` |
| ‏Depth חלשה | Size reduction / partial policy / `NO_TRADE` |

‏ה־matrix אינה עוקפת 10A; היא מופעלת רק אחרי Gates.

---

## ‏10D.52 מטריצת Exit Behavior בתוך ה־Engine

| Exit State | Behavior candidate |
|---|---|
| ‏Signal נחלש אבל Risk נשלט | `NORMAL_EXIT` |
| ‏Reversal ברור / time budget קצר | `FAST_EXIT` |
| ‏Risk חריג / protection failure | `EMERGENCY_REDUCE` |
| ‏Process survivability נדרשת | `STOP_BACKSTOP` |
| ‏Static broker-managed plan מתאים | `BROKER_BRACKET` |
| ‏Dynamic exit + broker backstop | `HYBRID_PROTECTION` |

‏הבחירה תמיד מתייחסת ל־actual position ול־potentially executable exits.

---

## ‏10D.53 Pseudocode מלא — Top Level

```text
function decide(snapshot):
    validate_snapshot(snapshot)

    mode = classify_global_mode(snapshot)

    if mode == FROZEN:
        return decide_frozen_actions(snapshot)

    if requires_reconciliation(snapshot):
        return RECONCILE_ONLY

    if snapshot.position.exists:
        exit_decision = run_exit_pipeline(snapshot)
        if exit_decision.requires_action:
            return exit_decision

    stale_entry_action = evaluate_existing_entry(snapshot)
    if stale_entry_action.requires_action:
        return stale_entry_action

    if mode not in [READY]:
        return NO_ACTION

    if not snapshot.intent.new_entry:
        return NO_ACTION

    envelope = run_10A(snapshot)

    if envelope.permission != ALLOW_ENTRY:
        return map_permission_to_decision(envelope)

    return run_10B(snapshot, envelope)
```

---

## ‏10D.54 Pseudocode — Exit Pipeline

```text
function run_exit_pipeline(snapshot):
    if exit_ownership_unknown(snapshot):
        return RECONCILE_ONLY

    if protection_missing(snapshot):
        return PROTECT_POSITION

    if emergency_condition(snapshot):
        return plan_emergency_reduce(snapshot)

    if fast_exit_condition(snapshot):
        return plan_fast_exit(snapshot)

    if normal_exit_condition(snapshot):
        return plan_normal_exit(snapshot)

    return HOLD
```

---

## ‏10D.55 Pseudocode — Existing Entry

```text
function evaluate_existing_entry(snapshot):
    if no_live_entry(snapshot):
        return NO_ACTION

    if signal_invalid(snapshot):
        return CANCEL_ENTRY

    if entry_constraints_violated(snapshot):
        return CANCEL_ENTRY

    if ttl_expired(snapshot):
        return REEVALUATE_ENTRY

    return KEEP_ENTRY
```

‏`REEVALUATE_ENTRY` אינה `MODIFY_ENTRY` אוטומטית; היא חוזרת ל־10A/10B.

---

## ‏10D.56 Pseudocode — Command Guard

```text
function dispatch(command_intent, latest_state):
    if command_intent.expired:
        reject_locally(STALE_DECISION)

    if command_intent.state_version != latest_state.version:
        reject_locally(STATE_CHANGED)

    if violates_quantity_budget(command_intent, latest_state):
        reject_locally(EXPOSURE_CHANGED)

    persist_command_intent(command_intent)
    send_to_broker(command_intent)
```

---

## ‏10D.57 Invariants גלובליים

```text
never increase risk while broker truth is unknown
never apply the same execution twice
never assume pending cancel is dead
never submit entry beyond current exposure budget
never submit exit beyond safe position/ownership bounds
never allow hard price boundary to widen implicitly
never let expired signal create new entry
never let capability failure auto-escalate aggression
never call FLAT until broker/execution state is reconciled
```

---

## ‏10D.58 Invariant של `Single Decision Authority`

‏Scanner, Broker Adapter, Timer ו־Risk Monitor יכולים לייצר Events.

‏רק Decision Engine מייצרת semantic action.

‏כך נמנע:

```text
Timer sends cancel
Broker callback sends replacement
Scanner sends new entry
Risk module sends exit
```

‏במקביל ללא תיאום.

---

## ‏10D.59 Invariant של `Single Exit Authority`

‏בכל רגע:

```text
exactly one authority controls intentional position reduction
```

‏Broker protection יכולה עדיין להיות physically executable בזמן handoff, ולכן state יכולה להיות transitional — אבל intentional ownership נשאר מפורש.

---

## ‏10D.60 Invariant של `No Hidden Escalation`

‏שינוי מ־Passive ל־Aggressive, הגדלת Size, הרחבת Cap או החלפת TIF למיידית חייבים להופיע ב־Decision Trace כבחירה חדשה.

‏אסור שהם להתרחש בתוך Adapter או error handler בלי Decision חדשה.

---

## ‏10D.61 Decision Trace מלאה

```text
DecisionTrace {
  decision_id
  parent_decision_id
  trigger
  reason
  snapshot_id
  policy_version
  global_mode
  obligations_considered
  gates
  candidates
  selected_action
  selected_behavior
  constraints
  rejected_alternatives
  command_ids
  expires_at
}
```

‏כך אפשר לחקור שרשרת של Decisions, לא רק Order בודדת.

---

## ‏10D.62 Parent Decision ID

‏Fallback או re-evaluation יכולה להיות מקושרת ל־Decision הקודמת:

```text
D101 passive entry
D102 cancel after TTL, parent=D101
D103 IOC retry after fresh gates, parent=D102
```

‏זה מאפשר לראות אם execution הידרדרה דרך יותר מדי שלבים לפני Fill.

---

## ‏10D.63 Decision Outcome

‏לאחר שה־lifecycle מתקדם נשמור Outcome:

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

‏ומקשרים אותו ל־Decision שהולידה את ה־Command.

---

## ‏10D.64 Metrics ברמת Decision Engine

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
NO_ACTION rate
NO_TRADE rate
```

‏יותר Decisions אינן בהכרח טובות יותר; churn הוא משהו שצריך למדוד.

---

## ‏10D.65 Metrics של Quality

```text
net_edge_by_selected_behavior
missed_move_by_NO_TRADE_reason
fill_quality_by_entry_regime
exit_quality_by_exit_mode
unprotected_time_ms
late_fill_incidents
double_exit_prevented_count
state_mismatch_incidents
recovery_time_ms
```

‏כך Decision Engine נמדדת גם בכלכלה וגם ב־correctness.

---

## ‏10D.66 Acceptance Tests — Orchestrator

```text
1. healthy flat + valid signal -> 10A then 10B
2. expired signal -> no entry
3. open position + new signal -> exit/protection precedence first
4. unprotected position -> protection before new risk
5. broker unreconciled -> reconcile only
6. stale entry -> cancel before replacement
7. partial entry fill -> protect position + re-evaluate remainder
8. IOC zero fill -> fresh re-decision, no blind retry
9. broker reject -> capability/reason update, no direct fallback
10. cancel pending old entry blocks unsafe new entry
11. superseded symbol waits for safe capital release
12. dynamic exit with broker stop follows ownership handoff
13. late stop fill during local exit is reconciled
14. connection loss during entry -> freeze new risk
15. reconnect with live orders -> recovery before READY
16. state changes between decision and send -> command blocked
17. timer fires after order already filled -> no stale cancel side effect
18. duplicate broker event -> no duplicate decision side effect
19. kill switch -> no new entries, exits still allowed by policy
20. emergency mode -> risk reduction outranks price improvement
```

---

## ‏10D.67 Property Tests

```text
unknown broker truth must never increase allowed exposure
invalidating a signal must never produce a new entry
reducing capability set must never create hidden aggressive fallback
increasing confirmed position must not increase allowed new entry qty under fixed limit
adding pending-cancel qty must not increase free exposure budget
hard cap must never widen without a new economic decision
FROZEN mode must never emit normal entry command
EXIT_ONLY mode must never increase position
FLAT_CONFIRMED requires no potentially executable exit/entry contradiction
```

---

## ‏10D.68 Simulation / Replay Test

‏נרצה להזין stream היסטורי של:

```text
market events
signal events
broker acknowledgements
partial fills
cancel races
rejections
connection events
```

‏ולדרוש:

```text
same event stream + same config
=> same decisions + same command intents
```

‏זה תנאי חשוב ליכולת לבצע RCA אמיתי.

---

## ‏10D.69 Fault Injection

‏לפני Production נרצה להזריק בכוונה:

```text
delayed ack
duplicate fill callback
out-of-order-like observations
lost connection
late fill after cancel
rejected child
stale market data
position mismatch
capability rejection
persistence failure
```

‏ולוודא שהמנוע נכנס ל־safe state במקום לאלתר.

---

## ‏10D.70 V1 — מה באמת צריך לממש קודם

‏למרות כל העומק, V1 יכולה להיות פשוטה יחסית אם נשמור את הגבולות הנכונים:

```text
Global modes
10A gates
4 entry behaviors
3 exit modes
broker stop backstop
single state reducer
single command dispatcher
reconciliation service
durable decision/command/execution log
```

‏לא צריך לממש כל Order Type ביום הראשון.

---

## ‏10D.71 V1 Entry Behaviors

‏כמו ב־10B:

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏מספיקות כדי להשוות ארבע פילוסופיות שונות בלי להעמיס יותר מדי complexity.

---

## ‏10D.72 V1 Exit Behaviors

```text
NORMAL_EXIT_CAPPED
FAST_EXIT_CAPPED
EMERGENCY_REDUCE
STOP_BACKSTOP
```

‏עם Hybrid רק לאחר שה־handoff tests מוכחים.

---

## ‏10D.73 למה `Bracket` לא חייבת להיות V1 למרות החשיבות שלה

‏Bracket היא capability חשובה מאוד להגנה, אבל אם partial-fill semantics, reconnect ו־ownership עדיין לא עברו acceptance tests, עדיף לא להכניס אותה ל־Production רק משום שהיא עשירה יותר.

‏אפשר להתחיל ב־protective Stop ברורה ופשוטה יותר ולפתח Bracket/Hybrid לאחר שה־state machine יציבה.

---

## ‏10D.74 Decision Engine אינה Strategy

‏המנוע אינו מחליט איזו מניה צפויה לעלות הכי מהר.

‏הוא מחליט:

```text
Given this strategy intent,
what execution risk is allowed,
what action is legal now,
and which execution behavior best expresses the intent?
```

‏ההפרדה הזו מאפשרת להחליף Scanner בלי לשכתב Broker lifecycle.

---

## ‏10D.75 Decision Engine אינה Broker Adapter

‏היא גם אינה יודעת איך בדיוק IBKR מייצגת כל field.

‏ה־Adapter אחראי ל־:

```text
IBKR order construction
API calls
callbacks
error normalization
capability discovery
```

‏וה־Decision Engine פועלת בשפה עסקית של Execution.

---

## ‏10D.76 Architecture מלאה

```text
Scanner / Strategy
      ↓
Trade Intent
      ↓
Decision Context Builder
      ↓
10A Eligibility + Gates
      ↓
10B Entry Selector / 10C Exit Selector
      ↓
10D Orchestrator + Precedence
      ↓
Semantic Decision
      ↓
Command Intent
      ↓
Command Dispatcher
      ↓
IBKR Adapter
      ↓
Broker / Venues
      ↓
Normalized Events
      ↓
Event Store + Reducer
      ↓
Position / Order / Risk State
      └──────────────→ Decision Context Builder
```

‏זו הלולאה השלמה.

---

## ‏10D.77 Practitioner Secrets — Full Decision Engine

### ‏1. רוב הבאגים המסוכנים אינם בחירת Order Type

‏הם Ownership, timing, stale state ו־duplicate side effects.

### ‏2. `NO_ACTION` היא אחת ההחלטות החשובות ביותר

‏מנוע טוב אינו משנה Orders רק כי הגיע tick חדש.

### ‏3. Priority גוברת על Optimization

‏Protection ו־Reconciliation באות לפני price improvement.

### ‏4. Event אינה הוראה

‏Event משנה Facts; Decision Engine מחליטה מה לעשות עם העובדות החדשות.

### ‏5. Timer אינה הוראה

‏Expiry מעורר re-evaluation, לא side effect עיוור.

### ‏6. Fallback אינה בהכרח Aggression

‏Alternative יכולה להיות פחות אגרסיבית או `NO_TRADE`.

### ‏7. Decision יכולה להתיישן לפני Send

‏לכן state-version precondition היא guard קריטי.

### ‏8. Flat היא עובדה שדורשת Reconciliation

‏לא ערך Boolean שמישהו בקוד איפס.

### ‏9. Capital Reservation חייבת לראות Orders לא־סופיות

‏אחרת מעבר מהיר בין מניות יוצר double allocation.

### ‏10. Single Decision Authority מפחיתה Race Conditions

‏Modules מדווחים Facts; Orchestrator אחד מחליט.

### ‏11. Complexity צריכה להיכנס רק עם Evidence

‏State Machine טובה עם ארבע Behaviors עדיפה על עשרים Order Types שלא ניתן להסביר או לשחזר.

### ‏12. Production Engine היא מערכת שמצליחה גם כאשר היא אינה יודעת

‏`UNKNOWN` מוביל ל־reconciliation/freeze, לא לניחוש.

---

# ‏Checkpoint — סוף חלק 10D

‏ב־10D חיברנו את `10A`, ‏`10B` ו־`10C` למנוע החלטה אחד: Global Operating Modes, precedence של Risk/Recovery/Protection/Exit/Entry, immutable snapshots, semantic Decisions, command preconditions, re-evaluation במקום blind retry, capital reservation, cross-symbol arbitration, exit ownership, decision traces, pseudocode, matrices, invariants, acceptance tests ו־fault injection.

‏העיקרון המרכזי הוא: **Event משנה את המציאות; Reducer מעדכן State; Decision Engine מחליטה; Dispatcher מבצע. אף שכבה אחרת אינה שולחת fallback או escalation באופן עצמאי.**

‏עם החלק הזה, חלק 10 הושלם מבחינת התכנון המקצועי. השלב הבא בפרויקט יהיה `Final Full-Course Review` בקובץ נפרד: מעבר שיטתי על הקורס כולו כדי לזהות חוסרים, כפילויות, הסברים לא ברורים, מקומות שחסר בהם `Why / When / Why Not`, השוואות שחסרות ודוגמאות שצריך להוסיף לפני האיחוד הסופי.
