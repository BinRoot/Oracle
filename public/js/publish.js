filepicker.setKey('AoO2NYenFQq2z9yVBtOEKz');
$('.hiddenAlert').hide();

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

    var id = parseInt(urlQuery.split('/').pop(), 10);
    console.log(id);

    if(isNaN(id)){
        $('.hiddenAlert').show();
    }
    else{
        //Add logic here to handle bad URLs so they can't mess up the script
        $.ajax({
        url: "https://api.github.com/gists/" + id,
        success: function(data, textStatus, jqXHR) {
            var files = data.files;
            for(var fileName in files) {
                var code = files[fileName].content;
                var lang = files[fileName].language;

                updateCode(lang, code);
                var children = $('#options').children();
                clearAllActiveChildren(children);
                $('#gistLI').addClass('active');

                break;
            }

            $('#gistModal').modal('toggle');
        }
        });
    }
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

//Add mimetype and ace language mappings here
//Language listing here https://github.com/ajaxorg/ace/tree/master/lib/ace/mode
var aceLanguages = {"text/x-java":"java", "text/x-python":"python", "application/javascript":"javascript"};
