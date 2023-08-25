const db = require('../db');

async function addRule(ctx) {
    const body = ctx.request.body;
    const { rule, username } = body;
    if (username && rule) {
        try {
            const result = await db.query(`
                INSERT INTO 'moral_rule' (rule,create_user)
                VALUES ('${JSON.stringify(rule)}', '${username}');
            `);
            if (result.status === 200) {
                ctx.body = {
                    code: 200,
                    message: '规则创建成功',
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

async function getRule(ctx) {
    try {
        const result = await db.query(`
            SELECT * FROM moral_rule ORDER BY create_time DESC
        `);
        const data = result.results;
        data.forEach(item => {
            item.rule = JSON.parse(item.rule);
            item.create_time = Math.round(new Date(item.create_time).getTime());
            delete item.isdeleted;
        })
        if (result.status === 200) {
            ctx.body = {
                code: 200,
                data,
                message: '规则查询成功',
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
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    addRule,
    getRule,
};
