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
	$('#search-results').append(
	    $('<div>').attr('class', 'result').append(
		"hi"
	    )
	);
    });
});
