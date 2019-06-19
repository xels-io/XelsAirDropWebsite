require('./loader');



let controllersFiles = allFilesSync('./app/controllers/');
//console.log(JSON.stringify(controllersFiles));
let controllers = {};
controllersFiles.forEach((file)=>{
    let name = file.file.replace(".js", "").replace('Controller','');
    let path = file.path.replace('app\\controllers\\','').replace(".js", "").replace('\\','/');
    //let split = path.replace('/','.').replace('\\','.').replace('Controller','').split('.');


    controllers[name] = require(`../app/controllers/${path}`);

});


// const make = (controllersFiles) =>{
//     let obj = {};
//     for(key in controllersFiles){
//         //console.log(typeof controllersFiles[key]);
//         if(typeof controllersFiles[key] == 'object'){
//             obj = make(controllersFiles[key]);
//
//         }else{
//             console.log(controllersFiles[key]);
//         }
//     }
//     return obj;
// };
// const conList = make(controllersFiles);




exports.controllers = controllers;




let middleWareFiles = allFilesSync('./app/middleware/');
//console.log(JSON.stringify(middleWareFiles));
let middleWares = {};
middleWareFiles.forEach((file)=>{
    let name = file.file.replace(".js", "");
    let path = file.path.replace('app\\middleware\\','').replace(".js", "").replace('\\','/');
    middleWares[name] = require(`../app/middleware/${path}`);

});
exports.middleWares = middleWares;





let modelsFiles = allFilesSync('./app/models/');
//console.log(JSON.stringify(modelsFiles));
let models = {};
modelsFiles.forEach((file)=>{
    let name = file.file.replace(".js", "");
    let path = file.path.replace('app\\models\\','').replace(".js", "").replace('\\','/');
    models[name] = require(`../app/models/${path}`);

});

exports.models = models;

