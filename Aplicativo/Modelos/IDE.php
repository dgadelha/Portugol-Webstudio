<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Portugol Webstudio</title>

	<link href="https://fonts.googleapis.com/css?family=PT+Sans" rel="stylesheet">
	<link rel="stylesheet" type="text/css" href="https://cdn.rawgit.com/ax5ui/ax5ui-layout/master/dist/ax5layout.css?7544f5a6f789ebaf83e5f070a19a881725c16b6f">
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/portugol.css">
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/ide.css">
</head>
<body>
	<div id="ide">
		<ul class="tabs">
			<li><a id="anchor-inicio" href="#tab-inicio">Portugol Webstudio <span class="portugol-icon"></span><span class="spacing-icon"></span><span class="open-icon" onClick="openFile();return false"></span><span class="mini-spacing-icon"></span><span class="add-icon" onClick="addTab();return false"></span></a></li>
		</ul>

		<div class="tab" id="tab-inicio">
			<div class="tab-content">
				<div class="row" id="btl">
					<div class="col-md-3">
						<button onClick="addTab()">
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/programar.png">
							<span>Programar</span>
						</button>
					</div>
					<div class="col-md-3">
						<button>
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/ajuda.png">
							<span>Ajuda</span>
						</button>
					</div>
					<div class="col-md-3">
						<button>
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/videoaulas.png">
							<span>Videoaulas</span>
						</button>
					</div>
					<div class="col-md-3">
						<button>
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/bibliotecas.png">
							<span>Bibliotecas</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="hide" id="special"></div>

	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.3/jquery.min.js"></script>
	<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/ace/1.2.5/ace.js"></script>
	<script type="text/javascript" src="https://cdn.rawgit.com/ax5ui/ax5core/master/dist/ax5core.min.js?e2df1421a819efa43b46c0cab92940ef4410776d"></script>
	<script type="text/javascript" src="https://cdn.rawgit.com/ax5ui/ax5ui-layout/master/dist/ax5layout.min.js?7544f5a6f789ebaf83e5f070a19a881725c16b6f"></script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/mode-portugol.js"></script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/portugol.js"></script>
	<script type="text/javascript">var d={ajaxUrl:"<?=$ajaxURL;?>",tabs:[],scrollDown:function(tid){var r=d.tabs[tid].output.session.getLength()-1;var c=d.tabs[tid].output.session.getLine(r).length;d.tabs[tid].output.gotoLine(r+1,c)}};</script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/ide.js"></script>
</body>
</html>
