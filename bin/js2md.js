'use strict';

var fs          = require('fs-extra');
var path        = require('path');
var exec        = require('child_process').exec;
var inflection  = require('inflection');
var yaml        = require('js-yaml');
var pack        = require('../package.json');

var mdBase          = path.join(__dirname, '..', pack.directories.doc);
var ymlFile         = path.join(mdBase, '../mkdocs.yml');
var config          = yaml.safeLoad(fs.readFileSync(ymlFile, 'utf8'));
var apiPagesConfig  = getApiPagesConfig();

config['site_name']         = pack.name + ' ' + pack.version;
config['site_url']          = pack.homepage;
config['repo_url']          = pack.repository.url;
config['site_description']  = pack.description;
config['site_author']       = pack.author.name;
config['docs_dir']          = pack.directories.doc;

// Special inflected words
var conversion = {
    'm2m-relation': 'M2M Relation',
    'o2m-relation': 'O2M Relation',
    'm2o-relation': 'M2O Relation',
    'pg-index': 'Index',
    index: 'PG Structrue',
    db: 'DB'
};

function getFiles(dir, callback) {
    var files = fs.readdirSync(dir);
    files.forEach(function(file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            getFiles(path.join(dir, file), callback);
        } else {
            callback(null, dir, file);
        }
    });
}

function puts(error, stdout, stderr) {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) console.error(error);
}

function getApiPagesConfig() {
    var apiPagesIndex = config.pages.findIndex((element, index, array) => element.API);
    return config.pages[apiPagesIndex].API = [];
}

// Delete and recreate directory
fs.removeSync(path.join(mdBase, 'api'));
fs.ensureDir(path.join(mdBase, 'api'));
fs.copySync(path.join(__dirname, '..', 'LICENSE'), path.join(mdBase, 'license.md'));
fs.writeFileSync(path.join(mdBase, 'link-to-doc.md'), `\n\n# Documentation\n\nSee full documentation at [${pack.homepage}](${pack.homepage})\n\n`);

// Create API md files.
getFiles(__dirname + '/../lib', function(err, dir, file) {
    let base    = path.basename(file, path.extname(file));
    let title   = conversion[base] || inflection.titleize(base);

    if (dir.match(/util$/) || path.extname(file) !== '.js') return; // Only js files not located in util directory.

    // Add page to YAML config.
    let configLine = {};
    configLine[title] = path.join('api', `${base}.md`);
    apiPagesConfig.push(configLine);

    let source = path.join(dir, file);
    let target = path.join(mdBase, 'api', `${base}.md`);

    exec(`jsdoc2md ${source} > ${target}`, puts);
});

// Write YAML config
fs.writeFileSync(ymlFile, yaml.safeDump(config));
