# ‏42 — Recommendation Sheet: Opening / Closing Auctions / Auction Order Types

> ‏מקור לימודי עיקרי: `../42-OPENING-CLOSING-AUCTIONS-AND-AUCTION-ORDER-TYPES.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי וארכיטקטוני ל־Opening/Closing Auctions כך שהמערכת תבין ש־Auction הוא Market Regime ומנגנון Price Discovery נפרד, עם Data, Cutoffs, Cancel/Modify Rules, Clearing Price ו־Order Types משלו — בלי להכניס Auction execution מוקדם מדי למערכת Short-Horizon Momentum שלנו.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏החלטת ה־Baseline היא להפריד בין:

```text
Auction Awareness
!=
Auction Participation
```

‏אנחנו רוצים `Auction Awareness` כבר בשכבת ה־Market State והמחקר:

```text
Exchange Calendar
→ Listing Venue
→ Auction State
→ Auction Data Freshness
→ Imbalance / Paired / Indicative State
→ Open / Close Transition Regime
→ Diagnostics / Research Labels
```

‏אבל ברירת המחדל לביצוע נשארת:

```text
Auction Participation = DISABLED
```

‏עד שיש Evidence נפרד ש־Auction-aware prediction וגם Auction execution משמרים `Net Edge`.

‏העיקרון המחייב:

```text
Auction is not continuous trading with more volume.
Auction data is not a directional oracle.
Auction order types are execution mechanisms, not alpha.
Cutoff and cancelability are part of risk.
```

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Opening / Closing הם Regimes נפרדים

‏נשתמש לפחות ב־:

```text
PRE_OPEN
OPEN_AUCTION
OPEN_TRANSITION
CONTINUOUS
PRE_CLOSE
CLOSE_AUCTION
POST_CLOSE
```

‏אסור להניח ש־Feature distributions של `10:30 ET` תקפות ב־`09:29:55 ET` או ב־`15:59:55 ET`.

### ‏`P0 — Required`: ‏Auction Participation חסום ב־Baseline

‏בגרסה הראשונה:

```text
if auction_related_regime:
    collect_data
    calculate_diagnostics
    block_new_auction_order_intent
```

‏מטרתנו כרגע היא קודם להוכיח:

```text
Predictive Edge
→ Executable Edge
→ Net Edge
```

‏ב־continuous execution הפשוט שכבר בנינו.

### ‏`P0 — Required`: ‏Per-Symbol Session State

‏`market_is_open = true` אינו מספיק.

‏לכל Instrument נדרש לפחות:

```text
NOT_OPEN
AUCTION_PENDING
OPEN
HALTED
CLOSED
UNKNOWN
```

‏מניה יכולה להיפתח מאוחר מ־`09:30`, ולכן Global Clock אינו Position Truth של Instrument.

### ‏`P0 — Required`: ‏Venue Rules הם Versioned Capabilities

‏אסור לקודד:

```text
opening_cutoff = 09:28
closing_cutoff = 15:50
```

‏כ־Strategy constants.

‏נשמור:

```text
AuctionCapabilitySnapshot
{
  listing_venue,
  auction_type,
  supported_order_types,
  entry_cutoffs,
  cancel_cutoffs,
  modify_cutoffs,
  freeze_windows,
  imbalance_feed,
  calendar_version,
  rules_version,
  verified_at,
  source
}
```

### ‏`P0 — Required`: ‏Effective Cutoff הוא Conservative Boundary

‏מבחינה ארכיטקטונית:

```text
effective_cutoff
= min(
    exchange_cutoff,
    broker_cutoff_if_any,
    internal_operational_cutoff
  )
```

‏וה־internal cutoff צריך להשאיר מרווח ל־latency, clock uncertainty ו־broker processing.

### ‏`P0 — Required`: ‏Missing Data אינו Zero Imbalance

‏אם imbalance feed חסר:

```text
auction_data_status = UNAVAILABLE
```

‏לא:

```text
imbalance_qty = 0
```

### ‏`P0 — Required`: ‏Auction Orders הם Pending Exposure

‏Order שנשלח ל־Auction אך עדיין לא Crossed הוא Exposure אפשרי.

‏Cancel request אינו משחרר Risk Reservation עד שהמצב ידוע.

### ‏`P0 — Required`: ‏Unknown Effect → Reconcile

‏אם Order נשלח סמוך ל־cutoff ואין ודאות אם התקבל:

```text
UNKNOWN_ORDER_EFFECT
→ block duplicate exposure
→ reconcile broker/exchange state
```

‏לא blind retry.

### ‏`P1 — Preferred`: ‏Auction Research Mode

‏גם בלי השתתפות נקליט:

```text
auction_type
listing_venue
source_time
received_time
sequence
reference_price
indicative_match_price
paired_quantity
imbalance_quantity
imbalance_side
near_price_if_available
far_price_if_available
auction_status
quality_flags
```

### ‏`P1 — Preferred`: ‏Separate Opening / Closing Research

‏לא נערבב את שני האירועים:

```text
Opening Research
!=
Closing Research
```

‏Opening קשור ל־overnight/pre-market price discovery.

‏Closing קשור ל־benchmarking, end-of-day flow ו־different volume regime.

### ‏`P2 — Challenger`: ‏Auction-Aware Strategy בלי Execution

‏לפני Auction orders עצמם אפשר לבדוק Challenger פשוט:

```text
Auction-aware regime filter
vs
No auction awareness
```

‏למשל: האם הימנעות/השהיה סביב transition משפרת את continuous strategy.

### ‏`P3 — Advanced Challenger`: ‏Price-Protected Auction Intent

‏רק אם Research/Shadow מצדיקים Auction participation, ה־Challenger הראשון יהיה price-protected intent בסגנון `LOO/LOC`, ולא market-on-auction כברירת מחדל.

‏זהו Judgment מחקרי: הוא מעדיף explicit price protection בזמן שבו final clearing price עדיין יכול להשתנות.

### ‏`P4 — Specialist`: ‏MOO/MOC, Imbalance-Only, Venue-Specific Auction Logic

‏אלו נשארים Specialist / Evidence-only עד שנוכיח צורך ממשי ונבין את venue-specific semantics.

---

## ‏3. Hierarchy

```text
Baseline
→ Auction participation disabled
→ Explicit auction regimes
→ Per-symbol market state
→ Collect point-in-time auction data

Preferred Default
→ Auction-aware safety / regime handling
→ Opening/Closing research datasets
→ Freshness / coverage / clock gates

Challenger
→ Auction-aware continuous policy
→ Price-protected auction shadow intent

Advanced Option
→ LOO/LOC-style research execution model
→ venue-specific imbalance features

Specialist Option
→ MOO/MOC research
→ Imbalance-Only orders
→ D Orders / Closing Offset / venue-specific mechanisms

Avoid Unless Evidence
→ live auction participation by default
→ single-snapshot imbalance signals
→ hard-coded venue times
→ market-on-auction without explicit rationale
→ assuming 09:30 means every symbol is continuously tradable
```

---

## ‏4. Priority Map

| Priority | Recommendation |
|---|---|
| `P0` | ‏Opening/Closing as separate regimes |
| `P0` | ‏Auction participation disabled initially |
| `P0` | ‏Per-symbol auction/session state |
| `P0` | ‏Versioned venue/broker capability rules |
| `P0` | ‏Clock/calendar discipline |
| `P0` | ‏Pending exposure + unknown-effect handling |
| `P0` | ‏No silent fallback between auction order types |
| `P1` | ‏Point-in-time auction data capture |
| `P1` | ‏Auction Decision / Outcome ledgers |
| `P1` | ‏Fresh coverage and sequence integrity |
| `P1` | ‏Opening/Closing research separation |
| `P2` | ‏Auction-aware regime filter challenger |
| `P2` | ‏Imbalance stability / drift features |
| `P3` | ‏Price-protected auction shadow/paper challenger |
| `P4` | ‏Market-on-auction / imbalance-only / venue-specialist execution |

---

## ‏5. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Opening ו־Closing Auctions הם single-price price-discovery mechanisms השונים ממסחר רציף.
- ‏Auction order books, data dissemination, cutoffs ו־matching rules הם venue-specific.
- ‏`MOO/MOC` ו־`LOO/LOC` הם execution order types; הם אינם predictive signals.
- ‏Indicative Match Price ו־Imbalance יכולים להשתנות עד ה־Cross.
- ‏Cancellation / modification יכולות להיות מוגבלות בחלונות סמוכים ל־Auction.
- ‏Official Opening/Closing Price אינו בהכרח Last continuous trade.
- ‏Instrument יכול להיפתח מאוחר יותר מ־nominal session open.

### ‏Judgment

- ‏Auction participation צריך להישאר כבוי ב־MVP המחקרי שלנו.
- ‏Auction awareness כן צריך להיכנס מוקדם ל־market-state/safety architecture.
- ‏Auction data צריכה להיאסף כ־stream point-in-time, לא final snapshot בלבד.
- ‏Price-protected auction intent עדיף כ־first execution challenger על market-on-auction intent.
- ‏Cutoff safety צריך להיות conservative ולהשתמש internal deadline מוקדם יותר.

### ‏Hypothesis

- ‏Auction-awareness עשוי לשפר החלטות מיד אחרי open או לפני close.
- ‏Imbalance dynamics עשויים להוסיף predictive information בחלק מה־contexts.
- ‏Auction participation עשוי לשפר net execution בקבוצה מסוימת של signals.
- ‏ייתכן שה־Auction complexity לא מוסיפה מספיק value לרובוט שלנו ולכן תישאר מחוץ ל־MVP.

‏כל Hypothesis דורש Validation נפרד.

---

## ‏6. Why Auction Awareness Matters Even With Participation Disabled

‏בלי Auction awareness המערכת יכולה לעשות טעויות בסיסיות:

```text
No trade
=> assume inactive symbol
```

‏כאשר בפועל:

```text
AUCTION_PENDING
```

‏או:

```text
09:30 passed
=> assume OPEN
```

‏כאשר primary-listed instrument עדיין לא נפתח.

‏לכן Auction awareness הוא חלק מ־Data Quality ו־Safety — גם אם לעולם לא נשלח MOO/MOC/LOO/LOC.

---

## ‏7. Auction Regime Contract

```text
AuctionRegimeState
{
  session_date,
  venue,
  instrument_id,
  auction_type,
  state,
  state_since,
  nominal_cross_time,
  actual_cross_time_if_known,
  time_to_exchange_cutoff,
  time_to_internal_cutoff,
  time_to_cross,
  rules_version,
  calendar_version,
  freshness_state
}
```

‏`state` יכול לכלול:

```text
PRE_AUCTION
IMBALANCE_PUBLISHING
RESTRICTED_OR_FREEZE
CROSS_PENDING
CROSS_EXECUTED
POST_AUCTION_RECONCILING
UNKNOWN
```

---

## ‏8. Auction Capability Registry

```text
AuctionCapability
{
  venue,
  instrument_scope,
  auction_type,
  supported_order_type,
  native_or_broker_synthetic,
  submit_start,
  submit_cutoff,
  cancel_cutoff,
  modify_cutoff,
  late_entry_rule,
  offsetting_rule,
  imbalance_feed_available,
  imbalance_start,
  expected_cross_window,
  source,
  verified_at,
  version
}
```

‏אין `SupportsAuction=true` כללי.

‏צריך לדעת **איזה Auction, באיזה Venue, עבור איזה Instrument, דרך איזה Broker/API**.

---

## ‏9. Listing Venue Is Required Identity

‏Auction logic לא יכולה להסתמך על Symbol בלבד.

```text
CanonicalInstrumentId
PrimaryListingVenue
BrokerContractId
DataProviderInstrumentId
AuctionEligibility
```

‏ה־primary listing venue קובע את primary open/close auction context.

---

## ‏10. Auction Data Contract

‏Canonical snapshot:

```text
AuctionSnapshot
{
  snapshot_id,
  instrument_id,
  listing_venue,
  auction_type,
  source_time,
  receive_time,
  sequence,
  reference_price,
  indicative_match_price,
  paired_qty,
  imbalance_qty,
  imbalance_side,
  near_price,
  far_price,
  auction_status,
  source_provider,
  raw_message_type,
  quality_flags
}
```

‏לא כל feed יספק את כל השדות.

‏`null / unavailable` עדיף על semantic מומצאת.

---

## ‏11. Observed vs Derived

‏נפריד:

```text
Observed
→ paired_qty
→ imbalance_qty
→ imbalance_side
→ indicative_price
→ reference_price

Derived
→ imbalance_ratio
→ imbalance_velocity
→ paired_growth
→ indicative_drift
→ sign_flip_count
→ stability
→ relative_imbalance
```

‏Derived Feature לעולם לא מחליפה את Raw/Observed evidence.

---

## ‏12. Imbalance Is Not Directional Truth

‏Anti-pattern:

```text
large buy imbalance
=> buy signal
```

‏במקום זאת imbalance הוא State בתוך price-discovery process.

‏מחקר צריך לשאול:

```text
Does this imbalance state,
known at this exact as-of time,
add incremental predictive value
beyond our existing features?
```

---

## ‏13. Auction Dynamic Features

‏Candidates למחקר, לא Baseline Alpha:

```text
signed_imbalance
imbalance_ratio
imbalance_velocity
paired_growth
indicative_price_drift
same_side_duration
imbalance_flip_count
indicative_price_volatility
paired_qty / typical_auction_volume
imbalance_qty / typical_auction_volume
```

‏כל Feature צריכה ablation ו־OOS validation.

---

## ‏14. Auction Data Freshness

‏נמדוד:

```text
auction_source_age_ms
auction_receive_age_ms
sequence_gap_count
snapshot_recovery_count
fresh_auction_coverage_pct
```

‏Data stale או sequence gap לא פתור:

```text
AUCTION_DATA_UNTRUSTED
```

‏ולא שימוש ב־last known value כאילו היא fresh.

---

## ‏15. Whole-Market Auction Coverage

‏אם משתמשים ב־Auction cross-sectional ranking:

```text
freshAuctionCoverage >= threshold
```

‏הוא Gate.

‏Candidate טרי אינו מספיק אם שאר universe שעליו rank נבנה אינו טרי.

---

## ‏16. Snapshot Watermark

‏נגדיר `auction_ranking_as_of_time` ונאפשר comparison רק ל־symbols שעומדים ב־freshness/window policy.

‏כך נמנע:

```text
Symbol A @ 15:59:50
vs
Symbol B @ 15:59:56
```

‏כאילו זו אותה תמונת שוק.

---

## ‏17. Clock Discipline

‏Auction logic רגישה במיוחד לשעון.

‏נשתמש ב־:

```text
UTC wall clock
exchange timezone
monotonic durations
clock_skew measurement
versioned market calendar
```

‏אסור לקודד שעה ישראלית קבועה עבור market open/close בארה״ב.

---

## ‏18. Market Calendar Contract

```text
MarketSessionCalendar
{
  session_date,
  venue,
  regular_open,
  regular_close,
  early_close,
  holiday_state,
  calendar_version,
  source,
  verified_at
}
```

‏Early-close days חייבים לשנות גם את Auction schedule assumptions.

---

## ‏19. Internal Cutoff

‏לא ננסה להגיש בדיוק ב־exchange cutoff.

‏ה־internal deadline הוא:

```text
internal_cutoff
<
effective_external_cutoff
```

‏וה־buffer נקבע לפי measured tail latency ו־clock uncertainty.

‏לא hard-code של מספר milliseconds לפני שיש Evidence.

---

## ‏20. Time to Cutoff and Time to Cross

‏שני Features/Guards נפרדים:

```text
time_to_cutoff_ms
time_to_cross_ms
```

‏Order יכול עדיין להיות רחוק מה־Cross אבל כבר לא ניתן לביטול/שינוי.

---

## ‏21. Auction Commitment State

‏נוסיף state רעיוני:

```text
AUCTION_ORDER_COMMITTED
```

‏כאשר Order כבר נמצא בחלון שבו יכולת cancellation/modify מוגבלת או לא ידועה.

‏Safety/Kill Switch חייבים לדעת ש־Risk כזה אינו נעלם מייד.

---

## ‏22. Auction Order Intent

‏אם בעתיד נפתח execution research:

```text
AuctionOrderIntent
{
  intent_id,
  instrument_id,
  listing_venue,
  side,
  quantity,
  auction_type,
  price_constraint,
  decision_time,
  decision_snapshot_id,
  strategy_deadline,
  internal_submit_deadline,
  risk_approval_id,
  safety_epoch,
  execution_policy_version,
  auction_rules_version
}
```

---

## ‏23. Order-Type Semantics

‏ברמה מושגית:

```text
MOO / MOC
→ stronger participation intent
→ weak/absent ordinary limit protection

LOO / LOC
→ explicit price constraint
→ higher no-fill risk
```

‏אבל execution priority, late handling ו־eligibility הם venue-specific.

---

## ‏24. Preferred First Auction Execution Challenger

‏אם בעתיד participation נפתח למחקר:

```text
Control = NO_AUCTION_PARTICIPATION
Treatment = price-protected auction intent
```

‏הסיבה היא שנרצה קודם למדוד Auction mechanics בלי לוותר מיד על price boundary.

‏`MOO/MOC` יישארו Specialist until evidence.

---

## ‏25. No Silent Fallback

‏אם `LOC`/`LOO` requested ולא נתמך:

```text
UNSUPPORTED_AUCTION_CAPABILITY
```

‏או fallback מפורש שהוגדר מראש.

‏אסור:

```text
LOC unsupported
→ silently send Market
```

---

## ‏26. Price Constraint Is Not a Prediction

‏Limit ב־Auction הוא Safety/Execution constraint.

‏הוא אינו טענה ש־Cross “אמור” להגיע למחיר מסוים.

---

## ‏27. MOO/MOC Research Risk

‏`MOO/MOC` יכולים להיות שימושיים כ־research benchmark של fill-oriented behavior, אך המחיר הסופי יכול להשתנות מה־indicative state שהיה ידוע קודם.

‏לכן אין לקדם אותם רק בגלל higher fill probability.

---

## ‏28. Auction Fill Truth

‏Fill Truth מגיע מ־Broker/Exchange execution evidence.

‏לא מ־:

```text
official auction price alone
```

‏כי צריך לדעת גם:

```text
was our order accepted?
was it eligible?
what quantity filled?
was it partial?
what fees applied?
```

---

## ‏29. Auction Order Lifecycle

```text
CREATED
RISK_APPROVED
SUBMITTING
ACKNOWLEDGED
AUCTION_QUEUED
COMMITTED_OR_RESTRICTED
CROSSED
PARTIALLY_FILLED
FILLED
CANCELLED
REJECTED
UNKNOWN
```

‏Transitions נקבעים לפי broker events, לא מטיימר מקומי בלבד.

---

## ‏30. Pending Exposure

‏נחשב שמרנית:

```text
potential_exposure
=
filled_qty
+ accepted_working_qty
+ cancel_pending_qty
+ unknown_effect_qty
```

‏עד reconciliation.

---

## ‏31. Double-Entry Prevention

‏אין לאפשר בו־זמנית:

```text
Auction Entry Intent
+
Continuous Entry Intent
```

‏שמייצרים ביחד exposure מעל authorization.

‏נדרש shared Risk Reservation.

---

## ‏32. Kill Switch Interaction

‏Kill Switch אחרי commitment יכול:

- ‏לחסום Intents חדשים.
- ‏לנסות Cancel כאשר מותר.
- ‏לשמור reservation כאשר state אינו ידוע.
- ‏לעבור ל־reconciliation / exit planning לאחר ה־Cross.

‏הוא אינו יכול להבטיח שה־Auction order שכבר committed “נעלמה”.

---

## ‏33. Recovery Around Cross

‏תרחישי חובה:

```text
crash before cutoff
crash after submit
crash during restricted window
broker disconnect before cross
market-data disconnect before cross
restart after cross
```

‏בכל restart:

```text
broker authoritative snapshot
→ orders
→ fills
→ positions
→ reconcile
→ only then resume
```

---

## ‏34. Market-Data Disconnect Policy

‏אם imbalance feed נופל לפני internal decision deadline:

```text
block new auction participation
```

‏ב־Baseline.

‏אין שימוש אוטומטי ב־stale imbalance.

---

## ‏35. Post-Cross Reconciliation

‏לפני cycle חדש:

```text
cross observed
→ broker fills loaded
→ position reconciled
→ working orders reconciled
→ auction intent terminal
→ continuous strategy eligibility re-evaluated
```

---

## ‏36. Opening Transition

‏Opening Auction outcome אינו signal תקף אוטומטית ל־continuous session.

‏מיד לאחר open נדרשים:

```text
fresh bid/ask
spread health
trade activity
instrument OPEN state
feature warmup / validity
```

‏לפני continuous entry.

---

## ‏37. Delayed Open

‏לא כל Instrument חייב לפתוח בדיוק ב־`09:30:00`.

‏לכן:

```text
clock >= nominal_open
!=
instrument_ready_for_continuous_execution
```

---

## ‏38. Closing Transition

‏Closing Auction אינו “הטרייד האחרון”.

‏הוא event נפרד עם Official Close semantics ו־transition ל־post-market.

‏מחקר closing צריך להגדיר במפורש מהו post-auction label/horizon.

---

## ‏39. Backtest Fidelity Ladder

```text
A0 = official auction price only
A1 = + final imbalance
A2 = + point-in-time imbalance snapshots
A3 = + cutoff / eligibility / calendar rules
A4 = + broker latency / reject / unknown model
A5 = + event replay with broker-state model
```

‏אסור להסיק execution feasibility מ־`A0/A1` בלבד.

---

## ‏40. Point-in-Time Integrity

‏לכל Auction snapshot:

```text
source_time
receive_time
as_of_time
sequence
```

‏Decision ב־`15:58:20` אינו רשאי להשתמש ב־final close imbalance או Official Close שנודעו מאוחר יותר.

---

## ‏41. Historical Dataset Requirement

‏Dataset שמספק רק:

```text
final_imbalance
official_open
official_close
```

‏אינו מספיק למחקר Decision שנעשה עשרות שניות לפני Cross.

---

## ‏42. Auction Replay

‏Replay צריך לשחזר:

```text
auction data sequence
→ feature changes
→ internal deadlines
→ decision
→ hypothetical/real broker events
→ cross
→ reconciliation
```

‏אותו Decision Engine צריך לשמש ב־Replay/Shadow/Paper ככל האפשר.

---

## ‏43. Research Labels — Opening

‏נשמור לפחות:

```text
previous_close
pre_market_reference
indicative_open_at_decision
official_open
first_continuous_trade
post_open_return_1s
post_open_return_2s
post_open_return_5s
post_open_return_10s
post_open_return_30s
post_open_return_60s
MFE
MAE
```

‏זהו Research dataset, לא live recommendation.

---

## ‏44. Research Labels — Closing

‏נשמור:

```text
last_continuous_trade
pre_close_bid
pre_close_ask
indicative_close_at_decision
official_close
auction_volume
closing_imbalance_path
```

‏Post-close labels חייבים להגדיר אם הם משתמשים ב־after-hours או next-session context.

---

## ‏45. Benchmark Discipline

‏אפשר להשוות Auction execution ל־:

```text
last pre-auction mid
last continuous trade
arrival / decision price
indicative price at decision
auction price
```

‏אבל כל benchmark עונה על שאלה אחרת.

‏אסור להחליף benchmark בדיעבד לפי תוצאה נוחה.

---

## ‏46. Auction Slippage

‏נחשב side-aware:

```text
auction_execution_price
vs
decision_reference
```

‏ולא נשתמש ב־continuous spread בלבד כ־Auction cost proxy.

---

## ‏47. Auction Markout

‏ב־Opening research:

```text
1s
2s
5s
10s
30s
60s
```

‏ב־Closing research נגדיר horizon מפורש שמתאים ל־post-close environment.

---

## ‏48. No-Fill Is Evidence

‏`NO_FILL` יכול להיות outcome טוב אם limit מנע execution גרוע.

‏לכן נמדוד גם:

```text
missed_opportunity_after_no_fill
```

‏ולא רק fill rate.

---

## ‏49. Auction Outcome Attribution

‏נפריד:

```text
Signal Quality
Auction Feature Quality
Decision Timing
Submission Timing
Order Type Choice
Price Constraint
Broker Capability
Execution Outcome
Post-Auction Path
```

‏כך Scanner אינו מקבל blame על missed cutoff או broker reject.

---

## ‏50. Failure Taxonomy

```text
AF_DATA_STALE
AF_DATA_GAP
AF_CLOCK_SKEW
AF_WRONG_CALENDAR
AF_CAPABILITY_MISMATCH
AF_MISSED_INTERNAL_CUTOFF
AF_MISSED_EXTERNAL_CUTOFF
AF_BROKER_REJECT
AF_UNKNOWN_EFFECT
AF_IMBALANCE_FLIP
AF_LIMIT_NO_FILL
AF_PRICE_MOVED_BEFORE_CROSS
AF_PARTIAL_FILL
AF_POST_CROSS_ADVERSE_MOVE
AF_RECONCILIATION_MISMATCH
```

---

## ‏51. Success Taxonomy

```text
AS_SAFE_ABSTENTION
AS_LIMIT_PROTECTED
AS_CUTOFF_RESPECTED
AS_CLEAN_RECONCILIATION
AS_STABLE_AUCTION_SIGNAL
AS_EXECUTION_WITHIN_BUDGET
```

‏Success אינו רק Fill.

---

## ‏52. Auction Uncertainty

‏נמדוד uncertainty באמצעות observables כמו:

```text
data_age
sequence_integrity
imbalance_flip_count
imbalance_qty_volatility
indicative_price_volatility
time_remaining
paired_qty_context
```

‏אבל לא נהפוך אותם ל־magic confidence score ללא calibration.

---

## ‏53. Auction `NO_TRADE`

‏Reason codes אפשריים:

```text
NO_TRADE_AUCTION_DISABLED
NO_TRADE_AUCTION_DATA_STALE
NO_TRADE_AUCTION_DATA_INCOMPLETE
NO_TRADE_AUCTION_UNSTABLE
NO_TRADE_AUCTION_CUTOFF_TOO_CLOSE
NO_TRADE_AUCTION_CAPABILITY_UNKNOWN
NO_TRADE_AUCTION_PRICE_PROTECTION_FAILED
NO_TRADE_AUCTION_BROKER_NOT_READY
```

---

## ‏54. Rejected-Candidate Ledger

‏גם כשה־Baseline אינו שולח Auction orders, נשמור:

```text
candidate
reason_rejected
auction_snapshot
future_path
```

‏כדי למדוד אם Safety/Abstention מחמירים מדי או מוצדקים.

---

## ‏55. Fresh Coverage Gate

‏אם בעתיד נשתמש ב־whole-market auction ranking:

```text
fresh_auction_coverage_pct
```

‏הוא Hard Gate לפני Rank-based Decision.

---

## ‏56. Regime Segmentation

‏נפלח לפחות לפי:

```text
OPEN vs CLOSE
normal_day vs event_day
early_close vs regular_close
high_liquidity vs thin
spread_bucket
volatility_bucket
auction_volume_bucket
imbalance_stability_bucket
```

‏לא נערבב הכל ל־sample יחיד.

---

## ‏57. Event-Day Context

‏נסמן Context כמו:

```text
index_rebalance
month_end
quarter_end
major_news
expiry_context
```

‏אבל לא נשתמש ב־future-known classification אם הוא לא היה ידוע בזמן Decision.

---

## ‏58. Overfitting Risk

‏Auction dataset עשיר מאוד ב־features ולכן קל לייצר “edge” מדומה.

‏נדרש:

```text
few features first
ablation
chronological split
walk-forward
locked test
robust parameter regions
```

---

## ‏59. Cross-Sectional Dependence

‏Symbols באותו close אינם IID.

‏אותו macro/rebalance event יכול להשפיע על מאות מניות יחד.

‏ננתח stability גם לפי days/events, לא רק לפי מספר rows.

---

## ‏60. Auction Feature Family

‏Auction features יישארו family נפרדת:

```text
AuctionFeatureFamilyVersion
```

‏ולא ייכנסו ל־main Score לפני experiment מפורש.

---

## ‏61. Auction Execution Policy

‏גם execution נשאר policy נפרדת:

```text
AuctionExecutionPolicy
!=
ContinuousExecutionPolicy
```

‏אין reuse אוטומטי של Queue/Marketable-Limit logic כאילו matching mechanics זהים.

---

## ‏62. Auction Cost Model

‏נשמור Cost Engine versioned עבור:

```text
broker_fee
venue_fee
auction_fee_if_applicable
slippage_vs_decision
no_fill_opportunity_cost
post_cross_adverse_move
```

‏לא hard-code של fee schedule.

---

## ‏63. Capacity

‏נמדוד:

```text
our_qty / expected_auction_volume
our_qty / paired_qty
```

‏לפני שנניח שה־Auction “עמוק מספיק”.

---

## ‏64. Risk Sizing

‏כל עוד Auction model אינו מכויל, uncertainty גבוהה יותר היא סיבה לשמור את research exposure model שמרני.

‏המקטע עצמו אינו מגדיר מספרי size למסחר אמיתי.

---

## ‏65. Observability

‏Metrics בסיסיים:

```text
auction_feed_age_ms
time_to_internal_cutoff_ms
time_to_exchange_cutoff_ms
time_to_cross_ms
fresh_auction_coverage_pct
paired_qty
imbalance_qty
indicative_price_drift
imbalance_flip_count
auction_orders_pending
auction_orders_unknown
auction_reject_count
missed_cutoff_count
post_cross_reconciliation_ms
```

---

## ‏66. Dashboard

‏Dashboard אופרטיבי צריך להראות:

```text
system state
market calendar state
per-venue auction state
fresh coverage
top research candidates
time remaining
broker readiness
working/unknown auction orders
positions
```

---

## ‏67. Alerts

‏Actionable alerts:

```text
auction feed stale
clock skew unsafe
calendar mismatch
broker not ready near internal cutoff
unknown auction order effect
post-cross position mismatch
unexpected no-fill / reject spike
```

---

## ‏68. Golden Scenarios

‏נחזיק Replay/Simulation cases לפחות ל־:

1. ‏Normal opening sequence.
2. ‏Normal closing sequence.
3. ‏Buy imbalance flips to sell.
4. ‏Indicative price moves beyond intended limit.
5. ‏Auction feed becomes stale.
6. ‏Sequence gap before decision.
7. ‏Order created after internal cutoff.
8. ‏Broker ACK delayed past cutoff.
9. ‏Broker disconnect after submit.
10. ‏Partial Auction fill.
11. ‏Limit order gets no fill.
12. ‏Instrument opens late.
13. ‏Early-close calendar day.
14. ‏Restart after Cross discovers unexpected position.
15. ‏Unsupported Auction order type.

---

## ‏69. Hard Invariants

```text
No new auction order after internal cutoff.

No auction participation without known venue capability.

No auction decision from stale/untrusted auction data.

No duplicate exposure under UNKNOWN_EFFECT.

Cancel requested does not release risk reservation.

Position after cross comes from broker reconciliation.

Clock >= nominal open does not imply instrument OPEN.

Auction features never use future final imbalance or auction price.

Safety dominates auction optimization.
```

---

## ‏70. Current Verification Snapshot — 2026-10-27

> ‏הסעיף מתעד Facts תלויי זמן בלבד. יש לאמת מחדש לפני שימוש תפעולי.

### ‏Nasdaq Opening / Closing Cross

‏העמוד הרשמי הנוכחי של Nasdaq מציין:

```text
Opening imbalance dissemination begins: 09:25 ET
Opening Cross: 09:30 ET
Closing imbalance dissemination begins: 15:50 ET
Closing Cross: 16:00 ET
```

‏Nasdaq מתארת `MOO/LOO` כ־On-Open orders ו־`MOC/LOC` כ־On-Close orders; ‏NOII/imbalance data זמינה דרך feeds/subscriptions ייעודיים כגון TotalView/Market Data distributors.

### ‏Nasdaq Order Deadlines

‏ב־current Nasdaq quick/reference material שנבדק:

```text
MOO new entry cutoff: before 09:28 ET
LOO late-entry window: through 09:29:30 ET under special rules
Opening Cross: 09:30 ET

MOC new entry stops: 15:55 ET
LOC new entry stops: 15:58 ET
Closing Cross: 16:00 ET
```

‏חשוב יותר מהמספרים עצמם: לאחר נקודות מוקדמות יותר קיימות restrictions על cancel/modify. לכן ה־system לא יכול להסיק cancelability רק מכך ש־Cross עדיין לא התרחש.

### ‏NYSE

‏NYSE הרשמית מציגה כיום:

```text
Opening imbalance publication: 08:00 ET, every second
Opening process begins: 09:30 ET
Actual security open may occur after 09:30

Closing MOC/LOC cutoff: 15:50 ET
Closing imbalance publication: 15:50 ET, every second
MOC/LOC cancels after cutoff: rejected
D-order entry/modify cutoff: 15:59:50 ET
Closing process: 16:00 ET
```

‏NYSE American / NYSE Arca / NYSE Texas מפרסמות timelines שונים, כולל freeze periods שונים. זו הוכחה ישירה שאין universal auction schedule.

### ‏IBKR

‏התיעוד הנוכחי של IBKR מציג support ל־`MOC`, ‏`LOC`, ‏`MOO`, ‏`LOO` עבור products/platforms מסוימים, עם `Smart`/`Directed` support שמשתנה לפי order type/product/interface.

‏IBKR מציינת ש־Smart-routed On-Close/On-Open orders מיועדים להישלח ל־Primary Listing Exchange של המוצר, ושכללי submission/cancel כפופים לכללי ה־exchange המתאים.

‏מסקנה ארכיטקטונית:

```text
Exchange capability
+
Broker capability
+
Instrument/listing identity
+
Current calendar/rules
=
Effective Auction Capability
```

---

## ‏71. Time-Sensitive Facts Registry

‏נשמור לפחות:

```text
venue
auction_type
fact_name
value
unit
scope
valid_from
verified_at
source
```

‏למשל:

```text
NASDAQ | OPEN  | MOO_ENTRY_CUTOFF | 09:28 ET | ...
NASDAQ | CLOSE | MOC_ENTRY_CUTOFF | 15:55 ET | ...
NYSE   | CLOSE | MOC_LOC_CUTOFF   | 15:50 ET | ...
```

‏הטבלה היא metadata מחקרית, לא constants ב־Strategy.

---

## ‏72. Paper Limitations

‏Paper Broker יכול:

- ‏לא לדמות Auction queue/priority במדויק.
- ‏לדמות cutoffs בצורה שונה.
- ‏לתת fill behavior שאינו parity ל־Live.

‏לכן:

```text
Paper proves lifecycle / integration behavior.
Paper does not prove real auction execution quality.
```

---

## ‏73. Shadow Baseline

‏Shadow Auction Mode צריך:

```text
receive live auction data
build point-in-time decisions
never submit broker order
record hypothetical intent
record official auction result
record post-auction path
```

‏זה ה־next evidence layer אם Auction research מוכיח predictive value.

---

## ‏74. Replay Baseline

‏Replay חייב להשתמש באותם:

```text
AuctionFeatureEngine
AuctionDecisionEngine
Risk abstractions
reason codes
cutoff rules version
```

‏ככל האפשר.

---

## ‏75. Promotion Ladder

```text
No Auction Logic
→ Auction Awareness
→ Historical Point-in-Time Research
→ Deterministic Replay
→ Live Shadow
→ Paper Lifecycle Validation
→ Price-Protected Execution Challenger
```

‏המקטע אינו מאשר מעבר מעבר ל־research/paper.

---

## ‏76. Promotion Criteria

‏Auction challenger מתקדם רק אם:

- ‏יש point-in-time dataset אמין.
- ‏Predictive value incremental מוכח OOS.
- ‏Freshness/coverage gates אמינים.
- ‏Cutoff/calendar logic נבדק ב־Golden Scenarios.
- ‏No-trade/rejected candidates נותחו.
- ‏Execution model אינו תלוי ב־future official price.
- ‏Shadow evidence יציב across days/regimes.
- ‏Paper lifecycle/recovery clean כאשר רלוונטי.
- ‏Net edge survives conservative execution assumptions.

---

## ‏77. Rejection Criteria

‏נשאיר Auction participation מחוץ ל־baseline אם:

- ‏אין historical imbalance snapshots point-in-time.
- ‏Predictive value נעלם OOS.
- ‏Edge קיים רק ב־final imbalance/final price data.
- ‏Benefit נעלם תחת realistic internal cutoff.
- ‏No-fill/opportunity cost מוחקים את advantage.
- ‏Broker/venue capability fragile או ambiguous.
- ‏Rule complexity עולה על economic value.
- ‏Auction logic פוגע ב־continuous core stability.

---

## ‏78. What I Would Avoid Initially

‏לא נתחיל עם:

- ‏MOO/MOC execution.
- ‏Venue-specific Imbalance-Only order logic.
- ‏D Orders / Closing Offset special mechanisms.
- ‏Auction-specific learned model.
- ‏Cross-venue auction arbitrage.
- ‏Hard-coded ET/Israel conversion tables.
- ‏Final-imbalance-only backtest שמוצג כ־tradable strategy.
- ‏Single-snapshot imbalance thresholds.

---

## ‏79. What to Add Later

‏רק לפי Evidence:

1. ‏Auction-aware regime filter.
2. ‏Opening/Closing separate predictive models.
3. ‏Imbalance dynamics family.
4. ‏Price-protected shadow intents.
5. ‏Venue-specific auction replay.
6. ‏Capacity model לפי auction volume.
7. ‏Broker-specific order handling tests.
8. ‏Event-day / rebalance regime model.

---

## ‏80. Required Data / Evidence

‏לפני Auction execution research נדרשים לפחות:

```text
point-in-time imbalance snapshots
reliable timestamps
sequence or continuity evidence
listing venue identity
market calendar
auction rules version
official open/close
pre-auction bid/ask/trades
post-auction path
broker capability snapshot
reject / lifecycle evidence
```

---

## ‏81. Metrics

### ‏Data

```text
fresh_auction_coverage_pct
auction_data_age_ms
sequence_gap_rate
snapshot_recovery_rate
```

### ‏Prediction

```text
forward_return_by_horizon
MFE
MAE
rank stability
feature ablation value
```

### ‏Execution Research

```text
eligible_intent_rate
missed_cutoff_rate
reject_rate
partial_fill_rate
no_fill_rate
auction_slippage
markout
missed_opportunity
net_edge_retained
```

### ‏Operations

```text
clock_skew
calendar_mismatch_count
unknown_order_effect_count
post_cross_reconciliation_time
position_mismatch_count
```

---

## ‏82. Failure Modes

- ‏Treating 09:30 as universal per-symbol open.
- ‏Using final auction data before it existed.
- ‏Hard-coding one venue's cutoffs for another.
- ‏Assuming Cancel works until Cross.
- ‏Treating missing imbalance as zero.
- ‏Ignoring broker-specific order support.
- ‏Submitting after internal safety cutoff.
- ‏Retrying unknown order effect.
- ‏Starting continuous logic before post-cross reconciliation.
- ‏Using continuous spread as auction execution-cost model.
- ‏Comparing opening/closing/midday in one undifferentiated sample.
- ‏Overfitting dozens of imbalance features.

---

## ‏83. User-Specific Application

‏עבור מערכת Short-Horizon Momentum שסורקת אלפי מניות:

```text
Broad continuous scanner
+
Auction/session awareness
+
per-symbol tradability state
```

‏צריכים להגיע לפני כל Auction execution.

‏ה־Scanner לא צריך להפוך ל־Auction specialist כדי להיות בטוח יותר סביב open/close.

‏הערך המיידי הוא:

- ‏לא לדרג symbol כאילו continuous כאשר הוא עדיין Auction-pending.
- ‏לא להשוות blindly את opening burst ל־midday distribution.
- ‏לא לשגר Intents חדשים כשה־market state/cutoff אינם ברורים.
- ‏לא לפרש missing updates כ־quiet liquidity.

---

## ‏84. Concrete Baseline Contract

```text
1. Auction participation is disabled by default.
2. Opening and Closing are explicit market regimes.
3. Every instrument has per-symbol session/auction state.
4. Auction rules/cutoffs are versioned capabilities, never Strategy constants.
5. Market calendar is versioned and timezone-aware.
6. Missing/stale auction data never becomes zero/valid data.
7. Auction research uses point-in-time snapshots only.
8. Final imbalance / official price cannot leak into pre-cross decisions.
9. Internal cutoff is earlier than effective external cutoff.
10. Auction orders count as pending exposure until authoritative resolution.
11. UNKNOWN_ORDER_EFFECT blocks duplicate exposure and requires reconciliation.
12. Post-cross broker reconciliation precedes new continuous exposure.
13. Auction features remain a separate family until incremental value is proven.
14. AuctionExecutionPolicy is separate from continuous ExecutionPolicy.
15. No silent fallback between LOO/LOC/MOO/MOC or ordinary orders.
16. If future participation is studied, price-protected auction intent is first challenger.
17. Paper validates lifecycle, not real auction execution quality.
18. No future environment with financial risk is enabled by this sheet.
```

---

## ‏85. Confidence

### ‏High

- ‏Auction awareness should be explicit even when participation is disabled.
- ‏Opening/Closing should be separate regimes.
- ‏Point-in-time integrity and versioned cutoffs are required.
- ‏Per-symbol open state is safer than global `market_is_open`.
- ‏Reconciliation/unknown-effect rules from stages 29/33/34 apply here.

### ‏Medium

- ‏Auction-aware regime filtering may improve robustness near open/close.
- ‏Price-protected auction intent is the best first execution challenger if participation becomes justified.

### ‏Low / Must Measure

- ‏Whether imbalance features add predictive edge for our scanner.
- ‏Whether auction participation improves net outcome.
- ‏Which venue-specific feature combinations are useful.
- ‏Whether Opening or Closing deserves research priority first.

---

## ‏86. Relationship to Earlier Sheets

```text
05 Market Data
→ auction feed provenance / freshness

06 Time / Sampling / Latency
→ clocks / cutoffs / tail latency

07 Universe
→ listing venue / eligibility

15 Candidate Gate
→ auction NO_TRADE gates

18 Costs
→ auction-specific cost attribution

19 Risk
→ pending committed exposure

20-23 Backtest / Validation
→ point-in-time / leakage / OOS

27 Replay
→ auction event replay

29 Broker API
→ order state / reconciliation

32 Data vs Execution
→ auction observation truth != fill truth

33-36 State / Recovery / Safety
→ committed state / unknown / kill switch

39 Routing
→ primary auction routing context

40 Hidden / ATS
→ non-displayed auction interest may exist

41 Broker Algos
→ auction orders remain execution tools, not alpha
```

---

## ‏87. Relationship to Later Sheet 43

‏שלב 43 יעסוק ב־`Halts`, ‏`LULD` ו־`Fast Markets`.

‏החיבור הישיר:

```text
Auction state
→ may transition into / from halt-related states
→ reopening auction
→ per-symbol tradability
→ data freshness / no-update semantics
```

‏אין לערבב Opening/Closing Auction עם Halt/Reopening Auction; הם יקבלו state/rule semantics נפרדים.

---

## ‏88. Recommendation Summary

‏ברירת המחדל לרובוט שלנו היא **Auction-aware but non-participating**.

```text
Know the auction.
Record the auction.
Model the auction.
Respect the auction's clock and state.
Do not trade the auction by default.
```

‏הערך המיידי אינו “לתפוס imbalance”.

‏הערך המיידי הוא להפוך את המערכת ליותר נכונה סביב שני המעברים המסוכנים ביותר של יום המסחר:

```text
PRE_OPEN → OPEN
PRE_CLOSE → CLOSE
```

‏רק לאחר Dataset point-in-time, Replay, Shadow ו־Evidence של `Net Edge` נפתח Auction execution challenger נפרד — וגם אז תחת Capability, Price Protection, Risk, Safety, Cutoff ו־Reconciliation מפורשים.
