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
    console.log('Followed condition was true');
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
       $('#profPic').attr('title', 'Following!').tooltip('fixTitle').tooltip('show');
       $('#profPic').addClass("following", 800);
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


$(document).ready(function() {

});