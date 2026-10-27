# ‏חלק 7 — Routing ו־Broker Algos: מי מחליט לאן ואיך הפקודה תבוצע

## ‏7.1 Routing הוא חלק מה־Execution Policy

‏כאשר המנוע החליט:

```text
BUY 100 LMT 50.03
```

‏עדיין חסרה החלטה חשובה:

```text
Where should this order go?
```

‏במניות אמריקאיות אותו Symbol יכול להיסחר במספר Venues במקביל. לכן מחיר הפקודה לבדו אינו קובע את execution path.

‏צריך להפריד:

```text
what we want to pay
from
where and how we try to get filled
```

‏זו בדיוק שכבת Routing.

---

## ‏7.2 שוק מפוצל משנה את משמעות המילה "ה־Book"

‏אין Book יחיד מושלם שמייצג את כל הנזילות.

‏יש:

```text
multiple lit exchanges
ATS / dark liquidity
hidden/reserve orders
broker/internal liquidity paths
venue-specific order types
```

‏ה־NBBO נותן Best Bid ו־Best Offer לאומיים לפי הכללים הרלוונטיים, אבל אינו אומר שכל הכמות שנוכל לבצע נמצאת ב־Venue אחד.

‏לכן:

```text
best displayed price
!=
complete executable liquidity map
```

---

## ‏7.3 `SMART` — אנחנו מאצילים את בחירת ה־Venue ל־IBKR

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתארת `SmartRouting` כמנגנון שסורק bids/offers בין Venues מתחרים ומנתב Orders ליעדי execution מתאימים, תוך הערכה מתמשכת של תנאי השוק.

‏במקום שהמנוע שלנו יאמר:

```text
route to ARCA
```

‏הוא אומר בקירוב:

```text
exchange = SMART
```

‏ומוסר ל־IBKR את בחירת היעד בתוך ה־universe שהיא תומכת בו.

---

## ‏7.4 `SMART` אינו "שלח פעם אחת ל־Venue הכי טוב"

‏IBKR מתעדת ש־SmartRouting יכולה להמשיך להעריך תנאי שוק ולהפנות או להפנות מחדש חלקים מה־Order בהתאם להזדמנויות execution.

‏מכאן ש־Order אחת לוגית אצלנו יכולה לקבל Fills ממספר מקומות או בזמנים שונים.

‏לכן:

```text
one client order
!=
one venue
!=
one fill
```

---

## ‏7.5 `Best Price` מול `Best Total Consideration`

‏Routing מקצועי אינו תמיד פשוט:

```text
choose numerically best displayed price
```

‏IBKR מתעדת שבמסלולים/הגדרות המתאימים SmartRouting יכולה לשקלל `total consideration`, כלומר מחיר יחד עם עלויות execution, ובפרט transaction costs ו־fees/rebates כאשר מספר Venues חולקים את ה־inside market.

‏למנוע שלנו זה קריטי משום ש־Edge קטן יכול להימחק ב־:

```text
exchange fee
maker/taker economics
commission
slippage
```

‏ולכן Price לבדה אינה metric מלאה.

---

## ‏7.6 למה שתי Venues עם אותו Ask אינן בהכרח שקולות

‏נניח:

```text
Venue A Ask = 20.00
Venue B Ask = 20.00
```

‏עדיין יכולים להיות הבדלים ב־:

```text
available size
expected fill probability
fees
rebates
latency
hidden liquidity
order-type support
queue rules
```

‏לכן Router יכול לבחור אחרת גם כאשר המחיר המוצג זהה.

---

## ‏7.7 `Direct Routing` — אנחנו בוחרים את ה־Venue בעצמנו

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת Direct Routing למניות, ETF ומוצרים נוספים, וב־`TWS`, ‏`IBKR Desktop`, ‏`IBKR Mobile` ו־`Client Portal`.

‏במקום `SMART`, הלקוח מציין Destination ספציפי.

‏זה נותן שליטה גבוהה יותר אבל גם מעביר אלינו אחריות גבוהה יותר.

---

## ‏7.8 Direct Routing אינה בהכרח "מהירה יותר"

‏Direct יכולה לקצר החלטת routing מסוימת ולהיות deterministic יותר, אבל אם בחרנו Venue לא נכון:

```text
no liquidity there
better price exists elsewhere
hidden fill opportunity exists elsewhere
venue is slower or degraded
```

‏אז שליטה גבוהה יותר יכולה לייצר execution גרועה יותר.

‏המונח `Direct` מתאר בחירת יעד, לא guarantee של latency או fill quality.

---

## ‏7.9 למה בכל זאת Direct חשובה מאוד

‏יש מקרים שבהם Order Type עצמה דורשת Destination מסוים.

‏כבר ראינו למשל שב־IBKR `Pegged-to-Midpoint` למניות אמריקאיות דורשת Direct Routing.

‏כלומר לפעמים:

```text
execution feature choice
=> forces routing choice
```

‏ולא להפך.

---

## ‏7.10 `SMART` מול Direct — מי מחזיק את ה־Venue Model?

‏ב־SMART:

```text
IBKR maintains venue-selection logic
```

‏ב־Direct:

```text
our engine implicitly owns venue-selection logic
```

‏אם נבחר Direct באופן דינמי, אנחנו צריכים לדעת לפחות:

```text
which venues are valid
what order types each venue supports
fees/rebates
observed latency
fill probability
queue behavior
hidden-liquidity opportunity
reject rates
```

‏זו כבר מערכת Execution Venue Model שלמה.

---

## ‏7.11 `exchange` מול `primaryExchange` ב־TWS API

> ‏אימות אחרון: `2026-10-27`.

‏ב־Contract של מניה, `exchange` מגדיר את נתיב ה־routing — למשל `SMART` או Venue ישיר.

‏`primaryExchange` משמש בין היתר לזיהוי מדויק של listing כאשר יש Symbols שעלולים להיות ambiguous, ואינו פשוט "לאן לשלוח את Order".

‏לכן במודל שלנו אסור לערבב:

```text
instrument identity
with
execution destination
```

---

## ‏7.12 `SMART Depth` מול Direct Depth

> ‏אימות אחרון: `2026-10-27`.

‏`TWS API` מאפשר `reqMktDepth` עם `isSmartDepth=true` כאשר Contract משתמש ב־`SMART`, ומבדיל זאת מ־Direct-routed depth.

‏זו הבחנה חשובה למחקר:

```text
aggregated/smart execution view
vs
venue-specific book view
```

‏אם בעתיד נבנה Venue Selection משלנו, נצטרך נתונים Venue-specific ולא רק top-of-book מאוחד.

---

## ‏7.13 NBBO אינו מספר לנו איפה כל הנזילות

‏גם אם ה־NBBO הוא:

```text
Bid 20.00
Ask 20.01
```

‏יכולים להיות:

```text
multiple venues quoting 20.01
hidden orders at 20.01
midpoint liquidity at 20.005
non-displayed ATS liquidity
```

‏לכן Router טוב עוסק גם ב־**where**, לא רק ב־**what price**.

---

## ‏7.14 Dark Pools ו־Hidden Liquidity

‏Dark liquidity יכולה להציע Fill בלי להציג את מלוא הכוונה ב־lit book, ולעיתים לאפשר price improvement או להפחית market impact.

‏אבל היא מוסיפה uncertainty:

```text
unknown available size
unknown fill probability
possible information leakage through repeated probing
latency before fallback
```

‏ב־Signal שחי שניות, חיפוש ארוך מדי אחרי hidden liquidity יכול להיות יקר יותר מה־spread שניסינו לחסוך.

---

## ‏7.15 IBKR SmartRouting כוללת גם Dark Pools

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מציינת ש־SmartRouting שלה מחפשת execution גם across exchanges וגם dark pools, ובדף Best Execution הנוכחי היא מתארת שילוב של מספר dark pools בתוך ה־routing logic שלה.

‏זה אחד היתרונות של delegating routing: המנוע שלנו אינו חייב לכתוב בעצמו connector/rules לכל מקור נזילות כדי לקבל חשיפה לחלק מההזדמנויות האלה.

---

## ‏7.16 `SMART DarkOnly`

> ‏אימות אחרון: `2026-10-27`.

‏תיעוד `TWS API` של Smart Routing מציג בין אפשרויות ה־API גם:

```text
SMART
SMART DarkOnly
```

‏זו דוגמה לכך שגם `SMART` אינו mode יחיד; יש routing preferences שיכולות לשנות את universe של היעדים.

‏עבורנו `DarkOnly` אינה baseline טבעי לסיגנל קצר, משום ש־no-fill/missed-move risk עלול להיות גבוה, אבל היא Candidate מחקרית כש־spread רחב ויש מספיק signal life.

---

## ‏7.17 `IBKR ATS` הוא Destination, לא מילה נרדפת ל־SMART

‏IBKR ATS יכול לשמש Directed destination עבור מניות/ETF אמריקאיים.

‏זה מאפשר לעבוד liquidity בתוך ה־ATS ולנצל order types ייעודיים כגון Pegged-to-Best/Pegged-to-Midpoint.

‏המשמעות:

```text
IBKR broker
!=
SMART only
```

‏אפשר לבחור destination-specific behavior בתוך אותה תשתית Broker.

---

## ‏7.18 `IBKR ATS Reroute to SMART` — רעיון טוב, timeframe לא בהכרח שלנו

> ‏אימות אחרון: `2026-10-27`.

‏IBKR מתעדת אפשרות לתת ל־liquidity-providing Order לנוח ב־IBKR ATS ואז לעבור ל־SMART לאחר מספר דקות שהמשתמש מגדיר.

‏למנוע שבו Signal חי שניות, `minutes` הם בדרך כלל horizon ארוך מדי ל־core entry.

‏לכן הרעיון חשוב מקצועית — staged routing — אבל נצטרך ליישם גרסה קצרה יותר client-side אם נרצה מעבר של מאות מילישניות/שניות.

---

## ‏7.19 Venue Fee אינו פרט חשבונאי שולי

‏Direct Routing documentation של IBKR מזכירה במפורש של־Exchange שנבחר יכולות להיות fees/rebates.

‏אם Edge צפוי קטן, Venue עם מחיר זהה אך fee שונה משנה את economics.

‏לכן נחזיק:

```text
execution_price
+
commission
+
venue_fee
-
venue_rebate
=
all_in_execution_cost
```

---

## ‏7.20 Maker Rebate עלולה לפתות את הרובוט להתנהגות גרועה

‏אם Router מעדיף Venue רק בגלל rebate גבוה, הוא עלול לקבל:

```text
better fee economics
but worse fill probability
or
more adverse selection
```

‏לכן rebate optimization לעולם אינה objective ראשי אצלנו.

‏ה־objective הוא:

```text
maximize realized net edge per signal
```

‏כאשר fee/rebate היא רק אחד המרכיבים.

---

## ‏7.21 `Price Improvement` חייב להימדד מול Benchmark נכון

‏אם BUY התמלאה ב־20.005 כאשר ה־Ask בזמן ההחלטה היה 20.01, אפשר לומר שקיבלנו improvement מול Ask.

‏אבל כדי לדעת אם Routing באמת עזרה צריך גם:

```text
arrival quote
fill latency
missed opportunity on unfilled signals
post-fill markout
fees
```

‏Price improvement לבדה יכולה להסתיר execution איטית או toxic fills.

---

## ‏7.22 Order אחת יכולה להתפצל למספר Fills ו־Venues

‏מנוע צריך לראות Fill כישות בפני עצמה:

```text
fill_id
order_id
venue
qty
price
timestamp
liquidity_flag
fees
```

‏לא רק:

```text
order average fill price
```

‏אחרת אי אפשר להשוות Routing policies מקצועית.

---

## ‏7.23 Routing Latency צריך להימדד, לא לנחש

‏אנחנו לא יכולים להסיק:

```text
Direct = X ms
SMART = Y ms
```

‏באופן אוניברסלי.

‏נמדוד:

```text
decision_to_submit
submit_to_ack
submit_to_first_fill
submit_to_full_fill
```

‏ונפלח לפי:

```text
route
venue
order type
symbol regime
session
```

---

## ‏7.24 `SMART` מפחיתה מורכבות מקומית — אבל גם Determinism

‏היתרון:

```text
broker maintains venue logic
router can react without our cancel/replace loop
access to multiple venues/dark pools
```

‏החיסרון:

```text
same order intent
may execute differently across market states
```

‏למחקר זה אומר שה־route חייב להיות feature בטבלה, לא hidden implementation detail.

---

## ‏7.25 Direct מגדילה Determinism — אבל גם Model Risk

‏כאשר אנחנו בוחרים Venue, קל יותר להבין למה Order נמצאת שם.

‏אבל אם ה־Venue Model שלנו מיושן:

```text
fee schedule changed
order type changed
liquidity regime changed
venue degraded
routing rule changed
```

‏השליטה שלנו עצמה נהיית מקור לשגיאה.

‏לכן Direct dynamic routing דורשת תחזוקה רציפה.

---

## ‏7.26 Fallback הוא חלק מ־Routing Policy

‏אם Direct Order נדחית או לא מתמלאת, אסור שהתגובה תהיה אוטומטית תמיד:

```text
send SMART immediately
```

‏צריך re-evaluate:

```text
is signal still alive?
is price cap still valid?
how much qty already filled?
what changed in the book?
```

‏Routing fallback הוא Trade Decision חדש.

---

# ‏7.27 `Adaptive` — Broker Algo שבאמת רלוונטי למנוע שלנו

‏`Adaptive` הוא לא Venue.

‏זו שכבת Algo של IBKR שמשלבת SmartRouting עם user-defined priority במטרה לחפש execution טוב יותר תוך שליטה יחסית במהירות.

‏IBKR מתעדת אותו ל־Stocks, ETFs, Options ו־Futures, ב־`TWS`, ‏`IBKR Desktop` ו־`IBKR Mobile`, תחת `IB Algo` routing.

---

## ‏7.28 `Adaptive` יכולה להיות Market או Limit

‏IBKR מציינת שניתן להשתמש ב־Adaptive עם Market או Limit.

‏מבחינתנו ההבדל חשוב:

```text
Adaptive Market
=> no explicit client limit boundary

Adaptive Limit
=> broker algo operates within our price cap
```

‏ל־Edge קטן וקצר, `Adaptive Limit` מעניינת במיוחד משום שהיא משאירה לנו hard economic boundary.

---

## ‏7.29 המטרה של Adaptive: לעבוד בתוך ה־Spread

‏IBKR מתארת את Adaptive כך ש־Market ואגרסיביות Limit יכולות לנסות להיסחר בין Bid ל־Ask במקום פשוט לקחת מיד את הצד הנגדי.

‏זה בדיוק trade-off שמעניין אותנו:

```text
pay less spread
vs
wait longer and risk missing momentum
```

---

## ‏7.30 שלוש רמות Priority: `Urgent`, ‏`Normal`, ‏`Patient`

> ‏אימות אחרון: `2026-10-27`.

‏ב־API IBKR מתעדת:

```text
Urgent
Normal
Patient
```

‏כ־`adaptivePriority`.

‏ה־priority שולטת במשך/אופי החיפוש אחרי price improvement: ‏`Urgent` סורקת לזמן קצר יותר, בעוד `Patient` מחכה יותר במטרה להגדיל סיכוי למחיר טוב.

---

## ‏7.31 למה `Patient` עלולה להיות לא מתאימה ל־Signal שלנו

‏אם Signal life הוא:

```text
800 ms
```

‏אין הרבה ערך ב־Algo שמוכנה להיות סבלנית מעבר לחיי ה־Alpha.

‏לכן אצלנו אין הגיון לבחור Priority לפי שם בלבד.

‏נשווה:

```text
Adaptive Urgent
Adaptive Normal
Adaptive Patient
```

‏מול actual signal lifetime distribution.

---

## ‏7.32 `Urgent` אינה מילה נרדפת ל־Marketable Limit + IOC

‏גם Adaptive Urgent עדיין נותנת ל־Broker Algo לנהל execution בתוך framework של Adaptive.

‏לעומת זאת:

```text
Marketable Limit + IOC
```

‏אומרת בצורה יותר deterministic:

```text
execute immediately within cap
cancel remainder
```

‏לכן אלו Challengers שונים, לא שתי דרכים לכתוב אותו דבר.

---

## ‏7.33 `Adaptive` מול Passive Limit

‏Passive Limit:

```text
we choose exact price and waiting policy
```

‏Adaptive:

```text
broker manages part of aggressiveness/search path
```

‏Adaptive יכולה לחסוך client-side repricing ולמצוא in-spread opportunities, אבל פחות קל להסביר מראש בדיוק מה היא תעשה בכל microstate.

---

## ‏7.34 `Adaptive` מול `Relative/Pegged-to-Primary`

‏`Relative` פועלת לפי reference/offset/cap semantics מוגדרות יחסית.

‏`Adaptive` היא Broker Algo רחבה יותר שמחפשת execution לפי priority ו־SmartRouting.

‏לכן:

```text
Relative = explicit pricing rule
Adaptive = delegated execution policy
```

‏למחקר שלנו שניהם חשובים משום שהם בודקים שתי פילוסופיות שונות של אוטומציה.

---

## ‏7.35 `Adaptive` מול `MidPrice`

‏`MidPrice` מכוונת מפורשות ל־NBBO midpoint או טוב יותר.

‏`Adaptive` מכוונת לאיזון בין fill speed ל־price improvement לפי priority.

‏כלומר:

```text
MidPrice objective = midpoint-oriented price improvement
Adaptive objective = configurable speed/price trade-off
```

‏ב־spread רחב, שניהם יכולים להיות מעניינים — מסיבות שונות.

---

## ‏7.36 `Adaptive Limit` צריכה Hard Cap אמיתי

‏אסור להשתמש ב־Adaptive כדי להתחמק מהשאלה:

```text
what is the maximum economically acceptable buy price?
```

‏ה־Broker Algo משפר execution **בתוך** intent שאנחנו מגדירים; הוא לא אמור להחליט עבורנו אם העסקה עצמה עדיין כלכלית.

---

## ‏7.37 API של Adaptive

> ‏אימות אחרון: `2026-10-27`.

‏ב־TWS API התבנית המתועדת היא רעיונית:

```text
algoStrategy = "Adaptive"
adaptivePriority = "Urgent" | "Normal" | "Patient"
```

‏וב־Web API קיימת גם תמיכה ב־`strategy = Adaptive` וב־`strategyParameters`.

‏בנוסף, Web API מספק endpoint לקבלת algos זמינים ל־Contract — דבר שמחזק את עקרון runtime capability discovery.

---

## ‏7.38 Broker Algo לא מכירה את ה־Alpha שלנו

‏זו הנקודה הקריטית ביותר.

‏IBKR יכולה לדעת:

```text
quotes
venues
routing state
execution opportunities
```

‏אבל היא אינה יודעת בהכרח:

```text
our signal just decayed
wave reversed
our scanner found a better stock
our expected edge fell below threshold
```

‏לכן כל Broker Algo חייבת להישאר כפופה ל־:

```text
application TTL
signal validity
hard cap
cancel policy
```

---

## ‏7.39 מה קורה אם Signal מת בזמן שה־Algo עובדת?

‏המנוע צריך לשלוח Cancel ולהתייחס אליו בדיוק כמו לכל Order:

```text
cancel requested
!=
cancel confirmed
```

‏Broker-managed execution לא מבטלת fill/cancel races.

‏לכן Algo Order עדיין שייכת לאותה Execution State Machine שלנו.

---

## ‏7.40 `MidPrice` מזווית Routing

‏בחלק 5 למדנו את ה־pricing semantics.

‏כאן חשוב לראות את routing role: IBKR מתעדת ש־MidPrice יכולה לבחור Exchange עם סיכוי גבוה ל־Pegged-to-Midpoint, להשתמש ב־IEX `D-Peg`, או ליפול ל־native/simulated Relative כאשר אין יעד מתאים.

‏כלומר MidPrice היא דוגמה מצוינת ל־:

```text
one client intent
=> multiple possible broker execution paths
```

---

## ‏7.41 מה עם `VWAP`, ‏`TWAP`, ‏`Arrival Price`, ‏`POV` ו־`Minimize Impact`?

‏אלה Algos מקצועיות מאוד, אבל פותרות בדרך כלל בעיה אחרת משלנו:

```text
large order
longer execution horizon
benchmark tracking
market-impact control
participation scheduling
```

‏ב־Position קטן שרוצה להיכנס ולצאת בתוך שניות, scheduling לאורך זמן בדרך כלל מתנגש עם signal half-life.

‏נכיר אותן לעומק המספיק כדי לא לפספס רעיון רלוונטי, אבל לא נהפוך אותן ל־baseline.

---

## ‏7.42 `Arrival Price`

‏הרעיון הוא לנהל execution ביחס ל־arrival-price benchmark תוך איזון בין urgency ל־market impact.

‏זה חשוב Institutional Execution, אבל אצלנו arrival horizon קצר כל כך שהשאלה המרכזית אינה כיצד לפרוס Order לאורך עשרות דקות — אלא אם בכלל ניתן לבצע את Edge לפני שהוא מת.

‏לכן `Arrival Price` היא כרגע `Low relevance / conceptual value`.

---

## ‏7.43 `TWAP` ו־`VWAP`

‏`TWAP` מפזרת execution לפי זמן; `VWAP` מכוונת לדפוסי volume/benchmark.

‏אם אנחנו רוצים כמות קטנה יחסית בסיגנל שחי שניות, פיצול מתוזמן יכול להיות בדיוק ההפך ממה שאנחנו צריכים.

‏עם זאת, הן מלמדות עיקרון חשוב:

> ‏Order גדולה צריכה לפעמים להיחשב Schedule של Child Orders, לא פקודה אחת.

‏העיקרון הזה יכול להיות שימושי בעתיד אם Size שלנו יגדל.

---

## ‏7.44 `Percent of Volume`

‏POV מכוונת participation יחסית ל־market volume.

‏היא שימושית כאשר רוצים לא להיות חלק גדול מדי מה־flow.

‏לנו היא הופכת רלוונטית רק אם:

```text
our size is materially large relative to short-horizon volume
```

‏אם הגודל שלנו קטן, המורכבות כנראה אינה מוצדקת.

---

## ‏7.45 `Minimize Impact`

‏המטרה היא לעבוד Order בדרך שמנסה לצמצם market impact.

‏זה מקצועי מאוד לכמות משמעותית.

‏אבל עבור Signal שחי שניות, חיפוש איטי אחרי minimal impact יכול לעלות יותר ב־missed move מההשפעה שחסכנו.

---

## ‏7.46 `Dark Ice`

‏Dark/Iceberg-oriented Algo רלוונטית כאשר Size ו־signaling הם בעיה.

‏למנוע קטן היא אינה baseline.

‏אם בעתיד נראה בנתונים:

```text
our displayed size changes book behavior
```

‏נפתח אותה מחדש כ־Research Candidate.

---

## ‏7.47 `Accumulate / Distribute`

‏IBKR מתעדת אותה כ־Algo שמחלקת Order גדולה ל־increments בגודל ובזמנים שיכולים להיות randomized, במטרה לעבוד volume בלי לחשוף את מלוא הכוונה; היא אף מציינת שאפשר להגדיר אותה ל־high-frequency trading.

‏אבל עצם האפשרות להריץ אותה בתדירות גבוהה אינה אומרת שהיא מתאימה ל־momentum signal של שניות.

‏אצלנו random time slicing יכולה להמשיך לעבוד אחרי שה־Alpha המקורי כבר נעלם.

---

## ‏7.48 Third-Party Algos — למה לא נרוץ אליהן מוקדם

‏IBKR מציגה גם Algos של צדדים שלישיים עם dark seeking, participation ו־venue logic מתקדמים.

‏הבעיה עבורנו אינה שהן "רעות", אלא שהן מוסיפות:

```text
opaque decision layer
vendor-specific semantics
additional capability dependencies
harder reproducibility
```

‏לפני שנכניס שכבה כזו, baseline שלנו עם Orders/IBKR Algos פשוטות צריך להיות חזק ומדיד.

---

## ‏7.49 `SMART` היא Baseline — לא אמת מוחלטת

‏במנוע הראשון סביר להשתמש ב־SMART כ־baseline רחב מפני שהוא מפחית צורך במודל Venues עצמאי.

‏אבל אסור לקבוע:

```text
SMART is always best
```

‏אם נתונים יראו ש־Directed route מסוים משפר execution עבור regime ספציפי, ניתן לקדם אותו.

‏החלטה כזו חייבת להיות evidence-driven.

---

## ‏7.50 מתי Direct הופכת Candidate רצינית

‏למשל כאשר:

```text
specific order type requires it
specific venue repeatedly shows better fill quality
we need deterministic midpoint semantics
we need ATS-specific behavior
we can model venue fees/latency/rejections reliably
```

‏כלומר Direct צריכה לפתור Problem מוגדר, לא להיות optimization לשם optimization.

---

## ‏7.51 מתי Broker Algo הופכת Candidate רצינית

‏כאשר:

```text
we want broker-side reaction faster than client loop
spread is meaningful
price improvement matters
signal lifetime leaves room for search
we can bound price and time
```

‏והיא מסוכנת כאשר:

```text
signal dies extremely fast
behavior is too opaque for our controls
cancel latency dominates
we cannot measure actual path
```

---

## ‏7.52 Routing Policy Object במנוע

‏במקום מחרוזת:

```text
route = SMART
```

‏נרצה מודל עשיר יותר:

```text
RoutingPolicy {
  mode                 // SMART | DIRECT | IB_ALGO
  destination
  smart_variant
  broker_algo
  broker_algo_params
  dark_liquidity_policy
  cost_consideration
  max_route_latency_ms
  application_ttl_ms
  fallback_policy
}
```

‏כך Strategy אינה צריכה לדעת פרטים של Broker.

---

## ‏7.53 `Execution Intent` נשאר מעל Routing

‏ה־Strategy אומרת למשל:

```text
BUY
urgency = HIGH
signal_ttl = 900ms
max_price = 50.04
partial_fill_ok = true
```

‏Execution Policy יכולה לבחור:

```text
SMART MARKETABLE_LIMIT IOC
```

‏או:

```text
ADAPTIVE LIMIT URGENT
```

‏או:

```text
DIRECT PEGGED_MIDPOINT
```

‏בלי לשנות את ה־Signal עצמו.

---

## ‏7.54 Routing Capability Model

‏לכל Contract/Route נשמור רעיונית:

```text
valid_exchanges
supported_order_types
supported_algos
smart_available
direct_available
session_constraints
outside_rth_support
```

‏ולא נניח שכל Capability גלובלית של IBKR זמינה לחשבון/Contract/Route שלנו.

---

## ‏7.55 `IBKR Israel` — למה לא כותבים YES/NO גורף

‏התיעוד הרשמי שבדקנו הוא תיעוד מוצר/API גלובלי של IBKR ואינו נותן בכל Order Type תשובת `IBKR Israel = yes/no` פשוטה.

‏לכן לפני Live נבדוק בפועל:

```text
account legal entity
trading permissions
contract
route
API path
paper/live behavior
```

‏וגם נשתמש ב־runtime capability endpoints / ContractDetails כאשר הם רלוונטיים.

---

## ‏7.56 `TWS API` ו־Smart Routing

> ‏אימות אחרון: `2026-10-27`.

‏תיעוד TWS API מציג Smart Routing options גם ב־API, כולל `SMART` ו־`SMART DarkOnly`, ובשווקים מסוימים options נוספים כגון preferences ל־rebate/fill.

‏מבחינת architecture, Router Adapter צריך להיות configurable ולא לקודד string אחד בכל מקום.

---

## ‏7.57 API אינו Router בפני עצמו

‏IBKR מתעדת של־TWS API אין "לוגיקה עסקית" משל עצמה מעבר להעברת messages; validation והחלטות מתבצעות ב־TWS/servers.

‏לכן:

```text
our API client
-> TWS/Gateway/IBKR infrastructure
-> routing/algo logic
```

‏ולא:

```text
our Python library itself performs SmartRouting
```

‏ההבחנה הזו חשובה ל־latency diagnostics.

---

## ‏7.58 Venue Outage ו־Rejection

‏גם Routing טובה צריכה Failure Policy.

‏נשמור reason codes ונבדיל בין:

```text
unsupported order type
invalid route
venue unavailable
broker validation reject
price constraint reject
algo unavailable
```

‏תגובה אוטומטית לכולן ב־"שלח Market" תהיה מסוכנת.

---

## ‏7.59 Stale Market Data + Live Broker Algo

‏תרחיש מסוכן:

```text
our data feed freezes
broker algo remains alive
```

‏ה־Broker עדיין יכול לבצע לפי הנתונים והמערכת שלו, בעוד המנוע המקומי כבר לא יודע אם Signal תקף.

‏לכן market-data health failure צריך להיות trigger ל־cancel/freeze policy מוגדרת.

---

## ‏7.60 Split-Brain בין Router ל־Signal Engine

‏כאשר Broker Algo מנהלת execution וה־Signal Engine מנהל validity, יש שתי מערכות החלטה.

‏צריך חוזה ברור:

```text
broker may optimize HOW
engine owns WHETHER the intent is still valid
```

‏ברגע שה־intent מת — המנוע מבקש Cancel ומתחיל reconciliation.

---

## ‏7.61 Research Matrix לחלק 7

‏ל־core entry הייתי משווה לפחות:

| Candidate | Routing/Algo | מטרה |
|---|---|---|
| `MARKETABLE_LIMIT_IOC_SMART` | SMART | ‏baseline אגרסיבי ותחום |
| `PASSIVE_LIMIT_SMART` | SMART | ‏baseline פסיבי |
| `ADAPTIVE_LIMIT_URGENT` | IB Algo | ‏price improvement קצר עם urgency גבוהה |
| `ADAPTIVE_LIMIT_NORMAL` | IB Algo | ‏יותר search מול latency |
| `MIDPRICE_SMART` | SMART | ‏midpoint search |
| `PEGGED_MID_DIRECT` | Direct | ‏midpoint deterministic יותר לפי Venue |
| `RELATIVE_SMART` | SMART | ‏broker-managed repricing |

‏Direct Venue-specific plain limits יתווספו רק כאשר יש Hypothesis מוגדרת.

---

## ‏7.62 הניסוי חייב להשוות Opportunities, לא רק Fills

‏אותו כלל מחלקים קודמים:

```text
filled orders only
```

‏ייצר bias.

‏לכל Signal opportunity נרשום מה היה קורה לכל routing candidate, כולל:

```text
filled
partial
no fill
missed move
slippage
fees
markout
exit cost
```

---

## ‏7.63 Telemetry שחייבים להוסיף ל־Routing

```text
routing_mode
requested_destination
actual_execution_venue
smart_variant
broker_algo
broker_algo_priority
algo_parameters
dark_policy
liquidity_flag
venue_fee
venue_rebate
route_submit_ts
route_ack_ts
first_fill_ts
all_fill_venues
fill_count
reroute_count_if_observable
```

‏ולכל Fill:

```text
fill_venue
fill_price
fill_qty
fill_ts
maker_taker_flag_if_available
fee_component
```

---

## ‏7.64 Metrics מרכזיים

```text
fill_rate_by_route
partial_fill_rate_by_route
time_to_first_fill_by_route
time_to_full_fill_by_route
price_improvement_vs_arrival
implementation_shortfall
all_in_fee_bps
markout_100ms
markout_500ms
markout_1s
markout_5s
missed_move_after_no_fill
cancel_latency
reject_rate
net_edge_per_signal_by_route
```

‏זו הדרך להחליט אם Smart/Direct/Adaptive באמת עוזרים.

---

## ‏7.65 Failure Modes שחייבים לבדוק

```text
SMART order fills across multiple venues
Direct venue has no liquidity
Direct order type rejected by venue
venue goes unavailable
market moves during reroute
partial fill then route behavior changes
Adaptive outlives signal
Adaptive cancel races with fill
MidPrice receives no midpoint liquidity
DarkOnly produces repeated no-fill
market data freezes while broker algo remains live
fees differ from expected venue model
contract validExchanges changed
algo unavailable for contract
```

---

## ‏7.66 Acceptance Tests לפני Live

```text
1. SMART marketable limit full fill
2. SMART marketable limit split fill
3. SMART IOC partial then cancel remainder
4. Direct venue full fill
5. Direct venue no-fill
6. Direct unsupported order type reject
7. Adaptive Limit Urgent full fill
8. Adaptive Limit Urgent partial fill
9. Adaptive cancel before fill
10. Adaptive cancel racing with fill
11. MidPrice fill at midpoint/better
12. MidPrice no-fill then TTL cancel
13. Directed midpoint rejection/fallback policy
14. Market-data stale while broker algo live
15. Reconnect with algo order still active
16. Verify actual venue/fees from executions
17. Verify ContractDetails/validExchanges capability
18. Verify account-specific availability in paper/live environment
```

---

## ‏7.67 מטריצת התאמה ראשונית למנוע שלנו

| כלי | התאמה ראשונית | יתרון מרכזי | סיכון מרכזי |
|---|---|---|---|
| `SMART` | `High/Baseline` | ‏multi-venue search בלי Router מקומי | ‏פחות determinism |
| Direct plain Limit | `Medium/Advanced` | ‏Venue control | ‏missed liquidity/model risk |
| `Adaptive Limit Urgent` | `High/Challenger` | ‏price/speed trade-off עם cap | ‏behavior פחות deterministic מ־IOC |
| `Adaptive Limit Normal` | `High/Challenger` | ‏יותר price improvement potential | ‏signal decay בזמן search |
| `Adaptive Patient` | `Low/Research` | ‏מחיר אולי טוב יותר | ‏זמן המתנה כנראה ארוך מדי ל־core signal |
| `MidPrice` | `High/Challenger` | ‏SMART midpoint search | ‏no-fill / broker path opacity |
| `SMART DarkOnly` | `Low/Advanced` | ‏non-displayed liquidity focus | ‏missed move / unknown liquidity |
| `IBKR ATS Direct` | `Advanced Challenger` | ‏ATS-specific behavior | ‏destination dependence |
| `VWAP/TWAP/POV` | `Low now` | ‏scheduling/impact control | ‏horizon mismatch |
| `Accumulate/Distribute` | `Low now` | ‏large-order slicing | ‏signal half-life mismatch |

---

## ‏7.68 Recommendation ארכיטקטונית בשלב הזה

‏בגרסת Research ראשונה לא הייתי בונה Smart Order Router משלנו.

‏הייתי נותן ל־IBKR `SMART` להיות routing baseline, ובונה Router Adapter שמסוגל לבחור במפורש בין:

```text
SMART
DIRECT
IB_ALGO
```

‏ובתוך `IB_ALGO` מתחיל ב־:

```text
Adaptive Limit Urgent
Adaptive Limit Normal
MidPrice
```

‏לצד ה־baselines שכבר בנינו.

---

## ‏7.69 למה לא לבנות Router עצמאי מוקדם מדי

‏Router עצמאי דורש:

```text
venue data
latency model
fee model
order-type matrix
queue model
outage handling
continuous maintenance
```

‏אם גודל העסקאות שלנו קטן וה־Edge חי שניות, ייתכן שהמורכבות הזו לא תייצר מספיק improvement כדי להצדיק את עצמה.

‏קודם מודדים איפה SMART באמת נכשל עבורנו.

---

## ‏7.70 מתי כן לשקול Router עצמאי

‏רק אם הנתונים מראים patterns חוזרים כגון:

```text
specific venue consistently fills faster/better
specific order family requires direct access
SMART adds measurable delay in our regime
venue-specific queue behavior creates durable advantage
fees materially alter net edge
```

‏אז יש Hypothesis הנדסית שאפשר לבדוק.

---

## ‏7.71 Routing אינו Alpha

‏Router טוב יכול:

```text
reduce execution cost
improve fill probability
reduce latency
find hidden liquidity
```

‏אבל אינו הופך Signal חסר Edge לרווחי.

‏הוא מכפיל או שוחק Edge קיים.

---

## ‏7.72 Practitioner Secrets — הדברים שקל לפספס

### ‏1. `SMART` היא מערכת החלטה, לא Exchange

‏`SMART` יכולה להפנות Order למספר destinations לפי מצב השוק.

### ‏2. Direct אינה בהכרח מהירה יותר

‏Venue לא נכון יכול להיות איטי יותר במונחי time-to-fill גם אם path טכני קצר יותר.

### ‏3. Price Tie אינו Cost Tie

‏אותו מחיר displayed בשתי Venues יכול להגיע עם fee/rebate שונה.

### ‏4. NBBO אינו Liquidity Map

‏הוא לא חושף את כל hidden/midpoint/dark liquidity.

### ‏5. Broker Algo לא יודעת שה־Signal מת

‏TTL ו־cancel-on-decay נשארים באחריות שלנו.

### ‏6. `Adaptive Urgent` אינה `IOC`

‏האחת Broker execution policy; השנייה time-in-force semantics מיידית.

### ‏7. `MidPrice` היא גם Routing Decision

‏לא רק דרך לחשב מחיר.

### ‏8. Direct Routing יוצרת Technical Debt

‏ברגע שאנחנו בוחרים Venue לפי data, אנחנו צריכים לשמור את ה־Venue Model עדכני.

### ‏9. Routing Research בלי Fees הוא Research חסר

‏ב־Edge קטן, כמה basis points יכולים להפוך winner ל־loser.

### ‏10. Fill Venue חייבת להישמר לכל Fill

‏Average price בלבד מוחק את המידע שצריך כדי לשפר Router.

### ‏11. Dark Fill במחיר טוב יכול להיות Toxic

‏Price improvement חייבת להיבחן יחד עם post-fill markout.

### ‏12. פחות Client Messages אינם בהכרח ביצוע טוב יותר

‏Broker Algo יכולה לחסוך cancel/replace churn ועדיין להפסיד ב־missed opportunity או adverse selection.

### ‏13. Route Fallback היא החלטה חדשה

‏Order שנכשלה ב־Venue מסוים אינה אישור אוטומטי לשלוח אותה במקום אחר אם ה־Signal כבר השתנה.

### ‏14. Account Availability חייבת להיבדק בפועל

‏Global documentation אינה substitute לבדיקת Product/Legal Entity/Permissions/API path שלנו.

---

# ‏מקורות רשמיים לחלק 7

- ‏IBKR — SmartRouting / Best Price Execution: <https://www.interactivebrokers.com/en/trading/smart-routing.php>
- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR — Direct Routing בתוך Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — Smart Routing: <https://www.interactivebrokers.com/docs/tws-api/contracts/contract-management/smart-routing>
- ‏IBKR TWS API — Stock Contracts / SMART vs direct exchange: <https://www.interactivebrokers.com/docs/tws-api/contracts/stocks>
- ‏IBKR TWS API — Market Depth / Smart Depth: <https://www.interactivebrokers.com/docs/tws-api/doc/md/market-depth>
- ‏IBKR API — Adaptive Algo examples: <https://www.interactivebrokers.com/campus/?p=195739&post_type=ibkr-api-page>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Place Order / algo discovery: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/orders/place-order>
- ‏IBKR — Dark Pools glossary / SMART routing controls: <https://www.interactivebrokers.com/campus/glossary-terms/dark-pools/>

---

# ‏Checkpoint — סוף חלק 7

‏בחלק הזה הפרדנו בין שלוש רמות של delegation: ‏`SMART` נותנת ל־IBKR לבחור Venue; ‏Direct Routing מחזירה אלינו את בחירת ה־Venue; ו־Broker Algos כגון `Adaptive` ו־`MidPrice` מוסיפות גם החלטות execution מעבר לבחירת היעד. ירדנו לעומק של fragmentation, NBBO מול liquidity אמיתית, dark/hidden liquidity, fees/rebates, split fills, venue model, routing latency, fallback, capability discovery ו־telemetry.

‏המסקנה הראשונית למנוע שלנו היא ש־`SMART` צריכה להיות baseline רחבה ולא הנחה עיוורת; ‏Direct תקודם כאשר יש hypothesis מוכחת או Order Type שדורשת אותה; ו־`Adaptive Limit Urgent/Normal` יחד עם `MidPrice` צריכות להיכנס מוקדם ל־Research Harness מול `Marketable Limit + IOC`, ‏Passive Limit ו־Pegged families.

‏החלק הבא יהיה **חלק 8 — Cancel/Replace ו־Execution State Machine**: נרד לרמת lifecycle מלאה של modify/cancel, אובדן queue priority, duplicate/out-of-order events, idempotency, reconnect, late fills, broker truth, reconciliation ו־recovery כך שכל ה־Order Types שלמדנו עד עכשיו יוכלו לחיות בתוך מנוע Production אחד.