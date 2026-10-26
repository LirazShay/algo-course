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

**Status:** `PLANNED`

‏נוסף בעקבות ההבנה ש־Ranking חיובי לבדו אינו מספיק להחלטת מסחר.

‏המנגנון צריך לפעול במקביל ל־Score/Ranking ולרכז Evidence שלילי שיכול:

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

‏הפרק יילמד **אחרי שלב 60 ולפני שלב 61**, ואז הקורס יחזור לסדר המקורי.
