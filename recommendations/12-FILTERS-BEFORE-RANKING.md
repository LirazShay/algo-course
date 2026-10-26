# ‏12 — Recommendation Sheet: Filters Before Ranking

> ‏מקור לימודי עיקרי: `../12-FILTERS-BEFORE-RANKING.md`.
>
> ‏מטרת הקובץ: לקבוע אילו תנאים צריכים לחסום Candidate לפני דירוג, אילו תנאים עדיף להשאיר כ־`soft signal / penalty / score input`, איך לבנות Funnel שניתן להסביר ולמדוד, ואיך לוודא שסינון אינו מוחק בטעות את ה־Edge של סריקת כל השוק.

---

## ‏1. Decision

‏איך לבנות את שכבת הסינון שבין:

```text
Universe
```

‏לבין:

```text
Feature Engine
→ Ranking
→ Candidate Gate
```

‏כך שהמערכת:

- ‏תחסום מצבים לא תקינים, לא בטוחים או בלתי־ניתנים לביצוע.
- ‏לא תבזבז חישוב כבד על Symbols חסרי סיכוי מעשי.
- ‏לא תהפוך כל העדפה רציפה ל־Hard Threshold.
- ‏תשמור Evidence על כל פסילה.
- ‏תאפשר לבדוק בדיעבד אם Filter הסיר Noise או הרג Opportunity.
- ‏תדע לבצע `Execution Recheck` ממש לפני Order.

---

## ‏2. Recommended Default

### ‏`P0 — Required Before Live Risk`: ארבע שכבות Filter נפרדות

‏ה־Baseline יהיה Funnel מפורש:

```text
1. SYSTEM SAFETY
2. SYMBOL / DATA VALIDITY
3. EXECUTABILITY
4. OPPORTUNITY QUALITY
```

‏המשמעות:

```text
SYSTEM SAFETY
    ↓
SYMBOL / DATA VALIDITY
    ↓
EXECUTABILITY
    ↓
OPPORTUNITY QUALITY
    ↓
FEATURE ENGINE
    ↓
RANKING
```

‏ככל שיורדים בשכבות, פחות תנאים צריכים להיות `Hard` כברירת מחדל.

### ‏`P0 — Required Before Live Risk`: Hard Filter רק כאשר יש גבול אמיתי

‏Hard Filter מתאים כאשר הכישלון אומר בקירוב:

```text
cannot trust state
cannot trade safely
cannot execute supported action
cannot preserve minimum economic viability
```

‏Baseline של Hard Rejects:

```text
feed / system unhealthy
critical clock state invalid
instrument mapping unresolved
instrument not tradable / unsupported
halted or trading status unknown
required market data missing
critical quote stale
invalid quote state
account / broker critical state unknown
planned size unknown
execution state unreconciled
```

‏במקרים כאלה:

```text
FAIL CLOSED
→ NO NEW ENTRY
```

### ‏`P1 — Preferred Default`: משתנה רציף אינו Hard Filter בלי Evidence לגבול

‏לדוגמה:

```text
trades_10s = 49
vs
trades_10s = 50
```

‏אין סיבה טבעית להניח שהאחד פסול והשני תקין.

‏לכן עבור משתנים כגון:

```text
activity
spread quality
momentum strength
volatility
path efficiency
relative liquidity quality
```

‏ברירת המחדל תהיה אחד מאלה:

```text
feature
penalty
confidence adjustment
bucket
relative rank input
```

‏ורק אם Research מראה boundary יציב וברור נשקול Hard Filter.

### ‏`P0 — Required Before Live Risk`: Fail Closed לבטיחות ולמצב לא ידוע

‏עבור Critical State:

```text
unknown != pass
missing != zero
stale != valid
```

‏דוגמאות:

```text
halt_status = unknown       => NO NEW ENTRY
quote_freshness = unknown   => NO NEW ENTRY
broker_connected = unknown  => NO NEW ENTRY
position_state = unknown    => NO NEW ENTRY
```

‏`Fail Open` מותר רק לשכבות מחקר/איכות שאינן קריטיות לבטיחות או לביצוע.

### ‏`P1 — Preferred Default`: Filters זולים ומכריעים מוקדם

‏סדר הביצוע המומלץ:

```text
cheap + decisive
→ moderate cost
→ expensive / research-heavy
```

‏לדוגמה:

```text
system health
→ symbol validity
→ quote validity/freshness
→ basic executability
→ lightweight activity gates
→ feature engine
→ ranking
```

‏המטרה היא לחסוך Compute בלי לשנות את הסמנטיקה של ההחלטה.

### ‏`P0 — Required Before Live Risk`: System Gate לפני Symbol Filters

‏אם הבעיה מערכתית, אין טעם לפסול אלפי Symbols אחד־אחד.

‏נדרש Global Gate לפחות עבור:

```text
market data feed health
collector health
clock / timing health
broker connectivity
critical account state freshness
universe / mapping health
```

‏כשל מערכת קריטי:

```text
BLOCK NEW ENTRIES
```

### ‏`P0 — Required Before Live Risk`: Symbol/Data Validity Gate

‏לפני כל Quality Filter נדרש לפחות:

```text
symbol resolved
instrument supported
market status known
not halted
required fields present
bid > 0
ask > bid
prices finite / sane
timestamps valid
critical data freshness valid
session supported
```

‏אין לשלוח Invalid State ל־Ranking כאילו הוא Candidate חלש.

### ‏`P1 — Preferred Default`: Executability Gate מחובר ישירות למקטע 11

‏Candidate אינה עוברת רק בגלל Signal טוב.

‏לפני Ranking עמוק או לכל המאוחר לפני Final Candidate Selection נדרש לבדוק:

```text
planned_qty known
entry-side liquidity usable
exit-side liquidity usable
spread / expected friction computable
quote fresh
expected economics not obviously impossible
```

‏כאשר ברור ש:

```text
expected gross move <= unavoidable estimated friction
```

‏ניתן לבצע `Hard Economic Reject`.

‏כאשר הכלכלה רק פחות טובה אך לא בלתי אפשרית:

```text
soft penalty / lower ranking
```

### ‏`P1 — Preferred Default`: אין Price Filter שרירותי כברירת מחדל

‏לא נתחיל מכלל כמו:

```text
price >= $10
```

‏רק משום שהוא נפוץ.

‏נעדיף משתנים שמחוברים לבעיה הכלכלית:

```text
planned_qty
spread_bps
spread_to_expected_move
order_to_visible_size
expected_round_trip_friction
minimum executable notional constraints
```

‏Price Range יכול להיות Filter רק אם קיימת סיבה מפורשת ו־Evidence.

### ‏`P1 — Preferred Default`: Activity היא בתחילה Soft Quality Gate

‏`trades`, ‏`volume`, ‏`dollar volume` ו־activity acceleration חשובים, אך אינם Hard Reject טבעי ברוב המצבים.

‏Baseline:

```text
extreme inactivity / insufficient observability
    → may hard reject if execution/research validity is impossible

moderately low activity
    → penalty / lower confidence / lower rank
```

‏Thresholds מספריים אינם מתקבעים במקטע הזה.

### ‏`P1 — Preferred Default`: Absolute + Relative quality יחד

‏Relative Filter לבדו אינו מספיק.

‏תמיד יהיה:

```text
Top 1%
```

‏גם ביום שבו כל השוק חלש.

‏לכן Pattern נכון יותר:

```text
absolute minimum viability
AND
relative market quality
```

‏לדוגמה רעיונית:

```text
activity is not trivially low
AND
activity_percentile is high
```

‏אבל שני הגבולות חייבים Research.

### ‏`P2 — Challenger`: Dynamic / Regime-Aware Filters

‏לאחר Baseline יציב אפשר לבדוק:

```text
current_spread / typical_spread
activity relative to time-of-day baseline
session-specific thresholds
market-volatility regime thresholds
symbol-relative percentile
```

‏Promotion רק אם Dynamic Filter משפר OOS results בלי להוסיף Fragility או Overfitting.

### ‏`P1 — Preferred Default`: Signal Age הוא State, לא רק Metadata

‏במערכת של שניות:

```text
signal_age_ms
```

‏צריך להיות זמין לכל Final Candidate.

‏אם האות עבר את lifetime המאומת שלו:

```text
SIGNAL_EXPIRED
→ reject
```

‏המספר המדויק נקבע במחקר ולא באינטואיציה.

### ‏`P0 — Required Before Live Risk`: Execution Recheck לפני Submit

‏מעבר Filter ב־`T0` אינו הרשאה קבועה.

‏ממש לפני Order יש לבדוק שוב לפחות:

```text
market status
quote freshness
spread / economics
planned size / liquidity
signal still valid
broker / account state
position / open-order state
```

‏אם Critical State השתנה:

```text
NO TRADE
```

### ‏`P1 — Preferred Default`: כל Filter הוא Entity מתועד, לא `if` אנונימי

‏כל Filter יכיל Metadata לפחות:

```text
filter_id
name
category
hard_or_soft
input_features
threshold / rule
reason_code
filter_version
rationale
owner / source
```

‏כך נמנעים מ־`Filter Spaghetti`.

### ‏`P0 — Required for Research`: שומרים גם את הנפסלות

‏לכל Candidate שנפסלה נשמור ככל האפשר:

```text
decision snapshot
raw inputs
features available at T0
filter results
reason codes
threshold margins
future labels
```

‏אחרת אי אפשר לדעת אם Filter אכן הועיל.

### ‏`P1 — Preferred Default`: Stable Reason Codes

‏לא נשתמש בטקסט חופשי בלבד.

‏Baseline אפשרי:

```text
SYSTEM_UNHEALTHY
FEED_UNHEALTHY
CLOCK_INVALID
SYMBOL_UNRESOLVED
NOT_TRADABLE
HALTED
TRADING_STATUS_UNKNOWN
MARKET_DATA_MISSING
QUOTE_STALE
QUOTE_INVALID
SESSION_UNSUPPORTED
EXECUTION_STATE_UNKNOWN
SPREAD_ECONOMICS_INVALID
INSUFFICIENT_EXECUTABILITY
SIGNAL_EXPIRED
ACTIVITY_INSUFFICIENT
CORPORATE_ACTION_UNRESOLVED
OUTLIER_DATA_SUSPECTED
```

‏Reason Codes הם Versioned contract.

### ‏`P1 — Preferred Default`: Margin to Threshold

‏לכל Threshold נשמור לא רק:

```text
PASS / FAIL
```

‏אלא גם:

```text
observed_value
threshold
margin_to_threshold
```

‏כך אפשר לבדוק אם תוצאות גרועות מתרכזות סביב הגבול או שהגבול שרירותי.

### ‏`P1 — Preferred Default`: Filter Funnel Metrics

‏בכל Cycle/Session נמדוד לפחות:

```text
input_count
pass_count per stage
reject_count per stage
reject_rate by reason
final candidate count
```

‏שינוי חריג ב־Funnel יכול להיות:

```text
market change
strategy effect
feed failure
mapping failure
bug
```

‏ולכן הוא גם Metric תפעולי.

### ‏`P1 — Preferred Default`: Rejected Opportunity Analysis

‏לכל Filter Research נבדוק:

```text
what happened to passed candidates?
what happened to rejected candidates?
```

‏מדדים אפשריים:

```text
forward executable return
MFE / MAE
time_to_first_profitable_exit
expected / realized net outcome
```

‏Filter שמסיר הרבה Winners אמיתיים אינו טוב רק משום שהוא משפר Precision.

### ‏`P1 — Preferred Default`: Precision + Recall + Opportunity Rate

‏Filter ייבחן לפחות על שלושה צירים:

```text
Precision
Recall
Net opportunities per hour/day
```

‏לא נעדיף אוטומטית Filter שמעלה EV לעסקה אבל מוחק כמעט את כל ההזדמנויות.

### ‏`P1 — Preferred Default`: Threshold Sensitivity לפני Promotion

‏לא מקדמים Threshold שנראה מצוין רק בנקודה אחת.

‏נבדוק שכונה:

```text
T - delta
T
T + delta
```

‏ואזור רחב יותר.

‏Promotion דורש Plateau סביר של ביצועים, לא Magic Number.

### ‏`P2 — Challenger`: Shadow Filters

‏Filter חדש ירוץ קודם במצב:

```text
compute result
log result
DO NOT affect decision
```

‏כך ניתן למדוד Counterfactual לפני שינוי Production behavior.

‏לאחר Evidence מספק אפשר לקדם:

```text
SHADOW
→ SOFT
→ HARD
```

‏כאשר יש הצדקה.

---

## ‏3. Why

### ‏Fact

‏`Filter` קובע Eligibility; ‏`Score / Ranking` קובע Relative Preference בין מי שנותרו.

### ‏Fact

‏Condition של Data Invalidity או Halt אינו אותו סוג שאלה כמו “Activity קצת נמוכה”.

### ‏Fact

‏Threshold קשיח על משתנה רציף יוצר Discontinuity: שני ערכים כמעט זהים יכולים לקבל החלטות שונות לחלוטין.

### ‏Fact

‏Relative percentile תמיד מייצר Winners גם אם Absolute Quality נמוכה.

### ‏Fact

‏Pass ב־Scan time אינו מבטיח שה־state עדיין תקף בזמן Submit.

### ‏Fact

‏בלי נתוני Rejected Candidates אי אפשר לבצע Counterfactual Analysis אמין ל־Filter.

### ‏Judgment

‏המערכת שלנו צריכה להשתמש במספר קטן יחסית של Hard Filters, ורוב משתני האיכות צריכים להישאר רציפים עד שיוכח אחרת.

### ‏Judgment

‏Filters של בטיחות צריכים להיות `Fail Closed`; ‏Filters של Preference יכולים להיות Soft או Shadow.

### ‏Hypothesis

‏שילוב של absolute viability עם relative quality ישמור Recall טוב יותר מ־absolute thresholds קשיחים בלבד.

### ‏Hypothesis

‏Activity, volatility ו־liquidity-quality משתנים יתפקדו טוב יותר בתחילה כ־ranking inputs/penalties מאשר Hard Rejects.

### ‏Hypothesis

‏Execution Recheck קרוב ל־submit ימנע חלק מהעסקאות שבהן Signal היה טוב אך Edge כבר נעלם בזמן latency.

---

## ‏4. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏סורקים אלפי Symbols בכל Cycle.
- ‏יש שילוב של Safety, Data Quality, Executability ו־Opportunity Quality.
- ‏הזמן בין Scan ל־Submit משמעותי ביחס ל־Signal Lifetime.
- ‏חשוב לשמור Recall של הזדמנויות נדירות.
- ‏רוצים מערכת שניתנת ל־RCA ולא אוסף תנאים אקראיים.
- ‏מפתחים Filters בהדרגה לפי Evidence.

---

## ‏5. Do Not Use When

‏אין להשתמש ב־Hard Filter כפתרון אוטומטי כאשר:

- ‏המשתנה רציף ואין Boundary טבעי.
- ‏ה־Threshold נבחר רק כי הוא “עגול”.
- ‏ראינו Trade מפסיד אחד ורוצים לחסום מקרים דומים.
- ‏ה־Score גרוע ומנסים לתקן אותו עם עוד Rules.
- ‏אין Dataset של Rejected Candidates.
- ‏אין יכולת להסביר למה Filter קיים.
- ‏אין Sensitivity Analysis.
- ‏אין דרך להשבית/לגרס את Filter.

---

## ‏6. Alternatives

| Approach | יתרון | חיסרון | Recommendation |
|---|---|---|---|
| ‏Many Hard Thresholds | ‏פשוט לוגית | ‏Recall נמוך, cliff effects, overfit | ‏Avoid initially |
| ‏Minimal Safety Filters + rich ranking | ‏שומר Opportunity | ‏דורש Ranking טוב | ‏Preferred baseline |
| ‏Soft penalties | ‏רציף וגמיש | ‏צריך Calibration | ‏Preferred for quality |
| ‏Cross-sectional percentiles | ‏מתאים למצב השוק | ‏תמיד יוצר top bucket | ‏Use with absolute floor |
| ‏Dynamic regime thresholds | ‏עשוי להתאים למצבי שוק | ‏מורכב ועלול overfit | ‏P2/P3 Challenger |
| ‏ML eligibility model | ‏יכול ללמוד interactions | ‏קשה להסביר ורגיש ל־leakage | ‏Later only |
| ‏Shadow filters | ‏Counterfactual בטוח | ‏דורש telemetry | ‏Strong promotion path |

---

## ‏7. Trade-offs

### ‏Hard Filter

‏יתרונות:

- ‏פשוט.
- ‏מהיר.
- ‏מגן היטב על Safety.
- ‏מוריד Compute מוקדם.

‏חסרונות:

- ‏Cliff סביב Threshold.
- ‏יכול למחוק Edge.
- ‏מקטין Recall.
- ‏רגיש ל־overfitting.

### ‏Soft Filter / Penalty

‏יתרונות:

- ‏שומר מידע רציף.
- ‏מאפשר Ranking עשיר.
- ‏מפחית Boundary artifacts.

‏חסרונות:

- ‏דורש Calibration.
- ‏יכול להכניס Candidate חלשה אם Ranking גרוע.

### ‏Dynamic Filter

‏יתרונות:

- ‏יכול להתאים לשעה/Regime/Symbol.

‏חסרונות:

- ‏מורכבות.
- ‏קשה יותר לשחזור.
- ‏סיכון ל־data mining.

---

## ‏8. What I Would Avoid Initially

‏הייתי נמנע בתחילת הדרך מ:

- ‏עשרות Hard Filters.
- ‏Thresholds שרירותיים כמו `100 trades`, ‏`$0.01 spread`, ‏`1000 shares` בלי Evidence.
- ‏Price range כתחליף ל־execution economics.
- ‏News/event classifier כחובה ל־MVP.
- ‏Dynamic threshold לכל Feature.
- ‏Filter שמבוסס על Composite Score לא מוסבר.
- ‏Filter שמנסה לתקן Model/Label problem.
- ‏חוקים שמבוססים על Trade בודד שנכשל.
- ‏Filter ללא Reason Code.
- ‏Filter ללא Shadow/Backtest path.
- ‏מחיקה של Rejected Candidate snapshots.

---

## ‏9. What to Add Later

‏לאחר Baseline:

- ‏Regime-specific thresholds.
- ‏Time-of-day normalized activity filters.
- ‏Symbol-relative spread filters.
- ‏Cross-sectional percentile filters.
- ‏Volatility-state filters.
- ‏Outlier/bad-tick detection מתקדם.
- ‏Corporate-action-aware special regimes.
- ‏IPO/new-listing regime.
- ‏Event/news regime אם Data ו־Evidence מצדיקים.
- ‏ML-based eligibility challenger.
- ‏Adaptive execution-economics thresholds.
- ‏Filter dependency graph אם מספר הכללים גדל באמת.

---

## ‏10. Required Data / Evidence

‏לכל Filter Research נשמור לפחות:

```text
as_of_time
symbol
strategy_version
filter_set_version
feature_set_version
filter_id
filter_version
hard_or_soft
raw_input_values
thresholds
margin_to_threshold
pass_fail_shadow
reason_codes
upstream data-health state
planned_qty
signal_age
candidate rank if computed
future executable labels
```

‏בנוסף:

```text
provider
feed / coverage
session
market regime markers
```

‏כאשר הם רלוונטיים.

---

## ‏11. Promotion Criteria

‏Filter חדש יכול להתקדם ל־Production רק אם:

1. ‏יש Problem Statement ברור.
2. ‏המשתנה נמדד בצורה יציבה.
3. ‏ה־Rule אינו משתמש במידע עתידי.
4. ‏קיים Dataset גם של Passed וגם Rejected.
5. ‏Sensitivity סביב Threshold סבירה.
6. ‏ה־benefit שורד Out-of-Sample / forward validation.
7. ‏Rejected Opportunity Analysis אינו חושף Edge משמעותי שנמחק.
8. ‏השיפור נשאר לאחר execution costs.
9. ‏ה־Filter אינו תלוי במקרה יחיד/יום יחיד/שעה יחידה.
10. ‏Reason Codes ו־Observability קיימים.
11. ‏קיימת אפשרות Rollback/disable.
12. ‏ל־Hard Filter יש הצדקה חזקה למה Soft אינו מספיק.

‏Promotion path מומלץ:

```text
RESEARCH
→ SHADOW
→ SOFT
→ HARD only if justified
```

---

## ‏12. Rejection Criteria

‏נדחה Filter אם:

- ‏הוא משפר רק In-Sample.
- ‏ה־Threshold הוא Magic Number צר.
- ‏הנפסלים מציגים OOS net outcome דומה או טוב מהעוברים.
- ‏Recall נפגע בצורה חריפה בלי פיצוי כלכלי.
- ‏הוא תלוי ב־provider artifact לא יציב.
- ‏הוא משכפל Feature שכבר קיים.
- ‏הוא מוסיף latency/complexity בלי ערך.
- ‏הוא נדרש רק כדי להסתיר בעיית Score/Label/Data.
- ‏אי אפשר להסביר אותו.
- ‏אי אפשר לשחזר אותו.
- ‏אין דרך למדוד מה הוא פסל.

---

## ‏13. Metrics

### ‏Funnel Metrics

```text
universe_count
system_gate_pass
symbol_valid_pass
fresh_data_pass
executability_pass
opportunity_quality_pass
ranked_count
trade_gate_pass
```

### ‏Per-Filter Metrics

```text
pass_count
reject_count
reject_rate
shadow_fail_rate
latency_us_or_ms
margin_to_threshold distribution
```

### ‏Research Metrics

```text
EV passed
EV rejected
executable forward return passed/rejected
MFE / MAE passed/rejected
time_to_profit passed/rejected
net opportunity count/hour
precision
recall
```

### ‏Operational Metrics

```text
rejection_rate_by_reason
sudden funnel collapse
stale-data rejection spike
symbol-mapping rejection spike
filter runtime P50/P95/P99
```

---

## ‏14. Failure Modes

### ‏Filter Cliff

‏Candidate כמעט זהה מקבלת החלטה הפוכה בגלל Threshold קשיח.

### ‏Recall Collapse

‏Precision נראה מצוין אך כמעט כל Winners האמיתיים נפסלים.

### ‏Relative-Only Trap

‏Top percentile עובר למרות Absolute Quality חלשה.

### ‏Fail-Open Safety Bug

‏Unknown critical state מקבל PASS.

### ‏No-Data-as-Zero Bug

‏Gap ב־Feed מתפרש כחוסר פעילות.

### ‏Threshold Overfit

‏מספר מסוים עובד מצוין רק על sample קטן.

### ‏Filter Spaghetti

‏אין דרך לדעת מי פסל ולמה.

### ‏Patch-the-Score

‏עוד ועוד Filters מתווספים כדי להסתיר Ranking גרוע.

### ‏Rejected-Blindness

‏שומרים רק Passed Candidates ולכן לא רואים Lost Opportunities.

### ‏Version Drift

‏אותו שם Filter מייצג נוסחה/Threshold שונה בתקופות שונות.

### ‏State Staleness

‏Candidate עברה Filter ב־T0 אבל ה־state השתנה לפני Submit.

### ‏System Failure Misread as Market Failure

‏פתאום 80% מהשוק נפסל בגלל stale quotes, אך הבעיה היא Collector/Feed.

### ‏Corporate-Action / Outlier Contamination

‏שינוי טכני או bad tick נראה כמו Momentum אמיתי.

---

## ‏15. User-Specific Application

‏למטרה שלנו — סריקת שוק רחבה, Hold של שניות עד בערך דקה ורווח נטו קטן — הייתי משתמש במשפך הבא:

```text
BASE UNIVERSE
    ↓
SYSTEM HEALTH GATE
    ↓
SYMBOL / DATA VALIDITY
    ↓
FRESHNESS / MARKET STATUS
    ↓
BASIC EXECUTABILITY
    ↓
ECONOMIC VIABILITY
    ↓
LIGHT OPPORTUNITY QUALITY
    ↓
FEATURE ENGINE
    ↓
RANKING
    ↓
TOP N
    ↓
EXECUTION RECHECK
    ↓
TRADE / NO TRADE
```

‏`Light Opportunity Quality` לא צריך להפוך ליער של Hard Filters.

‏בשלב הראשון:

```text
Safety / impossible state  => HARD
Economic impossibility     => HARD
Weak quality evidence      => SOFT
Interesting uncertainty    => KEEP + LOG
```

‏זה שומר את היתרון של Wide Scan בלי להתפשר על Safety.

---

## ‏16. Concrete Baseline Contract

### ‏Stage A — Global System Gate

```text
feed_healthy
AND collector_healthy
AND critical_clock_state_valid
AND broker_connected
AND critical_account_state_known
AND universe_mapping_health_ok
=> continue

otherwise
=> BLOCK NEW ENTRIES
```

### ‏Stage B — Symbol Validity

```text
symbol_resolved
AND instrument_supported
AND trading_status_known
AND not_halted
AND session_supported
AND required_data_present
AND quote_state_valid
=> continue

otherwise
=> REJECT SYMBOL
```

### ‏Stage C — Freshness

```text
critical_quote_age within validated budget
AND data continuity acceptable
=> continue

otherwise
=> REJECT / DATA INVALID
```

### ‏Stage D — Executability

```text
planned_qty known
AND entry side observable
AND exit side observable
AND round-trip friction computable
AND execution state known
=> continue

otherwise
=> REJECT / EXECUTION UNKNOWN
```

### ‏Stage E — Economic Viability

```text
if expected edge estimate exists
AND unavoidable estimated friction clearly >= gross edge
=> REJECT
```

‏במקרי ביניים:

```text
keep as soft execution-quality input
```

### ‏Stage F — Opportunity Quality

```text
activity
momentum quality
shape quality
volatility quality
relative market standing
```

‏ברירת מחדל:

```text
SOFT / RANKING INPUT
```

‏לא Hard Filter עד Evidence.

### ‏Stage G — Final Execution Recheck

```text
signal not expired
AND critical market state unchanged / acceptable
AND quote fresh
AND spread / cost still viable
AND liquidity still viable for planned_qty
AND broker/account/order state known
=> order policy may proceed

otherwise
=> NO TRADE
```

---

## ‏17. Confidence

| Recommendation | Confidence |
|---|---|
| ‏Safety/Data Invalidity כ־Hard Filter | ‏High |
| ‏Fail Closed ל־Critical State | ‏High |
| ‏Execution Recheck לפני Submit | ‏High |
| ‏Reason Codes + Filter Versioning | ‏High |
| ‏שימור Rejected Candidates למחקר | ‏High |
| ‏Soft-by-default למשתנים רציפים | ‏High |
| ‏Absolute + Relative filters יחד | ‏Medium-High |
| ‏Activity threshold ספציפי | ‏Low until measured |
| ‏Spread threshold ספציפי | ‏Low until measured |
| ‏Dynamic/regime thresholds | ‏Medium hypothesis |
| ‏ML eligibility filter | ‏Low / later challenger |

---

## ‏18. Time-Sensitive Facts

‏המקטע הזה הוא בעיקר methodological.

‏לפני שימוש חי עדיין צריך לאמת כל Dependency חיצוני שמופיע בתוך Filter, למשל:

- ‏Broker tradability / permissions.
- ‏Supported sessions.
- ‏Order-type availability.
- ‏Market-status semantics.
- ‏Provider freshness / feed-coverage semantics.
- ‏Corporate-action/reference-data fields.

‏אין לקודד Capability תלויה־ספק מתוך ה־Sheet הזה בלי אימות עדכני.

---

## ‏19. Current Verification Snapshot

‏לא נדרש Web verification חדש למקטע הזה משום שההמלצות המרכזיות הן ארכיטקטורת מחקר וסינון ואינן נשענות על Capability חיצונית ספציפית.

‏ה־Baseline נשען על contracts שכבר נקבעו במקטעים:

```text
05 — Market Data
06 — Time / Sampling / Latency
07 — Trading Universe
08 — Momentum
09 — Momentum Shape
10 — Activity
11 — Liquidity / Executability
```

‏כל Detail חיצוני ייבדק בזמן Implementation הרלוונטי.

---

## ‏20. Relationship to Later Sheets

### ‏13 — Feature Engineering

‏יגדיר כיצד ליצור Features אמינים לפני שנחליט אם להשתמש בהם כ־Soft Filter או Ranking input.

### ‏14 — Score / Ranking

‏יקבע כיצד Candidates שעברו Hard Eligibility מדורגות זו מול זו.

### ‏15 — Top Candidate / Trade-No-Trade

‏יחבר Ranking ל־absolute trade gate, כדי ש־Rank #1 לא יהפוך אוטומטית לעסקה.

### ‏16–17 — Entry / Exit

‏יקבעו את policies לאחר שה־Candidate עברה Filters ו־Recheck.

### ‏18 — True Costs

‏יחזק את Economic Filter באמצעות cost model מדויק יותר.

### ‏23–24 — Validation / Experiments

‏ישמשו לקידום Filters מ־Shadow ל־Soft/Hard על בסיס OOS Evidence.

### ‏25 — Regime Analysis

‏יבחן Dynamic/Regime-specific filters.

### ‏26 — RCA

‏ישתמש ב־Reason Codes, margins ו־rejected-opportunity evidence לניתוח כשלים.

---

## ‏21. Minimum Acceptance Tests

‏לפני שימוש ב־Filter Engine:

### ‏Safety

```text
unknown halt status      => rejected
missing required quote   => rejected
stale critical quote     => rejected
broker disconnected      => global block
```

### ‏Data Semantics

```text
no-data gap != zero activity
invalid bid/ask != normal candidate
```

### ‏Hard/Soft Separation

```text
activity slightly below preference
=> does not become hard reject unless configured/proven
```

### ‏Threshold Margin

```text
value, threshold, margin all persisted
```

### ‏Reason Codes

```text
one symbol may have multiple stable reason codes
```

### ‏Versioning

```text
changing threshold changes filter_set_version or filter_version
```

### ‏Shadow Mode

```text
shadow filter result logged
but decision remains unchanged
```

### ‏Rejected Opportunity Dataset

```text
rejected candidate receives future labels where data permits
```

### ‏Execution Recheck

```text
candidate passes at scan
spread deteriorates before submit
=> NO TRADE
```

### ‏System Funnel Alarm

```text
sudden abnormal stale-quote rejection spike
=> system-health alert / investigate feed
```

---

## ‏22. Recommendation Summary

‏המלצת המקטע היא לא לבנות “רשימת תנאים קשוחה”, אלא **Filter Engine מדיד ומדורג לפי סוג החלטה**:

```text
Safety / invalid / impossible
→ HARD + FAIL CLOSED

Economic impossibility
→ HARD when clearly proven

Continuous quality
→ SOFT / PENALTY / RANKING INPUT

Uncertain new rule
→ SHADOW
```

‏המערכת צריכה לשמור לכל Filter:

```text
what it saw
what rule/version ran
why it passed/failed
how close it was to threshold
what happened afterward
```

‏כך Filters מגינים על `Net Edge` בלי למחוק את היתרון המרכזי של המערכת — סריקה רחבה שמסוגלת למצוא הזדמנויות שאינן ברורות מראש.
