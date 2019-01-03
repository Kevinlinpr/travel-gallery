const express = require('express');
const formidable = require('formidable');
let bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const DBUrl = 'mongodb://localhost/learn';
const app = express();
const port = 3750;
const http = require('http').Server(app);
const collectionType = {
    GALLERY:'gallery',
    CONTENT:'content'
};
const MongoClient = require("mongodb").MongoClient;
let objectId = require('mongodb').ObjectId;
let sd = require('silly-datetime');
//allow custom header and CORS
app.all('*',function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});
app.post('/create',jsonParser,(req,res)=>{
    if (!req.body) return res.sendStatus(400);
    res.send(JSON.stringify({name:req.body.name,time:sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')}));
    presever(MongoClient,DBUrl,collectionType.GALLERY,{name:req.body.name,time:sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')});
});
app.post('/delete',jsonParser,(req,res)=>{
    if (!req.body) return res.sendStatus(400);
    console.log(req.body);
    res.send(JSON.stringify(req.body));
    remove(MongoClient,DBUrl,collectionType.GALLERY,req.body);
});
app.get('/list/gallery',jsonParser,(req,res)=>{
    //res.send(JSON.stringify(getList(MongoClient,DBUrl,collectionType.GALLERY)));
    getList(MongoClient,DBUrl,collectionType.GALLERY,function (x) {
        console.log('===start===');
        console.log(x);
        console.log('===end===');
        res.send(JSON.stringify(x));
    })
});
app.post('/gallery/room/info',jsonParser,(req,res)=>{
    getInfo({_id:req.body._id},MongoClient,DBUrl,collectionType.GALLERY,function (x) {
        console.log('===find===');
        console.log(x);
        console.log('===end===');
        res.send(JSON.stringify(x));
    })
});
app.post('/upload',(req,res)=>{
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
                    res.send(JSON.stringify({imgUrl:downloadpath}));
                    //gallery.presever(MongoClient,DBUrl,,info);
                }
            });

        }catch (e) {
            console.log(e);
        }

    });
    console.log(res);
});

http.listen(port, function(){
    console.log('listening on *:3750');
});
function getList(mongoclient, dburl, type,callback) {
    mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
        if (err) throw err;
        console.log("数据库连接成功！");
        let dbo = db.db("learn");
        dbo.collection(type).find({}).toArray((err,result)=>{
            if (err) throw err;
            //console.log(result);
            db.close();
            callback(result);
        });
    });
}
function getInfo(find,mongoclient, dburl, type, callback) {
    mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
        if (err) throw err;
        console.log("数据库连接成功！");
        let dbo = db.db("learn");
        let whereStr = {_id:objectId(find._id)};
        dbo.collection(type).find(whereStr).toArray((err,result)=>{
            if (err) throw err;
            //console.log(result);
            db.close();
            callback(result);
        });
    });
}
function presever(mongoclient,dburl,type,info){
    mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
        if (err) throw err;
        console.log("数据库连接成功！");
        let dbo = db.db("learn");
        dbo.collection(type).insertOne(info,(err,res)=>{
            if (err) throw err;
            console.log("文档插入成功！");
        });
        let whereStr = {name:info.name};
        dbo.collection(type).find(whereStr).toArray((err,result)=>{
            if (err) throw err;
            console.log(result);
            db.close();
        });
    })
}
function remove(mongoclient,dburl,type,info){
    mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
        if (err) throw err;
        console.log("数据库连接成功！");
        let dbo = db.db("learn");
        let whereStr = {name:info.name};
        dbo.collection(type).deleteMany(whereStr,(err,obj)=>{
            if (err) throw err;
            console.log(obj.result.n+" 条文档被删除");
            db.close();
        })
    })
}