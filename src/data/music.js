/**
 * Odd Frequency - Music Catalog & Underground Radio Stations
 */

export const RADIO_STATIONS = [
  {
    id: "house",
    name: "House",
    subtitle: "YouTube",
    genre: "Underground House / Deep Grooves",
    bpm: "124 BPM",
    frequency: "98.4 FM // LIVE STREAM",
    description: "Hypnotic four-on-the-floor sub-bass kicks, filtered analog chords, and subterranean underground club atmosphere.",
    color: "#b026ff",
    synthType: "house",
    length: "3:48"
  },
  {
    id: "brat",
    name: "Brat Summer Club",
    subtitle: "365 Party Girl // YouTube",
    genre: "Hyper-Pop / Electro Rave",
    bpm: "130 BPM",
    frequency: "104.2 FM // RAVE CELL",
    description: "Saturated saw-wave basslines, glitch claps, and high-energy neon party vibrations celebrating chaotic club nights.",
    color: "#a855f7",
    synthType: "electro",
    length: "2:54"
  },
  {
    id: "grunge",
    name: "Subterranean Grunge",
    subtitle: "Seattle 1993 // Live Tape",
    genre: "Alt-Rock / Grunge / Sub Pop",
    bpm: "96 BPM",
    frequency: "91.7 FM // CASSETTE FEED",
    description: "Distorted tape saturation, droning fuzz pedal frequencies, and raw minor-key melancholic grit.",
    color: "#94172b",
    synthType: "grunge",
    length: "4:12"
  },
  {
    id: "metal",
    name: "Iowa Dark Metal Wave",
    subtitle: "Des Moines 1999 // Soundboard",
    genre: "Nu-Metal / Industrial Noise",
    bpm: "140 BPM",
    frequency: "88.9 FM // TRIBAL NOISE",
    description: "Visceral double-kick rhythm simulation, heavy industrial saw drones, and dark subterranean angst.",
    color: "#94172b",
    synthType: "metal",
    length: "3:30"
  },
  {
    id: "ambient",
    name: "Subterranean Lo-Fi Drone",
    subtitle: "Tape Loop #001 // Odd Radio",
    genre: "Lo-Fi Tape Ambient / Drone",
    bpm: "72 BPM",
    frequency: "107.5 FM // NIGHT SHIFT",
    description: "Gentle warm analog tape flutter, deep sinus sub-bass frequencies, and slow meditative resonant sweeps.",
    color: "#b026ff",
    synthType: "ambient",
    length: "5:20"
  }
];

export const MIXTAPES = [
  {
    id: "TAPE-01",
    title: "FREQUENCY OVERLOAD // VOL 01",
    curator: "Odd Frequency Sound System",
    runtime: "48 MIN",
    tracks: [
      "01. Phantom Sub-Bass Intro",
      "02. Brat Summer Club (Extended Club Dub)",
      "03. Bleach & Fuzz (Seattle Demo)",
      "04. Blood Moon Ritual (Guts Theme)",
      "05. 3AM Des Moines Industrial Feed"
    ],
    cover: "images/brat-tee.jpg"
  },
  {
    id: "TAPE-02",
    title: "THE VOID // CASSETTE ARCHIVE '99",
    curator: "Underground Cell",
    runtime: "54 MIN",
    tracks: [
      "01. Dissonance Awakening",
      "02. Sludge Metal Requiem",
      "03. Heaven & Hell Re-Amped",
      "04. Justice For None (1988 Bootleg)",
      "05. Terminal Sleep Lo-Fi Drone"
    ],
    cover: "images/slipknot-tee.jpg"
  }
];
