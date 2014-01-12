ZIPTARGET = build.zip
BUILDLIST = 'src/build.lst'
JSTARGET = build.js
RESDIR = resources
TESTHTML = index.html

all: clean build-js build-zip

build-js:
	@python build.py $(BUILDLIST) $(JSTARGET)
	@echo "Build successful: $(JSTARGET)"

build-zip:
	@zip -r $(ZIPTARGET) $(JSTARGET) $(RESDIR)
	@wc -c $(ZIPTARGET)
	@echo "Build successful: $(ZIPTARGET)"

clean:
	@rm -f $(JSTARGET)
	@rm -f $(ZIPTARGET)

min:
	@echo "Before compression:"
	@wc -c $(JSTARGET)
	@yuicompressor --type js -o $(JSTARGET) $(JSTARGET)
	@echo "After compression:"
	@wc -c $(JSTARGET)

love: all min
