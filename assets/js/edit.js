/*
 * theme : Edit
 * author: huke
 * date  : 20161003
 *
 */

function Edit() {
    if (!(this instanceof Edit)) {
        return new Edit();
    }
    this.init();
}


Edit.prototype = {
    crtFolderId : 0,
    crtFileId : 0,
    crtFileObj : {},
    moveToFolderId : 0,
    tobeMovedNoteId : 0,
    isMainEventInited : false,
    init: function(){
        $.hkLoading()
        this.initGloDOM()
        this.setContentHeight()
        this.initBoxesLocation()
        this.initCrtNotes()
    },
    setContentHeight: function(){
        if($(window).width() > 768){
            var headerHeight = $('header').height()
            var footerHeight = $('footer').height()

            var winHeight = $(window).height()

            var contentHeight = winHeight - headerHeight - footerHeight


            $('.aside').add($main).add($middle).css('height',contentHeight + 'px')
        }
    },
    initBoxesLocation: function(){
        var winWidth = $(window).width()
        var winHeight = $(window).height()


        this.notyBoxLocation(winWidth,winHeight)
        this.moveBoxLocation(winWidth,winHeight)
    },
    notyBoxLocation: function(winWidth,winHeight){
        var boxWidth = $notyBox.width()
        var boxHeight = $notyBox.height()

        $notyBox.css({
            'top' : ((winHeight - boxHeight) / 2 - 100)  + 'px',
            'left' : (winWidth - boxWidth) / 2 + 'px'
        })
    },
    moveBoxLocation: function(winWidth,winHeight){

        if(winWidth > 480){
            var boxWidth = $moveBox.width()
            var boxHeight = $moveBox.height()
            $moveBox.css({
                'top' : (winHeight - boxHeight) / 2  + 'px',
                'left' : (winWidth - boxWidth) / 2 + 'px'
            })
            var $content = $moveBox.find('.content')
            var conHeight = boxHeight * 0.68
            $content.height(conHeight)
        }else{
            $moveBox.width(winWidth * 0.92)
            $moveBox.height(winHeight * 0.8)
            var boxWidth = $moveBox.width()
            var boxHeight = $moveBox.height()
            $('.cont-display').height(boxHeight * 0.5)
            $moveBox.css({
                'top' : (winHeight - boxHeight) / 2  + 'px',
                'left' : (winWidth - boxWidth) / 2 + 'px'
            })
        }

    },
    initCrtNotes: function(){
        var fileId = $.getUrlPara('fileId')
        var folderId = $.getUrlPara('folderId')
        var self = this
        if(fileId){
            this.crtFileId = fileId//store global crtFileId
            $.hkAjax('get','/notes/getfolderbyfileid',{
                fileId : fileId
            },function(res){
                console.log('res folder:',res)
                //store global crtFolderId
                self.crtFolderId = res.noteId
                self.fetchnotes(true)
            })
        }else if(folderId){
            this.crtFolderId = folderId
            this.fetchnotes(true)
        }else{
            this.fetchnotes(true)
        }
    },
    initGloDOM: function(){
        $asideNavList = $('.aside .nav-list');
        //middle
        $middle = $('.middle')
        $middleList = $middle.find('.file-list')
        //main
        $main = $('.main');
        $title = $main.find('.title');
        $fullEditBtn = $main.find('.icon-column');
        $save = $main.find('.icon-save');
        $displayBtn = $main.find('.icon-display')
        $textarea = $('textarea');
        $saveTip = $('.saved-tip')

        $notyBox = $('.noty-box')
        $notyMask = $('.noty-mask')
        $moveBox = $('.move-box')
        $moveMask = $('.move-mask')
        $moveConfirm = $moveBox.find('.move-btns .confirm')
    },
    initBodyEvent: function(){
        $displayBtn.click(function(){
            $.hkPopupTip('please select a file to display!')
        })
        $fullEditBtn.click(function(){
            $.hkPopupTip('please select a file to edit in full screen!')
        })
        $('.stack').click(function(){
            return false;
        })
        document.body.addEventListener('click',function(){
            $('.dropdown-menu').hide();
        },true)
    },
    renderAside: function(res){
        console.log('renderAside:',res)
        var navListHTML = template('tpl-folder-list',res);
        $('.aside .nav-list').html(navListHTML);
        $('.new').attr('disabled',false);
        $('.newfolder').attr('disabled',false);


        var mvBoxHTML = template('tpl-movebox-list',res);
        $('.move-box .cont-display .move-list').html(mvBoxHTML)
        //trigger default folderItem click
        if(this.crtFolderId){
            $asideNavList.find(".a-wrapper[data-noteid='" + this.crtFolderId + "']").trigger('click')
        }else{
            $asideNavList.find('.a-wrapper').eq(0).trigger('click');
        }
    },
    renderMiddle: function(res){
        var fileListHTML = template('tpl-file-list',res)
        $('.middle .file-list').html(fileListHTML)
        $('.newfile').attr('disabled',false);

        //trigger first fileItem click
        if(this.crtFileId && this.crtFileId == $.getUrlPara('fileId')){
            $middleList.find(".a-wrapper[data-noteid='" + this.crtFileId + "']").trigger('click')
        }else{
            $middleList.find('.a-wrapper').eq(0).trigger('click');
        }
    },
    renderMain: function(){
        $title.val(this.crtFileObj.title)
        $textarea.val(this.crtFileObj.content)
        if(!this.isMainEventInited){
            this.initMainEvent()
            this.isMainEventInited = true
        }
    },
    initMoveBoxEvent: function(){
        var self = this
        $moveBox.on('click','.icon-form-close,.cancel',function(){
            $moveBox.hide()
            $moveMask.hide()
        }).on('click','.list-item .item',function(){
            $(this).parents('.move-list').find('.item').removeClass('active')
            $(this).addClass('active')
            self.moveToFolderId = $(this).attr('data-noteid')

            $moveConfirm.attr('disabled',false)
            $moveConfirm.removeClass('disabled')
        })

        $moveConfirm.click(function(){
            self.moveNote()
        })
    },
    moveNote: function(){
        var moveToFolderId = this.moveToFolderId
        var tobeMovedNoteId = this.tobeMovedNoteId
        if(moveToFolderId == tobeMovedNoteId){
            $.hkPopupTip("don't move the folder into itself!")
            return
        }

        var self = this;
        $.hkAjax('post','/notes/movenote',{
            parentFolderId : moveToFolderId,
            noteId : tobeMovedNoteId
        },function(res){
            console.log('move res:',res)
            self.fetchnotes();

            $moveConfirm.attr('disabled',true)
            $moveConfirm.addClass('disabled')
            $moveBox.hide()
            $moveMask.hide()
        },'text')
    },
    initMainEvent: function(){
        var self = this;
        //donetyping will execute:
        // The timeout has elapsed, or
        // The user switched fields (blur event)
        $title.donetyping(function(){
            self.crtFileObj.title = $(this).val()
            self.updateFile(self.crtFileObj)
        },500)
        $textarea.donetyping(function(){
            self.crtFileObj.content = $(this).val()
            self.updateFile(self.crtFileObj)
        },500)

        $save.click(function(){
            self.crtFileObj.title = $title.val()
            self.crtFileObj.content = $textarea.val()
            self.updateFile(self.crtFileObj)
        })

        $fullEditBtn.off('click')
        $fullEditBtn.click(function(){

            window.location.href = '/notes/full-edit.html?fileId=' + self.crtFileId
        })

        $displayBtn.off('click')
        $displayBtn.click(function(){
            window.location.href = '/notes/notedetail.html?fileId=' + self.crtFileId
        })
    },
    //before this step,aside elemens have already been rendered,and corresponding events have been initialized.
    // triggerDefaultEvents: function(){
    // },
    initSwitchListItemEvent: function(){
        var self = this;
        //keep only one active
        $asideNavList.on('click','.a-wrapper',function(){
            $(this).parents('.nav-list').find('.a-wrapper').removeClass('active');

            $(this).addClass('active');

            var folderId = $(this).attr('data-noteid');
            self.crtFolderId = folderId
            self.fetchFileList(folderId)
        })
        $middleList.on('click','.a-wrapper',function(){
            $(this).parents('.file-list').find('.a-wrapper').removeClass('active');

            $(this).addClass('active');

            self.crtFileId = $(this).attr('data-noteid');

            self.fetchFile(self.crtFileId)
        })
    },
    initDropdownEvent: function(){
        $asideNavList.add($middleList).on('click','.edit',function(){
            $(this).parent().siblings('.dropdown-menu').show();
            return false;
        })
        var self = this;
        //rename
        $asideNavList.add($middleList).on('click','.dropdown-menu .rename', function(){
            $self = $(this);

            if(! $self.closest($asideNavList).length ){
                $asideNavList.find('.dropdown-menu').hide();
            }else{
                $middleList.find('.dropdown-menu').hide();
            }

            var $crtItem = $(this).parent().parent();
            var $editable = $crtItem.find('.editable');
            var $nonEditable = $crtItem.find('.non-editable');

            setTimeout(function(){
                $editable.find('input').select();
                $editable.find('input').focus();
            },100)
            $nonEditable.hide();
            $editable.show();

            $editable.find('input').on('blur',function(){
                $nonEditable.html($(this).val()).show();
                $editable.hide();
                var noteId = $self.attr('data-noteid');
                var name = $(this).val();
                self.renameNote(noteId,name);
            })
            //delete   -   initNotyBox
        }).on('click','.dropdown-menu .del',function(){
            var noteId = null;
            $(this).parent().hide();
            $notyMask.show();
            $notyBox.slideDown();
            noteId = $(this).attr('data-noteid');
            self.useNotyBox(self.deleteNote,noteId);
        }).on('click','.dropdown-menu .moveto',function(){
            self.tobeMovedNoteId = $(this).attr('data-noteid');
            var tobeMovedNoteTitle = $(this).attr('data-notetitle')
            var isfile = $(this).attr('data-isfile')

            $(this).parent().hide();
            $moveMask.show();

            if(isfile == 1){
                $moveBox.find('.file-info .iconfont').addClass('icon-file')
            }else{
                $moveBox.find('.file-info .iconfont').addClass('icon-folder')
            }

            $moveBox.find('.file-txt').html(tobeMovedNoteTitle)
            $moveBox.slideDown();
        })
    },
    initAsideMiddleEvent: function(){
        var self = this;

        this.initSwitchListItemEvent();
        //add
        this.initAddNoteEvent();
        //dropdown
        this.initDropdownEvent();
    },
    initAddNoteEvent: function(){
        var self = this;

        $('.new,.newfolder,.newfile').click(function(){
            var $self = $(this);

            $(this).attr('disabled',true);

            if($self.get(0) == $('.new').get(0) || $self.get(0) == $('.newfolder').get(0)){
                var tplData = {
                    notes: [
                        {title : "New Folder"},
                    ]
                }
            }else{
                var tplData = {
                    notes: [
                        {
                            title : "New File",
                            isfile : true
                        },
                    ]
                }
            }

            if($self.get(0) == $('.new').get(0)){
                var tplHTML = template('tpl-folder-list',tplData);
                $asideNavList.append(tplHTML);
                var $lastChild = $asideNavList.children().last();

            }else if($self.get(0) == $('.newfolder').get(0)){
                var tplHTML = template('tpl-folder-list',tplData);
                var $parentFolder = $asideNavList.find("[data-list-item='" + self.crtFolderId + "']").find('.sub-nav-list').first()
                $parentFolder.append(tplHTML);
                var $lastChild = $parentFolder.children().last();
            }else{
                var tplHTML = template('tpl-file-list',tplData);
                $middleList.append(tplHTML);
                var $lastChild = $middleList.children().last();
            }

            //auto focus
            $lastChild.find('.non-editable').hide().end().find('.editable').show().find('input').select();

            $lastChild.find('.item .a-wrapper').addClass('active');
            $lastChild.siblings().find('.item .a-wrapper').removeClass('active');

            //onblur
            $lastChild.find('input').on('blur',function(){
                $lastChild.find('.non-editable').html($(this).val()).show().end().find('.editable').hide()

                if($self.get(0) == $('.new').get(0)){
                    var param = {
                        title : $(this).val(),
                    }
                    self.addRootFolder(param);
                }else if($self.get(0) == $('.newfolder').get(0)){
                    var param = {
                        title : $(this).val(),
                        parentId : self.crtFolderId
                    }
                    self.addFolder(param);
                }else{
                    var param = {
                        title : $(this).val(),
                        parentId : self.crtFolderId
                    }
                    self.addFile(param);
                }
            })
        })
    },
    fetchFile: function(crtFileId){
        var self = this
        $.hkAjax('get','/notes/getfile',{
            fileId : self.crtFileId
        },function(res){
            console.log('res file:',res)
            self.crtFileObj = res
            self.renderMain()
        })
    },
    useNotyBox: function(callback,param){
        var self = this;
        var $notyBtns = $notyBox.find('.noty-btns');
        $notyBtns.find('.cancel').click(function(){
            $notyMask.hide();
            $notyBox.slideUp();
            $(this).off('click');
        })
        $notyBtns.find('.confirm').click(function(){
            $notyMask.hide();
            $notyBox.slideUp();
            self.deleteNote(param);
            $(this).off('click');
        })
    },
    addRootFolder: function(param){
        var self = this;
        $.hkAjax('post','/notes/addrootfolder',param,function(res){
            self.fetchnotes();
        },'text')
    },
    addFile: function(param){
        var self = this;
        $.hkAjax('post','/notes/addfile',param,function(res){
            self.fetchnotes();
        },'text')
    },
    addFolder: function(param){
        var self = this;
        $.hkAjax('post','/notes/addfolder',param,function(res){
            self.fetchnotes();
        },'text')
    },
    deleteNote: function(noteId){
        var self = this;
        $.hkAjax('post','/notes/delete',{
            noteId : noteId
        },function(res){
            self.fetchnotes();
        },'text')
    },
    renameNote: function(noteId,name){
        var self = this;
        $.hkAjax('post','/notes/rename',{
            noteId : noteId,
            title : name
        },function(res){
            console.log('rename res:',res);
        },'text')
    },
    updateFile: function(fileObj){
        var self = this;
        var params = {
            noteId : fileObj.noteId,
            title : fileObj.title,
            content : fileObj.content
        }
        $.hkAjax('post','/notes/updatefile',params,function(res){
            $saveTip.slideDown()
            setTimeout(function(){
                $saveTip.slideUp()
            },800)
        },'text')
    },
    fetchnotes: function(isInitial){
        var self = this;
        $.hkAjax('get','/notes/',{
        },function(res){
            $.disHkLoading()

            if(isInitial){
                self.initBodyEvent()
                self.initAsideMiddleEvent()
                self.initMoveBoxEvent()
            }
            self.renderAside(res);
        })
    },
    fetchFileList: function(folderId){
        var self = this;
        $.hkAjax('get','/notes/files',{
            folderId : self.crtFolderId,
        },function(res){
            self.renderMiddle(res);
        })
    }
};

Object.defineProperty(Edit.prototype, 'constructor', {
    enumerable: false,
    value: Edit
});

$(function() {
    new Edit();
});