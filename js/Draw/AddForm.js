const Lib = require("./drawLib.js");

var CrList = Lib.drawList;
var durability_types_list = require("../types_durability.json");


var durability_types_cont = Lib.getNode("DurabilityTypes");
var images_cont = Lib.getNode("Images");
var tile_size_cont = Lib.getNode("TileSize");

module.exports = function CrAddForm(){
	return {
			Images: new CrImages(images_cont),
			Type: new CrList(durability_types_cont, durability_types_list, "option-change"),
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
			if(images.length > 0) return [images[0]];
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