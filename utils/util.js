module.exports = {
    // 对请求结果统一封装处理
    handleResponse(err, response, body){
        if(!err && response.statusCode== 200){
            let data = JSON.parse(body);

            if(data && !data.errcode){
                return this.handleSuc(data)
            }else{
                return this.handleFail(data.errmsg,data.errcode)
            }
        }else{
            return this.handleFail(err, 10009)
        }
    },
    handleSuc(data=''){
        return {
            code: 0,
            data,
            message: ''
        }
    },
    handleFail(message='',code=10001){
        return {
            code,
            data:'',
            message
        }
    }
}