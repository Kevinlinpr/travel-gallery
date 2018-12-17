const express = require('express');
const formidable = require('formidable');
const app = express();
const port = 3750;
const http = require('http').Server(app);
const Gallery = require("./Gallery");
const MongoClient = require("mongodb").MongoClient;
let gallery = new Gallery();
//allow custom header and CORS
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method == 'OPTIONS') {
        res.send(200); /让options请求快速返回/
    }
    else {
        next();
    }
});

app.post('/',(req,res)=>{
    res.send('Got a POST request');
    let form = new formidable.IncomingForm();
    form.uploadDir = "tmpDir";
    form.keepExtensions = true;
    form.encoding = 'utf-8';
    form.parse(req,function (err, fields, files) {
        let oldpath,newpath;
        try {
            console.log("temppath: " + files.filepond.path);
            console.log("name: " + files.filepond.name);
            oldpath = files.filepond.path;
            let myDate = new Date();
            let content = files.filepond.name;
            let extname = path.extname(content);
            let md5 = crypto.createHash('md5');
            md5.update(content+myDate.getTime());
            let d = md5.digest('hex') + extname;
            newpath = 'uploadfile/'+d;
            fs.rename(oldpath, newpath,function(err){
                if(err){console.log(err);}
                else{fs.unlink(oldpath,function(){});
                    let downloadpath = 'http://149.28.202.19:3300/download/' + d;
                    let info = {
                        name:content,
                        path:downloadpath,
                        coordinate:{
                            Latitude:18.604601,
                            Longitude:8.702244
                        },
                    };
                    gallery.presever(MongoClient,DBUrl,info);
                }
            });

        }catch (e) {
            console.log(e);
        }

    });
    console.log(res);
});

http.listen(port, function(){
    console.log('listening on *:3030');
});
