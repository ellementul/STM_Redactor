const Base64 = require('js-base64').Base64;
const FileSys = require("../SysFiles.js");

const CrViewLogic = require("./ViewLogic.js");

const Hear = require("./Events.js");

const CrAddForm = require("./AddForm.js");
const CrTool = require("./Tools.js");
const CrTiles = require("./Tiles.js");
const CrMap = require("./Map.js");

const CrStatus = require("./Status.js");


var map_size = {width: 20, height: 20, layers: 2};
var loaded_map = require("../Map.json");

var Status = new CrStatus();

module.exports = function CrDisplay(Inter){
	var Send = Inter.connect(receive);

	

	var AddForm = new CrAddForm();
	var Tool = new CrTool();

	var Tiles = new CrTiles();
	var TileMap = new CrMap();

	


	var ViewLogic = new CrViewLogic(AddForm, Tool);

	
	Hear("NewFile", "click", function(){
		Send({
			action: "Create",
			type: "Map",
			sizes: map_size
		});
	});

	Hear("OpenFileInput", "change", function(){
		if(this.files[0]){

			var reader = new FileReader();
			reader.onload = function(e){
				loadMap(JSON.parse(e.target.result));
			};
			reader.readAsText(this.files[0]);
		}
	});

	function clearMap(){
		Tiles.clear();
		Tool.clear();
		TileMap.clear();

		Status.reset();
	}
	
	function loadMap(loaded_map){
		Send({
			action: "Load",
			type: "File",
			file: loaded_map
		});
	}

	function initMap(){
		Status.work();

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

		Hear(["Layer0", "Layer1"], "click", function(e){
			TileMap.layer = this.getAttribute("layer");
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
				coords: {x: x, y: y, z: TileMap.layer},
				tile_id: Tool.tile
			});
		else if(Tool.type == "Clear")
			Send({
				action: "Draw",
				type: "Map",
				tool: Tool.type,
				coords: {x: x, y: y, z: TileMap.layer}
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

