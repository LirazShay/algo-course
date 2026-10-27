# ‏50 — Recommendation Sheet: Scanner Best Practices

> ‏מקור לימודי עיקרי: `../50-SCANNER-BEST-PRACTICES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ותפעולי ל־`Market Scanner` של רובוט `Short-Horizon Momentum`, כך שיוכל לעבד אלפי Symbols בצורה incremental, fresh, deterministic ו־explainable, לצמצם עבודה יקרה ל־Top-N בלבד, להיכשל באופן שמרני תחת backlog או coverage חלקית, ולמסור ל־Decision/Execution evidence טרי ובר־שחזור במקום “Top 1” שנוצר ממידע ישן או חלקי.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו המלצה להפעלה בכסף אמיתי ואינו מאשר מעבר למסחר חי.

---

## ‏1. Decision

‏ה־Scanner לא יוגדר כ־loop שסורק רשימה של Symbols ומחשב מחדש הכול בכל Cycle.

‏הוא יוגדר כ־**Online Decision-State Engine** שמחזיק Market State קנוני ועדכני, מחשב incremental features, מבצע retrieval זול על כל ה־Universe, ומריץ Deep Evaluation רק על קבוצת מועמדים קטנה.

‏ה־Baseline:

```text
Market Events
→ Canonical Per-Symbol State
→ Incremental Fast Features
→ Data / Tradability Hard Gates
→ Cheap Full-Universe Rank
→ High-Recall Top-N Funnel
→ Deep Features / Execution Context
→ Final Re-Rank
→ Candidate Gate
→ TRADE / NO_TRADE Evidence
→ Execution Revalidation
```

‏העיקרון המחייב:

```text
Freshness + Coverage + Determinism + Candidate Recall
come before
more features + more compute + clever infrastructure.
```

‏ה־Scanner רשאי לומר:

```text
NO_TRADE_DATA_COVERAGE
NO_TRADE_BACKLOG
NO_TRADE_NO_ABSOLUTE_EDGE
NO_TRADE_DEEP_PATH_EXPIRED
```

‏גם אם מתמטית תמיד קיים Symbol במקום הראשון.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`ScannerReadiness` לפני Ranking Actionable

‏Process alive אינו Scanner ready.

‏לפני שה־Scanner רשאי לייצר Candidate actionable נדרש Readiness Contract מפורש:

```text
universe_ready
market_data_ready
fresh_coverage_ratio
max_required_input_age
backlog_age
required_feature_readiness
trading_status_ready
clock_healthy
config_consistent
scanner_mode
```

‏אם אחד מה־hard requirements אינו ידוע או אינו תקין:

```text
CanProduceEntryCandidate = false
```

‏Research/diagnostic ranking יכול להמשיך אם הוא מסומן ככזה, אבל לא להפוך ל־Entry intent.

### ‏`P0 — Required`: ‏Freshness per Symbol, לא Global Timestamp יחיד

‏לכל Symbol נשמור לפחות:

```text
last_trade_event_time
last_quote_event_time
last_received_time
last_processed_time
feature_as_of_time
feature_computed_at
```

‏וכאשר רלוונטי:

```text
book_as_of_time
activity_as_of_time
flow_as_of_time
trading_status_as_of_time
```

‏אין `symbol_updated_at` יחיד שמכסה את כל משמעויות הזמן.

### ‏`P0 — Required`: ‏Fresh Coverage הוא Gate, לא Dashboard בלבד

‏נחשב לפחות:

```text
FreshCoverageRatio
=
FreshEligibleSymbols / ExpectedEligibleUniverse
```

‏Rank #1 המבוסס על 35% מה־Universe הטרי אינו “Rank #1 של השוק”.

‏לכן:

```text
coverage insufficient
→ actionable rank not trusted
→ NO_TRADE_DATA_COVERAGE
```

‏ה־threshold עצמו ייקבע אמפירית לפי Provider, Universe, horizon ו־failure analysis; הוא אינו מספר אוניברסלי.

### ‏`P1 — Preferred Default`: ‏Hybrid Scanner

‏ה־Baseline הארכיטקטוני:

```text
Event-driven symbol/state updates
+
periodic or material-change ranking checkpoints
```

‏לא:

```text
full recomputation on every tick
```

‏ולא בהכרח:

```text
fixed snapshot scan that rereads everything every X ms
```

‏ה־Hybrid שומר freshness ברמת Symbol ומאפשר Global Rank בקצב נשלט.

### ‏`P1 — Preferred Default`: ‏Precompute on ingest / update incrementally

‏כאשר Event מגיע ל־Symbol:

```text
normalize event
→ update canonical state
→ update affected rolling windows
→ update affected cheap features
→ update readiness / eligibility inputs
```

‏ב־ranking checkpoint ה־Scanner צריך בעיקר לקרוא State שכבר מוכן.

‏לא לבצע לכל 4,000 Symbols בכל Cycle:

```text
DB query
history scan
JSON reparse
book rebuild
full-window recomputation
```

### ‏`P1 — Preferred Default`: ‏Fast Path לכל ה־Universe, Deep Path ל־Top-N בלבד

‏ה־Fast Path הראשוני יהיה קטן, זול וקל להסבר:

```text
tradability
freshness
short-horizon returns
activity / trade-rate
basic spread / liquidity
simple prediction score
```

‏ה־Deep Path יכול לכלול לפי זמינות ו־Evidence:

```text
order flow
book dynamics
adverse-selection context
capacity
execution feasibility
provider/broker context
```

‏ה־Deep Path אינו זכות אוטומטית לכל Symbol.

### ‏`P1 — Preferred Default`: ‏Fast Path = High Recall, Deep Path = Higher Precision

‏נמדוד Funnel Recall:

```text
CandidateRecall
=
GoodCandidatesThatReachedDeepPath
/
AllRetrospectivelyGoodEligibleCandidates
```

‏המטרה של Fast Path אינה להיות מושלם.

‏המטרה:

```text
cheap
+
high recall
+
point-in-time correct
```

‏Deep Path אחראי לשיפור precision ולהערכת executability.

### ‏`P0 — Required`: ‏`NO_TRADE` הוא Result מלא

‏Whole-market rank תמיד ייצור winner יחסי.

‏אבל:

```text
BestRelativeCandidate
!=
GoodAbsoluteOpportunity
```

‏לכן Final Candidate Gate חייב לשלב:

```text
relative rank
+
absolute minimum quality
+
execution feasibility
+
readiness
+
risk/safety
```

‏אם אין Candidate שעובר את כולם:

```text
NO_TRADE
```

### ‏`P0 — Required`: ‏Execution Revalidation אחרי Scanner

‏ה־Scanner אינו שולח Broker Order.

‏הוא מוסר immutable candidate evidence ל־Decision/Execution boundary.

‏לפני Submit נבדק שוב לפחות:

```text
candidate not expired
symbol still tradable
signal still valid
price drift acceptable
spread/liquidity still acceptable
risk still valid
safety still valid
broker readiness valid
```

‏Scanner winner ישן אינו Permission לבצע.

### ‏`P0 — Required`: ‏Deterministic Ranking

‏אותו:

```text
market state
+ evaluation time
+ universe version
+ feature versions
+ score version
+ config
```

‏חייב להפיק:

```text
same eligibility
same score components
same rank
same reason codes
same decision evidence
```

‏בהיעדר שינוי מכוון.

### ‏`P0 — Required`: ‏Tie Breakers מפורשים

‏אין להסתמך על ordering מקרי של Collection.

‏Tie-break policy צריך להיות versioned ודטרמיניסטי.

‏דוגמה אפשרית למחקר:

```text
1. higher prediction / executable criterion defined by version
2. fresher evidence
3. better validated liquidity context
4. stable instrument id
```

‏הסדר המדויק הוא חלק מ־Score/Ranking policy ולא Truth אוניברסלי.

### ‏`P0 — Required`: ‏Backpressure היא Trading-State Quality

‏נמדוד לפחות:

```text
incoming_event_rate
processing_rate
queue_depth
oldest_event_age
p95_event_age
fresh_coverage_ratio
```

‏אם backlog הופך Current State לישן:

```text
ScannerMode = DEGRADED
or
BLOCK_NEW_ENTRIES
```

‏אין לסחור על backlog רק מפני שה־process “ממשיך לעבוד”.

### ‏`P0 — Required`: ‏Load Shedding אינו רשאי למחוק Truth קריטי

‏תחת עומס אפשר לצמצם:

```text
noncritical diagnostics
research enrichments
Deep Path size
optional expensive features
stale ranking cycles
```

‏אבל לא לזרוק בשקט:

```text
trading status
risk/safety state
orders
fills
cancels
positions
reconciliation events
```

‏Existing risk מקבל קדימות על hypothetical opportunity.

### ‏`P1 — Preferred Default`: ‏Progressive Degradation

‏ה־Baseline:

```text
FULL
→ REDUCED_DEEP_PATH
→ FAST_ONLY_RESEARCH_OR_DIAGNOSTIC
→ BLOCK_NEW_ENTRIES
```

‏כל transition מקבל:

```text
mode
reason_code
started_at
capability_effect
```

‏אין Silent Semantic Degradation.

### ‏`P0 — Required`: ‏Feature availability מפורשת

‏Feature חסר אינו `0`.

‏לכל Feature יש status מה־Contract של מקטע 13:

```text
VALID
MISSING
STALE
INVALID
WARMING_UP
UNKNOWN
```

‏Scanner policy מגדירה במפורש לכל Required Feature:

```text
REJECT
REDUCE_CONFIDENCE
USE_VALIDATED_FALLBACK
NOT_APPLICABLE
```

‏לא ממלאים default סמוי שמטה Ranking.

### ‏`P1 — Preferred Default`: ‏Canonical Per-Symbol State

‏Baseline רעיוני:

```text
SymbolState
- identity / universe metadata
- market / trading status
- current trade / quote state
- rolling windows / anchors
- cheap derived features
- readiness
- eligibility
- quality flags
- score inputs
- versions
- diagnostics metadata
```

‏Modules שונים אינם בונים “מציאות” נפרדת לאותו Symbol.

### ‏`P1 — Preferred Default`: ‏One Logical Writer per Symbol State

‏המטרה:

```text
ordered per-symbol mutation
+
less race ambiguity
+
deterministic replay semantics
```

‏Partitioning אפשרי:

```text
partition = stable_hash(symbol_id) % partition_count
```

‏אבל ה־partition count וה־implementation הם Optimization, לא Strategy truth.

### ‏`P0 — Required`: ‏Explicit Event Ordering / Duplicate Policy

‏Market Data יכולה להיות:

```text
late
out_of_order
duplicate
gapped
replayed
```

‏לכל event type נדרשת policy כגון:

```text
ACCEPT
DROP_DUPLICATE
REORDER_WITHIN_BOUND
INVALIDATE_SYMBOL
REQUEST_RESYNC
MARK_GAPPED
```

‏Duplicate Trade אינו רשאי להכפיל Volume/Trade Count.

‏Late Event אינו רשאי להחזיר Current State אחורה בשקט.

### ‏`P0 — Required`: ‏Warm-Up הוא State אמיתי

‏לאחר Startup/Restart/Reconnect:

```text
NOT_READY
PARTIALLY_READY
READY
```

‏Symbol יכול להיות Ready ל־`10s` feature אך לא ל־`60s` feature.

‏Readiness חייבת להיות Feature-aware.

### ‏`P0 — Required`: ‏Reconnect prioritizes reconciliation over scanning

‏ב־Reconnect, ובמיוחד כאשר קיימת Exposure:

```text
broker reconciliation
→ position / order truth
→ market-data restoration
→ fresh coverage
→ feature warm-up
→ scanner readiness
→ entry scanning
```

‏Scanner warm-up לעולם אינו קודם ל־existing exposure truth.

---

## ‏3. Why

‏Scanner הוא שכבת Cross-Sectional Selection.

‏אם הוא איטי, חלקי או לא דטרמיניסטי, כל שכבה downstream מקבלת Candidate שאינו מייצג נכון את השוק בזמן ההחלטה.

‏ארבעה failure classes מרכזיים:

```text
1. Stale winner
2. Partial-universe winner
3. Compute-biased winner
4. Non-deterministic winner
```

‏לכן Scanner correctness אינו “performance concern” בלבד.

‏הוא חלק מ־Prediction Integrity ומ־Execution Feasibility.

---

## ‏4. Use When

‏ה־Baseline מתאים במיוחד למערכת שלנו כאשר:

```text
Universe ≈ thousands of US equities
Signals = milliseconds-to-seconds / seconds
Ranking = whole-market cross-sectional
Deep microstructure features = relatively expensive
Top candidate set = small
Execution = separate broker path
```

‏הוא מתאים גם למחקר Historical/Replay משום שאותם Contracts יכולים לפעול על Event Stream היסטורי.

---

## ‏5. Do Not Use When

‏אין להעתיק את הארכיטקטורה באופן מכני כאשר:

- ‏ה־Universe זעיר מאוד ואין משמעות ל־Funnel.
- ‏ה־Strategy פועלת על Bars איטיים שבהם Full Batch פשוט הוא Baseline נכון יותר.
- ‏Deep Features זולים מספיק לכל ה־Universe ונמדד שאין bottleneck.
- ‏ה־Data Source עצמו מספק Screener authoritative שמתאים למחקר, אך גם אז יש לשמור Contracts של freshness/coverage/lineage.

‏גם במקרים אלה Determinism, Point-in-Time correctness ו־`NO_TRADE` נשארים חשובים.

---

## ‏6. Baseline Architecture

```text
Streaming / Event Market Data
        ↓
Normalize + Validate
        ↓
Partitioned Per-Symbol State
        ↓
Incremental Rolling Windows
        ↓
Cheap Feature Cache
        ↓
Readiness / Freshness / Tradability
        ↓
Logical Ranking Checkpoint
        ↓
Cheap Cross-Sectional Rank
        ↓
Top-N Funnel
        ↓
Deep Enrichment
        ↓
Final Re-Rank / Absolute Gate
        ↓
Candidate Snapshot or NO_TRADE
        ↓
Execution Revalidation
```

‏Hot State ו־Durable History מופרדים:

```text
Hot State
= current decision-serving state

Durable History
= events / evidence / replay / research
```

‏אין DB round-trip per symbol per cycle כ־Baseline.

---

## ‏7. Scanner Contracts

### ‏7.1 `ScannerReadiness`

```text
scanner_epoch
mode
universe_version
expected_universe_count
fresh_symbol_count
fresh_coverage_ratio
max_required_input_age_ms
oldest_queue_age_ms
required_features_ready_ratio
trading_status_ready
clock_healthy
market_data_health
config_version
ready_for_research_rank
ready_for_entry_candidate
reason_codes
as_of_time
```

### ‏7.2 `SymbolScannerState`

```text
instrument_id
symbol
universe_version
market_generation
trading_status
last_trade
last_quote
last_trade_event_time
last_quote_event_time
last_received_time
last_processed_time
rolling_state_version
feature_state_version
eligibility_state
quality_state
readiness_state
last_rank_epoch
```

### ‏7.3 `FeatureValue`

‏מקטע 13 נשאר Source of Truth, וב־Scanner נדרש לפחות:

```text
feature_id
value
status
as_of_time
computed_at
age_ms
source_version
confidence
reason_code
```

### ‏7.4 `ScannerCycle`

‏גם במערכת Event-Driven נשמור logical epoch:

```text
scanner_cycle_id
rank_as_of_time
started_at
completed_at
mode
universe_version
eligible_count
fresh_count
fresh_coverage_ratio
fast_path_count
deep_path_count
cycle_duration_ms
oldest_input_age_ms
config_version
score_version
reason_codes
```

### ‏7.5 `CandidateSnapshot`

```text
candidate_id
scanner_cycle_id
instrument_id
rank
predictive_rank
executable_rank_if_computed
score
score_components
rank_separation
confidence
signal_time
score_as_of
score_computed_at
reference_price
freshness_summary
quality_summary
eligibility_reasons
penalties
execution_context_summary
valid_until
strategy_version
feature_schema_version
score_version
config_version
```

### ‏7.6 Scanner → Execution Handoff

```text
candidate_id
instrument_id
signal_time
valid_until
reference_price
prediction evidence
execution constraints
required rechecks
risk context reference
scanner mode
market generation
```

‏Execution אינו משתמש ב־mutable Scanner object.

‏הוא מקבל Snapshot immutable/versioned.

---

## ‏8. Candidate Funnel

### ‏8.1 Funnel Baseline

```text
Universe
→ Data / Tradability Valid
→ Activity / Cheap Opportunity Gate
→ Cheap Prediction Rank
→ Top-N
→ Deep Execution / Microstructure Enrichment
→ Final Re-Rank
→ Absolute Candidate Gate
→ Candidate or NO_TRADE
```

### ‏8.2 Funnel Metrics

‏לכל Stage נשמור:

```text
input_count
output_count
rejection_rate
processing_time
candidate_recall_estimate
future_winner_rejection_rate
reason_code_distribution
```

### ‏8.3 Early Filters

‏Hard Filter מתאים ל־:

```text
invalid data
halt / status not tradable
severe staleness
required state unavailable
hard safety boundary
```

‏Soft Penalty/diagnostic מתאים יותר ל־quality hypotheses שלא הוכחו כגבול אמיתי.

‏מקטע 12 נשאר Source of Truth לעיצוב Filters.

### ‏8.4 Top-N Size

‏`N` הוא Hyperparameter מחקרי.

‏Trade-off:

```text
N too small
→ candidate misses

N too large
→ deep compute / latency / cost
```

‏Baseline צריך להיות קבוע ופשוט תחילה.

‏`Dynamic Top-N` הוא `P3` Challenger בלבד.

### ‏8.5 Selection Bias של Deep Path

‏Deep Features הנמדדים רק על Top-N נוצרים על Conditional Dataset.

‏לכן אי אפשר להסיק מהם naive whole-market statistics.

‏למחקר נשתמש מדי פעם ב־Shadow Deep Features על Control Sample מחוץ ל־Top-N.

---

## ‏9. Cross-Sectional Timing / Fairness

### ‏9.1 Rank Watermark

‏Ranking checkpoint מגדיר:

```text
rank_as_of_time = T
```

‏כל Feature usable חייב לעמוד ב־As-Of/Freshness contract ביחס ל־`T`.

### ‏9.2 Age Normalization

‏ב־asynchronous system Symbols אינם באותו receive time.

‏Policy אפשרית:

```text
age <= hard_max_age
AND
quality/confidence reflects age
```

‏Age penalty מעבר ל־hard gate הוא Hypothesis שיש validate, לא Default אוניברסלי.

### ‏9.3 Scanner Fairness Test

‏נחליף את order של Universe ב־Replay.

‏אם outcomes משתנים משמעותית רק בגלל Position במערך/Partition:

```text
SCANNER_FAIRNESS_FAILURE
```

### ‏9.4 Partition Skew

‏נמדוד:

```text
partition_event_rate
partition_queue_age
partition_processing_p95/p99
hot_symbol_share
```

‏Rebalancing dynamic הוא Advanced; תחילה מעדיפים static partitioning פשוט עם headroom.

---

## ‏10. Ranking / Stability

### ‏10.1 Prediction Rank ו־Executable Rank

‏מקטע 14 נשאר Source of Truth ל־Prediction Ranking.

‏Scanner 50 יכול להציג בנפרד:

```text
PredictiveRank
ExecutableRank
```

‏כדי להבין האם Execution context משנה winner.

‏אין לערבב אותם בשקט לציון יחיד אם Hard Execution Gate נכשל.

### ‏10.2 Rank Separation

```text
rank_separation = score_1 - score_2
```

‏נשמור גם Top-N neighborhood ולא רק #1.

### ‏10.3 Churn / Persistence

‏נמדוד:

```text
Top1ChurnRate
TopNChurnRate
AverageTop1Lifetime
Top1Persistence
Top3Persistence
```

‏Churn אינו אוטומטית רע.

‏Persistence אינו אוטומטית טוב.

‏שניהם Signals למחקר.

### ‏10.4 Final Re-Rank after Deep Path

‏Candidate שהיה #1 לפני Deep Analysis יכול להשתנות בזמן שה־Deep Path רץ.

‏לכן:

```text
Top-N selected
→ deep work
→ freshness / TTL check
→ final re-rank
```

‏Deep result שפג:

```text
DEEP_PATH_EXPIRED
```

‏ואינו actionable.

---

## ‏11. Event Processing / State Correctness

### ‏11.1 Idempotency

‏Duplicate event אינו רשאי להכפיל:

```text
trade_count
volume
flow
rolling accumulators
feature updates
```

### ‏11.2 Late / Out-of-Order

‏Policy נשענת על Provider semantics, sequence IDs ו־event type.

‏אין `last arrival wins` אוטומטי.

### ‏11.3 Sequence Gap

‏Unresolved gap יכול לגרום:

```text
symbol quality = GAPPED
required path features = INVALID / UNKNOWN
```

‏בהתאם ל־Feature Contract.

### ‏11.4 Coalescing Contract

‏לכל Stream/Event Family נגדיר:

```text
coalescible
requires_every_event
lossless_if_latest_only
replay_requirement
```

‏Quote current-state feature עשוי לאפשר Latest-State coalescing.

‏Trade count/volume/order-flow path בדרך כלל דורשים את רצף האירועים הרלוונטי.

### ‏11.5 Cycle Overrun

‏כאשר logical cycle הבא מגיע לפני שהקודם הושלם, אין Queue אינסופי של Decisions ישנים.

‏Baseline:

```text
prefer current-state coalescing / skip obsolete cycle
rather than
process stale scan epochs later
```

‏ה־policy המדויק צריך להיות deterministic ומתועד.

---

## ‏12. Performance / Hot Path

### ‏12.1 Optimize Cost per Symbol

‏הבעיה בדרך כלל אינה `N = 4,000` לבדה.

‏אלא:

```text
N × expensive work
```

‏לכן קודם מודדים:

```text
per_symbol_update_cost
fast_path_cost
rank_cost
deep_path_cost
```

### ‏12.2 No DB Query per Symbol per Cycle

‏Storage אינו Serving Fast Path.

‏Baseline:

```text
in-memory bounded online state
+
async / separate durable history path
```

### ‏12.3 Full Sort vs Top-K

‏עם כמה אלפי Symbols, Full Sort יכול להיות זול מספיק.

‏לא עוברים ל־Heap/partial-selection לפני Profiling.

### ‏12.4 Bounded Memory

‏Rolling state נשמר רק לטווחים הדרושים ל־online features.

‏Raw history ארוכה עוברת ל־Durable path.

### ‏12.5 Allocation / GC

‏נמדוד:

```text
allocation_rate
GC count
GC pause duration
P95/P99 scanner latency
```

‏Ring buffers, preallocation, pooling ו־specialized structures הם Optimizations לפי Evidence.

### ‏12.6 Capacity Headroom

‏Scanner Production-like לא צריך לעבוד קרוב לקצה כל היום.

‏Stress profile יכלול לפחות:

```text
normal activity
active open
market-wide volatility
hot symbols
provider reconnect flood
```

---

## ‏13. Backpressure / Load Shedding

### ‏13.1 Priority Baseline

```text
P0 Broker / Fill / Position / Risk / Safety
P1 Active-position market state
P2 Candidate execution state
P3 Whole-market scanner updates
P4 Diagnostics / research extras
```

‏המספרים/שמות הם Architecture Contract, לא Broker priority.

### ‏13.2 Load-Shedding Ladder

```text
Disable noncritical diagnostics
→ reduce optional deep enrichment
→ shrink Deep Path N
→ fast-only diagnostic ranking
→ block new entries
```

### ‏13.3 Never Drop Critical Financial Events Silently

‏Scanner overload אינו Permission לאבד Order/Fill truth.

### ‏13.4 Stale Work

‏במערכת Short-Horizon, לפעמים עדיף:

```text
DROP_OBSOLETE_WORK
```

‏מאשר להשלים חישוב נכון על Market State שכבר אינו רלוונטי.

‏אבל Drop חייב להיות observable עם reason code/counter.

### ‏13.5 Recovery from Backpressure

‏לא חוזרים ל־FULL אחרי sample טוב יחיד.

‏נדרש:

```text
queues drained
fresh coverage restored
features current
scanner cycle within budget
stable recovery window
```

---

## ‏14. Warm-Up / Restart / Recovery

### ‏14.1 Startup

```text
load universe/config
→ start market ingestion
→ build canonical state
→ warm required windows
→ measure fresh coverage
→ prove readiness
→ allow candidate production
```

### ‏14.2 Restart with Existing Exposure

```text
reconcile broker truth
→ restore position-management market state
→ validate exit capability
→ restore broad scanner state
→ warm required entry features
→ allow new entries last
```

### ‏14.3 Checkpointing

‏Persisting Scanner cache אינו חובה.

‏אם משתמשים checkpoint כדי לקצר warm-up:

```text
checkpoint_version
created_at
source_sequence
universe_version
feature_schema_version
```

‏וכל State נטען מחדש חייב לעבור Freshness validation.

### ‏14.4 State Reset Boundaries

‏Rolling state policy תגדיר במפורש boundaries כגון:

```text
session transition
halt/reopen market generation
provider reset
corporate action
symbol remap
schema/config migration
```

---

## ‏15. Scanner / Strategy / Execution Boundaries

### ‏Scanner owns

```text
canonical market-serving state
feature availability
eligibility evidence
prediction ranking evidence
candidate funnel
scanner readiness
candidate snapshots
```

### ‏Strategy / Decision owns

```text
absolute trade/no-trade policy
strategy-specific interpretation
intent creation decision
```

### ‏Risk / Safety owns

```text
permission to create exposure
hard limits
system safety modes
```

### ‏Execution owns

```text
fresh pre-submit revalidation
order tactic
broker side effects
fill / order / position truth
```

‏Scanner לא עוקף אף אחת מהשכבות האלה.

---

## ‏16. Observability

### ‏16.1 Metrics

‏נשמור לפחות:

```text
universe_size
fresh_symbol_count
fresh_coverage_ratio
eligible_count
events_per_second
processed_events_per_second
oldest_queue_age
p95_queue_age
cycle_duration_p50/p95/p99
feature_update_p50/p95/p99
rank_duration_p50/p95/p99
deep_path_duration_p50/p95/p99
Top1ChurnRate
TopNLifetime
rank_separation
NO_TRADE_rate
rejection_reason_counts
dropped_obsolete_work
coalesced_event_count
partition_skew
scanner_mode
```

### ‏16.2 Top-N Evidence

‏לא נשמור Metric labels בלתי מוגבלים לכל Symbol.

‏Top-N / Decision evidence יעבור ל־Structured Events/Truth artifacts:

```text
rank
score components
feature ages
quality
confidence
eligibility
rejection reasons
mode
versions
```

### ‏16.3 Scanner Incident Packet

```text
incident_id
scanner_cycle_id
scanner_mode
Top-N snapshot
fresh coverage
queue ages
partition health
provider health
feature readiness
config / versions
latency histograms
recent mode transitions
rejection distribution
```

### ‏16.4 Alerts

‏Alerts צריכים להיות consequence-oriented:

```text
fresh coverage below validated minimum
queue age violates current signal horizon
cycle latency breaches economic budget
partition stalled
feature readiness collapsed
replay/live semantic divergence detected
```

‏CPU גבוה לבדו אינו Alert חשוב אם אין consequence.

---

## ‏17. Metrics for Decision Quality

‏Scanner Quality הוא Vector:

```text
Freshness
Coverage
Latency
Candidate Recall
Rank Stability
Decision Impact
Executable Outcome
```

‏אין KPI יחיד בשם “Scanner Speed”.

### ‏17.1 Funnel Recall

‏Fast Path promotion נמדד גם על כמה future-good candidates הוא איבד.

### ‏17.2 Decision Impact Rate

```text
DecisionImpactRate
=
DecisionsChangedByChallenger
/
ComparableDecisions
```

‏שיפור תשתיתי/Feature שאינו משנה Decisions כמעט בכלל צריך להצדיק את Complexity בדרך אחרת.

### ‏17.3 Selection Regret

‏לאחר Episode:

```text
selected candidate outcome
vs
valid alternatives under same decision-time information
```

‏Counterfactual נשמר עם Fidelity/Confidence.

### ‏17.4 NO_TRADE Attribution

‏Reason distribution מלמדת האם הבעיה היא:

```text
market opportunity
execution quality
data quality
coverage
latency
risk/safety
```

---

## ‏18. Research / Experiment Ladder

```text
S0 — deterministic simple full-universe baseline
S1 — incremental state serving
S2 — strict freshness + coverage gates
S3 — Fast Path / Top-N funnel
S4 — Deep Path reranking
S5 — execution-aware diagnostics/rank challenger
S6 — load-aware degradation policies
S7 — advanced partitioning / dynamic Top-N
S8 — specialist distributed / learned serving
```

‏כל שלב נבדק מול Champion קפוא לפי מקטעים 24 ו־49.

### ‏Experiment Questions

‏נבדוק בנפרד:

```text
Did incremental computation preserve semantics?
Did funnel reduce latency without losing candidate recall?
Did Deep Path improve executable ranking?
Did Top-N size improve net decision quality?
Did load shedding preserve safety/readiness?
Did new data structure improve P99 materially?
```

‏לא משנים הכול יחד.

---

## ‏19. Testing Strategy

### ‏`P0`: Deterministic Replay

‏אותו Input Log + Versions חייב להחזיר:

```text
same symbol states
same feature statuses
same filters
same scores
same rank
same candidate / NO_TRADE reasons
```

### ‏`P0`: Golden Scenarios

‏נחזיק לפחות:

```text
clear winner
no valid winner
stale top candidate
tie
bad tick
sequence gap
duplicate trade
late event
provider lag
provider reconnect flood
halt / reopen
hot-symbol burst
rapid Top1 flips
deep-path expiry
partial-universe freshness
```

### ‏`P0`: Properties

```text
invalid symbol cannot become actionable candidate
stale required state cannot become actionable candidate
unknown required state cannot be silently converted to zero
same state + same config => same rank
NO_TRADE is always permitted
old scanner epoch cannot silently authorize new execution
coverage failure blocks actionable whole-market ranking
```

### ‏Differential Tests

‏Champion מול Challenger על אותו Replay:

```text
feature differences
rank differences
candidate differences
decision differences
latency differences
NO_TRADE differences
```

### ‏Order-Bias Test

‏Randomize/reverse Universe iteration order.

‏Semantic output אמור להישאר זהה כאשר Inputs/As-Of זהים.

### ‏Fault Injection

```text
sequence gaps
late events
duplicates
bad ticks
missing quotes
provider divergence
partition delay
storage slowdown
logger slowdown
deep-path slowdown
GC/CPU stall
clock anomaly
```

### ‏Stress Tests

```text
10x event burst
several pathological hot symbols
reconnect flood
market-wide volatility replay
partition skew
long soak
```

‏ה־goal אינו “לא לקרוס” בלבד.

‏צריך לוודא:

```text
no silent stale ranking
no hidden backlog
no critical-event loss
safe mode transition
correct recovery
```

---

## ‏20. Failure Modes

### ‏`SC_STALE_INPUT`

‏Actionable ranking השתמש ב־required evidence ישן מדי.

### ‏`SC_LOW_COVERAGE`

‏Whole-market comparison אינו אמין בגלל fresh coverage נמוך.

### ‏`SC_BACKLOG`

‏Processing lag הפך את Current State לעבר.

### ‏`SC_PARTITION_SKEW`

‏Partition/Hot Symbol יצר systematic delay לקבוצה מסוימת.

### ‏`SC_BAD_EVENT`

‏Malformed/invalid event פגע ב־state path.

### ‏`SC_FEATURE_NOT_READY`

‏Required Feature עדיין warming/missing/invalid.

### ‏`SC_RANK_UNSTABLE`

‏Ranking instability גבוהה באופן חריג ונדרשת אבחנה.

### ‏`SC_TOP1_LOW_SEPARATION`

‏#1 כמעט קשור ל־#2; Diagnostic/Hypothesis, לא Hard Reject אוטומטי.

### ‏`SC_DEEP_PATH_EXPIRED`

‏Deep evidence הסתיים אחרי TTL שלו.

### ‏`SC_PROVIDER_DIVERGENCE`

‏Feeds אינם מסכימים מעבר למה שמוסבר ב־time alignment/semantics.

### ‏`SC_CONFIG_MISMATCH`

‏Decision ראה Config/Feature versions לא עקביים.

### ‏`SC_REPLAY_DIVERGENCE`

‏Live/Replay semantics אינם מתכנסים על אותו evidence.

### ‏`SC_EXECUTION_RECHECK_FAIL`

‏Candidate עבר Scanner אך נכשל ב־fresh Execution gate.

### ‏`SC_SILENT_DEGRADATION`

‏Feature/mode נעלמו תחת load בלי שינוי explicit mode/version.

### ‏`SC_COMPUTE_BIAS`

‏Symbols מהירים/מוקדמים לעיבוד קיבלו structural ranking advantage.

### ‏`SC_DUPLICATE_ACCOUNTING`

‏Duplicate event הכפיל volume/trade/flow state.

### ‏`SC_WARMUP_FALSE_READY`

‏Scanner הכריז READY לפני שהחלונות הנדרשים נבנו.

---

## ‏21. Alternatives / Trade-offs

### ‏Full Snapshot Scanner

‏יתרונות:

- ‏פשוט.
- ‏קל ל־Replay.
- ‏קל להבין cycle boundary.

‏חסרונות:

- ‏work bursts.
- ‏repeated computation.
- ‏freshness skew.

‏מתאים כ־Research Baseline או ל־slow strategies.

### ‏Pure Event-Driven Ranking

‏יתרונות:

- ‏תגובה מהירה לכל שינוי.
- ‏מעט wasted recomputation.

‏חסרונות:

- ‏rank churn.
- ‏complex cross-sectional timing.
- ‏burst sensitivity.

‏לכן אינו Preferred Default כרגע.

### ‏Distributed Scanner Cluster

‏יתרונות אפשריים:

- ‏scale-out.
- ‏fault isolation.

‏מחירים:

```text
serialization
network hops
coordination
ordering
failure modes
observability burden
```

‏עם ≈4,000 Symbols הוא `P4` עד ש־Single-process/partitioned design מוכח כ־bottleneck.

### ‏GPU / Heavy ML per Symbol

‏`P4 / Avoid Unless Evidence`.

‏לא נכנס לפני ש־simple Fast Path לא עומד באיכות/latency באופן מוכח.

---

## ‏22. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏Distributed Streaming Cluster.
- ‏GPU Ranking.
- ‏100+ Features ב־All-Universe Hot Path.
- ‏DB Query per Symbol per Cycle.
- ‏Dynamic Partition Rebalancing.
- ‏Dynamic Top-N policy.
- ‏complex incremental dependency graph שקשה להוכיח.
- ‏microsecond tuning לפני P95/P99 profiling.
- ‏silent missing-value defaults.
- ‏silent load shedding.
- ‏Scanner ששולח Broker Orders ישירות.
- ‏Full-universe Deep Book/Flow/Capacity analysis בכל Event.

---

## ‏23. What to Add Later

‏רק לאחר Evidence:

```text
material-change ranking triggers
validated debounce / hysteresis
incremental Top-K structures
advanced dependency graph
adaptive Deep Path size
regime-aware Scanner budgets
provider-divergence scoring
advanced partition isolation
warm standby / HA scanner
leader/fencing for multi-instance serving
specialized data-oriented structures
```

‏כל תוספת עוברת Complexity Tax ו־Decision Impact analysis.

---

## ‏24. Promotion Criteria

‏Scanner/Challenger יכול להתקדם רק אם:

- ‏Point-in-Time correctness נשמרת.
- ‏Replay Determinism נשמר.
- ‏Fresh Coverage נמדד ונכשל שמרנית.
- ‏Candidate Recall אינו נפגע מעבר ל־guardrail שהוגדר מראש.
- ‏P95/P99 latency משתפרת או נשארת בתוך budget.
- ‏Burst/Backpressure אינם יוצרים silent stale state.
- ‏Decision differences מוסברים.
- ‏NO_TRADE semantics נשמרים.
- ‏Execution recheck נשמר.
- ‏Failure isolation עובדת.
- ‏Observability מספיקה ל־RCA.
- ‏Complexity increase מוצדק ב־incremental value.

---

## ‏25. Rejection Criteria

‏נReject שינוי כאשר:

```text
ranking semantics depend on iteration order
candidate recall collapses
fresh coverage is hidden
P99 grows materially without economic benefit
Deep Path regularly expires
backlog is processed silently as current market
missing data becomes zero/default bias
replay diverges without intended semantic change
critical events can be dropped
complexity increases with negligible decision impact
```

---

## ‏26. Metrics

### ‏Serving / Data

```text
universe_size
fresh_symbol_count
fresh_coverage_ratio
eligible_count
market_event_rate
processed_event_rate
oldest_event_age
p95_event_age
sequence_gap_rate
duplicate_event_rate
```

### ‏Compute

```text
symbol_update_p50/p95/p99
feature_update_p50/p95/p99
rank_p50/p95/p99
deep_path_p50/p95/p99
cycle_p50/p95/p99
GC_pause_p95/p99
allocation_rate
```

### ‏Funnel

```text
stage_input_count
stage_output_count
stage_rejection_rate
candidate_recall
future_winner_rejection_rate
DeepPathN
```

### ‏Ranking

```text
Top1ChurnRate
TopNChurnRate
Top1Lifetime
TopNPersistence
rank_separation
rank_drift_during_deep_path
```

### ‏Decision

```text
TRADE_rate
NO_TRADE_rate
NO_TRADE_reason_distribution
DecisionImpactRate
SC_EXECUTION_RECHECK_FAIL_rate
SelectionRegret
```

### ‏Health

```text
scanner_mode
mode_transition_count
partition_skew
hot_symbol_share
dropped_obsolete_work
coalesced_event_count
warmup_duration
recovery_to_ready_duration
```

---

## ‏27. User-Specific Application

‏למערכת שלנו יש כמה מאפיינים שמחזקים במיוחד את ה־Baseline הזה:

```text
~4,000-symbol whole-market universe
seconds / sub-seconds research horizons
many rolling time anchors
Top-candidate selection
Flow / Book / Capacity features available as advanced layers
separate market-data and broker paths
strong requirement for Replay / RCA
```

‏לכן ההמלצה הקונקרטית היא:

```text
1. Event-driven raw/current state updates.
2. Canonical state per symbol.
3. Precompute cheap rolling features on update.
4. Rank the whole valid/fresh universe with a small feature set.
5. Keep Top-N modest and fixed initially.
6. Run expensive Flow/Book/Capacity only there.
7. Re-rank after Deep Path.
8. Apply absolute Candidate Gate.
9. Hand off immutable candidate evidence.
10. Revalidate immediately before execution.
```

‏ה־Scanner לא יקבל יעד “תמיד להחזיר מניה”.

‏היעד:

```text
return the best trustworthy candidate
only when the market picture is fresh enough
and the absolute opportunity remains executable;
otherwise return NO_TRADE.
```

---

## ‏28. Fact / Judgment / Hypothesis

### ‏Fact / Established Engineering Principle

- ‏Work ישן אינו הופך ל־Current Market רק כי סיימנו לעבד אותו.
- ‏Missing/Unknown אינם שקולים ל־Zero.
- ‏Duplicate event יכול להשחית rolling counters ללא idempotency.
- ‏Cross-sectional ranking על coverage חלקית משנה את משמעות `Top1`.
- ‏Deep Features המחושבים רק ל־Top-N יוצרים conditional sample.
- ‏Same semantic input חייב להיות reproducible כדי לאפשר Replay/RCA אמינים.

### ‏Judgment — Recommended Baseline

- ‏Hybrid event-driven updates + controlled ranking checkpoints.
- ‏Simple in-process/low-hop pipeline תחילה.
- ‏Small cheap Fast Path לכל השוק.
- ‏Fixed Top-N Deep Path.
- ‏Strict Coverage/Freshness gate.
- ‏Progressive degradation שמסתיימת ב־block entries.
- ‏One logical writer per Symbol State.

### ‏Hypothesis — Requires Experiment

- ‏Top-N האופטימלי.
- ‏Debounce interval.
- ‏Hysteresis policy.
- ‏Age penalty מעבר ל־hard freshness limit.
- ‏Rank persistence as signal.
- ‏Rank velocity/acceleration.
- ‏Execution-aware combined score.
- ‏Dynamic Top-N לפי load/regime.
- ‏Advanced Provider divergence scoring.

---

## ‏29. Confidence

### ‏High Confidence

‏גבוה לגבי:

- ‏Freshness/Coverage כ־part of correctness.
- ‏Fast/Deep separation.
- ‏Incremental state במקום repeated expensive recomputation.
- ‏Deterministic ranking / explicit tie-breakers.
- ‏Backpressure/queue age as safety signal.
- ‏NO_TRADE first-class.
- ‏Execution recheck.
- ‏Idempotent event handling.
- ‏Replay-compatible core.

### ‏Medium Confidence

‏בינוני לגבי:

- ‏ה־Hybrid ranking trigger המדויק.
- ‏Single-process partitioning כ־best long-term topology.
- ‏Size של Top-N.
- ‏Degree of coalescing per stream.
- ‏Whether predictive and executable rank should remain separate forever.

### ‏Evidence-Only

‏לא נקדם ללא Measurement:

- ‏Distributed scanner.
- ‏Dynamic load-aware Top-N.
- ‏GPU/ML serving.
- ‏Complex dynamic partition balancing.
- ‏Lock-free / exotic low-latency data structures.

---

## ‏30. Time-Sensitive Facts

‏לא נוספו במקטע זה Facts חיצוניים תלויי־זמן על Broker, Exchange, Regulation או Provider capability.

‏לכן לא נדרש Web verification חדש.

‏לפני Implementation ספציפי יש לאמת מחדש capabilities שמשפיעים בפועל על:

```text
provider sequence semantics
provider reconnect / snapshot semantics
subscription limits
broker readiness / pacing
session/trading-status source
```

‏אם הם נכנסים ל־Scanner Contract.

---

## ‏31. Relationship to Earlier / Later Sheets

### ‏Earlier

- ‏`06` — Time/Sampling/Latency: timing, freshness, backpressure ו־logical as-of.
- ‏`07` — Trading Universe: מי בכלל נמצא ב־eligible universe.
- ‏`12` — Filters: Hard/Soft gate semantics.
- ‏`13` — Feature Engineering: Feature Contract, point-in-time, missing/stale semantics.
- ‏`14` — Score/Ranking: prediction ranking, decomposition ו־`Rank #1 != Trade`.
- ‏`15` — Candidate Gate: absolute `TRADE / NO_TRADE` decision.
- ‏`27` — Replay: deterministic event-driven reproduction.
- ‏`33–36` — State, recovery, observability ו־safety.
- ‏`44–47` — Flow, Book, adverse selection ו־capacity כ־Deep Path candidates.
- ‏`48` — Latency budgets, P95/P99, queue age ו־hot-path priorities.
- ‏`49` — Experiment governance וה־Champion/Challenger discipline.

### ‏Later

‏`51 — Execution Engine Best Practices` יקבל מה־Scanner/Decision את ה־immutable `Order Intent`/candidate evidence ויעסוק ב־idempotency, partial fills, cancel/replace races, unknown effects, reconciliation ו־execution invariants.

---

## ‏32. Recommendation Summary

### ‏Priority Map

```text
P0
- Scanner Readiness Contract
- Freshness per symbol
- Fresh Coverage gate
- deterministic rank / tie-breakers
- event ordering / idempotency
- warm-up readiness
- backpressure detection
- no critical-event loss
- NO_TRADE
- execution recheck
- Replay determinism

P1
- hybrid event-driven update + ranking checkpoints
- canonical per-symbol state
- incremental/precomputed cheap features
- Fast Path / fixed Top-N / Deep Path
- one logical writer per symbol
- explicit Candidate Snapshot
- progressive degradation
- strong diagnostics

P2
- shadow control sample for Deep Features
- validated rank/churn/persistence diagnostics
- approximation-vs-deep drift monitoring
- better Top-K structures if profiling justifies

P3
- adaptive Top-N
- regime-aware budgets
- advanced partition management
- execution-aware ranking challenger

P4
- distributed scanner cluster
- GPU/heavy per-symbol models
- HA warm standby / multi-writer serving
- exotic low-latency structures
```

### ‏Final Baseline

```text
Simple Incremental State
→ Strict Data / Trading-State Validity
→ Fresh Coverage Gate
→ Cheap Full-Universe Fast Path
→ Deterministic Rank
→ Fixed Small Top-N
→ Deep Features / Execution Context
→ Final Re-Rank
→ Absolute Candidate Gate
→ Candidate Snapshot or NO_TRADE
→ Fresh Execution Recheck
```

‏ה־Scanner שלנו צריך להיות **מהיר מספיק, אך קודם כול current, complete-enough, deterministic ו־explainable**.

‏הוא אינו נמדד בכמה Features הוא מחשב, אלא בכמה טוב הוא מצמצם אלפי Symbols למעט מועמדים אמינים בלי לאבד את ה־Market State בדרך.