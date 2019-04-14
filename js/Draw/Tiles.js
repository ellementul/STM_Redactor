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

	tiles_cont.load = function(loaded_tiles){
		loaded_tiles.forEach(tile =>
			tiles_cont.add(tile)
		);
	}

	tiles_cont.clear = function(){
		tiles = [];
		Array.from(tiles_cont.children).forEach(elem => elem.remove());
	}

	return tiles_cont;
}