<?php
/**
 * Inicializador do Portugol Webstudio
 *
 * @author    Douglas Gadêlha <douglas.gadelha@ifba.edu.br>
 * @copyright Programa Institucional de Bolsa de Iniciação à Docência (Pibid)
 * @copyright Coordenação de Aperfeiçoamento de Pessoal de Nível Superior (CAPES)
 * @copyright Ministério da Educação (MEC)
 * @license   GPLv3
 * @package   PortugolWebstudio
 * @version   1.0
 */

if (!defined("DS")) {
	define("DS", DIRECTORY_SEPARATOR);
}

if (!defined("BASE_PATH")) {
	define("BASE_PATH", realpath(__DIR__) . DS . "Aplicativo");
}

if (!defined("IS_WINDOWS")) {
	define("IS_WINDOWS", (strtoupper(substr(PHP_OS, 0, 3)) === "WIN"));
}

class PortugolWebstudio_Autoloader {
	public static $Loaded = [];

	public function Register() {
		spl_autoload_register([__CLASS__, "Load"]);
	}

	public static function Load($Class) {
		if (isset(self::$Loaded[$Class])) return true;

		$File = BASE_PATH . DS . "Bibliotecas" . DS . str_replace("\\", DS, $Class) . ".php";

		if (is_file($File)) {
			include_once($File);

			if (class_exists($Class)) {
				self::$Loaded[$Class] = true;
				return true;
			}
		}

		return false;
	}
}

(new PortugolWebstudio_Autoloader())->Register();
\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim(["templates.path" => BASE_PATH . DS . "Modelos"]);
$releaseTime = time();

if (file_exists(realpath(__DIR__) . DS . "release")) {
	$releaseTime = trim(file_get_contents(realpath(__DIR__) . DS . "release"));
}

define("RELEASE", $releaseTime);

$app->get("/", function() use ($app) {
	$app->render("IDE.php", ["siteURL" => str_replace("index.php/", "", $app->urlFor("/")), "ajaxURL" => str_replace("index.php/", "", $app->urlFor("/")) . "index.php/executar"]);
})->name("/");

$app->get("/ajuda", function() use ($app) {
	$app->render("Ajuda.php", ["siteURL" => str_replace("index.php/", "", $app->urlFor("/"))]);
});

$app->post("/executar", function() use ($app) {
	$Codigo = $app->request->post("codigo");
	$Entrada = \PortugolWebstudio\Util::fixLineEndings($app->request->post("entrada"));

	$app->response->headers->set("Content-Type", "application/json");
	$app->response->headers->set("Access-Control-Allow-Origin", "*");

	if (empty(trim($Codigo))) return false;

	$Saida = \PortugolWebstudio\Codigo::Compilar($Codigo, $Entrada);
	\PortugolWebstudio\Util::outputJson(["output" => $Saida]);
})->name("executar");

$app->post("/expect", function() use ($app) {
	$Codigo = $app->request->post("codigo");
	$Entrada = \PortugolWebstudio\Util::fixLineEndings($app->request->post("entrada"));
	$Expect = trim(preg_replace("/[^A-Za-z0-9 ]/", "", \PortugolWebstudio\Util::ReplaceAccents(strtolower($app->request->post("expect")))));

	$app->response->headers->set("Content-Type", "application/json");
	$app->response->headers->set("Access-Control-Allow-Origin", "*");

	if (empty(trim($Codigo))) return false;

	$Saida = \PortugolWebstudio\Codigo::Compilar($Codigo, $Entrada);
	$Saida = trim(preg_replace("/[^A-Za-z0-9 ]/", "", \PortugolWebstudio\Util::ReplaceAccents(strtolower($Saida))));

	\PortugolWebstudio\Util::outputJson(["output" => $Saida, "result" => ($Expect == $Output) ? "ok" : "fail"]);
})->name("expect");

$app->get("/resp", function() use ($app) {
	$File = $app->request->get("file");

	if (strlen($File) >= 8 and substr($File, 0, 8) == "Recursos") {
		$basePath = realpath(__DIR__ . DS . "Recursos");
		$filePath = realpath($File);

		if (substr($filePath, 0, strlen($basePath)) == $basePath and file_exists($filePath) and is_file($filePath) and is_readable($filePath)) {
			$fileExt = end(explode(".", $filePath));
			$allowedExts = ["por", "html", "htm"];

			if (in_array($fileExt, $allowedExts)) {
				$baseURL = str_replace("index.php/", "", $app->urlFor("/"));

				$fileData = file_get_contents($filePath);

				if ($fileExt == "htm" || $fileExt == "html") { /* sorry for this, foi necessário */
					$Style = ".dp-highlighter{pointer-events:initial !important}html,body{margin:0;padding:0}body{padding-bottom:25px}";
					$fileData = str_replace("<head>", "<head><meta charset=\"utf-8\"><meta http-equiv=\"X-UA-Compatible\" content=\"IE=edge\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><script type=\"text/javascript\">var d={baseUrl:\"" . $baseURL . "\"};</script>", $fileData);
					$fileData = str_replace("</head>", "<style type=\"text/css\">" . $Style . "</style></head>", $fileData);
					$fileData = str_replace(["../../../../scripts/exemplos.js", "../../../scripts/exemplos.js", "../../scripts/exemplos.js"], $baseURL . "assets/Recursos-exemplos.js", $fileData);
					$fileData = str_replace(["../../../../scripts/", "../../../scripts/", "../../scripts/"], $baseURL . "Recursos/ajuda/scripts/", $fileData);
					$fileData = str_replace(["../../../../estilos/", "../../../estilos/", "../../estilos/"], $baseURL . "Recursos/ajuda/estilos/", $fileData);
					$fileData = str_replace(["../../../../recursos/imagens/", "../../../recursos/imagens/", "../../recursos/imagens/"], $baseURL . "Recursos/ajuda/recursos/imagens/", $fileData);
					$fileData = str_replace(["../../../../recursos/", "../../../recursos/", "../../recursos/"], "Recursos/ajuda/recursos/", $fileData);
					$fileData = str_replace("topicos/linguagem_portugol/", $baseURL . "index.php/resp?file=Recursos/ajuda/topicos/linguagem_portugol/", $fileData);
				} else if ($fileExt == "por") {
					$fileData = mb_convert_encoding($fileData, "UTF-8", "ISO-8859-1");
					$app->response->headers->set("Content-Type", "text/plain; charset=UTF-8");
				}

				echo $fileData;
				return true;
			}
		}
	}

	return false;
});

$app->run();
