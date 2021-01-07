// 外呼短信
import React,{PureComponent} from 'react';
import $ from 'jquery';
import FileUpload from 'react-fileupload';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
class OutboundNotes extends React.Component{
    constructor(props){
        super(props);
        this.state={
            msgTypeList:[],  //短信类型
            sms_content_temp_price:'',//缓存短信内容，支持类型为“逾期客户主动还款”和“正常客户主动还款”，用于动态改变金额
            sms_content_temp:'',//缓存短信内容，支持类型为“逾期客户主动还款”和“正常客户主动还款”
        }
    }
    UNSAFE_componentWillMount(){
        let _that=this;
        $.ajax({
            type:"get",
            url:"/common/getAllSMSTemplate",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                _that.setState({
                    msgTypeList:_getData.templateList
                })
            }
        })
    }
    componentDidMount(){
        let h = document.documentElement.clientHeight;
        $(".content").css({"max-height":h,"overflow":"auto"});
    }
    // 选择类型
    selectMsgType(event){
        $(".sendMsgbtn").removeClass("hidden");
        $(".pay-money-class").addClass("hidden");
        $(".notes-cont").val("");
        let $this=$(event.target);
        let selectedType=$this.find("option:selected").attr("name");
        let _typeList=this.state.msgTypeList;
        for(let i=0;i<_typeList.length;i++){
            if(_typeList[i].name==selectedType){
                var sms_content = _typeList[i].displayName;
                if(selectedType=="OVERDUE" || selectedType=="EARLY_CLEARANCE"){
                    this.state.sms_content_temp = sms_content;
                    $(".pay-money-class").removeClass("hidden");
                    if(selectedType=="OVERDUE"){
                        $(".price_type_label").html("逾期金额:");
                    }else{
                        $(".price_type_label").html("剩余金额:");
                    }
                    // $(".phoneOS").find("option").first().attr("selected", "selected");
                    $(".phoneOS").find("option").removeProp("selected");
                    $(".phoneOS").find("option[value='0']").prop("selected",true);
                    $(".price_type_val").val("");
                }else{
                    $(".notes-cont").val(sms_content);
                }
            }
        }
    }
    //切换系统选项
    selectPhoneOS(event,btnFrom){
        $(".sendMsgbtn").removeClass("hidden");
        let _phoneNo=$(".outbound-notes").find(".phoneNo").val(); //电话号码
        let _smsType=$(".outbound-notes").find(".noteType option:selected").attr("name"); //短信类型
        let phoneOSType=$(".phoneOS").find("option:selected").val();
        let _amont=$(".price_type_val").val();
        if(!_phoneNo || !(/^1\d{10}$/.test(_phoneNo))){
            alert("请输入正确的电话号码！");
            $(".outbound-notes .phoneOS option").removeProp("selected");
            $(".outbound-notes .phoneOS option[value='0']").prop("selected","true");
            $(".outbound-notes .price_type_val").val("");
            return;
        }
        let _getData = this.getByPhone(_phoneNo,phoneOSType,_smsType,_amont,btnFrom);
        if(!_getData){
            $(".price_type_val").val("");
            $(".notes-cont").val("");
            return;
        }
        let sms_content = this.state.sms_content_temp;
        sms_content = sms_content.replace("[userName]",'['+_getData.userName+']');
        sms_content = sms_content.replace("[url]",'['+_getData.url+']');
        if(_smsType=="OVERDUE"){
            if(!_getData.totalAmount||_getData.totalAmount<=0){
                alert("没有逾期信息");
                $(".sendMsgbtn").addClass("hidden");
                return;
            }
            $(".sendMsgbtn").removeClass("hidden");
            sms_content = sms_content.replace("[year]",'['+_getData.year+']');
            sms_content = sms_content.replace("[month]",'['+_getData.month+']');
            sms_content = sms_content.replace("[day]",'['+_getData.day+']');
            this.setState({
                sms_content_temp_price:sms_content
            });
            // this.state.sms_content_temp_price = sms_content;
            sms_content = sms_content.replace("[amount]",'['+_getData.amount+']');
            sms_content = sms_content.replace("[url]",'['+_getData.url+']');
            $(".price_type_val").val(_getData.amount?_getData.amount:"");
            if(!btnFrom){
                $(".price_type_val").attr("max",_getData.totalAmount);
            }
        }else{
            if(!_getData.surplusAmount||_getData.surplusAmount<=0){
                alert("没有需要还款的信息");
                $(".sendMsgbtn").addClass("hidden");
                return false;
            }
            $(".sendMsgbtn").removeClass("hidden");
            this.setState({
                sms_content_temp_price:sms_content
            });
            // this.state.sms_content_temp_price = sms_content;
            sms_content = sms_content.replace("[amount]",'['+_getData.amount+']');
            sms_content = sms_content.replace("[url]",'['+_getData.url+']');
            $(".price_type_val").val(_getData.amount?_getData.amount:"");
            if(!btnFrom){
                $(".price_type_val").attr("max",_getData.surplusAmount);
            }
        }
        $(".notes-cont").val(sms_content);
    }
    /**
     * 
     * @param {*} _phoneNo 电话号码
     * @param {*} _phoneOS 系统
     * @param {*} _smsType 短信类型
     * @param {*} _amont  金额
     * @param {*} btnFrom 调用接口位置  获取金额为false，获取短信内容按钮为true
     */
    getByPhone(_phoneNo,_phoneOS,_smsType,_amont,btnFrom){
        if(btnFrom){
            if(!_phoneNo){
                alert("请输入对方手机号码！")
                return;
            }
            if(_phoneOS=="0"){
                alert("请选择系统！")
                return;
            }
            if(!_smsType){
                alert("请选择短信类型！")
                return;
            }
            if(_amont && !this.price_val_change()){
                return;
            }
        }
        let resdata = null;
        $.ajax({
            type:"post",
            url:"/common/getByPhone",
            async:false,
            data:{
                phone:_phoneNo,
                phoneOS:_phoneOS,
                isOverddue:_smsType=="OVERDUE"?1:0,
                amount:_amont,
                templateEnum:_smsType
            },
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    res= false;
                    return;
                }
                resdata = res.data;
            }
        })
        return resdata;
    }
    //判断金额
    price_val_change(){
        let price_rturn=true;
        let changePrice = $(".price_type_val").val();
        let min = $(".price_type_val").attr("min");
        let max = $(".price_type_val").attr("max");
        min = parseFloat(min);
        max = parseFloat(max);
        changePrice=Number(changePrice);
        if(!changePrice||changePrice<min||changePrice>max||isNaN(changePrice)){
            alert("金额必须在"+min+"和"+max+"之间");
            $(".price_type_val").val(max);
            changePrice = max;
            price_rturn=false;
        }
        let sms_content = this.state.sms_content_temp_price;
        sms_content = sms_content.replace("[amount]",'['+changePrice+']');
        $(".notes-cont").val(sms_content);
        return price_rturn;
    }

    //发送短信
    sendMsg(event){
        let that=this;
        let $this=$(event.target);
        let _data={};
        let _phoneNo=$this.closest(".outbound-notes").find(".phoneNo").val(); //电话号码
        let _smsType=$this.closest(".outbound-notes").find(".noteType option:selected").attr("name"); //短信类型
        let _smsModel=$this.closest(".outbound-notes").find(".notes-cont").val(); //模板内容
        if(!_phoneNo || !(/^1\d{10}$/.test(_phoneNo))){
            alert("请输入正确的电话号码！");
            return;
        }
        if(!_smsType){
            alert("请选择短信类型！");
            return;
        }
        if(!_smsModel){
            alert("短信内容不能为空！");
            return;
        }
        if(_smsModel.length>=300){
            alert("短信内容不能超过300个字符！");
            return;
        }
        _data.primaryPhone=_phoneNo;
        _data.smsType=_smsType;
        _data.templateEnum=_smsType;
        _data.smsModel=_smsModel;
        $.ajax({
            type:"post",
            url:"/common/sendSMS",
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                $(".outbound-notes .msg-type option").removeAttr("selected");
                $(".outbound-notes .msg-type option[value='0']").attr("selected","selected");
                $(".outbound-notes .phoneOS").find("option").removeProp("selected");
                $(".outbound-notes .phoneOS").find("option[value='0']").prop("selected",true);
                $(".outbound-notes .noteType").find("option").removeProp("selected");
                $(".outbound-notes .noteType").find("option[value='0']").prop("selected",true);
                $(".message-cont,.price_type_val,.phoneNo").val("");
            }
        })
    }
    clearOs(){
        $(".outbound-notes .phoneOS option").removeProp("selected");
        $(".outbound-notes .phoneOS option[value='0']").prop("selected","true");
        $(".outbound-notes .price_type_val").val("");
    }
    _handleUploadSuccess(res){
        console.log(res)
        if(res.data.code == "FAILED"){
            alert(res.data.message);
        }else{
            alert(res.data.errorCode.descr);
        }
    }
    _handleUploadFailed(res){
        console.log('失败')
    }

    _handleUploadFailed(res){
        console.log('失败')
    }

    render() {
        let fileOption={
            uploadOptions:{
                baseUrl: '/Qport/uploadExcelSendMsg',
                param: {
                    // channel:this.state.channel_selected
                },
                // multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                // numberLimit: 1,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: '.xls,.xlsx',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div className="content" id="content">
                <div className="bar notes-tip">
                    <b className="left">温馨提示：</b>
                    <div className="left">
                        <p>1.发送短信的号码无限制</p>
                        <p>2.短信模板中的签名【小雨点】，不能随意添加或删除，否则发送失败</p>
                        <p>3.短信模板中的 [ ] 内可以按照模板添加内容，模板其他内容不能更改或删除，否则发送失败</p>
                        <p>4.短信内容不能超过300字，否则发送失败</p>
                    </div>
                </div>
                <div className="bar outbound-notes">
                    <input type="text" className="input left mr10 phoneNo" id='phoneNo' style={{"width":"150px"}} onChange={this.clearOs.bind(this)} placeholder="请输入对方手机号码"/>
                    <select name="" className="select-gray mr10 left noteType" id='noteType' style={{"width":"180px"}} onChange={this.selectMsgType.bind(this)}>
                        <option value="0" name="" hidden>请选择短信类型</option>
                            {
                                (this.state.msgTypeList && this.state.msgTypeList.length>0) ? this.state.msgTypeList.map((repy,i)=>{
                                    return <option value={repy.value} name={repy.name} key={i}>{repy.value}</option>
                                }):<option value="" name="">请选择短信类型</option>
                            }
                    </select>
                    <div className="pay-money-class hidden">
                        <select id="phoneOS" className="select-gray mr10 left phoneOS" style={{"width":"100px"}} onChange={this.selectPhoneOS.bind(this)}>
                            <option value="0" name="" hidden>请选择系统</option>
                            <option value="ANDROID">Android</option>
                            <option value="IOS">IOS</option>
                        </select>
                        <label className="left mr10 price_type_label"></label>
                        <input type="number" className="input left mr10 price_type_val" id='priceTypeVal' min="1" style={{"width":"100px"}} />
                        <button className="btn-blue block" id='selectPhoneOS' onClick={this.selectPhoneOS.bind(this,true)}>获取短信内容</button>
                    </div>
                    <div className="clear"></div>
                    <textarea name="" cols="30" rows="10" id='notesCont' className="notes-cont mt10">
                        
                    </textarea>
                    <button className="btn-blue block mt10 sendMsgbtn" style={{"width":"100%"}} id='sendMsgbtn' onClick={this.sendMsg.bind(this)}>发送短信</button>
                </div>
                <button className="btn-blue mt10 left" style={{marginRight: '1.5%',width: '8.5%'}} onClick={()=>{
                    window.open('node/sms/downExcelSendMsgTemplate');
                }} >下载短信模板</button>
                <FileUpload className="left" options={fileOption.uploadOptions}  style={{"width": "60%"}}  ref="fileUpload">
                    <button ref="chooseAndUpload" className="btn-blue mt10" style={{"width":"100%"}}  >上传模板批量发送短信</button>
                </FileUpload>
            </div>
        );
    }
};

export default OutboundNotes;