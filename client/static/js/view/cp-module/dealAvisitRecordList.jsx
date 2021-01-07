//回访数据处理record展示  cp-portal
import React from 'react';
import CommonJs from '../../source/common/common';
var commonJs=new CommonJs;
import CpCommonJs from '../../source/cp-portal/common';
var cpCommonJs=new CpCommonJs;

class DealAvisitRecordList extends React.Component {
    render() {
        let productNo=this.props.productNo;
        let recordDatas=this.props.data;
        return (
            <div>
                {/* Record list show start */}
                {
                    cpCommonJs.judgeChannelRecord(productNo)?
                    <div className={(recordDatas && recordDatas.length>0)?"bar mt10 coll-edit-div":"bar mt10 coll-edit-div hidden"}>
                        {
                            (recordDatas && recordDatas.length>0) ? recordDatas.map((repy,i)=>{
                                return <div key={i} className="border-bottom-3 pb5">
                                        <dl className="border-bottom">
                                            <dt>回访目的</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.revisitGoal)}
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>是否优质</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.highQuality)}
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>呼出结果</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.method)}
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>操作前状态</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.beforeReVisitStatus)}
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>处理状态</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.afterReVisitStatus)}
                                            </dd>
                                        </dl>
                                        <dl>
                                            <dt>原因分类</dt>
                                            <dd className="">
                                                {commonJs.is_obj_exist(repy.reasonDiv)} 
                                            </dd>
                                        </dl>
                                        <div className="clearfix ml10 mr10 record-detail-div">
                                            <div className="record-detail left">
                                                <span className="left block pr10">详情</span>
                                                <div className="left detail elli">{commonJs.is_obj_exist(repy.content)}</div>
                                            </div>    
                                            <div className="left toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
                                        </div>
                                        <div className="clearfix ml10 border-top">
                                            <span className="left pr10">{commonJs.is_obj_exist(repy.createdBy)}</span>
                                            <div className="left">{commonJs.is_obj_exist(repy.createdAt)}</div>
                                        </div>
                                    </div>
                                }): ""
                        }
                    </div>
                    :
                    // 3c record list show
                    <div className={(recordDatas && recordDatas.length>0)?"bar mt10 coll-edit-div":"bar mt10 coll-edit-div hidden"}>
                        {
                            (recordDatas && recordDatas.length>0) ? recordDatas.map((repy,i)=>{
                            return <div key={i} className="border-bottom-3 pb5">
                                    <dl className="border-bottom">
                                        <dt>本人接听</dt>
                                        <dd className="">
                                            {commonJs.is_obj_exist(repy.searchType)}
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>沟通方式</dt>
                                        <dd className="">
                                            {commonJs.is_obj_exist(repy.method)}
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>操作前状态</dt>
                                        <dd className="">
                                            {commonJs.is_obj_exist(repy.beforeReVisitStatus)}
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>处理状态</dt>
                                        <dd className="">
                                            {commonJs.is_obj_exist(repy.afterReVisitStatus)}
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>原因分类</dt>
                                        <dd className="">
                                            {commonJs.is_obj_exist(repy.reasonDiv)} 
                                        </dd>
                                    </dl>
                                    <div className="clearfix ml10 mr10 record-detail-div">
                                        <div className="record-detail left">
                                            <span className="left block pr10">详情</span>
                                            <div className="left detail elli">{commonJs.is_obj_exist(repy.content)}</div>
                                        </div>    
                                        <div className="left toggle-record-detail on" onClick={commonJs.toggle_record_detail.bind(this)}><i></i></div>
                                    </div>
                                    <div className="clearfix ml10 border-top">
                                        <span className="left pr10">{commonJs.is_obj_exist(repy.createdBy)}</span>
                                        <div className="left">{commonJs.is_obj_exist(repy.createdAt)}</div>
                                    </div>
                                </div>
                            }): ""
                        }
                    </div>
                }
                {/* Record list show end */}
            </div>
    );
    }
};


export default DealAvisitRecordList;