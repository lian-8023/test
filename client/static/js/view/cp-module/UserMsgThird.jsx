// 用户信息-第三方
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import axios from '../../axios';
import qs from 'Qs';

@inject('allStore') @observer
class UserMsgThird extends React.Component {
    constructor(props){
        super(props);
        this.store=this.props.allStore.UserinfoStore;
        this.topBindNumberStore=this.props.allStore.TopBindNumberStore;  //顶部绑定（完成）数显示-通用 2A portal
        this.labelBoxStore=this.props.allStore.LabelBoxStore;  //2a portal labelBox组件store
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            bank_id:'',
            recognitionMap:{}
        }
    }   
    UNSAFE_componentWillReceiveProps(){
        this.resetModifyBank(this);
    }
    //银行卡list切换
    bankListChange=(e)=>{
        let _selected_id=$(e.target).find('option:selected').attr('value');
        this.setState({
            bank_id:_selected_id,
        })
    }
    //修改银行卡号
    modifyBank=(e)=>{
        let rowData=cpCommonJs.opinitionObj(this.labelBoxStore.rowData);
        let that=this;
        let $this=$(e.target);
        let _parent=$this.closest('.cp-info-ul');
        let _text=$this.text();
        if(_text=='修改'){
            $this.text('保存');
            let _thirdIdentityResponseOldDTO=cpCommonJs.opinitionObj(this.store.thirdIdentityResponseOldDTO);
            let _bankCardMap=cpCommonJs.opinitionObj(_thirdIdentityResponseOldDTO.bankCardMap);
            let bindNumberData=this.topBindNumberStore.bindNumberData;
            let collectionBankEnums=cpCommonJs.opinitionArray(bindNumberData.collectionBankEnums);  //银行名称代号-银行卡名称list-供修改银行卡用
            let bankName=_bankCardMap['银行名称']?_bankCardMap['银行名称']:'';
            $('.modification[data-type="银行卡号"]').val(_bankCardMap['银行卡号']?_bankCardMap['银行卡号']:'');
            $('.modification[data-type="银行预留手机号码"]').val(_bankCardMap['银行预留手机号码']?_bankCardMap['银行预留手机号码']:'');
            $('.bankIdList option').removeProp('selected');
            if(bankName){
                $('.bankIdList option[data-displayName='+bankName+']').prop('selected','selected');
                if(collectionBankEnums.length>0){
                    for(let i=0;i<collectionBankEnums.length;i++){
                        if(collectionBankEnums[i].displayName==bankName){
                            this.setState({
                                bank_id:collectionBankEnums[i].value
                            })
                        }
                    }
                }

            }else{
                $('.bankIdList option[data-id=0]').prop('selected','selected');
            }
            _parent.find('.modification').each(function() {
                let li=$(this).closest('li');
                li.find('.msg-cont').addClass('hidden');
                li.find('.modification').removeClass('hidden');
            })
        }else{   //保存
            let bank_card_number,bank_phone,result=true;
            let bank_id=this.state.bank_id;  //银行名称代号
            if(!bank_id){
                alert('请选择银行！');
                return;
            }
            _parent.find('.modification').each(function(){
                let type=$(this).attr('data-type');
                if(type=='银行卡号'){
                    bank_card_number=$(this).val();
                    if(!bank_card_number || bank_card_number.length<15 || bank_card_number.length>19 || isNaN(bank_card_number)){
                        alert('请输入正确的银行卡号！');
                        result=false;
                    }
                }else if(type=='银行预留手机号码'){
                    bank_phone=$(this).val();
                    if(bank_phone && bank_phone.replace(/\s/g,"") && !(/^1\d{10}$/.test(bank_phone))){
                        alert("请输入正确的手机号码！");
                        result =false;
                    }
                }
            })

            let order_no=rowData.orderNo;
            if(!order_no){
                alert('未获取到订单号！');
                return;
            }
            let product_no=rowData.cooperationFlag;
            if(!product_no){
                alert('未获取到产品号！');
                return;
            }
            if(!result){
                return;
            }
            $.ajax({
                type:'post',
                url:'/node/collection/updateBankInfo',
                async:true,
                data:{
                    order_no:order_no,
                    product_no:product_no,
                    bank_id:bank_id,
                    bank_card_number:bank_card_number,
                    bank_phone:bank_phone
                },
                dataType: "JSON",
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    } 
                    let _getData=res.data;
                    alert(_getData.message);
                    that.resetModifyBank(that);
                }
            })
        }
        
    }
    //还原银行卡修改地方
    resetModifyBank(that){
        $('.bankModifyBtn').text('修改');
        $('.msg-cont').removeClass('hidden');
        $('.modification').addClass('hidden');
        $('.bankIdList option').removeProp('selected');
        $('.bankIdList option[data-id=0]').prop('selected');
        $('input.modification').val('');
        that.setState({
            bank_id:'',
        })
    }
    //手动获取识别信息
    getRecognitionOcr=()=>{
        let userInfoDto=this.store.thirdIdentityResponseOldDTO;
        let personMap=cpCommonJs.opinitionObj(userInfoDto.personMap);  //个人信息 
        let nationalId=personMap['身份证号'];
        if(!nationalId){
            alert('未获取到身份证信息！');
            return;
        }
        let that=this;
        axios({
            method: 'get',
            url:'/node/search/recognize/ocr',
            params:{nationalId:nationalId}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    recognitionMap:{}
                })
                return;
            }
            that.setState({
                recognitionMap:cpCommonJs.opinitionArray(data.recognitionMap)
            })
        })
    }
    //获取征信手机号码
    getCreditPhone=()=>{
        let that=this;
        let userInfoDto=this.store.thirdIdentityResponseOldDTO;
        let personMap=cpCommonJs.opinitionObj(userInfoDto.personMap);  //个人信息 
        let nationalId=personMap['身份证号'];
        let name=personMap['姓名'];
        let parme={
            nationalId:nationalId,
            name:name
        };
        axios({
            method: 'POST',
            url:'/node/credit/query/phone',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            data: qs.stringify(parme),
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    creditPhones:[]
                })
                return;
            }
            let phones=cpCommonJs.opinitionArray(data.phones);
            if(phones.length<=0){
                that.setState({
                    creditPhones:[]
                })
                alert('暂未查询到数据！');
                return;
            }
            that.setState({
                creditPhones:cpCommonJs.opinitionArray(data.phones)
            })
        })
    }

    @action render() {
        let cooperationFlag=this.store.cooperationFlag;  //合作方   17C
        let {recognitionMap,creditPhones=[]}=this.state;
        let collectionNextData=cpCommonJs.opinitionObj(this.commonStore.collectionNextData);
        let collectionOverdueInfoDTOS=collectionNextData.collectionOverdueInfoDTOS;
        let collectionGrade='';
        if(collectionOverdueInfoDTOS && collectionOverdueInfoDTOS[0]){
            collectionGrade=collectionOverdueInfoDTOS[0].collectionGrade;
        }
        let stopDay=collectionNextData.stopDay;

        let userInfoDto=this.store.thirdIdentityResponseOldDTO;
        let specialKey=cpCommonJs.opinitionObj(userInfoDto.specialKey);  //用作判断作用的对象
        let flagKey=cpCommonJs.opinitionObj(userInfoDto.flagKey);  //用作判断作用的对象
        const loanMap=userInfoDto.loanMap?userInfoDto.loanMap:{};  //贷款信息
        loanMap['催收等级']=collectionGrade;
        loanMap['停留时间']=stopDay;
        if(stopDay==1){
            specialKey['停留时间']=true;
        }
        if(window.location.hash=='#/Reminder/reminder'){  //remander 详情银行卡号脱敏展示
            flagKey['银行卡号1']='isSecret';
        }
        if(window.location.hash=='#/Reminder/reminder' || window.location.hash=='#/Collection/collection'){  //collection 详情银行卡号脱敏展示
            flagKey['身份证号1']='isSecret';
        }
        const personMap=cpCommonJs.opinitionObj(userInfoDto.personMap);  //个人信息 
        const newPersonMap=Object.assign({}, personMap);
        newPersonMap['身份证号']=newPersonMap['身份证号']?newPersonMap['身份证号'].replace(/(.{0}).*(.{12})/, "$1****$2") : '-';

        const bankCardMap=userInfoDto.bankCardMap;  //银行卡信息
        const workMap=userInfoDto.workMap;  //工作信息
        const goodsMap=userInfoDto.goodsMap;  //商品信息
        const otherMap=userInfoDto.otherMap;  //其他信息

        let bindNumberData=this.topBindNumberStore.bindNumberData;
        let collectionBankEnums=cpCommonJs.opinitionArray(bindNumberData.collectionBankEnums);  //银行名称代号-银行卡名称list-供修改银行卡用

        const barObj={
            '贷款信息':loanMap,
            '个人信息':newPersonMap,
            '银行卡信息':bankCardMap,
            '工作信息':workMap,
            '商品信息':goodsMap,
            '其他信息':otherMap
        }
        const conten_b=(repy,specialKey,flagKey,values)=>{
            if(specialKey[repy]){
                return <b className="msg-cont elli red" title={commonJs.is_obj_exist(values[repy])}>{commonJs.is_obj_exist(values[repy])}</b>
            }
            else if(flagKey[repy+'1']=='isSecret'){
                var reg = /(.{0}).*(.{12})/;
                return <b className="msg-cont elli" title={commonJs.is_obj_exist(values[repy]).replace(reg, "$1****$2")}>{commonJs.is_obj_exist(values[repy]).replace(reg, "$1****$2")}</b>
            }
            else{
                return <b className="msg-cont elli" title={commonJs.is_obj_exist(values[repy])}>{commonJs.is_obj_exist(values[repy])}</b>
            }
        }
        return (
            <div className="auto-box pr5 relative">
                {
                    Object.keys(barObj).map((repy,i)=>{
                        let values=barObj[repy];
                        return <div className="toggle-box bar mt10" key={i}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                        {repy}
                                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                                    </h2>

                                    {/* IMEI展示 */}
                                    {
                                        $.isEmptyObject(barObj[repy])?
                                        "":
                                        <ul className="cp-info-ul pr20"> 
                                        {
                                            repy=="商品信息"?
                                                Object.keys(barObj[repy]).map((repy,i)=>{
                                                    if(repy=="IMEI" && repy!="addIMEI"){
                                                        let imeiData=values[repy];
                                                        if(imeiData){
                                                            imeiData=imeiData.split(",");
                                                        }
                                                        return <li key={i}>
                                                                    <div className="clearfix">
                                                                        <p className="msg-tit left mr10">{repy}</p>
                                                                        {/* 显示新增按钮 */}
                                                                        {
                                                                            (cpCommonJs.judgeIMEInumber(commonJs.is_obj_exist(values[repy])) && values["addIMEI"])?
                                                                            <a  data-action="showInput" id={'showInput'+i} className="btn-blue block left imeiBtn mr5" onClick={this.store.showAddBtn.bind(this)}>新增</a>
                                                                            :""
                                                                        }
                                                                        <a  className="btn-blue block left imeiBtn addImeiBtn hidden" id={'imeiBtn'+i} onClick={this.store.updateIMEI.bind(this)}>新增</a>
                                                                    </div>
                                                                    {/* 显示数据 */}
                                                                    {
                                                                        (imeiData && imeiData.length>0)?imeiData.map((imeiRepy,j)=>{
                                                                            if(imeiRepy&&imeiRepy.indexOf('（重复）')>0){
                                                                                return <p key={j} className="msg-cont imeiData" title={commonJs.is_obj_exist(imeiRepy)}>{commonJs.is_obj_exist(imeiRepy.replace("（重复）",""))}<b className="red">（重复）</b></p>
                                                                            }else if(imeiRepy){
                                                                                return <p key={j} className="msg-cont imeiData" title={commonJs.is_obj_exist(imeiRepy)}>{commonJs.is_obj_exist(imeiRepy)}</p>
                                                                            }
                                                                        }):<b className="msg-cont" title="-">-</b>
                                                                    }
                                                                    {/* 显示input框修改 */}
                                                                    {
                                                                        (cpCommonJs.judgeIMEInumber(commonJs.is_obj_exist(values[repy])) && values["addIMEI"])?
                                                                        <div className="addIMEI clearfix ml20">
                                                                            <input type="text" className="input IMEIinput left mr5 hidden" style={{"width":"60%"}} />
                                                                        </div>
                                                                        :""
                                                                    }
                                                                </li>
                                                    }
                                                }):""
                                    }





                                    {/* 正常数据展示 */}
                                    {
                                        Object.keys(barObj[repy]).map((repy,i)=>{
                                            if(repy=="addIMEI" || repy=="IMEI"){
                                                return '';
                                            }else{
                                                return <li key={i}>
                                                    <p className="msg-tit elli">{repy}</p>
                                                    {/* <b className={specialKey[repy] ? "msg-cont elli red":"msg-cont elli"} title={commonJs.is_obj_exist(values[repy])}>{commonJs.is_obj_exist(values[repy])}</b> */}
                                                    {conten_b(repy,specialKey,flagKey,values)}
                                                    {/* {
                                                        specialKey[repy]?
                                                        <b className={specialKey[repy]?"msg-cont elli red":'msg-cont elli'} title={commonJs.is_obj_exist(values[repy])}>{commonJs.is_obj_exist(values[repy])}</b>:
                                                        <b className="msg-cont elli" title={commonJs.is_obj_exist(values[repy]).replace(/^(\d{4})\d+(\d{4})$/, "$1****$2")}>{commonJs.is_obj_exist(values[repy]).replace(/^(\d{4})\d+(\d{4})$/, "$1****$2")}</b>
                                                    } */}
                                                    {/* <b className={specialKey[repy]?"msg-cont elli red":'msg-cont elli'} title={commonJs.is_obj_exist(values[repy])}>{commonJs.is_obj_exist(values[repy])}</b> */}
                                                    {
                                                        flagKey[repy]=='input'?
                                                        <input className='input left ml20 hidden modification' id={'modificationInp'+i} data-type={repy} type="number" />:''
                                                    }
                                                    {
                                                        flagKey[repy]=='select'?
                                                        <div>
                                                            <select name="" id="bankIdList" className="left select-gray ml20 mr5 hidden modification bankIdList" style={{'width':'60%'}} onChange={this.bankListChange}>
                                                            <option value="" data-id='0' hidden>请选择</option>
                                                            {
                                                                collectionBankEnums.length>0?collectionBankEnums.map((repy,i)=>{
                                                                        return <option key={i} value={repy.value}  name={repy.name} data-displayName={repy.displayName}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                                                }):<option value=""></option>
                                                            }
                                                            </select>
                                                            <button className="btn-blue left bankModifyBtn" onClick={this.modifyBank} id='bankModifyBtn' style={{'padding':'0 5px'}}>修改</button>
                                                        </div>:''
                                                    }
                                                </li>
                                            }
                                        })
                                    }
                                </ul>
                            }
                        </div>
                    })
                }

                <div className="toggle-box bar mt10">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                    识别信息
                        <a className="btn-blue ml20 inline-block" id='getRecognitionOcr' onClick={this.getRecognitionOcr}>在线识别</a>
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                    </h2>
                    {
                        Object.keys(recognitionMap).length>0?
                        <ul className="cp-info-ul pb20 pr20"> 
                        {
                            Object.keys(recognitionMap).map((repy,i)=>{
                                return <li key={i}>
                                            <p className="msg-tit">{commonJs.is_obj_exist(repy)}</p>
                                            <b className="msg-cont" title={commonJs.is_obj_exist(recognitionMap[repy])}>{commonJs.is_obj_exist(recognitionMap[repy])}</b>
                                        </li>
                            })
                        }
                    </ul>:''
                    }
                </div>

                {/* 17C 征信报告电话号码展示 */}
                {
                    cooperationFlag=='17C' ? 
                    <div className="toggle-box bar mt10">
                        <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                        征信报告电话号码
                            <a className="btn-blue ml20 inline-block" id='getCreditPhone' onClick={this.getCreditPhone}>查询</a>
                            <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        </h2>
                        {
                            creditPhones.length>0?
                            <ul className="cp-info-ul pb20 pr20"> 
                            {
                                creditPhones.map((repy,i)=>{
                                    return <li key={i}>
                                                <p className="msg-tit">上次修改日期 {commonJs.is_obj_exist(repy.lastRecordDate)}</p>
                                                <b className="msg-cont" title={commonJs.is_obj_exist(repy.phoneNo)}>{commonJs.is_obj_exist(repy.phoneNo)}</b>
                                            </li>
                                })
                            }
                            </ul>:''
                        }
                    </div>:''
                }
                

            </div>
        );
    }
};
export default UserMsgThird;