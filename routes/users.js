var hash = require('../routes/pass').hash;
var User = require('../models/v1/user');
var Remarkss = require('../models/v1/remarks');
var Cases = require('../models/v1/cases');
var uuid = require('node-uuid');
var AVOS = require('avoscloud-sdk').AV;
var moment = require('moment');

var thunkify = require('thunkify');
var co = require('co');

var CODE = require('../common/Constants').CODE;

AVOS.initialize("c8KecFXMrxBG8JROsd12KQN9", "NRj7NfCJIKQSaGU5x6Pp8JSw");

var result = {
    'code': '',
    'action': '',
    'success': '',
    'message': '',
    'data': ''
};


function queryUserFn(condition, callback) {
    User.find({
        where: condition
    }).then(function(user) {
        callback(null, user);
    })
};
var queryUser = thunkify(queryUserFn);

function queryCaseFn(condition, callback) {
    Cases.findAll({
         
    }).then(function(cases) {
        callback(null, cases);
    })
};
var queryCase = thunkify(queryCaseFn);

/*
查询所有silder
*/
function queryRemarksFn(condition, callback) {
    Remarkss.findAll({
         order: 'weight DESC'
    }).then(function(remarkss) {
        callback(null, remarkss);
    })
};
var queryRemarks = thunkify(queryRemarksFn);

/*
删除所有silder
*/
function deleteRemarksFn(condition, callback) {
    console.log(condition,"进");
    Remarkss.destroy({
        where: condition
    }).then(function(remarkss) {
        callback(null, remarkss);
    })
};
var deleteRemarks = thunkify(deleteRemarksFn);

function findCaseFn(condition, callback) {
    Cases.find({
        where: condition
    }).then(function(cases) {
        callback(null, cases);
    })
};
var findCase = thunkify(findCaseFn);


function getUserHashFn(password, salt, callback) {
    hash(password, salt, function(err, hash) {
        callback(null, hash);
    });
};
var getUserHash = thunkify(getUserHashFn);


function verifySmsCodeFn(smsCode, callback) {
    AVOS.Cloud.verifySmsCode(smsCode)
        .then(
            function() {
                callback(null, CODE.SUCCESS);
            },
            function(err) {
                callback(null, CODE.SMS_CODE_INVALID);
            }
        );
};
var verifySmsCode = thunkify(verifySmsCodeFn);


function registerUserFn(password, mobile, name, gender, callback) {
    hash(password, function(err, salt, hash) {

        console.log('registerUserFn salt=' + salt + ' hash=' + hash);

        // 加密处理失败
        if (err) {
            callback(null, null);
        }
        // 生成用户数据
        else {
            User.create({
                user_id: GenerateUUIDV4(),
                mobile: mobile,
                salt: salt,
                hash: hash.toString(),
                reg_time: moment().format('YYYYMMDDHHmmss'),
                name: name,
                gender: gender
            }).then(function(user) {
                callback(null, user);
            })
        }
    });
};
var registerUser = thunkify(registerUserFn);


function createDescFn(picture_link, content, name, callback) {
    Cases.create({
        picture_link: picture_link,
        // links: links,
        content: content,
        name: name
    }).then(function(cases) {
        callback(null, cases);
    })
};
var createDesc = thunkify(createDescFn);

/*
循环创建
*/
function createSilderFn(weight, content, link, notes, type, callback) {
    // console.log(id);
    Remarkss.create({
        weight: weight,
        content: content,
        link: link,
        notes: notes,
        type: type
    }).then(function(remarkss) {
        // console.log(remarkss);
        callback(null, remarkss);
    });
};
var createSilder = thunkify(createSilderFn);


function caseDeleteFn(condition, callback) {
    // console.log(condition,"纳尼");
    Cases.destroy({
        where: condition
    }).then(function(cases) {
        callback(null, cases);
    })
};
var caseDelete = thunkify(caseDeleteFn);


function updatePasswordFn(user, password, callback) {

    hash(password, function(err, newSalt, newHash) {

        console.log('updatePassword password=' + password + ' newHash=' + newHash + ' newSalt=' + newSalt);
        user.updateAttributes({
            salt: newSalt,
            hash: newHash.toString()
        }).then(function(user) {
          console.log(user);
            callback(null, user);
        });
    });
};
var updatePassword = thunkify(updatePasswordFn);


function updateNameFn(name, userId, callback) {
    User.update({
        name: name
    }, {
        where: {
            user_id: userId
        }
    }).then(function(user) {
        callback(null, user);
    });
};
var updateName = thunkify(updateNameFn);

/*
 循环更新
*/
function updateSilderFn(weight, content, link, notes, id, type, callback) {
    // console.log(id);
    Remarkss.update({
        weight: weight,
        content: content,
        link: link,
        notes: notes,
        type: type
    }, {
        where: {
            id: id
        }
    }).then(function(remarkss) {
        // console.log(remarkss);
        callback(null, remarkss);
    });
};
var updateSilder = thunkify(updateSilderFn);


function updateCaseFn(picture_link, content, name, id, callback) {
    Cases.update({
        picture_link: picture_link,
        content: content,
        name: name
    }, {
        where: {
            id: id
        }
    }).then(function(cases) {
        callback(null, cases);
    });
};
var updateCase = thunkify(updateCaseFn);


function sendSmsCodeFn(mobile, callback) {

    AVOS.Cloud.requestSmsCode(mobile).then(
        function() {
            callback(null, CODE.SUCCESS);
        },
        function(err) {
            callback(null, CODE.INTERNAL_ERROR);
        });
};
var sendSmsCode = thunkify(sendSmsCodeFn);


function createSessionFn(req, callback) {
    req.session.regenerate(function(){
        callback(null, CODE.SUCCESS);
    });
}
var createSession = thunkify(createSessionFn);

/**
 * 查询用户
 * 参数：userId
 */
exports.getUser = function(req, res) {

    result.action = 'getUser';

    co(function*() {

        try {
            var condition = {
                user_id: req.body.userId
            };
            var user = yield queryUser(condition);

            // 找到用户
            if (user) {
                result.code = CODE.SUCCESS;
                result.data = user;
            }
            // 没有找到用户
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 判断用户是否已登录（Session中有Uesr信息）
 */
exports.hasLogin = function(req, res) {

    result.action = 'hasLogin';

    // 如果Session中有，判断为已登录
    if (req.session.user) {
        result.code = CODE.SUCCESS;
        result.data = req.session.user;
    } else {
        result.code = CODE.USER_NOT_LOGIN;
    }

    // 返回应答
    res.header("Access-Control-Allow-Origin", "*");
    res.jsonp(result);
    result.data = null;
}

/**
 * 用户自动登录
 * 参数：mobile 手机号
 *
 */
exports.autoLogin = function(req, res) {

    result.action = 'autoLogin';

    var mobile = req.body.mobile;
    console.log(result.action + ' mobile=' + mobile);

    co(function*() {

        try {

            // 根据手机号查找用户
            var condition = {
                mobile: mobile
            };
            var user = yield queryUser(condition);

            // 用户存在
            if (user) {
                console.log('用户自动登录成功');
                yield createSession(req);
                req.session.user = user;
                result.code = CODE.SUCCESS;
                result.data = user;
            }
            // 用户不存在
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 用户登录
 * 参数：mobile 手机号
 *      password 密码
 */
exports.login = function(req, res) {

    result.action = 'login';

    var mobile = req.body.mobile;
    var password = req.body.password;
    console.log(result.action + ' mobile=' + mobile + ' password=' + password);

    co(function*() {

        try {

            // 根据手机号查找用户
            var condition = {
                mobile: mobile
            };
            var user = yield queryUser(condition);
            console.log('user exist');

            // 用户存在
            if (user) {

                // 密码验证处理
                var hash = yield getUserHash(password, user.salt);
                console.log('Result hash=' + hash.toString());
                console.log('  User hash=' + user.hash);
                console.log(typeof hash.toString());
                console.log(typeof user.hash);

                // 验证处理错误
                if (!hash) {
                    result.code = CODE.INTERNAL_ERROR;
                }
                // 密码一致
                else if (hash.toString() == user.hash) {

                    // 用户信息保存在Session中
                    yield createSession(req);
                    req.session.user = user;

                    result.code = CODE.SUCCESS;
                    result.data = user;
                    console.log('登录OK');
                }
                // 密码错误
                else {
                    result.code = CODE.PASSWORD_INVALID;
                }
            }
            // 用户不存在
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/*
管理员登陆
*/
/**
 * 用户登录
 * 参数：mobile 手机号
 *      password 密码
 */
exports.loginr = function(req, res) {

    result.action = 'loginr';

    var mobile = req.body.mobile;
    var password = req.body.password;
    console.log(result.action + ' mobile=' + mobile + ' password=' + password);

    co(function*() {

        try {

            // 根据手机号查找用户
            var condition = {
                mobile: mobile
            };
            var user = yield queryUser(condition);
            console.log(condition);
            // 用户存在
            if (user) {

                // 密码验证处理
                var hash = yield getUserHash(password, user.salt);
                console.log('Result hash=' + hash.toString());
                console.log('  User hash=' + user.hash);
                console.log(typeof hash.toString());
                console.log(typeof user.hash);

                // 验证处理错误
                if (!hash) {
                    result.code = CODE.INTERNAL_ERROR;
                    console.log('验证处理错误');
                }
                // 密码一致判断是不是管理员
                else if (hash.toString() == user.hash && user.category == 1) {
                    result.code = CODE.SUCCESS;
                    result.data = user;
                    console.log('管理员登陆OK');
                }
                // 密码错误
                else {
                    result.code = CODE.PASSWORD_INVALID;
                    console.log('非管理员或密码错误');
                }
            }
            // 用户不存在
            else {
                result.code = CODE.USER_NOT_FOUND;
                console.log('用户不存在');
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 查询手机号是否已被注册
 * 参数：mobile 手机号
 */
exports.checkMobileRegistry = function(req, res) {

    result.action = 'checkMobileRegistry';

    var mobile = req.body.mobile;
    console.log(result.action + ' mobile=' + mobile);

    co(function*() {

        try {

            // 根据手机号查找用户
            var condition = {
                mobile: mobile
            };
            var user = yield queryUser(condition);

            // 用户存在
            if (user) {
                result.code = CODE.MOBILE_REGISTERED;
                console.log('用户存在');
            }
            // 用户不存在，可以注册
            else {
                result.code = CODE.SUCCESS;
                console.log('用户不存在，可以注册');
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

exports.checkSmsCode = function(req, res) {

    result.action = 'checkSmsCode';

    var smsCode = req.body.smsCode;
    console.log(result.action + ' smsCode=' + smsCode);

    co(function*() {
        try {
            // 校验验证码
            var code = yield verifySmsCode(smsCode);
            result.code = code;
            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 用户注册
 * 参数：mobile 手机号
 *      password 密码
 *      name 用户名
 *      gender 性别
 *      smsCode 短信验证码
 */
exports.register = function(req, res) {

    result.action = 'register';

    var password = req.body.password;
    var mobile = req.body.mobile;
    var name = req.body.name;
    var gender = req.body.gender;

    console.log(result.action + ' password=' + password + ' mobile=' + mobile + ' name=' + name + ' gender=' + gender);

    co(function*() {
        try {
            // 注册用户
            var user = yield registerUser(password, mobile, name, gender)

            // 注册成功
            if (user) {
                result.code = CODE.SUCCESS;
                result.data = user;
            }
            // 注册失败
            else {
                result.code = CODE.INTERNAL_ERROR;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}
/**
添加案列
    picture_link: picture_link,
    link: link,
    content: content
 */
exports.caseCreate = function(req, res) {

    result.action = 'caseCreate';

    var picture_link = req.body.picture_link;
    // var links = req.body.links;
    var content = req.body.content;
    var name = req.body.name;
    console.log(picture_link);
    // console.log(links);
    console.log(content);
    console.log(name);

    co(function*() {
        try {
            // 注册用户
            var cases = yield createDesc(picture_link, content, name)

            // 注册成功
            if (cases) {
                result.code = CODE.SUCCESS;
                result.data = cases;
            }
            // 注册失败
            else {
                result.code = CODE.INTERNAL_ERROR;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}


/**
找到修改的案列 findCase
 */
exports.findCases = function(req, res) {

    result.action = 'findCases';

    co(function*() {

        try {
            var condition = {
                id: req.body.id
            };
            var user = yield findCase(condition);

            // 找到用户
            if (user) {
                result.code = CODE.SUCCESS;
                result.data = user;
            }
            // 没有找到用户
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
查询所有case
 */
exports.getCase = function(req, res) {

    result.action = 'getCase';

    co(function*() {

        try {
            var condition = {
              
            };
            // var cases = yield queryCase(condition);

            var cases = yield queryCase(condition);
            // 找到用户
            if (cases) {
                result.code = CODE.SUCCESS;
                result.data = cases;
            }
            // 没有找到用户
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/*
查询所有silder
*/
exports.getRemarks = function(req, res) {

    result.action = 'getRemarks';

    co(function*() {

        try {
            var condition = {
              
            };

            var cases = yield queryRemarks(condition);
            // 找到silder
            if (cases) {
                result.code = CODE.SUCCESS;
                result.data = cases;
            }
            // 没有找到silder
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}
/*
删除案列
*/
exports.caseDelete = function(req, res) {

    result.action = 'caseDelete';

    var id = req.body.id;
    console.log(id);

    co(function*() {
        try {
            var condition = {
                id: id
            };
            // 注册用户
            var cases = yield caseDelete(condition)

            // 注册成功
            if (cases) {
                result.code = CODE.SUCCESS;
                result.data = cases;
            }
            // 注册失败
            else {
                result.code = CODE.INTERNAL_ERROR;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}
/*
删除所有silder
*/
exports.deleteRemarks = function(req, res) {

    result.action = 'deleteRemarks';

    co(function*() {
        try {
            var condition = {
              
            };
            var remarks = yield deleteRemarks(condition)

            // 删除所有成功
            if (remarks) {
                result.code = CODE.SUCCESS;
                result.data = remarks;
            }
            // 删除失败
            else {
                result.code = CODE.INTERNAL_ERROR;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}
/**
 * 发送验证码
 * 参数：mobile 手机号
 */
exports.sendSmsCode = function(req, res) {

    result.action = 'sendSmsCode';

    var mobile = req.body.mobile;
    console.log(result.action + ' mobile=' + mobile);

    co(function*() {
        try {
            result.code = yield sendSmsCode(mobile);
            console.log('发送成功');
        } catch (err) {
            console.error(err);
            console.log('发送失败');
        }

        // 返回应答
        res.header("Access-Control-Allow-Origin", "*");
        res.jsonp(result);
        result.data = null;
    });
}

/**
 * 设置新的用户密码
 * 参数：mobile 手机号
 *      password 新密码
 */
exports.setNewPassword = function(req, res) {

    result.action = 'setNewPassword';

    var mobile = req.body.mobile;
    var password = req.body.password;

    console.log('setNewPassword mobile=' + mobile + ' password=' + password);

    co(function*() {

        try {

            // 查找用户
            var condition = {
                mobile: mobile
            };
            var user = yield queryUser(condition);

            // 用户存在
            if (user) {

                // 更新用户密码
                user = yield updatePassword(user, password);
                result.code = CODE.SUCCESS;
                result.data = user;
            }
            // 用户不存在
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 修改用户登录密码
 * 参数：userId 用户ID
 *      oldPassword 原始密码
 *      password 新密码
 */
exports.updatePassword = function(req, res) {

    result.action = 'updatePassword';

    var userId = req.body.userId;
    var oldPassword = req.body.oldPassword;
    var password = req.body.password;

    co(function*() {
        try {

            // 查找用户
            var condition = {
                user_id: userId
            };
            var user = yield queryUser(condition);

            // 找到用户
            if (user) {

                // 取得原密码哈希值
                var hash = yield getUserHash(oldPassword, user.salt);

                // 哈希值一致
                if (hash.toString() == user.hash) {

                    // 更新用户密码
                    var user = yield updatePassword(user, password);
                    result.code = CODE.SUCCESS;
                    result.data = user;
                }
                // 哈希值不一致
                else {
                    result.code = CODE.PASSWORD_INVALID;
                }

            }
            // 未找到用户
            else {
                result.code = CODE.USER_NOT_FOUND;
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.error(err);
        }
    });
}

/**
 * 修改用户名
 * 参数：name 用户名
 *      userId 用户ID
 */
exports.updateName = function(req, res) {

    result.action = 'updateName';

    var userId = req.body.userId;
    var name = req.body.name;
    console.log(userId);
    console.log(name);

    co(function*() {
        try {

            var user = yield updateName(name, userId);

            // 更新成功
            if (user) {
                result.code = CODE.SUCCESS;
                result.data = user;
                console.log('更新成功');
            }
            // 更新失败
            else {
                result.code = CODE.INTERNAL_ERROR;
                console.log('更新失败');
            }

            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.log('有误');
            console.error(err);
        }
    });
}
/*循环创建createSilder
*/
exports.createSilder = function(req, res) {
    // deleteRemarks();

    result.action = 'createSilder';
    console.log("进入");
    var final_arr = req.body.final_arr;

    co(function*() {
        try {

            for (var i = 0; i < final_arr.length; i++) {
                var weight = final_arr[i].weight;
                var content = final_arr[i].content;
                var link = final_arr[i].links;
                var notes = final_arr[i].notes;
                var type = final_arr[i].type;
                var remarks = yield createSilder(weight, content, link, notes, type);
            }
            // 更新成功
            console.log(remarks);
            if (remarks) {
                result.code = CODE.SUCCESS;
                result.data = remarks;
                console.log('更新成功');
            }
            // 更新失败
            else {
                result.code = CODE.INTERNAL_ERROR;
                console.log('更新失败');
            }
            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.log('有误');
            console.error(err);
        }
    });
}
/*
 * 循环更新silder
        weight: weight,
        content: content,
        link: link,
        remarks: remarks,
        type: type
*/
exports.updateSilder = function(req, res) {
    result.action = 'updateSilder';
    console.log("进入");
    var cnt = req.body.cnt;

    var idArray = req.body.id.split(',');
    var weightArray = req.body.weight.split(',');
    var contentArray = req.body.content.split(',');
    var linkArray = req.body.link.split(',');
    var notesArray = req.body.notes.split(',');
    var typeArray = req.body.type.split(',');
    console.log(idArray);
    console.log(weightArray);
    console.log(contentArray);
    console.log(linkArray);
    console.log(notesArray);
    console.log(typeArray);

    co(function*() {
        try {


            for (var i = 0; i < cnt; i++) {
                var id = idArray[i];
                var weight = weightArray[i];
                var content = contentArray[i];
                var link = linkArray[i];
                var notes = notesArray[i];
                var type = typeArray[i];
                var remarks = yield updateSilder(weight, content, link, notes, id, type);
            }
            // 更新成功
            console.log(remarks);
            if (remarks) {
                result.code = CODE.SUCCESS;
                result.data = remarks;
                console.log('更新成功');
            }
            // 更新失败
            else {
                result.code = CODE.INTERNAL_ERROR;
                console.log('更新失败');
            }
            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.log('有误');
            console.error(err);
        }
    });
}
/*
更新案列
picture_link: picture_link,
content: content,
name: name,
updateCase
*/
exports.updateCases = function(req, res) {
    result.action = 'updateCases';
    console.log("进入");
    var cnt = req.body.cnt;

    var id = req.body.id;
    var picture_link = req.body.picture_link;
    var content = req.body.content;
    var name = req.body.name;
    console.log(id);
    console.log(picture_link);
    console.log(content);
    console.log(name);

    co(function*() {
        try {

             var cases = yield updateCase(picture_link, content, name, id);
            // 更新成功
            console.log(cases);
            if (cases) {
                result.code = CODE.SUCCESS;
                result.data = cases;
                console.log('更新成功');
            }
            // 更新失败
            else {
                result.code = CODE.INTERNAL_ERROR;
                console.log('更新失败');
            }
            // 返回应答
            res.header("Access-Control-Allow-Origin", "*");
            res.jsonp(result);
            result.data = null;
        } catch (err) {
            console.log('有误');
            console.error(err);
        }
    });
}
function GenerateUUIDV4() {
    var arr = uuid.v4().toString().split('-');
    var str = "";
    for (var i = 0; i < arr.length; ++i) {
        str += arr[i];
    }
    return str;
}


/*
找回密码第一步
*/
exports.iForgot = function(req, res) {
    console.log(req.body.mobile_phone);
    // console.log(req.body.validSmsCode);
    User
        .find({
            where: {
                mobile: req.body.mobile_phone
            }
        })
        .then(function(user) {
            console.log(user);
            if (user) {
                verifySmsCode(req, res, function(err, valid_result) {
                    if (err) {
                        result.code = 404;
                        result.action = 'forgotstep1';
                        result.success = false;
                        result.message = err;
                        res.json(result);
                    } else {
                        result.code = 200;
                        result.action = 'forgotstep2';
                        result.success = true;
                        result.message = '成功';
                        result.data = user;
                        res.json(result);
                        result.data = null;
                    }
                })
            }
        })
}

exports.iForgot1 = function(req, res) {
    User
        .find({
            where: {
                mobile: req.body.mobile_phone
            }
        })
        .then(function(user) {
            console.log(req.body.mobile_phone);
            if (user) {
                hash(req.body.password, function(err, salt, hash) {

                    if (err) throw err;
                    // store the salt & hash in the "db"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
                    new_user_salt = salt;
                    new_user_hash = hash.toString();

                    user
                        .updateAttributes({
                            salt: new_user_salt,
                            hash: new_user_hash
                        })
                        .then(function() {
                            var result = {
                                'code': 200,
                                'success': true,
                                'message': '密码修改成功'
                            };
                            res.json(result);
                        });

                });
            } else {
                result.code = 404;
                result.action = '';
                result.success = false;
                result.message = '没有该用户';
                res.json(result);
            }
        })
}
