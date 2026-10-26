# ‏Course Mastery Mandate — לא להשאיר חורים בידע

> ‏מסמך זה משלים את `00-COURSE-ROADMAP.md` ומגדיר דרישת־על קבועה לכל המשך הקורס.

## ‏המטרה

‏הקורס לא נועד רק להסביר איך לבנות רובוט מסחר עובד. הוא נועד להביא להבנה מקצועית עמוקה של כל תחום שהרובוט נוגע בו — כולל הפרטים הקטנים, ה־trade-offs, הכשלים הנפוצים, רזי המקצוע והידע שמבדיל בין implementation בסיסי לבין עבודה מקצועית.

‏היעד האישי של הרובוט נשאר חשוב במיוחד: לזהות הזדמנות קצרת־טווח, לשמור על `net edge` קטן אך אמיתי, להיכנס רק כאשר אפשר לבצע אותו בפועל, ולצאת מהר כאשר ה־edge נחלש — בלי להניח שרווח מהיר מובטח ובלי להסתיר את הסיכונים והעלויות.

---

# ‏כלל 1 — מלמדים הכול, לא רק את מה שנדרש ל־MVP

‏בכל תחום נלמד לפחות ארבע שכבות:

1. ‏הבסיס המקצועי והטרמינולוגיה.
2. ‏המודלים והטכניקות המתקדמות.
3. ‏רזי המקצוע, subtle failure modes ו־practitioner knowledge.
4. ‏היישום והמשמעות לרובוט הקצר שלנו.

‏אין מגבלה מלאכותית על מספר הפרקים. אם נושא מהותי חסר — מוסיפים אותו.

---

# ‏כלל 2 — פקודות ומחירים נלמדים לעומק

‏לא מסתפקים ב־`Market` ו־`Limit`.

‏הקורס צריך להגיע גם להבנה עמוקה של:

- ‏מחיר עסקה מול `Bid`, ‏`Ask`, ‏`Mid`, ‏`Microprice`, ‏VWAP ומחירי benchmark אחרים.
- ‏`Marketable Limit`, ‏`IOC`, ‏`FOK`, ‏`Post Only`, ‏`Pegged`, ‏`Midpoint`, ‏`Reserve`, ‏`Hidden`, ‏Bracket/OCO/OCA ופקודות מתקדמות נוספות כאשר הן רלוונטיות.
- ‏Queue priority, ‏fill probability, ‏cancel/replace, ‏partial fills ו־order aging.
- ‏Smart/Direct Routing, ‏venue selection, ‏fees/rebates ו־hidden liquidity.
- ‏Broker algos ו־execution objectives.
- ‏הפער בין “מחיר שנראה טוב” לבין `net executable price` אמיתי.

‏כל יכולת broker/exchange שמשתנה בזמן תיבדק מול מקור עדכני לפני שמקבעים עובדות תפעוליות.

---

# ‏כלל 3 — המיקוד הוא Edge שניתן לממש, לא תנועה על המסך

‏לכל signal נשאל:

```text
Can we detect it in time?
Can we execute it in time?
Can we exit it in time?
Does positive edge remain after all costs and failure probabilities?
```

‏לכן הקורס ימשיך לקשור בין:

```text
Prediction
→ Ranking
→ Entry feasibility
→ Fill probability
→ Adverse selection
→ Exit feasibility
→ Costs
→ Net outcome
```

‏`Gross movement` שאי אפשר לתפוס בפועל אינו Edge שימושי.

---

# ‏כלל 4 — התאמה מפורשת למסחר קצר מאוד

‏בכל נושא נשאל מה משתנה כאשר holding horizon הוא שניות עד בערך דקה.

‏במיוחד נבחן:

- ‏Signal half-life.
- ‏Latency ביחס לאורך חיי ה־signal.
- ‏מהירות כניסה ויציאה.
- ‏Spread ו־slippage ביחס לרווח קטן.
- ‏Queue risk.
- ‏Adverse selection.
- ‏Market impact.
- ‏Fill/no-fill opportunity cost.
- ‏מה קורה כאשר המחיר מפסיק להתקדם מיד.
- ‏מתי `NO TRADE` טוב יותר מעסקה שנראית כמעט מספיק טובה.

---

# ‏כלל 5 — “רווח קטן ומהיר” הוא בעיית מחקר, לא הנחת יסוד

‏הקורס יתאים את המחקר למטרה של מהלך קצר ויציאה מהירה, אבל לא יניח שהשוק תמיד מאפשר זאת.

‏נבדוק אמפירית:

- ‏`time_to_first_profit`.
- ‏`time_to_target`.
- ‏`MFE` ו־`MAE`.
- ‏מה קורה אחרי הגעה לרווח קטן.
- ‏giveback probability.
- ‏signal decay.
- ‏exit latency.
- ‏net outcome לאחר round-trip costs.

‏אם הנתונים מראים שהנחת “לקחת מהר לפני הירידה” אינה יציבה — משנים את המודל, לא מכריחים את המציאות להתאים לרעיון.

---

# ‏כלל 6 — מחפשים גם את הדברים שאינם ברורים למתחיל

‏בכל פרק יש לחפש במפורש שאלות כגון:

- ‏איזו הנחה סמויה עלולה להיות שגויה?
- ‏איזה metric נראה טוב אבל מטעה?
- ‏איזה edge נעלם כאשר עוברים מ־Backtest ל־Live?
- ‏איזה detail של exchange/broker/data feed משנה את התוצאה?
- ‏איזה failure mode נדיר אך יקר?
- ‏איזה דבר מקצוענים מודדים שמתחילים בדרך כלל לא מודדים?
- ‏איפה Winner's Curse, selection bias או survivorship bias יכולים להסתתר?
- ‏מה נראה כמו Alpha אבל בעצם מגיע מ־execution assumption לא ריאלי?

---

# ‏כלל 7 — ידע חדש שנחשף תוך כדי הופך לחלק מהקורס

‏כאשר במהלך פרק, מחקר, תיעוד Broker, ניסוי, RCA או שיחה מתגלה נושא חשוב שלא נמצא ב־Roadmap:

1. ‏לא מדלגים עליו.
2. ‏לא דוחסים אותו בכוח לפרק שאינו מתאים.
3. ‏רושמים אותו כ־`Discovered Topic`.
4. ‏מחליטים אם הוא הרחבה של פרק קיים או פרק חדש.
5. ‏מכניסים אותו לתוכנית לפני סיום הקורס.

‏הקורס הוא תוכנית חיה: completeness חשובה יותר משמירה מלאכותית על מספר קבוע של שלבים.

---

# ‏כלל 8 — שכבת `Practitioner Secrets` בכל תחום

‏“סודות מקצוע” כאן אינם קסמים או הבטחות לרווח, אלא ידע שנוטה להילמד רק אחרי ניסיון:

- ‏subtle market mechanics.
- ‏execution edge cases.
- ‏data artifacts.
- ‏broker quirks.
- ‏queue/routing subtleties.
- ‏regime-specific behavior.
- ‏failure recovery patterns.
- ‏monitoring signals שמקדימים תקלה.
- ‏backtest traps.
- ‏ways an apparently good metric can mislead.
- ‏trade-offs שלא רואים בהסבר בסיסי.

‏בכל פרק מתקדם ננסה לזהות ולהוסיף שכבה כזו כאשר קיימת Evidence מקצועית סבירה.

---

# ‏כלל 9 — לא מקריבים את התוכנית הקיימת

‏התוספת הזו **אינה מחליפה** שום פרק שכבר תוכנן.

‏ממשיכים את כל ה־Roadmap הקיים, ובמקביל:

```text
Existing roadmap
+ deeper practitioner layer
+ discovered topics
+ user-specific short-horizon application
= complete course
```

---

# ‏כלל 10 — הגדרת Done לקורס כולו

‏הקורס אינו נחשב שלם רק משום שכל המספרים ברשימה סומנו.

‏לפני סיום צריך לבצע Gap Review ולשאול:

- ‏האם חסר נושא Market Microstructure מהותי?
- ‏האם חסרה משפחת Orders או Execution tactics חשובה?
- ‏האם חסר ידע על prices/quotes/order book/routing/fills?
- ‏האם חסר Failure Mode משמעותי?
- ‏האם חסר כלי Research/Validation חשוב?
- ‏האם חסר ידע שמקצוען היה מצפה שמפעיל מערכת כזו יכיר?
- ‏האם כל ידע כללי חשוב תורגם גם למשמעות עבור הרובוט הקצר שלנו?

‏רק אחרי Gap Review כזה אפשר להחליט שהיקף הידע שתוכנן אכן הושלם.

---

# ‏משפט המחויבות

> ‏**לא נעצור ב־“איך לגרום לזה לעבוד”. נמשיך עד שנבין גם למה זה עובד, מתי זה מפסיק לעבוד, איך זה נשבר, איך מקצוענים מודדים את זה, ומה המשמעות המעשית לרובוט קצר־טווח שמנסה לשמור על Edge קטן אחרי כל העלויות והחיכוכים.**
