import $ from 'jquery';
class SortTimeJs{
    /**
     * 根据时间排序数组
     * @param {*} data  需要排序的数组
     * @param {*} time  需要排序的时间
     * @param {*} stateKey  储存在state中的数组，用于更新dom
     */
    sortTime(data,time,stateKey,event,_that){
        if(!data){
            return;
        }
        let that=this;
        if(_that){
            that=_that;
        }
        let $this=$(event.target);
        if($(event.target).hasClass("left") || $(event.target).hasClass("sort-icon")){
            $this=$(event.target).parent();
        }
        let dataSort=$this.attr("data-sort");
        let new_resultList=[];
        if(dataSort=="invert"){   //倒序
            new_resultList=data.sort(function(a,b){
                if(!a[time] || a[time]==""){
                    a[time]=0
                }
                if(!b[time] || b[time]==""){
                    b[time]=0
                }
                return (new Date(b[time])).getTime()-(new Date(a[time])).getTime();
            })
            for(let i=0;i<new_resultList.length;i++){
                if(new_resultList[i][time]==0){
                    new_resultList[i][time]=""
                }
            }
            that.setState({
                [stateKey]:new_resultList
            })
            $this.attr("data-sort","order");
            $this.find(".sort-icon").removeClass("sort-normal sort-order").addClass("sort-invert");
        }else{   //顺序
            new_resultList=data.sort(function(a,b){
                if(!a[time] || a[time]==""){
                    a[time]=0
                }
                if(!b[time] || b[time]==""){
                    b[time]=0
                }
                return (new Date(a[time])).getTime()-(new Date(b[time])).getTime();
            })
            for(let i=0;i<new_resultList.length;i++){
                if(new_resultList[i][time]==0){
                    new_resultList[i][time]=""
                }
            }
            that.setState({
                [stateKey]:new_resultList
            })
            $this.attr("data-sort","invert");
            $this.find(".sort-icon").removeClass("sort-normal sort-invert").addClass("sort-order");
        }
    }
    /**
     * 根据数字排序数组
     * @param {*} data  需要排序的数组
     * @param {*} _nmuber  需要排序的数字字段
     * @param {*} stateKey  储存在state中的数组，用于更新dom
     */
    sortNumber(data,_nmuber,stateKey,event,_that){
        if(!data){
            return;
        }
        let that=this;
        if(_that){
            that=_that;
        }
        let $this=$(event.target);
        if($(event.target).hasClass("left") || $(event.target).hasClass("sort-icon")){
            $this=$(event.target).parent();
        }
        let dataSort=$this.attr("data-sort");
        let new_resultList;
        if(dataSort=="invert"){   //倒序
            new_resultList=data.sort(function(a,b){
                if(a[_nmuber]==""){
                    a[_nmuber]=0
                }
                if(b[_nmuber]==""){
                    b[_nmuber]=0
                }
                return (b[_nmuber]-a[_nmuber]);
            })
            that.setState({
                [stateKey]:new_resultList
            })
            $this.attr("data-sort","order");
            $this.find(".sort-icon").removeClass("sort-normal sort-order").addClass("sort-invert");
        }else{   //顺序
            new_resultList=data.sort(function(a,b){
                if(a[_nmuber]==""){
                    a[_nmuber]=0
                }
                if(b[_nmuber]==""){
                    b[_nmuber]=0
                }
                return (a[_nmuber]-b[_nmuber]);
            })
            that.setState({
                [stateKey]:new_resultList
            })
            $this.attr("data-sort","invert");
            $this.find(".sort-icon").removeClass("sort-normal sort-invert").addClass("sort-order");
        }
    }
}
export default SortTimeJs;