// 模型信息
import React,{PureComponent} from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

// Approve 的来源从数据库获取

//父级数据demo
// let moduleMsg={};
// moduleMsg[_source]=this.state.lpData.source; //来源
// moduleMsg[_grade]=this.state.lpData.grade; //CreditModel等级
// moduleMsg[_result]=this.state.lpData.result;  //结果
// moduleMsg[_selected_amount]=this.state.lpData.selected_amount; //CreditModel最大金额
// moduleMsg[_loanAmount12]=this.state.lpData.loanAmount12; //选择金额
// moduleMsg[_contract_expiring_date]=this.state.lpData.contract_expiring_date; //合同过期日

class ModuleMsg extends React.Component {
    constructor(props){
        super(props);
        this.state={
            _queueType:this.props._queueType,
            _accountId: "",
            _loanNumber: "",
            _queueStatusId:this.props._queueStatusId,
            _ModuleMsgs:{},
            insuranceRate_3:'',
            insuranceRate_12:''
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            _queueType:nextProps._queueType,
            _accountId: nextProps._accountId,
            _loanNumber: nextProps._loanNumber,
            _queueStatusId:nextProps._queueStatusId,
            _ModuleMsgs:nextProps._ModuleMsgs,
            insuranceRate_3:nextProps.insuranceRate_3,
            insuranceRate_12:nextProps.insuranceRate_12
        })
    }
    // 重跑模型方法
    reModule(){
        var _that= this;
        if(!this.state._queueType||this.state._queueType==""||!this.state._accountId||this.state._accountId==""
            ||!this.state._loanNumber||this.state._loanNumber=="" ){
            alert("重跑模型参数不正确");
            return;
        }
        let ajaxTimeOut=$.ajax({
            type: "get",
            url: "/companySearch/remodelFromQueue",
            async: false,
            timeout : 30000, //超时时间设置，单位毫秒
            data: {
                queueType:_that.state._queueType,
                accountId: _that.state._accountId,
                loanNumber: _that.state._loanNumber
            },
            dataType: "JSON",
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
            success: function (res) {
                var _getData = res.data;
                if (!commonJs.ajaxGetCode(res)) {
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
                    return;
                }
                
                alert(_getData.message);
                if(_that.props._getMsg){
                    _that.props._getMsg("RELOAD",true);
                }
                $("#loading").remove();
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
                    $(".OCR-edit-div").addClass("hidden");
        　　　　}
        　　}
        })
    }
    render() {
        let ModuleMsgs=this.state._ModuleMsgs;
        console.log(ModuleMsgs)
        let _queueStatusId = this.state._queueStatusId;
        let queueType=this.state._queueType;//对应页面当前展示的queue
        let judgeBtn=(this.state._queueType=="approve")?
            (_queueStatusId && (_queueStatusId==1||_queueStatusId==7||_queueStatusId==8)?"_queueStatusId pb10":"_queueStatusId hidden pb10"):
            (_queueStatusId && (_queueStatusId==1||_queueStatusId==3)?"_queueStatusId pb10":"_queueStatusId hidden pb10");
        return (
            <div className="toggle-box">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" onClick={commonJs.content_toggle.bind(this)}>
                    模型信息
                    {
                        this.props._showDecline_LP?<span className="pl20">LP_Decline：{commonJs.is_obj_exist(this.props._Decline_LP)}</span>:""
                    }
                    {
                        queueType=="approve"?<span className="pl20">simple_test：{commonJs.is_obj_exist(ModuleMsgs._simpleTest)}</span>:""
                    }
                    <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                </h2>
                <div className="bar">
                    <ul className="cpy-module-msg mt5">
                        <li>
                            <p className="module-t">来源</p>
                            <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._source)}</b>
                        </li>
                        {
                            (queueType=="ocr" || queueType=="lp" || queueType=="approve" || queueType=="decline-lp") ? "":<li>
                                                                <p className="module-t">CreditModel等级</p>
                                                                <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._grade)}</b>
                                                            </li>
                        }
                        <li>
                            <p className="module-t">模型结果</p>
                            <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._result)}</b>
                        </li>
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">CreditModel最大金额/3</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._loanAmount3)}</b>
                                                    </li>
                        }
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">CreditModel最大金额/12</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._loanAmount12)}</b>
                                                    </li>
                        }
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">CreditModel最大金额/18</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._loanAmount18)}</b>
                                                    </li>
                        }
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">CreditModel最大金额/24</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._loanAmount24)}</b>
                                                    </li>
                        }
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">CreditModel最大金额/36</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._loanAmount36)}</b>
                                                    </li>
                        }
                        {
                            queueType=="ocr" ? "":<li>
                                                        <p className="module-t">选择金额/期数</p>
                                                        <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._selected_amount)}/{commonJs.is_obj_exist(ModuleMsgs._periods)}</b>
                                                    </li>
                        }
                        <li>
                            <p className="module-t">合同过期日</p>
                            <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._contract_expiring_date)}</b>
                        </li>
                        {
                            (queueType=="ocr" || queueType=="lp" || queueType=="approve" || queueType=="decline-lp") ? "":<li>
                                                                <p className="module-t">模型时间</p>
                                                                <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._module_date)}</b>
                                                            </li>
                        }
                        {
                            queueType=="ocr" ? <li>
                                                    <p className="module-t">测试分组</p>
                                                    <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs.lpTest)}</b>
                                                </li> : "" 
                        }
                        {
                            queueType=="ocr" ? <li>
                                                    <p className="module-t">ocrTest</p>
                                                    <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs.ocrTest)}</b>
                                                </li> : "" 
                        }
                        {
                            (queueType=="lp" || queueType=="decline-lp") ? <li>
                                                    <p className="module-t">hit fraud</p>
                                                    <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._hitFraud)}</b>
                                                </li> : "" 
                        }
                        {
                            (queueType=="lp" || queueType=="decline-lp" || queueType=="approve") ? <li>
                                                    <p className="module-t">check_edu</p>
                                                    <b className="module-c">{commonJs.is_obj_exist(ModuleMsgs._isStu)}</b>
                                                </li> : "" 
                        }
                        <li>
                            <p className="module-t">3期费率</p>
                            <b className="module-c">{commonJs.is_obj_exist(this.state.insuranceRate_3)}</b>
                        </li>
                        <li>
                            <p className="module-t">12期费率</p>
                            <b className="module-c">{commonJs.is_obj_exist(this.state.insuranceRate_12)}</b>
                        </li>
                    </ul>
                    {/* <div className={judgeBtn}>
                        <button className="btn-white block ml20 reloadModeMsg" onClick={this.reModule.bind(this)}>重跑模型</button>
                    </div> */}
                </div>
            </div>
        );
    }
}
;

export default ModuleMsg;