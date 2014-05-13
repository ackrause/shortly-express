var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');
var Link = require('./link');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,
  links: function(){
    return this.hasMany(Link);
  },
  initialize: function(){
    var self = this;
    bcrypt.hash(this.get('password'), null, null, function(err, hash){
      if (err){ console.log('ERROR', err); }
      self.set('password', hash);
    });
  },
  comparePassword: function(password) {
    var resolver = Promise.pending();
    bcrypt.compare(password, this.get('password'), function(err, isSame) {
      if (err) {
        resolver.reject(err);
      } else {
        resolver.resolve(isSame);
      }
    });
    return resolver.promise;
  }
});

module.exports = User;
