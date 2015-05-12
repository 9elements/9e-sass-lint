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

module.exports = [
  // SASS Inheritance
  function (node) { return node.type === 'extend' },

  // Position and layout
  'position',
  'z-index',
  'top',
  'bottom',
  'left',
  'right',
  'float',
  'clear',
  /flex/,

  // Display and visibility
  'display',
  'visibility',
  'opacity',
  'transform',

  // Clipping
  /overflow/,
  /clip/,

  // Animation
  'animation',
  'transition',

  // Box model
  'margin',
  'margin-top',
  'margin-right',
  'margin-bottom',
  'margin-left',
  'box-shadow',
  'border',
  'border-top',
  'border-right',
  'border-bottom',
  'border-left',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'border-style',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-radius',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'box-sizing',
  'width',
  'min-width',
  'max-width',
  'height',
  'min-height',
  'max-height',
  'padding',
  'padding-top',
  'padding-right',
  'padding-bottom',
  'padding-left',

  // Background
  'background',
  'background-color',
  'background-image',
  'background-repeat',
  'background-position',
  'background-size',
  'cursor',

  // Typography
  'font-family',
  'font-size',
  'line-height',
  'font-weight',
  'font-style',
  'text-align',
  'text-indent',
  'text-transform',
  'text-decoration',
  'text-rendering',
  'text-shadow',
  'text-overflow',
  'word-spacing',
  'letter-spacing',
  'white-space',
  'color',

  // Others
  'content'
]
