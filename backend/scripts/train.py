"""Train the credit risk model on the app-schema-mapped dataset and save artifacts."""
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.models.credit_risk_model import train_and_save

if __name__ == "__main__":
    results = train_and_save(
        output_dir="models",
        local_data_path="data/processed/applications.csv",
    )
    print(json.dumps(results, indent=2))
