"use strict";
//////////////////////////////////////////////////
//UTILS & POLYFILS///////////////////////////////

Number.prototype.isValid = function() {
	return !isNaN(this.valueOf()) && isFinite(this.valueOf());
}

//////////////////////////////////////////////////
//DRAWABLE OBJECTS///////////////////////////////

class Shape {
}

class Line extends Shape {
}

class Rectangle extends Shape {
	constructor(offX, offY, width, height, drawable, interactable) {
		this.type = "rectangle";
		this.offsetX = offX;
		this.offsetY = offY;
		this.width = width;
		this.height = height;
		this.interactable = interactable;
		this.drawable = drawable;
	}
	
	Draft(x, y, ctx) {
		ctx.rect(x-this.width, y-this.height, this.width*2, this.height*2);
	}
}

class Circle extends Shape {
}

class Arc extends Shape {
}

class Label extends Shape {
}




//////////////////////////////////////////////////
//LOGIC NODES & COMPONENTS///////////////////////

class LogicNodePin {
	constructor(limit) {
		if(limit>0) this.limit = limit;
		else this.limit = 0;
		this.connections = [];
	}
}

class Anode extends LogicNodePin {
}

class Cathode extends LogicNodePin {
}

//////////////////////////////////////////////////

class LogicNode {
	constructor(x, y, logicboard) {
		this.logicboard = logicboard;
		this.x = x;
		this.y = y;
		this.anodes = [];
		this.cathodes = [];
	}
}


class AndGate extends LogicNode {
	constructor(x, y, logicboard) {
		super(x, y, logicboard);
		this.anodes[0] = new Anode(0);
		this.cathodes[0] = new Cathode(0);
	}
	
	Draw(x, y) {
		let ctx = this.logicboard
		this.parts[0].Draft();
	}
}
AndGate.prototype.fullName = "AND Gate";
AndGate.prototype.displayedName = "AND";
AndGate.prototype.renameable = false;
AndGate.prototype.editable = false;
AndGate.prototype.parts = [new Rectangle(0, 0, 30, 20, true, true)];







//////////////////////////////////////////////////
//DEFAULT SETTINGS & DECLARATIONS////////////////

class Renderer {
	constructor(canvas) {
		this.canvas = canvas;
		this.ctx = this.canvas.getContext("2d");
	}
}

class RenderingScope {
	constructor(canvas, name, x1, y1, x2, y2) {
		super(canvas);
		this.name = name;
		this.startX = x1;
		this.startY = y1;
		this.endX = x2;
		this.endY = y2;
		this.zoom = 1;
		this.offX = 0;
		this.offY = 0;
	}
	
	Draw(object) {
		this.ctx.setTransform(this.zoom, 0, 0, this.zoom, this.offX, this.offY);
		//clip--
		//object.Draw itself
	}
}


class LOGICBOARD {
	constructor(canvas) {
		this.canvas = canvas;
		this.renderer = new Renderer(this.canvas);
		this.APPEARANCE = Object.assign({}, this.SKINS.Normal);
		this.NODES = [];
		this.ScheduledUpdates = [];
	}
	
	ChangeSkin(skin_name) {
		if(skin_name==="Normal") this.APPEARANCE = Object.assign({}, this.SKINS.Normal);
		else this.APPEARANCE = Object.assign({}, this.SKINS.Normal, this.SKINS[skin_name]);
	}
}
LOGICBOARD.prototype.DEFAULTS = {
	nodeOutlineWidth:4,
	connectionLineWidth:4,
	gridSize:42,
	gridSubdivisions:2
};
LOGICBOARD.prototype.SKINS = {
	Normal:{
		nodeFillColor:"rgba(200, 200, 200, 1)",
		nodeFillColor_powered:"rgba(255, 0, 0, 1)",
		nodeOutlineColor:"rgba(0, 0, 0, 1)",
		nodeOutlineColor_powered:"rgba(0, 0, 0, 1)"
	},
	Dark:{
		nodeFillColor:"rgba(70, 70, 70, 1)",
		nodeFillColor_powered:"rgba(255, 0, 0, 1)"
	}
};

var lgb = new LOGICBOARD;
var a = new AndGate();
a.Draw(0,0);


/*//check if strict mode
(function(){eval("var __a = null");return typeof __a==="undefined";})();
*/

//let   https://stackoverflow.com/questions/762011/whats-the-difference-between-using-let-and-var-to-declare-a-variable-in-jav
