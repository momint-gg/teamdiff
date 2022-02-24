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
import csv


ssl._create_default_https_context = ssl._create_unverified_context


class DataFetcher():
    def __init__(self,
                 site="lol.fandom.com",
                 path="/",
                 tournament="LCS/2020 Season/Spring Season",
                 tournament2="LCS 2022 Spring",
                 start_date=dt.datetime.strptime(dt.datetime.utcnow().isoformat()[
                                                 :19], "%Y-%m-%dT%H:%M:%S").date(),
                 time_interval=7
                 ):
        self.site = mwclient.Site(site, path)
        self.tournament = tournament
        self.tournament2 = tournament2
        self.start_date = start_date
        self.time_interval = time_interval
        self.teams = []
        self.players = {}
        self.player_game_stats = {}
        self.aggregated_player_game_stats = {}
        self.nft_metadata = {}
        self.ipfs = ipfsApi.Client(host='https://ipfs.infura.io', port=5001)
        self.ipfsMap = {}
        self.file_names = []
        self.ipfsJsonMap = {}
        self.true_athletes = []
        self.positions = ["Top", "Mid", "Bot", "Support", "Jungle"]

    overwrite_player_name_map = {
          "hans" : "Hans sama",
          "afromoo" : "",
          "pridestalkr" : "Pridestalker"
    }

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

    def get_players_and_teams(self):
        response = self.site.api(
            "cargoquery",
            limit="max",
            tables="Tournaments=T, TournamentPlayers=TP",
            join_on="T.OverviewPage=TP.OverviewPage",
            fields="TP.Player",
            where="T.Name = '" + self.tournament2 + "'",
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
            self.positions.append(position) if position not in self.positions else None

        self.teams = [info["Team"] for _, info in self.players.items()]

    def get_players_csv(self):
        fields = ", ".join(self.player_fields)
        where = []

        for name in self.true_athletes:
            if name not in self.players:
              where.append(f"P.Player = '{name}'")

        where = ' OR '.join(where)

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
            self.positions.append(position) if position not in self.positions else None

    def _get_game_data(self, team, start_date, time_interval):
        fields = ", ".join(self.scoreboard_player_fields)
        past_date = str(start_date-dt.timedelta(time_interval))

        where = (
            "SG.Tournament = '" + self.tournament2 + "' "
            "AND SG.DateTime_UTC >= '" + past_date + "'"
            "AND (SG.Team1 = '" + team + "' OR SG.Team1 = '" + team + "')"
        )

        response = self.site.api('cargoquery',
                                 limit="max",
                                 tables="ScoreboardGames=SG, ScoreboardPlayers=SP",
                                 join_on="SG.GameId=SP.GameId",
                                 fields=fields,
                                 where=where,
                                 )

        return response

    def determine_stat_type(self, stat):
        match stat:
            case "Kills":
                return int
            case "Deaths":
                return int
            case "Assists":
                return int
            case "Gold":
                return int
            case "DamageToChampions":
                return int
            case _:
                return str

    def get_player_game_stats(self):
        for team in self.teams:
            game_data = self._get_game_data(
                team, self.start_date, self.time_interval)['cargoquery']

            for current_player in game_data:
                current_player_data = current_player['title']
                current_player_name = current_player_data['Link']

                if current_player_name not in self.player_game_stats:
                    self.player_game_stats[current_player_name] = {}

                game_id = current_player_data["GameId"]

                if game_id in self.player_game_stats[current_player_name]:
                    continue

                self.player_game_stats[current_player_name][game_id] = {}

                for stat, value in current_player_data.items():
                    if self.determine_stat_type(stat) == int:
                        self.player_game_stats[current_player_name][game_id][stat] = int(
                            value)
                    else:
                        self.player_game_stats[current_player_name][game_id][stat] = value

    def aggregate_player_game_stats(self):
        for current_player_name, games in self.player_game_stats.items():
            if current_player_name not in self.aggregated_player_game_stats:
                self.aggregated_player_game_stats[current_player_name] = {}

            for _, current_game in games.items():
                for stat, value in current_game.items():
                    if stat == "PlayerWin":
                        if "Wins" not in self.aggregated_player_game_stats[current_player_name]:
                            self.aggregated_player_game_stats[current_player_name]["Wins"] = 0

                        if value == "Yes":
                            self.aggregated_player_game_stats[current_player_name]["Wins"] += 1

                    elif self.determine_stat_type(stat) == int:
                        if stat not in self.aggregated_player_game_stats[current_player_name]:
                            self.aggregated_player_game_stats[current_player_name][stat] = value
                        else:
                            self.aggregated_player_game_stats[current_player_name][stat] += value

    def get_filename_url_to_open(self, site, filename, player, size=None):
        pattern = r'.*src\=\"(.+?)\".*'
        size = '|' + str(size) + 'px' if size else ''
        to_parse_text = '[[File:{}|link=%s]]'.format(filename, size)
        result = site.api('parse', title='Main Page',
                          text=to_parse_text, disablelimitreport=1)
        parse_result_text = result['parse']['text']['*']

        url = re.match(pattern, parse_result_text)[1]

        urllib.request.urlretrieve(url, player + ".png")

    def download_player_headshots(self):
        for player in self.players.keys():
            pprint(player)
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
                self.get_filename_url_to_open(self.site, url, player)
                self.ipfsMap[player] = self.ipfs.add("./" + player + ".png")
            except:
                self.ipfsMap[player] = {
                    "Name": "",
                    "Hash": "",
                    "Size": ""
                }
            finally:
                pprint(self.ipfsMap[player])
                os.remove("./" + player +
                          ".png") if self.ipfsMap[player]["Hash"] else None
                time.sleep(5)

    def create_nft_metadata_ordered(self):
        count = 0
        for position in self.positions:
          for player, info in self.players.items():
              p = player.split("(")[0].strip()
              if info["Role"] == position and (p in self.true_athletes or player in self.true_athletes):
                self.nft_metadata[p] = {}
                self.nft_metadata[p]["name"] = info["Name"]
                self.nft_metadata[p]["description"] = "This is a professional eSports athelete!"
                self.nft_metadata[p]["image"] = "https://ipfs.io/ipfs/"+ self.ipfsMap[player]["Hash"]
                self.nft_metadata[p]["attributes"] = [
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
                    self.nft_metadata[p], "nft_metadata_ordered/" + str(count) + ".json")
                count += 1

    def create_nft_metadata_random(self):
        count = 0
        target_players = []
        for player, info in self.players.items():
            p = player.split("(")[0].strip()
            if p in self.true_athletes or player in self.true_athletes:
              self.nft_metadata[p] = {}
              self.nft_metadata[p]["name"] = info["Name"]
              self.nft_metadata[p]["description"] = "This is a professional eSports athelete!"
              self.nft_metadata[p]["image"] = "https://ipfs.io/ipfs/"+ self.ipfsMap[player]["Hash"]
              self.nft_metadata[p]["attributes"] = [
                  {
                      "trait_type": "team",
                      "value": info["Team"]
                  },
                  {
                      "trait_type": "position",
                      "value": info["Role"]
                  },
              ]
              target_players.append(p)
        random.shuffle(target_players)
        for p in target_players:
          self.convert_to_json(
              self.nft_metadata[p], "nft_metadata_random/" + str(count) + ".json")
          count += 1

    def convert_to_json(self, data, file_name):
        with open(file_name, "w") as outfile:
            json.dump(data, outfile)
        # print("Created", file_name)
        self.file_names.append(file_name)

    def upload_jsons_to_ipfs(self):
        for file_name in self.file_names:
            print(file_name)
            self.ipfsJsonMap[file_name] = {
                "Name": "",
                "Hash": "",
                "Size": ""
            }
            try:
                self.ipfsJsonMap[file_name] = self.ipfs.add(file_name)
            except:
                pass
            finally:
                print(self.ipfsJsonMap[file_name])

    def set_true_athletes(self, csv_name):
        with open(csv_name, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            for i, row in enumerate(reader):
                if i < 2:
                    continue
                self.true_athletes += [row[0].split(",")[0]]
        # pprint(self.true_athletes)

    def clean_player_name(self, name):
      return name.split("(")[0].strip().lower()

    def print_missing_players(self):
      a = sorted(list(self.players.keys()))
      b = sorted(self.true_athletes)

      x = [df.clean_player_name(p) for p in b]
      y = [df.clean_player_name(p) for p in a]

      for p in x:
        if p not in y:
          print(p)

df = DataFetcher()

df.set_true_athletes("athletes.csv")
df.get_players_and_teams()
df.get_players_csv()
df.print_missing_players()

df.get_player_game_stats()
df.aggregate_player_game_stats()
df.download_player_headshots()
df.create_nft_metadata_ordered()
df.create_nft_metadata_random()

# df.convert_to_json(df.players, f'player_info_'"%s"'.json' % df.start_date)
# df.convert_to_json(df.player_game_stats,
#                    f'player_game_stats_'"%s"'.json' % df.start_date)
# df.convert_to_json(df.aggregated_player_game_stats,
#                    f'aggregated_player_game_stats_'"%s"'.json' % df.start_date)
# df.convert_to_json(
#     df.ipfsMap, f'headshot_ipfs_hashes_'"%s"'.json' % df.start_date)
# df.convert_to_json(
#     df.nft_metadata, f'nft_metadata_'"%s"'.json' % df.start_date)

# df.upload_jsons_to_ipfs()

# df.convert_to_json(
#     df.ipfsJsonMap, f'player_data_ipfs_hashes_'"%s"'.json' % df.start_date)

print("Done!")
