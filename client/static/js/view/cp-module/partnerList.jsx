//顶部合作方列表
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class PartnerList extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.state={
            timmer:""
        }
    }

    componentDidMount(){
        let CooperationListStor=this.props.allStore.CooperationList;
        this.setState({
            timmer:this.interval=setInterval(()=>{
                let _url=CooperationListStor.cooperationListUrl;
                let _parems=CooperationListStor.parems;
                CooperationListStor.getAllCooperations(_url,_parems);  //获取顶部合作方数据列表
            },10000)
        })
    }
    componentWillUnmount(){
        this.setState({
            timmer:""
        })
        clearInterval(this.state.timmer);
    }
    render() {
        let AllCooperation=this.props.allStore.CooperationList.AllCooperation;
        return (
            <div>
                <ul className="checkNum">
                {
                    AllCooperation?Object.keys(AllCooperation).map((repy,i)=>{
                        return <li key={i}>
                                    <span className="checkNum-t">{commonJs.is_obj_exist(repy)}</span>
                                    <span className="checkNum-c">{AllCooperation[repy]}</span>
                                </li>
                    }):""
                }
                </ul>
            </div>
    );
    }
};


export default PartnerList;