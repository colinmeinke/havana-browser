/* global describe beforeEach it */

import Browser from '../../dist/browser';
import chai from 'chai';
import Event from 'havana-event';
import jsdom from 'jsdom';
import simulate from 'simulate';
import sinon from 'sinon';
import xmldom from 'xmldom';

global.DOMParser = xmldom.DOMParser;

const expect = chai.expect;

const dom = `<html>
               <body>
                 <a href="/hello-world">Hello world</a>
               </body>
             </html>`;

let browser;
let event;
let link;

describe( 'Browser', () => {
  beforeEach(() => {
    global.document = jsdom.jsdom( dom );
    global.window = document.parentWindow;

    link = document.documentElement.getElementsByTagName( 'a' )[ 0 ];

    event = new Event();

    browser = new Browser({
      'event': event,
      'reporting': {
        'reporter': console.log.bind( console ),
        'level': 0,
      },
    });
  });

  describe( 'listen()', () => {
    it( 'should publish `request.listening` event', done => {
      const spy = sinon.spy();

      event.subscribe( 'request.listening', spy );

      browser.listen();

      expect( spy.called ).to.equal( true );

      done();
    });

    it( 'should add click event listeners to links', done => {
      const spy = sinon.spy();

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );

      expect( spy.called ).to.equal( true );

      done();
    });
  });

  describe( 'request()', () => {
    it( 'should create unique request id', done => {
      const spy = sinon.spy( data => {
        return data.id;
      });

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );
      simulate.click( link );

      expect( spy.returnValues[ 0 ]).to.not.equal( spy.returnValues[ 1 ]);

      done();
    });

    it( 'should publish `request.received` event', done => {
      const spy = sinon.spy();

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );

      expect( spy.called ).to.equal( true );

      done();
    });
  });

  describe( 'navigate()', () => {
    it( 'should add new history entry', done => {
      const path = window.location.pathname;

      const spy = sinon.spy(() => {
        return window.location.pathname;
      });

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );

      expect( spy.returnValues[ 0 ]).not.to.equal( path );

      done();
    });
  });

  describe( 'response.handler.register()', () => {
    it( 'should add new item to handlers array', () => {
      event.publish( 'response.handler.register', {
        'name': 'hello',
      });

      expect( browser.handlers ).to.include( 'hello' );
    });
  });

  describe( 'response.handler.error()', () => {
    it( 'should increment `request.handlerErrors`', done => {
      const spy = sinon.spy( data => {
        const request = browser.requests.get( data.id );

        event.publish( 'response.handler.error', {
          'id': data.id,
          'name': 'hello',
        });

        return request.handlerErrors;
      });

      event.publish( 'response.handler.register', {
        'name': 'hello',
      });

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );

      expect( spy.returnValues[ 0 ]).to.equal( 1 );

      done();
    });

    it( 'should publish `response.error` event', done => {
      const spy = sinon.spy();

      event.subscribe( 'response.error', spy );

      event.publish( 'response.handler.register', {
        'name': 'hello',
      });

      event.subscribe( 'request.received', data => {
        event.publish( 'response.handler.error', {
          'id': data.id,
          'name': 'hello',
        });
      });

      browser.listen();

      simulate.click( link );

      expect( spy.called ).to.equal( true );

      done();
    });
  });

  describe( 'response.send()', () => {
    it( 'should patch the DOM', done => {
      const spy = sinon.spy( data => {
        event.publish( 'response.send', {
          'id': data.id,
          'content': `<html>
                        <body>
                          <a href="/new-page">New page</a>
                        </body>
                      </html>`,
        });

        return document.documentElement.getElementsByTagName( 'a' )[ 0 ];
      });

      event.subscribe( 'request.received', spy );

      browser.listen();

      simulate.click( link );

      expect( spy.returnValues[ 0 ].getAttribute( 'href' )).to.equal( '/new-page' );

      done();
    });

    it( 'should delete element from requests map', done => {
      const spy = sinon.spy( data => {
        event.publish( 'response.send', {
          'id': data.id,
          'content': `<html>
                        <body>
                          <a href="/new-page">New page</a>
                        </body>
                      </html>`,
        });

        return browser.requests.get( data.id );
      });

      event.subscribe( 'request.received', spy );

      event.publish( 'response.handler.register', {
        'name': 'hello',
      });

      browser.listen();

      simulate.click( link );

      expect( spy.returnValues[ 0 ]).to.equal( undefined );

      done();
    });
  });
});
