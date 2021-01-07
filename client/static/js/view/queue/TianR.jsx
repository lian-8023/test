import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination } from 'antd';  //页码
// import ReactSelectize from "react-selectize";
// var SimpleSelect = ReactSelectize.SimpleSelect;
// var MultiSelect = ReactSelectize.MultiSelect;

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class TianR extends React.Component{
    constructor(props){
        super(props);
        this.state={
            bindData:{},  //页面数据
            adminMaps:{},
            showSelectSize:false,
            barsNum:10,  //每页显示多少条
            currentPage:1  //当前页码
        }
    }
    UNSAFE_componentWillMount(){
        this.getMsg();
    }
    componentDidMount(){
        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
        
        $(".addTR").click(function(){
            // 初始化
            $(".TianR-tab").find(".TR-ctrl").removeClass("saveTR").addClass("editTR");
            $(".TianR-tab").find(".TR-edit-input").remove();
            $(".TianR-tab").find(".SimpleSelect").addClass("hidden");
            $(".addTR-td").find(".SimpleSelect").removeClass("hidden");
            $(".TianR-tab").find(".TianR-cont-span").removeClass("hidden");
            $(".TianR-tab").find(".TianR-cont-tr").removeClass("edit-Ing");

            $(this).addClass("hidden");
            $(".addTR-td").removeClass("hidden");
            $(".addTR-td").addClass("edit-Ing");
        })
    }
    // 删除新增行
    delAddTr_fn(){
        $(".addTR-td input").val("");
        $(".addTR-td").find(".simple-value").find("span").text("");  //用户名
        $(".addTR").removeClass("hidden");
        $(".addTR-td").addClass("hidden");
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            barsNum:pageSize
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        })
    }
    
    //获取页面数据
    getMsg(){
        let _that=this;
        $(".TianR-cont .userName").removeClass("flow-auto");
        $.ajax({
            type:"get",
            url:"/node/tianrList",
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(!_getData.executed){
                    alert("查询天润绑定账号列表失败");
                    return;
                }
                _that.setState({
                    bindData:_getData.dtos?_getData.dtos:[],
                    adminMaps:_getData.adminMaps?_getData.adminMaps:""
                })
            }
        })
    }
    //删除
    delBindRecord(event){
        let $this = $(event.target);
        let _parent=$this.closest("tr");
        let bindId = _parent.attr("data-bind-id");
        if(!bindId||bindId==''){
            alert("不能删除，未获取到记录的唯一标示");
            return;
        }
        var _that = this;
        $.ajax({
            type:"get",
            url:"/node/tianr/del",
            async:true,
            dataType: "JSON",
            data:{id:bindId},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                alert(_getData.message);
                _that.getMsg();
                $this.closest(".TianR-cont-tr").addClass("edit-Ing");
            }
        })

    }
    //新增
    saveBindRecord(event){
        var _that = this;
        let $this = $(event.target);
        let _parent=$this.closest(".TianR-cont-tr");
        _parent.find(".userName").addClass("flow-auto");
        let _data={};
        _data.adminCode=$this.closest(".edit-Ing").find(".SimpleSelect").attr("data-selected-code");  //用户名
        _data.trNo=_parent.find(".seatNo").val();
        _data.trBindTel=_parent.find(".bundPhoneNo").val();
        _data.trHotLinePhone=_parent.find(".hothoneNo").val();
        _data.descr="1";
        var validRes = this.modifyTianrBind(_data);

        if(!validRes){
            return;
        }
        $.ajax({
            type:"get",
            url:"/node/tianr/modify",
            async:false,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                alert("成功");
                _that.getMsg();
                _that.delAddTr_fn();
                $(".addTR-td").removeClass("edit-Ing");
            }
        })
    }

    modifyTianrBind(_data){
        if(!_data.adminCode||_data.adminCode==''){
            alert("必须指定管理员");
            return false;
        }
        if(!_data.trNo||_data.trNo==''){
            alert("必须指定坐席号");
            return false;
        }
        if(!_data.trBindTel||_data.trBindTel==''){
            alert("必须指定绑定电话");
            return false;
        }
        if(!_data.trHotLinePhone||_data.trHotLinePhone==''){
            alert("必须指定热线号码");
            return false;
        }
        return true;
    }
    //编辑 || 保存
    editTR(event){
        let _that=this;
        let $this=$(event.target);
        let _parent=$this.closest(".TianR-cont-tr");

        //编辑
        if($this.parent().hasClass("editTR")){
            // 初始化
            $this.closest(".TianR-tab").find(".TR-ctrl").removeClass("saveTR").addClass("editTR");
            $this.parent().removeClass("editTR").addClass("saveTR");
            $this.closest(".TianR-tab").find(".TR-edit-input").remove();
            $this.closest(".TianR-tab").find(".SimpleSelect").addClass("hidden");
            $this.closest(".TianR-tab").find(".TianR-cont-span").removeClass("hidden");
            $this.closest(".TianR-tab").find(".userName").addClass("flow-auto");
            $(".addTR").removeClass("hidden");
            _parent.addClass("edit-Ing"); //动态增加一个类，用于保存时获取选中的用户名,成功后删除类名
            $(".addTR-td").find(".SimpleSelect").attr("data-selected-code","");
            $(".addTR-td").removeClass("edit-Ing").addClass("hidden");
            $(".addTR-td").find("input").val("");
            
            _parent.find(".TianR-cont-span").addClass("hidden");
            _parent.find(".TR-cont").each(function(){
                $(this).append('<input type="text" class="input TR-edit-input" value='+$(this).text()+' />');
            })
            _parent.find(".SimpleSelect").removeClass("hidden");
        }else{
            //保存
            let _data={};
            _data.adminCode=$this.closest(".edit-Ing").find(".SimpleSelect").attr("data-selected-code");  //用户名
            _data.trNo=_parent.find(".seatNo").find(".TR-edit-input").val();  //坐席号
            _data.trBindTel=_parent.find(".bundPhoneNo").find(".TR-edit-input").val();  //绑定电话
            _data.trHotLinePhone=_parent.find(".hothoneNo").find(".TR-edit-input").val();  //热线电话
            _data.descr="1";
            _data.id=_parent.attr("data-bind-id");
            
            var validRes = this.modifyTianrBind(_data);
            if(!validRes){
                return;
            }
            $.ajax({
                type:"get",
                url:"/node/tianr/modify",
                async:true,
                dataType: "JSON",
                data:_data,
                success:function(res) {
                    if (!commonJs.ajaxGetCode(res)) {
                        return;
                    }
                    _that.getMsg();
                    $this.parent().removeClass("saveTR").addClass("editTR");
                    $this.closest(".TianR-tab").find(".TR-edit-input").remove();
                    _parent.find(".SimpleSelect").addClass("hidden");
                    _parent.find(".TianR-cont-span").removeClass("hidden");
                    _parent.removeClass("edit-Ing");
                    alert("成功");
                }
            })
        }
    }
    
    render() {
        let bindData=this.state.bindData;
        let adminMaps=this.state.adminMaps;
        let adminMapArray = [];
        if(adminMaps){
            for(let key in  adminMaps){
                let _value = adminMaps[key];
                adminMapArray.push({
                    code:_value.code,
                    loginname:_value.loginname,
                });
            }
        }
        return (
            <div className="content" id="content">
                <div className="bar bar-tit pl20"><b>天润账号绑定</b></div>
                <table className="pt-table mt15 TianR-tab flow-auto">
                   <tbody>
                       <tr>
                           <th width="20%">用户名</th>
                           <th width="20%">坐席号</th>
                           <th width="20%">绑定电话</th>
                           <th width="20%">热线电话</th>
                           <th></th>
                       </tr>
                       <tr>
                           <td colSpan="5" className="TianR-cont no_pl flow-auto">
                               <table className="flow-auto" cellPadding={0} cellSpacing={0} frameBorder={0} width="100%">
                                   <tbody>
                                   {
                                       (bindData && bindData.length>0) ? bindData.map((repy,i)=>{
                                           let barsNums=this.state.barsNum;  //每一页显示条数
                                           let currentPage=this.state.currentPage;  //当前页码
                                           if(i>=barsNums*(currentPage-1) && i<=(barsNums*currentPage-1)){
                                               return <tr className="TianR-cont-tr " key={i} data-bind-id={repy.id?repy.id:null}>
                                                        <td width="20%" className="userName">
                                                            <span className="TianR-cont-span">{commonJs.is_obj_exist(adminMaps[repy.adminCode]?adminMaps[repy.adminCode].name:repy.adminCode)}</span>
                                                            <div className="SimpleSelect hidden" id='adminCodeSel' data-selected-code={adminMaps[repy.adminCode]?adminMaps[repy.adminCode].code:repy.adminCode}>
                                                                {/* <SimpleSelect
                                                                    placeholder = {adminMaps[repy.adminCode]?adminMaps[repy.adminCode].name:repy.adminCode}
                                                                    onValueChange = {function(obj){
                                                                        if(obj && typeof(obj)!="undefined"){
                                                                            $(".edit-Ing .SimpleSelect").attr("data-selected-code",obj.value);
                                                                        }
                                                                    }}
                                                                >
                                                                {
                                                                    (adminMapArray&&adminMapArray.length>0) ? adminMapArray.map((repy,i)=>{
                                                                        return <option value = {repy.code} key={i}>{repy.loginname}</option>
                                                                    }):<option value = "">没有数据</option>
                                                                }
                                                                </SimpleSelect> */}
                                                            </div>
                                                        </td>
                                                        <td width="20%" className="TR-cont seatNo">
                                                            <span className="TianR-cont-span">{commonJs.is_obj_exist(repy.trNo)}</span>
                                                        </td>
                                                        <td width="20%" className="TR-cont bundPhoneNo">
                                                            <span className="TianR-cont-span">{commonJs.is_obj_exist(repy.trBindTel)}</span>
                                                        </td>
                                                        <td width="20%" className="TR-cont hothoneNo">
                                                            <span className="TianR-cont-span">{commonJs.is_obj_exist(repy.trHotLinePhone)}</span>
                                                        </td>
                                                        <td>
                                                            <a className="TR-ctrl editTR block left mr5" id='editTR'>  {/*编辑 editTR，保存 saveTR*/}
                                                                <i className="TR-ctrl-i ctrl-i block" onClick={this.editTR.bind(this)}></i>
                                                            </a>
                                                            <a className="delTR block left" id='delTR' onClick={this.delBindRecord.bind(this)}>
                                                                <i className="delTR-i ctrl-i block"></i>
                                                            </a>
                                                        </td>
                                                    </tr>
                                           }
                                       }):<tr><td colSpan="5" className="gray-tip-font">暂时没有数据...</td></tr>
                                   }
                                   </tbody>
                               </table>
                           </td>
                       </tr>
                       <tr>
                           <td colSpan="5" style={{"padding":"0"}} className="flow-auto">
                                {/*新增操作*/}
                                <table className="addTR-td hidden" cellPadding={0} cellSpacing={0} frameBorder={0} width="100%">
                                   <tbody>
                                        <tr className="TianR-cont-tr">
                                            <td width="20%" className="flow-auto">
                                                <div className="SimpleSelect" data-selected-code="" id='userCode'>
                                                    {/* <SimpleSelect
                                                        placeholder = ""
                                                        onValueChange = {function(obj){
                                                            if(obj && typeof(obj)!="undefined"){
                                                                $(".edit-Ing .SimpleSelect").attr("data-selected-code",obj.value);
                                                            }
                                                        }}
                                                    >
                                                    {
                                                        (adminMapArray && adminMapArray.length>0) ? adminMapArray.map((repy,i)=>{
                                                            return <option value = {repy.code} key={i}>{repy.loginname}</option>
                                                        }):<option value = "">没有数据</option>
                                                    }
                                                    </SimpleSelect> */}
                                                </div>
                                            </td>
                                            <td width="20%"><input type="text" className="input seatNo" placeholder="请输入" id='seatNo' /></td>
                                            <td width="20%"><input type="text" className="input bundPhoneNo" placeholder="请输入" id='bundPhoneNo' /></td>
                                            <td width="20%"><input type="text" className="input hothoneNo" placeholder="请输入" id='hothoneNo' /></td>
                                            <td>
                                                <a className="saveTR block left mr5" id='saveTR' onClick={this.saveBindRecord.bind(this)}><i className="TR-ctrl-i ctrl-i block"></i></a>
                                                <a className="delTR block left" id='delTR2' onClick={this.delAddTr_fn.bind(this)}><i className="delTR-i ctrl-i block"></i></a>
                                            </td>
                                        </tr>
                                   </tbody>
                               </table>
                                {/*页码*/}
                               <div className="bottom-page-num">
                                   <div>
                                       <div className="paageNo left mr25" id='pageAtion'>
                                           <Pagination
                                               showQuickJumper
                                               showSizeChanger
                                               onShowSizeChange={this.onShowSizeChange.bind(this)}
                                               defaultPageSize={this.state.barsNum}
                                               defaultCurrent={1}
                                               total={bindData.length}
                                               onChange={this.gotoPageNum.bind(this)}
                                               pageSizeOptions={['10','25','50','100']}
                                           />
                                       </div>
                                       <div className="allPageNum left"><span className="tit-font">共</span> <b className="content-font">{Math.ceil(bindData.length/this.state.barsNum)}</b> <span className="tit-font">页</span></div>
                                       <a className="addTR right" id='addTR'>
                                            <i className="block addTR-i"></i>
                                       </a>
                                   </div>
                               </div>
                           </td>
                       </tr>
                   </tbody>
                </table>
            </div>
        );
    }
};

export default TianR;
