const fs = require('fs');
const XLSX = require('xlsx');
const readXlsxFile = require('read-excel-file');
const path = require('path');

// Reads in athletes from excel file and generates JSON
// Dumps JSON into final_metadata folder for final upload

// Our number of athletes
numAthletes = 50;

// Generated from push_headshots.js
athleteImages = {
  Abbedagge:
    'https://gateway.pinata.cloud/ipfs/QmSRWW6xugkewMeJBLTKSBMnkgPFMp1bxKSvwhtV8H6EGN/',
  Ablazeolive:
    'https://gateway.pinata.cloud/ipfs/QmbREeExE6cdo4DbmAAsejL7ffBXBLDdZL86LTA91TVuhL/',
  Arrow:
    'https://gateway.pinata.cloud/ipfs/QmXXB7phsQjUKhCE4TbJwLsQKo93WbdSE7NXre22nnyAgV/',
  Berserker:
    'https://gateway.pinata.cloud/ipfs/QmaSXrJ7MjF4L8mHqgqYYwbj4afFmMhUDyrcoaHYB9rp32/',
  Biofrost:
    'https://gateway.pinata.cloud/ipfs/QmZiBopqPxK6DnKV9B3mZiSqSNjiCC9Ni23dNeJ2wFYh3p/',
  Bjergsen:
    'https://gateway.pinata.cloud/ipfs/QmeT8rhPpg6Ue8usMbjWc52bNPDAXD5mtkSqRmYLnAbbAv/',
  Blaber:
    'https://gateway.pinata.cloud/ipfs/QmZebeoJLqbufKX5EbRsuuY8JdrQfE5aW3KAexg15e3qBj/',
  Blue: 'https://gateway.pinata.cloud/ipfs/QmbU52KHT1yEn3WAj1V4qxdgadbXwqTHz4ghB2tAPm8838/',
  Bwipo:
    'https://gateway.pinata.cloud/ipfs/QmVQxSXtiDwpASr9kLnTaocmfwK3KC7hv4i2JmnsPgaMAW/',
  Closer:
    'https://gateway.pinata.cloud/ipfs/QmZJiZnz8rmx3j8PDEuKw6acE6Xvt1R6iSyuKHxehi5qeU/',
  Contractz:
    'https://gateway.pinata.cloud/ipfs/QmdKLQubnRzbyAbbaW5BsfyxFVVPti1nzS2DCmqkSA8jc2/',
  CoreJJ:
    'https://gateway.pinata.cloud/ipfs/QmTC6u7Sb9vuSGmr2rRnJbcmQ4bBq9JXm5cLzdFsWs29Pt/',
  Danny:
    'https://gateway.pinata.cloud/ipfs/QmWuPPN79ks9hfv7WPiTUvHmu1jmjMbRhVtACVzw1UfmhA/',
  FBI: 'https://gateway.pinata.cloud/ipfs/QmVp7yQa81CTZUf5d77Xq4EQuKGKmecdc9zi3awtxNMNrY/',
  Fudge:
    'https://gateway.pinata.cloud/ipfs/QmXPEkp2jDUht3r7zbS2YXZJatiroJzdhnTcuDXJ6VGSrF/',
  Gamsu:
    'https://gateway.pinata.cloud/ipfs/QmRcpkboabLz9HbCWZyXGtjWmEYxMsiALC6Ujqm1t2DTaM/',
  Hans_sama:
    'https://gateway.pinata.cloud/ipfs/QmQuGr9dDgjxVFH7r7ps52YRY3SLoFwNCztQegGoz5gRwh/',
  Huni: 'https://gateway.pinata.cloud/ipfs/QmVGBsn58vCohDccnoLY668w1SzExrPu6NuNuEZrAcQjjq/',
  IgNar:
    'https://gateway.pinata.cloud/ipfs/QmeFgiTjdB8rTArs3hTFHXmfG8R89XpCo19ktFHfz7EEkW/',
  Impact:
    'https://gateway.pinata.cloud/ipfs/QmTtR57mXJwK6XscoH7zmCV5pCbK6qza3ccpv2kdSSw91F/',
  Inspired:
    'https://gateway.pinata.cloud/ipfs/QmexZYihCtiHHWHoFv6j1ywDVrSh25PJkmhGngvyZW5a1A/',
  Jenkins:
    'https://gateway.pinata.cloud/ipfs/QmX96e4jtgxS2kEWbmcpZK5ZkD7JDdHoVYyfdSPbPxhc2q/',
  Jensen:
    'https://gateway.pinata.cloud/ipfs/QmYQKVPrKnoGeQc3fHbLPJsTPZNTmiZsqbDxrNrqpZ9uti/',
  Johnsun:
    'https://gateway.pinata.cloud/ipfs/QmTymVRz1Xwaa3Wey65u2S1qDj3r2bjBUWeNS1KaCcsdYj/',
  Josedeodo:
    'https://gateway.pinata.cloud/ipfs/Qmep9B3nC66fLV7tVNvdjUuKgMSjauTSieDV2zHSTbwgPz/',
  Kenvi:
    'https://gateway.pinata.cloud/ipfs/QmXUGvgHqFUhcqE9NMCTC5xQMq8CqoFwyjD29pKXGQUqn4/',
  Kumo: 'https://gateway.pinata.cloud/ipfs/QmaCvxa85vxHG6V1NFDpzxsz52BYpqe8VbHvDrWprFRhKb/',
  Licorice:
    'https://gateway.pinata.cloud/ipfs/QmPNzkh8KmrVXxodBMYBMrFVd5aNKXqLBTM6S6Xt6Sv2KP/',
  Lost: 'https://gateway.pinata.cloud/ipfs/QmYrUm1m12ZEMZyrbkQZSzWTwEx6ENeBTXEM77xiXSzKDc/',
  Luger:
    'https://gateway.pinata.cloud/ipfs/QmeWpH4Hjd92xa7TkGRjnzVNVjNu6kMqDr2sqhLTnznraC/',
  Maple:
    'https://gateway.pinata.cloud/ipfs/QmQa5r47U1TWbnufkjHFuZ3pnzLTgZKudk2R1ykS7uNMz7/',
  Neo: 'https://gateway.pinata.cloud/ipfs/QmeoJjK3p7jaaqeJsEaaptTjteSPEgpgRt2xb61BQjh8gN/',
  Olleh:
    'https://gateway.pinata.cloud/ipfs/QmUvpAm9HnwEAiAkSMaK2BkEVnrMvSQAppVjWhkeVJZmxB/',
  Palafox:
    'https://gateway.pinata.cloud/ipfs/QmTwxRSHJYx9ui1u5pV3vMAPi4v1UGjUB6QeCM4ztJwhxQ/',
  Poome:
    'https://gateway.pinata.cloud/ipfs/QmcbnQZemoqsXCAed8MCp7b5rakCUDjWaaozzMeiy3riue/',
  PowerOfEvil:
    'https://gateway.pinata.cloud/ipfs/QmbUJBDVSNgNqv9hzjf5gUnZhc3bomjWuHaUvEQPAi2uC9/',
  Pridestalker:
    'https://gateway.pinata.cloud/ipfs/QmRArpEYXYKbGY2wNEeEN4ECN5Ri6Vbvfvy4RbTxhKSrpM/',
  Revenge:
    'https://gateway.pinata.cloud/ipfs/QmU6WSkYLQ5JphrabyD45WKHbZwEnWPR5q4EhkDpx6f5R2/',
  River:
    'https://gateway.pinata.cloud/ipfs/QmZckSZUUjgJvp7AV4QGQ18aoFzYgUVy8pHrFtaR4yBU7o/',
  Santorin:
    'https://gateway.pinata.cloud/ipfs/QmevBAqecPS6d77kMUpmoYMEpMPKxZG7CUm6m6ssmRTv4q/',
  Shenyi:
    'https://gateway.pinata.cloud/ipfs/QmTXxbpg527yN1ghkuJJ9QjhZapmuzuenq7UY53aUyqKdR/',
  Spica:
    'https://gateway.pinata.cloud/ipfs/QmbxUtes3mrAmpurS82mrMU616U7Rs8W8Kb9eGm5AvppLv/',
  Ssumday:
    'https://gateway.pinata.cloud/ipfs/QmRWi73xK1DLwJGDVPjaomfS3MSvtGGbutq88ZRFh2hMjq/',
  Tactical:
    'https://gateway.pinata.cloud/ipfs/QmWsho6Stga58oCKfmeiQ3wxZ3ymwsp3QmbWNioPfjhizj/',
  Vulcan:
    'https://gateway.pinata.cloud/ipfs/QmSyaAA3H2YL29ukSiHEFKSkCRPDtjqcY32Ww8vS6tWzDg/',
  Zven: 'https://gateway.pinata.cloud/ipfs/QmUmLXp9Vo2ffr3dJtLxQqx727H3x8Y3kW6mLmgRW213pM/',
  aphromoo:
    'https://gateway.pinata.cloud/ipfs/Qmb7sGVUNLnMvzxJKAuVGdhTiVeu9XiM6vYqtbdrA6cQUt/',
  huhi: 'https://gateway.pinata.cloud/ipfs/QmaKgdkiWVCd3Zk3pqYouFYXRJDChC8ZBdiEHo9knjYF8w/',
  jojopyun:
    'https://gateway.pinata.cloud/ipfs/QmbnzKZZbgBzW1EcqqGUaxKccRNd81h2rTR8qmieKnU7M4/',
  toucouille:
    'https://gateway.pinata.cloud/ipfs/QmWtr1GvvUrQWBz4MoMKr3vdA79EZTQmwhgM4EjZMz3BjN/',
};

const parseExcel = (filename) => {
  const excelData = XLSX.readFile(filename);

  return Object.keys(excelData.Sheets).map((name) => ({
    name,
    data: XLSX.utils.sheet_to_json(excelData.Sheets[name]),
  }));
};

// Populating the final_metadata folder
const generateJSON = async () => {
  console.log('Num athletes is ', Object.keys(athleteImages).length);

  parseExcel('./athletes.xlsx').forEach((element) => {
    data = element.data;
  });

  for (let i = 0; i < numAthletes + 1; i++) {
    if (i == 0) continue;
    const gamer_name = data[i]['__EMPTY'];
    const name = data[i]['__EMPTY_1'];
    const team = data[i]['__EMPTY_2'];
    const team_abbreviated = data[i]['__EMPTY_3'];
    const position = data[i]['__EMPTY_4'];
    const description = data[i]['__EMPTY_5'];
    if (name == 'Hans sama') {
      // Not necessary but was just debugging shit
      imageHash = athleteImages['Hans_sama'];
    } else {
      imageHash = athleteImages[gamer_name];
    }

    // Constructing object with metadata properties
    const teamAttribute = { trait_type: 'Team', value: team };
    const positionAttribute = { trait_type: 'Position', value: position };
    const attributes = [teamAttribute, positionAttribute];
    const jsonObject = {
      name: gamer_name,
      description: description,
      image: imageHash,
      attributes: attributes,
    };
    // Stringifying our JSON object
    const jsonString = JSON.stringify(jsonObject);
    console.log('Final json ', jsonString);

    // Writing into final_metadata folder
    fs.writeFileSync(
      path.resolve(__dirname, `./final_metadata/${i - 1}.json`),
      jsonString
    );
  }
};

const runMain = async () => {
  try {
    await generateJSON();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
