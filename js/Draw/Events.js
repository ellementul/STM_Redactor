function IdsEvents(ids, name_events, func){
	if(Array.isArray(ids)){
		ids.forEach(id => IdEvents(id, name_events, func));
	}else IdEvents(ids, name_events, func);
}

function IdEvents(id, name_events, func){
	if(Array.isArray(name_events)){
		name_events.forEach(name => IdEvent(id, name, func));
	}else IdEvent(id, name_events, func);
}

function IdEvent(id, name_event, func){
	
	if(name_event == "submit"){
		var old_func = func;
		func = function(e){
			e.preventDefault();
			old_func.apply(this, arguments);
		} 
	}
	
	getNode(id).addEventListener(name_event, func);
}

function Submit(func){
	return function(event){
		event.preventDefault();
		func.apply(this, arguments);
	}
}

function getNode(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}

module.exports = IdsEvents;
