/* global describe beforeEach it */

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _distBrowserWithPolyfill = require('../../dist/browser.with-polyfill');

var _distBrowserWithPolyfill2 = _interopRequireDefault(_distBrowserWithPolyfill);

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _havanaEvent = require('havana-event');

var _havanaEvent2 = _interopRequireDefault(_havanaEvent);

var _jsdom = require('jsdom');

var _jsdom2 = _interopRequireDefault(_jsdom);

var _simulate = require('simulate');

var _simulate2 = _interopRequireDefault(_simulate);

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

    browser = new _distBrowserWithPolyfill2['default']({
      'event': event,
      'reporting': {
        'reporter': console.log.bind(console),
        'level': 0
      }
    });
  });

  describe('_', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('_');
    });
  });

  describe('event', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('event');
    });
  });

  describe('handlers', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('handlers');
    });
  });

  describe('id', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('id');
    });

    it('should be incremented on each request received', function (done) {
      var id = null;

      event.subscribe('request.received', function (data) {
        expect(data.id).to.not.equal(id);

        if (id) {
          done();
        }

        id = data.id;
      });

      browser.listen();

      _simulate2['default'].click(link);
      _simulate2['default'].click(link);
    });
  });

  describe('listeners', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('listeners');
    });
  });

  describe('navigateRef', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('navigateRef');
    });
  });

  describe('reporting', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('reporting');
    });
  });

  describe('requests', function () {
    it('should be private', function () {
      expect(browser).to.not.have.property('requests');
    });
  });

  describe('request.listening', function () {
    it('should be published when browser is ready to dispatch', function (done) {
      event.subscribe('request.listening', function () {
        done();
      });

      browser.listen();
    });
  });

  describe('request.received', function () {
    it('should be published when browser receives a request', function (done) {
      event.subscribe('request.received', function () {
        done();
      });

      browser.listen();

      _simulate2['default'].click(link);
    });
  });

  describe('response.error', function () {
    it('should be published when all registered handlers have failed to handle a request', function (done) {
      event.subscribe('response.error', function () {
        done();
      });

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
    });
  });

  describe('response.send', function () {
    it('should patch the DOM', function (done) {
      event.subscribe('request.received', function (data) {
        event.publish('response.send', {
          'id': data.id,
          'content': '<html>\n                        <body>\n                          <a href="/new-page">New page</a>\n                        </body>\n                      </html>'
        });

        expect(document.documentElement.getElementsByTagName('a')[0].getAttribute('href')).to.equal('/new-page');
        done();
      });

      browser.listen();

      _simulate2['default'].click(link);
    });
  });

  describe('addListeners()', function () {
    it('should add click event listeners to links', function (done) {
      event.subscribe('request.received', function () {
        done();
      });

      browser.listen();

      _simulate2['default'].click(link);
    });
  });

  describe('navigate()', function () {
    it('should add new history entry', function (done) {
      var path = window.location.pathname;

      event.subscribe('request.received', function () {
        expect(window.location.pathname).not.to.equal(path);
        done();
      });

      browser.listen();

      _simulate2['default'].click(link);
    });
  });
});