import $ from 'jquery';
import { observable, action, computed ,configure,runInAction,extendObservable} from "mobx";

class CommonJs{
    reloadRules(){
        var hideBtnArray=this.displayByRules();
        if(hideBtnArray && hideBtnArray.length>0){
            for (var i=0;i<hideBtnArray.length;i++){
                $("[data-btn-rule='"+hideBtnArray[i]+"']").addClass("hidden");
            }
        }
    }
    //根据权限 显示 || 隐藏 页面按钮
    displayByRules(){
        let _href=window.location.pathname;
        let _url="/common/admin/rules"; //newportal请求接口
        if(_href=="/cp-portal"){  
            _url="/common/rule/admin/rules"; //合作方请求接口
        }
        var hideRulsArray=[];  //返回给html页面隐藏按钮array
        var btnRulsArray=[]; //页面传给服务器的按钮数组
        $("[data-btn-rule]").each(function () {
            let thisVal=$(this).attr("data-btn-rule");
            if(thisVal&&thisVal.replace(/\s/g,'')&&thisVal!='-'){
                btnRulsArray.push(thisVal);
            }
        });
        $.ajax({
            type:"get",
            url:_url,
            async:false,
            dataType: "JSON",
            data:{"btnRulsArray":btnRulsArray},
            success:function(res){
                let getData='';
                if(res.code==1 && res.data && typeof(res.data)=='string'){
                    getData=JSON.parse(res.data);
                    if(!getData.executed){
                        alert(getData.message);
                        return;
                    }
                    hideRulsArray=[];
                }else{
                    hideRulsArray=res.data;
                }
            }
        });
        return hideRulsArray;  //返回需要隐藏的key值
    }
    //二级菜单都无权限时，隐藏一级菜单
    hideMenu(){
        $('.menu-item').each(function(){
            let navChildLength=$(this).find('.navChild li').length;
            let hideLength=$(this).find('.navChild li.hidden').length;
            if(navChildLength==hideLength){
                $(this).addClass('hidden');
            }else{
                $(this).removeClass('hidden');
            }
        });
    }
    
    // 展开||收起单个 toggle-box
    content_toggle(event){
        let _that=this;
        let target=$(event.target);
        let _this=target;
        if(target.hasClass("toggle-tit")){
            _this=target;
        }else{
            _this=target.closest(".toggle-tit");
        }
        let type=_this.attr("type");
        if(_this.next().hasClass("hidden")){
            _this.parent().siblings().find("h2.bar").next(".bar:visible").addClass("hidden");
            _this.parent().siblings().find("h2.bar").removeClass("on");
            _this.parent().siblings().find("h2.bar").find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");

            _this.find(".bar-tit-toggle").removeClass("bar-tit-toggle-down").addClass("bar-tit-toggle-up");
            _this.nextAll().removeClass("hidden");
            _this.addClass("on");
            if(type && type=="ocr"){
                CommonJs.cancle_Edit(event,_that);
            }
        }else {
            _this.find(".bar-tit-toggle").removeClass("bar-tit-toggle-up").addClass("bar-tit-toggle-down");
            _this.nextAll().addClass("hidden");
            _this.removeClass("on");
        }
    }
    static cancle_Edit(even,_that){
        let _this=$(even.target);
        let parent_bar=_this.closest(".auto-box").find(".bar:visible");
        parent_bar.find(".afterInput,.select-gray").remove();
        parent_bar.find(".address-div,.address-select-box,.select-data-div,.followUpTime").addClass("hidden");
        parent_bar.find(".msg-cont").removeClass("hidden");
        _this.parent().find(".edit").text("修改").removeClass("btn-blue").addClass("btn-white");
        
        parent_bar.find(".myCheckbox").unbind("click");

        if(parent_bar.find(".bankAddList_tr").length>0){
            $(".bankAddList_tr").remove();
            $(".add-btn").addClass("hidden");
        }
        parent_bar.find(".cpyTellPhone").addClass("hidden");
        parent_bar.find(".cancle_edit").addClass("hidden");
        parent_bar.find(".radio-div").find(".myRadio").addClass("hidden");
        
        //详情ocr 录入计时
        var typeInTime_div="";
        if(parent_bar.find(".type-in-timer")){  
            typeInTime_div=parent_bar.find(".type-in-timer")?parent_bar.find(".type-in-timer"):"";
        }
        if(parent_bar.find(".type-in-timer")){ 
            typeInTime_div.find(".typeInTime").text(0);
            typeInTime_div.addClass("hidden");
            if(_that.state && _that.state.theTimer && typeof(_that.state.theTimer)!="undefined"){
                clearInterval(_that.state.theTimer);
            }
        }
        if(_that.getMsg){
            _that.getMsg("SEARCH");
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
            all_toggle_box.find(".toggle-tit").next().addClass("hidden");
        }else { //展开
            _this.addClass("taggle-cion-up").removeClass("taggle-cion-down");
            all_toggle_box.find(".toggle-tit").addClass("on");
            all_toggle_box.find(".toggle-tit .bar-tit-toggle").addClass("bar-tit-toggle-up").removeClass("bar-tit-toggle-down");
            all_toggle_box.find(".toggle-tit.bar-tit").next().removeClass("hidden");
        }
    }

    // myCheckbox 单选
    myCheckbox(event){
        let self=$(event.target);
        self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        let _state=self.hasClass("myCheckbox-normal");
        if(_state){
            self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
        event.stopPropagation();
    }
    //myCheckbox 仅有一个勾选框。互不影响，可以多选
    myCheckboxSingle(event){
        let self=$(event.target);
        let _state=self.hasClass("myCheckbox-normal");
        if(_state){
            self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        }else {
            self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
    }
    
    //处理公共ajax请求返回值
    static ajaxGetCode(res){
        var loginAlert="";
        if (res.code != 1) {
            if(res.code=="-3"){
                loginAlert = confirm('您还没有登录，请先登录！');
                if(loginAlert){
                    window.location.href ="/common/loginOut";
                    return false;
                }else {
                    return false;
                }
            }
            if(res.code=="-2"){
                alert("无法连接服务器");
                return false;
            }
            alert(res.msg);
            return false;
        }
        var _server_data = res.data;
        if((typeof _server_data.success!="undefined" && !_server_data.success)||(typeof _server_data.executed!="undefined" && !_server_data.executed)){
            if(_server_data.code == "LOGIN_INVALID"){
                loginAlert = confirm('您还没有登录，请先登录！');
                if(loginAlert){
                    window.location.href ="/common/loginOut";
                    return false;
                }
            }
            alert(_server_data.message?_server_data.message:"失败");
            return false;
        }
        return true;
    }
    ajaxGetCode(res){
        var loginAlert="";
        if (res.code != 1) {
            if(res.code=="-3"){
                loginAlert = confirm('您还没有登录，请先登录！');
                if(loginAlert){
                    window.location.href ="/common/loginOut";
                }
                return false;
            }
            if(res.code=="-2"){
                alert("无法连接服务器");
                return false;
            }
            alert(res.msg?res.msg:'失败');
            return false;
        }
        var _server_data = res.data;
        if((typeof _server_data.success!="undefined" && !_server_data.success)||(typeof _server_data.executed!="undefined" && !_server_data.executed)){
            if(_server_data.code == "LOGIN_INVALID"){
                loginAlert = confirm('您还没有登录，请先登录！');
                if(loginAlert){
                    window.location.href ="/common/loginOut";
                }
                return false;
            }
            alert(_server_data.message?_server_data.message:"失败");
            return false;
        }
        return true;
    }
    
    // 判断枚举类型值
    parseEnum(_enum){
        if(!_enum){
            return '-';
        }
        return _enum.displayName;
    }
    // 判断obj值是否存在
    is_obj_exist(_obj,replace_content) {
        if (replace_content==null || typeof(replace_content) == "undefined"){
            if(typeof(_obj)=="number"){
                replace_content='0';
            }else{
                replace_content="-";
            }
        }
        if(_obj==null || typeof(_obj) == "undefined" ||(typeof(_obj) == "string"&& (_obj==null||_obj==""||_obj=="undefined"))){
            _obj=replace_content;
        }
        return _obj;
    }

    //Q取消保存
    cancelSaveQ(){
        let _parent=$(".QrecordInfo");
        _parent.find(".contactObjectEnums").find("select option").removeProp("selected");
        _parent.find(".contactObjectEnums").find("select option[id='0']").prop("selected","selected");

        _parent.find(".contactMethods").find("select option").removeProp("selected");
        _parent.find(".contactMethods").find("select option[id='0']").prop("selected","selected");

        _parent.find(".contactResultsInfo,.commu-select").find("select option").removeProp("selected");
        _parent.find(".contactResultsInfo,.communicateObjectList,.communicateStyleList,.commu-select").find("select option[id='0']").prop("selected","selected");
        _parent.find(".commu-select option").removeProp("selected");
        _parent.find(".commu-select option[id='0']").prop("selected","selected");
        _parent.find(".communicateName,.newMoblieRecord").val("");
        _parent.find(".telNo").val("");
        _parent.find(".contactResultReasonsInfo").find("select option").removeProp("selected");
        _parent.find(".contactResultReasonsInfo,.debtorRelationshipList,.telSourcesList,.telStatusList,.overdueReasonsList").find("select option[id='0']").prop("selected","selected");
        _parent.find(".creditCash-td").find("input").val("");
        
        _parent.find(".followUpTime,.contactResultReasonsInfo,.creditCash-td,.installments,.discount,.discountRate,.disCountType").addClass("hidden");
        _parent.find(".commu-area,.telNo").val("");
        _parent.find(".ant-calendar-picker-input").val("");

        _parent.find(".otherDiv,.checkResult").addClass("hidden");
    }

    /**
     * 清空搜索条件
     * tip：需要清空的条件用下面标签包裹；
     * <div data-isresetdiv="yes" 
     *      data-resetstate="需要重置的sate中key值，用逗号隔开"
     *      data-resethiddenclass="需要隐藏的dom类名，用逗号隔开">..条件dom..</div>
     *      resetCurrent 此参数为ture时清空所有条件，反之不还原类名为 withOutReset 的select框
     */
    resetCondition(that,resetCurrent){
        let _this=that;
        let $parent=$("[data-isresetdiv='yes']");
        $parent.find(".ant-select-selection-selected-value").text("");  //情况绑定者
        $parent.find(".ant-select-selection__placeholder").css("display","block"); //情况绑定者-显示placeholder
        $parent.find(".customSelect .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");//情况自定义下拉多选
        $parent.find(".ST-sort").removeClass("sort-asce").removeClass("sort-normal").addClass("sort-inver"); //重置排序图标样式
        let resetStateArray_str=$parent.attr("data-resetstate");  //需要清空的state值
        let resetStateArray=resetStateArray_str?resetStateArray_str.split(","):[]; 
        let resetHiddenClass_str=$parent.attr("data-needHidden");  //需要隐藏的dom类名
        let resetHiddenClassArray=resetHiddenClass_str?resetHiddenClass_str.split(","):[]; 
        
        $parent.find("input").val(""); //清空input框
        $parent.find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal"); //还原checkbox框
        let selects=$parent.find(".select-gray");
        if(!resetCurrent){
            selects=$parent.find(".select-gray").not(".withOutReset");
        }
        selects.each(function(){  //清空select框
            $(this).find("option").removeProp("selected");
            $(this).find("option:eq(0)").prop("selected","selected");
        })
        if(resetStateArray.length>0){
            for(let statekey of resetStateArray){
                _this.setState({
                    [statekey]:undefined
                })
            }
        }
        if(resetHiddenClassArray.length>0){
            for(let classkey of resetHiddenClassArray){
                $("."+classkey+"").addClass("hidden");
            }
        }
        that.setState({
            resetFuzzyVal:true
        })
    }

    getNowTimeYMD(){
        var oDate = new Date(); //实例一个时间对象；
        return oDate.getFullYear()+"-"+(oDate.getMonth()+1)+"-"+oDate.getDate();
    }
    static getNowTimeYMD(){
        var oDate = new Date(); //实例一个时间对象；
        return oDate.getFullYear()+"-"+(oDate.getMonth()+1)+"-"+oDate.getDate();
    }
    phoneReplace(viewPhone,phone) {
        if(phone&&phone!=""&&(!viewPhone||viewPhone=="NO"||viewPhone.name=="NO")){  //800 || 通善 电话号码打星号
            phone = phone.replace(/(\d{3})\d{4}(\d+)/, '$1****$2');
        }
        return phone;
    }
    // 身份证号码脱敏展示
    newNationalIdReplace(viewIdcard,nationalId) {
        if(nationalId&&nationalId!=""&&(!viewIdcard||viewIdcard=="NO"||viewIdcard.name=="NO")){  //身份证号码是否打星号
            nationalId = nationalId?nationalId.replace(/(.{0}).*(.{12})/,"$1****$2"):"-";
        }
        return nationalId;
    }

    /**
     * 800正常呼叫
     * @param {*} phone 
     */
    encypt800(phone){
        var res_phone = this.checkLocal800(phone);
        return DES3.encrypt("xiaoyudi",res_phone).toUpperCase();
    }

    /**
     * 针对QUEUE不同逻辑给号码加前缀
     * @param {*} phone 
     */
    queueEncypt800(queueType,phone){
        var res_phone = this.checkLocal800(phone);
        if(queueType=="OCR" || queueType=="Approve" || queueType=="/AST"){
            res_phone = "93"+res_phone;
        }else if(queueType=="/AST2"){
            if(phone.indexOf("021")==0){
                res_phone="91"+phone.replace(/^021/,"");
            }else{
                res_phone = "91"+res_phone;
            }
        }
        console.log('queueEncypt800:',res_phone)
        return DES3.encrypt("xiaoyudi",res_phone).toUpperCase();
    }
   
    /**
     * 判断号码是本地还是外地，外地前缀加0
     */
    checkLocal800(phone){
        if(!phone||phone==''){
            alert("未获取到电话号码！");
            return;
        }
        if(phone.indexOf("0")==0){
            return phone;
        }
        var res_phone = "0"+phone;
        $.ajax({
            type:"get",
            url:"/common/mobileSegment?phone="+phone,
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (res.code == 1) {  
                    var _server_data = res.data;
                    if(_server_data.executed){
                        res_phone=phone; //当前号码为上海
                    }
                }
            }
        })
        return res_phone.replace(new RegExp("-","g"),"");  //其他地区返回 号码前面加0
    }
    // 全选
    selectAll(parentClass,e){
        let $this=$(e.target);
        if($this.hasClass("myCheckbox-visited")){
            $this.closest(parentClass).find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }else {
            $this.closest(parentClass).find(".myCheckbox").removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
        } 
    }
    //年月日时分秒时间毫秒数转换成字符串
    dateToString(timeString) {      
        let unixTimestamp=new Date( timeString );
        let commonTime = unixTimestamp.getFullYear() + "-" + (unixTimestamp.getMonth() + 1) + "-" + unixTimestamp.getDate() + " " + unixTimestamp.getHours() + ":" + unixTimestamp.getMinutes() + ":" + unixTimestamp.getSeconds();
        return commonTime;      
    } 
    //年月日时间毫秒数转换成字符串
    dateToString2(timeString) {      
        let unixTimestamp=new Date( timeString );
        let commonTime = unixTimestamp.getFullYear() + "-" + ("0"+(unixTimestamp.getMonth() + 1)).slice(-2) + "-" + ("0"+unixTimestamp.getDate()).slice(-2);
        return commonTime;      
    } 
    //对象转换成url参数
    toHrefParams(myobj){
        let _hrefParams="";
        for(var key in myobj){
            if(this.is_obj_exist(myobj[key])!='-'){
                _hrefParams+="&"+key+"="+myobj[key];
            }
        }
        return _hrefParams;
    }
    //所选时间不能超过31天
    isMoreThan31(startTime,endTime){
        let result=true;
        if(endTime-startTime>2678400000){
            alert("查询时间不能超过31天！");
            result=false;
        }
        return result;
    }
    //获取服务端时间，用于记录queue操作时间，传给后端用
    getServerTime(mark){
        let serverTime="";
        let that=this;
        $.ajax({
            type:"get",
            url:"/common/getServerTime",
            async:false,
            dataType: "JSON",
            data:{mark:mark},
            success:function(res) {
                if(!that.ajaxGetCode(res)){
                    return;
                }
                var getData = res.data;
                serverTime=getData;
                // let getTimeDom='<div class="serverTime" style="position:fixed;z-index:20000; right:10px;bottom:5px; padding:5px; background:red;">'+serverTime+'</div>';
                // $("body").append(getTimeDom)
            }
        })
        return serverTime;
    }
    //开关按钮
    switch(event){
        let $this=$(event.target);
        if($this[0].tagName=="I"){
            $this=$this.closest(".switch-icon");
        }
        if($this.hasClass("OFF")){
            $this.removeClass("OFF").addClass("ON");
        }else{
            $this.removeClass("ON").addClass("OFF");
        }
    }
    // queue展示详情点击展开 || 收起
    toggle_record_detail(event){
        let $this=$(event.target);
        if($this[0].tagName=="I"){
            $this=$(event.target).parent();
        }
        let _parent=$this.closest(".record-detail-div");
        let icon=_parent.find(".toggle-record-detail");
        if(icon.hasClass("on")){
            $this.removeClass("on").addClass("off");
            _parent.find(".record-detail").css("height","auto");
            _parent.find(".detail").removeClass("elli");
        }else{
            $this.removeClass("off").addClass("on");
            _parent.find(".record-detail").css("height","28px");
            _parent.find(".detail").addClass("elli");
        }
    }
    //判断合同号是否有效（含有‘-’为无效，即不显示）
    loanNumberIsValid(loannumber){
        let reg=/\-/g;
        if(!loannumber){
            return;
        }
        if(reg.test(loannumber)){
            return false;
        }else{
            return true;
        }
    }

    workOrderStatus(_jobStatus){
        if ( _jobStatus == "新建,可处理工单" ) {
            return "处理工单";
        } else if ( _jobStatus == "占用,不可处理工单" ) {
            return "正在编辑";
        }else if ( _jobStatus == "跟进,可处理工单" ) {
            return "跟进工单";
        } else {
            return "已经完成";
        }
    }
    //只能输入数字
    onlyNumber(event){
        let _val=$(event.target).val();
        let inputVeri=isNaN(_val);
        if(inputVeri){
            $(event.target).addClass("warnBg");
        }else{
            $(event.target).removeClass("warnBg");
        }
    }
    //电话号码验证(包含手机号码和座机号码)
    myaer(event){
        var _val=$(event.target).val();
        var phoneVeri=!(/^1\d{10}$/.test(_val));
        if(_val.length>0 && (isNaN(_val) || _val.length>12 || phoneVeri) && _val.indexOf("0")!=0){
            $(event.target).addClass("warnBg");
        }else{
            $(event.target).removeClass("warnBg");
        }
    }
    //禁止图片文件上鼠标右键
    rigmouseh(e){
        e.preventDefault() 
        return false;
    }
    
    /**
     * //labelBox 方法
     * @param {*} that 调用此方法的this指针
     * @param {*} rowData labelBox 需要的切换页面等数据
     * @param {*} changeLabel2A changeLabel2A js文件对象
     * @param {*} changeLabelCP changeLabelCP js文件对象
     * @param {*} isRight2ADetail 指定2A portal是否切换右侧以及切换的编号 {isChange:true||false,changeNo:0}
     * @param {*} isRightCPDetail 指定CP portal是否切换右侧以及切换的编号
     */
    @action changeLabelBoxFn(that,rowData,changeLabel2A,changeLabelCP,isRight2ADetail,isRightCPDetail,type){
        if(!rowData.productNo){
            return;
        }
        that.labelBoxStore.rowData=rowData;
        that.userInfo2AStore.acountId=rowData.accountId; //更新userinfo2A acountId
        that.acountBarStore.acountId=rowData.accountId; //更新acountBar acountId 
        that.acountBarStore.currentLoanNumber=rowData.loanNumber;  //更新acountBar currentLoanNumber,供相关接口用 
        that.acountBarStore.selectedLoanNumber=rowData.loanNumber;  //更新acountBar selectedLoanNumber,供案列页面接口用 

        if(that.userInfoCP){
            that.userInfoCP.loanNo=rowData.loanNumber;  //条件-合同号
            that.userInfoCP.orderNo =rowData.orderNo;  //条件-订单号
            that.userInfoCP.cooperationFlag = rowData.productNo;  //条件-合作方17C
            that.userInfoCP.platformFlag =rowData.platformFlag;  //条件-平台标识 TH/TF
        }

        if(rowData.productNo=="2A"){
            that.userInfo2AStore.getUserInfo2A();  //更新2a userinfo
            that.acountBarStore.getLoanList2A(rowData.accountId);  //获取合同号select列表
            changeLabel2A.changeLeft2A(parseInt(0),that);

            if(isRight2ADetail&&isRight2ADetail.isChange){ //2a portal当右侧组件为case、file....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                let rightNo=parseInt(isRight2ADetail.changeNo);
                changeLabel2A.changeRight2A(rightNo,that,"commonJs");  //调用组件后，是否传递回调函数
            }
        }else{
            that.userInfoCP.getIdentityInfo(that,true,true,type);
            if(isRightCPDetail&&isRightCPDetail.isChange){ //cp portal当右侧组件为文件、还款列表....时，isChange是否切换，changeNo需要切换的板块对应的label data-id
                let rightNo=parseInt(isRightCPDetail.changeNo);
                changeLabelCP.changeRightCP(rightNo,that);
            }
        }
        
    }
    parseLPModule(lpData){
        var moduleMsg = {};
        moduleMsg._source="";
        if(lpData && lpData!=""){
            moduleMsg._source="cretditModel"; //模型来源
            moduleMsg._grade=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.grade:"-"; //CreditModel等级
            moduleMsg._result=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.result:"-";  //结果
            moduleMsg._loanAmount3=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.loanAmount3:"-"; //选择金额/3
            moduleMsg._loanAmount12=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.loanAmount12:"-"; //选择金额/12
            moduleMsg._loanAmount18=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.loanAmount18:"-"; //选择金额/18
            moduleMsg._loanAmount24=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.loanAmount24:"-"; //选择金额/24
            moduleMsg._loanAmount36=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.loanAmount36:"-"; //选择金额/36
            moduleMsg._selected_amount=lpData.selected_amount?lpData.selected_amount:"-"; //选择金额
            moduleMsg._periods=lpData.installments?lpData.installments:"-"; //期数
            moduleMsg._contract_expiring_date=lpData.contract_expiring_date?lpData.contract_expiring_date:"-"; //合同过期日
            moduleMsg._module_date=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.modeldt:"-"; //模型时间
            moduleMsg._hitFraud=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.reason:"-"; //hit fraud
            moduleMsg._isStu=lpData.lpUltimateQueueInfoDTO?lpData.lpUltimateQueueInfoDTO.isStu:"-"; //是否在校学生 check_edu
            if(moduleMsg._periods==3){
                moduleMsg.periodAmount =  moduleMsg._loanAmount3;
            }else if(moduleMsg._periods==12){
                moduleMsg.periodAmount =  moduleMsg._loanAmount12;
            }else if(moduleMsg._periods==24){
                moduleMsg.periodAmount =  moduleMsg._loanAmount24;
            }else if(moduleMsg._periods==18){
                moduleMsg.periodAmount =  moduleMsg._loanAmount18;
            }else if(moduleMsg._periods==36){
                moduleMsg.periodAmount =  moduleMsg._loanAmount36;
            }
        }
        return moduleMsg;
    }

    //type=number 不允许输入e
    handleKeyPress(notAllowArray,event) {
        const invalidChars = ['-', '+', 'e', 'E'];
        if(notAllowArray){
            invalidChars.push(...notAllowArray);
        }
        if(event && invalidChars.indexOf(event.key) !== -1){
          event.preventDefault();
        }
    }
    openUrl=(_url)=>{
        if(!_url||_url=='-'){
            alert('下载地址为空！');
            return;
        }
        window.open(_url);
    }
}

export default CommonJs;