// 还款列表-平台
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker } from 'antd';  //页码

import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class RepaymentListTerrace extends React.Component{
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
                            <th className="no-border">当期总金额</th>
                            <th className="no-border">还款日</th>
                            <th className="no-border">起息日</th>
                            <th className="no-border">第几期</th>
                            <th className="no-border">当期利息</th>
                            <th className="no-border">金额</th>
                            <th className="no-border">灵活服务费</th>
                            <th className="no-border">项目类型</th>
                            <th className="no-border">灵活服务费类型id</th>
                            <th className="no-border">灵活服务费类型名称</th>
                            <th className="no-border">当期本金</th>
                            <th className="no-border">服务费</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* <tr>
                            <td colSpan="16" style={{"height":"20px"}}>
                                <span className="right pr20">创建日期：{commonJs.is_obj_exist(repayInfoDTO>0?repayInfoDTO[0].updatedAt:"")}</span>
                            </td>
                        </tr> */}
                        {
                            repayInfoDTO.length>0?repayInfoDTO.map((repy,i)=>{
                                let barsNums=this.state.barsNum;  //每一页显示条数
                                let current=this.state.current;  //当前页码
                                if(i>=barsNums*(current-1) && i<=(barsNums*current-1)){
                                    return <tr key={i}>
                                            <td title={commonJs.is_obj_exist(repy.total )}>
                                                {commonJs.is_obj_exist(repy.total )}  {/*当期总金额 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.dueDate )}>
                                                {commonJs.is_obj_exist(repy.dueDate )}  {/*还款日 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.installmentInterestStartDate )}>
                                                {commonJs.is_obj_exist(repy.installmentInterestStartDate )}  {/*起息日 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.installmentNumber )}>
                                                {commonJs.is_obj_exist(repy.installmentNumber )}  {/*第几期 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interest )}>
                                                {commonJs.is_obj_exist(repy.interest )}  {/*当期利息 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interestDetailAmount )}>
                                                {commonJs.is_obj_exist(repy.interestDetailAmount )}  {/*金额 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interestDetailInterestDetail )}>
                                                {commonJs.is_obj_exist(repy.interestDetailInterestDetail )}  {/*灵活服务费 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interestDetailItemType )}>
                                                {commonJs.is_obj_exist(repy.interestDetailItemType )}  {/*项目类型 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interestDetailProductItemId )}>
                                                {commonJs.is_obj_exist(repy.interestDetailProductItemId )}  {/*灵活服务费类型id */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.interestDetailProductItemName )}>
                                                {commonJs.is_obj_exist(repy.interestDetailProductItemName )}  {/*灵活服务费类型名称 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.principal )}>
                                                {commonJs.is_obj_exist(repy.principal )}  {/*当期本金 */}
                                            </td>
                                            <td title={commonJs.is_obj_exist(repy.servicesCharge )}>
                                                {commonJs.is_obj_exist(repy.servicesCharge )}  {/*服务费 */}
                                            </td>
                                        </tr>
                                }
                            }):<tr><td colSpan="12" className="gray-tip-font">暂未查到相关数据...</td></tr>
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

export default RepaymentListTerrace;  //ES6语法，导出模块