var upload = function(fpfile){
	console.log(fpfile);
	filepicker.read(fpfile, function(data){
		editor.setValue(data);
	});
};