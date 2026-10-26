# ‏Discovered Topics — נושאים שנוספו במהלך הקורס

> ‏מסמך זה הוא Registry של נושאים מהותיים שהתגלו במהלך הקורס ואינם צריכים להיעלם רק משום שלא הופיעו ב־Roadmap המקורי.

## ‏כלל עבודה

‏כל `Discovered Topic` שנרשם כאן חייב לקבל אחד משלושה סטטוסים:

```text
PLANNED
MERGED_INTO_EXISTING_CHAPTER
COMPLETED
```

‏אין למחוק נושא רק משום שה־Roadmap המקורי כבר התקדם מעבר לנקודה שבה הוא התגלה.

---

## ‏60A — `Negative Evidence, Veto and Disqualification Engine`

**Status:** `COMPLETED`

‏נוסף בעקבות ההבנה ש־Ranking חיובי לבדו אינו מספיק להחלטת מסחר.

‏המנגנון פועל במקביל ל־Score/Ranking ומרכז Evidence שלילי שיכול:

- ‏לפסול Candidate לחלוטין (`Hard Veto`).
- ‏להפחית אטרקטיביות (`Soft Penalty`).
- ‏להפעיל `Cooldown` או TTL לאחר אירוע שלילי.
- ‏לשמור `Negative Memory` רב־טווח: מילישניות, שניות, דקות ועד חלונות ארוכים יותר כאשר המחקר מצדיק זאת.
- ‏להפיק `Reason Codes` ברורים ולא Boolean סתום.
- ‏להבחין בין Safety/Data/Trading-Status/Execution/Liquidity/Signal/Recent-Behavior/Context vetoes.
- ‏להיות Point-in-Time Correct ולא ליצור leakage.
- ‏לעבור OOS validation, ablation ו־Decision Impact analysis כדי להימנע מ־Veto Overfitting.
- ‏להתחבר ל־`TRADE / NO TRADE` מבלי להפוך הכול ל־Score יחיד שמסתיר סיבת פסילה.

‏מבנה רעיוני:

```text
Positive Evidence Engine
→ Score / Rank

Negative Evidence Engine
→ Vetoes / Penalties / Cooldowns

Execution Feasibility
→ Entry / Exit / Costs / Fill / Latency

Decision Aggregator
→ TRADE / NO TRADE
```

‏הפרק הושלם ב־`60A-NEGATIVE-EVIDENCE-VETO-AND-DISQUALIFICATION-ENGINE.md`.

---

## ‏85A — `Market Conduct, Manipulation Prevention, Self-Trade Controls and Automated-Trading Compliance`

**Status:** `PLANNED`

**Completion Blocking:** `YES`

‏נוסף בעקבות `Final Course Gap Review` לאחר השלמת שלבים 1–85.

‏הביקורת מצאה שהקורס מכסה היטב Market Microstructure, Orders, Execution, Risk, Account Regulations ו־Operational Safety, ואף מסביר `Spoofing-like` patterns מנקודת מבט של קריאת השוק — אבל חסרה שכבה עצמאית שעוסקת בהתנהגות שהרובוט עצמו מייצר וב־Market Conduct controls.

‏הפרק החדש חייב לעסוק ב־Prevention, Governance, Detection ו־Auditability — לא בהוראות לביצוע מניפולציה.

‏נושאי חובה:

- ‏legitimate order management מול deceptive order behavior.
- ‏`Spoofing` / `Layering` ברמת איסור, זיהוי ומניעה.
- ‏`Wash Trading` / non-bona-fide trading ברמת compliance.
- ‏`Self-Trade` / `Self-Match` prevention.
- ‏duplicate strategy instances שעלולים לפגוש זה את זה.
- ‏conflicts בין Entry, Exit, Replacement, Retry ו־Recovery orders.
- ‏auction-related conduct concepts כגון marking open/close ברמת מניעה.
- ‏`Momentum Ignition` כקטגוריית conduct risk ברמת זיהוי ואיסור בלבד.
- ‏cancel/order behavior כ־surveillance signal בלי לקבע threshold אוניברסלי.
- ‏pre-trade compliance vetoes.
- ‏post-trade surveillance metrics.
- ‏Reason Codes ו־audit trail ל־compliance decisions.
- ‏Self-Trade Prevention capabilities של broker/venue כאשר קיימות.
- ‏safe retry/idempotency כדי למנוע conduct issues מתקלות.
- ‏isolation בין Test/Paper/Live.
- ‏manual-vs-automated order conflict detection.
- ‏versioned regulatory/broker references עם מקורות רשמיים ועדכניים.
- ‏Compliance incidents כחלק מ־RCA ו־Incident Packets.
- ‏`ComplianceMode` שיכול לחסום New Risk תוך שמירה על יכולת להקטין Exposure.
- ‏Golden scenarios ו־fault tests ל־self-trade / duplicate-order prevention.

‏הנושא מתועד גם ב־`00-FINAL-COURSE-GAP-REVIEW.md`.

‏הקורס הרגיל אינו נחשב Complete עד שהנושא הזה הושלם ואומת.
