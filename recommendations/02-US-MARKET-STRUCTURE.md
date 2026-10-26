# ‏02 — Recommendation Sheet: US Market Structure

> ‏מקור לימודי עיקרי: `../02-HOW-US-STOCK-MARKET-WORKS.md`.
>
> ‏מטרת הקובץ: לתרגם את מבנה שוק המניות האמריקאי ל־Baseline מעשי עבור רובוט `Short-Horizon Momentum` אישי — בעיקר איך לחשוב על Venues, Routing, Order State, Sessions, Halts, Account Reality ו־Execution Quality לפני שמעמיקים בפרקי Data, Order Types ו־Execution.

---

## ‏1. Decision

‏איזה מודל שוק וביצוע צריך להיות מובנה במערכת כבר מהגרסה הראשונה, כדי שהרובוט לא יתייחס לשוק האמריקאי כאילו הוא בורסה אחת, מחיר אחד וקריאת `BUY` סינכרונית אחת?

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`: לבנות על מודל שוק מפוצל, לא על “בורסה אחת”

‏המערכת צריכה להניח מלכתחילה:

```text
One symbol
→ multiple execution venues
→ multiple quotes / liquidity sources
→ broker/router decision
→ execution event(s)
→ broker state
```

‏אסור לקשור לוגיקה עסקית להנחה שמניה ש־`Nasdaq-listed` מתבצעת דווקא ב־`Nasdaq`, או שמקום הרישום הוא בהכרח מקום הביצוע.

### ‏`P1 — Preferred Default`: להפריד בין שלוש שכבות אמת

```text
Layer 1 — Market Observation
quotes / trades / timestamps / session / trading status

Layer 2 — Execution Reality
orders / acknowledgments / routes / fills / partial fills / rejects / cancels

Layer 3 — Account Reality
position / buying power / permissions / restrictions / broker connectivity
```

‏החלטת מסחר תקינה חייבת לעבור את שלושתן.

### ‏`P0 — Required Before Live Risk`: `Fill` הוא אמת הפוזיציה

‏המערכת לעולם לא תעדכן פוזיציה לפי הכמות שהתבקשה בלבד.

```text
requestedQty != positionQty
sentOrder     != executedTrade
cancelSent    != cancelConfirmed
```

‏ה־state המחייב מגיע מאירועי ביצוע/חשבון מאומתים.

### ‏`P0 — Required Before Live Risk`: Order State Machine מפורשת

‏כל פקודה חייבת להיות מנוהלת כ־state machine שמסוגלת להתמודד לפחות עם:

```text
created
submitted
acknowledged / working
partially filled
filled
cancel pending
canceled
rejected
unknown / reconciliation required
```

‏המערכת חייבת להיות נכונה גם כאשר אירועים מגיעים באיחור, מגיעים יותר מפעם אחת, או חוצים אירוע `cancel/replace`.

### ‏`P1 — Preferred Default`: להתחיל ב־Smart Routing כברירת מחדל

‏בשלב הראשון אין לבחור Venue ידנית כחלק מהאסטרטגיה.

‏ברירת המחדל היא Broker Smart Routing, תוך מדידת התוצאה בפועל:

```text
decision quote
→ order submit
→ acknowledgment
→ first fill
→ complete fill / cancel
→ realized execution price
→ later markout
```

‏`Direct Routing` יהיה Challenger בלבד אם Measurement יראה יתרון נטו עקבי לאחר עלויות, latency, fill probability ו־operational complexity.

### ‏`P1 — Preferred Default`: להתחיל במסחר הרגיל בלבד

‏ל־Baseline הראשוני אני ממליץ:

```text
Regular Trading Hours only
Exclude opening-auction transition initially
Exclude closing-auction transition initially
Exclude pre-market initially
Exclude after-hours initially
Exclude overnight initially
```

‏הסיבה אינה שהסשנים האחרים “רעים”, אלא שהם משנים נזילות, spread, routing, supported orders, volatility ו־failure surface.

‏כל Session נוסף ייכנס כ־Challenger נפרד עם Evidence משלו.

### ‏`P0 — Required Before Live Risk`: מצב שוק חריג = Gate, לא Feature רגיל

‏אם קיימת אי־ודאות לגבי:

- ‏`halt`.
- ‏מצב מסחר לא רגיל.
- ‏stale market data.
- ‏broker disconnect.
- ‏buying power לא ידוע.
- ‏position/order state לא reconciled.

‏ברירת המחדל היא:

```text
NO TRADE
```

‏אין לנסות “להחליק” מצב לא ידוע באמצעות Score טוב יותר.

---

## ‏3. Why

### ‏Fact

‏שוק המניות האמריקאי הוא שוק מפוצל בין מספר Exchanges ומקומות ביצוע; מקום הרישום של מניה אינו אומר שכל עסקה מתבצעת בו.

### ‏Fact

‏פקודה שנשלחה לברוקר אינה עסקה שבוצעה. פקודה יכולה להידחות, להתבצע חלקית, להתבטל, להמשיך לעבוד או להתמלא במספר ביצועים.

### ‏Fact

‏Quote הוא תצפית על מצב שוק בזמן מסוים, לא הבטחה למחיר שבו הפקודה שלנו תתבצע.

### ‏Fact

‏בארה״ב קיימת חובת `Best Execution`, אך היא אינה מבטיחה שהפקודה הבודדת שלנו תקבל “מחיר מושלם”. Execution quality תלויה בין היתר במחיר, מהירות, סיכויי ביצוע ומאפייני הפקודה והשוק.

### ‏Fact — verified 2026-10-26

‏מחזור הסליקה הסטנדרטי לרוב עסקאות Broker-Dealer בניירות ערך אמריקאיים הוא `T+1` לפי כלל ה־SEC שנכנס למסגרת המחייבת ב־2024.

### ‏Judgment

‏באסטרטגיה שמחפשת Edge קטן לאורך שניות, שגיאת Execution של סנטים בודדים יכולה למחוק חלק גדול מה־Edge. לכן Market Structure ו־Execution State אינם שכבת Infrastructure צדדית; הם חלק מהאסטרטגיה הכלכלית.

### ‏Hypothesis

‏לגודל החשבון והפקודות שלנו, Broker Smart Routing ייתן Baseline טוב יותר מ־Direct Routing מבחינת יחס של Execution Quality למורכבות.

‏זו אינה Fact. היא צריכה להיבדק אמפירית כאשר יהיו מספיק Orders ו־Execution telemetry.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד כאשר:

- ‏ה־holding horizon הוא שניות עד עשרות שניות.
- ‏מטרת הרווח לעסקה קטנה ולכן עלויות Execution משמעותיות.
- ‏סורקים Universe רחב ולא בונים אסטרטגיה סביב Venue יחיד.
- ‏המערכת צריכה להיות Broker/Data-provider agnostic ככל האפשר.
- ‏עדיין אין Evidence שמצדיק Venue-specific routing או session-specific tactics.
- ‏המערכת נמצאת בשלבי Research, Replay, Paper/Shadow או Live מוקדם ומבוקר.

---

## ‏5. Do Not Use When

‏אין להעתיק את ה־Baseline כמו שהוא כאשר:

- ‏האסטרטגיה עצמה היא Venue-specific.
- ‏המחקר הוכיח Edge שנובע במפורש מ־microstructure של Venue מסוים.
- ‏Direct Routing הוא חלק מה־signal/execution contract שנבדק OOS וב־live-like conditions.
- ‏האסטרטגיה מיועדת במפורש ל־auction, pre-market, after-hours או overnight.
- ‏ל־Broker/Account בפועל אין את היכולות שה־Baseline מניח.

‏במצבים אלה צריך Recommendation ייעודית ולא חריגה שקטה מהכללים.

---

## ‏6. Alternatives

| אפשרות | מתי לשקול | יתרון עיקרי | מחיר/סיכון עיקרי | דרגה |
|---|---|---|---|---|
| Broker Smart Routing | ‏Baseline כללי | ‏מורכבות נמוכה יחסית וניצול מנגנון routing של הברוקר | ‏פחות שליטה ושקיפות לעומת routing ייעודי | `Preferred Default` |
| Direct Routing | ‏לאחר Evidence על Venue/tactic מסוים | ‏שליטה גבוהה יותר ביעד הביצוע | ‏מורכבות, venue rules, queue behavior ועלויות | `Challenger` |
| Multi-router / custom venue selection | ‏רק אחרי telemetry עמוק | ‏יכולת לבצע optimization עצמאי | ‏מערכת execution מורכבת מאוד וסיכון ל־false optimization | `Advanced` |
| Regular-hours only | ‏Baseline | ‏פחות regimes חריגים ויותר פשטות מחקרית | ‏מוותרים על הזדמנויות מחוץ לשעות | `Preferred Default` |
| Extended-hours support | ‏לאחר מחקר נפרד | ‏יותר שעות והזדמנויות | ‏נזילות/Spread/Rules שונים | `Challenger` |
| Auction-specific trading | ‏רק לאסטרטגיה ייעודית | ‏גישה למנגנון מסחר ייחודי | ‏לא דומה למסחר הרציף הרגיל | `Specialist` |

---

## ‏7. Trade-offs

### ‏Smart Routing מול Direct Routing

‏`Smart Routing` מפחית את מספר ההחלטות שהמערכת צריכה לקבל בזמן אמת, אבל מוותר על חלק מהשליטה ב־venue selection.

‏`Direct Routing` יכול להיות שימושי אם קיימת סיבה מדידה לבחור Venue מסוים, אך הוא גם מכניס:

- ‏Venue-specific rules.
- ‏Fee/rebate differences.
- ‏Queue differences.
- ‏Routing failures.
- ‏More configuration state.
- ‏More operational paths.

‏לכן שליטה רבה יותר אינה בהכרח Net Edge גדול יותר.

### ‏RTH-only מול Extended Hours

‏`RTH-only` מצמצם שונות תפעולית ומאפשר Validation נקי יותר.

‏Extended Hours מגדיל את Opportunity Window, אך גם יכול לשנות בצורה מהותית את:

- ‏Spread.
- ‏Depth.
- ‏Trade frequency.
- ‏Supported order behavior.
- ‏Volatility.
- ‏Routing.

‏לכן אין לערבב Sessions באותו Baseline בלי label ו־validation נפרדים.

---

## ‏8. What I Would Avoid Initially

### ‏`Avoid initially`: Direct Venue Optimization

‏לא הייתי מתחיל מ־routing logic משלנו לפני שקיים dataset של execution outcomes שמראה בעיה אמיתית ב־Baseline.

### ‏`Avoid initially`: Extended/Overnight Trading

‏לא הייתי מכניס אותם לגרסה הראשונה של ה־research-to-live path.

### ‏`Avoid initially`: הנחה ש־Best Execution פותר Execution Quality

‏הברוקר כפוף לחובות ביצוע, אבל המערכת שלנו עדיין צריכה למדוד את התוצאה שלה עצמה.

### ‏`Avoid initially`: בניית State מתוך UI או מתוך “מה ששלחנו”

‏ה־state צריך להגיע מ־Broker/API events ומ־reconciliation, לא מהנחה מקומית.

### ‏`Avoid unless measured`: Venue-specific Fee/Rebate Optimization

‏Rebate או fee נמוך אינם מספיקים אם fill probability, latency או adverse selection מחמירים.

### ‏`Avoid entirely for our baseline`: Silent Unknown State

‏אין מצב שבו state של Order/Position/Broker אינו ידוע והמערכת ממשיכה כאילו הכול תקין.

---

## ‏9. What to Add Later

‏לאחר שיש Baseline עובד ו־Execution telemetry מספק, אפשר לבדוק בהדרגה:

1. ‏Direct Routing כ־Challenger.
2. ‏Venue-level execution attribution.
3. ‏Router comparison.
4. ‏Session-specific models.
5. ‏Opening/closing auction research.
6. ‏Extended/overnight sessions.
7. ‏Venue-specific queue/fill modeling.
8. ‏Fee/rebate-aware execution economics.
9. ‏Rule 605/606 execution-quality data ככל שהוא שימושי להערכת broker/router.
10. ‏Dynamic routing policy לפי symbol/regime/order characteristics.

‏כל תוספת צריכה לפתור בעיה שנמדדה, לא רק להוסיף תחכום.

---

## ‏10. Required Data / Evidence

‏לפני שינוי משמעותי ב־Market Structure / Routing baseline יש לאסוף לפחות:

```text
symbol
session
signal timestamp
market-data timestamp
decision timestamp
order submit timestamp
broker acknowledgment timestamp
order type
requested quantity
requested/limit price
routing mode
execution venue when available
fill timestamps
fill quantities
fill prices
cancel/replace timestamps
reject reason
broker/order status sequence
position before/after
buying power before/after where available
reference bid/ask at decision
reference bid/ask at submit
reference bid/ask at fill
fees
realized slippage
post-fill markout
```

‏בלי telemetry כזה אי אפשר לדעת אם שינוי Routing באמת שיפר Execution.

---

## ‏11. Promotion Criteria

### ‏לקידום Direct Routing מ־Challenger

‏נדרוש Evidence שמראה על sample מספיק ובכמה market regimes:

- ‏שיפור מובהק ב־net execution cost או realized net edge.
- ‏אין הידרדרות בלתי מקובלת ב־fill probability.
- ‏אין הידרדרות בלתי מקובלת ב־time-to-fill.
- ‏אין גידול מהותי ב־reject/cancel failure rate.
- ‏השיפור שורד OOS / forward validation.
- ‏השיפור שורד latency ו־cost stress.
- ‏היתרון גדול מעלות המורכבות התפעולית.

### ‏לקידום Session נוסף

‏נדרוש:

- ‏מודל נפרד ל־liquidity/spread/activity.
- ‏Execution simulation מתאים לאותו Session.
- ‏Broker/order support מאומת ועדכני.
- ‏Risk controls ייעודיים.
- ‏Net outcome חיובי OOS לאחר עלויות.

---

## ‏12. Rejection Criteria

‏נזנח Challenger אם:

- ‏השיפור קיים רק ב־gross price ולא ב־net outcome.
- ‏הוא תלוי בתקופה קצרה או symbols בודדים.
- ‏הוא נעלם ב־forward/OOS.
- ‏הוא מגדיל fill uncertainty יותר מהערך שהוא מוסיף.
- ‏הוא מגדיל incident/failure surface ללא יתרון כלכלי מספיק.
- ‏הוא מחייב הנחות על Broker/Venue שלא ניתן לאמת באופן אמין.
- ‏הוא משפר fee/rebate אך מחמיר markout או adverse selection.

---

## ‏13. Metrics

### ‏Primary

- ‏`Net execution cost` ביחס ל־reference quote.
- ‏`Realized net edge` לאחר execution costs.
- ‏`Fill probability`.
- ‏`Time to first fill`.
- ‏`Time to complete fill / cancel`.

### ‏Execution Diagnostics

- ‏Slippage versus decision quote.
- ‏Slippage versus submit quote.
- ‏Average fill price.
- ‏Partial-fill rate.
- ‏Reject rate.
- ‏Cancel-race incidence.
- ‏Order-state reconciliation incidents.
- ‏Venue distribution.
- ‏Price improvement frequency/size.
- ‏Post-fill markout.

### ‏Operational Diagnostics

- ‏Broker disconnect rate.
- ‏Unknown-state duration.
- ‏Reconciliation frequency.
- ‏Stale-data gate frequency.
- ‏Halt/session gate frequency.
- ‏Orders blocked by buying-power/permission checks.

---

## ‏14. Failure Modes

### ‏Order assumed filled before confirmation

‏גורם ל־phantom position ולפקודת יציאה שגויה.

### ‏Partial fill ignored

‏המערכת מנהלת risk לפי 100% position למרות שבוצע רק חלק — או להפך.

### ‏Cancel race

‏המערכת שולחת `cancel`, מניחה שהפקודה נעלמה, ובינתיים מתקבל Fill.

### ‏Duplicate / reordered broker events

‏State machine לא idempotent עלולה להכפיל כמות או להעביר state אחורה.

### ‏Stale quote treated as current price

‏ה־scanner או execution gate משתמשים במחיר שכבר אינו קיים.

### ‏Listing venue confused with execution venue

‏לוגיקה שגויה מייחסת מחיר/נזילות למקום הלא נכון.

### ‏Halt treated as inactivity

‏מערכת עלולה לפרש עצירת מסחר כירידה ב־activity במקום כמצב שוק חריג.

### ‏Extended-hours behavior mixed with RTH

‏המחקר מאחד regimes עם liquidity/execution שונים ומייצר conclusions מטעות.

### ‏Broker state unavailable but trading continues

‏זהו Failure Mode חמור: אין ודאות לגבי orders, positions או buying power.

### ‏Routing optimized to fee instead of outcome

‏Fee נמוך או rebate גבוה יכולים להיראות טוב בזמן ש־fill quality או adverse selection מחמירים.

---

## ‏15. User-Specific Application

‏עבור הרובוט שלנו, שעובד על `milliseconds → seconds → tens of seconds` ומחפש Edge קטן:

```text
Signal quality alone is insufficient.
Execution feasibility is part of candidate quality.
```

‏לכן Candidate שנראה מצוין מבחינת Momentum יכול להפוך ל־`NO TRADE` אם בזמן ה־execution recheck:

- ‏ה־quote התיישן.
- ‏ה־spread השתנה.
- ‏מצב המסחר אינו תקין.
- ‏הברוקר מנותק.
- ‏קיימת פקודה פתוחה סותרת.
- ‏ה־position state אינו ודאי.
- ‏אין buying power מאומת.

‏במילים אחרות, Rank #1 של ה־scanner אינו “פקודת קנייה”; הוא רק מועמד שנכנס לשכבת Execution Reality.

---

## ‏16. Concrete Baseline Contract

‏בגרסה הראשונה, לפני כל Order חדש, המערכת צריכה לעבור Gate דומה ל־:

```text
candidate selected
AND market data fresh
AND session == supported_session
AND trading_status == normal
AND symbol not halted
AND broker_connected
AND account_state_fresh
AND position_state_known
AND open_order_state_known
AND buying_power_sufficient
AND execution_price_still_feasible
=> order may be submitted

otherwise
=> NO TRADE
```

‏לא כל field חייב להגיע מאותו Provider, אבל האחריות הלוגית חייבת להיות ברורה.

---

## ‏17. Confidence

### ‏High

‏ביחס לעקרונות הבאים:

- ‏`Order != Fill`.
- ‏Position state חייב להיגזר מביצועים מאומתים.
- ‏השוק מפוצל למספר Venues.
- ‏Execution quality חייבת להימדד ולא להניח מראש.
- ‏מצב לא ידוע של Broker/Order/Position צריך לחסום Live entry.
- ‏Sessions שונים צריכים להיחקר בנפרד.

### ‏Medium

‏ביחס ל־Smart Routing כ־Baseline הטוב ביותר עבורנו.

‏זו ברירת מחדל הנדסית סבירה, אך ההכרעה הסופית צריכה להגיע מנתוני Execution שלנו ומה־capabilities/fees של הברוקר בפועל.

---

## ‏18. Time-Sensitive Facts

‏הנקודות הבאות דורשות אימות עדכני לפני הפעלה אמיתית:

1. ‏כללי `Regulation NMS`, לרבות tick sizes, access fees ויישום תיקונים חדשים. נכון ל־26 באוקטובר 2026, חלק מתיקוני ה־SEC ל־minimum pricing increments ול־access-fee caps מתוכננים למועד compliance בתחילת נובמבר 2026, ולכן אין לקבע ערכים כאלה בקוד ללא בדיקה מחדש.
2. ‏כללי `Best Execution` ו־order-routing disclosures הרלוונטיים לברוקר.
3. ‏Supported sessions ו־overnight capabilities.
4. ‏Supported order types בכל Session/Venue.
5. ‏IBKR/IBKR Israel routing choices, API behavior ו־venue support.
6. ‏עמלות, exchange fees, rebates ו־routing costs.
7. ‏Account permissions / cash-margin restrictions / day-trading restrictions.
8. ‏`T+1` וכל שינוי עתידי ב־settlement rules.
9. ‏Trading halt / LULD / overnight protection rules.

---

## ‏19. Current Verification Snapshot — 2026-10-26

‏לצורך ה־Sheet הזה בוצע אימות נקודתי מול מקורות רשמיים:

- ‏`SEC — Shortening the Securities Transaction Settlement Cycle`: ה־standard settlement cycle לרוב העסקאות הרלוונטיות הוא `T+1`.
- ‏`FINRA Rule 5310 / Best Execution`: Best Execution מבוסס reasonable diligence ו־execution quality; אין לפרש אותו כהבטחה ל־best possible outcome בכל order בודד.
- ‏`FINRA — trade lifecycle guidance`: פקודת לקוח עוברת לברוקר, שיכול לבצע או לנתב אותה ל־Exchange, ‏ATS או broker-dealer/wholesaler בהתאם למבנה הביצוע.
- ‏`SEC Regulation NMS`: קיימים שינויים רגולטוריים פעילים ב־2026, כולל compliance dates קרובים בנושאי pricing increments/access fees, ולכן פרמטרים venue/routing-specific מסומנים כ־time-sensitive.

‏האימות הזה אינו מחליף בדיקה מחודשת ביום שבו נבנה Live configuration.

---

## ‏20. Relationship to Later Recommendation Sheets

‏הקובץ הזה קובע את מודל השוק וה־control boundaries בלבד.

‏החלטות מפורטות ייקבעו בהמשך ב־Sheets ייעודיים:

- ‏`03` — איזה Bid/Ask/NBBO/Depth צריך לצרוך ואיך לפרש Queue.
- ‏`04` — Order types וטקטיקות Order.
- ‏`05` — Market Data stack.
- ‏`06` — Sampling/Latency/Freshness budgets.
- ‏`11` — Liquidity ו־Executability.
- ‏`16` — Entry execution.
- ‏`17` — Exit execution.
- ‏`18` — True costs / Net Edge.
- ‏`29–32` — Broker/API/Data-provider boundaries.
- ‏`30` — IBKR/IBKR Israel capabilities לאחר אימות עדכני.

‏אין להעמיס את כל ההחלטות האלה לתוך Market Structure Sheet.

---

# ‏Recommendation Summary

```text
P0  Fill-driven position truth
P0  Explicit order state machine + reconciliation
P0  Unknown broker/order/account/trading state => NO TRADE
P1  Model the US market as fragmented multi-venue infrastructure
P1  Separate Market / Execution / Account reality
P1  Smart Routing as initial routing default
P1  Regular Trading Hours only for initial baseline
P2  Add venue/session attribution and deeper execution analytics
P3  Direct Routing as measured challenger
P4  Custom venue-selection / specialist auction or overnight tactics
```

> ‏**המלצת ה־Baseline: אל תבנה רובוט שחושב “מצאתי מניה → שלחתי BUY → יש לי פוזיציה”. בנה רובוט שחושב “מצאתי מועמד → בדקתי Market/Execution/Account reality → שלחתי Order → קיבלתי state/fills מאומתים → ורק אז קיימת פוזיציה אמיתית”.**
