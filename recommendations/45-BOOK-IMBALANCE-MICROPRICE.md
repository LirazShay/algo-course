# ‏45 — Recommendation Sheet: Book Imbalance / Microprice

> ‏מקור לימודי עיקרי: `../45-BOOK-IMBALANCE-AND-MICROPRICE.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ומתודולוגי ל־`Book Imbalance`, ‏displayed depth ו־`Microprice` עבור רובוט `Short-Horizon Momentum`, כך שנשתמש בספר הפקודות כ־evidence הסתברותית עם freshness, provenance, persistence ו־quality — בלי להפוך Snapshot בודד ל־“Demand”, בלי לקרוא ל־Microprice “Fair Value”, ובלי להוסיף L2/MBO complexity לפני שה־L1 מוכיח incremental net value.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏`Book State` יוגדר אצלנו כ־Feature Family נפרד מ־`Order Flow`, עם הפרדה מפורשת בין:

```text
Displayed Liquidity State
!=
Executed Flow
!=
Our Queue Feasibility
!=
Executable Fill Truth
```

‏ה־Baseline:

```text
Canonical Book Events / L1 Quotes
→ Valid Book Snapshot
→ Freshness / Provenance / Quality
→ Top Imbalance + Microprice Offset
→ Short Persistence / Churn
→ Price / Flow Interaction
→ Shadow Challenger
→ OOS + Execution-Aware Validation
→ Promotion / Rejection
```

‏העיקרון המחייב:

```text
Book Imbalance is probabilistic evidence.
Microprice is a short-horizon transform, not Fair Value.
Displayed depth is not a promise.
Prediction pressure != our queue feasibility.
```

‏אנחנו לא נשאל:

```text
Is there a big bid wall?
```

‏אלא:

```text
What displayed liquidity is observable?
How fresh and complete is it?
How persistent is it?
How is it changing?
How does aggressive flow interact with it?
How does price respond?
Does the information survive until submit/fill?
Does it improve net executable outcome beyond the current baseline?
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Book data חייבת להיות Valid לפני כל Feature

‏Book Feature אינו קביל אם אחד מאלה אינו ידוע או תקין:

```text
source/feed identity
as_of_time
received_time
book_version
bid/ask presence
positive sizes
sorted levels
sequence integrity where applicable
book mode / fidelity
freshness
```

‏Invalid Book אינו מקבל fallback לערך הישן.

```text
INVALID != ZERO
INVALID != LAST_KNOWN_GOOD
```

### ‏`P0 — Required`: ‏`Missing != Zero`

‏אם Ask size חסר:

```text
imbalance = MISSING
```

‏לא:

```text
imbalance = +1
```

‏אותו כלל חל על Bid, depth levels, sequence state ו־Microprice.

### ‏`P0 — Required`: ‏Snapshot atomicity / torn-book protection

‏Book Snapshot חייב להיות logical state עקבי.

‏מצב:

```text
new bid
+ old ask
```

‏יכול לייצר imbalance מזויף.

‏לכן כל Snapshot canonical יקבל:

```text
book_version
as_of_time
received_at
quality
```

‏וה־Strategy מקבלת immutable snapshot.

### ‏`P0 — Required`: ‏Sequence gap פוסל Book-dependent decisions

‏אם event-level feed מצביע על gap:

```text
BOOK_STATE = INVALID
```

‏עד authoritative resnapshot/rebuild.

‏אין להמשיך sophisticated book analytics על state שידוע כ־corrupted.

### ‏`P0 — Required`: ‏Locked/Crossed Book דורש handling מפורש

‏אם:

```text
bid == ask
```

‏ה־Book locked.

‏אם:

```text
bid > ask
```

‏ה־Book crossed.

‏ב־Baseline:

```text
microprice_valid = false
```

‏עד שיש model מפורש שמסביר את אותו market/feed state.

### ‏`P0 — Required`: ‏Book features אינם עוקפים Tradability / Risk / Safety

```text
Trading Status
→ Data / Book Quality
→ Book Features
→ Ranking / Candidate Context
→ Execution Readiness
→ Risk
→ Safety
→ Execution
```

‏Extreme imbalance אינו override ל־halt, stale data, unknown broker state, LULD constraint או risk limit.

### ‏`P1 — Preferred Default`: ‏L1 Book Model לפני L2/MBO

‏ה־first research baseline:

```text
fresh best bid / ask
spread
best bid size
best ask size
top imbalance
microprice
microprice offset
short persistence
book age
```

‏המטרה היא לבדוק קודם אם משפחת Book בכלל מוסיפה incremental value.

### ‏`P1 — Preferred Default`: ‏Top Imbalance פשוט

‏נשתמש בגרסה הסימטרית:

```text
top_imbalance
=
(bid_size - ask_size)
/
(bid_size + ask_size)
```

‏כאשר denominator תקין.

‏הטווח:

```text
[-1, +1]
```

‏אבל value קיצוני אינו מקבל confidence גבוה אוטומטית; depth מוחלט קטן יכול לייצר ratio קיצוני וחסר משמעות.

### ‏`P1 — Preferred Default`: ‏Microprice בסיסי בלבד

```text
microprice
=
ask_price * bid_size / (bid_size + ask_size)
+
bid_price * ask_size / (bid_size + ask_size)
```

‏ונגזור:

```text
mid = (bid + ask) / 2
spread = ask - bid
microprice_offset = microprice - mid
microprice_offset_spread = (microprice - mid) / spread
```

‏כאשר spread חיובי וה־Book valid.

### ‏`P1 — Preferred Default`: ‏Microprice אינו Fair Value

‏אנחנו לא משתמשים ב־Microprice כ־target price.

‏ה־Research Question:

```text
microprice_offset at t
→ future executable / mid movement at t + horizon
```

‏ולא:

```text
market should trade at microprice
```

### ‏`P1 — Preferred Default`: ‏Persistence + Freshness לצד Snapshot value

‏ל־Top Imbalance נחשב לפחות:

```text
imbalance_now
imbalance_positive_duration_ms
fraction_positive_last_window
imbalance_flip_count
book_age_ms
book_updates_per_second
```

‏Snapshot קיצוני בן 10ms אינו equivalent ל־pressure יציב לאורך 2s.

### ‏`P1 — Preferred Default`: ‏Fast Path קטן לכל ה־Universe

‏ל־whole-market scanner:

```text
spread
book_age
top_imbalance
microprice_offset_spread
basic top depth
short persistence
book quality
```

‏מחושבים continuously ככל שניתן.

### ‏`P1 — Preferred Default`: ‏Deep Path רק ל־Top-N

‏רק לאחר shortlist:

```text
L3/L5 cumulative depth
near-touch depth
depth concentration
depth slope
depletion
replenishment
Book × Flow interaction
venue / cross-feed diagnostics
```

### ‏`P1 — Preferred Default`: ‏Book מתחיל כ־Shadow Challenger

```text
Champion:
Momentum + Activity + Executability baseline

Challenger 1:
Champion + top imbalance

Challenger 2:
Challenger 1 + microprice offset

Challenger 3:
+ persistence / dynamics
```

‏לא מוסיפים L2/MBO לפני שהשכבות הקודמות הוכיחו incremental value.

---

## ‏3. למה זו ברירת המחדל

‏Book data מזמינה overfitting משום שקל מאוד ליצור מאות transforms:

```text
levels
× windows
× weighting schemes
× normalizations
× dynamics
× interactions
```

‏בנוסף, ספר הפקודות הוא transient:

- ‏displayed size יכול להיעלם.
- ‏hidden liquidity אינה נראית.
- ‏venue fragmentation משנה את התמונה.
- ‏snapshot יכול להתיישן לפני submit.
- ‏L1 אינו full depth.
- ‏L2 אינו בהכרח consolidated truth.
- ‏MBO עדיין אינו perfect queue truth.

‏לכן הדרך הנכונה אצלנו היא:

```text
Validate data state first
→ use simple L1 transforms
→ carry confidence
→ measure persistence
→ join with flow/price response
→ validate against executable outcomes
→ add depth only if justified
```

---

## ‏4. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Displayed Bid/Ask Size הוא observable state לפי feed/scope מסוים.
- ‏Displayed size אינו כל ה־liquidity.
- ‏Book state יכול להשתנות בין Decision ל־Fill.
- ‏Microprice הבסיסי הוא transform של prices + top sizes.
- ‏Microprice ו־Top Imbalance אינם evidence בלתי־תלויים לחלוטין.
- ‏Sequence gap יכול להפוך reconstructed book ללא אמין.
- ‏Snapshot data לבדו אינו תמיד מאפשר להבדיל בוודאות בין cancel, execution ו־replace.

### ‏Judgment

- ‏L1-first הוא baseline נכון עבור המערכת שלנו.
- ‏Top Imbalance + Microprice + persistence מספיקים ל־first experiment.
- ‏L3/L5 enrichment שייך ל־Top-N ולא לכל ~4,000 symbols בכל event.
- ‏MBO/direct feeds אינם prerequisite לפני שנמדד incremental value.
- ‏Book Feature צריך להתחיל כ־Shadow Challenger.

### ‏Hypothesis

- ‏Book imbalance מוסיף predictive value מעבר ל־Momentum/Flow.
- ‏Microprice offset שומר predictive power בטווח שמתאים ל־latency שלנו.
- ‏Book disagreement יכול לעזור ב־NO_TRADE.
- ‏Book features יכולים לשפר execution-mode selection.
- ‏Depletion/replenishment מוסיפים net value מעבר ל־L1.

---

## ‏5. Core Concepts

### ‏`Book State`

```text
Displayed liquidity available now according to the feed.
```

### ‏`Order Flow`

```text
Executed / aggressive event stream over time.
```

### ‏`Book Pressure`

‏משפחה של measures כגון:

```text
imbalance
near-touch depth
microprice offset
depletion
replenishment
persistence
```

### ‏`Book Churn`

```text
How quickly sizes / levels change.
```

### ‏`Book Half-Life`

```text
How quickly a snapshot stops resembling the relevant next market state.
```

### ‏`Book Quality`

```text
How trustworthy / fresh / complete is this reconstructed state?
```

### ‏`Queue Feasibility`

```text
Given our order, how plausible is execution before the signal deadline?
```

‏`Book Pressure` ו־`Queue Feasibility` אינם אותו דבר.

---

## ‏6. `CanonicalBookSnapshot` Baseline

```text
CanonicalBookSnapshot
- instrument_id
- book_version
- as_of_time
- received_time
- source_feed
- book_scope
- fidelity
- bids[]
- asks[]
- sequence_state
- quality
- invalid_reason?
```

‏כל Level:

```text
BookLevel
- price
- size
- level
- event_time? / age? when available
```

‏`book_scope` יכול להיות למשל:

```text
L1
L2_5
L2_10
MBP
MBO
VENUE_SPECIFIC
CONSOLIDATED
```

‏בלי לערבב modes בשקט.

---

## ‏7. `BookQuality` Baseline

```text
GOOD
DEGRADED
STALE
GAPPED
INVALID
UNKNOWN
```

‏Reason codes:

```text
STALE_BOOK
MISSING_BID
MISSING_ASK
INVALID_SIZE
LOCKED_BOOK
CROSSED_BOOK
SEQUENCE_GAP
INSUFFICIENT_DEPTH
TORN_SNAPSHOT
SOURCE_CONFLICT
MODE_UNSUPPORTED
```

‏`GOOD` הוא Contract, לא default.

---

## ‏8. Top Imbalance Contract

```text
top_imbalance
=
(bid_size - ask_size)
/
(bid_size + ask_size)
```

‏Guard:

```text
bid_size > 0
ask_size > 0
bid < ask
book_fresh == true
book_quality acceptable
```

‏נשמור גם:

```text
top_total_depth = bid_size + ask_size
```

‏כדי שלא לפרש ratio קיצוני שנבנה על depth זניח כאילו הוא evidence חזק.

---

## ‏9. Microprice Contract

‏Baseline formula:

```text
microprice
=
ask_price * bid_size / total_top_depth
+
bid_price * ask_size / total_top_depth
```

‏Properties:

```text
bid <= microprice <= ask
```

‏ב־normal valid book.

‏אם:

```text
bid_size == ask_size
```

‏אז:

```text
microprice == mid
```

‏אם Bid size גדל והמחירים קבועים, microprice נע לכיוון Ask.

### ‏Normalized forms

```text
microprice_offset = microprice - mid
microprice_offset_ticks
microprice_offset_bps
microprice_offset_spread
```

‏Ticks מתארים mechanics; ‏BPS magnitude כלכלי; ‏spread-normalized offset context בתוך ה־touch.

---

## ‏10. Microprice אינו independent alpha source

‏ה־Microprice הבסיסי נגזר מ־:

```text
best bid / ask
+
top sizes
```

‏לכן:

```text
Top Imbalance
and
Microprice Offset
```

‏יכולים להיות highly correlated.

‏ב־Score linear אין לספור אותם כשלושה votes שונים (`imbalance`, `microprice`, `microprice rank`) בלי ablation.

---

## ‏11. Multi-Level Depth — רק Challenger

‏אחרי L1 evidence:

```text
bid_depth_N = Σ bid_size[i]
ask_depth_N = Σ ask_size[i]

imbalance_N
=
(bid_depth_N - ask_depth_N)
/
(bid_depth_N + ask_depth_N)
```

‏נבדוק למשל:

```text
L3 cumulative imbalance
L5 cumulative imbalance
```

‏לא עשרות levels כברירת מחדל.

---

## ‏12. Distance-Weighted Depth

‏Challenger מתקדם:

```text
weighted_bid = Σ w[i] * bid_size[i]
weighted_ask = Σ w[i] * ask_size[i]
```

‏כאשר `w[i]` קטן עם distance from touch.

‏כל weighting formula, כולל exponential decay, היא Hypothesis:

```text
formula_version
parameters
training period
validation period
```

‏חייבים להיות versioned.

---

## ‏13. Book Shape

‏Features candidates:

```text
near_touch_bid_depth
near_touch_ask_depth
bid_depth_slope
ask_depth_slope
bid_l1_share
ask_l1_share
```

‏מטרת Shape היא להבדיל בין:

```text
pressure concentrated at touch
```

‏לבין:

```text
pressure deeper in the book
```

‏אבל Shape נשאר P2/P3 עד evidence.

---

## ‏14. Persistence / Dynamics

‏Snapshot value בלבד חלש יחסית.

‏נרצה:

```text
imbalance_positive_duration_ms
fraction_positive_last_1s
fraction_positive_last_2s
imbalance_velocity
imbalance_flip_count
book_update_rate
```

‏נעדיף קודם persistence ו־flip count על פני derivatives גבוהים כמו acceleration.

---

## ‏15. Depletion

‏`Depletion` מתאר ירידה ב־available displayed depth.

‏Example observable:

```text
Ask1 size:
10000 → 7000 → 3000 → 500
```

‏אבל snapshot-only data אינה תמיד יודעת אם הירידה הייתה:

```text
trade
cancel
replace
feed behavior
```

‏לכן:

```text
depletion = observed size/path change
cause = OBSERVED only if event semantics prove it, otherwise UNKNOWN/INFERRED
```

---

## ‏16. Replenishment

‏Pattern:

```text
Ask size consumed/decreased
→ size returns near same level
```

‏יכול להיות:

- ‏reserve/iceberg behavior.
- ‏new participants.
- ‏routing behavior.
- ‏aggregation artifact.

‏המערכת שלנו אינה קובעת “iceberg” בלי evidence מתאים.

---

## ‏17. Book × Flow Interaction

‏זה אחד האזורים החשובים ביותר:

```text
Book Pressure
×
Aggressor Flow
×
Price Response
```

### ‏Agreement example

```text
positive book imbalance
+ positive aggressive flow
+ upward price response
```

### ‏Conflict example

```text
positive book imbalance
+ strong sell aggression
```

### ‏Absorption candidate

```text
positive buy aggression
+ ask replenishment
+ weak upward response
```

‏Conflict אינו failure; הוא Feature family למחקר.

---

## ‏18. Observed / Derived / Inferred

‏נשמור distinction מפורש:

### ‏Observed

```text
bid price
ask price
bid displayed size
ask displayed size
book sequence
```

### ‏Derived

```text
imbalance
microprice
depth slope
book churn
```

### ‏Inferred

```text
absorption_candidate
replenishment interpretation
queue pressure interpretation
spoof-like behavior candidate
```

‏Inferred אינו historical fact.

---

## ‏19. Intent Attribution — אסור

‏אנחנו לא נכתוב:

```text
someone is manipulating the book
institution is defending the bid
smart money is hiding size
```

‏ללא evidence שמאפשר טענה כזאת.

‏נכתוב:

```text
large displayed bid appeared
persisted X ms
cancelled before meaningful execution
price response Y
```

‏Observable behavior, לא narrative.

---

## ‏20. Prediction Pressure != Queue Feasibility

‏זה distinction מחייב.

‏Bid גדול יכול להיות:

```text
Prediction:
possible upward pressure evidence
```

‏ובאותו זמן:

```text
Execution:
large queue ahead for our passive buy
```

‏לכן:

```text
BookAlphaContext
!=
QueueExecutionContext
```

‏Queue model נשאר תחת contracts של Segment 38.

---

## ‏21. Book Feature יכול להיות שימושי יותר ל־Execution מאשר ל־Alpha

‏שתי שאלות נפרדות:

```text
Alpha:
Does this state predict favorable move?

Execution:
Given a valid trade intent, how should we execute?
```

‏נבדוק Book features בשני scorecards נפרדים.

‏אין promotion ל־Execution Policy רק משום שה־feature predictively correlated.

---

## ‏22. Microprice + Execution Urgency — Challenger בלבד

‏Hypothesis:

```text
extreme positive microprice offset
→ passive buy becomes less likely to fill before signal expiry
→ greater urgency may preserve edge
```

‏זה Experiment, לא baseline rule.

‏נשווה:

```text
Protected Marketable Limit control
vs
Passive control
vs
Book-aware urgency challenger
```

‏עם אותו Trade Intent ו־Risk Budget.

---

## ‏23. Spread / Tick / Depth Context

‏כל Book result נשמר עם:

```text
spread_ticks
spread_bps
top_total_depth
near_touch_depth
```

‏אותו imbalance ב־one-tick liquid book אינו equivalent לאותו imbalance ב־10-tick thin book.

---

## ‏24. Large-Tick / Small-Tick Segmentation

‏לא נניח transferability מלאה בין symbols.

‏נבדוק לפחות segmentation לפי:

```text
spread/tick regime
liquidity/depth bucket
price/volatility context
```

‏אבל לא נבנה per-symbol model מוקדם מדי.

---

## ‏25. Whole-Market Fast Path

‏לכל Symbol eligible:

```text
book_age_ms
spread_ticks
spread_bps
top_total_depth
top_imbalance
microprice_offset_spread
imbalance_persistence
book_quality
```

‏אלו features זולים יחסית.

‏אם הם אינם incremental, אין הצדקה להוציא כסף/latency על deeper data.

---

## ‏26. Top-N Deep Path

‏רק ל־Top candidates:

```text
L3 / L5 imbalance
near-touch depth shape
depletion rate
replenishment rate
book churn
Book × Flow interaction
cross-feed sanity
our_order_size / near_touch_depth
```

‏Deep analysis צריך להסתיים בתוך Signal TTL; אחרת complexity מזיקה.

---

## ‏27. Freshness Contract

‏נמדוד בנפרד:

```text
event_age
receive_age
book_age
feature_age
decision_age
```

‏Book socket מחובר אינו אומר Snapshot fresh.

‏ב־fast market ה־TTL יכול להיות קצר יותר.

---

## ‏28. Book Half-Life

‏נרצה להעריך:

```text
book_half_life
```

‏ולחשב:

```text
latency_to_half_life_ratio
=
end_to_end_latency / book_signal_half_life
```

‏אם ratio גבוה מדי, Feature predictive עשוי להיות בלתי־ניצל במערכת שלנו.

---

## ‏29. Cost-to-Signal Ratio

‏נמדוד:

```text
expected_execution_cost
/
expected_microstructure_edge
```

‏Microprice signal של fraction מה־spread אינו שימושי אם spread, slippage, fees ו־fill risk מוחקים אותו.

---

## ‏30. Tradable Microstructure Edge

‏ה־metric החשוב:

```text
Tradable Microstructure Edge
=
Predictive Edge
- Latency Decay
- Execution Cost
- Fill Risk
```

‏לא next-tick accuracy.

---

## ‏31. Labels

‏נפריד:

```text
future_mid_return
future_bid_return
future_ask_return
future_executable_return
```

‏Mid label טוב למחקר microstructure, אך promotion trading-related חייב להיבדק עם executable labels.

‏ל־long entry למשל, benchmark execution-aware צריך לכבד לפחות:

```text
entry side ≈ ask / modeled fill
exit side ≈ bid / modeled fill
```

‏בהתאם ל־Execution Policy.

---

## ‏32. Horizons

‏נבדוק לפי data fidelity:

```text
100ms / 250ms / 500ms
1s
2s
5s
10s
30s
```

‏אבל horizons שאינם exploitable אצלנו אינם Promotion evidence גם אם predictive power קיים בהם.

---

## ‏33. Microprice Calibration

‏נבנה buckets / smooth curves של:

```text
microprice_offset
→ future outcome
```

‏ונבדוק:

```text
monotonicity
sample size
confidence interval
regime stability
```

‏לא נכריח linear relationship.

---

## ‏34. Imbalance Calibration

‏גם:

```text
imbalance bucket
→ future executable outcome
```

‏Extreme imbalance נבדק בנפרד כי הוא יכול להיות:

```text
real pressure
thin depth
cancel-prone liquidity
data error
```

---

## ‏35. Episode-Based Evaluation

‏כדי לא לספור 500 updates באותו event כ־500 independent samples, נגדיר:

```text
ImbalanceEpisode
- start
- end
- max_imbalance
- mean_imbalance
- persistence
- flip_count
- price_move_during
- forward_outcome
```

‏זה מפחית sample-size illusion.

---

## ‏36. Cross-Sectional Context

‏Ranking Book features חייב לשמור:

```text
rank_as_of
eligible_universe_size
fresh_book_symbols
fresh_book_coverage_ratio
book_mode_distribution
```

‏אם רק subset קטן טרי:

```text
book_rank_trusted = false
```

‏אין Top1 אמין מתוך universe חלקי.

---

## ‏37. Relative Book Context

‏אפשר לחקור:

```text
symbol_imbalance - market_median_imbalance
```

‏או percentiles point-in-time.

‏אסור לחשב percentile עם מידע עתידי של סוף היום.

---

## ‏38. Market / Regime Conditioning

‏נבדוק Book behavior לפי:

```text
open / midday / close
normal / fast market
liquidity bucket
volatility bucket
spread regime
```

‏אבל segmentation נכנס לאחר baseline, כדי לא ליצור sample starvation.

---

## ‏39. Data Provenance

‏כל Book Feature Snapshot כולל:

```text
provider
feed
schema_version
book_builder_version
feature_version
book_fidelity
book_scope
sampling_mode
as_of
```

‏Provider/feed change הוא experiment boundary.

---

## ‏40. L1 vs L2 vs MBO

### ‏L1

‏מספיק ל־first experiment:

```text
best bid/ask prices and sizes
```

### ‏L2 / MBP

‏מאפשר:

```text
multi-level depth
shape
depletion/replenishment approximations
```

### ‏MBO

‏יכול לשפר queue/order-level reconstruction כאשר venue/feed מאפשרים.

‏אבל:

```text
MBO != perfect queue truth
```

‏בגלל hidden liquidity, venue semantics, routing ו־data limitations.

---

## ‏41. No Silent Degradation

‏אם model הוכשר על L2:

```text
L2 unavailable
```

‏לא עושים:

```text
switch to L1
keep same score semantics
```

‏במקום:

```text
BOOK_MODE=L1_DEGRADED
feature availability changes
model compatibility re-evaluated
```

---

## ‏42. Feature Availability Contract

‏Decision Engine מקבל:

```text
feature_name
value?
valid
quality
as_of
mode
version
invalid_reason?
```

‏ולא raw decimal ללא context.

---

## ‏43. `BookBuilder` Architecture

```text
Raw Market Events
→ Canonical Book Events
→ Partitioned / Single-Writer BookBuilder
→ Immutable Book Snapshot
→ Book Feature Engine
→ Feature Cache
→ Decision Snapshot
```

‏Per-symbol state צריך owner לוגי יחיד כדי למנוע torn state/races.

---

## ‏44. Replay Parity

‏Live ו־Replay משתמשים באותו `BookBuilder` ו־Feature Engine ככל האפשר.

‏Replay חייב לשחזר:

```text
event ordering
late events
gaps
resnapshot boundaries
book mode
formula version
```

‏Same stream + same versions חייב להפיק אותו state trace.

---

## ‏45. Late Events

‏Event שהגיע אחרי Decision:

- ‏נשמר ל־Audit.
- ‏יכול לשפר historical reconstruction בגרסה נפרדת.
- ‏אינו רשאי “לתקן” רטרואקטיבית את מה שה־Live ידע בזמן ההחלטה.

‏כך שומרים point-in-time honesty.

---

## ‏46. Decision Evidence IDs

‏נחבר:

```text
book_snapshot_id
book_feature_snapshot_id
decision_id
order_intent_id
```

‏לכל Decision.

‏כך RCA יכול לאתר את ה־Book המדויק ששימש את ההחלטה.

---

## ‏47. Book Drift Across Execution

‏נשמור:

```text
book_at_decision
book_before_submit
book_at_ack
book_at_fill
```

‏ונגזור:

```text
signal_to_submit_imbalance_drift
signal_to_submit_microprice_drift
submit_to_fill_book_drift
```

‏זה מפריד Prediction failure מ־Execution latency failure.

---

## ‏48. Pre-Submit Recheck

‏Book-aware Challenger רשאי לבצע recheck קצר:

```text
book still valid?
book still fresh?
spread still acceptable?
price budget still valid?
signal TTL still valid?
```

‏אבל Deep re-analysis שאוכל את Signal TTL הוא Anti-Pattern.

---

## ‏49. Book Confirmation Gate — לא Baseline

‏אפשר לחקור:

```text
reject if strong opposing book pressure
```

‏אבל לא נכניס hard threshold כמו:

```text
imbalance < 0.60 => reject
```

‏ללא threshold curve, robust region ו־OOS evidence.

---

## ‏50. Book in Ranking — Challenger

‏ניסוי אפשרי:

```text
Rank baseline
vs
Rank baseline + top imbalance
vs
Rank baseline + microprice
```

‏ואז לבדוק:

```text
Top1 outcome
TopN overlap
rank churn
candidate persistence
selection regret
net executable outcome
```

---

## ‏51. Book in Execution — Separate Challenger

‏ניסוי execution נפרד:

```text
Same candidate / same intent
→ baseline execution
vs
→ book-aware urgency / passive decision
```

‏לא מערבבים Candidate Selection ו־Execution Tactic באותו experiment אם אפשר להימנע.

---

## ‏52. Queue Interaction

‏Book size אינו queue position שלנו.

‏ל־passive Order נשמור בנפרד:

```text
visible_queue_ahead_estimate
queue_confidence
fill_probability_before_deadline
```

‏בהתאם ל־Segment 38.

‏Top imbalance אינו תחליף ל־Queue Model.

---

## ‏53. Capacity / Size Context

‏נמדוד:

```text
our_order_size / top_depth
our_order_size / near_touch_depth
```

‏Prediction חיובי אינו executable אם הכמות שלנו גדולה מדי ביחס ל־visible depth / capacity.

---

## ‏54. Hidden Liquidity Interaction

‏Displayed Book אינו full liquidity.

‏בהתאם ל־Segment 40:

```text
Displayed = Observed
Hidden/Reserve = Unknown or Inferred unless evidence exists
```

‏Microprice אינו מתחשב hidden liquidity שאיננו רואים.

---

## ‏55. Sweep / Impact Estimate

‏ל־marketable execution ניתן לחשב displayed-depth estimate של:

```text
expected_levels_consumed
visible_depth_weighted_price
```

‏אבל זה Estimate בלבד:

```text
displayed depth at decision
!= guaranteed depth at fill
```

---

## ‏56. Data Modes for Research

‏נשווה לפחות:

```text
B0 — No Book Model
B1 — L1 Book Model
B2 — L1 + Dynamics
B3 — L3/L5 Depth
B4 — L2 Dynamics / Book×Flow
B5 — MBO / Venue-Specific
```

‏כל result יציין Fidelity.

---

## ‏57. Historical / Live Parity

‏אם Live משתמש L2 אבל historical research רק L1:

```text
same_strategy = false
```

‏עד שמוכיחים parity/compatibility.

‏אין לערבב Feature semantics בין environments.

---

## ‏58. Required Data / Evidence

### ‏ל־L1 baseline

```text
best bid/ask prices
best bid/ask sizes
event/receive timestamps
source identity
quality/freshness
spread
tick size
```

### ‏ל־dynamic L1

```text
ordered updates or sufficiently fine snapshots
book versioning
persistence/churn history
```

### ‏ל־L2 challenger

```text
multi-level depth
reliable event/snapshot semantics
mode/fidelity metadata
```

### ‏ל־depletion/replenishment causal interpretation

‏עדיף event-level semantics; snapshot-only conclusions נשמרות כ־Inferred.

---

## ‏59. Required Research Labels

```text
future_mid_return
future_bid/ask move
future_executable_return
mfe
mae
time_to_first_profit
time_to_target
fill_probability
implementation_shortfall
post-fill_markout
```

‏Book family חייבת להיבדק גם על Prediction וגם על Execution economics.

---

## ‏60. Core Metrics

### ‏Data / Book health

```text
book_snapshot_age_ms
book_update_rate
invalid_book_ratio
sequence_gap_rate
resnapshot_count
book_mode_distribution
fresh_book_coverage_ratio
```

### ‏Features

```text
imbalance_distribution
microprice_offset_distribution
persistence_distribution
flip_count_distribution
book_churn
```

### ‏Ranking

```text
rank1_imbalance
rank1_microprice_offset
rank1_book_age
rank1_book_quality
rank1_book_mode
candidate_book_persistence
```

### ‏Decision impact

```text
would_book_change_candidate
would_book_change_trade_no_trade
would_book_change_execution_mode
decision_impact_rate
```

### ‏Economic

```text
net_return_by_imbalance_bucket
net_return_by_microprice_bucket
fill_rate_by_book_state
missed_opportunity_by_book_gate
execution_shortfall_by_book_state
```

---

## ‏61. Signal Half-Life Metrics

```text
book_signal_half_life
book_age_at_decision
book_age_at_submit
book_age_at_fill
latency_to_half_life_ratio
```

‏Feature predictive קצר מדי עבור ה־stack שלנו נדחה גם אם correlation נראה טוב.

---

## ‏62. Failure Modes

### ‏F1 — Huge Bid interpreted as “Demand”

‏בעיה:

```text
large snapshot → bullish assumption
```

‏פתרון:

```text
persistence + flow + price response + quality
```

### ‏F2 — Tiny denominator creates extreme ratio

‏פתרון:

```text
total depth context + confidence
```

### ‏F3 — Torn snapshot

‏פתרון:

```text
immutable versioned snapshot / atomic reducer
```

### ‏F4 — Sequence gap

‏פתרון:

```text
invalidate → resnapshot → warm → re-enable
```

### ‏F5 — Missing interpreted as zero

‏פתרון:

```text
nullable feature + invalid reason
```

### ‏F6 — Locked/crossed microprice calculated normally

‏פתרון:

```text
validation gate
```

### ‏F7 — L2 disappears and score silently becomes L1

‏פתרון:

```text
explicit BOOK_MODE + model compatibility
```

### ‏F8 — Microprice double-counted with imbalance

‏פתרון:

```text
correlation + ablation
```

### ‏F9 — Deep Book improves prediction but adds too much latency

‏פתרון:

```text
latency tax in promotion criteria
```

### ‏F10 — Strong predictive Book but poor passive queue

‏פתרון:

```text
separate prediction pressure from queue feasibility
```

### ‏F11 — Extreme snapshot disappears before submit

‏פתרון:

```text
TTL + persistence + pre-submit recheck
```

### ‏F12 — Snapshot-only replenishment treated as known cause

‏פתרון:

```text
Observed / Inferred distinction
```

---

## ‏63. Golden Scenarios

1. ‏Strong Bid pressure + Buy Flow + price advance.
2. ‏Strong Buy Flow + Ask replenishment + flat price.
3. ‏Huge displayed Bid appears then disappears without meaningful execution.
4. ‏Sequence gap invalidates Book until resnapshot.
5. ‏Book flips positive→negative between Decision and Submit.
6. ‏Strong prediction but tiny visible depth blocks execution feasibility.
7. ‏Microprice extreme with very small total depth.
8. ‏Locked Book.
9. ‏Crossed Book caused by timing/feed mismatch.
10. ‏L2 unavailable after model was trained on L2.
11. ‏Late event changes historical reconstruction but not live Decision.
12. ‏Book Feature remains predictive at Decision but decays before Fill.
13. ‏Bid-heavy book with large passive queue ahead.
14. ‏Book and Flow disagree but price remains stable.
15. ‏Fast-market churn makes previously fresh Snapshot unusable.

---

## ‏64. Property Tests

```text
if denominator valid:
    -1 <= normalized_imbalance <= 1

swap(bid, ask):
    imbalance sign flips

if bid_size == ask_size:
    imbalance == 0

valid unlocked book:
    bid <= microprice <= ask

if bid_size == ask_size:
    microprice == mid

with fixed prices:
    increasing bid_size moves microprice toward ask

invalid book:
    book-dependent feature cannot be marked valid

missing side:
    imbalance != synthetic extreme

sequence gap:
    quality != GOOD until rebuilt

future event:
    cannot alter historical as-of snapshot
```

---

## ‏65. Production / Research Invariants

```text
No Book Feature without source identity
No Book Feature without as_of
No stale value masquerading as current
No decision dependency on invalid Book
No silent L2→L1 semantic fallback
No microprice on unsupported locked/crossed state
No future event in point-in-time snapshot
No negative canonical size
Bids sorted descending
Asks sorted ascending
Formula version known
Book mode known
```

---

## ‏66. Replay Tests

‏Replay חייב לכסות:

```text
normal book updates
out-of-order event
duplicate event
sequence gap
resnapshot
book flip
locked/crossed state
provider reconnect
L2 degradation
fast-market burst
late event
```

‏First-divergence analysis מתחיל ב־Book state, לא ב־final PnL.

---

## ‏67. Observability / RCA

‏לכל Candidate חשוב נשמור `Book Movie` קצר:

```text
before decision
at decision
before submit
at ack
at fill
after fill
```

‏Decision Packet יכלול:

```text
book_snapshot_id
book_mode
book_quality
book_age
spread
top_depth
top_imbalance
microprice_offset
persistence
flow context
our order size / depth
```

---

## ‏68. RCA Questions

‏אם Candidate נכשל:

1. ‏האם Book היה valid/fresh?
2. ‏האם pressure היה Snapshot רגעי או persistent?
3. ‏האם Flow אישר או סתר?
4. ‏האם price הגיב?
5. ‏האם Book flip קרה לפני submit?
6. ‏האם ה־Fill הגיע אחרי שה־signal מת?
7. ‏האם queue feasibility הייתה שונה מ־prediction pressure?
8. ‏האם L1 הסתיר structure שהיה נראה ב־L2?
9. ‏האם deeper data באמת היה משנה Decision בזמן?
10. ‏האם התוצאה נטו מצדיקה את latency/data cost?

---

## ‏69. Near-Miss / Selection Regret

‏נשמור גם Candidates שנדחו.

‏נבדוק:

```text
Did Book data correctly block a bad candidate?
Did it wrongly block a good one?
Would #2 have been more executable than #1?
Did deep Book improve selection or just explain it after the fact?
```

‏כך מודדים גם Safety/Filter Opportunity Cost.

---

## ‏70. Controlled Experiment Ladder

```text
E0 — Existing champion, no Book feature
E1 — + top imbalance shadow
E2 — + microprice offset
E3 — + persistence / churn
E4 — + Book×Flow interaction
E5 — + L3/L5 depth
E6 — + depletion/replenishment
E7 — execution-specific Book challenger
E8 — MBO / venue-specific specialist
```

‏משנים family אחת בכל פעם ככל שניתן.

---

## ‏71. Promotion Criteria

‏Book feature מתקדם רק אם:

1. ‏מוסיף incremental predictive value מעל baseline.
2. ‏השיפור נשאר OOS / walk-forward.
3. ‏השיפור נשאר לאחר costs/fill realism.
4. ‏Effect אינו תלוי בנקודת threshold קסומה.
5. ‏Book quality / missingness אינם יוצרים hidden bias.
6. ‏Signal half-life ארוך מספיק ביחס ל־end-to-end latency.
7. ‏Decision impact rate משמעותי מספיק להצדיק complexity.
8. ‏Tail outcomes אינם נהיים מסוכנים יותר.
9. ‏Replay/Shadow behavior reproducible.
10. ‏Latency/CPU/data-cost tax מוצדק כלכלית ומערכתית.

---

## ‏72. Rejection Criteria

‏נדחה / נוריד priority אם:

- ‏Microprice predicts רק sub-100ms movement שאיננו יכולים לנצל.
- ‏Feature משפר mid labels אך לא executable/net labels.
- ‏L2 אינו מוסיף ערך משמעותי ל־L1.
- ‏Decision impact rate כמעט אפס.
- ‏Benefit נעלם אחרי latency.
- ‏Benefit מופיע רק ב־sample קטן/regime יחיד.
- ‏High missing/degraded rate הופך את model לא יציב.
- ‏Complexity מקשה Replay/RCA יותר מהערך שהיא מוסיפה.
- ‏Threshold sensitivity גבוהה מדי.
- ‏Book data cost אינו מוצדק.

---

## ‏73. Recommended Priorities

### ‏`P0`

```text
Book validity / freshness
Missing != zero
sequence-gap invalidation
immutable snapshot
provenance / fidelity
no stale feature dependency
point-in-time correctness
```

### ‏`P1`

```text
fresh L1
spread validation
top imbalance
microprice offset
short persistence
book quality
Shadow evaluation
```

### ‏`P2`

```text
L3/L5 depth
near-touch depth
depletion/replenishment
Book×Flow interactions
book drift Decision→Fill
```

### ‏`P3`

```text
distance-weighted depth
dynamic TTL
book-aware execution challenger
cross-feed / venue diagnostics
```

### ‏`P4`

```text
MBO/direct-feed specialist models
advanced queue-aware book models
learned microstructure feature selection
venue-specific predictors
```

---

## ‏74. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏MBO לכל השוק.
- ‏Direct feeds רבים.
- ‏100+ Book features.
- ‏Custom multi-level Microprice formula עם עשרות weights.
- ‏Per-symbol tuning.
- ‏Spoof/manipulation classifier.
- ‏Hidden-liquidity inference כ־Fact.
- ‏Book-driven automatic order tactic בלי separate experiment.
- ‏Hard Book gate עם threshold אינטואיטיבי.
- ‏Full depth processing לכל 4,000 symbols בכל event אם Fast Path מספיק.

---

## ‏75. What to Add Later

‏רק לאחר Evidence:

- ‏L3/L5 depth shape.
- ‏depletion/replenishment dynamics.
- ‏Book×Flow interaction families.
- ‏dynamic TTL לפי churn/volatility.
- ‏queue-aware execution context.
- ‏MBO / direct feeds.
- ‏venue-specific features.
- ‏capacity-aware depth model.
- ‏learned weighting / microprice variants.

---

## ‏76. User-Specific Application

‏לרובוט שלנו יש שלושה מאפיינים שמכתיבים את ההמלצה:

1. ‏Universe רחב של אלפי מניות.
2. ‏Signal horizon של שניות עד דקות, לא microsecond HFT.
3. ‏מטרה לבחור Candidate יחיד במהירות ולבדוק executability לפני שה־Edge מת.

‏לכן ה־Baseline המעשי:

```text
Whole Market
→ Momentum / Activity Fast Scan
→ Fresh L1 Book Context
→ Top Imbalance + Microprice + Spread
→ Ranking / Top-N
→ Deep Book only for shortlisted candidates
→ Execution Readiness
→ Risk / Safety
→ Paper / Shadow Intent
```

‏אנחנו לא צריכים לנצח co-located HFT על first microsecond.

‏אנחנו צריכים למצוא Book information ש־half-life שלה ארוך מספיק כדי לשרוד:

```text
feed latency
processing
ranking
decision
broker validation
submit
fill
```

---

## ‏77. Concrete Baseline Contract

```text
BOOK_BASELINE_V1

Required inputs:
- fresh L1 bid/ask
- top sizes
- source identity
- event/receive timestamps
- spread
- tick size

Required validation:
- bid/ask present
- positive sizes
- bid < ask
- age within configured research budget
- no known sequence/data integrity failure

Features:
- spread_ticks
- spread_bps
- top_total_depth
- top_imbalance
- microprice
- microprice_offset_spread
- imbalance_persistence
- book_age_ms
- book_quality

Decision role:
- SHADOW / DIAGNOSTIC initially

Forbidden:
- direct live-risk authorization
- stale fallback
- hidden-liquidity certainty
- queue-position inference from imbalance alone
```

---

## ‏78. Confidence

### ‏High confidence

- ‏Book validity/freshness/provenance חייבים להיות explicit.
- ‏Missing אינו Zero.
- ‏Sequence gap חייב לפסול reconstructed state עד recovery.
- ‏Microprice אינו Fair Value.
- ‏Displayed depth אינו promise.
- ‏Prediction pressure ו־Queue feasibility חייבים להישאר נפרדים.
- ‏L1-first עדיף לפני השקעה ב־L2/MBO בהיעדר Evidence.

### ‏Medium-high confidence

- ‏Top Imbalance + Microprice + persistence הם baseline research family טובה ופשוטה.
- ‏Fast Path / Top-N Deep Path מתאים לארכיטקטורה של whole-market scanner שלנו.
- ‏Book×Flow interaction כנראה informative יותר מכל snapshot scalar לבדו, אך עדיין דורש validation.

### ‏Low / Unproven

- ‏Threshold כלשהו ל־imbalance.
- ‏Microprice horizon exploitable אצלנו.
- ‏Value של L3/L5 לעומת L1.
- ‏Dynamic TTL formula.
- ‏Book-aware execution urgency.
- ‏MBO/direct-feed ROI.
- ‏Custom multi-level microprice.

---

## ‏79. Time-Sensitive Facts

‏במקטע הזה לא קיבענו Broker/Venue limit, exchange rule, fee, entitlement או API capability חדש שתלוי בזמן.

‏לכן לא נדרש Web verification חדש.

‏לפני שימוש ב־feed מסוים יש לאמת בנפרד:

```text
book scope
NBBO vs venue-specific semantics
L2 depth entitlement
MBO/MBP semantics
sequence behavior
historical availability
redistribution / storage rights
```

‏אלה facts של Provider/Venue, לא assumptions של Strategy.

---

## ‏80. Relationship to Earlier Sheets

### ‏Segment 38 — Queue Position

‏ה־Book נותן displayed depth context; ‏Queue Position נשאר uncertainty model נפרד.

### ‏Segment 40 — Hidden / Reserve / ATS

‏Displayed depth אינו full liquidity; hidden/reserve state נשאר Unknown/Inferred ללא evidence.

### ‏Segment 43 — Halts / LULD / Fast Markets

‏ב־Fast Market Book half-life מתקצר ו־staleness/processing lag הופכים קריטיים יותר.

### ‏Segment 44 — Advanced Order Flow

‏Flow הוא aggression/executed behavior; ‏Book הוא passive/displayed state.

‏הקומבינציה המרכזית:

```text
Aggression
× Displayed Liquidity Response
× Price Response
```

### ‏Segment 46 — Adverse Selection

‏המקטע הבא יבדוק האם דווקא Fill בתנאי Book/Flow מסוימים מנבא תנועה נגדנו, דרך post-fill markout ו־fill-conditioned outcomes.

---

## ‏81. Testing Strategy

### ‏Unit

- ‏imbalance bounds/symmetry.
- ‏microprice bounds.
- ‏equal sizes → mid.
- ‏invalid denominator.
- ‏missing side.
- ‏locked/crossed validation.
- ‏sorted levels.
- ‏negative size rejection.
- ‏version/provenance propagation.

### ‏Reducer / BookBuilder

- ‏ordered updates.
- ‏duplicate event.
- ‏out-of-order event.
- ‏sequence gap.
- ‏resnapshot.
- ‏mode switch.
- ‏reconnect.

### ‏Feature

- ‏persistence.
- ‏flip count.
- ‏L3/L5 aggregation.
- ‏microprice normalization.
- ‏quality propagation.

### ‏Integration

```text
Market Event
→ BookBuilder
→ Snapshot
→ Feature Engine
→ Candidate Snapshot
→ Decision Record
```

### ‏Replay

‏Golden corpus של normal, gap, flip, absorption-like, stale, locked/crossed, degradation ו־fast-market scenarios.

---

## ‏82. Operational Reason Codes

```text
BOOK_UNAVAILABLE
BOOK_STALE
BOOK_GAPPED
BOOK_INVALID
BOOK_LOCKED
BOOK_CROSSED
BOOK_INSUFFICIENT_DEPTH
BOOK_MODE_DEGRADED
BOOK_FEATURE_EXPIRED
BOOK_SIGNAL_FLIPPED
BOOK_RANK_UNTRUSTED
BOOK_EXECUTION_CAPACITY_FAILED
```

‏Reason codes נשמרים גם ב־NO_TRADE ledger לצורך false-safety / missed-opportunity analysis.

---

## ‏83. Recommended Summary

```text
Observed Displayed Book
→ Validate / Version / Timestamp
→ Fresh L1 Baseline
→ Top Imbalance
→ Microprice Offset
→ Persistence / Churn
→ Flow + Price Response Context
→ Shadow Decision Impact
→ OOS + Executable Labels
→ L3/L5 only if incremental
→ MBO / Venue-Specific only if justified
```

‏ברירת המחדל שלנו היא לא “לקרוא את הספר” כסיפור.

‏היא למדוד ספר חלקי ומשתנה, לדעת כמה אנחנו סומכים עליו, ולדרוש שהמידע יוכיח שהוא שורד את הזמן והעלויות שבין Observation לבין Fill.

‏המשפט שמסכם את ההמלצה:

> ‏**Book Imbalance הוא Evidence על liquidity מוצגת; Microprice הוא transform קצר־טווח של אותה Evidence; רק persistence, interaction עם Flow/Price ו־net execution validation יכולים להפוך אותם ל־Feature שימושי עבור המערכת שלנו.**
