// 数据核对
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class DataCheck extends React.Component{
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
    
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
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
    // 获取条件
    getCondition(fromTop){
        let _sTime=commonJs.dateToString2(this.state.startValue);
        let _eTime=commonJs.dateToString2(this.state.endValue);
        let _param={
            pageSize:this.state.barsNum,
            pageNum:fromTop?1:this.state.current,
            startDate:(_sTime!="1970-1-1")?_sTime:"",
            endDate:(_eTime!="1970-1-1")?_eTime:"",
            channel:$(".channel option:selected").attr("value")
        };
        return _param;
    }
    //搜索按钮
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
            url:"/node/queryRecon",
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
                        reconInfos:_getData.reconInfos,
                        totalCount:_getData.totalCount,
                        current:1
                    })
                }else{
                    that.setState({
                        reconInfos:_getData.reconInfos,
                        totalCount:_getData.totalCount
                    })
                }
                
            }
        })
    }
    render() {
        const { startValue, endValue, endOpen } = this.state;
        const { reconInfos,totalCount}=this.state;
        return (
            <div className="content" id="content">
                <div className="bar" data-isresetdiv="yes" data-resetstate="startValue,endValue">
                    <div className="left data-condi pb10">
                        <dl>
                            <dt>核对日期：</dt>
                            <dd>
                                <DatePicker
                                    disabledDate={this.disabledStartDate.bind(this)}
                                    format="YYYY-MM-DD"
                                    value={startValue}
                                    placeholder="Start"
                                    onChange={this.onStartChange.bind(this)}
                                    onOpenChange={this.handleStartOpenChange.bind(this)}
                                />
                                <span> - </span>
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
                        <dl>
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
                    <div className="left mt10 ml5">
                        <button className="left btn-blue block mr10" onClick={this.searchHandle.bind(this,true)}>搜索</button>
                        <button className="left btn-white" onClick={commonJs.resetCondition.bind(this,this)}>重置</button>
                    </div>
                </div>
                <div className="bar mt20">
                    <table className="pt-table data-check-list">
                        <thead>
                            <tr className="th-bg">
                                <th>系统数据</th>
                                <th>日期</th>
                                <th>渠道</th>
                                <th>收款笔数</th>
                                <th>总金额</th>
                                <th>上传数据</th>
                                <th>日期</th>
                                <th>渠道</th>
                                <th>收款笔数</th>
                                <th>总金额</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (reconInfos && reconInfos.length>0)?reconInfos.map((repy,i)=>{
                                    return <tr key={i} className={(repy.status && repy.status!=-1)?"red-bg":""}>
                                            <td className="blue-half relative">
                                                <i className="abnormal"></i>
                                                {commonJs.is_obj_exist(repy.systemData)}
                                            </td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.systemDate)}</td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.systemChannelName)}</td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.systemTotalNum)}</td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.systemTotalAmount)}</td>
                                            <td className="purple-half">{commonJs.is_obj_exist(repy.uploadData)}</td>
                                            <td className="purple-half">{commonJs.is_obj_exist(repy.uploadDate)}</td>
                                            <td className="purple-half">{commonJs.is_obj_exist(repy.uploadChannelName)}</td>
                                            <td className="purple-half">{commonJs.is_obj_exist(repy.uploadTotalNum)}</td>
                                            <td className="purple-half">{commonJs.is_obj_exist(repy.uploadTotalAmount)}</td>  
                                        </tr>
                                }):<tr><td colSpan="10" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            <tr className="th-bg">
                                <td colSpan="10">
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
                                        (reconInfos && reconInfos.length>0)?<a href={"/Qport/exportReconRecordsExcl?1=1&totalCount="+totalCount+(this.getCondition()?commonJs.toHrefParams(this.getCondition()):"")} className="btn-white block right mr20">下载</a>:""
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

export default DataCheck;  //ES6语法，导出模块