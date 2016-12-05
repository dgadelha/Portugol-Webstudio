<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Portugol Webstudio</title>

	<?php include "Meta.inc.php"; ?>
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/portugol.css?<?=RELEASE;?>">
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/ide.css?<?=RELEASE;?>">
</head>
<body>
	<div id="ide">
		<ul class="tabs">
			<li><a id="anchor-inicio" href="#tab-inicio">Portugol Webstudio <span class="portugol-icon"></span></a></li>
			<li><span class="action action-open"><span class="open-icon"></span></span></li>
			<li><span class="action action-add"><span class="add-icon"></span></span></li>
		</ul>

		<div class="tab" id="tab-inicio">
			<div class="tab-content">
				<div class="row" id="btl">
					<div class="col-xs-3 col-md-3 col-lg-3">
						<button class="action-add">
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/programar.png" class="img-responsive">
							<span>Programar</span>
						</button>
					</div>
					<div class="col-xs-3 col-md-3 col-lg-3">
						<button class="action-ajuda">
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/ajuda.png" class="img-responsive">
							<span>Ajuda</span>
						</button>
					</div>
					<div class="col-xs-3 col-md-3 col-lg-3">
						<a href="https://www.youtube.com/user/portugolstudio" target="_blank" rel="nofollow">
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/videoaulas.png" class="img-responsive">
							<span>Videoaulas</span>
						</a>
					</div>
					<div class="col-xs-3 col-md-3 col-lg-3">
						<a href="javascript:alert('Não implementado.')">
							<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/grande/lite/bibliotecas.png" class="img-responsive">
							<span>Bibliotecas</span>
						</a>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="hide" id="special"></div>

	<?php include "Scripts.inc.php"; ?>
	<script type="text/javascript">var d={ajaxUrl:"<?=$ajaxURL;?>",baseUrl:"<?=$siteURL;?>",tabs:[],scrollDown:function(tid){var r=d.tabs[tid].output.session.getLength()-1;var c=d.tabs[tid].output.session.getLine(r).length;d.tabs[tid].output.gotoLine(r+1,c)}};</script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/ide.js?<?=RELEASE;?>"></script>
</body>
</html>
