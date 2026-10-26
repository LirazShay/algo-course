# ‏11 — Recommendation Sheet: Liquidity / Executability

> ‏מקור לימודי עיקרי: `../11-LIQUIDITY-AND-EXECUTABILITY.md`.
>
> ‏מטרת הקובץ: לקבוע כיצד הרובוט צריך להחליט אם Candidate שנראית טובה לפי Signal באמת ניתנת לכניסה וליציאה בגודל שלנו, בזמן שלנו, ובחיכוך שלא מוחק את ה־Edge.

---

## ‏1. Decision

‏איך להפוך את השאלה:

```text
Which stock has the strongest signal?
```

‏לשאלה הנכונה למסחר אמיתי:

```text
Which candidate still has enough executable net edge
for my intended size
at this exact market state?
```

‏המערכת חייבת להפריד בין:

```text
Signal Quality
Liquidity
Executability
Execution Cost
Fill Risk
Exit Risk
```

‏Candidate חזקה אינה עסקה אם אי אפשר להיכנס ולצאת ממנה בצורה סבירה.

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: Liquidity Gate לפני שליחת Order

‏לפני Entry נדרש לפחות:

```text
quote is fresh
bid > 0
ask > bid
spread is valid
planned_qty known
ask-side entry capacity acceptable
bid-side exit capacity acceptable
expected round-trip friction acceptable
market / broker state healthy
=> candidate may proceed to execution policy
```

‏אחרת:

```text
NO TRADE
```

### ‏`P1 — Preferred Default`: Liquidity היא Position-Size-Aware

‏המערכת לא תשאל:

```text
Is XYZ liquid?
```

‏אלא:

```text
Is XYZ liquid enough for planned_qty now?
```

‏לכן נשמור תמיד יחד:

```text
planned_qty
planned_notional
bid_size
ask_size
```

‏ונגזור:

```text
entry_size_ratio = planned_qty / ask_size
exit_size_ratio  = planned_qty / bid_size
```

‏היחסים אינם חוקי Pass/Fail קבועים מראש; הם Inputs למדידה ול־Gate מבוסס Evidence.

### ‏`P1 — Preferred Default`: Round Trip נבדק לפני Entry

‏לפני קנייה צריך לבדוק גם את צד היציאה.

```text
entry side = ask / ask_size
exit side  = bid / bid_size
```

‏אין מספיק ערך ב־Ask טוב אם ה־Bid דק, stale או רחוק מדי.

### ‏`P1 — Preferred Default`: Spread מנורמל, לא סנט קבוע

‏נשמור לפחות:

```text
spread_abs
spread_pct
spread_bps
```

‏וכאשר יש Target/Expected Move:

```text
spread_to_expected_move_ratio
expected_round_trip_friction_to_edge_ratio
```

‏כלל כמו:

```text
spread <= $0.01
```

‏אינו Baseline טוב בין מניות במחירים שונים.

### ‏`P0 — Required Before Live Risk`: Quote Freshness הוא חלק מהנזילות

‏Bid/Ask ישנים אינם Executable Liquidity אמינה.

‏לכן כל snapshot צריך לפחות:

```text
quote_event_time
quote_receive_time
quote_age_ms
```

‏כאשר quote age עובר את ה־budget המאומת:

```text
LIQUIDITY_STATE = STALE
=> NO NEW ENTRY
```

### ‏`P1 — Preferred Default`: L1 לפני L2

‏Baseline ראשוני:

```text
best bid
best bid size
best ask
best ask size
spread
quote freshness
recent trades / volume
```

‏אין צורך להתחיל מ־full-depth לכל השוק.

‏`Level 2 / depth` מתקדם ל־Challenger רק אם הוא משפר:

```text
fill prediction
slippage prediction
exit reliability
net outcome
```

### ‏`P1 — Preferred Default`: Expected Round-Trip Friction

‏ננהל אומדן מפורש של:

```text
entry spread / crossing cost
entry slippage
exit spread / crossing cost
exit slippage
fees / commissions
expected adverse-selection cost where measurable
```

‏ונגזור:

```text
expected_round_trip_cost
```

‏ה־Trade Gate צריך להשוות:

```text
expected_executable_edge
=
expected_forward_move
- expected_round_trip_cost
```

‏עם Safety Margin.

### ‏`P0 — Required Before Live Risk`: Exit Feasibility אינה אופציונלית

‏Entry מותרת רק כאשר קיימת הערכה סבירה ליציאה.

‏לפחות:

```text
bid fresh
bid size usable for planned_qty
spread not abnormal
no liquidity shock
no unknown trading state
```

‏העיקרון:

```text
Do not enter a position you cannot plausibly exit.
```

### ‏`P1 — Preferred Default`: Fill Truth מעל Quote Assumptions

‏ה־Market Data מספר מה חשבנו שקיים.

‏ה־Broker fills מספרים מה קרה לחשבון.

‏לכן נשמור:

```text
decision market state
submit market state
fill market state
actual fill price
actual fill qty
actual fill timestamps
```

‏ונעדכן את מודל הנזילות מתוך fills אמיתיים.

### ‏`P1 — Preferred Default`: Passive Fill אינו נחשב ודאי

‏כאשר משתמשים ב־passive Limit:

```text
price touched limit
```

‏אינו שקול ל:

```text
our order filled
```

‏חובה למדוד:

```text
fill_probability
partial_fill_probability
time_to_first_fill
time_to_complete_fill
signal_age_at_fill
```

### ‏`P1 — Preferred Default`: Time-to-Fill ו־Time-to-Exit הם Primary Metrics

‏לאסטרטגיה של שניות נמדוד לפחות:

```text
entry_time_to_first_fill
entry_time_to_complete_or_cancel
exit_time_to_first_fill
exit_time_to_flat
```

‏ב־percentiles:

```text
P50
P95
P99
```

‏Average בלבד אינו מספיק.

### ‏`P1 — Preferred Default`: Decision-to-Fill Drift

‏נשמור:

```text
decision_reference_price
submit_reference_price
fill_price
```

‏ונגזור:

```text
decision_to_submit_drift
submit_to_fill_drift
decision_to_fill_drift
```

‏כך ניתן לזהות שה־Signal היה טוב אך הביצוע הגיע מאוחר מדי.

### ‏`P1 — Preferred Default`: Markout למדידת איכות Fill

‏אחרי Fill נמדוד Reference Prices במספר Horizons:

```text
markout_1s
markout_5s
markout_10s
markout_30s
```

‏ל־Buy Fill, Markout שלילי עקבי יכול להצביע על adverse selection או Entry מאוחר.

‏`Fill Rate` גבוה לבדו אינו הצלחה.

### ‏`P0 — Required Before Live Risk`: Liquidity Shock Circuit Breaker

‏מצבים כגון:

```text
spread expands sharply
depth / top-size collapses
quote becomes stale
market status becomes abnormal
feed health degrades
```

‏צריכים לעבור למצב:

```text
BLOCK_NEW_ENTRIES
```

‏ל־Position קיימת תהיה מדיניות Exit נפרדת בפרקי Execution/Risk.

### ‏`P1 — Preferred Default`: Wide Scan → Deep Candidate Check

‏הארכיטקטורה המומלצת:

```text
whole market
→ cheap L1 liquidity features
→ shortlist
→ fresh candidate execution check
→ optional deeper liquidity data
→ order policy
→ TRADE / NO TRADE
```

‏כך לא משלמים על full-depth processing עבור כל הסימבולים.

### ‏`P2 — Challenger`: Depth-aware Cost Estimate

‏אם יש Depth איכותי, ניתן להעריך VWAP עבור `planned_qty`:

```text
consume displayed levels until planned_qty covered
→ estimated_entry_vwap
→ estimated_exit_vwap
```

‏אבל אסור להניח שכל displayed depth יישאר קיים עד הביצוע.

‏Promotion רק אם estimate כזה מנבא Actual Fill/Slippage טוב יותר משמעותית מ־L1 baseline.

### ‏`P2 — Challenger`: Resiliency / Refill

‏אפשר למדוד האם כמות שנצרכה חוזרת באותו price level.

‏Features אפשריים:

```text
same_level_refill_rate
refill_latency_ms
post-consumption displayed_size
```

‏זה יכול לשפר הבנת liquidity מעבר לצילום בודד, אך דורש event-level quote data איכותי.

### ‏`P2 — Challenger`: Spread Stability / Expansion

‏אפשר למדוד:

```text
spread_change_1s
spread_change_5s
spread_expansion_rate
spread_update_count
```

‏Promotion אם הדבר משפר prediction של slippage / failed exits / stale signals.

### ‏`P2 — Challenger`: Depth Imbalance / Microprice

‏אם L2 זמין:

```text
bid_depth
ask_depth
depth_imbalance
microprice
```

‏יישארו Features מחקריים ולא Hard Truth.

‏Displayed depth יכול להתבטל ולהשתנות מהר.

### ‏`P3 — Advanced Challenger`: Queue / Fill Model

‏Queue model מפורט מוצדק רק אם passive execution הופך לחלק משמעותי מהאסטרטגיה.

‏המודל יצטרך לפחות:

```text
order arrival time
price level
visible queue ahead estimate
trades at level
cancellations / replenishment assumptions
partial fills
venue / routing context
```

‏אין לבנות Simulator מלא לפני שיש Evidence שהבעיה המעשית היא queue uncertainty.

### ‏`P3 — Advanced Challenger`: Liquidity Score

‏אפשר בעתיד לבנות ציר נפרד:

```text
LiquidityScore
```

‏אבל Baseline מעדיף Features/Gates מפורשים על מספר קסם יחיד.

‏אם ייבנה Score, הוא חייב להיות explainable ומפורק לרכיבים.

---

## ‏3. Why

### ‏Fact

‏`Volume` ו־`Liquidity` אינם אותו דבר: פעילות היסטורית אינה מבטיחה כמות זמינה עכשיו במחיר סביר.

### ‏Fact

‏Spread הוא חיכוך מיידי, ובאסטרטגיה עם Expected Move קטן הוא יכול למחוק חלק גדול מה־Edge.

### ‏Fact

‏Top-of-Book size משמעותי רק ביחס ל־`planned_qty`.

### ‏Fact

‏Limit passive אינו מבטיח Fill, ו־price touch אינו מוכיח שהפקודה שלנו הגיעה לתור.

### ‏Fact

‏Displayed liquidity יכולה להיעלם, להתבטל או להתחדש לפני שהפקודה מגיעה.

### ‏Fact

‏Fill בפועל הוא מקור האמת לפוזיציה ולמחיר הביצוע שלנו.

### ‏Fact

‏נזילות יכולה להשתנות במהירות לפי שעה, session ומצב שוק.

### ‏Judgment

‏לרובוט שלנו Liquidity צריכה להיות בעיקר `Execution Gate + Cost Model`, ורק משנית Signal Feature.

### ‏Judgment

‏L1 fresh + size-aware ratios + fills telemetry הם Baseline טוב יותר מאשר התחלה עם L2/queue simulator מורכב.

### ‏Hypothesis

‏Candidate עם Momentum מעט חלש יותר אך round-trip friction נמוך יותר עשויה לייצר Net Outcome טוב יותר מה־Momentum leader.

### ‏Hypothesis

‏`decision_to_fill_drift`, ‏`markout` ו־`exit_time_to_flat` עשויים להסביר כשלונות טוב יותר מ־spread snapshot בלבד.

---

## ‏4. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏זמן החזקה הוא שניות עד עשרות שניות.
- ‏ה־Expected Move קטן יחסית.
- ‏המערכת סורקת Universe רחב.
- ‏צריך להחליט מהר אם Signal עדיין בר־ביצוע.
- ‏ה־Order Size קטן/בינוני אך משתנה לפי מחיר.
- ‏יש לפחות fresh L1 quote ו־broker fill telemetry.

---

## ‏5. Do Not Use When

‏אין להסתפק ב־L1 baseline כאשר:

- ‏ה־planned size צורך כמה price levels באופן שגרתי.
- ‏passive fill probability היא רכיב קריטי ב־Edge.
- ‏L1 אינו מנבא Actual Slippage בצורה מספקת.
- ‏ה־strategy מכוונת למוצר/venue שבו book mechanics שונים מהותית.
- ‏ה־data feed אינו נותן size/freshness אמינים.

‏במצבים כאלה יש לקדם Challenger עמוק יותר.

---

## ‏6. Alternatives

| חלופה | יתרון | חיסרון | סטטוס |
|---|---|---|---|
| ‏Fresh L1 + sizes | פשוט, זול, רחב | לא רואה depth/queue | `Baseline` |
| ‏L1 + short activity | מוסיף context | עדיין לא fill model | `Preferred Default` |
| ‏Depth-aware VWAP | position-size-aware יותר | displayed depth לא מובטח | `P2 Challenger` |
| ‏Resiliency model | רואה refill dynamics | דורש event depth | `P2 Challenger` |
| ‏Microprice / imbalance | עשוי לתת microstructure signal | יכול להיות noisy/fragile | `P2/P3` |
| ‏Queue simulator | טוב ל־passive modeling | מורכב מאוד | `P3` |
| ‏Full microstructure simulator | מחקר עשיר | עלות/מורכבות גבוהה מאוד | `P4 / Avoid Initially` |

---

## ‏7. Trade-offs

### ‏מחיר מול Fill Certainty

```text
more passive
→ better price control
→ lower fill certainty
→ more signal decay risk
```

```text
more aggressive
→ faster fill
→ higher crossing/slippage cost
```

### ‏Wide Coverage מול Deep Liquidity Data

```text
wide L1
→ cheap + scalable
→ less book detail
```

```text
deep book
→ richer execution estimate
→ higher data/compute complexity
```

### ‏Conservative Gate מול Opportunity Loss

‏Gate קשיח מדי על spread/size יכול להסיר עסקאות טובות.

‏Gate רך מדי יכול להכניס עסקאות שאין להן Net Edge.

‏לכן thresholds חייבים להיבדק אמפירית.

---

## ‏8. What I Would Avoid Initially

- ‏לא להכריז שמניה "נזילה" לפי Daily Volume בלבד.
- ‏לא להשתמש ב־spread cents קבוע לכל מחירי המניות.
- ‏לא לבדוק רק Ask לפני Buy ולהתעלם מה־Bid ליציאה.
- ‏לא להניח שכל displayed size יהיה קיים כשנגיע אליו.
- ‏לא להניח Hidden Liquidity לטובת Backtest.
- ‏לא להניח passive Fill כאשר המחיר רק נגע ב־Limit.
- ‏לא לבנות L2/queue simulator לפני שיש בעיית מדידה שמצדיקה אותו.
- ‏לא למדוד Fill Rate בלי Markout.
- ‏לא להסתפק ב־Average fill/exit time בלי tail percentiles.
- ‏לא לאפשר Entry כאשר quote/feed/trading state לא ידוע.

---

## ‏9. What to Add Later

- ‏Depth-based VWAP for planned size.
- ‏Book resiliency / refill analysis.
- ‏Venue / routing attribution.
- ‏Passive queue modeling.
- ‏Microprice / depth imbalance.
- ‏Liquidity regime model לפי session/time-of-day.
- ‏Adaptive position sizing לפי executable capacity.
- ‏Stress model ל־liquidity shock.
- ‏Per-order-type execution model.
- ‏Model calibration מתוך actual broker fills.

---

## ‏10. Required Data / Evidence

### ‏Decision snapshot

```text
symbol
as_of_time
bid
bid_size
ask
ask_size
mid
spread_abs
spread_bps
quote_event_time
quote_receive_time
quote_age_ms
planned_qty
planned_notional
recent_trade_count
recent_volume
feed_health
trading_status
```

### ‏Order lifecycle

```text
decision_time
submit_time
ack_time
first_fill_time
last_fill_time
cancel_request_time
cancel_confirm_time
order_type
limit_price
requested_qty
filled_qty
average_fill_price
routing / venue when available
reject / cancel reason
```

### ‏Exit lifecycle

```text
exit_intent_time
exit_submit_time
exit_first_fill_time
flat_time
exit_requested_qty
exit_filled_qty
exit_fill_price
```

### ‏Derived evidence

```text
entry_size_ratio
exit_size_ratio
entry_slippage
exit_slippage
round_trip_slippage
effective_spread
entry_time_to_fill
exit_time_to_flat
fill_ratio
decision_to_fill_drift
markout_1s
markout_5s
markout_10s
markout_30s
expected_round_trip_cost
realized_round_trip_cost
```

---

## ‏11. Promotion Criteria

### ‏לקידום Depth-aware model

- ‏L1 baseline משאיר residual slippage error משמעותי.
- ‏Depth estimate משפר prediction של Actual Fill/Slippage מחוץ למדגם.
- ‏השיפור נשאר לאחר accounting של data/compute latency.
- ‏ה־data coverage מספיק עקבי.
- ‏השיפור משפיע על Trade/No-Trade או Net Outcome, לא רק על metric טכני.

### ‏לקידום passive queue model

- ‏חלק מהותי מהאסטרטגיה משתמש passive orders.
- ‏Missed fills או late fills הם failure mode משמעותי.
- ‏Queue-aware model משפר fill prediction ו־net results OOS.
- ‏המודל ניתן לשחזור ולכיול מול fills אמיתיים.

### ‏לקידום Liquidity Score

- ‏יש כמה Liquidity Features שמוסיפים מידע עצמאי.
- ‏Score פשוט יותר משפר החלטה לעומת gates/features נפרדים.
- ‏אפשר לבצע decomposition ולהסביר כל החלטה.

---

## ‏12. Rejection Criteria

‏Reject Challenger אם:

- ‏הוא משפר gross price fit אך לא Net Outcome.
- ‏השיפור נעלם OOS.
- ‏הוא תלוי ב־feed/venue יחיד בלי portability או הצדקה.
- ‏data latency שלו מוחקת את יתרונו.
- ‏הוא מוסיף complexity בלי לשנות Trade/No-Trade או execution quality.
- ‏הוא מגדיל Fill Rate אבל מחמיר Markout/adverse selection.
- ‏הוא מצמצם slippage average אבל מחמיר tails של exit time.

---

## ‏13. Metrics

### ‏Primary

```text
realized_net_edge
realized_round_trip_cost
entry_time_to_first_fill
entry_time_to_complete_or_cancel
exit_time_to_flat
full_fill_rate
partial_fill_rate
markout_1s / 5s / 10s
```

### ‏Tail / Safety

```text
P95 entry fill time
P95 exit time
P99 exit time
worst round-trip slippage
liquidity-shock frequency
stale-quote rejection count
unknown-liquidity-state rejection count
```

### ‏Diagnostic

```text
spread_bps
entry_size_ratio
exit_size_ratio
quote_age_ms
spread_expansion
trade_rate
volume_rate
decision_to_fill_drift
```

---

## ‏14. Failure Modes

### ‏`Volume illusion`

‏Daily Volume גבוה גורם למערכת להתעלם מ־wide spread / low current size.

### ‏`One-sided liquidity`

‏Ask נראה טוב לכניסה אך Bid דק ליציאה.

### ‏`Stale quote as liquidity`

‏Bid/Ask ישנים נחשבים בטעות executable.

### ‏`Displayed-size certainty`

‏המערכת מניחה שה־size המוצג מובטח.

### ‏`Passive-touch fill fantasy`

‏Backtest מחשיב price touch כ־Fill.

### ‏`Fill-rate optimization trap`

‏מגדילים Fill Rate אך מקבלים fills רעילים עם Markout שלילי.

### ‏`Average hides tail`

‏Median exit מהיר אך P95/P99 מסוכן.

### ‏`Decision-to-fill decay`

‏ה־Signal נכון בזמן הבחירה אך כמעט מת בזמן Fill.

### ‏`Liquidity shock`

‏spread נפתח וה־book נעלם אחרי Entry.

### ‏`Provider mismatch`

‏Feed חיצוני נראה נזיל אך broker execution שונה מהותית.

### ‏`Size scaling failure`

‏המערכת מגדילה capital בלי recalibration של liquidity/capacity.

---

## ‏15. User-Specific Application

‏למערכת `Short-Horizon Momentum` שלנו ההחלטה צריכה להיות:

```text
Candidate selected
↓
Fresh L1 execution snapshot
↓
Compute planned_qty
↓
Check ask-side entry capacity
↓
Check bid-side exit capacity
↓
Estimate round-trip friction
↓
Compare against expected executable edge
↓
Recheck immediately before submit
↓
TRADE or NO TRADE
```

‏המטרה אינה לבחור את המניה שעלתה הכי הרבה.

‏המטרה היא לבחור את המועמדת שבה:

```text
signal still alive
AND entry feasible
AND exit feasible
AND friction acceptable
AND expected net edge > required safety margin
```

---

## ‏16. Concrete Baseline Contract

```text
IF
    candidate_signal_valid
    AND quote_fresh
    AND bid > 0
    AND ask > bid
    AND planned_qty > 0
    AND entry_liquidity_known
    AND exit_liquidity_known
    AND no_liquidity_shock
    AND estimated_round_trip_cost_known
    AND expected_executable_edge >= required_edge
THEN
    candidate may proceed to Order Policy
ELSE
    NO TRADE
```

‏לא מקבעים עדיין מספרים קשיחים ל־spread, size ratio או required edge בלי Validation.

---

## ‏17. Minimum Acceptance Tests

### ‏Test 1 — Same signal, different spread

‏שתי מניות עם Signal זהה אך spread שונה חייבות לקבל executable economics שונים.

### ‏Test 2 — Same spread, different planned size

‏כאשר `planned_qty` גדל, liquidity state/estimated cost חייבים להשתנות בהתאם.

### ‏Test 3 — One-sided book

‏Ask עמוק + Bid דק חייב להיחשב exit risk.

### ‏Test 4 — Stale quote

‏Quote מעל freshness budget חייב לחסום Entry.

### ‏Test 5 — Partial fill

‏Partial fill חייב לייצר position state אמיתי ולהפעיל lifecycle מתאים.

### ‏Test 6 — Passive touch without fill

‏Price touch בלבד אינו מייצר synthetic fill.

### ‏Test 7 — Markout

‏Fill שקיבל מחיר טוב לכאורה אך mid נע מיד לרעתנו חייב להופיע כ־adverse markout.

### ‏Test 8 — Liquidity shock

‏Spread expansion / feed degradation חייב לחסום Entries חדשים.

### ‏Test 9 — Decision-to-fill drift

‏Fill מאוחר חייב לשמור את drift ולהשפיע על RCA.

### ‏Test 10 — Size scaling

‏אותו Symbol עם notional גדול פי 10 אינו רשאי לקבל אוטומטית אותה הערכת executability.

---

## ‏18. Confidence

### ‏High

- ‏Liquidity חייבת להיות position-size-aware.
- ‏Round-trip ולא Entry בלבד הוא בסיס נכון.
- ‏Fresh quotes ו־exit feasibility הם P0.
- ‏Actual fills הם execution truth.
- ‏Time-to-fill, time-to-exit ו־markout הם Metrics הכרחיים לאסטרטגיה קצרה.

### ‏Medium

- ‏Fresh L1 + sizes מספיק כ־Baseline ראשון עבור גודל עסקה אישי קטן יחסית.
- ‏Depth-aware modeling יוסיף ערך רק בחלק מה־Universe/מצבים.

### ‏Low / Hypothesis

- ‏איזה threshold ספציפי של spread/size ratio מקסימלי הוא אופטימלי.
- ‏האם depth imbalance/microprice ישפרו Net Edge.
- ‏האם passive execution עדיף כלכלית לאחר missed fills ו־adverse selection.

---

## ‏19. Time-Sensitive Facts

‏לפני Implementation חי יש לאמת מחדש:

- ‏Broker routing / smart-routing behavior.
- ‏Supported order types / time-in-force combinations.
- ‏Venue / session restrictions.
- ‏Market-data coverage and size/depth semantics.
- ‏Whether displayed sizes are consolidated or venue-specific in the chosen feed.
- ‏Broker fee / rebate / commission schedule.
- ‏Extended-hours capabilities and restrictions.
- ‏Any current Reg NMS / consolidated quote implementation details that affect the executable reference price.

‏ה־Recommendation כאן אינו מקבע capability ספציפית של Broker או Venue.

---

## ‏20. Relationship to Other Sheets

- ‏`03-BID-ASK-SPREAD-ORDER-BOOK.md` — מהו מחיר/quote ומה ניתן להסיק ממנו.
- ‏`04-ORDER-TYPES.md` — כיצד לבצע לאחר שה־Candidate עברה Liquidity Gate.
- ‏`05-MARKET-DATA.md` — מה Feed חייב לספק כדי למדוד נזילות.
- ‏`06-TIME-SAMPLING-LATENCY.md` — freshness ו־decision-to-fill latency.
- ‏`10-TRADE-ACTIVITY-VOLUME-FLOW.md` — פעילות כ־context, לא תחליף לנזילות.
- ‏`12-FILTERS-BEFORE-RANKING.md` — אילו Liquidity conditions יהפכו Hard Filter ואילו Soft Feature.
- ‏`16/17` — Entry/Exit policy.
- ‏`18` — Costs.
- ‏פרקי Backtest/Execution המאוחרים — realistic fill and slippage model.

---

# ‏Recommendation Summary

```text
Baseline
→ Fresh L1 + Bid/Ask sizes
→ Position-size-aware liquidity
→ Round-trip pre-trade check
→ Explicit expected execution cost
→ Exit feasibility before entry
→ Fill / partial-fill truth from broker
→ Time-to-fill / time-to-flat / markout telemetry
→ Liquidity shock = block new entries

Challengers
→ depth-aware VWAP
→ resiliency / refill
→ spread stability
→ depth imbalance / microprice
→ queue model

Avoid Initially
→ daily-volume-only liquidity rules
→ arbitrary cent spread threshold
→ entry-only liquidity check
→ assuming displayed size persists
→ passive price-touch synthetic fills
→ full microstructure simulator without evidence
```

‏העיקרון המחייב למקטע 11:

> ‏Signal שאינו ניתן לביצוע נטו בגודל ובזמן שלנו אינו Opportunity; הוא רק תנועת מחיר שראינו.