# ‏07 — Recommendation Sheet: Trading Universe

> ‏מקור לימודי עיקרי: `../07-BUILDING-THE-TRADING-UNIVERSE.md`.
>
> ‏מטרת הקובץ: לקבוע איזה Universe צריך להיות Baseline עבור רובוט `Short-Horizon Momentum`, אילו ניירות מורשים בכלל להתחרות, אילו מצבים חוסמים אותם לפני Score, ואיך מנהלים Universe דינמי, position-size-aware וניתן לשחזור בלי לערבב Eligibility עם Ranking.

---

## ‏1. Decision

‏מהו מרחב החיפוש הנכון לרובוט שלנו — רחב מספיק כדי לא לפספס הזדמנויות, אבל נקי מספיק כדי שכל Instrument שנשאר הוא מוצר שהמערכת מבינה, מקבלת עליו נתונים תקינים, יכולה לסחור בו בפועל ויכולה לצאת ממנו בצורה סבירה ביחס לגודל העסקה?

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`: Universe הוא Funnel, לא רשימה אחת

```text
REFERENCE UNIVERSE
→ INSTRUMENT-TYPE ELIGIBILITY
→ BROKER / ACCOUNT ELIGIBILITY
→ MARKET-STATUS ELIGIBILITY
→ DATA-QUALITY ELIGIBILITY
→ LIVE EXECUTABILITY ELIGIBILITY
→ ACTIVE UNIVERSE
→ MOMENTUM / STRATEGY FILTERS
→ CANDIDATE SET
→ RANKING
→ ABSOLUTE TRADE GATE
→ TRADE / NO TRADE
```

‏כל שלב צריך לשמור סיבה מפורשת ל־pass/reject.

### ‏`P1 — Preferred Default`: Core Universe ראשוני = US exchange-listed common stocks

```text
include:
- US exchange-listed common stocks
- selected ADR / ADS where identity, broker support and data are clean

exclude initially:
- OTC
- warrants
- rights
- units
- preferred stocks
- test issues
- unsupported / unmapped instruments
```

‏`ETF` נשמר כ־Universe נפרד למחקר, לא מעורב אוטומטית עם common stocks.

### ‏`P0 — Required Before Live Risk`: Exists != Tradable != Active

```text
exists
AND instrument_type_allowed
AND broker_contract_resolved
AND account_permission_valid
AND session_supported
AND trading_status_valid
AND data_fresh
AND executable_quote_valid
=> eligible to enter Active Universe
```

‏כל חוסר ודאות מהותי בשכבות האלה חוסם Entry.

### ‏`P0 — Required Before Live Risk`: Halt / pause / unknown trading state הם Hard Gate

```text
halted
paused
IPO not yet trading
quotation unavailable
trading status unknown
=> NO NEW ENTRY
```

‏חזרה מ־Halt אינה מעבר מיידי ל־normal.

```text
HALTED
→ RESUMING / SPECIAL STATE
→ fresh quote + spread + activity + data-health validation
→ NORMAL ELIGIBLE
```

### ‏`P1 — Preferred Default`: להפריד Static Eligibility מ־Dynamic Eligibility

‏Static / slow-changing:

```text
instrument type
listing venue
reference status
ETF flag
broker mapping
account product permission
corporate-action identity
```

‏Dynamic:

```text
session
halt / pause state
quote validity
quote freshness
spread
visible executable size
recent activity
current price
```

### ‏`P1 — Preferred Default`: Position-size-aware tradability

‏השאלה אינה "האם המניה נזילה באופן כללי" אלא:

```text
Can my intended order size enter and exit
within acceptable price / spread / latency assumptions?
```

‏לכן Candidate eligibility צריכה להתחשב ב־`intended_qty`, visible size, spread, recent activity ו־exit feasibility — לא רק ב־Daily Volume.

### ‏`P1 — Preferred Default`: Hard Filters רק למצבים שבאמת פוסלים Eligibility

‏Hard Gate מתאים ל־test issue, unsupported type, no broker mapping, not tradable by account, halt/pause, unknown trading state, stale/missing critical data או invalid executable quote.

‏לעומת זאת `recent trade count`, volume burst, price, volatility או spread שהוא רק פחות אטרקטיבי — אינם Hard Filters אוטומטיים לפני Evidence.

### ‏`P1 — Preferred Default`: Universe versioned + auditable

‏כל session/day צריך להיות ניתן לשחזור:

```text
universe_version
built_at
reference_sources
rule_version
instrument_count
included_types
excluded_types
broker/account context
session
```

‏לכל Candidate/Trade שומרים את `universe_version` שהפך אותו ל־eligible.

### ‏`P0 — Required Before Live Risk`: Universe Health Gate

‏ננטר לפחות:

```text
reference_count
mapped_count
tradable_count
fresh_data_count
normal_status_count
active_count
candidate_count
```

‏אם אחד השלבים קורס בצורה חריגה:

```text
UNIVERSE_HEALTH = DEGRADED / UNKNOWN
=> BLOCK NEW ENTRIES
```

### ‏`P1 — Preferred Default`: Historical Universe הוא Dataset נפרד

‏Backtest אינו רשאי לקחת את רשימת ה־symbols של היום ולהעמיד פנים שזו הרשימה שהייתה קיימת בעבר.

‏צריך, לפי עומק המחקר:

```text
instrument existence by date
listing / delisting dates
symbol / identity changes
corporate actions
historical eligibility rules
new listings
historical universe snapshot/version
```

---

## ‏3. Why

### ‏Fact

‏רשימות symbols אמריקאיות יכולות להכיל סוגי Instruments שונים, ולא רק common stocks.

### ‏Fact

‏Reference existence אינו מבטיח שה־execution broker או החשבון המסוים יכולים לסחור ב־instrument בזמן נתון.

### ‏Fact

‏Daily Volume אינו מתאר בהכרח את הנזילות או הפעילות ברגע שבו רוצים להיכנס ולצאת.

### ‏Fact

‏Symbol אינו מזהה נצחי; tickers יכולים להשתנות בעקבות corporate actions, mergers, reorganizations או relistings.

### ‏Fact

‏Backtest על universe נוכחי בלבד יכול לסבול מ־survivorship bias.

### ‏Fact — verified 2026-10-26

‏Nasdaq Trader Symbol Directory עדיין מתעדכן לאורך היום ומספק, בין היתר, `Test Issue`, ‏`ETF`, ‏`Round Lot Size`, ‏market/listing metadata ו־file creation time.

### ‏Fact — verified 2026-10-26

‏Nasdaq Trader מפרסם current trading halts ו־reason codes, כולל `LUDP/LUDS`, ‏IPO states, quotation unavailable, corporate-action states ו־resumption information.

### ‏Fact — verified 2026-10-26

‏`LULD` הוא NMS Plan שמטרתו למנוע trades מחוץ ל־price bands מוגדרים ולנהל extreme volatility; לכן LULD-related state הוא market-status/risk input ולא momentum feature רגיל.

### ‏Judgment

‏למערכת שלנו עדיף להתחיל ב־homogeneous-enough Core Universe של common stocks ולבודד ETFs ומוצרים מיוחדים לקבוצות מחקר נפרדות.

### ‏Judgment

‏Thresholds של liquidity/activity לא צריכים להיקבע כ־Hard Filters לפני שנמדד האם הם משפרים net outcome ומונעים failure modes אמיתיים.

### ‏Hypothesis

‏Core Universe רחב של exchange-listed common stocks + selected ADR/ADS יכיל מספיק הזדמנויות ל־short-horizon momentum כך שאין צורך להוסיף OTC, warrants או special products בגרסה הראשונה.

---

## ‏4. Universe Layers

| Layer | שאלה | Baseline |
|---|---|---|
| `REFERENCE` | ‏מה קיים? | US exchange-listed reference master |
| `TYPE-ELIGIBLE` | ‏איזה סוג מוצר מותר? | common stocks + selected ADR/ADS |
| `BROKER-ELIGIBLE` | ‏האם הברוקר/חשבון יכולים לסחור? | resolved contract + permissions |
| `MARKET-VALID` | ‏האם המסחר תקין כרגע? | supported session, not halted/paused |
| `DATA-VALID` | ‏האם אנחנו יודעים מה קורה? | live/fresh/valid required fields |
| `EXECUTABLE` | ‏האם גודל העסקה שלנו סביר כרגע? | spread/size/activity/exit feasibility |
| `ACTIVE` | ‏האם הוא רשאי להתחרות? | all hard gates pass |
| `CANDIDATE` | ‏האם האסטרטגיה רואה setup? | strategy filters pass |
| `RANKED` | ‏מי הטוב ביחס לאחרים? | ranking layer |
| `TRADEABLE NOW` | ‏האם הטוב ביותר מספיק טוב? | absolute trade gate |

---

## ‏5. Instrument-Type Policy

| Instrument type | Baseline | Priority | Reason |
|---|---|---:|---|
| US common stock | Include | `P1` | Core research population |
| ADR / ADS | Selected include | `P2` | tradable but distinct identity/context |
| ETF | Separate universe | `P2` | different economic driver; valuable challenger |
| Preferred stock | Exclude initially | `P4` | different structure/liquidity profile |
| Warrant | Exclude initially | `P4` | different payoff / spread / behavior |
| Rights | Exclude initially | `P4` | specialist product |
| Units | Exclude initially | `P4` | specialist/composite instrument |
| OTC | Exclude initially | `P4` | separate market structure/execution profile |
| Test issue | Reject | `P0` | not a production trading target |
| Unknown type | Reject until classified | `P0` | no silent eligibility |

---

## ‏6. Static Eligibility Contract

```text
InstrumentId
Symbol
SecurityName
SecurityType
ListingVenue
ETFFlag
TestIssueFlag
ListingStatus
FinancialStatus when provided
RoundLotSize
ProviderInstrumentId
BrokerContractId
FirstKnownListingDate when available
DelistingDate when applicable
IdentityVersion
ReferenceSource
ReferenceUpdatedAt
```

‏לא כל מקור יספק כל field, אבל missingness חייבת להיות מפורשת.

---

## ‏7. Dynamic Eligibility Contract

```text
session
trading_status
halt_or_pause_state
quote_valid
quote_age
last_trade_age when relevant
bid
ask
bid_size
ask_size
spread
recent_trade_activity
recent_volume
broker_connection_state
market_data_state
intended_order_qty
```

---

## ‏8. Hard Filters vs Research Features

### ‏Hard by default

```text
test issue
unsupported / unknown instrument type
no resolved broker contract for live
missing required account permission
halt / pause / unknown trading state
critical quote missing
critical data stale
unsupported session
invalid instrument identity
```

### ‏Do not hard-code initially without evidence

```text
minimum stock price
maximum stock price
minimum daily volume
minimum trades_10s
minimum volume_10s
maximum spread_bps
minimum visible size
minimum market cap
minimum listing age
```

‏אם threshold הופך ל־Hard Filter, צריך לשמור Evidence שמצדיק אותו.

---

## ‏9. Halt / Resume / LULD Policy

### ‏Halt

```text
halted / paused
=> remove from entry-eligible universe immediately
```

### ‏Resume

```text
resume detected
→ refresh canonical market state
→ require fresh bid/ask
→ validate spread / sizes / activity
→ confirm broker/data status
→ optional measured cooldown
→ eligible only if all gates pass
```

### ‏LULD

‏LULD-related state צריך להיות observable ולהיכנס ל־execution/risk contract.

‏`P4`: מחקר ייעודי ל־post-halt / near-band behavior יכול להיווצר בעתיד, אך אינו Core baseline.

---

## ‏10. New Listings / IPO Policy

‏`IPO / new listing` אינו common-stock-normal אוטומטי ביום הראשון.

```text
new_listing = separate classification
```

‏אפשר להחריג מ־Core baseline עד שיש live evidence מספיק, או להכניס ל־separate research cohort. אין לקבוע listing-age threshold מספרי לפני ניתוח.

---

## ‏11. Position-Size-Aware Executability

‏במקום:

```text
ADV > arbitrary number
=> liquid
```

‏נרצה להעריך:

```text
entry_qty / visible_ask_size
exit_qty / visible_bid_size
spread_bps
recent turnover
trade frequency
expected slippage
recent quote stability
```

‏ה־Universe יכול להשתנות כאשר ההון, position sizing policy, session או market regime משתנים.

---

## ‏12. Use When

‏ה־Baseline מתאים כאשר:

- ‏המטרה היא broad-market US equity scanning.
- ‏רוצים להשוות אלפי stocks תחת strategy אחת.
- ‏ההחזקה היא שניות עד עשרות שניות.
- ‏גודל העסקה קטן יחסית לשוק אך execution economics עדיין קריטיים.
- ‏רוצים להפריד Instrument eligibility מ־momentum ranking.
- ‏רוצים backtest/replay שניתן לשחזור.

---

## ‏13. Do Not Use When

‏נדרש Universe אחר כאשר האסטרטגיה עצמה מיועדת ל־ETF-only, OTC, warrants/rights/preferreds, auctions, post-halt specialist trading, IPO/new-listing specialist trading או thematic/single-sector universe by design.

---

## ‏14. Alternatives

| גישה | יתרון | חיסרון | דרגה |
|---|---|---|---|
| All exchange-listed common stocks | breadth + clean comparison | דורש data scale טוב | `Preferred Default` |
| Fixed curated watchlist | פשוט וזול | מפספס movers חדשים | `Challenger` |
| Top-volume universe | קל לביצוע | יכול לפספס activity bursts | `Challenger` |
| Broker scanner as universe | מהיר להקמה | black-box/provider-dependent | `Avoid as sole source` |
| ETFs mixed with stocks | universe גדול יותר | מערבב economic populations | `Avoid initially` |
| ETF-only | homogeneous alternative | פחות single-stock events | `Challenger` |
| Small-cap-only | volatility/opportunity | execution/tail risks | `Advanced research` |
| OTC/special products | עוד opportunities | market structure שונה | `Specialist` |

---

## ‏15. Trade-offs

### ‏Breadth vs Data/Compute Cost

‏Universe רחב מגדיל discovery probability אבל דורש יותר reference normalization, market-data coverage, state memory, feature updates ו־health monitoring.

‏הפתרון המומלץ הוא lightweight wide state + deep candidate state, לא צמצום אגרסיבי רק כדי להקל על הקוד.

### ‏Hard Filters vs False Exclusion

```text
safety / validity => hard
attractiveness     => usually score/filter experiment
```

### ‏Homogeneity vs Opportunity Breadth

‏Common stocks בלבד נותנים population נקי יותר. הוספת ETFs/ADRs/special products צריכה labels ו־evaluation נפרד.

---

## ‏16. What I Would Avoid Initially

- ‏`scan every ticker string` בלי Security Master.
- ‏OTC + special products לפני Research נפרד.
- ‏ETFs mixed invisibly with stocks.
- ‏Magic price/ADV thresholds.
- ‏auto-trading immediately after halt resume.
- ‏excluding low-price/small-cap stocks solely by category.
- ‏Live entry כאשר instrument identity אינה חד-משמעית.

---

## ‏17. What to Add Later

1. ‏ETF universe נפרד.
2. ‏ADR/ADS cohort analysis.
3. ‏new-listing/IPO cohort.
4. ‏post-halt cohort.
5. ‏relative liquidity/activity thresholds לפי regime.
6. ‏market-cap / float metadata אם מוכח predictive/execution value.
7. ‏borrow/shortability universe אם בעתיד strategy תכלול short.
8. ‏corporate-action event stream עשיר יותר.
9. ‏multi-provider reference reconciliation.
10. ‏dynamic universe prioritization בלי לאבד minimum breadth.

---

## ‏18. Required Data / Evidence

```text
universe_version
instrument_id
symbol
security_type
listing venue
reference source
broker contract mapping
eligibility states
rejection reason(s)
session
trading status
quote/data freshness
spread
visible sizes
recent trade count
recent volume
intended order size
strategy feature vector
whether candidate passed
future outcome even for rejected research samples when feasible
```

‏במיוחד חשוב לשמור rejected samples למחקר, אחרת לא נוכל לדעת אם Filter מוחק Edge.

---

## ‏19. Promotion Criteria

### ‏Instrument class חדש ל־Core

- ‏identity/reference mapping אמין.
- ‏market-data coverage מספק.
- ‏broker/account support מאומת.
- ‏execution profile שנמדד.
- ‏OOS/forward strategy evidence.
- ‏net outcome חיובי לאחר costs.
- ‏failure modes ניתנים לשליטה.

### ‏Hard Filter חדש

- ‏מסיר failure/negative-EV population באופן יציב.
- ‏אינו מוחק משמעותית positive-EV opportunities.
- ‏שורד periods/regimes שונים.
- ‏מובן וניתן ל־RCA.
- ‏נותן תועלת מעבר לשימוש באותו variable כ־ranking feature.

---

## ‏20. Rejection Criteria

‏נבטל/נרכך Universe rule אם:

- ‏הוא מבוסס על threshold שרירותי.
- ‏הוא נראה טוב רק in-sample.
- ‏הוא מוחק disproportionately winners עתידיים.
- ‏הוא גורם universe instability ללא תועלת כלכלית.
- ‏הוא תלוי ב־provider quirk במקום ב־strategy requirement.
- ‏הוא אינו ניתן לשחזור היסטורי.
- ‏הוא מייצר population leakage בין instrument classes שונים.

---

## ‏21. Metrics

### ‏Universe Funnel

```text
reference_count
classified_count
broker_mapped_count
tradable_count
fresh_data_count
normal_status_count
executable_count
active_count
strategy_filter_count
candidate_count
```

### ‏Health

```text
unmapped_ratio
unknown_type_ratio
stale_data_ratio
halted_count
reference_refresh_age
broker_mapping_failure_rate
universe_size_deviation
```

### ‏Research

```text
candidate rate by instrument class
net EV by instrument class
rejection reason distribution
future outcome after rejection
opportunity count
fill rate by universe cohort
slippage by cohort
halt incidence
```

### ‏Historical Integrity

```text
% sessions with versioned universe snapshot
identity mapping coverage
historical delisting coverage
corporate-action reconciliation failures
```

---

## ‏22. Failure Modes

- ‏Symbol list polluted with special products.
- ‏Broker cannot resolve selected symbol.
- ‏Stale universe after rename/delist/new listing.
- ‏Halted symbol remains candidate.
- ‏Immediate post-halt entry on stale/pre-halt state.
- ‏Survivorship bias in backtest.
- ‏Hard filter overfit.
- ‏Daily-volume illusion.
- ‏Universe collapse unnoticed after feed/reference/auth failure.
- ‏Identity collision / ticker reuse.

---

## ‏23. User-Specific Application

‏לרובוט שלנו יש יתרון בכך שה־position size קטן יחסית לשוק מוסדי. לכן לא נכון להעתיק minimum-liquidity thresholds של institution גדול.

```text
broad search space
+
small-position-aware executability
+
strict market/data validity
+
absolute NO TRADE gate
```

‏גם לאחר שה־Universe מסונן:

```text
best available candidate may still be bad
=> NO TRADE
```

---

## ‏24. Concrete Baseline Contract

```text
instrument exists in current reference universe
AND security_type in allowed_core_types
AND test_issue == false
AND broker_contract_resolved
AND account_permission_ok
AND supported_session
AND trading_status == normal
AND not halted / paused
AND critical market data live and fresh
AND bid/ask valid
AND intended size passes minimum executability check
=> instrument may enter ACTIVE UNIVERSE

otherwise
=> excluded with explicit reason
```

‏לאחר מכן בלבד:

```text
ACTIVE UNIVERSE
→ strategy features
→ filters
→ ranking
→ candidate
→ execution recheck
→ TRADE / NO TRADE
```

---

## ‏25. Universe Refresh Policy

### ‏Before session

```text
load reference data
normalize identities
resolve broker mappings
apply static type rules
record universe_version
```

### ‏During session

```text
consume status changes
halt/pause updates
new listing / reference changes when available
broker permission/contract failures
data-health changes
```

### ‏Periodic reconciliation

‏להשוות current state מול authoritative sources בקצב שאינו מכביד על hot path.

### ‏Next session

‏Rebuild/refresh rather than assuming yesterday's universe is still complete.

---

## ‏26. Universe Health Circuit Breaker

‏דוגמאות ל־conditions:

```text
reference_count unexpectedly collapsed
broker_mapping failures spiked
fresh-data eligible ratio collapsed
unknown trading-status ratio elevated
reference source stale
```

‏תגובה:

```text
block new entries
preserve position/order management priority
raise diagnostic alert
require reconciliation
```

---

## ‏27. Historical Research Contract

```text
Decision date/time T
→ load instruments that were eligible/existing at T
→ apply rule version valid for experiment
→ use only data available by T
→ preserve delisted/renamed instruments
→ keep corporate-action identity consistent
```

‏אין לבצע:

```text
current winners/current survivors
→ project backward
```

---

## ‏28. Confidence

### ‏High

- ‏Universe חייב להיות layered ולא ticker dump.
- ‏Hard validity/safety gates צריכים לבוא לפני Ranking.
- ‏Halt/unknown trading state חוסמים כניסה.
- ‏Historical universe נחוץ למחקר שמבקש להימנע מ־survivorship bias.
- ‏Instrument identity חייבת להיות stable מעבר ל־ticker בלבד.
- ‏Universe health abnormality צריכה לחסום Entries.

### ‏Medium-High

- ‏Common stocks כ־Core baseline ו־ETF כ־separate universe.
- ‏Selected ADR/ADS inclusion רק כאשר identity/data/broker mapping נקיים.

### ‏Low / Unproven

- ‏Threshold מספרי כלשהו ל־price, volume, activity, market cap, spread או listing age.
- ‏הטענה ש־instrument class מסוים בהכרח profitable יותר.

---

## ‏29. Time-Sensitive Facts

‏לפני Live implementation יש לאמת מחדש:

1. ‏מבנה/שדות/קצב העדכון של reference source שנבחר.
2. ‏broker-supported products, contract mapping ו־account permissions.
3. ‏current trading-halt/status interfaces and reason codes.
4. ‏LULD Plan amendments / operational changes.
5. ‏listing venues / exchange taxonomy.
6. ‏IPO/new-listing status semantics.
7. ‏session support לפי broker/data source.
8. ‏corporate-action/reference-data licensing and refresh behavior.

---

## ‏30. Current Verification Snapshot — 2026-10-26

- ‏`Nasdaq Trader — Symbol Directory Definitions`: הקבצים מתעדכנים לאורך היום ומספקים שדות כגון `Test Issue`, ‏`ETF`, ‏`Round Lot Size`, ‏market category ו־file creation time.
- ‏`Nasdaq Trader — Current Trading Halts / Halt Codes`: קיימים current halt/resumption records ו־reason codes כולל `LUDP/LUDS`, ‏IPO states, ‏corporate-action/quotation states ועוד.
- ‏`LULD Plan`: התוכנית היא NMS Plan פעיל לניהול extraordinary market volatility באמצעות price bands ו־trading pauses.

‏האימות הזה הוא Snapshot נוכחי; Live configuration צריך לאמת מחדש source semantics ותדירות עדכון.

---

## ‏31. Relationship to Later Recommendation Sheets

‏הקובץ הזה קובע מי בכלל רשאי להתחרות.

‏הוא אינו מחליט עדיין:

- ‏`08+` — איזה Momentum signal מנצח.
- ‏`10` — איך activity/trade count משמש Feature.
- ‏`11` — Liquidity/Executability model עמוק.
- ‏`12` — Filters סופיים.
- ‏`14` — Score/Ranking.
- ‏`15` — Candidate / Trade-No-Trade gate.
- ‏`18` — all-in execution economics.
- ‏Backtest sheets — historical-universe implementation details.

---

# ‏Recommendation Summary

```text
P0  Unknown identity / unsupported mapping => exclude
P0  Halt / pause / unknown trading state => NO NEW ENTRY
P0  Critical stale/missing data => exclude from Active Universe
P0  Abnormal universe-health collapse => block new entries
P1  Layered Reference → Tradable → Active → Candidate funnel
P1  Core = US exchange-listed common stocks
P1  Selected ADR/ADS only with clean identity/data/broker support
P1  ETFs as separate research universe
P1  Position-size-aware executability, not ADV alone
P1  Versioned universe + explicit rejection reasons
P1  Historical universe for unbiased research
P2  Relative/regime-aware universe thresholds after evidence
P3  New-listing/post-halt cohorts as challengers
P4  OTC / warrants / rights / units / preferreds as specialist universes
```

> ‏**המלצת ה־Baseline: התחל רחב במניות אמריקאיות רגילות, אבל אל תיתן לכל ticker להתחרות. Instrument חייב לעבור identity, broker, market-status, data-quality ו־executability gates לפני שהוא בכלל מקבל Momentum score. Universe הוא מנגנון Eligibility ובטיחות — Ranking מתחיל רק אחריו.**