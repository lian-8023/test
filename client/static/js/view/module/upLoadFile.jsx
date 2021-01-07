import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import FileUpload from 'react-fileupload';
import Sortable from "../../source/Sortable.min.js"; //鼠标拖动效果js包
import GetByType from '../../source/common/getByType.js';    //根据文件类型获取文件 公共请求js
var newGetByType=new GetByType();
import CommonJs from '../../source/common/common.js';
var commonJs=new CommonJs;

class UpLoadFile extends React.Component {
    constructor(props){
        super(props);
        this.state={
            _refresh:"false",
            get_fileInfo:this.props._fileInfo,
            bigImgSrc:[],     //大图地址列表
            fileTag:this.props.fileTag,
            dragVessel:this.props._fileTitIndex  //当前需要图片拖拽排序功能的dom序号
        }
    }
    
    UNSAFE_componentWillReceiveProps(nextProps){
        if(typeof(nextProps._fileTitIndex)=="undefined"){
            return;
        }
        this.setState({
            get_fileInfo:nextProps._fileInfo,
            dragVessel:nextProps._fileTitIndex,
            fileTag:nextProps.fileTag  //活体识别 图片展示不需要删除和移动按钮
        },()=>{
            // this.drag();
        })
    }

    componentDidMount (){
        let that=this;
        $(".add-file-btn").parent().addClass("left");
        //点击页面隐藏 移动附件 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='changeFileType_ico') { 
                    return; 
                } 
                if($(elem).closest(".changeFileType_prop").length>0){
                    return;
                }
            elem = elem.parentNode; 
            }
            $(".changeFileType_prop").addClass("hidden");
        });
        // that.drag();
    }
    // 移动附件
    moveFile(event){
        let $this=$(event.target);
        let isShow=$this.next().hasClass("hidden");
        if(isShow){
            $this.next().removeClass("hidden");
        }else {
            $this.next().addClass("hidden");
        }
    }
    drag(){
        //拖拽排序
        let that=this;
        var drag_n=this.state.dragVessel;
        if(typeof(drag_n)=="undefined"){
            return;
        }
		Sortable.create($('.foo')[drag_n], {
			group: "img",
			animation: 150,
			store: {
				get: function (sortable) {
					var order = localStorage.getItem(sortable.options.group);
					return order ? order.split('|') : [];
				},
				set: function (sortable) {
					var order = sortable.toArray();
					localStorage.setItem(sortable.options.group, order.join('|'));
				}
			},
			// onAdd: function (evt){ console.log('onAdd.foo:', [evt.item, evt.from]);},
			// onUpdate: function (evt){ console.log('onUpdate.foo:', [evt.item, evt.from]); },
			// onRemove: function (evt){ console.log('onRemove.foo:', [evt.item, evt.from]); },
			onStart:function(evt){ 
                // console.log('onStart.foo:', [evt.item, evt.from]);
                that.setState({
                    dragStartIndex:$(evt.item).index()
                })
            },
			// onSort:function(evt){ console.log('onStart.foo:', [evt.item, evt.from]);},
			onEnd: function(evt){
                //  console.log('onEnd.foo:', [evt.item, evt.from]);  此处evt.item为<div class="file-box left mr20 relative" draggable="false" style=""><img....
                let current_fileId=$(evt.item).find(".thumbnailIMG").attr("data-fileid");  //当前图片文件唯一标识
                let _prefileid=$(evt.item).find(".thumbnailIMG").attr("data-prefileid");   //当前图片文件对应上一个文件标识
                let _nextfileid=$(evt.item).find(".thumbnailIMG").attr("data-nextfileid");  //当前图片文件对应下一个文件标识
                let _toPreFileId=$(evt.item).prev().find(".thumbnailIMG").attr("data-fileid");  //移动到对应的前一个文件标识,0标识移动到最前面
                let _toNextFileId=$(evt.item).next().find(".thumbnailIMG").attr("data-fileid");  //移动到对应的后一个文件标识，0标识移动到最后面
                let _type=$(evt.item).closest(".foo").attr("data-type");
                that.setState({
                    dragEndIndex:$(evt.item).index()
                })
                if(that.state.dragStartIndex-1==that.state.dragEndIndex){
                    console.log("当前没有移动图片位置！")
                    return;
                }
                $.ajax({
                    type:"get",
                    url:"/node/dragSort",
                    async:true,
                    dataType: "JSON",
                    data:{
                        registrationId:that.props.prev_registrationId,
                        fileType:_type,
                        fileId:current_fileId,
                        preFileId:_prefileid,
                        nextFileId:_nextfileid,
                        toPreFileId:(typeof(_toPreFileId)=="undefined")?0:_toPreFileId,
                        toNextFileId:(typeof(_toNextFileId)=="undefined")?0:_toNextFileId,
                    },
                    success:function(res) {
                        if (!commonJs.ajaxGetCode(res)) {
                            return;
                        }
                        let fileInfos=newGetByType.getByType(that.props.prev_registrationId,that.props._fileType);
                        if(that.props._identyData){
                            that.props._identyData(that.props._fileType,fileInfos)
                        }
                        if(that.props._getUpdateTime){
                            that.props._getUpdateTime();
                        }
                    }
                })
                }
		});
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
    //预览大图
    viewBigImage(e){
        this.initBigImgDeg();
        let _this = $(e.target);
        let _src="";
        let thumbnailIMG_dom=_this.closest(".file-box").find(".thumbnailIMG");
        $(".bigImgPopup").removeClass("hidden");
        _src=thumbnailIMG_dom.attr("data-bigIMGsrc");
        let img_index=thumbnailIMG_dom.attr("data-index");
        if(this.props._setIncline){
            this.props._setIncline(img_index,this.props._fileType);
        }

        var w = document.documentElement.clientWidth;
        var h = document.documentElement.clientHeight;
        $(".img-popup").attr({
            "src":_src
        }).css({
            "left": "50%",
            "top": "20px",
            "width":"800px",
            "margin-left":"-400px",
            "max-width":w-100
        });
    }
    
    // 改变文件类型 move
    changeType(_fileId,_thumId,_fileType,_toFileType,event){
        let _that=this;
        let $this=$(event.target);
        if(_fileType==_toFileType){
            alert("不能移动附件到当前位置！");
            $(".changeFileType_prop").addClass("hidden");
            return;
        }
        $this.closest(".file-box").css("z-index",1000);
        let req_data={
            registrationId:this.props.prev_registrationId,
            fileType:_fileType,
            toFileType:_toFileType,
            fileId:_fileId,
            thumId:_thumId,
            loannumber:this.props.prev_loanNumber
        }
        $.ajax({
            type:"get",
            url:"/common/changeFileType",
            async:true,
            dataType: "JSON",
            data:req_data,
            success:function(res) {
                var commonJs=new CommonJs;
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                var _data = res.data;
                let fileInfos=newGetByType.getByType(_that.props.prev_registrationId,_toFileType);
                let fileInfos_befor=newGetByType.getByType(_that.props.prev_registrationId,_that.props._fileType);

                if(_that.props._identyData){
                    _that.props._identyData(_toFileType,fileInfos)
                    _that.props._identyData(_that.props._fileType,fileInfos_befor)
                }
                $(".ctrl-cont").addClass("hidden");
                if(_that.props._getUpdateTime){
                    _that.props._getUpdateTime();
                }
                alert(_data.message);
            }
        })
    }

    //删除图片
    delFile(_fileId,_thumId,event){
        var sureDel=confirm("确定要删除图片吗？");
        if(!sureDel){
            return;
        }
        let that=this;
        var $this=$(event.target);
        let req_data={
            registrationId:this.props.prev_registrationId,
            fileType:this.props._fileType,
            loannumber:this.props.prev_loanNumber,
            fileId:_fileId,
            thumId:_thumId
        }
        $.ajax({
            type: "get",
            url: "/common/del",
            async: true,
            dataType: "JSON",
            data: req_data,
            success: function (res) {
                if (res.code != 1) {
                    alert(res.msg);
                    return;
                }
                if (res.code && res.code == -2) {
                    alert("无法连接服务器");
                    return;
                }
                var _data = res.data;
                if(_data.executed){
                    // let fileInfos=newGetByType.getByType(that.props.prev_registrationId,that.props._fileType);
                    // that.setState({
                    //     get_fileInfo:fileInfos
                    // })
                    $this.closest(".file-box").addClass("hidden");
                    if(that.props._getUpdateTime){
                        that.props._getUpdateTime();
                    }
                    alert(_data.message);
                    return false;
                }
            }
        })
    }
    
    // 上传成功
    _handleUploadSuccess(obj) {
        let fileInfos=newGetByType.getByType(this.props.prev_registrationId,this.props._fileType);
        if(this.props._identyData){
            this.props._identyData(this.props._fileType,fileInfos)
        }
        if(this.props._getUpdateTime){
            this.props._getUpdateTime();
        }
        alert(obj.data.message);
    }
    // 上传失败
    _handleUploadFailed(err) {
        console.log(err)
    }
    render() {
        let that=this;
        let fileOption={
            uploadOptions:{
                baseUrl: '/common/upLoadFile',
                param: {
                    registrationId: this.props.prev_registrationId,
                    loanNumber: this.props.prev_loanNumber,
                    fileType:this.props._fileType,
                    mobileNo:this.props.prev_userPhoneNo
                },
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 3,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: 'image/*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        let zindex=1000;
        let filemsg=[];
        filemsg=this.props._fileInfo;
        let hasFileInfo=(filemsg && filemsg.length>0);
        let img_index = -1;
        let fileTag=this.state.fileTag;
        let livingIdentyFiles=this.state.livingIdentyFiles;
        return (
            <div className="file-ctrl-div clearfix bar mt5 hidden">
                <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                    {fileTag!="liningIdenty"?<a className="add-file-btn block left mr20 mt15 pointer" id={this.props._fileType+'_upLoad'} ref="chooseAndUpload">+</a>:""}
                    <div className="foo" data-type={this.props._fileType}>
                    {
                        hasFileInfo ? filemsg.map(function (info,index) {
                                img_index+=1;
                                let _thumbnailFileId=info.thumbnailFileId?info.thumbnailFileId:info.fileId;
                                let _typeValue=info.fileType?info.fileType.value:"";
                                let _fileId;
                                if(fileTag!="liningIdenty"){
                                    _fileId=info.fileId;
                                }else{
                                    _fileId=info.id;
                                }
                                return <div key={index} className="file-box left mr20 relative">
                                    <img 
                                        onContextMenu={commonJs.rigmouseh.bind(this)}
                                        src={"/node/view/file?fileId="+(fileTag!="liningIdenty"?_thumbnailFileId:_fileId)} data-index={img_index} 
                                        data-fileId={_fileId} 
                                        data-preFileId={(info.preFileId || info.preFileId==0) ?info.preFileId:""}
                                        data-nextFileId={(info.nextFileId || info.nextFileId==0)?info.nextFileId:""}
                                        data-bigIMGsrc={"/node/view/file?fileId="+_fileId} 
                                        className="thumbnailIMG" 
                                    />
                                    <div className="file-ctrl absolute">
                                        {fileTag!="liningIdenty"?
                                        <div className="ctrl-li">
                                            <i title="移动附件" className="move" id={"changeFileType_ico"+_fileId} onClick={this.moveFile.bind(this)}></i>
                                            <ul className="ctrl-cont absolute hidden changeFileType_prop" id={'changeFileType_prop'+_fileId}>
                                                <li data-toFileType="identification_card_front" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"identification_card_front")}>身份证正面</li>
                                                <li data-toFileType="identification_card_back" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"identification_card_back")}>身份证反面</li>
                                                <li data-toFileType="identification_card_withHead" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"identification_card_withHead")}>手持身份证</li>
                                                <li data-toFileType="proof_of_work" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"proof_of_work")}>工作证明</li>
                                                <li data-toFileType="proof_of_house" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"proof_of_house")}>居住证明</li>
                                                <li data-toFileType="bank_statement" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"bank_statement")}>银行流水</li>
                                                <li data-toFileType="phone_statement" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"phone_statement")}>电话清单</li>
                                                <li data-toFileType="proof_of_credit" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"proof_of_credit")}>征信</li>
                                                <li data-toFileType="proof_of_contact" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"proof_of_contact")}>合同证明</li>
                                                <li data-toFileType="certificate_of_house_property" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"certificate_of_house_property")}>房产证明</li>
                                                <li data-toFileType="proof_of_car" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"proof_of_car")}>购车证明</li>
                                                <li data-toFileType="others" onClick={this.changeType.bind(this,_fileId,_thumbnailFileId,_typeValue,"others")}>其他</li>
                                            </ul>
                                        </div>:""}
                                        <div className="ctrl-li">
                                            <i title="预览大图" className="magnify" id={'magnify'+_fileId} onClick={this.viewBigImage.bind(this)}></i>
                                        </div>
                                        {fileTag!="liningIdenty"?
                                            <div className="ctrl-li">
                                                <i title="删除" className="del" id={'delImg'+_fileId} onClick={this.delFile.bind(this,_fileId,_thumbnailFileId)}></i>
                                            </div>:""}
                                    </div>
                                    <p>{info.updatedAt}</p>
                                </div>
                            },this):""
                    }
                    </div>
                    
                </FileUpload>
                
            </div>
        );
    }
};

export default UpLoadFile;

