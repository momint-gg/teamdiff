from flask import Flask

app = Flask(__name__)

@app.route("/")
def get_current_week_stats():
    return "<p>Hello, World!</p>"

def get_current_week_stats():
    return "<p>Hello, World!</p>"

@app.route("/")
def get_single_player_stats(summonerId):
    return "<p>Hello, World!</p>"

@app.route("/")
def get_all_player_stats():
    return "<p>Hello, World!</p>"