// All athletes
//Their index in this list is their id

const athletes = [
  // What order they should be fin
  'Berserker', // id = 0, Neo's id = 1, etc...
  'Neo',
  'Johnsun',
  'FBI',
  'Danny',
  'Hans sama',
  'Tactical',
  'Arrow',
  'Luger',
  'Lost',
  'Blaber',
  'River',
  'Josedeodo',
  'Closer',
  'Inspired',
  'Santorin',
  'Spica',
  'Kenvi',
  'Contractz',
  'Pridestalker',
  'Jensen',
  'Blue',
  'toucouille',
  'Abbedagge',
  'jojopyun',
  'Bjergsen',
  'Maple',
  'PowerOfEvil',
  'Palafox',
  'Ablazeolive',
  'Zven',
  'Biofrost',
  'aphromoo',
  'huhi',
  'Vulcan',
  'CoreJJ',
  'Shenyi',
  'IgNar',
  'Poome',
  'Olleh',
  'Fudge',
  'Gamsu',
  'Kumo',
  'Ssumday',
  'Impact',
  'Bwipo',
  'Huni',
  'Revenge',
  'Jenkins',
  'Licorice',
];

for (let i = 0; i < athletes.length; i++) {
  athletes[i] = athletes[i].toLowerCase();
}

athleteToIdObject = {};
for (let i = 0; i < athletes.length; i++) {
  athleteToIdObject[athletes[i]] = i;
  // console.log(athleteToIdObject[athletes[i]]);
}

module.exports = athleteToIdObject;
