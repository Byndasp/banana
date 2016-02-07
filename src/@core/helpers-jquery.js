/**
 * Created by odin on 06.02.16.
 */
if(typeof jQuery !== "undefined") {
    jQuery.fn.hidden = function() {
        this.addClass("hide");
        return this;
    };

    jQuery.fn.shown = function() {
        this.removeClass("hide");
        return this;
    };

    jQuery.fn.toggle = function() {
        this.hasClass("hide") ? this.shown() : this.hidden();
        return this;
    };

    jQuery.fn.isHidden = function() {
        return this.hasClass("hide");
    };

    jQuery.fn.hasChildren = function() {
        return this.children().length < 0;
    };

// Virtual DOM extensions
    jQuery.fn.guid = function() {
        return this.attr("data-guid");
    };

    jQuery.fn.node = function() {
        var guid = this.guid();
        if(!isset(app.nodes[guid])) Banana.warn("banana", "Element has no virtual node in app");
        return app.nodes[guid];
    };

    jQuery.fn.controller = function() {
        var node = this.node();
        if(!isset(node)) return undefined;
        return node.controller;
    };
}
