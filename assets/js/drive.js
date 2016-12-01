/*
 * theme : 云盘
 * author: huke
 * date  : 20161003
 *
 */

function Drive() {
    if (!(this instanceof Drive)) {
        return new Drive();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Drive.prototype = {
    username : $.getCookie('username'),
    init: function(){
        this.uploadClickEvent()
        this.editClickEvent()
        this.iconClickEvent()
        this.deleteClickEvent()
        $.hkLoading()
        this.fetchFileList()
    },
    iconClickEvent: function(){
        $('.file-list').on('click','.icon-wrapper',function(){
            var self = this
            var $self = $(this)
            location.href="http://kenote.me:8080/hukeblog/file/download/?filename=" + $self.attr('data-filename')
        })
    },
    editClickEvent: function(){
        $('.btn-edit').click(function(){
            $('.icon-close').toggleClass('active')
        })
    },
    deleteClickEvent: function(){
        var self = this
        $('.file-list').on('click','.icon-close',function(){
            var filename = $(this).siblings('.txt').html()
            self.deleteFile(filename)
        })
    },
    uploadClickEvent: function(){
        var self = this
        var token = self.token
        var username = self.username
        $('button.upload').click(function(e){
            //prevent form default event
            e.preventDefault()

            var formData = new FormData($( "#uploadForm" )[0]);

            var file = $('#uploadForm input').val()
            if(!file){
                $.hkPopupTip('please choose a file to upload!',2000)
                return
            }
            var that = self
            $.ajax({
                url: 'http://kenote.me:8080/hukeblog/file/upload' ,
                type: 'POST',
                data: formData,
                cache: false,
                contentType: false,
                dataType:'text',
                processData: false,
                headers : {
                    'Authorization' : 'Bearer ' + $.getCookie('token')
                },
                success: function (res) {
                    console.log('upload res:',res)
                    that.fetchFileList()
                    $.hkPopupTip(res,2500)
                },
                error: function (res) {
                    console.log('error res:',res)
                    $.hkPopupTip(res.responseText,1000)
                }
            });
        })
    },
    fetchFileList: function(){
        var self = this;
        $.hkAjax('get','/file/filelist',{
        },function(res){
            $.disHkLoading()
            var resToRender = self.addExtForRes(res)
            console.log(resToRender)
            self.render(resToRender)
        })
    },
    render: function(resToRender){
        var filelistHTML = template('tpl-file-list',resToRender)
        $('.files-area .file-list').html(filelistHTML)
    },
    addExtForRes: function(res){
        var resToRender = {
            filelist : []
        }
        if(res.filelist && res.filelist.constructor === Array){
            res.filelist.forEach(function(name,index){
                var fileWithExt = new Object()
                fileWithExt.name = name
                fileWithExt.ext = name.split('.').pop();
                resToRender.filelist.push(fileWithExt)
            })
        }
        return resToRender
    },
    deleteFile: function(filename){
        var self = this;
        $.hkAjax('get','/file/delete',{
            filename : filename
        },function(res){
            console.log('delete res:',res)
            $.hkPopupTip(res,2500)
            self.fetchFileList();
        },'text')
    }
};

Object.defineProperty(Drive.prototype, 'constructor', {
    enumerable: false,
    value: Drive
});

$(function() {
    new Drive();
});
