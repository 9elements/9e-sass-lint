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

var _ = require('underscore')
var Parser = require('./parser')

var order = [
  {
    name: 'Inheritance',
    check: function (node) {
      return ['extend', 'mixin'].indexOf(node.type) !== -1
    }
  }, {
    name: 'Position and Layout',
    check: function (node) {
      return [
        'position', 'z-index',
        'top', 'bottom', 'left', 'right',
        'float', 'clear'
      ].indexOf(node.name) !== -1 || node.name.match(/flex/i)
    }
  }, {
    name: 'Display and Visibility',
    check: function (node) {
      return [
        'display', 'opacity', 'transform'
      ].indexOf(node.name) !== -1
    }
  }, {
    name: 'Clipping',
    check: function (node) {
      return [
        'overflow', 'clip'
      ].indexOf(node.name) !== -1
    }
  }, {
    name: 'Animation',
    check: function (node) {
      return [
        'animation', 'transition'
      ].indexOf(node.name) !== -1
    }
  }, {
    name: 'Box Model',
    check: function (node) {
      return [
        'box-shadow', 'border', 'border-radius', 'box-sizing', 'width', 'height'
      ].indexOf(node.name) !== -1 || node.name.match(/margin|padding/i)
    }
  }, {
    name: 'Background',
    check: function (node) {
      return [
        'background', 'cursor'
      ].indexOf(node.name) !== -1
    }
  }, {
    name: 'Typography',
    check: function (node) {
      return [
        'font-size', 'line-height', 'font-family', 'font-weight', 'font-style', 'text-align',
        'text-transform', 'word-spacing', 'color'
      ].indexOf(node.name) !== -1
    }
  }, {
    name: 'Others',
    check: function (node) {
      return true
    }
  }
]

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

Linter.prototype._checkRuleset = function (file, ruleset) {
  var self = this
  var report = []
  var currentRuleIndex = 0
  var groupInitiator
  _.each(ruleset.properties, function (property, index) {
    var propertyRuleIndex
    // What rule does this property belong to?
    for (var i = 0; i < order.length; i++) {
      if (order[i].check(property)) {
        propertyRuleIndex = i
        break
      } else {
        propertyRuleIndex = 999
      }
    }

    if (propertyRuleIndex < currentRuleIndex) {
      var identifier = self._getIdentifierForProperty(property)
      var groupInitiatorIdentifier = self._getIdentifierForProperty(groupInitiator, false)

      report.push({
        file: file,
        position: property.position,
        error: identifier + ' should not be defined after ' + groupInitiatorIdentifier + ' in line ' + groupInitiator.position.line
      })
      return
    }

    currentRuleIndex = propertyRuleIndex
    groupInitiator = property
  })

  return report
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
