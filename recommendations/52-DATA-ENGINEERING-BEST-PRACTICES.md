# ‏52 — Recommendation Sheet: Data Engineering Best Practices

> ‏מקור לימודי עיקרי: `../52-DATA-ENGINEERING-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline ארכיטקטוני, מחקרי ותפעולי ל־`Market Data Pipeline` של רובוט `Short-Horizon Momentum`, כך שכל Event, State, Feature, Dataset ו־Decision יהיו point-in-time correct, replayable, auditable וניתנים ל־RCA; תוך שמירת provenance, timestamps, sequence/gap state, schema/parser versions, data quality ו־live-vs-backfill distinctions.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏Data Engineering אצלנו אינו שכבת plumbing שנמצאת “לפני האסטרטגיה”.

‏הוא חלק מ־Evidence Integrity של האסטרטגיה עצמה.

‏ה־Baseline:

```text
Provider Bytes / Messages
→ Raw Capture
→ Parser + Provenance
→ Canonical Normalization
→ Ordering / Gap / Duplicate Validation
→ Canonical Event Log
→ Per-Symbol Canonical State
→ Incremental Features
→ Scanner / Decision
```

‏ובמקביל:

```text
Raw + Canonical Event History
→ Versioned Historical Store
→ Replay / Research / RCA
→ Dataset Manifests / Lineage
```

‏העיקרון המחייב:

```text
Raw != Canonical != Derived
EventTime != ReceiveTime != ProcessTime
Historical correctness != As-Known-At correctness
Missing != Zero
Backfilled != Observed Live
```

‏Data אינו הופך ל־Evidence רק מפני שהוא נשמר.

‏הוא הופך ל־Evidence רק כאשר אנחנו יודעים:

```text
source
semantics
clock domain
ordering
quality
coverage
version
provenance
what was actually known at decision time
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: שלוש שכבות Truth נפרדות

‏נחזיק לפחות:

```text
Raw Provider Event
Canonical Event
Derived State / Feature
```

‏המשמעות:

```text
Raw
= what the provider actually delivered

Canonical
= our versioned interpretation

Derived
= state / feature / metric built from canonical evidence
```

‏אסור לשכתב Raw כדי להתאים לפרשנות מאוחרת יותר.

‏כאשר Parser או Normalizer מתוקנים:

```text
same raw
→ new parser/normalizer version
→ new canonical build
```

‏לא מוחקים את build הישן שעליו ניסוי קודם הסתמך.

### ‏`P0 — Required`: ‏`As-Known-At`, לא רק Event-Time correctness

‏לכל Decision בזמן `T`:

```text
usable_event.receive_time <= T
```

‏כאשר `receive_time` מייצג מתי המידע נעשה זמין בפועל למערכת.

‏Event יכול לעמוד ב־:

```text
event_time < T
```

‏ועדיין להיות אסור למחקר Decision אם:

```text
receive_time > T
```

‏זו Leakage אמיתית ב־short-horizon research.

### ‏`P0 — Required`: Timestamp Domains נשמרים בנפרד

‏לכל Event נשתדל לשמור לפי availability:

```text
provider_event_time
receive_wall_time
receive_monotonic_time
process_time
persist_time
```

‏ולא נחליף ביניהם.

‏Clock Domain מתועד:

```text
exchange/provider clock
local wall clock
local monotonic clock
broker clock
```

‏Latency פנימית נמדדת באמצעות monotonic clock כאשר מתאים.

### ‏`P0 — Required`: Raw Capture לפני destructive interpretation

‏Raw record צריך לשמר ככל האפשר:

```text
provider
provider_generation
connection_id
subscription_id
message_family
provider_timestamp
receive_timestamp
sequence
raw_payload_or_raw_fields
parser_version
capture_version
```

‏Secrets/auth headers אינם חלק מ־Raw market-data evidence.

### ‏`P0 — Required`: Canonical schema קטן, מפורש ו־versioned

‏Baseline event families:

```text
TradeEvent
QuoteEvent
BookEvent
TradingStatusEvent
CorporateActionEvent
SymbolReferenceEvent
HeartbeatEvent
```

‏Canonical layer הוא provider-agnostic ככל האפשר, אבל אינו `lowest common denominator`.

‏נשמור:

```text
canonical core
+ provider provenance / extensions
```

‏כדי שלא נאבד metadata שימושי למחקר/RCA.

### ‏`P0 — Required`: Missing / Unknown / Invalid נשארים states נפרדים

‏אין:

```text
UNKNOWN → 0
MISSING → 0
STALE → last-known-good without flag
```

‏Data value יישא כאשר רלוונטי:

```text
value
status
quality
age
provenance
reason_code
```

‏`0` הוא ערך כלכלי אפשרי.

‏`UNKNOWN` הוא מצב ידע.

### ‏`P0 — Required`: Sequence/Gaps contract לפי scope האמיתי של הספק

‏אם Provider מספק Sequence, נרשום גם את scope שלו:

```text
PER_CONNECTION
PER_CHANNEL
PER_SYMBOL
PER_VENUE
PER_MESSAGE_FAMILY
GLOBAL
UNKNOWN
```

‏Gap שאינו מוסבר:

```text
DATA_INCOMPLETE
```

‏ולא ממשיכים כאילו continuity הוכחה.

### ‏`P0 — Required`: Duplicate handling מבוסס identity אמין

‏אין להשתמש ב־:

```text
same symbol + same timestamp
```

‏כ־duplicate key אוניברסלי.

‏כאשר קיימים:

```text
provider_event_id
trade_id
sequence
execution identity
```

‏הם עדיפים.

‏כאשר identity חלקית בלבד, dedup policy מקבלת Confidence ומוגדרת לפי provider contract.

### ‏`P0 — Required`: Out-of-Order policy מפורשת

‏לכל stream/event family נגדיר:

```text
ACCEPT
MARK_LATE
REORDER_WITHIN_BOUND
DROP_DUPLICATE
INVALIDATE_STATE
REQUEST_RESYNC
REBUILD
```

‏`last arrival wins` אינו Baseline בטוח.

### ‏`P0 — Required`: Torn Snapshot protection

‏Quote/Book State צריך לדעת אם Bid/Ask/depth נוצרו מאותו atomic provider snapshot או מאירועים נפרדים.

‏אם State אינו coherent מספיק:

```text
TORN_STATE
or
DEGRADED
```

‏Feature כמו Spread, Microprice או Book Imbalance אינו מחושב כאילו snapshot היה atomic.

### ‏`P0 — Required`: Quality Metadata זורמת עד Decision

‏Data Quality States:

```text
GOOD
DEGRADED
INCOMPLETE
STALE
CONFLICTED
UNKNOWN
```

‏Quality אינה “נבלעת” אחרי ingest.

‏Decision Snapshot צריך לדעת אם input היה:

```text
fresh
complete enough
same generation
same provider semantics
quality acceptable
```

### ‏`P0 — Required`: Freshness היא vector, לא boolean אחד

‏נמדוד לפי צורך:

```text
trade_age
quote_age
book_age
status_age
reference_data_age
feature_age
```

‏Feature משתמש רק ב־inputs שהוא דורש.

‏`symbol_fresh = true` אינו מספיק.

### ‏`P0 — Required`: Coverage היא חלק מ־Cross-Sectional Truth

‏Whole-market Scanner צריך לדעת:

```text
expected_universe
subscribed
receiving
fresh
valid
rankable
tradable
```

‏`FreshCoverageRatio` denominator חייב להיות point-in-time correct.

‏Coverage ירודה יכולה לגרום ל־Top1 מזויף.

### ‏`P0 — Required`: ‏`data_generation` אחרי continuity break

‏ב־:

```text
reconnect
provider failover
provider reset
major resync
schema/semantic reset
```

‏נעלה:

```text
data_generation++
```

‏Decision שנוצר על generation ישן אינו עובר אוטומטית ל־Execution.

‏Pre-submit revalidation יכול לבדוק:

```text
current_data_generation == decision_data_generation
```

‏או לבצע re-evaluation מפורש.

### ‏`P1 — Preferred Default`: Event-driven capture + simple local/in-process serving

‏ל־MVP:

```text
Provider Adapter
→ Raw Capture
→ Canonical Normalizer
→ Validator
→ Canonical Event Log
→ Per-Symbol State
→ Incremental Feature Engine
→ Scanner
```

‏לא נתחיל ב־distributed lakehouse/stream-processing cluster כל עוד pipeline פשוט עומד ב־throughput, durability ו־replay requirements.

### ‏`P1 — Preferred Default`: Append-only canonical log עם corrections כ־events

‏במקום לשכתב היסטוריה:

```text
TRADE
TRADE_CORRECTION
TRADE_CANCEL
```

‏Projections בונות את Current State הנכון.

‏Raw evidence נשארת בלתי־משוכתבת.

### ‏`P0 — Required`: Unit / Precision Contracts

‏לכל field חשוב:

```text
meaning
unit
storage precision
calculation precision
unknown semantics
valid range
```

‏לדוגמה:

```text
0.5 != "0.5%" by implication
```

‏`percent`, ‏`fraction`, ‏`bps`, ‏`USD`, ‏`shares`, ‏`milliseconds` נשמרים מפורשות.

### ‏`P0 — Required`: Schema + Parser + Normalizer versions

‏לכל Canonical build נשמור:

```text
schema_version
parser_version
normalizer_version
reference_data_version
```

‏Semantic change בלי version change הוא bug.

### ‏`P0 — Required`: Unknown enum/value אינו coercion שקט

‏כאשר Provider מוסיף enum חדש:

```text
UNKNOWN_PROVIDER_VALUE
```

‏עדיף על mapping invented או crash בלתי נשלט.

### ‏`P0 — Required`: Provider Capability contract

‏לכל Feed:

```text
trades
quotes
NBBO semantics
venue-specific fields
book depth
odd-lot coverage
auction data
trading status
sequence semantics
reconnect behavior
historical/backfill behavior
```

‏Feature שחסר לו input:

```text
UNAVAILABLE
```

‏לא fabricated.

---

## ‏3. Why

‏במערכת קצרה, Silent Data Corruption יכולה להיראות כמו Alpha.

‏דוגמאות:

```text
future quote joined backward
stale losers excluded
missing symbols dropped from ranking
late trades reordered into the past
provider backlog counted as live burst
unit mismatch
impossible torn quote
```

‏ה־Backtest יכול אפילו להשתפר.

‏לכן Data Pipeline מקצועי צריך לאפשר לנו לענות:

```text
What happened?
What did we receive?
When did we know it?
Was anything missing?
Which code interpreted it?
Which decision consumed it?
```

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד למערכת שלנו כי יש לנו:

```text
thousands of symbols
milliseconds-to-seconds horizons
cross-sectional ranking
multiple data sources possible
incremental rolling features
replay / RCA requirements
strict freshness sensitivity
```

‏אותם Contracts מתאימים ל־Live, Replay, Shadow ו־Research.

---

## ‏5. Do Not Use When

‏אין צורך להעתיק את כל הארכיטקטורה אם מדובר ב־dataset קטן ואיטי ללא Streaming.

‏אבל גם אז נדרשים:

```text
provenance
versioning
point-in-time correctness
missing semantics
reproducibility
```

‏מה שניתן לפשט הוא topology/storage, לא Evidence Integrity.

---

## ‏6. Canonical Data Contracts

### ‏6.1 `RawMarketRecord`

```text
raw_event_id
provider
provider_generation
connection_id
subscription_id
message_family
provider_symbol
instrument_id_if_resolved
provider_event_time
receive_wall_time
receive_monotonic_time
sequence
sequence_scope
raw_payload_or_raw_fields
capture_version
parser_version
capture_quality_flags
```

### ‏6.2 `CanonicalEvent`

```text
canonical_event_id
raw_event_id
instrument_id
provider
provider_generation
event_type
event_time
receive_time
process_time
sequence
sequence_scope
venue_if_known
condition_codes
quality_state
provenance_state
schema_version
parser_version
normalizer_version
```

### ‏6.3 `DataQualityState`

```text
state
reason_codes
trade_age_ms
quote_age_ms
book_age_ms
status_age_ms
gap_count
max_gap_age_ms
sequence_state
subscription_state
provider_health
generation
as_of_time
```

### ‏6.4 `ProvenanceState`

```text
OBSERVED_LIVE
INFERRED
BACKFILLED
CORRECTED
SYNTHETIC_TEST
UNKNOWN
```

### ‏6.5 `DatasetManifest`

```text
dataset_id
created_at
raw_sources
source_versions
schema_versions
parser_versions
normalizer_versions
reference_data_version
universe_version
partitions
coverage_summary
known_gaps
quality_summary
build_code_commit
build_config_hash
revision_policy
provenance_mix
```

### ‏6.6 `DecisionDataReference`

```text
decision_id
data_generation
provider_set
canonical_build_id
feature_schema_version
rank_as_of
fresh_coverage_ratio
quality_summary
referenced_raw_partitions
referenced_dataset_id_if_replay
```

---

## ‏7. Point-in-Time / As-Known-At Contract

### ‏7.1 Live-Equivalent availability

‏Decision ב־`T` רשאי לראות רק records שהיו זמינים עד `T` לפי ה־availability semantics של המערכת.

‏Baseline:

```text
receive_time <= decision_cutoff
```

‏כאשר יש processing backlog, ניתן לדרוש גם:

```text
processed_or_state_available_time <= decision_cutoff
```

‏בהתאם ל־Replay fidelity.

### ‏7.2 Historical joins

‏Join בזמן יהיה:

```text
latest known at-or-before T
within max_age / quality tolerance
```

‏לא:

```text
nearest absolute timestamp
```

### ‏7.3 Late arrival exclusion

‏Event שהגיע אחרי Decision אינו נכנס לאותו Historical Decision Snapshot גם אם `event_time` מוקדם יותר.

### ‏7.4 Window completeness

‏Feature window נושאת:

```text
requested_duration
observed_duration
event_count
gap_count
max_gap
coverage_ratio
```

‏Window חסרה מדי:

```text
FEATURE_UNAVAILABLE
```

‏ולא “best effort number” סמוי.

### ‏7.5 Causal Feature/Label cutoff

```text
feature_cutoff_time
label_start_time
label_end_time
```

‏ה־pipeline צריך למנוע join שבו Future Label Data מגיעה לשורת Feature.

---

## ‏8. Ordering / Sequence / Duplicate Model

### ‏8.1 Ordering contract

‏לכל Provider/Event Family נגדיר:

```text
primary ordering key
secondary ordering key
tie breaker
late-event policy
reorder tolerance
reset semantics
```

### ‏8.2 Replay ordering

‏Replay deterministic יגדיר canonical ordering, למשל בהתאם ל־provider semantics:

```text
provider sequence
→ receive order
→ stable event id
```

‏אין tie-breaking מקרי.

### ‏8.3 Gaps

‏Gap מייצר:

```text
quality = INCOMPLETE
```

‏עד Resync/Repair/Warm-Up מתאים.

### ‏8.4 Duplicates

‏Idempotent processing מבטיח:

```text
duplicate trade
!=
double volume
!=
double trade count
!=
double flow
```

### ‏8.5 Backlog after reconnect

‏Provider history/backlog שנשלח אחרי reconnect לא מסווג אוטומטית כ־fresh live burst.

‏נבדוק:

```text
event_time
receive_time
provider reconnect semantics
backfill marker if available
```

---

## ‏9. Canonical State Builder

‏State Builder יחיד אחראי על:

```text
ordering acceptance
state transitions
sequence continuity
freshness
quality flags
current trade/quote/book/status
provider generation
```

‏Feature Engine לא מפרש Raw Provider dialect מחדש.

### ‏9.1 Per-field freshness

‏Current State יכול להכיל:

```text
trade.current + trade.age
quote.bid/ask + per-side age
book.version + age
status.value + age
```

### ‏9.2 Current state אינו rewrite של history

‏Late correction יכולה לשנות Current Projection או Corrected Historical Build.

‏אבל Decision Evidence שכבר נרשמה נשארת immutable ומציינת מה היה Known אז.

### ‏9.3 Generation boundary

‏Reconnect/Failover/Reset יכול לאפס חלק מה־state או להכריח warm-up.

‏ה־generation boundary חייב להיות observable.

---

## ‏10. Raw / Canonical / Curated / Feature / Label Layers

```text
Raw
→ Canonical
→ Curated
→ Feature
→ Label
```

### ‏Raw

‏Evidence provider-specific, מינימום transformation.

### ‏Canonical

‏Semantics אחידות + provenance.

### ‏Curated

‏Subset/filtering versioned למחקר מסוים.

### ‏Feature

‏Point-in-time calculations בלבד.

### ‏Label

‏Future outcomes pipeline נפרד.

‏אין Shortcut שבו Curated/Label code משנה Raw/Canonical Evidence בדיעבד.

---

## ‏11. Backfill / Correction / Restatement

### ‏11.1 Backfill אינו Live Capture

‏נשמור מפורשות:

```text
capture_origin = LIVE / BACKFILL
```

‏Backfill יכול להיות cleaner/richer ולהכיל מידע שלא היה זמין בזמן אמת.

### ‏11.2 Data correction

‏תיקון Data יוצר:

```text
Dataset V2
```

‏לא משנה את `Dataset V1` שעליו Result קיים הסתמך.

### ‏11.3 Correction log

```text
correction_id
affected_range
affected_symbols
reason
old_build
new_build
code_version
impact_status
```

### ‏11.4 Impact analysis

‏לאחר Data incident:

```text
affected days
→ symbols
→ canonical records
→ features
→ experiments
→ decisions
```

‏ואז, כאשר נדרש:

```text
rebuild
→ recompute
→ rerun
→ compare decisions
```

---

## ‏12. Replay / Historical Fidelity

### ‏12.1 Fidelity ladder

```text
D0 — coarse snapshots only
D1 — ordered trades/quotes
D2 — original arrival timing / bursts
D3 — depth + sequence + gaps + status
D4 — provider-specific high-fidelity reconstruction
```

‏כל Result מצהיר על `data_fidelity_level`.

### ‏12.2 No false precision

‏Dataset של snapshots כל `10s` אינו Evidence להחלטות `50ms`.

### ‏12.3 Arrival timing

‏Replay קצר־טווח צריך להיות מסוגל, לפי fidelity, לשחזר:

```text
inter-arrival delay
bursts
jitter
late events
reconnect backlog
```

### ‏12.4 Replay/live equality

‏על Recorded Session נבדוק:

```text
state hashes
feature values
rank snapshots
decisions
```

‏Same raw evidence + same versions אמורים לייצר אותו semantic state.

### ‏12.5 Snapshot + event tail

‏ל־Recovery/Replay performance אפשר:

```text
validated state snapshot
+ replay events after checkpoint
```

‏Snapshot עצמו מקבל checksum, version, sequence positions ו־quality state.

---

## ‏13. Storage / Retention

### ‏13.1 Storage tiers

‏Baseline conceptual:

```text
Hot online state
Warm canonical history
Cold compressed raw archive
Derived research aggregates
```

### ‏13.2 Capture first, analyze later

‏Write path בשעת burst נשאר פשוט ככל האפשר.

‏לא מבצעים joins כבדים לכל Event לפני capture.

### ‏13.3 Minimum ingest validation

‏לפחות:

```text
parseable
known/handled schema
sane timestamp
known or quarantinable symbol
sequence semantics applied
basic field validity
```

### ‏13.4 Quarantine

‏אירוע חשוד נשמר כאשר אפשר:

```text
BAD_SCHEMA
IMPOSSIBLE_VALUE
UNKNOWN_SYMBOL
SEQUENCE_FAILURE
```

‏ולא פשוט נעלם.

### ‏13.5 Bounded buffers

‏אין unbounded ingest queue.

### ‏13.6 Batching

‏Batching הוא throughput/latency trade-off.

‏Archive יכול להשתמש batches גדולים יותר מ־decision path.

### ‏13.7 Retention policy

‏Retention הוא explicit trade-off בין:

```text
future research optionality
storage cost
licensing limits
RCA need
```

‏Raw שקשה להשיג מחדש מקבל ערך אופציונלי גבוה יותר.

---

## ‏14. Historical Identity / Reference Data

### ‏14.1 Ticker אינו Identity

‏נשתמש internal instrument/security identifier יציב ככל האפשר.

### ‏14.2 Universe history

‏Backtest משתמש ב־Universe שהיה ידוע/eligible בזמן הנבדק.

‏אין current-universe survivorship.

### ‏14.3 Corporate actions

‏נפריד:

```text
raw as-traded prices
adjusted research series
```

‏Execution simulation משתמש ב־as-traded semantics המתאימות לזמן ההיסטורי.

### ‏14.4 Reference-data version

‏Metadata כמו:

```text
venue
security type
currency
session eligibility
symbol mapping
```

‏מקבלת point-in-time/version semantics כאשר נדרש.

### ‏14.5 Calendar/session

‏Trading calendar הוא external reference data, לא hard-coded assumption.

‏Internally נשמור timestamps canonical ו־`trading_session_id` מפורש.

---

## ‏15. Online / Offline Parity

‏היעד:

```text
same semantics
across
Live / Replay / Backtest / Shadow
```

### ‏15.1 Shared logic

‏כאשר אפשר, Canonical State ו־Feature logic משותפים.

‏אם יש implementations שונות, נדרשים conformance/differential tests.

### ‏15.2 Feature cache key

```text
instrument_id
feature_id
feature_version
cutoff_time
data_generation
source_build_version
```

### ‏15.3 Late correction invalidation

‏Corrected historical build יכול invalidate cached Feature dataset.

‏אבל Live Decision History אינה משוכתבת.

### ‏15.4 Research data ID

‏Experiment מצביע ל־:

```text
dataset_id
```

‏לא ל־:

```text
/data/latest
```

---

## ‏16. Multi-Provider / Failover

### ‏16.1 Provider אינו Venue

‏נפריד:

```text
source_provider
market_venue
```

### ‏16.2 Multi-provider merge אינו "last value wins"

‏Policy מפורשת:

```text
PRIMARY
VALIDATOR
FAILOVER
```

‏או model אחר שנבדק.

### ‏16.3 Divergence

‏נמדוד:

```text
price divergence
quote divergence
status divergence
timestamp divergence
coverage divergence
```

‏אך נפרש זאת ביחס ל־scope/semantics של כל feed.

### ‏16.4 Failover

```text
provider_generation++
→ invalidate continuity assumptions
→ rebuild/warm required state
→ prove readiness
```

### ‏16.5 Shadow provider migration

‏Provider חדש עובר:

```text
shadow capture
→ side-by-side comparison
→ semantic conformance
→ recovery tests
→ research recalibration
→ gradual promotion
```

‏שינוי Provider הוא Research Event.

---

## ‏17. Throughput / Backpressure

### ‏17.1 Metrics

```text
events_per_second
bytes_per_second
peak_burst
queue_depth
oldest_queue_age
processing_lag
persist_lag
```

### ‏17.2 Average אינו capacity target

‏Sizing מבוסס גם על bursts אמיתיים.

### ‏17.3 Priority under overload

```text
broker / risk / trading status
> position-relevant market data
> candidate data
> full-universe enrichments
> UI / analytics
```

### ‏17.4 Loss budget per stream

‏לכל Event class נגדיר loss tolerance.

‏Critical financial/order/fill truth אינו נזרק בשקט.

### ‏17.5 Market data loss semantics

‏אם Market stream מאבד events:

```text
quality changes
coverage changes
decision capability may degrade
```

‏ולא ממשיכים עם אותו Quality State.

### ‏17.6 Queue age

‏Queue Age חשוב יותר ממספר events בלבד.

‏Data ישן מדי ביחס ל־Signal Half-Life אינו “Current” גם אם נצליח לעבד אותו לבסוף.

---

## ‏18. Data Latency / Signal Half-Life

‏נפריד:

```text
provider latency
network latency
ingest latency
normalize latency
state update latency
feature latency
scanner latency
```

‏ה־metric הכלכלי החשוב:

```text
DataAgeAtDecision
=
DecisionTime - SourceEventTime
```

‏בכפוף ל־clock/fidelity limitations.

‏נמדוד:

```text
P50
P95
P99
```

‏ונבדוק גם:

```text
Rank vs DataAge
Outcome vs DataAge
Freshness bias among winners
```

‏Feature predictive שמסתמך על fresher symbols בלבד יכול להיות pipeline artifact.

---

## ‏19. Observability

### ‏19.1 Data Pipeline metrics

```text
ingest_rate
parse_failure_rate
schema_error_rate
duplicate_rate
gap_rate
out_of_order_rate
freshness_distribution
fresh_coverage_ratio
queue_age_p50/p95/p99
persist_latency_p50/p95/p99
reconnect_count
subscription_failures
provider_generation_changes
quarantine_rate
```

### ‏19.2 Distributional/Semantic alerts

‏לא רק crash alerts.

‏נזהה למשל:

```text
spread distribution shifted unexpectedly
trade rate collapsed
zero/null rate spiked
one provider diverged
fresh coverage collapsed
latency distribution shifted
```

### ‏19.3 Data Incident Packet

```text
incident_id
provider / generation
connection ids
sequence ranges
sample raw event refs
schema/parser/normalizer versions
quality state
coverage
queue age
system load
recent deploy/config
affected symbols/time range
```

### ‏19.4 RCA

```text
first divergence
→ raw source?
→ parser?
→ ordering?
→ canonical state?
→ storage/query?
→ feature?
→ decision impact?
```

---

## ‏20. Testing Strategy

### ‏`P0`: Provider contract tests

‏לכל Adapter:

```text
required fields
units
enums
timestamps
sequence semantics
null/missing handling
reconnect behavior
backfill behavior
```

### ‏`P0`: Recorded raw parser regression

‏שומרים Raw samples אמיתיים ידועים ובודקים Parse/Normalize deterministically.

### ‏`P0`: Point-in-time tests

```text
late event cannot leak backward
nearest join never chooses future row
window boundaries are explicit
old snapshot beyond tolerance returns UNKNOWN
```

### ‏`P0`: Idempotency

```text
duplicate input
→ no duplicate economic effect
```

### ‏`P0`: Replay determinism

```text
same raw + same versions
→ same canonical events
→ same state hashes
→ same features
→ same ranking evidence
```

### ‏`P0`: Data leakage canaries

```text
future-shifted fake feature should fail integrity checks
late-arrival exclusion test
label isolation test
```

### ‏Fault injection

```text
sequence gaps
duplicates
reordering
clock jump
provider disconnect
reconnect backlog
partial file
schema drift
slow disk
queue overflow
provider divergence
```

### ‏Golden corpus

‏נחזיק:

```text
quiet session
open burst
halt/reopen
fast market
wide spread episode
high-volume symbol
provider outage/reconnect
```

### ‏Performance / Soak

```text
burst throughput
long-running memory stability
allocations/event
queue-age tails
write lag
replay duration
```

‏Optimization מתבצעת אחרי Profiling.

---

## ‏21. Data Lineage / Research Integration

‏Lineage מלא:

```text
Raw Partition
→ Canonical Build
→ Curated Dataset
→ Feature Dataset
→ Experiment
→ Result
→ Strategy Version
→ Decision
```

### ‏21.1 Immutable Dataset IDs

‏Experiment משמעותי מקבל `dataset_id` immutable.

### ‏21.2 Dataset Manifest

‏כולל source/version/coverage/gaps/build code/provenance.

### ‏21.3 Correction creates new version

‏Repair אינו משנה Result ישן silently.

### ‏21.4 Data Provider change

‏מוגדר Research Event המחייב comparison/revalidation לפי מקטע 49.

### ‏21.5 Live-capture dataset

‏נשמור subset איכותי של sessions כפי שנראו בזמן אמת, כולל arrival metadata, כדי לכייל Backtest/Replay מול Reality.

---

## ‏22. As-Traded / Decision Evidence

‏סביב Decision/Execution נשמור references ל־Evidence כפי שנראתה אז:

```text
signal snapshot
rank snapshot
pre-submit market state
fill-time state
exit decision state
post-fill / post-exit markouts
```

‏Decision Packet אינו משתנה לאחר Late Correction.

‏Correction יכולה להוסיף:

```text
later_corrected_view
```

‏אך אינה משכתבת:

```text
what_was_known_then
```

---

## ‏23. Failure Modes

### ‏`DX_GAP`

‏חסרים events בתחום שבו continuity נדרשת.

### ‏`DX_DUPLICATE`

‏Duplicate לא טופל ויצר economic double counting.

### ‏`DX_OUT_OF_ORDER`

‏Late/reordered event שבר State semantics.

### ‏`DX_STALE`

‏Data ישן שימש כאילו הוא Current.

### ‏`DX_TORN_STATE`

‏Feature נבנה מ־state לא coherent.

### ‏`DX_SCHEMA_DRIFT`

‏Provider semantics/schema השתנו ללא טיפול.

### ‏`DX_PARSER_BUG`

‏Raw תקין פורש לא נכון.

### ‏`DX_UNIT_MISMATCH`

‏Units/precision יצרו value שגוי.

### ‏`DX_PROVIDER_DIVERGENCE`

‏Feeds סותרים מעבר להסבר הסמנטי/זמני הידוע.

### ‏`DX_BACKFILL_MISMATCH`

‏Backfill הוצג כאילו היה Live-observed.

### ‏`DX_FUTURE_LEAKAGE`

‏מידע שלא היה Known ב־Decision time נכנס למחקר.

### ‏`DX_UNIVERSE_BIAS`

‏Coverage/Universe history יצרו survivorship או selection bias.

### ‏`DX_CLOCK_ERROR`

‏Clock domain/offset שגוי פגע ב־age/ordering.

### ‏`DX_STORAGE_CORRUPTION`

‏Partition/File נפגעו או נחתכו.

### ‏`DX_REPLAY_MISMATCH`

‏Replay אינו משחזר State צפוי מאותו Evidence.

### ‏`DX_GENERATION_LEAK`

‏Decision/Feature ישן חצה Provider/Data generation ללא revalidation.

### ‏`DX_SILENT_QUALITY_LOSS`

‏Upstream degraded אך Decision לא קיבל את flag.

### ‏`DX_UNKNOWN`

‏Root cause עדיין לא ידוע; אינו מוחלף בסיפור נוח.

---

## ‏24. Metrics

### ‏Capture / Transport

```text
events_per_sec
bytes_per_sec
connection_count
reconnect_count
subscription_expected
subscription_active
subscription_failed
```

### ‏Integrity

```text
parse_failure_rate
schema_error_rate
gap_rate
duplicate_rate
out_of_order_rate
quarantine_rate
correction_rate
provider_generation_count
```

### ‏Freshness / Coverage

```text
trade_age_p50/p95/p99
quote_age_p50/p95/p99
book_age_p50/p95/p99
fresh_symbol_count
fresh_coverage_ratio
rankable_coverage_ratio
```

### ‏Latency / Backpressure

```text
ingest_latency_p50/p95/p99
normalize_latency_p50/p95/p99
state_update_latency_p50/p95/p99
persist_latency_p50/p95/p99
queue_oldest_age
queue_age_p95/p99
```

### ‏Storage / Replay

```text
partition_event_count
partition_checksum_failures
replay_duration
replay_state_mismatch_count
snapshot_load_failures
rebuild_duration
```

### ‏Research / Lineage

```text
dataset_version_count
known_gap_count
live_vs_backfill_share
experiments_affected_by_correction
provider_change_experiments
```

### ‏Decision Impact

```text
NO_TRADE_DATA_QUALITY_rate
NO_TRADE_COVERAGE_rate
execution_revalidation_generation_mismatch_rate
rank_vs_data_age_correlation
winner_freshness_bias
```

---

## ‏25. Performance / Storage Trade-offs

### ‏JSON

‏יתרון:

```text
human-debuggable
simple
```

‏חיסרון אפשרי:

```text
size / parse cost
```

### ‏Binary / Columnar

‏יתרון אפשרי:

```text
throughput
compression
batch analytics
```

‏מחיר:

```text
compatibility/debugging complexity
```

‏Baseline אינו קובע technology לפני workload measurement.

### ‏Integerized prices

‏אפשרות טובה כאשר precision contract ברור.

‏לא prerequisite ל־MVP אם representation הקיימת נכונה ומאומתת.

### ‏Caching / Materialization

‏נשתמש כאשר:

```text
cost_saved > invalidation/version complexity
```

---

## ‏26. Security / Licensing

‏Raw/Logs לא יכילו:

```text
passwords
tokens
auth headers
API secrets
```

‏Broker/account data יכולה לקבל permissions שונות מ־Market Data Research.

‏Market-data redistribution/export עשויים להיות תלויי License/Provider ולכן נבדקים מול תנאים עדכניים לפני שימוש כזה.

---

## ‏27. Alternatives / Trade-offs

### ‏Snapshot-only Collector

‏פשוט וזול.

‏אבל מאבד bursts/microstructure ויכול לא להתאים ל־short horizon.

### ‏Full Raw Event Capture

‏Evidence עשירה יותר.

‏מחיר:

```text
storage
bandwidth
processing
operations
```

### ‏Single Provider

‏KISS ותפעול קל.

‏מחיר: פחות cross-validation/failover evidence.

### ‏Multi-Provider

‏יכול לשפר diagnostics/redundancy.

‏מחיר:

```text
semantic conflicts
alignment complexity
cost
research boundaries
```

### ‏Distributed Streaming Platform

‏`P4` עד שמדידה מוכיחה צורך.

‏עם ≈4,000 symbols, pipeline פשוט יכול להספיק היטב.

---

## ‏28. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Huge distributed lakehouse.
- ‏Kafka/streaming cluster רק לשם architecture.
- ‏10 databases לאותו data path.
- ‏Real-time ML feature store.
- ‏Hundreds of canonical schemas.
- ‏Automatic provider merge ללא conflict semantics.
- ‏Silent missing→zero normalization.
- ‏Historical overwrite after correction.
- ‏Backfill שמתחזה ל־Live capture.
- ‏Current universe לכל ההיסטוריה.
- ‏Full-depth capture לכל השוק ללא צורך מוכח.
- ‏Microsecond precision claims שאינם נתמכים בפיד.
- ‏Cache invalidation מורכב לפני profiling.

---

## ‏29. What to Add Later

‏רק לאחר Evidence:

```text
higher-fidelity direct/depth capture
advanced compaction / columnar archive
provider redundancy
shadow failover
content-addressed datasets
richer provenance graph
automated impact analysis
triggered high-fidelity capture
data catalog UI
advanced checkpoint/rebuild system
specialized low-allocation parsers
```

---

## ‏30. Promotion Criteria

‏Data pipeline/change יכול להתקדם רק אם:

- ‏Point-in-Time / As-Known-At semantics נשמרות.
- ‏Raw evidence נשמרת או Loss/Retention policy מתועדת.
- ‏Missing/Unknown semantics נשמרות.
- ‏Sequence/Gap behavior ידוע ונבדק.
- ‏Provider reconnect/backfill behavior נבדק.
- ‏Replay deterministic ברמת fidelity המוצהרת.
- ‏Dataset/Schema/Parser versions קיימים.
- ‏Quality flags מגיעים עד Decision.
- ‏Freshness/Coverage observable.
- ‏Burst load אינו יוצר silent stale data.
- ‏Correction creates new version, לא rewrite שקט.
- ‏Research/Live semantic parity עוברת conformance.
- ‏RCA יכול לרדת מ־Decision/Feature עד Raw evidence.
- ‏Complexity/Cost מוצדקים בתועלת אמיתית.

---

## ‏31. Rejection Criteria

‏נReject design/change כאשר:

```text
receive time is unavailable but research pretends live-equivalent timing
missing is silently mapped to zero
provider backlog becomes fake live flow
sequence gaps are invisible
current universe is reused historically
backfill overwrites live-observed evidence
schema meaning changes without version
correction rewrites prior experiment inputs silently
replay cannot reproduce canonical state
coverage loss is hidden
queue age grows while pipeline reports healthy
new provider is promoted without semantic comparison
complexity increases without measured need
```

---

## ‏32. Tests / Invariants

```text
Raw evidence is never silently rewritten
Unknown never becomes numeric zero implicitly
Future-arriving event cannot enter earlier Decision snapshot
Duplicate event cannot create duplicate economic count
Unresolved required gap cannot remain GOOD
Same raw + same versions => same canonical semantic state
Dataset ID is immutable
Correction => new dataset/build version
Decision evidence remains what-was-known-then
Provider failover changes generation
Old generation cannot authorize fresh execution without revalidation
Missing required feed capability => UNAVAILABLE
Replay fidelity cannot claim precision finer than captured evidence
```

---

## ‏33. User-Specific Application

‏למערכת שלנו יש:

```text
~4,000-symbol universe
seconds/sub-seconds research horizons
rolling anchors
cross-sectional ranking
Top-N deep enrichment
separate market-data and broker truth domains
strong Replay/RCA requirement
```

‏לכן ההמלצה הקונקרטית:

```text
1. Keep one small provider adapter per feed.
2. Capture Raw before destructive normalization.
3. Store event_time + receive_time from day one.
4. Preserve sequence/provider-generation metadata.
5. Build one canonical per-symbol state model.
6. Precompute cheap rolling features incrementally.
7. Carry quality/freshness into Scanner ranking.
8. Block whole-market actionable ranking when coverage is inadequate.
9. Keep canonical append-only history for Replay/RCA.
10. Keep Dataset IDs immutable for research.
11. Distinguish live-observed from later backfill.
12. Revalidate candidate when data generation changes.
```

‏Priority עליון אינו “לאסוף כמה שיותר fields”.

‏אלא:

```text
know exactly what we saw,
when we saw it,
how trustworthy it was,
and which decision consumed it.
```

---

## ‏34. Fact / Judgment / Hypothesis

### ‏Fact / Established Engineering Principle

- ‏Event Time, Receive Time ו־Process Time הם concepts שונים.
- ‏Missing/Unknown אינם אותו דבר כמו Numeric Zero.
- ‏Late arrivals יכולים ליצור look-ahead אם Historical Replay מסדר רק לפי event time.
- ‏Duplicate input יכול להשחית counters ללא idempotency.
- ‏Backfill יכול להיות שונה מה־Live evidence המקורית.
- ‏Dataset mutable שובר reproducibility של ניסויים קיימים.
- ‏Coverage חלקית משנה Cross-Sectional Ranking semantics.

### ‏Judgment — Recommended Baseline

- ‏Raw + Canonical append-only evidence.
- ‏Simple in-process/event-driven ingest בתחילת הדרך.
- ‏Canonical State Builder יחיד.
- ‏Explicit DataQualityState.
- ‏Versioned Schema/Parser/Normalizer.
- ‏Immutable Dataset Manifest.
- ‏Live-capture subset באיכות גבוהה.
- ‏Generation boundary לאחר reconnect/failover.
- ‏Tiered retention במקום “לשמור הכול לנצח”.

### ‏Hypothesis — Requires Experiment

- ‏ה־retention horizon המדויק לכל tier.
- ‏מתי Full Raw capture לכל Universe מצדיק עלות.
- ‏מתי Depth/Direct feed מוסיפים Decision Impact.
- ‏Batch/flush sizes.
- ‏Watermark/reorder delay שמצדיק latency.
- ‏Provider redundancy ROI.
- ‏Triggered high-fidelity capture policy.
- ‏Columnar/binary format benefit מול simplicity.

---

## ‏35. Confidence

### ‏High Confidence

‏גבוה לגבי:

- ‏Raw/Canonical/Derived separation.
- ‏As-Known-At point-in-time contract.
- ‏Event/Receive time separation.
- ‏Missing/Unknown semantics.
- ‏Schema/parser versioning.
- ‏Sequence/gap/duplicate observability.
- ‏Immutable Dataset IDs.
- ‏Quality propagation.
- ‏Replay determinism.
- ‏Provider-generation boundary.

### ‏Medium Confidence

‏בינוני לגבי:

- ‏ה־storage technology הספציפי.
- ‏Retention tiers המדויקים.
- ‏reorder/watermark policy לספק מסוים.
- ‏full raw scope לכל ה־Universe.
- ‏multi-provider topology.

### ‏Evidence-Only

‏לא נקדם ללא Measurement:

- ‏Large distributed streaming stack.
- ‏Full-depth/direct-feed capture לכל Symbol.
- ‏Automatic feed merging.
- ‏Complex hot/warm/cold orchestration.
- ‏specialized zero-copy/low-level parser architecture.

---

## ‏36. Time-Sensitive Facts

‏לא קיבענו במקטע זה limits או capabilities נוכחיים של Provider/Broker מסוים.

‏לכן לא נדרש Web verification חדש לצורך Recommendation Sheet המתודולוגי.

‏לפני Implementation ספציפי צריך לאמת בזמן אמת:

```text
provider schema
sequence semantics
reconnect/backfill semantics
subscription limits
feed scope
licensing/retention rights
session/trading-status semantics
```

---

## ‏37. Relationship to Earlier / Later Sheets

### ‏Earlier

- ‏`05` — Market Data contract, provenance ו־freshness בסיסיים.
- ‏`06` — Time/Sampling/Latency ו־clock discipline.
- ‏`13` — Feature contracts ו־point-in-time feature semantics.
- ‏`20–21` — Timeline integrity ו־execution-aware historical simulation.
- ‏`23` — Leakage/validation discipline.
- ‏`27` — Deterministic Replay.
- ‏`31` — Provider comparison/capability.
- ‏`32` — Market Data Truth נפרד מ־Execution Truth.
- ‏`35` — Observability/Evidence Chain.
- ‏`43` — Trading-status / halt state.
- ‏`49` — Dataset/Experiment reproducibility.
- ‏`50` — Scanner freshness/coverage/backpressure.
- ‏`51` — Broker/Execution truth ו־durable side effects.

### ‏Later

‏`53 — Testing Best Practices` יגדיר כיצד לבדוק את Contracts האלו ואת שאר המערכת במהירות: unit/property, timeline, failure injection, deterministic replay, broker/data conformance ו־CI layering.

---

## ‏38. Recommendation Summary

### ‏Priority Map

```text
P0
- Raw / Canonical / Derived separation
- As-Known-At point-in-time correctness
- EventTime / ReceiveTime separation
- Missing / Unknown semantics
- sequence / gap / duplicate contract
- quality propagation
- provider/data generation
- schema/parser/normalizer versioning
- immutable dataset IDs
- deterministic replay
- coverage/freshness visibility
- correction/backfill provenance

P1
- simple event-driven ingest
- canonical per-symbol state
- append-only canonical log
- incremental features
- tiered retention
- Data Manifest / lineage
- live-capture validation dataset
- quarantining suspicious events

P2
- shadow provider comparison
- triggered high-fidelity capture
- richer catalog/provenance tooling
- curated/materialized datasets where useful

P3
- multi-provider failover
- advanced storage/compaction
- adaptive reorder/watermark policies

P4
- large distributed lakehouse/streaming cluster
- full direct/depth capture everywhere
- specialist zero-copy ingestion
```

### ‏Final Baseline

```text
Provider
→ Raw Evidence
→ Versioned Canonical Interpretation
→ Quality / Sequence Validation
→ Canonical Event Log
→ Per-Symbol Current State
→ Incremental Features
→ Fresh/Covered Scanner
→ Immutable Decision Evidence

and

Canonical History
→ Versioned Dataset Manifest
→ Deterministic Replay
→ Research / RCA
```

‏ה־Data Pipeline שלנו צריך להיות **פשוט מספיק כדי להבין ולשחזר, ועשיר מספיק כדי לומר בכנות מה ידענו, מתי ידענו, ומה לא ידענו**.