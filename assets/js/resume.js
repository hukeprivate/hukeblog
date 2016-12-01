/*
 * theme : 云盘
 * author: huke
 * date  : 20161003
 *
 */

function Resume() {
    if (!(this instanceof Resume)) {
        return new Resume();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Resume.prototype = {
    init: function(){

    },

};

Object.defineProperty(Resume.prototype, 'constructor', {
    enumerable: false,
    value: Resume
});

$(function() {
    new Resume();
});
