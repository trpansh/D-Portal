// Copyright (c) 2014 International Aid Transparency Initiative (IATI)
// Licensed under the MIT license whose full text can be found at http://opensource.org/licenses/MIT


var view_list_publishers=exports;
exports.name="list_publishers";

var ctrack=require("./ctrack.js")
var plate=require("./plate.js")
var iati=require("./iati.js")
var fetch=require("./fetch.js")

var refry=require("../../dstore/js/refry.js")
var iati_codes=require("../../dstore/json/iati_codes.json")
var crs_year=require("../../dstore/json/crs_2012.json")

var commafy=function(s) { return (""+s).replace(/(^|[^\w.])(\d{4,})/g, function($0, $1, $2) {
		return $1 + $2.replace(/\d(?=(?:\d\d\d)+(?!\d))/g, "$&,"); }) };

// the chunk names this view will fill with new data
view_list_publishers.chunks=[
	"list_publishers_datas",
];

//
// display the view
//
view_list_publishers.view=function()
{
	view_list_publishers.chunks.forEach(function(n){ctrack.chunk(n,"{spinner_in_table_row}");});
	ctrack.setcrumb(1);
	ctrack.change_hash();
	view_list_publishers.ajax({q:ctrack.hash});
};

//
// Perform ajax call to get data
//
view_list_publishers.ajax=function(args)
{
	args=args || {};

	var dat={
			"from":"act,country",
			"limit":args.limit || -1,
			"select":"count,reporting_ref,reporting",
			"groupby":"reporting_ref",
			"orderby":"1-",
			"country_code":(args.country || ctrack.args.country)
		};
	if(args.q)
	{
		for(var n in args.q) // override with special qs
		{
			dat[n]=args.q[n];
		}
	}
	if(args.output=="count") // just count please
	{
		dat.select="count";
		delete dat.limit;
		delete dat.orderby;
		delete dat.groupby;
	}
		
	fetch.ajax(dat,function(data){
		if(args.output=="count")
		{
			ctrack.chunk(args.chunk || "list_publishers_count",data.rows[0]["count"]);
			view_stats.calc();
		}
		else
		{
			var s=[];
			for(var i=0;i<data.rows.length;i++)
			{
				var v=data.rows[i];
				var d={};
				d.num=i+1;

				d.reporting_ref=v.reporting_ref || "N/A";
				d.reporting=v.reporting || "N/A";
				d.count=commafy(""+Math.floor(v.count||0));

				s.push( plate.replace(args.plate || "{list_publishers_data}",d) );
			}
			ctrack.chunk(args.chunk || "list_publishers_datas",s.join(""));
			ctrack.chunk("numof_publishers" , data.rows.length );
		}
		if(args.callback){args.callback(data);}
		ctrack.display();
	});
}
