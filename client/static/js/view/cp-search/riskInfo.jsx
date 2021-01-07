// 风控信息--小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { Modal,Table } from 'antd';
import axios from '../../axios';

@inject('allStore') @observer
class RiskInfo extends React.Component {
    constructor(props){
        super(props);
        this.UserinfoStore=this.props.allStore.UserinfoStore;
        this.state = { relevanceHataVisible: true }
    }
    componentDidMount(){
        
        this.fomortDetailItems();
    }
    // 共关联数据
    relevanceDataHandle= (e) => {
        this.setState({
            relevanceDataVisible: true,
        });
    }
    relevanceDataClose=(e)=>{
        this.setState({
            relevanceDataVisible: false,
        });
        this.UserinfoStore.riskInfoCurrentLoanNo='';
    }
    // 黑名单命中明细
    blacklistHandle= (e) => {
        this.setState({
            blacklistVisible: true,
        });
    }
    blacklistClose=(e)=>{
        this.setState({
            blacklistVisible: false,
        });
    }
    //判断是否是json类型字符串
    isJson=(strName,str)=>{
        if(!str){
            return false;
        }
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                if(typeof obj == 'object' && obj ){
                    return true;
                }else{
                    return false;
                }
            } catch(e) {
                console.log('error：'+strName+'!!!'+e);
                return false;
            }
        }
        console.log(strName+'It is not a string!')
    }
    //搜索身份证号码对应的合同号 
    searchLoanNo=(index,idCard)=>{
        let {DetailItems=[]}=this.state;
        let that=this;
        axios({
            method: 'get',
            url:'/node/manual/xyh/getLoanNoByNationId',
            params:{ nationId:idCard }
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    dataList:[]
                })
                return;
            }
            DetailItems[index].dataList=cpCommonJs.opinitionArray(data.dataList)
            that.setState({
                DetailItems:DetailItems
            })
        })
    }
    //关联数据明细根据身份证号码获取合同号，点击合同号展示对应详情
    loanNoToDetailPage=(curLoanNo)=>{
        if(this.UserinfoStore.riskInfoCurrentLoanNo==curLoanNo){
            alert('此合同号为当前数据，请误重复搜索！');
            return;
        }
        let currentHash=window.location.hash;
        currentHash = currentHash.replace(/&?riskInfoCurrentLoanNo=([a-z]|[A-Z]|[0-9])*/,"");
        if(currentHash.indexOf('?')>-1){ 
            currentHash=`${currentHash}&riskInfoCurrentLoanNo=${curLoanNo}`;
        }else{
            currentHash=`${currentHash}?riskInfoCurrentLoanNo=${curLoanNo}`;
        }
        window.location.hash=currentHash;
        this.UserinfoStore.riskInfoCurrentLoanNo=curLoanNo;
    }
    // 格式化关联数据明细数据
    fomortDetailItems=(jsionString)=>{
        let XYH_IdentityInfo=this.UserinfoStore.XYH_IdentityInfo;
        if(this.props.fromXYHmodal){ //小雨花弹窗（历史文件、历史订单-查看详情）
            XYH_IdentityInfo=this.props.data;
        }
        let riskControlInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.riskControlInfo);  //反欺诈信息
        let checkLinkNotes_val=this.isJson('checkLinkNotes',riskControlInfo.checkLinkNotes)?JSON.parse(riskControlInfo.checkLinkNotes):'';
        // let checkLinkNotes_val=JSON.parse('{"blacklist_results":{"blacklist_count":0},"link_results":{"link_count":2,"link_items":{"cust_ipaddress":{"17C":["410482198302100584","460026200008020037"]} , "cust_ipaddress22":{"18C":["410482198302100584","460026200008020037"]} , "cust_ipaddress33":{"18C":["33","444","543"]}}}}');
        let link_results=cpCommonJs.opinitionObj(checkLinkNotes_val.link_results);
        let link_items=cpCommonJs.opinitionObj(link_results.link_items);
        let DetailItems=[],DetailItems_obj={};
        for(let key in link_items){
            let tabVal=link_items[key];
            DetailItems.push({
                productNo:key,
                isTitle:true,
                colSpan:3,
            })
            for(let key2 in tabVal){  
                let idCardArray=tabVal[key2];
                for(let i=0;i<idCardArray.length;i++){
                    DetailItems_obj={
                        tabTit:key,        //表格标题 cust_ipaddress
                        productNo:key2,    //产品号 17C
                        idCard:idCardArray[i],
                    }
                    if(i==0){
                        DetailItems_obj.rowSpan=idCardArray.length;
                    }else{
                        DetailItems_obj.rowSpan=0;
                    }

                    DetailItems.push(DetailItems_obj);
                }
            }
        }
        console.log('DetailItems',DetailItems)
        // DetailItems=[
        // {
        //     colSpan: 3,
        //     isTitle: true,
        //     productNo: "cust_ipaddress"
        // },{
        //     idCard: "410482198302100584",
        //     productNo: "17C",
        //     rowSpan: 2,
        //     tabTit: "cust_ipaddress"
        // },{
        //     idCard: "410482198302100584",
        //     productNo: "17C",
        //     rowSpan: 0,
        //     tabTit: "cust_ipaddress",
        //     dataList:['2020BJ1000066321210105307X2C1','bbbbbbb']
        // }];
        this.setState({
            DetailItems:DetailItems
        })
        // let currentHash=window.location.hash;
        // currentHash = currentHash.replace(/&?riskInfoCurrentLoanNo=([a-z]|[A-Z]|[0-9])*/,"");
        // window.location.hash=currentHash;
    }
    render() {
        let {DetailItems=[]}=this.state;
        let XYH_IdentityInfo=this.UserinfoStore.XYH_IdentityInfo;
        if(this.props.fromXYHmodal){ //小雨花弹窗（历史文件、历史订单-查看详情）
            XYH_IdentityInfo=this.props.data;
        }
        let riskControlInfo=cpCommonJs.opinitionObj(XYH_IdentityInfo.riskControlInfo);  //反欺诈信息
        let checkLinkNotes_val=this.isJson('checkLinkNotes',riskControlInfo.checkLinkNotes)?JSON.parse(riskControlInfo.checkLinkNotes):'';
        // let checkLinkNotes_val=JSON.parse('{"blacklist_results":{"blacklist_count":0},"link_results":{"link_count":2,"link_items":{"cust_ipaddress":{"17C":["410482198302100584","460026200008020037"]}}}}');
        let blacklist_results=cpCommonJs.opinitionObj(checkLinkNotes_val.blacklist_results);
        let link_results=cpCommonJs.opinitionObj(checkLinkNotes_val.link_results);

        let columns=[
        {
            title:'产品号',
            key:'0',
            render: (text,record,index)=>{
                return {
                    children:commonJs.is_obj_exist(record.productNo),
                    props: {
                        rowSpan:record.rowSpan,
                        colSpan:record.colSpan,
                        className:record.isTitle?'riskInfoTableTit riskInfoTableTd':'riskInfoTableTd'
                    },
                }
            }
        },{
            title:'身份证号',
            key:'1',
            className:'riskInfoTableTd',
            render: (text,record,index) => {return {
                    children:<a onClick={this.searchLoanNo.bind(this,index,record.idCard)} title='点击可以搜索对应合同号'>{record.idCard}</a>,
                    props: {
                        colSpan:record.isTitle?0:1
                    },
                }
            }
        },{
            title:'合同号',
            key:'2',
            className:'riskInfoTableTd',
            render: (text,record,index) => {return {
                children: record.dataList ? record.dataList.map((rpy,i)=>{
                    return <p key={i} onClick={this.loanNoToDetailPage.bind(this,rpy)}><a>{rpy}</a></p>
                }) :'-',
                props: {
                    colSpan:record.isTitle?0:1
                },
            }}
        }];
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                    信用信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <ul className="cp-info-ul bar pb20 pr20 mt3"> 
                        {/* <li>
                            <p className="msg-tit">信用评级</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.creditRating)}>{commonJs.is_obj_exist(riskControlInfo.creditRating)}</b>
                        </li> */}
                        <li>
                            <p className="msg-tit">学历是否受限制</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.lpCheckFlag)}>{commonJs.is_obj_exist(riskControlInfo.lpCheckFlag)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">手机在网时长</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.mobileOnlineTime)}>{commonJs.is_obj_exist(riskControlInfo.mobileOnlineTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">人脸识别相似度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.ocrRate)}>{commonJs.is_obj_exist(riskControlInfo.ocrRate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">大锋SMART分值</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.smartScore)}>{commonJs.is_obj_exist(riskControlInfo.smartScore)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">算话反欺诈分</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.fraudScore)}>{commonJs.is_obj_exist(riskControlInfo.fraudScore)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">集奥分</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.collectionScore)}>{commonJs.is_obj_exist(riskControlInfo.collectionScore)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">蜜罐被机构查询数量</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.groupSelectCounts)}>{commonJs.is_obj_exist(riskControlInfo.groupSelectCounts)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">蜜罐连续3天身份证被机构查询最大次数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.threeDaysSelectCounts)}>{commonJs.is_obj_exist(riskControlInfo.threeDaysSelectCounts)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">客户上月负债</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.threeDaysSelectCounts)}>{commonJs.is_obj_exist(riskControlInfo.lastMonthDebts)}</b>
                        </li>
                        <li className="height-auto" style={{width:"50%"}}>
                            <p className="msg-tit">同盾多头借贷平台个数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.applyAmount)} style={{width:"100%"}}>
                                <table className="pt-table boder-table bar mt3">
                                    <tbody>
                                        <tr>
                                            <th>近7天</th>
                                            <th>近3个月</th>
                                            <th>近6个月</th>
                                            <th>近12个月</th>
                                        </tr>
                                        <tr>
                                            <td>{commonJs.is_obj_exist(riskControlInfo.nearSevenDayCounts)}</td>
                                            <td>{commonJs.is_obj_exist(riskControlInfo.nearThreeMonthCounts)}</td>
                                            <td>{commonJs.is_obj_exist(riskControlInfo.nearSixMonthCounts)}</td>
                                            <td>{commonJs.is_obj_exist(riskControlInfo.nearTwelveMonthCounts)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </b>
                        </li>
                        <li>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={commonJs.content_toggle.bind(this)}>
                    反欺诈信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className='bar'>
                        <ul className="cp-info-ul pr20 mt3"> 
                            <li>
                                <p className="msg-tit">决策分数</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.checkScore)}>{commonJs.is_obj_exist(riskControlInfo.checkScore)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">决策结果</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.checkResult)}>{commonJs.is_obj_exist(riskControlInfo.checkResult)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">预警展示</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.alarm)}>{commonJs.is_obj_exist(riskControlInfo.alarm)}</b>
                            </li>
                            <li>
                                <p className="msg-tit">反欺诈提示</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(riskControlInfo.frDesc)}>{commonJs.is_obj_exist(riskControlInfo.frDesc)}</b>
                            </li>
                        </ul>
                        <ul className="cp-info-ul pb20 pr20"> 
                            <li className="height-auto elli" style={{width:"100%"}}>
                                <p className="msg-tit">决策结果描述</p>
                                <ul className="decision-resule pl30">
                                    <li>
                                        <span className="dR-tit pr20">共关联数据{commonJs.is_obj_exist(link_results.link_count)}条</span>
                                        <a onClick={this.relevanceDataHandle} id='relevanceData'>查看明细</a>
                                    </li>
                                    <li>
                                        <span className="dR-tit pr20">命中黑名单{commonJs.is_obj_exist(blacklist_results.blacklist_count)}条</span>
                                        <a onClick={this.blacklistHandle} id='blacklist'>查看明细</a>
                                    </li>
                                    <li>
                                        <span className="dR-tit pr20">GPS</span>
                                        <span title={commonJs.is_obj_exist(riskControlInfo.gps)}>{commonJs.is_obj_exist(riskControlInfo.gps)}</span>
                                    </li>
                                    <li>
                                        <span className="dR-tit pr20">imei</span>
                                        <span title={commonJs.is_obj_exist(riskControlInfo.imei)}>{commonJs.is_obj_exist(riskControlInfo.imei)}</span>
                                    </li>
                                </ul>
                            </li>
                            <li className="height-auto elli" style={{width:"100%"}}>
                                <p className="msg-tit">原因</p>
                                <b className='pl20 msg-cont break-all' title={commonJs.is_obj_exist(riskControlInfo.reason)}>{commonJs.is_obj_exist(riskControlInfo.reason)}</b>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="ant-modal" id='riskInfoTable'>
                    <Modal
                        title="关联数据明细"
                        width='70%'
                        visible={this.state.relevanceDataVisible}
                        onCancel={this.relevanceDataClose}
                        footer={null}
                        wrapClassName="relevanceHataModal"
                    >
                        <p className="red">提示：点击身份证号码可以搜索对应合同号。</p>
                        <Table rowKey={(record, index) => `rowKey${index}`} columns={columns} dataSource={DetailItems} bordered />
                    </Modal>
                    
                    <Modal
                        title="黑名单命中明细"
                        visible={this.state.blacklistVisible}
                        onCancel={this.blacklistClose}
                        footer={null}
                        wrapClassName="blacklistModal"
                    >
                        <table className="pt-table">
                            <tbody>
                                <tr className='th-bg'>
                                    <th>序号</th>
                                    <th>黑名单命中描述</th>
                                </tr>
                                {
                                    (blacklist_results.blacklist_items &&blacklist_results.blacklist_items.length>0&&Array.isArray(blacklist_results.blacklist_items))?blacklist_results.blacklist_items.map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td>{i}</td>
                                                    <td>{commonJs.is_obj_exist(repy)}</td>
                                                </tr>
                                    }):<tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                            </tbody>
                        </table>
                    </Modal>
                </div>
                </div>
    );
    }
};


export default RiskInfo;