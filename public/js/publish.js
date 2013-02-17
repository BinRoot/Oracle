$('.typeahead').typeahead({source: ["aaa", "bbb"]});

$("#type").typeahead({
        source: function(query, process) {
        $.get('/search', { q: query }, function(data) {
        var d = JSON.parse(data);
		var types = [];
		for(var i=0; i<d.length; i++) {
            types.push(d[i].type + " ("+d[i].sum+")");
		}
		process(types);
        });
	},
        updater: function (item) {
            var splits = item.split(' ');
            item = "";
            for(var i=0; i<splits.length-1; i++) {
                item = item + " " + splits[i];
            }

            return item;
        },
        minLength: 1
    });


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

    var intRegex = /^\d+$/;

    // var id = parseInt(urlQuery.split('/').pop(), 10);

    if(!intRegex.test(urlQuery.split('/').pop())){
        console.log("No Number found");
        $('.hiddenAlert').show();
    }
    else{
        var id = urlQuery.split('/').pop();
        console.log("Number found");
        //Add logic here to handle bad URLs so they can't mess up the script
        $.ajax({
        url: "https://api.github.com/gists/" + id,
        success: function(data, textStatus, jqXHR) {
            var files = data.files;
            for(var fileName in files) {
                var code = files[fileName].content;
                var lang = files[fileName].language;

                console.log(lang);

                updateCode(gistLanguages[lang], code);
                var children = $('#options').children();
                clearAllActiveChildren(children);
                $('#gistLI').addClass('active');

                break;
            }

            $('#gistModal').modal('toggle');
        },
        error: function(){
            $('.hiddenAlert').show();
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
//Language listing here https://github.com/ajaxorg/ace/tree/master/lib/ace/mode
var aceLanguages = {"text/x-java":"java", "text/x-python":"python", "application/javascript":"javascript"};
var gistLanguages = {"JavaScript":"javascript", "Python" : "python"};

