// 反欺诈描述- cp-portal
import React,{PureComponent} from 'react';
import {Router, Route, Link, hashHistory, IndexRoute} from 'react-router';
import $ from 'jquery';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
// import {observer,inject} from "mobx-react";

// @inject('allStore') @observer
class FraudDes extends React.Component {
    constructor(props){
        super(props);
        this.state={
            data:this.props.data
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            data:nextProps.data
        })
    }
    render() {
        let data=this.state.data?this.state.data:{};
        return (
            <div className="toggle-box">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    反欺诈描述
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <div className="mt5 hidden">
                    <div className="fraud-des bar clearfix">
                        <div className="clear pl20">
                            <span className="left">决策分数：</span>
                            <strong className="left">{commonJs.is_obj_exist(data.score)}</strong>
                        </div>
                        <div className="clear pl20">
                            <span className="left">决策结果：</span>
                            <strong className="left">{commonJs.is_obj_exist(data.result)}</strong>
                        </div>
                        <div className="clear pl20">
                            <span className="left">决策结果描述：</span>
                            <strong className="left break-all pr10">{commonJs.is_obj_exist(data.reason)}</strong>
                        </div>
                    </div>
                    <table className="radius-tab replay-list mt2" cellPadding={0} cellSpacing={0} frameBorder={0}>
                        <tbody>
                        <tr className="border-bottom">
                            <th>产品号</th>
                            <th>身份证</th>
                        </tr>
                        {
                            (data.productNas && data.productNas.length>0)?data.productNas.map((repy,i)=>{
                                return <tr className="border-bottom" key={i}>
                                            <td>{commonJs.is_obj_exist(repy.productNo)}</td>
                                            <td>{commonJs.is_obj_exist(repy.nationalId)}</td>
                                        </tr>
                                }): <tr><td colSpan="6" className="gray-tip-font">暂未查到相关数据...</td></tr>
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
};

export default FraudDes;
