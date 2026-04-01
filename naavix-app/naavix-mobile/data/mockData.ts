export interface Song {
    id: string;
    title: string;
    artist: string;
    album: string;
    duration: string;
    cover: string;
    audioUrl?: string;
    isLiked?: boolean;
    // For local database songs
    FileUrl?: string;
}

export interface Playlist {
    id: string;
    name: string;
    description: string;
    cover: string;
    songs: Song[];
    songCount: number;
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

export const teluguSongs: Song[] = [
    // 2024 Recent Releases
    { id: '11', title: 'Kurchi Madathapetti', artist: 'Sri Krishna, Sahithi Chaganti', album: 'Guntur Kaaram', duration: '3:48', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', isLiked: true },
    { id: '12', title: 'Ranjithame', artist: 'Anirudh Ravichander', album: 'Varisu', duration: '3:55', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', isLiked: false },
    { id: '13', title: 'Arabic Kuthu', artist: 'Anirudh Ravichander', album: 'Beast', duration: '4:10', cover: 'https://images.unsplash.com/photo-1484755560615-a4c64e778a6c?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', isLiked: true },
    { id: '14', title: 'Kalavathi', artist: 'Sid Sriram', album: 'Sarkaru Vaari Paata', duration: '3:42', cover: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', isLiked: false },
    { id: '15', title: 'Penny', artist: 'Anurag Kulkarni', album: 'Sarkaru Vaari Paata', duration: '3:35', cover: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', isLiked: true },
    // 2022 Blockbuster
    { id: '5', title: 'Naatu Naatu', artist: 'Rahul Sipligunj, Kaala Bhairava', album: 'RRR', duration: '4:25', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', isLiked: true },
    // 2021 Popular Release
    { id: '4', title: 'Srivalli', artist: 'Sid Sriram', album: 'Pushpa', duration: '4:05', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', isLiked: true },
    { id: '6', title: 'Oo Antava', artist: 'Indravathi Chauhan', album: 'Pushpa', duration: '3:58', cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', isLiked: false },
    // 2020 Blockbuster Hits
    { id: '1', title: 'Buttabomma', artist: 'Armaan Malik', album: 'Ala Vaikunthapurramuloo', duration: '3:45', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', isLiked: true },
    { id: '2', title: 'Samajavaragamana', artist: 'Sid Sriram', album: 'Ala Vaikunthapurramuloo', duration: '5:22', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', isLiked: true },
    { id: '3', title: 'Inkem Inkem Inkem Kaavaale', artist: 'Sid Sriram', album: 'Geetha Govindam', duration: '4:18', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', isLiked: false },
    { id: '7', title: 'Butta Bomma', artist: 'Armaan Malik', album: 'Ala Vaikunthapurramuloo', duration: '3:45', cover: 'https://images.unsplash.com/photo-1526142684086-7ebd69df27a5?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', isLiked: false },
    { id: '8', title: 'Ramuloo Ramulaa', artist: 'Anurag Kulkarni, Mangli', album: 'Ala Vaikunthapurramuloo', duration: '4:12', cover: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', isLiked: true },
    { id: '9', title: 'Saranga Dariya', artist: 'Mangli', album: 'Love Story', duration: '4:30', cover: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', isLiked: true },
    { id: '10', title: 'Vachinde', artist: 'Anirudh Ravichander', album: 'Fidaa', duration: '4:02', cover: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', isLiked: false },
];

export const playlists: Playlist[] = [
    { id: '1', name: 'Telugu Top 50', description: 'The hottest Telugu tracks right now', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', songs: teluguSongs.slice(0, 10), songCount: 50 },
    { id: '2', name: 'Romantic Hits', description: 'Love songs that touch your heart', cover: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop', songs: teluguSongs.slice(2, 8), songCount: 35 },
    { id: '3', name: 'Party Anthems', description: 'Get the party started with these bangers', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', songs: teluguSongs.slice(4, 12), songCount: 28 },
    { id: '4', name: 'Sid Sriram Specials', description: "Best of Sid Sriram's soulful voice", cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', songs: teluguSongs.filter(s => s.artist.includes('Sid Sriram')), songCount: 42 },
    { id: '5', name: 'Movie Hits 2024', description: 'Fresh tracks from latest Telugu movies', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', songs: teluguSongs.slice(0, 6), songCount: 24 },
    { id: '6', name: 'Workout Telugu', description: 'High energy songs to fuel your workout', cover: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop', songs: teluguSongs.slice(5, 15), songCount: 30 },
];

export const artists: Artist[] = [
    { id: '1', name: 'Sid Sriram', image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', followers: '15.2M' },
    { id: '2', name: 'Armaan Malik', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', followers: '12.8M' },
    { id: '3', name: 'Anirudh Ravichander', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', followers: '18.5M' },
    { id: '4', name: 'Mangli', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', followers: '5.8M' },
    { id: '5', name: 'Thaman S', image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop', followers: '8.2M' },
    { id: '6', name: 'Devi Sri Prasad', image: 'https://images.unsplash.com/photo-1485579149621-3123dd979885?w=300&h=300&fit=crop', followers: '11.4M' },
];

export const albums: Album[] = [
    { id: '1', name: 'Ala Vaikunthapurramuloo', artist: 'Thaman S', cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop', year: '2020', songs: teluguSongs.slice(0, 4) },
    { id: '2', name: 'Pushpa', artist: 'Devi Sri Prasad', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop', year: '2021', songs: teluguSongs.slice(3, 7) },
    { id: '3', name: 'RRR', artist: 'M.M. Keeravani', cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop', year: '2022', songs: teluguSongs.slice(4, 8) },
    { id: '4', name: 'Geetha Govindam', artist: 'Gopi Sundar', cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop', year: '2018', songs: teluguSongs.slice(2, 6) },
    { id: '5', name: 'Guntur Kaaram', artist: 'Thaman S', cover: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop', year: '2024', songs: teluguSongs.slice(10, 14) },
];

export const genres = [
    { id: '1', name: 'Romantic', colors: ['#ec4899', '#f43f5e'] as const, image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop' },
    { id: '2', name: 'Party', colors: ['#f97316', '#f59e0b'] as const, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop' },
    { id: '3', name: 'Classical', colors: ['#a855f7', '#6366f1'] as const, image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop' },
    { id: '4', name: 'Folk', colors: ['#22c55e', '#10b981'] as const, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop' },
    { id: '5', name: 'Devotional', colors: ['#eab308', '#f97316'] as const, image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
    { id: '6', name: 'Hip-Hop', colors: ['#ef4444', '#ec4899'] as const, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop' },
];
