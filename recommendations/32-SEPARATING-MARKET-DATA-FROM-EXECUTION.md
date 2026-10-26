# ‏32 — Recommendation Sheet: Separating Market Data from Execution

> ‏מקור לימודי עיקרי: `../32-SEPARATING-MARKET-DATA-FROM-EXECUTION.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ארכיטקטוני שבו `Market Data` ו־`Execution` הם שני Boundaries נפרדים, עם זהות מכשיר קנונית, clocks מפורשים, Data/Broker health נפרדים, Validation סמוך ל־Submit, provenance מלא ו־fail-closed behavior כאשר אי־אפשר לחבר בבטחה בין Observation לבין Execution.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראת הפעלה בכסף אמיתי. Facts ספציפיים לספקים ולברוקרים נשענים על ה־current verification שבוצע במקטעים 30–31 ונשארים `time-sensitive`.

---

## ‏1. Decision

‏המערכת לא תחזיק `Broker API` כ־API יחיד שממנו גם קוראים את השוק וגם מבצעים החלטות.

‏במקום זאת נקבע ארבעה Domains של אמת:

```text
Market Observation Truth → Market Data Layer
Decision Intent Truth    → Strategy / Decision Engine
Risk Permission Truth    → Risk Engine
Execution Truth          → Broker / Reconciliation
```

‏החיבור ביניהם יהיה מפורש:

```text
External Market Data
→ Canonical Market State
→ Whole-Market Scanner
→ Candidate / Decision
→ Canonical Instrument Resolution
→ Data Quality + Freshness Gate
→ Execution-Side Recheck
→ Signal TTL + Risk Recheck
→ Canonical Order Intent
→ Broker Adapter
→ Orders / Fills / Positions
→ Reconciliation
```

‏החלטת ה־Baseline:

```text
MarketDataProvider != ExecutionBroker
```

‏אבל:

```text
Separation != Independence of economics
```

‏איכות ה־Feed משנה את ה־Decision; איכות ה־Execution משנה את ה־Net Outcome. לכן הגבולות נפרדים, אך ה־Evidence מחבר אותם.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Source-of-Truth Matrix מפורש

| Domain | Authoritative source |
|---|---|
| ‏Market observation | `Market Data Provider` + canonical state |
| ‏Candidate / rank | `Scanner / Ranking Engine` |
| ‏Trade intent | `Decision Engine` |
| ‏Risk permission | `Risk Engine` |
| ‏Order lifecycle | `Execution Broker` |
| ‏Fills | `Execution Broker` |
| ‏Position | broker-reconciled execution truth |
| ‏Realized PnL | fills + fees/cost accounting |
| ‏Reference/slippage benchmark | versioned provider/broker reference prices |

‏כאשר שני Sources חלוקים, אין “Source of Truth אחד לכל המערכת”. קודם שואלים על איזה Domain הוויכוח.

---

### ‏`P0 — Required`: Canonical Domain Types

‏ה־Strategy לא תכיר DTOs של Vendor או SDK objects של Broker.

```text
Provider SDK
→ Market Data Adapter
→ CanonicalMarketEvent
→ CanonicalMarketState
→ Features / Ranking
```

‏ובצד הביצוע:

```text
CanonicalOrderIntent
→ Execution Engine
→ Broker Adapter
→ Broker Protocol
```

‏Provider/Broker SDK הם dependencies טכניים, לא Domain Model.

---

### ‏`P0 — Required`: Canonical Instrument Identity

‏`ticker string` אינו זהות מספקת כמפתח פנימי יחיד.

‏Baseline:

```text
CanonicalInstrumentId
```

‏מולו נשמרים mappings versioned:

```text
Market Data provider instrument id
Broker contract id
Symbol
Primary exchange
Asset type
Currency
ValidFrom
ValidTo
Status
```

‏ה־mapping הוא `Point-in-Time`.

‏Ambiguity אינה נפתרת בניחוש.

```text
Unknown / ambiguous instrument
→ NO_TRADE_INSTRUMENT_MAPPING_FAILED
```

‏Wrong Instrument חמור יותר מ־missed opportunity.

---

### ‏`P0 — Required`: Market Data Contract ו־Execution Contract נפרדים

‏`MarketDataProvider` נדרש לספק Observation semantics:

```text
Subscribe
Unsubscribe
Canonical events / snapshots
Health
Capabilities
Provenance
Freshness
```

‏`ExecutionBroker` נדרש לספק Execution semantics:

```text
Submit
Cancel
Replace
Open Orders
Executions / Fills
Positions
Health
Capabilities
Reconciliation
```

‏`Execution Engine` אינו Broker Adapter.

‏`Market Data Adapter` אינו Feature Engine.

---

### ‏`P0 — Required`: Clock Domains מפורשים

‏המערכת תכיר לכל Timestamp את המקור שלו:

```text
exchange_event_time
provider_time
receive_time
feature_ready_time
ranking_time
decision_time
execution_validation_time
intent_created_time
order_sent_time
broker_ack_time
fill_time
replay_virtual_time
```

‏אין להשוות Timestamps משעונים שונים כאילו הם clock אחד.

‏כאשר קיים Clock correction נשמור:

```text
raw_timestamp
normalized_timestamp
measured_offset
correction_source
correction_version
```

‏לא “מסדרים” timestamps עד שהם נראים הגיוניים.

---

### ‏`P0 — Required`: Freshness מפוצלת לפי Source ו־Stage

‏לפחות:

```text
market_event_age
receive_age
quote_age
trade_age
feature_age
decision_age
candidate_age
broker_validation_age
end_to_end_decision_age
```

‏`received now` אינו מוכיח שהאירוע עצמו חדש.

‏לכן רצוי להפריד:

```text
source_age
transport_age
processing_age
```

---

### ‏`P0 — Required`: Market-Wide Rank Trust לפני Candidate Trust

‏Whole-Market Ranking אינו אמין רק משום ש־Candidate #1 טרי.

‏נמדוד:

```text
eligible_universe_size
symbols_with_valid_data
fresh_symbols
fresh_coverage_ratio
median_data_age
p95_data_age
p99_data_age
provider_processing_lag
```

‏אם ה־cross-section אינו comparable:

```text
rank_trusted = false
→ NO TRADE
```

‏`Rank #1 מתוך 4,000` אינו שקול ל־`Rank #1 מתוך 900 symbols` שקיבלו update.

---

### ‏`P0 — Required`: Candidate Handoff Contract

‏המעבר מ־Scanner ל־Execution לא יהיה `symbol + score` בלבד.

‏Baseline candidate handoff:

```text
candidate_id
canonical_instrument_id
ranking_as_of_time
rank
score
score_version
feature_version
provider_name
provider_feed
feed_epoch
provider_quote_at_decision
provider_trade_at_decision
quote_age_at_decision
trade_age_at_decision
fresh_coverage_ratio
signal_created_at
signal_expires_at
max_acceptable_entry_price / execution budget
strategy_version
```

‏Execution לא ישחזר בשקט את משמעות ה־Decision מתוך מצב מאוחר יותר.

---

### ‏`P0 — Required`: Execution-Side Recheck סמוך ל־Submit

‏ה־Broad Feed בונה את Candidate.

‏לפני Submit, אם יש מקור Broker-side / execution-side מתאים, נבצע Recheck קצר וממוקד.

‏מטרת ה־Recheck אינה להריץ את ה־Scanner מחדש.

‏הוא בודק:

```text
canonical instrument resolution
session compatibility
trading status
candidate freshness
signal TTL
side-aware price sanity
price budget
broker readiness
risk readiness
unknown working exposure
```

‏אם ה־Recheck עצמו איטי מספיק כדי להרוג את ה־Signal, הוא נכשל במטרתו.

---

### ‏`P0 — Required`: Compare Like With Like

‏Cross-provider validation מותר רק כאשר ההשוואה תואמת:

```text
same canonical instrument
same field
same side
compatible feed semantics
compatible session
similar as-of time
```

‏אסור לפרש:

```text
Provider Last vs Broker Ask
```

‏כ־Data disagreement.

‏Long entry comparison צריך להתחשב ב־Ask-side כאשר בודקים Executability.

‏Long exit comparison צריך להתחשב ב־Bid-side.

---

### ‏`P0 — Required`: Divergence הוא Quality Signal, לא Truth Oracle

‏נשמור למשל:

```text
provider_bid
provider_ask
broker_bid
broker_ask
provider_quote_time
broker_quote_time
normalized_bid_divergence
normalized_ask_divergence
age_difference
feed_semantics_match
```

‏פער יכול לנבוע מ־:

```text
staleness
coverage difference
clock issue
mapping error
fast market
provider degradation
normal venue/consolidation difference
```

‏לכן:

```text
divergence != automatic provider bug
```

---

### ‏`P1 — Preferred`: Divergence normalized, לא X cents בלבד

‏Threshold קבוע בסנטים הוא Baseline חלש לרוחב שוק גדול.

‏Challenger ראוי יבחן divergence ביחס ל־:

```text
price
spread
tick size
volatility
quote age difference
```

‏אין לקבע threshold לפני paired replay/shadow evidence.

---

### ‏`P0 — Required`: Data Health ו־Broker Health נפרדים

‏לפחות:

```text
market_data_health
strategy_health
risk_health
broker_health
```

‏מצבי Data/Broker הבסיסיים:

```text
Data OK / Broker OK
Data OK / Broker Bad
Data Bad / Broker OK
Data Bad / Broker Bad
```

‏כל quadrant מקבל policy מפורש.

‏בפרט:

```text
Data bad
→ no new entry by default
```

‏אבל existing position היא Risk problem נפרדת ואינה ננטשת משום שה־Feed נפגע.

---

### ‏`P0 — Required`: Working Position/Order Truth נשארת Broker Truth

‏מחיר Provider בזמן Decision אינו Fill.

‏PnL בפועל נשען על:

```text
broker fills
broker fees / reconciled fee data where available
position reconciliation
```

‏לניתוח Execution נשמור במקביל:

```text
provider_reference_price
broker_reference_price_if_available
fill_price
```

‏כך אפשר למדוד `Implementation Shortfall` ולא לבלבל Prediction עם Execution.

---

### ‏`P0 — Required`: Recovery Ordering

‏לאחר restart/reconnect, New Entries אינן חוזרות מיד.

‏Baseline:

```text
restore durable local state
→ connect broker
→ authoritative order/fill/position reconciliation
→ connect market data
→ rebuild/warm market state
→ validate mapping/session/capabilities
→ validate Data/Broker/Risk health
→ only then enable new decisions
```

‏Existing positions/orders מקבלים עדיפות על discovery חדש.

---

### ‏`P0 — Required`: Warm-Up אינו Fake Zero

‏לאחר reconnect או State rebuild:

```text
COLD
→ WARMING
→ READY
```

‏אם Feature דורש 10 דקות history, שתי שניות של data אינן הופכות אותו ל־valid.

‏Missing history נשאר missing/warming, לא 0.

---

### ‏`P0 — Required`: Separate Backpressure Domains

‏Market data burst אסור שיחסום Fill/Position callbacks.

‏Baseline separation:

```text
Market Data ingestion queue
Feature / Ranking queue
Broker event queue
Risk / Position processing
```

‏Broker/position/risk events מקבלים priority גבוהה יותר מעוד Tick ל־symbol רחוק מה־Top-N.

‏Load shedding, אם נדרש, יפגע קודם ב־optional enrichment ולא ב־execution truth.

---

### ‏`P0 — Required`: Explicit Environment Wiring

‏לכל Environment wiring מפורש.

```text
REPLAY:
  MarketData = ReplayProvider
  Execution  = SimulatedBroker

SHADOW:
  MarketData = LiveProvider
  Execution  = NullBroker

PAPER:
  MarketData = LiveProvider
  Execution  = PaperBroker
```

‏כל wiring אחר חייב להיות declared/tested combination.

‏`NullBroker` ב־Shadow צריך להיות structurally unable to submit a real order.

---

## ‏3. Why

‏הפרדה זו פותרת חמישה סיכונים מרכזיים.

### ‏3.1 Provider Lock-In

‏החלפת Feed אינה דורשת Rewrite של Strategy.

### ‏3.2 Broker Lock-In

‏החלפת Broker אינה דורשת Rewrite של Features.

### ‏3.3 Hidden Semantics

‏פערי coverage, timestamps, session ו־price fields נשארים גלויים במקום להיעלם בתוך Adapter.

### ‏3.4 Operational Recovery

‏Data reconnect ו־Broker reconnect הם incidents שונים ויכולים להתאושש independently.

### ‏3.5 RCA

‏אפשר לייחס failure ל־:

```text
Data
Mapping
Feature/Rank
Decision
Risk
Broker
Fill
```

‏במקום לקרוא לכל failure “Strategy lost”.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד כאשר:

- ‏ה־Scanner סורק אלפי symbols.
- ‏ה־Broker אינו אידאלי ל־whole-market streaming.
- ‏נדרש Feed external רחב יותר.
- ‏ה־holding horizon קצר וה־Signal יכול להתיישן בין Rank ל־Submit.
- ‏נדרש Replay שמפריד Market Observation מ־Execution outcome.
- ‏נדרש להחליף Provider/Broker בלי Rewrite אסטרטגי.
- ‏נדרשת RCA מדויקת של Data vs Execution.

---

## ‏5. Do Not Use When

‏אין צורך לבנות Multi-Provider framework גדול כאשר:

- ‏המערכת עדיין POC קטן מאוד.
- ‏Feed יחיד מספק את הדרישות המחקריות הראשוניות.
- ‏אין עדיין Evidence שמצריך failover/consensus.

‏גם במקרה כזה נשמור את הגבול הארכיטקטוני:

```text
one interface
one provider adapter
one broker adapter
canonical types
```

‏KISS אינו coupling מכוון.

---

## ‏6. Alternatives

### ‏Alternative A — Broker-only Data + Execution

‏יתרון:

- ‏פשוט יותר.
- ‏פחות mapping.
- ‏פחות clock domains.

‏חיסרון:

- ‏עלול לא להתאים ל־whole-market scan.
- ‏lock-in.
- ‏קשה יותר להחליף Feed.

‏Status:

```text
Acceptable POC only if workload proves sufficient
```

---

### ‏Alternative B — External Data + Broker Execution — Preferred

‏יתרון:

- ‏Best-of-breed.
- ‏whole-market data יכול להתרחב בנפרד.
- ‏Execution truth נשאר Broker-native.

‏חיסרון:

- ‏mapping.
- ‏cross-clock diagnostics.
- ‏cross-provider disagreement.

---

### ‏Alternative C — Primary + Secondary Warm Feed

‏יתרון:

- ‏validation.
- ‏faster failover.
- ‏provider RCA.

‏חיסרון:

- ‏עלות.
- ‏licensing.
- ‏compute/storage.
- ‏semantic complexity.

‏Status: `P2/P3`, רק לאחר שה־single-primary path יציב.

---

### ‏Alternative D — Multi-Provider Consensus

‏יתרון:

- ‏Data integrity diagnostics מתקדמים.

‏חיסרון:

- ‏מורכבות גבוהה.
- ‏אין “majority truth” פשוט כאשר feeds שונים ב־scope.

‏Status: `P4 — Avoid Unless Evidence`.

---

## ‏7. Trade-offs

| Choice | Benefit | Cost/Risk |
|---|---|---|
| ‏Canonical schemas | portability/testability | normalization work |
| ‏Instrument Master | identity correctness | lifecycle/reference-data complexity |
| ‏External broad feed | scalable scanning | extra vendor/clock/mapping |
| ‏Broker-side recheck | protects stale decisions | added latency |
| ‏Warm secondary | failover readiness | cost/ops/semantic drift |
| ‏Fail-closed gates | avoids uncertain entry | blocked opportunity |
| ‏Provider abstraction | replaceability | lowest-common-denominator risk |
| ‏Provider extensions | preserve rich capability | more contracts/versioning |

---

## ‏8. What I Would Avoid Initially

‏לא נבנה בתחילת הדרך:

- ‏שלושה live providers במקביל.
- ‏automatic provider consensus.
- ‏dynamic “fastest feed wins”.
- ‏silent failover.
- ‏provider blending בתוך Strategy.
- ‏full L3 לכל ה־Universe.
- ‏re-ranking אוטומטי בזמן execution בלי Experiment נפרד.
- ‏fallback מ־#1 ל־#2 רק כי broker validation נכשל.
- ‏price divergence thresholds שלא עברו calibration.
- ‏Environment שבו Shadow יכול לטעון credentials שמסוגלים לשלוח orders.

---

## ‏9. What to Add Later

‏לאחר Baseline יציב ו־Evidence:

### ‏`P2`

- ‏Dual-feed shadow comparison.
- ‏Provider drift monitoring.
- ‏normalized divergence distributions.
- ‏blocked opportunity analysis.
- ‏warm standby.

### ‏`P3`

- ‏controlled failover.
- ‏hysteresis סביב failover.
- ‏secondary-provider capability degradation policies.
- ‏Top-N broker validation rather than Top-1 only.
- ‏candidate enrichment hot set.

### ‏`P4`

- ‏multi-provider consensus.
- ‏dynamic source selection.
- ‏specialist depth provider blending.
- ‏automatic source arbitration.

---

## ‏10. Required Data / Evidence

‏לפני Promotion של הארכיטקטורה נדרש לפחות:

```text
canonical market-event fixtures
instrument-master fixtures
provider/broker contract-resolution fixtures
live/raw capture samples
replayable data sessions
provider quote timestamps
broker quote timestamps when available
order/fill/position lifecycle events
cross-provider comparison snapshots
fresh coverage metrics
mapping failure logs
reconnect/recovery traces
```

‏לכל Candidate/Decision חשוב נשמור provenance:

```text
market_event_ids
provider/feed/feed_epoch
candidate_id
decision_id
intent_id
client_order_id
broker_order_id
fill_ids
```

---

## ‏11. Promotion Criteria

‏ה־Baseline הארכיטקטוני נחשב מוכן לשלב הבא כאשר:

### ‏Correctness

- ‏Strategy code אינו קורא Provider/Broker SDK ישירות.
- ‏Canonical Instrument mapping חד־משמעי.
- ‏mapping failures נכשלות סגור.
- ‏Event/receive/decision/order/fill times נשמרים.
- ‏Market Observation ו־Execution Truth אינם נדרסים זה בזה.

### ‏Data Trust

- ‏fresh coverage נמדד cross-sectionally.
- ‏Candidate freshness נמדדת בנפרד.
- ‏silence אינו מתפרש כ־zero movement.
- ‏gaps/stale/out-of-order מסומנים.

### ‏Execution Boundary

- ‏Broker truth הוא authoritative ל־orders/fills/positions.
- ‏reconciliation קיים אחרי reconnect.
- ‏UNKNOWN_EFFECT/UNKNOWN order state חוסם conflicting action.

### ‏Replay/Parity

- ‏Recorded session יכול לשחזר את אותן decisions ב־Replay תחת אותן versions.
- ‏provider identity/feed epoch נשמרים.

### ‏Operational Safety

- ‏Data health ו־Broker health נפרדים.
- ‏new decisions חסומים עד readiness.
- ‏Shadow/Paper wiring cannot accidentally become execution-capable through ordinary config drift.

---

## ‏12. Rejection Criteria

‏הארכיטקטורה אינה מוכנה אם אחד מאלה מתקיים:

- ‏`broker.getLastPrice()` או provider SDK leaked לתוך Strategy.
- ‏Provider symbol משמש canonical domain key.
- ‏אין point-in-time mapping.
- ‏Candidate יכול להגיע לברוקר בלי deterministic contract resolution.
- ‏Provider/Broker prices מושווים בלי same-field/time/session semantics.
- ‏market-wide ranking ממשיך בזמן partial/stale universe בלי trust gate.
- ‏Reconnect של Broker מאפשר retry לפני reconciliation.
- ‏Reconnect של Data מסמן READY לפני warm-up.
- ‏market-data queue יכולה לחסום Fill/Position event processing.
- ‏silent provider failover אפשרי.
- ‏provider switch אינו versioned/audited.
- ‏PnL משתמש במחיר Provider במקום Fill.
- ‏Replay אינו יודע איזה Provider/Feed יצר את Decision.

---

## ‏13. Metrics

### ‏Market Data

```text
fresh_coverage_ratio
provider_event_rate
provider_bytes_per_sec
provider_lag_p50/p95/p99
processing_lag_p50/p95/p99
gap_rate
stale_symbol_count
reconnect_count
time_to_data_ready
```

### ‏Candidate Handoff

```text
candidate_age_ms
signal_age_ms
signal_survival_to_validation
signal_survival_to_submit
mapping_failure_rate
session_mismatch_rate
```

### ‏Cross-Provider / Broker Validation

```text
bid_divergence_bps
ask_divergence_bps
quote_age_difference_ms
divergence_reject_rate
decision_impact_rate
blocked_opportunity_rate
```

### ‏Execution

```text
decision_to_submit_ms
submit_to_ack_ms
submit_to_first_fill_ms
submit_to_terminal_ms
time_to_flat_ms
implementation_shortfall_bps
```

### ‏Recovery

```text
time_to_broker_reconciled
time_to_market_state_warm
time_to_system_ready
unknown_state_count
recovery_invariant_violations
```

---

## ‏14. Failure Modes

### ‏F1 — Wrong Instrument Mapping

‏Candidate נכון, contract שגוי.

‏Response:

```text
fail closed
incident
mapping RCA
regression fixture
```

---

### ‏F2 — Fresh Candidate / Stale Universe

‏#1 נראה תקין אך cross-section אינו comparable.

‏Response:

```text
rank_trusted=false
NO TRADE
```

---

### ‏F3 — Provider/Broker Field Mismatch

‏`Last` מול `Ask` מתפרש בטעות כ־divergence.

‏Response:

```text
comparison contract violation
```

---

### ‏F4 — Signal Dies During Validation

‏Validation מגן על price אך צורך את חיי ה־Signal.

‏Response:

```text
expire intent
record reason
analyze latency budget
```

---

### ‏F5 — Data Recovers Before Features Are Warm

‏socket healthy, rolling state incomplete.

‏Response:

```text
WARMING
no valid rank for affected features
```

---

### ‏F6 — Broker Reconnect Without Reconciliation

‏local state שונה מה־Broker.

‏Response:

```text
SYNCING / EXIT_ONLY as policy requires
reconcile first
```

---

### ‏F7 — Silent Feed Failover

‏same Strategy version, different semantics, no trace.

‏Response:

```text
forbid
new feed_epoch
capability validation
```

---

### ‏F8 — Market Data Burst Starves Broker Events

‏System מפסיד Fill event עקב data throughput.

‏Response:

```text
separate queues
broker/risk priority
load shedding on optional data path
```

---

### ‏F9 — Provider Drift Looks Like Strategy Drift

‏Ranking behavior משתנה בגלל data quality deterioration.

‏Response:

```text
provider drift metrics
first-divergence RCA
```

---

### ‏F10 — Provider Switch Looks Technically Equivalent but Economically Different

‏Canonical schema זהה, Feed meaning שונה.

‏Response:

```text
provider change = experiment
replay → shadow → comparison
```

---

## ‏15. User-Specific Application

‏לרובוט קצר־הטווח שלנו, שסורק אלפי מניות ומנסה למצוא Candidate חזק בתוך שניות, ההפרדה נותנת Baseline טבעי:

```text
Broad external feed
→ whole-market state
→ cheap features on full universe
→ rank
→ Top-N
→ richer candidate validation
→ canonical broker contract resolution
→ execution-side quote/status sanity
→ signal TTL + risk recheck
→ Paper execution adapter
```

‏ה־design מגן במיוחד מפני שלושה failures שסורק cross-sectional רגיש אליהם:

1. ‏Universe חלקי שיוצר Rank #1 מזויף.
2. ‏Candidate שהיה #1 בזמן T אך הגיע ל־Execution מאוחר מדי.
3. ‏Mismatch בין Provider symbol לבין Broker contract.

‏בשלב המחקר אין הצדקה ל־multi-provider consensus או direct-feed complexity לפני שנוכיח שה־single broad feed הוא bottleneck מהותי.

---

## ‏16. Concrete Baseline Contract

### ‏16.1 Market Event

```text
CanonicalMarketEvent {
  event_id
  canonical_instrument_id
  event_type
  bid_price?
  bid_size?
  ask_price?
  ask_size?
  trade_price?
  trade_size?
  event_time
  provider_time?
  receive_time
  provider
  feed
  venue?
  sequence?
  quality_flags[]
  schema_version
  normalizer_version
}
```

### ‏16.2 Instrument Master

```text
InstrumentMasterRecord {
  canonical_instrument_id
  symbol
  asset_type
  currency
  primary_exchange
  provider_mappings[]
  broker_mappings[]
  valid_from
  valid_to
  status
  version
}
```

### ‏16.3 Candidate Handoff

```text
CandidateForExecution {
  candidate_id
  decision_id
  canonical_instrument_id
  ranking_as_of_time
  rank
  score
  signal_created_at
  signal_expires_at
  provider
  feed
  feed_epoch
  provider_bid
  provider_ask
  provider_quote_time
  provider_quote_age_ms
  fresh_coverage_ratio
  execution_price_budget
  strategy_version
  feature_version
  score_version
  decision_version
}
```

### ‏16.4 Pre-Submit Validation

```text
resolve broker contract
validate instrument/session/trading state
validate provider candidate freshness
validate system-wide rank trust
optionally fetch/use broker-side quote
compare like-with-like side-aware fields
validate divergence policy
validate signal TTL
validate risk
validate broker readiness/reconciliation state
validate no conflicting unknown exposure
→ APPROVE_INTENT or REJECT_WITH_REASON
```

### ‏16.5 Source-of-Truth Rule

```text
Market observation != Fill truth
Provider price != execution price
Decision price != PnL price
Broker quote != universal market truth
Broker fill/position = execution truth
```

---

## ‏17. Confidence

### ‏High

- ‏Market Data ו־Execution צריכים Boundaries נפרדים.
- ‏Broker הוא authoritative ל־orders/fills/positions.
- ‏Canonical Instrument identity נדרש כאשר Provider ו־Broker שונים.
- ‏Cross-provider price comparison חייבת להיות same-field/time/session aware.
- ‏market-wide ranking דורש cross-sectional freshness/coverage health.
- ‏reconnect אינו readiness.
- ‏provider switch צריך להיות versioned/observable.

### ‏Medium-High

- ‏External broad feed + broker validation הוא Baseline מתאים למערכת הזו, בהתחשב בדרישות whole-market שנבחנו במקטעים 30–31.
- ‏Top-N candidate validation עשוי להיות עדיף על Top-1 בלבד, אך צריך experiment נפרד.

### ‏Low / Unproven

- ‏Divergence threshold מספרי.
- ‏כמה broker-side validation improves net outcome.
- ‏האם fallback #1→#2 מוסיף value.
- ‏האם warm secondary feed מצדיק את cost/complexity.
- ‏האם multi-provider consensus מועיל בכלל לאסטרטגיה.

---

## ‏18. Time-Sensitive Facts

‏המקטע עצמו ארכיטקטוני.

‏Facts תלויי זמן שכבר אומתו במקטעים 30–31 — כגון provider plans, feed coverage, WebSocket/subscription behavior, Broker API capabilities, pacing ו־licensing — **אינם hard-coded כאן מחדש**.

‏לפני שימוש תפעולי יש לאמת מחדש:

```text
provider feed semantics
provider plan/entitlements
historical retention/rights
non-display licensing
broker market-data capabilities
broker order/session capabilities
provider/broker session coverage
```

‏ה־architecture נשארת תקפה גם כאשר המספרים והמוצרים משתנים.

---

## ‏19. Current Verification Snapshot

‏לא בוצע Web verification חדש במקטע 32, משום שלא נקבעה כאן capability מסחרית חדשה או מספר חדש של Vendor/Broker.

‏המסמך נשען על:

- ‏Current verification של `IBKR / IBKR Israel` ממקטע 30.
- ‏Current verification של `Massive`, ‏`Alpaca`, ‏`Databento` ו־`Nasdaq` ממקטע 31.

‏כל Fact תפעולי מאותם מקטעים נשאר subject to re-verification בעת Promotion.

---

## ‏20. Relationship to Earlier Sheets

### ‏מקטע 05 — Market Data

‏32 הופך את provenance/freshness/schema לע boundary ארכיטקטוני מול Execution.

### ‏מקטע 06 — Time / Sampling / Latency

‏32 מחבר את clock domains ל־Data→Decision→Broker→Fill timeline.

### ‏מקטע 07 — Trading Universe

‏Instrument Master ו־point-in-time mapping ממשיכים את Universe identity.

### ‏מקטע 11 — Liquidity / Executability

‏side-aware Bid/Ask validation קרוב ל־Execution מממש את ה־Executability gate.

### ‏מקטע 15 — Trade / No Trade

‏Data/Broker/mapping/session conflicts מתורגמים ל־reason-coded `NO TRADE`.

### ‏מקטע 16 — Entry / Execution

‏32 מגדיר את ה־handoff ל־Execution Engine ואת ה־price budget.

### ‏מקטע 19 — Risk

‏Risk Engine הוא gate בין Observation/Intent לבין Execution.

### ‏מקטע 20–21 — Backtest / Execution Backtest

‏Historical/Replay חייבים לשמר Provider semantics ו־availability timing.

### ‏מקטע 26 — RCA

‏First Divergence יכול להיות עכשיו Data, Mapping, Decision או Broker.

### ‏מקטע 27 — Replay

‏Replay שומר Provider identity/feed epoch, בעוד SimulatedBroker מייצר consequences.

### ‏מקטע 28 — Shadow/Paper

‏32 נותן wiring מפורש ל־Live Data + Null/Paper Execution.

### ‏מקטע 29 — Broker Architecture

‏29 מגדיר את Broker Boundary; ‏32 מגדיר את seam בינו לבין Market Data.

### ‏מקטע 30 — IBKR

‏IBKR יכול להישאר Execution Broker גם כאשר discovery data מגיע מספק אחר.

### ‏מקטע 31 — Data Providers

‏31 בוחר איך משווים Feeds; ‏32 מגדיר איך Feed שנבחר משתלב במערכת בלי לזהם את Strategy/Execution.

---

## ‏21. Relationship to Later Sheets

### ‏מקטע 33 — Production State Machine

‏ה־State Machine חייב לצרף לפחות:

```text
Data state
Broker state
Risk state
Strategy state
Position/Order state
```

‏ולהגדיר transitions/invariants כאשר אחד מהם degraded/unknown.

### ‏מקטע 34 — Failure Recovery

‏32 כבר קובע ש־Data recovery ו־Broker recovery נפרדים ושה־Broker reconciliation מקדים New Entry readiness.

### ‏מקטע 35 — Observability

‏נידרש dashboards ו־traces משותפים ל־coverage, lag, divergence, broker lifecycle ו־blocked decisions.

### ‏מקטע 36 — Kill Switches

‏Data untrusted, mapping conflict או Broker unreconciled יהפכו inputs ל־safety controls.

---

## ‏22. Required Tests

### ‏Unit

- ‏Provider DTO → canonical field mapping.
- ‏Bid/Ask אינם מתחלפים.
- ‏timestamp precision נשמרת.
- ‏raw conditions נשמרים.
- ‏unknown/missing אינם zero.

### ‏Instrument Master

- ‏point-in-time mapping.
- ‏ticker change.
- ‏class share ambiguity.
- ‏wrong currency/exchange reject.
- ‏unknown broker contract reject.

### ‏Provider Contract

- ‏disconnect emits health transition.
- ‏reconnect does not silently duplicate subscriptions.
- ‏sequence gap marks quality.
- ‏stale data cannot appear READY.

### ‏Broker Contract

- ‏partial fill accumulation.
- ‏cancel/fill race.
- ‏unknown effect.
- ‏reconciliation after reconnect.

### ‏Integration

```text
candidate
→ canonical instrument
→ broker contract
→ side-aware validation
→ paper order intent
```

### ‏Golden Scenarios

- ‏Provider stale → blocked.
- ‏Universe partial → rank untrusted.
- ‏Mapping failure → blocked.
- ‏Provider/Broker small normal divergence → allowed under tested policy.
- ‏Large pre-submit divergence → blocked/re-evaluated according to policy.
- ‏Broker disconnect after submit → reconcile before any retry.
- ‏Data reconnect → warming before rank valid.
- ‏Primary feed failure → no silent fallback.

### ‏Replay

‏אותו recorded provider tape + same versions חייב לייצר אותו Decision Ledger.

---

## ‏23. Operational Invariants

‏לפחות:

```text
No order without canonical instrument resolution
No new entry when rank_trusted=false
No new entry when candidate data is stale
No submit after signal TTL expiry
No blind retry after unknown broker effect
No position mutation without fill/reconciliation evidence
No silent provider switch
No provider SDK object in Strategy domain
No broker SDK object in Feature/Ranking domain
No READY after reconnect before required warm/reconciliation gates
```

‏הפרת invariant היא Incident, לא Warning קוסמטי.

---

## ‏24. Decision Reason Codes — Baseline

```text
NO_TRADE_DATA_STALE
NO_TRADE_MARKET_COVERAGE_DEGRADED
NO_TRADE_RANK_UNTRUSTED
NO_TRADE_DATA_GAP
NO_TRADE_INSTRUMENT_MAPPING_FAILED
NO_TRADE_SESSION_MISMATCH
NO_TRADE_TRADING_STATE_UNKNOWN
NO_TRADE_PROVIDER_BROKER_DIVERGENCE
NO_TRADE_SIGNAL_EXPIRED
NO_TRADE_BROKER_NOT_READY
NO_TRADE_BROKER_UNRECONCILED
NO_TRADE_RISK_BLOCKED
NO_TRADE_UNKNOWN_EXPOSURE
```

‏Reason codes נשמרים יחד עם future labels כדי למדוד False Safety ו־Blocked Opportunity Cost.

---

## ‏25. Provider Switch Contract

‏החלפת Feed היא `Strategy Environment Change`.

‏Promotion path:

```text
new provider/feed
→ capability contract validation
→ historical/replay comparison
→ shadow dual-feed comparison
→ decision-impact analysis
→ RCA of divergences
→ explicit promotion
→ new feed_epoch
```

‏לא משנים Provider ו־Broker באותו experiment אם אפשר להימנע מכך.

---

## ‏26. Failover Baseline

‏ב־MVP:

```text
Primary Feed failure
→ PAUSE_NEW_ENTRIES
→ keep broker reconciliation / position-risk path alive
→ recover/warm primary
→ revalidate rank trust
→ resume only after readiness
```

‏Automatic Secondary takeover אינו Baseline.

‏אם בעתיד נוסף Secondary:

```text
secondary must already have compatible capabilities
state must be warm enough
switch must create new feed_epoch
switch must be auditable
strategy validity under secondary semantics must be pre-validated
```

---

## ‏27. Performance Priorities

‏הפרדה טובה אינה רשות להוסיף latency ללא גבול.

‏נמדוד:

```text
provider network/source lag
local ingestion lag
feature compute lag
ranking lag
candidate handoff lag
execution validation lag
decision-to-submit lag
broker ack/fill lag
```

‏Optimization order:

```text
correctness
→ observability
→ remove backlog
→ remove unnecessary work
→ optimize hot path
→ only then infrastructure specialization
```

‏אין צורך להעמיד פנים שהמערכת HFT כאשר ה־Signal horizon הוא שניות.

---

## ‏28. Security Boundary

‏Market Data credentials אינם צריכים הרשאות מסחר.

‏Execution credentials נשארים ב־Broker/Execution boundary בלבד.

‏Baseline:

```text
Market Data process/service
→ data-only secrets

Execution boundary
→ broker credentials
```

‏ב־Shadow/Paper אין לטעון live execution credentials.

---

## ‏29. Observability Baseline

‏Dashboard/telemetry מינימליים:

```text
provider connection state
provider/feed/feed_epoch
fresh coverage ratio
data age p50/p95/p99
processing lag p50/p95/p99
gap/stale/out-of-order rates
Top-N freshness
mapping failures
broker health
broker reconciliation state
open orders
positions
cross-provider divergence
blocked decisions by reason
candidate age
signal age
execution validation latency
```

‏לכל Candidate #1 צריך להיות אפשר לפתוח Trace מלא מ־Market Event עד Decision ועד Paper Fill.

---

## ‏30. Recommendation Summary

‏המלצת המקטע:

```text
P0:
Separate Market Data and Execution truth domains
Canonical market events
Canonical instrument identity
Point-in-time instrument mapping
Explicit clock domains
Cross-sectional fresh-coverage gate
Candidate freshness/TTL gate
Side-aware compare-like-with-like validation
Broker truth for orders/fills/positions
Reconciliation after broker recovery
Warm-up after market-data recovery
Separate backpressure domains
Explicit environment wiring
End-to-end provenance and reason codes

P1:
External broad-market feed
Top-N candidate handoff
Fast execution-side recheck
Normalized divergence monitoring
Provider switch as controlled experiment

P2/P3:
Dual-feed shadow
Warm secondary
Provider drift analysis
Controlled failover
Top-N broker validation

P4:
Multi-provider consensus
Dynamic source blending/arbitration
Specialist direct-feed combinations
```

‏ה־Baseline הקצר:

```text
Observe broadly through a provider.
Decide through canonical strategy state.
Resolve identity before execution.
Validate freshness and executable context near submit.
Let Risk decide whether the bridge is allowed.
Let the Broker define order/fill/position truth.
Preserve the entire evidence chain.
```

‏זהו הגבול הנכון לפני מקטע 33: כעת יש לנו רכיבים חיצוניים נפרדים וברורים; השלב הבא הוא להפוך אותם ל־`Production State Machine` אחת עם states, transitions ו־invariants מפורשים.
