"""Map the raw German Credit dataset (UCI schema: checking_status, duration, credit_history, ...)
onto this app's actual application schema (credit_score, annual_income, debt_to_income, ...) so the
trained model's feature space matches what the API/UI actually collect and submit.

The raw dataset's categorical/ordinal fields don't correspond 1:1 to the app's numeric fields, so we
first fit a simple logistic regression on the raw one-hot encoded attributes to recover a data-driven
"risk index" (probability of the original `bad` label) for every row. That index is then used to
parametrize realistic-looking values for credit_score, debt_to_income, payment_history_percent, etc,
with a bit of Gaussian/Poisson jitter so the mapping isn't perfectly deterministic. This keeps the
derived numeric fields correlated with the true label the way they would be in a real bureau dataset.
"""
import os

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import OneHotEncoder

RNG = np.random.default_rng(42)

RAW_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "german_credit.csv")
OUT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "applications.csv")

JOB_INCOME_BASE = {
    "unskilled resident": 22000,
    "unemp/unskilled non res": 15000,
    "skilled": 42000,
    "high qualif/self emp/mgmt": 78000,
}
EMPLOYMENT_MONTHS = {
    "unemployed": 0,
    "<1": 6,
    "1<=X<4": 30,
    "4<=X<7": 66,
    ">=7": 132,
}


def fit_risk_index(df: pd.DataFrame) -> np.ndarray:
    """Fit an in-sample logistic regression on the raw attributes to recover a continuous,
    data-driven probability-of-bad for every row (used only to parametrize synthetic fields,
    not as the final model)."""
    y = (df["target"] == "bad").astype(int)
    cat_cols = [
        c for c in df.columns if not pd.api.types.is_numeric_dtype(df[c]) and c != "target"
    ]
    num_cols = [c for c in df.columns if c not in cat_cols and c != "target"]

    enc = OneHotEncoder(handle_unknown="ignore", sparse_output=False)
    X_cat = enc.fit_transform(df[cat_cols])
    X_num = df[num_cols].to_numpy(dtype=float)
    X_num = (X_num - X_num.mean(axis=0)) / X_num.std(axis=0)
    X = np.hstack([X_num, X_cat])

    clf = LogisticRegression(max_iter=2000, C=1.0)
    clf.fit(X, y)
    return clf.predict_proba(X)[:, 1]


def map_row(row: pd.Series, p_hat: float) -> dict:
    noise = lambda scale: RNG.normal(0, scale)

    credit_score = int(np.clip(840 - p_hat * 560 + noise(20), 300, 850))
    debt_to_income = float(np.clip(0.12 + p_hat * 0.55 + noise(0.04), 0.03, 0.95))
    payment_history = float(np.clip(0.98 - p_hat * 0.55 + noise(0.03), 0.30, 1.0))
    utilization = float(np.clip(0.08 + p_hat * 0.80 + noise(0.05), 0.0, 1.0))
    derog = int(RNG.poisson(max(p_hat * 4, 0.01)))
    hard_inquiries = int(RNG.poisson(max(p_hat * 3, 0.01)))
    total_accounts = max(1, int(round(row["existing_credits"] * 2 + RNG.poisson(1.5))))
    oldest_account_years = max(
        0.5, round(row["residence_since"] * 2.2 - p_hat * 3 + noise(1.2), 1)
    )

    job_base = JOB_INCOME_BASE[row["job"]]
    annual_income = max(
        12000.0,
        job_base + (row["age"] - 30) * 400 - p_hat * job_base * 0.35 + noise(job_base * 0.15),
    )
    employment_length_months = max(
        0, int(round(EMPLOYMENT_MONTHS[row["employment"]] - p_hat * 24 + noise(8)))
    )

    monthly_debt_payments = round((debt_to_income * annual_income) / 12.0, 2)
    requested_amount = float(row["credit_amount"])

    return {
        "requested_amount": round(requested_amount, 2),
        "purpose": row["purpose"],
        "credit_score": credit_score,
        "credit_utilization": round(utilization, 4),
        "payment_history_percent": round(payment_history, 4),
        "derogatory_marks": derog,
        "hard_inquiries": hard_inquiries,
        "total_accounts": total_accounts,
        "oldest_account_years": oldest_account_years,
        "annual_income": round(annual_income, 2),
        "employment_length_months": employment_length_months,
        "debt_to_income": round(debt_to_income, 4),
        "monthly_debt_payments": monthly_debt_payments,
        "target": row["target"],
    }


def main():
    df = pd.read_csv(RAW_PATH)
    p_hats = fit_risk_index(df)
    mapped = pd.DataFrame(
        [map_row(row, p_hats[i]) for i, (_, row) in enumerate(df.iterrows())]
    )
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    mapped.to_csv(OUT_PATH, index=False)
    print(f"Wrote {len(mapped)} rows to {OUT_PATH}")
    print(
        mapped.groupby("target")[
            ["credit_score", "debt_to_income", "payment_history_percent", "annual_income"]
        ].mean()
    )


if __name__ == "__main__":
    main()
