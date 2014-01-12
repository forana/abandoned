import jinja2
import jinja2.loaders
import jinja2.environment
import threading

import appconfig

class Templater:
	def __init__(self):
		self.reset()
		self.loaderLock = threading.Lock()

	def reset(self):
		self.env = jinja2.environment.Environment()
		loader = jinja2.loaders.FileSystemLoader(appconfig.TEMPLATE_PATH)
		self.env.loader = loader
		self.templates = {}

	def getTemplate(self, name):
		if name not in self.templates:
			self.loaderLock.acquire()
			if name not in self.templates:
				try:
					template = self.env.get_template(name)
					self.templates[name] = template
				finally:
					self.loaderLock.release()
		return self.templates[name]

inst = Templater()

def instance():
	return inst