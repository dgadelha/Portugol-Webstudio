import axios from "axios";
import express from "express";
import fs from "fs";
import iconv from "iconv-lite";
import path from "path";
import querystring from "querystring";
import { Stream } from "stream";

// eslint-disable-next-line
const ced: (data: Buffer) => string = require("ced");

const router = express.Router();
let ajudaCss: string | null = null;

router.get("/_health", (_, res) => res.send("OK"));

router.get("/ide", (_, res) => res.render("editor/ide"));
router.get("/ide/ajuda", (_, res) => res.render("editor/ajuda"));

router.get("/ide/editor", (req, res) => res.render("editor/tab", { cid: req.query.cid, fnam: req.query.fnam }));

router.get("/ide/editor/proxy", (req, res) => {
  const { url } = req.query;

  if (
    !url ||
    typeof url !== "string" ||
    ![".por", ".txt"].some(ext => url.toLowerCase().endsWith(ext)) ||
    !url.startsWith("https://")
  ) {
    res
      .status(500)
      .json({ error: "URL não aceita, verifique se a extensão termina com .por/.txt e começa com https://" })
      .end();

    return;
  }

  axios
    .get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
      maxContentLength: 100 * 1024 /* 100 KiB */,
      headers: {
        "Client-IP": req.ip,
        "X-Forwarded-For": req.ip,
      },
    })
    .then(result => {
      const buf = Buffer.from(result.data);
      const charset = ced(buf);
      let data = charset.startsWith("ASCII") ? iconv.decode(buf, "ISO-8859-1") : buf.toString();

      if (data.indexOf("/* $$$ Portugol Studio $$$ ") > -1) {
        data = data.substring(0, data.indexOf("/* $$$ Portugol Studio $$$ "));
      }

      res.send(data);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: typeof err === "object" ? err.message : err })
        .end();
    });
});

router.get("/ide/editor/share/:id", (req, res) => {
  res.header("Content-Type", "application/json");

  axios
    .get<Stream>(`https://paste-bin.xyz/raw/${req.params.id}`, {
      responseType: "stream",
      headers: {
        "Client-IP": req.ip,
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
        "X-Forwarded-For": req.ip,
      },
    })
    .then(result => {
      result.data.pipe(res);
    })
    .catch(err => {
      res
        .status(500)
        .json({ error: typeof err === "object" ? err.message : err })
        .end();
    });
});

router.post(
  "/ide/editor/share",
  (req, _, next) => {
    let data = "";

    req.setEncoding("utf8");

    req.on("data", chunk => {
      data += chunk;
    });

    req.on("end", () => {
      req.rawBody = data;
      next();
    });
  },
  async (req, res) => {
    const response = await axios.post(
      "https://paste-bin.xyz/index.php",
      querystring.stringify({
        title: "Código compartilhado do Portugol Webstudio",
        format: "text",
        submit: "Paste",
        paste_data: req.rawBody,
        paste_expire_date: "1W",
        visibility: "1",
        pass: "",
      }),
      {
        headers: {
          "Client-IP": req.ip,
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:93.0) Gecko/20100101 Firefox/93.0",
          "X-Forwarded-For": req.ip,
        },
        maxRedirects: 0,
        validateStatus: () => true,
      },
    );

    res
      .json({
        key: response.headers.location.split("/").pop(),
      })
      .end();
  },
);

function getAjudaCss() {
  if (ajudaCss !== null) {
    return ajudaCss;
  }

  const fileName = `${__dirname}/public/recursos/ajuda/estilos/ajuda.css`;

  if (fs.existsSync(fileName)) {
    ajudaCss = fs
      .readFileSync(fileName)
      .toString()
      .replace(/\$\{cor_letra\}/gu, "cdcdcd")
      .replace(/\$\{cor_destaque\}/gu, "3a464c")
      .replace(/\$\{cor_letra_titulo\}/gu, "cdcdcd")
      .replace(/\$\{fundo_escuro\}/gu, "121e24")
      .replace(/\$\{fundo_medio\}/gu, "263238")
      .replace(/\$\{cor_3\}/gu, "f0433b")
      .replace(/\$\{valor_cadeia\}/gu, "FFC200")
      .replace(/\$\{valor_inteiro\}/gu, "00F0C0")
      .replace(/\$\{valor_logico\}/gu, "F1433C")
      .replace(/\$\{palavras_reservadas\}/gu, "F1433C")
      .replace(/\$\{operador\}/gu, "E8E2B7")
      .replace(/\$\{tipos\}/gu, "45BEFF")
      .replace(/\$\{comentario_linha\}/gu, "66747B");
  }

  return ajudaCss;
}

router.get("/ide/resp", (req, res, next) => {
  const { file } = req.query;

  if (!file || typeof file !== "string" || !/^\/?recursos\//u.test(file)) {
    return next();
  }

  const filePath = `${__dirname}/public/${file}`;

  if (!fs.existsSync(filePath)) {
    return next();
  }

  const extName = path.extname(filePath);
  const allowedExts = [".por", ".html", ".htm"];

  if (!allowedExts.includes(extName)) {
    return next();
  }

  let data: Buffer | string = fs.readFileSync(filePath);

  if ([".htm", ".html"].includes(extName)) {
    data = data
      .toString("utf8")
      .replace(
        "<head>",
        "<head><meta charset='utf-8'><meta http-equiv='X-UA-Compatible' content='IE=edge'><meta name='viewport' content='width=device-width, initial-scale=1'><script type='text/javascript'>var d={baseURL:'/ide/resp'};</script>",
      )
      .replace(
        "</head>",
        "<link href='https://fonts.googleapis.com/css?family=PT+Sans' rel='stylesheet'><style type='text/css'>.dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0;font-family:'PT Sans',sans-serif;font-size:15px}body{padding-bottom:25px}p{line-height:18pt}h1,h2{padding-left:15px;font-family:'PT Sans',sans-serif}h1{font-size:18pt}ul>li{margin-top:10px}ul>li:first-child{margin-top:0}</style></head>",
      )
      .replace(/(?:\.\.\/)+scripts\/exemplos\.js/gu, "/assets/editor/recursos-exemplos.js")
      .replace(/(?:\.\.\/)+scripts\//gu, "/recursos/ajuda/scripts/")
      .replace(/(?:\.\.\/)+estilos\//gu, "/recursos/ajuda/estilos/")
      .replace(/(?:\.\.\/)+recursos\/imagens\//gu, "/recursos/ajuda/recursos/imagens/")
      .replace(/(?:\.\.\/)+recursos\//gu, "/recursos/ajuda/recursos/")
      .replace(/topicos\/linguagem_portugol\//gu, "/ide/resp?file=recursos/ajuda/topicos/linguagem_portugol/")
      .replace("/*${css}*/", getAjudaCss() ?? "")
      .replace("${syntax}", "SyntaxHighlighter.css")
      .replace("SyntaxHighlighter.css/>", 'SyntaxHighlighter.css"/>')
      .replace(/\$\{tema\}/gu, "Dark");
  } else if (extName === ".por") {
    data = iconv.decode(data, "ISO-8859-1");

    if (data.indexOf("/* $$$ Portugol Studio $$$ ") > -1) {
      data = data.substring(0, data.indexOf("/* $$$ Portugol Studio $$$ "));
    }
  } else {
    data = iconv.decode(data, "ISO-8859-1");
  }

  return res.send(data).end();
});

router.get("/", (_, res) => res.render("index"));

export default router;
