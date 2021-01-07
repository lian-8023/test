// 挂帐入账
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import { Modal, Row, Col,DatePicker, Pagination,Button } from 'antd';
const { MonthPicker} = DatePicker;
import FileUpload from 'react-fileupload';
import Channel from '../cp-module/channel'; //选择合作方select
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";
import { Select } from 'antd';
const { Option } = Select;
import axios from '../../axios';
import qs from 'Qs';

@inject('allStore') @observer
class CooperationAccounting extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            productNo:'',
            searchResult:[],  //搜索结果列表
            pageNumber:1,
            pageSize:10,
            tickModalVisible:false,   //我要挂帐弹窗是否显示
            inAccountModalVisible:false, //确认入账弹窗是否显示
            defeatedVisible:false,  //查看失败原因
            loading:false,
            statusEnums:[],//挂帐状态
            typeEnums:[],  //挂帐类型
            typeFor2FEnums:[],//挂账类型2F
            newTypeEnums:[],
            account_url:'single',
            inAccounTtime:null,
            tickTime:null,
            resetFuzzyVal:false,  //是否清空模糊查询框的值
            showDownloadResult:false,  //是否显示 下载当前查询结果 按钮
            serialNumber:'',//流水号
            batchAmount:'',
            popupsValue:'',
        };
    }
    componentDidMount(){
        this.init();
    }
    // 显示弹窗
    shwoModal=(showKey)=>{
        this.setState({
            [showKey]:true
        })
    }
    //取消挂帐弹窗
    tickModalCancel = () => {
        $('.ant-modal-body .amountLoanNumnber').val('');
        $('.ant-modal-body .amount').val('');
        $('.ant-modal-body .withOutReset option').removeProp('selected');
        $('.ant-modal-body .withOutReset option[data-show="no"]').prop('selected',true);
        this.setState({
            tickModalVisible: false,
            tickTime:null,
            inAccounTtime:null,
            account_url:'single',
            loanNumber_account:null,
            batchAmount:'',
            upAcountType:undefined
        })
    }
    // 单笔确认入账按钮
    showInAccountModal = (index) => {
        let searchResult=this.state.searchResult,
            currentData=searchResult[index];
        if(currentData.slefOrCor==1){  //0是自主挂帐，1是合作方推送过来到数据
            this.setState({
                inAccountTypeList:[  //入账类型
                    {
                    value:'deposit',
                    displayName:'保证金入账'
                    },{
                    value:'offline',
                    displayName:'线下转账'
                    },{
                        value:'poolCredit',
                        displayName:'资金池转入'
                    }
                ]
            })
        }else{  
            this.setState({
                inAccountTypeList:[  //入账类型
                    {
                    value:'deposit',
                    displayName:'保证金入账'
                    },{
                    value:'offline',
                    displayName:'线下转账'
                    },{
                    value:'paidMtbc',
                    displayName:'结清小雨点-未收款'
                    },{
                        value:'paidMtbc-no',
                        displayName:'结清小雨点-未收款(未确认)'
                    },{
                        value:'poolCredit',
                        displayName:'资金池转入'
                    }
                ]
            })
        }
        this.setState({
            currentData: currentData,
            inAccountModalVisible: true,
            inAccountModalType:'single',
            serialNumber:currentData.serialNumber?currentData.serialNumber:''
        });
    }
    //入账确认
    inAccountModalOk = (e) => {
        let that=this;
        let parems={};
        let _url='';
        let inAccounTtime=this.state.inAccounTtime;
        let type=this.state.inAccountType;
        if(!type){
            alert('请选择入账渠道！');
            return;
        }
        let uploadResDTOs=this.state.uploadResDTOs;
        let ensureFileId='',ensureContent='';
        let serialNumber=$(".serialNumber").val();  //流水号
        // let creditedNumber=$(".creditedNumber option:selected").attr('value');  //收款账号
        if(this.state.inAccountModalType=='batch'){
            // 批量入账
            let batchNo=$(".searchMount_batchNo").val();
            let productNo=$('.inAcountProduct .chaenel option:selected').val();
            if(!productNo){
                alert('请选择合作方！');
                return;
            }
            let amount=this.state.batchAmount;
            if(!amount){
                alert('请选确定本次入账金额！');
                return;
            }
            if(!inAccounTtime){
                alert('请选择入账时间！');
                return;
            }
            parems={
                batchNo,
                productNo,
                type,
                amount,
                accountAt:inAccounTtime.format('YYYY-MM-DD 00:00:00') //入账时间;
            };
            _url='/node/account/batEnsure';
            if(batchNo&&batchNo.replace(/\s/g,'')){
                parems.batchNo=batchNo.replace(/\s/g,'');
            }
        }else{
            // 单比确认入账
            let currentData=cpCommonJs.opinitionObj(this.state.currentData);  //当前操作条数据
            let productNo = currentData.productNo;
            _url="/node/account/ensure";
            if(!inAccounTtime){
                alert('请选择入账时间！');
                return;
            }
            switch (productNo) {
                case '2F':
                    let creditedNumber = $('.creditedNumber').val();
                    if(!creditedNumber){alert('请填写收款账号！');return '';};
                    parems={
                        productNo:currentData.productNo,
                        quotaNo:currentData.loanNumber,
                        accountNumber:currentData.accountNumber,
                        slefOrCor:currentData.slefOrCor,
                        amount:currentData.amount,
                        creditedNumber:creditedNumber,
                        name:currentData.userName,
                        accountAt:inAccounTtime.format('YYYY-MM-DD')  //入账时间
                    }
                    break;
                default:
                    parems={
                        productNo:currentData.productNo,
                        loanNumber:currentData.loanNumber,
                        accountNumber:currentData.accountNumber,
                        slefOrCor:currentData.slefOrCor,
                        amount:currentData.amount,
                        name:currentData.userName,
                        accountAt:inAccounTtime.format('YYYY-MM-DD')  //入账时间
                    }
                    break;
            }
           
            if(this.state.showSerialNo){  //保证金入账类型选择‘保证金入账’ 和 ‘小雨点结清-未收款’时，隐藏实际到账日期选择，流水号，收款账号，且不必填。
                if(!serialNumber){
                    alert('请输入流水号！');
                    return;
                }
                /* if(!creditedNumber){
                    alert('请选择收款账号！');
                    return;
                } */
                parems.serialNumber=serialNumber;
                // parems.creditedNumber=creditedNumber;
            }
            if(type){
                parems.type=type;
            }
        }
        if(type=='paidMtbc'){
            if(!uploadResDTOs || uploadResDTOs.length<=0){
                alert('请先上传文件！');
                return;
            }else{
                let uploadResDTOs_ary=[];
                for(let i=0;i<uploadResDTOs.length;i++){
                    uploadResDTOs_ary.push(uploadResDTOs[i].fileId);
                }
                ensureFileId=uploadResDTOs_ary.join(',');
            }
            ensureContent=$('.ensureContent').val();
            parems.ensureFileId=ensureFileId;
            if(!ensureContent && !ensureContent.replace(/\s/g,'')){
                alert('请填写描述文字！');
                return;
            }
            parems.ensureContent=ensureContent;
        }
        $.ajax({
            type:"post", 
            url:_url, 
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parems)},
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _data=res.data;
                that.searchCommonFn(that.state.pageNumber,that.state.pageSize);
                that.inAccountModalCancel();
                alert(_data.message);
           }
       })
    }
    inAccountModalCancel = (e) => {
        this.resetAccountOtherModal();
        this.setState({
            inAccountModalVisible: false,
            inAccounTtime:null,
            batchAmount:null,
            inAccountType:null,
            uploadResDTOs:[],
            currentData:{}
        });
    }
    //失败原因弹窗
    defeatedModalCancel=(e)=>{
        this.setState({                                                                      
            defeatedVisible: false,
            accountOtherModal:false,
            specialModalVisible:false,
            cancleModalVisible:false
        });
        this.resetAccountOtherModal();
    }
    fuzzCommonFn(_obj,type){
        this.setState({
            resetFuzzyVal:false
        })
        let _parem={};
        if(_obj.phone){
            _parem.phone=_obj.phone
        }
        if(_obj.cooperationFlag){
            _parem.cooperationFlag=_obj.cooperationFlag
        }
        if(_obj.loanNumber){
            _parem.loanNumber=_obj.loanNumber
        }
        _parem.queueReloadEnum="SEARCH";
        $(".check-search input").val("");
        $(".chaenel option").removeProp("selected");
        $(".chaenel option[data-show='no']").prop("selected","selected");
        $("."+type+" input").val(type=="fuzzyLoanNumber"?commonJs.is_obj_exist(_obj.loanNumber):commonJs.is_obj_exist(_obj.phone));
    }
    // 搜索条件处-模糊查询 click
    fuzzyListClick(_obj,type){
        this.fuzzCommonFn(_obj,type);
        this.searchCommonFn(1,this.state.pageSize);
    }
    //
    fuzzyListClick_modal(){
        this.fuzzCommonFn(_obj,type);
    }
    //初始化数据
    init(){
        let _that=this;
        $.ajax({
             type:"get", 
             url:"/node/account/init", 
             async:true,
             dataType: "JSON", 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    _that.setState({
                        statusEnums:[],
                        typeEnums:[],
                        newTypeEnums:[],
                        typeFor2FEnums:[]
                    })
                     return;
                 }
                 var _data=res.data;
                 _that.setState({
                    statusEnums:_data.statusEnums,
                    typeEnums:_data.typeEnums,
                    newTypeEnums:_data.typeEnums,
                    typeFor2FEnums:_data.typeFor2FEnums,
                 })
            }
        })
    }
    //获取条件
    getConditions(){
        let req_data={};
        let productNo=$(".check-search .chaenel option:selected").val(),
        accountStatus=$(".check-search .accountStatus option:selected").attr('value'),
        ensureType=$(".check-search .ensureType option:selected").attr('value'),
        // orderNo=$(".check-search .orderNo").val(), 
        loanNumber=$(".check-search .loanNumber").val(),  //合同号
        userName=$(".check-search .userName").val(),  //合同号
        amount=$(".check-search .amount").val(),
        accountNumber=$(".check-search .accountNumber").val(),
        batchNo=$(".check-search .batchNo").val();
        if(productNo&&productNo.replace(/\s/g,""))req_data.productNo=productNo.replace(/\s/g,""); 
        if(accountStatus&&accountStatus.replace(/\s/g,""))req_data.accountStatus=accountStatus.replace(/\s/g,"");
        if(ensureType&&ensureType.replace(/\s/g,""))req_data.ensureType=ensureType.replace(/\s/g,"");
        if(userName&&userName.replace(/\s/g,""))req_data.userName=userName.replace(/\s/g,"");
        if(amount&&amount.replace(/\s/g,""))req_data.amount=amount.replace(/\s/g,"");
        if(accountNumber&&accountNumber.replace(/\s/g,""))req_data.accountNumber=accountNumber.replace(/\s/g,"");
        if(batchNo&&batchNo.replace(/\s/g,""))req_data.batchNo=batchNo.replace(/\s/g,"");
        if(productNo == '2F'){
            if(loanNumber&&loanNumber.replace(/\s/g,""))req_data.quotaNo = loanNumber.replace(/\s/g,"");
        }else{
            if(loanNumber&&loanNumber.replace(/\s/g,""))req_data.loanNumber=loanNumber.replace(/\s/g,"");
        }
        req_data.pageNumber=this.state.pageNumber;
        req_data.pagesize=this.state.pageSize;
        return req_data;
    }
    //搜索
    searchCommonFn(pageNumber,pageSize){
        let _that=this;
        let req_data=this.getConditions();
        req_data.pageNumber=pageNumber;
        req_data.pagesize=pageSize;
        $.ajax({
             type:"post", 
             url:"/node/account/search", 
             async:true,
             dataType: "JSON", 
             data:{josnParam:JSON.stringify(req_data)}, 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    _that.setState({
                        searchResult:[],
                        totalSize:0,
                        pageNumber:1,
                        showDownloadResult:false
                    })
                     return;
                 }
                 var _data=res.data;
                 _that.setState({
                    searchResult:_data.chargeAccountRecordInfoDTOS,
                    totalSize:_data.totalSize,
                    pageNumber:_data.pageNum,
                    showDownloadResult:true
                 })
            }
        })
    }

    //改变页码
    pageChange=(pageNumber)=>{
        this.setState({
            pageNumber:pageNumber
        },()=>{
            this.searchCommonFn(pageNumber,this.state.pageSize);
        })
    }
    //快速跳转
    onShowSizeChange=(current, pageSize)=>{
        this.setState({
            pageSize:pageSize
        },()=>{
            this.searchCommonFn(current,pageSize);
        })
    }
    //我要挂帐时间选择
    tickTimeChange=(date, dateString)=>{
        this.setState({
            tickTime:date
        })
    }
    inAccounTtimeChange=(date, dateString)=>{
        this.setState({
            inAccounTtime:date
        })
    }
    //查询每月快付通结算金额-时间
    amountDateChange=(date, dateString)=>{
        this.setState({
            amountDate:date
        })
    }
    //查看失败原因
    faildResion(i){
        let data=cpCommonJs.opinitionArray(this.state.searchResult)[i];
        this.setState({
            faildResion:data,
            defeatedVisible:true
        })
    }
    //取消挂帐
    cancleAccount(index){
        let that=this;
        let searchResult=this.state.searchResult,
            currentData=cpCommonJs.opinitionObj(searchResult[index]);
        let params = {};
        if(currentData.productNo == '2F'){
            params = {
                productNo:currentData.productNo,
                accountNumber:currentData.accountNumber,
                quotaNo:currentData.quotaNo
            }
        }else{
            params = {
                productNo:currentData.productNo,
                accountNumber:currentData.accountNumber,
            }
        }
        $.ajax({
            type:"post", 
            url:'/node/account/cancel', 
            async:true,
            dataType: "JSON", 
            data:params, 
            success:function(res){
                var _data=res.data;
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                alert(_data.message);
                that.searchCommonFn(that.state.pageNumber,that.state.pageSize);
           }
       })
    }
    //单笔或者批量挂帐
    accountType(_url,e){
        this.setState({
            account_url:_url,   //单比挂帐或者批量挂帐请求地址
            upAcountType:undefined
        })
    }
    //获取挂帐条件
    getAccountCondition(){
        let parem={};
        let type=this.state.upAcountType,
        repaymentAt=this.state.tickTime,
        account_url=this.state.account_url,
        loanNumber=$('.amountLoanNumnber').val(),
        productNo=$('.upAcount .chaenel option:selected').attr('value');
        
        if(!type){alert('请选择挂帐类型！');return '';}
        if(!repaymentAt){alert('请选择挂帐日期！');return '';}
        if(!productNo){alert('请填写产品号！');return '';};
        switch (productNo) {
            case '2F':
                let amount = $('#amount2').val();
                let creditedNumber = $('.creditedNumber').val();
                if(!creditedNumber){alert('请填写收款账号！');return '';};
                if(!loanNumber||!loanNumber.replace(/\s/g,"")){alert('请填写授信号！');return '';}
                if(type=="WITHOUT_SPECIFIELD_INSTALLMENT_REPAYMENT"&&amount==''){alert('请填写挂账金额:');return '';}
                let quotaNo = loanNumber;
                parem={
                    productNo:productNo.replace(/\s/g,""),
                    // typeEnum:type,
                    typeEnumFor2F:type,
                    repaymentAt:repaymentAt.format('YYYY-MM-DD'),
                    creditedNumber:creditedNumber.replace(/\s/g,""),
                    quotaNo:quotaNo.replace(/\s/g,""),
                    amount:amount
                };
                break;
            default:
                    if(!loanNumber||!loanNumber.replace(/\s/g,"")){alert('请填写合同号！');return '';}
                    parem={
                        typeEnum:type,
                        repaymentAt:repaymentAt.format('YYYY-MM-DD'),
                        loanNumber:loanNumber.replace(/\s/g,""),
                        productNo:productNo.replace(/\s/g,""),
                    };
                break;
        }
        if(this.state.popupsValue=='30H'||this.state.popupsValue=='34H'||this.state.popupsValue=='39H'){
            let  principal = $('#principal').val();
            parem.principal = principal;
        }
        return parem;
    }
    //确认挂帐
    sureAccount=()=>{
        let _that=this;
        let _url=this.state.account_url;
        let _parem={};
        if(_url=='single'){
            _parem=this.getAccountCondition();
            if(!_parem){
                return;
            }
            let amount=$('.ant-modal-body .amount').val();
            if(_parem.typeEnum &&(_parem.typeEnum=='WITHOUT_SPECIFIELD_INSTALLMENT_REPAYMENT'|| _parem.typeEnum=='SPECIFIELD_INSTALLMENT_REPAYMENT')){
                if(!amount||!amount.replace(/\s/g,"")){
                    alert('请填写正确的挂帐金额！');
                    return;
                }
            }
            if(amount&&amount.replace(/\s/g,""))_parem.amount=amount.replace(/\s/g,"");
        }
        $.ajax({
            type:"post", 
            url:'/node/account/'+_url, 
            async:true,
            dataType: "JSON", 
            data:_parem, 
            success:function(res){
                var _data=res.data;
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                alert(_data.message);
                _that.tickModalCancel();
            }
        })
    }
    // 上传成功
    _handleUploadSuccess(obj) {
        let _data=cpCommonJs.opinitionObj(obj.data);
        alert(_data.message);
    }
    // 上传失败
    _handleUploadFailed(err) {
        let _data=err.data?err.data:{};
        if(typeof(_data.resultStatus)!="undefined" && _data.resultStatus==1){
            alert(_data.resultMessage?_data.resultMessage:"失败");
            return;
        }
        if(typeof(_data.executed)!="undefined" && !_data.executed){
            alert(_data.message?_data.message:"失败");
        }
    }
    _checkUploadImg(files, mill) {
        let canUpload = true
        let fileLength=files.length;
        if(fileLength>1){
            alert('只能上传单个文件！');
            canUpload=false;
        }
        let fileName=files[0].name;
        let accept=fileName.substring(fileName.lastIndexOf(".")+1,fileName.length);
        if(accept!='excel'&&accept!='xlsx'){
            alert('只能上传excel或者xlsx文件！');
            canUpload=false;
        }
        return canUpload
    }

    // 上传成功--入账
    _handleUploadSuccess2(obj) {
        let _data=cpCommonJs.opinitionObj(obj.data);
        alert(_data.message);
        this.setState({
            uploadResDTOs:cpCommonJs.opinitionArray(_data.uploadResDTOs)
        })
    }
    // 上传失败--入账
    _handleUploadFailed2(err) {
        let _data=err.data?err.data:{};
        if(typeof(_data.resultStatus)!="undefined" && _data.resultStatus==1){
            alert(_data.resultMessage?_data.resultMessage:"失败");
            return;
        }
        if(typeof(_data.executed)!="undefined" && !_data.executed){
            alert(_data.message?_data.message:"失败");
        }
    }
    _checkUploadImg2(files, mill) {
        let canUpload = true
        let fileName=files[0].name;
        let accept=fileName.substring(fileName.lastIndexOf(".")+1,fileName.length);
        if(accept.toLowerCase()!='jpg'&&accept.toLowerCase()!='jpeg'&&accept.toLowerCase()!='png'&&accept.toLowerCase()!='BMP'){
            alert('只支持上传图片文件！');
            canUpload=false;
        }
        if(files.length>1){
            for(let i=0;i<files.length;i++){
                fileName=files[i].name;
                accept=fileName.substring(fileName.lastIndexOf(".")+1,fileName.length);
                if(accept.toLowerCase()!='jpg'&&accept.toLowerCase()!='jpeg'&&accept.toLowerCase()!='png'&&accept.toLowerCase()!='BMP'){
                    alert('只支持上传图片文件！');
                    canUpload=false;
                    break;
                }
            }
        }
        return canUpload
    }
    // 查询每月快付通结算金额-lyf
    searchSettleAmount=()=>{
        let that=this;
        let _amountDate=this.state.amountDate;
        if(!_amountDate){
            alert('请选择时间');
            return;
        }
        $.ajax({
             type:"get", 
             url:"/node/account/settle/amount", 
             async:true,
             data:{
                 date:_amountDate.format('YYYYMM')
             },
             dataType: "JSON", 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        settleAmount:''
                    })
                     return;
                 }
                 var _data=res.data;
                 that.setState({
                    settleAmount:_data.totalAmount
                 })
            }
        })
    }
    //获取挂帐金额
    getAccountMoney=()=>{
        let that=this;
        let _parem=this.getAccountCondition();
        let installmentNumberList=this.state.installmentNumberList;
        let type=this.state.upAcountType;
        if(!_parem){
            return;
        }
        if(type&&(type=='WITHOUT_SPECIFIELD_INSTALLMENT_REPAYMENT'||type=='SPECIFIELD_INSTALLMENT_REPAYMENT')){
            if(!installmentNumberList){
                alert('请选择期数！');
                return;
            }
            _parem.installmentNumberList=installmentNumberList;
        }
        $.ajax({
            type:"post", 
            url:"/node/account/query/amount", 
            async:true,
            data:{josnParam:JSON.stringify(_parem)},
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                   $('.ant-modal-body .amount').val('');
                    return;
                }
                var _data=res.data;
                let totalAmount=_data.totalAmount?_data.totalAmount:'';
                $('.ant-modal-body .amount').val(totalAmount);
           }
       })
    }
    //批量入账
    batchInAccount=()=>{
        this.setState({
            inAccountModalVisible:true,
            inAccountModalType:'batch',  //批量入账
            inAccountTypeList:[  //入账类型
                {
                value:'deposit',
                displayName:'保证金入账'
                },{
                value:'offline',
                displayName:'线下转账'
                },{
                value:'paidMtbc',
                displayName:'结清小雨点-未收款'
                },{
                    value:'poolCredit',
                    displayName:'资金池转入'
                }
            ]
        })
    }
    // 取消入账
    cancleInAccount=()=>{
        this.setState({cancleModalVisible:true})
    }
    //批量入帐总金额查询
    searchMount=()=>{
        let batchNo=$('.searchMount_batchNo').val();
        if(!batchNo){
            alert('请输入入账批次号查询入账金额！');
            return;
        }
        let that=this;
        $.ajax({
            type:"post", 
            url:"/node/account/batEnsure/batchNo", 
            async:true,
            data:{batchNo:batchNo},
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    that.setState({
                        batchAmount:''
                    })
                    return;
                }
                var _data=res.data;
                that.setState({
                    batchAmount:_data.totalAmount?_data.totalAmount:''
                })
           }
       })
    }
    //我要挂帐 挂帐类型
    upAcountType=(_val)=>{
        this.setState({
            upAcountType:_val
        })
    }
    //
    installmentNumberListHandle=(value)=>{
        this.setState({
            installmentNumberList:value
        })
    }
    inAccountTypeChange=(value)=>{

        if(value=='deposit' || value=='paidMtbc'|| value=='paidMtbc-no'){  //保证金入账类型选择‘保证金入账’ 和 ‘小雨点结清-未收款’时，隐藏实际到账日期选择，流水号，收款账号，且不必填。
            this.setState({
                showSerialNo:false
            })
        }else{
            this.setState({
                showSerialNo:true
            });
        }
        this.setState({
            inAccountType:value
        })
    }
    updateFileOptions(_url,_accept,beforeUpload,uploadSuccess,uploadFail){
        return {
            baseUrl: _url,
            multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
            fileFieldName:"ws",
            numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
            chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
            wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
            beforeUpload: this[beforeUpload].bind(this),  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
            uploadSuccess: this[uploadSuccess].bind(this),  //上传成功后执行的回调（针对AJAX而言）
            uploadFail: this[uploadFail].bind(this),  //上传失败后执行的回调（针对AJAX而言）
            uploadError: this[uploadFail].bind(this)  //上传错误后执行的回调（针对AJAX而言）
        }
    }
    //其他款项登记
    accountOtherOk=()=>{
        let serialNumber=$('.serialNumber_other').val();
        if(!serialNumber){
            alert('请输入流水号！');
            return;
        }
        /* let creditedNumber=$('.creditedNumber_other option:selected').attr('value');
        if(!creditedNumber){
            alert('请选择收款账号！');
            return;
        } */
        let creditedType=$('.creditedType option:selected').attr('value');
        if(!creditedType){
            alert('请选择用途！');
            return;
        }
        let note=$('.note').val();
        if(!note){
            alert('请填写备注！');
            return;
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/account/other/enrty',
            data:{josnParam:JSON.stringify({
                serialNumber,
                // creditedNumber,
                creditedType,
                note,
            })}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                return;
            }
            alert(data.message);
            that.resetAccountOtherModal();
            that.setState({
                accountOtherModal:false
            })
        })
    }
    //重置其他款项登记弹窗信息
    resetAccountOtherModal=()=>{
        $('.serialNumber_other,.note,.searchMount_batchNo,.serialNumber,.cle_loanNumber,.cle_amount,.cle_comment').val('');
        $('.creditedType option').removeProp('selected');
        $('.creditedType option[data-show="hide"]').prop('selected',true);
       /*  $('.creditedNumber_other option').removeProp('selected');
        $('.creditedNumber_other option[data-show="hide"]').prop('selected',true); */
        // $('.cle_showType option').removeProp('selected');
        // $('.cle_showType option[data-show="hide"]').prop('selected',true);
        $('.inAcountProduct option').removeProp('selected');
        $('.inAcountProduct option[data-show="no"]').prop('selected',true);
    }

    // 取消入帐金额查询
    celMoneyCheck=()=>{
        let loanNumber=$(".cle_loanNumber").val();
        if(!loanNumber.replace(/^\s+|\s+$/g, '')){
            alert('请输入要查询的合同号！');
            return;
        }
        let that=this;
        axios({
            method: 'get',
            url:'/node/account/cancel/ensure/money',
            params:{loanNumber:loanNumber}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                $('.cle_amount').val('暂未查到相关数据...');
                return;
            }
            $('.cle_amount').val(data.totalAmount).removeAttr('disabled');
        })
    }
    // 确认取消
    cancleModalOk=()=>{
        let loanNumber=$(".cle_loanNumber").val();
        let amount=$(".cle_amount").val();
        let showType=$(".cle_showType option:selected").attr('value');
        let _comment=$(".cle_comment").val();
        let that=this;
        let _parem={};
        _parem.showType=showType;
        if(!loanNumber){
            alert('请先输入合同号获取取消入账金额！');
            return;
        }
        _parem.loanNumber=loanNumber.replace(/^\s+|\s+$/g, '');
        if(!amount){
            alert('请先获取取消入账金额！');
            return;
        }
        _parem.amount=amount.replace(/^\s+|\s+$/g, '');
        if(_comment){
            _parem.comment=_comment;
        }
        axios({
            method: 'POST',
            url:'/node/account/cancel/ensure',
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
            that.defeatedModalCancel();
        })

    }
    render() {
        let {statusEnums,typeEnums,newTypeEnums,account_url,inAccountModalType,batchAmount,upAcountType=null,uploadResDTOs=[],showSerialNo,productNo,typeFor2FEnums,inAccountTypeList=[]}=this.state;
        let uploadOptions=this.updateFileOptions('/cpQueue/account/batch','excel,xlsx','_checkUploadImg','_handleUploadSuccess','_handleUploadFailed');
        let uploadOptions2=this.updateFileOptions('/cpQueue/file/upload','jpg,jpeg,png,BMP','_checkUploadImg2','_handleUploadSuccess2','_handleUploadFailed2');
        let uploadOptions3=this.updateFileOptions('/cpQueue/account/ensure/settle','excel,xlsx','_checkUploadImg','_handleUploadSuccess','_handleUploadFailed');
        let loanNumberText = productNo&&productNo=='2F'?'授信号':'合同号';
        const tableConfig = [
            {title:'产品号',keyWord:'productNo'},
            {title:'姓名',keyWord:'userName'},
            {title:'金额',keyWord:'amount'},
            {title:'挂账类型',keyWord:'slefOrCorStr'},
            {title:'挂账时间',keyWord:'accountTime'},
            {title:'确认入帐时间',keyWord:'ensureTime'},
            {title:'合同号',keyWord:'loanNumber'},
            {title:'授信号',keyWord:'quotaNo'},
            {title:'挂账号',keyWord:'accountNumber'},
            {title:'批次号',keyWord:'batchNo'},
            {title:'挂账状态',keyWord:'accountStatusStr'},
            {title:'入账类型',keyWord:'ensureType',cell:function(keyword){
                switch(keyword){
                    case 'deposit':
                        return '保证金入账';
                    case 'offline':
                        return '线下转账';
                    case 'paidMtbc':
                        return '结清小雨点-未收款';
                    case 'paidMtbc-no':
                        return '结清小雨点-未收款(未确认)';
                    default:
                        return '-';
                }
            }},
            {title:'操作时间',keyWord:'updatedAt'},
            {title:'操作',keyWord:'oprate'},
        ];
        const children = [];
        for (let i = 1; i < 37; i++) {
        children.push(<Option key={i}>{i}</Option>);
        }
        return (
            <div  className="content" id="content">
                {/* 搜索条件 */}
                <div className="bar pt5 pb5 clearfix">
                    <button className="right mr10 btn-blue" id='showSpecialModal' onClick={this.shwoModal.bind(this,'specialModalVisible')}>特殊结清处理</button>
                    <button className="right mr10 btn-blue" id='accountOtherModal' onClick={this.shwoModal.bind(this,'accountOtherModal')}>其他款项登记</button>
                    <button className="right mr10 btn-blue block" id='cancleInAccount' onClick={this.cancleInAccount}>取消入账</button>
                    <button className="right mr10 btn-blue block" id='batchInAccount' onClick={this.batchInAccount}>批量入账</button>
                    <button className="right mr10 btn-blue" id='showTickModal' onClick={this.shwoModal.bind(this,'tickModalVisible')}>我要挂帐</button>
                </div>
                <div data-isresetdiv="yes" className="bar check-search clearfix mt10">
                    <Channel onChange={(e)=>{this.setState({productNo:e.value})}} />  {/* 合作方 */}
                    <select name="" id="accountStatus" className='select-gray left mr10 accountStatus'>
                        <option value="" hidden data-show='no'>请选择挂帐状态</option>
                        <option value="">请选择</option>
                        {
                            statusEnums.length>0?statusEnums.map((repy,i)=>{
                                return <option key={i} value={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                            }):<option value=""></option>
                        }
                    </select>
                    <select name="" id="ensureType" className='select-gray left mr10 ensureType'>
                        <option value="" hidden data-show='no'>请选择入账类型</option>
                        <option value="">请选择</option>
                        <option value="deposit">保证金入账</option>
                        <option value="offline">线下转账</option>
                        <option value="paidMtbc">结清小雨点-未收款</option>
                        <option value="paidMtbc-no">结清小雨点-未收款(未确认)</option>
                    </select>
                    <input type="text" name="" placeholder={loanNumberText} className="input left mr10 loanNumber" id='loanNumber' />
                    <input type="text" name="" placeholder="姓名" className="input left mr10 userName" id='userName' />
                    <input type="number" name="" placeholder="金额" className="input left mr10 amount" id='amount' />
                    <input type="text" name="" placeholder="挂账号" className="input left mr10 accountNumber" id='accountNumber' />
                    <input type="text" name="" placeholder="批次号" className="input left mr10 batchNo" id='batchNo' />   
                    <button className="left reset mr10" onClick={commonJs.resetCondition.bind(this,this)} id='reset'>重置</button>
                    <button className="left mr10 search-btn" onClick={this.searchCommonFn.bind(this,1,this.state.pageSize)} id='searchBtn'>搜索</button>
                    <a className={this.state.showDownloadResult?"left btn-blue block":"hidden"} id='showDownloadResult' style={{'height':'30px','lineHeight':'30px'}} href={'/cpQueue/account/download/result?'+commonJs.toHrefParams(this.getConditions())}>下载当前查询结果</a>
                </div>
                {/* 搜索条件 end */}
                <div className="bar mt10 pl10 pt10 pb10">
                    <div className="left mr10" id='amountDate'>
                        {/* <DatePicker onChange={this.amountDateChange} format={'YYYY-MM-DD'} value={this.state.amountDate} /> */}
                        <MonthPicker onChange={this.amountDateChange} value={this.state.amountDate} placeholder="请选择月份" />
                    </div>
                    <div id="amountSearchBtn" className='left mr20'>
                        <Button type="primary" onClick={this.searchSettleAmount}>搜索</Button>
                    </div>
                    <b className="left mr10 content-font mt5">快付通结算金额：{commonJs.is_obj_exist(this.state.settleAmount)}</b>
                </div>
                <div  className="mt10 search-result relative bar" id="search_result_list">
                    <div style={{'ovflowX':'scroll'}}>
                    <table className="table" style={{minWith:'100%',marginBottom:'0',fontSize:'14px'}}>
                            <thead>
                                <tr className='th-bg'>
                                        {
                                            tableConfig.map((repy,i)=>{
                                                return <th key={i} className='nowrap'>{repy.title}</th>
                                            })
                                        }
                                    </tr>
                            </thead>
                            <tbody>
                            {
                                (this.state.searchResult && this.state.searchResult.length>0) ? this.state.searchResult.map((repy,i)=>{
                                    let accountStatus=commonJs.is_obj_exist(repy.accountStatus);
                                    return <tr key={i} id={commonJs.is_obj_exist(repy.id)}>
                                            {
                                                tableConfig.map((respons,item)=>{
                                                    let _value = commonJs.is_obj_exist(repy[respons.keyWord]);
                                                    let cell=respons.cell;
                                                    if(cell){
                                                        _value=respons.cell(repy[respons.keyWord])
                                                    }
                                                    if(respons.keyWord=='oprate'){
                                                        return <td key={item} style={{padding:'3px'}}>
                                                                    {accountStatus==0&&accountStatus!=6?<a className='accountBtn' onClick={this.showInAccountModal.bind(this,i)}>确认入账</a>:''}
                                                                    {
                                                                        (!commonJs.is_obj_exist(repy.slefOrCor)&&accountStatus==0)?
                                                                        <a className='accountBtn' onClick={this.cancleAccount.bind(this,i)}>取消挂帐</a>
                                                                        :''
                                                                    }
                                                                    {(accountStatus==3||accountStatus==6)?<a className='accountBtn' onClick={this.faildResion.bind(this,i)}>查看失败原因</a>:''}
                                                                </td>
                                                    }else{
                                                        return <td title={_value} key={item} className='nowrap' style={{overFlow:'auto'}}>
                                                                    {_value}
                                                                </td>
                                                    }
                                                })
                                            }
                                            </tr>
                                        }):<tr><td colSpan="11" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }  
                            </tbody>
                        </table>
                        <div className='tr-bg pt5 pl5 pb5 border-top' id='pageAtion'>
                            <Pagination 
                                        showQuickJumper 
                                        showSizeChanger
                                        defaultCurrent={1} 
                                        current={this.state.pageNumber}
                                        total={this.state.totalSize} 
                                        onShowSizeChange={this.onShowSizeChange}
                                        onChange={this.pageChange} 
                                    />
                        </div>
                    </div>
                </div>
                {/* 我要挂帐弹窗 */}
                <div className='accountModal modal'>
                    <Modal
                    title="我要挂帐"
                    visible={this.state.tickModalVisible}
                    onCancel={this.tickModalCancel}
                    footer={null}
                    >
                        <a href='/node/account/download/template' id='templatePLDown' className="btn-blue inline-block">下载批量挂账模板</a>
                        <p className='mt10'><b>挂帐类型：</b></p>
                        <Row gutter={8}>
                            <Col className="gutter-row" span={4}>
                                <a id='accountType' className={account_url=='single'?"btn-blue inline-block":"btn-white inline-block"} onClick={this.accountType.bind(this,'single')}>单笔</a>
                            </Col>
                            <Col className="gutter-row" span={4}>
                                <a id='accountType2' className={account_url=='batch'?"btn-blue inline-block":"btn-white inline-block"} onClick={this.accountType.bind(this,'batch')}>批量</a>
                            </Col>
                        </Row>
                        {
                            account_url=="single"?
                            <div>
                                <div className="mt10">
                                    <p className="mt10"><b>产品号:</b></p>
                                    <div style={{marginBottom:'10px'}} className="upAcount clearfix">
                                        <Channel onChange={(e)=>{
                                            this.setState({popupsValue:e.value,upAcountType:undefined})
                                            let newTypeEnums = [];
                                            if(e.value == '2A'){
                                                typeEnums.forEach(v => {
                                                    v.name == "SUM_COMPENSATORY"?newTypeEnums.push(v):'';
                                                });
                                            }else{
                                                newTypeEnums = typeEnums;
                                            }
                                            this.setState({
                                                newTypeEnums:newTypeEnums,
                                            })
                                        }} />  {/* 合作方 */}
                                    </div>
                                    <Row gutter={16}>
                                        <Col className="gutter-row" span={10}>
                                            <b>选择挂帐类型：</b>
                                        </Col>
                                        <Col className="gutter-row" span={10}>
                                            <b>选择挂账日期:</b>
                                        </Col>
                                    </Row>
                                    <Row gutter={16}>
                                        <Col className="gutter-row" span={10}>
                                            {
                                                this.state.popupsValue == '2F'?<Select
                                                        value={this.state.upAcountType}
                                                        onChange={this.upAcountType}
                                                        placeholder="请选择"
                                                        style={{ width: '100%' }}
                                                    >
                                                    {
                                                        typeFor2FEnums.length>0?typeFor2FEnums.map((repy,i)=>{
                                                            return <Option key={i} value={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</Option>
                                                        }):<option value=""></option>
                                                    }
                                                </Select>:<Select
                                                    value={this.state.upAcountType}
                                                    onChange={this.upAcountType}
                                                    placeholder="请选择"
                                                    style={{ width: '100%' }}
                                                >
                                                {
                                                    newTypeEnums.length>0?newTypeEnums.map((repy,i)=>{
                                                        return <Option key={i} value={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</Option>
                                                    }):<option value=""></option>
                                                }
                                            </Select>
                                            }
                                        </Col>
                                        <Col className="gutter-row" span={10}>
                                            <DatePicker onChange={this.tickTimeChange} format={'YYYY-MM-DD'} value={this.state.tickTime} />
                                        </Col>
                                    </Row>
                                    
                                </div>
                                {
                                   this.state.popupsValue!=='2F'?<span>
                                            <p className="mt10"><b>合同号:</b></p>
                                            <input type="text" className="input mt3 amountLoanNumnber" id='amountLoanNumnber' placeholder='请输入' style={{'width':'360px'}} />
                                    </span>:''
                                }
                                {
                                    this.state.popupsValue&&this.state.popupsValue=='2F'?<span>
                                        <p className="mt10"><b>授信号:</b></p>
                                        <input type="text" className="input mt3 amountLoanNumnber" id='amountLoanNumnber' placeholder='请输入' style={{'width':'360px'}} />
                                        <p className="mt10"><b>收款账号:</b></p>
                                        <input type="text" className="input mt3  creditedNumber" id=' creditedNumber' placeholder='请输入' style={{'width':'360px'}} />
                                    </span>:''
                                }
                                {
                                    upAcountType=='WITHOUT_SPECIFIELD_INSTALLMENT_REPAYMENT'||upAcountType=='SPECIFIELD_INSTALLMENT_REPAYMENT'?
                                    <div className='pt5'>
                                        <Row gutter={16}>
                                            <Col className="gutter-row" span={16}>
                                                <b>选择期数：(此选项只为查询挂帐金额使用！)</b>
                                            </Col>
                                        </Row>
                                        <Row gutter={16}>
                                            <Col className="gutter-row" span={16}>
                                            <Select
                                                allowClear
                                                mode="multiple"
                                                style={{ width: '100%' }}
                                                placeholder="请选择"
                                                onChange={this.installmentNumberListHandle}
                                            >
                                            {children}
                                            </Select>
                                            </Col>
                                        </Row>
                                    </div>:''
                                }
                                {
                                    this.state.popupsValue=='40H'||this.state.popupsValue=='30H'||this.state.popupsValue=='34H'||this.state.popupsValue=='39H'?<div>
                                        <p className="mt20"><b>本金:</b></p>
                                        <input type="number" className="input mt3 mr5" id='principal' placeholder='请输入' style={{'width':'360px'}} />
                                    </div>:''
                                }
                                <p className="mt20"><b>挂账金额:</b></p>
                                <input type="number" className="input mt3 amount mr5" id='amount2' placeholder='请输入' style={{'width':'360px'}} />
                                <a className="btn-yellow inline-block" onClick={this.getAccountMoney}>查询金额</a>
                                <div className="border-top-1 mt20 clearfix">
                                    <button className="btn-white left mr10" onClick={this.tickModalCancel}>取消</button>
                                    <button className="btn-blue left" onClick={this.sureAccount}>确定</button>
                                </div>
                            </div>
                            :
                            <div>
                                <p className="mt10"><b>选择上传:</b></p>
                                <FileUpload options={uploadOptions} ref="fileUpload">
                                    <a className="left btn-blue block" id='uploadTemp' ref="chooseAndUpload">上传</a>
                                </FileUpload>
                                <span style={{color:'red'}} >2A,2F暂不支持批量挂账（批量挂帐模版已更新，请重新下载）</span>
                            </div>
                        }
                        
                    </Modal>
                </div>
                {/* 确认入账弹窗 */}
                <div className='modal'>
                    <Modal
                    title="确认入账"
                    visible={this.state.inAccountModalVisible}
                    onOk={this.inAccountModalOk}
                    onCancel={this.inAccountModalCancel}
                    >
                        {
                            inAccountModalType=='batch' ?  //batch为批量入账
                            <div>
                                <span style={{color:'red'}} >2A,2F暂不支持批量入账</span>
                                <p className='mt10 font14'><b>请输入账批次号：</b></p>
                                <p className="mt5 clearfix">
                                    <input type="text" placeholder='请输入' className="input left mr5 searchMount_batchNo" id='searchMount_batchNo' style={{width:'70%'}} />
                                    <button className="btn-blue left" id='batchNoSearch' onClick={this.searchMount}>搜索</button>
                                </p>
                                <p className='mt15 font14'><b>本次入账金额为：</b></p>
                                <p className="mt5 big-blue-font"><b>{commonJs.is_obj_exist(batchAmount)}元</b></p>
                                <p className="mt15 clearfix inAcountProduct">
                                    <Channel />  {/* 合作方 */}
                                </p>
                            </div>
                            :
                            <div>
                                <p className='mt10'><b>本次入账金额为：</b></p>
                                <p className="mt5 big-blue-font"><b>{cpCommonJs.opinitionObj(this.state.currentData).amount}元</b></p>
                                {
                                    cpCommonJs.opinitionObj(this.state.currentData).productNo=='2F'&&<div><p className='mt10'><b>收款账号：</b></p>
                                    <p className="mt5 big-blue-font"><input type="text" className="input mt3  creditedNumber" id=' creditedNumber' placeholder='请输入' style={{'width':'360px'}} /></p></div>
                                }
                            </div>
                        }

                        <div className="clearfix"></div>
                        <div>
                            <p className='mt10 font14'><b>请选择入账渠道：</b></p>
                            <div className="mt5" id='inAccountType'>
                                <Select
                                    value={this.state.inAccountType}
                                    onChange={this.inAccountTypeChange}
                                    placeholder="请选择"
                                    style={{ width: '50%' }}
                                >
                                {
                                    inAccountTypeList.map((repy,i)=>{
                                        if(cpCommonJs.opinitionObj(this.state.currentData).productNo !== '2A'){
                                            return <Option key={i} value={repy.value}>{repy.displayName}</Option>
                                        }else{
                                            if(repy.value == "offline"){
                                                return <Option key={i} value={repy.value}>{repy.displayName}</Option>
                                            }
                                        }
                                    })
                                }
                                </Select>
                            </div>
                        </div>
                        <p className='mt15 font14'><b>请选实际到账日期：</b></p>
                        <p className='mt5'><b>(实际到账日期仅用做记录，入账金额按照挂账时间计算)</b></p>
                        <DatePicker onChange={this.inAccounTtimeChange} format={'YYYY-MM-DD'} value={this.state.inAccounTtime} />

                        {
                            (showSerialNo && inAccountModalType=='single') ? 
                            <div>
                                <p className='mt10 font14'><b>流水号：</b></p>
                                <p className="mt5 clearfix">
                                    <input type="text" placeholder='请输入' autoComplete="off" value={this.state.serialNumber} onChange={(e)=>{
                                        this.setState({
                                            serialNumber:e.currentTarget.value
                                        })
                                    }} className="input left mr5 serialNumber" id='serialNumber' style={{width:'70%'}} />
                                </p>
                                {/* <p className='mt10 font14'><b>收款账号：</b></p>
                                <p className="mt5 clearfix">
                                    <select name="" id="creditedNumber" className="left mr5 select-gray creditedNumber" style={{width:'70%'}}>
                                        <option value="" data-show="hide">请选择</option>
                                        <option value="123907429910313">123907429910313</option>
                                        <option value="123907429910708">123907429910708</option>
                                    </select>
                                </p> */}
                            </div> :''
                        }

                        {/* 选择 结清小雨点-未收款 时显示上传和描述文字============= */}
                        {
                            this.state.inAccountType=='paidMtbc'||this.state.inAccountType=='paidMtbc-no'?
                            <div>  
                                <div className="mt10">
                                    <b className='left mr10' style={{lineHeight:'24px'}}>上传图片:</b>
                                    <FileUpload options={uploadOptions2} ref="fileUpload">
                                        <a className="left btn-blue block" id='uploadImgs' ref="chooseAndUpload">上传</a>
                                    </FileUpload>
                                </div>
                                <ul>
                                {
                                    uploadResDTOs.length>0?uploadResDTOs.map((repy,i)=>{
                                        return <li key={i}>{repy.filename}</li>
                                    }):<li></li>
                                }
                                </ul>
                                <div>
                                    <p className="mt10"><b>描述文字:</b></p>
                                    <textarea className='textarea ensureContent' id='ensureContent' style={{width:'100%'}} rows="5"></textarea>
                                </div>
                            </div>:''
                        }
                    </Modal>
                </div>
                {/* 查看失败原因弹窗 */}
                <div>
                    <Modal
                    title="失败原因"
                    visible={this.state.defeatedVisible}
                    onCancel={this.defeatedModalCancel}
                    footer={null}
                    >
                        <p className='mt10'>{commonJs.is_obj_exist(this.state.faildResion).reason}</p>
                    </Modal>
                </div>

                {/* 其他款项登记 */}
                <div>
                    <Modal
                    title="其他款项登记"
                    visible={this.state.accountOtherModal}
                    onOk={this.accountOtherOk}
                    onCancel={this.defeatedModalCancel}
                    >
                        <p className='mt10 font14'><b>流水号：</b></p>
                        <p className="mt5 clearfix">
                            <input type="text" placeholder='请输入' autoComplete="off" className="input left mr5 serialNumber_other" id='serialNumber_other' style={{width:'70%'}} />
                        </p>
                        {/* <p className='mt10 font14'><b>收款账号：</b></p>
                        <p className="mt5 clearfix">
                            <select name="" id="creditedNumber_other" className="left mr5 select-gray creditedNumber_other" style={{width:'70%'}}>
                                <option value="" data-show="hide">请选择</option>
                                <option value="123907429910313">123907429910313</option>
                                <option value="123907429910708">123907429910708</option>
                            </select>
                        </p> */}
                        <div className="clearfix"></div>
                        <div>
                            <p className='mt10 font14'><b>用途：</b></p>
                            <select className="mt5 select-gray creditedType" name="" id="creditedType" style={{width:'70%'}}>
                                <option value="" data-show='hide' hidden>请选择</option>
                                <option value="银联清算款">银联清算款</option>
                                <option value="保证金款">保证金款</option>
                                <option value="员工贷还款">员工贷还款</option>
                                <option value="放款失败退回">放款失败退回</option>
                                <option value="客户还款">客户还款</option>
                                <option value="招行313结息">招行313结息</option>
                                <option value="小雨点内部转账">小雨点内部转账</option>
                            </select>
                        </div>
                        <p className='mt10 font14'><b>备注：</b></p>
                        <p className="mt5 clearfix">
                            <textarea name="" id="note" className='textarea note' style={{width:'70%',height:'120px'}}></textarea>
                        </p>
                    </Modal>
                </div>
                {/* 特殊结清处理 */}
                <div>
                    <Modal
                    title="特殊结清处理"
                    okText="确认结清"
                    visible={this.state.specialModalVisible}
                    onCancel={this.defeatedModalCancel}
                    footer={null}
                    >
                        <a href={'/node/account/down/special'} className="btn-blue inline-block">下载特殊结清模板</a>
                        <p className='mt15'><b>慎用！本功能会将假结清变为真结清！</b></p>
                        <b className='left mt15 mr10' style={{lineHeight:'24px'}}>上传结清文件:</b>
                        <div className="clearfix"></div>
                        <FileUpload options={uploadOptions3} ref="fileUpload">
                            <a className="left btn-blue block mt5" id='settleUpFile' ref="chooseAndUpload">选择</a>
                        </FileUpload>
                    </Modal>
                </div>
                {/* 取消入账弹窗 */}
                <div>
                    <Modal
                    title="取消入账"
                    okText="确定提交"
                    visible={this.state.cancleModalVisible}
                    onOk={this.cancleModalOk}
                    onCancel={this.defeatedModalCancel}
                    >
                        <div className="red">本功能会取消该笔订单最近一次入账并且退入资金池</div>
                        <p className='mt10'>对账时是否隐藏该笔流水：</p>
                        <select name="" id="" className='select-gray mt5 cle_showType' style={{width:'70%'}}>
                            <option value="implicit">隐藏</option>
                            <option value="explicit">显式</option>
                        </select>
                        <p className='mt10'>合同号：</p>
                        <div className='mt5'>
                            <input type="text" className='input left mr5 cle_loanNumber'  style={{width:'70%'}} placeholder='请输入'/>
                            <button className="btn-blue left" onClick={this.celMoneyCheck}>查询金额</button>
                        </div>
                        <div className="clearfix"></div>
                        <p className='mt10'>取消总金额</p>
                        <input type="number" className="input mt10 cle_amount" disabled  style={{width:'70%'}} placeholder='请先输入合同号通过查询获取' onKeyPress={commonJs.handleKeyPress.bind(this,['e'])}/>
                        <p className='mt10'>备注</p>
                        <textarea name="" id="" cols="40" rows="10" className='textarea cle_comment' placeholder='请输入'></textarea>
                    </Modal>
                </div>
            </div>
        );
    }
}
;

export default CooperationAccounting;