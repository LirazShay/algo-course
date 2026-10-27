## ‏10B — Entry Decision: בחירת התנהגות הביצוע בפועל

## ‏10B.1 הקלט של 10B הוא `EntryEnvelope`, לא Signal גולמי

‏10B מתחילה רק אחרי ש־10A כבר קבעה שה־Opportunity כשירה עקרונית ל־Entry. הקלט כולל גבולות שכבר אסור ל־Entry Selector לשבור:

```text
EntryEnvelope {
  permission
  side
  max_qty
  hard_price_boundary
  max_wait_ms
  remaining_signal_life_ms
  partial_fill_policy
  required_protection
  allowed_capabilities
  economic_constraints
  liquidity_constraints
}
```

‏10B אינה רשאית "להתרשם" מחדש ממומנטום ולחרוג מה־cap, מה־size או מה־Risk שהוגדרו ב־10A.

---

## ‏10B.2 הפלט הוא `EntryPlan`, לא Broker Order אחת

‏נרצה Output ברמה סמנטית:

```text
EntryPlan {
  behavior
  quantity
  price_policy
  liquidity_intent
  routing_policy
  broker_algo_policy
  tif_policy
  application_ttl_ms
  partial_fill_policy
  escalation_policy
  cancel_conditions
  protection_policy
  selection_reason
}
```

‏רק Adapter מאוחר יותר מתרגם את ה־Plan לשדות הספציפיים של IBKR.

---

## ‏10B.3 Candidate Set ראשוני

‏ל־core research שלנו רשימת behaviors אפשרית יכולה להיות:

```text
PASSIVE_JOIN
PASSIVE_POST_ONLY
IMPROVE_ONE_TICK
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
MARKETABLE_LIMIT_IOC
```

‏זו אינה רשימת העדפה. זו רשימת כלים שכל אחד פותר trade-off אחר.

---

## ‏10B.4 10B גם היא Elimination-first

‏לא נחשב:

```text
PASSIVE = 74 points
MIDPRICE = 81 points
IOC = 83 points
=> IOC
```

‏קודם נסיר behaviors שאינם מתאימים ל־Context.

‏לדוגמה:

```text
remaining life too short
=> remove long-wait candidates

passive-only economics required
=> remove taker candidates

midpoint capability unavailable
=> remove midpoint candidates

hard cap already below current ask
=> remove immediately marketable candidates
```

‏רק לאחר מכן נבחר מבין survivors.

---

## ‏10B.5 שלושת צירי הבחירה המרכזיים

‏כמעט כל Entry behavior ממוקמת על שלושה צירים:

```text
1. PRICE IMPROVEMENT DESIRE
2. FILL URGENCY
3. CONTROL DELEGATION
```

‏לדוגמה:

```text
PASSIVE_JOIN
price improvement = high
urgency = low
control = client

MARKETABLE_LIMIT_IOC
price improvement = low
urgency = very high
control = explicit/client-defined

ADAPTIVE_LIMIT_URGENT
price improvement = medium
urgency = high
control = partially delegated to broker
```

‏הבחירה היא שילוב של הצירים, לא שם הפקודה.

---

## ‏10B.6 `Remaining Signal Life` הוא Budget של זמן

‏נגדיר:

```text
entry_time_budget_ms = min(
    envelope.max_wait_ms,
    envelope.remaining_signal_life_ms - safety_reserve_ms
)
```

‏Behavior שאין לה סיכוי סביר לתת תוצאה בתוך ה־budget יוצאת מה־Candidate Set.

‏לכן אותו `MidPrice` יכול להיות Candidate כאשר נשארו 2 שניות, ולהיעלם כאשר נשארו 120ms.

---

## ‏10B.7 לא כל הזמן שנותר מיועד ל־Entry

‏אם Signal צפויה לחיות 1,000ms, לא בהכרח נכון לתת ל־Entry לחכות 999ms.

‏צריך להשאיר זמן ל־:

```text
fill processing
protection activation
exit observation
cancel/reconciliation
```

‏לכן `safety_reserve_ms` הוא חלק אמיתי מה־Execution Policy.

---

## ‏10B.8 `Expected Time to Fill` הוא Feature מחקרי

‏לכל Behavior נרצה בעתיד model אמפירי:

```text
expected_time_to_first_fill
expected_time_to_useful_fill
probability_of_useful_fill_within_budget
```

‏המודל יילמד לפי:

```text
symbol/activity regime
spread
queue/depth
quote velocity
behavior
route
session
```

‏לא צריך Machine Learning מורכב ביום הראשון; histogram אמין עדיף על ניחוש מתוחכם.

---

## ‏10B.9 Candidate שאינה יכולה לתת `Useful Fill` בזמן — נפסלת

‏השאלה אינה רק:

```text
can it fill anything?
```

‏אלא:

```text
can it plausibly produce at least minimum_useful_fill
within entry_time_budget?
```

‏אם לא, אין טעם לבחור אותה רק מפני שהמחיר התיאורטי יפה.

---

## ‏10B.10 `PASSIVE_JOIN` — ה־baseline הפסיבי הפשוט

‏בקנייה:

```text
join existing best bid
```

‏היא מתאימה כאשר:

```text
there is enough time to wait
spread saving matters
queue is not obviously hopeless
signal is not escaping rapidly
passive markout history is acceptable
```

‏והיא פחות מתאימה כאשר missed-move cost גבוה מאוד.

---

## ‏10B.11 מדיניות ה־"להיצמד למוביל" שלנו הופכת ל־Policy מפורשת

‏העדפה לא ליצור Price Level חדש יכולה להיות מיוצגת כ־:

```text
placement_policy = JOIN_EXISTING_LEVEL
```

‏זו העדפה שנבדוק אמפירית, לא חוק שוק.

‏נשמור גם:

```text
avoid_being_sole_displayed_order = true/false
```

‏אבל אם התנאי הזה פוגע שוב ושוב ב־fill probability או net edge, הנתונים צריכים להיות מסוגלים לערער עליו.

---

## ‏10B.12 להיות לבד ברמה אינו Hard Reject אוטומטי

‏אם best bid נעלמה ורק Order שלנו נשארה, יש כמה אפשרויות:

```text
keep briefly
cancel
move to next existing level
switch behavior
```

‏ההחלטה תלויה ב־Signal וב־economics. עצם העובדה שאנחנו היחידים אינה הוכחה שהמחיר רע.

---

## ‏10B.13 `PASSIVE_POST_ONLY` — כאשר Passive היא Constraint, לא Preference

‏אם ה־Trade כלכלית רק בתנאי שאיננו לוקחים נזילות, Candidate של Post Only מתאימה יותר מ־plain Limit.

‏ה־semantic intent:

```text
add liquidity or do not execute
```

‏היא צריכה להגיע רק כאשר route-specific capability כבר עברה Gate.

---

## ‏10B.14 Plain Passive Limit ו־Post Only אינן אותו דבר

‏Plain Limit שהייתה Passive בזמן ההחלטה יכולה להפוך marketable בזמן arrival.

‏Post Only נועדה לשמור על passive intent לפי semantics של route/venue.

‏לכן כאשר Crossing מקרי יהרוס את economics, Post Only היא Guardrail משמעותי.

---

## ‏10B.15 Post Only נפסלת כאשר Taking Liquidity כבר מוצדקת

‏אם:

```text
missed_move_cost > passive_savings
```

‏אין היגיון לבחור Post Only רק בגלל fee/rebate או מתוך הרגל.

‏Candidate צריכה להיעלם כאשר ה־Intent כבר אינו `PASSIVE_ONLY`.

---

## ‏10B.16 `IMPROVE_ONE_TICK` היא Decision נפרדת

‏שיפור Bid ב־tick אחד אינו maintenance של `PASSIVE_JOIN`.

‏אנחנו קונים Priority במחיר של ויתור על חלק מה־spread.

‏לכן נחשב לפחות:

```text
price_paid_for_priority
estimated_queue_improvement
remaining_edge_after_improvement
```

‏אם ה־tick הנוסף גדול מדי ביחס ל־Edge, Candidate נפסלת.

---

## ‏10B.17 `RELATIVE_PRIMARY` — כאשר רוצים Passive Repricing מתמשך

‏Relative מתאימה כאשר:

```text
we still want to provide liquidity
quote is moving enough that static join becomes stale quickly
client-side cancel/replace churn is undesirable
hard cap is clear
signal has enough life
```

‏היתרון הוא delegation של repricing. הסיכון הוא שה־Broker יכולה להמשיך לבצע את pricing rule גם כשה־Alpha שלנו כבר נחלש.

---

## ‏10B.18 `Relative` דורשת Local Validity Watchdog

‏גם כאשר המחיר מנוהל חיצונית:

```text
signal invalidated
quote stale
remaining edge below floor
hard cap reached
system degraded
```

‏צריכים לגרום ל־cancel/re-evaluation.

‏Broker-managed repricing אינו Broker-managed strategy.

---

## ‏10B.19 SMART Relative מקבלת Guard נוסף

‏כיוון שכבר למדנו שה־SMART semantics שלה אינן בהכרח סימטריות כאשר reference נסוג, Entry Selector צריכה להתייחס ל־deterioration מפורש כ־cancel condition ולא להניח שהפקודה תמיד תחזור אוטומטית למחיר פחות אגרסיבי.

---

## ‏10B.20 משפחת Midpoint היא Trade על זמן מול Spread

‏המשפחה כוללת אצלנו בעיקר:

```text
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏המשותף הוא ניסיון לקבל execution בתוך ה־spread.

‏העלות היא uncertainty ב־fill probability וב־time-to-fill.

---

## ‏10B.21 מתי `MIDPRICE` שורדת את הסינון

‏Candidate טובה כאשר:

```text
spread is economically meaningful
remaining life is not tiny
half-spread saving matters
SMART is acceptable
historical midpoint fill probability is non-trivial
```

‏והיא נפסלת כאשר הזמן שנותר קצר מדי ביחס ל־midpoint fill behavior שנמדד.

---

## ‏10B.22 `SNAP_MIDPOINT` — כשאנחנו רוצים מחיר פתיחה חכם אבל לא Auto-Chase

‏Snap Midpoint מתאימה כאשר:

```text
midpoint-derived initial price is attractive
continuous repricing is undesirable
we can enforce a short TTL
```

‏היתרון הוא determinism גבוה יותר אחרי creation.

‏הסיכון הוא stale fixed price.

---

## ‏10B.23 `PEGGED_MIDPOINT_DIRECT` — כשאנחנו מוכנים לשלם Complexity עבור Control

‏Candidate זו שורדת רק כאשר:

```text
direct destination is validated
venue-specific semantics are accepted
midpoint opportunity is meaningful
remaining life supports waiting
```

‏אם אין hypothesis ל־Venue מסוים, `MIDPRICE` דרך SMART היא בדרך כלל baseline פשוט יותר למחקר.

---

## ‏10B.24 `MidPrice` ו־`Pegged Mid` לא מתחרות תמיד על אותו תפקיד

‏`MIDPRICE` בודקת:

```text
Can IBKR's SMART midpoint-oriented policy find a good fill?
```

‏`PEGGED_MIDPOINT_DIRECT` בודקת:

```text
Can a specific directed midpoint mechanism outperform that delegated search?
```

‏לכן נשווה ביניהן רק בתוך Regimes שבהם שתיהן חוקיות ורלוונטיות.

---

## ‏10B.25 `ADAPTIVE_LIMIT_URGENT` — Delegated Aggressiveness תחת Cap

‏זו Candidate מעניינת כאשר:

```text
we want a better price than immediate crossing if possible
but cannot wait long
we want IBKR to manage some of the search
hard economic cap remains mandatory
```

‏היא אינה תחליף ל־IOC; היא experiment אחר על speed/price trade-off.

---

## ‏10B.26 `ADAPTIVE_LIMIT_NORMAL` — רק אם הזמן באמת מאפשר

‏Normal יכולה לקבל מקום כאשר:

```text
remaining_signal_life is materially larger
spread is worth working
historical no-fill/missed-move cost is acceptable
```

‏אם Signal חי מאות מילישניות בלבד, Candidate יכולה להיפסל מראש בלי לנסות אותה.

---

## ‏10B.27 `Adaptive Patient` אינה Core Candidate כרגע

‏לא מפני שהיא כלי חלש, אלא מפני שה־time horizon הטבעי של סבלנות מוגברת אינו מתאים כברירת מחדל ל־Alpha שחיה שניות.

‏אם מחקר עתידי יראה Regime איטי יותר, אפשר לפתוח אותה מחדש דרך Capability/Research config.

---

## ‏10B.28 `MARKETABLE_LIMIT_IOC` — Candidate של Urgency גבוהה עם גבול כלכלי

‏ה־semantic intent:

```text
execute whatever is available now
within hard price cap
accept allowed partial
leave no stale remainder
```

‏זו Candidate מרכזית כאשר missed-move cost גבוה וה־visible/expected liquidity בתוך cap מספיקה.

---

## ‏10B.29 למה `MARKETABLE_LIMIT_IOC` היא לא תמיד Winner

‏גם אם היא מהירה:

```text
spread may consume too much edge
depth may be thin
quote may move before arrival
partial fill may be too small
```

‏לכן Urgency גבוהה אינה פוטרת אותה מ־economic/depth constraints של ה־Envelope.

---

## ‏10B.30 `Market` רגילה אינה Core Entry Candidate

‏ב־Entry אנחנו בדרך כלל יכולים לבחור `NO TRADE`, ולכן price certainty חשובה מאוד כאשר Edge קטן.

‏לכן baseline שלנו מעדיף אגרסיביות תחומה:

```text
MARKETABLE_LIMIT_IOC
```

‏על פני client-side intent ללא hard price boundary.

‏`Market` נשארת כלי מקצועי חשוב, במיוחד בעולם Exit/Risk, אבל לא Entry default במנוע הזה.

---

## ‏10B.31 `Spread-to-Edge Ratio`

‏מדד שימושי למחקר:

```text
spread_to_edge_ratio = spread_cost / expected_gross_edge
```

‏כאשר היחס גבוה, behaviors שמנסות midpoint/passive improvement מקבלות יותר הצדקה — אם הזמן מאפשר.

‏כאשר היחס נמוך מאוד ו־missed-move cost גבוה, aggressive candidate יכולה להיות הגיונית יותר.

‏זה Feature, לא threshold אוניברסלי.

---

## ‏10B.32 `Qty-to-Depth Ratio`

‏נחשב למשל:

```text
qty_to_visible_cap_depth = requested_qty / visible_qty_within_cap
```

‏Ratio גבוה יכול לגרום ל־:

```text
reduce size
prefer partial IOC
avoid immediate full-size aggression
NO_TRADE
```

‏הוא לא אמור לגרום אוטומטית ל־wider cap.

---

## ‏10B.33 `Quote Velocity` משנה את ערך ה־Passive Wait

‏אם Bid/Ask זזות מהר יותר מה־cancel/replace loop שלנו, Static Passive יכולה להתיישן כמעט מייד.

‏אז אפשר לשקול:

```text
RELATIVE_PRIMARY
broker-managed algo
or
immediate capped execution
```

‏תלוי בכיוון התנועה, spread ו־remaining life.

---

## ‏10B.34 `Fill Probability` אינה Objective יחידה

‏Behavior עם 95% Fill Rate יכולה להיות גרועה אם היא מתמלאת בעיקר לפני adverse move.

‏Behavior עם 50% Fill Rate יכולה להיות טובה יותר אם no-fills חוסכות כניסות רעילות.

‏לכן selection research משווה:

```text
fill probability
×
conditional net outcome
+
no-fill opportunity outcome
```

‏ולא Fill Rate לבד.

---

## ‏10B.35 Pairwise Dominance במקום Master Score

‏אחרי elimination אפשר להשתמש בכלל חזק יותר מציון מעורב:

‏Candidate A `dominates` את B אם, תחת אותו Context, היא אינה גרועה יותר בממדים הקריטיים ומובהקת טוב יותר לפחות באחד:

```text
price boundary
expected net edge
time budget
risk
capability confidence
state complexity
```

‏אם A dominates B, B יוצאת בלי שנצטרך להמציא weights שרירותיים.

---

## ‏10B.36 כאשר אין Dominance — משתמשים ב־Policy Priority מפורשת

‏למשל Regime יכול להגדיר סדר:

```text
WIDE_SPREAD_WITH_TIME:
MIDPRICE
→ SNAP_MIDPOINT
→ PASSIVE_JOIN
→ MARKETABLE_LIMIT_IOC
```

‏בעוד Regime אחר:

```text
FAST_BREAKOUT_SHORT_LIFE:
MARKETABLE_LIMIT_IOC
→ ADAPTIVE_LIMIT_URGENT
→ NO_TRADE
```

‏אלה Policies למחקר; הנתונים יחליטו אם הן נשארות.

---

## ‏10B.37 Regime אינו Label קסם

‏נעדיף Regime שנגזרת מתנאים מפורשים:

```text
spread_bucket
remaining_life_bucket
quote_velocity_bucket
depth_bucket
volatility_bucket
urgency_bucket
```

‏כך אפשר לשחזר למה Candidate קיבלה priority ולא להסתפק ב־`regime = FAST` לא מוסבר.

---

## ‏10B.38 Escalation אינה Timer שמעלה מחיר אוטומטית

‏Anti-pattern:

```text
passive 200ms
then midpoint 200ms
then IOC automatically
```

‏הבעיה: אחרי 400ms כבר יש Market/Signal חדשים.

‏נכון יותר:

```text
attempt ends or checkpoint occurs
→ update fills
→ fresh market snapshot
→ run 10A gates
→ run 10B selection again
```

‏אם יצא Behavior אגרסיבי יותר — זו Decision חדשה, לא continuation עיוור.

---

## ‏10B.39 אפשר לבנות `Escalation Budget`

‏גם כאשר כל שלב עובר re-evaluation, נרצה bounds מצטברים:

```text
max_attempts_per_signal
max_total_entry_time_ms
max_cumulative_price_concession
max_cancel_replace_count
max_broker_algo_restarts
```

‏כך Sequence של Decisions חוקיות בנפרד לא הופכת יחד ל־chase אינסופי.

---

## ‏10B.40 `Price Concession` צריכה להימדד מה־Reference המקורי

‏לא רק:

```text
new limit - previous limit
```

‏אלא גם:

```text
current_limit - initial_decision_reference
current_limit - original_bid_or_ask
current_limit - original_midpoint
```

‏כך עשרה צעדים קטנים אינם מסתירים ויתור מצטבר גדול.

---

## ‏10B.41 Hard Cap נשאר Hard גם אחרי כמה ניסיונות

‏אין מצב שבו:

```text
we already tried three times
so allow one more tick beyond cap
```

‏אם ה־cap השתנתה, זה חייב להגיע מ־Economic Model חדש ב־Decision חדשה — לא מ־frustration counter.

---

## ‏10B.42 `No Chase after Signal Decay`

‏אם Signal עוברת:

```text
VALID -> WEAKENING
```

‏Policy יכולה עדיין להשאיר Behavior פסיבית לזמן קצר, אבל לא בהכרח לאשר escalation.

‏אם:

```text
VALID -> INVALIDATED
```

‏התגובה היא Cancel/Reconcile, לא price improvement נוסף.

---

## ‏10B.43 Quote שמתרחקת מאיתנו אינה לבדה סיבה לרדוף

‏אם Ask עולה:

```text
20.00 -> 20.01 -> 20.02
```

‏צריך לשאול:

```text
Did expected exit rise too?
Is remaining edge still sufficient?
Is the move signal-confirming or exhaustion?
Can we still exit safely?
```

‏רק אחר כך מחיר Entry יכול להשתנות.

---

## ‏10B.44 `Partial Fill` מחלקת את Entry לשתי בעיות

‏אחרי Fill חלקית יש:

```text
A. Position already owned
B. Remaining desired entry
```

‏אלה כבר לא אותה Decision.

‏ה־Position הקיימת עוברת מיד לעולם ההגנה/Exit, בעוד יתרת ה־Entry חוזרת ל־Gates.

---

## ‏10B.45 ארבע מחלקות של Partial Fill

```text
FULL_FILL
USEFUL_PARTIAL
SUBMINIMUM_PARTIAL
DUST_PARTIAL
```

‏הסיווג תלוי economics ולא במספר קבוע של מניות.

‏`USEFUL_PARTIAL` יכולה להישאר Position תקפה.

‏`SUBMINIMUM_PARTIAL` יכולה להצדיק החלטה לא להוסיף עוד ואף לשקול יציאה ב־10C.

---

## ‏10B.46 Retry של Remainder אינו אוטומטי

‏נניח:

```text
target = 100
IOC filled = 63
remainder = 37
```

‏אין:

```text
retry 37 immediately
```

‏יש:

```text
update position = 63
recompute remaining safe qty
refresh signal/market/capabilities
run gates
select behavior for remainder if still justified
```

---

## ‏10B.47 `Zero Fill` הוא Observation עשיר

‏Zero Fill ב־IOC יכולה לומר:

```text
market moved beyond cap
visible liquidity vanished
cap was too conservative
latency was too high
route had no executable liquidity
```

‏Zero Fill ב־Passive אומר משהו אחר לגמרי.

‏לכן `no_fill_reason` צריך להיות behavior-specific.

---

## ‏10B.48 Broker Rejection אינה `No Fill`

‏Rejection אומרת שה־Order לא נכנסה למסלול הביצוע כפי שהתכוונו.

‏No Fill אומרת שה־Order התקבלה אך לא מצאה execution בתנאים הרלוונטיים.

‏Fallback אחרי Rejection צריכה לכלול Capability update; fallback אחרי No Fill צריכה לכלול Market/Signal update.

---

## ‏10B.49 Capability Conflict מסירה Candidate בזמן אמת

‏אם:

```text
MIDPRICE -> rejected as unavailable for current contract/context
```

‏אנחנו:

```text
mark capability conflict
remove MIDPRICE
re-run 10A/10B
```

‏לא שולחים Candidate אגרסיבית יותר ישירות מתוך error handler.

---

## ‏10B.50 Broker-Managed Behavior עדיין מקבלת Local TTL

‏`Relative`, ‏`MidPrice` ו־`Adaptive` יכולות להמשיך לעבוד אצל Broker כאשר המנוע המקומי אינו משנה מחיר.

‏לכן לכל אחת נשמור:

```text
application_ttl_ms
signal_expiry
cancel_conditions
```

‏Delegation מצמצמת micro-management; היא לא מבטלת ownership של lifecycle.

---

## ‏10B.51 TTL לפי Behavior ולא רק לפי Signal

‏אותו Signal יכול לתת TTL שונה ל־Candidates:

```text
PASSIVE_JOIN = short
MIDPRICE = short-to-medium
ADAPTIVE_URGENT = short
MARKETABLE_LIMIT_IOC = immediate by TIF
```

‏אבל אף TTL אינה יכולה לעבור את Signal lifetime או את `EntryEnvelope.max_wait_ms`.

---

## ‏10B.52 Queue Age היא Benefit עם Expiry

‏אם Passive Order כבר צברה זמן בתור, ניתן לתת לכך משקל בהחלטת `KEEP` מול `CANCEL`.

‏אבל:

```text
signal validity
hard cap
economic edge
```

‏תמיד גוברים על Queue Age.

‏אין `sunk-cost exception`.

---

## ‏10B.53 Modify מול Cancel/New נכנס לבחירת Behavior

‏אם ה־Behavior נשאר אותה משפחה ורק price/qty/TIF מתעדכנים באופן בטוח, אפשר לשקול Modify.

‏אם עוברים למשל:

```text
PASSIVE_LIMIT
→
MIDPRICE
```

‏זו בדרך כלל החלפת Behavior, ולכן מתייחסים אליה כ־Cancel/Reconcile/New בהתאם ל־Broker Adapter ולא כ־mutation שרירותית של Order קיימת.

---

## ‏10B.54 Candidate אחת בלבד אינה מחייבת Submit

‏אם אחרי elimination נשארה רק:

```text
MARKETABLE_LIMIT_IOC
```

‏אבל current market השתנה כך שה־cap אינה marketable עוד, ה־Selector יכול להחזיר:

```text
DEFER
or
NO_TRADE
```

‏"נשאר Candidate אחד" אינה חובה להשתמש בה.

---

## ‏10B.55 לא שולחים כמה Entry Candidates במקביל רק כדי לראות מי תתמלא

‏זה anti-pattern מסוכן:

```text
PASSIVE 100 shares
+
MIDPRICE 100 shares
+
IOC 100 shares
```

‏כאשר target position היא 100.

‏כל שלושתן potentially executable ויכולות לייצר 300.

‏Research comparison נעשית ב־shadow/simulation או תחת quantity budget מפורש, לא באמצעות uncontrolled live race.

---

## ‏10B.56 Global Capital Lock חשוב במיוחד למודל שלנו

‏אם המערכת מקצה את רוב ההון ל־Opportunity המובילה, Entry intent אחת יכולה לחסום אחרות גם לפני Fill:

```text
capital_reserved_for_potential_fill
```

‏צריך לכלול גם Orders ב־submit/cancel uncertainty.

‏אחרת Scanner יכול לבחור מניה חדשה בזמן שההון עדיין עלול להיתפס על ידי Order הישנה.

---

## ‏10B.57 `Superseded Opportunity`

‏אם Scanner מוצא Opportunity חדשה שהאסטרטגיה מעדיפה על הקודמת, לא קופצים אליה כאילו הראשונה נעלמה.

‏נרצה state:

```text
old_intent = SUPERSEDED
```

‏ואז:

```text
cancel old entry
reconcile possible late fill
release only confirmed-safe capital/exposure
then evaluate new intent
```

‏זה קריטי כאשר משתמשים באותו הון שוב ושוב במהירות.

---

## ‏10B.58 `Entry Ownership` — מי רשאי להחליט עכשיו

‏לכל Intent יהיה owner יחיד של Entry lifecycle:

```text
ENTRY_SELECTOR
```

‏Scanner יכול supersede/expire את Intent, Broker Adapter יכול לדווח facts, אבל שום callback לא אמורה להחליט עצמאית "לנסות Order אחרת".

‏כך נמנעים retries מפוזרים בכמה שכבות קוד.

---

## ‏10B.59 מטריצת התאמה לפי Regime

| מצב | Candidates טבעיות | מה נחלש |
|---|---|---|
| ‏Spread צר מאוד + urgency גבוהה | `MARKETABLE_LIMIT_IOC`, `ADAPTIVE_URGENT` | ‏Passive savings קטנה |
| ‏Spread רחב + Signal עדיין צעיר | `MIDPRICE`, `SNAP_MIDPOINT`, Passive | ‏Immediate crossing יקר |
| ‏Quote זזה מהר + Passive intent | `RELATIVE_PRIMARY` | ‏Static join מתיישנת מהר |
| ‏רוצים price improvement בלי continual reprice | `SNAP_MIDPOINT` | ‏Relative/Peg פחות deterministic |
| ‏Direct midpoint hypothesis מוכחת | `PEGGED_MIDPOINT_DIRECT` | ‏SMART פחות deterministic |
| ‏Signal כמעט פג | `MARKETABLE_LIMIT_IOC` או `NO_TRADE` | ‏Waiting families |
| ‏Depth דקה בתוך cap | ‏Size reduction / partial IOC / `NO_TRADE` | ‏Full-size aggression |

‏המטריצה היא starting policy למחקר, לא חוק Live סופי.

---

## ‏10B.60 Decision Tree ראשוני ללא Score

```text
if envelope.permission != ALLOW_ENTRY:
    return no_entry

candidates = enabled_and_allowed_behaviors

remove candidates that cannot fit time budget
remove candidates that violate liquidity intent
remove candidates that cannot respect hard cap
remove candidates with unacceptable expected fill size
remove candidates with insufficient capability confidence
remove candidates that exceed complexity/risk policy

if no candidates:
    return NO_TRADE

apply dominance elimination
apply regime-specific explicit priority
return EntryPlan
```

‏זו skeleton ברורה שאפשר ליישם ולבדוק.

---

## ‏10B.61 `Selection Reason` הוא חלק מהתוצאה

‏לדוגמה:

```text
selected = MIDPRICE
reason = WIDE_SPREAD_WITH_TIME_FOR_MIDPOINT_SEARCH
```

‏או:

```text
selected = MARKETABLE_LIMIT_IOC
reason = SHORT_REMAINING_LIFE_AND_SUFFICIENT_DEPTH_WITHIN_CAP
```

‏זה חשוב ל־debug ולמחקר הרבה יותר מ־`selectedBecauseScore=0.84`.

---

## ‏10B.62 Telemetry של Candidate Elimination

‏לכל Decision נשמור:

```text
candidate_id
initially_allowed
eliminated
elimination_reason
expected_time_to_useful_fill
expected_useful_fill_probability
expected_entry_cost_bps
expected_price_improvement_bps
expected_missed_move_cost_bps
hard_cap_distance_bps
qty_to_depth_ratio
route
implementation_owner
```

‏גם Candidates שלא נבחרו צריכות להישמר למחקר.

---

## ‏10B.63 Shadow Evaluation

‏ב־Live/Paper אפשר לבחור Behavior אחת לביצוע אבל לחשב במקביל מה ה־Selector היה חושב על האחרות:

```text
chosen_behavior = A
shadow_candidates = B,C,D
```

‏אין שולחים Orders אמיתיות ל־shadow candidates.

‏כך ניתן לאסוף Decision comparison בלי לייצר exposure כפול.

---

## ‏10B.64 Outcome Attribution

‏אחרי סיום Entry attempt נשייך Outcome ל־Decision המקורית:

```text
selected_behavior
selection_reason
fill_result
fill_latency
entry_cost
markout
missed_move_if_no_fill
subsequent_exit_cost
```

‏כך אפשר לשפר Policy לפי Outcome אמיתי ולא לפי תחושת "הפקודה נראתה טובה".

---

## ‏10B.65 A/B Test הוגן חייב להשוות Opportunity-level Outcome

‏לא:

```text
all fills from MIDPRICE
vs
all fills from IOC
```

‏אלא:

```text
all eligible opportunities assigned to each policy
including no-fills and missed moves
```

‏אחרת Candidate עם no-fill גבוה יכולה להיראות מצוינת כי העסקאות הרעות פשוט לא נכנסו לסטטיסטיקה.

---

## ‏10B.66 Acceptance Tests ל־Entry Selector

```text
1. wide spread + long enough life => midpoint/passive candidates survive
2. very short life => waiting candidates eliminated
3. passive-only economics => taker candidate eliminated
4. post-only unavailable => only post-only candidate removed
5. hard cap below executable ask => IOC not falsely treated as executable
6. thin depth => size reduced or aggressive candidate removed
7. quote velocity high => static passive policy can lose priority
8. Relative chosen only with cap + TTL
9. MidPrice chosen only when time budget permits
10. Snap expires without automatic chase
11. IOC partial => remainder goes through new decision
12. zero-fill IOC => classified, not blindly retried
13. broker reject => capability conflict + re-decision
14. signal invalidates during passive wait => cancel
15. signal invalidates during Adaptive => cancel
16. old entry cancel-pending prevents unsafe new entry
17. superseding symbol waits for safe exposure reconciliation
18. cumulative escalation never exceeds concession budget
19. hard cap never violated across retries
20. identical replay snapshot => same EntryPlan
```

---

## ‏10B.67 Property Tests חשובים

```text
shorter remaining life must never make a slower-only candidate newly eligible
lower hard buy cap must never permit a higher executable price
higher potential exposure must never increase allowed entry qty
removing post-only capability must never create an automatic taker order
signal INVALIDATED must never produce a new entry plan
cumulative concession must never exceed configured maximum
```

‏אלה מגינים על המבנה גם אחרי שנוסיף עוד Order Types בעתיד.

---

## ‏10B.68 Recommendation ל־V1 של Entry Engine

‏כדי לא לבנות מערכת ענקית לפני שיש Evidence, V1 המחקרית יכולה להתחיל עם ארבעה behaviors מבוצעים היטב:

```text
PASSIVE_JOIN
MIDPRICE
ADAPTIVE_LIMIT_URGENT
MARKETABLE_LIMIT_IOC
```

‏ולהוסיף לאחר מכן:

```text
PASSIVE_POST_ONLY
RELATIVE_PRIMARY
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
```

‏הסיבה אינה שהקבוצה השנייה פחות חשובה; הקבוצה הראשונה נותנת ארבע פילוסופיות שונות מאוד עם implementation surface סביר להתחלה.

---

## ‏10B.69 אבל Research Harness צריך להיות Extensible מהיום הראשון

‏ה־Selector לא יכיל:

```text
if orderType == ...
```

‏בכל מקום.

‏נרצה interface כמו:

```text
EntryBehaviorCandidate {
  id
  eligibility(context, envelope)
  derive_constraints(context, envelope)
  estimate_outcome(context)
  materialization_requirements
  cancel_policy
}
```

‏כך אפשר להוסיף Order Family בלי לשכתב את Decision Engine.

---

## ‏10B.70 Practitioner Secrets — Entry Selection

### ‏1. הפקודה המהירה ביותר אינה תמיד Entry המהירה ביותר כלכלית

‏Fill מיידית במחיר שמוחק את ה־Edge היא execution מהירה לעסקה שלא הייתה צריכה להתבצע.

### ‏2. Passive אינה ברירת מחדל חסכונית

‏No-fill ו־adverse selection יכולים לעלות יותר מה־spread שנחסך.

### ‏3. Midpoint אינה "חצי Spread בחינם"

‏צריך לשלם עליה ב־fill uncertainty ובזמן.

### ‏4. `Post Only` היא Constraint

‏כאשר urgency עולה, ייתכן שה־Candidate עצמה צריכה להיעלם במקום לנסות לכופף אותה.

### ‏5. `Relative` חוסכת Reprice Loop — לא Signal Monitoring

‏Validity נשארת אצלנו.

### ‏6. `Snap` פותרת Auto-Chase, לא Staleness

‏TTL עדיין חובה.

### ‏7. `Adaptive` היא Delegation מבוקרת

‏ה־Broker יכולה לייעל HOW; אנחנו עדיין קובעים cap, time ו־WHETHER.

### ‏8. `IOC` היא ניסיון סגור ונקי יחסית

‏אבל Partial Fill משנה מיד את State ועלולה להפוך את יתרת ה־Intent ללא רלוונטית.

### ‏9. Escalation היא Series של Decisions

‏לא staircase שממשיך אוטומטית עד Fill.

### ‏10. Chase נמדד מצטבר

‏עשרה ticks של concession קטנה הם עדיין עשרה ticks.

### ‏11. Better Opportunity אינה מוחקת Exposure ישנה

‏הון ו־Risk משתחררים רק אחרי reconciliation.

### ‏12. Candidate שלא נבחרה עדיין חשובה למחקר

‏בלי shadow telemetry לא נדע אם ה־Policy שלנו מפספסת חלופה טובה יותר.

---

# ‏Checkpoint — סוף חלק 10B

‏בחלק הזה תרגמנו את ה־`EntryEnvelope` של 10A למנגנון בחירה ממשי בין Passive, Post Only, Relative, Midpoint/Snap/Pegged, Adaptive ו־Marketable Limit + IOC. הבחירה נשארה elimination-first: קודם מסירים Behaviors שלא עומדים בזמן, liquidity intent, cap, size, capability ו־risk; אחר כך משתמשים ב־pairwise dominance וב־explicit regime priorities במקום Master Score שרירותי.

‏הגדרנו Time Budget, Behavior-specific TTL, cumulative escalation budget, anti-chase invariants, partial-fill re-decision, no-fill/rejection classification, global capital reservation, superseded intents, shadow evaluation, telemetry ו־acceptance/property tests. העיקרון המכריע הוא ש־**כל escalation, retry או fallback היא Decision חדשה על Market/Signal/Position חדשים — לא המשך אוטומטי של הפקודה הקודמת.**

‏השלב הבא יהיה **חלק 10C — Exit Decision**: נפריד `NORMAL_EXIT`, ‏`FAST_EXIT`, ‏`EMERGENCY_REDUCE`, ‏`STOP_BACKSTOP`, ‏`BROKER_BRACKET` ו־`HYBRID_PROTECTION`, ונגדיר מי מחזיק ownership על היציאה בכל רגע, כיצד Partial Position משנה את ה־Exit, ואיך לא נותנים ל־client exit ול־broker protection לבצע Double Exit.