if (typeof jQuery == "undefined") {
    throw new Error("丢失jQuery库文件");
}
/*======================
 * common
 */
+ function($) {
    $.extend({
        setCookie: function(cname,cvalue,exdays){
            var d = new Date();
            d.setTime(d.getTime() + (exdays*24*60*60*1000));
            var expires = "expires="+ d.toUTCString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        },
        getCookie: function(cname){
            var name = cname + "=";
            var ca = document.cookie.split(';');
            for(var i = 0; i <ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length,c.length);
                }
            }
            return "";
        }
    });
    $.extend({
        //异步加载js
        loadScript: function(url,callback){
            var script= document.createElement('script');
            script.type= 'text/javascript';
            script.onload = script.onreadystatechange = function() {
                if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" ) {
                    if(callback!=undefined)callback();

                    script.onload = script.onreadystatechange = null;
                }
            };
            script.src=url;
            document.getElementsByTagName('head')[0].appendChild(script);
        },
        // 获取关键字值
        getUrlPara: function(key, path) {
            var paras = path ? path : window.location.search;
            if (paras) {
                var items = paras.split('?')[1].split('&'),
                    len = items.length,
                    i = 0;
                obj = {};
                for (; i < len; i++) {
                    var item = items[i].split('='),
                        name = item[0],
                        value = item[1] ? item[1] : '';
                    obj[name] = value;
                }
                if (!key) {
                    return obj;
                } else {
                    return obj[key];
                }
            }
        },

        // 获取参数
        getUrlPath: function(ind) {
            var path = window.location.pathname;
            if (path) {
                var paras = path.split('/'),
                    len = paras.length,
                    i = 0,
                    res = [];
                for (; i < len; i++) {
                    if (paras[i]) {
                        res.push(paras[i]);
                    }
                }
                if (typeof ind == 'undefined') {
                    return res[res.length - 1];
                } else {
                    return res[ind];
                }
            } else {
                return '';
            }
        },
    });
    $.extend({
        // 初始化
        init: function() {
             // 定义常量
            config = {
                BLOG_SERVER: 'http://kenote.me:8080/hukeblog',
            };
        },
        toTop: function(){
            $('body').append('<div class="toTop"><span class="iconfont icon-totop"></span></div>')

            $topTop = $('.icon-totop');
            $(window).on('scroll', function() {
                if ($(window).scrollTop() >= 200) {
                    $topTop.fadeIn();
                } else {
                    $topTop.stop(true).fadeOut();
                }
            });

            $topTop.on('click', function() {
                $('html, body').animate({
                    scrollTop: 0
                }, 500);
                return false;
            });
        },
        renderDocTitle: function(title){
            return title + ' - ' + '胡柯写笔记的地方'
        },
        addDsqScript: function(url,identifier,title){
            // var disConfigStr = "<script>var disqus_config = function () { this.page.url='"+url+"';this.page.identifier = '" + identifier +"';this.page.title='"+title+"';};(function() { var d = document, s = d.createElement('script');s.src = '//hukeblog-xxx.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date());(d.head || d.body).appendChild(s);})();</script>"

            // $('.comment-box').append(disConfigStr)


            $('body').append('<script id="dsq-count-scr" src="http://hukeblog-xxx.disqus.com/count.js" async></script>')
        },
        // this.page.url = http://192.168.1.105:8080/hukeblog' + url + ';this.page.identifier = ' + identifier + ';this.page.title = ' + title + ';
        hkLoading : function(){
            $('body').append('<div id="loading" class="pa"><span class="pa loader"><div class="v-beat v-beat-odd"></div><div class="v-beat v-beat-even"></div><div class="v-beat v-beat-odd"></div></span></div>')
        },
        disHkLoading : function(){
            $('#loading').remove()
        },
        hkPopupTip : function(msg, times, fn) {
            times = times ? times : 3000;

            //toast
            if($('#hk-toast').length == 0){
                var content = '<div id="hk-toast">' + msg + '</div>'
                $('body').append(content)
            }else{
                $('#hk-toast').html(msg)
            }

            $toast = $('#hk-toast')
            $toast.css({
                'display' : 'none',
                'border':'1px solid #5cb8e0',
                'border-radius': '4px',
                'background-color': '#5cb8e0',
                'color': 'white',
                'font-size': '16px',
                'padding': '10px',
                'line-height': '1.3',
                'max-width': '340px',
                'position': 'fixed',
                'top' : '100px',
                'z-index' : '10000'
            });

            var winWidth = $(window).width()
            var toastWidth = $toast.width()

            var left = (winWidth - toastWidth) / 2

            $toast.css({
                'left' : (winWidth - toastWidth) / 2
            })


            //mask
            var mask = '<div id="hkPopupMask" style="z-index:' + 9999 + '"></div>'
            $('body').append(mask)
            var $mask = $('#hkPopupMask')
            $mask.css({
                'position' : 'fixed',
                'left' : '0',
                'top' : '0',
                'background-color': '#fff',
                'opacity': '0.5',
                'width' : '100%',
                'height' : '100%'
            })

            $mask.show()
            $toast.slideDown()

            //timer
            var timer = setTimeout(function() {
                $mask.hide()
                $toast.slideUp();
                clearTimeout(timer);
                if (typeof fn === 'function') {
                    fn();
                }
            }, times);
        },
        hkAjax: function(type, url, data, call, dataType) {
            dataType = dataType ? dataType : 'json'
            var datas = $.extend({
                // token: $.getCookie('token')
            }, data);
            // $.krLoading();
            $.ajax({
                type: type,
                url: config.BLOG_SERVER + url,
                dataType: dataType,
                data: datas,
                headers : {
                    'Authorization' : 'Bearer ' + $.getCookie('token')
                },
            }).done(function(res) {
                call(res);
            }).fail(function(res) {
                console.log('系统繁忙，请稍后重试',res);
                console.log('res.responseText',res.responseText)
                $.hkPopupTip(res.responseText,2000)
            });
        },
        // 跨域
        jsonP: function(url, data, call) {
            data = $.extend({
                token: 'some token'
            }, data);

            $.when(
                $.ajax({
                    url: url,
                    type: 'get',
                    dataType: 'jsonp',
                    data: data
                })
            ).done(function(res) {
                call(res);
            }).fail(function() {
                console.log('系统繁忙，请稍后重试');
            });
        },
        getTimeUtils:function(){
            return {
                //返回当前时间戳 1475200323000
                getCrtTimeStamp: function() {
                    var crtTimestamp = new Date().getTime();
                    return crtTimestamp;
                },

                /**
                    date:2016-09-30 09:52:03
                    return:1475200323000
                */
                getTimeStampByDate: function(date) {
                    if(isNaN(date)){
                        var year = date.substr(0,4);
                        var month = date.substr(5,2);
                        var day = date.substr(8,2);
                        var hour = date.substr(11,2);
                        var minute = date.substr(14,2);
                        var second = date.substr(17,2);
                        var timestamp = Date.parse(new Date(year,parseInt(month)-1,day,hour,minute,second));
                        return timestamp;
                    }
                    var timestamp = Date.parse(new Date(date));
                    return timestamp;
                },

                /**
                    date:1475200323000
                    return:2016-09-30 09:52:03
                */
                getDateByTimeStampWithDash: function(timestamp){
                    var timestamp = parseInt(timestamp);
                    timestamp = isNaN(timestamp) ? 0 : timestamp;
                    var datetime = new Date(timestamp);
                    var year = datetime.getFullYear();
                    var month = this.twoDigits(datetime.getMonth() + 1);
                    var date = this.twoDigits(datetime.getDate());
                    var h = this.twoDigits(datetime.getHours());
                    var mm = this.twoDigits(datetime.getMinutes());
                    var s = this.twoDigits(datetime.getSeconds());
                    return year + '-' + month + '-' + date + ' ' + h + ':' + mm + ':' +s;
                },
                /**
                    date:1475200323000
                    return:2016-09-30 09:52:03
                */
                getDateByTimeStamp: function(timestamp){
                    var timestamp = parseInt(timestamp);
                    timestamp = isNaN(timestamp) ? 0 : timestamp;
                    var datetime = new Date(timestamp);
                    var year = datetime.getFullYear();
                    var month = this.twoDigits(datetime.getMonth() + 1);
                    var date = this.twoDigits(datetime.getDate());
                    return year + '' + month + '' + date;
                },
                /**
                    start_at:2016-09-21 09:52:00
                    expired_at:2016-09-30 09:52:03
                    return 777603
                */
                getTimespanInSeconds: function(start_at, expired_at) {
                    var startStamp = this.getTimeStampByDate(start_at);
                    var endStamp = this.getTimeStampByDate(expired_at);
                    return (endStamp - startStamp) / 1000;
                },

                /**
                    start_at:2016-09-21 09:52:00
                    expired_at:2016-09-30 09:52:03
                    return 12960
                */
                getTimespanInMinutes: function(start_at, expired_at) {
                    var timeSpan = this.getTimespanInSeconds(start_at, expired_at);
                    var minutes = Math.floor(timeSpan / 60);
                    return minutes;
                },

                /**
                    start_at:2016-09-21 09:52:00
                    expired_at:2016-09-30 09:52:03
                    return 216
                */
                getTimespanInHours: function(start_at, expired_at) {
                    var timeSpan = this.getTimespanInSeconds(start_at, expired_at);
                    var hour = Math.floor(timeSpan / 3600);
                    return hour;
                },

                /**
                    start_at:2016-09-21 09:52:00
                    expired_at:2016-09-30 09:52:03
                    return 9
                */
                getTimespanInDays: function(start_at, expired_at) {
                    var timeSpan = this.getTimespanInHours(start_at, expired_at);
                    var day = Math.floor(timeSpan / 24);
                    return day;
                },
                /**
                    started_at:2016-09-21 09:52:00
                    return:9月21日 09:52:00
                */
                formatStartedTime: function(started_at) {
                    var formatedTime = parseInt(started_at.substr(5, 2)) + '月' + parseInt(started_at.substr(8, 2)) + '日 ' + started_at.substr(11);
                    return formatedTime;
                },

                /**
                    seconds:115710,isByDay:false
                    return {hours: 32, minutes: 8, seconds: 30};

                    seconds:115710,isByDay:true
                    return {day: 1, hours: 8, minutes: 8, seconds: 30};
                */
                getTimeFieldsObj:function(seconds,isByDay){
                    var seconds = Math.abs(seconds);//in seconds
                    var days = 0;
                    var hours = Math.floor(seconds / 60 / 60);
                    var mins = Math.floor(seconds / 60 % 60);
                    var secs = Math.floor(seconds % 60);

                    var timeObj = {hours:hours,minutes:mins,seconds:secs};
                    if(isByDay){
                        days = Math.floor(hours / 24);
                        hours = (hours - 24 * days);
                        timeObj = {days:days,hours:hours,minutes:mins,seconds:secs}
                    }
                    return timeObj;
                },

                /**
                    number:8
                    return:08
                */
                twoDigits: function(number){
                    return number >= 10 ? number : '0' + number;
                },
                /**
                    ts : 3600000
                    return : 1 hrs ago
                */
                getLabelByTimestamp : function(createdDate){
                    var ts = Math.abs(TimeUtils.getCrtTimeStamp() - createdDate)

                    var secs = ts / 1000;
                    if(secs > 0 && secs < 60){

                        return (secs % 60) + ' seconds ago';

                    }else if(secs >= 60 && secs < 3600){

                        return Math.floor(secs / 60 % 60) + ' mins ago';

                    }else if(secs >= 3600 && secs < 86400){

                        return Math.floor(secs / 60 / 60) + ' hrs ago';

                    }else if(secs >= 86400 && secs < 172800){

                        return 'yesterday';

                    }else if(secs >= 172800 && secs < 604800){

                        return Math.floor(secs / 60 / 60 / 24) + ' days ago'

                    }else if( secs >= 604800 ){

                        var str = new Date(createdDate).toDateString();
                        return str.substring(0, str.length - 5);

                    }
                }
            }
        }

    });
    $.fn.extend({
        // 图片滚动加载
        lazyLoad: function() {
            var here = this;
            var winHeight = parseFloat($(window).height());

            function showImg() {
                $(here).each(function() {
                    var imgH = $(this).height(),
                        topVal = $(this).get(0).getBoundingClientRect().top;
                    if ((topVal < (winHeight - (imgH / 3))) && $(this).hasClass('lazy')) {
                        var _here = this;
                        var _img = new Image();
                        _img.src = $(_here).data('original');
                        $(_here).attr('data-original', 0);
                        $(_here).removeClass('lazy');
                        _img.onload = function() {
                            $(_here).hide().attr('src', _img.src).show();
                        }
                    }
                });
            }
            showImg();
            $(window).on('scroll', function() {
                showImg();
            });
        },
        donetyping: function(callback,timeout){
            timeout = timeout || 1e3; // 1 second default timeout
            var timeoutReference,
                doneTyping = function(el){
                    if (!timeoutReference) return;
                    timeoutReference = null;
                    callback.call(el);
                };
            return this.each(function(i,el){
                var $el = $(el);
                // Chrome Fix (Use keyup over keypress to detect backspace)
                // thank you @palerdot
                $el.is(':input') && $el.on('keyup keypress paste',function(e){
                    // This catches the backspace button in chrome, but also prevents
                    // the event from triggering too preemptively. Without this line,
                    // using tab/shift+tab will make the focused element fire the callback.
                    if (e.type=='keyup' && e.keyCode!=8) return;

                    // Check if timeout has been set. If it has, "reset" the clock and
                    // start over again.
                    if (timeoutReference) clearTimeout(timeoutReference);
                    timeoutReference = setTimeout(function(){
                        // if we made it here, our timeout has elapsed. Fire the
                        // callback
                        doneTyping(el);
                    }, timeout);
                }).on('blur',function(){
                    // If we can, fire the event since we're leaving the field
                    doneTyping(el);
                });
            });
        }
    });

    $.init();
}(jQuery);
