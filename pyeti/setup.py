from distutils.core import setup

setup(
    name = "pyeti",
    version = "0.0.0",
    author = "Alex Foran",
    author_email = "alex@alexforan.com",
    packages = ["eti"],
    url = "todo",
    license = "LICENSE",
    description = "Simple ETI API",
    install_requires = open("requirements.txt").read().strip().split("\n")
)
