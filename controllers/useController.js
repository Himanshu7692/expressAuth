import UserModel from "../models/User.js";
import bcrypt from 'bcrypt'
import  Jwt  from "jsonwebtoken";
import transporter from '../config/emailConfig.js'

class UserController{

    static userRegistration=async(req,res)=>{
        const {name, email, password, password_confirmation,tc}=req.body
        const user=await UserModel.findOne({email:email})
        
        if(user){
            res.send({"status": "failed", "message":"Email already exists"})
        } else{
             if(name && email && password && password_confirmation &&tc){
                if(password===password_confirmation){
                    try {
                        const salt=await bcrypt.genSalt(10)
                        const hashPassword=await bcrypt.hash(password,salt)
                        const doc=new UserModel({
                            name:name,
                            email:email,
                            password:hashPassword,
                            tc:tc
                        })
                        await doc.save()
                         const saved_user= await UserModel.findOne({email:email})

                        //genrating token

                        const token=Jwt.sign({userID: saved_user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5d'})

                        res.status(201).send({"status": "sucess", "message":"ragistration scuessfully ", "token":token})
                    } catch (error) {
                        res.send({"status": "failed", "message":"Unable to Register"})
                        
                    }
                 } else{
                    res.send({"status": "failed", "message":"password and confirm password doesn not match"})
        
                } 
             }else{
                 res.send({"status": "failed", "message":"All fields are required"})
             }
        }
}

static userLogin= async(req,res)=>{
    try {
        const {email,password}=req.body
        if(email && password){
            const user= await UserModel.findOne({email:email})
            if(user !=null){
                const isMatch=await bcrypt.compare(password,user.password)
                if((user.email===email) && isMatch){

                      //genrating token

                      const token=Jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5d'})

                    res.send({"status": "sucess", "message":" Login Success" , "token": token})

                }else{
                    res.send({"status": "failed", "message":"Email or Password is not valid"}) 
                }  
            } else{
                res.send({"status": "failed", "message":"You are not ragister user"})
            }
        } else{
            res.send({"status": "failed", "message":"All field are require"})
        }
    } catch (error) {
        res.send({"status": "failed", "message":"unable to login "})
    }
}

static changeUserPassword = async (req, res) => {
    const { password, password_confirmation } = req.body
    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        console.log(req.user)
        
        await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
        res.send({ "status": "success", "message": "Password changed succesfully" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  }


  static loggeUser = async (req, res) => {
     
    res.send({"user":req.user})

  }

  static sendUserPasswordResetEmail = async (req, res) => {
    const { email } = req.body
    if (email) {
      const user = await UserModel.findOne({ email: email })
      if (user) {
        const secret = user._id + process.env.JWT_SECRET_KEY
        const token = Jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
       
        const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`
      
        console.log(link)
        // Send Email
        let info = await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: "GeekShop - Password Reset Link",
          html: `<a href=${link}>Click Here</a> to Reset Your Password`
        })
        console.log("vfcbg")
        res.send({ "status": "success", "message": "Password Reset Email Sent... Please Check Your Email","info":info })
      } else {
        res.send({ "status": "failed", "message": "Email doesn't exists" })
      }
    } else {
      res.send({ "status": "failed", "message": "Email Field is Required" })
    }
  }

  static userPasswordReset = async (req, res) => {
    const { password, password_confirmation } = req.body
    const { id, token } = req.params
    const user = await UserModel.findById(id)
    const new_secret = user._id + process.env.JWT_SECRET_KEY
    try {
        Jwt.verify(token, new_secret)
      if (password && password_confirmation) {
        if (password !== password_confirmation) {
          res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
        } else {
          const salt = await bcrypt.genSalt(10)
          const newHashPassword = await bcrypt.hash(password, salt)
          await UserModel.findByIdAndUpdate(user._id, { $set: { password: newHashPassword } })
          res.send({ "status": "success", "message": "Password Reset Successfully" })
        }
      } else {
        res.send({ "status": "failed", "message": "All Fields are Required" })
      }
    } catch (error) {
      console.log(error)
      res.send({ "status": "failed", "message": "Invalid Token" })
    }
  }
}
export default UserController;









