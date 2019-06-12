const { getList, getDetail, newBlog, updateBlog, delBlog } = require('../controller/blog')
const { SuccessModel, ErrorModel } = require('../model/resModel')

//统一的登录验证
const loginCheck = (req) => {
    if(!req.session.userName){
        return Promise.resolve(
            new ErrorModel('尚未登录')
        )
    }
}

const handleBlogRouter = (req,res) => {
    const method = req.method
    const id = req.query.id || ''

    // 获取博客列表
    if (method === 'GET' && req.path === '/api/blog/list'){
        const author = req.query.author || ''
        const keyword = req.query.keyword || ''
        const result = getList(author,keyword)
        return result.then(listData => {
            return new SuccessModel(listData)
        })
    }

    // 获取博客详情
    if (method === 'GET' && req.path === '/api/blog/detail'){
        const result = getDetail(id)
        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 新建博客
    if (method === 'POST' && req.path === '/api/blog/new'){
        // 登录验证
        const loginCheckResult = loginCheck(req)

        if(loginCheckResult) {
            return loginCheckResult
        }

        req.body.author = req.session.userName
        const result = newBlog(req.body)
        return result.then(data => {
            return new SuccessModel(data)
        })
    }

    // 更新博客
    if (method === 'POST' && req.path === '/api/blog/update'){
        // 登录验证
        const loginCheckResult = loginCheck(req)

        if(loginCheckResult) {
            return loginCheckResult
        }

        const result = updateBlog(id, req.body)
        return result.then(data => {
            if(data){
                return new SuccessModel(data)
            }else {
                return new ErrorModel('更新博客失败')
            }
        })

    }

    // 删除博客
    if (method === 'POST' && req.path === '/api/blog/del'){
        // 登录验证
        const loginCheckResult = loginCheck(req)

        if(loginCheckResult) {
            return loginCheckResult
        }

        const author = req.session.userName
        const result = delBlog(id,author)
        return result.then(data => {
            if(data) {
                return new SuccessModel(data)
            }else {
                return new ErrorModel('删除博客失败')
            }
        })
    }
}

module.exports = handleBlogRouter