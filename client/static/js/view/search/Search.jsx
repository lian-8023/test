import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class Search extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            searchResult:"",  //搜索结果列表
            accessryInfo:{
                viewPhone:"NO",//是否能看到完整号码
                callByTianr:"YES",//是否使用天润呼叫，YES=天润，NO=800
            },//附加参数
        };
    }
    componentDidMount() {
    }
    search_fn(){
        var _that=this;

        var potal_account=$(".potal-account").val().replace(/\s/g,""),
            loan_No=$(".loan-No").val().replace(/\s/g,""),
            phone_No=$(".phone-No").val().replace(/\s/g,""),
            user_name=$(".user-name").val().replace(/\s/g,""),
            identiy_No=$(".identiy-No").val().replace(/\s/g,""),
            contact_phone_No=$(".contact-phone-No").val().replace(/\s/g,""),
            cpy_phone_No=$(".cpy-phone-No").val().replace(/\s/g,"");

            if(isNaN(potal_account) || isNaN(phone_No) || isNaN(contact_phone_No) || isNaN(cpy_phone_No)){
                alert("输入的查询号必须为数字!");
                return;
            }
            if(potal_account.length>0 && potal_account.length>9){
                alert("您输入的portal号有误，请重新输入！");
                return;
            }
            if(potal_account=="" && loan_No=="" && phone_No=="" && user_name=="" && identiy_No=="" && contact_phone_No=="" && cpy_phone_No==""){
            alert("必须填写一项搜索条件");
            return;
        }

        var req_data={
            accountId:potal_account,
            loanNO:loan_No,
            mobile:phone_No,
            name:user_name,
            IDNO:identiy_No,
            contactPhone:contact_phone_No,
            companyPhone:cpy_phone_No
        }
        $.ajax({
             type:"get", 
             url:"/node/search_list", 
             async:false,
             dataType: "JSON", 
             data:req_data, 
             success:function(res){
                 if(!commonJs.ajaxGetCode(res)){
                    _that.setState({
                        searchResult:[],
                        accessryInfo:{}
                    })
                     return;
                 }
                 var _data=res.data;
                 if(!_data.userInfos || _data.userInfos.length<=0){
                     alert("没有查到相关数据");
                     _that.setState({
                        searchResult:[],
                        accessryInfo:{}
                    })
                    return;
                 }
                 var accessryInfo_ajax = {
                     viewPhone:_data.viewPhone,
                     callByTianr:_data.callByTianr
                 };
                 _that.setState({
                     searchResult:_data.userInfos,
                     accessryInfo:accessryInfo_ajax
                 })
            }
        })
    }

    render() {
        var accessryInfo = this.state.accessryInfo;
        return (
            <div  className="content" id="content">
                <div  className="top clearfix search-condition" data-isresetdiv="yes">
                    <input type="text"  className="left input mr20 mt10 potal-account input_w" id='account' placeholder="portal号" />
                    <input type="text"  className="left input mr20 mt10 loan-No input_w" id='loanNo' placeholder="贷款号" />
                    <input type="text"  className="left input mr20 mt10 user-name input_w" id='userName' placeholder="姓名" />
                    <input type="text"  className="left input mr20 mt10 identiy-No input_w" id='identiyNo' placeholder="身份证号" />
                    <input type="text"  className="left input mr20 mt10 phone-No input_w" id='phoneNo' placeholder="手机号" />
                    <input type="text"  className="left input mr20 mt10 contact-phone-No input_w" id='contactPhoneNo' placeholder="联系人电话" />
                    <input type="text"  className="left input mr20 mt10 cpy-phone-No input_w" id='cpyPhoneNo' placeholder="公司电话" />
                    <button  className="btn-blue block left mr15 search-btn mt10" id='searchBtn' onClick={this.search_fn.bind(this)} data-btn-rule="SEARCH:SEARCH">搜索</button>
                    <button className="left btn-white mt10" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                </div>
                <div  className="mt20 search-result" id="search_result_list">
                    <table  className="pt-table" width="100%">
                        <tbody>
                        <tr>
                            <th width="8%">账号</th>
                            <th width="7%">姓名</th>
                            <th width="10%">手机号码</th>
                            <th width="13%">身份证</th>
                            <th width="15%">合同号</th>
                            <th width="10%">合同模型结果</th>
                            <th width="10%">最新模型结果</th>
                            <th width="10%">最新模型时间</th>
                            <th width="5%">当前步骤</th>
                            <th width="10%">注册时间</th>
                        </tr>
                        {
                            (this.state.searchResult && this.state.searchResult.length>0) ? this.state.searchResult.map((repy,i)=>{
                                return <tr key={i}>
                                            <td title={commonJs.is_obj_exist(repy.accountId)}>
                                                <Link to={repy.accountId ? "detail/"+repy.accountId : ""} className="block blue-font">{commonJs.is_obj_exist(repy.accountId)}</Link>
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.name)}>
                                                {commonJs.is_obj_exist(repy.name)}
                                            </td>
                                            <td title={commonJs.phoneReplace(accessryInfo.viewPhone,repy.primaryPhone)}>
                                                {commonJs.phoneReplace(accessryInfo.viewPhone,repy.primaryPhone)}
                                            </td>
                                            <td title={commonJs.newNationalIdReplace('',repy.nationalId)}>
                                                {
                                                    commonJs.newNationalIdReplace('',repy.nationalId)
                                                }
                                            </td>
                                            <td title={repy.loanInfoDTO?repy.loanInfoDTO.loanNumber:"-"}>
                                                <Link to={repy.accountId ? "detail/"+repy.accountId : ""} className="blue-font">{repy.loanInfoDTO?repy.loanInfoDTO.loanNumber:"-"}</Link>
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.loanModelResult)}>
                                                {commonJs.is_obj_exist(repy.loanModelResult)}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.newestLoanModelResult)}>
                                                {commonJs.is_obj_exist(repy.newestLoanModelResult)}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.newestModelTime)}>
                                                {commonJs.is_obj_exist(repy.newestModelTime)}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.page)}>
                                                {commonJs.is_obj_exist(repy.page)}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.createdAt)}>
                                                {commonJs.is_obj_exist(repy.createdAt)}
                                            </td>
                                        </tr>
                            }) : <tr><td colSpan="8" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}
;

export default Search;