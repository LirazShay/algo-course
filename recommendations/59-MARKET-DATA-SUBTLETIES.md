# ‏59 — Recommendation Sheet: Market Data Subtleties

> ‏מקור לימודי עיקרי: `../59-MARKET-DATA-SUBTLETIES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־semantic correctness של `Market Data` עבור רובוט `Short-Horizon Momentum`, כך שכל price/quote/trade/book/status יישא source, timing, freshness, condition, quality, ordering ו־generation semantics; וכך ש־Data artifact לא יהפוך בטעות ל־Alpha, Rank או Execution decision.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי, אינו מגדיר Exposure אמיתי ואינו מבטיח רווח.

---

## ‏1. Decision

‏`Market Data` אינו אוסף values.

‏הוא **Evidence with Semantics**.

‏לכל field משמעותי צריך להיות ניתן לענות:

```text
what is the value?
where did it come from?
when was it true at source?
when did provider process it?
when did we receive it?
what was its ordering context?
what condition/status applied?
was anything missing?
was it later corrected?
how old was it at decision time?
was the observation still valid for this signal horizon?
```

‏ה־Baseline:

```text
Provider Observation
→ Raw Evidence
→ Semantic Interpretation
→ Ordering / Gap / Duplicate Validation
→ Canonical State + Quality
→ Feature + Age / Provenance
→ Market-Wide Data Gate
→ Candidate Data Gate
→ Rank / Decision
→ Pre-Submit Data Revalidation
→ Execution
```

‏העקרונות המחייבים:

```text
Market Data != Market Truth
Timestamp precision != Timestamp accuracy
Historical truth != Live-known truth
Missing != Zero
Late != Invalid
Unknown != False
Connected != Fresh
Subscription ACK != Usable Data
Last != Executable Price
Fast stale data = economically slow data
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: Evidence Envelope לכל Event / State

‏לכל Observation משמעותי נשמור ככל שה־Provider מאפשר:

```text
event_time
provider_time
receive_wall_time
receive_monotonic_time
process_time
persist_time
sequence
sequence_scope
provider_id
feed_type
venue_or_scope
condition_codes
quality_state
data_generation
schema_version
parser_version
normalizer_version
```

‏לכל Derived State / Feature נשמור:

```text
as_of
source_event_age
feature_age
quality
provenance
input_generation
feature_version
```

‏כך value בלי semantics אינו יכול להפוך ל־evidence חזק בטעות.

### ‏`P0 — Required`: ‏As-Known-At semantics

‏Decision בזמן `T` רשאי להשתמש רק במידע שהיה זמין למערכת עד `T`.

```text
usable_event.receive_time <= T
```

‏אירוע עם:

```text
event_time < T
receive_time > T
```

‏אינו מידע שהמערכת ידעה בזמן ההחלטה.

‏Correction עתידית אינה רשאית לשכתב בדיעבד את מה שה־Live strategy ידעה.

### ‏`P0 — Required`: ארבעה clocks אינם interchangeable

```text
EventTime
ProviderTime
ReceiveTime
ProcessTime
```

‏ולעתים:

```text
PersistTime
FeatureReadyTime
DecisionTime
```

‏נשתמש ב־wall clock ל־correlation/audit וב־monotonic clock למדידת durations מקומיים כאשר מתאים.

‏אין להסיק latency עדינה משעונים שאינם באותו clock domain.

### ‏`P0 — Required`: Sequence / Gap state מפורש

‏אם יש Sequence, נשמור גם את scope:

```text
GLOBAL
PER_CONNECTION
PER_CHANNEL
PER_SYMBOL
PER_VENUE
PER_MESSAGE_FAMILY
UNKNOWN
```

‏פער לא מוסבר:

```text
DATA_GAP
→ affected state = INCOMPLETE / INVALID
→ block dependent new-risk decisions
→ resync / snapshot / recovery
```

‏חיבור מחדש לבדו אינו מוכיח continuity.

### ‏`P0 — Required`: Dedup זהיר

‏אין dedup לפי:

```text
same symbol + price + qty + timestamp
```

‏ככלל אוניברסלי.

‏שני trades אמיתיים יכולים להיראות זהים.

‏נשתמש ב־provider identity/sequence/event ID כאשר קיימים; אחרת dedup יהיה versioned, conservative ו־confidence-aware.

### ‏`P0 — Required`: Out-of-order policy מפורשת

‏Event late יכול להיות אמיתי.

‏לכל event family נגדיר policy כגון:

```text
accept into live state
reorder within bounded window
preserve but mark late
exclude from current state
apply only to audit/replay
```

‏אין `last arrival wins` אוניברסלי.

### ‏`P0 — Required`: Trade Conditions נשמרים

‏לא כל Trade הוא אותו Trade.

‏נשמור raw/normalized conditions כאשר קיימים ונמנע מלהמיר code לא מוכר ל־`REGULAR`.

```text
UNKNOWN_CONDITION
```

‏הוא state תקין.

‏Condition semantics הן Provider/Venue-specific ותלויות זמן; אין hard-code תפעולי ללא documentation עדכנית.

### ‏`P0 — Required`: ‏`Last` הוא Contract, לא שם field

‏נגדיר במפורש איזה `Last` אנחנו משתמשים בו:

```text
last_received_trade
last_eligible_trade
last_regular_session_trade
last_consolidated_trade
last_venue_trade
official_last
```

‏ונשמור:

```text
last_age
last_condition
last_source
last_session
```

‏`Last` ישן עם Quote טרי אינו Momentum evidence טרי.

### ‏`P0 — Required`: Quote consistency ו־Torn Snapshot detection

‏Bid ו־Ask אינם בהכרח snapshot אטומי.

‏לכל side נשמור age/source/as-of כאשר ניתן.

‏Mid/Spread/Microprice דורשים validation:

```text
bid valid
ask valid
both sufficiently fresh
same compatible generation
not invalid after gap
not internally contradictory beyond known semantics
```

‏Crossed/locked state לא “מתוקן” אוטומטית בלי provenance.

### ‏`P0 — Required`: Missing / Zero / Stale / Unknown נפרדים

```text
MISSING
UNKNOWN
STALE
INVALID
0
```

‏הם semantics שונים.

‏Forward-fill מותר רק כאשר age נשמר והצרכן יודע שהערך אינו observation חדש.

### ‏`P0 — Required`: Canonical Units

‏Baseline:

```text
Price      → deterministic decimal/tick-aware representation
Quantity   → shares or explicit canonical unit
Notional   → explicit currency
Time       → explicit timestamps / durations
```

‏אם Provider מחזיר lots במקום shares, conversion הוא part of contract.

‏Unit mismatch הוא P0 Data failure.

### ‏`P0 — Required`: Stable Instrument Identity

‏Ticker לבדו אינו primary identity ארוך־טווח.

‏כאשר Provider מאפשר, נשמור stable instrument/listing identity ובנפרד:

```text
symbol
listing venue
mapping validity interval
corporate action context
```

### ‏`P0 — Required`: Raw Tradable Price מול Adjusted Research Price

‏ל־short-horizon execution/replay נשתמש ב־raw tradable prices של אותו זמן.

‏Adjusted series נשמרת כ־research representation נפרדת.

‏אין ערבוב silent בין השניים.

### ‏`P0 — Required`: DataGeneration

‏נעלה `DataGeneration` באירועים כגון:

```text
provider failover
reconnect without proven continuity
book resnapshot
material schema/semantic switch
halt/resume boundary when configured
feed reset
```

‏Intent/Feature מ־generation קודם אינו actionable אוטומטית.

### ‏`P0 — Required`: Market-Wide Rank Data Gate

‏לפני Ranking actionable:

```text
FreshCoverageRatio >= calibrated requirement
critical streams healthy
no unresolved market-wide critical gap
clock health acceptable
provider state known
universe coverage known
```

‏המספרים עצמם אינם hard-coded בפרק זה; הם יכוילו לפי Signal Half-Life ו־empirical distribution.

### ‏`P0 — Required`: Candidate Data Gate

‏בנוסף ל־global gate, לכל candidate:

```text
candidate_status tradable
last_age acceptable if last used
bid_age acceptable
ask_age acceptable
required book/flow state ready
no unresolved symbol gap
feature_age acceptable
input_generation current
quote internally valid
```

‏Candidate fresh בתוך Universe stale אינו מספיק; Universe fresh עם Candidate stale גם אינו מספיק.

### ‏`P0 — Required`: Pre-Submit Data Revalidation

‏ממש לפני side effect:

```text
candidate still current?
market status still tradable?
quote still fresh?
spread still valid?
data generation unchanged?
required feature state still ready?
remaining edge still positive?
```

‏אם לא:

```text
NO_TRADE_DATA_REVALIDATION
```

### ‏`P0 — Required`: Exit data מקבל Priority גבוה יותר מ־Broad Scanner

‏בעת עומס:

```text
Broker / Order / Position truth
> Active-position market data
> Candidate execution data
> Top-N deep data
> Broad-universe scanner data
> Analytics
```

‏Scanner overload אינו רשאי להרעיב market data של Position קיימת.

---

## ‏3. Market Data Quality Model

‏נחזיק לפחות:

```text
GOOD
DEGRADED
GAPPED
STALE
UNKNOWN
INVALID
```

‏Quality אינו Dashboard decoration.

‏הוא Input ל־Decision.

```text
Good signal + Poor critical data quality
→ NO_TRADE
```

### ‏Hard Gate מול Confidence

‏אפשר לשמור:

```text
DataConfidence
```

‏למחקר/Ranking.

‏אבל Confidence אינו עוקף Hard Gate.

```text
unresolved gap
unknown trading status
invalid book
candidate stale beyond contract
```

‏חוסמים new risk גם אם confidence score אחר גבוה.

---

## ‏4. Freshness Model

‏Freshness היא Vector:

```text
lastTradeAge
bidAge
askAge
bookAge
statusAge
featureAge
rankAge
metadataAge
```

‏אין boolean יחיד `IsFresh` לכל המערכת.

### ‏Signal-Aware Freshness

‏Staleness נמדדת יחסית ל־Signal Half-Life.

```text
DataAgePressure = RelevantDataAge / SignalHalfLife
```

‏זה diagnostic, לא threshold אוניברסלי.

‏`200ms` יכול להיות תקין ל־Signal של שניות ורע ל־Signal שחי מאות milliseconds.

### ‏No Update אינו בהכרח Failure

‏Per-symbol silence נבחן מול:

```text
symbol activity
quote activity
session
expected update behavior
market-wide activity
provider heartbeat
sequence continuity
```

‏אבל simultaneous silence על Universe רחב הוא Health evidence אחר לגמרי.

---

## ‏5. Fresh Coverage ו־Cross-Sectional Fairness

‏Baseline metric:

```text
FreshCoverageRatio
=
FreshEligibleSymbols / EligibleUniverse
```

‏נשמור בנוסף:

```text
trade_fresh_coverage
quote_fresh_coverage
status_known_coverage
feature_ready_coverage
coverage_by_partition
coverage_by_liquidity_bucket
```

‏Cross-sectional Rank חייב לשמור:

```text
rank_as_of
rank_age
feature_age_per_candidate
last_update_age_per_candidate
```

‏כך Rank #1 אינו פשוט Symbol שהגיע אליו update אחרון מאוחר יותר מהאחרים.

---

## ‏6. Trade / Quote / Book Semantics

### ‏Trades

‏נשמור לפחות כאשר זמין:

```text
price
qty
trade_id
venue
conditions
event_time
receive_time
sequence
provenance
eligibility flags if normalized
```

‏Trade count אינו תמיד message count.

‏Provider יכול aggregate כמה market events ל־message אחד או להפך.

### ‏Quotes

‏נשמור Bid/Ask בנפרד עם age/source כאשר אפשר.

‏Size-only update הוא information.

‏Quote move ללא Trade ו־Trade move ללא stable Quote הם states שונים.

### ‏Book

‏`L1`, ‏`MBP/L2` ו־`MBO` הם evidence tiers שונים.

‏אין להסיק full depth מ־L1.

‏אין להסיק exact queue from MBP.

‏Snapshot + Incremental contract:

```text
Snapshot
→ Incrementals
→ Gap
→ INVALID
→ Resnapshot
→ New trusted generation
```

‏Book reset שלא מוחק state ישן יוצר phantom liquidity ולכן הוא P0 failure.

---

## ‏7. Odd Lots, Size Units ו־Volume Semantics

‏Odd-lot treatment יכול להשתנות בין Feeds/Providers/Histories.

‏לפני Feature שמסתמך על Trades/Quotes/Volume נדרש לדעת:

```text
odd lots included?
which events affect last?
which events affect volume?
what quantity unit is used?
what session scope is used?
venue-local or consolidated?
```

‏Volume field יוגדר מפורשות:

```text
per_trade
session_cumulative
rolling
venue_local
consolidated
eligible_only
provider_aggregated
```

‏Cumulative-volume reset חייב להיות detected; אין delta נאיבי דרך Session/Reset/Reconnect boundary.

---

## ‏8. Consolidated / Direct / Venue Scope

‏`Consolidated` ו־`Direct` אינם רק latency tiers.

‏הם observation models שונים:

```text
coverage
venue scope
ordering
timestamps
depth
aggregation
latency
condition semantics
```

‏לכן:

```text
Provider / Feed change
=
Research Event
```

‏ומעבר:

```text
L1 → L2
Consolidated → Direct
Provider A → Provider B
```

‏נבדק באמצעות:

```text
field divergence
feature divergence
rank divergence
decision impact rate
latency impact
operational complexity
net executable outcome
```

---

## ‏9. Provider Failover / Redundancy

‏Failover אינו שקוף.

‏בעת מעבר Provider:

```text
new DataGeneration
capability/entitlement validation
symbol mapping validation
warm-up
feature readiness
cross-provider divergence monitoring
```

‏שני Feeds אינם בהכרח פי שניים אמינות.

‏הם מוסיפים arbitration problem:

```text
source precedence
dedup
clock differences
ordering disagreement
status disagreement
semantic disagreement
```

‏לא נתחיל Multi-Provider active merge לפני שיש Evidence שהמורכבות נחוצה.

---

## ‏10. Historical Truth מול Live-Known Truth

‏נשמור ככל האפשר שתי views:

```text
AsOriginallyObserved
AsLaterCorrected
```

‏ל־Decision research משתמשים ב־as-known-at view.

‏ל־clean accounting/history אפשר להשתמש גם corrected view, אך ללא שכתוב evidence של ניסויים ישנים.

### ‏Corrections / Cancels

‏Correction עתידית נשמרת כ־event/versioned transformation.

‏היא אינה נשתלת בעבר כאילו הייתה ידועה מראש.

### ‏Backfill

‏Backfill מסומן במפורש:

```text
OBSERVED_LIVE
BACKFILLED
CORRECTED
```

‏Backfill “נקי יותר” אינו תחליף ל־live-capture במחקר latency-sensitive.

---

## ‏11. Replay Fidelity

‏נפריד:

```text
Economic Replay
Transport Replay
Failure Replay
```

‏`Economic Replay` משמר את market event sequence הרלוונטי.

‏`Transport Replay` משמר גם arrival timing, batching ו־queue effects כאשר יש evidence.

‏`Failure Replay` מוסיף gaps, reconnects, delayed batches ו־degraded states.

‏Replay perfectly ordered אינו רשאי לשמש הוכחה יחידה אם Live חווה disorder, batching ו־gaps.

---

## ‏12. Sampling / Bars / Coalescing

‏Sampling cadence אינו Signal Horizon.

```text
Observation Cadence
!= Signal Half-Life
!= Decision Latency
!= Holding Horizon
```

‏Fixed snapshots יכולים להסתיר:

```text
spike
reversal
recovery
```

‏שנמצאים בתוך אותו bucket.

### ‏Event-Driven + Selective Detail

‏Preferred baseline:

```text
Broad universe:
lightweight current state + incremental features

Top-N:
deeper event/book/flow context
```

### ‏Coalescing

‏ל־latest-state Quote ייתכן ש־intermediate states אינם נדרשים ב־hot path.

‏ל־Trade Flow זריקת intermediate events יכולה למחוק Signal.

‏Drop/coalescing policy היא Event-Class-specific.

### ‏Bars / Downsampling

‏כל derivation שומר contract:

```text
window boundaries
timezone
empty windows
late-event handling
correction handling
aggregation rules
version
```

‏OHLC אינו שומר path ordering ולכן אינו Evidence מספיק ל־short-horizon execution.

---

## ‏13. Time / Calendar / Session Semantics

‏נשמור `session_state` במקום להסיק רק משעה מקומית.

‏נפריד:

```text
PRE_MARKET
REGULAR
AFTER_HOURS
AUCTION
HALTED
REOPENING
CLOSED
UNKNOWN
```

‏הערכים והמקור בפועל תלויים ב־Provider/Calendar.

‏לא hard-code offset קבוע בין ישראל לארה״ב.

‏Calendar/Holiday/Early-Close rules הן time-sensitive וצריכות versioning/verification.

---

## ‏14. Trading Status / Halt / Auction

‏Price קיים אינו אומר Price executable.

‏ב־halt/reopen/auction:

```text
market_status
market_generation
quote semantics
feature readiness
```

‏יכולים להשתנות.

‏Intent/Rank קודמים אינם עוברים אוטומטית את הגבול.

---

## ‏15. Provider Batching / Network Jitter / Client Backpressure

‏Receive-time burst אינו בהכרח Market burst.

‏Provider batching יכול ליצור fake acceleration.

‏Network jitter יכול ליצור fake deceleration.

‏Client queue/backpressure יכול ליצור feed stale גם כאשר provider מהיר.

‏נמדוד בנפרד:

```text
provider_delay
network_delay
receive_to_process
queue_age
feature_delay
rank_delay
decision_data_age
```

‏`queue_age` חשוב יותר מ־queue length לבדו.

---

## ‏16. Data Priority Classes

‏בעת עומס:

```text
P0 Broker / Order / Position truth
P1 Active-position market data
P2 Top candidates / execution context
P3 Broad universe
P4 Research / analytics extras
```

‏זה אינו אומר שמאבדים Broad Universe בשגרה; זו degradation policy ל־stress.

‏Critical truth events אינם drop candidates.

---

## ‏17. Data Lineage / Evidence Packet

‏לכל Candidate/Decision משמעותי נרצה trace:

```text
Decision
→ Features
→ Canonical State
→ Normalized Events
→ Raw Provider Evidence
```

‏Evidence packet קטן יכול לכלול:

```text
provider/generation
raw references
canonical snapshot
quality flags
timestamps
feature values
rank context
market status
```

‏כך ניתן לבצע RCA בלי לשמור כל ה־raw universe לנצח באותה resolution.

---

## ‏18. Storage Fidelity / Retention

‏Retention יכול להיות tiered:

```text
high-resolution recent raw
compressed canonical history
aggregated long-term research data
```

‏אבל אסור ש־compression/downsampling ימחוק Evidence שנדרש להיפותזה שנבחנת.

‏אם חוקרים `200ms` effect:

```text
1s snapshots
```

‏אינם הוכחה מספקת.

---

## ‏19. Provider / Schema / Parser Drift

‏כל שינוי משמעותי ב־:

```text
schema
condition enums
parser
normalizer
entitlement
feed product
subscription behavior
```

‏יכול לשנות semantics בלי שהקוד יקרוס.

‏נדרש:

```text
contract tests
golden raw fixtures
unknown-enum metrics
field-distribution monitoring
shadow old-vs-new comparison
```

‏Code חדש שלא מכיר condition חדש אינו רשאי לסווג אותו silent כ־regular.

---

## ‏20. Data Entitlement / Subscription Readiness

‏Startup אינו מסתפק ב־subscription ACK.

‏נבדוק בפועל:

```text
expected universe coverage
message flow
freshness
required fields
required sessions/status
entitlement fingerprint
```

‏`CONNECTED` ו־`SUBSCRIBED` הם states מוקדמים בלבד.

```text
CONNECTED
→ SUBSCRIBED
→ RECEIVING
→ QUALITY_VALID
→ FEATURE_READY
→ RANK_READY
```

---

## ‏21. Feature Readiness

‏Readiness היא vector:

```text
HAS_10S_HISTORY
HAS_60S_HISTORY
QUOTE_READY
BOOK_SYNCED
TRADE_FLOW_READY
STATUS_KNOWN
METADATA_VALID
```

‏אחרי reconnect לא כל feature חוזר ל־ready מיד.

‏Warm-up הוא correctness requirement, לא רק performance issue.

---

## ‏22. Trade Signing / Inference

‏Trade side הוא inference אלא אם source מספק truth מתאים.

‏נשמור:

```text
side_estimate
confidence
method
method_version
```

‏ולא נכפה `BUY/SELL` כאשר confidence נמוך.

```text
UNKNOWN
```

‏הוא label שימושי.

---

## ‏23. Book Churn / Persistence

‏Displayed size אינו liquidity guarantee.

‏נפריד:

```text
displayed_depth
persistent_depth
consumed_depth
replenished_depth
```

‏נמדוד `LiquidityHalfLife` / persistence כאשר המחקר מצדיק זאת.

‏Book/size feature שמבוסס על stale/transient units אינו evidence אמין גם אם הנוסחה שלו נכונה.

---

## ‏24. Midpoint / Microprice Quality

‏Midpoint דורש שני Quote sides תקפים.

‏Microprice דורש בנוסף Size semantics איכותיים.

‏אם:

```text
bid stale
ask stale
size unit unknown
book fragmented/gapped
```

‏ה־derived value מסומן invalid/low-confidence ולא נכנס כ־truth.

---

## ‏25. Raw / Canonical / Derived Separation

‏מקטע 52 נשאר Source of Truth הארכיטקטוני.

‏מקטע 59 מוסיף את כלל ה־semantic preservation:

```text
Canonical
=
Common Shape
+
Source-Specific Evidence
```

‏ולא:

```text
Canonical
=
Lowest Common Denominator
```

‏Normalization שאיבדה condition/source/quality/sequence אינה canonicalization טובה עבור המחקר שלנו.

---

## ‏26. Provider-Specific Alpha Risk

‏Feature שעובד רק אצל Provider אחד צריך להיבדק מול:

```text
Market Alpha?
Provider Artifact?
Timestamp Artifact?
Aggregation Artifact?
Condition Inclusion Artifact?
Coverage Artifact?
```

‏Cross-provider experiment הוא כלי מחקר חשוב כאשר זמין, אך אינו Baseline requirement לכל feature.

---

## ‏27. Decision Impact Rate ל־Data Changes

‏Feed/Normalizer upgrade אינו מקבל Promotion רק כי internal metric נראה “נקי” יותר.

‏נמדוד:

```text
field divergence rate
feature divergence rate
rank divergence rate
candidate divergence rate
TRADE/NO_TRADE divergence
entry timing divergence
exit timing divergence
latency change
net execution value change
```

‏Data change חשוב כלכלית רק אם הוא משנה החלטות/איכות בצורה מועילה ויציבה.

---

## ‏28. Recommended Market Data Baseline לרובוט שלנו

‏כרגע, כ־Baseline מחקרי:

```text
Whole Universe:
Last
Bid
Ask
source timestamps
receive timestamps
freshness
activity
market status / quality when available

Top-N:
trade conditions
flow detail
deeper quote/book context
queue/execution context when justified
```

‏זה אינו claim ש־L2 אינו מועיל.

‏זה KISS sequencing:

```text
prove value of broad L1-quality evidence first
→ add deeper data where Decision Impact proves value
```

---

## ‏29. Use When

‏ה־Baseline מתאים כאשר:

- ‏סורקים Universe רחב.
- ‏Signal horizon קצר מספיק ש־Freshness/Ordering משמעותיים.
- ‏Research ו־Live חייבים להיות reproducible.
- ‏רוצים להפריד Market Alpha מ־Provider artifacts.
- ‏ה־Execution תלוי ב־Bid/Ask/Depth/Status ולא רק ב־Last.

---

## ‏30. Do Not Use When

‏אין להשתמש ב־simplified Last-only evidence כ־Production-like execution truth כאשר:

- ‏Spread/Quote age אינם ידועים.
- ‏Universe coverage חלקי.
- ‏candidate quote stale.
- ‏market status unknown.
- ‏sequence gap לא תוקן.
- ‏Provider generation השתנה ללא warm-up.
- ‏היפותזה דורשת resolution גבוהה יותר מה־dataset.

‏במצבים אלה:

```text
NO_TRADE_DATA_QUALITY
```

‏היא תוצאה תקינה.

---

## ‏31. Alternatives

### ‏Baseline

```text
Broad L1-quality evidence
+ strong freshness / quality / provenance
+ Top-N deep enrichment
```

### ‏Challenger

```text
Broader event-level trade/quote capture
for more of the universe
```

### ‏Advanced Option

```text
L2 / MBP for selected symbols / windows
```

### ‏Specialist Option

```text
MBO / direct venue / multi-feed reconstruction
```

### ‏Avoid Unless Evidence

```text
full-depth all-symbol ingestion
multi-provider active merge
microsecond tuning without matching signal horizon
lossy normalization that hides semantics
```

---

## ‏32. Trade-offs

### ‏יותר Raw Evidence

‏יתרונות:

- ‏RCA טוב יותר.
- ‏Replay נאמן יותר.
- ‏Parser rebuild.

‏חסרונות:

- ‏Storage.
- ‏I/O.
- ‏operational complexity.

### ‏יותר Feed Richness

‏יתרונות:

- ‏יותר context.
- ‏execution modeling טוב יותר.

‏חסרונות:

- ‏latency/CPU/storage.
- ‏more failure modes.
- ‏more hypotheses/overfitting.

### ‏יותר Strict Quality Gates

‏יתרונות:

- ‏פחות stale/fake decisions.

‏חסרונות:

- ‏יותר `NO_TRADE`.
- ‏ייתכן missed opportunity.

‏לכן gates מכוילים מול Net outcome, לא מול desire לסחור יותר.

---

## ‏33. What I Would Avoid Initially

‏לא נתחיל מ־:

- ‏L2 מלא לכל אלפי ה־Symbols.
- ‏MBO מלא.
- ‏Active-active multi-provider merge.
- ‏Cross-feed microsecond reconstruction.
- ‏Per-symbol custom data rules רבים.
- ‏Interpolation של executable quotes שלא נצפו.
- ‏Lossy canonical model שמוחק raw semantics.
- ‏DataConfidence score שמנסה לעקוף Hard Gates.
- ‏Automatic trust ב־unknown condition codes.

---

## ‏34. What to Add Later

‏רק עם Evidence:

- ‏Cross-provider shadow comparison קבוע.
- ‏L2/MBP ל־Top-N.
- ‏MBO ל־Queue research ממוקד.
- ‏Regime-conditioned freshness thresholds.
- ‏DataConfidence calibrated model.
- ‏Provider divergence arbitration.
- ‏Adaptive retention לפי research value.
- ‏Liquidity persistence/half-life models.
- ‏Transport replay distributions.

---

## ‏35. Required Data / Evidence

‏לפחות:

```text
raw/provider timestamps
receive timestamps
provider/source
conditions
sequence or explicit absence
trade/quote values
field ages
quality state
market status
universe eligibility
coverage
parser/schema versions
data generation
known gaps
```

‏למחקר Provider/Feed change:

```text
same-time shadow comparison
field divergence
feature divergence
rank divergence
decision divergence
latency distribution
net outcome distribution
```

---

## ‏36. Metrics

### ‏Data Health

```text
message_rate
fresh_coverage_ratio
trade_fresh_coverage
quote_fresh_coverage
candidate_data_age
gap_count
gap_duration
late_event_rate
duplicate_rate
unknown_condition_rate
crossed_quote_rate
torn_quote_rate
provider_disconnects
reconnect_count
queue_age
feature_ready_coverage
```

### ‏Semantic / Drift

```text
schema_unknown_field_rate
unknown_enum_rate
unit_validation_failures
provider_divergence_rate
field_distribution_shift
parser_diff_rate
normalizer_diff_rate
```

### ‏Decision Impact

```text
rank_divergence_rate
candidate_divergence_rate
NO_TRADE_DATA_GATE_rate
pre_submit_data_revalidation_fail_rate
decision_impact_rate
execution_outcome_delta
```

### ‏Latency

```text
event_to_receive
receive_to_process
process_to_feature
feature_to_rank
data_age_at_decision
candidate_age_at_submit
P50 / P95 / P99
```

---

## ‏37. Failure Modes / RCA Taxonomy

```text
DATA_GAP
DATA_STALE
DATA_LATE
DATA_DUPLICATE
DATA_DUPLICATE_SPIKE
DATA_OUT_OF_ORDER
DATA_TORN_QUOTE
DATA_CROSSED_QUOTE_UNEXPLAINED
DATA_UNKNOWN_CONDITION
DATA_CONDITION_MISCLASSIFIED
DATA_PROVIDER_DIVERGENCE
DATA_SCHEMA_DRIFT
DATA_PARSER_DRIFT
DATA_UNIT_MISMATCH
DATA_BOOK_INVALID
DATA_PHANTOM_LIQUIDITY
DATA_PARTIAL_COVERAGE
DATA_CANDIDATE_STALE
DATA_RECONNECT_WARMUP
DATA_GENERATION_LEAK
DATA_CLOCK_UNCERTAIN
DATA_BATCHING_ARTIFACT
DATA_THROTTLED
DATA_QUEUE_STALE
DATA_VOLUME_RESET
DATA_SYMBOL_MAPPING
DATA_CORPORATE_ACTION
DATA_SESSION_MISCLASSIFIED
DATA_HISTORICAL_LIVE_MISMATCH
DATA_BACKFILL_LEAKAGE
DATA_REPLAY_TOO_CLEAN
DATA_UNKNOWN
```

‏`UNKNOWN` נשאר outcome תקין כאשר Evidence אינו מאפשר attribution.

---

## ‏38. RCA — First Divergence

‏Timeline:

```text
Market Reality
→ Provider Observation
→ Transport Arrival
→ Parser
→ Canonical State
→ Feature State
→ Rank State
→ Decision Snapshot
→ Execution Snapshot
```

‏נחפש את הנקודה הראשונה שבה:

```text
expected evidence
!= observed evidence
```

‏לפני שמאשימים Strategy.

---

## ‏39. Golden Raw / Data Scenarios

‏נחזיק fixtures ל־:

```text
normal trade/quote
exact duplicate delivery
two legitimate identical trades
out-of-order trade
sequence gap
late event
late batch
bid-only update
ask-only update
stale ask
crossed quote
locked quote
unknown condition
trade correction after decision
trade cancel after decision
book snapshot + incrementals
book gap + resnapshot
book reset
cumulative volume reset
provider reconnect
provider failover
partial universe coverage
subscription ACK but no usable data
halt
resume/reopen
auction transition
clock jump
schema enum expansion
unit mismatch
symbol change
corporate action boundary
```

---

## ‏40. Property / Invariant Tests

```text
Missing never silently becomes zero.
Unknown condition never silently becomes regular.
Invalid book cannot become tradable without explicit recovery.
Gap state survives until resync/recovery contract is satisfied.
Provider switch changes DataGeneration.
Old generation cannot silently become current.
Late correction cannot alter an earlier as-known-at decision.
Duplicate event cannot double-count activity.
Same raw + same versions => same canonical result.
Same canonical events + same versions => same quality flags.
Candidate action requires current candidate-data generation.
```

‏Clock invariant:

```text
negative local duration
=> clock/timestamp model failure
```

‏לא clamp שקט ל־0.

---

## ‏41. Replay / Shadow Tests

### ‏Golden Replay

‏נשמור חלונות של:

```text
high-volume open
quiet period
fast mover
halt/reopen
provider reconnect
data gap
batching burst
partial coverage
```

### ‏Shadow Normalizer / Provider Change

```text
Old Pipeline
vs
New Pipeline
```

‏נשווה:

```text
raw interpretation
canonical fields
quality flags
features
rank
candidate
TRADE / NO_TRADE
```

---

## ‏42. Promotion Criteria

‏Data change / Feed upgrade יקודם רק אם:

- ‏Semantic contract מתועד ובר־Replay.
- ‏Known gaps/conditions/units אינם מוסתרים.
- ‏As-known-at correctness נשמר.
- ‏Freshness/coverage אינם נחלשים מהותית.
- ‏P95/P99 data age אינם פוגעים ב־signal economics.
- ‏Decision Impact Rate משמעותי מספיק להצדיק complexity, או reliability משתפרת מהותית.
- ‏Net executable outcome אינו נחלש OOS.
- ‏Golden Replay ו־fault scenarios עוברים.
- ‏Operational burden סביר.

---

## ‏43. Rejection Criteria

‏נדחה שינוי אם:

- ‏הוא עובד רק על corrected/backfilled history.
- ‏הוא דורש future correction ליצירת Alpha.
- ‏הוא משפר internal metric אך לא משנה decisions/outcomes.
- ‏הוא מוריד freshness תחת עומס.
- ‏הוא מוסיף unknown semantics שלא נמדדים.
- ‏הוא מסתמך על optimistic ordering/complete feed שאינם קיימים Live.
- ‏Provider-specific effect נעלם מול source נוסף.
- ‏הוא דורש loss of provenance/conditions כדי “לפשט” schema.
- ‏הוא מגדיל complexity בלי incremental economic/reliability value.

---

## ‏44. User-Specific Application

‏לרובוט שלנו שסורק אלפי מניות ומחפש opportunity קצרה:

```text
Broad coverage
> exotic depth everywhere
```

‏אבל:

```text
Fresh trustworthy coverage
> broad stale coverage
```

‏ולכן סדר העדיפויות:

```text
1. Correct timestamps / ages
2. Source / condition / provenance
3. Sequence / gaps / reconnect generations
4. Whole-market fresh coverage
5. Candidate quote freshness
6. Pre-submit revalidation
7. Activity / trade semantics
8. Top-N deeper book/flow
9. Provider/feed challengers
```

‏`Last-only` יכול להישאר Baseline מחקרי מוקדם, אך אינו Execution truth.

---

## ‏45. Concrete Baseline Contract

```text
MarketDataEvidence
{
  instrument_id,
  provider_id,
  feed_type,
  data_generation,
  event_family,
  event_time,
  provider_time,
  receive_time,
  process_time,
  sequence,
  sequence_scope,
  venue_or_scope,
  conditions,
  value,
  unit,
  quality,
  provenance,
  schema_version,
  parser_version,
  normalizer_version
}
```

```text
CandidateDataReadiness
{
  market_wide_coverage_ok,
  symbol_coverage_ok,
  trade_fresh,
  bid_fresh,
  ask_fresh,
  book_ready_if_required,
  status_known,
  sequence_continuity_ok,
  generation_current,
  features_ready,
  clock_health_ok,
  reason_codes
}
```

```text
CanUseForNewRisk =
    market_wide_coverage_ok
 && candidate_required_fields_fresh
 && status_tradable
 && sequence_continuity_ok
 && generation_current
 && required_features_ready
 && critical_quality_state == GOOD
```

---

## ‏46. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Different timestamp domains measure different stages.
- ‏Out-of-order/duplicate/gap events can occur in networked feeds.
- ‏Provider/Feed semantics can differ by product, entitlement and venue scope.
- ‏Historical corrected data can differ from what was known live at decision time.
- ‏L1, MBP ו־MBO expose different evidence.

### ‏Judgment

- ‏Freshness, provenance, conditions ו־generation צריכים להיות first-class in our canonical state.
- ‏Broad L1-quality evidence + Top-N deep enrichment הוא ה־KISS baseline שלנו.
- ‏Unknown critical semantics צריכים fail-closed ל־new risk.
- ‏Provider/Feed changes צריכים להיחשב Research Events.

### ‏Hypothesis

- ‏Broad `Last + Bid + Ask + freshness + activity` יספיק ל־Fast Path עם יחס value/complexity טוב.
- ‏L2/flow detail יוסיף incremental value בעיקר ל־Top-N ולא לכל Universe.
- ‏Data-quality conditioning ישפר Net Edge על ידי דחיית low-confidence candidates.
- ‏Cross-provider divergence יחשוף חלק מה־provider-specific artifacts.

‏כל Hypothesis דורשת validation.

---

## ‏47. Confidence

### ‏High Confidence

```text
separate timestamp domains
preserve unknown/missing semantics
sequence/gap detection
raw/canonical lineage
fresh coverage gates
candidate freshness gate
pre-submit revalidation
provider generation boundaries
```

### ‏Medium Confidence

```text
broad L1 fast path + Top-N deep path
quality-conditioned candidate gating
cross-provider shadow comparison value
```

### ‏Low / Evidence Required

```text
exact freshness thresholds
exact coverage threshold
best provider
best direct/consolidated mix
benefit of L2/MBO for our final strategy
provider-specific condition filters
```

---

## ‏48. Time-Sensitive Facts

‏מקטע 59 אינו מקבע כרגע vendor-specific condition tables, odd-lot eligibility rules, real-time entitlement rules, session support, tick-size rules או feed product semantics.

‏לפני implementation תפעולי של פרטים כאלה נדרש אימות עדכני מול documentation רשמית של Provider/Venue/Broker.

‏במיוחד יש לאמת מחדש:

```text
trade condition codes
timestamp semantics
sequence scope
odd-lot inclusion
quote/size units
feed coverage
entitlements
market-status codes
order-price increment rules
calendar/session rules
```

‏לכן לא נדרש Web verification חדש כדי לקבוע את ה־methodological baseline של 59.

---

## ‏49. Relationship to Earlier Sheets

- ‏`05` — מגדיר איזה Market Data נדרש ברמת יסודות.
- ‏`06` — Source of Truth ל־time/sampling/latency framing.
- ‏`20` — Source of Truth ל־timeline integrity.
- ‏`27` — Source of Truth ל־deterministic replay.
- ‏`31` — Source of Truth ל־Provider selection / POC / current vendor facts.
- ‏`32` — שומר separation בין Market Data ל־Execution.
- ‏`35` — Observability/diagnostics.
- ‏`43` — Market status / halt / fast-market safety.
- ‏`44–45` — Flow/Book features שדורשים semantic data quality.
- ‏`48` — Latency pressure.
- ‏`49` — Research manifests / provider change as Research Event.
- ‏`50` — Scanner freshness/fairness.
- ‏`52` — Source of Truth ל־Data Engineering pipeline/lineage/storage.
- ‏`53` — Tests/invariants.
- ‏`54` — Backpressure/performance.
- ‏`58` — Execution revalidation מול Quote/Depth truth.

‏מקטע 59 אינו מחליף אף אחד מהם; הוא מחבר אותם דרך semantic correctness של observation.

---

## ‏50. Relationship to Segment 60

‏59 שואל:

```text
Can we trust the observations being ranked?
```

‏60 ישאל:

```text
Given trustworthy observations,
can we trust Rank #1 as the best actionable candidate now?
```

‏כלומר:

```text
Data Semantics / Freshness / Fairness
→ Ranking Semantics / Winner Stability / Executability
```

---

## ‏51. Recommendation Summary

### ‏`P0`

```text
As-Known-At correctness
Timestamp-domain separation
Sequence/gap state
No Missing→Zero coercion
Trade-condition preservation
Quote consistency / torn-state protection
Canonical units
Stable instrument identity
DataGeneration boundaries
FreshCoverage gate
Candidate freshness gate
Pre-submit data revalidation
Active-position data priority
Raw/canonical/derived lineage
```

### ‏`P1`

```text
Broad Last + Bid + Ask + freshness + activity baseline
Event-driven state + cadenced ranking
Golden raw fixtures
Quality-aware replay/backtest
Feature-readiness vector
Provider/schema drift monitoring
```

### ‏`P2`

```text
Top-N deeper book/flow
cross-provider shadow comparison
transport replay
liquidity persistence metrics
```

### ‏`P3/P4`

```text
MBO research
active multi-provider arbitration
full-depth broad-universe ingestion
specialized direct-feed reconstruction
```

‏משפט המחויבות של מקטע 59:

> ‏**אנחנו לא נשתמש ב־Market Data משום שהערך “נראה נכון”. נשתמש בו רק כאשר אנחנו יודעים מה הוא מייצג, מאיפה הגיע, מתי היה נכון, מתי נודע לנו, מה חסר בדרך, ומה רמת האמון המותרת בו בזמן ההחלטה.**
