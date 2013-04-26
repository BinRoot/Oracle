$(document).ready(function() {
    var userExtra = JSON.parse($('#userExtraHolder').html());
    var code = JSON.parse($('#codeHolder').html()).docs[0];

    console.log(JSON.stringify(userExtra));
    console.log(JSON.stringify(code));

    if(userExtra && userExtra.votes) {
	if(userExtra.votes.indexOf(code.id) != -1) {
	    $('#upvote').addClass('upvoted');
	    $('#upvote').click();
	}
    }
});

$('#search-input').typeahead(
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


hljs.initHighlightingOnLoad();

$('#find-button').click(function() {
    var searchStr = $('#type').val();
    search(searchStr);
});

$('.search-bar input').keypress(function(e){
    if(e.which == 13){
	var searchStr = $('#type').val();
	search(searchStr);
    }
});


function search(searchStr) {
    window.location = "/?q=" + searchStr;
}

$('#upvote').click(function(){
    if( $(this).hasClass('upvoted') ) {
	console.log('already upvoted, doing nothing');
	$(this).effect("bounce", {distance: 5} , 500).animate({color: "#ff5700"}, 200 );
    }
    else {
	console.log('upvoting..');

	var code = JSON.parse($('#codeHolder').html()).docs[0];
	var userExtra = JSON.parse($('#userExtraHolder').html());

	// if user signed in
	if(userExtra) {
	    $.ajax({
		url: "/api/vote?cid="+code.id,
	    }).done(function ( data ) {
		console.log('done voting: '+data);
		$('#upvote').effect("bounce", {distance: 5} , 500).animate({color: "#ff5700"}, 200 );
		$('#upvote').addClass('upvoted');
	    });
	}
	else {
	    console.log('user not signed in');
	    window.location.href = '/auth/google';
	}

    }
});

