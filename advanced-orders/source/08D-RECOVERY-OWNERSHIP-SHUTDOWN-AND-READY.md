# ‏חלק 8D — Recovery, Ownership, Shutdown & Earned READY

> ‏הפרק הזה סוגר את שכבת ה־Recovery של Advanced Orders. הוא אינו פרק כללי על Reliability; הוא עוסק רק במקומות שבהם restart, disconnect, manual intervention או shutdown יכולים לשנות את ה־semantics, ה־ownership או ה־risk של Orders שכבר נשלחו או Position שכבר קיימת.

---

## ‏8D.1 Recovery אינה Resume

‏הטעות המסוכנת ביותר היא לחשוב:

```text
process restarted
→ reload last signal
→ continue previous execution plan
```

‏ה־contract הנכון הוא:

```text
process restarted
→ acquire external truth
→ rebuild position / orders / ownership / protection
→ classify unknowns
→ invalidate stale intent
→ earn READY
→ fresh decision
```

> ‏`ENGINE RULE` — Recovery אינה מחיה Decision, Signal, TTL או Entry intent שהיו תקפים לפני הכשל.

---

## ‏8D.2 Position-First + Ownership-First

‏Recovery מתחילה בשתי שאלות לפני כל שאלה על Strategy:

```text
What position exists now?
What orders can still execute now?
```

‏מיד אחריהן:

```text
Who currently owns Exit authority?
Who currently owns Protection authority?
Who owns repricing / trigger / coordination state?
What is UNKNOWN?
```

‏רק לאחר מכן אפשר לשאול האם קיים Intent חדש.

> ‏`ENGINE INVARIANT` — Strategy intent אינה source of truth עבור Position או externally executable Orders.

---

## ‏8D.3 Recovery Truth Set

‏לפני החלטה שמגדילה Risk צריך לרכוש, ככל שה־adapter/path מאפשרים:

```text
broker open / held / working orders
broker executions and execution corrections
broker-reported position
local execution ledger
order identity mappings
parent / child relationships
OCA/OCO memberships
trigger / transformation / broker-algo state where observable
cancel / modify uncertainty
manual intervention evidence
capability state relevant to still-live orders
```

‏מכאן נגזרים:

```text
reconciled_position
potentially_executable_orders
potentially_executable_entry_qty
potentially_executable_exit_qty
protection_coverage_state
exit_authority
protection_authority
ownership_conflicts
unresolved_unknowns
```

---

## ‏8D.4 Recovery Precedence

‏סדר ה־Recovery הקנוני הוא:

```text
1. freeze new risk
2. establish connectivity / handshake readiness
3. ingest broker order state
4. ingest executions / corrections
5. reconcile position
6. rebuild potentially executable exposure
7. rebuild dependency / coordination / protection graph
8. rebuild ownership
9. classify manual intervention
10. evaluate protection adequacy
11. invalidate expired local intent
12. resolve / bound UNKNOWN states
13. run READY gates
14. only then allow fresh decision
```

‏אין שלב שבו “ה־Signal האחרון” מקבל קדימות על Broker truth.

---

## ‏8D.5 Connectivity היא רק Gate ראשון

```text
CONNECTED
!=
HANDSHAKE_READY
!=
RECOVERED
!=
READY
```

‏Socket תקין מוכיח תקשורת בלבד.

‏Handshake תקין מוכיח שה־API path מוכן לקבל/להחזיר state ברמה הבסיסית.

‏Recovery complete דורשת reconciliation.

‏`READY` דורשת בנוסף שכל invariants העסקיים והבטיחותיים עברו.

> ‏`ENGINE RULE` — `READY` היא earned state, לא default state אחרי reconnect.

---

## ‏8D.6 `READY` Gate קנוני

‏מותר לעבור ל־`READY` רק אם כל הדרישות הרלוונטיות ל־scope הנוכחי מתקיימות:

```text
connectivity_ready == true
handshake_ready == true

order_snapshot_acquired == true
execution_reconciliation_complete == true
position_reconciliation_complete == true

no_unbounded_submit_unknown
no_unbounded_modify_unknown
no_unbounded_cancel_unknown

all potentially executable orders classified
all externally observed orders ownership-classified
all dependency / OCA / protection relationships reconstructed or explicitly bounded

reconciled_position known
potentially_executable_exposure within policy
protection coverage acceptable for any open position

ExitAuthority known
ProtectionAuthority known
no unresolved ownership conflict

expired pre-failure signal not reused
fresh market / risk state available for any new decision

manual intervention reconciled
shutdown residue reconciled when recovering from shutdown
```

‏אם אחד מן ה־gates אינו מתקיים, המערכת נשארת למשל ב־:

```text
RECOVERING
ENTRY_DISABLED
EXIT_ONLY
DEGRADED
FROZEN
```

‏לפי חומרת הבעיה וה־policy.

---

## ‏8D.7 `READY` אינה אומרת “הכול מושלם”

‏ייתכן שהמערכת אינה יכולה לאמת feature מסוים, אך עדיין יכולה לפעול במצב מצומצם.

‏לדוגמה:

```text
new entries blocked
+
position known
+
exit path verified
```

‏יכול להצדיק:

```text
EXIT_ONLY
```

‏אבל לא `READY` מלא ל־Entry.

‏לכן System Operating Mode הוא output של Recovery, לא boolean יחיד.

---

## ‏8D.8 Unknown External Order

‏Order שה־Broker מדווח עליה אך המנוע לא מצליח לשייך מיד ל־local intent אינה “Order זרה שאפשר להתעלם ממנה”.

‏נדרש classification:

```text
KNOWN_OWNED_ORDER
KNOWN_MANUAL_ORDER
KNOWN_EXTERNAL_SYSTEM_ORDER
UNKNOWN_OWNERSHIP_ORDER
```

‏ל־`UNKNOWN_OWNERSHIP_ORDER` נשאל לפחות:

```text
Can it execute?
Which side?
Which quantity?
Does it increase or reduce current position risk?
Is it protection?
Is it part of a dependency / OCA graph?
Can our client legally / technically cancel or modify it?
```

> ‏`ENGINE RULE` — Ownership unknown אינה authorization לבצע cancel אוטומטי וגם אינה authorization להתעלם מה־Order.

---

## ‏8D.9 Manual Intervention היא שינוי Authority

‏Manual action ב־TWS/Broker יכולה לשנות:

```text
price
quantity
TIF / attributes
cancel state
position
parent / child relationship assumptions
OCA group state
protection coverage
```

‏לכן כאשר observed state אינה מוסברת על ידי command stream שלנו:

```text
manual_intervention_detected = true
```

‏והתגובה:

```text
invalidate affected ownership assumptions
freeze conflicting automation
reconcile external truth
rebuild protection / exit authority
fresh decision
```

‏אסור:

```text
auto-resubmit local desired state
```

‏רק משום שהמערכת רואה “drift” מול התכנון הישן.

---

## ‏8D.10 Single Decision Authority אחרי Recovery

‏לאחר recovery חייב להיות רכיב יחיד שמורשה ליצור Side Effect חדש בשם execution intent.

```text
Single Decision Authority
```

‏אינה אומרת שרק רכיב אחד יכול להיות executable.

‏Broker-resident protection, OCA siblings או cancel-pending Orders עדיין יכולים לפעול.

‏היא אומרת שרק authority מוגדרת אחת רשאית **ליזום החלטה חדשה** לאחר reconciliation.

---

## ‏8D.11 Exit Authority ו־Protection Authority נשארות נפרדות

```text
ExitAuthority
= who may initiate a new exit action

ProtectionAuthority
= which mechanism currently owns standing protection
```

‏Recovery חייבת לשחזר את שתיהן.

‏מצב חוקי אפשרי:

```text
ExitAuthority       = LOCAL_ENGINE
ProtectionAuthority = BROKER_PROTECTION
```

‏אבל אם Broker protection קיימת ועדיין executable, היא ממשיכה לצרוך exit risk budget גם כאשר Local Engine קיבלה מחדש ExitAuthority.

---

## ‏8D.12 Recovery אינה מחיה Signal ישן

‏צריך לשמור בנפרד:

```text
historical_signal_record
current_signal_validity
```

‏לאחר reconnect:

```text
old signal existed
!=
old signal is valid now
```

‏אם `signal_ttl` פג בזמן disconnect:

```text
signal_state = EXPIRED
```

‏Recovery יכולה להשתמש ברשומה ההיסטורית ל־audit/replay, אבל לא ל־authorization של Entry חדשה.

> ‏`ENGINE INVARIANT` — Recovery restores truth; it does not restore expired intent.

---

## ‏8D.13 Working Order עם Signal שפג

‏מצב אפשרי:

```text
broker_order_state = WORKING
signal_state       = EXPIRED
```

‏התגובה אינה למחוק את ה־Order לוגית.

‏התגובה היא:

```text
create cancellation obligation when policy requires
keep order in potentially_executable exposure
reconcile late effects
fresh decision only after sufficient evidence
```

‏Broker-managed repricing/trigger behavior יכולה להמשיך בזמן שה־local signal כבר מתה.

---

## ‏8D.14 Shutdown אינו `cancel everything`

‏Shutdown היא control transition, לא Broker command יחידה.

‏לפני shutdown צריך להגדיר policy לכל category:

```text
new entry intent
working entry order
working exit order
broker-resident protection
cancel-pending order
unknown order
manual/external order
open position
```

‏למשל, ביטול עיוור של Broker-resident protective stop רק משום שה־process נסגרת יכול להגדיל סיכון.

> ‏`ENGINE RULE` — Shutdown אינה מבטלת Protection כברירת מחדל; היא מעבירה את המערכת ל־state שבו כל surviving order/position חייבת להיות מתועדת ומסווגת.

---

## ‏8D.15 Graceful Shutdown Sequence

‏ה־sequence הקנוני ברמת Advanced Orders:

```text
1. disable new entries
2. stop creation of new non-essential risk
3. snapshot local intent / order / position state
4. classify every potentially executable order
5. apply explicit shutdown policy per order family
6. preserve required broker-resident protection unless policy explicitly replaces it
7. send required cancels / modifications
8. observe acknowledgements / fills within allowed shutdown window
9. persist unresolved UNKNOWN / cancel-pending / working state
10. persist ownership and protection state
11. close process without pretending unresolved external state disappeared
```

‏גם shutdown “נקי” אינו הוכחה שמחר אפשר להתחיל מ־blank state.

---

## ‏8D.16 Shutdown Outcomes

‏בסוף shutdown אפשר להגיע למשל ל־:

```text
FLAT_AND_NO_EXECUTABLE_ORDERS

POSITION_WITH_VERIFIED_BROKER_PROTECTION

POSITION_WITH_EXIT_IN_PROGRESS

NO_POSITION_BUT_CANCEL_PENDING_ORDER_EXISTS

UNKNOWN_EXTERNAL_STATE_REQUIRES_RECOVERY
```

‏רק הראשון דומה באמת ל־“nothing remains”.

‏כל האחרים דורשים startup recovery לפני `READY`.

---

## ‏8D.17 Crash Shutdown שונה מ־Graceful Shutdown

‏ב־crash אין לנו sequence מקומי אמין.

‏לכן startup שלאחר crash מניח:

```text
local final state may be stale
last command may or may not have reached broker
broker-managed behavior may have continued
fills may have occurred
manual intervention may have occurred
```

‏ה־source of truth היא external reconciliation, לא קובץ ה־state האחרון לבדו.

---

## ‏8D.18 Shutdown + Protection Handoff

‏אם local engine מפסיקה לנהל Exit אבל משאירה broker-resident protection:

```text
local dynamic exit authority stops
broker protection remains potentially executable
```

‏צריך persist לפחות:

```text
ProtectionAuthority
protective order identity
protected qty
residency evidence
Economic Price Bound / trigger semantics where relevant
last verified broker state
```

‏ב־startup, protection זו נבדקת מחדש; לא מניחים שהיא קיימת רק משום שה־shutdown התכוונה להשאיר אותה.

---

## ‏8D.19 Shutdown עם Cancel Pending

‏אם shutdown שולחת Cancel אך אינה מקבלת terminal evidence:

```text
CANCEL_REQUESTED / CANCEL_UNKNOWN
```

‏ה־Order נשמרת persistent recovery obligation.

‏אסור לשמור:

```text
cancelled = true
```

‏רק משום שה־process ביקשה Cancel לפני שנסגרה.

---

## ‏8D.20 Recovery של Dynamic / Transforming Orders

‏ל־families דינמיות צריך לשחזר את state שה־semantics שלהן תלויות בו:

```text
Pegged / Relative   -> current effective working state
Trailing            -> broker-observed trigger state
Market-to-Limit     -> transformation phase + remainder
Bracket             -> protection graph
OCA/OCO             -> every member + group state
Conditional         -> predicate/activation state
Broker Algo         -> observable broker-managed state + executions
```

‏אם state קריטי אינו reconstructable:

```text
UNKNOWN / STATE_INCONSISTENT
```

‏ולא synthetic reconstruction שמעמידה פנים שהיא Broker truth.

---

## ‏8D.21 Recovery of Partial Fill

‏Partial Fill שקרתה לפני או בזמן failure משנה את הבעיה מ־Order recovery ל־Position recovery.

```text
partial execution
→ execution ledger changes
→ reconciled_position changes
→ protection target changes
→ remaining intent must be reconsidered
```

‏לכן:

```text
remaining_qty from old order
!=
authorized new order quantity
```

‏אחרי recovery נדרשת fresh Decision.

---

## ‏8D.22 Recovery of Execution Correction

‏Execution correction יכולה להגיע לאחר שהמנוע כבר בנה Position Truth.

‏כאשר מתקבלת correction:

```text
recompute execution ledger
reconcile broker position
recompute potentially executable exposure
recompute protection coverage
recompute exit sizing
invalidate decisions derived from superseded execution truth
```

‏ה־event אינו “telemetry only”.

---

## ‏8D.23 Recovery State Record

```text
RecoveryState {
  recovery_id
  started_at
  cause

  connectivity_ready
  handshake_ready

  order_snapshot_complete
  execution_reconciliation_complete
  position_reconciliation_complete

  reconciled_position
  potentially_executable_entry_qty
  potentially_executable_exit_qty

  protection_coverage_state
  exit_authority
  protection_authority

  unknown_order_count
  unknown_ownership_count
  unknown_dependency_count

  manual_intervention_detected
  expired_intent_count
  unresolved_cancel_count

  ready_gate_failures[]
  resulting_system_mode
  completed_at
}
```

‏כך `READY` ניתנת להסבר ול־replay במקום להיות boolean שנקבע אד־הוק.

---

## ‏8D.24 READY Reason Codes

‏דוגמאות ל־gates שחוסמות `READY`:

```text
SYSTEM_RECOVERY_ORDER_SNAPSHOT_INCOMPLETE
SYSTEM_RECOVERY_EXECUTIONS_INCOMPLETE
SYSTEM_RECOVERY_POSITION_INCONSISTENT
STATE_UNKNOWN_EXECUTABLE_ORDER
STATE_UNKNOWN_ORDER_OWNERSHIP
STATE_UNKNOWN_PROTECTION_GRAPH
RISK_PROTECTION_INSUFFICIENT
RISK_OVER_EXIT_EXPOSURE
SYSTEM_MANUAL_INTERVENTION_UNRECONCILED
STALE_PRE_RECOVERY_SIGNAL_EXPIRED
SYSTEM_SHUTDOWN_RESIDUE_UNRECONCILED
```

‏Reason Code מסבירה למה mode נשאר מצומצם; היא אינה Side Effect.

---

## ‏8D.25 Failure Destination במהלך Recovery

‏בזמן `RECOVERING`, Failure Destination אינה “retry broker command”.

‏היא יכולה להיות:

```text
RECONCILE_ORDER
RECONCILE_POSITION
RECONCILE_ORDER_AND_POSITION
PROTECTION_REVIEW
RECOVERY_RECONCILIATION
NO_NEW_SIDE_EFFECT
```

‏רק לאחר truth acquisition יכולה Decision חדשה לבחור פעולה.

---

## ‏8D.26 Acceptance Tests — Recovery

> ‏`ACCEPTANCE TEST REQUIRED`

```text
restart while passive order is working
restart while broker-managed peg/algo is repricing
restart after submit with ACK missing
restart after cancel request with ACK missing
restart after partial entry fill
restart after partial exit fill
restart while Bracket parent partially filled
restart with active protective child
restart while OCA sibling cancel is in flight
restart after trigger but before fill
restart after MTL transformed remainder
restart with execution correction pending/late
restart after manual modify
restart after manual cancel
restart with unknown external order
restart with expired signal but working order
```

‏לכל scenario צריך להוכיח resulting mode ו־READY gate outcome.

---

## ‏8D.27 Acceptance Tests — Shutdown

> ‏`ACCEPTANCE TEST REQUIRED`

```text
shutdown while flat and no orders exist
shutdown with passive entry working
shutdown with cancel pending
shutdown with open position + verified broker protection
shutdown with open position + local-only exit logic
shutdown during partial fill
shutdown with OCA group active
shutdown with unknown broker state
shutdown after manual intervention
crash before graceful shutdown completes
restart after each of the above
```

‏המבחן אינו “process exited cleanly”; המבחן הוא האם ה־external risk state נשמרה/סווגה וניתנת ל־safe recovery.

---

## ‏8D.28 Invariants של `R6C`

```text
Recovery != resume old decision
Position truth precedes strategy intent
Ownership truth precedes new side effects
CONNECTED != READY
HANDSHAKE_READY != READY
Old signal record != current authorization
Expired signal is never revived by recovery
Manual intervention invalidates affected ownership assumptions
Shutdown != cancel everything
Graceful shutdown != proof of empty broker state
Cancel requested during shutdown != cancelled
Protection left at broker remains risk-relevant after local process stops
Unknown external order must be classified before new risk
Partial fill during failure creates fresh position truth
READY must be earned from reconciliation + safety invariants
```

---

## ‏8D.29 Checkpoint

‏`R6C` סוגר את פערי Recovery הבאים:

```text
AO-GAP-P0-15 — Position-First / Ownership-First Recovery
AO-GAP-P0-16 — READY is an earned state
AO-GAP-P1-27 — Manual intervention changes ownership assumptions
AO-GAP-P1-28 — Shutdown != cancel everything
AO-GAP-P1-29 — Recovery does not revive expired signal
```

‏השלב הבא הוא `R6D`: closeout audit של כל Failure / Survivability / Safety gaps מול Final Gap List; רק אם כולם מכוסים יסומן `R6_COMPLETE`.