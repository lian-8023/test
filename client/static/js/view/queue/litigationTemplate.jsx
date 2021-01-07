//诉讼模板管理
import React,{PureComponent} from 'react';
import $ from 'jquery';
import { Pagination,DatePicker,Table,Input,Row, Col,Select,Button,Popconfirm ,Modal } from 'antd';  //页码
import CommonJs from '../../source/common/common';
import ReactQuill from 'react-quill'; 
const { RangePicker } = DatePicker;
// import 'react-quill/dist/quill.snow.css';
import axios from '../../axios';
import moment from 'moment';
var commonJs=new CommonJs;
const { Option } = Select;
class DataAbnormal extends React.Component{
    constructor(props){
        super(props);
        this.state={
            tabs :[{name:'诉讼模板管理',styleKey:'active'},{name:'诉状LPR维护',styleKey:'tabsStyle'}],//tabs
            seachData:{fileName:'',paperType:''},
            paperType:'',//文件类型
            login:false,
            dataSource:[],//列表
            fileName:'',//文件名称
            productNos:[],//产品号集合
            param:[],//参数
            outParam:'',
            minParam:[],
            value: '',
            smallClass:'',
            fileParams:[],
            fileAfterLoan:{},
            paperTypeList:[],//文件类型
            index:0,
            visible: false,
            LPRvisible:false,
            dataSource1:[],//利率list
            lprSaveData:{
                RangePickerValue:[],
                id:'',
                beginTime:'',
                endTime:'',
                lprRate:'',
            }
        }
    }

    UNSAFE_componentWillMount(){
        this.getFileList(0);
        this.getFileParams(0);
    }
    componentDidMount(){
        // this.initEditor();
    }
    //查询列表
    getFileList=(index)=>{
        let that=this;
        $('#content .edit').addClass('hide');
        $('#content .tableBox').removeClass('hide');
        if(index == 0){
            $('#content .tabs1seach').removeClass('hide');
            let seachData = {};
            this.state.seachData.paperType?seachData.paperType=this.state.seachData.paperType:'';
            this.state.seachData.fileName?seachData.fileName=this.state.seachData.fileName:'';
            this.setState({login:true});
            $.ajax({
                type:"get",
                url:"/node/fileAfterLoan/getFileList",
                async:false,
                dataType: "JSON",
                data:seachData,
                success:function(res) {
                    that.setState({login:false});
                    let response=res.data;  //from node response
                    if (!commonJs.ajaxGetCode(res)) {
                        that.setState({
                            dataSource:[]
                        })
                        return;
                    }
                    that.setState({
                        dataSource:response.data
                    })
                }
            })
        }else{
            $('#content .tabs1seach').addClass('hide');
            $.ajax({
                type:"get",
                url:"/node/lpr/rate/getList",
                async:false,
                dataType: "JSON",
                // data:seachData,
                success:function(res) {
                    that.setState({login:false});
                    let response=res.data;  //from node response
                    if (!commonJs.ajaxGetCode(res)) {
                        that.setState({
                            dataSource:[]
                        })
                        return;
                    }
                    that.setState({
                        dataSource1:response.data
                    })
                }
            })
        }
    }
    //查询参数
    getFileParams=(index,type)=>{
        let that=this;
        switch (index) {
            case 0:
                $.ajax({
                    type:"get",
                    url:'/node/fileAfterLoan/getInitData',
                    data:{},
                    async:false,
                    dataType: "JSON",
                    success:function(res) {
                        let response=res.data;  //from node response
                        if (!commonJs.ajaxGetCode(res)) {
                            that.setState({
                                dataSource:[]
                            })
                            return;
                        }
                        that.setState({
                            paperTypeList:response.data,
                        })
                    }
                })
            break;
            default:
                $.ajax({
                    type:"get",
                    url:'/node/fileAfterLoan/getFileParams',
                    data:{paperType:this.state.paperType},
                    async:false,
                    dataType: "JSON",
                    success:function(res) {
                        let response=res.data;  //from node response
                        if (!commonJs.ajaxGetCode(res)) {
                            that.setState({
                                fileAfterLoan:[],
                                productNos:[],
                                param:[],
                            })
                            return;
                        }
                        that.setState({
                            fileAfterLoan:response.data.fileAfterLoan,
                            productNos:response.data.productNos,
                            param:response.data.param,
                        })
                        if(type == 'new'){
                            let {fileAfterLoan} = response.data;
                            let newfileParams = [];
                            if(fileAfterLoan.fileParams){
                                newfileParams = JSON.parse(fileAfterLoan.fileParams);
                            }
                            that.setState({
                                fileName:fileAfterLoan.fileName,
                                productNo:[],
                                fileParams:newfileParams,
                                id:'',
                                value:fileAfterLoan.pageContent
                            })
                        }
                    }
                })
            break;
        }
    }
    //编辑
    showEdit = (type,record)=>{
        let {index} = this.state;
        index = parseFloat(index);
        switch (type) {
            case 'edit':
                if(index == 1){
                    let date = [];
                    date.push(moment(record.beginTime));
                    date.push(moment(record.endTime));
                    this.setState({
                        LPRvisible:true,
                        lprSaveData:{
                            RangePickerValue:date,
                            beginTime:record.beginTime,
                            endTime:record.endTime,
                            lprRate:record.lprRate,
                            id:record.id
                        }
                    })
                }else{
                    $('#content .edit').removeClass('hide');
                    $('#content .tableBox').addClass('hide');
                    $('#content .tabs1seach').addClass('hide');
                    let newfileParams = record.fileParams?JSON.parse(record.fileParams):[];
                    let newProductNo = record.productNo?record.productNo.split(','):[];
                    this.setState({
                        fileName:record.fileName,
                        productNo:newProductNo,
                        fileParams:newfileParams,
                        id:record.id,
                        paperType:record.paperType.code,
                        value:record.pageContent,
                    },()=>{
                        this.getFileParams(1);
                    })
                }
                break;
            case 'copy':
                $('#content .edit').removeClass('hide');
                $('#content .tableBox').addClass('hide');
                $('#content .tabs1seach').addClass('hide');
                let newfileParams = record.fileParams?JSON.parse(record.fileParams):[];
                let newProductNo = record.productNo?record.productNo.split(','):[];
                this.setState({
                    fileName:record.fileName,
                    productNo:newProductNo,
                    fileParams:newfileParams,
                    paperType:record.paperType.code,
                    id:'',
                    value:record.pageContent,
                },()=>{
                    this.getFileParams(1);
                })
                break;
            default:
                if(index == 1){
                    this.setState({
                        LPRvisible:true,
                    })
                }else{
                    this.setState({
                        visible:true,
                    })
                }
                break;
        }
    }
    onValueChange = (value) => {
        // console.log(value, 'value');
        let newArr = [];
        const {fileParams} = this.state;
        let imgarr= $('.ql-container').find('img');
        if(value&&imgarr.length>0){
            for(let y = 0;y<imgarr.length;y++){
                let e = imgarr[y];
                const parent = $(e).parent();
                parent[0].style='position: relative;';
                parent.addClass('imgbox');
            }
        }
        fileParams.forEach((v,i)=>{
            if(value.indexOf(v)!==-1){
                newArr.push(v);
            }
        })
        this.setState({
            value:value,
            fileParams:newArr
        })
    }
    //插入字段
    insert =()=>{
        let {smallClass,outParam} = this.state;
        if(outParam == ''){
            alert('请选择插入的大类');
            return;
        }
        if(smallClass == ''){
            alert('请选择插入的小类');
            return;
        }
        smallClass = '{'+outParam+'.'+smallClass+'}';
        let quill =this.refs.ReactQuill.editor;
        let length =quill.selection.savedRange.index;
        quill.insertText(length,smallClass);
        quill.setSelection((length+smallClass.length))
        let { fileParams } = this.state;
        fileParams.push(smallClass)
        this.setState({fileParams:fileParams});
    }
    //保存
    saveFile=()=>{
        let {fileName,productNo,fileParams,id,value,paperType} = this.state;
        var regex3 = /\{(.+?)\}/g;
        let that = this;
        let newValue = value;
        if(fileName == ''){
            alert('请输入文件名称');
            return;
        }
        if(productNo == ''){
            alert('请输入产品号');
            return;
        }
        if(fileParams.length == 0&&regex3.test(value)){
            alert('请使用插入的变量');
            return;
        }
        let imgarr= $('.ql-container').find('img');
        if(value&&imgarr.length>0){
            for(let y = 0;y<imgarr.length;y++){
                let e = imgarr[y];
                let eOut = e.outerHTML;
                const parent = $(e).parent();
                const src = e.src;
                let ele = document.createElement("img");
                ele.src = src;
                ele.className='newImg'
                ele.style="position: absolute;right: 25px;top: -100px;";
                let eleOut = ele.outerHTML+'</img>';
                newValue = value.replace(eOut,eleOut);
            }
        }
        let newProductNo = productNo.join(',');
        let newfileParams = fileParams.length>0?this.unique1(fileParams):[];
        newfileParams =JSON.stringify(newfileParams);
        let Params = {
            fileName:fileName,
            productNo:newProductNo,
            fileParams:newfileParams,
            id:id,
            pageContent:newValue,
            paperType:paperType
        }
        $.ajax({
            type:"post",
            url:'/node/fileAfterLoan/saveFile',
            data:{josnParam:JSON.stringify(Params)},
            async:false,
            dataType: "JSON",
            success:function(res) {
                let response=res.data;  //from node response
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                alert(response.message);
                that.backMianPage();
            }
        })
    }
    //返回
    backMianPage=()=>{
        $('#content .edit').addClass('hide');
        $('#content .tableBox').removeClass('hide');
        $('#content .tabs1seach').removeClass('hide');
        this.setState({
            fileName:'',
            productNo:[],
            fileParams:[],
            id:'',
            value:''
        })
        this.getFileList(0);
    }
    //数组去重
    unique1=(arr)=>{
        var hash=[];
        for (var i = 0; i < arr.length; i++) {
            if(hash.indexOf(arr[i])==-1){
            hash.push(arr[i]);
            }
        }
        return hash;
    }
    //预览
    preview=(type,record)=>{
        let that = this;
        let Params = {};
        /* let newfileParams = record.fileParams?JSON.parse(record.fileParams):[];
        let newProductNo = record.productNo?record.productNo.split(','):[] */;
        if(type == 'list'){
             Params = {
                fileName:record.fileName,
                productNo:record.productNo,
                fileParams:record.fileParams,
                id:record.id,
                pageContent:record.pageContent,
                paperType:record.paperType.code
            }
        }else{
            let {fileName,productNo,fileParams,id,value} = this.state;
            var regex3 = /\{(.+?)\}/g;
            let newValue = value;
            if(fileName == ''){
                alert('请输入文件名称');
                return;
            }
            if(productNo == ''){
                alert('请输入产品号');
                return;
            }
            if(fileParams.length == 0&&regex3.test(value)){
                alert('请使用插入的变量');
                return;
            }
            let imgarr= $('.ql-container').find('img');
            if(value&&imgarr.length>0){
                for(let y = 0;y<imgarr.length;y++){
                    let e = imgarr[y];
                    let eOut = e.outerHTML;
                    const parent = $(e).parent();
                    const src = e.src;
                    let ele = document.createElement("img");
                    ele.src = src;
                    ele.className='newImg'
                    ele.style="position: absolute;right: 25px;top: -100px;";
                    let eleOut = ele.outerHTML+'</img>';
                    newValue = value.replace(eOut,eleOut);
                }
            }
            let newProductNo = productNo.join(',');
            let newfileParams = fileParams.length>0?this.unique1(fileParams):[];
            newfileParams =JSON.stringify(newfileParams);
            Params = {
                fileName:fileName,
                productNo:newProductNo,
                fileParams:newfileParams,
                id:id,
                pageContent:newValue,
                paperType:this.state.paperType
            }
        }
        $.ajax({
            type:"post",
            url:'/node/preview/file/word/create',
            data:{josnParam:JSON.stringify(Params)},
            async:false,
            dataType: "JSON",
            beforeSend:function(XMLHttpRequest){
                $("body").append(loading_html);
            },
            success:function(res) {
                // $("#loading").remove();
                let response=res.data;  //from node response
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                window.location='/node'+response.data;
            },
            complete : function(XMLHttpRequest,status){ //请求完成后最终执行参数
                $("#loading").remove();
        　　}
        })
    }
    //删除
    deleteFile=(record)=>{
        let {index} = this.state;
        let {id} = record;
        let that = this;
        let Params = {
            id:id,
        }
        index = parseFloat(index);
        switch (index) {
            case 1:
                $.ajax({
                    type:"get",
                    url:'/node/lpr/rate/deleteFile',
                    data:Params,
                    async:false,
                    dataType: "JSON",
                    success:function(res) {
                        let response=res.data;  //from node response
                        if (!commonJs.ajaxGetCode(res)) {
                            return;
                        }
                        alert(response.message);
                        that.getFileList(index);
                    }
                })
                break;
            default:
                $.ajax({
                    type:"get",
                    url:'/node/fileAfterLoan/deleteFile',
                    data:Params,
                    async:false,
                    dataType: "JSON",
                    success:function(res) {
                        let response=res.data;  //from node response
                        if (!commonJs.ajaxGetCode(res)) {
                            return;
                        }
                        alert(response.message);
                        that.getFileList(index);
                    }
                })
                break;
        }
    }
    handleOk = e => {
        let {paperType} = this.state;
        if(paperType == ''){
            alert('请选择文件类型');
            return;
        }
        $('#content .edit').removeClass('hide');
        $('#content .tableBox').addClass('hide');
        $('#content .tabs1seach').addClass('hide');
        this.getFileParams(1,'new');
        this.setState({
          visible: false,
        });
    };
    //LPR维护
    handleLPROk = e =>{
        const that = this;
        const lprSaveData = Object.assign({},this.state.lprSaveData);
        let Params = {
            beginTime:lprSaveData.beginTime,
            endTime:lprSaveData.endTime,
            lprRate:lprSaveData.lprRate,
            id:lprSaveData.id,
        }
        if(Params.lprRate == ''){
            alert('请输入LPR利率');
            return;
        }
        if(Params.beginTime == ''){
            alert('请选择时间');
            return;
        }
        $.ajax({
            type:"post",
            url:'/node/lpr/rate/save',
            data:{josnParam:JSON.stringify(Params)},
            async:false,
            dataType: "JSON",
            success:function(res) {
                let response=res.data;  //from node response
                if (!commonJs.ajaxGetCode(res)) {
                    return;
                }
                alert(response.message);
                that.setState({
                    LPRvisible:false,
                    lprSaveData:{
                        RangePickerValue:[],
                        beginTime:'',
                        endTime:'',
                        lprRate:'',
                        id:''
                    }
                });
                that.getFileList(1);
                // that.backMianPage();
            }
        })

    }
    handleCancel = type => {
        switch (type) {
            case 'LPR':
                this.setState({
                    LPRvisible: false,
                    lprSaveData:{
                        RangePickerValue:[],
                        beginTime:'',
                        endTime:'',
                        lprRate:'',
                        id:''
                    }
                  });
                break;
            default:
                this.setState({
                    visible: false,
                });
                break;
        }
    };
    render() {
        const {dataSource,productNos,param,minParam,value,smallClass,fileName,productNo,login,tabs,paperTypeList,dataSource1} = this.state
        const columns = [
            {
                title: '文件名称',
                dataIndex: 'fileName',
                key: 'fileName',
            },{
                title: '文件类型',
                dataIndex: 'paperType',
                key: 'paperType',
                render:(test,record)=>{
                    return test.describe;
                }
            },{
                title: '产品号',
                dataIndex: 'productNo',
                key: 'productNo',
            },
            {
              title: '创建人',
              dataIndex: 'createdBy',
              key: 'createdBy',
            },
            {
              title: '创建时间',
              dataIndex: 'createdAt',
              key: 'createdAt',
            },{
                title: '更新人',
                dataIndex: 'updatedBy',
                key: 'updatedBy',
            },{
                title: '更新时间',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
            },, {
                title: '操作',
                dataIndex: 'operate',
                key: 'operate',
                render: (text,record)=>{
                  return(
                    <div>
                        <a href="javascript:;" style={{marginRight: '10px'}} onClick={()=>{this.preview('list',record)}}>预览</a>
                        <a href="javascript:;" style={{marginRight: '10px'}} onClick={()=>{this.showEdit('copy',record)}}>复制</a>
                        <a href="javascript:;" style={{marginRight: '10px'}} onClick={()=>{this.showEdit('edit',record)}}>编辑</a>
                        <Popconfirm
                            title="确定进行此操作？"
                            onConfirm={()=>{this.deleteFile(record)}}
                            // onCancel={cancel}
                            okText="删除"
                            cancelText="取消"
                        >
                           <a href="javascript:;">删除</a>
                        </Popconfirm>
                                            
                    </div>
                  )
                }
              }
        ];
        const columns1=[
            {
                title: '开始时间',
                dataIndex: 'beginTime',
                key: 'beginTime',
            },{
                title: '结束时间',
                dataIndex: 'endTime',
                key: 'endTime',
            },{
                title: 'LPR利率',
                dataIndex: 'lprRate',
                key: 'lprRate',
            },{
                title: '更新时间',
                dataIndex: 'updatedAt',
                key: 'updatedAt',
            },{
                title: '更新人',
                dataIndex: 'updatedBy',
                key: 'updatedBy',
            },{
                title: '创建时间',
                dataIndex: 'createdAt',
                key: 'createdAt',
            },{
                title: '创建人',
                dataIndex: 'createdBy',
                key: 'createdBy',
            },{
                title: '操作',
                dataIndex: 'operation',
                key: 'operation',
                render: (text,record)=>{
                    return(
                      <div>
                          <a href="javascript:;" style={{marginRight: '10px'}} onClick={()=>{this.showEdit('edit',record)}}>编辑</a>
                          <Popconfirm
                              title="确定进行此操作？"
                              onConfirm={()=>{this.deleteFile(record)}}
                              // onCancel={cancel}
                              okText="删除"
                              cancelText="取消"
                          >
                             <a href="javascript:;">删除</a>
                          </Popconfirm>
                                              
                      </div>
                    )
                  }
            },
        ]
        const modules = {
            toolbar: {container:[
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                    // ['blockquote', 'code-block'],
                    // ['link', 'image'],
                    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    // [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
                    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
                    // [{ 'direction': 'rtl' }],                         // text direction
                    // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                    // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    // [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                    // [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['clean']                                         // remove formatting button
                ]
            }
        }
        return (
            <div className="content" id="content">
                <div className="bar bar-tit pl20">
                    {
                        tabs.map((v,i)=>{
                            return(<b id={i} key={i} onClick={(e)=>{
                                let tabsList = this.state.tabs.slice();
                                tabsList.forEach((x,y)=>{
                                    if(y == e.currentTarget.id){
                                        x.styleKey = 'active';
                                    }else{
                                        x.styleKey = 'tabsStyle'
                                    }
                                })
                                this.setState({
                                    tabs:tabsList,
                                    index: e.currentTarget.id
                                })
                                this.getFileList(e.currentTarget.id);
                            }} style={styles[v.styleKey]} >{v.name}</b>)
                        })
                    }
                    <div style={{minHeight: '40px',marginLeft: '10px'}} >
                        <div ref='tabs1seach' style={{display: 'inline-block',width: '92%'}} className="tabs1seach" >
                           <Row>
                               <Col span={2} >文件类型：</Col>
                               <Col span={3} >
                                    <Select
                                        style={{width:'100%'}}
                                        value={this.state.seachData.paperType}
                                        onChange={(e)=>{
                                            let seachData = Object.assign({},this.state.seachData);
                                            seachData.paperType = e;
                                            this.setState({
                                                seachData:seachData,
                                            })
                                        }}
                                    >
                                        {
                                            paperTypeList.map((v,i)=>{
                                                return(<Option key={i} value={v.code} >{v.describe}</Option>)
                                            })
                                        }
                                    </Select>
                               </Col>
                               <Col span={2} style={{textAlign: 'right'}} >名称：</Col>
                               <Col span={3} ><Input value={this.state.seachData.fileName} onChange={(e)=>{let seachData = Object.assign({},this.state.seachData);seachData.fileName=e.currentTarget.value;this.setState({seachData:seachData})}} /></Col>
                               <Col span={2} style={{float: 'right',marginTop: '10px'}} > <button style={{padding: '0 20px',height: '28px',lineHeight: '28px',float: 'right'}} onClick={()=>{this.getFileList(0)}} className="btn-blue RTtsearch" id="searchBtn">查询</button></Col>
                           </Row>
                        </div>
                        <button style={{padding: '0 20px',height: '28px',lineHeight: '28px',float: 'right',margin:'10px 15px 10px 0px'}} onClick={()=>{this.showEdit('add')}} className="btn-blue RTtsearch" id="searchBtn">新增</button>
                    </div>
                </div>
                <div className="tableBox" style={{background: '#fff',marginTop: '25px',borderRadius: '5px'}} >
                    {
                        this.state.index == 0?<Table rowKey='id' loading={login} dataSource={dataSource} columns={columns} />:
                        <Table rowKey='id' loading={login} dataSource={dataSource1} columns={columns1} />
                    }
                    
                </div>
                <div className='edit hide'  style={{minHeight:'80vh',background: '#fff',marginTop: '25px',borderRadius: '5px',padding: '5px 20px',overflow:'auto'}} >
                    <Row  style={{lineHeight: '70px',float:'left',width: '33.3333%'}} >
                        <Col span={5}>文件名称：</Col>
                        <Col span={16}><Input onChange={v=>{this.setState({fileName:v.currentTarget.value})}}value={fileName} /></Col>
                    </Row>
                    <Row style={{lineHeight: '70px',float:'left',width: '33.3333%'}} >
                        <Col span={5}>产品编号：</Col>
                        <Col span={16}><Select value={productNo} style={{width:'100%'}} 
                                            mode='multiple'
                                            onChange={(text)=>{
                                                this.setState({productNo:text})
                                            }}
                                        >
                                            {
                                                <Option value="*">全部</Option>
                                            }
                                            {
                                                productNos.map((v,i)=>{
                                                    return(<Option key={i} value={v} >{v}</Option>)
                                                })
                                            }
                                        </Select>
                        </Col>
                    </Row>
                    <Row  style={{lineHeight: '70px',float:'left',width: '33.3333%',height:' 70px'}} >
                        <Col span={5}><button style={{width: '149px',marginTop: '18px'}} className="mt10 mr15 btn-blue" onClick={()=>{this.insert()}} id="">插入字段</button></Col>
                    </Row>
                    <Row  style={{lineHeight: '70px',float:'left',width: '33.3333%'}} >
                        <Col span={5}>选择大类：</Col>
                        <Col span={16}>
                            <Select style={{width:'100%'}}
                                onChange={(text)=>{
                                    let arr = [];
                                    param.forEach(p=>{
                                        if(p.name == text){
                                            arr = p.child;
                                        }
                                    })
                                    this.setState({
                                        outParam:text,
                                        minParam:arr,
                                        smallClass:''
                                    })
                                }}
                             >
                                            {
                                                param.map((v,i)=>{
                                                    return(<Option key={i} value={v.name} >{v.type}</Option>)
                                                })
                                            }
                                        </Select>
                        </Col>
                    </Row>
                    <Row  style={{lineHeight: '70px',float:'left',width: '33.3333%'}} >
                        <Col span={5}>选择小类：</Col>
                        <Col span={16}>
                            <Select
                            onChange={(text)=>{
                                this.setState({
                                    smallClass:text,
                                })
                            }}
                            value={smallClass}
                            style={{width:'100%'}} >
                                            {
                                                minParam.map((v,i)=>{
                                                    return(<Option key={i} value={v.name} >{v.type}</Option>)
                                                })
                                            }
                                        </Select>
                        </Col>
                    </Row>
                    <ReactQuill
                        className="ql-editor" 
                        ref="ReactQuill"
                        style={{/* float: 'left', */width: '793px',color:'#000',margin: '0 auto',marginTop: '150px'}}
                        value={value}
                        theme="snow"
                        modules={modules}
                        // formats={this.formats}
                        // className={styles.editContainer}
                        onChange={this.onValueChange} />
                    <Row  style={{lineHeight: '70px',float:'right',width: '20.3333%',height:' 70px',textAlign: 'right'}} >
                        <Col span={8}><Button onClick={()=>{this.backMianPage()}} >取消</Button></Col>
                        <Col span={8}><Button onClick={()=>{this.saveFile()}} type="primary" >保存</Button></Col>
                        <Col span={8}><Button onClick={()=>{this.preview('edit')}}>预览</Button></Col>
                    </Row>
                    {/* {
                        param.map((v,i)=>{
                            return(<Row key={i} style={{lineHeight: '70px',float:'left',width: '40%'}} >
                                        <Col span={5}>{v.type}：</Col>
                                        <Col span={16}><Select style={{width:'100%'}} >
                                                            {
                                                                v.child.map((e,y)=>{
                                                                    return(<Option key={y} value={e.name} >{e.type}</Option>)
                                                                })
                                                            }
                                                        </Select>
                                        </Col>
                                    </Row>)
                        })
                    } */}

                </div>
                <Modal
                    title="请选择文件类型"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    onCancel={()=>{this.handleCancel()}}
                    >
                    <Row>
                               <Col span={5} >文件类型：</Col>
                               <Col span={8} >
                                    <Select
                                        style={{width:'100%'}}
                                        value={this.state.paperType}
                                        onChange={(e)=>{
                                            let paperType = e;
                                            this.setState({
                                                paperType:paperType,
                                            })
                                        }}
                                    >
                                        {
                                            paperTypeList.map((v,i)=>{
                                                return(<Option key={i} value={v.code} >{v.describe}</Option>)
                                            })
                                        }
                                    </Select>
                               </Col>
                    </Row>
                </Modal>
                <Modal
                    title="LPR维护"
                    visible={this.state.LPRvisible}
                    onOk={this.handleLPROk}
                    destroyOnClose
                    onCancel={()=>{this.handleCancel('LPR')}}
                    >
                    <Row style={{marginBottom:'20px'}} >
                        <Col span={5} >LPR利率：</Col>
                        <Col span={12} >
                            <Input value={this.state.lprSaveData.lprRate} onChange={(e)=>{
                                let lprSaveData = Object.assign({},this.state.lprSaveData);
                                lprSaveData.lprRate = e.currentTarget.value;
                                this.setState({
                                    lprSaveData:lprSaveData
                                })
                            }} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={5} >时间：</Col>
                        <Col span={12} >
                            <RangePicker value={this.state.lprSaveData.RangePickerValue} onChange={(e)=>{
                                 let lprSaveData = Object.assign({},this.state.lprSaveData);
                                 lprSaveData.beginTime = moment(e[0]).format('YYYY-MM-DD');
                                 lprSaveData.endTime =  moment(e[1]).format('YYYY-MM-DD');
                                 lprSaveData.RangePickerValue =  e;
                                this.setState({
                                    lprSaveData:lprSaveData
                                })
                            }} />
                        </Col>
                    </Row>
                </Modal>
            </div>
        )
    }
};
const styles = {
    active:{
        marginLeft: '10px',
        cursor: 'pointer',
        borderBottom:'1px solid #3385ff',
        color: '#3385ff',
        lineHeight: '28px',
        height: '28px',
        display: 'inline-block'
    },
    tabsStyle:{
        marginLeft: '10px',cursor: 'pointer'
    }
}
export default DataAbnormal;  //ES6语法，导出模块
