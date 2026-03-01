"""Model metrics and comparison endpoints."""

from fastapi import APIRouter, HTTPException
from typing import List, Dict

from ..schemas.response import ModelMetrics
from ..models.model_registry import model_registry

router = APIRouter()


@router.get("/models", response_model=List[ModelMetrics])
async def get_all_models():
    """
    Get metrics for all available models.

    Returns:
        List of model metrics
    """
    try:
        all_metrics = model_registry.get_all_metrics()

        if not all_metrics:
            raise HTTPException(
                status_code=404,
                detail="No trained models found. Please train models first using scripts/train.py"
            )

        models_list = []
        for model_name, metrics in all_metrics.items():
            models_list.append(ModelMetrics(**metrics))

        return models_list

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving models: {str(e)}")


@router.get("/models/{model_name}", response_model=ModelMetrics)
async def get_model_metrics(model_name: str):
    """
    Get metrics for a specific model.

    Args:
        model_name: Name of the model

    Returns:
        Model metrics
    """
    try:
        metrics = model_registry.get_metrics(model_name)

        if not metrics:
            raise HTTPException(
                status_code=404,
                detail=f"Model '{model_name}' not found. Available models: {model_registry.list_models()}"
            )

        return ModelMetrics(**metrics)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving model metrics: {str(e)}")


@router.get("/models/list/names")
async def list_model_names():
    """
    Get list of available model names.

    Returns:
        List of model names
    """
    return {
        "models": model_registry.list_models(),
        "default_model": model_registry.model_dir.parent.parent / "app" / "config.py" # placeholder
    }
