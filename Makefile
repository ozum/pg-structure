REPORTER = list

test:
	clear
	echo Starting test *********************************************************
	./node_modules/mocha/bin/mocha
	echo Ending test

doc:
	clear
	echo Starting JSDOC *********************************************************
	jsdoc -c jsdoc-conf.json README-JSDOC.md
	echo Creating README.md *****************************************************
	rm -f README.md
	jsdoc2md --src lib/**/*   >>JSDOC.md
	cat README-JSDOC.md JSDOC.md JSDOX/*  > README.md
	rm -r -f JSDOC.md JSDOX

cover:
	clear
	istanbul cover _mocha

.PHONY: test doc cover