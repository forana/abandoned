import os
import bottle

import appconfig
import template
import user

if __name__ == "__main__":
	templater = template.instance()

	@bottle.route('/static/<filepath:path>')
	def handle_static(filepath):
		return bottle.static_file(filepath, root='static/')

	@bottle.route('/')
	def index(page = None):
		uid = bottle.request.get_cookie("uid")
		token = bottle.request.get_cookie("token")
		u = user.get_user(uid, token)
		templater.reset()

		if u is None:
			return templater.getTemplate("index.html").render()
		else:
			return templater.getTemplate("list.html").render(user = u)

	bottle.run(port = os.environ.get("PORT", appconfig.PORT), host = "0.0.0.0")
