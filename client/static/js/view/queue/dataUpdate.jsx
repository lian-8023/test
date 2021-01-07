// 数据上传
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码
import FileUpload from 'react-fileupload';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class DataUpdate extends React.Component{
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
            currentPage:1,
            current: 1,
            barsNum:pageSize
        },()=>{
            this.getList();
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        },()=>{
            this.getList();
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.getList();
        });
      }
    // 上传成功
    _handleUploadSuccess(obj) {
        let _data=obj.data?obj.data:{};
        if(_data.resultStatus){
            if(_data.resultStatus==0){
                alert(_data.resultMessage?_data.resultMessage:"成功");
                return;
            }
            if(_data.resultStatus==1){
                alert(_data.resultMessage?_data.resultMessage:"失败");
                return;
            }
        }
        if(typeof(_data.executed)!="undefined" && !_data.executed){
            alert(_data.message?_data.message:"失败");
        }
    }
    // 上传失败
    _handleUploadFailed(err) {
        let _data=err.data?err.data:{};
        if(typeof(_data.resultStatus)!="undefined" && _data.resultStatus==1){
            alert(_data.resultMessage?_data.resultMessage:"失败");
            return;
        }
        if(typeof(_data.executed)!="undefined" && !_data.executed){
            alert(_data.message?_data.message:"失败");
        }
    }
    // 渠道切换
    channelHandle(event){
        let _val=$(event.target).find("option:selected").attr("value");
        this.setState({
            channel_selected:_val
        })
    }
    //获取文件上传历史列表
    getList(fromTop){
        let that=this;
        let _param={
            pageSize:this.state.barsNum,
            pageNum:fromTop?1:this.state.current,
            channel:this.state.channel_selected
        };
        $.ajax({
            type:"post",
            url:"/node/queryUploadHistory",
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
                        uploadReconHistoryInfos:_getData.uploadReconHistoryInfos,
                        totalCount:_getData.totalCount,
                        current:1
                    })
                }else{
                    that.setState({
                        uploadReconHistoryInfos:_getData.uploadReconHistoryInfos,
                        totalCount:_getData.totalCount
                    })
                }
                
            }
        })
    }

    render() {
        const { startValue, endValue, endOpen } = this.state;
        const {uploadReconHistoryInfos,totalCount}=this.state;
        let fileOption={
            uploadOptions:{
                baseUrl: '/Qport/dataUpLoadFile',
                param: {
                    channel:this.state.channel_selected
                },
                multiple:true,      //是否允许同时选择多文件）不支持IE9- 默认为false
                fileFieldName:"ws",
                numberLimit: 5,     //多文件上传时限制用户选择的数量（用户仍可以选择，但是会在选择后进行过滤） number/func
                accept: '*',  //限制选择文件的类型（后缀）
                chooseAndUpload : true,  //是否在用户选择了文件之后立刻上传,如果为true则只需在children传入ref="chooseAndUpload"的DOM就可触发。默认false
                wrapperDisplay: 'inline-block',  //包裹chooseBtn或uploadBtn的div的display默认'inline-block'
                beforeUpload: this._checkUploadImg,  //beforeUpload(files,mill) 进行上传动作之前执行，返回true继续，false阻止文件上传
                uploading: this._handleUploading,    //在文件上传中的时候，浏览器会不断触发此函数，IE9-为虚拟的进度
                uploadSuccess: this._handleUploadSuccess.bind(this),  //上传成功后执行的回调（针对AJAX而言）
                uploadFail: this._handleUploadFailed.bind(this),  //上传失败后执行的回调（针对AJAX而言）
                uploadError: this._handleUploadFailed.bind(this)  //上传错误后执行的回调（针对AJAX而言）
            }
        };
        return (
            <div className="content" id="content">
                <div className="bar clearfix flow-auto dU-condi pl20 pb10">
                    <dl>
                        <dt>渠道：</dt>
                        <dd>
                            <select name="" id="" className="select-gray channel" onChange={this.channelHandle.bind(this)}>
                                <option value="">全部</option>
                                <option value="unionPay">广州银联</option>
                                <option value="chinaPay">上海银联</option>
                                <option value="yjfPay">易极付</option>
                                <option value="chinaActivePay">上海银联主动支付</option>
                            </select>
                        </dd>
                    </dl>
                    <div className="left mt10 mr10">
                        <FileUpload options={fileOption.uploadOptions} ref="fileUpload">
                        <a className="left btn-blue block" ref="chooseAndUpload">上传</a>
                        </FileUpload>
                    </div>
                    
                    <button className="left btn-white block mt10" onClick={this.getList.bind(this,true)}>上传历史</button>
                </div>
                <div className="bar mt20">
                    <table className="pt-table data-update-list">
                        <thead>
                            <tr className="th-bg">
                                <th>上传时间</th>
                                <th>渠道名称</th>
                                <th>文件名</th>
                                <th>上传人</th>
                                <th>上传状态</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                (uploadReconHistoryInfos && uploadReconHistoryInfos.length>0)?uploadReconHistoryInfos.map((repy,i)=>{
                                    return <tr key={i}>
                                            <td className="blue-half relative">{repy.uploadTime?commonJs.dateToString(repy.uploadTime):"-"}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.channelName)}</td>
                                            <td className="blue-half relative">{commonJs.is_obj_exist(repy.fileName)}</td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.uploadLoginName )}</td>
                                            <td className="blue-half">{commonJs.is_obj_exist(repy.uploadMessage )}</td>
                                            <td className="blue-half">
                                                <a href={uploadReconHistoryInfos?("/node/down/file?fileId="+repy.fileId+"&filename="+repy.fileName):""} className="block btn-blue">下载明细</a>
                                            </td>
                                        </tr>
                                }):<tr><td colSpan="4" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }
                            
                            <tr className="th-bg">
                                <td colSpan="5">
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
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
};

export default DataUpdate;  //ES6语法，导出模块