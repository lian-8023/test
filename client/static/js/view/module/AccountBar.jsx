// 搜索条件下面的信息栏
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class AccountBar extends React.Component {
    constructor(props){
        super(props);
        this.state={
            accountId:this.props.accountId,
            haveFinishLoan:this.props.haveFinishLoan,
            userName:this.props.userName,
            sex:this.props.sex
        }
    }
    UNSAFE_componentWillMount(){
        // this.getLoanNuber_array();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        if(nextProps.isBarUpdata=="noload"){
            return;
        }
        this.setState({
            accountId:nextProps.accountId,
            haveFinishLoan:nextProps.haveFinishLoan,
            userName:nextProps.userName,
            sex:nextProps.sex
        },()=>{
            this.getLoanNuber_array();
        })
    }
    //获取合同列表
    getLoanNuber_array(){
        let _that=this;
        var accountId = this.state.accountId;
        let n=$(".Csearch-left-page .on").attr("data-id");
        if(!accountId||accountId==''){
            return;
        }
        // 获取合同列表
        $.ajax({
            type:"get",
            url:"/node/pactList",
            async:false,
            dataType: "JSON",
            data:{
                accountId:accountId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                let case_ocr_loanNumber=(_getData.loanInfoDTOs&&_getData.loanInfoDTOs.length>0)?_getData.loanInfoDTOs[0].loanNumber:"";
                _that.setState({
                    loanNumber_array:_getData.loanInfoDTOs?_getData.loanInfoDTOs:[],
                    case_ocr_loanNumber:case_ocr_loanNumber
                })
                if(_that.props.loanNumberChange){
                    _that.props.loanNumberChange(case_ocr_loanNumber)
                }
            }
        })
    }
    // 详情--select框切换合同号
    changeLoanNo(event){
        let $this=$(event.target);
        var theText=$this.find("option:selected").text();
        if(this.props.loanNumberChange){
            this.props.loanNumberChange(theText)
        }
    }
    render() {
        return (
            <div className="bar mt2 accountBar">
                <span className="left pl20 pr10 shallow-blue">姓名</span>
                <b className="left pr5 content-font">{commonJs.is_obj_exist(this.state.userName)}（{commonJs.is_obj_exist(this.state.sex)}）</b>
                {this.state.haveFinishLoan=="YES"?<span className="left block pr20 old-customer">老客户</span>:""}
                <span className="left pl20 pr10 shallow-blue">Portal号</span>
                <b className="left pr30 mr20 content-font blue-font">{commonJs.is_obj_exist(this.state.accountId)}</b>
                <select name="" id="detailTopSelect" className="left select-blue mt5 mr20 detail-top-select" onChange={this.changeLoanNo.bind(this)}>
                    {
                        (this.state.loanNumber_array && this.state.loanNumber_array.length>0) ? this.state.loanNumber_array.map((repy,i)=>{
                            return <option value="" key={i}>{repy.loanNumber}</option>
                        }):<option value="">没有数据</option>
                    }
                </select>
            </div>
        );
    }
};

export default AccountBar;
