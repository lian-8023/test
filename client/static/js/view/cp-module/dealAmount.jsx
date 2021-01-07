//处理条数：今日已处理。。。。。。。
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class DealAmount extends React.Component {
    render() {
        let count=this.props.allStore.CooperationCountStore.cooperationCount;
        return (
            <div className="topBundleCounts gray-bar">
                <b className="left mr10">今日已处理</b>
                <div className="left">
                    <b className="gray-font pl10">approve <b className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.approveCount)}</b>条</b>
                    <b className="gray-font pl10">decline <b className="deep-yellow-font mr10 ml10">{commonJs.is_obj_exist(count.declineCount)}</b>条</b>
                    {
                        this.props.noPending?
                        "":
                        <b className="gray-font pl10">pending <b className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.pendingCount)}</b>条</b>
                    }
                </div>
                <b className="left ml40">总共未完成<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalUncomplete)}</span><span className="gray-font">条</span></b>
                <b className="left ml40">总共完成<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalComplete)}</span><span className="gray-font">条</span></b>
                <b className="left ml40">总共绑定中<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(count.totalBind)}</span><span className="gray-font">条</span></b>
            </div>
    );
    }
};


export default DealAmount;