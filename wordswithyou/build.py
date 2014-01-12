import os
import sys
from contextlib import closing

HEADER = """
/******** %s ********/
"""
FOOTER = """
/*** end ***/
"""

listFile = sys.argv[1]
outFile = sys.argv[2]
path = os.path.dirname(listFile)

out = open(outFile, 'w')

try:
	with closing(open(listFile, 'r')) as list:
		for line in list:
			file = line.strip()
			if file is not "":
				if file[0:1]!="#":
					filepath = os.path.join(path, file)
					if os.path.exists(filepath):
						out.write(HEADER % (file,))
						out.write(open(filepath, 'r').read())
					else:
						print "Warning: cannot find " + file + " - skipping."
		out.write(FOOTER)
	out.close
except IOError as e:
	print e
	sys.exit(-1)
