// All athletes
//Their index in this list is their id

const athletes = [
  // What order they should be fin
  'Berserker',
  'Neo',
  'Johnsun',
  'FBI',
  'Danny',
  'Hans sama',
  'Tactical',
  'Lost',
  'Luger',
  'Stixxay',
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

console.log('athleteToIds = ', athleteToIdObject);

module.exports = athleteToIdObject;
