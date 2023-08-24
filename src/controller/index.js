const { validateUser } = require('../service/user');
const db = require('../db');

async function addUser(ctx) {
    const body = ctx.request.body;
    const { username, userpasswd } = body;
    if (username && userpasswd) {
        try {
            const hasUser = await validateUser(username);
            if (!hasUser) {
                const result = await db.query(`
      insert into moral_user (username,userpasswd)
      values ('${username}','${userpasswd}');
    `);
                if (result.status === 200) {
                    ctx.body = {
                        code: 200,
                        message: '用户创建成功',
                    };
                } else if (result.status === 400) {
                    ctx.body = {
                        code: 401,
                        message: '连接错误,请重新再试',
                    };
                } else {
                    ctx.body = {
                        code: 500,
                        message: '服务器连接失败',
                    };
                }
            } else {
                ctx.body = {
                    code: 400,
                    message: '该用户已存在',
                };
            }
        } catch (e) {
            console.log(e);
        }
    }
}

async function deleteUser(ctx) {
    const body = ctx.request.body;
    const { username } = body;
    if (username) {
        try {
            const hasUser = await validateUser(username);
            if (hasUser) {
                const result = await db.query(`
      delete from moral_user where username="${username}"  `);
                if (result.status === 200) {
                    ctx.body = {
                        code: 200,
                        message: '用户删除成功',
                    };
                } else if (result.status === 400) {
                    ctx.body = {
                        code: 401,
                        message: '数据库连接错误,请重新再试',
                    };
                } else {
                    ctx.body = {
                        code: 500,
                        message: '服务器连接失败',
                    };
                }
            } else {
                ctx.body = {
                    code: 400,
                    message: '该用户不存在存在',
                };
            }
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = {
    addUser,
    deleteUser,
};
