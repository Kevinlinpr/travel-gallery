module.exports = class Gallery {
    presever(mongoclient,dburl,info){
        mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
            if (err) throw err;
            console.log("数据库连接成功！");
            let dbo = db.db("learn");
            dbo.collection("profile").insertOne(info,(err,res)=>{
                if (err) throw err;
                console.log("文档插入成功！");
            });
            let whereStr = {name:info.name};
            dbo.collection("profile").find(whereStr).toArray((err,result)=>{
                if (err) throw err;
                console.log(result);
                db.close();
            });
        })
    };
    remove(mongoclient,dburl,info){
        mongoclient.connect(dburl,{useNewUrlParser:true},(err,db)=>{
            if (err) throw err;
            console.log("数据库连接成功！");
            let dbo = db.db("learn");
            let whereStr = {name:info.name};
            dbo.collection("profile").deleteMany(whereStr,(err,obj)=>{
                if (err) throw err;
                console.log(obj.result.n+" 条文档被删除");
                db.close();
            })
        })
    }
};