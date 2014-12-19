
var fs = require('fs');
var url = require('url');
var http = require('http');
var qs = require('querystring');

var marked = require('marked');
var request = require('request');
var concat = require('concat-stream');
var debug = require('debug')('wildcard');

var server = http.createServer(cards);
var site;

request('http://anand.codes/site.json').pipe(concat({encoding: 'string'}, function(s) {
  site = JSON.parse(s).reduce(function(site, page) {
    site[page.url] = page;
    return site;
  }, {});
  debug('site data', Object.keys(site))
  
  var port = process.env.PORT || Number(process.argv[2]) || 3000;
  server.listen(port, function() {
    console.log('wildcard:', 'listening on ',port);
  });
}))

function cards(req, res) {
  debug(req.method, req.url);

  var args = qs.parse(req.url.split('?').splice(1).join('?'));
  var target = url.parse((args.url || '').toString());
  var data = site[target.path];
  
  if(site && target.host === req.headers.host || target.host === 'anand.codes' && data) {
    var card = {
      card_type:"article",
      web_url: target.href,
      article: {
        title: data.metadata && data.metadata.title || target.path,
        html_content: marked(data.content) || '',
        author: "Anand Thakker",
        abstract_content: (data.metadata.description || data.content).trim().slice(0, 500)
      }
    }
    
    if(card.article.html_content.trim().length === 0)
      card.article.html_content = '<p>For more, go to <a href="http://anand.codes">anand.codes</a>.</p>'
    if(card.article.abstract_content.trim().length === 0)
      card.article.abstract_content = "From http://anand.codes, the personal website of Anand Thakker."
    if(data.metadata.date)
      card.article.publication_date = data.metadata.date;

    res.end(JSON.stringify(card));
  }
  else {
    res.statusCode = 404;
    res.end('');
  }
}
