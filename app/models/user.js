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
      console.log(self, hash);
    });
  }
});

module.exports = User;
