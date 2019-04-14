const Lib = require("./drawLib.js");

module.exports = function CrStatusClient(){

	var status = "Init";

	this.reset = function(){
		status = "Init";
	}

	this.save = function(){
		if(status == "Work") 
			status = "Save";
	}

	this.work = function(){
		if(status == "Init" || status == "Save"){
			status = "Work";
			Lib.getNode("InitBlanket").classList.add("invis");
		}
	}

	this.is = function(stat){
		return status == stat;
	}
}