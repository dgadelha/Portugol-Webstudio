<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Portugol Webstudio - Ajuda</title>

	<?php include "Meta.inc.php"; ?>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.3/themes/default-dark/style.min.css" />
	<link rel="stylesheet" type="text/css" href="<?=$siteURL;?>assets/res.css?<?=RELEASE;?>">
</head>
<body>
	<div data-ax5layout="ax1" class="ax5layout" data-config="{layout:'dock-panel'}" id="layout">
		<div data-dock-panel="{dock:'left',split:true,width:250,minWidth:100,maxWidth:350}" id="leftPanel">
			<div class="res-cat">
				<img src="https://raw.githubusercontent.com/UNIVALI-LITE/Portugol-Studio/master/src/br/univali/ps/ui/icones/pequeno/help.png"> <span>Ajuda</span>
			</div>

			<div class="jstree"></div>
		</div>

		<div data-dock-panel="{dock:'center'}">
			<iframe src="" id="mainFrame"></iframe>
		</div>
	</div>
	<?php include "Scripts.inc.php"; ?>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jstree/3.3.3/jstree.min.js"></script>
	<script type="text/javascript">var d={ajaxUrl:"<?=$ajaxURL;?>",baseUrl:"<?=$siteURL;?>",res:"ajuda"};</script>
	<script type="text/javascript" src="<?=$siteURL;?>assets/res-ajuda.js?<?=RELEASE;?>"></script>
</body>
</html>
