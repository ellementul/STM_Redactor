(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const Lib = require("./drawLib.js");
var durability_types_list = require("../types_durability.json");


var durability_types_cont = Lib.getNode("DurabilityTypes");
var images_cont = Lib.getNode("Images");
var tile_size_cont = Lib.getNode("TileSize");

module.exports = function CrAddForm(){
	return {
			Images: new CrImages(images_cont),
			Type: new CrList(durability_types_cont, durability_types_list),
			Size: tile_size_cont,
			clear: function(){
				this.Images.clear();
			},

			getTile: newTile
	};
}

require("./mof.js");

function CrImages(container){
	var images = [];

	this.add = function(file){
		var reader = new FileReader();
		
		reader.onload = function(e){
			Add(e.target.result);
		};
		reader.readAsText(file);
	};

	this.addGetSet("value",
		function(){
			if(images.length > 0) return images;
		}
	);

	this.clear = function(){
		Array.from(container.children).forEach(elem => elem.remove());
		images = [];
	}

	function Add(img){
		images.push(img);
		container.appendChild(Lib.drawTile(img));
	}
}

function CrList(container, list){

	for (var val in list){
		var opt = document.createElement("p");
		opt.value = list[val];
		opt.innerHTML = val;
		opt.onclick = onclick;
		container.appendChild(opt);
	}
	var defOpt = container.children[0];
	container.value = defOpt.value;
	defOpt.classList.add("option-change");

	return container;

	function onclick(){
		Array.from(this.parentElement.children).forEach(elem => elem.classList.remove("option-change"));
		this.parentElement.value = this.value;
		console.log(this.value);
		this.classList.add("option-change");
	}
}

function newTile(send){
	if(this.Images.value 
		&& this.Type.value
		&& this.Size.value){
		return {
			images: this.Images.value,
			type: this.Type.value,
			size: parseInt(this.Size.value)
		};
	}

}

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}
},{"../types_durability.json":19,"./drawLib.js":9,"./mof.js":10}],2:[function(require,module,exports){
const Base64 = require('js-base64').Base64;

const CrViewLogic = require("./ViewLogic.js");

const Hear = require("./Events.js");

const CrAddForm = require("./AddForm.js");
const CrTool = require("./Tools.js");
const CrTiles = require("./Tiles.js");
const CrMap = require("./Map.js");






module.exports = function CrDisplay(Inter){
	var Send = Inter.connect(receive);

	var Tiles = new CrTiles();

	var AddForm = new CrAddForm();

	var TileMap = new CrMap();

	var Tool = new CrTool();


	var ViewLogic = new CrViewLogic(AddForm, Tool);

	Hear("AddForm", "submit", function(){
		var tile = AddForm.getTile();
		if(tile){
			Send({
				action: "Add",
				type: "Tile",
				tile: tile
			});
			ViewLogic.switchAddForm();
			AddForm.clear();
		}
	});

	

	function initMap(){

		Hear("Grid", "mousedown", function(e){
				this.is_down = true;
				if(e.target.parentElement.getAttribute("id") == "Grid")
					drawMap(e.target.x, e.target.y);
		});

		Hear("Grid", "mouseup", function(e){
			this.is_down = false;
		});

		Hear("Grid", "mouseover", function(e){
			if(this.is_down && e.target.parentElement.getAttribute("id") == "Grid"){
				drawMap(e.target.x, e.target.y);
			}
		});
	}

	function drawMap(x, y){
		if(typeof Tool.tile == "number")
			Send({
				action: "Draw",
				type: "Map",
				tool: Tool.type,
				coords: {x: x, y: y, z: 1},
				tile_id: Tool.tile
			});
		else if(Tool.type == "Clear")
			Send({
				action: "Draw",
				type: "Map",
				tool: Tool.type,
				coords: {x: x, y: y, z: 1}
			});
	}


	//Receive------------------------------------------------------
	function receive(mess){
		switch(mess.type){
			case "Tile": receiveTiles(mess); break;
			case "Map": receiveMap(mess); break;
		}
	}

	function receiveTiles(mess){
		switch(mess.action){
			case "Add":  Tiles.add(mess.tile); break;
		}
	}

	function receiveMap(mess){
		switch(mess.action){
			case "Create":  
				TileMap.load(mess.sizes); initMap(); 
				break;
			case "Draw":
				TileMap.draw(mess);
				break;
		}
	}
}
},{"./AddForm.js":1,"./Events.js":3,"./Map.js":4,"./Tiles.js":6,"./Tools.js":7,"./ViewLogic.js":8,"js-base64":16}],3:[function(require,module,exports){
function IdsEvents(ids, name_events, func){
	if(Array.isArray(ids)){
		ids.forEach(id => IdEvents(id, name_events, func));
	}else IdEvents(ids, name_events, func);
}

function IdEvents(id, name_events, func){
	if(Array.isArray(name_events)){
		name_events.forEach(name => IdEvent(id, name, func));
	}else IdEvent(id, name_events, func);
}

function IdEvent(id, name_event, func){
	
	if(name_event == "submit"){
		var old_func = func;
		func = function(e){
			e.preventDefault();
			old_func.apply(this, arguments);
		} 
	}
	
	getNode(id).addEventListener(name_event, func);
}

function Submit(func){
	return function(event){
		event.preventDefault();
		func.apply(this, arguments);
	}
}

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}

module.exports = IdsEvents;

},{}],4:[function(require,module,exports){
const Lib = require("./drawLib.js");

var map_size = 20;
var map_cont = Lib.getNode("Map");
var Tiles = Lib.getNode("Tiles");

module.exports = function CrMap(){

	map_cont.load = function(sizes){
		var Grid = CrGrid(sizes, "grid-border");
		Grid.setAttribute("id", "Grid");

		while(sizes.layers--)
			map_cont.appendChild(CrLayer(sizes));

		map_cont.appendChild(Grid);
	}

	map_cont.draw = function(mess){
		var coords = mess.coords;
		if(coords.length == 0) return;

		if(mess.tool == "Pen"){
			var tile = Tiles.getTile(mess.tile_id);

			this.children[coords[0].z].pen(tile, coords);			
		}
		if(mess.tool == "Clear") this.children[coords[0].z].clear(mess.coords);
	}

	return map_cont;
	
}

function CrLayer(sizes){
	var layer = document.createElement("div");
	layer.classList.add("layer");
	layer.style.width = "100%";
	layer.style.height = "100%";

	var w_size = 100 / sizes.width;
	var h_size = 100 / sizes.height;

	layer.show = function(){
		layer.style.opacity = 0;
	}

	layer.hide = function(){
		layer.style.opacity = 1;
	}

	layer.clear = function(coords){
		coords = coords[0];

		if(!layer[coords.y] || !layer[coords.y][coords.x]) throw new Error();
		layer[coords.y][coords.x].remove();
	}

	layer.pen = function(tile, coords){
		coords = coords[0];

		var box = Lib.drawTile(tile.images[0]);
		box.tile = tile.id;
		box.classList.add("box");

		box.style.width = tile.size*w_size + "%";
		box.style.height = tile.size*h_size + "%";

		box.style.left = coords.x*w_size + "%";
		box.style.top = coords.y*h_size + "%";

		layer.appendChild(box);

		if(!layer[coords.y]) layer[coords.y] = [];
		layer[coords.y][coords.x] = box;
	}

	return layer;
}

function CrGrid(sizes, border){
	var layer = document.createElement("div");
	layer.classList.add("layer");
	layer.style.width = "100%";
	layer.style.height = "100%";
	drawGrid(layer, sizes, border);

	layer.show = function(){
		layer.style.opacity = 0;
	}

	layer.hide = function(){
		layer.style.opacity = 1;
	}

	return layer;
}


function drawGrid(container, grid_size, border){
	var w_size = 100 / grid_size.width;
	var h_size = 100 / grid_size.height;
	for(var i = grid_size.width - 1; i >= 0; i--){
		for(var j = grid_size.height - 1; j >= 0; j--){
			var box = darwBox(w_size, h_size, border);

			box.style.left = i*w_size + "%";
			box.style.top = j*h_size + "%";

			box.x = i;
			box.y = j;
			
			container.appendChild(box);
		}
	}
}

function darwBox(width, height, border){
	var box = document.createElement('div');
	box.classList.add("box");
	if(border) 
		box.classList.add(border);

	box.style.width = width + "%";
	box.style.height = height + "%";

	return box;
}
},{"./drawLib.js":9}],5:[function(require,module,exports){
function CrSwitch(name_class, ids){
	if(Array.isArray(ids)){
		var elems = ids.map(getNode);
		elems = elems.map(elem => elem.classList);

		return arrSwicth.bind(null, elems, name_class);
	}
	else if(typeof ids == "object"){
		return objSwitch(ids, name_class);
	}
	else{
		var elem = getNode(ids).classList;
		return oneSwitch.bind(null, name_class, elem);
	}
	
}

function objSwitch(id_obj, class_name){
	for (var key in id_obj){
		id_obj[key] = getNode(id_obj[key]).classList;
	}

	return function(id){
		for (var i in id_obj){
			id_obj[i].add(class_name);
		}
		
		id_obj[id].remove(class_name);
	}
}

function arrSwicth(elem_arr, name_class){
	elem_arr.forEach(oneSwitch.bind(null, name_class));
}

function oneSwitch(name_class, elem){
		elem.toggle(name_class);
}

module.exports = CrSwitch;

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}
},{}],6:[function(require,module,exports){
const Lib = require("./drawLib.js");

var tiles_cont = Lib.getNode("Tiles");

module.exports = function CrTiles(container){
	var tiles = [];

	tiles_cont.add = function(new_tile){
		var tile = Lib.drawTile(new_tile.images[0]);
		tile.tile = new_tile;
		tiles_cont.appendChild(tile);

		tiles[new_tile.id] = new_tile;
	}

	tiles_cont.getTile = function(id){
		return tiles[id];
	}

	return tiles_cont;
}
},{"./drawLib.js":9}],7:[function(require,module,exports){
require("./mof.js");
const Lib = require("./drawLib.js");


var tools_cont = Lib.getNode("Tools");

module.exports = function CrTools(){
	var pallet = {};
	var type = "Pen";

	this.addGetSet("tile", 
		function(){
			if(pallet[type]) return pallet[type].id;
		},
		function(val){
			if(type == "Clear")
				type = "Pen";

			pallet[type] = val;
			changeTileView(val.images[0]);
		}
	);

	this.addGetSet("type", 
		function(){
			return type;
		},
		function(val){
			type = val;

			if(pallet[type]) 
				changeTileView(pallet[type].images[0]);
			else
				changeTileView(null);
		}
	);

	var tileView = null;

	function changeTileView(image){
		if(tileView){
			tileView.remove();
			tileView = null;
		}

		if(image){
			tileView = Lib.drawTile(image);
			tools_cont.appendChild(tileView);
		}
	}
}
},{"./drawLib.js":9,"./mof.js":10}],8:[function(require,module,exports){
const Hear = require("./Events.js");
const CrSwitchElem = require("./Switch.js");

module.exports = function(Form, Tool){

	this.switchAddForm = CrSwitchElem("invis", "AddForm");

	Hear("add_switch", "click", this.switchAddForm);

	Hear("AddImageInput", "change", function(){
		if(this.files[0])
			Form.Images.add(this.files[0]);
	});

	Hear("Tiles", "click", function(e){
		if(e.target.tile){
			Tool.tile = e.target.tile;
		}
	});

	Hear("Tools", "click", function(e){
		if(e.target.getAttribute("tool")){
			Tool.type = e.target.getAttribute("tool");
		}
	});

	Hear(["Tools", "Tiles", "Open", "Save"], "click", Press);

	Hear("Map", "dragstart", function(e){
		e.preventDefault();
	});

	

};

function Press(e){
		e.target.classList.add("press");
		setTimeout(()=>e.target.classList.remove("press"), 300);
}
},{"./Events.js":3,"./Switch.js":5}],9:[function(require,module,exports){
exports.drawTile = function(svg_img){
	
	var img = document.createElement('img');
	img.src = "data:image/svg+xml;base64,"+ Base64.encode(svg_img);

	img.classList.add("tile");
	
	return img;
}

exports.getNode = function(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}
},{}],10:[function(require,module,exports){
"use strict";

//Craft object.protype
(function(){
	if( typeof(Object.crProp) == "function"){
		return;
	}
	
	
	function constProp(name_prop, value, vis, rewrite){
		
		if(value === undefined) value = true;
		if(vis === undefined) vis = true;

		if(typeof value === "object") Object.freeze(value);
		Object.defineProperty(this, name_prop, {
				value: value,
				enumerable: vis,
				configurable: rewrite,
				writable: rewrite,
			});
	}
	function getSet(name, getter, setter){
		if(typeof setter == "function"){
			Object.defineProperty(this, name, {
				get: getter,
				set: setter,
				enumerable: true,
				configurable: true
			});
		}else{
			Object.defineProperty(this, name, {
				get: getter,
				enumerable: true,
				configurable: true
			});
		}
	}
	
	constProp.call(Object.prototype, 'crProp', constProp, false);
	Object.prototype.crProp('addGetSet', getSet, false);
	
	
	function randIndex(){
		var rand = Math.round((this.length - 1) * Math.random());
		return this[rand];
	}
	
	function AddItem(val){
		if(!this._nulls) this._nulls = [];
		
		if(this._nulls.length){
			var ind = this._nulls.pop();
			this[ind] = val;
			return ind;
		}else{
			return this.push(val) - 1;
		}
	}
	
	function DellItem(ind){
		if(ind > this.length -1) return false;
		
		if(ind == this.length -1){
			this.pop();
		}else{
			if(!this._nulls) this._nulls = [];
			
			this[ind] = undefined;
			this._nulls.push(ind);
		}
		
		return true;	
	}
	
	function createArr(val, length, is_call){
		var arr = [];
		
		if(!length) length = 1;
		if(is_call === undefined) is_call = true;
		
		if(typeof val == 'function' && is_call){
			for(var i = 0; i < length; i++){
				arr.push(val(i, arr));
			}
		}else if(val !== undefined){
			
			for(var i = 0; i < length; i++){
				arr.push(val);
			}
		}

		arr.crProp('rand_i', randIndex);
		arr.crProp('add', AddItem);
		arr.crProp('dell', DellItem);
		
		return arr;
	}
	
	
	
	Array.crProp('create', createArr);
	
	
	if(RegExp.prototype.toJSON !== "function"){
		RegExp.prototype.toJSON = function(){ return this.source; };
	}

})();





},{}],11:[function(require,module,exports){
require("./mof.js");

var map_size = {width: 20, height: 20, layers: 2};

function CrTiles(){
	var tiles = Array.create();

	this.add = function(new_tile){
		new_tile.id = tiles.add(new_tile);
		return new_tile;
	}

	this.getTile = function(id){
		return tiles[id];
	}
}

var Tiles = new CrTiles();

function CrMap(sizes){
	var cr_line = Array.create.bind(null, null, sizes.width);
	var cr_pline = Array.create.bind(null, cr_line, sizes.width, true);
	var map = Array.create(cr_pline, sizes.layers);

	this.load = function(){
		return {
			action: "Create",
			type: "Map",
			sizes: sizes
		}
	}

	this.draw = function(mess){
		var new_mess = {
			action: "Draw",
			type: "Map",
			tool: mess.tool,
			coords: mess.coords
		};

		switch(mess.tool){
			case "Pen":  
				new_mess.coords = Pen(mess.tile_id, mess.coords);
				new_mess.tile_id = mess.tile_id;
				break;
			case "Clear": 
				new_mess.coords = Clear(mess.coords);
				break;
		}

		return new_mess;
	}

	function Pen(tile_id, coords){
		var tile = Tiles.getTile(tile_id);
		if(is_coords(coords, tile.size) && is_empty(coords, tile.size)){

			fillBox(tile, coords, tile.size);
			return [coords];
		}else return [];
	}

	function Clear(coords){
		if(is_coords(coords) && !is_empty(coords)){
			coords = clearBox(map[coords.z][coords.y][coords.x]);
			return [coords];
		}else return [];
	}

	function fillBox(tile, coords, size){
		var box = {coords: coords, size: tile.size, tile_id: tile.id};
		var size = tile.size;

		for(var i = size - 1; i >= 0; i--){
			for(var j = size - 1; j >= 0; j--){
				map[coords.z][coords.y + j][coords.x + i] = box;
			}
		}

		return coords;
	}

	function clearBox(box){
		var coords = box.coords;
		var size = box.size;

		for(var i = size - 1; i >= 0; i--){
			for(var j = size - 1; j >= 0; j--){
				map[coords.z][coords.y + j][coords.x + i] = null;
			}
		}
		return coords;
	}

	function is_coords(coords, size=1){
		return coords 
		&& map[coords.z] 
		&& map[coords.z][coords.y] 
		&& map[coords.z][coords.y + size - 1]
		&& map[coords.z][coords.y][coords.x] !== undefined
		&& map[coords.z][coords.y + size - 1][coords.x + size - 1] !== undefined;
	}

	function is_empty(coords, size=1){
		for(var i = size - 1; i >= 0; i--){
			for(var j = size - 1; j >= 0; j--){
				if(map[coords.z][coords.y + j][coords.x + i] !== null)
					return false;
			}
		}
		return true;
	}
}

var TileMap = new CrMap(map_size);

module.exports = function CrLogic(Inter){
	var send = Inter.connect(receive);
	send(TileMap.load());

	function receive(mess){
		switch(mess.type){
			case "Tile": receiveTiles(mess); break;
			case "Map": receiveMap(mess); break;
		}
	}

	function receiveTiles(mess){
		switch(mess.action){
			case "Add":  
				mess.tile = Tiles.add(mess.tile);
				send(mess);
				break;
		}
	}

	function receiveMap(mess){
		switch(mess.action){
			 case "Draw":
			 	mess = TileMap.draw(mess);
			 	send(mess);
			 	break;
		}
	}
}

},{"./mof.js":15}],12:[function(require,module,exports){
require("typesjs");
require("typesjs/str_type");

var types_durability = require("./types_durability.json");

var T = Object.types;

var tile_id_type = T.pos(256);
var coords_type = {x: T.pos(20), y: T.pos(20), z: T.pos(2)};

var tile_type = T.obj({
		id: T.any(undefined, tile_id_type),
		images: T.arr(T.str(/^[\w\d\s+:;.,?=#\/<>"()-]*$/, 1024*1024)),
		type: T.any(Object.values(types_durability)),
		size: T.pos(20)
});

var new_tile_mess_type = T.obj({
	action: "Add",
	type: "Tile",
	tile: tile_type
});

var map_size_type = T.obj({
	width: 20, 
	height: 20, 
	layers: 2
});

var new_map_mess_type = T.obj({
	action: "Create",
	type: "Map",
	sizes: map_size_type
});

var draw_mess_type = {
	action: "Draw",
	type: "Map",
	tool: "Pen",
	coords: coords_type,
	tile_id: tile_id_type
};

var clear_mess_type = {
	action: "Draw",
	type: "Map",
	tool: "Clear",
	coords: coords_type
};

var clear_mess_type_for_display = {
	action: "Draw",
	type: "Map",
	tool: "Clear",
	coords: T.arr(coords_type, 20, false)
};

var draw_mess_type_for_display = {
	action: "Draw",
	type: "Map",
	tool: "Pen",
	coords: T.arr(coords_type, 20, false),
	tile_id: tile_id_type
};

var mess_types_one = T.any([
	draw_mess_type, 
	new_tile_mess_type, 
	clear_mess_type]);

var mess_types_two = T.any([
	draw_mess_type_for_display,
	new_tile_mess_type, 
	new_map_mess_type,
	clear_mess_type_for_display]);

module.exports = [
	function(val){
		if(mess_types_one.test(val))
			throw mess_types_one.test(val);
	}, 
	function(val){
		if(mess_types_two.test(val))
			throw mess_types_two.test(val);
	}];

},{"./types_durability.json":19,"typesjs":18,"typesjs/str_type":17}],13:[function(require,module,exports){


const CrInter = require("./inter.js");
var Types = require("./Types.js");

const Display = require("./Draw/Display.js");
const CrLogic = require("./Logic.js");

const DisplayInter = new CrInter();
DisplayInter.test(Types, console.log);

Display(DisplayInter);

CrLogic(DisplayInter);





},{"./Draw/Display.js":2,"./Logic.js":11,"./Types.js":12,"./inter.js":14}],14:[function(require,module,exports){
module.exports = function CrInterfice(testes, log){
	var is_test = false;
	
	this.test = function(new_testes, new_log){
		if(new_testes){
			if(typeof(new_testes[0]) == "function" 
			&& typeof(new_testes[1]) == "function"){
				
				testes = new_testes;
				is_test = true;
				
			}else{
				console.error(new Error("Test is not function!"));
				is_test = false;
			}
		}
		if(new_log){
			if(typeof new_log == "function") log = new_log; else log = null;
		}
	}
	
	if(testes) this.test(testes, log);
	
	var InputOne = null;
	var OutputOne = null;
	
	this.connect = function(outputFunc){
		if(OutputOne){
			if(is_test){
				var begFunc = outputFunc;
				outputFunc = function(val){
					testes[0](val);
					if(log) log(" One: ", val);
					begFunc(val);
				}
			}
			return TwoConnect(outputFunc);
		}
		else{
			if(is_test){
				var begFunc = outputFunc;
				outputFunc = function(val){
					testes[1](val);
					if(log) log(" Two: ", val);
					begFunc(val);
				}
			}
			return OneConnect(outputFunc);
		}
	};
	
	function OneConnect(outputFunc){
		OutputOne = outputFunc;
		InputOne = CrHoarder();
		
		return function(val){
			InputOne(val);
		}
	}
	
	function TwoConnect(outputFunc){
		if(InputOne.take) InputOne.take(outputFunc);
		InputOne = outputFunc;
		
		return OutputOne;
	}
}

function CrHoarder(){
	var hoarder = [];
	
	var push = function(val){
		hoarder.push(val);
	};
	
	push.take = function(func){
		if(typeof func != "function") return hoarder;
		
		hoarder.forEach(function(val){
				func(val);
		});
	}
	
	return push;
}
},{}],15:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"dup":10}],16:[function(require,module,exports){
(function (global){
/*
 *  base64.js
 *
 *  Licensed under the BSD 3-Clause License.
 *    http://opensource.org/licenses/BSD-3-Clause
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */
;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory(global)
        : typeof define === 'function' && define.amd
        ? define(factory) : factory(global)
}((
    typeof self !== 'undefined' ? self
        : typeof window !== 'undefined' ? window
        : typeof global !== 'undefined' ? global
: this
), function(global) {
    'use strict';
    // existing version for noConflict()
    global = global || {};
    var _Base64 = global.Base64;
    var version = "2.5.1";
    // if node.js and NOT React Native, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        try {
            buffer = eval("require('buffer').Buffer");
        } catch (err) {
            buffer = undefined;
        }
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function (u) {
            return (u.constructor === buffer.constructor ? u : buffer.from(u))
                .toString('base64')
        }
        :  function (u) {
            return (u.constructor === buffer.constructor ? u : new  buffer(u))
                .toString('base64')
        }
        : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var _atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/\S{1,4}/g, cb_decode);
    };
    var atob = function(a) {
        return _atob(String(a).replace(/[^A-Za-z0-9\+\/]/g, ''));
    };
    var _decode = buffer ?
        buffer.from && Uint8Array && buffer.from !== Uint8Array.from
        ? function(a) {
            return (a.constructor === buffer.constructor
                    ? a : buffer.from(a, 'base64')).toString();
        }
        : function(a) {
            return (a.constructor === buffer.constructor
                    ? a : new buffer(a, 'base64')).toString();
        }
        : function(a) { return btou(_atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict,
        __buffer__: buffer
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    //
    // export Base64 to the namespace
    //
    if (global['Meteor']) { // Meteor.js
        Base64 = global.Base64;
    }
    // module.exports and AMD are mutually exclusive.
    // module.exports has precedence.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports.Base64 = global.Base64;
    }
    else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], function(){ return global.Base64 });
    }
    // that's it!
    return {Base64: global.Base64}
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],17:[function(require,module,exports){
//Craf String
(function(){
	if(typeof(Object.types) !== "object") return;

	var T = Object.types;
	var Doc = T.doc;

	function replaceSpecChar(c){
		switch(c){
			case 'w': return 'a-zA-Z0-9_';
			case 'd': return '0-9';
			case 's': return '\\t\\n\\v\\f\\r ';

			default: return c;
		}
	}

	function rangeInArr(beg, end){
		if(beg > end){
			var tmp = beg;
			beg = end;
			end = tmp;
		}

		var arr = [];
		for(var i = beg; i <= end; i++){
			arr.push(i);
		}

		return arr;
	}

	function parseRange(parse_str){
		if(/\\./.test(parse_str)){
				parse_str = parse_str.replace(/\\(.)/g, function(str, char){ return replaceSpecChar(char);});
		}

		var result = [];

		var beg_char = parse_str[0];
		for(var i = 1; i <= parse_str.length; i++){

			if(parse_str[i-1] !== '\\'
				&&parse_str[i] === '-'
				&&parse_str[i+1]){
				i++;
				var end_char = parse_str[i];

				var arr_chars = rangeInArr(beg_char.charCodeAt(0), end_char.charCodeAt(0));
				result = result.concat(arr_chars);

				i++;
			}else{
				result.push(beg_char.charCodeAt(0));
			}

			beg_char = parse_str[i];
		}
		return result;
	}

	function randIndex(arr){
		var rand = Math.round((arr.length - 1) * Math.random());
		return arr[rand];
	}

	function randChars(chars_arr, size){
		size = T.int(size, 1).rand();
		var str = '';
		while(size){
			var der = randIndex(chars_arr);
			str +=String.fromCharCode(der);
			size--;
		}
		return str;
	}

	function randStr(range, size){

		var parse_range = (range.source).match(/\^\[((\\\]|.)*)\]\*\$/);

		if(!parse_range) throw T.error(arguments, 'Wait arguments: range(RegExp(/^[\w].$/)), size(0<=number)');

		var chars = parseRange(parse_range[1]);

		return randChars.bind(null, chars, size);


	}

	function testStr(range, size){
		return function(str){
			if(typeof(str) !== 'string'){
				var err = this.doc();
				err.params = "Value is not string!";
				return err;
			}

			if(str.length > size){
				var err = this.doc();
				err.params = "Length string is wrong!";
				return err;
			}

			if(!range.test(str)){
				return this.doc();
			}

			return  false;
		}
	}

	function docStr(range, size){
		return T.doc.gen.bind(null, "str", { range: range, length: size});
	}


	var def_size = 17;
	var def_range = /^[\w]*$/;

	function newStr(range, size){
		if(range === null) range = def_range;
		if(size === undefined) size = def_size;

		if(typeof range == "string") range = new RegExp(range);


		if(T.pos.test(size) || !(range instanceof RegExp)){
				throw T.error(arguments, 'Wait arguments: range(RegExp), size(0<=number)');
		}

		return {
			rand: randStr(range, size),
			test: testStr(range, size),
			doc: docStr(range, size)
		};
	}



	T.newType('str',
	{
		name: "String",
		arg: ["range", "length"],
		params: {
				range: {type: 'RegExp || str', default_value: def_range},
				length: {type: 'pos', default_value: def_size}
		}
	},
	{
		New: newStr,
		test: testStr(def_range, def_size),
		rand: randStr(def_range, def_size),
		doc: docStr(def_range, def_size)
	});
})();

},{}],18:[function(require,module,exports){
'use strict';
new (function(){

	if(typeof(Object.types) == "object"){
		return Object.types;
	}

	if(RegExp.prototype.toJSON !== "function"){
		RegExp.prototype.toJSON = function(){ return this.source; };
	}

	var T = this;
	var Doc = {
		types:{
			'bool':{
				name: "Boolean",
				arg: []
			},
			'const': {
				name: "Constant",
				arg: ["value"],
				params: { value: {type: "Something", default_value: null}}
			},
			'pos': {
				name: "Position",
				arg: ['max'],
				params: {max: {type: 'pos', default_value: +2147483647}}

			},

			'int': {
				name: "Integer",
				arg: ["max", "min", "step"],
				params: {
						max: {type: 'int', default_value: +2147483647},
						min: {type: 'int', default_value: -2147483648},
						step: {type: 'pos', default_value: 1}
					}
			},

			'num': {
				name: "Number",
				arg: ["max", "min", "precis"],
				params: {
						max: {type: 'num', default_value: +2147483647},
						min: {type: 'num', default_value: -2147483648},
						precis: {type: 'pos', default_value: 9}
					}
			},
			'arr': {
				name: "Array",
				arg: ["types", "size", "fixed"],
				params: {
						types: {type: "Type || [Type, Type...]", get default_value(){return T.pos}},
						size: {type: 'pos', default_value: 7},
						fixed: {type: 'bool', default_value: true}
					}
			},
			'any': {
				name: "MixType",
				arg: ["types"],
				params: {
						types: {type: "Type, Type... || [Type, Type...]", get default_value(){return [T.pos, T.str]}}
					}
			},
			'obj': {
				name: "Object",
				arg: ["types"],
				params: {types: {type: "Object", default_value: {}}}
			}
		},
		getConst: function(name_type, name_limit){
			return this.types[name_type].params[name_limit].default_value;
		}
	};
	this.doc = {};
	this.doc.json = JSON.stringify(Doc, "", 2);

	Doc.genDoc = (function(name, params){return {name: this.types[name].name, params: params}}).bind(Doc);
	this.doc.gen = Doc.genDoc;




	//Erros
	function argTypeError(wrong_arg, mess){
		if(mess === undefined) mess = '';
		var ER = new TypeError('Argument type is wrong! Arguments(' + forArg(wrong_arg) + ');' + mess);
		ER.wrong_arg = wrong_arg;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, argTypeError);
		}

		return ER;

		function forArg(args){
			var str_args = '';
			for(var i = 0; i < args.length; i++){
				str_args += typeof(args[i]) + ': ' + args[i] + '; ';
			}
			return str_args;
		}
	}
	T.error = argTypeError;

	function typeSyntaxError(wrong_str, mess){
		if(mess === undefined) mess = '';
		var ER = new SyntaxError('Line: ' + wrong_str + '; ' + mess);
		ER.wrong_arg = wrong_str;

		if (Error.captureStackTrace) {
			Error.captureStackTrace(ER, typeSyntaxError);
		}

		return ER;
	}



	function CreateCreator(New, test, rand, doc){
		var creator;
		if(typeof New === "function"){
			creator = function(){
				var tmp_obj = New.apply({}, arguments);
				var new_creator = new CreateCreator(New, tmp_obj.test, tmp_obj.rand, tmp_obj.doc);
				
				return new_creator;
			};
		}else creator = function(){return creator};

		creator.is_creator = true;
		if(typeof test === "function") creator.test = test;
		if(typeof rand === "function") creator.rand = rand;
		if(typeof doc === "function") creator.doc = doc;

		return Object.freeze(creator);
	}
	this.newType = function(key, desc, new_type){
		Doc.types[key] = desc;
		T.names[desc.name] = key;
		this.doc.json = JSON.stringify(Doc, "", 2);

		this[key] = new CreateCreator(new_type.New, new_type.test, new_type.rand, new_type.doc);
	}
	this.newType.doc = '(name, constructor, funcTest, funcRand, funcDoc)';



	//Craft Boolean
		this.bool = new CreateCreator(
			null,
			function(value){
				if(typeof value !== 'boolean'){
					return this.doc();
				}
			},
			function(){
				return !(Math.round(Math.random()));
			},
			Doc.genDoc.bind(null, "bool")
		);



	//Craft Const
		function docConst(val){

			if(typeof(val) === "object" && val !== null){
				val = 'Object';
			}
			if(typeof(val) === "function"){
				val = val.toString();
			}
			return Doc.genDoc.bind(null,"const", {value: val});
		}
		function newConst(val){
			return {
				rand: function(){return val},
				test: function(v){
					if(val !== v) return this.doc();
					return false;
				},
				doc: docConst(val)
			};
		}
		var def_const = newConst(Doc.getConst('const', 'value'));
		this.const = new CreateCreator(newConst, def_const.test, def_const.rand, def_const.doc);

		function tConst(Type){
			if(typeof (Type) !== "function" || !Type.is_creator){
				if(Array.isArray(Type)){

					return T.arr(Type);

				}else if(typeof(Type) == "object" && Type !== null){

					return T.obj(Type);

				}else return T.const(Type);
			}else{
				return Type;
			}
		}


	//Craft Number
		var randNum = function(max, min, precis){
			return function(){
				return +(((max - min)*Math.random() +  min).toFixed(precis));
			}
		};

		var testNum = function(max, min, precis){
			return function(n){
				if(typeof n !== 'number' || !isFinite(n)){
					return this.doc();
				}

				if((n > max)
					||(n < min)
					|| (n.toFixed(precis) != n && n !== 0) ){

					return this.doc();
				}
				return false;
			  };
		};

		var docNum = function(max, min, precis){
			return Doc.genDoc.bind(null, "num", {"max": max, "min": min, "precis": precis});
		}

		var max_def_n = Doc.getConst('num', 'max');
		var min_def_n = Doc.getConst('num', 'min');
		var precis_def = Doc.getConst('num', 'precis');

		this.num = new CreateCreator(
			function(max, min, precis){
				if(max === null) max = max_def_n;
				if(min === undefined||min === null) min = min_def_n;
				if(precis === undefined) precis = precis_def;

				if((typeof min !== 'number' || !isFinite(min))
					||(typeof max !== 'number' || !isFinite(max))
					||(typeof precis !== 'number' || !isFinite(precis))
					||(precis < 0)
					||(precis > 9)
					||(precis % 1 !== 0)){
					throw argTypeError(arguments, 'Wait arguments: min(number), max(number), precis(0<=number<9)');
				}
				if(min > max){
					var t = min;
					min = max;
					max = t;
				}

				return {
					test: testNum(max, min, precis),
					rand: randNum(max, min, precis),
					doc: docNum(max, min, precis)
				}
			},
			testNum(max_def_n, min_def_n, precis_def),
			randNum(max_def_n, min_def_n, precis_def),
			docNum(max_def_n, min_def_n, precis_def)
		);

		var randInt = function(max, min, precis){
			return function(){
				return Math.floor( ((max - (min + 0.1))/precis)*Math.random() ) * precis +  min;
			}
		};

		 var testInt = function(max, min, precis){
			return function(n){
				if(typeof n !== 'number' || !isFinite(n)){
					return this.doc();
				}

				if((n >= max)
					||(n < min)
					||(((n - min) % precis) !== 0) ){
					return this.doc();
				}
				return false;
			  };
		};

		var docInt = function(max, min, step){

				return Doc.genDoc.bind(null, "int", {"max": max, "min": min, "step": step});

		}

		var max_def = Doc.getConst('int', 'max');
		var min_def = Doc.getConst('int', 'min');
		var step_def = Doc.getConst('int', 'step');

		this.int = new CreateCreator(
			function(max, min, step){

				if(max === null) max = max_def;
				if(min === undefined||min === null) min = min_def;
				if(step === undefined) step = step_def;

				if((typeof min !== 'number' || !isFinite(min))
					||(typeof max !== 'number' || !isFinite(max))
					||(Math.round(min) !== min)
					||(Math.round(max) !== max)
					||(step <= 0)
					||(Math.round(step) !== step)){
					throw argTypeError(arguments, 'Wait arguments: min(int), max(int), step(int>0)');
				}
				if(min > max){
					var t = min;
					min = max;
					max = t;
				}

				return {
					test: testInt(max, min, step),
					rand: randInt(max, min, step),
					doc: docInt(max, min, step)
				}
			},
			testInt(max_def, min_def, step_def),
			randInt(max_def, min_def, step_def),
			docInt(max_def, min_def, step_def)
		);

		var docPos = function(max, min, step){

				return Doc.genDoc.bind(null, "pos", {"max": max});

		}

		var max_def_p = Doc.getConst('pos', 'max')
		this.pos = new CreateCreator(
			function(max){

				if(max === null) max = max_def_p;

				if((typeof max !== 'number' || !isFinite(max))
					||(max < 0)){
					throw argTypeError(arguments, 'Wait arguments: min(pos), max(pos), step(pos>0)');
				}

				return {
					test: testInt(max, 0, 1),
					rand: randInt(max, 0, 1),
					doc: docPos(max)
				}
			},
			testInt(max_def_p, 0, 1),
			randInt(max_def_p, 0, 1),
			docPos(max_def_p)
		);





  //Craft Any
  		function randIndex(arr){
			var rand = Math.round((arr.length - 1) * Math.random());
			return arr[rand];
		}

		function randAny(arr){
			return function(){
				return randIndex(arr).rand();
			}
		}

		function testAny(arr){
			return function(val){
				if(arr.every(function(i){return i.test(val)})){
					return this.doc();
				}

				return false;
			}
		}

		function docAny(Types){

			var cont = Types.length;
			var type_docs = [];
			for(var i = 0; i < cont; i++){
				type_docs.push(Types[i].doc());
			}

			return Doc.genDoc.bind(null, "any", {types: type_docs});
		}

		var def_types = Doc.getConst('arr', 'types');
		function newAny(arr){
			if(!Array.isArray(arr) || arguments.length > 1) arr = arguments;

			var len = arr.length;
			var arr_types = [];
			for(var i = 0; i < len; i++){
				arr_types[i] = tConst(arr[i]);
			}

			return{
				test: testAny(arr_types),
				rand: randAny(arr_types),
				doc: docAny(arr_types)
			}
		}

		this.any = new CreateCreator(
			newAny,
			testAny(def_types),
			randAny(def_types),
			docAny(def_types)
		);



	//Craft Array



		function randArray(Type, size, is_fixed){
			var randSize = function (){return size};
			if(!is_fixed){
				randSize = T.pos(size).rand;
			}


			if(Array.isArray(Type)){
				var now_size = randSize();

				return function(){
					var arr = [];

					for(var i = 0, j = 0; i < now_size; i++){

						arr.push(Type[j].rand());

						j++;
						if(j >= Type.length){
							j = 0;
						}
					}
					return arr;
				}
			}



			return function(){
				var arr = [];

				var now_size = randSize();
				for(var i = 0; i < now_size; i++){
					arr.push(Type.rand(i, arr));
				}

				return arr;
			}

		}

		function testArray(Type, size, is_fixed){

			if(Array.isArray(Type)){
				return function(arr){

					if(!Array.isArray(arr)){
						var err = this.doc();
						err.params = "Value is not array!";
						return err;
					}

					if((arr.length > size) || (is_fixed && (arr.length !== size))){
						var err = this.doc();
						err.params = "Array lenght is wrong!";
						return err;
					}

					for(var i = 0, j = 0; i < arr.length; i++){

							var res = Type[j].test(arr[i]);
							if(res){
									var err = this.doc();
									err.params = {index: i, wrong_item: res};
									return err;
							}

							j++;
							if(j >= Type.length){
								j = 0;
							}
					}

					return false;
				}
			}

			return function(arr){
				if(!Array.isArray(arr)){
					var err = this.doc();
					err.params = "Value is not array!";
					return err;
				}

				if((arr.length > size) || (is_fixed && (arr.length !== size))){
					console.log(arr.length, size)
					var err = this.doc();
					err.params = "Array: lenght is wrong!";
					return err;
				}

				var err_arr = arr.filter(Type.test);
				if(err_arr.length != 0){
					var err = this.doc();
					err.params = err_arr;
					return err;
				}

				return false;
			}
		}

		function docArray(Type, size, is_fixed){
			var type_docs = [];
			if(Array.isArray(Type)){
				var cont = Type.length;
				for(var i = 0; i < cont; i++){
					type_docs.push(Type[i].doc());
				}
			}else{
				type_docs = Type.doc();
			}

			return Doc.genDoc.bind(null, "arr", {types: type_docs, size: size, fixed: is_fixed});

		}


		var def_Type = Doc.getConst('arr', 'types');
		var def_Size = Doc.getConst('arr', 'size');
		var def_fixed = Doc.getConst('arr', 'fixed');

		function newArray(Type, size, is_fixed){
			if(Type === null) Type = def_Type;
			if(is_fixed === undefined) is_fixed = def_fixed;

			if(Array.isArray(Type)){
				if(size === undefined||size === null) size = Type.length;

				Type = Type.map(function(item){return tConst(item);});
			}else{
				if(size === undefined||size === null) size = 1;
				Type = tConst(Type);
			}

			if(T.pos.test(size)){
					throw argTypeError(arguments, 'Wait arguments: ' + JSON.stringify(T.pos.test(size)));
			}

			return {
				test: testArray(Type, size, is_fixed),
				rand: randArray(Type, size, is_fixed),
				doc: docArray(Type, size, is_fixed)
			};
		}

		this.arr = new CreateCreator(
			newArray,
			testArray(def_Type, def_Size, def_fixed),
			randArray(def_Type, def_Size, def_fixed),
			docArray(def_Type, def_Size, def_fixed)
		);







	//Craft Object

		function randObj(funcObj){
			return function(){
				var obj = {};
				for(var key in funcObj){
					obj[key] = funcObj[key].rand();
				}
				return obj;
			};
		}

		function testObj(funcObj){
			return function(obj){

				if(typeof obj !== "object" && obj === null){
					var err = this.doc();
					err.params = "Value is not object!";
					return err;
				}

				for(var key in funcObj){
					var res = funcObj[key].test(obj[key]);
					if(res){
						var err = this.doc();
						err.params = {};
						err.params[key] = res;
						return err;
					}
				}

				return false;
			};
		}

		function docOb(funcObj){
			var doc_obj = {};

			for(var key in funcObj){
					doc_obj[key] = funcObj[key].doc();
			}

			return Doc.genDoc.bind(null, "obj", {types: doc_obj});
		}

		function NewObj(tempObj){
			if(typeof tempObj !== 'object') throw argTypeError(arguments, 'Wait arguments: tempObj(Object)');

			var begObj = {};
			var funcObj = {};
			for(var key in tempObj){
				funcObj[key] = tConst(tempObj[key]);
			}

			return{
				test: testObj(funcObj),
				rand: randObj(funcObj),
				doc: docOb(funcObj)
			}
		}
		this.obj = new CreateCreator(NewObj,
			function(obj){return typeof obj === "object"},
			randObj({}),
			Doc.genDoc.bind(null, "obj")
		);





//Craft Type out to  Document

	T.names = {};
	for(var key in Doc.types){
		T.names[Doc.types[key].name] = key;
	}

	this.outDoc = function(tmp){
		if((typeof tmp === "function") && tmp.is_creator) return tmp;

		if(!('name' in tmp)){
			throw new Error();
		}
		var type = tmp.name;

		if('params' in tmp){
			var params = tmp.params;
			switch(T.names[type]){
				case 'obj': {
					var new_obj = {};
					for(var key in params.types){
						new_obj[key] = T.outDoc(params.types[key]);
					}
					params.types = new_obj;
					break;
				}
				case 'any':
				case 'arr': {
					if(Array.isArray(params.types)){
						params.types = params.types.map(T.outDoc.bind(T));
					}else params.types = T.outDoc(params.types);
				}
			}
			return getSimpleType(T.names[type], params);
		}
		return getSimpleType(T.names[type], {});
	}

	function getSimpleType(name, params){
		var arg = [];
		Doc.types[name].arg.forEach(function(key, i){arg[i] = params[key];});
		return T[name].apply(T, arg);
	};

//Support Declarate Function

	function findeParse(str, beg, end){
		var point_beg = str.indexOf(beg);
		if(~point_beg){

			var point_end = point_beg;
			var point_temp = point_beg;
			var level = 1;
			var breakWhile = false;
			while(!breakWhile){
				breakWhile = true;

				if(~point_temp) point_temp = str.indexOf(beg, point_temp + 1);
				if(~point_end) point_end = str.indexOf(end, point_end + 1);

				if(point_temp < point_end){

					if(point_temp > 0){
						breakWhile = false;
						if(str[point_temp - 1] !== '\\') level = level+1;

					}


					if(point_end > 0){
						breakWhile = false;
						if(str[point_end - 1] !== '\\') level = level-1;
						if(level == 0){
							return [point_beg, point_end];
						}
					}
				}else{
					if(point_end > 0){
						breakWhile = false;
						if(str[point_end - 1] !== '\\') level = level-1;
						if(level == 0){
							return [point_beg, point_end];
						}
					}

					if(point_temp > 0){
						breakWhile = false;
						if(str[point_temp - 1] !== '\\') level = level+1;

					}
				}
			}
		}
		return false;
	}

	Object.types = T;
})();

},{}],19:[function(require,module,exports){
module.exports={
	"Дерево": "wood",
	"Камень": "stone",
	"Сталь": "steel",
	"Респ": "spawner"
}
},{}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL0tvbG9ib2svRGVza3RvcC9Qb3J0UHJvZy9XaW42NC9ub2RlX3YxMS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiQWRkRm9ybS5qcyIsIkRpc3BsYXkuanMiLCJFdmVudHMuanMiLCJNYXAuanMiLCJTd2l0Y2guanMiLCJUaWxlcy5qcyIsIlRvb2xzLmpzIiwiVmlld0xvZ2ljLmpzIiwiZHJhd0xpYi5qcyIsIm1vZi5qcyIsIi4uL0xvZ2ljLmpzIiwiLi4vVHlwZXMuanMiLCIuLi9icm9tYWluLmpzIiwiLi4vaW50ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvanMtYmFzZTY0L2Jhc2U2NC5qcyIsIi4uL25vZGVfbW9kdWxlcy90eXBlc2pzL3N0cl90eXBlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL3R5cGVzanMvdHlwZXMuanMiLCIuLi90eXBlc19kdXJhYmlsaXR5Lmpzb24iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDanZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJjb25zdCBMaWIgPSByZXF1aXJlKFwiLi9kcmF3TGliLmpzXCIpO1xyXG52YXIgZHVyYWJpbGl0eV90eXBlc19saXN0ID0gcmVxdWlyZShcIi4uL3R5cGVzX2R1cmFiaWxpdHkuanNvblwiKTtcclxuXHJcblxyXG52YXIgZHVyYWJpbGl0eV90eXBlc19jb250ID0gTGliLmdldE5vZGUoXCJEdXJhYmlsaXR5VHlwZXNcIik7XHJcbnZhciBpbWFnZXNfY29udCA9IExpYi5nZXROb2RlKFwiSW1hZ2VzXCIpO1xyXG52YXIgdGlsZV9zaXplX2NvbnQgPSBMaWIuZ2V0Tm9kZShcIlRpbGVTaXplXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDckFkZEZvcm0oKXtcclxuXHRyZXR1cm4ge1xyXG5cdFx0XHRJbWFnZXM6IG5ldyBDckltYWdlcyhpbWFnZXNfY29udCksXHJcblx0XHRcdFR5cGU6IG5ldyBDckxpc3QoZHVyYWJpbGl0eV90eXBlc19jb250LCBkdXJhYmlsaXR5X3R5cGVzX2xpc3QpLFxyXG5cdFx0XHRTaXplOiB0aWxlX3NpemVfY29udCxcclxuXHRcdFx0Y2xlYXI6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0dGhpcy5JbWFnZXMuY2xlYXIoKTtcclxuXHRcdFx0fSxcclxuXHJcblx0XHRcdGdldFRpbGU6IG5ld1RpbGVcclxuXHR9O1xyXG59XHJcblxyXG5yZXF1aXJlKFwiLi9tb2YuanNcIik7XHJcblxyXG5mdW5jdGlvbiBDckltYWdlcyhjb250YWluZXIpe1xyXG5cdHZhciBpbWFnZXMgPSBbXTtcclxuXHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihmaWxlKXtcclxuXHRcdHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xyXG5cdFx0XHJcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZSl7XHJcblx0XHRcdEFkZChlLnRhcmdldC5yZXN1bHQpO1xyXG5cdFx0fTtcclxuXHRcdHJlYWRlci5yZWFkQXNUZXh0KGZpbGUpO1xyXG5cdH07XHJcblxyXG5cdHRoaXMuYWRkR2V0U2V0KFwidmFsdWVcIixcclxuXHRcdGZ1bmN0aW9uKCl7XHJcblx0XHRcdGlmKGltYWdlcy5sZW5ndGggPiAwKSByZXR1cm4gaW1hZ2VzO1xyXG5cdFx0fVxyXG5cdCk7XHJcblxyXG5cdHRoaXMuY2xlYXIgPSBmdW5jdGlvbigpe1xyXG5cdFx0QXJyYXkuZnJvbShjb250YWluZXIuY2hpbGRyZW4pLmZvckVhY2goZWxlbSA9PiBlbGVtLnJlbW92ZSgpKTtcclxuXHRcdGltYWdlcyA9IFtdO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gQWRkKGltZyl7XHJcblx0XHRpbWFnZXMucHVzaChpbWcpO1xyXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKExpYi5kcmF3VGlsZShpbWcpKTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENyTGlzdChjb250YWluZXIsIGxpc3Qpe1xyXG5cclxuXHRmb3IgKHZhciB2YWwgaW4gbGlzdCl7XHJcblx0XHR2YXIgb3B0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcblx0XHRvcHQudmFsdWUgPSBsaXN0W3ZhbF07XHJcblx0XHRvcHQuaW5uZXJIVE1MID0gdmFsO1xyXG5cdFx0b3B0Lm9uY2xpY2sgPSBvbmNsaWNrO1xyXG5cdFx0Y29udGFpbmVyLmFwcGVuZENoaWxkKG9wdCk7XHJcblx0fVxyXG5cdHZhciBkZWZPcHQgPSBjb250YWluZXIuY2hpbGRyZW5bMF07XHJcblx0Y29udGFpbmVyLnZhbHVlID0gZGVmT3B0LnZhbHVlO1xyXG5cdGRlZk9wdC5jbGFzc0xpc3QuYWRkKFwib3B0aW9uLWNoYW5nZVwiKTtcclxuXHJcblx0cmV0dXJuIGNvbnRhaW5lcjtcclxuXHJcblx0ZnVuY3Rpb24gb25jbGljaygpe1xyXG5cdFx0QXJyYXkuZnJvbSh0aGlzLnBhcmVudEVsZW1lbnQuY2hpbGRyZW4pLmZvckVhY2goZWxlbSA9PiBlbGVtLmNsYXNzTGlzdC5yZW1vdmUoXCJvcHRpb24tY2hhbmdlXCIpKTtcclxuXHRcdHRoaXMucGFyZW50RWxlbWVudC52YWx1ZSA9IHRoaXMudmFsdWU7XHJcblx0XHRjb25zb2xlLmxvZyh0aGlzLnZhbHVlKTtcclxuXHRcdHRoaXMuY2xhc3NMaXN0LmFkZChcIm9wdGlvbi1jaGFuZ2VcIik7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBuZXdUaWxlKHNlbmQpe1xyXG5cdGlmKHRoaXMuSW1hZ2VzLnZhbHVlIFxyXG5cdFx0JiYgdGhpcy5UeXBlLnZhbHVlXHJcblx0XHQmJiB0aGlzLlNpemUudmFsdWUpe1xyXG5cdFx0cmV0dXJuIHtcclxuXHRcdFx0aW1hZ2VzOiB0aGlzLkltYWdlcy52YWx1ZSxcclxuXHRcdFx0dHlwZTogdGhpcy5UeXBlLnZhbHVlLFxyXG5cdFx0XHRzaXplOiBwYXJzZUludCh0aGlzLlNpemUudmFsdWUpXHJcblx0XHR9O1xyXG5cdH1cclxuXHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldE5vZGUoaWQpe1xyXG5cdHZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcclxuXHRyZXR1cm4gZWxlbTtcclxufSIsImNvbnN0IEJhc2U2NCA9IHJlcXVpcmUoJ2pzLWJhc2U2NCcpLkJhc2U2NDtcclxuXHJcbmNvbnN0IENyVmlld0xvZ2ljID0gcmVxdWlyZShcIi4vVmlld0xvZ2ljLmpzXCIpO1xyXG5cclxuY29uc3QgSGVhciA9IHJlcXVpcmUoXCIuL0V2ZW50cy5qc1wiKTtcclxuXHJcbmNvbnN0IENyQWRkRm9ybSA9IHJlcXVpcmUoXCIuL0FkZEZvcm0uanNcIik7XHJcbmNvbnN0IENyVG9vbCA9IHJlcXVpcmUoXCIuL1Rvb2xzLmpzXCIpO1xyXG5jb25zdCBDclRpbGVzID0gcmVxdWlyZShcIi4vVGlsZXMuanNcIik7XHJcbmNvbnN0IENyTWFwID0gcmVxdWlyZShcIi4vTWFwLmpzXCIpO1xyXG5cclxuXHJcblxyXG5cclxuXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENyRGlzcGxheShJbnRlcil7XHJcblx0dmFyIFNlbmQgPSBJbnRlci5jb25uZWN0KHJlY2VpdmUpO1xyXG5cclxuXHR2YXIgVGlsZXMgPSBuZXcgQ3JUaWxlcygpO1xyXG5cclxuXHR2YXIgQWRkRm9ybSA9IG5ldyBDckFkZEZvcm0oKTtcclxuXHJcblx0dmFyIFRpbGVNYXAgPSBuZXcgQ3JNYXAoKTtcclxuXHJcblx0dmFyIFRvb2wgPSBuZXcgQ3JUb29sKCk7XHJcblxyXG5cclxuXHR2YXIgVmlld0xvZ2ljID0gbmV3IENyVmlld0xvZ2ljKEFkZEZvcm0sIFRvb2wpO1xyXG5cclxuXHRIZWFyKFwiQWRkRm9ybVwiLCBcInN1Ym1pdFwiLCBmdW5jdGlvbigpe1xyXG5cdFx0dmFyIHRpbGUgPSBBZGRGb3JtLmdldFRpbGUoKTtcclxuXHRcdGlmKHRpbGUpe1xyXG5cdFx0XHRTZW5kKHtcclxuXHRcdFx0XHRhY3Rpb246IFwiQWRkXCIsXHJcblx0XHRcdFx0dHlwZTogXCJUaWxlXCIsXHJcblx0XHRcdFx0dGlsZTogdGlsZVxyXG5cdFx0XHR9KTtcclxuXHRcdFx0Vmlld0xvZ2ljLnN3aXRjaEFkZEZvcm0oKTtcclxuXHRcdFx0QWRkRm9ybS5jbGVhcigpO1xyXG5cdFx0fVxyXG5cdH0pO1xyXG5cclxuXHRcclxuXHJcblx0ZnVuY3Rpb24gaW5pdE1hcCgpe1xyXG5cclxuXHRcdEhlYXIoXCJHcmlkXCIsIFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRcdHRoaXMuaXNfZG93biA9IHRydWU7XHJcblx0XHRcdFx0aWYoZS50YXJnZXQucGFyZW50RWxlbWVudC5nZXRBdHRyaWJ1dGUoXCJpZFwiKSA9PSBcIkdyaWRcIilcclxuXHRcdFx0XHRcdGRyYXdNYXAoZS50YXJnZXQueCwgZS50YXJnZXQueSk7XHJcblx0XHR9KTtcclxuXHJcblx0XHRIZWFyKFwiR3JpZFwiLCBcIm1vdXNldXBcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdHRoaXMuaXNfZG93biA9IGZhbHNlO1xyXG5cdFx0fSk7XHJcblxyXG5cdFx0SGVhcihcIkdyaWRcIiwgXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oZSl7XHJcblx0XHRcdGlmKHRoaXMuaXNfZG93biAmJiBlLnRhcmdldC5wYXJlbnRFbGVtZW50LmdldEF0dHJpYnV0ZShcImlkXCIpID09IFwiR3JpZFwiKXtcclxuXHRcdFx0XHRkcmF3TWFwKGUudGFyZ2V0LngsIGUudGFyZ2V0LnkpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRyYXdNYXAoeCwgeSl7XHJcblx0XHRpZih0eXBlb2YgVG9vbC50aWxlID09IFwibnVtYmVyXCIpXHJcblx0XHRcdFNlbmQoe1xyXG5cdFx0XHRcdGFjdGlvbjogXCJEcmF3XCIsXHJcblx0XHRcdFx0dHlwZTogXCJNYXBcIixcclxuXHRcdFx0XHR0b29sOiBUb29sLnR5cGUsXHJcblx0XHRcdFx0Y29vcmRzOiB7eDogeCwgeTogeSwgejogMX0sXHJcblx0XHRcdFx0dGlsZV9pZDogVG9vbC50aWxlXHJcblx0XHRcdH0pO1xyXG5cdFx0ZWxzZSBpZihUb29sLnR5cGUgPT0gXCJDbGVhclwiKVxyXG5cdFx0XHRTZW5kKHtcclxuXHRcdFx0XHRhY3Rpb246IFwiRHJhd1wiLFxyXG5cdFx0XHRcdHR5cGU6IFwiTWFwXCIsXHJcblx0XHRcdFx0dG9vbDogVG9vbC50eXBlLFxyXG5cdFx0XHRcdGNvb3Jkczoge3g6IHgsIHk6IHksIHo6IDF9XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblxyXG5cdC8vUmVjZWl2ZS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cdGZ1bmN0aW9uIHJlY2VpdmUobWVzcyl7XHJcblx0XHRzd2l0Y2gobWVzcy50eXBlKXtcclxuXHRcdFx0Y2FzZSBcIlRpbGVcIjogcmVjZWl2ZVRpbGVzKG1lc3MpOyBicmVhaztcclxuXHRcdFx0Y2FzZSBcIk1hcFwiOiByZWNlaXZlTWFwKG1lc3MpOyBicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlY2VpdmVUaWxlcyhtZXNzKXtcclxuXHRcdHN3aXRjaChtZXNzLmFjdGlvbil7XHJcblx0XHRcdGNhc2UgXCJBZGRcIjogIFRpbGVzLmFkZChtZXNzLnRpbGUpOyBicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlY2VpdmVNYXAobWVzcyl7XHJcblx0XHRzd2l0Y2gobWVzcy5hY3Rpb24pe1xyXG5cdFx0XHRjYXNlIFwiQ3JlYXRlXCI6ICBcclxuXHRcdFx0XHRUaWxlTWFwLmxvYWQobWVzcy5zaXplcyk7IGluaXRNYXAoKTsgXHJcblx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdGNhc2UgXCJEcmF3XCI6XHJcblx0XHRcdFx0VGlsZU1hcC5kcmF3KG1lc3MpO1xyXG5cdFx0XHRcdGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxufSIsImZ1bmN0aW9uIElkc0V2ZW50cyhpZHMsIG5hbWVfZXZlbnRzLCBmdW5jKXtcclxuXHRpZihBcnJheS5pc0FycmF5KGlkcykpe1xyXG5cdFx0aWRzLmZvckVhY2goaWQgPT4gSWRFdmVudHMoaWQsIG5hbWVfZXZlbnRzLCBmdW5jKSk7XHJcblx0fWVsc2UgSWRFdmVudHMoaWRzLCBuYW1lX2V2ZW50cywgZnVuYyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIElkRXZlbnRzKGlkLCBuYW1lX2V2ZW50cywgZnVuYyl7XHJcblx0aWYoQXJyYXkuaXNBcnJheShuYW1lX2V2ZW50cykpe1xyXG5cdFx0bmFtZV9ldmVudHMuZm9yRWFjaChuYW1lID0+IElkRXZlbnQoaWQsIG5hbWUsIGZ1bmMpKTtcclxuXHR9ZWxzZSBJZEV2ZW50KGlkLCBuYW1lX2V2ZW50cywgZnVuYyk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIElkRXZlbnQoaWQsIG5hbWVfZXZlbnQsIGZ1bmMpe1xyXG5cdFxyXG5cdGlmKG5hbWVfZXZlbnQgPT0gXCJzdWJtaXRcIil7XHJcblx0XHR2YXIgb2xkX2Z1bmMgPSBmdW5jO1xyXG5cdFx0ZnVuYyA9IGZ1bmN0aW9uKGUpe1xyXG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRcdG9sZF9mdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0XHR9IFxyXG5cdH1cclxuXHRcclxuXHRnZXROb2RlKGlkKS5hZGRFdmVudExpc3RlbmVyKG5hbWVfZXZlbnQsIGZ1bmMpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBTdWJtaXQoZnVuYyl7XHJcblx0cmV0dXJuIGZ1bmN0aW9uKGV2ZW50KXtcclxuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblx0XHRmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XHJcblx0fVxyXG59XHJcblxyXG5mdW5jdGlvbiBnZXROb2RlKGlkKXtcclxuXHR2YXIgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuXHRpZighZWxlbSkgdGhyb3cgbmV3IEVycm9yKFwiRWxlbSBpcyBub3QgZmluZCFcIik7XHJcblx0cmV0dXJuIGVsZW07XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSWRzRXZlbnRzO1xyXG4iLCJjb25zdCBMaWIgPSByZXF1aXJlKFwiLi9kcmF3TGliLmpzXCIpO1xyXG5cclxudmFyIG1hcF9zaXplID0gMjA7XHJcbnZhciBtYXBfY29udCA9IExpYi5nZXROb2RlKFwiTWFwXCIpO1xyXG52YXIgVGlsZXMgPSBMaWIuZ2V0Tm9kZShcIlRpbGVzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDck1hcCgpe1xyXG5cclxuXHRtYXBfY29udC5sb2FkID0gZnVuY3Rpb24oc2l6ZXMpe1xyXG5cdFx0dmFyIEdyaWQgPSBDckdyaWQoc2l6ZXMsIFwiZ3JpZC1ib3JkZXJcIik7XHJcblx0XHRHcmlkLnNldEF0dHJpYnV0ZShcImlkXCIsIFwiR3JpZFwiKTtcclxuXHJcblx0XHR3aGlsZShzaXplcy5sYXllcnMtLSlcclxuXHRcdFx0bWFwX2NvbnQuYXBwZW5kQ2hpbGQoQ3JMYXllcihzaXplcykpO1xyXG5cclxuXHRcdG1hcF9jb250LmFwcGVuZENoaWxkKEdyaWQpO1xyXG5cdH1cclxuXHJcblx0bWFwX2NvbnQuZHJhdyA9IGZ1bmN0aW9uKG1lc3Mpe1xyXG5cdFx0dmFyIGNvb3JkcyA9IG1lc3MuY29vcmRzO1xyXG5cdFx0aWYoY29vcmRzLmxlbmd0aCA9PSAwKSByZXR1cm47XHJcblxyXG5cdFx0aWYobWVzcy50b29sID09IFwiUGVuXCIpe1xyXG5cdFx0XHR2YXIgdGlsZSA9IFRpbGVzLmdldFRpbGUobWVzcy50aWxlX2lkKTtcclxuXHJcblx0XHRcdHRoaXMuY2hpbGRyZW5bY29vcmRzWzBdLnpdLnBlbih0aWxlLCBjb29yZHMpO1x0XHRcdFxyXG5cdFx0fVxyXG5cdFx0aWYobWVzcy50b29sID09IFwiQ2xlYXJcIikgdGhpcy5jaGlsZHJlbltjb29yZHNbMF0uel0uY2xlYXIobWVzcy5jb29yZHMpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIG1hcF9jb250O1xyXG5cdFxyXG59XHJcblxyXG5mdW5jdGlvbiBDckxheWVyKHNpemVzKXtcclxuXHR2YXIgbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG5cdGxheWVyLmNsYXNzTGlzdC5hZGQoXCJsYXllclwiKTtcclxuXHRsYXllci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xyXG5cdGxheWVyLnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xyXG5cclxuXHR2YXIgd19zaXplID0gMTAwIC8gc2l6ZXMud2lkdGg7XHJcblx0dmFyIGhfc2l6ZSA9IDEwMCAvIHNpemVzLmhlaWdodDtcclxuXHJcblx0bGF5ZXIuc2hvdyA9IGZ1bmN0aW9uKCl7XHJcblx0XHRsYXllci5zdHlsZS5vcGFjaXR5ID0gMDtcclxuXHR9XHJcblxyXG5cdGxheWVyLmhpZGUgPSBmdW5jdGlvbigpe1xyXG5cdFx0bGF5ZXIuc3R5bGUub3BhY2l0eSA9IDE7XHJcblx0fVxyXG5cclxuXHRsYXllci5jbGVhciA9IGZ1bmN0aW9uKGNvb3Jkcyl7XHJcblx0XHRjb29yZHMgPSBjb29yZHNbMF07XHJcblxyXG5cdFx0aWYoIWxheWVyW2Nvb3Jkcy55XSB8fCAhbGF5ZXJbY29vcmRzLnldW2Nvb3Jkcy54XSkgdGhyb3cgbmV3IEVycm9yKCk7XHJcblx0XHRsYXllcltjb29yZHMueV1bY29vcmRzLnhdLnJlbW92ZSgpO1xyXG5cdH1cclxuXHJcblx0bGF5ZXIucGVuID0gZnVuY3Rpb24odGlsZSwgY29vcmRzKXtcclxuXHRcdGNvb3JkcyA9IGNvb3Jkc1swXTtcclxuXHJcblx0XHR2YXIgYm94ID0gTGliLmRyYXdUaWxlKHRpbGUuaW1hZ2VzWzBdKTtcclxuXHRcdGJveC50aWxlID0gdGlsZS5pZDtcclxuXHRcdGJveC5jbGFzc0xpc3QuYWRkKFwiYm94XCIpO1xyXG5cclxuXHRcdGJveC5zdHlsZS53aWR0aCA9IHRpbGUuc2l6ZSp3X3NpemUgKyBcIiVcIjtcclxuXHRcdGJveC5zdHlsZS5oZWlnaHQgPSB0aWxlLnNpemUqaF9zaXplICsgXCIlXCI7XHJcblxyXG5cdFx0Ym94LnN0eWxlLmxlZnQgPSBjb29yZHMueCp3X3NpemUgKyBcIiVcIjtcclxuXHRcdGJveC5zdHlsZS50b3AgPSBjb29yZHMueSpoX3NpemUgKyBcIiVcIjtcclxuXHJcblx0XHRsYXllci5hcHBlbmRDaGlsZChib3gpO1xyXG5cclxuXHRcdGlmKCFsYXllcltjb29yZHMueV0pIGxheWVyW2Nvb3Jkcy55XSA9IFtdO1xyXG5cdFx0bGF5ZXJbY29vcmRzLnldW2Nvb3Jkcy54XSA9IGJveDtcclxuXHR9XHJcblxyXG5cdHJldHVybiBsYXllcjtcclxufVxyXG5cclxuZnVuY3Rpb24gQ3JHcmlkKHNpemVzLCBib3JkZXIpe1xyXG5cdHZhciBsYXllciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcblx0bGF5ZXIuY2xhc3NMaXN0LmFkZChcImxheWVyXCIpO1xyXG5cdGxheWVyLnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XHJcblx0bGF5ZXIuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XHJcblx0ZHJhd0dyaWQobGF5ZXIsIHNpemVzLCBib3JkZXIpO1xyXG5cclxuXHRsYXllci5zaG93ID0gZnVuY3Rpb24oKXtcclxuXHRcdGxheWVyLnN0eWxlLm9wYWNpdHkgPSAwO1xyXG5cdH1cclxuXHJcblx0bGF5ZXIuaGlkZSA9IGZ1bmN0aW9uKCl7XHJcblx0XHRsYXllci5zdHlsZS5vcGFjaXR5ID0gMTtcclxuXHR9XHJcblxyXG5cdHJldHVybiBsYXllcjtcclxufVxyXG5cclxuXHJcbmZ1bmN0aW9uIGRyYXdHcmlkKGNvbnRhaW5lciwgZ3JpZF9zaXplLCBib3JkZXIpe1xyXG5cdHZhciB3X3NpemUgPSAxMDAgLyBncmlkX3NpemUud2lkdGg7XHJcblx0dmFyIGhfc2l6ZSA9IDEwMCAvIGdyaWRfc2l6ZS5oZWlnaHQ7XHJcblx0Zm9yKHZhciBpID0gZ3JpZF9zaXplLndpZHRoIC0gMTsgaSA+PSAwOyBpLS0pe1xyXG5cdFx0Zm9yKHZhciBqID0gZ3JpZF9zaXplLmhlaWdodCAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0dmFyIGJveCA9IGRhcndCb3god19zaXplLCBoX3NpemUsIGJvcmRlcik7XHJcblxyXG5cdFx0XHRib3guc3R5bGUubGVmdCA9IGkqd19zaXplICsgXCIlXCI7XHJcblx0XHRcdGJveC5zdHlsZS50b3AgPSBqKmhfc2l6ZSArIFwiJVwiO1xyXG5cclxuXHRcdFx0Ym94LnggPSBpO1xyXG5cdFx0XHRib3gueSA9IGo7XHJcblx0XHRcdFxyXG5cdFx0XHRjb250YWluZXIuYXBwZW5kQ2hpbGQoYm94KTtcclxuXHRcdH1cclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGRhcndCb3god2lkdGgsIGhlaWdodCwgYm9yZGVyKXtcclxuXHR2YXIgYm94ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XHJcblx0Ym94LmNsYXNzTGlzdC5hZGQoXCJib3hcIik7XHJcblx0aWYoYm9yZGVyKSBcclxuXHRcdGJveC5jbGFzc0xpc3QuYWRkKGJvcmRlcik7XHJcblxyXG5cdGJveC5zdHlsZS53aWR0aCA9IHdpZHRoICsgXCIlXCI7XHJcblx0Ym94LnN0eWxlLmhlaWdodCA9IGhlaWdodCArIFwiJVwiO1xyXG5cclxuXHRyZXR1cm4gYm94O1xyXG59IiwiZnVuY3Rpb24gQ3JTd2l0Y2gobmFtZV9jbGFzcywgaWRzKXtcblx0aWYoQXJyYXkuaXNBcnJheShpZHMpKXtcblx0XHR2YXIgZWxlbXMgPSBpZHMubWFwKGdldE5vZGUpO1xuXHRcdGVsZW1zID0gZWxlbXMubWFwKGVsZW0gPT4gZWxlbS5jbGFzc0xpc3QpO1xuXG5cdFx0cmV0dXJuIGFyclN3aWN0aC5iaW5kKG51bGwsIGVsZW1zLCBuYW1lX2NsYXNzKTtcblx0fVxuXHRlbHNlIGlmKHR5cGVvZiBpZHMgPT0gXCJvYmplY3RcIil7XG5cdFx0cmV0dXJuIG9ialN3aXRjaChpZHMsIG5hbWVfY2xhc3MpO1xuXHR9XG5cdGVsc2V7XG5cdFx0dmFyIGVsZW0gPSBnZXROb2RlKGlkcykuY2xhc3NMaXN0O1xuXHRcdHJldHVybiBvbmVTd2l0Y2guYmluZChudWxsLCBuYW1lX2NsYXNzLCBlbGVtKTtcblx0fVxuXHRcbn1cblxuZnVuY3Rpb24gb2JqU3dpdGNoKGlkX29iaiwgY2xhc3NfbmFtZSl7XG5cdGZvciAodmFyIGtleSBpbiBpZF9vYmope1xuXHRcdGlkX29ialtrZXldID0gZ2V0Tm9kZShpZF9vYmpba2V5XSkuY2xhc3NMaXN0O1xuXHR9XG5cblx0cmV0dXJuIGZ1bmN0aW9uKGlkKXtcblx0XHRmb3IgKHZhciBpIGluIGlkX29iail7XG5cdFx0XHRpZF9vYmpbaV0uYWRkKGNsYXNzX25hbWUpO1xuXHRcdH1cblx0XHRcblx0XHRpZF9vYmpbaWRdLnJlbW92ZShjbGFzc19uYW1lKTtcblx0fVxufVxuXG5mdW5jdGlvbiBhcnJTd2ljdGgoZWxlbV9hcnIsIG5hbWVfY2xhc3Mpe1xuXHRlbGVtX2Fyci5mb3JFYWNoKG9uZVN3aXRjaC5iaW5kKG51bGwsIG5hbWVfY2xhc3MpKTtcbn1cblxuZnVuY3Rpb24gb25lU3dpdGNoKG5hbWVfY2xhc3MsIGVsZW0pe1xuXHRcdGVsZW0udG9nZ2xlKG5hbWVfY2xhc3MpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENyU3dpdGNoO1xuXG5mdW5jdGlvbiBnZXROb2RlKGlkKXtcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG5cdGlmKCFlbGVtKSB0aHJvdyBuZXcgRXJyb3IoXCJFbGVtIGlzIG5vdCBmaW5kIVwiKTtcblx0cmV0dXJuIGVsZW07XG59IiwiY29uc3QgTGliID0gcmVxdWlyZShcIi4vZHJhd0xpYi5qc1wiKTtcclxuXHJcbnZhciB0aWxlc19jb250ID0gTGliLmdldE5vZGUoXCJUaWxlc1wiKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gQ3JUaWxlcyhjb250YWluZXIpe1xyXG5cdHZhciB0aWxlcyA9IFtdO1xyXG5cclxuXHR0aWxlc19jb250LmFkZCA9IGZ1bmN0aW9uKG5ld190aWxlKXtcclxuXHRcdHZhciB0aWxlID0gTGliLmRyYXdUaWxlKG5ld190aWxlLmltYWdlc1swXSk7XHJcblx0XHR0aWxlLnRpbGUgPSBuZXdfdGlsZTtcclxuXHRcdHRpbGVzX2NvbnQuYXBwZW5kQ2hpbGQodGlsZSk7XHJcblxyXG5cdFx0dGlsZXNbbmV3X3RpbGUuaWRdID0gbmV3X3RpbGU7XHJcblx0fVxyXG5cclxuXHR0aWxlc19jb250LmdldFRpbGUgPSBmdW5jdGlvbihpZCl7XHJcblx0XHRyZXR1cm4gdGlsZXNbaWRdO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHRpbGVzX2NvbnQ7XHJcbn0iLCJyZXF1aXJlKFwiLi9tb2YuanNcIik7XHJcbmNvbnN0IExpYiA9IHJlcXVpcmUoXCIuL2RyYXdMaWIuanNcIik7XHJcblxyXG5cclxudmFyIHRvb2xzX2NvbnQgPSBMaWIuZ2V0Tm9kZShcIlRvb2xzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDclRvb2xzKCl7XHJcblx0dmFyIHBhbGxldCA9IHt9O1xyXG5cdHZhciB0eXBlID0gXCJQZW5cIjtcclxuXHJcblx0dGhpcy5hZGRHZXRTZXQoXCJ0aWxlXCIsIFxyXG5cdFx0ZnVuY3Rpb24oKXtcclxuXHRcdFx0aWYocGFsbGV0W3R5cGVdKSByZXR1cm4gcGFsbGV0W3R5cGVdLmlkO1xyXG5cdFx0fSxcclxuXHRcdGZ1bmN0aW9uKHZhbCl7XHJcblx0XHRcdGlmKHR5cGUgPT0gXCJDbGVhclwiKVxyXG5cdFx0XHRcdHR5cGUgPSBcIlBlblwiO1xyXG5cclxuXHRcdFx0cGFsbGV0W3R5cGVdID0gdmFsO1xyXG5cdFx0XHRjaGFuZ2VUaWxlVmlldyh2YWwuaW1hZ2VzWzBdKTtcclxuXHRcdH1cclxuXHQpO1xyXG5cclxuXHR0aGlzLmFkZEdldFNldChcInR5cGVcIiwgXHJcblx0XHRmdW5jdGlvbigpe1xyXG5cdFx0XHRyZXR1cm4gdHlwZTtcclxuXHRcdH0sXHJcblx0XHRmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHR0eXBlID0gdmFsO1xyXG5cclxuXHRcdFx0aWYocGFsbGV0W3R5cGVdKSBcclxuXHRcdFx0XHRjaGFuZ2VUaWxlVmlldyhwYWxsZXRbdHlwZV0uaW1hZ2VzWzBdKTtcclxuXHRcdFx0ZWxzZVxyXG5cdFx0XHRcdGNoYW5nZVRpbGVWaWV3KG51bGwpO1xyXG5cdFx0fVxyXG5cdCk7XHJcblxyXG5cdHZhciB0aWxlVmlldyA9IG51bGw7XHJcblxyXG5cdGZ1bmN0aW9uIGNoYW5nZVRpbGVWaWV3KGltYWdlKXtcclxuXHRcdGlmKHRpbGVWaWV3KXtcclxuXHRcdFx0dGlsZVZpZXcucmVtb3ZlKCk7XHJcblx0XHRcdHRpbGVWaWV3ID0gbnVsbDtcclxuXHRcdH1cclxuXHJcblx0XHRpZihpbWFnZSl7XHJcblx0XHRcdHRpbGVWaWV3ID0gTGliLmRyYXdUaWxlKGltYWdlKTtcclxuXHRcdFx0dG9vbHNfY29udC5hcHBlbmRDaGlsZCh0aWxlVmlldyk7XHJcblx0XHR9XHJcblx0fVxyXG59IiwiY29uc3QgSGVhciA9IHJlcXVpcmUoXCIuL0V2ZW50cy5qc1wiKTtcclxuY29uc3QgQ3JTd2l0Y2hFbGVtID0gcmVxdWlyZShcIi4vU3dpdGNoLmpzXCIpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihGb3JtLCBUb29sKXtcclxuXHJcblx0dGhpcy5zd2l0Y2hBZGRGb3JtID0gQ3JTd2l0Y2hFbGVtKFwiaW52aXNcIiwgXCJBZGRGb3JtXCIpO1xyXG5cclxuXHRIZWFyKFwiYWRkX3N3aXRjaFwiLCBcImNsaWNrXCIsIHRoaXMuc3dpdGNoQWRkRm9ybSk7XHJcblxyXG5cdEhlYXIoXCJBZGRJbWFnZUlucHV0XCIsIFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCl7XHJcblx0XHRpZih0aGlzLmZpbGVzWzBdKVxyXG5cdFx0XHRGb3JtLkltYWdlcy5hZGQodGhpcy5maWxlc1swXSk7XHJcblx0fSk7XHJcblxyXG5cdEhlYXIoXCJUaWxlc1wiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoZS50YXJnZXQudGlsZSl7XHJcblx0XHRcdFRvb2wudGlsZSA9IGUudGFyZ2V0LnRpbGU7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdEhlYXIoXCJUb29sc1wiLCBcImNsaWNrXCIsIGZ1bmN0aW9uKGUpe1xyXG5cdFx0aWYoZS50YXJnZXQuZ2V0QXR0cmlidXRlKFwidG9vbFwiKSl7XHJcblx0XHRcdFRvb2wudHlwZSA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZShcInRvb2xcIik7XHJcblx0XHR9XHJcblx0fSk7XHJcblxyXG5cdEhlYXIoW1wiVG9vbHNcIiwgXCJUaWxlc1wiLCBcIk9wZW5cIiwgXCJTYXZlXCJdLCBcImNsaWNrXCIsIFByZXNzKTtcclxuXHJcblx0SGVhcihcIk1hcFwiLCBcImRyYWdzdGFydFwiLCBmdW5jdGlvbihlKXtcclxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcclxuXHR9KTtcclxuXHJcblx0XHJcblxyXG59O1xyXG5cclxuZnVuY3Rpb24gUHJlc3MoZSl7XHJcblx0XHRlLnRhcmdldC5jbGFzc0xpc3QuYWRkKFwicHJlc3NcIik7XHJcblx0XHRzZXRUaW1lb3V0KCgpPT5lLnRhcmdldC5jbGFzc0xpc3QucmVtb3ZlKFwicHJlc3NcIiksIDMwMCk7XHJcbn0iLCJleHBvcnRzLmRyYXdUaWxlID0gZnVuY3Rpb24oc3ZnX2ltZyl7XHJcblx0XHJcblx0dmFyIGltZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG5cdGltZy5zcmMgPSBcImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsXCIrIEJhc2U2NC5lbmNvZGUoc3ZnX2ltZyk7XHJcblxyXG5cdGltZy5jbGFzc0xpc3QuYWRkKFwidGlsZVwiKTtcclxuXHRcclxuXHRyZXR1cm4gaW1nO1xyXG59XHJcblxyXG5leHBvcnRzLmdldE5vZGUgPSBmdW5jdGlvbihpZCl7XHJcblx0dmFyIGVsZW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcblx0aWYoIWVsZW0pIHRocm93IG5ldyBFcnJvcihcIkVsZW0gaXMgbm90IGZpbmQhXCIpO1xyXG5cdHJldHVybiBlbGVtO1xyXG59IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vQ3JhZnQgb2JqZWN0LnByb3R5cGVcbihmdW5jdGlvbigpe1xuXHRpZiggdHlwZW9mKE9iamVjdC5jclByb3ApID09IFwiZnVuY3Rpb25cIil7XG5cdFx0cmV0dXJuO1xuXHR9XG5cdFxuXHRcblx0ZnVuY3Rpb24gY29uc3RQcm9wKG5hbWVfcHJvcCwgdmFsdWUsIHZpcywgcmV3cml0ZSl7XG5cdFx0XG5cdFx0aWYodmFsdWUgPT09IHVuZGVmaW5lZCkgdmFsdWUgPSB0cnVlO1xuXHRcdGlmKHZpcyA9PT0gdW5kZWZpbmVkKSB2aXMgPSB0cnVlO1xuXG5cdFx0aWYodHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiKSBPYmplY3QuZnJlZXplKHZhbHVlKTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZV9wcm9wLCB7XG5cdFx0XHRcdHZhbHVlOiB2YWx1ZSxcblx0XHRcdFx0ZW51bWVyYWJsZTogdmlzLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHJld3JpdGUsXG5cdFx0XHRcdHdyaXRhYmxlOiByZXdyaXRlLFxuXHRcdFx0fSk7XG5cdH1cblx0ZnVuY3Rpb24gZ2V0U2V0KG5hbWUsIGdldHRlciwgc2V0dGVyKXtcblx0XHRpZih0eXBlb2Ygc2V0dGVyID09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuXHRcdFx0XHRnZXQ6IGdldHRlcixcblx0XHRcdFx0c2V0OiBzZXR0ZXIsXG5cdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fWVsc2V7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgbmFtZSwge1xuXHRcdFx0XHRnZXQ6IGdldHRlcixcblx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblx0XG5cdGNvbnN0UHJvcC5jYWxsKE9iamVjdC5wcm90b3R5cGUsICdjclByb3AnLCBjb25zdFByb3AsIGZhbHNlKTtcblx0T2JqZWN0LnByb3RvdHlwZS5jclByb3AoJ2FkZEdldFNldCcsIGdldFNldCwgZmFsc2UpO1xuXHRcblx0XG5cdGZ1bmN0aW9uIHJhbmRJbmRleCgpe1xuXHRcdHZhciByYW5kID0gTWF0aC5yb3VuZCgodGhpcy5sZW5ndGggLSAxKSAqIE1hdGgucmFuZG9tKCkpO1xuXHRcdHJldHVybiB0aGlzW3JhbmRdO1xuXHR9XG5cdFxuXHRmdW5jdGlvbiBBZGRJdGVtKHZhbCl7XG5cdFx0aWYoIXRoaXMuX251bGxzKSB0aGlzLl9udWxscyA9IFtdO1xuXHRcdFxuXHRcdGlmKHRoaXMuX251bGxzLmxlbmd0aCl7XG5cdFx0XHR2YXIgaW5kID0gdGhpcy5fbnVsbHMucG9wKCk7XG5cdFx0XHR0aGlzW2luZF0gPSB2YWw7XG5cdFx0XHRyZXR1cm4gaW5kO1xuXHRcdH1lbHNle1xuXHRcdFx0cmV0dXJuIHRoaXMucHVzaCh2YWwpIC0gMTtcblx0XHR9XG5cdH1cblx0XG5cdGZ1bmN0aW9uIERlbGxJdGVtKGluZCl7XG5cdFx0aWYoaW5kID4gdGhpcy5sZW5ndGggLTEpIHJldHVybiBmYWxzZTtcblx0XHRcblx0XHRpZihpbmQgPT0gdGhpcy5sZW5ndGggLTEpe1xuXHRcdFx0dGhpcy5wb3AoKTtcblx0XHR9ZWxzZXtcblx0XHRcdGlmKCF0aGlzLl9udWxscykgdGhpcy5fbnVsbHMgPSBbXTtcblx0XHRcdFxuXHRcdFx0dGhpc1tpbmRdID0gdW5kZWZpbmVkO1xuXHRcdFx0dGhpcy5fbnVsbHMucHVzaChpbmQpO1xuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gdHJ1ZTtcdFxuXHR9XG5cdFxuXHRmdW5jdGlvbiBjcmVhdGVBcnIodmFsLCBsZW5ndGgsIGlzX2NhbGwpe1xuXHRcdHZhciBhcnIgPSBbXTtcblx0XHRcblx0XHRpZighbGVuZ3RoKSBsZW5ndGggPSAxO1xuXHRcdGlmKGlzX2NhbGwgPT09IHVuZGVmaW5lZCkgaXNfY2FsbCA9IHRydWU7XG5cdFx0XG5cdFx0aWYodHlwZW9mIHZhbCA9PSAnZnVuY3Rpb24nICYmIGlzX2NhbGwpe1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcblx0XHRcdFx0YXJyLnB1c2godmFsKGksIGFycikpO1xuXHRcdFx0fVxuXHRcdH1lbHNlIGlmKHZhbCAhPT0gdW5kZWZpbmVkKXtcblx0XHRcdFxuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKXtcblx0XHRcdFx0YXJyLnB1c2godmFsKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRhcnIuY3JQcm9wKCdyYW5kX2knLCByYW5kSW5kZXgpO1xuXHRcdGFyci5jclByb3AoJ2FkZCcsIEFkZEl0ZW0pO1xuXHRcdGFyci5jclByb3AoJ2RlbGwnLCBEZWxsSXRlbSk7XG5cdFx0XG5cdFx0cmV0dXJuIGFycjtcblx0fVxuXHRcblx0XG5cdFxuXHRBcnJheS5jclByb3AoJ2NyZWF0ZScsIGNyZWF0ZUFycik7XG5cdFxuXHRcblx0aWYoUmVnRXhwLnByb3RvdHlwZS50b0pTT04gIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0UmVnRXhwLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5zb3VyY2U7IH07XG5cdH1cblxufSkoKTtcblxuXG5cblxuIiwicmVxdWlyZShcIi4vbW9mLmpzXCIpO1xyXG5cclxudmFyIG1hcF9zaXplID0ge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMCwgbGF5ZXJzOiAyfTtcclxuXHJcbmZ1bmN0aW9uIENyVGlsZXMoKXtcclxuXHR2YXIgdGlsZXMgPSBBcnJheS5jcmVhdGUoKTtcclxuXHJcblx0dGhpcy5hZGQgPSBmdW5jdGlvbihuZXdfdGlsZSl7XHJcblx0XHRuZXdfdGlsZS5pZCA9IHRpbGVzLmFkZChuZXdfdGlsZSk7XHJcblx0XHRyZXR1cm4gbmV3X3RpbGU7XHJcblx0fVxyXG5cclxuXHR0aGlzLmdldFRpbGUgPSBmdW5jdGlvbihpZCl7XHJcblx0XHRyZXR1cm4gdGlsZXNbaWRdO1xyXG5cdH1cclxufVxyXG5cclxudmFyIFRpbGVzID0gbmV3IENyVGlsZXMoKTtcclxuXHJcbmZ1bmN0aW9uIENyTWFwKHNpemVzKXtcclxuXHR2YXIgY3JfbGluZSA9IEFycmF5LmNyZWF0ZS5iaW5kKG51bGwsIG51bGwsIHNpemVzLndpZHRoKTtcclxuXHR2YXIgY3JfcGxpbmUgPSBBcnJheS5jcmVhdGUuYmluZChudWxsLCBjcl9saW5lLCBzaXplcy53aWR0aCwgdHJ1ZSk7XHJcblx0dmFyIG1hcCA9IEFycmF5LmNyZWF0ZShjcl9wbGluZSwgc2l6ZXMubGF5ZXJzKTtcclxuXHJcblx0dGhpcy5sb2FkID0gZnVuY3Rpb24oKXtcclxuXHRcdHJldHVybiB7XHJcblx0XHRcdGFjdGlvbjogXCJDcmVhdGVcIixcclxuXHRcdFx0dHlwZTogXCJNYXBcIixcclxuXHRcdFx0c2l6ZXM6IHNpemVzXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHR0aGlzLmRyYXcgPSBmdW5jdGlvbihtZXNzKXtcclxuXHRcdHZhciBuZXdfbWVzcyA9IHtcclxuXHRcdFx0YWN0aW9uOiBcIkRyYXdcIixcclxuXHRcdFx0dHlwZTogXCJNYXBcIixcclxuXHRcdFx0dG9vbDogbWVzcy50b29sLFxyXG5cdFx0XHRjb29yZHM6IG1lc3MuY29vcmRzXHJcblx0XHR9O1xyXG5cclxuXHRcdHN3aXRjaChtZXNzLnRvb2wpe1xyXG5cdFx0XHRjYXNlIFwiUGVuXCI6ICBcclxuXHRcdFx0XHRuZXdfbWVzcy5jb29yZHMgPSBQZW4obWVzcy50aWxlX2lkLCBtZXNzLmNvb3Jkcyk7XHJcblx0XHRcdFx0bmV3X21lc3MudGlsZV9pZCA9IG1lc3MudGlsZV9pZDtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdFx0Y2FzZSBcIkNsZWFyXCI6IFxyXG5cdFx0XHRcdG5ld19tZXNzLmNvb3JkcyA9IENsZWFyKG1lc3MuY29vcmRzKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gbmV3X21lc3M7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBQZW4odGlsZV9pZCwgY29vcmRzKXtcclxuXHRcdHZhciB0aWxlID0gVGlsZXMuZ2V0VGlsZSh0aWxlX2lkKTtcclxuXHRcdGlmKGlzX2Nvb3Jkcyhjb29yZHMsIHRpbGUuc2l6ZSkgJiYgaXNfZW1wdHkoY29vcmRzLCB0aWxlLnNpemUpKXtcclxuXHJcblx0XHRcdGZpbGxCb3godGlsZSwgY29vcmRzLCB0aWxlLnNpemUpO1xyXG5cdFx0XHRyZXR1cm4gW2Nvb3Jkc107XHJcblx0XHR9ZWxzZSByZXR1cm4gW107XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBDbGVhcihjb29yZHMpe1xyXG5cdFx0aWYoaXNfY29vcmRzKGNvb3JkcykgJiYgIWlzX2VtcHR5KGNvb3Jkcykpe1xyXG5cdFx0XHRjb29yZHMgPSBjbGVhckJveChtYXBbY29vcmRzLnpdW2Nvb3Jkcy55XVtjb29yZHMueF0pO1xyXG5cdFx0XHRyZXR1cm4gW2Nvb3Jkc107XHJcblx0XHR9ZWxzZSByZXR1cm4gW107XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBmaWxsQm94KHRpbGUsIGNvb3Jkcywgc2l6ZSl7XHJcblx0XHR2YXIgYm94ID0ge2Nvb3JkczogY29vcmRzLCBzaXplOiB0aWxlLnNpemUsIHRpbGVfaWQ6IHRpbGUuaWR9O1xyXG5cdFx0dmFyIHNpemUgPSB0aWxlLnNpemU7XHJcblxyXG5cdFx0Zm9yKHZhciBpID0gc2l6ZSAtIDE7IGkgPj0gMDsgaS0tKXtcclxuXHRcdFx0Zm9yKHZhciBqID0gc2l6ZSAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0XHRtYXBbY29vcmRzLnpdW2Nvb3Jkcy55ICsgal1bY29vcmRzLnggKyBpXSA9IGJveDtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cclxuXHRcdHJldHVybiBjb29yZHM7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBjbGVhckJveChib3gpe1xyXG5cdFx0dmFyIGNvb3JkcyA9IGJveC5jb29yZHM7XHJcblx0XHR2YXIgc2l6ZSA9IGJveC5zaXplO1xyXG5cclxuXHRcdGZvcih2YXIgaSA9IHNpemUgLSAxOyBpID49IDA7IGktLSl7XHJcblx0XHRcdGZvcih2YXIgaiA9IHNpemUgLSAxOyBqID49IDA7IGotLSl7XHJcblx0XHRcdFx0bWFwW2Nvb3Jkcy56XVtjb29yZHMueSArIGpdW2Nvb3Jkcy54ICsgaV0gPSBudWxsO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRyZXR1cm4gY29vcmRzO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNfY29vcmRzKGNvb3Jkcywgc2l6ZT0xKXtcclxuXHRcdHJldHVybiBjb29yZHMgXHJcblx0XHQmJiBtYXBbY29vcmRzLnpdIFxyXG5cdFx0JiYgbWFwW2Nvb3Jkcy56XVtjb29yZHMueV0gXHJcblx0XHQmJiBtYXBbY29vcmRzLnpdW2Nvb3Jkcy55ICsgc2l6ZSAtIDFdXHJcblx0XHQmJiBtYXBbY29vcmRzLnpdW2Nvb3Jkcy55XVtjb29yZHMueF0gIT09IHVuZGVmaW5lZFxyXG5cdFx0JiYgbWFwW2Nvb3Jkcy56XVtjb29yZHMueSArIHNpemUgLSAxXVtjb29yZHMueCArIHNpemUgLSAxXSAhPT0gdW5kZWZpbmVkO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gaXNfZW1wdHkoY29vcmRzLCBzaXplPTEpe1xyXG5cdFx0Zm9yKHZhciBpID0gc2l6ZSAtIDE7IGkgPj0gMDsgaS0tKXtcclxuXHRcdFx0Zm9yKHZhciBqID0gc2l6ZSAtIDE7IGogPj0gMDsgai0tKXtcclxuXHRcdFx0XHRpZihtYXBbY29vcmRzLnpdW2Nvb3Jkcy55ICsgal1bY29vcmRzLnggKyBpXSAhPT0gbnVsbClcclxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fVxyXG5cdFx0cmV0dXJuIHRydWU7XHJcblx0fVxyXG59XHJcblxyXG52YXIgVGlsZU1hcCA9IG5ldyBDck1hcChtYXBfc2l6ZSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIENyTG9naWMoSW50ZXIpe1xyXG5cdHZhciBzZW5kID0gSW50ZXIuY29ubmVjdChyZWNlaXZlKTtcclxuXHRzZW5kKFRpbGVNYXAubG9hZCgpKTtcclxuXHJcblx0ZnVuY3Rpb24gcmVjZWl2ZShtZXNzKXtcclxuXHRcdHN3aXRjaChtZXNzLnR5cGUpe1xyXG5cdFx0XHRjYXNlIFwiVGlsZVwiOiByZWNlaXZlVGlsZXMobWVzcyk7IGJyZWFrO1xyXG5cdFx0XHRjYXNlIFwiTWFwXCI6IHJlY2VpdmVNYXAobWVzcyk7IGJyZWFrO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVjZWl2ZVRpbGVzKG1lc3Mpe1xyXG5cdFx0c3dpdGNoKG1lc3MuYWN0aW9uKXtcclxuXHRcdFx0Y2FzZSBcIkFkZFwiOiAgXHJcblx0XHRcdFx0bWVzcy50aWxlID0gVGlsZXMuYWRkKG1lc3MudGlsZSk7XHJcblx0XHRcdFx0c2VuZChtZXNzKTtcclxuXHRcdFx0XHRicmVhaztcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlY2VpdmVNYXAobWVzcyl7XHJcblx0XHRzd2l0Y2gobWVzcy5hY3Rpb24pe1xyXG5cdFx0XHQgY2FzZSBcIkRyYXdcIjpcclxuXHRcdFx0IFx0bWVzcyA9IFRpbGVNYXAuZHJhdyhtZXNzKTtcclxuXHRcdFx0IFx0c2VuZChtZXNzKTtcclxuXHRcdFx0IFx0YnJlYWs7XHJcblx0XHR9XHJcblx0fVxyXG59XHJcbiIsInJlcXVpcmUoXCJ0eXBlc2pzXCIpO1xyXG5yZXF1aXJlKFwidHlwZXNqcy9zdHJfdHlwZVwiKTtcclxuXHJcbnZhciB0eXBlc19kdXJhYmlsaXR5ID0gcmVxdWlyZShcIi4vdHlwZXNfZHVyYWJpbGl0eS5qc29uXCIpO1xyXG5cclxudmFyIFQgPSBPYmplY3QudHlwZXM7XHJcblxyXG52YXIgdGlsZV9pZF90eXBlID0gVC5wb3MoMjU2KTtcclxudmFyIGNvb3Jkc190eXBlID0ge3g6IFQucG9zKDIwKSwgeTogVC5wb3MoMjApLCB6OiBULnBvcygyKX07XHJcblxyXG52YXIgdGlsZV90eXBlID0gVC5vYmooe1xyXG5cdFx0aWQ6IFQuYW55KHVuZGVmaW5lZCwgdGlsZV9pZF90eXBlKSxcclxuXHRcdGltYWdlczogVC5hcnIoVC5zdHIoL15bXFx3XFxkXFxzKzo7Liw/PSNcXC88PlwiKCktXSokLywgMTAyNCoxMDI0KSksXHJcblx0XHR0eXBlOiBULmFueShPYmplY3QudmFsdWVzKHR5cGVzX2R1cmFiaWxpdHkpKSxcclxuXHRcdHNpemU6IFQucG9zKDIwKVxyXG59KTtcclxuXHJcbnZhciBuZXdfdGlsZV9tZXNzX3R5cGUgPSBULm9iaih7XHJcblx0YWN0aW9uOiBcIkFkZFwiLFxyXG5cdHR5cGU6IFwiVGlsZVwiLFxyXG5cdHRpbGU6IHRpbGVfdHlwZVxyXG59KTtcclxuXHJcbnZhciBtYXBfc2l6ZV90eXBlID0gVC5vYmooe1xyXG5cdHdpZHRoOiAyMCwgXHJcblx0aGVpZ2h0OiAyMCwgXHJcblx0bGF5ZXJzOiAyXHJcbn0pO1xyXG5cclxudmFyIG5ld19tYXBfbWVzc190eXBlID0gVC5vYmooe1xyXG5cdGFjdGlvbjogXCJDcmVhdGVcIixcclxuXHR0eXBlOiBcIk1hcFwiLFxyXG5cdHNpemVzOiBtYXBfc2l6ZV90eXBlXHJcbn0pO1xyXG5cclxudmFyIGRyYXdfbWVzc190eXBlID0ge1xyXG5cdGFjdGlvbjogXCJEcmF3XCIsXHJcblx0dHlwZTogXCJNYXBcIixcclxuXHR0b29sOiBcIlBlblwiLFxyXG5cdGNvb3JkczogY29vcmRzX3R5cGUsXHJcblx0dGlsZV9pZDogdGlsZV9pZF90eXBlXHJcbn07XHJcblxyXG52YXIgY2xlYXJfbWVzc190eXBlID0ge1xyXG5cdGFjdGlvbjogXCJEcmF3XCIsXHJcblx0dHlwZTogXCJNYXBcIixcclxuXHR0b29sOiBcIkNsZWFyXCIsXHJcblx0Y29vcmRzOiBjb29yZHNfdHlwZVxyXG59O1xyXG5cclxudmFyIGNsZWFyX21lc3NfdHlwZV9mb3JfZGlzcGxheSA9IHtcclxuXHRhY3Rpb246IFwiRHJhd1wiLFxyXG5cdHR5cGU6IFwiTWFwXCIsXHJcblx0dG9vbDogXCJDbGVhclwiLFxyXG5cdGNvb3JkczogVC5hcnIoY29vcmRzX3R5cGUsIDIwLCBmYWxzZSlcclxufTtcclxuXHJcbnZhciBkcmF3X21lc3NfdHlwZV9mb3JfZGlzcGxheSA9IHtcclxuXHRhY3Rpb246IFwiRHJhd1wiLFxyXG5cdHR5cGU6IFwiTWFwXCIsXHJcblx0dG9vbDogXCJQZW5cIixcclxuXHRjb29yZHM6IFQuYXJyKGNvb3Jkc190eXBlLCAyMCwgZmFsc2UpLFxyXG5cdHRpbGVfaWQ6IHRpbGVfaWRfdHlwZVxyXG59O1xyXG5cclxudmFyIG1lc3NfdHlwZXNfb25lID0gVC5hbnkoW1xyXG5cdGRyYXdfbWVzc190eXBlLCBcclxuXHRuZXdfdGlsZV9tZXNzX3R5cGUsIFxyXG5cdGNsZWFyX21lc3NfdHlwZV0pO1xyXG5cclxudmFyIG1lc3NfdHlwZXNfdHdvID0gVC5hbnkoW1xyXG5cdGRyYXdfbWVzc190eXBlX2Zvcl9kaXNwbGF5LFxyXG5cdG5ld190aWxlX21lc3NfdHlwZSwgXHJcblx0bmV3X21hcF9tZXNzX3R5cGUsXHJcblx0Y2xlYXJfbWVzc190eXBlX2Zvcl9kaXNwbGF5XSk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFtcclxuXHRmdW5jdGlvbih2YWwpe1xyXG5cdFx0aWYobWVzc190eXBlc19vbmUudGVzdCh2YWwpKVxyXG5cdFx0XHR0aHJvdyBtZXNzX3R5cGVzX29uZS50ZXN0KHZhbCk7XHJcblx0fSwgXHJcblx0ZnVuY3Rpb24odmFsKXtcclxuXHRcdGlmKG1lc3NfdHlwZXNfdHdvLnRlc3QodmFsKSlcclxuXHRcdFx0dGhyb3cgbWVzc190eXBlc190d28udGVzdCh2YWwpO1xyXG5cdH1dO1xyXG4iLCJcclxuXHJcbmNvbnN0IENySW50ZXIgPSByZXF1aXJlKFwiLi9pbnRlci5qc1wiKTtcclxudmFyIFR5cGVzID0gcmVxdWlyZShcIi4vVHlwZXMuanNcIik7XHJcblxyXG5jb25zdCBEaXNwbGF5ID0gcmVxdWlyZShcIi4vRHJhdy9EaXNwbGF5LmpzXCIpO1xyXG5jb25zdCBDckxvZ2ljID0gcmVxdWlyZShcIi4vTG9naWMuanNcIik7XHJcblxyXG5jb25zdCBEaXNwbGF5SW50ZXIgPSBuZXcgQ3JJbnRlcigpO1xyXG5EaXNwbGF5SW50ZXIudGVzdChUeXBlcywgY29uc29sZS5sb2cpO1xyXG5cclxuRGlzcGxheShEaXNwbGF5SW50ZXIpO1xyXG5cclxuQ3JMb2dpYyhEaXNwbGF5SW50ZXIpO1xyXG5cclxuXHJcblxyXG5cclxuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBDckludGVyZmljZSh0ZXN0ZXMsIGxvZyl7XHJcblx0dmFyIGlzX3Rlc3QgPSBmYWxzZTtcclxuXHRcclxuXHR0aGlzLnRlc3QgPSBmdW5jdGlvbihuZXdfdGVzdGVzLCBuZXdfbG9nKXtcclxuXHRcdGlmKG5ld190ZXN0ZXMpe1xyXG5cdFx0XHRpZih0eXBlb2YobmV3X3Rlc3Rlc1swXSkgPT0gXCJmdW5jdGlvblwiIFxyXG5cdFx0XHQmJiB0eXBlb2YobmV3X3Rlc3Rlc1sxXSkgPT0gXCJmdW5jdGlvblwiKXtcclxuXHRcdFx0XHRcclxuXHRcdFx0XHR0ZXN0ZXMgPSBuZXdfdGVzdGVzO1xyXG5cdFx0XHRcdGlzX3Rlc3QgPSB0cnVlO1xyXG5cdFx0XHRcdFxyXG5cdFx0XHR9ZWxzZXtcclxuXHRcdFx0XHRjb25zb2xlLmVycm9yKG5ldyBFcnJvcihcIlRlc3QgaXMgbm90IGZ1bmN0aW9uIVwiKSk7XHJcblx0XHRcdFx0aXNfdGVzdCA9IGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHRpZihuZXdfbG9nKXtcclxuXHRcdFx0aWYodHlwZW9mIG5ld19sb2cgPT0gXCJmdW5jdGlvblwiKSBsb2cgPSBuZXdfbG9nOyBlbHNlIGxvZyA9IG51bGw7XHJcblx0XHR9XHJcblx0fVxyXG5cdFxyXG5cdGlmKHRlc3RlcykgdGhpcy50ZXN0KHRlc3RlcywgbG9nKTtcclxuXHRcclxuXHR2YXIgSW5wdXRPbmUgPSBudWxsO1xyXG5cdHZhciBPdXRwdXRPbmUgPSBudWxsO1xyXG5cdFxyXG5cdHRoaXMuY29ubmVjdCA9IGZ1bmN0aW9uKG91dHB1dEZ1bmMpe1xyXG5cdFx0aWYoT3V0cHV0T25lKXtcclxuXHRcdFx0aWYoaXNfdGVzdCl7XHJcblx0XHRcdFx0dmFyIGJlZ0Z1bmMgPSBvdXRwdXRGdW5jO1xyXG5cdFx0XHRcdG91dHB1dEZ1bmMgPSBmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHRcdFx0dGVzdGVzWzBdKHZhbCk7XHJcblx0XHRcdFx0XHRpZihsb2cpIGxvZyhcIiBPbmU6IFwiLCB2YWwpO1xyXG5cdFx0XHRcdFx0YmVnRnVuYyh2YWwpO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0fVxyXG5cdFx0XHRyZXR1cm4gVHdvQ29ubmVjdChvdXRwdXRGdW5jKTtcclxuXHRcdH1cclxuXHRcdGVsc2V7XHJcblx0XHRcdGlmKGlzX3Rlc3Qpe1xyXG5cdFx0XHRcdHZhciBiZWdGdW5jID0gb3V0cHV0RnVuYztcclxuXHRcdFx0XHRvdXRwdXRGdW5jID0gZnVuY3Rpb24odmFsKXtcclxuXHRcdFx0XHRcdHRlc3Rlc1sxXSh2YWwpO1xyXG5cdFx0XHRcdFx0aWYobG9nKSBsb2coXCIgVHdvOiBcIiwgdmFsKTtcclxuXHRcdFx0XHRcdGJlZ0Z1bmModmFsKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdFx0cmV0dXJuIE9uZUNvbm5lY3Qob3V0cHV0RnVuYyk7XHJcblx0XHR9XHJcblx0fTtcclxuXHRcclxuXHRmdW5jdGlvbiBPbmVDb25uZWN0KG91dHB1dEZ1bmMpe1xyXG5cdFx0T3V0cHV0T25lID0gb3V0cHV0RnVuYztcclxuXHRcdElucHV0T25lID0gQ3JIb2FyZGVyKCk7XHJcblx0XHRcclxuXHRcdHJldHVybiBmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHRJbnB1dE9uZSh2YWwpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHRcclxuXHRmdW5jdGlvbiBUd29Db25uZWN0KG91dHB1dEZ1bmMpe1xyXG5cdFx0aWYoSW5wdXRPbmUudGFrZSkgSW5wdXRPbmUudGFrZShvdXRwdXRGdW5jKTtcclxuXHRcdElucHV0T25lID0gb3V0cHV0RnVuYztcclxuXHRcdFxyXG5cdFx0cmV0dXJuIE91dHB1dE9uZTtcclxuXHR9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIENySG9hcmRlcigpe1xyXG5cdHZhciBob2FyZGVyID0gW107XHJcblx0XHJcblx0dmFyIHB1c2ggPSBmdW5jdGlvbih2YWwpe1xyXG5cdFx0aG9hcmRlci5wdXNoKHZhbCk7XHJcblx0fTtcclxuXHRcclxuXHRwdXNoLnRha2UgPSBmdW5jdGlvbihmdW5jKXtcclxuXHRcdGlmKHR5cGVvZiBmdW5jICE9IFwiZnVuY3Rpb25cIikgcmV0dXJuIGhvYXJkZXI7XHJcblx0XHRcclxuXHRcdGhvYXJkZXIuZm9yRWFjaChmdW5jdGlvbih2YWwpe1xyXG5cdFx0XHRcdGZ1bmModmFsKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHRcclxuXHRyZXR1cm4gcHVzaDtcclxufSIsIi8qXG4gKiAgYmFzZTY0LmpzXG4gKlxuICogIExpY2Vuc2VkIHVuZGVyIHRoZSBCU0QgMy1DbGF1c2UgTGljZW5zZS5cbiAqICAgIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqXG4gKiAgUmVmZXJlbmNlczpcbiAqICAgIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFzZTY0XG4gKi9cbjsoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJ1xuICAgICAgICA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShnbG9iYWwpXG4gICAgICAgIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kXG4gICAgICAgID8gZGVmaW5lKGZhY3RvcnkpIDogZmFjdG9yeShnbG9iYWwpXG59KChcbiAgICB0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgPyBzZWxmXG4gICAgICAgIDogdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3dcbiAgICAgICAgOiB0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJyA/IGdsb2JhbFxuOiB0aGlzXG4pLCBmdW5jdGlvbihnbG9iYWwpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gZXhpc3RpbmcgdmVyc2lvbiBmb3Igbm9Db25mbGljdCgpXG4gICAgZ2xvYmFsID0gZ2xvYmFsIHx8IHt9O1xuICAgIHZhciBfQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB2YXIgdmVyc2lvbiA9IFwiMi41LjFcIjtcbiAgICAvLyBpZiBub2RlLmpzIGFuZCBOT1QgUmVhY3QgTmF0aXZlLCB3ZSB1c2UgQnVmZmVyXG4gICAgdmFyIGJ1ZmZlcjtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGJ1ZmZlciA9IGV2YWwoXCJyZXF1aXJlKCdidWZmZXInKS5CdWZmZXJcIik7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgYnVmZmVyID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIGNvbnN0YW50c1xuICAgIHZhciBiNjRjaGFyc1xuICAgICAgICA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcbiAgICB2YXIgYjY0dGFiID0gZnVuY3Rpb24oYmluKSB7XG4gICAgICAgIHZhciB0ID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gYmluLmxlbmd0aDsgaSA8IGw7IGkrKykgdFtiaW4uY2hhckF0KGkpXSA9IGk7XG4gICAgICAgIHJldHVybiB0O1xuICAgIH0oYjY0Y2hhcnMpO1xuICAgIHZhciBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuICAgIC8vIGVuY29kZXIgc3R1ZmZcbiAgICB2YXIgY2JfdXRvYiA9IGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgaWYgKGMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdmFyIGNjID0gYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgICAgcmV0dXJuIGNjIDwgMHg4MCA/IGNcbiAgICAgICAgICAgICAgICA6IGNjIDwgMHg4MDAgPyAoZnJvbUNoYXJDb2RlKDB4YzAgfCAoY2MgPj4+IDYpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKGNjICYgMHgzZikpKVxuICAgICAgICAgICAgICAgIDogKGZyb21DaGFyQ29kZSgweGUwIHwgKChjYyA+Pj4gMTIpICYgMHgwZikpXG4gICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICgoY2MgPj4+ICA2KSAmIDB4M2YpKVxuICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoIGNjICAgICAgICAgJiAweDNmKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGNjID0gMHgxMDAwMFxuICAgICAgICAgICAgICAgICsgKGMuY2hhckNvZGVBdCgwKSAtIDB4RDgwMCkgKiAweDQwMFxuICAgICAgICAgICAgICAgICsgKGMuY2hhckNvZGVBdCgxKSAtIDB4REMwMCk7XG4gICAgICAgICAgICByZXR1cm4gKGZyb21DaGFyQ29kZSgweGYwIHwgKChjYyA+Pj4gMTgpICYgMHgwNykpXG4gICAgICAgICAgICAgICAgICAgICsgZnJvbUNoYXJDb2RlKDB4ODAgfCAoKGNjID4+PiAxMikgJiAweDNmKSlcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoMHg4MCB8ICgoY2MgPj4+ICA2KSAmIDB4M2YpKVxuICAgICAgICAgICAgICAgICAgICArIGZyb21DaGFyQ29kZSgweDgwIHwgKCBjYyAgICAgICAgICYgMHgzZikpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIHJlX3V0b2IgPSAvW1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGRl18W15cXHgwMC1cXHg3Rl0vZztcbiAgICB2YXIgdXRvYiA9IGZ1bmN0aW9uKHUpIHtcbiAgICAgICAgcmV0dXJuIHUucmVwbGFjZShyZV91dG9iLCBjYl91dG9iKTtcbiAgICB9O1xuICAgIHZhciBjYl9lbmNvZGUgPSBmdW5jdGlvbihjY2MpIHtcbiAgICAgICAgdmFyIHBhZGxlbiA9IFswLCAyLCAxXVtjY2MubGVuZ3RoICUgM10sXG4gICAgICAgIG9yZCA9IGNjYy5jaGFyQ29kZUF0KDApIDw8IDE2XG4gICAgICAgICAgICB8ICgoY2NjLmxlbmd0aCA+IDEgPyBjY2MuY2hhckNvZGVBdCgxKSA6IDApIDw8IDgpXG4gICAgICAgICAgICB8ICgoY2NjLmxlbmd0aCA+IDIgPyBjY2MuY2hhckNvZGVBdCgyKSA6IDApKSxcbiAgICAgICAgY2hhcnMgPSBbXG4gICAgICAgICAgICBiNjRjaGFycy5jaGFyQXQoIG9yZCA+Pj4gMTgpLFxuICAgICAgICAgICAgYjY0Y2hhcnMuY2hhckF0KChvcmQgPj4+IDEyKSAmIDYzKSxcbiAgICAgICAgICAgIHBhZGxlbiA+PSAyID8gJz0nIDogYjY0Y2hhcnMuY2hhckF0KChvcmQgPj4+IDYpICYgNjMpLFxuICAgICAgICAgICAgcGFkbGVuID49IDEgPyAnPScgOiBiNjRjaGFycy5jaGFyQXQob3JkICYgNjMpXG4gICAgICAgIF07XG4gICAgICAgIHJldHVybiBjaGFycy5qb2luKCcnKTtcbiAgICB9O1xuICAgIHZhciBidG9hID0gZ2xvYmFsLmJ0b2EgPyBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiBnbG9iYWwuYnRvYShiKTtcbiAgICB9IDogZnVuY3Rpb24oYikge1xuICAgICAgICByZXR1cm4gYi5yZXBsYWNlKC9bXFxzXFxTXXsxLDN9L2csIGNiX2VuY29kZSk7XG4gICAgfTtcbiAgICB2YXIgX2VuY29kZSA9IGJ1ZmZlciA/XG4gICAgICAgIGJ1ZmZlci5mcm9tICYmIFVpbnQ4QXJyYXkgJiYgYnVmZmVyLmZyb20gIT09IFVpbnQ4QXJyYXkuZnJvbVxuICAgICAgICA/IGZ1bmN0aW9uICh1KSB7XG4gICAgICAgICAgICByZXR1cm4gKHUuY29uc3RydWN0b3IgPT09IGJ1ZmZlci5jb25zdHJ1Y3RvciA/IHUgOiBidWZmZXIuZnJvbSh1KSlcbiAgICAgICAgICAgICAgICAudG9TdHJpbmcoJ2Jhc2U2NCcpXG4gICAgICAgIH1cbiAgICAgICAgOiAgZnVuY3Rpb24gKHUpIHtcbiAgICAgICAgICAgIHJldHVybiAodS5jb25zdHJ1Y3RvciA9PT0gYnVmZmVyLmNvbnN0cnVjdG9yID8gdSA6IG5ldyAgYnVmZmVyKHUpKVxuICAgICAgICAgICAgICAgIC50b1N0cmluZygnYmFzZTY0JylcbiAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uICh1KSB7IHJldHVybiBidG9hKHV0b2IodSkpIH1cbiAgICA7XG4gICAgdmFyIGVuY29kZSA9IGZ1bmN0aW9uKHUsIHVyaXNhZmUpIHtcbiAgICAgICAgcmV0dXJuICF1cmlzYWZlXG4gICAgICAgICAgICA/IF9lbmNvZGUoU3RyaW5nKHUpKVxuICAgICAgICAgICAgOiBfZW5jb2RlKFN0cmluZyh1KSkucmVwbGFjZSgvWytcXC9dL2csIGZ1bmN0aW9uKG0wKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0wID09ICcrJyA/ICctJyA6ICdfJztcbiAgICAgICAgICAgIH0pLnJlcGxhY2UoLz0vZywgJycpO1xuICAgIH07XG4gICAgdmFyIGVuY29kZVVSSSA9IGZ1bmN0aW9uKHUpIHsgcmV0dXJuIGVuY29kZSh1LCB0cnVlKSB9O1xuICAgIC8vIGRlY29kZXIgc3R1ZmZcbiAgICB2YXIgcmVfYnRvdSA9IG5ldyBSZWdFeHAoW1xuICAgICAgICAnW1xceEMwLVxceERGXVtcXHg4MC1cXHhCRl0nLFxuICAgICAgICAnW1xceEUwLVxceEVGXVtcXHg4MC1cXHhCRl17Mn0nLFxuICAgICAgICAnW1xceEYwLVxceEY3XVtcXHg4MC1cXHhCRl17M30nXG4gICAgXS5qb2luKCd8JyksICdnJyk7XG4gICAgdmFyIGNiX2J0b3UgPSBmdW5jdGlvbihjY2NjKSB7XG4gICAgICAgIHN3aXRjaChjY2NjLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgICB2YXIgY3AgPSAoKDB4MDcgJiBjY2NjLmNoYXJDb2RlQXQoMCkpIDw8IDE4KVxuICAgICAgICAgICAgICAgIHwgICAgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDEpKSA8PCAxMilcbiAgICAgICAgICAgICAgICB8ICAgICgoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgyKSkgPDwgIDYpXG4gICAgICAgICAgICAgICAgfCAgICAgKDB4M2YgJiBjY2NjLmNoYXJDb2RlQXQoMykpLFxuICAgICAgICAgICAgb2Zmc2V0ID0gY3AgLSAweDEwMDAwO1xuICAgICAgICAgICAgcmV0dXJuIChmcm9tQ2hhckNvZGUoKG9mZnNldCAgPj4+IDEwKSArIDB4RDgwMClcbiAgICAgICAgICAgICAgICAgICAgKyBmcm9tQ2hhckNvZGUoKG9mZnNldCAmIDB4M0ZGKSArIDB4REMwMCkpO1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICByZXR1cm4gZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgICAgICgoMHgwZiAmIGNjY2MuY2hhckNvZGVBdCgwKSkgPDwgMTIpXG4gICAgICAgICAgICAgICAgICAgIHwgKCgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDEpKSA8PCA2KVxuICAgICAgICAgICAgICAgICAgICB8ICAoMHgzZiAmIGNjY2MuY2hhckNvZGVBdCgyKSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gIGZyb21DaGFyQ29kZShcbiAgICAgICAgICAgICAgICAoKDB4MWYgJiBjY2NjLmNoYXJDb2RlQXQoMCkpIDw8IDYpXG4gICAgICAgICAgICAgICAgICAgIHwgICgweDNmICYgY2NjYy5jaGFyQ29kZUF0KDEpKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIGJ0b3UgPSBmdW5jdGlvbihiKSB7XG4gICAgICAgIHJldHVybiBiLnJlcGxhY2UocmVfYnRvdSwgY2JfYnRvdSk7XG4gICAgfTtcbiAgICB2YXIgY2JfZGVjb2RlID0gZnVuY3Rpb24oY2NjYykge1xuICAgICAgICB2YXIgbGVuID0gY2NjYy5sZW5ndGgsXG4gICAgICAgIHBhZGxlbiA9IGxlbiAlIDQsXG4gICAgICAgIG4gPSAobGVuID4gMCA/IGI2NHRhYltjY2NjLmNoYXJBdCgwKV0gPDwgMTggOiAwKVxuICAgICAgICAgICAgfCAobGVuID4gMSA/IGI2NHRhYltjY2NjLmNoYXJBdCgxKV0gPDwgMTIgOiAwKVxuICAgICAgICAgICAgfCAobGVuID4gMiA/IGI2NHRhYltjY2NjLmNoYXJBdCgyKV0gPDwgIDYgOiAwKVxuICAgICAgICAgICAgfCAobGVuID4gMyA/IGI2NHRhYltjY2NjLmNoYXJBdCgzKV0gICAgICAgOiAwKSxcbiAgICAgICAgY2hhcnMgPSBbXG4gICAgICAgICAgICBmcm9tQ2hhckNvZGUoIG4gPj4+IDE2KSxcbiAgICAgICAgICAgIGZyb21DaGFyQ29kZSgobiA+Pj4gIDgpICYgMHhmZiksXG4gICAgICAgICAgICBmcm9tQ2hhckNvZGUoIG4gICAgICAgICAmIDB4ZmYpXG4gICAgICAgIF07XG4gICAgICAgIGNoYXJzLmxlbmd0aCAtPSBbMCwgMCwgMiwgMV1bcGFkbGVuXTtcbiAgICAgICAgcmV0dXJuIGNoYXJzLmpvaW4oJycpO1xuICAgIH07XG4gICAgdmFyIF9hdG9iID0gZ2xvYmFsLmF0b2IgPyBmdW5jdGlvbihhKSB7XG4gICAgICAgIHJldHVybiBnbG9iYWwuYXRvYihhKTtcbiAgICB9IDogZnVuY3Rpb24oYSl7XG4gICAgICAgIHJldHVybiBhLnJlcGxhY2UoL1xcU3sxLDR9L2csIGNiX2RlY29kZSk7XG4gICAgfTtcbiAgICB2YXIgYXRvYiA9IGZ1bmN0aW9uKGEpIHtcbiAgICAgICAgcmV0dXJuIF9hdG9iKFN0cmluZyhhKS5yZXBsYWNlKC9bXkEtWmEtejAtOVxcK1xcL10vZywgJycpKTtcbiAgICB9O1xuICAgIHZhciBfZGVjb2RlID0gYnVmZmVyID9cbiAgICAgICAgYnVmZmVyLmZyb20gJiYgVWludDhBcnJheSAmJiBidWZmZXIuZnJvbSAhPT0gVWludDhBcnJheS5mcm9tXG4gICAgICAgID8gZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgPyBhIDogYnVmZmVyLmZyb20oYSwgJ2Jhc2U2NCcpKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIDogZnVuY3Rpb24oYSkge1xuICAgICAgICAgICAgcmV0dXJuIChhLmNvbnN0cnVjdG9yID09PSBidWZmZXIuY29uc3RydWN0b3JcbiAgICAgICAgICAgICAgICAgICAgPyBhIDogbmV3IGJ1ZmZlcihhLCAnYmFzZTY0JykpLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICAgICAgOiBmdW5jdGlvbihhKSB7IHJldHVybiBidG91KF9hdG9iKGEpKSB9O1xuICAgIHZhciBkZWNvZGUgPSBmdW5jdGlvbihhKXtcbiAgICAgICAgcmV0dXJuIF9kZWNvZGUoXG4gICAgICAgICAgICBTdHJpbmcoYSkucmVwbGFjZSgvWy1fXS9nLCBmdW5jdGlvbihtMCkgeyByZXR1cm4gbTAgPT0gJy0nID8gJysnIDogJy8nIH0pXG4gICAgICAgICAgICAgICAgLnJlcGxhY2UoL1teQS1aYS16MC05XFwrXFwvXS9nLCAnJylcbiAgICAgICAgKTtcbiAgICB9O1xuICAgIHZhciBub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBCYXNlNjQgPSBnbG9iYWwuQmFzZTY0O1xuICAgICAgICBnbG9iYWwuQmFzZTY0ID0gX0Jhc2U2NDtcbiAgICAgICAgcmV0dXJuIEJhc2U2NDtcbiAgICB9O1xuICAgIC8vIGV4cG9ydCBCYXNlNjRcbiAgICBnbG9iYWwuQmFzZTY0ID0ge1xuICAgICAgICBWRVJTSU9OOiB2ZXJzaW9uLFxuICAgICAgICBhdG9iOiBhdG9iLFxuICAgICAgICBidG9hOiBidG9hLFxuICAgICAgICBmcm9tQmFzZTY0OiBkZWNvZGUsXG4gICAgICAgIHRvQmFzZTY0OiBlbmNvZGUsXG4gICAgICAgIHV0b2I6IHV0b2IsXG4gICAgICAgIGVuY29kZTogZW5jb2RlLFxuICAgICAgICBlbmNvZGVVUkk6IGVuY29kZVVSSSxcbiAgICAgICAgYnRvdTogYnRvdSxcbiAgICAgICAgZGVjb2RlOiBkZWNvZGUsXG4gICAgICAgIG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3QsXG4gICAgICAgIF9fYnVmZmVyX186IGJ1ZmZlclxuICAgIH07XG4gICAgLy8gaWYgRVM1IGlzIGF2YWlsYWJsZSwgbWFrZSBCYXNlNjQuZXh0ZW5kU3RyaW5nKCkgYXZhaWxhYmxlXG4gICAgaWYgKHR5cGVvZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdmFyIG5vRW51bSA9IGZ1bmN0aW9uKHYpe1xuICAgICAgICAgICAgcmV0dXJuIHt2YWx1ZTp2LGVudW1lcmFibGU6ZmFsc2Usd3JpdGFibGU6dHJ1ZSxjb25maWd1cmFibGU6dHJ1ZX07XG4gICAgICAgIH07XG4gICAgICAgIGdsb2JhbC5CYXNlNjQuZXh0ZW5kU3RyaW5nID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KFxuICAgICAgICAgICAgICAgIFN0cmluZy5wcm90b3R5cGUsICdmcm9tQmFzZTY0Jywgbm9FbnVtKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlY29kZSh0aGlzKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBTdHJpbmcucHJvdG90eXBlLCAndG9CYXNlNjQnLCBub0VudW0oZnVuY3Rpb24gKHVyaXNhZmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVuY29kZSh0aGlzLCB1cmlzYWZlKVxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShcbiAgICAgICAgICAgICAgICBTdHJpbmcucHJvdG90eXBlLCAndG9CYXNlNjRVUkknLCBub0VudW0oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW5jb2RlKHRoaXMsIHRydWUpXG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICAvL1xuICAgIC8vIGV4cG9ydCBCYXNlNjQgdG8gdGhlIG5hbWVzcGFjZVxuICAgIC8vXG4gICAgaWYgKGdsb2JhbFsnTWV0ZW9yJ10pIHsgLy8gTWV0ZW9yLmpzXG4gICAgICAgIEJhc2U2NCA9IGdsb2JhbC5CYXNlNjQ7XG4gICAgfVxuICAgIC8vIG1vZHVsZS5leHBvcnRzIGFuZCBBTUQgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS5cbiAgICAvLyBtb2R1bGUuZXhwb3J0cyBoYXMgcHJlY2VkZW5jZS5cbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMuQmFzZTY0ID0gZ2xvYmFsLkJhc2U2NDtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpeyByZXR1cm4gZ2xvYmFsLkJhc2U2NCB9KTtcbiAgICB9XG4gICAgLy8gdGhhdCdzIGl0IVxuICAgIHJldHVybiB7QmFzZTY0OiBnbG9iYWwuQmFzZTY0fVxufSkpO1xuIiwiLy9DcmFmIFN0cmluZ1xuKGZ1bmN0aW9uKCl7XG5cdGlmKHR5cGVvZihPYmplY3QudHlwZXMpICE9PSBcIm9iamVjdFwiKSByZXR1cm47XG5cblx0dmFyIFQgPSBPYmplY3QudHlwZXM7XG5cdHZhciBEb2MgPSBULmRvYztcblxuXHRmdW5jdGlvbiByZXBsYWNlU3BlY0NoYXIoYyl7XG5cdFx0c3dpdGNoKGMpe1xuXHRcdFx0Y2FzZSAndyc6IHJldHVybiAnYS16QS1aMC05Xyc7XG5cdFx0XHRjYXNlICdkJzogcmV0dXJuICcwLTknO1xuXHRcdFx0Y2FzZSAncyc6IHJldHVybiAnXFxcXHRcXFxcblxcXFx2XFxcXGZcXFxcciAnO1xuXG5cdFx0XHRkZWZhdWx0OiByZXR1cm4gYztcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiByYW5nZUluQXJyKGJlZywgZW5kKXtcblx0XHRpZihiZWcgPiBlbmQpe1xuXHRcdFx0dmFyIHRtcCA9IGJlZztcblx0XHRcdGJlZyA9IGVuZDtcblx0XHRcdGVuZCA9IHRtcDtcblx0XHR9XG5cblx0XHR2YXIgYXJyID0gW107XG5cdFx0Zm9yKHZhciBpID0gYmVnOyBpIDw9IGVuZDsgaSsrKXtcblx0XHRcdGFyci5wdXNoKGkpO1xuXHRcdH1cblxuXHRcdHJldHVybiBhcnI7XG5cdH1cblxuXHRmdW5jdGlvbiBwYXJzZVJhbmdlKHBhcnNlX3N0cil7XG5cdFx0aWYoL1xcXFwuLy50ZXN0KHBhcnNlX3N0cikpe1xuXHRcdFx0XHRwYXJzZV9zdHIgPSBwYXJzZV9zdHIucmVwbGFjZSgvXFxcXCguKS9nLCBmdW5jdGlvbihzdHIsIGNoYXIpeyByZXR1cm4gcmVwbGFjZVNwZWNDaGFyKGNoYXIpO30pO1xuXHRcdH1cblxuXHRcdHZhciByZXN1bHQgPSBbXTtcblxuXHRcdHZhciBiZWdfY2hhciA9IHBhcnNlX3N0clswXTtcblx0XHRmb3IodmFyIGkgPSAxOyBpIDw9IHBhcnNlX3N0ci5sZW5ndGg7IGkrKyl7XG5cblx0XHRcdGlmKHBhcnNlX3N0cltpLTFdICE9PSAnXFxcXCdcblx0XHRcdFx0JiZwYXJzZV9zdHJbaV0gPT09ICctJ1xuXHRcdFx0XHQmJnBhcnNlX3N0cltpKzFdKXtcblx0XHRcdFx0aSsrO1xuXHRcdFx0XHR2YXIgZW5kX2NoYXIgPSBwYXJzZV9zdHJbaV07XG5cblx0XHRcdFx0dmFyIGFycl9jaGFycyA9IHJhbmdlSW5BcnIoYmVnX2NoYXIuY2hhckNvZGVBdCgwKSwgZW5kX2NoYXIuY2hhckNvZGVBdCgwKSk7XG5cdFx0XHRcdHJlc3VsdCA9IHJlc3VsdC5jb25jYXQoYXJyX2NoYXJzKTtcblxuXHRcdFx0XHRpKys7XG5cdFx0XHR9ZWxzZXtcblx0XHRcdFx0cmVzdWx0LnB1c2goYmVnX2NoYXIuY2hhckNvZGVBdCgwKSk7XG5cdFx0XHR9XG5cblx0XHRcdGJlZ19jaGFyID0gcGFyc2Vfc3RyW2ldO1xuXHRcdH1cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG5cblx0ZnVuY3Rpb24gcmFuZEluZGV4KGFycil7XG5cdFx0dmFyIHJhbmQgPSBNYXRoLnJvdW5kKChhcnIubGVuZ3RoIC0gMSkgKiBNYXRoLnJhbmRvbSgpKTtcblx0XHRyZXR1cm4gYXJyW3JhbmRdO1xuXHR9XG5cblx0ZnVuY3Rpb24gcmFuZENoYXJzKGNoYXJzX2Fyciwgc2l6ZSl7XG5cdFx0c2l6ZSA9IFQuaW50KHNpemUsIDEpLnJhbmQoKTtcblx0XHR2YXIgc3RyID0gJyc7XG5cdFx0d2hpbGUoc2l6ZSl7XG5cdFx0XHR2YXIgZGVyID0gcmFuZEluZGV4KGNoYXJzX2Fycik7XG5cdFx0XHRzdHIgKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGRlcik7XG5cdFx0XHRzaXplLS07XG5cdFx0fVxuXHRcdHJldHVybiBzdHI7XG5cdH1cblxuXHRmdW5jdGlvbiByYW5kU3RyKHJhbmdlLCBzaXplKXtcblxuXHRcdHZhciBwYXJzZV9yYW5nZSA9IChyYW5nZS5zb3VyY2UpLm1hdGNoKC9cXF5cXFsoKFxcXFxcXF18LikqKVxcXVxcKlxcJC8pO1xuXG5cdFx0aWYoIXBhcnNlX3JhbmdlKSB0aHJvdyBULmVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiByYW5nZShSZWdFeHAoL15bXFx3XS4kLykpLCBzaXplKDA8PW51bWJlciknKTtcblxuXHRcdHZhciBjaGFycyA9IHBhcnNlUmFuZ2UocGFyc2VfcmFuZ2VbMV0pO1xuXG5cdFx0cmV0dXJuIHJhbmRDaGFycy5iaW5kKG51bGwsIGNoYXJzLCBzaXplKTtcblxuXG5cdH1cblxuXHRmdW5jdGlvbiB0ZXN0U3RyKHJhbmdlLCBzaXplKXtcblx0XHRyZXR1cm4gZnVuY3Rpb24oc3RyKXtcblx0XHRcdGlmKHR5cGVvZihzdHIpICE9PSAnc3RyaW5nJyl7XG5cdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xuXHRcdFx0XHRlcnIucGFyYW1zID0gXCJWYWx1ZSBpcyBub3Qgc3RyaW5nIVwiO1xuXHRcdFx0XHRyZXR1cm4gZXJyO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihzdHIubGVuZ3RoID4gc2l6ZSl7XG5cdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xuXHRcdFx0XHRlcnIucGFyYW1zID0gXCJMZW5ndGggc3RyaW5nIGlzIHdyb25nIVwiO1xuXHRcdFx0XHRyZXR1cm4gZXJyO1xuXHRcdFx0fVxuXG5cdFx0XHRpZighcmFuZ2UudGVzdChzdHIpKXtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAgZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZG9jU3RyKHJhbmdlLCBzaXplKXtcblx0XHRyZXR1cm4gVC5kb2MuZ2VuLmJpbmQobnVsbCwgXCJzdHJcIiwgeyByYW5nZTogcmFuZ2UsIGxlbmd0aDogc2l6ZX0pO1xuXHR9XG5cblxuXHR2YXIgZGVmX3NpemUgPSAxNztcblx0dmFyIGRlZl9yYW5nZSA9IC9eW1xcd10qJC87XG5cblx0ZnVuY3Rpb24gbmV3U3RyKHJhbmdlLCBzaXplKXtcblx0XHRpZihyYW5nZSA9PT0gbnVsbCkgcmFuZ2UgPSBkZWZfcmFuZ2U7XG5cdFx0aWYoc2l6ZSA9PT0gdW5kZWZpbmVkKSBzaXplID0gZGVmX3NpemU7XG5cblx0XHRpZih0eXBlb2YgcmFuZ2UgPT0gXCJzdHJpbmdcIikgcmFuZ2UgPSBuZXcgUmVnRXhwKHJhbmdlKTtcblxuXG5cdFx0aWYoVC5wb3MudGVzdChzaXplKSB8fCAhKHJhbmdlIGluc3RhbmNlb2YgUmVnRXhwKSl7XG5cdFx0XHRcdHRocm93IFQuZXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IHJhbmdlKFJlZ0V4cCksIHNpemUoMDw9bnVtYmVyKScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRyYW5kOiByYW5kU3RyKHJhbmdlLCBzaXplKSxcblx0XHRcdHRlc3Q6IHRlc3RTdHIocmFuZ2UsIHNpemUpLFxuXHRcdFx0ZG9jOiBkb2NTdHIocmFuZ2UsIHNpemUpXG5cdFx0fTtcblx0fVxuXG5cblxuXHRULm5ld1R5cGUoJ3N0cicsXG5cdHtcblx0XHRuYW1lOiBcIlN0cmluZ1wiLFxuXHRcdGFyZzogW1wicmFuZ2VcIiwgXCJsZW5ndGhcIl0sXG5cdFx0cGFyYW1zOiB7XG5cdFx0XHRcdHJhbmdlOiB7dHlwZTogJ1JlZ0V4cCB8fCBzdHInLCBkZWZhdWx0X3ZhbHVlOiBkZWZfcmFuZ2V9LFxuXHRcdFx0XHRsZW5ndGg6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogZGVmX3NpemV9XG5cdFx0fVxuXHR9LFxuXHR7XG5cdFx0TmV3OiBuZXdTdHIsXG5cdFx0dGVzdDogdGVzdFN0cihkZWZfcmFuZ2UsIGRlZl9zaXplKSxcblx0XHRyYW5kOiByYW5kU3RyKGRlZl9yYW5nZSwgZGVmX3NpemUpLFxuXHRcdGRvYzogZG9jU3RyKGRlZl9yYW5nZSwgZGVmX3NpemUpXG5cdH0pO1xufSkoKTtcbiIsIid1c2Ugc3RyaWN0Jztcbm5ldyAoZnVuY3Rpb24oKXtcblxuXHRpZih0eXBlb2YoT2JqZWN0LnR5cGVzKSA9PSBcIm9iamVjdFwiKXtcblx0XHRyZXR1cm4gT2JqZWN0LnR5cGVzO1xuXHR9XG5cblx0aWYoUmVnRXhwLnByb3RvdHlwZS50b0pTT04gIT09IFwiZnVuY3Rpb25cIil7XG5cdFx0UmVnRXhwLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbigpeyByZXR1cm4gdGhpcy5zb3VyY2U7IH07XG5cdH1cblxuXHR2YXIgVCA9IHRoaXM7XG5cdHZhciBEb2MgPSB7XG5cdFx0dHlwZXM6e1xuXHRcdFx0J2Jvb2wnOntcblx0XHRcdFx0bmFtZTogXCJCb29sZWFuXCIsXG5cdFx0XHRcdGFyZzogW11cblx0XHRcdH0sXG5cdFx0XHQnY29uc3QnOiB7XG5cdFx0XHRcdG5hbWU6IFwiQ29uc3RhbnRcIixcblx0XHRcdFx0YXJnOiBbXCJ2YWx1ZVwiXSxcblx0XHRcdFx0cGFyYW1zOiB7IHZhbHVlOiB7dHlwZTogXCJTb21ldGhpbmdcIiwgZGVmYXVsdF92YWx1ZTogbnVsbH19XG5cdFx0XHR9LFxuXHRcdFx0J3Bvcyc6IHtcblx0XHRcdFx0bmFtZTogXCJQb3NpdGlvblwiLFxuXHRcdFx0XHRhcmc6IFsnbWF4J10sXG5cdFx0XHRcdHBhcmFtczoge21heDoge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiArMjE0NzQ4MzY0N319XG5cblx0XHRcdH0sXG5cblx0XHRcdCdpbnQnOiB7XG5cdFx0XHRcdG5hbWU6IFwiSW50ZWdlclwiLFxuXHRcdFx0XHRhcmc6IFtcIm1heFwiLCBcIm1pblwiLCBcInN0ZXBcIl0sXG5cdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdFx0bWF4OiB7dHlwZTogJ2ludCcsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fSxcblx0XHRcdFx0XHRcdG1pbjoge3R5cGU6ICdpbnQnLCBkZWZhdWx0X3ZhbHVlOiAtMjE0NzQ4MzY0OH0sXG5cdFx0XHRcdFx0XHRzdGVwOiB7dHlwZTogJ3BvcycsIGRlZmF1bHRfdmFsdWU6IDF9XG5cdFx0XHRcdFx0fVxuXHRcdFx0fSxcblxuXHRcdFx0J251bSc6IHtcblx0XHRcdFx0bmFtZTogXCJOdW1iZXJcIixcblx0XHRcdFx0YXJnOiBbXCJtYXhcIiwgXCJtaW5cIiwgXCJwcmVjaXNcIl0sXG5cdFx0XHRcdHBhcmFtczoge1xuXHRcdFx0XHRcdFx0bWF4OiB7dHlwZTogJ251bScsIGRlZmF1bHRfdmFsdWU6ICsyMTQ3NDgzNjQ3fSxcblx0XHRcdFx0XHRcdG1pbjoge3R5cGU6ICdudW0nLCBkZWZhdWx0X3ZhbHVlOiAtMjE0NzQ4MzY0OH0sXG5cdFx0XHRcdFx0XHRwcmVjaXM6IHt0eXBlOiAncG9zJywgZGVmYXVsdF92YWx1ZTogOX1cblx0XHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0J2Fycic6IHtcblx0XHRcdFx0bmFtZTogXCJBcnJheVwiLFxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCIsIFwic2l6ZVwiLCBcImZpeGVkXCJdLFxuXHRcdFx0XHRwYXJhbXM6IHtcblx0XHRcdFx0XHRcdHR5cGVzOiB7dHlwZTogXCJUeXBlIHx8IFtUeXBlLCBUeXBlLi4uXVwiLCBnZXQgZGVmYXVsdF92YWx1ZSgpe3JldHVybiBULnBvc319LFxuXHRcdFx0XHRcdFx0c2l6ZToge3R5cGU6ICdwb3MnLCBkZWZhdWx0X3ZhbHVlOiA3fSxcblx0XHRcdFx0XHRcdGZpeGVkOiB7dHlwZTogJ2Jvb2wnLCBkZWZhdWx0X3ZhbHVlOiB0cnVlfVxuXHRcdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnYW55Jzoge1xuXHRcdFx0XHRuYW1lOiBcIk1peFR5cGVcIixcblx0XHRcdFx0YXJnOiBbXCJ0eXBlc1wiXSxcblx0XHRcdFx0cGFyYW1zOiB7XG5cdFx0XHRcdFx0XHR0eXBlczoge3R5cGU6IFwiVHlwZSwgVHlwZS4uLiB8fCBbVHlwZSwgVHlwZS4uLl1cIiwgZ2V0IGRlZmF1bHRfdmFsdWUoKXtyZXR1cm4gW1QucG9zLCBULnN0cl19fVxuXHRcdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHQnb2JqJzoge1xuXHRcdFx0XHRuYW1lOiBcIk9iamVjdFwiLFxuXHRcdFx0XHRhcmc6IFtcInR5cGVzXCJdLFxuXHRcdFx0XHRwYXJhbXM6IHt0eXBlczoge3R5cGU6IFwiT2JqZWN0XCIsIGRlZmF1bHRfdmFsdWU6IHt9fX1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGdldENvbnN0OiBmdW5jdGlvbihuYW1lX3R5cGUsIG5hbWVfbGltaXQpe1xuXHRcdFx0cmV0dXJuIHRoaXMudHlwZXNbbmFtZV90eXBlXS5wYXJhbXNbbmFtZV9saW1pdF0uZGVmYXVsdF92YWx1ZTtcblx0XHR9XG5cdH07XG5cdHRoaXMuZG9jID0ge307XG5cdHRoaXMuZG9jLmpzb24gPSBKU09OLnN0cmluZ2lmeShEb2MsIFwiXCIsIDIpO1xuXG5cdERvYy5nZW5Eb2MgPSAoZnVuY3Rpb24obmFtZSwgcGFyYW1zKXtyZXR1cm4ge25hbWU6IHRoaXMudHlwZXNbbmFtZV0ubmFtZSwgcGFyYW1zOiBwYXJhbXN9fSkuYmluZChEb2MpO1xuXHR0aGlzLmRvYy5nZW4gPSBEb2MuZ2VuRG9jO1xuXG5cblxuXG5cdC8vRXJyb3Ncblx0ZnVuY3Rpb24gYXJnVHlwZUVycm9yKHdyb25nX2FyZywgbWVzcyl7XG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XG5cdFx0dmFyIEVSID0gbmV3IFR5cGVFcnJvcignQXJndW1lbnQgdHlwZSBpcyB3cm9uZyEgQXJndW1lbnRzKCcgKyBmb3JBcmcod3JvbmdfYXJnKSArICcpOycgKyBtZXNzKTtcblx0XHRFUi53cm9uZ19hcmcgPSB3cm9uZ19hcmc7XG5cblx0XHRpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcblx0XHRcdEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKEVSLCBhcmdUeXBlRXJyb3IpO1xuXHRcdH1cblxuXHRcdHJldHVybiBFUjtcblxuXHRcdGZ1bmN0aW9uIGZvckFyZyhhcmdzKXtcblx0XHRcdHZhciBzdHJfYXJncyA9ICcnO1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspe1xuXHRcdFx0XHRzdHJfYXJncyArPSB0eXBlb2YoYXJnc1tpXSkgKyAnOiAnICsgYXJnc1tpXSArICc7ICc7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc3RyX2FyZ3M7XG5cdFx0fVxuXHR9XG5cdFQuZXJyb3IgPSBhcmdUeXBlRXJyb3I7XG5cblx0ZnVuY3Rpb24gdHlwZVN5bnRheEVycm9yKHdyb25nX3N0ciwgbWVzcyl7XG5cdFx0aWYobWVzcyA9PT0gdW5kZWZpbmVkKSBtZXNzID0gJyc7XG5cdFx0dmFyIEVSID0gbmV3IFN5bnRheEVycm9yKCdMaW5lOiAnICsgd3Jvbmdfc3RyICsgJzsgJyArIG1lc3MpO1xuXHRcdEVSLndyb25nX2FyZyA9IHdyb25nX3N0cjtcblxuXHRcdGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSkge1xuXHRcdFx0RXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoRVIsIHR5cGVTeW50YXhFcnJvcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIEVSO1xuXHR9XG5cblxuXG5cdGZ1bmN0aW9uIENyZWF0ZUNyZWF0b3IoTmV3LCB0ZXN0LCByYW5kLCBkb2Mpe1xuXHRcdHZhciBjcmVhdG9yO1xuXHRcdGlmKHR5cGVvZiBOZXcgPT09IFwiZnVuY3Rpb25cIil7XG5cdFx0XHRjcmVhdG9yID0gZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIHRtcF9vYmogPSBOZXcuYXBwbHkoe30sIGFyZ3VtZW50cyk7XG5cdFx0XHRcdHZhciBuZXdfY3JlYXRvciA9IG5ldyBDcmVhdGVDcmVhdG9yKE5ldywgdG1wX29iai50ZXN0LCB0bXBfb2JqLnJhbmQsIHRtcF9vYmouZG9jKTtcblx0XHRcdFx0XG5cdFx0XHRcdHJldHVybiBuZXdfY3JlYXRvcjtcblx0XHRcdH07XG5cdFx0fWVsc2UgY3JlYXRvciA9IGZ1bmN0aW9uKCl7cmV0dXJuIGNyZWF0b3J9O1xuXG5cdFx0Y3JlYXRvci5pc19jcmVhdG9yID0gdHJ1ZTtcblx0XHRpZih0eXBlb2YgdGVzdCA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLnRlc3QgPSB0ZXN0O1xuXHRcdGlmKHR5cGVvZiByYW5kID09PSBcImZ1bmN0aW9uXCIpIGNyZWF0b3IucmFuZCA9IHJhbmQ7XG5cdFx0aWYodHlwZW9mIGRvYyA9PT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yLmRvYyA9IGRvYztcblxuXHRcdHJldHVybiBPYmplY3QuZnJlZXplKGNyZWF0b3IpO1xuXHR9XG5cdHRoaXMubmV3VHlwZSA9IGZ1bmN0aW9uKGtleSwgZGVzYywgbmV3X3R5cGUpe1xuXHRcdERvYy50eXBlc1trZXldID0gZGVzYztcblx0XHRULm5hbWVzW2Rlc2MubmFtZV0gPSBrZXk7XG5cdFx0dGhpcy5kb2MuanNvbiA9IEpTT04uc3RyaW5naWZ5KERvYywgXCJcIiwgMik7XG5cblx0XHR0aGlzW2tleV0gPSBuZXcgQ3JlYXRlQ3JlYXRvcihuZXdfdHlwZS5OZXcsIG5ld190eXBlLnRlc3QsIG5ld190eXBlLnJhbmQsIG5ld190eXBlLmRvYyk7XG5cdH1cblx0dGhpcy5uZXdUeXBlLmRvYyA9ICcobmFtZSwgY29uc3RydWN0b3IsIGZ1bmNUZXN0LCBmdW5jUmFuZCwgZnVuY0RvYyknO1xuXG5cblxuXHQvL0NyYWZ0IEJvb2xlYW5cblx0XHR0aGlzLmJvb2wgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcblx0XHRcdG51bGwsXG5cdFx0XHRmdW5jdGlvbih2YWx1ZSl7XG5cdFx0XHRcdGlmKHR5cGVvZiB2YWx1ZSAhPT0gJ2Jvb2xlYW4nKXtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHJldHVybiAhKE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSkpO1xuXHRcdFx0fSxcblx0XHRcdERvYy5nZW5Eb2MuYmluZChudWxsLCBcImJvb2xcIilcblx0XHQpO1xuXG5cblxuXHQvL0NyYWZ0IENvbnN0XG5cdFx0ZnVuY3Rpb24gZG9jQ29uc3QodmFsKXtcblxuXHRcdFx0aWYodHlwZW9mKHZhbCkgPT09IFwib2JqZWN0XCIgJiYgdmFsICE9PSBudWxsKXtcblx0XHRcdFx0dmFsID0gJ09iamVjdCc7XG5cdFx0XHR9XG5cdFx0XHRpZih0eXBlb2YodmFsKSA9PT0gXCJmdW5jdGlvblwiKXtcblx0XHRcdFx0dmFsID0gdmFsLnRvU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsXCJjb25zdFwiLCB7dmFsdWU6IHZhbH0pO1xuXHRcdH1cblx0XHRmdW5jdGlvbiBuZXdDb25zdCh2YWwpe1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cmFuZDogZnVuY3Rpb24oKXtyZXR1cm4gdmFsfSxcblx0XHRcdFx0dGVzdDogZnVuY3Rpb24odil7XG5cdFx0XHRcdFx0aWYodmFsICE9PSB2KSByZXR1cm4gdGhpcy5kb2MoKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGRvYzogZG9jQ29uc3QodmFsKVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0dmFyIGRlZl9jb25zdCA9IG5ld0NvbnN0KERvYy5nZXRDb25zdCgnY29uc3QnLCAndmFsdWUnKSk7XG5cdFx0dGhpcy5jb25zdCA9IG5ldyBDcmVhdGVDcmVhdG9yKG5ld0NvbnN0LCBkZWZfY29uc3QudGVzdCwgZGVmX2NvbnN0LnJhbmQsIGRlZl9jb25zdC5kb2MpO1xuXG5cdFx0ZnVuY3Rpb24gdENvbnN0KFR5cGUpe1xuXHRcdFx0aWYodHlwZW9mIChUeXBlKSAhPT0gXCJmdW5jdGlvblwiIHx8ICFUeXBlLmlzX2NyZWF0b3Ipe1xuXHRcdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcblxuXHRcdFx0XHRcdHJldHVybiBULmFycihUeXBlKTtcblxuXHRcdFx0XHR9ZWxzZSBpZih0eXBlb2YoVHlwZSkgPT0gXCJvYmplY3RcIiAmJiBUeXBlICE9PSBudWxsKXtcblxuXHRcdFx0XHRcdHJldHVybiBULm9iaihUeXBlKTtcblxuXHRcdFx0XHR9ZWxzZSByZXR1cm4gVC5jb25zdChUeXBlKTtcblx0XHRcdH1lbHNle1xuXHRcdFx0XHRyZXR1cm4gVHlwZTtcblx0XHRcdH1cblx0XHR9XG5cblxuXHQvL0NyYWZ0IE51bWJlclxuXHRcdHZhciByYW5kTnVtID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuICsoKChtYXggLSBtaW4pKk1hdGgucmFuZG9tKCkgKyAgbWluKS50b0ZpeGVkKHByZWNpcykpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR2YXIgdGVzdE51bSA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKG4pe1xuXHRcdFx0XHRpZih0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG4pKXtcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5kb2MoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmKChuID4gbWF4KVxuXHRcdFx0XHRcdHx8KG4gPCBtaW4pXG5cdFx0XHRcdFx0fHwgKG4udG9GaXhlZChwcmVjaXMpICE9IG4gJiYgbiAhPT0gMCkgKXtcblxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdCAgfTtcblx0XHR9O1xuXG5cdFx0dmFyIGRvY051bSA9IGZ1bmN0aW9uKG1heCwgbWluLCBwcmVjaXMpe1xuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcIm51bVwiLCB7XCJtYXhcIjogbWF4LCBcIm1pblwiOiBtaW4sIFwicHJlY2lzXCI6IHByZWNpc30pO1xuXHRcdH1cblxuXHRcdHZhciBtYXhfZGVmX24gPSBEb2MuZ2V0Q29uc3QoJ251bScsICdtYXgnKTtcblx0XHR2YXIgbWluX2RlZl9uID0gRG9jLmdldENvbnN0KCdudW0nLCAnbWluJyk7XG5cdFx0dmFyIHByZWNpc19kZWYgPSBEb2MuZ2V0Q29uc3QoJ251bScsICdwcmVjaXMnKTtcblxuXHRcdHRoaXMubnVtID0gbmV3IENyZWF0ZUNyZWF0b3IoXG5cdFx0XHRmdW5jdGlvbihtYXgsIG1pbiwgcHJlY2lzKXtcblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmX247XG5cdFx0XHRcdGlmKG1pbiA9PT0gdW5kZWZpbmVkfHxtaW4gPT09IG51bGwpIG1pbiA9IG1pbl9kZWZfbjtcblx0XHRcdFx0aWYocHJlY2lzID09PSB1bmRlZmluZWQpIHByZWNpcyA9IHByZWNpc19kZWY7XG5cblx0XHRcdFx0aWYoKHR5cGVvZiBtaW4gIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtaW4pKVxuXHRcdFx0XHRcdHx8KHR5cGVvZiBtYXggIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShtYXgpKVxuXHRcdFx0XHRcdHx8KHR5cGVvZiBwcmVjaXMgIT09ICdudW1iZXInIHx8ICFpc0Zpbml0ZShwcmVjaXMpKVxuXHRcdFx0XHRcdHx8KHByZWNpcyA8IDApXG5cdFx0XHRcdFx0fHwocHJlY2lzID4gOSlcblx0XHRcdFx0XHR8fChwcmVjaXMgJSAxICE9PSAwKSl7XG5cdFx0XHRcdFx0dGhyb3cgYXJnVHlwZUVycm9yKGFyZ3VtZW50cywgJ1dhaXQgYXJndW1lbnRzOiBtaW4obnVtYmVyKSwgbWF4KG51bWJlciksIHByZWNpcygwPD1udW1iZXI8OSknKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xuXHRcdFx0XHRcdHZhciB0ID0gbWluO1xuXHRcdFx0XHRcdG1pbiA9IG1heDtcblx0XHRcdFx0XHRtYXggPSB0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0TnVtKG1heCwgbWluLCBwcmVjaXMpLFxuXHRcdFx0XHRcdHJhbmQ6IHJhbmROdW0obWF4LCBtaW4sIHByZWNpcyksXG5cdFx0XHRcdFx0ZG9jOiBkb2NOdW0obWF4LCBtaW4sIHByZWNpcylcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHRlc3ROdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpLFxuXHRcdFx0cmFuZE51bShtYXhfZGVmX24sIG1pbl9kZWZfbiwgcHJlY2lzX2RlZiksXG5cdFx0XHRkb2NOdW0obWF4X2RlZl9uLCBtaW5fZGVmX24sIHByZWNpc19kZWYpXG5cdFx0KTtcblxuXHRcdHZhciByYW5kSW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24oKXtcblx0XHRcdFx0cmV0dXJuIE1hdGguZmxvb3IoICgobWF4IC0gKG1pbiArIDAuMSkpL3ByZWNpcykqTWF0aC5yYW5kb20oKSApICogcHJlY2lzICsgIG1pbjtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0IHZhciB0ZXN0SW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHByZWNpcyl7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24obil7XG5cdFx0XHRcdGlmKHR5cGVvZiBuICE9PSAnbnVtYmVyJyB8fCAhaXNGaW5pdGUobikpe1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoKG4gPj0gbWF4KVxuXHRcdFx0XHRcdHx8KG4gPCBtaW4pXG5cdFx0XHRcdFx0fHwoKChuIC0gbWluKSAlIHByZWNpcykgIT09IDApICl7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZG9jKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0ICB9O1xuXHRcdH07XG5cblx0XHR2YXIgZG9jSW50ID0gZnVuY3Rpb24obWF4LCBtaW4sIHN0ZXApe1xuXG5cdFx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJpbnRcIiwge1wibWF4XCI6IG1heCwgXCJtaW5cIjogbWluLCBcInN0ZXBcIjogc3RlcH0pO1xuXG5cdFx0fVxuXG5cdFx0dmFyIG1heF9kZWYgPSBEb2MuZ2V0Q29uc3QoJ2ludCcsICdtYXgnKTtcblx0XHR2YXIgbWluX2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ21pbicpO1xuXHRcdHZhciBzdGVwX2RlZiA9IERvYy5nZXRDb25zdCgnaW50JywgJ3N0ZXAnKTtcblxuXHRcdHRoaXMuaW50ID0gbmV3IENyZWF0ZUNyZWF0b3IoXG5cdFx0XHRmdW5jdGlvbihtYXgsIG1pbiwgc3RlcCl7XG5cblx0XHRcdFx0aWYobWF4ID09PSBudWxsKSBtYXggPSBtYXhfZGVmO1xuXHRcdFx0XHRpZihtaW4gPT09IHVuZGVmaW5lZHx8bWluID09PSBudWxsKSBtaW4gPSBtaW5fZGVmO1xuXHRcdFx0XHRpZihzdGVwID09PSB1bmRlZmluZWQpIHN0ZXAgPSBzdGVwX2RlZjtcblxuXHRcdFx0XHRpZigodHlwZW9mIG1pbiAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1pbikpXG5cdFx0XHRcdFx0fHwodHlwZW9mIG1heCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1heCkpXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChtaW4pICE9PSBtaW4pXG5cdFx0XHRcdFx0fHwoTWF0aC5yb3VuZChtYXgpICE9PSBtYXgpXG5cdFx0XHRcdFx0fHwoc3RlcCA8PSAwKVxuXHRcdFx0XHRcdHx8KE1hdGgucm91bmQoc3RlcCkgIT09IHN0ZXApKXtcblx0XHRcdFx0XHR0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IG1pbihpbnQpLCBtYXgoaW50KSwgc3RlcChpbnQ+MCknKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZihtaW4gPiBtYXgpe1xuXHRcdFx0XHRcdHZhciB0ID0gbWluO1xuXHRcdFx0XHRcdG1pbiA9IG1heDtcblx0XHRcdFx0XHRtYXggPSB0O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0SW50KG1heCwgbWluLCBzdGVwKSxcblx0XHRcdFx0XHRyYW5kOiByYW5kSW50KG1heCwgbWluLCBzdGVwKSxcblx0XHRcdFx0XHRkb2M6IGRvY0ludChtYXgsIG1pbiwgc3RlcClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHRlc3RJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpLFxuXHRcdFx0cmFuZEludChtYXhfZGVmLCBtaW5fZGVmLCBzdGVwX2RlZiksXG5cdFx0XHRkb2NJbnQobWF4X2RlZiwgbWluX2RlZiwgc3RlcF9kZWYpXG5cdFx0KTtcblxuXHRcdHZhciBkb2NQb3MgPSBmdW5jdGlvbihtYXgsIG1pbiwgc3RlcCl7XG5cblx0XHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcInBvc1wiLCB7XCJtYXhcIjogbWF4fSk7XG5cblx0XHR9XG5cblx0XHR2YXIgbWF4X2RlZl9wID0gRG9jLmdldENvbnN0KCdwb3MnLCAnbWF4Jylcblx0XHR0aGlzLnBvcyA9IG5ldyBDcmVhdGVDcmVhdG9yKFxuXHRcdFx0ZnVuY3Rpb24obWF4KXtcblxuXHRcdFx0XHRpZihtYXggPT09IG51bGwpIG1heCA9IG1heF9kZWZfcDtcblxuXHRcdFx0XHRpZigodHlwZW9mIG1heCAhPT0gJ251bWJlcicgfHwgIWlzRmluaXRlKG1heCkpXG5cdFx0XHRcdFx0fHwobWF4IDwgMCkpe1xuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogbWluKHBvcyksIG1heChwb3MpLCBzdGVwKHBvcz4wKScpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHR0ZXN0OiB0ZXN0SW50KG1heCwgMCwgMSksXG5cdFx0XHRcdFx0cmFuZDogcmFuZEludChtYXgsIDAsIDEpLFxuXHRcdFx0XHRcdGRvYzogZG9jUG9zKG1heClcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHRlc3RJbnQobWF4X2RlZl9wLCAwLCAxKSxcblx0XHRcdHJhbmRJbnQobWF4X2RlZl9wLCAwLCAxKSxcblx0XHRcdGRvY1BvcyhtYXhfZGVmX3ApXG5cdFx0KTtcblxuXG5cblxuXG4gIC8vQ3JhZnQgQW55XG4gIFx0XHRmdW5jdGlvbiByYW5kSW5kZXgoYXJyKXtcblx0XHRcdHZhciByYW5kID0gTWF0aC5yb3VuZCgoYXJyLmxlbmd0aCAtIDEpICogTWF0aC5yYW5kb20oKSk7XG5cdFx0XHRyZXR1cm4gYXJyW3JhbmRdO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHJhbmRBbnkoYXJyKXtcblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0XHRyZXR1cm4gcmFuZEluZGV4KGFycikucmFuZCgpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRlc3RBbnkoYXJyKXtcblx0XHRcdHJldHVybiBmdW5jdGlvbih2YWwpe1xuXHRcdFx0XHRpZihhcnIuZXZlcnkoZnVuY3Rpb24oaSl7cmV0dXJuIGkudGVzdCh2YWwpfSkpe1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmRvYygpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGRvY0FueShUeXBlcyl7XG5cblx0XHRcdHZhciBjb250ID0gVHlwZXMubGVuZ3RoO1xuXHRcdFx0dmFyIHR5cGVfZG9jcyA9IFtdO1xuXHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvbnQ7IGkrKyl7XG5cdFx0XHRcdHR5cGVfZG9jcy5wdXNoKFR5cGVzW2ldLmRvYygpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIERvYy5nZW5Eb2MuYmluZChudWxsLCBcImFueVwiLCB7dHlwZXM6IHR5cGVfZG9jc30pO1xuXHRcdH1cblxuXHRcdHZhciBkZWZfdHlwZXMgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICd0eXBlcycpO1xuXHRcdGZ1bmN0aW9uIG5ld0FueShhcnIpe1xuXHRcdFx0aWYoIUFycmF5LmlzQXJyYXkoYXJyKSB8fCBhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJyID0gYXJndW1lbnRzO1xuXG5cdFx0XHR2YXIgbGVuID0gYXJyLmxlbmd0aDtcblx0XHRcdHZhciBhcnJfdHlwZXMgPSBbXTtcblx0XHRcdGZvcih2YXIgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG5cdFx0XHRcdGFycl90eXBlc1tpXSA9IHRDb25zdChhcnJbaV0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm57XG5cdFx0XHRcdHRlc3Q6IHRlc3RBbnkoYXJyX3R5cGVzKSxcblx0XHRcdFx0cmFuZDogcmFuZEFueShhcnJfdHlwZXMpLFxuXHRcdFx0XHRkb2M6IGRvY0FueShhcnJfdHlwZXMpXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5hbnkgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcblx0XHRcdG5ld0FueSxcblx0XHRcdHRlc3RBbnkoZGVmX3R5cGVzKSxcblx0XHRcdHJhbmRBbnkoZGVmX3R5cGVzKSxcblx0XHRcdGRvY0FueShkZWZfdHlwZXMpXG5cdFx0KTtcblxuXG5cblx0Ly9DcmFmdCBBcnJheVxuXG5cblxuXHRcdGZ1bmN0aW9uIHJhbmRBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XG5cdFx0XHR2YXIgcmFuZFNpemUgPSBmdW5jdGlvbiAoKXtyZXR1cm4gc2l6ZX07XG5cdFx0XHRpZighaXNfZml4ZWQpe1xuXHRcdFx0XHRyYW5kU2l6ZSA9IFQucG9zKHNpemUpLnJhbmQ7XG5cdFx0XHR9XG5cblxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XG5cdFx0XHRcdHZhciBub3dfc2l6ZSA9IHJhbmRTaXplKCk7XG5cblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdFx0dmFyIGFyciA9IFtdO1xuXG5cdFx0XHRcdFx0Zm9yKHZhciBpID0gMCwgaiA9IDA7IGkgPCBub3dfc2l6ZTsgaSsrKXtcblxuXHRcdFx0XHRcdFx0YXJyLnB1c2goVHlwZVtqXS5yYW5kKCkpO1xuXG5cdFx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdFx0XHRpZihqID49IFR5cGUubGVuZ3RoKXtcblx0XHRcdFx0XHRcdFx0aiA9IDA7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBhcnI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXG5cblx0XHRcdHJldHVybiBmdW5jdGlvbigpe1xuXHRcdFx0XHR2YXIgYXJyID0gW107XG5cblx0XHRcdFx0dmFyIG5vd19zaXplID0gcmFuZFNpemUoKTtcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IG5vd19zaXplOyBpKyspe1xuXHRcdFx0XHRcdGFyci5wdXNoKFR5cGUucmFuZChpLCBhcnIpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBhcnI7XG5cdFx0XHR9XG5cblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0ZXN0QXJyYXkoVHlwZSwgc2l6ZSwgaXNfZml4ZWQpe1xuXG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcblx0XHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGFycil7XG5cblx0XHRcdFx0XHRpZighQXJyYXkuaXNBcnJheShhcnIpKXtcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IGFycmF5IVwiO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZigoYXJyLmxlbmd0aCA+IHNpemUpIHx8IChpc19maXhlZCAmJiAoYXJyLmxlbmd0aCAhPT0gc2l6ZSkpKXtcblx0XHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xuXHRcdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiQXJyYXkgbGVuZ2h0IGlzIHdyb25nIVwiO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRmb3IodmFyIGkgPSAwLCBqID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKyl7XG5cblx0XHRcdFx0XHRcdFx0dmFyIHJlcyA9IFR5cGVbal0udGVzdChhcnJbaV0pO1xuXHRcdFx0XHRcdFx0XHRpZihyZXMpe1xuXHRcdFx0XHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnIucGFyYW1zID0ge2luZGV4OiBpLCB3cm9uZ19pdGVtOiByZXN9O1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGVycjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGorKztcblx0XHRcdFx0XHRcdFx0aWYoaiA+PSBUeXBlLmxlbmd0aCl7XG5cdFx0XHRcdFx0XHRcdFx0aiA9IDA7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKGFycil7XG5cdFx0XHRcdGlmKCFBcnJheS5pc0FycmF5KGFycikpe1xuXHRcdFx0XHRcdHZhciBlcnIgPSB0aGlzLmRvYygpO1xuXHRcdFx0XHRcdGVyci5wYXJhbXMgPSBcIlZhbHVlIGlzIG5vdCBhcnJheSFcIjtcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYoKGFyci5sZW5ndGggPiBzaXplKSB8fCAoaXNfZml4ZWQgJiYgKGFyci5sZW5ndGggIT09IHNpemUpKSl7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coYXJyLmxlbmd0aCwgc2l6ZSlcblx0XHRcdFx0XHR2YXIgZXJyID0gdGhpcy5kb2MoKTtcblx0XHRcdFx0XHRlcnIucGFyYW1zID0gXCJBcnJheTogbGVuZ2h0IGlzIHdyb25nIVwiO1xuXHRcdFx0XHRcdHJldHVybiBlcnI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR2YXIgZXJyX2FyciA9IGFyci5maWx0ZXIoVHlwZS50ZXN0KTtcblx0XHRcdFx0aWYoZXJyX2Fyci5sZW5ndGggIT0gMCl7XG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IGVycl9hcnI7XG5cdFx0XHRcdFx0cmV0dXJuIGVycjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBkb2NBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XG5cdFx0XHR2YXIgdHlwZV9kb2NzID0gW107XG5cdFx0XHRpZihBcnJheS5pc0FycmF5KFR5cGUpKXtcblx0XHRcdFx0dmFyIGNvbnQgPSBUeXBlLmxlbmd0aDtcblx0XHRcdFx0Zm9yKHZhciBpID0gMDsgaSA8IGNvbnQ7IGkrKyl7XG5cdFx0XHRcdFx0dHlwZV9kb2NzLnB1c2goVHlwZVtpXS5kb2MoKSk7XG5cdFx0XHRcdH1cblx0XHRcdH1lbHNle1xuXHRcdFx0XHR0eXBlX2RvY3MgPSBUeXBlLmRvYygpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gRG9jLmdlbkRvYy5iaW5kKG51bGwsIFwiYXJyXCIsIHt0eXBlczogdHlwZV9kb2NzLCBzaXplOiBzaXplLCBmaXhlZDogaXNfZml4ZWR9KTtcblxuXHRcdH1cblxuXG5cdFx0dmFyIGRlZl9UeXBlID0gRG9jLmdldENvbnN0KCdhcnInLCAndHlwZXMnKTtcblx0XHR2YXIgZGVmX1NpemUgPSBEb2MuZ2V0Q29uc3QoJ2FycicsICdzaXplJyk7XG5cdFx0dmFyIGRlZl9maXhlZCA9IERvYy5nZXRDb25zdCgnYXJyJywgJ2ZpeGVkJyk7XG5cblx0XHRmdW5jdGlvbiBuZXdBcnJheShUeXBlLCBzaXplLCBpc19maXhlZCl7XG5cdFx0XHRpZihUeXBlID09PSBudWxsKSBUeXBlID0gZGVmX1R5cGU7XG5cdFx0XHRpZihpc19maXhlZCA9PT0gdW5kZWZpbmVkKSBpc19maXhlZCA9IGRlZl9maXhlZDtcblxuXHRcdFx0aWYoQXJyYXkuaXNBcnJheShUeXBlKSl7XG5cdFx0XHRcdGlmKHNpemUgPT09IHVuZGVmaW5lZHx8c2l6ZSA9PT0gbnVsbCkgc2l6ZSA9IFR5cGUubGVuZ3RoO1xuXG5cdFx0XHRcdFR5cGUgPSBUeXBlLm1hcChmdW5jdGlvbihpdGVtKXtyZXR1cm4gdENvbnN0KGl0ZW0pO30pO1xuXHRcdFx0fWVsc2V7XG5cdFx0XHRcdGlmKHNpemUgPT09IHVuZGVmaW5lZHx8c2l6ZSA9PT0gbnVsbCkgc2l6ZSA9IDE7XG5cdFx0XHRcdFR5cGUgPSB0Q29uc3QoVHlwZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmKFQucG9zLnRlc3Qoc2l6ZSkpe1xuXHRcdFx0XHRcdHRocm93IGFyZ1R5cGVFcnJvcihhcmd1bWVudHMsICdXYWl0IGFyZ3VtZW50czogJyArIEpTT04uc3RyaW5naWZ5KFQucG9zLnRlc3Qoc2l6ZSkpKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGVzdDogdGVzdEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKSxcblx0XHRcdFx0cmFuZDogcmFuZEFycmF5KFR5cGUsIHNpemUsIGlzX2ZpeGVkKSxcblx0XHRcdFx0ZG9jOiBkb2NBcnJheShUeXBlLCBzaXplLCBpc19maXhlZClcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dGhpcy5hcnIgPSBuZXcgQ3JlYXRlQ3JlYXRvcihcblx0XHRcdG5ld0FycmF5LFxuXHRcdFx0dGVzdEFycmF5KGRlZl9UeXBlLCBkZWZfU2l6ZSwgZGVmX2ZpeGVkKSxcblx0XHRcdHJhbmRBcnJheShkZWZfVHlwZSwgZGVmX1NpemUsIGRlZl9maXhlZCksXG5cdFx0XHRkb2NBcnJheShkZWZfVHlwZSwgZGVmX1NpemUsIGRlZl9maXhlZClcblx0XHQpO1xuXG5cblxuXG5cblxuXG5cdC8vQ3JhZnQgT2JqZWN0XG5cblx0XHRmdW5jdGlvbiByYW5kT2JqKGZ1bmNPYmope1xuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCl7XG5cdFx0XHRcdHZhciBvYmogPSB7fTtcblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gZnVuY09iail7XG5cdFx0XHRcdFx0b2JqW2tleV0gPSBmdW5jT2JqW2tleV0ucmFuZCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvYmo7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRlc3RPYmooZnVuY09iail7XG5cdFx0XHRyZXR1cm4gZnVuY3Rpb24ob2JqKXtcblxuXHRcdFx0XHRpZih0eXBlb2Ygb2JqICE9PSBcIm9iamVjdFwiICYmIG9iaiA9PT0gbnVsbCl7XG5cdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XG5cdFx0XHRcdFx0ZXJyLnBhcmFtcyA9IFwiVmFsdWUgaXMgbm90IG9iamVjdCFcIjtcblx0XHRcdFx0XHRyZXR1cm4gZXJyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gZnVuY09iail7XG5cdFx0XHRcdFx0dmFyIHJlcyA9IGZ1bmNPYmpba2V5XS50ZXN0KG9ialtrZXldKTtcblx0XHRcdFx0XHRpZihyZXMpe1xuXHRcdFx0XHRcdFx0dmFyIGVyciA9IHRoaXMuZG9jKCk7XG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zID0ge307XG5cdFx0XHRcdFx0XHRlcnIucGFyYW1zW2tleV0gPSByZXM7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXJyO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZG9jT2IoZnVuY09iail7XG5cdFx0XHR2YXIgZG9jX29iaiA9IHt9O1xuXG5cdFx0XHRmb3IodmFyIGtleSBpbiBmdW5jT2JqKXtcblx0XHRcdFx0XHRkb2Nfb2JqW2tleV0gPSBmdW5jT2JqW2tleV0uZG9jKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBEb2MuZ2VuRG9jLmJpbmQobnVsbCwgXCJvYmpcIiwge3R5cGVzOiBkb2Nfb2JqfSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gTmV3T2JqKHRlbXBPYmope1xuXHRcdFx0aWYodHlwZW9mIHRlbXBPYmogIT09ICdvYmplY3QnKSB0aHJvdyBhcmdUeXBlRXJyb3IoYXJndW1lbnRzLCAnV2FpdCBhcmd1bWVudHM6IHRlbXBPYmooT2JqZWN0KScpO1xuXG5cdFx0XHR2YXIgYmVnT2JqID0ge307XG5cdFx0XHR2YXIgZnVuY09iaiA9IHt9O1xuXHRcdFx0Zm9yKHZhciBrZXkgaW4gdGVtcE9iail7XG5cdFx0XHRcdGZ1bmNPYmpba2V5XSA9IHRDb25zdCh0ZW1wT2JqW2tleV0pO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm57XG5cdFx0XHRcdHRlc3Q6IHRlc3RPYmooZnVuY09iaiksXG5cdFx0XHRcdHJhbmQ6IHJhbmRPYmooZnVuY09iaiksXG5cdFx0XHRcdGRvYzogZG9jT2IoZnVuY09iailcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5vYmogPSBuZXcgQ3JlYXRlQ3JlYXRvcihOZXdPYmosXG5cdFx0XHRmdW5jdGlvbihvYmope3JldHVybiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwifSxcblx0XHRcdHJhbmRPYmooe30pLFxuXHRcdFx0RG9jLmdlbkRvYy5iaW5kKG51bGwsIFwib2JqXCIpXG5cdFx0KTtcblxuXG5cblxuXG4vL0NyYWZ0IFR5cGUgb3V0IHRvICBEb2N1bWVudFxuXG5cdFQubmFtZXMgPSB7fTtcblx0Zm9yKHZhciBrZXkgaW4gRG9jLnR5cGVzKXtcblx0XHRULm5hbWVzW0RvYy50eXBlc1trZXldLm5hbWVdID0ga2V5O1xuXHR9XG5cblx0dGhpcy5vdXREb2MgPSBmdW5jdGlvbih0bXApe1xuXHRcdGlmKCh0eXBlb2YgdG1wID09PSBcImZ1bmN0aW9uXCIpICYmIHRtcC5pc19jcmVhdG9yKSByZXR1cm4gdG1wO1xuXG5cdFx0aWYoISgnbmFtZScgaW4gdG1wKSl7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoKTtcblx0XHR9XG5cdFx0dmFyIHR5cGUgPSB0bXAubmFtZTtcblxuXHRcdGlmKCdwYXJhbXMnIGluIHRtcCl7XG5cdFx0XHR2YXIgcGFyYW1zID0gdG1wLnBhcmFtcztcblx0XHRcdHN3aXRjaChULm5hbWVzW3R5cGVdKXtcblx0XHRcdFx0Y2FzZSAnb2JqJzoge1xuXHRcdFx0XHRcdHZhciBuZXdfb2JqID0ge307XG5cdFx0XHRcdFx0Zm9yKHZhciBrZXkgaW4gcGFyYW1zLnR5cGVzKXtcblx0XHRcdFx0XHRcdG5ld19vYmpba2V5XSA9IFQub3V0RG9jKHBhcmFtcy50eXBlc1trZXldKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cGFyYW1zLnR5cGVzID0gbmV3X29iajtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRjYXNlICdhbnknOlxuXHRcdFx0XHRjYXNlICdhcnInOiB7XG5cdFx0XHRcdFx0aWYoQXJyYXkuaXNBcnJheShwYXJhbXMudHlwZXMpKXtcblx0XHRcdFx0XHRcdHBhcmFtcy50eXBlcyA9IHBhcmFtcy50eXBlcy5tYXAoVC5vdXREb2MuYmluZChUKSk7XG5cdFx0XHRcdFx0fWVsc2UgcGFyYW1zLnR5cGVzID0gVC5vdXREb2MocGFyYW1zLnR5cGVzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGdldFNpbXBsZVR5cGUoVC5uYW1lc1t0eXBlXSwgcGFyYW1zKTtcblx0XHR9XG5cdFx0cmV0dXJuIGdldFNpbXBsZVR5cGUoVC5uYW1lc1t0eXBlXSwge30pO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0U2ltcGxlVHlwZShuYW1lLCBwYXJhbXMpe1xuXHRcdHZhciBhcmcgPSBbXTtcblx0XHREb2MudHlwZXNbbmFtZV0uYXJnLmZvckVhY2goZnVuY3Rpb24oa2V5LCBpKXthcmdbaV0gPSBwYXJhbXNba2V5XTt9KTtcblx0XHRyZXR1cm4gVFtuYW1lXS5hcHBseShULCBhcmcpO1xuXHR9O1xuXG4vL1N1cHBvcnQgRGVjbGFyYXRlIEZ1bmN0aW9uXG5cblx0ZnVuY3Rpb24gZmluZGVQYXJzZShzdHIsIGJlZywgZW5kKXtcblx0XHR2YXIgcG9pbnRfYmVnID0gc3RyLmluZGV4T2YoYmVnKTtcblx0XHRpZih+cG9pbnRfYmVnKXtcblxuXHRcdFx0dmFyIHBvaW50X2VuZCA9IHBvaW50X2JlZztcblx0XHRcdHZhciBwb2ludF90ZW1wID0gcG9pbnRfYmVnO1xuXHRcdFx0dmFyIGxldmVsID0gMTtcblx0XHRcdHZhciBicmVha1doaWxlID0gZmFsc2U7XG5cdFx0XHR3aGlsZSghYnJlYWtXaGlsZSl7XG5cdFx0XHRcdGJyZWFrV2hpbGUgPSB0cnVlO1xuXG5cdFx0XHRcdGlmKH5wb2ludF90ZW1wKSBwb2ludF90ZW1wID0gc3RyLmluZGV4T2YoYmVnLCBwb2ludF90ZW1wICsgMSk7XG5cdFx0XHRcdGlmKH5wb2ludF9lbmQpIHBvaW50X2VuZCA9IHN0ci5pbmRleE9mKGVuZCwgcG9pbnRfZW5kICsgMSk7XG5cblx0XHRcdFx0aWYocG9pbnRfdGVtcCA8IHBvaW50X2VuZCl7XG5cblx0XHRcdFx0XHRpZihwb2ludF90ZW1wID4gMCl7XG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfdGVtcCAtIDFdICE9PSAnXFxcXCcpIGxldmVsID0gbGV2ZWwrMTtcblxuXHRcdFx0XHRcdH1cblxuXG5cdFx0XHRcdFx0aWYocG9pbnRfZW5kID4gMCl7XG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfZW5kIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbC0xO1xuXHRcdFx0XHRcdFx0aWYobGV2ZWwgPT0gMCl7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBbcG9pbnRfYmVnLCBwb2ludF9lbmRdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fWVsc2V7XG5cdFx0XHRcdFx0aWYocG9pbnRfZW5kID4gMCl7XG5cdFx0XHRcdFx0XHRicmVha1doaWxlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRpZihzdHJbcG9pbnRfZW5kIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbC0xO1xuXHRcdFx0XHRcdFx0aWYobGV2ZWwgPT0gMCl7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBbcG9pbnRfYmVnLCBwb2ludF9lbmRdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmKHBvaW50X3RlbXAgPiAwKXtcblx0XHRcdFx0XHRcdGJyZWFrV2hpbGUgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGlmKHN0cltwb2ludF90ZW1wIC0gMV0gIT09ICdcXFxcJykgbGV2ZWwgPSBsZXZlbCsxO1xuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdE9iamVjdC50eXBlcyA9IFQ7XG59KSgpO1xuIiwibW9kdWxlLmV4cG9ydHM9e1xyXG5cdFwi0JTQtdGA0LXQstC+XCI6IFwid29vZFwiLFxyXG5cdFwi0JrQsNC80LXQvdGMXCI6IFwic3RvbmVcIixcclxuXHRcItCh0YLQsNC70YxcIjogXCJzdGVlbFwiLFxyXG5cdFwi0KDQtdGB0L9cIjogXCJzcGF3bmVyXCJcclxufSJdfQ==
