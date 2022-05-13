#!/usr/bin/python3

import csv
import datetime as dt
import ipfsApi
import json
import mwclient
from pprint import pprint
import os
import random
import re
import ssl
import sys
import subprocess
import time
import urllib.request


ssl._create_default_https_context = ssl._create_unverified_context


class Datafetcher():
    def __init__(self,
                 athlete_source,
                 tournament,
                 time_interval,
                 site="lol.fandom.com",
                 path="/",
                 start_date=dt.datetime.strptime(dt.datetime.utcnow().isoformat()[
                     :19], "%Y-%m-%dT%H:%M:%S").date(),
                 ):
        self.site = mwclient.Site(site, path)
        self.ipfs = ipfsApi.Client(host='https://ipfs.infura.io', port=5001)
        self.tournament = tournament
        self.start_date = start_date
        self.time_interval = time_interval
        self.athletes = {}
        self.teams = []
        self.clean_to_raw_summoner_ids = {}
        self.athlete_game_stats = {}
        self.aggregated_athlete_game_stats = []
        self.nft_metadata = {}
        self.game_stat = {}
        self.athlete_source = athlete_source

    scoreboard_player_fields = [
        "SP.OverviewPage",
        "SP.Link",
        "SP.Champion",
        "SP.Kills",
        "SP.Deaths",
        "SP.Assists",
        "SP.SummonerSpells",
        "SP.Gold",
        "SP.CS",
        "SP.DamageToChampions",
        "SP.Items",
        "SP.Trinket",
        "SP.KeystoneMastery",
        "SP.KeystoneRune",
        "SP.PrimaryTree",
        "SP.SecondaryTree",
        "SP.Runes",
        "SP.TeamKills",
        "SP.TeamGold",
        "SP.Team",
        "SP.TeamVs",
        "SP.Time",
        "SP.PlayerWin",
        "SP.DateTime_UTC",
        "SP.DST",
        "SP.Tournament",
        "SP.Role",
        "SP.Role_Number",
        "SP.IngameRole",
        "SP.Side",
        "SP.GameId",
        "SP.MatchId",
    ]

    player_fields = [
        "P.ID",
        "P.OverviewPage",
        "P.Player",
        "P.Name",
        "P.NativeName",
        "P.NameAlphabet",
        "P.NameFull",
        "P.Country",
        "P.Nationality",
        "P.NationalityPrimary",
        "P.Age",
        "P.Birthdate",
        "P.ResidencyFormer",
        "P.Team",
        "P.Team2",
        "P.CurrentTeams",
        "P.TeamSystem",
        "P.Team2System",
        "P.Residency",
        "P.Role",
        "P.FavChamps",
        "P.SoloqueueIds",
        "P.Askfm",
        "P.Discord",
        "P.Facebook",
        "P.Instagram",
        "P.Lolpros",
        "P.Reddit",
        "P.Snapchat",
        "P.Stream",
        "P.Twitter",
        "P.Vk",
        "P.Website",
        "P.Weibo",
        "P.Youtube",
        "P.TeamLast",
        "P.RoleLast",
        "P.IsRetired",
        "P.ToWildrift",
        "P.IsPersonality",
        "P.IsSubstitute",
        "P.IsTrainee",
        "P.IsLowercase",
        "P.IsAutoTeam",
        "P.IsLowContent",
    ]

    positions = ["Top", "Mid", "ADC", "Support", "Jungle"]

    def _set_athletes(self, csv_name):
        with open(csv_name, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            for i, row in enumerate(reader):
                raw_summoner_id = row[0].split(",")[0]
                clean_summoner_id = self._clean_summoner_id(raw_summoner_id)
                self.clean_to_raw_summoner_ids[clean_summoner_id] = raw_summoner_id
                self.athletes[clean_summoner_id] = {}

    def _determine_stat_type(self, stat):
        if stat == "kills":
            return int
        elif stat == "deaths":
            return int
        elif stat == "assists":
            return int
        elif stat == "cs":
            return int
        elif stat == "gold":
            return int
        elif stat == "damage_to_champions":
            return int
        else:
            return str

    def _is_relevant_stat(self, stat):
        s = set([
            "Kills",
            "Deaths",
            "Assists",
            "CS",
            "Gold",
            "DamageToChampions",
            "PlayerWin"])
        return stat in s

    def _fetch_game_data(self, team, start_date, time_interval):
        fields = ", ".join(self.scoreboard_player_fields)
        past_date = str(start_date-dt.timedelta(time_interval))

        where = "SG.Tournament = '" + self.tournament + "' AND SG.DateTime_UTC >= '" + \
            past_date + "'AND (SG.Team1 = '" + team + \
            "' OR SG.Team1 = '" + team + "')"

        response = self.site.api('cargoquery',
                                 limit="max",
                                 tables="ScoreboardGames=SG, ScoreboardPlayers=SP",
                                 join_on="SG.GameId=SP.GameId",
                                 fields=fields,
                                 where=where,
                                 )

        return response

    def _download_photo(self, site, filename, player, size=None):
        pattern = r'.*src\=\"(.+?)\".*'
        size = '|' + str(size) + 'px' if size else ''
        to_parse_text = '[[File:{}|link=%s]]'.format(filename, size)

        result = site.api('parse', title='Main Page',
                          text=to_parse_text, disablelimitreport=1)
        parse_result_text = result['parse']['text']['*']

        url = re.match(pattern, parse_result_text)[1]
        urllib.request.urlretrieve(url, player + ".png")

    def _convert_to_json(self, data, file_name):
        with open(file_name, "w") as outfile:
            json.dump(data, outfile)
        print("Created file:", file_name)

    def _clean_summoner_id(self, name, lower=True):
        return name.split("(")[0].strip().lower()

    def set_athletes_and_teams_from_csv(self):
        print("(Step 1/7) Setting athletes and teams from " +
              str(self.athlete_source) + "...\n")
        self._set_athletes(self.athlete_source)

        fields = ", ".join(self.player_fields)
        where = ' OR '.join(
            ["P.Player = '" + self.clean_to_raw_summoner_ids[summoner_id] + "'" for summoner_id in self.athletes])

        response = self.site.api(
            "cargoquery",
            limit="max",
            tables="PlayerRedirects=PR, Players=P",
            join_on="PR.OverviewPage=P.OverviewPage",
            fields=fields,
            where=where,
        ).get("cargoquery")

        parsed = json.dumps(response)
        decoded = json.loads(parsed)

        for athlete in decoded:
            summoner_id = self._clean_summoner_id(athlete["title"]["Player"])
            self.athletes[summoner_id] = athlete["title"]
            self.teams.append(
                athlete["title"]["Team"]) if athlete["title"]["Team"] not in self.teams else None

        print("These athletes were set:\n")

        for i, summoner_id in enumerate(sorted(self.athletes.keys(), key=lambda athlete: athlete.lower())):
            print(summoner_id)

        print("\nThese teams were set:\n")

        for i, team in enumerate(self.teams):
            print(str(i+1) + ".", team)

        print("\nDone!\n")

    def fetch_athlete_game_stats(self):
        print("(Step 2/7) Fetching athlete game stats...\n")
        for team in self.teams:
            game_data = self._fetch_game_data(
                team, self.start_date, self.time_interval)['cargoquery']

            for current_athlete in game_data:
                current_athlete_data = current_athlete["title"]
                raw_current_summoner_id = current_athlete_data[
                    "Link"] if current_athlete_data["Link"] != "Pridestalkr" else "Pridestalker"
                current_summoner_id = self._clean_summoner_id(
                    raw_current_summoner_id)

                if current_summoner_id not in self.clean_to_raw_summoner_ids:
                    continue

                if current_summoner_id not in self.athlete_game_stats:
                    self.athlete_game_stats[current_summoner_id] = {}

                game_id = current_athlete_data["GameId"]

                if game_id in self.athlete_game_stats[current_summoner_id]:
                    continue

                self.athlete_game_stats[current_summoner_id][game_id] = {}

                for stat, value in current_athlete_data.items():
                    if not self._is_relevant_stat(stat):
                        continue

                    stat = stat.lower()

                    if stat == "damagetochampions":
                        stat = "damage_to_champions"

                    if stat == "playerwin":
                        stat = "player_win"
                        value = 1 if value == "Yes" else 0

                    self.athlete_game_stats[current_summoner_id][game_id][stat] = int(
                        value)

        date = dt.date.today()
        self._convert_to_json(self.athlete_game_stats, "game_stats/" +
                              date.strftime("%m-%d-%Y") + "-game_stats.json")

        print("\nDone!\n")

    def aggregate_athlete_game_stats(self):
        print("(Step 3/7) Aggregating athlete game stats...\n")
        agg_game_stats = {}
        athlete_points = 0
        for current_summoner_id, games in self.athlete_game_stats.items():
            if current_summoner_id not in agg_game_stats:
                agg_game_stats[current_summoner_id] = {}

            for _, game in games.items():
                for stat, value in game.items():
                    # TODO: in this loop sum up points
                    stat = stat if stat != "player_win" else "wins"

                    if stat not in agg_game_stats[current_summoner_id]:
                        if stat == "kills":
                            agg_game_stats[current_summoner_id]["kills10"] = 0

                        if stat == "assists":
                            agg_game_stats[current_summoner_id]["assists10"] = 0

                        agg_game_stats[current_summoner_id][stat] = 0

                    if stat == "kills" and value >= 10:
                        agg_game_stats[current_summoner_id]["kills10"] += 1

                    if stat == "assists" and value >= 10:
                        agg_game_stats[current_summoner_id]["assists10"] += 1

                    agg_game_stats[current_summoner_id][stat] += value

        seen_summoner_ids = set(agg_game_stats.keys())
        all_summoner_ids = set(self.athletes.keys())
        no_games_summoner_ids = all_summoner_ids.difference(seen_summoner_ids)

        for summoner_id in no_games_summoner_ids:
            agg_game_stats[summoner_id] = {
                'assists': 0,
                'assists10': 0,
                'cs': 0,
                'damage_to_champions': 0,
                'deaths': 0,
                'gold': 0,
                'kills': 0,
                'kills10': 0,
                'wins': 0
            }

        self.aggregated_athlete_game_stats = agg_game_stats

        date = dt.date.today()
        self._convert_to_json(self.aggregated_athlete_game_stats,
                              "agg_stats/" + date.strftime("%m-%d-%Y") + "-aggregated_stats.json")

        print("\nDone!\n")

    def fetch_athlete_headshot_data(self):
        print("(Step 5/7) Fetching athlete headshot data...\n")
        for i, athlete in enumerate(sorted(self.athletes.keys())):
            print("(Athlete ", i+1, "/", len(self.athletes), ") ", athlete, sep="")
            self.athletes[athlete]["ipfs"] = {
                "Name": "",
                "Hash": "",
                "Size": "",
            }
            try:
                self.athletes[athlete]["ipfs"] = self.ipfs.add("../pinata/headshots/" +
                                                               i + ".png")[0]
            except:
                print("ERROR: Headshot of athlete",
                      athlete, "couldn't be retrieved")
            finally:
                print(self.athletes[athlete]["ipfs"]["Hash"])
                print()
                time.sleep(5)

        print("Done!\n")

    def create_nft_metadata_ordered(self):
        print("(Step 6/7) Creating position-ordered NFT metadata JSON files...\n")
        file_name = 0
        for target_position in self.positions:
            for athlete, info in self.athletes.items():
                current_athlete_position = info["Role"] if info["Role"] != "Bot" else "ADC"

                if current_athlete_position == target_position:
                    self.nft_metadata[athlete] = {}
                    self.nft_metadata[athlete]["name"] = info["Name"]
                    self.nft_metadata[athlete]["description"] = "Combine this card with 4 other athletes to build your dream roster. TeamDiff Genesis mint 2022."
                    self.nft_metadata[athlete]["image"] = "https://gateway.pinata.cloud/ipfs/" + \
                        self.athletes[athlete]["ipfs"]["Hash"]
                    self.nft_metadata[athlete]["attributes"] = [
                        {
                            "trait_type": "team",
                            "value": info["Team"]
                        },
                        {
                            "trait_type": "position",
                            "value": current_athlete_position
                        },
                    ]

                    if not os.path.isdir("nft_metadata_ordered/"):
                        os.mkdir("nft_metadata_ordered/")

                    self._convert_to_json(
                        self.nft_metadata[athlete], "nft_metadata_ordered/" + str(file_name) + ".json")

                    file_name += 1
        print("\nDone!\n")

    def create_nft_metadata_random(self):
        print("(Step 7/7) Creating random-ordered NFT metadata JSON files...\n")
        random_athletes = []
        for athlete, info in self.athletes.items():
            self.nft_metadata[athlete] = {}
            self.nft_metadata[athlete]["name"] = info["Name"]
            self.nft_metadata[athlete]["description"] = "Combine this card with 4 other athletes to build your dream roster. TeamDiff Genesis mint 2022."
            self.nft_metadata[athlete]["image"] = "https://gateway.pinata.cloud/ipfs/" + \
                self.athletes[athlete]["ipfs"]["Hash"]
            self.nft_metadata[athlete]["attributes"] = [
                {
                    "trait_type": "team",
                    "value": info["Team"]
                },
                {
                    "trait_type": "position",
                    "value": info["Role"] if info["Role"] != "Bot" else "ADC"
                },
            ]
            random_athletes.append(athlete)

        random.shuffle(random_athletes)

        file_name = 0

        for athlete in random_athletes:
            if not os.path.isdir("nft_metadata_random/"):
                os.mkdir("nft_metadata_random/")

            self._convert_to_json(
                self.nft_metadata[athlete], "nft_metadata_random/" + str(file_name) + ".json")

            file_name += 1

        print("\nDone!")

    def is_correct_athlete_count(self, target_count):
        if len(self.athletes.keys()) != target_count:
            print("ERROR: self.athletes has size", len(
                self.athletes), "instead of", target_count)
            return False

        return True

    def upload_headshots_to_pinata(self):
        print("\n(Step 4/7) Uploading headshots to Pinata...\n")
        # TODO: Bug - throws an error about missing a pinata key, but it still runs and works
        time.sleep(1)
        subprocess.call(["node", "../pinata/app.js", "-p"])
        print("Done!\n")

    def usage():
        print(
            "\nUSAGE: python3 datafetcher.py -a \"{path/to/athlete_source_file.csv}\" -t \"{Tournament name}\" -d {Number of days in the past to fetch query stats from}\n (optional) -os")


def main():
    if len(sys.argv) == 7:
        only_scrape = False
    elif len(sys.argv) == 8 and sys.argv[7] == "-os":
        only_scrape = True
    else:
        Datafetcher.usage()
        return

    a = sys.argv[1]
    t = sys.argv[3]
    d = sys.argv[5]

    if a != "-a" or t != "-t" or d != "-d":
        Datafetcher.usage()
        return

    athlete_source = sys.argv[2]
    tournament = sys.argv[4]
    days = int(sys.argv[6])

    df = Datafetcher(athlete_source, tournament, days)
    print("\nStarting datafetch for the last", days,
          "for the following tournament:", tournament + "...\n")

    df.set_athletes_and_teams_from_csv()

    target_athlete_count = 50
    if not df.is_correct_athlete_count(target_athlete_count):
        return

    df.fetch_athlete_game_stats()
    df.aggregate_athlete_game_stats()

    if not only_scrape:
        df.upload_headshots_to_pinata()
        df.fetch_athlete_headshot_data()

        df.create_nft_metadata_ordered()
        df.create_nft_metadata_random()

    print("\nDatafetch complete!\n")


main()
