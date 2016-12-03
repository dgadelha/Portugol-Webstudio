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
$releaseTime = "local";

if (file_exists(realpath(__DIR__) . DS . "release")) {
	$releaseTime = trim(file_get_contents(realpath(__DIR__) . DS . "release"));
}

define("RELEASE", time());///$releaseTime);

$app->get("/", function() use ($app) {
	$app->render("IDE.php", ["siteURL" => $app->urlFor("/"), "ajaxURL" => $app->urlFor("/") . "index.php/executar"]);
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
	$Saida = substr($Saida, 0, strpos($Saida, "Programa finalizado") - 1);

	\PortugolWebstudio\Util::outputJson(["output" => $Saida, "result" => ($Expect == $Output) ? "ok" : "fail"]);
})->name("expect");

$app->run();
