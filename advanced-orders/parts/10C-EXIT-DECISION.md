# ‏חלק 10C — Exit Decision: יציאה, הגנה ו־Ownership

> ‏מקטע עצמאי לקורס `Advanced Order Mastery`. בסוף הפרויקט הוא יאוחד חזרה למסמך הראשי.
>
> ‏אימות עובדות IBKR תלויות־זמן: `2026-10-27`.

---

## ‏10C.1 Exit היא בעיה שונה מ־Entry

‏ב־Entry תמיד קיימת אפשרות מקצועית:

```text
NO_TRADE
```

‏ב־Exit כבר קיימת Position ולכן אי־ביצוע הוא עצמו Risk.

‏לכן Decision Engine של Exit אינה העתק של Entry Selector עם `SELL` במקום `BUY`.

‏היא צריכה לענות:

```text
What position actually exists?
How urgent is risk reduction?
What broker protection already exists?
What orders can still execute?
Who currently owns the right to send the next exit?
How much quantity is still safe to sell?
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

‏נקודת המפתח: Exit רואה גם את ה־Protection שכבר חיה אצל Broker.

‏בלי זה המנוע המקומי עלול לשלוח יציאה חדשה בזמן ש־Stop/Bracket כבר מסוגלת לבצע את אותה כמות.

---

## ‏10C.3 מקור האמת לכמות הוא Position שבוצעה בפועל

‏אם Entry ביקשה:

```text
100 shares
```

‏אבל קיבלנו:

```text
37 filled
```

‏אז ה־Exit baseline היא:

```text
37 shares
```

‏לא 100.

‏כל Exit quantity חייבת להיגזר מ־executions / broker position reconciliation, לא מ־requested entry quantity.

---

## ‏10C.4 Exit Permission אינה רק `ALLOW / DENY`

‏נרצה outcomes כגון:

```text
HOLD
NORMAL_EXIT
FAST_EXIT
EMERGENCY_REDUCE
PROTECTION_ONLY
CANCEL_EXIT
RECONCILE_ONLY
FLAT_CONFIRMED
```

‏`HOLD` היא החלטה מפורשת: Position קיימת אבל כרגע אין הצדקה לצאת.

‏`RECONCILE_ONLY` אומר שאסור לשלוח Exit נוספת עד שנבין מה עדיין חי אצל Broker.

---

## ‏10C.5 ארבע שכבות Exit שונות

```text
1. STRATEGY EXIT
2. EXECUTION EXIT
3. PROTECTIVE EXIT
4. EMERGENCY RISK REDUCTION
```

### ‏`STRATEGY EXIT`

‏ה־Signal אומר שה־trade thesis הסתיימה או נחלשה.

### ‏`EXECUTION EXIT`

‏החלטה כיצד לבצע את הסגירה בפועל: passive, aggressive, IOC, algo וכו'.

### ‏`PROTECTIVE EXIT`

‏Stop/Bracket/Backstop שמטרתם להקטין Risk גם אם התהליך המקומי נכשל.

### ‏`EMERGENCY RISK REDUCTION`

‏מצב שבו Exposure reduction חשובה יותר מאופטימיזציית מחיר רגילה.

‏אסור לערבב ביניהן, כי לכל אחת סמכות ו־failure modes אחרים.

---

## ‏10C.6 `Exit Ownership` — העיקרון המרכזי של החלק

‏בכל רגע צריך להיות ברור מי רשאי ליזום את ה־Exit הבאה.

‏נגדיר למשל:

```text
ExitOwner =
  NONE
  LOCAL_ENGINE
  BROKER_PROTECTION
  BROKER_BRACKET
  RECOVERY_CONTROLLER
```

‏Ownership אינה אומרת ששאר Orders אינן יכולות Fill; היא אומרת מי רשאי **ליצור שינוי חדש** כרגע.

---

## ‏10C.7 למה Ownership קריטית

‏תרחיש מסוכן:

```text
broker stop is active
local engine sees reversal
local engine sends SELL 100
broker stop triggers almost simultaneously
```

‏אם שתי ה־SELL מתבצעות:

```text
Long 100
- local sell 100
- stop sell 100
= Short 100
```

‏זו `Double Exit`.

‏לכן Local Exit אינה רק "שלח SELL". היא מתחילה ב־inspection של כל protection/orders שכבר עלולות לבצע.

---

## ‏10C.8 `Potential Exit Exposure`

‏נחשב:

```text
potential_exit_qty =
  live_exit_qty
+ cancel_pending_exit_qty
+ triggerable_protection_qty
+ submit_unknown_exit_qty
```

‏ו־Risk Engine צריכה לדעת את היחס ל־:

```text
confirmed_position_qty
```

‏Order ב־`CANCEL_PENDING` עדיין נחשבת potentially executable.

---

## ‏10C.9 Invariant מרכזי

```text
Do not intentionally create a new exit
if worst-case execution of existing exits + new exit
can exceed the position quantity,
unless reversal is explicitly intended.
```

‏במנוע שלנו reversal incidental אינו מותר.

‏המטרה היא להגיע ל־Flat, לא לפתוח Short בטעות.

---

## ‏10C.10 `NORMAL_EXIT`

‏`NORMAL_EXIT` מתאימה כאשר:

```text
position risk is controlled
signal has weakened / target reached
market remains orderly
there is enough time to optimize execution
```

‏Candidates אפשריות יכולות לכלול:

```text
PASSIVE_LIMIT
MIDPRICE
RELATIVE
ADAPTIVE_LIMIT_URGENT/NORMAL
AGGRESSIVE_CAPPED_LIMIT
```

‏הבחירה עצמה עוברת Elimination לפי spread, depth, signal state ו־time budget.

---

## ‏10C.11 `NORMAL_EXIT` אינה חייבת להיות פסיבית

‏אם Spread צר מאוד וה־position קטנה ביחס ל־Bid depth, ייתכן ש־aggressive capped limit היא דווקא Normal Exit טובה יותר.

‏Normal אומר:

```text
no emergency regime
```

‏לא:

```text
must wait passively
```

---

## ‏10C.12 `FAST_EXIT`

‏`FAST_EXIT` מופעלת כאשר:

```text
signal reversal is clear
remaining expected edge is near zero or negative
position risk is increasing
missed-exit cost > spread savings
```

‏ה־priority משתנה:

```text
speed and certainty rise
price improvement becomes secondary
```

‏אבל hard risk boundaries עדיין קיימות.

---

## ‏10C.13 Candidate טבעית ל־FAST_EXIT

‏במניות נזילות, Candidate מחקרית מרכזית היא:

```text
aggressive / marketable Limit
possibly with IOC-style immediate attempt
```

‏למה?

```text
attempt immediate liquidity
preserve explicit worst acceptable price
avoid stale remainder when IOC is used
```

‏אם partial exit נשארה, המנוע מבצע Decision חדשה על ה־remaining position.

---

## ‏10C.14 `FAST_EXIT` אינה Chase בלתי מוגבל

‏גם כאשר urgency גבוהה:

```text
price moves away
```

‏אינו אישור אוטומטי להרחיב cap שוב ושוב.

‏נדרש:

```text
new market snapshot
new risk state
remaining position
remaining liquidity
new allowed emergency bound
```

‏כל escalation היא Decision חדשה.

---

## ‏10C.15 `EMERGENCY_REDUCE`

‏זה mode שונה איכותית.

‏הוא מיועד למצבים כגון:

```text
position is unprotected
critical signal failure
system degraded while exposure exists
broker inconsistency with risk
market moves violently against position
```

‏המטרה המרכזית:

```text
reduce exposure safely and quickly
```

‏ולא להשיג execution מושלמת.

---

## ‏10C.16 Emergency אינה אומרת `send Market blindly`

‏גם במצב חירום אפשר עדיין להשתמש ב־guardrails כגון:

```text
max emergency slippage bound
max order size per attempt
session constraints
halt awareness
position reconciliation
```

‏הבדל ה־Policy הוא שהעלות של Position שנותרת פתוחה מקבלת משקל גבוה בהרבה.

---

## ‏10C.17 Emergency Ladder

‏במקום פקודה אחת אינסופית:

```text
attempt 1
→ observe result
→ recompute remaining exposure
→ attempt 2 under wider but bounded rule
→ continue until flat / safety stop
```

‏המדרגות חייבות להיות finite, measurable ו־policy-driven.

---

## ‏10C.18 `STOP_BACKSTOP`

‏Stop Backstop היא שכבת Broker-resident שמטרתה להישאר קיימת גם כאשר המנוע המקומי אינו מסוגל להגיב.

‏היא אינה חייבת להיות ה־Normal Exit שלנו.

‏המודל:

```text
Local engine = smart normal/fast exit
Broker Stop  = last-resort protection
```

‏זה הבסיס ל־Hybrid Protection.

---

## ‏10C.19 Stop Trigger אינה Fill Price

‏Stop אומרת מתי protection נכנסת לפעולה.

‏היא אינה מבטיחה execution בדיוק במחיר ה־trigger.

‏ב־gap/volatility אפשר לקבל Fill גרועה יותר.

‏לכן telemetry חייבת להפריד:

```text
stop_trigger_price
trigger_timestamp
actual_fill_price
slippage_from_trigger
```

---

## ‏10C.20 `Stop Limit` כ־Backstop דורשת זהירות גבוהה

‏Stop-Limit מגינה על execution price אבל יכולה להישאר לא־מבוצעת אחרי trigger.

‏לכן עבור backstop שמטרתה העיקרית היא position reduction, צריך לשאול:

```text
Do we prefer price protection
or
position reduction certainty?
```

‏אין תשובה אוניברסלית.

---

## ‏10C.21 `BROKER_BRACKET`

‏במודל הזה Parent + exits הם מבנה Broker-managed יחסית.

‏היתרונות:

```text
protection can be staged with entry
survives local process problems better
relationships exist at broker/TWS layer
```

‏החסרונות:

```text
less signal-aware
more complex partial-fill/child lifecycle
sibling-cancel races
modification/reconciliation complexity
```

---

## ‏10C.22 `HYBRID_PROTECTION`

‏זה Candidate מרכזי למנוע שלנו:

```text
broker-resident protective stop/backstop
+
local dynamic exit intelligence
```

‏ה־Broker מחזיק safety floor.

‏המנוע המקומי יכול לצאת מוקדם יותר בגלל reversal, weakened Bid, spread change או signal decay.

‏אבל Hybrid עובדת רק אם `Exit Ownership` ו־cancel/reconciliation חזקים.

---

## ‏10C.23 שני Authorities ב־Hybrid

```text
Dynamic Exit Authority = LOCAL_ENGINE
Protection Authority   = BROKER
```

‏כאשר local exit נבחרת:

1. ‏בודקים protection קיימת.
2. ‏מחליטים האם יש צורך לבטל/להקטין אותה לפני/במקביל ליציאה.
3. ‏מחשבים worst-case executable exit quantity.
4. ‏שולחים action רק אם quantity budget בטוח.
5. ‏לא מכריזים Flat עד reconciliation.

---

## ‏10C.24 `Cancel Protection Then Exit` מול `Exit Then Cancel Protection`

‏יש trade-off אמיתי.

### ‏Cancel first

‏יתרון:

```text
lower double-exit risk
```

‏חיסרון:

```text
temporary unprotected window
```

### ‏Exit first

‏יתרון:

```text
faster position reduction
```

‏חיסרון:

```text
protection can trigger concurrently
```

‏לכן אין sequence אוניברסלי. ה־Policy צריכה להחליט לפי urgency, Broker semantics ו־worst-case overlap.

---

## ‏10C.25 Protection Handoff הוא Protocol

‏נרצה state מפורש:

```text
BROKER_PROTECTED
HANDOFF_TO_LOCAL_EXIT
LOCAL_EXIT_IN_FLIGHT
BROKER_PROTECTION_CANCEL_PENDING
FLAT_VERIFYING
FLAT_CONFIRMED
```

‏כך המנוע יודע שהמעבר בין Authorities אינו atomic.

---

## ‏10C.26 Partial Position משנה את ההגנה מיד

‏אם Entry התמלאה ב־37:

```text
position_qty = 37
```

‏Protection צריכה לכסות את ה־37, לא את target 100.

‏אם מגיע Fill נוסף מאוחר יותר:

```text
position_qty = 63
```

‏צריך לבדוק אם protection גדלה ל־63 או שיש gap של 26.

---

## ‏10C.27 `Protected Qty` ו־`Position Qty`

‏נשמור:

```text
confirmed_position_qty
broker_protective_qty
local_exit_potential_qty
cancel_pending_exit_qty
```

‏ונבדוק לפחות שני invariants:

```text
protected_qty should not intentionally exceed position_qty
```

‏וגם:

```text
position_qty should not remain below required protection coverage
beyond allowed unprotected window
```

---

## ‏10C.28 `Unprotected Window` הוא Metric

‏נמדוד:

```text
entry_fill_ts
protection_active_ts
unprotected_window_ms
```

‏ב־Hybrid handoff נמדוד גם:

```text
protection_cancel_effective_ts
local_exit_fill_ts
handoff_unprotected_ms
```

‏כך אפשר להשוות architectures לפי survivability, לא רק P&L.

---

## ‏10C.29 Broker Child Rejection הוא Risk Incident

‏אם Position קיימת ו־Stop child נדחתה:

```text
POSITION_UNPROTECTED
```

‏זה לא warning רגיל.

‏Policy צריכה להחליט מראש:

```text
retry protection
place alternate protection
reduce position
freeze new entries
```

‏התגובה אינה נשארת ל־ad-hoc code.

---

## ‏10C.30 Double Exit Prevention

‏לפני כל Exit חדשה נחשב:

```text
worst_case_total_sell_qty =
  already_filled_sell_qty
+ potentially_executable_existing_sell_qty
+ proposed_new_sell_qty
```

‏ונשווה ל־Position הזמינה.

‏אם worst case יכולה להפוך אותנו Short — הפעולה חסומה או מצטמצמת.

---

## ‏10C.31 OCA/OCO אינה אטומיות מושלמת

‏IBKR מתעדת `ocaType` עם מצבי cancel/proportional reduction ו־overfill protection ב־with-block modes.

‏אבל המנוע עדיין לא מניח ש־sibling cancel כבר אפקטיבי ברגע שאחת מתבצעת.

‏לכן:

```text
SIBLING_CANCEL_PENDING
```

‏נשארת state אמיתית.

---

## ‏10C.32 Profit-Taker Partial Fill

‏נניח Long 100:

```text
TP fills 40
remaining position = 60
```

‏עכשיו protection צריכה להתאים ל־60.

‏אם Stop עדיין על 100, worst-case over-exit הוא 40.

‏לכן כל partial exit מפעילה reconciliation של כל siblings וה־Position.

---

## ‏10C.33 Stop Trigger בזמן TP Cancel

‏תרחיש race:

```text
TP partially/fully fills
cancel stop requested
market moves down
stop triggers before cancel is effective
```

‏המנוע חייב להתייחס לזה כאפשרי.

‏הפתרון אינו "לסמוך על OCO", אלא למדוד actual executions ולהחזיר את Position למצב חוקי.

---

## ‏10C.34 `FLAT` אינה החלטה מקומית

‏אי אפשר להכריז:

```text
flat = true
```

‏רק כי שלחנו SELL בכמות Position.

‏נרצה:

```text
no confirmed position
no potentially executable exits
no pending unknown orders
executions reconciled
broker position reconciled
```

‏רק אז:

```text
FLAT_CONFIRMED
```

---

## ‏10C.35 Exit בזמן `CANCEL_PENDING`

‏אם local exit ישנה נמצאת ב־cancel pending, אסור לשלוח replacement מלא כאילו הישנה מתה.

‏אותו כלל מחלק 8:

```text
pending cancel = still potentially executable
```

‏Replacement quantity נגזרת מ־worst-case exposure, לא מ־desired remainder בלבד.

---

## ‏10C.36 Modify Exit קיימת מול Cancel/New

‏IBKR מתעדת Modify דרך `placeOrder` עם אותו `orderId`, וממליצה בדרך כלל להגביל in-place changes בעיקר ל־price, size ו־TIF המתאימים.

‏לכן:

```text
same exit family + safe field change
=> MODIFY candidate
```

‏אבל:

```text
change from passive TP to marketable IOC
or from broker algo to another family
=> CANCEL / RECONCILE / NEW candidate
```

‏לא mutation שרירותית.

---

## ‏10C.37 Queue Priority מול Exit Urgency

‏ב־Normal Exit, Order פסיבית עם queue age יכולה להיות נכס.

‏ב־Fast Exit, אותה queue age יכולה להפוך ל־sunk cost.

‏לכן:

```text
keep queue
```

‏מותר רק אם Position Risk עדיין מצדיק waiting.

---

## ‏10C.38 `Hold` חייב Reason Code

‏לא מספיק:

```text
no exit signal
```

‏נרצה למשל:

```text
HOLD_SIGNAL_VALID
HOLD_PROTECTION_ACTIVE
HOLD_SPREAD_TOO_WIDE_FOR_NORMAL_EXIT
HOLD_WAITING_FOR_BROKER_RECONCILIATION
```

‏אבל `HOLD_WAITING_FOR_RECONCILIATION` אינה תמיד בטוחה; אם Risk עולה, היא יכולה לעבור ל־Emergency controller.

---

## ‏10C.39 Signal Reversal מול Risk Trigger

‏נפריד:

```text
SIGNAL_REVERSAL
```

‏מ־:

```text
RISK_BOUNDARY_BREACHED
```

‏Signal reversal יכולה להפעיל Normal/Fast Exit.

‏Risk boundary breached יכולה להפעיל protective/emergency path גם אם Strategy עצמה עדיין "אוהבת" את המניה.

---

## ‏10C.40 Profit Target אינה Exit Engine מלאה

‏פקודה של:

```text
SELL LMT at target
```

‏לא יודעת אם:

```text
momentum reversed early
spread widened
bid weakened
depth vanished
signal expired
```

‏לכן TP יכולה להיות Child שימושית, אבל היא אינה תחליף ל־dynamic Exit Decision.

---

## ‏10C.41 Stop אינה Exit Intelligence מלאה

‏באותו אופן Stop יודעת price trigger, אבל לא בהכרח יודעת:

```text
trade velocity collapsed
better opportunity appeared
expected edge vanished
```

‏לכן `STOP_BACKSTOP` היא Safety Tool, לא מוח האסטרטגיה.

---

## ‏10C.42 Trailing Protection — מתי היא Candidate

‏Trailing יכולה להתאים כאשר רוצים Broker-managed ratchet אחרי תנועה חיובית.

‏אבל למנוע קצר מאוד היא יכולה להיות רגישה לרעש.

‏Candidate שורדת רק אם:

```text
trail distance > normal microstructure noise
and
trail behavior matches holding horizon
```

‏אחרת Dynamic Exit מקומית יכולה להיות מדויקת יותר.

---

## ‏10C.43 `Adjustable Stop` כשכבת survivability

‏IBKR מתעדת Adjustable Stop כ־one-time transformation של Stop parent לאחר trigger.

‏מבחינתנו זה יכול להיות שימושי למחקר של:

```text
initial loose backstop
→ after favorable threshold
→ tighter broker-resident protection
```

‏היתרון: transition יכולה להתקיים מחוץ למנוע המקומי.

‏החיסרון: היא פחות context-aware מ־local Decision Engine.

---

## ‏10C.44 Exit בזמן Market Data Stale

‏ב־Entry:

```text
stale data => usually deny new risk
```

‏ב־Exit:

```text
stale data + open position
```

‏היא בעיית Risk קשה יותר.

‏Policy יכולה לעבור ל־:

```text
EXIT_ONLY
PROTECTION_ONLY
EMERGENCY_REDUCE
```

‏לפי Broker truth וה־protection שכבר קיימת.

---

## ‏10C.45 Exit בזמן Broker Disconnect

‏Disconnect אינו אומר שה־Orders ב־Broker נעלמו.

‏לכן:

```text
local control unavailable
```

‏אבל:

```text
broker stop may still be alive
```

‏בזמן recovery אסור לשלוח assumptions חדשות עד reconciliation.

---

## ‏10C.46 למה Broker-Resident Protection כל כך חשובה

‏היא נותנת שכבה שפחות תלויה ב־:

```text
local process
local event loop
local network
local market-data feed
```

‏היא לא חסינה מהכול, אבל failure domain שלה שונה מזה של client-managed exit.

‏זו בדיוק הסיבה לשקול Hybrid.

---

## ‏10C.47 `Transmit=false` אינה Protection פעילה

‏IBKR מתעדת ש־untransmitted Orders נשארות רק ב־TWS session ואינן נשלחות ל־IB server, ונמחקות ב־restart.

‏לכן Bracket ב־staging אינה נחשבת:

```text
BROKER_PROTECTED
```

‏עד transmission/acknowledgement המתאים.

---

## ‏10C.48 Parent/Child Identity

‏IBKR Order model כולל:

```text
orderId
permId
parentId
clientId
```

‏Exit recovery צריכה למפות את כל אלה ל־internal trade/position identity.

‏`parentId` משמש בין היתר ל־Bracket/attached orders.

---

## ‏10C.49 Protection Graph

‏נרצה מבנה פנימי:

```text
Position
 ├── Entry order(s)
 ├── Profit exit(s)
 ├── Protective stop(s)
 └── Local exit intent(s)
```

‏לכל edge בגרף יש relation:

```text
protects
replaces
cancels_with
belongs_to
```

‏כך recovery אינה תלויה במשתנה יחיד כמו `bracketActive=true`.

---

## ‏10C.50 Exit State Machine מוצעת

```text
POSITION_OPEN
  ├── PROTECTED
  ├── UNPROTECTED
  └── EXIT_EVALUATING
       ├── NORMAL_EXIT_WORKING
       ├── FAST_EXIT_WORKING
       ├── EMERGENCY_REDUCE_WORKING
       ├── HANDOFF_IN_PROGRESS
       └── RECONCILING

EXIT_PARTIAL
  ↓
RECOMPUTE_REMAINING_POSITION
  ↓
EXIT_EVALUATING

EXIT_FILLED
  ↓
SIBLING_CANCEL_PENDING
  ↓
FLAT_VERIFYING
  ↓
FLAT_CONFIRMED
```

---

## ‏10C.51 Exit Decision Tree ראשוני

```text
if position_qty == 0:
    if potentially_executable_exit_qty == 0:
        return FLAT_CONFIRMED
    else:
        return RECONCILE_ONLY

if broker_state_unknown:
    return RECOVERY_POLICY

if position_unprotected:
    prioritize PROTECTION / EMERGENCY_REDUCE

if hard risk boundary breached:
    return EMERGENCY_REDUCE

if strong reversal / edge gone:
    return FAST_EXIT

if normal exit condition:
    return NORMAL_EXIT

return HOLD
```

‏אחר כך כל Mode בוחר concrete behavior מתוך capability set.

---

## ‏10C.52 Candidate Set ל־Normal Exit

```text
PASSIVE_JOIN
RELATIVE
MIDPRICE
SNAP_MIDPOINT
ADAPTIVE_LIMIT_NORMAL
ADAPTIVE_LIMIT_URGENT
AGGRESSIVE_CAPPED_LIMIT
```

‏לא כולן חייבות להיות Production-enabled.

‏Selector משתמש רק ב־allowlist שעברה Capability Gates.

---

## ‏10C.53 Candidate Set ל־Fast Exit

```text
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
AGGRESSIVE_CAPPED_LIMIT
```

‏Midpoint/Passive יכולות להישאר רק אם historical fill latency מתאים ל־Risk budget.

‏ה־default inclination נהיית אגרסיבית יותר, אבל לא בלתי מוגבלת.

---

## ‏10C.54 Candidate Set ל־Emergency Reduce

‏כאן המטרה היא Exposure reduction תחת Risk Policy.

‏ה־candidate family יכולה לכלול aggressive executable orders עם bounds רחבים יותר מה־Normal Exit.

‏אבל concrete behavior חייב להיבדק לפי:

```text
market state
session
halt state
visible liquidity
broker capability
remaining qty
```

---

## ‏10C.55 Exit Time Budget

‏גם Exit מקבלת זמן:

```text
normal_exit_budget_ms
fast_exit_budget_ms
emergency_step_budget_ms
```

‏ההבדל הוא שב־Emergency budget לא אומר "אם עבר הזמן נוותר".

‏הוא אומר:

```text
re-evaluate and escalate within risk policy
```

---

## ‏10C.56 Partial Exit היא state רגילה

‏נניח Position 100 ו־IOC מכרה 65.

‏עכשיו:

```text
position = 35
```

‏המנוע לא retry 35 עיוור.

‏הוא מריץ:

```text
fresh market
fresh risk
existing protection qty
potential exits
remaining position
→ new Exit Decision
```

---

## ‏10C.57 Dust Position

‏אם נשארה כמות קטנה מאוד, צריך Policy מפורשת:

```text
DUST_EXIT
```

‏ולא להשאיר אותה בטעות כי "ה־main exit כמעט מלאה".

‏ההגדרה של Dust צריכה להיות כלכלית/תפעולית, לא מספר מניות קבוע לכל Symbol.

---

## ‏10C.58 External/Manual Position Change

‏אם Position השתנתה ידנית או על ידי API client אחר:

```text
externally_changed = true
```

‏Exit Engine עוצרת modifications חדשות עד reconciliation של:

```text
position
live exits
protection qty
ownership
```

‏אחרת Bracket יכולה למכור יותר ממה שנשאר.

---

## ‏10C.59 Reconnect Exit Recovery

‏אחרי reconnect:

```text
freeze new entries
fetch/rebuild open orders
reconcile executions
reconcile position
rebuild protection graph
classify ownership
validate quantities
```

‏רק אז Exit Engine חוזרת למצב Normal.

‏אם Position קיימת והגנה חסרה, זה Incident מיידי.

---

## ‏10C.60 Exit Telemetry

```text
exit_decision_id
position_qty_at_decision
exit_mode
exit_owner
protection_owner
protected_qty
potential_exit_qty
selected_behavior
selection_reason
requested_exit_qty
filled_exit_qty
remaining_position_qty
hard_exit_boundary
stop_trigger_price
stop_trigger_ts
protection_cancel_request_ts
protection_cancel_ack_ts
local_exit_submit_ts
first_exit_fill_ts
flat_confirmed_ts
unprotected_window_ms
handoff_window_ms
```

---

## ‏10C.61 Metrics מרכזיים

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

‏אלה Metrics של Execution + Safety, לא רק מחיר יציאה ממוצע.

---

## ‏10C.62 Failure Matrix ל־Exit

| מצב | סיכון | פעולה עקרונית |
|---|---|---|
| ‏Position קיימת, protection חסרה | Unprotected exposure | ‏Protection / Reduce / Freeze Entries |
| ‏Local exit + Stop פעילות יחד | Double exit | ‏Ownership + quantity budget |
| ‏TP partial | Stop גדולה מדי | ‏Resize/reconcile protection |
| ‏Stop triggered, sibling cancel pending | Both can fill | ‏Treat sibling as executable |
| ‏Exit cancel pending | Replacement overlap | ‏Bound worst-case qty |
| ‏Disconnect עם Position | Unknown broker state | ‏Recovery gate |
| ‏Manual partial close | Protection mismatch | ‏Reconcile all children |
| ‏Child rejected | Position unprotected | ‏Alternate protection / reduce |
| ‏Stop-Limit triggered no fill | Position remains | ‏Fast/Emergency escalation |
| ‏Market halt | Exit cannot execute normally | ‏Maintain broker truth, wait/recover per policy |
| ‏Data stale | Local signal unknown | ‏Protection/Exit-only policy |
| ‏Both exits filled | Position reversed | ‏Incident + neutralization policy |

---

## ‏10C.63 Acceptance Tests

```text
1. Normal exit full fill
2. Normal exit partial fill
3. Fast exit full fill
4. Fast exit partial then re-decision
5. Emergency reduce multi-step
6. Broker stop active + local exit requested
7. Stop triggers during local exit
8. TP partial then stop resize
9. Stop cancel pending then local exit
10. Local exit fills while stop cancel pending
11. Both exits fill unexpectedly
12. Parent partial with proportional protection
13. Child rejected after entry fill
14. Manual partial close while bracket active
15. Disconnect with protected position
16. Disconnect with unprotected position
17. Restart with bracket still live
18. Stop trigger with gap
19. Stop-Limit trigger without fill
20. Data feed stale while broker stop remains active
21. Dust position after partial exit
22. Capability failure during exit
23. Old callback after reconnect generation
24. Flat verification with no live exits
```

---

## ‏10C.64 Property Tests

```text
new local exit must never increase worst-case exit qty beyond position
smaller position must never leave larger intentionally active protection
cancel-pending exit must continue to consume exit quantity budget
signal invalidation may increase urgency but must not bypass quantity invariants
unknown broker state must never produce an unbounded replacement order
FLAT_CONFIRMED requires zero position and zero potentially executable exits
```

---

## ‏10C.65 Recommendation ל־V1 Exit Architecture

‏ל־V1 המחקרית הייתי משווה שלוש architectures שכבר הוגדרו בחלק 6:

```text
A. CLIENT_MANAGED_EXIT
B. BROKER_BRACKET
C. HYBRID_PROTECTION
```

‏אבל הייתי נותן דגש מיוחד ל־`HYBRID_PROTECTION` משום שהיא מנסה לשלב:

```text
broker survivability
+
local signal-aware exit
```

‏היא אינה הבחירה הסופית; היא Candidate שמחייבת race tests קשים יותר.

---

## ‏10C.66 למה לא לבחור Architecture לפי P&L בלבד

‏Architecture שמרוויחה מעט יותר ב־Happy Path אך משאירה Position לא מוגנת בזמן crash יכולה להיות גרועה יותר מערכתית.

‏ההשוואה צריכה לכלול:

```text
net edge
exit quality
unprotected time
recovery correctness
double-exit risk
operational complexity
broker dependency
```

---

## ‏10C.67 Why / When / Why Not — `NORMAL_EXIT`

### ‏Why

‏מאפשר לשפר מחיר כאשר Risk עדיין בשליטה.

### ‏When

‏שוק מסודר, Position מוגנת, Signal נחלשה אך אין urgency חריגה.

### ‏Why Not

‏כאשר missed-exit cost עולה מהר או protection אינה אמינה.

---

## ‏10C.68 Why / When / Why Not — `FAST_EXIT`

### ‏Why

‏מקצר exposure כאשר ה־trade thesis מתפרקת.

### ‏When

‏Reversal, Edge מתקרבת לאפס, Bid/Ask deteriorating.

### ‏Why Not

‏כאשר spread/depth הופכים את האגרסיביות ליקרה יותר מה־Risk שהיא חוסכת.

---

## ‏10C.69 Why / When / Why Not — `EMERGENCY_REDUCE`

### ‏Why

‏מעדיף הורדת Risk על price optimization רגילה.

### ‏When

‏Unprotected position, system degradation, hard risk breach.

### ‏Why Not

‏לא להפוך כל noise או הפסד קטן ל־Emergency; אחרת המנוע ישלם spread/slippage ללא צורך.

---

## ‏10C.70 Why / When / Why Not — `BROKER_BRACKET`

### ‏Why

‏Protection יכולה להיות staged/broker-resident ולא תלויה בכל רגע בתהליך המקומי.

### ‏When

‏Survivability חשובה ויש acceptance tests חזקים ל־partial/races.

### ‏Why Not

‏כאשר dynamic exit משתנה מהר מאוד ו־coordination complexity גוברת על הערך.

---

## ‏10C.71 Why / When / Why Not — `HYBRID_PROTECTION`

### ‏Why

‏משלב Broker backstop עם Local intelligence.

### ‏When

‏Signal-aware exit חשובה אבל אסור להשאיר Position ללא protection בזמן crash/disconnect.

### ‏Why Not

‏כאשר אין State Machine שמסוגלת למנוע double-exit ולנהל handoff אמין.

---

## ‏10C.72 Practitioner Secrets — Exit

### ‏1. Exit היא קודם בעיית Ownership

‏לפני מחיר צריך לדעת מי עדיין יכול למכור את Position.

### ‏2. `Pending Cancel` עדיין מסוכן

‏עד terminal evidence, protection/exit יכולה Fill.

### ‏3. Flat הוא State שצריך להוכיח

‏לא Intent ולא מספר מקומי.

### ‏4. Protection ו־Dynamic Exit הן שתי רשויות שונות

‏Hybrid בלי handoff protocol היא מתכון ל־double exit.

### ‏5. Partial Exit משנה הכול

‏Position, stop qty, TP qty ו־remaining intent צריכים להתעדכן יחד.

### ‏6. Stop טובה אינה בהכרח Exit טובה

‏היא יכולה להיות backstop מצוין ועדיין להיות פחות טובה מה־local exit הרגילה.

### ‏7. Stop-Limit מחליפה סיכון אחד באחר

‏פחות price uncertainty, יותר no-fill risk.

### ‏8. Emergency אינה פטור מ־Risk Controls

‏היא משנה סדר עדיפויות, לא מבטלת גבולות.

### ‏9. Broker-resident protection שווה בעיקר כאשר משהו נשבר

‏זה הערך שאין ל־client-only exit.

### ‏10. Architecture חייבת להיבחן ב־failure path

‏Happy Path לבדה אינה הוכחה ל־Production readiness.

---

# ‏עובדות IBKR שאומתו עבור 10C

- ‏`Order.parentId` משמש לקשר parent/child, כולל Bracket/attached orders.
- ‏`Order.transmit=false` יוצר Order ב־TWS שאינה נשלחת ל־IB server; Orders כאלה זמינות רק באותה session ונמחקות ב־restart.
- ‏`Order.ocaType` תומך ב־cancel-all וב־proportional-reduction modes; modes עם block נועדו לצמצם overfill risk.
- ‏`triggerMethod` הוא חלק מ־Stop semantics עבור simulated stops.
- ‏Modify ב־TWS API נעשית באמצעות `placeOrder` עם אותו `orderId`; IBKR ממליצה בדרך כלל להגביל in-place modifications בעיקר למחיר, כמות ו־TIF מתאימה.
- ‏Binding של Order חיצונית יכולה לבצע cancel/resubmit ולהשפיע על queue priority, ולכן recovery עצמו יכול להשפיע execution.

---

# ‏מקורות רשמיים לחלק 10C

- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — Placing Orders / `Transmit`: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>
- ‏IBKR — Order Types and Algos / Stops and Adjustable Stop: <https://www.interactivebrokers.com/en/trading/ordertypes.php>

---

# ‏Checkpoint — סוף חלק 10C

‏בחלק הזה בנינו את Exit Decision כבעיה נפרדת מ־Entry. הגדרנו `NORMAL_EXIT`, ‏`FAST_EXIT`, ‏`EMERGENCY_REDUCE`, ‏`STOP_BACKSTOP`, ‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION`; הוספנו `Exit Ownership`, ‏Potential Exit Exposure, protection handoff, partial-position synchronization, double-exit prevention, `FLAT_CONFIRMED`, telemetry, Failure Matrix ו־acceptance/property tests.

‏העיקרון המרכזי הוא: **לפני שהמנוע מחליט באיזה מחיר לצאת, הוא חייב לדעת איזו Position קיימת בפועל, אילו Orders עדיין יכולות לבצע, מי מחזיק את סמכות ה־Exit, ומהו worst-case quantity אם כמה paths יתבצעו במקביל.**

‏השלב הבא יהיה חלק 10D בקובץ נפרד: נחבר את 10A, ‏10B ו־10C למנוע Decision אחד עם precedence rules, re-evaluation, fallbacks, pseudocode ומטריצת החלטות מלאה.
