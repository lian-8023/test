//input框输入校验
import $ from 'jquery';
class VerifyJs{
    static deal($this,$parent,master,msg){
        master= master ? master : "";
        if($parent.find(".tipHtml").length<1){
            // $parent.css("position","relative").append(tipHtml);
            $parent.css("position","relative");
            $this.addClass("warnBg");
            return false;
        }
    }
    static normal($parent,$this){
        $parent.css("position","static")
        $this.removeClass("warnBg");
        $parent.find(".tipHtml").remove();
    }
    /**
     * 公用input框验证方法
     * @param {*} type        类型:telePhone 座机号码,cellPhone 手机号码,bankCard 银行卡号;IDCard 身份证号码; number 数字类型;
     * @param {*} allowNull   判断是否为空,allowNull 允许为空,notNull 不允许为空
     * @param {*} _isNaN      判断是否必须为数字: isNaN 必须为数字,auto 不是必须为数字
     * @param {*} master      alert 信息时,附带上校验项目名
     */
    verify(type,allowNull,_isNaN,master,event){
        if(!event || !event.target){
            return;
        }
        let $this=$(event.target);
        let $parent=$this.parent();
        let _value=$this.val();
        let _valueLength=_value.length;

        if(allowNull && allowNull=="notNull"){  //非空判断
            if(_valueLength<=0){
                VerifyJs.deal($this,$parent,master,'不能为空！');
                return false;
            }
            VerifyJs.normal($parent,$this);
        }

        if(_isNaN && _isNaN=="isNaN"){  //是否必须为数字
            if(isNaN(_value)){
                VerifyJs.deal($this,$parent,master,'必须是数字！');
                return false;
            }
            VerifyJs.normal($parent,$this);
        }

        if(type && type=="cellPhone"){  //手机号码
            if(_valueLength>0 && !(/^1[3|4|5|6|7|8|9][0-9]\d{4,8}$/.test(_value))){ 
                VerifyJs.deal($this,$parent,master,'不是完整的11位！');
                return false;
            }
            VerifyJs.normal($parent,$this);
        }
        
        if(type && type=="bankCard"){  //银行卡号
            if(_valueLength<15 || _valueLength>19){
                VerifyJs.deal($this,$parent,master,'为15到19位！');
                return false;
            }
            VerifyJs.normal($parent,$this);
        }

        if(type && type=="IDCard"){  //身份证号码
            let reg=/^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
            if(!reg.test(_value)){
                VerifyJs.deal($this,$parent,master,'输入有误，请重新输入！');
                return false;
            }
            VerifyJs.normal($parent,$this);
        }
        
    }

    /**
     * select 必填
     */
    verifyS(event){
        if(!event || !event.target){
            return;
        }
        let $this=$(event.target);
        let _value=$this.find("option:selected").text();

        if(_value=="请选择"){
            $this.addClass("warnBg");
            return false;
        }
        $this.removeClass("warnBg");
    }
}
export default VerifyJs;