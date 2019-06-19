let fs = require('fs');
let path = require('path');


loadModel =(model)=>{
   return require(`../model/${model}`);
    
};

// loadLibrary = (library) => {
//     return require(`../app/libraries/${library}`);
// };

loadConfig = (config) => {
    return require(`../config/${config}`);
};

// loadMiddleware = (middleware) =>{
//     return require(`../app/middleware/${middleware}`);
// };
// loadCore = (core) =>{
//     return require(`../core/${core}`);
// };
// loadENV = () =>{
//     return require(`../env`);
// };
controller = (controllerPath) => {
    let split = controllerPath.split("/");
    let path = controllerPath.replace('/'+split[split.length-1],'');
    let Controller = require(`../controller/${path+'Controller'}`);
    let controller = new Controller();
    return controller[split[split.length-1]];
};

//RequestData = loadCore('request_data');

