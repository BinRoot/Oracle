$('.search-bar input').focus(function() {
	$(this).parent().addClass('focus');
});

$('.search-bar input').blur(function() {
	$(this).parent().removeClass('focus');
});