import requests
import BeautifulSoup
from urllib2 import HTTPError

BUYLIST_URL = "http://sales.starcitygames.com/buylist/"

def getSalePrices():
	resp = requests.get(BUYLIST_URL).text
	if resp.status_code != 200:
		raise HTTPError("HTTP Error " + str(resp.status_code))

	soup = BeautifulSoup(resp.text)
	