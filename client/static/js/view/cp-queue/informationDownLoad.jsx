// 资料下载
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CaseDownLoad from './caseDownLoad';  //案例下载
import VoucherDownload from './voucherDownload';  //批量借款凭证下载
import StampToFile from './StampToFile';  //文件盖章
import {Select } from 'antd'; 
const { Option } = Select;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class InformationDownLoad extends React.Component{
    constructor(){
        super();
        // this.ChannelStore=this.props.allStore.ChannelStore;
        this.state={
            loanNo:''
        }
    }
    // 受控input输入框
    inpOnChange=(key,ev)=>{
        let{ value }=ev.target;
        this.setState({
            [key]:value
        })
    }
    //下载
    downLoand=(_url,paremVal,productNo)=>{
        if(paremVal == ''){
            alert('请输入下载需要的参数！');
            return;
        }
        if(productNo == ''){
            alert('请输入下载需要的参数！');
            return;
        }
        window.open(_url);
    }
    componentDidMount () {
        commonJs.reloadRules();
    }
    render() {
        let {channelArr} = this.props.allStore.ChannelStore;
        let {loanNo,batchNo,settleloanNo}=this.state;
        return (
            <div className="content" id="content">
                <div className="toggle-box" data-btn-rule='RULE:XYH:CASE:DOWN'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='caseDownTie' onClick={commonJs.content_toggle.bind(this)}>
                        案例下载
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3'>
                        <CaseDownLoad />
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule='RULE:KEY:BATCH:CERTIFICATE:DOWN'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='certificateDownTit' onClick={commonJs.content_toggle.bind(this)}>
                        批量借款凭证下载
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3'>
                        <VoucherDownload />
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule='RULE:KEY:SINGLE:CERTIFICATE:DOWN'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='singleCertificateDwonTit' onClick={commonJs.content_toggle.bind(this)}>
                        单个借款凭证下载
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3 bar pl10 pt10 pb10 clearfix'>
                        <Select
                            style={{width:200,float:'left',marginRight:'10px'}} 
                            allowClear
                            placeholder="请选择产品号"
                            value={this.state.productNo}
                            onChange={(v)=>{
                                this.setState({
                                    productNo:v
                                })
                            }}
                        >
                            {
                                channelArr.map((repy,i)=>{
                                    return <Option key={repy.name} value={repy.value}>{repy.displayName}</Option>
                                })
                            }
                        </Select>
                        <input type="text" className="input left mr10 input_w" placeholder='请输入合同号' id='singleCertificateLoanNo' value={this.state.loanNo} onChange={this.inpOnChange.bind(this,'loanNo')} />
                        <a href='javascript:void(0)' id='singleCertificateDwon' onClick={this.downLoand.bind(this,`/node/file/down/certificate?loanNumber=${loanNo}`+`&productNo=${this.state.productNo}`,loanNo,this.state.productNo)} className="btn-blue block left">下载</a>
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule='RULE:KEY:SPECIAL:CASE:DOWN'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='specialCaseTit' onClick={commonJs.content_toggle.bind(this)}>
                        特殊回访案例下载
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3 bar pl10 pt10 pb10 clearfix'>
                        <input type="text" className="input left mr10 input_w" placeholder='请输入批次号' id='specialCaseBatchNo' value={this.state.batchNo} onChange={this.inpOnChange.bind(this,'batchNo')} />
                        <a href='javascript:void(0)' id='specialCaseDown' onClick={this.downLoand.bind(this,`/node/reV/down/special?batchNo=${batchNo}`,batchNo)} className="btn-blue block left">下载</a>
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule='RULE:KEY:SINGLE:CERTIFICATE:DOWN'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" id='singleCertificateDwonTit' onClick={commonJs.content_toggle.bind(this)}>
                        结清证明下载
                        <i className="right bar-tit-toggle bar-tit-toggle-up"></i>
                    </h2>
                    <div className='mt3 bar pl10 pt10 pb10 clearfix'>
                        <input type="text" className="input left mr10 input_w" placeholder='请输入合同号' id='singleCertificateLoanNo' value={this.state.settleloanNo} onChange={this.inpOnChange.bind(this,'settleloanNo')} />
                        <a href='javascript:void(0)' id='singleCertificateDwon' onClick={this.downLoand.bind(this,`/node/file/downSettle?loanNumber=${settleloanNo}`,settleloanNo)} className="btn-blue block left">下载</a>
                    </div>
                </div>
                <div className="toggle-box mt10" data-btn-rule='FILE:WATCH:DOWN:OFFICIAL:SEAL'>
                    <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit">
                        <div className="left mr10 bar" id='OFFICIALSEAL'>
                            文件盖章
                        </div>
                        <div className="left mr10">
                            <StampToFile />
                        </div>

                        <span className="red left">支持docx格式文件单个上传，或者zip格式压缩文件批量上传</span>
                    </h2>
                </div>

            </div>
        )
    }
};
export default InformationDownLoad;  //ES6语法，导出模块