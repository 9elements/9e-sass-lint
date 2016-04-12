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
var Parser = {}

/**
 * Parses the given file and finds rulesets
 * @param  {File} file
 * @return {Promise}
 */
Parser.parse = function (source) {
  return new Promise(function (resolve, reject) {
    var currentIndentation = 0
    var indentation
    var lines = source.split('\n')

    var rulesets = []
    var currentRuleset, currentSelector = ''
    var newRuleset
    var inComment = false
    var disable = false
    var isCommentLine = false
    var name
    var ruleset

    for (var index = 0; index < lines.length; i++) {
      var line = lines[index]
      if (!line.trim().length) { return }

      isCommentLine = false

      // Handle comments
      if (line.trim().match(/^\/\*/i)) {
        inComment = true
        isCommentLine = true
      }
      if (line.trim().match(/\*\/$/i) && inComment) {
        inComment = false
        isCommentLine = true
      }

      if (line.trim().match(/(\/\/|\/\*)\s+?9e-sass-lint-disable/i) ||
        inComment && line.match(/9e-sass-lint-disable/i)) {
        disable = true
        isCommentLine = true
      }

      if (line.trim().match(/(\/\/|\/\*)\s+?9e-sass-lint-enable/i) ||
        inComment && line.match(/9e-sass-lint-enable/i)) {
        disable = false
        isCommentLine = true
      }

      if (line.trim().match(/\*\/$/i)) { return }
      if (inComment || disable || isCommentLine) {
        return
      }

      try {
        var indentMatch = line.match(/^(\s+)?/i)
        var lineIndentation = 0
        if (indentMatch[1]) {
          lineIndentation = indentMatch[1].length
        }

        if (lineIndentation !== 0 && !indentation) {
          indentation = lineIndentation
        }

        if (lineIndentation < currentIndentation) {
          var indentationDiff = currentIndentation - lineIndentation
          var indentationSteps = Math.floor(indentationDiff / indentation)
          for (var i = 0; i < indentationSteps; i++) {
            if (currentRuleset && currentRuleset.parent) {
              currentSelector = currentRuleset.parent.selector || ''
            } else {
              currentSelector = ''
            }
          }
        } else if (lineIndentation > currentIndentation && newRuleset) {
          currentRuleset = newRuleset
          currentSelector = currentRuleset.selector || ''
        }

        currentIndentation = lineIndentation

        // Check for selector
        var selectorMatch = line.trim().match(/(^[&-.*|#|\*|\.|\[|>|\+].*)|(^[\w ,.#]+$)/i)
        if (selectorMatch) {
          var selector = currentSelector + selectorMatch[1]
          ruleset = {
            type: 'selector',
            name: selector,
            position: {
              line: index + 1,
              column: lineIndentation
            },
            parent: currentRuleset,
            properties: []
          }
          rulesets.push(ruleset)

          newRuleset = ruleset
        }

        // Check for mixin
        var mixinMatch = line.trim().match(/^(@include.*|\+[a-zA-Z-])/i)
        if (mixinMatch) {
          if (currentRuleset) {
            currentRuleset.properties.push({
              type: 'mixin',
              position: {
                line: index + 1,
                column: lineIndentation
              }
            })
          }
        }

        // Check for function
        var functionCallMatch = line.trim().match(/^@(.*)|=(.*)/i)
        if (functionCallMatch) {
          name = functionCallMatch[1]
          ruleset = {
            type: 'function',
            name: name,
            position: {
              line: index + 1,
              column: lineIndentation
            },
            parent: currentRuleset,
            properties: []
          }
          rulesets.push(ruleset)

          newRuleset = ruleset
        }

        // Check for placeholder selector
        var placeholderMatch = line.trim().match(/^\%(.*)/i)
        if (placeholderMatch) {
          name = placeholderMatch[1]
          ruleset = {
            type: 'placeholder selector',
            name: name,
            position: {
              line: index + 1,
              column: lineIndentation
            },
            parent: currentRuleset,
            properties: []
          }
          rulesets.push(ruleset)

          newRuleset = ruleset
        }

        // Check for property
        var propertyMatch = line.trim().match(/^([a-zA-Z-]+):\s+(.*)$/i)
        if (propertyMatch) {
          currentRuleset.properties.push({
            type: 'property',
            position: {
              line: index + 1,
              column: lineIndentation
            },
            name: propertyMatch[1],
            value: propertyMatch[2]
          })
        }
      } catch (e) {
        console.log('Failed at line ' + (index + 1) + ':', line)
        console.log(e.stack)
        return
      }
    }

    resolve(rulesets)
  })
}

module.exports = Parser
