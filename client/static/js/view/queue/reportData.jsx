// 数据上传
import React from 'react';
import $ from 'jquery';
import FileUpload from 'react-fileupload';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class ReportData extends React.Component{
    constructor(props){
        super(props);
        this.state={
            fileTypeAlchemistEnum:[],
            filetype_selected:"",
            modelType:0
        }
    }
    componentDidMount(){
        var _that=this;
        commonJs.reloadRules();
        this.getUploadFileType();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }
    getUploadFileType(){
        let that=this;
        $.ajax({
            type:"get",
            url:"/node/getUploadFileType",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                that.setState({
                    fileTypeAlchemistEnum:_getData.fileTypeAlchemistEnum?_getData.fileTypeAlchemistEnum:[]
                })
            }
        })
    }
    
    // 上传成功
    _handleUploadSuccess(obj) {
        let _data=obj.data?obj.data:{};
        alert(_data.message);
    }
    // 上传失败
    _handleUploadFailed(err) {
        let _data=err.data?err.data:{};
        alert(_data.message);
    }
    // 文件类型切换
    filetypeHandle(event){
        let _name=$(event.target).find("option:selected").attr("name");
        let _display=$(event.target).find("option:selected").text();
        this.setState({
            filetype_selected:_name,
            filetype_display:_display
        })
    }
    //
    _handleUploading(progress, mill){
        // let loading_html='<div id="loading">'+
        //     '<div class="tanc_bg"></div>'+
        //     '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
        // '</div>';
        // $("body").append(loading_html);
        // if(progress.currentTarget.status && progress.currentTarget.status==200){
        //     $("#loading").remove();
        // }
    }
    
    //操作状态
    statusHandle(event){
        let _name=$(event.target).find("option:selected").attr("value");
        if(_name==3){
            $(".modelType").removeClass("hidden");
        }else{
            $(".modelType").addClass("hidden");
            $(".modelType option").removeProp("selected");
            $(".modelType option[data-id]").prop("selected","selected");
            this.setState({
                modelType:0
            })
        }
        this.setState({
            operatorStatus_selected:_name
        })
    }
    //操作状态选择删除时，必填项
    modelTypeHandle(event){
        let _name=$(event.target).find("option:selected").attr("value");
        this.setState({
            modelType:_name
        })
    }
    //
    _beforeChoose(){
        let _parems={};
        if(!this.state.filetype_selected){
            alert("请选择文件类型！");
            return false;
        }
        if(!this.state.operatorStatus_selected){
            alert("请选择操作状态！");
            return false;
        }
        _parems.fileType=this.state.filetype_selected;
        _parems.operatorStatus=this.state.operatorStatus_selected;
        if(this.state.operatorStatus_selected==3 && this.state.modelType==0){
            alert("请选择状态！");
            return false;
        }
        _parems.modelType=this.state.modelType;
        let filetype_display=this.state.filetype_display;
        let rem=confirm("确定上传文件类型是"+filetype_display+"?");
        if(!rem){
            return false;
        }
        this.setState({
            _parems:_parems   //接口请求参数
        })
        return true;
    }
    _checkUploadImg(files, mill) {
        const { formState } = this.props,
        stateRawID = this.props.formState.rawIDs,
          formRawIDs = formState.rawIDs && formState.rawIDs.value ? JSON.parse(formState.rawIDs.value) : [],
          attachment = {},
          errorMsg = {
            size:{
              desc: '暂不支持上传超过20Mb的附件',
              names: []
            },
            ext:{
              desc: '不支持的文件后缀',
              names: []
            }
          }
        let canUpload = true
      
        Object.keys(files).forEach(key => {
          /*部分浏览器会keys到length属性。如果要彻底避免需要用for*/
          if(key === 'length') return
          const file = files[key],
            dataUrl = window.URL.createObjectURL(file),
            rawID = this._addRawID(file),
            { name, size, lastModified } = file
      
          /*检查文件大小是否超过20M*/
          if( size > (20 * 1024 * 1024) ) return errorMsg.size.names.push(name)
          /*检查文件后缀*/
          if(!isImg(name)) return errorMsg.ext.names.push(name)
      
          /*检查formState中是否已有此图片*/
          formRawIDs.includes(rawID) ?
            message.info(`您已经选择过${name}`,2500) :
            /*不保存整个真实文件。仅保存文件属性*/
            attachment[rawID] = {
              name,
              size,
              lastModified,
              rawID,
              dataUrl,
              mill
            }
        })
      
        /*本次选择文件的rawIDs数组*/
        const rawIDs = Object.keys(attachment)
      
        !rawIDs.length && ( canUpload = false )
      
        const msgStr = this._packErrorMessage(errorMsg)
        msgStr.length && message.error(msgStr)
      
        !Object.keys(attachment).length && (canUpload = false)
      
        /*满足上传返回true进行上传，否则为false*/
        return canUpload
      }
    render() {
        let fileOption={
            uploadOptions:{
                baseUrl: '/Qport/alchemist',
                param:this.state._parems,
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 1,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: '*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: function (files,mill) {
                    console.log(files[0].size)
                    console.log(files[0].size < 20 * 1024 * 1024)
                            if (files[0].size < 20 * 1024 * 1024) {
                                files[0].mill = mill
                                return true;
                            } else {
                                alert("上传文件不能超过20M！");
                                return false;
                            };
                        },  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                beforeChoose:this._beforeChoose.bind(this),  //在用户点击选择按钮后，进行选择文件之前执行，返回true继续，false阻止用户选择
                uploading: this._handleUploading.bind(this),    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto dU-condi pl20 pb10">
                    <div className="left mt15">类型：</div>
                    <select name="" id="filetype" className="select-gray filetype mt10 mr10 left" onChange={this.filetypeHandle.bind(this)} style={{"width":"100px"}}>
                        <option value="" hidden>请选择</option>
                        {
                            this.state.fileTypeAlchemistEnum.length>0 ? this.state.fileTypeAlchemistEnum.map((repy,i)=>{
                                return <option key={i} value={commonJs.is_obj_exist(repy.value)} name={commonJs.is_obj_exist(repy.name)}>{commonJs.is_obj_exist(repy.displayName)}</option>
                            }):<option value="">全部</option>
                        }
                    </select>
                    <div className="left mt15">操作状态：</div>
                    <select name="" id="filetype" className="select-gray filetype mt10 mr10 left" onChange={this.statusHandle.bind(this)} style={{"width":"100px"}}>
                        <option value="" hidden>请选择</option>
                        <option value="1">新增</option>
                        <option value="2">修改</option>
                        <option value="3">删除</option>
                    </select>
                    <select name="" id="modelType" className="select-gray mt10 mr10 left modelType hidden" onChange={this.modelTypeHandle.bind(this)} style={{"width":"100px"}}>
                        <option value="0" data-id="0" hidden>请选择</option>
                        <option value="1">本地模板</option>
                        <option value="2">金融办模板</option>
                    </select>
                    <div className="left mt10 mr10">
                        <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                        <a className="left btn-blue block" ref="chooseAndUpload" id='alchemist'>上传</a>
                        </FileUpload>
                    </div>
                </div>
            </div>
        )
    }
};

export default ReportData;  //ES6语法，导出模块