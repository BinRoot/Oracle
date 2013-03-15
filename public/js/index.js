$('.search-bar input').focus(function() {
    $(this).parent().addClass('focus');
});

$('.search-bar input').blur(function() {
    $(this).parent().removeClass('focus');
});

$('#find-button').click(function() {
    var searchStr = $('#search-input').val();
    
    var searchURL = '/search?q=' + searchStr;

    $.get(searchURL, function(data) {
	console.log(data);

	data = JSON.parse(data);

	var langFreq = [];

	$('#search-results').empty();

	for(var i=0; i<data.docs.length; i++) {
	    var docItem = data.docs[i];
	    
	    var voteStr = docItem.votes>1 ? "votes" : "vote";

	    // check if exists
	    var found = false;
	    for(var j=0; j<langFreq.length; j++) {
		if(langFreq[j].lang == docItem.lang) { // found it, increase it by 1
		    langFreq[j].value++;
		    found = true;
		    break;
		}
	    }
	    if(!found) {
		langFreq.push({lang: docItem.lang, value: 1});
	    }
	    
	    $('#search-results').append(
		$('<div>').addClass('result').append(
		    $('<ul>').addClass('inline-block').append(
			$('<li>').append(
			    $('<div>').addClass('avatars').append(
				$('<div>').addClass('circular').css('background', 'url(http://gravatar.com/avatar/7bb3f29d02f3cb9e350616b849452b7b?s=100) no-repeat;')
			    ).append(
				$('<div>').addClass('votes').append(
				    $('<span>').addClass('votes-num').append(
					docItem.votes
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
					"By "+docItem.uname
				    ).append(
					$('<span>').addClass('comments').append(
					    "0 comments"
					)
				    )
				).append(
				    $('<div>').addClass('snippet').append(
					"<pre><code>"+ docItem.code +"</code></pre>"
				    )
				)

			    )
			
			)
		    )
		)
	    )
	    

	}

	langFreq = langFreq.sort(function(a,b) {return b.value-a.value});
	console.log('sorted lang freq: '+JSON.stringify(langFreq));
	
	$('#language-results').empty();

	for(var i=0; i<langFreq.length; i++) {

	    var langClass = i==0 ? 'lang-item lang-active' : 'lang-item';

	    $('#language-results').append(
		$('<div>').addClass(langClass).append(
		    $('<span>').append(
			titleCase(langFreq[i].lang) + " "
		    ).append(
			$('<span>').addClass('lang-number').append(
			    langFreq[i].value
			)
		    )
		)
	    );
	    
	    if(i < langFreq.length-1) {
		$('#language-results').append("<hr>");
	    }
	}
	    

    });
});

function titleCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
