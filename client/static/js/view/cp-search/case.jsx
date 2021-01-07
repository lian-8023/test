// 合作方案例
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import axios from '../../axios';
import { Select } from 'antd';
const { Option } = Select;
import qs from 'Qs';

@inject('allStore') @observer
class Case extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;  //第三方用户详情-UserMsgThird组件信息
        this.commonStore=this.props.allStore.CommonStore;
        this.state={
        }
    }
    componentDidMount () {
        this.init();
        this.getCaseList();
        commonJs.reloadRules();
    }
    //通过loan_number查询案例记录
    getCaseList(){
        let loanNumber=this.commonStore.rowData.loanNo;
        let that=this;
        axios({
            method: 'get',
            params:{loanNumber},
            url:'/node/case/showCase',
        })
        .then(function (res) {
            console.log(res)
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    caseDTOS:[]
                })
                return;
            }
            that.setState({
                caseDTOS:cpCommonJs.opinitionArray(data.caseDTOS)
            })
        })
    }

    //获取案例类别和沟通方式
    init(){
        let that=this;
        axios({
            method: 'POST',
            url:'/node/case/init',
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    caseFrom:{},
                    caseType:{}
                })
                return;
            }
            that.setState({
                caseFrom:data.caseFrom,
                caseType:data.caseType
            })
        })
    }
    
    //保存案例
    saveCaseList(){
        let that=this;
        let caseFrom=this.state.caseFrompeName;
        let caseType=this.state.caseTypeName;
        let detail=this.state.caseDetail;
        let productNo=this.commonStore.rowData.cooperationFlag;
        // let pathQuery=this.props.location.query;
        if(!caseType||caseType.length<=0){
            alert('请选择案例类别!');
            return;
        }
        if(!caseFrom||caseFrom.length<=0){
            alert('请选择案例来源!');
            return;
        }
        if(!detail||!detail.replace(/\s/g,'')){
            alert('请填写案例详情!');
            return;
        }
        let loanNumber=this.commonStore.rowData.loanNo;
        let fromFlag=this.commonStore.rowData.platformFlag;
        let phone='',name='',orderFrom='';
        if(fromFlag=='TH'){
            let _thirdIdentityResponseOldDTO=cpCommonJs.opinitionObj(this.userinfoStore.thirdIdentityResponseOldDTO);
            let personMap=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.personMap);
            phone=personMap['联系电话'];
            name=personMap['姓名'];
        }else if(fromFlag=='PF'){
            let platforIdentityInfo=this.userinfoStore.platforIdentityInfo;
            let userInfo=cpCommonJs.opinitionObj(platforIdentityInfo.platformUserInfoDTO);
            phone=userInfo.userPhone;
            name=userInfo.userName;
        }else if(fromFlag=='XYH'){
            let XYH_IdentityInfo=cpCommonJs.opinitionObj(this.userinfoStore.XYH_IdentityInfo);
            phone=cpCommonJs.opinitionObj(XYH_IdentityInfo.userInfo).mobileNo;
            name=cpCommonJs.opinitionObj(XYH_IdentityInfo.userInfo).realName;
            orderFrom=cpCommonJs.opinitionObj(XYH_IdentityInfo.loanInfo).orderOrigin;  //订单来源
        }
        
        let parems={
            caseFrom,caseType,detail,loanNumber,phone,name,orderFrom,productNo
        };
        // {josnParam:JSON.stringify(newDataObj)};
        axios({
            method: 'POST',
            url:'/node/case/addCase',
            data:{josnParam:JSON.stringify(parems)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.getCaseList();
            that.cancelSave();
        })
    }
    //取消保存
    cancelSave(){
        this.setState({
            caseTypeName:[],
            caseFrompeName:[],
            caseDetail:''
        });
    }
    // 案例类别选择
    caseTypeSelect=(value)=>{
        this.setState({caseTypeName:value})
    }
    caseFrompeSelect=(value)=>{
        this.setState({caseFrompeName:value})
    }
    //
    handleTextareaChange=(e)=>{
        this.setState({
            caseDetail:e.target.value
        })
    }
    render() {
        const {caseFrom={},caseType={},caseDTOS=[]}=this.state;
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" id='creatCase' onClick={commonJs.content_toggle.bind(this)}>
                        +&nbsp;创建案例
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <div className="clearfix mt5 bar hidden">
                        <table className="radius-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                            <tbody>
                                <tr>
                                    <th width="50%">案例类别</th>
                                    <th width="50%">案例来源</th>
                                </tr>
                                <tr>
                                    <td className="" id='caseTypeName'>
                                        <Select 
                                            placeholder="请选择" 
                                            style={{ width:'90%' }} 
                                            value={this.state.caseTypeName} 
                                            onSelect={this.caseTypeSelect}
                                        >
                                            {
                                                (caseType && caseType.length>0) ? caseType.map((repy,i)=>{
                                                    return <Option key={i} value={repy.name}>{repy.displayName}</Option>
                                                }):<Option key='0'></Option>
                                            }
                                        </Select>
                                    </td>
                                    <td className="pr20" id='caseFrompeName'>
                                        <Select 
                                            placeholder="请选择" 
                                            style={{ width:'90%' }} 
                                            value={this.state.caseFrompeName} 
                                            onSelect={this.caseFrompeSelect}
                                        >
                                            {
                                                (caseFrom && caseFrom.length>0) ? caseFrom.map((repy,i)=>{
                                                    return <Option key={i} value={repy.name}>{repy.displayName}</Option>
                                                }):<Option key='0'></Option>
                                            }
                                        </Select>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <span>详情</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <textarea name="" id="creatCaseCont" cols="30" rows="10" className="commu-area textarea" onChange={this.handleTextareaChange} style={mystyle.detail} value={this.state.caseDetail}></textarea>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="2">
                                        <button className="left block ml20 edit btn-blue saveVoeQueue-btn" id='saveCase' onClick={this.saveCaseList.bind(this)}>保存</button>
                                        <button className="btn-white left block ml20 cancle_edit" id='saveCaseCancle' onClick={this.cancelSave.bind(this)}>取消</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                {/*案例记录*/}
                {
                    (caseDTOS && caseDTOS.length>0) ? caseDTOS.map((repy,i)=>{
                        return <div className="toggle-box" key={i}>
                                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                                        {repy.caseType}
                                        <i className="right bar-tit-toggle bar-tit-toggle-down" data-type="Fraud" ></i>
                                    </h2>
                                    <div className="bar mt5 hidden">
                                        <table className="radius-tab replay-list commu-tab" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                            <tbody>
                                            <tr>
                                                <th width="15%">案例类别</th>
                                                <th width="15%">案例来源</th>
                                                <th width="40%">合同号</th>
                                                <th></th>
                                            </tr>
                                            {
                                                (repy.listInfoDTOS && repy.listInfoDTOS.length>0)?repy.listInfoDTOS.map((cases,index)=>{
                                                    return <tr key={index}>
                                                            <td colSpan="4" className="no-padding-left">
                                                                <table className="Queue-table" width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                                                    <tbody>
                                                                        <tr>
                                                                            <td width="15%" title={commonJs.is_obj_exist(cases.caseType)}>{commonJs.is_obj_exist(cases.caseType)}</td>
                                                                            <td width="15%" title={commonJs.is_obj_exist(cases.caseFrom)}>{commonJs.is_obj_exist(cases.caseFrom)}</td>
                                                                            <td width="40%" title={commonJs.is_obj_exist(cases.loanNumber)}>{commonJs.is_obj_exist(cases.loanNumber)}</td>
                                                                            <td title={commonJs.is_obj_exist(cases.createdBy)+commonJs.is_obj_exist(cases.createdAt)}>
                                                                                <div className="ext-source-tip word-break">
                                                                                    {commonJs.is_obj_exist(cases.createdBy)} <br/>{commonJs.is_obj_exist(cases.createdAt)}
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                        <tr className="border-bottom">
                                                                            <td colSpan="4" className="short-border-td">
                                                                                <div className="short-border"></div>
                                                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(cases.detail)}>{commonJs.is_obj_exist(cases.detail)}</p>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                            }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                    }):""
                }
            </div>
        )
    }
};
const mystyle={
    detail:{width:'95%',height:'130px'}
}
export default Case;