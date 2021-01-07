module.exports = function(){
	if(typeof Code == "undefined"||"null"){
		this.Code = {
			SUCCESSFULLY: '1',
			FAILED: '0',
			EXCEPTION: '-2',
			loginCode:'-3'
		}
　　　}
	this.request_result_obj = function(_code,_msg,_data){
		var _obj={
			"code":_code,
			"msg":_msg,
			"data":_data
		};
		return _obj;
	}
}
