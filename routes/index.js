var express = require('express');
var fs = require('fs')
var router = express.Router();
var path = require('path');
String.prototype.replaceArray = function(find, replace) {
  var replaceString = this;
  for (var i = 0; i < find.length; i++) {
    replaceString = replaceString.replace(find[i], replace[i]);
  }
  return replaceString;
};
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/resp', function(req, res, next) {
  var file = req.query.file;
  if(file.lenght >= 8 && file.substring(0, 8) == "Recursos"){
    var basePath = fs.realpath(path.dirname(require.main.filename) + "/../");
    var filePath = fs.realpath(file);
    if(filePath.substring(0, basePath.lenght) == basePath && fs.existsSync(filePath)){
      var extName = path.extname(filePath);
      var allowedExt = ['.por', '.html', '.htm'];
      if(allowedExt.indexOf(extName) > -1){
        fs.readFile(filePath, function (err, origin) {
          var baseURL = "/";
          var data = origin.toString('utf8');
          if(extName == ".htm" || extName == ".html"){
              var style = ".dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0}body{padding-bottom:25px}";
            	data = data.replace("<head>", "<head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><script type=\"text/javascript\">var d={baseURL:\""+ baseURL +"\"};</script>");
            	data = data.replace("</head>", "<style type=\"text/css\">" + style + "</style></head>");
            	data = data.replaceArray(["../../../../scripts/exemplos.js", "../../../scripts/exemplos.js", "../../scripts/exemplos.js"], baseURL . "assets/Recursos-exemplos.js");
              data = data.replaceArray(["../../../../scripts/", "../../../scripts/", "../../scripts/"], baseURL . "Recursos/ajuda/scripts/");
            	data = data.replaceArray(["../../../../estilos/", "../../../estilos/", "../../estilos/"], baseURL . "Recursos/ajuda/estilos/");
            	data = data.replaceArray(["../../../../recursos/imagens/", "../../../recursos/imagens/", "../../recursos/imagens/"], baseURL . "Recursos/ajuda/recursos/imagens/");
            	data = data.replaceArray(["../../../../recursos/", "../../../recursos/", "../../recursos/"], "Recursos/ajuda/recursos/");
            	data = data.replace("topicos/linguagem_portugol/", baseURL . "index.php/resp?file=Recursos/ajuda/topicos/linguagem_portugol/");
          }
          res.send(data);
        });
      }
    }
  }
});
module.exports = router;
