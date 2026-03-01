"""
Data preprocessing script.

This script:
1. Loads raw email dataset (CSV with columns: 'text' or 'Email Text', 'label' or 'Email Type')
2. Cleans text (remove HTML tags, normalize whitespace)
3. Runs FeatureExtractor on every email
4. Outputs data/processed/features.csv with all features + label column
5. Prints dataset statistics

Usage:
    python scripts/preprocess.py --input data/raw/emails.csv --output data/processed/features.csv
"""

import argparse
import sys
from pathlib import Path
import pandas as pd
import re
from tqdm import tqdm

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.features import FeatureExtractor


def clean_text(text: str) -> str:
    """Clean email text."""
    if not isinstance(text, str):
        return ""

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Normalize whitespace
    text = re.sub(r'\s+', ' ', text)

    # Strip leading/trailing whitespace
    text = text.strip()

    return text


def parse_label(label_value) -> int:
    """
    Parse label to binary 0/1.

    Args:
        label_value: Label from dataset (can be 0/1, "Phishing"/"Safe", etc.)

    Returns:
        0 for legitimate, 1 for phishing
    """
    if isinstance(label_value, (int, float)):
        return int(label_value)

    label_str = str(label_value).lower().strip()

    # Phishing indicators
    if any(word in label_str for word in ['phish', 'spam', 'fraud', 'scam', '1']):
        return 1

    # Legitimate indicators
    if any(word in label_str for word in ['safe', 'ham', 'legit', 'legitimate', '0']):
        return 0

    # Default to legitimate if unclear
    print(f"Warning: Unknown label '{label_value}', defaulting to 0 (legitimate)")
    return 0


def preprocess_dataset(input_path: str, output_path: str):
    """
    Preprocess email dataset and extract features.

    Args:
        input_path: Path to raw CSV file
        output_path: Path to save processed CSV
    """
    print("="*60)
    print("PhishGuard AI - Data Preprocessing")
    print("="*60)

    # Load dataset
    print(f"\n1. Loading dataset from {input_path}...")
    try:
        df = pd.read_csv(input_path)
        print(f"   Loaded {len(df)} emails")
        print(f"   Columns: {df.columns.tolist()}")
    except Exception as e:
        print(f"Error loading dataset: {e}")
        sys.exit(1)

    # Identify text and label columns
    text_column = None
    label_column = None

    for col in df.columns:
        col_lower = col.lower()
        if any(keyword in col_lower for keyword in ['text', 'body', 'content', 'message', 'email']):
            text_column = col
        if any(keyword in col_lower for keyword in ['label', 'type', 'class', 'category']):
            label_column = col

    if text_column is None:
        print("Error: Could not find text column. Please ensure your CSV has a column with 'text', 'body', or 'email' in the name.")
        sys.exit(1)

    if label_column is None:
        print("Error: Could not find label column. Please ensure your CSV has a column with 'label', 'type', or 'class' in the name.")
        sys.exit(1)

    print(f"   Using text column: {text_column}")
    print(f"   Using label column: {label_column}")

    # Clean text
    print("\n2. Cleaning text...")
    df['cleaned_text'] = df[text_column].apply(clean_text)

    # Remove empty texts
    initial_count = len(df)
    df = df[df['cleaned_text'].str.len() > 0]
    print(f"   Removed {initial_count - len(df)} empty emails")

    # Parse labels
    print("\n3. Parsing labels...")
    df['label'] = df[label_column].apply(parse_label)

    # Print label distribution
    label_counts = df['label'].value_counts()
    print(f"   Label distribution:")
    print(f"     Legitimate (0): {label_counts.get(0, 0)} ({label_counts.get(0, 0)/len(df)*100:.1f}%)")
    print(f"     Phishing (1):   {label_counts.get(1, 0)} ({label_counts.get(1, 0)/len(df)*100:.1f}%)")

    # Extract features
    print("\n4. Extracting features...")
    extractor = FeatureExtractor()
    features_list = []

    for idx, row in tqdm(df.iterrows(), total=len(df), desc="   Processing emails"):
        try:
            # For simplicity, we'll treat the entire text as body
            # In a real scenario, you might want to separate subject from body
            features = extractor.extract(subject="", body=row['cleaned_text'])
            features_dict = features.to_dict()
            features_dict['label'] = row['label']
            features_list.append(features_dict)
        except Exception as e:
            print(f"\n   Warning: Error processing email {idx}: {e}")
            continue

    # Create features dataframe
    features_df = pd.DataFrame(features_list)
    print(f"\n   Extracted {len(features_df.columns)-1} features from {len(features_df)} emails")

    # Save to CSV
    print(f"\n5. Saving processed dataset to {output_path}...")
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    features_df.to_csv(output_path, index=False)
    print(f"   Saved successfully!")

    # Print summary statistics
    print("\n" + "="*60)
    print("Dataset Summary:")
    print("="*60)
    print(f"Total emails:      {len(features_df)}")
    print(f"Total features:    {len(features_df.columns)-1}")
    print(f"Legitimate:        {(features_df['label']==0).sum()}")
    print(f"Phishing:          {(features_df['label']==1).sum()}")
    print(f"\nOutput saved to:   {output_path}")
    print("="*60)


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Preprocess email dataset and extract features")
    parser.add_argument(
        "--input",
        "-i",
        type=str,
        required=True,
        help="Path to raw email dataset CSV"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/processed/features.csv",
        help="Path to save processed features CSV (default: data/processed/features.csv)"
    )

    args = parser.parse_args()

    preprocess_dataset(args.input, args.output)


if __name__ == "__main__":
    main()
