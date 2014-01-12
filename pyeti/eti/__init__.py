import eti.http

def Login(username, password):
    return ETIConnection(username, password)

class ETIError(Exception):
    pass

class ETIConnection:
    def __init__(self, username, password):
        self.cookies = eti.http.login(username, password)

    def is_logged_in(self):
        return eti.http.check_status(self.cookies)

    def get_topics(self, boards, terms):
        return eti.http.get_topics(self.cookies, boards, terms)
