const querystring = require('querystring')
const handleBlogRouter = require('./src/router/blog')
const handleUserRouter = require('./src/router/user')

// session 数据
const SESSION_DATA = {}

const getPostData = (req) => {
    const promise = new Promise((resolve, reject) => {
        if(req.method !== 'POST'){
            resolve({})
            return
        }
        if(req.headers['content-type'] !== 'application/json'){
            resolve({})
            return
        }

        let postData = '';
        req.on('data',chunk => {
            postData += chunk.toString()
        })
        req.on('end',() => {
            if(!postData) {
                resolve({})
                return
            }
            // 返回
            resolve(
                JSON.parse(postData)
            )
        })
    })
    return promise
}

//获取 cookie 的过期时间
const getCookieExpires = () => {
    const d = new Date()
    d.setDate(d.getTime() + (24 * 60 * 60 * 1000))
    return d.toGMTString()
}

const serverHandle = (req,res) => {
    //设置返回数据格式
    res.setHeader('Content-type','application/json')

    //获取path
    const url = req.url
    req.path = url.split('?')[0]

    //解析query
    req.query = querystring.parse(url.split('?')[1])

    //解析cookie
    req.cookie = {}
    const cookieStr = req.headers.cookie || ''
    cookieStr.split(';').forEach(item => {
        if(!item) {
            return
        }
        const [key,val] = item.split('=')
        req.cookie[key.trim()] = val.trim()
    })

    // 解析session
    let needSetCookie = false
    let userId = req.cookie.userId
    if(userId) {
        if (!SESSION_DATA[userId]) {
            SESSION_DATA[userId] = {}
        }
    } else {
        needSetCookie = true
        userId = `${Date.now()}_${Math.random()}`
        SESSION_DATA[userId] = {}
    }
    req.session = SESSION_DATA[userId]

    getPostData(req).then(postData => {
        req.body = postData

        //处理 blog 路由
        const blogResult = handleBlogRouter(req,res)
        if(blogResult) {
            blogResult.then(blogData => {
                if(needSetCookie) {
                    res.setHeader('Set-Cookie',`userId=${userId}; path=/; httpOnly;expires=${getCookieExpires()}`)

                }

                res.end(
                    JSON.stringify(blogData)
                )
            })
            return
        }

        //处理 user 路由
        const userResult = handleUserRouter(req,res)
        if(userResult){
            userResult.then(userData => {
                if(needSetCookie) {
                    res.setHeader('Set-Cookie',`userId=${userId}; path=/; httpOnly;expires=${getCookieExpires()}`)

                }

                res.end(
                    JSON.stringify(userData)
                )
            })
            return
        }

        // 未命中路由
        res.writeHead(404,{"Content-type":"text/plain"})
        res.write("404 Not Found\n")
        res.end()
    })



}

module.exports = serverHandle