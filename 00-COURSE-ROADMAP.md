# ‏מפת הקורס — Algo Trading אישי: מהבסיס ועד רזי המקצוע

> ‏זהו מקור האמת למבנה הקורס. הקורס אינו מוגבל עוד ל־26 שלבים. נוסיף כמה פרקים שצריך כדי שלא יישארו חורים מהותיים.
>
> ‏העיקרון: בכל נושא לומדים קודם את **הידע המקצועי הכללי**, אחר כך את **רזי המקצוע וה־Best Practices**, ולבסוף את **המשמעות המיוחדת לרובוט האישי שלנו**, שמחפש הזדמנויות בכל השוק ומחזיק עסקה שניות בודדות ועד בערך דקה.

---

# ‏עקרונות הקורס

1. ‏לא ללמוד רק “איזה קוד לכתוב”, אלא להבין מספיק כדי לקבל החלטות ארכיטקטוניות ואסטרטגיות.
2. ‏לא לבנות לפי המגבלה של ספק אחד. קודם מגדירים מה המערכת צריכה, אחר כך בוחרים ספקים/ברוקרים/חלופות.
3. ‏לא להניח שעצה שמתאימה למסחר של שעות או ימים מתאימה למסחר של שניות.
4. ‏לא להניח שמה שנשמע מקצועי באמת מוסיף `edge` — בודקים בנתונים.
5. ‏למדוד תמיד `Net` ולא רק `Gross`.
6. ‏להפריד בין Signal, Prediction, Execution, Risk ו־Operations.
7. ‏ללמוד גם Best Practices, anti-patterns, failure modes ורזי מקצוע שמנוסים מכירים.
8. ‏לשמור את המערכת `Provider-agnostic`: אפשר לשלב `IBKR`, ‏`Alpaca`, אתר בנק, Feed מסחרי או מקור אחר.
9. ‏להתחיל פשוט, להוסיף מורכבות רק כשהוכח שהיא פותרת בעיה אמיתית.
10. ‏כל פרק צריך לענות גם על השאלה: “איך זה משפיע על רובוט אישי שמחפש רווח קטן ומהיר?”

---

# ‏חלק א — יסודות השוק והמערכת

## ‏01 — מה אנחנו בונים: רובוט אישי שסורק את כל השוק

‏מודל המערכת, `edge`, ‏Net מול Gross, Scanner, Ranking, Execution, Position Management ולולאת שיפור.

## ‏02 — איך שוק המניות האמריקאי עובד בפועל

‏בורסות, Venues, ברוקר, Market Makers, Routing, ‏NBBO, ‏settlement ומסלול הפקודה מהמחשב עד Fill.

## ‏03 — `Bid`, ‏`Ask`, ‏`Last`, ‏`Spread` וספר הפקודות

‏Level 1/2, Depth, Queue, ‏price/time priority, hidden liquidity ו־microstructure בסיסי.

## ‏04 — פקודות מסחר: מהבסיס ועד המתקדם

‏Market, Limit, Stop, IOC, FOK, Post Only, Pegged, Midpoint, Reserve, Bracket, OCA, Smart/Direct ועוד.

## ‏05 — Market Data

‏Trades, Quotes, timestamps, real-time, delayed, consolidated feeds, Level 1/2, data quality, provider abstraction.

## ‏06 — זמן, Sampling ו־Latency

‏Event-driven, snapshots, latency budget, jitter, staleness, backpressure, clock synchronization ו־signal-to-fill.

## ‏07 — Universe

‏מהו “כל השוק”, סוגי ניירות, tradability, halts, symbol lifecycle, static/dynamic universe ו־survivorship bias.

---

# ‏חלק ב — להבין ולמדוד תנועה

## ‏08 — מומנטום קצר

‏Returns, multi-horizon momentum, path consistency, rank/percentile ו־forward returns.

## ‏09 — Velocity, Acceleration וצורת המומנטום

‏האצה, האטה, burst, plateau, pullback, re-acceleration, exhaustion וגיל המומנטום.

## ‏10 — פעילות, מספר עסקאות ונפח

‏Trade count, volume, dollar volume, activity rate, RVOL, activity acceleration והקשר בין פעילות להמשך תנועה.

## ‏11 — נזילות ויכולת ביצוע אמיתית

‏Spread, depth, slippage, queue, fill probability, market impact, markout, time-to-fill ו־executable edge.

---

# ‏חלק ג — להפוך את המידע להחלטת מסחר

## ‏12 — Filters: מה פוסלים לפני הדירוג

‏Hard Filters, Soft Filters, freshness, liquidity, halts, price range, session, activity, data-quality filters ותיעוד rejection reasons.

## ‏13 — Feature Engineering

‏איך ממציאים Feature טוב, scaling, normalization, interactions, rolling windows, ratios, deltas, derivatives ו־feature leakage.

## ‏14 — Score ודירוג כל השוק

‏Weighted score, rank aggregation, nonlinear scoring, separate sub-scores, calibration ומתי לא להשתמש ב־Score אחד.

## ‏15 — בחירת Top Candidate ו־`Trade / No Trade`

‏Top 1 מול Top N, separation margin, confidence, minimum quality, opportunity threshold והחלטה לא לבצע כלום.

## ‏16 — כניסה לעסקה

‏Signal age, execution recheck, choosing order type, aggressiveness, maker/taker, stale-signal rejection ו־entry timing.

## ‏17 — יציאה מעסקה

‏Take profit, stop, time stop, signal exit, trailing logic, immediate conditional exits ו־maximum holding time.

## ‏18 — עלויות אמיתיות

‏Commission, exchange fees, regulatory fees, spread, slippage, routing costs, rebates ו־round-trip cost.

## ‏19 — Position Sizing וניהול סיכון

‏סיכון לעסקה, מגבלת יום, רצף הפסדים, exposure, duplicate positions, concentration ו־risk budget.

---

# ‏חלק ד — מחקר ובדיקת האסטרטגיה

## ‏20 — Backtest מהיסוד

‏מהו Backtest, timeline נכון, labels, entry/exit simulation, event ordering ו־reproducibility.

## ‏21 — Backtest ריאליסטי למסחר של שניות

‏Bid/Ask, spreads, fill delay, slippage, partial fills, order lifetime, queue approximation ו־latency simulation.

## ‏22 — איך יודעים שה־Scanner באמת מנבא

‏Forward returns, hit rate, expected value, time-to-first-profit, time-to-target, MFE/MAE, rank buckets ו־Top 1 diagnostics.

## ‏23 — Overfitting ו־Data Leakage

‏Train/test split לפי זמן, walk-forward, parameter hunting, multiple testing, look-ahead bias ו־survivorship bias.

## ‏24 — ניסויים נכונים ושיפור Score

‏Baseline, control, ablation tests, one-change-at-a-time, causal thinking ו־feature contribution.

## ‏25 — Regime Analysis

‏פתיחה, אמצע יום, סגירה, שוק שקט/סוער, volatility regimes, news regimes והאם אותו Score עובד בכל מצב.

## ‏26 — RCA לעסקאות ול־Rank #1 שנכשל

‏איך לחקור למה המניה שקיבלה ציון גבוה לא המשיכה, ולתרגם כישלון לשינוי מדיד במקום לניחוש.

---

# ‏חלק ה — מעבר ממחקר למסחר חי

## ‏27 — Replay

‏שחזור יום מסחר Tick-by-Tick/Events והרצת אותו Scanner שוב ושוב בצורה דטרמיניסטית.

## ‏28 — Paper Trading ו־Shadow Mode

‏Paper, signal-only, execution-shadow, comparison מול live quotes ומעבר הדרגתי לכסף אמיתי.

## ‏29 — Broker API Architecture

‏Sessions, authentication, order IDs, callbacks/events, reconnect, idempotency, retries ו־state reconciliation.

## ‏30 — `IBKR` / `IBKR Israel` לעומק

‏TWS/Gateway/Web API, account states, market-data permissions, order support, routing, simulated orders, cash/margin, buying power ומגבלות שצריך לבדוק בחשבון בפועל.

## ‏31 — ספקי נתונים וחלופות

‏`Alpaca`, ‏IBKR, feeds מסחריים, feeds מבורסות, אתר בנק ומקורות אחרים: coverage, latency, licensing, cost, reliability ושילוב כמה ספקים.

## ‏32 — הפרדת Market Data מ־Execution

‏Adapters, canonical market state, provider failover, feed comparison, execution truth ו־cross-provider discrepancies.

## ‏33 — Production State Machine

‏SCANNING, CANDIDATE, ENTERING, PARTIALLY_FILLED, POSITION, EXITING, RECOVERY ו־error states.

## ‏34 — Recovery מתקלות

‏נפילת אינטרנט, restart, disconnect broker, stale feed, unknown order state, duplicate messages, crash באמצע Position ו־startup reconciliation.

## ‏35 — Monitoring, Logs ו־Observability

‏Decision logs, market snapshots, order audit trail, metrics, alerts, dashboards, traces ויכולת להסביר כל Trade בדיעבד.

## ‏36 — Kill Switches ו־Safety Engineering

‏Max loss, max orders, max position, stale data, broker mismatch, runaway loop, unexpected fill ו־manual emergency stop.

---

# ‏חלק ו — רזי ביצוע ופקודות מתקדמות

## ‏37 — Order Tactics למתקדמים

‏מתי להיות Maker ומתי Taker, passive vs aggressive limits, crossing the spread, pegging, midpoint, post-only, IOC tactics, cancel/replace ו־order aging.

## ‏38 — Queue Position ורזי ה־Limit Order

‏מה המשמעות של מקום בתור, איך cancel/replace יכול לפגוע בקדימות, fill probability, queue decay ומתי חיסכון בסנט עולה לך בהחמצת כל המהלך.

## ‏39 — Smart Routing מול Direct Routing

‏איך Router מחפש נזילות, trade-offs של מהירות/מחיר/fees, routing policy, venue selection ומתי Direct יכול להיות רלוונטי.

## ‏40 — Hidden, Reserve, Midpoint, Pegged ו־ATS

‏איך נזילות לא־מוצגת עובדת רעיונית, dark/ATS concepts, midpoint liquidity, reserve orders והמלכודות בהנחה שמה שרואים הוא כל השוק.

## ‏41 — Advanced Broker Algos

‏Adaptive, Arrival Price, VWAP, TWAP, POV, Accumulate/Distribute ושאר Algos — מה הם עושים, מתי הם מיועדים למוסדיים, ומה כן יכול להיות שימושי לחשבון קטן.

## ‏42 — Opening/Closing Auctions ורזי Auction Orders

‏MOO, LOO, MOC, LOC, imbalance, crosses, למה auctions שונים מהמסחר הרציף ומה אפשר ללמוד מהם גם אם לא משתמשים בהם.

## ‏43 — Halts, LULD, Fast Markets ומצבי קיצון

‏מה קורה כשהמסחר נעצר, reopening, spread explosion, liquidity vacuum, gap risk ומה הרובוט חייב לעשות.

---

# ‏חלק ז — רזי Market Microstructure

## ‏44 — Order Flow למתקדמים

‏Aggressor side, trade direction inference, signed volume, burst of trades, sweep behavior ו־limitations של כל inference.

## ‏45 — Order Book Imbalance ו־Microprice

‏Book imbalance, microprice, depth-weighted signals, stability, cancellations והסכנה של spoof-like transient liquidity בלי להסיק כוונה בלתי מוכחת.

## ‏46 — Adverse Selection לעומק

‏למה לפעמים Fill הוא חדשות רעות, maker toxicity, markouts, informed flow ואיך למדוד האם אנחנו מקבלים fills דווקא לפני תנועה נגדנו.

## ‏47 — Price Impact ו־Capacity

‏Temporary/permanent impact, order size relative to depth/volume, capacity של strategy ולמה אסטרטגיה קטנה יכולה לעבוד בסקייל קטן בלבד.

## ‏48 — Latency Edge בלי להיות `HFT`

‏איפה באמת שווה לחסוך זמן במערכת Retail, איפה latency אינו צוואר הבקבוק, batching, GC pauses, network jitter ו־measurement before optimization.

---

# ‏חלק ח — Best Practices של מחקר ופיתוח אלגו

## ‏49 — Best Practices למחקר Quant

‏Hypothesis first, baselines, preregistered metrics, reproducible datasets, versioned features, immutable raw data ו־research notebooks/queries.

## ‏50 — Best Practices ל־Scanner

‏Incremental computation, precomputed rolling windows, avoiding full rescans unnecessarily, ranking data structures, caching ו־freshness semantics.

## ‏51 — Best Practices ל־Execution Engine

‏Idempotency, exactly-once intent, at-least-once messages, order state truth, reconciliation, timeout semantics ו־no assumptions after disconnect.

## ‏52 — Best Practices ל־Data Engineering

‏Raw vs normalized vs derived data, schema versioning, sequence numbers, deduplication, out-of-order events, retention ו־replayability.

## ‏53 — Best Practices ל־Testing

‏Unit, integration, simulation, replay, deterministic tests, chaos/failure tests, broker sandbox/paper tests ו־acceptance scenarios.

## ‏54 — Best Practices לביצועים

‏Measure first, profiling, allocation pressure, concurrency, backpressure, bounded queues, batching, serialization ו־avoiding premature optimization.

## ‏55 — Best Practices לאבטחה ותפעול

‏API keys, least privilege, secrets, account separation, logs without secrets, safe configuration, auditability ו־manual control.

---

# ‏חלק ט — “רזי המקצוע”: מה מנוסים יודעים שמתחילים מפספסים

## ‏56 — 100 טעויות נפוצות באלגו קצר

‏רשימת anti-patterns: stale data, fake precision, optimistic fills, wrong timestamps, ignoring spread, overfitting, mixed sessions, broken recovery ועוד.

## ‏57 — 100 טיפים מעשיים לבונה רובוט אישי

‏טיפים קטנים שמצטברים להבדל גדול: לוגים נכונים, שמירת snapshots, kill switches, naming, versioning, dry runs, replay ועוד.

## ‏58 — רזי פקודות וביצוע

‏מתי פקודה “נכונה תיאורטית” היא בחירה גרועה מעשית, איך order age משנה החלטה, איך מחיר טוב מדי עלול לא להתמלא, ואיך לחשוב על opportunity cost של המתנה.

## ‏59 — רזי נתוני שוק

‏Stale quotes, late prints, corrected trades, odd lots, venue differences, feed gaps, clock mismatch ו־cross-feed validation.

## ‏60 — רזי Scanner ו־Ranking

‏למה Rank #1 יכול להיות רע, separation from #2, crowded signals, feature redundancy, unstable rankings, churn ו־score hysteresis.

## ‏61 — רזי Backtest

‏איך Backtest “משקר” גם בלי באג: impossible fills, wrong universe, survivorship, future knowledge, latency blindness ו־selection bias.

## ‏62 — רזי Live Trading

‏מה עובד במחקר ונשבר בחי: reconnects, delayed callbacks, broker throttling, order rejects, partial fills, race conditions ו־state drift.

## ‏63 — איך מקצוענים חושבים על Edge

‏Edge decay, capacity, crowding, execution alpha, robustness, regime dependence, cost sensitivity ו־why simple edges can beat clever models.

## ‏64 — Checklist של מקצוען לפני העלאה לכסף אמיתי

‏Data, model, execution, risk, operations, recovery, broker, account, permissions, observability ו־abort criteria.

---

# ‏חלק י — ידע רחב שכדאי להכיר גם אם לא משתמשים בו מיד

## ‏65 — Indicators קלאסיים

‏Moving averages, RSI, MACD, Bollinger, ATR, VWAP ועוד: מה הם באמת מודדים, למה הם פופולריים ומתי הם כפילות של Features בסיסיים.

## ‏66 — Statistical/Quant Basics

‏Mean, variance, distributions, correlation, conditional probability, expected value, confidence intervals ו־multiple comparisons בפשטות.

## ‏67 — Machine Learning לאלגו

‏Classification, regression, ranking models, trees, boosting, calibration, feature importance, online learning ומתי ML הוא overkill.

## ‏68 — Market Regimes ו־Context

‏Index trend, sector behavior, volatility, breadth, relative strength ו־context features שיכולים לשפר Scanner.

## ‏69 — News, Events ו־Corporate Actions

‏Earnings, splits, dividends, offerings, halts, scheduled announcements ואיך אירועים יכולים לשבור הנחות היסטוריות.

## ‏70 — Short Selling ו־Borrow

‏הבנה כללית של short, locate/borrow, hard-to-borrow, buy-ins ו־למה Long-only פשוט יותר לרובוט ראשון.

## ‏71 — Account Mechanics ורגולציה מעשית

‏Cash vs Margin, settlement, buying power, day-trading rules, good-faith/freeriding concepts, permissions והבדלים לפי broker/entity — תמיד עם בדיקה עדכנית לפני שימוש מעשי.

## ‏72 — Fees, Tax ו־Accounting Awareness

‏איזה סוגי עלויות ומסמכים קיימים ולמה מערכת שמבצעת הרבה עסקאות חייבת למדוד עלויות ולא להסתכל רק על PnL גולמי. נושאי מס ספציפיים יאומתו מול מקור מוסמך בזמן אמת.

---

# ‏חלק יא — להפוך את הרובוט למערכת שלומדת

## ‏73 — Daily Review אוטומטי

‏סיכום יום, best/worst selections, missed opportunities, failed exits, slippage outliers ו־data-quality incidents.

## ‏74 — Scanner Diagnostics

‏למה Candidate נכנסה ל־Top, איזה Feature דחף אותה, מה היה Rank history שלה ומה השתנה בשניות לפני ואחרי הבחירה.

## ‏75 — Feature Retirement

‏איך לזהות Feature שלא מוסיף מידע, Feature שהפסיק לעבוד ו־Feature שמוסיף overfitting.

## ‏76 — Continuous Improvement Loop

‏Observe → Hypothesis → Test → Validate → Shadow → Live → Measure → Keep/Rollback.

## ‏77 — Versioning של Strategy

‏Strategy version, feature version, score version, config version ויכולת לשחזר בדיוק למה Trade מסוים קרה.

## ‏78 — Champion/Challenger

‏אסטרטגיה קיימת מול גרסה חדשה שרצה במקביל ב־Shadow לפני שמחליפים אותה.

---

# ‏חלק יב — פרקי מאסטרי וסיכום

## ‏79 — בניית Playbook אישי למסחר שלך

‏כללי Universe, Features, Ranking, Entry, Exit, Risk, Failure Handling ו־Daily Process במסמך אחד.

## ‏80 — תכנון הארכיטקטורה המלאה של הרובוט

‏Components, interfaces, message flow, persistence, broker adapters, data adapters, research/live separation ו־deployment מקומי.

## ‏81 — תכנון גרסת MVP אמיתית

‏המינימום שאפשר להפעיל ב־Shadow/Paper בלי לבנות מפלצת מורכבת.

## ‏82 — תכנון Production v1

‏מה חייב להיות לפני כסף אמיתי, מה יכול לחכות, ומהם תנאי Go/No-Go.

## ‏83 — מדריך “מה אני צריך לדעת בעל פה ומה מספיק לדעת שקיים”

‏חלוקה בין ידע בסיסי שחייב להיות אינטואיטיבי לבין נושאים מתקדמים שאפשר לפתוח לפי צורך.

## ‏84 — מילון מושגים מלא

‏כל מונחי הקורס בעברית פשוטה עם השם המקצועי באנגלית.

## ‏85 — Checklist סופי: האם אני מוכן לתכנן ולפקח על רובוט אלגו אישי?

‏בדיקת ידע, תכנון, מחקר, ביצוע, סיכון, תפעול ויכולת לקבל החלטות גם כאשר `AI` כותב את רוב הקוד.

---

# ‏כלל להמשך הקורס

‏המפה הזו אינה תקרה.

‏אם תוך כדי העבודה נגלה נושא חשוב שלא קיבל פרק מספיק טוב:

> ‏נוסיף פרק חדש במקום לדחוס אותו בכוח לפרק קיים.

‏המטרה היא לא “לסיים מספר פרקים”.

‏המטרה היא להגיע למצב שבו יש לך **מפת ידע מלאה מספיק כדי להבין, לתכנן, לבדוק, לפקח ולשפר רובוט מסחר אישי אמיתי**.
