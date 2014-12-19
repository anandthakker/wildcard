
var fs = require('fs');
var url = require('url');
var http = require('http');
var qs = require('querystring');

var marked = require('marked');
var debug = require('debug')('wildcard');

var site = require('./site.json').reduce(function(site, page) {
  site[page.url] = page;
  return site;
}, {});

debug(Object.keys(site))

// var stat = ecstatic({root: __dirname + '/public',gzip: true});

var server = http.createServer(function(req, res) {
  debug(req.method, req.url);

  var args = qs.parse(req.url.split('?').splice(1).join('?'));
  var target = url.parse((args.url || '').toString());
  var data = site[target.path];
  
  if(target.host === req.headers.host || target.host === 'anand.codes' && data) {
    var card = {
      card_type:"article",
      web_url: target.href,
      article: {
        title: data.metadata && data.metadata.title || target.path,
        html_content: marked(data.content),
        author: "Anand Thakker",
        publication_date: data.metadata && data.metadata.date || undefined
      }
    }
    
    res.end(JSON.stringify(card));
  }
  else {
    res.statusCode = 404;
    res.end('');
  }
});

var port = process.env.PORT || Number(process.argv[2]) || 3000;
server.listen(port, function() {
  console.log('wildcard:', 'listening on ',port);
});
