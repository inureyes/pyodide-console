EP = ./node_modules/electron-packager/bin/electron-packager.js ./build/electron-app --ignore=node_modules/electron-packager --ignore=.git --overwrite --asar --ignore="\.git(ignore|modules)" --out=app
BUILD_DATE := $(shell date +%y%m%d)
BUILD_TIME := $(shell date +%H%m%S)
BUILD_VERSION := $(shell grep version package.json | head -1 | cut -c 15- | rev | cut -c 3- | rev)
REVISION_INDEX := $(shell git --no-pager log --pretty=format:%h -n 1)
site := $(or $(site),main)

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
current_dir := $(notdir $(patsubst %/,%,$(dir $(mkfile_path))))

test_web:
	npm run server:d
test_electron:
	./node_modules/electron/cli.js . --dev
run_tests:
	node ./node_modules/testcafe/bin/testcafe.js chrome tests
versiontag:
	echo '{ "package": "${BUILD_VERSION}", "build": "${BUILD_DATE}.${BUILD_TIME}", "revision": "${REVISION_INDEX}" }' > version.json
	sed -i -E 's/globalThis.packageVersion = "\(.*\)"/globalThis.packageVersion = "${BUILD_VERSION}"/g' index.html
	sed -i -E 's/"version": "\(.*\)"/"version": "${BUILD_VERSION}"/g' manifest.json
	sed -i -E 's/globalThis.buildVersion = "\(.*\)"/globalThis.buildVersion = "${BUILD_DATE}\.${BUILD_TIME}"/g' index.html
	sed -i -E 's/\<small class="sidebar-footer" style="font-size:9px;"\>\(.*\)\<\/small\>/\<small class="sidebar-footer" style="font-size:9px;"\>${BUILD_VERSION}.${BUILD_DATE}\<\/small\>/g' ./src/components/pyodide-console.ts
compile_keepversion:
	npm run build
compile: versiontag
	npm run build
all: dep mac win linux
dep:
	if [ ! -d "./build/rollup/" ];then \
		make compile; \
	fi
	rm -rf build/electron-app
	mkdir -p build/electron-app
	cp ./package.json ./build/electron-app/package.json
	cp ./main.js ./build/electron-app/main.js
	cp -Rp build/rollup build/electron-app/app
	cp -Rp build/rollup/resources build/electron-app
	cp -Rp build/rollup/manifest build/electron-app
	mkdir -p build/electron-app/app/lib/pyodide
	mkdir -p build/electron-app/app/lib/iodide
	cp -Rp ./src/lib/pyodide build/electron-app/app/lib/pyodide
	cp -Rp ./src/lib/iodide build/electron-app/app/lib/iodide
	sed -i -E 's/\.\/dist\/components\/pyodide-console.js/es6:\/\dist\/components\/pyodide-console.js/g' build/electron-app/app/index.html
web:
	if [ ! -d "./build/rollup/" ];then \
		make compile; \
	fi
	mkdir -p ./deploy/$(site)
	cd deploy/$(site); rm -rf ./*; mkdir console
	cp -Rp build/rollup/* deploy/$(site)/console
mac: dep
	$(EP) --platform=darwin --icon=manifest/backend-ai.icns
	rm -rf ./app/pyodide-console-macos
	cd app; mv pyodide-console-darwin-x64 pyodide-console-macos;
	mv ./app/pyodide-console-macos/pyodide-console.app './app/pyodide-console-macos/Pyodide Console.app'
	./node_modules/electron-installer-dmg/bin/electron-installer-dmg.js './app/pyodide-console-macos/Pyodide Console.app' ./app/pyodide-console-$(BUILD_DATE) --overwrite --icon=manifest/backend-ai.icns --title=PyodideConsole
win: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	$(EP) --platform=win32 --arch=x64 --icon=manifest/pyodide.ico
	cd app; zip ./pyodide-console-win32-x64-$(BUILD_DATE).zip -r ./pyodide-console-win32-x64
linux: dep
	cp ./configs/$(site).toml ./build/electron-app/app/config.toml
	$(EP) --platform=linux --icon=manifest/pyodide.ico
	cd app; ditto -c -k --sequesterRsrc --keepParent ./pyodide-console-linux-x64 ./pyodide-console-linux-x64-$(BUILD_DATE).zip
clean:
	cd app;	rm -rf ./pyodide*
	cd build;rm -rf ./unbundle ./bundle ./rollup ./electron-app
