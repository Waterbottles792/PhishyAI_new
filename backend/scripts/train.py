"""
Model training script.

This script:
1. Loads the processed feature CSV
2. Trains all models (Naive Bayes, Logistic Regression, Random Forest, Gradient Boosting)
3. Prints evaluation metrics
4. Saves models and metrics to output directory
5. Generates and saves ROC curve data

Usage:
    python scripts/train.py --data data/processed/features.csv --output data/models/
"""

import argparse
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.trainer import ModelTrainer


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Train phishing detection models")
    parser.add_argument(
        "--data",
        "-d",
        type=str,
        required=True,
        help="Path to processed features CSV"
    )
    parser.add_argument(
        "--output",
        "-o",
        type=str,
        default="data/models",
        help="Directory to save trained models (default: data/models)"
    )

    args = parser.parse_args()

    # Check if data file exists
    if not Path(args.data).exists():
        print(f"Error: Data file not found: {args.data}")
        print("\nPlease run preprocessing first:")
        print("  python scripts/preprocess.py --input data/raw/your_dataset.csv")
        sys.exit(1)

    print("="*60)
    print("PhishGuard AI - Model Training")
    print("="*60)
    print(f"\nData: {args.data}")
    print(f"Output: {args.output}\n")

    # Initialize trainer
    trainer = ModelTrainer(data_path=args.data, output_dir=args.output)

    # Load and prepare data
    trainer.load_and_prepare_data()

    # Train all models
    print("\nStarting model training...")
    results = trainer.train_all()

    # Print final summary
    print("\n" + "="*60)
    print("Training Complete - Summary:")
    print("="*60)

    for model_name, metrics in results.items():
        print(f"\n{model_name.replace('_', ' ').title()}:")
        print(f"  Accuracy:  {metrics['accuracy']:.4f}")
        print(f"  Precision: {metrics['precision']:.4f}")
        print(f"  Recall:    {metrics['recall']:.4f}")
        print(f"  F1 Score:  {metrics['f1_score']:.4f}")
        print(f"  ROC AUC:   {metrics['roc_auc']:.4f}")

    # Find best model
    best_model = max(results.items(), key=lambda x: x[1]['f1_score'])
    print("\n" + "="*60)
    print(f"Best Model: {best_model[0].replace('_', ' ').title()}")
    print(f"F1 Score: {best_model[1]['f1_score']:.4f}")
    print("="*60)

    print(f"\nAll models saved to: {args.output}")
    print("\nYou can now start the API server:")
    print("  uvicorn app.main:app --reload")
    print("\n" + "="*60)


if __name__ == "__main__":
    main()
