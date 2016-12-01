/*
 * theme : 头部
 * author: huke
 * date  : 20161003
 *
 */

function Header() {
    if (!(this instanceof Header)) {
        return new Header();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Header.prototype = {
    boxDataArr : [],
    init: function(){
        this.initScrollEvent()
        this.reqNavList()
    },
    initBodyEvent : function(){
        $('.icon-menu').click(function(){
            $(this).siblings('ul').show()
            return false;
        })

        $('.small-device ul').click(function(){
            return false;
        })

        document.body.addEventListener('click',function(){
            $('.small-device ul').hide();
        },false)
    },
    reqNavList : function(){
        var self = this;
        $.hkAjax('get','/notes/',{
        },function(res){
            console.log('nav res:',res)
            var navHTML = template('tpl-nav',res)
            var navSmallHTML = template('tpl-nav-small',res)
            $('.m-title-list').prepend(navHTML)
            $('.small-device ul').html(navSmallHTML)

            self.prcResBox(res)

            var boxWrapperHTML = template('tpl-box-wrapper',res)
            $('header').append(boxWrapperHTML)

            self.initHeaderTitleEvent();
        })
    },
    prcResBox : function(res){
        var len = res.notes.length
        var row = 11 //1列最多12个
        var col = 3 //最多3列
        var count = 0
        //最外层：前端，ubuntu14.04
        for(var i = 0; i < len; i++){//len = 2
            var len2 = res.notes[i].notes.length
            this.sortByLength(res.notes[i].notes)
            if( len2 > col){//如果超过col个，把其余的删掉
                res.notes[i].notes = res.notes[i].notes.slice(0,col)
                len2 = col
            }
            for(var j = 0; j < len2; j++){//4
                var len3 = res.notes[i].notes[j].notes.length
                if(len3 > row){
                    res.notes[i].notes[j].notes = res.notes[i].notes[j].notes.slice(0,row)
                    len3 = row
                }
            }
        }

    },
    //descend order
    sortByLength: function(array){
        array.sort(function(a,b){
            return b.notes.length - a.notes.length
        })
    },
    prcsResTime : function(res){
        $.each(res.notes,function(index,value){
            var ts = Math.abs(TimeUtils.getCrtTimeStamp() - value.createdDate)

            value.timeLabel = TimeUtils.getLabelByTimestamp(ts).toUpperCase()
        })

    },
    initScrollEvent : function(){
        var iScrollPos = 0;
        $(window).scroll(function () {
            var iCurScrollPos = $(this).scrollTop();
            if (iCurScrollPos > iScrollPos) {
                //scrolling down
                $('header').addClass('hide-wrap-btn')
            } else {
                //Scrolling Up
                $('header').removeClass('hide-wrap-btn')
            }
            iScrollPos = iCurScrollPos;
        });
    },
    initHeaderTitleEvent: function(){
        this.boxEvent()

        this.initSmallDevMenuEvent()

        this.initBodyEvent()

        this.menuIconEvent()

        this.themeEvent()
    },
    initSmallDevMenuEvent: function(){
        $('.small-device ul li').on('click',function(){
            var url = $(this).attr('data-url')
            window.location.href = url
        })
    },
    themeEvent: function(){

        this.themeIconEvent()

        var theme = $.getCookie('theme')
        if(theme && theme == 'fudan'){
            this.useFudanTheme()
        }else{
            this.useMianzhiTheme()
        }

    },
    useMianzhiTheme: function(){
        $('body').addClass('theme-mianzhi').removeClass('theme-fudan')

        var $themeMianzhi = $('.theme .mianzhi')
        $themeMianzhi.find('.iconfont').addClass('icon-dagou')
        $themeMianzhi.siblings('.fudan').find('.iconfont').removeClass('icon-dagou')
    },
    useFudanTheme: function(){
        $('body').addClass('theme-fudan').removeClass('theme-mianzhi')

        var $themeFudan = $('.theme .fudan')
        $themeFudan.find('.iconfont').addClass('icon-dagou')
        $themeFudan.siblings('.mianzhi').find('.iconfont').removeClass('icon-dagou')
    },
    themeIconEvent: function(){
        var self = this
        $('.theme').on('mouseover',function(){
            $('.theme-choose-box').show()
        }).on('mouseout',function(){
            $('.theme-choose-box').hide()
        })
        $('.theme .mianzhi').click(function(){
            self.useMianzhiTheme()

            $.setCookie('theme','mianzhi',3)

            $.hkPopupTip('Theme has been changed successfully :)',3000)
            $('.theme-choose-box').hide()
        })
        $('.theme .fudan').click(function(){
            //鹅蛋青
            self.useFudanTheme()

            $.setCookie('theme','fudan',3)

            $.hkPopupTip('Theme has been changed successfully :)',3000)
            $('.theme-choose-box').hide()
        })
    },
    boxEvent : function(){
        var $boxWrapper = $('.box-wrapper');
        $('.m-title-list li.note-item,.box-wrapper .box').on('mouseover',function(){
            var $self = $(this)
            //li
            if($self.is('li')){
                var index = $self.attr('data-index')
                $boxWrapper.find('.box').eq(index).show().siblings('.box').hide()
                $self.addClass('active').siblings().removeClass('active')

                $boxWrapper.show()
            }else{//box-wrapper
                $self.show().siblings('.box').hide()
                var index = $self.attr('data-index')
                $('.m-title-list li').eq(index).addClass('active').siblings().removeClass('active')

                $boxWrapper.show()
            }
        }).on('mouseout',function(){
            var $self = $(this)
            //li
            if($self.is('li')){
                var index = $self.attr('data-index')
                $boxWrapper.find('.box').eq(index).hide();
                $self.removeClass('active')

                $boxWrapper.hide()
            }else{//box-wrapper
                $self.hide()
                var index = $self.attr('data-index')
                $('.m-title-list li.note-item').eq(index).removeClass('active')

                $boxWrapper.hide()
            }
        })
    },
    menuIconEvent : function(){
        $('.small-device .icon-menu').click(function(){
            $(this).siblings('ul').show()
        })
    },

};

Object.defineProperty(Header.prototype, 'constructor', {
    enumerable: false,
    value: Header
});

$(function() {
    new Header();
});







