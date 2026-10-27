# ‏Cross-Cutting 03 — Recommended Market Data Stack

> ‏מטרת המסמך: לסנתז את כל Recommendation Sheets של Market Data, Data Engineering, Provider boundaries, Replay ו־Scanner Health ל־Market Data Stack אחד פשוט, provider-agnostic, point-in-time correct ו־replayable עבור מערכת `Short-Horizon Momentum` מחקרית.
>
> ‏המסמך מוגבל ל־`Research / Replay / Shadow / Paper` ולתכנון Architecture/Governance. הוא אינו הוראה לבצע מסחר בכסף אמיתי, אינו בחירת ספק מסחר סופית ואינו מניח ש־Feed מסוים מתאים בלי POC ואימות עדכני.

---

## ‏1. Decision

‏ה־Market Data Stack המומלץ אינו:

```text
Provider SDK
→ Strategy
```

‏ואינו:

```text
Connected = true
→ Data is trustworthy
```

‏אלא:

```text
External Feed
→ Raw Capture
→ Parser + Provenance
→ Canonical Normalization
→ Ordering / Gap / Duplicate Validation
→ Canonical Event Log
→ Current Market State
→ Incremental Features
→ Market-Wide Data Gate
→ Ranking
→ Candidate Data Gate
→ Replay / Research / RCA
```

‏העיקרון המנחה:

```text
Market data is evidence with semantics,
not just numbers.
```

‏כל value משמעותי צריך לענות לפחות על:

```text
what?
from where?
when at source?
when received?
which generation?
which quality state?
which coverage scope?
was continuity proven?
was it usable as-known-at the decision time?
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`MarketDataProvider != Strategy Domain Model`

‏ה־Strategy אינה צורכת Provider DTOs ישירות.

```text
Provider SDK / wire message
→ Adapter
→ CanonicalMarketEvent
→ CanonicalMarketState
→ Features / Scanner / Replay
```

‏Provider-specific fields נשמרים ב־provenance/extensions לפי הצורך, אך אינם דולפים ל־Strategy rules בלי contract מפורש.

### ‏`P0 — Required`: ‏`MarketDataProvider != ExecutionBroker`

‏Market observation ו־execution truth הם domains שונים.

```text
Market Data Plane
→ observation truth

Execution Plane
→ order/fill/position truth
```

‏אותו Vendor יכול טכנית לספק את שניהם, אבל architecture אינה מניחה תלות זו.

### ‏`P0 — Required`: Required Data Contract לפני Vendor Selection

‏לפני שבוחרים Provider נגדיר מה ה־Research/Replay stack באמת דורש.

‏Baseline:

```text
Asset scope:
US listed equities research baseline

Universe:
Broad cross-sectional, point-in-time

Market observations:
Trades
Top-of-book / NBBO-like quotes when available under selected feed
Bid/Ask sizes
Trading/session status where available
Reference/instrument data

Timing:
Source/provider timestamps where available
Receive wall time
Receive monotonic time for local duration measurement
Process time where material

Semantics:
Trade/quote conditions
Provider/feed provenance
Coverage scope
Quality state
Generation
```

‏Full depth אינו Baseline requirement.

### ‏`P1 — Preferred`: Consolidated/Broad Top-of-Book לפני Single-Venue Feed

‏ל־whole-universe cross-sectional research נעדיף feed רחב/consolidated ככל האפשר לפני שמסיקים מסקנות על ranking.

‏Venue יחיד יכול ליצור הטיה ב־:

```text
Last
Volume
Activity
Bid/Ask
Spread
Candidate ordering
```

‏Single-venue feed יכול להיות prototype או specialist challenger, אך לא ברירת מחדל להוכחת whole-market ranking.

### ‏`P0 — Required`: שלוש שכבות Truth נפרדות

```text
Raw Provider Event
Canonical Event
Derived State / Feature
```

‏המשמעות:

```text
Raw       = what provider delivered
Canonical = our versioned interpretation
Derived   = state/features built from canonical evidence
```

‏Parser/Normalizer fix יוצר build/version חדש; הוא אינו משכתב silently את ה־raw evidence הישן.

### ‏`P0 — Required`: Raw Capture לפני destructive interpretation

‏Raw capture ישמור ככל שה־Provider מאפשר:

```text
Provider
FeedProfile
ConnectionId
Generation
SubscriptionId when relevant
MessageFamily
ProviderTimestamp
ReceiveTimestamp
Sequence
RawFields / payload subset needed for audit
ParserVersion
CaptureVersion
```

‏Credentials או secrets אינם חלק מ־market-data evidence.

### ‏`P0 — Required`: Canonical schema קטן ו־versioned

‏Baseline event families:

```text
TradeEvent
QuoteEvent
TradingStatusEvent
SymbolReferenceEvent
HeartbeatEvent
```

‏`BookEvent` או richer microstructure events ייכנסו רק כאשר hypothesis מצדיק אותם.

‏Canonical core צריך להיות provider-agnostic ככל האפשר, אבל לא למחוק metadata חשוב.

### ‏`P0 — Required`: Canonical Instrument Identity

‏`ticker` לבדו אינו identity מספק.

‏נחזיק:

```text
CanonicalInstrumentId
Symbol
PrimaryExchange
AssetType
Currency
ValidFrom
ValidTo
ProviderInstrumentIds
Status
```

‏Mappings הם Point-in-Time ו־versioned.

‏Ambiguous mapping נשאר `UNKNOWN`, לא ניחוש.

### ‏`P0 — Required`: Evidence Envelope לכל Observation

‏לכל Event משמעותי נשמור לפי availability:

```text
EventTime
ProviderTime
ReceiveWallTime
ReceiveMonotonicTime
ProcessTime
Sequence
SequenceScope
ProviderId
FeedType
VenueOrScope
ConditionCodes
QualityState
Generation
SchemaVersion
ParserVersion
NormalizerVersion
```

‏לכל Derived State/Feature:

```text
AsOf
SourceEventAge
FeatureAge
Quality
Provenance
InputGeneration
FeatureVersion
```

### ‏`P0 — Required`: Clock domains אינם interchangeable

‏נבדיל בין:

```text
EventTime
ProviderTime
ReceiveTime
ProcessTime
FeatureReadyTime
DecisionTime
ReplayVirtualTime
```

‏Wall clock מתאים ל־audit/correlation; monotonic clock מתאים למדידת durations מקומיים כאשר רלוונטי.

‏אין להסיק latency עדינה על ידי חיסור שעונים שלא הוכח שהם comparable.

### ‏`P0 — Required`: ‏`As-Known-At` הוא contract

‏Decision/Replay בזמן `T` רשאי להשתמש רק במידע שהיה זמין עד `T`.

```text
usable_event.receive_time <= T
```

‏אירוע שמבחינת source קרה לפני `T` אך התקבל אחרי `T` אינו חלק מהידע שהיה למערכת באותו רגע.

‏Late correction אינה משכתבת את `AsObservedAtRuntime`.

### ‏`P0 — Required`: Missing / Unknown / Stale / Invalid נפרדים

‏אין:

```text
UNKNOWN → 0
MISSING → 0
STALE → silently last-known-good
INVALID → usable
```

‏Baseline quality states:

```text
READY
STALE
GAPPED
INCOMPLETE
TORN_STATE
INVALID
NOT_READY
UNKNOWN
```

‏ה־state וה־ReasonCode זורמים עד Decision evidence.

### ‏`P0 — Required`: Sequence / Gap contract לפי Provider scope

‏כאשר Sequence קיים נשמור scope מפורש:

```text
GLOBAL
PER_CONNECTION
PER_CHANNEL
PER_SYMBOL
PER_VENUE
PER_MESSAGE_FAMILY
UNKNOWN
```

‏Gap בלתי מוסבר יוצר affected-state degradation ולא continuation assumption.

```text
DATA_GAP
→ mark affected state incomplete
→ resync/rebuild path
→ dependent new-risk simulation/paper decision blocked until trusted
```

### ‏`P0 — Required`: Duplicate handling על identity אמין

‏אין dedup אוניברסלי לפי:

```text
symbol + timestamp + price + size
```

‏שני events אמיתיים יכולים להיראות זהים.

‏נעדיף provider event id / trade id / sequence כאשר זמינים; אחרת policy תהיה versioned ו־conservative.

### ‏`P0 — Required`: Out-of-Order policy מפורשת

‏לכל event family נגדיר policy כגון:

```text
ACCEPT
MARK_LATE
REORDER_WITHIN_BOUND
EXCLUDE_FROM_CURRENT_STATE
DROP_CONFIRMED_DUPLICATE
INVALIDATE_STATE
REQUEST_RESYNC
REBUILD
```

‏`last arrival wins` אינו baseline בטוח.

### ‏`P0 — Required`: Torn Snapshot protection

‏Bid ו־Ask אינם בהכרח snapshot אטומי.

‏Mid/Spread/Microprice מחושבים רק כאשר state coherent מספיק לפי contract.

‏אם sides מגיעים מגenerations/ages לא compatible:

```text
TORN_STATE / DEGRADED
```

‏ולא “מתקנים” silently.

### ‏`P0 — Required`: Trade/Quote Conditions נשמרים

‏לא כל trade או quote שקולים.

‏Condition codes נשמרים raw + normalized כאשר אפשר.

‏Condition לא מוכר:

```text
UNKNOWN_CONDITION
```

‏ולא `REGULAR` כברירת מחדל.

### ‏`P0 — Required`: ‏`Last` הוא semantic field, לא label כללי

‏נגדיר מהו ה־Last שבו משתמש כל Feature:

```text
last_received_trade
last_eligible_trade
last_regular_session_trade
last_consolidated_trade
last_venue_trade
```

‏ונשמור age/source/session/conditions.

### ‏`P1 — Preferred`: Event-Driven Ingestion + Cadenced Ranking

‏Baseline:

```text
continuous market events
→ incremental per-symbol state
→ incremental features
→ logical decision cadence / as-of cut
→ cross-sectional ranking
```

‏כך לא מריצים full-universe recomputation על כל Tick, אבל גם לא מאבדים event chronology.

### ‏`P1 — Preferred`: Tiered observation by decision relevance

```text
WIDE SCAN
Broad top-of-book + activity + freshness

CANDIDATE
Richer/fresher validation of shortlisted symbols

PAPER POSITION / EPISODE
Highest-priority monitoring for exit/risk/research evidence
```

‏העיקרון:

```text
Enough data where it changes the decision.
```

‏לא `maximum depth everywhere`.

### ‏`P0 — Required`: Market-Wide Rank Trust Gate

‏Rank אינו trusted רק כי Candidate #1 טרי.

‏בכל Decision Epoch נשמור לפחות:

```text
ExpectedUniverseCount
CoveredSymbolCount
FreshSymbolCount
FreshTradeCount
FreshQuoteCount
FreshCoverageRatio
MedianDataAge
P95DataAge
P99DataAge
ProcessingLag
ProviderState
RankTrustState
```

‏אם ה־cross-section אינו comparable מספיק:

```text
RankTrustState = NOT_READY / UNKNOWN
```

‏והמערכת המחקרית לא תציג Winner כאילו נבחר מתוך universe שלם.

### ‏`P0 — Required`: Candidate Data Gate נפרד

‏גם כאשר Market-Wide gate עבר, Candidate נדרש לעבור:

```text
trade state valid
quote state valid
required fields present
age acceptable for experiment contract
conditions understood enough
instrument mapping valid
same generation / coherent state where required
```

‏Market-wide quality ו־candidate quality הם שני gates שונים.

### ‏`P0 — Required`: ‏`Connected != Fresh`

‏Health אינו boolean connection flag.

‏נבדיל בין:

```text
transport connected
data flowing
expected families flowing
coverage sufficient
freshness sufficient
continuity proven
state usable
```

‏Heartbeat צריך להיות מסוגל להבדיל `no market change` מ־`silent/broken feed`.

### ‏`P0 — Required`: Reconnect creates a new trust question

‏Reconnect אינו מוכיח continuity.

‏Baseline:

```text
disconnect detected
→ new generation
→ re-subscribe / resync
→ rebuild or validate state
→ warmup
→ rank trust restored only after gates pass
```

‏Events מגeneration ישן אינם חוזרים בשקט ל־current state.

### ‏`P1 — Preferred`: Raw + Canonical persistence for Replay

‏נשמור מספיק evidence כדי לשחזר decisions ולבצע RCA.

‏Baseline:

```text
Raw/Replayable event history where practical
Canonical event history
Dataset/partition manifests
Checksums
Schema/parser/normalizer versions
Session/calendar metadata
Coverage profile
```

‏לא חייבים לשמור full depth של כל השוק אם אינו חלק מה־hypothesis.

### ‏`P0 — Required`: Historical/Live semantics מפורשים

‏Historical data יכול להיות corrected/aggregated/adjusted אחרת מה־live stream.

‏לכן Dataset Manifest כולל:

```text
SourceProfile
HistoricalVsCapturedLive
CorrectionVersion
NormalizationVersion
CorporateActionVersion
CalendarVersion
CoverageProfile
KnownDifferences
```

‏Replay claiming production-like semantics צריך לדעת אילו gaps בין Historical לבין Live עדיין קיימים.

### ‏`P1 — Preferred`: Backpressure עם bounded queues

‏אין unbounded ingestion queue.

‏נמדוד:

```text
queue_depth
queue_age
processing_lag
dropped/coalesced events
consumer throughput
burst duration
```

‏Policy מפורשת קובעת מה מותר coalesce, מה חייב preserve, ומה הופך state ל־DEGRADED.

### ‏`P1 — Preferred`: One primary provider first

‏ב־MVP/Research baseline נעדיף Provider ראשי אחד + adapter boundary חזק.

‏Multi-provider merge/failover אינו baseline בגלל:

- ‏clock disagreement.
- ‏condition differences.
- ‏symbol mapping conflicts.
- ‏duplicate identity complexity.
- ‏cross-feed latency skew.
- ‏silent semantic drift.

‏Provider שני מצטרף כאשר Evidence מצדיק redundancy/comparison need.

### ‏`P1 — Preferred`: Provider Capability Snapshot

‏לכל experiment/deployment-like research environment נשמור:

```text
Provider
Plan/Profile
FeedType
Coverage
Entitlements
DocumentedLimits
SupportedEventFamilies
TimestampCapabilities
SequenceCapabilities
HistoricalAvailability
VerifiedAt
```

‏Facts כאלה תלויות זמן.

### ‏`P0 — Required`: No Silent Provider Fallback

‏אם source משתנה:

```text
ProviderGeneration / SourceProfile changes
```

‏וזה נרשם כ־research/environment event.

‏אין fallback שמחליף feed וממשיך כאילו אותו experiment נשאר comparable.

---

## ‏3. Recommended Architecture Blueprint

```text
[External Provider]
        │
        ▼
[Provider Adapter]
        │
        ├── Raw Capture
        │
        ▼
[Parser + Provenance]
        │
        ▼
[Canonical Event Normalizer]
        │
        ▼
[Ordering / Gap / Duplicate / Generation Validation]
        │
        ├── Canonical Event Log ──► Replay / Research / RCA
        │
        ▼
[Per-Symbol Canonical State]
        │
        ├── Data Quality / Freshness / Coverage
        │
        ▼
[Incremental Feature State]
        │
        ▼
[Market-Wide Rank Trust Gate]
        │
        ▼
[Scanner / Top-K]
        │
        ▼
[Candidate Data Gate]
        │
        ▼
[Shadow / Paper Decision Evidence]
```

‏ה־Domain Core אינו יודע איזה SDK יצר את האירוע.

---

## ‏4. Use When

‏ה־stack מתאים כאשר:

- ‏המחקר משווה אלפי Symbols באותו Decision Epoch.
- ‏צריך להבדיל market opportunity מ־data-health failure.
- ‏צריך deterministic replay ו־RCA.
- ‏צריך להחליף/להשוות Providers בלי לשכתב Strategy.
- ‏Signal horizon קצר מספיק כדי freshness/latency/coverage להשפיע על ranking.
- ‏נדרש audit של מה באמת היה ידוע בזמן החלטה.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־stack הזה כתירוץ ל־:

- ‏לשמור את כל Level 3 data “ליתר ביטחון”.
- ‏לקנות feed עשיר יותר לפני שנמדד bottleneck.
- ‏למזג כמה Providers בלי semantic model.
- ‏להמיר missing ל־0.
- ‏להציג Last-only research כ־execution evidence.
- ‏להניח historical API זהה ל־captured live.
- ‏לסמוך על connection flag במקום coverage/freshness.
- ‏לעשות failover שקט באמצע experiment.

---

## ‏6. Alternatives

### ‏A — `Last-only Prototype`

‏מתאים למחקר מוקדם של price-path בלבד.

‏יתרון: פשוט וזול.

‏חיסרון: אינו מספיק ל־spread/executability/cross-sectional quote quality.

### ‏B — `Broad L1 / Top-of-Book Stack` — Recommended Baseline

‏Trades + Quotes + sizes + timestamps + provenance + quality + replay capture.

‏זהו baseline מומלץ.

### ‏C — `Depth / L2 Stack`

‏מוצדק כאשר Feature/Execution hypothesis באמת תלויה ב־depth/queue/order-flow.

‏מחיר: throughput, storage, ordering, replay ו־semantic complexity גבוהים יותר.

### ‏D — `Multi-Provider Active Merge`

‏יכול להועיל ל־redundancy או data-quality research.

‏אינו baseline בגלל complexity של reconciliation ו־cross-feed semantics.

---

## ‏7. Trade-offs

| בחירה | יתרון | מחיר |
|---|---|---|
| Broad L1 | cross-sectional coverage טובה | פחות microstructure depth |
| Raw capture | replay/RCA/provider comparison | storage/IO |
| Canonical schema | provider independence | normalization complexity |
| One provider first | KISS ו־attribution | פחות redundancy |
| Event-driven ingest | chronology/freshness | burst handling נדרש |
| Cadenced rank | compute יציב יותר | decision cadence hypothesis |
| Strong quality states | פחות false certainty | יותר `UNKNOWN/NOT_READY` |
| Point-in-time mapping | correctness | reference-data maintenance |
| Generation/resync model | recovery correctness | יותר state machinery |

---

## ‏8. What I Would Avoid Initially

‏לא הייתי מכניס כברירת מחדל:

- ‏Full-depth לכל ה־Universe.
- ‏Order-by-order/L3 feed ללא hypothesis.
- ‏Multi-provider active merge.
- ‏Automatic provider failover תוך שמירת אותו RunId.
- ‏Distributed event bus רק לשם architecture.
- ‏Complex stream-processing platform לפני profiling.
- ‏Provider-specific objects בתוך Feature Engine.
- ‏Silent backfill לתוך captured-live dataset.
- ‏Aggressive dedup ללא reliable event identity.
- ‏Auto-repair של crossed/torn state בלי provenance.

---

## ‏9. What to Add Later

‏רק לפי Evidence:

- ‏Depth/L2 כאשר incremental decision value מוכח.
- ‏Secondary provider לצורך comparison/failover research.
- ‏Cross-provider divergence monitoring.
- ‏Richer status/corporate-action/reference feeds.
- ‏Longer raw retention.
- ‏Specialized columnar/object storage כאשר local store הוא bottleneck מוכח.
- ‏Partitioned ingestion workers כאשר single-process throughput אינו עומד ב־budget.
- ‏Hardware/network tuning אחרי correctness ו־queue profiling.

---

## ‏10. Required Data / Evidence

### ‏Provider / Capture

```text
Provider
FeedProfile
Generation
ConnectionId
CoverageScope
EventFamilies
Entitlements/ProfileVersion
VerifiedAt
```

### ‏Event Envelope

```text
CanonicalInstrumentId
EventType
EventTime
ProviderTime
ReceiveWallTime
ReceiveMonotonicTime
Sequence + Scope
Conditions
Quality
Generation
ParserVersion
NormalizerVersion
```

### ‏Data Health

```text
ExpectedUniverseCount
CoveredSymbolCount
FreshTradeCount
FreshQuoteCount
FreshCoverageRatio
DataAgeDistribution
GapCount
DuplicateCount
LateEventCount
ReconnectCount
GenerationChanges
QueueDepth
QueueAge
ProcessingLag
```

### ‏Replay / Dataset

```text
DatasetId
SourceProfile
SchemaVersion
NormalizationVersion
CorrectionVersion
CalendarVersion
CoverageProfile
Checksums
KnownDifferencesFromLive
```

---

## ‏11. Promotion Criteria

‏Market Data Stack יכול להתקדם מ־POC ל־research baseline יציב כאשר:

1. ‏Broad target universe coverage נמדדת ולא מוערכת.
2. ‏Trade/quote freshness distributions זמינות ב־p50/p95/p99.
3. ‏Provider provenance מלא ברמת event/state.
4. ‏Raw/Canonical/Derived boundaries מפורשים.
5. ‏Canonical instrument mapping Point-in-Time עובד ללא ambiguity שקטה.
6. ‏Gap/reconnect/generation behavior נבדק.
7. ‏Duplicate/out-of-order policies deterministic ו־versioned.
8. ‏Missing/Unknown/Stale אינם הופכים לערך רגיל.
9. ‏Market-wide Rank Trust Gate מבחין בין healthy data ל־partial cross-section.
10. ‏Candidate Gate משתמש באותה quality semantics.
11. ‏Historical/Live differences מתועדים.
12. ‏Replay יכול לבנות מחדש state/decisions ברמת parity שהוגדרה.
13. ‏Peak/burst workload אינו מייצר unbounded queue או silent loss.
14. ‏Provider-specific SDK אינו דולף ל־Strategy Core.
15. ‏Failure tests כוללים disconnect, gap, stale, duplicate, out-of-order ו־reconnect.

‏Promotion כאן פירושו `Research Stack Baseline`, לא אישור `Live`.

---

## ‏12. Rejection Criteria

‏אין לקדם Provider/Stack אם:

- ‏Coverage בפועל אינה מספקת ל־cross-sectional hypothesis.
- ‏Freshness tails אינם ניתנים למדידה.
- ‏Sequence/gap semantics אינן מובנות מספיק.
- ‏Reconnect משאיר state אמביוולנטי.
- ‏Historical data אינו מאפשר execution-aware replay והפער אינו מסומן.
- ‏Conditions קריטיים נזרקים.
- ‏Instrument mapping נשען רק על ticker string.
- ‏Provider SDK מחלחל ל־Strategy logic.
- ‏Queue overload מייצר silent drops.
- ‏Rank ממשיך לפעול על partial/stale universe בלי ReasonCode.
- ‏Source fallback משנה semantics בלי version boundary.
- ‏Raw/canonical evidence אינו מספיק ל־RCA.

---

## ‏13. Metrics

### ‏Coverage / Freshness

- ‏`FreshCoverageRatio`.
- ‏Trade coverage.
- ‏Quote coverage.
- ‏Event age `p50/p95/p99`.
- ‏Source-to-receive delay distribution כאשר clocks מאפשרים השוואה אמינה.
- ‏Feature/data age at Decision.

### ‏Integrity

- ‏Gap rate.
- ‏Duplicate rate.
- ‏Late/out-of-order rate.
- ‏Unknown-condition rate.
- ‏Torn-state rate.
- ‏Invalid/Unknown/Stale rates.
- ‏Instrument-mapping failure rate.

### ‏Pipeline

- ‏Ingest throughput.
- ‏Queue depth/age.
- ‏Processing lag.
- ‏Backpressure/coalescing counts.
- ‏Reconnect and generation count.
- ‏Warmup-to-ready duration.

### ‏Evidence

- ‏Replay parity.
- ‏Raw-to-canonical lineage completeness.
- ‏Dataset manifest completeness.
- ‏Provider/source identity completeness.
- ‏Historical/live semantic-difference coverage.

---

## ‏14. Failure Modes

1. ‏`Connected But Stale` — transport תקין, data אינו טרי.
2. ‏`Partial Universe Winner` — Rank #1 נבחר מתוך subset קטן בלי שהמערכת יודעת.
3. ‏`Last-Only Illusion` — Momentum נראה טוב ללא quote/executability context.
4. ‏`Silent Gap` — continuity נשברה אך state ממשיך כאילו מלאה.
5. ‏`Reconnect Resurrection` — events מה־generation הישן מזהמים state חדש.
6. ‏`Timestamp Collapse` — clocks שונים נזרקים לשדה זמן אחד.
7. ‏`Historical Rewrite` — corrected data מחליף את מה שהיה ידוע בזמן אמת.
8. ‏`Provider Leakage` — Feature תלוי ב־SDK field/quirk בלי contract.
9. ‏`Over-Dedup` — events אמיתיים נמחקים כי נראו זהים.
10. ‏`Under-Dedup` — replay או reconnect מכפילים events.
11. ‏`Torn Quote` — Bid/Ask לא coherent אך Spread מחושב כאילו כן.
12. ‏`Silent Fallback` — Provider אחר נכנס באמצע experiment ללא version boundary.
13. ‏`Raw Lost` — normalizer bug אינו ניתן ל־RCA כי source evidence לא נשמר.
14. ‏`Firehose Without Backpressure` — consumer lag גדל ללא bounded behavior.
15. ‏`Depth Before Need` — complexity/storage גדלים לפני הוכחת incremental value.

---

## ‏15. User-Specific Application

‏עבור מערכת מחקרית שמטרתה להשוות שוק רחב בטווחים קצרים, סדר העבודה המומלץ הוא:

```text
1. Define broad point-in-time universe.
2. Connect one broad L1 provider through adapter.
3. Capture trades + quotes + basic sizes + timestamps + provenance.
4. Normalize into canonical events.
5. Maintain per-symbol quality/freshness/generation state.
6. Compute small incremental features.
7. At each Decision Epoch, evaluate market-wide rank trust.
8. Rank only comparable/eligible symbols.
9. Recheck candidate-specific data quality.
10. Persist decision snapshot + source evidence.
11. Replay the same canonical event path in research.
12. Add depth/provider complexity only after measured need.
```

‏ה־KISS כאן אינו `less correctness`; הוא `one provider, simple canonical schema, bounded scope, full evidence semantics`.

---

## ‏16. Confidence

### ‏High

- ‏Raw/Canonical/Derived separation.
- ‏Point-in-Time / As-Known-At semantics.
- ‏Explicit provenance, clocks, quality ו־generation.
- ‏Market-wide coverage gate לפני cross-sectional rank trust.
- ‏Provider abstraction לפני Strategy.
- ‏Gap/reconnect/replay correctness כחלק מה־baseline.

### ‏Medium

- ‏Broad consolidated L1 כ־default לפני depth.
- ‏One provider first.
- ‏Local/simple persistence לפני distributed stack.
- ‏Tiered observation model.

### ‏Requires Measurement

- ‏Provider סופי.
- ‏Freshness budgets מספריים.
- ‏Decision cadence.
- ‏Raw retention duration.
- ‏Depth/L2 value.
- ‏Provider redundancy need.
- ‏Storage/partitioning scale thresholds.

---

## ‏17. Time-Sensitive Facts

‏Provider plans, prices, entitlements, API limits, feed coverage, WebSocket behavior, historical availability ו־licensing משתנים בזמן.

‏לכן לפני POC/שימוש ב־Provider מסוים יש לאמת מחדש מול מקור רשמי ולשמור:

```text
ProviderCapabilitySnapshot
VerifiedAt
AppliesTo
Plan/Profile
KnownLimits
KnownCoverage
KnownSemantics
```

‏ה־Architecture עצמה אינה תלויה ב־Vendor אחד.

---

## ‏18. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Trade ו־Quote מייצגים דברים שונים.
- ‏Receive time יכול להיות מאוחר מ־event time.
- ‏Connection פתוח אינו מוכיח freshness או full coverage.
- ‏Historical/corrected data יכול להיות שונה ממה שהיה ידוע בזמן אמת.
- ‏בלי provenance/version מספיקים, replay/RCA אמין אינם אפשריים.

### ‏Judgment

- ‏להתחיל עם broad L1/top-of-book stack ולא full depth.
- ‏להתחיל עם Provider ראשי אחד ו־adapter boundary חזק.
- ‏להשתמש ב־event-driven ingestion וב־cadenced ranking.
- ‏לשמור raw-enough evidence ו־canonical event log.
- ‏לחסום trust ב־Rank כאשר cross-section אינו healthy.

### ‏Hypothesis

- ‏Broad L1 יהיה מספיק ל־baseline של short-horizon cross-sectional ranking לפני depth.
- ‏Depth/L2 עשוי להוסיף incremental decision value רק בחלק מה־hypotheses.
- ‏Provider שני עשוי להצדיק את Complexity Tax רק לאחר שמדידת reliability/coverage מראה צורך.

---

## ‏19. Recommended Market Data Baseline

```text
Provider:
One broad L1 provider selected by measured POC

Boundary:
Provider Adapter → Canonical Market Events

Capture:
Raw-enough + canonical replayable history

State:
Per-symbol canonical trade/quote/status state
+ quality/freshness/generation

Timing:
Event/provider/receive/process domains kept distinct

Integrity:
Sequence/gap/duplicate/out-of-order policies
+ reconnect generation model

Ranking:
Continuous state maintenance
+ cadenced whole-market decision epochs

Trust:
Market-Wide Rank Trust Gate
+ Candidate Data Gate

Storage:
Durable local/simple store first
+ dataset manifests/checksums

Replay:
Same canonical event semantics as decision core

Growth:
Depth, second provider, distributed pipeline only after evidence
```

---

## ‏20. Bottom Line

‏Market Data Stack טוב אינו זה שמעביר הכי הרבה messages.

‏הוא זה שמאפשר לכל החלטה לענות:

```text
What did we know?
When did we know it?
How complete was the market view?
How trustworthy was that state?
Can we reconstruct it later?
```

‏לכן ה־baseline המומלץ הוא:

```text
Broad enough
+ semantically explicit
+ point-in-time correct
+ quality-aware
+ replayable
+ provider-independent
```

‏ורק לאחר measurement מוסיפים depth, providers נוספים או infrastructure מורכב יותר.