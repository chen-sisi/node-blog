const { login } = require('../controller/user')
const { SuccessModel, ErrorModel } = require('../model/resModel')
const { set } = require('../db/redis')

const handleUserRouter = (req,res) => {
    const method = req.method

    // 用户登录
    if (method === 'POST' && req.path === '/api/user/login'){
        const {userName, password} = req.body
        const result = login(userName, password)
        return result.then(data => {
            if(data.userName){
                // 设置 session
                req.session.userName = data.userName
                req.session.realName = data.realName

                //同步到redis
                set(req.sessionId, req.session)

                return new SuccessModel()
            }
            return new ErrorModel('用户登录失败')
        })
    }


}

module.exports = handleUserRouter