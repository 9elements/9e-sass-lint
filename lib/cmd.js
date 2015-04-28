#!/usr/bin/env node
/**
 * 9e-sass-lint
 * Stick to our CSS rule order
 *
 * Copyright (c) 2015 Sascha Gehlich <sascha@gehlich.us>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var path = require('path')
var stdin = require('get-stdin')
var Promise = require('bluebird')
var yargs = require('yargs')
var _ = require('underscore')
var glob = require('glob')

var File = require('./file')
var Linter = require('./linter')

var argv = yargs.usage('Usage: $0 [options] [FILES...]')
  .option('stdin', {
    demand: false,
    describe: 'Lint SASS from stdin',
    type: 'boolean'
  })
  .argv

function CLI () {
  this._linter = new Linter()
}

/**
 * Lints the files and prints the result
 * @returns {Promise}
 */
CLI.prototype.run = function () {
  return this._findAndReadFiles()
    .then(this._linter.lintFiles.bind(this._linter))
    .then(this._printResult.bind(this))
}

/**
 * Finds the files that should be linted, depending on the CLI arguments
 * @return {Promise}
 * @private
 */
CLI.prototype._findAndReadFiles = function () {
  if (argv.stdin) {
    return this._createFileFromStdin()
  } else {
    if (argv._.length) {
      var filePaths = argv._.map(function (fileName) {
        return path.resolve(process.cwd(), fileName)
      })
      return this._readFiles(filePaths)
    } else {
      return this._readCwd()
    }
  }
}

/**
 * Creates a File object from the standard input
 * @return {Promise}
 * @private
 */
CLI.prototype._createFileFromStdin = function () {
  return new Promise(function (resolve, reject) {
    stdin(function (data) {
      resolve([new File('stdin', data)])
    })
  })
}

/**
 * Creates and loads files from the given file paths
 * @param  {Array.<String>} filePaths
 * @return {Promise}
 * @private
 */
CLI.prototype._readFiles = function (filePaths) {
  var files = []
  return Promise.all(filePaths.map(function (filePath) {
    var file = new File(filePath)
    files.push(file)
    return file.load()
  })).then(function () {
    return files
  })
}

/**
 * Finds all .sass files in the current workdir
 * @return {Promise}
 * @private
 */
CLI.prototype._readCwd = function () {
  var self = this
  return new Promise(function (resolve, reject) {
    glob('**/*.sass', {
      cwd: process.cwd(),
      ignore: ['node_modules/**/*'],
      nodir: true
    }, function (err, files) {
      if (err) {
        return reject(err)
      }

      resolve(files)
    })
  }).then(function (filePaths) {
    return self._readFiles(filePaths)
  })
}

/**
 * Prints the result
 * @param  {Object} result
 * @private
 */
CLI.prototype._printResult = function (result) {
  _.each(result, function (error, index) {
    console.log('%s:%d:%d: %s',
      error.file.name, error.position.line,
      error.position.column, error.error
    )
  })
}

var cli = new CLI()
cli.run()
