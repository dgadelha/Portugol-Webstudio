const express = require('express');
const router = express.Router();
const iconv = require('iconv-lite');
const path = require('path');
const fs = require('fs');

String.prototype.replaceArray = function(find, replace) {
    let replaceString = this;
    let regex;

    for (let i = 0; i < find.length; i++) {
        regex = new RegExp(find[i], 'g')
        replaceString = replaceString.replace(regex, replace);
    }

    return replaceString;
};

router.get('/ide', (_, res) => res.render('editor/ide'));
router.get('/ide/ajuda', (_, res) => res.render('editor/ajuda'));

router.get('/ide/editor', (req, res) =>
    res.render('editor/tab', { cid: req.query.cid, fnam: req.query.fnam }));

router.get('/ide/resp', (req, res, next) => {
    const file = req.query.file;

    if (!file || !file.includes('Recursos') || file.substring(0,8) !== 'Recursos') {
        return next();
    }

    const filePath = __dirname + '/../public/' + file;

    if (!fs.existsSync(filePath)) {
        return next();
    }

    const extName = path.extname(filePath);
    const allowedExt = ['.por', '.html', '.htm'];

    if (!allowedExt.includes(extName)) {
        return next();
    }

    fs.readFile(filePath, (err, origin) => {
        if (err) {
            return next(err);
        }

        const baseRoute = req.originalUrl.substring(0, req.originalUrl.indexOf(req.route.path)) + '/';
        const baseURL = '/';
        let data = origin;

        if (extName == '.htm' || extName == '.html') {
            data = data.toString('utf8');
            data = data.replace('<head>', '<head><meta charset=\'utf-8\'><meta http-equiv=\'X-UA-Compatible\' content=\'IE=edge\'><meta name=\'viewport\' content=\'width=device-width, initial-scale=1\'><script type=\'text/javascript\'>var d={baseURL:\''+ baseRoute +'\'};</script>');
            data = data.replace('</head>', '<link href=\'https://fonts.googleapis.com/css?family=PT+Sans\' rel=\'stylesheet\'><style type=\'text/css\'>.dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0;font-family:\'PT Sans\',sans-serif;font-size:15px}body{padding-bottom:25px}p{line-height:18pt}h1,h2{padding-left:15px;font-family:\'PT Sans\',sans-serif}h1{font-size:18pt}ul>li{margin-top:10px}ul>li:first-child{margin-top:0}</style></head>');
            data = data.replaceArray(['../../../../scripts/exemplos.js', '../../../scripts/exemplos.js', '../../scripts/exemplos.js'], baseURL + 'assets/editor/Recursos-exemplos.js');
            data = data.replaceArray(['../../../../scripts/', '../../../scripts/', '../../scripts/'], baseURL + 'Recursos/ajuda/scripts/');
            data = data.replaceArray(['../../../../estilos/', '../../../estilos/', '../../estilos/'], baseURL + 'Recursos/ajuda/estilos/');
            data = data.replaceArray(['../../../../recursos/imagens/', '../../../recursos/imagens/', '../../recursos/imagens/'], baseURL + 'Recursos/ajuda/recursos/imagens/');
            data = data.replaceArray(['../../../../recursos/', '../../../recursos/', '../../recursos/'], 'Recursos/ajuda/recursos/');
            data = data.replace(new RegExp('topicos/linguagem_portugol/', 'g'), baseRoute + 'resp?file=Recursos/ajuda/topicos/linguagem_portugol/');
            data = data.replace('${ajuda}', 'Dark/ajuda.css');
            data = data.replace('${syntax}', 'Dark/SyntaxHighlighter.css');
        } else if (extName == '.por') {
            data = iconv.decode(data, 'ISO-8859-1');

            if (data.indexOf('/* $$$ Portugol Studio $$$ ') > -1) {
                data = data.substring(0, data.indexOf('/* $$$ Portugol Studio $$$ '));
            }
        } else {
            data = iconv.decode(data, 'ISO-8859-1');
        }

        res.send(data).end();
    });
});

router.get('/', (_, res) => res.render('index'));

module.exports = router;
