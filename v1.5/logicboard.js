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
	
	var drawPixel = function(x, y, color) {
		ctx.fillStyle=color;
		ctx.fillRect(x, y, 1, 1);
	};
	
	var drawText = function(x, y, text, color, size) {
		ctx.fillStyle=color;
		ctx.font = size+"px Arial";
		ctx.beginPath();
		ctx.fillText(text, x, y);
	};
	
	var clear = function() {
		ctx.clearRect(-canvasX, -canvasY, width, height);
	};
	
	var degToRad = function(deg) {
		return deg*(Math.PI/180);
	};
	
	var getColor = function(r, g, b) {
		return "rgba("+r+", "+g+", "+b+", 255)";
	};
	
	var capitalize = function(text) {
		return text[0].toUpperCase() + text.substring(1);
	}
	
	/*-----------------------------------------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	ctx.canvas.width = window.innerWidth-40;
	ctx.canvas.height = window.innerHeight-70;
	var width = canvas.width;
	var height = canvas.height;
	var zoom = 1;
	
	var fontSize = 16;
	var textSize = 28;
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	
	var panLastX = 0;
	var panLastY = 0;
	var canvasX = 0;
	var canvasY = 0;
	var dragLastX = 0;
	var	dragLastY = 0;
	var dragId = 0;
	var holdingClick = false;
	var lineStart = false;
	
	//LINE PARAMETERS: id, startID, endID
	
	//NODE PARAMETERS: shape, type, id, powered, startPowered, delay, countdown, x1, y1, (x2, y2)/(r), name
	
	//TOGGLE: startPowered, fired
	//NOT: startPowered
	//DELAY: delay, countdown
	//PULSER: delay, countdown
	//RANDOM: fired
	//MONOSTABLE: fired
	
	var nodes = [];
	var nNodes = {nText:0, nSwitch:0, nButton:0, nSource:0, nOr:0, nAnd:0, nNot:0, nDelay:0, nOutput:0, nLine:0};
	var lines = [];
	var nodeCount = 0;
	//var lineCount = 0;
	var tickSpeed = 10;
	var selected = "switch";
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
	
	/*-----------------------------------------------------------------------------------------------*/
	
	$("#SelectNode button").on("click", function() {
		if(["text", "switch", "button", "source", "or", "and", "not", "delay", "line", "output", "edit", "delete", "start", "pan", "toggle", "random", "pulser", "monostable"].includes($(this).attr("id"))) {
			selected = $(this).attr("id");
			if(selected==="start") startSimulation();
		}
		else alert("Button Error");
	});
	
	$("#StopControl button").on("click", function() {
		if($(this).attr("id")==="stop") {
			clearTimeout(TimeoutID);
			state="edit";
			$("#SelectNode").removeClass("hidden");
			$("#StopControl").addClass("hidden");
			$("#step").addClass("hidden");
			$("#pause").html("Pause");
			selected="switch";
			resetPower();
			redrawAll();
		}
		else if($(this).attr("id")==="pause" && state==="paused") {
			state="running";
			$(this).html("Pause");
			$("#step").addClass("hidden");
			TimeoutID = setTimeout(Tick, tickSpeed);
		}
		else if($(this).attr("id")==="pause") {
			state="paused";
			$(this).html("Continue");
			$("#step").removeClass("hidden");
			clearTimeout(TimeoutID);
		}
		else if($(this).attr("id")==="step" && state==="paused") {
			Tick();
			clearTimeout(TimeoutID);
		}
		else alert("Button Error");
	});
	
	$("#speed").on("click", function() {
		var newSpeed = prompt("Simulation speed (Ticks per second): (Hz)", "100");
		if(isNaN(parseFloat(newSpeed)) || parseFloat(newSpeed)<0.1 || parseFloat(newSpeed)>1000) alert("Invalid number!");
		else tickSpeed=1000/parseFloat(newSpeed);
	});
	
	$("#zoom").on("click", function() {
		zoom=zoom*2;
		ctx.scale(2,2);
		redrawAll();
	});
	
	$("#unzoom").on("click", function() {
		zoom=zoom/2;
		ctx.scale(0.5,0.5);
		redrawAll();
	});
	
	$("#canvas").on("mousedown", function(event) {
		if(event.which===1) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
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
	
	var nodeMoveActivate = function() {
		$("#canvas").on("mousemove.drag", function(event) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			canX-=canvasX;
			canY-=canvasY;
			var moveX = canX-dragLastX;
			var moveY = canY-dragLastY;
			dragLastX = canX;
			dragLastY = canY;
			nodes[dragId].x1+=moveX;
			nodes[dragId].y1+=moveY;
			if(nodes[dragId].shape!=="circle") {
				nodes[dragId].x2+=moveX;
				nodes[dragId].y2+=moveY;
			}
			redrawAll();
		});
	};
	
	$(document).on("mouseup", function(event) {
		$("#canvas").off("mousemove.drag");
		$("#canvas").off("mousemove.pan");
		holdingClick = false;
	});
	
	var lineStartActivate = function() {
		$("#canvas").on("mousemove.line", function(event) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			canX-=canvasX;
			canY-=canvasY;
			redrawAll();
			if(nodes[lineStart].shape==="circle") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, canX, canY, defaultOutline, defaultLine);
			else drawLine(getMiddleX(lineStart), getMiddleY(lineStart), canX, canY, defaultOutline, defaultLine);
		});
	};
	
	var panActivate = function() {
		$("#canvas").on("mousemove.pan", function(event) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			canvasX=canvasX+(canX-panLastX);
			canvasY=canvasY+(canY-panLastY);
			ctx.translate(canX-panLastX, canY-panLastY);
			panLastX = canX;
			panLastY = canY;
			redrawAll();
		});
	};
	
	var startSimulation = function() {
		$("#SelectNode").addClass("hidden");
		$("#StopControl").removeClass("hidden");
		state="running";
		TimeoutID = setTimeout(Tick, tickSpeed);
	};
	
	var Tick = function() {
		TimeoutID = setTimeout(Tick, tickSpeed);
		for(i=0; i<lines.length; i++) {
			lines[i].powered = nodes[getRealID(lines[i].startID)].powered;
		}
		for(i=0; i<nodes.length; i++) {
			switch(nodes[i].type) {
				case "button":
					if(!holdingClick) nodes[i].powered = false;
					break;
				case "and":
					nodes[i].powered = testAnd(i);
					break;
				case "or": case "output":
					nodes[i].powered = testOr(i);
					break;
				case "not":
					nodes[i].powered = testNot(i);
					break;
				case "delay":
					var isPowered = testOr(i);
					if(isPowered && nodes[i].powered) nodes[i].countdown=0;
					else if(isPowered || (nodes[i].countdown<nodes[i].delay && !nodes[i].powered)) {
						if(nodes[i].countdown<=0) nodes[i].powered = true;
						else nodes[i].countdown--;
					}
					else {
						if(nodes[i].countdown>=nodes[i].delay) nodes[i].powered = false;
						else nodes[i].countdown++;
					}
					break;
				case "monostable":
					var isPowered = testOr(i);
					if(nodes[i].powered) nodes[i].powered = false;
					if(isPowered && !nodes[i].fired) {
						nodes[i].fired = true;
						nodes[i].powered = true;
					}
					else if(!isPowered) nodes[i].fired = false;
					break;
				case "toggle":
					var isPowered = testOr(i);
					if(isPowered && !nodes[i].fired) {
						nodes[i].powered = !nodes[i].powered;
						nodes[i].fired = true;
					}
					else if(!isPowered) nodes[i].fired = false;
					break;
				case "pulser":
					if(nodes[i].powered) nodes[i].powered = false;
					if(nodes[i].countdown>0) nodes[i].countdown--;
					else {
						nodes[i].powered = true;
						nodes[i].countdown = nodes[i].delay;
					}
					break;
				case "random":
					var isPowered = testOr(i);
					if(nodes[i].powered) nodes[i].powered = false;
					if(isPowered && !nodes[i].fired) {
						nodes[i].powered = Math.random()>=0.5;
						nodes[i].fired = true;
					}
					else if(!isPowered) nodes[i].fired = false;
					break;
			}
		}
		redrawAll();
	};
	
	var testAnd = function(id) {
		var result = false;
		for(j=0; j<lines.length; j++) {
			if(lines[j].endID===nodes[id].id && lines[j].powered) result = true;
			if(lines[j].endID===nodes[id].id && !lines[j].powered) {
				result = false;
				break;
			}
		}
		return result;
	}
	
	var testOr = function(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].endID===nodes[id].id && lines[j].powered) return true;
		}
		return false;
	}
	
	var testNot = function(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].endID===nodes[id].id && lines[j].powered) return false;
		}
		return true;
	}
	
	var resetPower = function() {
		for(j=0; j<nodes.length; j++) {
			if(nodes[j].startPowered!=undefined) nodes[j].powered = nodes[j].startPowered;
			else if(nodes[j].type!=="source") nodes[j].powered = false;
			if(["delay", "pulser"].includes(nodes[j].type)) nodes[j].countdown = nodes[j].delay;
			if(nodes[j].fired!=undefined) nodes[j].fired = false;
		}
		for(j=0; j<lines.length; j++) {
			lines[j].powered = false;
		}
	};
	/*
	var modifyNodeCount = function(type, oper) {
		if(type!=="line") nodeCount++;
		switch(type) {
			case "text":
				nNodes.nText+=oper;
				break;
			case "switch":
				nNodes.nSwitch+=oper;
				break;
			case "button":
				nNodes.nButton+=oper;
				break;
			case "source":
				nNodes.nSource+=oper;
				break;
			case "pulser":
				nNodes.nPulser+=oper;
				break;
			case "random":
				nNodes.nRandom+=oper;
				break;
			case "or":
				nNodes.nOr+=oper;
				break;
			case "and":
				nNodes.nAnd+=oper;
				break;
			case "not":
				nNodes.nNot+=oper;
				break;
			case "delay":
				nNodes.nDelay+=oper;
				break;
			case "monostable":
				nNodes.nMonostable+=oper;
				break;
			case "toggle":
				nNodes.nToggle+=oper;
				break;
			case "output":
				nNodes.nOutput+=oper;
				break;
			case "line":
				nNodes.nLine+=oper;
				//lineCount++;
				break;
		}
	};
	*/
	var addNode = function(data) {
		data.id=nodeCount;
		nodes.push(data);
		nodeCount++;
		//modifyNodeCount(data.type, 1);
	};
	
	var addLine = function(startID, endID) {
		lines.push({powered:false, startID:startID, endID:endID});
		//modifyNodeCount("line", 1);
	};
	
	var powerColor = function(node) {
		if(nodes[node].powered) return defaultPower;
		else return defaultColor;
	};
	
	var powerColorLine = function(line) {
		if(lines[line].powered) return defaultPower;
		else return defaultOutline;
	};
	
	var getMiddleX = function(node) {
		if(nodes[node].shape==="circle") return nodes[node].x1;
		else return nodes[node].x1+((nodes[node].x2-nodes[node].x1)/2);
	};
	
	var getMiddleY = function(node) {
		if(nodes[node].shape==="circle") return nodes[node].y1;
		else return nodes[node].y1+((nodes[node].y2-nodes[node].y1)/2);
	};
	
	var getRealID = function(id) {
		if(id<nodes.length) {
			if(nodes[id].id===id) return id;
		}
		for(k=0; k<nodes.length; k++) {
			if(nodes[k].id===id) return k;
		}
		return false;
	};
	
	var findDuplicateLine = function(id) {
		for(j=0; j<lines.length; j++) {
			if(lines[j].startID===nodes[lineStart].id && lines[j].endID===nodes[id].id) return true;
		}
		return false;
	};
	
	var redrawAll = function() {
		clear();
		for(i=0; i<lines.length; i++) {
			drawLine(getMiddleX(getRealID(lines[i].startID)), getMiddleY(getRealID(lines[i].startID)), getMiddleX(getRealID(lines[i].endID)), getMiddleY(getRealID(lines[i].endID)), powerColorLine(i), defaultLine);
		}
		for(i=0; i<nodes.length; i++) {
			switch(nodes[i].type) {
				case "text":
					drawText(getMiddleX(i), getMiddleY(i), nodes[i].name, defaultText, textSize);
					break;
				case "switch": case "button":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					if(nodes[i].name!="") drawText(nodes[i].x1, nodes[i].y1, nodes[i].name, defaultName, fontSize);
					break;
				case "source":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, defaultPower, defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, "+", defaultText, textSize);
					break;
				case "or": case "and": case "toggle": case "monostable":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].type.toUpperCase(), defaultGate, fontSize);
					break;
				case "not": case "random":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, nodes[i].type.toUpperCase(), defaultGate, fontSize);
					break;
				case "delay":
					drawOval(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].delay, defaultGate, fontSize);
					break;
				case "output":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), noOutline, 0);
					if(nodes[i].name!="") drawText(getMiddleX(i),getMiddleY(i), nodes[i].name, defaultText, fontSize);
					break;
				case "pulser":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].delay, defaultGate, fontSize);
					break;
			}
		}
	};
	
	var getClickedNode = function(x, y) {
		if(nodes.length===0) return false;
		for(i = nodes.length-1; i>=0; i--) {
			if(nodes[i].shape==="rect") {
				if(x>=nodes[i].x1 && nodes[i].x2>=x && y>=nodes[i].y1 && nodes[i].y2>=y) return i;
			}
			else if(nodes[i].shape==="oval") {
				if((x>=nodes[i].x1+(defaultHeight/2) && nodes[i].x2-(defaultHeight/2)>=x && y>=nodes[i].y1 && nodes[i].y2>=y) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x1+(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=defaultHeight/2) || (Math.sqrt(Math.pow(Math.abs(nodes[i].x2-(defaultHeight/2)-x), 2)+Math.pow(Math.abs(getMiddleY(i)-y), 2))<=defaultHeight/2)) return i;
			}
			else {
				if(Math.sqrt(Math.pow(Math.abs(nodes[i].x1-x), 2)+Math.pow(Math.abs(nodes[i].y1-y), 2))<=nodes[i].r) return i;
			}
		}
		return false;
	};
	
	var getClickedLine = function(x, y) {
		if(lines.length===0) return false;
		for(i = lines.length-1; i>=0; i--) {
			if((Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-y), 2))+Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].endID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].endID))-y), 2)))<(Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-getMiddleX(getRealID(lines[i].endID))), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-getMiddleY(getRealID(lines[i].endID))), 2))+0.08)) return i;
		}
		return false;
	};
	
	var clickOn = function(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(state==="edit" && selected!=="pan") {
			var clickResultLine = getClickedLine(x, y);
			if(!["line", "start", "edit", "delete"].includes(selected)) {
				if(clickResult!==false) {
					var obj = nodes[clickResult];
					nodes.splice(clickResult, 1);
					nodes.push(obj);
					dragId=nodes.length-1;
					redrawAll();
					nodeMoveActivate();
				}
				else {
					switch(selected) {
						case "switch": case "button":
							addNode({shape:"circle", type:selected, name:capitalize(selected), r:defaultRadius, powered:false, x1:x, y1:y});
							break;
						case "or": case "and":
							addNode({shape:"rect", type:selected, powered:false, x1:x-(defaultWidth/2)+10, y1:y-(defaultHeight/2), x2:x+(defaultWidth/2)-10, y2:y+(defaultHeight/2)});
							break;
						case "delay":
							var delay=prompt("Set delay: (ticks)", lastDelay);
							if(isNaN(parseInt(delay)) || parseInt(delay)<1) alert("Invalid number!");
							else {
								addNode({shape:"oval", type:"delay", powered:false, delay:Math.round(parseFloat(delay)), countdown:Math.round(parseFloat(delay)), x1:x-(defaultWidth/2), y1:y-(defaultHeight/2), x2:x+(defaultWidth/2), y2:y+(defaultHeight/2)});
								lastDelay = Math.round(parseFloat(delay));
							}
							break;
						case "not":
							addNode({shape:"circle", type:"not", r:defaultRadius, powered:true, startPowered:true, x1:x, y1:y});
							break;
						case "output":
							addNode({shape:"rect", type:"output", powered:false, name:"", x1:(Math.round(x/defaultHeight)*defaultHeight)-(defaultHeight/2), y1:(Math.round(y/defaultHeight)*defaultHeight)-(defaultHeight/2), x2:(Math.round(x/defaultHeight)*defaultHeight)+(defaultHeight/2), y2:(Math.round(y/defaultHeight)*defaultHeight)+(defaultHeight/2)});
							break;
						case "source":
							addNode({shape:"circle", type:"source", r:defaultRadius, powered:true, x1:x, y1:y});
							break;
						case "pulser":
							var delay=prompt("Set delay: (ticks)", lastPulser);
							if(isNaN(parseInt(delay)) || parseInt(delay)<1) alert("Invalid number!");
							else {
								addNode({shape:"circle", type:"pulser", r:defaultRadius, powered:false, x1:x, y1:y, delay:Math.round(parseFloat(delay)), countdown:Math.round(parseFloat(delay))});
								lastPulser = Math.round(parseFloat(delay));
							}
							break;
						case "random":
							addNode({shape:"circle", type:"random", r:defaultRadius+10, powered:false, x1:x, y1:y, fired:false});
							break;
						case "toggle":
							addNode({shape:"rect", type:"toggle", powered:false, startPowered:false, fired:false, x1:x-(defaultWidth/2), y1:y-(defaultWidth/2), x2:x+(defaultWidth/2), y2:y+(defaultWidth/2)});
							break;
						case "monostable":
							addNode({shape:"rect", type:"monostable", powered:false, fired:false, x1:x-(defaultWidth/2)-16, y1:y-(defaultHeight/2), x2:x+(defaultWidth/2)+16, y2:y+(defaultHeight/2)});
							break;
						case "text":
							var text = prompt("Enter text:");
							ctx.font = textSize+"px Arial";
							if(text!=undefined && text!=="" && text!==" ") addNode({shape:"rect", type:"text", name:text, x1:x-(ctx.measureText(text).width/2), y1:y-(textSize/2), x2:x+(ctx.measureText(text).width/2), y2:y+(textSize/2)});
							break;
					}
				}
			}
			else if(selected==="delete") {
				if(clickResult!==false) {
					//modifyNodeCount(nodes[clickResult].type, -1);
					for(j = lines.length-1; j>=0; j--) {
						if(lines[j].startID===nodes[clickResult].id || lines[j].endID===nodes[clickResult].id) lines.splice(j, 1);
					}
					nodes.splice(clickResult, 1);
				}
				else if(clickResultLine!==false) {
					//modifyNodeCount("line", -1);
					lines.splice(clickResultLine, 1);
				}
			}
			else if(selected==="edit" && clickResult!==false) {
				if(["delay", "button", "switch", "text", "output", "not", "pulser", "toggle"].includes(nodes[clickResult].type)) {
					switch(nodes[clickResult].type) {
						case "delay": case "pulser":
							var delay=prompt("Set delay: (ticks)", nodes[clickResult].delay);
							if(isNaN(parseInt(delay)) || parseInt(delay)<1) alert("Invalid number!");
							else {
								nodes[clickResult].delay=Math.round(parseFloat(delay));
								nodes[clickResult].countdown=Math.round(parseFloat(delay));
							}
							break;
						case "text":
							var name = prompt("Enter text:");
							if(text!=undefined && text!=="" && text!==" ") nodes[clickResult].name = name;
							break;
						case "not": case "toggle":
							nodes[clickResult].powered = !nodes[clickResult].powered;
							nodes[clickResult].startPowered = !nodes[clickResult].startPowered;
							break;
						default:
							var name = prompt("Enter name:", nodes[clickResult].name);
							if(name!=undefined) nodes[clickResult].name = name;
					}
				}
			}
			else if(selected==="line") {
				if(lineStart===false && clickResult!==false) {
					if(["switch", "button", "not", "source", "delay", "or", "and", "pulser", "random", "toggle", "monostable"].includes(nodes[clickResult].type)) {
						lineStart = clickResult;
						lineStartActivate();
					}
				}
				else if(lineStart!==false) {
					if(!(clickResult===false || clickResult===lineStart) && ["or", "and", "not", "delay", "output", "random", "toggle", "monostable"].includes(nodes[clickResult].type) && !findDuplicateLine(clickResult)) {
						addLine(nodes[lineStart].id, nodes[clickResult].id);
					}
					lineStart=false;
					$("#canvas").off("mousemove.line");
				}
			}
		}
		else if(state==="running" && clickResult!==false && selected!=="pan") {
			if(nodes[clickResult].type==="button") nodes[clickResult].powered=true;
			else if(nodes[clickResult].type==="switch") nodes[clickResult].powered=!nodes[clickResult].powered;
		}
		else if(selected==="pan" || state!=="edit") {
			panActivate();
		}
		redrawAll();
	};
	//Remove endora text
	$("i").parent().parent().parent().remove();
});