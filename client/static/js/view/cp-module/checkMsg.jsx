// 商户审核&门店审核 详情信息--小雨花
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import ProductConfig from '../../template/poductConfig';  //详情模板
import {observer,inject} from "mobx-react";
import ModifyInput from './modifyInput';
import axios from '../../axios';
import Address from '../module/address';
import { Select } from 'antd';
import qs from 'Qs';

const { Option } = Select;
@inject('allStore') @observer
class CheckMsg extends React.Component {
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore;
        this.state={
            state_afterModifyData:{},
            levelEnums:[],
            operationTimeList:[  //经营时长
                {value:'1年以下',displayName:'1年以下'},
                {value:'1-3年',displayName:'1-3年'},
                {value:'3-5年',displayName:'3-5年'},
                {value:'6年以上',displayName:'6年以上'},
            ],
            leaseTimeList:[  //租赁年限
                {value:'1年以下',displayName:'1年以下'},
                {value:'1-5年',displayName:'1-5年'},
                {value:'6年以上',displayName:'6年以上'},
                {value:'自有',displayName:'自有'},
            ],
            scaleList:[  //企业规模
                {value:'1-2家',displayName:'1-2家'},
                {value:'3家以上',displayName:'3家以上'},
            ]
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            nextProps:nextProps
        })
    }
    //初始化修改前的数据
    setInitH=(keyword,val)=>{
        let tempType=this.props.tempType;
        let getData={};
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let _beforModifyData=cpCommonJs.opinitionObj(this.commonStore.beforModifyData);
        if(val=='-'){
            val='';
        }
        _beforModifyData[keyword]=val;
        this.commonStore.beforModifyData=_beforModifyData;  //编辑前的数据
        let _obj=Object.assign({},this.commonStore.beforModifyData);

        if(tempType=='businessCheck'){
            let merchantExamineInfo=cpCommonJs.opinitionObj(checkData.merchantExamineInfo);
            let merchantInfo=cpCommonJs.opinitionObj(checkData.merchantInfo);
            getData=cpCommonJs.opinitionObj(merchantExamineInfo.merchantPortalDetail);
            let levelEnums=cpCommonJs.opinitionArray(checkData.levelEnums);
            _obj.provinceId=getData.provinceId;
            _obj.cityId=getData.cityId;
            _obj.areaId=getData.areaId;
            _obj.businessLicense=merchantInfo.businessLicense;
            _obj.merchantName=merchantInfo.merchantName;
            _obj.merchantNo=merchantInfo.merchantNo;
            _obj.versionNo=merchantInfo.versionNo;
            _obj.submitTime=merchantInfo.submitTime;
            _obj.applicationType=merchantInfo.applicationType;
            _obj.merchantLevel=getData.merchantLevel;
            _obj.operationTime=getData.operationTime;
            _obj.leaseTime=getData.leaseTime;
            _obj.scale=getData.scale;
            this.setState({
                levelEnums:levelEnums
            })

        }else if(tempType=='shopcheck'){
            let shopExamineInfo=cpCommonJs.opinitionObj(checkData.shopExamineInfo);
            let shopPortalDetail=cpCommonJs.opinitionObj(shopExamineInfo.shopPortalDetail);
            _obj.provinceId=shopPortalDetail.provinceId;
            _obj.cityId=shopPortalDetail.cityId;
            _obj.areaId=shopPortalDetail.areaId;
            _obj.legalHomeProvinceId=shopPortalDetail.legalHomeProvinceId;
            _obj.legalHomeCityId=shopPortalDetail.legalHomeCityId;
            _obj.legalHomeAreaId=shopPortalDetail.legalHomeAreaId;
            _obj.legalHomeAddress=shopPortalDetail.legalHomeAddress;
            _obj.operationTime=shopPortalDetail.operationTime;
            _obj.leaseTime=shopPortalDetail.leaseTime;
            _obj.shopDetail
        }
        
        this.commonStore.afterModifyData=_obj;  //编辑前的数据
        this.setState({
            state_afterModifyData:_obj
        })
    }
    // 修改编辑
    modifyInputChange(keyword,event){
        let _val=event.target.value.replace(/^\s+|\s+$/g,'');
        let _afterModifyData=cpCommonJs.opinitionObj(this.commonStore.afterModifyData);
        _afterModifyData[keyword]=_val;
        this.commonStore.afterModifyData=_afterModifyData;  //编辑后的数据

        let state_afterModifyData=this.state.state_afterModifyData;
        let _obj=Object.assign({},state_afterModifyData);
        _obj[keyword]=_val;
        this.setState({
            afterModifyData:_obj
        })
    }
    //修改
    modifyHandle=()=>{
        this.commonStore.modifyIng=true;
    }
    //保存修改
    sureModify=()=>{
        let isSame=true,that=this;
        let {beforModifyData,afterModifyData}=this.commonStore;
        if(Object.keys(afterModifyData).length<=0){
            isSame=true;
        }else{
            for(let key in beforModifyData){
                if(beforModifyData[key]==afterModifyData[key]){
                    isSame=true;
                }else{
                    isSame=false;
                }
            }
        }
        if(isSame){
            alert('您未做任何修改！');
            return;
        }
        axios({
            method: 'POST',
            url:'/node/merchant/save',
            data:{josnParam:JSON.stringify(afterModifyData)}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            that.props.searchHandle('RELOAD',true);
        })
    }
    //取消修改
    cancleModify=(mark)=>{
        this.commonStore.afterModifyData={};
    }
    //
    selecHhandleChange=(LabeledValue,option)=>{
        let _props=option.props;
        let _key=_props.name;
        let _val=_props.value;
        let _afterModifyData=cpCommonJs.opinitionObj(this.commonStore.afterModifyData);
        _afterModifyData[_key]=_val;
        this.commonStore.afterModifyData=_afterModifyData;  //编辑后的数据
    }
    returnDom=(modifyIng,modification,modifyType,repy,displayName,keyword,state_afterModifyData,w,paremKey,stateKey)=>{
        if(modifyIng&&modification){
            if(modifyType=='addr'){
                return <div style={{width:'90%',height:'24px'}} className='relative left ml20 ADDRESS'>
                            <Address _defaultAddr_val={displayName} type='new' provinceId={repy.provinceId} cityId={repy.cityId} areaId={repy.areaId} requird={true} />
                        </div>
            }else if(modifyType=='input'){
                return <ModifyInput 
                            keys={paremKey}  
                            defaultValue={commonJs.is_obj_exist(displayName)} 
                            onChange={this.modifyInputChange.bind(this,keyword)} 
                            value={state_afterModifyData[keyword]?state_afterModifyData[keyword]:''} 
                            setInit={this.setInitH} 
                            style={{marginLeft:'20px','float':'left','width':'90%'}} 
                        />
            }else if(modifyType=='select'){
                return <Select defaultValue={displayName} style={{ width: '90%',marginLeft:20 }} onSelect={this.selecHhandleChange} dropdownClassName={displayName?'':'warnBg'}>
                            {
                                this.state[stateKey].map((repy,i)=>{
                                    return <Option key={i} value={repy.value} name={paremKey}>{repy.displayName}</Option>
                                })
                            }
                        </Select>
            }
        }else{
            return <b className={w?"msg-cont break-all":"msg-cont"} style={{width:w}} title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
        }
    }
    //单月最高放款额度（元）修改
    monthLimitQuota_modify=()=>{
        let monthLimitQuota_after=$('.monthLimitQuota_after').val();
        if(!monthLimitQuota_after){
            alert('请输入金额！');
            return;
        }
        let checkData=cpCommonJs.opinitionObj(this.commonStore.checkData),
            merchantInfo=cpCommonJs.opinitionObj(checkData.merchantInfo),
            merchantNo=merchantInfo.merchantNo,
            that=this;
        let _parem={
            monthLimitQuota:monthLimitQuota_after,
            merchantNo:merchantNo
        }
        axios({
            method: 'POST',
            url:'/node/merchant/update/amount',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(_parem),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.props.searchHandle('RELOAD',true);
        })
    }
    render() {
        let identityInfo=cpCommonJs.opinitionObj(this.commonStore.checkData);
        let tempType=this.props.tempType;
        let productConfigs=cpCommonJs.opinitionObj(ProductConfig[tempType]);
        let productConfigMsgList=cpCommonJs.opinitionArray(productConfigs.msg);  //详情模板list
        let modifyIng=this.commonStore.modifyIng;
        let state_afterModifyData=cpCommonJs.opinitionObj(this.state.state_afterModifyData);
        
        return (
            <div className="auto-box relative">
                {
                    (productConfigMsgList&&productConfigMsgList.length>0)?productConfigMsgList.map((reps,j)=>{
                    let templateList=reps.templateKey;
                    let javaKey=reps.javaKey;
                    let withinKey=reps.withinKey;
                    let mark=reps.mark;
                    let tip=reps.tip;
                        return <div className="toggle-box mt5" key={j}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                        {reps.name}
                                        {tip?<span className="red tit-font ml10">{tip}</span>:''}
                                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                    </h2>
                                    <ul className="cp-info-ul mt5 bar pb20 pr20 noWaring"> 
                                        {
                                            templateList?templateList.map((repy,i)=>{
                                                let keyword=repy.keyword;
                                                let paremKey=repy.paremKey;
                                                let stateKey=repy.stateKey;
                                                let modification=repy.modification;
                                                let modifyType=repy.modifyType;
                                                let _obj={};
                                                let dataObj=cpCommonJs.opinitionObj(identityInfo[javaKey]);
                                                _obj=Object.assign({},dataObj);
                                                let withinKeyObj={};
                                                let displayName=commonJs.is_obj_exist(dataObj[keyword]);
                                                let w=repy.width;
                                                if(withinKey){
                                                    withinKeyObj=cpCommonJs.opinitionObj(dataObj[withinKey]);
                                                    _obj=Object.assign({},withinKeyObj);
                                                    displayName=commonJs.is_obj_exist(withinKeyObj[keyword]);
                                                }
                                                if(repy.cell){
                                                    displayName=repy.cell(displayName);
                                                }
                                                if(keyword=='monthLimitQuota' && commonJs.is_obj_exist(displayName)=='-'){  //单月最高放款额度（元） 无值时可以且仅可以修改一次。
                                                    return <li key={i} style={{width:w}}>
                                                                <p className="msg-tit">{repy.desc}</p>
                                                                <div>
                                                                    <input type="number" className="input left mr5 ml20 monthLimitQuota_after" placeholder='请输入' style={{width:'50%'}} onKeyPress={commonJs.handleKeyPress.bind(this,['e'])}/>
                                                                    <button className="btn-blue" onClick={this.monthLimitQuota_modify}>保存</button>
                                                                </div>  
                                                            </li>
                                                }
                                                return <li key={i} style={{width:w}}>
                                                            <p className="msg-tit">{repy.desc}</p>
                                                            {this.returnDom(modifyIng,modification,modifyType,repy,displayName,keyword,state_afterModifyData,w,paremKey,stateKey)}
                                                        </li>
                                            }):''
                                        }

                                    </ul>
                                </div>
                    }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                }
            </div>
    );
    }
};


export default CheckMsg;