# ‏חלק 9 — `IBKR` Capability Matrix: מתיעוד ל־Production Enablement

## ‏9.1 מטרת החלק: להפסיק לשאול `Supported = Yes/No`

‏אחרי שמונה חלקים ברור שהשאלה "האם IBKR תומך ב־Order X?" צרה מדי. תמיכה אמיתית היא צירוף של כמה ממדים:

```text
product
region
contract
account permissions
legal entity
platform
API
route / destination
session
order-type combination
native vs broker-managed behavior
observed acceptance and fill semantics
```

‏לכן Capability אצלנו אינה `boolean`. היא Record מתועד, ניתן לאימות ועם רמת אמון.

---

## ‏9.2 ארבע קטגוריות שאסור לערבב במטריצה

‏לא כל דבר שאנחנו מכנים "פקודה" הוא אותו סוג capability:

```text
PRICE ORDER TYPE      -> Market, Limit, Stop, MidPrice...
ORDER ATTRIBUTE / TIF -> IOC, AON, MinQty, Hidden, Post Only...
COMPOSITE STRUCTURE   -> Bracket, OCA/OCO relationships
ROUTING / BROKER ALGO -> SMART, Direct, Adaptive, ATS...
```

‏ההפרדה חשובה משום ש־`Marketable Limit` היא למשל **התנהגות של `LMT` ביחס לשוק**, לא Order Type נפרדת; `Bracket` היא מערכת של Orders קשורות; ו־`Adaptive` היא Broker Algo שמקבלת Order בסיסית ומנהלת חלק מה־execution.

---

## ‏9.3 תאריך וגבולות האימות

> ‏אימות מטריצת המקור: `2026-10-27`.

‏המטריצה להלן מבוססת על תיעוד רשמי עדכני של IBKR. היא אומרת מה IBKR מתעדת ברמת המוצר והפלטפורמה — **לא** שהחשבון הספציפי שלנו כבר עבר acceptance test לכל שילוב.

‏במיוחד, אין להסיק מכאן:

```text
IBKR global docs say supported
=> our account + stock + route + API accepts it
```

---

## ‏9.4 מקרא רמות האישור שלנו

‏כל capability במנוע תקבל `enablement_state`:

```text
DOC_ONLY
RUNTIME_CONFIRMED
PAPER_ACCEPTED
LIVE_SMALL_ACCEPTED
PRODUCTION_ENABLED
```

### ‏`DOC_ONLY`

‏קיימת בתיעוד, אבל עדיין לא הוכחנו אותה אצלנו.

### ‏`RUNTIME_CONFIRMED`

‏Contract/API runtime metadata מצביעים שהשילוב רלוונטי, או שה־Broker קיבל validation/preview מתאים.

### ‏`PAPER_ACCEPTED`

‏Happy Path ו־failure cases שה־Paper environment מסוגלת לייצג עברו.

### ‏`LIVE_SMALL_ACCEPTED`

‏נבדקה בכמות קטנה ובסיכון מוגבל בסביבה אמיתית, כולל callbacks ו־reconciliation.

### ‏`PRODUCTION_ENABLED`

‏רק לאחר שה־semantics, telemetry, recovery ו־risk invariants הוכחו.

‏אין קיצור דרך מ־`DOC_ONLY` ל־`PRODUCTION_ENABLED`.

---

## ‏9.5 מטריצת Core Price + Time/Fill Policy

| Capability | מניות US | UI מתועד | Routing | צורת API / הערה | Implementation / Caveat | התאמה למנוע |
|---|---|---|---|---|---|---|
| `Market` | ‏כן | `TWS`, Desktop, Mobile, Client Portal | Smart, Directed | `orderType=MKT` ב־TWS API | ‏IBKR יכולה להפעיל price-protection/simulation | `Medium`; בעיקר Exit דחופה |
| `Limit` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | `LMT` + `lmtPrice` | ‏Fill לא מובטח | `High/Baseline` |
| `Marketable Limit` | ‏כן | דרך `Limit` | Smart, Directed | ‏אין primitive נפרד; `LMT` שחוצה/פוגש שוק | ‏יכולה להפוך resting אם אין `IOC` | `High/Baseline` |
| `DAY` | ‏כן | רחב | לפי Order | `tif=DAY` | ‏לא תחליף ל־TTL אפליקטיבי | `High` עם TTL מקומי |
| `GTC` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | `tif=GTC` | ‏Recovery/stale-order risk | `Low` ל־core entry |
| `GTD` | ‏כן | `TWS`, Desktop | Smart, Directed | `tif=GTD` + expiration | ‏לא מיועד בהכרח ל־sub-second TTL | `Low/Medium` |
| `IOC` | ‏כן | `TWS`, Desktop | Smart, Directed | `tif=IOC` | ‏Partial now, cancel remainder | `High/Baseline Challenger` |
| `FOK` | ‏לא כ־stock baseline | `TWS`, Desktop | Smart, Directed | ‏תלוי מוצר | ‏בתיעוד הנוכחי: US Options only | `Not Core` |
| `AON` | ‏כן | TWS, Desktop, Mobile, Client Portal | Smart | `allOrNone` | ‏עשויה להיות broker-simulated | `Low/Advanced` |
| `MinQty` | ‏תלוי Contract/Route | API-oriented capability | תלוי Venue | `minQty` ב־TWS API | ‏נדרש runtime/acceptance validation | `Advanced Challenger` |
| `Market-to-Limit` | ‏כן | TWS, Desktop, Mobile | Smart, Directed | ‏Order family נפרדת | ‏remainder חוזרת כ־Limit במחיר ה־fill | `Research/Medium` |

---

## ‏9.6 למה `FOK` מסומנת אצלנו במפורש כלא־Baseline למניות

‏זה בדיוק סוג הטעות שמטריצה מונעת. `FOK` היא מושג מוכר בעולם המסחר, אך בקטלוג IBKR הנוכחי היא מתועדת ל־`Options Only` בארה״ב.

‏לכן Adapter של מניות לא יציע:

```text
stock_execution_mode = FOK
```

‏רק מפני שה־enum או מונח כללי מוכרים לנו.

---

## ‏9.7 `AON` — תמיכה אינה אומרת Native

‏IBKR מתעדת `AON` למניות אמריקאיות דרך `SMART`, אבל כאשר ה־primary exchange אינו תומך בה Native, IBKR יכולה להחזיק את ה־Order ולדמות אותה.

‏במצב המתועד למניות US, ה־NBBO צריך להתאים ל־Limit וגודל ה־NBBO צריך להיות לפחות:

```text
order size + 1000 shares
```

‏לפני ניסיון ביצוע simulated.

‏מכאן שעמודת `Supported` בלי עמודת `Implementation Path` הייתה מטעה.

---

## ‏9.8 מטריצת Liquidity / Price-Adaptive Capabilities

| Capability | מניות US | UI מתועד | Routing | מי מנהל | Caveat מרכזי | התאמה לנו |
|---|---|---|---|---|---|---|
| `Post Only` | ‏תלוי route | בעיקר API/route-specific | Route-specific | Broker/Venue | ‏field קיים אינו הוכחת support לכל destination | `High` כ־guardrail אחרי validation |
| `Hidden` | ‏כן | `TWS Only` | Smart, Directed | Native או IBKR simulated | ‏priority/latency יכולים להשתנות | `Low/Advanced` |
| `Iceberg / Reserve` | ‏כן | `TWS Only` | Smart, Directed | Broker/Venue | ‏slice/replenishment semantics | `Low/Advanced` |
| `Relative / Pegged-to-Primary` | ‏כן | `TWS`, Desktop | Smart, Directed, IBKR ATS | Broker/Venue | ‏SMART asymmetry לעומת Directed | `High/Challenger` |
| `Pegged-to-Midpoint` | ‏כן | `TWS`, Desktop | Directed / IBKR ATS | Venue/Broker path | ‏US stock דורשת Direct route | `High/Challenger` |
| `MidPrice` | ‏כן | TWS, Desktop, Mobile, Client Portal | Smart | IBKR | ‏execution path יכול להשתנות | `High/Challenger` |
| `Snap to Market` | ‏כן | `TWS`, Desktop | Smart, Directed | IBKR simulated | ‏מחיר מחושב פעם אחת | `Medium/High` |
| `Snap to Midpoint` | ‏כן | `TWS`, Desktop | Smart, Directed | IBKR simulated | ‏מחיר קופא ועלול להתיישן | `High/Challenger` |
| `Snap to Primary` | ‏כן | `TWS`, Desktop | Directed | IBKR simulated | ‏Directed + stale-price risk | `Medium/High` |
| `IBKR ATS Pegged-to-Best` | ‏כן | כל הפלטפורמות לפי catalog הנוכחי | Directed | IBKR ATS | ‏ATS-specific | `Advanced` |
| `IBKR ATS Pegged-to-Midpoint` | ‏כן | כל הפלטפורמות המרכזיות | Directed | IBKR ATS | ‏destination-specific | `Advanced` |

---

## ‏9.9 `Relative` — אותה משפחה, semantics שונות לפי Routing

‏ה־matrix אינה יכולה לכתוב רק:

```text
Relative = Supported
```

‏כי ב־Directed Relative הפקודה יכולה לצוף בשני כיווני השוק, בעוד ב־SMART Relative קנייה יכולה לעלות עם ה־NBB בלי לרדת איתו אוטומטית, ומכירה יכולה לרדת עם ה־NBO בלי לעלות איתו אוטומטית.

‏לכן capability key נכון יותר הוא:

```text
RELATIVE + SMART
RELATIVE + DIRECT(destination)
```

‏ולא `RELATIVE` בלבד.

---

## ‏9.10 `Pegged-to-Midpoint` מול `MidPrice` — מטריצה שמונעת alias שגוי

```text
PEGGED_TO_MIDPOINT:
    routing = DIRECT / ATS
    venue-specific behavior

MIDPRICE:
    routing = SMART
    IBKR-managed midpoint-oriented execution
```

‏אם Adapter מתרגם את שתיהן ל־`MIDPOINT`, איבדנו מידע מהותי על route, determinism ו־failure modes.

---

## ‏9.11 `Snap` — Supported, אבל ב־IBKR Simulated

‏IBKR מתעדת את שלוש משפחות `Snap` כפקודות מדומות על כל ה־exchanges.

‏לכן בטבלת runtime נשמור גם:

```text
implementation_owner = IBKR_SIMULATED
```

‏ונמדוד `quote_at_submit`, ‏computed price, ‏ack ו־first working state. אחרת Backtest יכול לחשוב שה־Venue עצמה מפעילה primitive שאינו קיים שם.

---

## ‏9.12 מטריצת Stops / Protection / Relationships

| Capability | מניות US | UI מתועד | Routing | TWS API primitive | Caveat | התאמה לנו |
|---|---|---|---|---|---|---|
| `Stop` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | `STP`, `auxPrice`, `triggerMethod` | ‏Native או simulated; Fill price לא מובטח | `High` להגנה |
| `Stop Limit` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | `STP LMT` | ‏Triggered-but-unfilled risk | `Medium/High` |
| `Trailing Stop` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | trail fields | ‏noise / premature exit | `Research` |
| `Trailing Stop Limit` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | trail + limit offset | ‏יכול להישאר Position לאחר trigger | `Research` |
| `Adjustable Stop` | ‏כן | כל הפלטפורמות המרכזיות | Smart, Directed | adjusted-order fields | ‏Broker-managed transition | `Advanced Challenger` |
| `Conditional` | ‏כן | `TWS`, Mobile לפי catalog | Smart, Directed | `conditions` | ‏עשויה להיות simulated | `Advanced` |
| `Bracket` | ‏כן | `TWS`, Desktop, Mobile | Smart, Directed | `parentId`, `transmit` | ‏Composite; partial/race semantics חייבות בדיקה | `High Protection Challenger` |
| `OCA/OCO` | ‏כן | `TWS` ל־OCA | Smart, Directed | `ocaGroup`, `ocaType` | ‏Cancellation אינה atomic | `High` כחלק מ־exit correctness |

---

## ‏9.13 `Bracket` מקבלת Gate קשוח יותר משאר הפקודות

‏גם אם `Bracket` מופיעה בקטלוג ותומכת במניות, לא נאפשר `PRODUCTION_ENABLED` לפני בדיקות מפורשות של:

```text
parent full fill
parent partial fill
parent cancel + late fill
child activation timing
child rejection
TP partial
stop trigger
sibling cancel race
double-exit prevention
manual position change
disconnect/reconnect
process restart
```

‏הסיבה היא ש־Bracket אינה רק בחירת מחיר. היא מנהלת **מבנה Position Protection**.

---

## ‏9.14 `OCA` — Capability עם אזהרה מובנית

‏IBKR עצמה מזהירה שאין guarantee שבקשת Cancel/Modify של OCA תגיע ל־Exchange לפני Order שכבר מתבצעת.

‏לכן ה־capability record שלה יכיל למשל:

```text
atomic_cancel = false
late_sibling_fill_possible = true
reconciliation_required = true
```

‏כך אזהרה מקצועית הופכת ל־machine-readable safety property.

---

## ‏9.15 מטריצת Routing ו־Broker Algos

| Capability | מניות US | UI | Routing Mode | מי מנהל | התאמה לנו |
|---|---|---|---|---|---|
| `SMART` | ‏כן | רחב | Smart | IBKR Router | `High/Baseline` |
| Direct Routing | ‏כן | כל הפלטפורמות המרכזיות | Directed | אנחנו בוחרים destination | `Medium/Advanced` |
| `Adaptive` | ‏כן | TWS, Desktop, Mobile | `IB Algo` | IBKR Algo | `High/Challenger` |
| `MidPrice` | ‏כן | כל הפלטפורמות המרכזיות | Smart | IBKR | `High/Challenger` |
| `SMART DarkOnly` | ‏תלוי Contract/route | API/routing option | Smart variant | IBKR | `Low/Advanced` |
| `IBKR ATS` | ‏כן | כל הפלטפורמות המרכזיות | Directed | IBKR ATS | `Advanced` |
| `VWAP/TWAP/POV` | ‏כן בחלק מהמקרים | Algo-specific | IB Algo | IBKR | `Low` כרגע |
| `Accumulate/Distribute` | ‏כן | `TWS Only` | Smart, Directed, IBKR ATS | IBKR/TWS algo | `Low` כרגע |

---

## ‏9.16 `Adaptive` — Order Type לא מספיק כדי לתאר Capability

‏רשומת capability צריכה לכלול גם:

```text
base_order_type = MARKET | LIMIT
adaptive_priority = URGENT | NORMAL | PATIENT
price_cap_required_by_our_policy
application_ttl
```

‏מבחינתנו `ADAPTIVE_LIMIT_URGENT` ו־`ADAPTIVE_MARKET_PATIENT` אינן אותו feature רק משום ששניהם Adaptive.

---

## ‏9.17 `TWS API` — Static Runtime Discovery

> ‏אימות אחרון: `2026-10-27`.

‏`ContractDetails` כולל לפחות:

```text
orderTypes
validExchanges
```

‏לכן startup/cache builder יכול לבנות לכל Contract תמונה ראשונית של Order families ושל destinations חוקיים.

‏זה אינו מספיק לבדו — משום ש־combination של TIF, attribute, session ו־route עדיין יכולה להידחות — אבל זו שכבת validation ראשונה טובה.

---

## ‏9.18 `Web API` — Runtime Rules עשירים יותר ברמת Contract

> ‏אימות אחרון: `2026-10-27`.

‏Endpoint ה־Contract Rules של Web API יכול להחזיר בין היתר:

```text
orderTypes
ibAlgoTypes
tifTypes
orderTypesOutside
algoEligible
allOrNoneEligible
displaySize
fraqTypes
cqtTypes
```

‏זה בדיוק סוג metadata שמאפשר לבנות Adapter שלא מניח capabilities גלובליות.

---

## ‏9.19 Web API אינה העתק של `TWS API`

‏Web API תומכת ב־advanced order types וב־IB Algos, ויש endpoint לקבלת algos זמינים ל־Contract. היא תומכת גם ב־Bracket וב־OCA בהקשר המתועד של endpoint ההזמנות.

‏אבל אנחנו לא מסיקים:

```text
TWS field exists
=> identical Web API field and lifecycle
```

‏לכל Adapter תהיה capability matrix משלו.

---

## ‏9.20 מבנה `CapabilityRecord` מוצע

```text
CapabilityRecord {
  broker
  adapter                 // TWS_API | WEB_API
  legal_entity
  account_scope
  conid
  symbol
  sec_type
  region
  capability_id
  base_order_type
  attributes
  tif_values
  routing_modes
  destinations
  outside_rth
  implementation_owner   // VENUE | IBKR | CLIENT | MIXED
  documented_platforms
  runtime_evidence
  acceptance_state
  last_verified_at
  source_version
  rejection_history
  notes
}
```

‏זה נראה כבד יותר מ־`supportsIOC=true`, אבל זו בדיוק המורכבות שה־Broker והשווקים עצמם מציגים.

---

## ‏9.21 Capability Key חייב לכלול Route כאשר Route משנה Semantics

‏דוגמאות:

```text
RELATIVE:SMART
RELATIVE:DIRECT:NASDAQ
PEGGED_MID:DIRECT:NASDAQ
PEGGED_MID:IBKR_ATS
MIDPRICE:SMART
```

‏אחרת cache אחד יכול לגרום למנוע לשלוח שילוב שנבדק במקום אחר אך אינו חוקי כאן.

---

## ‏9.22 Session היא חלק מה־Capability

‏גם Order שמתועדת ב־Regular Trading Hours לא בהכרח מקבלת אותה semantics מחוץ לשעות הרגילות.

‏Web API Contract Rules אף יכולה להחזיר `orderTypesOutside` בנפרד.

‏לכן capability key או policy צריכות להכיר:

```text
REGULAR
PRE_MARKET
AFTER_HOURS
OVERNIGHT
```

‏ולא להעתיק enablement מ־session אחת לאחרת.

---

## ‏9.23 `IBKR Israel` / Legal Entity — אין `YES` גורף

‏התיעוד הרשמי שאנחנו משתמשים בו הוא תיעוד מוצר/API של IBKR ברמה גלובלית. הוא אינו מספק לכל Order Type טבלת `IBKR Israel = yes/no` שמכסה את החשבון שלנו.

‏לכן ה־production gate האמיתי כולל:

```text
account legal entity
trading permissions
contract eligibility
route eligibility
API adapter
paper behavior
small-live behavior
```

‏כל עוד אחד מהשלבים לא אומת, לא נציג אותו כעובדה חשבונית מוחלטת.

---

## ‏9.24 Startup Capability Discovery

‏ב־startup או בתחילת session:

```text
1. identify account / adapter / environment
2. resolve contract
3. fetch ContractDetails or Web API rules
4. normalize supported order types
5. normalize TIFs
6. normalize valid routes / exchanges
7. normalize algos
8. merge static caveats
9. compare with last-known capability snapshot
10. freeze features whose assumptions changed
```

‏אם Capability קריטית השתנתה, Entry חדשה לא צריכה להמשיך כאילו לא קרה דבר.

---

## ‏9.25 Capability Cache צריכה Expiry ו־Version

‏לא נשמור:

```text
supports_midprice = true forever
```

‏אלא:

```text
verified_at
source
account
contract
route
adapter
software_version
```

‏Capabilities הן Data תלוית זמן.

---

## ‏9.26 Broker Rejection היא Data שמעדכנת את המודל

‏אם Runtime metadata אמרה ש־Order family זמינה אבל submit אמיתי נדחה, אין להתייחס לזה רק כ־error log.

‏נשמור:

```text
capability_expected = true
broker_result = REJECTED
reason_code
route
contract
payload_shape
```

‏ונוריד זמנית את ה־feature ל־:

```text
RUNTIME_CONFLICT
```

‏עד בירור.

---

## ‏9.27 Fallback לעולם אינו `Unsupported -> Market`

‏זה anti-pattern מסוכן.

‏אם `Pegged-to-Midpoint` נדחתה, אין משמעות לכך שהמנוע רשאי מיד לקנות Market.

‏Fallback חייב לחזור ל־Execution Policy:

```text
is signal still valid?
how old is it?
what is current spread?
what is economic cap?
what quantity remains?
what alternative capability is enabled?
```

‏רק אז אפשר לבחור `MidPrice`, ‏`Marketable Limit + IOC`, ‏Passive Limit או `NO TRADE`.

---

## ‏9.28 Acceptance Gate לפי משפחה

| משפחה | בדיקות חובה לפני enablement |
|---|---|
| Core `MKT/LMT/IOC` | ‏full/partial/no-fill, rejection, cancel race, price cap, reconnect |
| Passive/Post Only | ‏marketable-at-arrival behavior, reject/reprice, queue/markout |
| Hidden/Iceberg | ‏native/simulated path, slices, remainder, marketable transition |
| Pegged/Relative | ‏reference changes, cap reached, route semantics, cancel while repricing |
| Midpoint/Snap | ‏midpoint movement, no-fill, stale Snap, direct-route rejects |
| Stops | ‏trigger method, gap, trigger vs fill, outside-RTH behavior |
| Bracket/OCA | ‏partial parent, child reject, sibling race, reconnect, double-exit defense |
| Adaptive/Broker Algo | ‏priority behavior, TTL cancel, partial fills, reconnect, algo availability |
| Direct/ATS | ‏destination acceptance, actual venue, fees, no-liquidity fallback |

---

## ‏9.29 `Paper Accepted` אינה הוכחה מלאה ל־Live

‏Paper environment שימושית מאוד ל־state machine, payload validation וחלק מה־failure handling.

‏אבל היא לא יכולה להוכיח במלואה:

```text
real queue position
real hidden liquidity
real venue latency
real maker/taker economics
real adverse selection
all production routing behavior
```

‏לכן `PAPER_ACCEPTED` היא Gate חשובה — לא סוף תהליך האימות.

---

## ‏9.30 `Live Small` נועד לאמת Semantics, לא לרדוף אחרי P&L

‏מטרת `LIVE_SMALL_ACCEPTED` היא לבדוק בסיכון נמוך:

```text
broker acceptance
actual callbacks
route behavior
fill decomposition
cancel/modify races
fee data
reconnect behavior
```

‏הצלחה בשלב הזה אינה "האסטרטגיה רווחית"; היא אומרת שהתשתית מתנהגת כפי שהמנוע חושב.

---

## ‏9.31 מטריצת Enablement ראשונית למנוע שלנו

| Capability | Research priority | Production gate ראשוני |
|---|---|---|
| Passive `LMT` + short TTL | `Core` | ‏State machine + cancel-race accepted |
| Marketable `LMT + IOC` | `Core` | ‏Partial/no-fill + cap accepted |
| `SMART` | `Core Routing Baseline` | ‏venue/fill telemetry קיימת |
| `Relative/Pegged-to-Primary` | `High Challenger` | ‏SMART/Directed semantics נבדקו בנפרד |
| `MidPrice` | `High Challenger` | ‏fill/no-fill + TTL + route telemetry |
| Directed `Pegged-to-Midpoint` | `High Challenger` | ‏destination-specific acceptance |
| `Snap to Midpoint` | `High Challenger` | ‏stale-price + TTL tests |
| `Adaptive Limit Urgent/Normal` | `High Challenger` | ‏algo availability + cancel/reconnect |
| `Bracket / Hybrid Protection` | `High Safety Challenger` | ‏כל Failure Matrix של חלק 6 |
| `Stop` backstop | `High Safety` | ‏trigger/gap/session tests |
| `Post Only` | `High Passive Guardrail` | ‏route-specific behavior verified |
| `Hidden/Iceberg` | `Advanced` | ‏רק אם footprint hypothesis קיימת |
| `IBKR ATS pegged` | `Advanced` | ‏ATS-specific evidence |
| `AON/MinQty` | `Advanced/Low` | ‏רק אם partial-fill economics מצדיקות |
| `FOK` | `Not Core for US Stocks` | ‏לא להניח stock support |
| Long-horizon execution algos | `Low now` | ‏רק אם horizon/size משתנים |

---

## ‏9.32 מה מנוע ה־Scanner צריך לדעת ומה לא

‏ה־Scanner אינו צריך להכיר API enum של כל פקודה.

‏הוא צריך להוציא Intent כגון:

```text
urgency
signal_ttl
expected_edge
max_position
partial_fill_tolerance
```

‏Execution Engine לוקח Intent + Capability Matrix ומחליט אילו implementation candidates חוקיים.

‏כך שינוי Broker capability אינו דורש לשנות את ה־Signal model.

---

## ‏9.33 `Capability Resolver` במנוע

‏לפני יצירת Concrete Order:

```text
Intent
  ↓
Execution Policy candidates
  ↓
Capability Resolver
  ↓
filter unsupported / unaccepted combinations
  ↓
Rank or select allowed execution behavior
  ↓
Concrete Broker Order
```

‏אצלנו הדגש הוא אפילו על **elimination**: שילוב שלא עבר Gate פשוט אינו Candidate.

---

## ‏9.34 Capability Matrix היא גם Kill Switch ממוקד

‏אם מתברר ש־`Adaptive` התחילה להידחות אחרי שינוי Broker, אין צורך לעצור בהכרח את כל המנוע.

‏אפשר:

```text
ADAPTIVE = DISABLED_RUNTIME_CONFLICT
MIDPRICE = ENABLED
MARKETABLE_LIMIT_IOC = ENABLED
```

‏כך degradation נשלטת ומפורשת.

‏לעומת זאת, אם Capability קריטית להגנת Position — למשל protective Stop path — נכשלת, ייתכן שה־Risk Gate צריך לעצור Entries חדשות לחלוטין.

---

## ‏9.35 Telemetry של Capability

```text
capability_id
adapter
account_scope
conid
route
destination
session
documented_support
runtime_support
acceptance_state
last_verified_at
submit_attempts
accept_count
reject_count
last_reject_code
last_reject_message
implementation_owner
paper_test_version
live_test_version
```

‏ומדדים:

```text
reject_rate_by_capability
runtime_doc_mismatch_rate
capability_change_events
fallback_rate
fallback_success_rate
production_disable_events
```

---

## ‏9.36 Freshness Policy

‏Capabilities שתלויות ב־Broker אינן Specification פנימית קבועה.

‏נגדיר לפחות:

```text
verify docs before major release
refresh runtime contract capabilities at startup/session boundary
invalidate cache on relevant broker/config change
record last_verified_at
```

‏במקרה של conflict:

```text
runtime broker evidence > stale local cache
```

‏אבל rejection אחת אינה בהכרח הוכחה שה־feature הוסר גלובלית; מסווגים לפי Contract/Route/Account.

---

## ‏9.37 `UI Support` היא Evidence שונה מ־`API Support`

‏Order שמופיעה ב־TWS אינה הוכחה שה־Web API exposes בדיוק אותה semantics.

‏ומצד שני, `TWS API Order` יכולה לכלול attribute שאינו מוצג באותו אופן בכל UI.

‏לכן נשמור עמודות נפרדות:

```text
manual_ui_support
tws_api_representation
web_api_representation
```

‏ולא שדה `IBKR_SUPPORTED` יחיד.

---

## ‏9.38 `API Field Exists` אינה Capability Proof

‏אם `Order` object מכיל:

```text
allOrNone
minQty
displaySize
hidden
postOnly
```

‏זה מוכיח שה־API model יודע לייצג את הרעיון; זה לא מוכיח שכל US Stock דרך כל destination יקבל את השדה.

‏הוכחת capability היא:

```text
documented applicability
+
runtime contract/route evidence
+
broker acceptance
+
observed semantics
```

---

## ‏9.39 Native / Simulated / Broker Algo / Composite — למה זה חייב להיות Field

‏ארבע Orders שכולן "נתמכות" יכולות לחיות במקומות שונים:

```text
VENUE_NATIVE
BROKER_SIMULATED
BROKER_ALGO_MANAGED
COMPOSITE_RELATIONSHIP
```

‏ההבדל משפיע על:

```text
latency
survivability
market-data dependency
cancel behavior
queue behavior
failure domain
```

‏לכן `implementation_owner` הוא נתון execution מרכזי.

---

## ‏9.40 Recommendation — ה־Allowlist הראשונה שלנו

‏ל־Research Harness הייתי מאפשר מוקדם:

```text
LIMIT
PASSIVE_LIMIT_WITH_APP_TTL
MARKETABLE_LIMIT
MARKETABLE_LIMIT_IOC
SMART
RELATIVE_PRIMARY
MIDPRICE
SNAP_MIDPOINT
PEGGED_MIDPOINT_DIRECT
ADAPTIVE_LIMIT_URGENT
ADAPTIVE_LIMIT_NORMAL
```

‏ול־Risk/Protection Research:

```text
STOP
STOP_LIMIT
BRACKET
OCA
HYBRID_PROTECTION
```

‏אבל `PRODUCTION_ENABLED` לכל אחת מהן נשאר Gate נפרד.

---

## ‏9.41 מה לא נכנס אוטומטית ל־Allowlist

```text
FOK for stocks
AON as default
Hidden as default
Iceberg as default
DarkOnly as default
ATS-specific pegged as default
long-horizon scheduling algos
```

‏לא מפני שהן "גרועות", אלא מפני שהן פותרות בעיות שאינן baseline שלנו או דורשות evidence נוסף.

---

## ‏9.42 Practitioner Secrets — מה שמטריצת Support רגילה מפספסת

### ‏1. Support הוא Tuple

```text
(order family, product, route, destination, session, adapter, account)
```

‏לא checkbox.

### ‏2. `Marketable Limit` לא אמורה להופיע כ־Broker enum נפרד

‏היא behavior של `Limit` מול ה־Book.

### ‏3. `Bracket` אינה Primitive אחת

‏היא graph של Orders ולכן ה־Gate שלה צריך לבדוק Relationships ו־races.

### ‏4. `SMART` היא Route Policy

‏לא `Order Type` במובן של מחיר.

### ‏5. `Adaptive` היא Delegation

‏אנחנו מוסרים ל־Broker חלק מה־HOW, אך לא את ה־WHETHER.

### ‏6. Simulated אינו בהכרח רע

‏אבל הוא משנה failure domain וצריך להיות גלוי למנוע.

### ‏7. UI היא לא ה־API

‏Manual availability אינה הבטחת programmatic parity.

### ‏8. Runtime metadata אינה Truth מוחלטת

‏Submit אמיתי עדיין יכול להידחות בגלל combination/account/route.

### ‏9. Paper אינה Live

‏היא בודקת correctness רב — לא microstructure אמיתי מלא.

### ‏10. Fallback הוא Intent חדש

‏Unsupported Order אינה הרשאה להגדיל אגרסיביות.

### ‏11. Capability יכולה להיעלם בזמן

‏Cache חייבת freshness/versioning.

### ‏12. Production Feature הוא Order Type + Tests + Telemetry + Recovery

‏רק אז היא באמת capability של **המערכת שלנו**.

---

# ‏מקורות רשמיים לחלק 9

- ‏IBKR — Order Types and Algos: <https://www.interactivebrokers.com/en/trading/ordertypes.php>
- ‏IBKR TWS API — `ContractDetails` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/contract-details>
- ‏IBKR TWS API — `Order` reference: <https://www.interactivebrokers.com/docs/tws-api/ref/order>
- ‏IBKR Web API — Place Order: <https://www.interactivebrokers.com/docs/web-api/v1/endpoints/orders/place-order>
- ‏IBKR Web API — Contract Rules: <https://www.interactivebrokers.com/docs/web-api/api-reference/trading/trading-contracts/get-contract-rules>
- ‏IBKR TWS API — Modifying Orders: <https://www.interactivebrokers.com/docs/tws-api/doc/orders/modifying-orders>

---

# ‏Checkpoint — סוף חלק 9

‏בחלק הזה הפכנו את הידע על Order Types למודל Capability שהמנוע יכול להשתמש בו בפועל. במקום `supported=true`, הגדרנו תמיכה כתלות ב־Product, Contract, Route, Destination, Session, API Adapter, Account/Legal Entity ו־implementation owner; איחדנו את משפחות Core, Liquidity, Pegged/Midpoint/Snap, Stops/Bracket/OCA ו־Routing/Broker Algos; והגדרנו `Production Enablement Gates` מ־`DOC_ONLY` ועד `PRODUCTION_ENABLED`.

‏המסקנה המרכזית: **תיעוד אומר לנו מה כדאי לנסות; Runtime metadata אומרת מה נראה חוקי עכשיו; acceptance tests ו־Broker evidence אומרים במה המנוע רשאי באמת להשתמש.** שום fallback לא יגדיל אגרסיביות אוטומטית, ושום feature מתקדמת לא תיכנס ל־Production רק מפני שהיא מופיעה ב־UI או ב־API object.

‏החלק הבא יהיה **חלק 10 — Engine Decision Guide**: נחבר Signal state, urgency, spread, depth, expected edge, remaining signal life, position/fill state, exit feasibility ו־capabilities למנגנון החלטה אחד שבוחר Execution Behavior מתאים לכל מצב.