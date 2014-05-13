Shortly.loginView = Backbone.View.extend({
  className: 'login',

  template: Templates['login'],

  events: {
    'submit': 'login'
  },

  render: function() {
    this.$el.html(this.template());
    return this;
  },

  login: function(e) {
    e && e.preventDefault();

  },

});
