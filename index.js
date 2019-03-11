const fs = require('fs')
const http = require('http')
const path = require('path')

const dir = './pic'

// 读取路径信息
function getStat(path){
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stats) => {
            if(err){
                resolve(false);
            }else{
                resolve(stats);
            }
        })
    })
}
// 创建路径
function mkdir(dir){
    return new Promise((resolve, reject) => {
        fs.mkdir(dir, err => {
            if(err){
                resolve(false);
            }else{
                resolve(true);
            }
        })
    })
}
// 路径是否存在，不存在则创建
async function dirExists(dir){
    let isExists = await getStat(dir);
    //如果该路径且不是文件，返回true
    if(isExists && isExists.isDirectory()){
        return true;
    }else if(isExists){     //如果该路径存在但是文件，返回false
        return false;
    }
    //如果该路径不存在
    let tempDir = path.parse(dir).dir;      //拿到上级路径
    //递归判断，如果上级目录也不存在，则会代码会在此处继续循环执行，直到目录存在
    let status = await dirExists(tempDir);
    let mkdirStatus;
    if(status){
        mkdirStatus = await mkdir(dir);
    }
    return mkdirStatus;
}

// 创建图片文件夹
async function fn(){
    await dirExists('./pic');
}
fn();

// 读取图片目录里的文件和文件夹
function readdir (res){
    return new Promise((resolve,reject) =>{
        fs.readdir(res,(err,data)=>{
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}

// 读取文件属性
function filestat (res){
    return new Promise((resolve,reject) =>{
        fs.stat(res,(err,data) =>{
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}

// 读取文件内容
function readfile (res){
    return new Promise((resolve,reject)=>{
        fs.readFile(res,(err,data)=>{
            if(err){
                reject(err)
            }
            resolve(data)
        })
    })
}

// 获取图片文件名称
function filename(picDir){
    return new Promise((resolve,reject)=>{
        readdir(picDir)
            .then(data=>{
            let paths = []
            let name
            data.map((name,index)=>{
                //let tmpPath = picDir+'/'+name
                let tmpPath = path.join(picDir, name)
                filestat(tmpPath).then((stats)=>{
                    if(!stats.isDirectory() && path.extname(tmpPath).toUpperCase() === '.JPG'){                  
                        paths.push(tmpPath)
                    }
                    if(index+1 === data.length){
                        resolve(paths)
                    }
                })
                .catch((err)=>{
                    reject(err)
                })      
            })    
        })
        .catch((err)=>{
            reject(err)
        })
    })
}

// 获取0到n的随机整数
function rd(n){ 
    return Math.floor(Math.random() * (n+1))
}

// 随机获取一张图片路径
function rdpic(){
    return new Promise((resolve,reject)=>{
        filename(dir)
            .then(data=>{
            let n = rd(data.length-1)
            resolve(data[n])
        })
    })
}

http.createServer(server).listen(3000, ()=> console.log('服务器启动成功 http://127.0.0.1:3000'))

function server (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    rdpic()
    .then(data =>{
        return readfile(data)
    })
    .then(data =>{
        return data
    })
    .then(data=>{
        res.end(data)
    })
    .catch(err => {
        throw err
    })
}
