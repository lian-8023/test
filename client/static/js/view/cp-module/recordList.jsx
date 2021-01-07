//record展示  cp-portal
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;

class RecordList extends React.Component {
    constructor(props){
        super(props);
        this.state={
            recordData:this.props.data,  //数据
            showReloadFile:this.props.showReloadFile,  //是否展示重传文件
            type:this.props.type
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            recordData:nextProps.data,
            showReloadFile:nextProps.showReloadFile,
            type:nextProps.type
        })
    }
    render() {
        let recordData=this.state.recordData?this.state.recordData:[];
        let {type}=this.state;
        let _width='33%';
        if(type=='3C1'){
            _width='10%'
        }
        let updatedTime=this.props.updatedTime?this.props.updatedTime:'updatedAt';
        return (
            <table className="pt-table mt5 commu-tab"  cellPadding={0} cellSpacing={0} frameBorder={0}>
                <tbody>
                    <tr>
                        <th width={_width}>处理状态</th>
                        <th width={_width}>拒绝原因</th>
                        {type=='3C1'?<th width={_width}>门店等级</th>:<th width='0'></th>}
                        {type=='3C1'?<th width={_width}>经营面积</th>:<th width='0'></th>}
                        {type=='3C1'?<th width={_width}>注册资本</th>:<th width='0'></th>}
                        <th width={_width}></th>
                    </tr>
                    {
                    recordData.length>0 ? recordData.map((repy,index)=>{
                        return <tr key={index}>
                            <td colSpan='6' className="no-padding-left no-border">
                                <table className="Queue-table" style={{tableLayout: 'fixed'}} width="100%" cellPadding={0} cellSpacing={0} frameBorder={0}>
                                    <tbody>
                                        <tr>
                                            <td width={_width} className='no-border' title={commonJs.is_obj_exist(repy.contactResult)}>{commonJs.is_obj_exist(repy.contactResult)}</td>
                                            <td width={_width} className='no-border' style={{wordBreak: 'break-all',wordWrap: 'break-word'}}  title={commonJs.is_obj_exist(repy.withdrawOrCancelReason)}>{commonJs.is_obj_exist(repy.withdrawOrCancelReason)}</td>
                                            {type=='3C1'?<td width={_width} className='no-border' title={commonJs.is_obj_exist(repy.storegrade)}>{commonJs.is_obj_exist(repy.storegrade)}</td>:<td width='0'></td>}
                                            {type=='3C1'?<td width={_width} className='no-border' title={commonJs.is_obj_exist(repy.area)}>{commonJs.is_obj_exist(repy.area)}</td>:<td width='0'></td>}
                                            {type=='3C1'?<td width={_width} className='no-border' title={commonJs.is_obj_exist(repy.registeredcapital)}>{commonJs.is_obj_exist(repy.registeredcapital)}</td>:<td width='0'></td>}
                                            <td width={_width} className='no-border'>
                                                <div className="ext-source-tip word-break" title={commonJs.is_obj_exist(repy.createdBy)+commonJs.is_obj_exist(repy[updatedTime])}>
                                                    {commonJs.is_obj_exist(repy.createdBy)} <br/>{commonJs.is_obj_exist(repy[updatedTime])}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td colSpan='6' className="short-border-td">
                                                <div className="short-border"></div>
                                                <p className="pt5 pb5 word-break" title={commonJs.is_obj_exist(repy.caseContent)}>{commonJs.is_obj_exist(repy.caseContent)}</p>
                                            </td>
                                        </tr>
                                        {
                                            (this.state.showReloadFile&&repy.otherInfo)?
                                            <tr>
                                                <td colSpan='6' className="short-border-td">
                                                    <div className="short-border"></div>
                                                    <p className="pt5 pb5 word-break"><b>重传文件：</b>{commonJs.is_obj_exist(repy.otherInfo)}</p>
                                                </td>
                                            </tr>:<tr><td style={{height:0}}></td></tr>
                                        }
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        }):<tr><td colSpan='6' className="gray-tip-font">暂未查到相关数据...</td></tr>
                }
                </tbody>
            </table>
    );
    }
};


export default RecordList;