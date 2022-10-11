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
	
	var drawPixel = function(x, y, color) {
		ctx.fillStyle=color;
		ctx.fillRect(x, y, 1, 1);
	};
	
	var drawText = function(x, y, text, color) {
		ctx.fillStyle=color;
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
	
	ctx.font = "16px Arial";
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
	
	var nodes = [];
	var nNodes = {nText:0, nToggle:0, nButton:0, nSource:0, nOr:0, nAnd:0, nNot:0, nDelay:0, nOutput:0, nLine:0};
	var lines = [];
	var nodeCount = 0;
	var lineCount = 0;
	var tickSpeed = 10;
	var selected = "toggle";
	var state = "edit";
	var TimeoutID = 0;

	var defaultLine = 4;
	var defaultColor = "rgba(200, 200, 200, 255)";
	var defaultOutline = "rgba(0, 0, 0, 255)";
	var defaultOutlineGradient = "rgba(150, 150, 150, 255)";
	var defaultPower = "rgba(255, 0, 0, 255)";
	var defaultPowerGradient = "rgba(255, 150, 150, 255)";
	var defaultText = "rgba(0, 0, 0, 255)";
	var defaultName = "rgba(0, 0, 255, 255)";
	var defaultGate = "rgba(128, 128, 128, 255)";
	var defaultRadius = 24;
	var defaultWidth = 80;
	var defaultHeight = 40;
	
	/*-----------------------------------------------------------------------------------------------*/
	
	$("#SelectNode button").on("click", function() {
		if(["text", "toggle", "button", "source", "or", "and", "not", "delay", "line", "output", "edit", "delete", "start", "pan"].includes($(this).attr("id"))) {
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
			selected="toggle";
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
		if(isNaN(parseInt(newSpeed)) || parseInt(newSpeed)<=0.1 || parseInt(newSpeed)>1000) alert("Invalid number!");
		else tickSpeed=(1/newSpeed)*1000;
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
			if(nodes[dragId].type==="or" || nodes[dragId].type==="and" || nodes[dragId].type==="delay" || nodes[dragId].type==="output") {
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
			if(nodes[lineStart].type!=="delay" && nodes[lineStart].type!=="or" && nodes[lineStart].type!=="and") drawLine(nodes[lineStart].x1, nodes[lineStart].y1, canX, canY, defaultOutline, defaultLine);
			else drawLine(nodes[lineStart].x1+((nodes[lineStart].x2-nodes[lineStart].x1)/2), nodes[lineStart].y1+((nodes[lineStart].y2-nodes[lineStart].y1)/2), canX, canY, defaultOutline, defaultLine);
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
					if(testOr(i) || (nodes[i].countdown<nodes[i].delay && !nodes[i].powered)) {
						if(nodes[i].countdown<=0) nodes[i].powered = true;
						else nodes[i].countdown--;
					}
					else {
						if(nodes[i].countdown>=nodes[i].delay) nodes[i].powered = false;
						else nodes[i].countdown++;
					}
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
			if(nodes[j].type!=="source" && nodes[j].type!=="text" && nodes[j].type!=="not") nodes[j].powered = false;
			else if(nodes[j].type==="not") nodes[j].powered = nodes[j].startPowered;
			if(nodes[j].type==="delay") nodes[j].countdown = nodes[j].delay;
		}
		for(j=0; j<lines.length; j++) {
			lines[j].powered = false;
		}
	};
	
	var modifyNodeCount = function(type, oper) {
		switch(type) {
			case "text":
				nNodes.nText=nNodes.nText+oper;
				break;
			case "toggle":
				nNodes.nToggle=nNodes.nToggle+oper;
				break;
			case "button":
				nNodes.nButton=nNodes.nButton+oper;
				break;
			case "source":
				nNodes.nSource=nNodes.nSource+oper;
				break;
			case "or":
				nNodes.nOr=nNodes.nOr+oper;
				break;
			case "and":
				nNodes.nAnd=nNodes.nAnd+oper;
				break;
			case "not":
				nNodes.nNot=nNodes.nNot+oper;
				break;
			case "delay":
				nNodes.nDelay=nNodes.nDelay+oper;
				break;
			case "output":
				nNodes.nOutput=nNodes.nOutput+oper;
				break;
			case "line":
				nNodes.nLine=nNodes.nLine+oper;
				break;
		}
	};
	
	var addNode = function(type, powered, x1, y1, x2, y2, name, delay) {
		if(name==undefined) name="";
		nodes.push({type:type, id:nodeCount, powered:powered, x1:x1, y1:y1, x2:x2, y2:y2, name:name});
		if(type==="delay") {
			nodes[nodes.length-1].delay=delay;
			nodes[nodes.length-1].countdown=delay;
		}
		modifyNodeCount(type, 1);
		nodeCount++;
		return nodes.length-1;
	};
	
	var addNodeCircle = function(type, powered, x1, y1, r, name) {
		if(name==undefined) name="";
		nodes.push({type:type, id:nodeCount, powered:powered, x1:x1, y1:y1, r, name:name});
		if(type=="not") nodes[nodes.length-1].startPowered=powered;
		modifyNodeCount(type, 1);
		nodeCount++;
		return nodes.length-1;
	};
	
	var addLine = function(powered, startID, endID) {
		lines.push({id:lineCount, powered:powered, startID:startID, endID:endID});
		modifyNodeCount("line", 1);
		lineCount++;
		return lines.length-1;
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
		if(nodes[node].type==="toggle" || nodes[node].type==="button" || nodes[node].type==="source" || nodes[node].type==="not") return nodes[node].x1;
		else return nodes[node].x1+((nodes[node].x2-nodes[node].x1)/2);
	};
	
	var getMiddleY = function(node) {
		if(nodes[node].type==="toggle" || nodes[node].type==="button" || nodes[node].type==="source" || nodes[node].type==="not") return nodes[node].y1;
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
					drawText(nodes[i].x1, nodes[i].y1, nodes[i].name, defaultText);
					break;
				case "toggle":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					if(nodes[i].name!="") drawText(nodes[i].x1, nodes[i].y1, nodes[i].name, defaultName);
					break;
				case "button":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					if(nodes[i].name!="") drawText(nodes[i].x1, nodes[i].y1, nodes[i].name, defaultName);
					break;
				case "source":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, defaultPower, defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, "+", defaultText);
					break;
				case "or":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), "OR", defaultGate);
					break;
				case "and":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), "AND", defaultGate);
					break;
				case "not":
					drawCircle(nodes[i].x1, nodes[i].y1, nodes[i].r, powerColor(i), defaultOutline, defaultLine);
					drawText(nodes[i].x1, nodes[i].y1, "NOT", defaultGate);
					break;
				case "delay":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), defaultOutline, defaultLine);
					drawText(getMiddleX(i),getMiddleY(i), nodes[i].delay, defaultGate);
					break;
				case "output":
					drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2, nodes[i].y2, powerColor(i), powerColor(i), 2);
					if(nodes[i].name!="") drawText(getMiddleX(i),getMiddleY(i), nodes[i].name, defaultText);
					break;
			}
		}
	};
	
	var getClickedNode = function(x, y) {
		if(nodes.length===0) return false;
		for(i = nodes.length-1; i>=0; i--) {
			if(nodes[i].type==="or" || nodes[i].type==="and" || nodes[i].type==="delay" || nodes[i].type==="output") {
				if(x>=nodes[i].x1 && nodes[i].x2>=x && y>=nodes[i].y1 && nodes[i].y2>=y) return i;
			}
			else if(nodes[i].type==="text") {
				if(x>=nodes[i].x1-(nodes[i].x2/2) && nodes[i].x1+(nodes[i].x2/2)>=x && y>=nodes[i].y1-(nodes[i].y2/2) && nodes[i].y1+(nodes[i].y2/2)>=y) return i;
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
			if((Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-y), 2))+Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].endID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].endID))-y), 2)))<(Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-getMiddleX(getRealID(lines[i].endID))), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-getMiddleY(getRealID(lines[i].endID))), 2))+0.05)) return i;
		}
		return false;
	};
	
	var clickOn = function(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(state==="edit" && selected!=="pan") {
			var clickResultLine = getClickedLine(x, y);
			if(selected!=="line" && selected!=="start" && selected!=="edit" && selected!=="delete") {
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
						case "toggle": case "button":
							addNodeCircle(selected, false, x, y, defaultRadius, capitalize(selected));
							break;
						case "or": case "and":
							addNode(selected, false, x-(defaultWidth/2), y-(defaultHeight/2), x+(defaultWidth/2), y+(defaultHeight/2), "", -1);
							break;
						case "delay":
							var delay=prompt("Set delay: (ticks)", "5");
							if(isNaN(parseInt(delay)) || parseInt(delay)<0) alert("You have to enter a number!");
							else addNode(selected, false, x-(defaultWidth/2), y-(defaultHeight/2), x+(defaultWidth/2), y+(defaultHeight/2), "", parseInt(delay));
							break;
						case "not":
							addNodeCircle(selected, true, x, y, defaultRadius, "");
							break;
						case "output":
							addNode(selected, false, x-(defaultHeight/2), y-(defaultHeight/2), x+(defaultHeight/2), y+(defaultHeight/2), "", -1);
							break;
						case "source":
							addNodeCircle(selected, true, x, y, defaultRadius, "");
							break;
						case "text":
							var text = prompt("Enter text:");
							if(text!=undefined && text!=="" && text!==" ") addNode("text", false, x, y, ctx.measureText(text).width, 16, text, -1);
							break;
					}
				}
			}
			else if(selected==="delete") {
				if(clickResult!==false) {
					modifyNodeCount(nodes[clickResult].type, -1);
					for(j = lines.length-1; j>=0; j--) {
						if(lines[j].startID===nodes[clickResult].id || lines[j].endID===nodes[clickResult].id) lines.splice(j, 1);
					}
					nodes.splice(clickResult, 1);
				}
				else if(clickResultLine!==false) {
					modifyNodeCount("line", -1);
					lines.splice(clickResultLine, 1);
				}
			}
			else if(selected==="edit" && clickResult!==false) {
				if(nodes[clickResult].type==="delay" || nodes[clickResult].type==="button" || nodes[clickResult].type==="toggle" || nodes[clickResult].type==="text" || nodes[clickResult].type==="output" || nodes[clickResult].type==="not") {
					switch(nodes[clickResult].type) {
						case "delay":
							var delay=prompt("Set delay: (ticks)", nodes[clickResult].delay);
							if(isNaN(parseInt(delay)) || parseInt(delay)<0) alert("You have to enter a number!");
							else nodes[clickResult].delay=parseInt(delay);
							break;
						case "text":
							var name = prompt("Enter text:");
							if(name!=undefined) nodes[clickResult].name = name;
							break;
						case "not":
							nodes[clickResult].powered = !nodes[clickResult].powered;
							nodes[clickResult].startPowered = !nodes[clickResult].startPowered;
							break;
						default:
							var name = prompt("Enter name:");
							if(name!=undefined) nodes[clickResult].name = name;
					}
				}
			}
			else if(selected==="line") {
				if(lineStart===false && clickResult!==false) {
					if(nodes[clickResult].type==="toggle" || nodes[clickResult].type==="button" || nodes[clickResult].type==="not" || nodes[clickResult].type==="source" || nodes[clickResult].type==="delay" || nodes[clickResult].type==="or" || nodes[clickResult].type==="and") {
						lineStart = clickResult;
						lineStartActivate();
					}
				}
				else if(lineStart!==false) {
					if(clickResult===false || clickResult===lineStart) {}
					else if(nodes[clickResult].type!=="toggle" && nodes[clickResult].type!=="button" && nodes[clickResult].type!=="source" && nodes[clickResult].type!=="text" && !findDuplicateLine(clickResult)) {
						addLine(false, nodes[lineStart].id, nodes[clickResult].id);
					}
					lineStart=false;
					$("#canvas").off("mousemove.line");
				}
			}
		}
		else if(state==="running" && clickResult!==false && selected!=="pan") {
			if(nodes[clickResult].type==="button") nodes[clickResult].powered=true;
			else if(nodes[clickResult].type==="toggle" && nodes[clickResult].powered===false) nodes[clickResult].powered=true;
			else if(nodes[clickResult].type==="toggle") nodes[clickResult].powered=false;
		}
		else if(selected==="pan" || state!=="edit") {
			panActivate();
		}
		redrawAll();
	};
	//Remove endora text
	$("i").parent().parent().parent().remove();
});