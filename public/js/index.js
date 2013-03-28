window.onload = function() {
    var prmstr = window.location.search.substr(1);
    var prmarr = prmstr.split ("&");
    var params = {};

    for ( var i = 0; i < prmarr.length; i++) {
	var tmparr = prmarr[i].split("=");
	params[tmparr[0]] = tmparr[1];
    }

    var searchQuery = params.q;
    if(searchQuery) {
	search(searchQuery);
    }
};


$('.search-bar input').focus(function() {
    $(this).parent().addClass('focus');
});

$('.search-bar input').blur(function() {
    $(this).parent().removeClass('focus');
});

searchData = null;

$('.search-bar input').keypress(function(e){
    if(e.which == 13){
	var searchStr = $('#search-input').val();
	search(searchStr);
    }
});

$('#find-button').click(function() {
    var searchStr = $('#search-input').val();
    search(searchStr);
});

function search(searchStr) {
    var searchURL = '/search?q=' + searchStr;

    $.get(searchURL, function(data) {

    	console.log(data);
    	data = JSON.parse(data);

    	if(data.docs.length > 0) {
	    
	    $('#lang-and-code-results').removeClass('hidden');

	    searchData = data.docs;

    	    var langFreq = sortLanguages(data.docs);
    	    showLanguages(langFreq);

    	    var langToShow = langFreq[0].lang;
	    langItemClick(langToShow);
    	}
    	else {
    	    noResults();
	}
    });
}

$('#publish-bar').click(function() {
    window.location = "/publish";
});

$('.snippet').click(function() {
    alert('hi');
});


function langItemClick(langToShow) {
    console.log('showing lang: '+langToShow);
    selectLanguage(langToShow);
    showResults(searchData, langToShow);
}


function noResults() {
    $('#lang-and-code-results').addClass('hidden');
    $('#language-results').empty();
    $('#search-results').empty();
}

function sortLanguages(docs) {
    var langFreq = [];
    _.each(docs, function(docItem, i, list) {

	var found = false;
	for(var j=0; j<langFreq.length; j++) {
	    if(langFreq[j].lang == docItem.lang) {
		langFreq[j].value++;
		found = true;
		break;
	    }
	}
	if(!found) {
	    langFreq.push({lang: docItem.lang, value: 1});
	}
    });

    // sort list of languages
    langFreq = langFreq.sort(function(a,b) {return b.value-a.value});
    console.log('sorted lang freq: '+JSON.stringify(langFreq));

    return langFreq;

}

function titleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function gravatarHash(email) {
    if(email)
	return md5(email.trim().toLowerCase());
    else return 0;
}

function showLanguages(langFreq) {
    $('#language-results').empty();

    for(var i=0; i<langFreq.length; i++) {

	buildLangResults(langFreq[i].lang, langFreq[i].value);

	if(i < langFreq.length-1) {
	    $('#language-results').append("<hr>");
	}
    }

}

function showResults(docs, lang) {
    $('#search-results').empty();

    _.each(docs, function(docItem, i, list) {

	if(lang == docItem.lang) {
	    var voteStr = docItem.votes>1 ? "votes" : "vote";

	    var imgURL = 'http://gravatar.com/avatar/'+gravatarHash(docItem.email)+'?s=100';
	    // http://gravatar.com/avatar/7bb3f29d02f3cb9e350616b849452b7b?s=100
	    buildSearchResults(imgURL, docItem.votes, voteStr, docItem.uname, docItem.code, docItem.lang);
	}
    });
}

function selectLanguage(lang) {
    var langList = $('#language-results').children();
    _.each(langList, function(langItem, i, list) {
	var langText = $($(langItem).children()[0]).text();
	var foundLang = langText.split(" ")[0].toLowerCase();
	$(langItem).removeClass();
	if(lang == foundLang) {
	    $(langItem).addClass('lang-item lang-active');
	}
	else if(foundLang) {
	    $(langItem).addClass('lang-item');
	}
    });

}

function buildLangResults(lang, value) {
    $('#language-results').append(
	$('<div>').addClass('lang-item').append(
	    $('<span>').append(
		titleCase(lang) + " "
	    ).append(
		$('<span>').addClass('lang-number').append(
		    value
		)
	    )
	).click(function() {
	    var langToShow = $(this).text().trim().split(" ")[0].toLowerCase();
	    langItemClick(langToShow);
	})
    )
}

function buildSearchResults(imgSrc, voteNum, voteStr, uname, code, lang) {
    $('#search-results').append(
	$('<div>').addClass('result').append(
	    $('<ul>').addClass('inline-block').append(
		$('<li>').append(
		    $('<div>').addClass('avatars').append(
			$('<img>').attr('src', imgSrc).addClass('img-circle')
		    ).append(
			$('<div>').addClass('votes').append(
			    $('<span>').addClass('votes-num').append(
				voteNum
			    ).append(
				$('<span>').addClass('votes-votes').append(
				    voteStr
				)
			    )
			)
		    )
		)
	    ).append(
		$('<li>').append(
		    $('<div>').addClass('meta').append(
			$('<div>').append(
			    $('<span>').append(
				"By "+uname
			    ).append(
				$('<span>').addClass('comments').append(
				    "0 comments"
				)
			    )
			).append(
			    $('<div>').addClass('snippet').append(
				"<pre><code>"+ code +"</code></pre>"
			    )
			)

		    )

		)
	    )
	)
    )

}
