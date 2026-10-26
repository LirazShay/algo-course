# ‏08 — Recommendation Sheet: Short-Term Momentum

> ‏מקור לימודי עיקרי: `../08-SHORT-TERM-MOMENTUM.md`.
>
> ‏מטרת הקובץ: לקבוע Baseline מחקרי ומעשי למדידת `Short-Horizon Momentum` עבור הרובוט — אילו Returns למדוד, כיצד לבחור Anchors בלי `look-ahead`, איך לשמור `as_of_time`, איך לבנות Labels עתידיים, ומה אסור להפוך עדיין ל־Score או ל־BUY rule לפני Evidence.

---

## ‏1. Decision

‏איך לתאר את תנועת המחיר הקצרה כך שהמערכת תוכל להשוות אלפי מניות בצורה עקבית, לשחזר את החישוב בדיעבד, לבדוק האם המומנטום באמת מנבא המשך קצר, ולהפריד בין:

```text
price moved recently
```

‏לבין:

```text
there is still an executable positive net edge now
```

---

## ‏2. Recommended Default

### ‏`P1 — Preferred Default`: להתחיל מ־Simple Return, לא ממדד מורכב

‏Baseline לכל Horizon:

```text
return_h = current_price / anchor_price_h - 1
```

‏כאשר צריך תצוגה נוחה אפשר לשמור גם:

```text
return_bps = return * 10_000
```

‏אין צורך להתחיל מ־`log returns` אלא אם מחקר מאוחר יותר מראה יתרון ברור.

### ‏`P1 — Preferred Default`: משפחת Horizons קטנה, ברורה וגרסתית

‏Baseline ראשוני למחקר:

```text
1s
5s
10s
30s
60s
```

‏הם אינם "החלונות הנכונים לנצח".

‏הם סט התחלתי קטן שמייצג:

```text
very short reaction
short continuation
short context
roughly one-minute context
```

‏כל שינוי במשפחת החלונות חייב לקבל `feature_set_version` חדש ולהיבדק מחוץ למדגם.

### ‏`P1 — Preferred Default`: לשמור כל Horizon כ־Feature נפרד

‏אין לאחד מיד את החלונות ל־Score.

```text
last_return_1s
last_return_5s
last_return_10s
last_return_30s
last_return_60s
```

‏כך המחקר יכול לגלות איזה Horizon מוסיף מידע ואיזה רק משכפל Horizon אחר.

### ‏`P1 — Preferred Default`: `Last` הוא Signal baseline, לא Execution baseline

‏למחקר ראשון אפשר להתחיל ב־`Last` כי הוא פשוט, ברור וקל לשחזור.

‏אבל Candidate שעובר Momentum research עדיין חייב לעבור:

```text
fresh executable quote
→ spread / size / freshness
→ execution feasibility
→ costs
→ TRADE / NO TRADE
```

‏אין להסיק מ־`last_return_*` שניתן לבצע את אותה תשואה בפועל.

### ‏`P2 — Challenger`: Quote-based Momentum

‏לאחר Baseline של `Last`, אפשר לבדוק בנפרד:

```text
mid_return_*
bid_return_*
ask_return_*
```

‏הם לא מחליפים אוטומטית את `Last`.

‏Promotion רק אם הם מוסיפים Out-of-Sample predictive value או execution relevance לאחר עלויות ומורכבות.

### ‏`P0 — Required for Valid Research`: Anchor לעולם אינו מגיע מהעתיד

‏עבור Horizon של `H`:

```text
target_anchor_time = as_of_time - H
anchor = latest observation with event_time <= target_anchor_time
```

‏לא משתמשים ב־observation שהתרחש אחרי העוגן המבוקש רק משום שהוא קרוב יותר בזמן.

### ‏`P0 — Required for Valid Research`: Anchor Gap הוא חלק מה־Feature Quality

‏לכל Horizon צריך לשמור:

```text
anchor_target_time
anchor_actual_time
anchor_gap_ms
```

‏אם `anchor_gap_ms` גדול מהסף שמותר ל־dataset/cadence הזה:

```text
feature = missing / invalid
```

‏לא ממלאים Feature ישן כאילו הוא `return_10s` מדויק.

### ‏`P0 — Required for Valid Research`: `Missing > fabricated`

‏אין interpolation סמוי ואין fallback שקט ל־anchor ישן מדי.

‏אם אין נתון אמין:

```text
return_10s = null
quality = MISSING_ANCHOR
```

‏עדיף Sample חסר על Feature שקרי.

### ‏`P1 — Preferred Default`: Logical Market `as_of_time`

‏כל Cross-Sectional comparison צריך לעבוד מול זמן לוגי משותף:

```text
ranking_as_of_time
```

‏כל Feature לכל Symbol חייב להשתמש רק במידע שהיה ידוע עד אותו `as_of_time`.

‏אסור להשוות Symbol שחושב על 10.000 ל־Symbol שחושב על 12.500 כאילו שניהם מייצגים אותו רגע.

### ‏`P1 — Preferred Default`: עבר ועתיד נשמרים כשתי שכבות שונות

```text
FEATURES
= only information available at T0

LABELS
= outcomes measured after T0
```

‏Baseline labels:

```text
forward_return_1s
forward_return_5s
forward_return_10s
forward_return_30s
forward_return_60s
```

‏בנוסף, לפי horizon מחקרי:

```text
MFE
MAE
```

### ‏`P1 — Preferred Default`: כמה Future Horizons, לא Label יחיד

‏האסטרטגיה מכוונת לשניות ועד בערך דקה, ולכן אין Label יחיד של "מה קרה אחרי 60 שניות".

‏נרצה עקומת המשך:

```text
T+1s
T+5s
T+10s
T+30s
T+60s
```

‏כך אפשר לזהות Signal שעובד 5–10 שניות אך דועך אחר כך, או Signal שאיטי יותר.

### ‏`P1 — Preferred Default`: Positive-on-all-horizons הוא ניסוי, לא אמת

‏הכלל:

```text
return_1s  > 0
return_5s  > 0
return_10s > 0
return_30s > 0
return_60s > 0
```

‏הוא Challenger מחקרי שימושי בגלל הפשטות שלו.

‏אבל אין להפוך אותו ל־Hard Trade Gate לפני שנמדד:

```text
coverage loss
false exclusions
forward return
MFE / MAE
net execution outcome
```

### ‏`P2 — Challenger`: Path Consistency / Monotonicity

‏לאחר Baseline נבדוק אם תנועה "נקייה" יותר מנבאת המשך טוב יותר.

‏אפשרויות עתידיות:

```text
fraction_of_up_moves
net_move / total_movement
monotonicity score
reversal count
path efficiency
```

‏אין לקבע נוסחה לפני ניסוי.

### ‏`P1 — Preferred Default`: Relative Rank הוא Context, לא Trade Permission

‏אפשר לחשב:

```text
market_rank_h
market_percentile_h
```

‏כדי לדעת מי חזקה ביחס לשוק עכשיו.

‏אבל:

```text
rank = 1
```

‏לעולם אינו מספיק לבדו ל־Trade.

‏תמיד נדרש גם absolute quality / executability gate.

---

## ‏3. Why

### ‏Fact

‏שינוי בדולרים אינו בר־השוואה היטב בין מניה של `$5` למניה של `$500`; Return יחסי נותן בסיס השוואה עקבי יותר.

### ‏Fact

‏Return על Horizon יחיד אינו מתאר את מסלול המחיר בתוך החלון. שני Symbols יכולים להסתיים באותה תשואה עם Path שונה לחלוטין.

### ‏Fact

‏Horizons חופפים אינם ראיות בלתי תלויות. `return_10s` כלול חלקית בתוך `return_30s`, ולכן חיבור נאיבי שלהם ל־Score יכול לספור אותו מידע יותר מפעם אחת.

### ‏Fact

‏Observation שהתרחש אחרי target anchor מכיל מידע שלא היה קיים בנקודת הזמן המבוקשת; שימוש בו במחקר יוצר `look-ahead`.

### ‏Fact

‏`MFE` ו־`MAE` מתארים מסלול מחיר לאחר Signal, לא PnL שבוצע בפועל.

### ‏Judgment

‏הדרך הנקייה ביותר להתחיל היא לשמור כמה Returns פשוטים ונפרדים, ולא להחליט מוקדם מדי על משקלים או Score.

### ‏Judgment

‏משפחת Horizons קטנה עדיפה על grid ענק בשלב הראשון, משום שהגדלת מרחב החיפוש מגדילה סיכון ל־overfitting ול־research degrees of freedom.

### ‏Hypothesis

‏Momentum רב־חלוני חיובי ועקבי עשוי להיות קשור ל־Forward Return חיובי מספיק בטווח של שניות.

‏זו אינה Fact והיא אינה הבטחת רווח.

### ‏Hypothesis

‏Quote-based momentum או Path Consistency עשויים להוסיף predictive value מעל `Last`-only returns.

‏גם זה חייב להיבדק בנפרד.

---

## ‏4. Baseline Feature Contract

‏לכל Symbol ב־`as_of_time` נשמור לפחות:

```text
instrument_id
symbol
as_of_time
price_source = LAST
feature_set_version

current_last_price
current_last_event_time
current_last_receive_time

anchor_1s_price
anchor_1s_time
anchor_1s_gap_ms
last_return_1s

anchor_5s_price
anchor_5s_time
anchor_5s_gap_ms
last_return_5s

anchor_10s_price
anchor_10s_time
anchor_10s_gap_ms
last_return_10s

anchor_30s_price
anchor_30s_time
anchor_30s_gap_ms
last_return_30s

anchor_60s_price
anchor_60s_time
anchor_60s_gap_ms
last_return_60s

quality_flags
```

‏כל Return צריך להיות ניתן לשחזור מהמחירים והזמנים ששמורים לצדו.

---

## ‏5. Anchor Policy

### ‏Baseline

```text
target = as_of_time - horizon
anchor = latest valid observation where observation_time <= target
```

### ‏לא להשתמש ב־nearest-both-sides

‏בחירה לפי "הכי קרוב" יכולה לבחור observation מהעתיד.

### ‏Allowed Gap

‏ה־allowed gap לא יהיה מספר גלובלי שרירותי אחד לכל feeds/horizons.

‏הוא צריך להיות מוגדר לפי:

```text
provider update model
dataset cadence
horizon
research purpose
```

### ‏Missing Anchor

```text
no acceptable anchor
=> missing feature
=> explicit reason
```

---

## ‏6. Horizon Policy

### ‏Baseline family

| Horizon | תפקיד ראשוני | סיכון עיקרי |
|---|---|---|
| `1s` | תגובה מאוד חדשה | Noise / one-print sensitivity |
| `5s` | מומנטום מהיר | עדיין רועש |
| `10s` | continuation קצר | יכול לאחר בתנועה מהירה מאוד |
| `30s` | context קצר | יכול להסתיר reversal חדש |
| `60s` | context עד בערך דקה | מגיב לאט יותר |

### ‏מה לא לעשות

‏לא להוסיף אוטומטית:

```text
2s, 3s, 4s, 6s, 7s, 8s, ...
```

‏רק משום שאפשר.

### ‏מתי להוסיף Horizon

‏רק כאשר יש Hypothesis ברורה, למשל:

> ‏"האם 2s מזהה continuation מוקדם יותר מ־5s בלי להגדיל מספיק את ה־noise כדי למחוק את היתרון?"

---

## ‏7. Price Source Matrix

| Price source | שימוש מומלץ | Status |
|---|---|---|
| `Last` | Signal baseline ראשון | `P1 Preferred Default` |
| `Mid` | Quote-centered challenger | `P2 Challenger` |
| `Bid` | Sell-side/executable-context research | `P2 Challenger` |
| `Ask` | Buy-side/executable-context research | `P2 Challenger` |
| Synthetic composite | רק אם יש סיבה מחקרית ברורה | `P3 Advanced` |

‏אין לערבב Source בלי שם Feature מפורש.

```text
last_return_10s
```

‏אינו אותו Feature כמו:

```text
mid_return_10s
```

---

## ‏8. Direction vs Magnitude

‏לכל Horizon נשמור את הערך המספרי המלא.

‏Derived Boolean יכול להיות:

```text
is_positive_10s
```

‏אבל הוא לעולם לא מחליף:

```text
last_return_10s = +0.237%
```

‏כך לא מאבדים מידע על עוצמה.

---

## ‏9. Flat / Neutral Zone

‏לא נגדיר בשלב זה `flat_threshold` קבוע לכל Symbol.

‏הסיבה:

```text
price level
tick size
spread
volatility
feed granularity
```

‏משפיעים על המשמעות של שינוי זעיר.

‏`flat zone` הוא Challenger שצריך Calibration ולא מספר שנבחר לפי תחושה.

---

## ‏10. Multi-Horizon Signature

‏לכל Symbol נקבל וקטור:

```text
[1s, 5s, 10s, 30s, 60s]
```

‏לדוגמה:

```text
AAA = [+0.03, +0.11, +0.22, +0.48, +0.72]
BBB = [+0.18, +0.16, +0.14, +0.05, -0.20]
CCC = [+0.01, +0.03, +0.06, +0.10, +0.18]
```

‏במקטע 08 לא נחליט ש־`AAA` או `BBB` היא "הטובה".

‏אנחנו רק מייצגים את המצבים בצורה שמאפשרת מחקר הוגן בהמשך.

---

## ‏11. Path Features — Challenger Pack

‏לאחר שה־Returns הבסיסיים תקינים, אפשר לבדוק:

```text
path_efficiency
up_move_fraction
reversal_count
net_move_to_total_move
monotonicity
short_retrace_depth
```

### ‏Promotion Criteria

‏Feature Path יקודם אם הוא:

- ‏מוסיף separation ב־Forward outcomes מעל Returns בלבד.
- ‏שורד Out-of-Sample.
- ‏אינו רק proxy לאותו Return שכבר קיים.
- ‏אינו דורש data fidelity שאין לנו ב־live.
- ‏משפר eventual executable net outcome או rejection quality.

### ‏Rejection Criteria

- ‏אין incremental value.
- ‏תלוי ב־specific sample/regime בלבד.
- ‏רגיש מאוד ל־sampling artifacts.
- ‏יקר משמעותית לחישוב בלי ערך מספיק.

---

## ‏12. Positive-All-Horizons Experiment

‏נשמור אותו כניסוי פשוט וחשוב:

```text
all_positive =
    r1  > 0
AND r5  > 0
AND r10 > 0
AND r30 > 0
AND r60 > 0
```

‏נבדוק לפחות:

```text
how many observations pass?
what forward returns follow?
what MFE / MAE follow?
what opportunities are excluded?
how does it behave by regime?
how does it behave after execution costs?
```

‏אין Promotion ל־Hard Filter בלי Evidence.

---

## ‏13. Forward Label Contract

‏ב־Research dataset, עבור Signal/Observation בזמן `T0`:

```text
features_as_of = T0
```

‏ואז Labels נבנים רק לאחר מכן:

```text
forward_last_return_1s
forward_last_return_5s
forward_last_return_10s
forward_last_return_30s
forward_last_return_60s

mfe_5s
mae_5s
mfe_10s
mae_10s
mfe_30s
mae_30s
mfe_60s
mae_60s
```

‏לפי הצורך נוסיף בהמשך execution-aware labels.

---

## ‏14. Labels are not Features

‏זה `P0` למחקר תקין.

‏Pipeline חייב למנוע מצב שבו:

```text
forward_10s
```

‏או derivative שלו נכנס בטעות ל־feature vector בזמן `T0`.

‏Validation אוטומטי צריך להיות מסוגל לזהות columns/fields שמסומנים `future_only`.

---

## ‏15. MFE / MAE Policy

### ‏Use When

‏להבנת:

- ‏פוטנציאל המשך.
- ‏כמה מהר מופיע upside.
- ‏כמה adverse movement קורה לפני continuation.
- ‏future exit/stop research.

### ‏Do Not Treat As

```text
actual realized profit
```

‏כי הם אינם כוללים בהכרח:

```text
spread
fillable side
latency
queue
slippage
fees
```

---

## ‏16. Relative Rank Policy

‏לכל Horizon אפשר לחשב:

```text
rank_10s
percentile_10s
```

‏ואפשר בהמשך לחשב cross-horizon relative strength.

‏אבל Rank הוא Context בלבד בשלב הזה.

### ‏חובה לשלב בהמשך

```text
relative strength
+
absolute minimum quality
+
execution feasibility
```

‏אחרת גם ביום שבו כל השוק חלש יהיה Rank #1.

---

## ‏17. Absolute vs Relative Momentum

‏נרצה לשמור את שניהם במחקר:

```text
absolute return
relative rank / percentile
```

‏הם עונים על שאלות שונות:

```text
How much did it move?
How unusual is that move versus the market now?
```

‏אין לקבע כרגע איזה מהם חשוב יותר.

---

## ‏18. Precompute / Incremental Computation

‏Baseline implementation:

```text
new observation
→ update current price/state
→ update eligible anchors / rolling buffers
→ recompute only affected symbol features
→ publish latest feature vector
```

‏Global ranking לא צריך לקרוא מחדש את כל ההיסטוריה של כל Symbol.

‏זה ממשיך את ההמלצה ממקטע 06.

---

## ‏19. Data Lineage

‏לכל Feature חייבת להיות יכולת Audit:

```text
feature name
feature version
price source
current price
current time
anchor price
anchor actual time
anchor target time
anchor gap
quality flags
```

‏אם לא ניתן לשחזר `last_return_10s`, לא ניתן לסמוך עליו במחקר רציני.

---

## ‏20. Feature Versioning

‏שינוי באחד מאלה מחייב Version חדש:

```text
horizon set
anchor selection rule
allowed anchor gap
price source
session treatment
missing-data policy
corporate-action treatment
```

‏אין להשוות Results משתי גרסאות כאילו Feature semantics זהים.

---

## ‏21. Required Data / Evidence

‏לפני Promotion של Momentum Rule נרצה Dataset שמכיל לפחות:

```text
instrument identity
universe version
as_of_time
session
market-data provenance
price source
all baseline horizons
anchor quality
freshness
forward labels
MFE / MAE
later: activity / spread / liquidity / execution context
```

‏המחקר צריך לכלול גם Observations שלא נראו "יפים", כדי לא ליצור selection bias.

---

## ‏22. Promotion Criteria

‏Momentum rule או Feature family יקודמו כאשר:

1. ‏הם מראים separation עקבי ב־Forward outcomes.
2. ‏האפקט קיים ב־Out-of-Sample / forward-like evaluation.
3. ‏האפקט לא נעלם כאשר מחמירים Anchor/Freshness quality.
4. ‏האפקט קיים במספר regimes ולא רק ביום/תקופה יחידים.
5. ‏הוא מוסיף ערך מעבר ל־baseline פשוט יותר.
6. ‏הוא נשאר רלוונטי לאחר execution-feasibility ו־cost modeling בפרקים המאוחרים יותר.
7. ‏ה־live implementation מסוגל לחשב אותו באותה semantics ובזמן.

---

## ‏23. Rejection Criteria

‏נדחה או נוריד עדיפות ל־Rule אם:

- ‏הוא נראה טוב רק In-Sample.
- ‏הוא תלוי בכמה Outliers.
- ‏שינוי קטן ב־window/threshold מוחק את האפקט.
- ‏הוא דורש Anchors שאינם זמינים מספיק בזמן אמת.
- ‏הוא מגדיל False Positives בלי לשפר Forward outcome.
- ‏הוא בוחר Symbols עם execution economics גרועים.
- ‏הוא משפר Gross movement אך לא eventual Net outcome.

---

## ‏24. Metrics

### ‏Predictive

```text
mean/median forward return by feature bucket
forward-return distribution
positive-forward-return rate
Top-N / percentile separation
MFE distribution
MAE distribution
signal half-life
```

### ‏Data Quality

```text
missing-feature rate
anchor-gap distribution
stale-feature rate
cross-symbol as-of skew
```

### ‏Research Robustness

```text
sample count
regime coverage
out-of-sample stability
parameter sensitivity
```

### ‏לא מספיק בפני עצמו

```text
hit rate
gross past return
rank 1 frequency
pretty chart
```

---

## ‏25. Failure Modes

### ‏Anchor from future

‏המחקר מקבל מידע שלא היה זמין בזמן אמת.

### ‏Old anchor masquerading as exact horizon

‏`10s` Feature בפועל מייצג 14 שניות.

### ‏One-print momentum

‏Trade בודד יוצר Return גדול בלי activity תומכת.

### ‏Stale last

‏Last נראה חזק אך quote/current market כבר עברו למקום אחר.

### ‏Overlapping-horizon double counting

‏Score נותן משקל רב מדי לאותו מהלך מחיר.

### ‏Window mining

‏ניסינו עשרות/מאות חלונות ובחרנו את המנצח ההיסטורי.

### ‏Cross-sectional time skew

‏Symbols מושווים בזמנים שונים.

### ‏Price-source ambiguity

‏Feature בשם `change_10s` מחושב פעם על Last ופעם על Mid.

### ‏Label leakage

‏מידע עתידי נכנס Feature pipeline.

### ‏Gross-edge illusion

‏Forward price movement חיובי אך spread/slippage/fees מוחקים אותו.

---

## ‏26. What I Would Avoid Initially

- ‏Score משוקלל של Horizons לפני שמבינים כל Feature בנפרד.
- ‏מאות Horizons.
- ‏Thresholds מדויקים מדי כמו `0.173%` ללא בסיס.
- ‏`BUY` ישירות מ־`return_10s > X`.
- ‏Path feature מורכב לפני Returns תקינים.
- ‏Mix של `Last/Mid/Bid/Ask` באותו Feature name.
- ‏Interpolation סמוי.
- ‏Rank-only strategy.
- ‏הנחה שכל שינוי חיובי הוא Momentum שימושי.

---

## ‏27. What to Add Later

‏לאחר Baseline תקין:

```text
quote-based momentum
path consistency
monotonicity
net-move / total-move
relative rank / percentile
regime-conditioned momentum
activity-conditioned momentum
liquidity-conditioned momentum
execution-aware labels
```

‏שלב 09 יטפל ב־velocity/acceleration/shape, ושלבים 10–11 בפעילות ונזילות.

---

## ‏28. User-Specific Application

‏למטרה שלנו — רווח קטן ומהיר בשניות ולא HFT במיקרו־שניות — אני ממליץ לחשוב על Momentum כך:

```text
Did price move recently?
↓
Was the move present across more than one short horizon?
↓
Is the current move still alive at as_of_time?
↓
Does this pattern historically predict enough continuation?
↓
Is the continuation long enough for our measured latency?
↓
Can we enter and exit after spread/slippage/fees?
```

‏כלומר:

> ‏המטרה אינה למצוא את המניה שעלתה הכי הרבה בעבר; המטרה היא למצוא Pattern שבו עדיין נשאר מספיק Future Edge עבור המערכת שלנו.

‏מכאן גם נובע שאין דרישה להיות מושקעים תמיד.

```text
best momentum available
```

‏יכול עדיין להוביל ל־:

```text
NO TRADE
```

---

## ‏29. Confidence

| Recommendation | Confidence |
|---|---|
| Simple multi-horizon returns כ־baseline | High |
| Strict no-look-ahead anchor policy | High |
| Feature/Label separation | High |
| Logical `as_of_time` | High |
| `Last` כ־signal research baseline | Medium-High |
| Positive-all-horizons improves edge | Low / Unproven |
| Path consistency adds value | Low / Unproven |
| Quote-based momentum beats Last | Low / Unproven |
| Exact best horizons | Low / Unknown |

---

## ‏30. Time-Sensitive Facts

‏מקטע זה כמעט כולו מתודולוגי ואינו תלוי ישירות ב־Broker/Venue capability שמשתנה בזמן.

‏אם בהמשך `Last`, ‏Bid/Ask או timestamp semantics נלקחים מ־Provider מסוים, ה־provider semantics עצמם נשארים תלויי־זמן ונבדקים לפי מקטע 05.

---

## ‏31. Decision Matrix

| Choice | Recommendation | Priority | Rationale |
|---|---|---:|---|
| Simple Return | Baseline | `P1` | פשוט, בר־שחזור, מספיק למחקר ראשון |
| Log Return | Alternative | `P3` | שימושי מתמטית אך לא נדרש כרגע |
| `1/5/10/30/60s` | Initial horizon family | `P1` | כיסוי קצר עם complexity מוגבלת |
| Many arbitrary horizons | Avoid initially | — | overfitting/search-space risk |
| Last-based Momentum | Baseline signal | `P1` | נקודת פתיחה פשוטה |
| Mid/Bid/Ask Momentum | Challenger | `P2` | עשוי להוסיף execution relevance |
| Positive all horizons | Experiment | `P2` | פשוט אך לא מוכח |
| Path consistency | Challenger | `P2` | עשוי להבחין בין trend לרעש |
| Relative percentile | Context feature | `P2` | adapts to market-wide regime |
| Rank #1 implies trade | Reject | `P0` | תמיד יש Rank #1 גם ללא edge |
| Future labels | Research only | `P0` separation | אסור להיכנס ל־Feature set |

---

## ‏32. Research Experiment Baseline

‏ניסוי ראשון מומלץ:

```text
For every eligible universe snapshot at T0:
    compute last_return_1s
    compute last_return_5s
    compute last_return_10s
    compute last_return_30s
    compute last_return_60s

    store anchor quality
    store freshness
    store as_of_time

    later compute:
        forward_return_1s
        forward_return_5s
        forward_return_10s
        forward_return_30s
        forward_return_60s
        MFE / MAE
```

‏לאחר מכן להשוות קבוצות כגון:

```text
all positive vs not all positive
strong short / weak long
strong all horizons
new spike
weak but consistent
```

‏בלי לבחור Trade policy עדיין.

---

## ‏33. Minimum Acceptance Tests for the Feature Engine

### ‏Anchor correctness

‏Observation אחרי target time לעולם אינו נבחר כ־anchor.

### ‏Missing behavior

‏אין anchor תקין ⇒ Feature חסר, לא `0` ולא value משוער.

### ‏Return arithmetic

‏`current / anchor - 1` מחושב באופן דטרמיניסטי.

### ‏As-of isolation

‏שום observation עם timestamp מאוחר מ־`as_of_time` אינו משפיע על vector.

### ‏Version determinism

‏אותם inputs + אותה feature version ⇒ אותם outputs.

### ‏Replay parity

‏Live-like replay על אותם events צריך לשחזר את אותם Feature values, בכפוף ל־documented ordering semantics.

---

## ‏34. What Would Change This Recommendation

‏נשנה את Baseline אם Evidence יראה למשל:

- ‏סט Horizons אחר נותן שיפור Out-of-Sample עקבי ומשמעותי.
- ‏Quote-based returns מנבאים או משקפים executable opportunity טוב משמעותית מ־Last.
- ‏Path features מוסיפים ערך עקבי מעל Returns פשוטים.
- ‏חלק מה־Horizons רדונדנטיים לחלוטין.
- ‏Signal Half-Life דורש Granularity מהירה יותר.
- ‏Live data quality אינה מאפשרת Horizon מסוים באופן אמין.

‏השינוי חייב להיות מבוסס Evidence, לא העדפה.

---

## ‏35. Decision Summary

### ‏`P0`

- ‏אין `look-ahead` בבחירת Anchors.
- ‏אין Feature מזויף כאשר Anchor חסר/ישן מדי.
- ‏Features ו־Future Labels מופרדים פיזית ולוגית.
- ‏כל Cross-Sectional comparison משתמש ב־`as_of_time` עקבי.
- ‏Rank אינו Trade permission.

### ‏`P1`

- ‏Simple Return.
- ‏Initial family: `1s / 5s / 10s / 30s / 60s`.
- ‏Features נשמרים נפרדים.
- ‏`Last` הוא baseline research price source.
- ‏Forward labels במספר Horizons.
- ‏Precompute incremental per Symbol.

### ‏`P2+`

- ‏Positive-all-horizons filter.
- ‏Mid/Bid/Ask momentum.
- ‏Path consistency / monotonicity.
- ‏Relative percentile/rank.
- ‏כל Feature מורכב יותר חייב להוכיח incremental value.

---

## ‏Checkpoint

‏מקטע 08 מגדיר את שפת המדידה של Momentum: Returns רב־חלוניים פשוטים ונפרדים, Anchors ללא מידע מהעתיד, `as_of_time` משותף, Data Lineage מלא ו־Forward Labels מופרדים. הוא אינו קובע עדיין Score או BUY rule; אלה יגיעו רק לאחר מדידת Shape, Activity, Liquidity, Filters ו־Ranking בהמשך ה־Playbook.
