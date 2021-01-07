// 电话详情
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import $ from 'jquery';

class PhoneMsg extends React.Component {
    constructor(props){
        super(props);
        this.state={
            nationalId:this.props._nationalId,   //身份证号
            accountId:this.props.prev_params,
            phonecallAuthInfoDTO:{},
            phonecallListInfoDTOS:[]
        }
    }
    UNSAFE_componentWillMount(){
        this.getMst();
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        
    }
    componentDidMount (){
        commonJs.reloadRules();
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 200);
        }  
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
    }
    //获取页面信息
    getMst(){
        let that=this;
        let _nationalId=this.state.nationalId;
        if(!_nationalId){
            return;
        }
        let _accountId=this.state.accountId;
        if(!_accountId){
            return;
        }
        $.ajax({
			type:"post",
			url:"/node/getBills",
            async:true,
			dataType:"JSON",
            timeout : 30000, //超时时间设置，单位毫秒
            data:{
                nationalId:_nationalId,
                accountId:_accountId,
                // nationalId:"230602198705281186",
                // accountId:"5565077"
            },
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
			success:function(res){
				commonJs.ajaxGetCode(res);
                var _getData = res.data;
                if(!_getData.executed){
                    $("#loading").remove();
                    return;
                }
                that.setState({
                    phonecallAuthInfoDTO:_getData.phonecallAuthInfoDTO?_getData.phonecallAuthInfoDTO:{},  //基本信息
                    phonecallListInfoDTOS:_getData.phonecallListInfoDTOS?_getData.phonecallListInfoDTOS:[], //电话清单列表
                    bills:_getData.bills?_getData.bills:{}
                },()=>{
                    $("#loading").remove();
                    //加载默认信息源信息
                    $(".source-label li").removeClass("on");
                    $(".source-label li:eq(0)").addClass("on");
                })
			},
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
        　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                    $("#loading").remove();
        // 　　　　     ajaxTimeOut.abort(); //取消请求
        　　　　　   alert("请求超时");
        　　　　}
        　　}
		});
    }
    // 操作更新通话清单列表-yif
    switchChange(event){
        let that=this;
        let _nationalId=this.state.nationalId;
        if(!_nationalId){
            return;
        }
        let _accountId=this.state.accountId;
        if(!_accountId){
            return;
        }
        commonJs.switch(event);
        let _switch=$(event.target).closest("td").find(".switch-icon");
        let changedState=1;  //点击后的状态
        if(_switch.hasClass("ON")){  //打开
            changedState=1;
        }else{
            changedState=0;
        }
        let phone_num=$(event.target).closest("tr").find(".phone_num").text();
        let contact_name=$(event.target).closest("tr").find(".contact_name").text();
        $.ajax({
			type:"post",
			url:"/node/opPhoneBill",
            async:true,
			dataType:"JSON",
            data:{
                nationalId:_nationalId,
                accountId:_accountId,
                // nationalId:"230602198705281186",
                // accountId:"5565077",
                status:changedState,
                phone:phone_num,
                name:contact_name,
                gmtAuthorization:this.state.phonecallAuthInfoDTO.lst_auth_time
            },
			success:function(res){
				if (!commonJs.ajaxGetCode(res)) {
                    return;
                } 
                var _getData = res.data;
                alert(_getData.message)
                that.getMst();
			}
		});
    }
    //筛选
    filtrate(event){
        let _val=$(event.target).find("option:selected").attr("value");
        let allContTr=$(".phoneMsgList tr:eq(0)").nextAll();
        allContTr.addClass("hidden");
        if(_val=="1"){  //显示激活的
            allContTr.each(function(){
                if($(this).find(".switch-icon").hasClass("ON")){
                    $(this).removeClass("hidden");
                }else{

                }
            })
        }else if(_val=="0"){  //显示未激活的
            allContTr.each(function(){
                if($(this).find(".switch-icon").hasClass("OFF")){
                    $(this).removeClass("hidden");
                }else{

                }
            })
        }else{
            allContTr.removeClass("hidden");
        }
    }
    trFunction(event){
        if(this.props.phoneCallBackFunc){
            let _name=$(event.target).closest("tr").find(".contact_name").text();
            let _telNo=$(event.target).closest("tr").find(".phone_num").text();
            this.props.phoneCallBackFunc(_name,_telNo);
        }
    }
    render() {
        let phonecallAuthInfoDTO=this.state.phonecallAuthInfoDTO;
        let phonecallListInfoDTOS=this.state.phonecallListInfoDTOS;
        let bills=this.state.bills;
        let accountId=this.state.accountId?this.state.accountId.toString().replace(/\s/g,""):"";
        return (
            <div className="mt10 auto-box pr5">
                <ul className="statistics">
                    <li><span className="lef-line"></span>授权次数<b className="statis-val">{commonJs.is_obj_exist(phonecallAuthInfoDTO.auth_times)}</b></li>
                    <li><span className="lef-line"></span>末次授权时间<b className="statis-val">{commonJs.is_obj_exist(phonecallAuthInfoDTO.lst_auth_time)}</b></li>
                    <li><span className="lef-line"></span>授权期限<b className="statis-val">{commonJs.is_obj_exist(phonecallAuthInfoDTO.begin_auth_time)}至{commonJs.is_obj_exist(phonecallAuthInfoDTO.end_auth_time)}</b></li>
                    <li><span className="lef-line"></span>通讯录数量<b className="statis-val">{commonJs.is_obj_exist(phonecallAuthInfoDTO.fl_contacts_cnt)}</b></li>
                    <li><span className="lef-line"></span>运营商标记数量<b className="statis-val">{commonJs.is_obj_exist(phonecallAuthInfoDTO.operator_flag_cnt)}</b></li>
                </ul>
                <table className="table radius-tab mt10 phoneMsgList layout-fixed">
                    <tbody>
                        <tr>
                            <th width="20%">手机号</th>
                            <th width="10%">IB</th>
                            <th width="10%">OB</th>
                            <th width="10%">联系人</th>
                            <th width="10%">关系</th>
                            <th width="15%">通讯录标记</th>
                            <th width="15%">运营商标记</th>
                            <th>
                                <select name="" id="" className="select-gray" onChange={this.filtrate.bind(this)}>
                                    <option value="">全部</option>
                                    <option value="1">有效</option>
                                    <option value="0">无效</option>
                                </select>
                            </th>
                        </tr>
                        {
                            phonecallListInfoDTOS.length>0 ? phonecallListInfoDTOS.map((repy,i)=>{
                                let _status=bills[commonJs.is_obj_exist(repy.phone_num)+"|"+commonJs.is_obj_exist(accountId)+"|"+commonJs.is_obj_exist(repy.contact_name)+"|"+commonJs.is_obj_exist(phonecallAuthInfoDTO.lst_auth_time)];
                                return <tr key={i} onClick={this.trFunction.bind(this)}>
                                        <td width="20%" className="phone_num" title={commonJs.is_obj_exist(repy.phone_num)}>{commonJs.is_obj_exist(repy.phone_num)}</td>
                                        <td width="10%" title={commonJs.is_obj_exist(repy.call_in_cnt)}>{commonJs.is_obj_exist(repy.call_in_cnt)}</td>
                                        <td width="10%" title={commonJs.is_obj_exist(repy.call_out_cnt)}>{commonJs.is_obj_exist(repy.call_out_cnt)}</td>
                                        <td width="10%" className="contact_name" title={commonJs.is_obj_exist(repy.contact_name)}>{commonJs.is_obj_exist(repy.contact_name)}</td>
                                        <td width="10%" title={commonJs.is_obj_exist(repy.contact_relation)}>{commonJs.is_obj_exist(repy.contact_relation)}</td>
                                        <td width="15%" title={commonJs.is_obj_exist(repy.fl_conlist_flag)}>{commonJs.is_obj_exist(repy.fl_conlist_flag)}</td>
                                        <td width="15%" title={commonJs.is_obj_exist(repy.operator_flag)}>{commonJs.is_obj_exist(repy.operator_flag)}</td>
                                        <td>
                                            <label className={(_status=="0")?"switch-icon OFF":"switch-icon ON"} onClick={this.switchChange.bind(this)}><i></i></label>
                                        </td>
                                    </tr>
                            }):<tr><td colSpan="8" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        
                    </tbody>
                </table>
            </div>
        );
    }
};
export default PhoneMsg;