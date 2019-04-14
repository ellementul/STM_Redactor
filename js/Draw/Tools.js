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

	this.clear = function(){
		pallet = {};
		this.type = "Pen";
	}

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