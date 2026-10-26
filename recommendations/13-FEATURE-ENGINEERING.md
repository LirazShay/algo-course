# ‏13 — Recommendation Sheet: Feature Engineering

> ‏מקור לימודי עיקרי: `../13-FEATURE-ENGINEERING-FOR-MARKET-SCANNER.md`.
>
> ‏מטרת הקובץ: לקבוע איך להפוך `Raw Market Data` ל־Features אמינים, point-in-time correct, זולים מספיק ל־Live, ניתנים לשחזור ב־Replay, ומוכחים אמפירית — בלי `feature explosion`, בלי Leakage ובלי ליצור שני עולמות שונים ל־Research ול־Production.

---

## ‏1. Decision

‏אנחנו צריכים להחליט לא רק **אילו Features לחשב**, אלא איזה חוזה הנדסי ומחקרי הופך Feature לראוי להיכנס למערכת.

‏המערכת צריכה לענות על חמש שאלות נפרדות:

```text
What did the market do?
What is happening now?
Can we trust the data?
Can we execute the opportunity?
Does this feature improve future executable outcome?
```

‏Feature Engineering אצלנו אינו אוסף נוסחאות.

‏הוא שכבה מוגדרת היטב בין:

```text
Raw / normalized market state
            ↓
Feature Engine
            ↓
Filters / Ranking / Candidate Gate
            ↓
Execution
            ↓
Outcome / Replay / Research
```

‏המטרה היא ליצור שפה מספרית יציבה שה־Scanner יכול להשוות בה אלפי Symbols, ושאפשר לשחזר בדיעבד בדיוק.

---

## ‏2. Recommended Default

### ‏`P0 — Required`: לכל Feature יש Feature Contract מלא

‏Feature לא נכנס למערכת רק עם שם ונוסחה.

‏לכל Feature נדרש לפחות:

```text
feature_id
name
purpose
role
inputs
source/feed assumptions
formula
window
unit
as_of_rule
anchor_rule
missing_rule
validity_rule
freshness_rule
warmup_rule
expected_range
computation_mode
compute_cost_class
version
validation_tests
```

‏דוגמה:

```text
name              = return_10s
purpose           = recent price movement
role              = SIGNAL
source_price      = last_trade
window            = 10s
anchor_rule       = latest event <= as_of_time - 10s
formula           = current / anchor - 1
missing_rule      = missing if anchor gap exceeds tolerance
freshness_rule    = current state must satisfy data-health contract
unit              = fraction
version           = v1
```

‏ה־Definition הוא חלק מה־Feature עצמו.

### ‏`P0 — Required`: Point-in-time correctness / As-Of Rule

‏כל Feature חייב להיות מחושב רק מנתונים שהיו ידועים בזמן ההחלטה.

```text
source_event_time <= feature_as_of_time
```

‏אסור:

```text
nearest point from either side
full-day statistic at 10:00
future corrected state leaked backward
future bar close used intrabar
```

‏Anchor בחלון זמן יהיה כברירת מחדל:

```text
latest observation where event_time <= target_anchor_time
```

‏ונשמור:

```text
anchor_gap_ms
```

‏אם אין Anchor איכותי מספיק:

```text
feature = MISSING / INVALID
```

‏לא ממציאים ערך.

### ‏`P0 — Required`: Missing אינו Zero

‏המערכת חייבת להבדיל בין:

```text
value = 0
value missing
value invalid
value stale
value warming_up
```

‏לכל Feature חשוב מומלץ להחזיק לפחות:

```text
value
status
age_ms
reason_if_unusable
```

‏Reason Codes אפשריים:

```text
NO_ANCHOR
INSUFFICIENT_HISTORY
SOURCE_MISSING
SOURCE_STALE
FEED_GAP
INVALID_DENOMINATOR
OUT_OF_ORDER_UNRESOLVED
WARMING_UP
PROVIDER_STATE_UNKNOWN
```

‏ערך חסר לעולם לא יומר אוטומטית ל־0 רק כדי להקל על החישוב.

### ‏`P0 — Required`: Feature/Label Separation

‏Features הם רק מה שהיה ידוע ב־`T0`.

‏Labels הם העתיד אחרי `T0`.

```text
FEATURES @ T0
----------------
return_5s
trade_rate_5s
spread_pct
quote_age_ms

LABELS after T0
----------------
forward_return_1s
forward_return_5s
MFE_10s
MAE_10s
time_to_first_executable_profit
realized_net_outcome
```

‏אין לערבב את שתי השכבות באותו חישוב.

### ‏`P1 — Preferred Default`: Feature Set קטן ומחולק לפי Role

‏לא נכניס את כל המדדים ל־Score אחד.

‏ה־Feature Registry יסווג לפחות:

```text
SIGNAL
ACTIVITY
EXECUTION
RISK
CONTEXT
DATA_QUALITY
DIAGNOSTIC
```

‏תפקידים שונים אינם בהכרח משוקללים יחד.

‏לדוגמה:

```text
SIGNAL
  return_1s
  return_5s
  return_10s
  return_30s
  return_60s
  momentum_delta_5s

ACTIVITY
  trade_count_1s
  trade_count_5s
  trade_count_10s
  trade_rate_5s
  volume_5s
  volume_10s
  dollar_volume_10s
  activity_delta_5s

EXECUTION
  spread_abs
  spread_bps
  bid_size
  ask_size
  order_to_bid_size_ratio
  order_to_ask_size_ratio

DATA_QUALITY / TIMING
  quote_age_ms
  trade_age_ms
  feed_gap_ms
  anchor_gap_ms
  signal_age_ms
```

‏Features כגון `path_efficiency`, relative activity ו־cross-sectional percentiles הם תוספות בעלות ערך גבוה למחקר, אבל אין חובה לדחוף הכול לגרסת Baseline הראשונה.

### ‏`P1 — Preferred Default`: Fast Path לכל השוק, Deep Path למועמדות

‏ארכיטקטורה מומלצת:

```text
ALL ELIGIBLE SYMBOLS
        ↓
FAST FEATURES
        ↓
cheap filtering / preliminary ranking
        ↓
SHORTLIST
        ↓
DEEP FEATURES
        ↓
final candidate / execution gate
```

‏Fast Features צריכים להיות:

```text
cheap
incremental
available broadly
stable enough
low-latency
```

‏דוגמאות:

```text
returns
trade counts / rates
basic volume
spread
sizes
freshness
```

‏Deep Features יכולים בעתיד לכלול:

```text
fine-grained trade-flow
book imbalance
microprice
multi-level depth
quote-update intensity
queue proxies
resiliency
```

‏רק אם הוכח שהם מוסיפים ערך מעל Fast Path.

### ‏`P1 — Preferred Default`: Incremental Computation

‏Feature Engine לא יסרוק היסטוריה מלאה בכל Market Update.

‏לכל Symbol נשמור State מתגלגל:

```text
rolling event windows
rolling sums
rolling counts
latest anchors
current quote state
feature cache
feature timestamps
```

‏כאשר Event מגיע:

```text
1. validate / normalize event
2. update symbol state
3. expire old window members
4. update aggregates incrementally
5. recompute only affected features
6. publish new feature state
```

‏העיקרון:

```text
precompute incrementally
→ rank cheaply
```

### ‏`P1 — Preferred Default`: Research, Replay ו־Live משתמשים באותה הגדרה

‏לא נרצה:

```text
backtest_feature_A
live_feature_B
```

‏אותו `feature_id + version` חייב לייצג אותה סמנטיקה.

‏אם מקור הנתונים שונה, נשמור זאת במפורש:

```text
feature_definition_version
source_profile
coverage_profile
sampling_profile
```

‏כך ניתן לזהות `training-serving skew` ולא להסתיר אותו תחת אותו שם.

### ‏`P1 — Preferred Default`: Deterministic Replay

‏על אותם Raw Events, אותה גרסת Parser, אותה גרסת Feature Engine ואותו Clock/Ordering policy:

```text
Replay A feature vector
==
Replay B feature vector
```

‏Determinism הוא Acceptance Criterion, לא Nice-to-have.

### ‏`P1 — Preferred Default`: Feature Freshness הוא חלק מהערך

‏Feature אינו רק:

```text
value
```

‏אלא:

```text
value + as_of_time + age + validity
```

‏Feature שהיה מצוין לפני שלוש שניות יכול להיות חסר ערך לאסטרטגיה של שניות.

‏לכן כל Consumer צריך לדעת את `feature_age_ms` או את גיל ה־inputs הקריטיים שלו.

### ‏`P1 — Preferred Default`: Warm-Up מפורש

‏לאחר Startup, reconnect או data gap, Features מסוימים אינם Ready.

‏דוגמה:

```text
return_5s  -> ready after sufficient 5s history
return_60s -> ready after sufficient 60s history
RVOL       -> requires its own historical baseline
```

‏State אפשרי:

```text
WARMING_UP
```

‏ולא ערך מלאכותי.

‏Warm-Up יהיה פר Feature או פר Family, לא Boolean גלובלי בלבד.

### ‏`P1 — Preferred Default`: Reconnect / Gap Policy מפורשת

‏לאחר Gap צריך להחליט עבור כל Feature:

```text
KEEP_VALID
MARK_STALE
INVALIDATE
RESET_WINDOW
REQUIRE_WARMUP
```

‏Rolling count שחסרות ממנו שתי שניות של Events אינו “פעילות נמוכה”.

‏הוא Feature לא אמין.

### ‏`P1 — Preferred Default`: Feature Lineage מלאה

‏לכל ערך חשוב נוכל לעקוב:

```text
raw events
→ normalized state
→ feature inputs
→ feature version
→ feature value
→ filter / score
→ rank
→ decision
→ order / fill
```

‏Lineage מאפשר RCA אמיתי במקום השערה.

### ‏`P1 — Preferred Default`: Decision Feature Vector נשמר

‏לכל Candidate decision נשמור את ה־Feature Vector שהיה קיים בזמן ההחלטה.

```text
symbol
as_of_time
feature_set_version
feature values
feature statuses
source profile
filter set version
```

‏ל־Execution analysis נשמור גם:

```text
features_at_signal
features_at_order_send
features_at_fill
```

‏כך נוכל למדוד `Execution Drift` ולא לייחס Latency לבעיה ב־Signal.

### ‏`P1 — Preferred Default`: Features פשוטים לפני Feature Kitchen Sink

‏גרסה ראשונית אינה צריכה:

```text
100 windows
× 50 metrics
× 10 transforms
```

‏היא צריכה מעט משפחות עם Hypothesis ברור.

‏הכלל:

```text
If two features carry nearly the same information,
prefer the simpler and cheaper one.
```

‏לדוגמה:

```text
velocity_5s = return_5s / 5
```

‏כאשר 5 שניות הן קבוע, אין הצדקה להחזיק אותו כ־Signal עצמאי נוסף רק בשם אחר.

### ‏`P1 — Preferred Default`: Feature Budget

‏לכל Feature יש עלות:

```text
Data cost
CPU cost
Memory cost
Latency cost
Storage cost
Complexity cost
Debugging cost
Operational fragility
```

‏נגדיר Budget ברמת המערכת:

```text
max compute per symbol
max memory per symbol
max acceptable feature age
max feature-engine latency
```

‏Feature שלא עומד ב־Budget אינו Production Feature גם אם הוא נראה מעניין במחקר.

### ‏`P2 — Challenger`: Cross-Sectional Percentiles

‏Percentile הוא Normalization טבעי לסורק רוחבי:

```text
momentum_percentile
activity_percentile
spread_quality_percentile
```

‏יתרונו:

- ‏אינו דורש הנחת Normal distribution.
- ‏קל להסביר.
- ‏מתאים להשוואת אלפי מניות באותו `as_of_time`.

‏אבל Percentile תמיד ייצור Winner גם ביום חלש.

‏לכן:

```text
relative feature != absolute viability
```

‏והוא אינו מחליף Hard Gates או Absolute Quality checks.

### ‏`P2 — Challenger`: Z-Score לפי צורך

‏`Z-Score` יכול להיות שימושי כאשר Distribution יציבה מספיק.

```text
z = (x - mean) / std
```

‏אבל הוא אינו Baseline אוטומטי לכל Feature בגלל:

- ‏heavy tails.
- ‏outliers.
- ‏regime drift.
- ‏std קטן/לא יציב.

‏נעדיף אותו רק כאשר Distribution diagnostics תומכים בו.

### ‏`P3 — Avoid Unless Evidence`: Min-Max בזמן אמת

‏Min-Max cross-sectional רגיש מאוד ל־outlier יחיד.

‏אם Symbol אחד קיצוני, רוב השוק עלול להידחס לטווח צר.

‏לכן הוא אינו ברירת המחדל שלנו ל־real-time ranking.

### ‏`P2 — Challenger`: Relative-to-Self Features

‏Features כמו:

```text
current_trade_rate / typical_trade_rate_at_same_time_of_day
current_spread / typical_spread
```

‏יכולים לזהות “התעוררות” של Symbol יחסית לעצמו.

‏אבל הם דורשים:

```text
historical baseline correctness
session alignment
corporate-action awareness
stable symbol identity
```

‏ולכן אינם Baseline ללא Dataset מתאים.

### ‏`P2 — Challenger`: Market-Relative Momentum

‏אפשר לבדוק:

```text
stock_return_h - market_return_h
```

‏כדי להבדיל בין מניה חזקה באמת לבין עלייה כללית של השוק.

‏Promotion רק אם הוא מוסיף ערך מעל raw cross-sectional momentum.

### ‏`P3 — Advanced Challenger`: Sector-relative Features

‏יכולים להיות שימושיים, אבל מוסיפים Reference Data, classification drift ו־synchronization complexity.

‏לא נוסיף לפני שמדידה פשוטה יותר מצדיקה את העלות.

### ‏`P2 — Challenger`: Interactions

‏Feature Interaction יכול להיות שימושי כאשר ההשפעה תלויה בהקשר.

‏דוגמאות:

```text
momentum × spread quality
momentum × activity acceleration
signal strength × signal age
expected move - estimated friction
```

‏אבל Interaction אינו תירוץ להתחיל לייצר אלפי Cross Products.

‏כל Interaction צריך Hypothesis ואבלציה משלו.

### ‏`P2 — Preferred Research Tool`: Diagnostic-only Features

‏לא כל Feature צריך להשתתף ב־Ranking.

‏Diagnostic Features יכולים לכלול:

```text
feed_gap_ms
book_change_since_signal
rank_distance_to_second
feature_compute_latency_ms
source_event_lag_ms
```

‏הם יכולים להיות קריטיים ל־RCA גם אם משקלם ב־Score הוא אפס.

### ‏`P3 — Advanced Challenger`: Deep Microstructure Features

‏כולל:

```text
order_book_imbalance
microprice
quote_update_rate
signed/aggressor flow proxies
queue proxies
resiliency
multi-level depth
```

‏Promotion רק אם מתקיימים יחד:

```text
incremental predictive/execution value
+ realistic data availability
+ acceptable cost
+ no latency regression
+ stable out-of-sample behavior
```

---

## ‏3. Why

### ‏Fact

‏Feature הוא Transformation של Raw/Normalized Data; איכות ה־Score אינה יכולה לעקוף Feature definition שגויה.

### ‏Fact

‏Feature בעל אותו שם אך Input Feed, Sampling או Anchor Rule שונים אינו בהכרח אותו Feature.

### ‏Fact

‏חלוקה בקבוע אינה מוסיפה מידע לדירוג; `return_5s` ו־`return_5s / 5` שומרים אותו ordering.

### ‏Fact

‏Feature המבוסס על מידע שהתרחש אחרי `decision_time` יוצר Look-Ahead Bias.

### ‏Fact

‏Missing, stale ו־invalid הם מצבים שונים מ־0.

### ‏Fact

‏מערכת Live צריכה לחשב Features תחת מגבלת CPU, Memory ו־Latency; Feature שאינו ניתן לחישוב בזמן אינו Feature תפעולי שימושי.

### ‏Judgment

‏למערכת שלנו עדיף Feature Engine קטן, מפורש, deterministic ו־incremental על פני Catalog עצום ומורכב בתחילת הדרך.

### ‏Judgment

‏Cross-sectional percentile הוא Challenger טבעי לסריקת כל השוק, אך אין לאפשר לו לעקוף Absolute Viability.

### ‏Judgment

‏יש להפריד Features לפי תפקיד כדי לא ליצור Score אחד שמערבב Prediction, Data Quality, Execution ו־Risk ללא שליטה.

### ‏Hypothesis

‏שילוב קטן של Momentum + Activity + Execution/Freshness עשוי לתת יותר ערך נטו ממאות Indicators כלליים שאינם מותאמים ל־horizon של שניות.

### ‏Hypothesis

‏Features של decay, freshness ו־signal age עשויים להיות חשובים במיוחד משום שה־Edge שאנחנו מחפשים קצר־חיים.

### ‏Hypothesis

‏Deep microstructure עשוי לשפר את בחירת Top Candidates, אבל ייתכן שהערך השולי שלו לא יצדיק את עלות הנתונים וה־latency.

---

## ‏4. Use When

‏ה־Baseline הזה מתאים כאשר:

- ‏סורקים Universe רחב בתדירות גבוהה.
- ‏אותות נשענים על Horizons של שניות ועד בערך דקה.
- ‏נדרש Replay אמין.
- ‏נדרש Backtest point-in-time correct.
- ‏רוצים לבצע Ablation ולהבין מה כל Feature תרם.
- ‏רוצים להפריד Prediction מ־Execution ו־Data Quality.
- ‏רוצים לאפשר החלפת Provider בלי להחליף את כל לוגיקת הסורק.
- ‏Latency ו־compute cost הם חלק מהמערכת אבל אין יעד להתחרות ב־HFT microseconds.

---

## ‏5. Do Not Use When

‏אין להשתמש באותו Feature Set ללא התאמה אם:

- ‏Horizon האסטרטגיה משתנה מדקות/שניות לימים או שבועות.
- ‏מקור הנתונים Live אינו מסוגל לספק את Inputs שעליהם Research הסתמך.
- ‏אין Timestamp semantics אמינים.
- ‏אין דרך לשחזר את סדר האירועים.
- ‏Feature תלוי Data שאין לנו הרשאה או Coverage יציב לקבל.
- ‏Feature דורש Warm-Up שלא ניתן לספק לפני Decision.
- ‏אותו שם מסתיר נוסחאות שונות בין מחקר ל־Live.

---

## ‏6. Alternatives

### ‏Alternative A — Minimal Feature Set בלבד

‏יתרונות:

- ‏פשוט.
- ‏מהיר.
- ‏קל ל־RCA.
- ‏סיכון Overfitting נמוך יותר.

‏חסרונות:

- ‏יכול לפספס Interactions או Microstructure useful signals.

### ‏Alternative B — Large Hand-Crafted Feature Library

‏יתרונות:

- ‏כיסוי רעיונות רחב.
- ‏נוח למחקר Exploratory.

‏חסרונות:

- ‏Feature Explosion.
- ‏Redundancy.
- ‏קושי ב־Ablation.
- ‏עלות חישוב ואחסון.
- ‏Overfitting risk.

### ‏Alternative C — ML-first automatic representation

‏יתרונות:

- ‏יכול למצוא קשרים לא־ליניאריים ואינטראקציות.

‏חסרונות:

- ‏קשה יותר לאבחון.
- ‏קל יותר ליצור Leakage.
- ‏דורש Dataset ו־validation חזקים יותר.
- ‏אינו פותר Data Quality או point-in-time correctness.

‏לכן אינו Baseline שלנו.

### ‏Alternative D — Full tick/L2 features לכל Universe

‏יתרונות:

- ‏רזולוציה עשירה.

‏חסרונות:

- ‏Data bandwidth.
- ‏CPU/Memory.
- ‏complexity.
- ‏provider dependency.
- ‏קושי ב־Replay.
- ‏סיכון שהעלות תעלה על הערך.

‏לכן Deep Path בלבד עד שיוכח אחרת.

---

## ‏7. Trade-offs

| החלטה | יתרון | מחיר |
|---|---|---|
| Feature Set קטן | הסבר, מהירות, robustness | פחות expressiveness |
| Percentile | cross-sectional robust יחסית | תמיד יש winner |
| Raw absolute features | פשוטים להבנה | פחות adaptive ל־regime |
| Relative-to-self | מזהים שינוי חריג | דורשים baseline היסטורי איכותי |
| Incremental computation | latency נמוך | state management מורכב יותר |
| Shared live/research definitions | parity ושחזור | דורש ארכיטקטורה משותפת |
| Deep features רק ל־Top N | חוסך data/compute | יכול לפספס מועמדת אם Fast stage חלש |
| Feature clipping | מגן על Score מ־outliers | יכול למחוק אירוע אמיתי |
| Smoothing | מפחית noise | מוסיף lag |
| More windows | temporal detail | redundancy + compute |

---

## ‏8. What I Would Avoid Initially

‏הייתי נמנע בתחילת הדרך מ־:

- ‏עשרות Indicators מוכרים רק כי הם נפוצים.
- ‏מאות חלונות כמעט זהים.
- ‏Ratios ללא denominator policy.
- ‏`Min-Max` כ־normalization ראשי בזמן אמת.
- ‏Feature אחד בשם זהה עם סמנטיקה שונה בין Backtest ו־Live.
- ‏Interpolation של Anchor עתידי כדי “לסדר” Dataset.
- ‏מילוי Missing ב־0.
- ‏Clipping/Winsorization בלי תיעוד ו־A/B validation.
- ‏Feature שמבוסס על Consolidated Tick/L2 כאשר Live Feed בפועל אינו נותן זאת.
- ‏חישוב full-history בכל Tick.
- ‏Feature Store enterprise מורכב לפני שיש צורך אמיתי.
- ‏Deep Book לכל אלפי ה־Symbols.
- ‏Feature Kitchen Sink ואז “המודל כבר יבחר”.

---

## ‏9. What to Add Later

‏לפי Evidence אפשר להוסיף:

```text
relative-to-time-of-day activity
market-relative momentum
sector-relative context
short-window volatility
spread stability / velocity
book imbalance
microprice
quote-update intensity
aggressor-flow proxies
resiliency
queue / fill-probability proxies
regime-aware feature transforms
adaptive windows
```

‏כל תוספת עוברת את אותו Feature Gate.

---

## ‏10. Required Data / Evidence

‏למחקר Feature איכותי נדרש לפחות:

```text
symbol
as_of_time
source profile / feed coverage
feature_set_version
feature values
feature validity/status
feature ages
anchor gaps
filter state
rank context
```

‏ול־Labels:

```text
forward executable returns
1s / 2s / 5s / 10s / 30s / 60s
MFE / MAE
first executable profit time
time to target
entry/exit feasibility
realized / simulated execution cost
net outcome
```

‏ל־RCA נרצה גם:

```text
raw/normalized source lineage
features_at_signal
features_at_order_send
features_at_fill
compute latency
feed gaps
```

---

## ‏11. Promotion Criteria

‏Feature עובר מ־Research ל־Production candidate רק אם:

1. ‏ה־Definition מלאה וחד־משמעית.
2. ‏אין Look-Ahead / Label Leakage.
3. ‏Unit tests ו־edge cases עוברים.
4. ‏Replay deterministic.
5. ‏Live/Research semantics תואמות.
6. ‏Missing/Warm-Up/Reconnect behavior מוגדרים.
7. ‏ה־Feature ניתן לחישוב בתוך Budget.
8. ‏הוא מראה incremental value מעל Baseline רלוונטי.
9. ‏הערך נשמר מחוץ למדגם / Walk-forward.
10. ‏הערך קיים אחרי realistic execution costs.
11. ‏הוא אינו רק duplicate של Feature קיים.
12. ‏הוא יציב על מספר ימים/Symbols/Regimes או שמוגדר במפורש כ־regime-specific.
13. ‏Shadow Live אינו חושף skew או operational fragility.
14. ‏הוא משפר החלטה בפועל, לא רק metric מבודד.

---

## ‏12. Rejection Criteria

‏Feature יידחה או יישאר Experimental אם:

- ‏הוא משתמש בעתיד.
- ‏לא ניתן לשחזר אותו ב־Live.
- ‏הוא תלוי Feed שאינו זמין/יציב במערכת שלנו.
- ‏Ablation מראה שאין incremental value.
- ‏הוא duplicate כמעט מלא של Feature זול יותר.
- ‏שיפור קיים רק In-Sample.
- ‏התוצאה נעלמת לאחר עלויות.
- ‏הוא שביר ל־threshold/window קטן.
- ‏הוא דורש compute שמגדיל signal age יותר מהערך שהוא מוסיף.
- ‏Missing rate גבוהה מדי.
- ‏הוא נשבר אחרי reconnect/warm-up.
- ‏Distribution drift הופך אותו ללא יציב ללא הסבר.
- ‏הוא משפר Average אבל מרע Tail Risk או exit feasibility באופן מהותי.

---

## ‏13. Metrics

### ‏Feature Research Metrics

```text
bucket outcome curves
percentile outcome curves
monotonicity / nonlinearity
forward executable return
MFE / MAE
time_to_first_executable_profit
time_to_target
incremental EV
incremental net edge
```

### ‏Redundancy Metrics

```text
pairwise correlation
rank correlation
conditional incremental value
ablation delta
feature overlap by bucket
```

### ‏Reliability Metrics

```text
missing_rate
invalid_rate
stale_rate
warmup_rate
anchor_gap distribution
replay mismatch rate
live/research parity errors
```

### ‏Performance Metrics

```text
feature compute p50/p95/p99
per-symbol memory
feature update throughput
queue/backpressure
feature age at ranking
```

### ‏Drift Metrics

```text
min
max
median
p90
p99
missing rate
invalid rate
cross-sectional distribution shifts
historical distribution shifts
```

### ‏Decision Metrics

```text
outcome by feature bucket
Top-N lift
rank stability
winner margin
net opportunity rate
performance with / without feature
```

---

## ‏14. Failure Modes

### ‏Failure Mode 1 — Look-Ahead

‏Feature משתמש ב־Event עתידי.

‏תוצאה: Research נראה מצוין ו־Live נכשל.

### ‏Failure Mode 2 — Backtest/Live Skew

‏אותו Feature name מחושב בצורה שונה.

### ‏Failure Mode 3 — Missing-as-Zero

‏Feed gap נראה כמו פעילות אפס או Return אפס.

### ‏Failure Mode 4 — Duplicate Feature Explosion

‏מאות וריאציות כמעט זהות יוצרות complexity בלי מידע חדש.

### ‏Failure Mode 5 — Provider Coverage Drift

‏Feature שינה Distribution כי Feed השתנה, לא כי השוק השתנה.

### ‏Failure Mode 6 — Warm-Up Blindness

‏Feature ארוך מקבל ערך “מלא” מיד אחרי Startup.

### ‏Failure Mode 7 — Reconnect Corruption

‏Rolling window מכיל חור אך מסומן valid.

### ‏Failure Mode 8 — Ratio Explosion

‏Denominator קטן יוצר outlier עצום.

### ‏Failure Mode 9 — Over-clipping

‏אירוע אמיתי שהיינו רוצים לזהות נחתך כ־outlier.

### ‏Failure Mode 10 — Feature Cost Eats Signal

‏Feature משפר prediction תיאורטית אבל מוסיף latency שמוחק את ה־Edge.

### ‏Failure Mode 11 — Cross-Sectional Winner Trap

‏99th percentile נראה חזק גם כשכל השוק חלש אבסולוטית.

### ‏Failure Mode 12 — Same Feature, Different Clock

‏Symbols מחושבים על `as_of_time` שונה מדי ולכן ranking אינו snapshot לוגי.

### ‏Failure Mode 13 — Diagnostic Feature Accidentally Drives Score

‏Feature שיועד ל־RCA נכנס ל־Ranking ללא validation.

### ‏Failure Mode 14 — Feature Retirement Never Happens

‏Features ישנים ממשיכים לצרוך compute למרות שאין להם ערך.

---

## ‏15. User-Specific Application

‏עבור רובוט `Short-Horizon Momentum` שלנו, הייתי בונה את השפה כך:

```text
RAW MARKET EVENTS
        ↓
NORMALIZED SYMBOL STATE
        ↓
FAST FEATURE ENGINE
        ↓
Hard Filters
        ↓
Cross-sectional context
        ↓
Ranking
        ↓
Top Candidates
        ↓
DEEP FEATURE / EXECUTION RECHECK
        ↓
TRADE / NO TRADE
```

‏ה־Fast Feature Set הראשוני המומלץ למחקר:

```text
PRICE
  return_1s
  return_5s
  return_10s
  return_30s
  return_60s
  momentum_delta_5s

ACTIVITY
  trades_1s
  trades_5s
  trades_10s
  volume_5s
  volume_10s
  dollar_volume_10s
  activity_delta_5s

EXECUTION / LIQUIDITY
  spread_bps
  bid_size
  ask_size
  order_to_bid_size_ratio
  order_to_ask_size_ratio

TIMING / QUALITY
  quote_age_ms
  trade_age_ms
  anchor_gap_ms
  signal_age_ms
```

‏Challengers מוקדמים:

```text
path_efficiency_10s
positive_segment_ratio
activity_percentile
momentum_percentile
relative_trade_rate
spread stability
market-relative momentum
```

‏Deep Path בלבד:

```text
book imbalance
microprice
quote-update rate
order-flow proxies
multi-level depth
queue / fillability proxies
```

‏המטרה אינה למצוא Feature “חכם”.

‏המטרה היא למצוא Feature שמשפר:

```text
future executable continuation
-
execution friction
-
signal decay
```

‏באופן יציב.

---

## ‏16. Concrete Baseline Contract

‏Feature יכול להשתתף בהחלטה רק אם:

```text
feature_definition_version known
AND feature_set_version known
AND as_of_time known
AND all required source states satisfy their validity contract
AND feature is not using future data
AND feature status == VALID
AND feature age <= supported freshness budget
AND warmup complete
AND reconnect/gap policy satisfied
AND computation completed inside supported latency budget
=> feature may be consumed

otherwise
=> feature is MISSING / INVALID / STALE / WARMING_UP
```

‏ל־Decision Vector:

```text
all P0-required features valid
AND data-quality features confirm usable state
AND logical snapshot/as_of_time rules satisfied
=> ranking may consume the vector

otherwise
=> candidate cannot be treated as a normal ranked observation
```

---

## ‏17. Feature Card Template

‏לכל Feature חשוב נשמור כרטיס בסגנון:

```text
Name:
Role:
Question answered:
Hypothesis:
Inputs:
Source semantics:
Formula:
Window:
Unit:
As-of rule:
Anchor rule:
Missing rule:
Freshness rule:
Warm-up rule:
Reconnect rule:
Expected range:
Outlier policy:
Computation mode:
Compute cost:
Version:
Unit tests:
Property tests:
Historical evidence:
Ablation result:
Regime notes:
Production status:
Retirement criteria:
```

‏זה יהיה ה־contract בין Research, Engineering ו־Operations.

---

## ‏18. Feature Lifecycle

```text
IDEA
  ↓
HYPOTHESIS
  ↓
FEATURE CARD
  ↓
IMPLEMENT + TEST
  ↓
HISTORICAL COMPUTATION
  ↓
BUCKET / DISTRIBUTION ANALYSIS
  ↓
ABLATION
  ↓
OUT-OF-SAMPLE / WALK-FORWARD
  ↓
SHADOW LIVE
  ↓
PRODUCTION CANDIDATE
  ↓
ACTIVE
  ↓
MONITOR / RETIRE
```

‏אין קפיצה מ־“נראה הגיוני” ל־Production Score.

---

## ‏19. Testing Strategy for Features

### ‏Unit Tests

‏דוגמאות:

```text
known anchor + known current price -> exact return
known trades -> exact count/volume
known bid/ask -> exact spread
```

### ‏Edge Cases

```text
missing anchor
zero denominator
near-zero denominator
same timestamp
out-of-order event
duplicate event
reconnect gap
session boundary
halt / resume
corporate-action boundary
```

### ‏Property Tests

‏דוגמאות:

```text
spread_abs >= 0 when quote valid
0 <= position_in_range <= 1 when range > 0
trade_count_window >= 0
feature_age_ms >= 0
```

### ‏Replay Tests

```text
same input stream
+ same versions
=> same feature stream
```

### ‏Parity Tests

```text
historical/replay implementation
vs
live incremental implementation
```

‏על אותו Input slice צריכים להגיע לערכים זהים במסגרת precision מוגדרת.

---

## ‏20. Observability

‏Feature Engine צריך לחשוף לפחות:

```text
feature_compute_latency p50/p95/p99
feature_age p50/p95/p99
missing_rate by feature
invalid_rate by feature
warmup state
reconnect invalidations
feature distribution summaries
feature version
source/feed profile
```

‏ברמת Decision:

```text
feature vector
feature statuses
filter outcomes
rank
candidate/no-candidate reason
```

‏כך Rank #1 אינו Black Box.

---

## ‏21. Feature Drift Policy

‏Drift אינו אוטומטית Bug.

‏הוא יכול להגיע מ־:

```text
market regime change
universe change
session mix change
provider / coverage change
parser/schema change
feature bug
```

‏כאשר Distribution משתנה מהותית:

```text
1. detect
2. identify source
3. compare raw-data distributions
4. compare provider/schema versions
5. assess decision impact
6. do not retune threshold blindly
```

‏אין “לתקן” Drift אוטומטית לפני RCA.

---

## ‏22. Feature Retirement

‏Feature אינו נשאר לנצח רק כי פעם עבד.

‏Retirement candidate כאשר:

- ‏incremental value נעלם.
- ‏הוא duplicate של Feature אחר.
- ‏עלות הנתונים/חישוב גבוהה מדי.
- ‏Drift הפך אותו לשביר.
- ‏הוא אינו נמצא בשום Decision path.
- ‏הוא Diagnostic שכבר אינו נדרש.

‏Retirement צריך להיות Versioned ו־measured, לא מחיקה שקטה.

---

## ‏23. Confidence

### ‏High Confidence

- ‏As-of correctness הוא חובה.
- ‏Missing אינו Zero.
- ‏Feature Definition/Versioning/Lineage נחוצים לשחזור.
- ‏Research/Replay/Live parity עדיפה על implementations נפרדים.
- ‏Incremental computation עדיף לסורק רחב כאשר ה־semantics נשמרים.
- ‏Redundant Features אינם מוסיפים מידע רק בגלל שם שונה.

### ‏Medium Confidence

- ‏Percentiles יהיו Normalization שימושי במיוחד לסריקה cross-sectional.
- ‏Feature Set קטן ומפורש ינצח בתחילת הפרויקט Catalog גדול מבחינת engineering/research velocity.
- ‏Fast/Deep split יהיה נכון יותר מ־full depth לכל Universe.

### ‏Low / Unproven

- ‏איזה Feature מסוים ינבא Edge רווחי.
- ‏איזה Horizon יהיה הטוב ביותר.
- ‏האם L2/microprice/order-flow יוסיפו ערך נטו.
- ‏האם relative-to-market/sector ישפרו את ה־Baseline.
- ‏איזה normalization יהיה הטוב ביותר לכל משפחה.

---

## ‏24. Time-Sensitive Facts

‏המקטע הזה בעיקר מתודולוגי ואינו תלוי בגרסת API מסוימת.

‏לפני Production יש לאמת מחדש כל Feature שתלוי ב־:

```text
provider field semantics
feed coverage
sampling/update cadence
trade correction behavior
quote-size semantics
L2 availability
historical/live parity of the provider
broker/API timestamps
```

‏אם Provider משנה semantics, Feature Version צריך להשתנות או לפחות `source_profile` חייב לשקף זאת.

---

## ‏25. Current Verification Snapshot

‏לא נדרש Web verification חיצוני חדש כדי לקבוע את ה־Baseline של מקטע 13, משום שההמלצות כאן הן עקרונות של correctness, research methodology ו־system design.

‏Facts תלויי ספק נשארו במפורש מחוץ ל־Baseline ויידרשו אימות בזמן Implementation.

---

## ‏26. Relationship to Earlier Sheets

### ‏מקטע 05 — Market Data

‏מגדיר את מקורות המידע, Coverage ו־timestamps שמהם Features נבנים.

### ‏מקטע 06 — Time / Sampling / Latency

‏מגדיר `as_of_time`, freshness, logical snapshot ו־latency budget.

### ‏מקטעים 08–09 — Momentum / Shape

‏מספקים משפחת Signal Features ראשונה.

### ‏מקטע 10 — Activity

‏מספק Trade/Volume Features והזהרה ש־coverage משנה את המספרים.

### ‏מקטע 11 — Liquidity

‏מספק Execution Features ומחייב position-size awareness.

### ‏מקטע 12 — Filters

‏צורך Features אך אינו צריך להפוך כל Feature רציף ל־Hard Rule.

---

## ‏27. Relationship to Later Sheets

### ‏מקטע 14 — Score / Market Ranking

‏יקבע איך Features שכן ראויים לדירוג משולבים ומשווים בין Symbols.

‏מקטע 13 **לא** קובע עדיין משקלים ולא Score סופי.

### ‏מקטע 15 — Top Candidate / Trade-No-Trade

‏ישתמש ב־Rank וב־absolute gate, אך Feature Vector יישאר Evidence הבסיס.

### ‏מקטעים 16–18 — Entry / Exit / Costs

‏יחדדו Execution Features, target definitions ו־net-edge labels.

### ‏מקטעים 20–24 — Backtest / Validation / Experiments

‏יאמתו Feature value, ablation, leakage, stability ו־walk-forward behavior.

### ‏מקטע 25 — Regime Analysis

‏יבדוק אם Features דורשים conditional/regime-aware interpretation.

### ‏מקטעים מאוחרים — Observability / Data Engineering / Feature Retirement

‏ירחיבו monitoring, lineage, production operations ו־retirement policy.

---

## ‏28. What Would Change This Recommendation

‏נרחיב מעבר ל־Baseline אם Evidence יראה ש־:

- ‏Feature משפחה חדשה נותנת incremental net edge יציב.
- ‏Deep data משפר משמעותית fill/slippage/continuation prediction.
- ‏Fast Path מפספס Candidates שה־Deep Path יכול לזהות בזול מספיק.
- ‏Percentile normalization שביר יותר מ־alternative מסוים.
- ‏Feature Set קטן סובל מ־underfitting עקבי ומוכח.
- ‏Compute/Data budget גדל בלי להגדיל signal age.

‏נפשט עוד יותר אם Evidence יראה ש־:

- ‏כמה Features אינם מוסיפים מידע מעל returns/activity בסיסיים.
- ‏deep features אינם שורדים costs.
- ‏Feature complexity פוגעת ב־latency יותר ממה שהיא משפרת prediction.

---

## ‏29. Recommendation Summary

‏ברירת המחדל למערכת שלנו היא **Feature Engine קטן, role-aware, point-in-time correct, incremental, deterministic ו־versioned**.

‏העקרונות המרכזיים:

```text
Feature definition before feature value
As-of correctness before predictive testing
Missing != zero
Same semantics in Research / Replay / Live
Simple baseline before feature explosion
Fast features for all symbols
Deep features only for shortlisted candidates
Role separation: Signal / Execution / Risk / Context / Data Quality
Ablation before promotion
Net executable outcome before pretty correlation
Latency/data cost is part of feature value
```

‏ה־Feature Set הראשון צריך להיות מספיק עשיר כדי לתאר Momentum, Activity, Executability ו־Freshness — אבל קטן מספיק כדי שנוכל להבין כל החלטה ולדעת בדיוק מה כל תוספת תרמה.

‏במקטע 14 נוכל לראשונה לקחת את Feature Set הזה ולבחון איך להפוך אותו ל־`Score / Ranking`, בלי להניח שכל Feature צריך להיכנס לאותו מספר.