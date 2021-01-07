// 短信记录
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import { Pagination,DatePicker,Button } from 'antd'; 
import { Table, Column, HeaderCell, Cell ,TablePagination} from 'rsuite-table';   //table自定义调整列宽；

class NotesRecord extends React.Component{
    constructor(props){
        super(props);
        this.state={
            startValue: null,
            endValue: null,
            endOpen: false,
            recordsInfoDTOS:[],
            currentPage:1,
            displayLength:50
        }
    }
    //时间
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
    //切换显示条目数的回调函数 
    handleChangeLength(current, pageSize) {
        this.setState({
            currentPage:1,
            displayLength:pageSize
        },()=>{
            this.searchHandle();
        })
    }
    //切换页码的回调函数
    handleChangePage(currentPage) {
        this.setState({
            currentPage:currentPage,
        },()=>{
            this.searchHandle();
        })
    }
    //搜索
    searchHandle(){
        let parems={};
        this.setState({
            currentPage:1
        })
        let _phoneNo=$(".top .phoneNo").val();
        if(!_phoneNo){
            alert("请输入手机号码！");
            return;
        }
        if(_phoneNo&&!(/^1\d{10}$/.test(_phoneNo))){
            alert("请输入正确的手机号码！");
            return;
        }
        if(_phoneNo)parems.phoneNumber=_phoneNo.replace(/\s/g,"");
        let startValue=commonJs.dateToString(this.state.startValue);
        if(startValue&&startValue!="1970-1-1 8:0:0")parems.startDate=startValue;
        let endValue=commonJs.dateToString(this.state.endValue);
        if(endValue&&endValue!="1970-1-1 8:0:0")parems.endDate=endValue;
        parems.pageNum=this.state.currentPage;
        parems.pageSize=this.state.displayLength;
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/sms/smsRecordsNew",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parems)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        recordsInfoDTOS:[],
                        totalNum:0
                    })
                    return;
                } 
                let _getData=res.data;
                let recordsInfoDTOS=_getData.dataList?_getData.dataList:[];
                that.setState({
                    totalNum:_getData.totalSize,
                    currentPage:_getData.pageNum,
                    recordsInfoDTOS:recordsInfoDTOS
                })
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    render() {
        const { startValue, endValue, endOpen,recordsInfoDTOS } = this.state;
        return (
            <div className="content clearfix" id="content">
                <div className="bar top clearfix" data-isresetdiv="yes" data-resetstate="startValue,endValue">
                    <input type="number" name="" placeholder="请输入手机号码" className="input left mr10 mt10 phoneNo" id='phoneNo' />

                    <dl className="left outsouceTime mt10 mr10">
                        <dt>时间：</dt>
                        <dd id='outsouceTime'>
                            <DatePicker
                                showTime
                                disabledDate={this.disabledStartDate.bind(this)}
                                format="YYYY-MM-DD HH:mm:ss"
                                value={startValue}
                                placeholder="Start"
                                onChange={this.onStartChange.bind(this)}
                                onOpenChange={this.handleStartOpenChange.bind(this)}
                            />
                            <span>&nbsp;-&nbsp;</span>
                            <DatePicker
                                showTime
                                disabledDate={this.disabledEndDate.bind(this)}
                                format="YYYY-MM-DD HH:mm:ss"
                                value={endValue}
                                placeholder="End"
                                onChange={this.onEndChange.bind(this)}
                                open={endOpen}
                                onOpenChange={this.handleEndOpenChange.bind(this)}
                            />
                        </dd>
                    </dl>
                    <div id="searchBtn" className='left mr10 mt10'>
                        <Button type="primary" onClick={this.searchHandle.bind(this)}>搜索</Button>
                    </div>
                    <div id="reset" className='left mt10'>
                        <Button onClick={commonJs.resetCondition.bind(this,this)}>重置</Button>
                    </div>
                </div>
                <div className="cdt-result bar mt20 relative">
                    <table className="pt-table bar layout-fixed">
                        <tbody>
                            <tr className="th-bg">
                                <th width="10%">电话号码</th>
                                <th width="10%">短信类型</th>
                                <th width="10%">发送状态</th>
                                <th width="10%">发送渠道</th>
                                <th width="20%">发送时间</th>
                                <th width="10%">所属系统</th>
                                <th width="30%">发送内容</th>
                            </tr>
                            {
                                recordsInfoDTOS.length>0?this.state.recordsInfoDTOS.map((repy,i)=>{
                                    return <tr key={i}>
                                            <td title={commonJs.is_obj_exist(repy.mobileNumber)}>{commonJs.is_obj_exist(repy.mobileNumber)}</td>
                                            <td title={commonJs.is_obj_exist(repy.description)}>{commonJs.is_obj_exist(repy.description)}</td>
                                            <td title={commonJs.is_obj_exist(repy.status)}>{commonJs.is_obj_exist(repy.status)}</td>
                                            <td title={commonJs.is_obj_exist(repy.vendor)}>{commonJs.is_obj_exist(repy.vendor)}</td>
                                            <td title={commonJs.is_obj_exist(repy.channelTime)}>{commonJs.is_obj_exist(repy.channelTime)}</td>
                                            <td title={commonJs.is_obj_exist(repy.sourceBizSystem)}>{commonJs.is_obj_exist(repy.sourceBizSystem)}</td>
                                            <td title={commonJs.is_obj_exist(repy.content)}>{commonJs.is_obj_exist(repy.content)}</td>
                                        </tr>
                                }):<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                        </tbody>
                    </table>
                    
                    {
                        (recordsInfoDTOS && recordsInfoDTOS.length>0) ?
                        <div className="pl20 left pt5 pb5" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.handleChangeLength.bind(this)}
                                defaultPageSize={this.state.displayLength}
                                defaultCurrent={1}
                                current={this.state.currentPage}
                                total={this.state.totalNum}
                                onChange={this.handleChangePage.bind(this)}
                                pageSizeOptions={['50','100','200','500','1000']}
                            />
                        </div>    
                        :""
                    }  
                        <span className="pl10 left mt7">共 {this.state.totalNum} 条数据</span>
                </div>
            </div>
        );
    }
};

export default NotesRecord;