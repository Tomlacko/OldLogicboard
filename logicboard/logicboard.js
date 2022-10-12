$(window).load(function() {
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
	
	function drawRect(startX, startY, endX, endY, power, outline) {
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
	
	function drawSelection(x1, y1, x2, y2, path) {
		var startX = Math.min(x1, x2);
		var startY = Math.min(y1, y2);
		var endX = Math.max(x1, x2);
		var endY = Math.max(y1, y2);
		ctx.fillStyle = selectionColor;
		ctx.strokeStyle=selectionOutline;
		ctx.lineWidth=(selectionOutlineWidth/2)/zoom;
		if(path) ctx.beginPath();
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.fill();
		ctx.stroke();
	}
	
	function selectionRect(x1, y1, x2, y2) {
		selectionStyle();
		ctx.rect(x1, y1, x2-x1, y2-y1);
		ctx.fill();
		ctx.stroke();
	}
	function selectionCircle(x, y, r) {
		selectionStyle();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.fill();
		ctx.stroke();
	}
	function selectionOval(x1, y1, x2, y2){
		var h=(y2-y1)/2;
		x1+=h;
		x2-=h;
		selectionStyle();
		ctx.arc(x1, y1+h, h, degToRad(90), degToRad(270), false);
		ctx.lineTo(x2, y1);
		ctx.arc(x2, y1+h, h, degToRad(270), degToRad(90), false);
		ctx.lineTo(x1, y2);
		ctx.fill();
		ctx.stroke();
	}
	function selectionStyle() {
		ctx.fillStyle = selectionColor;
		ctx.strokeStyle = selectionOutline;
		ctx.lineWidth = selectionOutlineWidth;
		ctx.beginPath();
	}
	
	function clear() {
		ctx.clearRect(-canvasX, -canvasY, width/zoom, height/zoom);
	}
	
	function degToRad(deg) {
		return deg*(Math.PI/180);
	}
	
	//ADD NUMERICAL SORT FOR ARRAYS 
	Array.prototype.numSort = function() {
		return this.sort(function(a, b) {
			return a - b;
		});
	};
	
	//POLYFILF IF BROWSER DOES NOT SUPPORT .includes
	if(!Array.prototype.includes) Array.prototype.includes = function(searchElement) {
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
	
	//Format text, check empty string
	function formatText(txt, def) {
		if(def==undefined) def="";
		if(typeof txt==="number") txt = txt.toString();
		if(typeof txt!=="string") return def;
		if(txt==="" || txt.split(" ").join("")==="") return def;
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
	
	//Get fixed decimal number
	function toFixed(num, pos) {
		return parseFloat(num.toFixed(pos));
	}
	
	//Get time passed (secs)
	function getTimePassed(time) {
		return (Date.now()-time)/1000;
	}
	
	//resize canvas to window
	$(window).on("resize", function() {
		canvas.height = Math.max($(window).height()-($("#panel").outerHeight()+$("#nodebarContainer").outerHeight()), 71);//137
		canvas.width = Math.max($(window).width(), 10);
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
	
	var mobile = isMobile();
	var fileVersion = 5;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var height = 0;
	var width = 0;
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
	var dragFakeX = 0;
	var dragFakeY = 0;
	var startClickX = 0;
	var startClickY = 0;
	var startClickXr = 0;
	var startClickYr = 0;
	var selectX = 0;
	var selectY = 0;
	var globalX = 0;
	var globalY = 0;
	var realX = 0;
	var realY = 0;
	var clipboardX = 0;
	var clipboardY = 0;
	var tabID = 0;
	var dragId = 0;
	var undoPointer = -1;
	
	var undoTrackView = false;
	var darkMode = false;
	var showGrid = true;
	var debugShown = false;
	var alignActivated = false;
	var dragging = false;
	var panning = false;
	var selecting = false;
	var edgeScrolling = false;
	var holdingClick = false;
	var holdingPan = false;
	var holdingCTRL = false;
	var holdingSHIFT = false;
	var lineStart = false;
	var lineLast = false;
	
	var nodes = [];
	var lines = [];
	var undoStack = [];
	var selection = [];
	var selectedNodes = [];
	var clipboardNodes = [];
	var clipboardLines = [];
	var totalSelected = 0;
	
	
	var tickSpeed = 10;
	var mouseDelay = 10;
	var selected = 1;
	var selectedNode = 1;
	var state = "edit";
	var TimeoutID = 0;
	var ticks = 0;
	var TPS = 0;
	var lastTick = 0;
	var lastClick = 0;
	var onScreenNodes = 0;
	var savePointer = 0;
	var BlinkTimer;
	var edgeScrollTimer;
	var popupShown = "";
	var edgeSize = 14;
	var gridSpacing = 42;
	var half = gridSpacing/2;
	
	var fontSize = 16;
	var textSize = 28;
	var debugNodeTextSize = 8;
	var outlineWidth = 4;
	var lineWidth = 4;
	var lineClickRadius = 0.08;
	var selectionOutlineWidth = 4;
	var cursorMoveTol = mobile?5:3;
	
	var whiteColor = "rgba(255, 255, 255, 1)";//#FFF
	var blackColor = "rgba(0, 0, 0, 1)";//#000
	var redColor = "rgba(255, 0, 0, 1)";//#F00
	var blueColor = "rgba(0, 0, 255, 1)";//#00F
	var greenColor = "rgba(0, 255, 0, 1)";//#0F0
	var noOutline = "rgba(0, 0, 0, 0)";//transparent
	var outlineColor = blackColor;
	var nodeUnpoweredColor = "rgba(200, 200, 200, 1)";//#C8C8C8
	var nodePoweredColor = redColor;
	var lineUnpoweredColor = blackColor;
	var lineUnpoweredGradient = "rgba(150, 150, 150, 1)";//#969696
	var linePoweredColor = redColor;
	var linePoweredGradient = "rgba(255, 150, 150, 1)";//#FF9696
	var textNodeColor = "rgba(128, 128, 128, 1)";//#808080
	var gridLineWidth = 1;
	var gridLineWidthBig = 2;
	var gridLineColor = "rgba(220, 220, 220, 1)";//#DCDCDC
	var selectionColor = "rgba(100, 200, 240, 0.5)";//#64C8F0
	var selectionOutline = "rgba(50, 150, 255, 0.8)";//#3296FF
	
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
	
	setTimeout(function() {$(window).trigger("resize");}, 50);
	if(mobile) $("#mobileAlign").removeClass("hidden");
	addUndo();
	
	/*
	TAGS:   r,x,y, *s=shape*, n=name/note/text, t=type, p=powered, a=startID, b=endID, d=delay, c=countdown, f=fired, q=startPowered, w=width(text)
	
	SHAPES: c=circle, r=rect=rectangle, o=oval
	
	TYPES:  (1)s=switch, (2)b=button, (3)p=pulser, *q=source*, (4)o=or, (5)a=and, (6)n=not,
	        (7)d=delay, (8)t=toggle, (9)m=monostable, (10)r=random, (11)#=note, (12)l=output(lamp), (13)w=text
	*/
	
	/*----------------------EVENTS-/-HTML------------------------------------------------------------*/
	
	//TRACK GLOBAL & REAL MOUSE coordinates - mousemove
	$("#canvas").on(mobile?"touchstart.global touchmove.global":"mousemove.global", function(e) {
		var rect = canvas.getBoundingClientRect();
		globalX = (mobile?Math.round(e.originalEvent.touches[0].clientX):e.clientX) - rect.left;
		globalY =(mobile?Math.round(e.originalEvent.touches[0].clientY):e.clientY) - rect.top;
		realX = (globalX/zoom)-canvasX;
		realY = (globalY/zoom)-canvasY;
		updateDebug();
	});
	
	//prevent button dragging and highlighting
	$(document).on(mobile?"touchstart":"mousedown", function(e) {
		if((e.type!=="touchstart" || e.which===1) && !$(e.target).is("input") && !$(e.target).hasClass("selectable") && $(e.target).parents(".selectable").length===0) {
			e.preventDefault();
		}
		if($(document.activeElement).parent().parent().is("#place")) $(".placeOpt:not(.hidden) input").blur();
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
	
	//click on BUTTONS/NODES - activated effect
	$(".node, .button, #labelFile").on(mobile?"touchstart":"mousedown", function(e) {
		if(e.type==="touchstart" || e.which===1) {
			$(".node, .button").removeClass("activated");
			$(this).addClass("activated");
		}
	});
	$(document).on(mobile?"touchend":"mouseup", function(e) {
		if(e.type==="touchend" || e.which===1) $(".node, .button, #labelFile").removeClass("activated");
	});
	
	//hide overlay
	$("#close").on("click", function(e) {
		$("#information").scrollTop(0);
		$("input").blur();
		$(".menu, #overlay, #copyDone").addClass("hidden");
	});
	
	//INPUT TYPE=NUMBER SCROLLWHEEL change value
	$("input[type=number]").on("mousewheel DOMMouseScroll", function(e){
		if(!holdingCTRL) {
			e.preventDefault();
			var obj = $(this);
			var scrollAmount = (/Firefox/i.test(navigator.userAgent))? (e.originalEvent.detail*-1) : (e.originalEvent.wheelDelta/120);
			if(scrollAmount > 0) obj.val(parseInt(obj.val())+1);
			else{
				if(parseInt(obj.val())>0) obj.val(parseInt(obj.val())-1);
			}
		}
	});
	
	//show settings
	$("#settings").on("click", function() {
		$("#overlay, #menu_settings").removeClass("hidden");
	});
	
	//show info
	$("#info").on("click", function() {
		$("#overlay, #menu_info").removeClass("hidden");
	});
	
	//new project
	$("#new").on("click", function() {
		popupConfirm(unsaved()?"Are you sure you want to start a new project?<br /><br />(All unsaved changes will be lost!)":"Are you sure you want to start a new project?", function() {
			if(state!=="edit") stopSimulation();
			nodes=[];
			lines=[];
			zoom=1;
			canvasX=0;
			canvasY=0;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			tickSpeed=10;
			$("#speedSetting").html("Ticks per second: 100");
			tabID=0;
			selectionCancel();
			lineStart=false;
			lineLast=false;
			addUndo();
			save();
			redraw();
			popupClose();
		});
	});
	
	//show load project
	$("#load").on("click", function() {
		if(state!=="edit") stopSimulation();
		if(lineStop() || selectStop()) redraw();
		$("#overlay, #menu_load").removeClass("hidden");
		$("#pasteImport").focus();
		setTimeout(function() {$("#pasteImport").select();}, 1);
	});
	
	//show save project
	$("#save").on("click", function() {
		if(state!=="edit") stopSimulation();
		if(lineStop() || selectStop()) redraw();
		try {
			$("#exportSave").val(getSave());
			$("#overlay, #menu_save").removeClass("hidden");
			$("#downloadName").focus();
			setTimeout(function() {$("#downloadName").select();}, 1);
		}
		catch(e) {
			alert("Error - cannot save file!\n\n"+e.message);
		}
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
	
	//Generate Save File
	function getSave() {
		return btoa(encodeURI(JSON.stringify([nodes, lines, [fileVersion, canvasX, canvasY, zoom, tickSpeed]])));
	}
	
	//DOWNLOAD PROJECT
	$("#downloadButton").on("click", function() {
		var filename=formatText($("#downloadName").val());
		if(filename==="") popupMsg("Invalid file name.");
		else if(filename.length>50) popupMsg("The file name is too long!");
		else {
			try {
				downloadProject(filename+".lgb", getSave());
				$("#overlay, #menu_save").addClass("hidden");
				save();
			}
			catch(e) {
				alert("Error - cannot save file!\n\n"+e.message);
			}
		}
	});
	
	//LOAD project from file button
	$("#inputFile").change(function() {
		var file=document.getElementById("inputFile").files[0];
		var inp=$("#inputFile");
		inp.replaceWith(inp.clone(true));
		var fName = file.name;
		if(fName.slice(-4)!==".lgb") popupMsg("Unsupported file type!");
		else if(file.size>50000000/*50MB*/) popupMsg("The file is too big!<br />(Maximum: 50MB)");
		else {
			var r = new FileReader();
			r.onload = function(e) {
				var content = e.target.result;
				if(content==="" || content==null || content==false) popupMsg("The file is empty!");
				else loadFile(content);
				$(".menu, #overlay").addClass("hidden");
			};
			r.readAsText(file);
		}
	});
	
	//load project from text input
	$("#pasteButton").on("click", function() {
		var filedata = $("#pasteImport").val();
		if(filedata==="" || filedata==null || filedata===false) return false;
		loadFile(filedata);
		$(".menu, #overlay").addClass("hidden");
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
		if(fName.slice(-4)!==".lgb") popupMsg("Unsupported file type!");
		else if(file.size>50000000/*50MB*/) popupMsg("The file is too big!<br />(Maximum: 50MB)");
		else {
			var r = new FileReader();
			r.onload = function(e) {
				var content = e.target.result;
				if(content==="" || content==null || content==false) popupMsg("The file is empty!");
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
			loadArr = JSON.parse(decodeURI(atob(loadProject)));
		}
		catch(err) {
			popupMsg("This is not a LogicBoard file!");
			return false;
		}
		var oldArr=[JSON.parse(JSON.stringify(nodes)), JSON.parse(JSON.stringify(lines)), [fileVersion, canvasX, canvasY, zoom, tickSpeed]];
		try {
			var loadArrInfo=loadArr[2];
			if(typeof(loadArrInfo)!=="object" || loadArrInfo[0]<fileVersion) {
				popupMsg("This file is outdated and is no longer supported!<br />- File version: "+loadArrInfo[0]+"<br />- Current version: "+fileVersion);
				return false;
			}
			if(unsaved()) if(!confirm("There are unsaved changes in your current project.\nAre you sure you want to load a different one?")) return false;
			nodes=loadArr[0];
			lines=loadArr[1];
			canvasX=loadArrInfo[1];
			canvasY=loadArrInfo[2];
			zoom=loadArrInfo[3];
			tickSpeed=loadArrInfo[4];
			selectionCancel();
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
			popupMsg("This isn't a LogicBoard file, or the file is corrupted!");
			return false;
		}
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(zoom, zoom);
		ctx.translate(canvasX, canvasY);
		$("#speedSetting").html("Ticks per second: "+Math.round(1000/tickSpeed));
		tabID=0;
		lineStart=false;
		lineLast=false;
		redraw();
		return true;
	}
	
	//Change SPEED
	$("#speed").on("click", function() {
		popupInput("Ticks per second [Hz]:<br />Min=0.1, Max=1000<br />(Default=100)", (1000/tickSpeed), function() {
			var newSpeed = formatNum(popupValue());
			if(newSpeed===false || newSpeed<0.1 || newSpeed>1000) errorBlink();
			else {
				tickSpeed=1000/newSpeed;
				$("#speedSetting").html("Ticks per second: "+newSpeed);
				updateDebug();
				popupClose();
			}
		});
	});
	
	//Enable Debug Info
	$("#debugSlider").on("click", function() {
		if($("#debug").hasClass("hidden")) {
			debugShown = true;
			redraw();
			$("#debug").removeClass("hidden");
		}
		else {
			$("#debug").addClass("hidden");
			debugShown = false;
			redraw();
		}
	});
	
	//Show Grid Slider
	$("#gridSlider").on("click", function() {
		showGrid=!showGrid;
		redraw();
	});
	
	//Track viewport with UNDO
	$("#undoSlider").on("click", function() {
		undoTrackView=!undoTrackView;
		redraw();
	});
	
	//Toggle DARK MODE
	$("#darkSlider").on("click", function() {
		if(darkMode) {
			darkMode=false;
			$("#canvas, #debug, #nodebarContainer").removeClass("dark");
			design[13].textColor = blackColor;
			outlineColor = blackColor;
			lineUnpoweredColor = blackColor;
			lineUnpoweredGradient = "rgba(150, 150, 150, 1)";
			gridLineColor = "rgba(220, 220, 220, 1)";
		}
		else {
			darkMode=true;
			$("#canvas, #debug, #nodebarContainer").addClass("dark");
			design[13].textColor = whiteColor;
			outlineColor = "rgba(70, 70, 70, 1)";
			lineUnpoweredColor = "rgba(30, 30, 30, 1)";
			lineUnpoweredGradient = "rgba(190, 190, 190, 1)";
			gridLineColor = "rgba(50, 50, 50, 1)";
		}
		redraw();
	});
	
	//MOBILE Toggle autoalign
	$("#alignSlider").on("click", function() {
		alignActivated = !alignActivated;
	});
	
	//Reset grid position when clicked
	$("#resetPosButton").on("click", function() {
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		zoom=1;
		canvasX=0;
		canvasY=0;
		redraw();
	});
	
	//Autohighlight place options box
	$("#place").on("mouseenter", function() {
		$(".placeOpt:not(.hidden) input").focus();
	});
	/*
	$("#place").on("mouseleave", function() {
		$(".placeOpt:not(.hidden) input").blur();
	});
	*/
	
	//TOOLBAR - Select item
	$("#delete, #edit, #replace, #select").on("click", function() {
		if(state==="edit" && !$(this).hasClass("disabled")) {
			if(lineStop() || selectStop()) redraw();
			if($(this).hasClass("selected")) {
				$(this).removeClass("selected");
				if($(this).is("#select")) $("#canvas").removeClass("cursor_cross");
				selected=selectedNode;
				if(selected!=="line" && $("#place"+selected).length!==0) $("#place, #place"+selected).removeClass("hidden");
			}
			else {
				$("#delete, #edit, #replace, #select").removeClass("selected");
				if(selected==="select") $("#canvas").removeClass("cursor_cross");
				$(this).addClass("selected");
				selected = $(this).attr("id");
				if(selected==="select") $("#canvas").addClass("cursor_cross");
				if(selected==="replace" && $("#place"+selectedNode).length!==0) $("#place, #place"+selectedNode).removeClass("hidden");
				else $(".placeOpt, #place").addClass("hidden");
			}
		}
	});
	$(".node").on("click", function() {
		if(state==="edit" && !$(this).hasClass("disabled")) {
			if(lineStop() || selectStop()) redraw();
			if($(this).hasClass("selected") && selected!==selectedNode) {
				$("#"+selected).removeClass("selected");
				if(selected==="select") $("#canvas").removeClass("cursor_cross");
				selected=selectedNode;
				if(selected!=="line" && $("#place"+selected).length!==0) $("#place, #place"+selected).removeClass("hidden");
				return;
			}
			else if($(this).hasClass("selected")) return;
			$("#delete, #edit, #replace, #select").removeClass("selected");
			if(selected==="select") $("#canvas").removeClass("cursor_cross");
			$("#"+selectedNode).removeClass("selected");
			$(this).addClass("selected");
			if($(this).is("#line")) selected="line";
			else selected=parseInt($(this).attr("id"));
			selectedNode=selected;
			$(".placeOpt").addClass("hidden");
			if(selected!=="line" && $("#place"+selected).length===1) $("#place, #place"+selected).removeClass("hidden");
			else $("#place").addClass("hidden");
		}
	});
	
	//START click
	$("#start").on("click", function() {
		startSimulation();
	});
	
	//TOOLBAR - STOP / Pause / Step
	$("#StopControls .button").on("click", function() {
		if($(this).attr("id")==="stop") stopSimulation();
		else if($(this).attr("id")==="pause" && state==="paused") unpauseSimulation();
		else if($(this).attr("id")==="pause") pauseSimulation();
		else if($(this).attr("id")==="step") {
			if(state==="paused") {
				Tick();
				TPS=0;
				lastTick=0;
				clearTimeout(TimeoutID);
			}
		}
	});
	function pauseSimulation() {
		state="paused";
		$("#pause").attr("src", "icons/continue.svg");
		$("#step").removeClass("disabled");
		TPS=0;
		lastTick=0;
		clearTimeout(TimeoutID);
	}
	function unpauseSimulation() {
		state="running";
		$("#pause").attr("src", "icons/pause.svg");
		$("#step").addClass("disabled");
		TimeoutID = setTimeout(Tick, tickSpeed);
	}
	
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
	
	//BUTTON copy
	$("#copy").on("click", function() {
		clipboardCopy();
	});
	
	//BUTTON paste
	$("#paste").on("click", function() {
		if(clipboardPaste(midX/zoom-canvasX, midY/zoom-canvasY)) {
			addUndo();
			redraw();
		}
	});
	
	//Track CTRL/SHIFT state
	$(document).on("keyup", function(key) {
		var keyID = parseInt(key.which, 10);
		if(keyID===17) holdingCTRL = false;
		else if(keyID===16) holdingSHIFT = false;
	});
	
	//KEYDOWN on canvas
	$(document).on("keydown", function(key) {
		//82=r, 17=ctrl, 70=f, 71=g, 192=~, 16=shift, 46=delete, 27=ESC, 13=ENTER, 32=Space, 9=TAB, 109=-, 107=+, 69=e, 81=q, 89=y, 90=z, 73=i, 112=F1, 80=p, 67=c, 86=v, 88=x, 76=L, 78=n
		//w=87 a=65 s=83 d=68  -  up=38 left=37 down=40 right=39
		var keyID = parseInt(key.which,10);
		//console.log(keyID);
		
		var lastSHIFT = holdingSHIFT;
		if(keyID===17) holdingCTRL = true;
		else if(keyID===16) holdingSHIFT = true;
		
		//Keyboard controls for popup
		if(popupShown!=="") {
			if(popupShown==="msg") {
				if(keyID===13 || keyID===27) $("#popupClose").trigger("click");
			}
			else {
				if(keyID===13) $("#popupConfirm").trigger("click");
				else if(keyID===27) $("#popupCancel").trigger("click");
			}
			return;
		}//Keyboard controls for overlay
		if(!$("#overlay").hasClass("hidden")) {
			if(keyID===27) $("#close").trigger("click");
			else if(keyID===13 && $(document.activeElement).is("#downloadName")) $("#downloadButton").trigger("click");
			else if(keyID===13 && $(document.activeElement).is("#pasteImport")) $("#pasteButton").trigger("click");
			return;
		}//Disable focus on #place (enter/esc)
		if($(document.activeElement).parent().parent().is("#place")) {
			if(keyID===27 || keyID===13) $(".placeOpt:not(.hidden) input").blur();
			return;
		}
		
		//Get object on cursor
		var canX=realX;
		var canY=realY;
		if($("#canvas:hover").length!=0) var obj = getClickedNode(canX, canY);
		else var obj=false;
		
		//KEY SHIFT - align to grid
		if(keyID===16 && state==="edit" && obj!==false && !lastSHIFT && !selecting) {
			var adjustX = (Math.round(nodes[obj].x/half)*half)-nodes[obj].x;
			var adjustY = (Math.round(nodes[obj].y/half)*half)-nodes[obj].y;
			if(adjustX!==0 || adjustY!==0) {
				if(selectedNodes.length>1 && selection[obj]) {
					for(var i=0; i<selectedNodes.length; i++) {
						nodes[selectedNodes[i]].x+=adjustX;
						nodes[selectedNodes[i]].y+=adjustY;
						uptopNode(selectedNodes[i]);
					}
					selectedNodes.numSort();
				}
				else {
					nodes[obj].x+=adjustX;
					nodes[obj].y+=adjustY;
				}
				tabID = 0;
				addUndo();
				redraw();
			}
		}//KEY Pause/Break - print debug
		else if(keyID===19) {
			key.preventDefault();
			console.log(nodes, clipboardNodes, selectedNodes);
		}//KEY F1 - show help
		else if(keyID===112 && !holdingClick) {
			key.preventDefault();
			$("#info").trigger("click");
		}//KEY L - show loadFile
		else if(keyID===76 && !holdingClick) {
			key.preventDefault();
			$("#load").trigger("click");
		}//KEY N - new project
		else if(keyID===78 && !holdingClick) {
			key.preventDefault();
			$("#new").trigger("click");
		}//KEY CTRL+A - elect all
		else if(keyID===65 && state==="edit" && holdingCTRL && !holdingClick) {
			if(selectedNodes.length===nodes.length) return;
			selectionCancel();
			for(var i=0; i<nodes.length; i++) {
				selection.push(true);
				selectedNodes.push(i);
			}
			$("#copy").removeClass("disabled");
			redraw();
		}//KEY I - invert selection
		else if(keyID===73 && !holdingClick && state==="edit" && selectedNodes.length>0) {
			selectedNodes = [];
			for(var i=0; i<selection.length; i++) {
				if(!selection[i]) selectedNodes.push(i);
				selection[i]=!selection[i];
			}
			if(selectedNodes.length===0) selectionCalcel();
			else $("#copy").removeClass("disabled");
			redraw();
		}//KEY C - copy selection to clipboard
		else if(keyID===67 && state==="edit" && !holdingClick) {
			clipboardCopy();
		}//KEY V - paste from clipboard
		else if(keyID===86 && state==="edit" && !holdingClick) {
			if(clipboardPaste(realX, realY)) {
				addUndo();
				redraw();
			}
		}//KEY X - cut selection to clipboard
		else if(keyID===88 && state==="edit" && !holdingClick) {
			if(clipboardCopy()) {
				selectionDelete();
				addUndo();
				redraw();
			}
		}//KEY CTRL+S - save
		else if(keyID===83 && !holdingClick && holdingCTRL) {
			key.preventDefault();
			$("#save").trigger("click");
		}//KEY F - quick new line
		else if(keyID===70 && state==="edit" && !holdingClick && lineLast!==false && selected==="line") {
			lineStart = lineLast;
			lineStartActivate();
			redraw();
		}//KEY G - toggle grid visible
		else if(keyID===71) {
			$("#gridSlider").trigger("click");
		}//KEY ~ - toggle debug info
		else if(keyID===192) {
			$("#debugSlider").trigger("click");
		}//KEY Q & DELETE - delete object
		else if((keyID===81 || keyID===46) && state==="edit" && !holdingClick && lineStart===false) {
			if(keyID===46 && selectedNodes.length>0) selectionDelete();
			else {
				if(obj!==false) {
					if(selectedNodes.length>0 && selection[obj]) selectionDelete();
					else deleteObj(obj);
				}
				else {
					var clickedLine = getClickedLine(canX, canY);
					if(clickedLine!==false) lines.splice(clickedLine, 1);
					else {
						if(selectedNodes.length>0) selectionDelete();
						else return;
					}
				}
			}
			addUndo();
			redraw();
		}//KEY R - replace object/line
		else if(keyID===82 && !holdingClick && state==="edit") {
			if(obj!==false && selectedNodes.length>0 && selection[obj]) {
				if(!selectionReplace()) return;
			}
			else if(obj!==false) {
				if(!replaceObj(obj)) return;
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					if(!replaceLine(clickedLine, canX, canY)) return;
				}
				else return;
			}
			addUndo();
			redraw();
		}//KEY WASD / up,left,down,right - PAN
		else if([87, 65, 83, 68, 38, 37, 40, 39].includes(keyID)) {
			var panAmount = gridSpacing/zoom;
			switch(keyID) {
				case 87: case 38://w - up
					canvasY+=panAmount;
					ctx.translate(0, panAmount);
					realY-=panAmount;
					break;
				case 65: case 37://a - left
					canvasX+=panAmount;
					ctx.translate(panAmount, 0);
					realX-=panAmount;
					break;
				case 83: case 40://s - down
					canvasY-=panAmount;
					ctx.translate(0, -panAmount);
					realY+=panAmount;
					break;
				case 68: case 39://d - right
					canvasX-=panAmount;
					ctx.translate(-panAmount, 0);
					realX+=panAmount;
					break;
			}
			if(dragging) dragMovePos();
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
			if(obj!==false) editObj(obj, false);
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) editObj(false, clickedLine);
			}
		}//KEY SPACE - Start/Stop Simulation
		else if(keyID===32 && !holdingClick) {
			if(state==="edit") startSimulation();
			else stopSimulation();
		}//KEY P - Pause Simulation
		else if(keyID===80 && state!=="edit") {
			if(state==="paused") unpauseSimulation();
			else pauseSimulation();
		}//KEY CTRL+Z - Undo
		else if(keyID===90 && holdingCTRL && !holdingClick && state==="edit" && !selecting) {
			lineStop();
			undo();
		}//KEY CTRL+Y - Redo
		else if(keyID===89 && holdingCTRL && !holdingClick && state==="edit" && !selecting) {
			lineStop();
			redo();
		}//KEY Esc - Cancel
		else if(keyID===27) {
			if(lineStop() || selectStop()) redraw();
			else if(selectedNodes.length>0) {
				selectionCancel();
				redraw();
			}
			else if(state!=="edit" && !holdingClick) stopSimulation();
		}//KEY TAB - Cycle through nodes
		else if(keyID===9 && !holdingClick) {
			key.preventDefault();
			if(nodes.length>0) {
				if(tabID===0) tabID=nodes.length-1;
				else {
					tabID--;
					if(tabID>nodes.length-1) tabID=nodes.length-1;
				}
				ctx.setTransform(1, 0, 0, 1, 0, 0);
				ctx.scale(zoom, zoom);
				nodeX=nodes[tabID].x;
				nodeY=nodes[tabID].y;
				adjustX = midX/zoom;
				adjustY = midY/zoom;
				canvasX=Math.round(adjustX-nodeX);
				canvasY=Math.round(adjustY-nodeY);
				ctx.translate(Math.round(adjustX-nodeX), Math.round(adjustY-nodeY));
				redraw();
			}
		}//HOTKEYS 0-9
		else if(keyID>=48 && keyID<=57 && state==="edit" && !holdingClick) {
			if(keyID===48) $("#line").trigger("click");
			else if(keyID===49) $("#edit").trigger("click");
			else if(keyID===50) $("#delete").trigger("click");
			else if(keyID===51) $("#select").trigger("click");
			else if(keyID===52) $("#replace").trigger("click");
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
	//start holding mouse - determine next action
	function mainClickEnable() {
		$("#canvas").on(mobile?"touchstart.start":"mousedown.start", function(e) {
			if(holdingPan) return;
			if(e.type==="touchstart" || e.which===1) {
				$("#canvas").off(mobile?"touchstart.start":"mousedown.start");
				holdingClick = true;
				startClickX = globalX;
				startClickY = globalY;
				startClickXr = realX;
				startClickYr = realY;
				if(state==="edit") {//STATE = edit
					enableMainMoveStart(); 
					enableMainClickEnd();
				}
				else {//STATE = running/paused
					var objID = getClickedNode(realX, realY);
					if(objID!==false) {//Click on Switch/Button
						if(nodes[objID].t===1) {
							nodes[objID].p = !nodes[objID].p;
							redraw();
						}
						else if(nodes[objID].t===2) {
							nodes[objID].p = true;
							redraw();
						}
					}
					enableAltMove();
					enableAltClickEnd();
				}
			}
		});
	}//detect moving mouse - cancel main click
	function enableMainMoveStart() {
		$("#canvas").on(mobile?"touchmove.start":"mousemove.start", function() {
			if(Math.abs(startClickX-globalX)>cursorMoveTol || Math.abs(startClickY-globalY)>cursorMoveTol) {
				$("#canvas").off(mobile?"touchend.main":"mouseup.main");
				$("#canvas").off(mobile?"touchmove.start":"mousemove.start");
				if(selected==="select") {
					selecting = true;
					selectX = startClickXr;
					selectY = startClickYr;
					if(!holdingCTRL) selectionCancel();
					selectionStartActivate();
				}
				else {
					var objID = getClickedNode(startClickXr, startClickYr);
					if(objID===false || lineStart!==false) panActivate();
					else dragObj(objID);
				}
				enableAltClickEnd();
			}
		});
	}//alternative mouse move - state not edit
	function enableAltMove() {
		$("#canvas").on(mobile?"touchmove.alt":"mousemove.alt", function() {
			if(Math.abs(startClickX-globalX)>cursorMoveTol || Math.abs(startClickY-globalY)>cursorMoveTol) {
				$("#canvas").off(mobile?"touchmove.alt":"mousemove.alt");
				panActivate();
			}
		});
	}//confirm click - mouse up click
	function enableMainClickEnd() {
		$("#canvas").on(mobile?"touchend.main":"mouseup.main", function(e) {
			if(e.type==="touchend" || e.which===1) {
				$("#canvas").off(mobile?"touchmove.start":"mousemove.start");
				$("#canvas").off(mobile?"touchend.main":"mouseup.main");
				setTimeout(mainClickEnable, mouseDelay);
				clickOn(realX, realY);
				lastClick = Date.now();
			}
		});
	}//stop holding mouse - alternative mouse up
	function enableAltClickEnd() {
		$(document).on(mobile?"touchend.end":"mouseup.end", function(e) {
			if(e.type==="touchend" || e.which===1) {
				$(document).off(mobile?"touchend.end":"mouseup.end");
				$("#canvas").off(mobile?"touchmove.alt":"mousemove.alt");
				setTimeout(mainClickEnable, mouseDelay);
			}
		});
	}
	mainClickEnable();
	
	//MOUSE disable hold - mouseup
	$(document).on(mobile?"touchend":"mouseup", function(e) {
		if(e.type==="touchend" || e.which===1) {
			if(dragging) {
				$("#canvas").off(mobile?"touchmove.drag":"mousemove.drag");
				$("#place").removeClass("noFocus");
				$("#canvas").removeClass("cursor_move");
				dragging = false;
				tabID=0;
				edgeScrollStop();
				addUndo();
			}
			if(panning && !holdingPan) {
				$("#canvas").off(mobile?"touchmove.pan":"mousemove.pan");
				$("#place").removeClass("noFocus");
				$("#canvas").removeClass("cursor_move");
				panning=false;
			}
			holdingClick = false;
			if(selectStop()) {
				edgeScrollStop();
				selectArea();
				if(!holdingCTRL) $("#select").trigger("click");
			}
		}
	});
	
	//MOUSE SCROLLWHEEL PAN
	$("#canvas").on("mousedown", function(e) {
		if(e.which===2) {
			e.preventDefault();
			if(!panning) {
				holdingPan = true;
				panActivate();
			}
		}
	});
	$(document).on("mouseup", function(e) {
		if(e.which===2) {
			if(!holdingPan) return;
			holdingPan = false;
			panning=false;
			$("#canvas").off(mobile?"touchmove.pan":"mousemove.pan");
			if(!dragging) {
				$("#place").removeClass("noFocus");
				$("#canvas").removeClass("cursor_move");
			}
		}
	});
	
	//MOUSE Drag Object - mousemove
	function nodeMoveActivate() {
		$("#place").addClass("noFocus");
		$("#canvas").addClass("cursor_move");
		dragLastX = realX;
		dragLastY = realY;
		dragFakeX = nodes[dragId].x;
		dragFakeY = nodes[dragId].y;
		$("#canvas").on(mobile?"touchmove.drag":"mousemove.drag", function(e) {
			edgeScrollStart();
			dragMovePos();
			redraw();
		});
	}
	function dragMovePos() {
		var moveX = realX-dragLastX;
		var moveY = realY-dragLastY;
		dragFakeX+=moveX;
		dragFakeY+=moveY;
		if(selectedNodes.length>1 && selection[dragId]) {
			if(holdingSHIFT || alignActivated) {
				var adjustX = (Math.round(dragFakeX/half)*half)-nodes[dragId].x;
				var adjustY = (Math.round(dragFakeY/half)*half)-nodes[dragId].y;
				for(var i=0; i<selectedNodes.length; i++) {
					nodes[selectedNodes[i]].x+=adjustX;
					nodes[selectedNodes[i]].y+=adjustY;
				}
			}
			else {
				for(var i=0; i<selectedNodes.length; i++) {
					nodes[selectedNodes[i]].x+=moveX;
					nodes[selectedNodes[i]].y+=moveY;
				}
			}
		}
		else {
			if(holdingSHIFT || alignActivated) {
				nodes[dragId].x=Math.round(dragFakeX/half)*half;
				nodes[dragId].y=Math.round(dragFakeY/half)*half;
			}
			else {
				nodes[dragId].x=dragFakeX;
				nodes[dragId].y=dragFakeY;
			}
		}
		dragLastX = realX;
		dragLastY = realY;
	}
	
	//AUTOSCROLL Canvas when mouse on edge
	function edgeScrollStart() {
		if(!panning && (globalX<edgeSize || globalX>(width-edgeSize) || globalY<edgeSize || globalY>(height-edgeSize))) {
			if(!edgeScrolling) {
				edgeScrolling=true;
				edgeScroll();
			}
		}
		else edgeScrollStop();
	}
	function edgeScroll() {
		edgeScrollTimer = setTimeout(edgeScroll, 5);
		edgeScrolling=true;
		var panAmount=1/(zoom/8);
		if(globalX<edgeSize) {//LEFT
			canvasX+=panAmount;
			ctx.translate(panAmount, 0);
			realX-=panAmount;
		}
		else if(globalX>(width-edgeSize)) {//RIGHT
			canvasX-=panAmount;
			ctx.translate(-panAmount, 0);
			realX+=panAmount;
		}
		if(globalY<edgeSize) {//UP
			canvasY+=panAmount;
			ctx.translate(0, panAmount);
			realY-=panAmount;
		}
		else if(globalY>(height-edgeSize)) {//DOWN
			canvasY-=panAmount;
			ctx.translate(0, -panAmount);
			realY+=panAmount;
		}
		if(dragging) dragMovePos();
		redraw();
	}
	function edgeScrollStop() {//STOP
		clearTimeout(edgeScrollTimer);
		edgeScrolling=false;
	}
	
	//MOUSE start selection - mousemove
	function selectionStartActivate() {
		$("#canvas").on(mobile?"touchmove.select":"mousemove.select", function() {
			edgeScrollStart();
			redraw();
		});
	}
	
	//MOUSE start line - mousemove
	function lineStartActivate() {
		$("#canvas").on(mobile?"touchmove.line":"mousemove.line", function() {
			redraw();
		});
	}
	
	//Stop line
	function lineStop() {
		if(lineStart!==false) {
			lineStart=false;
			$("#canvas").off(mobile?"touchmove.line":"mousemove.line");
			return true;
		}
		return false;
	}
	
	//Stop selection
	function selectStop() {
		if(selecting) {
			selecting=false;
			$("#canvas").off(mobile?"touchmove.select":"mousemove.select");
			return true;
		}
		return false;
	}
	
	//Cancel selection
	function selectionCancel() {
		selection = [];
		selectedNodes = [];
		$("#copy").addClass("disabled");
	}
	
	//MOUSE pan / translate canvas - mousemove
	function panActivate() {
		$("#place").addClass("noFocus");
		$("#canvas").addClass("cursor_move");
		panning = true;
		panLastX=globalX/zoom;
		panLastY=globalY/zoom;
		$("#canvas").on(mobile?"touchmove.pan":"mousemove.pan", function() {
			var canX=globalX/zoom;
			var canY=globalY/zoom;
			canvasX+=canX-panLastX;
			canvasY+=canY-panLastY;
			ctx.translate(canX-panLastX, canY-panLastY);
			panLastX = canX;
			panLastY = canY;
			redraw();
		});
	}
	
	//CLOSE POPUP
	function popupClose() {
		$("#popupConfirm").off("click");
		$("#popupClose").off("click");
		$("#popupCancel").off("click");
		$("#popupWrap").addClass("hidden");
		$("#popupInput").addClass("hidden");
		$("#popupConfirm").addClass("hidden");
		$("#popupClose").addClass("hidden");
		$("#popupCancel").addClass("hidden");
		$("#popupMsg").html("");
		popupShown = "";
		$("input").blur();
	}
	
	//Display POPUP message
	function popupMsg(msg, color, callbackClose) {
		popupShown = "msg";
		var spanStart = "";
		var spanEnd = "";
		if(color!==false) {
			if(color==undefined) color="#F66";
			spanStart = "<span style=\"color:"+color+";\">";
			spanEnd = "</span>";
		}
		$("#popupMsg").html(spanStart+msg+spanEnd);
		$("#popupClose").removeClass("hidden");
		$("#popupWrap").removeClass("hidden");
		if(callbackClose==undefined) $("#popupClose").on("click", popupClose);
		else $("#popupClose").on("click", callbackClose);
	}
	
	//Display POPUP input
	function popupInput(msg, previousValue, callbackConfirm, callbackCancel) {
		popupShown = "input";
		$("#popupMsg").html(msg);
		if(previousValue==undefined) previousValue="";
		$("#popupInput").val(previousValue);
		$("#popupInput").removeClass("hidden");
		$("#popupConfirm").removeClass("hidden");
		$("#popupCancel").removeClass("hidden");
		$("#popupWrap").removeClass("hidden");
		$("#popupConfirm").on("click", callbackConfirm);
		if(callbackCancel==undefined) $("#popupCancel").on("click", popupClose);
		else $("#popupCancel").on("click", callbackCancel);
		setTimeout(function() {
			$("#popupInput").focus();
			$("#popupInput").select();
		}, 5);
	}
	
	//Display POPUP confirm
	function popupConfirm(msg, callbackConfirm, callbackCancel) {
		popupShown = "confirm";
		$("#popupMsg").html(msg);
		$("#popupConfirm").removeClass("hidden");
		$("#popupCancel").removeClass("hidden");
		$("#popupWrap").removeClass("hidden");
		$("#popupConfirm").on("click", callbackConfirm);
		if(callbackCancel==undefined) $("#popupCancel").on("click", popupClose);
		else $("#popupCancel").on("click", callbackCancel);
	}
	
	//Get value from pupup input
	function popupValue() {
		return $("#popupInput").val();
	}
	
	//Input error blink
	function errorBlink($obj) {
		if($obj==undefined) $obj=$("#popupInput");
		clearTimeout(BlinkTimer);
		$obj.removeClass("redBlink");
		$obj.removeClass("redFade");
		$obj.addClass("redBlink");
		BlinkTimer = setTimeout(function() {
			$obj.addClass("redFade");
			BlinkTimer = setTimeout(function() {
				$obj.removeClass("redFade");
				$obj.removeClass("redBlink");
			}, 800);
		}, 150);
	}
	
	//Click outside popup
	$("#popupWrap").on("click", function(e) {
		if(e.target!==this) return;
		if(popupShown==="confirm" || popupShown==="input") $("#popupCancel").trigger("click");
		else if(popupShown==="msg") $("#popupClose").trigger("click");
	});
	
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
		TPS=0;
		lastTick=0;
		state="edit";
		$("#StartControls").removeClass("hidden");
		$("#StopControls").addClass("hidden");
		$("#ClipboardControls").removeClass("hidden");
		$("#pause").attr("src", "icons/pause.svg");
		$("#step").addClass("disabled");
		$("#MainControls .button").slice(-4).add(".node").removeClass("disabled");
		if(selected!=="line" && $("#place"+selected).length!==0) $("#place, #place"+selected).removeClass("hidden");
		if(selected==="select") $("#canvas").addClass("cursor_cross");
		resetPower();
		redraw();
	}
	
	//START SIMULATION
	function startSimulation() {
		$("#StartControls").addClass("hidden");
		$("#StopControls").removeClass("hidden");
		$("#ClipboardControls").addClass("hidden");
		$("#MainControls .button").slice(-4).add(".node").addClass("disabled");
		$("#place").addClass("hidden");
		$("#canvas").removeClass("cursor_cross");
		lineStop();
		selectStop();
		state="running";
		TimeoutID = setTimeout(Tick, tickSpeed);
		redraw();
	}
	
	//MAIN Tick loop
	function Tick() {
		TimeoutID = setTimeout(Tick, tickSpeed);
		ticks++;
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
		if(lastTick!==0) TPS = 1/getTimePassed(lastTick);
		lastTick = Date.now();
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
		selectionCancel();
		undoPointer--;
		if(undoPointer===0) $("#undo").addClass("disabled");
		$("#redo").removeClass("disabled");
		loadUndoPos();
	}
	
	//REDO
	function redo() {
		if(state!=="edit" || undoStack.length<2 || undoPointer===undoStack.length-1) return;
		selectionCancel();
		undoPointer++;
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
		tabID=0;
		lineStart=false;
		lineLast=false;
		redraw();
	}
	
	//SAVE - move pointer
	function save() {
		savePointer=undoStack.length-1;
	}
	
	//COPY to CLIPBOARD
	function clipboardCopy() {
		if(selectedNodes.length===0 || state!=="edit") return false;
		clipboardNodes = [];
		clipboardLines = [];
		var newAssign = {};
		var nodesCopy = JSON.parse(JSON.stringify(nodes));
		//var linesCopy = JSON.parse(JSON.stringify(lines));
		for(var i=0; i<selectedNodes.length; i++) {
			clipboardNodes.push(nodesCopy[selectedNodes[i]]);
			newAssign[selectedNodes[i]] = i;
		}
		for(var i=0; i<lines.length; i++) {
			if(selection[lines[i].a] && selection[lines[i].b]) clipboardLines.push({a:newAssign[lines[i].a], b:newAssign[lines[i].b]});
		}
		var minX = clipboardNodes[0].x;
		var minY = clipboardNodes[0].y;
		var maxX = clipboardNodes[0].x;
		var maxY = clipboardNodes[0].y;
		for(var i=1; i<clipboardNodes.length; i++) {
			if(clipboardNodes[i].x < minX) minX = clipboardNodes[i].x;
			if(clipboardNodes[i].y < minY) minY = clipboardNodes[i].y;
			if(clipboardNodes[i].x > maxX) maxX = clipboardNodes[i].x;
			if(clipboardNodes[i].y > maxY) maxY = clipboardNodes[i].y;
		}
		clipboardX = minX+(maxX-minX)/2;
		clipboardY = minY+(maxY-minY)/2;
		$("#paste").removeClass("disabled");
		return true;
	}
	
	//PASTE from CLIPBOARD
	function clipboardPaste(x, y) {
		if(clipboardNodes.length===0 || state!=="edit") return false;
		selectionCancel();
		var newNodes = JSON.parse(JSON.stringify(clipboardNodes));
		var newLines = JSON.parse(JSON.stringify(clipboardLines));
		for(var i=0; i<nodes.length; i++) {
			selection.push(false);
		}
		if(holdingSHIFT || alignActivated) {
			var adjustX = Math.round((x+newNodes[0].x-clipboardX)/half)*half-newNodes[0].x;
			var adjustY = Math.round((y+newNodes[0].y-clipboardY)/half)*half-newNodes[0].y;
			for(var i=0; i<newNodes.length; i++) {
				newNodes[i].x+=adjustX;
				newNodes[i].y+=adjustY;
				selectedNodes.push(selection.length);
				selection.push(true);
			}
		}
		else {
			for(var i=0; i<newNodes.length; i++) {
				newNodes[i].x = x+newNodes[i].x-clipboardX;
				newNodes[i].y = y+newNodes[i].y-clipboardY;
				selectedNodes.push(selection.length);
				selection.push(true);
			}
		}
		var len = nodes.length;
		for(var i=0; i<newLines.length; i++) {
			newLines[i].a+=len;
			newLines[i].b+=len;
		}
		nodes = nodes.concat(newNodes);
		lines = lines.concat(newLines);
		if(selected==="select") $("#select").trigger("click");
		$("#copy").removeClass("disabled");
		tabID=0;
		return true;
	}
	
	//Replace object
	function replaceObj(id) {
		var obj=nodes[id];
		if(selectedNode==="line") {
			var i=0;
			var starts = [];
			var ends = [];
			while(i<lines.length) {
				if(lines[i].b===id) {
					starts.push(lines[i].a);
					lines.splice(i, 1);
				}
				else if(lines[i].a===id) {
					ends.push(lines[i].b);
					lines.splice(i, 1);
				}
				else i++;
			}
			//if(starts.length===0 || ends.length===0) return;
			for(var i=0; i<starts.length; i++) {
				for(var j=0; j<ends.length; j++) {
					lines.push({a:starts[i], b:ends[j]});
				}
			}
			deleteObj(id);
		}
		else {
			var newObj = createNewObj(selectedNode, nodes[id].x, nodes[id].y);
			if(newObj===false) return false;
			if(!design[newObj.t].canStartLine || !design[newObj.t].canEndLine) {
				var i=0;
				while(i<lines.length) {
					if((!design[newObj.t].canStartLine && lines[i].a===id) || (!design[newObj.t].canEndLine && lines[i].b===id)) lines.splice(i, 1);
					else i++;
				}
			}
			nodes.splice(id, 1, newObj);
		}
		tabID=0;
		return true;
	}
	
	//Replace line
	function replaceLine(line, x, y) {
		if(selectedNode==="line") return false;
		var newObj = createNewObj(selectedNode, x, y);
		var startObj = lines[line].a;
		var endObj = lines[line].b;
		lines.splice(line, 1);
		nodes.push(newObj);
		if(selectedNodes.length>0) selection.push(false);
		if(design[newObj.t].canEndLine) lines.push({a:startObj, b:nodes.length-1});
		if(design[newObj.t].canStartLine) lines.push({a:nodes.length-1, b:endObj});
		tabID=0;
		return true;
	}
	
	//Replace selection
	function selectionReplace() {
		for(var i=0; i<selectedNodes.length; i++) {
			if(!replaceObj(selectedNodes[i])) return false;
		}
		if(selectedNode==="line") selectionCancel();
		return true;
	}
	
	//CREATE New Object
	function createNewObj(type, x, y) {
		if(type!==12 && (holdingSHIFT || alignActivated)) {
			x = Math.round(x/half)*half;
			y = Math.round(y/half)*half;
		}
		switch(type) {
			case 1://SWITCH
				var txt = formatText($("#place"+type+" input").val(), "");
				if(txt.length>100) {
					popupMsg("The name is too long!<br />(Maximum length: 100)");
					return false;
				}
				return {t:1, n:txt, p:false, x:x, y:y};
				break;
			case 2://BUTTON
				var txt = formatText($("#place"+type+" input").val(), "");
				if(txt.length>100) {
					popupMsg("The name is too long!<br />(Maximum length: 100)");
					return false;
				}
				return {t:2, n:txt, p:false, x:x, y:y};
				break;
			case 3://PULSER
				var delay=formatNum($("#place"+type+" input").val());
				if(delay===false || delay<0 || delay>3600000) {
					popupMsg("Invalid number!");
					return false;
				}
				else {
					delay = Math.round(delay);
					return {t:3, p:false, x:x, y:y, d:delay, c:delay};
				}
				break;
			case 4://OR
				return {t:4, p:false, x:x, y:y};
				break;
			case 5://AND
				return {t:5, p:false, x:x, y:y};
				break;
			case 6://NOT
				var pwr = $("#place"+type+" .slider").hasClass("activated");
				return {t:6, p:pwr, q:pwr, x:x, y:y};
				break;
			case 7://DELAY
				var delay=formatNum($("#place"+type+" input").val());
				if(delay===false || delay<0 || delay>3600000) {
					popupMsg("Invalid number!");
					return false;
				}
				else {
					delay = Math.round(delay);
					return {t:7, p:false, d:delay, c:delay, x:x, y:y};
				}
				break;
			case 8://TOGGLE
				var pwr = $("#place"+type+" .slider").hasClass("activated");
				return {t:8, p:pwr, q:pwr, f:false, x:x, y:y};
				break;
			case 9://MONOSTABLE
				return {t:9, p:false, f:false, x:x, y:y};
				break;
			case 10://RANDOM
				return {t:10, p:false, x:x, y:y, f:false};
				break;
			case 11://NOTE
				alert("Not yet implemented!");
				return false;
				//var note = prompt();
				//nodes.push({t:11, p:false, f:false, n:note, x:x, y:y});
				break;
			case 12://OUTPUT LAMP
				var txt = formatText($("#place"+type+" input").val(), "");
				if(txt.length>100) {
					popupMsg("The name is too long!<br />(Maximum length: 100)");
					return false;
				}
				if(holdingSHIFT || alignActivated) {
					x = Math.round((x+half)/gridSpacing)*gridSpacing-half;
					y = Math.round((y+half)/gridSpacing)*gridSpacing-half;
				}
				return {t:12, p:false, n:txt, x:x, y:y};
				break;
			case 13://TEXT
				var txt = formatText($("#place"+type+" input").val())
				if(txt==="") {
					popupMsg("Text cannot be empty!");
					return false;
				}
				else if(txt.length>100) {
					popupMsg("The text is too long!<br />(Maximum length: 100)");
					return false;
				}
				else {
					ctx.font = design[type].textSize+"px Arial";
					var measure = toFixed(ctx.measureText(txt).width, 2);
					return {t:13, n:txt, x:x, y:y, w:measure};
				}
				break;
		}
		return false;
	}
	
	//DELETE object
	function deleteObj(id) {
		for(var i=lines.length-1; i>=0; i--) {
			if(lines[i].a===id || lines[i].b===id) lines.splice(i, 1);
		}
		if(selectedNodes.length>0) selection.splice(id, 1);
		if(id===nodes.length-1) nodes.splice(id, 1);
		else {
			nodes.splice(id, 1);
			reorganize(id);
		}
		tabID=0;
	}
	
	//DELETE selection
	function selectionDelete() {
		for(var i=0; i<selectedNodes.length; i++) {
			deleteObj(selectedNodes[i]);
		}
		selectionCancel();
	}
	
	//EDIT object
	function editObj(id, lineID) {
		if(id!==false) {
			if(!design[nodes[id].t].editable) return false;
			switch(nodes[id].t) {
				case 1: case 2: case 12://EDIT NAME (BUTTON, SWITCH, OUTPUT LAMP)
					popupInput("Enter new name:", nodes[id].n, function() {
						var name=formatText(popupValue());
						if(selectedNodes.length<2 && name===nodes[id].n) {
							popupClose();
							return;
						}
						if(name.length>100) errorBlink();
						else {
							if(selectedNodes.length>1 && selection[id]) {
								for(var i=0; i<selectedNodes.length; i++) {
									if(nodes[selectedNodes[i]].t===nodes[id].t) nodes[selectedNodes[i]].n = name;
								}
							}
							else nodes[id].n = name;
							addUndo();
							redraw();
							popupClose();
						}
					});
					break;
				case 3: case 7://EDIT DELAY (PULSER, DELAY)
					popupInput("Change delay: (ticks)", nodes[id].d, function() {
						var delay = formatNum(popupValue());
						if(delay===false || delay<0 || delay>3600000) errorBlink();
						else {
							if(selectedNodes.length>1 && selection[id]) {
								for(var i=0; i<selectedNodes.length; i++) {
									if(nodes[selectedNodes[i]].t===nodes[id].t) {
										nodes[selectedNodes[i]].d=Math.round(parseFloat(delay));
										nodes[selectedNodes[i]].c=Math.round(parseFloat(delay));
									}
								}
							}
							else {
								nodes[id].d=Math.round(parseFloat(delay));
								nodes[id].c=Math.round(parseFloat(delay));
							}
							addUndo();
							redraw();
							popupClose();
						}
					});
					break;
				case 6: case 8://EDIT STARTING POWER (NOT, TOGGLE)
					if(selectedNodes.length>1 && selection[id]) {
						for(var i=0; i<selectedNodes.length; i++) {
							if(nodes[selectedNodes[i]].t===nodes[id].t) {
								nodes[selectedNodes[i]].q = !nodes[selectedNodes[i]].q
								nodes[selectedNodes[i]].p = nodes[selectedNodes[i]].q
							}
						}
					}
					else {
						nodes[id].q = !nodes[id].q;
						nodes[id].p = nodes[id].q;
					}
					addUndo();
					redraw();
					break;
				case 11://EDIT NOTE (NOTE)
					//not yet implemented
					break;
				case 13://EDIT TEXT (TEXT)
					popupInput("Edit text:", nodes[id].n, function() {
						var txt = formatText(popupValue());
						if(txt==="" || txt.length>100) errorBlink();
						else {
							if(selectedNodes.length<2 && txt===nodes[id].n) {
								popupClose();
								return;
							}
							ctx.font = textSize+"px Arial";
							var measure = toFixed(ctx.measureText(txt).width, 2);
							if(selectedNodes.length>1 && selection[id]) {
								for(var i=0; i<selectedNodes.length; i++) {
									if(nodes[selectedNodes[i]].t===nodes[id].t) {
										nodes[selectedNodes[i]].n = txt;
										nodes[selectedNodes[i]].w = measure;
									}
								}
							}
							else {
								nodes[id].n = txt;
								nodes[id].w = measure;
							}
							addUndo();
							redraw();
							popupClose();
						}
					});
					break;
				default:
					return;
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
		dragId = id;
		if(selectedNodes.length>1 && selection[id]) {
			for(var i=0; i<selectedNodes.length; i++) {
				uptopNode(selectedNodes[i]);
			}
		}
		else uptopNode(id);
		selectedNodes.numSort();
		dragging = true;
		tabID = 0;
		redraw();
		nodeMoveActivate();
	}
	
	//BRING NODE ON TOP OF STACK
	function uptopNode(id) {
		if(id===nodes.length-1) return;
		var obj = nodes[id];
		nodes.splice(id, 1);
		nodes.push(obj);
		reorganize(id);
		if(selectedNodes.length>0) {
			var sel = selection[id];
			selection.splice(id, 1);
			selection.push(sel);
		}
	}
	
	//REORGANIZE IDs after object delete/drag
	function reorganize(pos) {
		var uptop = [];
		//LINES
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
		if(tabID>0) {
			if(tabID===pos) tabID = 0;
			else if(tabID>pos) tabID--;
		}
		//Dragged obj
		if(dragId>pos) dragId--;
		else if(dragId===pos) dragId = nodes.length-1;
		//SELECTION
		if(selectedNodes.length===0) return;
		uptop = false;
		for(var i=0; i<selectedNodes.length; i++) {
			if(selectedNodes[i]===pos) uptop = i;
			else if(selectedNodes[i]>pos) selectedNodes[i]--;
		}
		if(uptop!==false) selectedNodes[uptop]=nodes.length-1;
	}
	
	//Find duplicate line - prevent creating multiple identical lines
	function findDuplicateLine(st, end) {
		for(var i=0; i<lines.length; i++) {
			if(lines[i].a===st && lines[i].b===end) return true;
		}
		return false;
	}
	
	//SELECT AREA
	function selectArea() {
		var x1=Math.min(realX, selectX);
		var y1=Math.min(realY, selectY);
		var x2=Math.max(realX, selectX);
		var y2=Math.max(realY, selectY);
		var newSelection = [];
		selectedNodes = [];
		for(var i = 0; i<nodes.length; i++) {
			if((holdingCTRL && selection.length>0 && selection[i]) || (nodes[i].x>x1 && nodes[i].x<x2 && nodes[i].y>y1 && nodes[i].y<y2)) {
				newSelection.push(true);
				selectedNodes.push(i);
			}
			else newSelection.push(false);
		}
		if(selectedNodes.length===0) selectionCancel();
		else {
			selection = newSelection;
			$("#copy").removeClass("disabled");
		}
		redraw();
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
			if(Math.min(nodes[lines[i].a].x, nodes[lines[i].b].x)<(-canvasX+(width/zoom)) && Math.max(nodes[lines[i].a].x, nodes[lines[i].b].x)>(-canvasX) && Math.min(nodes[lines[i].a].y, nodes[lines[i].b].y)<(-canvasY+(height/zoom)) && Math.max(nodes[lines[i].a].y, nodes[lines[i].b].y)>(-canvasY)) drawLine(nodes[lines[i].a].x, nodes[lines[i].a].y, nodes[lines[i].b].x, nodes[lines[i].b].y, lines[i].p);
		}
		onScreenNodes = 0;
		totalSelected = 0;
		for(var i=0; i<nodes.length; i++) {
			//IS NODE SELECTED?
			var isSelected = false;
			if(state==="edit" && ((selectedNodes.length>0 && selection[i]) || (selecting && (nodes[i].x>Math.min(realX, selectX) && nodes[i].x<Math.max(realX, selectX) && nodes[i].y>Math.min(realY, selectY) && nodes[i].y<Math.max(realY, selectY))))) {
				totalSelected++;
				isSelected = true;
			}
			
			//SKIP OFF-SCREEN NODES
			if(design[nodes[i].t].shape==="circle") {
				if((nodes[i].x+getRadius(i))<(-canvasX) || (nodes[i].y+getRadius(i))<(-canvasY) || (nodes[i].x-getRadius(i))>(-canvasX+(width/zoom)) || (nodes[i].y-getRadius(i))>(-canvasY+(height/zoom))) continue;
			}
			else {
				if((nodes[i].x+getSizeX(i))<(-canvasX) || (nodes[i].y+getSizeY(i))<(-canvasY) || (nodes[i].x-getSizeX(i))>(-canvasX+(width/zoom)) || (nodes[i].y-getSizeY(i))>(-canvasY+(height/zoom))) continue;
			}
			onScreenNodes++;
			
			//DRAW NODES
			if(design[nodes[i].t].shape==="rect" && nodes[i].t!==13) {//13=TEXT
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
			else if([3, 7].includes(nodes[i].t)) {//pulser, delay
				var txt = nodes[i].d;
			}
			if(txt!=="") {
				if(nodes[i].t===12) {//DRAW TEXT ABOVE OUTPUT WHEN TOO LONG
					ctx.font = design[nodes[i].t].textSize+"px Arial";
					var measure = toFixed(ctx.measureText(txt).width, 2);
					if(measure>design[12].width) drawText(nodes[i].x, nodes[i].y-(design[12].height/2)-(design[12].textSize/2)-2, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
					else drawText(nodes[i].x, nodes[i].y, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize);
				}
				else drawText(nodes[i].x, nodes[i].y, txt, design[nodes[i].t].textColor, design[nodes[i].t].textSize); 
			}
			
			//IF DEBUG, DRAW NODE ID AND POS
			if(debugShown) {
				var txtpos = nodes[i].y+4+(debugNodeTextSize/2)+((design[nodes[i].t].shape==="circle")?getRadius(i):(getHeight(i)/2))
				drawText(nodes[i].x, txtpos, "ID="+i+", x="+nodes[i].x+", y="+nodes[i].y, blackColor, debugNodeTextSize);
				if(state!=="edit" && (nodes[i].t===3 || nodes[i].t===7)) drawText(nodes[i].x, txtpos+debugNodeTextSize, "countdown="+nodes[i].c, blackColor, debugNodeTextSize);
			}
			
			//DRAW SELECTION OVER NODES
			if(isSelected) {
				if(design[nodes[i].t].shape==="circle") selectionCircle(nodes[i].x, nodes[i].y, getRadius(i));
				else if(design[nodes[i].t].shape==="oval") selectionOval(nodes[i].x-getWidth(i)/2, nodes[i].y-getHeight(i)/2, nodes[i].x+getWidth(i)/2, nodes[i].y+getHeight(i)/2);
				else if(nodes[i].t===13) selectionRect(nodes[i].x-getWidth(i)/2-4, nodes[i].y-getHeight(i)/2-4, nodes[i].x+getWidth(i)/2+4, nodes[i].y+getHeight(i)/2+4);
				else selectionRect(nodes[i].x-getWidth(i)/2, nodes[i].y-getHeight(i)/2, nodes[i].x+getWidth(i)/2, nodes[i].y+getHeight(i)/2);
			}
		}//DRAW CURRENT LINE
		if(lineStart!==false) {
			if(selected==="line" && selectedNodes.length>1 && selection[lineStart]) {
				for(var i=0; i<selectedNodes.length; i++) {
					drawLine(nodes[selectedNodes[i]].x, nodes[selectedNodes[i]].y, realX, realY, false);
				}
			}
			else drawLine(nodes[lineStart].x, nodes[lineStart].y, realX, realY, false);
		}
		if(selecting) drawSelection(selectX, selectY, realX, realY, true);
		if(debugShown) updateDebug();
	}
	
	//UPDATE DEBUG INFO
	function updateDebug() {
		$("#debug").html("cursorX="+globalX+", cursorY="+globalY+
		"<br/>mouseX="+realX+", mouseY="+realY+
		"<br/>canvasX="+canvasX+", canvasY="+canvasY+
		"<br/>nodes: "+onScreenNodes+"/"+nodes.length+", lines: "+lines.length+", zoom: "+zoom+
		"<br/>TPS: "+toFixed(TPS, 2)+"/"+toFixed(1000/tickSpeed, 2)+
		(state!=="edit"?("<br/>ticks: "+ticks):"")+
		(totalSelected>0?("<br/>selection: "+totalSelected):"")
		);
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
	
	//MAIN - CLICK ON CANVAS ACTION - PLACE OBJECT, EDIT, DELETE...
	function clickOn(x, y) {
		var clickResult = getClickedNode(x, y);
		
		//Click with selection
		if(selected==="select") {
			if(clickResult===false) {
				if(selectedNodes.length>0 && !holdingCTRL) selectionCancel();
				else return;
			}
			else if(holdingCTRL && selectedNodes.length>0) {
				if(selection[clickResult]) selectedNodes.splice(selectedNodes.indexOf(clickResult), 1);
				else {
					selectedNodes.push(clickResult);
					selectedNodes.numSort();
				}
				selection[clickResult]=!selection[clickResult];
				if(selectedNodes.length===0) selectionCancel();
			}
			else if(selectedNodes.length===1 && selection[clickResult]) return;
			else {
				selectionCancel();
				for(var i=0; i<nodes.length; i++) {
					if(i===clickResult) selection.push(true);
					else selection.push(false);
				}
				selectedNodes.push(clickResult);
				$("#copy").removeClass("disabled");
			}
		}//Click with line
		else if(selected==="line" || (selected==="edit" && lineStart!==false)) {
			if(clickResult===false) {//Click on empty
				if(!lineStop()) selectionCancel();
				else {
					if(selected==="edit") addUndo();
				}
			}//LINE START
			else if(lineStart===false && design[nodes[clickResult].t].canStartLine) {
				lineStart = clickResult;
				lineLast = lineStart;
				lineStartActivate();
			}//LINE END
			else if(lineStart!==false && design[nodes[clickResult].t].canEndLine) {
				if(selectedNodes.length>1 && (selection[lineStart] || selection[clickResult])) {
					if(selected==="line" && selection[lineStart]) var starts = selectedNodes;
					else var starts = [lineStart];
					if(selection[clickResult]) var ends = selectedNodes;
					else var ends = [clickResult];
					for(var i=0; i<starts.length; i++) {
						for(var j=0; j<ends.length; j++) {
							if(starts[i]!==ends[j] && !findDuplicateLine(starts[i], ends[j])) lines.push({a:starts[i], b:ends[j]});
						}
					}
				}
				else {
					if(lineStart===clickResult || findDuplicateLine(lineStart, clickResult)) return;
					lines.push({a:lineStart, b:clickResult});
				}
				lineStop();
				addUndo();
			}
			else return;
		}//Click with node
		else if(!["edit", "delete", "replace"].includes(selected)) {
			if(clickResult===false) {//CREATE NEW OBJECT
				selectionCancel();
				var newObj = createNewObj(selectedNode, x, y);
				if(newObj===false) return;
				else nodes.push(newObj);
				tabID=0;
				addUndo();
			}
			else {//Bring object/selection on top of stack (foreground)
				if(selectedNodes.length>1 && selection[clickResult]) {
					var reorg=false;
					for(var i=0; i<selection.length; i++) {
						if(selection[i]) {
							for(var j=i+1; j<selection.length; j++) {
								if(!selection[j]) {
									reorg = true;
									break;
								}
							}
							break;
						}
					}
					if(!reorg) return;
					for(var i=0; i<selectedNodes.length; i++) {
						uptopNode(selectedNodes[i]);
					}
					selectedNodes.numSort();
					tabID = 0;
					addUndo();
				}
				else {
					selectionCancel();
					if(clickResult<nodes.length-1) {
						uptopNode(clickResult);
						tabID = 0;
						addUndo();
					}
				}
			}
		}
		else {//ALL OTHER TOOLS
			var clickResultLine = getClickedLine(x, y);
			
			//EDIT Object
			if(selected==="edit") {
				if(clickResult===false && clickResultLine===false) {
					selectionCancel();
					//$("#speed").trigger("click");
				}
				else editObj(clickResult, clickResultLine)
				return;
			}//DELETE Object/Line
			else if(selected==="delete") {
				if(clickResult!==false) {//DELETE OBJECT
					if(selectedNodes.length>0 && selection[clickResult]) selectionDelete();
					else deleteObj(clickResult);
					addUndo();
				}
				else if(clickResultLine!==false) {//DELETE LINE
					lines.splice(clickResultLine, 1);
					addUndo();
				}
				else selectionCancel();
			}//REPLACE
			else if(selected==="replace") {
				if(clickResult!==false && selectedNodes.length>0 && selection[clickResult]) {
					if(!selectionReplace()) return;
					addUndo();
				}
				else if(clickResult!==false) {
					if(!replaceObj(clickResult)) return;
					addUndo();
				}
				else if(clickResultLine!==false) {
					if(!replaceLine(clickResultLine, x, y)) return;
					addUndo();
				}
				else selectionCancel();
			}
		}
		redraw();
	}
	
	//Confirm Leaving the page with unsaved changes
	window.onbeforeunload = function(){
		if(unsaved()) return "There are unsaved changes.\nAre you sure you want to leave?";
	}
	
	//Remove Endora text
	$("i").parent().parent().parent().remove();
});