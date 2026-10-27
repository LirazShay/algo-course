# ‏חלק 10C — Exit Decision: יציאה, הגנה ו־Ownership

> ‏לפי ה־taxonomy הקנונית ב־`00A-CANONICAL-TAXONOMY-AND-VOCABULARY.md`, הפרק הזה מפריד בין `Application Execution Mode`, ‏`Behavior Candidate`, ‏Protection Architecture, ‏Exit Authority ו־Broker Order lifecycle. אלה שכבות שונות גם כאשר הן פועלות יחד באותה יציאה.
>
> ‏`FACT` — עובדות `IBKR` תלויות־זמן בפרק זה אומתו לאחרונה ב־`2026-10-27`.

---

## ‏10C.1 Exit היא בעיה שונה מ־Entry

‏ב־Entry תמיד קיימת אפשרות מקצועית:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת Position ולכן אי־ביצוע הוא עצמו Risk.

‏לכן Exit Decision אינה Entry Selector עם `SELL` במקום `BUY`. היא צריכה לענות:

```text
What reconciled position actually exists?
How urgent is risk reduction?
What broker protection already exists?
What orders remain potentially executable?
Who owns the authority to create the next exit action?
How much quantity is still safe to exit?
What Economic Price Bound applies to this decision?
```

---

## ‏10C.2 הקלט הוא `ExitContext`

```text
ExitContext {
  evaluated_at
  policy_version

  position_state
  signal_state
  market_state
  order_state
  protection_state
  risk_state
  capability_state
  system_health_state
}
```

‏Exit חייבת לראות גם את Protection שכבר חיה אצל Broker. בלי המידע הזה Local Engine עלולה ליצור Exit חדשה בזמן ש־Stop/Bracket קיימת עדיין יכולה לבצע.

---

## ‏10C.3 Position Truth היא שלושה מושגים

‏המונחים הקנוניים הם:

```text
execution_ledger_position
broker_reported_position
reconciled_position
```

‏אם Entry ביקשה 100 מניות אבל Executions מאומתות יצרו Position של 37, Exit אינה נגזרת מ־requested quantity של 100.

> ‏`ENGINE RULE` — כאשר יש recovery, manual activity או mismatch, פעולה שמגדילה worst-case exit exposure נשענת על `reconciled_position`, לא על requested quantity ולא על local order state בלבד.

---

## ‏10C.4 Exit Disposition אינה `Execution Mode`

‏נרצה outcomes כגון:

```text
HOLD
EXECUTE_EXIT
PROTECTION_ONLY
CANCEL_EXIT
RECONCILE_ONLY
FLAT_CONFIRMED
NO_ACTION
```

‏ורק כאשר disposition היא `EXECUTE_EXIT`, נבחר `Application Execution Mode` כגון:

```text
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
```

‏כך `HOLD`, ‏`RECONCILE_ONLY` ו־`FLAT_CONFIRMED` אינם מתערבבים עם אופן הביצוע של Order.

---

## ‏10C.5 שלוש שכבות החלטה ועוד שכבת Safety

```text
1. STRATEGY EXIT CONDITION
2. EXIT EXECUTION MODE
3. EXIT BEHAVIOR CANDIDATE
4. PROTECTION ARCHITECTURE
```

‏דוגמה:

```text
Strategy condition       = SIGNAL_REVERSAL
ApplicationExecutionMode = FAST_EXIT
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
ProtectionArchitecture   = HYBRID_PROTECTION
```

‏ה־Strategy אומרת למה לצאת; Mode אומרת איזה יחס ל־urgency/risk נדרש; Candidate אומרת כיצד לנסות לבצע; Protection Architecture אומרת איזו שכבת safety קיימת סביב ה־Position.

---

## ‏10C.6 `Exit Authority` ו־`Protection Authority`

‏נפריד שתי סמכויות:

```text
ExitAuthority =
  NONE
  LOCAL_ENGINE
  RECOVERY_CONTROLLER

ProtectionAuthority =
  NONE
  BROKER_PROTECTION
  BROKER_BRACKET
  LOCAL_PROTECTION
```

‏Authority אינה אומרת ששאר Orders אינן יכולות Fill. היא אומרת מי רשאי ליצור שינוי חדש בתחום שלו.

> ‏`ENGINE INVARIANT` — לפני יצירת Exit חדשה צריך לדעת גם מי מחזיק Exit Authority וגם אילו protection/exit Orders עדיין potentially executable.

---

## ‏10C.7 למה Ownership קריטית

‏תרחיש מסוכן:

```text
broker stop is active
local engine decides to exit 100
broker stop triggers concurrently
```

‏אם שתי ה־SELL מתבצעות, Long 100 יכולה להפוך ל־Short 100.

‏לכן Local Exit מתחילה ב־inspection של כל Exit/Protection path שעדיין יכולה לבצע — לא רק בהחלטת מחיר.

---

## ‏10C.8 `Potential Exit Exposure`

‏נחשב לפחות:

```text
potential_exit_qty =
  live_exit_qty
+ cancel_requested_exit_qty
+ cancel_pending_exit_qty
+ triggerable_protection_qty
+ submit_unknown_exit_qty
```

‏ונשווה ל־`reconciled_position`.

> ‏`ENGINE INVARIANT` — Any order without terminal broker evidence remains potentially executable.

---

## ‏10C.9 Quantity Invariant

```text
Do not intentionally create a new exit
if worst-case execution of existing exits + proposed exit
can exceed reconciled position quantity,
unless reversal is explicitly intended.
```

‏במנוע הזה incidental reversal אינה Exit תקינה.

---

## ‏10C.10 `NORMAL_EXIT`

‏`NORMAL_EXIT` היא `Application Execution Mode` המתאימה כאשר Position risk בשליטה, market orderly ויש זמן מסוים לשפר execution quality.

‏Behavior Candidates אפשריות:

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏הבחירה נשארת elimination-first לפי economics, depth, time budget, capabilities ו־Position risk.

---

## ‏10C.11 `NORMAL_EXIT` אינה synonym ל־Passive

‏Normal פירושו שאין emergency regime. אם spread צר, Position קטנה והנזילות מספיקה בתוך `Economic Price Bound`, ‏`MARKETABLE_LIMIT_IOC` יכולה להיות Normal Exit חוקית.

---

## ‏10C.12 `FAST_EXIT`

‏`FAST_EXIT` מתאימה כאשר:

```text
signal reversal is clear
remaining expected edge is near zero or negative
position risk is increasing
missed-exit cost > expected price-improvement benefit
```

‏Speed/certainty מקבלות משקל גבוה יותר, אך quantity invariants ו־Economic Price Bound אינם נעלמים.

---

## ‏10C.13 Candidate טבעית ל־`FAST_EXIT`

‏במניות נזילות Candidate מחקרית מרכזית היא:

```text
MARKETABLE_LIMIT_IOC
```

‏כלומר:

```text
ApplicationExecutionMode = FAST_EXIT
BehaviorCandidate        = MARKETABLE_LIMIT_IOC
BrokerPrimitive          = LMT
BrokerTIF                = IOC
Limit                    = Exit Economic Price Bound
```

‏אם נשארת Position אחרי Partial Fill, מתבצעת Exit Decision חדשה.

---

## ‏10C.14 `FAST_EXIT` אינה Chase בלתי מוגבל

‏Price movement נגדנו אינו אישור אוטומטי להרחיב Bound.

‏נדרש:

```text
fresh market snapshot
fresh risk state
reconciled remaining position
potentially executable exits
fresh Economic Price Bound
```

‏כל escalation היא Decision חדשה.

---

## ‏10C.15 `EMERGENCY_REDUCE`

‏זה Mode שונה איכותית, למשל כאשר:

```text
position is unprotected
hard risk boundary breached
system degraded while exposure exists
broker inconsistency creates material risk
market moves violently against position
```

‏המטרה היא reduction של exposure במהירות ובבטיחות יחסית — לא price optimization רגילה.

---

## ‏10C.16 Emergency אינה `send Market blindly`

‏גם Emergency יכולה לעבוד עם guardrails כגון:

```text
emergency_economic_price_bound
max_order_size_per_attempt
session constraints
halt awareness
position reconciliation
```

‏ה־Policy משנה את סדר העדיפויות; היא אינה מבטלת controls.

---

## ‏10C.17 Emergency Ladder היא Series of Decisions

```text
attempt
→ observe executions/order truth
→ reconcile remaining position
→ fresh risk/market snapshot
→ new emergency decision
```

‏אפשר להרחיב Bound רק במסגרת Policy מפורשת ומצטברת; אין continuation עיוור.

---

## ‏10C.18 Protection Architectures אינן Exit Modes

‏שלוש architectures מרכזיות למחקר:

```text
CLIENT_MANAGED_EXIT
BROKER_BRACKET
HYBRID_PROTECTION
```

‏ובנוסף אפשר להשתמש ב־`STOP_BACKSTOP` כ־Protection mechanism בתוך architecture מתאימה.

‏אלו אינן values של `ApplicationExecutionMode`.

---

## ‏10C.19 `STOP_BACKSTOP`

‏Stop Backstop היא שכבת Protection שמטרתה להקטין dependence ב־local process.

```text
Local engine = dynamic NORMAL_EXIT / FAST_EXIT
Broker Stop  = last-resort protection
```

‏ה־Stop היא Trigger + post-trigger execution semantics; היא אינה “Exit intelligence” מלאה.

---

## ‏10C.20 Stop Trigger אינה Fill Price

‏Trigger אומר מתי Stop מופעלת; הוא אינו Fill guarantee.

‏Telemetry צריכה להפריד:

```text
stop_trigger_price
trigger_timestamp
actual_fill_price
slippage_from_trigger
```

---

## ‏10C.21 `Stop Limit` כ־Backstop

‏Stop-Limit מחליפה חלק מ־price uncertainty ב־non-fill risk לאחר Trigger.

‏לכן השאלה היא:

```text
Do we prioritize price protection
or
position reduction certainty?
```

‏התשובה היא Policy/Context dependent.

---

## ‏10C.22 `BROKER_BRACKET`

‏`BROKER_BRACKET` היא Protection/Composite Architecture, לא `Application Execution Mode`.

‏יתרונות אפשריים:

```text
protection can be staged with entry
relationships live outside local strategy logic
survivability can improve relative to client-only exits
```

‏חסרונות:

```text
less signal-aware
partial-fill / child lifecycle complexity
sibling-cancel races
reconciliation complexity
```

> ‏`ACCEPTANCE TEST REQUIRED` — Parent partial-fill → child activation/quantity semantics נשארות unresolved עבור ה־API/Product/Route הספציפיים עד evidence אמפירי.

---

## ‏10C.23 `HYBRID_PROTECTION`

```text
broker-resident protective backstop
+
local signal-aware exit intelligence
```

‏Hybrid יכולה לשלב survivability של Broker עם Exit דינמית, אך רק כאשר Exit Authority, Protection Authority, quantity budgets ו־handoff protocol מוגדרים היטב.

---

## ‏10C.24 Handoff בין Authorities אינו Atomic

‏כאשר Local Exit אמורה לקחת אחריות מ־Broker Protection, קיימות שתי סכנות מנוגדות:

```text
cancel protection too early
=> unprotected window

submit local exit too early
=> overlap / double-exit risk
```

‏לכן אין sequence אוניברסלי של “cancel first” או “exit first”. ה־Policy חייבת להעריך urgency, broker semantics ו־worst-case overlap.

---

## ‏10C.25 Protection Handoff הוא Protocol מפורש

‏נרצה states כגון:

```text
BROKER_PROTECTED
HANDOFF_TO_LOCAL_EXIT
LOCAL_EXIT_IN_FLIGHT
BROKER_PROTECTION_CANCEL_REQUESTED
BROKER_PROTECTION_CANCEL_PENDING
FLAT_VERIFYING
FLAT_CONFIRMED
```

> ‏`ENGINE INVARIANT` — transition בין Protection Authority ל־Exit Authority אינה evidence ש־Order הישנה חדלה להיות executable.

---

## ‏10C.26 Partial Position משנה Protection מיד

‏אם Entry התמלאה ב־37:

```text
reconciled_position = 37
```

‏Protection requirement נגזרת מ־37, לא מ־target 100.

‏אם late fill מגדילה את Position ל־63, Protection coverage חייבת לעבור fresh reconciliation; אין להניח שה־child quantity השתנתה בדיוק כפי שרצינו.

---

## ‏10C.27 Position Qty, Protected Qty ו־Potential Exit Qty

‏נשמור במפורש:

```text
reconciled_position_qty
broker_protective_qty
local_exit_potential_qty
cancel_pending_exit_qty
unknown_exit_qty
```

‏Invariants עקרוניים:

```text
intentional protected qty should not exceed reconciled position qty
```

‏וגם:

```text
required protection coverage must not remain below policy minimum
beyond an explicitly bounded unprotected window
```

---

## ‏10C.28 `Unprotected Window` הוא Metric

```text
entry_fill_ts
protection_active_ts
unprotected_window_ms
```

‏וב־handoff:

```text
protection_cancel_effective_ts
local_exit_fill_ts
handoff_unprotected_ms
```

‏כך architecture נמדדת גם לפי survivability, לא רק לפי P&L.

---

## ‏10C.29 Broker Child Rejection הוא Risk Incident

‏אם Position קיימת ו־protective child נדחתה:

```text
POSITION_UNPROTECTED
```

‏Policy צריכה לבחור מראש בין actions כגון:

```text
retry valid protection path
place alternate validated protection
reduce position
freeze new entries
```

‏Capability failure אינה autorization אוטומטית לפעולה אגרסיבית אחרת; היא מפעילה fresh safety decision.

---

## ‏10C.30 Double Exit Prevention

‏לפני Exit חדשה:

```text
worst_case_total_exit_qty =
  already_filled_exit_qty
+ potentially_executable_existing_exit_qty
+ proposed_new_exit_qty
```

‏ה־proposed action חייבת להישאר בתוך quantity budget של `reconciled_position`, אלא אם reversal מכוונת ומאושרת בנפרד.

---

## ‏10C.31 `OCA/OCO` אינה Transactional Atomicity

‏OCA/OCO היא Coordination Relationship. גם כאשר Broker מספקת cancel/proportional-reduction semantics, sibling ב־cancel path נשאר potentially executable עד terminal evidence.

```text
SIBLING_CANCEL_REQUESTED
SIBLING_CANCEL_PENDING
```

‏הם מצבי lifecycle אמיתיים, לא proof שה־risk נעלם.

---

## ‏10C.32 Profit-Taker Partial Fill

‏נניח Long 100 ו־TP ביצעה 40. אחרי reconciliation:

```text
remaining_position = 60
```

‏Protection צריכה להתאים ל־remaining position. Partial Exit מפעילה fresh decision/reconciliation של כל siblings וה־Protection Graph.

---

## ‏10C.33 Stop Trigger בזמן Sibling Cancel

‏Race אפשרי:

```text
TP fills
stop cancel requested
market moves
stop triggers before cancel becomes terminal
```

‏אין לסמוך על coordination כאילו היא transaction. Executions הן Facts, וכל חריגה מוחזרת ל־position reconciliation ול־risk handling.

---

## ‏10C.34 `FLAT_CONFIRMED` הוא State שצריך להרוויח

‏לא מכריזים Flat מפני ששלחנו Exit בגודל Position.

‏נדרשים לפחות:

```text
reconciled_position == 0
no potentially executable exits
no unknown exit/protection orders
executions reconciled
broker position reconciled
```

‏רק אז:

```text
FLAT_CONFIRMED
```

---

## ‏10C.35 Exit בזמן Cancel

‏אם Exit ישנה נמצאת ב־`CANCEL_REQUESTED`, ‏`CANCEL_PENDING` או `CANCEL_UNKNOWN`, אין לשלוח replacement מלא כאילו היא מתה.

‏Replacement quantity נגזרת מ־worst-case exposure.

---

## ‏10C.36 `Modify` מפוצל לשלושה Mechanisms

‏כפי שנקבע בחלק 8:

```text
MODIFY_IN_PLACE
CANCEL_THEN_NEW
OVERLAPPED_REPLACEMENT
```

‏`MODIFY_IN_PLACE` מתאימה רק כאשר ה־Broker/path וה־field change תומכים בכך בבטחה.

‏מעבר בין Behavior families, למשל Passive ל־`MARKETABLE_LIMIT_IOC`, אינו “modify” סמנטי אוטומטי. בדרך כלל הוא דורש cancel/reconcile/new או overlap מפורש תחת quantity budget.

---

## ‏10C.37 Queue Priority מול Exit Urgency

‏ב־`NORMAL_EXIT`, queue context יכולה להיות נכס. ב־`FAST_EXIT`, אותו queue context יכולה להפוך ל־sunk cost.

‏Queue לעולם אינה גוברת על signal invalidation, protection failure או hard risk boundary.

---

## ‏10C.38 `HOLD`, ‏`NO_ACTION` ו־`RECONCILE_ONLY`

‏אלה outcomes שונים:

```text
HOLD
=> keep position intentionally under current policy

NO_ACTION
=> no new side effect is required this cycle

RECONCILE_ONLY
=> uncertainty blocks a new exit command until broker/position truth is rebuilt
```

‏Reason codes לדוגמה:

```text
HOLD_SIGNAL_VALID
HOLD_PROTECTION_ACTIVE
NO_ACTION_EXISTING_EXIT_STILL_VALID
RECONCILE_EXIT_OWNERSHIP_UNKNOWN
```

---

## ‏10C.39 Signal Exit מול Risk Exit

‏נפריד:

```text
SIGNAL_REVERSAL
```

‏מ־:

```text
RISK_BOUNDARY_BREACHED
```

‏Signal reversal יכולה לבחור `NORMAL_EXIT`/`FAST_EXIT`; hard risk breach יכולה להוביל ל־`EMERGENCY_REDUCE` גם אם ה־Strategy עדיין חיובית.

---

## ‏10C.40 Profit Target אינה Exit Engine מלאה

‏Profit-taking Limit אינה יודעת לבדה אם momentum reversed, spread השתנה, liquidity נעלמה או Signal expired.

‏היא יכולה להיות Child שימושית ב־Protection/Exit structure, אך אינה תחליף ל־Exit Decision.

---

## ‏10C.41 Stop אינה Exit Intelligence מלאה

‏Stop יודעת Trigger semantics. היא אינה יודעת בהכרח על signal decay, opportunity supersession או private strategy state.

‏לכן `STOP_BACKSTOP` היא Safety mechanism, לא מוח האסטרטגיה.

---

## ‏10C.42 Trailing Protection

‏Trailing יכולה להיות Candidate כאשר רוצים broker-managed moving trigger, אך היא path-dependent ועלולה להגיב לרעש.

‏Candidate נשארת רלוונטית רק אם trail policy מתאימה ל־holding horizon ול־normal microstructure noise שנמדדה.

---

## ‏10C.43 `Adjustable Stop`

‏Adjustable Stop מסווגת כ־Transforming Order: trigger מסוים משנה את semantics של Order קיימת לפי Broker-managed rule.

‏היא יכולה לשמש למחקר survivability, אך אינה מחליפה Local Exit Decision משום שה־Broker אינה יודעת את private Signal state שלנו.

---

## ‏10C.44 Exit בזמן Market Data Stale

‏ב־Entry, stale data בדרך כלל חוסמת Risk חדש. ב־Exit עם Position קיימת היא מצב מורכב יותר.

‏המערכת יכולה לעבור ל־:

```text
EXIT_ONLY
PROTECTION_ONLY
EMERGENCY_REDUCE
```

‏בהתאם ל־Broker truth, protection ו־Risk Policy.

---

## ‏10C.45 Exit בזמן Broker Disconnect

‏Disconnect מפחיתה observability/control; היא אינה הוכחה ש־Broker-resident Orders נעלמו.

‏ב־recovery לא יוצרים replacement על בסיס local assumption. קודם rebuild של Broker state, Executions, Position, Protection Graph ו־ownership.

---

## ‏10C.46 `Broker-Resident` ו־`Broker-Simulated` אינם Synonyms

‏Protection יכולה להיות Broker-resident גם אם mechanism מסוים simulated אצל Broker; ולהפך, classification של implementation אינה לבדה proof של survivability.

‏נשמור בנפרד:

```text
implementation_kind
residency_state
```

‏כפי שנקבע ב־Part 9.

---

## ‏10C.47 `UNTRANSMITTED != PROTECTED`

> ‏`FACT` — `Order.transmit=false` יוצרת ב־TWS Order שלא נשלחה ל־IB server; לפי התיעוד שנבדק היא זמינה רק באותה session ונמחקת ב־restart.

‏לכן:

```text
UNTRANSMITTED
!=
BROKER_PROTECTED
```

‏Protection נחשבת פעילה רק לאחר transmission/evidence המתאים למסלול שנבחר.

---

## ‏10C.48 Parent/Child Identity

‏ב־IBKR רלוונטיים בין היתר:

```text
orderId
permId
parentId
clientId
```

‏Recovery ממפה אותם ל־internal trade/position identity ול־Protection Graph שלנו.

---

## ‏10C.49 Protection Graph

```text
Position
 ├── Entry order(s)
 ├── Profit exit(s)
 ├── Protective stop(s)
 └── Local exit intent(s)
```

‏Relations לדוגמה:

```text
protects
replaces
cancels_with
belongs_to
```

‏כך recovery אינה תלויה ב־boolean כגון `bracketActive=true`.

---

## ‏10C.50 Exit Lifecycle מול System Mode

‏אלו dimensions שונים.

‏Exit lifecycle יכולה לכלול:

```text
EXIT_EVALUATING
EXIT_WORKING
EXIT_PARTIAL
HANDOFF_IN_PROGRESS
SIBLING_CANCEL_PENDING
FLAT_VERIFYING
FLAT_CONFIRMED
```

‏System operating mode יכולה להיות במקביל:

```text
READY
EXIT_ONLY
DEGRADED
EMERGENCY
RECOVERING
FROZEN
```

‏אין לדחוס אותן ל־state machine אחת.

---

## ‏10C.51 Exit Decision Tree ראשוני

```text
if reconciled_position == 0:
    if potentially_executable_exit_qty == 0 and no exit uncertainty:
        return FLAT_CONFIRMED
    return RECONCILE_ONLY

if broker/position truth is materially unknown:
    return RECONCILE_ONLY or emergency policy according to risk

if position is unprotected:
    prioritize protection / EMERGENCY_REDUCE

if hard risk boundary breached:
    mode = EMERGENCY_REDUCE
else if signal reversal / edge gone:
    mode = FAST_EXIT
else if normal exit condition:
    mode = NORMAL_EXIT
else:
    return HOLD or NO_ACTION

filter behavior candidates through capability + quantity + economic bounds
select one legal behavior
```

---

## ‏10C.52 Candidate Set ל־`NORMAL_EXIT`

```text
PASSIVE_JOIN
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏Selector משתמש רק ב־Candidates שעברו Capability/Enablement gates.

---

## ‏10C.53 Candidate Set ל־`FAST_EXIT`

```text
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏Midpoint/Passive behaviors יכולות להישאר רק אם measured useful-fill latency עדיין מתאימה ל־Risk budget.

---

## ‏10C.54 Candidate Set ל־`EMERGENCY_REDUCE`

‏המטרה היא exposure reduction תחת Policy מפורשת. Candidate חייבת להיבדק מול:

```text
reconciled position
potential exits
market state
session
halt state
liquidity
capability
economic / emergency price bound
```

‏`Market` אינה hidden fallback; אם תישקל בעתיד, היא חייבת להיות branch מפורש עם acceptance/risk policy משלה.

---

## ‏10C.55 Exit Time Budget

```text
normal_exit_application_ttl_ms
fast_exit_application_ttl_ms
emergency_step_application_ttl_ms
```

‏אלה `application_order_ttl`/decision budgets — לא `broker_tif`.

‏ב־Emergency expiry של step אינו אומר “לוותר”; הוא מפעיל fresh risk decision.

---

## ‏10C.56 Partial Exit היא Decision State חדשה

‏Position 100 ו־IOC שמכרה 65 אינה “Exit של 100 שעדיין ממשיכה”. אחרי reconciliation יש Position 35, protection/potential exits חדשים ו־Market חדש.

```text
apply execution facts
→ reconcile position/protection
→ fresh market/risk state
→ new Exit Decision
```

---

## ‏10C.57 Dust Position

‏אם נשארת quantity קטנה מאוד, Policy יכולה לסווג אותה `DUST_POSITION` ולבחור action ייעודי. ההגדרה היא כלכלית/תפעולית, לא מספר shares אוניברסלי.

---

## ‏10C.58 External/Manual Position Change משנה Ownership Assumptions

‏אם Position או Order השתנו ידנית/על ידי client אחר:

```text
externally_changed = true
ownership_revalidation_required = true
```

‏אין להמשיך modifications אוטומטיות כאילו ownership לא השתנתה. קודם reconcile Position, live exits, protection qty ו־authority.

---

## ‏10C.59 Reconnect Exit Recovery היא Position-First

```text
freeze new entries
reconcile executions
reconcile broker position
rebuild open orders
rebuild protection graph
classify ownership / authorities
validate quantities
validate protection
```

‏Position Truth קודמת לשחזור intent הישן.

> ‏`ENGINE RULE` — Recovery אינה מחיה Signal או Exit intent שפגו בזמן הניתוק.

---

## ‏10C.60 `READY` צריך להרוויח מחדש

‏Reconnect אינו Ready.

‏חזרה ל־`READY` דורשת לפחות:

```text
reconciled position
classified live orders
known protection state
no unresolved material exit exposure
critical invariants pass
```

‏אם Position קיימת ו־Protection חסרה, המערכת נשארת במצב safety מתאים ולא חוזרת ל־normal entry flow.

---

## ‏10C.61 Exit Telemetry

```text
exit_decision_id
reconciled_position_qty_at_decision
application_execution_mode
exit_authority
protection_authority
protection_architecture
protected_qty
potential_exit_qty
behavior_candidate
selection_reason_code
requested_exit_qty
filled_exit_qty
remaining_reconciled_position_qty
economic_price_bound
stop_trigger_price
stop_trigger_ts
protection_cancel_request_ts
protection_cancel_terminal_ts
local_exit_submit_ts
first_exit_fill_ts
flat_confirmed_ts
unprotected_window_ms
handoff_window_ms
```

---

## ‏10C.62 Metrics מרכזיים

```text
time_from_exit_signal_to_first_fill
full_exit_latency
partial_exit_rate
exit_slippage_bps
exit_markout
emergency_escalation_count
unprotected_time_ms
double_exit_incidents
orphan_exit_incidents
stop_trigger_to_fill_slippage
stop_limit_nonfill_rate
handoff_failure_rate
reconnect_to_protected_state_ms
```

‏אלה Execution + Safety metrics, לא רק average exit price.

---

## ‏10C.63 Failure Matrix ל־Exit

| מצב | סיכון | Destination עקרוני |
|---|---|---|
| ‏Position קיימת, protection חסרה | Unprotected exposure | ‏Protect / Reduce / Freeze Entries |
| ‏Local exit + Stop פעילות יחד | Double exit | ‏Authority + quantity budget |
| ‏TP partial | Protection גדולה מדי | ‏Reconcile / resize safely |
| ‏Stop triggered, sibling cancel pending | Both can fill | ‏Treat sibling as executable |
| ‏Exit cancel pending | Replacement overlap | ‏Bound worst-case qty |
| ‏Disconnect עם Position | Unknown broker truth | ‏Recovery gate |
| ‏Manual partial close | Ownership/protection mismatch | ‏Reconcile authorities |
| ‏Child rejected | Position unprotected | ‏Fresh protection/risk decision |
| ‏Stop-Limit triggered, no fill | Position remains | ‏Fresh Fast/Emergency decision |
| ‏Market halt | Exit path constrained | ‏Preserve truth/protection, reevaluate |
| ‏Data stale | Local decision quality degraded | ‏Exit-only / protection policy |
| ‏Both exits filled | Position reversed | ‏Incident + neutralization policy |

---

## ‏10C.64 Acceptance Tests

```text
1. Normal exit full fill
2. Normal exit partial fill
3. Fast exit full fill
4. Fast exit partial -> fresh decision
5. Emergency reduce multi-step
6. Broker stop active + local exit requested
7. Stop triggers during local exit
8. TP partial then protection reconciliation
9. Stop cancel pending then local exit
10. Local exit fills while stop cancel pending
11. Both exits fill unexpectedly
12. Parent partial + child activation/qty observation
13. Child rejected after entry fill
14. Manual partial close while bracket active
15. Disconnect with protected position
16. Disconnect with unprotected position
17. Restart with bracket still live
18. Stop trigger with gap
19. Stop-Limit trigger without fill
20. Data stale while broker stop remains active
21. Dust position after partial exit
22. Capability failure during exit
23. Old-generation callback after reconnect
24. Flat verification with no live exits
25. untransmitted child is never classified as protected
26. handoff never assumes cancel atomicity
```

---

## ‏10C.65 Property Tests

```text
new local exit must never increase worst-case exit qty beyond reconciled position
smaller reconciled position must never leave larger intentionally active protection
cancel-pending exit must continue to consume exit quantity budget
signal invalidation may increase urgency but must not bypass quantity invariants
unknown broker state must never produce an unbounded replacement order
FLAT_CONFIRMED requires zero reconciled position and zero potentially executable exits
UNTRANSMITTED must never imply BROKER_PROTECTED
```

---

## ‏10C.66 Recommendation ל־V1 Exit Architecture

‏למחקר נשווה:

```text
A. CLIENT_MANAGED_EXIT
B. BROKER_BRACKET
C. HYBRID_PROTECTION
```

‏`HYBRID_PROTECTION` מעניינת במיוחד משום שהיא משלבת broker survivability עם local signal-aware exit, אך היא דורשת handoff/race tests קשים יותר.

‏זו Research Architecture, לא Production default אוטומטי.

---

## ‏10C.67 למה לא לבחור Architecture לפי P&L בלבד

‏Architecture צריכה להימדד גם לפי:

```text
execution quality
unprotected time
recovery correctness
double-exit risk
operational complexity
broker dependency
```

‏Trade Outcome ו־Execution/Protection Quality הם dimensions שונים.

---

## ‏10C.68 Why / When / Why Not — `NORMAL_EXIT`

### ‏Why

‏מאפשר price improvement כאשר Risk עדיין בשליטה.

### ‏When

‏Market orderly, Position מוגנת ויש זמן מסוים לעבוד את ה־Exit.

### ‏Why Not

‏כאשר missed-exit cost עולה מהר או Protection אינה אמינה.

---

## ‏10C.69 Why / When / Why Not — `FAST_EXIT`

### ‏Why

‏מקצר exposure כאשר trade thesis מתפרקת.

### ‏When

‏Reversal/edge decay מהותיים ו־position risk עולה.

### ‏Why Not

‏כאשר aggressive execution cost גדול יותר מה־risk reduction שהיא מספקת תחת ה־Policy.

---

## ‏10C.70 Why / When / Why Not — `EMERGENCY_REDUCE`

### ‏Why

‏מעדיף הורדת Risk על price optimization רגילה.

### ‏When

‏Unprotected position, hard risk breach או system degradation מהותי.

### ‏Why Not

‏לא להפוך noise רגיל ל־Emergency; זה Mode בטיחותי, לא default execution style.

---

## ‏10C.71 Why / When / Why Not — `BROKER_BRACKET`

### ‏Why

‏Protection/relationships יכולות להתקיים מחוץ ל־local strategy loop.

### ‏When

‏Survivability חשובה וה־partial/race/recovery semantics עברו acceptance testing.

### ‏Why Not

‏כאשר dynamic exit משתנה מהר וה־coordination complexity אינה מוצדקת.

---

## ‏10C.72 Why / When / Why Not — `HYBRID_PROTECTION`

### ‏Why

‏משלב Broker backstop עם Local intelligence.

### ‏When

‏Signal-aware exit חשובה אבל אסור להישאר ללא protection בזמן local failure.

### ‏Why Not

‏כאשר אין State Machine שמסוגלת לנהל authority handoff, potential exposure ו־double-exit prevention.

---

## ‏10C.73 Practitioner Rules — Exit

1. ‏Exit היא קודם בעיית Ownership ו־quantity truth; המחיר מגיע אחר כך.
2. ‏`CANCEL_REQUESTED`, ‏`CANCEL_PENDING` ו־`CANCEL_UNKNOWN` אינם terminal.
3. ‏`FLAT_CONFIRMED` הוא state שמוכיחים, לא intent.
4. ‏Protection Authority ו־Exit Authority יכולות להיות שונות; handoff אינו atomic.
5. ‏Partial Exit יוצרת Decision State חדשה.
6. ‏Stop יכולה להיות backstop מצוין ועדיין לא להיות Normal Exit טובה.
7. ‏Stop-Limit מחליפה price uncertainty ב־non-fill risk.
8. ‏Emergency משנה priorities; היא לא מבטלת quantity/bound controls.
9. ‏Broker-resident protection מקבלת את עיקר ערכה דווקא ב־failure path.
10. ‏Architecture נבחנת גם ב־recovery, restart ו־manual-intervention paths.

---

# ‏עובדות `IBKR` שאומתו עבור 10C

- ‏`FACT` — `Order.parentId` משמש לקשר parent/child, כולל attached/bracket orders.
- ‏`FACT` — `Order.transmit=false` משאיר Order ב־TWS ולא שולח אותה ל־IB server; לפי התיעוד שנבדק Orders כאלה זמינות רק באותה session ונמחקות ב־restart.
- ‏`FACT` — `Order.ocaType` תומך ב־cancel/proportional-reduction modes, אך הקורס אינו מפרש זאת כ־transactional atomicity.
- ‏`FACT` — `triggerMethod` הוא חלק מ־Stop semantics עבור simulated stops.
- ‏`FACT` — Modify ב־TWS API נעשית באמצעות `placeOrder` עם אותו `orderId`; התיעוד ממליץ לצמצם in-place changes לשדות מתאימים במקום להשתמש ב־modify כ־arbitrary transformation.
- ‏`FACT` — Binding של Order חיצונית יכולה לכלול cancel/resubmit ולהשפיע על queue priority, ולכן recovery/control action יכולה לשנות execution economics.

---

# ‏מקורות רשמיים לחלק 10C

- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — Placing Orders / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>
- ‏IBKR — Order Types and Algos / Stops and Adjustable Stop: <https://www.interactivebrokers.com/en/trading/ordertypes.php>

---

# ‏Checkpoint — סוף חלק 10C

‏בחלק הזה Exit נורמלה לאותן שכבות קנוניות של שאר הקורס: `NORMAL_EXIT`, ‏`FAST_EXIT` ו־`EMERGENCY_REDUCE` הן `Application Execution Modes`; ‏`Behavior Candidate` מתארת את דרך הביצוע; ‏`STOP_BACKSTOP`, ‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION` שייכות ל־Protection Architecture; ו־Exit Authority/Protection Authority קובעות מי רשאי ליצור שינוי חדש בכל רגע.

‏העיקרון המרכזי הוא: **לפני בחירת מחיר או Candidate, המנוע חייב לדעת מהי `reconciled_position`, אילו Exit/Protection Orders עדיין potentially executable, מי מחזיק Authority, ומהו worst-case quantity אם כמה paths יבוצעו יחד. כל Partial Fill, fallback, escalation או handoff מחייבים fresh decision/reconciliation לפי המצב החדש.**
