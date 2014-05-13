Shortly.Router = Backbone.Router.extend({
  initialize: function(options){
    this.$el = options.el;
  },

  routes: {
    '':       'index',
    'create': 'create',
    // 'login' : 'login',
    // 'signup': 'signup',
    // 'logout': 'logout'
  },

  swapView: function(view){
    this.$el.html(view.render().el);
  },

  index: function(){
    var links = new Shortly.Links();
    var linksView = new Shortly.LinksView({ collection: links });
    this.swapView(linksView);
  },

  create: function(){
    this.swapView(new Shortly.createLinkView());
  }

  // login: function() {
  //   this.swapView(new Shortly.LoginView());
  // },

  // signup: function() {
  //   this.swapView(new Shortly.SignUpView());
  // },

  // logout: function() {
  //   // TODO: Logout logic?
  //   // Redirect to login page
  // }
});
