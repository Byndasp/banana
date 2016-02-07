/**
 * Created by odin on 06.02.16.
 */
/**
 * 2015 (c) InRepublic
 * All rights are reserved
 *
 * 2015 (c) BananaJS Framework
 * BananaJS is licensed under MIT license
 *
 * @author Denis (odin3) Sedchenko
 * @version 0.7.3-06-01-2016
 *
 */

/** BananaJS utilites **/
Array.prototype.last = function(){
    return this[this.length - 1];
};

Array.prototype.clear = function() {
    this.splice(0, this.length);
};

if(!isset(Array.prototype.forEach)) {
    Array.prototype.forEach = function(e) {
        for(var c = 0; c < this.length; c++) {
            e(this[c], c, this);
        }
    };
}


/** Escape HTML from String **/
String.prototype.escapeHTML = function() {
    var tagsToReplace = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return this.replace(/[&<>]/g, function(tag) {
        return tagsToReplace[tag] || tag;
    });
};

String.prototype.cut = function(len) {
    if(this.length > len) {
        return this.substring(0,len-1)+"…";
    } else {
        return this;
    }
};

String.prototype.isEmpty = function(str) {
    return str.trim().length == 0;
};

/**
 * If variable is defined
 *
 * @param variable
 * @returns {boolean}
 */
function isset(variable) {
    return typeof variable !== 'undefined' || variable !== undefined;
}


