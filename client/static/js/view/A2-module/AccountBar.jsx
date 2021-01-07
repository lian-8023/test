// 搜索条件下面的信息栏
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class AccountBar extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
    }
    // 详情--select框切换合同号
    @action changeLoanNo(event){
        let $this=$(event.target);
        let theText=$this.find("option:selected").text();
        this.acountBarStore.selectedLoanNumber=theText;
        if(this.props.loanNumberChange){
            this.props.loanNumberChange(theText)
        }
    }
    render() {
        let loanNumber_array=this.acountBarStore.selectLoanNoArray;
        let userInfo2AStore=this.userInfo2AStore;
        return (
            <div className="bar mt2 accountBar">
                <span className="left pl20 pr10 shallow-blue">姓名</span>
                <b className="left pr5 content-font">
                    {commonJs.is_obj_exist(userInfo2AStore.userInfo.name)}
                    （{commonJs.is_obj_exist(userInfo2AStore.userInfo.gender?userInfo2AStore.userInfo.gender.displayName:"-")}）
                </b>
                {(userInfo2AStore.haveFinishLoan&&userInfo2AStore.haveFinishLoan.name=="YES")?<span className="left block pr20 old-customer">老客户</span>:""}
                <span className="left pl20 pr10 shallow-blue">Portal号</span>
                <b className="left pr30 mr20 content-font blue-font">{commonJs.is_obj_exist(userInfo2AStore.acountId)}</b>
                <select name="" id="detailTopSelect" className="left select-blue mt5 mr20 detail-top-select" onChange={this.changeLoanNo.bind(this)}>
                    {
                        (loanNumber_array && loanNumber_array.length>0) ? loanNumber_array.map((repy,i)=>{
                            return <option value="" key={i}>{repy.loanNumber}</option>
                        }):<option value="">没有数据</option>
                    }
                </select>
            </div>
        );
    }
};

export default AccountBar;
