/*
 * theme : Notelist
 * author: huke
 * date  : 20161003
 *
 */

function Notelist() {
    if (!(this instanceof Notelist)) {
        return new Notelist();
    }
    this.init();
}

var TimeUtils = $.getTimeUtils();

Notelist.prototype = {
    folderId : $.getUrlPara('folderId'),
    filesArr : [],
    init: function(){
        $.hkLoading()
        $.toTop()
        this.getFolder()
    },
    getFolder: function(){
        console.log('folderId:',this.folderId)
        var self = this
        $.hkAjax('get','/notes/notelist',{
            fileId : self.folderId
        },function(res){
            console.log('res:',res)

            $.disHkLoading()
            document.title = $.renderDocTitle(res.title)

            self.addImgLinkAndTimeLabels(res)
            self.sortByCreatedDate(res)
            self.renderNoteList(res)
        })
    },
    sortByCreatedDate: function(res){
        var len = res.notes.length
        for(var i = 0;i < len; i++){
           res.notes[i].notes.sort(function(x, y){
                return y.createdDate - x.createdDate;
            })
        }
    },
    addImgLinkAndTimeLabels: function(res){
        var len = res.notes.length
        for(var i = 0 ;i < len;i++){
            for(var j = 0;j < res.notes[i].notes.length;j++){
                this.addLink(res.notes[i].notes[j])
                this.addTimeLabel(res.notes[i].notes[j])
            }
        }
    },
    addTimeLabel: function(file){
        file.timeLabel = TimeUtils.getLabelByTimestamp(file.createdDate).toUpperCase()
    },
    addLink: function(file){
        var htmlStr = marked(file.content)
        var div = document.createElement('div');
        div.innerHTML = htmlStr;
        var firstImage = div.getElementsByTagName('img')[0]
        var imgSrc = firstImage ? firstImage.src : "";
        // or, if you want the unresolved src, as it appears in the original HTML:
        // var rawImgSrc = firstImage ? firstImage.getAttribute("src") : "";
        file.imgLink = imgSrc
    },
    renderNoteList: function(res){
        var cateNamesHTML = template('tpl-cate-names',res)
        $('.category-names').html(cateNamesHTML)

        var notelistHTML = template('tpl-note-list',res)
        $('.note-list').html(notelistHTML)

        var hash = window.location.hash.substr(1);
        if(hash)
            location.href = '#' + hash

        $.addDsqScript('')
    },

    //find all descendant files of folder
    // fillFilesArrOfFolder: function(folder){
    //     var self = this;

    //     $.each(folder.notes,function(key,value){
    //         if(value.isfile){//file
    //             value.timeLabel = TimeUtils.getLabelByTimestamp(value.createdDate).toUpperCase()
    //             self.filesArr.push(value)
    //         }else if(value.notes.length > 0){//folder
    //             self.fillFilesArrOfFolder(value)
    //         }
    //     })
    // }
};

Object.defineProperty(Notelist.prototype, 'constructor', {
    enumerable: false,
    value: Notelist
});

$(function() {
    new Notelist();
});