filepicker.setKey('AoO2NYenFQq2z9yVBtOEKz');

$('#upload').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#uploadLI').addClass('active');

    filepicker.pick(
		{
			services: ['GITHUB', 'COMPUTER', 'GOOGLE_DRIVE', 'URL'],
			maxSize: 100*1024
		},
		function(fpfile){
			filepicker.read(fpfile, function(data){
			editor.setValue(data);
			editor.setReadOnly(true);
		});
    });
});

$('#gist').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#gistLI').addClass('active');
});


function clearAllActiveChildren (children) {
    for(var i=0; i<children.length; i++) {
		var v = children[i];
		$(v).removeClass('active');
    }
}
