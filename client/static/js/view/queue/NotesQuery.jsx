import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd'; 
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

import SortTimeJs from '../../source/common/sortTime';
var sortTimeJs=new SortTimeJs;

class NotesQuery extends React.Component{
    constructor(props){
        super(props);
        this.state={
            allTypes:[],  //待选择类型
            selectedTpyes:[],  //已选择类型
            barsNum:50,  //每页显示多少条
            currentPage:1,  //当前页码
            startValue: null,
            endValue: null,
            endOpen: false
        }
    }
    UNSAFE_componentWillMount(){
        let _allTypes=this.init();
        this.setState({
            allTypes:_allTypes, 
            selectedTpyes:[]
        })
    }
    componentDidMount(){
        let that=this;
        let h = document.documentElement.clientHeight;
        // $(".notesQuery-tab-cont").css({"max-height":h-235,"overflow":"auto"});
        $(".content").css({"max-height":h-20,"overflow":"auto"});

        //操作待选类型
        $(".allTypes-ul").on("click","li",function(){
            let allTypes=that.state.allTypes;
            let selectedTpyes=that.state.selectedTpyes;
            let thisName=$(this).attr("data-name");
            for(let i=0;i<allTypes.length;i++){
                if(allTypes[i].name==thisName){
                    selectedTpyes.push(allTypes[i]);
                    allTypes.splice(i,1);
                }
            }
            that.setState({
                allTypes:allTypes,  
                selectedTpyes:selectedTpyes  
            })
        })
        //操作已选类型
        $(".selectedTpye-ul").on("click","li",function(){
            let allTypes=that.state.allTypes;
            let selectedTpyes=that.state.selectedTpyes;
            let thisName=$(this).attr("data-name");
            for(let i=0;i<selectedTpyes.length;i++){
                if(selectedTpyes[i].name==thisName){
                    allTypes.push(selectedTpyes[i]);
                    selectedTpyes.splice(i,1);
                }
            }
            that.setState({
                allTypes:allTypes,  
                selectedTpyes:selectedTpyes  
            })
        })
    }
    
    // 初始化数据
    init(){
        let _that=this;
        let allTypes=[];
        $.ajax({
            type:"get",
            url:"/node/smsType",
            async:false,
            dataType: "JSON",
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                var _getData = res.data;
                var _allTypes=[];
                for(var key in _getData.maps){  
                    _allTypes.push({"name":key,"displayName":_getData.maps[key]});  
                } 
                allTypes=_allTypes;
            }
        })
        return allTypes;
    }
    //全选
    selectAllTypes(){
        let _allTypes=this.init();
        this.setState({
            allTypes:[], 
            selectedTpyes:_allTypes
        })
    }
    //全不选
    notAllTypes(){
        let _allTypes=this.init();
        this.setState({
            allTypes:_allTypes, 
            selectedTpyes:[]
        })
    }
    //获取页码
    changePage(pageNumber){
        console.log('Page: ', pageNumber);
    }
    disabledStartDate(startValue){
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
        return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }

    disabledEndDate(endValue){
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
        return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }

    onChange(field, value){
        this.setState({
        [field]: value,
        });
    }

    onStartChange(value){
        this.onChange('startValue', value);
    }

    onEndChange(value){
        this.onChange('endValue', value);
    }

    handleStartOpenChange(open){
        if (!open) {
        this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange(open){
        this.setState({ endOpen: open });
    }
    //条件
    getConditions(){
        let _data={};
        let _smsTypes=[];
        $(".selectedTpye-ul li").each(function(){
            let thisName=$(this).attr("data-name");
            _smsTypes.push(thisName);
        })
        if(_smsTypes.length>0) _data.smsTypes=_smsTypes;  //短信类型
        let _phoneNumber=$(".phoneNumber").val().replace(/\s/g,"");
        if(_phoneNumber) _data.phoneNumber=_phoneNumber;  //手机号码
        let _content=$(".cdt-content").val().replace(/\s/g,"");
        if(_content) _data.content=_content;  //内容
        if(this.state.startValue) _data.startDate=commonJs.dateToString(this.state.startValue);  //开始时间
        if(this.state.endValue) _data.endDate=commonJs.dateToString(this.state.endValue);  //结束时间
        return _data;
    }
    //搜索  fromBtn存在，说明是点击搜索按钮
    searchMsg(fromBtn){
        let that=this;
        let _data=this.getConditions();
        let keys=[];
        for(var key in _data){
            keys.push(key);
        }
        if(keys.length<1){
            alert("至少输入一个搜索条件！");
            return;
        }
        if(fromBtn){
            _data.currentPage=1;
        }else{
            _data.currentPage=this.state.currentPage;
        }
        _data.rows=this.state.barsNum;
        $.ajax({
            type:"post",
            url:"/node/smsRecords?time="+new Date().getTime(),
            async:false,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(_data)},
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        notesData:{},
                        recordsInfoDTOS:[]
                    })
                    return;
                }
                var _getData = res.data;
                if(fromBtn){
                    that.setState({
                        currentPage:1,
                        notesData:_getData,
                        recordsInfoDTOS:_getData.recordsInfoDTOS
                    })
                    return;
                }
                that.setState({
                    notesData:_getData,
                    recordsInfoDTOS:_getData.recordsInfoDTOS
                })
            }
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            currentPage:pageNumber
        },()=>{
            this.searchMsg();
        })
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            currentPage:current,
            barsNum:pageSize
        },()=>{
            this.searchMsg();
        })
    }
    // 清除按钮
    clearCondition(){
        let _allTypes=this.init();
        this.setState({
            allTypes:_allTypes, 
            selectedTpyes:[],
            startValue: null,
            endValue: null
        })
        $(".note-search-cont .phoneNumber,.note-search-cont .cdt-content").val("");
    }
    // 导出Excel
    excelLoad(){
        let _totalPages=this.state.notesData.totalPages; //总页数
        let _totalCount=this.state.notesData.totalCount; //总条数
        let _currentPage=this.state.currentPage;
        let _rows=this.state.barsNum;
        let _pageStart=$(".pageStart").val();
        var exg = /^\+?[1-9]*$/;　　//正整数
        if(_pageStart!="" && (!exg.test(Number(_pageStart)))){
            alert("起始页必须是大于0的整数！");
            return;
        }
        let _pageEnd=$(".pageEnd").val();
        if(_pageEnd!="" && (Number(_pageEnd)>_totalPages || !exg.test(Number(_pageStart)))){
            alert("结束页必须是小于总页数的整数！");
            return;
        }
        window.open("/Qport/exportSmsRecordsExcl?rows="+_rows+'&pageSize='+(this.state.barsNum)+'&pageNum='+(this.state.currentPage)+(_pageStart?"&pageStart="+Number(_pageStart):"")+(_pageEnd?"&pageEnd="+Number(_pageEnd):"")+"&totalPage="+_totalPages+"&totalSize="+_totalCount+commonJs.toHrefParams(this.getConditions()));
    }
    render() {
        const { startValue, endValue, endOpen } = this.state;
        return (
            <div className="content" id="content">
                <div className="noteQuery-top clearfix">
                    <div className="selectType left">
                        <h2>待选类型</h2>
                        <button className="btn-white block right unSelectAll" onClick={this.notAllTypes.bind(this)}>全不选</button>
                        <button className="btn-white block right mr10 selectAll" id='selectAll' onClick={this.selectAllTypes.bind(this)}>全选</button>
                        <div className="clear"></div>
                        <ul className="notesType-cont allTypes-ul">
                        {
                            (this.state.allTypes && this.state.allTypes.length>0) ? this.state.allTypes.map((repy,i)=>{
                                return <li key={i} data-name={commonJs.is_obj_exist(repy.name)}><span className="lef">{commonJs.is_obj_exist(repy.displayName)}</span><i className="tick tick-off"></i></li>
                            }):""
                        }
                        </ul>
                    </div>
                    <div className="selectType left">
                        <h2>已选类型</h2>
                        <div className="clear"></div>
                        <ul className="notesType-cont selectedTpye-ul">
                        {
                            (this.state.selectedTpyes && this.state.selectedTpyes.length>0) ? this.state.selectedTpyes.map((repy,i)=>{
                                return <li key={i} data-name={commonJs.is_obj_exist(repy.name)}><span className="lef">{commonJs.is_obj_exist(repy.displayName)}</span><i className="tick tick-X"></i></li>
                            }):""
                        }
                        </ul>
                    </div>
                    <div className="note-search-cont right">
                        <div className="cont-li mr10">
                            <span className="let-t">手机:</span> <br/>
                            <input type="text" className="input phoneNumber" placeholder="请输入"/>
                        </div>
                        <div className="cont-li mr10">
                            <span className="let-t">内容:</span> <br/>
                            <input type="text" className="input cdt-content" placeholder="请输入"/>
                        </div>
                        <div className="clear"></div>
                        <div className="cont-li mr10">
                            <span className="let-t">开始:</span> <br/>
                            <DatePicker
                                disabledDate={this.disabledStartDate.bind(this)}
                                showTime
                                format="YYYY-MM-DD HH:mm:ss"
                                value={startValue}
                                placeholder="Start"
                                onChange={this.onStartChange.bind(this)}
                                onOpenChange={this.handleStartOpenChange.bind(this)}
                            />

                        </div>
                        <div className="cont-li mr10">
                            <span className="let-t">结束:</span> <br/>
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
                        </div>
                        <div className="clear"></div>
                        <button className="btn-blue left mr10 mt50" onClick={this.searchMsg.bind(this,"fromBtn")}>查询</button>
                        <button className="btn-white left mt50" onClick={this.clearCondition.bind(this)}>清除</button>
                    </div>
                </div>
                <table className="radius-tab pt-table mt15 notesQuery-tab">
                   <tbody>
                       <tr>
                           <th width="15%">电话号码</th>
                           <th width="10%">短信类型</th>
                           <th width="10%">状态</th>
                           <th width="10%">创建人</th>
                           <th width="15%" className="pointer" data-sort="invert" onClick={sortTimeJs.sortTime.bind(this,this.state.recordsInfoDTOS,"updatedAtStr","recordsInfoDTOS")}>
                                <span className="left mr5">创建时间</span>
                                <i className="sort-icon sort-normal mt13"></i>
                           </th>
                           <th className="notes" width="40%">短信内容</th>
                       </tr>
                       <tr>
                           <td colSpan="7" className="task-cont">
                               <div className="notesQuery-tab-cont">
                                   <table cellPadding={0} cellSpacing={0} frameBorder={0} width="100%">
                                       <tbody>
                                       {
                                           (this.state.recordsInfoDTOS && this.state.recordsInfoDTOS.length>0)?this.state.recordsInfoDTOS.map((repy,i)=>{
                                                return <tr key={i}>
                                                            <td width="15%">{commonJs.is_obj_exist(repy.primayPhone)}</td>
                                                            <td width="10%">{commonJs.is_obj_exist(repy.smsType)}</td>
                                                            <td width="10%">{commonJs.is_obj_exist(repy.smsStatus)}</td>
                                                            <td width="10%">{commonJs.is_obj_exist(repy.createdBy)}</td>
                                                            <td width="15%">{commonJs.is_obj_exist(repy.updatedAtStr)}</td>
                                                            <td width="40%" className="notes">{commonJs.is_obj_exist(repy.smsContent)}</td>
                                                        </tr>
                                           }):<tr><td colSpan="7" className="gray-tip-font">暂未查到相关数据...</td></tr>
                                       }
                                       </tbody>
                                   </table>
                               </div>
                           </td>
                       </tr>
                   </tbody>
                </table>
                <div className="bottom-page-num">
                    <div className="pageAtion">
                        <div className="paageNo left mr25 NotesQueryPageNo">
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.barsNum}
                                defaultCurrent={1}
                                total={(this.state.notesData && this.state.notesData.totalCount)?this.state.notesData.totalCount : 0}
                                onChange={this.gotoPageNum.bind(this)}
                                pageSizeOptions={['10','25','50','100']}
                            />
                        </div>
                        <div className="allPageNum left">
                            <span className="tit-font">共</span> 
                            <b className="content-font">{(this.state.notesData && this.state.notesData.totalPages)?this.state.notesData.totalPages : 0}</b> 
                            <span className="tit-font">页</span>
                        </div>
                        {(this.state.recordsInfoDTOS && this.state.recordsInfoDTOS.length>0) ? 
                            <div>
                                <a 
                                    onClick={this.excelLoad.bind(this)}
                                    className="btn-blue block right mr20 right">导出Excel
                                </a> 
                                <input type="number" className="input right pageEnd mr5" placeholder="结束页"/>
                                <input type="number" className="input right pageStart mr5" placeholder="起始页"/>
                            </div>
                            : ""}
                    </div>
                </div>
            </div>
        );
    }
};

export default NotesQuery;