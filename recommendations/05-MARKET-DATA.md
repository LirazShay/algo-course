# ‏05 — Recommendation Sheet: Market Data

> ‏מקור לימודי עיקרי: `../05-MARKET-DATA-FOR-PERSONAL-ALGO.md`.
>
> ‏מטרת הקובץ: לקבוע איזה Market Data הוא Baseline עבור רובוט `Short-Horizon Momentum` אישי, איך לחלק בין Wide Scan ל־Deep Observation, מה חייב להיות חלק מ־Data Quality Contract, ומה נשאר Challenger עד שיש Evidence.

---

## ‏1. Decision

‏איזה מידע צריך לאסוף ולצרוך בכל שלב של הרובוט, באיזו רמת עומק וקצב, ואילו תנאי Data Quality חייבים לחסום החלטה לפני שמנסים לשפר Features או לקנות Feed יקר יותר?

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: אין מסחר בלי Data Provenance ו־Data State ידועים

‏לכל Market State שמשפיע על החלטת מסחר חייב להיות אפשר לדעת לפחות:

```text
provider
feed / entitlement
coverage / venue scope
market-data mode
symbol / canonical instrument id
event timestamp when available
receive timestamp
latest update timestamp
session / trading status
raw vs derived
quality flags
```

‏אסור להתייחס למספר מחיר כאל עובדה מספקת בלי לדעת מאיפה הוא הגיע ומתי.

### ‏`P1 — Preferred Default`: State-based tiered data architecture

‏ה־Baseline המומלץ הוא:

```text
SCANNING
Thousands of symbols
→ lightweight real-time breadth
→ enough data to rank/filter

CANDIDATE
Small shortlist
→ richer/faster quotes + recent activity
→ execution-feasibility recheck

POSITION
One/few symbols
→ highest-priority fresh monitoring
→ exit/risk decisions
```

‏המטרה היא:

> ‏`Enough data where it changes the decision`, לא `maximum data everywhere`.

### ‏`P1 — Preferred Default`: Wide Scanner על rich top-of-book + activity, לא Full Depth

‏ל־Wide Scan יש לשאוף לפחות ל־:

```text
last
last_size when available
bid
ask
bid_size
ask_size
market-data timestamp / age
recent trade count or enough raw events to derive it
recent volume or enough raw events to derive it
session / trading status
provider / coverage metadata
```

‏ומזה לחשב:

```text
spread_abs
spread_pct / bps
mid
change windows
trade-count windows
volume windows
quote_age
last_age
```

‏`Level 2` / full-depth אינו Baseline לכל ה־Universe.

### ‏`P1 — Preferred Default`: `Last` יכול להיות Research Signal, אבל לא Execution Reality

‏אפשר להשתמש ב־`Last` לבדיקת השערת Momentum ראשונית.

‏אבל לפני מסחר אמיתי:

```text
last-only candidate
→ fresh bid/ask recheck
→ spread / size / freshness / trading-status gate
→ TRADE / NO TRADE
```

‏אין לקדם Candidate למסחר רק משום שסדרת `Last` נראית טובה.

### ‏`P0 — Required Before Live Risk`: Real-Time / Delayed / Frozen / Not-Subscribed הם States מפורשים

‏הרובוט חייב לדעת מהו סוג הנתון שקיבל בפועל.

‏ברירת המחדל:

```text
REAL-TIME + valid freshness => eligible for live decision
DELAYED                     => not eligible for live decision
FROZEN                      => not eligible for live decision
NOT SUBSCRIBED / UNKNOWN    => not eligible for live decision
```

‏אין להניח ש־`requested live == received live`.

### ‏`P0 — Required Before Live Risk`: Freshness Gate

‏כל Symbol חייב לשאת Data Age מפורש.

```text
unknown age => invalid for live entry
age > supported budget => stale => NO NEW POSITION
```

‏ה־threshold המספרי המדויק ייקבע בפרק 06 לפי Measurement ו־regime, לא לפי מספר שרירותי שמקבעים כאן.

### ‏`P0 — Required Before Live Risk`: `No Change != No Data`

‏המערכת חייבת להבדיל בין:

```text
feed alive + no new market change
```

‏לבין:

```text
feed silent / disconnected / entitlement lost / state unknown
```

‏לכן נדרש Heartbeat/health model שאינו תלוי רק בשינויי מחיר.

### ‏`P1 — Preferred Default`: Streaming State + periodic scanner decisions

‏לא הייתי מריץ Ranking מלא של כל ה־Universe על כל Tick.

‏Baseline ארכיטקטוני:

```text
stream / updates
→ per-symbol rolling state
→ incremental feature maintenance
→ periodic scanner decision cadence
→ shortlist
→ deeper observation
```

‏כך שומרים מידע מהיר בלי להפוך כל market event ל־full-universe recomputation.

### ‏`P1 — Preferred Default`: Canonical Market State

‏ה־Scanner, ‏Execution layer וה־UI צריכים לצרוך אותה שכבת State מנורמלת או לפחות אותו Contract מפורש.

```text
External feeds
→ adapters
→ normalization
→ quality gates
→ canonical market state
→ features
→ scanner / execution / UI
```

‏אסור ש־Scanner יעבוד על Feed אחד ו־Execution על Feed אחר בלי attribution והשוואה מפורשת.

### ‏`P1 — Preferred Default`: Broker-independent internal schema

‏אין להפיץ שמות שדות של Provider לתוך כל המערכת.

‏לדוגמה:

```text
IBKR field 84
Provider X bestBid
Replay bid_price
```

‏כולם צריכים להפוך ל־internal contract דומה ל־:

```text
bid.price
bid.size
bid.event_time
bid.receive_time
bid.source
bid.quality
```

‏כך ניתן להחליף Provider, לעשות Replay ולהשוות Feeds בלי לשכתב את האסטרטגיה.

### ‏`P1 — Preferred Default`: Raw-enough persistence for Replay and future research

‏לא צריך לשמור כל Book event בכל השוק כבר מהיום הראשון.

‏כן צריך לשמור מספיק כדי לשחזר החלטות ולבדוק Hypotheses עתידיים.

‏Baseline:

```text
normalized market observations used by decisions
raw/provider fields needed for audit where practical
source timestamps + receive timestamps
quality flags
scanner snapshot / feature vector at decision
provider/feed/version metadata
```

---

## ‏3. Why

### ‏Fact

‏`Trade` ו־`Quote` הם מידע שונה: Trade מתאר ביצוע שכבר קרה; Quote מתאר מחיר/כמות מוצעים כעת.

### ‏Fact

‏`Streaming` אינו בהכרח `Tick-by-Tick`. Provider יכול לשלוח Streaming aggregate/snapshot-style updates ולא כל event בודד.

### ‏Fact

‏Feed ספציפי ל־Venue אינו בהכרח תמונת השוק המאוחדת. Coverage חלקי יכול ליצור ranking bias בין Symbols.

### ‏Fact

‏Historical data עשוי לעבור aggregation, correction, adjustment או filtering ולכן אין להניח שהוא זהה ל־live stream.

### ‏Fact — verified 2026-10-26

‏IBKR Web API Streaming Market Data מתועד כ־Top-of-Book / Level 1; מספר המנויים המקסימלי תלוי ב־Market Data Lines. ה־stream מתועד ככזה שמסתיים לאחר 15 דקות ודורש request מחדש לפני כן כדי לשמור רציפות.

### ‏Fact — verified 2026-10-26

‏IBKR Market Data Lines משותפות ל־TWS ול־API עבור אותו user; חריגה מהמכסה גורמת לבקשות נוספות להיכשל.

### ‏Fact — verified 2026-10-26

‏IBKR Specialized Market Data Lines מציינות ש־Tick-by-Tick scale הוא בקירוב 5% ממספר Market Data Lines, ו־Market Depth מוגבל אף יותר לפי tier.

### ‏Fact — verified 2026-10-26

‏ב־IBKR Web API אפשר לזהות availability/state כגון `RealTime`, ‏`Delayed`, ‏`Frozen`, ‏`Not Subscribed`, וכן האם הנתון `Consolidated` ו־Top-of-Book.

### ‏Fact — verified 2026-10-26

‏Nasdaq TotalView הוא Full Depth של orders המוצגים ב־Nasdaq Market Center עבור securities listed across U.S. exchanges; הוא אינו שקול ל־full depth של כל Venues בארה״ב.

### ‏Judgment

‏עבור Strategy שסורקת אלפי Symbols אבל מחזיקה לכל היותר מעט Positions, State-based allocation של Data Depth הוא יחס טוב יותר של Information Value ל־cost/complexity מאשר full-depth לכל השוק.

### ‏Hypothesis

‏Rich L1 + recent trade/activity features יספיקו ל־Wide Scanner שלנו, ו־Depth יוסיף ערך בעיקר בשלב Candidate/Execution ולא בשלב Universe-wide ranking.

‏זו אינה Fact. היא צריכה להיבדק באמצעות incremental-value experiments.

---

## ‏4. Data Requirement by Robot State

| State | Universe size | Recommended data | Priority | הערה |
|---|---:|---|---:|---|
| `SCANNING` | אלפים | `Last + BBO + sizes + timestamps + activity` | `P1` | רוחב לפני עומק |
| `SHORTLIST` | עשרות | אותו מידע בקצב/איכות גבוהים יותר | `P1` | Validation לפני ranking final |
| `CANDIDATE` | מעטות | fresh executable BBO, sizes, recent trades, richer activity | `P0/P1` | execution-feasibility gate |
| `ORDER_WORKING` | מעטות | freshest quote/order context + broker events | `P0` | price/queue/reprice/cancel decisions |
| `POSITION` | 1–מעטות | highest-priority quote/activity + broker state | `P0` | exit/risk monitoring |
| `REPLAY` | historical | same canonical schema as live where possible | `P1` | parity with live code path |

---

## ‏5. Minimum Baseline Schema

‏ה־internal model צריך להיות מסוגל לייצג לפחות:

```text
InstrumentId
Symbol
Provider
FeedName
Coverage
Session
TradingStatus
MarketDataMode

LastPrice
LastSize
LastEventTime
LastReceiveTime

BidPrice
BidSize
BidEventTime
BidReceiveTime

AskPrice
AskSize
AskEventTime
AskReceiveTime

DailyVolume        // when available
SequenceId         // when available
TradeCondition     // when available
QuoteCondition     // when available

ConnectionState
SubscriptionState
QualityFlags
UpdatedAt
```

‏Derived state כגון Spread, Mid, rolling changes ו־Trade Count צריך להיות מסומן כ־Derived ולא כ־Raw.

---

## ‏6. Data Quality Contract

### ‏`P0`: Missingness נשמרת כ־Missingness

‏אין:

```text
missing price => 0
```

‏אלא:

```text
missing price => null / unavailable + reason
```

### ‏`P0`: Invalid market state אינו הופך ל־Score נמוך בלבד

‏מצבים כגון:

```text
missing executable side
unknown data mode
stale critical quote
feed disconnected
invalid timestamp
unknown trading status
```

‏חייבים להיות מסוגלים לפסול Candidate לפני Ranking/Execution.

### ‏`P1`: Duplicate / out-of-order awareness

‏כאשר Provider מספק sequence/event ids יש להשתמש בהם.

‏כאשר לא, צריך לכל הפחות:

- ‏לשמור event time ו־receive time בנפרד.
- ‏לא להניח ש־receive order הוא event order.
- ‏לזהות duplicates ככל שניתן בלי למחוק legitimate repeated trades.

### ‏`P1`: Source-specific semantics נשמרים

‏Normalization אינה מחיקה של מקור המידע.

‏צריך לשמור attribution כדי שנוכל לענות:

```text
which provider?
which feed?
which coverage?
which data mode?
which source timestamp?
```

---

## ‏7. Wide Scan vs Deep Observation

### ‏Recommended Wide Scan

```text
real-time lightweight breadth
+ rich L1
+ activity
+ timestamps/freshness
+ quality/coverage metadata
```

### ‏Recommended Candidate Deepening

‏כאשר Symbol עובר ל־Top Candidates:

```text
higher-priority subscription
fresh quote recheck
recent event/activity window
size relative to intended order
possibly tick-by-tick / depth challenger
```

### ‏Why not Full Depth Everywhere

‏המחיר הוא:

- ‏subscription cost.
- ‏API/data-line limits.
- ‏processing.
- ‏storage.
- ‏normalization complexity.
- ‏replay volume.
- ‏more failure modes.

‏לכן Depth צריך להצדיק את עצמו ב־incremental Net Edge או Execution Quality.

---

## ‏8. Level 1 / Tick-by-Tick / Level 2 Recommendation Matrix

| Data mode | Recommended role | יתרון | סיכון/עלות | דרגה |
|---|---|---|---|---|
| Rich `L1` / Top-of-Book | Wide scanner baseline | broad, actionable, simpler | misses deeper book | `Preferred Default` |
| Trade stream | activity/momentum evidence | true executions | does not show current executable quote | `Preferred Default` |
| Aggregated streaming | broad state maintenance | scalable | not every market event | `Preferred Default` |
| Tick-by-Tick | Candidate/execution research | event granularity | strict limits + storage/processing | `Challenger` |
| Venue Level 2 | queue/depth research | deeper book view | venue-specific, incomplete market | `Challenger` |
| Full-depth venue feed | specialist microstructure | richest single-venue book | high complexity; not whole market | `Advanced/Specialist` |
| Full multi-venue depth | specialist infrastructure | broad depth | cost/complexity very high | `P4` |

---

## ‏9. Consolidated vs Venue-Specific

### ‏`P1 — Preferred Default`: Execution reference should know whether coverage is consolidated

‏עבור price/executability decisions, Feed Metadata חייב לציין אם:

```text
consolidated
venue-specific
proprietary composite
unknown
```

### ‏`Avoid`: להשוות Activity בין Symbols על Feed בעל coverage לא אחיד

‏אם Symbol A מקבל רוב פעילותו מ־Venue כלול ו־Symbol B לא, ranking יכול לשקף Provider Bias במקום Market Opportunity.

### ‏Challenger

‏Venue-specific feeds יכולים להוסיף signal/microstructure value, אך רק לאחר שמבודדים coverage effect ומוכיחים incremental value מול baseline רחב יותר.

---

## ‏10. Snapshot vs Streaming vs Event Stream

### ‏Snapshot

‏מתאים ל־:

- ‏POC.
- ‏periodic sanity checks.
- ‏slow/wide discovery כאשר SLA מתאים.

‏לא מתאים אוטומטית ל־execution timing של seconds/milliseconds.

### ‏Streaming state

‏זה ה־Baseline המועדף למערכת live:

```text
updates arrive
→ rolling state updated
→ scanner reads current normalized state
```

### ‏Tick/Event stream

‏להוסיף רק כאשר השאלה דורשת:

- ‏event ordering.
- ‏trade count מדויק יותר.
- ‏quote transitions.
- ‏fine-grained markout/execution modeling.

---

## ‏11. Bars Recommendation

### ‏`P1`: Bars טובים למחקר מהיר, לא כ־execution truth

‏Bars יכולים לשמש:

- ‏longer-window features.
- ‏exploration.
- ‏visualization.

‏אבל לא להוכיח Fill/Spread/Queue sequence בתוך Bar.

### ‏`Avoid`

‏לא לבנות backtest של execution ברמת שניות מתוך OHLC Bar בלבד ולהציג אותו כ־live-realistic.

---

## ‏12. Historical Data Policy

### ‏`P1`: Historical dataset מקבל Dataset Contract

‏לכל Dataset נשמור:

```text
provider
feed/product
coverage
raw/adjusted status
trade/quote/bar semantics
timezone
timestamp semantics
sampling / aggregation
session coverage
known corrections/filtering
collection period
schema version
```

### ‏`P0`: Corporate Actions handling מפורש

‏Split/reverse-split ושינויים אחרים אינם Price Move רגיל.

‏כל historical research חייב לדעת אם prices/volume adjusted או raw.

### ‏`P1`: Live/History parity נבדקת ולא מונחת

‏Promotion למחקר רציני דורש לבדוק כיצד Historical representation שונה מה־live observations שעליהם הרובוט באמת יחליט.

---

## ‏13. Replay Policy Link

‏Market Data baseline צריך להיות Replay-friendly.

‏המטרה:

```text
recorded normalized/raw observations
→ replay adapter
→ same canonical market-state contract
→ same feature/scanner code
```

‏אם Replay דורש גרסה אחרת של האסטרטגיה, Data Abstraction חלש מדי.

---

## ‏14. Heartbeat / Disconnect / Reconnect

### ‏`P0`: Feed Health הוא State Machine

‏לפחות:

```text
CONNECTING
LIVE
DEGRADED
STALE
DISCONNECTED
RECONNECTING
RECOVERING
READY
```

### ‏`P0`: Reconnect אינו רק Socket Reopen

‏לאחר Reconnect:

1. ‏לפסול freshness assumptions ישנים.
2. ‏לחדש subscriptions.
3. ‏להשיג authoritative current state כאשר אפשר.
4. ‏לזהות gaps / unknown period.
5. ‏לחדש scanner eligibility רק אחרי readiness gate.

### ‏`P0`: אין new-entry בזמן Data State לא ידוע

‏Positions קיימות יקבלו emergency policy ייעודית בפרקי Risk/Operations; כאן ההכרעה היא שלפחות **לא פותחים פוזיציה חדשה** על feed לא אמין.

---

## ‏15. Clock and Timestamp Policy

### ‏`P1`: UTC as internal storage default

‏לאחסן timestamps קנוניים ב־UTC, ולהמיר לתצוגה לפי צורך.

### ‏`P1`: Event Time + Receive Time

‏כאשר Source מספק event/exchange time, לשמור גם אותו וגם local receive time.

‏כך אפשר למדוד:

```text
source/event latency
network/provider delay
processing delay
age at decision
```

### ‏`P0`: Clock health

‏מערכת שחיה על seconds אינה יכולה להתעלם משעון מקומי שנסחף.

‏Thresholds ותהליך sync יוגדרו בפרק 06.

---

## ‏16. Instrument Identity

### ‏`P1`: Symbol הוא display key, לא primary identity יחיד

‏ה־internal schema צריך Canonical Instrument ID.

‏אפשר לשמור Provider IDs כגון `IBKR conId` כחלק מ־mapping, אבל לא להפוך Provider-specific ID ל־domain identity היחיד של כל המערכת.

‏נדרש mapping מפורש בין:

```text
canonical instrument
symbol
display exchange
listing venue
provider contract id
provider feed symbol
```

---

## ‏17. What I Would Avoid Initially

### ‏`Avoid`: Full L2/Depth לכל אלפי המניות

‏אין Evidence שמצדיק את העלות והמורכבות בשלב זה.

### ‏`Avoid`: Last-only live execution

‏מחקר Direction יכול להתחיל מ־Last; מסחר חי לא.

### ‏`Avoid`: Feed בלי Coverage Metadata

‏אם איננו יודעים אילו Venues/Events כלולים, קשה לפרש Activity ו־Price.

### ‏`Avoid`: Assuming UI data == API data

‏Entitlements/licensing ל־off-platform API יכולים להיות שונים ממה שרואים ב־TWS/UI.

### ‏`Avoid`: Treating delayed/frozen as degraded-but-tradable

‏ל־live strategy הם invalid ל־new-entry.

### ‏`Avoid`: Feature proliferation לפני Data Quality

‏עוד Indicators אינם פותרים stale/missing/incorrect data.

### ‏`Avoid`: Provider lock-in in scanner code

‏Adapter boundary צריך להיות מוקדם.

---

## ‏18. What to Add Later

1. ‏Tick-by-Tick shortlist subscriptions.
2. ‏Venue-specific depth.
3. ‏Book imbalance / microprice.
4. ‏Trade-condition filtering.
5. ‏Odd-lot specific research.
6. ‏Cross-provider redundancy.
7. ‏Provider quality scoring.
8. ‏Multi-feed arbitration.
9. ‏Full-depth replay datasets.
10. ‏Specialized auction/NOII feeds.
11. ‏Automatic entitlement/config drift detection.
12. ‏Feed-specific latency telemetry.

‏כל אחד מהם צריך לפתור Gap שנמדד.

---

## ‏19. Required Evidence Before Buying/Adding More Data

‏לפני מעבר מ־Baseline Feed ל־Feed עשיר/יקר יותר, נדרוש:

```text
explicit information gap
examples where baseline decision failed because data was missing
candidate additional feed/field
expected decision improvement
incremental cost
incremental processing/storage load
replay availability
forward/OOS evaluation plan
```

‏השאלה אינה:

> ‏“האם Feed X מקצועי יותר?”

‏אלא:

> ‏“האם Feed X משנה החלטות מספיק כדי לשפר Net outcome או Safety?”

---

## ‏20. Promotion Criteria

### ‏לקידום Tick-by-Tick ליותר Symbols

‏נדרוש:

- ‏incremental predictive/execution value מול rich-L1 baseline.
- ‏השיפור נשמר OOS/forward.
- ‏השיפור גדול מעלות subscription/compute/storage.
- ‏ה־system עומד בעומס בלי לפגוע freshness.
- ‏Replay מסוגל לשחזר את אותם features.

### ‏לקידום Level 2 / Depth

‏נדרוש:

- ‏Depth-derived feature מוסיף value אחרי controlling for L1/activity.
- ‏Coverage/Venue bias ידוע.
- ‏השיפור נשמר אחרי transaction costs.
- ‏השיפור אינו תלוי בכמה anecdotes של “wall” שנראה טוב על מסך.
- ‏queue/depth semantics מובנים מספיק ל־research defensible.

### ‏לקידום Provider נוסף

‏נדרוש לפחות אחת מהסיבות:

- ‏Universe breadth שאינו קיים כיום.
- ‏freshness/latency טובים יותר ומדידים.
- ‏coverage טוב יותר.
- ‏reliability/redundancy gap מוכח.
- ‏historical/replay capability שחסר.
- ‏עלות כוללת נמוכה יותר לאותו SLA.

---

## ‏21. Rejection Criteria

‏נזנח Feed/Field/Depth Challenger אם:

- ‏הוא משפר gross signal metric אך לא net decision outcome.
- ‏הוא יוצר latency/processing load שמוחקים את הערך.
- ‏הוא אינו זמין היסטורית ולכן אי אפשר לבצע validation סביר, בלי compensating live experiment design.
- ‏coverage שלו יוצר bias שקשה לשלוט בו.
- ‏הוא דורש vendor-specific coupling משמעותי בלי ערך מוכח.
- ‏הערך נעלם OOS/forward.
- ‏הוא מוסיף data volume אבל לא incremental information.

---

## ‏22. Metrics

### ‏Coverage

- ‏Universe symbols eligible / requested.
- ‏Subscription success rate.
- ‏Real-time entitlement rate.
- ‏Provider/Venue coverage distribution.

### ‏Freshness

- ‏Quote age distribution.
- ‏Trade age distribution.
- ‏P50/P95/P99 receive delay where event time exists.
- ‏Symbols rejected by freshness gate.

### ‏Quality

- ‏Missing-field rate.
- ‏Invalid/crossed/locked state rate by provider where applicable.
- ‏Duplicate rate.
- ‏Out-of-order rate.
- ‏Gap/reconnect incidence.

### ‏Reliability

- ‏Feed uptime.
- ‏Disconnect frequency.
- ‏Recovery duration.
- ‏Subscription renewal failures.
- ‏Entitlement drift incidents.

### ‏Economic/Research Value

- ‏Incremental Net Edge by data tier.
- ‏Incremental candidate precision.
- ‏Execution-quality improvement from deeper data.
- ‏Missed/false candidates attributable to data gaps.
- ‏Storage/compute cost per incremental value.

---

## ‏23. Failure Modes

### ‏Delayed data silently used as live

‏הרובוט מקבל החלטה טובה על שוק מלפני 15–20 דקות.

### ‏Frozen data after close treated as live

‏מחיר נראה תקין אך אינו מתעדכן.

### ‏Feed disconnect interpreted as quiet market

‏`No Data` הופך בטעות ל־`No Change`.

### ‏Partial-feed ranking bias

‏Symbols מקבלים Scores שונים בגלל venue coverage שונה, לא בגלל opportunity אמיתי.

### ‏Streaming assumed tick-by-tick

‏Trade Count/ordering מחושבים כאילו כל event התקבל, למרות aggregation.

### ‏Event/receive timestamps conflated

‏אי אפשר למדוד data age או latency אמיתי.

### ‏Reconnect resumes on stale local state

‏המערכת ממשיכה מיד בלי authoritative refresh.

### ‏Provider-specific fields leak into strategy

‏אי אפשר לעשות Replay/Provider swap בלי שינוי אסטרטגיה.

### ‏Historical/live semantic mismatch

‏Backtest משתמש dataset שעבר aggregation/adjustment שלא קיים live.

### ‏Depth mistaken for entire U.S. market

‏Full book של Venue מסוים מוצג כאילו הוא כל liquidity.

### ‏Corporate action mistaken for momentum/crash

‏Split/reverse split מייצר Feature קיצוני שקרי.

---

## ‏24. Current Verification Snapshot — 2026-10-26

‏אימות נקודתי מול מקורות רשמיים עדכניים:

1. ‏`IBKR Web API — Market Data Request`: Streaming market data הוא Top-of-Book / Level 1; ה־maximum subscriptions תלוי ב־Market Data Lines; stream מתועד ככזה שמסתיים לאחר 15 דקות ויש לרענן request לפני כן לשמירת רציפות.
2. ‏`IBKR — Market Data Lines`: TWS watchlists ו־API משתמשים באותה מכסת lines של user; מעבר למכסה גורם לבקשות נוספות להיכשל.
3. ‏`IBKR — Specialized Market Data Lines`: Tick-by-Tick scale הוא בקירוב 5% ממכסת Market Data Lines; Market Depth מוגבל לפי tier נפרד.
4. ‏`IBKR Web API — Market Data Availability`: ניתן לזהות Real-Time / Delayed / Frozen / Not-Subscribed וגם Snapshot/Consolidated/Book metadata.
5. ‏`IBKR — TWS Data vs API Data`: Data חינמי/מוצג ב־TWS אינו בהכרח מורשה דרך API; off-platform entitlements יכולים להיות שונים.
6. ‏`Nasdaq — Global Data Products / TotalView`: TotalView מספק Full Depth של Nasdaq Market Center עבור U.S.-listed equities, ולא full multi-venue U.S. depth.
7. ‏`Nasdaq Data Technical News #2026-14`: Nasdaq הודיעה ביולי 2026 על תכנון retirement של legacy `Level 2` ו־`TotalView Aggregated`, עם migration ל־TotalView/TotalView Plus עד 2 ביולי 2027, subject to SEC review. לכן שמות/מוצרים של Depth מסומנים כ־time-sensitive.

‏מקורות רשמיים ששימשו לאימות:

- ‏IBKR Campus — Web API Market Data Request.
- ‏IBKR Campus — Market Data Lines / Specialized Market Data Lines.
- ‏IBKR Campus — Market Data Availability / TWS Data vs API Data.
- ‏Nasdaq Trader — Global Data Products.
- ‏Nasdaq Trader — Data Technical News #2026-14.

‏אין להפוך את המכסות/שמות המוצרים האלה לקבועים בקוד; לפני Implementation חי יש לבדוק שוב את התיעוד ואת החשבון בפועל.

---

## ‏25. User-Specific Application

‏עבור הרובוט שלנו, שסורק אלפי מניות ומחפש opportunity על seconds:

```text
Wide breadth is economically valuable.
Deep data is valuable only near the decision if it changes the decision.
```

‏לכן ברירת המחדל המומלצת היא:

```text
Universe-wide lightweight real-time state
→ rolling features
→ ranking
→ shortlist
→ richer/fresher candidate observation
→ execution gate
→ position-priority monitoring
```

‏אם Provider/Broker אינו מסוגל לספק breadth כזה בגלל lines/entitlements, זה אינו פרט טכני קטן — זה Gap ארכיטקטוני שצריך לפתור באמצעות Provider אחר, batching/polling מתאים, Universe partitioning או שינוי design, ולא באמצעות הנחה שהנתונים קיימים.

---

## ‏26. Concrete Baseline Contract

‏Symbol יכול להיות Eligible ל־Live Entry רק אם:

```text
instrument identity known
AND provider/feed known
AND market-data mode == REAL_TIME
AND connection state == READY
AND session/trading status supported
AND bid/ask available
AND bid/ask timestamps valid
AND data age within supported freshness budget
AND coverage semantics known
AND no unresolved reconnect/data-gap state
=> execution feasibility may be evaluated

otherwise
=> NO NEW POSITION
```

‏Candidate-level deep data יכול לשפר את ההחלטה, אבל לא לעקוף את ה־P0 conditions האלה.

---

## ‏27. Confidence

### ‏High

- ‏Real-time state must be explicit.
- ‏Freshness/heartbeat are safety-critical.
- ‏`Last` alone is insufficient for live execution.
- ‏Provider/coverage provenance must be retained.
- ‏Wide-scan / deep-observation layering is operationally appropriate for a broad-universe personal system.
- ‏Replay and canonical normalization should be first-class architecture.

### ‏Medium

- ‏Rich L1 is sufficient for the initial universe-wide scanner.
- ‏Depth/Tick-by-Tick will add more value near Candidate/Execution than across the whole Universe.

‏שתי ההמלצות האחרונות הן Engineering Judgments שצריכות Evidence מהמערכת שלנו.

---

## ‏28. Relationship to Later Recommendation Sheets

‏ה־Sheet הזה קובע את Data Contract וה־allocation policy, לא את כל פרטי ה־timing וה־provider choice.

‏המשך צפוי:

- ‏`06` — Sampling cadence, timestamps, latency budgets, clock sync.
- ‏`07` — Universe breadth / eligibility.
- ‏`08–13` — features מתוך trades/quotes/activity/liquidity.
- ‏`20` — realistic backtest data requirements.
- ‏`23` — paper/shadow parity.
- ‏`29–32` — API/provider architecture and selection.
- ‏`30` — IBKR/IBKR Israel capabilities and entitlements.
- ‏Cross-Cutting — `Recommended Market Data Stack` יסנתז בסוף Provider/Feed choices בפועל.

---

# ‏Recommendation Summary

```text
P0  Market-data mode known; delayed/frozen/unknown never drives live entry
P0  Freshness + heartbeat + reconnect recovery gates
P0  No Change != No Data
P0  Provider/feed/coverage/timestamps retained for every decision
P1  State-based data allocation: SCANNING → CANDIDATE → POSITION
P1  Rich L1 + activity as universe-wide baseline
P1  Canonical normalized market state + provider adapters
P1  Streaming rolling state + periodic scanner decisions
P1  Replay-friendly persistence and dataset contracts
P2  Tick-by-Tick for shortlisted symbols when evidence justifies it
P3  Level 2 / depth-derived features as measured challengers
P4  Full-depth multi-venue infrastructure only for proven specialist need
```

> ‏**המלצת ה־Baseline: אל תנסה להשיג “את כל המידע”. השג את המידע הנכון לכל מצב, שמור את מקורו וזמנו, חסום מסחר כאשר ה־data state אינו אמין, והוסף עומק רק כאשר הוא מוכיח שהוא משנה החלטה או משפר Net outcome.**