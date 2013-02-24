$('#submit').click(function(){
    var description = $('#description').val();
    var attribution = {};
    if($('#prependedNameInput').val() && $('#prependedEmailInput').val()){
        attribution.name = $('#prependedNameInput').val();
        attribution.email = $('#prependedEmailInput').val();
    }
    if($('input:radio[name=options]:checked').val() !== undefined){
        attribution.source = $('input:radio[name=options]:checked').val();
    }

    var tags = $('#tags').val().split(',');

    //Make post request to backend after ensuring enough data is entered
    alert("Description: " + description + "\nAttribution: " + attribution + "\nTags: " + tags);
});