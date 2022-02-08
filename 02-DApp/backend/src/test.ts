require('dotenv').config()
import StatsFetcher from './data/statsFetcher';

async function main() {
  const summoners: any = ["eXyu", "Neo", "FakeGod"];
  const statsFetcher = new StatsFetcher(process.env.RIOT_API_KEY!!, summoners);
  const res = await statsFetcher.fetchPlayerStats()

  const FileSystem = require("fs");
  FileSystem.writeFile("playerStats.json", JSON.stringify(res), (error: any) => {
    if (error) throw error;
  });
}

main()
