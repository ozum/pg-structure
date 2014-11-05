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
	jsdoc2md --private --src lib/*  >>JSDOC.md
	jsdox --All -r --output JSDOX lib/*
	cat README-JSDOC.md JSDOC.md JSDOX/*  > README.md
	rm -r -f JSDOC.md JSDOX

.PHONY: test doc
