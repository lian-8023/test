// 数据异常
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class DataAbnormal extends React.Component{
    constructor(props){
        super(props);
        this.state={
            barsNum:10,  //每页显示多少条
            currentPage:1,  //当前页码
            current:1,
            startValue: null,
            endValue: null,
            endOpen: false
        }
    }

    componentDidMount(){
        var _that=this;
        commonJs.reloadRules();

        var h = document.documentElement.clientHeight;
        $("#content").height(h-40);
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }
    //
    timeOnChange(field, value){
        this.setState({
            [field]: value
        });
    }
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
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        },()=>{
            // this.theSearch();
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        },()=>{
            // this.theSearch();
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            // this.theSearch();
        });
    }
    //获取条件
    getCondition(fromTop){
        let _sTime=commonJs.dateToString2(this.state.startValue);
        let _eTime=commonJs.dateToString2(this.state.endValue);
        let _param={
            pageSize:this.state.barsNum,
            pageNum:fromTop?1:this.state.current,
            startDate:(_sTime!="1970-1-1")?_sTime:"",
            endDate:(_eTime!="1970-1-1")?_eTime:"",
            channel:$(".channel option:selected").attr("value"),
            productType:$(".productType option:selected").attr("value"),
            totalAmontMin:$(".totalAmontMin").val().replace(/\s/g,""),
            totalAmontMax:$(".totalAmontMax").val().replace(/\s/g,""),
            userName:$(".userName").val().replace(/\s/g,""),
            loanNumber:$(".loanNo").val().replace(/\s/g,""),
            isError:1
        };
        return _param;
    }
    //搜索
    searchHandle(fromTop){
        let that=this;
        let _param=this.getCondition(fromTop);
        if(!this.state.endValue ||!this.state.startValue){
            alert("请选择查询日期！");
            return;
        }
        let isTime=commonJs.isMoreThan31(this.state.startValue,this.state.endValue);
        if(!isTime){
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/queryReconDetails",
            async:true,
            dataType: "JSON",
            data:_param,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                if(fromTop){
                    that.setState({
                        reconDetailsInfos:_getData.reconDetailsInfos,
                        totalCount:_getData.totalCount,
                        current:1
                    })
                }else{
                    that.setState({
                        reconDetailsInfos:_getData.reconDetailsInfos,
                        totalCount:_getData.totalCount
                    })
                }
                
            }
        })
    }
    //处理 fn
    dealHandle(event){
        let _parent=$(event.target).closest(".tr");
        $(".dealBtn").addClass("hidden");
        $(".saveBtn").removeClass("hidden");
        _parent.find(".edeat").each(function(){
            let _param=$(this).attr("data-param");
            let _value=$(this).find(".ed-cont").text();
            let dom='<input type="text" class="input edit-inp" value="'+_value+'" data-param="'+_param+'" style="width:100%"/>';
            $(this).find(".ed-cont").addClass("hidden");
            $(this).append(dom);
        })
    }
    //保存 fn
    saveHandle(event){
        let _parent=$(event.target).closest(".tr");
        $(".dealBtn").removeClass("hidden");
        $(".saveBtn").addClass("hidden");
    }
    //历史 fn
    showHistory(event){
        let $this=$(event.target);
        let _parent=$this.closest(".tr");
        let history_dom=_parent.find(".history-data");
        if($this.hasClass("slide-up")){  //收起
            _parent.removeClass("show-history");
            history_dom.addClass("hidden");
            $this.removeClass("slide-up");
        }else{  //展开
            _parent.addClass("show-history");
            history_dom.removeClass("hidden");
            $this.addClass("slide-up");
        }
    }
    render() {
        const { startValue, endValue, endOpen } = this.state;
        const {reconDetailsInfos,totalCount}=this.state;
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto">
                    <div className="left data-condi pb10">
                        <dl className="dl1">
                            <dt>日期：</dt>
                            <dd>
                                <DatePicker
                                    disabledDate={this.disabledStartDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={startValue}
                                    placeholder="Start"
                                    onChange={this.onStartChange.bind(this)}
                                    onOpenChange={this.handleStartOpenChange.bind(this)}
                                />
                                <span>&nbsp;-&nbsp;</span>
                                <DatePicker
                                    disabledDate={this.disabledEndDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={endValue}
                                    placeholder="End"
                                    onChange={this.onEndChange.bind(this)}
                                    open={endOpen}
                                    onOpenChange={this.handleEndOpenChange.bind(this)}
                                />
                            </dd>
                        </dl>
                        <div className="clearfix"></div>
                        <dl className="dl1">
                            <dt>渠道：</dt>
                            <dd>
                                <select name="" id="" className="select-gray channel" style={{"width":"98%"}}>
                                    <option value="">全部</option>
                                    <option value="unionPay">广州</option>
                                    <option value="chinaPay">上海</option>
                                    <option value="yjfPay">易极付</option>
                                    <option value="kftPay">快付通</option>
                                    <option value="chinaActivePay">上海银联主动支付</option>
                                </select>
                            </dd>
                        </dl>
                    </div>
                    <div className="left data-condi pb10">
                        <dl>
                            <dt>产品类别：</dt>
                            <dd>
                                <select name="" id="" className="select-gray productType" style={{"width":"98%"}}>
                                    <option value="">全选</option>
                                    <option value="2A">1A</option>
                                    <option value="2A">2A</option>
                                    <option value="3D">3D</option>
                                    <option value="4D">4D</option>
                                </select>
                            </dd>
                        </dl>
                        <div className="clearfix"></div>
                        <dl>
                            <dt>总金额：</dt>
                            <dd>
                                <input type="text" className="input left dD-half totalAmontMin"/>
                                <span className="left">&nbsp;-&nbsp;</span>
                                <input type="text" className="input left dD-half totalAmontMax"/>
                            </dd>
                        </dl>
                    </div>
                    <div className="left data-condi pb10">
                        <dl className="dl2">
                            <dt>贷款号码：</dt>
                            <dd className="dD-loanbumber">
                                <input type="text" className="input loanNo" placeholder="贷款号码"/>
                            </dd>
                        </dl>
                        <div className="clearfix"></div>
                        <dl className="dl2">
                            <dt>姓名：</dt>
                            <dd className="dD-name">
                                <input type="text" className="input userName" placeholder="贷款用户姓名"/>
                            </dd>
                        </dl>
                    </div>
                    <div className="left mt10 ml5">
                        <dl>
                            <dt className="left">状态：</dt>
                            <dd className="left">
                                <select name="" id="" className="select-gray" style={{"width":"100px"}}>
                                    <option value="">全选</option>
                                    <option value="">未处理</option>
                                    <option value="">待处理</option>
                                    <option value="">无需处理</option>
                                    <option value="">完成</option>
                                </select>
                            </dd>
                        </dl>
                        <div className="clear"></div>
                        <button className="btn-blue block mt10" onClick={this.searchHandle.bind(this)}>搜索</button>
                    </div>
                </div>
                <div className="bar mt20">
                    <ul className="ul-tab da-table">
                        <li className="th">
                            <span className="ul-tab-span" style={{"width":"10%"}}>日期</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>产品类别</span>
                            <span className="ul-tab-span" style={{"width":"20%"}}>贷款号码</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>收款款次</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>总金额</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>本金</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>利息</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>前期费</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>滞纳金</span>
                            <span className="ul-tab-span" style={{"width":"6%"}}>服务费</span>
                            <span className="ul-tab-span" style={{"width":"20%"}}></span>
                        </li>
                        {
                            (reconDetailsInfos && reconDetailsInfos.length>0)?reconDetailsInfos.map((repy,i)=>{
                                return <li className="tr flow-auto border-bottom"> {/*  show-history */}
                                        <div className="server-data clearfix border-bottom">
                                            <b className="ul-tab-span relative edeat" data-param="" style={{"width":"10%"}}>
                                                <i className="absolute block purple-icon"></i>
                                                <span className="ed-cont">2016-10-31</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">全选</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"20%"}} data-param="">
                                                <span className="ed-cont">34324324324</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">3</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">43</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">32</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">43</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">123</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">124</span>
                                            </b>
                                            <b className="ul-tab-span edeat" style={{"width":"6%"}} data-param="">
                                                <span className="ed-cont">43</span>
                                            </b>
                                            <b className="ul-tab-span" style={{"width":"20%"}}>
                                                <button className="block btn-white mr10 left mt3 dealBtn" onClick={this.dealHandle.bind(this)}>处理</button>
                                                <button className="block btn-white mr10 left mt3 saveBtn hidden" onClick={this.saveHandle.bind(this)}>保存</button>
                                                <button className="block btn-white left mt3" onClick={this.showHistory.bind(this)}>历史</button>
                                            </b>
                                            <div className="clear"></div>
                                            <div className="topic-div pb10 hidden">
                                                <b className="ul-tab-span" style={{"width":"4%"}}>备注：</b>
                                                <textarea name="" id="" className="topic left"></textarea>
                                            </div>
                                        </div>
                                        <div className="history-data ml20 clearfix hidden">
                                            <div className="purple-font">
                                                <b className="ul-tab-span" style={{"width":"10%"}}>2016-10-31</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>全选</b>
                                                <b className="ul-tab-span" style={{"width":"20%"}}>123116</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>43</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>23</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>123</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>23</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>434</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>34</b>
                                                <b className="ul-tab-span" style={{"width":"6%"}}>34</b>
                                                <b className="ul-tab-span" style={{"width":"20%"}}></b>
                                            </div>
                                            <div className="clear"></div>
                                            <div className="detail border-top">
                                                <b className="ul-tab-span pr10" style={{"width":"10%"}}>2017-10-21 13:12</b>
                                                <b className="ul-tab-span pr10" style={{"width":"10%"}}>steam</b>
                                                <b className="ul-tab-span pr10 elli" style={{"width":"75%"}}>备注：感谢您选择小雨点，由于您上传的身份证不清晰，导致姓名错误，现已修改为您正确姓名，您贷款合同已撤销。如果仍有贷款感谢您选择小雨点，由于您上传的身份证不清晰，导致姓名错误，现已修改为您正确姓名，您贷款合同已撤销。如果仍有贷款感谢您选择小雨点，由于您上传的身份证不清晰，导致姓名错误，现已修改为您正确姓名，您贷款合同已撤销。如果仍有贷款</b>
                                            </div>
                                        </div>
                                    </li>
                            }):<li className="gray-tip-font">暂未查到相关数据...</li>
                        }
                    </ul>
                    <div className="dA-tfoot clearfix">
                        <div className="left">
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                current={this.state.current}
                                total={this.state.totalSize}
                                onChange={this.pageChange.bind(this)}
                                pageSizeOptions={['10','25','50','100']}
                            />
                        </div>
                        {
                            (reconDetailsInfos && reconDetailsInfos.length>0)?<a href={"/Qport/exportReconDetailsRecordsExcl?1=1&totalCount="+totalCount+(this.getCondition()?commonJs.toHrefParams(this.getCondition()):"")} className="btn-white block right mr20">下载</a>:""
                        }
                    </div>
                </div>
            </div>
        )
    }
};

export default DataAbnormal;  //ES6语法，导出模块