// 借款凭证下载
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import FileUpload from 'react-fileupload';

import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class VoucherDownload extends React.Component{
    constructor(props){
        super(props);
        this.ChannelStore=this.props.allStore.ChannelStore;
        this.state={
            
        }
    }

    // 上传成功
    _handleUploadSuccess(obj) {
        let _data=cpCommonJs.opinitionObj(obj.data);
        console.log('executedsuccess',_data)
        if(typeof(_data.executed)!=undefined && _data.executed==false){
            alert(_data.message);
            return;
        }
        window.open('/node/file/down/certificates');
    }
    // 上传失败
    _handleUploadFailed(err) {
        alert(err.message?err.message:'上传失败！');
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
    render() {
        let uploadOptions={
            baseUrl: '/cpQueue/file/upload/excl',
            hrearder:{ responseType: 'blob' },
            multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
            fileFieldName:"ws",
            numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
            accept: 'excel,xlsx',  //限制选择文件的类型（后缀）
            chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
            wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
            beforeUpload: this._checkUploadImg.bind(this),  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
            uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
            uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
            uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
        }
        return (
            <div className='bar pl20 pt10 pb5'>
                <FileUpload options={uploadOptions} ref="fileUpload">
                    <a className="left btn-blue block" id='uploadLown' ref="chooseAndUpload">上传Excel</a>
                </FileUpload>
            </div>
        )
    }
};
export default VoucherDownload;  //ES6语法，导出模块