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

