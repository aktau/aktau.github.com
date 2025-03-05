<!DOCTYPE HTML>
<html lang="en">
    <head>
        <meta charset="utf-8">

        <title>Nicolas Hillegeer - Portfolio and personal blog</title>

        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <meta name="description" content="">
        <meta name="keywords" content="notags">
        <meta name="author" content="Nicolas Hillegeer">
        <meta name="generator" content="nanoc 4.13.3">
        <meta name="robots" content="index,follow">

        <meta property="og:title" content="Nicolas Hillegeer - Portfolio and personal blog">
        <meta property="og:site_name" content="Nicolas Hillegeer - Portfolio and personal blog">
        <meta property="og:type" content="blog">
        <meta property="og:url" content="http://www.aktau.be/js/pjax-standalone.js">

        <!-- Google Fonts embed code -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400..700&display=swap" rel="stylesheet">

        
        <link rel="stylesheet" type="text/css" href="/stylesheets/all.css">
        

        <link rel="alternate" type="application/atom+xml" title="Posts" href="/atom.xml" />

        <!--[if lt IE 9]><script src="/js/html5shiv.js"></script><![endif]-->
    </head>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-BPQY780BNR"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      // Old universal analytics ID: ga('create', 'UA-37726728-1', 'aktau.be');
      gtag('config', 'G-BPQY780BNR');
    </script>
    <body>
        <nav>
            <h2>Nicolas Hillegeer</h2>
            <ul>
                <li><a href="/">Blog</a></li>
                <li><a href="/archive/">Archive</a></li>
                <li><a href="/cv-alt/cv.pdf" title="Résumé">Curriculum Vitae</a></li>
                <li><a href="/contact/" title="Personal information">About &amp; Contact</a></li>
            </ul>
            <h2>Online presence</h2>
            <ul>
                <li><a href="https://github.com/Aktau/">Github</a></li>
                <li><a href="https://twitter.com/alazyleopard">Twitter</a></li>
                <li><a href="http://stackoverflow.com/users/558819/aktau">Stack Overflow</a></li>
                <li><a href="https://soundcloud.com/aktau">Soundcloud</a></li>
            </ul>
            <!--
            <h2>Tags</h2>
            <ul>
                
                <li><a href="/tag/introduction">introduction (1)</a></li>
                
                <li><a href="/tag/nanoc">nanoc (1)</a></li>
                
                <li><a href="/tag/pygments">pygments (1)</a></li>
                
                <li><a href="/tag/github">github (2)</a></li>
                
                <li><a href="/tag/unix">unix (1)</a></li>
                
                <li><a href="/tag/c">c (1)</a></li>
                
                <li><a href="/tag/make">make (1)</a></li>
                
                <li><a href="/tag/linux">linux (1)</a></li>
                
                <li><a href="/tag/osx">osx (2)</a></li>
                
                <li><a href="/tag/sdl">sdl (1)</a></li>
                
                <li><a href="/tag/game-engine">game-engine (1)</a></li>
                
                <li><a href="/tag/open-source">open-source (1)</a></li>
                
                <li><a href="/tag/ffmpeg">ffmpeg (1)</a></li>
                
                <li><a href="/tag/github-release">github-release (1)</a></li>
                
                <li><a href="/tag/gofinance">gofinance (1)</a></li>
                
                <li><a href="/tag/golang">golang (1)</a></li>
                
                <li><a href="/tag/cross-compiling">cross-compiling (1)</a></li>
                
                <li><a href="/tag/imessage">imessage (1)</a></li>
                
                <li><a href="/tag/applescript">applescript (1)</a></li>
                
                <li><a href="/tag/postgres">postgres (1)</a></li>
                
                <li><a href="/tag/pigz">pigz (1)</a></li>
                
                <li><a href="/tag/rsync">rsync (1)</a></li>
                
                <li><a href="/tag/sysadmin">sysadmin (1)</a></li>
                
                <li><a href="/tag/neovim">neovim (1)</a></li>
                
                <li><a href="/tag/vim">vim (1)</a></li>
                
                <li><a href="/tag/encoding">encoding (1)</a></li>
                
            </ul>
            -->
        </nav>

        <main id="content">
            /**
 * PJAX- Standalone
 *
 * A standalone implementation of Pushstate AJAX, for non-jQuery web pages.
 * jQuery are recommended to use the original implementation at: http://github.com/defunkt/jquery-pjax
 *
 * @version 0.6.0
 * @author Carl
 * @source https://github.com/thybag/PJAX-Standalone
 * @license MIT
 */
(function(){

	// Object to store private values/methods.
	var internal = {
		// Is this the first usage of PJAX? (Ensure history entry has required values if so.)
		"firstrun": true,
		// Borrowed wholesale from https://github.com/defunkt/jquery-pjax
		// Attempt to check that a device supports pushstate before attempting to use it.
		"is_supported": window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)
	};

	// If PJAX isn't supported we can skip setting up the library all together
	// So as not to break any code expecting PJAX to be there, return a shell object containing
	// IE7 + compatible versions of connect (which needs to do nothing) and invoke ( which just changes the page)
	if(!internal.is_supported) {
		// PJAX shell, so any code expecting PJAX will work
		var pjax_shell = {
			"connect": function() { return; },
			"invoke": function() {
				var url = (arguments.length === 2) ? arguments[0] : arguments.url;
				document.location = url;
				return;
			}
		};
		// AMD support
		if (typeof define === 'function' && define.amd) {
			define( function() { return pjax_shell; });
		} else {
			window.pjax = pjax_shell;
		}
		return;
	}

	/**
	 * AddEvent
	 *
	 * @scope private
	 * @param obj Object to listen on
	 * @param event Event to listen for.
	 * @param callback Method to run when event is detected.
	 */
	internal.addEvent = function(obj, event, callback) {
		obj.addEventListener(event, callback, false);
	};

	/**
	 * Clone
	 * Util method to create copies of the options object (so they do not share references)
	 * This allows custom settings on different links.
	 *
	 * @scope private
	 * @param obj
	 * @return obj
	 */
	internal.clone = function(obj) {
		object = {};
		// For every option in object, create it in the duplicate.
		for (var i in obj) {
			object[i] = obj[i];
		}
		return object;
	};

	/**
	 * triggerEvent
	 * Fire an event on a given object (used for callbacks)
	 *
	 * @scope private
	 * @param node. Objects to fire event on
	 * @return event_name. type of event
	 */
	internal.triggerEvent = function(node, event_name, data) {
		// Good browsers
		evt = document.createEvent("HTMLEvents");
		evt.initEvent(event_name, true, true);
		// If additional data was provided, add it to event
		if(typeof data !== 'undefined') evt.data = data;
		node.dispatchEvent(evt);
	};

	/**
	 * popstate listener
	 * Listens for back/forward button events and updates page accordingly.
	 */
	internal.addEvent(window, 'popstate', function(st) {
		if(st.state !== null) {

			var opt = {
				'url': st.state.url,
				'container': st.state.container,
				'title' : st.state.title,
				'history': false
			};

			// Merge original in original connect options
			if(typeof internal.options !== 'undefined'){
				for(var a in internal.options){
					if(typeof opt[a] === 'undefined') opt[a] = internal.options[a];
				}
			}

			// Convert state data to PJAX options
			var options = internal.parseOptions(opt);
			// If something went wrong, return.
			if(options === false) return;
			// If there is a state object, handle it as a page load.
			internal.handle(options);
		}
	});

	/**
	 * attach
	 * Attach PJAX listeners to a link.
	 * @scope private
	 * @param link_node. link that will be clicked.
	 * @param content_node.
	 */
	internal.attach = function(node, options) {

		// Ignore external links.
		if ( node.protocol !== document.location.protocol ||
			node.host !== document.location.host ) {
			return;
		}

		// Ignore anchors on the same page
		if(node.pathname === location.pathname && node.hash.length > 0) {
			return true;
		}

        // Ignore non-html resources
        var exclude = {'pdf': true},
            ext = node.pathname.split('.').pop();
        if (ext in exclude) {
            return true;
        }

		// Add link HREF to object
		options.url = node.href;
		// If PJAX data is specified, use as container
		if(node.getAttribute('data-pjax')) {
			options.container = node.getAttribute('data-pjax');
		}
		// If data-title is specified, use as title.
		if(node.getAttribute('data-title')) {
			options.title = node.getAttribute('data-title');
		}
		// Check options are valid.
		options = internal.parseOptions(options);
		if(options === false) return;

		// Attach event.
		internal.addEvent(node, 'click', function(event) {
			// Allow middle click (pages in new windows)
			if ( event.which > 1 || event.metaKey || event.ctrlKey ) return;
			// Don't fire normal event
			if(event.preventDefault){ event.preventDefault(); }else{ event.returnValue = false; }
			// Take no action if we are already on said page?
			if(document.location.href === options.url) return false;
			// handle the load.
			internal.handle(options);
		});
	};

	/**
	 * parseLinks
	 * Parse all links within a DOM node, using settings provided in options.
	 * @scope private
	 * @param dom_obj. Dom node to parse for links.
	 * @param options. Valid Options object.
	 */
	internal.parseLinks = function(dom_obj, options) {

		if(typeof options.useClass !== 'undefined'){
			// Get all nodes with the provided class name.
			nodes = dom_obj.getElementsByClassName(options.useClass);
		}else{
			// If no class was provided, just get all the links
			nodes = dom_obj.getElementsByTagName('a');
		}

		// For all returned nodes
		for(var i=0,tmp_opt; i < nodes.length; i++) {
			node = nodes[i];
			if(typeof options.excludeClass !== 'undefined') {
				if(node.className.indexOf(options.excludeClass) !== -1) continue;
			}
			// Override options history to true, else link parsing could be triggered by back button (which runs in no-history mode)
			tmp_opt = internal.clone(options);
			tmp_opt.history = true;
			internal.attach(node, tmp_opt);
		}

		// Fire ready event once all links are connected
		if(internal.firstrun)
			internal.triggerEvent(internal.get_container_node(options.container), 'ready');
	};

	/**
	 * SmartLoad
	 * Smartload checks the returned HTML to ensure PJAX ready content has been provided rather than
	 * a full HTML page. If a full HTML has been returned, it will attempt to scan the page and extract
	 * the correct HTML to update our container with in order to ensure PJAX still functions as expected.
	 *
	 * @scope private
	 * @param HTML (HTML returned from AJAX)
	 * @param options (Options object used to request page)
	 * @return HTML to append to our page.
	 */
	internal.smartLoad = function(html, options) {
		// Create tmp node (So we can interact with it via the DOM)
		var tmp = document.createElement('div');

		// Add HTML
		tmp.innerHTML = html;

		// Grab the title if there is one
		var title = tmp.getElementsByTagName('title')[0].innerHTML;
		if(title)
			document.title = title;

		// Look through all returned divs.
		tmpNodes = tmp.getElementsByTagName('main');
		for(var i=0;i<tmpNodes.length;i++) {
			if(tmpNodes[i].id === options.container.id){
				// If our container div is within the returned HTML, we both know the returned content is
				// not PJAX ready, but instead likely the full HTML content. in Addition we can also guess that
				// the content of this node is what we want to update our container with.
				// Thus use this content as the HTML to append in to our page via PJAX.
				return tmpNodes[i].innerHTML;
			}
		}
		// If our container was not found, HTML will be returned as is.
		return html;
	};

	/**
	 * handle
	 * Handle requests to load content via PJAX.
	 * @scope private
	 * @param url. Page to load.
	 * @param node. Dom node to add returned content in to.
	 * @param addtohistory. Does this load require a history event.
	 */
	internal.handle = function(options) {

		// Fire beforeSend Event.
		internal.triggerEvent(options.container, 'beforeSend', options);

		// Do the request
		internal.request(options.url, function(html) {

			// Fail if unable to load HTML via AJAX
			if(html === false){
				internal.triggerEvent(options.container,'complete', options);
				internal.triggerEvent(options.container,'error', options);
				return;
			}

			// Ensure we have the correct HTML to apply to our container.
			if(options.smartLoad) html = internal.smartLoad(html, options);

			// If no title was provided
			if(typeof options.title === 'undefined'){
				// Use current doc title (this will be updated via smart load if its enabled)
				options.title = document.title;

				// Attempt to grab title from non-smart loaded page contents
				if(!options.smartLoad){
					var tmpTitle = options.container.getElementsByTagName('title');
					if(tmpTitle.length !== 0) options.title = tmpTitle[0].innerHTML;
				}
			}

			// Update the DOM with the new content
			options.container.innerHTML = html;

			// Do we need to add this to the history?
			if(options.history) {
				// If this is the first time pjax has run, create a state object for the current page.
				if(internal.firstrun){
					window.history.replaceState({'url': document.location.href, 'container':  options.container.id, 'title': document.title}, document.title);
					internal.firstrun = false;
				}
				// Update browser history
				window.history.pushState({'url': options.url, 'container': options.container.id, 'title': options.title }, options.title , options.url);
			}

			// Initialize any new links found within document (if enabled).
			if(options.parseLinksOnload){
				internal.parseLinks(options.container, options);
			}

			// Fire Events
			internal.triggerEvent(options.container,'complete', options);
			internal.triggerEvent(options.container,'success', options);

			// Don't track if page isn't part of history, or if autoAnalytics is disabled
			if(options.autoAnalytics && options.history) {
				// If autoAnalytics is enabled and a Google analytics tracker is detected push
				// a trackPageView, so PJAX loaded pages can be tracked successfully.
				if(window._gaq) _gaq.push(['_trackPageview']);
				if(window.ga) ga('send', 'pageview', {'page': options.url, 'title': options.title});
			}

			// Set new title
			document.title = options.title;

			// Scroll page to top on new page load
			if(options.returnToTop) {
				window.scrollTo(0, 0);
			}
		});
	};

	/**
	 * Request
	 * Performs AJAX request to page and returns the result..
	 *
	 * @scope private
	 * @param location. Page to request.
	 * @param callback. Method to call when a page is loaded.
	 */
	internal.request = function(location, callback) {
		// Create xmlHttpRequest object.
		var xmlhttp;
		try {
			xmlhttp = window.XMLHttpRequest? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		}  catch (e) {
			console.log("Unable to create XMLHTTP Request");
			return;
		}
		// Add state listener.
		xmlhttp.onreadystatechange = function() {
			if ((xmlhttp.readyState === 4) && (xmlhttp.status === 200)) {
				// Success, Return HTML
				callback(xmlhttp.responseText);
			}else if((xmlhttp.readyState === 4) && (xmlhttp.status === 404 || xmlhttp.status === 500)){
				// error (return false)
				callback(false);
			}
		};
		// Secret pjax ?get param so browser doesn't return pjax content from cache when we don't want it to
		// Switch between ? and & so as not to break any URL params (Based on change by zmasek https://github.com/zmasek/)
		xmlhttp.open("GET", location, true);
		// xmlhttp.open("GET", location + ((!/[?&]/.test(location)) ? '?_pjax' : '&_pjax'), true);
		// Add headers so things can tell the request is being performed via AJAX.
		xmlhttp.setRequestHeader('X-PJAX', 'true'); // PJAX header
		xmlhttp.setRequestHeader('X-Requested-With', 'XMLHttpRequest');// Standard AJAX header.

		xmlhttp.send(null);
	};

	/**
	 * parseOptions
	 * Validate and correct options object while connecting up any listeners.
	 *
	 * @scope private
	 * @param options
	 * @return false | valid options object
	 */
	internal.parseOptions = function(options) {

		/**  Defaults parse options. (if something isn't provided)
		 *
		 * - history: track event to history (on by default, set to off when performing back operation)
		 * - parseLinksOnload: Enabled by default. Process pages loaded via PJAX and setup PJAX on any links found.
		 * - smartLoad: Tries to ensure the correct HTML is loaded. If you are certain your back end
		 *		will only return PJAX ready content this can be disabled for a slight performance boost.
		 * - autoAnalytics: Automatically attempt to log events to google analytics (if tracker is available)
		 * - returnToTop: Scroll user back to top of page, when new page is opened by PJAX
		 */
		var defaults = {
			"history": true,
			"parseLinksOnload": true,
			"smartLoad" : true,
			"autoAnalytics": true,
			"returnToTop": true
		};

		// Ensure a URL and container have been provided.
		if(typeof options.url === 'undefined' || typeof options.container === 'undefined' || options.container === null) {
			console.log("URL and Container must be provided.");
			return false;
		}

		// Check required options are defined, if not, use default
		for(var o in defaults) {
			if(typeof options[o] === 'undefined') options[o] = defaults[o];
		}

		// Ensure history setting is a boolean.
		options.history = (options.history === false) ? false : true;

		// Get container (if its an id, convert it to a DOM node.)
		options.container = internal.get_container_node(options.container);

		// Events
		var events = ['ready', 'beforeSend', 'complete', 'error', 'success'];

		// If everything went okay thus far, connect up listeners
		for(var e in events){
			var evt = events[e];
			if(typeof options[evt] === 'function'){
				internal.addEvent(options.container, evt, options[evt]);
			}
		}

		// Return valid options
		return options;
	};

	/**
	 * get_container_node
	 * Returns container node
	 *
	 * @param container - (string) container ID | container DOM node.
	 * @return container DOM node | false
	 */
	internal.get_container_node = function(container) {
		if(typeof container === 'string') {
			container = document.getElementById(container);
			if(container === null){
				console.log("Could not find container with id:" + container);
				return false;
			}
		}
		return container;
	};

	/**
	 * connect
	 * Attach links to PJAX handlers.
	 * @scope public
	 *
	 * Can be called in 3 ways.
	 * Calling as connect();
	 *		Will look for links with the data-pjax attribute.
	 *
	 * Calling as connect(container_id)
	 *		Will try to attach to all links, using the container_id as the target.
	 *
	 * Calling as connect(container_id, class_name)
	 *		Will try to attach any links with the given class name, using container_id as the target.
	 *
	 * Calling as connect({
	 *						'url':'somepage.php',
	 *						'container':'somecontainer',
	 *						'beforeSend': function(){console.log("sending");}
	 *					})
	 *		Will use the provided JSON to configure the script in full (including callbacks)
	 */
	this.connect = function(/* options */) {
		// connect();
		var options = {};
		// connect(container, class_to_apply_to)
		if(arguments.length === 2){
			options.container = arguments[0];
			options.useClass = arguments[1];
		}
		// Either JSON or container id
		if(arguments.length === 1){
			if(typeof arguments[0] === 'string' ) {
				//connect(container_id)
				options.container = arguments[0];
			}else{
				//Else connect({url:'', container: ''});
				options = arguments[0];
			}
		}
		// Delete history and title if provided. These options should only be provided via invoke();
		delete options.title;
		delete options.history;

		internal.options = options;
		if(document.readyState === 'complete') {
			internal.parseLinks(document, options);
		} else {
			//Don't run until the window is ready.
			internal.addEvent(window, 'load', function(){
				//Parse links using specified options
				internal.parseLinks(document, options);
			});
		}
	};

	/**
	 * invoke
	 * Directly invoke a pjax page load.
	 * invoke({url: 'file.php', 'container':'content'});
	 *
	 * @scope public
	 * @param options
	 */
	this.invoke = function(/* options */) {
		// url, container
		if(arguments.length === 2){
			options = {};
			options.url = arguments[0];
			options.container = arguments[1];
		}else{
			options = arguments[0];
		}

		// Process options
		options = internal.parseOptions(options);
		// If everything went okay, activate pjax.
		if(options !== false) internal.handle(options);
	};

	// Make object usable
	var pjax_obj = this;
	if (typeof define === 'function' && define.amd) {
		// Register pjax as AMD module
		define( function() {
			return pjax_obj;
		});
	}else{
		// Make PJAX object accessible in global name space
		window.pjax = pjax_obj;
	}


}).call({});

        </main>

        <!-- mathjax config similar to math.stackexchange -->
        <script>
          window.MathJax = {
            tex: {
              inlineMath: [ ['$', '$'], ["\\(", "\\)"] ],
              displayMath: [ ['$$', '$$'], ["\\[", "\\]"] ],
              processEscapes: true,
              autoload: {
                color: [],
                colorv2: ['color']
              },
              packages: {'[+]': ['noerrors']}
            },
            options: {
              skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process'
            },
            chtml: {
              scale: 1.8
            },
            loader: {
              load: ['[tex]/noerrors']
            }
          };
        </script>
        <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" id="MathJax-script"></script>
        <script src="/js/pjax-standalone.js"></script>
        <script>
            pjax.connect({
                "container": "content",
                "complete": function() {
                    // reload mathjax after a pjax load
                    MathJax.typesetPromise();
                },
                "autoAnalytics": false
            });
        </script>
    </body>
</html>
