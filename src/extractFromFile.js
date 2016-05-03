import fs from 'fs';
import {parse} from 'babylon';
import traverse from 'babel-traverse';

function matchesMarkers(callee, markers) {
    return markers
        .map(marker => callee.matchesPattern(marker))
        .reduce((prev, curr) => prev || curr, false);
}

// adapted from https://github.com/oliviertassinari/i18n-extract/blob/master/src/extractFromCode.js
function extractString(node) {
    if (node.type === 'StringLiteral') {
        return node.value;
    } else if (node.type === 'BinaryExpression' && node.operator === '+') {
        return extractString(node.left) + extractString(node.right);
    }
    // else if (node.type === 'TemplateLiteral') {
    //     return node.quasis.reduce((key, quasi) => {
    //         const cooked = quasi.value.cooked;
    //
    //         if (key !== '' && cooked !== '') {
    //             return `${key}*${cooked}`;
    //         }
    //
    //         return key + cooked;
    //     }, '');
    // }
    else if (node.type === 'CallExpression' || node.type === 'Identifier') {
        return null; // We can't extract anything.
    } else {
        // console.warn(`Unsupported node: ${node.type}`);
        return null;
    }
}

export default function(filepath, markers) {
    const source = fs.readFileSync(filepath, 'utf-8');
    const ast = parse(source, {
        sourceType: 'module',
        plugins: [
            'jsx',
            'flow',
            'asyncFunctions',
            'classConstructorCall',
            'doExpressions',
            'trailingFunctionCommas',
            'objectRestSpread',
            'decorators',
            'classProperties',
            'exportExtensions',
            'exponentiationOperator',
            'asyncGenerators',
            'functionBind',
            'functionSent'
        ]
    });
    const output = [];

    traverse(ast, {
        CallExpression(path) {
            const {node} = path;
            const {callee: {name, type}} = node;

            if ((type === 'Identifier' && markers.indexOf(name) !== -1) || matchesMarkers(path.get('callee'), markers)) {
                const msgid = extractString(node.arguments[0]);
                if (msgid) {
                    output.push({
                        msgid,
                        loc: {
                            path: filepath,
                            line: node.loc.start.line
                        }
                    });
                }
            }
        }
    });

    return output;
}