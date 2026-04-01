"""
Export Notebook Model to Deployable Format
Run this after training your GNN model in the notebook
Converts notebook artifacts to production-ready format
"""

import pandas as pd
import torch
import numpy as np
import joblib
from pathlib import Path
from sklearn.preprocessing import LabelEncoder, StandardScaler
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def export_model_from_notebook(
    model_state_dict,
    embeddings: np.ndarray,
    df: pd.DataFrame,
    song_to_id: dict,
    id_to_song: dict,
    encoders: dict,
    scaler,
    input_dim: int,
    output_dir: str = "model"
) -> None:
    """
    Export trained GNN model to deployable format
    
    Args:
        model_state_dict: PyTorch model state dict
        embeddings: Pre-computed GNN embeddings
        df: Songs dataframe
        song_to_id: Song name to ID mapping
        id_to_song: ID to song name mapping
        encoders: Dict of label encoders
        scaler: StandardScaler for features
        input_dim: Input dimension for model
        output_dir: Output directory for model files
    """
    try:
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)
        
        model_path = output_path / "gnn_model.pth"
        artifacts_path = output_path / "artifacts.pkl"
        
        # Save model weights
        torch.save(model_state_dict, model_path)
        logger.info(f"✅ Model saved to {model_path}")
        
        # Save artifacts
        artifacts = {
            "embeddings": embeddings,
            "df": df,
            "song_to_id": song_to_id,
            "id_to_song": id_to_song,
            "encoders": encoders,
            "scaler": scaler,
            "features_dim": input_dim
        }
        joblib.dump(artifacts, artifacts_path)
        logger.info(f"✅ Artifacts saved to {artifacts_path}")
        
        logger.info(f"\n📊 Model Statistics:")
        logger.info(f"   - Total songs: {len(df)}")
        logger.info(f"   - Embedding dimension: {embeddings.shape[1]}")
        logger.info(f"   - Model saved successfully!")
        logger.info(f"\n✨ Ready for deployment!")
        
    except Exception as e:
        logger.error(f"❌ Error exporting model: {str(e)}")
        raise


# ===== HOW TO USE IN NOTEBOOK =====
"""
# After training your GNN model, run this:

from export_model import export_model_from_notebook

export_model_from_notebook(
    model_state_dict=model.state_dict(),
    embeddings=embeddings,
    df=df,
    song_to_id=song_to_id,
    id_to_song=id_to_song,
    encoders={
        "singer": singer_encoder,
        "artist": artist_encoder,
        "album": album_encoder,
        "genre": genre_encoder
    },
    scaler=scaler,
    input_dim=x.shape[1],
    output_dir="model"
)
"""
