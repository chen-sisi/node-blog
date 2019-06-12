const { exec } = require('../db/createMysql')

const getList = (author, keyword) => {
    let sql = `select * from blogs where 1=1 `
    if(author) {
        sql += `and author='${author}' `
    }
    if(keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql += `order by createTime desc;`

    // 返回 promise
    return exec(sql)
}

const getDetail = (id) => {
    const sql = `select * from blogs where id = '${id}';`
    return exec(sql).then(rows => {
        return rows[0]
    })
}

const newBlog = (blogData = {}) => {
    const title = blogData.title;
    const content = blogData.content;
    const author = blogData.author;
    const createTime = Date.now()

    const sql = `insert into blogs (title, content, createTime, author) values ('${title}', '${content}', ${createTime}, '${author}');`

    return exec(sql).then(insertData => {
        console.log('insertData is ', insertData);
        return {
            id:insertData.insertId
        }
    })
}

const updateBlog = (id, blogData = {}) => {
    const title = blogData.title;
    const content = blogData.content;

    const sql = `update blogs set title='${title}', content='${content}' where id=${id};`

    return exec(sql).then(updateData => {
        if(updateData.affectedRows > 0){
            return true
        }
        return false
    })

}

const delBlog = (id,author) => {
    //软删除
    const sql = `update blogs set state=${0} where id=${id} and author='${author}';`

    //直接删除
    //const sql1 = `delete from blogs where id=${id} and author='${author}';`

    return exec(sql).then(delDate => {
        if(delDate.affectedRows > 0){
            return true
        }
        return false
    })
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    delBlog
}