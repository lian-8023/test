// 回访看板
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Select } from 'antd';  
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class AvisitBoard extends React.Component{
    constructor(props){
        super(props);
        this.state={
            _data:{},
            revisitRealBoardInfoDTOS:[],
            revisitRealBoardInfoDTOPro:[]
        }
    }
    componentDidMount(){
        cpCommonJs.getRuleGroup(this);  //获取权限用户组数据
        this.getCounts();
        this.reVrealBord();
    }
    //回访看板当日数据
    reVrealBord(){
        let that=this;
        $.ajax({
            type:"post", 
            url:"/node/reV/real-board", 
            async:true,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        revisitRealBoardInfoDTOS:[]
                    })
                }
                let _data=res.data;
                that.setState({
                    revisitRealBoardInfoDTOS:_data.revisitRealBoardInfoDTOS,
                    revisitRealBoardInfoDTOPro:_data.revisitRealBoardInfoDTOPro,
                })
           }
       })
    }
    // 获取顶部条数  needCode 是否需要传参数 分配人code
    getCounts(needCode){
        let that=this;
        let _taskOwner=this.state.taskOwner;  //任务所有者
        let _data={};
        if(needCode&&_taskOwner){
            _data={code:_taskOwner}
        }
        $.ajax({
            type:"get", 
            url:"/node/reV/real-count", 
            async:true,
            data:_data,
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        counts:{}
                    })
                }
                let _data=res.data;
                that.setState({
                    _data:_data
                })
           }
       })
    }
    //条件区任务所有者
    taskOwnerFn(value,option){
        this.setState({
            taskOwner:value
        })
        let adminNameMaps=this.state.adminNameMaps;
        for(let i=0;i<adminNameMaps.length;i++){
            if(adminNameMaps[i].code==value){
                $(".return-visit-condition .ant-select-selection-selected-value").text(adminNameMaps[i].name);
            }
        };
        $(".return-visit-condition .ant-select-selection__placeholder").css("display","none");
    }
    //清除条件区任务所有者
    TaskOwnerDeselect(value){
        if(value==undefined){
            this.setState({
                taskOwner:""
            })
        }
    }
    render() {
        let _data=this.state._data;
        let AllCooperation=cpCommonJs.opinitionObj(this.state._data).count;
        let adminNameMaps=this.state.adminNameMaps;
        const Option = Select.Option;
        let {revisitRealBoardInfoDTOS,revisitRealBoardInfoDTOPro}=this.state
        return (
            <div className="content" id="content">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                    <span className="tit on">今日数据</span>
                    <a className="btn-white right mr20 mt10" onClick={this.reVrealBord.bind(this)}>刷新数据</a>
                </h2>
                <table className="mt5 radius-tab border center rtboard-tab">
                <tbody>
                    <tr>
                        <td colSpan="14" className="blue-font" style={{"textAlign":"left"}}>by 产品</td>
                    </tr>
                    <tr className="th-bg">
                        <th className="slash">
                            <span className="slash3_01">时间(h)</span><br/>
                            <span className="slash3_02">处理量</span><br/>
                            <span className="slash3_03">产品</span>
                        </th>
                        <th>00-08</th>
                        <th>09-10</th>
                        <th>10-11</th>
                        <th>11-12</th>
                        <th>12-13</th>
                        <th>13-14</th>
                        <th>14-15</th>
                        <th>15-16</th>
                        <th>16-17</th>
                        <th>17-18</th>
                        <th>18-19</th>
                        <th>19-00</th>
                        <th>total</th>
                    </tr>
                    {
                        (revisitRealBoardInfoDTOPro&&revisitRealBoardInfoDTOPro.length>0)?revisitRealBoardInfoDTOPro.map((repy,i)=>{
                            return <tr key={i}>
                                    <td className="th-bg">{commonJs.is_obj_exist(repy.productNo)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s08)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s09)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s10)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s11)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s12)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s13)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s14)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s15)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s16)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s17)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s18)}</td>
                                    <td>{commonJs.is_obj_exist(repy.s19)}</td>
                                    <td>{commonJs.is_obj_exist(repy.total)}</td>
                            </tr>
                        }):<tr><td colSpan="14" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                </tbody>
            </table>
            <table className="mt5 radius-tab border center rtboard-tab">
                    <tbody>
                        <tr>
                            <td colSpan="14" className="blue-font" style={{"textAlign":"left"}}>by rep</td>
                        </tr>
                        <tr className="th-bg">
                            <th className="slash">
                                <span className="slash3_01">时间(h)</span><br/>
                                <span className="slash3_02">处理量</span><br/>
                                <span className="slash3_03">处理人</span>
                            </th>
                            <th>00-08</th>
                            <th>09-10</th>
                            <th>10-11</th>
                            <th>11-12</th>
                            <th>12-13</th>
                            <th>13-14</th>
                            <th>14-15</th>
                            <th>15-16</th>
                            <th>16-17</th>
                            <th>17-18</th>
                            <th>18-19</th>
                            <th>19-00</th>
                            <th>total</th>
                        </tr>
                        {
                            (revisitRealBoardInfoDTOS&&revisitRealBoardInfoDTOS.length>0)?revisitRealBoardInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                        <td className="th-bg">{commonJs.is_obj_exist(repy.createdBy)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s08)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s09)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s10)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s11)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s12)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s13)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s14)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s15)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s16)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s17)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s18)}</td>
                                        <td>{commonJs.is_obj_exist(repy.s19)}</td>
                                        <td>{commonJs.is_obj_exist(repy.total)}</td>
                                </tr>
                            }):<tr><td colSpan="14" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                    </tbody>
                </table>
            {/* 搜索条件 */}
            <div data-isresetdiv="yes" className="bar return-visit-condition clearfix pb5 mt10 pb10" data-resetstate="paystartValue,payendValue,creditExtensionstartValue,creditExtensionendValue,taskOwner">
                    <dl className="left mt10" data-btn-rule="RULE:REVISIT:RT:CODE:KEY">
                        <dt>分配人</dt>
                        <dd id='patchPershen'>
                            <Select
                                showSearch
                                allowClear
                                style={{ width: '100%' }}
                                placeholder="请选择"
                                optionFilterProp="children"
                                onSelect={this.taskOwnerFn.bind(this)}
                                onChange={this.TaskOwnerDeselect.bind(this)}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                        return <Option value={repy.code} key={i} >{repy.name}</Option>
                                    }):<Option value = "">没有数据</Option>
                                }
                            </Select>
                        </dd>
                    </dl>
                    <div className="left mt10 ml10">
                        <button className="btn-blue left mr5" id='searchBtn' onClick={this.getCounts.bind(this,true)}>搜索</button>
                        <button className="btn-white left" id='reset' onClick={commonJs.resetCondition.bind(this,this,false)}>重置</button>
                    </div>
                </div>
                {/* 展示 */}
                <ul className="checkNum mt10">
                    {
                        AllCooperation?Object.keys(AllCooperation).map((repy,i)=>{
                            return <li key={i}>
                                        <span className="checkNum-t">{commonJs.is_obj_exist(repy)}</span>
                                        <span className="checkNum-c">{AllCooperation[repy]}</span>
                                    </li>
                        }):""
                    }
                </ul>
                <div className="topBundleCounts gray-bar mt10">
                    <b className="left ml40">总量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(_data.totalData)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">当日完成量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(_data.selfCompleted)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">需跟进<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(_data.selfNeedFollow)}</span><span className="gray-font">条</span></b>
                    <b className="left ml40">未处理量<span className="blue-font mr10 ml10">{commonJs.is_obj_exist(_data.selfUnhandle)}</span><span className="gray-font">条</span></b>
                </div>
            </div>
        )
    }
};

export default AvisitBoard;  //ES6语法，导出模块