// 拨打记录
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common'
var commonJs=new CommonJs;
import { Pagination } from 'antd';
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class SecurityRcord extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.state={
            sV_barsNum:10,  //列表每页显示多少条
            sV_current:1,  //列表当前页码
            sD_barsNum:10,  //详情每页显示多少条
            sD_current:1,  //详情当前页码
        }
    }

    componentDidMount () {
        this.getSocialInfo(10,1);
        this.SocialInfoDetail(10,1);
        //隐藏 收起、展开 全部图标
        $(".taggle-cion-up").removeClass("hidden");
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
    }

    // 社保信息列表
    getSocialInfo(_pageSize,_pageNum){
        let that=this;
        var _accountId=this.userInfo2AStore.acountId;
        var _nationalId=this.userInfo2AStore.userInfo.nationalId;
        if(!_accountId || !_nationalId){
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/socialInfo",
            async:true,
            dataType: "JSON", 
            data:{
                pageSize:_pageSize,
                pageNum:_pageNum,
                accountId:_accountId,
                nationalId:_nationalId
                // accountId:'63709',
                // nationalId:'500383198604020742'
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        sV_barsNum:10,  //每页显示多少条
                        sV_current:1,  //当前页码
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    shebaoViewInfoDTOS:_getData.shebaoViewInfoDTOS?_getData.shebaoViewInfoDTOS:[],
                    sV_totalSize:_getData.totalSize?_getData.totalSize:0,
                    sV_pageNum:_getData.sV_pageNum?_getData.sV_pageNum:0
                })
            }
        })
    }
    //社保详情
    SocialInfoDetail(_pageSize,_pageNum){
        let that=this;
        let _accountId=this.userInfo2AStore.acountId;
        let _nationalId=this.userInfo2AStore.userInfo.nationalId;
        if(!_accountId || !_nationalId){
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/socialDetail",
            async:true,
            dataType: "JSON", 
            data:{
                pageSize:_pageSize,
                pageNum:_pageNum,
                accountId:_accountId,
                nationalId:_nationalId
                // accountId:'63709',
                // nationalId:'500383198604020742'
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        sD_barsNum:10,  //每页显示多少条
                        sD_current:1,  //当前页码
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    shebaoDetailInfoDTOS:_getData.shebaoDetailInfoDTOS?_getData.shebaoDetailInfoDTOS:[],
                    sD_totalSize:_getData.totalSize?_getData.totalSize:0,
                    sD_pageNum:_getData.sV_pageNum?_getData.sV_pageNum:0
                })
            }
        })
    }

    // 列表改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            sV_current:1,
            sV_barsNum:pageSize
        },()=>{
            this.getSocialInfo(pageSize,1);
        })
    }
    pageChange(page){
        this.setState({
            sV_current: page
        },()=>{
            this.getSocialInfo(this.state.sV_barsNum,page);
        });
      }
    //详情
    sD_onShowSizeChange(current, pageSize) {
        this.setState({
            sV_current:1,
            sV_barsNum:pageSize
        },()=>{
            this.SocialInfoDetail(pageSize,1);
        })
    }
    sD_pageChange(page){
        this.setState({
            sV_current: page
        },()=>{
            this.SocialInfoDetail(this.state.sD_barsNum,page);
        });
      }
    render() {
        const {shebaoViewInfoDTOS} = this.state;
        const {shebaoDetailInfoDTOS} = this.state;
        return (
            <div className="auto-box pr5">
            <div className="toggle-box mt10">
                <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                    社保信息
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <div className="bar mt5">
                    <table className="pt-table">
                        <tbody>
                        <tr>
                            <th>公司名称</th>
                            <th>社保号</th>
                            <th>参保状态</th>
                        </tr>
                        {
                            (shebaoViewInfoDTOS && shebaoViewInfoDTOS.length>0) ? shebaoViewInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                        <td>{commonJs.is_obj_exist(repy.userCompany)}</td>
                                        <td>{commonJs.is_obj_exist(repy.soinsNum)}</td>
                                        <td>{commonJs.is_obj_exist(repy.soinsStatus)}</td>
                                    </tr>
                            }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        <tr>
                            <td colSpan="3">
                            <div className="paageNo left">
                                <Pagination
                                    showQuickJumper
                                    showSizeChanger
                                    onShowSizeChange={this.onShowSizeChange.bind(this)}
                                    defaultPageSize={this.state.barsNum}
                                    defaultCurrent={1}
                                    total={this.state.sV_totalSize}
                                    onChange={this.pageChange.bind(this)}
                                    pageSizeOptions={['10','25','50','100']}
                                />
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="toggle-box mt10">
                <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    社保详情
                    <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                </h2>
                <div className="bar mt5">
                    <table className="pt-table">
                        <tbody>
                        <tr>
                            <th>缴费总计</th>
                            <th>缴费基数</th>
                            <th>缴费开始时间</th>
                            <th>社保种类</th>
                            <th>单位名称</th>
                        </tr>
                        {
                            (shebaoDetailInfoDTOS && shebaoDetailInfoDTOS.length>0) ? shebaoDetailInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                        <td>{commonJs.is_obj_exist(repy.totalPay)}</td>
                                        <td>{commonJs.is_obj_exist(repy.payCardi)}</td>
                                        <td>{commonJs.is_obj_exist(repy.startTime)}</td>
                                        <td>{commonJs.is_obj_exist(repy.soinsType)}</td>
                                        <td>{commonJs.is_obj_exist(repy.soinsCompany)}</td>
                                    </tr>
                            }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        <tr>
                            <td colSpan="5">
                            <div className="paageNo left">
                                <Pagination
                                    showQuickJumper
                                    showSizeChanger
                                    onShowSizeChange={this.sD_onShowSizeChange.bind(this)}
                                    defaultPageSize={this.state.sD_barsNum}
                                    defaultCurrent={1}
                                    total={this.state.sD_totalSize}
                                    onChange={this.sD_pageChange.bind(this)}
                                    pageSizeOptions={['10','25','50','100']}
                                />
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>  
            </div>
        )
    }
}
;

export default SecurityRcord;