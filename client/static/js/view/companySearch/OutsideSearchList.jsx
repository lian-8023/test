// 公司搜索=》外部查询
import React,{PureComponent} from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class OutsideSearchList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            dafengDimData:"",  //大蜂模糊查询显示数据
            queueStatusId:this.props.queueStatusId,
            dafengReturnCompanyInfoDTO:{} //精确搜索结果
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        $(".sourceEnter-ico").removeClass("glass-icon").addClass("edit-icon");
        $(".SoureCpy-inp").prop("disabled","true").addClass("no-border");
        $(".save-btn,.cancleSource").addClass("hidden");
        this.setState({
            queueStatusId:nextProps.queueStatusId,
            dafengReturnCompanyInfoDTO:{}
        })
    }
    componentDidMount(){
        //点击页面隐藏 外部查询模糊搜索的结果 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='dim-search') { 
                    return; 
                } 
                if($(elem).closest(".dim-search").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $(".dim-search").addClass("hidden");
        });
    }
    //数据来源点击查询 精确查询
    dataSource_btn(event){
        let _that=this;
        let $this=$(event.target);
        if($(event.target).hasClass("sourceEnter-ico")){
            $this=$(event.target).closest(".sourceEnter");
        }
        let _current=$this.find("i");
        if(_current.hasClass("edit-icon")){
            _current.removeClass("edit-icon").addClass("glass-icon");
            $(".SoureCpy-inp").removeProp("disabled").removeClass("no-border");
            $(".cancleSource").removeClass("hidden");
        }else{
            _current.removeClass("glass-icon").addClass("edit-icon");
            $(".SoureCpy-inp").prop("disabled","true").addClass("no-border");
            let dataSource=$(".source-select").text();
            let _companyName=$(".SoureCpy-inp").val();
            var show_dim_search=$(".dim-search").hasClass("hidden");
            if(!show_dim_search){
                $(".dim-search").addClass("hidden");
            }
            let ajaxTimeOut=$.ajax({
                type: "get",
                url: "/companySearch/getCompanyPhoneByName",
                async: false,
                timeout : 30000, //超时时间设置，单位毫秒
                data: {
                    companyName: _companyName
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
                    $(".save-btn").removeClass("hidden");
                    $("#loading").remove();
                    // $(".cancleSource").addClass("hidden");
                    // $(".save-btn").addClass("hidden");
                    $(".sourceEnter-ico").removeClass("edit-icon").addClass("glass-icon");
                    $(".SoureCpy-inp").removeProp("disabled").removeClass("no-border");
                    commonJs.ajaxGetCode(res);
    
                    let _getData = res.data;
                    if (!_getData.executed) {
                        _that.showOutcont({},false);
                        $("#loading").remove();
            　　　　     ajaxTimeOut.abort(); //取消请求
                        return;
                    }
                    $("#loading").remove();
                    let _dafengReturnCompanyInfoDTO=_getData.dafengReturnCompanyInfoDTO?_getData.dafengReturnCompanyInfoDTO:{};
                    _that.setState({
                        dafengReturnCompanyInfoDTO:_dafengReturnCompanyInfoDTO
                    })
                    _that.showOutcont(_dafengReturnCompanyInfoDTO,false);
                },
                complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
            　　　　if(status=='timeout'){//超时,status还有success,error等值的情况
                        $("#loading").remove();
            　　　　     ajaxTimeOut.abort(); //取消请求
            　　　　　   alert("请求超时");
            　　　　}
            　　}
            })
        }
    }
    //取消编辑
    cancleSource(event){
        let $this=$(event.target);
        $this.parent().addClass("hidden");
        $(".sourceEnter-ico").removeClass("glass-icon").addClass("edit-icon");
        $(".SoureCpy-inp").prop("disabled","true").addClass("no-border");
        $(".save-btn").addClass("hidden");
        this.showOutcont(this.state.dafengReturnCompanyInfoDTO,true);
    }
    // 模糊查询 SoureCpy-inp
    dimHandle(event){
        let _dataSource=$(".source-select").text();
        let _companyName=$(event.target).val();
        let dfData=this.dimHandle_ajax(_companyName,_dataSource);
        if(typeof(dfData.companys)=="undefined" || dfData.companys==""){
            return;
        }
        this.setState({
            dafengDimData:dfData.companys
        },()=>{
            var show_dim_search=$(".dim-search").hasClass("hidden");
            if(show_dim_search){
                $(".dim-search").removeClass("hidden");
            }
        })
    }
    //模糊查询ajax方法
    dimHandle_ajax(_companyName,_dataSource){
        let _that=this;
        var dimData="";
        $.ajax({
            type: "get",
            url: "/companySearch/getCompanyQuery",
            async: false,
            data: {
                companyName: _companyName,
                dataFrom: _dataSource
            },
            dataType: "JSON",
            success: function (res) {
                let _getData = res.data;
                if (!_getData.executed) {
                    _that.showOutcont({},true);
                    console.log("数据来源模糊查询获取数据失败");
                    return;
                }
                dimData=_getData;
            }
        })
        return dimData;
    }
    // 保存公司搜索记录--外部查询 
    saveSearchNotes(){
        var show_dim_search=$(".dim-search").hasClass("hidden");
        if(!show_dim_search){
            $(".dim-search").addClass("hidden");
        }
        let _that=this;
        var _accountId="";
        var _loanNumber="";
        var _customerId="";
        var _dataFrom=$(".source-select").text();
        var _CompanyPhone=$(".companyPhone").text();
        if(!this.props._accountId || this.props._accountId=="-"){
            alert("请先完成搜索！");
            return;
        }
        $.ajax({
            type:"get",
            url:"/companySearch/saveCompanyQueryRecord",
            async:false,
            dataType: "JSON",
            data:{
                accountId:this.props._accountId,
                loanNumber:this.props._loanNumber,
                companyName:$(".SoureCpy-inp").val(),
                dataFrom:_dataFrom,
                customerId:this.props._customerId,
                CompanyPhone:_CompanyPhone,
                registerNumber:$(".registerNumber").text(),  //注册号
                companyRegisterTime:$(".companyRegisterTime").text(),  //注册时间
                companyRegisterAddress:$(".companyRegisterAddress").text(),  //注册地址
                companyRegisterStatus:$(".companyRegisterStatus").text(),  //企业登记状态
                corporation:$(".corporation").text(),  //法人
                corporationType:this.state.dafengReturnCompanyInfoDTO?this.state.dafengReturnCompanyInfoDTO.corporationType:"",  //企业类型
            },
            success:function(res) {
                $(".sourceEnter-ico").removeClass("glass-icon").addClass("edit-icon");
                $(".SoureCpy-inp").prop("disabled","true").addClass("no-border");
                $(".save-btn,.cancleSource").addClass("hidden");
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData=res.data;
                alert(_getData.message);
                // $(".SoureCpy-inp,.area-code,.phone-No,.phone-wh,.registerNumber,.companyRegisterTime,.companyRegisterAddress,.companyRegisterStatus,.corporation").val("");
                _that.getMsg("RELOAD");
            }
        })
    }
    //模糊查询列表点击
    valToInput(event){
        let self=$(event.target);
        let theLi=self.text();
        $(".SoureCpy-inp").val(theLi);
        self.parent().addClass("hidden");
    }

    /**
     * 外部查询展示信息
     * @param {*} obj 展示的数据对象
     * @param {*} updateCompanyName 是否需要更新（还原）公司名称 true：更新 false：不更新
     */
    showOutcont(obj,updateCompanyName){
        if(updateCompanyName){
            if(JSON.stringify(obj)!="{}"){
                $(".SoureCpy-inp").val(commonJs.is_obj_exist(obj.companyName));
            }else{
                $(".SoureCpy-inp").val(commonJs.is_obj_exist(this.state.workInfo_company));
            }
        }
        let o_registerNumber=commonJs.is_obj_exist(obj.registerNumber);
        $(".registerNumber").text(o_registerNumber).attr("title",o_registerNumber);
        let o_companyRegisterStatus=commonJs.is_obj_exist(obj.companyRegisterStatus);
        $(".companyRegisterStatus").text(o_companyRegisterStatus).attr("title",o_companyRegisterStatus);
        let o_companyRegisterTime=commonJs.is_obj_exist(obj.companyRegisterTime);
        $(".companyRegisterTime").text(o_companyRegisterTime).attr("title",o_companyRegisterTime);
        let o_corporation=commonJs.is_obj_exist(obj.corporation);
        $(".corporation").text(o_corporation).attr("title",o_corporation);
        let o_companyRegisterAddress=commonJs.is_obj_exist(obj.companyRegisterAddress);
        $(".companyRegisterAddress").text(o_companyRegisterAddress).attr("title",o_companyRegisterAddress);
        let o_companyPhone=commonJs.is_obj_exist(obj.companyPhone);
        $(".companyPhone").text(o_companyPhone).attr("title",o_companyPhone);

        
    }
    render() {
        let cont=this.state._cont?this.state._cont:[];
        let is_dafengDimData=(this.state.dafengDimData && this.state.dafengDimData.length>0);
        var dafengReturnCompanyInfoDTO=this.state.dafengReturnCompanyInfoDTO?this.state.dafengReturnCompanyInfoDTO:{};  //本页面外部查询出的信息
        return (
            <div className="bar mt5 clearfix pl20 pt20 source-select-tab">
                <div className="clearfix">
                    <span className="left pr10 tit-font border-bottom pb10">数据来源</span>
                    <b className="left pr20 source-select">大蜂</b>
                    <span className="left tit-font pr10">单位名称</span>
                    <div className="left soure-search-Cpy">
                        <input type="text" className="left input mr10 SoureCpy-inp no-border" disabled="true" onChange={this.dimHandle.bind(this)} />
                        <ul className={is_dafengDimData?"dim-search":"dim-search hidden"} id="dim-search">
                            {
                                is_dafengDimData?this.state.dafengDimData.map((repy,i)=>{
                                    if (i>4){
                                        return false;
                                    }
                                    return <li key={i} onClick={this.valToInput.bind(this)}>{commonJs.is_obj_exist(repy)}</li>}):""
                            }
                        </ul>
                    </div>
                    {
                        (this.state.queueStatusId && this.state.queueStatusId!=4)?<div className="left sourceEnter" onClick={this.dataSource_btn.bind(this)}>
                                                                    <i className="inline-block edit-icon sourceEnter-ico"></i> {/*glass-icon*/}
                                                            </div>:""
                    }
                    <div className="left cancleSource ml10 hidden">
                            <i className="inline-block edit-icon cancleSource-ico" onClick={this.cancleSource.bind(this)}></i> {/*取消编辑*/}
                    </div>
                </div>
                <div className="border-bottom clearfix">
                    <ul className="outsideDF left" data-id={commonJs.is_obj_exist(dafengReturnCompanyInfoDTO.id)}>
                        <li>注册号：</li>
                        <li className="border-bottom registerNumber"></li>
                        <li>公司注册时间：</li>
                        <li className="border-bottom companyRegisterTime"></li>
                        <li>注册地址：</li>
                        <li className="border-bottom companyRegisterAddress"></li>
                    </ul>
                    <ul className="outsideDF left">
                        <li>登记状态：</li>
                        <li className="border-bottom companyRegisterStatus"></li>
                        <li>法人：</li>
                        <li className="border-bottom corporation"></li>
                        <li>单位电话：</li>
                        <li className="border-bottom companyPhone"></li>
                    </ul>
                </div>
                <button className="right btn-blue mr20 mt10 mb10 save-btn hidden" onClick={this.saveSearchNotes.bind(this)}>保存</button>
            </div>
        );
    }
}
;

export default OutsideSearchList;