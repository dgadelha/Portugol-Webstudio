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

	private static function LimparSaida($Saida) {
		$EOL1 = "Programa finalizado";
		if (strstr($Saida, $EOL1)) {
			$Saida = substr($Saida, 0, strpos($Saida, $EOL1) + strlen($EOL1));
		}

		$EOL2 = "Pressione ENTER para continuar";
		if (strstr($Saida, $EOL2)) {
			$Saida = rtrim(substr($Saida, 0, strpos($Saida, $EOL2)));
		}

		return $Saida;
	}

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

		if (strstr($CodigoMin, "sorteia")) {
			$Cachear = false;
		} /* colocar mais condições de cache aqui */

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
		$Comando = "java -Dfile.encoding=ISO-8859-1 -Xms128m -Xmx512m -d64 -jar \"" . $jarPath ."\" \"" . $Path . "\"";

		$commandInfo = Util::runCommand($Comando, $Entrada, 10);
		$Saida = self::LimparSaida($commandInfo["stdout"]);
		$Saida .= self::LimparSaida($commandInfo["stderr"]);

		$Saida = trim($Saida);

		if ($commandInfo["timeout"]) {
			$Saida .= "\n" . Util::Caixa("Tempo limite de 10 segundos excedido\nPROCESSO ENCERRADO");
		}

		unlink($Path);
		if ($Cachear) file_put_contents($CodeHashPath, $Saida);

		return $Saida;
	}
}
