import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import { DatePicker } from 'antd';
const { RangePicker } = DatePicker;

// 所有数据从父级元素获取
class Communication_select extends React.Component {
    constructor(props){
        super(props);
        this.state={
            contactResult_slected_id:"",   //处理状态选择的id
            dealReasons:[]  //处理原因 数组
        }
    }
    //当处理状态选择 跟进时 获取时间
    selectFollowuP(event){
        let $this=$(event.target);
        let thisAttr=$this.find("option:selected").attr("data-contactresult");
        var _contactResult_slected_id=$this.find("option:selected").attr("id"); //处理状态选择的id

        if(this.props._turnStatus){
            this.props._turnStatus(_contactResult_slected_id,thisAttr)
        }
    }

    lpReasonTopChange(event){
        let $this=$(event.target);
        let parentValue=$this.find("option:selected").attr("data-value");
        if(this.props._turnReasonParent){
            this.props._turnReasonParent(parentValue)
        }
    }

    //获取跟进时间
    selectTime(value, dateString) {
        $(".contactResultsInfo_time").attr("data-time",dateString);
    }
    
    render() {
        // 联系对象  contactObjectEnums_select
        let thisType=this.props.type;
        let getId=this.props.id;

        if(thisType=="contactObjectEnums_select"){
            let contactObjectEnums=this.props._contactObjectEnums;
            return (
                <select className="select-gray commu-select" name="" id={getId}>
                    <option value="" hidden="hidden" id="0" defaultChecked="defaultChecked">请选择</option>
                    {
                        contactObjectEnums.map((repy,index)=>{
                            return <option value="" data-displayName={repy.displayName} data-name={repy.name} key={index}>{repy.value}</option>;
                        })
                    }
                </select>
            );
        }

        //沟通方式
        if(thisType=="communications_select"){
            let communications=this.props._communications;
            return (
                <select className="select-gray commu-select" name="" id={getId}>
                    <option value="" hidden="hidden" id="0" defaultChecked="defaultChecked">请选择</option>
                    {
                        communications.map((repy,index)=>{
                            return <option value="" id={repy.id} data-createdAt={repy.createdAt} data-contactMethod={repy.contactMethod} data-updatedAt={repy.updatedAt} key={index}>{repy.contactMethodChinese}</option>;
                        })
                    }
                </select>
            );
        }

        //处理状态
        if(thisType=="contactResults_select") {
            let contactResults=this.props._contactResults;
            return (
                <div className="contactResultsInfo_time" data-time="">
                    <select className="select-gray commu-select left mr10" name="" id={getId} onChange={this.selectFollowuP.bind(this)}>
                        <option value="" hidden="hidden" id="0" data-contactresult="0" defaultChecked="defaultChecked">请选择</option>
                        {
                            contactResults.map((repy,index)=>{
                                return <option value="" id={repy.id} data-contactResult={repy.contactResult} data-queueStatusId={repy.queueStatusId} key={index}>{repy.contactResultChinese}</option>;
                            })
                        }
                    </select>
                    <div className="followUpTime left hidden">
                        <DatePicker format="YYYY-MM-DD HH:mm:ss" onChange={this.selectTime.bind(this)} disabledDate={disabledDate} disabledTime={disabledDateTime} showTime />
                    </div>
                </div>
            );
        }

        //处理原因
        if(thisType=="dealReason_select") {
            let dealReasonsArray=this.props._dealReasons;
            return (
                <select className="select-gray commu-select reason_select" name="" id={getId}>
                    <option value="" hidden="hidden" id="0" defaultChecked="defaultChecked">请选择</option>
                    {
                        dealReasonsArray.length>0 ? dealReasonsArray.map((repy,index)=>{
                            return <option value="" id={repy.id} data-contactResult={repy.contactResult} data-queueType={repy.queueType} key={index}>{repy.contactResultReason}</option>;
                        }):<option>请选择</option>
                    }
                </select>
            );
        }

        //处理原因-ENUM
        if(thisType=="dealReason_enum") {
            let dealReasonsArray=this.props._dealReasons;
            return (
                <select className="select-gray commu-select lpReasonParent" name="" id={getId}  onChange={this.lpReasonTopChange.bind(this)}>
                    <option value="" hidden="hidden" id="0" defaultChecked="defaultChecked">请选择</option>
                    {
                        dealReasonsArray.length>0 ? dealReasonsArray.map((repy,index)=>{
                            return <option id={repy.id} data-contactResultId={repy.contactResultId} data-queueType={repy.queueType}  key={index}>
                                {repy.contactResultReason}
                            </option>;
                        }):<option>请选择</option>
                    }
                </select>
            );
        }
        //处理原因-ENUM2
        if(thisType=="dealReason_enum2") {
            let dealReasonsArray=this.props._dealReasons;
            return (
                <select className="select-gray commu-select lpReasonSub" name="" id={getId}>
                    <option value="" hidden="hidden" id="0" defaultChecked="defaultChecked">请选择</option>
                    {
                        dealReasonsArray.length>0 ? dealReasonsArray.map((repy,index)=>{
                            return <option value={repy.name} name={repy.name} data-value={repy.value} data-contactResult={repy.displayName}  key={index}>{repy.displayName}</option>;
                        }):<option>请选择</option>
                    }
                </select>
            );
        }
        return <select className="select-gray commu-select" name="" id={getId}>
            <option value="">请选择</option>
        </select>
    }
};

export default Communication_select;

function range(start, end) {
    const result = [];
    for (let i = start; i < end; i++) {
        result.push(i);
    }
    return result;
}
function disabledDate(current) {
        // can not select days before today and today
        return current && current.valueOf() < Date.now()-86400;
}
function disabledDateTime() {
    return {
        // disabledHours: () => range(0, 24).splice(4, 20),
        // disabledMinutes: () => range(0, 60),
        // disabledSeconds: () => [55, 56],
    };
}