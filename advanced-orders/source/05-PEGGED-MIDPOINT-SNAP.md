# ‏חלק 5 — Pegged, Relative, Midpoint ו־Snap: פקודות שמזיזות את עצמן

## ‏5.1 למה המשפחה הזאת חשובה במיוחד לרובוט

‏ב־Limit רגילה המנוע בוחר מחיר. אם השוק זז, המנוע צריך לבחור האם להישאר, לבטל, להגיש מחדש, לשנות מחיר או לוותר על העסקה.

‏במשפחת `Pegged` אנחנו מוסרים חלק מהחלטת המחיר ל־Broker/Venue באמצעות כלל דינמי:

```text
reference price
+/- offset
bounded by hard cap
```

‏זה יכול להיות חזק במיוחד למנוע של שניות, כי הוא מצמצם `cancel/replace` מקומי ומאפשר לפקודה להתאים את עצמה לשוק מהר יותר מהלולאה שלנו.

‏אבל המחיר של האוטומציה הוא אובדן חלק מהשליטה. לכן כל כלי במשפחה נבחן אצלנו לפי חמש שאלות:

```text
What is the reference?
Does price move once or continuously?
Who performs the repricing?
What is the hard economic boundary?
What happens when the signal dies before the order does?
```

---

## ‏5.2 ארבע משפחות שנשמעות דומות אך פותרות בעיות שונות

‏צריך להפריד בין:

```text
Relative / Pegged-to-Primary
Pegged-to-Midpoint
MidPrice
Snap family
```

‏באופן רעיוני:

| משפחה | Reference | Repricing מתמשך? | מי מנהל | מטרה מרכזית |
|---|---|---:|---|---|
| `Relative/Pegged-to-Primary` | ‏הצד שלנו ב־NBBO | ‏כן | Broker/Venue | ‏להישאר liquidity provider אגרסיבי |
| `Pegged-to-Midpoint` | ‏אמצע ה־NBBO | ‏כן | Venue/Broker path | ‏לבקש midpoint price improvement |
| `MidPrice` | ‏midpoint-or-better | ‏כן, כחלק מ־IBKR algo/routing | IBKR | ‏SMART search ל־midpoint execution |
| `Snap` | ‏Bid/Ask/Midpoint ברגע ההגשה | ‏לא | IBKR computes once | ‏מחיר התחלתי חכם בלי continual chase |

‏אותו יעד כללי — מחיר חכם יותר — יכול להוביל ל־state machine שונה לחלוטין.

---

## ‏5.3 `Peg` היא נוסחת מחיר, לא מספר קבוע

‏נניח:

```text
Bid = 50.00
Ask = 50.04
```

‏Limit רגילה:

```text
BUY LMT 50.01
```

‏נשארת 50.01 עד שינוי מפורש.

‏Peg יכולה לומר רעיונית:

```text
BUY = NBB + 0.01
cap = 50.03
```

‏אם ה־NBB עולה ל־50.01, effective price יכולה לעלות ל־50.02. אם ה־NBB ממשיך לעלות, ה־cap אמור לעצור את האגרסיביות בנקודה שקבענו.

‏לכן ברמת המודל צריך לשמור בנפרד:

```text
reference
offset
hard_cap
current_effective_price
```

---

## ‏5.4 `Hard Cap` הוא לא תוספת — הוא תנאי בטיחות

‏Pegged Order ללא גבול כלכלי יכולה להפוך ל־automatic chase.

‏אצלנו ה־cap צריך להגיע מאותו מודל כלכלי של חלק 2:

```text
max_buy_price =
expected_exit
- required_net_edge
- expected_exit_cost
- fees
- safety_margin
```

‏ולא מתוך כלל כמו:

```text
keep following bid + 1 cent forever
```

‏ברובוט קצר־טווח, `offset` קובע **איך לנוע**; `cap` קובע **מתי אסור להמשיך לנוע**.

---

## ‏5.5 `Relative / Pegged-to-Primary` — Passive, אבל לא עצלנית

‏IBKR מתארת `Relative`, הידועה גם כ־`Pegged-to-Primary`, כפקודה שמנסה להיות אגרסיבית יותר מה־NBBO תוך כדי הוספת נזילות.

‏בקנייה הרעיון הוא בקירוב:

```text
NBB + offset
```

‏ובמכירה:

```text
NBO - offset
```

‏ה־offset מאפשר לנו לשפר את המחיר מול התור הקיים בלי לנהל כל שינוי Quote ידנית.

‏זה הופך אותה לרלוונטית מאוד לרובוט שלנו, משום שהיא קרובה לטקטיקה של "להיצמד למוביל" — אבל ה־repricing rule חי אצל Broker/Venue ולא רק אצלנו.

---

## ‏5.6 `Relative` מול Join רגיל

‏נניח:

```text
Bid = 20.00
Ask = 20.04
```

‏Join רגיל:

```text
BUY LMT 20.00
```

‏Relative עם offset של tick:

```text
BUY near NBB + 0.01
```

‏היתרון הפוטנציאלי הוא Queue Position טובה יותר דרך price improvement.

‏המחיר:

- ‏מוותרים על חלק מה־spread.
- ‏עלולים לחשוף urgency.
- ‏עלולים להעלות את ה־NBBO.
- ‏ה־order יכולה להמשיך לזוז גם כאשר ה־Signal שלנו כבר נחלש.

‏לכן `Relative` היא Execution Policy אקטיבית, לא פשוט "Limit יותר חכמה".

---

## ‏5.7 פרט קריטי ב־IBKR: `SMART Relative` אינה סימטרית

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
Directed Relative:
floats both ways with the market
```

‏אבל ב־`SMART`:

```text
BUY:
NBB up   -> order can move up
NBB down -> no automatic downward adjustment

SELL:
NBO down -> order can move down
NBO up   -> no automatic upward adjustment
```

‏זו אינה הערת שוליים. היא משנה את הסיכון.

‏BUY SMART Relative שעלתה עם ה־Bid יכולה להישאר במחיר אגרסיבי יותר גם אחרי שה־Bid נסוג. לכן מנוע שמניח "הפקודה תמיד צמודה ל־Bid" יכול לטעות בדיוק ברגע שבו המומנטום נחלש.

---

## ‏5.8 למה הא־סימטריה הזו יכולה להיות שימושית — ומסוכנת

‏היתרון האפשרי: היא לא נסוגה מיד מכל ירידה קטנה ב־Bid ולכן אינה מאבדת אגרסיביות/מיקום בכל noise.

‏הסיכון: היא יכולה להשאיר אותנו קרובים מדי לצד הנגדי אחרי deterioration אמיתי.

‏לכן ב־SMART Relative צריך guardrail מקומי:

```text
if current_reference_deteriorates materially:
    re-evaluate edge
    cancel if old effective price is no longer justified
```

‏כלומר גם כאשר Broker מנהל repricing, המנוע שלנו עדיין מנהל **validity**.

---

## ‏5.9 Zero Offset אינו אומר "Order רגילה"

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־Relative עם `0` offset יכולה להיות מוצבת ב־best bid/ask ולהמשיך לנוע עם ה־inside quote בהתאם ל־route semantics.

‏לכן:

```text
Relative(offset=0)
!=
static Limit at current Bid/Ask
```

‏הראשונה היא dynamic price rule; השנייה היא מחיר קבוע.

‏זה distinction מצוין ל־A/B test אצלנו.

---

## ‏5.10 Percentage Offset ו־Tick Rounding

‏IBKR מאפשרת גם offset באחוזים בחלק מהקשרים, ואז היא צריכה לעגל את המחיר ל־tick חוקי.

‏למניות אמריקאיות מעל $1, שינוי קטן מאוד בחישוב יכול להיתרגם ל־tick שלם.

‏מכאן ש־Execution Engine חייב לדעת:

```text
requested theoretical peg price
actual allowed tick price
rounding direction
```

‏ולא להשוות Backtest theoretical price ל־Live price כאילו הם תמיד זהים.

---

## ‏5.11 `Relative` ו־Queue Priority

‏יתרון אפשרי מול client-side chase הוא שפחות פעולות `cancel/replace` נעשות אצלנו.

‏אבל אסור להסיק מכך שה־queue age נשמר תמיד כאשר effective price משתנה.

‏Priority היא Venue-specific.

‏לכן נשמור:

```text
reprice_count
price_level_count
time_at_current_level
fill_after_reprice
```

‏ונמדוד במקום להניח.

---

## ‏5.12 `Relative` מול Client-Side Chase

‏Client-side chase נראה כך:

```text
read quote
place limit
quote moves
cancel
reconcile
replace
repeat
```

‏הוא נותן לנו שליטה מלאה, אבל יוצר:

- ‏יותר messages.
- ‏יותר cancel/fill races.
- ‏יותר חלונות שבהם quote כבר השתנה לפני replacement.
- ‏אפשרות לאיבוד queue priority.
- ‏יותר קוד recovery.

‏`Relative` מעבירה חלק מהלולאה הזאת החוצה.

‏אבל מבחינתנו היא עדיפה רק אם:

```text
broker semantics
+
route behavior
+
cap
+
TTL
```

‏תואמים בדיוק את ה־Execution Intent שלנו.

---

## ‏5.13 Pegged Automation אינה Signal Automation

‏זו אחת הנקודות החשובות ביותר בחלק הזה:

```text
Broker knows quote movement.
Broker does not know our alpha died.
```

‏ה־Order יכולה לבצע repricing מושלם מול NBBO ובכל זאת להיות עסקה גרועה מפני שה־Signal שלנו התהפך.

‏לכן כל Pegged mode דורש:

```text
application_ttl
signal_decay_cancel
market_data_freshness_guard
hard_cap
position_guard
```

---

## ‏5.14 `Pegged-to-Midpoint` — לעקוב אחרי אמצע ה־NBBO

‏ה־midpoint הוא:

```text
mid = (NBB + NBO) / 2
```

‏אם:

```text
Bid = 50.00
Ask = 50.04
```

‏אז:

```text
Mid = 50.02
```

‏מבחינת BUY, Fill ב־50.02 במקום 50.04 חוסך חצי Spread מול לקיחת ה־Ask.

‏כאשר Edge צפוי קטן, שתי אגורות כאלה יכולות לשנות מהותית את `round-trip net edge`.

---

## ‏5.15 למה Midpoint הוא לא "Bid משופר"

‏Midpoint liquidity היא עולם ביצוע שונה.

‏ב־displayed Bid אנחנו נחים בספר הגלוי.

‏ב־midpoint אנחנו מחפשים contra liquidity שמוכנה להיפגש בתוך ה־spread, לעיתים במסגרת non-displayed execution.

‏לכן יכול להיות:

```text
excellent price improvement
but low fill probability
```

‏וזה בדיוק trade-off שמנוע של שניות חייב למדוד.

---

## ‏5.16 `Pegged-to-Midpoint` ב־IBKR — Routing משנה הכול

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת את `Pegged-to-Midpoint` עבור Stocks, ETFs ו־Options ב־`TWS` וב־`IBKR Desktop`.

‏לפקודות מניה אמריקאיות, IBKR דורשת **Direct Routing** כדי להשתמש בפקודה הזו.

‏היא אינה שקולה ל־:

```text
SMART + midpoint preference
```

‏וזו בדיוק הסיבה שצריך להבדיל בינה לבין `MidPrice`.

---

## ‏5.17 Offset ב־Pegged-to-Midpoint אינו Capability אחידה

‏IBKR מציינת שרוב ה־venues, כולל דוגמאות כגון NASDAQ/ISLAND, אינם מקבלים offset מה־midpoint בפקודה הרגילה הזו.

‏ללא offset יש להזין `0`/`0.0` ב־TWS.

‏לכן המנוע לא צריך לבנות Policy שתלויה ב־:

```text
midpoint + arbitrary offset
```

‏בלי לבדוק Destination capability אמיתי.

---

## ‏5.18 Price Cap ב־Pegged-to-Midpoint

‏גם כאן ניתן להגדיר Limit Price כ־cap.

‏זה מאפשר שילוב מקצועי:

```text
follow midpoint
but never exceed economic boundary
```

‏עבור BUY:

```text
midpoint may rise
order may follow
but cap stops further aggressiveness
```

‏כך ה־Peg מנהלת micro-pricing וה־engine שומר את economics.

---

## ‏5.19 למה Midpoint יכולה לפספס בדיוק את המניה הכי חזקה

‏במומנטום חזק, הצד השני לא חייב להסכים לתת לנו midpoint.

‏נניח שה־Ask כל הזמן נלקחת והמחיר מטפס. Order שמחכה באמצע ה־spread יכולה להישאר ללא Fill בזמן שהמהלך בורח.

‏לכן midpoint אינה "כניסה זולה יותר" בלבד. היא wager על כך שה־fill probability וה־price improvement יחד עדיפים על missed-move cost.

‏נמדוד:

```text
midpoint_fill_rate
midpoint_time_to_fill
price_improvement
missed_move_on_no_fill
markout_after_fill
```

---

## ‏5.20 `MidPrice` — דומה בשם, שונה בארכיטקטורה

‏`MidPrice` היא IBKR Smart-routed execution mechanism שנועד לנסות לקבל את midpoint של ה־NBBO או מחיר טוב יותר, עם Price Cap אופציונלי.

‏כלומר:

```text
Pegged-to-Midpoint = directed order behavior
MidPrice            = IBKR SMART routing/algo behavior
```

‏זה הבדל גדול מאוד עבור המנוע.

---

## ‏5.21 מה IBKR עושה בתוך `MidPrice`

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת ש־MidPrice מנסה לנתב ל־exchange בעל הסתברות גבוהה למלא כ־`Pegged-to-Midpoint`; ב־IEX היא יכולה להשתמש ב־`D-Peg`. אם אין exchange מתאים, היא יכולה לנתב כ־native או simulated `Relative` order.

‏כלומר `MidPrice` איננה primitive אחד.

‏היא policy של Broker שיכולה לבחור execution path שונה לפי מצב השוק והיעדים הזמינים.

---

## ‏5.22 למה זה טוב לרובוט

‏במקום שהמנוע שלנו יצטרך לבחור בעצמו:

```text
which venue?
which midpoint primitive?
when to use relative fallback?
```

‏אפשר לתת ל־IBKR לנהל את החיפוש.

‏זה מקטין routing logic מקומי ויכול לפתוח גישה ל־midpoint opportunities במספר venues.

‏המחיר הוא פחות determinism:

```text
same logical order
may take different execution paths
```

‏ולכן Telemetry חייבת לשמור venue/fill behavior ולא רק `order_type = MidPrice`.

---

## ‏5.23 `MidPrice` מול `Pegged-to-Midpoint`

| מאפיין | `MidPrice` | `Pegged-to-Midpoint` |
|---|---|---|
| Routing | `SMART` | ‏Directed למניות US |
| מי בוחר destination | IBKR | ‏אנחנו/route שנבחר |
| מטרה | ‏midpoint-or-better | ‏peg ל־midpoint ביעד |
| Fallback behavior | ‏יכול להשתנות לפי IBKR | ‏תלוי Destination |
| Control | ‏נמוך יותר | ‏גבוה יותר |
| Operational complexity אצלנו | ‏נמוכה יותר | ‏גבוהה יותר |
| Determinism למחקר | ‏פחות | ‏יותר לפי route |

‏שניהם ראויים למחקר. הם פשוט עונים על שאלה אחרת.

---

## ‏5.24 מתי `MidPrice` יכולה להיות Candidate מצוינת

‏תרחיש טבעי:

```text
spread is meaningful
signal still has some life
we prefer midpoint improvement
but do not want to direct-route manually
```

‏במקרה כזה `MidPrice + hard cap + short application TTL` היא Challenger רצינית.

‏היא פחות מתאימה כאשר:

```text
signal is expiring now
and
missed-fill cost dominates half-spread savings
```

---

## ‏5.25 `Snap` — לחשב מחיר פעם אחת ואז להפסיק לרדוף

‏`Snap` נראית כמו Pegged בזמן יצירתה, אבל ההבדל הוא קריטי:

```text
Pegged:
reference moves -> order price keeps changing

Snap:
reference sampled -> initial limit calculated -> price stays fixed
```

‏עבורנו זה יכול להיות בדיוק האמצע בין:

```text
static manually-calculated limit
```

‏לבין:

```text
continual broker-managed chase
```

---

## ‏5.26 `Snap to Market`

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת:

```text
SELL price = Bid + offset
BUY price  = Ask - offset
```

‏זו פקודה למניות/ETF ועוד, זמינה ב־`TWS` וב־`IBKR Desktop`, עם `SMART` או Direct Routing במוצרי US המתאימים.

‏המחיר מחושב בזמן ההגשה ואינו ממשיך להיצמד לשוק.

---

## ‏5.27 `Snap to Midpoint`

> ‏אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = midpoint + offset
BUY  = midpoint - offset
```

‏והוא נשאר Limit לאחר החישוב הראשוני.

‏זה מעניין במיוחד אצלנו כ־Candidate ל־:

```text
get a midpoint-derived initial price
without continual repricing
```

---

## ‏5.28 `Snap to Primary`

> ‏אימות אחרון: `2026-10-27`.

‏המחיר הראשוני:

```text
SELL = Ask - offset
BUY  = Bid + offset
```

‏כלומר הוא מתחיל מהצד שלנו ב־NBBO ומשפר אותו לפי offset, אבל אינו ממשיך לעקוב אחרי השוק.

‏ב־IBKR הוא מתועד ל־US products וב־Directed routing.

---

## ‏5.29 כל משפחת `Snap` היא Broker-Simulated ב־IBKR

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מציינת ש־`Snap to Market`, ‏`Snap to Midpoint` ו־`Snap to Primary` מדומות על כל ה־exchanges.

‏זה אומר שה־Broker מחשב ומנהל את ה־initial transformation.

‏לכן צריך למדוד:

```text
quote_at_submit
snap_reference
computed_limit
ack_time
actual_first_working_price
```

‏כדי להבין מה קרה באמת בין Decision ל־Working Order.

---

## ‏5.30 `Snap` מול `Pegged` — הבחירה החשובה

‏השאלה אינה "איזו יותר חכמה".

‏השאלה היא:

> ‏האם אנחנו רוצים שהמחיר ימשיך להגיב לשוק בלי התערבות שלנו?

‏אם כן — Pegged יכולה להתאים.

‏אם לא — Snap יכולה לתת מחיר התחלתי מבוסס שוק ואז לעצור.

‏ב־Signal שחי שניות, דווקא העצירה הזו יכולה להיות יתרון: אין auto-chase אחרי שה־Order נוצרה.

---

## ‏5.31 `Snap` עדיין יכולה להפוך ל־Stale Order

‏העובדה שהיא לא רודפת אחרי השוק אינה אומרת שהיא בטוחה להשאיר.

‏אם:

```text
snap price calculated at t0
signal dies at t0 + 300ms
order still rests at old price
```

‏אפשר לקבל stale fill.

‏לכן Snap צריכה בדרך כלל:

```text
short application TTL
signal-aware cancel
fill/cancel reconciliation
```

---

## ‏5.32 `IBKR ATS Pegged-to-Best`

> ‏אימות אחרון: `2026-10-27`.

‏`Pegged-to-Best` היא פקודה ייחודית ל־IBKR ATS עבור Stocks/ETFs אמריקאיים ב־Directed routing.

‏היא אינה מסתכלת רק על near-side NBBO. היא יכולה להתחרות גם מול same-side liquidity שמונחת בתוך IBKR ATS.

‏IBKR מתעדת שהמחיר יכול להיות one tick יותר אגרסיבי מהטוב מבין:

```text
near-side NBBO
or
best same-side resting ATS liquidity
```

‏עד מגבלה הקשורה ל־midpoint ול־offsets שהמשתמש מגדיר.

---

## ‏5.33 `Minimum Competing Size` — רעיון מקצועי חשוב

‏ב־Pegged-to-Best אפשר להגדיר כמות מצטברת מינימלית של same-side orders שמצדיקה תחרות במחיר טוב יותר.

‏זה פותר בעיה מעניינת:

> ‏לא לרדוף אחרי Order קטנה וזניחה רק מפני שהיא קפצה לפנינו.

‏ברובוט זו יכולה להיות הגנה מפני over-reaction ל־tiny displayed/ATS liquidity.

‏זה אינו baseline אצלנו כרגע, אבל העיקרון עשוי להיות שימושי גם במדיניות client-side עתידית.

---

## ‏5.34 `IBKR ATS Pegged-to-Midpoint`

‏IBKR מציעה גם גרסת ATS של Pegged-to-Midpoint עבור Stocks/ETFs אמריקאיים, עם Directed routing, ובפלטפורמות רחבות יותר כולל `TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏היא מאפשרת resting midpoint liquidity בתוך IBKR ATS ויכולה לכלול offsets לפי כללי ATS.

‏מבחינתנו זו Candidate מתקדמת רק לאחר שנבין אם IBKR ATS נותנת לנו fill quality עדיפה על SMART/venues אחרים.

---

## ‏5.35 `Pegged-to-Benchmark`

‏`Pegged-to-Benchmark` מזיזה את מחיר Order אחת לפי תנועת Contract אחר.

‏רעיון:

```text
primary order
tracks movement of
reference contract
```

‏IBKR מתעדת ששני ה־contracts צריכים להשתמש באותו מטבע, ושהפקודה יכולה להגיב לשינוי reference ביחס ל־starting reference price.

‏זו פקודה חשובה למי שעושה relative-value, hedging או pair logic.

‏ל־core momentum שלנו היא כרגע פחות טבעית, אבל אם בעתיד Signal יוגדר כ־:

```text
stock momentum relative to SPY
stock momentum relative to QQQ
stock momentum relative to sector ETF
```

‏היא יכולה להפוך רלוונטית הרבה יותר.

---

## ‏5.36 `Retail Price Improvement` כקרובת משפחה רעיונית

‏`RPI` אינה Peg רגילה, אבל ב־IBKR היא מתנהגת רעיונית כמו liquidity-adding order עם offset מול best bid/offer ו־limit cap, במסגרת תוכנית Retail Price Improvement של NASDAQ.

‏IBKR מתעדת אותה ל־US stocks/ETFs בתנאים הרלוונטיים, עם `SMART` routing, ול־NASDAQ-listed stocks בהקשר המתואר.

‏למנוע שלנו היא אינה Candidate ראשונה, אבל חשוב לדעת שהיא קיימת משום שהיא מחברת:

```text
relative pricing
+
hidden price improvement liquidity
+
venue/program-specific eligibility
```

---

## ‏5.37 מה פחות רלוונטי כרגע — אבל עדיין צריך להכיר

‏IBKR מחזיקה גם משפחות Pegged שמכוונות יותר ל־Options או multi-leg execution, כגון `Pegged-to-Stock` ו־`Relative + Market` בהקשרים מסוימים.

‏אותן נלמד ברמת זיהוי מקצועי, אבל לא נקדיש להן את אותו נפח כמו לפקודות שממש יכולות להיכנס למנוע המניות שלנו.

‏זה כלל העומק שלנו:

```text
relevant to US-stock short-horizon execution -> deep
adjacent but not actionable for our engine -> know it, do not overbuild around it
```

---

## ‏5.38 `API` — אסור לייצג את כל המשפחה במחרוזת אחת

‏ב־`TWS API`, ה־Order object מכיל `orderType`, ‏`lmtPrice` ושדות נוספים המשמשים Order families מתקדמות. `ContractDetails.orderTypes` ו־`validExchanges` מאפשרים לנו לבדוק capabilities של Contract.

‏מבחינת הארכיטקטורה, עדיף מודל כגון:

```text
PegPolicy {
  family
  reference
  offset
  cap
  route
  continuous_reprice
  application_ttl
  signal_expiry
}
```

‏ולא:

```text
orderType = PEG
```

‏כי `Relative SMART`, ‏`Relative Directed`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap` הן policies שונות לחלוטין.

---

## ‏5.39 למה Runtime Capability Discovery חשוב במיוחד כאן

‏משפחת Peg/Snap רגישה מאוד ל־:

```text
product
venue
route
region
platform
```

‏לכן נשתמש בשילוב:

```text
static verified matrix
+
ContractDetails.orderTypes
+
validExchanges
+
rejection handling
```

‏לא נניח שהעובדה ש־TWS מציגה Order Type מסוימת אומרת שכל מניה וכל destination יקבלו אותה דרך ה־API.

---

## ‏5.40 `Pegged` יכולה להפוך ל־Chase אוטומטי

‏זו אחת הסכנות המרכזיות.

‏אם:

```text
reference rises
peg follows
reference rises again
peg follows again
```

‏וה־cap רחב, יצרנו chase בלי לולאת chase מקומית.

‏לכן כל Pegged execution אצלנו תצטרך:

```text
hard_economic_cap
max_signal_age
max_effective_price_deviation
cancel_on_edge_decay
cancel_on_market_data_stale
```

‏אוטומציה במחיר אינה אישור אינסופי להמשיך לשלם יותר.

---

## ‏5.41 `Snap` פותרת חלק מהבעיה הזאת — אבל יוצרת אחרת

‏Snap אינה ממשיכה לרדוף.

‏לכן היא מגבילה auto-chase.

‏אבל המחיר שקפא יכול להפוך מיושן.

‏כלומר:

```text
Peg risk  = moving too far
Snap risk = staying too long at stale price
```

‏שניהם דורשים TTL; הסיבה שונה.

---

## ‏5.42 Midpoint Execution ו־Adverse Selection

‏גם Fill במידפוינט אינו אוטומטית "free half-spread".

‏צריך לבדוק markout לאחר Fill.

‏אם midpoint fills מגיעים בעיקר רגע לפני תנועה נגדנו, ה־price improvement יכול להיעלם מיד.

‏לכן:

```text
price improvement
without
post-fill markout
```

‏הוא מדד חלקי ומטעה.

---

## ‏5.43 Pegged Exit — האם זה בכלל מתאים?

‏ב־Entry אנחנו יכולים לקבל no-fill ולבחור `NO TRADE`.

‏ב־Exit יש Position קיימת.

‏לכן Pegged/Midpoint יכולה להתאים ל־normal exit כאשר:

```text
we still have time
position risk is controlled
spread savings matter
```

‏אבל ב־fast/emergency exit היא יכולה להיות איטית מדי.

‏מכאן ש־Execution Policy צריכה להפריד:

```text
ENTRY_PEGGED
NORMAL_EXIT_PEGGED
FAST_EXIT
EMERGENCY_EXIT
```

---

## ‏5.44 שילוב Pegged עם `IOC` אינו אוטומטי

‏Pegged Orders נועדו לעיתים לנוח ולהתעדכן.

‏`IOC` אומרת לא להשאיר remainder.

‏לכן צירוף כזה, כאשר בכלל נתמך, משנה מהותית את הרעיון.

‏אסור לייצר combinations על סמך שמות שדות בלבד. כל שילוב:

```text
order type
+
tif
+
route
+
attributes
```

‏צריך capability verification נפרד.

---

## ‏5.45 המבחן הנכון: `Broker-managed reprice` מול `Client-managed reprice`

‏אנחנו צריכים להשוות לא רק מחיר Fill אלא מערכת שלמה:

```text
fill_rate
first_fill_latency
full_fill_latency
reprice_count
cancel_replace_count
queue_outcome
price_improvement
adverse_selection
missed_move
broker_rejections
net_edge_per_signal
```

‏יכול להיות ש־Pegged מפחיתה latency ומעלה Fill Rate אבל מגדילה adverse selection.

‏יכול להיות ש־Client-side policy איטית יותר אבל מגיבה טוב יותר ל־Signal-specific information.

‏אין תשובה תיאורטית שתכריע בלי נתונים.

---

## ‏5.46 קבוצת ה־Challengers שהייתי מכניס למחקר מוקדם

‏אחרי חמשת החלקים הראשונים, יש לנו קבוצת ניסוי מעניינת:

```text
A. Passive displayed Limit + short TTL
B. Marketable Limit + IOC
C. Relative/Pegged-to-Primary + hard cap + short TTL
D. MidPrice + hard cap + short TTL
E. Snap to Midpoint + short TTL
F. Directed Pegged-to-Midpoint + hard cap + short TTL
```

‏לכל אחת יש תפקיד אחר:

```text
A = simple passive baseline
B = immediate capped aggression
C = continuously adaptive passive aggression
D = broker-managed midpoint search
E = midpoint-derived one-shot price
F = explicit directed midpoint peg
```

‏זה לא אומר שנשתמש בכולן ב־Live. המטרה היא לגלות איזה trade-off עובד בכל Market Regime.

---

## ‏5.47 מה הייתי משאיר כ־Advanced Challengers

```text
IBKR ATS Pegged-to-Best
IBKR ATS Pegged-to-Midpoint
RPI
Pegged-to-Benchmark
```

‏לא משום שהן פחות מקצועיות, אלא משום שהן מוסיפות destination/program/reference complexity שמוצדקת רק אם baseline המחקר מראה צורך.

---

## ‏5.48 איך המנוע יבחר Family בזמן אמת

‏לא לפי שם הפקודה, אלא לפי state:

```text
signal_strength
signal_age
expected_edge
spread_ticks
spread_bps
quote_velocity
visible_depth
max_wait_ms
liquidity_intent
position_state
route_capability
```

‏דוגמת מחקר:

```text
if urgency is extreme:
    marketable_limit_ioc
elif spread is wide and signal still has life:
    midpoint_family
elif passive intent and quote is moving:
    relative_primary
elif want market-derived initial price without chase:
    snap_family
else:
    simple_passive_limit
```

‏זו לא לוגיקת Production סופית; זו taxonomy נקייה לניסויים.

---

## ‏5.49 Telemetry ייעודית למשפחה

‏נוסיף:

```text
peg_family
peg_reference
offset_type
offset_value
hard_cap
route
destination
continuous_reprice
initial_effective_price
current_effective_price
reprice_count
reprice_up_count
reprice_down_count
midpoint_at_decision
midpoint_at_submit
midpoint_at_fill
price_improvement_vs_near_side
price_improvement_vs_mid
snap_reference
snap_fixed_price
broker_algo_name
```

‏ומדדים נגזרים:

```text
fill_rate_by_family
time_to_fill_by_family
reprice_to_fill_ratio
price_improvement_bps
missed_move_after_no_fill
markout_100ms
markout_500ms
markout_1s
markout_5s
net_edge_by_family
```

---

## ‏5.50 Failure Modes שחייבים לבדוק לפני Live

```text
unsupported route
order rejected because destination does not support type
offset invalid for venue
price rounded unexpectedly
cap reached and order stops following
SMART Relative remains high after bid falls
midpoint moves beyond economic value
Snap price becomes stale
partial fill while peg continues
cancel crosses with fill
broker reconnect returns live pegged order
market data stale while order still reprices externally
```

‏כל אחד מהתרחישים האלה צריך להפוך בעתיד לבדיקת קבלה או סימולציית failure.

---

## ‏5.51 מטריצת התאמה ראשונית למנוע שלנו

| כלי | התאמה ראשונית | יתרון מרכזי | סיכון מרכזי |
|---|---|---|---|
| `Relative/Pegged-to-Primary` | `High/Challenger` | ‏repricing פסיבי אוטומטי | ‏SMART asymmetry / auto-chase |
| `Pegged-to-Midpoint` | `High/Challenger` | ‏midpoint price improvement | ‏Direct routing / no-fill |
| `MidPrice` | `High/Challenger` | ‏SMART midpoint search | ‏execution path פחות deterministic |
| `Snap to Market` | `Medium/High` | ‏initial price מבוסס opposite side | ‏stale fixed limit |
| `Snap to Midpoint` | `High/Challenger` | ‏midpoint initial price בלי continual chase | ‏no-fill / stale order |
| `Snap to Primary` | `Medium/High` | ‏near-side improvement חד־פעמי | ‏Directed routing / stale price |
| `IBKR ATS Pegged-to-Best` | `Advanced Challenger` | ‏מתחרה גם מול ATS same-side liquidity | ‏ATS-specific complexity |
| `IBKR ATS Pegged-to-Midpoint` | `Advanced Challenger` | ‏midpoint בתוך IBKR ATS | ‏destination dependence |
| `Pegged-to-Benchmark` | `Low now / Future` | ‏relative-value execution | ‏לא תואם core signal כיום |
| `RPI` | `Advanced/Future` | ‏program-specific price improvement | ‏eligibility/program dependence |

---

## ‏5.52 Recommendation למנוע בשלב הזה

‏המשפחה הזו מספיק רלוונטית כדי שלא נסתפק ב־Marketable Limit ו־Passive Limit בלבד.

‏הייתי בונה ב־Research Harness תמיכה מפורשת לפחות ב־:

```text
RELATIVE_PRIMARY
MIDPRICE
SNAP_MID
PEGGED_MID_DIRECT
```

‏ומשווה אותם ל־:

```text
PASSIVE_LIMIT
MARKETABLE_LIMIT_IOC
```

‏אבל שום Peg לא מקבלת פטור מ־:

```text
hard cap
TTL
signal validity
fill reconciliation
runtime capability checks
```

---

## ‏5.53 Practitioner Secrets — הדברים שקל מאוד לפספס

### ‏1. `Pegged` אינה "Limit שמתעדכנת"

‏ה־reference, route והכיוון שבו המחיר רשאי לזוז הם חלק מה־Order semantics.

### ‏2. `SMART Relative` יכולה להיות חד־כיוונית

‏זה הבדל מהותי מ־Directed Relative.

### ‏3. `MidPrice` אינה פשוט `Pegged-to-Midpoint + SMART`

‏היא Broker Algo שיכול לבחור execution paths שונים.

### ‏4. `Snap` אינה Peg איטית

‏היא חישוב חד־פעמי של מחיר ואז Limit קבועה.

### ‏5. Midpoint Fill אינו בהכרח Fill איכותי

‏חצי Spread שנחסך יכול להימחק ב־adverse markout רגע לאחר הביצוע.

### ‏6. `Cap` אינו optional מבחינה כלכלית

‏גם אם ה־UI מאפשר להשאיר התנהגות רחבה יותר, המנוע צריך לדעת את worst acceptable economics שלו.

### ‏7. Routing הוא חלק מה־Order Type

‏במשפחה הזו במיוחד, `SMART` מול Directed יכול לשנות את ההתנהגות עצמה — לא רק את היעד.

### ‏8. Fewer cancels אינם אוטומטית better execution

‏Peg יכולה לחסוך message churn אבל עדיין להיות גרועה יותר מבחינת Fill quality.

### ‏9. Repricing חיצוני לא פוטר אותנו מ־Market Data Monitoring

‏גם אם IBKR/Venue מזיזים את המחיר, המנוע חייב לדעת מתי ה־Signal או ה־Edge כבר אינם תקפים.

### ‏10. ה־Order הכי "אוטומטית" אינה בהכרח הטובה ביותר לרובוט

‏לפעמים דווקא `Snap + TTL` נותנת state machine פשוטה וצפויה יותר מ־continual peg.

---

# ‏מקורות רשמיים לחלק 5

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Relative / Pegged-to-Primary בתוך Order Types and Algos: <https://investors.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Pegged-to-Midpoint בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php?menu=B>
- ‏IBKR — Snap to Market / Midpoint / Primary בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — MidPrice Order Type release/documentation: <https://www.interactivebrokers.com/en/general/tws-notes-975.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR API — Order Types introduction: <https://www.interactivebrokers.com/docs/general/order-types/introduction>

---

# ‏Checkpoint — סוף חלק 5

‏בחלק הזה הפרדנו בין ארבעה כלים שנראים במבט ראשון דומים אבל מעבירים אחריות שונה בין המנוע, IBKR וה־Venue: `Relative/Pegged-to-Primary`, ‏`Pegged-to-Midpoint`, ‏`MidPrice` ו־`Snap`.

‏למדנו שהשאלה המקצועית אינה רק "באיזה מחיר Order נמצאת עכשיו", אלא **מי רשאי לשנות אותו, לפי איזה reference, באיזה כיוון, עד איזה cap, ובאיזה route**. עבור מנוע של שניות זה משנה את latency, queue behavior, missed-fill risk, adverse selection ואת כמות ה־cancel/replace logic שאנחנו צריכים לכתוב בעצמנו.

‏ה־Challengers המרכזיים שנכנסים כעת למחקר הם `Relative/Pegged-to-Primary`, ‏`MidPrice`, ‏`Snap to Midpoint` ו־Directed `Pegged-to-Midpoint`, לצד baselines של Passive Limit ו־Marketable Limit + IOC.

‏החלק הבא יהיה **חלק 6 — Stops, Trailing, Bracket, OCA/OCO ו־Conditional Orders**. שם `Bracket` תקבל טיפול עמוק במיוחד ברמת Production: parent/child lifecycle, partial fills, transmit sequencing, OCA races, orphan children, double exits, reconnect/recovery, broker-resident protection מול client-managed exits ו־Failure Matrix מלא — בלי לגרוע מהעומק של Stop, Stop-Limit, Trailing, Adjustable ו־Conditional Orders הרלוונטיות למנוע.

---