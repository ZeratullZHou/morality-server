const { validateUser } = require('../service/user');
const db = require('../db');

async function addUser(ctx) {
    const body = ctx.request.body;
    const { username, userpasswd, name } = body;
    console.log(body);
    if (username && userpasswd && name) {
        try {
            const hasUser = await validateUser(username);
            if (!hasUser) {
                const result = await db.query(`
      insert into moral_user (username,userpasswd,name)
      values ('${username}','${userpasswd}', '${name}');
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
    } else {
        ctx.body = {
            code: 400,
            message: '缺少请求参数',
        };
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
      UPDATE moral_user  SET isdeleted = 1  WHERE username="${username}"`);
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
    } else {
        ctx.body = {
            code: 400,
            message: '缺少请求参数',
        };
    }
}

async function setUserScore(ctx) {
    const body = ctx.request.body;
    const { username, score } = body;
    if (username && (score || isNaN(score))) {
        try {
            const hasUser = await validateUser(username);
            if (hasUser) {
                const result = await db.query(`
      UPDATE moral_user SET score = "${parseInt(score)}" WHERE username="${username}"  `);
                if (result.status === 200) {
                    ctx.body = {
                        code: 200,
                        message: '分数更新成功',
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
                    message: '该用户不存在存在',
                };
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        ctx.body = {
            code: 400,
            message: '缺少请求参数',
        };
    }
}

async function selectUser(ctx) {
    const params = ctx.query;
    const { username, userpasswd } = params;
    if (username && userpasswd) {
        try {
            const hasUser = await validateUser(username);
            if (hasUser) {
                const result = await db.query(`
      SELECT * from moral_user  WHERE (username = '${username}');
    `);
                if (result.status === 200) {
                    const data = result.results[0];

                    if (userpasswd === data.userpasswd) {
                        ctx.body = {
                            code: 200,
                            data: {
                                name: data.name,
                                score: data.score,
                            },
                            message: '查询用户成功',
                        };
                    } else {
                        ctx.body = {
                            code: 500,
                            message: '用户密码错误',
                        };
                    }
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
                    message: '该用户不存在',
                };
            }
        } catch (e) {
            console.log(e);
        }
    } else {
        ctx.body = {
            code: 400,
            message: '缺少请求参数',
        };
    }
}

module.exports = {
    addUser,
    deleteUser,
    setUserScore,
    selectUser,
};
