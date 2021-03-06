# xtractor [![Build Status](https://img.shields.io/travis/pinterest-web/xtractor/master.svg?style=flat)](https://travis-ci.org/pinterest-web/xtractor) [![npm version](https://img.shields.io/npm/v/xtractor.svg?style=flat)](https://www.npmjs.com/package/xtractor)

> Simple string extraction

**xtractor** statically analyzes js files or globs of files and extracts strings within designated function call

## Usage

Import the library
```js
var xtractor = require('xtractor');
```
or
```js
import * as xtractor from 'xtractor';
```

### Extract strings from a file

```js
xtractor.extractFromFile(__dirname + '/source.js', ['_', 'i18n._'], function(err, strings) {
    // use strings
});
```

A promise-based API is also supported

```js
xtractor.extractFromFile(__dirname + '/source.js', ['_', 'i18n._'])
.then(function(strings) {
    // use strings
})
.catch(function(err) {
    // process error
});
```

### Extract strings from a glob

```js
xtractor.extractGlob(__dirname + '/*.js', ['_', 'i18n._'], function(err, strings) {
    // use strings
});
```

Promised-based API

```js
xtractor.extractGlob(__dirname + '/*.js', ['_', 'i18n._'])
.then(function(err, strings) {
    // use strings
})
.catch(function(err) {
    // process error
});
```

Specify an object with the glob as the `glob` property and a regexp ignore pattern as the `ignorePattern` property

```js
xtractor.extractGlob({
    glob: __dirname + '/**/*.js',
    ignorePattern: /node_modules/
}, ['_', 'i18n._'], function(err, strings) {
    // use strings
});
```

## Expected and output format

The expected format for extraction is a call to the marker function with either one or three arguments, depending on pluralization.

Suppose the marker function is `i18n._()`:

### Singular
```js
const str = i18n._('You have new messages');
```
will output
```json
{
    "msgid": "You have new messages",
    "loc": [
        {
            "filepath": "sample.js",
            "line": 1
        }
    ]
}
```

### Plural
```js
const str = i18n._('You have {{ count }} new message', 'You have {{ count }} new messages', count);
```
will output
```json
{
    "msgid": [
        "You have {{ count }} new message",
        "You have {{ count }} new messages"
    ],
    "loc": [
        {
            "filepath": "sample.js",
            "line": 1
        }
    ]
}
```