"""
Preprocess the CEAS_08.csv dataset for PhishGuard AI.
- Loads the real-world CEAS 2008 phishing email dataset
- Cleans text, balances classes
- Extracts features using the existing pipeline
- Outputs features.csv for model training
"""

import sys
import os
import argparse
import pandas as pd
import numpy as np
from pathlib import Path

# Add parent dir to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.features.extractor import FeatureExtractor


def main():
    parser = argparse.ArgumentParser(description="Preprocess CEAS_08 dataset")
    parser.add_argument("--input", default="../CEAS_08.csv", help="Path to CEAS_08.csv")
    parser.add_argument("--output", default="data/processed/features.csv", help="Output features CSV")
    parser.add_argument("--max-samples", type=int, default=4000, help="Max samples per class (for speed)")
    args = parser.parse_args()

    print("=" * 60)
    print("PhishGuard AI - CEAS_08 Dataset Preprocessing")
    print("=" * 60)

    # 1. Load dataset
    print(f"\n1. Loading dataset from {args.input}...")
    df = pd.read_csv(args.input, usecols=["subject", "body", "label"])
    print(f"   Loaded {len(df)} emails")
    print(f"   Label distribution:")
    print(f"     Legitimate (0): {(df['label'] == 0).sum()}")
    print(f"     Phishing (1):   {(df['label'] == 1).sum()}")

    # 2. Clean
    print("\n2. Cleaning data...")
    df["subject"] = df["subject"].fillna("").astype(str)
    df["body"] = df["body"].fillna("").astype(str)

    # Drop rows with empty body
    df = df[df["body"].str.strip().str.len() > 10].copy()
    print(f"   After cleaning: {len(df)} emails")

    # 3. Balance and sample
    print(f"\n3. Balancing classes (max {args.max_samples} per class)...")
    phishing = df[df["label"] == 1]
    legitimate = df[df["label"] == 0]

    n_samples = min(args.max_samples, len(phishing), len(legitimate))
    phishing_sample = phishing.sample(n=n_samples, random_state=42)
    legitimate_sample = legitimate.sample(n=n_samples, random_state=42)

    df_balanced = pd.concat([phishing_sample, legitimate_sample]).sample(frac=1, random_state=42).reset_index(drop=True)
    print(f"   Balanced dataset: {len(df_balanced)} emails ({n_samples} per class)")

    # 4. Extract features
    print(f"\n4. Extracting features...")
    extractor = FeatureExtractor()
    features_list = []
    errors = 0

    for i, row in df_balanced.iterrows():
        try:
            subject = str(row["subject"])[:500]
            body = str(row["body"])[:3000]  # Limit body length for speed
            features = extractor.extract(subject, body)
            feat_dict = features.to_dict()
            feat_dict["label"] = row["label"]
            features_list.append(feat_dict)
        except Exception as e:
            errors += 1
            if errors <= 3:
                print(f"   Warning: Error on row {i}: {e}")

        if (len(features_list)) % 500 == 0:
            print(f"   Processed {len(features_list)}/{len(df_balanced)} emails...")

    print(f"   Extracted features from {len(features_list)} emails ({errors} errors)")

    # 5. Save
    print(f"\n5. Saving to {args.output}...")
    features_df = pd.DataFrame(features_list)
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    features_df.to_csv(args.output, index=False)
    print(f"   Saved {len(features_df)} rows x {len(features_df.columns)} columns")

    # 6. Summary
    print("\n" + "=" * 60)
    print("Dataset Summary:")
    print("=" * 60)
    print(f"Total emails:      {len(features_df)}")
    print(f"Total features:    {len(features_df.columns) - 1}")
    print(f"Legitimate:        {(features_df['label'] == 0).sum()}")
    print(f"Phishing:          {(features_df['label'] == 1).sum()}")
    print(f"\nOutput saved to:   {args.output}")
    print("=" * 60)
    print(f"\nNext: python scripts/train.py --data {args.output} --output data/models")
    print("=" * 60)


if __name__ == "__main__":
    main()
