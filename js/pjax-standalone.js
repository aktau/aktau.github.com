(function(){var t={firstrun:!0,is_supported:window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)};if(t.is_supported){t.addEvent=function(t,e,n){t.addEventListener(e,n,!1)},t.clone=function(t){for(var e in object={},t)object[e]=t[e];return object},t.triggerEvent=function(t,e,n){evt=document.createEvent("HTMLEvents"),evt.initEvent(e,!0,!0),void 0!==n&&(evt.data=n),t.dispatchEvent(evt)},t.addEvent(window,"popstate",(function(e){if(null!==e.state){var n={url:e.state.url,container:e.state.container,title:e.state.title,history:!1};if(void 0!==t.options)for(var o in t.options)void 0===n[o]&&(n[o]=t.options[o]);var i=t.parseOptions(n);if(!1===i)return;t.handle(i)}})),t.attach=function(e,n){if(e.protocol===document.location.protocol&&e.host===document.location.host){if(e.pathname===location.pathname&&e.hash.length>0)return!0;var o={pdf:!0};if(e.pathname.split(".").pop()in o)return!0;n.url=e.href,e.getAttribute("data-pjax")&&(n.container=e.getAttribute("data-pjax")),e.getAttribute("data-title")&&(n.title=e.getAttribute("data-title")),!1!==(n=t.parseOptions(n))&&t.addEvent(e,"click",(function(e){if(!(e.which>1||e.metaKey||e.ctrlKey)){if(e.preventDefault?e.preventDefault():e.returnValue=!1,document.location.href===n.url)return!1;t.handle(n)}}))}},t.parseLinks=function(e,n){void 0!==n.useClass?nodes=e.getElementsByClassName(n.useClass):nodes=e.getElementsByTagName("a");for(var o,i=0;i<nodes.length;i++)node=nodes[i],void 0!==n.excludeClass&&-1!==node.className.indexOf(n.excludeClass)||((o=t.clone(n)).history=!0,t.attach(node,o));t.firstrun&&t.triggerEvent(t.get_container_node(n.container),"ready")},t.smartLoad=function(t,e){var n=document.createElement("div");n.innerHTML=t;var o=n.getElementsByTagName("title")[0].innerHTML;o&&(document.title=o),tmpNodes=n.getElementsByTagName("main");for(var i=0;i<tmpNodes.length;i++)if(tmpNodes[i].id===e.container.id)return tmpNodes[i].innerHTML;return t},t.handle=function(e){t.triggerEvent(e.container,"beforeSend",e),t.request(e.url,(function(n){if(!1===n)return t.triggerEvent(e.container,"complete",e),void t.triggerEvent(e.container,"error",e);if(e.smartLoad&&(n=t.smartLoad(n,e)),void 0===e.title&&(e.title=document.title,!e.smartLoad)){var o=e.container.getElementsByTagName("title");0!==o.length&&(e.title=o[0].innerHTML)}e.container.innerHTML=n,e.history&&(t.firstrun&&(window.history.replaceState({url:document.location.href,container:e.container.id,title:document.title},document.title),t.firstrun=!1),window.history.pushState({url:e.url,container:e.container.id,title:e.title},e.title,e.url)),e.parseLinksOnload&&t.parseLinks(e.container,e),t.triggerEvent(e.container,"complete",e),t.triggerEvent(e.container,"success",e),e.autoAnalytics&&e.history&&(window._gaq&&_gaq.push(["_trackPageview"]),window.ga&&ga("send","pageview",{page:e.url,title:e.title})),document.title=e.title,e.returnToTop&&window.scrollTo(0,0)}))},t.request=function(t,e){var n;try{n=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP")}catch(t){return void console.log("Unable to create XMLHTTP Request")}n.onreadystatechange=function(){4===n.readyState&&200===n.status?e(n.responseText):4!==n.readyState||404!==n.status&&500!==n.status||e(!1)},n.open("GET",t,!0),n.setRequestHeader("X-PJAX","true"),n.setRequestHeader("X-Requested-With","XMLHttpRequest"),n.send(null)},t.parseOptions=function(e){var n={history:!0,parseLinksOnload:!0,smartLoad:!0,autoAnalytics:!0,returnToTop:!0};if(void 0===e.url||void 0===e.container||null===e.container)return console.log("URL and Container must be provided."),!1;for(var o in n)void 0===e[o]&&(e[o]=n[o]);e.history=!1!==e.history,e.container=t.get_container_node(e.container);var i=["ready","beforeSend","complete","error","success"];for(var r in i){var a=i[r];"function"==typeof e[a]&&t.addEvent(e.container,a,e[a])}return e},t.get_container_node=function(t){return"string"==typeof t&&null===(t=document.getElementById(t))?(console.log("Could not find container with id:"+t),!1):t},this.connect=function(){var e={};2===arguments.length&&(e.container=arguments[0],e.useClass=arguments[1]),1===arguments.length&&("string"==typeof arguments[0]?e.container=arguments[0]:e=arguments[0]),delete e.title,delete e.history,t.options=e,"complete"===document.readyState?t.parseLinks(document,e):t.addEvent(window,"load",(function(){t.parseLinks(document,e)}))},this.invoke=function(){2===arguments.length?(options={},options.url=arguments[0],options.container=arguments[1]):options=arguments[0],options=t.parseOptions(options),!1!==options&&t.handle(options)};var e=this;"function"==typeof define&&define.amd?define((function(){return e})):window.pjax=e}else{var n={connect:function(){},invoke:function(){var t=2===arguments.length?arguments[0]:arguments.url;document.location=t}};"function"==typeof define&&define.amd?define((function(){return n})):window.pjax=n}}).call({});