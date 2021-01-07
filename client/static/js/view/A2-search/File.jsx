// 附件
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import UpLoadFile from '../A2-module/upLoadFile';
import FileUpload from 'react-fileupload';
import GetByType from '../../source/common/getByType';    //根据文件类型获取文件 公共请求js
var newGetByType=new GetByType();
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class File extends React.Component {
    constructor(props){
        super(props);
        this.userInfo2AStore=this.props.allStore.UserInfo2AStore;  //2A PORTAL用户详情-UserMsg组件信息
        this.acountBarStore=this.props.allStore.AcountBarStore;  //2A PORTAL用户详情-UserMsg组件信息 
        this.state={
            isLivingIdenty:"no",  //标识当前展开是否是 活体识别
            identyFileType:"identification_card_front", //上传文件接口需要传入的文件类型 身份证正面
            workFileType:"proof_of_work", //工作证明
            liveFileType:"proof_of_house",  //居住证明
            bankFileType:"bank_statement",  //银行流水
            phoneFileType:"phone_statement",  //电话清单
            creditFileType:"",  //征信  || 债权转移 || 场景文件
            pactFileType:"proof_of_contact",  //合同证明
            houseFileType:"certificate_of_house_property",  //房产证明
            carFileType:"proof_of_car",  //购车证明
            otherFileType:"others",  //其他
            loanFileType:"proof_of_loan_purpose",  //贷款用途凭证
            files:{},  //身份证数据集合
            file_list_data:{},   //征信展示数据
            current:0,        //初始化旋转角度
            selectedIndex:0,  //预览-调起预览模块时图片的下标
            currentType:"",   //预览大图时对应的图片类型--用于切换上下张时获取数据
            fileUpdateTime:{},   //附件更新时间
            fileTitIndex:0
        }
    }
    // identification_card_front( "identification_card_front",true, "身份证正面",true ), 
    // identification_card_back( "identification_card_back",true, "身份证反面",true ), 
    // identification_card_withHead( "identification_card_withHead",true, "手持身份证",true ), 
    // face_recognition( "face_recognition",true, "人脸识别",true ), 

    //upLoadFile组件上传文件后获取data
    identyData(_type,_files){
        let _obj=this.state.files;
        _obj[_type]=_files;
        this.setState({
            files:_obj
        })
    }
    setIncline(index,type){
        this.setState({
            selectedIndex:index,
            currentType:type
        })
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setState({
            prev_registrationId:nextProps.prev_registrationId,
            prev_customerId:nextProps.prev_customerId
        },()=>{
            this.getUpdateTime();
        })
    }
    componentDidMount(){
        this.getUpdateTime();
        $(".identy-tit").click(function () {
            $(this).next().find(".file-ctrl-div").removeClass("hidden");
        });
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 105);
        }
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
        //*预览大图拖拽功能*/
        var oImg = document.getElementById('oImg');
        addEvent(oImg, 'mousedown', function(ev) {
			var oEvent = prEvent(ev),
			oParent = oImg.parentNode,
			disX = oEvent.clientX - oImg.offsetLeft-400,
			disY = oEvent.clientY - oImg.offsetTop+30,
			startMove = function(ev) {
				if (oParent.setCapture) {
					oParent.setCapture();
				}
				var oEvent = ev || window.event,
				l = oEvent.clientX - disX,
				t = oEvent.clientY - disY;
				oImg.style.left = l +'px';
				oImg.style.top = t +'px';
				oParent.onselectstart = function() {
					return false;
				}
			}, endMove = function(ev) {
				if (oParent.releaseCapture) {
					oParent.releaseCapture();
				}
				oParent.onselectstart = null;
				removeEvent(oParent, 'mousemove', startMove);
				removeEvent(oParent, 'mouseup', endMove);
			};
			addEvent(oParent, 'mousemove', startMove);
			addEvent(oParent, 'mouseup', endMove);
			return false;
		});
        /*以鼠标位置为中心的滑轮放大功能*/
        addWheelEvent(oImg, function(delta) {
			var ratioL = (this.clientX - oImg.offsetLeft) / oImg.offsetWidth,
			ratioT = (this.clientY - oImg.offsetTop) / oImg.offsetHeight,
			ratioDelta = !delta ? 1 + 0.1 : 1 - 0.1,
			w = parseInt(oImg.offsetWidth * ratioDelta),
			h = parseInt(oImg.offsetHeight * ratioDelta),
			l = Math.round(this.clientX - (w * ratioL-400)),
			t = Math.round(this.clientY - (h * ratioT+30));
            oImg.style.width = w +'px';
            // oImg.style.height = h +'px';
            oImg.style.left = l +'px';
            oImg.style.top = t +'px';
		});
    }
    //获取文件类型更新时间
    getUpdateTime(){
        var _that=this;
        let _registrationId=this.userInfo2AStore.userInfo.registrationId;
        if(!_registrationId){
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/getUpdateTime",
            async:false,
            dataType: "JSON",
            data:{"registrationId":_registrationId},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                let _fileUpDateTime={};
                _fileUpDateTime["identification_card"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"identification_card");
                _fileUpDateTime["proof_of_work"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_work");
                _fileUpDateTime["proof_of_house"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_house");
                _fileUpDateTime["bank_statement"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"bank_statement");
                _fileUpDateTime["phone_statement"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"phone_statement");
                _fileUpDateTime["proof_of_credit"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_credit");
                _fileUpDateTime["proof_of_debenture_transfer"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_debenture_transfer");
                _fileUpDateTime["proof_of_contact"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_contact");
                _fileUpDateTime["certificate_of_house_property"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"certificate_of_house_property");
                _fileUpDateTime["proof_of_car"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_car");
                _fileUpDateTime["proof_of_scene"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_scene");
                _fileUpDateTime["others"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"others");
                _fileUpDateTime["proof_of_loan_purpose"]=_that.getTimeData(_getData.fileSystemInfoDTOs,"proof_of_loan_purpose");
                _that.setState({
                    fileUpdateTime:_fileUpDateTime
                })
            }
        })
    }
    //根据文件类型返回需要的更新时间
    getTimeData(data,type){
        let fileTime="";
        if(type=="identification_card"){
            for (let i = 0; i < data.length; ++i) {
                let _type=data[i].fileType.name;
                if(_type=="identification_card_front" || _type=="identification_card_back" || _type=="identification_card_withHead" || _type=="face_recognition"){
                    fileTime=data[i].updatedAt;
                    break;
                }
            }
        }else{
            for (let i = 0; i < data.length; ++i) {
                let _type=data[i].fileType.name;
                if(_type==type){
                    fileTime=data[i].updatedAt;
                    break;
                }
            }
        }
        return fileTime;
    }
    getMsg(){}
    // 根据文件类型获取文件 并且 点击展开
    getfileMsg(_registrationId,_fileType,even){
        commonJs.content_toggle(even);
        let _fileTitIndex=$(even.target).closest(".toggle-box").index();  //当前展开的文件类型序号，供拖拽js用

        let fileInfos=newGetByType.getByType(_registrationId,_fileType);
        let _obj=this.state.files;
        if(fileInfos){
            _obj[_fileType]=fileInfos;
        }
        this.setState({
            files:_obj,
            fileTitIndex:_fileTitIndex,
            isLivingIdenty:"no"  //标识当前展开是否是 活体识别 
        })
    }

    //身份证明 正面、反面、手持、人脸识别 切换
    identyTab(type,index,_registrationId,_fileType,even){
        let _fileTitIndex=$(even.target).closest(".auto-box").index();  //当前展开的文件类型序号，供拖拽js用
        $(".file-tab li").removeClass("blue-font");
        $(".file-tab li").eq(index).addClass("blue-font");
        let fileInfos=newGetByType.getByType(_registrationId,_fileType);//根据文件类型获取文件
        let _obj=this.state.files;
        if(fileInfos){
            _obj[_fileType]=fileInfos;
        }
        this.setState({
            files:_obj,
            identyFileType:type,
            fileTitIndex:_fileTitIndex
        })
    }
    // 征信上传成功
    _handleUploadSuccess() {
        alert("上传成功");
        let fileInfos=newGetByType.getByType(this.userInfo2AStore.userInfo.registrationId,this.state.creditFileType);
        let _file_list_data={};
        _file_list_data[this.state.creditFileType]=fileInfos;
        this.setState({
            file_list_data:_file_list_data
        },()=>{
            this.getUpdateTime();
        })
    }
    //征信 || 债权 || 场景文件 请求数据
    getMsg_zx(type,event){
        let $this=$(event.target);
        let zxCont=$this.closest(".toggle-box");
        if(zxCont.find(".zx-cont").hasClass("hidden")){
            zxCont.find(".zx-cont").removeClass("hidden");
            let _registrationId=this.userInfo2AStore.userInfo.registrationId;
            let fileInfos=newGetByType.getByType(_registrationId,type);
            let _file_list_data={};
            _file_list_data[type]=fileInfos;
            this.setState({
                file_list_data:_file_list_data,
                creditFileType:type
            })
        }else{
            zxCont.find(".zx-cont").addClass("hidden");
        }
    }
    //获取活体识别图片
    getLivingIdenty(even){
        let that=this;
        commonJs.content_toggle(even);
        let _fileTitIndex=$(even.target).closest(".toggle-box").index();  //当前展开的文件类型序号，供拖拽js用
        $.ajax({
            type:"post",
            url:"/node/getLivingIdenty",
            async:false,
            dataType: "JSON",
            data:{
                customerId:this.userInfo2AStore.customerId
            },
            success:function(res) {
                if (res.code != 1) {
                    alert(res.msg);
                    return;
                }
                if (res.code && res.code == -2) {
                    alert("无法连接服务器");
                    return;
                }
                that.setState({
                    livingIdentyFiles:res.data.fileSystemInfoDTOs?res.data.fileSystemInfoDTOs:[],
                    livingFilesTime:res.data.fileSystemInfoDTOs?res.data.fileSystemInfoDTOs[0].createdAt:"",
                    isLivingIdenty:"yes"
                })
            }
        })
    }
    //初始化大图角度
    initBigImgDeg(){
        $(".img-popup").css({
            "transform":'rotate(0deg)',
            "-ms-transform":'rotate(0deg)', /* Internet Explorer */
            "-moz-transform":'rotate(0deg)', /* Firefox */
            "-webkit-transform":'rotate(0deg)', /* Safari 和 Chrome */
            "-o-transform":'rotate(0deg)', /* Opera */
        });
    }
    //上一张
    prevImg(){
        this.initBigImgDeg();
        let now_index = this.state.selectedIndex;
        now_index = parseInt(now_index);
        let _currentType=this.state.currentType;
        let files=[];
        if(this.state.isLivingIdenty=="yes"){
            files=this.state.livingIdentyFiles
        }else{
            files=this.state.files[_currentType];
        }
        let fileLength = files.length;
        now_index-=1;
        if(now_index<0){
            now_index = fileLength-1;
        }
        let fileId="";
        if(this.state.isLivingIdenty=="yes"){
            fileId=files[now_index].id
        }else{
            fileId=files[now_index].fileId
        }
        $(".img-popup").attr("src","/node/view/file?fileId="+fileId);
        this.setState({
            selectedIndex:now_index,
            current:0
        })
    }
    
    //下一张
    nextImg(){
        this.initBigImgDeg();
        let now_index = this.state.selectedIndex;
        now_index = parseInt(now_index);
        let _currentType=this.state.currentType;
        let files=[];
        if(this.state.isLivingIdenty=="yes"){
            files=this.state.livingIdentyFiles
        }else{
            files=this.state.files[_currentType];
        }
        let fileLength = files.length;
        if(now_index>=fileLength-1){
            now_index = -1;
        }
        now_index+=1;
        let fileId="";
        if(this.state.isLivingIdenty=="yes"){
            fileId=files[now_index].id
        }else{
            fileId=files[now_index].fileId
        }
        $(".img-popup").attr("src","/node/view/file?fileId="+fileId);
        this.setState({
            selectedIndex:now_index,
            current:0
        })
    }
    //图片旋转
    imgTranform(){
        this.setState({
            current:this.state.current+=1
        },()=>{
            $(".img-popup").css({
                "transform":'rotate('+this.state.current*90+'deg)',
                "-ms-transform":'rotate('+this.state.current*90+'deg)', /* Internet Explorer */
                "-moz-transform":'rotate('+this.state.current*90+'deg)', /* Firefox */
                "-webkit-transform":'rotate('+this.state.current*90+'deg)', /* Safari 和 Chrome */
                "-o-transform":'rotate('+this.state.current*90+'deg)', /* Opera */
            });
        })        
    }
    //关闭大图
    closeImgPop(){
        $(".bigImgPopup").addClass("hidden");
        $(".img-popup").attr("src","")
        this.setState({
            current:0
        })
    }
    render() {
        let _registrationId=this.userInfo2AStore.userInfo.registrationId;
        let _loanNumber=this.acountBarStore.currentLoanNumber;
        let _mobileNo=this.userInfo2AStore.userInfo.primaryPhone;
        let fileOption={
            uploadOptions:{
                baseUrl: '/common/upLoadFile',
                param: {
                    registrationId: _registrationId,
                    loanNumber: _loanNumber,
                    fileType:this.state.creditFileType,
                    mobileNo:_mobileNo
                },
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 3,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: '*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed,  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div className="auto-box pr5">
                <div className="toggle-box mt5">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit identy-tit" id='identyFileTypeTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.identyFileType)}>
                        <span className="left file-type-tit">身份证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.identification_card)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="file-toggle-div hidden">
                        <ul className="mt5 border-top-left-radius border-top-right-radius file-tab">
                            <li className="blue-font" onClick={this.identyTab.bind(this,"identification_card_front",0,_registrationId,"identification_card_front")}>正面</li>
                            <li onClick={this.identyTab.bind(this,"identification_card_back",1,_registrationId,"identification_card_back")}>反面</li>
                            <li onClick={this.identyTab.bind(this,"identification_card_withHead",2,_registrationId,"identification_card_withHead")}>手持</li>
                            <li onClick={this.identyTab.bind(this,"face_recognition",3,_registrationId,"face_recognition")}>人脸识别</li>
                        </ul>
                        <UpLoadFile 
                            _identyData={this.identyData.bind(this)} 
                            prev_registrationId={_registrationId} 
                            prev_loanNumber={_loanNumber} 
                            _fileType={this.state.identyFileType} 
                            _fileInfo={this.state.files[this.state.identyFileType]} 
                            _setIncline={this.setIncline.bind(this)} 
                            _getUpdateTime={this.getUpdateTime.bind(this)} 
                            _fileTitIndex={this.state.fileTitIndex}
                        />
                    </div>
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='livingFilesTit' onClick={this.getLivingIdenty.bind(this)}>
                        <span className="left file-type-tit">活体识别</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.livingFilesTime)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _fileInfo={this.state.livingIdentyFiles} fileTag="liningIdenty" />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='workFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.workFileType)}>
                        <span className="left file-type-tit">工作证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_work)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.workFileType} _fileInfo={this.state.files.proof_of_work} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this) } />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='liveFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.liveFileType)}>
                        <span className="left file-type-tit">居住证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_house)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile 
                        _identyData={this.identyData.bind(this)} 
                        prev_registrationId={_registrationId} 
                        prev_loanNumber={_loanNumber} 
                        _fileType={this.state.liveFileType} 
                        _fileInfo={this.state.files.proof_of_house} 
                        _setIncline={this.setIncline.bind(this)} 
                        _getUpdateTime={this.getUpdateTime.bind(this)}
                        _fileTitIndex={this.state.fileTitIndex}
                     />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='bankFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.bankFileType)}>
                        <span className="left file-type-tit">银行流水</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.bank_statement)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.bankFileType} _fileInfo={this.state.files.bank_statement} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='phoneFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.phoneFileType)}>
                        <span className="left file-type-tit">电话清单</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.phone_statement)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.phoneFileType} _fileInfo={this.state.files.phone_statement} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit proof_of_credit" id='proofFileTit' onClick={this.getMsg_zx.bind(this,"proof_of_credit")}>
                        <span className="left file-type-tit">征信</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_credit)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="">
                        <div className="foo"></div>
                        <div className="bar-btn block mt5 upFile_zx hidden zx-cont no-pointer">
                            <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                <span className="pointer" ref="chooseAndUpload" id='upFile_zx_upload'>+&nbsp;添加文件</span>
                            </FileUpload>
                        </div>               
                        <div className="bar mt2 hidden zx-cont">
                            <table cellPadding={0} cellSpacing={0} frameBorder="0" width="100%" className="credit-table">
                                <tbody>
                                <tr>
                                    <th width="40%">文件名称</th>
                                    <th width="40%">上传时间</th>
                                    <th width="10%"></th>
                                    <th width="10%"></th>
                                </tr>
                                {
                                    (this.state.file_list_data["proof_of_credit"] && this.state.file_list_data["proof_of_credit"].length>0) ? this.state.file_list_data["proof_of_credit"].map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.fileName:""}</td>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.updatedAt:""}</td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/view/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""} target="_blank">查看</a></td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/down/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""}>下载</a></td>
                                                </tr>
                                    }):<tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit proof_of_debenture_transfer" id='proofDebentureFileTit' onClick={this.getMsg_zx.bind(this,"proof_of_debenture_transfer")}>
                        <span className="left file-type-tit">债权转移</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_debenture_transfer)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="">
                        <div className="foo"></div>
                        <div className="bar-btn block mt5 upFile_zx hidden zx-cont no-pointer">
                            <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                <span className="pointer" ref="chooseAndUpload" id='upFile_zx_upload2'>+&nbsp;添加文件</span>
                            </FileUpload>
                        </div>               
                        <div className="bar mt2 hidden zx-cont">
                            <table cellPadding={0} cellSpacing={0} frameBorder="0" width="100%" className="credit-table">
                                <tbody>
                                <tr>
                                    <th width="40%">文件名称</th>
                                    <th width="40%">上传时间</th>
                                    <th width="10%"></th>
                                    <th width="10%"></th>
                                </tr>
                                {
                                    (this.state.file_list_data["proof_of_debenture_transfer"] && this.state.file_list_data["proof_of_debenture_transfer"].length>0) ? this.state.file_list_data["proof_of_debenture_transfer"].map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.fileName:""}</td>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.updatedAt:""}</td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/view/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""} target="_blank">查看</a></td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/down/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""}>下载</a></td>
                                                </tr>
                                    }):<tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="toggle-box mt10">
                    <h2 className="bar clearfix bar-tit pl20 pr20 toggle-tit proof_of_debenture_transfer" id='proof_of_scene_tit' onClick={this.getMsg_zx.bind(this,"proof_of_scene")}>
                        <span className="left file-type-tit">场景文件</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_scene)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <div className="">
                        <div className="foo"></div>
                        <div className="bar-btn block mt5 upFile_zx hidden zx-cont no-pointer">
                            <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                                <span className="pointer" ref="chooseAndUpload" id='proof_of_scene_upload'>+&nbsp;添加文件</span>
                            </FileUpload>
                        </div>               
                        <div className="bar mt2 hidden zx-cont">
                            <table cellPadding={0} cellSpacing={0} frameBorder="0" width="100%" className="credit-table">
                                <tbody>
                                <tr>
                                    <th width="40%">文件名称</th>
                                    <th width="40%">上传时间</th>
                                    <th width="10%"></th>
                                    <th width="10%"></th>
                                </tr>
                                {
                                    (this.state.file_list_data["proof_of_scene"] && this.state.file_list_data["proof_of_scene"].length>0) ? this.state.file_list_data["proof_of_scene"].map((repy,i)=>{
                                        return <tr key={i}>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.fileName:""}</td>
                                                    <td>{repy.fileSystemInfoDTO?repy.fileSystemInfoDTO.updatedAt:""}</td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/view/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""} target="_blank">查看</a></td>
                                                    <td><a href={repy.fileSystemInfoDTO?("/node/down/file?fileId="+repy.fileId+"&filename="+repy.fileSystemInfoDTO.fileName):""}>下载</a></td>
                                                </tr>
                                    }):<tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='pactFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.pactFileType)}>
                        <span className="left file-type-tit">合同证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_contact)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.pactFileType} _fileInfo={this.state.files.proof_of_contact} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='houseFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.houseFileType)}>
                        <span className="left file-type-tit">房产证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.certificate_of_house_property)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.houseFileType} _fileInfo={this.state.files.certificate_of_house_property} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='carFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.carFileType)}>
                        <span className="left file-type-tit">购车证明</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_car)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.carFileType} _fileInfo={this.state.files.proof_of_car} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='otherFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.otherFileType)}>
                        <span className="left file-type-tit">其他</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.others)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.otherFileType} _fileInfo={this.state.files.others} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='loanFileTit' onClick={this.getfileMsg.bind(this,_registrationId,this.state.loanFileType)}>
                        <span className="left file-type-tit">贷款用途凭证</span>
                        <span className="left fileUpdataTime">最近更新时间：{commonJs.is_obj_exist(this.state.fileUpdateTime.proof_of_loan_purpose)}</span>
                        <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                    </h2>
                    <UpLoadFile _identyData={this.identyData.bind(this)} prev_registrationId={_registrationId} prev_loanNumber={_loanNumber} _fileType={this.state.loanFileType} _fileInfo={this.state.files.proof_of_loan_purpose} _setIncline={this.setIncline.bind(this)} _getUpdateTime={this.getUpdateTime.bind(this)} _fileTitIndex={this.state.fileTitIndex} />
                </div>
                {/*大图弹窗*/}
                <div className="tanc_bg align-center bigImgPopup hidden">
                    <img src="" data-fileId="" className="img-popup" id="oImg" onContextMenu={commonJs.rigmouseh.bind(this)} />
                    <div className="clearfix"></div>
                    <div className="img-ctrl">
                        <i className="prev-img img-ctrl-icon mr10" id='prevImg' title="上一张" onClick={this.prevImg.bind(this)}></i>
                        <i className="next-img img-ctrl-icon mr10" id='nextImg' title="下一张" onClick={this.nextImg.bind(this)}></i>
                        <i className="transform-img img-ctrl-icon mr10" id='imgTranform' title="旋转" onClick={this.imgTranform.bind(this)}></i>
                        <i className="close-img img-ctrl-icon" title="关闭" id='closeImgPop' onClick={this.closeImgPop.bind(this)}></i>
                    </div>
                </div>
                {/*大图弹窗 end*/}
            </div>
        );
    }
};
/*绑定事件*/
function addEvent(obj, sType, fn) {
	if (obj.addEventListener) {
		obj.addEventListener(sType, fn, false);
	} else {
		obj.attachEvent('on' + sType, fn);
	}
};
function removeEvent(obj, sType, fn) {
	if (obj.removeEventListener) {
		obj.removeEventListener(sType, fn, false);
	} else {
		obj.detachEvent('on' + sType, fn);
	}
};
function prEvent(ev) {
	var oEvent = ev || window.event;
	if (oEvent.preventDefault) {
		oEvent.preventDefault();
	}
	return oEvent;
}
/*添加滑轮事件*/
function addWheelEvent(obj, callback) {
	if (window.navigator.userAgent.toLowerCase().indexOf('firefox') != -1) {
		addEvent(obj, 'DOMMouseScroll', wheel);
	} else {
		addEvent(obj, 'mousewheel', wheel);
	}
	function wheel(ev) {
		var oEvent = prEvent(ev),
		delta = oEvent.detail ? oEvent.detail > 0 : oEvent.wheelDelta < 0;
		callback && callback.call(oEvent, delta);
		return false;
	}
};
export default File;