# ‏חלק 10I — Practitioner Judgment Completion: השלמת התובנות המקצועיות למתחיל

> ‏מטרת הפרק: לסגור את תובנות Review 7 שעדיין לא קיבלו שכבת `beginner-first` מפורשת. כל נושא מתחיל בשפה פשוטה ובדוגמה קצרה, ורק אחר כך עובר למונח המקצועי ול־Engine implication.

---

## ‏10I.1 `FOK`, ‏`AON` ו־`MinQty`: לא תמיד נכון להילחם ב־Partial Fill

### ‏במילים פשוטות

‏נניח שרצינו לקנות 100 מניות, אבל כרגע אפשר לקבל רק 40 במחיר שמתאים לנו.

‏אפשר לומר:

```text
I want all 100 or nothing
```

‏אבל זו אינה בהכרח החלטה טובה יותר. אם 40 מניות עדיין יוצרות Position שימושית ובטוחה, דרישת “הכול או כלום” יכולה להפוך הזדמנות חלקית טובה ל־No Fill מוחלט.

### `COMMON WRONG CONCLUSION`

```text
partial fills are annoying
→ prevent partial fills whenever possible
```

### `WHAT ACTUALLY MATTERS`

‏השאלה המקצועית היא:

```text
Is partial exposure economically useful and operationally safe?
```

‏`FOK`, ‏`AON` ו־`MinQty` הן constraints על quantity/fill behavior. הן אינן “פתרון” כללי לבעיה של Partial Fill.

### `WHAT PROFESSIONALS MEASURE`

```text
requested_qty
filled_qty
useful_partial_threshold
no_fill_due_to_quantity_constraint
missed_move_after_constraint_no_fill
partial_position_outcome
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Partial Fill היא Decision State חדשה. Quantity constraint מאושרת רק אם היא משפרת את economics/risk של ה־intent, לא רק כדי להקל על state management.

---

## ‏10I.2 Hidden, Reserve/Iceberg ו־Discretionary מסתירות דברים שונים

### ‏במילים פשוטות

‏שלוש פקודות יכולות להיראות “מוסתרות”, אבל הן אינן מסתירות את אותו דבר:

```text
Hidden
→ פחות/בלי נוכחות גלויה

Reserve / Iceberg
→ מציגים רק חלק מהכמות

Discretionary
→ המחיר הגלוי יכול להיות פחות אגרסיבי מהמחיר שבו אנחנו עדיין מוכנים לבצע
```

### `COMMON WRONG CONCLUSION`

```text
more hidden
→ more sophisticated
→ better execution
```

### `WHAT ACTUALLY MATTERS`

‏צריך לשאול קודם **איזה מידע רוצים להסתיר** — presence, quantity או executable willingness — והאם בכלל יש לנו footprint ששווה את המורכבות.

### `WHAT PROFESSIONALS MEASURE`

```text
displayed_qty
actual_working_qty
fill_probability
queue / priority effects
execution_price_vs_displayed_price
debuggability
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Hidden, Reserve ו־Discretionary נשארות dimensions/behaviors נפרדים; אין “concealment mode” יחיד.

---

## ‏10I.3 Pegged / Relative: העברנו את ה־Repricing, לא ביטלנו אותו

### ‏במילים פשוטות

‏במקום שהמחשב שלנו ישנה מחיר בכל תזוזת Quote, אפשר לתת ל־Broker/Venue כלל כמו “עקוב אחרי reference מסוים”.

‏זה חוסך local cancel/replace — אבל הפקודה עדיין משנה את המחיר שלה.

### `COMMON WRONG CONCLUSION`

```text
broker/venue reprices for me
→ repricing risk is gone
```

### `WHAT ACTUALLY MATTERS`

‏צריך לדעת:

```text
reference
offset
cap
route semantics
one-way / two-way behavior
who owns repricing
when local intent expires
```

‏ה־Peg יכולה להמשיך לעבוד “נכון” לפי הכלל שלה גם אחרי שה־Signal שלנו כבר מת.

### `WHAT PROFESSIONALS MEASURE`

```text
reference_changes
effective_price_changes
cap_hits
fills_after_signal_expiry
cancel_latency
route-specific behavior
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Broker/Venue repricing לעולם אינה מבטלת `application_order_ttl`, local cancel authority או `Economic Price Bound`.

---

## ‏10I.4 Snap: נגזרת מהשוק פעם אחת, ואז נשארת קבועה

### ‏במילים פשוטות

‏נניח שה־Midpoint עכשיו הוא 100.05. ‏Snap יכולה לחשב ממנו מחיר פעם אחת — ואז לעבוד כ־Limit קבועה.

‏אם השוק עובר ל־100.15, המחיר הישן אינו “ממשיך לעקוב”.

### `COMMON WRONG CONCLUSION`

```text
Snap uses market reference
→ Snap keeps following market reference
```

### `WHAT ACTUALLY MATTERS`

```text
Peg = ongoing relationship
Snap = one-shot derivation
```

‏לכן הסיכון המרכזי הוא `stale derived price`.

### `WHAT PROFESSIONALS MEASURE`

```text
snap_reference_at_creation
snap_fixed_price
market_move_since_snap
working_age
stale_fill_rate
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Snap דורשת TTL קצר ו־fresh decision logic; אין להניח שהמחיר הקבוע עדיין מייצג את ה־intent המקורי.

---

## ‏10I.5 Sweep-to-Fill: מהירות לבדה אינה הוכחה לאיכות

### ‏במילים פשוטות

‏Sweep מנסה לצרוך נזילות במהירות בכמה מקומות/רמות בתוך Price Cap.

‏זה יכול להשיג Fill מהר יותר — אבל “מהר יותר” יכול גם לעלות יותר ולהשאיר footprint גדול יותר.

### `COMMON WRONG CONCLUSION`

```text
fastest fill
→ best aggressive execution
```

### `WHAT ACTUALLY MATTERS`

‏יש להשוות באותו Market State מול `MARKETABLE_LIMIT_IOC`, ‏plain SMART marketable Limit ו־`ADAPTIVE_LIMIT_URGENT`.

### `WHAT PROFESSIONALS MEASURE`

```text
time_to_useful_fill
average_fill_price
filled_fraction
fees
venue_split_count
price_concession
post_fill_markout
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Sweep אינה מקבלת עדיפות בגלל speed בלבד; היא Candidate בתוך aggressive family ונמדדת על net execution economics.

---

## ‏10I.6 Market-to-Limit: ה־Remainder יכולה להפוך לפקודה ישנה

### ‏במילים פשוטות

‏Market-to-Limit יכולה להתחיל בביצוע מיידי, לקבל Partial Fill, ואז להפוך את השאר ל־Limit.

‏אבל בזמן שבין שני השלבים השוק וה־Signal יכולים להשתנות.

### `COMMON WRONG CONCLUSION`

```text
initial execution was valid
→ remaining transformed limit is automatically still valid
```

### `WHAT ACTUALLY MATTERS`

‏אחרי transformation צריך לשאול מחדש:

```text
Is the signal still valid?
Is the remaining size still useful?
Is the transformed price still economically valid?
```

### `WHAT PROFESSIONALS MEASURE`

```text
initial_fill_qty
remainder_qty
transformed_limit_price
time_since_transformation
signal_age
stale_remainder_cancel_rate
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — transformed remainder כפופה ל־`application_order_ttl` ול־fresh decision; transformation אינה renew של ה־Signal.

---

## ‏10I.7 Exit: לפני ששולחים עוד Exit צריך לדעת מי עוד יכול לבצע

### ‏במילים פשוטות

‏נניח שיש Position של 100 מניות. אנחנו רוצים לצאת, אבל כבר קיימים Stop, Profit Taker ו־Cancel-pending order.

‏אם נשלח עכשיו Sell נוסף של 100 בלי להבין מה עוד יכול לבצע, אפשר לעבור בטעות מ־100 Long ל־Short.

### `COMMON WRONG CONCLUSION`

```text
position = 100
→ safe to send exit for 100
```

### `WHAT ACTUALLY MATTERS`

‏צריך לדעת גם:

```text
what other orders can still change the position?
```

### `WHAT PROFESSIONALS MEASURE`

```text
reconciled_position
potentially_executable_exit_qty
potentially_executable_entry_remainder
protection_qty
cancel_pending_qty
unknown_qty
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Exit sizing מבוסס על Position Truth + כל ה־orders שעדיין potentially executable, לא על Position snapshot בלבד.

---

## ‏10I.8 `UNKNOWN` היא תשובה מקצועית

### ‏במילים פשוטות

‏אחרי disconnect ייתכן שלא נדע אם Order התמלאה או אם Cancel הצליחה.

‏הטעות המסוכנת היא “להחליט” שהיא בטח בוטלה כדי להמשיך מהר.

### `COMMON WRONG CONCLUSION`

```text
unknown state is inconvenient
→ infer the most likely state and continue
```

### `WHAT ACTUALLY MATTERS`

‏חוסר ודאות הוא מצב אמיתי במערכת מבוזרת.

```text
UNKNOWN
```

‏עדיף על certainty מומצאת.

### `WHAT PROFESSIONALS MEASURE`

```text
unknown_duration_ms
unknown_reason
potentially_executable_qty
reconciliation_attempts
late_effects_after_unknown
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `UNKNOWN` חוסמת blind retry ו־new risk; הפעולה הבאה היא reconciliation או risk-safe decision, לא ניחוש.

---

## ‏10I.9 בזמן Recovery, המציאות אצל Broker קודמת למה שהתכוונו

### ‏במילים פשוטות

‏לפני הנפילה המנוע אולי “חשב” שיש 0 מניות. אבל אם Buy התמלאה רגע לפני disconnect, המציאות הפיננסית שונה מהזיכרון המקומי.

### `COMMON WRONG CONCLUSION`

```text
restore local strategy state
→ continue from where we stopped
```

### `WHAT ACTUALLY MATTERS`

```text
intent = what we wanted
broker/execution truth = what may actually have happened
```

### `WHAT PROFESSIONALS MEASURE`

```text
broker_position
executions
working_orders
unknown_orders
protection_graph
ownership_state
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Recovery היא `Position-First + Ownership-First`; Strategy authority חוזרת רק אחרי reconciliation ו־earned `READY`.

---

## ‏10I.10 יותר Automation יכולה להקטין Explainability

### ‏במילים פשוטות

‏אם Broker Algo עושה הרבה החלטות עבורנו, הקוד המקומי נהיה פשוט יותר — אבל לפעמים קשה יותר להבין אחר כך **למה** Fill התרחשה בדיוק אז ובאותו מסלול.

### `COMMON WRONG CONCLUSION`

```text
less local code
→ simpler system in every sense
```

### `WHAT ACTUALLY MATTERS`

‏מורכבות כוללת גם:

```text
debuggability
attribution
replay fidelity
acceptance-test burden
```

### `WHAT PROFESSIONALS MEASURE`

```text
unexplained_behavior_rate
route_visibility
replay_reproducibility
acceptance_test_coverage
attribution_confidence
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — כאשר economics דומים, Candidate שקל יותר למדוד ולהסביר יכולה להיות Research baseline טובה יותר מ־behavior opaque ומתוחכמת יותר.

---

## ‏10I.11 Capability היא תכונה של Combination, לא של שם הפקודה

### ‏במילים פשוטות

‏זה שראינו `Order Type` מסוים עובד במקום אחד לא אומר שהוא יעבוד בכל Symbol, Route, Account או API combination.

### `COMMON WRONG CONCLUSION`

```text
I saw this feature in TWS
→ it is supported for everything I trade
```

### `WHAT ACTUALLY MATTERS`

‏Capability יכולה להיות תלויה ב־:

```text
product
contract
account / legal entity
route / venue
session
API path
order attributes combination
```

### `WHAT PROFESSIONALS MEASURE`

```text
capability_tuple
runtime_confirmation
paper_acceptance
live_small_acceptance
rejects_by_tuple
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `PRODUCTION_ENABLED` היא evidence state של tuple מסוים; אינה Feature Flag גלובלית על order name.

---

## ‏10I.12 Entry ו־Exit אינן תמונת מראה

### ‏במילים פשוטות

‏אם ניסינו להיכנס ולא קיבלנו Fill, אפשר להישאר בלי עסקה.

‏אם כבר יש Position ורצינו לצאת ולא קיבלנו Fill, הסיכון עדיין קיים.

### `COMMON WRONG CONCLUSION`

```text
same order primitive
→ same decision logic for entry and exit
```

### `WHAT ACTUALLY MATTERS`

```text
Entry no-fill can end flat.
Exit no-fill leaves exposure.
```

### `WHAT PROFESSIONALS MEASURE`

```text
purpose
remaining_position
remaining_signal_life
exit_urgency
protection_state
no_fill_destination
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Primitive יכולה להיות משותפת, אבל Entry/Exit policy וה־failure destination חייבים להיות purpose-aware.

---

## ‏10I.13 Chase בלי Cumulative Budget היא Market Order מוסווית

### ‏במילים פשוטות

‏נניח שהתחלנו Limit ב־50.01. כל 200ms אנחנו מוסיפים עוד סנט:

```text
50.01
→ 50.02
→ 50.03
→ 50.04
```

‏כל צעד נראה קטן, אבל ביחד ויתרנו כבר 3 סנט.

### `COMMON WRONG CONCLUSION`

```text
one more tick is acceptable
→ keep chasing
```

### `WHAT ACTUALLY MATTERS`

‏צריך לחשב concession מצטברת מול ה־economic intent המקורי.

### `WHAT PROFESSIONALS MEASURE`

```text
initial_authorized_price
current_authorized_price
cumulative_concession
remaining_edge
reprice_count
signal_age
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — כל reprice חייבת להישאר בתוך cumulative chase budget ו־`Economic Price Bound`; סדרת צעדים קטנים אינה bypass לגבול.

---

## ‏10I.14 `NO_FILL`, ‏`PARTIAL` ו־`REJECT` מספרים סיפורים שונים

### ‏במילים פשוטות

‏שלושתם יכולים להיראות כמו “הפקודה לא הושלמה”, אבל:

```text
NO_FILL
→ לא נוצר Fill

PARTIAL
→ חלק התמלא, ולכן Position השתנתה

REJECT
→ מסלול הביצוע שתכננו לא הפך לפקודה תקפה כפי שהתכוונו
```

### `COMMON WRONG CONCLUSION`

```text
not fully filled
→ use the same fallback
```

### `WHAT ACTUALLY MATTERS`

‏כל outcome משנה state אחרת. Reject טכני אינו סיבה כלכלית להעלות aggression; Partial דורשת קודם Position Truth חדשה.

### `WHAT PROFESSIONALS MEASURE`

```text
outcome_class
reason_code
filled_qty
position_after_event
failure_destination
capability_evidence_effect
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Outcome classification קודמת ל־fallback. אין escalation כללית בשם “order failed”.

---

## ‏10I.15 Order מתוחכמת יכולה להיות איטית מדי ל־Signal קצר

### ‏במילים פשוטות

‏פקודה יכולה להיות מאוד חכמה — אבל אם היא צריכה שניות כדי לחפש מחיר טוב וה־Signal שלנו חי רק 300ms, היא פשוט פותרת בעיה בקצב הלא נכון.

### `COMMON WRONG CONCLUSION`

```text
more sophisticated execution
→ more suitable execution
```

### `WHAT ACTUALLY MATTERS`

```text
behavior time scale
must fit
signal time scale
```

### `WHAT PROFESSIONALS MEASURE`

```text
signal_half_life
candidate_time_to_useful_fill
candidate_time_to_terminal
fills_after_signal_expiry
no_fill_missed_move
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — Candidate שאינה יכולה לייצר useful outcome בתוך remaining signal life צריכה להיפסל גם אם היא sophisticated ומקצועית.

---

## ‏10I.16 Measurability היא חלק מאיכות Research Candidate

### ‏במילים פשוטות

‏אם שתי שיטות נראות כמעט שוות, לפעמים עדיף להתחיל מזו שאפשר להבין ולשחזר בבירור.

### `COMMON WRONG CONCLUSION`

```text
most sophisticated candidate
→ best research baseline
```

### `WHAT ACTUALLY MATTERS`

‏Research טובה דורשת attribution:

```text
what happened
why it happened
what would likely have happened under the alternative
```

### `WHAT PROFESSIONALS MEASURE`

```text
telemetry completeness
replay fidelity
route visibility
state reconstructability
shadow comparability
```

### `ENGINE IMPLICATION`

> ‏`ENGINE RULE` — `research_role` יכולה להעדיף Candidate measurable/replayable כ־baseline גם אם Candidate אחרת נראית “חכמה” יותר.

---

## ‏10I.17 Memory Rule — מה מקצוען שואל לפני Advanced Order

```text
1. Is the intent still valid?
2. What can execute right now?
3. What price / quantity am I actually authorizing?
4. Who manages the behavior after submit?
5. What survives if my process disappears?
6. What could arrive late?
7. What happens on NO_FILL / PARTIAL / REJECT / UNKNOWN?
8. Can I measure and explain the result afterward?
9. Does this behavior fit the signal horizon?
10. Is doing nothing / reducing size better?
```

‏אם אי אפשר לענות על השאלות האלה, השם המתקדם של הפקודה אינו מפצה על החוסר.

---

## ‏10I.18 Checkpoint

‏הפרק משלים את תובנות Review 7 שלא קיבלו קודם שכבת beginner-first מפורשת:

```text
Partial-fill constraints
Hidden / Reserve / Discretionary
Pegged / Relative
Snap
Sweep-to-Fill
Market-to-Limit remainder
Exit executable-graph thinking
UNKNOWN as real state
Broker truth before intent in recovery
Automation vs explainability
Combination-specific capability
Entry vs Exit asymmetry
Cumulative chase budget
NO_FILL vs PARTIAL vs REJECT
Sophistication vs signal horizon
Measurability as research quality
```

‏ביחד עם `10G` ו־`10H`, שכבת Practitioner Judgment מכסה כעת את רשימת Review 7 המלאה.