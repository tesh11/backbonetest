(function(undefined) {
    "use strict";

    // Backbone.noConflict support. Save local copy of Backbone object.
    var Backbone = window.Backbone;

    Backbone.oldSync = Backbone.sync;
    Backbone.sync = function(method, model, options) {
        if (method === 'create') {
            model.unset('id', {silent: true});
        } else if (method === 'update') {
            // we need to generate the url before we remove the id param so that we can generate it correctly
            options.url = model.url();
            model.unset('id', {silent: true});
        }

        Backbone.oldSync(method, model, options);
    };

        /**
     * Return the first entry in 'data.results' if it exists and is an array, or else just plain 'data'.
     */
    Backbone.Model.prototype.parse = function(data) {
        return data && data.results && (_.isArray(data.results) ? data.results[0] : data.results) || data;
    };

    /**
     * Return 'data.results' if it exists.
     * If present, the pagination data is assigned to the 'collection.meta' var.
     */
    Backbone.Collection.prototype.parse = function(data) {
        if (data && data.page) {
            this.meta = Object();
            this.meta.page = data.page;
            this.meta.next = data.next;
            this.meta.per_page = data.per_page;
            this.meta.total = data.total;
            this.meta.pages = data.pages;
            this.meta.previous = data.previous;
        }

        return data && data.results;
    };
})();
