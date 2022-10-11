$(document).ready(function() {
	function drawCircle(x, y, r, power, outline, line) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle = outline;
		ctx.lineWidth = line;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.fill();
	}
	
	function drawLine(startX, startY, endX, endY, power, line) {
		ctx.lineWidth = line;
		var grad=ctx.createLinearGradient(startX, startY, endX, endY);
		if(power) {
			grad.addColorStop(0, linePoweredColor);
			grad.addColorStop(1, linePoweredGradient);
		}
		else {
			grad.addColorStop(0, lineUnpoweredColor);
			grad.addColorStop(1, lineUnpoweredGradient);
		}
		ctx.strokeStyle = grad;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}
	
	function drawRect(startX, startY, endX, endY, power, outline, line) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle=outline;
		ctx.lineWidth=line;
		ctx.beginPath();
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.stroke();
		ctx.fill();
	}
	
	function drawOval(startX, startY, endX, endY, power, outline, line) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle=outline;
		ctx.lineWidth=line;
		ctx.beginPath();
		startX+=(defaultHeight/2);
		endX-=(defaultHeight/2);
		ctx.arc(startX, startY+((endY-startY)/2), defaultHeight/2, degToRad(90), degToRad(270), false);
		ctx.lineTo(endX, startY);
		ctx.arc(endX, startY+((endY-startY)/2), defaultHeight/2, degToRad(270), degToRad(90), false);
		ctx.lineTo(startX, endY);
		ctx.stroke();
		ctx.fill();
	}
	
	function drawText(x, y, text, color, size) {
		ctx.fillStyle=color;
		ctx.font = size+"px Arial";
		ctx.beginPath();
		ctx.fillText(text, x, y);
	}
	
	function drawGridLine(startX, startY, endX, endY, width) {
		ctx.lineWidth = width;
		ctx.strokeStyle = gridLineColor;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	}
	
	function clear() {
		ctx.clearRect(-canvasX, -canvasY, width/zoom, height/zoom);
	}
	
	function degToRad(deg) {
		return deg*(Math.PI/180);
	}
	
	//POLYFILF IF BROWSER DOES NOT SUPPORT .includes
	if(!Array.prototype.includes) {
		Array.prototype.includes = function(searchElement) {
			if(this == null) throw new TypeError("Array.prototype.includes called on null or undefined");
			var O = Object(this);
			var len = parseInt(O.length, 10) || 0;
			if(len===0) return false;
			var n = parseInt(arguments[1], 10) || 0;
			var k;
			if(n>=0) k = n;
			else {
				k = len + n;
				if(k<0) k = 0;
			}
			var currentElement;
			while(k < len) {
				currentElement = O[k];
				if(searchElement===currentElement || (searchElement !== searchElement && currentElement !== currentElement)) return true;
				k++;
			}
			return false;
		};
	}
	
	//MOZILLA :focus replacement
	if(/Firefox/i.test(navigator.userAgent)) {
		$(".node, .button, #labelFile").on("mousedown", function(e) {
			$(".node, .button").removeClass("activated");
			$(this).addClass("activated");
		});
		$(document).on("mouseup", function(e) {
			$(".node, .button, #labelFile").removeClass("activated");
		});
	}
	
	//trigger file download
	function downloadProject(filename, datastring) {
		if(!window.navigator.msSaveBlob) {
			var element = document.createElement("a");
			element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(datastring));
			element.setAttribute("download", filename);
			element.style.display = "none";
			document.body.appendChild(element);
			element.click();
			document.body.removeChild(element);
		}
		else {
			var blobObject = new Blob([datastring]); 
			window.navigator.msSaveBlob(blobObject, filename);
		}
	}
	
	//get device
	function isMobile() {
		try {
			document.createEvent("TouchEvent");
			return true;
		}
		catch(e) {
			return false;
		}
	}
	
	//resize canvas to window
	$(window).on("resize", function() {
		ctx.canvas.height = $(window).height()-120;
		ctx.canvas.width = $(window).width();
		width = canvas.width;
		height = canvas.height;
		midX = width/2;
		midY = height/2;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.scale(zoom, zoom);
		ctx.translate(canvasX, canvasY);
		if(redraw!=undefined) redraw();
	});
	
	/*-----------------------------SETUP-------------------------------------------------------------*/
	
	var fileVersion = 4;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var zoom = 1;
	var zoomSpeed = 2;
	var maxZoom = 16;
	var minZoom = 0.03125;
	
	var panLastX = 0;
	var panLastY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var dragLastX = 0;
	var	dragLastY = 0;
	var startClickX = 0;
	var startClickY = 0;
	var globalX = 0;
	var globalY = 0;
	var realX = 0;
	var realY = 0;
	var dragId = 0;
	var lastDelay = 5;
	var lastPulser = 5;
	var holdingClick = false;
	var holdingCTRL = false;
	var lineStart = false;
	var lineLast = false;
	var mobile = isMobile();
	
	var nodes = [];
	var lines = [];
	var tickSpeed = 10;
	var mouseDelay = 10;
	var selected = "s";
	var state = "edit";
	var TimeoutID = 0;
	var ticks = 0;
	var unsaved = false;
	var darkMode = false;
	var showGrid = false;
	var gridSpacing = 42;
	var gridLineWidth = 1;
	var gridLineWidthBig = 2;
	var gridLineColor = "rgba(220, 220, 220, 255)";
	
	var fontSize = 16;
	var textSize = 28;
	var outlineWidth = 4;
	var lineWidth = 4;
	
	var blackColor = "rgba(0, 0, 0, 255)";//#000
	var redColor = "rgba(255, 0, 0, 255)";//#F00;
	var blueColor = "rgba(0, 0, 255, 255)";//#0000FF
	var greenColor = "rgba(0, 255, 0, 255)";//#0F0
	var noOutline = "rgba(0, 0, 0, 0)";
	var outlineColor = blackColor;
	
	var nodeUnpoweredColor = "rgba(200, 200, 200, 255)";//#C8C8C8
	var nodePoweredColor = redColor;
	var lineUnpoweredColor = blackColor;
	var lineUnpoweredGradient = "rgba(150, 150, 150, 255)";//#969696
	var linePoweredColor = redColor;
	var linePoweredGradient = "rgba(255, 150, 150, 255)";//#FF9696
	var textColor = blackColor;
	var textNameColor = blueColor;
	var textNodeColor = "rgba(128, 128, 128, 255)";//#808080
	var defaultRadius = 24;
	var defaultWidth = 80;
	var defaultHeight = 40;
	
	var design = {
		"s":{
			"fullName":"Switch",
			"shape":"circle",
			"radius":24,
			"outline":true,
			"textColor":blueColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":false
		},
		"b":{
			"fullName":"Button",
			"shape":"circle",
			"radius":24,
			"outline":true,
			"textColor":blueColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":false
		},
		"p":{
			"fullName":"Pulser",
			"shape":"circle",
			"radius":24,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"o":{
			"fullName":"OR",
			"shape":"rect",
			"width":60,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"a":{
			"fullName":"AND",
			"shape":"rect",
			"width":60,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"n":{
			"fullName":"NOT",
			"shape":"circle",
			"radius":24,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"d":{
			"fullName":"DELAY",
			"shape":"oval",
			"width":80,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"t":{
			"fullName":"TOGGLE",
			"shape":"rect",
			"width":80,
			"height":80,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"m":{
			"fullName":"MONOSTABLE",
			"shape":"rect",
			"width":112,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"r":{
			"fullName":"RANDOM",
			"shape":"circle",
			"radius":38,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true
		},
		"#":{
			"fullName":"NOTE",
			"shape":"rect",
			"width":40,
			"height":40,
			"outline":true,
			"textColor":greenColor,
			"textSize":16,
			"canStartLine":false,
			"canEndLine":true
		},
		"l":{
			"fullName":"OUTPUT",
			"shape":"rect",
			"width":gridSpacing,
			"height":gridSpacing,
			"outline":false,
			"textColor":blackColor,
			"textSize":16,
			"canStartLine":false,
			"canEndLine":true
		},
		"w":{
			"fullName":"Text",
			"shape":"rect",
			"outline":false,
			"textColor":blackColor,
			"textSize":28,
			"canStartLine":false,
			"canEndLine":false
		},
	};
	
	$(window).trigger("resize");
	
	//TAGS:   r,x1,x2,y1,y2, s=shape, n=name, t=type, p=powered, a=startID, b=endID, d=delay, c=countdown, f=fired, sp=startPowered
	//SHAPES: c=circle, r=rect=rectangle, o=oval
	//TYPES:  s=switch, b=button, p=pulser, *q=source*, o=or, a=and, n=not, d=delay, t=toggle, m=monostable, r=random, l=output(lamp), w=text
	
	/*----------------------EVENTS-/-HTML------------------------------------------------------------*/
	
	//prevent button dragging and highlighting
	$(document).on("mousedown", function(e) {
		if(e.which===1 && !$(e.target).is("input")) e.preventDefault();
	});
	
	//hide overlay
	$("#close").on("mousedown", function() {
		$("#information").scrollTop(0);
		$("input").blur();
		$(".popup, #overlay, #copyDone").addClass("hidden");
	});
	
	//show settings
	$("#settings").on("click", function() {
		$("#overlay, #popup_settings").removeClass("hidden");
	});
	
	//show info
	$("#info").on("click", function() {
		$("#overlay, #popup_info").removeClass("hidden");
	});
	
	//new project
	$("#new").on("click", function() {
		if(unsaved) {
			if(confirm("There are unsaved changes in this project.\nAre you sure you want to start a new one?")) {
				unsaved=false;
				nodes=[];
				lines=[];
				zoom=1;
				canvasX=0;
				canvasY=0;
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				tickSpeed=10;
				$("#speedSetting").html("Ticks per second: "+Math.round(1000/tickSpeed));
				dragId=0;
				lineStart=false;
				lineLast=false;
				unsaved=false;
				redraw();
			}
		}
	});
	
	//show load project
	$("#load").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_load").removeClass("hidden");
		$("#pasteImport").focus();
	});
	
	//show save project
	$("#save").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_save").removeClass("hidden");
		$("#exportSave").val(btoa(JSON.stringify([nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]])));
		$("#exportSave").focus();
	});
	
	//clipboard copy
	var textToCopy = "";
	var clipboardProject = new Clipboard("#copyButton", {
		text: function(trigger) {
			$("#copyDone").removeClass("hidden");
			return textToCopy=$("#exportSave").val();
		}
	});
	
	//DOWNLOAD PROJECT
	$("#downloadButton").on("click", function() {
		var filename=$("#downloadName").val();
		if(filename==false || filename==="" || filename==null) return;
		else if(filename.length>50) alert("The file name is too long!");
		else {
			downloadProject(filename+".lgb", btoa(JSON.stringify([nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]])));
			$("#overlay, #popup_save").addClass("hidden");
			unsaved=false;
		}
	});
	
	//load project from file button
	$("#inputFile").change(function() {
		var file=document.getElementById("inputFile").files[0];
		var inp=$("#inputFile");
		inp.replaceWith(inp=inp.clone(true));
		if(file.name.slice(-4)!==".lgb") alert("Unsupported file type!");
		else if(file.size>50000000) alert("File is too big!");
		else {
			var r = new FileReader();
			r.onload = function(e) {
				var content = e.target.result;
				if(content==="" || content==null || content==false) alert("The file is empty!");
				if(loadFile(content)) $(".popup, #overlay").addClass("hidden");
			};
			r.readAsText(file);
		}
	});
	
	//load project from text input
	$("#pasteButton").on("click", function() {
		var filedata = $("#pasteImport").val();
		if(filedata==="" || filedata==null || filedata==false) return false;
		if(loadFile(filedata)) $(".popup, #overlay").addClass("hidden");
	});

	//drag file over canvas
	$("#canvas").on("dragover", function(e) {
		e.preventDefault();
	});
	$("#canvas").on("dragenter", function() {
		$("#fileOverlay").stop();
		$("#fileOverlay").removeClass("hidden").animate({opacity:0.5}, 300);
	});
	$("#canvas").on("dragleave dragend", function(e) {
		e.stopPropagation();
		$("#fileOverlay").stop();
		$("#fileOverlay").animate({opacity:0}, 300, function() {$("#fileOverlay").addClass("hidden")});
	});
	//try to LOAD FILE
	$("#canvas").on("drop", function(e) {
		e.preventDefault();
		$("#fileOverlay").stop();
		$("#fileOverlay").css("opacity",0).addClass("hidden");
		var file=e.originalEvent.dataTransfer.files[0];
		if(file.name.slice(-4)!==".lgb") alert("Unsupported file type!");
		else if(file.size>50000000) alert("File is too big!");
		else {
			var r = new FileReader();
			r.onload = function(e) {
				var content = e.target.result;
				if(content==="" || content==null || content==false) alert("The file is empty!");
				else loadFile(content);
			};
			r.readAsText(file);
		}
	});
	
	//LOAD PROJECT
	function loadFile(loadProject) {
		if(state!=="edit") stopSimulation();
		var loadArr=false;
		try {
			loadArr = JSON.parse(atob(loadProject));
		}
		catch(err) {
			alert("Error!\nThe file you're trying to load is not a LogicBoard file!");
			return false;
		}
		var oldArr=[nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]];
		try {
			var loadArrInfo=loadArr[2];
			if(typeof(loadArrInfo)!=="object" || loadArrInfo[0]<fileVersion) {
				alert("This file comes from an older version and is no longer supported!");
				return false;
			}
			if(unsaved) if(!confirm("There are unsaved changes in your current project.\nAre you sure you want to load a different one?")) return false;
			nodes=loadArr[0];
			lines=loadArr[1];
			canvasX=loadArrInfo[1];
			canvasY=loadArrInfo[2];
			zoom=loadArrInfo[3];
			tickSpeed=loadArrInfo[4];
		}
		catch(err) {
			nodes=oldArr[0];
			lines=oldArr[1];
			canvasX=oldArr[2][1];
			canvasY=oldArr[2][2];
			zoom=oldArr[2][3];
			tickSpeed=oldArr[2][4];
			alert("Error!\nThe file you're trying to load is either corrupted or\nit isn't a LogicBoard file!");
			return false;
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(zoom, zoom);
		ctx.translate(canvasX, canvasY);
		$("#speedSetting").html("Ticks per second: "+Math.round(1000/tickSpeed));
		dragId=0;
		lineStart=false;
		lineLast=false;
		unsaved=false;
		redraw();
		return true;
	}
	
	//Change SPEED
	$("#speed").on("click", function() {
		var newSpeed = prompt("Ticks per second: (Hz)  [Default=100]", (1000/tickSpeed));
		if(newSpeed==null || newSpeed===false) return;
		else if(isNaN(parseFloat(newSpeed)) || parseFloat(newSpeed)<0.1 || parseFloat(newSpeed)>1000) alert("Invalid number!");
		else {
			tickSpeed=1000/parseFloat(newSpeed);
			$("#speedSetting").html("Ticks per second: "+newSpeed);
			updateDebug();
		}
	});
	
	//Enable Debug Info
	$("#debugSlider").on("click", function() {
		if($("#debugSlider").hasClass("activated")) {
			$("#debugSlider").removeClass("activated");
			$("#debug").addClass("hidden");
		}
		else {
			$("#debugSlider").addClass("activated");
			updateDebug();
			$("#debug").removeClass("hidden");
		}
	});
	
	//Show Grid Slider
	$("#gridSlider").on("click", function() {
		if($("#gridSlider").hasClass("activated")) {
			$("#gridSlider").removeClass("activated");
			showGrid=false;
		}
		else {
			$("#gridSlider").addClass("activated");
			showGrid=true;
		}
		redraw();
	});
	
	//Reset grid position when clicked
	$("#resetPosButton").on("click", function() {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		zoom=1;
		canvasX=0;
		canvasY=0;
		redraw();
	});
	
	//TOOLBAR - Select item
	$(".node, #delete, #edit, #replace, #select").on("click", function() {
		if(state==="edit") {
			if(lineStart!==false) {
				lineStart=false;
				$("#canvas").off("mousemove.line");
				redraw();
			}
			selected = $(this).attr("id");
			$(".node, #delete, #edit, #replace, #select").removeClass("selected");
			$(this).addClass("selected");
		}
	});
	
	//START click
	$("#start").on("click", function() {
		startSimulation();
	});
	
	//TOOLBAR - STOP / Pause / Step
	$("#StopControls .button").on("click", function() {
		if($(this).attr("id")==="stop") {
			stopSimulation();
		}
		else if($(this).attr("id")==="pause" && state==="paused") {
			state="running";
			$("#pause").attr("src", "icons/pause.png");
			$("#step").addClass("disabled");
			TimeoutID = setTimeout(Tick, tickSpeed);
		}
		else if($(this).attr("id")==="pause") {
			state="paused";
			$("#pause").attr("src", "icons/continue.png");
			$("#step").removeClass("disabled");
			clearTimeout(TimeoutID);
		}
		else if($(this).attr("id")==="step") {
			if(state==="paused") {
				Tick();
				clearTimeout(TimeoutID);
			}
		}
		else alert("Button Error");
	});
	
	//TOOLBAR zoom+
	$("#zoom").on("click", function() {
		zoomF();
		redraw();
	});
	
	//TOOLBAR zoom- (unzoom)
	$("#unzoom").on("click", function() {
		unzoomF();
		redraw();
	});
	
	//ZOOM+ FUNCTION
	function zoomF() {
		if(zoom<maxZoom) {
			ctx.translate(-canvasX, -canvasY);
			zoom=zoom*zoomSpeed;
			canvasX-=midX/zoom;
			canvasY-=midY/zoom;
			ctx.scale(zoomSpeed,zoomSpeed);
			ctx.translate(canvasX, canvasY);
			panLastX=globalX/zoom;
			panLastY=globalY/zoom;
			$("#unzoom").removeClass("disabled");
			if(!(zoom<maxZoom)) $("#zoom").addClass("disabled");
		}
	}
	
	//UNZOOM- FUNCTION
	function unzoomF() {
		if(zoom>minZoom) {
			ctx.translate(-canvasX, -canvasY);
			canvasX+=midX/zoom;
			canvasY+=midY/zoom;
			canvasX=Math.round(canvasX);
			canvasY=Math.round(canvasY);
			ctx.scale(1/zoomSpeed,1/zoomSpeed);
			ctx.translate(canvasX, canvasY);
			zoom=zoom/zoomSpeed;
			panLastX=globalX/zoom;
			panLastY=globalY/zoom;
			$("#zoom").removeClass("disabled");
			if(!(zoom>minZoom)) $("#unzoom").addClass("disabled");
		}
	}
	
	function centeredZoom(scrollAmount) {
		var canX=globalX/zoom;
		var canY=globalY/zoom;
		var adjustX = midX/zoom;
		var adjustY = midY/zoom;
		canvasX=canvasX-(canX-adjustX);
		canvasY=canvasY-(canY-adjustY);
		ctx.translate(-(canX-adjustX), -(canY-adjustY));
		canX=canX*zoom;
		canY=canY*zoom;
		if(scrollAmount > 0) {
			zoomF();
		}
		else{
			unzoomF();
		}
		canX=canX/zoom;
		canY=canY/zoom;
		adjustX = midX/zoom;
		adjustY = midY/zoom;
		canvasX=canvasX+(canX-adjustX);
		canvasY=canvasY+(canY-adjustY);
		ctx.translate(canX-adjustX, canY-adjustY);
		panLastX=globalX/zoom;
		panLastY=globalY/zoom;
		redraw();
	}
	
	//move UP canvas button
	$("#move_up").on("click", function() {
		canvasY+=gridSpacing/zoom;
		ctx.translate(0, gridSpacing/zoom);
		redraw();
	});
	
	//move DOWN canvas button
	$("#move_down").on("click", function() {
		canvasY-=gridSpacing/zoom;
		ctx.translate(0, -gridSpacing/zoom);
		redraw();
	});
	
	//move LEFT canvas button
	$("#move_left").on("click", function() {
		canvasX+=gridSpacing/zoom;
		ctx.translate(gridSpacing/zoom, 0);
		redraw();
	});
	
	//move RIGHT canvas button
	$("#move_right").on("click", function() {
		canvasX-=gridSpacing/zoom;
		ctx.translate(-gridSpacing/zoom, 0);
		redraw();
	});
	
	//TRACK global MOUSE coordinates - mousemove
	$("#canvas").on("mousemove.global", function(event) {
		var rect = canvas.getBoundingClientRect();
		globalX = event.clientX - rect.left;
		globalY = event.clientY - rect.top;
		realX = (globalX/zoom)-canvasX;
		realY = (globalY/zoom)-canvasY;
		updateDebug();
	});
	
	//Track CTRL state
	$(document).on("keydown", function(key) {
		if(parseInt(key.which, 10)===17) holdingCTRL = true;
	});
	$(document).on("keyup", function(key) {
		if(parseInt(key.which, 10)===17) holdingCTRL = false;
	});
	
	//KEYDOWN on canvas
	$(document).on("keydown", function(key) {
		//82=r, 17=ctrl, 70=f, 16=shift, 46=delete, 27=ESC, 32=Space, 109=-, 107=+, 69=e, 81=q
		//w=87 a=65 s=83 d=68  -  up=38 left=37 down=40 right=39
		if(!$("#overlay").hasClass("hidden")) {
			if(parseInt(key.which,10)===27 && !$("#overlay").hasClass("hidden")) $("#close").trigger("mousedown");
			return;
		}
		var keyID = parseInt(key.which,10);
		var canX=realX;
		var canY=realY;
		if($("#canvas:hover").length!=0) var obj = getClickedNode(canX, canY);
		else var obj=false;
		//KEY R - align to grid
		if(keyID===82 && state==="edit" && obj!==false) {
			var centerX = getMiddleX(obj);
			var centerY = getMiddleY(obj);
			var newX = Math.round(centerX/gridSpacing)*gridSpacing;
			var newY = Math.round(centerY/gridSpacing)*gridSpacing;
			if(nodes[obj].s!=="c") {
				var shiftX = newX-centerX;
				var shiftY = newY-centerY;
				nodes[obj].x1+=shiftX;
				nodes[obj].x2+=shiftX;
				nodes[obj].y1+=shiftY;
				nodes[obj].y2+=shiftY;
			}
			else {
				nodes[obj].x1=newX;
				nodes[obj].y1=newY;
			}
			unsaved=true;
			redraw();
		}//KEY F - quick new line
		else if(keyID===70 && state==="edit" && !holdingClick && lineLast!==false && selected==="line" && lineStart===false) {
			lineStart = lineLast;
			lineStartActivate();
			redraw();
		}//KEY DELETE - delete object
		else if((keyID===46 || keyID===81) && state==="edit" && !holdingClick && lineStart===false) {
			if(obj!==false) {
				deleteObj(obj);
				unsaved=true;
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					lines.splice(clickedLine, 1);
					unsaved=true;
				}
			}
			redraw();
		}//KEY WASD / up,left,down,right - PAN
		else if([87, 65, 83, 68, 38, 37, 40, 39].includes(keyID)) {
			var panAmount = gridSpacing/zoom;
			switch(keyID) {
				case 87: case 38://w - up
					canvasY+=panAmount;
					ctx.translate(0, panAmount);
					break;
				case 65: case 37://a - left
					canvasX+=panAmount;
					ctx.translate(panAmount, 0);
					break;
				case 83: case 40://s - down
					canvasY-=panAmount;
					ctx.translate(0, -panAmount);
					break;
				case 68: case 39://d - right
					canvasX-=panAmount;
					ctx.translate(-panAmount, 0);
					break;
			}
			redraw();
		}//KEY - UNZOOM
		else if(keyID===109) {
			if($("#canvas:hover").length!=0) centeredZoom(-1);
			else {
				unzoomF();
				redraw();
			}
		}//KEY + ZOOM
		else if(keyID===107) {
			if($("#canvas:hover").length!=0) centeredZoom(1);
			else {
				zoomF();
				redraw();
			}
		}//KEY E - Edit
		else if(keyID===69/*LOL*/ && state==="edit" && !holdingClick) {
			if(obj!==false) {
				if(editObj(obj, false)) {
					unsaved=true;
					redraw();
				}
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					if(editObj(false, clickedLine)) {
						unsaved=true;
						redraw();
					}
				}
			}
		}//KEY SPACE - Start/Stop Simulation
		else if(keyID===32 && !holdingClick) {
			if(state==="edit") {
				if(lineStart!==false) {
					lineStart=false;
					$("#canvas").off("mousemove.line");
				}
				startSimulation();
			}
			else stopSimulation();
			redraw();
		}//KEY Esc - Cancel
		else if(keyID===27) {
			if(lineStart!==false) {
				lineStart=false;
				$("#canvas").off("mousemove.line");
				redraw();
			}
			else if(state!=="edit" && !holdingClick) stopSimulation();
		}
	});
	
	//MOUSE ZOOM ScrollWheel
	$("#canvas").on("mousewheel DOMMouseScroll", function(e){
		if(!holdingCTRL) {
			var scrollAmount = (/Firefox/i.test(navigator.userAgent))? (e.originalEvent.detail*-1) : (e.originalEvent.wheelDelta/120);
			if((scrollAmount > 0 && zoom >= maxZoom) || (!(scrollAmount > 0) && zoom <= minZoom)) return;
			e.preventDefault();
			centeredZoom(scrollAmount);
		}
	});
	
	//////MAIN CLICK EVENT - click on canvas
	//confirm click - mouse up click
	function mainClickEnd() {
		$("#canvas").on("mouseup.main", function(e) {
			if(e.which===1) {
				$("#canvas").off("mousemove.start");
				$("#canvas").off("mouseup.main");
				setTimeout(mainClickStart, mouseDelay);
				clickOn(realX, realY);
			}
		});
	}//detect moving mouse - cancel main click
	function mainMoveStart() {
		$("#canvas").on("mousemove.start", function() {
			if(Math.abs(startClickX-globalX)>2 || Math.abs(startClickY-globalY)>5) {
				$("#canvas").off("mouseup.main");
				$("#canvas").off("mousemove.start");
				mainAltEnd();
				var clickResult = getClickedNode(realX, realY);
				if(selected==="line" && clickResult!==false && lineStart===false) {
					dragObj(clickResult);
				}
				else panActivate();
			}
		});
	}//stop holding mouse - alternative mouse up
	function mainAltEnd() {
		$(document).on("mouseup.end", function(e) {
			if(e.which===1) {
				$(document).off("mouseup.end");
				setTimeout(mainClickStart, mouseDelay);
			}
		});
	}//start holding mouse - determine next action
	function mainClickStart() {
		$("#canvas").on("mousedown.start", function(e) {
			if(e.which===1) {
				$("#canvas").off("mousedown.start");
				var canX=realX;
				var canY=realY;
				holdingClick = true;
				startClickX = globalX;
				startClickY = globalY;
				if(state!=="edit" || (getClickedNode(canX, canY)!==false && (!["delete", "edit", "replace", "select", "line"].includes(selected) && lineStart===false))) {
					mainAltEnd();
					clickOn(canX, canY);
				}
				else {
					mainMoveStart();
					mainClickEnd();
				}
			}
		});
	}
	mainClickStart();
	
	//MOUSE Drag Object - mousemove
	function nodeMoveActivate() {
		dragLastX = realX;
		dragLastY = realY;
		$("#canvas").on("mousemove.drag", function(event) {
			event.preventDefault();
			var canX=realX;
			var canY=realY;
			var moveX = canX-dragLastX;
			var moveY = canY-dragLastY;
			dragLastX = canX;
			dragLastY = canY;
			nodes[dragId].x1+=moveX;
			nodes[dragId].y1+=moveY;
			if(nodes[dragId].s!=="c") {
				nodes[dragId].x2+=moveX;
				nodes[dragId].y2+=moveY;
			}
			redraw();
		});
	}
	
	//MOUSE disable hold - mouseup
	$(document).on("mouseup", function(e) {
		if(e.which===1) {
			$("#canvas").off("mousemove.drag");
			$("#canvas").off("mousemove.pan");
			holdingClick = false;
		}
	});
	
	//MOUSE start line - mousemove
	function lineStartActivate() {
		$("#canvas").on("mousemove.line", function(event) {
			redraw();
		});
	}
	
	//MOUSE pan / translate canvas - mousemove
	function panActivate() {
		panLastX=globalX/zoom;
		panLastY=globalY/zoom;
		$("#canvas").on("mousemove.pan", function(event) {
			event.preventDefault();
			var canX=globalX/zoom;
			var canY=globalY/zoom;
			canvasX=canvasX+(canX-panLastX);
			canvasY=canvasY+(canY-panLastY);
			ctx.translate(canX-panLastX, canY-panLastY);
			panLastX = canX;
			panLastY = canY;
			redraw();
		});
	}
	
	/*-----------------------------CANVAS-LOGIC------------------------------------------------------*/
	
	//STOP Simulation
	function stopSimulation() {
		clearTimeout(TimeoutID);
		ticks=0;
		state="edit";
		$("#StartControls").removeClass("hidden");
		$("#StopControls").addClass("hidden");
		$("#pause").attr("src", "icons/pause.png");
		$("#step").addClass("disabled");
		$(".node, #EditControls .button").removeClass("disabled");
		resetPower();
		redraw();
	}
	
	//START SIMULATION
	function startSimulation() {
		$("#StartControls").addClass("hidden");
		$("#StopControls").removeClass("hidden");
		$(".node, #EditControls .button").addClass("disabled");
		if(lineStart!==false) {
			lineStart=false;
			$("#canvas").off("mousemove.line");
		}
		state="running";
		TimeoutID = setTimeout(Tick, tickSpeed);
		redraw();
	}
	
	//MAIN Tick loop
	function Tick() {
		TimeoutID = setTimeout(Tick, tickSpeed);
		ticks+=1;
		for(i=0; i<lines.length; i++) {
			lines[i].p = nodes[lines[i].a].p;
		}
		for(i=0; i<nodes.length; i++) {
			switch(nodes[i].t) {
				case "b":
					if(!holdingClick) nodes[i].p = false;
					break;
				case "a":
					nodes[i].p = testAnd(i);
					break;
				case "o": case "l":
					nodes[i].p = testOr(i);
					break;
				case "n":
					nodes[i].p = !testOr(i);
					break;
				case "d":
					var isPowered = testOr(i);
					if(isPowered && nodes[i].p) nodes[i].c=0;
					else if(isPowered || (nodes[i].c<nodes[i].d && !nodes[i].p)) {
						if(nodes[i].c<=0) nodes[i].p = true;
						else nodes[i].c--;
					}
					else {
						if(nodes[i].c>=nodes[i].d) nodes[i].p = false;
						else nodes[i].c++;
					}
					break;
				case "m":
					var isPowered = testOr(i);
					if(nodes[i].p) nodes[i].p = false;
					if(isPowered && !nodes[i].f) {
						nodes[i].f = true;
						nodes[i].p = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
				case "t":
					var isPowered = testOr(i);
					if(isPowered && !nodes[i].f) {
						nodes[i].p = !nodes[i].p;
						nodes[i].f = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
				case "p":
					if(nodes[i].p) nodes[i].p = false;
					if(nodes[i].c>0) nodes[i].c--;
					else {
						nodes[i].p = true;
						nodes[i].c = nodes[i].d;
					}
					break;
				case "r":
					var isPowered = testOr(i);
					if(nodes[i].p) nodes[i].p = false;
					if(isPowered && !nodes[i].f) {
						nodes[i].p = Math.random()>=0.5;
						nodes[i].f = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
			}
		}
		redraw();
	}
	
	//get AND connection
	function testAnd(id) {
		var result = false;
		for(j=0; j<lines.length; j++) {
			if(lines[j].b===id && lines[j].p) result = true;
			if(lines[j].b===id && !lines[j].p) {
				result = false;
				break;
			}
		}
		return result;
	}
	
	//get OR connection
	function testOr(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].b===id && lines[j].p) return true;
		}
		return false;
	}
	
	//RESET Objects after simulation STOP
	function resetPower() {
		for(j=0; j<nodes.length; j++) {
			if(nodes[j].sp!=undefined) nodes[j].p = nodes[j].sp;
			else if(nodes[j].t!=="q") nodes[j].p = false;
			if(["d", "p"].includes(nodes[j].t)) nodes[j].c = nodes[j].d;
			if(nodes[j].f!=undefined) nodes[j].f = false;
		}
		for(j=0; j<lines.length; j++) {
			lines[j].p = false;
		}
	}
	
	//get object name from letter
	function getFullName(n) {
		switch(n) {
			case "s": return "switch";
			case "b": return "button";
			case "p": return "pulser";
			case "q": return "source";
			case "o": return "or";
			case "a": return "and";
			case "n": return "not";
			case "d": return "delay";
			case "t": return "toggle";
			case "m": return "monostable";
			case "r": return "random";
			case "l": return "output";
			case "w": return "text";
			default: return false;
		}
	}
	
	//get object middle X
	function getMiddleX(node) {
		if(nodes[node].s==="c") return nodes[node].x1;
		else return nodes[node].x1+((nodes[node].x2-nodes[node].x1)/2);
	}
	
	//get object middle Y
	function getMiddleY(node) {
		if(nodes[node].s==="c") return nodes[node].y1;
		else return nodes[node].y1+((nodes[node].y2-nodes[node].y1)/2);
	}
	
	//Find duplicate line - prevent creating multiple identical lines
	function findDuplicateLine(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].a===lineStart && lines[j].b===id) return true;
		}
		return false;
	}
	
	//SHIFT / recalculate IDs after object delete/drag
	function reorganize(pos) {
		var uptop = [];
		for(j=0; j<lines.length; j++) {
			if(lines[j].a===pos) uptop.push([j, 1]);
			if(lines[j].b===pos) uptop.push([j, 2]);
			if(lines[j].a>pos) lines[j].a--;
			if(lines[j].b>pos) lines[j].b--;
		}
		for(j=0; j<uptop.length; j++) {
			if(uptop[j][1]===1) lines[uptop[j][0]].a=nodes.length-1;
			if(uptop[j][1]===2) lines[uptop[j][0]].b=nodes.length-1;
		}
		if(lineLast!==false) {
			if(lineLast>pos) lineLast--;
			else if(lineLast===pos) lineLast=nodes.length-1;
		}
	}
	
	//DELETE object
	function deleteObj(id) {
		for(j = lines.length-1; j>=0; j--) {
			if(lines[j].a===id || lines[j].b===id) lines.splice(j, 1);
		}
		if(id<nodes.length-1) {
			nodes.splice(id, 1);
			reorganize(id);
		}
		else nodes.splice(id, 1);
	}
	
	//EDIT object
	function editObj(id, lineID) {
		if(id!==false) {
			if(["d", "b", "s", "w", "l", "n", "p", "t"].includes(nodes[id].t)) {
				switch(nodes[id].t) {
					case "d": case "p"://DELAY - PULSER
						var delay=prompt("Set delay: (ticks)", nodes[id].d);
						if(isNaN(parseFloat(delay)) || parseFloat(delay)<1) alert("Invalid number!");
						else {
							nodes[id].d=Math.round(parseFloat(delay));
							nodes[id].c=Math.round(parseFloat(delay));
						}
						break;
					case "w"://TEXT
						var name = prompt("Enter text:", nodes[id].n);
						if(name!=undefined && name!=="" && name!==" " && name!==nodes[id].n) {
							var mX = getMiddleX(id);
							ctx.font = textSize+"px Arial";
							var measure = ctx.measureText(name).width/2;
							nodes[id].n = name;
							nodes[id].x1 = Math.round(mX-measure);
							nodes[id].x2 = Math.round(mX+measure);
						}
						break;
					case "n": case "t"://NOT - TOGGLE
						nodes[id].p = !nodes[id].p;
						nodes[id].sp = !nodes[id].sp;
						break;
					default: //BUTTON - SWITCH - OUTPUT LAMP
						var name = prompt("Enter name:", nodes[id].n);
						if(name!=undefined && name!==nodes[id].n) nodes[id].n = name;
				}
				return true;
			}
		}
		else if(lineID!==false) {
			lineStart = lines[lineID].a;
			lines.splice(lineID, 1);
			lineLast = lineStart;
			lineStartActivate();
			return true;
		}
		return false;
	}
	
	//DRAG object
	function dragObj(id) {
		if(id<nodes.length-1) {
			var obj = nodes[id];
			nodes.splice(id, 1);
			nodes.push(obj);
			reorganize(id);
		}
		dragId=nodes.length-1;
		redraw();
		nodeMoveActivate();
		unsaved=true;
	}
	
	//Draw grid
	function drawGrid() {
		var scrStartX = -canvasX;
		var scrStartY = -canvasY;
		var scrEndX = scrStartX+(width/zoom);
		var scrEndY = scrStartY+(height/zoom);
		for(x = Math.round(scrStartX/gridSpacing)*gridSpacing; x<=scrEndX; x+=gridSpacing) {
			if(x%(gridSpacing*2)===0) drawGridLine(x, scrStartY, x, scrEndY, gridLineWidthBig);
			else drawGridLine(x, scrStartY, x, scrEndY, gridLineWidth);
		}
		for(y = Math.round(scrStartY/gridSpacing)*gridSpacing; y<=scrEndY; y+=gridSpacing) {
			if(y%(gridSpacing*2)===0) drawGridLine(scrStartX, y, scrEndX, y, gridLineWidthBig);
			else drawGridLine(scrStartX, y, scrEndX, y, gridLineWidth);
		}
	}
	
	//MAIN RENDER EVERYTHING - redrawAll
	function redraw() {
		clear();
		if(showGrid && zoom>=0.125) drawGrid();
		for(i=0; i<lines.length; i++) {
			drawLine(getMiddleX(lines[i].a), getMiddleY(lines[i].a), getMiddleX(lines[i].b), getMiddleY(lines[i].b), lines[i].p, lineWidth);
		}
		for(i=0; i<nodes.length; i++) {
			switch(nodes[i].t) {
				case "w"://TEXT
					drawText(getMiddleX(i), getMiddleY(i), nodes[i].n, textColor, textSize);
					break;//BUTTON - SWITCH
				case "s": case "b":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, nodes[i].p, outlineColor, outlineWidth);
					if(nodes[i].n!="") drawText(nodes[i].x1, nodes[i].y1, nodes[i].n, textNameColor, fontSize);
					break;
				case "q"://SOURCE
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, nodes[i].p, outlineColor, outlineWidth);
					drawText(nodes[i].x1, nodes[i].y1, "+", textColor, textSize);
					break;
				case "o": case "a": case "t": case "m"://AND - OR - TOGGLE - MONOSTABLE
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, nodes[i].p, outlineColor, outlineWidth);
					drawText(getMiddleX(i),getMiddleY(i), getFullName(nodes[i].t).toUpperCase(), textNodeColor, fontSize);
					break;
				case "n": case "r"://NOT - RANDOM
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, nodes[i].p, outlineColor, outlineWidth);
					drawText(nodes[i].x1, nodes[i].y1, getFullName(nodes[i].t).toUpperCase(), textNodeColor, fontSize);
					break;
				case "d"://DELAY
					drawOval(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, nodes[i].p, outlineColor, outlineWidth);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].d, textNodeColor, fontSize);
					break;
				case "l"://OUTPUT LAMP
					if(zoom<1) drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, nodes[i].p, noOutline, Math.log(1/zoom) / Math.log(2));
					else drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, nodes[i].p, noOutline, 0);
					if(nodes[i].n!="") drawText(getMiddleX(i),getMiddleY(i), nodes[i].n, textColor, fontSize);
					break;
				case "p"://PULSER
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, nodes[i].p, outlineColor, outlineWidth);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].d, textNodeColor, fontSize);
					break;
			}
		}
		if(lineStart!==false) {
			if(nodes[lineStart].s==="c") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, realX, realY, false, lineWidth);
			else drawLine(getMiddleX(lineStart), getMiddleY(lineStart), realX, realY, false, lineWidth);
		}
		updateDebug();
	}
	
	function updateDebug() {
		$("#debug").html("mouseX="+globalX+", mouseY="+globalY+"<br/>gridX="+realX+", gridY="+realY+"<br/>moveX="+canvasX+", moveY="+canvasY+"<br/>nodes: "+nodes.length+", lines: "+lines.length+", zoom: "+zoom+"<br/>TPS: "+Math.round(1000/tickSpeed)+", ticks: "+ticks);
	}
	
	//GET CLICKED OBJECT ID
	function getClickedNode(x, y) {
		if(nodes.length===0) return false;
		for(i = nodes.length-1; i>=0; i--) {
			if(nodes[i].s==="r") {//rectangle
				if(x>=nodes[i].x1-outlineWidth/2 && nodes[i].x2+outlineWidth/2>=x && y>=nodes[i].y1-outlineWidth/2 && nodes[i].y2+outlineWidth/2>=y) return i;
			}//oval
			else if(nodes[i].s==="o") {
				if((x>=nodes[i].x1+(defaultHeight/2) && nodes[i].x2-(defaultHeight/2)>=x && y>=nodes[i].y1-outlineWidth/2 && nodes[i].y2+outlineWidth/2>=y) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x1+(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=(defaultHeight+outlineWidth)/2) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x2-(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=(defaultHeight+outlineWidth)/2)) return i;
			}//circle
			else {
				if(Math.sqrt(Math.pow(Math.abs(nodes[i].x1-x), 2)+Math.pow(Math.abs(nodes[i].y1-y), 2))<=nodes[i].r+outlineWidth/2) return i;
			}
		}
		return false;
	}
	
	//GET CLICKED LINE ID
	function getClickedLine(x, y) {
		if(lines.length===0) return false;
		for(i = lines.length-1; i>=0; i--) {
			if((Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].a)-x), 2)+Math.pow(Math.abs(getMiddleY(lines[i].a)-y), 2))+Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].b)-x), 2)+Math.pow(Math.abs(getMiddleY(lines[i].b)-y), 2)))<(Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].a)-getMiddleX(lines[i].b)), 2)+Math.pow(Math.abs(getMiddleY(lines[i].a)-getMiddleY(lines[i].b)), 2))+0.08)) return i;
		}
		return false;
	}
	
	//MAIN - CANVAS CLICK EVENTS - PLACE OBJECT, EDIT, DELETE, LINE, PAN...
	function clickOn(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(state==="paused" || (state==="running" && (clickResult===false || (nodes[clickResult].t!=="b" && nodes[clickResult].t!=="s")))) {
			panActivate();
		}
		else if(state==="edit") {
			var clickResultLine = getClickedLine(x, y);
			if(selected==="line" || lineStart!==false) {//LINE
				if(lineStart===false && clickResult!==false) {//START LINE
					if(["s", "b", "n", "q", "d", "o", "a", "p", "r", "t", "m"].includes(nodes[clickResult].t)) {
						lineStart = clickResult;
						lineLast = lineStart;
						lineStartActivate();
					}
				}
				else if(lineStart!==false) {//END/CREATE LINE
					if(!(clickResult===false || clickResult===lineStart) && ["o", "a", "n", "d", "l", "r", "t", "m"].includes(nodes[clickResult].t) && !findDuplicateLine(clickResult)) {
						lines.push({a:lineStart, b:clickResult});
						unsaved=true;
					}
					lineStart=false;
					$("#canvas").off("mousemove.line");
				}
			}
			else if(!["select", "edit", "delete", "replace"].includes(selected)) {
				if(clickResult!==false) {//ACTIVATE DRAG OBJECT
					dragObj(clickResult);
				}
				else {//CREATE NEW OBJECT
					switch(selected) {
						case "s"://SWITCH
							nodes.push({s:"c", t:selected, n:"Switch", r:defaultRadius, p:false, x1:x, y1:y});
							break;
						case "b"://BUTTON
							nodes.push({s:"c", t:selected, n:"Button", r:defaultRadius, p:false, x1:x, y1:y});
							break;
						case "o": case "a"://AND - OR
							nodes.push({s:"r", t:selected, p:false, x1:x-(defaultWidth/2)+10, y1:y-(defaultHeight/2), x2:x+(defaultWidth/2)-10, y2:y+(defaultHeight/2)});
							break;
						case "d"://DELAY
							var delay=prompt("Set delay: (ticks)", lastDelay);
							if(isNaN(parseFloat(delay)) || parseFloat(delay)<1) alert("Invalid number!");
							else {
								nodes.push({s:"o", t:"d", p:false, d:Math.round(parseFloat(delay)), c:Math.round(parseFloat(delay)), x1:x-(defaultWidth/2), y1:y-(defaultHeight/2), x2:x+(defaultWidth/2), y2:y+(defaultHeight/2)});
								lastDelay = Math.round(parseFloat(delay));
							}
							break;
						case "n"://NOT
							nodes.push({s:"c", t:"n", r:defaultRadius, p:true, sp:true, x1:x, y1:y});
							break;
						case "l"://OUTPUT LAMP
							nodes.push({s:"r", t:"l", p:false, n:"", x1:(Math.round(x/defaultHeight)*defaultHeight)-(defaultHeight/2), y1:(Math.round(y/defaultHeight)*defaultHeight)-(defaultHeight/2), x2:(Math.round(x/defaultHeight)*defaultHeight)+(defaultHeight/2), y2:(Math.round(y/defaultHeight)*defaultHeight)+(defaultHeight/2)});
							break;
						case "q"://SOURCE
							nodes.push({s:"c", t:"q", r:defaultRadius, p:true, x1:x, y1:y});
							break;
						case "p"://PULSER
							var delay=prompt("Set delay: (ticks)", lastPulser);
							if(isNaN(parseFloat(delay)) || parseFloat(delay)<1) alert("Invalid number!");
							else {
								nodes.push({s:"c", t:"p", r:defaultRadius, p:false, x1:x, y1:y, d:Math.round(parseFloat(delay)), c:Math.round(parseFloat(delay))});
								lastPulser = Math.round(parseFloat(delay));
							}
							break;
						case "r"://RANDOM
							nodes.push({s:"c", t:"r", r:defaultRadius+14, p:false, x1:x, y1:y, f:false});
							break;
						case "t"://TOGGLE
							nodes.push({s:"r", t:"t", p:false, sp:false, f:false, x1:x-(defaultWidth/2), y1:y-(defaultWidth/2), x2:x+(defaultWidth/2), y2:y+(defaultWidth/2)});
							break;
						case "m"://MONOSTABLE
							nodes.push({s:"r", t:"m", p:false, f:false, x1:x-(defaultWidth/2)-16, y1:y-(defaultHeight/2), x2:x+(defaultWidth/2)+16, y2:y+(defaultHeight/2)});
							break;
						case "w"://TEXT
							var text = prompt("Enter text:");
							if(text!=undefined && text!=="" && text!==" ") {
								ctx.font = textSize+"px Arial";
								var measure = ctx.measureText(text).width/2;
								nodes.push({s:"r", t:"w", n:text, x1:Math.round(x-measure), y1:y-(textSize/2), x2:Math.round(x+measure), y2:y+(textSize/2)});
							}
							break;
					}
					unsaved=true;
				}
			}
			else if(selected==="delete") {
				if(clickResult!==false) {//DELETE OBJECT
					deleteObj(clickResult);
					unsaved=true;
				}
				else if(clickResultLine!==false) {//DELETE LINE
					lines.splice(clickResultLine, 1);
					unsaved=true;
				}
			}//EDIT OBJECT PROPERTIES
			else if(selected==="edit" && (clickResult!==false || clickResultLine!==false)) {
				if(editObj(clickResult, clickResultLine)) unsaved=true;
			}//REPLACE OBJECT
			else if(selected==="replace" && clickResult!==false) {
				alert("Not yet implemented!");
				//var oldObj=nodes[clickResult];
				//unsaved=true;
			}
		}//CLICK BUTTON / SWITCH while running
		else if(state==="running" && clickResult!==false) {
			if(nodes[clickResult].t==="b") nodes[clickResult].p=true;
			else if(nodes[clickResult].t==="s") nodes[clickResult].p=!nodes[clickResult].p;
		}
		redraw();
	}
	
	//Confirm Leaving the page with unsaved changes
	window.onbeforeunload = function(){
		if(unsaved) return "There are unsaved changes.\nAre you sure you want to leave?";
	}
	
	//Remove Endora text
	$("i").parent().parent().parent().remove();
});