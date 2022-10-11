$(document).ready(function() {
	
	var drawCircle = function(x, y, size, color) {
		ctx.beginPath();
		ctx.arc(x, y, size, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
	};
	
	var drawLine = function(startX, startY, endX, endY, width, color) {
		ctx.beginPath();
		ctx.moveTo(startX, startY);
		ctx.lineTo(endX, endY);
		ctx.lineWidth = width;
		ctx.strokeStyle = color;
		ctx.stroke();
	};
	
	var drawRect = function(startX, startY, sizeX, sizeY, color, outline, r) {
		ctx.beginPath();
		ctx.fillStyle=color;
		ctx.strokeStyle=outline;
		ctx.lineWidth=r;
		ctx.rect(startX, startY, sizeX, sizeY);
		ctx.stroke();
		ctx.fill();
	};
	
	var drawPixel = function(x, y, color) {
		ctx.fillStyle=color;
		ctx.fillRect(x, y, 1, 1);
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
	
	$("#canvas").on("mousedown", function(event) {
		if(event.which===1) {
			event.preventDefault();
			var rect = canvas.getBoundingClientRect();
			var canX = event.clientX - rect.left;
			var canY = event.clientY - rect.top;
			dragLastX = canX;
			dragLastY = canY;
			console.log("click: "+canX, canY);
			clickOn(canX, canY);
		}
	});
	
	var nodeMoveActivate = function() {
		$("#canvas").on("mousemove", function(event) {
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
			nodes[dragId].x2+=moveX;
			nodes[dragId].y2+=moveY;
			redrawAll();
		});
	};
	
	$(document).on("mouseup", function(event) {
		$("#canvas").off("mousemove");
	});
	
	/*-----------------------------------------------------------------------------------------------*/
	
	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;
	var midX = width/2;
	var midY = height/2;
	//ctx.translate(midX, midY);
	//ctx.rotate(20*Math.PI/180); //20 degrees rotate
	
	var dragLastX, dragLastY = 0;
	var dragId = 0;
	
	var nodes = [];
	var nInputs = 0;
	
	var rSizeX = 100;
	var rSizeY = 50;
	var rOutline = 5;
	var rColor = [0, 255, 0, 0, 128, 0];
	
	/*-----------------------------------------------------------------------------------------------*/
	
	var addNode = function(type, name, x1, y1, x2, y2, color, outline, r) {
		nodes.push({type:type, name:name, x1:x1, y1:y1, x2:x2, y2:y2, color:color, outline:outline, r:r});
		nInputs++;
		return nodes.length-1;
	};
	
	var redrawAll = function() {
		clear();
		for(i=0; i<nodes.length; i++) {
			drawRect(nodes[i].x1, nodes[i].y1, nodes[i].x2-nodes[i].x1, nodes[i].y2-nodes[i].y1, nodes[i].color, nodes[i].outline, nodes[i].r);
		}
	};
	
	var getClickedNode = function(x, y) {
		if(nodes.length===0) return false;
		for(i = nodes.length-1; i>=0; i--) {
			if(x>=nodes[i].x1 && nodes[i].x2>=x && y>=nodes[i].y1 && nodes[i].y2>=y) return i;
		}
		return false;
	};
	
	var clickOn = function(x, y) {
		var clickResult = getClickedNode(x, y);
		if(clickResult!==false) {
			var obj = nodes[clickResult];
			nodes.splice(clickResult, 1);
			nodes.push(obj);
			dragId=nodes.length-1;
			redrawAll();
			nodeMoveActivate();
		}
		else {
			addNode("input", "input"+nInputs, x-(rSizeX/2), y-(rSizeY/2), x+(rSizeX/2), y+(rSizeY/2), getColor(rColor[0],rColor[1],rColor[2]), getColor(rColor[3],rColor[4],rColor[5]), rOutline)
			redrawAll();
		}
	};
});