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
	
	//POLYFILF IF BROWSER DOES NOT SUPPORT .includes
	if(!Array.prototype.includes) {
		Array.prototype.includes = function(searchElement) {
			if(this == null) throw new TypeError('Array.prototype.includes called on null or undefined');
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
		if(redrawAll!=undefined) redrawAll();
	});
	
	/*-----------------------------SETUP-------------------------------------------------------------*/
	
	var fileVersion = 4;
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var zoom = 1;
	var zoomSpeed = 2;
	var maxZoom = 16;
	var minZoom = 0.03125;
	$(window).trigger("resize");
	
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
	var holdingClick = false;
	var lineStart = false;
	var lineLast = false;
	
	var nodes = [];
	var lines = [];
	var tickSpeed = 10;
	var mouseDelay = 10;
	var selected = "s";
	var state = "edit";
	var TimeoutID = 0;
	var ticks = 0;
	var unsaved = false;
	
	var fontSize = 16;
	var textSize = 28;
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
	var lastPulser = 5;
	
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
		if(e.which===1 && !$(e.target).is("input")) e.preventDefault();
	});
	
	//TAGS:   r,x1,x2,y1,y2, s=shape, n=name, t=type, p=powered, a=startID, b=endID, d=delay, c=countdown, f=fired, sp=startPowered
	//SHAPES:   c=circle, r=rect=rectangle, o=oval
	//TYPES:   s=switch, b=button, p=pulser, q=source, o=or, a=and, n=not, d=delay, t=toggle, m=monostable, r=random, l=output(lamp), w=text
	
	/*----------------------EVENTS-/-HTML------------------------------------------------------------*/
	
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
	
	//show load project
	$("#load").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_load").removeClass("hidden");
		$("#pasteImport").focus();
	});
	
	//show download project
	$("#download").on("click", function() {
		if(state!=="edit") stopSimulation();
		$("#overlay, #popup_download").removeClass("hidden");
		$("#downloadName").focus();
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
			$("#overlay, #popup_download").addClass("hidden");
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
			updateDebug();
			$("#debug").removeClass("hidden");
		}
	});
	
	//TOOLBAR - Select item
	$(".node, #delete, #edit, #replace, #select").on("click", function() {
		if(state==="edit") {
			if(lineStart!==false) {
				lineStart=false;
				$("#canvas").off("mousemove.line");
				redrawAll();
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
			panLastX=globalX/zoom;
			panLastY=globalY/zoom;
			$("#unzoom").removeClass("disabled");
			if(!(zoom<maxZoom)) $("#zoom").addClass("disabled");
		}
	};
	
	//UNZOOM- FUNCTION
	var unzoomF = function() {
		if(zoom>minZoom) {
			ctx.translate(-canvasX, -canvasY);
			canvasX+=midX/zoom;
			canvasY+=midY/zoom;
			if(zoom/zoomSpeed <= 1) {
				canvasX=Math.round(canvasX);
				canvasY=Math.round(canvasY);
			}
			ctx.scale(1/zoomSpeed,1/zoomSpeed);
			ctx.translate(canvasX, canvasY);
			zoom=zoom/zoomSpeed;
			panLastX=globalX/zoom;
			panLastY=globalY/zoom;
			$("#zoom").removeClass("disabled");
			if(!(zoom>minZoom)) $("#unzoom").addClass("disabled");
		}
	};
	
	var centeredZoom = function(scrollAmount) {
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
		redrawAll();
	};
	
	//move UP canvas button
	$("#move_up").on("click", function() {
		canvasY+=64/zoom;
		ctx.translate(0, 64/zoom);
		redrawAll();
	});
	
	//move DOWN canvas button
	$("#move_down").on("click", function() {
		canvasY-=64/zoom;
		ctx.translate(0, -64/zoom);
		redrawAll();
	});
	
	//move LEFT canvas button
	$("#move_left").on("click", function() {
		canvasX+=64/zoom;
		ctx.translate(64/zoom, 0);
		redrawAll();
	});
	
	//move RIGHT canvas button
	$("#move_right").on("click", function() {
		canvasX-=64/zoom;
		ctx.translate(-64/zoom, 0);
		redrawAll();
	});
	
	//LOAD PROJECT
	var loadFile = function(loadProject) {
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
		$("#speedSetting").html("Ticks per second: "+(1000/tickSpeed));
		dragId=0;
		lineStart=false;
		lineLast=false;
		unsaved=false;
		redrawAll();
		return true;
	};
	
	//TRACK global MOUSE coordinates - mousemove
	$("#canvas").on("mousemove.global", function(event) {
		var rect = canvas.getBoundingClientRect();
		globalX = event.clientX - rect.left;
		globalY = event.clientY - rect.top;
		realX = (globalX/zoom)-canvasX;
		realY = (globalY/zoom)-canvasY;
		updateDebug();
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
			unsaved=true;
			redrawAll();
		}//KEY F - quick new line
		else if(keyID===70 && state==="edit" && !holdingClick && lineLast!==false && selected==="line" && lineStart===false) {
			lineStart = lineLast;
			lineStartActivate();
			redrawAll();
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
			if($("#canvas:hover").length!=0) centeredZoom(-1);
			else {
				unzoomF();
				redrawAll();
			}
		}//KEY + ZOOM
		else if(keyID===107) {
			if($("#canvas:hover").length!=0) centeredZoom(1);
			else {
				zoomF();
				redrawAll();
			}
		}//KEY E - Edit
		else if(keyID===69/*LOL*/ && state==="edit" && !holdingClick) {
			if(obj!==false) {
				if(editObj(obj, false)) {
					unsaved=true;
					redrawAll();
				}
			}
			else {
				var clickedLine = getClickedLine(canX, canY);
				if(clickedLine!==false) {
					if(editObj(false, clickedLine)) {
						unsaved=true;
						redrawAll();
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
			redrawAll();
		}//KEY Esc - Cancel
		else if(keyID===27) {
			if(lineStart!==false) {
				lineStart=false;
				$("#canvas").off("mousemove.line");
				redrawAll();
			}
			else if(state!=="edit" && !holdingClick) stopSimulation();
		}
	});
	
	//MOUSE ZOOM ScrollWheel
	$("#canvas").on("mousewheel DOMMouseScroll", function(e){
		var scrollAmount = (/Firefox/i.test(navigator.userAgent))? (e.originalEvent.detail*-1) : (e.originalEvent.wheelDelta/120);
		if((scrollAmount > 0 && zoom >= maxZoom) || (!(scrollAmount > 0) && zoom <= minZoom)) return;
		e.preventDefault();
		centeredZoom(scrollAmount);
	});
	
	//////MAIN CLICK EVENT - click on canvas
	//confirm click - mouse up click
	var mainClickEnd = function() {
		$("#canvas").on("mouseup.main", function(e) {
			if(e.which===1) {
				$("#canvas").off("mousemove.start");
				$("#canvas").off("mouseup.main");
				setTimeout(clickResetDelay, mouseDelay);
				clickOn(realX, realY);
			}
		});
	};//detect moving mouse - cancel main click
	var mainMoveStart = function() {
		$("#canvas").on("mousemove.start", function() {
			if(Math.abs(startClickX-globalX)>5 || Math.abs(startClickY-globalY)>5) {
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
	};//stop holding mouse - alternative mouse up
	var mainAltEnd = function() {
		$(document).on("mouseup.end", function(e) {
			if(e.which===1) {
				$(document).off("mouseup.end");
				setTimeout(clickResetDelay, mouseDelay);
			}
		});
	};//start holding mouse - determine next action
	var mainClickStart = function() {
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
	};
	mainClickStart();
	var clickResetDelay = function() {
		mainClickStart();
	};
	
	//MOUSE Drag Object - mousemove
	var nodeMoveActivate = function() {
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
			redrawAll();
		});
	};
	
	//MOUSE disable hold - mouseup
	$(document).on("mouseup", function(e) {
		if(e.which===1) {
			$("#canvas").off("mousemove.drag");
			$("#canvas").off("mousemove.pan");
			holdingClick = false;
		}
	});
	
	//MOUSE start line - mousemove
	var lineStartActivate = function() {
		$("#canvas").on("mousemove.line", function(event) {
			redrawAll();
		});
	};
	
	//MOUSE pan / translate canvas - mousemove
	var panActivate = function() {
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
			redrawAll();
		});
	};
	
	/*-----------------------------CANVAS-LOGIC------------------------------------------------------*/
	
	//STOP Simulation
	var stopSimulation = function() {
		clearTimeout(TimeoutID);
		ticks=0;
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
		if(lineStart!==false) {
			lineStart=false;
			$("#canvas").off("mousemove.line");
		}
		state="running";
		TimeoutID = setTimeout(Tick, tickSpeed);
		redrawAll();
	};
	
	//MAIN Tick loop
	var Tick = function() {
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
			default: return false;
		}
	};
	
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
	var editObj = function(id, lineID) {
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
	};
	
	//DRAG object
	var dragObj = function(id) {
		if(id<nodes.length-1) {
			var obj = nodes[id];
			nodes.splice(id, 1);
			nodes.push(obj);
			reorganize(id);
		}
		dragId=nodes.length-1;
		redrawAll();
		nodeMoveActivate();
		unsaved=true;
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
					if(zoom<1) drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), powerColor(i), Math.log(1/zoom) / Math.log(2));
					else drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), noOutline, 0);
					if(nodes[i].n!="") drawText(getMiddleX(i),getMiddleY(i), nodes[i].n, defaultText, fontSize);
					break;
				case "p"://PULSER
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].d, defaultGate, fontSize);
					break;
			}
		}
		if(lineStart!==false) {
			if(nodes[lineStart].s==="c") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, realX, realY, defaultOutline, defaultLine);
			else drawLine(getMiddleX(lineStart), getMiddleY(lineStart), realX, realY, defaultOutline, defaultLine);
		}
		updateDebug();
	};
	
	var updateDebug = function() {
		$("#debug").html("mouseX="+globalX+", mouseY="+globalY+"<br/>gridX="+realX+", gridY="+realY+"<br/>moveX="+canvasX+", moveY="+canvasY+"<br/>nodes: "+nodes.length+", lines: "+lines.length+", zoom: "+zoom);
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
	
	//MAIN - CANVAS CLICK EVENTS - PLACE OBJECT, EDIT, DELETE, LINE, PAN...
	var clickOn = function(x, y) {
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
		redrawAll();
	};
	
	//Confirm Leaving the page with unsaved changes
	window.onbeforeunload = function(){
		if(unsaved) return "There are unsaved changes.\nAre you sure you want to leave?";
	}
	
	//Remove Endora text
	$("i").parent().parent().parent().remove();
});