# ‏חלק 8C — Bracket, OCA/OCO & Protection Deep Safety

> ‏הפרק הזה משלים את `08B-FAILURE-CONTRACTS-AND-ORDER-SURVIVABILITY.md` עבור families שבהן הסיכון אינו Order בודדת אלא **גרף של Orders, protected quantity ו־coordination שאינה אטומית**. הוא אינו מוסיף Strategy חדשה ואינו מניח Broker semantics שלא אומתו. מטרתו היא לקבוע מה חייב להיות מוכח לפני שמערכת יכולה להתייחס ל־Bracket/OCA כ־Protection אמינה.

---

## ‏8C.1 ארבעת ה־invariants שעליהם כל הפרק נשען

```text
UNTRANSMITTED != PROTECTED

MUTUAL-CANCEL INTENT != ATOMIC EXECUTION GUARANTEE

PROTECTED QUANTITY MUST BE DERIVED FROM RECONCILED POSITION

PARENT PARTIAL-FILL CHILD SEMANTICS = ACCEPTANCE TEST REQUIRED
```

‏כל אחד מארבעת המשפטים האלה הוא boundary של Production Safety, לא הערת שוליים.

---

## ‏8C.2 Bracket היא Protection Graph

‏Bracket אינה שלוש Orders נפרדות שהמנוע יכול לשחזר לפי IDs בלבד.

```text
Parent Entry
├── Profit-Taker Child
└── Protective-Stop Child
```

‏ה־state האמיתי כולל לפחות:

```text
parent requested qty
parent filled qty
parent remaining qty
parent lifecycle

profit child lifecycle
profit child executable qty
profit child filled qty

stop child lifecycle
stop child executable qty
stop child filled qty

reconciled_position
protected_qty
potentially_executable_exit_qty
coordination / sibling state
transmit / residency evidence
ownership evidence
```

> ‏`ENGINE RULE` — Recovery של Bracket היא `Protection Graph Recovery`, לא `reload order IDs`.

---

## ‏8C.3 `UNTRANSMITTED != PROTECTED`

‏`Transmit=false` יכולה להיות חלק מ־construction sequence שימושי, אבל היא אינה הוכחה שההגנה קיימת אצל Broker server.

‏בזמן staging אפשר לקבל מצב כגון:

```text
Parent created locally
Take-Profit child created locally
Protective child not yet transmitted
```

‏אם process/TWS/session נעלמים לפני ה־final transmit, אסור למערכת לדווח:

```text
position_is_protected = true
```

‏רק evidence שה־protective path התקבלה במקום שבו היא אמורה לחיות מאפשרת לעבור ל־protected state.

> ‏`ENGINE INVARIANT` — `Transmit sequence complete locally` אינה שקולה ל־`Protection accepted remotely`.

---

## ‏8C.4 Protection Coverage State

‏נשתמש ב־state מפורש במקום boolean גס:

```text
ProtectionCoverageState =
  NO_POSITION
  UNPROTECTED
  PARTIALLY_PROTECTED
  FULLY_PROTECTED_VERIFIED
  OVER_PROTECTED_RISK
  UNKNOWN_PROTECTION
```

‏המעבר ל־`FULLY_PROTECTED_VERIFIED` דורש לפחות:

```text
reconciled_position known
protective order identity known
protective order potentially executable for required qty
residency / activation semantics verified enough for current path
no conflicting unknown exit/protection exposure
```

‏אם אחד מהם חסר, אסור לשדר certainty מזויפת.

---

## ‏8C.5 Protected Quantity אינה Parent Requested Quantity

‏ה־quantity שיש להגן עליה היא Position שנוצרה בפועל.

```text
protected_target_qty
= abs(reconciled_position)
```

‏לא:

```text
original_parent_qty
```

‏ולא:

```text
last_local_remaining_qty
```

‏כאשר קיימות Exit/Protection Orders נוספות, צריך לחשב גם:

```text
potentially_executable_exit_qty
```

‏כדי לזהות גם under-protection וגם over-exit risk.

---

## ‏8C.6 Parent Partial Fill — אסור לנחש Child semantics

> ‏`ACCEPTANCE TEST REQUIRED`

‏כאשר Parent מתמלאת חלקית, אסור לקורס או למנוע להניח באופן אוניברסלי:

```text
children activate immediately for filled qty
```

‏או:

```text
children remain inactive until parent full fill
```

‏או:

```text
broker automatically resizes every child exactly as we expect
```

‏ההתנהגות חייבת להיבדק עבור ה־scope המדויק:

```text
adapter / API
product
route / destination
account / legal entity
session
exact bracket parameter combination
```

‏Production acceptance צריכה להוכיח לפחות:

```text
when each child becomes active
what executable child quantity appears after first parent partial fill
whether quantity changes after additional parent fills
whether both children resize consistently
what happens after child modify
what happens during reconnect
what happens if parent is cancelled after partial fill
what happens if a child rejects while position already exists
```

> ‏`ENGINE RULE` — עד שה־acceptance evidence קיימת, parent partial fill מובילה ל־`UNKNOWN_PROTECTION` או `PARTIALLY_PROTECTED` לפי evidence בפועל, לא להנחת coverage.

---

## ‏8C.7 Parent Partial Fill יוצר שתי בעיות שונות

‏Partial Fill של Parent משנה בו־זמנית:

```text
POSITION TRUTH
+
PROTECTION REQUIREMENT
```

‏לכן flow בטוח הוא:

```text
parent partial execution observed
→ ingest execution
→ recompute execution_ledger_position
→ reconcile broker_reported_position
→ derive reconciled_position
→ observe actual child lifecycle + qty
→ compute ProtectionCoverageState
→ block/restrict new risk if protection insufficient
→ fresh decision on parent remainder
```

‏אסור לבצע:

```text
parent remaining qty
→ blindly continue previous entry order
```

‏לפני שבדקנו שה־Position שכבר נוצרה מקבלת Protection מספקת.

---

## ‏8C.8 Parent Cancel אחרי Partial Fill

‏כאשר Parent כבר יצרה Position חלקית ואז מבטלים את remainder:

```text
cancel parent remainder
!=
cancel existing position
!=
cancel protection need
```

‏צריך להפריד:

```text
entry intent for remaining qty
existing actual position
children / protection for actual position
```

‏ה־Parent יכולה להגיע ל־terminal cancelled state כאשר עדיין קיימת Position שמחייבת Protection.

> ‏`ENGINE INVARIANT` — Parent terminal state אינה terminal state של ה־Protection Graph.

---

## ‏8C.9 Child Reject לאחר Entry Fill

‏זהו failure חמור יותר מ־Entry candidate reject רגיל.

```text
position exists
+
expected protective child rejected
```

‏התגובה אינה:

```text
try same bracket again later
```

‏אלא:

```text
ProtectionCoverageState = UNPROTECTED or PARTIALLY_PROTECTED
→ system mode becomes EXIT_ONLY / EMERGENCY according to risk policy
→ reconcile current orders
→ fresh protection / exit decision
```

‏Reason family אופיינית:

```text
RISK_PROTECTION_INSUFFICIENT
MATERIALIZATION_PROTECTIVE_CHILD_REJECTED
STATE_PROTECTION_GRAPH_INCONSISTENT
```

---

## ‏8C.10 OCA/OCO — Coordination, לא Transaction

```text
mutual-cancel / quantity-reduction intent
!=
atomic execution guarantee
```

‏OCA/OCO אינן מבטיחות שהשוק יראה רק member אחת executable בכל micro-instant.

‏לכן Risk Model חייב להניח שכל member non-terminal עדיין יכולה להשפיע על Position.

---

## ‏8C.11 OCA/OCO Non-Atomic Race Matrix

| Race | מה יכול לקרות | מה אסור להניח | Required response |
|---|---|---|---|
| `A fills` בזמן cancel של `B` in-flight | `B` עדיין יכולה לבצע | ‏`A filled => B gone` | reconcile both members + position |
| `A partial fills`, `B` עדיין working | שתי members עדיין רלוונטיות | ‏partial fill בחרה winner סופי | recompute group qty + worst-case exposure |
| `B triggers` לפני sibling cancel | post-trigger execution יכולה להתחיל | ‏trigger blocked by sibling intent | reconcile trigger + executions + sibling state |
| timeout אחרי first fill | local winner ידוע חלקית בלבד | ‏timeout means sibling cancelled | `UNKNOWN` + group reconciliation |
| sibling cancel rejected/delayed | member נשארת potentially executable | ‏cancel request removed risk | keep member in risk budget |
| manual modify/cancel | group assumptions השתנו | ‏local OCA model still authoritative | ownership invalidated + recovery |
| both members fill | over-exit / position flip אפשריים | ‏OCO prevents double fill by definition | reconcile actual position, then emergency repair if needed |

> ‏`ENGINE RULE` — OCA/OCO safety נמדדת לפי worst-case **concurrent executable exposure**, לא לפי intended winner.

---

## ‏8C.12 Group Exposure Budget

‏ל־OCA/OCO/Bracket exits צריך לחשב לפחות:

```text
group_potentially_executable_exit_qty
= sum(worst_case_executable_qty(member)
      for every non-terminal member)
```

‏השוואה בסיסית:

```text
position_qty = abs(reconciled_position)
```

‏ואז:

```text
group_potentially_executable_exit_qty < position_qty
→ under-protection / under-exit capacity may exist

group_potentially_executable_exit_qty == position_qty
→ quantity-balanced only if ownership/activation semantics also valid

group_potentially_executable_exit_qty > position_qty
→ over-exit / position-flip risk exists
```

‏השוואת quantities לבדה אינה מוכיחה Protection תקינה; היא רק risk invariant אחד.

---

## ‏8C.13 Protected Quantity Invariants

```text
INVARIANT A
protected_target_qty = abs(reconciled_position)

INVARIANT B
untransmitted qty contributes 0 to verified protected qty

INVARIANT C
unknown child state cannot count as guaranteed protection

INVARIANT D
cancel-pending / cancel-unknown exit remains in potentially executable exit qty

INVARIANT E
verified protective qty must not intentionally exceed position qty unless an explicit, separately bounded transition protocol authorizes temporary overlap

INVARIANT F
partial fill forces recomputation before any new protection/exit side effect
```

‏`INVARIANT E` אינו אומר ש־overlap לעולם לא יכול להתרחש; הוא אומר ש־overlap חייב להיות explicit, bounded ומנוהל כ־risk state — לא side effect מקרי.

---

## ‏8C.14 Protection Graph Recovery

‏לאחר disconnect/restart, recovery של Bracket/OCA צריכה להתחיל מ־external truth.

```text
1. fetch open / held / working orders
2. fetch executions / corrections
3. fetch broker-reported position
4. bind external orders to internal identities where evidence allows
5. rebuild parent/child/OCA relationships
6. mark unknown relationships explicitly
7. derive reconciled_position
8. compute every member's potentially executable qty
9. derive protected_target_qty
10. derive ProtectionCoverageState
11. reconstruct ExitAuthority / ProtectionAuthority
12. only then allow fresh decision
```

‏אסור להתחיל מ־:

```text
reload last local signal
→ recreate bracket
```

‏מפני שה־external graph יכולה כבר להיות שונה.

---

## ‏8C.15 Graph States שצריך לזהות במפורש

```text
GRAPH_CONSISTENT_PROTECTED
GRAPH_CONSISTENT_UNPROTECTED
GRAPH_PARTIAL_COVERAGE
GRAPH_OVER_EXIT_RISK
GRAPH_ORPHAN_CHILD
GRAPH_MISSING_EXPECTED_CHILD
GRAPH_UNKNOWN_PARENT_LINK
GRAPH_UNKNOWN_OCA_MEMBERSHIP
GRAPH_CONFLICTING_OWNERSHIP
GRAPH_STATE_INCONSISTENT
```

‏אלה אינם Broker statuses; הם derived safety states של המנוע.

---

## ‏8C.16 Orphan Child

‏Child יכולה להיות קיימת בזמן שה־Parent כבר terminal או אינה מזוהה אצלנו כראוי.

‏`orphan` אינה אומרת אוטומטית לבטל.

‏לפני פעולה צריך לדעת:

```text
can this child still execute?
what side / qty can it execute?
what current position exists?
is it protective or risk-increasing under current position?
who owns it?
was it manually created/modified?
```

‏ה־default בזמן uncertainty הוא:

```text
no new risk
→ reconcile ownership + position + order state
```

‏לא `cancel everything` עיוור.

---

## ‏8C.17 Missing Protective Child

‏אם Position קיימת אבל expected child אינה observable:

```text
expected child missing
!=
child safely cancelled
```

‏צריך להבדיל בין:

```text
never transmitted
rejected
cancelled
filled
unknown / not yet observed
binding mismatch
manual action
```

‏עד שהסיבה ידועה:

```text
ProtectionCoverageState = UNKNOWN_PROTECTION or UNPROTECTED
```

‏לפי evidence הקיים.

---

## ‏8C.18 Handoff בין Broker Protection ל־Local Exit

‏Handoff הוא protocol לא אטומי.

### ‏סכנה 1 — Cancel protection מוקדם מדי

```text
cancel broker protection
→ wait
→ local exit fails / disconnect
→ position temporarily unprotected
```

### ‏סכנה 2 — Local Exit מוקדם מדי

```text
submit local exit
while broker protection still executable
→ both may execute
→ over-exit / position flip
```

‏לכן כל handoff חייב לכלול:

```text
current reconciled_position
current protected qty
all potentially executable exits
transition exposure budget
cancel/submit sequencing policy
late-effect handling
completion condition
```

> ‏`ENGINE RULE` — handoff completion נקבעת לפי broker/execution/position evidence, לא לפי העובדה שה־client שלח את שתי הפקודות המתוכננות.

---

## ‏8C.19 Exit Authority ו־Protection Authority נשארות נפרדות

```text
ExitAuthority
= מי רשאי ליזום Exit חדשה

ProtectionAuthority
= איזה מנגנון מחזיק כרגע protection שאמורה לפעול ללא fresh local signal
```

‏ייתכן מצב שבו:

```text
ExitAuthority = LOCAL_ENGINE
ProtectionAuthority = BROKER_PROTECTION
```

‏וזה תקין רק אם handoff/overlap policy ברורה.

‏Order שעדיין potentially executable אינה מפסיקה להיות risk רק משום שה־Authority ליצירת Orders חדשות עברה למרכיב אחר.

---

## ‏8C.20 Manual Intervention משנה Ownership assumptions

‏אם משתמש משנה ידנית Parent/Child/OCA member:

```text
local dependency graph may no longer be authoritative
local quantity assumptions may be false
local cancel/modify ownership may be false
```

‏לכן:

```text
manual_intervention_detected
→ invalidate affected ownership assumptions
→ enter RECOVERING / EXIT_ONLY as policy requires
→ rebuild graph from broker truth
```

‏אין auto-resubmit שנועד “לתקן” פעולה ידנית לפני reconciliation.

---

## ‏8C.21 Late Effects מיוחדים ל־Protection Graph

‏מעבר ל־taxonomy של Part 8B, כאן חשוב במיוחד:

```text
LATE_PARENT_FILL
LATE_CHILD_ACTIVATION
LATE_CHILD_FILL
LATE_SIBLING_CANCEL
LATE_CHILD_REJECT
LATE_PROTECTION_RESIZE
LATE_EXECUTION_CORRECTION
```

‏כל אחד מהם מחייב recompute של:

```text
reconciled_position
protected_target_qty
verified_protected_qty
potentially_executable_exit_qty
ProtectionCoverageState
ExitAuthority / ProtectionAuthority assumptions
```

---

## ‏8C.22 `FLAT_CONFIRMED` בגרף Protection

‏`reconciled_position == 0` לבדו אינו מספיק אם עדיין קיימות exits שיכולות לבצע.

‏לכן:

```text
FLAT_CONFIRMED requires
reconciled_position == 0
AND
no potentially executable exit/protection order
AND
no UNKNOWN member that could create exit exposure
AND
execution reconciliation complete enough for current policy
```

‏אחרת המערכת יכולה להיות flat עכשיו ועדיין להפוך Short/Long כתוצאה מ־late child fill.

---

## ‏8C.23 Acceptance Matrix — Bracket

> ‏`ACCEPTANCE TEST REQUIRED`

‏לפני `PRODUCTION_ENABLED` עבור Bracket path ספציפית צריך לבדוק לפחות:

```text
full parent fill → children activation
first parent partial fill → child activation state
additional parent fills → child qty evolution
parent cancel after partial fill
profit child partial fill
stop child partial fill
one child fills while sibling cancel is in flight
child reject after position exists
modify child quantity
modify parent while children staged
client disconnect before final transmit
client disconnect after final transmit
TWS/session restart with active parent/children
manual child modify
manual child cancel
late fill during recovery
execution correction affecting protected qty
```

‏ה־expected result חייב להירשם כ־evidence של capability tuple, לא כידע גלובלי על “Bracket”.

---

## ‏8C.24 Acceptance Matrix — OCA/OCO

> ‏`ACCEPTANCE TEST REQUIRED`

```text
A full fill → B cancel timing
A partial fill → B state / qty behavior
A fill while B cancel acknowledgement delayed
A/B simultaneous or near-simultaneous execution attempt
triggered member while sibling cancel is in flight
cancel reject on sibling
manual modify of one member
manual cancel of one member
client disconnect after first member fill
reconnect while sibling state unknown
execution correction after group looked terminal
```

‏Production policy חייבת להיות בטוחה גם אם observed semantics פחות “נוחות” ממה שה־UI מרמזת.

---

## ‏8C.25 Failure Destinations

| Failure | Canonical destination |
|---|---|
| Parent Partial Fill + child coverage unknown | `PROTECTION_REVIEW` + `RECONCILE_ORDER_AND_POSITION` |
| Protective child reject | `PROTECTION_REVIEW` + fresh Exit/Risk decision |
| Sibling cancel unknown | `RECONCILE_ORDER_AND_POSITION` |
| OCA members over-expose position | `REDECIDE_EXIT` / emergency risk reduction לפי current facts |
| Missing expected child | `PROTECTION_REVIEW` |
| Orphan child | `RECOVERY_RECONCILIATION` |
| Manual intervention | `RECOVERY_RECONCILIATION` |
| Graph identity inconsistent | `RECOVERY_RECONCILIATION` |

‏ה־destination אינה hard-coded next Order Type.

---

## ‏8C.26 Telemetry Contract

```text
protection_graph_id
parent_internal_order_id
child_internal_order_ids[]
oca_group_id

reconciled_position
protected_target_qty
verified_protected_qty
potentially_executable_exit_qty
protection_coverage_state

graph_state
exit_authority
protection_authority

parent_filled_qty
child_executable_qty_by_id
child_filled_qty_by_id

untransmitted_member_count
unknown_member_count
cancel_pending_member_count
manual_intervention_detected

late_effect_type
late_effect_member_id
recovery_started_at
protection_verified_at
```

---

## ‏8C.27 Invariants של `R6B`

```text
UNTRANSMITTED != PROTECTED
Parent requested qty != protected target qty
Protected target qty = abs(reconciled_position)
Parent terminal != protection graph terminal
OCA/OCO coordination != atomic execution
Cancel requested sibling != non-executable sibling
Unknown child != safely inactive child
Every non-terminal member contributes to worst-case executable exposure
Partial fill => recompute position + graph + protection before new side effect
Broker protection handoff is non-atomic
Manual intervention invalidates affected ownership assumptions
FLAT now != FLAT_CONFIRMED
```

---

## ‏8C.28 Checkpoint

‏`R6B` סוגר את פערי ה־deep safety הבאים:

```text
AO-GAP-P0-10 — Bracket parent partial-fill semantics remain ACCEPTANCE TEST REQUIRED
AO-GAP-P0-11 — OCA/OCO are explicitly non-atomic coordination
AO-GAP-P0-14 — UNTRANSMITTED != PROTECTED
```

‏בנוסף הוא מגדיר `Protection Graph Recovery`, ‏protected-quantity invariants, OCA race matrix ו־handoff safety.

‏השלב הבא הוא `R6C`: ‏Recovery, ownership, manual intervention, shutdown semantics ו־earned `READY` — Position-First / Ownership-First recovery עד closeout של פערי safety הנותרים.