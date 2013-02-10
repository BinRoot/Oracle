filepicker.setKey('AoO2NYenFQq2z9yVBtOEKz');

$('#upload').click(
	function(){
		console.log("Upload clicked");
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
	}
);