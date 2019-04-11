const Base64 = require('js-base64').Base64;

const CrViewLogic = require("./ViewLogic.js");

const Hear = require("./Events.js");

const CrAddForm = require("./AddForm.js");
const CrTool = require("./Tools.js");
const CrTiles = require("./Tiles.js");
const CrMap = require("./Map.js");




var Status = new CrStatusClient();

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
		if(Status.is("Save")){
			if(mess.type == "Tiles")
				save_stronge.tiles = mess.data;
			if(mess.type == "Map")
				save_stronge.map = mess.data;
			save_stronge.save();
		}

	}
}

var save_stronge = {
	tiles: null, 
	map: null,
	save: function(){
		if(this.tiles && this.map){
			var file = JSON.stringify({
				name: "Map",
				tiles: this.tiles,
				map: this.map
			});
			console.log(file);
			this.tiles = null;
			this.map = null;
			Status.work();
		}
	}
};

function CrStatusClient(){

	var status = "Work";

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