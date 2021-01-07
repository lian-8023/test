import React,{PureComponent} from 'react';
// import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
//校验
import VerifyJs from '../../source/common/verify';
var verifyJs=new VerifyJs;
// 上传文件
import FileUpload from 'react-fileupload';
// select框获取数据和显示默认值
import SelectDefaultVal from '../../source/common/SelectDefaultVal';
var selectValJs=new SelectDefaultVal;
//根据编码获取地址
import GetAddressByCode from  '../../source/common/getAddressByCode';
var getAddressByCode=new GetAddressByCode; 
//根据银行卡号获取银行名称
import BankName from '../../source/common/bankName';
var bankName=new BankName;

import callCofig from '../../template/callSystemConfig';

class AstSteps extends React.Component{
    constructor(props){
        super(props);
        this.state={
            allProvince:[],   //省
            get_registrationId:this.props._registrationId,
            astData:{},  //页面数据
            fileType:"",   //文件类型 身份证正面：identification_card_front  身份证反面：identification_card_back  身份证合照：identification_card_withHead
            getRalations:[]  //其他联系人or旁系联系人 关系数组
        }
    }
    UNSAFE_componentWillMount(){
    }
    componentDidMount(){
        this.getAstStepsMsg();
        var h = document.documentElement.clientHeight;
        // $(".auto-box").css("height", h - 200);
        let _that=this;
        //第二步 公司电话切换
        $(".companyPhone label").on("click",function(){
            let n=$(this).index();
            $(".companyPhone label .myRadio").removeClass("myRadio-visited").addClass("myRadio-normal");
            $(".companyPhone label .myRadio:eq("+n+")").removeClass("myRadio-normal").addClass("myRadio-visited");
            $(".companyPhone .phoneNo-div").addClass("hidden");
            $(".companyPhone .phoneNo-div:eq("+n+")").removeClass("hidden");
        })
        //根据银行卡号获取银行名称
        $(".bankCardNo").on("keyup",function(){
            var cardNo=$(".bankCardNo").val();
            var getBankName=bankName.getBankName(cardNo);
            $(".bankCardName").val(getBankName);
        })
        //其他联系人 || 旁系联系人
        $(".contactTitle .myRadio").on("click",function(){
            let $this=$(event.target);
            let $parent=$this.closest(".contactTitle");
            $parent.find(".myRadio").removeClass("myRadio-visited").addClass("myRadio-normal");
            $this.addClass("myRadio-visited").removeClass("myRadio-normal");

            let mold=$this.attr("data-mold");
            if(mold == "OTHER"){
                $(".directReferenceName").attr("data-param","otherReferenceName");
                $(".directRalation").attr("data-param","otherReferenceRelation");
                $(".directPhone").attr("data-param","otherReferencePhone");
                let _otherReferenceRelations=_that.state.astData.validInfoDTO.otherReferenceRelations;  //其他联系人关系数组
                _that.setState({
                    getRalations:_otherReferenceRelations
                })
            }else{
                $(".directReferenceName").attr("data-param","undirectReferenceName");
                $(".directRalation").attr("data-param","undirectReferenceRelation");
                $(".directPhone").attr("data-param","undirectReferencePhone");
                let _undirectContactsRelations=_that.state.astData.validInfoDTO.undirectContactsRelations;   //旁系联系人关系数组
                _that.setState({
                    getRalations:_undirectContactsRelations
                })
            }
        })

        //判断信息是否可编辑
        if(this.state.astData && this.state.astData.validInfoDTO){
            let pageValue=this.state.astData.validInfoDTO.page.value+1;
            this.toCannotEdit(".step"+pageValue+"Content");
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        var stepsMsg_reload = nextProps._stepsMsg_reload;
        if(stepsMsg_reload && stepsMsg_reload=="noload"){
            return;
        }
        this.setState({
            get_registrationId:nextProps._registrationId
        },()=>{
            this.getAstStepsMsg();
        })
    }
    //组件将被卸载  
  componentWillUnmount(){ 
    //重写组件的setState方法，直接返回空
    this.setState = (state,callback)=>{
      return;
    };  
}
    // steps title label切换
    labelChange(index){
        $(".stepTie li").removeClass("on");
        $(".ast-content-box .ast-content").addClass("hidden");

        $(".stepTie li:eq("+index+")").addClass("on");
        $(".ast-content-box .ast-content:eq("+index+")").removeClass("hidden");
    }
    //获取所有省
    getAllProvince(){
        var _that=this;
        $.ajax({
            type:"get",
            url:"/common/getAllProvince",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var getData = res.data.data;
                _that.setState({
                    allProvince:getData
                })
            }
        })
    }
    //根据选择的省获取市
    getCities(event){
        let $this=$(event.target);
        var cityDom=$this.parent().find(".citySelect");
        // var districtDom=$this.parent().find(".districtSelect");
        cityDom.find("option").remove();
        // districtDom.find("option:eq(0)").nextAll().remove();
        var code=$this.parent().find(".provinceSelect option:selected").attr("data-name");
        var _that=this;
        $.ajax({
            type:"get",
            url:"/common/getCities",
            async:false,
            dataType: "JSON",
            data:{"provinceCode":code},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var getData = res.data.data;
                var newSelects='<option data-name="" hidden>城市</option>';
                for(let i=0;i<getData.length;i++){
                    newSelects+='<option data-name="'+getData[i].code+'">'+getData[i].name+'</option>';
                }
                cityDom.append(newSelects);
            }
        })
    }
    //根据选择的市获取区县
    getDistricts(event){
        let $this=$(event.target);
        var dom=$this.parent().find(".districtSelect");
        dom.find("option").remove();
        var code=$this.parent().find(".citySelect option:selected").attr("data-name");
        var _that=this;
        $.ajax({
            type:"get",
            url:"/common/getDistricts",
            async:false,
            dataType: "JSON",
            data:{"cityCode":code},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var getData = res.data.data;
                var newSelects='<option data-name="" hidden>区县</option>';
                for(let i=0;i<getData.length;i++){
                    newSelects+='<option data-name="'+getData[i].code+'">'+getData[i].name+'</option>';
                }
                dom.append(newSelects);
            }
        })
    }
    //保存 循环：data-loop="loop"节点， 类型：data-type="input" 提交给服务端参数key：data-param=""
    save(_url,event){
        let _data={};
        let _that=this;
        let $this=$(event.target);
        let $parent=$this.closest(".ast-content");
        $parent.find("[data-loop='loop']").each(function(){
            let type=$(this).attr("data-type");
            let param_key=$(this).attr("data-param");
            if(type=="input"){

                let currentVal=$(this).val();
                if(currentVal && currentVal != "-"){
                    _data[param_key]=$(this).val();
                }

            }else if(type=="input-name"){

                let currentDataName=$(this).attr("data-name");
                if(currentDataName){
                    _data[param_key]=currentDataName;
                }

            }else if(type=="select"){

                let currentDataType=$(this).find("option:selected").attr("data-name");
                if(currentDataType){
                    _data[param_key]=currentDataType;
                }
                
            }else if(type=="radio"){

                let currentRadio=$(this).find(".myRadio-visited").attr("data-mold");
                if(currentRadio){
                    _data[param_key]=currentRadio;
                }
            }
        });
        let _registrationId=this.state.get_registrationId;
        if(_registrationId==""){
            alert("未获取到registrationId！");
            return;
        }
        _data.registrationId=_registrationId;
        if(this.state.astData.validInfoDTO && this.state.astData.validInfoDTO.nationalId){
            _data.nationalId=this.state.astData.validInfoDTO.nationalId;   //step1以外的步骤保存时获取识别到的身份证号
        }else{
            _data.nationalId=$(".idNumber").val();   //step1保存时获取识别到的身份证号
        }
        this.mustFill(event);
        if(_data.bankName){
            $("[data-param='bankName']").removeClass("warnBg");
        }
        if($parent.find(".warnBg:visible").length>0){
            alert("信息填写有误，请重新填写！");
            return;
        }
        $.ajax({
            type:"post",
            url:_url,
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var getData = res.data;
                alert(getData.message);
                _that.getAstStepsMsg();
            }
        })
    }
    //获取steps展示信息
    getAstStepsMsg(){
        var _that=this;
        let _registrationId=this.state.get_registrationId;
        if(_registrationId==""){
            this.setState({
                astData:{}
            },()=>{
                $(".ast-content").addClass("hidden");
                $(".step0Content").removeClass("hidden");
            })
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/getAstStepsMsg",
            async:false,
            dataType: "JSON",
            data:{"registrationId":_registrationId},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let getData = res.data;
                let page=getData.validInfoDTO.page;

                // 电话号码传给父组件
                if(_that.props._stepsCallBack){
                    let _primaryPhone=getData.validInfoDTO.primaryPhone;
                    let _page=getData.validInfoDTO.page;
                    let _accountId=getData.validInfoDTO.accountId;
                    _that.props._stepsCallBack(_primaryPhone,_page,_accountId);
                }
                //判断信息是否可编辑
                if(getData && getData.validInfoDTO){
                    let pageValue=getData.validInfoDTO.page.value+1;
                    if($(".step"+pageValue+"Content")){
                        _that.toCannotEdit(".step"+pageValue+"Content");
                    }
                }
                if(page&&page.value<4){
                    _that.setState({
                        astData:getData
                    });
                    _that.getAllProvince();
                }
            }
        })
    }
    //添加为不可编辑状态
    toCannotEdit(domClass){
        $(".ast-msg-ctrl").addClass("hidden");
        $(".astStepMsg").find(".showDom,.select-gray").attr("disabled","true");
        $(".astStepMsg").find(".showDom").removeClass("hidden");
        $(".astStepMsg").find(".editDom").addClass("hidden");
        
        $(domClass).find(".select-gray").removeAttr("disabled");
        $(domClass).find(".ast-msg-ctrl").removeClass("hidden");
        $(".step1-no-msg").find(".input").attr("disabled","true");

        $(domClass).find(".showDom").addClass("hidden");
        $(domClass).find(".editDom").removeClass("hidden");
        $(domClass).find(".select-gray option").removeProp("selected");
        $(domClass).find(".select-gray option:eq(0)").prop("selected","selected");
    }

    //点击上传按钮改变state里面文件类型,给上传文件接口用
    changeFileType(type){
        this.setState({
            fileType:type
        })
    }
    // ast身份证上传成功后赋值
    _handleUploadSuccess(resp) {
        alert(resp.data.message);
        let ocrRecongnizeInfoDTO=resp.data.ocrRecongnizeInfoDTO;
        let _type=resp.data.type.name;
        let $parent=$(".step1-no-msg");
        if(_type=="identification_card_front"){
            $parent.find(".idNumber").val(commonJs.is_obj_exist(ocrRecongnizeInfoDTO.idNumber));
            $parent.find(".name").val(commonJs.is_obj_exist(ocrRecongnizeInfoDTO.name));
            $parent.find(".address").val(commonJs.is_obj_exist(ocrRecongnizeInfoDTO.address));
            $parent.find(".cardFront").removeClass("up-file").addClass("reup-file");
            $parent.find(".cardFront").find(".upfiletext").text("重新上传");
        }else if(_type=="identification_card_back"){
            $parent.find(".validDateRange").val(commonJs.is_obj_exist(ocrRecongnizeInfoDTO.validDateRange));
            $parent.find(".cardBack").removeClass("up-file").addClass("reup-file");
            $parent.find(".cardBack").find(".upfiletext").text("重新上传");
        }else if(_type=="identification_card_withHead"){
            $parent.find(".cardWithHead").removeClass("up-file").addClass("reup-file");
            $parent.find(".cardWithHead").find(".upfiletext").text("重新上传");
        }else{
            $parent.find(".faceRecognition").find(".upfiletext").text("重新上传");
        }
    }
    // ast文件上传失败
    _handleUploadFailed(err) {
        console.log(err)
    }
    //上传之前检查文件
    _checkUploadImg(files, mill){
        if(files.length>1){
            alert("只能上传一张图片！");
            return false;
        }
    }
    // 保存时提示必填
    mustFill(event){
        let $parent=$(event.target).closest(".ast-content");
        let classArray=["[data-param='homeAddress']","[data-param='incomeSource']","[data-param='paydate']","[data-param='incomeDdi']",
        "[data-param='incomeCash']","[data-param='company']","[data-param='companyPhone']","[data-param='companyPhoneMobile']","[data-param='companyPhoneMobile']"
        ,"[data-param='companyIndustry']","[data-param='workType']","[data-param='position']","[data-param='companyProvinceId']","[data-param='companyCityId']"
        ,"[data-param='companyAddress']","[data-param='housingSituation']","[data-param='requestAmount']","[data-param='loanPurpose']"
        
        ,"[data-param='directReferenceName']","[data-param='directReferenceRelation']","[data-param='directReferenceProvinceId']","[data-param='directReferenceCityId']"
        ,"[data-param='directReferenceDistrictId']","[data-param='directReferenceAddress']","[data-param='directReferencePhone']","[data-param='otherReferenceName']"
        ,"[data-param='otherReferenceRelation']","[data-param='otherReferencePhone']","[data-param='workTime']","[data-param='liveTime']","[data-param='highestEducation']"
        
        ,"[data-param='bankCardNumber']","[data-param='bankName']","[data-param='bankReservePhone']","[data-param='bankProvinceId']","[data-param='bankCityId']"
        ,"[data-param='bankDistrictId']","[data-param='bankBranch']"
        ];
        for(let i=0;i<classArray.length;i++){
            if($parent.find(classArray[i]).val()=="" || $parent.find(classArray[i]).find("option:selected").text()=="请选择"){
                $(classArray[i]).addClass("warnBg");
            }
        }
    }
    //电话图标事件
    phoneHandle=(callByTianr,phoneNo)=>{
        if(callCofig.sys == 'new'){
            if(callCofig.Ccbar.call){
                console.log(phoneNo);
                callCofig.Ccbar.call(phoneNo);
            }else{
                alert('请先登录呼叫系统');
            }
        }else{
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
    }
    render() {
        let fileOption={
            uploadOptions:{
                baseUrl: '/Qport/astUpLoadFile',
                param: {
                    registrationId: this.state.get_registrationId,
                    fileType:this.state.fileType
                },
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: 'image/*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg.bind(this),  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this),  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        let astData=this.state.astData;
        let validInfoDTO=(astData && astData.validInfoDTO) ? astData.validInfoDTO : {};
        let _firstTrialStatus=validInfoDTO && validInfoDTO.firstTrialStatus && (validInfoDTO.firstTrialStatus==1 || validInfoDTO.firstTrialStatus==2);
        // let callByTianr=validInfoDTO.callByTianr;  //是否能使用天润呼叫，不能则使用800呼叫 = ['YES', 'NO', 'DESTROY']
        let callByTianr="NO";  //使用800呼叫
        let viewPhone=validInfoDTO.viewPhone;      //是否有权限查看完整号码 = ['YES', 'NO', 'DESTROY']stringEnum:"YES", "NO", "DESTROY"
        return (
            <div className="auto-box mt20 pr5 astStepMsg">
                <ul className="bar stepTie">
                    <li className={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=0) ? "on" : "not-allowed"} onClick={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>0) ? this.labelChange.bind(this,0) : ""}>已注册</li>
                    <li className={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=1) ? "" : "not-allowed"} onClick={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=1) ? this.labelChange.bind(this,1) : ""}>第一步</li>
                    <li className={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=2) ? "" : "not-allowed"} onClick={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=2) ? this.labelChange.bind(this,2) : ""}>第二步</li>
                    <li className={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=3) ? "" : "not-allowed"} onClick={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=3) ? this.labelChange.bind(this,3) : ""}>第三步</li>
                    <li className={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=4) ? "" : "not-allowed"} onClick={(validInfoDTO && validInfoDTO.page && validInfoDTO.page.value+1>=4) ? this.labelChange.bind(this,4) : ""}>第四步</li>
                </ul>
                {_firstTrialStatus ? <div className="bar mt5 pl20 current-condtion not-fit"> {/*符合 fit ；不符合 not-fit*/}
                        当前步骤&nbsp;&nbsp;<b className="blue-font">{validInfoDTO.page.displayName}</b>&nbsp;&nbsp;&nbsp;&nbsp;<b className="show-fit">不符合</b>申请条件
                    </div>:""}
                <div className="ast-content-box">
                    {/*已注册*/}
                    <div className="ast-content bar mt5 step0Content">
                        <dl className="ast-msg">
                            <dt>电话号码</dt>
                            <dd>
                                <span className="left">{commonJs.phoneReplace(callByTianr,astData.regPhone)}</span>
                                {(validInfoDTO.page && validInfoDTO.page.value<4) ? 
                                <a className="phont-btn-user block left ml5 mt2" id='step1PhoneCall' onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> 
                                : ""}
                            </dd>
                            <dt>密码</dt>
                            <dd>{astData.password ? "******" : "-"}</dd>
                        </dl>
                    </div>
                    {/*第一步*/}
                    <div className="ast-content bar mt5 hidden step1Content">
                        <div className={(validInfoDTO && validInfoDTO.nationalId) ? "step1-have-msg" : "step1-have-msg hidden"}>
                            <dl className="ast-msg">
                                <dt>身份证号</dt>
                                <dd className="dd-half" title={commonJs.is_obj_exist(validInfoDTO.nationalId)}>{commonJs.is_obj_exist(validInfoDTO.nationalId)}</dd>
                                <dt>姓名</dt>
                                <dd className="dd-half" title={commonJs.is_obj_exist(validInfoDTO.name)}>{commonJs.is_obj_exist(validInfoDTO.name)}</dd>
                                <dt>户籍所在地</dt>
                                <dd className="dd-half" title={commonJs.is_obj_exist(validInfoDTO.censusAddress)}>{commonJs.is_obj_exist(validInfoDTO.censusAddress)}</dd>
                                <dt>身份证有效期</dt>
                                <dd className="dd-half" title={commonJs.is_obj_exist(validInfoDTO.validDateRange)}>{commonJs.is_obj_exist(validInfoDTO.validDateRange)}</dd>
                            </dl>
                        </div>
                        <div className={(validInfoDTO && validInfoDTO.nationalId) ? "step1-no-msg hidden" : "step1-no-msg"}>
                            <dl className="ast-msg">
                                <dt>身份证正面</dt>
                                <dd>
                                    <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                        <a className="btn-white block up-file cardFront" ref="chooseAndUpload" onClick={this.changeFileType.bind(this,"identification_card_front")}><i className="up-file-icon"></i><span className="upfiletext"></span></a>
                                    </FileUpload>
                                </dd>
                                <dt>身份证背面</dt>
                                <dd>
                                    <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                        <a className="btn-white block up-file cardBack" ref="chooseAndUpload" onClick={this.changeFileType.bind(this,"identification_card_back")}><i className="up-file-icon"></i><span className="upfiletext"></span></a>
                                    </FileUpload>
                                </dd>
                                <dt>身份证合照</dt>
                                <dd>
                                    <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                        <a className="btn-white block up-file cardWithHead" ref="chooseAndUpload" onClick={this.changeFileType.bind(this,"identification_card_withHead")}><i className="up-file-icon"></i><span className="upfiletext"></span></a>
                                    </FileUpload>
                                </dd>
                                <dt>上传个人头像</dt>
                                <dd>
                                    <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                        <a className="btn-white block up-file faceRecognition" ref="chooseAndUpload" onClick={this.changeFileType.bind(this,"face_recognition")}><i className="up-file-icon"></i><span className="upfiletext"></span></a>
                                    </FileUpload>
                                </dd>
                            </dl>
                        <dl className="ast-msg top-border-2px">
                            <dt>身份证号码</dt>
                            <dd className="dd-half">
                                <input placeholder="请上传文件" type="text" id='idNumber' className="input idNumber" data-loop="loop" data-type="input" data-param="nationalId" />
                            </dd>
                            <dt>姓名</dt>
                            <dd className="dd-half">
                                <input placeholder="请上传文件" type="text" id='userName' className="input name" data-loop="loop" data-type="input" data-param="name" />
                            </dd>
                            <dt>户籍所在地</dt>
                            <dd className="dd-half">
                                <input placeholder="请上传文件" type="text" id='address' className="input address" data-loop="loop" data-type="input" data-param="censusAddress" />
                            </dd>
                            <dt>身份证有效期</dt>
                            <dd className="dd-half"><input placeholder="请上传文件" id='validDateRange' type="text" className="input validDateRange" data-loop="loop" data-type="input" data-param="validDateRange" /></dd>
                        </dl>
                        <div className="top-border-2px ast-msg-ctrl clearfix">
                            <button className="btn-blue block mt10 mb10 ml20" id='saveStep1' onClick={this.save.bind(this,"/node/saveStep1")}>保存</button>
                        </div>
                        </div>
                    </div>
                    {/*第二步*/}
                    <div className="ast-content bar mt5 hidden step2Content">
                        <dl className="ast-msg">
                            <dt>贷款目的</dt>
                            <dd className="dd-half">
                                <select name="" id="loanPurposes" className="select-gray" data-loop="loop" data-type="select" data-param="loanPurpose" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.loanPurpose?validInfoDTO.loanPurpose.name:""} hidden>{validInfoDTO.loanPurpose?validInfoDTO.loanPurpose.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.loanPurposes && validInfoDTO.loanPurposes.length>0)?validInfoDTO.loanPurposes.map((repy,i)=>{
                                            return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>最高学历</dt>
                            <dd className="dd-half">
                                <select name="" id="highestEducation" className="select-gray" data-loop="loop" data-type="select" data-param="highestEducation" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.highestEducation?validInfoDTO.highestEducation.name:""} hidden>{validInfoDTO.highestEducation?validInfoDTO.highestEducation.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.highestEducations && validInfoDTO.highestEducations.length>0)?validInfoDTO.highestEducations.map((repy,i)=>{
                                            return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>预期贷款金额</dt>
                            <dd className="dd-half">
                                <input type="text" className="input editDom hidden" id='requestAmount' data-loop="loop" data-type="input" data-param="requestAmount" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","预期贷款金额")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='showDom' value={commonJs.is_obj_exist(validInfoDTO.requestAmount)} />
                            </dd>
                            <dt>住房情况</dt>
                            <dd className="dd-half">
                                <select name="" id="housingSituation" className="select-gray" data-loop="loop" data-type="select" data-param="housingSituation" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.housingSituation?validInfoDTO.housingSituation.name:""} data-param="housingSituation" hidden>{validInfoDTO.housingSituation?validInfoDTO.housingSituation.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.housingSituations && validInfoDTO.housingSituations.length>0) ? validInfoDTO.housingSituations.map((repy,i)=>{
                                            return <option key={i} data-name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>居住区域</dt>
                            <dd>
                                <select name="" id="homeProvinceId" className="select-gray mr10 provinceSelect" data-loop="loop" data-type="select" data-param="homeProvinceId" onChange={this.getCities.bind(this)} onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.homeProvinceId?validInfoDTO.homeProvinceId:""} hidden>{validInfoDTO.homeProvinceId ? getAddressByCode.getAddressByCode(validInfoDTO.homeProvinceId) :""}</option>
                                    {
                                        (this.state.allProvince.length>0) ? this.state.allProvince.map((repy,i)=>{
                                            return <option  data-name={commonJs.is_obj_exist(repy.code)} key={i}>{commonJs.is_obj_exist(repy.name)}</option>
                                        }):<option  data-name="" hidden>省份</option>
                                    }
                                </select>
                                <select name="" id="homeCityId" className="select-gray select-city mr10 citySelect" data-loop="loop" data-type="select" data-param="homeCityId" onChange={this.getDistricts.bind(this)} onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.homeProvinceId?validInfoDTO.homeCityId:""} hidden>{validInfoDTO.homeCityId ? getAddressByCode.getAddressByCode(validInfoDTO.homeCityId) : ""}</option>
                                </select>
                                <select name="" id="homeDistrictId" className="select-gray select-district districtSelect" data-loop="loop" data-type="select" data-param="homeDistrictId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.homeProvinceId?validInfoDTO.homeDistrictId:""} hidden>{validInfoDTO.homeDistrictId ? getAddressByCode.getAddressByCode(validInfoDTO.homeDistrictId) : ""}</option>
                                </select>
                            </dd>
                            <dt>街道地址</dt>
                            <dd>
                                <input type="text" className="input editDom hidden" id='homeAddress' data-loop="loop" data-type="input" style={{"width":"100%"}} data-param="homeAddress" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='homeAddress2' style={{"width":"100%"}} value={commonJs.is_obj_exist(validInfoDTO.homeAddress)} />
                            </dd>
                            <dt>收入来源</dt>
                            <dd className="dd-half">
                                <select name="" id="incomeSource" className="select-gray" data-loop="loop" data-type="select" data-param="incomeSource" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.incomeSource?validInfoDTO.incomeSource.name:""} hidden>{validInfoDTO.incomeSource?validInfoDTO.incomeSource.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.incomeSources && validInfoDTO.incomeSources.length>0)?validInfoDTO.incomeSources.map((repy,i)=>{
                                            return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>工资发放日</dt>
                            <dd className="dd-half">
                                <input type="text" className="input editDom hidden" id='paydate' data-loop="loop" data-type="input" data-param="paydate" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","isNaN","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='paydate2' value={commonJs.is_obj_exist(validInfoDTO.paydate)} />
                            </dd>
                            <dt>银行工资卡月收入</dt>
                            <dd className="dd-half">
                                <input type="text" className="input editDom hidden" id='incomeDdi' data-loop="loop" data-type="input" data-param="incomeDdi" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='incomeDdi2' value={commonJs.is_obj_exist(validInfoDTO.incomeDdi)} />
                            </dd>
                            <dt>现金月收入</dt>
                            <dd className="dd-half">
                                <input type="text" className="input editDom hidden" id='incomeCash' data-loop="loop" data-type="input" data-param="incomeCash" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='incomeCash2' value={commonJs.is_obj_exist(validInfoDTO.incomeCash)}  />
                            </dd>
                            <dt>公司名称</dt>
                            <dd>
                                <input type="text" className="input editDom hidden" id='company' style={{"width":"100%"}} data-loop="loop" data-type="input" data-param="company" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='company2' style={{"width":"100%"}} value={commonJs.is_obj_exist(validInfoDTO.company)} />
                            </dd>
                            <dt>公司电话</dt>
                            <dd className="companyPhone">
                                <div className="left clearfix" style={{"width":"40%"}} data-loop="loop" data-type="radio" data-param="companyPhoneType">
                                    <label className="left ctrl-label" id='FIXED'><i className={(validInfoDTO.companyPhoneType && validInfoDTO.companyPhoneType=="FIXED") ? "myRadio myRadio-visited" : "myRadio myRadio-normal"} data-mold="FIXED"></i>座机</label>
                                    <label className="left ctrl-label" id='MOBILE'><i className={(validInfoDTO.companyPhoneType && validInfoDTO.companyPhoneType=="MOBILE") ? "myRadio myRadio-visited" : "myRadio myRadio-normal"} data-mold="MOBILE"></i>手机</label>
                                </div>
                                <div className={(validInfoDTO.companyPhoneType && validInfoDTO.companyPhoneType=="FIXED") ? "left phoneNo-div" : "left phoneNo-div hidden"}>
                                    <input type="text" className="left input area-No editDom hidden" id='companyPhoneAreaCode' data-loop="loop" data-type="input" data-param="companyPhoneAreaCode" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                    <input type="text" placeholder="请输入" className="left input area-No showDom" id='companyPhoneAreaCode2' value={commonJs.is_obj_exist(validInfoDTO.companyPhoneAreaCode)} />
                                    <span className="left phone-line">-</span>
                                    <input type="text" className="left input phone-No editDom hidden" id='companyPhone' data-loop="loop" data-type="input" data-param="companyPhone" placeholder={validInfoDTO.companyPhone  ? validInfoDTO.companyPhone : "请输入"} onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")}/>
                                    <input type="text" placeholder="请输入" className="left input phone-No showDom" id='companyPhone2' value={commonJs.is_obj_exist(validInfoDTO.companyPhone)}/>
                                    <span className="left phone-line">-</span>
                                    <input type="text" className="left input brach-No editDom hidden" data-loop="loop" id='companyPhoneExtNumber' data-type="input" data-param="companyPhoneExtNumber" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                    <input type="text" placeholder="请输入" className="left input brach-No showDom" id='companyPhoneExtNumber2' value={commonJs.is_obj_exist(validInfoDTO.companyPhoneExtNumber)}/>
                                    {(validInfoDTO.page && validInfoDTO.page.value==2) ? <a className="phont-btn-user block left ml5 mt2" id='companyPhoneCall'  onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> : ""}
                                </div>
                                <div className={(validInfoDTO.companyPhoneType && validInfoDTO.companyPhoneType=="MOBILE") ? "left phoneNo-div" : "left phoneNo-div hidden"}>
                                    <input type="text" className="input phoneNo left editDom hidden" id='companyPhoneMobile' data-loop="loop" data-type="input" data-param="companyPhoneMobile" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"cellPhone","notNull","isNaN","手机号码")} />
                                    <input type="text" placeholder="请输入" className="input phoneNo left showDom" id='companyPhoneMobile2' value={commonJs.phoneReplace(callByTianr,validInfoDTO.companyPhoneMobile)}/>
                                    {(validInfoDTO.page && validInfoDTO.page.value==2) ? <a className="phont-btn-user block left ml5 mt2" id='companyPhoneMobileCall'  onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> : ""}
                                </div>
                            </dd>
                            <dt>单位所属行业</dt>
                            <dd>
                                <select name="" id="companyIndustry" className="select-gray" data-loop="loop" data-type="select" data-param="companyIndustry" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.companyIndustryE?validInfoDTO.companyIndustryE.name :""} hidden>{validInfoDTO.companyIndustryE?validInfoDTO.companyIndustryE.displayName :"请选择"}</option>
                                    {
                                        (validInfoDTO.companyIndustryEs && validInfoDTO.companyIndustryEs.length>0) ? validInfoDTO.companyIndustryEs.map((repy,i)=>{
                                            return <option data-name={repy.name ? repy.name : ""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                    
                                </select>
                            </dd>
                            <dt>职业</dt>
                            <dd className="dd-half">
                                <select name="" id="workType" className="select-gray" data-loop="loop" data-type="select" data-param="workType" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.workTypeE ? validInfoDTO.workTypeE.name : ""} hidden>{validInfoDTO.workTypeE?validInfoDTO.workTypeE.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.workTypeEa && validInfoDTO.workTypeEa.length>0) ? validInfoDTO.workTypeEa.map((repy,i)=>{
                                            return <option data-name={repy.name ? repy.name : ""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>工作职位</dt>
                            <dd className="dd-half">
                                <input type="text" className="input phoneNo editDom hidden" id='position' data-loop="loop" data-type="input" data-param="position" placeholder="请输入" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input type="text" placeholder="请输入" className="input phoneNo showDom" id='position2' value={commonJs.is_obj_exist(validInfoDTO.position)}/>
                            </dd>
                            <dt>工作所在区域</dt>
                            <dd>
                                <select name="" id="companyProvinceId" className="select-gray mr10 provinceSelect" onChange={this.getCities.bind(this)} data-loop="loop" data-type="select" data-param="companyProvinceId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.companyProvinceId?validInfoDTO.companyProvinceId:""} hidden>{validInfoDTO.companyProvinceId ? getAddressByCode.getAddressByCode(validInfoDTO.companyProvinceId) : ""}</option>
                                    {
                                        (this.state.allProvince.length>0) ? this.state.allProvince.map((repy,i)=>{
                                            return <option data-name={commonJs.is_obj_exist(repy.code)} key={i}>{commonJs.is_obj_exist(repy.name)}</option>
                                        }):<option  data-name="" hidden>省份</option>
                                    }
                                </select>
                                <select name="" id="companyCityId" className="select-gray select-city mr10 citySelect" onChange={this.getDistricts.bind(this)} data-loop="loop" data-type="select" data-param="companyCityId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.companyCityId?validInfoDTO.companyCityId:""} hidden>{validInfoDTO.companyCityId ? getAddressByCode.getAddressByCode(validInfoDTO.companyCityId) : ""}</option>
                                </select>
                                <select name="" id="companyDistrictId" className="select-gray select-district districtSelect" data-loop="loop" data-type="select" data-param="companyDistrictId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.companyDistrictId?validInfoDTO.companyDistrictId:""} hidden>{validInfoDTO.companyDistrictId ? getAddressByCode.getAddressByCode(validInfoDTO.companyDistrictId) : ""}</option>
                                </select>
                            </dd>
                            <dt>工作单位街道地址</dt>
                            <dd>
                                <input placeholder="请输入" type="text" className="input editDom hidden" id='companyAddress' data-loop="loop" data-type="input" data-param="companyAddress" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='companyAddress2'  value={commonJs.is_obj_exist(validInfoDTO.companyAddress)} />
                            </dd>
                        </dl>
                        <div className="top-border-2px ast-msg-ctrl clearfix">
                            <button className="btn-blue block mt10 mb10" id='saveStep2' onClick={this.save.bind(this,"/node/saveStep2")}>保存</button>
                        </div>
                    </div>
                    {/*第三步*/}
                    <div className="ast-content bar mt5 hidden step3Content">
                        <h2 className="step-cont-tit pl20">家庭联系人</h2>
                        <dl className="ast-msg top-border-2px">
                            <dt>姓名</dt>
                            <dd className="dd-half"> 
                                <input placeholder="请输入" type="text" className="input editDom hidden" id='directReferenceName' data-loop="loop" data-type="input" data-param="directReferenceName" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='directReferenceName2' value={commonJs.is_obj_exist(validInfoDTO.directReferenceName)} />
                            </dd>
                            <dt>关系</dt>
                            <dd className="dd-half">
                                <select name="" id="directReferenceRelation" className="select-gray" data-loop="loop" data-type="select" data-param="directReferenceRelation" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option data-name={validInfoDTO.directReferenceRelation?validInfoDTO.directReferenceRelation.name:""} hidden>{validInfoDTO.directReferenceRelation?validInfoDTO.directReferenceRelation.displayName:"请选择"}</option>
                                    {
                                        (validInfoDTO.directReferenceRelations && validInfoDTO.directReferenceRelations.length>0)?validInfoDTO.directReferenceRelations.map((repy,i)=>{
                                            return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                        }):<option data-name="">请选择</option>
                                    }
                                </select>
                            </dd>
                            <dt>居住区域</dt>
                            <dd>
                                <select name="" id="directReferenceProvinceId" className="select-gray mr10 provinceSelect" onChange={this.getCities.bind(this)} data-loop="loop" data-type="select" data-param="directReferenceProvinceId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.directReferenceProvinceId?validInfoDTO.directReferenceProvinceId:""} hidden>{validInfoDTO.directReferenceProvinceId ? getAddressByCode.getAddressByCode(validInfoDTO.directReferenceProvinceId) : ""}</option>
                                    {
                                        (this.state.allProvince.length>0) ? this.state.allProvince.map((repy,i)=>{
                                            return <option data-name={commonJs.is_obj_exist(repy.code)} key={i}>{commonJs.is_obj_exist(repy.name)}</option>
                                        }):<option  data-name="" hidden>省份</option>
                                    }
                                </select>
                                <select name="" id="directReferenceCityId" className="select-gray select-city mr10 citySelect" onChange={this.getDistricts.bind(this)} data-loop="loop" data-type="select" data-param="directReferenceCityId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.directReferenceCityId?validInfoDTO.directReferenceCityId:""} hidden>{validInfoDTO.directReferenceCityId ? getAddressByCode.getAddressByCode(validInfoDTO.directReferenceCityId) : ""}</option>
                                </select>
                                <select name="" id="directReferenceDistrictId" className="select-gray select-district districtSelect" data-loop="loop" data-type="select" data-param="directReferenceDistrictId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.directReferenceDistrictId?validInfoDTO.directReferenceDistrictId:""} hidden>{validInfoDTO.directReferenceDistrictId? getAddressByCode.getAddressByCode(validInfoDTO.directReferenceDistrictId) :""}</option>
                                </select>
                            </dd>
                            <dt>详细地址</dt>
                            <dd className="dd-half">
                                <input placeholder="请输入" type="text" className="input editDom hidden" id='directReferenceAddress' data-loop="loop" data-type="input" data-param="directReferenceAddress" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                <input placeholder="请输入" type="text" className="input showDom" id='directReferenceAddress2' value={commonJs.is_obj_exist(validInfoDTO.directReferenceAddress)}/>
                            </dd>
                            <dt>电话</dt>
                            <dd className="dd-half">
                                <input placeholder="请输入" type="text" className="input left editDom hidden" id='directReferencePhone' data-loop="loop" data-type="input" data-param="directReferencePhone" onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","")} />
                                <input placeholder="请输入" type="text" className="input left showDom" id='directReferencePhone2' value={commonJs.phoneReplace(callByTianr,validInfoDTO.directReferencePhone)}/>
                                {(validInfoDTO.page && validInfoDTO.page.value==3) ? 
                                    <a className="phont-btn-user block left ml5 mt2" id='directReferencePhoneCall'  onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> 
                                : ""}
                            </dd>
                        </dl>

                        <div className="toggle-box">
                            <h2 className="step-cont-tit  top-border-2px pl20 clearfix contactTitle" data-loop="loop" data-type="radio" data-param="otherReferenceType">
                                <label className="left ctrl-label" id='OTHER'><i className={(validInfoDTO.otherReferenceType && validInfoDTO.otherReferenceType=="OTHER") ? "myRadio myRadio-visited" : "myRadio myRadio-normal"} data-mold="OTHER"></i>其他联系人</label>
                                <label className="left ctrl-label" id='UNDIRECT'><i className={(validInfoDTO.otherReferenceType && validInfoDTO.otherReferenceType=="UNDIRECT") ? "myRadio myRadio-visited" : "myRadio myRadio-normal"} data-mold="UNDIRECT"></i>旁系联系人</label>
                                <i className="right bar-tit-toggle bar-tit-toggle-up mr20 mt15" ></i>
                            </h2>
                            <dl className="ast-msg top-border-2px">
                                <dt>姓名</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input directReferenceName editDom hidden" id='otherReferenceName' data-loop="loop" data-type="input" data-param={(validInfoDTO.otherReferenceType && validInfoDTO.otherReferenceType=="OTHER") ? "otherReferenceName" :"undirectReferenceName"} onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")} />
                                    <input placeholder="请输入" type="text" className="input directReferenceName showDom" id='otherReferenceName23' value={commonJs.is_obj_exist(validInfoDTO.otherReferenceType=="OTHER" ? validInfoDTO.otherReferenceName : validInfoDTO.undirectReferenceName)}/>
                                </dd>
                                <dt>关系</dt>
                                <dd className="dd-half">
                                    <select name="" id="otherReferenceRelation" className="select-gray directRalation" data-loop="loop" data-type="select" data-param={(validInfoDTO.otherReferenceType && validInfoDTO.otherReferenceType=="OTHER") ? "otherReferenceRelation" : "undirectReferenceRelation"} onBlur={verifyJs.verifyS.bind(this)}>
                                        <option data-name={validInfoDTO.otherReferenceType=="OTHER" ? (validInfoDTO.otherReferenceRelation?validInfoDTO.otherReferenceRelation.name:"") : (validInfoDTO.undirectReferenceRelation?validInfoDTO.undirectReferenceRelation.name:"")} hidden>
                                            {validInfoDTO.otherReferenceType=="OTHER" ? (validInfoDTO.otherReferenceRelation?validInfoDTO.otherReferenceRelation.displayName:"请先选择联系人类型") : (validInfoDTO.undirectReferenceRelation?validInfoDTO.undirectReferenceRelation.displayName:"请先选择联系人类型")}
                                        </option>
                                        {
                                            (this.state.getRalations && this.state.getRalations.length>0)?this.state.getRalations.map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name="">请选择</option>
                                        }
                                    </select>
                                </dd>
                                <dt>电话</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input directPhone left editDom hidden" id='otherReferencePhone' data-loop="loop" data-type="input" data-param={(validInfoDTO.otherReferenceType && validInfoDTO.otherReferenceType=="OTHER") ? "otherReferencePhone" : "undirectReferencePhone"} onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","")} />
                                    <input placeholder="请输入" type="text" className="input directPhone left showDom" id='otherReferencePhone23' data-loop="loop" data-type="input" value={commonJs.is_obj_exist(validInfoDTO.otherReferenceType=="OTHER" ? commonJs.phoneReplace(callByTianr,validInfoDTO.otherReferencePhone) : commonJs.phoneReplace(callByTianr,validInfoDTO.undirectReferencePhone))}/>
                                    {(validInfoDTO.page && validInfoDTO.page.value==3) ? <a className="phont-btn-user block left ml5 mt2" id='otherReferencePhoneCall'  onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> : ""}
                                </dd>
                            </dl>
                        </div>

                        <div className="toggle-box">
                            <h2 className="step-cont-tit  top-border-2px pl20 clearfix" onClick={commonJs.content_toggle.bind(this)}>
                                其他联系人2 <b className="deep-yellow-font">（选填）</b>
                                <i className="right bar-tit-toggle bar-tit-toggle-up mr20 mt15" ></i>
                            </h2>
                            <dl className="ast-msg top-border-2px">
                                <dt>姓名</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='otherReferenceName2' data-loop="loop" data-type="input" data-param="otherReferenceName2" onBlur={verifyJs.verify.bind(this,"auto","allowNull","auto","")} />
                                    <input placeholder="请输入" type="text" className="input showDom" id='otherReferenceName22' value={commonJs.is_obj_exist(validInfoDTO.otherReferenceName2)}/>
                                </dd>
                                <dt>关系</dt>
                                <dd className="dd-half">
                                    <select name="" id="otherReferenceRelation2" className="select-gray" data-loop="loop" data-type="select" data-param="otherReferenceRelation2" >
                                        <option data-name={validInfoDTO.otherReferenceRelation2?validInfoDTO.otherReferenceRelation2.name:""} hidden>{validInfoDTO.otherReferenceRelation2?validInfoDTO.otherReferenceRelation2.displayName:"请选择"}</option>
                                        {
                                            (validInfoDTO.otherReferenceRelations && validInfoDTO.otherReferenceRelations.length>0)?validInfoDTO.otherReferenceRelations.map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name="">请选择</option>
                                        }
                                    </select>
                                </dd>
                                <dt>电话</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input left editDom hidden" id='otherReferencePhone2' data-loop="loop" data-type="input" data-param="otherReferencePhone2" onBlur={verifyJs.verify.bind(this,"number","allowNull","isNaN","")} />
                                    <input placeholder="请输入" type="text" className="input left showDom" id='otherReferencePhone22' value={commonJs.phoneReplace(callByTianr,validInfoDTO.otherReferencePhone2)}/>
                                    {(validInfoDTO.page && validInfoDTO.page.value==3) ? <a className="phont-btn-user block left ml5 mt2" id='otherReferencePhone2call' onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> : ""}
                                </dd>
                            </dl>
                        </div>
                        
                        <div className="toggle-box">
                            <h2 className="step-cont-tit  top-border-2px pl20 clearfix" onClick={commonJs.content_toggle.bind(this)}>
                                选填信息
                                <i className="right bar-tit-toggle bar-tit-toggle-up mr20 mt15" ></i>
                            </h2>
                            <dl className="ast-msg top-border-2px">
                                <dt>现单位工作年限</dt>
                                <dd className="dd-half">
                                    <select name="" id="workTime" className="select-gray" data-loop="loop" data-type="select" data-param="workTime" onBlur={verifyJs.verifyS.bind(this)}>
                                        <option data-name={validInfoDTO.workTime?validInfoDTO.workTime.name:""} hidden>{validInfoDTO.workTime?validInfoDTO.workTime.displayName:"请选择"}</option>
                                        {
                                            (validInfoDTO.workTimes && validInfoDTO.workTimes.length>0)?validInfoDTO.workTimes.map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name="">请选择</option>
                                        }
                                    </select>
                                </dd>
                                <dt>现住所居住时间</dt>
                                <dd className="dd-half">
                                    <select name="" id="liveTime" className="select-gray" data-loop="loop" data-type="select" data-param="liveTime" onBlur={verifyJs.verifyS.bind(this)}>
                                        <option data-name={validInfoDTO.liveTime?validInfoDTO.liveTime.name:""} hidden>{commonJs.is_obj_exist(validInfoDTO.liveTime?validInfoDTO.liveTime.displayName:"")}</option>
                                        {
                                            (validInfoDTO.workTimes && validInfoDTO.workTimes.length>0)?validInfoDTO.workTimes.map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name="">请选择</option>
                                        }
                                    </select>
                                </dd>
                                <dt>婚姻状况</dt>
                                <dd className="dd-half">
                                    <select name="" id="maritalStatus" className="select-gray" data-loop="loop" data-type="select" data-param="maritalStatus">
                                        <option data-name={validInfoDTO.maritalStatus?validInfoDTO.maritalStatus.name:""} hidden>{validInfoDTO.maritalStatus?validInfoDTO.maritalStatus.displayName:"请选择"}</option>
                                        {
                                            (validInfoDTO.maritalStatuss && validInfoDTO.maritalStatuss.length>0)?validInfoDTO.maritalStatuss.map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            }):<option data-name="">请选择</option>
                                        }
                                    </select>
                                </dd>
                                <dt>子女情况</dt>
                                <dd className="dd-half">
                                    <select name="" id="haveChild" className="select-gray" data-loop="loop" data-type="select" data-param="haveChild">
                                        <option data-name={validInfoDTO.haveChild?1:0} hidden>{validInfoDTO.haveChild?"有":"无"}</option>
                                        {
                                            [{value:1,name:1,displayName:"有"},{value:0,name:0,displayName:"无"}].map((repy,i)=>{
                                                return <option data-name={repy.name?repy.name:""} key={i}>{commonJs.is_obj_exist(repy.displayName)}</option>
                                            })
                                        }
                                    </select>
                                </dd>
                                <dt></dt>
                                <dd className="dd-half"></dd>
                                <dt>毕业学校</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='graduationSchool' data-loop="loop" data-type="input" data-param="graduationSchool" />
                                    <input placeholder="请输入" type="text" className="input showDom" id='graduationSchool2' value={commonJs.is_obj_exist(validInfoDTO.graduationSchool)}/>
                                </dd>
                                <dt>毕业年份</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='graduationYear' data-loop="loop" data-type="input" data-param="graduationYear" />
                                    <input placeholder="请输入" type="text" className="input showDom" id='graduationYear2' value={commonJs.is_obj_exist(validInfoDTO.graduationYear)}/>
                                </dd>
                                <dt>QQ号</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='qq' data-loop="loop" data-type="input" data-param="qq" onBlur={verifyJs.verify.bind(this,"number","notNull","isNaN","")} />
                                    <input placeholder="请输入" type="text" className="input showDom" id='qq2' value={commonJs.is_obj_exist(validInfoDTO.qq)}/>
                                </dd>
                                <dt>微信号</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='weixin' data-loop="loop" data-type="input" data-param="weixin"  />
                                    <input placeholder="请输入" type="text" className="input showDom" id='weixin2' value={commonJs.is_obj_exist(validInfoDTO.weixin)}/>
                                </dd>
                                <dt>推荐人电话</dt>
                                <dd className="dd-half">
                                    <input placeholder="请输入" type="text" className="input editDom hidden" id='recommendedPhone' data-loop="loop" data-type="input" data-param="recommendedPhone" onBlur={verifyJs.verify.bind(this,"number","allowNull","isNaN","")} />
                                    <input placeholder="请输入" type="text" className="input showDom" id='recommendedPhone2' value={commonJs.phoneReplace(callByTianr,validInfoDTO.recommendedPhone)}/>
                                </dd>
                            </dl>
                            <div className="top-border-2px ast-msg-ctrl clearfix">
                                <button className="btn-blue block mt10 mb10" id='saveStep3' onClick={this.save.bind(this,"/node/saveStep3")}>保存</button>
                            </div>
                        </div>
                    </div>
                    {/*第四步*/}
                    <div className="ast-content bar mt5 hidden step4Content">
                        <dl className="ast-msg top-border-2px">
                            <dt>银行卡号</dt>
                            <dd>
                                <input placeholder="请输入" type="text" className="input bankCardNo editDom hidden" id='bankCardNumber' data-loop="loop" data-type="input" data-param="bankCardNumber" onBlur={verifyJs.verify.bind(this,"bankCard","notNull","isNaN","银行卡号")} />
                                <input placeholder="请输入" type="text" className="input bankCardNo showDom" id='bankCardNumber2' value={commonJs.is_obj_exist(validInfoDTO.bankCardNumber)} />
                            </dd>
                            <dt>银行</dt>
                            <dd className="dd-half">
                                <input placeholder="请输入" type="text" className="input bankCardName editDom hidden" id='bankName' data-loop="loop" data-type="input" data-param="bankName" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")}/>
                                <input placeholder="请输入" type="text" className="input bankCardName showDom" id='bankName2' value={commonJs.is_obj_exist(validInfoDTO.bankName)}/>
                                <input hidden type="text" data-loop="loop" data-type="input" data-param="name" id='bankName3' value={commonJs.is_obj_exist(validInfoDTO.name)}/> {/*接口需要传姓名*/}
                            </dd>
                            <dt>预留手机号码</dt>
                            <dd className="dd-half">
                                <input placeholder="请输入" type="text" className="input left editDom hidden" id='bankReservePhone' data-loop="loop" data-type="input" data-param="bankReservePhone" onBlur={verifyJs.verify.bind(this,"cellPhone","notNull","isNaN","预留手机号码")} />
                                <input placeholder="请输入" type="text" className="input left showDom" id='bankReservePhone2' value={commonJs.phoneReplace(callByTianr,validInfoDTO.bankReservePhone)} />
                                {(validInfoDTO.page && validInfoDTO.page.value==4) ? <a className="phont-btn-user block left ml5 mt2" id='bankReservePhoneCall'  onClick={this.phoneHandle.bind(this,callByTianr,astData.regPhone)}></a> : ""}
                            </dd>
                            <dt>开户地址</dt>
                            <dd>
                                <select name="" id="bankProvinceId" className="select-gray mr10 provinceSelect" data-loop="loop" data-type="select" data-param="bankProvinceId" onChange={this.getCities.bind(this)} onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.bankProvinceId?validInfoDTO.bankProvinceId:""} hidden>{validInfoDTO.bankProvinceId?getAddressByCode.getAddressByCode(validInfoDTO.bankProvinceId):"请选择"}</option>
                                    {
                                        (this.state.allProvince.length>0) ? this.state.allProvince.map((repy,i)=>{
                                            return <option data-name={commonJs.is_obj_exist(repy.code)} key={i}>{commonJs.is_obj_exist(repy.name)}</option>
                                        }):<option  data-name="" hidden>省份</option>
                                    }
                                </select>
                                <select name="" id="bankCityId" className="select-gray select-city mr10 citySelect" data-loop="loop" data-type="select" data-param="bankCityId" onChange={this.getDistricts.bind(this)} onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.bankCityId?validInfoDTO.bankCityId:""} hidden>{validInfoDTO.bankCityId?getAddressByCode.getAddressByCode(validInfoDTO.bankCityId):"请选择"}</option>
                                </select>
                                <select name="" id="bankDistrictId" className="select-gray select-district districtSelect" data-loop="loop" data-type="select" data-param="bankDistrictId" onBlur={verifyJs.verifyS.bind(this)}>
                                    <option  data-name={validInfoDTO.bankDistrictId?validInfoDTO.bankDistrictId:""} hidden>{validInfoDTO.bankDistrictId?getAddressByCode.getAddressByCode(validInfoDTO.bankDistrictId):"请选择"}</option>
                                </select>
                            </dd>
                            <dt>开户支行</dt>
                            <dd>
                                <input placeholder="请输入" type="text" className="input editDom hidden" id='bankBranch' data-loop="loop" data-type="input" data-param="bankBranch" onBlur={verifyJs.verify.bind(this,"auto","notNull","auto","")}/>
                                <input placeholder="请输入" type="text" className="input showDom" id='bankBranch2' value={commonJs.is_obj_exist(validInfoDTO.bankBranch)}/>
                            </dd>
                        </dl>
                        <div className="top-border-2px ast-msg-ctrl clearfix">
                            <button className="btn-blue block mt10 mb10" id='saveStep4' onClick={this.save.bind(this,"/node/saveStep4")}>保存</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default AstSteps;  //ES6语法，导出模块