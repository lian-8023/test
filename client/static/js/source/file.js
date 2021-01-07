
// 文件重传功能全选
export function checkAll(event){
    let $this=$(event.target);
    let myCheckboxs=$this.closest('.auto-box').find('.myCheckbox');
    let _fileCheckAll=$this.hasClass("myCheckbox-visited");
    let _withdrawFileIds=this.userinfoStore.withdrawFileIds;  //选中的文件id
    let _withdrawFileTypes=this.userinfoStore.withdrawFileTypes;  //选中的文件所属类型-中文
    if(_fileCheckAll){
        $('.retransmissionCK').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        myCheckboxs.removeClass("myCheckbox-visited").addClass("myCheckbox-normal")
        this.userinfoStore.withdrawFileIds=[];
        this.userinfoStore.withdrawFileTypes=[];
    }else{
        $('.retransmissionCK').removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        myCheckboxs.removeClass("myCheckbox-normal").addClass("myCheckbox-visited")
        let checkedBoxs=$this.closest('.auto-box').find('.myCheckbox-visited').not('.retransmissionCK');
        let titleBox=$this.closest('.auto-box').find('.toggle-box');
        checkedBoxs.each(function(){
            let _id=$(this).attr('data-id');
            _withdrawFileIds.push(_id);
        });
        titleBox.each(function(){
            let _text=$(this).find('.toggle-tit').text();
            if($(this).find('.file-list .myCheckbox').length>0){
                _withdrawFileTypes.push(_text);
            }
        })
    }
}
//文件重传选择文件事件
export function checkBoxHandle(event){
    let $this=$(event.target);
    let _normal=$this.hasClass("myCheckbox-normal");
    let _withdrawFileIds=this.userinfoStore.withdrawFileIds;  //选中的文件id
    let _withdrawFileTypes=this.userinfoStore.withdrawFileTypes;  //选中的文件所属类型-中文
    let _text=$this.closest('.toggle-box').find('.toggle-tit').text();
    let _id=$this.attr('data-id');

    if(_normal){
        $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        _withdrawFileIds.push(_id);
        if(_withdrawFileTypes.indexOf(_text)<0){
            _withdrawFileTypes.push(_text);
        }
    }else {
        $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let allCheckBox=$this.closest('ul').find('.myCheckbox').length;
        let normalCheckBox=$this.closest('ul').find('.myCheckbox-normal').length;
        let _index_id=_withdrawFileIds.indexOf(_id);
        let _index_text=_withdrawFileTypes.indexOf(_text);
        if(_index_id>=0){
            _withdrawFileIds.splice(_index_id,1);
        }
        if(allCheckBox==normalCheckBox){
            _withdrawFileTypes.splice(_index_text,1);
        }
    }
    let _parent=$this.closest(".auto-box");
    let allMount=_parent.find('.myCheckbox').not('.retransmissionCK').length;
    let checkedMount=_parent.find('.myCheckbox-visited').not('.retransmissionCK').length;
    if(allMount==checkedMount){
        $('.retransmissionCK').removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
    }else{
        $('.retransmissionCK').removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }
}
