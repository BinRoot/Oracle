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
  //Hacky but we can fix it
  $("#profPic").attr("src", 'http://gravatar.com/avatar/'+ gravatarHash($("#emailHolder").html()) + '?s=100');
});
