let Service = require('node-windows').Service;  
  
let svc = new Service({  
  name: 'babyserver',    //服务名称  
  description: '', //描述  
  script: './server.js' //nodejs项目要启动的文件路径  
});  
  
svc.on('install', () => {  
  svc.start();  
});  
  
svc.install();  