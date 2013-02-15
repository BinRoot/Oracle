
// Schema for 'Code' Collection
var codeItem =
    { 
	type: "bubble sort", // category of code
	name: "binroot", // original author
	uid: "abcdef12345", // original author
	language: "java", // programming language
	code: "[code]", // implementation of code
	timestamp: "Jan 31, 2013", // time created
	points: 2, // ranking
	comments: [ ], 
	tags: ["sort", "naive"], // used for searching
	description: "This algorithm ..." // also used for searching
    }

// Schema for 'User' Collection
var userItem = 
    {
	name: "phiV",
	uid: "lk3jd3ljflq",
	timestamp: "Jan 30, 2013",
	rep: 30,
	history: [ 
	    {action: "edit", name:"Bubble sort", lang:"Java", cid:"3x42sw", timestamp:"Jan 31, 2013"},
	    {action: "publish", name:"Djikstra's Sortest Path", lang:"Python", cid:"la9a3a", timestamp:"Jan 30, 2013"},
	    {action: "star", name:"Binary Tree", lang:"Haskell", cid:"f2lf2", timestamp:"Jan 30, 2013"},
	    {action: "comment", cid:"11" name:"Binary Tree", lang:"Haskell", cid:"f2lf2", timestamp:"Jan 30, 2013"}
	]
    }
