// 门店审核详情
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; //根据编码获取地址
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";
import md5 from 'md5';

@inject('allStore') @observer
class ShopMsg extends React.Component {
    constructor(props){
        super(props);
        this.state={
            data:this.props.data?this.props.data:{} 
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            data:nextProps.data?nextProps.data:{}
        })
    }
    //新开页面查看文件
    openPage(sign){
        if(!sign){
            sign="";
            alert('未获取到文件id！')
            return;
        }
        if(sign){
            // sign=encodeURI(encodeURI(sign));
            sign=sign.toString();
            sign=md5(sign);
        }
        let data=this.state.data;
        let barseUrl="/cp-fileView?productNo="+data.productNo+"&storeId="+data.storeId+"&storeName="+data.storeName+"&key="+sign+"&JSsource=shopInfoFile";
        window.open(barseUrl);
    }
    render() {
        let {data}=this.state;
        return (
            <div className="auto-box pr5 relative">
                <div className="toggle-box">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    基本信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                        <li>
                            <p className="msg-tit">姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankUserName)}>{commonJs.is_obj_exist(data.bankUserName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">手机号码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankPhone)}>{commonJs.is_obj_exist(data.bankPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankNationalId)}>{commonJs.is_obj_exist(data.bankNationalId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">座机</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.phone)}>{commonJs.is_obj_exist(data.phone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.storeName)}>{commonJs.is_obj_exist(data.storeName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.storeId)}>{commonJs.is_obj_exist(data.storeId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">省份</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.province)}>{commonJs.is_obj_exist(data.province)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">城市</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.city)}>{commonJs.is_obj_exist(data.city)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">区域</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.district)}>{commonJs.is_obj_exist(data.district)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">详细地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.address)}>{commonJs.is_obj_exist(data.address)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box mt5">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    银行信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                        <li>
                            <p className="msg-tit">银行名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankName)}>{commonJs.is_obj_exist(data.bankName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">支行地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankPlace)}>{commonJs.is_obj_exist(data.bankPlace)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行卡号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankCardNumber)}>{commonJs.is_obj_exist(data.bankCardNumber)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行编码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(data.bankCode)}>{commonJs.is_obj_exist(data.bankCode)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box mt5">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    合同文件
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    {
                        <ul className="file-list bar mt5 pl20"> 
                            {
                                data.storeContractId && data.storeContractId.id ?
                                <li>
                                    <p className="left file-tit">门店与合作方文件</p>
                                    <b className="left file-link blue-font pointer" onClick={this.openPage.bind(this,data.storeContractId.id)}>查看</b>
                                </li>:""
                            }
                            {
                                (data.businessLicenseFileId && data.businessLicenseFileId.id) ?
                                <li>
                                    <p className="left file-tit">营业执照</p>
                                    <b className="left file-link blue-font pointer" onClick={this.openPage.bind(this,data.businessLicenseFileId.id)}>查看</b>
                                </li>:""
                            }
                            {
                                (data.leaseagreementId && data.leaseagreementId.id)?
                                <li>
                                    <p className="left file-tit">租赁合同</p>
                                    <b className="left file-link blue-font pointer" onClick={this.openPage.bind(this,data.leaseagreementId.id)}>查看</b>
                                </li>:""
                            }
                            {
                                (data.sitephotosId && data.sitephotosId.id)?
                                <li>
                                    <p className="left file-tit">场地照片</p>
                                    <b className="left file-link blue-font pointer" onClick={this.openPage.bind(this,data.sitephotosId.id)}>查看</b>
                                </li>:""
                            }
                        </ul>
                    }
                </div>
                <div className="toggle-box mt5">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    门店信息
                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                    </h2>
                    {
                        <ul className="file-list bar mt5 pl20"> 
                            {
                                (data.storeFiles&&data.storeFiles.length>0)?data.storeFiles.map((repy,i)=>{
                                    return <li key={i}>
                                                <p className="left file-tit">{commonJs.is_obj_exist(repy.fileType)}</p>
                                                <b className="left file-link blue-font pointer" onClick={this.openPage.bind(this,repy.id)}>查看</b>
                                            </li>
                                }):""
                            }
                        </ul>
                    }
                </div>
            </div>
    );
    }
};


export default ShopMsg;