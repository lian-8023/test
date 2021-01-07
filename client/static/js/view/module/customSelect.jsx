// 自定义多选select效果
import React,{PureComponent} from 'react';
import $ from 'jquery';

class CustomSelect extends React.Component {
    constructor(props){
        super(props);
        this.state={
            _clearCs_inp:this.props.clearCs_inp,  //是否清空所选内容
            _placeholder:this.props.placeholder,   //默认文本
            _data:this.props.data,   //循环数据，类型：array
            selectdArray:[],//选中数据
            _selected:""
        }
    }
    
    componentDidMount(){
        let that=this;
        //点击页面隐藏 creditModel结果 弹窗
        $(document).bind('click',function(e){ 
            var e = e || window.event; //浏览器兼容性 
            var elem = e.target || e.srcElement; 
            while (elem) { //循环判断至跟节点，防止点击的是div子元素 
                if (elem.id && elem.id=='customSelect-ul') { 
                    return; 
                } 
                if($(elem).closest(".customSelect").length>0){
                    return;
                }
            elem = elem.parentNode; 
            } 
            $("#customSelect-ul").addClass("hidden");
            $("#customSelect-icon").removeClass("cs-icon-on");
        }); 
        
    }
    UNSAFE_componentWillReceiveProps(nextProps){
        this.setState({
            _data:nextProps.data,
            _clearCs_inp:nextProps.clearCs_inp
        })
        if(!this.state._clearCs_inp){
            this.setState({
                selectdArray:[],
                _selected:[]
            })
            $(".customSelect-ul .myCheckbox").removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
        }
    }
    //mycheckbox
    selectedLi(event){
        let $this=$(event.target);
        let _selectdArray=this.state.selectdArray;
        let thisText=$this.parent().find("span").text();
        if($this.hasClass("myCheckbox-normal")){
            $this.removeClass("myCheckbox-normal").addClass("myCheckbox-visited");
            _selectdArray.push(thisText);
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }else{
            $this.removeClass("myCheckbox-visited").addClass("myCheckbox-normal");
            let index =_selectdArray.indexOf(thisText);
            if (index > -1) {
                _selectdArray.splice(index, 1);
            }
            this.setState({
                selectdArray:_selectdArray,
                _selected:_selectdArray.join(",")
            })
        }
    }
    // 获取焦点
    selectTriger(event){
        let $this=$(event.target);
        let $parent=$this.closest(".customSelect");
        let $ul=$parent.find(".customSelect-ul");
        let $icon=$parent.find(".cs-icon");
        if($ul.hasClass("hidden")){
            $ul.removeClass("hidden");
            $icon.addClass("cs-icon-on");
        }else{
            $ul.addClass("hidden");
            $icon.removeClass("cs-icon-on");
        }
    }

    render() {
        return (
            <div className="customSelect clearfix mt5 left relative">
                <input type="text" className="left cs-inp" value={this.state._selected} placeholder={this.state._placeholder} onClick={this.selectTriger.bind(this)}/>
                <i className="right cs-icon" id="customSelect-icon"></i>
                <div className="cleavr"></div>
                <ul className="customSelect-ul absolute hidden" id="customSelect-ul">
                    {
                        (this.state._data && this.state._data.length>0) ? this.state._data.map((repy,i)=>{
                            return <li key={i} data-value={repy.value} data-name={repy.name}>
                                        <span className="left">{repy.displayName}</span>
                                        <i className="myCheckbox myCheckbox-normal right mr3" onClick={this.selectedLi.bind(this)}></i>
                                    </li>
                        }):<li></li>
                    }
                </ul>
            </div>
        );
    }
};

export default CustomSelect;
