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
	    console.log('item selected: '+item)
	    var splits = item.split(" ");
	    var outStr = "";
	    for(var i=0; i<splits.length-1; i++) {
		if(i == splits.length-2) {
		    outStr = outStr + splits[i];
		} 
		else {
		    outStr = outStr + splits[i] + " ";
		}
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
                updateCode(fileToAceMap[extension], fileToDbMap[extension], data);
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

    editor.getSession().setMode("ace/mode/" + displayToAceMap[lang]);

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

                updateCode(displayToAceMap[lang], displayToDbMap[lang], code);
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

function updateCode(aceLang, dbLang, code) {
    allowLangGuessing = false;

    editor.setValue(code);

    console.log('updateCode, db-lang: '+dbLang);

    if(typeof aceLang === 'undefined'){
        editor.getSession().setMode(null);
//        $('#selectedLanguage').html( "other" + ' <span class="caret"></span>');
    }
    else{
        console.log("Setting code to language " + aceLang);
        editor.getSession().setMode("ace/mode/" + aceLang);

        $('#selectedLanguage').html( dbToDisplayMap[dbLang] + ' <span class="caret"></span>');
    }
}

// TODO add highlight mapping!!
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
	    $('#selectedLanguage').html( highlightToDisplayMap[lang] + ' <span class="caret"></span>');
	    editor.getSession().setMode("ace/mode/" + highlightToAceMap[lang]);
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
    var data_lang = displayToDbMap[$('#selectedLanguage').text().trim()];
    var data_code = editor.getValue();

    if(data_type.length == 0) {
	console.log('no type');
        $('#missingType').show();
	return;
    }
    if(data_code.length == 0) {
	console.log('no code');
	$('#missingCode').show();
	return;
    }
    if(!data_lang) {
	console.log('Err: data_lang is null.');
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
	window.location = "/a/"+data;
    });
	




//    search(data_type);
}

function search(str) {
    window.location = "/?q="+str;
}

//Add mimetype and ace language mappings here
//Language listing here https://github.com/ajaxorg/ace/tree/master/lib/ace/mode
var fileToAceMap = {
                    ".java":"java",
                    ".js":"javascript",
                    ".py":"python",
                    ".hs":"haskell",
                    ".rb":"ruby",
                    ".cpp":"c_cpp",
                    ".c":"c_cpp",
                    ".sh":"shell",
                    ".php": "php",
                    ".pl":"perl",
                    ".m": "objectivec",
                    ".cs":"csharp",
                    ".coffee": "coffee",
                    ".go":"golang",
                    ".scm":"scheme",
                    ".ss":"scheme",
                    ".html":"html",
                    ".css":"css",
                    ".tex":"tex"
                };

var fileToDbMap = {
                    ".java":"java",
                    ".js":"javascript",
                    ".py":"python",
                    ".hs":"haskell",
                    ".rb":"ruby",
                    ".cpp":"c_cpp",
                    ".c":"c", //This is the only difference
                    ".sh":"shell",
                    ".php": "php",
                    ".pl":"perl",
                    ".m": "objectivec",
                    ".cs":"csharp",
                    ".coffee": "coffee",
                    ".go":"golang",
                    ".scm":"scheme",
                    ".ss":"scheme",
                    ".html":"html",
                    ".css":"css",
                    ".tex":"tex"
                };


// mapping from drop-down displayed language --> ace lang
var displayToAceMap = {
                    "Java": "java",
                    "JavaScript":"javascript",
                    "Python" : "python",
                    "Haskell":"text",
                    "Ruby":"ruby",
                    "C++":"c_cpp",
                    "C":"c_cpp",
                    "Shell":"sh",
                    "PHP":"php",
                    "Perl":"perl",
                    "Objective-C": "objectivec",
                    "C#":"csharp",
                    "CoffeeScript":"coffee",
                    "Go":"golang",
                    "Scheme":"text",
                    "HTML":"html",
                    "CSS":"css",
                    "Matlab":"text",
                    "Tex":"tex"
                };

var highlightToAceMap = {
    "bash": "shell",
    "cs": "csharp",
    "ruby": "ruby",
    "javascript": "javascript",
    "css": "css",
    "xml": "html",
    "java": "java",
    "php": "php",
    "haskell": "text",
    "python": "python",
    "tex": "tex",
    "perl": "perl",
    "objectivec": "objectivec",
    "coffeescript": "coffee",
    "cpp": "cpp",
    "matlab": "text",
    "go": "go",
}

var highlightToDisplayMap = {
    "bash": "Shell",
    "cs": "C#",
    "ruby": "Ruby",
    "javascript": "JavaScript",
    "css": "CSS",
    "xml": "HTML",
    "java": "Java",
    "php": "PHP",
    "haskell": "Haskell",
    "python": "Python",
    "tex": "Tex",
    "perl": "Perl",
    "objectivec": "Objective-C",
    "coffeescript": "CoffeeScript",
    "cpp": "C++",
    "matlab": "Matlab",
    "go": "Go",
}


var displayToDbMap = {
                    "Java": "java",
                    "JavaScript":"javascript",
                    "Python" : "python",
                    "Haskell":"haskell",
                    "Ruby":"ruby",
                    "C++":"c_cpp",
                    "C":"c", // This is the only diff
                    "Shell":"sh",
                    "PHP":"php",
                    "Perl":"perl",
                    "Objective-C": "objectivec",
                    "C#":"csharp",
                    "CoffeeScript":"coffee",
                    "Go":"golang",
                    "Scheme":"text",
                    "HTML":"html",
                    "CSS":"css",
                    "Matlab":"text",
                    "Tex":"tex"
                };

var dbToDisplayMap = {};
for(var disp in displayToDbMap){
    dbToDisplayMap[displayToDbMap[disp]] = disp;
}

