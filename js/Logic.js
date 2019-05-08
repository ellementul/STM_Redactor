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

	this.getAll = function(){
		return JSON.parse(JSON.stringify(tiles));
	}
}

var Tiles = new CrTiles();

function CrMap(map){
	var sizes = map.sizes;
	var map_name = map.name;

	var cr_line = Array.create.bind(null, null, sizes.width);
	var cr_pline = Array.create.bind(null, cr_line, sizes.width, true);
	var map = Array.create(cr_pline, sizes.layers);

	this.load = function(loaded_layers){
		loaded_layers.forEach(layer => 
			layer.forEach(box =>
				Pen(box.tile_id, box.coords)
			)
		);
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

	this.getAll = function(){
		var layers = map.map(function(pline){
			var layer = [];

			pline.forEach((line)=>{
				line.forEach((box)=>{
					if(box && layer.indexOf(box) == -1)
						layer.push(box);
				})
			});

			return layer;
		});

		return JSON.parse(JSON.stringify({
			name: this.getName(),
			sizes: this.getSizes(),
			layers: layers
		}));
	}

	this.getName = function(){
		return map_name;
	}

	this.getSizes = function(){
		return {layers: map.length, height: map[0].length, width: map[0][0].length};
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



module.exports = function CrLogic(Inter){
	var send = Inter.connect(receive);

	var TileMap = null;

	

	function receive(mess){
		switch(mess.type){
			case "File": loadFile(mess); break;
			case "Tiles":
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
			case "Get":
				send({
					action: "Load",
					type: "Tiles",
					data: Tiles.getAll()});
				break;
		}
	}

	function receiveMap(mess){
		switch(mess.action){
			case "Create":
				initMap(mess);
				break;
			case "Draw":
			 	mess = TileMap.draw(mess);
			 	send(mess);
			 	break;
			case "Get":
				send({
					action: "Load",
					type: "Map",
					data: TileMap.getAll()});
				break;
		}
	}

	function initMap(mess){
		if(!TileMap){
			TileMap = new CrMap(mess.map);
			send({
				action: "Create",
				type: "Map",
				map: {
					name: TileMap.getName(),
					sizes: TileMap.getSizes()
				}
			});
		}
	}

	function loadFile(mess){
		if(mess.action != "Load") return;

		if(TileMap || Tiles.getAll().length) return;

		var tiles = mess.file.tiles;
		var tile_map = mess.file.map;

		tiles.forEach(tile => Tiles.add(tile));
		send({
			action: "Load",
			type: "Tiles",
			data: Tiles.getAll()
		});

		TileMap = new CrMap(tile_map);
		TileMap.load(tile_map.layers);

		send({
			action: "Load",
			type: "Map",
			data: TileMap.getAll()
		});

	}
}
