# ‏40 — Recommendation Sheet: Hidden / Reserve / Midpoint / Pegged / ATS

> ‏מקור לימודי עיקרי: `../40-HIDDEN-RESERVE-MIDPOINT-PEGGED-AND-ATS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ל־Execution כאשר חלק מה־liquidity אינו גלוי במלואו, כאשר מחיר Order נגזר מ־reference דינמי, וכאשר execution עשוי להתרחש ב־midpoint או ב־ATS. המטרה היא למנוע מהמערכת להפוך `hidden`, ‏`midpoint`, ‏`peg` או `ATS` למילות קסם, ולחייב Evidence, price protection, capability verification, attribution ו־fallback מפורש.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏החלטת ה־Baseline היא להפריד באופן קשיח בין שלושה סוגי ידע:

```text
OBSERVED
INFERRED
UNKNOWN
```

‏ולא להניח ש־Displayed Book הוא כל ה־liquidity הזמינה לביצוע.

‏המודל:

```text
Displayed Market State
→ Execution Readiness
→ Liquidity / Reference-Price Interpretation
→ ExecutionPolicy
→ Capability Check
→ Protected Tactic
→ Broker / Venue
→ Real Order / Fill Events
→ Attribution
→ Calibration / RCA
```

‏העיקרון המחייב:

```text
Visible liquidity is evidence.
Hidden liquidity is uncertainty.
Midpoint is a reference price, not guaranteed liquidity.
Pegging is an execution mechanism, not alpha.
ATS is an execution venue class, not a promise of better fills.
Broker fill reports remain execution truth.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏`Observed / Inferred / Unknown`

‏כל execution model ישמור במפורש מה ראינו ומה רק הסקנו.

‏דוגמאות:

```text
observed_bid
observed_ask
observed_displayed_size
observed_trade

inferred_hidden_liquidity_pattern
inferred_replenishment_pattern
inferred_midpoint_fill_probability

unknown_true_hidden_size
unknown_true_queue_position
unknown_counterfactual_ATS_fill
```

‏אסור לכתוב:

```text
hidden_size = 8500
```

‏כאילו מדובר ב־Fact, כאשר אין לנו evidence ישיר.

### ‏`P0 — Required`: Broker Fill Truth גובר על Liquidity Model

‏ה־Market Data Layer מתארת מה יכולנו לראות.

‏ה־Broker / Execution reports מתארים מה קרה לנו בפועל.

```text
Market Observation Truth
!=
Execution Truth
```

‏Fill אמיתי לעולם לא נגזר רק ממודל hidden/midpoint/queue.

### ‏`P0 — Required`: Simple Execution נשאר Baseline

‏לפני tactics מתקדמות נשמור controls פשוטים:

```text
Control A = Protected Marketable Limit
Control B = Simple Passive
```

‏כל advanced tactic חייבת להוכיח ערך מעליהם.

### ‏`P1 — Preferred First Challenger`: ‏`Midpoint-first`

‏מבין הטקטיקות בפרק, `Midpoint-first` הוא ה־Challenger הראשון הסביר למחקר כאשר:

- ‏ה־spread משמעותי יחסית ל־edge.
- ‏ה־signal אינו מתכלה מהר מדי.
- ‏יש capability אמיתית.
- ‏ניתן למדוד Fill/No-Fill/Latency/Markout.

‏ה־policy אינה:

```text
always midpoint
```

‏אלא:

```text
midpoint attempt
→ explicit TTL
→ recheck signal / edge
→ explicit fallback or abort
```

### ‏`P2 — Challenger`: Native Pegged

‏Pegged order נכנסת למחקר רק כאשר:

- ‏reference semantics ידועות.
- ‏price cap/floor מוגדרים.
- ‏reference freshness נמדדת.
- ‏repricing telemetry קיימת.
- ‏ה־Broker/Venue capability מאומתת.

‏Native Pegging אינה “free client-side repricing”.

‏היא התנהגות Broker/Venue-specific שחייבת Contract.

### ‏`P3/P4 — Evidence Only`: Reserve / ATS

‏`Reserve/Iceberg` ייכנס רק כאשר quantity/executable capacity מוכיחים שהסתרת size או slicing פותרים בעיה אמיתית.

‏`ATS` ייכנס רק כאשר:

- ‏יש route/capability מוכחים.
- ‏אפשר לתעד outcome.
- ‏יש sample מספיק.
- ‏ה־incremental value מעל baseline ברור.

---

## ‏3. Hierarchy

```text
Baseline
→ Protected Marketable Limit
→ Simple Passive

Preferred Challenger
→ Midpoint-first with TTL + explicit fallback

Challenger
→ Native Pegged with price cap

Advanced Option
→ Reserve / Iceberg when size justifies
→ ATS-specific policy with measured evidence

Specialist Option
→ Venue-specific hidden-liquidity models
→ calibrated ATS / midpoint fill models
→ advanced reserve/replenishment modeling

Avoid Unless Evidence
→ assume hidden liquidity
→ always-midpoint
→ peg without hard cap
→ reserve by default
→ ATS because it sounds sophisticated
→ silent fallback between semantics
```

---

## ‏4. Priority Map

| Priority | Recommendation |
|---|---|
| `P0` | ‏Observed/Inferred/Unknown separation |
| `P0` | ‏Broker fill truth remains authoritative |
| `P0` | ‏Capability check before advanced tactic |
| `P0` | ‏Price protection / max chase / TTL |
| `P0` | ‏No silent fallback |
| `P0` | ‏Unknown-effect reconciliation |
| `P0` | ‏Native vs Synthetic distinction |
| `P1` | ‏Simple execution controls preserved |
| `P1` | ‏Fill attribution with confidence |
| `P1` | ‏Reference-price quality gate |
| `P1` | ‏No-fill / missed-opportunity dataset |
| `P1` | ‏Midpoint-first challenger |
| `P2` | ‏Native Pegged challenger |
| `P2` | ‏Hidden-liquidity sensitivity models |
| `P3` | ‏Reserve when capacity evidence requires it |
| `P3` | ‏ATS experiment with attribution |
| `P4` | ‏Venue-specific hidden/ATS modeling |

---

## ‏5. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Displayed liquidity אינה בהכרח כל executable interest.
- ‏Reserve/Iceberg יכול להציג רק חלק מהכמות הכוללת.
- ‏Midpoint הוא reference בין Bid ו־Ask; עצם קיומו אינו מבטיח contra liquidity.
- ‏Pegged order משנה את המחיר בהתאם ל־reference ול־semantics של Broker/Venue.
- ‏ATS הוא execution venue מסוג שונה מ־national securities exchange; לא כל ATS הוא זהה ולא כל non-displayed execution הוא אותו מנגנון.
- ‏Fill אמיתי יכול להתרחש במחיר או liquidity שלא נראו בצורה מלאה ב־public displayed book.
- ‏Hidden/Reserve/Pegged priority semantics יכולים להשתנות לפי venue/order type.

### ‏Judgment

- ‏הרובוט שלנו צריך להתחיל מ־simple controls ולא מ־dark/hidden optimization.
- ‏Midpoint-first הוא ה־advanced challenger הראשון שכדאי לבדוק כאשר spread ו־TTL מצדיקים זאת.
- ‏Pegged orders דורשות hard price boundary בכל מקרה.
- ‏Reserve אינו מוצדק אוטומטית עבור quantity קטנה.
- ‏ATS optimization הוא שלב מאוחר יותר מאשר הוכחת scanner/execution baseline.
- ‏`UNKNOWN` עדיף על inference מזויף.

### ‏Hypothesis

- ‏Midpoint-first עשוי לשפר Net Execution Value ב־wide-spread / medium-urgency buckets.
- ‏Native Pegging עשוי להפחית client-side message churn בלי להגדיל stale fills.
- ‏Reserve עשוי להיות בעל ערך רק כאשר quantity גדלה ביחס ל־displayed/executable capacity.
- ‏ATS interaction עשויה לשפר price outcome ב־contexts מסוימים, אך ייתכן שתוסיף latency/no-fill/adverse-selection cost.

‏כל Hypothesis דורש Controlled Experiment.

---

## ‏6. המודל המנטלי: Displayed ≠ Executable ≠ Total Interest

```text
Displayed Book
        ↓
Observed Liquidity
        ↓
+ Hidden / Reserve / Other Venues / ATS / Replenishment
        ↓
Unknown Full Executable Interest
        ↓
Actual Broker Execution
```

‏לכן:

```text
displayed_size
```

‏הוא feature של executability — לא capacity guarantee.

‏גם ההפך נכון:

```text
small displayed_size
```

‏אינו הוכחה שאין יותר executable liquidity.

---

## ‏7. Domain Model לליקווידיות

‏נשמור כאשר ניתן:

```text
LiquiditySource
{
  LIT_DISPLAYED,
  LIT_HIDDEN,
  RESERVE,
  MIDPOINT,
  ATS,
  INTERNAL_OR_OTHER,
  UNKNOWN
}
```

‏ונפריד Visibility:

```text
OrderVisibility
{
  DISPLAYED,
  PARTIAL,
  HIDDEN,
  UNKNOWN
}
```

‏ה־`UNKNOWN` הוא first-class value.

---

## ‏8. Hidden Liquidity — Recommendation

‏Hidden liquidity אינה Feature שה־Scanner צריך “לנחש” לכל השוק.

‏Baseline:

```text
Broad scan
→ Top-N
→ execution enrichment
→ hidden-liquidity diagnostics only where relevant
```

‏אם נראה pattern של replenishment או execution surprise:

```text
possible_hidden_liquidity = true
hidden_inference_confidence = LOW / MEDIUM / HIGH
```

‏אבל לא נייצר hidden-size truth שאין לנו.

---

## ‏9. Replenishment / Iceberg Detection

‏Patterns שימושיים למחקר:

```text
traded_volume > previously displayed size
repeated replenishment at same level
level remains despite repeated executions
visible size returns after depletion
```

‏אבל:

```text
Pattern != proof
```

‏יכול להיות מדובר ב־new independent orders.

‏לכן detection משמש Diagnostic/Feature עם Confidence, לא Truth.

---

## ‏10. Midpoint — Recommendation

‏נגדיר:

```text
mid = (bid + ask) / 2
```

‏רק כאשר Bid/Ask עוברים Quality Gate.

‏Midpoint tactic אינה:

```text
mid exists => fill at mid
```

‏אלא experiment שבו אנו מודדים:

```text
P(fill before TTL)
price improvement if filled
signal age at fill
post-fill markout
missed opportunity if not filled
fallback cost
```

---

## ‏11. Mid Quality Contract

‏נחזיק:

```text
mid_quality
{
  GOOD,
  DEGRADED,
  INVALID
}
```

‏לפחות לפי:

```text
bid_valid
ask_valid
bid_age_ms
ask_age_ms
bid_ask_time_skew_ms
spread_state
locked_or_crossed_state
session_state
```

‏לא מחשבים midpoint execution על quote pair שאינו עקבי מספיק.

---

## ‏12. Midpoint Readiness

```text
candidate_valid
market_data_fresh
bid_valid
ask_valid
mid_quality == GOOD
spread_geometry_useful
signal_alive
risk_approved
safety_allows_entry
broker_ready
capability_supported
route_supported
price_protection_valid
```

‏כל Failure מקבל Reason Code.

---

## ‏13. Midpoint Policy Baseline

‏ה־policy המומלצת למחקר:

```text
MIDPOINT_ATTEMPT
→ wait within explicit TTL
→ observe order + signal + market
→ if fill: record attribution
→ if no fill: recheck
→ fallback explicitly OR abort
```

‏אין fallback implicit.

‏דוגמאות Contract:

```text
fallback = PROTECTED_MARKETABLE_LIMIT
```

‏או:

```text
fallback = NO_TRADE
```

---

## ‏14. Pegged Orders — Recommendation

‏Pegging היא execution mechanism שבו:

```text
order_price = reference_price + offset
```

‏אבל כל Peg Policy חייבת להגדיר:

```text
reference_price_type
offset
rounding_rule
price_cap_or_floor
max_chase
signal_ttl
order_ttl
route_semantics
native_or_synthetic
```

---

## ‏15. ReferencePriceType

```text
NONE
BID
ASK
MID
PRIMARY
BROKER_DEFINED
CUSTOM
```

‏השם אינו מספיק.

‏נדרש Contract שמתאר מה באמת עושה Broker/Venue.

---

## ‏16. Peg Hard Boundary

‏כל Pegged tactic חייבת hard limit:

```text
Buy:
  effective_price <= max_buy_price

Sell:
  effective_price >= min_sell_price
```

‏וגם:

```text
chase_distance <= max_chase
signal_age <= signal_ttl
```

‏אין `peg forever`.

---

## ‏17. Peg Reference Quality

‏לפני/במהלך Peg נמדוד:

```text
reference_price
reference_timestamp
reference_age_ms
reference_source
reference_quality
```

‏אם reference quality מתדרדרת:

```text
RE-EVALUATE / CANCEL / FALLBACK
```

‏לפי policy.

---

## ‏18. Native Pegging מול Synthetic Repricing

‏נשמור distinction:

```text
NATIVE
SYNTHETIC_CLIENT_SIDE
UNKNOWN_IMPLEMENTATION
```

‏Native עשוי להפחית client-side message churn, אך יכול להיות פחות transparent.

‏Synthetic נותן יותר שליטה, אך מוסיף:

- ‏latency.
- ‏cancel/replace races.
- ‏message pressure.
- ‏state/recovery complexity.

‏אין winner מראש.

---

## ‏19. Reserve / Iceberg — Recommendation

‏Reserve רלוונטי רק כאשר קיימת בעיית size אמיתית.

‏נבדוק יחס:

```text
order_quantity / executable_liquidity_estimate
```

‏וגם:

```text
impact sensitivity
completion horizon
partial-fill cost
```

‏אם quantity קטנה מאוד יחסית ל־market capacity:

```text
reserve_complexity_benefit ≈ low
```

‏ולא נוסיף complexity ללא Evidence.

---

## ‏20. Native Reserve מול Synthetic Slicing

```text
Native Reserve
→ broker/venue owns replenishment mechanics

Synthetic Slicing
→ client creates repeated child orders
```

‏Synthetic slicing יוצר:

```text
latency
state transitions
idempotency requirements
crash/recovery risk
signal-decay risk
```

‏לכן לא נציג אותו כאילו הוא שקול ל־native reserve.

---

## ‏21. ATS — Recommendation

‏ATS הוא execution destination, לא Alpha.

‏Baseline:

```text
ATS usage = disabled as strategy assumption
```

‏הוא הופך Eligible research path רק כאשר:

```text
route capability known
symbol/session eligible
order semantics known
fill attribution available enough
price protection preserved
sample size sufficient
```

---

## ‏22. ATS ≠ Dark Pool באופן אוטומטי

‏נשמור את ההבחנה:

- ‏`ATS` הוא מונח רגולטורי/מבני.
- ‏`Dark` הוא תיאור non-displayed behavior, לא שם זהה לכל ATS.
- ‏לא כל ATS מציג/מתאים liquidity באותה צורה.

‏לכן אין Domain value יחיד שמניח:

```text
ATS == MIDPOINT == DARK
```

---

## ‏23. Lit / Hidden / ATS Comparison

‏נשווה באותו Benchmark:

```text
Fill Rate
Partial Fill Rate
Time to First Fill
Time to Full Fill
Price Improvement
Implementation Shortfall
Fees / Rebates
Post-Fill Markout
No-Fill Opportunity Cost
Unknown-State Rate
Operational Failure Rate
Net Execution Value
```

‏לא נשווה Average Fill Price בלבד.

---

## ‏24. Net Execution Value

‏ה־objective המרכזי:

```text
Net Execution Value
=
Price Improvement
- Delay Cost
- Missed Opportunity
- Slippage
- Adverse Selection
- Fees
- Operational Risk Cost
```

‏זו מסגרת conceptual, לא נוסחה סופית.

---

## ‏25. Price Improvement אינו KPI מספיק

‏Fill במחיר טוב יותר מה־Ask יכול להיות גרוע אם:

- ‏המתנו יותר מדי.
- ‏ה־signal נחלש.
- ‏ה־rank קרס.
- ‏אחרי ה־fill היה adverse markout.

‏לכן:

```text
better price != better execution
```

---

## ‏26. Markout הוא Guardrail מרכזי

‏לכל tactic נמדוד לפי horizon מתאים:

```text
markout_100ms
markout_500ms
markout_1s
markout_2s
markout_5s
```

‏ולא נניח ש־midpoint/hidden fill הוא “טוב” בגלל price improvement בלבד.

---

## ‏27. No-Fill נשמר במלואו

‏No-Fill הוא Outcome מחקרי:

```text
NO_FILL
→ what happened after TTL?
→ price ran in our favor?
→ price reversed?
→ fallback would have helped?
```

‏בלי No-Fills מתקבלת Selection Bias קשה לטובת passive/midpoint tactics.

---

## ‏28. Fill Attribution

‏לכל Fill נשמור, כאשר ניתן:

```text
liquidity_source
liquidity_source_confidence
venue
route_type
order_type
visibility_type
passive_or_aggressive
reference_price_type
native_or_synthetic
```

‏אם לא ידוע:

```text
liquidity_source = UNKNOWN
```

---

## ‏29. Normalized + Raw Evidence

‏לכל Broker event משמעותי:

```text
NormalizedDomainEvent
+
RawBrokerEvidence
```

‏בלי secrets.

‏כך אפשר לשפר parsing/attribution בעתיד בלי לאבד evidence מקורית.

---

## ‏30. Current Verification Snapshot — 2026-10-27

‏ה־Snapshot הבא הוא time-sensitive ואינו Contract נצחי.

### ‏IBKR `MidPrice`

‏IBKR מתעדת כיום `MidPrice` עבור U.S. Stocks/ETFs כ־Smart-routed algo שמנסה לבצע ב־current NBBO midpoint או טוב יותר, עם optional price cap. לפי התיעוד, הוא יכול לנתב כ־Pegged-to-Midpoint, ‏IEX D-Peg, או Relative native/simulated בהתאם לזמינות.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏IBKR `Pegged-to-Midpoint`

‏לפי התיעוד הנוכחי, עבור U.S. stock orders יש לבחור direct routing כדי להשתמש ב־Pegged-to-Midpoint; הוא יכול לכלול limit price cap. Offset support משתנה בין venues.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏IBKR `Relative / Pegged-to-Primary`

‏התיעוד הנוכחי מציג semantics שונות ל־Smart-Routed לעומת Directed orders, כולל התנהגות שונה כאשר reference bid/offer נע. לכן אין לקודד `Pegged-to-Primary` כ־semantic אחיד ללא route context.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏IBKR `Iceberg / Reserve`

‏IBKR מתעדת כיום `Iceberg / Reserve` דרך `Display Size`, עם תמיכה ב־Smart/Directed במוצרים נתמכים; התיעוד מציג את היכולת בעיקר דרך TWS. Capability בפועל חייבת להיאמת לפי API/platform/product/account/route.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏IBKR Hidden

‏IBKR מתעדת Hidden attribute ומציינת שהיא עשויה לדמות Hidden Orders בחלק מה־exchanges. לכן `Hidden` אינו semantic שאנו מניחים שהוא תמיד native venue order.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏IBKR ATS

‏IBKR מתעדת `IBKR ATS` כ־Directed destination ל־U.S. Stocks/ETFs, עם order types כגון Pegged-to-Midpoint, ‏Pegged-to-Best, ‏Relative/Pegged-to-Primary, ‏Pegged-to-Market ו־priced limits. התיעוד גם מציג ATS→SMART reroute option בתנאים מסוימים.

‏מקור רשמי:

`https://www.interactivebrokers.com/en/trading/ordertypes.php`

### ‏ATS regulatory meaning

‏SEC מתארת ATS כמערכת שעונה להגדרת Exchange בחוק אך פועלת תחת exemption ומסגרת Regulation ATS במקום להירשם כ־national securities exchange. FINRA מציינת ש־“dark pool” הוא מונח לא־רשמי שנפוץ עבור ATS שאינו מציג pre-trade quotations בפומבי.

‏מקורות רשמיים:

`https://www.sec.gov/foia/frequently-requested-documents/alternative-trading-system-ats-list`

`https://www.finra.org/investors/insights/where-do-stocks-trade`

### ‏מסקנת ה־Snapshot

```text
Order name alone is not a capability contract.
```

‏כל semantic תלוי ב־:

```text
product
route
destination
platform/API
account
session
broker version
verified_at
```

---

## ‏31. Capability Registry

‏נחזיק Contract versioned:

```text
ExecutionCapability
{
  broker,
  product_scope,
  symbol_scope,
  session_scope,
  route_scope,
  supports_hidden,
  hidden_native_or_simulated,
  supports_reserve,
  supports_midprice,
  supports_midpoint_peg,
  supports_primary_peg,
  supports_ATS,
  supports_price_cap,
  supports_min_quantity,
  supported_tif,
  verified_at,
  source_refs
}
```

‏כל שינוי provider/broker documentation מחייב re-verification לפני שימוש תפעולי.

---

## ‏32. No Silent Fallback

‏אם requested tactic אינה זמינה:

```text
requested = MIDPOINT
actual = MARKET
```

‏אסור שיקרה בשקט.

‏התוצאה חייבת להיות אחת מ־:

```text
REJECT_UNSUPPORTED_TACTIC
EXPLICIT_FALLBACK_SELECTED
NO_TRADE
```

‏עם Reason Code.

---

## ‏33. Fallback Contract

‏לכל tactic מתקדמת:

```text
primary_tactic
fallback_tactic
fallback_preconditions
fallback_price_protection
fallback_ttl
fallback_max_count
abort_conditions
```

‏Fallback אינו Retry עיוור.

‏לפני fallback:

```text
recheck signal
recheck remaining edge
recheck risk
recheck safety
recheck pending exposure
```

---

## ‏34. Native vs Synthetic State

‏נשמור בנפרד:

```text
native_order_state
synthetic_policy_state
```

‏למשל:

```text
native broker peg still working
```

‏לעומת:

```text
client synthetic midpoint-first policy waiting for fallback timer
```

‏Restart לא יכול למחוק את ההבחנה.

---

## ‏35. State Machine Baseline

```text
CREATED
READY_CHECK
WORKING
REPRICING
PARTIALLY_FILLED
CANCEL_PENDING
FALLBACK_PENDING
FILLED
CANCELLED
REJECTED
UNKNOWN
```

‏אין צורך במכונת מצב מפלצתית אחת; Parent/Child/Synthetic policy יכולים להיות aggregates נפרדים.

---

## ‏36. Unknown Effect

‏Timeout אינו Reject.

‏אם לא ידוע אם Midpoint/Pegged/ATS/Reserve order נוצרה:

```text
UNKNOWN_EFFECT
→ block conflicting risk-increasing action
→ reconcile broker orders
→ reconcile fills
→ recompute remaining quantity
→ only then continue
```

---

## ‏37. No Overfill

```text
cumulative_filled_quantity
<= authorized_target_quantity
```

‏כולל native order, fallback order, cancel-pending order ו־unknown-effect order.

---

## ‏38. Restart / Reconnect

‏אחרי reconnect:

```text
fetch broker orders
fetch fills
fetch positions
rebuild pending exposure
reconcile native orders
restore synthetic policy state
invalidate stale references
re-evaluate tactic validity
```

‏אין automatic resume של advanced tactic ללא revalidation.

---

## ‏39. Pegged Restart Rule

‏אין להניח ש־Pegged order נעלמה בגלל client restart.

‏Native order יכולה להמשיך לחיות אצל Broker/Venue.

‏לכן Recovery מתחיל מ־Broker Truth.

---

## ‏40. Reserve Restart Rule

‏אם Reserve native:

‏Broker/Venue עשוי להמשיך לנהל replenishment.

‏אם Synthetic:

‏ה־client policy עלולה להיות באמצע slice lifecycle.

‏שני המצבים דורשים Recovery שונה.

---

## ‏41. Data Quality Gates

‏לפני advanced tactic נדרש לפחות:

```text
quote_fresh
bid_valid
ask_valid
instrument_resolved
session_known
clock_healthy
market_state_normal_or_explicitly_supported
```

‏Locked/Crossed/Halt/Resume contexts אינם נכנסים אוטומטית ל־normal midpoint/peg logic.

---

## ‏42. Reference Integrity

‏Reference price הוא input קריטי.

‏נשמור:

```text
reference_source
reference_value
reference_event_time
reference_received_time
reference_age_ms
reference_quality
```

‏`reference_quality = INVALID` חוסם tactic שתלויה בו.

---

## ‏43. Cross-Provider Reality

‏אם scanner feed שונה מ־Broker execution venue:

‏Fill במחיר שלא הופיע ב־external feed אינו בהכרח Data Bug.

‏RCA בודק:

```text
coverage mismatch
ATS / hidden interaction
midpoint execution
other venue
clock alignment
provider latency
broker execution report
```

‏זה ממשיך את ההפרדה של מקטע 32.

---

## ‏44. First Divergence RCA

‏ב־Execution surprise נשאל:

```text
Observed public state
→ execution assumption
→ routing decision
→ broker instruction
→ broker state
→ fill
```

‏ומחפשים את הנקודה הראשונה שבה assumption שלנו הפסיקה להתאים ל־Execution Truth.

---

## ‏45. Backtest Fidelity Ladder

```text
F0 — Last-only
F1 — Bid/Ask
F2 — Displayed depth
F3 — Queue approximation
F4 — Hidden-liquidity sensitivity scenarios
F5 — Calibrated midpoint / hidden / venue models
F6 — High-fidelity venue-specific model where justified
```

‏לא נריץ tactic ברמת F5 על Dataset שמספק רק F1 ונעמיד פנים שהיא אמינה.

---

## ‏46. Hidden Liquidity Backtest

‏כאשר אין Evidence ישיר:

```text
Scenario H0 = no hidden assistance
Scenario H1 = moderate modeled assistance
Scenario H2 = stress / alternative assumption
```

‏ה־assumption מסומנת במפורש.

‏אם profitability תלויה רק בתרחיש favorable hidden liquidity:

```text
REJECT / LOW CONFIDENCE
```

---

## ‏47. Midpoint Backtest

‏אין:

```text
mid exists => fill
```

‏נדרש model versioned הכולל לפחות:

```text
eligibility
arrival latency
resting time
fill probability assumption
partial fill assumption
TTL
fallback rule
no-fill outcome
```

---

## ‏48. Pegged Backtest

‏נדרש:

```text
reference replay
repricing semantics
price cap
max chase
order latency
queue-reset assumption
broker/venue model
```

‏אם semantics אינן ידועות — confidence יורד ולא ממלאים gaps בדמיון.

---

## ‏49. Reserve Backtest

‏נדרש להפריד:

```text
Native Reserve Simulation
vs
Synthetic Slice Simulation
```

‏כולל:

```text
replenishment latency
partial fills
remaining quantity
message count
signal decay
```

---

## ‏50. ATS Counterfactual Limitation

‏Public feed בדרך כלל אינו מאפשר לדעת בוודאות:

```text
Would our hypothetical ATS order have filled?
```

‏לכן Counterfactual ATS outcome נשמר כ־Estimate עם Confidence, לא Fact.

---

## ‏51. Replay Metadata

‏כל Replay שכולל advanced liquidity assumptions ישמור:

```text
hidden_liquidity_model
midpoint_fill_model
peg_model_version
reserve_model_version
ATS_model_version
broker_capability_version
data_fidelity_level
```

---

## ‏52. Prefix Invariance

‏Future events אינם רשאים לשנות decision היסטורית שכבר התקבלה.

‏למשל:

‏אסור להשתמש ב־future ATS print כדי להחליט שבזמן T “הייתה בטוח ATS liquidity”.

---

## ‏53. Shadow Mode

‏Shadow יכול לייצר:

```text
would_try_midpoint
would_use_peg
would_use_reserve
would_route_ATS
would_fallback_at_time_T
```

‏הוא מודד Decision Path ו־Signal Survival.

‏הוא אינו מוכיח Fill counterfactual מושלם.

---

## ‏54. Paper Mode

‏Paper שימושי ל־:

- ‏order lifecycle.
- ‏capability integration.
- ‏state/recovery.
- ‏timers/fallbacks.
- ‏observability.

‏Paper fill behavior אינו Proof ל־hidden/midpoint/ATS realism.

---

## ‏55. Execution Experiment Ladder

```text
1. Protected Marketable Limit control
2. Simple Passive control
3. Midpoint-first challenger
4. Native Pegged challenger
5. Reserve only when size evidence requires
6. ATS-specific experiment only when capability + attribution exist
```

‏כל tactic נכנסת אחת בכל פעם.

---

## ‏56. Midpoint Use When

‏Midpoint challenger ראוי לבדיקה כאשר:

- ‏spread גדול מספיק כדי ש־price improvement יהיה material.
- ‏Signal TTL משאיר זמן לניסיון קצר.
- ‏Candidate stable מספיק.
- ‏Capability מאומתת.
- ‏No-Fill נמדד ולא מוחבא.

---

## ‏57. Midpoint Do Not Use When

‏לא כ־default כאשר:

- ‏signal half-life זעיר.
- ‏rank churn גבוה.
- ‏spread זניח.
- ‏quotes stale.
- ‏mid quality degraded.
- ‏fallback cost אינו ידוע.
- ‏fill model אינו אמין מספיק למחקר.

---

## ‏58. Pegged Use When

‏Pegged challenger ראוי לבדיקה כאשר:

- ‏client-side repricing churn הוא bottleneck מדוד.
- ‏native semantics מובנות.
- ‏hard cap/floor אפשריים.
- ‏reference quality טובה.
- ‏observability מספיקה להסביר reprices.

---

## ‏59. Pegged Do Not Use When

‏לא כאשר:

- ‏reference semantics לא ידועות.
- ‏אין hard protection.
- ‏signal weakens מהר.
- ‏order יכולה chase מעבר ל־edge.
- ‏recovery semantics לא נבדקו.

---

## ‏60. Reserve Use When

‏Reserve הופך רלוונטי למחקר כאשר:

- ‏size גדול יחסית ל־available liquidity.
- ‏market impact הופך cost מהותי.
- ‏full immediate fill אינו חובה.
- ‏execution horizon מאפשר completion הדרגתי.

---

## ‏61. Reserve Do Not Use When

‏לא כאשר:

- ‏quantity קטנה.
- ‏impact אינו bottleneck.
- ‏Signal TTL קצר מאוד.
- ‏complexity/recovery עולים על expected benefit.

---

## ‏62. ATS Use When

‏רק אם:

- ‏route נתמך ומאומת.
- ‏אפשר למדוד outcomes.
- ‏ה־strategy כבר בעלת baseline executability.
- ‏קיימת Hypothesis ספציפית, כגון price improvement או fill-quality improvement.

---

## ‏63. ATS Do Not Use When

‏לא כ־“dark pool optimization” כללי.

‏לא כאשר:

- ‏אין attribution.
- ‏אין sample.
- ‏אין capability certainty.
- ‏אין benchmark מול lit/SMART.
- ‏ה־Scanner עצמו עדיין לא הוכיח value.

---

## ‏64. Alternatives

‏לפני advanced tactic נשקול תמיד חלופות פשוטות יותר:

```text
Protected Marketable Limit
Simple Passive with TTL
Simple price improvement
NO_TRADE
```

‏`NO_TRADE` הוא Alternative אמיתי כאשר uncertainty גבוהה מדי.

---

## ‏65. Trade-offs

### ‏Hidden / Reserve

```text
+ less displayed footprint
+ possible impact reduction
- uncertain queue / hidden competition
- more model complexity
- slower completion possible
```

### ‏Midpoint

```text
+ price improvement potential
+ spread sharing
- no-fill risk
- opportunity cost
- hidden queue uncertainty
```

### ‏Pegged

```text
+ native repricing potential
+ reduced client message churn
- reference risk
- chase risk
- broker-specific semantics
```

### ‏ATS

```text
+ potential price improvement / hidden interaction
- visibility uncertainty
- route-specific behavior
- counterfactual difficulty
```

---

## ‏66. Required Data / Evidence

‏לכל advanced execution experiment נדרש לפחות:

```text
signal_id
decision_id
order_intent_id
candidate rank/score at decision
bid / ask / spread
bid_age / ask_age
mid_quality
route
order_type
visibility / liquidity-source fields if known
submit_time
ack_time
reprice_events
partial_fill_events
fill_time
fill_price
fill_qty
cancel_request_time
cancel_confirm_time
broker raw status
venue if reported
fees/rebates if available
markouts
no-fill forward path
strategy_version
execution_policy_version
capability_version
```

---

## ‏67. Promotion Criteria — Midpoint

‏Midpoint challenger מקודם רק אם:

- ‏Net Execution Value משתפר מול control.
- ‏השיפור נשמר OOS.
- ‏No-Fill opportunity cost אינו מוחק את price improvement.
- ‏P95/P99 time-to-fill נשארים בתוך signal lifetime.
- ‏adverse markout אינו מחמיר באופן מהותי.
- ‏fallback/recovery אינם יוצרים incidents.
- ‏השיפור robust across reasonable spread/regime buckets.

---

## ‏68. Promotion Criteria — Pegged

‏Pegged challenger מקודם רק אם:

- ‏מוריד churn או משפר fill outcome בפועל.
- ‏אינו מגדיל stale-fill/chase rate.
- ‏reference-quality failures מטופלים fail-closed.
- ‏price boundary invariant מעולם לא נשבר.
- ‏restart/reconnect/reconciliation נבדקו.
- ‏semantics תואמות לתיעוד וה־adapter בפועל.

---

## ‏69. Promotion Criteria — Reserve

‏Reserve מקודם רק אם:

- ‏יש capacity/impact bottleneck אמיתי.
- ‏ה־completion quality משתפר net of delay.
- ‏partial-fill complexity נשלטת.
- ‏native/synthetic distinction מלאה.
- ‏אין regression ב־unknown/duplicate/overfill incidents.

---

## ‏70. Promotion Criteria — ATS

‏ATS policy מקודמת רק אם:

- ‏ה־incremental value מול SMART/Lit control ברור.
- ‏sample מספיק.
- ‏markout אינו מגלה toxicity גבוהה יותר שמוחקת price improvement.
- ‏Unknown/No-Fill rates נסבלים.
- ‏capability ו־session semantics יציבים ומאומתים.
- ‏rollback פשוט.

---

## ‏71. Rejection Criteria

‏נדחה tactic אם אחד מאלה קורה:

```text
capability unknown or drifting
silent fallback required
price protection cannot be guaranteed
reference frequently stale
no-fill cost dominates price improvement
stale fill rate rises materially
negative markout worsens materially
P95/P99 latency exceeds signal life
unknown effects increase
recovery cannot reconstruct state
counterfactual requires invented liquidity
benefit exists only in optimistic simulation
complexity exceeds measured incremental value
```

---

## ‏72. Metrics — Core

```text
attempt_count
eligible_count
fill_rate
partial_fill_rate
no_fill_rate
time_to_first_fill_p50/p95/p99
time_to_full_fill_p50/p95/p99
price_improvement_bps
implementation_shortfall_bps
slippage_bps
markout_100ms/500ms/1s/5s
missed_opportunity_bps
stale_fill_rate
fallback_rate
cancel_rate
unknown_effect_rate
operational_failure_rate
net_execution_value
```

---

## ‏73. Metrics — Midpoint

```text
midpoint_attempt_rate
midpoint_fill_rate
midpoint_time_to_fill
midpoint_price_improvement
midpoint_no_fill_opportunity_cost
midpoint_fallback_rate
midpoint_markout
```

---

## ‏74. Metrics — Pegged

```text
peg_attempts
peg_reprice_count
peg_reprice_rate
peg_reference_age
peg_chase_distance
peg_cap_hits
peg_reference_invalid_events
peg_markout
peg_stale_fill_rate
```

---

## ‏75. Metrics — Reserve

```text
reserve_attempts
initial_display_size
replenishment_count
completion_ratio
completion_time
partial_fill_count
remaining_qty_at_signal_expiry
synthetic_child_count
```

---

## ‏76. Metrics — ATS

```text
ATS_attempts
ATS_fill_rate
ATS_time_to_fill
ATS_price_improvement
ATS_markout
ATS_no_fill_opportunity
ATS_fallback_rate
ATS_unknown_attribution_rate
```

---

## ‏77. Failure Modes

```text
F40-01 INVENTED_HIDDEN_LIQUIDITY
F40-02 MIDPOINT_ASSUMED_FILL
F40-03 MID_REFERENCE_STALE
F40-04 PEG_OVERCHASE
F40-05 PEG_REFERENCE_STALE
F40-06 PEG_SEMANTIC_MISMATCH
F40-07 RESERVE_COMPLETION_TOO_SLOW
F40-08 SYNTHETIC_RESERVE_DUPLICATE
F40-09 ATS_LOW_FILL_RATE
F40-10 ATS_ADVERSE_MARKOUT
F40-11 CAPABILITY_MISMATCH
F40-12 SILENT_FALLBACK
F40-13 UNKNOWN_LIQUIDITY_SOURCE
F40-14 UNKNOWN_EFFECT_AFTER_SUBMIT
F40-15 RESTART_STATE_LOSS
F40-16 OVERFILL_AFTER_FALLBACK
F40-17 OPTIMISTIC_BACKTEST_ASSUMPTION
F40-18 CROSS_PROVIDER_MISATTRIBUTION
```

---

## ‏78. Success Taxonomy

```text
S40-01 MIDPOINT_PRICE_IMPROVEMENT_WITH_GOOD_MARKOUT
S40-02 GOOD_NO_FILL_AVOIDED_BAD_MOVE
S40-03 PEG_REDUCED_CHURN_WITHOUT_CHASE
S40-04 RESERVE_REDUCED_IMPACT
S40-05 ATS_NET_EXECUTION_IMPROVEMENT
S40-06 CORRECT_EXPLICIT_FALLBACK
S40-07 CORRECT_NO_TRADE_UNDER_UNCERTAINTY
```

---

## ‏79. Reason Codes

```text
MIDPOINT_NOT_ELIGIBLE
MIDPOINT_REFERENCE_INVALID
MIDPOINT_TTL_EXPIRED
MIDPOINT_NO_FILL
PEG_NOT_SUPPORTED
PEG_REFERENCE_STALE
PEG_PRICE_CAP_REACHED
PEG_MAX_CHASE_REACHED
RESERVE_NOT_JUSTIFIED_BY_SIZE
RESERVE_NOT_SUPPORTED
ATS_NOT_SUPPORTED
ATS_ROUTE_UNAVAILABLE
EXECUTION_UNCERTAINTY_TOO_HIGH
CAPABILITY_STALE
EXPLICIT_FALLBACK_SELECTED
NO_TRADE_ADVANCED_EXECUTION_UNSAFE
```

---

## ‏80. Observability

‏Dashboard/trace צריך להראות:

```text
current tactic
native/synthetic
reference price + age
mid quality
current effective price
price cap/floor
order age
signal age
reprice count
fallback count
working quantity
partial filled quantity
pending exposure
liquidity source attribution
attribution confidence
```

---

## ‏81. Alerts

‏דוגמאות:

```text
PEG_REFERENCE_STALE_WHILE_WORKING
PEG_CHASE_DISTANCE_SHIFT
MIDPOINT_FILL_LATENCY_SHIFT
MIDPOINT_NEGATIVE_MARKOUT_SHIFT
ATS_FILL_RATE_DIVERGENCE
ATS_ATTRIBUTION_UNKNOWN_SPIKE
RESERVE_COMPLETION_LATENCY_SPIKE
CAPABILITY_CHANGED
SILENT_FALLBACK_ATTEMPT
UNKNOWN_EFFECT_UNRESOLVED
```

---

## ‏82. RCA Workflow

```text
Observed outcome
→ classify tactic / route / liquidity source
→ validate data quality
→ validate capability semantics
→ identify first divergence
→ separate model error from variance
→ create hypothesis
→ replay / controlled experiment
→ promote / reject
```

---

## ‏83. Hidden Execution Surprise RCA

‏אם Fill נראה “בלתי אפשרי” לפי displayed book:

‏לא מתחילים ב־“Data Provider bug”.

‏בודקים:

```text
venue coverage
midpoint execution
hidden/reserve interaction
ATS/internal venue
clock alignment
raw broker evidence
trade conditions
```

---

## ‏84. Midpoint RCA

‏לכל midpoint attempt:

```text
Was mid quality valid?
How old was signal?
How long did we rest?
Did we fill?
What was price improvement?
What was markout?
What happened if no fill?
Did fallback preserve edge?
```

---

## ‏85. Peg RCA

```text
What reference drove each reprice?
Was reference fresh?
Did price cap engage?
How far did we chase?
Did native behavior match capability docs?
Did the signal remain alive?
```

---

## ‏86. Reserve RCA

```text
Was reserve needed by size?
How much completed?
How long did completion take?
Did impact improve?
Did the signal decay during completion?
Was behavior native or synthetic?
```

---

## ‏87. ATS RCA

```text
Was ATS actually selected?
Was route supported?
Was fill attributed?
How fast was fill?
What was price improvement?
What was markout?
What was no-fill opportunity cost?
Did SMART/Lit control plausibly do better?
```

---

## ‏88. Complexity Tax

‏Advanced tactic אינה חינם.

‏עלות מורכבות כוללת:

```text
more capability checks
more states
more fallbacks
more provider-specific semantics
more recovery paths
more test cases
more observability
more counterfactual uncertainty
```

‏לכן:

```text
Measured Incremental Benefit
>
Complexity + Failure + Maintenance Cost
```

‏הוא Promotion Gate אמיתי.

---

## ‏89. What I Would Avoid Initially

‏לא הייתי מתחיל מ־:

- ‏Hidden-size estimator לכל 4,000 symbols.
- ‏Iceberg detector כ־Alpha feature.
- ‏ATS optimizer.
- ‏Per-venue dark-liquidity model.
- ‏Synthetic reserve engine.
- ‏Pegged policy עם כמה reference modes.
- ‏Automatic fallback chain של כמה tactics.
- ‏Assumption ש־midpoint תמיד עדיף.
- ‏Assumption ש־price improvement הוא execution success.

---

## ‏90. What to Add Later

### ‏`P2`

- ‏Midpoint calibration by spread/TTL bucket.
- ‏Pegged telemetry + champion/challenger.
- ‏Execution surprise attribution.

### ‏`P3`

- ‏Reserve experiment כאשר quantity גדלה.
- ‏ATS experiment עם route attribution.
- ‏calibrated hidden-liquidity scenarios.

### ‏`P4`

- ‏Venue-specific hidden/ATS fill models.
- ‏advanced iceberg/replenishment inference.
- ‏learned tactic selection.

---

## ‏91. User-Specific Application

‏למערכת המחקר שלנו, שמחפשת short-horizon momentum על פני universe רחב, סדר העבודה הנכון הוא:

```text
1. Keep broad scan cheap and provider-agnostic.
2. Select Top-N / candidate.
3. Perform deep execution enrichment only on shortlist.
4. Preserve Protected Marketable Limit as control.
5. Preserve Simple Passive as second control.
6. Test Midpoint-first only where spread + TTL justify it.
7. Add Pegged only if client-side repricing becomes a measured bottleneck.
8. Ignore Reserve until quantity/impact justify it.
9. Ignore ATS optimization until capability + attribution + sample justify it.
10. Feed every Fill/No-Fill back into calibration and RCA.
```

‏המטרה אינה להתחרות ב־microsecond dark-liquidity discovery.

‏המטרה היא למצוא execution improvements ששורדים latency מציאותי של מערכת אישית ושומרים על Net Edge.

---

## ‏92. Concrete Baseline Contract

```text
Candidate Selected
→ Fresh Data Gate
→ Execution Readiness
→ Remaining Edge Check
→ Tactic Selection
   ├─ Protected Marketable Limit [control]
   ├─ Simple Passive [control]
   └─ Midpoint-first [challenger]
→ Capability Contract
→ Hard Price Protection
→ Submit
→ Observe Broker Truth
→ Partial / Full / No Fill
→ Explicit Fallback or Abort
→ Markout + Opportunity Cost
→ Attribution
→ Replay / RCA
```

---

## ‏93. Minimum Midpoint Experiment

‏אותם Signals יחולקו ל־Control/Shadow Counterfactual:

```text
Control:
  Protected Marketable Limit

Challenger:
  Midpoint-first
  + explicit TTL
  + same price budget
  + same risk
  + same exit model
```

‏Primary metric:

```text
Net Execution Value
```

‏Guardrails:

```text
P95/P99 time-to-fill
stale fill rate
negative markout
no-fill opportunity cost
fallback rate
operational failures
```

---

## ‏94. Minimum Pegged Experiment

```text
Control:
  current client-side execution tactic

Challenger:
  one native pegged semantic only
  + hard cap
  + explicit TTL
  + same signal/risk
```

‏לא בודקים כמה Peg families יחד.

---

## ‏95. Minimum Reserve Experiment

‏רק אם size justification קיים:

```text
Control:
  ordinary order policy

Challenger:
  one reserve/display-size policy
```

‏Primary question:

```text
Does reserve improve completion/impact enough to justify slower execution and complexity?
```

---

## ‏96. Minimum ATS Experiment

‏רק אם capability קיימת:

```text
Control:
  SMART / lit baseline

Challenger:
  one ATS route/policy
```

‏עם Outcome record מלא ובלי להניח counterfactual fills בוודאות.

---

## ‏97. Confidence

### ‏High Confidence

- ‏Displayed liquidity אינה Full Executable Truth.
- ‏Midpoint existence אינו Midpoint liquidity.
- ‏No-Fill חייב להיכלל בכלכלה של tactic.
- ‏Pegged tactics זקוקות hard protection ו־reference-quality handling.
- ‏Capability semantics חייבות להיות versioned ומאומתות.
- ‏Broker fill reports הם execution truth.
- ‏Native vs Synthetic recovery שונה מהותית.

### ‏Medium Confidence

- ‏Midpoint-first הוא ה־advanced challenger הראשון המתאים ביותר לפרויקט שלנו.
- ‏Pegged native יכול להיות שימושי רק אחרי instrumentation מספקת.
- ‏Reserve כנראה אינו priority גבוה כל עוד quantity קטנה יחסית ל־liquidity.

### ‏Low / Must Validate

- ‏Exact midpoint TTL.
- ‏Exact fill-probability thresholds.
- ‏Exact spread buckets שבהם midpoint מוסיף value.
- ‏Exact contexts שבהם ATS משפר net execution.
- ‏Hidden-liquidity calibration parameters.
- ‏Any venue-specific queue priority assumption.

---

## ‏98. Time-Sensitive Facts

‏הפרטים הבאים אינם Hard-coded truth:

- ‏IBKR order-type availability.
- ‏Smart vs Directed support.
- ‏ATS route support.
- ‏Hidden native vs simulated handling.
- ‏Peg offset semantics.
- ‏Reserve platform/API availability.
- ‏session eligibility.
- ‏price increments.
- ‏fees/rebates.
- ‏Paper support.

‏לפני שימוש תפעולי:

```text
verify official docs
record verified_at
update capability registry
run adapter conformance test
```

---

## ‏99. Relationship to Earlier Sheets

### ‏מקטע 11 — Liquidity / Executability

‏40 מוסיף את העובדה ש־displayed liquidity היא תמונה חלקית בלבד.

### ‏מקטע 16 — Entry

‏כל advanced tactic עדיין כפופה ל־Intent, Risk, price bounds ו־pre-submit recheck.

### ‏מקטע 18 — Costs

‏Price improvement נבחנת רק כחלק מ־Net Execution Value.

### ‏מקטע 21 — Realistic Execution Backtest

‏40 מגדיר אילו advanced fills אסור להמציא ללא fidelity מתאימה.

### ‏מקטע 29 — Broker API Architecture

‏Capability, Unknown Effect, reconciliation ו־Broker Truth נשארים authority.

### ‏מקטע 32 — Data vs Execution

‏Public feed ו־actual execution יכולים להתבדל באופן לגיטימי בגלל liquidity שאינה גלויה באותה צורה.

### ‏מקטע 34 — Recovery

‏Native/Synthetic distinction הופך קריטי ל־restart/reconnect.

### ‏מקטע 37 — Advanced Order Tactics

‏40 מוסיף execution mechanisms מתקדמים ל־ExecutionPlan, אך אינו מבטל את ה־simple controls.

### ‏מקטע 38 — Queue

‏Hidden/Reserve מחזקים את הצורך ב־Queue Confidence ולא ב־Queue Truth מומצא.

### ‏מקטע 39 — Routing

‏ATS/Midpoint/Pegged availability תלויים גם ב־route/destination semantics.

---

## ‏100. Relationship to Later Sheets

‏מקטע 41 — `Advanced Broker Algos` — ישאל האם Broker execution algorithms כמו `Adaptive`, ‏`Arrival Price`, ‏`VWAP`, ‏`TWAP`, ‏`POV` ו־`Accumulate/Distribute` מתאימים בכלל ל־short-horizon intent שלנו.

‏מקטעים מאוחרים יותר על microstructure, halts, auctions ו־advanced signals יוכלו להשתמש ב־40 רק כ־Execution Context; הם לא יהפכו hidden/midpoint/ATS ל־Alpha ללא experiment נפרד.

---

## ‏101. What Would Change This Recommendation

‏נשנה את ה־Baseline אם Evidence מראה למשל:

- ‏Midpoint-first משפר Net Execution Value באופן robust בכמה regimes.
- ‏Native Pegged מוריד message churn ומשפר edge preservation ללא stale-fill penalty.
- ‏Position size עולה עד ש־impact/completion הופכים bottleneck.
- ‏ATS route מסוים מראה improvement עקבי, OOS, מעל SMART/Lit control.
- ‏Provider/Broker capabilities משתנות מהותית.
- ‏האסטרטגיה מוכחת כרגישה מאוד ל־hidden/venue execution assumptions.

‏לא נשנה policy בגלל anecdote או Fill יחיד.

---

## ‏102. Recommendation Summary

```text
P0
Observed / Inferred / Unknown
Broker Fill Truth
Capability Contract
Price Protection
TTL / Max Chase
No Silent Fallback
Unknown-Effect Reconciliation
Native vs Synthetic State

P1
Keep Marketable-Limit + Passive controls
Measure No-Fill + Markout
Midpoint-first as first advanced challenger
Execution attribution with confidence

P2
Native Pegged challenger
Hidden-liquidity sensitivity scenarios

P3
Reserve only if size/impact justify
ATS only with capability + measurable evidence

P4
Venue-specific hidden / ATS / reserve models
Learned advanced tactic selection
```

‏המודל הסופי:

```text
Displayed Liquidity
≠ Full Liquidity
≠ Guaranteed Executability

Advanced Tactic
→ Capability
→ Fresh Reference
→ Price Protection
→ Explicit TTL
→ Broker Truth
→ Fill / No Fill
→ Markout / Opportunity Cost
→ Net Execution Value
→ RCA / Calibration
```

‏המשפט המסכם:

> ‏מה שלא רואים בספר יכול להשפיע מאוד על Execution, אבל מה שלא רואים גם אסור להפוך לעובדה מדומה. עבור הרובוט שלנו, tactics מתקדמות נכנסות אחת־אחת ורק לאחר שהן מוכיחות ערך Net מעל Baseline פשוט, תחת Capability ו־Safety מפורשים.
