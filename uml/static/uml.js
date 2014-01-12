UML = {
	elements: null,
	selected: null,
	nextIndex: null,
	paper: null,
	
	init: function(containerElement) {
		this.paper=Raphael(containerElement,1,1);
		this.elements = {};
		this.selected = [];
		this.nextIndex = 0;
		this._bindEvents();
		this.resize();
	},
	removeElement: function(element) {
		delete this.elements[element.id];
	},
	addElement: function(element) {
		this.elements[element.id]=element;
	},
	deselectAll: function() {
		this.selected=[];
		for (var index in this.elements) {
			if (this.elements.hasOwnProperty(index)) {
				this.elements[index].deselect();
			}
		}
	},
	_bindEvents: function() {
		var self=this;
		$(this.containerElement).on("click",function() {
			self.deselectAll();
		});
	},
	resize: function() {
		var width=1;
		var height=1;
		
		var paper=this.paper;
		
		paper.forEach(function(e) {
				var x2=e.getBBox().x2;
				var y2=e.getBBox().y2;
				if (x2>width) {
					width=x2;
				}
				if (y2>height) {
					height=y2;
				}
				paper.setSize(width+1,height+1);
		});
	},
	getNextIndex: function() {
		return this.nextIndex++;
	}
}

UML.Element = Class.extend({
	element: null,
	fields: {x:0,y:0},
	type: "Unknown",
	id: null,
	
	init: function () {
		this.moveTo(0,0);
		this.bindEvents();
		this.id=UML.getNextIndex();
		this.toFront();
	},
	moveTo: function (x,y) {
		this.fields.x=x;
		this.fields.y=y;
		UML.resize();
	},
	moveBy: function (dx,dy) {
		this.fields.x+=dx;
		this.fields.y+=dy;
		UML.resize();
	},
	select: function () {
		// TODO style
		UML.selected.push(this);
	},
	deselect: function () {
		// TODO style
	},
	bindEvents: function () {
		var el=this.element;
		var self=this;
		el.drag(function(x,y) {
			var dx=x-el.sx;
			var dy=y-el.sy;
			self.moveBy(dx,dy);
			el.sx=x;
			el.sy=y;
			self.toFront();
		},function (x,y) {
			el.sx=0;
			el.sy=0;
			self.toFront();
		});
		el.click(function() {
			UML.deselectAll();
			self.select();
		});
	},
	toFront: function() {
		// stub
	},
	toJSON: function () {
		return JSON.stringify({"type":this.type,"fields":this.fields});
	},
	destroy: function() {
		this.element.remove();
	}
});

UML._TextBox = Class.extend({
	element: null,
	textElement: null,
	padding: 5,
	height: 0,
	width: 0,
	yOffset: 0,
	
	init: function(text) {
		this.textElement=UML.paper.text(0,0,text);
		this.textElement.attr("text-anchor","start");
		this.element=UML.paper.rect(0,0,0,0);
		this.element.attr("stroke","#000");
		this.element.attr("stroke-opacity",1);
		this.element.attr("stroke-width",1);
		// it's vertically centered for some damn reason
		this.yOffset=this.textElement.getBBox().y*-1;
	},
	resize: function() {
		this.setWidth(this.textElement.getBBox().width+this.padding*2);
		this.setHeight(this.textElement.getBBox().height+this.padding*2);
	},
	setWidth: function(width) {
		this.width=width;
		this.element.attr("width",width);
	},
	setHeight: function(height) {
		this.height=height;
		this.element.attr("height",height);
	},
	moveBy: function(dx,dy) {
		this.element.attr("x",this.element.attr("x")+dx);
		this.element.attr("y",this.element.attr("y")+dy);
		this.textElement.attr("x",this.textElement.attr("x")+dx);
		this.textElement.attr("y",this.textElement.attr("y")+dy);
	},
	moveTo: function(x,y) {
		this.element.attr("x",x);
		this.element.attr("y",y);
		this.textElement.attr("x",x+this.padding);
		this.textElement.attr("y",y+this.padding+this.yOffset);
	},
	setText: function(text) {
		this.textElement.attr("text",text);
	},
	toFront: function(x,y) {
		this.element.toFront();
		this.textElement.toFront();
	},
	destroy: function() {
		this.element.remove();
		this.textElement.remove();
	}
});

UML.BoxElement = UML.Element.extend({
	boxes: [],
	dependants: [],
	
	init: function() {
		this.element=UML.paper.rect(0,0,110,60);
		this.element.attr("fill","#fff");
		this.element.attr("stroke","#000");
		this.element.attr("stroke-opacity",1);
		this.element.attr("stroke-width",1);
		this.resize();
		this._super();
	},
	moveTo: function(x,y) {
		this.element.attr("x",x);
		this.element.attr("y",y);
		this.resize();
		this._super(x,y);
	},
	moveBy: function(dx,dy) {
		this.element.attr("x",this.element.attr("x")+dx);
		this.element.attr("y",this.element.attr("y")+dy);
		for (var index in this.boxes) {
			if (this.boxes.hasOwnProperty(index)) {
				this.boxes[index].moveBy(dx,dy);
			}
		}
		this.resize();
		this._super(dx,dy);
	},
	resize: function() {
		var width=0;
		var height=0;
		var x=this.element.attr("x");
		var y=this.element.attr("y");
		// pass 1 - figure out the biggest width of all the boxes
		for (var index in this.boxes) {
			if (this.boxes.hasOwnProperty(index)) {
				var box=this.boxes[index];
				box.resize();
				box.moveTo(x,height+y);
				height+=box.height;
				if (box.width>width) {
					width=box.width;
				}
			}
		}
		// pass 2 - set all of the boxes to that width
		for (var index in this.boxes) {
			if (this.boxes.hasOwnProperty(index)) {
				this.boxes[index].setWidth(width);
			}
		}
		this.element.attr("width",width);
		this.element.attr("height",height);
		UML.resize();
	},
	toFront: function() {
		this.element.toFront();
		for (var index in this.boxes) {
			if (this.boxes.hasOwnProperty(index)) {
				this.boxes[index].toFront();
			}
		}
	},
	destroy: function() {
		for (var index in this.boxes) {
			this.boxes[index].destroy();
		}
		this._super();
	}
});
UML.ClassElement = UML.BoxElement.extend({
	nameBox: null,
	membersBox: null,
	methodsBox: null,
	
	init: function() {
		this.fields.name="Class name";
		this.fields.members="Some members";
		this.fields.methods="fuckMe()";
		
		this.nameBox=new UML._TextBox(this.fields.name);
		this.membersBox=new UML._TextBox(this.fields.members);
		this.methodsBox=new UML._TextBox(this.fields.methods);
		
		this.boxes.push(this.nameBox);
		this.boxes.push(this.membersBox);
		this.boxes.push(this.methodsBox);
		
		this._super();
	}	
});
UML.InterfaceElement
UML.NoteElement
UML.LineElement
UML.ArrowElement
UML.InheritanceElement
UML.ImplementsElement
UML.DiamondElement
UML.CompositeElement
UML.AggregateElement
