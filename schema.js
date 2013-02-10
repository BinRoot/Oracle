
// Schema for 'Code' Collection
var codeItem =
    { 
	type: "bubble sort", // category of code
	name: "binroot", // original author
	uid: "abcdef12345", // original author
	language: "java", // programming language
	code: "code", // implementation of code
	timestamp: "Jan 31, 2013", // time created
	points: 2, // ranking
	comments: [ ],
	tags: ["sort", "naive"],
	description: "This algorithm ..."
    }

// @commentObject
var commentObject =
    {
	name: "BinRoot",
	id: "abcd123",
	text: "",
	points: 4
    }

// Schema for 'User' Collection
var userItem = 
    {
	name: "phiV",
	id: "lk3jd3ljflq",
	timestamp: "Jan 30, 2013",
	history: [{action: "edit", name:"Bubble sort", lang:"Java", cid:"3x42sw"}]
    }