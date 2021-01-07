//回访前端页面 下拉框列表组件
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class ClientSelect extends React.Component {
    constructor(props){
        super(props);
        this.state={
            cooperationFlag:this.props.cooperationFlag,   //合作方标识
            data:this.props.data,  //显示数据
            orderNo:this.props.orderNo,  //
            loanNumber:this.props.loanNumber,  //
            newestData:this.props.newestData  //历史最新数据
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            cooperationFlag:nextProps.cooperationFlag,
            data:nextProps.data,  //显示数据
            orderNo:nextProps.orderNo,  //
            loanNumber:nextProps.loanNumber,  //
            newestData:nextProps.newestData,  //
        })
    }
    // 保存
    save(){
        let _dl=$(".attrDefine .isChanged");
        if(_dl.length<=0){
            alert("请先选中需要修改的项目！");
            return;
        }
        let _parems={};
        let _arr=[];
        let that=this;
        let isRequest=true;  //是否请求
        _dl.each(function(){
            let _obj = {};
            let _attrDefineId=$(this).attr("data-id");
            let _attrValue=$(this).attr("data-descr");
            let _infoTypeLabel=$(this).attr("data-infoTypeLabel");
            let _attrValueId="";
            let _descr="";
            let _value="";
            let _id="";
            if($(this).find(".select-gray").length>0){
                _attrValueId=$(this).find(".select-gray option:selected").attr("data-id");
                _descr=$(this).find(".select-gray option:selected").attr("data-descr");
                _value=$(this).find(".select-gray option:selected").attr("data-value");
                _id=$(this).find(".select-gray").attr("data-editId");
            }else{
                _attrValueId=$(this).find("textarea").attr("data-id");
                _descr=$(this).find("textarea").val();
                _id=$(this).find("textarea").attr("data-editId");
                _value=$(this).find("textarea").attr("data-value");
            }
            if (_id!=null && typeof(_id) != "undefined"&&_id!="-"){
                _obj.id=_id;
            }
            if (_attrValueId!=null && typeof(_attrValueId) != "undefined"&&_attrValueId!="-"&&_attrValueId!=""){
                _obj.attrValueId=_attrValueId;
            }
            
            if(_descr&&_descr.length>63){
                alert("意见/建议最多63个字符！");
                isRequest=false;
            }
            if (_descr!=null && typeof(_descr) != "undefined"&&_descr!="-"&&_descr!=""){
                _obj.descr=_descr;
            }
            if (_value!=null && typeof(_value) != "undefined"&&_value!="-"&&_value!=""){
                _obj.value=_value;
            }
            if (_attrDefineId!=null && typeof(_attrDefineId) != "undefined"&&_attrDefineId!="-"&&_attrDefineId!=""){
                _obj.attrDefineId=_attrDefineId;
            }
            if (_attrValue!=null && typeof(_attrValue) != "undefined"&&_attrValue!="-"&&_attrValue!=""){
                _obj.attrValue=_attrValue;
            }
            if (_infoTypeLabel!=null && typeof(_infoTypeLabel) != "undefined"&&_infoTypeLabel!="-"&&_infoTypeLabel!=""){
                _obj.infoTypeLabel=_infoTypeLabel;
            }
            _arr.push(_obj);
        })
        _parems={
            attrInfoDTOS:_arr,
            loanNumber:this.state.loanNumber,
            orderNo:this.state.orderNo
        }
        if(!isRequest){
            return;
        }
        $.ajax({
            type:"post", 
            url:"/node/reV/checkSave", 
            async:true,
            data:{josnParam:JSON.stringify(_parems)}, 
            dataType: "JSON", 
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    return;
                }
                let _data=res.data;
                alert(_data.message);
                $(".attrDefine .visit-client").removeClass("isChanged");
                $(".attrDefine input").val("");
                that.props.searchHandle("RELOAD",true);
           }
       })
    }
    //取消保存
    cancelSave(){
        $(".attrDefine select option:selected").removeProp("selected")
        $(".attrDefine select option[value='0']").prop("selected","selected");
        $(".attrDefine input").val("");
    }
    //select 切换
    attrDefine(event){
        let _this=$(event.target);
        if(_this.find("option:selected").attr("value")=="0"){
            _this.closest("dl").removeClass("isChanged");
        }else{
            _this.closest("dl").addClass("isChanged");
        }
    }
    //input修改事件
    inputChange(event){
        let $this=$(event.target);
        let _val=$this.val();
        if(_val){
            $this.closest("dl").addClass("isChanged");
        }else{
            $this.closest("dl").removeClass("isChanged");
        }
    }
    render() {
        let cooperationFlag=this.state.cooperationFlag;
        let data=this.state.data;
        let newestData=this.state.newestData;
        let newestData_obj = {};
        for(let i=0;i<newestData.length;i++){
            let newestData_i=newestData[i];
            newestData_obj[newestData_i.attrDefineId]=commonJs.is_obj_exist(newestData_i.attrValueId);  //select框展示已有数据
            newestData_obj[newestData_i.attrValue]=commonJs.is_obj_exist(newestData_i.id);  //更新数据时传给后端的id
            newestData_obj[newestData_i.attrDefineId+"#"+newestData_i.attrDefineId]=commonJs.is_obj_exist(newestData_i.descr);  //显示最新数据时，input展示的中文
        }
        return (
            <div className="bar clearfix">
                <div className="border-bottom attrDefine">
                    {
                        data?data.map((repy,i)=>{
                            let attrValues=repy.attrValues?repy.attrValues:[];
                            let attrValues_0=(repy.attrValues&&repy.attrValues[0])?repy.attrValues[0]:{};
                            return <dl className={i==(data.length-1)?"visit-client":"visit-client border-bottom"} key={i} data-id={commonJs.is_obj_exist(repy.id)} data-descr={commonJs.is_obj_exist(repy.descr)} data-infoTypeLabel={commonJs.is_obj_exist(repy.infoTypeLabel)}>
                                        <dt>{commonJs.is_obj_exist(repy.descr)}</dt>
                                        <dd>
                                            
                                            {
                                                repy.elType=="SELECT"?  //判断展示selec框还是input框

                                                <select name="" id={'attrDefine'+commonJs.is_obj_exist(repy.id)} className="select-gray" onChange={this.attrDefine.bind(this)} data-editId={commonJs.is_obj_exist(newestData_obj[repy.descr])}>
                                                    <option value="0" data-id="">请选择</option>
                                                    {
                                                        (attrValues && attrValues.length>0)?attrValues.map((rps,j)=>{  //循环展示下拉框数据
                                                            if(newestData_obj[repy.id]==rps.id){  //判断是否选中
                                                                return <option selected="true" key={j} data-id={commonJs.is_obj_exist(rps.id)} data-attrDefineId={commonJs.is_obj_exist(rps.attrDefineId)} data-value={commonJs.is_obj_exist(rps.value)} data-valid={commonJs.is_obj_exist(rps.valid)} data-descr={commonJs.is_obj_exist(rps.descr)}>
                                                                            {commonJs.is_obj_exist(rps.descr)}
                                                                        </option>
                                                            }else{
                                                                return <option key={j} data-id={commonJs.is_obj_exist(rps.id)} data-attrDefineId={commonJs.is_obj_exist(rps.attrDefineId)} data-value={commonJs.is_obj_exist(rps.value)} data-valid={commonJs.is_obj_exist(rps.valid)} data-descr={commonJs.is_obj_exist(rps.descr)}>
                                                                            {commonJs.is_obj_exist(rps.descr)}
                                                                        </option>
                                                            }
                                                                }):<option></option>
                                                    }
                                                </select>
                                                
                                                :
                                                <textarea 
                                                    id='infoTypeLabel'
                                                    style={{"width":"100%"}}
                                                    className="textarea mt3" 
                                                    data-infoTypeLabel={commonJs.is_obj_exist(repy.infoTypeLabel)}
                                                    onKeyUp={this.inputChange.bind(this)}
                                                    data-id={commonJs.is_obj_exist(attrValues_0.id)} 
                                                    data-attrDefineId={commonJs.is_obj_exist(attrValues_0.attrDefineId)} 
                                                    data-value={commonJs.is_obj_exist(attrValues_0.value)} 
                                                    data-valid={commonJs.is_obj_exist(attrValues_0.valid)} 
                                                    data-descr={commonJs.is_obj_exist(attrValues_0.descr)}
                                                    data-editId={commonJs.is_obj_exist(newestData_obj[repy.descr])}
                                                >
                                                {newestData_obj[repy.id]==attrValues_0.id?newestData_obj[attrValues_0.attrDefineId+"#"+attrValues_0.attrDefineId]:attrValues_0.descr}
                                                </textarea>
                                            }

                                            
                                            
                                        </dd>
                                    </dl>
                        }):""
                    }
                </div>
                <div className="clear"></div>
                <div className="pt5 pl20 pb5">
                    <button className="left block btn-blue" id='CSsaveBtn' onClick={this.save.bind(this)}>保存</button>
                    <button className="btn-white left block ml20" id='CSsaveBtnCancle' onClick={this.cancelSave.bind(this)}>取消</button>
                </div>
            </div>
            
    );
    }
};
export default ClientSelect;