(function(){var b={firstrun:true,is_supported:window.history&&window.history.pushState&&window.history.replaceState&&!navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/)};if(!b.is_supported){var c={connect:function(){return},invoke:function(){var d=(arguments.length===2)?arguments[0]:arguments.url;document.location=d;return}};if(typeof define==="function"&&define.amd){define(function(){return c})}else{window.pjax=c}return}b.addEvent=function(e,d,f){e.addEventListener(d,f,false)};b.clone=function(e){object={};for(var d in e){object[d]=e[d]}return object};b.triggerEvent=function(d,f,e){evt=document.createEvent("HTMLEvents");evt.initEvent(f,true,true);if(typeof e!=="undefined"){evt.data=e}d.dispatchEvent(evt)};b.addEvent(window,"popstate",function(f){if(f.state!==null){var g={url:f.state.url,container:f.state.container,title:f.state.title,history:false};if(typeof b.options!=="undefined"){for(var d in b.options){if(typeof g[d]==="undefined"){g[d]=b.options[d]}}}var e=b.parseOptions(g);if(e===false){return}b.handle(e)}});b.attach=function(g,e){if(g.protocol!==document.location.protocol||g.host!==document.location.host){return}if(g.pathname===location.pathname&&g.hash.length>0){return true}var d={pdf:true},f=g.pathname.split(".").pop();if(f in d){return true}e.url=g.href;if(g.getAttribute("data-pjax")){e.container=g.getAttribute("data-pjax")}if(g.getAttribute("data-title")){e.title=g.getAttribute("data-title")}e=b.parseOptions(e);if(e===false){return}b.addEvent(g,"click",function(h){if(h.which>1||h.metaKey||h.ctrlKey){return}if(h.preventDefault){h.preventDefault()}else{h.returnValue=false}if(document.location.href===e.url){return false}b.handle(e)})};b.parseLinks=function(d,e){if(typeof e.useClass!=="undefined"){nodes=d.getElementsByClassName(e.useClass)}else{nodes=d.getElementsByTagName("a")}for(var f=0,g;f<nodes.length;f++){node=nodes[f];if(typeof e.excludeClass!=="undefined"){if(node.className.indexOf(e.excludeClass)!==-1){continue}}g=b.clone(e);g.history=true;b.attach(node,g)}if(b.firstrun){b.triggerEvent(b.get_container_node(e.container),"ready")}};b.smartLoad=function(g,d){var f=document.createElement("div");f.innerHTML=g;var h=f.getElementsByTagName("title")[0].innerHTML;if(h){document.title=h}tmpNodes=f.getElementsByTagName("main");for(var e=0;e<tmpNodes.length;e++){if(tmpNodes[e].id===d.container.id){return tmpNodes[e].innerHTML}}return g};b.handle=function(d){b.triggerEvent(d.container,"beforeSend",d);b.request(d.url,function(f){if(f===false){b.triggerEvent(d.container,"complete",d);b.triggerEvent(d.container,"error",d);return}if(d.smartLoad){f=b.smartLoad(f,d)}if(typeof d.title==="undefined"){d.title=document.title;if(!d.smartLoad){var e=d.container.getElementsByTagName("title");if(e.length!==0){d.title=e[0].innerHTML}}}d.container.innerHTML=f;if(d.history){if(b.firstrun){window.history.replaceState({url:document.location.href,container:d.container.id,title:document.title},document.title);b.firstrun=false}window.history.pushState({url:d.url,container:d.container.id,title:d.title},d.title,d.url)}if(d.parseLinksOnload){b.parseLinks(d.container,d)}b.triggerEvent(d.container,"complete",d);b.triggerEvent(d.container,"success",d);if(d.autoAnalytics&&d.history){if(window._gaq){_gaq.push(["_trackPageview"])}if(window.ga){ga("send","pageview",{page:d.url,title:d.title})}}document.title=d.title;if(d.returnToTop){window.scrollTo(0,0)}})};b.request=function(d,h){var f;try{f=window.XMLHttpRequest?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP")}catch(g){console.log("Unable to create XMLHTTP Request");return}f.onreadystatechange=function(){if((f.readyState===4)&&(f.status===200)){h(f.responseText)}else{if((f.readyState===4)&&(f.status===404||f.status===500)){h(false)}}};f.open("GET",d,true);f.setRequestHeader("X-PJAX","true");f.setRequestHeader("X-Requested-With","XMLHttpRequest");f.send(null)};b.parseOptions=function(f){var i={history:true,parseLinksOnload:true,smartLoad:true,autoAnalytics:true,returnToTop:true};if(typeof f.url==="undefined"||typeof f.container==="undefined"||f.container===null){console.log("URL and Container must be provided.");return false}for(var j in i){if(typeof f[j]==="undefined"){f[j]=i[j]}}f.history=(f.history===false)?false:true;f.container=b.get_container_node(f.container);var g=["ready","beforeSend","complete","error","success"];for(var h in g){var d=g[h];if(typeof f[d]==="function"){b.addEvent(f.container,d,f[d])}}return f};b.get_container_node=function(d){if(typeof d==="string"){d=document.getElementById(d);if(d===null){console.log("Could not find container with id:"+d);return false}}return d};this.connect=function(){var d={};if(arguments.length===2){d.container=arguments[0];d.useClass=arguments[1]}if(arguments.length===1){if(typeof arguments[0]==="string"){d.container=arguments[0]}else{d=arguments[0]}}delete d.title;delete d.history;b.options=d;if(document.readyState==="complete"){b.parseLinks(document,d)}else{b.addEvent(window,"load",function(){b.parseLinks(document,d)})}};this.invoke=function(){if(arguments.length===2){options={};options.url=arguments[0];options.container=arguments[1]}else{options=arguments[0]}options=b.parseOptions(options);if(options!==false){b.handle(options)}};var a=this;if(typeof define==="function"&&define.amd){define(function(){return a})}else{window.pjax=a}}).call({});