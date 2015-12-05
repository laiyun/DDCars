var express = require('express');
var app = require('express')();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var connection = require('express-myconnection');

// var routes = require('./routes/index');
var users = require('./routes/users');
var uploadPictureManager = require('./routes/uploadPictureManager');

app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, uploadDir: __dirname + '/public/images' }));
app.use(cookieParser());
app.use(session({
    secret: 'medicalImprove',
    name: 'medicalImprove',
    cookie: {maxAge: 300000},
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true,
//     uploadDir: __dirname + '/public/images'
// }));


// app.use('/', routes);

app.post('/login', users.login); //登录
app.post('/getUser', users.getUser); // 查询用户信息
app.post('/register', users.register); // 用户注册
app.post('/checkMobileRegistry', users.checkMobileRegistry); // 查询手机号是否已被注册
app.post('/checkSmsCode', users.checkSmsCode); // 校验验证码
app.post('/sendSmsCode', users.sendSmsCode); // 发送验证码
app.post('/updatePassword', users.updatePassword); // 更新用户密码
app.post('/setNewPassword', users.setNewPassword); // 设置新密码
app.post('/updateName', users.updateName); // 更新用户名
app.post('/autoLogin', users.autoLogin); // 自动登录
app.post('/hasLogin', users.hasLogin); // 判断用户是否已登录

/*
后台登陆
*/
app.post('/loginr', users.loginr); //管理员登陆
app.post('/updateSilder', users.updateSilder); // 更新轮播
app.post('/caseCreate', users.caseCreate); // 创建案列
app.post('/getCase', users.getCase); // 查询所有案列
app.post('/caseDelete', users.caseDelete); // 删除案列
app.post('/findCases', users.findCases); // 查询需修改的案列
app.post('/updateCases', users.updateCases); // 修改案列
app.post('/getRemarks', users.getRemarks); // 查询所有silder
app.post('/createSilder', users.createSilder); // 查询所有silder
app.post('/deleteRemarks', users.deleteRemarks); //删除所有silder

//七牛上传照片
app.post('/uploadRawPictureToQiniu', uploadPictureManager.uploadRawPictureToQiniu);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var http = require('http').Server(app);
http.listen(7777, function() {
    console.log('MedicalImprove listening on *:7777');
});


// module.exports = app;
