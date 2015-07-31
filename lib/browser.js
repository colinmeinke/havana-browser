import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import virtualize from 'vdom-virtualize';

class Browser {
  constructor ( config ) {
    this.event = config.event;
    this.reporting = config.reporting;

    this.handlers = [];
    this.id = 1;
    this.listeners = [];
    this.navigateRef = this.navigate.bind( this );
    this.requests = new Map();

    this.init();
  }

  init () {
    this.event.subscribe( 'response.handler.register', data => {
      this.handlers.push( data.name );
    });

    this.event.subscribe( 'response.handler.error', data => {
      const request = this.requests.get( data.id );

      if ( request ) {
        request.handlerErrors++;

        if ( request.handlerErrors === this.handlers.length ) {
          this.event.publish( 'response.error', data );
        }
      }
    });

    this.event.subscribe( 'response.send', data => {
      if ( data.content ) {
        const content = new DOMParser().parseFromString( data.content, 'text/html' );
        const currentTree = virtualize( document.documentElement );
        const newTree = virtualize( content.documentElement );
        const patches = diff( currentTree, newTree );

        patch( document.documentElement, patches );

        this.addListeners();
      }

      this.requests.delete( data.id );
    });

    window.addEventListener( 'popstate', () => {
      this.request( document.location.pathname );
    }, false );
  }

  listen () {
    this.addListeners();

    if ( this.reporting.level > 0 ) {
      this.reporting.reporter( '-- Listening for requests in the browser' );
    }

    this.event.publish( 'request.listening', {
      'location': 'browser',
    });
  }

  removeListeners () {
    this.listeners.forEach( listener => {
      listener.removeEventListener( 'click', this.navigateRef );
    });

    this.listeners = [];
  }

  addListeners () {
    this.removeListeners();

    const links = document.getElementsByTagName( 'a' );
    const l = links.length;
    let i = 0;

    for ( ; i < l; i++ ) {
      this.listeners.push( links[ i ]);
      links[ i ].addEventListener( 'click', this.navigateRef );
    }
  }

  navigate ( e ) {
    const url = e.target.pathname;

    e.preventDefault();

    window.history.pushState({}, '', url );

    this.request( url );
  }

  request ( url ) {
    const id = this.id++;

    this.requests.set( id, {
      'handlerErrors': 0,
    });

    if ( this.reporting.level > 0 ) {
      this.reporting.reporter( `-- GET request received: ${url}` );
    }

    this.event.publish( 'request.received', {
      'id': id,
      'time': Date.now(),
      'method': 'GET',
      'url': url,
    });
  }
}

export default Browser;
