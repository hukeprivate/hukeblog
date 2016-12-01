/*
 * theme : FullEdit
 * author: huke
 * date  : 20161003
 *
 */

function FullEdit() {
    if (!(this instanceof FullEdit)) {
        return new FullEdit();
    }
    this.init();
}


FullEdit.prototype = {
    fileId : $.getUrlPara('fileId'),
    init: function(){
        this.initDOM()
        this.setHeights()
        this.doneTyingEvent()
        this.getFile()
        this.listenEscPress()
        this.setTabEvent()
    },
    setTabEvent: function(){
        $content.keydown(function(e) {
            if(e.keyCode === 9) { // tab was pressed
                // get caret position/selection
                var start = this.selectionStart;
                var end = this.selectionEnd;
                console.log(start,end)

                var $this = $(this);
                var value = $this.val();

                // set textarea value to: text before caret + tab + text after caret
                $this.val(value.substring(0, start)
                            + "\t"
                            + value.substring(end));

                // put caret at right position again (add one for the tab)
                this.selectionStart = this.selectionEnd = start + 1;

                // prevent the focus lose
                e.preventDefault();
            }
        });
    },
    setHeights: function(){
        var height = $(window).height() - $('header').height()
        $('.m-edit-preview-cont').height(height)
    },
    initDOM: function(){
        $title = $('#title')
        $content = $('#content')

        $preTitle = $('#pre-title')
        $preContent = $('#pre-content')
    },
    getFile: function(){
        var self = this
        $.hkAjax('get','/notes/getfile',{
            userId : 1,
            fileId : self.fileId
        },function(res){
            console.log('res file:',res)
            $title.val(res.title)
            $content.val(res.content)

            self.compile()

        })
    },

    compile: function(){
        var titleTxt = $title.val()
        var contentTxt = $content.val()

        var titleHtml = marked(titleTxt)
        var contentHtml = marked(contentTxt)

        $preTitle.html(titleHtml)
        $preContent.html(contentHtml)

        $.loadScript('/assets/js/lib/highlight.min.js',function(){
            hljs.initHighlighting.called = false;
            hljs.initHighlighting();
            // hljs.initHighlightingOnLoad();
        })
    },

    doneTyingEvent: function(){
        var self = this
        $title.donetyping(function(){
            self.updateFile()
        },200)
        $title.on('keyup',function(){
            self.compile()
        })

        $content.donetyping(function(){
            self.updateFile()
        },200)
        $content.on('keyup',function(){
            self.compile()
        })
    },
    updateFile: function(){
        var self = this;
        var params = {
            userId : 1,
            noteId : this.fileId,
            title : $title.val(),
            content : $content.val()
        }
        $.hkAjax('post','/notes/updatefile',params,function(res){
        },'text')
    },
    listenEscPress: function(){
        var self = this
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // escape key maps to keycode `27`
                window.location.href = '/notes/edit.html?fileId=' + self.fileId
            }
        });
    }
};

Object.defineProperty(FullEdit.prototype, 'constructor', {
    enumerable: false,
    value: FullEdit
});

$(function() {
    new FullEdit();
});
