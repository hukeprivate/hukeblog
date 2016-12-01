/*
 * theme : 尾部
 * author: huke
 * date  : 20161003
 *
 */

function Footer() {
    if (!(this instanceof Footer)) {
        return new Footer();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Footer.prototype = {
    init: function(){
        this.initContactEvent();
    },
    initContactEvent: function(){
        $('.m-contact-me .iconfont').on('mouseover',function(){
            $(this).find('.icon-box').show();
        }).on('mouseout',function(){
            $(this).find('.icon-box').hide();
        })
    },
};

Object.defineProperty(Footer.prototype, 'constructor', {
    enumerable: false,
    value: Footer
});

$(function() {
    new Footer();
});







