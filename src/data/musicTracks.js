/**
 * Odd Frequency - Curated Radio Stations & YouTube Playlists Catalog
 * 
 * 5 Distinct Subterranean Audio Frequencies:
 * 1. 98.4 FM  - ODD FREQUENCY #01 (Slowcore, Dreampop & Indie Melancholy) [PLX3pJ_cUqMmg]
 * 2. 89.1 FM  - ROMANTIC GOTH & DARKWAVE (Post-Punk, EBM & Dark Romance) [PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh]
 * 3. 66.6 FM  - DEATH METAL 101 (Old-School Death Metal, Sludge & Thrash) [PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB]
 * 4. 101.5 FM - DARK JAZZ NOIR (Cinema Noir, Wong Kar-wai & Midnight Blues) [PLNUi9O2rRUM8]
 * 5. 104.2 FM - MAC & CHEESE (Slacker Rock, Bedroom Lo-Fi & Garage Demos) [PLQIVduBNTwdE]
 */

export const STATIONS = [
  {
    id: "void",
    frequency: "98.4 FM",
    name: "ODD FREQUENCY #01",
    tagline: "Cigarettes After Sex / Summer Salt / King Krule / Slowcore & Dreampop",
    playlistId: "PLX3pJ_cUqMmg",
    playlistUrl: "https://youtube.com/playlist?list=PLX3pJ_cUqMmg",
    accent: "#a855f7",
    badge: "98.4 FM [THE VOID]",
    trackCount: 19,
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "goth",
    frequency: "89.1 FM",
    name: "ROMANTIC GOTH",
    tagline: "London After Midnight / Type O Negative / The Cure / Darkwave",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    playlistUrl: "https://youtube.com/playlist?list=PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    accent: "#c084fc",
    badge: "89.1 FM [GOTH]",
    trackCount: 22,
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "metal",
    frequency: "66.6 FM",
    name: "DEATH METAL 101",
    tagline: "Death / Master / Autopsy / Obituary / Sepultura / Sludge & Metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    playlistUrl: "https://youtube.com/playlist?list=PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    accent: "#ef4444",
    badge: "66.6 FM [METAL]",
    trackCount: 100,
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "jazz",
    frequency: "101.5 FM",
    name: "DARK JAZZ NOIR",
    tagline: "In The Mood For Love / Jeff Beck / Taxi Driver / Chet Baker / 3AM Blues",
    playlistId: "PLNUi9O2rRUM8",
    playlistUrl: "https://youtube.com/playlist?list=PLNUi9O2rRUM8",
    accent: "#38bdf8",
    badge: "101.5 FM [NOIR]",
    trackCount: 15,
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "mac",
    frequency: "104.2 FM",
    name: "MAC & CHEESE",
    tagline: "Good Morning / Mac DeMarco / Demos / Bedroom Pop & Slacker Indie",
    playlistId: "PLQIVduBNTwdE",
    playlistUrl: "https://youtube.com/playlist?list=PLQIVduBNTwdE",
    accent: "#d4ff00",
    badge: "104.2 FM [THE FEED]",
    trackCount: 26,
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=600&q=80"
  }
];

export const GENRES = [
  { id: "all", label: "ALL FREQUENCIES" },
  { id: "void", label: "SLOWCORE & DREAMPOP (98.4 FM)" },
  { id: "goth", label: "ROMANTIC GOTH (89.1 FM)" },
  { id: "metal", label: "DEATH METAL 101 (66.6 FM)" },
  { id: "jazz", label: "DARK JAZZ NOIR (101.5 FM)" },
  { id: "mac", label: "MAC & CHEESE INDIE (104.2 FM)" }
];

export const DEFAULT_TRACKS = [
  // --------------------------------------------------------------------------
  // Station 1: ODD FREQUENCY #01 (PLX3pJ_cUqMmg)
  // --------------------------------------------------------------------------
  {
    id: "of01-01",
    title: "Crush",
    artist: "Cigarettes After Sex",
    stationId: "void",
    frequency: "98.4 FM",
    genre: "void",
    playlistId: "PLX3pJ_cUqMmg",
    youtubeId: "Pvv-hrcIgCI",
    duration: "4:28",
    note: "Ambient Pop / Dreampop Noir Anthem",
    cover: "https://i.ytimg.com/vi/Pvv-hrcIgCI/hqdefault.jpg"
  },
  {
    id: "of01-02",
    title: "One Last Time",
    artist: "Summer Salt",
    stationId: "void",
    frequency: "98.4 FM",
    genre: "void",
    playlistId: "PLX3pJ_cUqMmg",
    youtubeId: "Edj3jWVagBU",
    duration: "3:38",
    note: "Bossa Nova Slacker Surf / Melancholy Drift",
    cover: "https://i.ytimg.com/vi/Edj3jWVagBU/hqdefault.jpg"
  },
  {
    id: "of01-03",
    title: "Lucky Love",
    artist: "Michael Seyer",
    stationId: "void",
    frequency: "98.4 FM",
    genre: "void",
    playlistId: "PLX3pJ_cUqMmg",
    youtubeId: "zv8fu8NhCTQ",
    duration: "4:47",
    note: "Bedroom Soul / Lo-Fi Warmth",
    cover: "https://i.ytimg.com/vi/zv8fu8NhCTQ/hqdefault.jpg"
  },
  {
    id: "of01-04",
    title: "Fire Flower",
    artist: "Summer Salt",
    stationId: "void",
    frequency: "98.4 FM",
    genre: "void",
    playlistId: "PLX3pJ_cUqMmg",
    youtubeId: "5oNqaRLDOi0",
    duration: "4:12",
    note: "Indie Surf / Velvet Harmonies",
    cover: "https://i.ytimg.com/vi/5oNqaRLDOi0/hqdefault.jpg"
  },
  {
    id: "of01-05",
    title: "Out Getting Ribs (Live)",
    artist: "King Krule",
    stationId: "void",
    frequency: "98.4 FM",
    genre: "void",
    playlistId: "PLX3pJ_cUqMmg",
    youtubeId: "TObYoD2pGb0",
    duration: "4:42",
    note: "Raw Post-Punk / Telecaster Reverb",
    cover: "https://i.ytimg.com/vi/TObYoD2pGb0/hqdefault.jpg"
  },

  // --------------------------------------------------------------------------
  // Station 2: ROMANTIC GOTH & DARKWAVE (PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh)
  // --------------------------------------------------------------------------
  {
    id: "goth-01",
    title: "Sacrifice",
    artist: "London After Midnight",
    stationId: "goth",
    frequency: "89.1 FM",
    genre: "goth",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    youtubeId: "egLAkA4HrXU",
    duration: "6:14",
    note: "Gothic Rock / Darkwave Masterpiece",
    cover: "https://i.ytimg.com/vi/egLAkA4HrXU/hqdefault.jpg"
  },
  {
    id: "goth-02",
    title: "Be My Druidess",
    artist: "Type O Negative",
    stationId: "goth",
    frequency: "89.1 FM",
    genre: "goth",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    youtubeId: "ujsUCqe-QIk",
    duration: "5:26",
    note: "Gothic Metal / Deep Bass Drone",
    cover: "https://i.ytimg.com/vi/ujsUCqe-QIk/hqdefault.jpg"
  },
  {
    id: "goth-03",
    title: "Scarlet Rose",
    artist: "Emotional Gothic Music",
    stationId: "goth",
    frequency: "89.1 FM",
    genre: "goth",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    youtubeId: "QNkH1FXstFM",
    duration: "3:48",
    note: "Neoclassical Darkwave / Orchestral Reverb",
    cover: "https://i.ytimg.com/vi/QNkH1FXstFM/hqdefault.jpg"
  },
  {
    id: "goth-04",
    title: "Remember",
    artist: "Love Like Blood",
    stationId: "goth",
    frequency: "89.1 FM",
    genre: "goth",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    youtubeId: "gIn8L4er1kk",
    duration: "4:30",
    note: "Classic German Goth Rock / Sisters of Mercy Vibe",
    cover: "https://i.ytimg.com/vi/gIn8L4er1kk/hqdefault.jpg"
  },
  {
    id: "goth-05",
    title: "Lovesong",
    artist: "The Cure",
    stationId: "goth",
    frequency: "89.1 FM",
    genre: "goth",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    youtubeId: "hXCKLJGLENs",
    duration: "3:29",
    note: "1989 Disintegration / Post-Punk Romantic Anthem",
    cover: "https://i.ytimg.com/vi/hXCKLJGLENs/hqdefault.jpg"
  },

  // --------------------------------------------------------------------------
  // Station 3: DEATH METAL 101 (PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB)
  // --------------------------------------------------------------------------
  {
    id: "metal-01",
    title: "Baptized in Blood",
    artist: "Death",
    stationId: "metal",
    frequency: "66.6 FM",
    genre: "metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    youtubeId: "NUvEDs6Cmqc",
    duration: "4:32",
    note: "Chuck Schuldiner / 1987 Scream Bloody Gore",
    cover: "https://i.ytimg.com/vi/NUvEDs6Cmqc/hqdefault.jpg"
  },
  {
    id: "metal-02",
    title: "Funeral Bitch",
    artist: "Master",
    stationId: "metal",
    frequency: "66.6 FM",
    genre: "metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    youtubeId: "LvTwEXUW7K4",
    duration: "3:03",
    note: "Old-School Death Metal / Early Chicago Raw Assault",
    cover: "https://i.ytimg.com/vi/LvTwEXUW7K4/hqdefault.jpg"
  },
  {
    id: "metal-03",
    title: "Charred Remains",
    artist: "Autopsy",
    stationId: "metal",
    frequency: "66.6 FM",
    genre: "metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    youtubeId: "24_BYwfqV4A",
    duration: "3:40",
    note: "1989 Severed Survival / Death-Doom Heavyweight",
    cover: "https://i.ytimg.com/vi/24_BYwfqV4A/hqdefault.jpg"
  },
  {
    id: "metal-04",
    title: "Slowly We Rot",
    artist: "Obituary",
    stationId: "metal",
    frequency: "66.6 FM",
    genre: "metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    youtubeId: "S19iiygsrto",
    duration: "3:38",
    note: "Florida Death Metal Classic / John Tardy Growls",
    cover: "https://i.ytimg.com/vi/S19iiygsrto/hqdefault.jpg"
  },
  {
    id: "metal-05",
    title: "Troops of Doom",
    artist: "Sepultura",
    stationId: "metal",
    frequency: "66.6 FM",
    genre: "metal",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    youtubeId: "u8aXJPGsno8",
    duration: "3:21",
    note: "1986 Morbid Visions / Raw Thrash-Death Pioneer",
    cover: "https://i.ytimg.com/vi/u8aXJPGsno8/hqdefault.jpg"
  },

  // --------------------------------------------------------------------------
  // Station 4: DARK JAZZ NOIR (PLNUi9O2rRUM8)
  // --------------------------------------------------------------------------
  {
    id: "jazz-01",
    title: "Yumeji's Theme (In The Mood For Love)",
    artist: "Shigeru Umebayashi",
    stationId: "jazz",
    frequency: "101.5 FM",
    genre: "jazz",
    playlistId: "PLNUi9O2rRUM8",
    youtubeId: "f1w4qnfux-o",
    duration: "2:30",
    note: "Wong Kar-wai Masterpiece / Cinematic Cello Waltz",
    cover: "https://i.ytimg.com/vi/f1w4qnfux-o/hqdefault.jpg"
  },
  {
    id: "jazz-02",
    title: "Cause We've Ended as Lovers",
    artist: "Jeff Beck",
    stationId: "jazz",
    frequency: "101.5 FM",
    genre: "jazz",
    playlistId: "PLNUi9O2rRUM8",
    youtubeId: "xiOPvOBd8IA",
    duration: "5:42",
    note: "Stevie Wonder Tribute / Electric Blues Noir",
    cover: "https://i.ytimg.com/vi/xiOPvOBd8IA/hqdefault.jpg"
  },
  {
    id: "jazz-03",
    title: "I Still Can't Sleep (Taxi Driver OST)",
    artist: "Bernard Herrmann",
    stationId: "jazz",
    frequency: "101.5 FM",
    genre: "jazz",
    playlistId: "PLNUi9O2rRUM8",
    youtubeId: "cmDgfzpKw5w",
    duration: "2:57",
    note: "Midnight Manhattan Saxophone / Neo-Noir Solitude",
    cover: "https://i.ytimg.com/vi/cmDgfzpKw5w/hqdefault.jpg"
  },
  {
    id: "jazz-04",
    title: "Almost Blue",
    artist: "Chet Baker",
    stationId: "jazz",
    frequency: "101.5 FM",
    genre: "jazz",
    playlistId: "PLNUi9O2rRUM8",
    youtubeId: "z4PKzz81m5c",
    duration: "3:15",
    note: "Heartbreaking Velvet Trumpet & Whispered Vocals",
    cover: "https://i.ytimg.com/vi/z4PKzz81m5c/hqdefault.jpg"
  },
  {
    id: "jazz-05",
    title: "I'm a Fool To Want You (Live in Paris)",
    artist: "Chet Baker",
    stationId: "jazz",
    frequency: "101.5 FM",
    genre: "jazz",
    playlistId: "PLNUi9O2rRUM8",
    youtubeId: "81BvLZYtHZM",
    duration: "7:12",
    note: "Smoky Late-Night Paris Jazz Club Session",
    cover: "https://i.ytimg.com/vi/81BvLZYtHZM/hqdefault.jpg"
  },

  // --------------------------------------------------------------------------
  // Station 5: MAC & CHEESE (PLQIVduBNTwdE)
  // --------------------------------------------------------------------------
  {
    id: "mac-01",
    title: "Warned You",
    artist: "Good Morning",
    stationId: "mac",
    frequency: "104.2 FM",
    genre: "mac",
    playlistId: "PLQIVduBNTwdE",
    youtubeId: "iNGfYnyv9BU",
    duration: "2:17",
    note: "Melbourne Slacker Pop / Lazy Jangle Guitars",
    cover: "https://i.ytimg.com/vi/iNGfYnyv9BU/hqdefault.jpg"
  },
  {
    id: "mac-02",
    title: "20191011 You Made The Bed",
    artist: "Mac DeMarco",
    stationId: "mac",
    frequency: "104.2 FM",
    genre: "mac",
    playlistId: "PLQIVduBNTwdE",
    youtubeId: "_fNh0qgGf3s",
    duration: "2:14",
    note: "One Wayne G Garage Demo / Raw Tape Lo-Fi",
    cover: "https://i.ytimg.com/vi/_fNh0qgGf3s/hqdefault.jpg"
  },
  {
    id: "mac-03",
    title: "On The Square (Demo)",
    artist: "Mac DeMarco",
    stationId: "mac",
    frequency: "104.2 FM",
    genre: "mac",
    playlistId: "PLQIVduBNTwdE",
    youtubeId: "YayjubuA-M4",
    duration: "3:08",
    note: "Here Comes The Cowboy Unreleased Synth Demo",
    cover: "https://i.ytimg.com/vi/YayjubuA-M4/hqdefault.jpg"
  },
  {
    id: "mac-04",
    title: "20191012 Fooled By Love",
    artist: "Mac DeMarco",
    stationId: "mac",
    frequency: "104.2 FM",
    genre: "mac",
    playlistId: "PLQIVduBNTwdE",
    youtubeId: "TPzRHfD2UrA",
    duration: "3:18",
    note: "Bedroom Reel-to-Reel Tape Cassette",
    cover: "https://i.ytimg.com/vi/TPzRHfD2UrA/hqdefault.jpg"
  },
  {
    id: "mac-05",
    title: "All Of Our Yesterdays",
    artist: "Mac DeMarco",
    stationId: "mac",
    frequency: "104.2 FM",
    genre: "mac",
    playlistId: "PLQIVduBNTwdE",
    youtubeId: "WjZ1f5J8Kr4",
    duration: "4:04",
    note: "Nostalgic Acoustic Slacker Ballad",
    cover: "https://i.ytimg.com/vi/WjZ1f5J8Kr4/hqdefault.jpg"
  }
];

export const MIXTAPES = [
  {
    id: "tape-01",
    title: "ODD FREQUENCY #01 // DREAMPOL & SLOWCORE",
    station: "98.4 FM",
    playlistId: "PLX3pJ_cUqMmg",
    playlistUrl: "https://youtube.com/playlist?list=PLX3pJ_cUqMmg",
    trackCount: 19,
    duration: "74m",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    tags: ["Dreampop", "Slowcore", "Ambient"]
  },
  {
    id: "tape-02",
    title: "ROMANTIC GOTH // DARKWAVE VAULT",
    station: "89.1 FM",
    playlistId: "PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    playlistUrl: "https://youtube.com/playlist?list=PLgEpjxqlzb6k8wLBYqYcTspMth9XrnKHh",
    trackCount: 22,
    duration: "98m",
    cover: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    tags: ["Romantic Goth", "Darkwave", "Post-Punk"]
  },
  {
    id: "tape-03",
    title: "DEATH METAL 101 // BLOODLINE HEAVY",
    station: "66.6 FM",
    playlistId: "PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    playlistUrl: "https://youtube.com/playlist?list=PLXH3ukits4dlWBzLuK2DBHTRQBR1D49tB",
    trackCount: 100,
    duration: "410m",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    tags: ["Death Metal", "Autopsy", "Obituary"]
  },
  {
    id: "tape-04",
    title: "DARK JAZZ NOIR // 3AM TRANSMISSIONS",
    station: "101.5 FM",
    playlistId: "PLNUi9O2rRUM8",
    playlistUrl: "https://youtube.com/playlist?list=PLNUi9O2rRUM8",
    trackCount: 15,
    duration: "65m",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    tags: ["Cinema Noir", "Chet Baker", "Wong Kar-wai"]
  },
  {
    id: "tape-05",
    title: "MAC & CHEESE // BEDROOM SLACKER",
    station: "104.2 FM",
    playlistId: "PLQIVduBNTwdE",
    playlistUrl: "https://youtube.com/playlist?list=PLQIVduBNTwdE",
    trackCount: 26,
    duration: "82m",
    cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
    tags: ["Mac DeMarco", "Lo-Fi", "Good Morning"]
  }
];

export function getTracksByStation(stationId) {
  if (!stationId || stationId === 'all') return DEFAULT_TRACKS;
  return DEFAULT_TRACKS.filter(t => t.stationId === stationId);
}

export function getTracksByGenre(genreId) {
  if (!genreId || genreId === 'all') return DEFAULT_TRACKS;
  return DEFAULT_TRACKS.filter(t => t.genre === genreId || t.stationId === genreId);
}
