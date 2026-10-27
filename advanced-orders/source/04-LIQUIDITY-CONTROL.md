# ‏חלק 4 — Liquidity Control: ‏`Post Only`, ‏`Hidden`, ‏`Reserve/Iceberg` ו־Queue Behavior

## ‏4.1 השאלה האמיתית: האם אנחנו רוצים **לספק** נזילות או **לקחת** נזילות?

‏לפני `Post Only`, ‏`Hidden` או `Iceberg`, צריך להבין שהמנוע מקבל החלטה עמוקה יותר:

```text
Provide liquidity
or
Consume liquidity
```

‏בקנייה לדוגמה:

```text
join Bid / improve Bid
=> usually provide liquidity

cross to Ask
=> consume liquidity
```

‏זו אינה הבחנה אסתטית. היא משנה:

```text
fill probability
fill timing
spread paid/captured
queue exposure
adverse selection
fees/rebates
signal decay
```

‏למנוע שלנו, ש־Edge שלו קטן וחי שניות, כל אחד מהמרכיבים האלה יכול להיות גדול יותר מהרווח שאנחנו מנסים להשיג.

---

## ‏4.2 `Maker` ו־`Taker` הם תיאור של הביצוע, לא זהות קבועה של Order

‏קל לחשוב:

```text
Limit = maker
Market = taker
```

‏אבל זה פשטני מדי.

‏`Limit` שחוצה את ה־Ask יכולה לקחת נזילות. `Limit` שנחה ב־Bid יכולה לספק נזילות. אותה פקודה יכולה אפילו להתחיל אגרסיבית, להתמלא חלקית, ואז remainder שלה יהפוך resting/passive.

‏לכן המנוע צריך לתעד בפועל:

```text
was_liquidity_added?
was_liquidity_removed?
venue
fee_or_rebate
```

‏ולא להסיק זאת רק מ־`order_type`.

---

## ‏4.3 מה `Post Only` מנסה להבטיח

‏`Post Only` היא בקשה בסגנון:

> ‏אל תהפוך אותי ל־liquidity taker. אם הייתי מתבצע מיד נגד Order קיימת, טפל בי לפי כללי ה־Venue/Broker במקום לקחת אותה.

‏המטרה יכולה להיות:

- ‏להבטיח שנישאר Passive.
- ‏להימנע מתשלום spread/taker economics במצב שבו התכוונו לספק נזילות.
- ‏למנוע bug שבו price calculation שלנו חצה בטעות את השוק.
- ‏ליצור Execution Mode ברור: `PASSIVE_OR_NOTHING`.

‏זה שימוש רובוטי חשוב מאוד: `Post Only` יכולה להיות **guardrail**, לא רק פקודה למי שעושה Market Making.

---

## ‏4.4 למה `Post Only` מעניינת דווקא אותנו

‏נניח שהמנוע רוצה להצטרף ל־Bid:

```text
Bid = 20.00
Ask = 20.01
```

‏הוא מחשב:

```text
BUY LMT 20.00
```

‏אבל בין החישוב לשליחה ה־Ask יורד ל־20.00.

‏Limit רגילה יכולה להפוך marketable ולהתבצע מיד. אם הכוונה של ה־Mode הייתה "רק Passive", קיבלנו execution שונה ממה שתכננו.

‏`Post Only` יכולה, כאשר הנתיב תומך בסמנטיקה המתאימה, למנוע את המעבר השקט הזה מ־maker intent ל־taker execution.

‏מבחינת קוד זה מאפשר invariant שימושי:

```text
if execution_mode == PASSIVE_ONLY:
    never intentionally take displayed liquidity
```

---

## ‏4.5 אבל `Post Only` אינה אומרת "אני אקבל Fill טוב"

‏היא מגינה על **סוג הנזילות**, לא על איכות האסטרטגיה.

‏פקודת Post Only יכולה:

- ‏להידחות או לעבור התאמה לפי כללי Venue/Broker.
- ‏לא להתמלא בכלל.
- ‏להישאר בתור בזמן שהמחיר בורח.
- ‏להתמלא בדיוק כאשר הצד השני נהיה אגרסיבי נגדנו.
- ‏להפוך stale בזמן שה־Signal נחלש.

‏לכן:

```text
post_only_success != profitable_execution
```

‏היא רק אומרת שהצלחנו לשמור על passive intent.

---

## ‏4.6 `Post Only` וה־Venue Semantics

‏אין להניח ש־Post Only מתנהגת זהה בכל Destination.

‏כאשר Order הייתה חוצה את השוק, Venue מסוים יכול לדחות אותה; אחר יכול לבצע price-slide/reprice לפי כללים; Broker יכול להפעיל logic משלו; ובחלק מהנתיבים התכונה כלל לא זמינה.

‏לכן מנוע לא צריך לקודד:

```text
post_only = always rejected if marketable
```

‏אלא:

```text
post_only_behavior = capability_and_route_specific
```

‏ונדרש למדוד `reject/reprice/ack` בפועל.

---

## ‏4.7 `Queue Priority` — מחיר זהה אינו מעמד זהה

‏נניח:

```text
Bid = 50.00 x 10,000
```

‏ואנחנו מצטרפים עם 100 מניות.

‏גם אם המחיר שלנו הוא ה־Best Bid, אין משמעות לכך שאנחנו "ראשונים". במודל price-time נפוץ יש לפנינו כמות שקדמה לנו.

‏מכאן:

```text
best_price != best_queue_position
```

‏לרובוט צריך להיות מושג של:

```text
queue_ahead_estimate
order_age
executed_volume_at_level_since_join
level_size_change
```

‏גם אם Queue Position אמיתי אינו ידוע בדיוק.

---

## ‏4.8 למה Queue Position קשה למדידה

‏ה־Depth שאנחנו רואים אינו אמת מלאה על התור:

- ‏יש hidden/reserve liquidity.
- ‏Orders מתבטלות ומתווספות במהירות.
- ‏לא כל feed נותן אותה רמת פירוט.
- ‏Trades יכולים להגיע ממספר Venues.
- ‏ה־Router יכול לפצל את Order שלנו.
- ‏Priority rules משתנים בין Venues וסוגי Orders.

‏לכן לא נבנה מודל שאומר:

```text
queue_ahead = displayed_size_before_us
```

‏כאמת מוחלטת.

‏עדיף להתייחס אליו כ־estimate עם uncertainty.

---

## ‏4.9 `Order Aging` — לפעמים Order ישנה נהיית דווקא מסוכנת יותר

‏פקודה Passive שיושבת זמן רב צוברת שני דברים שונים:

```text
queue age
signal age
```

‏הראשון יכול להיות טוב — אולי התקדמנו בתור.

‏השני יכול להיות רע — ה־Signal שעליו התבססנו כבר התיישן.

‏לכן צריך להימנע מכלל פשטני:

> ‏"חיכינו כבר הרבה, חבל לבטל עכשיו."

‏זו יכולה להיות `sunk-cost` thinking.

‏השאלה הנכונה היא:

```text
If this order did not exist right now,
would we still want to place it at this price?
```

‏אם התשובה לא — Queue Position אינה סיבה להשאיר אותה.

---

## ‏4.10 Queue Toxicity — מתי Fill פסיבי הוא חדשות רעות

‏נניח שהצטרפנו ל־Bid והמניה עולה לאט. אנחנו לא מתמלאים.

‏פתאום מגיע pressure למטה וה־sell flow מתחיל לפגוע ב־Bid. דווקא עכשיו אנחנו מקבלים Fill.

‏זה מצב טיפוסי שבו Fill probability עולה **בדיוק כאשר quality של ה־fill יכולה לרדת**.

‏לכן חשוב למדוד:

```text
fill_probability
and
post_fill_markout
```

‏ביחד.

‏Passive mode עם fill rate גבוה אבל markout רע יכול להיות גרוע יותר מ־aggressive mode עם מחיר כניסה פחות יפה.

---

## ‏4.11 `Join` מול `Improve`

‏בקנייה אפשר לבחור בין:

```text
join existing bid
```

‏לבין:

```text
improve bid by one tick
```

‏`Improve` יכולה להביא אותנו לראש מחיר חדש ולמשוך מוכרים, אבל היא גם:

- ‏מוותרת על חלק מה־spread.
- ‏יוצרת price level חדש.
- ‏עלולה לחשוף urgency.
- ‏יכולה להזיז את ה־NBBO אם אנחנו באמת הטובים ביותר.
- ‏עדיין אינה מבטיחה Fill.

‏לכן עבורנו `improve_one_tick` צריך להיות Execution Mode נפרד ולא fallback אוטומטי בכל פעם שלא התמלאנו.

---

## ‏4.12 `Hidden Order` — להסתיר את כל הכמות המוצגת

‏`Hidden` מבקשת שה־Order לא תופיע ככמות גלויה ב־market depth, בכפוף ל־Venue/Broker semantics.

‏הסיבה הקלאסית היא להימנע מחשיפת Order גדולה שעלולה לגרום למשתתפים אחרים להגיב אליה.

‏זה שימוש חשוב למוסדיים או לכמויות גדולות יחסית לנזילות.

‏אבל עבורנו צריך לשאול קודם:

> ‏האם הכמות שלנו בכלל גדולה מספיק כדי ש־display footprint יהיה בעיה?

‏אם אנחנו שולחים כמות קטנה יחסית לעומק, הסתרת הכמות יכולה להוסיף מורכבות בלי לפתור בעיה אמיתית.

---

## ‏4.13 `Hidden` אינה "בלתי נראית" במובן קסום

‏גם אם Order אינה מוצגת ב־book, היא עדיין יכולה להשפיע על execution ולהיחשף בעקיפין דרך fills והתנהגות שוק.

‏בנוסף, priority של hidden liquidity ותנאי eligibility יכולים להיות שונים לפי Venue.

‏לכן אין להניח:

```text
hidden = same fill probability as displayed + perfect secrecy
```

‏צריך לבדוק בפועל:

```text
hidden_fill_rate
hidden_time_to_fill
hidden_markout
hidden_vs_displayed_net_edge
```

---

## ‏4.14 פרט חשוב ב־IBKR: Hidden יכולה להיות Simulated

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שהיא תנסה לנתב Hidden Orders ל־Exchanges שתומכים בהן Native. אם אין Destination מתאים עם native support, היא עשויה לדמות Hidden Order בכך שהיא מחזיקה אותה אצלה ושולחת `IOC` לבורסה כאשר הפקודה נעשית marketable.

‏IBKR גם מזהירה שבמצב simulated execution יכול להתעכב או לא להתרחש, ושהטיפול הוא best-efforts.

‏למנוע שלנו זה משמעותי מאוד:

```text
Hidden native
!=
Hidden broker-simulated
```

‏אותו checkbox יכול להוביל ל־latency/fill path שונה.

---

## ‏4.15 `Reserve / Iceberg` — להציג חלק ולהסתיר את היתר

‏`Iceberg` או `Reserve` מאפשרת להחזיק Order כוללת גדולה יותר, אבל לפרסם לשוק רק `display size` קטן ממנה.

‏לדוגמה:

```text
total_qty   = 5000
display_qty = 200
```

‏לשוק מוצגת רק פרוסה, בעוד הכוונה הכוללת גדולה יותר.

‏המטרה:

- ‏להקטין מידע שאנחנו חושפים על גודל הכוונה.
- ‏להימנע מהצגת wall גדול.
- ‏לעבוד כמות גדולה בהדרגה.

‏זה כלי מקצועי מאוד — אבל הוא אינו אוטומטית שימושי למסחר קטן ומהיר.

---

## ‏4.16 איך `Display Size` עובד ב־IBKR

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Iceberg/Reserve דרך שדה `Display Size`. בדוגמה הרשמית, Order של 5,000 מניות עם Display Size של 200 מציגה 200, ולאחר שהכמות המוצגת מתמלאת מוגשת פרוסה נוספת עד להשלמת הכמות הכוללת.

‏עוד פרט חשוב: IBKR מציינת שאם Order היא `Market` או אם Limit היא marketable, המערכת יכולה לשלוח עד הכמות הכוללת הזמינה ולהשתמש ב־`IOC` attribute במקום לעבוד כ־Iceberg פסיבית רגילה.

‏מכאן:

> ‏Iceberg אינה רק `total_qty` עם מספר קטן בשדה display; ההתנהגות תלויה גם בשאלה אם Order passive או marketable.

---

## ‏4.17 Replenishment ו־Queue Priority

‏כאשר displayed slice מתמלאת ופרוסה חדשה מופיעה, אסור להניח שהיא שומרת תמיד את אותה Priority כאילו כל הכמות הייתה גלויה מלכתחילה.

‏הכללים תלויים Venue וביישום Native/Simulated.

‏לכן במחקר שלנו צריך למדוד:

```text
slice_number
slice_submit_time
slice_fill_time
queue_delay_per_slice
```

‏ולא להתייחס ל־Iceberg כאל Order אחת הומוגנית מבחינת queue.

---

## ‏4.18 למה Iceberg בדרך כלל אינה Baseline טבעי עבורנו

‏אם ה־Position שלנו קטנה יחסית ל־displayed depth, אין הרבה מה להסתיר.

‏החסרונות האפשריים:

- ‏מורכבות execution נוספת.
- ‏replenishment latency/priority effects.
- ‏פחות שקיפות במחקר שלנו לגבי מה בדיוק היה working בכל רגע.
- ‏התנהגות שונה כאשר Order נעשית marketable.
- ‏capability תלויה Venue/Broker.

‏לכן `Reserve/Iceberg` היא מבחינתנו `Advanced Option`, לא baseline — אלא אם הנתונים יראו שהגודל שלנו באמת יוצר footprint או market impact.

---

## ‏4.19 מתי Iceberg כן יכולה להפוך לרלוונטית גם לרובוט אישי

‏לא צריך להיות מוסדי כדי שגודל יחסי יהיה גדול.

‏אם מניה דקה מאוד וב־Bid יש רק:

```text
300 shares displayed
```

‏ואנחנו רוצים 500, הכמות שלנו כבר משמעותית יחסית לרמה.

‏במצב כזה אפשר לחקור האם display קטן יותר:

- ‏מקטין signaling.
- ‏משפר markout.
- ‏מקטין תגובת שוק לכמות שלנו.

‏אבל אז עולה שאלה קודמת:

> ‏אם 500 מניות הן כבר גדולות ביחס לנזילות, האם בכלל נכון לבצע את העסקה במסגרת Edge קצר כל כך?

‏לפעמים התשובה המקצועית יותר היא `NO TRADE` או size קטן יותר, לא Order Type מתוחכם יותר.

---

## ‏4.20 `Hidden` מול `Iceberg`

| תכונה | `Hidden` | `Iceberg / Reserve` |
|---|---|---|
| כמות גלויה | ‏אפס, לפי semantics | ‏חלק מהכמות |
| מטרה | ‏להסתיר את קיום/גודל ה־Order | ‏להראות slice קטן בלבד |
| Fill behavior | ‏תלוי Venue/priority/simulation | ‏תלוי slices/replenishment |
| שימוש טיפוסי | ‏כמות גדולה/מידע רגיש | ‏כמות גדולה שרוצים לעבוד בהדרגה |
| התאמה ראשונית לנו | `Low/Challenger` | `Low/Advanced` |

‏אין כאן מנצח אוניברסלי. השאלה היא איזה מידע אנחנו מנסים לא לחשוף ומה המחיר בביצוע שאנחנו משלמים תמורת ההסתרה.

---

## ‏4.21 Maker/Taker Economics — לא לרדוף אחרי Rebate

‏ב־Venues מסוימים הוספת נזילות ולקיחת נזילות מקבלות fee/rebate economics שונים.

‏זה חשוב, אבל אצלנו אסור שהמנוע יהפוך ל־rebate strategy בלי שהתכוונו לכך.

‏אם חסכנו לדוגמה fee קטן אבל פספסנו מהלך של עשרות basis points, זו עסקה גרועה.

‏הסדר הנכון הוא:

```text
net executable edge
then execution quality
then fees/rebates as one component
```

‏לא:

```text
maximize maker rebate
```

---

## ‏4.22 `Post Only` כ־Safety Invariant ברובוט

‏יש שימוש שאני כן רואה כרלוונטי במיוחד למנוע שלנו:

```text
mode = PASSIVE_ONLY
=> require post-only capability when reliable
```

‏כלומר אם המנוע החליט שהעסקה כדאית **רק** אם אנחנו לא חוצים Spread, אז Post Only יכולה לאכוף את ההנחה ברמת Order path.

‏אם אין capability אמינה, המנוע צריך לפחות לבצע pre-submit check ולהתמודד עם race שבו השוק משתנה לפני arrival.

‏זו דוגמה שבה Order Type/attribute מתקדם אינו "טריק להשגת מחיר טוב" — אלא דרך להפוך החלטת Strategy ל־constraint תפעולי.

---

## ‏4.23 למה `Post Only` יכולה להיות מסוכנת למומנטום קצר

‏ב־Signal מהיר מאוד, refusal to take liquidity יכול להיות יקר.

‏תרחיש:

```text
signal edge = strong
spread = 1 tick
expected move = 12 ticks
```

‏אם Post Only גורמת לנו שוב ושוב להישאר מאחור, אנחנו "חוסכים" tick אחד ומפסידים 12.

‏לכן Post Only מתאימה יותר כאשר:

```text
passive fill economics are materially better
and
signal lifetime allows waiting
```

‏ופחות כאשר:

```text
missed-move cost >> spread cost
```

---

## ‏4.24 `IBKR ATS` — דוגמה מיוחדת ל־Liquidity Posting

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת שה־ATS שלה זמין למניות ו־ETF אמריקאיים כ־Directed destination. Orders שמנותבות ל־IBKR ATS כדי להוסיף נזילות מתויגות אוטומטית כ־`not held` ומפורסמות ב־order book של IBKR ATS; הן יכולות להיפגש עם SmartRouted Orders שנעשות marketable נגדן.

‏בתיעוד `TWS API`, השדה `notHeld` מציין ש־Orders המנותבות ל־IBDARK מתויגות כ־`post only` ומוחזקות ב־IB order book.

‏זה מלמד אותנו שני דברים:

1. ‏`Post Only` יכולה להיות קשורה ל־Destination ספציפי ולא רק checkbox כללי.
2. ‏Routing ו־liquidity policy אינם נושאים נפרדים — הם חלק מאותה החלטת Execution.

‏נרד לזה עוד יותר בחלק Routing.

---

## ‏4.25 `TWS API` — ה־attributes הרלוונטיים

> ‏אימות אחרון: `2026-10-27`.

‏ב־`Order` object הנוכחי של `TWS API` קיימים בין היתר:

```text
displaySize
hidden
postOnly
notHeld
```

‏`displaySize` מוגדר ככמות שתיחשף לציבור.

‏`hidden` מסמן שה־Order לא תיראה ב־market depth; התיעוד של ה־API מציין במפורש שהשדה הזה חל על Orders שמנותבות ל־NASDAQ, ולכן שוב אסור להסיק availability כללית רק מכך שהשדה קיים באובייקט.

‏`postOnly` קיים כ־boolean ב־Order object, אך התיעוד הכללי אינו אומר שכל Contract/Route מקבל אותו.

‏מכאן הארכיטקטורה הנכונה:

```text
API field exists
+
contract/route capability
+
broker acceptance
+
observed live semantics
=
usable feature
```

---

## ‏4.26 `IBKR` — Hidden ו־Iceberg ב־UI

> ‏אימות אחרון: `2026-10-27`.

‏בדף Order Types הנוכחי של IBKR:

```text
Hidden:
Products: Stocks, ETFs, Options, Futures, FOPs, Bonds, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏ו־Iceberg/Reserve מתועד כך:

```text
Products: Stocks, ETFs, Options, Futures, Warrants
Platforms: TWS Only
Regions: US and Non-US Products
Routing: Smart, Directed
```

‏לכן במסמך הסופי נסמן בנפרד:

```text
UI availability
vs
TWS API field availability
```

‏ולא נכתוב פשוט `IBKR supports Hidden = yes`.

---

## ‏4.27 Automation Modes שאני רוצה שנחקור

‏אחרי החלק הזה אפשר להגדיר כמה Modes חדשים למנוע:

### ‏`PASSIVE_DISPLAYED`

```text
join/improve displayed quote
short TTL
normal visible size
```

### ‏`PASSIVE_POST_ONLY`

```text
passive intent is mandatory
reject/reprice outcome is handled explicitly
```

### ‏`PASSIVE_HIDDEN`

```text
hide order when capability and economics justify it
```

### ‏`PASSIVE_RESERVE`

```text
large relative size
controlled display slice
```

### ‏`AGGRESSIVE_CAPPED`

```text
consume liquidity within economic cap
```

‏המנוע לא צריך לעבור אוטומטית בין המצבים. מעבר מ־Passive ל־Aggressive הוא **החלטה חדשה** שדורשת re-evaluation של Signal ו־Edge.

---

## ‏4.28 כלל חשוב: Passive Order חייבת `escape condition`

‏כל Passive Mode צריך לענות מראש:

```text
When do we give up?
```

‏לדוגמה:

```text
max_order_age_ms
max_signal_age_ms
max_queue_wait_ms
cancel_if_bid_weakens
cancel_if_ask_runs_away
cancel_if_expected_edge_below_threshold
cancel_if_market_data_stale
```

‏בלי escape condition, המנוע אינו "סבלני" — הוא פשוט נשאר עם Order ישנה.

---

## ‏4.29 Telemetry שחייבים להוסיף לחקר Liquidity

‏בנוסף למדדים הקודמים:

```text
liquidity_intent = add/remove
post_only_requested
post_only_outcome
hidden_requested
display_size
total_order_size
slice_number
queue_join_timestamp
price_level
visible_size_at_join
visible_size_ahead_estimate
executed_volume_at_level
cancel_replace_count
maker_taker_flag_if_available
venue_fee
venue_rebate
```

‏ומדדים נגזרים:

```text
passive_fill_rate
passive_time_to_fill
passive_markout_100ms
passive_markout_1s
passive_markout_5s
post_only_reject_rate
post_only_reprice_rate
hidden_vs_displayed_fill_delta
hidden_vs_displayed_markout_delta
iceberg_slice_fill_rate
queue_wait_cost
missed_move_after_passive_no_fill
net_edge_by_liquidity_mode
```

‏כך נוכל לדעת האם "הוספת נזילות" באמת מוסיפה לנו ערך או רק גורמת לנו לקבל fills רעילים.

---

## ‏4.30 מטריצת התאמה ראשונית למנוע שלנו

| כלי | התאמה ראשונית | מתי מועיל | הסיכון המרכזי |
|---|---|---|---|
| Passive displayed Limit | `High` כ־Challenger | ‏Spread חשוב ויש זמן קצר להמתין | ‏No-fill / adverse selection |
| `Post Only` | `High/Challenger` ל־Passive-only mode | ‏רוצים לאכוף שלא נהפוך ל־taker | ‏פספוס move / route semantics |
| `Hidden` | `Low/Challenger` | ‏גודל יחסי משמעותי ו־signaling הוא בעיה | ‏fill/priority/simulation uncertainty |
| `Reserve/Iceberg` | `Low/Advanced` | ‏Order גדול יחסית לעומק | ‏replenishment/priority/complexity |
| Improve Bid/Ask | `Medium` | ‏רוצים לקצר queue במחיר של tick | ‏מוותרים על spread וחושפים urgency |
| Aggressive capped | `High` ל־urgent mode | ‏Signal קצר וחזק | ‏spread/slippage |

‏זו עדיין מטריצת Research ולא החלטת Live.

---

## ‏4.31 Recommendation למנוע שלנו בשלב הזה

‏אני לא ממליץ להפוך `Hidden` או `Iceberg` לברירת מחדל רק מפני שהן מתקדמות ומעניינות.

‏כן הייתי מכניס מוקדם למחקר:

```text
A. Passive displayed Limit + short TTL
B. Passive Post-Only mode, כאשר capability מאומתת
C. Marketable Limit + IOC
```

‏ואז משווה לפי:

```text
net edge per signal
fill probability
fill latency
markout
missed opportunity
fees/rebates
exit feasibility
```

‏`Hidden` ו־`Reserve/Iceberg` יקודמו רק אם נראה שה־order size שלנו גדול יחסית לנזילות וש־display footprint פוגע בתוצאה.

---

## ‏4.32 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `Post Only` היא Guardrail, לא Alpha

‏היא אוכפת passive intent; היא לא יוצרת Edge.

### ‏2. Queue Position בלי Signal תקף אינה נכס

‏אל תשאיר Order רעילה רק מפני שחיכית זמן רב בתור.

### ‏3. Fill Rate גבוה יכול להיות סימן רע

‏אם fills מגיעים בעיקר לפני תנועה נגדנו, יש adverse selection.

### ‏4. Hidden יכולה לשנות Execution Path

‏ב־IBKR היא עשויה להיות Native או simulated, ולכן latency/fill semantics יכולות להשתנות.

### ‏5. Iceberg אינה רק הסתרת מספר

‏Replenishment, priority ו־marketability משנים את ההתנהגות שלה.

### ‏6. Fee/Rebate הוא רק רכיב אחד

‏אין היגיון לחסוך fee קטן במחיר של missed move גדול.

### ‏7. `Improve by one tick` הוא Trade חדש

‏זו אינה "תחזוקה" של אותה החלטה; ויתרנו על מחיר כדי לקנות Priority טובה יותר.

### ‏8. Displayed Depth אינו כל הנזילות

‏Hidden/Reserve liquidity היא אחת הסיבות ש־visible queue estimate לעולם אינו אמת מוחלטת.

### ‏9. Passive-to-Aggressive transition חייב re-evaluation

‏אסור שהמנוע יתחיל Passive ואז יחצה Spread אוטומטית רק מפני שפג timer. לפני escalation מחשבים מחדש Edge, cap ו־signal validity.

---

# ‏מקורות רשמיים לחלק 4

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Hidden Order Handling using Simulated Hidden Orders: <https://www.interactivebrokers.com/en/trading/orders/hidden-order-handling-using-simulated.php>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR TWS API — placing orders introduction: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/place-order/introduction>

---

# ‏Checkpoint — סוף חלק 4

‏בחלק הזה בנינו את שכבת ה־Liquidity Control: ההבדל בין maker/taker intent, למה `Post Only` יכולה לשמש guardrail רובוטי, איך Queue Position ו־Order Aging צריכים להימדד, ומה הסיכון של adverse selection דווקא ב־Passive fills. ירדנו גם לעומק של `Hidden` ו־`Reserve/Iceberg`, כולל העובדה שב־IBKR Hidden יכולה להיות broker-simulated וש־Iceberg דרך Display Size משנה את אופן חשיפת הכמות ועשויה להתנהג אחרת כאשר Order marketable.

‏המסקנה למנוע שלנו בשלב זה: **Passive displayed + TTL קצר, Post Only כאשר semantics מאומתות, ו־Marketable Limit + IOC הם שלושת מסלולי המחקר המרכזיים. Hidden/Iceberg נשארות Advanced עד שנוכיח שהגודל שלנו באמת יוצר footprint שמצדיק אותן.**

‏החלק הבא יהיה **Pegged, Relative, Midpoint ו־Snap families** — שם נרד לעומק בפקודות שהמחיר שלהן זז עם השוק, כולל ההבדלים בין `MidPrice`, ‏`Pegged-to-Midpoint`, ‏`Relative/Pegged-to-Primary`, ‏`Pegged-to-Market` ו־`Snap` ב־IBKR, ומה מהן באמת מתאים למנוע מומנטום של שניות.

---