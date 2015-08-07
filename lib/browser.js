import diff from 'virtual-dom/diff';
import patch from 'virtual-dom/patch';
import virtualize from 'vdom-virtualize';

const _ = new WeakMap();

class Browser {
  constructor ( config ) {
    const props = {
      'event': config.event,
      'handlers': [],
      'id': 1,
      'listeners': [],
      'navigateRef': this.navigate.bind( this ),
      'reporting': config.reporting,
      'requests': new Map(),
    };

    _.set( this, props );

    this.init();
  }

  init () {
    const { event, handlers, requests } = _.get( this );

    event.subscribe( 'response.handler.register', data => {
      handlers.push( data.name );
    });

    event.subscribe( 'response.handler.error', data => {
      const request = requests.get( data.id );

      if ( request ) {
        request.handlerErrors++;

        if ( request.handlerErrors === handlers.length ) {
          event.publish( 'response.error', data );
        }
      }
    });

    event.subscribe( 'response.send', data => {
      if ( data.content ) {
        const content = new DOMParser().parseFromString( data.content, 'text/html' );
        const currentTree = virtualize( document.documentElement );
        const newTree = virtualize( content.documentElement );
        const patches = diff( currentTree, newTree );

        patch( document.documentElement, patches );

        this.addListeners();
      }

      requests.delete( data.id );
    });

    window.addEventListener( 'popstate', () => {
      this.request( document.location.pathname );
    }, false );
  }

  listen () {
    const { event, reporting } = _.get( this );

    this.addListeners();

    if ( reporting.level > 0 ) {
      reporting.reporter( '-- Listening for requests in the browser' );
    }

    event.publish( 'request.listening', {
      'location': 'browser',
    });
  }

  removeListeners () {
    const { listeners, navigateRef } = _.get( this );

    listeners.forEach( listener => {
      listener.removeEventListener( 'click', navigateRef );
    });

    _.get( this ).listeners = [];
  }

  addListeners () {
    this.removeListeners();

    const links = document.getElementsByTagName( 'a' );
    const l = links.length;
    const { listeners, navigateRef } = _.get( this );

    let i = 0;

    for ( ; i < l; i++ ) {
      listeners.push( links[ i ]);
      links[ i ].addEventListener( 'click', navigateRef );
    }
  }

  navigate ( e ) {
    const url = e.target.pathname;

    e.preventDefault();

    window.history.pushState({}, '', url );

    this.request( url );
  }

  request ( url ) {
    const { event, reporting, requests } = _.get( this );
    const id = _.get( this ).id++;

    requests.set( id, {
      'handlerErrors': 0,
    });

    if ( reporting.level > 0 ) {
      reporting.reporter( `-- GET request received: ${url}` );
    }

    event.publish( 'request.received', {
      'id': id,
      'time': Date.now(),
      'method': 'GET',
      'url': url,
    });
  }
}

export default Browser;
