// 合作方menu组件
import React from 'react';
import { Router, Route, Link, hashHistory, IndexRoute } from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Icon } from 'antd';
import CPMenuConfig from '../../template/cpMenu';  // menu config
import {observer,inject} from "mobx-react";
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

@inject('allStore') @observer
class CPMenu extends React.Component{
    constructor(props){
        super(props);
        this.commonStore=this.props.allStore.CommonStore; 
        this.state={
            adminCode:"",
            loginname:"",
            menuToggleIco:'left',
            mrgLeft:'0',
            navIcon1:'down',
            navIcon2:'down',
            navIcon3:'down',
        }
    }
    UNSAFE_componentWillReceiveProps(){
        // commonJs.hideMenu(); //二级菜单都无权限时，隐藏一级菜单
        $('.menu-item').removeClass('on');
    }
    componentDidMount(){
        commonJs.reloadRules();
        // commonJs.hideMenu();//二级菜单都无权限时，隐藏一级菜单
        //用户设置界面--初始化状态
        var w = document.documentElement.clientWidth;
	    var h = document.documentElement.clientHeight;
        $(".menu").css("min-height",h);
        $(".adminCtrl").removeClass("hidden");
        $(".adminCtrl").css({
            "width":$(".menu").width()-16,
            "max-width":"115px"
        });
        this.getAdminMsg();  //获取登录信息
        let outerHeight=$(".tree").outerHeight(true);
        let height=$(".tree").height();
        if(outerHeight>height){
            $(".tree").css("overflow-y","scroll");
        }else{
            $(".tree").css("overflow-y","hidden");
        }
        //设置左侧menu滚动高度
        $(".tree-box").height(h-220);
		let CPtreeOuterHeight=$(".tree").outerHeight(true);
        let CPtreeHeight=$(".tree-box").height();
        if(CPtreeOuterHeight>CPtreeHeight){
            $(".tree-box").css("overflow-y","scroll");
        }else{
            $(".tree-box").css("overflow-y","hidden");
        }
    }
    getAdminMsg(){
        var that = this;
        $.ajax({
            type:"get",
            url:"/common/rule/login/admin",
            async:true,
            dataType: "JSON",
            success:function(res) {
                var _getData = res.data;
                let admin=_getData.admin?_getData.admin:{};
                that.commonStore.loginname=admin.loginname;
                that.commonStore.adminCode=admin.adminCode;
                that.commonStore.loginname_cn=admin.name;
                that.setState({
                    loginname:admin.loginname,
                    appCode:admin.appCode
                })
            }
        })
    }
    // 导航点击事件
    navHandle=(i,e)=>{
        let $this=$(e.target);
        if($this.hasClass('navHead')||$this.hasClass('navText')||$this.hasClass('anticon')){
            $this=$(e.target).closest('li');
        }
        let navChild=$this.find('.navChild');
        if(navChild.is(':visible')){
            navChild.slideUp();
            this.setState({
                ['navIcon'+i]:'down'
            })
            if($this.find('.on').length>0){
                $this.addClass('on');
            }
        }else{
            navChild.slideDown();
            this.setState({
                ['navIcon'+i]:'up'
            });
            $this.removeClass('on');
        }
    }
    render() {
        let pathname=this.props.location.pathname;
        let _search=this.props.location.search;
        return (
            <div>
                <div className="menu" id="menu" style={{marginLeft:this.state.mrgLeft}}>
                    <i className="logo pointer"></i>
                    <div className="tree-box">
                        <ul className="tree">
                        {
                            CPMenuConfig.map((repy,i)=>{
                                if(repy.child){
                                    let child_ary=repy.child;
                                    let toggleIcon=`navIcon${repy.iconId}`;
                                    return <li key={i} data-to={commonJs.is_obj_exist(repy._url)} data-btn-rule={commonJs.is_obj_exist(repy.ruleKey)} className="menu-item" onClick={this.navHandle.bind(this,repy.id)}>
                                                <div className='navHead pointer'>
                                                    <span className='navText' title={repy.title} id={repy.id}>{repy.title}</span>
                                                    <Icon type={this.state[toggleIcon]} />
                                                </div>
                                                <ul className="navChild" style={{display:'none'}}>
                                                {
                                                    child_ary.map((r,j)=>{
                                                        let isClassOn1='';
                                                        if(r._url.indexOf('?')>-1){
                                                            isClassOn1=Boolean(pathname+_search==r._url);
                                                        }else{
                                                            isClassOn1=Boolean(pathname==r._url);
                                                        }
                                                        return <li key={j} 
                                                                    data-to={commonJs.is_obj_exist(r._url)} 
                                                                    data-btn-rule={commonJs.is_obj_exist(r.ruleKey)} 
                                                                    className={isClassOn1?"on":""}
                                                                >
                                                                    <Link to={commonJs.is_obj_exist(r._url)} id={r.id}><span title={commonJs.is_obj_exist(r.title)}>{commonJs.is_obj_exist(r.title)}</span></Link>
                                                                </li>
                                                    })
                                                }
                                                </ul>
                                            </li>
                                }else{
                                    let isClassOn2='';
                                    if(repy._url.indexOf('?')>-1){
                                        isClassOn2=Boolean(pathname+_search==repy._url);
                                    }else{
                                        isClassOn2=Boolean(pathname==repy._url);
                                    }
                                    return <li key={i} 
                                                data-to={commonJs.is_obj_exist(repy._url)} 
                                                data-btn-rule={commonJs.is_obj_exist(repy.ruleKey)} 
                                                className={(pathname==repy._url)?"on":""}
                                            >
                                                <Link to={commonJs.is_obj_exist(repy._url)} id={repy.id}><span title={commonJs.is_obj_exist(repy.title)}>{commonJs.is_obj_exist(repy.title)}</span></Link>
                                            </li>

                                }
                            })
                        }
                        </ul>
                    </div>
                    {/*admin*/}
                    <div className="menu-botton">
                        <div className="admin option-div">
                            <i className="admin-icon o-icon"></i>
                            <div className="ctrlProp adminCtrl hidden">
                                <i className="down-icon"></i>
                                <div className="state-0 clearfix">
                                    <span className="ctrl-t" title={commonJs.is_obj_exist(this.state.loginname)} data-code={commonJs.is_obj_exist(this.state.adminCode)}>{commonJs.is_obj_exist(this.state.loginname)}</span>
                                    <a href="/common/loginOut?cooperationPortal" id='loginOut' className="adminCtrl-icon right"></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
};

export default CPMenu;
