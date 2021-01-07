// 短信模板编辑
import React,{PureComponent} from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class NotesModeEdit extends React.Component{
    constructor(props){
        super(props);
        this.state={
            smsTemplateInfo:{}
        }
    }
    UNSAFE_componentWillMount(){
        this.init();
        this.getChannelList();
    }
    componentDidMount(){

    }
    //获取搜索全部结果
    init(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/getSMStemplateList",
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let smsTemplateInfos = res.data.smsTemplateInfos?res.data.smsTemplateInfos:[];
                that.setState({
                    smsTemplateInfos:smsTemplateInfos
                })
            }
        })
    }

    /**
     * 短信模板 发送账号列表 公用list点击事件
     * @param {*} searchListChannelId 
     * @param {*} templateId 
     * @param {*} channelId 
     * @param {*} type 点击的列表 
     * @param {*} event 
     */
    liHandle(searchListChannelId,templateId,channelId,type,event){
        let $this=$(event.target);
        this.init_msg_div();
        $(".channelList li").removeClass("selected");
        $(".channelList li").find(".selected-icon").addClass("hidden");
        if($(event.target).hasClass("cont")){
            $this=$(event.target).parent();
        }
        let _parent=$this.closest(".noteMarkList");
        let needSelected=true;
        if(type=="searchList"){  //搜索结果list
            this.getSMSTemp(templateId);
            this.setState({
                templateId:templateId
            })
        }else if(type=="channelList"){   //发送账号list
            $(".notes-edit-bar .edit").text("保存");
            $(".notes-edit-bar .noteCont").removeAttr("disabled");
            let confir=confirm("确定要修改发送渠道吗？");
            if(!confir){
                $(".channelList li[data-channelid='"+this.state.channelSelectedId+"']").addClass("selected");
                $(".channelList li[data-channelid='"+this.state.channelSelectedId+"']").find(".selected-icon").removeClass("hidden");
                this.init_msg_div();
                needSelected=false;
            }
            $(".notes-edit-bar .edit").text("保存");
            $(".notes-edit-bar .noteCont").removeAttr("disabled");
            this.setState({
                channelId:channelId
            })
        }
        if(needSelected){
            _parent.find("li").removeClass("selected");
            $this.addClass("selected");
            _parent.find(".selected-icon").addClass("hidden");
            _parent.find(".selected").find(".selected-icon").removeClass("hidden");
        }
    }
    //初始化发送账号列表--获取通道数据
    getChannelList(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/getChannelList",
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _channelList = res.data.smsChannelInfos?res.data.smsChannelInfos:[];
                that.setState({
                    channelList:_channelList
                })
            }
        })
    }
    //通过短信模版ID查询模版内容
    getSMSTemp(id){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/getSMSTemplateById",
            async:false,
            dataType: "JSON",
            data:{templateId:id},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        smsTemplateInfo:""
                    })
                    $(".noteCont").val("").attr("data-templateId","");
                    $(".channelList li").removeClass("selected");
                    $(".channelList li").find(".selected-icon").addClass("hidden");
                    return;
                }
                let _smsTemplateInfo = res.data.smsTemplateInfo?res.data.smsTemplateInfo:{};
                that.setState({
                    smsTemplateInfo:_smsTemplateInfo,
                    newSendDate:_smsTemplateInfo.newSendDate,
                    channelSelectedId:_smsTemplateInfo.channelId,
                    channelId:_smsTemplateInfo.channelId
                })
                $(".noteCont").val(commonJs.is_obj_exist(_smsTemplateInfo.content)).attr("data-templateId",_smsTemplateInfo.templateId);
                $(".channelList li[data-channelid='"+_smsTemplateInfo.channelId+"']").addClass("selected");
                $(".channelList li[data-channelid='"+_smsTemplateInfo.channelId+"']").find(".selected-icon").removeClass("hidden");
            }
        })
    }

    //搜索
    search(){
        $(".noteMarkList").find("li").removeClass("selected");
        $(".noteMarkList").find(".selected-icon").addClass("hidden");
        this.setState({
            newSendDate:""
        });
        $(".noteCont").val("").attr("data-templateId","");

        $(".channelList").removeClass("hidden");
        let smsTemplateInfos=this.state.smsTemplateInfos;
        let condition=$(".searchNotes").val();
        condition=condition.replace(/(^\s*)|(\s*$)/g, "");
        let new_smsTemplateInfos=[];
        for(let i=0;i<smsTemplateInfos.length;i++){
            let smsTemplateInfos_i=smsTemplateInfos[i];
            let reg=new RegExp(condition,"g");
            if(reg.test(smsTemplateInfos_i.templateId)){
                new_smsTemplateInfos.push(smsTemplateInfos_i);
            }
        }
        if(new_smsTemplateInfos.length<=0){
            this.setState({
                newSendDate:""
            });
            $(".noteCont").val("").attr("data-templateId","");
        }
        this.setState({
            new_smsTemplateInfos:new_smsTemplateInfos
        })
    }
    // 编辑
    edit(event){
        let _text=$(event.target).text();
        if(_text=="编辑"){
            $(event.target).text("保存");
            $(".noteCont").removeAttr("disabled");
        }else{
            this.save();
            this.init_msg_div();
        }
    }
    init_msg_div(){
        $(".notes-edit-bar .edit").text("编辑");
        $(".notes-edit-bar .noteCont").attr("disabled","true");
    }

    //保存
    save(){
        let _templateId=$(".noteCont").attr("data-templateId");
        let _channelId=this.state.channelId;
        let _cont=$(".noteCont").val();
        if(!_templateId){
            alert("请选择短信模板！");
            return;
        }
        if(!_channelId){
            alert("请选择发送账号！");
            return;
        }
        if(!_cont){
            alert("短信模板内容不能为空！");
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/updateSMSTemp",
            async:true,
            dataType: "JSON",
            data:{
                templateId:_templateId,
                content:_cont,
                channelId:_channelId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _data = res.data;
                alert(_data.message);
            }
        })
    }
    render() {
        return (
            <div className="content clearfix" id="content">
                <div className="NotesModeEdit">
                    <div className="bar left mr10 notes-bar">
                        <h2 className="note-tit mb10">模板搜索</h2>
                        <input type="text" className="input searchNotes left" placeholder="请输入搜索内容" />
                        <button className="searchNotes-btn left btn-white left" onClick={this.search.bind(this)}>搜索</button>
                        <div className="clear"></div>
                        <ul className="mt10 noteMarkList">
                            {
                                (this.state.new_smsTemplateInfos && this.state.new_smsTemplateInfos.length>0)?this.state.new_smsTemplateInfos.map((repy,i)=>{
                                    return <li key={i} data-channelid={commonJs.is_obj_exist(repy.channelId)} onClick={this.liHandle.bind(this,commonJs.is_obj_exist(repy.channelId),commonJs.is_obj_exist(repy.templateId),"","searchList")}>
                                                <span className="cont" title={commonJs.is_obj_exist(repy.templateId)}>{commonJs.is_obj_exist(repy.templateId)}</span>
                                                <i className="selected-icon hidden"></i>
                                            </li>
                                }):<span className="gray-tip-font">暂未查到数据...</span>
                            }
                        </ul>
                    </div>
                    <div className="bar left mr10 notes-bar">
                        <h2 className="note-tit mb10">发送账号</h2>
                        <ul className="noteMarkList channelList hidden">
                            {
                                (this.state.channelList && this.state.channelList.length>0)?this.state.channelList.map((repy,i)=>{
                                    return <li key={i} data-channelid={commonJs.is_obj_exist(repy.channelId)} onClick={this.liHandle.bind(this,"","",commonJs.is_obj_exist(repy.channelId),"channelList")}>
                                                <span className="cont" title={commonJs.is_obj_exist(repy.channelDesc)+" , "+commonJs.is_obj_exist(repy.account)}>
                                                    {commonJs.is_obj_exist(repy.channelDesc)+" , "+commonJs.is_obj_exist(repy.account)}
                                                </span>
                                                <i className="selected-icon hidden"></i>
                                            </li>
                                }):<span className="gray-tip-font">暂时没有数据...</span>
                            }
                        </ul>
                    </div>
                    <div className="bar left mr10 notes-bar">
                        <h2 className="note-tit mb10">最近一次发送时间</h2>
                        <ul className="noteMarkList">
                            <li>
                                <span className="cont" title={this.state.newSendDate?this.state.newSendDate:"暂未查到相关数据..."}>{this.state.newSendDate?this.state.newSendDate:"暂未查到相关数据..."}</span>
                                <i className="selected-icon hidden"></i>
                            </li>
                        </ul>
                    </div>
                    <div className="bar left mr10 notes-edit-bar">
                        <h2 className="note-tit mb10">短信内容</h2>
                        <textarea name="" id="" className="noteCont" disabled="true"></textarea>
                        {
                            (this.state.new_smsTemplateInfos && this.state.new_smsTemplateInfos.length>0)?
                            <button className="left block edit btn-blue mt10" onClick={this.edit.bind(this)}>编辑</button>
                            :""
                        }
                    </div>
                </div>
            </div>
        );
    }
};

export default NotesModeEdit;