/* global describe, it */
var fs = require('fs')
var SASSLint = require('../')

describe('9e-sass-lint', function () {
  describe('#lint', function () {
    it('should lint the given source code and return a report', function (done) {
      var data = fs.readFileSync('./test/fixtures/test.sass').toString()
      SASSLint.lint(data)
        .then(function (report) {
          report.length.should.equal(2)
          report[0].error.should.equal('Property `top` should be defined before property `color` in line 6')
          report[1].error.should.equal('Property `left` should be defined before property `color` in line 6')
          done()
        })
    })
  })

  describe('#lintFile', function () {
    it('should lint the given file and return a report', function (done) {
      SASSLint.lintFile('test/fixtures/test.sass')
        .then(function (report) {
          report.length.should.equal(2)
          report[0].error.should.equal('Property `top` should be defined before property `color` in line 6')
          report[1].error.should.equal('Property `left` should be defined before property `color` in line 6')
          done()
        })
    })
  })
})
