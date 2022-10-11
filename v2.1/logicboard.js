$(document).ready(function() {
	var drawCircle = function(x, y, r, color, outline, line) {
		ctx.fillStyle = color;
		ctx.strokeStyle = outline;
		ctx.lineWidth = line;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.fill();
	};
	
	var drawLine = function(startX, startY, endX, endY, color, line) {
		ctx.lineWidth = line;
		var grad=ctx.createLinearGradient(startX, startY, endX, endY);
		grad.addColorStop(0, color);
		if(color===defaultPower) grad.addColorStop(1, defaultPowerGradient);
		else grad.addColorStop(1, defaultOutlineGradient);
		ctx.strokeStyle = grad;
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	};
	
	var drawRect = function(startX, startY, endX, endY, color, outline, line) {
		ctx.fillStyle=color;
		ctx.strokeStyle=outline;
		ctx.lineWidth=line;
		ctx.beginPath();
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.stroke();
		ctx.fill();
	};
	
	var drawOval = function(startX, startY, endX, endY, color, outline, line) {
		ctx.fillStyle=color;
		ctx.strokeStyle=outline;
		ctx.lineWidth=line;
		ctx.beginPath();
		startX+=(defaultHeight/2);
		endX-=(defaultHeight/2);
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.arc(startX, startY+((endY-startY)/2), defaultHeight/2, degToRad(90), degToRad(270), false);
		ctx.arc(endX, startY+((endY-startY)/2), defaultHeight/2, degToRad(270), degToRad(90), false);
		ctx.stroke();
		ctx.fill();
	}
	
	var drawText = function(x, y, text, color, size) {
		ctx.fillStyle=color;
		ctx.font = size+"px Arial";
		ctx.beginPath();
		ctx.fillText(text, x, y);
	};
	
	var clear = function() {
		ctx.clearRect(-canvasX, -canvasY, width/zoom, height/zoom);
	};
	
	var degToRad = function(deg) {
		return deg*(Math.PI/180);
	};
	
	//trigger file download
	function downloadProject(filename, datastring) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(datastring));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}
	
	//resize canvas to window
	$(window).on("resize", function() {
		ctx.canvas.height = $(window).height()-122;
		ctx.canvas.width = $(window).width();
		width = canvas.width;
		height = canvas.height;
		midX = width/2;
		midY = height/2;
		ctx.textAlign="center";
		ctx.textBaseline="middle";
		ctx.scale(zoom, zoom);
		ctx.translate(canvasX, canvasY);
		if(redrawAll!=undefined) redrawAll();
	});
	
	/*-----------------------------SETUP-------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var zoom = 1;
	var zoomSpeed = 2;
	var maxZoom = 16;
	var minZoom = 0.03125;
	$(window).trigger("resize");
	
	var fontSize = 16;
	var textSize = 28;
	
	var panLastX = 0;
	var panLastY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var dragLastX = 0;
	var	dragLastY = 0;
	var dragId = 0;
	var holdingClick = false;
	var lineStart = false;
	var lineLast = false;
	var globalX = midX;
	var globalY = midY;
	
	var nodes = [];
	var nNodes = {nText:0, nSwitch:0, nButton:0, nSource:0, nOr:0, nAnd:0, nNot:0, nDelay:0, nOutput:0, nLine:0};
	var lines = [];
	var tickSpeed = 10;
	var selected = "s";
	var state = "edit";
	var TimeoutID = 0;

	var defaultLine = 4;
	var defaultColor = "rgba(200, 200, 200, 255)";
	var defaultOutline = "rgba(0, 0, 0, 255)";
	var defaultOutlineGradient = "rgba(150, 150, 150, 255)";
	var noOutline = "rgba(0, 0, 0, 0)";
	var defaultPower = "rgba(255, 0, 0, 255)";
	var defaultPowerGradient = "rgba(255, 150, 150, 255)";
	var defaultText = "rgba(0, 0, 0, 255)";
	var defaultName = "rgba(0, 0, 255, 255)";
	var defaultGate = "rgba(128, 128, 128, 255)";
	var defaultRadius = 24;
	var defaultWidth = 80;
	var defaultHeight = 40;
	
	var lastDelay = 5;
	var lastPulser = Math.round(1000/tickSpeed);
	
	//get device
	var isMobile = function() {
		try {
			document.createEvent("TouchEvent");
			return true;
		}
		catch(e) {
			return false;
		}
	}
	var mobile = isMobile();
	
	//prevent button dragging and highlighting
	$(document).on("mousedown", function(e) {
		if(e.which===1 && !$(e.target).is("input") && !$(e.target).is("label")) e.preventDefault();
	});
	
	//TAGS:   r,x1,x2,y1,y2, s=shape, n=name, t=type, p=powered, a=startID, b=endID, d=delay, c=countdown, f=fired, sp=startPowered
	//SHAPES:   c=circle, r=rect=rectangle, o=oval
	//TYPES:   s=switch, b=button, p=pulser, q=source, o=or, a=and, n=not, d=delay, t=toggle, m=monostable, r=random, l=output(lamp), w=text
	
	/*----------------------EVENTS-------------------------------------------------------------------*/
	
	//hide overlay
	$("#close").on("mousedown", function() {
		$("#information").scrollTop(0);
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
	
	//show load project
	$("#load").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_load").removeClass("hidden");
	});
	
	//show download project
	$("#download").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_download").removeClass("hidden");
	});
	
	//DOWNLOAD PROJECT
	$("#downloadButton").on("click", function() {
		var filename=$("#downloadName").val();
		if(filename==false || filename==="" || filename==null) return;
		else if(filename.length>50) alert("The file name is too long!");
		else {
			downloadProject(filename+".lgb", btoa(JSON.stringify([nodes, lines, canvasX, canvasY, zoom])));
			$("#overlay, #popup_download").addClass("hidden");
		}
	});
	
	//show save project
	$("#save").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_save").removeClass("hidden");
		$("#exportSave").val(btoa(JSON.stringify([nodes, lines, canvasX, canvasY, zoom])));
	});
	
	//clipboard copy
	var textToCopy = "";
	var clipboardProject = new Clipboard("#copyButton", {
		text: function(trigger) {
			$("#copyDone").removeClass("hidden");
			return textToCopy=$("#exportSave").val();
		}
	});
	
	//load project from file
	$("#inputFile").change(function() {
		var file=document.getElementById("inputFile").files[0];
		if(file.name.slice(-4)!==".lgb") alert("Unsupported file type!");
		else if(file.size>50000000) alert("File is too big!");
		else {
			var r = new FileReader();
			r.onload = function(e) {
				var content = e.target.result;
				if(loadFile(content)) $(".popup, #overlay").addClass("hidden");
			};
			r.readAsText(file);
		}
	});
	
	//load project from text input
	$("#pasteButton").on("click", function() {
		if(loadFile($("#pasteImport").val())) $(".popup, #overlay").addClass("hidden");
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
				loadFile(content);
			};
			r.readAsText(file);
		}
	});
	
	//Change SPEED
	$("#speed").on("click", function() {
		var newSpeed = prompt("Ticks per second: (Hz)", "100");
		if(newSpeed==null || newSpeed===false) return;
		else if(isNaN(parseFloat(newSpeed)) || parseFloat(newSpeed)<0.1 || parseFloat(newSpeed)>1000) alert("Invalid number!");
		else {
			tickSpeed=1000/parseFloat(newSpeed);
			$("#speedSetting").html("Ticks per second: "+newSpeed);
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
			$("#debug").removeClass("hidden");
		}
	});
	
	//TOOLBAR - Select item
	$(".node, #pan, #delete, #edit, #replace, #select").on("click", function() {
		if(state==="edit") {
			selected = $(this).attr("id");
			$(".node, #pan, #delete, #edit, #replace, #select").removeClass("selected");
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
		redrawAll();
	});
	
	//TOOLBAR zoom- (unzoom)
	$("#unzoom").on("click", function() {
		unzoomF();
		redrawAll();
	});
	
	//ZOOM+ FUNCTION
	var zoomF = function() {
		if(zoom<maxZoom) {
			ctx.translate(-canvasX, -canvasY);
			zoom=zoom*zoomSpeed;
			canvasX-=midX/zoom;
			canvasY-=midY/zoom;
			ctx.scale(zoomSpeed,zoomSpeed);
			ctx.translate(canvasX, canvasY);
		}
	};
	
	//UNZOOM- FUNCTION
	var unzoomF = function() {
		if(zoom>minZoom) {
			ctx.translate(-canvasX, -canvasY);
			canvasX+=midX/zoom;
			canvasY+=midY/zoom;
			ctx.scale(1/zoomSpeed,1/zoomSpeed);
			ctx.translate(canvasX, canvasY);
			zoom=zoom/zoomSpeed;
		}
	};
	
	//TOOLBAR - Debug Coordinates
	$("#canvas").on("mousemove.debug", function(event) {
		var canX2=globalX/zoom-canvasX;
		var canY2=globalY/zoom-canvasY;
		$("#debug").html("mouseX="+globalX+", mouseY="+globalY+"<br/>gridX="+canX2+", gridY="+canY2+"<br/>moveX="+canvasX+", moveY="+canvasY+", zoom="+zoom);
	});
	
	//LOAD PROJECT
	var loadFile = function(loadProject) {
		if(loadProject==="" || loadProject==null || loadProject==false) return false;
		var oldNodes = nodes;
		var oldLines = lines;
		var oldCanvasX = canvasX;
		var oldCanvasY = canvasY;
		var oldZoom = zoom;
		try {
			var loadArr = JSON.parse(atob(loadProject));
			nodes=loadArr[0];
			lines=loadArr[1];
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			if(!(loadArr.length>2)) {
				canvasX=0;
				canvasY=0;
				zoom=1;
			}
			else {
				canvasX=loadArr[2];
				canvasY=loadArr[3];
				zoom=loadArr[4];
				ctx.scale(zoom, zoom);
				ctx.translate(canvasX, canvasY);
			}
			redrawAll();
			return true;
		}
		catch(err) {
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			nodes=oldNodes;
			lines=oldLines;
			canvasX=oldCanvasX;
			canvasY=oldCanvasY;
			zoom=oldZoom;
			ctx.scale(zoom, zoom);
			ctx.translate(canvasX, canvasY);
			alert("Error:\n"+err.message);
			return false;
		}
	};
	
	//TRACK global MOUSE coordinates - mousemove
	$("#canvas").on("mousemove.global", function(event) {
		var rect = canvas.getBoundingClientRect();
		globalX = event.clientX - rect.left;
		globalY = event.clientY - rect.top;
	});
	
	//KEYDOWN on canvas
	$(document).on("keydown", function(key) {
		//82=r, 17=ctrl, 70=f, 16=shift, 46=delete, 109=-, 107=+, 69=e, 81=q
		//w=87 a=65 s=83 d=68  -  up=38 left=37 down=40 right=39
		if(!$("#overlay").hasClass("hidden")) return;
		var keyID = parseInt(key.which,10);
		var canX=(globalX/zoom)-canvasX;
		var canY=(globalY/zoom)-canvasY;
		if($('#canvas:hover').length != 0) var obj = getClickedNode(canX, canY);
		else var obj=false;
		//KEY R - align to grid
		if(keyID===82 && state==="edit" && obj!==false) {
			if(nodes[obj].s!=="c") {
				var centerX=getMiddleX(obj);
				var centerY=getMiddleY(obj);
				var w=nodes[obj].x2-nodes[obj].x1;
				var h=nodes[obj].y2-nodes[obj].y1;
				var l=0;
				if(nodes[obj].t!=="l") l=defaultLine+6;
				centerX=Math.round(centerX/((defaultWidth+l)/2))*((defaultWidth+l)/2);
				centerY=Math.round(centerY/((defaultWidth+l)/2))*((defaultWidth+l)/2);
				nodes[obj].x1=centerX-w/2;
				nodes[obj].x2=centerX+w/2;
				nodes[obj].y1=centerY-h/2;
				nodes[obj].y2=centerY+h/2;
			}
			else {
				nodes[obj].x1=Math.round(nodes[obj].x1/((defaultWidth+defaultLine+6)/2))*((defaultWidth+defaultLine+6)/2);
				nodes[obj].y1=Math.round(nodes[obj].y1/((defaultWidth+defaultLine+6)/2))*((defaultWidth+defaultLine+6)/2);
			}
			redrawAll();
		}//KEY F - quick new line
		else if(keyID===70 && state==="edit" && !holdingClick && lineLast!==false && selected==="line" && lineStart===false) {
			lineStart = lineLast;
			lineStartActivate();
			if(nodes[lineStart].s==="c") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, canX, canY, defaultOutline, defaultLine);
			else drawLine(getMiddleX(lineStart), getMiddleY(lineStart), canX, canY, defaultOutline, defaultLine);
		}//KEY DELETE - delete object
		else if((keyID===46 || keyID===81) && state==="edit" && !holdingClick) {
			if(obj!==false) deleteObj(obj);
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) lines.splice(clickedLine, 1);
			}
			redrawAll();
		}//KEY WASD / up,left,down,right - PAN
		else if([87, 65, 83, 68, 38, 37, 40, 39].includes(keyID)) {
			var panAmount = 32/zoom;
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
			redrawAll();
		}//KEY - UNZOOM
		else if(keyID===109) {
			unzoomF();
			redrawAll();
		}//KEY + ZOOM
		else if(keyID===107 && zoom<maxZoom) {
			zoomF();
			redrawAll();
		}//KEY E - Edit
		else if(keyID===69/*LOL*/ && obj!==false  && state==="edit" && !holdingClick) {
			if(editObj(obj)) redrawAll();
		}
	});
	
	//MOUSE ZOOM ScrollWheel
	$('#canvas').bind('mousewheel', function(e){
		if((e.originalEvent.wheelDelta/120 > 0 && zoom >= maxZoom) || (!(e.originalEvent.wheelDelta/120 > 0) && zoom <= minZoom)) return;
		event.preventDefault();
		var canX=globalX/zoom;
		var canY=globalY/zoom;
		panLastX = midX/zoom;
		panLastY = midY/zoom;
		canvasX=canvasX-(canX-panLastX);
		canvasY=canvasY-(canY-panLastY);
		ctx.translate(-(canX-panLastX), -(canY-panLastY));
		canX=canX*zoom;
		canY=canY*zoom;
		if(e.originalEvent.wheelDelta/120 > 0) {//ZOOM+
			zoomF();
		}
		else{//ZOOM- / UNZOOM
			unzoomF();
		}
		canX=canX/zoom;
		canY=canY/zoom;
		panLastX = midX/zoom;
		panLastY = midY/zoom;
		canvasX=canvasX+(canX-panLastX);
		canvasY=canvasY+(canY-panLastY);
		ctx.translate(canX-panLastX, canY-panLastY);
		redrawAll();
	});
	
	//MAIN CLICK EVENT - mousedown canvas
	$("#canvas").on("mousedown", function(event) {
		if(event.which===1) {
			event.preventDefault();
			var canX=globalX/zoom;
			var canY=globalY/zoom;
			panLastX = canX;
			panLastY = canY;
			canX-=canvasX;
			canY-=canvasY;
			dragLastX = canX;
			dragLastY = canY;
			holdingClick = true;
			clickOn(canX, canY);
		}
	});
	
	//MOUSE Drag Object - mousemove
	var nodeMoveActivate = function() {
		$("#canvas").on("mousemove.drag", function(event) {
			event.preventDefault();
			var canX=globalX/zoom;
			var canY=globalY/zoom;
			canX-=canvasX;
			canY-=canvasY;
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
			redrawAll();
		});
	};
	
	//MOUSE disable hold - mouseup
	$(document).on("mouseup", function(event) {
		$("#canvas").off("mousemove.drag");
		$("#canvas").off("mousemove.pan");
		holdingClick = false;
	});
	
	//MOUSE create line - mousemove
	var lineStartActivate = function() {
		$("#canvas").on("mousemove.line", function(event) {
			event.preventDefault();
			var canX=(globalX/zoom)-canvasX;
			var canY=(globalY/zoom)-canvasY;
			redrawAll();
			if(nodes[lineStart].s==="c") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, canX, canY, defaultOutline, defaultLine);
			else drawLine(getMiddleX(lineStart), getMiddleY(lineStart), canX, canY, defaultOutline, defaultLine);
		});
	};
	
	//MOUSE pan / translate canvas - mousemove
	var panActivate = function() {
		$("#canvas").on("mousemove.pan", function(event) {
			event.preventDefault();
			var canX=globalX/zoom;
			var canY=globalY/zoom;
			canvasX=canvasX+(canX-panLastX);
			canvasY=canvasY+(canY-panLastY);
			ctx.translate(canX-panLastX, canY-panLastY);
			panLastX = canX;
			panLastY = canY;
			redrawAll();
		});
	};
	
	/*-----------------------------CANVAS------------------------------------------------------------*/
	
	//STOP Simulation
	var stopSimulation = function() {
		clearTimeout(TimeoutID);
		state="edit";
		$("#StartControls").removeClass("hidden");
		$("#StopControls").addClass("hidden");
		$("#pause").attr("src", "icons/pause.png");
		$("#step").addClass("disabled");
		$(".node, #EditControls .button").removeClass("disabled");
		resetPower();
		redrawAll();
	};
	
	//START SIMULATION
	var startSimulation = function() {
		$("#StartControls").addClass("hidden");
		$("#StopControls").removeClass("hidden");
		$(".node, #EditControls .button").addClass("disabled");
		state="running";
		TimeoutID = setTimeout(Tick, tickSpeed);
	};
	
	//MAIN Tick loop
	var Tick = function() {
		TimeoutID = setTimeout(Tick, tickSpeed);
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
		redrawAll();
	};
	
	//get AND connection
	var testAnd = function(id) {
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
	var testOr = function(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].b===id && lines[j].p) return true;
		}
		return false;
	}
	
	//RESET Objects after simulation STOP
	var resetPower = function() {
		for(j=0; j<nodes.length; j++) {
			if(nodes[j].sp!=undefined) nodes[j].p = nodes[j].sp;
			else if(nodes[j].t!=="q") nodes[j].p = false;
			if(["d", "p"].includes(nodes[j].t)) nodes[j].c = nodes[j].d;
			if(nodes[j].f!=undefined) nodes[j].f = false;
		}
		for(j=0; j<lines.length; j++) {
			lines[j].p = false;
		}
	};
	
	//get color of object depending on power
	var powerColor = function(node) {
		if(nodes[node].p) return defaultPower;
		else return defaultColor;
	};
	
	//get color of line depending on power
	var powerColorLine = function(line) {
		if(lines[line].p) return defaultPower;
		else return defaultOutline;
	};
	
	//get object name from letter
	var getFullName = function(n) {
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
			default: return "error";
		}
	};
	//TYPES:   s=switch, b=button, p=pulser, q=source, o=or, a=and, n=not, d=delay, t=toggle, m=monostable, r=random, l=output(lamp), w=text
	
	//get object middle X
	var getMiddleX = function(node) {
		if(nodes[node].s==="c") return nodes[node].x1;
		else return nodes[node].x1+((nodes[node].x2-nodes[node].x1)/2);
	};
	
	//get object middle Y
	var getMiddleY = function(node) {
		if(nodes[node].s==="c") return nodes[node].y1;
		else return nodes[node].y1+((nodes[node].y2-nodes[node].y1)/2);
	};
	
	//Find duplicate line - prevent creating multiple identical lines
	var findDuplicateLine = function(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].a===lineStart && lines[j].b===id) return true;
		}
		return false;
	};
	
	//SHIFT / recalculate IDs after object delete/drag
	var reorganize = function(pos) {
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
	};
	
	//DELETE object
	var deleteObj = function(id) {
		for(j = lines.length-1; j>=0; j--) {
			if(lines[j].a===id || lines[j].b===id) lines.splice(j, 1);
		}
		if(id<nodes.length-1) {
			nodes.splice(id, 1);
			reorganize(id);
		}
		else nodes.splice(id, 1);
	};
	
	//EDIT object
	var editObj = function(id) {
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
					var name = prompt("Enter text:");
					if(name!=undefined && name!=="" && name!==" " && name!==nodes[id].n) {
						var mX = getMiddleX(id);
						ctx.font = textSize+"px Arial";
						nodes[id].n = name;
						nodes[id].x1 = mX-(ctx.measureText(name).width/2);
						nodes[id].x2 = mX+(ctx.measureText(name).width/2);
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
		return false;
	};
	
	//MAIN RENDER EVERYTHING - Re-Draw All
	var redrawAll = function() {
		clear();
		for(i=0; i<lines.length; i++) {
			drawLine(getMiddleX(lines[i].a), getMiddleY(lines[i].a), getMiddleX(lines[i].b), getMiddleY(lines[i].b), powerColorLine(i), defaultLine);
		}
		for(i=0; i<nodes.length; i++) {
			switch(nodes[i].t) {
				case "w"://TEXT
					drawText(getMiddleX(i), getMiddleY(i), nodes[i].n, defaultText, textSize);
					break;//BUTTON - SWITCH
				case "s": case "b":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					if(nodes[i].n!="") drawText(nodes[i].x1, nodes[i].y1, nodes[i].n, defaultName, fontSize);
					break;
				case "q"://SOURCE
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, defaultPower, defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, "+", defaultText, textSize);
					break;
				case "o": case "a": case "t": case "m"://AND - OR - TOGGLE - MONOSTABLE
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), getFullName(nodes[i].t).toUpperCase(), defaultGate, fontSize);
					break;
				case "n": case "r"://NOT - RANDOM
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, getFullName(nodes[i].t).toUpperCase(), defaultGate, fontSize);
					break;
				case "d"://DELAY
					drawOval(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].d, defaultGate, fontSize);
					break;
				case "l"://OUTPUT LAMP
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), noOutline, 0);
					if(nodes[i].n!="") drawText(getMiddleX(i),getMiddleY(i), nodes[i].n, defaultText, fontSize);
					break;
				case "p"://PULSER
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].d, defaultGate, fontSize);
					break;
			}
		}
		//DEBUG
		//drawRect(0, 0, 100, 100, defaultOutline, noOutline, 0); //debug 0, 0
		//drawCircle(midX, midY, 20, defaultOutline, noOutline, 0); //debug midX, midY
	};
	
	//GET CLICKED OBJECT ID
	var getClickedNode = function(x, y) {
		if(nodes.length===0) return false;
		for(i = nodes.length-1; i>=0; i--) {
			if(nodes[i].s==="r") {
				if(x>=nodes[i].x1 && nodes[i].x2>=x && y>=nodes[i].y1 && nodes[i].y2>=y) return i;
			}
			else if(nodes[i].s==="o") {
				if((x>=nodes[i].x1+(defaultHeight/2) && nodes[i].x2-(defaultHeight/2)>=x && y>=nodes[i].y1 && nodes[i].y2>=y) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x1+(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=defaultHeight/2) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x2-(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=defaultHeight/2)) return i;
			}
			else {
				if(Math.sqrt(Math.pow(Math.abs(nodes[i].x1-x), 2)+Math.pow(Math.abs(nodes[i].y1-y), 2))<=nodes[i].r) return i;
			}
		}
		return false;
	};
	
	//GET CLICKED LINE ID
	var getClickedLine = function(x, y) {
		if(lines.length===0) return false;
		for(i = lines.length-1; i>=0; i--) {
			if((Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].a)-x), 2)+Math.pow(Math.abs(getMiddleY(lines[i].a)-y), 2))+Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].b)-x), 2)+Math.pow(Math.abs(getMiddleY(lines[i].b)-y), 2)))<(Math.sqrt(Math.pow(Math.abs(getMiddleX(lines[i].a)-getMiddleX(lines[i].b)), 2)+Math.pow(Math.abs(getMiddleY(lines[i].a)-getMiddleY(lines[i].b)), 2))+0.08)) return i;
		}
		return false;
	};
	
	//MAIN - HANDLE ALL CLICK EVENTS - PLACE OBJECT - EDIT, DELETE, LINE, PAN...
	var clickOn = function(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(selected==="pan" || state==="paused" || (state==="running" && (clickResult===false || (nodes[clickResult].t!=="b" && nodes[clickResult].t!=="s")))) {
			panActivate();
		}
		else if(state==="edit" && selected!=="pan") {
			var clickResultLine = getClickedLine(x, y);
			if(!["line", "edit", "delete"].includes(selected)) {
				if(clickResult!==false) {//ACTIVATE DRAG OBJECT
					if(clickResult<nodes.length-1) {
						var obj = nodes[clickResult];
						nodes.splice(clickResult, 1);
						nodes.push(obj);
						reorganize(clickResult);
					}
					dragId=nodes.length-1;
					redrawAll();
					nodeMoveActivate();
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
							ctx.font = textSize+"px Arial";
							if(text!=undefined && text!=="" && text!==" ") nodes.push({s:"r", t:"w", n:text, x1:x-(ctx.measureText(text).width/2), y1:y-(textSize/2), x2:x+(ctx.measureText(text).width/2), y2:y+(textSize/2)});
							break;
					}
					dragId=nodes.length-1;
					nodeMoveActivate();
				}
			}
			else if(selected==="delete") {
				if(clickResult!==false) {//DELETE OBJECT
					deleteObj(clickResult);
				}
				else if(clickResultLine!==false) {//DELETE LINE
					lines.splice(clickResultLine, 1);
				}
			}//EDIT OBJECT PROPERTIES
			else if(selected==="edit" && clickResult!==false) {
				editObj(clickResult);
			}
			else if(selected==="line") {//LINE
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
					}
					lineStart=false;
					$("#canvas").off("mousemove.line");
				}
			}
		}//CLICK BUTTON / SWITCH while running
		else if(state==="running" && clickResult!==false && selected!=="pan") {
			if(nodes[clickResult].t==="b") nodes[clickResult].p=true;
			else if(nodes[clickResult].t==="s") nodes[clickResult].p=!nodes[clickResult].p;
		}
		redrawAll();
	};
	
	//Remove Endora text
	$("i").parent().parent().parent().remove();
});