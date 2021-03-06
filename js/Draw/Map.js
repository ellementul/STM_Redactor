require("./mof.js");
const Lib = require("./drawLib.js");
var CrList = Lib.drawList;

var map_size = 20;
var map_cont = Lib.getNode("Map");
var Tiles = Lib.getNode("Tiles");
var layers_cont = Lib.getNode("Layers");

module.exports = function CrMap(){

	map_cont.load = function(sizes, loaded_layers){
		var Grid = CrGrid(sizes, "grid-border");
		Grid.setAttribute("id", "Grid");

		var i = sizes.layers;
		var layer_list = [];
		while(i--){
			map_cont.appendChild(CrLayer(sizes));
			layer_list[i] = i;
		}
		CrList(layers_cont, layer_list, "option-change");

		if(loaded_layers)
			loaded_layers.forEach(loadLayer);


		map_cont.appendChild(Grid);
	}

	map_cont.clear = function(){
		throw new Error();
	}

	function loadLayer(loaded_layer, i){
		loaded_layer.forEach(box =>{
			var tile = Tiles.getTile(box.tile_id);

			map_cont.children[box.coords.z].pen(tile, [box.coords], box.rotate);
		});
	}

	map_cont.draw = function(mess){
		var coords = mess.coords;
		var rotate = mess.rotate;
		if(coords.length == 0) return;

		if(mess.tool == "Pen"){
			var tile = Tiles.getTile(mess.tile_id);

			this.children[coords[0].z].pen(tile, coords, rotate);			
		}
		if(mess.tool == "Clear") this.children[coords[0].z].clear(mess.coords);
	}

	var layer = 0;
	map_cont.addGetSet("layer", 
		function(){
			return layer;
		},
		function(val){
			if(map_cont.children[val]){
				layer = +val;
				Array.from(map_cont.children).forEach(function(lay, i){
					if(lay.is_layer){
						if(i <= layer)
							lay.show();
						else 
							lay.hide();
					}
				});
			}
		}
	);

	return map_cont;
	
}

function CrLayer(sizes){
	var layer = document.createElement("div");
	layer.classList.add("layer");
	layer.is_layer = true;
	layer.style.width = "100%";
	layer.style.height = "100%";

	var w_size = 100 / sizes.width;
	var h_size = 100 / sizes.height;

	layer.show = function(){
		layer.style.opacity = 1;
	}

	layer.hide = function(){
		layer.style.opacity = 0;
	}

	layer.clear = function(coords){
		coords = coords[0];

		if(!layer[coords.y] || !layer[coords.y][coords.x]) throw new Error();
		layer[coords.y][coords.x].remove();
	}

	layer.pen = function(tile, coords, rotate){
		coords = coords[0];

		var box = Lib.drawTile(tile.images[0], rotate);
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