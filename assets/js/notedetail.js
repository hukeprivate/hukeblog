/*
 * theme : 笔记详情页
 * author: huke
 * date  : 20161015
 *
 */

function Notedetail() {
    if (!(this instanceof Notedetail)) {
        return new Notedetail();
    }
    this.init();
}

Notedetail.prototype = {
    fileId : $.getUrlPara('fileId'),
    TimeUtils : $.getTimeUtils(),
    init: function(){
        $.hkLoading()
        this.fetchFile(this.fileId)
    },
    fetchFile: function(fileId){
        var self = this
        $.hkAjax('get','/notes/getfile',{
            fileId : fileId
        },function(res){
            $.disHkLoading()

            self.addPath2(res)
            self.addDate2(res)
            self.render(res)
        })
    },
    addPath2: function(res){
        res.path2 = this.getPathObjArr(res.path)
    },
    // "{5=前端技术, 7=面试集锦A}"
    getPathObjArr: function(paras) {
        var array = []
        if (paras) {
            var str = paras.slice(1, -1);
            var items = str.split(', ')
                len = items.length,
                i = 0;
            for (; i < len; i++) {
                var obj = new Object()
                var item = items[i].split('='),
                    name = item[0],
                    value = item[1] ? item[1] : '';
                // obj[name] = value;
                obj['noteId'] = name
                obj['title'] = value
                array.push(obj)
            }
        }
        return array;
    },
    addDate2: function(res){
        res.createdDate2 = TimeUtils.getDateByTimeStampWithDash(res.createdDate)
        res.lastModifiedDate2 = TimeUtils.getDateByTimeStampWithDash(res.lastModifiedDate)
    },
    render: function(res){
        console.log(res)
        document.title = $.renderDocTitle(res.title)

        var txtHTML = template('tpl-note-info',res)
        $('.note-info-txt').html(txtHTML)

        // $.addDsqScript('http://hukeblog.xxx/notes/notedetail.html?fileId='+res.noteId,'/notes/notedetail.html?fileId='+res.noteId,res.title)
        $.loadScript('/assets/js/lib/highlight.min.js',function(){
            // hljs.initHighlightingOnLoad();
            hljs.initHighlighting.called = false;
            hljs.initHighlighting();
        })


        $.addDsqScript()

        $('.m-preview .title').prepend(res.title)
        $('.title .icon-compose').click(function(){
            window.location.href = '/notes/edit.html?fileId=' + res.noteId
        })

        this.compile(res.content)
        this.initDOM()
        this.likesFunc()
        this.addViewCount()

    },
    initDOM: function(){
        $likeBtn = $('.like .icon-like')
    },
    likesFunc: function(){
        //initial status : already liked
        if(this.hasLiked()){
            $likeBtn.addClass('red')
        }

        this.likesEvent()
    },
    hasLiked: function(){
        var likedCookieStr = $.getCookie('fileIdLiked')
        var likedArr = likedCookieStr.split(',')
        return (likedArr.indexOf(this.fileId) >= 0)
    },
    likesEvent: function(){
        var self = this
        $likeBtn.off('click')
        $likeBtn.click(function(){
            if(self.hasLiked()){
                $.hkPopupTip('you have already liked this post!')
            }else{
               //send request
                $likeBtn.attr('disabled',true)
                self.likesFile()
            }
        })
    },
    likesFile: function(){
        var self = this
        $.hkAjax('post','/notes/likesfile',{
            fileId :self.fileId
        },function(res){
            $likeBtn.attr('disabled',false)
            console.log('likes file res:',res)
            $likeBtn.addClass('red')
            self.setLikesCookie()
            self.likesEvent()
        },'text')
    },
    setLikesCookie: function(){
        var likedCookieStr = $.getCookie('fileIdLiked')
        var likedArr = likedCookieStr.split(',')
        likedArr.push(this.fileId)

        $.setCookie('fileIdLiked',likedArr,31)
    },
    compile: function(res){
        var text = res;
        var html = marked(text)
        document.getElementById("output").innerHTML = html;
    },
    addViewCount: function(){
        var self = this
        $.hkAjax('post','/notes/viewsfile',{
            fileId :self.fileId
        },function(res){
            console.log('views file res:',res)
        },'text')
    }
};

Object.defineProperty(Notedetail.prototype, 'constructor', {
    enumerable: false,
    value: Notedetail
});

$(function() {
    new Notedetail();
});
