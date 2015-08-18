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

var Linter = require('./lib/linter')
var File = require('./lib/file')

module.exports = {
  /**
   * Lints the given source code
   * @param  {String} code
   * @return {Promise}
   */
  lint: function (code) {
    if (!!code) {
      var linter = new Linter()
      var file = new File('file', code)
      return linter.lintFile(file)
    } else {
      return Promise.resolve(true)
    }
  },

  /**
   * Lints the given file
   * @param  {String} filePath
   * @return {Promise}
   */
  lintFile: function (filePath) {
    var linter = new Linter()
    var file = new File(filePath)
    return file.load()
      .then(function () {
        return linter.lintFile(file)
      })
  }
}
