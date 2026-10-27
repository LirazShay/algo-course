# ‏חלק 4B — Liquidity & Display Decision Guide: ‏Passive, Post Only, Hidden, Reserve ו־Discretionary

> ‏הפרק הזה הוא שכבת Decision מעל Parts 4 ו־4A. הוא אינו מוסיף Order Types חדשים; הוא מחדד שתי הכרעות שקל מאוד לבלבל ביניהן: **איך מבטאים/אוכפים passive intent**, ו־**מה בדיוק אנחנו מנסים לא לחשוף לשוק**.

---

## ‏4B.1 שתי שאלות שונות שצריך לענות עליהן בנפרד

```text
Question A — Liquidity behavior
Do we merely intend to be passive now,
or must the order be prevented from intentionally taking displayed liquidity at handling time?

Question B — Information exposure
What are we trying not to reveal?
- order presence?
- total quantity?
- executable price willingness?
```

‏אם מערבבים את שתי השאלות מתקבלות מסקנות שגויות כמו:

```text
Hidden = passive
Reserve = Post Only
Discretionary = Hidden Limit
```

‏אף אחת מהשקילויות האלה אינה נכונה.

> ‏`ENGINE RULE` — `liquidity_intent`, ‏`display_policy`, ‏`quantity_visibility`, ‏`executable_price_range` ו־`liquidity_constraint` הם dimensions נפרדים.

---

# ‏חלק א — `Passive Limit` מול `Post Only`

## ‏4B.2 משפט הזיכרון

```text
Passive Limit expresses current passive intent.
Post Only enforces a passive-only constraint at order handling time.
```

‏זה ההבדל המרכזי.

‏`PASSIVE_JOIN` יכולה להיווצר כ־Limit שנמצאת passive לפי ה־snapshot שלנו.

‏`PASSIVE_POST_ONLY` מוסיפה constraint שמנסה למנוע מעבר שקט ל־liquidity-taking כאשר מצב השוק משתנה לפני שה־Order מטופלת.

---

## ‏4B.3 `PASSIVE_JOIN` — Decision Card

### ‏What

‏Limit שנבחרת כך שב־Decision snapshot היא נחה בצד שלנו של הספר ואינה אמורה לחצות את ה־spread.

### ‏Why

‏כדי לקבל behavior פשוט, שקוף וקל ל־telemetry, ללא constraint נוסף שתלוי ב־Venue/Broker semantics.

### ‏When

```text
passive intent is desired but not absolute
arrival race is acceptable
simple lifecycle is preferred
missed-move cost matters enough that accidental marketability is not automatically unacceptable
```

### ‏Why Not

‏ה־market יכולה להשתנות בין Decision ל־Arrival. Limit שהייתה passive ב־`t0` יכולה להיות marketable ב־`t1`.

### ‏Closest Alternative

`PASSIVE_POST_ONLY` כאשר passive-only economics הם invariant ולא רק preference.

### ‏Main Failure Mode

```text
decision sees passive price
→ market moves before broker/venue handling
→ order becomes marketable
→ execution takes liquidity although local intent was passive
```

### ‏For Our Engine

```text
CORE_BASELINE
```

---

## ‏4B.4 `PASSIVE_POST_ONLY` — Decision Card

### ‏What

‏Passive Limit materialization עם Post Only constraint במסלול שתומך בכך.

### ‏Why

‏כדי להגן על assumption כלכלי/התנהגותי:

```text
if taking liquidity would invalidate the trade economics,
do not silently cross merely because the market moved before arrival
```

### ‏When

```text
maker/passive economics are required
liquidity-taking would violate the plan
route-specific Post Only semantics are validated
reject/reprice/no-fill outcomes are acceptable
```

### ‏Why Not

‏Momentum מהיר יכול לברוח בזמן שה־Order נדחית, מוסתת או נשארת passive. אם missed-move cost גדול מה־spread/taker cost שנחסך, Post Only יכולה להיות constraint יקרה מדי.

### ‏Closest Alternative

`PASSIVE_JOIN` כאשר passive behavior היא preference בלבד ולא hard constraint.

### ‏Main Failure Mode

```text
passive-only guard works exactly as designed
→ order does not take liquidity
→ market runs away
→ no fill / missed move dominates saved spread
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER / POLICY_GUARDRAIL
```

---

## ‏4B.5 Arrival-Race Example — אותה Decision, תוצאה אחרת

‏נניח BUY:

```text
t0 Decision:
Bid = 20.00
Ask = 20.01
selected price = 20.00
```

‏ב־`t0` גם `PASSIVE_JOIN` וגם `PASSIVE_POST_ONLY` נראות passive.

‏לפני arrival:

```text
t1:
Bid = 19.99
Ask = 20.00
```

### ‏Plain Passive Limit

‏`BUY LMT 20.00` יכולה כעת להיות marketable ולבצע מול Ask 20.00, בכפוף ל־normal limit semantics.

### ‏Post Only

‏ה־Order אמורה להישאר כפופה ל־passive-only handling semantics של הנתיב: reject/reprice/slide/other supported behavior במקום לקחת liquidity באופן שסותר את constraint.

‏מכאן:

```text
same decision price
!=
same arrival behavior
```

‏וזה בדיוק הערך של Post Only כ־guardrail.

---

## ‏4B.6 Elimination Questions — Passive מול Post Only

```text
Is taking displayed liquidity forbidden by economics/policy?
YES -> PASSIVE_JOIN alone is insufficient; Post Only-capable path may be required

Is missed-move cost currently larger than passive-only benefit?
YES -> Post Only may be eliminated; return to broader execution decision

Are route-specific Post Only semantics unvalidated?
YES -> PASSIVE_POST_ONLY is not production-eligible

Is signal life too short for reject/reprice/no-fill handling?
YES -> eliminate passive-only behavior and re-decide execution mode
```

> ‏`ENGINE RULE` — Post Only failure does not authorize an automatic cross. It returns to fresh Decision.

---

# ‏חלק ב — `Hidden` מול `Reserve/Iceberg` מול `Discretionary`

## ‏4B.7 משפט הזיכרון

```text
Hidden        -> hide displayed presence / displayed quantity
Reserve       -> hide part of total quantity
Discretionary -> hide part of executable price willingness
```

‏שלושתן עוסקות ב־information exposure, אבל כל אחת בציר אחר.

---

## ‏4B.8 Comparison Matrix — מה בדיוק מוסתר

| Mechanism | Displayed presence | Displayed quantity | Total quantity hidden? | Hidden executable price range? | Primary problem solved |
|---|---|---|---|---|---|
| Plain Limit | בדרך כלל visible | בדרך כלל visible | לא | לא | simple price control |
| `Hidden` | מופחתת/מוסתרת לפי semantics | מוסתרת/לא מוצגת | בפועל visibility מצטמצמת | לא זה הייעוד | conceal displayed footprint |
| `Reserve/Iceberg` | visible slice | partial | **כן** | לא | conceal total size while exposing a slice |
| `Discretionary` | base Limit יכולה להיות visible | לפי concrete order | לא זה הייעוד | **כן** | conceal extra executable price willingness |
| `Post Only` | לא concealment mechanism | לפי concrete order | לא | לא | enforce passive-only liquidity handling |

> ‏`ENGINE RULE` — “כמה רואים?” ו־“באילו מחירים Order יכולה לבצע?” הן שאלות שונות.

---

## ‏4B.9 `Hidden` — Decision Card

### ‏What

‏Display attribute שמפחיתה/מסתירה את נוכחות ה־Order או הכמות המוצגת, בהתאם ל־route/venue semantics.

### ‏Why

‏כדי לצמצם displayed footprint כאשר עצם חשיפת ה־Order או הכמות עלולה לשנות behavior של משתתפים אחרים או לחשוף intent.

### ‏When

```text
information leakage is material
visible footprint is undesirable
route capability is validated
queue/fill trade-off is acceptable
```

### ‏Why Not

‏פחות display אינו free advantage. Priority/fill behavior יכול להיות שונה, וה־Order עדיין יכולה להישאר stale או לקבל adverse fill.

### ‏Closest Alternative

`Reserve/Iceberg` כאשר רוצים להציג slice אך להסתיר total size.

### ‏Main Failure Mode

```text
less visible footprint
→ worse queue/fill outcome
→ missed move exceeds any information benefit
```

### ‏For Our Engine

```text
SPECIALIST / RESEARCH_CHALLENGER
```

---

## ‏4B.10 `Reserve/Iceberg` — Decision Card

### ‏What

‏Order שמציגה חלק מהכמות ומשאירה quantity נוספת לא מוצגת, עם replenishment/refresh semantics שתלויות בנתיב.

### ‏Why

‏כדי לעבוד quantity גדולה יותר בלי לחשוף מראש את כל ה־size.

### ‏When

```text
total size is meaningful relative to displayed liquidity
full size disclosure is undesirable
replenishment semantics are understood
queue consequences are measurable
```

### ‏Why Not

‏ל־Order קטנה מאוד אין כמעט מה “להסתיר”. בנוסף replenishment יכול לשנות queue outcome וה־hidden remainder עדיין נשאר executable exposure.

### ‏Closest Alternative

`Hidden` כאשר רוצים concealment רחב יותר של displayed presence; plain Limit כאשר size קטן והפשטות עדיפה.

### ‏Main Failure Mode

```text
displayed slice fills/replenishes
→ engine mistakes visible slice for total remaining exposure
→ quantity/risk reconciliation becomes wrong
```

### ‏For Our Engine

```text
SPECIALIST
```

---

## ‏4B.11 `DISCRETIONARY_LIMIT` — Decision Card

### ‏What

‏Limit עם base/displayed price ו־hidden discretionary execution range מעבר למחיר המוצג, בתוך capability וה־`Economic Price Bound`.

### ‏Why

‏כדי לשמור displayed posture פחות אגרסיבי תוך מתן willingness נוספת לביצוע שאינה משתקפת כולה במחיר המוצג.

### ‏When

```text
spread is economically meaningful
some hidden price willingness is useful
signal has enough life
actual executable range remains inside Economic Price Bound
capability is validated
```

### ‏Why Not

‏המחיר המוצג כבר אינו מספר את כל ה־risk. אם המנוע, UI או recovery מסתכלים רק על base price, הם יכולים להעריך בחסר את executable exposure.

### ‏Closest Alternative

Marketable Limit כאשר רוצים להציג במפורש את ה־aggressive Limit; `Hidden/Reserve` כאשר הבעיה היא quantity/presence visibility ולא price willingness.

### ‏Main Failure Mode

```text
displayed price looks safe
→ hidden discretionary range remains wider
→ Economic Price Bound tightens
→ order can still execute at a price no longer justified
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏4B.12 ארבע שאלות שמונעות taxonomy mistakes

‏לפני בחירת attribute נשאל:

```text
1. Must the order remain passive?
2. How much order presence should be displayed?
3. How much total quantity should be displayed?
4. What is the full executable price range, including hidden discretion?
```

‏מיפוי:

```text
Question 1 -> Post Only / liquidity constraint
Question 2 -> Hidden / display policy
Question 3 -> Reserve/Iceberg / quantity visibility
Question 4 -> Discretionary / executable willingness
```

‏Order אחת יכולה עקרונית לשלב כמה dimensions רק אם ה־capability המדויקת מאשרת את השילוב. אין להסיק combinability משמות features בלבד.

---

## ‏4B.13 Decision Example — “אני רוצה להסתיר” אינו מספיק

‏נניח:

```text
order_qty = 100
spread = meaningful
base passive price = 50.00
Economic Price Bound = 50.03
```

### ‏Case A — רוצים להסתיר עצם footprint

```text
problem = displayed presence
candidate dimension = Hidden
```

### ‏Case B — הכמות היא 20,000 ורוצים להראות רק slice

```text
problem = total quantity disclosure
candidate dimension = Reserve/Iceberg
```

### ‏Case C — רוצים להציג 50.00 אך להיות מוכנים לבצע עד 50.03

```text
problem = displayed price vs executable willingness
candidate dimension = Discretionary
```

### ‏Case D — אסור לקחת liquidity גם אם השוק זז

```text
problem = liquidity-taking constraint
candidate dimension = Post Only
```

‏המילה “hidden” אינה תשובה מספקת; צריך לזהות **איזה information/execution dimension** אנחנו רוצים לשלוט בו.

---

## ‏4B.14 Counterexample — “Post Only היא פשוט Passive Limit בטוחה יותר”

‏לא תמיד.

‏אם:

```text
signal life = 250ms
market moving rapidly upward
maker-only savings = 1 cent
missed move if no fill = materially larger
```

‏Post Only יכולה לבצע את מטרתה בצורה מושלמת — לא לקחת liquidity — ובכל זאת להיות decision גרועה יותר ל־opportunity.

‏כלומר:

```text
constraint success
!=
opportunity success
```

---

## ‏4B.15 Counterexample — “Hidden תמיד פחות חושפת ולכן טובה יותר”

‏אם Order קטנה ואין evidence ש־display footprint פוגע בנו, Hidden מוסיפה complexity/venue dependence בלי benefit מוכח.

‏ההשוואה צריכה להיות:

```text
information leakage avoided
versus
fill probability / queue outcome / missed move / markout
```

‏לא:

```text
less visible = automatically better
```

---

## ‏4B.16 Counterexample — “Reserve פותרת את אותה בעיה כמו Discretionary”

‏Reserve מסתירה **quantity**.

‏Discretionary מסתירה **price willingness**.

‏Order של 10,000 מניות עם visible slice 500 יכולה עדיין להיות בעלת Limit price שקופה לחלוטין.

‏Order של 100 מניות יכולה להיות Discretionary גם כאשר אין שום סיבה להסתיר quantity.

‏אלה dimensions orthogonal.

---

## ‏4B.17 Counterexample — “Displayed Limit היא ה־worst price שלי”

‏ב־plain Limit זה יכול להיות contract סביר.

‏ב־Discretionary אין להשתמש בכלל הזה.

‏Risk חייב לגזור:

```text
effective_executable_range
```

‏מתוך ה־concrete order semantics, ואז לבדוק אותו מול:

```text
Economic Price Bound
```

‏ולא מול `displayed_limit_price` בלבד.

---

## ‏4B.18 Partial Fill משנה גם כאן את הבעיה

‏לאחר Partial Fill:

```text
reconciled_position changes
remaining_qty changes
visible slice may change/replenish
hidden remainder may still exist
discretionary range may still be executable
signal life is shorter
```

‏לכן:

```text
partial fill
→ reconcile total remaining executable exposure
→ refresh economics
→ fresh decision
```

‏אסור להמשיך אוטומטית רק משום שה־attribute המקורי עדיין חוקי אצל Broker.

---

## ‏4B.19 Telemetry משותפת להשוואה

```text
behavior_candidate
liquidity_intent
post_only_requested
post_only_outcome
display_policy
displayed_qty
total_qty
reserve_qty
hidden_flag
displayed_limit_price
discretionary_amount
effective_executable_range
arrival_bid
arrival_ask
was_marketable_at_arrival
was_liquidity_added
was_liquidity_removed
reject_or_reprice_reason
fill_qty
fill_price
remaining_executable_qty
application_order_ttl
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
missed_move_if_unfilled
```

‏ה־telemetry צריכה לאפשר לענות גם על:

```text
Did the constraint work?
```

‏וגם על:

```text
Was using the constraint economically worthwhile?
```

---

## ‏4B.20 Decision Record מומלץ

```text
LiquidityDisplayDecision {
  snapshot_id
  liquidity_intent
  passive_only_required
  information_exposure_problem
  displayed_price
  displayed_qty
  total_qty
  effective_executable_range
  economic_price_bound
  survivors[]
  eliminated[] { candidate_or_attribute, reason_code }
  selected_behavior
  selected_attributes[]
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך ניתן להסביר אם בחירה מסוימת הייתה על liquidity constraint, display, quantity concealment או price discretion — במקום לשמור רק `order_type` עמום.

---

## ‏4B.21 Acceptance Tests

```text
1. PASSIVE_JOIN may become marketable after the decision snapshot; the engine does not assume passive-at-decision means passive-at-arrival.
2. PASSIVE_POST_ONLY is selected only when passive-only behavior is actually required and capability is validated.
3. Post Only reject/reprice/no-fill never triggers an automatic aggressive fallback.
4. Hidden is never treated as equivalent to Post Only.
5. Reserve/Iceberg hidden quantity remains part of total executable exposure.
6. Discretionary displayed price is never treated as the sole executable price bound.
7. Discretionary effective executable range never exceeds Economic Price Bound.
8. Partial fill causes fresh reconciliation of visible and hidden remaining exposure.
9. Attribute combinations require explicit capability evidence; no combinability is inferred from field availability.
10. Same snapshot + same policy yields the same survivor set and selected liquidity/display plan.
```

---

## ‏4B.22 Practitioner Insight

> ‏`ENGINE RULE` — “Passive”, “Hidden” ו־“Protected from taking” אינם אותו רעיון.

‏הדרך לזכור:

```text
Passive Limit  = where the price is now
Post Only      = what liquidity behavior is allowed at handling time
Hidden         = whether presence/quantity is displayed
Reserve        = how much of total quantity is displayed
Discretionary  = how much executable price willingness is not displayed
```

‏מערכת מקצועית אינה שואלת רק “איזה Order Type נבחר?”, אלא **איזה dimension אנחנו מנסים לשלוט בו, ומה failure mode שנוצר בגלל הבחירה הזאת**.

---

# ‏Checkpoint — סוף חלק 4B

‏יצרנו שכבת Decision אחידה ל־`PASSIVE_JOIN` מול `PASSIVE_POST_ONLY`, ול־`Hidden` מול `Reserve/Iceberg` מול `DISCRETIONARY_LIMIT`. נוסף Arrival-Race example שמראה מדוע passive-at-decision אינה passive-at-arrival, ונקבעה taxonomy ברורה: Post Only שולטת ב־liquidity-taking, Hidden ב־displayed footprint, Reserve בכמות המוצגת, ו־Discretionary בטווח מחיר הביצוע הנסתר. כל attribute נשאר כפוף ל־Capability evidence, ‏TTL, ‏fresh decision ו־reconciliation.