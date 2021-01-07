// 还款列表-合作方
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class RepaymentListThird extends React.Component{
    constructor(props){
        super(props);
        this.state={
            repayInfoDTO:this.props.data,
            barsNum:10,  //每页显示多少条
            current:1
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            repayInfoDTO:nextProps.data
        })
    }

    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current: 1,
            barsNum:pageSize
        } )
    }
    
    //快速跳转到某一页。
    pageChange(page){
        this.setState({
            current: page
        });
    }
    
    render() {
        const repayInfoDTO=this.state.repayInfoDTO?this.state.repayInfoDTO:[];
        return (
            <div className="bar">
                <table className="pt-table repayment-list layout-fixed">
                    <thead>
                        <tr className="th-bg">
                            <th className="no-border">还款期数</th>
                            <th className="no-border">还款总额</th>
                            <th className="no-border">还款本金</th>
                            <th className="no-border">还款利息</th>
                            <th className="no-border">其它金额</th>
                            <th className="no-border">滞纳金</th>
                            <th className="no-border">服务费</th>
                            <th className="no-border">剩余本息</th>
                            <th className="no-border">原始还款日</th>
                            <th className="no-border">实际还款日</th>
                            <th className="no-border">起息日</th>
                            <th className="no-border">违约天数</th>
                            <th className="no-border">违约减免天数</th>
                            <th className="no-border">代扣状态</th>
                            <th className="no-border">代扣次数</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="15" style={{"height":"20px"}}>
                                <span className="right pr20">创建日期：{commonJs.is_obj_exist(repayInfoDTO.length>0?repayInfoDTO[0].updatedAt:"")}</span>
                            </td>
                        </tr>
                        {
                            repayInfoDTO.length>0?repayInfoDTO.map((repy,i)=>{
                                let barsNums=this.state.barsNum;  //每一页显示条数
                                let current=this.state.current;  //当前页码
                                if(i>=barsNums*(current-1) && i<=(barsNums*current-1)){
                                    return <tr key={i}>
                                            <td title={commonJs.is_obj_exist(repy.installmentNumber)}>
                                                {commonJs.is_obj_exist(repy.installmentNumber)}  {/*还款期数 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.amount)}>
                                                {commonJs.is_obj_exist(repy.amount)}  {/*还款总额 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.principal)}>
                                                {commonJs.is_obj_exist(repy.principal)}  {/*还款本金 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interest)}>
                                                {commonJs.is_obj_exist(repy.interest)}  {/*还款利息 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.otherAmount)}>
                                                {commonJs.is_obj_exist(repy.otherAmount)}  {/*其它金额 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.lateFee)}>
                                                {commonJs.is_obj_exist(repy.lateFee)}  {/*滞纳金 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.servicesCharge)}>
                                                {commonJs.is_obj_exist(repy.servicesCharge)}  {/*服务费 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.remainingBalance)}>
                                                {commonJs.is_obj_exist(repy.remainingBalance)}  {/*剩余本息 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.originalDueDate)}>
                                                {commonJs.is_obj_exist(repy.originalDueDate)}  {/*原始还款日 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.dueDate)}>
                                                {commonJs.is_obj_exist(repy.dueDate)}  {/*实际还款日 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.installmentInterestStartDate)}>
                                                {commonJs.is_obj_exist(repy.installmentInterestStartDate)}  {/*起息日 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.overdueFineDay)}>
                                                {commonJs.is_obj_exist(repy.overdueFineDay)}  {/*违约天数 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.overdueRemitDay)}>
                                                {commonJs.is_obj_exist(repy.overdueRemitDay)}  {/*违约减免天数 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.status)}>
                                                {commonJs.is_obj_exist(repy.status)}  {/*代扣状态 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.payTimes)}>
                                                {commonJs.is_obj_exist(repy.payTimes)}  {/*代扣次数 */}
                                            </td>
                                        </tr>
                                }
                            }):<tr><td colSpan="15" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                    </tbody>
                </table>
                {
                    (repayInfoDTO && repayInfoDTO.length>0)?
                    <div className="th-bg pl20 pt5 pb5" id='pageAtion'>
                        <Pagination
                            showQuickJumper
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange.bind(this)}
                            defaultPageSize={this.state.barsNum}
                            defaultCurrent={1}
                            current={this.state.current}
                            total={repayInfoDTO?repayInfoDTO.length:0}
                            onChange={this.pageChange.bind(this)}
                            pageSizeOptions={['10','25','50','100']}
                        />
                    </div>:""
                }
            </div>
        )
    }
};

export default RepaymentListThird;  //ES6语法，导出模块