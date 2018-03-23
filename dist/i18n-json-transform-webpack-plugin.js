"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var CopyPlugin = require("copy-webpack-plugin");
exports.transform = function (buffer) {
    var content = JSON.parse(buffer.toString());
    var newContent = content.reduce(function (result, translation) {
        var term = translation.term;
        var definition = translation.definition || '';
        var one = definition.one, other = definition.other, many = definition.many, few = definition.few;
        var plural = other || many || few;
        if (typeof definition !== 'object') {
            var def = (typeof definition === 'string') && definition;
            def = def || other || many || few || term;
            return Object.assign(result, (_a = {}, _a[term] = def, _a));
        }
        return Object.assign(result, (_b = {}, _b[term] = one || plural || term, _b), plural && (_c = {}, _c[term + "_plural"] = plural || term, _c));
        var _a, _b, _c;
    }, {});
    return Buffer.from(JSON.stringify(newContent, null, 2));
};
var defaultPattern = {
    context: 'lib/locales/',
    from: '**/*.json',
    to: 'locales/',
    force: true,
    transform: exports.transform,
};
function I18nJsonTransform(patterns, options) {
    if (patterns === void 0) { patterns = [{}]; }
    if (options === void 0) { options = {}; }
    var mergedPatterns = patterns.map(function (pattern) {
        return __assign({}, defaultPattern, pattern);
    });
    var copyPlugin = new CopyPlugin(mergedPatterns, options);
    this.apply = copyPlugin.apply;
}
exports.default = I18nJsonTransform;
//# sourceMappingURL=i18n-json-transform-webpack-plugin.js.map