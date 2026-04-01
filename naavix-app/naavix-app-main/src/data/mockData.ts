// Mock data for Telugu songs
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  isLiked?: boolean;
  // Optional fields populated by backend uploads
  ImageUrl?: string;
  FileUrl?: string;
  // For normalized songs (both local and external)
  image?: string;
  audioUrl?: string;
  source?: 'local' | 'external';
  _id?: string;
  genre?: string;
}

export interface Playlist {
  id: string;
  _id?: string;
  name: string;
  description: string;
  cover: string;
  songs: Song[];
  songCount: number;
  title?: string;
  ImageUrl?: string; // For backend uploads
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: string;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  cover: string;
  year: string;
  songs: Song[];
}

// Telugu Songs Data
// Sample audio URLs from public sources for demo purposes
const sampleAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const teluguSongs: Song[] = [
  {
    id: "1",
    title: "Buttabomma",
    artist: "Armaan Malik",
    album: "Ala Vaikunthapurramuloo",
    duration: "3:45",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "2",
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    album: "Ala Vaikunthapurramuloo",
    duration: "5:22",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "3",
    title: "Inkem Inkem Inkem Kaavaale",
    artist: "Sid Sriram",
    album: "Geetha Govindam",
    duration: "4:18",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "4",
    title: "Srivalli",
    artist: "Sid Sriram",
    album: "Pushpa",
    duration: "4:05",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "5",
    title: "Naatu Naatu",
    artist: "Rahul Sipligunj, Kaala Bhairava",
    album: "RRR",
    duration: "4:25",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "6",
    title: "Oo Antava",
    artist: "Indravathi Chauhan",
    album: "Pushpa",
    duration: "3:58",
    cover: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "7",
    title: "Butta Bomma",
    artist: "Armaan Malik",
    album: "Ala Vaikunthapurramuloo",
    duration: "3:45",
    cover: "https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "8",
    title: "Ramuloo Ramulaa",
    artist: "Anurag Kulkarni, Mangli",
    album: "Ala Vaikunthapurramuloo",
    duration: "4:12",
    cover: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "9",
    title: "Saranga Dariya",
    artist: "Mangli",
    album: "Love Story",
    duration: "4:30",
    cover: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "10",
    title: "Vachinde",
    artist: "Anirudh Ravichander",
    album: "Fidaa",
    duration: "4:02",
    cover: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "11",
    title: "Kurchi Madathapetti",
    artist: "Sri Krishna, Sahithi Chaganti",
    album: "Guntur Kaaram",
    duration: "3:48",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "12",
    title: "Ranjithame",
    artist: "Anirudh Ravichander",
    album: "Varisu",
    duration: "3:55",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "13",
    title: "Arabic Kuthu",
    artist: "Anirudh Ravichander",
    album: "Beast",
    duration: "4:10",
    cover: "https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
  {
    id: "14",
    title: "Kalavathi",
    artist: "Sid Sriram",
    album: "Sarkaru Vaari Paata",
    duration: "3:42",
    cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: false,
  },
  {
    id: "15",
    title: "Penny",
    artist: "Anurag Kulkarni",
    album: "Sarkaru Vaari Paata",
    duration: "3:35",
    cover: "https://images.unsplash.com/photo-1458560871784-56d23406c091?w=300&h=300&fit=crop",
    audioUrl: sampleAudioUrl,
    isLiked: true,
  },
];

// Playlists
export const playlists: Playlist[] = [
  {
    id: "1",
    name: "Telugu Top 50",
    description: "The hottest Telugu tracks right now",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    songs: teluguSongs.slice(0, 10),
    songCount: 50,
  },
  {
    id: "2",
    name: "Romantic Hits",
    description: "Love songs that touch your heart",
    cover: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    songs: teluguSongs.slice(2, 8),
    songCount: 35,
  },
  {
    id: "3",
    name: "Party Anthems",
    description: "Get the party started with these bangers",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    songs: teluguSongs.slice(4, 12),
    songCount: 28,
  },
  {
    id: "4",
    name: "Sid Sriram Specials",
    description: "Best of Sid Sriram's soulful voice",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    songs: teluguSongs.filter(s => s.artist.includes("Sid Sriram")),
    songCount: 42,
  },
  {
    id: "5",
    name: "Movie Hits 2024",
    description: "Fresh tracks from latest Telugu movies",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    songs: teluguSongs.slice(0, 6),
    songCount: 24,
  },
  {
    id: "6",
    name: "Workout Telugu",
    description: "High energy songs to fuel your workout",
    cover: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop",
    songs: teluguSongs.slice(5, 15),
    songCount: 30,
  },
];

// Artists
export const artists: Artist[] = [
  {
    id: "1",
    name: "Sid Sriram",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    followers: "15.2M",
  },
  {
    id: "2",
    name: "Armaan Malik",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    followers: "12.8M",
  },
  {
    id: "3",
    name: "Anirudh Ravichander",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    followers: "18.5M",
  },
  {
    id: "4",
    name: "Mangli",
    image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    followers: "5.8M",
  },
  {
    id: "5",
    name: "Thaman S",
    image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
    followers: "8.2M",
  },
  {
    id: "6",
    name: "Devi Sri Prasad",
    image: "https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop",
    followers: "11.4M",
  },
];

// Albums
export const albums: Album[] = [
  {
    id: "1",
    name: "Ala Vaikunthapurramuloo",
    artist: "Thaman S",
    cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    year: "2020",
    songs: teluguSongs.slice(0, 4),
  },
  {
    id: "2",
    name: "Pushpa",
    artist: "Devi Sri Prasad",
    cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
    year: "2021",
    songs: teluguSongs.slice(3, 7),
  },
  {
    id: "3",
    name: "RRR",
    artist: "M.M. Keeravani",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
    year: "2022",
    songs: teluguSongs.slice(4, 8),
  },
  {
    id: "4",
    name: "Geetha Govindam",
    artist: "Gopi Sundar",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    year: "2018",
    songs: teluguSongs.slice(2, 6),
  },
  {
    id: "5",
    name: "Guntur Kaaram",
    artist: "Thaman S",
    cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    year: "2024",
    songs: teluguSongs.slice(10, 14),
  },
];

// Genres
export const genres = [
  { id: "1", name: "Romantic", color: "from-pink-500 to-rose-500", image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop" },
  { id: "2", name: "Party", color: "from-orange-500 to-amber-500", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop" },
  { id: "3", name: "Classical", color: "from-purple-500 to-indigo-500", image: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop" },
  { id: "4", name: "Folk", color: "from-green-500 to-emerald-500", image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop" },
  { id: "5", name: "Devotional", color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop" },
  { id: "6", name: "Hip-Hop", color: "from-red-500 to-pink-500", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop" },
];
