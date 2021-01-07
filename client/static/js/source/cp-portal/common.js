
import $ from 'jquery';
import CommonJs from '../common/common';
var commonJs=new CommonJs;
export default class CpCommonJs{
    //用户详情点击展开ul
    toggleUl(event){
        let target=$(event.target);
        if(target.hasClass('bar-tit-toggle')){
            target=$(event.target).closest(".toggle-tit");
        }
        let _parent=target.closest(".toggle-box");
        let icon=target.find(".bar-tit-toggle");
        if(icon.hasClass('bar-tit-toggle-down')){
            target.next().height("auto").css('overflow','auto');
            icon.removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
            target.addClass("on");
        }else{
            target.next().height("55px").css('overflow','hidden');
            icon.removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");
            target.removeClass("on");
        }
    }
    //展开||隐藏下面所有 toggle-box
    all_content_toggle(event){
        let n=0;
        let _this=$(event.target);
        let all_toggle_box=_this.closest(".content-toggle").find(".toggle-box");
        all_toggle_box.each(function () {
            let has_opened=$(this).find(".toggle-tit").hasClass("on");
            if(has_opened){
                n+=1;
            }
        })
        if(n>=1){ //收起
            _this.removeClass("taggle-cion-up").addClass("taggle-cion-down");
            all_toggle_box.find(".toggle-tit").removeClass("on");
            all_toggle_box.find(".toggle-tit .bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");
            all_toggle_box.find(".toggle-tit").next().height("55px");
        }else { //展开
            _this.addClass("taggle-cion-up").removeClass("taggle-cion-down");
            all_toggle_box.find(".toggle-tit").addClass("on");
            all_toggle_box.find(".toggle-tit .bar-tit-toggle").addClass("bar-tit-toggle-up").removeClass("bar-tit-toggle-down");
            all_toggle_box.find(".toggle-tit.bar-tit").next().height("auto");
        }
    }
    // 点击弹窗遮罩隐藏弹窗
    closePop(event){
        let _parent=$(event.target).closest(".pop");
        _parent.addClass("hidden");
    }
    // 取消record操作 需要隐藏的select增加data-hide='yes'；需要初始化的option添加属性data-show='no';
    cancleSaveRecord(){
        let _parent=$(".QrecordInfo");
        _parent.find("select option").removeProp("selected");
        _parent.find("select option[data-show='no']").prop("selected","true");
        _parent.find("textarea").val("");
        _parent.find("input").val("");
        _parent.find("[data-hide='yes']").addClass("hidden");
    }
    //判断对象是否为空，为空则返回空对象  _obj需要判断的对象
    opinitionObj(_obj){
        let newObj={};
        if(!_obj || $.isEmptyObject(_obj)){
            return newObj;
        }
        return _obj;
    }
    //判断对象是否为空，为空则返回空对象  _obj需要判断的对象
    opinitionArray(_arr){
        let newArray=[];
        if(!_arr){
            return newArray;
        }
        if(_arr && _arr.length<=0){
            return newArray;
        }
        return _arr;
    }
    /**
     * 判断0和1 返回对应数据显示
     * @param {*} str 后端字段
     * @param {*} trueStr str为1时显示的字段
     * @param {*} falseStr str为0时显示字段
     */
    opinitionBool(str,trueStr,falseStr){
        let showStr="";
        if(typeof(str)=="string" && (str==null || str==undefined || str=="")){
            return showStr;
        }
        if(Boolean(str)){
            showStr=trueStr;
        }
        if(!Boolean(str)){
            showStr=falseStr;
        }
        return showStr;
    }
    //点击下一条清空搜索条件
    clearCondition(){
        $(".check-search input").val("");
    }
    //判断imei个数，少于2个则可以新增
    judgeIMEInumber(imeiNo){
        if(imeiNo=="-"){return false;}
        if(!imeiNo)return true;
        if(imeiNo){
            if(imeiNo.indexOf(",")<0){
                return true;
            }else{
                let _arr=[];
                if(imeiNo){
                    _arr=imeiNo.split(",");
                }
                if(_arr.length<2){
                    return true;
                }
            }
        }
        return false;
    }
    // 获取用户名
    getAdminMaps(that){
        let _array=[];
        $.ajax({
            type:"get",
            url:"/cpCommon/rule/all/list",
            async:false,
            dataType: "JSON",
            success:function(res) {
                var _getData = res.data;
                if (!_getData.executed) {
                    return;
                }
                var keys=[];//定义一个数组用来接受key  
                var values=[];//定义一个数组用来接受value  
                for(var key in _getData.adminNameMaps){  
                    keys.push(key);  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }
    // 获取用户名组
    getRuleGroup(that){
        let _array=[];
        $.ajax({
            type:"get",
            url:"/cpCommon/rule/reV/list",
            async:true,
            dataType: "JSON",
            success:function(res) {
                var _getData = res.data;
                if (!_getData.executed) {
                    return;
                }
                var keys=[];//定义一个数组用来接受key  
                var values=[];//定义一个数组用来接受value  
                for(var key in _getData.adminNameMaps){  
                    keys.push(key);  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }
    //回访页面切换回访类型时，分别展示回访放款、回访还款，回访未还款模块
    avisitTypeFn(event){
        let _val=$(event.target).find("option:selected").attr("value");
        window.location.hash="#"+_val;
    }
    //回访页面--获取搜索条件
    judgeChannelCondition(channelVal){
        let channelYype="";
        if(!channelVal){return;}
        if(channelVal=="9F1"||channelVal=="9F"||channelVal=="14A"||channelVal=="14F"||channelVal=="14F1"||channelVal=="14F2"){  
            channelYype="A_F";
        }else if(channelVal=="3C"||channelVal=="3C1"){ 
            channelYype="3C";
        }else if(channelVal=="24A"){ 
            channelYype="24A";
        }else if(channelVal=="6C"){ 
            channelYype="6C";
        }else if(channelVal=="17C"){ 
            channelYype="17C";
        }else if(channelVal=="30H"||channelVal=="34H"||channelVal=="39H"||channelVal=="40H"||channelVal=="41G"){
            channelYype="A_H";
        }
        return channelYype;
    }
    //回访判断合作方--条件区展示
    judgeChannelAvist(channelVal){
        let channelYype="";
        if(channelVal){
            if(channelVal!="9F1"&&channelVal!="9F"&&channelVal!="14A"&&channelVal!="14F"&&channelVal!="14F1"&&channelVal!="14F2"){  // =>C类和24A   (29C就参考 C类数据 的参数，28A参考 24A 的参数)
                channelYype="C_24A";
                if(channelVal!="24A"&&channelVal!="33A"&&channelVal!="29A"){  // =>C类
                    channelYype="C";
                }
                
            }else if(channelVal=="9F1"||channelVal=="9F"||channelVal=="14A"||channelVal=="14F"||channelVal=="14F1"||channelVal=="14F2"){  // =>9F和14A
                channelYype="F9_14A";
            } 
        }
        return channelYype;
    }
    //回访数据处理 record 操作和展示 处判断合作方类型
    judgeChannelRecord(productNo){
        let result=true;
        if(productNo){
            if(productNo=="9F1"||productNo=="9F"||productNo=="14A"||productNo=="14F"||productNo=="14F1"||productNo=="14F2"||productNo=="24A"||productNo=="28A"||productNo=="33A"||productNo=="29A"){
                result=true;   //A类和F类
            }else{
                result=false; //C类
            }
        }
        return result;
    }
    //显示 还款列表 || 扣款列表 || 历史借款记录 新开页面
    showListPop(that,type){
        if(type == '2F_AST'){
            let astQInfoDTO = that.state.searchResult?that.state.searchResult.astQInfoDTO:{};
            let loanNo=astQInfoDTO.creditNo;
            let orderNo=astQInfoDTO.orderNo;
            let cooperationFlag=astQInfoDTO.cooperationFlag;
            let fromFlag=astQInfoDTO.productNo;
            window.open("/cp-withholdList2F?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
        }else{
            let infoDTO=that.state.infoDTO?that.state.infoDTO:{};
            let loanNo=infoDTO.loanNumber;
            let orderNo=infoDTO.orderNo;
            let cooperationFlag=infoDTO.cooperationFlag;
            let fromFlag=infoDTO.platformFlag;
            window.open("/cp-"+type+"?loanNo="+loanNo+"&orderNo="+orderNo+"&cooperationFlag="+cooperationFlag+"&fromFlag="+fromFlag);
        }
    }
    //合同号和身份证号码模糊搜索
    getfuzzyData=(parem,_url)=>{
        let fuzzyData=[];
        let that=this;
        $.ajax({
            type:"post", 
            url:_url, 
            async:false,
            dataType: "JSON", 
            data:parem,
            success:function(res){
                if(!commonJs.ajaxGetCode(res)){
                    fuzzyData=[];
                }
                var _data=res.data;
                fuzzyData=that.opinitionArray(_data.retMatchData)
            }
        })
        return fuzzyData;
    }
}