/**
 * Queue Panel Component
 * Displays current queue and recommendations
 * Allows drag-and-drop reordering and queue management
 */

import React from 'react';
import { usePlayer } from '../context/PlayerContext_with_queue';
import '../styles/QueuePanel.css';

const QueuePanel = ({ isOpen = true }) => {
  const {
    queue,
    queueIndex,
    recommendations,
    autoplayEnabled,
    isLoadingRecommendations,
    currentSong,
    playSong,
    removeFromQueue,
    moveInQueue,
    setAutoplayEnabled,
    appendRecommendationsToQueue
  } = usePlayer();

  const handleQueueItemClick = (song, index) => {
    playSong(song, index);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    if (sourceIndex !== targetIndex) {
      moveInQueue(sourceIndex, targetIndex);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <h3>🎵 Queue</h3>
        <div className="queue-controls">
          <label className="autoplay-toggle">
            <input
              type="checkbox"
              checked={autoplayEnabled}
              onChange={(e) => setAutoplayEnabled(e.target.checked)}
            />
            <span>Autoplay</span>
          </label>
        </div>
      </div>

      {/* Current Song */}
      {currentSong && (
        <div className="current-song-section">
          <h4>Now Playing</h4>
          <div className="current-song">
            <img
              src={currentSong.image || 'https://via.placeholder.com/50'}
              alt={currentSong.title}
            />
            <div className="song-info">
              <p className="title">{currentSong.title}</p>
              <p className="artist">{currentSong.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Queue */}
      <div className="queue-section">
        <h4>Queue ({queue.length} songs)</h4>
        <div className="queue-list">
          {queue.length === 0 ? (
            <p className="empty-queue">Queue is empty. Add songs to get started!</p>
          ) : (
            queue.map((song, index) => (
              <div
                key={`${song._id}-${index}`}
                className={`queue-item ${index === queueIndex ? 'active' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleQueueItemClick(song, index)}
              >
                <div className="queue-item-number">{index + 1}</div>
                <img
                  src={song.image || 'https://via.placeholder.com/40'}
                  alt={song.title}
                  className="queue-item-image"
                />
                <div className="queue-item-info">
                  <p className="title">{song.title}</p>
                  <p className="artist">{song.artist}</p>
                  {song.isRecommendation && (
                    <p className="reason">
                      💡 {song.reason}
                    </p>
                  )}
                </div>
                <button
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromQueue(index);
                  }}
                  title="Remove from queue"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recommendations */}
      {autoplayEnabled && (
        <div className="recommendations-section">
          <h4>
            📊 Recommendations
            {isLoadingRecommendations && <span className="loading">Loading...</span>}
          </h4>
          {recommendations.length > 0 ? (
            <div className="recommendations-list">
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec._id}-${index}`}
                  className="recommendation-item"
                  onClick={() => appendRecommendationsToQueue([rec])}
                  title="Click to add to queue"
                >
                  <img
                    src={rec.image || 'https://via.placeholder.com/40'}
                    alt={rec.title}
                  />
                  <div className="rec-info">
                    <p className="title">{rec.title}</p>
                    <p className="artist">{rec.artist}</p>
                    <p className="reason">
                      {rec.recommendation_reason}
                    </p>
                  </div>
                  <span className="similarity-score">
                    {(rec.similarity_score * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          ) : isLoadingRecommendations ? (
            <p className="loading-recs">Fetching recommendations...</p>
          ) : (
            <p className="no-recs">No recommendations yet. Play a song first!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default QueuePanel;
