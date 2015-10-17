REPORTER = list

test:
	clear
	echo Starting test *********************************************************
	./node_modules/mocha/bin/mocha
	echo Ending test

doc:
	clear
	rm -R doc
	echo Starting JSDOC *********************************************************
	jsdoc -c jsdoc-conf.json README-JSDOC.md
	echo Creating README.md *****************************************************
	rm -f README.md
	jsdoc2md --src lib/**/*   >>JSDOC.md
	cat README-JSDOC.md JSDOC.md History.md LICENSE > README.md
	rm -r -f JSDOC.md

pages:
    git subtree push --prefix doc origin gh-pages

cover:
	clear
	istanbul cover _mocha

.PHONY: test doc cover pages