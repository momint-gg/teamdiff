import datetime as dt
import json
import mwclient
from pprint import pprint
import re
import shutil
import ssl
import urllib.request

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
        self.player_stats = {}
        self.aggregated_player_stats = {}

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

    def get_players(self):
        response = self.site.api(
            "cargoquery",
            limit="max",
            tables="Tournaments=T, TournamentPlayers=TP",
            join_on="T.OverviewPage=TP.OverviewPage",
            fields="TP.Player",
            where="T.Name = '" + self.tournament2 + "'"
        ).get("cargoquery")

        parsed = json.dumps(response)
        decoded = json.loads(parsed)

        names = [player["title"]["Player"] for player in decoded]

        fields = ", ".join(self.player_fields)
        where = []

        for name in names:
            where.append("P.Player = '" + name + "'")

        response = self.site.api(
            "cargoquery",
            limit="max",
            tables="PlayerRedirects=PR, Players=P",
            join_on="PR.OverviewPage=P.OverviewPage",
            fields=fields,
            where=' OR '.join(where),
        ).get("cargoquery")

        parsed = json.dumps(response)
        decoded = json.loads(parsed)

        ret = {}

        for player in decoded:
            player_name = player["title"]["Player"]
            ret[player_name] = player["title"]

        self.players = ret

        teams = [info["Team"] for _, info in self.players.items()]

        self.teams = teams

        return ret

    def get_game_data(self, team, start_date, time_interval):
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

    def get_player_games(self):
        teams = self.teams
        ret = {}

        for team in teams:
            game_data = self.get_game_data(
                team, self.start_date, self.time_interval)['cargoquery']

            for current_player in game_data:
                current_player_data = current_player['title']
                current_player_name = current_player_data['Link']

                if current_player_name not in ret:
                    ret[current_player_name] = {}

                game_id = current_player_data["GameId"]

                if game_id in ret[current_player_name]:
                    continue

                ret[current_player_name][game_id] = {}

                for stat, value in current_player_data.items():
                    if self.determine_stat_type(stat) == int:
                        ret[current_player_name][game_id][stat] = int(value)
                    else:
                        ret[current_player_name][game_id][stat] = value

        return ret

    def aggregate_player_stats(self, raw_player_stats):
        ret = {}

        for current_player_name, games in raw_player_stats.items():
            if current_player_name not in ret:
                ret[current_player_name] = {}

            for _, current_game in games.items():
                for stat, value in current_game.items():
                    if stat == "PlayerWin":
                        if "Wins" not in ret[current_player_name]:
                            ret[current_player_name]["Wins"] = 0

                        if value == "Yes":
                            ret[current_player_name]["Wins"] += 1

                    elif self.determine_stat_type(stat) == int:
                        if stat not in ret[current_player_name]:
                            ret[current_player_name][stat] = value
                        else:
                            ret[current_player_name][stat] += value

        return ret

    def get_filename_url_to_open(self, site, filename, player, size=None):
        pattern = r'.*src\=\"(.+?)\".*'
        size = '|' + str(size) + 'px' if size else ''
        to_parse_text = '[[File:{}|link=%s]]'.format(filename, size)
        result = site.api('parse', title='Main Page',
                          text=to_parse_text, disablelimitreport=1)
        parse_result_text = result['parse']['text']['*']

        url = re.match(pattern, parse_result_text)[1]

        urllib.request.urlretrieve(url, player + ".png")

    def download_player_images(self):
        for player in self.players.keys():
            print(player)
            site = mwclient.Site('lol.fandom.com', path='/')
            response = site.api('cargoquery',
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
              self.get_filename_url_to_open(site, url, player)
              shutil.move("./" + player + ".png",
                          "./headshots/" + player + ".png")
            except:
              pass

    def convert_to_json(self, data, file_name="stats.json"):
        with open(file_name, "w") as outfile:
            json.dump(data, outfile)


df = DataFetcher()

df.get_players()
player_games = df.get_player_games()
aggregated_player_stats = df.aggregate_player_stats(player_games)

# df.download_player_images()

df.convert_to_json(df.players, "player_info.json")
df.convert_to_json(player_games, "player_stats.json")
df.convert_to_json(aggregated_player_stats, "aggregated_player_stats.json")
