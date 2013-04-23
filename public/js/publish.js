$("#missingType").hide();
$("#missingCode").hide();

var allowLangGuessing = true;

$('#type').typeahead(
    {
        source: function(query, process) {

            $.ajax({
                url: "/peek?q="+query.toLowerCase(),
            }).done(function ( data ) {
                var facets = JSON.parse(data);

		var strs = [];
                _.each(facets, function(fItem, i) {
                    strs.push(fItem.str + " ("+fItem.val+")");
                });

		console.log(JSON.stringify(strs));

                process(strs);
            });

        },
        updater: function(item) {
            var splits = item.split(" ");
            var outStr = [];
	        for(var i=0; i<splits.length-1; i++) {
                outStr.push(splits[i]);
            }
            return outStr;
        }
    }
);


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
                var extension = '.' + fpfile.filename.split('.').pop();
		console.log('filepicker extension: '+extension);
                updateCode(aceLanguages[extension], data);
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
    allowLangGuessing = false;
    var lang = $(this).text();
    $('#selectedLanguage').html( lang + ' <span class="caret"></span>');
    editor.getSession().setMode("ace/mode/" + lang.toLowerCase());
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
        dataType: 'jsonp',
        success: function(data, textStatus, jqXHR) {
            var files = data.data.files;
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
    allowLangGuessing = false;

    editor.setValue(code);

    console.log('updateCode, lang: '+lang);

    if(typeof lang === 'undefined'){
        editor.getSession().setMode(null);
        $('#selectedLanguage').html( "other" + ' <span class="caret"></span>');
    }
    else{
        console.log("Setting code to language " + lang);
        editor.getSession().setMode("ace/mode/" + lang);
        $('#selectedLanguage').html( lang.charAt(0).toUpperCase() + lang.slice(1) + ' <span class="caret"></span>');
    }
}


editor.getSession().on('change', function(e) {
    if(allowLangGuessing) {
	var code = editor.getValue();

	var out = hljs.highlightAuto(code);

	console.log(JSON.stringify(out.language));
	if(out.second_best) {
	    console.log(JSON.stringify(out.second_best.language));
	}
	console.log('-');

	var lang = out.language;
	if(lang) {
	    $('#selectedLanguage').html( lang.charAt(0).toUpperCase() + lang.slice(1) + ' <span class="caret"></span>');
	    editor.getSession().setMode("ace/mode/" + lang);
	}
    }
});




function clearAllActiveChildren(children) {
    for(var i=0; i<children.length; i++) {
	var v = children[i];
	$(v).removeClass('active');
    }
}

function postPublish () {

    var data_type = $('#type').val().toLowerCase();

    if(data_type.length == 0) {
	console.log('No text');
    }
    else {
	var data_lang = gistLanguages[$('#selectedLanguage').text().trim()];
	var data_code = editor.getValue();

	if(data_type === ""){
            $('#missingType').show();
            return;
	}
	else if(data_code === ""){
            $('#missingCode').show();
            return;
	}

	var postData = {
	    type: data_type,
	    lang: data_lang,
	    code: data_code
	};

	console.log('post data is ', JSON.stringify(postData));

	$.post("/publish", postData, function(data){
	    $('#find-button').text("Done!");
	    console.log(data);
	});
	
    }



//    search(data_type);
}

function search(str) {
    window.location = "/?q="+str;
}

//Add mimetype and ace language mappings here
//Language listing here https://github.com/ajaxorg/ace/tree/master/lib/ace/mode
var aceLanguages = {
                    ".java":"java",
                    ".py":"python",
                    ".js":"javascript",
                    ".rb":"ruby",
                    ".hs":"haskell",
                    ".cpp":"c_cpp",
                    ".sh":"shell",
                    ".php": "php",
                    ".pl":"perl",
                    ".m": "objectivec",
                    ".cs":"csharp",
                    ".coffee": "coffee",
                    ".go":"golang",
                    ".scm":"scheme",
                    ".ss":"scheme"
                };

var gistLanguages = {
                    "Java": "java",
                    "JavaScript":"javascript",
                    "Python" : "python",
                    "Haskell":"haskell",
                    "Ruby":"ruby",
                    "C++":"c_cpp",
                    "C":"c_cpp",
                    "Shell":"shell",
                    "PHP":"php",
                    "Perl":"perl",
                    "Objective-C": "objectivec",
                    "C#":"csharp",
                    "CoffeeScript":"coffee",
                    "Go":"golang",
                    "Scheme":"scheme"
                };
