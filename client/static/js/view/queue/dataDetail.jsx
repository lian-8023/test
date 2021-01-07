// 数据明细
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class DataDetail extends React.Component{
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
        //checkBox
        $(".isnormal .myCheckbox").on("click",function(){
            if($(this).hasClass("myCheckbox-normal")){
                $(this).closest(".isnormal").find(".myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
                $(this).removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            }else{
                $(this).removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            }
        })
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
            currentPage:1,
            current: 1,
            barsNum:pageSize
        },()=>{
            this.searchHandle();
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.searchHandle();
        });
      }
    //获取条件
    getCondition(fromTop){
        let _sTime=commonJs.dateToString2(this.state.startValue);
        let _eTime=commonJs.dateToString2(this.state.endValue);
        let _isError="";
        if($(".isnormal .normal").hasClass("myCheckbox-visited")){
            _isError=-1;
        }
        if($(".isnormal .abnormal").hasClass("myCheckbox-visited")){
            _isError=1;
        }
        if($(".isnormal .normal").hasClass("myCheckbox-visited") && $(".isnormal .abnormal").hasClass("myCheckbox-visited")){
            _isError="";
        }
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
            isError:_isError
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
    render() {
        const { startValue, endValue, endOpen } = this.state;
        const {reconDetailsInfos,totalCount} = this.state;
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto" data-isresetdiv="yes" data-resetstate="startValue,endValue">
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
                                    <option value="1A">1A</option>
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
                                <input type="number" className="input left dD-half totalAmontMin"/>
                                <span className="left">&nbsp;-&nbsp;</span>
                                <input type="number" className="input left dD-half totalAmontMax"/>
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
                    <div className="left mt10 ml15">
                        <div className="isnormal clearfix">
                            <label className="left pr10">
                                <i className="myCheckbox myCheckbox-normal left mt5 normal"></i>
                                <b className="left">正常</b>
                            </label>
                            <label className="left">
                                <i className="myCheckbox myCheckbox-normal left mt5 abnormal"></i>
                                <b className="left">异常</b>
                            </label>
                        </div>
                        <button className="left btn-blue block mt4 mr10" onClick={this.searchHandle.bind(this,true)}>搜索</button>
                        <button className="left mt4 btn-white" onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                </div>
                <div className="bar mt20">
                    <table className="pt-table data-detail-list">
                        <thead>
                            <tr className="th-bg">
                                <th>日期</th>
                                <th>产品类别</th>
                                <th>渠道</th>
                                <th>姓名</th>
                                <th>贷款号码</th>
                                <th>收款款次</th>
                                <th>总金额</th>

                                <th>本金</th>
                                <th>利息</th>
                                <th>前期费</th>
                                <th>滞纳金</th>
                                <th>服务费</th>
                                <th>合作方罚息</th>
                                <th>违约金</th>
                                <th>展期费</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (reconDetailsInfos && reconDetailsInfos.length>0)?reconDetailsInfos.map((repy,i)=>{
                                    return <tr key={i}>
                                            {/* 日期 */}
                                            <td className={(repy.isClearanceDateError && repy.isClearanceDateError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.clearanceDate)}
                                            </td>
                                            <td>{commonJs.is_obj_exist(repy.productNo)}</td>
                                            <td>{commonJs.is_obj_exist(repy.channelName)}</td>
                                            <td>{commonJs.is_obj_exist(repy.name)}</td>
                                            <td>{commonJs.is_obj_exist(repy.loanNumber)}</td>
                                            <td>{commonJs.is_obj_exist(repy.num)}</td>
                                            {/* 总金额 */}
                                            <td className={(repy.isAmountError && repy.isAmountError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.totalAmount)}
                                            </td>
                                            {/* 本金 */}
                                            <td className={(repy.isPrincipalError && repy.isPrincipalError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.principal)}
                                            </td>
                                            {/* 利息 */}
                                            <td className={(repy.isInterestError && repy.isInterestError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.interest)}
                                            </td>
                                            {/* 前期费 */}
                                            <td className={(repy.isUpfrontFeeError && repy.isUpfrontFeeError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.upfrontFee)}
                                            </td>
                                            {/* 滞纳金 */}
                                            <td className={(repy.isLateFeeError && repy.isLateFeeError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.lateFee)}
                                            </td>
                                            {/* 服务费 */}
                                            <td className={(repy.isServeceChargeError && repy.isServeceChargeError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.serviceCharge)}
                                            </td>
                                            {/* 合作方罚息 */}
                                            <td className={(repy.isDefalultInterestError && repy.isDefalultInterestError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.defaultInterest)}
                                            </td>
                                            {/* 违约金 */}
                                            <td className={(repy.isPenaltyError && repy.isPenaltyError==1)?"red":""}>
                                                {commonJs.is_obj_exist(repy.penalty)}
                                            </td>
                                            {/* 展期费 */}
                                            <td>
                                                {commonJs.is_obj_exist(repy.extensionFee)}
                                            </td>
                                        </tr>
                                }):<tr><td colSpan="15" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            <tr className="th-bg">
                                <td colSpan="14">
                                    <div className="left">
                                        <Pagination
                                            showQuickJumper
                                            showSizeChanger
                                            onShowSizeChange={this.onShowSizeChange.bind(this)}
                                            defaultPageSize={this.state.barsNum}
                                            defaultCurrent={1}
                                            current={this.state.current}
                                            total={totalCount}
                                            onChange={this.pageChange.bind(this)}
                                            pageSizeOptions={['10','25','50','100']}
                                        />
                                    </div>
                                    {
                                        (reconDetailsInfos && reconDetailsInfos.length>0)?<a href={"/Qport/exportReconDetailsRecordsExcl?1=1&totalCount="+totalCount+(this.getCondition()?commonJs.toHrefParams(this.getCondition()):"")} className="btn-white block right mr20">下载</a>:""
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
};

export default DataDetail;  //ES6语法，导出模块