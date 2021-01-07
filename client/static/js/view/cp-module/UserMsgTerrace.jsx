// 用户信息--平台
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import { Spin } from 'antd';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Button } from 'antd';

@inject('allStore') @observer
class UserMsgTerrace extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            userInfo:{},  //客户信息
            bankInfo:{},  //银行信息
            contactsInfo:{},  //联系人信息
            workInfo:{},  //工作信息
            loanInfo:{},  //贷款信息
            otherInfo:{},  //其他信息
        }
    }
    //电话图标事件
    phoneHandle=(callByTianr,phoneNo)=>{
        if(callByTianr=='YES'){
            callout(phoneNo);
        }else{
            var a = document.createElement('a');
            a.setAttribute('href', "ALICCT:dialout?calleeno="+commonJs.queueEncypt800(this.props._location,phoneNo));
            a.setAttribute('id', 'startTelMedicine');
            // 防止反复添加
            if(document.getElementById('startTelMedicine')) {
                document.body.removeChild(document.getElementById('startTelMedicine'));
            }
            document.body.appendChild(a);
            a.click();
        }
    }
    //注销
    logout=(e,userInfo)=>{
        e.stopPropagation();
        let {userPhone}=userInfo;
        if(userPhone&&userPhone.length>0){
            $.ajax({
                type:"post",
                url:'/node/search/logout',
                async:true,
                dataType: "JSON",
                data:{phone:userPhone},
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    
                    alert(res.message);
                }
            })
        }else{
            alert('该用户信息缺失手机号');
        }
    }
    render() {
        let platforIdentityInfo=this.props.allStore.UserinfoStore.platforIdentityInfo;
        let userInfo=platforIdentityInfo.platformUserInfoDTO?platforIdentityInfo.platformUserInfoDTO:{};
        let bankInfo=platforIdentityInfo.platformBankInfoDTO?platforIdentityInfo.platformBankInfoDTO:{};
        let contactsInfo=platforIdentityInfo.platformContactsInfoDTO?platforIdentityInfo.platformContactsInfoDTO:{};
        let workInfo=platforIdentityInfo.platformWorkInfoDTO?platforIdentityInfo.platformWorkInfoDTO:{};
        let loanInfo=platforIdentityInfo.platformLoanInfoDTO?platforIdentityInfo.platformLoanInfoDTO:{};
        let otherInfo=platforIdentityInfo.platformOtherInfoDTO?platforIdentityInfo.platformOtherInfoDTO:{};
        let corpInfoDTO=platforIdentityInfo.corpInfoDTO?platforIdentityInfo.corpInfoDTO:{};
        let newImeiData=otherInfo.imeiNo;
        if(newImeiData){
            newImeiData=newImeiData.split(",");
        }

        let collectionNextData=cpCommonJs.opinitionObj(this.commonStore.collectionNextData);
        let collectionOverdueInfoDTOS=collectionNextData.collectionOverdueInfoDTOS;
        let collectionGrade='';
        let productNo = '';
        if(collectionOverdueInfoDTOS && collectionOverdueInfoDTOS[0]){
            collectionGrade=collectionOverdueInfoDTOS[0].collectionGrade;
            productNo=collectionOverdueInfoDTOS[0].productNo;
        }
        let stopDay=collectionNextData.stopDay;

        // let callByTianr=validInfoDTO.callByTianr;  //是否能使用天润呼叫，不能则使用800呼叫 = ['YES', 'NO', 'DESTROY']
        let callByTianr="NO";  //使用800呼叫
        return (
            <div className="auto-box pr5 relative" style={{marginTop:'10px'}}>
                <div className="toggle-box bar">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                        客户信息
                        {this.props.allStore.UserinfoStore.cooperationFlag=='2F'&&<Button type="primary" style={{marginLeft: '75%',width: '65px',height: '27px'}} onClick={(e)=>{this.logout(e,userInfo)}} >注销</Button>}
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userName)}>{commonJs.is_obj_exist(userInfo.userName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">手机号码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userPhone)}>
                                {
                                    userInfo.userPhone?<span><a className="phont-btn-user block left ml5 mt2" id='step1PhoneCall' onClick={this.phoneHandle.bind(this,callByTianr,userInfo.userPhone)}></a><span>{commonJs.is_obj_exist(userInfo.userPhone)}</span></span>:''
                                }
                            </b>
                        </li>
                        <li>
                            <p className="msg-tit">EMAIL</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userEmail)}>{commonJs.is_obj_exist(userInfo.userEmail)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">用户类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userType)}>{commonJs.is_obj_exist(userInfo.userType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学位</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userHighestEducation)}>{commonJs.is_obj_exist(userInfo.userHighestEducation)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">居住省市区</p>
                            <b className="msg-cont" title="" title={commonJs.is_obj_exist(userInfo.userAddress)}>{commonJs.is_obj_exist(userInfo.userAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">详细地址</p>
                            <b className="msg-cont" title="" title={commonJs.is_obj_exist(userInfo.userHomeAddress)}>{commonJs.is_obj_exist(userInfo.userHomeAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">住房情况</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userHousingSituation)}>{commonJs.is_obj_exist(userInfo.userHousingSituation)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">现住所居住时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userLiveTime)}>{commonJs.is_obj_exist(userInfo.userLiveTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证号码</p>
                            <b className="msg-cont">{commonJs.is_obj_exist(userInfo.userNationalId).replace(/(.{0}).*(.{12})/, "$1****$2")}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证有效期</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userValidDateRange)}>{commonJs.is_obj_exist(userInfo.userValidDateRange)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">QQ号码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userQq)}>{commonJs.is_obj_exist(userInfo.userQq)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">微信号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userWx)}>{commonJs.is_obj_exist(userInfo.userWx)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">婚姻</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userIsMarried)}>{commonJs.is_obj_exist(userInfo.userIsMarried)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">是否有车</p>
                            <b className="msg-cont" title={cpCommonJs.opinitionBool.bind(this,userInfo.userHaveCar,"有","无")}>{cpCommonJs.opinitionBool.bind(this,userInfo.userHaveCar,"有","无")}</b>
                        </li>
                        <li>
                            <p className="msg-tit">是否有子女</p>
                            <b className="msg-cont" title={cpCommonJs.opinitionBool.bind(this,userInfo.userHaveChild,"有","无")}>{cpCommonJs.opinitionBool.bind(this,userInfo.userHaveChild,"有","无")}</b>
                        </li>
                        <li>
                            <p className="msg-tit">购买付费会员时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userBuyMembershipTime)}>{commonJs.is_obj_exist(userInfo.userBuyMembershipTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">购买付费会员到期时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userMembershipExpireTime)}>{commonJs.is_obj_exist(userInfo.userMembershipExpireTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">用户注册时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.userRegisterTime)}>{commonJs.is_obj_exist(userInfo.userRegisterTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.nationalType)}>{commonJs.is_obj_exist(userInfo.nationalType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证所属区ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.nationalDistrictId)}>{commonJs.is_obj_exist(userInfo.nationalDistrictId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证所属市ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.nationalCityId)}>{commonJs.is_obj_exist(userInfo.nationalCityId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证所属省ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.nationalProvinceId)}>{commonJs.is_obj_exist(userInfo.nationalProvinceId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">身份证地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.nationalAddress)}>{commonJs.is_obj_exist(userInfo.nationalAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">用户信用卡卡号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.creditCardNo)}>{commonJs.is_obj_exist(userInfo.creditCardNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">进件授权码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.authToken)}>{commonJs.is_obj_exist(userInfo.authToken)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">平台注册时长</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.registerDays)}>{commonJs.is_obj_exist(userInfo.registerDays)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">芝麻分</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.zimaScore)}>{commonJs.is_obj_exist(userInfo.zimaScore)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">授信金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.creditAmount)}>{commonJs.is_obj_exist(userInfo.creditAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">可用额度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.creditRemainAmount)}>{commonJs.is_obj_exist(userInfo.creditRemainAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">合作方用户ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.registerId)}>{commonJs.is_obj_exist(userInfo.registerId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">是否新用户</p> 
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.isNew)}>{commonJs.is_obj_exist(userInfo.isNew)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第一联系人名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.contactFirstNickname)}>{commonJs.is_obj_exist(userInfo.contactFirstNickname)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">月收入范围</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(userInfo.incomeRange)}>{commonJs.is_obj_exist(userInfo.incomeRange)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    银行信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">持卡人姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.bankUserName)}>{commonJs.is_obj_exist(bankInfo.bankUserName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行卡号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.bankBankCardNumber)}>{commonJs.is_obj_exist(bankInfo.bankBankCardNumber)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行代码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.bankBankId)}>{commonJs.is_obj_exist(bankInfo.bankBankId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行所在地(省市区)</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.bankAddress)}>{commonJs.is_obj_exist(bankInfo.bankAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行所在地(详细地址)</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.bankBankPlace)}>{commonJs.is_obj_exist(bankInfo.bankBankPlace)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商家银行开户行地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankAddress)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">公司银行账户</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankCardNo)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankCardNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商家银行开户行所在市级名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankCity)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankCity)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行编码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankCode)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankCode)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankName)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商家银行开户行所在省级名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.sellerSellerBankProvince)}>{commonJs.is_obj_exist(bankInfo.sellerSellerBankProvince)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行卡绑定手机号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(bankInfo.userBankCardBindPhone)}>{commonJs.is_obj_exist(bankInfo.userBankCardBindPhone)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    联系人信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">第一联系人姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactFirstContactName)}>{commonJs.is_obj_exist(contactsInfo.contactFirstContactName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第一联系人电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactFirstContactPhone)}>{commonJs.is_obj_exist(contactsInfo.contactFirstContactPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第一联系人居住地址(省市区)</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactsAddress)}>{commonJs.is_obj_exist(contactsInfo.contactsAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第一联系人居住详细地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactFirstContactAddress)}>{commonJs.is_obj_exist(contactsInfo.contactFirstContactAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第一联系人关系</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactFirstContactRelationship)}>{commonJs.is_obj_exist(contactsInfo.contactFirstContactRelationship)}</b>
                        </li>
                        <li className="line"></li>
                        <li>
                            <p className="msg-tit">第二联系人姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactSecondContactName)}>{commonJs.is_obj_exist(contactsInfo.contactSecondContactName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第二联系人电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactSecondContactPhone)}>{commonJs.is_obj_exist(contactsInfo.contactSecondContactPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第二联系人关系</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactSecondContactRelationship)}>{commonJs.is_obj_exist(contactsInfo.contactSecondContactRelationship)}</b>
                        </li>
                        <li className="line"></li>
                        <li>
                            <p className="msg-tit">第三联系人姓名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactThirdContactName)}>{commonJs.is_obj_exist(contactsInfo.contactThirdContactName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第三联系人电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactThirdContactPhone)}>{commonJs.is_obj_exist(contactsInfo.contactThirdContactPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">第三联系人关系</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(contactsInfo.contactThirdContactRelationship)}>{commonJs.is_obj_exist(contactsInfo.contactThirdContactRelationship)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    工作信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">收入</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.userIncome)}>{commonJs.is_obj_exist(workInfo.userIncome)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">收入来源</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.userIncomeSource)}>{commonJs.is_obj_exist(workInfo.userIncomeSource)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">每月工资发放日</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.userPaydate)}>{commonJs.is_obj_exist(workInfo.userPaydate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">现单位工作时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.worWworkTime)}>{commonJs.is_obj_exist(workInfo.worWworkTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位所属行业</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workCompanyIndustry)}>{commonJs.is_obj_exist(workInfo.workCompanyIndustry)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workCompanyName)}>{commonJs.is_obj_exist(workInfo.workCompanyName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">职称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workJobTitle)}>{commonJs.is_obj_exist(workInfo.workJobTitle)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">职位</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workPositionText?workInfo.workPositionText:workInfo.workPosition)}>
                                {commonJs.is_obj_exist(workInfo.workPositionText?workInfo.workPositionText:workInfo.workPosition)}
                            </b>
                        </li>
                        <li>
                            <p className="msg-tit">职业</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workProfession)}>{commonJs.is_obj_exist(workInfo.workProfession)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位地址(省市区)</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workAddress)}>{commonJs.is_obj_exist(workInfo.workAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位详细地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workWorkAddress)}>{commonJs.is_obj_exist(workInfo.workWorkAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workWorkPhone)}>{commonJs.is_obj_exist(workInfo.workWorkPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">单位电话类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(workInfo.workWorkPhoneType)}>{commonJs.is_obj_exist(workInfo.workWorkPhoneType)}</b>
                        </li>
                    </ul>
                </div>
                
                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    企业信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">企业名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(corpInfoDTO.name)}>{commonJs.is_obj_exist(corpInfoDTO.name)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">企业简称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(corpInfoDTO.simpleName)}>{commonJs.is_obj_exist(corpInfoDTO.simpleName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">社会信用代码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(corpInfoDTO.creditCode)}>{commonJs.is_obj_exist(corpInfoDTO.creditCode)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">企业注册地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(corpInfoDTO.address)}>{commonJs.is_obj_exist(corpInfoDTO.address)}</b>
                        </li>
                    </ul>
                </div>

                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    贷款信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li>
                            <p className="msg-tit">是否代偿</p>
                            <b className="msg-cont" title={cpCommonJs.opinitionBool.bind(this,loanInfo.userHaveCar,"是","否")}>{cpCommonJs.opinitionBool.bind(this,loanInfo.userHaveCar,"是","否")}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanApplyTime)}>{commonJs.is_obj_exist(loanInfo.loanApplyTime)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">年利率</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanApr)}>{commonJs.is_obj_exist(loanInfo.loanApr)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">清算利率</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanAprClearnce)}>{commonJs.is_obj_exist(loanInfo.loanAprClearnce)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">佣金比例</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanAprCommision)}>{commonJs.is_obj_exist(loanInfo.loanAprCommision)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">首付</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanDownPayment)}>{commonJs.is_obj_exist(loanInfo.loanDownPayment)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款期数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanInstallments)}>{commonJs.is_obj_exist(loanInfo.loanInstallments)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请点维度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanLat)}>{commonJs.is_obj_exist(loanInfo.loanLat)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanLoanAmount)}>{commonJs.is_obj_exist(loanInfo.loanLoanAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">清算金额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanLoanAmountClearnce)}>{commonJs.is_obj_exist(loanInfo.loanLoanAmountClearnce)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">合同编码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanLoanNumber)}>{commonJs.is_obj_exist(loanInfo.loanLoanNumber)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请地点经度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanLon)}>{commonJs.is_obj_exist(loanInfo.loanLon)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.loanType)}>{commonJs.is_obj_exist(loanInfo.loanType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">网签成功后跳转url</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.redirectUrl)}>{commonJs.is_obj_exist(loanInfo.redirectUrl)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">扣款日</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.userDebitDay)}>{commonJs.is_obj_exist(loanInfo.userDebitDay)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">贷款目的</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.userLoanPurpose)}>{commonJs.is_obj_exist(loanInfo.userLoanPurpose)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">平台历史借款总额</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.totalLoanAmount)}>{commonJs.is_obj_exist(loanInfo.totalLoanAmount)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">平台历史借款次数</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.totalLoanTimes)}>{commonJs.is_obj_exist(loanInfo.totalLoanTimes)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">场景描述</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.sceneDescr)}>{commonJs.is_obj_exist(loanInfo.sceneDescr)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">申请地点IP</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.ip)}>{commonJs.is_obj_exist(loanInfo.ip)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">授信编号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.acceptNo)}>{commonJs.is_obj_exist(loanInfo.acceptNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款合同起始日</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.startDate)}>{commonJs.is_obj_exist(loanInfo.startDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">借款合同结束日</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.endDate)}>{commonJs.is_obj_exist(loanInfo.endDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">场景类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(loanInfo.sceneType)}>{commonJs.is_obj_exist(loanInfo.sceneType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">催收等级</p>
                            <b className="msg-cont">{commonJs.is_obj_exist(collectionGrade)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">停留时间</p>
                            <b className={(stopDay==1)?'red msg-cont':'msg-cont'}>{commonJs.is_obj_exist(stopDay)}</b>
                        </li>
                    </ul>
                </div>
                <div className="toggle-box bar mt5" data-btn-rule="">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    其他信息
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    <ul className="cp-info-ul pb20 pr20"> 
                        <li style={{"height":"auto"}}>
                            <p className="msg-tit">IMEI</p>
                            {/* 显示数据 */}
                            {
                                (newImeiData && newImeiData.length>0)?newImeiData.map((imeiRrpy,j)=>{
                                    return <b key={j} className="msg-cont" title={commonJs.is_obj_exist(imeiRrpy)}>{commonJs.is_obj_exist(imeiRrpy)}</b>
                                }):<b className="msg-cont" title="-">-</b>
                            }
                            <a  className="btn-blue block left imeiBtn addImeiBtn hidden" id='addImeiBtn' onClick={this.store.updateIMEI.bind(this)}>新增</a>
                            {/* 显示新增按钮 */}
                            {/* {
                                (newImeiData && newImeiData.length>0 && newImeiData.length<2)?
                                <a  data-action="showInput" className="btn-blue block left" style={{"width":"30%"}} onClick={this.store.showAddBtn.bind(this)}>新增</a>
                                :""
                            } */}
                            {/* 显示input框修改 */}
                            {/* {
                                <div className="addIMEI clearfix ml20">
                                    <input type="text" className="input IMEIinput left mr5 hidden" style={{"width":"60%"}} />
                                </div>
                            } */}
                        </li>
                        <li>
                            <p className="msg-tit">商品价格</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commoditPrice)}>{commonJs.is_obj_exist(otherInfo.commoditPrice)}</b>
                        </li>

                        <li>
                            <p className="msg-tit">业务人员名字</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityBusinessName)}>{commonJs.is_obj_exist(otherInfo.commodityBusinessName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">业务人员工号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityBusinessOrderNo)}>{commonJs.is_obj_exist(otherInfo.commodityBusinessOrderNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">业务人员电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityBusinessPhone)}>{commonJs.is_obj_exist(otherInfo.commodityBusinessPhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商品名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityName)}>{commonJs.is_obj_exist(otherInfo.commodityName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityStoreAddress)}>{commonJs.is_obj_exist(otherInfo.commodityStoreAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityStoreName)}>{commonJs.is_obj_exist(otherInfo.commodityStoreName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店电话</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.commodityStorePhone)}>{commonJs.is_obj_exist(otherInfo.commodityStorePhone)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">是否代偿</p>
                            <b className="msg-cont" title={cpCommonJs.opinitionBool.bind(this,loanInfo.compensatory,"是","否")}>{cpCommonJs.opinitionBool.bind(this,loanInfo.compensatory,"是","否")}</b>
                        </li>
                        <li>
                            <p className="msg-tit">证书号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationCertificateNo)}>{commonJs.is_obj_exist(otherInfo.educationCertificateNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">所在地区</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationCity)}>{commonJs.is_obj_exist(otherInfo.educationCity)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学位类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationDegree)}>{commonJs.is_obj_exist(otherInfo.educationDegree)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">部门</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationDepartment)}>{commonJs.is_obj_exist(otherInfo.educationDepartment)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">毕业时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationGraduateDate)}>{commonJs.is_obj_exist(otherInfo.educationGraduateDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">专业</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationMajor)}>{commonJs.is_obj_exist(otherInfo.educationMajor)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">入学时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationRegistrationDate)}>{commonJs.is_obj_exist(otherInfo.educationRegistrationDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">毕业学校</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.educationSchool)}>{commonJs.is_obj_exist(otherInfo.educationSchool)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">业务人员ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerId)}>{commonJs.is_obj_exist(otherInfo.sellerId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商家银行开户行地址</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerBankAddress)}>{commonJs.is_obj_exist(otherInfo.sellerSellerBankAddress)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">公司银行账户</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerBankCardNo)}>{commonJs.is_obj_exist(otherInfo.sellerSellerBankCardNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商家银行开户行所在市级名称</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerBankCity)}>{commonJs.is_obj_exist(otherInfo.sellerSellerBankCity)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行编码</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerBankCode)}>{commonJs.is_obj_exist(otherInfo.sellerSellerBankCode)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">银行名称 </p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerBankName)}>{commonJs.is_obj_exist(otherInfo.sellerSellerBankName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">公司法人的身份证号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerCertNo)}>{commonJs.is_obj_exist(otherInfo.sellerSellerCertNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">公司法人的手机号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerMobileNo)}>{commonJs.is_obj_exist(otherInfo.sellerSellerMobileNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">公司账户的开户名</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.sellerSellerName)}>{commonJs.is_obj_exist(otherInfo.sellerSellerName)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">业务来源</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.source)}>{commonJs.is_obj_exist(otherInfo.source)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">门店ID</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.storeId)}>{commonJs.is_obj_exist(otherInfo.storeId)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商店纬度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.storeLatitude)}>{commonJs.is_obj_exist(otherInfo.storeLatitude)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商店经度</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.storeLongitude)}>{commonJs.is_obj_exist(otherInfo.storeLongitude)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">店类型</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.storeType)}>{commonJs.is_obj_exist(otherInfo.storeType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学校</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordCollege)}>{commonJs.is_obj_exist(otherInfo.studentRecordCollege)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学历</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordDegree)}>{commonJs.is_obj_exist(otherInfo.studentRecordDegree)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学位号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordDegreeNo)}>{commonJs.is_obj_exist(otherInfo.studentRecordDegreeNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">在籍状态</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordEnrollmentStatus)}>{commonJs.is_obj_exist(otherInfo.studentRecordEnrollmentStatus)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">毕业时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordGraduationDate)}>{commonJs.is_obj_exist(otherInfo.studentRecordGraduationDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">专业</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordMajor)}>{commonJs.is_obj_exist(otherInfo.studentRecordMajor)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">几年制</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordProgramType)}>{commonJs.is_obj_exist(otherInfo.studentRecordProgramType)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">民族</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordRace)}>{commonJs.is_obj_exist(otherInfo.studentRecordRace)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">入学时间</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordRegistrationDate)}>{commonJs.is_obj_exist(otherInfo.studentRecordRegistrationDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">学号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.studentRecordStudentNo)}>{commonJs.is_obj_exist(otherInfo.studentRecordStudentNo)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">最高学位</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.userHighestDegree)}>{commonJs.is_obj_exist(otherInfo.userHighestDegree)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">内存</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.memorySize)}>{commonJs.is_obj_exist(otherInfo.memorySize)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商品颜色</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.color)}>{commonJs.is_obj_exist(otherInfo.color)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">是否促销</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.promotion)}>{commonJs.is_obj_exist(otherInfo.promotion)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商品分类</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.goodClass)}>{commonJs.is_obj_exist(otherInfo.goodClass)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">商品描述</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.descr)}>{commonJs.is_obj_exist(otherInfo.descr)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">用户账单日</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.billDate)}>{commonJs.is_obj_exist(otherInfo.billDate)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">办单设备型号</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.deviceModel)}>{commonJs.is_obj_exist(otherInfo.deviceModel)}</b>
                        </li>
                        <li>
                            <p className="msg-tit">办单设备IMEI</p>
                            <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.deviceImei)}>{commonJs.is_obj_exist(otherInfo.deviceImei)}</b>
                        </li>
                        {
                            this.store.cooperationFlag=="3F"?
                            <li>
                                <p className="msg-tit">审核金额</p>
                                <b className="msg-cont" title={commonJs.is_obj_exist(otherInfo.approvalAmount)}>{commonJs.is_obj_exist(otherInfo.approvalAmount)}</b>
                            </li>:""
                        }
                    </ul>
                </div>
            </div>
    );
    }
};


export default UserMsgTerrace;