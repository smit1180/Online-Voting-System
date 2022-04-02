
const express = require('express')
const app = express();
const hostname = '127.0.0.99';
const port = 3000;
require('dotenv').config();
// ================================ connecting voter server ===============================

// ==================================================================


let alert = require('alert');
let window = require('window');
var session = require('express-session') 
var flash = require('connect-flash');
app.use(express.urlencoded({ extended: false}))

app.use(session({
    secret: 'secret',
    cookie: {maxAge: 60000},
    resave: false,
    saveUninitialized: false
}));
app.use(flash());


app.use(express.urlencoded({ extended: false}))
app.use('/views',express.static('views'))

const {createPool
}=require('mysql');

const pool=createPool({
    host:"localhost",
    user:"root",
    password : process.env.DBPASSWORD,
    database:"sdp_project",
    connectionLimit:10
});



// *************************************************  All Global Variables declare *******************************************************

var Aid="";
var Aid_dash=""
var Aid_add_candi="";
var Aid_edit_candi="";
var fetch_confirm;
var Aid_logout="";
var Aid_login=""
var start_voting_time="";
var stop_voting_time="";
var reset_voting_status = 0;
var start_voting_process = 0;
var stop_voting_process = 0;

function check_voting_status(req,res)
{

    console.log("--==>> function call --->    reset_voting_status = " + reset_voting_status  + "   stop_voting_process = " + stop_voting_process +  " start_voting_process = " + start_voting_process );

    pool.query('select * from candidate',(err,result,fields)=>{
        try
        {
            if(result.length<=0)
            {
                res.redirect('http://127.0.0.99:3000/adminDashboard');
            }
            else
            {
                res.redirect('http://127.0.0.99:3000/adminDashboard');
            }
        }
        catch(err)
        {
            res.redirect('http://127.0.0.99:3000/adminDashboard');
        }
    });
}

// *************************************************  All Global Variables declare ENDS HERE*******************************************************

// *************************************************  Admin login server CODE STARTS FROM HERE*******************************************************

app.get('/adminLogin',(req,res) =>{
    res.render('AdminLogin.ejs',{message: req.flash('message')});
})


app.post('/Adminlogin',async (req,res) => 
{
    console.log('post method');
    Aid=req.body.Adminname
    var password=req.body.Adminpassword
    pool.query('select AdminId from Admin where AdminId=? and AdminPassword=?',[Aid,password],(err,result,fields)=>{
        try
        {
                console.log('result = ' + result);
            if(result.length<=0)
            {
                console.log('loginfailed , login again');
                req.flash('message','Please Enter correct details');
                res.redirect('http://127.0.0.99:3000/adminLogin');
            }  
            else
            {
                Aid_login=Aid;
                check_voting_status(req,res);
            }
        }
        catch(err)
        {
            req.flash('message','Enter correct details');
            res.redirect('http://127.0.0.99:3000/adminLogin');
        }
    })

})


// *************************************************  Admin login SERVER CODE ENDS HERE*******************************************************


// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// *************************************************  Admin dashboard server CODE STARTS FROM HERE*******************************************************

app.get('/adminDashboard',(req,res) =>{


        Aid_add_candi=Aid;
        Aid_edit_candi=Aid;
        Aid_dash=Aid;
        console.log(Aid_add_candi);
        console.log(Aid_edit_candi);
        console.log("Aid_add_candi = "+Aid_add_candi);
        console.log("Aid = "+ Aid);


        if(Aid==="" && Aid_dash==="")
        { 
            res.redirect('http://127.0.0.99:3000/adminLogin');
        }
        else
        {
            if(reset_voting_status == 0 && stop_voting_process == 0 && start_voting_process == 0)
            {
                pool.query('select * from candidate',(err,result,fields)=>{
                    try
                    {
                        if(result.length<=0)
                        {
                            req.flash('adminid',Aid + " -- Voting process is 'not yet started'");
                            res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
                        }
                        else
                        {
        
                            req.flash('adminid',Aid + " -- Voting process has been 'started'");
                            res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
                        }
            // ------------------------------------------------------------------------------------------------------------
            // ------------------------------------------------------------------------------------------------------------
            
                    }
                    catch(err)
                    {

                        res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
                    }
                });
            }

            else if(reset_voting_status == 0 && start_voting_process == 1 && stop_voting_process == 0)
            {
                req.flash('adminid',Aid + " -- Voting process has been 'started'");
                res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
            }
            else if(reset_voting_status == 0 && start_voting_process == 0 && stop_voting_process == 1)
            {
                req.flash('adminid',Aid + " -- Voting process has been 'ended'.Please Generate Result before reset voting process.");
                res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
            }
            else if(reset_voting_status == 1 && start_voting_process == 0 && stop_voting_process == 0)
            {
                stop_voting_process = 0;
                start_voting_process = 0;
                reset_voting_status = 0;
                req.flash('adminid',Aid + " -- Voting process has been 'reset'");
                res.render('Admin_dashboard.ejs',{adminid: req.flash('adminid')})
            }
        }
})


app.post('/removecandidate',async (req,res) => 
{
    console.log('post method');
    var name = req.body.name;
    var party_name = req.body.party_name;
    var state = req.body.states;
    var city_collection = req.body.city;
    var city;

    city_collection.forEach(element => {
        if(element!=="")
        {
            city = element;
        }
        
    });

    console.log(name);
    console.log(party_name);



    if(name!="" && party_name!="" && city!="" && state!="")
    {
        
        pool.query('delete from candidatedp where candidate_name = ? and party_name = ? and state = ? and city = ?;',[name,party_name,state,city],(err,result,fields)=>{
            
            try
            {
                console.log("Name = "+name);
                console.log("party name = "+party_name);
                console.log("state = "+state);
                console.log("city = "+city);

                if(result.length<=0)
                {
                    console.log('delete cadidate fails , try again');
                    check_voting_status(req,res);
                }  
                else
                {
                    pool.query('delete from electionresult where  party_name = ? and state = ? and city = ?;',[party_name,state,city],(err,result,fields)=>{
                        try
                        {
                            if(err) throw err;
                            if(result.length<=0)
                            {
                                console.log("details not found")
                                check_voting_status(req,res);
                            }
                            else
                            {
                                console.log("details found")

                                // ==========================================================================
                                pool.query('select * from candidatedp where  party_name = ?;',[party_name],(err,result,fields)=>{

                                    if(result.length<=0)
                                    {
                                        pool.query('delete from election_parties where  party_name = ?;',[party_name],(err,result,fields)=>{
                                            try
                                            {
                                                if(err) throw err;
                                                if(result.length<=0)
                                                {
                                                    console.log("details not found")
                                                    check_voting_status(req,res);
                                                }
                                                else
                                                {
                                                    console.log("details found")
                                                    check_voting_status(req,res);
                                                }
            
                                            }
                                            catch(err)
                                            {
                                                console.log('dtails error ');
                                                check_voting_status(req,res);
                                            }
                                        })
                                    }
                                    else
                                    {
                                        check_voting_status(req,res);
                                    }
            
                                })

                                // ==========================================================================
                            }
                            
                        }
                        catch(err)
                        {
                            check_voting_status(req,res);
                        }
                    });
                }
            }
            catch(err)
            {
                check_voting_status(req,res);
            }
        });
    }
    else
    {
        console.log('fill all details');
        check_voting_status(req,res);
    }

});

// *************************************************  Admin dashboard SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// *************************************************  Add Candidate server CODE STARTS FROM HERE*******************************************************

app.get('/Add_Candidate',(req,res) =>{
    console.log("Aid_add_candi = "+Aid_add_candi);

    if(Aid==="" || Aid_dash==="")
    {
        res.redirect('http://127.0.0.99:3000/adminLogin');
        // Aid_add_candi=""
    }
    else
    {
        res.render('Add_Candidate.ejs');
        // Aid_add_candi=""
    }
})

app.post('/addcandidate',async (req,res) => 
{
    console.log('post method');
    var name = req.body.name;
    var party_name = req.body.party_name
    var position = req.body.position
    var img = req.body.party_logo
    var state = req.body.states;
    var city_collection = req.body.city;
    var city;

    city_collection.forEach(element => {
        if(element!=="")
        {
            city = element;
        }
        
    });

// ===========================================================================================================================
  // ====================================================================================================================
    if(name!="" && party_name!="" && position!="" && img!="" && city!="" && state!="")
    {
            pool.query('insert into candidatedp(candidate_name,position,party_name,party_logo,state,city) values(?,?,?,?,?,?);',[name,position,party_name,img,state,city],(err,result,fields)=>{
                
                
                try
                {
                        // console.log('something went wrong , connection fails');
        
                    if(result.length<=0)
                    {
                        console.log('loginfailed , login again');
                        res.redirect('http://127.0.0.99:3000/Add_Candidate');
                    }  
                    else
                    {

                        // ======================================================================

            // ---------- inserting state city and party name and party logo in election table;

                        pool.query('insert into electionresult(party_name,party_logo,position,state,city) values(?,?,?,?,?);',[party_name,img,position,state,city],(err,result,fields)=>{ 
                            try
                            {
                                if(result.length<=0)
                                {
                                    check_voting_status(req,res);
                                }
                                else
                                {
                                    console.log("Name = "+name);
                                    console.log("party name = "+party_name);
                                    console.log("position = "+position);
                                    console.log("IMG = "+img);
                                    console.log("state = "+state);
                                    console.log("city = "+city);


                                    pool.query('insert into election_parties(party_name,party_logo) values(?,?);',[party_name,img],(err,result,fields)=>{
                                        try
                                        {
                                            console.log("party name = "+party_name);
                                            console.log("IMG = "+img);
                                           
                                            if(result.length<=0)
                                            {
                                                check_voting_status(req,res);
                                            }
                                            else
                                            {
                                                
                                                check_voting_status(req,res);
                                            }
                                        }
                                        catch(err)
                                        {
                                            check_voting_status(req,res);
                                        }
                                    })
                                    // =================================================================
                                }
                            }
                            catch(err)
                            {
                                console.log('candidate not added');
                                check_voting_status(req,res);
                            }
                        })

                        // =========================================================================
                    }
                }
                catch(err)
                {
                    check_voting_status(req,res);
                }
        
            })
    }
    else
    {
        console.log('all field should be filled');
        check_voting_status(req,res);
    }
})

// *************************************************  Add Candidate SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// *************************************************  Edit Candidate server CODE STARTS FROM HERE*******************************************************

app.get('/Edit_Candidate',(req,res) =>{
    
    Aid = Aid_edit_candi;
    if(Aid==="" || Aid_dash==="")
    {
        res.redirect('http://127.0.0.99:3000/adminLogin');
        // Aid_edit_candi=""
    }
    else
    {
        res.render('EditCandidate.ejs',{message: req.flash('message')})
        // Aid_edit_candi=""
    }
})

app.post('/editCandidate',async (req,res) => 
{
    console.log('post method');
    var name = req.body.name;
    var party_name = req.body.party_name;
    var position = req.body.position;
    var newname = req.body.newname;

    var img = req.body.party_logo
    var state = req.body.states;
    var city_collection = req.body.city;
    var city;

    console.log("newname = "+newname)
    console.log(name);
    console.log(party_name);
    console.log(position);
    console.log(img);

    console.log(state);
    console.log(city_collection);
    city_collection.forEach(element => {
        if(element!=="")
        {
            city = element;
            console.log(city);
        }
        
    });

    var correct_name;
    var fetch_name;
    var fetch_state;
    var fetch_city;
    var fetch_party_name;

        pool.query('update candidatedp set candidate_name = ?,position = ?,party_logo = ? where party_name=? AND state=? AND city=?;',[name,position,img,party_name,state,city],(err,result,fields)=>{
            console.log(name);
            console.log(party_name);
            console.log(position);
            console.log(img);

            console.log(state);
            try
            {
                console.log('result = ' + result);

                Object.keys(result).forEach(function(key) {
                    var row = result[key];
                    console.log(row.name)
                });
                if(result.length<=0)
                {
                    console.log('loginfailed , login again');
                    req.flash('message','Please Enter correct state or city or party Name');
                    res.redirect('http://127.0.0.99:3000/Edit_Candidate');
                }  
                else
                {
                    check_voting_status(req,res);
                }
            }
            catch(err)
            {
                console.log(err);
                req.flash('message','Please Enter correct details');
                res.redirect('http://127.0.0.99:3000/Edit_Candidate');
            }
            
        })

})


// *************************************************  Edit Candidate SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// ************************************************* View Added Candidate server CODE STARTS FROM HERE*******************************************************

var PORT = 5000;
var mysql = require('mysql');
var db = mysql.createConnection(
    {
        host:"localhost",
        user:"root",
        
        password : process.env.DBPASSWORD,
        database:"sdp_project"
    }
)
function executequery(sql,cb)
{
    console.log("enter into executequery");
    db.query(sql,function(error,result,fields)
    {
        if(error) throw error;
        cb(result);
    })
}


app.get('/ShowAddedCandidate', function(req, res){
    var html_con = "";
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');

console.log('Enter into function');
    executequery("select * from candidatedp",function(result)
    {
        if(result.length<=0)
        {
            res.write('<html>');
                res.write('<head>');

                res.write('<title>Candidate details</title>');
            
                res.write('<link rel="stylesheet" type="text/css"    href="C:\Users\Admin\Desktop\DOC\html\bootstrap\bootstrap-4.4.1-dist\css\bootstrap.min.css">');
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    res.write('</style>')

                res.write('</head>');
                
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                        // res.write('<h3>Candidate Details</h3>'); 
                        
                        res.write('<br><br><br>');
                res.write('<h1>No Candidate found</h1>');
                res.write('<table class="table table-striped">');
                        res.write('<tr>');
                
                        res.write('<th><lable>Sr No.</lable></th>');
                        res.write('<th><lable>Party_name</lable></th>');
                        res.write('<th><lable>Candidate_name</lable></th>');
                        res.write('<th><lable>Position</lable></th>');
                        res.write('<th><lable>Party_logo</lable></th>');
                        res.write('<th><lable>State</lable></th>');
                        res.write('<th><lable>City</lable></th>');
                  
                        res.write('</tr>');
                    res.write('</table>');
                res.write('</div>')
                res.write('</body>');
                res.write('</html>');
        }
        else
        {
                        res.write('<html');
                        res.write('<head>');
                            res.write('<title>Candidate details</title>');
                        res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
                
                        res.write('<style>');
                            res.write('body{margin: 0;padding: 0;background-color: lightblue;background-size: cover;background-position: center;font-family: sans-serif;background-color: #327bb873;width:100%;}');
                            res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                            res.write('.downloadbtn{position: relative;top: 50px;    left: 45%;padding-bottom:50px;}');
                            res.write('.table{padding-left : 20px;}');
                            
                
                // =================================================================================================================================================================================================
                
                // =================================================================================================================================================================================================
                        res.write('</style>');
                

                        res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
                    
                        res.write('<script>');
                            res.write('window.onload = function () {');
                        res.write('document.getElementById("download")');
                            res.write('.addEventListener("click", () => {');
                
                                res.write('const invoice = this.document.getElementById("generateresultpdf");');
                                res.write('console.log(invoice);');
                                res.write('console.log(window);');
                                res.write('var opt = {');
                                    res.write('margin: 1,');
                                    res.write('filename: "Candidate_details.pdf",');
                                    res.write('image: { type: "jpeg", quality: 0.98 },');
                                    res.write('html2canvas: { scale: 2 },');
                                    res.write('jsPDF: { unit: "in", format: "letter", orientation: "portrait" }');
                                res.write('};');
                                res.write('html2pdf().from(invoice).set(opt).save();');
                            res.write('})');
                    res.write('}');
                    
                        res.write('</script>');
                                        
                        res.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>');
                        res.write('</head>')
                
                        
                
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                
                        res.write('<div class="downloadbtn text-right mb-3"><button class="btn btn-primary" id="download"> Download Candidate Details</button></div>');
                
                        res.write('<div class="container" >')
                        res.write('<table class="table table-striped" id="generateresultpdf">');
                        res.write('<tr>');
                        
                        
                        res.write('<thead class="thead-dark">')
                        res.write('<th><lable>Sr No.</lable></th>');
                        res.write('<th><lable>Party_name</lable></th>');
                        res.write('<th><lable>Candidate_name</lable></th>');
                        res.write('<th><lable>Position</lable></th>');
                        res.write('<th><lable>Party_logo</lable></th>');
                        res.write('<th><lable>State</lable></th>');
                        res.write('<th><lable>City</lable></th>');
                        res.write('</thead>');
                        var sr_no = 1;
                
                
                        // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###############################################################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
                
                        // variables are define below to store candidatedp details inro candidate;
                
                        var name;
                        var party_name;
                        var position;
                        var img;
                        var state;
                        var city_collection;
                        var city; 
                
                
                
                        for(var row in result)
                        {
                            res.write('<tr>')
                            html_con += '<tr>';
                            res.write('<td><lable>' + sr_no + '</lable></td>');
                            for(var col in result[row])
                            {
                                // ------------------------------------------------------------------------------------------------------------------
                                if(col == "party_logo")
                                {
                                    res.write('<td><img src="/views/' + result[row][col] + '" "width="80" height="80" class="rounded-circle"></td>');
                                    img = result[row][col];
                                }
                                else
                                {
                                    res.write('<td><lable>' + result[row][col] + '</lable></td>');
                
                                    if(col == "party_name")
                                    {
                                        party_name = result[row][col];
                                    }
                                    else if(col == "candidate_name")
                                    {
                                        name = result[row][col];
                                    }
                                    else if(col == "position")
                                    {
                                        position = result[row][col];
                                    }
                                    else if(col == "state")
                                    {
                                        state = result[row][col];
                                    }
                                    else if(col == "city")
                                    {
                                        city = result[row][col];
                                    }
                
                                }  
                            }
                            sr_no++;
                            res.write('</tr>');
                            html_con += '</tr>'
                        }
                        res.write('</table>');
                        res.write('</div>');
                
                res.write('</body>');
                res.write('</html');
        }

        res.end();
    });

});

app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});

// *************************************************  View Added Candidate SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// *************************************************  Generate pdf server CODE STARTS FROM HERE*******************************************************

app.get('/VotingResult',(req,res) =>{

                // *****************************************$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$********************************
            // RESULT PAGE CODE STARTED


            stop_voting_process = 1;
            var eledate;
            var html_con = "";
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');

            console.log('Enter into function');

            executequery("select * from storeelectionstartingdate",function(result)
            {
                // console.log(result);
                eledate = result[0].electiondate;
                console.log("voting time = " + eledate);
                try
                {
                    if(result.length<=0)
                    {
                        console.log("voting time = " + eledate);
            
                    }
                    else
                    {
                        console.log("voting time = " + eledate);
                    }
                }
                catch(eerr)
                {
                    console.log("Generating pdf error");
                }
            });


        executequery("select * from electionresult",function(result)
            {
                res.write('<html');
                res.write('<head>');

                res.write('<title>Election Result</title>');
            
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<script>');

                    res.write('window.addEventListener("load", () => {');

                        res.write('const invoice = this.document.getElementById("generateresultpdf");');
                        res.write('console.log(invoice);');
                        res.write('console.log(window);');
                        res.write('var opt = {');
                            res.write('margin: 1,');
                            res.write('filename: "'+ eledate +'_Voting_Result.pdf",');
                            res.write('image: { type: "jpeg", quality: 0.98 },');
                            res.write('html2canvas: { scale: 2 },');
                            res.write('jsPDF: { unit: "in", format: "letter", orientation: "portrait" }');
                        res.write('};');

                        res.write('html2pdf().from(invoice).set(opt).save();');

                    res.write('})');
                res.write('</script>');
            
                res.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>');
                res.write('<style>');
                    res.write('.img{width: 220px;height: 70px;position: absolute;left: 4%;}')
                    res.write('.downloadbtn{position: relative;top: 50px;    left: 45%;padding-bottom:50px;}');
                    

        // =================================================================================================================================================================================================
        // =================================================================================================================================================================================================
                res.write('</style>');


                res.write('</head>')

            res.write('<body id="bodyid">');
            res.write('<br><br>');
            res.write('<br><br>');
                res.write('<div class="container" id="generateresultpdf">')
                res.write('<br><br>');   
                        res.write('<h3>Voting Result </h3>'); 
                        res.write('<br>');
                res.write('<h4>Date :  '+ eledate +'</h4>'); 
                res.write('<br><br>');   
                res.write('<table class="table table-striped">');
                res.write('<tr>');

                res.write('<thead class="thead-dark">')
                res.write('<th><lable>Sr No.</lable></th>');
                res.write('<th><lable>Party_name</lable></th>');
                res.write('<th><lable>Party_logo</lable></th>');
                res.write('<th><lable>Position</lable></th>');
                res.write('<th><lable>State</lable></th>');
                res.write('<th><lable>City</lable></th>');
                res.write('<th><lable>No of Votes</lable></th>');
                res.write('</thead>');
                var sr_no = 1;

                for(var row in result)
                {
                    res.write('<tr>')
                    html_con += '<tr>';
                    res.write('<td><lable>' + sr_no + '</lable></td>');
                    for(var col in result[row])
                    {
                        // ------------------------------------------------------------------------------------------------------------------
                        if(col == "party_logo")
                        {
                            res.write('<td><img src="/views/' + result[row][col] + '" "width="80" height="80" class="rounded-circle"></td>');
                        }
                        else
                        {
                            res.write('<td><lable>' + result[row][col] + '</lable></td>');
                        }
                        // ------------------------------------------------------------------------------------------------------------------                
                    }
                    sr_no++;
                    res.write('</tr>');
                    html_con += '</tr>'
                }
                res.write('</table>');
                res.write('</div>');

        res.write('</body>');
        res.write('</html>');
                res.end();
            });


// redirect from voterresult to admin dashboard
// """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

            // res.redirect('http://127.0.0.99:3000/adminDashboard');

// """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

            // RESULT PAGE CODE ENDS HERE
        // *****************************************$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$********************************

})

// *************************************************  Generate pdf SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// *************************************************  start voting process SERVER CODE ENDS HERE*******************************************************

app.post('/startvotingprocess',async (req,res) => 
{

    fetch_confirm = req.body.confirm;

    var date = new Date();
    
    var date_str = date.toString();
    console.log("voting starts at " + date);
    date_str = date_str.split(" ");

    start_voting_time = date_str[2] + "_" + date_str[1] + "_" + date_str[3];
    console.log("start_voting_time = " + start_voting_time);
    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###############################################################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        // variables are define below to store candidatedp details inro candidate;

        var name;
        var party_name;
        var position;
        var img;
        var state;
        var city_collection;
        var city; 

                console.log("fetch_confirm = " + fetch_confirm);
                
    // =================== check confirm ====================
    if(fetch_confirm === "true")
    {
        stop_voting_process = 0;
        start_voting_process = 1;
        reset_voting_status = 0;

        console.log("fetch_confirm = " + fetch_confirm);
        console.log("reset_voting_status = " + reset_voting_status)
        console.log("   stop_voting_process = " + stop_voting_process)
        console.log(" start_voting_process = " + start_voting_process );
        console.log("fetch_confirm = " + fetch_confirm);

            pool.query('insert into storeelectionstartingdate(electiondate) values(?)',[date],(err,result,fields)=>{
            try
            {
                if(result.length<=0)
                {

                    res.redirect('http://127.0.0.99:3000/adminDashboard');
                }
                else
                {
                    executequery("select * from candidatedp",function(result)
                    {
                        if(result.length<=0)
                        {
                            stop_voting_process = 0;
                            start_voting_process = 0;
                            reset_voting_status = 0;
                            res.redirect('http://127.0.0.99:3000/adminDashboard');   
                        }
                        else
                        {
                            for(var row in result)
                            {
                                for(var col in result[row])
                                {
                                        
                                    // ------------------------------------------------------------------------------------------------------------------
                                    if(col == "party_logo")
                                    {
                                        // console.log("result[row][col] = "+result[row][col]);
                                        img = result[row][col];
                                    }
                                    else
                                    {

                                        if(col == "party_name")
                                        {
                                            party_name = result[row][col];
                                        }
                                        else if(col == "candidate_name")
                                        {
                                            name = result[row][col];
                                        }
                                        else if(col == "position")
                                        {
                                            position = result[row][col];
                                        }
                                        else if(col == "state")
                                        {
                                            state = result[row][col];
                                        }
                                        else if(col == "city")
                                        {
                                            city = result[row][col];
                                        }

                                    }
                                    // ------------------------------------------------------------------------------------------------------------------    

                                    // inserting into candidate row by row

                                    pool.query('insert into candidate(candidate_name,position,party_name,party_logo,state,city) values(?,?,?,?,?,?);',[name,position,party_name,img,state,city],(err,result,fields)=>{

                                        try
                                        {
                                            if(result.length<=0)
                                            {
                                                // console.log("candidate already added in candidate table");
                                            }
                                            else
                                            {
                                                // console.log("candidate added successfully in candidate table");
                                            }
                                        }
                                        catch(err)
                                        {
                                            console.log("error in adding candidate details in candidate table");

                                        }
                                    });
                
                                }
                            }
                            res.redirect('http://127.0.0.99:3000/adminDashboard');
                        }


                        // 22222222222222222222222222222222222222222222222222222222222222222222222222222222222

                        // 22222222222222222222222222222222222222222222222222222222222222222222222222222222222


                    });
                }
            }
            catch(err)
            {
                console.log("date error store");
                res.redirect('http://127.0.0.99:3000/adminDashboard');
            }

        });

            console.log("start voting........");
            // confirm true ends here    
    }
    else
    {
        console.log("cancelling start process  ");
        res.redirect('http://127.0.0.99:3000/adminDashboard');
    }
        
})

// *************************************************  start voting process SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// *************************************************  stop voting process SERVER CODE ENDS HERE*******************************************************

app.post('/stopvotingprocess',async (req,res) => 
{

    fetch_confirm = req.body.confirm;
    var date = new Date();
    var date_str = date.toString();
    console.log("voting ends at " + date);

    date_str = date_str.split(" ");
    console.log("voting starts at " + date_str);
    console.log("time = "+ date_str[2] + "_" + date_str[3] + "_" + date_str[3] + "_" + date_str[4] );

    stop_voting_time = date_str[2] + "_" + date_str[1] + "_" + date_str[3] + "_" + date_str[4] ;
    console.log("stop_voting_time = " + stop_voting_time);


    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###############################################################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        // variables are define below to store candidatedp details inro candidate;

        var name;
        var party_name;
        var position;
        var img;
        var state;
        var city_collection;
        var city; 

                console.log("fetch_confirm = " + fetch_confirm);
                
    // =================== check confirm ====================
    if(fetch_confirm === "true")
    {
        console.log("stop");
        stop_voting_process = 1;
        start_voting_process = 0;
        reset_voting_status = 0;

        console.log("reset_voting_status = " + reset_voting_status  + "   stop_voting_process = " + stop_voting_process +  " start_voting_process = " + start_voting_process );

        pool.query('delete from candidate',(err,result,fields)=>{
            try
            {
                if(result.length<=0)
                {
                    console.log("data from candidate is not deleted")
                }
                else
                {
                    console.log("data from candidate deleted successfully")
                }
            }
            catch(err)
            {
                console.log("deleting error");
            }
            console.log('Voting process has been ended. To "Generate Result" , click on Generate Result button')

            res.redirect('http://127.0.0.99:3000/adminDashboard');
        });

        console.log("stop voting........");
            // confirm true ends here    
    }
    else
    {
        stop_voting_process = 0;
        start_voting_process = 1;
        reset_voting_status = 0;
        console.log("canceling stop process  ");
        res.redirect('http://127.0.0.99:3000/adminDashboard');
    }
        
})

// *************************************************  stop voting process SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// *************************************************  reset voting process SERVER CODE ENDS HERE*******************************************************

app.post('/resetvotingprocess',async (req,res) => 
{
    fetch_confirm = req.body.confirm;

    // @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@###############################################################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

        // variables are define below to store candidatedp details inro candidate;

        var name;
        var party_name;
        var position;
        var img;
        var state;
        var city_collection;
        var city; 

                console.log("fetch_confirm = " + fetch_confirm);
                
    // =================== check confirm ====================
    if(fetch_confirm === "true")
    {
        console.log("reset");
        stop_voting_process = 0;
        start_voting_process = 0;
        reset_voting_status = 1;
        var eledate;
        var party_name;
        var name;
        var position;
        var img;
        var state;
        var city; 
        var count;

        console.log("reset_voting_status = " + reset_voting_status  + "   stop_voting_process = " + stop_voting_process +  " start_voting_process = " + start_voting_process );


        executequery("select * from storeelectionstartingdate",function(result)
            {
                eledate = result[0].electiondate;
                console.log("voting time = " + eledate);
                try
                {
                    if(result.length<=0)
                    {
                        console.log("voting time = " + eledate);
                        
                        res.redirect('http://127.0.0.99:3000/adminDashboard');   
                    }
                    else
                    {
                        console.log("voting time = " + eledate);
                        pool.query('select candidatedp.party_name,candidate_name,candidatedp.position,candidatedp.party_logo,candidatedp.state,candidatedp.city,count from candidatedp join electionresult on candidatedp.city = electionresult.city and candidatedp.state = electionresult.state and candidatedp.party_name = electionresult.party_name and candidatedp.party_logo = electionresult.party_logo;',(err,result,field)=>{
                            try
                            {
                                console.log("result = " + result);
                                console.log("voting time = " + eledate);

                                if(result.length<=0)
                                {
                                    console.log("record not found");
                                    res.redirect('http://127.0.0.99:3000/adminDashboard'); 
                                }
                                else
                                {
                                        for(var row in result)
                                        {
   
                                            for(var col in result[row])
                                            {
                                                // ------------------------------------------------------------------------------------------------------------------
                                                if(col == "party_logo")
                                                {
                                                    img = result[row][col];
                                                    console.log("img = " + img);
                                                }
                                                else if(col == "position")
                                                {
                                                    position = result[row][col];
                                                    console.log("iposition = " + position);
                                                }
                                                else if(col == "party_name")
                                                {
                                                    party_name = result[row][col];
                                                    console.log("partyname = " + party_name);
                                                }
                                                else if(col == "candidate_name")
                                                {
                                                    name= result[row][col];
                                                    console.log("candidate name = " + name);
                                                }
                                                else if(col == "state")
                                                {
                                                    state = result[row][col];
                                                    console.log("state = " + state);
                                                   
                                                }
                                                else if(col == "city")
                                                {
                                                    city = result[row][col];
                                                    console.log("city = " + city);

                                                }
                                                else if(col == "count")
                                                {
                                                    
                                                    count = result[row][col];
                                                    console.log("count = " + count);
                                                }
                                                // ------------------------------------------------------------------------------------------------------------------                
                                            }
                                            console.log("voting time  past result= " + eledate);
                                                    pool.query('insert into pastelectionresult values(?,?,?,?,?,?,?,?)',[eledate,party_name,name,img,position,state,city,count],(err,result,field)=>{

                                                    try
                                                    {
                                                        console.log("voting time  pasttry= " + eledate);
                                                        if(result.length<=0)
                                                        {
                                                            console.log("insert try");
                                                        }
                                                        else
                                                        {
                                                            console.log("try try");
                                                           
                                                            
                                                        }
                                                      
                                                    }
                                                    catch(err)
                                                    {
                                                        console.log("catch try");
                                                        res.redirect('http://127.0.0.99:3000/adminDashboard'); 
                                                    }
                                                    
                                                });
                                           
                                        }
                                } //else

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                        


                                pool.query('delete from candidatedp',(err,result,field)=>{
                                    try
                                    {
                                        if(err) throw err
                                        if(result.length<=0)
                                        {
                                            console.log("candidate_duplicate record not found");
                                            res.redirect('http://127.0.0.99:3000/adminDashboard');
                                        }
                                        else
                                        {
                                            console.log('candidate_duplicate deleted')
                                            pool.query('delete from electionresult',(err,result,field)=>{
                                                try
                                                {
                                                    if(err) throw err
                                                    if(result.length<=0)
                                                    {
                                                        console.log("electionresult record not found");
                                                        res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                    }
                                                    else
                                                    {
                                                        console.log('electionresult deleted')
                                                        pool.query('delete from election_parties',(err,result,field)=>{
                                                            try
                                                            {
                                                                if(err) throw err
                                                                if(result.length<=0)
                                                                {
                                                                    console.log("election_parties record not found");
                                                                    res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                }
                                                                else
                                                                {
                                                                    console.log('election_parties deleted')
                                                                    pool.query('delete from storeelectionstartingdate',(err,result,field)=>{
                                                                        try
                                                                        {
                                                                            if(err) throw err
                                                                            if(result.length<=0)
                                                                            {
                                                                                console.log("election_parties record not found");
                                                                                res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                            }
                                                                            else
                                                                            {
                                                                                console.log('storeelectionstartingdate deleted')
                                                                                var status = 'Not voted'
                                                                                pool.query('update registration set status=?',[status],(err,result,field)=>{
                                                                                    try
                                                                                    {
                                                                                        if(err) throw err
                                                                                        if(result.length<=0)
                                                                                        {
                                                                                            console.log("registration record not found");
                                                                                            res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                                        }
                                                                                        else
                                                                                        {
                                                                                            console.log('status updated')
                                                                                            res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                                        }
                                                                                       
                                                                                    }
                                                                                    catch
                                                                                    {
                                                                                        console.log('status updated else..... catch');
                                                                                        res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                                    }
                                                                                })
                                                                            }
                                                                        }
                                                                        catch(err)
                                                                        {
                                                                            res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                                        }
                                                                    });
                                                                   
                                                                }
                                                            }
                                                            catch
                                                            {
                                                                res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                            }
                                                        })
                                                    }
                                                }
                                                catch
                                                {
                                                    res.redirect('http://127.0.0.99:3000/adminDashboard');
                                                }
                                            })
                                        }
                                    }
                                    catch
                                    {
                                        res.redirect('http://127.0.0.99:3000/adminDashboard');
                                    }
                                })
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------                        

                            }
                            catch(err)
                            {
                                console.log("catch hello")
                                res.redirect('http://127.0.0.99:3000/adminDashboard'); 
                            }
                        });                        
                    }
                }
                catch(err)
                {
                    console.log("catch catch")
                    res.redirect('http://127.0.0.99:3000/adminDashboard'); 
                }
                
            });

            // confirm true ends here    
    }
    else
    {
        stop_voting_process = 1;
        start_voting_process = 0;
        reset_voting_status = 0;
        console.log("canceling reset process  ");

        res.redirect('http://127.0.0.99:3000/adminDashboard');
    }

})

// *************************************************  reset voting process SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


app.post('/logout',async (req,res) => 
{
    Aid="";
    Aid_dash="";
    res.redirect('http://127.0.0.99:3000/adminLogin');
});
// *************************************************  Server running at Port No 3000*******************************************************


//   ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????/

// =======================================================================================================================

// =======================================================================================================================


app.post("/searchresult",async (req,res) =>
{
    var date = req.body.date;

    var party_name;
    var name;
    var position;
    var img;
    var state;
    var city; 
    var count;
    console.log("date = " + date);
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');

    pool.query("select * from pastelectionresult where DOE = ?;",[date],(err,result,field)=>
    {
        try
        {
            if(result.length<=0)
            {
                res.write('<html');
                res.write('<head>');

                res.write('<title>Election Result Not found </title>');
            
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    res.write('</style>')

                res.write('</head>');

                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                res.write('<br><br>');   
                res.write('<h3>Voting Result </h3>'); 
                res.write('<br>');
                        res.write('<h4>Date :  '+ date +'</h4>'); 
                        res.write('<br><br>');
                res.write('<h1>Record Not found</h1>')
                res.write('<table class="table table-striped">');
                        res.write('<tr>');
                
                        res.write('<thead class="thead-dark">')

                        
                        res.write('<th><lable>Party_name</lable></th>');
                        res.write('<th><lable>Candidate_name</lable></th>');
                        res.write('<th><lable>Party_logo</lable></th>');
                        res.write('<th><lable>State</lable></th>');
                        res.write('<th><lable>City</lable></th>');
                        res.write('<th><lable>No of Votes</lable></th>');
                        res.write('</thead>');

                        res.write('</tr>');
                res.write('<table>');
                res.write('</div>')
                
                res.write('</body>');
                res.write('</html>');
            }
            else
            {
                position = result[0].position;
                    res.write('<html');
                        res.write('<head>');
                
                        res.write('<title>Election Result - ' + date +'</title>');
                    

                        res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
                    
                        res.write('<script>');
                
                        res.write('window.onload = function () {');

                        
                        res.write('document.getElementById("download")');

                            res.write('.addEventListener("click", () => {');
                                res.write('const invoice = this.document.getElementById("generateresultpdf");');
                                res.write('console.log(invoice);');
                                res.write('console.log(window);');
                                res.write('var opt = {');
                                    res.write('margin: 1,');
                                    res.write('filename: "'+ date +'_Voting_Result.pdf",');
                                    
                                    
                                    res.write('image: { type: "jpeg", quality: 0.98 },');
                                    res.write('html2canvas: { scale: 2 },');
                                    res.write('jsPDF: { unit: "in", format: "letter", orientation: "portrait" }');
                                res.write('};');

                                res.write('html2pdf().from(invoice).set(opt).save();');
                            res.write('})');
                    res.write('}');
                        res.write('</script>');
                    
                        res.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>');
                        res.write('<style>');
                            res.write('.img{width: 220px;height: 70px;position: absolute;left: 4%;}')
                            res.write('.downloadbtn{position: relative;top: 50px;    left: 45%;padding-bottom:50px;}');
                            res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    
                
                // =================================================================================================================================================================================================
                // =================================================================================================================================================================================================
                        res.write('</style>');
                
                
                        res.write('</head>')
                
                    res.write('<body id="bodyid">');
                    res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                        res.write('<div class="downloadbtn text-right mb-3"><button class="btn btn-primary" id="download"> Download Result</button></div>');
                
                        res.write('<div class="container" id="generateresultpdf">')
                        res.write('<br><br>');   
                        res.write('<h3>Voting Result </h3>'); 
                        res.write('<h4>Date :  '+ date +'</h4>'); 
                        res.write('<h4>Position : ' + position+ '</h4>');
                        res.write('<br><br>');   
                        res.write('<table class="table table-striped">');
                        res.write('<tr>');
                
                        res.write('<thead class="thead-dark">')
                       
                        
                        res.write('<th><lable>Party_name</lable></th>');
                        res.write('<th><lable>Candidate_name</lable></th>');
                        res.write('<th><lable>Party_logo</lable></th>');
                       
                        
                        res.write('<th><lable>State</lable></th>');
                        res.write('<th><lable>City</lable></th>');
                        res.write('<th><lable>No of Votes</lable></th>');
                        res.write('</thead>');
                        var sr_no = 1;
                
                        for(var row in result)
                        {
                            res.write('<tr>')

                            for(var col in result[row])
                            {
                                // ------------------------------------------------------------------------------------------------------------------
                                if(col == "party_logo")
                                {
                                    // console.log("result[row][col] = "+result[row][col]);
                                    res.write('<td><img src="/views/' + result[row][col] + '" "width="80" height="80" class="rounded-circle"></td>');
                                }
                                else if(col == "DOE")
                                {
                
                                }
                                else if(col == "position")
                                {
                                    position = result[row][col];
                                }
                                else
                                {
                                    res.write('<td><lable>' + result[row][col] + '</lable></td>');
                                    // console.log("row = "+row+"    co = "+col);
                                }
                                // ------------------------------------------------------------------------------------------------------------------                
                            }
                            sr_no++;
                            res.write('</tr>');
                        }
                        res.write('</table>');
                        res.write('</div>');
                
                res.write('</body>');
                res.write('</html>');
            }
        }
        catch(err)
        {
            res.write('<html');
                res.write('<head>');

                res.write('<title>Election Result</title>');
            
                res.write('<link rel="stylesheet" type="text/css"    href="C:\Users\Admin\Desktop\DOC\html\bootstrap\bootstrap-4.4.1-dist\css\bootstrap.min.css">');
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    res.write('</style>')

                res.write('</head>');

                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                res.write('<br><br>');   
                res.write('<h3>Voting Result </h3>'); 
                res.write('<br>'); 
                        res.write('<h4>Date :  '+ date +'</h4>'); 
                        res.write('<br><br>');
                res.write('<h1>Record Not found</h1>')
                res.write('<table class="table table-striped">');
                res.write('<tr>');
        
                res.write('<thead class="thead-dark">')

                res.write('<th><lable>Party_name</lable></th>');
                res.write('<th><lable>Candidate_name</lable></th>');
                res.write('<th><lable>Party_logo</lable></th>');
                res.write('<th><lable>State</lable></th>');
                res.write('<th><lable>City</lable></th>');
                res.write('<th><lable>No of Votes</lable></th>');
                res.write('</thead>');

                res.write('</tr>');
            res.write('<table>');
                res.write('</div>')
                
                res.write('</body>');
                res.write('</html>');
                res.end();
        }
        res.end();
    });

});



app.post("/viewfullpastresult",async (req,res) =>
{
    // var date = req.body.date;

    var party_name;
    var name;
    var position;
    var img;
    var state;
    var city; 
    var count;
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/html');

    pool.query("select * from pastelectionresult ORDER BY DOE DESC;",(err,result,field)=>
    {

        try
        {
            if(result.length<=0)
            {

                res.write('<html');
                res.write('<head>');

                res.write('<title>Election Result</title>');
            
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    res.write('</style>')

                res.write('</head>');
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                
                res.write('<h3>Voting Result </h3>'); 
                res.write('<br>');
                        
                        res.write('<br><br>');
                res.write('<h1>Record Not found</h1>')
                res.write('</div>')
                res.write('</body>');
                res.write('</html>');

            }
            else
            {
                position = result[0].position;
                    res.write('<html');
                        res.write('<head>');
                
                        res.write('<title>Election Result</title>');
                    
                        res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
                    
                        res.write('<script>');
                
                        res.write('window.onload = function () {');
                        res.write('document.getElementById("download")');
                            res.write('.addEventListener("click", () => {');
                
                                res.write('const invoice = this.document.getElementById("generateresultpdf");');
                                res.write('console.log(invoice);');
                                res.write('console.log(window);');
                                res.write('var opt = {');
                                    res.write('margin: 1,');
                                    res.write('filename: "Voting_Result.pdf",');
                                    res.write('image: { type: "jpeg", quality: 0.98 },');
                                    res.write('html2canvas: { scale: 2 },');
                                    res.write('jsPDF: { unit: "in", format: "letter", orientation: "portrait" }');
                                res.write('};');
                                res.write('html2pdf().from(invoice).set(opt).save();');
                            res.write('})');
                    res.write('}');
                        res.write('</script>');
                    
                        res.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>');
                        res.write('<style>');
                            res.write('.img{width: 220px;height: 70px;position: absolute;left: 4%;}')
                            res.write('.downloadbtn{position: relative;top: 50px;    left: 45%;padding-bottom:50px;}');
                            res.write('.container{position: relative;top: 10%;}');
                            res.write('h3{position: absolute;top: -1%; left: 40%}');
                            
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')

                // =================================================================================================================================================================================================
                // =================================================================================================================================================================================================
                        res.write('</style>');
                
                
                        res.write('</head>')
                
                    res.write('<body id="bodyid">');
                
                    res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                
                        res.write('<div class="container" id="generateresultpdf">')
                         
                        res.write('<h3>Voting Result </h3>'); 
                        res.write('<br>');
                        res.write('<table class="table table-striped">');
                        res.write('<tr>');
                
                        res.write('<thead class="thead-dark">')
                        res.write('<th><lable>Sr No.</lable></th>');
                        res.write('<th><lable>Date of Election</lable></th>');
                        res.write('<th><lable>Party_name</lable></th>');
                        res.write('<th><lable>Candidate_name</lable></th>');
                        res.write('<th><lable>Party_logo</lable></th>');
                        res.write('<th><lable>Position</lable></th>');
                        res.write('<th><lable>State</lable></th>');
                        res.write('<th><lable>City</lable></th>');
                        res.write('<th><lable>No of Votes</lable></th>');
                        res.write('</thead>');
                        var sr_no = 1;
                
                        for(var row in result)
                        {
                            res.write('<tr>')
                            
                            res.write('<td><lable>' + sr_no + '</lable></td>');
                            for(var col in result[row])
                            {
                                  
                                // ------------------------------------------------------------------------------------------------------------------
                                if(col == "party_logo")
                                {
                                    res.write('<td><img src="/views/' + result[row][col] + '" "width="80" height="80" class="rounded-circle"></td>');
                                }
                                else if(col == "DOE")
                                {
                                    var date_str = result[row][col].toString();
                                    var showdate;
                                    date_str = date_str.split(" ");
                                    var showdate = date_str[2] + "_" + date_str[1] + "_" + date_str[3];
                                    res.write('<td><lable>' +  showdate + '</lable></td>');
                                }

                                else
                                {
                                    res.write('<td><lable>' + result[row][col] + '</lable></td>');
                                }
                                // ------------------------------------------------------------------------------------------------------------------                
                            }
                            sr_no++;
                            res.write('</tr>');
                        }
                        res.write('</table>');
                        res.write('</div>');
                
                res.write('</body>');
                res.write('</html>');
            }
        }
        catch(err)
        {
            res.write('<html');
                res.write('<head>');

                res.write('<title>Election Result</title>');            
                res.write('<link rel="stylesheet" type="text/css"    href="C:\Users\Admin\Desktop\DOC\html\bootstrap\bootstrap-4.4.1-dist\css\bootstrap.min.css">');
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    res.write('</style>')

                res.write('</head>');
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                res.write('<br><br>');   
                res.write('<h3>Voting Result </h3>'); 
                res.write('<br>');
                        res.write('<h4>Date :  '+ date +'</h4>'); 

                        res.write('<br><br>');
                res.write('<h1>Record Not found</h1>')
                res.write('</div>')
                res.write('</body>');
                res.write('</html>');
                res.end();
        }
        res.end();
    });

});

// *************************************************  Server running at Port No 3000*******************************************************

// app.listen(5500);

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });

//   ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????/

// =======================================================================================================================

// =======================================================================================================================