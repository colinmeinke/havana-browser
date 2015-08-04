/* global describe beforeEach it */

import Browser from '../../dist/browser.with-polyfill';
import chai from 'chai';
import Event from 'havana-event';
import jsdom from 'jsdom';
import simulate from 'simulate';
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

  describe( '_', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( '_' );
    });
  });

  describe( 'event', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'event' );
    });
  });

  describe( 'handlers', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'handlers' );
    });
  });

  describe( 'id', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'id' );
    });

    it( 'should be incremented on each request received', done => {
      let id = null;

      event.subscribe( 'request.received', data => {
        expect( data.id ).to.not.equal( id );

        if ( id ) {
          done();
        }

        id = data.id;
      });

      browser.listen();

      simulate.click( link );
      simulate.click( link );
    });
  });

  describe( 'listeners', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'listeners' );
    });
  });

  describe( 'navigateRef', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'navigateRef' );
    });
  });

  describe( 'reporting', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'reporting' );
    });
  });

  describe( 'requests', () => {
    it( 'should be private', () => {
      expect( browser ).to.not.have.property( 'requests' );
    });
  });

  describe( 'request.listening', () => {
    it( 'should be published when browser is ready to dispatch', done => {
      event.subscribe( 'request.listening', () => {
        done();
      });

      browser.listen();
    });
  });

  describe( 'request.received', () => {
    it( 'should be published when browser receives a request', done => {
      event.subscribe( 'request.received', () => {
        done();
      });

      browser.listen();

      simulate.click( link );
    });
  });

  describe( 'response.error', () => {
    it( 'should be published when all registered handlers have failed to handle a request', done => {
      event.subscribe( 'response.error', () => {
        done();
      });

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
    });
  });

  describe( 'response.send', () => {
    it( 'should patch the DOM', done => {
      event.subscribe( 'request.received', data => {
        event.publish( 'response.send', {
          'id': data.id,
          'content': `<html>
                        <body>
                          <a href="/new-page">New page</a>
                        </body>
                      </html>`,
        });

        expect( document.documentElement.getElementsByTagName( 'a' )[ 0 ].getAttribute( 'href' )).to.equal( '/new-page' );
        done();
      });

      browser.listen();

      simulate.click( link );
    });
  });

  describe( 'addListeners()', () => {
    it( 'should add click event listeners to links', done => {
      event.subscribe( 'request.received', () => {
        done();
      });

      browser.listen();

      simulate.click( link );
    });
  });

  describe( 'navigate()', () => {
    it( 'should add new history entry', done => {
      const path = window.location.pathname;

      event.subscribe( 'request.received', () => {
        expect( window.location.pathname ).not.to.equal( path );
        done();
      });

      browser.listen();

      simulate.click( link );
    });
  });
});
