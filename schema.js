
// Schema for 'Code' Collection
var codeItem =
    { 
	type: "bubble sort", // category of code
	uname: "Nishant Shukla", // original submitter
	uid: "abcdef12345", // original submitter
	lang: "java", // programming language
	code: "[code]", // implementation of code
	time: "Jan 31, 2013", // time created
	votes: 2, // ranking
	comments: [ ], 
	tags: ["sort", "naive"], // used for searching
	description: "This algorithm ...", // also used for searching
	email: "blah@email.com"
    }

// GET lang peek
// http://ec2-50-19-140-101.compute-1.amazonaws.com:8983/solr/collection1/select/?wt=json&q=*:*&fl=name&facet=true&facet.field=lang

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

// Google OAuth2
var googleOAuth2 = 
    {
	"provider":"google",
	"id":"104743215642512207964",
	"displayName":"Nishant Shukla",
	"name":
	{
	    "familyName":"Shukla",
	    "givenName":"Nishant"
	},
	"emails":
	[
	    {
		"value":"nick722@gmail.com"
	    }
	],
	"_raw":"{\n \"id\": \"104743215642512207964\",\n \"email\": \"nick722@gmail.com\",\n \"verified_email\": true,\n \"name\": \"Nishant Shukla\",\n \"given_name\": \"Nishant\",\n \"family_name\": \"Shukla\",\n \"link\": \"https://plus.google.com/104743215642512207964\",\n \"picture\": \"https://lh6.googleusercontent.com/-PMlwf9m_8NA/AAAAAAAAAAI/AAAAAAAAIo8/3GW0AXykATE/photo.jpg\",\n \"gender\": \"other\",\n \"locale\": \"en\"\n}\n",
	"_json":
	{
	    "id":"104743215642512207964",
	    "email":"nick722@gmail.com",
	    "verified_email":true,
	    "name":"Nishant Shukla",
	    "given_name":"Nishant",
	    "family_name":"Shukla",
	    "link":"https://plus.google.com/104743215642512207964",
	    "picture":"https://lh6.googleusercontent.com/-PMlwf9m_8NA/AAAAAAAAAAI/AAAAAAAAIo8/3GW0AXykATE/photo.jpg",
	    "gender":"other",
	    "locale":"en"
	}
    }


var googleAuth = 
    {
	displayName: "Nishant Shukla",
	emails: 
	[
	    {value: "nick722@gmail.com"}
	],
	name: 
	{
	    familyName: "Shukla",
	    givenName: "Nishant"
	},
	identifier:"https://www.google.com/accounts/o8/id?id=AItOawko8c_hlIiC0x8h3XYlZewRHPr8FnXidac"
    }
