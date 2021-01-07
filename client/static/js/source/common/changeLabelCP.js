
// cooperation portal 切换左右组件公共方法
import React from 'react';
import $ from 'jquery';
import axios from '../../axios';
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;
// 左侧页面
import UserMsgTerrace from '../../view/cp-module/userMsgTerrace';
import LoanDetails from '../../view/cp-module/loanDetails';
import UserMsgThird from '../../view/cp-module/userMsgThird';
import ShopMsgXYH from '../../view/cp-module/shopMsgXYH';
import ShopMsgGYL from '../../view/cp-module/shopMsgGYL';
import ShopMsgNY from '../../view/cp-module/shopMsgNY';
import FileTerrace from '../../view/cp-search/fileTerrace';  //=>附件-平台
import FileThird from '../../view/cp-search/fileThird';  //=>附件-第三方
import FileXYH from '../../view/cp-search/fileXYH';  //=>附件-小雨花
import FileGYL from '../../view/cp-search/fileGYL';  //=>附件-供应链
import FileNY from '../../view/cp-search/fileNY';  //=>附件-供应链
import InAcount from '../../view/cp-module/InAccount';  //挂帐入账
import GuaranteeRapayList from '../../view/module/guaranteeRapayList'; //担保费还款计划table展示
import DeductionRecordsList from '../../view/module/deductionRecordsList'; //担保费还款计划table展示
import { observable, action, computed ,configure,runInAction} from "mobx";
// 右侧页面
import Collection from '../../view/Collection/Collection';
import Reminder from '../../view/Reminder/Reminder';
import RepaymentRemindpage from '../../view/repaymentRemind/repaymentRemindpage';  //还款日提醒 


export default class ChangeLabelCP{
    @observable guaranteeFeePayInfoList = [];
    /**
     * 获取左侧组件内容
     * @param index
     * @returns {string}
     */
    @action
    getLeftHtml(index,that){
        if(index == 5){
            this.getGuranteeList(that);
        }
        var left_page="";
        let platformFlag=that.labelBoxStore.rowData?that.labelBoxStore.rowData.platformFlag:"";//接口返回的平台或第三方标识
        //let platformFlag='New';//接口返回的平台或第三方标识
        let loanNumber=that.labelBoxStore.rowData?that.labelBoxStore.rowData.loanNumber:"";//接口返回的合同号
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
            userPage:{
                "default":<UserMsgTerrace />,
                "TH":<UserMsgThird />,
                "PF":<UserMsgTerrace />,
                "XYH":<ShopMsgXYH />,
                "SUPPLY":<ShopMsgGYL />,
                "AG":<ShopMsgNY />,
                'New':<LoanDetails />
            },
            filePage:{
                "default":<FileTerrace />,
                "TH":<FileThird />,
                "PF":<FileTerrace loanNumber={loanNumber} />,
                "XYH":<FileXYH />,
                "SUPPLY":<FileGYL />,
                "AG":<FileNY />,
            },
            loanPage:{
                "PF":<LoanDetails />
            },
            Guarantee:{
                "PF":<div>
                        <GuaranteeRapayList guaranteeFeePayInfoList={this.guaranteeFeePayInfoList} />
                        <DeductionRecordsList
                            pageFlag="changeLabel"
                            that={that} 
                        />
                    </div>
            }
        };
        switch (index){
            case 0:
                left_page=pageParm.userPage[platformFlag];
                break;
            case 1:
                left_page=pageParm.filePage[platformFlag];
                break;
            case 4:
                left_page=pageParm.loanPage[platformFlag];
                break;
            case 5:
                left_page=pageParm.Guarantee[platformFlag];
                break;
        }
        return left_page;
    }
    //切换右侧页面
    changeRight=(index,that)=>{
        var _this=this;
        var rigComponent = that.props.rigPage;
        switch (rigComponent){
            case "collection":
                _this.changeRightCP(index,that);
                break;
            case "reminder":
                _this.changeRightCP(index,that);
                break;
            case "file":
                _this.changeRightCP(index,that);
        }
    }
    
    /**
     * 渲染右侧queue详情
     * @param index
     */
    @action changeRightCP(index,that){
        var right_page="";
        let platformFlag=that.labelBoxStore.rowData?that.labelBoxStore.rowData.platformFlag:"";//接口返回的平台或第三方标识
        let loanNumber=that.labelBoxStore.rowData?that.labelBoxStore.rowData.loanNumber:"";//接口返回的合同号
        if(!platformFlag){
            platformFlag="default"
        }
        let pageParm={
                filePage:{
                    "TH":<FileThird />,
                    "PF":<FileTerrace loanNumber={loanNumber} />,
                    "XYH":<FileXYH />,
                    "default":<FileTerrace />,
                    "SUPPLY":<FileGYL />,
                    "AG":<FileNY />,
                }
            };
        switch (index){
            case 0:
            right_page=<Collection 
                            _oper_type_props={that.state._oper_type}
                            _params_rigPage={that.state.params_rigPage}
                            _coltn_Q_ajax={that.state.coltn_Q_ajax}
                            updataList_fn={that.coltnSearch.bind(that)}  //更新搜索列表
                        />;
                break;
            case 1:
                right_page=pageParm.filePage[platformFlag];
                break;
            case 2:
                right_page=<Reminder 
                                _oper_type_props={that.state._oper_type}
                                _params_rigPage={that.state.params_rigPage}
                                _coltn_Q_ajax={that.state.coltn_Q_ajax}
                                updataList_fn={that.RmdSearch.bind(that)}  //更新搜索列表
                            />;
                break;
            case 3:
                right_page=<InAcount />;
                break;
            case 4:
                right_page=<RepaymentRemindpage 
                                _params_rigPage={that.state.params_rigPage}
                                updataList_fn={that.RmdSearch.bind(that)}  //更新搜索列表
                            />;
                break;
        }
        that.labelBoxStore.rig_page=right_page;
        $(".Csearch-right-page li").removeClass("on");
        $(".Csearch-right-page li[data-id='"+index+"']").addClass("on");
    }
    //根据合同号查询担保费还款列表-lyf
    getGuranteeList=(that)=>{
        let _that=this;
        let loanNumber=that.labelBoxStore.rowData?that.labelBoxStore.rowData.loanNumber:"";//接口返回的合同号
        let cooperationFlag=that.labelBoxStore.rowData?that.labelBoxStore.rowData.cooperationFlag:"";//接口返回的合同号
        // let params = {loanNumber:loanNumber,productNo:cooperationFlag};
        $.ajax({
            type:"get",
            url:"/node/upfrontFee/query/gurantee",
            async:false,
            dataType: "JSON",
            data:{loanNumber:loanNumber,productNo:cooperationFlag},
            success:function(res) {
                let data=res.data;  //from java response
                if(!data.executed){
                    _that.guaranteeFeePayInfoList = [];
                }
                _that.guaranteeFeePayInfoList = cpCommonJs.opinitionArray(data.guaranteeFeePayInfoList);
            }
        })
    }
    //显示还款列表弹窗
    showRepayPop(that){
        let rowData=that.labelBoxStore.rowData?that.labelBoxStore.rowData:{};
        let loanNo=rowData.loanNumber;
        let orderNo=rowData.orderNo;
        let cooperationFlag=rowData.productNo;
        let fromFlag=rowData.platformFlag;
        if(!fromFlag){
            return;
        }
        if(fromFlag=="XYH"){
            window.open("/XYH-repaymentList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
            return;
        }
        if(fromFlag=="SUPPLY"){
            let nationalId = rowData.nationalId;
            window.open("/cp-repaymentList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag+"&nationalId="+nationalId);
            return;
        }
        if(fromFlag=='PF' && cooperationFlag == '2F'){
            window.open("/cp-withholdList2F?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
            return;
        }
        window.open("/cp-repaymentList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
    //扣款列表页面
    showWithholdPop(that){
        let rowData=that.labelBoxStore.rowData?that.labelBoxStore.rowData:{};
        let loanNo=rowData.loanNumber;
        let orderNo=rowData.orderNo;
        let cooperationFlag=rowData.productNo;
        let fromFlag=rowData.platformFlag;
        let nationalId = rowData.nationalId;
        window.open("/cp-withholdList?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag+"&nationalId="+nationalId);
    }
    //历史借款记录页面
    showHistoryBorrowPop(that){
        let rowData=that.labelBoxStore.rowData?that.labelBoxStore.rowData:{};
        let loanNo=rowData.loanNumber;
        let orderNo=rowData.orderNo;
        let cooperationFlag=rowData.productNo;
        let fromFlag=rowData.platformFlag;
        window.open("/cp-historyBorrow?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
    }
}