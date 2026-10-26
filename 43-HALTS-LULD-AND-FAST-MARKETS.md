# ‏שלב 43 — `Halts`, ‏`LULD` ו־`Fast Markets`: כשהשוק מפסיק להתנהג כמו שוק רגיל

> ‏מטרת הפרק: להבין איך מערכת Algo צריכה לזהות ולנהל `Trading Halt`, ‏`LULD Limit State`, ‏`Trading Pause`, ‏`Straddle State`, ‏reopening auction ו־fast-market conditions — בלי לפרש בטעות שקט בנתונים כ־liquidity רגילה ובלי להמשיך לשלוח Orders כאשר מצב המסחר אינו ברור.
>
> ‏העיקרון המרכזי: **`No Update` אינו בהכרח `No Movement`, ו־`No Trade` אינו בהכרח `No Opportunity`. לפעמים השוק נמצא במצב שבו המסחר מוגבל, מושהה או עומד להיפתח מחדש.**
>
> ‏הפרק הוא חינוכי וטכני. הוא אינו המלצה לבצע מסחר אמיתי ואינו מבטיח רווח.
>
> ‏הערת עדכניות: כללי `LULD`, ‏halt reasons, ‏reopening procedures ו־exchange-specific behavior עשויים להשתנות. הפרטים המספריים והדוגמאות בפרק נבדקו מול `LULD Plan`, ‏Nasdaq ו־NYSE באוקטובר 2026; ב־Production יש לטעון אותם כ־versioned market rules ולא כקבועים קשיחים ב־Strategy.

---

# ‏1. למה הפרק הזה קריטי לרובוט קצר־טווח

‏רובוט שמחזיק פוזיציה שניות עד דקה חי בעולם שבו כמה שניות של אי־ודאות הן אירוע מהותי.

‏ב־Strategy של שעות, halt של כמה דקות הוא אירוע חריג.

‏ב־Strategy של שניות, halt הוא שינוי מוחלט של המציאות.

‏ה־assumptions הבאים מפסיקים להיות תקפים:

- ‏המחיר האחרון הוא executable.
- ‏ה־Bid/Ask הנוכחיים עדיין tradable.
- ‏Order שנשלח יקבל lifecycle רגיל.
- ‏Cancel יתבצע בזמן הרגיל.
- ‏Spread מייצג סיכון רגיל.
- ‏Signal decay מתנהג כרגיל.
- ‏Forward Return של `10s` הוא label רגיל.
- ‏הזמן ממשיך להיות זמן מסחר רציף.

---

# ‏2. `Trading Status` הוא Domain State

‏אסור להסיק מצב מסחר רק מ־quote freshness.

‏צריך ישות מפורשת:

```text
TradingStatus
```

‏לדוגמה:

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
REOPENING
OPEN_FAST
CLOSED
```

‏לא כל provider ישתמש באותם labels.

‏לכן ה־adapter ממפה status חיצוני למודל canonical פנימי.

---

# ‏3. `UNKNOWN` עדיף על ניחוש

‏אם לא התקבל status אמין:

```text
UNKNOWN
```

‏אינו bug.

‏הוא מידע אמיתי על רמת הוודאות.

‏במערכת שלנו:

```text
UNKNOWN trading status
=> block new risk
```

‏במיוחד כאשר:

- ‏ה־symbol היה פעיל לפני רגע.
- ‏ה־quotes נעצרו פתאום.
- ‏יש Order עובד.
- ‏יש Position פתוחה.
- ‏ה־market-data provider וה־broker חלוקים ביניהם.

---

# ‏4. מהו `Trading Halt`

‏`Trading Halt` הוא עצירה זמנית של המסחר בנייר.

‏יכולות להיות סיבות שונות:

- ‏חדשות ממתינות.
- ‏הפצת מידע מהותי.
- ‏בעיה רגולטורית.
- ‏בעיה תפעולית.
- ‏אירוע volatility.
- ‏אירוע listing/compliance.
- ‏אירוע corporate action.
- ‏הוראת exchange אחרת.

‏המשמעות לרובוט אינה זהה בכל הסיבות.

‏לכן לא מספיק:

```text
halted = true
```

‏צריך לפחות:

```text
status
reason_code
source
observed_at
expected_resume_if_known
```

---

# ‏5. `LULD` — הרעיון

‏`Limit Up-Limit Down` נועד למנוע ביצוע עסקאות במניות `NMS` מחוץ ל־price bands מוגדרים בזמן תנודתיות חריגה.

‏ה־bands מחושבים סביב `Reference Price`.

‏ה־Reference Price מבוסס על עסקאות eligible בחלון זמן קודם.

‏הרעיון המרכזי:

```text
Reference Price
    ↓
Upper Price Band
Lower Price Band
    ↓
Executable price region
```

---

# ‏6. ה־Reference Price אינו פשוט `Last`

‏טעות נפוצה:

```text
LULD reference = last trade
```

‏זה לא המודל.

‏התכנית משתמשת בממוצע arithmetic של eligible reported transactions לאורך חמש הדקות הקודמות.

‏ה־reference אינו חייב להתעדכן בכל trade.

‏נכון לעדכון שנבדק באוקטובר 2026, reference חדש נכנס לתוקף לאחר מנגנון update שבו שינוי של לפחות `1%` נדרש ביחס ל־reference הקיים, בכפוף לכללי התכנית.

‏מכאן:

```text
Last != LULD Reference Price
```

---

# ‏7. Tier 1 מול Tier 2

‏`LULD` מחלק ניירות לקבוצות עם percentage parameters שונים.

‏בפשטות:

- ‏`Tier 1` כולל בין היתר מניות במדדי `S&P 500`, ‏`Russell 1000` ו־ETPs מסוימים.
- ‏`Tier 2` כולל NMS stocks אחרים בכפוף להגדרות התכנית.

‏ה־classification אינו משהו שה־Strategy צריכה לנחש.

‏הוא Market Rule Data.

---

# ‏8. דוגמה ל־Price Bands

‏לפי כללי התכנית שנבדקו באוקטובר 2026, דוגמה נפוצה היא:

```text
Tier 1, price > $3
band parameter = 5%
```

‏ול־Tier 2 מעל `$3`:

```text
band parameter = 10%
```

‏קיימים parameters שונים לניירות במחירים נמוכים יותר.

‏בנוסף, בחלק מהקטגוריות ה־bands מוכפלים ב־25 הדקות האחרונות של המסחר הרגיל.

‏הכלל ההנדסי:

> ‏אל תכתוב percentages בתוך ה־Strategy.

‏טען אותם מ־versioned `MarketRules`.

---

# ‏9. למה Hard Coding מסוכן

‏קוד כזה בעייתי:

```csharp
const decimal LuldBand = 0.05m;
```

‏כי הוא מניח:

- ‏Tier קבוע.
- ‏Price bucket קבוע.
- ‏שעה קבועה.
- ‏Rule version קבועה.

‏במקום זאת:

```text
MarketRuleService
    ↓
LuldRulesFor(symbol, timestamp)
```

---

# ‏10. `Limit State`

‏`Limit State` אינו עדיין בהכרח halt.

‏לפי ה־LULD Plan, מצב כזה יכול להיווצר כאשר national best quote מגיע ל־price band בתנאים המוגדרים בתכנית.

‏אם השוק יוצא מהמצב בזמן — המסחר יכול להמשיך.

‏אם הוא לא יוצא בזמן — יכולה להיווצר `Trading Pause`.

---

# ‏11. חלון ה־15 שניות

‏נכון למסמכים שנבדקו באוקטובר 2026, אם `Limit State` אינו נפתר בתוך `15 seconds`, ה־primary listing exchange מכריז בדרך כלל על Trading Pause.

‏זה חשוב מאוד לרובוט קצר־טווח.

‏`15s` הוא עולם שלם עבור Strategy שה־horizon שלה `10s`.

‏כלומר:

```text
LULD proximity
```

‏אינו רק risk של halt עתידי.

‏הוא regime בפני עצמו.

---

# ‏12. Trading Pause

‏לפי ה־LULD Plan שנבדק:

```text
Trading Pause ≈ 5 minutes
```

‏ויכולה להיות הארכה נוספת.

‏אין להפוך את המספר הזה ל־timer שמכריח resume.

‏ה־resume האמיתי חייב להגיע מ־authoritative trading status / exchange state.

---

# ‏13. לעולם לא לעשות `Resume by Timer`

‏אנטי־פאטרן:

```text
halt started 10:00:00
wait 5 minutes
resume trading at 10:05:00
```

‏זה מסוכן.

‏נכון:

```text
halt detected
    ↓
wait for authoritative reopening state
    ↓
rebuild market state
    ↓
validate freshness/liquidity
    ↓
resume eligibility
```

---

# ‏14. `Straddle State`

‏`Straddle State` הוא מצב שונה מ־Limit State.

‏הוא יכול להתרחש כאשר צד אחד של ה־NBBO נמצא מחוץ ל־band באופן שהופך אותו non-executable, בלי שמתקיימת בדיוק הגדרת Limit State.

‏בנסיבות מסוימות ה־primary listing exchange יכול להכריז Trading Pause גם בעקבות Straddle State והתנהגות חריגה.

‏לכן:

```text
STRADDLE_STATE != NORMAL
```

---

# ‏15. קרבה ל־Band היא Feature

‏לא חייבים לחכות ל־halt.

‏אפשר למדוד:

```text
distance_to_upper_band_bps
distance_to_lower_band_bps
```

‏או:

```text
normalized_band_distance
```

‏ככל שמתקרבים ל־band:

- ‏execution risk משתנה.
- ‏spread עשוי להשתנות.
- ‏depth עשוי להיעלם.
- ‏cancel risk גדל.
- ‏reopening risk גדל.

---

# ‏16. `LULD Proximity Gate`

‏אפשר להגדיר safety gate ניסויי:

```text
if distance_to_relevant_band < threshold:
    block_new_entries
```

‏אבל threshold כזה הוא parameter למחקר.

‏לא מניחים מראש ש־`1%`, ‏`0.5%` או מספר אחר הוא נכון.

---

# ‏17. למה Momentum ליד Band מסוכן למחקר

‏מניה שמתקרבת מהר מאוד ל־Upper Band תיראה לעיתים כמו candidate מושלם ל־short-term momentum.

‏אבל בדיוק שם:

- ‏התנודתיות קיצונית.
- ‏ה־spread יכול להתרחב.
- ‏fills משתנים.
- ‏Trading Pause אפשרית.
- ‏ה־signal יכול להיעלם בתוך מנגנון reopening.

‏זה classic example ל־:

```text
Prediction quality != Executability
```

---

# ‏18. Halt אינו Data Gap רגיל

‏אם אין trades במשך 20 שניות:

‏אפשרויות שונות:

```text
quiet market
illiquid symbol
feed outage
symbol halt
trading pause
session boundary
```

‏אסור לתת לכולן אותו treatment.

---

# ‏19. `Silence Classification`

‏נרצה מנגנון:

```text
SilenceClassifier
```

‏שמשלב:

- ‏Market Data freshness.
- ‏Official trading status.
- ‏Quote presence.
- ‏Trade presence.
- ‏Whole-market health.
- ‏Broker contract status.
- ‏Exchange halt feed.

‏והתוצאה:

```text
QUIET
ILLIQUID
HALTED
PAUSED
FEED_STALE
UNKNOWN
```

---

# ‏20. Official Halt Feed עדיף על inference

‏אם exchange/provider מספק trading-status feed אמין:

‏הוא עדיף על inference מ־price silence.

‏Inference הוא fallback.

‏לא source of truth ראשון.

---

# ‏21. `Halt Reason Code`

‏Nasdaq, למשל, מפרסמת reason codes שונים.

‏דוגמאות שנמצאות בתיעוד הנוכחי:

```text
LUDP  = Volatility Trading Pause
LUDS  = Volatility Trading Pause - Straddle Condition
MWC1  = Market-Wide Circuit Breaker Level 1
MWC2  = Market-Wide Circuit Breaker Level 2
MWC3  = Market-Wide Circuit Breaker Level 3
```

‏יש גם reason codes אחרים שאינם volatility.

‏לכן נשמור raw code בנוסף ל־canonical mapping.

---

# ‏22. Canonical Halt Event

```text
TradingStatusEvent
- instrument_id
- source
- raw_status
- raw_reason_code
- canonical_status
- event_time
- received_time
- expected_resume_time?
- resumption_quote_time?
- resumption_trade_time?
- rule_version
```

---

# ‏23. Raw Evidence חשוב

‏גם אם מיפינו:

```text
LUDP -> TRADING_PAUSE
```

‏נשמור גם:

```text
raw_reason_code = "LUDP"
```

‏כדי ש־RCA עתידי יוכל לבדוק mapping bugs או שינויי semantics.

---

# ‏24. `Halt State Machine`

‏State Machine אפשרי:

```text
OPEN
  ↓
LIMIT_STATE
  ↓
TRADING_PAUSE
  ↓
REOPENING_PENDING
  ↓
REOPENING_AUCTION
  ↓
POST_REOPEN_VALIDATION
  ↓
OPEN
```

‏אבל לא כל halt יעבור בכל state.

---

# ‏25. Halt מסוג News

‏News Halt יכול להתחיל בלי Limit State.

‏מסלול אפשרי:

```text
OPEN
 ↓
HALTED_NEWS
 ↓
QUOTATION_RESUMPTION
 ↓
TRADING_RESUMPTION
 ↓
POST_REOPEN_VALIDATION
 ↓
OPEN
```

---

# ‏26. Quote Resume מול Trade Resume

‏בחלק מתהליכי resumption יכול להיות זמן שבו quotation activity חוזרת לפני trading עצמו.

‏המערכת צריכה להבדיל:

```text
quotes resumed
```

‏מ־:

```text
trading resumed
```

‏אחרת היא עלולה לשלוח Order מוקדם מדי.

---

# ‏27. `REOPENING` הוא Regime משלו

‏לא צריך להתייחס לרגע reopening כאל continuation רגיל.

‏ה־book יכול להיבנות מחדש.

‏ה־spread יכול להיות חריג.

‏ה־imbalance יכול להיות גדול.

‏מחיר ה־first trade יכול להיות רחוק מה־pre-halt price.

---

# ‏28. Reopening Auction

‏בבורסות שונות reopening אחרי halt יכול לעבור דרך auction/cross process.

‏מבחינת המערכת:

```text
Continuous Trading Model
```

‏אינו תקף במהלך:

```text
Halt Auction / Reopening Auction
```

---

# ‏29. אל תשתמש ב־Pre-Halt Quote אחרי Reopen

‏ברגע reopening:

```text
old bid
old ask
old spread
old depth
```

‏אינם בסיס תקף להחלטה חדשה.

‏צריך invalidation מפורש.

---

# ‏30. `Market Snapshot Generation`

‏כל symbol יכול לקבל:

```text
market_generation
```

‏ב־halt/reopen:

```text
market_generation++
```

‏Orders/decisions שנולדו לפני generation החדש מסומנים stale.

---

# ‏31. Stale Intent Protection

‏אם Entry Intent נוצר לפני halt:

```text
intent.market_generation = 41
```

‏אבל אחרי reopen:

```text
current.market_generation = 42
```

‏ה־intent לא נשלח.

‏צריך Decision חדש.

---

# ‏32. Working Order בזמן Halt

‏Order שכבר נשלח לפני halt הוא מצב מסובך.

‏המערכת לא תניח:

```text
halt => order cancelled
```

‏וגם לא:

```text
halt => order still live exactly as before
```

‏צריך broker/exchange truth.

---

# ‏33. Reconciliation בזמן Halt

‏יש לבדוק:

- ‏Open Orders.
- ‏Order status.
- ‏Partial fills.
- ‏Position quantity.
- ‏Cancel state.
- ‏Exchange/Broker restrictions.

‏אם אי אפשר להוכיח state:

```text
UNKNOWN_ORDER_EFFECT
```

---

# ‏34. Entry בזמן Halt

‏ברירת המחדל שלנו:

```text
HALTED / TRADING_PAUSE
=> no new entry
```

‏לא משום שאין הזדמנות אפשרית.

‏אלא משום שה־execution contract שלנו אינו תקף.

---

# ‏35. Position פתוחה בזמן Halt

‏זו בעיה אחרת לגמרי.

‏אין אפשרות פשוט להניח שניתן לצאת עכשיו.

‏לכן:

```text
risk exists
but executability may be unavailable
```

‏זה אחד המצבים שבהם pre-trade risk management חשוב יותר מכל exit rule.

---

# ‏36. `Unexitable Risk`

‏Position בזמן halt יוצרת זמנית:

```text
unexitable_risk = true
```

‏זה צריך metric ו־alert נפרדים.

---

# ‏37. Time Stop בזמן Halt

‏נניח שה־Strategy מחזיקה עד `30s`.

‏אם halt התחיל אחרי `8s`, מה עושה Time Stop ב־`30s`?

‏הוא עדיין יכול לייצר:

```text
exit_intent
```

‏אבל הוא לא יכול להבטיח execution.

‏לכן מפרידים:

```text
strategy_exit_due
execution_possible
```

---

# ‏38. `Desired Position` מול `Executable Position`

‏בזמן halt:

```text
desired_position = 0
actual_position = 100
```

‏זו אינה סתירה לוגית.

‏זו חשיפה שנשארה כי השוק אינו מאפשר ביצוע רגיל.

---

# ‏39. Exit Intent Persisted

‏אם exit נדרש בזמן halt, נשמור אותו durable:

```text
EXIT_REQUIRED
```

‏כדי שלא יאבד ב־restart.

---

# ‏40. Reopening Exit Policy

‏אחרי reopen לא שולחים אוטומטית Market Order ללא constraints.

‏צריך policy שמגדירה:

- ‏urgency.
- ‏price protection.
- ‏liquidity validation.
- ‏position size.
- ‏spread state.
- ‏auction/continuous status.
- ‏maximum tolerated exposure duration.

---

# ‏41. `Fast Market`

‏`Fast Market` הוא מונח שימושי לתיאור תנאי שוק שבהם:

- ‏prices משתנים מהר.
- ‏quotes מתעדכנים בקצב חריג.
- ‏spread/depth אינם יציבים.
- ‏latency significance עולה.
- ‏order book state מתיישן מהר מאוד.

‏לא חייב להיות halt רשמי כדי שהשוק יהיה operationally fast.

---

# ‏42. Fast Market כ־Regime

‏נרצה state/feature כגון:

```text
NORMAL
FAST
EXTREME
```

‏לאו דווקא כ־exchange status רשמי.

‏זה derived execution regime.

---

# ‏43. איך מזהים Fast Market

‏Features אפשריים:

- ‏quote update rate.
- ‏trade rate.
- ‏spread volatility.
- ‏depth churn.
- ‏short-window realized volatility.
- ‏price velocity.
- ‏cancel/replace rate אם זמין.
- ‏cross-sectional breadth shock.
- ‏latency inflation.

---

# ‏44. `Fast Market` אינו “מניה עולה מהר”

‏מניה יכולה לעלות מהר אבל להיות:

- ‏liquid.
- ‏tight spread.
- ‏stable depth.
- ‏predictable execution.

‏ומניה אחרת יכולה כמעט לא לזוז אבל להיות:

- ‏thin.
- ‏gappy.
- ‏unstable.

‏לכן speed of price בלבד אינו Fast-Market model.

---

# ‏45. Execution Risk בזמן Fast Market

‏ב־Fast Market:

```text
Signal Price
```

‏יכול להיות מיושן כבר בזמן:

```text
Order Submit
```

‏ולכן צריך למדוד:

```text
signal_to_submit_ms
submit_to_ack_ms
ack_to_fill_ms
```

‏ביחס ל־market move באותו חלון.

---

# ‏46. `Latency-to-Volatility Ratio`

‏רעיון שימושי:

```text
expected_move_during_latency / expected_edge
```

‏אם היחס גבוה מדי, execution נהיה בלתי יציב גם אם ה־latency האבסולוטי לא השתנה.

---

# ‏47. Market Data Pressure

‏Fast Market יכול ליצור burst של events.

‏בעיה אפשרית:

```text
feed arrives
    ↓
queue grows
    ↓
feature engine lags
    ↓
scanner sees old state
```

‏לכן freshness נמדדת ב־event age, לא רק connection health.

---

# ‏48. `Processing Lag`

```text
processing_lag = processed_at - received_at
```

‏צריך למדוד אותו P50/P95/P99.

‏ב־Fast Market tail latency יכולה להיות חשובה יותר מהממוצע.

---

# ‏49. Backpressure Policy

‏כאשר pipeline אינו עומד בקצב:

‏אפשרויות:

- ‏drop obsolete snapshots.
- ‏coalesce updates.
- ‏prioritize active symbol.
- ‏pause new entries.
- ‏degrade feature set.
- ‏move to `DEGRADED`.

‏אסור פשוט לתת queue לגדול בלי גבול.

---

# ‏50. Whole-Market Scanner תחת Burst

‏ברובוט שלנו זה קריטי במיוחד.

‏אם ~4,000 symbols מייצרים burst במקביל, אין משמעות לכך שה־top candidate חושב על נתון חדש אם רוב ה־universe עוד processing ישן.

‏לכן:

```text
rank_snapshot_consistency
```

‏חייב להישמר.

---

# ‏51. `Fresh Coverage Ratio`

```text
fresh_symbols / expected_active_symbols
```

‏ב־fast market threshold ל־entry יכול להיות מחמיר יותר.

---

# ‏52. `Universe Skew`

‏אם symbols מהירים מתעדכנים יותר ולכן נכנסים ל־ranking בתדירות גבוהה יותר, scanner יכול לפתח bias מכני.

‏צריך לבדוק:

```text
update_frequency_bias
```

---

# ‏53. Halted Symbols חייבים לצאת מה־Ranking

‏לא מספיק לתת להם score ישן.

```text
tradability_gate = false
```

‏והם מקבלים rejection reason:

```text
HALTED
LULD_PAUSE
TRADING_STATUS_UNKNOWN
REOPENING_NOT_READY
```

---

# ‏54. Score Cache Invalidation

‏כש־symbol נכנס halt:

‏צריך invalidate:

- ‏current score.
- ‏rank eligibility.
- ‏entry intent.
- ‏execution readiness.

‏אבל לא למחוק evidence לצורכי RCA.

---

# ‏55. Reopen Warm-Up

‏אחרי resumption:

‏לא בהכרח מכניסים מיד את המניה ל־ranking.

‏אפשר לדרוש:

```text
N fresh quotes
M fresh trades
minimum elapsed time
spread normalization
feature warm-up
```

‏אלה parameters למחקר.

---

# ‏56. `Post-Halt Cooldown`

‏Cooldown יכול למנוע כניסה אוטומטית מיד אחרי reopen.

‏אבל אין לקבוע cooldown שרירותי.

‏בודקים אמפירית:

- ‏slippage.
- ‏spread.
- ‏markout.
- ‏re-halt probability.
- ‏signal quality.

---

# ‏57. Re-Halt Risk

‏מניה יכולה להיפתח מחדש ולהיכנס שוב ל־Limit State/Pause.

‏לכן:

```text
recent_halt_count
seconds_since_resume
```

‏יכולים להיות execution-context features.

---

# ‏58. Halt History כ־Feature

‏אפשר לחקור:

```text
halts_last_5m
halts_last_30m
seconds_since_last_halt
```

‏אבל רק אם המידע היה ידוע בזמן ההחלטה.

---

# ‏59. Avoid Leakage

‏אסור label כזה:

```text
this symbol halted later today
```

‏להיכנס כ־feature בזמן מוקדם יותר.

‏זה future leakage.

---

# ‏60. Forward Labels סביב Halt

‏label רגיל:

```text
return_10s
```

‏עלול להיות undefined או misleading אם חל halt בתוך החלון.

‏צריך metadata:

```text
label_interrupted_by_halt = true
```

---

# ‏61. Label Policy

‏אפשרויות מחקר:

- ‏exclude interrupted horizons.
- ‏separate them.
- ‏model halt as outcome.
- ‏measure last executable price before pause.

‏אסור לבחור policy לפי התוצאה שרוצים לקבל.

---

# ‏62. `Executable Forward Return`

‏Forward price תאורטי אינו מספיק.

‏אם לא היה מסחר executable:

```text
executable_forward_return
```

‏עשוי להיות missing.

‏זה עדיף מלהמציא fill.

---

# ‏63. Backtest עם Halts

‏Backtest צריך event מסוג:

```text
TRADING_STATUS_CHANGED
```

‏ולא רק trades/quotes.

---

# ‏64. Backtest Anti-Pattern

‏גרף מחירים היסטורי עשוי לדלג מ־price pre-halt ל־price post-halt.

‏אם simulator מאפשר exit באמצע gap כאילו היה continuous liquidity:

‏הוא מייצר תוצאה שאי אפשר היה לבצע.

---

# ‏65. `Non-Tradable Interval`

‏ב־Replay:

```text
[halt_start, resume_time)
```

‏מסומן כ־non-tradable לפי ה־rules והנתונים.

---

# ‏66. Order During Non-Tradable Interval

‏אם Strategy יוצרת command:

```text
PlaceOrder
```

‏בזמן interval כזה, simulator לא צריך להמציא Fill.

‏הוא יכול:

- ‏reject.
- ‏queue.
- ‏hold.
- ‏return unknown behavior.

‏לפי venue/broker model הרלוונטי.

---

# ‏67. Broker Behavior אינו Exchange Behavior

‏ה־exchange יכול להיות halted.

‏ה־broker עדיין יכול לקבל API request.

‏אבל זה לא אומר שה־Order executable עכשיו.

‏לכן:

```text
broker_accepted != market_executable
```

---

# ‏68. Pre-Trade Validation

‏ממש לפני submit:

```text
TradingStatus == OPEN
```

‏הוא רק תנאי אחד.

‏צריך גם:

```text
MarketDataFresh
BrokerReady
RiskApproved
SignalFresh
InstrumentTradable
```

---

# ‏69. `TradingStatusAge`

‏גם status יכול להיות stale.

```text
trading_status_age_ms
```

‏צריך להימדד.

---

# ‏70. Conflicting Status Sources

‏Provider A:

```text
OPEN
```

‏Broker:

```text
HALTED
```

‏Exchange feed:

```text
TRADING_PAUSE
```

‏המערכת לא מצביעה ברוב קולות.

‏היא נכנסת:

```text
STATUS_CONFLICT
```

‏ומונעת risk חדש.

---

# ‏71. Source Precedence

‏נגדיר policy מפורש:

```text
Authoritative Exchange/Regulatory Status
    > Broker Status
    > Market Data Provider Derived Status
    > Heuristic Inference
```

‏ה־precedence המדויק תלוי integrations.

---

# ‏72. Conflict Audit

‏שומרים:

```text
source A status
source B status
first conflict time
resolution time
chosen safety action
```

---

# ‏73. Market-Wide Circuit Breakers

‏בנוסף ל־single-stock LULD קיימים `Market-Wide Circuit Breakers`.

‏לפי כללי NYSE שנבדקו באוקטובר 2026, thresholds מבוססים על ירידה יומית ב־`S&P 500`:

```text
Level 1 = 7%
Level 2 = 13%
Level 3 = 20%
```

‏אלה אירועי שוק רחבים, לא symbol-specific בלבד.

---

# ‏74. Market-Wide State

‏צריך Domain State נפרד:

```text
MarketWideStatus
```

‏לדוגמה:

```text
NORMAL
MWCB_LEVEL_1
MWCB_LEVEL_2
MWCB_LEVEL_3
CLOSED
```

---

# ‏75. Symbol State + Market State

‏אפשר להיות:

```text
market = NORMAL
symbol = HALTED
```

‏או:

```text
market = MWCB_LEVEL_1
symbol = HALTED_BY_MARKET_WIDE_EVENT
```

‏אלה axes שונים.

---

# ‏76. Global Safety Action

‏Market-wide halt:

```text
block all new entries
```

‏ולא רק symbol אחד.

---

# ‏77. Open Positions בזמן MWCB

‏ה־Risk Engine צריך לדעת:

```text
positions_exist
execution_temporarily_unavailable
```

‏ולעקוב אחרי exposure בזמן ההשהיה.

---

# ‏78. `Risk Clock` בזמן Halt

‏גם אם אין executions, הסיכון לא “קפוא”.

‏אירועים חיצוניים ממשיכים.

‏לכן מודדים:

```text
seconds_unexitable
```

---

# ‏79. `Unprotected Exposure Duration`

‏Metric קריטי:

```text
unprotected_exposure_seconds
```

‏במיוחד אם protective exit לא יכול להתבצע.

---

# ‏80. Kill Switch בזמן Halt

‏`FLATTEN` אינו קסם.

‏אם השוק halted:

```text
FLATTEN_REQUESTED
```

‏יכול להפוך ל־:

```text
EXIT_REQUIRED_BUT_BLOCKED
```

‏המערכת צריכה לייצג זאת במפורש.

---

# ‏81. False Sense of Safety

‏כפתור:

```text
Flatten All
```

‏אינו הוכחה שהחשבון flat.

‏רק broker-confirmed position truth מוכיח זאת.

---

# ‏82. Fast-Market Entry Gate

‏אפשר policy:

```text
if execution_regime == EXTREME:
    block_new_entries
```

‏אבל זה צריך validation אמפירי.

---

# ‏83. Dynamic Position Sizing

‏במקום binary gate בלבד, Fast Market יכול להקטין max size.

‏אבל sizing כזה הוא Risk Policy, לא signal logic.

---

# ‏84. Spread Explosion

‏Metric:

```text
spread_bps / normal_spread_bps
```

‏יכול לזהות regime shift.

---

# ‏85. Depth Collapse

‏Metric:

```text
current_depth / baseline_depth
```

‏יכול להראות שה־book נראה “קיים” אבל אינו executable כמו קודם.

---

# ‏86. Quote Churn

‏נמדוד:

```text
quote_updates_per_second
```

‏אבל churn גבוה לבדו אינו signal טוב או רע.

‏הוא context.

---

# ‏87. `Book Half-Life`

‏רעיון מחקרי:

‏כמה מהר snapshot אופייני מפסיק לייצג את השוק?

‏ב־Fast Market half-life יכול להיות קצר מאוד.

---

# ‏88. Signal Half-Life מול Book Half-Life

‏אם:

```text
book_half_life << signal_to_fill_time
```

‏execution model נמצא בבעיה.

---

# ‏89. Order Price Protection

‏ב־Fast Market, `Marketable Limit` יכול להיות שימושי יותר מ־unbounded market behavior כי הוא מגדיר maximum acceptable price.

‏אבל limit צר מדי יכול לייצר no-fill.

‏זו שוב אופטימיזציית net outcome.

---

# ‏90. Repricing Risk

‏Cancel/replace תכוף בזמן fast market יכול:

- ‏לאבד queue priority.
- ‏לרדוף אחרי price.
- ‏להגדיל message rate.
- ‏להיכנס למרוץ מול fills.

---

# ‏91. `Chase Budget`

‏נגדיר:

```text
max_reprices
max_price_drift
max_elapsed_ms
```

‏כחלק מ־Execution Policy.

---

# ‏92. Band-Aware Price Protection

‏אם limit price מתקרב ל־LULD band:

‏נרצה לפחות awareness:

```text
price_distance_to_band
```

‏כדי לא לשלוח intent שאינו עקבי עם current market state.

---

# ‏93. `Band Crossing` אינו Execution Plan

‏אם price target נמצא מעבר ל־upper/lower band, אסור simulator או execution engine להניח שניתן פשוט לחצות לשם.

---

# ‏94. Reopening Price Gap

‏המחיר לאחר halt יכול לפתוח בפער משמעותי.

‏לכן:

```text
pre_halt_mark
```

‏אינו benchmark יחיד מספיק.

---

# ‏95. Reopening Slippage

‏נמדוד בנפרד:

```text
reopen_execution_slippage
```

‏מ־normal slippage.

---

# ‏96. Reopening Markout

‏נמדוד:

```text
markout_1s
markout_5s
markout_30s
```

‏לאחר fill post-reopen.

---

# ‏97. Halt Event Packet

‏לכל אירוע נשמור:

```text
halt_id
symbol
reason
pre_halt_market_state
pre_halt_position
working_orders
last_fresh_quote
last_trade
luld_bands
resume_timestamps
reopening_market_state
post_resume_actions
```

---

# ‏98. RCA אחרי Halt

‏שאלות:

- ‏האם נכנסנו קרוב מדי ל־band?
- ‏האם status הגיע בזמן?
- ‏האם הייתה Position פתוחה?
- ‏האם working order נשאר orphan?
- ‏האם cancel request קיבל outcome ברור?
- ‏כמה זמן לא ניתן היה לצאת?
- ‏מה היה gap ב־reopen?
- ‏האם ה־strategy חזרה מוקדם מדי?

---

# ‏99. `Halt Avoidance` מול `Halt Alpha`

‏אלה שתי hypotheses שונות.

‏במערכת שלנו baseline:

```text
halts = execution/risk condition
```

‏ולא alpha opportunity.

‏אם בעתיד נרצה לחקור post-halt behavior, זה Experiment נפרד.

---

# ‏100. אל תערבב מחקר Post-Halt עם Strategy הראשית

‏אחרת קל ליצור data-mining:

```text
sometimes halt reopens strongly
therefore chase reopen
```

‏זה לא Evidence.

---

# ‏101. `Reopen Strategy` דורשת Dataset משלה

‏אם חוקרים אותה:

- ‏halt reason.
- ‏halt duration.
- ‏imbalance.
- ‏reopen gap.
- ‏spread.
- ‏liquidity.
- ‏subsequent re-halts.
- ‏fees/slippage.

‏נבדקים בנפרד.

---

# ‏102. News Halt אינו Volatility Halt

‏הסיבה משנה.

‏אין לערבב:

```text
LULD pause
```

‏עם:

```text
news pending
```

‏באותה קבוצת מחקר בלי reason conditioning.

---

# ‏103. Operational Halt אינו Signal

‏בעיה טכנית של venue/provider אינה בהכרח market information.

‏צריך failure classification נכון.

---

# ‏104. `Reason Family`

‏אפשר normalization:

```text
VOLATILITY
NEWS
REGULATORY
CORPORATE_ACTION
OPERATIONAL
MARKET_WIDE
UNKNOWN
```

---

# ‏105. Halt Reason Confidence

‏אם mapping אינו ודאי:

```text
reason_confidence
```

‏או פשוט `UNKNOWN`.

---

# ‏106. Provider May Lag

‏Halt feed יכול להגיע אחרי ש־quotes כבר נראים חריגים.

‏לכן יש שני מסלולים:

```text
authoritative status
```

‏ו־:

```text
safety heuristic
```

---

# ‏107. Heuristic Halt Suspicion

‏אפשר trigger זמני:

```text
HALT_SUSPECTED
```

‏כאשר:

- ‏symbol היה פעיל מאוד.
- ‏updates נעצרו פתאום.
- ‏שאר השוק תקין.
- ‏provider connection תקין.

‏הפעולה:

```text
block new entry
request authoritative status
```

---

# ‏108. לא מכריזים Halt על סמך Silence בלבד

‏Heuristic הוא safety mechanism.

‏לא עובדה היסטורית.

‏צריך provenance:

```text
INFERRED
AUTHORITATIVE
```

---

# ‏109. `Status Provenance`

```text
status_source = EXCHANGE
status_source = SIP
status_source = BROKER
status_source = DATA_PROVIDER
status_source = INFERRED
```

---

# ‏110. Data Model צריך לשמור Revision

‏אם provider מתקן status בדיעבד:

‏לא מוחקים history.

‏שומרים:

```text
status_revision
```

---

# ‏111. Late Event

‏Halt event יכול להגיע באיחור.

‏צריך להכניס אותו ל־event timeline לפי:

```text
event_time
received_time
```

‏ולא לשכתב את העבר בלי trace.

---

# ‏112. Replay חייב לשחזר Arrival Timing

‏אם Live למד על halt באיחור של `400ms`, replay fidelity גבוה צריך להיות מסוגל לשחזר זאת.

‏אחרת אנחנו נותנים ל־backtest מידע טוב יותר ממה שהיה ב־Live.

---

# ‏113. Exchange Time מול Receive Time

‏כמו בכל הקורס:

```text
exchange/event time
received time
processed time
```

‏הם timestamps שונים.

---

# ‏114. `Detection Latency`

```text
halt_detection_latency = local_detection_time - authoritative_event_time
```

‏Metric חשוב.

---

# ‏115. `Containment Latency`

```text
containment_latency = entries_blocked_at - halt_detected_at
```

‏צריך להיות קצר וניתן למדידה.

---

# ‏116. `Recovery Latency`

```text
recovery_latency = safe_resume_at - authoritative_resume_at
```

‏אבל לא תמיד קטן יותר טוב.

‏מהיר מדי יכול להיות unsafe.

---

# ‏117. Safety First after Reopen

‏ב־reopen:

```text
Trading resumed
```

‏אינו שווה:

```text
Strategy ready
```

---

# ‏118. Post-Reopen Readiness Contract

‏לדוגמה:

```text
status == OPEN
fresh_quotes == true
spread <= allowed
feature_warmup == complete
broker_ready == true
no_unknown_orders == true
risk_state_known == true
```

---

# ‏119. `Reopen Gate Reason Codes`

```text
REOPEN_DATA_NOT_WARM
REOPEN_SPREAD_TOO_WIDE
REOPEN_ORDER_STATE_UNKNOWN
REOPEN_POSITION_UNRECONCILED
REOPEN_VOLATILITY_EXTREME
```

---

# ‏120. `NO TRADE` הוא תוצאה טובה

‏אחרי halt, `NO TRADE` יכול להיות התוצר הנכון ביותר של מערכת מקצועית.

---

# ‏121. Halt-aware Scanner Funnel

```text
Universe
  ↓
Trading Status Gate
  ↓
Freshness Gate
  ↓
Liquidity Gate
  ↓
Features
  ↓
Ranking
```

‏כלומר status לפני score.

---

# ‏122. Why Status Gate Early

‏אין טעם לבזבז compute עמוק על symbol שאינו tradable כרגע.

‏זה גם מפחית false Top1.

---

# ‏123. `Candidate Eligibility`

```text
candidate_eligible =
    trading_status == OPEN
    && data_fresh
    && instrument_tradable
    && !reopen_cooldown
```

‏הפרטים versioned.

---

# ‏124. Ranking Snapshot צריך Status Version

‏כל rank row יקבל:

```text
trading_status
trading_status_version
trading_status_age
```

---

# ‏125. Decision Snapshot

‏ב־decision record נשמור:

```text
luld_upper
luld_lower
band_distance
halt_state
seconds_since_resume
fast_market_regime
```

‏אם זמינים.

---

# ‏126. LULD Bands כחלק מ־Market Context

‏לא חובה להשתמש בהם ל־signal.

‏אבל חשוב לשמור אותם לצורך:

- ‏risk.
- ‏execution.
- ‏RCA.
- ‏replay.

---

# ‏127. Missing Band Data

‏אם LULD band אמור להיות זמין ואינו:

```text
band_state = UNKNOWN
```

‏ולא `0`.

---

# ‏128. `0` אינו Missing

‏כלל Data Engineering חשוב שחוזר שוב:

```text
0 != missing
```

---

# ‏129. Fast-Market Score Drift

‏אם ranking מתחלף עשרות פעמים בשנייה, צריך למדוד:

```text
rank_churn_rate
```

‏ולא לרדוף אוטומטית אחרי כל Rank #1 חדש.

---

# ‏130. Hysteresis

‏אפשר לדרוש candidate חדש להיות טוב משמעותית מהנוכחי לפני switch.

‏זה צריך Experiment.

---

# ‏131. Signal Persistence

‏ב־Fast Market:

```text
signal_persistence_ms
```

‏יכול להיות מדד חשוב יותר מ־score peak.

---

# ‏132. Winner's Curse ב־Extreme Moves

‏ה־symbol שמדורג ראשון אחרי burst קיצוני עלול להיות בדיוק זה שכבר consumed את רוב ה־move.

‏לכן צריך למדוד:

```text
post_selection_forward_net_return
```

---

# ‏133. Halt Proximity Bias

‏Scanner שמתגמל velocity חזק יכול לבחור disproportionately symbols ליד LULD.

‏צריך report:

```text
Top1 distance-to-band distribution
```

---

# ‏134. Candidate Density ליד Stress

‏ב־market-wide shock הרבה symbols יכולים לקבל score גבוה יחד.

‏זה משנה את meaning של Rank #1.

---

# ‏135. Cross-Sectional Context

‏נבדוק:

```text
percent_universe_fast
percent_universe_near_band
percent_universe_halted
```

‏כדי להבין אם מדובר ב־symbol event או market event.

---

# ‏136. Market Regime Integration

‏`Halt/LULD/Fast Market` feeds into Regime Engine.

‏אבל Safety Gate נשאר עצמאי.

‏גם אם model אוהב fast regime, safety עדיין יכול לחסום.

---

# ‏137. Separation of Concerns

```text
Regime Engine -> describes context
Strategy -> estimates edge
Risk Engine -> constrains exposure
Safety Engine -> blocks unsafe actions
Execution Engine -> executes allowed intent
```

---

# ‏138. No Strategy Override

‏Strategy לא יכולה לומר:

```text
signal is strong, ignore halt gate
```

‏Safety precedence גבוהה יותר.

---

# ‏139. Manual Override

‏אם קיימת, היא:

- ‏מפורשת.
- ‏audited.
- ‏scoped.
- ‏time-bounded.
- ‏לא עוקפת invariants קריטיים.

---

# ‏140. Never Hide Halt State from UI

‏Dashboard צריך להציג status ברור.

‏לא רק “No Data”.

---

# ‏141. UI Fields

‏ל־symbol detail:

```text
Trading Status
Halt Reason
Halt Start
Resume Quote Time
Resume Trade Time
LULD Lower
LULD Upper
Distance to Band
Seconds Since Resume
```

---

# ‏142. Whole-Market Dashboard

‏נרצה:

```text
halted_symbols_count
luld_pause_count
symbols_near_upper_band
symbols_near_lower_band
fast_market_symbols
```

---

# ‏143. Alerting

‏Alerts אפשריים:

- ‏Position became halted.
- ‏Working order entered unknown state during halt.
- ‏Halt status conflict.
- ‏Unexpected reopen without fresh data.
- ‏Multiple symbols halted simultaneously.
- ‏Market-wide circuit breaker.

---

# ‏144. Alert Fatigue

‏לא שולחים 4,000 alerts אם market-wide event קורה.

‏עושים aggregation.

---

# ‏145. Incident Correlation

‏Market-wide event מקבל:

```text
incident_id
```

‏וכל affected symbol נקשר אליו.

---

# ‏146. Observability Trace

```text
market shock
→ symbol near band
→ limit state
→ pause
→ entry blocked
→ position remains open
→ reopen
→ reconciliation
→ exit
```

‏כל השרשרת צריכה להיות queryable.

---

# ‏147. Replay Scenario — Entry רגע לפני Halt

‏בדיקת חובה:

```text
T0 signal
T1 submit
T2 partial fill
T3 halt
T4 exit becomes due
T5 reopen
T6 exit completes
```

---

# ‏148. Replay Scenario — Cancel Race

```text
T0 working entry
T1 halt suspected
T2 cancel sent
T3 fill occurred before cancel
T4 cancel ack arrives
```

‏המערכת חייבת להישאר עקבית.

---

# ‏149. Replay Scenario — Status Arrives Late

```text
market paused at T0
provider status received at T0+500ms
```

‏בודקים כמה intents נוצרו בחלון.

---

# ‏150. Replay Scenario — Reopen Then Re-Halt

‏בודקים שלא נוצרת לולאת resume אוטומטית מסוכנת.

---

# ‏151. Replay Scenario — Feed Outage Masquerading as Halt

‏המערכת צריכה לסווג:

```text
feed_stale
```

‏ולא לכתוב historical fact שגוי של halt.

---

# ‏152. Replay Scenario — Halt Feed Outage

‏אם quotes/trades ממשיכים אבל status feed נופל:

‏ה־readiness policy צריכה להחליט אם continuation מותר.

‏זה capability/risk decision מפורש.

---

# ‏153. Fault Injection

‏נזריק:

- ‏duplicate halt events.
- ‏out-of-order resume event.
- ‏missing reason code.
- ‏stale LULD bands.
- ‏conflicting sources.
- ‏broker reconnect באמצע halt.
- ‏process restart בזמן pause.

---

# ‏154. Invariant — Halt Blocks New Entry

```text
if canonical_trading_status != OPEN:
    no new risk-increasing order may be submitted
```

‏ב־baseline שלנו.

---

# ‏155. Invariant — Resume Requires Validation

```text
OPEN event alone != entry enabled
```

---

# ‏156. Invariant — Position Truth Survives Restart

‏Restart בזמן halt לא יכול להפוך Position ל־0 רק כי memory reset.

---

# ‏157. Invariant — Exit Intent Not Lost

‏אם exit נדרש בזמן pause, restart לא מוחק אותו.

---

# ‏158. Invariant — Old Signal Cannot Cross Reopen Boundary

‏Signal pre-halt אינו re-used אחרי reopen בלי re-evaluation.

---

# ‏159. Invariant — Unknown Is Risk State

‏אם order/position/status אינו ידוע:

```text
new entries blocked
```

---

# ‏160. Backtest Fidelity Levels

‏אפשר להגדיר:

```text
H0: ignore halts entirely
H1: remove halted intervals
H2: replay halt/resume timestamps
H3: model working orders across halt
H4: model reopening execution
H5: calibrate with live broker behavior
```

‏תוצאה בלי ציון fidelity אינה מלאה.

---

# ‏161. Minimum Acceptable Fidelity

‏ל־seconds strategy:

‏`H0` אינו מספיק ל־production evidence.

---

# ‏162. Historical Halt Data

‏צריך לשמור point-in-time:

- ‏symbol.
- ‏halt time.
- ‏reason.
- ‏resume quote time.
- ‏resume trade time.
- ‏source.

---

# ‏163. Historical LULD Bands

‏אם משתמשים distance-to-band במחקר, צריך bands היסטוריים נכונים לזמן ההחלטה.

‏לא לחשב אותם בדיעבד מנתונים מלאים בלי לוודא parity.

---

# ‏164. Corporate Actions

‏Splits ושינויים אחרים יכולים להשפיע על historical prices.

‏LULD research דורש consistency בין raw/adjusted data.

---

# ‏165. Session Boundaries

‏ה־LULD Plan שנבדק חל במסחר הרגיל `9:30 a.m.–4:00 p.m. ET`.

‏אל תניח שכללי regular session חלים identically ב־pre/post market.

---

# ‏166. Extended Hours

‏Trading halt יכול להשפיע גם מחוץ ל־regular hours לפי exchange rules, אבל `LULD` price bands עצמם הם מנגנון של regular session לפי התכנית הנוכחית.

‏אלה concepts שונים.

---

# ‏167. Nasdaq MarketWatch

‏Nasdaq מתעדת ש־MarketWatch יכולה ליישם halts גם במהלך pre-market/after-hours במצבים מסוימים.

‏לכן:

```text
outside regular hours != no halt concept
```

---

# ‏168. News Dissemination

‏ב־news halt, resumption יכול להמתין להפצת מידע ולהחלטת exchange.

‏אין timer קבוע שאפשר לסמוך עליו.

---

# ‏169. Market Calendar Service

‏`TradingStatus` צריך לעבוד יחד עם:

```text
MarketCalendar
```

‏כדי להבדיל:

```text
closed by schedule
```

‏מ־:

```text
unexpected halt
```

---

# ‏170. `Expected Silence`

‏אם session closed:

```text
silence = expected
```

‏אם session open ו־active symbol נעצר:

```text
silence = investigate
```

---

# ‏171. Halt-aware Health Check

‏System health לא צריך להיכשל רק כי symbol halted.

‏זו יכולה להיות market state תקינה.

‏ה־health check שואל:

```text
Did we detect and handle it correctly?
```

---

# ‏172. `Healthy but Not Tradable`

‏מערכת יכולה להיות:

```text
system_health = HEALTHY
symbol_tradability = HALTED
```

‏זה design נכון.

---

# ‏173. `Unhealthy but Market Open`

‏ולהפך:

```text
market = OPEN
system = DEGRADED
```

‏למשל feed lag.

---

# ‏174. Capability Matrix

‏לכל data provider נבדוק:

- ‏יש trading-status feed?
- ‏יש LULD bands?
- ‏יש halt reason?
- ‏יש resume timestamps?
- ‏מה latency?
- ‏האם historical data קיימים?

---

# ‏175. Broker Capability Matrix

‏נבדוק:

- ‏איך broker מציג halted contract?
- ‏מה קורה ל־working orders?
- ‏איך cancel מתנהג?
- ‏איך reject/error מקודדים?
- ‏מה קורה ב־reopen?

‏בלי hard-coded assumptions.

---

# ‏176. Provider Independence

‏`TradingStatusProvider` לא חייב להיות אותו ספק כמו `MarketDataProvider`.

‏אבל אז נדרשת identity/time reconciliation.

---

# ‏177. Canonical Instrument Mapping

‏Halt event חייב להתמפות לאותו `InstrumentId` של scanner ו־broker.

‏Ticker בלבד אינו תמיד מספיק.

---

# ‏178. Symbol Change Risk

‏Historical halt data סביב ticker changes דורשים point-in-time mapping.

---

# ‏179. Timestamp Precision

‏Seconds-level strategy דורשת timestamps ברזולוציה מספקת.

‏תאריך בלבד או minute bar אינם מספיקים ל־RCA.

---

# ‏180. Operational Baseline לרובוט שלנו

‏ה־baseline המוצע:

```text
1. Receive authoritative/normalized trading status
2. Gate halted/paused/unknown symbols before ranking
3. Track LULD band distance when available
4. Invalidate pre-halt entry intents
5. Preserve positions/orders durably
6. Reconcile during/after broker reconnect
7. Require post-reopen warm-up and readiness
8. Record halt packet for replay/RCA
```

---

# ‏181. Baseline State Model

```text
SymbolTradingState
- status
- reason
- source
- event_time
- received_time
- luld_upper
- luld_lower
- market_generation
- seconds_since_resume
```

---

# ‏182. Baseline Entry Rule

```text
ENTRY_ALLOWED only when:
status == OPEN
&& status_fresh
&& market_data_fresh
&& scanner_snapshot_consistent
&& broker_ready
&& risk_ready
&& no_unknown_order_state
```

---

# ‏183. Baseline Position Rule

‏אם Position פתוחה וה־symbol halted:

```text
track exposure
persist exit requirement if triggered
alert operator
reconcile broker state
wait for authoritative tradability
```

---

# ‏184. Baseline Reopen Rule

```text
resume event
→ increment market generation
→ invalidate old signals
→ rebuild features
→ validate spread/liquidity
→ reconcile orders/position
→ re-enable candidate eligibility
```

---

# ‏185. Baseline Fast-Market Rule

‏בשלב ראשון:

```text
extreme latency / stale coverage / unstable book
=> block new entries
```

‏לפני שמנסים להיות “חכמים” עם adaptive behavior.

---

# ‏186. Baseline Research Questions

‏נרצה לענות:

1. ‏כמה פעמים Top1 נמצא קרוב ל־LULD band?
2. ‏כמה Entries היו מתרחשות לפני halt?
3. ‏מה performance של candidates סמוך ל־band?
4. ‏מה קורה לאחר reopen?
5. ‏כמה execution quality מתדרדרת ב־fast regime?
6. ‏כמה זמן status detection לוקח?
7. ‏כמה פעמים provider sources חלוקים?

---

# ‏187. Metrics — Halt

```text
halt_count
halt_duration_seconds
re_halt_count
position_halted_count
working_order_halted_count
```

---

# ‏188. Metrics — Detection

```text
halt_detection_latency_ms
status_conflict_count
unknown_status_duration_ms
```

---

# ‏189. Metrics — LULD

```text
symbols_in_limit_state
symbols_near_upper_band
symbols_near_lower_band
top1_band_distance_bps
```

---

# ‏190. Metrics — Reopen

```text
reopen_warmup_ms
reopen_spread_bps
reopen_slippage_bps
reopen_rehalt_rate
```

---

# ‏191. Metrics — Fast Market

```text
quote_rate
trade_rate
rank_churn
processing_lag_p95
processing_lag_p99
fresh_coverage_ratio
```

---

# ‏192. Metrics — Risk

```text
unexitable_position_seconds
exit_required_but_blocked_seconds
unknown_order_effect_count
```

---

# ‏193. RCA Classification

‏Failure families:

```text
STATUS_NOT_DETECTED
STATUS_DETECTED_LATE
STALE_SIGNAL_CROSSED_HALT
ORDER_STATE_UNKNOWN
REOPEN_TOO_EARLY
REOPEN_DATA_STALE
FAST_MARKET_LATENCY
BAND_PROXIMITY_NOT_HANDLED
PROVIDER_CONFLICT
```

---

# ‏194. Success RCA

‏גם מקרים שהמערכת חסמה Entry לפני halt צריכים להישמר.

‏אחרת לא נדע כמה Safety חסכה לנו execution risk.

---

# ‏195. Near Miss

‏דוגמה:

```text
entry blocked 40ms before halt
```

‏זו Near Miss חשובה לניתוח.

---

# ‏196. Counterfactual

‏אפשר לשאול:

```text
What would have happened if the halt gate had been disabled?
```

‏אבל רק עם confidence שמתאים לנתונים.

---

# ‏197. Do Not Invent Post-Halt Fill

‏אם אין historical evidence מספיק:

```text
counterfactual_fill = UNKNOWN
```

---

# ‏198. Stress Testing

‏נבדוק:

- ‏status delayed.
- ‏spread doubled.
- ‏reopen gap.
- ‏latency spike.
- ‏partial fill before pause.
- ‏feed burst after resume.

---

# ‏199. Property — No Pre-Halt Signal Reuse

‏Test:

```text
forall signals created before market_generation change:
    they cannot create a new entry after generation change
```

---

# ‏200. Property — Safety Dominates Alpha

```text
if safety says NOT_TRADABLE:
    strategy score cannot authorize submit
```

---

# ‏201. Property — Resume Is Monotonic only after Validation

‏אסור transition:

```text
TRADING_PAUSE -> READY_FOR_ENTRY
```

‏ישירות.

‏עוברים דרך validation.

---

# ‏202. Property — Halt Does Not Erase Exposure

‏Position persists until broker-confirmed flat.

---

# ‏203. Property — Data Silence Cannot Produce Fresh Feature

‏אם source data stale:

```text
feature_fresh = false
```

---

# ‏204. Practitioner Insight — הכי מסוכן הוא “כמעט רגיל”

‏מערכת בדרך כלל יודעת לטפל ב־disconnect מוחלט.

‏מצבים קשים יותר הם:

- ‏quotes שמגיעים אבל באיחור.
- ‏חלק מה־symbols קפואים.
- ‏status feed מתעכב.
- ‏broker connected אבל market paused.

‏כלומר degraded-but-not-dead.

---

# ‏205. Practitioner Insight — `Last` מסוכן במיוחד אחרי Halt

‏ה־Last pre-halt יכול להישאר על המסך דקות.

‏הוא נראה מספר חוקי.

‏אבל הוא אינו מחיר executable עדכני.

---

# ‏206. Practitioner Insight — Wide Spread אחרי Reopen הוא מידע

‏לא “בעיה זמנית להתעלם ממנה”.

‏הוא signal על uncertainty ו־execution risk.

---

# ‏207. Practitioner Insight — First Fill Can Be Bad Evidence

‏גם אם קיבלנו fill מיד אחרי reopen, אין להסיק ש־execution tactic טובה.

‏צריך markout ו־sample רחב.

---

# ‏208. Practitioner Insight — Halts Create Selection Bias

‏אם Backtest פשוט מסיר כל trade שלא ניתן לסחור בו, הוא עלול להציג Strategy “נקייה” מדי.

‏צריך לדווח כמה opportunities נפסלו בגלל halt conditions.

---

# ‏209. Practitioner Insight — Safety Cost Is Measurable

‏Safety Gate מפסיד לעיתים trades שהיו מצליחים.

‏זה `Opportunity Cost of Safety`.

‏אבל צריך להשוות אותו לסיכון שנמנע.

---

# ‏210. `Safety Opportunity Cost`

```text
blocked_candidate_future_return
```

‏אפשר למדוד לצורכי מחקר בלבד.

‏לא כדי לעקוף Safety אוטומטית.

---

# ‏211. Practitioner Insight — Market-Wide Stress משנה הכול

‏Thresholds שנראים טוב ביום רגיל יכולים להיות חסרי משמעות בזמן market-wide shock.

‏לכן segmentation לפי regime חובה.

---

# ‏212. `Halt Density`

```text
halted_symbols / active_universe
```

‏יכול להיות market-stress indicator.

---

# ‏213. Cross-Sectional Alert

‏אם halt density עולה מהר:

‏אפשר לעבור ל־:

```text
GLOBAL_DEGRADED
```

‏גם אם אין MWCB רשמי.

---

# ‏214. Data Provider Stress

‏Market-wide fast conditions יכולים לחשוף provider bottlenecks.

‏צריך להבדיל:

```text
market stress
```

‏מ־:

```text
provider collapse under stress
```

---

# ‏215. Dual Provider Diagnostic

‏אם יש secondary feed:

‏אפשר להשוות:

```text
status divergence
quote age divergence
band divergence
```

---

# ‏216. Failover אינו Automatic Alpha Continuity

‏גם אם feed חלופי עובד:

‏צריך warm-up ו־parity validation לפני re-enable.

---

# ‏217. Restart בזמן Halt

‏Startup sequence:

```text
load durable state
connect broker
fetch positions/orders
fetch authoritative trading status
reconcile
rebuild market state
stay RECOVERING
```

‏עד validation.

---

# ‏218. Startup בזמן Fast Market

‏לא חייבים להצטרף מיד.

‏אפשר להישאר:

```text
OBSERVING
```

‏עד ש־fresh coverage ו־latency יציבים.

---

# ‏219. Deployment Safety

‏Deployment בזמן market stress יכול להיות רעיון גרוע.

‏אפשר policy:

```text
no production deployment while active positions or degraded market state
```

---

# ‏220. Configuration Change Safety

‏שינוי threshold של band proximity בזמן session חייב להיות versioned/audited.

---

# ‏221. Run Manifest

‏נשמור:

```text
market_rules_version
halt_mapping_version
luld_rule_version
fast_market_model_version
```

---

# ‏222. Rule Update Process

‏כאשר exchange/LULD plan משתנה:

```text
source review
→ config update
→ replay tests
→ paper/shadow validation
→ production rollout
```

---

# ‏223. Rules Are Data

‏זה עיקרון ארכיטקטוני:

```text
exchange rules = versioned external data
```

‏לא business constants מפוזרים בקוד.

---

# ‏224. Current LULD Facts to Revalidate

‏נכון למסמכים שנבדקו באוקטובר 2026:

- ‏ה־LULD Plan חל ב־regular trading hours של `9:30–16:00 ET`.
- ‏Reference Price מבוסס על חמש דקות קודמות של eligible transactions.
- ‏Limit State שאינו נפתר בתוך `15s` יכול להוביל ל־Trading Pause.
- ‏Trading Pause הוא בדרך כלל `5 minutes` ויכול להתארך.
- ‏Tier 1 מעל `$3` משתמש בדרך כלל ב־`5%` parameter.
- ‏Tier 2 מעל `$3` משתמש בדרך כלל ב־`10%` parameter.
- ‏בחלק מהקטגוריות bands מוכפלים ב־25 הדקות האחרונות.

‏כל אחד מהפרטים האלה צריך revalidation לפני Production.

---

# ‏225. Current MWCB Facts to Revalidate

‏נכון למסמכי NYSE שנבדקו באוקטובר 2026:

```text
Level 1: -7%
Level 2: -13%
Level 3: -20%
```

‏ביחס לסגירת `S&P 500` של היום הקודם, בכפוף לכללי השוק הרלוונטיים.

---

# ‏226. Source Hierarchy למחקר

‏לכללי market structure נעדיף:

1. ‏Official LULD Plan.
2. ‏Primary exchange rule/trading pages.
3. ‏Broker documentation.
4. ‏Market-data provider docs.
5. ‏Blog/community רק כהסבר משני.

---

# ‏227. What the Robot Must Know by Heart

‏מבחינת runtime, לא צריך “לדעת בעל פה” את כל אחוזי ה־rulebook.

‏הוא כן חייב לדעת:

```text
Can I trade this symbol now?
How fresh is that fact?
How close are we to a trading constraint?
Do I have unresolved orders/positions?
Did the market generation change?
```

---

# ‏228. What We Need to Know as Designers

‏אנחנו צריכים להבין:

- ‏מהו halt.
- ‏מהו LULD.
- ‏מהו Limit State.
- ‏מהו Straddle State.
- ‏למה reopening הוא regime חדש.
- ‏למה fast market משנה execution.
- ‏למה status הוא data source עצמאי.

---

# ‏229. Minimal Production Interfaces

```csharp
public interface ITradingStatusProvider
{
    ValueTask<TradingStatusSnapshot> GetAsync(
        InstrumentId instrumentId,
        CancellationToken cancellationToken);
}

public interface IMarketRuleProvider
{
    ValueTask<MarketRuleSnapshot> GetAsync(
        InstrumentId instrumentId,
        DateTimeOffset asOf,
        CancellationToken cancellationToken);
}
```

---

# ‏230. Canonical Snapshot Example

```csharp
public sealed record TradingStatusSnapshot(
    InstrumentId InstrumentId,
    TradingStatus Status,
    string? ReasonCode,
    DateTimeOffset EventTime,
    DateTimeOffset ReceivedTime,
    TradingStatusSource Source,
    long MarketGeneration);
```

---

# ‏231. LULD Context Example

```csharp
public sealed record LuldContext(
    decimal? LowerBand,
    decimal? UpperBand,
    decimal? ReferencePrice,
    string? Tier,
    DateTimeOffset AsOf,
    string RuleVersion);
```

---

# ‏232. Entry Guard Example

```csharp
public bool CanCreateNewRisk(TradingContext context)
{
    return context.TradingStatus == TradingStatus.Open
        && context.StatusIsFresh
        && context.MarketDataIsFresh
        && context.BrokerIsReady
        && context.RiskIsReady
        && !context.HasUnknownOrderState;
}
```

---

# ‏233. למה Guard פשוט עדיף

‏כלל safety צריך להיות קל להסביר ולבדוק.

‏אם eligibility דורשת 200 שורות AI-like heuristics, קשה להוכיח שהיא fail-safe.

---

# ‏234. Keep Advanced Detection Outside Critical Guard

‏מודל Fast Market מתוחכם יכול להוסיף context.

‏אבל hard facts כמו `HALTED` צריכים rule פשוט.

---

# ‏235. `Observed`, ‏`Derived`, ‏`Inferred`

‏כמו בפרק 40:

- ‏`Observed`: exchange/provider אמר Halt.
- ‏`Derived`: distance to LULD band.
- ‏`Inferred`: suspected halt בגלל silence.

‏לא מערבבים ביניהם.

---

# ‏236. Confidence-Aware Decision

‏אם status inferred בלבד:

‏אפשר לבחור safety stricter.

‏חוסר ודאות אינו סיבה לקחת יותר risk.

---

# ‏237. Keep Raw Provider Events

‏ל־RCA ו־replay נשמור raw event כאשר מותר ומתאים.

‏normalized state לבדו עלול להסתיר mapping error.

---

# ‏238. Event Retention

‏Halt events נדירים יחסית ולכן שווה לשמור אותם לאורך זמן לצורכי research/regression.

---

# ‏239. Golden Halt Corpus

‏נבנה dataset קטן של אירועים אמיתיים:

- ‏LULD pause.
- ‏news halt.
- ‏reopen.
- ‏re-halt.
- ‏status conflict.
- ‏feed outage mistaken for halt.

---

# ‏240. Regression Rule

‏כל production incident חדש הקשור ל־halt הופך ל־golden replay test.

---

# ‏241. Failure Budget

‏יעד Production אינו “אפס halts”.

‏השוק שולט בזה.

‏היעד שלנו:

```text
zero unsafe actions caused by mishandling halt state
```

---

# ‏242. Acceptance Test — No Position

‏תרחיש:

```text
symbol OPEN
→ LIMIT_STATE
→ PAUSE
→ REOPEN
```

‏ציפייה:

```text
no entry during non-open state
no stale intent after reopen
```

---

# ‏243. Acceptance Test — Open Position

‏תרחיש:

```text
position open
→ halt
→ exit timer expires
→ reopen
```

‏ציפייה:

```text
exit requirement persisted
position reconciled
safe exit policy engaged after reopen
```

---

# ‏244. Acceptance Test — Partial Fill

‏תרחיש:

```text
entry partially filled
→ halt
```

‏ציפייה:

```text
actual filled quantity preserved
remaining order state reconciled
risk uses actual position
```

---

# ‏245. Acceptance Test — Restart

```text
halt active
→ process crashes
→ restart
```

‏ציפייה:

```text
system enters RECOVERING
fetches broker truth
fetches trading status
never assumes FLAT/OPEN
```

---

# ‏246. Acceptance Test — Status Conflict

```text
provider says OPEN
broker says HALTED
```

‏ציפייה:

```text
new entries blocked
conflict logged
reconciliation/status refresh triggered
```

---

# ‏247. Acceptance Test — Market-Wide Halt

‏ציפייה:

```text
all new entries blocked globally
positions tracked
working-order state reconciled
```

---

# ‏248. Acceptance Test — Fast-Market Backpressure

‏נזריק event burst.

‏ציפייה:

```text
no unbounded queue
freshness degrades visibly
entry gate reacts
```

---

# ‏249. Acceptance Test — Reopen Warm-Up

‏ציפייה:

```text
resume event alone does not re-enable entry
```

---

# ‏250. שאלות ידע

1. ‏מה ההבדל בין `Limit State` ל־`Trading Pause`?
2. ‏למה `Last` אינו LULD Reference Price?
3. ‏למה stale quote בזמן halt שונה מ־feed lag רגיל?
4. ‏למה Timer לבדו אינו מספיק ל־resume?
5. ‏למה working order בזמן halt דורש reconciliation?
6. ‏למה pre-halt signal צריך invalidation אחרי reopen?
7. ‏איך Fast Market משפיע על latency budget?
8. ‏למה `NO TRADE` אחרי reopen יכול להיות תוצאה מקצועית?
9. ‏למה status source צריך provenance?
10. ‏למה Backtest חייב לייצג non-tradable intervals?

---

# ‏251. Checklist לפני Production

- [ ] ‏יש `TradingStatus` canonical.
- [ ] ‏יש source/provenance לכל status.
- [ ] ‏יש raw reason code.
- [ ] ‏יש Market Rule versioning.
- [ ] ‏Halted symbol חסום לפני Ranking/Entry.
- [ ] ‏Pre-halt intents מבוטלים/invalidate לוגית.
- [ ] ‏Positions ו־Orders נשמרים durable.
- [ ] ‏Restart בזמן halt נכנס ל־`RECOVERING`.
- [ ] ‏Resume דורש authoritative state.
- [ ] ‏יש post-reopen warm-up.
- [ ] ‏יש status conflict handling.
- [ ] ‏יש LULD band context כאשר זמין.
- [ ] ‏יש Market-Wide status.
- [ ] ‏יש Fast-Market metrics.
- [ ] ‏יש backpressure handling.
- [ ] ‏יש Replay של halts.
- [ ] ‏יש Partial Fill + Halt test.
- [ ] ‏יש Cancel/Fill + Halt test.
- [ ] ‏יש Re-Halt test.
- [ ] ‏יש metrics ל־unexitable exposure.
- [ ] ‏יש RCA packet לכל halt משמעותי.

---

# ‏252. הסיכום המקצועי

‏`Halts`, ‏`LULD` ו־`Fast Markets` אינם edge cases שאפשר להוסיף בסוף.

‏הם מצבים שבהם ה־assumptions הבסיסיים של מסחר רציף נשברים.

‏במערכת קצרה מאוד, הטעות המסוכנת ביותר היא להתייחס ל־quote ישן, silence, reopening או fast-market burst כאילו הם עוד snapshot רגיל.

‏הגישה המקצועית היא:

```text
Observe status
→ classify explicitly
→ block unsafe risk
→ preserve broker truth
→ invalidate stale intent
→ reconcile
→ rebuild market state
→ validate readiness
→ only then resume
```

‏והכלל החשוב ביותר:

> ‏**כאשר איננו בטוחים אם השוק באמת tradable, ברירת המחדל אינה לנחש. ברירת המחדל היא לא ליצור Risk חדש עד שהמצב הוכח מחדש.**

---

# ‏253. מעבר לשלב הבא

‏השלב הבא הוא **44 — `Advanced Order Flow`**.

‏שם נעבור ממצבי שוק חריגים אל קריאת flow מתקדם: aggressor behavior, trade/quote interaction, signed flow, imbalance לאורך זמן, absorption, exhaustion, sweep-like behavior וההבדל בין “הרבה עסקאות” לבין flow שמספר משהו על pressure אמיתי.
