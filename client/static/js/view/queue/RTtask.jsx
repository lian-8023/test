// 实时任务
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd';  //页码
// import ReactSelectize from "react-selectize";
// var SimpleSelect = ReactSelectize.SimpleSelect;

const { Option } = Select;
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class RTtask extends React.Component{
    constructor(props){
        super(props);
        this.state={
            clearCs_inp:true,
            isLoan:false,
            selectedQueueStatusEnums:[],  //已经选择的任务状态数组
            selectedsourceQuotients:[],  //已经选择的渠道来源数组
            barsNum:10,  //每页显示多少条
            currentPage:1,  //当前页码
            current:1,
            updatedAtTimeS: null,
            updatedAtTimeE: null,
            updatedAtTimeeO: false,
            loadPageation:false,//是否加载页码
            selectdArray1:[],//任务状态选中数据
            selectdArray2:[],//渠道来源选中数据

            startValue: null,
            endValue: null,
            endOpen: false,

            scheduledTimeS: null,
            scheduledTimeE: null,
            scheduledTimeO: false,

            payDayS: null,
            payDayE: null,
            payDayO: false,
        }
    }

    componentDidMount(){
        var _that=this;
        commonJs.reloadRules();

        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
        $(".cdt-list").on('click','.myCheckbox',function(event){
            let self=$(event.target);
            self.parent().siblings().find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let _state=self.hasClass("myCheckbox-normal");
            if(_state){
                self.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else {
                self.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
            event.stopPropagation();
        })
        //点击页面隐藏 任务状态 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && (elem.id=='queue-state-ul' || elem.id=='sourceQuotients-ul')) { 
                    return; 
                } 
                if($(elem).closest(".customSelect").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $(".customSelect-ul").addClass("hidden");
            $(".customSelect-icon").removeClass("cs-icon-on");
        }); 
    }
    //初始化类型和任务状态-lyf
    init(){
        let that=this;
        let _initQueueTypes=[];
        let _approveQueueStatuses=[];
        $.ajax({
            type:"get",
            url:"/node/rtTaskIinitType",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data; 
                for(let i=0;i<_getData.queueTypes.length;i++){
                    if( _getData.queueTypes[i].value!=8 && _getData.queueTypes[i].value!=9 && _getData.queueTypes[i].value!=12){
                        _initQueueTypes.push(_getData.queueTypes[i])
                    }
                }
                for(let i=0;i<_getData.approveQueueStatuses.length;i++){
                    if(_getData.approveQueueStatuses[i].value<=10){
                        _approveQueueStatuses.push(_getData.approveQueueStatuses[i])
                    }
                }
                that.setState({
                    initQueueTypes:_initQueueTypes,
                    initEnums:_getData.queueStatusEnums,
                    approveQueueStatuses:_approveQueueStatuses   //queuetype选择approve时，任务状态加载数据
                })
            }
        })
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            currentPage:1,
            current: 1,
            barsNum:pageSize
        },()=>{
            this.theSearch();
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        },()=>{
            this.theSearch();
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.theSearch();
        });
      }
    //改派弹窗
    dispatchPop(){
        let _array=[];
        let pop=$(".dispatch-pop");
        if($(".TRtable-height").find(".myCheckbox-visited").length<=0){
            alert("请选择改派内容！");
            return;
        }
        $(".TRtable-height tr").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let _id=$(this).attr("id");
                _array.push(_id);
            }
        })
        if(pop.hasClass("hidden")){
            pop.removeClass("hidden");
            this.setState({
                dispatchArray:_array
            })
        }else{
            pop.addClass("hidden");
        }
    }
    //关闭弹窗
    closeDispatchPop(e){
        let $this=$(e.target);
        $this.closest(".dispatch-pop").addClass("hidden");
    }
    // 最近处理时间
    updatedAtTimeDisS(updatedAtTimeS){
        const updatedAtTimeE = this.state.updatedAtTimeE;
        if (!updatedAtTimeS || !updatedAtTimeE) {
            return false;
        }
        return updatedAtTimeS.valueOf() > updatedAtTimeE.valueOf()-1;
    }
    updatedAtTimeDisE(updatedAtTimeE){
        const updatedAtTimeS = this.state.updatedAtTimeS;
        if (!updatedAtTimeE || !updatedAtTimeS) {
            return false;
        }
        return updatedAtTimeE.valueOf() <= updatedAtTimeS.valueOf()-1;
    }
    timeOnChange(field, value){
        this.setState({
            [field]: value
        });
    }
    updatedAtTimeChangeS(value){
        this.timeOnChange('updatedAtTimeS', value);
    }
    updatedAtTimeEchange(value){
        this.timeOnChange('updatedAtTimeE', value);
    }
    updatedAtTimeHSO(open){
        if (!open) {
            this.setState({ updatedAtTimeO: true });
        }
    }
    handleupdatedAtTimeOChange(open){
        this.setState({ updatedAtTimeO: open });
    }
    //
    disabledStartDate(startValue){
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf()-1;
    }

    disabledEndDate(endValue){
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf()-1;
    }

    onStartChange(value){
        this.timeOnChange('startValue', value);
    }

    onEndChange(value){
        this.timeOnChange('endValue', value);
        $(".createdAtTime").attr("endTime",commonJs.dateToString(value));
    }

    handleStartOpenChange(open){
        if (!open) {
            this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange(open){
        this.setState({ endOpen: open });
    }
    //
    scheduledTimeSdis(scheduledTimeS){
        const scheduledTimeE = this.state.scheduledTimeE;
        if (!scheduledTimeS || !scheduledTimeE) {
            return false;
        }
        return scheduledTimeS.valueOf() > scheduledTimeE.valueOf()-1;
    }
    scheduledTimeEdis(scheduledTimeE){
        const scheduledTimeS = this.state.scheduledTimeS;
        if (!scheduledTimeE || !scheduledTimeS) {
            return false;
        }
        return scheduledTimeE.valueOf() <= scheduledTimeS.valueOf()-1;
    }
    scheduledTimeSchange(value){
        this.timeOnChange('scheduledTimeS', value);
    }
    scheduledTimeEchange(value){
        this.timeOnChange('scheduledTimeE', value);
    }
    scheduledTimeSOC(open){
        if (!open) {
            this.setState({ scheduledTimeO: true });
        }
    }
    scheduledTimeEOC(open){
        this.setState({ scheduledTimeO: open });
    }
    // 获取用户名
    getAdminMaps(){
        let _that=this;
        let _array=[];
        $.ajax({
            type:"get",
            url:"/node/tianrList",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                var keys=[];//定义一个数组用来接受key  
                var values=[];//定义一个数组用来接受value  
                for(var key in _getData.adminNameMaps){  
                    keys.push(key);  
                    _array.push(_getData.adminNameMaps[key]);//取得value   
                }  
                _that.setState({
                    adminNameMaps:_array
                })
            }
        })
    }
    //获取搜索条件
    getConditions(){
        let data={};
        let _selectedQueueStatusEnums=this.state.selectedQueueStatusEnums;
        let _selectedsourceQuotients=$(".conditionBox .sourceQuotients-inp").val();
        let sourceQREG=/^[_a-zA-Z0-9, ]+$/;
        if(_selectedsourceQuotients && !sourceQREG.test(_selectedsourceQuotients)){
            alert("来源渠道必须是数字或者英文字母！");
            return;
        }
        if(_selectedsourceQuotients && _selectedsourceQuotients!="-"){
            _selectedsourceQuotients=_selectedsourceQuotients.split(",");
            _selectedsourceQuotients = [...new Set(_selectedsourceQuotients)]; 
        }else{
            _selectedsourceQuotients=[]
        }
        let _queueType=$(".conditionBox .sourceQuotient option:selected").attr("name");  //Queue Type
        if(!_queueType){
            alert("Queue Type是必选！");
            return;
        }
        $(".conditionBox .customSelect .queue-state-ul li").each(function(){
            if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
                let selected_value=$(this).attr("data-value");
                _selectedQueueStatusEnums.push(selected_value);
            }
        });
        // $(".conditionBox .customSelect .sourceQuotients-ul li").each(function(){
        //     if($(this).find(".myCheckbox").hasClass("myCheckbox-visited")){
        //         let selected_value=$(this).find("span").text();
        //         _selectedsourceQuotients.push(selected_value);
        //     }
        // });
        let _queueEnums=_selectedQueueStatusEnums;   //任务状态ID
        let _updatedAtBegin="",_updatedAtEnd="",_createdAtBegin="",_createdAtEnd="",_scheduledTimeBegin="",_scheduledTimeEnd="";        
        let _createdAtTime=this.dealTime(this.state.startValue,this.state.endValue);
        _createdAtBegin=_createdAtTime.Stime;   //创建时间起
        _createdAtEnd=_createdAtTime.Etime;   //创建时间止
        if($(".creTimeOrder").hasClass("sort-inver")){  //是否排序  降序传1，升序传0，不选传0
            data.creTimeOrder=1;
        }else if($(".creTimeOrder").hasClass("sort-asce")){
            data.creTimeOrder=2;
        }else{
            data.creTimeOrder=0;
        }
        
        let _scheduledTime=this.dealTime(this.state.scheduledTimeS,this.state.scheduledTimeE);
        _scheduledTimeBegin=_scheduledTime.Stime;   //需跟进时间起
        _scheduledTimeEnd=_scheduledTime.Etime;   //需跟进时间止
        if($(".scheTimeOrder").hasClass("sort-inver")){  //是否排序  降序传1，升序传0，不选传0
            data.scheTimeOrder=1;
        }else if($(".scheTimeOrder").hasClass("sort-asce")){
            data.scheTimeOrder=2;
        }else{
            data.scheTimeOrder=0;
        }
        
        let _updatedAtTime=this.dealTime(this.state.updatedAtTimeS,this.state.updatedAtTimeE);
        _updatedAtBegin=_updatedAtTime.Stime;   //最近处理时间起
        _updatedAtEnd=_updatedAtTime.Etime;   //最近处理时间止
        if($(".upTimeOrder").hasClass("sort-inver")){  //是否排序  降序传1，升序传0，不选传0
            data.upTimeOrder=1;
        }else if($(".upTimeOrder").hasClass("sort-asce")){
            data.upTimeOrder=2;
        }else{
            data.upTimeOrder=0;
        }
        
        let _bindBy=$(".conditionBox .bindBy .simple-value span").text();   //任务所有者
        let _code=$(".conditionBox .bindBy").attr("data-selected");
        let _voeStates="",_vorStates="",_ocrStates="",_finalHandlerCode="",_sourceQuotient="";

        if( _queueType=="APPROVE" || _queueType=="DECLINE_LP" || _queueType=="TSLP"){
            _voeStates=$(".conditionBox .voeStates option:selected").attr("name"); 
            _vorStates=$(".conditionBox .vorStates option:selected").attr("name"); 
            _ocrStates=$(".conditionBox .ocrStates option:selected").attr("name"); 
            _finalHandlerCode=$(".conditionBox .finalHandlerCode").attr("data-selected");
        }
        
        if(_bindBy) data.bindBy=_bindBy;
        if(_code && typeof(_code)!="undefind") data.code=_code;
        if(_queueType && typeof(_queueType)!="undefind") data.queueType=_queueType;
        let queueStatusIds=this.state.queueStatusIds;
        if(queueStatusIds && queueStatusIds.length>0) data.queueStatusIds=queueStatusIds;
        if(_updatedAtBegin && typeof(_updatedAtBegin)!="undefind") data.updatedAtBegin=_updatedAtBegin;
        if(_updatedAtEnd && typeof(_updatedAtEnd)!="undefind") data.updatedAtEnd=_updatedAtEnd;
        if(_createdAtBegin && typeof(_createdAtBegin)!="undefind") data.createdAtBegin=_createdAtBegin;
        if(_createdAtEnd && typeof(_createdAtEnd)!="undefind") data.createdAtEnd=_createdAtEnd;
        if(_scheduledTimeBegin && typeof(_scheduledTimeBegin)!="undefind") data.scheduledTimeBegin=_scheduledTimeBegin;
        if(_scheduledTimeEnd && typeof(_scheduledTimeEnd)!="undefind") data.scheduledTimeEnd=_scheduledTimeEnd;
        if(_voeStates && typeof(_voeStates)!="undefind") data.voe=_voeStates;
        if(_vorStates && typeof(_vorStates)!="undefind") data.vor=_vorStates;
        if(_ocrStates && typeof(_ocrStates)!="undefind") data.ocr=_ocrStates;
        let isShowEtime=this.state.isShowEtime;
        if(_finalHandlerCode && typeof(_finalHandlerCode)!="undefind" && (isShowEtime=="LP" || isShowEtime=="APPROVE" || isShowEtime=="DECLINE_LP" || isShowEtime=="TSLP")) data.finalHandlerCode=_finalHandlerCode;  //最终处理者 (fraud不需要最终处理者)
        if(_selectedsourceQuotients && _selectedsourceQuotients.length>0 && (isShowEtime=="FRAUD" ||isShowEtime=="LP" || isShowEtime=="APPROVE" || isShowEtime=="DECLINE_LP")) data.sourceQuotients=_selectedsourceQuotients;  //来源渠道
        data.pageSize=this.state.barsNum;
        data.pageNum=this.state.current;
        return data;
    }
    /*
        时间处理  30天以内
        startTime 开始时间
        endTime 结束时间
        isNeedNow 如果没选，是否需要获取当前时间并向前推30天
    */
    dealTime(startTime,endTime,isNeedNow){
        this.startTime=new Date(this.state.startTime).getTime();
        this.endTime=new Date(this.state.endTime).getTime();
        let resultTime={
            Stime:"",
            Etime:""
        };
        if(startTime && !endTime){
            let _Etime=startTime+2592000000;
            resultTime={
                Stime:commonJs.dateToString(startTime),
                Etime:commonJs.dateToString(_Etime)
            };
        }
        if(!startTime && endTime){
            let _startTime=endTime-2592000000;
            resultTime={
                Stime:commonJs.dateToString(_startTime),
                Etime:commonJs.dateToString(endTime)
            };
        }
        if(startTime && endTime){
            resultTime={
                Stime:commonJs.dateToString(startTime),
                Etime:commonJs.dateToString(endTime)
            };
        }
        if(!startTime && !endTime && isNeedNow){
            let _Etime=new Date().getTime();
            let _Stime=_Etime-2592000000;
            resultTime={
                Stime:commonJs.dateToString(_Stime),
                Etime:commonJs.dateToString(_Etime)
            };
        }
        return resultTime;
    }
    //搜索 如果fromBtn存在，点击目标为搜索按钮
    theSearch(fromBtn){
        let _that=this;
        $(".loadPage .pageStart,.loadPage .pageEnd").val("");
        if(fromBtn){
            this.setState({
                current:1
            },()=>{
                let _data=_that.getConditions();
                this.searFn(_data);
            })
        }else{
            let _data=_that.getConditions();
            this.searFn(_data);
        }
    }
    searFn(param){
        let _that=this;
        this.setState({
            loadPageation:false
        })
        console.log(param);
        if(!param||!param.queueType){
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/rtTaskSearch?time="+new Date().getTime(),
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(param)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                commonJs.ajaxGetCode(res);
                let _getData = res.data;
                if(!_getData.executed){
                    _that.setState({
                        rtTimeTaskInfoDTOS: [],
                        Rmd_Q_ajax:{},
                        _params:"",
                        _userMsg_reload:"reload",
                        _oper_type:"next",
                        current:1,  //当前页码
                        totalSize:0,
                        selectedQueueStatusEnums:[],
                        sourceQuotients:[]
                    });
                    return;
                }
                let _sourceQuotients=[];  //渠道来源
                if(_that.state.isShowEtime=="FRAUD"||_that.state.isShowEtime=="LP"||_that.state.isShowEtime=="APPROVE"||_that.state.isShowEtime=="DECLINE_LP"){
                    _sourceQuotients=_getData.sourceQuotients?_getData.sourceQuotients:[];
                }else{
                    _sourceQuotients=[];
                }
                _that.setState({
                    rtTimeTaskInfoDTOS:_getData.rtTimeTaskInfoDTOS ? _getData.rtTimeTaskInfoDTOS : [],
                    totalSize:_getData.totalSize?_getData.totalSize:0,
                    loadPageation:true,
                    selectedQueueStatusEnums:[],
                    sourceQuotients:_sourceQuotients,
                    _selected2:""
                })
                if(param.sourceQuotients && param.sourceQuotients.length>0){
                    $(".sourceQuotients-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //改派
    sureDispath(){
        let _that=this;
        let _code=$(".dispatch-pop .dispathToName").attr("data-selected");
        if(_code==""){
            alert("请选择改派对象！");
            return;
        }
        let _ids=this.state.dispatchArray;
        let _queueType=$(".sourceQuotient option:selected").attr("name");
        let _data={
                ids:_ids,
                code:_code,
                queueType:_queueType
            };
        $.ajax({
            type:"post",
            url:"/node/rtTaskChange",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            beforeSend:function(XMLHttpRequest){
                let loading_html='<div id="loading">'+
                                        '<div class="tanc_bg"></div>'+
                                        '<div class="ant-spin ant-spin-lg ant-spin-spinning ant-spin-show-text"><span class="ant-spin-dot"><i></i><i></i><i></i><i></i></span><div class="ant-spin-text">Loading...</div></div>'+
                                    '</div>';
                $("body").append(loading_html);       
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                let _getData = res.data;
                $(".dispatch-pop").addClass("hidden");
                alert(_getData.message);
                $(".cdt-result .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                _that.theSearch();
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
    //判断Queue Type
    isLPHandle(event){
        let selectedName=$(event.target).find("option:selected").attr("name"); //选中的渠道来源
        let $parent=$(event.target).closest(".conditionBox");
        if(selectedName=="SUPER_APPROVE"){
            $parent.find(".customSelect").addClass("hidden");
            $parent.find(".childrenState").addClass("hidden");
        }else{
            $parent.find(".customSelect").removeClass("hidden");
            $parent.find(".childrenState").removeClass("hidden");
        }
        this.setState({
            isShowEtime:selectedName,
            selectdArray:[],
            _selected1:[],
            _selected2:[],
            isLoan:false
        });
        $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }
    // 导出Excel
    excelLoad(){
        let _startPage=$(".loadPage .pageStart").val();
        let _endPage=$(".loadPage .pageEnd").val();
        if(!_startPage || !_endPage){
            alert("请填写需要下载的页码！");
            return;
        }
        let dataTotal=this.state.barsNum*(_endPage-_startPage+1);
        if(dataTotal>1000){
            alert("下载内容不能超出1000条，请重新填写下载页码！");
            return;
        }
        window.open("/Qport/exportTRtask?"+commonJs.toHrefParams(this.getConditions())+"&startPage="+_startPage+"&endPage="+_endPage);
    }
    selectedLi2(event){
        let $this=$(event.target);
        // let _selectdArray=this.state.selectdArray2;
        let _selectdArray=$(".conditionBox .sourceQuotients-inp").val();
        if(_selectdArray && _selectdArray!="-"){
            _selectdArray=_selectdArray.split(",");
        }else{
            _selectdArray=[]
        }
        let thisText=$this.parent().find("span").text();
        let _isLoan=false;
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            _selectdArray.push(thisText);
            this.setState({
                selectdArray2:_selectdArray,
                _selected2:_selectdArray.join(",")
            })
            if(thisText=="放款" || thisText=="LP放款"){   //选择LP终审放款/approve放款显示 放款人/放款时间/放款金额
                this.setState({
                    isLoan:true
                })
            }
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let index =_selectdArray.indexOf(thisText);
            if (index > -1) {
                _selectdArray.splice(index, 1);
            }
            if(thisText=="放款" || thisText=="LP放款"){   //选择LP终审放款/approve放款显示 放款人/放款时间/放款金额
                this.setState({
                    isLoan:false
                })
            }
            this.setState({
                selectdArray2:_selectdArray,
                _selected2:_selectdArray.join(",")
            })
        }
    }
    // 任务状态获取焦点
    selectTriger(event){
        let $this=$(event.target);
        let $parent=$this.closest(".customSelect");
        let $ul=$parent.find(".customSelect-ul");
        let $icon=$parent.find(".cs-icon");
        if($this.hasClass("queueStates-inp")){
            $(".sourceQuotients-ul").addClass("hidden");
        }else{
            $(".queue-state-ul").addClass("hidden");
        }
        if($ul.hasClass("hidden")){
            $ul.removeClass("hidden");
            $icon.addClass("cs-icon-on");
        }else{
            $ul.addClass("hidden");
            $icon.removeClass("cs-icon-on");
        }
    }
    // 排序
    isSort(event){
        // sort-inver 降序 ；sort-asce 升序
        let $this=$(event.target);
        if($this.hasClass("sort-normal")){
            $this.removeClass("sort-normal").addClass("sort-inver");
            return;
        }
        if($this.hasClass("sort-inver")){
            $this.removeClass("sort-inver").addClass("sort-asce");
            return;
        }
        if($this.hasClass("sort-asce")){
            $this.removeClass("sort-asce").addClass("sort-normal");
            return;
        }
    }
    myinput(event){
        let _val=$(event.target).val();
        let _valArray=[];
        if(_val && _val!="-"){
            _valArray=_val.split(",");
        }
        
        $(".sourceQuotients-ul li").each(function(){
            let li_text=$(this).find("span").text();
            if(_valArray.indexOf(li_text)<0){
                $(this).find(".myCheckbox").addClass("myCheckbox-normal").removeClass("myCheckbox-visited");
            }else{
                $(this).find(".myCheckbox").addClass("myCheckbox-visited").removeClass("myCheckbox-normal");
            }
        });
        this.setState({
            selectdArray2:[],
            selectedsourceQuotients:[],
            _selected2:_val
        })
        // $(".sourceQuotients-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
    }
    //
    statesChange=(value)=>{
        this.setState({
            queueStatusIds:value
        })
        if(value.includes(2)|| value.includes(11)){   //选择LP终审放款/approve放款显示 放款人/放款时间/放款金额
            this.setState({
                isLoan:true
            })
        }else{
            this.setState({
                isLoan:false
            })
        }
    }
    render() {
        const { updatedAtTimeS, updatedAtTimeE, updatedAtTimeO } = this.state;
        const { startValue, endValue, endOpen } = this.state;
        const { scheduledTimeS, scheduledTimeE, scheduledTimeO } = this.state;
        let adminNameMaps=this.state.adminNameMaps;
        let taskState=(this.state.isShowEtime=="APPROVE" || this.state.isShowEtime=="FRAUD")?this.state.approveQueueStatuses:this.state.initEnums;  //任务状态-条件
        const children = [];
        if(taskState){
            for (let i = 0; i < taskState.length; i++) {
                children.push(<Option key={i} value={taskState[i].value}>{taskState[i].displayName}</Option>);
            }
        }
        return (
            <div className="content" id="content">
                {/*条件*/}
                <div className="conditionBox clearfix" data-isresetdiv="yes" 
                    data-resetstate="bindBy_selected,_selected,_selected2,selectdArray,updatedAtTimeS,updatedAtTimeE,startValue,endValue,scheduledTimeS,scheduledTimeE "
                >
                    <div className="cdt-cont clearfix pb10">
                        <div className="left select-box"> 
                            <select name="" id="sourceQuotient" className="select-gray mt10 mb5 sourceQuotient" onChange={this.isLPHandle.bind(this)} style={{"width":"100%"}}>
                                <option value="" hidden>Queue Type</option>
                                {
                                    (this.state.initQueueTypes && this.state.initQueueTypes.length>0)?this.state.initQueueTypes.map((repy,i)=>{
                                        return <option key={i} value={repy.value} name={repy.name}>{repy.displayName}</option>
                                    }):<option value=""></option>
                                }
                            </select>
                            <div className="queueStatusId">
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Please select"
                                    onChange={this.statesChange}
                                >
                                    {children}
                                </Select>
                            </div>
                            <div className="customSelect clearfix mt5 left relative" id='sourceQuotientsSel'>
                                {
                                    (this.state.isShowEtime=="FRAUD" || this.state.isShowEtime=="LP" || this.state.isShowEtime=="APPROVE" || this.state.isShowEtime=="DECLINE_LP")?
                                    <input type="text" 
                                        className="left cs-inp sourceQuotients-inp" 
                                        value={this.state._selected2?this.state._selected2:""} 
                                        placeholder="来源渠道" 
                                        onClick={this.selectTriger.bind(this)}
                                        onChange={this.myinput.bind(this)}
                                        id='sourceQuotients'
                                    />:
                                    "-"
                                }
                                <i className="right cs-icon" id="customSelect-icon"></i>
                                <div className="clear"></div>
                                <ul className="customSelect-ul absolute hidden sourceQuotients-ul" id="sourceQuotients-ul">
                                    {
                                        (this.state.sourceQuotients && this.state.sourceQuotients.length>0) ? this.state.sourceQuotients.map((repy,i)=>{
                                            if(repy){
                                                return <li key={i} >
                                                        <span className="left">{repy}</span>
                                                        <i className="myCheckbox myCheckbox-normal right mr3" onClick={this.selectedLi2.bind(this)}></i>
                                                    </li>
                                            }
                                        }):""
                                    }
                                </ul>
                            </div>
                        </div>
                        <div className="line left"></div>
                        <dl className="left lable-box mt10 mr10 RT-cdt">
                            <dt>创建时间<span></span></dt>
                            <dd id='disabledStartDate'>
                                <DatePicker
                                    disabledDate={this.disabledStartDate.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={startValue}
                                    placeholder="Start"
                                    onChange={this.onStartChange.bind(this)}
                                    onOpenChange={this.handleStartOpenChange.bind(this)}
                                />
                                <span> - </span>
                                <DatePicker
                                    disabledDate={this.disabledEndDate.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={endValue}
                                    placeholder="End"
                                    onChange={this.onEndChange.bind(this)}
                                    open={endOpen}
                                    onOpenChange={this.handleEndOpenChange.bind(this)}
                                />
                                <i className="ST-sort sort-inver creTimeOrder" id='creTimeOrder' onClick={this.isSort.bind(this)}></i>
                            </dd>
                            <dt>需跟进时间<span></span></dt>
                            <dd id='scheduledTime'>
                                <DatePicker
                                    disabledDate={this.scheduledTimeSdis.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={scheduledTimeS}
                                    placeholder="Start"
                                    onChange={this.scheduledTimeSchange.bind(this)}
                                    onOpenChange={this.scheduledTimeSOC.bind(this)}
                                />
                                <span> - </span>
                                <DatePicker
                                    disabledDate={this.scheduledTimeEdis.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={scheduledTimeE}
                                    placeholder="End"
                                    onChange={this.scheduledTimeEchange.bind(this)}
                                    open={scheduledTimeO}
                                    onOpenChange={this.scheduledTimeEOC.bind(this)}
                                />
                                <i className="ST-sort sort-inver scheTimeOrder" id='scheTimeOrder' onClick={this.isSort.bind(this)}></i>
                            </dd>
                            <dt>最近处理时间<span></span></dt>
                            <dd id='updatedAtTime'>
                                <DatePicker
                                    disabledDate={this.updatedAtTimeDisS.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={updatedAtTimeS}
                                    placeholder="Start"
                                    onChange={this.updatedAtTimeChangeS.bind(this)}
                                    onOpenChange={this.updatedAtTimeHSO.bind(this)}
                                />
                                <span> - </span>
                                <DatePicker
                                    disabledDate={this.updatedAtTimeDisE.bind(this)}
                                    showTime
                                    format="YYYY-MM-DD HH:mm:ss"
                                    value={updatedAtTimeE}
                                    placeholder="End"
                                    onChange={this.updatedAtTimeEchange.bind(this)}
                                    open={updatedAtTimeO}
                                    onOpenChange={this.handleupdatedAtTimeOChange.bind(this)}
                                />
                                <i className="ST-sort sort-inver upTimeOrder" onClick={this.isSort.bind(this)}></i>
                            </dd>
                            <dt style={{lineHeight:'32px',height:'32px',marginBottom:0}}>任务所有者<span></span></dt>
                            <dd className="relative">
                                <div className="bindBy" id='bindBy'>
                                    {/* <SimpleSelect
                                        placeholder = "请输入"
                                        onValueChange = {function(obj){
                                            if(obj && typeof(obj)!="undefined"){
                                                $(".bindBy").attr("data-selected",obj.value);
                                            }else{
                                                $(".bindBy").attr("data-selected","");
                                            }
                                        }}
                                    >
                                    {
                                        (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                            return <Option value = {repy.code} key={i}>{repy.name}</Option>
                                        }):<option value = "">没有数据</option>
                                    }
                                    </SimpleSelect> */}
                                </div>
                            </dd>
                        </dl>
                        {
                            (this.state.isShowEtime=="LP" || this.state.isShowEtime=="APPROVE" || this.state.isShowEtime=="DECLINE_LP" || this.state.isShowEtime=="TSLP")?
                            <dl className="left lable-box mt10 mr10 RT-cdt">
                                <dt style={{lineHeight:'32px',height:'32px',marginBottom:0}}>最终处理者<span></span></dt>
                                <dd className="relative">
                                    <div className="finalHandlerCode" id='finalHandlerCode'>
                                        {/* <SimpleSelect
                                            placeholder = "请输入"
                                            onValueChange = {function(obj){
                                                if(obj && typeof(obj)!="undefined"){
                                                    $(".finalHandlerCode").attr("data-selected",obj.value);
                                                }else{
                                                    $(".finalHandlerCode").attr("data-selected","");
                                                }
                                            }}
                                        >
                                        {
                                            (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                                return <Option value = {repy.code} key={i}>{repy.name}</Option>
                                            }):<option value = "">没有数据</option>
                                        }
                                        </SimpleSelect> */}
                                    </div>
                                </dd>
                            </dl>:""
                        }
                        <button className="left mt10 mr15 btn-blue RTtsearch" id='searchBtn' onClick={this.theSearch.bind(this,true)}>搜索</button> 
                        {/* <button className="left mt10 btn-white" id='reset' onClick={commonJs.resetCondition.bind(this,this)}>重置</button> */}
                    </div>
                </div>
                {/*条件 end*/}
                
                <div className="cdt-result bar mt20 relative">
                    <div className="th-bg">
                        <table className="pt-table th-bg">
                            <tbody>
                                <tr>
                                    <th width="10%">账号</th>
                                    <th width="20%">贷款号码</th>
                                    <th width="10%">需跟进时间</th>
                                    <th width="10%">最近处理时间</th>
                                    <th width="10%">任务所有者</th>
                                    <th width="10%" className={this.state.isShowEtime=="SUPER_APPROVE"?"":"hidden"}>原因</th>
                                    <th width="10%" className={(this.state.isShowEtime=="FRAUD" || this.state.isShowEtime=="LP" || this.state.isShowEtime=="APPROVE" || this.state.isShowEtime=="DECLINE_LP")?"Esign-time":"Esign-time hidden"}>E-sign时间</th>
                                    <th width="10%" className={this.state.isLoan?"":"hidden"}>放款人</th>
                                    <th width="10%" className={this.state.isLoan?"":"hidden"}>放款时间</th>
                                    <th width="10%" className={this.state.isLoan?"":"hidden"}>放款金额</th>
                                    <th width="5%"><i className="myCheckbox myCheckbox-normal" onClick={commonJs.selectAll.bind(this,".cdt-result")} id='selectAll'></i></th>
                                    <th width=""><a  className={this.state.isShowEtime=="SUPER_APPROVE"?"dispatch hidden":"dispatch"} id='dispatch' data-btn-rule="RT:CHANGE" onClick={this.dispatchPop.bind(this)}>改派</a></th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="TRtable-height">
                        <table className="pt-table layout-fixed">
                            <tbody>
                            {
                                (this.state.rtTimeTaskInfoDTOS && this.state.rtTimeTaskInfoDTOS.length>0) ? this.state.rtTimeTaskInfoDTOS.map((repy,i)=>{
                                    return <tr key={i} id={commonJs.is_obj_exist(repy.id)}>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.accountId)}>{commonJs.is_obj_exist(repy.accountId)}</td>
                                            <td width="20%" title={commonJs.is_obj_exist(repy.loanNumber)}>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.scheduledTime)}>{commonJs.is_obj_exist(repy.scheduledTime)}</td>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.updatedAt)}>{commonJs.is_obj_exist(repy.updatedAt)}</td>
                                            <td width="10%" title={commonJs.is_obj_exist(repy.bindBy)}>{commonJs.is_obj_exist(repy.bindBy)}</td>
                                            <td width="10%" className={this.state.isShowEtime=="SUPER_APPROVE"?"":"hidden"} title={commonJs.is_obj_exist(repy.appStatus)}>{commonJs.is_obj_exist(repy.appStatus)}</td>
                                            <td width="10%" className={(this.state.isShowEtime=="FRAUD" ||this.state.isShowEtime=="LP" || this.state.isShowEtime=="APPROVE" || this.state.isShowEtime=="DECLINE_LP")?"Esign-time":"Esign-time hidden"} title={commonJs.is_obj_exist(repy.eSignTime)}>{commonJs.is_obj_exist(repy.eSignTime)}</td>
                                            <td width="10%" className={this.state.isLoan?"":"hidden"} title={commonJs.is_obj_exist(repy.loanOperator)}>{commonJs.is_obj_exist(repy.loanOperator)}</td>
                                            <td width="10%" className={this.state.isLoan?"":"hidden"} title={commonJs.is_obj_exist(repy.loanTime)}>{commonJs.is_obj_exist(repy.loanTime)}</td>
                                            <td width="10%" className={this.state.isLoan?"":"hidden"} title={commonJs.is_obj_exist(repy.loanMoney)}>{commonJs.is_obj_exist(repy.loanMoney)}</td>
                                            <td width="5%"><i className="myCheckbox myCheckbox-normal" id={'trCheck'+i} onClick={commonJs.myCheckbox.bind(this)}></i></td>
                                            <td width=""></td>
                                        </tr>
                                }):<tr><td colSpan="3" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }  
                            </tbody>
                        </table>
                    </div>
                    <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                        <div className="paageNo left">
                            {this.state.loadPageation?<Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                current={this.state.current}
                                total={this.state.totalSize}
                                onChange={this.pageChange.bind(this)}
                                pageSizeOptions={['10','25','50','100']}
                            />:""}
                        </div>
                        {
                            (this.state.rtTimeTaskInfoDTOS && this.state.rtTimeTaskInfoDTOS.length>0) ? 
                            <div className="loadPage right">
                                <span className="yellow-font left pr5 line-height26">单次最多下载1000条数据</span>
                                <input type="number" className="input pageStart left input_w" id='pageStart' placeholder="请输入开始页"/>
                                <span className="left pl5 pr5 line-height26">到</span>
                                <input type="number" className="input pageEnd left mr10 input_w" id='pageEnd' placeholder="请输入结束页"/>
                                <a onClick={this.excelLoad.bind(this)} className="downRecord left mt2" id='downRecord' data-btn-rule="RT:EXPORT">导出记录</a>
                            </div>
                             : ""
                        }
                    </div>
                </div>

                {/*改派弹窗*/}
                <div className="dispatch-pop hidden">
                    <div className="tanc_bg"></div>
                    <div className="dispatch-box clearfix">
                        <div className="left search-box clearfix mr10 dispathToName">
                            {/* <SimpleSelect
                                placeholder = "请输入"
                                onValueChange = {function(obj){
                                    if(obj && typeof(obj)!="undefined"){
                                        $(".dispathToName").attr("data-selected",obj.value);
                                    }
                                }}
                            >
                            {
                                (adminNameMaps && adminNameMaps.length>0) ? adminNameMaps.map((repy,i)=>{
                                    return <option value = {repy.code} key={i}>{repy.name}</option>
                                }):<option value = "">没有数据</option>
                            }
                            </SimpleSelect> */}
                        </div>
                        <a className="btn-deep-yellow left mr10 btn_yello_h30" onClick={this.sureDispath.bind(this)}>改派</a>
                        <i className="close right mt8 pointer" onClick={this.closeDispatchPop.bind(this)}></i>
                    </div>
                </div>
            </div>
        )
    }
};

export default RTtask;  //ES6语法，导出模块