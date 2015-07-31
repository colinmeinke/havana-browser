/* global describe beforeEach it */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _distBrowser = require('../../dist/browser');

var _distBrowser2 = _interopRequireDefault(_distBrowser);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _havanaEvent = require('havana-event');

var _havanaEvent2 = _interopRequireDefault(_havanaEvent);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _simulate = require('simulate');

var _simulate2 = _interopRequireDefault(_simulate);

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _xmldom = require('xmldom');

var _xmldom2 = _interopRequireDefault(_xmldom);

global.DOMParser = _xmldom2['default'].DOMParser;

var expect = _chai2['default'].expect;

var dom = '<html>\n               <body>\n                 <a href="/hello-world">Hello world</a>\n               </body>\n             </html>';

var browser = undefined;
var event = undefined;
var link = undefined;

describe('Browser', function () {
  beforeEach(function () {
    global.document = _jsdom2['default'].jsdom(dom);
    global.window = document.parentWindow;

    link = document.documentElement.getElementsByTagName('a')[0];

    event = new _havanaEvent2['default']();

    browser = new _distBrowser2['default']({
      'event': event,
      'reporting': {
        'reporter': console.log.bind(console),
        'level': 0
      }
    });
  });

  describe('listen()', function () {
    it('should publish `request.listening` event', function (done) {
      var spy = _sinon2['default'].spy();

      event.subscribe('request.listening', spy);

      browser.listen();

      expect(spy.called).to.equal(true);

      done();
    });

    it('should add click event listeners to links', function (done) {
      var spy = _sinon2['default'].spy();

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.called).to.equal(true);

      done();
    });
  });

  describe('request()', function () {
    it('should create unique request id', function (done) {
      var spy = _sinon2['default'].spy(function (data) {
        return data.id;
      });

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);
      _simulate2['default'].click(link);

      expect(spy.returnValues[0]).to.not.equal(spy.returnValues[1]);

      done();
    });

    it('should publish `request.received` event', function (done) {
      var spy = _sinon2['default'].spy();

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.called).to.equal(true);

      done();
    });
  });

  describe('navigate()', function () {
    it('should add new history entry', function (done) {
      var path = window.location.pathname;

      var spy = _sinon2['default'].spy(function () {
        return window.location.pathname;
      });

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.returnValues[0]).not.to.equal(path);

      done();
    });
  });

  describe('response.handler.register()', function () {
    it('should add new item to handlers array', function () {
      event.publish('response.handler.register', {
        'name': 'hello'
      });

      expect(browser.handlers).to.include('hello');
    });
  });

  describe('response.handler.error()', function () {
    it('should increment `request.handlerErrors`', function (done) {
      var spy = _sinon2['default'].spy(function (data) {
        var request = browser.requests.get(data.id);

        event.publish('response.handler.error', {
          'id': data.id,
          'name': 'hello'
        });

        return request.handlerErrors;
      });

      event.publish('response.handler.register', {
        'name': 'hello'
      });

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.returnValues[0]).to.equal(1);

      done();
    });

    it('should publish `response.error` event', function (done) {
      var spy = _sinon2['default'].spy();

      event.subscribe('response.error', spy);

      event.publish('response.handler.register', {
        'name': 'hello'
      });

      event.subscribe('request.received', function (data) {
        event.publish('response.handler.error', {
          'id': data.id,
          'name': 'hello'
        });
      });

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.called).to.equal(true);

      done();
    });
  });

  describe('response.send()', function () {
    it('should patch the DOM', function (done) {
      var spy = _sinon2['default'].spy(function (data) {
        event.publish('response.send', {
          'id': data.id,
          'content': '<html>\n                        <body>\n                          <a href="/new-page">New page</a>\n                        </body>\n                      </html>'
        });

        return document.documentElement.getElementsByTagName('a')[0];
      });

      event.subscribe('request.received', spy);

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.returnValues[0].getAttribute('href')).to.equal('/new-page');

      done();
    });

    it('should delete element from requests map', function (done) {
      var spy = _sinon2['default'].spy(function (data) {
        event.publish('response.send', {
          'id': data.id,
          'content': '<html>\n                        <body>\n                          <a href="/new-page">New page</a>\n                        </body>\n                      </html>'
        });

        return browser.requests.get(data.id);
      });

      event.subscribe('request.received', spy);

      event.publish('response.handler.register', {
        'name': 'hello'
      });

      browser.listen();

      _simulate2['default'].click(link);

      expect(spy.returnValues[0]).to.equal(undefined);

      done();
    });
  });
});