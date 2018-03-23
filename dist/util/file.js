"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_extra_1 = require("fs-extra");
var i18n_json_webpack_loader_1 = require("../i18n-json-webpack-loader");
var lodash_1 = require("lodash");
var path_1 = require("path");
exports.loadTranslationFile = function (language) {
    var filePath = path_1.join(i18n_json_webpack_loader_1.OPTIONS.translationsDir, language, 'common.json');
    try {
        if (require.resolve(filePath))
            delete require.cache[filePath];
        return require(filePath);
    }
    catch (err) {
        fs_extra_1.outputFileSync(filePath, '');
        return false;
    }
};
exports.languages = function () {
    fs_extra_1.ensureDirSync(i18n_json_webpack_loader_1.OPTIONS.translationsDir);
    var dirs = fs_extra_1.readdirSync(i18n_json_webpack_loader_1.OPTIONS.translationsDir);
    return lodash_1.union(dirs, i18n_json_webpack_loader_1.OPTIONS.defaultLanguages);
};
//# sourceMappingURL=file.js.map