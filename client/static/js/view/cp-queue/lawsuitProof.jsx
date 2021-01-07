// 诉讼举证页面
import React from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Select } from 'antd'; 
const { Option } = Select;
// 页面
import CommonJs from '../../source/common/common';
let commonJs=new CommonJs;

class LawsuitProof extends React.Component{
    constructor(props){
        super(props);
        this.state={
            realityRepaystartValue:null,
            realityRepayendValue:null,
            realityRepayOpen:false,
            pageSize:10,  //每页显示多少条
            current:1,  //当前页码
            totalNum:0,  //总条数
            conditions:{},
            dataType:'receivableFile',
            open:false,
            complates:'北京快惠卡技术有限公司',
            productNo:'',
            newProductList:[
                {
                    name:'福州分啦网络科技有限公司',
                    value:'6C'
                },{
                    name:'深圳市创想汇科技有限公司',
                    value:'17C'
                },
                // {
                //     name:'北京快惠卡技术有限公司',
                //     value:'9F'
                // }
            ],
        }
    }
    // 改变每页显示条目数
    onShowSizeChange(current, pageSize) {
        this.setState({
            current:1
        },()=>{
            this.setState({
                pageSize:pageSize
            },()=>{
                this.searchFn(false);
            })
        })
    }
    //快速跳转到某一页。
    gotoPageNum(pageNumber) {
        this.setState({
            current:pageNumber
        },()=>{
            this.searchFn(false);
        })
    }
    //获取搜索条件
    getConditions(){
        let parem={};
        parem.productNo = this.state.productNo;
        let userName=$('.top .userName').val();
        if(userName&&userName.replace(/\s/g,'')) parem.userName=userName.replace(/\s/g,'');
        let loanNumber=$('.top .loanNumber').val();
        if(loanNumber&&loanNumber.replace(/\s/g,'')) parem.loanNumber=loanNumber.replace(/\s/g,'');
        let fundSuccessDate=this.state.fundSuccessDate;
        if(fundSuccessDate) parem.fundSuccessDate=fundSuccessDate.format('YYYY-MM-DD');
        let minLoanAmount=$('.top .minLoanAmount').val();
        if(minLoanAmount&&minLoanAmount.replace(/\s/g,'')) parem.minLoanAmount=minLoanAmount.replace(/\s/g,'');
        let maxLoanAmount=$('.top .maxLoanAmount').val();
        if(maxLoanAmount&&maxLoanAmount.replace(/\s/g,'')) parem.maxLoanAmount=maxLoanAmount.replace(/\s/g,'');
        let guarantorName=this.state.guarantorName;
        if(guarantorName&&guarantorName.replace(/\s/g,'')) parem.guarantorName=guarantorName.replace(/\s/g,'');
        let downSource=$('.top .excelType option:selected').attr('value');
        if(downSource) parem.downSource=downSource;
        if(this.state.dataType=='receivableFile'){
            let isReceivable=$('.top .isReceivable option:selected').attr('value');
            if(isReceivable) parem.isReceivable=isReceivable;
        }
        let minOverdueDays=$('.top .minOverdueDays').val();
        if(minOverdueDays&&minOverdueDays.replace(/\s/g,'')) parem.minOverdueDays=minOverdueDays.replace(/\s/g,'');
        let maxOverdueDays=$('.top .maxOverdueDays').val();
        if(maxOverdueDays&&maxOverdueDays.replace(/\s/g,'')) parem.maxOverdueDays=maxOverdueDays.replace(/\s/g,'');
        return parem;
    }
    //搜索
    searchFn(fromBtn){
        let that=this;
        let parem={};
        if(fromBtn){
            parem=this.getConditions();
            parem.pageNum=1;
            this.setState({
                current:1,
                conditions:parem
            })
        }else{
            parem=this.state.conditions;
            parem.pageNum=this.state.current;
        }
        if(parem.productNo == ''){
            alert('请选择受让人');
            return
        }
        // let _url="";
        // if(parem.productNo=='9F'){
        //     _url="/node/litigationData/findLawByPage";
        // }else if(parem.productNo=='17C' || parem.productNo=='6C'){
        //     _url="/node/litigationData/findByPage";
        // }
        if(parem.minLoanAmount&&parem.minLoanAmount.replace(/\s/g,'')){
            if(isNaN(parem.minLoanAmount)){
                alert('贷款金额最小值必须是数字！');
                return;
            }
        }
        if(parem.maxLoanAmount&&parem.maxLoanAmount.replace(/\s/g,'')){
            if(isNaN(parem.maxLoanAmount)){
                alert('贷款金额最大值必须是数字！');
                return;
            }
        }
        if(parem.minLoanAmount&&parem.minLoanAmount.replace(/\s/g,'')&&parem.maxLoanAmount&&parem.maxLoanAmount.replace(/\s/g,'')){
            if(Number(parem.maxLoanAmount)<=Number(parem.minLoanAmount)){
                alert('贷款金额最大值必须大于最小值！');
                return;
            }
        }
        if(parem.minOverdueDays&&parem.minOverdueDays.replace(/\s/g,'')&&parem.maxOverdueDays&&parem.maxOverdueDays.replace(/\s/g,'')){
            if(Number(parem.maxOverdueDays)<=Number(parem.minOverdueDays)){
                alert('期天数最大值必须大于最小值！');
                return;
            }
        }
        if(Object.keys(parem).length<=0){
            alert('请输入搜索条件！');
            return;
        }
        parem.pageSize=this.state.pageSize;
        console.log(parem);
        $.ajax({
            type:"post",
            url:"/node/litigationData/findLawByPage",
            async:true,
            dataType: "JSON",
            data:{josnParam:JSON.stringify(parem)},
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                $("#loading").remove();
                if (!commonJs.ajaxGetCode(res)) {
                    that.setState({
                        searchList:[],
                        totalNum:0,
                        current:1,  //当前页码
                    })
                    return;
                }
                let _getData = res.data.data?res.data.data:{};
                if(fromBtn){
                    that.setState({
                        conditions:parem,
                        searchList:_getData.dataList?_getData.dataList:[],
                        totalNum:_getData.totalNum,
                        current:1,  //当前页码
                    });
                }else{
                    that.setState({
                        searchList:_getData.dataList?_getData.dataList:[],
                        totalNum:_getData.totalNum,
                    })
                }
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    
    //月份
    onDateChange=(date, dateString)=>{
        this.setState({
            fundSuccessDate:date
        })
    }
    //担保⼈姓名
    guarantorNameChange=(value)=>{
        this.setState({
            productNo:value
        })
    }
    onSearch=(val)=>{
        let productNo=this.state.productNo;
        if(productNo.indexOf(val)>=0){
            this.setState({
                productNo:complates
            })
        };
        if(!val||val==''){
            this.setState({
                productNo:'',
            })
        }
    }
    //导出文件
    load(){
        let paremobj = this.getConditions();
        if(paremobj.downSource == undefined){
            alert('请选择下载类型');
            return
        }
        let parem=commonJs.toHrefParams(paremobj);
        let productNo=parem.productNo;
        // if(productNo=='9F'){
        //     _url="/node/litigationData/exportLawExcel";
        // }else if(productNo=='17C' || productNo=='6C'){
        //     _url="/node/litigationData/exportExcel";
        // }
        window.open(`/node/litigationData/exportLawExcel?${parem}`);
    }
    render() {
        const tableConfig = {
            "id":"序号",
            "productNo":"产品号",
            "userName":"姓名",
            "nationalId":"身份证号码",
            "loanNumber":"合同编号",
            "loanAmount":"借款金额",
            "realLoanAmount":"实际放款金额",
            "installments":"贷款期数",
            "planAmount":"每期应还金额",
            "repayInstallments":"已还款期数",
            "repayAmount":"已还款金额",
            "repayPrincipal":"已还款本金",
            "repayInterest":"已还款利息",
            "repayLateFee":"已还款罚息",
            "repayUpfrontFeeAmount":"已还款贷款手续费",
            "bankName":"还款划扣银行",
            "overdueAmount":"当前逾期金额",
            "overduePrincipal":"当前逾期本金",
            "overdueInterest":"当前逾期利息",
            "overdueLateFee":"当前逾期罚息",
            "overdueUpfrontFee":"当前逾期贷款手续费",
            "overdueDays":"当前逾期天数",
            "balancePrincipal":"剩余本金",
            "balanceInterest":"剩余利息",
            "balanceLateFee":"剩余罚息",
            "balanceUpfrontFee":"剩余贷款手续费",
            "receivableAmount":"应代偿金额",
            "balanceReceivableAmount":"未代偿金额",
            "proceedsAmount":"实收代偿金额",
            "cashGapAmount":"保证金缺口",
            "fundingSuccessDateStr":"放款成功日期",
            "installmentInterestStartDateStr":"起息日",
            "receivableWay":"代偿方式",
        }
        let productList = [
            {
                name:'福州分啦网络科技有限公司',
                value:'6C'
            },{
                name:'深圳市创想汇科技有限公司',
                value:'17C'
            },
            // {
            //     name:'北京快惠卡技术有限公司',
            //     value:'9F'
            // }
        ]
        return (
            <div className="content" id="content">
                <div data-isresetdiv="yes" style={{minHeight: '130px'}} className="bar top clearfix pb5 return-visit-condition" data-resetstate="realityRepaystartValue,realityRepayendValue,fundSuccessDate,guarantorName,productNo">
                <dl className="left mt10">
                        <dt>受让人名称</dt>
                        <dd  style={{position: 'relative'}} id='productNo'>
                            <input style={{"width":"100%"}} type="text" value={this.state.productNoName} className="input productNo" id='productNo' onFocus={()=>{this.refs.productNoDiv.className='show'}} /* onBlur={()=>{this.refs.productNoDiv.className='hide'}} */ onChange={(e)=>{
                                 this.setState({productNoName:e.currentTarget.value});
                                 let list = [];
                                 productList.forEach((v,i)=>{
                                     if(v.name.indexOf(e.currentTarget.value) !== -1){
                                        list.push(v);
                                     }
                                 })
                                 let productNo = this.state.productNo;
                                 if(e.currentTarget.value == ''){
                                    productNo = '';
                                 }
                                this.setState({
                                    newProductList:list,
                                    productNo:productNo
                                })
                            }} placeholder="请输入"/>
                            <div ref='productNoDiv' className="hide" style={{background: '#fff',width: '100%',zIndex: '100',position: 'absolute',border:' 1px solid #eee',}} >
                                <ul>
                                    {
                                        this.state.newProductList.length>0?
                                        this.state.newProductList.map((v,i)=>{
                                            return (<li style={{cursor: 'pointer',borderBottom: '1px solid #eee',paddingLeft: '12px',lineHeight: '30px'}} onClick={(e)=>{
                                                // console.log(e.currentTarget.title);
                                                this.setState({productNoName:e.currentTarget.innerText,productNo:e.currentTarget.title});
                                                this.refs.productNoDiv.className='hide'
                                            }} title={v.value} key={i} >{v.name}</li>)
                                        }):<li style={{cursor: 'pointer',borderBottom: '1px solid #eee',paddingLeft: '12px',lineHeight: '30px'}}>没有数据</li>
                                    }
                                </ul>
                            </div>
                        {/* <Select
                            allowClear
                            showSearch
                            value={this.state.productNo}
                            style={{ width: '100%' }}
                            onChange={this.guarantorNameChange}
                            onSearch={this.onSearch}
                        >
                            <Option key={0} value={'6C'}>福州分啦网络科技有限公司</Option>
                            <Option key={1} value={'17C'}>深圳市创想汇科技有限公司</Option>
                        </Select> */}
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>姓名</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input userName" id='userName' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>贷款号</dt>
                        <dd>
                            <input style={{"width":"100%"}} type="text" className="input loanNumber" id='loanNumber' placeholder="请输入"/>
                        </dd>
                    </dl> 
                    <dl className="left mt10">
                        <dt>金额范围</dt>
                        <dd>
                            <input style={{"width":"47%"}} type="number" id='minLoanAmount' onKeyPress={commonJs.handleKeyPress.bind(this,null)} className="input minLoanAmount" placeholder="最小值"/>
                            <span style={{"width":"6%"}}>&nbsp;-&nbsp;</span>
                            <input style={{"width":"47%"}}type="number" id='maxLoanAmount' onKeyPress={commonJs.handleKeyPress.bind(this,null)} className="input maxLoanAmount" placeholder="最大值"/>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                            <dt>放款日期</dt>
                            <dd id='fundSuccessDate'>
                                <DatePicker 
                                    style={{width:'100%'}}
                                    onChange={this.onDateChange} 
                                    value={this.state.fundSuccessDate}
                                    format="YYYY-MM-DD" 
                                />
                            </dd>
                        </dl>
                    <dl className="left mt10">
                        <dt>受让人是否代偿</dt>
                        <dd>
                            <select style={{cursor: this.state.dataType=="depositFile"?'not-allowed':''}} disabled={this.state.dataType=="depositFile"?true:false} className="select-gray isReceivable" name="" id="isReceivable">
                                {/* <option value="" hidden>请选择</option> */}
                                {/* <option value="">全部</option> */}
                                <option value="0">否</option>
                                <option value="1">是</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>逾期天数</dt>
                        <dd>
                            <input style={{"width":"47%"}} type="number" id='minOverdueDays' onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input minOverdueDays" placeholder="最小值"/>
                            <span style={{"width":"6%"}}>&nbsp;-&nbsp;</span>
                            <input style={{"width":"47%"}} type="number" id='maxOverdueDays' onKeyPress={commonJs.handleKeyPress.bind(this,['.'])} className="input maxOverdueDays" placeholder="最大值"/>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dt>数据类型</dt>
                        <dd>
                            <select onChange={(e)=>{
                                this.setState({
                                    dataType:e.currentTarget.value
                                })
                            }} className="select-gray excelType" name="" id="excelType">
                                {/* <option value="" hidden>请选择</option> */}
                                <option value="receivableFile">代偿代付数据</option>
                                <option value="depositFile">保证金数据</option>
                            </select>
                        </dd>
                    </dl>
                    <dl className="left mt10">
                        <dd>
                            <button className="btn-blue left mr5" id='searchBtn' onClick={this.searchFn.bind(this,true)}>搜索</button>
                            <button className="btn-white left mr5" id='reset' onClick={()=>{commonJs.resetCondition(this,this);this.setState({productNoName:'',productNo:''});}}>重置</button>
                            <a onClick={this.load.bind(this)} target='' id='exportExcel' className="btn-yellow left">导出EXCEL</a>
                        </dd>
                    </dl>
                </div>
                
                <div className="cdt-result bar mt20 relative">
                    
                    <div className="cdt-list" style={{'ovflowX':'scroll'}}>
                        <table className="table" style={{minWith:'100%'}}>
                            <thead>
                                <tr className='th-bg'>
                                        {
                                            Object.keys(tableConfig).map((key,i)=>{
                                                return <th key={i} className='nowrap'>{tableConfig[key]}</th>
                                            })
                                        }
                                    </tr>
                            </thead>
                            <tbody>
                            {
                                (this.state.searchList && this.state.searchList.length>0) ? this.state.searchList.map((repy,i)=>{
                                    return <tr key={i} id={commonJs.is_obj_exist(repy.id)}>
                                            {
                                                Object.keys(tableConfig).map((key,item)=>{
                                                    const _value = commonJs.is_obj_exist(repy[key]);
                                                    return <td title={_value} key={item} className='nowrap' style={{overFlow:'auto'}}>
                                                        {_value}
                                                    </td>
                                                })
                                            }
                                            </tr>
                                        }):<tr><td colSpan="24" className="gray-tip-font">暂未查到相关数据...</td></tr>
                            }  
                            </tbody>
                        </table>
                    </div>
                    <div className="cdt-th th-bg clearfix pl20 pt5 pb5 pr20">
                        <div className="paageNo left" id='pageAtion'>
                            <Pagination
                                showQuickJumper
                                showSizeChanger
                                onShowSizeChange={this.onShowSizeChange.bind(this)}
                                defaultPageSize={this.state.pageSize}
                                defaultCurrent={1}
                                current={this.state.current}
                                total={this.state.totalNum}
                                onChange={this.gotoPageNum.bind(this)}
                                pageSizeOptions={['10','50','100','200','500']}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};

export default LawsuitProof;  //ES6语法，导出模块