const db = require('../db');

const tableName = 'moral_user';
const tableNameNote = 'SJJY_USERNOTE';

// 校验用户是否已存在
async function validateUser(username) {
    const sql = `
    SELECT * FROM ${tableName} 
    WHERE username = '${username}' 
    AND isdeleted <> 1
  `;
    const results = await db.query(sql);
    if (results.status === 200) {
        return results.results.length > 0;
    } else {
        throw '数据库错误';
    }
}

// 添加用户
async function userAdd(data) {
    const reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
    const cardIdReg =
        /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (
        !data ||
        !data.name ||
        !data.phone ||
        !reg.test(data.phone) ||
        !cardIdReg.test(data.cardId) ||
        !data.role
    ) {
        return '参数错误';
    }

    // 校验当前用户是否已经提交
    const validateResult = await validateUser(data.phone, true);

    const validateFlag = validateResult && validateResult.rows && validateResult.rows.length > 0;

    let sql = '';

    if (validateFlag) {
        // 用户表信息有该条记录
        const timesData = (await userAddTimes(data.phone)).rows[0].TOTAL;
        if (timesData >= 3) {
            // 查看駁回次數
            return '操作失败，您申请账号次数过多，请联系管理员';
        } else {
            // 更新该条记录
            sql = `
        update ${tableName} set NAME = '${data.name}',
          PHONE = '${data.phone}',
          ROLE =  ${data.role},
          QX =  ${data.qx ? `'${data.qx}'` : null},
          JD = ${data.jd ? `'${data.jd}'` : null},
          SQ = ${data.sq ? `'${data.sq}'` : null},
          AAC002 = ${data.cardId ? `'${data.cardId}'` : null},
          AREA_CODE = ${data.code ? `'${data.code}'` : null},
          update_time = sysdate
        where phone = '${data.phone}'
      `;
        }
    } else {
        // 写入当前用户信息在用户表
        sql = `
      insert into ${tableName}(ID, NAME, PHONE, ROLE, QX, JD, SQ, AAC002, AREA_CODE, CREATE_TIME) values (
        sys_guid(),
        '${data.name}',
        '${data.phone}',
        ${data.role},
        ${data.qx ? `'${data.qx}'` : null},
        ${data.jd ? `'${data.jd}'` : null},
        ${data.sq ? `'${data.sq}'` : null},
        ${data.cardId ? `'${data.cardId}'` : null},
        ${data.code ? `'${data.code}'` : null},
        sysdate
      )
    `;
    }
    const result = await sqlAction(sql);
    return result && result.rowsAffected ? null : '操作失败';
}

// 查询用户列表
async function userList(data) {
    const { role, qx, jd, code } = data;
    let addSql = '';

    if (role === '0') {
        // 市级
        addSql = `and role in ('0', '1')`;
    } else if (role === '1') {
        // 区县
        addSql = `and role in ('1', '2') and AREA_CODE like '%${code}%'`;
    } else if (role === '2') {
        // 街道
        addSql = `and role in ('2', '3') and AREA_CODE like '%${code}%'`;
    }

    const sql = `
    select c.*,
      a.num times, 
      to_char(d.create_time, 'yyyy-mm-dd HH24:mi:ss') new_time
    from (
      select ID, name, phone, role, status, admin,
        to_char(create_time, 'yyyy-mm-dd HH24:mi') create_time,
        to_char(update_time, 'yyyy-mm-dd HH24:mi:ss') update_time,
        qx, jd, sq
      from ${tableName}
      where 1 = 1 ${addSql ? addSql : ''}
    ) c
    left join (select userphone, count(1) num from ${tableNameNote} where note_type = 'reject' group by userphone) a 
    on c.phone=a.userphone
    left join
    (
      select userphone,create_time from ( 
        select userphone,create_time,row_number() over (partition by userphone order by create_time desc) rn from ${tableNameNote}
      ) v where v.rn=1
    ) d 
    on c.phone=d.userphone order by c.status, c.role, c.admin desc
  `;
    return await sqlAction(sql);
}

// 查询用户申请次数
async function userAddTimes(phone) {
    const countSql = `
    select count(*) total from ${tableNameNote} where userphone = '${phone}' and note_type = 'reject'
  `;
    return await sqlAction(countSql);
}

// 查询用户详情
async function userDetail(phone) {
    const sql = `
    select * from ${tableName} where phone = '${phone}'
  `;
    const noteSql = `
    select * from ${tableNameNote} where userphone = '${phone}' and create_time = (
      select max(create_time) from ${tableNameNote} where userphone = '${phone}' and note_type = 'reject'
    )
  `;

    const sqlFn = sqlAction(sql);
    const noteFn = sqlAction(noteSql);
    const countFn = userAddTimes(phone);

    const baseData = (await sqlFn).rows[0];
    const noteData = (await noteFn).rows[0];
    const countData = (await countFn).rows[0].TOTAL;

    return {
        ...baseData,
        NOTE: noteData ? noteData.NOTE : null,
        NOTE_TIME: noteData ? noteData.CREATE_TIME : null,
        TIMES: countData,
    };
}

// 操作用户
async function userAction(handleUserPhone, phone, type, commit, adminType) {
    let commitData = commit;
    if (['admin', 'delete'].includes(type)) {
        // 设置为管理员或者删除账号
        let sql = '';
        let sqlNoteD = '';
        if (type === 'admin') {
            sql = `
        update ${tableName} set ${adminType ? 'admin = 0' : 'admin = 1'}
        where phone = '${phone}'
      `;
            commitData = adminType ? '【sys】取消管理员' : '【sys】设置为管理员';
        } else {
            sql = `
        delete ${tableName} where phone = '${phone}'
      `;
            // 删除驳回记录
            sqlNoteD = `
        delete ${tableNameNote} where userphone = '${phone}' and note_type = 'reject'
      `;
            commitData = '【sys】删除账号';
        }
        await sqlAction(sql);
        sqlNoteD && (await sqlAction(sqlNoteD));
    } else {
        // 审核账号
        const status = type === 'inject' ? 1 : 0; // inject 通过， reject 驳回
        if (status) {
            const updateSql = `
          update ${tableName} set status = 1,
                          confirm_time = sysdate
          where phone = '${phone}'
        `;
            await sqlAction(updateSql);
            commitData = commitData ? commitData : '【sys】审核通过';
        }
    }

    // 记录操作记录
    const sqlNote = `
    insert into ${tableNameNote}(ID, HANDLEUSERPHONE, USERPHONE, NOTE, CREATE_TIME, NOTE_TYPE) values (
      sys_guid(),
      '${handleUserPhone}',
      '${phone}',
      '${commitData ? commitData : ''}',
      sysdate,
      '${type}'
    )
  `;
    const actionData = await sqlAction(sqlNote);
    return actionData && actionData.rowsAffected ? null : '操作失败';
}

module.exports = {
    userAdd,
    validateUser,
    userList,
    userDetail,
    userAction,
};
