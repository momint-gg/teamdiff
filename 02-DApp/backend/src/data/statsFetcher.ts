const axios = require("axios");

// Used to query the RIOT games API in order to pull player stats
export default class StatsFetcher {
  private _apiKey: string;
  private _http: any;
  private _http2: any;
  private _summonerNames: string[] = [];
  private _completedStats: Object = {};

  constructor(apiKey: string, summonerNames: string[]) {
    this._apiKey = apiKey;
    this._http = axios.create({
      baseURL: "https://na1.api.riotgames.com/",
      headers: { "X-Riot-Token": this._apiKey },
    });
    this._http2 = axios.create({
      baseURL: "https://americas.api.riotgames.com/",
      headers: { "X-Riot-Token": this._apiKey },
    });
    this._summonerNames =
      typeof summonerNames === "undefined" ? [] : summonerNames;
  }

  get summonerNames() {
    return this._summonerNames;
  }

  set summonerNames(summonerNames: string[]) {
    this._summonerNames = summonerNames;
  }

  get completedStats() {
    return this._completedStats;
  }

  private _fetchPUUIDBySummonerName = async (summonerName: string) => {
    const url = "lol/summoner/v4/summoners/by-name/" + summonerName;
    return await this._http.get(url);
  };

  private _fetchMatchIDsByPUUID = async (puuid: string) => {
    const url = "lol/match/v5/matches/by-puuid/" + puuid + "/ids";
    return await this._http2.get(url);
  };

  private _fetchMatchInfoByMatchID = async (matchId: string) => {
    const url = "lol/match/v5/matches/" + matchId;
    return await this._http2.get(url);
  };

  private fetchPUUIDsBySummonerNames = async (
    allSummonerNames: string[]
  ) => {
    const res = await Promise.all(
      allSummonerNames.map((summonerName: string) => {
        return this._fetchPUUIDBySummonerName(summonerName)
          .then((res) => {
            // @ts-ignore
            this.completedStats[res.data.puuid] = {
              summonerName: summonerName,
              matches: [],
            };
            return res.data.puuid;
          })
          .catch((err) => console.log(err));
      })
    );
    return res;
  };

  private fetchMatchIDsByPUUIDs = async (puuids: string[]) => {
    const res = await Promise.all(
      puuids.map((puuid: string) => {
        return this._fetchMatchIDsByPUUID(puuid)
          .then((res) => [puuid, res.data])
          .catch((err) => console.log(err));
      })
    );
    const resFiltered = res.filter((it) => typeof it !== "undefined");
    // @ts-ignore
    const puuidToMatchIdsMap = new Map(resFiltered);
    return Object.fromEntries(puuidToMatchIdsMap);
  };

  private fetchMatchInfoByMatchIDs = async (matchIds: string[]) => {
    matchIds = matchIds.reverse().slice(18).reverse();
    const res = await Promise.all(
      matchIds.map((matchId: string) => {
        return this._fetchMatchInfoByMatchID(matchId)
          .then((res) => [matchId, res.data])
          .catch((err) => console.log(err));
      })
    );

    const resFiltered: any = res.filter((it) => typeof it !== "undefined");
    const matchIdtoMatchDataMap = new Map(resFiltered);
    return Object.fromEntries(matchIdtoMatchDataMap);
  };

  fetchPlayerStats = async () => {
    if (this._summonerNames === []) {
      return this._completedStats;
    }

    const puuids = await this.fetchPUUIDsBySummonerNames(this._summonerNames);
    const puuidsToMatchIds = await this.fetchMatchIDsByPUUIDs(puuids);

    const matchInfo = await Promise.all(
      Object.entries(puuidsToMatchIds).map((it) => {
        // @ts-ignore
        const matchIds: string[] = it[1];
        return this.fetchMatchInfoByMatchIDs(matchIds).catch((err) =>
          console.log(err)
        );
      })
    );

    if (matchInfo.length === 0) {
      return this._completedStats;
    }

    const puuidsToMatchInfoFormatted: any = Object.assign.apply(
      {},
      //@ts-ignore
      puuids.map((v, i) => ({
        [v]: matchInfo[i],
      }))
    );

    Object.entries(puuidsToMatchInfoFormatted).forEach((it: any) => {
      const puuid = it[0];
      const matchInfo: any = it[1];

      if (typeof matchInfo === "undefined" || matchInfo.length === 0) {
        return this._completedStats;
      }

      Object.entries(matchInfo).forEach((it: any) => {
        const data = it[1];
        const info = data.info;
        const allPlayersInMatch = info.participants;
        const currentPlayerMatchStats = allPlayersInMatch.filter(
          (player: any) => player.puuid === puuid
        )[0];
        // @ts-ignore
        this.completedStats[puuid].matches.push(currentPlayerMatchStats);
      });
    });

    return this._completedStats;
  };
}
