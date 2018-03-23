"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var loader_utils_1 = require("loader-utils");
var lodash_1 = require("lodash");
var path_1 = require("path");
var fs_extra_1 = require("fs-extra");
var espree_1 = require("espree");
var trans_1 = require("./trans");
var t_1 = require("./t");
var file_1 = require("./util/file");
var APP_ROOT = fs_extra_1.realpathSync(process.cwd()) || process.cwd();
var defaultOptions = {
    translationFunction: 't',
    translationsDir: path_1.resolve(APP_ROOT, 'lib/locales'),
    defaultLanguages: ['de', 'en', 'ja'],
};
exports.OPTIONS = Object.assign({}, defaultOptions);
exports.parser = function (source) {
    return espree_1.parse(source, {
        ecmaVersion: 7,
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
    });
};
var findTerm = function (term, file) {
    var match = lodash_1.find(file, { term: term });
    return match;
};
var stringifyTerms = function (terms) {
    var jsonText = JSON.stringify(terms, null, 2);
    var s = '';
    for (var i = 0; i < jsonText.length; ++i) {
        var c = jsonText[i];
        if (c >= '\x7F')
            c = '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4);
        s += c;
    }
    return s + "\n";
};
exports.writeTermsToFiles = function (terms) {
    return file_1.languages().reduce(function (result, dir) {
        var translations = file_1.loadTranslationFile(dir) || [];
        var termsToWrite = terms.reduce(function (result, term) {
            var match = findTerm(term, translations);
            if (!match)
                result.push({ term: term, definition: '' });
            return result;
        }, []);
        var blep = stringifyTerms(translations.concat(termsToWrite));
        var filePath = path_1.join(exports.OPTIONS.translationsDir, dir, 'common.json');
        result[dir] = fs_extra_1.writeFileSync(filePath, blep, 'utf8');
        return result;
    }, {});
};
function loader(source, map) {
    exports.OPTIONS = Object.assign({}, defaultOptions, loader_utils_1.getOptions(this));
    var tree = exports.parser(source);
    var transComponents = trans_1.findTransComponents(tree);
    var transTerms = trans_1.sanitizeTerms(transComponents);
    var translationFunctions = t_1.findTranslationFunctions(tree);
    var translationFunctionsTerms = t_1.findTerms(translationFunctions);
    var mergedTerms = transTerms.concat(translationFunctionsTerms);
    exports.writeTermsToFiles(mergedTerms);
    this.callback(null, source, map);
}
exports.default = loader;
;
//# sourceMappingURL=i18n-json-webpack-loader.js.map