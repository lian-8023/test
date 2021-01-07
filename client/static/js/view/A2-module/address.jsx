import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';

class Address extends React.Component {

    constructor(props){
        super(props);
        this.state={
            province_data:[],
            city_data:[],
            district_data:[],
            need_parse_data:{},
            selected_text:"",
            the_addrObj:{}
        }
    }

    componentDidMount (){
        var _that=this;
        this._parse_address(1,0);

        //点击页面隐藏 地址 弹窗
        // $(document).bind('click',function(e){ 
        //     var e = e || window.event; //浏览器兼容性 
        //     var elem = e.target || e.srcElement; 
        //     while (elem) { //循环判断至跟节点，防止点击的是div子元素 
        //         if($(elem).closest(".address-box").length>0){
        //             return;
        //         }
        //     elem = elem.parentNode; 
        //     } 
        //     $(".address-select-box").addClass("hidden");
        // }); 
    }

    /**
     *
     * @param _type  点击 省份 城市 区县 文字蓝色并对应下一个地区请求
     * @param _parent_code 下一个请求需要传的code
     * @private
     */
    _parse_address(_type,_parent_code,event){
        var _that=this;
        if(_type==1){
            // $(".address-list").attr("data-type","1");
            $(".address-tit b").removeClass("blue-font");
            $(".getProvince-tit").addClass("blue-font");  //绿色字体
            var _province_data =this.address_ajax_fn(2,"/common/getAllProvince","");
            _that.setState({
                need_parse_data:_province_data
            });
        }
        if(_type==2){
            // $(".address-list").attr("data-type","2");
            $(".address-tit b").removeClass("blue-font");
            $(".getCity-tit").addClass("blue-font");  //绿色字体
            var _province_data =this.address_ajax_fn(3,"/common/getCities",{provinceCode:_parent_code});
            _that.setState({
                need_parse_data:_province_data
            });

            //赋值
            if(event && event.target){
                var $this=$(event.target);
                var parent_li=$this.closest(".ADDRESS");
                var theText=$this.text();
                if($this.parent().hasClass("rig-list")){
                    parent_li.find(".address-inpt").val(theText);
                    parent_li.find(".getAddress").val(theText);
                    parent_li.find(".ProvinceId").val($this.attr("data-code"));
                }
            }
        }
        if(_type==3){
            // $(".address-list").attr("data-type","3");
            $(".address-tit b").removeClass("blue-font");
            $(".getDistricts-tit").addClass("blue-font");  //绿色字体
            var _district_data =this.address_ajax_fn(0,"/common/getDistricts",{cityCode:_parent_code});
            _that.setState({
                need_parse_data:_district_data
            });
            //赋值
            if(event && event.target){
                var $this=$(event.target);
                var parent_li=$this.closest(".ADDRESS");
                var theText=$this.text();
                if($this.parent().hasClass("rig-list")){
                    var prev_selected_text=parent_li.find(".address-inpt").val();
                    parent_li.find(".address-inpt").val(prev_selected_text+" "+theText);
                    parent_li.find(".getAddress").val(prev_selected_text+" "+theText);
                    parent_li.find(".CityId").val($this.attr("data-code"));
                }
            }
        }
        if(_type==0){
            //赋值
            if(event && event.target){
                var $this=$(event.target);
                var parent_li=$this.closest(".ADDRESS");
                var theText=$this.text();
                if($this.parent().hasClass("rig-list")){
                    var prev_selected_text=parent_li.find(".address-inpt").val();
                    parent_li.find(".address-inpt").val(prev_selected_text+" "+theText);
                    parent_li.find(".getAddress").val(prev_selected_text+" "+theText);
                    parent_li.find(".DistrictId").val($this.attr("data-code"));
                }
            }
            $(".address-select-box").addClass("hidden");
            parent_li.addClass("address-selected");
        }
        return false;
    }

    /**
     * 从服务器获取数据
     * @param _type 1=省、2=市、3=区
     * @param _url
     * @param _param
     */
    address_ajax_fn(_type,_url,_param,event) {
        var that=this;
        var _res_data ={};
        $.ajax({
            type:"get",
            url:_url,
            async:false,
            dataType: "JSON",
            data:_param,
            success:function(res) {
                if (res.code != 1) {
                    console.log(res.msg);
                    return null;
                }
                if (res.code && res.code == -2) {
                    console.log("获取省、市、区无法连接服务器");
                    return null;
                }
                var _getData = res.data;
                if (_getData.code==0){
                    var _parse_ata=_getData.data;
                    let AGarray=[];
                    let HKarray=[];
                    let LSarray=[];
                    let TZarray=[];
                    for (let i=0;i<_parse_ata.length;i++){
                        // var _res_obj = {};
                        // let _provinceData_i=_parse_ata[i];
                        // _res_obj.name=_provinceData_i.name;
                        // _res_obj.type=_type;
                        // _res_obj.code=_provinceData_i.code;
                        // _res_data.push(_res_obj)
                        let nameEn=_parse_ata[i].nameEn.substring(0,1);
                        _parse_ata[i].type=_type;
                        var AGreg = new RegExp(/[a-gA-G]/, "");
                        var HKreg = new RegExp(/[h-kH-K]/, "");
                        var LSreg = new RegExp(/[l-sL-S]/, "");
                        var TZreg = new RegExp(/[t-zT-Z]/, "");
                        if(AGreg.test(nameEn)){
                            AGarray.push(_parse_ata[i])
                        }
                        if(HKreg.test(nameEn)){
                            HKarray.push(_parse_ata[i])
                        }
                        if(LSreg.test(nameEn)){
                            LSarray.push(_parse_ata[i])
                        }
                        if(TZreg.test(nameEn)){
                            TZarray.push(_parse_ata[i])
                        }
                    }
                    _res_data.ag=AGarray;
                    _res_data.hk=HKarray;
                    _res_data.ls=LSarray;
                    _res_data.tz=TZarray;
                }else {
                    console.log("获取信息失败")
                    return null;
                }
            }
        })
        return _res_data;
}

    show_address(event){
        let _this=$(event.target);
        let address_div = _this.parent().find(".address-select-box");
        if(address_div.hasClass("hidden")){
            address_div.removeClass("hidden");
            this._parse_address(1,0);
            $(".address-tit b").removeClass("blue-font");
            $(".getProvince-tit").addClass("blue-font");  //绿色字体
        }else {
            address_div.addClass("hidden");
        }
        return false;
    }


    render() {
        var addressData=this.state.need_parse_data;
        let getId=this.props.id;
        return (
            <div className="bar address-box auto pl5 pr5 absolute" id={getId+'_addr'}>
                {/*value={this.state.selected_text}*/}
                <input type="text" id={getId+'_val'} placeholder={this.props._defaultAddr_val==""?"请选择地址":this.props._defaultAddr_val} readOnly="readOnly" className="left address-inpt" onClick={this.show_address.bind(this)} />
                <i className="address-icon address-icon-on block right"></i>
                <div className="clear"></div>
                <div className="address-select-box absolute hidden">
                    <div className="address-list pb5" data-type="">
                        <div className="address-tit">
                            <b className="blue-font getProvince-tit" id={getId+'_prince'} onClick={this._parse_address.bind(this,1,0)}>省份</b>
                            <b className="getCity-tit" data-city="" id={getId+'_city'} onClick={this._parse_address.bind(this,2,$(this).attr("data-city"))}>城市</b>
                            <b className="getDistricts-tit" data-district="" id={getId+'_area'} onClick={this._parse_address.bind(this,3,$(this).attr("data-district"))}>区县</b>
                        </div>
                        {
                            (addressData && addressData.ag && addressData.ag.length>0) ? 
                            <div className="addr-part clearfix">
                                <b className="leftit left">A-G</b>
                                <ul className="rig-list left" >
                                    {
                                        (addressData && addressData.ag && addressData.ag.length>0) ? addressData.ag.map((repy,i)=>{
                                            return <li key={i} data-code={repy.code} title={repy.name} className="addr-li" onClick={this._parse_address.bind(this,repy.type,repy.code)}>{repy.name}</li>
                                        }):""
                                    }
                                </ul>
                            </div> : ""
                        }

                        {
                            (addressData && addressData.ag && addressData.hk.length>0) ? 
                            <div className="addr-part clearfix">
                                <b className="leftit left">H-K</b>
                                <ul className="rig-list left">
                                    {
                                        (addressData && addressData.ag && addressData.hk.length>0) ? addressData.hk.map((repy,i)=>{
                                            return <li key={i} data-code={repy.code} title={repy.name} className="addr-li" onClick={this._parse_address.bind(this,repy.type,repy.code)}>{repy.name}</li>
                                        }):""
                                    }
                                </ul>
                            </div> : ""
                        }

                        {
                            (addressData && addressData.ag && addressData.ls.length>0) ? 
                            <div className="addr-part clearfix">
                                <b className="leftit left">L-S</b>
                                <ul className="rig-list left">
                                    {
                                        (addressData && addressData.ag && addressData.ls.length>0) ? addressData.ls.map((repy,i)=>{
                                            return <li key={i} data-code={repy.code} title={repy.name} className="addr-li" onClick={this._parse_address.bind(this,repy.type,repy.code)}>{repy.name}</li>
                                        }):""
                                    }
                                </ul>
                            </div> : ""
                        }
                        
                        {
                            (addressData && addressData.ag && addressData.tz.length>0) ? 
                            <div className="addr-part clearfix">
                                <b className="leftit left">T-Z</b>
                                <ul className="rig-list left">
                                    {
                                        (addressData && addressData.ag && addressData.tz.length>0) ? addressData.tz.map((repy,i)=>{
                                            return <li key={i} data-code={repy.code} title={repy.name} className="addr-li" onClick={this._parse_address.bind(this,repy.type,repy.code)}>{repy.name}</li>
                                        }):""
                                    }
                                </ul>
                            </div> : ""
                        }
                        
                    </div>
                        
                </div>
            </div>
        );
    }
};

export default Address;
