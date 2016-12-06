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
	<div class="visible-xs hidden-md hidden-lg alert-res">
		<div class="alert-res-content">
			<span>Esta resolução é muito pequena para usar o Portugol Webstudio.</span>
		</div>

		<div class="alert-res-close"><a href="#">Entendo as consequências e quero usar mesmo assim!</a></div>
	</div>

	<div id="ide" class="hidden-xs">
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

				<div class="row hidden-xs" id="exp">
					<div data-ax5layout="ax1" class="ax5layout" data-config="{layout:'dock-panel'}" id="ax1">
						<div data-dock-panel="{dock:'left',split:true,width:250,minWidth:200,maxWidth:400}" id="leftPanel">
							<div class="res-cat">
								<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/pequeno/light_pix.png"> <span>Exemplos</span>
							</div>

							<div class="jstree"></div>
						</div>

						<div data-dock-panel="{dock:'center'}" id="exc">
							<div id="exc-content">
								<div class="row row-exemplo-desc">
									<div class="col-xs-9 col-md-9 col-lg-9">
										<div class="res-cat" id="exemplo-desc-holder">
											<span id="exemplo-desc">Selecione um exemplo ao lado para ver a descrição.</span>
										</div>
									</div>

									<div class="col-xs-3 col-md-3 col-lg-3">
										<a class="res-cat res-cat-link hide" id="exemplo-go" href="#"><span>Explorar Exemplo</span></a>
									</div>
								</div>

								<div class="row row-exemplo-editor hide">
									<pre id="exemplo-editor" class="input"></pre>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="hide" id="special"></div>

	<?php include "Scripts.inc.php"; ?>
	<script type="text/javascript">var d={ajaxUrl:"<?=$ajaxURL;?>",baseUrl:"<?=$siteURL;?>",isXs:false,exemplo:{nome:false,codigo:false},tabs:[],scrollDown:function(tid){var r=d.tabs[tid].output.session.getLength()-1;var c=d.tabs[tid].output.session.getLine(r).length;d.tabs[tid].output.gotoLine(r+1,c)}};</script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/ide.js?<?=RELEASE;?>"></script>
</body>
</html>
