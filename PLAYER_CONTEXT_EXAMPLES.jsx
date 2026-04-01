/**
 * Example Usage of PlayerContext
 * Shows how to use the new queue management system in React components
 */

import React from 'react';
import { usePlayer } from '../context/PlayerContext_with_queue';
import QueuePanel from '../components/QueuePanel_enhanced';
import '../styles/player-example.css';

// =====================================================
// EXAMPLE 1: Main Player Component
// =====================================================
export const PlayerExample = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    playNext,
    playPrevious,
    togglePlayPause,
    seek,
    setVolumeLevel,
    audioRef
  } = usePlayer();

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (!currentSong) {
    return (
      <div className="player-placeholder">
        <p>🎵 Select a song to start playing</p>
      </div>
    );
  }

  return (
    <div className="player-container">
      <div className="now-playing">
        <img 
          src={currentSong.image || 'https://via.placeholder.com/300'} 
          alt={currentSong.title}
          className="album-art"
        />
        <div className="song-details">
          <h2>{currentSong.title}</h2>
          <p>{currentSong.artist}</p>
          <p className="meta">{currentSong.album} • {currentSong.year}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <span className="time">{formatTime(currentTime)}</span>
        <input
          type="range"
          min="0"
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="progress-bar"
        />
        <span className="time">{formatTime(duration)}</span>
      </div>

      {/* Controls */}
      <div className="controls">
        <button onClick={playPrevious} title="Previous">⏮</button>
        <button 
          onClick={togglePlayPause} 
          className="play-btn"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button onClick={playNext} title="Next">⏭</button>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <span>🔊</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
          className="volume-slider"
        />
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={currentSong.url}
        crossOrigin="anonymous"
      />
    </div>
  );
};

// =====================================================
// EXAMPLE 2: Song Card Component
// =====================================================
export const SongCardExample = ({ song }) => {
  const { 
    currentSong, 
    playSong, 
    addToQueue,
    queue,
    isPlaying 
  } = usePlayer();

  const isCurrentSong = currentSong?._id === song._id;
  const isInQueue = queue.some(s => s._id === song._id);

  const handlePlay = () => {
    playSong(song);
  };

  const handleQueue = (e) => {
    e.stopPropagation();
    addToQueue(song);
  };

  return (
    <div 
      className={`song-card ${isCurrentSong ? 'active' : ''}`}
      onClick={handlePlay}
    >
      <div className="card-image">
        <img 
          src={song.image || 'https://via.placeholder.com/150'} 
          alt={song.title}
        />
        {isCurrentSong && isPlaying && (
          <div className="playing-indicator">▶</div>
        )}
        <button 
          className="queue-btn"
          onClick={handleQueue}
          title={isInQueue ? 'In Queue' : 'Add to Queue'}
        >
          {isInQueue ? '✓' : '+'}
        </button>
      </div>
      <div className="card-info">
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
      </div>
    </div>
  );
};

// =====================================================
// EXAMPLE 3: Playlist Component
// =====================================================
export const PlaylistExample = ({ songs = [] }) => {
  const { 
    currentSong, 
    playSong,
    isPlaying,
    addMultipleToQueue,
    queue
  } = usePlayer();

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], 0);
      // Optionally add rest to queue
      if (songs.length > 1) {
        addMultipleToQueue(songs.slice(1));
      }
    }
  };

  const handleAddAllToQueue = () => {
    addMultipleToQueue(songs);
  };

  return (
    <div className="playlist-container">
      <div className="playlist-header">
        <h2>Playlist</h2>
        <div className="playlist-actions">
          <button onClick={handlePlayAll} className="btn-primary">
            ▶ Play All
          </button>
          <button onClick={handleAddAllToQueue} className="btn-secondary">
            + Add All
          </button>
        </div>
      </div>

      <div className="playlist-songs">
        {songs.length === 0 ? (
          <p>No songs in playlist</p>
        ) : (
          songs.map((song, idx) => {
            const isCurrent = currentSong?._id === song._id;
            return (
              <div
                key={song._id}
                className={`playlist-item ${isCurrent ? 'active' : ''}`}
                onClick={() => playSong(song, idx)}
              >
                <span className="index">{idx + 1}</span>
                <img 
                  src={song.image || 'https://via.placeholder.com/40'} 
                  alt={song.title}
                />
                <div className="item-info">
                  <p className="title">{song.title}</p>
                  <p className="artist">{song.artist}</p>
                </div>
                {isCurrent && (
                  <span className="now-playing">
                    {isPlaying ? '🎵' : '⏸'}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// =====================================================
// EXAMPLE 4: Top-Level App Integration
// =====================================================
export const AppWithPlayerExample = () => {
  return (
    <div className="app-layout">
      <div className="main-content">
        <h1>My Music App</h1>
        <PlaylistExample songs={[
          { 
            _id: '1', 
            title: 'Song 1', 
            artist: 'Artist 1',
            image: 'https://via.placeholder.com/150'
          },
          // ... more songs
        ]} />
      </div>

      <div className="player-section">
        <PlayerExample />
      </div>

      <div className="queue-section">
        <QueuePanel isOpen={true} />
      </div>
    </div>
  );
};

// =====================================================
// EXAMPLE 5: Advanced - Custom Recommendation Hook
// =====================================================
export const usePlaylistWithRecommendations = (songs) => {
  const {
    playSong,
    addMultipleToQueue,
    recommendations,
    fetchRecommendations
  } = usePlayer();

  const playPlaylistWithRecommendations = async (startIndex = 0) => {
    if (songs.length === 0) return;

    // Play first song
    playSong(songs[startIndex], 0);

    // Add rest of playlist
    if (songs.length > 1) {
      addMultipleToQueue(songs.slice(startIndex + 1));
    }

    // Fetch recommendations for first song
    if (songs[startIndex]._id) {
      await fetchRecommendations(songs[startIndex]._id);
    }
  };

  return {
    playPlaylistWithRecommendations,
    recommendations,
    playSongCount: songs.length
  };
};

// Use the hook:
export const AdvancedPlaylistExample = ({ songs }) => {
  const {
    playPlaylistWithRecommendations,
    recommendations,
    playSongCount
  } = usePlaylistWithRecommendations(songs);

  return (
    <div>
      <button onClick={() => playPlaylistWithRecommendations()}>
        ▶ Play for You
      </button>
      <p>{playSongCount} songs • {recommendations.length} recommendations</p>
    </div>
  );
};

// =====================================================
// EXAMPLE 6: Search Component with Quick Play
// =====================================================
export const SearchExampleComponent = ({ searchResults = [] }) => {
  const { playSong, addToQueue, queue } = usePlayer();

  return (
    <div className="search-results">
      {searchResults.map((song) => {
        const inQueue = queue.some(s => s._id === song._id);

        return (
          <div key={song._id} className="search-result-item">
            <div onClick={() => playSong(song)}>
              <img src={song.image} alt={song.title} />
              <div>
                <h4>{song.title}</h4>
                <p>{song.artist}</p>
              </div>
            </div>
            <button 
              onClick={() => addToQueue(song)}
              className={inQueue ? 'in-queue' : ''}
            >
              {inQueue ? '✓ In Queue' : '+ Queue'}
            </button>
          </div>
        );
      })}
    </div>
  );
};

// =====================================================
// STYLES EXAMPLE
// =====================================================
const exampleStyles = `
.player-container {
  background: linear-gradient(135deg, #1a1a1a, #2d2d2d);
  padding: 20px;
  border-radius: 12px;
  color: white;
}

.now-playing {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.album-art {
  width: 150px;
  height: 150px;
  border-radius: 8px;
  object-fit: cover;
}

.song-details h2 {
  margin: 0;
  font-size: 1.5rem;
}

.song-details p {
  margin: 5px 0;
  color: #aaa;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.controls button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background: #4caf50;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
}

.controls button:hover {
  background: #45a049;
  transform: scale(1.1);
}

.play-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  appearance: none;
  background: #404040;
  outline: none;
  -webkit-appearance: none;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #4caf50;
  cursor: pointer;
}

.time {
  font-size: 0.85rem;
  min-width: 30px;
  color: #aaa;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-slider {
  width: 100px;
}

.song-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s;
}

.song-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.song-card.active {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid #4caf50;
}

.card-image {
  position: relative;
  margin-bottom: 10px;
}

.card-image img {
  width: 100%;
  border-radius: 4px;
  object-fit: cover;
}

.playing-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(76, 175, 80, 0.9);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.queue-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(76, 175, 80, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
}

.queue-btn:hover {
  background: #4caf50;
  transform: scale(1.1);
}
`;

export default exampleStyles;
