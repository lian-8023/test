// 银行流水
import React from 'react';
import $ from 'jquery';
import CommonJs from '../../source/common/common'
var commonJs=new CommonJs;
import { Pagination } from 'antd';
import BankName from '../../source/common/bankName';
var bankName=new BankName;

class BankList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            accountId:this.props.prev_params,
            nationalId:this.props._nationalId,
            barsNum:10,  //列表每页显示多少条
            current:1,  //列表当前页码
        }
    }
    UNSAFE_componentWillMount(){
        this.getBankList(10,1);
    }
    componentDidMount () {
        //隐藏 收起、展开 全部图标
        $(".taggle-cion-up").removeClass("hidden");
        $(".detail-top-select,.detail-top-select-bar").addClass("hidden");
    }
    UNSAFE_componentWillReceiveProps(nextProps){
    }
    // 社保信息列表
    getBankList(_pageSize,_pageNum){
        let that=this;
        var _accountId=this.state.accountId;
        var _nationalId=this.state.nationalId;
        if(!_accountId || !_nationalId){
            return;
        }
        $.ajax({
            type:"post",
            url:"/node/BankList",
            async:true,
            dataType: "JSON", 
            data:{
                pageSize:_pageSize,
                pageNum:_pageNum,
                accountId:_accountId,
                nationalId:_nationalId
            },
            success:function(res) {
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        barsNum:10,  //每页显示多少条
                        current:1,  //当前页码
                    })
                    return;
                }
                var _getData = res.data;
                that.setState({
                    bankStatementInfoDTOS:_getData.bankStatementInfoDTOS?_getData.bankStatementInfoDTOS:[],
                    totalSize:_getData.totalSize?_getData.totalSize:0,
                    pageNum:_getData.pageNum?_getData.pageNum:0
                })
            }
        })
    }

    // 列表改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current:1,
            barsNum:pageSize
        },()=>{
            this.getBankList(pageSize,1);
        })
    }
    pageChange(page){
        this.setState({
            current: page
        },()=>{
            this.getBankList(this.state.barsNum,page);
        });
    }

    render() {
        const {bankStatementInfoDTOS,totalSize,pageNum} = this.state;
        return (
            <div className="auto-box pr5">
                <div className="bar mt5">
                        <table className="pt-table">
                            <tbody>
                            <tr>
                                <th width="15%">交易日期</th>
                                <th width="30%">交易摘要</th>
                                <th width="15%">状态</th>
                                <th width="20%">收入/支出金额</th>
                                <th width="20%">本次余额</th>
                            </tr>
                            <tr>
                            <td colSpan="5" className="no-padding-left">
                            {
                                (bankStatementInfoDTOS && bankStatementInfoDTOS.length>0) ? bankStatementInfoDTOS.map((repy,i)=>{
                                    return <table className="pt-table phone-invent layout-fixed border-bottom flow-auto">
                                                <tbody>
                                                    <tr>
                                                        <td width="15%">{commonJs.is_obj_exist(repy.transDate)}</td>
                                                        <td width="30%">{commonJs.is_obj_exist(repy.transSummary)}</td>
                                                        <td width="15%">{commonJs.is_obj_exist(repy.transState)}</td>
                                                        <td width="20%">{commonJs.is_obj_exist(repy.transAmount)}</td>
                                                        <td width="20%">{commonJs.is_obj_exist(repy.balance)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan="5">
                                                        <span className="sure">{repy.idcard?commonJs.is_obj_exist(bankName.getBankName(repy.idcard)):"-"}    {commonJs.is_obj_exist(repy.idcard)}     {commonJs.is_obj_exist(repy.targetInfo)} </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                }):"暂未查到相关数据..."
                            }
                            </td>
                            </tr>    
                            <tr>
                                <td colSpan="5">
                                <div className="paageNo left">
                                    <Pagination
                                        showQuickJumper
                                        showSizeChanger
                                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                                        defaultPageSize={this.state.barsNum}
                                        defaultCurrent={1}
                                        total={this.state.totalSize}
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

export default BankList;