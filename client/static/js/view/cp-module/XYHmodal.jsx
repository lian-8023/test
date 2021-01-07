// 小雨花弹窗（历史文件、历史订单-查看详情）
import React from 'react';
import ReactDOM from 'react-dom';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { Modal, Tabs } from 'antd';
const { TabPane } = Tabs;

import ShopMsgXYH from '../cp-module/shopMsgXYH';//详情-小雨花
import FileXYH from '../cp-search/fileXYH';//资料信息-小雨花
import OrderInfo from '../cp-search/orderInfo';  //=>订单信息-小雨花 
import RiskInfo from '../cp-search/riskInfo';  //=>风控信息-小雨花   

@inject('allStore') @observer
export default class XYHmodal extends React.Component {
    constructor(props){
        super(props);
        this.state={
            XYH_IdentityInfo:{}
        }
    }
    // 关闭弹窗
    handleCancel = e => {
        ReactDOM.unmountComponentAtNode(document.getElementById("XYHmodal"));
    };
    componentDidMount(){
        this.getUserInfo();
    }
    //获取详情
    getUserInfo(){
        let that=this;
        $.ajax({
            type: "post",
            url: "/node/search/identity/info",
            async: true,
            dataType: "JSON",
            data: {
                loanNo:this.props.loanNumber,
                orderNo:this.props.orderNo,
                fromFlag:'XYH',
                cooperationFlag:'2C',
                label:'XYHmodal'
            },
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success: function (res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        XYH_IdentityInfo:{}
                    })
                    return;
                }
                var _data = cpCommonJs.opinitionObj(res.data);
                that.setState({
                    XYH_IdentityInfo:_data //小雨花详情
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    render() {
        return (
            <div>
                <Modal
                    visible={true}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={'60%'}
                    >
                    <Tabs>
                        <TabPane tab="客户信息" key="1">
                            <ShopMsgXYH data={this.state.XYH_IdentityInfo} fromXYHmodal={true} />
                        </TabPane>
                        <TabPane tab="订单信息" key="2">
                            <OrderInfo data={this.state.XYH_IdentityInfo} fromXYHmodal={true} />
                        </TabPane>
                        <TabPane tab="资料信息" key="3">
                            <FileXYH data={this.state.XYH_IdentityInfo} fromXYHmodal={true} />
                        </TabPane>
                        <TabPane tab="风控信息" key="4">
                            <RiskInfo data={this.state.XYH_IdentityInfo} fromXYHmodal={true} />
                        </TabPane>
                    </Tabs>
                </Modal>    
            </div>
    )}
};
