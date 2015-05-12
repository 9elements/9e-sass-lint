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

var moveArrayItem = function (arr, old_index, new_index) {
  if (new_index >= arr.length) {
    var k = new_index - arr.length
    while ((k--) + 1) {
      arr.push(undefined)
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0])
}

var Promise = require('bluebird')

function Fixer (linter) {
  this._linter = linter
}

Fixer.prototype.fixReport = function (file, report) {
  var self = this
  this._fixFirstProblem(file, report)
    .then(function () {
      return self._linter.lintFile(file)
        .then(function (report) {
          if (report.length) {
            return self.fixReport(file, report)
          } else {
            console.log(file.content)
          }
        })
    })
}

Fixer.prototype._fixFirstProblem = function (file, report) {
  return new Promise(function (resolve, reject) {
    var firstProblem = report[0]
    var lines = file.content.split('\n')

    moveArrayItem(lines, firstProblem.line - 1, firstProblem.correctLine - 1)
    file.content = lines.join('\n')
    resolve()
  })
}

module.exports = Fixer
