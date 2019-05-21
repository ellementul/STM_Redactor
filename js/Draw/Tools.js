require("./mof.js");
const Lib = require("./drawLib.js");


var tools_cont = Lib.getNode("Tools");

module.exports = function CrTools(){
	var pallet = {};
	var rotates = {};
	var type = "Pen";

	this.addGetSet("tile", 
		function(){
			if(pallet[type]) return pallet[type].id;
		},
		function(val){
			if(type == "Clear")
				type = "Pen";

			pallet[type] = val;
			rotates[type] = 0;
			changeTileView(pallet[type], rotates[type]);
		}
	);

	this.rotate = function(){
		if(type == "Pen"){
			rotates[type] = (rotates[type] + 1) % 4;
		}
	}

	this.getRot = function(){
		return rotates[type];
	}

	this.addGetSet("type", 
		function(){
			return type;
		},
		function(val){

			if(val == "Rotate"){
				this.rotate();
			}
			else
				type = val;

			changeTileView(pallet[type], rotates[type]);
		}
	);

	this.clear = function(){
		pallet = {};
		this.type = "Pen";
	}

	var tileView = null;

	function changeTileView(tile, rotate){
		if(tileView){
			tileView.remove();
			tileView = null;
		}

		if(tile){
			tileView = Lib.drawTile(tile.images[0], rotate);
			tools_cont.appendChild(tileView);
		}
	}
}