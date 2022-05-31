// All athletes
//Their index in this list is their id

const athletes = [
  'Berserker', // id = 0, Neo's id = 1, etc...
  'Neo',
  'Johns,un',
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

// async function main() {
//   const athleteToIdObject = {};
//   for (let i = 0; i < athletes.length; i++) {
//     athleteToIdObject[athletes[i]] = i;
//   }

//   console.log('Athletes');
//   for (let i = 0; i < athletes.length; i++) {
//     console.log(athleteToIdObject[athletes[i]]);
//   }
// }

// main().catch((err) => console.log(err));

athleteToIdObject = {};
for (let i = 0; i < athletes.length; i++) {
  athleteToIdObject[athletes[i]] = i;
  // console.log(athleteToIdObject[athletes[i]]);
}

module.exports = athleteToIdObject;
