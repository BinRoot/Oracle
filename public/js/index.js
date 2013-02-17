$("#searchInput").typeahead({
    source: function(query, process) {
	$.get('/peek', { q: query }, function(data) {
	    var d = JSON.parse(data);
	    var types = [];		
	    for(var i=0; i<d.length; i++) {
		types.push(d[i].type + " ("+d[i].sum+")");
	    }
	    process(types);
	});
    },
    updater: function (item) {
	var splits = item.split(' ');
	item = "";
	for(var i=0; i<splits.length-1; i++) {
	    item = item + " " + splits[i];
	}
        return item;
    },
    minLength: 1
});

