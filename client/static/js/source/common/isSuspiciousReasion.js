import $ from 'jquery';

// 勾选是否可疑，展示可疑原因
class IsSuspiciousReasion{
    /**
     * _data ajax可疑原因数组
     * isisSuspicious_yes  选择 是 可疑
     * isisSuspicious_no   选择 否 可疑
     * isisSuspicious_NOTSURE  选择 不确定 可疑
     */
    get_SuspiciousReasion(_data,isisSuspicious_yes,isisSuspicious_no,isisSuspicious_NOTSURE){
        var SuspiciousReasion=[];
        if(typeof(_data)=="undefined"){
            return;
        }
        if(isisSuspicious_yes){
            for(let i=0;i<_data.length;i++){
                let _data_i=_data[i];
                if(_data_i.value==1){    // 1 对应 可疑
                    SuspiciousReasion.push(_data_i);
                }
            }
        }else if(isisSuspicious_no){
            for(let i=0;i<_data.length;i++){
                let _data_i=_data[i];
                if(_data_i.value==0){    //0 对应 否
                    SuspiciousReasion.push(_data_i);
                }
            }
        }else if(isisSuspicious_NOTSURE){
            for(let i=0;i<_data.length;i++){
                let _data_i=_data[i];
                if(_data_i.value==2){    //2 对应 不确定
                    SuspiciousReasion.push(_data_i);
                }
            }
        }
        return SuspiciousReasion;
    }
}
export default IsSuspiciousReasion;