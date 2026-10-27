# ‏חלק 2B — Aggressive Execution Decision Guide: ‏`IOC`, ‏Sweep, ‏Adaptive ו־`MTL`

> ‏הפרק הזה הוא שכבת Decision מעל Parts 2 ו־2A. הוא אינו מוסיף Order Types חדשים; הוא משווה ארבע דרכים שונות לפתור בעיית urgency תחת מגבלות מחיר, זמן ו־state.
>
> ‏העיקרון: לא שואלים "איזו פקודה הכי מהירה?" אלא **איזו Candidate מבטאת נכון את ה־Intent הנוכחי, ומה קורה ל־remainder ול־control אחרי submit**.

---

## ‏2B.1 ארבע Candidates שנראות דומות — אבל אינן פותרות אותה בעיה

```text
MARKETABLE_LIMIT_IOC
SWEEP_TO_FILL_LIMIT
ADAPTIVE_LIMIT_URGENT
MARKET_TO_LIMIT
```

‏כולן יכולות להיות רלוונטיות כאשר latency ו־missed-move cost חשובים, אבל הן שונות בארבע שאלות:

```text
Who controls the execution path?
How long may the order remain executable?
What happens to unfilled remainder?
How deterministic are the semantics from the local engine's point of view?
```

---

## ‏2B.2 Comparison Matrix

| Candidate | Control owner | Immediate attempt | Remainder semantics | Bound | תפקיד אצלנו |
|---|---|---:|---|---|---|
| `MARKETABLE_LIMIT_IOC` | Client decides price + IOC | כן | unfilled remainder canceled | `Economic Price Bound` via Limit | `CORE_BASELINE` |
| `SWEEP_TO_FILL_LIMIT` | Client bound + broker/router sweep | כן, sweep-oriented | לפי TIF/concrete plan | `Economic Price Bound` via Limit | `RESEARCH_CHALLENGER` |
| `ADAPTIVE_LIMIT_URGENT` | Broker Algo manages execution tactics | broker-managed urgent | broker-managed until terminal/cancel/TTL | explicit Limit/bound policy | `RESEARCH_CHALLENGER` |
| `MARKET_TO_LIMIT` | Broker executes transformation lifecycle | market-style initial phase | partial remainder becomes resting Limit | remainder price derives from initial fill semantics | `RESEARCH_CHALLENGER / SPECIALIST` |

> ‏`ENGINE RULE` — ארבעתן אינן values של אותו Broker enum. זו שכבת `Behavior Candidate`/execution family להשוואת החלטה.

---

## ‏2B.3 `MARKETABLE_LIMIT_IOC` — Decision Card

### ‏What

```text
LMT priced marketable
+
IOC
```

‏ניסיון לקחת liquidity זמינה עכשיו, עד `Economic Price Bound`, בלי להשאיר remainder נחה.

### ‏Why

‏כדי לקבל semantics מקומית פשוטה:

```text
try now
accept allowed fills
kill remainder
re-decide
```

### ‏When

‏מתאימה במיוחד כאשר:

```text
remaining signal life is very short
stale remainder is unacceptable
Economic Price Bound is known
partial/no-fill is acceptable
fresh re-decision is cheap
```

### ‏Why Not

‏היא עלולה להחזיר `NO_FILL` או Partial Fill בדיוק לפני שנזילות חדשה מגיעה. היא גם אינה מנצלת broker-managed scheduling מעבר לניסיון המיידי.

### ‏Closest Alternative

`SWEEP_TO_FILL_LIMIT` כאשר רוצים intent אגרסיבי מפורש יותר מול liquidity במספר levels/destinations.

### ‏Main Failure Mode

```text
zero/partial fill
→ signal still alive
→ naive code blindly retries
→ hidden chase / duplicate exposure
```

### ‏For Our Engine

```text
CORE_BASELINE
```

‏היתרון המרכזי הוא לא superiority, אלא simplicity של lifecycle ו־telemetry.

---

## ‏2B.4 `SWEEP_TO_FILL_LIMIT` — Decision Card

### ‏What

‏`LMT` עם sweep behavior במסלול התומך, שנועדה לצרוך במהירות liquidity זמינה על פני successive levels/destinations עד ה־Limit.

### ‏Why

‏כאשר הכמות גדולה מה־top-of-book או liquidity מפוזרת, sweep מפורש יכול להתאים יותר מניסיון אגרסיבי פשוט ברמה אחת.

### ‏When

```text
urgency is high
size is meaningful relative to top-of-book
visible/executable liquidity exists within Economic Price Bound
multi-level / multi-destination access is useful
capability is validated
```

### ‏Why Not

‏Order קטנה מאוד עשויה לא להרוויח מספיק מהמורכבות. בנוסף execution telemetry, venue effects ו־depth consumption נעשים מורכבים יותר.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` כאשר רוצים ניסיון מיידי פשוט יותר עם remainder חד־משמעית.

### ‏Main Failure Mode

```text
sweep consumes several levels
average fill remains inside bound
but execution cost destroys remaining edge
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

---

## ‏2B.5 `ADAPTIVE_LIMIT_URGENT` — Decision Card

### ‏What

‏Behavior Candidate שמשתמשת ב־Broker Algo כדי לנהל חלק מה־execution tactics תחת Limit/constraints שהוגדרו מראש.

### ‏Why

‏כדי להאציל לברוקר את שאלת timing/aggressiveness הטקטית במקום לבצע client-side chase בכל שינוי Quote.

### ‏When

```text
signal still has enough life for broker-managed tactics
immediate-or-cancel is too rigid
client still owns Economic Price Bound and local TTL
broker capability is production-eligible
```

### ‏Why Not

‏ה־Broker אינה יודעת את private Signal half-life שלנו, opportunity supersession או local risk context אלא אם ביטלנו/שינינו את Order בעצמנו.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` כאשר local engine רוצה ניסיון קצר ודטרמיניסטי יותר; `SWEEP_TO_FILL_LIMIT` כאשר המטרה המפורשת היא immediate available liquidity sweep.

### ‏Main Failure Mode

```text
broker-managed order remains economically legal by broker terms
while local signal has already decayed
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER
```

> ‏`ENGINE RULE` — Broker Algo מנהלת `HOW`; ה־client עדיין אחראי ל־`WHETHER` ה־Intent חי.

---

## ‏2B.6 `MARKET_TO_LIMIT` — Decision Card

### ‏What

‏Transforming Order: מתחילה market-style; אם יש Partial Fill, remainder יכולה להפוך ל־Limit במחיר ה־execution הראשוני לפי broker semantics.

### ‏Why

‏כדי להתחיל בניסיון execution מהיר ואז לעצור את ה־remainder מלרדוף אחרי שוק מתרחק.

### ‏When

```text
initial urgency is useful
resting remainder after first fill is acceptable
application can observe/reconcile transformation
signal life is long enough for remainder management
```

### ‏Why Not

‏ל־Signal קצר היא עלולה ליצור בדיוק את מה שאיננו רוצים: remainder נחה לאחר שה־state השתנה.

### ‏Closest Alternative

`MARKETABLE_LIMIT_IOC` אם אסור להשאיר remainder; `ADAPTIVE_LIMIT_URGENT` אם רוצים broker-managed execution לאורך זמן בלי transformation rule כזה.

### ‏Main Failure Mode

```text
partial fill
→ remainder transforms to Limit
→ signal expires
→ local engine forgets that transformed remainder is still executable
```

### ‏For Our Engine

```text
RESEARCH_CHALLENGER / SPECIALIST
```

---

## ‏2B.7 אותו Signal — שלושה תרחישים שונים

‏נניח שבכל שלושת המקרים Strategy כבר עברה 10A, הכיוון זהה וה־`Economic Price Bound` זהה. ההבדל הוא רק state הביצוע.

### ‏Scenario A — `remaining_signal_life = 300ms`

```text
small order
fresh quote
stale remainder unacceptable
```

‏Survivor טבעי למחקר:

```text
MARKETABLE_LIMIT_IOC
```

‏למה:

```text
very short life
immediate attempt
remainder dies instead of resting
```

‏למה האחרות נחלשות:

- ‏`Adaptive Urgent` עלולה לקבל מעט מדי זמן כדי שה־delegated behavior יוסיף ערך.
- ‏Sweep עשויה להיות unnecessary אם הכמות קטנה ביחס לנזילות.
- ‏MTL עלולה ליצור remainder resting כשה־Signal כבר פגה.

---

## ‏2B.8 Scenario B — `remaining_signal_life = 2s`

```text
moderate size
market remains healthy
client can enforce local TTL
```

‏Survivors למחקר יכולים להיות:

```text
MARKETABLE_LIMIT_IOC
ADAPTIVE_LIMIT_URGENT
```

‏כאן השאלה אינה "מי יותר מתקדמת", אלא:

```text
Does broker-managed execution improve useful-fill rate / price
within the same signal lifetime and Economic Price Bound?
```

‏אם לא — complexity אינה מוצדקת.

---

## ‏2B.9 Scenario C — `order_size > top_of_book_depth`

```text
significant visible depth exists across multiple levels
all relevant levels remain inside Economic Price Bound
urgency is high
```

‏כאן `SWEEP_TO_FILL_LIMIT` יכולה לשרוד כ־Challenger משמעותית לצד `MARKETABLE_LIMIT_IOC` ו־`Adaptive Urgent`.

‏ה־Decision Questions:

```text
How much quantity is executable now within bound?
How fragmented is that liquidity?
What is the expected VWAP within bound?
What is the cost of no-fill / partial fill?
How much control do we want to delegate?
```

---

## ‏2B.10 Scenario D — initial fill useful, remainder may rest briefly

‏אם ה־Intent אומר:

```text
get an initial position quickly
but do not chase the remainder upward after first fill
```

‏`MARKET_TO_LIMIT` הופכת conceptually relevant.

‏אבל רק אם:

```text
transformed remainder is observable
application_order_ttl exists
partial fill creates fresh decision
position/protection is updated immediately
```

---

## ‏2B.11 Direct Elimination Questions

‏לפני ranking, נבטל Candidates שלא מתאימות:

```text
Must remainder disappear immediately?
YES -> eliminate MTL; usually eliminate non-IOC working paths

Is order tiny relative to executable top-of-book liquidity?
YES -> Sweep may add little value

Is remaining signal life too short for delegated tactics?
YES -> eliminate Adaptive

Can a transformed resting remainder be managed safely?
NO -> eliminate MTL

Is Economic Price Bound unknown or stale?
YES -> eliminate all bounded aggressive entry candidates; return to 10A
```

> ‏`ENGINE RULE` — קודם `filter survivors`, אחר כך compare/rank. Candidate חזקה בממד אחד אינה מפצה על violation של Gate.

---

## ‏2B.12 `Fallback` אינה Ladder קבועה

‏אסור לקודד:

```text
IOC failed
→ Sweep
→ Adaptive
→ Market
```

‏זה hidden escalation.

‏ה־flow הקנוני:

```text
outcome/failure fact
→ update state
→ fresh 10A gates
→ rebuild survivors
→ choose again
```

‏ייתכן שה־Decision החדשה תהיה:

```text
same candidate
another candidate
smaller size
NO_TRADE
DEFER
```

---

## ‏2B.13 Partial Fill משנה את הבעיה

‏בכל ארבע המשפחות:

```text
partial fill
!=
continue original intent mechanically
```

‏לאחר Partial Fill יש עכשיו:

```text
new reconciled position
new remaining quantity
new protection responsibility
new capital/exposure state
less remaining signal life
possibly different exit feasibility
```

‏לכן remainder עוברת fresh Decision.

‏ב־MTL יש בנוסף lifecycle transformation של remainder; ב־IOC ה־remainder אינה אמורה להישאר working; ב־Sweep/Adaptive צריך לבדוק concrete broker state.

---

## ‏2B.14 Counterexample — “Adaptive היא תמיד טובה יותר כי היא חכמה יותר”

‏נניח:

```text
signal life at decision = 250ms
order qty = small
top-of-book depth = sufficient
Economic Price Bound = tight
```

‏אם `MARKETABLE_LIMIT_IOC` יכולה לבצע את הניסיון כולו מיד ולסיים remainder, delegated sophistication יכולה להיות חסרת ערך ואף להגדיל state/lifecycle complexity.

‏כלומר:

```text
more sophisticated order
!=
better fit
```

---

## ‏2B.15 Counterexample — “Sweep עדיפה כי היא מוצאת יותר liquidity”

‏נניח שה־Sweep מצליחה למלא 100% אך צורכת כמה levels עד ה־bound, בעוד IOC מילאה רק 60% במחיר טוב יותר.

‏אין מנצחת בלי למדוד:

```text
opportunity-level net edge
post-fill markout
unfilled opportunity cost
exit feasibility
```

‏Fill Rate לבדה אינה objective function.

---

## ‏2B.16 Counterexample — “MTL פותרת slippage”

‏MTL אינה מבטיחה מחיר טוב; היא משנה את ה־lifecycle של remainder לאחר fill ראשוני.

‏אם ה־fill הראשון עצמו יקר או adverse, remainder שנחה במחיר הזה אינה מתקנת את הבעיה.

---

## ‏2B.17 Metrics להשוואה הוגנת

```text
useful_fill_rate
fill_ratio
zero_fill_rate
time_to_first_fill
time_to_useful_fill
avg_fill_price
worst_fill_price
decision_slippage
arrival_slippage
visible_depth_consumed
post_fill_markout
missed_move_if_unfilled
stale_remainder_incidents
cancel_latency
reconciliation_incidents
net_edge_after_execution
```

‏ל־MTL נוסיף transformation metrics; ל־Sweep venue/level metrics; ל־Adaptive broker-algo lifecycle metrics.

---

## ‏2B.18 Decision Record מומלץ

```text
AggressiveExecutionDecision {
  snapshot_id
  signal_remaining_life_ms
  requested_qty
  visible_qty_within_bound
  expected_vwap_within_bound
  economic_price_bound
  survivors[]
  eliminated[] { candidate, reason_code }
  selected_candidate
  closest_alternative
  decision_reason
  application_order_ttl
  failure_destination
}
```

‏כך אפשר לבצע Replay ולהסביר למה Candidate מסוימת נבחרה בלי להסתמך על intuition בדיעבד.

---

## ‏2B.19 Acceptance Tests

```text
1. Candidate with stale/unknown Economic Price Bound is eliminated.
2. MARKETABLE_LIMIT_IOC never leaves intended remainder working after IOC terminal semantics.
3. Adaptive capability failure triggers fresh decision, not automatic escalation.
4. Sweep is not selected solely because order size exceeds top-of-book; depth must be useful within bound.
5. MTL is eliminated when resting transformed remainder is forbidden by policy.
6. Partial fill always creates a fresh decision state.
7. More aggressive fallback never occurs without fresh economics.
8. Same snapshot + same policy yields the same survivor set and selected candidate.
9. Fill Rate alone cannot determine winner in research evaluation.
10. Candidate lifecycle state (`DISABLED/SHADOW_ONLY/LIVE_ENABLED`) remains separate from broker capability enablement.
```

---

## ‏2B.20 Practitioner Insight

> ‏`ENGINE RULE` — Urgency אינה Order Type.

‏ה־Professional Decision היא לפרק urgency ל־constraints:

```text
How much time remains?
How much quantity must execute now?
How much price concession is economically legal?
May remainder rest?
Who may manage repricing/timing?
What happens after partial fill?
```

‏רק לאחר מכן בוחרים Candidate.

---

# ‏Checkpoint — סוף חלק 2B

‏יצרנו שכבת Decision אחידה ל־`MARKETABLE_LIMIT_IOC`, ‏`SWEEP_TO_FILL_LIMIT`, ‏`ADAPTIVE_LIMIT_URGENT` ו־`MARKET_TO_LIMIT`. לכל Candidate יש עכשיו `What / Why / When / Why Not / Closest Alternative / Main Failure Mode / For Our Engine`, ונוספו ארבעה scenarios שמראים כיצד אותו Signal יכול להשאיר Survivors שונים לפי signal life, quantity, depth ו־remainder policy.
