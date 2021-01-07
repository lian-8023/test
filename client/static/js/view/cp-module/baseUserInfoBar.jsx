//用户信息条展示-蓝色条
import React from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class BaseUserInfoBar extends React.Component {
    constructor(props){
        super(props);
        this.state={
            queue:this.props.queue,
            customerId:this.props._customerId,
            orderNo:this.props._orderNo,
            loanNo:this.props.loanNo,
            stuCheck:this.props._stuCheck,
            lpCheckFlag:this.props._lpCheckFlag,
            grade:this.props._grade,
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            queue:nextProps.queue,
            customerId:nextProps._customerId,
            orderNo:nextProps._orderNo,
            loanNo:nextProps._loanNo,
            stuCheck:nextProps._stuCheck,
            lpCheckFlag:nextProps._lpCheckFlag,
            grade:nextProps._grade,
        })
    }
    render() {
        return (
            <div className="blue-bar relative">
                <i className="triangle_left absolute"></i>
                <div className="base-msg clearfix">
                    <dl>
                        <dt>customerId</dt>
                        <dd title={commonJs.is_obj_exist(this.state.customerId)}>{commonJs.is_obj_exist(this.state.customerId)}</dd>
                    </dl>
                    <dl>
                        <dt>order_number</dt>
                        <dd title={commonJs.is_obj_exist(this.state.orderNo)}>{commonJs.is_obj_exist(this.state.orderNo)}</dd>
                    </dl>
                    <dl>
                        <dt>loan_number</dt>
                        <dd title={commonJs.is_obj_exist(this.state.loanNo)}>{commonJs.is_obj_exist(this.state.loanNo)}</dd>
                    </dl>
                    {
                        this.props.noStuCheck?"":
                        <dl>
                            <dt>年龄是否受限制</dt>
                            <dd title={commonJs.is_obj_exist(this.state.stuCheck)}>{commonJs.is_obj_exist(this.state.stuCheck)}</dd>
                        </dl>
                    }
                    {
                        (this.state.queue&&this.state.queue=="/personCheck")?
                        <dl>
                            <dt>学历是否受限制</dt>
                            <dd title={commonJs.is_obj_exist(this.state.lpCheckFlag)}>{commonJs.is_obj_exist(this.state.lpCheckFlag)}</dd>
                        </dl>:""
                    }
                    {
                        (this.state.queue&&this.state.queue=="/personCheck")?
                        <dl>
                            <dt>grade</dt>
                            <dd title={commonJs.is_obj_exist(this.state.grade)}>{commonJs.is_obj_exist(this.state.grade)}</dd>
                        </dl>:""
                    }
                </div>
            </div>
    );
    }
};


export default BaseUserInfoBar;