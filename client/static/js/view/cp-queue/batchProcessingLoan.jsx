// 批量放款处理  cp-portal
import React,{PureComponent} from 'react';
import '../../../js/source/dataTables/dataTables.jqueryui.min.css';
import $ from 'jquery';
import '../../source/dataTables/jquery.dataTables.min';
import { Pagination,DatePicker } from 'antd';  //页码
import CommonJs from '../../source/common/common';
import { Select } from 'antd';
const Option = Select.Option;
var commonJs=new CommonJs;
import {observer,inject} from "mobx-react";
import {configure} from "mobx";
configure({enforceActions:true})

@inject('allStore') @observer
class TaskBundleCP extends React.Component{
    constructor(props){
        super(props);
        this.state={
            outsourceTimeS: null,
            outsourceTimeE: null,
            outsourceTimeO: false
        }
    }
    componentDidMount(){
        
    }
  //时间
  onChange(field, value){
    this.setState({
        [field]: value,
    });
    }
    outsourceTimeSdis(outsourceTimeS){
        const outsourceTimeE = this.state.outsourceTimeE;
        if (!outsourceTimeS || !outsourceTimeE) {
            return false;
        }
        return outsourceTimeS.valueOf() > outsourceTimeE.valueOf()-1;
    }
    outsourceTimeEdis(outsourceTimeE){
        const outsourceTimeS = this.state.outsourceTimeS;
        if (!outsourceTimeE || !outsourceTimeS) {
            return false;
        }
        return outsourceTimeE.valueOf() <= outsourceTimeS.valueOf()-1;
    }
    outsourceTimeSchange(value){
        this.onChange('outsourceTimeS', value);
    }
    outsourceTimeEchange(value){
        this.onChange('outsourceTimeE', value);
    }
    outsourceTimeSOC(open){
        if (!open) {
            this.setState({ outsourceTimeO: true });
        }
    }
    outsourceTimeEOC(open){
        this.setState({ outsourceTimeO: open });
    }
    render() {
        const { outsourceTimeS, outsourceTimeE, outsourceTimeO } = this.state;
        return (
            <div className="content" id="content">
                <dl className="left outsouceTime mt10">
                    <dt>委外时间：</dt>
                    <dd id='outsouceTime'>
                        <DatePicker
                            disabledDate={this.outsourceTimeSdis.bind(this)}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={outsourceTimeS}
                            placeholder="Start"
                            onChange={this.outsourceTimeSchange.bind(this)}
                            onOpenChange={this.outsourceTimeSOC.bind(this)}
                        />
                        <span> - </span>
                        <DatePicker
                            disabledDate={this.outsourceTimeEdis.bind(this)}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={outsourceTimeE}
                            placeholder="End"
                            onChange={this.outsourceTimeEchange.bind(this)}
                            open={outsourceTimeO}
                            onOpenChange={this.outsourceTimeEOC.bind(this)}
                        />
                    </dd>
                </dl>
                <table className="table table mt10 bar" id="taskTable">
                   <thead>
                       <tr>
                           <th width="10%" title="按任务类型排序">任务类型</th>
                           <th width="10%" title="按customerId/storeId 排序">customerId/storeId</th>
                           <th width="30%" title="按loan_number/storeName排序">loan_number/storeName</th>
                           <th width="10%" title="按绑定人排序">绑定人</th>
                           <th width="20%" title="按绑定时间排序">绑定时间</th>
                           <th width="5%"><i className="myCheckbox myCheckbox-normal" id='taskSelectAll' onClick={this.taskSelectAll.bind(this)}></i></th>
                           <th width="15%"><a className="btn-white inline-block" id='unbindById' onClick={this.unbindById.bind(this)}>解除绑定</a></th>
                       </tr>
                    </thead> 
                    <tbody> 

                   </tbody>
                </table>
            </div>
        );
    }
};

export default TaskBundleCP;