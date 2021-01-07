// 拨打记录
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common'
var commonJs=new CommonJs;
import { Pagination,DatePicker } from 'antd';
const { RangePicker } = DatePicker;

class CallRecord extends React.Component {
    constructor(props){
        super(props);
        this.state={
            accountId:this.props._params,
            startValue: null,
            endValue: null,
            endOpen: false,
            barsNum:10,  //每页显示多少条
            current:1,  //当前页码
        }
    }
    UNSAFE_componentWillMount(){
        this.init();
    }
    componentDidMount () {
        var h = document.documentElement.clientHeight;
        if(this.props._location!="reminder" && this.props._location!="collection" && this.props._location!="outsource"){
            $(".auto-box").css("height", h - 105);
        }
        //隐藏 收起、展开 全部图标
        $(".taggle-cion-up").removeClass("hidden");
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }
    // 初始化数据
    init(){
        let that=this;
        $.ajax({
            type:"post",
            url:"/node/menuList",
            async:true,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                that.setState({
                    debtorRelationshipList:_getData.debtorRelationshipList,  //于债务人的关系
                    telSourcesList:_getData.telSourcesList,  //号码来源
                    telStatusList:_getData.telStatusList  //号码状态
                })
            }
        })
    }
    //搜索
    searchHandle(){
        let that=this;
        let _pageSize=this.state.barsNum;
        let _pageNum=this.state.current;
        let _accountId=this.state.accountId;
        let _debtorRelationship=$(".cR-condition .debtorRelationship option:selected").attr("data-optioncode");
        let _telNo=$(".cR-condition .telNo").val().replace(/\s/g,"");
        let _telSources=$(".cR-condition .telSources option:selected").attr("data-optioncode");
        let _telStatus=$(".cR-condition .telStatus option:selected").attr("data-optioncode");
        let _createdTimeBegin=commonJs.dateToString(this.state.startValue);
        let _createdTimeEnd=commonJs.dateToString(this.state.endValue);
        let _data={};
        if(_pageSize)_data.pageSize=_pageSize;
        if(_pageNum)_data.pageNum=_pageNum;
        if(_accountId)_data.accountId=_accountId;
        if(_debtorRelationship)_data.debtorRelationship=_debtorRelationship;
        if(_telNo)_data.telNo=_telNo;
        if(_telSources)_data.telSources=_telSources;
        if(_telStatus)_data.telStatus=_telStatus;
        if(_createdTimeBegin && _createdTimeBegin!="1970-1-1 8:0:0")_data.createdTimeBegin=_createdTimeBegin;
        if(_createdTimeEnd && _createdTimeEnd!="1970-1-1 8:0:0")_data.createdTimeEnd=_createdTimeEnd;

        $.ajax({
            type:"post",
            url:"/node/getManualCallRecord",
            async:true,
            dataType: "JSON",
            data:_data,
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                that.setState({
                    manualCallRelationsInfoDTOS:_getData.manualCallRelationsInfoDTOS,
                    totalSize:_getData.totalSize,  // 总条数
                    totalPage:_getData.totalPage, //总页数
                    current:1
                })
            }
        })
    }
    //通讯时间
    onChange(field, value){
        this.setState({
            [field]: value,
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
        this.onChange('startValue', value);
    }

    onEndChange(value){
        this.onChange('endValue', value);
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
            current:1,
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
    
    render() {
        const { startValue, endValue, endOpen } = this.state;
        const { debtorRelationshipList, telSourcesList, telStatusList,manualCallRelationsInfoDTOS} = this.state;
        return (
            <div className="auto-box pr5">
                <div className="bar mt10 pt10 pb15 cR-condition">
                    <dl className="cr-condition">
                        <dt>与债务人关系</dt>
                        <dd>
                            <select name="" id="debtorRelationship" className="select-gray debtorRelationship" style={{width:"100%"}}>
                                <option value="">请选择</option>
                                {
                                    (debtorRelationshipList && debtorRelationshipList.length>0) ? debtorRelationshipList.map((repy,i)=>{
                                        return <option data-optionCode={repy.optionCode} data-fromGroup={repy.fromGroup} key={i}>{repy.optionName}</option>
                                    }):""
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="cr-condition">
                        <dt>通话号码</dt>
                        <dd>
                            <input type="text" className="input telNo" id='telNo' placeholder="请输入"/>
                        </dd>
                    </dl>
                    <dl className="cr-condition">
                        <dt>号码来源</dt>
                        <dd>
                            <select name="" id="telSources" className="select-gray telSources" style={{width:"100%"}}>
                                <option value="">请选择</option>
                                {
                                    (telSourcesList && telSourcesList.length>0) ? telSourcesList.map((repy,i)=>{
                                        return <option data-optionCode={repy.optionCode} data-fromGroup={repy.fromGroup} key={i}>{repy.optionName}</option>
                                    }):""
                                }
                            </select>
                        </dd>
                    </dl>
                    <dl className="cr-condition">
                        <dt>号码状态</dt>
                        <dd>
                            <select name="" id="telStatus" className="select-gray telStatus" style={{width:"100%"}}>
                                <option value="">请选择</option>
                                {
                                    (telStatusList && telStatusList.length>0) ? telStatusList.map((repy,i)=>{
                                        return <option data-optionCode={repy.optionCode} data-fromGroup={repy.fromGroup} key={i}>{repy.optionName}</option>
                                    }):""
                                }
                            </select>
                        </dd>
                    </dl>
                    <div className="clearfix"></div>
                    <dl className="cr-condition-time">
                        <dt>通讯时间</dt>
                        <dd>
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
                        </dd>
                    </dl>
                    <dl className="cr-condition">
                        <dt style={{"visibility":"hidden"}}>搜索</dt>
                        <dd>
                            <button className="btn-blue left block" id='callRcordSearchBtn' onClick={this.searchHandle.bind(this)}>搜索</button>
                        </dd>
                    </dl>
                </div>
                <div className="bar mt10">
                    <table className="pt-table">
                        <tbody>
                        <tr>
                            <th>与债务人关系</th>
                            <th>通话号码</th>
                            <th>号码来源</th>
                            <th>号码状态</th>
                            <th></th>
                        </tr>
                        {
                            (manualCallRelationsInfoDTOS && manualCallRelationsInfoDTOS.length>0) ? manualCallRelationsInfoDTOS.map((repy,i)=>{
                                return <tr key={i}>
                                        <td>{commonJs.is_obj_exist(repy.debtorRelationship)}</td>
                                        <td>{commonJs.is_obj_exist(repy.telNo)}</td>
                                        <td>{commonJs.is_obj_exist(repy.telSources)}</td>
                                        <td>{commonJs.is_obj_exist(repy.telStatus)}</td>
                                        <td>
                                            <div className="ext-source-tip word-break mt5 mb5">
                                                {commonJs.is_obj_exist(repy.userName)}<br />
                                                {commonJs.is_obj_exist(repy.createdTime)}
                                            </div>
                                        </td>
                                    </tr>
                            }):<tr><td colSpan="5" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        <tr>
                            <td colSpan="5">
                            <div className="paageNo left">
                                <Pagination
                                    showQuickJumper
                                    showSizeChanger
                                    onShowSizeChange={this.onShowSizeChange.bind(this)}
                                    defaultPageSize={this.state.barsNum}
                                    defaultCurrent={1}
                                    total={this.state.totalSize?this.state.totalSize : 0}
                                    onChange={this.pageChange.bind(this)}
                                    pageSizeOptions={['10','25','50','100']}
                                />
                            </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}
;

export default CallRecord;