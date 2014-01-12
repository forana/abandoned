class Topic:
    def __init__(self, id, title, creation_time, creator, tags):
        self.id = id
        self.title = title
        self.creation_time = creation_time
        self.creator = creator
        self.tags = tags

class User:
    def __init__(self, id, name):
        self.id = id
        self.name = name
