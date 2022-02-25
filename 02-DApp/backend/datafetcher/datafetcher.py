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
import time
import urllib.request
# import mysql.connector


ssl._create_default_https_context = ssl._create_unverified_context


class DataFetcher():
    def __init__(self,
                 site="lol.fandom.com",
                 path="/",
                 tournament="LCS 2022 Spring",
                 start_date=dt.datetime.strptime(dt.datetime.utcnow().isoformat()[
                     :19], "%Y-%m-%dT%H:%M:%S").date(),
                 time_interval=7
                 ):
        self.site = mwclient.Site(site, path)
        self.ipfs = ipfsApi.Client(host='https://ipfs.infura.io', port=5001)
        # self.db = mysql.connector.connect(
        #     host="localhost",
        #     user="isaiah",
        #     password="4410",
        #     database="teamdiff"
        # )
        self.tournament = tournament
        self.start_date = start_date
        self.time_interval = time_interval
        self.teams = []
        self.players = {}
        self.player_game_stats = {}
        self.aggregated_player_game_stats = {}
        self.nft_metadata = {}

        self.athletes = []
        self.positions = ["Top", "Mid", "Bot", "Support", "Jungle"]

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

    def _set_athletes(self, csv_name):
        with open(csv_name, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            for i, row in enumerate(reader):
                if i < 2:
                    continue
                self.athletes.append(
                    self._clean_player_name(row[0].split(",")[0]))

    def _determine_stat_type(self, stat):
        if stat == "Kills":
            return int
        elif stat == "Deaths":
            return int
        elif stat == "Assists":
            return int
        elif stat == "CS":
            return int
        elif stat == "Gold":
            return int
        elif stat == "DamageToChampions":
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

    def _get_game_data(self, team, start_date, time_interval):
        fields = ", ".join(self.scoreboard_player_fields)
        past_date = str(start_date-dt.timedelta(time_interval))

        where = "SG.Tournament = '" + self.tournament + "' AND SG.DateTime_UTC >= '" + past_date + "'AND (SG.Team1 = '" + team + "' OR SG.Team1 = '" + team + "')"

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

    def _clean_player_name(self, name, lower=True):
        cleaned_name = name.split("(")[0].strip()
        if lower:
            return cleaned_name.lower()
        return cleaned_name

    def _remove_irrelevant_players(self):
        source = set(self.athletes)
        irrelevant_players = []

        for player in self.players:
            if self._clean_player_name(player) not in source:
                irrelevant_players.append(player)

        for player in irrelevant_players:
            del self.players[player]

    def get_players_and_teams_from_api(self):
        response = self.site.api(
            "cargoquery",
            limit="max",
            tables="Tournaments=T, TournamentPlayers=TP",
            join_on="T.OverviewPage=TP.OverviewPage",
            fields="TP.Player",
            where="T.Name = '" + self.tournament + "'",
        ).get("cargoquery")

        parsed = json.dumps(response)
        decoded = json.loads(parsed)

        names = [player["title"]["Player"] for player in decoded]

        fields = ", ".join(self.player_fields)
        where = ' OR '.join(["P.Player = '" + name + "'" for name in names])

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

        for player in decoded:
            player_name = player["title"]["Player"]
            self.players[player_name] = player["title"]
            position = player["title"]["Role"]
            self.positions.append(
                position) if position not in self.positions else None
            self.teams.append(
                player["title"]["Team"]) if player["title"]["Team"] not in self.teams else None

    def get_players_and_teams_from_csv(self, file_name):
        self._set_athletes(file_name)

        fields = ", ".join(self.player_fields)
        where = ' OR '.join(["P.Player = '" + name + "'" for name in self.athletes if name not in self.players])

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

        for player in decoded:
            player_name = player["title"]["Player"]
            self.players[player_name] = player["title"]
            position = player["title"]["Role"]
            self.positions.append(
                position) if position not in self.positions else None
            self.teams.append(
                player["title"]["Team"]) if player["title"]["Team"] not in self.teams else None

        self._remove_irrelevant_players()

    def get_player_game_stats(self):
        for team in self.teams:
            game_data = self._get_game_data(
                team, self.start_date, self.time_interval)['cargoquery']

            for current_player in game_data:
                current_player_data = current_player["title"]
                current_player_name = self._clean_player_name(
                    current_player_data["Link"])

                if current_player_name not in self.player_game_stats:
                    self.player_game_stats[current_player_name] = {}

                game_id = current_player_data["GameId"]

                if game_id in self.player_game_stats[current_player_name]:
                    continue

                self.player_game_stats[current_player_name][game_id] = {}

                for stat, value in current_player_data.items():
                    if not self._is_relevant_stat(stat):
                        continue
                    self.player_game_stats[current_player_name][game_id][stat] = int(
                        value) if self._determine_stat_type(stat) == int else value

    def aggregate_player_game_stats(self):
        game_stats = {}
        for current_player_name, games in self.player_game_stats.items():
            if current_player_name not in game_stats:
                game_stats[current_player_name] = {}

            for _, current_game in games.items():
                for stat, value in current_game.items():
                    if stat == "PlayerWin":
                        if "Wins" not in game_stats[current_player_name]:
                            game_stats[current_player_name]["Wins"] = 0
                        game_stats[current_player_name]["Wins"] += 1 if value == "Yes" else 0

                    elif self._determine_stat_type(stat) == int:
                        if stat not in game_stats[current_player_name]:
                            game_stats[current_player_name][stat] = value
                            if stat == "Kills":
                                game_stats[current_player_name]["Kills10"] = 0
                            if stat == "Assists":
                                game_stats[current_player_name]["Assists10"] = 0
                        else:
                            game_stats[current_player_name][stat] += value
                            if stat == "Kills" and game_stats[current_player_name]["Kills"] >= 10:
                                game_stats[current_player_name]["Kills10"] = True
                            if stat == "Assists" and game_stats[current_player_name]["Assists"] >= 10:
                                game_stats[current_player_name]["Assists10"] = True

        self.aggregated_player_game_stats = [
            {"summonerId": self._clean_player_name(player), "games": games} for player, games in game_stats.items()
        ]

    def download_player_headshots(self):
        print("Downloading player headshots...")
        for i, player in enumerate(sorted(self.players.keys())):
            print(i+1,"/",len(self.athletes), ")", sep="")

            response = self.site.api('cargoquery',
                                     limit=1,
                                     tables="PlayerImages",
                                     fields="FileName",
                                     where='Link="%s"' % player,
                                     format="json"
                                     )
            parsed = json.dumps(response)
            decoded = json.loads(parsed)

            try:
                url = str(decoded['cargoquery'][0]['title']['FileName'])
                self._download_photo(self.site, url, player)
                self.players[player]["ipfs"] = self.ipfs.add("./" + player + ".png")
            except:
                print("ERROR: Headshot of player", player, "failed to upload to IPFS")
                self.players[player]["ipfs"] = {
                    "Name": "",
                    "Hash": "",
                    "Size": ""
                }
            finally:
                pprint(self.players[player]["ipfs"])
                os.remove(
                    "./" + player + ".png") if os.path.exists("./" + player + ".png") else None
                time.sleep(5)

    def create_nft_metadata_ordered(self):
        file_name = 0
        for position in self.positions:
            for player, info in self.players.items():
                if info["Role"] == position:
                    self.nft_metadata[player] = {}
                    self.nft_metadata[player]["name"] = info["Name"]
                    self.nft_metadata[player]["description"] = "This is a professional eSports athelete!"
                    self.nft_metadata[player]["image"] = "https://ipfs.io/ipfs/" + \
                        self.players[player]["ipfs"]["Hash"]
                    self.nft_metadata[player]["attributes"] = [
                        {
                            "trait_type": "team",
                            "value": info["Team"]
                        },
                        {
                            "trait_type": "position",
                            "value": info["Role"]
                        },
                    ]
                    self.convert_to_json(
                        self.nft_metadata[player], "nft_metadata_ordered/" + str(file_name) + ".json")
                    file_name += 1

    def create_nft_metadata_random(self):
        random_players = []
        for player, info in self.players.items():
            self.nft_metadata[player] = {}
            self.nft_metadata[player]["name"] = info["Name"]
            self.nft_metadata[player]["description"] = "This is a professional eSports athelete!"
            self.nft_metadata[player]["image"] = "https://ipfs.io/ipfs/" + \
                self.players[player]["ipfs"]["Hash"]
            self.nft_metadata[player]["attributes"] = [
                {
                    "trait_type": "team",
                    "value": info["Team"]
                },
                {
                    "trait_type": "position",
                    "value": info["Role"]
                },
            ]
            random_players.append(player)

        random.shuffle(random_players)

        file_name = 0
        for player in random_players:
            self.convert_to_json(
                self.nft_metadata[player], "nft_metadata_random/" + str(file_name) + ".json")
            file_name += 1

    def convert_to_json(self, data, file_name):
        with open(file_name, "w") as outfile:
            json.dump(data, outfile)
        print("Created file:", file_name)

    def is_correct_player_count(self, target_count):
        if not len(self.athletes) == target_count:
            print("ERROR: self.athletes has size", len(self.athletes),"instead of", target_count)
            return False

        if len(self.athletes) == len(self.players):
            return True

        print("ERROR: self.athletes has size", len(self.athletes), "and self.players has a size of", len(self.players))
        return

    # def upload_player_data_to_db(self):
    #     cursor = self.db.cursor()

    #     query = "INSERT INTO players (summoner_id, name, team, position) VALUES (%(summoner_id)s, %(name)s, %(team)s, %(position)s)"

    #     query_args = []

    #     for _, info in self.players.items():
    #         d = {
    #             "summoner_id": self._clean_player_name(info["Player"], False),
    #             "name": info["Name"],
    #             "team": info["Team"],
    #             "position": info["Role"]
    #         }
    #         query_args.append(d)

    #     for args in query_args:
    #         cursor.execute(query, args)

    #     cursor.close()


def main():
    df = DataFetcher()

    df.get_players_and_teams_from_api()
    df.get_players_and_teams_from_csv("athletes.csv")

    target_player_counter = 50
    if not df.is_correct_player_count(target_player_counter):
        return

    df.get_player_game_stats()
    df.aggregate_player_game_stats()

    df.download_player_headshots()

    df.create_nft_metadata_ordered()
    df.create_nft_metadata_random()

    print("Done!")


main()
