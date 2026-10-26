# ‏43 — Recommendation Sheet: Halts / LULD / Fast Markets

> ‏מקור לימודי עיקרי: `../43-HALTS-LULD-AND-FAST-MARKETS.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי, ארכיטקטוני ובטיחותי למצבים שבהם הנחות המסחר הרציף נשברות — `Trading Halt`, ‏`LULD Limit State`, ‏`Trading Pause`, ‏`Straddle State`, ‏reopening ו־Fast-Market degradation — כך שהמערכת לא תפרש silence, quote ישן או resume event כאילו מדובר בעוד Snapshot רגיל.
>
> ‏המקטע נשאר ברמת `Research / Replay / Shadow / Paper` ותכנון Production. הוא אינו הוראה להפעלה בכסף אמיתי.

---

## ‏1. Decision

‏החלטת ה־Baseline היא להפוך `Trading Status` ל־Domain Truth עצמאי שמקדים Ranking ו־Execution.

```text
Market / Exchange Status
→ Canonical Trading Status
→ Status Freshness / Provenance
→ Tradability Gate
→ Market Data / Feature Freshness
→ Ranking
→ Candidate Gate
→ Risk
→ Safety
→ Execution
```

‏העיקרון המחייב:

```text
Status before Score.
Unknown before Guess.
Broker Fill / Position Truth survives a halt.
Resume event != Ready for new risk.
```

‏המערכת לא תסיק שהנייר tradable רק משום שיש `Last`, ‏Bid/Ask, Broker connection או שעבר timer מסוים.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: ‏Canonical `TradingStatus`

‏נחזיק State מפורש כגון:

```text
UNKNOWN
PRE_OPEN
OPEN
LIMIT_STATE
STRADDLE_STATE
TRADING_PAUSE
HALTED_NEWS
HALTED_REGULATORY
HALTED_OPERATIONAL
HALTED_OTHER
REOPENING_PENDING
REOPENING
POST_REOPEN_VALIDATION
CLOSED
```

‏ה־Provider/Exchange labels נשמרים Raw וממופים ל־canonical state.

### ‏`P0 — Required`: ‏Status Gate לפני Ranking

‏ב־Baseline:

```text
if canonical_trading_status != OPEN:
    candidate_eligible = false
```

‏Reason code נשמר, למשל:

```text
HALTED
LULD_LIMIT_STATE
LULD_TRADING_PAUSE
STRADDLE_STATE
REOPENING_NOT_READY
TRADING_STATUS_UNKNOWN
TRADING_STATUS_CONFLICT
```

‏אנחנו לא משאירים halted symbol עם score ישן בתוך ה־ranking.

### ‏`P0 — Required`: ‏`UNKNOWN` ו־Conflict חוסמים Risk חדש

‏אם Status חסר, stale או מקורות authoritative סותרים זה את זה:

```text
new_risk = DENIED
```

‏לא מבצעים majority vote בין feeds.

### ‏`P0 — Required`: ‏Halt אינו מוחק Position או Order

‏אם Position קיימת:

```text
halt
!=
flat
```

‏ואם Order היה Working:

```text
halt
!=
cancelled
```

‏Broker reconciliation נשאר מקור האמת ל־Orders/Fills/Positions.

### ‏`P0 — Required`: ‏Exit requirement נשמר גם כאשר Exit אינו executable

‏נפריד:

```text
strategy_exit_due
execution_possible
```

‏אם Exit נדרש בזמן Halt:

```text
EXIT_REQUIRED
```

‏נשמר durable עד resolution.

### ‏`P0 — Required`: ‏No Resume By Timer

‏אסור:

```text
pause started
→ wait N minutes
→ READY
```

‏נכון:

```text
Authoritative Resume
→ Market Generation Change
→ Broker Reconciliation
→ Market-State Rebuild
→ Freshness Validation
→ Feature Warm-Up
→ Liquidity / Spread Validation
→ Safety / Risk Validation
→ Candidate Eligibility
```

### ‏`P0 — Required`: ‏`market_generation`

‏כל Halt/Reopen boundary מגדיל generation:

```text
market_generation++
```

‏Intent או Feature שנוצרו לפני generation הנוכחי אינם מורשים לייצר Entry חדש בלי Decision חדש.

### ‏`P0 — Required`: ‏Market-Wide Status נפרד מ־Symbol Status

‏נחזיק Axis נוסף:

```text
MarketWideStatus
- NORMAL
- MWCB_LEVEL_1
- MWCB_LEVEL_2
- MWCB_LEVEL_3
- MARKET_WIDE_PAUSE
- CLOSED
- UNKNOWN
```

‏Market-wide halt חוסם Entries גלובלית.

### ‏`P1 — Preferred`: ‏LULD Context כחלק מ־Execution/Risk Context

‏כאשר זמין:

```text
reference_price
lower_band
upper_band
distance_to_lower_band
distance_to_upper_band
rule_version
as_of_time
```

‏LULD Context אינו Alpha בפני עצמו.

### ‏`P1 — Preferred`: ‏Fast Market כ־Derived Regime נפרד

‏נחזיק למשל:

```text
NORMAL
FAST
EXTREME
UNKNOWN
```

‏זה אינו Exchange Status.

‏הוא נגזר מ־latency, quote/trade rates, spread/depth instability, processing lag ו־fresh coverage.

### ‏`P1 — Preferred`: ‏ב־`EXTREME` קודם כל Containment

‏בשלב הראשון:

```text
extreme processing lag
OR stale fresh-coverage
OR unstable execution state
=> block new entries
```

‏רק אחר כך בודקים adaptive sizing/tactics כ־Challengers.

---

## ‏3. Hierarchy

```text
Baseline
→ explicit authoritative trading-status gate
→ halt/pause/unknown blocks new risk
→ preserve positions/orders and reconcile
→ post-reopen validation before eligibility

Preferred Default
→ LULD context + market generation
→ status provenance / freshness
→ fast-market observability + conservative containment

Challenger
→ empirically calibrated LULD-proximity gate
→ post-reopen cooldown / readiness model
→ context-aware reduced-size policy in FAST regime

Advanced Option
→ multi-source status validation
→ calibrated fast-market model
→ post-halt research family

Specialist Option
→ venue-specific reopening models
→ advanced LULD / halt forecasting research

Avoid Unless Evidence
→ resume-by-timer
→ reuse pre-halt signal after reopen
→ infer halt from silence as historical truth
→ chase reopening by default
→ hard-code LULD rules into Strategy
```

---

## ‏4. Priority Map

| Priority | Recommendation |
|---|---|
| `P0` | ‏Canonical Trading Status |
| `P0` | ‏Status Gate before Ranking/Entry |
| `P0` | ‏UNKNOWN / conflict fail closed for new risk |
| `P0` | ‏Working-order / position reconciliation |
| `P0` | ‏Durable `EXIT_REQUIRED` |
| `P0` | ‏No timer-based resume |
| `P0` | ‏Market generation + stale-intent invalidation |
| `P0` | ‏Market-wide halt state |
| `P0` | ‏Non-tradable intervals in Replay/Backtest |
| `P1` | ‏Status provenance + raw reason codes |
| `P1` | ‏LULD context / band distance |
| `P1` | ‏Post-reopen readiness contract |
| `P1` | ‏Fast-market observability / backpressure |
| `P1` | ‏Halt event packet + golden corpus |
| `P2` | ‏LULD-proximity Shadow gate |
| `P2` | ‏Post-reopen cooldown experiment |
| `P2` | ‏Dual-provider status diagnostics |
| `P3` | ‏Dynamic reduced-size Fast-Market policy |
| `P3` | ‏Post-halt strategy research |
| `P4` | ‏Venue-specific halt/reopen execution models |

---

## ‏5. Fact / Judgment / Hypothesis

### ‏Fact

- ‏Trading Halt/Trading Pause יכול להפוך שוק שהיה tradable ל־non-tradable באופן מיידי.
- ‏Broker יכול להישאר connected ואף לקבל API request בזמן שהשוק עצמו אינו executable.
- ‏Position קיימת אינה נעלמת בזמן Halt.
- ‏Cancel request אינו Cancel confirmation.
- ‏Reopening יכול ליצור מחיר, spread ו־liquidity שונים מהותית מ־pre-halt state.
- ‏LULD משתמש ב־price bands סביב Reference Price לפי כללי Plan versioned.
- ‏Limit State ו־Trading Pause אינם אותו State.
- ‏Straddle State אינו Normal continuous state.
- ‏Market-Wide Circuit Breakers הם Axis גלובלי שונה מ־single-symbol halt.

### ‏Judgment

- ‏Trading Status צריך להיות Gate מוקדם יותר מה־Score.
- ‏`UNKNOWN` צריך להיחשב Risk State.
- ‏Resume event בלבד אינו מספיק ל־Entry readiness.
- ‏Pre-halt intents/features צריכים invalidation דרך `market_generation`.
- ‏Fast-Market hard guard צריך להיות פשוט ושמרני לפני adaptive sophistication.
- ‏Halt/LULD צריכים להיחשב קודם Execution/Risk condition ולא Alpha opportunity.

### ‏Hypothesis

- ‏Distance-to-band עשוי לשפר Execution Safety או Candidate filtering.
- ‏Post-reopen cooldown עשוי לשפר Net Execution Outcome.
- ‏Fast-Market derived regime עשוי להוסיף predictive/execution value מעבר ל־freshness alone.
- ‏Recent halt count / seconds since resume עשויים להיות execution-context features שימושיים.
- ‏Post-halt continuation/reversal עשוי להיות research family נפרד.

‏כל Hypothesis דורש Experiment נפרד.

---

## ‏6. Canonical Trading Status Contract

```text
TradingStatusSnapshot
{
  instrument_id,
  canonical_status,
  raw_status,
  raw_reason_code,
  reason_family,
  source,
  provenance,
  event_time,
  received_time,
  processed_time,
  status_age_ms,
  market_generation,
  luld_context?,
  expected_resume_if_known?,
  resumption_quote_time?,
  resumption_trade_time?,
  rule_version,
  mapping_version
}
```

‏`expected_resume_if_known` הוא מידע, לא authorization.

---

## ‏7. Provenance

‏נפריד:

```text
AUTHORITATIVE_EXCHANGE
SIP_OR_REGULATORY_FEED
BROKER
MARKET_DATA_PROVIDER
INFERRED
```

‏ונשמור Raw Event ככל שמתאפשר.

‏העיקרון:

```text
Observed != Derived != Inferred
```

‏לדוגמה:

```text
Observed: exchange reports LUDP
Derived: distance_to_upper_band = 14 bps
Inferred: halt suspected because active symbol suddenly went silent
```

---

## ‏8. Source Precedence

‏Baseline:

```text
Authoritative exchange / regulatory status
> broker status
> provider normalized status
> heuristic inference
```

‏אבל precedence הוא Configuration versioned ולא assumption scattered בקוד.

‏אם שני מקורות חזקים סותרים:

```text
STATUS_CONFLICT
```

‏וה־system חוסם new risk עד resolution.

---

## ‏9. Silence Classification

‏אין דבר כזה:

```text
no trade for 20s => illiquid
```

‏נרצה להבחין:

```text
QUIET
ILLIQUID
HALTED
TRADING_PAUSE
SESSION_CLOSED
FEED_STALE
STATUS_FEED_STALE
UNKNOWN
```

‏Heuristic silence detection משמש Safety suspicion בלבד.

---

## ‏10. `HALT_SUSPECTED`

‏אם Symbol היה פעיל מאוד ופתאום הפסיק להתעדכן בזמן ששאר השוק וה־Provider בריאים:

```text
HALT_SUSPECTED
→ block new entry
→ query/await authoritative status
```

‏לא נשמור אותו כ־historical Halt Fact אלא אם התקבל authoritative evidence.

---

## ‏11. Halt Reason Taxonomy

‏Canonical family:

```text
VOLATILITY
NEWS
REGULATORY
CORPORATE_ACTION
OPERATIONAL
MARKET_WIDE
OTHER
UNKNOWN
```

‏Raw reason code נשמר בנפרד.

‏News Halt, ‏LULD Pause ו־Operational Halt אינם אותה קבוצת מחקר.

---

## ‏12. Nasdaq Halt-Code Snapshot — Current Verification

‏נכון ל־`2026-10-27`, ‏Nasdaq Trader מתעדת בין היתר:

```text
LUDP = Volatility Trading Pause
LUDS = Volatility Trading Pause - Straddle Condition
MWC1 = Market Wide Circuit Breaker Halt - Level 1
MWC2 = Market Wide Circuit Breaker Halt - Level 2
MWC3 = Market Wide Circuit Breaker Halt - Level 3
```

‏העמוד גם מפריד בין:

```text
Resumption Quote Time
Resumption Trade Time
```

‏ולכן Quote Resume אינו בהכרח Trading Resume.

‏מקור נבדק: `Nasdaq Trader — Trading Halt Codes`, ‏2026-10-27.

---

## ‏13. LULD — Current Verification Snapshot

‏נכון ל־`2026-10-27`, אתר ה־LULD Plan הרשמי מתעד עבור Core/Regular Trading:

- ‏התכנית חלה על NMS Stocks המכוסים במהלך `09:30–16:00 ET`.
- ‏Reference Price הוא arithmetic mean של Eligible Reported Transactions על פני חמש הדקות הקודמות.
- ‏אם אין eligible trades בחלון, Reference Price קודם יכול להישאר בתוקף לפי כללי התכנית.
- ‏Reference Price חדש נכנס לאחר לפחות `30s` ורק אם החדש רחוק לפחות `1%` מה־Reference הנוכחי.
- ‏Price Bands נגזרים מ־Reference Price ומ־Percentage Parameter לפי Tier/price bucket.
- ‏Limit State שלא נפתר בתוך `15s` מוביל בדרך כלל ל־Trading Pause של חמש דקות.
- ‏ה־Pause יכול להתארך בחמש דקות נוספות.
- ‏Straddle State הוא State נפרד.

‏מקור נבדק: `luldplan.com`, ‏2026-10-27.

---

## ‏14. LULD Percentage Snapshot

‏לפי האתר הרשמי הנוכחי:

```text
Tier 1, previous close > $3
→ 5% parameter during the ordinary portion of the Core session

Tier 2, previous close > $3
→ 10% parameter
```

‏יש buckets שונים למחירים נמוכים יותר.

‏ב־25 הדקות האחרונות של המסחר הרגיל, bands מוכפלים עבור categories המוגדרות בתכנית.

‏המספרים אינם Strategy constants.

```text
MarketRuleProvider(as_of, instrument)
```

‏הוא ה־Contract.

---

## ‏15. Important 2026 Time-Sensitive Correction — Overnight LULD

‏נכון ל־`2026-10-27` קיימת נקודת מעבר קרובה:

- ‏SEC אישרה את `27th Amendment` ל־LULD Plan ב־`2026-08-05`.
- ‏ה־Amendment מוסיף `Overnight Price Bands` כחלק מהמעבר ל־`23/5 Trading`.
- ‏Filings עדכניים של הבורסות מתארים `Overnight Protected Hours` של `21:00–04:00 ET`.
- ‏ה־bands הראשוניים מתוכננים כ־static `±20%` סביב reference points שהוגדרו בתכנית.
- ‏לפי filings של NYSE ומספר venues נוספים, ההפעלה התעשייתית מתוכננת ל־`2026-12-06`.

‏כלומר:

```text
As of 2026-10-27:
current Core-session LULD rules are active now,
Overnight Price Bands are approved but future-effective for the planned 23/5 rollout.
```

‏לכן אסור לקודד:

```text
LULD only exists 09:30-16:00 forever
```

‏נשמור:

```text
rule_version
effective_from
effective_to?
session_scope
```

‏מקורות שנבדקו: `LULD Plan`, ‏SEC approval of Amendment 27, ‏2026 exchange rule filings.

---

## ‏16. `LuldContext`

```text
LuldContext
{
  rule_version,
  session_scope,
  tier,
  reference_price,
  lower_band,
  upper_band,
  reference_price_time,
  band_publish_time,
  distance_to_lower_bps,
  distance_to_upper_bps,
  state,
  as_of_time
}
```

‏Missing band אינו `0`.

```text
UNKNOWN
```

‏הוא value תקין.

---

## ‏17. Limit State vs Trading Pause

‏נשמור distinction מפורש:

```text
OPEN
→ LIMIT_STATE
→ either OPEN again
   or TRADING_PAUSE
```

‏Limit State אינו synonym של Halt.

‏המערכת אינה מחכה 15 שניות כדי לחסום Entry: עצם State הלא־רגיל כבר מסיר Candidate eligibility ב־Baseline.

---

## ‏18. Straddle State

‏`STRADDLE_STATE` מקבל State משלו.

‏הוא אינו:

```text
OPEN_NORMAL
```

‏ולא ייכנס ל־Entry pipeline ב־Baseline.

---

## ‏19. LULD Proximity

‏נשמור Diagnostic:

```text
distance_to_relevant_band_bps
```

‏אבל לא נקבע Hard Threshold שרירותי.

‏שלב ראשון:

```text
measure
→ bucket outcomes
→ measure execution degradation
→ shadow candidate gate
→ controlled experiment
```

---

## ‏20. `LULD_PROXIMITY` אינה Alpha

‏מניה המתקרבת ל־Upper Band עלולה להיראות מעולה ל־momentum ranking.

‏בדיוק שם ייתכנו:

```text
high prediction score
+
high execution uncertainty
```

‏לכן נשמר:

```text
PredictionScore
!=
ExecutionReadiness
```

---

## ‏21. Market-Wide Circuit Breakers — Current Verification

‏נכון ל־`2026-10-27`, ‏NYSE מתעדת thresholds מול previous-day S&P 500 close:

```text
Level 1 = 7%
Level 2 = 13%
Level 3 = 20%
```

‏בנוסף:

- ‏Level 1/2 לפני `15:25 ET` גורמים כיום ל־15-minute market-wide halt.
- ‏Level 1/2 ב־`15:25 ET` או אחריו אינם גורמים ל־halt חדש.
- ‏Level 3 בכל זמן עוצר את השוק לשארית היום.

‏אלה Market Rules versioned ולא constants ב־Strategy.

‏מקור נבדק: `NYSE Trading Information / MWCB`, ‏2026-10-27.

---

## ‏22. Market-Wide Safety Contract

‏אם:

```text
market_wide_status != NORMAL
```

‏אז:

```text
new_entries_global = BLOCKED
```

‏Existing positions עדיין נשמרות ב־Risk Truth.

---

## ‏23. Halt State Machine

‏מסלול LULD טיפוסי אפשרי:

```text
OPEN
→ LIMIT_STATE
→ TRADING_PAUSE
→ REOPENING_PENDING
→ REOPENING
→ POST_REOPEN_VALIDATION
→ OPEN
```

‏News/regulatory Halt יכול לעקוף `LIMIT_STATE`.

---

## ‏24. `market_generation`

‏בכל boundary שמשנה את market continuity:

```text
market_generation++
```

‏לדוגמה:

```text
halt
reopening
major authoritative reset
```

‏כל Intent כולל:

```text
created_market_generation
```

‏אם הוא שונה מה־current generation:

```text
STALE_INTENT
```

---

## ‏25. Feature Invalidation

‏ב־Halt/Reopen נבצע invalidate לפחות ל־:

```text
current ranking eligibility
short-horizon momentum path
spread state
queue estimate
execution readiness
pre-halt signal TTL
```

‏לא מוחקים historical evidence.

---

## ‏26. Working Orders בזמן Halt

‏נשמור states כגון:

```text
WORKING
CANCEL_PENDING
PARTIALLY_FILLED
UNKNOWN_EFFECT
```

‏בלי להסיק מה־Halt עצמו מה קרה ל־Order.

‏תהליך:

```text
Halt detected
→ block new risk
→ query/reconcile broker order state
→ preserve pending exposure
→ update risk reservation
```

---

## ‏27. Position בזמן Halt

‏נוסיף explicit condition:

```text
unexitable_risk = true
```

‏כאשר Position קיימת ו־normal execution אינו זמין.

‏Metrics:

```text
seconds_unexitable
exit_required_but_blocked_seconds
unprotected_exposure_seconds
```

---

## ‏28. Exit Intent בזמן Halt

‏אם Exit Rule מופעל בזמן Halt:

```text
Strategy State: EXIT_REQUIRED
Execution State: BLOCKED_BY_MARKET
```

‏שני הדברים יכולים להיות נכונים יחד.

‏`EXIT_REQUIRED` נשמר durable דרך restart.

---

## ‏29. Flatten/Kill Switch בזמן Halt

‏`FLATTEN` אינו Proof of Flat.

‏אם market non-tradable:

```text
FLATTEN_REQUESTED
→ EXIT_REQUIRED_BUT_BLOCKED
```

‏רק broker-confirmed zero position נותן:

```text
FLAT
```

---

## ‏30. Reopening Contract

‏Authoritative Resume יוצר:

```text
REOPENING
```

‏לא `READY`.

‏נדרשים לפחות:

```text
status == OPEN
status_fresh == true
broker_reconciled == true
positions_known == true
orders_known == true
fresh_quotes == true
feature_warmup == complete
spread_state_acceptable == true
risk_ready == true
safety_ready == true
```

---

## ‏31. Quote Resume vs Trade Resume

‏אם Source מספק שניהם:

```text
resumption_quote_time
resumption_trade_time
```

‏נשמור אותם בנפרד.

‏Quote activity אינה authorization ל־Entry לפני Trading Resume authoritative.

---

## ‏32. Reopen Warm-Up

‏Parameters למחקר:

```text
fresh_quote_count
fresh_trade_count
minimum_elapsed_ms
spread_stability
feature_warmup
processing_lag
```

‏אין hard-coded cooldown אוניברסלי.

---

## ‏33. Post-Halt Cooldown — Challenger

‏נבדוק buckets של:

```text
0-1s
1-5s
5-15s
15-60s
```

‏או חלונות אחרים בהתאם לנתונים.

‏נמדוד:

```text
spread
slippage
markout
re-halt rate
signal persistence
net outcome
```

‏רק Evidence יכול להפוך cooldown ל־Hard Gate.

---

## ‏34. Fast Market הוא Axis נפרד

‏Fast Market אינו necessarily exchange status.

‏הוא יכול להתקיים כאשר:

```text
trading_status = OPEN
execution_regime = EXTREME
```

‏לכן נשמור:

```text
TradingStatus
ExecutionRegime
```

‏בנפרד.

---

## ‏35. Fast-Market Features

‏נמדוד למשל:

```text
quote_updates_per_sec
trade_updates_per_sec
spread_volatility
spread_ratio_to_baseline
depth_ratio_to_baseline
short_window_realized_volatility
price_velocity
rank_churn
processing_lag_p50
processing_lag_p95
processing_lag_p99
fresh_coverage_ratio
```

---

## ‏36. Freshness During Burst

‏Connection health אינו Freshness.

```text
feed connected
+
queue 4 seconds behind
=
not real time for a seconds strategy
```

‏נמדוד:

```text
event_age
processing_lag
oldest_queue_item_age
```

---

## ‏37. Backpressure Contract

‏אם pipeline אינו עומד בקצב:

```text
coalesce obsolete state updates
prioritize broker/risk/position events
prioritize active candidate/position symbols
mark universe freshness degraded
block new entries if rank trust fails
```

‏אין unbounded queue.

---

## ‏38. Whole-Market Rank Trust under Stress

‏נשמר מהשלבים 31–32:

```text
fresh_coverage_ratio
ranking_as_of_time
rank_snapshot_consistency
```

‏Top1 טרי אינו מספיק אם רוב ה־Universe stale.

---

## ‏39. Update-Frequency Bias

‏Fast symbols עלולים לקבל יותר compute/update opportunities.

‏נמדוד:

```text
update_frequency_bias
```

‏ונפריד אותו מ־real alpha.

---

## ‏40. Score / Intent Invalidation

‏כאשר Symbol נכנס ל־non-open state:

```text
rank_eligible = false
entry_intent = invalid
execution_readiness = false
```

‏אבל Decision Packet נשמר ל־RCA.

---

## ‏41. Fast-Market Entry Policy

‏Baseline:

```text
NORMAL  -> standard eligibility
FAST    -> observe + stricter freshness/execution checks
EXTREME -> block new entries
UNKNOWN -> block new entries
```

‏Dynamic size reduction ב־FAST הוא `P3` Challenger ולא Baseline.

---

## ‏42. Latency-to-Volatility Ratio

‏Diagnostic אפשרי:

```text
expected_market_move_during_signal_to_fill_latency
/
expected_edge_at_decision
```

‏אם היחס גבוה, execution fragility עולה גם אם latency האבסולוטי לא השתנה.

---

## ‏43. Book Half-Life

‏נחקור:

```text
book_half_life
```

‏ביחס ל־:

```text
signal_to_fill_time
```

‏אם:

```text
book_half_life << signal_to_fill_time
```

‏Execution model עלול לעבוד על מידע שמתיישן מהר מדי.

---

## ‏44. Price Protection in Fast Markets

‏Protected Marketable Limit נשאר Reference tactic.

‏אבל:

```text
price cap too loose -> edge can disappear
price cap too tight -> no fill / missed opportunity
```

‏ה־optimization הוא Net Outcome, לא Fill בכל מחיר.

---

## ‏45. Chase Budget

‏נשמור:

```text
max_reprices
max_price_drift
max_elapsed_ms
message_budget
```

‏Fast Market אינו היתר לרדוף אחרי המחיר ללא Budget.

---

## ‏46. Band-Aware Order Validation

‏לפני Submit:

```text
status == OPEN
band_state_usable
price_constraint_compatible
signal_alive
market_data_fresh
broker_ready
risk_ready
safety_ready
```

‏Target תאורטי מעבר ל־band אינו Executable Plan.

---

## ‏47. Backtest Event Model

‏Backtest/Replay חייב לכלול:

```text
TRADING_STATUS_CHANGED
LULD_BANDS_UPDATED
MARKET_WIDE_STATUS_CHANGED
BROKER_ORDER_EVENT
```

‏ולא רק Trades/Quotes.

---

## ‏48. Non-Tradable Intervals

‏נייצג:

```text
[halt_start, authoritative_resume)
```

‏כ־non-tradable לפי הנתונים וה־Rule Model.

‏Simulator אינו מייצר Fill בתוך interval כזה רק כדי להשלים Strategy path.

---

## ‏49. Backtest Fidelity Ladder

```text
H0  ignores halts
H1  removes halted intervals
H2  replays halt/resume timestamps
H3  models working orders / positions through halt
H4  models reopening execution and warm-up
H5  live-calibrated broker / venue behavior
```

‏עבור seconds strategy:

- ‏`H0` אינו Evidence מקובל.
- ‏`H2` הוא מינימום למחקר prediction סביב halts.
- ‏`H3/H4` נדרשים למחקר execution רציני.

---

## ‏50. Forward Labels

‏אם Horizon נקטע על ידי Halt:

```text
label_interrupted_by_halt = true
```

‏לא נייצר `return_10s` כאילו continuous execution היה קיים.

---

## ‏51. Executable Forward Return

‏כאשר אין executable market:

```text
executable_forward_return = MISSING
```

‏או outcome מיוחד לפי Research Contract.

‏לא ממציאים Price באמצע gap.

---

## ‏52. Historical Arrival Timing

‏Replay fidelity גבוה שומר:

```text
authoritative_event_time
received_time
processed_time
```

‏אם Live למד על Halt באיחור, Backtest אינו מקבל את המידע מוקדם יותר ללא סימון.

---

## ‏53. Detection / Containment / Recovery Metrics

```text
halt_detection_latency_ms
containment_latency_ms
unknown_status_duration_ms
status_conflict_duration_ms
recovery_latency_ms
reopen_warmup_ms
```

‏Recovery latency קטן יותר אינו תמיד טוב יותר; early unsafe resume הוא failure.

---

## ‏54. Halt Event Packet

```text
halt_id
instrument_id
raw_reason_code
canonical_reason
pre_halt_market_generation
pre_halt_quote
pre_halt_trade
luld_context
position_snapshot
working_orders
risk_state
status_events
resume_quote_time
resume_trade_time
reopen_snapshot
reconciliation_result
post_reopen_actions
```

---

## ‏55. RCA Taxonomy

```text
STATUS_NOT_DETECTED
STATUS_DETECTED_LATE
STATUS_CONFLICT
STALE_SIGNAL_CROSSED_HALT
WORKING_ORDER_UNKNOWN
PARTIAL_FILL_BEFORE_HALT
EXIT_REQUIRED_BUT_BLOCKED
REOPEN_TOO_EARLY
REOPEN_DATA_STALE
REOPEN_SPREAD_TOO_WIDE
REHALT_AFTER_RESUME
FAST_MARKET_LATENCY
RANK_TRUST_FAILED
BAND_PROXIMITY_NOT_HANDLED
PROVIDER_STRESS
```

---

## ‏56. Success RCA / Near Miss

‏גם אירועים כגון:

```text
entry blocked 40ms before trading pause
```

‏נשמרים.

‏כך ניתן למדוד Safety Benefit ולא רק Safety Opportunity Cost.

---

## ‏57. Safety Opportunity Cost

‏ל־blocked candidates נוכל למדוד research-only:

```text
future_market_path
```

‏אבל ללא counterfactual fill מומצא.

‏אם אין evidence execution:

```text
counterfactual_fill = UNKNOWN
```

---

## ‏58. Halt Density

‏נמדוד:

```text
halted_symbols / expected_active_universe
```

‏כ־market-stress diagnostic.

‏Rapid increase יכול להעביר system ל־`GLOBAL_DEGRADED` גם לפני authoritative MWCB, אבל זה Safety heuristic — לא Market-Wide Halt Fact.

---

## ‏59. Cross-Sectional Stress Context

```text
percent_universe_fast
percent_universe_near_band
percent_universe_halted
fresh_coverage_ratio
rank_churn_rate
```

‏מפרידים Symbol event מ־market-wide stress.

---

## ‏60. Provider Stress vs Market Stress

‏ב־burst גדול נבדיל:

```text
market is fast
```

‏מ־:

```text
our provider / processing pipeline is failing under load
```

‏שניהם יכולים לקרות יחד.

---

## ‏61. Trading Status Provider Independence

‏`ITradingStatusProvider` אינו חייב להיות אותו Provider שמספק Quotes/Trades.

‏אם משתמשים בשני מקורות:

```text
Instrument Mapping
+ Timestamp Alignment
+ Source Precedence
+ Conflict Policy
```

‏הם חובה.

---

## ‏62. Status Capability Matrix

‏לכל Provider נרשום:

```text
trading_status_available
halt_reason_available
luld_bands_available
resume_quote_time_available
resume_trade_time_available
historical_halts_available
status_latency_observed
raw_reason_codes_available
```

---

## ‏63. Broker Capability Matrix

‏נחקור ב־Paper/POC:

```text
how halted orders appear
cancel behavior
reject codes
open-order reconciliation
fill callbacks around halt
reopen behavior
position synchronization
```

‏בלי להניח behavior לפי Exchange בלבד.

---

## ‏64. Startup During Halt

```text
load durable state
→ connect broker
→ fetch account / positions / orders
→ fetch authoritative trading status
→ reconcile
→ rebuild market state
→ remain RECOVERING
```

‏עד readiness.

---

## ‏65. Startup During Fast Market

‏אפשר להישאר:

```text
OBSERVING
```

‏עד:

```text
fresh_coverage stable
processing_lag acceptable
broker/risk ready
```

‏אין חובה להצטרף מיד.

---

## ‏66. Rule Versioning

‏Run Manifest יכלול:

```text
market_rules_version
luld_rule_version
halt_mapping_version
market_calendar_version
fast_market_model_version
status_provider_version
```

---

## ‏67. Rules Are Data

```text
Exchange / LULD rules
=
versioned external data
```

‏לא constants מפוזרים ב־Strategy.

---

## ‏68. Rule Update Process

```text
Official Source Review
→ Capability / Rule Snapshot Update
→ Unit / Property Tests
→ Golden Replay
→ Shadow / Paper Verification
→ Production Promotion
```

---

## ‏69. Current Verification Sources

‏נבדק ב־`2026-10-27` מול:

- ‏`LULD Plan` official site and current Plan pages.
- ‏SEC approval / filings for `27th Amendment` and Overnight Price Bands.
- ‏NYSE Trading Information / Market-Wide Circuit Breakers.
- ‏Nasdaq Trader Trading Halt Codes and Halt/Resumption fields.

‏כל Current Fact בפרק זה מסומן time-sensitive.

---

## ‏70. Data Contract for Decision Snapshot

‏לכל Candidate נשמור כאשר זמין:

```text
trading_status
trading_status_source
trading_status_age_ms
raw_halt_reason
market_generation
luld_reference
luld_lower
luld_upper
distance_to_band_bps
seconds_since_resume
recent_halt_count
market_wide_status
fast_market_regime
processing_lag_ms
fresh_coverage_ratio
```

---

## ‏71. Candidate Eligibility Contract

```text
candidate_eligible =
    trading_status == OPEN
    && trading_status_fresh
    && market_wide_status == NORMAL
    && market_data_fresh
    && rank_snapshot_trusted
    && instrument_tradable
    && broker_ready
    && risk_ready
    && safety_allows_entry
    && !unknown_order_state
```

‏Additional cooldown/proximity rules הם versioned experiments.

---

## ‏72. Pre-Submit Recheck

‏גם לאחר Candidate selection:

```text
status still OPEN?
status still fresh?
market generation unchanged?
market-wide status normal?
LULD context usable?
signal alive?
quote usable?
price protection valid?
broker ready?
risk / safety still approved?
```

‏Failure => `NO_TRADE` / abort.

---

## ‏73. Safety Precedence

```text
Safety
> Risk Permission
> Execution Optimization
> Strategy Score
```

‏Strategy score אינו יכול לעקוף halt gate.

---

## ‏74. Hard Invariants

```text
1. Non-OPEN canonical status cannot create new risk in baseline.
2. UNKNOWN/STATUS_CONFLICT cannot create new risk.
3. Halt cannot erase a broker-confirmed position.
4. Cancel request cannot release all pending exposure before authoritative resolution.
5. Pre-halt intent cannot create post-reopen entry after market_generation changes.
6. Resume event alone cannot make candidate entry-ready.
7. Broker connected != market executable.
8. Feed silence cannot be classified as authoritative halt without evidence.
9. Replay cannot fill inside known non-tradable interval.
10. Market-wide halt blocks all new entries globally.
```

---

## ‏75. Golden Scenarios

### ‏Scenario A — Limit State resolves without Pause

```text
OPEN
→ LIMIT_STATE
→ OPEN
```

‏No Entry בזמן Limit State; no false Halt Fact.

### ‏Scenario B — Limit State to Trading Pause

```text
OPEN
→ LIMIT_STATE
→ TRADING_PAUSE
```

‏Intent invalidated; orders reconciled.

### ‏Scenario C — Partial Fill then Halt

```text
submit
→ partial fill
→ halt
```

‏Actual filled position נשמר; remaining exposure reconciled.

### ‏Scenario D — Exit Due During Halt

```text
position open
→ halt
→ exit timer due
```

‏`EXIT_REQUIRED` persisted.

### ‏Scenario E — Resume then Re-Halt

‏No automatic resume loop.

### ‏Scenario F — Status Arrives Late

‏Measure detection/containment latency and stale intents.

### ‏Scenario G — Feed Outage Looks Like Halt

‏Classification stays `FEED_STALE` / `HALT_SUSPECTED`, not false historical Halt.

### ‏Scenario H — Status Conflict

```text
provider OPEN
broker HALTED
```

‏New risk blocked.

### ‏Scenario I — Restart During Pause

‏System returns `RECOVERING`, never assumes OPEN/FLAT.

### ‏Scenario J — Market-Wide Circuit Breaker

‏Global entry block + durable exposure tracking.

### ‏Scenario K — Fast-Market Event Burst

‏No unbounded queue; rank trust degrades visibly; Entries block if needed.

### ‏Scenario L — Reopen Warm-Up

‏Open event alone does not re-enable Entry.

---

## ‏76. Property Tests

### ‏Pre-Halt Intent Cannot Cross Generation

```text
forall intents:
  intent.market_generation != current.market_generation
  => risk-increasing submit denied
```

### ‏Halt Does Not Erase Exposure

```text
position_qty changes only from authoritative fills/reconciliation
```

### ‏UNKNOWN Is Conservative

```text
unknown status/order/position
=> no new risk
```

### ‏No Fresh Feature from Stale Data

```text
source stale
=> feature_fresh = false
```

### ‏Resume Requires Evidence

```text
TRADING_PAUSE -> READY_FOR_ENTRY
```

‏אינו direct transition.

---

## ‏77. Metrics — Trading Status

```text
halt_count
halt_duration_seconds
re_halt_count
position_halted_count
working_order_halted_count
status_conflict_count
unknown_status_duration_ms
```

---

## ‏78. Metrics — Detection / Recovery

```text
halt_detection_latency_ms
containment_latency_ms
reconciliation_duration_ms
reopen_warmup_ms
recovery_latency_ms
```

---

## ‏79. Metrics — LULD

```text
symbols_in_limit_state
symbols_in_straddle_state
symbols_near_upper_band
symbols_near_lower_band
top1_distance_to_band_bps
entries_blocked_near_band
```

---

## ‏80. Metrics — Fast Market

```text
quote_rate
trade_rate
spread_ratio_to_baseline
depth_ratio_to_baseline
rank_churn_rate
processing_lag_p95
processing_lag_p99
oldest_queue_item_age
fresh_coverage_ratio
```

---

## ‏81. Metrics — Risk

```text
unexitable_position_seconds
exit_required_but_blocked_seconds
unprotected_exposure_seconds
unknown_order_effect_count
```

---

## ‏82. Observability

‏Whole-market dashboard:

```text
market_wide_status
halted_symbols_count
luld_pause_count
limit_state_count
straddle_state_count
symbols_near_upper_band
symbols_near_lower_band
fast_market_symbols
fresh_coverage_ratio
processing_lag_p99
```

‏Symbol detail:

```text
Trading Status
Status Source
Status Age
Raw Reason Code
Halt Start
Resume Quote Time
Resume Trade Time
LULD Reference / Lower / Upper
Distance to Band
Market Generation
Seconds Since Resume
Working Orders
Position
Exit Required?
```

---

## ‏83. Alerting

‏Actionable alerts:

```text
POSITION_BECAME_HALTED
WORKING_ORDER_UNKNOWN_DURING_HALT
STATUS_SOURCE_CONFLICT
UNEXPECTED_REOPEN_WITH_STALE_DATA
MARKET_WIDE_CIRCUIT_BREAKER
EXTREME_PROCESSING_LAG
EXIT_REQUIRED_BUT_BLOCKED
```

‏Market-wide events aggregated תחת `incident_id` אחד כדי למנוע alert storm.

---

## ‏84. Replay / RCA Corpus

‏נשמור Golden Corpus של אירועים אמיתיים:

```text
LULD pause
Limit State resolved without pause
News halt
Operational halt
Reopening
Re-halt
Market-wide halt
Status conflict
Feed outage mistaken for halt
Fast-market provider overload
```

‏כל incident חדש משמעותי הופך regression replay.

---

## ‏85. Halt Avoidance vs Halt Alpha

‏Baseline:

```text
halts = execution / risk condition
```

‏לא:

```text
halts = alpha opportunity
```

‏מחקר Post-Halt עתידי מקבל Dataset, Experiment Registry ו־Validation נפרדים.

---

## ‏86. Post-Halt Research Requirements

‏אם נחקור בעתיד:

```text
halt reason
halt duration
reopening mechanism
reopen gap
spread
liquidity
re-halt rate
execution feasibility
markout
fees / slippage
```

‏Reason conditioning חובה.

---

## ‏87. Fast-Market Model Promotion

‏Derived `FAST/EXTREME` model מתקדם רק אם:

- ‏classification stable OOS.
- ‏הוא מוסיף value מעבר ל־simple freshness/spread guards.
- ‏false-positive Safety cost נמדד.
- ‏tail execution failures יורדים.
- ‏Replay/Shadow parity סבירה.

---

## ‏88. LULD-Proximity Gate Promotion

‏Hard gate מתקדם רק אם:

- ‏Distance-to-band data point-in-time אמין.
- ‏Rule version parity קיימת.
- ‏Buckets מראים degradation עקבי ב־Net Execution Outcome.
- ‏Safety benefit גדול מספיק ביחס ל־blocked-opportunity cost.
- ‏OOS evidence קיים.

‏עד אז הוא Diagnostic/Shadow Challenger.

---

## ‏89. Reopen Cooldown Promotion

‏Cooldown מתקדם רק אם distribution מראה:

```text
early reopen period
→ materially worse spread/slippage/re-halt/markout
```

‏והיתרון שורד symbols/regimes/time periods שונים.

---

## ‏90. Rejection Criteria

‏נבטל/נפשט component אם:

- ‏הוא לא מוסיף value מעל simple status/freshness gate.
- ‏הוא גורם false recovery blocks רבים בלי Safety benefit.
- ‏Status mapping אינו יציב.
- ‏Latency שלו הופכת אותו לפחות שימושי מ־simpler authoritative source.
- ‏הוא דורש inference שאין לו calibration.
- ‏הוא מוסיף complexity ללא reduction ב־unsafe outcomes.

---

## ‏91. What I Would Avoid Initially

- ‏Post-halt momentum strategy.
- ‏Predicting halts with ML.
- ‏Venue-specific reopening alpha.
- ‏Dynamic size model בתוך first halt implementation.
- ‏Hard-coded distance-to-band threshold.
- ‏Complex dual-provider failover.
- ‏Automatic trade immediately on resume.
- ‏Market orders chasing reopening gap.
- ‏Assuming five-minute pause means exact resume time.

---

## ‏92. What to Add Later

```text
1. Historical halt / LULD corpus
2. LULD proximity diagnostics
3. Fast-market empirical buckets
4. Post-reopen execution scorecard
5. Secondary status provider diagnostics
6. Shadow proximity/cooldown experiments
7. Capacity-aware fast-market risk
8. Specialist post-halt research only if justified
```

---

## ‏93. User-Specific Application

‏למערכת Whole-Market Short-Horizon שלנו, הבעיה הגדולה היא ש־strong momentum ו־high activity יכולים דווקא למשוך Rank #1 לכיוון symbols שבהם Execution Risk עולה מהר.

‏לכן pipeline מומלץ:

```text
Broad Market Data
→ Trading Status Gate
→ Market-Wide Status Gate
→ Fresh Coverage Gate
→ Feature Engine
→ Ranking
→ Top-N
→ LULD / Execution Context
→ Candidate Gate
→ Risk / Safety
→ Protected Execution
```

‏לא:

```text
Rank #1
→ discover only later that the symbol is paused / reopening / status-unknown
```

---

## ‏94. Concrete Baseline Contract

```text
1. Trading Status is independent domain truth.
2. Status Gate happens before Ranking eligibility and again before Submit.
3. Non-OPEN, UNKNOWN or conflicting status blocks new risk.
4. Positions and working orders survive logically through halt until broker truth resolves them.
5. Exit requirements triggered during halt are durable.
6. Halt/Reopen increments market_generation and invalidates old entry intents.
7. Resume-by-timer is prohibited.
8. Authoritative OPEN still requires post-reopen reconciliation and warm-up.
9. LULD rules are versioned external data, not Strategy constants.
10. LULD proximity starts as diagnostic/shadow evidence, not arbitrary hard threshold.
11. Market-wide circuit-breaker state blocks new entries globally.
12. Fast Market is a derived execution regime distinct from official trading status.
13. EXTREME lag/staleness/backpressure blocks new entries in baseline.
14. Replay contains trading-status events and known non-tradable intervals.
15. Pre-halt signals cannot create post-reopen entries without a new decision.
16. Raw status/reason evidence and arrival timing are retained for RCA/replay.
17. Current/future LULD rule versions carry effective dates, including the approved 2026 overnight transition.
18. This sheet does not enable live-money deployment.
```

---

## ‏95. Confidence

### ‏High Confidence

- ‏Status before Score.
- ‏UNKNOWN/conflict fail closed for new risk.
- ‏Broker truth for positions/orders.
- ‏No resume by timer.
- ‏Market generation / stale-intent invalidation.
- ‏Non-tradable intervals in Replay.
- ‏Fast Market separate from official halt state.

### ‏Medium Confidence

- ‏Conservative `EXTREME` fast-market entry block.
- ‏LULD proximity as valuable execution context.
- ‏Post-reopen warm-up as required readiness stage.

### ‏Low / Must Measure

- ‏Best LULD-proximity threshold.
- ‏Best post-reopen cooldown duration.
- ‏Predictive value of halt history.
- ‏Best dynamic size reduction under Fast Market.
- ‏Any post-halt Alpha hypothesis.

---

## ‏96. Relationship to Earlier Sheets

### ‏33 — Production State Machine

‏מוסיף explicit market/trading states ו־generation boundary.

### ‏34 — Failure Recovery

‏Halt is market-side uncertainty; restart/reconnect still require reconciliation.

### ‏35 — Observability

‏Detection/containment/recovery latency and Halt Event Packet become first-class evidence.

### ‏36 — Safety Controls

‏Non-OPEN/UNKNOWN status is independent Safety authority over Strategy score.

### ‏37–41 — Execution

‏Execution tactic sophistication is irrelevant if market tradability is not proven.

### ‏42 — Auctions

‏Reopening auction is a separate execution environment and cannot reuse continuous assumptions blindly.

---

## ‏97. Relationship to Later Sheets

### ‏44 — Advanced Order Flow

‏Order-flow features must consume only tradable, point-in-time-valid intervals and must not confuse halt silence with weak flow.

### ‏45 — Book Imbalance / Microprice

‏Book-derived features require explicit invalidation during halt/reopen and degraded book regimes.

### ‏61 — Backtest Subtleties

‏Halt-aware non-tradable intervals and arrival-time fidelity become mandatory anti-fantasy constraints.

---

## ‏98. Recommendation Summary

‏ההמלצה אינה לנסות “לנצח” Halt או LULD.

‏ההמלצה היא להפוך Market Tradability ל־Truth מפורש שהמערכת מכבדת לפני Alpha.

```text
Authoritative Status
→ Provenance / Freshness
→ Tradability Gate
→ Preserve Exposure Truth
→ Invalidate Stale Intent
→ Reconcile
→ Rebuild Market State
→ Validate Readiness
→ Resume Eligibility
```

‏ב־Fast Market:

```text
Measure Age / Lag / Coverage
→ protect rank trust
→ contain when EXTREME
→ optimize only after evidence
```

‏ובכל המקרים:

```text
When tradability is uncertain,
do not create new risk until it is proven again.
```
