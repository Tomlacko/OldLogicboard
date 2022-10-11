$(document).ready(function() {
	
	function drawCircle(x, y, r, power, outline) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle = outlineColor;
		ctx.lineWidth = outlineWidth;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		if(outline) ctx.stroke();
		ctx.fill();
	}
	
	function drawLine(startX, startY, endX, endY, power) {
		ctx.lineWidth = lineWidth;
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
	
	function drawRect(startX, startY, endX, endY, power, outline, outlineW) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle=outlineColor;
		ctx.lineWidth=outlineWidth;
		ctx.beginPath();
		ctx.rect(startX, startY, endX-startX, endY-startY);
		if(outline) ctx.stroke();
		ctx.fill();
	}
	
	function drawOval(startX, startY, endX, endY, power, outline) {
		if(power) ctx.fillStyle = nodePoweredColor;
		else ctx.fillStyle = nodeUnpoweredColor;
		ctx.strokeStyle=outlineColor;
		ctx.lineWidth=outlineWidth;
		ctx.beginPath();
		var h=(endY-startY)/2;
		startX+=h;
		endX-=h;
		ctx.arc(startX, startY+h, h, degToRad(90), degToRad(270), false);
		ctx.lineTo(endX, startY);
		ctx.arc(endX, startY+h, h, degToRad(270), degToRad(90), false);
		ctx.lineTo(startX, endY);
		if(outline) ctx.stroke();
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
		ctx.canvas.height = Math.max($(window).height()-120, 10);
		ctx.canvas.width = Math.max($(window).width(), 10);
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
	
	var fileVersion = 5;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var zoom = 1;
	var zoomSpeed = 2;
	var maxZoom = 16;
	var minZoom = 0.03125;
	var maxUndoSize = 100;
	
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
	var dragging = false;
	var holdingClick = false;
	var holdingCTRL = false;
	var lineStart = false;
	var lineLast = false;
	var mobile = isMobile();
	
	var nodes = [];
	var lines = [];
	var undoStack = [];
	var undoPointer = -1;
	var undoTrackView = false;
	var tickSpeed = 10;
	var mouseDelay = 10;
	var selected = 1;
	var selectedNode = 1;
	var state = "edit";
	var TimeoutID = 0;
	var ticks = 0;
	var savePointer = 0;
	var darkMode = false;
	var showGrid = false;
	var gridSpacing = 42;
	var gridLineWidth = 1;
	var gridLineWidthBig = 2;
	var gridLineColor = "rgba(220, 220, 220, 255)";//#DCDCDC
	
	var fontSize = 16;
	var textSize = 28;
	var outlineWidth = 4;
	var lineWidth = 4;
	var lineClickRadius = 0.08;
	
	var blackColor = "rgba(0, 0, 0, 255)";//#000
	var redColor = "rgba(255, 0, 0, 255)";//#F00
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
	var textNodeColor = "rgba(128, 128, 128, 255)";//#808080
	
	var design = [
		null,
		{//1
			"fullName":"Switch",
			"shape":"circle",
			"radius":30,
			"outline":true,
			"textColor":blueColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":false,
			"editable":true
		},
		{//2
			"fullName":"Button",
			"shape":"circle",
			"radius":30,
			"outline":true,
			"textColor":blueColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":false,
			"editable":true
		},
		{//3
			"fullName":"Pulser",
			"shape":"circle",
			"radius":30,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":true
		},
		{//4
			"fullName":"OR",
			"shape":"rect",
			"width":60,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":false
		},
		{//5
			"fullName":"AND",
			"shape":"rect",
			"width":60,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":false
		},
		{//6
			"fullName":"NOT",
			"shape":"circle",
			"radius":20,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":true
		},
		{//7
			"fullName":"DELAY",
			"shape":"oval",
			"width":80,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":true
		},
		{//8
			"fullName":"TOGGLE",
			"shape":"rect",
			"width":80,
			"height":80,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":true
		},
		{//9
			"fullName":"MONOSTABLE",
			"shape":"rect",
			"width":112,
			"height":40,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":false
		},
		{//10
			"fullName":"RANDOM",
			"shape":"circle",
			"radius":38,
			"outline":true,
			"textColor":textNodeColor,
			"textSize":16,
			"canStartLine":true,
			"canEndLine":true,
			"editable":false
		},
		{//11
			"fullName":"NOTE",
			"shape":"rect",
			"width":40,
			"height":40,
			"outline":true,
			"textColor":greenColor,
			"textSize":16,
			"canStartLine":false,
			"canEndLine":true,
			"editable":true
		},
		{//12
			"fullName":"Output",
			"shape":"rect",
			"width":gridSpacing,
			"height":gridSpacing,
			"outline":false,
			"textColor":blackColor,
			"textSize":16,
			"canStartLine":false,
			"canEndLine":true,
			"editable":true
		},
		{//13
			"fullName":"Text",
			"shape":"rect",
			"outline":false,
			"textColor":blackColor,
			"textSize":28,
			"canStartLine":false,
			"canEndLine":false,
			"editable":true
		}
	];
	
	$(window).trigger("resize");
	addUndo();
	
	/*
	TAGS:   r,x,y, *s=shape*, n=name/note, t=type, p=powered, a=startID, b=endID, d=delay, c=countdown, f=fired, q=startPowered, w=width(text)
	
	SHAPES: c=circle, r=rect=rectangle, o=oval
	
	TYPES:  (1)s=switch, (2)b=button, (3)p=pulser, *q=source*, (4)o=or, (5)a=and, (6)n=not,
	        (7)d=delay, (8)t=toggle, (9)m=monostable, (10)r=random, (11)#=note, (12)l=output(lamp), (13)w=text
	*/
	
	/*----------------------EVENTS-/-HTML------------------------------------------------------------*/
	
	//prevent button dragging and highlighting
	$(document).on("mousedown", function(e) {
		if(e.which===1 && !$(e.target).is("input")) e.preventDefault();
		if($(document.activeElement).parent().parent().is("#place")) $(".placeOpt:not(.hidden) input").blur();
	});
	
	//click on BUTTONS/NODES - activated effect
	$(".node, .button, #labelFile").on("mousedown", function(e) {
		if(e.which===1) {
			$(".node, .button").removeClass("activated");
			$(this).addClass("activated");
		}
	});
	$(document).on("mouseup", function(e) {
		$(".node, .button, #labelFile").removeClass("activated");
	});
	
	//hide overlay
	$("#close").on("mousedown", function(e) {
		if(e.which===1) {
			$("#information").scrollTop(0);
			$("input").blur();
			$(".popup, #overlay, #copyDone").addClass("hidden");
		}
	});
	
	//sliders
	$(".slider").on("click", function() {
		if($(this).hasClass("activated")) {
			$(this).removeClass("activated");
		}
		else {
			$(this).addClass("activated");
		}
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
		if(unsaved()) {
			if(!confirm("There are unsaved changes in this project.\nAre you sure you want to start a new one?")) return;
		}
		else {
			if(!confirm("Are you sure you want to start a new project?")) return
		}
		nodes=[];
		lines=[];
		zoom=1;
		canvasX=0;
		canvasY=0;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		tickSpeed=10;
		$("#speedSetting").html("Ticks per second: 100");
		dragId=0;
		lineStart=false;
		lineLast=false;
		addUndo();
		save();
		redraw();
	});
	
	//show load project
	$("#load").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_load").removeClass("hidden");
		$("#pasteImport").focus();
		setTimeout(function() {$("#pasteImport").select();}, 1);
	});
	
	//show save project
	$("#save").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_save").removeClass("hidden");
		$("#exportSave").val(btoa(JSON.stringify([nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]])));
		$("#downloadName").focus();
		setTimeout(function() {$("#downloadName").select();}, 1);
	});
	
	//clipboard copy
	var clipboardProject = new Clipboard("#copyButton", {
		text: function(trigger) {
			$("#copyDone").removeClass("hidden");
			setTimeout(function() {$("#exportSave").select();}, 1);
			save();
			return textToCopy=$("#exportSave").val();
		}
	});
	
	//DOWNLOAD PROJECT
	$("#downloadButton").on("click", function() {
		var filename=$("#downloadName").val();
		if(filename===false || filename==="" || filename==null) return;
		else if(filename.length>50) alert("The file name is too long!");
		else {
			downloadProject(filename+".lgb", btoa(JSON.stringify([nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]])));
			$("#overlay, #popup_save").addClass("hidden");
			save();
		}
	});
	
	//LOAD project from file button
	$("#inputFile").change(function() {
		var file=document.getElementById("inputFile").files[0];
		var inp=$("#inputFile");
		inp.replaceWith(inp=inp.clone(true));
		var fName = file.name;
		if(fName.slice(-4)!==".lgb") alert("Unsupported file type!");
		else if(file.size>50000000/*50MB*/) alert("File is too big!");
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
	//LOAD project from Drag & Drop
	$("#canvas").on("drop", function(e) {
		e.preventDefault();
		$("#fileOverlay").stop();
		$("#fileOverlay").css("opacity",0).addClass("hidden");
		var file=e.originalEvent.dataTransfer.files[0];
		var fName = file.name;
		if(fName.slice(-4)!==".lgb") alert("Unsupported file type!");
		else if(file.size>50000000/*50MB*/) alert("File is too big!");
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
		var oldArr=[JSON.parse(JSON.stringify(nodes)), JSON.parse(JSON.stringify(lines)), [fileVersion, canvasX, canvasY, zoom, tickSpeed]];
		try {
			var loadArrInfo=loadArr[2];
			if(typeof(loadArrInfo)!=="object" || loadArrInfo[0]<fileVersion) {
				alert("This file comes from an older version and is no longer supported!");
				return false;
			}
			if(unsaved()) if(!confirm("There are unsaved changes in your current project.\nAre you sure you want to load a different one?")) return false;
			nodes=loadArr[0];
			lines=loadArr[1];
			canvasX=loadArrInfo[1];
			canvasY=loadArrInfo[2];
			zoom=loadArrInfo[3];
			tickSpeed=loadArrInfo[4];
			addUndo();
			save();
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
		redraw();
		return true;
	}
	
	//Change SPEED
	$("#speed").on("click", function() {
		var newSpeed = prompt("Ticks per second: (Hz)  [Default=100]", (1000/tickSpeed));
		newSpeed = formatNum(newSpeed);
		if(newSpeed===false) return;
		if(newSpeed<0.1 || newSpeed>1000) alert("Invalid number!");//popupMsg();
		else {
			tickSpeed=1000/newSpeed;
			$("#speedSetting").html("Ticks per second: "+newSpeed);
			updateDebug();
		}
	});
	
	//Enable Debug Info
	$("#debugSlider").on("click", function() {
		if($("#debug").hasClass("hidden")) {
			updateDebug();
			$("#debug").removeClass("hidden");
		}
		else {
			$("#debug").addClass("hidden");
		}
	});
	
	//Show Grid Slider
	$("#gridSlider").on("click", function() {
		if(showGrid) {
			showGrid=false;
		}
		else {
			showGrid=true;
		}
		redraw();
	});
	
	//Track viewport with UNDO
	$("#undoSlider").on("click", function() {
		if(undoTrackView) {
			undoTrackView = false;
		}
		else {
			undoTrackView=true;
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
	
	$("#place").on("mouseenter", function() {
		$(".placeOpt:not(.hidden) input").focus();
	});
	
	/*
	$("#place").on("mouseleave", function() {
		$(".placeOpt:not(.hidden) input").blur();
	});
	*/
	
	//TOOLBAR - Select item
	$(".node, #delete, #edit, #replace, #select").on("click", function() {
		if(state==="edit" && !$(this).hasClass("disabled")) {
			if(lineStart!==false) {
				lineStart=false;
				$("#canvas").off("mousemove.line");
				redraw();
			}
			if($(this).hasClass("selected") && ($(this).is("#delete") || $(this).is("#edit") || $(this).is("#replace") || $(this).is("#select"))) {
				$(this).removeClass("selected");
				selected = selectedNode;
				if($("#place"+selected).length===1) $("#place, #place"+selected).removeClass("hidden");
				return;
			}
			if($(this).hasClass("node")) $(".node, #delete, #edit, #replace, #select").removeClass("selected");
			else {
				$("#delete, #edit, #replace, #select").removeClass("selected");
				if($(this).is("#replace") && $("#place"+selected).length===1) $("#place").removeClass("hidden");
			}
			if($(this).hasClass("node") && !$(this).is("#line")) {
				selected = parseInt($(this).attr("id"));
				selectedNode = selected;
				$("#replace").removeClass("disabled");
				$(".placeOpt").addClass("hidden");
				if($("#place"+selected).length===1) $("#place, #place"+selected).removeClass("hidden");
				else $("#place").addClass("hidden");
			}
			else {
				selected = $(this).attr("id");
				if(!$(this).is("#replace")) $("#place").addClass("hidden");
				if($(this).is("#line")) $("#replace").addClass("disabled");
			}
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
	
	//BUTTON zoom+
	$("#zoom").on("click", function() {
		zoomF();
		redraw();
	});
	
	//BUTTON zoom- (unzoom)
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
			if(zoom===maxZoom) $("#zoom").addClass("disabled");
		}
	}
	
	//UNZOOM- FUNCTION
	function unzoomF() {
		if(zoom>minZoom) {
			ctx.translate(-canvasX, -canvasY);
			canvasX+=midX/zoom;
			canvasY+=midY/zoom;
			if(zoom<=2) {
				canvasX=Math.round(canvasX);
				canvasY=Math.round(canvasY);
			}
			ctx.scale(1/zoomSpeed,1/zoomSpeed);
			ctx.translate(canvasX, canvasY);
			zoom=zoom/zoomSpeed;
			panLastX=globalX/zoom;
			panLastY=globalY/zoom;
			$("#zoom").removeClass("disabled");
			if(zoom===minZoom) $("#unzoom").addClass("disabled");
		}
	}
	
	//ZOOM CENTERED on mouse cursor
	function centeredZoom(scrollAmount) {
		var canX=globalX/zoom;
		var canY=globalY/zoom;
		var adjustX = midX/zoom;
		var adjustY = midY/zoom;
		canvasX-=canX-adjustX;
		canvasY-=canY-adjustY;
		ctx.translate(adjustX-canX, adjustY-canY);
		if(scrollAmount > 0) {
			zoomF();
		}
		else{
			unzoomF();
		}
		canX=globalX/zoom;
		canY=globalY/zoom;
		adjustX = midX/zoom;
		adjustY = midY/zoom;
		if(zoom<=1) {
			canvasX+=Math.round(canX-adjustX);
			canvasY+=Math.round(canY-adjustY);
			ctx.translate(Math.round(canX-adjustX), Math.round(canY-adjustY));
		}
		else {
			canvasX+=canX-adjustX;
			canvasY+=canY-adjustY;
			ctx.translate(canX-adjustX, canY-adjustY);
		}
		panLastX=globalX/zoom;
		panLastY=globalY/zoom;
		redraw();
	}
	
	//BUTTON move UP
	$("#move_up").on("click", function() {
		canvasY+=gridSpacing/zoom;
		ctx.translate(0, gridSpacing/zoom);
		redraw();
	});
	
	//BUTTON move DOWN
	$("#move_down").on("click", function() {
		canvasY-=gridSpacing/zoom;
		ctx.translate(0, -gridSpacing/zoom);
		redraw();
	});
	
	//BUTTON move LEFT
	$("#move_left").on("click", function() {
		canvasX+=gridSpacing/zoom;
		ctx.translate(gridSpacing/zoom, 0);
		redraw();
	});
	
	//BUTTON move RIGHT
	$("#move_right").on("click", function() {
		canvasX-=gridSpacing/zoom;
		ctx.translate(-gridSpacing/zoom, 0);
		redraw();
	});
	
	//BUTTON undo
	$("#undo").on("click", function() {
		undo();
	});
	
	//BUTTON redo
	$("#redo").on("click", function() {
		redo();
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
		//82=r, 17=ctrl, 70=f, 16=shift, 46=delete, 27=ESC, 13=ENTER, 32=Space, 109=-, 107=+, 69=e, 81=q
		//w=87 a=65 s=83 d=68  -  up=38 left=37 down=40 right=39
		var keyID = parseInt(key.which,10);
		if(!$("#overlay").hasClass("hidden")) {
			if(keyID===27) $("#close").trigger("mousedown");
			else if(keyID===13 && $(document.activeElement).is("#downloadName")) $("#downloadButton").trigger("click");
			else if(keyID===13 && $(document.activeElement).is("#pasteImport")) $("#pasteButton").trigger("click");
			return;
		}
		if($(document.activeElement).parent().parent().is("#place")) {
			if(keyID===27 || keyID===13) $(".placeOpt:not(.hidden) input").blur();
			return;
		}
		var canX=realX;
		var canY=realY;
		if($("#canvas:hover").length!=0) var obj = getClickedNode(canX, canY);
		else var obj=false;
		//KEY R - align to grid
		if(keyID===82 && state==="edit" && obj!==false) {
			nodes[obj].x=Math.round(nodes[obj].x/gridSpacing)*gridSpacing;
			nodes[obj].y=Math.round(nodes[obj].y/gridSpacing)*gridSpacing;
			addUndo();
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
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					lines.splice(clickedLine, 1);
					addUndo();
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
					addUndo();
					redraw();
				}
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					if(editObj(false, clickedLine)) {
						addUndo();
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
		$("#place").find("*").add("#place").css("pointer-events", "none");
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
			nodes[dragId].x+=moveX;
			nodes[dragId].y+=moveY;
			redraw();
		});
	}
	
	//MOUSE disable hold - mouseup
	$(document).on("mouseup", function(e) {
		if(e.which===1) {
			if(dragging) {
				$("#canvas").off("mousemove.drag");
				dragging = false;
				addUndo();
			}
			$("#canvas").off("mousemove.pan");
			$("#place").find("*").add("#place").css("pointer-events", "auto");
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
		$("#place").find("*").add("#place").css("pointer-events", "none");
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
	
	//check if SAVED
	function unsaved() {
		if(savePointer===undoPointer) return false;
		return true;
	}
	
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
		if(selected==="line") $("#replace").addClass("disabled");
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
		for(var i=0; i<lines.length; i++) {
			lines[i].p = nodes[lines[i].a].p;
		}
		for(var i=0; i<nodes.length; i++) {
			switch(nodes[i].t) {
				case 1://SWITCH
					//DO NOTHING
					break;
				case 2://BUTTON
					if(!holdingClick) nodes[i].p = false;
					break;
				case 3://PULSER
					if(testOr(i)) {
						nodes[i].c = nodes[i].d;
						nodes[i].p = false;
					}
					else {
						if(nodes[i].p) nodes[i].p = false;
						if(nodes[i].c>0) nodes[i].c--;
						else {
							nodes[i].p = true;
							nodes[i].c = nodes[i].d;
						}
					}
					break;
				case 4://OR
					nodes[i].p = testOr(i);
					break;
				case 5://AND
					nodes[i].p = testAnd(i);
					break;
				case 6://NOT
					nodes[i].p = !testOr(i);
					break;
				case 7://DELAY
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
				case 8://TOGGLE
					var isPowered = testOr(i);
					if(isPowered && !nodes[i].f) {
						nodes[i].p = !nodes[i].p;
						nodes[i].f = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
				case 9://MONOSTABLE
					var isPowered = testOr(i);
					if(nodes[i].p) nodes[i].p = false;
					if(isPowered && !nodes[i].f) {
						nodes[i].f = true;
						nodes[i].p = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
				case 10://RANDOM
					var isPowered = testOr(i);
					if(nodes[i].p) nodes[i].p = false;
					if(isPowered && !nodes[i].f) {
						nodes[i].p = Math.random()>=0.5;
						nodes[i].f = true;
					}
					else if(!isPowered) nodes[i].f = false;
					break;
				case 11://NOTE
					//NOT YET IMPLEMENTED
					break;
				case 12://OUTPUT LAMP
					nodes[i].p = testOr(i);
					break;
			}
		}
		redraw();
	}
	
	//get AND connection
	function testAnd(id) {
		var result = false;
		for(var i=0; i<lines.length; i++) {
			if(lines[i].b===id && lines[i].p) result = true;
			if(lines[i].b===id && !lines[i].p) {
				result = false;
				break;
			}
		}
		return result;
	}
	
	//get OR connection
	function testOr(id) {
		for(var i=0; i<lines.length; i++) {
			if(lines[i].b===id && lines[i].p) return true;
		}
		return false;
	}
	
	//RESET Objects after simulation STOP
	function resetPower() {
		for(var i=0; i<nodes.length; i++) {
			if(nodes[i].q!=undefined) nodes[i].p = nodes[i].q;
			else if(nodes[i].p!=undefined) nodes[i].p = false;
			if(nodes[i].d!=undefined) nodes[i].c = nodes[i].d;
			if(nodes[i].f!=undefined) nodes[i].f = false;
		}
		for(var i=0; i<lines.length; i++) {
			lines[i].p = false;
		}
	}
	
	//GET Object hitbox
	function getWidth(id) {
		if(nodes[id].t===13) return nodes[id].w;
		else {
			if(nodes[id].t===12 && zoom<1) return design[12].width + Math.log(1/zoom)/Math.log(2)*2;
			else if(design[nodes[id].t].outline) return design[nodes[id].t].width + outlineWidth;
			else return design[nodes[id].t].width;
		}
	}
	function getHeight(id) {
		if(nodes[id].t===13) return design[13].textSize;
		else {
			if(nodes[id].t===12 && zoom<1) return design[12].height + Math.log(1/zoom)/Math.log(2)*2;
			else if(design[nodes[id].t].outline) return design[nodes[id].t].height + outlineWidth;
			else return design[nodes[id].t].height;
		}
	}
	function getRadius(id) {
		if(design[nodes[id].t].outline) return design[nodes[id].t].radius + outlineWidth/2;
		else return design[nodes[id].t].radius;
	}
	
	//GET Object size
	function getSizeX(id) {
		if(nodes[id].t===13) return nodes[id].w/2;
		else if(nodes[id].t===12 && zoom<1) return design[12].width/2 + Math.log(1/zoom)/Math.log(2);
		else return design[nodes[id].t].width/2;
	}
	function getSizeY(id) {
		if(nodes[id].t===13) return design[13].textSize/2;
		else if(nodes[id].t===12 && zoom<1) return design[12].height/2 + Math.log(1/zoom)/Math.log(2);
		else return design[nodes[id].t].height/2;
	}
	function getSizeR(id) {
		return design[nodes[id].t].radius;
	}
	
	//ADD UNDO Stack
	function addUndo() {
		if(undoPointer!==undoStack.length-1) {
			undoStack.splice(undoPointer+1, undoStack.length-undoPointer-1);
			if(savePointer>undoStack.length-1) savePointer = -1;
		}
		undoStack.push([JSON.parse(JSON.stringify(nodes)), JSON.parse(JSON.stringify(lines)), canvasX, canvasY, zoom, tickSpeed]);
		if(undoStack.length>1) $("#undo").removeClass("disabled");
		if(undoStack.length>maxUndoSize) {
			undoStack.shift();
			if(savePointer>-1) savePointer--;
		}
		undoPointer = undoStack.length-1;
		$("#redo").addClass("disabled");
	}
	
	//UNDO
	function undo() {
		if(state!=="edit" || undoStack.length<2 || undoPointer===0) return;
		undoPointer-=1;
		if(undoPointer===0) $("#undo").addClass("disabled");
		$("#redo").removeClass("disabled");
		loadUndoPos();
	}
	
	//REDO
	function redo() {
		if(state!=="edit" || undoStack.length<2 || undoPointer===undoStack.length-1) return;
		undoPointer+=1;
		if(undoPointer===undoStack.length-1) $("#redo").addClass("disabled");
		$("#undo").removeClass("disabled");
		loadUndoPos();
	}
	
	//LOAD from undo stack
	function loadUndoPos() {
		nodes = JSON.parse(JSON.stringify(undoStack[undoPointer][0]));
		lines = JSON.parse(JSON.stringify(undoStack[undoPointer][1]));
		if(undoTrackView) {
			canvasX = undoStack[undoPointer][2];
			canvasY = undoStack[undoPointer][3];
			zoom = undoStack[undoPointer][4];
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.scale(zoom, zoom);
			ctx.translate(canvasX, canvasY);
		}
		tickSpeed = undoStack[undoPointer][5];
		$("#speedSetting").html("Ticks per second: "+Math.round(1000/tickSpeed));
		dragId=0;
		lineStart=false;
		lineLast=false;
		redraw();
	}
	
	//SAVE - move pointer
	function save() {
		savePointer=undoStack.length-1;
	}
	
	//Find duplicate line - prevent creating multiple identical lines
	function findDuplicateLine(id) {
		for(var i=0; i<lines.length; i++) {
			if(lines[i].a===lineStart && lines[i].b===id) return true;
		}
		return false;
	}
	
	//SHIFT / recalculate IDs after object delete/drag
	function reorganize(pos) {
		var uptop = [];
		for(var i=0; i<lines.length; i++) {
			if(lines[i].a===pos) uptop.push([i, 1]);
			if(lines[i].b===pos) uptop.push([i, 2]);
			if(lines[i].a>pos) lines[i].a--;
			if(lines[i].b>pos) lines[i].b--;
		}
		for(var i=0; i<uptop.length; i++) {
			if(uptop[i][1]===1) lines[uptop[i][0]].a=nodes.length-1;
			if(uptop[i][1]===2) lines[uptop[i][0]].b=nodes.length-1;
		}
		if(lineLast!==false) {
			if(lineLast>pos) lineLast--;
			else if(lineLast===pos) lineLast=nodes.length-1;
		}
	}
	
	//DELETE object
	function deleteObj(id) {
		for(var i=lines.length-1; i>=0; i--) {
			if(lines[i].a===id || lines[i].b===id) lines.splice(i, 1);
		}
		if(id<nodes.length-1) {
			nodes.splice(id, 1);
			reorganize(id);
		}
		else nodes.splice(id, 1);
		addUndo();
	}
	
	//EDIT object
	function editObj(id, lineID) {
		if(id!==false) {
			if(!design[nodes[id].t].editable) return false;
			switch(nodes[id].t) {
				case 1: case 2: case 12://EDIT NAME (BUTTON, SWITCH, OUTPUT LAMP)
					var name = prompt("Enter name:", nodes[id].n);
					if(name!=undefined && name!==nodes[id].n) nodes[id].n = name;
					break;
				case 3: case 7://EDIT DELAY (PULSER, DELAY)
					var delay=prompt("Set delay: (ticks)", nodes[id].d);
					if(isNaN(parseFloat(delay)) || parseFloat(delay)<1) alert("Invalid number!");
					else {
						nodes[id].d=Math.round(parseFloat(delay));
						nodes[id].c=Math.round(parseFloat(delay));
					}
					break;
				case 6: case 8://EDIT STARTING POWER (NOT, TOGGLE)
					nodes[id].p = !nodes[id].p;
					nodes[id].q = !nodes[id].q;
					break;
				case 11://EDIT NOTE (NOTE)
					//not yet implemented
					break;
				case 13://EDIT TEXT (TEXT)
					var text = prompt("Enter text:", nodes[id].n);
					if(text!=undefined && text!=="" && text!==" " && text!==nodes[id].n) {
						ctx.font = textSize+"px Arial";
						var measure = parseFloat(ctx.measureText(text).width.toFixed(2));
						nodes[id].n = text;
						nodes[id].w = measure;
					}
					break;
				default:
					return false;
			}
			return true;
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
		dragging = true;
		redraw();
		nodeMoveActivate();
	}
	
	//Draw grid
	function drawGrid() {
		var scrStartX = -canvasX;
		var scrStartY = -canvasY;
		var scrEndX = scrStartX+(width/zoom);
		var scrEndY = scrStartY+(height/zoom);
		for(var x=Math.round(scrStartX/gridSpacing)*gridSpacing; x<=scrEndX; x+=gridSpacing) {
			if(x%(gridSpacing*2)===0) drawGridLine(x, scrStartY, x, scrEndY, gridLineWidthBig);
			else drawGridLine(x, scrStartY, x, scrEndY, gridLineWidth);
		}
		for(var y=Math.round(scrStartY/gridSpacing)*gridSpacing; y<=scrEndY; y+=gridSpacing) {
			if(y%(gridSpacing*2)===0) drawGridLine(scrStartX, y, scrEndX, y, gridLineWidthBig);
			else drawGridLine(scrStartX, y, scrEndX, y, gridLineWidth);
		}
	}
	
	//MAIN RENDER EVERYTHING - redrawAll
	function redraw() {
		clear();
		if(showGrid && zoom>=0.125) drawGrid();
		for(var i=0; i<lines.length; i++) {
			drawLine(nodes[lines[i].a].x, nodes[lines[i].a].y, nodes[lines[i].b].x, nodes[lines[i].b].y, lines[i].p);
		}
		for(var i=0; i<nodes.length; i++) {
			//DRAW NODES
			if(design[nodes[i].t].shape==="rect" && nodes[i].t!==13) {
				drawRect(nodes[i].x-getSizeX(i), nodes[i].y-getSizeY(i), nodes[i].x+getSizeX(i), nodes[i].y+getSizeY(i), nodes[i].p, design[nodes[i].t].outline);
			}
			else if(design[nodes[i].t].shape==="circle") {
				drawCircle(nodes[i].x, nodes[i].y, design[nodes[i].t].radius, nodes[i].p, design[nodes[i].t].outline, outlineWidth);
			}
			else if(design[nodes[i].t].shape==="oval") {
				drawOval(nodes[i].x-getSizeX(i), nodes[i].y-getSizeY(i), nodes[i].x+getSizeX(i), nodes[i].y+getSizeY(i), nodes[i].p, design[nodes[i].t].outline);
			}
			//DRAW NODE TEXT
			if([1, 2, 11, 12, 13].includes(nodes[i].t)) {//switch, button, note, output, text
				var txt = nodes[i].n;
			}
			else if([4, 5, 6, 8, 9, 10].includes(nodes[i].t)) {//or, and, not, toggle, monostable, random
				var txt = design[nodes[i].t].fullName;
			}
			else if([3, 7].includes(nodes[i].t)) {
				var txt = nodes[i].d;
			}
			if(txt!=="") {
				if(nodes[i].t===12) {//DRAW TEXT ABOVE OUTPUT WHEN TOO LONG
					ctx.font = design[nodes[i].t].textSize+"px Arial";
					var measure = parseFloat(ctx.measureText(txt).width.toFixed(2));
					if(measure>design[12].width) drawText(nodes[i].x, nodes[i].y-(design[12].height/2)-(design[12].textSize/2)-2, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
					else drawText(nodes[i].x, nodes[i].y, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
				}
				/*// DRAW TEXT ABOVE INPUTS WHEN TOO LONG
				else if([1, 2].includes(nodes[i].t)) {
					ctx.font = design[nodes[i].t].textSize+"px Arial";
					var measure = parseFloat(ctx.measureText(txt).width.toFixed(2))/2;
					if(measure>getSizeR(i)) drawText(nodes[i].x, nodes[i].y-(getRadius(i))-(design[nodes[i].t].textSize/2)-2, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
					else drawText(nodes[i].x, nodes[i].y, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
				}
				*/
				else drawText(nodes[i].x, nodes[i].y, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
			}
		}
		if(lineStart!==false) drawLine(nodes[lineStart].x, nodes[lineStart].y, realX, realY, false);
		updateDebug();
	}
	
	//UPDATE DEBUG INFO
	function updateDebug() {
		$("#debug").html("mouseX="+globalX+", mouseY="+globalY+"<br/>gridX="+realX+", gridY="+realY+"<br/>moveX="+canvasX+", moveY="+canvasY+"<br/>nodes: "+nodes.length+", lines: "+lines.length+", zoom: "+zoom+"<br/>TPS: "+Math.round(1000/tickSpeed)+", ticks: "+ticks);
	}
	
	//GET CLICKED OBJECT ID
	function getClickedNode(x, y) {
		if(nodes.length===0) return false;
		for(var i=nodes.length-1; i>=0; i--) {
			if(design[nodes[i].t].shape==="rect") {
				if(x>=nodes[i].x-getWidth(i)/2 && nodes[i].x+getWidth(i)/2>=x && y>=nodes[i].y-getHeight(i)/2 && nodes[i].y+getHeight(i)/2>=y) return i;
			}
			else if(design[nodes[i].t].shape==="oval") {
				var h = getSizeY(i);
				var w = getSizeX(i)-h;
				if(design[nodes[i].t].outline) var o = outlineWidth/2;
				else var o = 0;
				if((x>=nodes[i].x-w && nodes[i].x+w>=x && y>=nodes[i].y-h-o && nodes[i].y+h+o>=y) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x-w-x), 2)+Math.pow(Math.abs(nodes[i].y-y), 2))<=h+o) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x+w-x), 2)+Math.pow(Math.abs(nodes[i].y-y), 2))<=h+o)) return i;
			}
			else if(design[nodes[i].t].shape==="circle") {
				if(Math.sqrt(Math.pow(Math.abs(nodes[i].x-x), 2)+Math.pow(Math.abs(nodes[i].y-y), 2))<=getRadius(i)) return i;
			}
		}
		return false;
	}
	
	//GET CLICKED LINE ID
	function getClickedLine(x, y) {
		if(lines.length===0) return false;
		for(var i=lines.length-1; i>=0; i--) {
			if((Math.sqrt(Math.pow(Math.abs(nodes[lines[i].a].x-x), 2)+Math.pow(Math.abs(nodes[lines[i].a].y-y), 2))+Math.sqrt(Math.pow(Math.abs(nodes[lines[i].b].x-x), 2)+Math.pow(Math.abs(nodes[lines[i].b].y-y), 2)))<(Math.sqrt(Math.pow(Math.abs(nodes[lines[i].a].x-nodes[lines[i].b].x), 2)+Math.pow(Math.abs(nodes[lines[i].a].y-nodes[lines[i].b].y), 2))+lineClickRadius)) return i;
		}
		return false;
	}
	
	//MAIN - CANVAS CLICK EVENTS - PLACE OBJECT, EDIT, DELETE, LINE, PAN...
	function clickOn(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(state==="paused" || (state==="running" && (clickResult===false || (nodes[clickResult].t!==1 && nodes[clickResult].t!==2)))) {
			panActivate();
		}
		else if(state==="edit") {
			var clickResultLine = getClickedLine(x, y);
			if(selected==="line" || lineStart!==false) {//LINE
				if(lineStart===false && clickResult!==false) {//START LINE
					if(design[nodes[clickResult].t].canStartLine) {
						lineStart = clickResult;
						lineLast = lineStart;
						lineStartActivate();
					}
				}
				else if(lineStart!==false) {//END/CREATE LINE
					var dupes = findDuplicateLine(clickResult);
					if(!(clickResult===false || clickResult===lineStart) && design[nodes[clickResult].t].canEndLine && !dupes) {
						lines.push({a:lineStart, b:clickResult});
						lineStart=false;
						$("#canvas").off("mousemove.line");
						addUndo();
					}
					else if(clickResult===false) {
						lineStart=false;
						$("#canvas").off("mousemove.line");
					}
				}
			}
			else if(!["select", "edit", "delete", "replace"].includes(selected)) {
				if(clickResult!==false) {//ACTIVATE DRAG OBJECT
					dragObj(clickResult);
				}
				else {//CREATE NEW OBJECT
					switch(selected) {
						case 1://SWITCH
							nodes.push({t:1, n:formatText($("#place"+selected+" input").val(), "Switch"), p:false, x:x, y:y});
							break;
						case 2://BUTTON
							nodes.push({t:2, n:formatText($("#place"+selected+" input").val(), "Button"), p:false, x:x, y:y});
							break;
						case 3://PULSER
							var delay=formatNum($("#place"+selected+" input").val());
							if(delay===false || delay<0 || delay>3600000) {
								//popupMsg("You have entered an invalid value!");
								return;
							}
							else {
								delay = Math.round(delay);
								nodes.push({t:3, p:false, x:x, y:y, d:delay, c:delay});
							}
							break;
						case 4://OR
							nodes.push({t:4, p:false, x:x, y:y});
							break;
						case 5://AND
							nodes.push({t:5, p:false, x:x, y:y});
							break;
						case 6://NOT
							var pwr = $("#place"+selected+" .slider").hasClass("activated");
							nodes.push({t:6, p:pwr, q:pwr, x:x, y:y});
							break;
						case 7://DELAY
							var delay=formatNum($("#place"+selected+" input").val());
							if(delay===false || delay<0 || delay>3600000) {
								//popupMsg("You have entered an invalid number!");
								return;
							}
							else {
								delay = Math.round(delay);
								nodes.push({t:7, p:false, d:delay, c:delay, x:x, y:y});
							}
							break;
						case 8://TOGGLE
							var pwr = $("#place"+selected+" .slider").hasClass("activated");
							nodes.push({t:8, p:pwr, q:pwr, f:false, x:x, y:y});
							break;
						case 9://MONOSTABLE
							nodes.push({t:9, p:false, f:false, x:x, y:y});
							break;
						case 10://RANDOM
							nodes.push({t:10, p:false, x:x, y:y, f:false});
							break;
						case 11://NOTE
							alert("Not yet implemented!");
							return;
							var note = prompt();
							nodes.push({t:11, p:false, n:note, x:x, y:y});
							break;
						case 12://OUTPUT LAMP
							nodes.push({t:12, p:false, n:formatText($("#place"+selected+" input").val()), x:Math.round(x/gridSpacing)*gridSpacing, y:Math.round(y/gridSpacing)*gridSpacing});
							break;
						case 13://TEXT
							var txt = formatText($("#place"+selected+" input").val())
							if(txt==="" || txt.length>100) {
								//popupMsg("You have to enter a valid text!");
								return;
							}
							else {
								ctx.font = design[selected].textSize+"px Arial";
								var measure = parseFloat(ctx.measureText(txt).width.toFixed(2));
								nodes.push({t:13, n:txt, x:x, y:y, w:measure});
							}
							break;
					}
					addUndo();
				}
			}
			else if(selected==="delete") {
				if(clickResult!==false) {//DELETE OBJECT
					deleteObj(clickResult);
				}
				else if(clickResultLine!==false) {//DELETE LINE
					lines.splice(clickResultLine, 1);
					addUndo();
				}
			}//EDIT OBJECT PROPERTIES
			else if(selected==="edit" && (clickResult!==false || clickResultLine!==false)) {
				if(editObj(clickResult, clickResultLine)) addUndo();
			}//REPLACE OBJECT
			else if((selected==="replace" || selected==="select") && clickResult!==false) {
				alert("Not yet implemented!");
				//var oldObj=nodes[clickResult];
				//addUndo();
			}
		}//CLICK BUTTON / SWITCH while running
		else if(state==="running" && clickResult!==false) {
			if(nodes[clickResult].t===2) nodes[clickResult].p=true;
			else if(nodes[clickResult].t===1) nodes[clickResult].p=!nodes[clickResult].p;
		}
		redraw();
	}
	
	//Format text, check empty string
	function formatText(txt, def) {
		if(def==undefined) def="";
		if(typeof txt==="number") txt = txt.toString();
		if(typeof txt!=="string") return def;
		if(txt==="" || txt.split(" ").join("")==="") return "";
		else {
			for(var i=0; i<txt.length; i++) {
				if(txt[i]!==" ") {
					txt = txt.substr(i);
					break;
				}
			}
			for(var i=txt.length-1; i>=0; i--) {
				if(txt[i]!==" ") {
					txt = txt.substr(0, i+1);
					break;
				}
			}
		}
		return txt;
	}
	
	//Format number
	function formatNum(num, def) {
		if(def==undefined) def=false;
		if(typeof num!=="number" && typeof num!=="string") return def;
		if(typeof num==="string" && (num==="" || num.split(" ").join("")==="")) return def;
		else if(typeof num==="string") {
			if(!isNaN(parseFloat(num))) num = parseFloat(num);
			else return def;
		}
		if(!isFinite(num) || isNaN(num)) return def;
		return num;
	}
	
	//Confirm Leaving the page with unsaved changes
	window.onbeforeunload = function(){
		if(unsaved()) return "There are unsaved changes.\nAre you sure you want to leave?";
	}
	
	//Remove Endora text
	$("i").parent().parent().parent().remove();
});