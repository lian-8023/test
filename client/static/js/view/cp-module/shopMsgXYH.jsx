// 门店信息--小雨花
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import ProductConfig from '../../template/poductConfig';  //详情模板
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction} from "mobx";
import { Modal ,Select } from 'antd';
import axios from '../../axios';

const { Option } = Select;

@inject('allStore') @observer
class ShopMsgXYH extends React.Component {
    constructor(props){
        super(props);
        this.userinfoStore=this.props.allStore.UserinfoStore;
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            visible:false,
            delayVisible:false,
            delayMonths:2,
            delayMonthsList:[
                {
                    name:'1个月',
                    value:1
                },{
                    name:'2个月',
                    value:2
                },{
                    name:'3个月',
                    value:3
                },{
                    name:'4个月',
                    value:4
                },{
                    name:'5个月',
                    value:5
                },{
                    name:'6个月',
                    value:6
                },{
                    name:'7个月',
                    value:7
                },{
                    name:'8个月',
                    value:8
                },{
                    name:'9个月',
                    value:9
                },{
                    name:'10个月',
                    value:10
                },{
                    name:'11个月',
                    value:11
                },{
                    name:'12个月',
                    value:12
                },
            ],
        }
    }
    showOtherShop=()=>{
        this.setState({
            visible: true,
          });
    }
    
    handleCancel = e => {
        this.setState({
          visible: false,
        });
    };
    // ocr识别
    ocrManual=()=>{
        let store=this.props.allStore.UserinfoStore;
        let XYH_IdentityInfo=store.XYH_IdentityInfo;
        let filesInfos=cpCommonJs.opinitionObj(XYH_IdentityInfo.filesInfos);
        let proofPhoto=cpCommonJs.opinitionArray(filesInfos.proofPhoto);//学历/工作 -证明文件
        let contractDocFile=cpCommonJs.opinitionArray(XYH_IdentityInfo.contractDocFile);//合同文件
        let newArr=proofPhoto.concat(contractDocFile);
        let parems=[];
        let fileIds=[];
        for (let i = 0; i < newArr.length; i++) {
            const element = newArr[i];
            parems.push(element.fileDownloadPath);
            fileIds.push(element.id)
        }
        if(parems.length<=0){
            alert('没有文件信息可以识别！');
            return;
        }
        let that=this;
        axios({
            method: 'POST',
            url:'/node/manual/xyh/ocr',
            data:{josnParam:JSON.stringify({img_src:parems,fileIds:fileIds})}
        })
        .then(function (res) {
            let response=res.data;  //from node response
            let data=response.data;  //from java response
            if (!commonJs.ajaxGetCode(response)) {
                that.setState({
                    ocrInfoDTOS:[]
                })
                return;
            }
            that.setState({
                ocrInfoDTOS:data.infoDTOS
            })
        })
    


    }
    //顺延
    delay = ()=>{
        let userinfoStore=cpCommonJs.opinitionObj(this.props.allStore.UserinfoStore);
        let identityInfo=cpCommonJs.opinitionObj(userinfoStore.XYH_IdentityInfo);
        let infoDTO = cpCommonJs.opinitionObj(identityInfo.infoDTO);
        let params = {
            loanNumber:infoDTO.loanNumber?infoDTO.loanNumber:"",
        }
        if(params.loanNumber){
            this.setState({
                delayVisible:true,
            })
        }else{
            alert('详情没有合同号')
        }
    }
    delayMonthsOK=()=>{
        const that = this;
        let userinfoStore=cpCommonJs.opinitionObj(this.props.allStore.UserinfoStore);
        let identityInfo=cpCommonJs.opinitionObj(userinfoStore.XYH_IdentityInfo);
        let infoDTO = cpCommonJs.opinitionObj(identityInfo.infoDTO);
        let parems = {
            loanNo:infoDTO.loanNumber?infoDTO.loanNumber:"",
            delayMonths : this.state.delayMonths,
        }
        $.ajax({
            type:"post",
            url:"/node/search/2C/delay",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parems)},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        delayVisible:false,
                        delayMonths:2,
                    })
                    return;
                }
                alert('成功');
            }
        })
    }
    render() {
        let userinfoStore=cpCommonJs.opinitionObj(this.props.allStore.UserinfoStore);
        let identityInfo=cpCommonJs.opinitionObj(userinfoStore.XYH_IdentityInfo);
        let otherInfo=cpCommonJs.opinitionObj(identityInfo.otherInfo);
        let otherShopInfoList=cpCommonJs.opinitionArray(otherInfo.otherShopInfoList);
        if(this.props.fromXYHmodal){ //小雨花弹窗（历史文件、历史订单-查看详情）
            identityInfo=this.props.data;
        }

        let collectionNextData=cpCommonJs.opinitionObj(this.commonStore.collectionNextData);
        let collectionOverdueInfoDTOS=collectionNextData.collectionOverdueInfoDTOS;
        let collectionGrade='';
        if(collectionOverdueInfoDTOS && collectionOverdueInfoDTOS[0]){
            collectionGrade=collectionOverdueInfoDTOS[0].collectionGrade;
        }
        let stopDay=collectionNextData.stopDay;
        let productConfigs=cpCommonJs.opinitionObj(ProductConfig['checkMsgOrder']);
        let productConfigMsgList=cpCommonJs.opinitionArray(productConfigs.msg);  //详情模板list
        let productConfigFileList=cpCommonJs.opinitionArray(productConfigs.files);  //文件模板list
        let cdt={};
        if(window.location.hash=='#/Reminder/reminder' || window.location.hash=='#/Collection/collection'){  //collection 详情银行卡号脱敏展示
            cdt={
                '身份证号码':true
            }
        }
        let {ocrInfoDTOS=[]}=this.state;
        return (
            <div className="auto-box pr5 relative">
                {
                    (productConfigMsgList&&productConfigMsgList.length>0)?productConfigMsgList.map((reps,j)=>{
                    let templateList=reps.templateKey;
                    let javaKey=reps.javaKey;
                        return <div className="toggle-box mt5" key={j}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                        {reps.name}
                                        {userinfoStore.cooperationFlag == '2C'&&reps.javaKey=="userInfo"?<a style={{width: '55px',display:' inline-block',marginLeft: '75%'}} className="block btn-blue mr10 mt10" onClick={this.delay}>顺延</a>:''}
                                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                    </h2>
                                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                                        {
                                            templateList?templateList.map((repy,i)=>{
                                                let keyword=repy.keyword;
                                                let displayName=cpCommonJs.opinitionObj(identityInfo[javaKey])[keyword];
                                                if(repy.cell){
                                                    displayName=repy.cell(displayName,cdt[repy.desc]);
                                                }
                                                let isbutton=repy.isbutton;
                                                return <li key={i}>
                                                            <p className="msg-tit">
                                                                {repy.desc}
                                                                {
                                                                    isbutton?
                                                                    <a onClick={this.showOtherShop} className="button-blue" id='showOtherShop'>{isbutton}</a>:''
                                                                }
                                                            </p>
                                                            <b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
                                                        </li>
                                            }):''
                                        }
                                    </ul>
                                </div>
                    }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                }
                <ul className='cp-info-ul bar'>
                    <li>
                        <p className="msg-tit">催收等级</p>
                        <b className="msg-cont">{commonJs.is_obj_exist(collectionGrade)}</b>
                    </li>
                    <li>
                        <p className="msg-tit">停留时间</p>
                        <b className={(stopDay==1)?'red msg-cont':'msg-cont'}>{commonJs.is_obj_exist(stopDay)}</b>
                    </li>
                </ul>
                
                {/* ocr识别 */}
                <div className="toggle-box mt5">
                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                        OCR信息识别
                        <i className="right bar-tit-toggle bar-tit-toggle-down" ></i>
                        <a className="block btn-blue right mr10 mt10" onClick={this.ocrManual}>识别</a>
                    </h2>
                    <div className='bar mt5'>
                    {
                        ocrInfoDTOS.length>0 ? ocrInfoDTOS.map((repy,i)=>{
                            let detectedDocType=commonJs.is_obj_exist(repy.detectedDocType);
                            let detectedDocTypeDes='-';
                            if(detectedDocType==1){
                                detectedDocTypeDes='合同or收据';
                            }else if(detectedDocType==2){
                                detectedDocTypeDes='学信网截图或图片';
                            }else if(detectedDocType==3){
                                detectedDocTypeDes='毕业证书';
                            }
                            return <ul key={i} className='cp-info-ul border-bottom'>
                                        <li>
                                            <p className="msg-tit">姓名</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.name)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">文件类型</p>
                                            <b className="msg-cont">{detectedDocTypeDes}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">在籍状态</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.graduate)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">idCard</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.idCard)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">学历</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.level)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">学校</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.school)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">印章数量</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.seal)}</b>
                                        </li>
                                        <li>
                                            <p className="msg-tit">内容</p>
                                            <b className="msg-cont">{commonJs.is_obj_exist(repy.content)}</b>
                                        </li>
                                    </ul>
                        }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                    }
                        
                    </div>
                </div>

                <Modal
                    title="其他门店"
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={'50%'}
                >
                <table className="pt-table commu-tab">
                    <thead>
                        <tr className="th-bg">
                            <th width='50%'>门店简称</th>
                            <th width='50%'>门店名称</th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        otherShopInfoList.length>0?otherShopInfoList.map((repy,i)=>{
                            return <tr key={i}>
                                        <td title={commonJs.is_obj_exist(repy.otherShortName)}>{commonJs.is_obj_exist(repy.otherShortName)}</td>
                                        <td title={commonJs.is_obj_exist(repy.otherShopName)}>{commonJs.is_obj_exist(repy.otherShopName)}</td>
                                    </tr>
                        }):<tr><td colSpan="2" className="gray-tip-font">暂未查到相关数据...</td></tr>
                    }
                    </tbody>
                </table>
                </Modal>
                <Modal
                    title="顺延"
                    visible={this.state.delayVisible}
                    onCancel={()=>{$('.bar-tit-toggle').css('height','8px') ;this.setState({delayVisible:false})}}
                    onOk={()=>{$('.bar-tit-toggle').css('height','8px');this.delayMonthsOK()}}
                    width={'30%'}
                >
                    <div>
                        延期月份：<Select defaultValue="lucy" value={this.state.delayMonths} style={{ width: 120 }} onChange={(v)=>{
                                    console.log(v)
                                    this.setState({
                                        delayMonths:v
                                    })
                                }}>
                                    {
                                        this.state.delayMonthsList.map((v,i)=>{
                                            return(<Option disabled={v.value !== 2?true:false} key={i} value={v.value} >{v.name}</Option>)
                                        })
                                    }
                                </Select>
                    </div>
                </Modal>
            </div>
    );
    }
};


export default ShopMsgXYH;