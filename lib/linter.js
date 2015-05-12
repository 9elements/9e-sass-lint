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

var Promise = require('bluebird')
var _ = require('underscore')
var Parser = require('./parser')
var order = require('./rules/9elements')

function Linter () {

}

/**
 * Lints the given file
 * @param  {File} file
 * @return {Promise}
 */
Linter.prototype.lintFile = function (file) {
  var self = this
  var totalReport = []
  return Parser.parse(file.content)
    .then(function (rulesets) {
      _.each(rulesets, function (ruleset, index) {
        var report = self._checkRuleset(file, ruleset)
        totalReport = totalReport.concat(report)
      })

      return totalReport
    })
}

/**
 * Checks the given ruleset of the given file
 * @param  {File} file
 * @param  {Object} ruleset
 * @return {Array}
 * @private
 */
Linter.prototype._checkRuleset = function (file, ruleset) {
  var self = this
  var report = []
  var currentRuleIndex = 0
  _.each(ruleset.properties, function (property, index) {
    var propertyRuleIndex = self._findRuleIndexForProperty(property)
    var identifier = self._getIdentifierForProperty(property)

    if (propertyRuleIndex < currentRuleIndex) {
      var correctNextProperty
      // Find out where this property should be put
      _.each(ruleset.properties, function (property, index) {
        if (correctNextProperty) { return }

        var _propertyRuleIndex = self._findRuleIndexForProperty(property)

        if (_propertyRuleIndex >= propertyRuleIndex) {
          correctNextProperty = property
        }
      })

      var correctNextPropertyIdentifier = self._getIdentifierForProperty(correctNextProperty)

      report.push({
        file: file,
        position: property.position,
        line: property.position.line,
        correctLine: correctNextProperty.position.line,
        error: identifier + ' should be defined before ' + correctNextPropertyIdentifier + ' in line ' + correctNextProperty.position.line
      })
      return
    }

    currentRuleIndex = propertyRuleIndex
  })

  return report
}

/**
 * Finds the rule index for the given property
 * @param  {Number} property
 * @return {Number}
 * @private
 */
Linter.prototype._findRuleIndexForProperty = function (property) {
  // What rule does this property belong to?
  for (var i = 0; i < order.length; i++) {
    var check = order[i]
    if (typeof check === 'string') {
      check = property.name === order[i]
    } else if (check instanceof RegExp) {
      check = check.test(property.name)
    } else if (typeof check === 'function') {
      check = check(property)
    }

    if (check) {
      return i
    }
  }
}

/**
 * Creates a "human readable" version of the given property
 * @param  {Object} property
 * @param  {String} capitalized = true
 * @return {String}
 * @private
 */
Linter.prototype._getIdentifierForProperty = function (property, capitalized) {
  if (typeof capitalized === 'undefined') {
    capitalized = true
  }

  var identifier
  if (property.type === 'property') {
    identifier = (capitalized ? 'Property' : 'property') + ' `' + property.name + '`'
  } else {
    if (capitalized) {
      identifier = property.type.substr(0, 1).toUpperCase() + property.type.substr(1)
    } else {
      identifier = property.type
    }
  }
  return identifier
}

/**
 * Lints the given files
 * @param  {Array.<File>} files
 * @return {Promise}
 */
Linter.prototype.lintFiles = function (files) {
  var self = this

  return Promise.all(files.map(function (file) {
    return self.lintFile(file)
  })).then(function (reports) {
    return _.flatten(reports)
  })
}

module.exports = Linter
