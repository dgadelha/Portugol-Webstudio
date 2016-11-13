<?php
/**
 * Classe Util do Portugol Webstudio
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

class Util {
	public static function endsWith($Haystack, $Needle) {
		$NeedleLength = strlen($Needle);
		return ($Haystack{strlen($Haystack)-1} == $Needle{$NeedleLength-1}) ? (substr($Haystack, -$NeedleLength) === $Needle) : false;
	}

	public static function GUID() {
		return strtolower(sprintf("%04X%04X-%04X-%04X-%04X-%04X%04X%04X", mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(16384, 20479), mt_rand(32768, 49151), mt_rand(0, 65535), mt_rand(0, 65535), mt_rand(0, 65535)));
	}

	public static function ReplaceAccents($Text) {
		return str_replace(["à","á","â","ã","ä", "ç", "è","é","ê","ë", "ì","í","î","ï", "ñ", "ò","ó","ô","õ","ö", "ù","ú","û","ü", "ý","ÿ", "À","Á","Â","Ã","Ä", "Ç", "È","É","Ê","Ë", "Ì","Í","Î","Ï", "Ñ", "Ò","Ó","Ô","Õ","Ö", "Ù","Ú","Û","Ü", "Ý"], ["a","a","a","a","a", "c", "e","e","e","e", "i","i","i","i", "n", "o","o","o","o","o", "u","u","u","u", "y","y", "A","A","A","A","A", "C", "E","E","E","E", "I","I","I","I", "N", "O","O","O","O","O", "U","U","U","U", "Y"], $Text);
	}

	public static function fixLineEndings($Input) {
		$Input = str_replace("\r\n", "\n", $Input);
		$Input = str_replace("\r", "\n", $Input);
		return $Input;
	}

	/**
	 * @link http://stackoverflow.com/a/19366999
	 */
	public static function utf8ize($d) {
		if (is_array($d)) {
			foreach ($d as $k => $v) {
				$d[$k] = self::utf8ize($v);
			}
		} else if (is_string($d)) {
			return utf8_encode($d);
		}

		return $d;
	}

	public static function outputJson($jsonData) {
		$Out = json_encode($jsonData);

		if (empty($Out)) {
			$Out = json_encode(self::utf8ize($jsonData));
		}

		if (empty($Out)) {
			$Out = json_encode(["output" => "", "result" => false]);
		}

		echo $Out;
	}

	public static function Caixa($Mensagem) {
		$maxLength = 0;
		$Lines = explode("\n", $Mensagem);

		foreach ($Lines as $Line) {
			$lineLength = mb_strlen($Line);

			if ($lineLength > $maxLength) {
				$maxLength = $lineLength;
			}
		}

		$boxString = str_repeat("-", $maxLength + 4) . PHP_EOL;

		foreach ($Lines as $Line) {
			$lineLength = mb_strlen($Line);

			if ($lineLength == $maxLength) {
				$boxString .= "- " . $Line . " -" . PHP_EOL;
			} else {
				$boxString .= "- " . str_pad($Line, $maxLength, " ", STR_PAD_BOTH) . " -" . PHP_EOL;
			}
		}

		$boxString .= str_repeat("-", $maxLength + 4);

		return $boxString;
	}

	/**
	 * @link http://php.net/manual/en/function.set-time-limit.php#115057
	 */
	public static function runCommand($cmd, $stdin = "", $timeout) {
		$start = time();
		$stdout = "";
		$stderr = "";

		$process = proc_open($cmd, [["pipe", "r"], ["pipe", "w"], ["pipe", "w"]], $pipes);
		if (!is_resource($process)) {
			return ["return" => "1", "stdout" => $stdout, "stderr" => $stderr, "timeout" => false];
		}

		$status = proc_get_status($process);
		if (!IS_WINDOWS) posix_setpgid($status["pid"], $status["pid"]);

		stream_set_blocking($pipes[0], 0);
		stream_set_blocking($pipes[1], 0);
		stream_set_blocking($pipes[2], 0);
		fwrite($pipes[0], $stdin);
		fclose($pipes[0]);

		while (true) {
			$stdout .= stream_get_contents($pipes[1]);
			$stderr .= stream_get_contents($pipes[2]);

			if ((time() - $start) > $timeout) {
				if (!IS_WINDOWS) posix_kill(-$status["pid"], 9);
				return ["return" => "1", "stdout" => $stdout, "stderr" => $stderr, "timeout" => true];
			}

			$status = proc_get_status($process);

			if (!$status["running"]) {
				fclose($pipes[1]);
				fclose($pipes[2]);
				proc_close($process);
				return ["return" => $status["exitcode"], "stdout" => $stdout, "stderr" => $stderr, "timeout" => false];
			}

			usleep(100000);
		}
	}
}
