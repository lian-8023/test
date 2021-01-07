// 修改信息时显示的input
import React from 'react';
import axios from '../../axios';
// import * as d3 from "d3";

class ModelVisualization extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            }
    }
    componentDidMount() {
        //let data = { "statements": [{ "statement": "match p=(n4:Order)<--(n3)-[*1..2]->(n1:Order)-[*1..2]->(n2) where n1.prodNo = $pro and n1.name = $orderNo return p", "parameters": { "pro": this.props.parms.cooperationFlag, "orderNo": this.props.parms.orderNo}, "resultDataContents": ["graph"] }] };
        //let data = {"statements": [{ "statement": "match  p1=(n3)-->(n1:Order)-[:USE_BANKCARD|:AS_COMP_ADDRESS|:USE_AS_WORK|:AS_COMP_NAME|:USE_AS_REFERENCE|:USE_AS_PRIMARY|:HANDLED_BY|:COME_FROM|:AS_HOME_ADDRESS|:AS_CENSUS_ADDRESS|:ISSUED|:USE_AS_BANK|:AS_COMP_DISTRICT|:IMEI_OF_COMMODITY|:AS_CENSUS_DISTRICT|:AS_HOME_DISTRICT|:USE_PBOC|:HAS_PBOC|:AS_FRAUD_MODEL]->(n2) where n1.prodNo = $pro and n1.name =$orderNo with p1,n3,n2 match p2=(n3)-[:APPLY_ORDER]->(n4:Order)-[:USE_BANKCARD|:AS_COMP_ADDRESS|:USE_AS_WORK|:AS_COMP_NAME|:USE_AS_REFERENCE|:USE_AS_PRIMARY|:HANDLED_BY|:COME_FROM|:AS_HOME_ADDRESS|:AS_CENSUS_ADDRESS|:ISSUED|:USE_AS_BANK|:AS_COMP_DISTRICT|:IMEI_OF_COMMODITY|:AS_CENSUS_DISTRICT|:AS_HOME_DISTRICT|:USE_PBOC|:HAS_PBOC|:AS_FRAUD_MODEL]->(n5), p3=(n2)-[:USE_AS_BANK|:AS_COMP_ADDRESS|:AS_COMP_NAME|:LOCATED_IN|:USE_AS_PRIMARY|:USE_AS_WORK|:AS_CENSUS_ADDRESS|:USE_AS_SA|:WORK_IN|:AS_ADMISSION_POINT|:USE_AS_STORE|:AS_STORE_ADDRESS|:LOCATED_IN|:HAS_PERFORMANCE|:RELATED_TO]->(n6)return p1,p2,p3", "parameters": { "pro": this.props.parms.cooperationFlag, "orderNo": this.props.parms.orderNo}, "resultDataContents": ["graph"] }] };
        let data = {"statements": [{ "statement": "match  p1=(n3)-->(n1:Order)-[:USE_BANKCARD|:AS_COMP_ADDRESS|:USE_AS_WORK|:AS_COMP_NAME|:USE_AS_REFERENCE|:USE_AS_PRIMARY|:HANDLED_BY|:COME_FROM|:AS_HOME_ADDRESS|:AS_CENSUS_ADDRESS|:ISSUED|:USE_AS_BANK|:AS_COMP_DISTRICT|:IMEI_OF_COMMODITY|:AS_CENSUS_DISTRICT|:AS_HOME_DISTRICT|:USE_PBOC|:HAS_PBOC|:AS_FRAUD_MODEL|:USE_AS_SA|:WORK_IN|:AS_ADMISSION_POINT|:USE_AS_STORE|:AS_STORE_ADDRESS|:LOCATED_IN|:HAS_PERFORMANCE|:RELATED_TO*1..2]->(n2) where n1.prodNo = $pro and n1.name =$orderNo with p1,n3 match p2=(n3)-[:APPLY_ORDER]->(n4:Order) return p1,p2", "parameters": { "pro": this.props.parms.cooperationFlag, "orderNo": this.props.parms.orderNo}, "resultDataContents": ["graph"] }] };
        this.getData(data);
        // this.getData();
    }

    getData = (data)=>{
        let that = this;
        $.ajax({
            type:"POST", 
            url:"node/transaction/commit", 
            async:true,
            //data:'{"statements":[{"statement":"match p=(n4:Order)<--(n3)-[*1..2]->(n1:Order)-[*1..2]->(n2) where n1.prodNo = $pro and n1.name = $orderNo return p","parameters":{"pro":"2A","orderNo":"2A202035199152A1577890678386"},"resultDataContents" : ["graph"]}]}',
            data:JSON.stringify(data),
            contentType:"application/json;charset=utf-8",
            dataType: "JSON",
            beforeSend: function(request) {
                request.setRequestHeader("Authorization",'Basic bmVvNGo6bmVvNGoxMjM=');
                // request.setRequestHeader("Content-Type:",'application/json');
                request.setRequestHeader("Accept",'application/json;charset=utf-8');
            },
            success:function(res){
                if(res.code=='0'||res.errors&&res.errors.length > 0){
                    alert('可视化接口错误');
                }else{
                    let data = JSON.parse(res.data);
                    if(data.results[0].data.length == 0){
                        alert('没有数据')
                    }else{
                        that.init(data);
                    }
                }
            }
        })
    }
    
    init(res) {
        const Data = res
        console.log(res)
        console.log(Data)
        var neo4jd3 = new Neo4jd3('#neo4jd3', {
            minCollision: 60,
            // neo4jDataUrl: 'json/neo4jData.json',
            neo4jData:Data,
            showText:true,
            nodeRadius: 25,
            /* onNodeDoubleClick: function(node) {
                switch(node.id) {
                    case '25':
                        // Google
                        window.open(node.properties.url, '_blank');
                        break;
                    default:
                        var maxNodes = 5,
                            data = neo4jd3.randomD3Data(node, maxNodes);
                        neo4jd3.updateWithD3Data(data);
                        break;
                }
            }, */
            onRelationshipDoubleClick: function(relationship) {
                console.log('double click on relationship: ' + JSON.stringify(relationship));
            },
            zoomFit: true
        });
    }
    render() {
        return (
            <div className="page flex" >
                <div ref="neo4jd3" style={{height:'500px',background:'#fff'}} id="neo4jd3"></div>
            </div>

        )
    }
};

export default ModelVisualization;
