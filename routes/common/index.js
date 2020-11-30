/**
 * @description 微信接口统一封装处理
 */
let request = require('request');
let config = require('../pay/config');
let util = require('../../utils/util')
exports.getAccessToken = function(code){
    let tokenUrl = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${config.wx.appId}&secret=${config.wx.appSecret}&code=${code}&grant_type=authorization_code`
    return new Promise((resolve,reject)=>{
        request.get(tokenUrl,function(err, response, body){
            let result = util.handleResponse(err, response, body)
            resolve(result)
        })
    })
}

exports.getUserInfo = function(accessToken, openId){
    return new Promise((resolve,reject)=>{
        let userinfo = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openId}&lang=zh_CN`
        request.get(userinfo,function(err, response, body){
            let result = util.handleResponse(err, response, body)
            resolve(result)
        })
    }).catch((err)=>{
        console.log('err===',err)
    })
}