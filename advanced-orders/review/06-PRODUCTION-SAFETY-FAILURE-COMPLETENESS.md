# ‏Review 6 — Production Safety and Failure Completeness

> ‏סקירה שישית מתוך סדרת Reviews לקורס `Advanced Order Mastery`.
>
> ‏מטרת השלב הזה אינה לתקן עדיין את הקורס, אלא לבדוק האם לכל Advanced Order משמעותית יש Failure Contract ברור: מה יכול להישאר חי אצל Broker, מה יכול להתבצע מאוחר, מה קורה בזמן disconnect/restart, איך מטפלים ב־stale intent, late fill, reject, recovery ו־manual intervention, ומתי מותר לחזור ל־READY.
>
> ‏Scope: Advanced Orders וה־Execution שלהן בלבד. אנחנו לא בונים כאן מחדש קורס כללי על Production Reliability; בודקים רק את המקומות שבהם Failure משנה את semantics או את הסיכון של הפקודה.

---

# ‏1. מסקנה ראשית

‏הקורס כבר כולל בסיס חזק מאוד של state machine, reconciliation, cancel/fill races, partial fills, broker truth, recovery ו־Exit Ownership.

‏כלומר הבעיה אינה שחסר פרק כללי בשם "מה קורה כשיש disconnect".

‏הפער המרכזי הוא אחר:

```text
General recovery rules exist
but
not every Advanced Order family has an explicit Failure Contract.
```

‏לקורא מקצועי צריך להיות אפשר לענות על כל Order Family:

```text
Where does the order actually live?
Who keeps managing it if our process dies?
Can it still execute after the intent expired locally?
What state becomes UNKNOWN after disconnect?
What can be reconstructed from broker truth?
What cannot be reconstructed safely?
What can be cancelled immediately?
What must first be reconciled?
What late events are still valid?
What manual actions can invalidate our assumptions?
What exact condition returns the engine to READY?
```

‏לכן התיקון העתידי צריך להוסיף **Failure Contract אחיד לכל משפחה**, לא עוד פרק Recovery כללי.

---

# ‏2. `P0` — חסרה טבלת `Order Survivability`

‏ב־Advanced Orders ההבדל הקריטי ביותר בזמן crash/restart הוא לעיתים לא שם הפקודה אלא **איפה ה־state החי נמצא**.

‏צריך טבלה מרכזית כגון:

| Family | Local state only | TWS/session state | Broker/server state | Venue/native state | Can survive local process death? | Can survive TWS restart? |
|---|---:|---:|---:|---:|---:|---:|
| Passive Limit | depends | depends | depends | possible | usually if transmitted | depends on path |
| Pegged / Relative | depends | depends | broker/venue behavior | possible | potentially | route-specific |
| Broker Algo | no | adapter-dependent | broker-managed | may route onward | potentially | capability-specific |
| Untransmitted Bracket child | no | yes | no | no | only while TWS session exists | no |
| Transmitted protective Stop | no | maybe | yes if accepted | native/simulated | potentially | potentially |
| Local dynamic exit | yes | no | no until submitted | no | no | no |

‏הערכים המדויקים תלויים capability/route/account ולכן הטבלה הסופית צריכה להשתמש ב־Capability Matrix ולא להבטיח semantics גלובלית.

‏המטרה היא ללמד את הקורא:

> ‏`broker-resident` אינו אותו דבר כמו `client-managed`, ו־`TWS-local untransmitted` אינו אותו דבר כמו Order שכבר התקבלה בשרת Broker.

---

# ‏3. `P0` — כל Advanced Order צריכה `Failure Contract`

‏לכל Family חשובה כדאי להוסיף card קצר:

```text
Failure Contract

Execution owner:
Persistence owner:
Repricing owner:
Trigger owner:
Cancel authority:
Recovery source of truth:
Possible late effects:
Unsafe assumptions:
Required acceptance tests:
```

‏זה חשוב במיוחד ל־:

```text
Pegged / Relative
MidPrice
Adaptive
Sweep-to-Fill
Stop / Stop-Limit
Trailing
Bracket
OCA/OCO
Conditional
Hidden / Reserve
Market-to-Limit
```

‏בלי זה הקורא יודע איך הפקודה עובדת כאשר הכול תקין, אבל לא בהכרח יודע מי ממשיך "להחזיק את ההגה" כאשר רכיב אחד נופל.

---

# ‏4. `P0` — `Submitted` אינה הוכחה ש־Broker קיבל

‏הקורס כבר מלמד ש־command request אינה fact, אבל צריך להפוך זאת ל־Failure Contract מפורש.

‏לאחר:

```text
send placeOrder
```

‏יכולים להיות מצבים כגון:

```text
broker accepted, ACK lost
broker rejected, error delayed
transport failed before broker received
broker state unknown
```

‏לכן timeout אינו יכול להתפרש כ־:

```text
order failed
```

‏וגם לא כ־:

```text
order accepted
```

‏המצב הנכון הוא לעיתים:

```text
SUBMIT_UNKNOWN
```

‏והתגובה היא reconciliation, לא blind retry.

---

# ‏5. `P0` — `Cancel requested` אינה סוף חיי Order

‏זה כבר מופיע היטב בחלק 8 וב־10C, אבל צריך להיות rule אחיד בכל משפחות הפקודות:

```text
CANCEL_REQUESTED
!=
CANCELLED_CONFIRMED
```

‏עד קבלת evidence סופי, Order יכולה עדיין:

```text
fill
partial fill
trigger
be modified by broker logic
produce child/sibling effects
```

‏לכן quantity שלה נשארת בתוך:

```text
potentially_executable_exposure
```

‏עד terminal evidence.

---

# ‏6. `P0` — חסר `Late Effect Taxonomy`

‏הקורס מדבר על Late Fill, אבל Advanced Orders יכולות לייצר יותר מסוג אחד של late effect.

‏צריך להבחין בין:

```text
LATE_FILL
LATE_PARTIAL_FILL
LATE_TRIGGER
LATE_REPRICE
LATE_CHILD_ACTIVATION
LATE_SIBLING_CANCEL
LATE_REJECT
LATE_MODIFY_ACK
LATE_EXECUTION_CORRECTION
```

‏ההבחנה חשובה משום שהתגובה שונה.

‏לדוגמה:

```text
late fill
→ position changes
→ protection may need resizing

late reject
→ capability / order state changes
→ position may not change

late child activation
→ potential exit exposure changes
→ double-exit guard must rerun
```

---

# ‏7. `P0` — Stale Intent ו־Live Order חייבים להיות states נפרדים

‏Order יכולה להיות עדיין חוקית אצל Broker בזמן שה־Intent העסקי כבר מת.

‏לכן נרצה להפריד:

```text
broker_order_state = WORKING
intent_state = EXPIRED
```

‏זה מצב תקין מבחינת המודל, אבל דורש action.

‏הטעות היא להניח:

```text
working order
=> strategy still wants it
```

‏במיוחד ב־:

```text
GTC/GTD
passive resting orders
pegged orders
broker algos
Market-to-Limit remainder
Bracket children
conditional orders
```

‏תיקון עתידי צריך להציג `Intent Validity` כציר state עצמאי.

---

# ‏8. `P0` — Broker-managed repricing בזמן שה־Signal כבר stale

‏ב־Relative/Pegged/MidPrice/Adaptive ה־Order יכולה להמשיך להשתנות גם בלי command חדש שלנו.

‏זה יוצר Failure Mode שונה מ־static Limit:

```text
local signal expires
but broker-managed order is still alive
and broker continues repricing/routing
```

‏לכן צריך Rule מפורש:

```text
application TTL expires
→ cancellation obligation is created
→ until cancel confirmed, the order remains potentially executable
```

‏ה־TTL המקומי אינו גורם קסם שמכבה Broker-managed behavior.

---

# ‏9. `P0` — Bracket צריכה `Protection Graph Recovery`, לא רק Order Recovery

‏ב־Bracket לא מספיק לשחזר רשימת Orders.

‏צריך לשחזר graph:

```text
parent
├── take profit child
└── protective stop child
```

‏ולענות:

```text
Which parent quantity actually filled?
Which children are active?
Which child quantities still match the position?
Did one child fill while sibling cancel was pending?
Is any child orphaned?
Is protection smaller or larger than actual position?
```

‏לכן Recovery של Bracket צריכה להיות מוגדרת כ־:

```text
reconcile orders
+ reconcile executions
+ reconcile position
+ rebuild dependency graph
+ validate protected quantity
```

‏ולא רק:

```text
reload order IDs
```

---

# ‏10. `P0` — `Transmit=false` חייבת לקבל Failure Warning בולט

‏10C כבר מציינת נכון ש־Order עם `Transmit=false` אינה Protection פעילה אצל Broker server, וש־Orders כאלה הן session-local ב־TWS.

‏בתיקון העתידי צריך להפוך זאת ל־warning קבוע ליד Bracket construction:

```text
UNTRANSMITTED != PROTECTED
```

‏Failure Mode:

```text
parent/children staged locally
process/TWS/session disappears before final transmit
=> expected protection may never reach broker
```

‏הקורא צריך להבין שה־transmit sequence פותר race מסוים בעת construction, אבל יוצר גם חלון שבו protection עדיין אינה broker-resident.

---

# ‏11. `P0` — Parent Partial Fill + Protection Quantity נשאר Acceptance-Test Gate

‏הקורס כבר זיהה שההתנהגות של children מול parent partial fills אינה דבר שכדאי לנחש.

‏Review 6 מאשר שזה חייב להישאר `P0`:

```text
ACCEPTANCE TEST REQUIRED
```

‏לפני Production צריך להוכיח בפועל עבור ה־API/product/route הרלוונטיים:

```text
when children become active
what quantity becomes active
how quantity changes after further parent fills
what happens after child modification
what happens during reconnect
```

‏אסור שה־Repair Pass "יפשט" את הנקודה הזאת לכדי משפט ודאי אם אין Evidence מתאים.

---

# ‏12. `P0` — OCA/OCO Failure Contract חייב להתחיל מ־`not atomic`

‏כל OCA/OCO discussion עתידי צריך לפתוח ב־:

```text
mutual-cancel intent
!=
atomic execution guarantee
```

‏Failure Matrix מינימלית:

```text
A fills while cancel for B is in flight
A partial-fills, B still executable
B triggers before sibling cancel arrives
network timeout after first fill
cancel reject
manual modification of one sibling
```

‏מכאן נובע ש־Risk Engine צריכה לחשב worst-case execution של כל siblings שעדיין יכולים להתבצע.

---

# ‏13. `P0` — Manual Intervention חייבת לשנות Ownership

‏Manual action אינה רק log entry.

‏אם אדם:

```text
cancels an order
modifies its price
changes quantity
closes part of the position
creates a manual protective order
```

‏המערכת אינה יכולה להמשיך כאילו היא עדיין sole owner.

‏צריך state כגון:

```text
ownership = MIXED
```

‏או:

```text
MANUAL_OVERRIDE_ACTIVE
```

‏ואז:

```text
freeze conflicting automation
reconcile broker truth
classify live orders
recompute position/protection
resume only after ownership is explicit
```

---

# ‏14. `P0` — Unknown Broker Order אינה Candidate ל־Blind Cancel

‏ב־Recovery ייתכן שנמצא Order שלא קיימת ב־local durable state.

‏היא יכולה להיות:

```text
our pre-crash order
manual order
order from another clientId
old strategy instance
operator safety order
```

‏לכן:

```text
unknown order
=> classify first
```

‏ולא:

```text
unknown order
=> cancel immediately
```

‏במיוחד כאשר מדובר ב־protective Stop או exit child, blind cancel יכול להסיר את שכבת ההגנה היחידה של Position קיימת.

---

# ‏15. `P0` — Recovery חייבת להיות `Position First`

‏כאשר חוזרים מ־disconnect/restart:

```text
new opportunity scanning
```

‏אינה בעדיפות ראשונה.

‏הסדר צריך להיות:

```text
1. identify actual positions
2. identify all potentially executable orders
3. identify protection
4. classify ownership
5. resolve mismatches
6. validate invariants
7. only then allow new entries
```

‏זה עקבי עם 10D וצריך להופיע גם כ־Recovery takeaway מרכזי.

---

# ‏16. `P1` — צריך `Restart Survival Matrix` לפי Family

‏לא כל Family דורשת אותו Recovery test.

‏לדוגמה:

### ‏Static Limit / IOC

```text
Was it accepted?
Did it fill?
Did remainder die?
Is any order still working?
```

### ‏Pegged / Relative / MidPrice

```text
Is broker-managed repricing still active?
What is current working price?
Did cap remain intact?
Can local engine safely resume control?
```

### ‏Adaptive / Broker Algo

```text
Is algo still active server-side?
What stage/state is observable?
Can it still create fills after local restart?
What does cancel mean for the algo lifecycle?
```

### ‏Stop / Trailing

```text
Does protection still exist?
Was trigger already reached?
Did trigger transform the order?
Is remaining position still fully protected?
```

### ‏Bracket / OCA

```text
dependency graph
child activation
sibling status
protected quantity
possible double-exit exposure
```

‏מטריצה כזאת תיתן לקורא הבנה מעשית יותר ממונח כללי כמו `reconcile`.

---

# ‏17. `P1` — Modify Failure דורשת State משלה

‏Modify היא מקום קלאסי לאמביגואיטי:

```text
requested price = 50.05
previous price = 50.03
```

‏אם timeout קורה באמצע, אי אפשר לדעת אוטומטית איזה version עובד.

‏לכן צריך להבחין:

```text
desired_order_version
last_submitted_version
last_acknowledged_version
broker_observed_version
```

‏ולא לבצע Modify נוספת כאילו הקודמת בוודאות נכשלה.

---

# ‏18. `P1` — Reject אינו Terminal Reason אחיד

‏Order rejection יכולה לנבוע מסוגים שונים:

```text
invalid parameters
unsupported capability
route unavailable
price increment invalid
account/session restriction
order no longer modifiable because it filled/cancelled
transient broker issue
```

‏לכן:

```text
REJECTED
```

‏הוא state, אבל לא מספיק כ־decision input.

‏צריך גם:

```text
reject_class
retryability
capability_implication
requires_reconciliation
```

‏ובעיקר אין לבצע:

```text
reject
=> blindly use more aggressive fallback
```

---

# ‏19. `P1` — Failure של Protective Order שונה מ־Failure של Entry

‏אם Entry Order נדחית:

```text
we may simply remain flat
```

‏אם Stop/Protection נדחית אחרי שכבר קיימת Position:

```text
we now have unprotected exposure
```

‏לכן אותה Broker error יכולה לקבל severity שונה לחלוטין.

‏צריך severity model כגון:

```text
ENTRY_CAPABILITY_FAILURE
PROTECTION_CAPABILITY_FAILURE
EXIT_CAPABILITY_FAILURE
```

‏כאשר Protection failure יכולה להעביר את המערכת ל־:

```text
EXIT_ONLY
EMERGENCY
FROZEN_FOR_NEW_RISK
```

---

# ‏20. `P1` — Shutdown אינו שווה `Cancel Everything`

‏צריך להבחין בין:

```text
normal application shutdown
emergency shutdown
broker disconnect
operator stop
process crash
```

‏במיוחד כאשר Position קיימת, פעולה גורפת של:

```text
cancel all orders
```

‏יכולה להסיר protective Stop/Bracket.

‏לכן shutdown policy צריכה להפריד:

```text
entry orders
profit-taking exits
protective orders
unknown/manual orders
```

‏ולקבוע מי נשאר Broker-resident ומי מבוטל.

---

# ‏21. `P1` — Restart אחרי Intent expiry דורש `Do Not Resurrect`

‏אם Order ישנה אינה קיימת עוד אצל Broker אבל Intent שלה כבר expired, recovery לא אמורה "להשלים" אותה מחדש.

‏כלל:

```text
recovery restores truth
not old opportunity intent
```

‏כלומר:

```text
missing old entry order
+
expired signal
=> do not resubmit
```

‏לעומת זאת:

```text
position exists
+
protection missing
=> protection obligation may still exist
```

‏זו הבחנה קריטית בין restoration of risk obligations לבין resurrection of stale alpha.

---

# ‏22. `P1` — Protection Handoff צריך State מפורש

‏ב־Hybrid Protection יכול להיות מעבר:

```text
BROKER_PROTECTION
→ LOCAL_DYNAMIC_EXIT
```

‏או להפך.

‏צריך state machine קצרה:

```text
BROKER_PROTECTION_ACTIVE
HANDOFF_REQUESTED
BROKER_PROTECTION_CANCEL_PENDING
LOCAL_EXIT_AUTHORIZED
LOCAL_EXIT_WORKING
FLAT_CONFIRMED
```

‏הסיכון המרכזי הוא חלון שבו:

```text
protection cancelled
but local exit not yet live
```

‏או החלון ההפוך:

```text
local exit live
while old protection can still fill
```

‏לכן handoff צריך להיות first-class concept, לא רצף של שתי פקודות.

---

# ‏23. `P1` — Conditional Orders צריכות Predicate Recovery

‏אם Conditional Order נשארה חיה אצל Broker בזמן שהאפליקציה ירדה, recovery צריכה לא רק לזהות את Order אלא להבין:

```text
which condition is attached
whether condition remains valid for current strategy version
whether trigger already happened
whether resulting order can still execute
```

‏אם predicate אינה ניתנת לשחזור או שה־business intent השתנה, צריך classification מפורשת לפני שינוי.

---

# ‏24. `P1` — Trailing Orders צריכות Anchor/Reference Recovery

‏Trailing Order אינה static price בלבד.

‏ב־Recovery חשוב לדעת:

```text
current trigger / stop value
trail amount / percent
reference/high-water/low-water semantics when observable
whether broker is still maintaining the trail
```

‏אסור למנוע מקומי "לבנות מחדש" trailing state מהמחיר הנוכחי בלבד אם Broker order הקיימת כבר צברה path-dependent state.

‏הלקח המקצועי:

> ‏בפקודה path-dependent, reconstruction from current market price בלבד יכולה לשנות semantics.

---

# ‏25. `P1` — Market-to-Limit צריכה Transition Recovery

‏אם נוסיף `Market-to-Limit`, Failure Contract שלה חייב לכסות את transition:

```text
market phase
→ partial fill
→ remainder becomes limit
```

‏אם disconnect קורה סביב המעבר, recovery צריכה לזהות:

```text
filled quantity
remaining quantity
current working order type/price
whether remainder still matches live intent
```

‏זו בדיוק הסיבה שהיא אינה "סתם Market עם שם אחר".

---

# ‏26. `P1` — Sweep-to-Fill צריכה Aggregated Fill Recovery

‏כאשר execution יכולה להתפצל על פני destinations, local engine צריכה להתייחס לתוצאה כ־Order אחת מבחינת Intent אך למספר executions מבחינת ledger.

‏נדרש:

```text
aggregate filled_qty by parent/internal order
preserve per-execution execId
preserve venue/fill detail
avoid counting duplicate callbacks twice
```

‏Failure בזמן sweep לא יכול להיפתר על ידי בדיקת Fill אחת בלבד.

---

# ‏27. `P1` — Hidden / Reserve Failure Contract צריכה לכלול visibility state

‏ב־Reserve/Iceberg לא מספיק לדעת total remaining quantity.

‏למחקר ו־recovery חשוב להבדיל בין:

```text
total remaining
currently displayed slice
possible replenishment state
broker/native simulation owner
```

‏לא תמיד כל השדות יהיו observable, ולכן Capability/Telemetry צריכות לציין מה באמת ידוע ומה inferred.

---

# ‏28. `P1` — `UNKNOWN` צריך להישאר State גם אחרי timeout של Recovery

‏אחת הטעויות המסוכנות ביותר היא:

```text
reconciliation timed out
=> assume flat / cancelled / safe
```

‏נכון יותר:

```text
UNKNOWN remains UNKNOWN
```

‏עד Evidence מתאים.

‏ב־Entry הדבר בדרך כלל חוסם Risk חדש.

‏ב־Position קיימת הוא עשוי להפעיל operator escalation או bounded risk-reduction policy, בהתאם למה שכן ידוע.

---

# ‏29. `P1` — Recovery Generation / Fencing

‏לאחר reconnect/restart, events ישנים יכולים להגיע מאוחר.

‏כדאי שכל recovery cycle יקבל:

```text
recovery_generation
```

‏וכל Command/Decision יישא:

```text
revision
generation
state_version
```

‏כך callback ישן אינו יכול להחזיר את המערכת ל־state שכבר ננטש.

---

# ‏30. `P1` — Single Writer / Ownership Fencing צריך לפחות אזכור

‏Advanced Orders נעשות מסוכנות במיוחד אם שני process instances חושבים שהם מנהלים אותה Position.

‏אין צורך להפוך את הקורס לפרק Distributed Systems, אבל צריך Principle קצר:

```text
one authoritative execution writer per account/scope
```

‏או לפחות fencing ברור בין instances.

‏אחרת:

```text
instance A cancels
instance B replaces
manual operator modifies
broker still has old protection
```

‏יכול ליצור state שלא ניתן להסיק מה־Strategy בלבד.

---

# ‏31. `P2` — Capability Degradation בזמן Order חיה

‏Capability Matrix לרוב נבדקת לפני submit, אבל failure יכולה להתרחש אחרי שה־Order כבר חיה.

‏לדוגמה:

```text
route becomes unavailable
algo stops accepting modifications
session changes
broker changes validation behavior
```

‏צריך להבחין בין:

```text
cannot create new order of this family
```

‏לבין:

```text
existing order already lives and must be managed safely
```

‏Disable של Capability אינו מוחק Orders קיימות.

---

# ‏32. `P2` — Failure Telemetry צריכה להיות per-family

‏מעבר למדדי fill/slippage, נרצה:

```text
submit_unknown_count
cancel_unknown_count
modify_unknown_count
late_fill_count
late_trigger_count
orphan_child_count
protection_gap_duration
manual_override_count
recovery_duration
recovery_fail_count
unknown_order_count
stale_live_order_count
```

‏ולפי Family:

```text
failure_rate_by_order_family
recovery_rate_by_order_family
protection_incidents_by_architecture
```

‏כך אפשר לדעת אם Order "מתוחכמת" מייצרת רווח execution קטן במחיר operational fragility גדולה.

---

# ‏33. Failure Matrix מרכזית שחסרה לקורס

‏בתיקון עתידי כדאי להוסיף מטריצה מסכמת:

| Failure | Static Limit | Pegged/Relative | Broker Algo | Stop/Trailing | Bracket/OCA | Action Principle |
|---|---|---|---|---|---|---|
| Submit ACK lost | Unknown | Unknown | Unknown | Critical if protection | Critical if graph incomplete | Reconcile, no blind retry |
| Cancel ACK lost | Still executable | Still repricing | Algo may still work | Protection may still exist | siblings may still execute | Count exposure until terminal |
| Process crash | Broker order may survive | Broker repricing may survive | Broker algo may survive | protection may survive | graph may survive partially | Rebuild broker truth |
| TWS/session loss | depends | depends | depends | depends | untransmitted orders at special risk | Capability-specific |
| Intent expiry | cancel obligation | cancel obligation | cancel algo | protection may remain intentionally | children depend on position | Do not resurrect stale alpha |
| Manual change | ownership ambiguity | ownership ambiguity | algo semantics changed | protection changed | dependency graph changed | Freeze + reconcile |
| Partial fill | update position | update position | aggregate executions | resize protection | child quantities critical | Re-decision |
| Reject | remain flat maybe | capability issue possible | algo-specific | may leave unprotected position | graph can become incomplete | Severity depends on role |

---

# ‏34. `P0` — Safety Severity צריכה להיגזר מ־Role, לא רק Order Type

‏אותה primitive יכולה להיות:

```text
entry
exit
protective backstop
```

‏ולכן failure severity שונה.

‏לדוגמה:

```text
Limit entry reject
=> missed opportunity
```

‏לעומת:

```text
Limit exit reject
=> position remains open
```

‏ולעומת:

```text
protective Stop reject
=> expected safety layer is absent
```

‏התיקון צריך להוסיף לכל Failure Contract:

```text
role = ENTRY | EXIT | PROTECTION
```

---

# ‏35. `P0` — `READY` צריכה להיות Earned State

‏אחרי reconnect/restart לא חוזרים ל־READY רק מפני שה־socket התחבר.

‏לפחות:

```text
broker connection healthy
open orders reconciled
executions reconciled
positions reconciled
order ownership classified
protection graph valid
no critical UNKNOWN state
critical invariants pass
```

‏רק אז:

```text
READY_FOR_NEW_RISK
```

‏זה צריך להופיע בסוף פרקי Recovery כ־production invariant מרכזי.

---

# ‏36. Acceptance-Test Families שחסרות כריכוז אחד

‏הקורס כבר מכיל בדיקות רבות, אבל כדאי לרכז אותן לפי failure dimension:

### ‏Submit uncertainty

```text
submit accepted + ACK lost
submit rejected + delayed error
transport timeout before known acceptance
```

### ‏Cancel uncertainty

```text
cancel request + late fill
cancel request + partial fill
cancel timeout + order still live
cancel confirmed + execution correction later
```

### ‏Modify uncertainty

```text
modify ACK lost
old version fills during modify
modify reject after partial fill
multiple revisions with delayed callbacks
```

### ‏Restart/reconnect

```text
restart flat + no orders
restart with working entry
restart with partial position
restart with protective stop
restart with bracket graph
restart with unknown/manual order
```

### ‏Protection

```text
entry fills + stop reject
protection resize reject
local exit + old stop race
manual partial close + stale protection quantity
```

### ‏Ownership

```text
other client order
manual TWS modification
second process instance
unknown order during recovery
```

---

# ‏37. מה כבר מכוסה היטב ולא צריך להכפיל

‏לא צריך לכתוב מחדש עשרות עמודים על:

```text
cancel/fill race
partial fill as first-class state
position from executions
command vs fact
reconciliation before new risk
duplicate event idempotency
broker ownership classification
exit ownership
```

‏הנושאים האלה כבר קיימים בעומק גבוה בחלקים 8, 10C ו־10D.

‏ב־Repair Pass נכון יותר:

```text
Define once
→ reference consistently
→ add family-specific delta
```

‏ולא להעתיק מחדש את כל ה־state machine לכל Order Type.

---

# ‏38. מפת תיקון שמוצעת מתוך Review 6

‏בשלב התיקונים, לכל Chapter file רלוונטי נוסיף רק את ה־delta:

```text
Part 3  -> persistence / stale TIF implications
Part 4  -> Hidden/Reserve visibility + recovery owner
Part 5  -> broker repricing + stale-intent failure contract
Part 6  -> trigger/dependency/protection recovery matrix
Part 7  -> broker-algo survival/cancel semantics
Part 8  -> canonical recovery model and vocabulary
Part 9  -> capability degradation for live orders
Part 10 -> operating-mode response and READY gates
```

‏כך נשמור עומק בלי ליצור שמונה גרסאות של אותו Recovery chapter.

---

# ‏39. Checklist לקורס לאחר התיקונים

‏לכל Advanced Order מרכזית נוכל לענות `YES` על:

```text
[ ] ברור איפה ה-order חיה.
[ ] ברור מי מנהל repricing/trigger/dependencies.
[ ] ברור אם היא שורדת process restart.
[ ] ברור מה קורה אם ACK אובד.
[ ] ברור מה קורה אם Cancel מתחרה ב-Fill.
[ ] ברור מה קורה אחרי Partial Fill.
[ ] ברור מה קורה אם ה-intent מתיישן.
[ ] ברור מה קורה אם operator משנה אותה ידנית.
[ ] ברור מהו source of truth ב-recovery.
[ ] ברור מה אסור להניח בזמן UNKNOWN.
[ ] ברור מהו return-to-READY condition.
[ ] קיימת לפחות acceptance test אחת ל-failure הייחודי שלה.
```

---

# ‏40. מסקנת Review 6

‏Production completeness של Advanced Orders אינה נמדדת במספר ה־Order Types שאנחנו יודעים לשלוח.

‏היא נמדדת בשאלה:

> ‏האם אנחנו יודעים מה יכולה כל Order לעשות גם כאשר המערכת שלנו אינה במצב Happy Path.

‏הקורס כבר חזק מאוד ב־general execution correctness.

‏הפער שנותר הוא להפוך את הידע הזה ל־**Failure Contracts עקביים לפי Family**, במיוחד עבור Orders שהן persistent, path-dependent, broker-managed, trigger-based או graph-based.

‏זה ייתן לקורס שכבה מקצועית חשובה מאוד בלי להפוך אותו לקורס כללי על Reliability.

---

# ‏Checkpoint — סוף Review 6

‏Review 6 הושלם ברמת Analysis בלבד; לא שינינו עדיין את הקורס הראשי.

‏הממצאים שלו ייכנסו ל־`Final Gap List` לאחר השלמת שאר ה־Reviews.

‏לאחר ה־Gap List, התיקונים יתבצעו בשלבים נפרדים ועל Chapter files מפוצלים, ורק בסוף יבוצע deterministic assembly למסמך המאוחד ול־Print Viewer.
