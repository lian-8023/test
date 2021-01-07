// 文件盖章
import React from 'react';
import $ from 'jquery';
import { DatePicker,Select,Button } from 'antd'; 
const { Option } = Select;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import FileUpload from 'react-fileupload';
import axios from '../../axios';

import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

// @inject('allStore') @observer
class StampToFile extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false
        }
    }
    _beforeUpload=()=>{
        this.setState({
            loading:true
        })
    }

    // 上传成功
    _handleUploadSuccess(obj) {
        this.setState({
            loading:false
        })
        let _data=obj.data;
        let getData=_data.data
        if(_data.executed){
            window.open(`/node/file/down?fileId=${getData.id}&fileName=${getData.fileName}`);
        }else{
            alert(_data.message);
        }
    }
    // 上传失败
    _handleUploadFailed(err) {
        this.setState({
            loading:false
        })
        console.log(err)
    }
    render() {
        let fileOption={
            uploadOptions:{
                baseUrl: '/common/file/word/officialSeal',
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 1,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip',  //选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                beforeUpload:this._beforeUpload,
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div>
            <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                <Button  type="primary"  ref="chooseAndUpload" loading={this.state.loading}>上传</Button>
            </FileUpload>
            </div>
        )
    }
};
export default StampToFile;  //ES6语法，导出模块