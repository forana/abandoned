
class User:
	def __init__(self, name, id):
		self.name = name
		self.id = id

def get_user(id, token):
	return User("Alex", 1)
