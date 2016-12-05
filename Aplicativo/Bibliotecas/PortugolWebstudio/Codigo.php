<?php
/**
 * Classe Codigo do Portugol Webstudio
 *
 * @author    Douglas Gadêlha <douglas.gadelha@ifba.edu.br>
 * @copyright Programa Institucional de Bolsa de Iniciação à Docência (Pibid)
 * @copyright Coordenação de Aperfeiçoamento de Pessoal de Nível Superior (CAPES)
 * @copyright Ministério da Educação (MEC)
 * @license   GPLv3
 * @package   PortugolWebstudio
 * @version   1.0
 */

namespace PortugolWebstudio;

class Codigo {
	private static $BibliotecasProibidas = ["Arquivos", "Graficos", "Mouse", "Sons", "Teclado"];

	public static function Compilar($Codigo, $Entrada) {
		$CodigoLimpo = preg_replace("/[^A-Za-z0-9]/", "", strtolower($Codigo));

		foreach (self::$BibliotecasProibidas as $BibliotecasProibida) {
			if (stristr($CodigoLimpo, "incluabiblioteca" . $BibliotecasProibida)) {
				return Util::Caixa("O uso da biblioteca " . $BibliotecasProibida . " não é permitido");
			}
		}

		$CodigoMin = PortugolMin::minify($Codigo);
		$CodeHash = md5($CodigoMin);
		$Cachear = true;

		/* condições de cache para código */
		if (strstr($CodigoMin, "sorteia")) {
			$Cachear = false;
		}

		if (!empty($Entrada)) {
			if (!Util::endsWith($Entrada, "\n")) {
				$Entrada .= "\n";
			}

			$CodeHash .= "-" . md5($Entrada);
		}

		$CodeHashPath = BASE_PATH . DS . "Arquivos" . DS . "Hashes" . DS . $CodeHash . ".por.out";

		if (is_file($CodeHashPath) and $Cachear) {
			return file_get_contents($CodeHashPath);
		}

		$Path = BASE_PATH . DS . "Arquivos" . DS . "c_" . Util::GUID() . "-" . rand(00000, 99999) . ".por";
		file_put_contents($Path, $Codigo);

		$jarPath = BASE_PATH . DS . "Arquivos" . DS . "Portugol" . DS . "portugol-console.jar";
		$Comando = "java -Dfile.encoding=UTF-8 -Xms128m -Xmx512m -d64 -jar \"" . $jarPath ."\" \"" . $Path . "\"";

		if (getenv("SERVER_NAME") == "sf1.hashbang.sh") {
			$Comando = "/home/dgadelha/.local/bin/" . $Comando;
		}

		$commandInfo = Util::runCommand($Comando, $Entrada, 10);
		$Saida = $commandInfo["stdout"];
		$Saida .= $commandInfo["stderr"];

		$Saida = trim($Saida);

		if ($commandInfo["timeout"]) {
			$Saida .= "\n" . Util::Caixa("Tempo limite de 10 segundos excedido\nPROCESSO ENCERRADO");
		}

		/* condições de cache para saída */
		if (strstr($Saida, "Error occurred during initialization of VM") || strstr($Saida, "Traduzindo erro sintático") || strstr($Saida, "Erro de execução")) {
			$Cachear = false;
		}

		unlink($Path);
		if ($Cachear) file_put_contents($CodeHashPath, $Saida);

		return $Saida;
	}
}
