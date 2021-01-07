
//历史订单  cp-portal 小雨花
import React from 'react';
import ReactDOM from 'react-dom';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import XYHmodal from '../cp-module/XYHmodal'; //小雨花弹窗（历史文件、历史订单-查看详情）
import {observer,inject} from "mobx-react";
import {Provider} from 'mobx-react';
import * as allStoreJs from '../../store/allStore';  //所有mobx监测的数据
let allStore=allStoreJs.default;

@inject('allStore') @observer
class HistoryOrder extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
    }

    //查看详情点击
    detailHandle(loanNumber,orderNo){
        // if(this.props.reloadData){
        //     this.props.reloadData(loanNumber);
        // }
        let XYHmodalDiv = document.getElementById("XYHmodal");
        if(!XYHmodalDiv){
            XYHmodalDiv = document.createElement("div");
            XYHmodalDiv.setAttribute("id", "XYHmodal");
            document.body.appendChild(XYHmodalDiv);
        }
        ReactDOM.render(
            <Provider allStore={allStore}>
                <XYHmodal loanNumber={loanNumber} orderNo={orderNo} />
            </Provider>,
            XYHmodalDiv
        );
    }
    render() {
        let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.userinfoStore.XYH_IdentityInfo);
        let historyOrderInfoList=cpCommonJs.opinitionArray(XYH_IdentityInfo.historyOrderInfoList);
        return (
            <div className="auto-box">
                <table className="pt-table commu-tab bar">
                    <thead>
                        <tr className="th-bg">
                            <th width='10%'>序号</th>
                            <th width='20%'>订单号</th>
                            <th width='20%'>合同号</th>
                            <th width='20%'>申请时间</th>
                            <th width='10%'>业务类型</th>
                            <th width='10%'>订单状态</th>
                            <th width='10%'>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                                {/* <tr>
                                    <td width='10%'>2</td>
                                    <td width='10%' title='2019GZ1000041130618094824X2C'>2</td>
                                    <td width='20%' title='2019GZ1000041130618094824X2C'>2</td>
                                    <td width='20%' title='2019GZ1000041130618094824X2C'>2</td>
                                    <td width='10%' title='2019GZ1000041130618094824X2C'>2</td>
                                    <td width='10%' title='2019GZ1000041130618094824X2C'>2</td>
                                    <td width='10%'><a onClick={this.detailHandle.bind(this,'2019GZ1000041130618094824X2C')}>查看详情</a></td>
                                </tr> */}
                    {
                        (historyOrderInfoList&&historyOrderInfoList.length>0)?historyOrderInfoList.map((repy,i)=>{
                            return <tr key={i}>
                                    <td>{i}</td>
                                    <td title={commonJs.is_obj_exist(repy.orderNo)}>{commonJs.is_obj_exist(repy.orderNo)}</td>
                                    <td title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                    <td title={commonJs.is_obj_exist(repy.applyTime)}>{commonJs.is_obj_exist(repy.applyTime)}</td>
                                    <td title={commonJs.is_obj_exist(repy.businessTypes)}>{commonJs.is_obj_exist(repy.businessTypes)}</td>
                                    <td title={commonJs.is_obj_exist(repy.orderStatus)}>{commonJs.is_obj_exist(repy.orderStatus)}</td>
                                    <td><a onClick={this.detailHandle.bind(this,repy.loanNumber,repy.orderNo)}>查看详情</a></td>
                                </tr>
                        }):<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                        
                    </tbody>
                </table>
            </div>
            
    );
    }
};


export default HistoryOrder;