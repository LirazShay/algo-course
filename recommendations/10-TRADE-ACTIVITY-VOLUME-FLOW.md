# ‏10 — Recommendation Sheet: Trade Activity / Volume / Flow

> ‏מקור לימודי עיקרי: `../10-TRADE-ACTIVITY-VOLUME-AND-FLOW.md`.
>
> ‏מטרת הקובץ: לקבוע אילו מדדי פעילות צריכים להיות Baseline עבור רובוט `Short-Horizon Momentum`, איך להפריד בין פעילות מוחלטת, פעילות יחסית והאצת פעילות, איך להימנע מהסקה שגויה ש־"יותר עסקאות = עסקה טובה", ואיך לבדוק האם פעילות מוסיפה `forward executable edge` מעבר למומנטום המחיר שכבר הוגדר במקטעים 08–09.

---

## ‏1. Decision

‏איך לתאר את **עוצמת ההשתתפות בשוק עכשיו** כך שנוכל להבחין בין:

```text
price move supported by broad recent activity
price move caused by very few prints
activity burst that precedes price
activity burst that merely follows price
sustained activity
activity deceleration
stale / missing activity data
```

‏בלי לבלבל בין:

```text
Activity
Direction
Liquidity
Executability
```

‏ובלי להפוך `trade_count`, ‏`volume` או `RVOL` ל־BUY rule לפני Evidence.

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`: ארבע משפחות בסיס נפרדות

‏ל־Wide Scanner נתחיל מארבע משפחות פשוטות:

```text
A. trade count
B. share volume
C. dollar volume
D. activity freshness
```

‏דוגמה ראשונית:

```text
trades_1s
trades_5s
trades_10s
trades_30s

volume_1s
volume_5s
volume_10s
volume_30s

dollar_volume_5s
dollar_volume_10s
dollar_volume_30s

last_trade_age_ms
```

‏`60s` נשמר כ־context נוסף כאשר הוא מועיל, אבל אין חובה שכל Feature יופיע בכל Horizon.

### ‏`P1 — Preferred Default`: Trade Count ו־Volume נשמרים בנפרד

‏אסור להחליף אחד בשני.

```text
1 trade × 10,000 shares
```

‏אינו אותו מצב כמו:

```text
200 trades × 50 shares
```

‏גם אם:

```text
total_volume = 10,000 shares
```

‏לכן נשמור את שני הממדים ונאפשר למחקר לבדוק Interaction ביניהם.

### ‏`P1 — Preferred Default`: Dollar Volume להשוואה בין מחירים שונים

‏כאשר יש מחיר תקין לאירוע/חלון:

```text
dollar_volume ≈ sum(trade_price × trade_size)
```

‏אם ב־Wide Feed יש רק Bar aggregates, ניתן להשתמש בקירוב מתועד — אבל חובה לשמור את שיטת החישוב ב־`feature_version`.

‏אין להניח שמספר מניות זהה מייצג אותה עוצמה כספית בין מניה זולה ליקרה.

### ‏`P1 — Preferred Default`: Absolute Activity + Recent-vs-Previous

‏נשמור גם רמה מוחלטת וגם שינוי בקצב.

‏לדוגמה:

```text
previous_5s_trades
recent_5s_trades
trade_count_delta_5s = recent_5s_trades - previous_5s_trades

previous_5s_volume
recent_5s_volume
volume_delta_5s = recent_5s_volume - previous_5s_volume
```

‏ה־Baseline משתמש קודם ב־`difference`, לא ב־ratio בלבד.

### ‏`P1 — Preferred Default`: Ratio לעולם אינו עומד לבדו

‏דוגמה:

```text
previous = 1 trade
recent   = 4 trades
ratio    = 4x
```

‏ה־ratio נראה גדול אבל הרמה המוחלטת עדיין זעירה.

‏לכן אם נשתמש ב־ratio:

```text
absolute activity
+
ratio / relative change
```

‏חייבים להופיע יחד.

‏בנוסף נדרש denominator floor מפורש.

### ‏`P0 — Required for Valid Research`: No Trades != No Data

‏כל Activity Feature חייב להיות קשור למצב Feed.

```text
zero_trade_count
```

‏תקף רק אם אנחנו יודעים שהחלון כוסה.

‏אם יש disconnect, gap, subscription failure, provider degradation או timestamp discontinuity:

```text
activity_feature = missing / invalid
```

‏ולא:

```text
activity_feature = 0
```

### ‏`P0 — Required for Valid Research`: Coverage Metadata חלק מה־Feature Contract

‏לכל Event/aggregate משמעותי צריך לדעת, ככל שהספק מאפשר:

```text
provider
feed
coverage_scope
venue_scope
subscription_mode
real_time / delayed state
source_timestamp
receive_timestamp
```

‏`40 trades` מ־Feed חלקי אינם שקולים אוטומטית ל־`40 trades` מ־Feed מאוחד יותר.

### ‏`P1 — Preferred Default`: Activity אינה Direction

‏לעולם לא נפרש:

```text
high trade rate
```

‏כ־:

```text
bullish
```

‏Direction נשארת ממשפחת Price Features של 08–09.

‏Activity היא Context נפרד.

### ‏`P1 — Preferred Default`: Activity אינה Liquidity

‏גם מניה עם הרבה Prints יכולה להיות בעלת:

```text
wide spread
small executable size
poor exit conditions
```

‏לכן Activity אינה מחליפה את מקטע 11 (`Liquidity / Executability`).

### ‏`P1 — Preferred Default`: Last Trade Age כ־Freshness/Activity Feature

‏נשמור:

```text
last_trade_age_ms
```

‏הוא עונה על שאלה שונה מ־`trades_5s`:

> ‏האם ראינו Trade ממש עכשיו, או שכל הפעילות נמצאת בתחילת החלון?

‏הוא אינו Hard Gate אוניברסלי לפני Evidence, אבל הוא Input חשוב מאוד ל־freshness ולהבנת decay של פעילות.

### ‏`P2 — Challenger`: Relative Activity לעומת baseline של אותה מניה

‏לאחר Baseline אפשר להוסיף:

```text
relative_trade_rate
relative_volume
RVOL
```

‏אבל baseline היסטורי חייב להיות session/time-of-day aware.

‏למשל:

```text
10:05 ET today
vs
10:05 ET on comparable sessions
```

‏ולא מול ממוצע אקראי של כל היום.

### ‏`P2 — Challenger`: Activity Acceleration

‏בדומה למחיר:

```text
recent_5s_trades - previous_5s_trades
recent_5s_volume - previous_5s_volume
```

‏יכול לתאר פעילות שמתחזקת או נחלשת.

‏Promotion רק אם הוא מוסיף ערך מעבר ל־absolute activity ול־price momentum.

### ‏`P2 — Challenger`: Average / Distribution of Trade Size

‏אפשר להתחיל מ־:

```text
average_trade_size = volume / trade_count
```

‏אבל ממוצע רגיש ל־outliers.

‏כאשר יש individual trades, אפשר לבדוק:

```text
median_trade_size
p90_trade_size
max_trade_size
trade_size_dispersion
```

‏הם אינם נדרשים ל־MVP הרחב.

### ‏`P2 — Challenger`: Inter-Arrival Time

‏כאשר יש timestamps לכל Trade:

```text
median_inter_arrival_ms
p90_inter_arrival_ms
min_inter_arrival_ms
```

‏עשויים לתת מידע עשיר יותר על קצב פעילות מאשר Count בלבד.

‏אבל הם דורשים feed event-level נקי ורציף ולכן אינם Baseline לכל 4,000 symbols.

### ‏`P2 — Challenger`: Lead / Lag בין Activity ל־Price

‏אחת משאלות המחקר החשובות:

```text
activity burst
→ then price continuation
```

‏לעומת:

```text
price jump
→ then activity arrives
```

‏נרצה למדוד האם Activity באמת מקדימה `forward return`, או רק מאשרת מהלך שכבר הסתיים.

### ‏`P3 — Advanced Challenger`: Buyer-Like / Seller-Like Trade Classification

‏כאשר יש Trade + contemporaneous quote אפשר לסווג בקירוב:

```text
trade near ask -> buyer-like
trade near bid -> seller-like
```

‏ואז לחשב למשל:

```text
buy_like_volume
sell_like_volume
signed_trade_imbalance
```

‏אבל זה **Inference**, לא ידיעה ודאית של intent.

‏אין להכניס ל־Baseline לפני בדיקת דיוק, quote synchronization ו־incremental predictive value.

### ‏`P3 — Advanced Challenger`: Quote Update Activity

‏בהמשך אפשר למדוד:

```text
quote_updates_1s
bid_updates_1s
ask_updates_1s
size_updates_1s
```

‏זה יכול לשפר microstructure context, אך מגדיל משמעותית Data Rate, Provider dependence ומורכבות.

### ‏`P1 — Preferred Default`: Wide Cheap Scan → Deep Event Observation

‏ארכיטקטורת Baseline:

```text
ALL ELIGIBLE SYMBOLS
→ rolling activity aggregates
→ cheap activity + price features
→ shortlist
→ richer trade-by-trade / quote context only for top candidates
```

‏אין צורך לשמור full event stream עשיר לכל Symbol רק כדי לחשב Wide Scanner ראשוני.

---

## ‏3. Why

### ‏Fact

‏`Trade Count`, ‏`Volume` ו־`Dollar Volume` מודדים ממדים שונים של פעילות.

### ‏Fact

‏פעילות גבוהה אינה קובעת את כיוון המחיר.

### ‏Fact

‏פעילות גבוהה אינה מבטיחה spread קטן, executable size מספיק או Fill טוב.

### ‏Fact

‏Activity aggregates תלויים בכיסוי ובסמנטיקה של ה־Feed.

### ‏Fact

‏יחס גדול יכול להיווצר מבסיס קטן מאוד ולכן Ratio ללא Absolute Level עלול להטעות.

### ‏Fact

‏הקצב הרגיל של השוק משתנה לאורך יום המסחר, ולכן baseline יחסי שאינו time-of-day aware עלול לערבב regimes שונים.

### ‏Judgment

‏לרובוט שלנו Trade Count צריך להיות Feature מרכזי במחקר, מפני שהוא מספק מידע על breadth של participation שאינו קיים ב־Return בלבד.

### ‏Judgment

‏ל־MVP עדיף rolling aggregates פשוטים ורחבים על פני event-level microstructure כבד לכל השוק.

### ‏Hypothesis

‏Price momentum שמלווה ב־rising recent trade rate עשוי להראות `immediate continuation` טוב יותר מאותו price momentum עם פעילות דועכת.

### ‏Hypothesis

‏Activity שמקדימה את תנועת המחיר עשויה להיות שימושית יותר מ־Activity שמופיעה רק אחרי Burst המחיר.

### ‏Hypothesis

‏שילוב של minimum absolute activity עם relative acceleration עשוי להיות יציב יותר מ־ratio לבדו.

---

## ‏4. Use When

‏ה־Baseline מתאים כאשר:

- ‏סורקים Universe רחב וצריך Features זולים לחישוב.
- ‏רוצים להבחין בין move שנוצר ממעט Prints לבין השתתפות רחבה יותר.
- ‏בודקים immediate continuation בטווח שניות.
- ‏רוצים RCA ל־Rank #1 שלא המשיך.
- ‏רוצים לבדוק Interaction בין price momentum לבין market participation.
- ‏רוצים למדוד decay או acceleration של פעילות.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Activity Features לבדם כדי:

- ‏להחליט כיוון.
- ‏להסיק שנזילות טובה.
- ‏להבטיח Fill.
- ‏להחליט Entry אוטומטי.
- ‏להשוות Feeds בעלי Coverage שונה כאילו הם זהים.
- ‏להסיק ש־zero count פירושו שוק שקט כאשר Feed Health אינו ידוע.
- ‏לכפות אותו threshold מוחלט על כל שעות היום בלי בדיקה.

---

## ‏6. Alternatives

| אפשרות | יתרון | חיסרון | מעמד |
|---|---|---|---|
| `Trade Count` בלבד | פשוט וזול | מתעלם מגודל | `Baseline component` |
| `Volume` בלבד | מודד shares | יכול להיווצר מטרייד אחד | `Baseline component` |
| `Dollar Volume` | מנרמל מחיר בקירוב | תלוי באיכות מחיר/aggregation | `Baseline component` |
| Absolute + recent/previous | פשוט, explainable | לא מנרמל להרגלי symbol | **Preferred Default** |
| `RVOL` / relative rate | מזהה חריגות יחסיות | דורש history ו־time-of-day baseline | `P2 Challenger` |
| Trade-size distribution | עשיר יותר | דורש event-level data | `P2 Challenger` |
| Signed trade flow | microstructure context | classification inference | `P3` |
| Quote-update flow | יכול להקדים Prints | data-heavy/provider-sensitive | `P3` |
| ML על event stream | עשוי ללכוד interactions | מורכב, leakage/overfit risk | `Avoid Initially` |

---

## ‏7. Trade-offs

### ‏יותר חלונות

‏יתרון:

- ‏יותר temporal context.

‏חיסרון:

- ‏יותר correlation, complexity ו־multiple testing.

### ‏Event-Level Data

‏יתרון:

- ‏Inter-arrival, trade-size distribution, signed flow ו־lead/lag מדויקים יותר.

‏חיסרון:

- ‏יותר bandwidth, storage, CPU וסמנטיקה provider-specific.

### ‏Relative Baselines

‏יתרון:

- ‏מזהים symbol שמתעורר יחסית לעצמו.

‏חיסרון:

- ‏דורשים historical reference נקי ו־session/regime normalization.

### ‏Smoothing activity

‏יתרון:

- ‏פחות noise.

‏חיסרון:

- ‏lag שעלול להיות יקר באסטרטגיה של שניות.

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏עשרות Activity horizons.
- ‏`RVOL` מורכב בלי historical baseline אמין.
- ‏Buyer/Seller classification לכל השוק.
- ‏Quote-message-rate לכל 4,000 symbols.
- ‏Machine Learning על raw event stream.
- ‏threshold קשיח כמו `trades_10s > 100` רק מאינטואיציה.
- ‏יחס פעילות בלי minimum absolute level.
- ‏קבלת החלטה רק לפי Daily Volume.
- ‏הנחה שכל Provider סופר Trades/Volume באותה צורה.

---

## ‏9. What to Add Later

‏לאחר שה־Baseline מראה ערך:

```text
relative activity by time-of-day
activity percentile across universe
trade-size distribution
inter-arrival distribution
activity lead/lag features
signed trade imbalance
quote-update intensity
venue-specific activity
cross-feed consistency checks
activity-regime features
```

‏כל תוספת עוברת Ablation מול ה־Baseline.

---

## ‏10. Required Data / Evidence

### ‏Raw / Aggregate Inputs

‏לפי Capability:

```text
symbol
trade_event_time
trade_receive_time
trade_price
trade_size
provider/feed/coverage metadata
quote context when available
session
```

‏או ב־aggregate feed:

```text
window_start
window_end
trade_count
volume
representative price / dollar volume method
coverage status
```

### ‏Feature Record

```text
symbol
as_of_time
feature_set_version
provider/feed
coverage_scope

trades_1s
trades_5s
trades_10s
trades_30s

volume_1s
volume_5s
volume_10s
volume_30s

dollar_volume_5s
dollar_volume_10s

previous_5s_trades
recent_5s_trades
trade_count_delta_5s

previous_5s_volume
recent_5s_volume
volume_delta_5s

last_trade_age_ms
activity_data_quality
```

### ‏Research Labels

‏לבדיקת Immediate Continuation:

```text
forward_return_1s
forward_return_2s
forward_return_5s
forward_return_10s
forward_return_30s
forward_return_60s

MFE_5s / 10s / 30s
MAE_5s / 10s / 30s
```

‏בנוסף, כאשר בונים simulation בר־ביצוע:

```text
time_to_first_executable_profit
time_to_target
time_to_failure_or_expiry
net_outcome_after_costs
```

### ‏Data Quality Evidence

‏חובה לדעת:

```text
coverage gaps
feed disconnects
late events
duplicate/corrected events when relevant
session boundaries
provider aggregation semantics
```

---

## ‏11. Promotion Criteria

### ‏Activity Feature חדש יקודם רק אם

1. ‏מוסיף predictive value מעבר ל־Price Momentum של 08–09.
2. ‏השיפור מופיע Out-of-Sample / Forward validation.
3. ‏הערך נשמר לאחר spread, slippage, latency ועמלות כאשר מגיעים למודל Execution.
4. ‏הוא יציב ביותר מיום/שעה/Regime בודדים.
5. ‏הוא אינו תלוי באופן שברירי ב־Feed מסוים בלי להבין למה.
6. ‏איכות הנתונים וה־coverage מאפשרות שחזור.
7. ‏העלות החישובית/תפעולית מוצדקת ביחס לערך.

### ‏Relative Activity יקודם אם

```text
absolute baseline
vs
absolute + relative
```

‏מראה Improvement עקבי ולא רק התאמה לדאטה היסטורי.

### ‏Deep Flow Feature יקודם אם

‏הוא מוכיח incremental value מול Wide aggregates מספיק גדול כדי להצדיק event-level complexity.

---

## ‏12. Rejection Criteria

‏נדחה Feature או Rule אם:

- ‏הוא עובד רק על Feed אחד בגלל Coverage artifact.
- ‏היתרון נעלם כשמנטרלים time-of-day.
- ‏הוא מוסיף correlation אך לא incremental predictive value.
- ‏ratio נשלט על ידי near-zero denominators.
- ‏הוא מעלה hit rate אבל מוריד net outcome.
- ‏הוא מזהה בעיקר Activity שהגיעה **אחרי** המהלך.
- ‏הוא רגיש מדי ל־single large print.
- ‏הוא נשבר ב־Out-of-Sample.
- ‏הוא דורש מורכבות גבוהה עבור שיפור זניח.

---

## ‏13. Metrics

### ‏Primary Research Metrics

```text
forward executable return by activity bucket
median forward return
positive-forward rate
MFE
MAE
time_to_first_executable_profit
time_to_target
net outcome after costs
```

### ‏Activity Diagnostics

```text
trade count distribution
volume distribution
dollar-volume distribution
last-trade-age distribution
recent-vs-previous deltas
activity percentile
activity-data missing rate
```

### ‏Incremental Value

‏נמדוד לפחות:

```text
price-only baseline
vs
price + trade count
vs
price + trade count + volume
vs
price + activity acceleration
```

‏כך נדע מה באמת מוסיף מידע.

### ‏Funnel Metrics

```text
eligible symbols
symbols with valid activity data
symbols passing any research activity bucket
final candidates
```

‏קריסה ב־valid activity coverage היא גם Data Health signal.

---

## ‏14. Failure Modes

### ‏א. No Data interpreted as No Trades

‏תקלה ב־Feed יוצרת Activity נמוכה מזויפת.

### ‏ב. Cumulative Volume interpreted as Window Volume

‏ערך יומי מצטבר נכנס בטעות ל־Feature קצר.

### ‏ג. Different Feed Coverage compared directly

‏השוואת Counts בין מקורות בעלי Coverage שונה כאילו הם אותו Dataset.

### ‏ד. Large Ratio from Tiny Denominator

‏`1 → 5 trades` נראה `5x` למרות שהרמה עדיין נמוכה.

### ‏ה. One Huge Trade dominates Volume

‏Volume גבוה ללא participation רחבה.

### ‏ו. Many Tiny Trades misread as Executability

‏Trade Count גבוה אך spread/size עדיין גרועים.

### ‏ז. Activity after Price mistaken for Leading Signal

‏Feature נראה חזק כי הוא מגיב למהלך שכבר קרה.

### ‏ח. Session Mixing

‏השוואת open activity ל־midday baseline בלי normalization.

### ‏ט. Stale Rolling Window

‏Features לא מתקדמים בזמן אך נשארים בזיכרון ונראים תקינים.

### ‏י. Event duplication / correction mishandling

‏אם ה־Feed מספק תיקונים/כפילויות ולא מנרמלים נכון, Count ו־Volume מתנפחים.

### ‏יא. Trade direction inference treated as truth

‏buyer-like/seller-like classification מוצגת כעובדה במקום heuristic.

### ‏יב. Feature explosion

‏עשרות וריאציות כמעט זהות מגדילות Overfitting ותחזוקה בלי מידע חדש.

---

## ‏15. User-Specific Application

‏לרובוט שלנו, שמחפש broad-market candidate עם `milliseconds → seconds → tens of seconds` של Edge, הייתי מתחיל כך:

```text
Wide Universe
→ price/momentum eligibility
→ activity aggregates:
   trades_1s / 5s / 10s / 30s
   volume_5s / 10s / 30s
   dollar_volume_10s
   last_trade_age_ms
   recent-vs-previous trade/volume delta
→ keep raw values separate
→ candidate shortlist
→ deeper execution/liquidity check
→ TRADE / NO TRADE
```

‏לשלב המחקר הראשון לא הייתי נותן Activity Weight קבוע בתוך Score.

‏במקום זאת נבדוק Buckets/Interactions כגון:

```text
strong price momentum
+
high absolute trade activity
```

‏מול:

```text
strong price momentum
+
rising activity
```

‏ומול:

```text
strong price momentum
+
low / decaying activity
```

‏המטרה היא לגלות מה מנבא המשך **לאחר זמן הבחירה**, לא מה מסביר יפה את העלייה שכבר קרתה.

### ‏Rank #1 failure analysis

‏כאשר Rank #1 אינו ממשיך מיד, נשמור לפחות:

```text
price features
activity features
activity trend
last_trade_age
feed/coverage state
next-best candidates
forward outcomes
```

‏כך נוכל לבדוק האם Activity הייתה חסרה, מאוחרת, דועכת או פשוט לא predictive במקרה הזה.

---

## ‏16. Concrete Baseline Contract

### ‏Wide Activity State

```text
ActivityState {
    symbol
    as_of_time
    feature_version
    provider
    coverage_scope
    data_quality

    trades_1s
    trades_5s
    trades_10s
    trades_30s

    volume_5s
    volume_10s
    volume_30s

    dollar_volume_10s
    last_trade_age_ms

    previous_5s_trades
    recent_5s_trades
    trade_count_delta_5s

    previous_5s_volume
    recent_5s_volume
    volume_delta_5s
}
```

### ‏Validity Contract

```text
feed_healthy
AND coverage_known
AND timestamps_valid
AND rolling_window_current
=> activity features usable

otherwise
=> activity features invalid / missing
```

### ‏Research Contract

```text
activity feature at T0
+
price feature at T0
+
NO future information
→ forward labels after T0
→ compare buckets / ablations
→ only then promote to ranking/filter policy
```

---

## ‏17. Confidence

| החלטה | Confidence |
|---|---|
| Trade Count ו־Volume צריכים להישמר בנפרד | High |
| Activity אינה Direction או Liquidity | High |
| No Data חייב להיות נפרד מ־Zero Activity | High |
| Absolute + recent/previous הוא Baseline טוב למחקר | High |
| Trade Count עשוי להיות Feature חשוב למערכת שלנו | Medium |
| Rising activity תשפר immediate continuation | Low / Unproven |
| `RVOL` time-of-day aware יוסיף ערך | Low / Unproven |
| Signed trade flow יוסיף ערך נטו | Low / Unproven |
| Quote-update intensity יצדיק את העלות | Low / Unproven |

---

## ‏18. Time-Sensitive Facts

‏המקטע עצמו מתודולוגי, אבל לפני Production יש לאמת מחדש מול הספק בפועל:

- ‏מה בדיוק נחשב `trade_count` ב־feed/bar שלו.
- ‏האם `volume` הוא consolidated, venue-specific או subset אחר.
- ‏כיצד הספק מסמן corrections/cancels/late prints.
- ‏מהו timestamp המקורי ומהו timestamp של delivery.
- ‏האם aggregate bars כוללים `trade_count` ומה cadence העדכון.
- ‏כיסוי `IEX / SIP / venue-specific` או כל Feed חלופי שנבחר.
- ‏האם Quote/Trade streams דורשים subscriptions שונים.

‏אסור להפוך semantics כאלה לקבוע ארכיטקטוני בלי verification עדכני.

---

## ‏19. Relationship to Other Recommendation Sheets

### ‏מקטע 08 — Short-Term Momentum

‏08 אומר **כמה המחיר זז**.

‏10 אומר **כמה פעילות השתתפה בזמן שהוא זז**.

### ‏מקטע 09 — Velocity / Acceleration / Shape

‏09 מודד שינוי בקצב המחיר.

‏10 מוסיף שינוי בקצב הפעילות.

‏Interaction ביניהם הוא Hypothesis מחקרי, לא Fact.

### ‏מקטע 11 — Liquidity / Executability

‏10 אינו קובע אם ניתן לבצע את העסקה.

‏11 יחליט האם spread, size ו־exit feasibility מאפשרים אותה בפועל.

### ‏מקטעים 12–14 — Filters / Features / Ranking

‏שם יוחלט אילו Activity Features הופכים Filter, Feature לדירוג או נשארים diagnostics בלבד.

### ‏מקטעים 20–24 — Backtest / Predictive Validation / Experiments

‏שם נבדוק האם Activity באמת מוסיפה `forward executable edge` ולא רק correlation.

---

## ‏20. Minimum Acceptance Tests

### ‏Test 1 — No Events, Healthy Feed

```text
feed healthy
no trades in window
=> trade_count = 0
```

### ‏Test 2 — Feed Gap

```text
feed unhealthy / gap overlaps window
=> trade_count = missing/invalid
```

‏לא `0`.

### ‏Test 3 — Trade Count vs Volume

```text
10 trades × 100 shares
=> trades = 10
=> volume = 1000
```

### ‏Test 4 — Recent vs Previous

```text
previous_5s_trades = 20
recent_5s_trades   = 55
=> trade_count_delta_5s = +35
```

### ‏Test 5 — Ratio Guard

```text
previous = 0
recent = 20
=> ratio not blindly infinite
```

### ‏Test 6 — Window Expiry

‏Trade שיוצא מה־Rolling Window חייב להיגרע בדיוק פעם אחת.

### ‏Test 7 — Session Boundary

‏אין לגרור volume/count מחלון Session קודם אל חלון חדש בטעות.

### ‏Test 8 — Event Replay Determinism

‏אותו ordered event stream צריך לייצר אותם aggregates ואותם feature values.

### ‏Test 9 — Out-of-Order Event Policy

‏אירוע מאוחר צריך להיות מטופל לפי policy מוגדר ולא לשנות Feature בשקט בצורה בלתי ניתנת לשחזור.

### ‏Test 10 — Data Lineage

‏מכל Activity Feature מהותי ניתן להגיע חזרה ל־window, source, coverage ו־feature version שלו.

---

# ‏Recommendation Summary

```text
P0  No Data != No Trades
P0  Coverage / feed health / timestamps are part of validity

P1  Keep Trade Count, Volume, Dollar Volume separate
P1  Use short rolling windows
P1  Store Last Trade Age
P1  Measure absolute activity + recent-vs-previous change
P1  Activity is context, not direction or liquidity
P1  Wide cheap aggregates before deep event-level analysis

P2  Relative activity / RVOL with time-of-day baseline
P2  Activity acceleration
P2  Trade-size distribution
P2  Inter-arrival metrics
P2  Lead/Lag analysis

P3  Buyer-like / seller-like inferred flow
P3  Quote-update intensity

Avoid Initially:
- more activity = BUY
- daily volume as current activity
- ratio without absolute floor
- mixing feeds/coverage blindly
- event-level complexity for whole market without evidence
- ML before simple ablation proves value
```

‏החלטת ה־Baseline של מקטע 10 היא:

> ‏**פעילות היא שכבת Context נפרדת שמודדת participation. נתחיל ב־Trade Count, Volume, Dollar Volume, Last Trade Age ו־recent-vs-previous activity בחלונות קצרים, נדרוש Feed/Coverage validity מפורש, ונקדם Relative/Flow/Microstructure Features רק אם הם מוסיפים Out-of-Sample executable value מעבר למומנטום המחיר.**
