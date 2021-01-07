// 记账宝还款管理
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Breadcrumb, Icon, Tabs,Input,Table } from 'antd';
const { TabPane } = Tabs;
const { Search } = Input;
import './chargeAccount.less';
import CustomerRepayLs from './customerRepayLs';
import XydRepayLs from './xydRepayLs';
import RefundRecord from './refundRecord';
import {observer,inject} from "mobx-react";

@inject('allStore') @observer
class Index extends React.Component {
    constructor(props){
        super(props);
        this.customerRepayLs=this.props.allStore.CustomerRepayLs;
        this.state = {
            pagination:{
                pageSize:10,
                current:1,
                showSizeChanger:true
            },
        };
    }
    
    render() {
        return (
            <div  className="content" id="content">
                <div className="bar pl20 pt10" id='bread'>
                    <Icon type="environment" style={{color:'#1890FF',fontSize:'16px',marginRight:'15px',float:'left',marginTop:'3px'}} />
                    <Breadcrumb separator=">">
                        <Breadcrumb.Item href="/cp-portal#/chargeAccount" id='toChargeAccount'>记账宝还款管理</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                
                <div className="mt20 card-container" id='card-container'>
                    {/* <Tabs defaultActiveKey="1" type="card" onChange={this.customerRepayLs.reset}> */}
                    <Tabs defaultActiveKey="1" type="card">
                        <TabPane tab="客户还款账户列表" key="1">
                            <CustomerRepayLs />
                        </TabPane>
                        <TabPane tab="小雨点还款管理" key="2">
                            <XydRepayLs />
                        </TabPane>
                        <TabPane tab="退款记录查询" key="3">
                            <RefundRecord />
                        </TabPane>
                    </Tabs>
                </div>
            </div>
        );
    }
}
;

export default Index;