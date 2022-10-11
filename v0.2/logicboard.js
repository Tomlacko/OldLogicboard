$(document).ready(function() {
	
	var drawCircle = function(x, y, r, color, outline, line) {
		ctx.beginPath();
		ctx.fillStyle = color;
		ctx.strokeStyle = outline;
		ctx.lineWidth = line;
		ctx.arc(x, y, r, 0, 2 * Math.PI, false);
		ctx.stroke();
		ctx.fill();
	};
	
	var drawLine = function(startX, startY, endX, endY, color, line) {
		ctx.beginPath();
		ctx.lineWidth = line;
		ctx.strokeStyle = color;
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.stroke();
	};
	
	var drawRect = function(startX, startY, endX, endY, color, outline, line) {
		ctx.beginPath();
		ctx.fillStyle=color;
		ctx.strokeStyle=outline;
		ctx.lineWidth=line;
		ctx.rect(startX, startY, endX-startX, endY-startY);
		ctx.stroke();
		ctx.fill();
	};
	
	var drawPixel = function(x, y, color) {
		ctx.fillStyle=color;
		ctx.fillRect(x, y, 1, 1);
	};
	
	var drawText = function(x, y, text, color) {
		ctx.beginPath();
		ctx.fillStyle=color;
		ctx.fillText(text, x, y);
	};
	
	var clear = function() {
		ctx.clearRect(0, 0, width, height);
	};
	
	var degToRad = function(deg) {
		return deg*(Math.PI/180);
	};
	
	var getColor = function(r, g, b) {
		return "rgba("+r+", "+g+", "+b+", 255)";
	};
	
	/*-----------------------------------------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	ctx.canvas.width = window.innerWidth-40;
	ctx.canvas.height = window.innerHeight-70;
	var width = canvas.width;
	var height = canvas.height;
	//ctx.translate(midX, midY);
	//ctx.rotate(20*Math.PI/180); //20 degrees rotate
	ctx.font = "16px Arial";
	ctx.textAlign="center";
	ctx.textBaseline="middle";
	
	var dragLastX, dragLastY = 0;
	var dragId = 0;
	
	var nodes = [];
	var nNodes = {nText:0, nToggle:0, nButton:0, nSource:0, nOr:0, nNot:0, nDelay:0, nOutput:0, nLine:0};
	var lines = [];
	var selected = "toggle";

	var defaultLine = 4;
	var defaultColor = "rgba(240, 240, 240, 255)";
	var defaultOutline = "rgba(0, 0, 0, 255)";
	var defaultPower = "rgba(255, 0, 0, 255)";
	var defaultText = "rgba(0, 0, 0, 255)";
	var defaultName = "rgba(0, 0, 255, 255)";
	var defaultGate = "rgba(128, 128, 128, 255)";
	var defaultRadius = 24;
	var defaultWidth = 80;
	var defaultHeight = 50;
	
	/*-----------------------------------------------------------------------------------------------*/
	
	$("#SelectNode button").on("click", function() {
		if(["text", "toggle", "button", "source", "or", "not", "delay", "line", "output", "edit", "delete", "start"].includes($(this).attr("id"))) {
			selected = $(this).attr("id");
			if(selected==="start") startSimulation();
		}
		else alert("Button Error");
	});
	
	$("#canvas").on("mousedown", function(event) {
		if(event.which===1) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			dragLastX = canX;
			dragLastY = canY;
			clickOn(canX, canY);
		}
	});
	
	var nodeMoveActivate = function() {
		$("#canvas").on("mousemove.drag", function(event) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			var moveX = canX-dragLastX;
			var moveY = canY-dragLastY;
			dragLastX = canX;
			dragLastY = canY;

			nodes[dragId].x1+=moveX;
			nodes[dragId].y1+=moveY;
			if(nodes[dragId].type==="or" || nodes[dragId].type==="delay" || nodes[dragId].type==="output") {
				nodes[dragId].x2+=moveX;
				nodes[dragId].y2+=moveY;
			}
			redrawAll();
		});
	};
	
	$(document).on("mouseup", function(event) {
		$("#canvas").off("mousemove.drag");
	});
	
	var startSimulation = function() {
		//
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
	
	var addNode = function(type, powered, delay, x1, y1, x2, y2, name) {
		if(name==undefined) name="";
		nodes.push({type:type, id:nodes.length, powered:powered, delay:delay, x1:x1, y1:y1, x2:x2, y2:y2, name:name});
		modifyNodeCount(type, 1);
		return nodes.length-1;
	};
	
	var addNodeCircle = function(type, powered, delay, x1, y1, r, name) {
		if(name==undefined) name="";
		nodes.push({type:type, id:nodes.length, powered:powered, delay:delay, x1:x1, y1:y1, r, name:name});
		modifyNodeCount(type, 1);
		return nodes.length-1;
	};
	
	var addLine = function(powered, startID, endID) {
		lines.push({id:lines.length, powered:powered, startID:startID, endID:endID});
		modifyNodeCount("line", 1);
		return lines.length-1;
	};
	
	var powerColor = function(node) {
		if(nodes[node].powered) return defaultPower;
		else return defaultColor;
	};
	
	var powerColorLine = function(line) {
		if(lines[line].powered) return defaultPower;
		else return defaultColor;
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
		for(i=0; i<nodes.length; i++) {
			if(nodes[i].id===id) return i;
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
			if(nodes[i].type==="or" || nodes[i].type==="delay" || nodes[i].type==="output") {
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
			if((Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-y), 2))+Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].endID))-x), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].endID))-y), 2)))<(Math.sqrt(Math.pow(Math.abs(getMiddleX(getRealID(lines[i].startID))-getMiddleX(getRealID(lines[i].endID))), 2)+Math.pow(Math.abs(getMiddleY(getRealID(lines[i].startID))-getMiddleY(getRealID(lines[i].endID))), 2))+4)) return i;
		}
		return false;
	};
	
	var clickOn = function(x, y) {
		var clickResult = getClickedNode(x, y);
		var clickResultLine = false;
		if(selected!=="start") var clickResultLine = getClickedLine(x, y);
		
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
						var name=prompt("Input name:");
						if(name!=undefined) addNodeCircle(selected, false, 0, x, y, defaultRadius, name);
						break;
					case "or":
						addNode(selected, false, 0, x-(defaultWidth/2), y-(defaultHeight/2), x+(defaultWidth/2), y+(defaultHeight/2), "");
						break;
					case "delay":
						var delay=prompt("Set delay: (100=1sec)");
						if(isNaN(parseInt(delay)) || parseInt(delay)<0) alert("You have to enter a number!");
						else addNode(selected, false, parseInt(delay), x-(defaultWidth/2), y-(defaultHeight/2), x+(defaultWidth/2), y+(defaultHeight/2), "");
						break;
					case "not":
						addNodeCircle(selected, true, 0, x, y, defaultRadius, "");
						break;
					case "output":
						var name=prompt("Output name:");
						if(name!=undefined) addNode(selected, false, 0, x-(defaultHeight/2), y-(defaultHeight/2), x+(defaultHeight/2), y+(defaultHeight/2), name);
						break;
					case "source":
						addNodeCircle(selected, true, 0, x, y, defaultRadius, "");
						break;
					case "text":
						var text = prompt("Enter text:");
						if(text!=undefined) addNode("text", false, 0, x, y, ctx.measureText(text).width, 16, text);
						break;
				}
			}
		}
		else if(selected==="delete") {
			if(clickResult!==false) {
				modifyNodeCount(nodes[clickResult].type, -1);
				nodes.splice(clickResult, 1);
			}
			else if(clickResultLine!==false) {
				modifyNodeCount("line", -1);
				lines.splice(clickResultLine, 1);
			}
		}
		else if(selected==="edit") {
			if(nodes[clickResult].type==="delay" || nodes[clickResult].type==="button" || nodes[clickResult].type==="toggle" || nodes[clickResult].type==="text" || nodes[clickResult].type==="output") {
				switch(nodes[clickResult].type) {
					case "delay":
						var delay=prompt("Set delay: (100=1sec)");
						if(isNaN(parseInt(delay)) || parseInt(delay)<0) alert("You have to enter a number!");
						else nodes[clickResult].delay=parseInt(delay);
						break;
					case "text":
						var name = prompt("Enter text:");
						if(name!=undefined) nodes[clickResult].name = name;
						break;
					default:
						var name = prompt("Enter name:");
						if(name!=undefined) nodes[clickResult].name = name;
				}
			}
		}
		else if(selected==="line") {
			
		}
		else alert("Click action Error");
		redrawAll();
	};
	
	//Remove endora text
	$("i").parent().parent().parent().remove();
});