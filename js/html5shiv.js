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
        <meta property="og:url" content="http://www.aktau.be/js/html5shiv.js">

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
            /*
 HTML5 Shiv v3.7.0 | @afarkas @jdalton @jon_neal @rem | MIT/GPL2 Licensed
*/
(function(l,f){function m(){var a=e.elements;return"string"==typeof a?a.split(" "):a}function i(a){var b=n[a[o]];b||(b={},h++,a[o]=h,n[h]=b);return b}function p(a,b,c){b||(b=f);if(g)return b.createElement(a);c||(c=i(b));b=c.cache[a]?c.cache[a].cloneNode():r.test(a)?(c.cache[a]=c.createElem(a)).cloneNode():c.createElem(a);return b.canHaveChildren&&!s.test(a)?c.frag.appendChild(b):b}function t(a,b){if(!b.cache)b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag();
a.createElement=function(c){return!e.shivMethods?b.createElem(c):p(c,a,b)};a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+m().join().replace(/[\w\-]+/g,function(a){b.createElem(a);b.frag.createElement(a);return'c("'+a+'")'})+");return n}")(e,b.frag)}function q(a){a||(a=f);var b=i(a);if(e.shivCSS&&!j&&!b.hasCSS){var c,d=a;c=d.createElement("p");d=d.getElementsByTagName("head")[0]||d.documentElement;c.innerHTML="x<style>article,aside,dialog,figcaption,figure,footer,header,hgroup,main,nav,section{display:block}mark{background:#FF0;color:#000}template{display:none}</style>";
c=d.insertBefore(c.lastChild,d.firstChild);b.hasCSS=!!c}g||t(a,b);return a}var k=l.html5||{},s=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,r=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,j,o="_html5shiv",h=0,n={},g;(function(){try{var a=f.createElement("a");a.innerHTML="<xyz></xyz>";j="hidden"in a;var b;if(!(b=1==a.childNodes.length)){f.createElement("a");var c=f.createDocumentFragment();b="undefined"==typeof c.cloneNode||
"undefined"==typeof c.createDocumentFragment||"undefined"==typeof c.createElement}g=b}catch(d){g=j=!0}})();var e={elements:k.elements||"abbr article aside audio bdi canvas data datalist details dialog figcaption figure footer header hgroup main mark meter nav output progress section summary template time video",version:"3.7.0",shivCSS:!1!==k.shivCSS,supportsUnknownElements:g,shivMethods:!1!==k.shivMethods,type:"default",shivDocument:q,createElement:p,createDocumentFragment:function(a,b){a||(a=f);
if(g)return a.createDocumentFragment();for(var b=b||i(a),c=b.frag.cloneNode(),d=0,e=m(),h=e.length;d<h;d++)c.createElement(e[d]);return c}};l.html5=e;q(f)})(this,document);

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
