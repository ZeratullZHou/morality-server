const mysqlDb = require('mysql');
const { dbConfig } = require('../config');
const pool = mysqlDb.createPool(dbConfig);
exports.query = function (sql, values) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                reject(err);
                //console.log(err, "数据库连接失败");
                resolve({
                    status: 500,
                });
            } else {
                //console.log("数据库连接成功");
                connection.query(sql, values, (err, results) => {
                    if (err) {
                        reject(err);
                        resolve({
                            status: 400,
                        });
                    } else {
                        connection.release();
                        resolve({
                            status: 200,
                            results,
                        });
                    }
                    //connection.release() // 释放连接池
                });
            }
        });
    });
};
