// Models
window.State = Backbone.Model.extend();

window.StateCollection = Backbone.Collection.extend({
    model: State,
    url: '/api/v1/state/?limit=60'
});

// Views
window.StateListView = Backbone.View.extend({

    tagName: 'ul',

    initialize: function() {
        this.model.bind("reset", this.render, this);
    },

    render: function(eventName) {
        _.each(this.model.models, function(state) {
            $(this.el).append(new StateListItemView({model: state}).render().el);
        }, this);
        return this;
    }

});

window.StateListItemView = Backbone.View.extend({

    tagName: 'li',

    template: _.template($('#tpl-state-list-item').html()),

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});

window.StateView = Backbone.View.extend({

    template: _.template($('#tpl-state-details').html()),

    render: function(eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    }

});

// Router
var AppRouter = Backbone.Router.extend({

    routes: {
        "": "list",
        "states/:id": "stateDetails"
    },

    list: function() {
        this.stateList = new StateCollection();
        this.stateListView = new StateListView({model: this.stateList});
        this.stateList.fetch();
        $('#states').html(this.stateListView.render().el);
    },

    stateDetails: function(id) {
        this.state = this.stateList.get(id);
        this.stateView = new StateView({model: this.state});
        $('#state-detail').html(this.stateView.render().el);
    }

});

var app = new AppRouter();
Backbone.history.start();