filepicker.setKey('AoO2NYenFQq2z9yVBtOEKz');

$('#upload').click(function() {
    var children = $('#options').children();
    clearAllActiveChildren(children);
    $('#uploadLI').addClass('active');

    filepicker.pick(
		{
			services: ['GITHUB', 'DROPBOX', 'GOOGLE_DRIVE', 'COMPUTER', 'URL'],
			maxSize: 100*1024
		},
		function(fpfile){
			filepicker.read(fpfile, function(data){
            updateCode(aceLanguages[fpfile.mimetype], data);
		});
    });
});

$('#gist').click(function() {
    var children = $('#options').children();
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

    if(urlQuery.indexOf("gist.github.com") == -1) {
	// if user entered the id without the URL prefix
	urlQuery = "https://api.github.com/gists/" + urlQuery;
    }

    $.ajax({
	url: "https://api.github.com/gists/4711213",
	success: function(data, textStatus, jqXHR) {
	    var files = data.files;
	    for(var fileName in files) {
		var code = files[fileName].content;
		var lang = files[fileName].language;

		updateCode(lang, code);
		clearAllActiveChildren(children);
		$('#gistLI').addClass('active');
		break;
	    }
	}
    });
});

function updateCode(lang, code) {
    editor.setValue(code);

    if(typeof lang === 'undefined'){
        editor.getSession().setMode(null);
        $('#selectedLanguage').html( "other" + ' <span class="caret"></span>');
    }
    else{
        editor.getSession().setMode("ace/mode/" + lang);
        $('#selectedLanguage').html( lang.charAt(0).toUpperCase() + lang.slice(1) + ' <span class="caret"></span>');
    }

    
}

function clearAllActiveChildren(children) {
    for(var i=0; i<children.length; i++) {
	var v = children[i];
	$(v).removeClass('active');
    }
}

function postPublish () {

    var data_type = $('#type').val().toLowerCase();
    var data_lang = $('#selectedLanguage').text().trim().toLowerCase();
    var data_code = editor.getValue();

    var postData = {
	type: data_type,
	lang: data_lang,
	code: data_code
    };

    $.post("/publish", postData, function(data){
        console.log(data);
    });

}

//Add mimetype and ace language mappings here
var aceLanguages = {"text/x-java":"java", "text/x-python":"python", "application/javascript":"javascript"};

