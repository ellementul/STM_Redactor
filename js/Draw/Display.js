const Base64 = require('js-base64').Base64;
const FileSys = require("../SysFiles.js");

const CrViewLogic = require("./ViewLogic.js");

const Hear = require("./Events.js");

const CrAddForm = require("./AddForm.js");
const CrTool = require("./Tools.js");
const CrTiles = require("./Tiles.js");
const CrMap = require("./Map.js");


var map_size = {width: 20, height: 20, layers: 2};
var loaded_map = require("../Map.json");

var Status = new CrStatusClient();

module.exports = function CrDisplay(Inter){
	var Send = Inter.connect(receive);


	Send({
		action: "Create",
		type: "Map",
		sizes: map_size
	});

	/*Send({
		action: "Load",
		type: "File",
		file: loaded_map
	});*/

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
		Status.work();

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

		Hear("Save", "click", function(){
			Status.save();
			Send({
				action: "Get",
				type: "Tiles"
			});
			Send({
				action: "Get",
				type: "Map"
			});
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
		if(mess.action == "Load"){
			receiveLoad(mess);
			return;
		}

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

	
	function receiveLoad(mess){
		if(Status.is("Init")){
			if(mess.type == "Tiles"){
				Tiles.load(mess.data);
				stronge.tiles = true;
			}
			if(mess.type == "Map"){
				TileMap.load(mess.data.sizes, mess.data.layers);
				stronge.map = true;
			}
			if(stronge.tiles && stronge.map){

				initMap();
				stronge.tiles = null;
				stronge.map = null;
			}
		}

		if(Status.is("Save")){
			if(mess.type == "Tiles")
				stronge.tiles = mess.data;
			if(mess.type == "Map")
				stronge.map = mess.data;
			stronge.save();
		}

	}
}

var stronge = {
	tiles: null, 
	map: null,
	save: function(){
		if(this.tiles && this.map){
			var file = JSON.stringify({
				name: this.map.name,
				tiles: this.tiles,
				map: this.map
			}, null, 2);
			FileSys.save(this.map.name + ".json", file);
			this.tiles = null;
			this.map = null;
			Status.work();
		}
	}
};

function CrStatusClient(){

	var status = "Init";

	this.save = function(){
		if(status == "Work") 
			status = "Save";
	}

	this.work = function(){
		if(status == "Init" || status == "Save")
			status = "Work";
	}

	this.is = function(stat){
		return status == stat;
	}
}