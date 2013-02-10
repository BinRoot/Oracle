var upload = function(fpfile){
	console.log(fpfile);
	filepicker.read(fpfile, function(data){
		editor.setValue(data);
	});
};

$('#gist').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#gistLI').addClass('active');
});


function clearAllActiveChildren (children) {
    for(var i=0; i<children.length; i++) {
	var v = children[i]
	$(v).removeClass('active');
    }
}
