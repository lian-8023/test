// 反欺诈描述- cp-portal
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class FraudDesList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            data:this.props.data,
            fraudResult:this.props.fraudResult,
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            data:nextProps.data,
            fraudResult:nextProps.fraudResult,
        })
    }
    render() {
        let {fraudResult='',data={}}=this.state;
        return (
            <div className="toggle-box">
                <h2 className="bar clearfix bar-tit pl20 pr20 mt10 toggle-tit" onClick={commonJs.content_toggle.bind(this)}>
                    反欺诈描述
                    <i className="right bar-tit-toggle bar-tit-toggle-down"></i>
                </h2>
                <div className="mt5 hidden">
                <div className='bar pl20 pr20'>
                    <b>fraudResult: </b>
                    <p className='break-all'>{commonJs.is_obj_exist(fraudResult)}</p>
                </div>
                {
                    Object.keys(data).length>0 ? Object.keys(data).map((key,i)=>{
                        let mstTit=commonJs.is_obj_exist(key);
                        return <div key={i} className="fraud-des bar clearfix border-bottom-3">
                                    <div className="clear pl20">
                                        <strong className="left">{mstTit}</strong>
                                    </div>
                                    {
                                        data[key].map((repy,j)=>{
                                            let numbers=repy.numbers;
                                            return <div key={j} className='border-bottom'>
                                                        <div className="clear pl20">
                                                            <span className="left">productNo:</span>
                                                            <strong className="left">{commonJs.is_obj_exist(repy.productNo)}</strong>
                                                        </div>
                                                        {
                                                            numbers.map((nums,k)=>{
                                                                return <div className="clear pl20" key={k}>
                                                                            <strong className="left">{commonJs.is_obj_exist(nums)}</strong>
                                                                        </div>
                                                            })
                                                        }
                                                    </div>
                                        })
                                    }
                                </div>
                    }):<div className='bar gray-tip-font'>暂未查到相关数据...</div>
                }
                </div>
            </div>
        );
    }
};

export default FraudDesList;
