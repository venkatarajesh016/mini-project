"""
Model Loader - Handles GNN model initialization and artifact loading
Loads pre-trained model, embeddings, and necessary mappings for inference
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv
import numpy as np
import joblib
import pandas as pd
from pathlib import Path
from typing import Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class MusicGNN(nn.Module):
    """Graph Neural Network for music recommendations"""
    
    def __init__(self, input_dim: int, hidden_dim: int = 128, output_dim: int = 64):
        super().__init__()
        self.conv1 = SAGEConv(input_dim, hidden_dim)
        self.conv2 = SAGEConv(hidden_dim, hidden_dim)
        self.conv3 = SAGEConv(hidden_dim, output_dim)
        self.bn1 = nn.BatchNorm1d(hidden_dim)
        self.bn2 = nn.BatchNorm1d(hidden_dim)
        self.dropout = nn.Dropout(p=0.2)

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        x = self.conv1(x, edge_index)
        x = self.bn1(x)
        x = F.relu(x)
        x = self.dropout(x)
        
        x = self.conv2(x, edge_index)
        x = self.bn2(x)
        x = F.relu(x)
        x = self.dropout(x)
        
        x = self.conv3(x, edge_index)
        x = F.normalize(x, p=2, dim=1)
        return x


class ModelArtifacts:
    """Container for all model-related artifacts"""
    
    def __init__(
        self,
        model: MusicGNN,
        embeddings: np.ndarray,
        df: pd.DataFrame,
        song_to_id: Dict[str, int],
        id_to_song: Dict[int, str],
        encoders: Dict,
        scaler
    ):
        self.model = model
        self.embeddings = embeddings
        self.df = df
        self.song_to_id = song_to_id
        self.id_to_song = id_to_song
        self.encoders = encoders
        self.scaler = scaler


class GNNModelLoader:
    """Loads and manages GNN model artifacts"""
    
    def __init__(self, model_dir: str = "model"):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(exist_ok=True)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
    
    def load_artifacts(self) -> Optional[ModelArtifacts]:
        """
        Load all model artifacts
        Returns ModelArtifacts object or None if files don't exist
        """
        try:
            model_path = self.model_dir / "gnn_model.pth"
            artifacts_path = self.model_dir / "artifacts.pkl"
            
            if not model_path.exists() or not artifacts_path.exists():
                logger.warning(f"Model files not found in {self.model_dir}")
                return None
            
            # Load artifacts (df, embeddings, mappings, encoders, scaler)
            artifacts = joblib.load(artifacts_path)
            
            # Recreate model and load weights
            input_dim = artifacts["features_dim"]
            model = MusicGNN(input_dim=input_dim)
            model.load_state_dict(torch.load(model_path, map_location=self.device))
            model.to(self.device)
            model.eval()
            
            # Create ModelArtifacts object
            model_artifacts = ModelArtifacts(
                model=model,
                embeddings=artifacts["embeddings"],
                df=artifacts["df"],
                song_to_id=artifacts["song_to_id"],
                id_to_song=artifacts["id_to_song"],
                encoders=artifacts["encoders"],
                scaler=artifacts["scaler"]
            )
            
            logger.info("✅ Model artifacts loaded successfully")
            return model_artifacts
            
        except Exception as e:
            logger.error(f"Error loading model artifacts: {str(e)}")
            raise
    
    def save_artifacts(
        self,
        model: MusicGNN,
        embeddings: np.ndarray,
        df: pd.DataFrame,
        song_to_id: Dict[str, int],
        id_to_song: Dict[int, str],
        encoders: Dict,
        scaler,
        features_dim: int
    ) -> None:
        """Save model state and artifacts"""
        try:
            model_path = self.model_dir / "gnn_model.pth"
            artifacts_path = self.model_dir / "artifacts.pkl"
            
            # Save model weights
            torch.save(model.state_dict(), model_path)
            
            # Save other artifacts
            artifacts = {
                "embeddings": embeddings,
                "df": df,
                "song_to_id": song_to_id,
                "id_to_song": id_to_song,
                "encoders": encoders,
                "scaler": scaler,
                "features_dim": features_dim
            }
            joblib.dump(artifacts, artifacts_path)
            
            logger.info(f"✅ Model artifacts saved to {self.model_dir}")
            
        except Exception as e:
            logger.error(f"Error saving model artifacts: {str(e)}")
            raise


# Global model instance
_model_artifacts: Optional[ModelArtifacts] = None


def get_model_instance() -> Optional[ModelArtifacts]:
    """Get or load the global model instance (lazy loading)"""
    global _model_artifacts
    if _model_artifacts is None:
        loader = GNNModelLoader()
        _model_artifacts = loader.load_artifacts()
    return _model_artifacts


def initialize_model(model_dir: str = "model") -> ModelArtifacts:
    """Initialize model on app startup"""
    global _model_artifacts
    loader = GNNModelLoader(model_dir=model_dir)
    _model_artifacts = loader.load_artifacts()
    if _model_artifacts is None:
        raise RuntimeError("Failed to load model artifacts")
    return _model_artifacts