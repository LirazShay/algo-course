# ‏31 — Recommendation Sheet: Market Data Providers / Alternatives

> ‏מקור לימודי עיקרי: `../31-MARKET-DATA-PROVIDERS-AND-ALTERNATIVES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מעשי לבחירת `Market Data` עבור `Whole-Market Scanner` של אלפי מניות, תוך הפרדה מלאה מה־Execution Broker, שמירת `Historical/Live parity`, מדידת Coverage/Freshness אמיתית, ויכולת להחליף Provider בלי לשכתב את ה־Strategy.
>
> ‏Current verification snapshot במסמך זה נבדק מחדש ב־2026-10-27 מול תיעוד רשמי/ראשוני של `Alpaca`, ‏`Massive`, ‏`Databento`, ‏`Nasdaq`, ובהמשך ישיר לאימות `IBKR` שבוצע במקטע 30. כל מחיר, plan, entitlement, licensing term, feed coverage או limit נשאר `time-sensitive` וחייב re-verification לפני שימוש תפעולי.

---

## ‏1. Decision

‏השאלה המרכזית אינה:

```text
Which provider has the cheapest API?
```

‏וגם אינה:

```text
Which provider has the most data?
```

‏אלא:

```text
Which data plane can observe the intended universe
with sufficient coverage, freshness, semantics and replayability,
under peak load,
without making the Strategy depend on provider-specific artifacts?
```

‏ה־Baseline שנבחר:

```text
External Broad Market Feed
→ Canonical Normalizer
→ Raw / Replayable Event Capture
→ Current Market State
→ Feature Engine
→ Whole-Market Ranking
→ Top-N Enrichment
→ Candidate Data Gate
→ Broker-side Execution Recheck
```

‏הכרעת Provider בשלב זה:

```text
Production provider: NOT SELECTED YET

Preferred first whole-market POC:
Massive real-time Stocks feed

Primary challenger:
Alpaca SIP

Depth / microstructure challenger:
Databento

Direct-venue specialist:
Nasdaq TotalView / TotalView-family feeds

Execution validation:
IBKR adapter from segment 30
```

‏זו `Judgment` של סדר בדיקה, לא טענה שספק מסוים כבר ניצח. הבחירה הסופית תגיע רק מ־POC מדיד על ה־workload שלנו.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`MarketDataProvider != ExecutionBroker`

‏ה־Strategy עובדת על Market State קנוני.

```text
Provider Adapter
→ Canonical Market Events
→ Feature Engine
→ Strategy
```

‏ולא:

```text
Provider SDK object
→ Strategy rule
```

‏`IBKR` יכול להיות Execution Broker גם כאשר ה־whole-market feed מגיע ממקור אחר.

---

### ‏`P0 — Required`: Required Data Contract לפני Provider Selection

‏לפני השוואת Vendors, המערכת צריכה להגדיר מה היא באמת דורשת.

‏Baseline למחקר שלנו:

```text
asset class: US listed equities
universe: broad cross-sectional universe
session baseline: RTH initially
live trades: required for momentum/activity research
live top-of-book/NBBO quotes: required for liquidity/executability path
1-second aggregates: useful but not a substitute for raw trades/quotes
historical trades: required
historical quotes: required for execution-aware replay
reference data: required
market status / halt context: required or available from a trusted companion source
raw/provider timestamps: preserve when available
trade/quote conditions: preserve
provider provenance: mandatory
```

‏Depth/L2/L3 אינו Baseline requirement כרגע.

---

### ‏`P1 — Preferred Default`: Consolidated Broad Feed לפני Direct Single-Venue Feed

‏ל־whole-market cross-sectional scanner ברירת המחדל היא Feed רחב/consolidated ככל האפשר.

‏למה:

- ‏ה־Rank משווה אלפי Symbols באותו רגע.
- ‏Venue יחיד יכול להראות Volume/Last/BBO שונים מהשוק הרחב.
- ‏Spread ו־Executability צריכים תמונת Top-of-Book רחבה יותר מ־exchange יחיד.
- ‏Feed skew בין Research ל־Live יכול לייצר Alpha מדומה.

‏לכן `IEX-only` או direct venue אחד אינם Baseline ל־Production-like scanner validation.

---

### ‏`P1 — Preferred Default`: Raw Event Capture + Current State Projection

‏המערכת תשמור שני מסלולים:

```text
Raw / Replayable Events
        ↓
Canonical Normalization
        ↓
Current State Projection
        ↓
Features / Ranking
```

‏ה־Raw capture מאפשר:

- ‏RCA ל־parser/normalizer bugs.
- ‏Replay דטרמיניסטי.
- ‏Provider comparison.
- ‏Recompute של Features לאחר שינוי Logic.
- ‏בדיקת Historical/Live parity.

---

### ‏`P1 — Preferred Default`: Event-Driven Ingestion + Cadenced Ranking

‏ה־Feed נקלט event-driven.

‏ה־Rank אינו חייב להתבצע על כל Event.

```text
market events: continuous
state update: continuous
feature state: incremental
ranking: fixed logical cadence / as-of cut
```

‏זה ה־Hybrid Baseline שכבר משתלב עם מקטעים 06, 13 ו־14.

---

### ‏`P1 — Preferred Default`: Freshness ו־Coverage הן Hard Observability

‏לכל ranking cycle נשמור לפחות:

```text
expected_universe_count
covered_symbol_count
fresh_symbol_count
trade_fresh_symbol_count
quote_fresh_symbol_count
median_event_age_ms
p95_event_age_ms
p99_event_age_ms
processing_lag_ms
provider_state
```

‏לא מספיק:

```text
connected = true
```

---

### ‏`P0 — Required`: Rank Trust Gate

‏Cross-sectional Rank אמין רק אם Coverage ו־Freshness של ה־Universe מספקים.

```text
if market_wide_data_health < required_contract:
    rank_trusted = false
    NO_TRADE_DATA_GATE
```

‏Candidate #1 עם Quote טרי אינו מספיק כאשר רוב השוק Stale.

---

### ‏`P0 — Required`: Candidate Data Gate

‏בנוסף ל־Market-wide gate, לכל Candidate נדרש:

```text
trade_state_valid
quote_state_valid
required fields present
quote age acceptable
trade age/context understood
not stale/unknown
provider/feed known
```

‏`missing != zero`.

---

## ‏3. Provider POC Order

### ‏`P1 — Preferred first POC`: `Massive`

‏הסיבה לבחירה ראשונה למחקר whole-market אינה branding אלא התאמה ל־workload:

- ‏WebSocket trades.
- ‏WebSocket `NBBO` quotes.
- ‏1-second aggregates.
- ‏wildcard subscription לכל tickers בערוצים הנתמכים.
- ‏REST.
- ‏Flat Files למחקר היסטורי רחב.
- ‏explicit whole-market/high-throughput orientation.

‏זה הופך אותו למועמד נוח לבדיקת:

```text
Live whole-market stream
↔
Historical tick/quote replay
```

‏Trade-off:

- ‏Real-time NBBO access תלוי plan.
- ‏אין Level 2/order book במוצר הרגיל המתועד כרגע.
- ‏Firehose אמיתי מעביר את bottleneck אל consumer שלנו.
- ‏יש למדוד Burst capacity בפועל.

‏לכן ההמלצה היא `POC first`, לא `buy and commit`.

---

### ‏`P2 — Primary challenger`: `Alpaca SIP`

‏ה־SIP feed הוא challenger חזק כי התיעוד הנוכחי מציג:

- ‏WebSocket real-time stocks.
- ‏CTA/UTP SIP coverage.
- ‏US Stocks/ETFs.
- ‏unlimited WebSocket symbol subscriptions בתכנית `Algo Trader Plus` הנוכחית.
- ‏historical data מאותו Market Data API family.
- ‏Trades, Quotes, Bars ו־Snapshots.

‏יתרון מחקרי:

‏ה־SIP מתאים הרבה יותר מ־IEX-only ל־cross-sectional whole-market comparison.

‏Trade-offs לבדיקה:

- ‏Actual burst throughput על ~4,000 symbols.
- ‏connection behavior.
- ‏gap/recovery semantics.
- ‏historical/live condition parity.
- ‏actual latency from our region/runtime.

---

### ‏`P4 — Prototype only`: `Alpaca IEX`

‏ה־free/default equities feed מתועד כיום כ־IEX-only.

‏לכן הוא שימושי ל־:

- ‏Adapter development.
- ‏Schema work.
- ‏small integration tests.
- ‏educational prototype.

‏אבל אינו Baseline מתאים להוכחת Full-Market Rank.

‏אסור להסיק ממנו:

```text
full-market volume
full-market NBBO
full-market winner ranking
```

---

### ‏`P3 — Depth / microstructure challenger`: `Databento`

‏Databento רלוונטי במיוחד כאשר נשאל שאלות שה־L1/SIP Baseline לא יכול לענות עליהן.

‏התיעוד הנוכחי מציג datasets/schemas כגון:

```text
L1 / mbp-1
L2 / mbp-10
L3 / mbo
trades
ohlcv-1s
instrument definitions
statistics / halts / status where available
```

‏והיצע של US-equities direct datasets ממספר venues.

‏לכן הוא מועמד חזק ל־:

- ‏Depth research.
- ‏Queue/microstructure experiments.
- ‏High-fidelity historical/live comparison על Dataset שנבחר במפורש.

‏אבל אין סיבה להכניס L2/L3 ל־MVP לפני שהוכח incremental predictive/execution value.

---

### ‏`P4 — Specialist`: `Nasdaq TotalView`

‏`TotalView` נותן Nasdaq depth עשיר.

‏הוא מתאים ל־:

- ‏Nasdaq-specific depth research.
- ‏book imbalance.
- ‏queue/depth experiments.

‏אבל Direct Nasdaq feed אינו whole-US-market consolidated feed.

‏לכן הוא enrichment/specialist layer, לא Baseline ל־scanner הרחב.

---

### ‏`P2 — Execution validation source`: `IBKR`

‏מקטע 30 נשאר בתוקף:

```text
Broad scanner provider
→ Top-N
→ broker-side executable quote validation
→ execution adapter
```

‏`IBKR` אינו חייב להיות Data Plane הראשי כדי להיות Broker Truth לביצוע.

---

## ‏4. Why

‏הרובוט שלנו הוא Cross-Sectional.

‏לכן הבעיה המרכזית שונה מ־"לקבל quote למניה אחת".

‏אנחנו צריכים לדעת:

```text
Did we observe the intended market universe fairly enough
at one logical time
that Rank #1 actually means Rank #1?
```

‏זה דורש:

- ‏Coverage רחב.
- ‏Comparable freshness.
- ‏As-of semantics.
- ‏Stable normalization.
- ‏Processing capacity.
- ‏Replayability.

‏Provider זול עם coverage חלקי יכול להוזיל subscription ולהרוס את משמעות ה־Rank.

---

## ‏5. Use When

‏ה־Baseline מתאים כאשר:

- ‏המחקר הוא על אלפי US equities.
- ‏ה־features נמצאים בטווח שניות עד דקות קצרות.
- ‏צריך להשוות Symbols cross-sectionally.
- ‏Spread/Quote freshness רלוונטיים ל־Trade Gate.
- ‏רוצים deterministic replay של data שקיבלנו Live.
- ‏רוצים להפריד Market Data מ־Broker execution.

---

## ‏6. Do Not Use When

‏אין להעתיק את ה־Baseline בלי שינוי כאשר:

- ‏האסטרטגיה עובדת רק על Symbol אחד.
- ‏המחקר דורש full depth/order-by-order כבר מההתחלה.
- ‏ה־Universe אינו US equities.
- ‏ה־Target הוא HFT microseconds.
- ‏ה־strategy משתמשת במקור venue-specific בכוונה כחלק מה־Alpha definition.

---

## ‏7. Alternatives

### ‏Alternative A — One provider for everything

‏פשוט יותר תפעולית.

‏יתרון:

- ‏פחות mappings.
- ‏פחות skew.
- ‏פחות vendors.

‏חיסרון:

- ‏Provider יחיד עלול להיות בינוני ב־Live, Historical או Reference.
- ‏Vendor lock-in.
- ‏Execution broker limitations עלולים לעצב בטעות את ה־scanner.

---

### ‏Alternative B — Composite Provider

```text
Live: Provider A
Historical: Provider B
Reference: Provider C
Execution: Broker D
```

‏יכול להיות חזק, אך מגדיל:

- ‏Mapping risk.
- ‏Feed skew.
- ‏Licensing complexity.
- ‏RCA complexity.

‏לא Baseline ראשון.

---

### ‏Alternative C — Direct exchange feeds

‏מתאים למחקר specialist.

‏לא Baseline ל־MVP רחב.

---

### ‏Alternative D — Broker-only market data

‏פשוט יותר מבחינת vendors.

‏אבל עבור 4,000 symbols חייב להוכיח Capacity, Freshness ו־Historical parity לפני שנבחר בו.

---

## ‏8. Trade-offs

| החלטה | יתרון | מחיר |
|---|---|---|
| ‏Consolidated L1 | ‏Broad comparable market view | ‏פחות depth מפרופרי direct feeds |
| ‏Raw tick capture | ‏Replay/RCA/Fidelity | ‏Storage + throughput |
| ‏1s aggregates | ‏פשוט וזול יותר לעיבוד | ‏מסתיר intra-second path |
| ‏NBBO quotes | ‏Spread/Executability | ‏יותר event volume |
| ‏Whole-market wildcard | ‏פשוט להירשם | ‏Burst גדול מאוד |
| ‏External feed + broker | ‏כל רכיב מותאם לתפקיד | ‏Mapping/clock/provider divergence |
| ‏Single provider | ‏KISS | ‏Provider fit עלול להיות חלקי |
| ‏Depth | ‏Microstructure richness | ‏Cost + CPU + storage + complexity |

---

## ‏9. What I Would Avoid Initially

‏לא הייתי מתחיל עם:

- ‏L3 לכל השוק.
- ‏Direct connectivity לכמה Exchanges.
- ‏שלושה Market Data Vendors במקביל.
- ‏Silent failover בין feeds.
- ‏Mix של historical provider אחד ו־live provider אחר בלי parity tests.
- ‏Provider-specific fields בתוך Score.
- ‏Polling של 4,000 symbols אחד־אחד.
- ‏Last-only execution model.
- ‏Venue-only free feed כהוכחת full-market edge.
- ‏Hard-coded freshness threshold שלא עבר sensitivity analysis.
- ‏Colocation לפני שהוכח שה־Edge נשבר על מאות microseconds.

---

## ‏10. What to Add Later

### ‏`P2`

- ‏Secondary health feed לזמן מוגבל.
- ‏Cross-provider comparison dashboard.
- ‏Automated feed-divergence RCA.
- ‏Provider capability registry.
- ‏subscription reason tracking.

### ‏`P3`

- ‏Depth enrichment ל־Top-N.
- ‏Databento/direct dataset experiments.
- ‏Feature ablation לפי Data layer.
- ‏Provider-conditioned quality metrics.

### ‏`P4`

- ‏Direct Exchange feeds.
- ‏L3/order-by-order.
- ‏specialized low-latency infrastructure.
- ‏multi-provider automatic failover, רק אחרי semantic parity proof.

---

## ‏11. Required Data / Evidence

‏Provider אינו מתקדם רק כי documentation נראה טוב.

‏לכל Candidate Provider נשמור POC evidence על:

### ‏Coverage

```text
expected_symbols
symbols_seen
symbols_with_trades
symbols_with_quotes
fresh_symbols_X_ms
fresh_symbols_X_s
```

### ‏Throughput

```text
events_per_second
bytes_per_second
peak_events_per_second
parse_cpu
memory
queue_depth
```

### ‏Latency

```text
provider/event timestamp
receive timestamp
normalize timestamp
state-applied timestamp
feature-ready timestamp
rank timestamp
```

‏ומדדים:

```text
P50
P90
P95
P99
max
```

### ‏Quality

```text
gap_count
duplicate_count
out_of_order_count
one_sided_quote_count
locked_crossed_count
unknown_condition_count
stale_symbol_count
reconnect_count
```

### ‏Recovery

```text
time_to_detect_disconnect
time_to_reconnect
time_to_resubscribe
time_to_warm
replay_parity_after_recovery
```

### ‏Historical parity

- ‏אותם event types?
- ‏אותם conditions?
- ‏אותו coverage concept?
- ‏אותו timestamp interpretation?
- ‏אותם adjusted/raw semantics?
- ‏אפשר לשחזר Live decision?

---

## ‏12. Provider Evaluation Experiment

‏נריץ paired benchmark.

```text
same date
same RTH windows
same universe
same machine class / region where practical
same canonical schema
same ranking cadence
same feature version
```

‏נבדוק לפחות:

```text
normal mid-session window
market open burst
high-volatility window
reconnect scenario
```

‏Outputs:

```text
coverage_pct
fresh_coverage_pct
P50/P95/P99 feed lag
processing_lag
peak events/sec
peak MB/sec
gap rate
reconnect-to-ready
Top1 agreement
TopN overlap
rank correlation
first divergence
raw storage/day
estimated recurring cost
```

---

## ‏13. First-Divergence Provider Analysis

‏כאשר Provider A ו־B נותנים Rank שונה:

```text
raw event difference?
coverage difference?
condition filtering?
timestamp alignment?
normalizer bug?
quote/trade freshness?
missing event?
aggregation rule?
feature state?
rank tie-break?
```

‏לא מתחילים מ־"Provider B גרוע".

‏זה מחבר ישירות למקטע 26.

---

## ‏14. Historical / Live Parity Contract

‏Baseline:

```text
Live Provider Feed
→ Raw Capture
→ Stored Dataset
→ Replay
→ same normalization
→ same feature engine
→ same rank decision
```

‏היעד:

```text
same recorded session
+ same versions
= same decisions
```

‏אם historical API של Vendor מייצר Dataset שונה מה־live stream, ההבדל חייב להיות documented ומנוטר.

---

## ‏15. Data State Machine

```text
DISCONNECTED
→ CONNECTING
→ SYNCING
→ WARMING_UP
→ READY

READY
→ DEGRADED
→ STALE
→ RECONNECTING
→ SYNCING
→ WARMING_UP
→ READY
```

‏Entries חדשים מותרים רק כאשר כל Data Contract הקריטי מתקיים.

---

## ‏16. Data Health אינו Boolean

‏נשמור dimensions נפרדים:

```text
connection_health
coverage_health
trade_freshness_health
quote_freshness_health
sequence_health
processing_health
reference_data_health
historical_capture_health
```

‏Overall state יכול להיות:

```text
HEALTHY
DEGRADED
UNTRUSTED_FOR_RANKING
UNSAFE_FOR_NEW_ENTRIES
OFFLINE
```

---

## ‏17. Freshness Semantics

‏`No Trade` אינו בהכרח `No Data`.

‏לכן נפריד:

```text
last_trade_age
last_quote_age
last_provider_message_age
last_symbol_state_change_age
```

‏ל־Execution Gate, Quote age חשוב במיוחד.

‏ל־Momentum Feature, Trade/aggregate history יכול להיות חשוב יותר.

---

## ‏18. Snapshot Consistency

‏כל Rank cycle מקבל:

```text
ranking_as_of_time
```

‏וכל Symbol state נמדד ביחס אליו.

‏לא נדרג:

```text
AAPL state @ T
vs
XYZ state @ T-4s
```

‏כאילו הם אותו snapshot.

---

## ‏19. Data Quality Gate

‏`P0`:

```text
if critical_data_unknown:
    NO_TRADE

if market_wide_fresh_coverage_insufficient:
    NO_TRADE

if candidate_quote_stale:
    NO_TRADE

if provider/feed provenance unknown:
    NO_TRADE
```

‏Thresholds עצמם נשארים Evidence-driven.

---

## ‏20. Feed Failover

‏ברירת המחדל הראשונית:

```text
Primary feed failure
→ PAUSE_NEW_ENTRIES
→ preserve position/order management
→ recover / reconcile data state
```

‏לא:

```text
switch silently to another provider
```

‏Secondary Provider failover דורש:

- ‏Schema parity.
- ‏instrument mapping.
- ‏feed-source semantics.
- ‏historical parity.
- ‏Decision diff testing.
- ‏explicit `feed_epoch`.

---

## ‏21. Feed Epoch

‏בכל Decision נשמור:

```text
provider
feed
plan/capability_snapshot
feed_epoch_id
normalizer_version
schema_version
```

‏החלפת feed באמצע Session היא Strategy-relevant event.

---

## ‏22. Provider Adapter Contract

‏מומלץ להפריד:

```text
ILiveMarketDataProvider
IHistoricalMarketDataProvider
IReferenceDataProvider
```

‏ולא ליצור `IGiantMarketDataProvider` שחייב לעשות הכול.

‏לכל Adapter:

```text
Capabilities
Connect
Subscribe
Unsubscribe
Events
Health
Backfill where supported
```

---

## ‏23. Core Contract + Capabilities

‏אסור ליפול ל־Lowest Common Denominator.

‏Core:

```text
Trade
Quote
Instrument identity
Provider provenance
Event time
Receive time
Quality state
```

‏Extensions:

```text
Depth
Imbalance
Venue-specific fields
Special conditions
Market status
```

---

## ‏24. Canonical Trade

```text
CanonicalTrade {
    InstrumentId
    Price
    Size
    Venue
    ConditionsRaw
    ConditionsNormalized
    EventTime
    ProviderTime?
    ReceiveTime
    Sequence?
    Provider
    Feed
}
```

---

## ‏25. Canonical Quote

```text
CanonicalQuote {
    InstrumentId
    BidPrice?
    BidSize?
    AskPrice?
    AskSize?
    BidVenue?
    AskVenue?
    ConditionsRaw
    EventTime
    ProviderTime?
    ReceiveTime
    Sequence?
    Provider
    Feed
}
```

‏One-sided market מיוצג כ־missing side, לא כ־0.

---

## ‏26. Reference / Instrument Contract

```text
CanonicalInstrumentId
CurrentSymbol
AssetType
PrimaryExchange
Currency
ListingStatus
ProviderInstrumentIds
ValidFrom
ValidTo
CorporateActionLinks
```

‏Ticker string לבדו אינו identity מספקת.

---

## ‏27. Conditions

‏נשמור גם Raw וגם Normalized.

```text
raw_condition_codes
normalized_flags
normalizer_version
```

‏אחרת לא נוכל לדעת בעתיד אם שינוי eligibility הגיע מה־Vendor או מה־Rule שלנו.

---

## ‏28. Corporate Actions

‏Historical adjusted data ו־live raw quotes אינם אותו דבר.

‏כל Dataset מציין:

```text
raw_or_adjusted
adjustment_method
corporate_action_source
```

‏Backtest אינו מערבב אותם ללא explicit transform.

---

## ‏29. LULD / Halts / Market Status

‏אם ה־Primary Provider אינו נותן state אמין לכל הדרוש, אפשר להשתמש Trusted companion source.

‏אבל Provenance נשמר.

‏Unknown trading state אינו Pass.

---

## ‏30. Burst Capacity

‏Whole-market feed מתוכנן לפי Peak.

‏לא לפי daily average.

‏נמדוד במיוחד:

- ‏Open.
- ‏Market-wide move.
- ‏news burst.
- ‏reconnect catch-up.

‏`messages/sec` אינו מספיק; נמדוד `events/sec` ו־`bytes/sec`.

---

## ‏31. Backpressure

‏נשמור:

```text
incoming_events_per_sec
processed_events_per_sec
queue_depth
oldest_event_age_ms
processing_lag_ms
```

‏אם consumer מפגר, Data state עובר `DEGRADED/STALE` גם אם WebSocket פתוח.

---

## ‏32. Drop Policy

‏אין Silent Drop.

‏אם architecture נאלצת להשמיט events:

```text
drop_reason
count
window
symbols/channels affected
recovery_required
```

‏ו־Ranking Trust Gate מגיב בהתאם.

---

## ‏33. Storage Baseline

‏לא חייבים לשמור לעד כל byte של כל feed כבר ביום הראשון.

‏אבל למחקר/Replay נדרש לפחות:

```text
raw/reconstructable event capture
session manifest
provider/feed metadata
normalizer version
checksums
```

‏Retention ו־storage rights כפופים להסכם הספק.

---

## ‏34. Dataset Manifest

```text
provider
feed
plan/capability_snapshot
date_range
session_scope
symbol_universe_version
schema_version
normalizer_version
raw_format
checksum
capture_region
capture_build
```

---

## ‏35. Provider Selection Scorecard

‏ה־Scorecard לא יהפוך ל־weighted magic score בלבד.

‏נפריד Hard Gates מ־comparison dimensions.

### ‏Hard Gates

- ‏Coverage מספק.
- ‏Required event types.
- ‏Freshness/lag מספקים.
- ‏Burst capacity.
- ‏Replayability.
- ‏Licensing/usage rights ברורים.
- ‏Stable health/reconnect semantics.

### ‏Comparison dimensions

- ‏P95/P99 latency.
- ‏Historical depth.
- ‏Developer complexity.
- ‏Raw condition richness.
- ‏Reference data.
- ‏Bulk files.
- ‏Support quality.
- ‏Cost.
- ‏Operational burden.

---

## ‏36. Promotion Criteria

‏Provider יכול להפוך ל־Preferred Production Candidate רק אם:

1. ‏עובר Hard Data Contract.
2. ‏נבדק ב־market open וב־burst.
3. ‏Coverage/Fresh Coverage יציבים.
4. ‏P95/P99 lag מתאימים ל־signal horizon שלנו.
5. ‏אין unexplained gaps משמעותיים.
6. ‏Reconnect/Recovery נבדקו.
7. ‏Live capture משתחזר ב־Replay.
8. ‏Historical semantics מובנים ומתועדים.
9. ‏Licensing/retention/non-display usage נבדקו עבור השימוש האמיתי.
10. ‏Cost/complexity מוצדקים מול alternatives.
11. ‏Top-N/Top1 behavior אינו fragile ל־feed noise קטן.
12. ‏כל critical assumptions versioned.

---

## ‏37. Rejection Criteria

‏נפסול Provider/Plan מה־Baseline אם:

- ‏Feed הוא Venue-only כאשר ה־strategy דורשת consolidated market view.
- ‏Whole-market subscription אינו אפשרי או אינו עומד בקצב הנדרש.
- ‏P99 lag/processing backlog מפרים את ה־decision horizon.
- ‏אין דרך לזהות stale/disconnect באופן אמין.
- ‏Historical feed אינו מאפשר validation ברמת fidelity הדרושה.
- ‏Feed semantics/conditions אינם ברורים.
- ‏Licensing לשימוש algorithmic/non-display/retention אינו ברור מספיק להפעלה המתוכננת.
- ‏Provider דורש complexity חריגה ללא incremental value.

---

## ‏38. Metrics

### ‏Coverage

```text
coverage_pct
fresh_coverage_pct
trade_fresh_coverage_pct
quote_fresh_coverage_pct
missing_symbols
```

### ‏Latency

```text
provider_to_receive_ms
receive_to_normalized_ms
normalized_to_feature_ms
feature_to_rank_ms
processing_lag_ms
```

### ‏Capacity

```text
events_per_sec
peak_events_per_sec
bytes_per_sec
queue_depth
oldest_event_age_ms
parse_cpu
memory
```

### ‏Reliability

```text
reconnects_per_session
gap_rate
duplicate_rate
out_of_order_rate
schema_errors
subscription_errors
time_to_ready
```

### ‏Cross-provider

```text
same_top1_pct
top10_overlap_pct
rank_correlation
bid_divergence_bps
ask_divergence_bps
trade_count_ratio
volume_ratio
first_divergence_category
```

### ‏Economics

```text
monthly_plan_cost
historical_download_cost
storage_cost
engineering_hours
ops_incidents
incremental_predictive_value
incremental_net_value
```

---

## ‏39. Failure Modes

- ‏Provider connected אבל backlog של consumer גורם ל־4s lag.
- ‏Trade stream תקין, Quote stream מת.
- ‏Universe coverage נופל אך Top1 נראה fresh.
- ‏IEX-only feed מתפרש בטעות כ־full market.
- ‏Historical SIP ו־Live venue-only מעורבבים.
- ‏Corporate action גורם return מזויף.
- ‏Condition mapping bug משנה Last/Volume.
- ‏Sequence gap אינו מזוהה.
- ‏Snapshot recovery מחזיר current state אבל rolling feature עדיין פגום.
- ‏Silent provider failover משנה Rank.
- ‏Provider-specific artifact הופך ל־Feature בלי להבין semantics.
- ‏Burst ב־Open גורם queue growth ו־freshness bias.
- ‏Quote one-sided הופך בטעות ל־0.
- ‏Depth יקר נקנה לפני הוכחת incremental value.
- ‏Storage/licensing assumption מתגלה כשגויה מאוחר.

---

## ‏40. User-Specific Application

‏למערכת המחקרית שלנו יש כמה מאפיינים שמטים את הבחירה:

- ‏Universe רחב של אלפי מניות.
- ‏Rank cross-sectional.
- ‏Features בטווח שניות עד דקות קצרות.
- ‏צורך ב־Trades/Activity עבור signal.
- ‏צורך ב־Quotes עבור spread/executability.
- ‏צורך ב־historical replay זהה ככל האפשר ל־Live.
- ‏אין הצדקה כרגע ל־L3 על כל השוק.

‏לכן ה־Baseline המחקרי:

```text
Whole-market consolidated L1
+ trades
+ NBBO quotes
+ raw capture
+ historical tick/quote access
+ broker-side execution recheck
```

‏Depth נכנס רק על Top-N ורק אחרי experiment שמוכיח incremental value.

---

## ‏41. Concrete Baseline Contract

```text
1. Connect primary provider.
2. Validate capability snapshot.
3. Load point-in-time universe/reference mapping.
4. Subscribe broad trades + required quote stream.
5. Capture raw/reconstructable events.
6. Normalize to canonical Trade/Quote models.
7. Maintain per-symbol current state + freshness.
8. Maintain market-wide coverage/freshness metrics.
9. Build features incrementally.
10. Rank on explicit as-of cadence.
11. Reject ranking when market-wide data health is insufficient.
12. Enrich Top-N only when needed.
13. Recheck executable candidate state at broker boundary.
14. Persist provider/feed/version with every decision.
15. Replay recorded sessions and require deterministic decision parity.
```

---

## ‏42. Preferred POC Sequence

```text
POC-A: Massive broad feed
→ prove consumer throughput + raw capture + replay

POC-B: Alpaca SIP challenger
→ same universe / same features / same time windows

Compare:
coverage
freshness
P95/P99 lag
burst handling
Top1/TopN agreement
reconnect/recovery
historical parity
cost/complexity

Only then choose primary provider.
```

‏אם POC-A נכשל ב־Hard Gate, אין חובה להריץ את כל ה־comparison לפני שמתקדמים ל־B.

---

## ‏43. Current Verification Snapshot — 2026-10-27

### ‏Alpaca

‏ה־official Market Data docs שנבדקו כעת מתארים:

- ‏`v2/iex` — IEX feed.
- ‏`v2/sip` — SIP feed.
- ‏`v2/delayed_sip` — delayed SIP.
- ‏`boats` ו־`overnight` ל־overnight contexts.
- ‏Basic equities plan: real-time IEX בלבד, עם 30 WebSocket symbols בתיעוד הנוכחי.
- ‏`Algo Trader Plus`: real-time coverage של כל US stock exchanges ו־unlimited WebSocket symbol subscriptions בתיעוד הנוכחי.
- ‏המחיר הציבורי המוצג כיום ל־`Algo Trader Plus` הוא `$99/month`.
- ‏Historical stock data מתועד מאז 2016 בתכנית הנוכחית.

‏כל אלה time-sensitive.

### ‏Massive

‏ה־official docs שנבדקו כעת מתארים:

- ‏real-time Stocks WebSocket.
- ‏Trades.
- ‏NBBO Quotes.
- ‏second/minute aggregates.
- ‏wildcard `*` לכל tickers בערוצים מתאימים.
- ‏Flat Files ל־historical trades/quotes.
- ‏Whole-market event delivery orientation.
- ‏Quote/NBBO channel אינו Level 2.
- ‏המסמך הנוכחי מציג real-time NBBO quotes במסגרת `Stocks Advanced`, במחיר ציבורי של `$199/month` בזמן הבדיקה.

‏מחיר/plan access time-sensitive; אין לקבע אותו בקוד.

### ‏Databento

‏ה־current equities documentation שנבדקה מציגה:

- ‏US Equities datasets.
- ‏schemas של `L1`, ‏`L2`, ‏`L3`, trades ו־second bars.
- ‏direct venue datasets רבים.
- ‏historical + live capabilities לפי dataset/plan.

‏לכן הוא Challenger חזק למחקר Depth, לא דרישה ל־MVP.

### ‏Nasdaq

‏הודעת Nasdaq מ־2026 שנבדקה מציינת retirement מתוכנן של `Nasdaq Level 2` ו־`TotalView Aggregated` כחלק מה־23/5 expansion, עם מעבר לכיוון `TotalView` / `TotalView Plus`, subject to the conditions stated by Nasdaq.

‏זה מדגים למה Direct-feed capability registry חייב להיות versioned.

### ‏IBKR

‏מקטע 30 נשאר ה־snapshot הקנוני עבור IBKR Market Data Lines, Web API cadence/session behavior ו־Execution validation.

---

## ‏44. Time-Sensitive Facts

‏יש לאמת מחדש לפני Production/renewal:

- ‏Provider plan names.
- ‏Monthly prices.
- ‏symbol/connection limits.
- ‏real-time vs delayed entitlements.
- ‏feed source (`IEX`, ‏`SIP`, direct, proprietary).
- ‏historical retention/lookback.
- ‏bulk-file availability.
- ‏rate limits.
- ‏WebSocket limits.
- ‏non-display/professional classification.
- ‏storage/retention rights.
- ‏redistribution rights.
- ‏session coverage.
- ‏OTC/overnight coverage.
- ‏LULD/halt semantics.
- ‏Direct-feed product migrations.

---

## ‏45. Licensing / Rights Gate

‏Technical capability אינה מספיקה.

‏לפני שימוש תפעולי צריך להבין, לפי ההסכם הרלוונטי:

```text
personal vs professional classification
internal algorithmic/non-display use
raw data retention
historical storage
redistribution/display rights
number of users/processes/connections
```

‏אם rights אינם ברורים — אין Promotion על בסיס הנחה.

---

## ‏46. Confidence

### ‏High

- ‏Provider abstraction נדרש.
- ‏Market Data ו־Execution Broker צריכים להישאר נפרדים.
- ‏Venue-only feed אינו Full-Market consolidated view.
- ‏Whole-market Rank דורש market-wide freshness/coverage observability.
- ‏Raw capture + replayability הם P0 למחקר ברמה מקצועית.
- ‏Historical/Live feed mismatch יכול לפסול מסקנות.
- ‏Silent failover מסוכן ל־Strategy semantics.

### ‏Medium

- ‏Massive הוא ה־first POC המתאים ביותר כרגע ל־whole-market feed שלנו.
- ‏Alpaca SIP הוא ה־primary challenger המתאים ביותר כרגע.
- ‏Trades + NBBO L1 הם fidelity מספקת ל־Baseline הראשוני שלנו.

### ‏Low / Unproven until POC

- ‏איזה Provider נותן latency טוב יותר מהמיקום שלנו.
- ‏איזה Provider נותן פחות gaps ב־open.
- ‏איזה Feed ישפר את Top1 predictive value.
- ‏האם Depth יוסיף Net Edge.
- ‏Threshold ה־Freshness המדויק.
- ‏האם secondary provider מצדיק את העלות והמורכבות.

---

## ‏47. What Would Change the Recommendation

‏נשנה את סדר ה־POC/Preferred Candidate אם:

- ‏Provider אינו מאפשר legal/contractual use כפי שאנחנו צריכים.
- ‏Burst P99 יוצר lag לא סביר.
- ‏Fresh Coverage נופל ב־Open.
- ‏Historical replay אינו משחזר Live semantics.
- ‏Top1/TopN משתנים בגלל missing feed coverage.
- ‏Alpaca SIP מוכיח בפועל איכות זהה/טובה יותר בעלות/מורכבות נמוכות יותר.
- ‏Massive מוכיח gaps/limitations משמעותיים.
- ‏Databento מציע Dataset שמשרת גם broad L1 וגם historical parity בצורה טובה יותר עבור ה־workload בפועל.
- ‏ה־Strategy מוכיחה ש־Depth מספק incremental OOS Net Edge.

---

## ‏48. Relationship to Later Sheets

‏מקטע 32 יגדיר במפורש את הגבול בין Data Plane ל־Execution Plane כאשר הם מגיעים משני ספקים שונים.

‏מקטעים 45–47 יבדקו האם Depth/Microprice/Impact מצדיקים enrichment עשיר יותר.

‏מקטעים 52 ו־59 יחזקו Data Engineering ו־Market Data subtleties.

‏מקטעים 80–82 יסגרו את הבחירה לתוך Architecture/MVP/Production design הסופי.

---

## ‏49. Recommendation Summary

```text
Do not choose a provider by price page or brand.

Define the Required Data Contract first.
Use a consolidated whole-market L1 baseline.
Keep raw/replayable capture.
Measure coverage and freshness across the entire universe.
Treat processing backlog as data latency.
Require explicit as-of ranking semantics.
Keep provider provenance in every event and decision.
Do not silently fail over.
Use broker data for execution validation, not as an automatic scanner feed.

First POC: Massive.
Primary challenger: Alpaca SIP.
Depth challenger: Databento.
Direct specialist: Nasdaq TotalView-family feeds.
IBKR: execution validation / broker truth.

No production winner until the same workload is benchmarked.
```
