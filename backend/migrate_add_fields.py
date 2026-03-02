"""
Migration script to add credit report and income data fields to existing database.
Run this once to update your existing database schema.
"""
import sqlite3
import os

DB_PATH = "dev.db"

if not os.path.exists(DB_PATH):
    print(f"Database {DB_PATH} not found. Skipping migration.")
    exit(0)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# List of columns to add (if they don't exist)
columns_to_add = [
    ("credit_score", "INTEGER"),
    ("credit_utilization", "NUMERIC(5, 4)"),
    ("payment_history_percent", "NUMERIC(5, 4)"),
    ("derogatory_marks", "INTEGER DEFAULT 0"),
    ("hard_inquiries", "INTEGER DEFAULT 0"),
    ("total_accounts", "INTEGER"),
    ("oldest_account_years", "NUMERIC(5, 2)"),
    ("annual_income", "NUMERIC(12, 2)"),
    ("employment_length_months", "INTEGER"),
    ("debt_to_income", "NUMERIC(5, 4)"),
    ("monthly_debt_payments", "NUMERIC(10, 2)"),
]

print("Migrating database schema...")
for col_name, col_type in columns_to_add:
    try:
        # Check if column already exists
        cursor.execute(f"PRAGMA table_info(applications)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if col_name not in columns:
            cursor.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type}")
            print(f"  ✓ Added column: {col_name}")
        else:
            print(f"  - Column {col_name} already exists, skipping")
    except Exception as e:
        print(f"  ✗ Error adding column {col_name}: {e}")

conn.commit()
conn.close()
print("\nMigration completed!")

