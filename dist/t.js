"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var i18n_json_webpack_loader_1 = require("./i18n-json-webpack-loader");
var isTranslationFunction = function (entity) {
    var translationFunction = i18n_json_webpack_loader_1.OPTIONS.translationFunction;
    var name = lodash_1.get(entity, 'callee.name');
    var foo = name === translationFunction;
    return foo;
};
exports.findTranslationFunctions = function (tree) {
    var iteratee = function (result, entity) {
        if (Array.isArray(entity)) {
            return lodash_1.reduce(entity, iteratee, result);
        }
        if (Object.prototype.toString.call(entity) === '[object Object]') {
            if (isTranslationFunction(entity)) {
                result.push(entity);
                return result;
            }
            return lodash_1.reduce(entity, iteratee, result);
        }
        return result;
    };
    return lodash_1.reduce(tree, iteratee, []);
};
exports.findTerms = function (translationsFunctions) {
    return translationsFunctions.reduce(function (result, translationFunction) {
        return translationFunction.arguments.reduce(function (result, arg) {
            var term = lodash_1.get(arg, 'value');
            if (term)
                result.push(term);
            return result;
        }, result);
    }, []);
};
//# sourceMappingURL=t.js.map