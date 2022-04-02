const express = require('express')
const app = express()
const hostname = '127.0.0.20';
const port = 4000;

app.use(express.urlencoded({ extended: false}))

const {createPool
}=require('mysql');

const pool=createPool({
    host:"localhost",
    user:"root",
    password:"SHIV@m2001",
    database:"sdp",
    connectionLimit:100
});

app.use('/views',express.static('views'))

app.get('/login',(req,res) =>{
    res.render('VoterLogin.ejs')
})

app.get('/changepassword',(req,res) =>{
    res.render('ChangePassword.ejs')
})

app.get('/LoginSuccess',(req,res) =>{
    res.render('LoginSuccess.ejs')
})

app.get('/LoginUnsuccess',(req,res) =>{
    res.render('LoginUnsuccess.ejs')
})

app.post('/login',async (req,res) => {

        var voterid1=req.body.voterid
        var password1=req.body.password
        pool.query('select * from sample where voterid=? and password=?',[voterid1,password1],(err,result,fields)=>{
            if(err) throw err

            if(result.length<=0){
                res.redirect('/LoginUnsuccess')
            }
                
            
            else{
            res.redirect('/LoginSuccess')
        }
        })
    
})

app.post('/changepassword', async(req,res) => {

        var voterid2=req.body.voterid
        var oldpassword2=req.body.oldpassword
        var newpassword1=req.body.newpassword
        var confirmpassword1=req.body.confirmpassword
        if(newpassword1==confirmpassword1){
             pool.query('select * from sample where voterid=? and password=?',
             [voterid2,oldpassword2],(err,result,fields)=>{
                if(err) throw err
    
                if(result.length<=0){
                    res.redirect('/LoginUnsuccess')
                }
                           
                else{
                    pool.query('update sample set password=? where voterid=? and password=?',
                    [newpassword1,voterid2,oldpassword2],(err,result,fields)=>{
                        if(err) throw err

                        if(result.length<=0){
                            res.redirect('/LoginUnsuccess')
                        }
                        else{
                            res.redirect('/login')
                        }
                    })
                }
            })
        }
        else{
            res.redirect('/LoginUnsuccess')
        }
})


app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/Add_Candidate`);
  });