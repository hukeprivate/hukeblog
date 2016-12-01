/*
 * theme : 首页
 * author: huke
 * date  : 20161003
 *
 */

function Index() {
    if (!(this instanceof Index)) {
        return new Index();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Index.prototype = {
    pageIndex : 0,
    pageSize : 5,
    pageLoadEventInited : false,
    pageCount : 0,
    init: function(){
        $.hkLoading()
        $.toTop()
        this.reqJinshanDaily()
        this.reqPostList()
        this.postVisits()
    },
    postVisits: function(){
        $.hkAjax('get','/visitors/visits',{},function(res){
            console.log('visits res:',res)
        },'text')
    },
    prcsResTime : function(res){
        $.each(res.notes,function(index,value){
            value.timeLabel = TimeUtils.getLabelByTimestamp(value.createdDate).toUpperCase()
        },'text')
    },
    reqPostList: function($btn){
        var self = this;
        $.hkAjax('get','/notes/latestposts',{
            pageIndex : self.pageIndex,
            pageSize : self.pageSize
        },function(res){
            $.disHkLoading()
            if($btn && $btn.length > 0){
                $btn.find('.txt').show()
                $btn.find('img').hide()
            }
            console.log(res)
            self.prcsResTime(res)
            var latestPostsHTML = template('tpl-latest-posts',res);
            $('.m-post-list').find('.list-cont').append(latestPostsHTML);
            if(!self.pageLoadEventInited){
                self.pageCount = res._count
                self.pageLoadEventInited = true
                self.loadMoreEvent()
            }
        })
    },
    loadMoreEvent: function(){
        var self = this
        $('.load-more-btn').ripples();
        $('.load-more-btn').click(function(){

            self.pageIndex ++ ;
            if(self.pageIndex < self.pageCount){
                var $btn = $(this)
                $btn.find('.txt').hide()
                $btn.find('img').show()

                self.reqPostList($btn)
            }else{
                $.hkPopupTip('No more posts available :)',3000)
            }
        })
    },
    reqJinshanDaily: function(){
        var jinshanObjList = [];
        var todayTs = TimeUtils.getCrtTimeStamp();
        var yesTs = todayTs - 24 * 3600 * 1000;
        var b4YesTs = yesTs - 24 * 3600 * 1000;

        var d = new Date(todayTs)

        var today = TimeUtils.getDateByTimeStamp(todayTs);
        var yest = TimeUtils.getDateByTimeStamp(yesTs);
        var b4Yest = TimeUtils.getDateByTimeStamp(b4YesTs);

        var self = this;
        var baseUrl = '/jinshan/get';

        $.hkAjax('get',baseUrl,{
            date:today
        },function(res){
            var str = new Date(todayTs).toDateString();
            res.engDate = str.substring(0, str.length - 5);
            jinshanObjList.push(res);

            $.hkAjax('get',baseUrl,{date:yest},function(res){
                var str = new Date(yesTs).toDateString();
                res.engDate = str.substring(0, str.length - 5);
                jinshanObjList.push(res);

                $.hkAjax('get',baseUrl,{date:b4Yest},function(res){
                    var str = new Date(b4YesTs).toDateString();
                    res.engDate = str.substring(0, str.length - 5);
                    jinshanObjList.push(res);

                    var jinshanData = {
                        jinshanList : jinshanObjList
                    }
                    var html = template('tpl-jinshan',jinshanData);
                    $('.m-daily').html(html);
                    self.initJinshanEvent();
                })
            })
        })
    },
    initJinshanEvent: function(){
        $('.icon-collapse').click(function(){
            $('.m-daily').addClass('collapse');
            $('.icon-expand').show();
            $('.icon-collapse').hide();
        })

        $('.icon-expand').click(function(){
            $('.m-daily').removeClass('collapse');
            $('.icon-expand').hide();
            $('.icon-collapse').show();
        })

        this.initCarouselEvent();
    },
    initCarouselEvent: function () {
        var $daily = $('.m-daily');
        var $wrappers = $daily.find('.wrapper');
        $wrappers.eq(0).show();

        var length = $wrappers.length;
        var index = 0;

        var $circles = $daily.find('.circle');
        var timer;

        var $rightBtn= $('.right-btn')
        var $leftBtn = $('.left-btn')

        function doInterval() {
            $rightBtn.attr('disabled',false)
            $leftBtn.attr('disabled',false)

            timer = setInterval(function () {
                $wrappers.eq(index).fadeOut(1000);
                if (index + 1 == length) {
                    $wrappers.eq(0).fadeIn(1000);
                    $circles.eq(0).addClass('current').siblings().removeClass('current');
                } else {
                    $wrappers.eq(index + 1).fadeIn(1000);
                    $circles.eq(index + 1).addClass('current').siblings().removeClass('current');
                }
                index++;
                if (index == length) index = 0;
            }, 6000);
        };
        doInterval();

        $circles.click(function () {
            if (index != $(this).index()) {
                clearInterval(timer);
                var clickedIndex = $(this).index();
                $wrappers.hide();
                $wrappers.eq(clickedIndex).fadeIn();
                $circles.eq(clickedIndex).addClass('current').siblings().removeClass('current');

                index = clickedIndex;

                setTimeout(doInterval, 1000);
            }
        })

        $rightBtn.click(function(){
            $(this).attr('disabled',true)
            $leftBtn.attr('disabled',true)

            clearInterval(timer)
            index ++;
            if(index == length) {
                index = 0;
            }
            $wrappers.hide();
            $wrappers.eq(index).fadeIn();
            $circles.eq(index).addClass('current').siblings().removeClass('current');


            setTimeout(doInterval, 1000);
        })

        $leftBtn.click(function(){
            $(this).attr('disabled',true)
            $rightBtn.attr('disabled',true)

            clearInterval(timer)
            index --;
            if(index < 0) {
                index = length - 1;
            }
            $wrappers.hide();
            $wrappers.eq(index).fadeIn();
            $circles.eq(index).addClass('current').siblings().removeClass('current');

            setTimeout(doInterval, 1000);
        })


        this.resizeDailyImg()
    },
    //resize img height based on device width
    resizeDailyImg: function(){
        var $win = $(window)
        var $mDaily = $('.m-daily')
        var $rightBtn= $('.right-btn')
        var $leftBtn = $('.left-btn')

        var devWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        var dayWidth = $mDaily.width()

        if(devWidth >= 1200){
            var height = devWidth * 0.4
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)
            $mDaily.find('.m-txt-cont').css('top','26%')
            $mDaily.find('.m-dateline').css('line-height','2.8')

        }else if(devWidth >= 980 && devWidth < 1200){
            $('.m-txt-cont').css('top','14%')
            var height = devWidth * 0.4 + 'px'
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)

        }else if(devWidth >=768 && devWidth < 980){
            $mDaily.find('.m-txt-cont').css('top','20%')

        }else if(devWidth >= 480 && devWidth < 768){
            var height = devWidth * 1 + 'px'
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)

            $mDaily.find('.m-date-line').css('font-size','40px')
            $mDaily.find('.m-content').css('font-size','22px')
            $mDaily.find('.m-note').css('font-size','28px')
        }else if(devWidth >= 380 && devWidth < 480){
            var height = devWidth * 0.8 + 'px'
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)

            $mDaily.find('.m-dateline').css('font-size','26px')
            $mDaily.find('.m-content').css('font-size','18px')
            $mDaily.find('.m-note').css('font-size','14px')
            $mDaily.find('.m-txt-cont').css('top','20%')

            $mDaily.find('.m-circle-cont').css('bottom','20px')
        }else if(devWidth > 320 && devWidth < 380){
            var height = devWidth * 1 + 'px'
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)

            $mDaily.find('.m-dateline').css('font-size','20px')
            $mDaily.find('.m-content').css('font-size','18px')
            $mDaily.find('.m-note').css('font-size','14px')
            $mDaily.find('.m-txt-cont').css('top','20%')

            $mDaily.find('.m-circle-cont').css('bottom','20px')
        }else{
            var height = devWidth * 1 + 'px'
            $mDaily.height(height)
            $rightBtn.add($leftBtn).height(height / 2)

            $mDaily.find('.label').css('font-size','20px')
            $mDaily.find('.m-dateline').css('font-size','20px')
            $mDaily.find('.m-content').css('font-size','16px')
            $mDaily.find('.m-note').css('font-size','12px')
            $mDaily.find('.m-txt-cont').css('top','20%')

            $mDaily.find('.m-circle-cont').css('bottom','20px')
        }

    }
};

Object.defineProperty(Index.prototype, 'constructor', {
    enumerable: false,
    value: Index
});

$(function() {
    new Index();
});








// console.log(this.boxDataArr)
        // var map = [
        //     {'notes' : [
        //         {'section' : [
        //             {
        //                 'type' : 'h4',
        //                 'title':'面试集锦A'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //         ]},
        //         {'section' : [
        //             {
        //                 'type' : 'a',
        //                 'title':'Why is..'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //         ]},
        //         {'section' : [
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'h4',
        //                 'title':'面试集锦B'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'why is it,in general...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //             {
        //                 'type' : 'a',
        //                 'title' : 'Why is...'
        //             },
        //         ]},
        //     ]},
        //     {},
        //     {}
        // ]

        // return map;