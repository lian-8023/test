//顶部合作方列表 搜索&人工审核queue公用
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { browserHistory } from 'react-router';
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class Channel extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.ChannelStore;
    }
    componentDidMount(){
        this.store.getChanel();
    }
    thisOnChange(event){
        if(this.props.onChange){  //正常切换select传值selected的对象到指定组件
            let _val=$(event.target).find("option:selected").attr("value");
            let _name=$(event.target).find("option:selected").attr("name");
            let _text=$(event.target).find("option:selected").text();
            let _selectedObj={
                displayName:_text,
                name:_name,
                value:_val
            }
            this.props.onChange(_selectedObj);
        }
    }
    render() {
        let defaultVal=this.props.channelDefaultVal;
        return (
            <select name="" id="withOutReset" className="select-gray left mr10 chaenel withOutReset" onChange={this.thisOnChange.bind(this)}>
                <option value="" data-optionId="0" data-show="no" hidden>请选择合作方</option>
                <option value="" data-optionId="">全部</option> 
                {
                    (this.store.channelArr && this.store.channelArr.length>0) ? this.store.channelArr.map((repy,i)=>{
                        if(!repy){
                            return <option value="" name="" key={i}></option>
                        }
                        if(repy.value==defaultVal){
                            return <option value={commonJs.is_obj_exist(repy.value)} selected='true' name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                        }else{
                            return <option value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                        }
                    }):<option value=""></option>
                }
            </select>
    );
    }
};


export default Channel;