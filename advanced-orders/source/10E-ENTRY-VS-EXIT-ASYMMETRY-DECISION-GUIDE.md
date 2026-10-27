# ‏חלק 10E — Entry vs Exit Asymmetry Decision Guide: אותה פקודה, בעיית החלטה שונה

> ‏הפרק הזה הוא שכבת Decision מעל `10B` ו־`10C`. הוא אינו מוסיף Broker Order Types חדשים; הוא מסביר למה אותו `Behavior Candidate`, אותו Broker Primitive ואפילו אותו payload כמעט זהה יכולים לייצג **החלטה עסקית שונה לחלוטין** כאשר משתמשים בהם ל־Entry לעומת Exit.

---

## ‏10E.1 משפט הזיכרון המרכזי

```text
Entry no-fill
can end with NO_TRADE.

Exit no-fill
leaves reconciled_position exposed.
```

‏זו האסימטריה שממנה נגזר כמעט כל ההבדל.

‏ב־Entry אנחנו שואלים:

```text
Should we create exposure at all?
```

‏ב־Exit אנחנו שואלים:

```text
How should we reduce / remove exposure that already exists?
```

> ‏`ENGINE RULE` — Entry ו־Exit יכולות להשתמש באותו Broker Primitive, אבל אינן רשאיות לשתף אוטומטית את אותה Decision Policy.

---

## ‏10E.2 Broker Primitive אינה Purpose

‏נניח בשני המקרים:

```text
BrokerPrimitive = LMT
BrokerTIF       = IOC
BehaviorCandidate = MARKETABLE_LIMIT_IOC
```

‏ב־Entry זה יכול לבטא:

```text
attempt to acquire useful quantity now
within entry Economic Price Bound
otherwise remain flat / smaller than target
```

‏ב־Exit זה יכול לבטא:

```text
attempt to reduce existing reconciled_position now
within exit Economic Price Bound
then re-evaluate any residual position immediately
```

‏ה־Broker רואה Order semantics. המנוע חייב לזכור את ה־**Purpose**.

---

## ‏10E.3 Comparison Matrix — Entry מול Exit

| Dimension | Entry | Exit |
|---|---|---|
| Exposure לפני ההחלטה | בדרך כלל אין exposure חדש מה־intent הנוכחי | כבר קיימת `reconciled_position` |
| שאלת היסוד | האם ליצור exposure | איך להפחית/לסגור exposure |
| `NO_FILL` | יכולה להסתיים ב־`NO_TRADE` / `DEFER` / fresh decision | Position נשארת ולכן risk ממשיך |
| Quantity truth | כמה מותר ליצור תחת `EntryEnvelope` | כמה באמת קיים לפי `reconciled_position` פחות exits קיימות |
| Partial Fill | יצרה Position חדשה שדורשת protection + fresh remainder decision | הפחיתה Position אך הותירה residual exposure |
| Urgency | signal half-life + missed-entry cost | position risk + missed-exit cost |
| Price improvement | יכולה להצדיק אי־כניסה | אינה תמיד מצדיקה הישארות בפוזיציה |
| Escalation | יכולה להסתיים בוויתור על העסקה | חייבת להתחשב ב־residual position וב־risk state |
| Failure destination | cancel/reconcile ואז אולי `NO_TRADE` | reconcile position/protection ואז fresh exit/risk decision |

---

## ‏10E.4 `Economic Price Bound` קיימת בשני הצדדים — אבל המטרה שונה

‏ב־Entry, ה־Bound מגינה מפני יצירת Position במחיר שכבר הורס את economics של ההזדמנות.

‏ב־Exit, ה־Bound מגינה מפני execution שאינה מקובלת לפי Policy/Risk — אבל עצם אי־הביצוע משאיר Position פתוחה.

‏לכן:

```text
Entry bound violation
→ often reject entry / NO_TRADE

Exit bound blocks fill
→ residual position remains
→ fresh risk decision required
```

> ‏`ENGINE RULE` — Exit אינה רשאית להרחיב Bound אוטומטית רק כי ניסיון קודם לא התמלא; אבל גם אינה רשאית להתייחס ל־no-fill כאילו חזרנו ל־flat state.

---

## ‏10E.5 Direction של ה־Bound חייבת להיות מפורשת

‏אין להשתמש בשם עמום כמו:

```text
max_price
```

‏לכל side.

‏ב־BUY אפשר לחשוב על upper economic boundary.

‏ב־SELL אפשר לחשוב על lower economic boundary.

‏אבל המודל הקנוני נשאר:

```text
Economic Price Bound
```

‏עם side-aware validation.

‏כך אותו field semantic נשאר עקבי בלי ליצור aliases שונים ל־Entry ול־Exit.

---

# ‏חלק א — אותו Behavior ב־Entry וב־Exit

## ‏10E.6 `PASSIVE_JOIN` ב־Entry

### ‏Why

‏לנסות לקבל price improvement / spread economics לפני יצירת exposure.

### ‏When

```text
signal has enough remaining life
missed-entry cost is acceptable
passive fill quality is historically useful
exit feasibility remains healthy
```

### ‏Why Not

‏אם no-fill פירושה פספוס Opportunity שה־Edge שלה מתה מהר, waiting cost יכולה להיות גבוהה יותר מן ה־spread שנחסך.

### ‏Failure Destination

```text
no fill / stale signal
→ cancel/reconcile
→ NO_TRADE or fresh entry decision
```

---

## ‏10E.7 `PASSIVE_JOIN` ב־Exit

### ‏Why

‏כאשר Position risk נמוכה יחסית ויש זמן לנסות לשפר את מחיר היציאה.

### ‏When

```text
NORMAL_EXIT
position remains controlled
signal/risk state does not demand immediate reduction
passive waiting remains cheaper than missed-exit risk
```

### ‏Why Not

‏אותה no-fill שב־Entry הייתה יכולה להיות harmless הופכת כאן ל־continued exposure.

### ‏Failure Destination

```text
no fill
→ reconciled_position unchanged
→ reassess risk / remaining edge / protection
→ fresh exit decision
```

‏לכן:

```text
PASSIVE_JOIN entry timeout
!=
PASSIVE_JOIN exit timeout
```

---

## ‏10E.8 `MARKETABLE_LIMIT_IOC` ב־Entry

‏ב־Entry Candidate זו אומרת בקירוב:

```text
Take currently executable liquidity now
up to entry Economic Price Bound
cancel unfilled remainder immediately
```

‏היא מתאימה כאשר:

```text
signal life is short
useful immediate fill matters
stale remainder is undesirable
```

‏אבל `NO_FILL` עדיין יכולה להיות תוצאה תקינה:

```text
IOC returns zero
→ remain flat
→ NO_TRADE / DEFER / fresh decision
```

---

## ‏10E.9 `MARKETABLE_LIMIT_IOC` ב־Exit

‏ב־Exit אותה Candidate אומרת:

```text
Take executable contra liquidity now
up to exit Economic Price Bound
cancel remainder immediately
then inspect residual reconciled_position
```

‏כאן `NO_FILL` אינה סוף התהליך:

```text
IOC returns zero
→ position still exists
→ risk state may be worsening
→ fresh FAST_EXIT / EMERGENCY_REDUCE decision may be required
```

> ‏`ENGINE RULE` — IOC remainder cancellation מסירה את ה־Order; היא אינה מסירה את ה־Position.

---

## ‏10E.10 `MIDPRICE` ב־Entry מול Exit

### ‏Entry

‏`MIDPRICE` יכולה להיות Candidate כאשר price improvement סביב midpoint שווה את סיכון ה־no-fill/latency לפני יצירת Position.

### ‏Exit

‏`MIDPRICE` יכולה להתאים ל־`NORMAL_EXIT` כאשר Position risk נשלטת ויש זמן לחפש price improvement.

‏אבל אם risk עולה:

```text
midpoint no-fill cost
```

‏יכול להיות שונה לחלוטין, כי הוא נמדד מול:

```text
continued position exposure
```

‏ולא רק מול missed opportunity.

---

## ‏10E.11 `ADAPTIVE_LIMIT_URGENT` ב־Entry מול Exit

‏אותו Broker-managed behavior יכול לקבל Purpose שונה:

```text
ENTRY:
delegate urgent execution attempt
while opportunity still exists

EXIT:
delegate urgent risk-reduction execution
while position still exists
```

‏אבל Broker Algo עדיין אינה יודעת אם:

```text
entry signal invalidated
or
exit risk escalated
```

‏ולכן בשני הצדדים local `application_order_ttl` ו־fresh decision נשארות authority של המנוע.

---

# ‏חלק ב — No-Fill אינו אותו Event

## ‏10E.12 Entry No-Fill

‏Entry no-fill יכולה להיות outcome מקצועית טובה.

```text
opportunity existed
price never became acceptable
signal expired
→ stayed flat
```

‏אין חובה “להציל” כל Signal באמצעות escalation.

> ‏`ENGINE RULE` — No-fill ב־Entry אינה כישלון אם האלטרנטיבה הייתה execution גרועה יותר מן ה־Edge המאושרת.

---

## ‏10E.13 Exit No-Fill

‏Exit no-fill משאירה עובדה שאינה נעלמת:

```text
reconciled_position != 0
```

‏לכן ה־failure destination אינה:

```text
DONE
```

‏אלא:

```text
reconcile order state
recompute current position
recompute protection coverage
refresh market/risk state
choose fresh exit disposition/mode/candidate
```

‏זה יכול עדיין להוביל ל־`HOLD` או `NO_ACTION` אם Policy אומרת שה־Position עדיין רצויה ומוגנת — אבל לא משום שה־Order לא התמלאה.

---

## ‏10E.14 Counterexample — “אותו IOC, אז אותה מדיניות Retry”

‏לא.

‏Entry:

```text
IOC no-fill
→ flat
→ retry may be unnecessary
```

‏Exit:

```text
IOC no-fill
→ still long/short
→ retry/escalation question remains open
```

‏Retry policy חייבת להיגזר מ־Purpose ומה־state החדש, לא מסוג ה־Order בלבד.

---

# ‏חלק ג — Partial Fill הוא Decision חדש, אבל מסיבה שונה

## ‏10E.15 Partial Fill ב־Entry

‏נניח:

```text
target_entry_qty = 100
filled = 35
```

‏עכשיו נוצרה Position בפועל.

‏המערכת צריכה לעדכן:

```text
execution_ledger_position
broker_reported_position
reconciled_position
protection coverage
remaining intent
remaining signal life
exit feasibility
```

‏ואז להחליט מחדש אם 65 הנותרות עדיין רצויות.

‏אסור:

```text
remaining_qty = 65
→ blindly resubmit original entry behavior
```

---

## ‏10E.16 Partial Fill ב־Exit

‏נניח:

```text
reconciled_position_before = 100
exit_fill = 35
```

‏העובדה החדשה היא:

```text
reconciled_position_after ≈ 65
```

‏אבל צריך גם לבדוק:

```text
other exit orders still potentially executable?
protection still sized correctly?
pending entry can still increase position?
risk urgency changed?
```

‏ולכן גם כאן:

```text
partial fill
→ fresh decision
```

‏אך ה־decision היא על **residual exposure**, לא על remaining requested order בלבד.

---

## ‏10E.17 Quantity Truth שונה בין הצדדים

‏ב־Entry:

```text
max_new_qty
```

‏נגזרת מ־Entry Envelope, capital/risk/liquidity ו־current exposure.

‏ב־Exit:

```text
safe_new_exit_qty
```

‏נגזרת לפחות מ־:

```text
reconciled_position
minus/against all potentially executable exit/protection quantity
plus pending entry exposure where relevant
```

> ‏`ENGINE INVARIANT` — Exit quantity אינה `original_entry_qty` ואינה `requested_position`; היא נגזרת מ־Position Truth הנוכחית.

---

# ‏חלק ד — Urgency ו־Escalation

## ‏10E.18 Entry Urgency

‏Entry urgency נוצרת בעיקר מ־:

```text
remaining_signal_life
expected missed-move cost
fill opportunity decay
```

‏אבל אם economics נשברות, המנוע יכול לבחור:

```text
NO_TRADE
```

‏זו Exit לגיטימית מה־Decision Process — בלי Position חדשה.

---

## ‏10E.19 Exit Urgency

‏Exit urgency נוצרת מ־:

```text
position risk
signal reversal
protection state
market deterioration
system health
```

‏ככל שה־risk עולה, Mode יכולה לעבור:

```text
NORMAL_EXIT
→ FAST_EXIT
→ EMERGENCY_REDUCE
```

‏אבל כל מעבר הוא fresh decision.

‏אין:

```text
passive timed out
→ therefore automatically cross farther
```

---

## ‏10E.20 Escalation Budget אינו symmetric

‏ב־Entry, budget יכול להסתיים כך:

```text
remaining signal life exhausted
→ cancel
→ NO_TRADE
```

‏ב־Exit, budget יכול להסתיים כך:

```text
application_order_ttl expired
→ cancel/reconcile
→ residual position still exists
→ fresh exit/risk decision
```

‏לכן application TTL זהה במספר milliseconds אינה בהכרח Policy זהה.

---

## ‏10E.21 Counterexample — “אם 500ms טובים ל־Entry, הם טובים גם ל־Exit”

‏לא.

‏אותו 500ms יכול לייצג:

```text
ENTRY:
maximum patience before abandoning opportunity

EXIT:
maximum patience before reconsidering how to reduce existing risk
```

‏ה־clock אולי זהה; המשמעות אינה זהה.

---

# ‏חלק ה — Exit Feasibility כבר לפני Entry

## ‏10E.22 Entry אינה עצמאית מ־Exit

‏לפני יצירת Position חדשה צריך לשאול:

```text
If this entry fills now,
can we plausibly exit the resulting position
within acceptable time / liquidity / price-risk constraints?
```

‏לכן Exit feasibility היא gate של Entry, לא מחשבה שמגיעה רק אחרי Fill.

‏דוגמאות לסיבות להקטין/לפסול Entry:

```text
entry depth looks sufficient
but opposite-side exit depth is weak

spread acceptable for entry
but likely exit cost destroys net edge

position size can be acquired quickly
but not reduced safely within holding horizon
```

> ‏`ENGINE RULE` — Ability to enter is not sufficient evidence that the position size is safe to create.

---

## ‏10E.23 Same Primitive, Different Economic Question

‏נניח Limit Order פסיבית.

### ‏Entry question

```text
Is expected price improvement worth lower fill probability
before we create exposure?
```

### ‏Exit question

```text
Is expected price improvement worth keeping current exposure open longer?
```

‏זו אינה אותה objective function.

---

## ‏10E.24 Same Fill Price, Different Quality

‏נניח מחיר Fill זהה בשני תרחישים.

‏ב־Entry הוא יכול להיות טוב אם לאחריו המחיר מתקדם לטובתנו.

‏ב־Exit אותו מחיר יכול להיות גרוע אם waiting לפני ה־Fill אפשרה risk/markout שלילי משמעותי.

‏לכן execution quality נמדדת גם מול purpose:

```text
Entry:
fill price
+ time-to-fill
+ missed opportunity
+ post-entry markout

Exit:
fill price
+ time-to-risk-reduction
+ residual exposure duration
+ post-exit avoided/adverse move
```

‏אותו `slippage` מספרי אינו מספיק.

---

# ‏חלק ו — Existing Orders ו־Ownership

## ‏10E.25 Entry working order יכולה להפוך ל־Exit problem

‏תרחיש:

```text
entry partially fills
remainder still working
local engine decides position should exit
```

‏עכשיו יש שתי responsibilities:

```text
cancel / reconcile remaining entry exposure
and
manage exit of actual reconciled_position
```

‏אסור לשלוח Exit כאילו remainder אינה קיימת.

‏Worst-case model צריך לכלול:

```text
pending entry may still buy
+
exit may sell
+
protection may still execute
```

‏עד terminal evidence/reconciliation.

---

## ‏10E.26 `NO_ACTION` שונה בין Entry ל־Exit

### ‏Entry

`NO_ACTION` יכולה לומר:

```text
existing entry order remains valid
no new side effect now
```

### ‏Exit

`NO_ACTION` יכולה לומר:

```text
existing exit/protection architecture remains valid
no new side effect now
```

‏בשני המקרים היא אינה אומרת “אין Risk”. היא אומרת שאין **פעולה חדשה** לבצע כרגע.

---

## ‏10E.27 Failure Destinations

### ‏Entry failure

```text
RECONCILE_ENTRY_ORDER
→ refresh eligibility
→ cancel / NO_TRADE / DEFER / select fresh candidate
```

### ‏Exit failure

```text
RECONCILE_POSITION_AND_EXIT_ORDERS
→ verify protection
→ recompute residual risk
→ HOLD / NORMAL_EXIT / FAST_EXIT / EMERGENCY_REDUCE / RECONCILE_ONLY
```

> ‏`ENGINE RULE` — Failure destination נקבעת לפי Purpose, לא לפי Broker error code בלבד.

---

## ‏10E.28 Decision Record משותף

```text
PurposeAwareExecutionDecision {
  decision_id
  purpose                  // ENTRY | EXIT
  reconciled_position_before
  target_position_after
  application_execution_mode
  behavior_candidate
  economic_price_bound
  application_order_ttl
  broker_tif
  potentially_executable_orders[]
  partial_fill_policy
  no_fill_policy
  escalation_policy
  failure_destination
  protection_requirement
  decision_reason
}
```

‏כך אותו Candidate נשאר אותו Candidate — אבל ה־Purpose ו־state מכתיבים contract שונה.

---

## ‏10E.29 Acceptance Tests

```text
1. The same Broker Primitive may be used for ENTRY and EXIT without sharing the same Decision Policy.
2. Entry NO_FILL may terminate as NO_TRADE when no exposure was created.
3. Exit NO_FILL never implies FLAT_CONFIRMED while reconciled_position is non-zero.
4. IOC remainder cancellation never counts as position reduction by itself.
5. Entry partial fill creates a fresh position/protection decision before retrying remainder.
6. Exit partial fill recomputes residual reconciled_position before any next exit side effect.
7. Exit quantity is derived from reconciled_position and all potentially executable exit/protection orders.
8. Pending entry exposure is included when computing worst-case exit transition exposure.
9. Economic Price Bound is side-aware and cannot be widened automatically by retry/escalation.
10. Expired Entry TTL may lead to NO_TRADE; expired Exit TTL leads to fresh residual-risk decision.
11. PASSIVE_JOIN timeout policy is purpose-aware and not reused blindly between Entry and Exit.
12. MARKETABLE_LIMIT_IOC no-fill has different failure destinations for ENTRY and EXIT.
13. Exit feasibility is evaluated before approving new Entry size.
14. NO_ACTION means no new side effect, not zero exposure or zero risk.
15. Same facts + same purpose + same policy produce the same semantic decision.
```

---

## ‏10E.30 Practitioner Insight

> ‏`ENGINE RULE` — Order semantics אומרות **איך הוראה יכולה להתבצע**; Purpose אומר **מה המשמעות העסקית אם היא מתבצעת, לא מתבצעת או מתבצעת חלקית**.

‏הדרך לזכור:

```text
ENTRY
no-fill can preserve safety by keeping us flat

EXIT
no-fill preserves the risk by keeping us exposed
```

‏ולכן השאלה המקצועית אינה רק:

```text
Which order should I use?
```

‏אלא:

```text
What state remains if this exact order does NOT fill?
```

‏זו אחת השאלות החשובות ביותר לבחירת Advanced Order נכונה.

---

# ‏Checkpoint — סוף חלק 10E

‏יצרנו שכבת Decision שמחברת את Entry ו־Exit בלי לאחד אותן. אותו `Behavior Candidate` או Broker Primitive יכול להופיע בשני הצדדים, אך `NO_FILL`, ‏Partial Fill, ‏TTL, ‏Escalation, ‏Quantity Truth ו־Failure Destination נמדדים לפי Purpose. ב־Entry המערכת יכולה להישאר Flat; ב־Exit המערכת נשארת עם `reconciled_position` עד שה־execution/protection facts מוכיחות אחרת.