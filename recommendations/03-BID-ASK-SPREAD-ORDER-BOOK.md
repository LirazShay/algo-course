# ‏03 — Recommendation Sheet: Bid / Ask / Last / Spread / Order Book

> ‏מקור לימודי עיקרי: `../03-BID-ASK-LAST-SPREAD-ORDER-BOOK.md`.
>
> ‏מטרת הקובץ: להחליט איזה Price/Quote/Book model צריך להיות Baseline עבור רובוט `Short-Horizon Momentum`, מה מספיק לגרסה הראשונה, מה חייב להיות Gate, ומה נשאר Challenger למחקר מאוחר יותר.

---

## ‏1. Decision

‏איזה מידע על מחיר ונזילות חייב להיות חלק מה־Baseline של הסורק וה־execution gate, ואילו הנחות אסור לנו לעשות לגבי `Last`, ‏`NBBO`, ‏Depth, ‏Queue ו־Fill probability?

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: לא לקבל החלטת Execution על `Last` בלבד

‏`Last` הוא אירוע שכבר קרה.

‏ל־entry/exit feasibility צריך לפחות state עדכני של:

```text
Bid
Ask
Bid size
Ask size
Quote timestamp
Trading status
```

‏ה־`Last` נשאר Feature חשוב ל־trade/momentum analysis, אבל אינו מחיר executable מובטח.

### ‏`P1 — Preferred Default`: L1 עשיר לפני L2

‏לגרסת Baseline אני ממליץ להתחיל מ־:

```text
Last
Bid
Ask
Bid size
Ask size
Market-data timestamp
Receive timestamp
Session / trading status
```

‏ומזה לחשב:

```text
spread_abs
spread_pct_or_bps
mid
quote_age
last_vs_mid
size_relative_to_order
```

‏`Level 2` אינו דרישת פתיחה לכל השוק. הוא נכנס רק כאשר Evidence מראה שה־L1 baseline חסר מידע שמוסיף Net Edge או משפר Execution decisions.

### ‏`P1 — Preferred Default`: להשתמש ב־Mid כ־benchmark, לא כמחיר מובטח

‏ה־`Mid` מתאים ל־:

- ‏reference price למחקר.
- ‏markout.
- ‏slippage/effective-spread diagnostics.
- ‏separating market move from execution cost.

‏אבל:

```text
mid != guaranteed fill price
```

### ‏`P1 — Preferred Default`: Spread הוא Gate/Cost input, לא Signal בודד

‏למדוד לפחות:

```text
spread_abs = ask - bid
spread_pct = spread_abs / mid
```

‏או equivalent ב־bps.

‏ה־Spread צריך להשתתף ב־execution feasibility וב־Net-edge estimation.

‏אבל אין כלל:

```text
small spread => trade
```

‏כי צריך להתחשב גם ב־size, activity, quote freshness, expected move, fees ו־exit feasibility.

### ‏`P0 — Required Before Live Risk`: Quote freshness היא Gate

‏ערך בלי זמן אינו Price State מספיק.

‏כל Quote שמשמש החלטה חייב להיות עם timestamp/age ידוע.

‏ה־freshness threshold המדויק יוגדר בפרק 06 לאחר Measurement, אבל כבר עכשיו הכלל הוא:

```text
unknown quote age => NO TRADE
quote older than supported freshness budget => NO TRADE
```

### ‏`P1 — Preferred Default`: Size-aware execution feasibility

‏לפני Order צריך להשוות את גודל העסקה לכמות הנראית בצד הרלוונטי.

‏אסור להניח שכל הכמות תתבצע ב־Best Ask/Best Bid כאשר:

```text
order_qty > visible_size_at_best
```

‏גם כאשר הכמות קטנה מה־visible size, אין Guarantee; displayed liquidity יכולה להשתנות לפני ה־Fill.

### ‏`P1 — Preferred Default`: Queue uncertainty מפורשת

‏בפקודה פסיבית:

```text
price touched != our order filled
```

‏Backtest ו־Replay אינם רשאים להניח Fill רק משום שהשוק הגיע למחיר ה־Limit.

‏בגרסה הראשונה, כאשר אין לנו queue-position truth, המודל צריך להיות conservative ולהחזיק `fill uncertainty` מפורשת.

### ‏`P0 — Required Before Live Risk`: Locked/Crossed/invalid state אינו Quote רגיל

‏מצבים כגון:

```text
bid >= ask
missing side
negative/invalid spread
stale quote
inconsistent timestamp
halted/unknown trading status
```

‏צריכים לעבור Data/Execution Gate ייעודי.

‏אין להזין אותם אוטומטית ל־Score כאילו הם observation תקין.

### ‏`P1 — Preferred Default`: להפריד בין Signal Quality ל־Execution Quality

‏לכל Candidate נרצה לחשוב בשני צירים:

```text
Signal Quality
Execution Quality
```

‏מניה עם Momentum מצוין יכולה להיות `NO TRADE` כאשר ה־spread, freshness או executable liquidity אינם מתאימים.

### ‏`P1 — Preferred Default`: לשמור decision-state לצורך RCA

‏לכל Trade/No-Trade decision משמעותי יש לשמור לפחות:

```text
bid
ask
mid
last
bid_size
ask_size
quote timestamp
receive timestamp
spread
requested size
```

‏ול־Order שבוצע:

```text
actual fill price(s)
fill quantity
fill timestamps
time to first fill
time to completion/cancel
mid at decision
mid at submit
mid at fill
post-fill markout
```

---

## ‏3. Why

### ‏Fact

‏`Bid`, ‏`Ask` ו־`Last` הם שלושה concepts שונים. `Last` אינו התחייבות לביצוע עתידי.

### ‏Fact

‏`Spread` הוא חיכוך כלכלי ישיר כאשר עוברים מצד אחד של השוק לצד השני.

### ‏Fact

‏Displayed Order Book אינו בהכרח כל הנזילות הקיימת. קיימת גם non-displayed/reserve liquidity והזמנות יכולות להשתנות או להתבטל.

### ‏Fact

‏ב־Nasdaq קיימת price/time priority עבור ה־price/time model, עם displayed interest לפני non-displayed interest באותו מחיר לפי הכללים הרלוונטיים.

### ‏Fact — verified 2026-10-26

‏הגדרת `round lot` של `Reg NMS Rule 600(b)(93)` כבר אינה תמיד 100 מניות. היא price-tiered:

```text
<= $250.00             => 100 shares
$250.01–$1,000.00      => 40 shares
$1,000.01–$10,000.00   => 10 shares
>= $10,000.01           => 1 share
```

### ‏Fact — verified 2026-10-26

‏ה־SIPs מפיצים `BOLO` — best odd-lot order — מאז 27 באפריל 2026.

‏לכן ב־2026 יכול להיות better displayed odd-lot price בתוך ה־NBBO spread, ויש להבחין בין:

```text
NBBO
Best Odd-Lot Order
Best Available Displayed Price
```

### ‏Fact — verified 2026-10-26

‏היישום של amended minimum pricing increments ו־access-fee caps נדחה עד יום העסקים הראשון של נובמבר 2027.

### ‏Judgment

‏לרובוט שלנו עדיף Baseline עם L1 איכותי, freshness ו־execution measurement לפני השקעה בתשתית L2 לכל ה־Universe.

### ‏Hypothesis

‏Features המבוססים על:

```text
bid/mid/ask momentum
spread trend
size imbalance
book imbalance
queue estimates
```

‏עשויים לשפר Candidate/Execution decisions — אך כל אחד מהם חייב להוכיח incremental value OOS לאחר עלויות.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏ה־holding horizon הוא milliseconds עד עשרות שניות/דקה כאשר מוצדק.
- ‏ה־target edge קטן ו־spread/slippage משמעותיים יחסית אליו.
- ‏סורקים Universe רחב ולכן לכל field נוסף יש cost תשתיתי.
- ‏עדיין אין Evidence ש־full-depth data מוסיף ערך נטו.
- ‏רוצים מחקר שניתן לשחזור והפרדה בין signal לבין execution.

---

## ‏5. Do Not Use When

‏צריך Baseline אחר או הרחבה כאשר:

- ‏האסטרטגיה היא market-making/queue-position strategy.
- ‏ה־Edge תלוי מפורשות ב־multi-level order-book dynamics.
- ‏הפקודות גדולות יחסית ל־top-of-book liquidity.
- ‏המחקר מוכיח ש־L2/venue-specific depth משנה מהותית את fill/exit economics.
- ‏Data provider בפועל אינו מספק quote state אמין/טרי מספיק.

---

## ‏6. Alternatives

| אפשרות | שימוש | יתרון | מחיר/סיכון | דרגה |
|---|---|---|---|---|
| `Last` only | ‏POC מחקרי מוגבל | ‏פשוט וזול | ‏לא מתאר executable price | `Avoid for execution` |
| L1: Bid/Ask/Last/Sizes | ‏Baseline רחב | ‏מספיק לרוב מדדי friction הראשונים | ‏אין depth/queue מלא | `Preferred Default` |
| L1 + BOLO / best available displayed | ‏כאשר Provider תומך | ‏מזהה displayed price טוב מ־NBBO במקרים מסוימים | ‏עוד semantics/data dependencies | `P2 Improvement` |
| Aggregated L2 | ‏לאחר Evidence | ‏Depth/imbalance context | ‏עלות data, throughput, noise | `Challenger` |
| Venue-by-venue depth | ‏execution research מתקדם | ‏פירוט queue/venue | ‏מורכבות גבוהה מאוד | `Advanced` |
| Full event-depth feed | ‏microstructure specialist | ‏תמונה עשירה מאוד | ‏data volume/latency/cost/complexity | `Specialist` |

---

## ‏7. Trade-offs

### ‏L1 מול L2

‏L1 נותן פחות מידע אך מתאים הרבה יותר ל־broad-universe baseline.

‏L2 יכול להוסיף:

- ‏depth.
- ‏imbalance.
- ‏book slope.
- ‏multi-level liquidity.
- ‏queue proxies.

‏אבל הוא גם מוסיף:

- ‏data cost.
- ‏bandwidth.
- ‏state complexity.
- ‏event-rate pressure.
- ‏provider-specific semantics.
- ‏סיכון גדול יותר ל־false patterns.

### ‏Passive מול Aggressive Interpretation

‏Passive price יכול לחסוך spread אך מייצר non-fill/queue risk.

‏Aggressive price יכול להגדיל fill probability ומהירות אך משלם friction.

‏ההחלטה עצמה תעמיק בפרקי Orders/Execution; כאן נקבע רק שה־research model חייב למדוד את שני המחירים של ה־trade-off.

### ‏NBBO מול Best Available Displayed Price

‏NBBO נשאר reference מרכזי, אך מאז BOLO availability הוא אינו בהכרח ה־best displayed price לכל size/context.

‏לכן מערכות 2026+ צריכות לתעד איזה reference price שימש כל metric.

---

## ‏8. What I Would Avoid Initially

### ‏`Avoid entirely`: Live entry based on `Last` only

‏זה מערבב signal price עם execution price.

### ‏`Avoid initially`: Full L2 לכל 4,000+ symbols

‏לפני שהוכח incremental value, זו מורכבות יקרה מדי יחסית ל־Baseline.

### ‏`Avoid initially`: Queue model שמעמיד פנים שהוא truth

‏אם אין לנו queue position אמיתי, נשתמש ב־proxy/conservative model ונקרא לו כך.

### ‏`Avoid initially`: Book imbalance כ־buy signal עצמאי

‏Displayed size יכול להשתנות, להתבטל או לא לייצג hidden liquidity.

### ‏`Avoid unless measured`: Chase לפי כל Quote update

‏Cancel/replace עלול לפגוע בקדימות וליצור race/overtrading. הטקטיקה עצמה תיבחן בהמשך.

### ‏`Avoid entirely`: Hard-coded assumption ש־round lot = 100 shares

‏ההנחה אינה נכונה לכל NMS stocks מאז implementation של ההגדרה החדשה.

---

## ‏9. What to Add Later

‏לאחר Baseline ומספיק Evidence:

1. ‏BOLO / best-available-displayed integration כאשר ה־feed תומך.
2. ‏Multi-level depth.
3. ‏Book imbalance.
4. ‏Depth-weighted spread.
5. ‏Microprice / queue-aware reference prices.
6. ‏Queue-position estimation.
7. ‏Order-flow imbalance.
8. ‏Cancel/add rates.
9. ‏Venue-specific depth.
10. ‏L2/event-stream research למסגרות זמן קצרות יותר.

---

## ‏10. Required Data / Evidence

‏ל־Baseline:

```text
symbol
market-data source
bid
ask
bid size
ask size
last
trade timestamp when available
quote source timestamp
local receive timestamp
session
trading status
candidate decision timestamp
requested order size
```

‏ל־Execution evaluation:

```text
mid at decision
spread at decision
bid/ask at submit
bid/ask at fill
fills and quantities
average fill price
fees
slippage versus chosen benchmark
time to first fill
time to full fill/cancel
post-fill mid markout: 100ms / 1s / 5s / 10s / strategy-relevant horizons
```

‏ל־L2 Challenger:

```text
book levels
venue or aggregation semantics
add/cancel/update timestamps
sampling/event-loss diagnostics
book state reconstruction quality
```

---

## ‏11. Promotion Criteria

### ‏לקידום L2 ל־Baseline dependency

‏נדרוש:

- ‏incremental improvement מול L1 baseline.
- ‏השיפור קיים ב־OOS/forward data.
- ‏השיפור נשאר לאחר realistic execution costs.
- ‏אין dependence על symbol/day בודד.
- ‏ה־data latency וה־processing cost אינם מוחקים את ה־gain.
- ‏ה־feature נשאר מועיל תחת degraded/missing-depth tests.

### ‏לקידום BOLO/best-available-displayed ל־mandatory field

‏נדרוש:

- ‏Provider coverage אמין.
- ‏מדידה שמראה frequency/materiality של better displayed price לעסקאות בגודל שלנו.
- ‏השפעה measurable על execution benchmarks או candidate gating.

### ‏לקידום Queue model

‏נדרוש:

- ‏calibration מול real fills.
- ‏error distribution ידוע.
- ‏שיפור ב־fill-probability prediction.
- ‏לא רק fit היסטורי על prints.

---

## ‏12. Rejection Criteria

‏נזנח Feature/Depth expansion אם:

- ‏הוא משפר gross prediction אך לא Net Edge.
- ‏הוא עובד רק לפני costs/slippage.
- ‏הוא תלוי ב־data leakage או future book state.
- ‏הוא אינו שורד provider change/degraded feed.
- ‏הוא דורש throughput גדול משמעותית בלי benefit חומרי.
- ‏הוא משפר backtest רק בגלל optimistic fill assumptions.
- ‏הוא מוסיף noise/latency שמחמירים את decision age.

---

## ‏13. Metrics

### ‏Primary

- ‏Realized Net Edge.
- ‏Execution-adjusted expected value.
- ‏Fill probability.
- ‏Time to first fill.
- ‏Exit feasibility / realized exit cost.

### ‏Quote / Friction

- ‏`spread_abs`.
- ‏`spread_bps` / `spread_pct`.
- ‏Quote age distribution.
- ‏Bid/Ask/Mid movement over strategy horizons.
- ‏Visible size relative to requested size.
- ‏Locked/crossed/invalid-state rate.

### ‏Execution Quality

- ‏Slippage versus mid/NBBO/chosen reference.
- ‏Effective spread where appropriate.
- ‏Price improvement frequency.
- ‏Partial-fill rate.
- ‏Cancel/no-fill rate.
- ‏Post-fill markout.
- ‏Adverse-selection rate.

### ‏Research Diagnostics

- ‏Incremental value of quotes over last-only baseline.
- ‏Incremental value of L2 over L1.
- ‏Feature ablation by `Bid`, `Ask`, `Mid`, sizes, imbalance.
- ‏Performance by spread/liquidity bucket.

---

## ‏14. Failure Modes

### ‏Last-only illusion

‏ה־momentum נראה חיובי אך ה־Ask כבר רחוק וה־trade אינו executable economically.

### ‏Stale quote

‏ה־Bid/Ask אמיתיים לזמן ישן, אך המערכת מתייחסת אליהם כעת.

### ‏Top-of-book size illusion

‏הכמות המוצגת נעלמת לפני ה־Order או אינה מספיקה לכל הכמות.

### ‏Optimistic passive fill

‏ה־backtest מניח Fill כאשר המחיר נגע ב־Limit, תוך התעלמות מה־queue.

### ‏Hidden-liquidity misunderstanding

‏המודל מפרש displayed book כאילו הוא כל הנזילות.

### ‏Book-imbalance overfit

‏imbalance נראה predictive בדגימה מסוימת אך נשבר OOS או תחת event-complete data.

### ‏Odd-lot blind spot

‏Reference המבוסס NBBO בלבד מפספס displayed odd-lot price טוב יותר.

### ‏Round-lot hardcoding

‏מערכת מניחה 100 shares לכל symbol ומפרשת quote/size semantics באופן שגוי במניות יקרות.

### ‏Reference-price drift

‏חלק מהמחקר משתמש ב־Last, חלק ב־Mid וחלק ב־NBBO בלי metadata ברור, ולכן metrics אינם comparable.

### ‏Data-source mismatch

‏Signal feed ו־execution benchmark מגיעים ממקורות עם coverage/latency שונים, והמסקנה מיוחסת בטעות לאסטרטגיה.

---

## ‏15. User-Specific Application

‏עבור הרובוט שלנו:

```text
Momentum candidate
      ↓
Quote freshness check
      ↓
Bid/Ask/Spread check
      ↓
Size/executability check
      ↓
Absolute execution gate
      ↓
TRADE / NO TRADE
```

‏המשמעות החשובה ביותר:

> ‏המניה שעלתה הכי מהר אינה בהכרח המניה שבה נשאר ה־Net Edge הטוב ביותר לאחר מחיר הכניסה והיציאה האפשריים.

‏לכן recommendation ברמת Scanner היא:

```text
Do not replace momentum with spread.
Do not ignore spread because momentum is strong.
Model both prediction and executability.
```

---

## ‏16. Concrete Baseline Contract

‏בשלב הראשון Candidate רשאי להגיע ל־Order layer רק אם:

```text
bid known
AND ask known
AND bid < ask
AND quote timestamp known
AND quote age <= supported freshness budget
AND trading status normal
AND spread metrics computable
AND requested size known
AND top-of-book state usable for size check
AND execution economics still feasible
=> candidate may continue

otherwise
=> NO TRADE / DATA INVALID
```

‏ה־thresholds המספריים עצמם אינם נקבעים כאן. הם ייגזרו ממחקר ויחוברו ל־risk/execution policy בהמשך.

---

## ‏17. Confidence

### ‏High

‏ביחס ל־:

- ‏לא להשתמש ב־Last כמחיר executable.
- ‏שמירת Bid/Ask/Sizes/Timestamps כ־Baseline.
- ‏מדידת Spread ביחידות מוחלטות ומנורמלות.
- ‏Mid כ־benchmark ולא כהבטחת Fill.
- ‏Quote freshness כ־Gate.
- ‏Queue uncertainty ב־passive fills.
- ‏הפרדת Signal מ־Execution.
- ‏L1 לפני L2 עבור broad-universe baseline.

### ‏Medium

‏ביחס ל־:

- ‏כמה ערך BOLO יוסיף בפועל לעסקאות הקטנות שלנו.
- ‏איזה L2 Features, אם בכלל, ישפרו Net Edge.
- ‏כמה queue modeling נדרש מעבר ל־conservative fill model.

‏אלו נושאים אמפיריים.

---

## ‏18. Time-Sensitive Facts

‏לפני Live/Production צריך לאמת מחדש:

1. ‏Round-lot assignments וה־Reg NMS definitions הפעילים.
2. ‏BOLO / odd-lot dissemination semantics של SIP/provider.
3. ‏Minimum pricing increments / tick-size implementation status.
4. ‏Access-fee caps.
5. ‏Trade-through / locked-crossed rules — במיוחד משום שב־2026 קיימות הצעות שינוי רגולטוריות פעילות.
6. ‏Exchange-specific price/time/display priority rules.
7. ‏Provider-specific L1/L2 aggregation semantics.
8. ‏IBKR/IBKR Israel market-data entitlements ו־feed behavior.

---

## ‏19. Current Verification Snapshot — 2026-10-26

‏נבדק מול מקורות רשמיים עדכניים:

- ‏`SEC Rule 600(b)(93)`: round lot הוא price-tiered `100/40/10/1` לפי average closing-price bands.
- ‏הגדרת round lot החדשה יושמה בנובמבר 2025.
- ‏`BOLO` החל להיות מופץ על ידי ה־SIPs ב־2026-04-27.
- ‏הפצת full MDI odd-lot information מעבר ל־BOLO קיבלה relief עד מאי 2028.
- ‏`SEC Rule 605 FAQ`: best available displayed price צריך להביא בחשבון best odd-lot order כאשר המידע מופץ.
- ‏ב־2026 ה־SEC האריך את compliance ל־amended `Rule 612` tick sizes ו־`Rule 610(c)` access-fee caps עד יום העסקים הראשון של נובמבר 2027.
- ‏Nasdaq מתאר Price/Time model שבו displayed orders באותו מחיר מבוצעים לפי זמן, ו־non-displayed shares מאחוריהם באותו מחיר.
- ‏ב־2026 קיים SEC proposal לשינוי/ביטול חלקים מ־Reg NMS trade-through/locked-crossed framework; Proposal אינו Fact סופי ולכן אין לקודד את התוצאה העתידית כאילו כבר התקבלה.

---

## ‏20. Relationship to Later Recommendation Sheets

‏מקטע 03 קובע מהו Price/Quote/Book baseline.

‏ההמשך יפרט:

- ‏`04` — איזה Order type/tactic להשתמש מול הספר.
- ‏`05` — איזה Data Provider/Feed מספיק ומה coverage הנדרש.
- ‏`06` — latency/freshness budgets ו־event/snapshot model.
- ‏`10–11` — activity, volume, liquidity ו־executability.
- ‏`13–15` — איך להפוך Quote/Book data ל־Features/Ranking/Gates.
- ‏`16–18` — entry, exit ו־true execution costs.
- ‏`21` — realistic fill/backtest modeling.

---

# ‏Recommendation Summary

```text
P0  No live execution decision from Last alone
P0  Quote age must be known and supported
P0  Invalid / locked / crossed / unknown quote state => gate
P0  Passive fill must not be assumed from price touch
P1  L1 Bid/Ask/Last/Sizes/Timestamps as broad-universe baseline
P1  Mid as benchmark, not guaranteed executable price
P1  Spread as friction/execution input
P1  Size-aware execution feasibility
P1  Separate Signal Quality from Execution Quality
P1  Persist quote state + fill/markout evidence
P2  BOLO / best-available-displayed integration when useful
P3  L2 / book imbalance / queue models as measured challengers
P4  Venue-specific full-depth microstructure models only if evidence justifies
```

> ‏**המלצת ה־Baseline: עבור רובוט של Edge קטן וקצר, “המחיר” אינו `Last`. ה־Baseline צריך לראות `Bid/Ask`, לדעת בני כמה ה־quotes, להבין את ה־spread והכמות הזמינה, ולהפריד בין תנועה מעניינת לבין עסקה שבאמת ניתנת לביצוע. מתחילים ב־L1 איכותי ומדוד; מוסיפים L2 רק אם הנתונים מוכיחים שהוא משפר Net outcome.**
