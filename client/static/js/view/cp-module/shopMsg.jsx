// 门店审核详情
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
import {observer,inject} from "mobx-react";
import ProductConfig from '../../template/poductConfig';  //详情模板
import md5 from 'md5';

@inject('allStore') @observer
export default class ShopMsg extends React.Component {
    constructor(props){
        super(props);
        this.state={
            data:this.props.data?this.props.data:{},
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            data:nextProps.data?nextProps.data:{},
        })
    }
    //新开页面查看文件
    openPage(sign,type){
        if(type){
            window.open(sign,'_blank');
        }else{
            if(!sign){
                sign="";
                alert('未获取到文件id！')
                return;
            }
            if(sign){
                sign=sign.toString();
                sign=md5(sign);
            }
            let data=this.state.data;
            let storeQueueInfoDTO=cpCommonJs.opinitionObj(data.storeQueueInfoDTO);
            let productNo=commonJs.is_obj_exist(storeQueueInfoDTO.productNo);
            let storeId=commonJs.is_obj_exist(storeQueueInfoDTO.storeId);
            let storeName=commonJs.is_obj_exist(storeQueueInfoDTO.storeName);
            let barseUrl="/cp-fileView?productNo="+productNo+"&storeId="+storeId+"&storeName="+storeName+"&key="+sign+"&JSsource=shopInfoFile";
            window.open(barseUrl);
        }
    }
    render() {
        let data=this.state.data;
        let identityInfo={};
        let storeQueueInfoDTO=cpCommonJs.opinitionObj(data.storeQueueInfoDTO);
        let productNo=commonJs.is_obj_exist(storeQueueInfoDTO.productNo);
        let platformFlag=commonJs.is_obj_exist(storeQueueInfoDTO.platformFlag);
        let templateJsName='';  //加载模板js文件
        if(platformFlag=='TH'){
            if(productNo=='3C'){
                identityInfo=cpCommonJs.opinitionObj(data.aiShangStoreIdentityInfoDTO);  //3C 门店详情
                templateJsName=productNo;
            }else{
                identityInfo=cpCommonJs.opinitionObj(data.storeIdentityInfoDTO);  //门店审核详情
                templateJsName=platformFlag;
            }
        }else{
            if(productNo=='3C1' || productNo=='6C1'){
                identityInfo=cpCommonJs.opinitionObj(data.storeInfoDTO);  //3C1 门店详情 
                templateJsName='3C1';
            }else{
                identityInfo=cpCommonJs.opinitionObj(data.storeInfoDTO);  //平台 门店详情
                templateJsName=platformFlag;
            }
        }
        let productConfigs=cpCommonJs.opinitionObj(ProductConfig[templateJsName]);
        let productConfigMsgList=cpCommonJs.opinitionArray(productConfigs.msg);  //详情模板list
        let productConfigFileList=cpCommonJs.opinitionArray(productConfigs.files);  //文件模板list
        return (
            <div className="auto-box pr5 relative">
                {
                    (productConfigMsgList&&productConfigMsgList.length>0)?productConfigMsgList.map((reps,j)=>{
                    let templateList=reps.templateKey;
                        return <div className="toggle-box mt5" key={j}>
                                    <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                                    {reps.name}
                                        <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                                    </h2>
                                    <ul className="cp-info-ul mt5 bar pb20 pr20"> 
                                        {
                                            templateList?templateList.map((repy,i)=>{
                                                let keyword=repy.keyword;
                                                let displayName=identityInfo[keyword];
                                                if(repy.cell){
                                                    displayName=repy.cell(displayName);
                                                }
                                                return <li key={i}>
                                                            <p className="msg-tit">{repy.desc}</p>
                                                            <b className="msg-cont" title={commonJs.is_obj_exist(displayName)}>{commonJs.is_obj_exist(displayName)}</b>
                                                        </li>
                                            }):''
                                        }
                                    </ul>
                                </div>
                    }):<div className="gray-tip-font bar pt5">暂未查到相关数据...</div>
                }

                {
                    productConfigFileList?productConfigFileList.map((reps,j)=>{
                    let templateList=reps.templateKey;
                    let source=reps.source;  //数据涞源
                    let loopType=reps.loopType;  //循环类型
                    let fileName=reps.fileName;  //文件名称
                    let fromJavaList=identityInfo[templateList];
                    if(reps.listLocation=='wrap'){
                        fromJavaList=data[templateList]
                    }
                        return <div className="toggle-box mt5" key={j}>
                            <h2 className="clearfix bar-tit pl20 pr20 toggle-tit detail-bar-tit" onClick={cpCommonJs.toggleUl.bind(this)}>
                            {reps.name}
                                <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                            </h2>
                                <ul className="file-list bar mt5 pl20"> 
                                    {
                                        (source&&source=='fromJava')
                                        ?

                                            (fromJavaList&&fromJavaList.length>0)?fromJavaList.map((repy,i)=>{ {/* 直接解析后端返回的list数据 */}
                                                return <li key={i}>
                                                        {
                                                            (loopType&&loopType=='openUrl')?
                                                            <div>
                                                                <p className="left file-tit">{reps.name+i}</p>
                                                                <b className="left file-link blue-font pointer" id={'openUrl'+i} onClick={this.openPage.bind(this,repy,true)}>查看</b>
                                                            </div>
                                                            :
                                                            <div>
                                                                <p className="left file-tit">{commonJs.is_obj_exist(repy[fileName])}</p>
                                                                <b className="left file-link blue-font pointer" id={repy.id} onClick={this.openPage.bind(this,repy.id,false)}>查看</b>
                                                            </div>
                                                        }
                                                    </li>
                                            }):<li>暂时未查到数据...</li>

                                        :

                                            (templateList&&templateList.length>0)?templateList.map((repy,i)=>{  {/* 按模板配置解析数据 */}
                                                let type=repy.type;
                                                if(identityInfo[repy.url]){
                                                    return <li key={i}>
                                                            <p className="left file-tit">{repy.fileName}</p>
                                                            {
                                                                (type&&type=='byId')?
                                                                <b className="left file-link blue-font pointer" id={identityInfo[repy.url].id} onClick={this.openPage.bind(this,identityInfo[repy.url].id,false)}>查看</b>
                                                                :
                                                                <b className="left file-link blue-font pointer" id={repy.url} onClick={this.openPage.bind(this,identityInfo[repy.url],true)}>查看</b>
                                                            }
                                                            
                                                        </li>
                                                }
                                            }):<li>暂时未查到数据...</li>
                                    }
                                </ul>
                    </div> 
                    }):''
                }
            </div>
    );
    }
};
