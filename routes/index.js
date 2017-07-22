var express = require('express');
require('express-group-routes');
var fs = require('fs');
var rp = require('fs.realpath');
var router = express.Router();
var path = require('path');
var iconv = require('iconv-lite');
String.prototype.replaceArray = function(find, replace) {
  var replaceString = this;
  var regex;
  for(var i=0; i < find.length; i++) {
    regex = new RegExp(find[i], "g")
    replaceString = replaceString.replace(regex, replace);
  }
  return replaceString;
};
router.group("/ide", function(router) {
  router.get('/', function(req, res, next) {
    res.render('editor/ide');
  });
  router.get('/ajuda', function(req, res, next) {
    res.render('editor/ajuda');
  });
  router.get('/resp', function(req, res, next) {
    var file = req.query.file;
    if (file.includes("Recursos") && file.substring(0,8) == "Recursos"){
      var basePath = rp.realpathSync(path.dirname(require.main.filename) + "/../");
      var filePath = rp.realpathSync(basePath + "/public/" + file);
      if(fs.existsSync(filePath)){
        var extName = path.extname(filePath);
        var allowedExt = ['.por', '.html', '.htm'];
        if(allowedExt.indexOf(extName) > -1){
          fs.readFile(filePath, function (err, origin) {
            var baseRoute = req.originalUrl.substring(0, req.originalUrl.indexOf(req.route.path)) + "/";
            var baseURL = "/";
            var data = origin;
            if(extName == ".htm" || extName == ".html"){
                data = data.toString('utf8');
                var style = ".dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0;font-family:'PT Sans',sans-serif;font-size:15px}body{padding-bottom:25px}p{line-height:18pt}h1,h2{padding-left:15px;font-family:'PT Sans',sans-serif}h1{font-size:18pt}ul>li{margin-top:10px}ul>li:first-child{margin-top:0}";
              	data = data.replace("<head>", "<head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><script type=\"text/javascript\">var d={baseURL:\""+ baseRoute +"\"};</script>");
              	data = data.replace("</head>", "<link href=\"https://fonts.googleapis.com/css?family=PT+Sans\" rel=\"stylesheet\"><style type=\"text/css\">" + style + "</style></head>");
              	data = data.replaceArray(["../../../../scripts/exemplos.js", "../../../scripts/exemplos.js", "../../scripts/exemplos.js"], baseURL + "assets/editor/Recursos-exemplos.js");
                data = data.replaceArray(["../../../../scripts/", "../../../scripts/", "../../scripts/"], baseURL + "Recursos/ajuda/scripts/");
              	data = data.replaceArray(["../../../../estilos/", "../../../estilos/", "../../estilos/"], baseURL + "Recursos/ajuda/estilos/");
              	data = data.replaceArray(["../../../../recursos/imagens/", "../../../recursos/imagens/", "../../recursos/imagens/"], baseURL + "Recursos/ajuda/recursos/imagens/");
              	data = data.replaceArray(["../../../../recursos/", "../../../recursos/", "../../recursos/"], "Recursos/ajuda/recursos/");
              	data = data.replace(new RegExp("topicos/linguagem_portugol/", "g"), baseRoute + "resp?file=Recursos/ajuda/topicos/linguagem_portugol/");
              	data = data.replace("${ajuda}", "Dark/ajuda.css");
              	data = data.replace("${syntax}", "Dark/SyntaxHighlighter.css");
            } else if (extName == ".por") {
              data = iconv.decode(data, "ISO-8859-1");
              if (data.indexOf("/* $$$ Portugol Studio $$$ ") > -1) {
                data = data.substring(0, data.indexOf("/* $$$ Portugol Studio $$$ "));
              }
            } else {
              data = iconv.decode(data, "ISO-8859-1");
            }
            res.send(data);
          });
        }else{
          res.send("empty");
        }
      }else{
        res.send("empty");
      }
    }else{
      res.send("empty");
    }
  });
});

router.get('/old', function(req, res, next) {
  res.render('old');
});
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
