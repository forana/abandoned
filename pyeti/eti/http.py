import requests
from bs4 import BeautifulSoup

BASE_URL = "https://endoftheinter.net"

URI_LOGIN = "/"
URI_MAIN = "/main.php"
URI_STATS = "/stats.php"
URI_SEARCH = "/topics/%(tags)s?q=%(terms)s"

def login(username, password):
    r = requests.post(BASE_URL + URI_LOGIN, data = {"b": username, "p": password, "r": URI_MAIN}, allow_redirects = False)
    if "userid" in r.cookies:
        return {"userid": r.cookies["userid"], "session": r.cookies["session"], "PHPSESSID": r.cookies["PHPSESSID"]}
    return {}

def check_status(cookies):
    r = requests.get(BASE_URL + URI_STATS, cookies = cookies, allow_redirects = False)
    return r.status_code == 200

def get_topics(