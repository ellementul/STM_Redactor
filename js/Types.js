require("typesjs");
require("typesjs/str_type");

var types_durability = require("./types_durability.json");

var T = Object.types;

var map_size = 256;
var tile_id_type = T.pos(map_size * map_size);
var coords_type = {x: T.pos(map_size), y: T.pos(map_size), z: T.pos(map_size)};
var rotate_tile = T.pos(4);

var map_name_type = T.str(/^[\w\d]*$/, 24);

var tile_type = T.obj({
		id: T.any(undefined, tile_id_type),
		images: T.arr(T.str(/^[\w\d\s+:;.,?!=#\/<>"()-\]}{]*$/, 1024*1024)),
		type: T.any(Object.values(types_durability)),
		size: T.pos(map_size)
});

var box = T.obj({
	tile_id: tile_id_type,
	coords: coords_type,
	size: T.pos(map_size),
	rotate: rotate_tile
});

var new_tile_mess_type = T.obj({
	action: "Add",
	type: "Tile",
	tile: tile_type
});

var map_size_type = T.obj({
	width: T.pos(map_size), 
	height: T.pos(map_size), 
	layers: T.pos(map_size)
});

var new_map_mess_type = T.obj({
	action: "Create",
	type: "Map",
	map:{
		name: map_name_type,
		sizes: map_size_type,
	}
	
});

var draw_mess_type = {
	action: "Draw",
	type: "Map",
	tool: "Pen",
	coords: coords_type,
	tile_id: tile_id_type,
	rotate: rotate_tile
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
	tile_id: tile_id_type,
	rotate: rotate_tile
};

var getting_mess_type = T.any({
	action: "Get",
	type: "Tiles"
},{
	action: "Get",
	type: "Map"
})

var map_type = {
	name: map_name_type,
	sizes: {width: T.pos(map_size), height: T.pos(map_size), layers: T.pos(map_size)},
	layers: T.arr(T.arr(box, map_size*map_size, false), map_size, false)
};

var loading_tiles_mess_type = T.obj({
	action: "Load",
	type: "Tiles",
	data: T.arr(tile_type, 256, false)
});

var loading_map_mess_type = T.obj({
	action: "Load",
	type: "Map",
	data: map_type
	
});

var loading_file_mess_type = T.obj({
	action: "Load",
	type: "File",
	file: {
		name: map_name_type,
		tiles: T.arr(tile_type, 256, false),
		map: map_type
	}
});


var mess_types_one = T.any([
	draw_mess_type, 
	new_tile_mess_type,
	new_map_mess_type, 
	clear_mess_type,
	getting_mess_type,
	]);

var mess_types_two = T.any([
	draw_mess_type_for_display,
	new_tile_mess_type, 
	new_map_mess_type,
	clear_mess_type_for_display]);

function TestTypeLoad(mess){
	switch(mess.type){
		case "File": isError(loading_file_mess_type, mess); break;
		case "Tiles": isError(loading_tiles_mess_type, mess); break;
		case "Map": isError(loading_map_mess_type, mess); break;
		default: throw new TypeError(val);
	}
}

module.exports = [
	function(mess){
		if(mess.action == "Load"){
			TestTypeLoad(mess);
			return;
		}
		if(mess_types_one.test(mess))
			throw mess_types_one.test(mess);
	}, 
	function(mess){
		if(mess.action == "Load"){
			TestTypeLoad(mess);
			return;
		}
		if(mess_types_two.test(mess))
			throw mess_types_two.test(mess);
	}];

function isError(type, val){
	if(type.test(val))
			throw type.test(val);
}