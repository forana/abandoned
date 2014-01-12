ZIPTARGET = space.zip
BUILDLIST = 'src/build.lst'
JSTARGET = build.js
HOST = `cat host.cfg`
RESDIR = resources
TESTHTML = index.html
FONTS = resources/fonts/04b.ttf

build-js:
	@python build.py $(BUILDLIST) $(JSTARGET)
	@echo "Build successful: $(JSTARGET)"

build-zip:
	@zip -r $(ZIPTARGET) $(JSTARGET) $(RESDIR)
	@zip -j $(ZIPTARGET) $(FONTS)
	@wc -c $(ZIPTARGET)
	@echo "Build successful: $(ZIPTARGET)"

all: clean build-js build-zip

clean:
	@rm -f $(JSTARGET)
	@rm -f $(ZIPTARGET)

min:
	@echo "Before compression:"
	@wc -c $(JSTARGET)
	@yuicompressor --type js -o $(JSTARGET) $(JSTARGET)
	@echo "After compression:"
	@wc -c $(JSTARGET)

deploy-light:
	@scp $(ZIPTARGET) $(HOST)
	@echo "Zip deployed"

deploy:
	@scp -r $(RESDIR) $(ZIPTARGET) $(JSTARGET) $(TESTHTML) $(HOST)
	@echo "Deploy successful"

deploy-android:
	@adb push $(ZIPTARGET) /sdcard/$(ZIPTARGET)

love: all min deploy
