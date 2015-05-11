/* global describe, it */
var fs = require('fs')
var SASSLint = require('../')

describe('properties after sass-lint-disable', function () {
  it('should not be linted', function (done) {
    var data = fs.readFileSync('./test/fixtures/disable.sass').toString()
    SASSLint.lint(data)
      .then(function (report) {
        report.length.should.equal(0)
        done()
      })
  })
})

describe('properties after sass-lint-enable', function () {
  it('should be linted', function (done) {
    var data = fs.readFileSync('./test/fixtures/disable-enable.sass').toString()
    SASSLint.lint(data)
      .then(function (report) {
        report.length.should.equal(2)
        done()
      })
  })
})
