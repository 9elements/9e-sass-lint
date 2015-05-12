/* global describe, it */
var fs = require('fs')
var SASSLint = require('../')

describe('bugs', function () {
  describe('@if', function () {
    it('should not fail', function (done) {
      var data = fs.readFileSync('./test/fixtures/if.sass').toString()
      SASSLint.lint(data)
        .then(function (report) {
          done()
        })
    })
  })

  describe('-vendor-prefixes', function () {
    it('should not fail', function (done) {
      var data = fs.readFileSync('./test/fixtures/prefixes.sass').toString()
      SASSLint.lint(data)
        .then(function (report) {
          done()
        })
    })
  })
})
