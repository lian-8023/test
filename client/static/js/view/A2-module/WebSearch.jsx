// 网络搜索
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class WebSearch extends React.Component {
    constructor(props){
        super(props);
        this.state={
            networkSearchInfo:{},  //显示已有数据
            defaultCondition:this.props.defaultCondition, //单位名称
            loanNumber:this.props.loanNumber,
            allPhoneNo:this.props.allPhoneNo
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            loanNumber:nextProps.loanNumber,
            defaultCondition:nextProps.defaultCondition,
            allPhoneNo:nextProps.allPhoneNo
        },()=>{
            this.networkSearch();
        })
    }
    // 网络搜索--外部渠道搜索
    toWebSearch(toUrl,event){
        let searchMsg=this.state.defaultCondition;
        window.open(toUrl+searchMsg+"")
    }
    //网络搜索--编辑||保存
    webSearchEdit(event){
        let that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".toggle-box");
        let editBox=_parent.find(".webSearchMsg");
        let cancleBtn=_parent.find(".cancle_edit");
        if($this.text()=="编辑"){
            editBox.removeClass("webNormal").addClass("webEdit");
            cancleBtn.removeClass("hidden");
            $this.text("保存");
        }else if($this.text()=="保存"){
            let _loanNumber=this.state.loanNumber;
            if(!_loanNumber){
                alert("合同号不能为空！");
                return;
            }
            let regPhone=/^[0-9]||-/g;
            let _phoneNo=_parent.find(".ws-phoneInput").val();
            
            let bdphone=_parent.find(".bdPhone").val().replace(/^-/,"");
            if(bdphone&&!regPhone.test(bdphone)){
                alert("百度搜索电话号码格式不对！");
                return;
            }
            let bdObj={
                "sourceChannel":"baidu",
                "phoneNo":bdphone,
                "belongingPlace":_parent.find(".bdAddr").val().replace(/^-/,""),
            };
            let sgPhone=_parent.find(".sougoPhone").val().replace(/^-/,"");
            if(sgPhone&&!regPhone.test(sgPhone)){
                alert("搜狗搜索电话号码格式不对！");
                return;
            }
            let sougoObj={
                "sourceChannel":"sougo",
                "phoneNo":sgPhone,
                "belongingPlace":_parent.find(".sougoAddr").val().replace(/^-/,"")
            };
            let s360Phone=_parent.find(".s360Phone").val().replace(/^-/,"");
            if(s360Phone&&!regPhone.test(s360Phone)){
                alert("360搜索电话号码格式不对！");
                return;
            }
            let s360Obj={
                "sourceChannel":"s360",
                "phoneNo":s360Phone,
                "belongingPlace":_parent.find(".s360Addr").val().replace(/^-/,"")
            };
            let _networkSearchInfos=[bdObj,sougoObj,s360Obj];
            let _data={
                loanNumber:_loanNumber,
                networkSearchInfos:_networkSearchInfos
            };
            $.ajax({
                type:"post",
                url:"/companySearch/networkSearchSave",
                async:false,
                dataType: "JSON",
                data:{josnParam:JSON.stringify(_data)},
                success:function(res) {
                    if(!commonJs.ajaxGetCode(res)){
                        return;
                    }
                    let _data=res.data;
                    alert(_data.message);
                    that.networkSearch();
                    editBox.removeClass("webEdit").addClass("webNormal");
                    cancleBtn.addClass("hidden");
                    $this.text("编辑"); 
                }
            })

        }
        
    }
    //网络搜索--取消
    cancelWebSch(){
        $(".webSearchMsg-div").find(".webSearchMsg").removeClass("webEdit").addClass("webNormal");
        $(".webSearchMsg-div").find(".cancle_edit").addClass("hidden");
        $(".webSearchMsg-div").find(".edit").text("编辑");
        let networkSearchInfo=this.state.networkSearchInfo;
        $(".webSearchMsg .bdPhone").val(commonJs.is_obj_exist(networkSearchInfo.bdPhoneNo));
        $(".webSearchMsg .bdAddr").val(commonJs.is_obj_exist(networkSearchInfo.bdAddr));
        $(".webSearchMsg .sougoPhone").val(commonJs.is_obj_exist(networkSearchInfo.sougouphoneNo));
        $(".webSearchMsg .sougoAddr").val(commonJs.is_obj_exist(networkSearchInfo.sougouAddr));
        $(".webSearchMsg .s360Phone").val(commonJs.is_obj_exist(networkSearchInfo.s360PhoneNo));
        $(".webSearchMsg .s360Addr").val(commonJs.is_obj_exist(networkSearchInfo.s360Addr));
    }
    // 网络搜索--初始化显示已有数据
    networkSearch(event){
        let that=this;
        if(event && event.target){
            commonJs.content_toggle(event);
        }
        let _loanNumber=this.state.loanNumber;
        if(!_loanNumber){
            return;
        }
        $.ajax({
            type:"get",
            url:"/companySearch/networkSearch",
            async:false,
            dataType: "JSON",
            data:{loanNumber:_loanNumber},
            success:function(res) {
                let _getData = res.data;
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        networkSearchInfo:{}
                    },()=>{
                        $(".webSearchMsg .bdPhone").val("");
                        $(".webSearchMsg .bdAddr").val("");
                        $(".webSearchMsg .sougoPhone").val("");
                        $(".webSearchMsg .sougoAddr").val("");
                        $(".webSearchMsg .s360Phone").val("");
                        $(".webSearchMsg .s360Addr").val("");
                    })
                    that.cancelWebSch();
                    return;
                }
                that.setState({
                    networkSearchInfo:_getData.networkSearchInfo?_getData.networkSearchInfo:{}
                },()=>{
                    $(".webSearchMsg .bdPhone").val(commonJs.is_obj_exist(_getData.networkSearchInfo.bdPhoneNo));
                    $(".webSearchMsg .bdAddr").val(commonJs.is_obj_exist(_getData.networkSearchInfo.bdAddr));
                    $(".webSearchMsg .sougoPhone").val(commonJs.is_obj_exist(_getData.networkSearchInfo.sougouphoneNo));
                    $(".webSearchMsg .sougoAddr").val(commonJs.is_obj_exist(_getData.networkSearchInfo.sougouAddr));
                    $(".webSearchMsg .s360Phone").val(commonJs.is_obj_exist(_getData.networkSearchInfo.s360PhoneNo));
                    $(".webSearchMsg .s360Addr").val(commonJs.is_obj_exist(_getData.networkSearchInfo.s360Addr));
                })
                that.cancelWebSch();
            }
        })
    }

    //网络搜索--归属地查询
    searchPhoneCity(event){
        if(event.keyCode == 13){
            let $this=$(event.target);
            let _parent=$this.closest("li");
            let regPhone=/^[0-9]||-/g;
            let _phoneNo=_parent.find(".ws-phoneInput").val();
            if(!regPhone.test(_phoneNo)){
                alert("请输入正确的电话号码！");
                return;
            }
            $.ajax({
                type:"get",
                url:"/companySearch/searchPhoneCity",
                async:false,
                dataType: "JSON",
                data:{ phoneNo:_phoneNo },
                success:function(res) {
                    let _getData = res.data;
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    _parent.find(".ws-addrInput").val(commonJs.is_obj_exist(_getData.province));
                }
            })
        }
    }
    //网络搜索电话号码和个人信息有相同时标红显示  _phone本页面已有数据
    webSearchPhoneRed(_phone){
        if(!_phone || typeof(_phone)==undefined || _phone=="-"){
            return;
        }
        let userModlePhone=this.state.allPhoneNo?this.state.allPhoneNo:{};
        for( let key in userModlePhone){
            _phone=_phone.replace(/-/g,"").replace(/ /g,"");
            if(userModlePhone[key]==_phone){
                return true;
            }
        }
        return false;
    }
    render() {
        return (
            <div className="toggle-box webSearchMsg-div">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit on" onClick={this.networkSearch.bind(this)}>
                    网络搜索
                    <i className="right bar-tit-toggle bar-tit-toggle-up" ></i>
                </h2>
                <div className="bar mt5 clearfix">
                    <ul className="webSearMsg-th">
                        <li>渠道来源</li>
                        <li>电话号码</li>
                        <li>归属地</li>
                    </ul>
                    <div className="clear"></div>
                    <ul className="webSearchMsg webNormal">
                    {/* webNormal 展示状态   webEdit 编辑状态  */}
                        <li className="bd-bg clearfix">
                            <div className="left sch-edit-div">
                                <div className="bd-border clearfix">
                                    <label className="sch-label bd-search">百度搜索</label>
                                    <button className="BDsearch-btn webSbtn" onClick={this.toWebSearch.bind(this,"https://www.baidu.com/s?wd=")}><i></i></button>
                                </div>
                            </div>
                            <div className="left sch-edit-div">
                                <b className={this.webSearchPhoneRed(this.state.networkSearchInfo.bdPhoneNo)?"red":""}>
                                    {commonJs.is_obj_exist(this.state.networkSearchInfo.bdPhoneNo)}
                                </b>
                                <input type="text" className="input searchMsg bdPhone ws-phoneInput" placeholder="请输入" onKeyUp={this.searchPhoneCity.bind(this)} />
                            </div>
                            <div className="left sch-edit-div">
                                <b>
                                    {commonJs.is_obj_exist(this.state.networkSearchInfo.bdAddr)}
                                </b>
                                <input type="text" className="input bdAddr ws-addrInput" placeholder="请输入" />
                            </div>
                        </li>
                        <li className="sg-bg clearfix">
                            <div className="left sch-edit-div">
                                <div className="sg-border clearfix">
                                    <label className="sch-label sg-search">搜狗搜索</label>
                                    <button className="SGsearch-btn webSbtn" onClick={this.toWebSearch.bind(this,"https://www.sogou.com/sie?query=")}><i></i></button>
                                </div>
                            </div>
                            <div className="left sch-edit-div">
                                <b className={this.webSearchPhoneRed(this.state.networkSearchInfo.sougouphoneNo)?"red":""}>
                                    {commonJs.is_obj_exist(this.state.networkSearchInfo.sougouphoneNo)}
                                </b>
                                <input type="text" className="input searchMsg sougoPhone ws-phoneInput" placeholder="请输入" onKeyUp={this.searchPhoneCity.bind(this)} />
                            </div>
                            <div className="left sch-edit-div">
                                <b>{commonJs.is_obj_exist(this.state.networkSearchInfo.sougouAddr)}</b>
                                <input type="text" className="input sougoAddr ws-addrInput" placeholder="请输入" />
                            </div>
                        </li>
                        <li className="s60-bg clearfix">
                            <div className="left sch-edit-div">
                                <div className="s60-border clearfix">
                                    <label className="sch-label s60-search">360搜索</label>
                                    <button className="S60search-btn webSbtn" onClick={this.toWebSearch.bind(this,"https://www.so.com/s?q=")}><i></i></button>
                                </div>
                            </div>
                            <div className="left sch-edit-div">
                                <b className={this.webSearchPhoneRed(this.state.networkSearchInfo.s360PhoneNo)?"red":""}>
                                    {commonJs.is_obj_exist(this.state.networkSearchInfo.s360PhoneNo)}
                                </b>
                                <input type="text" className="input searchMsg s360Phone ws-phoneInput" placeholder="请输入" onKeyUp={this.searchPhoneCity.bind(this)} />
                            </div>
                            <div className="left sch-edit-div">
                                <b>{commonJs.is_obj_exist(this.state.networkSearchInfo.s360Addr)}</b>
                                <input type="text" className="input s360Addr ws-addrInput" placeholder="请输入" />
                            </div>
                        </li>
                    </ul>
                    <div className="clearfix border-top pt10 pl20 pb10">
                        <button className="left block edit btn-blue mr10" onClick={this.webSearchEdit.bind(this)}>编辑</button>
                        <button className="left btn-white block cancle_edit hidden"onClick={this.cancelWebSch.bind(this)}>取消</button>
                    </div>
                </div>
            </div>
        );
    }
};

export default WebSearch;
