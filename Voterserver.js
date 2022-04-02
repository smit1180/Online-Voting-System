

const express = require('express')
const app = express();
const hostname = '127.0.0.98';
const port = 3000;
let ejs = require('ejs');

let alert = require('alert');
let window = require('window');
var session = require('express-session') 
const cookieParser = require("cookie-parser");
var flash = require('connect-flash');
const bcrypt=require('bcrypt')
var nodemailer=require('nodemailer')
require('dotenv').config();
const fast2sms = require('fast-two-sms')


app.use(session({
    secret: 'secret',
    cookie: {maxAge: 1000 * 60 * 60 * 24},
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.use(express.json());

app.use(express.urlencoded({ extended: true}))
app.use(cookieParser());

app.use('/views',express.static('views'))

const {createPool
}=require('mysql');

const pool=createPool({
    host:"localhost",
    user:"root",
    
    password : process.env.DBPASSWORD,
    database:"sdp_project",
    connectionLimit:100
});


// ================================ connecting voter server ===============================

// ==================================================================

// *************************************************  All Global Variables declare *******************************************************


var vid="";
var name;
var address;
var dob;
var status;
var voterid1;
var party_name_as_id;
var vid_verifyvotingotp;
var voteingto;
var sendVotingOTP;
var fetch_party_name;
var fetch_confirm;
var voteridsuccess="";

var reg_state = ""
var reg_status = "";
var emailid1 = "";
var reg_status = "";

// *************************************************  All Global Variables declare ENDS HERE*******************************************************


// *************************************************  HOME SERVER CODE STARTS FROM HERE*******************************************************
var homeid = "home"
app.get('/home',(req,res) =>{

    res.render('home_page.ejs',{message: req.flash('message')})

    session=req.session;
    console.log("login get session = " + session);
})


// *************************************************  HOME SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// ************************************************* Voter's Registration SERVER CODE STARTS FROM HERE*******************************************************


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        
        user: 'evotingteamofficer@gmail.com',  
        pass : process.env.Emailpass
    }
})

app.get('/home/registration',(req,res) =>{

    res.render('Voter_Registration_form.ejs',{message: req.flash('message')})
    
})

app.get('/home/registration/otp',(req,res) =>{
    res.render('registerOTP.ejs',{message: req.flash('message')});
    console.log("vid = "+vid)
})

app.post('/register',async (req,res) =>{
    var voterid1 = req.body.voterid;
    var aadhaarno1 = req.body.aadhaarno;
    var panno1 = req.body.panno;
    var name1 = req.body.name;
    var dob1 = req.body.DOB;
    var password1=req.body.password;
    var confirmpassword1 =req.body.confirmpassword;
    var Email1 = req.body.email;
    var hashpass= await bcrypt.hash(password1,10)
    var mob;
    console.log(password1);

    pool.query('select * from registration where VoterID=? or Aadhar_Number=? or Pan_Number=?',
                [voterid1,aadhaarno1,panno1],(err,result,field) => {
        if(result.length<=0)
        {
            if(password1===confirmpassword1)
            {
                console.log(confirmpassword1);
                pool.query('select * from voterdetails where VoterID=? and Aadhar_Number=? and Pan_Number=? and Name=? and DOB=?',
                [voterid1,aadhaarno1,panno1,name1,dob1],(err,result,field) => {
                    if(err) throw err
                    if(result.length<=0){
                        req.flash('message','Enter correct details')
                        res.redirect('http://127.0.0.98:3000/home/registration');
                    }
                    else{
                        mob = result[0].MobileNo;
                        console.log(mob);
                        var sendOTP1 = Math.floor(1000+Math.random()*9000)

                        var sendOTP2 = Math.floor(1000+Math.random()*9000)

                        var mailOptions ={
                            from: 'evotingteamofficer@gmail.com',
                            to: Email1,
                            subject: 'Email Verification code for Registration',
                            text: `\nEmail Verification code for Registration of VoterID :- `+ voterid1 + ` is `+sendOTP2 + `\n\nRegards\neVoting Team`,
                        }

                        var option = {authorization : process.env.API_KEY , message : 'VoterID :- ' + voterid1 + '\nYour OTP for voter Registration '+ sendOTP1 , numbers : [mob]}
                        fast2sms.sendMessage(option)

                        transporter.sendMail(mailOptions,function(error,info){})
                        console.log(hashpass);
                        res.redirect('http://127.0.0.98:3000/home/registration/otp');
                        app.post('/registerotp',(req,res)=>{
                            var otp1=req.body.mobileotp
                            var otp2=req.body.emailotp
                            

                            pool.query('select * from voterdetails where VoterID=?',[voterid1],(err,result,field)=>{
                                var mobileno1=result[0].MobileNo
                                var city1=result[0].city
                                var state1=result[0].state

                            if(otp1==sendOTP1 && otp2==sendOTP2){
                                pool.query('insert into registration(VoterID,Aadhar_Number,Pan_Number,Name,DOB,Email,MobileNo,city,state,password) values(?,?,?,?,?,?,?,?,?,?)',
                                [voterid1,aadhaarno1,panno1,name1,dob1,Email1,mobileno1,city1,state1,hashpass],(err,result,field) => {
                                    if(err) throw err
                                    if(result.length<=0){
                                        res.redirect('http://127.0.0.98:3000/home/registration/otp');
                                    }
                                    else
                                    {    

                                                                                                                                                 console.log('VoterID :- ' + voterid1 + ' has successfully Registered.');
                                                                                                                                                var mailOptions ={
                                                                                                                                                    from: 'evotingteamofficer@gmail.com',
                                                                                                                                                    to: Email1,
                                                                                                                                                    subject: 'Registration Successful',
                                                                                                                                                    text: 'VoterID :- ' + voterid1 + ' has successfully Registered.'  + `\n\nRegards\neVoting Team`,
                                                                                                                                                }
                                                                                                                                                transporter.sendMail(mailOptions,function(error,info){})
                                        req.flash('message','VoterID : ' + voterid1 + ' has successfully registered.');
                                        res.redirect('http://127.0.0.98:3000/home');
                                    }
                                })
                            }
                            else{
                                req.flash('message','Enter correct OTP')
                                res.redirect('http://127.0.0.98:3000/home/registration/otp');
                            }
                            })
                        })
                    }
                })
            }
            else
            {
                vid=""
                req.flash('message','Enter correct confirm password');
                res.redirect('http://127.0.0.98:3000/home/registration');
            }
        }
        else
        {
            req.flash('message','You have already registered for voting.');
            res.redirect('http://127.0.0.98:3000/home/registration');
        }
    })
    // ======== else ends here ==========
})
// *************************************************   Voter's Registration SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&


// ************************************************* Voter Login SERVER CODE STARTS FROM HERE*******************************************************

var session;

app.get('/home/login',(req,res) =>{
    
    session=req.session;
    console.log("login get session = " + session);
    if(!session.userid )
    {
        res.render('VoterLogin.ejs',{message: req.flash('message')});
    }
    else
    {
        req.flash('message','Other Voter is already login in another tab');
        res.redirect('http://127.0.0.98:3000/home');
    }

})


app.get('/home/login/givevote/verification', function(req, res){

    res.render('verifyvoting_demopage.ejs',{message: req.flash('message')})

});

app.post('/voterlogin',async (req,res) => {

    voteridsuccess = req.body.VID;
    voterid1=req.body.VID
    var password1=req.body.password
    console.log("password1 = "+ password1);
        try
        {

            pool.query('select * from registration where VoterID=? ',[voterid1],(err,result,fields)=>{

                if(err) throw err

            if(result.length<=0)
            {
                try
                {
              

                    console.log("Enter correct  VoterID, Registration not found   try");
                    // req.flash('message','Enter correct  VoterID, Registration not found');
                    req.flash('message','Registration not found, click on link give below for registration');
                    res.redirect('http://127.0.0.98:3000/home/login');
                    // console.log("Enter correct  VoterID, Registration not found   try");
                }
                catch(err)
                {
                    req.flash('message','Registration not found, click on link give below for registration');
                    res.redirect('http://127.0.0.98:3000/home/login');
                }
            }
            else
            {
                reg_city = result[0].city;
                    reg_state = result[0].state;
                    reg_status = result[0].status;
                    emailid1 = result[0].Email;

                console.log("vid  = "+ voterid1);
                var pass1= result[0].password;
                name = result[0].Name;
                const bool=bcrypt.compareSync(password1,pass1)
                console.log(bool);
                if(bool==false)
                {
                    req.flash('message','Enter correct password ')
                    res.redirect('http://127.0.0.98:3000/home/login');
                }
                else
                {
    
                    vid=voterid1;
    
                    console.log("Not voted or voted  " + vid);

                    if(reg_status === "Not voted")
                    {
                        console.log("Not voted");
                        pool.query('select * from candidate where state=? and city=?',[reg_state,reg_city],(err,result,fields)=>{
    
                            try
                            {
                                if(result.length<=0)
                                {
                                    console.log("Election process in '" + reg_state + "' is not yet started");
                                    req.flash('message','Election process in state: "' + reg_state + '" city: "' + reg_city +'" is not yet started');
                                    
                                    res.redirect('http://127.0.0.98:3000/home');
                                }
                                else
                                {
                                    session=req.session;
                                    session.userid=req.body.VID;
                                    session.city = reg_city;
                                    session.state = reg_state;
                                    console.log("req.session = " + req.session);
                                    console.log("session.userid = " + session.userid);
                                    console.log("session.state = " + session.state);
                                    console.log("session.city = " + session.city);
                                    res.redirect('http://127.0.0.98:3000/home/login/givevote');
                                    // ==========================
    
                                    app.post('/verifyvotingotp', async(req,res) => {
                                        fetch_party_name = req.body.partyname;
                                            fetch_confirm = req.body.confirm;
    
                                            console.log("partyname = " + fetch_party_name);
                                                    console.log("vid = " + vid_verifyvotingotp);
                                                    console.log("fetch_confirm = " + fetch_confirm);
                                                    


                                                    pool.query('select * from candidate',(err,result,field)=>{
                                                        if(err) throw err;
                                                        if(result.length<=0)
                                                        {
                                                            req.flash('message','Sorry You are late , Voting process has been ended');
                                                            res.redirect('http://127.0.0.98:3000/home');
                                                        }
                                                        else
                                                        {
                                                            // =================== check confirm ====================
                                                                            if(fetch_confirm === "true")
                                                                            {
                                                                                
                                        
                                                                                        console.log("partyname = " + fetch_party_name);
                                                                                        console.log("vid = " + vid_verifyvotingotp);
                                                                                            vid = vid_verifyvotingotp;
                                                                                        voteingto = "You are voting to " + fetch_party_name;
                                        
                                                                                                        var sendOTP1 = Math.floor(1000+Math.random()*9000)
                                        
                                                                                                        sendVotingOTP = sendOTP1;
                                                                                    
                                                                                                        var mailOptions ={
                                                                                                            from: 'evotingteamofficer@gmail.com',
                                                                                                            to: emailid1,
                                                                                                            subject: 'Email Verification code for Voting Process',
                                                                                                            text: 'VoterID :- ' + voteridsuccess + '     Email Verification code for Voting is '+sendOTP1  + `\n\nRegards\neVoting Team`,

                                                                                                        }
                                                                                                        
                                                                                                        transporter.sendMail(mailOptions,function(error,info){})
                                        
                                                                                                        console.log(" 1 " + sendOTP1);
                                                                                                        console.log(" 2 " + sendVotingOTP);
                                        
                                                                                                        res.redirect('/home/login/givevote/verification');
                                        
                                                                                                app.post('/votingverificationcode', (req,res) => {
                                        
                                                                                                        var otp = req.body.emailotp;
                                        

                                                                                                        pool.query('select * from candidate',(err,result,field)=>{
                                                                                                            if(err) throw err
                                                                                                             
                                                                                                            if(result.length<=0)
                                                                                                            {
                                                                                                                req.flash('message','Sorry You are late , Voting process has been ended');
                                                                                                                res.redirect('http://127.0.0.98:3000/home');
                                                                                                            }
                                                                                                            else
                                                                                                            {

                                                                                                                pool.query('select * from registration where VoterID=? ',[voterid1],(err,result,fields)=>{
                                                                                                                    reg_status = result[0].status;
                                                                                                                    if(err) throw err;
                                                                                                                    if(result.length<=0)
                                                                                                                    {
                                                                                                                        res.redirect('http://127.0.0.98:3000/home');
                                                                                                                    }
                                                                                                                    else
                                                                                                                    {
                                                                                                                        if(reg_status === 'Voted')
                                                                                                                        {
                                                                                                                            req.flash('message','                               VoterID : ' + vid + ' has already voted');
                                                                                                                            res.redirect('http://127.0.0.98:3000/home');
                                                                                                                        }
                                                                                                                        else
                                                                                                                        {
                                                                                                                                if(otp == sendVotingOTP )
                                                                                                                                {
                                                                                                                                    console.log( " if partyname = " + fetch_party_name);
                                                                                                                                    console.log(" 1 " + sendOTP1);
                                                                                                                                    console.log(" 2 " + sendVotingOTP);
                                                                                                                                
                        
                                                                                                                                
                        
                                                                                                                                            pool.query('update electionresult set count=count+1 where party_name=? and state=? and city=?',
                                                                                                                                            [fetch_party_name,reg_state,reg_city],(err,result,field)=>{
                                                                                                                                            console.log("query partyname = " + fetch_party_name);
                                                                                                                                            console.log(reg_state);
                                                                                                                                            console.log(reg_city);
                                                                                                                                            if(err) throw err
                                                                                                                                            if(result.length<=0){
                                                                                                                                                res.redirect('/home/login/givevote/verification');
                                                                                                                                            }
                                                                                                                                            else
                                                                                                                                            {
                                                                                                                                                //you successfully gave vote

                                                                                                                                                console.log('VoterID :- ' + voteridsuccess + ' has successfully Voted.');
                                                                                                                                                var mailOptions ={
                                                                                                                                                    from: 'evotingteamofficer@gmail.com',
                                                                                                                                                    to: emailid1,
                                                                                                                                                    subject: 'Voted Successfully',
                                                                                                                                                    text: 'VoterID :- ' + voteridsuccess + ' has successfully Voted.'  + `\n\nRegards\neVoting Team`,
                                                                                                                                                }
                                                                                                                                                transporter.sendMail(mailOptions,function(error,info){})

                                                                                                                                                pool.query('update registration set status = "Voted" where VoterID=?',

                                                                                                                                                    [voteridsuccess],(err,result,field)=>{
                                                                                                                                                
                                                                                                                                                
                                                                                                                                                });
                                                                
                                                                                                                                                console.log("Voted successfully");
                                                                
                                                                                                                                                req.flash('message','                               VoterID : ' + voteridsuccess + ' Voted successfully');
                                                                                                                                                res.redirect('http://127.0.0.98:3000/home');
                                                                                                                                            }

                                                                                                                                        });

                                                                                                                                }
                                                                                                                                else
                                                                                                                                {
                                                                                                                                    req.flash('message','Enter correct Verification Code');
                                                                                                                                    res.redirect('/home/login/givevote/verification');
                                                                                                                                }
                                                                                                                        }
                                                                                                                    }
                                                                                                                });
                                                                                                            }
                                                                                                        })

                                                                                                });  
                                                                            }
                                                                            else
                                                                            {
                                                                                console.log("error");
                                                                                res.redirect('/home/login/givevote');
                                                                            }
                                                        }
                                                    });


                                        req.session.destroy();
                                        
                                    });
                                    
                                    
                                    // ========================
                                }
                            }
                            catch(err)
                            {
                                console('Error');
                                res.redirect('http://127.0.0.98:3000/home');
                                req.session.destroy();
                            }
        
                        });
                    }
                    else
                    {

                        req.flash('message','                               VoterID : ' + vid + ' has already voted');
                        res.redirect('http://127.0.0.98:3000/home');
                    }

                } 
            } 
        })
        }
        catch(err)
        {
            console.log("Enter correct  VoterID, Registration not found   catch");
            req.flash('message','Enter correct  VoterID, Registration not found');
                res.redirect('http://127.0.0.98:3000/home/login');
        }

    // })

})
// *************************************************  Voter Login SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// ************************************************* Voter's Forgot Password SERVER CODE STARTS FROM HERE*******************************************************

app.get('/home/login/forgotpassword', (req,res) =>{
    res.render('ForgotPassword.ejs',{message: req.flash('message')})
})

app.get('/home/login/forgotpassword/otp',(req,res) =>{

        res.render('forgotpassOTP.ejs',{message: req.flash('message')})

})

app.post('/forgotpassword', async (req,res) => {
    var voterid1=req.body.VID
    var emailid1=req.body.email
    var newpassword1=req.body.newpassword
    var confirmpassword1=req.body.confirmpassword
    var hashpass=await bcrypt.hash(newpassword1,10)
    console.log("vid = "+vid);

        console.log("vid = "+vid);

        if(newpassword1==confirmpassword1)
        {
            pool.query('select * from registration where VoterID=? and Email=?',
            [voterid1,emailid1], (err,result,fields) =>{
                if(err) throw err

                console.log(voterid1);
                console.log(emailid1);
                if(result.length<=0){
                    req.flash('message','Enter correct VoterId or Email ID');
                    res.redirect('/home/login/forgotpassword')
                }
                else{
                    var sendOTP = Math.floor(1000+Math.random()*9000)
                    console.log("email = " + emailid1 );
                    console.log("forgot passwd otp = " + sendOTP);

                    var mailOptions ={
                        from: 'evotingteamofficer@gmail.com',
                        to: emailid1,
                        subject: 'Email Verification code for Forgot password',
                        text: `VoterID :-`+ voterid1 + `\nEmail Verification code for Forgot password is `+sendOTP  + `\n\nRegards\neVoting Team`,
                    }
                    
                    transporter.sendMail(mailOptions,function(error,info){})
                        
                    
                    res.redirect('/home/login/forgotpassword/otp');
                    app.post('/forgototp', (req,res) => {
                        var verifcode1=req.body.emailotp
                        if(verifcode1==sendOTP){
                            pool.query('update registration set password=? where VoterID=? and Email=?',
                            [hashpass,voterid1,emailid1],(err,result,fields) =>{
                                if(err) throw err
                                if(result.length<=0){
                                    req.flash('message','Enter correct data')
                                    res.redirect('http://127.0.0.98:3000/home/login/forgotpassword/otp');
                                }
                                else
                                {
                                    req.flash('message','Paaword updated successfully');
                                    res.redirect('/home/login')
                                }
                            })
                        }
                        else{
                            req.flash('message','You have Entered Incorrect verification code');
                            res.redirect('/home/login/forgotpassword/otp')
                        }
                    })
                        
                }
            })

    }
        
})


// *************************************************  Voter's Forgot Password SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// *************************************************  Voter's Change Password SERVER CODE STARTS FROM HERE*******************************************************

app.get('/home/login/changepassword',(req,res) =>{
    res.render('ChangePassword.ejs',{message: req.flash('message')})
})

app.post('/changepassword', async(req,res) => {

    var voterid1=req.body.VID
    var oldpassword1=req.body.oldpassword
    var newpassword1=req.body.newpassword
    var confirmpassword1=req.body.confirmpassword
    var hashpass=await bcrypt.hash(newpassword1,10)
    console.log(hashpass)
    if(newpassword1==confirmpassword1){
         pool.query('select * from registration where voterid=?',
         [voterid1],(err,result,fields)=>{
            if(err) throw err

            if(result.length<=0)
            {
                req.flash('message','Enter correct VoterId')
                res.redirect('http://127.0.0.98:3000/home/login/changepassword')
            }
            else
            {
                var pass1= result[0].password
            
                const bool=bcrypt.compareSync(oldpassword1,pass1)
                
                if(bool==false){
                    req.flash('message','Enter correct details')
                    res.redirect('http://127.0.0.98:3000/home/login/changepassword')
                }
                else{
                    pool.query('update registration set password=? where voterid=? and password=?',
                    [hashpass,voterid1,pass1],(err,result,fields)=>{
                        if(err) throw err

                        if(result.length<=0){
                            req.flash('message','Enter correct details')
                            res.redirect('http://127.0.0.98:3000/home/login/changepassword')
                        }
                        else
                        {
                            req.flash('message','Password updated successfully');
                            res.redirect('http://127.0.0.98:3000/home/login')
                        }
                    })
                }
            }
        })
    }
    else{
        req.flash('message','Enter confirm password')
        res.redirect('/home/login/changepassword')
    }
})


// *************************************************  Voter's Change Password SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&

// ************************************************* Voter's Give Vote SERVER CODE STARTS FROM HERE*******************************************************


var PORT = 4001;
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
    db.query(sql,function(error,result,fields)
    {
        if(error) throw error;
        cb(result);
    })
}

app.get('/home/login/givevote', function(req, res){
    vid_verifyvotingotp = vid;
    console.log("vid =" + vid);
    if(vid==="")
    {
        console.log("vid =" + vid);
        res.redirect('http://127.0.0.98:3000/home/login');
    }
    else
    {
        vid="";
            var html_con = "";
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');

        console.log('Enter into function');
            executequery("select * from election_parties",function(result)
            {
                // console.log(result);
                res.write('<html');
                res.write('<head>');
                    res.write('<title>Voting Dashboard</title>');
                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');

                res.write('<style>');
                    res.write('body{margin: 0;padding: 0;background-color: lightblue;background-size: cover;background-position: center;font-family: sans-serif;background-color: #327bb873;width:100%;}');
                    res.write('.container{ position:relative; top:10%;left:40px;background: white;width:700px}');
                    
                    res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                    
                    res.write('h2{position: absolute;left: 30%;font-family: cursive; font:"Times, Times New Roman, serif"	font-size: 40px;color: white;}');
                    res.write('input{display : none}')

                res.write('</style>');

                res.write('<script type="text/javascript">');

                res.write('function btnclick(btnid)');
                res.write('{');

                    
                    res.write('var btnid = btnid;');

                        res.write('let text;');
                        res.write('if (confirm("Are you sure you want to vote to "+ btnid + "?") == true) {');
                            res.write('  text = "You pressed OK!";');
                            res.write('document.getElementById("confirmid").value =  "true"');
                            res.write(' } else {');
                                res.write('   text = "You canceled!";');
                                res.write('document.getElementById("confirmid").value =  "false"');
                                res.write(' }');

                    res.write('document.getElementById("partynameid").value =  btnid ');
                    res.write('}');
                    res.write('</script>');
                res.write('</head>')

                res.write('<body>');
                res.write('<div class="header"><img src="/views/evote2.jpg" class="img"><br><h2>VoterID - '+ voterid1 + '     Name - ' + name +'</h2></div>')

                res.write('<div class="container"> ')
                res.write('<form action="/verifyvotingotp" method="post">');
                res.write('<input type="text" name="partyname" id="partynameid" value="shivam">');
                res.write('<input type="text" name="confirm" id="confirmid" value="shivam">');
                res.write('<table class="table table-striped">');
                res.write('<tr>');
                res.write('<thead class="thead-dark">')
                res.write('<th><lable>Sr No.</lable></th>');
                res.write('<th><lable>Party_name</lable></th>');
                res.write('<th><lable>Party_logo</lable></th>');
                res.write('<th><lable>Vote</lable></th>');
                res.write('</thead>');
                var sr_no = 1;
                party_name_as_id;
                for(var row in result)
                {
                    res.write('<tr>')
                    html_con += '<tr>';
                    res.write('<td><lable>' + sr_no + '</lable></td>');
                    for(var col in result[row])
                    {
                            if(col == "party_name")
                            {
                                party_name_as_id = result[row][col]
                            }
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

                    // vote button
                    res.write('<td><button class="btn btn-success btn-mg" type="submit" id="'+ party_name_as_id +'" onclick="btnclick(this.id)" >Vote</button></td>');

                    sr_no++;
                    res.write('</tr>');
                    html_con += '</tr>'
                }
                res.write('</table>');
                res.write('</form>')
                res.write('</div>');

        res.write('</body>');
        res.write('</html');
             // container fluid ends here
                res.end();
            });
    }
// ========= else ends here ==================
});

// *************************************************  Voter's Give Vote SERVER CODE ENDS HERE*******************************************************

// &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&



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
                if(date == "")
                {
                    req.flash('message','Please Enter date to search result');
                    res.redirect('http://127.0.0.98:3000/home');
                }
                else if(result.length<=0)
                {
                    // position = result[0].position;
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
                      
                    res.write('<h3>Voting Result </h3>'); 
                    
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
                        
                            res.write('<link rel="stylesheet" type="text/css"    href="C:\Users\Admin\Desktop\DOC\html\bootstrap\bootstrap-4.4.1-dist\css\bootstrap.min.css">');
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
                                        // console.log("row = "+row+"    co = "+col);
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

                    res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                    res.write('<div class="container" id="generateresultpdf">')
                     
                    res.write('<h3>Voting Result </h3>'); 
                    
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
    // }

});



app.get("/viewfullpastresult",async (req,res) =>
{

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
            

                res.write('<style>');
                res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')

                res.write('.container{padding-left : 30px; padding-right : 30px;,margin-left : 30px; margin-right : 30px;border : 10px solid black;}');
                res.write('</style>');

                res.write('</head>');
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')
                        
                        res.write('<h3>Voting Result </h3>'); 
                        res.write('<br>');

                res.write('<h1>Record Not found</h1>')
                res.write('</div>')
                res.write('</body>');
                res.write('</html>');
            }
            else
            {
                position = result[0].position;
                    res.write('<html>');
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
                        res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')

                            res.write('body{width:100%;}')
                            
                            res.write('.downloadbtn{position: relative;top: 10%;    left: 45%;padding-bottom:50px;}');
                            res.write('.container{position: relative;top: 10%;}');
                            res.write('h3{position: relative;top: 10%; left: 40%}');
                            res.write('tr{font-size : 11px;}');
                            
                
                // =================================================================================================================================================================================================
                // =================================================================================================================================================================================================
                        res.write('</style>');
                
                
                        res.write('</head>')
                
                    res.write('<body id="bodyid">');
                
                
                    res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                        
                    res.write('<div class="downloadbtn text-right mb-3"><button class="btn btn-primary" id="download"> Download Result</button></div>');

                        res.write('<div class="container" id="generateresultpdf">')

                        res.write('<h3>Voting Result </h3>'); 
                        res.write('<br>');

                        res.write('<table class="table table-striped">');
                        res.write('<tr>');
                
                        res.write('<thead class="thead-dark">')
                        res.write('<th><lable>Sr No.</lable></th>');
                        res.write('<th><lable>Election Date</lable></th>');
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
                                    // console.log("row = "+row+"    co = "+col);
                                // ------------------------------------------------------------------------------------------------------------------
                                if(col == "party_logo")
                                {
                                    // console.log("result[row][col] = "+result[row][col]);
                                    res.write('<td><img src="/views/' + result[row][col] + '" "width="50" height="50" class="rounded-circle"></td>');
                                }
                                else if(col == "DOE")
                                {
                                    var date_str = result[row][col].toString();
                                    var showdate;
                                    date_str = date_str.split(" ");
                                    // console.log("voting starts at " + date_str);
                                    // console.log("time = "+ date_str[2] + "_" + date_str[3] + "_" + date_str[3]);
                                    var showdate = date_str[2] + "_" + date_str[1] + "_" + date_str[3];
                                    res.write('<td><lable>' +  showdate + '</lable></td>');
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





// =============================================================================================================================================



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

                res.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">');
            
                res.write('<style>')
                res.write('.header{width: 1348px;width: 100%;height: 90px;background: #fff;background-color: #187ed2;color: #000;top: 0%;position: relative;} .img{width: 220px;height: 90px;position: absolute;left: 4%;}')
                res.write('</style>')

                res.write('</head>');
                res.write('<body>');
                res.write('<div class="header"> <img src="/views/evote2.jpg" class="img"></div>')
                res.write('<div class="container" id="generateresultpdf">')

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
                        res.write('<html>');
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
                        res.write('<div class="header"><img src="/views/evote2.jpg" class="img"></div>')
                
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
                                    // console.log("row = "+row+"    co = "+col);
                                // ------------------------------------------------------------------------------------------------------------------
                                if(col == "party_logo")
                                {
                                    // console.log("result[row][col] = "+result[row][col]);
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
                
                
                                    // console.log("row = "+row+"    co = "+col);
                                }  
                            }
                            sr_no++;
                            res.write('</tr>');
                            html_con += '</tr>'
                        }
                        res.write('</table>');
                        // html_con += '</table>';
                        res.write('</div>');
                
                res.write('</body>');
                res.write('</html');
                        // res.write('</div>');  // container fluid ends here
        }

        res.end();
    });

});


// =============================================================================================================================================

app.listen(PORT, function(err){
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});
// *************************************************  Server running at Port No 3000*******************************************************

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });


// =============================================================================================================================================
