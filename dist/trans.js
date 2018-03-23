"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var isCreateElement = function (entity) { return lodash_1.get(entity, 'callee.property.name') === 'createElement'; };
var checkTransOn = function (obj) { return (lodash_1.get(obj, 'type') === 'MemberExpression'
    && lodash_1.get(obj, 'property.name') === 'Trans'); };
var isTrans = function (args) { return args
    && checkTransOn(args[0])
    || checkTransOn(args); };
// NOTE: Should `createElement` or `Trans` be configurable?
var isTransComponent = function (entity) {
    return isCreateElement(entity)
        && isTrans(entity.arguments);
};
var replaceTags = function (tree) {
    var it = function (collection, i, r) { return collection.reduce(function (result, entity) {
        var isTransEntity = isTrans(entity);
        if (isCreateElement(entity) && isTransEntity)
            return result;
        if (isCreateElement(entity) && !isTransEntity) {
            entity.arguments[0].value = i;
            entity.arguments[0].raw = "\"" + i + "\"";
            entity.arguments = lodash_1.reject(entity.arguments, { type: 'ObjectExpression' });
            entity.arguments = it(entity.arguments, -1, []);
        }
        var isObjectExpression = lodash_1.get(entity, 'type') === 'ObjectExpression';
        var firstProp = isObjectExpression && lodash_1.get(entity, 'properties')[0];
        var isIdentifier = lodash_1.get(firstProp, 'value.type') === 'Identifier';
        if (isObjectExpression && isIdentifier) {
            entity.type = 'Literal';
            entity.value = "<" + i + ">{{" + firstProp.value.name + "}}</" + i + ">";
            entity.raw = "\"<" + i + ">{{" + firstProp.value.name + "}}</" + i + ">\"";
        }
        if (!isTransEntity && entity.value !== null)
            i++;
        result.push(entity);
        return result;
    }, r); };
    return it(tree, 0, []);
};
var generateHtml = function (tree) {
    var isLiteral = function (entity) { return entity.type === 'Literal'; };
    var hasValue = function (entity) { return entity.value && entity.value.length > 0; };
    var it = function (result, entity) {
        var text = '';
        if (isCreateElement(entity) && !isTrans(entity)) {
            var open_1 = "<" + entity.arguments[0].value + ">";
            var close_1 = "</" + entity.arguments[0].value + ">";
            var contents = entity.arguments.reduce(it, '');
            var value = open_1 + contents + close_1;
            result = "" + result + value;
            return result;
        }
        if (isLiteral(entity) && hasValue(entity)) {
            result = "" + result + entity.value;
            return result;
        }
        return result;
    };
    return tree.reduce(it, '');
};
exports.findTransComponents = function (tree) {
    var iteratee = function (result, entity) {
        if (Array.isArray(entity)) {
            return lodash_1.reduce(entity, iteratee, result);
        }
        if (Object.prototype.toString.call(entity) === '[object Object]') {
            if (isTransComponent(entity)) {
                result.push(entity.arguments);
                return result;
            }
            return lodash_1.reduce(entity, iteratee, result);
        }
        return result;
    };
    return lodash_1.reduce(tree, iteratee, []);
};
exports.sanitizeTerms = function (transComponents) {
    var newTree = transComponents.reduce(function (result, trans) {
        result.push(replaceTags(trans));
        return result;
    }, []);
    return transComponents.map(generateHtml);
};
//# sourceMappingURL=trans.js.map