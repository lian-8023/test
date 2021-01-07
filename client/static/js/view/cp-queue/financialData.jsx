// 财务数据
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import {Select } from 'antd'; 
const { Option } = Select;
import FileUpload from 'react-fileupload';
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class FinancialData extends React.Component{
    constructor(){
        super();
        // this.ChannelStore=this.props.allStore.ChannelStore;
        this.state={
            productNo:'',
            loanNo:''
        }
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
                baseUrl: '/Qport/finance',
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
                <div className="toggle-box">
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='caseDownTie' onClick={commonJs.content_toggle.bind(this)}>
                        财务数据上传
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3'>
                        <FileUpload className="left" options={fileOption.uploadOptions}  style={{width:' 100%',background: '#fff', height: '50px',paddingLeft:'18px'}}  ref="fileUpload">
                            <button ref="chooseAndUpload" className="btn-blue mt10" style={{"width":"20%"}}  >财务数据上传</button>
                        </FileUpload>
                    </div>
                </div>
            </div>
        )
    }
};
export default FinancialData;  //ES6语法，导出模块