import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class SendMessage extends React.Component{
    constructor(props){
        super(props);
        this.state={
            msgTypeList:this.props.msgMode,  //短信类型
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            msgTypeList:nextProps.msgMode
        })
        $(".sendMessage-pop .msg-type option").removeAttr("selected");
        $(".sendMessage-pop .msg-type option[value='0']").attr("selected","selected");
        $(".sendMessage-pop .message-cont").val("");
    }
    //关闭弹窗
    closePop(event){
        let $this=$(event.target);
        $this.closest(".sendMessage-pop").addClass("hidden");
    }
    // 选择类型
    selectMsgType(event){
        let $this=$(event.target);
        let selectedType=$this.find("option:selected").attr("value");
        let _typeList=this.state.msgTypeList;
        for(let i=0;i<_typeList.length;i++){
            if(_typeList[i].value==selectedType){
                $(".message-cont").val(_typeList[i].displayName)
            }
        }
    }
    //发送短信
    sendMsg(event){
        let that=this;
        let $this=$(event.target);
        let _data={};
        let _primaryPhone=this.props._userPhoneNo; //电话号码
        let _smsType=$this.closest(".sendMessage-pop").find(".msg-type option:selected").attr("name"); //短信类型
        let _smsModel=$this.closest(".sendMessage-pop").find(".message-cont").val(); //模板内容
        if(!_primaryPhone){
            alert("未获取到电话号码！");
            return;
        }
        if(!_smsType){
            alert("请选择短信类型！");
            return;
        }
        if(!_smsModel){
            alert("短信内容不能为空！");
            return;
        }
        let _templateEnumType=this.props.templateEnumType;
        if(_templateEnumType&&_templateEnumType=="AST"&&_templateEnumType=="AST2"||_templateEnumType == '2FAST'){
            _data.templateEnum=_smsType;
        }else{
            _data.templateEnum="OTHER";
        }
        _data.primaryPhone=_primaryPhone;
        _data.smsType=_smsType;
        _data.smsModel=_smsModel;
        $.ajax({
            type:"post",
            url:that.props.sendToUrl,
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    console.log("发送短信失败!");
                    return;
                }
                alert(_getData.message);
                $(".sendMessage-pop .msg-type option").removeAttr("selected");
                $(".sendMessage-pop .msg-type option[value='0']").attr("selected","selected");
                $(".sendMessage-pop .message-cont").val("");
                $(".sendMessage-pop").addClass("hidden");
            }
        })
    }
    render() {
        return (
            <div className="sendMessage-pop hidden">
                <div className="tanc_bg"></div>
                <div className="sendMessage-box">
                    <div className="clearfix">
                        <select name="" id="messageType" className="select-gray left msg-type" style={{"width":"200px"}} onChange={this.selectMsgType.bind(this)}>
                            <option value="0" name="" hidden>请选择短信类型</option>
                            {
                                (this.state.msgTypeList && this.state.msgTypeList.length>0) ? this.state.msgTypeList.map((repy,i)=>{
                                    return <option value={repy.value} name={repy.name} key={i}>{repy.value}</option>
                                }):<option value="" name="">请选择短信类型</option>
                            }
                        </select>
                        <i className="close right mt5" id='closePop' onClick={this.closePop.bind(this)}></i>
                    </div>
                    <textarea name="" id="messageCont" cols="" rows="" className="message-cont mt10"></textarea>
                    <button className="btn-blue block mt10 send-btn" id='sureSendMsg' onClick={this.sendMsg.bind(this)}>发送短信</button>
                </div>
            </div>
        );
    }
};

export default SendMessage;