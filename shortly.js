var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var cookieParser = require('cookie-parser');
var session      = require('express-session');

var app = express();

app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(partials());
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
  app.use(cookieParser());
  app.use(session({secret: 'much secret So hush hush WOW', cookie: { maxAge: 600000 }}));
});

var authSession = function(req, res, next){
  if(req.session.userId){
    next();
  } else {
    req.session.error = 'ACCESS DENIED!!';
    res.redirect('/login');
  }
};

app.get('/', authSession, function(req, res) {
  res.render('index');
});

app.get('/create', authSession, function(req, res) {
  res.render('index');
});

app.get('/links', authSession, function(req, res) {
  Links.reset().query('where', 'user_id', '=', req.session.userId).fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', authSession, function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          user_id: req.session.userId
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.get('/signup', function(req, res) {
  res.render('signup');
});

app.get('/login', function(req, res) {
  res.render('login');
});

app.get('/logout', function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
});

app.post('/signup', function(req, res){
  var username = req.param('username');
  var password = req.param('password');

  var user = new User({username: username, password: password});

  user.save().then(function(newUser){
    res.redirect('/login');
  }).catch(function(err) {
    res.redirect('/signup');
  });
});

app.post('/login', function(req, res){
  var username = req.param('username');
  var password = req.param('password');

  new User({username: username}).fetch().then(function(user) {
    user.comparePassword(password).then(function(isSame) {
      if (isSame) {
        req.session.regenerate(function(){
          req.session.userId = user.id;
          res.redirect('/');
        });
      } else {
        res.redirect('/login');
      }
    });
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
