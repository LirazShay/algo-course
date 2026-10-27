# ‏חלק 5A — Dynamic Pricing Decision Guide: ‏`Relative`, ‏`MidPrice`, ‏Directed `Pegged-to-Midpoint` ו־`Snap Midpoint`

> ‏הפרק הזה הוא שכבת Decision מעל Part 5. הוא אינו מוסיף Order Types חדשים; הוא עונה על השאלה המקצועית: **כאשר כמה Candidates גוזרות מחיר מהשוק, מי מנהל את שינוי המחיר, האם השינוי חד־פעמי או מתמשך, ומה קורה כשה־Signal המקומי משתנה לפני שה־Order מסתיימת?**

---

## ‏5A.1 ארבע Candidates — ארבעה מודלי שליטה שונים

```text
RELATIVE_PRIMARY
MIDPRICE
PEGGED_MIDPOINT_DIRECT
SNAP_MIDPOINT
```

‏כולן יכולות להיראות כמו "מחיר חכם שקשור ל־NBBO", אבל הן שונות לפחות בצירים הבאים:

```text
reference source
continuous vs one-shot repricing
routing ownership
broker/venue delegation
local determinism
auto-chase risk
stale-price risk
```

> ‏`ENGINE RULE` — Dynamic pricing family אינה enum אחת. ‏Behavior Candidate, ‏Broker primitive/algo ו־Routing Policy נשארים dimensions נפרדים.

---

## ‏5A.2 Comparison Matrix — מי מחזיק את המחיר

| Candidate | Reference עיקרי | מחיר משתנה אחרי submit? | מי מנהל שינוי | Routing | הסיכון המרכזי |
|---|---|---:|---|---|---|
| `RELATIVE_PRIMARY` | same-side NBBO + offset | כן | Broker/Venue לפי semantics | SMART או Directed לפי plan/capability | auto-reprice שאינו יודע שה־Signal מת |
| `MIDPRICE` | midpoint-or-better logic | כן, broker-managed | IBKR Broker Algo | SMART | פחות determinism לגבי path/destination |
| `PEGGED_MIDPOINT_DIRECT` | midpoint | כן | Venue/Broker path | Directed | destination dependence + no-fill |
| `SNAP_MIDPOINT` | midpoint בזמן submit | **לא** | Broker מחשב פעם אחת; אחר כך Limit קבועה | לפי capability/concrete plan | fixed price נהיית stale |

‏הבדל הזיכרון החשוב:

```text
Relative            = follow same-side reference
MidPrice            = broker-managed SMART midpoint search
Pegged Midpoint     = continuously follow midpoint on explicit destination path
Snap Midpoint       = sample midpoint once, then stop following
```

---

## ‏5A.3 `RELATIVE_PRIMARY` — Decision Card

### ‏What

‏Dynamic pricing behavior שמצמידה את המחיר ל־same-side best quote בתוספת/הפחתת offset, לפי route semantics, עד `Economic Price Bound`.

### ‏Why

‏כדי להישאר תחרותיים בלי client-side cancel/replace בכל שינוי Quote.

### ‏When

```text
passive / price-improving intent remains valid
quote is moving enough that static join becomes stale quickly
signal life is long enough to justify continuous repricing
Economic Price Bound is explicit
route-specific semantics are validated
```

### ‏Why Not

‏Broker/Venue יודעים שה־quote זזה; הם אינם יודעים שה־private Signal שלנו נחלשה. ב־SMART קיימת גם asymmetry מתועדת שיכולה להשאיר BUY במחיר גבוה יותר לאחר נסיגה ב־Bid.

### ‏Closest Alternative

`PASSIVE_JOIN` כאשר רוצים מחיר סטטי ושליטה מקומית פשוטה יותר; `SNAP_MIDPOINT` כאשר רוצים market-derived initial price בלי continual repricing.

### ‏Main Failure Mode

```text
reference rises
→ effective price rises
→ signal deteriorates locally
→ broker-managed order remains economically executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.4 `MIDPRICE` — Decision Card

### ‏What

‏`IBKR` Broker Algo שמחפש midpoint-or-better execution באמצעות SMART routing ויכול לבחור execution path פנימי בהתאם למצב השוק והיעדים הזמינים.

### ‏Why

‏כדי להאציל לברוקר גם midpoint execution search וגם חלק מה־routing logic, במקום שה־client יבחר destination ומנגנון peg בעצמו.

### ‏When

```text
spread is economically meaningful
signal still has useful life
midpoint price improvement is valuable
manual direct-routing logic is undesirable
broker-managed path is acceptable
```

### ‏Why Not

‏ה־path פחות deterministic מבחינת המחקר המקומי, ו־midpoint fill probability עלולה להיות נמוכה בדיוק בזמן Momentum חזק.

### ‏Closest Alternative

`PEGGED_MIDPOINT_DIRECT` אם רוצים midpoint peg עם destination מפורש; `SNAP_MIDPOINT` אם רוצים מחיר midpoint-derived קבוע לאחר submit.

### ‏Main Failure Mode

```text
broker algo remains valid by broker constraints
but signal half-life expires locally
or midpoint no-fill causes missed move
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.5 `PEGGED_MIDPOINT_DIRECT` — Decision Card

### ‏What

‏Continuous midpoint peg במסלול Directed התומך בכך, עם destination semantics מפורשים ו־Limit/`Economic Price Bound` מתאים.

### ‏Why

‏כדי לקבל midpoint repricing מתמשך תוך שליטה גבוהה יותר ב־destination לעומת Broker Algo מסוג `MidPrice`.

### ‏When

```text
midpoint execution is desired
explicit destination behavior matters
route capability is validated
destination-specific telemetry is available
signal can tolerate potential no-fill
```

### ‏Why Not

‏Direct routing מגדיל operational responsibility; destination מסוים יכול להיות פחות מתאים מ־SMART aggregate search, וה־Order עדיין יכולה להישאר ללא Fill בזמן שהשוק בורח.

### ‏Closest Alternative

`MIDPRICE` כאשר רוצים להעביר בחירת destination ל־IBKR SMART; `SNAP_MIDPOINT` כאשר continual midpoint following אינו רצוי.

### ‏Main Failure Mode

```text
midpoint keeps moving
order follows legally within bound
but chosen destination provides poor/no contra liquidity
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.6 `SNAP_MIDPOINT` — Decision Card

### ‏What

‏Broker computes a Limit from midpoint at submit time; לאחר החישוב המחיר נשאר קבוע ואינו ממשיך לעקוב אחרי midpoint.

### ‏Why

‏כדי לקבל market-derived initial price בלי continual broker-managed chase.

### ‏When

```text
midpoint is a useful reference now
we want deterministic fixed price after submit
continuous repricing is undesirable
short local application_order_ttl is enforceable
```

### ‏Why Not

‏המחיר שקפא יכול להפוך stale במהירות. עצירת chase אינה מבטלת stale-fill risk.

### ‏Closest Alternative

`PEGGED_MIDPOINT_DIRECT` כאשר רוצים להמשיך לעקוב אחרי midpoint; static client-calculated Limit כאשר איננו צריכים Broker-side one-shot calculation.

### ‏Main Failure Mode

```text
snap price calculated at t0
market changes materially
signal weakens
old fixed limit remains executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏5A.7 Timeline — אותו Quote, ארבע התנהגויות שונות

‏נשתמש בדוגמה רעיונית ל־BUY. המספרים נועדו להמחיש ownership/lifecycle, לא לשחזר כל route-specific pricing rule של Broker.

### ‏Policy בתחילת הדוגמה

```text
Economic Price Bound = 50.05
Relative offset      = +0.01 from same-side bid
Snap offset          = 0 from midpoint
```

### ‏Market Timeline

| זמן | Bid | Ask | Mid |
|---|---:|---:|---:|
| `t0` | 50.00 | 50.04 | 50.02 |
| `t1` | 50.01 | 50.05 | 50.03 |
| `t2` | 50.03 | 50.05 | 50.04 |
| `t3` | 49.99 | 50.03 | 50.01 |

### ‏`RELATIVE_PRIMARY`

‏ב־`t0` היא יכולה להתחיל סביב same-side reference + offset.

‏כאשר Bid עולה ב־`t1`/`t2`, effective price יכולה לעלות בהתאם עד ה־bound ובהתאם ל־route semantics.

‏ב־`t3`, אסור למנוע להניח שהמחיר בהכרח ירד חזרה עם Bid; ב־SMART Relative קיימת asymmetry route-specific שנלמדה ב־Part 5.

‏המסקנה:

```text
continuous reference following
+
route-specific directionality
```

### ‏`MIDPRICE`

‏בכל אחד מהמצבים IBKR מנהלת midpoint-oriented execution search דרך SMART.

‏המנוע המקומי אינו אומר:

```text
set exact order price = current midpoint
```

‏אלא:

```text
use broker-managed midpoint behavior
within our constraints
```

‏לכן `t0 → t3` הוא רצף שבו ה־Broker Algo יכולה לבחור paths שונים; telemetry חייבת למדוד outcome בפועל.

### ‏`PEGGED_MIDPOINT_DIRECT`

‏ה־effective reference משתנה יחד עם midpoint:

```text
t0 mid = 50.02
t1 mid = 50.03
t2 mid = 50.04
t3 mid = 50.01
```

‏ה־Order ממשיכה לעקוב אחרי midpoint לפי destination semantics כל עוד היא Working וה־bound מאפשר.

‏המסקנה:

```text
continuous midpoint repricing
+
explicit destination ownership
```

### ‏`SNAP_MIDPOINT`

‏ב־`t0` ה־Broker מחשב מחיר התחלתי מתוך midpoint:

```text
snap_fixed_price ≈ 50.02
```

‏לאחר מכן:

```text
t1 -> remains fixed
t2 -> remains fixed
t3 -> remains fixed
```

‏עד Modify/Cancel/terminal event.

‏המסקנה:

```text
market-derived at creation
!=
market-following after creation
```

---

## ‏5A.8 מה ה־timeline מלמד

‏אם ה־שוק עולה מ־`t0` ל־`t2`:

- ‏`Relative` ו־`Pegged Midpoint` יכולות להמשיך לנוע.
- ‏`MidPrice` ממשיכה Broker-managed midpoint search.
- ‏`Snap Midpoint` נשארת מאחור במחיר שחושב ב־`t0`.

‏אם השוק נופל ב־`t3`:

- ‏Directed midpoint peg יכולה לנוע בהתאם ל־destination semantics.
- ‏SMART Relative אינה בהכרח סימטרית כלפי מטה ב־BUY.
- ‏MidPrice נשארת Broker-managed ולכן צריך למדוד את ההתנהגות בפועל.
- ‏Snap נשארת בדיוק במחיר הקבוע שלה ועלולה להפוך stale/aggressive יחסית לשוק החדש.

‏כלומר אין “dynamic order” אחת. יש ownership models שונים לחלוטין.

---

## ‏5A.9 Direct Elimination Questions

```text
Do we need the order price to remain fixed after submit?
YES -> eliminate continuous pegs; SNAP_MIDPOINT may survive

Do we need continual same-side quote following rather than midpoint?
YES -> RELATIVE_PRIMARY may survive

Do we need midpoint behavior with broker-selected destinations?
YES -> MIDPRICE may survive

Do we need explicit directed midpoint semantics?
YES -> PEGGED_MIDPOINT_DIRECT may survive

Is the signal too short to tolerate midpoint no-fill / delegated repricing?
YES -> eliminate midpoint/managed candidates and return to broader execution decision

Is Economic Price Bound stale or unknown?
YES -> eliminate all candidates that could continue repricing
```

> ‏`ENGINE RULE` — Routing preference אינה סיבה מספקת לבחור Candidate. קודם intent/lifecycle fit, אחר כך capability/routing fit.

---

## ‏5A.10 Continuous Repricing מול One-Shot Price Derivation

‏זה ה־decision split החשוב ביותר במשפחה:

```text
CONTINUOUS:
RELATIVE_PRIMARY
MIDPRICE
PEGGED_MIDPOINT_DIRECT

ONE_SHOT:
SNAP_MIDPOINT
```

‏ב־Continuous family הסיכון הוא:

```text
auto-chase / externally managed price survives local signal decay
```

‏ב־One-Shot family הסיכון הוא:

```text
fixed price becomes stale while still executable
```

‏לכן לשתיהן נדרש `application_order_ttl`, אבל מסיבות שונות.

---

## ‏5A.11 Broker-managed versus Client-managed Control

‏ה־client תמיד שומר ownership על:

```text
signal validity
Economic Price Bound
application_order_ttl
position / exposure rules
cancel decision
```

‏הוא יכול להאציל:

```text
price reference following
route selection
midpoint search
one-shot price derivation
```

‏אבל delegated pricing אינה delegated strategy.

> ‏`ENGINE RULE` — Broker knows market mechanics; Broker does not know private signal decay.

---

## ‏5A.12 Pairwise Decision — `MIDPRICE` מול `PEGGED_MIDPOINT_DIRECT`

### ‏בחר `MIDPRICE` למחקר כאשר

```text
we want SMART broker-managed midpoint search
we do not want to own destination selection
some path nondeterminism is acceptable
```

### ‏בחר `PEGGED_MIDPOINT_DIRECT` למחקר כאשר

```text
we want explicit destination semantics
we want route-level attribution
we accept more operational responsibility
```

### ‏אל תכריע לפי

```text
which name sounds more advanced
```

‏הכרעה דורשת evidence של:

```text
useful_fill_rate
price_improvement
missed_move
post_fill_markout
venue/destination behavior
```

---

## ‏5A.13 Pairwise Decision — `SNAP_MIDPOINT` מול continuous midpoint

### ‏`SNAP_MIDPOINT`

‏מתאימה יותר כאשר:

```text
we trust the current midpoint reference
we do not want automatic chase
we prefer fixed-price lifecycle after submit
```

### ‏Continuous midpoint behavior

‏מתאימה יותר כאשר:

```text
midpoint is expected to move while intent remains valid
we want the order to remain aligned without client modify loop
```

‏השאלה היא לא רק Fill probability; היא גם:

```text
what type of stale state are we willing to own?
```

---

## ‏5A.14 Pairwise Decision — `RELATIVE_PRIMARY` מול midpoint family

‏`RELATIVE_PRIMARY` עוקבת אחרי **same-side quote**; midpoint family מתמקדת ב־**inside-spread midpoint**.

‏לכן:

```text
Need to stay competitive on our side of book?
→ Relative

Need to seek contra liquidity around midpoint?
→ Midpoint family
```

‏אלה אינם שני implementations של אותו intent; לעיתים הם מבטאים liquidity posture שונה לחלוטין.

---

## ‏5A.15 Counterexample — “Midpoint תמיד חוסך חצי Spread”

‏נניח:

```text
spread = 4 cents
midpoint fill saves 2 cents
```

‏אבל אם midpoint no-fill גורם לפספוס מהלך של 12 cents, או אם Fill מגיעה בדיוק לפני adverse move של 5 cents, “חצי Spread שנחסך” אינו ה־outcome הכלכלי האמיתי.

‏לכן:

```text
price_improvement
+
fill probability
+
missed move
+
post-fill markout
```

‏נמדדים יחד.

---

## ‏5A.16 Counterexample — “Snap בטוחה יותר כי היא לא רודפת”

‏נניח שה־Snap נקבעה ב־50.02.

‏אחרי 400ms:

```text
Bid = 49.98
Ask = 50.00
signal = weakened
```

‏Limit קבועה ב־50.02 יכולה להיות אגרסיבית מדי יחסית ל־market state החדש.

‏כלומר:

```text
no auto-chase
!=
no stale-price risk
```

---

## ‏5A.17 Counterexample — “Pegged עדיפה כי היא חוסכת cancel/replace”

‏פחות client-side messages יכולים להיות יתרון תפעולי, אך אינם objective function.

‏Peg יכולה לבצע יותר reprices ועדיין להפיק:

```text
worse markout
higher price concession
more stale-signal fills
```

‏ולכן נמדוד outcome, לא רק message count.

---

## ‏5A.18 Decision Example — Spread רחב, Signal עדיין חי

‏נניח:

```text
spread = 6 cents
remaining_signal_life = 2.5s
missed-move cost = moderate
midpoint savings = economically material
Economic Price Bound = valid
```

‏Survivors אפשריים:

```text
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏השאלות המכריעות:

```text
Need fixed price after submit?
→ SNAP_MIDPOINT

Need SMART broker-managed venue search?
→ MIDPRICE

Need explicit destination midpoint semantics?
→ PEGGED_MIDPOINT_DIRECT
```

‏`RELATIVE_PRIMARY` יכולה להישאר Candidate רק אם same-side quote following תואם את liquidity intent; היא אינה midpoint substitute.

---

## ‏5A.19 Decision Example — Quote זזה מהר, Passive intent נשמר

‏נניח:

```text
passive/price-improving intent = required
same-side quote migrates frequently
client cancel/replace churn = costly
midpoint liquidity is not the desired posture
```

‏אז `RELATIVE_PRIMARY` היא Challenger טבעית מול `PASSIVE_JOIN`/client-managed repricing.

‏השאלה המחקרית:

```text
Does broker-managed same-side repricing improve net execution outcome
without producing stale-signal fills or excessive price concession?
```

---

## ‏5A.20 Partial Fill ו־Repricing

‏Partial Fill בכל אחת מהמשפחות יוצרת Decision State חדשה.

‏אסור להניח:

```text
remaining_qty should continue under original dynamic pricing rule automatically
```

‏לאחר Fill נעדכן:

```text
reconciled_position
remaining_qty
protection responsibility
remaining signal life
Economic Price Bound
exit feasibility
```

‏ורק אז נחליט אם remainder נשארת, מתבטלת או עוברת Candidate אחרת.

---

## ‏5A.21 Metrics להשוואה הוגנת

```text
useful_fill_rate
time_to_first_fill
time_to_useful_fill
price_improvement_vs_near_side
price_improvement_vs_midpoint
reprice_count
reprice_up_count
reprice_down_count
price_level_count
cancel_replace_count
missed_move_if_no_fill
stale_signal_fill_rate
stale_fixed_price_incidents
bound_hit_rate
post_fill_markout_100ms
post_fill_markout_500ms
post_fill_markout_1s
net_edge_after_execution
```

‏ל־`MIDPRICE` ו־Directed midpoint נוסיף route/destination attribution; ל־`SNAP_MIDPOINT` נשמור `snap_reference` ו־`snap_fixed_price`.

---

## ‏5A.22 Decision Record מומלץ

```text
DynamicPricingDecision {
  snapshot_id
  signal_remaining_life_ms
  liquidity_intent
  reference_type
  economic_price_bound
  requires_continuous_reprice
  routing_requirement
  survivors[]
  eliminated[] { candidate, reason_code }
  selected_candidate
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך Replay יכול להסביר לא רק איזו Candidate נבחרה, אלא **איזה ownership model של price movement נבחר**.

---

## ‏5A.23 Acceptance Tests

```text
1. SNAP_MIDPOINT never silently becomes a continuous peg after initial price derivation.
2. Continuous dynamic-pricing candidate is invalidated when Economic Price Bound becomes stale or violated.
3. MIDPRICE remains classified as Broker Algo + Behavior Candidate, not directed peg.
4. PEGGED_MIDPOINT_DIRECT always carries an explicit directed-routing requirement in the plan.
5. RELATIVE_PRIMARY remains distinct from midpoint-seeking candidates.
6. SMART Relative is never assumed to reprice symmetrically in both directions.
7. Signal invalidation triggers fresh cancel/reconcile decision for every still-working dynamic-pricing order.
8. Partial fill creates a fresh decision before remainder policy continues.
9. Price-improvement metric alone cannot determine research winner.
10. Same snapshot + same policy yields the same survivor set and selected candidate.
```

---

## ‏5A.24 Practitioner Insight

> ‏`ENGINE RULE` — השאלה החשובה ביותר ב־dynamic pricing אינה “מה המחיר עכשיו?”, אלא **מי רשאי לשנות אותו לאחר submit, לפי איזה reference, ולכמה זמן ההרשאה הזו נשארת חוקית מבחינת ה־Signal שלנו**.

‏הדרך לזכור את המשפחה:

```text
Relative        = follow our side
MidPrice        = delegate midpoint search to SMART broker algo
Pegged Midpoint = continuously follow midpoint on directed path
Snap Midpoint   = derive midpoint price once, then freeze
```

---

# ‏Checkpoint — סוף חלק 5A

‏יצרנו שכבת Decision אחידה ל־`RELATIVE_PRIMARY`, ‏`MIDPRICE`, ‏`PEGGED_MIDPOINT_DIRECT` ו־`SNAP_MIDPOINT`. לכל Candidate יש `What / Why / When / Why Not / Closest Alternative / Main Failure Mode / For Our Engine`, ונוסף timeline שמראה כיצד אותה סדרת Quotes מייצרת lifecycle שונה לחלוטין לפי ownership של repricing. העיקרון הקנוני נשאר: delegated pricing אינה delegated strategy; ה־client עדיין מחזיק Signal validity, ‏`Economic Price Bound`, ‏TTL, exposure ו־cancel authority.