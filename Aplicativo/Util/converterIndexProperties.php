<?php
/**
 * Conversão de index.properties em JSON para o jsTree
 *
 * @author    Douglas Gadêlha <douglas.gadelha@ifba.edu.br>
 * @copyright Programa Institucional de Bolsa de Iniciação à Docência (Pibid)
 * @copyright Coordenação de Aperfeiçoamento de Pessoal de Nível Superior (CAPES)
 * @copyright Ministério da Educação (MEC)
 * @license   GPLv3
 * @package   PortugolWebstudio
 * @version   1.0
 */


define("ICONE_PASTA", "icone icone-pasta");
define("ICONE_EXEMPLO", "icone icone-exemplo");

$Pasta = "../../Recursos/exemplos/";

function Ler($Arquivo) {
	$Linhas = file($Arquivo, FILE_SKIP_EMPTY_LINES | FILE_IGNORE_NEW_LINES);
	$Data = [];
	
	foreach ($Linhas as $Linha) {
		$Sep = strpos($Linha, "=");
		$Data[trim(substr($Linha, 0, $Sep))] = trim(substr($Linha, $Sep + 1));
	}

	$Items = [];

	for ($i = 0; $i < $Data["items"]; $i++) {
		$itemData = array_filter($Data, function($Key) use ($i) {
			return (strlen($Key) >= strlen("item" . $i . ".") and substr($Key, 0, strlen("item" . $i . ".")) == "item" . $i . ".");
		}, ARRAY_FILTER_USE_KEY);

		$fixedItemData = [];

		array_walk($itemData, function($Value, $Key) use ($i, &$fixedItemData) {
			$fixedItemData[substr($Key, strlen("item" . $i . "."))] = $Value;
		});

		$Items[] = $fixedItemData;
	}

	return $Items;
}

function Parse($Categoria, $Pasta) {
	$Data = [
		"text" => $Categoria["name"],
		"icon" => (($Categoria["type"] == "dir") ? ICONE_PASTA : ICONE_EXEMPLO)
	];

	if ($Categoria["type"] == "dir") {
		$novaPasta = $Pasta . $Categoria["dir"] . "/";
		$Dados = Ler($novaPasta . "index.properties");
		$Data["children"] = [];//Parse(, $novaPasta);

		foreach ($Dados as $Dado) {
			if ($Dado["name"] == "Arquivos" || $Dado["name"] == "Graficos") continue;
			$Data["children"][] = Parse($Dado, $novaPasta);
		}
	} else if ($Categoria["type"] == "file") {
		$Data["li_attr"] = ["data-file" => str_replace("../../Recursos/", "Recursos/", $Pasta) . $Categoria["file"], "data-description" => $Categoria["description"]];
	}

	return $Data;
}

function Converter($Pasta) {
	$Arquivo = $Pasta . "index.properties";
	$Dados = Ler($Arquivo);
	$jsonFinal = [];

	foreach ($Dados as $Categoria) {
		if ($Categoria["name"] == "Jogos" || $Categoria["name"] == "Música") continue;
		$jsonFinal[] = Parse($Categoria, $Pasta);
	}

	return json_encode($jsonFinal);
}

file_put_contents("data.json", Converter($Pasta));
