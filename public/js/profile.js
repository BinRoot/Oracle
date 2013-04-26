hljs.initHighlightingOnLoad();

function scrollTo(id){
  $('html, body').animate({
    scrollTop: $("#" + id).offset().top
  }, 500);
}

$("#snippetScroll").click(function(){
  scrollTo("snippetSection");
});

$("#commentScroll").click(function(){
  scrollTo("commentSection");
});

$("#voteScroll").click(function(){
  scrollTo("voteSection");
});

$('#profPic').tooltip({
  placement: 'left',
  title: 'Follow in 3 seconds...'
});

var followed;
var myTimeOut1, myTimeOut2, myTimeOut3;
$('#profPic').mouseenter(function() {
  if(followed === true){
    return;
  }
  else{
    myTimeOut1 = setTimeout(function() {
       $('#profPic').attr('title', 'Follow in 2 seconds...').tooltip('fixTitle').tooltip('show');
     }, 1000);
     myTimeOut2 = setTimeout(function() {
       $('#profPic').attr('title', 'Follow in 1 seconds...').tooltip('fixTitle').tooltip('show');
     }, 2000);
     myTimeOut3 = setTimeout(function() {
       $('#profPic').addClass("following", 800);
       $('#profPic').attr('title', 'Following!').tooltip('fixTitle').tooltip('show');
       followed = true;
     }, 3000);
   }
}).mouseleave(function() {
  if(!followed){
    clearTimeout(myTimeOut1);
    clearTimeout(myTimeOut2);
    clearTimeout(myTimeOut3);
  }
});

function gravatarHash(email) {
    if(email)
      return md5(email.trim().toLowerCase());
    else return 0;
}

$(document).ready(function() {
    $("#profPic").attr("src", 'http://gravatar.com/avatar/'+ gravatarHash($("#emailHolder").html()) + '?s=100');

    console.log('profileHolder: '+ $('#profileHolder').html());

    var profile = JSON.parse($('#profileHolder').html());
    
    if(profile && profile.votes) {
	$.ajax({ url: "/api/codes?ids="+JSON.stringify(profile.votes) }).done( function ( data ) {
	    console.log('api/codes data: '+data);
	    var codes = data;
	    buildVotes(codes);
	});
	$('#voteScroll').text(profile.votes.length);
    }


});

function buildVotes(codes) {
    $('#votes').empty();

    _.each(codes, function(code, i) {
	$('#votes').append(
	    $('<div>').addClass('row').append(
		$('<div>').addClass('span7').append(
		    $('<span>').append('<a href="/a/'+code.id+'">'+code.type+'</a> <a href="/u/'+code.uid+'"> <i class="icon-user"> </a>')
		).append(
		    $('<span style="float: right;">'+prettyDate(code.timestamp)+'</span>')
		)
	    )
	)
    });
}

// Thanks to http://ejohn.org/files/pretty.js
function prettyDate(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
    diff = (((new Date()).getTime() - date.getTime()) / 1000),
    day_diff = Math.floor(diff / 86400);
    
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
	return;
    
    return day_diff == 0 && (
	diff < 60 && "just now" ||
	    diff < 120 && "1 minute ago" ||
	    diff < 3600 && Math.floor( diff / 60 ) + " minutes ago" ||
	    diff < 7200 && "1 hour ago" ||
	    diff < 86400 && Math.floor( diff / 3600 ) + " hours ago") ||
	day_diff == 1 && "Yesterday" ||
	day_diff < 7 && day_diff + " days ago" ||
	day_diff < 31 && Math.ceil( day_diff / 7 ) + " weeks ago";
}

// If jQuery is included in the page, adds a jQuery plugin to handle it as well
if ( typeof jQuery != "undefined" )
    jQuery.fn.prettyDate = function(){
	return this.each(function(){
	    var date = prettyDate(this.title);
	    if ( date )
		jQuery(this).text( date );
	});
    };
