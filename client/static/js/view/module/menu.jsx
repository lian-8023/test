// 内部portal菜单组件
import React,{PureComponent} from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import A2MenuConfig from '../../template/a2Menu';  // menu config
import {observer,inject} from "mobx-react";
import callCofig from '../../template/callSystemConfig';//呼叫配置
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class Menu extends React.Component{
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            XWlogin:false,
            account:'',
            password:'',
            agentNumber:"",
            orderCallbackCount:0,
            tianrAcc:{},//天润账号
            adminCode:"",
            loginname:"",
            accessryInfo:{
                viewPhone:"NO",//是否能看到完整号码
                callByTianr:"YES",//是否使用天润呼叫，YES=天润，NO=800
            },//附加参数
        }
    }
    UNSAFE_componentWillMount(){
       this.loadAdminTianR();
    }
    UNSAFE_componentWillReceiveProps(){
        // 左侧导航状态
        let _location=this.props.location.pathname;
        $(".tree li").removeClass("on");
        $(".tree").find("[data-to='"+_location+"']").addClass("on");
    }
    componentDidMount(){
        //点击页面隐藏 creditModel结果 弹窗
        // $(document).bind('click',function(e){ 
        //     var e = e || window.event; //浏览器兼容性 
        //     var elem = e.target || e.srcElement; 
        //     while (elem) { //循环判断至跟节点，防止点击的是div子元素 
        //         if (elem.id && elem.id=='phoneCtrl') { 
        //             return; 
        //         } 
        //         if($(elem).closest(".phoneCtrl").length>0){
        //             return;
        //         }
        //     elem = elem.parentNode; 
        //     } 
        //     $(".phoneCtrl,.normal-state,.normal-state-open,.normal-state-logined").addClass("hidden");
        //     $(".adminCtrl").removeClass("hidden");
        // }); 

        commonJs.reloadRules();
        // 左侧导航状态
        let _location=this.props.location.pathname;
        $(".tree li").removeClass("on");
        $(".tree").find("[data-to='"+_location+"']").addClass("on");
        //用户设置界面--初始化状态
        var w = document.documentElement.clientWidth;
	    var h = document.documentElement.clientHeight;
        $(".menu").css("min-height",h);
        $(".adminCtrl").removeClass("hidden");
        $(".phoneCtrl").addClass("hidden");
        $(".adminCtrl,.phoneCtrl").css({
            "width":$(".menu").width()-16,
            "max-width":"115px"
        });
        $(".phoneCtrl .log-out,.phoneCtrl .call").addClass("hidden");
	    $(".phoneCtrl .login").removeClass("hidden");

        var isFocus=true;
        $(".phone").hover(function(){
            switch (callCofig.sys) {
                case 'new':
                    if(isFocus){
                        $(".adminCtrl").addClass("hidden");
                        $(".phoneCtrl,.normal-state").removeClass("hidden");
                        isFocus=false;
                    }
                    break;
                
                default:
                    if(isFocus && $(".normal-state-open").hasClass("hidden") && $(".call-state").hasClass("hidden") && $(".call-state-open").hasClass("hidden") && $(".no-call-state-open").hasClass("hidden")){
                        $(".adminCtrl").addClass("hidden");
                        $(".phoneCtrl,.normal-state").removeClass("hidden");
                        isFocus=false;
                    }
                    break;
            }
        },function(){
            if($(".normal-state").is(":visible")){
                $(".adminCtrl").removeClass("hidden");
                $(".phoneCtrl").addClass("hidden");
                isFocus=true;
            }
        })
        //展开正常状态
        $(".normal-state").click(()=>{
            let type=$('.normal-state-logined').attr("type");
            if(this.state.XWlogin){
                $('.CCBARBOX').removeClass('hidden');
                $('.normal-state').addClass('hidden');
            }else{
                if(!type){
                    $(".normal-state").addClass("hidden");
                    $(".normal-state-open").removeClass("hidden");
                }else{
                    $(".normal-state").addClass("hidden");
                    $(".normal-state-open").addClass("hidden");
                    $(".normal-state-logined").removeClass("hidden");
                }
            }
        })
        //正常状态--收起
        $(".white-down-icon").click(function(){
            $(".normal-state,.normal-state-open,.normal-state-logined").addClass("hidden");
            $(".normal-state").removeClass("hidden");
        })
        //电话类型
        $(".ctrl-selec .show-selec").click(function(){
            let _parent=$(this).closest(".ctrl-selec");
            let showList=_parent.find(".selec-list").hasClass("hidden");
            if(showList){
                _parent.find(".selec-list").removeClass("hidden");
            }else{
                _parent.find(".selec-list").addClass("hidden");
            }
        })
        //设置左侧menu滚动高度
        $(".tree-box").height(h-220);
		let treeOuterHeight=$(".tree").outerHeight(true);
        let treeHeight=$(".tree-box").height();
        if(treeOuterHeight>treeHeight){
            $(".tree-box").css("overflow-y","scroll");
        }else{
            $(".tree-box").css("overflow-y","hidden");
        }
        //隐藏
        $('.phone-icon').click(()=>{
            if(this.state.XWlogin){
                $('.CCBARBOX').addClass('hidden');
                $('.normal-state').removeClass('hidden');
            }
        })
    }
    loadAdminTianR(){
        var _that = this;
        $.ajax({
            type:"get",
            url:"/common/admin/tianr",
            async:true,
            dataType: "JSON",
            success:function(res) {
                var _getData = res.data;
                var tianrAcc = {};
                if(_getData.dto){
                    tianrAcc= _getData.dto;
                }
                _that.commonStore.loginname=_getData.loginname;
                _that.commonStore.adminCode=_getData.adminCode;
                _that.commonStore.loginname_cn=_getData.name;
                _that.setState({
                    tianrAcc:tianrAcc,
                    adminCode:_getData.adminCode,
                    loginname:_getData.loginname,
                    accessryInfo:{
                        viewPhone:_getData.viewPhone,
                        callByTianr:_getData.callByTianr
                    }
                })
            }
        })
    }

    CCBARBOX = () =>{
        $('.CCBARBOX #CCBAR').remove();
        $('.CCBARBOX').append('<div class="hidden" id="CCBAR" style="width: 300px; background: rgba(83, 152, 226, 0.8);"></div>');
    }

    /* 新呼叫系统接入 */
    access=(account,password)=>{
        if(this.state.account == ''){
            alert('请输入坐席号');
            return
        }
        if(this.state.password == ''){
            alert('请输入密码');
            return
        }
        this.CCBARBOX();
        $('.normal-state-open').addClass('hidden');
        $('#CCBAR').removeClass('hidden');
        $('.CCBARBOX').removeClass('hidden');
        callCofig.Ccbar = new D9ccbar.Init({
            element: 'CCBAR',
            enterprise: 'xyd6981',
            account: this.state.account,
            password:this.state.password,
            skillGroupId: 849,
            isAuto: true,
            callback:(v)=>{
                console.log(v);
            }
        });
        
        callCofig.Ccbar.getWebSocketSubject().subscribe(res => {
            console.log(res);
            // 状态回调消息
            var body = JSON.parse(res.body);
            if (body.type === 2) { // 坐席状态
                if (body.msg.statusCode === 4 || body.msg.statusCode === 5) { // 呼叫坐席中 || 坐席振铃中
                
                    // 自动接听(普通外呼)
                    callCofig.Ccbar.accept();
                }
            }

            // ...
        });
        callCofig.Ccbar.getWebRTCSubject().subscribe(res => {
            console.log(res);
            if(res.code == 6007){
                alert(res.msg);
            }
            if(res.code==1000){
                alert('呼叫系统登录失效');
            }
            // sip回调消息
            // TODO
        });
        callCofig.Ccbar.getInterfaceSubject().subscribe(res => {
            console.log(res);
            if(res.code == 27004||res.code == 27005||res.code == 11005){
                $('.hpM8hriv5LemeOpG0InWK','#CCBAR').click(()=>{
                    $('#CCBAR').addClass('hidden');
                    $('.CCBARBOX').addClass('hidden');
                    $('.normal-state-open').removeClass('hidden');
                })
            }
            if(res.code == 28006){
                alert(res.msg)
            }
            if(res.code == 2002){
                this.setState({
                    XWlogin:true,
                })
                $("#CCBAR").css('background','rgba(237, 242, 247, 0.9019607843137255)');
            }
            // ccbar.getDisplayNumbers()
            /*
           alert(res.msg) */
            // 接口回调消息
            // TODO
        });

    }
    render() {
        let _location=this.props.location.pathname;
        var tianrAcc = this.state.tianrAcc?this.state.tianrAcc:{};
        var accessryInfo = this.state.accessryInfo;
        return (
            <div>
                <div className="menu" id="menu">
                    <i className="logo pointer"></i>
                  <div className="tree-box">
                    <ul className="tree tree2A">
                    {
                        A2MenuConfig.map((repy,i)=>{
                            return <li key={i} data-to={repy._url} data-btn-rule={commonJs.is_obj_exist(repy.ruleKey)} className={(_location==repy._url)?"on":""}>
                                        <Link to={repy._url+(repy.query?`?${repy.query}`:'')} id={repy.id}><span title={commonJs.is_obj_exist(repy.title)}>{commonJs.is_obj_exist(repy.title)}</span></Link>
                                    </li>
                        })
                    }
                    </ul>
                  </div>
                <div className="menu-botton">
                    <div className="admin option-div">
                        <i className="admin-icon o-icon"></i>
                        {/*admin 弹窗*/}
                        <div className="ctrlProp adminCtrl hidden">
                            <i className="down-icon"></i>
                            <div className="state-0 clearfix">
                                <span className="ctrl-t" title={commonJs.is_obj_exist(this.state.loginname)} data-code={commonJs.is_obj_exist(this.state.adminCode)}>{commonJs.is_obj_exist(this.state.loginname)}</span>
                                <a href="/common/loginOut?a2Portal" className="adminCtrl-icon right"></a>
                            </div>
                        </div>
                    </div>
                    {<div className={accessryInfo.callByTianr&&accessryInfo.callByTianr=="YES"?"phone option-div":"phone option-div hidden"}>
                        <i className="phone-icon o-icon"></i>
                        {/*电话 弹窗*/}
                        {
                        callCofig.sys =='new'?<div className="ctrlProp phoneCtrl hidden" id="phoneCtrl">
                             <i className="down-icon"></i> {/*有电话呼入时加上类名   down-icon-yellow     */}
                            {/*--无电话呼入时--默认状态--点击电话按钮时*/}
                            <div className="normal-state clearfix hidden">
                                <span className="ctrl-t">电话</span>
                                <i className="state-icon state-0-icon"></i>
                            </div>
                            {/*无电话呼入时-登录界面--展开状态*/}
                            <div className="normal-state-open clearfix hidden"> {/*展开时=》有电话呼入时加上类名   yellow-shadow */}
                                <div className="have-call hidden">  {/*展开时=》有电话呼入 移除hidden */}
                                    <span className="ctrl-t">有电话呼入</span>
                                    <i className="state-icon state-open-icon"></i>
                                </div>
                                <div className="clear"></div>
                                <ul className="phone-ctrl">
                                    <li>
                                        <p>坐席号</p>
                                        {/* <input className="input callToNo" type="text" id="cno" value='100756800' /> */}
                                        <input className="input callToNo phoneUserName" value={this.state.account} onChange={(v)=>{
                                            this.setState({account:v.currentTarget.value}
                                        )}} type="text" id="cno" placeholder="请输入" />
                                    </li>
                                    <li>
                                        <p>密码</p>
                                        {/* <input className="input callToNo" type="password" id="pwd" value='34872620' /> */}
                                        <input className="input callToNo phonePassword" value={this.state.password}   onChange={(v)=>this.setState({password:v.currentTarget.value})}  type="password" id="pwd" placeholder="请输入" />
                                    </li>
                                </ul>
                                <a onClick={()=>{this.access()}} className="btn-yellow block login">登录</a>
                                <a href="" className="btn-blue block cancle log-out" onClick={logout}>取消</a>
                                {/*<a className="btn-blue block cancle call" onClick={testCall}>呼叫测试</a>*/}
                                <div className="white-down">
                                    <i className="white-down-icon mt10 mb5"></i>
                                </div>
                            </div>
                            <div className='CCBARBOX hidden'>
                                <div className="hidden" style={{width:'300px', background: 'rgba(83, 152, 226, 0.8)'}} id="CCBAR"></div>
                            </div>
                        </div>:<div className="ctrlProp phoneCtrl hidden" id="phoneCtrl">
                            <i className="down-icon"></i> {/*有电话呼入时加上类名   down-icon-yellow     */}
                            {/*--无电话呼入时--默认状态--点击电话按钮时*/}
                            <div className="normal-state clearfix hidden">
                                <span className="ctrl-t">电话</span>
                                <i className="state-icon state-0-icon"></i>
                            </div>
                            {/*无电话呼入时-登录界面--展开状态*/}
                            <div className="normal-state-open clearfix hidden"> {/*展开时=》有电话呼入时加上类名   yellow-shadow */}
                                <div className="have-call hidden">  {/*展开时=》有电话呼入 移除hidden */}
                                    <span className="ctrl-t">有电话呼入</span>
                                    <i className="state-icon state-open-icon"></i>
                                </div>
                                <div className="clear"></div>
                                <ul className="phone-ctrl">
                                    <li>
                                        <p>坐席号</p>
                                        {/* <input className="input callToNo" type="text" id="cno" value='100756800' /> */}
                                        <input className="input callToNo phoneUserName" type="text" id="cno" placeholder="请输入" />
                                    </li>
                                    <li>
                                        <p>密码</p>
                                        {/* <input className="input callToNo" type="password" id="pwd" value='34872620' /> */}
                                        <input className="input callToNo phonePassword" type="password" id="pwd" placeholder="请输入" />
                                    </li>
                                </ul>
                                <a className="btn-yellow block login" id="start">登录</a>
                                <a href="" className="btn-blue block cancle log-out" onClick={logout}>取消</a>
                                {/*<a className="btn-blue block cancle call" onClick={testCall}>呼叫测试</a>*/}
                                <div className="white-down">
                                    <i className="white-down-icon mt10 mb5"></i>
                                </div>
                            </div>
                            
                            {/* 登录后界面 */}
                            <div className="normal-state-logined clearfix hidden"> {/*展开时=》有电话呼入时加上类名   yellow-shadow */}
                                <div className="have-call hidden">  {/*展开时=》有电话呼入 移除hidden */}
                                    <span className="ctrl-t">有电话呼入</span>
                                    <i className="state-icon state-open-icon"></i>
                                </div>
                                <div className="clear"></div>
                                <p className='mt10'>登录成功</p>
                                <ul className="phone-ctrl">
                                    <li>
                                        <p>呼叫号码</p>
                                        <input className="input callToNo" id="phoneno" name="phoneno" type="text" size='15' />
                                    </li>
                                </ul>
                                <a id="dial" className="btn-yellow block online mt5">拨号</a>
                                <a id="hangup" className="btn-yellow block mt5 hidden">挂机</a>
                                <div className="white-down">
                                    <i className="white-down-icon mt10 mb5"></i>
                                </div>
                            </div>

                            {/*有电话呼入时--收起状态*/}
                            <div className="call-state clearfix hidden"> 
                                <span className="ctrl-t">有电话呼入</span>
                                <i className="state-icon call-state-icon"></i>
                            </div>
                            {/*有电话呼入时--展开状态--呼入电话信息*/}
                            <div className="call-state-open clearfix hidden">
                                <div className="call-state-t">
                                    <i className="state-icon call-open-icon"></i>
                                    <span className="ctrl-t-open">呼入电话</span>
                                </div>
                                <div className="clear"></div>
                                <ul className="call-msg">
                                    <li>
                                        <p>来电电话</p>
                                        <b className="comeingPhoneNo"></b>
                                    </li>
                                    <li>
                                        <p>姓名</p>
                                        <b className="accName"></b>
                                    </li>
                                </ul>
                                <a   id="Answer" className="btn-yellow block online mt5">接听</a>
                                <div className="white-down">
                                    <i className="white-down-icon mt10 mb5"></i>
                                </div>
                            </div>
                            {/*呼入电话信息]无电话呼入时信息*/}
                            <div className="no-call-state-open clearfix hidden"> {/*展开时=》有电话呼入时加上类名   yellow-shadow     */}
                                <div className="no-call-state-t">
                                    <i className="state-icon call-open-icon"></i>
                                    <span className="ctrl-t">呼入电话</span>
                                </div>
                                <div className="clear"></div>
                                <div className="no-call-tip">无电话呼入…</div>
                                <div className="white-down">
                                    <i className="white-down-icon mt10 mb5"></i>
                                </div>
                            </div>
                        </div>}
                        {/*电话 弹窗 end*/}
                    </div>}

                    <div className="option option-div">
                        <i className="option-icon o-icon"></i>
                    </div>
                </div>
                </div>
                {this.props.children}
            </div>
        );
    }
};

export default Menu;
