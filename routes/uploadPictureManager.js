var http = require('http'),
    path = require('path'),
    formidable = require('formidable'),
    sys = require('sys'),
    qn = require('qn'),
    uuid = require('node-uuid'),
    fs = require('fs'),
    im = require('imagemagick'),
    mv = require('mv');

//用户的
var client = qn.create({
    accessKey: 'lgNuU4zURArmOuiFJM9Wk3sX5Ez4srGNGia0mBY6',
    secretKey: 'b4TiOpVQC1q5rfLOnU6MeXvuSv8I8glaK5OAjpgs',
    bucket: 'medicaimprove',
    domain: '7xocwz.com1.z0.glb.clouddn.com ',
});

exports.uploadRawPictureToQiniu = function(req, res) {
    console.log(new Date());
    var form = new formidable.IncomingForm();
    console.log(form);
    form.on('error',function(err){
        console.log(err);
    })
    form.parse(req, function(err, fields, files) {

        console.log(files);

        // sys.inspect({
        //     fields: fields,
        //     files: files
        // });


        var tmp_path = files.file.path;
        var filename = uuid.v4() + path.extname(files.file.name);
        console.log(tmp_path);
        console.log(filename);

        var target_path = './public/image/' + filename;
        // console.log(tmp_path);
        // console.log(filename);
        // move the file from the temporary location to the intended location
        // mv(tmp_path, target_path, function(err) {
            if (err) throw err;
            var result;
            // console.log(err);
            // if (err){
            //   result = {
            //     'code':404,'success':false, 
            //     'action':'uploadPictureToQiniu',
            //     'err':err
            //   };
            // } else {
            //   result = {
            //   'code':200,'success':true, 
            //   'action':'uploadPictureToQiniu', 
            //   // 'url':success.url,
            //   'fileName':filename
            //   };
            // }

            var final_path = './public/image/' + filename;
            var qiniuUniqueFilePath = uuid.v4() + path.extname(files.file.name);

            client.uploadFile(tmp_path, {
                key: qiniuUniqueFilePath
            }, function(err, success) {

                var result;
                console.log(err);
                if (err) {
                    result = {
                        'code': 404,
                        'success': false,
                        'action': 'uploadPictureToQiniu',
                        'err': err
                    };
                } else {
                    console.log(success.url.replace(/\s/g,""));
                    result = {
                        'code': 200,
                        'success': true,
                        'action': 'uploadPictureToQiniu',
                        'url': success.url.replace(/\s/g,""),
                        'fileName': filename
                    };
                }
                res.header("Access-Control-Allow-Origin", "*");
                res.jsonp(result);
            })

       // })
    })
}
var result = {
    'code': '',
    'action': '',
    'success': '',
    'message': '',
    'data': ''
};

exports.uploadAppPictureToQiniu = function(req, res) {
    // console.log(req.body.imgData);
    var imgData = req.body.imgData.split('--');
    // console.log(imgData);
    var ite = 0;
    var target_arr = new Array();
    recursiveUpdateDishInShortSupply(ite, imgData.length, imgData, target_arr, function(final_results) {

        var final_arr = new Array();
        for (var i = 0; i < imgData.length; ++i) {
            if (i == 0) {
                final_arr = final_arr + final_results[i];
            } else {
                final_arr = final_arr + '--' + final_results[i];
            }
        }
        //var result;
        result.code = 200;
        result.action = 'uploadAppPictureToQiniu';
        result.success = true;
        result.data = final_arr;
        result.message = "批量【停售/恢复】";
        res.json(result);
    })
}

function recursiveUpdateDishInShortSupply(i, len, ori_arr, in_short_supply, fn) {
    if (i == len) {
        return fn(in_short_supply);
    } else {
        // console.log(555555);
        // console.log(i);
        // console.log(ori_arr[i].length);
        // console.log(ori_arr[i]);
        if (ori_arr[i].length <= 78) {
            in_short_supply.push(ori_arr[i]);
            return recursiveUpdateDishInShortSupply(i + 1, len, ori_arr, in_short_supply, fn);
        } else {

            var base64Data = ori_arr[i].replace(/^data:image\/\w+;base64,/, "");
            var dataBuffer = new Buffer(base64Data, 'base64');
            // var target_path = './public/images/' + filename;
            var filename = './public/image/' + uuid.v4() + ".png";
            // console.log(filename);

            // var fileName = '/image/'+uuid.v4()+ ".png";

            fs.writeFile(filename, dataBuffer, function(err) {


                var qiniuUniqueFilePath = uuid.v4() + ".png"; //randomize unique path for the picture
                // console.log(qiniuUniqueFilePath);
                if (err) {
                    console.log(err);
                } else {
                    in_short_supply.push(filename);
                    return recursiveUpdateDishInShortSupply(i + 1, len, ori_arr, in_short_supply, fn);
                    // client.uploadFile(filename, {
                    //     key: qiniuUniqueFilePath
                    // }, function(err, success) {
                    //      in_short_supply.push(success.url);
                    //       console.log(success);
                    //       return recursiveUpdateDishInShortSupply(i+1,len,ori_arr,in_short_supply,fn);                  
                    // });
                }
            });
        }
    }
}

//删除文件
exports.deleteFile = function(req, res) {
    fs.unlink('./public/images/' + req.body.fileName, function(err) {
        if (err) throw err;
        console.log('successfully deleted');
        result = {
            'code': 200,
            'success': true,
            'action': 'deleteFile',
            'message': "删除文件成功"
        };
        res.json(result);
    });
}
