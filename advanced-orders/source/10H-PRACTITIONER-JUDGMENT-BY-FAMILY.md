# ‏חלק 10H — Practitioner Judgment לפי משפחת פקודות

> ‏מטרת הפרק: לקחת את ה־`Practitioner Judgment` של חלק `10G` ולהחיל אותו על המשפחות שבהן הכי קל למתחיל להסיק מסקנה שנשמעת הגיונית — אבל בפועל מסוכנת או לא מדויקת.
>
> ‏כל נושא מתחיל קודם ב־**הסבר פשוט**, אחר כך בדוגמה, ורק אז עובר ל־terminology המקצועי ול־Engine implication.

---

## ‏10H.1 כלל הוראה קנוני: פשוט → דוגמה → מונח מקצועי → עומק

‏לפני כל מונח מתקדם נשאל קודם:

```text
What does this mean in plain language?
What simple market situation creates the problem?
Why was this order/mechanism invented?
Only then: what is the professional name and engine contract?
```

> ‏`ENGINE RULE` — עומק מקצועי אינו תחליף להסבר. הקורס צריך להגיע לרמת Execution מקצועית בלי להניח ידע מוקדם במונחים כמו `markout`, ‏`residency`, ‏`atomicity`, ‏`reconciliation` או `ownership`.

---

## ‏10H.2 `MidPrice` אינה “לקבל חצי Spread בחינם”

### ‏במילים פשוטות

‏נניח:

```text
Bid = 100.00
Ask = 100.10
Mid = 100.05
```

‏נראה מפתה לומר:

```text
instead of buying at 100.10
buy at 100.05
→ saved 0.05
```

‏אבל יש בעיה: אף אחד לא חייב למכור לנו ב־100.05.

‏ייתכן שנקבל Fill מצוין.

‏ייתכן שלא נקבל Fill בכלל והשוק יעלה ל־100.30.

‏ייתכן שנקבל Fill בדיוק לפני שהמחיר יירד — כלומר קיבלנו midpoint, אבל ה־Fill עצמה הייתה adverse.

### `COMMON WRONG CONCLUSION`

```text
midpoint price
→ automatic half-spread saving
→ better execution
```

### `WHAT ACTUALLY MATTERS`

‏צריך למדוד יחד:

```text
price improvement
fill probability
time cost
no-fill missed move
post-fill markout
signal age at fill
routing / broker path
```

‏`MidPrice` היא Broker-managed midpoint execution behavior; היא אינה coupon שמעניק חצי Spread בכל ניסיון.

### `WHAT PROFESSIONALS MEASURE`

```text
midpoint_attempt_count
midpoint_fill_rate
time_to_first_fill
signal_age_at_fill
price_improvement_vs_arrival
post_fill_markout
no_fill_future_move
missed_move_cost
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `MIDPRICE` נשארת Candidate רק כל עוד remaining signal life וה־`Economic Price Bound` עדיין מצדיקים אותה. ‏No Fill אינה סיבה אוטומטית לעבור ל־aggression גבוהה יותר.

---

## ‏10H.3 `Post Only` אינה “Passive Limit טובה יותר”

### ‏במילים פשוטות

‏נניח שבזמן ההחלטה אנחנו רוצים לקנות ב־100.00 כאשר:

```text
Bid = 100.00
Ask = 100.02
```

‏Limit ב־100.00 היא passive בזמן ההחלטה.

‏אבל לפני שה־Order מגיעה, ה־Ask יכולה לרדת ל־100.00.

‏עכשיו אותה Limit עלולה לקחת נזילות מיד.

‏`Post Only` נועדה לאכוף את הכלל:

```text
Do not become liquidity-taking on arrival.
```

‏לכן היא יכולה להידחות, להשתנות או לקבל טיפול route-specific במקום לבצע מיד.

### `COMMON WRONG CONCLUSION`

```text
Post Only
→ same passive order
→ just safer / cheaper
```

### `WHAT ACTUALLY MATTERS`

‏`Post Only` מחליפה trade-off:

```text
less accidental taking
```

‏מול:

```text
more reject/reprice/no-fill risk
more missed opportunity
```

‏כלומר היא constraint, לא upgrade אוניברסלי.

### `WHAT PROFESSIONALS MEASURE`

```text
post_only_requested
post_only_outcome
arrival_marketable_state
reject_or_reprice_rate
fill_rate
queue_wait
missed_move_after_no_fill
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `PASSIVE_POST_ONLY` צריכה להתחרות מול `PASSIVE_JOIN` לפי current opportunity cost. אם missed-move cost גדול יותר מהערך של איסור taking, Post Only יכולה להיות Candidate גרועה יותר.

---

## ‏10H.4 Broker Algo אינה יודעת למה אנחנו רוצים את העסקה

### ‏במילים פשוטות

‏כאשר אנחנו משתמשים ב־`Adaptive` או `MidPrice`, אנחנו אומרים לברוקר בערך:

```text
Help me execute this order under these broker parameters.
```

‏אנחנו לא שולחים לו את כל הסיבה שבגללה המערכת שלנו רוצה את העסקה.

‏הברוקר לא בהכרח יודע:

```text
our private signal strength
our remaining signal life
our opportunity ranking
our reason to cancel now
our next-best stock
```

### `COMMON WRONG CONCLUSION`

```text
smart broker algo
→ understands when my signal is no longer worth trading
```

### `WHAT ACTUALLY MATTERS`

```text
broker execution objective
!=
private alpha objective
```

‏האצלת execution tactics לברוקר אינה האצלת Strategy judgment.

### `WHAT PROFESSIONALS MEASURE`

```text
signal_age_while_broker_managed
cancel_latency
fills_after_local_signal_expiry
broker_algo_time_to_fill
implementation_shortfall
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `application_order_ttl`, ‏Signal validity, ‏`Economic Price Bound` ו־Cancel authority נשארים בבעלות המערכת גם כאשר repricing/search מבוצעים בידי Broker Algo.

---

## ‏10H.5 Stop אינה מבטיחה את מחיר היציאה

### ‏במילים פשוטות

‏נניח שיש לנו Position והגדרת Stop ב־50.00.

‏אם המחיר יורד במהירות:

```text
50.03
→ 49.90
```

‏ה־Stop יכולה להתחיל את תהליך היציאה כאשר ה־trigger מתקיים — אבל זה לא אומר שה־Fill תהיה ב־50.00.

### `COMMON WRONG CONCLUSION`

```text
stop price = guaranteed exit price
```

### `WHAT ACTUALLY MATTERS`

‏יש שתי שאלות שונות:

```text
When does protection activate?
How does it execute after activation?
```

‏`Stop` נוטה להעדיף exit certainty על פני price certainty.

‏`Stop Limit` מוסיפה price boundary, אך אז Position יכולה להישאר פתוחה לאחר trigger.

### `WHAT PROFESSIONALS MEASURE`

```text
trigger_time
trigger_reference
trigger_to_first_fill_latency
slippage_from_trigger
triggered_but_unfilled_duration
remaining_position_after_trigger
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Triggered state אינה terminal safety state. ‏`TRIGGERED != FILLED`, ולכן protection monitoring ממשיך עד Position/Order reconciliation.

---

## ‏10H.6 Trailing Stop תלויה בדרך, לא רק במחיר הסופי

### ‏במילים פשוטות

‏שתי מניות יכולות להגיע בסוף לאותו מחיר — אבל Trailing Stop יכולה להתנהג אחרת בגלל הדרך שעברו.

‏לדוגמה רעיונית:

```text
Path A:
100 → 105 → 102

Path B:
100 → 102
```

‏בשני המקרים המחיר האחרון הוא 102.

‏אבל ב־Path A ה־trail כבר עלתה בעקבות השיא ב־105, ולכן ייתכן שכבר נוצר trigger שלא היה נוצר ב־Path B.

### `COMMON WRONG CONCLUSION`

```text
same current price
→ same trailing-stop state
```

### `WHAT ACTUALLY MATTERS`

‏Trailing Order היא path-dependent: היסטוריית reference/ratchet משפיעה על state הנוכחי.

### `WHAT PROFESSIONALS MEASURE`

```text
reference_high_or_low
current_trailing_trigger
trail_distance
trigger_adjustment_history
trigger_time
post_trigger_fill_state
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Recovery של Trailing Order אינה יכולה להיבנות מהמחיר הנוכחי בלבד. אם broker-observed trail/trigger state אינה ניתנת לשחזור, היא נשארת `UNKNOWN` עד reconciliation מספקת.

---

## ‏10H.7 Bracket אינה “הפוזיציה מוגנת כי שלחנו שלוש פקודות”

### ‏במילים פשוטות

‏Bracket נראית כך:

```text
Entry
├── Profit Taker
└── Protective Stop
```

‏קל לחשוב:

```text
I created the bracket
→ therefore the position is protected
```

‏אבל protection אמיתית תלויה במה שכבר התקבל/הופעל אצל Broker, איזו quantity התמלאה בפועל, ואיזו child יכולה כרגע לבצע.

### `COMMON WRONG CONCLUSION`

```text
bracket created locally
→ protection exists remotely
```

### `WHAT ACTUALLY MATTERS`

```text
UNTRANSMITTED != PROTECTED
```

‏ואחרי Parent Partial Fill צריך לבדוק את הכמות המוגנת בפועל, לא את הכמות שתכננו לקנות.

### `WHAT PROFESSIONALS MEASURE`

```text
reconciled_position
protected_target_qty
verified_protected_qty
child_activation_state
child_executable_qty
unknown_child_count
protection_gap_duration
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `FULLY_PROTECTED_VERIFIED` מתקבלת רק מ־broker/execution/position evidence. יצירת graph מקומית אינה evidence מספקת.

---

## ‏10H.8 OCA/OCO אינה קסם אטומי

### ‏במילים פשוטות

‏נניח שיש שתי פקודות יציאה, `A` ו־`B`, בקבוצת OCA.

‏המטרה היא שאם `A` מבצעת, `B` תבוטל או תותאם.

‏אבל בשוק אמיתי האירועים אינם חייבים להתרחש באותו רגע בדיוק.

‏אפשר לקבל:

```text
A fills
→ cancel B is still traveling
→ B remains executable briefly
```

### `COMMON WRONG CONCLUSION`

```text
OCO/OCA
→ impossible for both sides to execute
```

### `WHAT ACTUALLY MATTERS`

```text
coordination intent
!=
atomic execution guarantee
```

‏כל member שאינה Terminal עדיין נכללת ב־worst-case exposure.

### `WHAT PROFESSIONALS MEASURE`

```text
member_lifecycle_by_id
sibling_cancel_latency
simultaneous_executable_qty
partial_fill_by_member
late_sibling_fill
position_flip_events
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Risk sizing ב־OCA/OCO מבוסס על כל ה־members שעדיין potentially executable, לא על intended winner.

---

## ‏10H.9 Cancel אינה מוחקת Order ברגע שלחצנו Cancel

### ‏במילים פשוטות

‏כאשר המנוע שולח:

```text
cancel(order)
```

‏הוא שלח בקשה.

‏באותו זמן ה־Order יכולה כבר להיות בדרך ל־Fill, או שה־Cancel עדיין לא התקבלה.

### `COMMON WRONG CONCLUSION`

```text
cancel requested
→ order gone
```

### `WHAT ACTUALLY MATTERS`

```text
CANCEL_REQUESTED
!=
CANCEL_CONFIRMED
!=
TERMINAL_NON_EXECUTABLE
```

### `WHAT PROFESSIONALS MEASURE`

```text
cancel_requested_at
cancel_ack_at
late_fill_after_cancel
cancel_unknown_duration
potentially_executable_qty_during_cancel
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Replacement, Exit sizing ו־Protection sizing חייבים להמשיך לכלול Order cancel-pending/unknown עד terminal broker evidence.

---

## ‏10H.10 Modify אינה “עריכת שדה בחינם”

### ‏במילים פשוטות

‏נניח שחיכינו בתור לקנייה ב־100.00 ואז החלטנו לשנות ל־100.01.

‏מהצד שלנו זה נראה כמו שינוי קטן במספר.

‏אבל מבחינת execution ייתכן ששינינו:

```text
queue position
fill probability
marketability
price risk
working-order state certainty
```

### `COMMON WRONG CONCLUSION`

```text
same orderId + new price
→ same order, same queue, only better price
```

### `WHAT ACTUALLY MATTERS`

‏`MODIFY_IN_PLACE` אינה הבטחה לשמירת Queue Priority, והיא גם אינה שקולה לשינוי `Behavior Candidate`.

‏אם עוברים למשל מ־`PASSIVE_JOIN` ל־`MARKETABLE_LIMIT_IOC`, זו Decision חדשה גם אם implementation מסוימת מאפשרת reuse של מזהה.

### `WHAT PROFESSIONALS MEASURE`

```text
modify_count
modify_ack_latency
queue outcome after modify
fill probability before/after modify
late fill during modify
unknown_modify_duration
candidate_before
candidate_after
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — ‏Modify policy צריכה לשקלל queue value, signal freshness, state uncertainty ו־candidate semantics; API convenience אינה execution justification.

---

## ‏10H.11 מקצוענות כוללת גם החלטה לא לבצע

### ‏במילים פשוטות

‏אחרי שלומדים הרבה פקודות מתקדמות קל לחשוב שתמיד צריך לבחור אחת מהן.

‏אבל לפעמים ההחלטה המקצועית ביותר היא:

```text
NO_TRADE
REDUCE_SIZE
CANCEL_EXISTING
DEFER
NO_ACTION
EXIT_ONLY
```

‏כלומר: Advanced Order טובה אינה חובה להשתמש ב־Advanced Order.

### `COMMON WRONG CONCLUSION`

```text
there is always a clever order that can rescue the opportunity
```

### `WHAT ACTUALLY MATTERS`

‏אם אין Candidate שעומדת יחד ב־Signal, Risk, price bound, timing ו־Capability gates — התוצאה הנכונה היא לא להכריח execution.

### `WHAT PROFESSIONALS MEASURE`

```text
elimination_reason_codes
no_trade_rate
reduce_size_rate
cancel_due_to_staleness
defer_duration
opportunity outcome after disciplined no-trade
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Candidate selector רשאית להחזיר אפס Candidates. “לא לעשות” היא תוצאה מלאה של Decision Engine, לא error path.

---

## ‏10H.12 Acceptance Tests — Beginner + Practitioner Layer

```text
1. A beginner can explain MidPrice without first knowing the term markout.
2. MidPrice evaluation includes no-fill and time cost, not only midpoint price saving.
3. Post Only is described as a constraint, not a universally better passive order.
4. Broker Algo never receives authority over private signal validity.
5. Stop trigger price is never presented as guaranteed fill price.
6. Two identical current prices can map to different trailing states because path differs.
7. Bracket local construction is never treated as verified protection.
8. OCA/OCO is never treated as atomic execution.
9. Cancel request never removes an order from potentially executable exposure by itself.
10. Modify can change queue economics and state certainty.
11. Candidate selection may validly return NO_TRADE / NO_ACTION / REDUCE_SIZE.
12. Every advanced term introduced here has a plain-language explanation before the deeper engine contract.
```

---

## ‏10H.13 Checkpoint

‏`R7B` סוגר במפורש:

```text
AO-GAP-P1-06 — MidPrice is not free half-spread improvement
AO-GAP-P1-07 — Post Only is not universally better passive execution
AO-GAP-P1-08 — Broker Algo does not understand private signal intent
```

‏בנוסף הוא מוסיף Practitioner Judgment יישומי ל־Stops, ‏Trailing, ‏Bracket, ‏OCA/OCO, ‏Cancel ו־Modify.

‏הפרק גם מקבע דרישת הוראה חדשה לקורס הסופי:

```text
plain language
→ simple example
→ professional term
→ advanced semantics
→ engine implication
```

‏השלב הבא הוא `R7C`: closeout audit של Practitioner Judgment מול Review 7 ו־Final Gap List, ובדיקה האם נשאר insight מהותי שלא קיבל שכבה פשוטה + מקצועית.