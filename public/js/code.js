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
  $(this).effect("bounce", {distance: 5} , 500).animate({color: "#ff5700"}, 200 );
});

