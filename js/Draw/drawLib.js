exports.drawList = function(container, list, change_class){

	for (var val in list){
		var opt = document.createElement("p");
		opt.value = list[val];
		opt.innerHTML = val;
		opt.onclick = onclick;
		container.appendChild(opt);
	}
	var defOpt = container.children[0];
	container.value = defOpt.value;
	defOpt.classList.add(change_class);

	return container;

	function onclick(){
		Array.from(this.parentElement.children).forEach(elem => elem.classList.remove(change_class));
		this.parentElement.value = this.value;
		this.classList.add(change_class);
	}
}

exports.drawTile = function(svg_img){
	
	var img = document.createElement('img');
	img.src = "data:image/svg+xml;base64,"+ Base64.encode(svg_img);

	img.classList.add("tile");
	
	return img;
}

exports.getNode = function(id){
	var elem = document.getElementById(id);
	if(!elem) throw new Error("Elem is not find!");
	return elem;
}