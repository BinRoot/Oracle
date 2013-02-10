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
			editor.setValue(data); // TODO: call updateCode() instead!
			// editor.setReadOnly(true);
		});
    });
});

$('#gist').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#gistLI').addClass('active');
});

$('#type').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#typeLI').addClass('active');
});

$('#languages li').click(function() {
    $('#selectedLanguage').html( $(this).text() + ' <span class="caret"></span>');
});

$('#gistOK').click(function() {
    var urlQuery = document.getElementById('gistURL').value;
    $.ajax({
	url: "https://api.github.com/gists/4711213",
	success: function(data, textStatus, jqXHR) {
	    var files = data.files;
	    for(var fileName in files) {
		var code = files[fileName].content;
		var lang = files[fileName].language;

		updateCode(lang, code);
		
		break;
	    }
	}
    });
});

function updateCode(lang, code) {
    editor.setValue(code);

    editor.getSession().setMode(null);

    $('#selectedLanguage').html( lang + ' <span class="caret"></span>');
}

function clearAllActiveChildren(children) {
    for(var i=0; i<children.length; i++) {
	var v = children[i];
	$(v).removeClass('active');
    }
}

var aceLanguages = ["java", "python"];
