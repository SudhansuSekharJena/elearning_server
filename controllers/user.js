import { User } from "../models/user.js";
import bcrypt from "bcrypt"; // used for hashing password securely
import jwt from 'jsonwebtoken' // used for creating and verifying json webtokern
import {sendForgotMail, sendMail} from "../middlewares/sendMail.js";
import TryCatch from "../middlewares/TryCatch.js";

// Create Register API
export const register = async(req, res)=>{
  try {
    const { email, name, password } = req.body

    let user = await User.findOne({email})
    // Checks if a user with the eamil is present in db, if present the  400  -> user present

    if(user) return res.status(400).json({message: "User Already exists"})

    // encrypt password with hashtable and salt
    const hashPassword = await bcrypt.hash(password, 10) // 10 is the salt rounds. hashing algo will be applied in 2^10 iterations
    

    // create user with the data given
    user = {
      name,
      email,
      password: hashPassword,
    }

    // generate OTP
    const otp = Math.floor(Math.random() * 1000000);

    // Token creation jwt.sign(payload, secret, options)
    // activationToken will contain otp in it.
    const activationToken = jwt.sign({
      user,
      otp,
    }, process.env.Activation_Secret,
    {
      expiresIn: "5m",
    });

    // this data is to be send in email
    const data = {
      name,
      otp,
    }

    await sendMail(email,"E learning",data)

    res.status(201).json({
      message: "Otp send to your mail",
      activationToken
    });
  } catch (error) {
    res.status(500).json({message: error.message})
  }
}


//
export const verifyUser = TryCatch(async (req, res) => {
  // activationToken contains:
  // 1. payload = {user: {name, email, password}, otp}
  // 2. Activation_Secret
  // 3. option --> { expiresIn: "5m"} --> means expires in 5 minutes.

  const { otp, activationToken } = req.body;

  // After registration, get activationToken -> activationToken is companred and verified with Activation_Secret that we have in the system
  // if verified then payload is returned and stored in verify.
  const verify = jwt.verify(activationToken, process.env.Activation_Secret)

  if(!verify){
    return res.status(401).json({message: "Invalid Token"})
  }

  if(verify.otp !== otp){
    return res.status(400).json({message: "Wrong OTP"})
  }

  // If valid then create User // user is an object
  // user-> name, email, password
  await User.create({
    name: verify.user.name,
    email: verify.user.email,
    password: verify.user.password,
  })

  res.status(200).json({message: "User registered"})

})

export const loginUser = TryCatch( async(req, res) => {
  const { email, password } = req.body;
  // 1st checking the User match
  const user = await User.findOne({email}) // return user object

  if(!user){
    return res.status(400).json({message: "No user with this email"})
  }
  // Chekcing the password match
  // if user present then match the user's password in database with the passowrd user is entering

  // compares entered passowrd with the hashed password
  const matchPassword = await bcrypt.compare(password, user.password);

  if(!matchPassword){
    return res.status(400).json({message: "Wrong Password"})
  }

  // if both cases passes then we will create a token which will be helpful during login.
  // jwt -> jsonwebtoken
  // jwt.sign( payload, secret, option )
  const token = jwt.sign(
    { _id: user._id} ,
    process.env.Jwt_Secret,
    { expiresIn: "15d" }
  )

  // then token and user[total user details] is sent.
  
  res.json({
    message: `Welcome back ${user.name}`,
    token,
    user,
  })
})


// Fetching my profile --> only need token
// It will return user data and the id of the user
export const myProfile = TryCatch( async (req, res)=>{
  const user = await User.findById(req.user._id)
  res.json({ user , id: req.user._id})
})

// ...FORGOT PASSOWRD...
export const forgotPassword = TryCatch(async (req, res)=>{
  const { email } = req.body;

  const user = await User.findOne({ email });

  if(!user){
    return res.status(404).json({
      message: "No user with this email"
    })
  }

  const token = jwt.sign({ email }, process.env.Forgot_Secret);


  const data = { email, token };


  await sendForgotMail("E-Learning", data);

  user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;

  await user.save();

  return res.status(200).json({
    message: "Reset Password is send to your mail",
  })


})

// ...RESET PASSWORD...
export const resetPassword = TryCatch( async(req, res)=>{
  const forgotToken = req.query.token; // take token from query parameter.
  const decodedData = jwt.verify(forgotToken, process.env.Forgot_Secret);

  const user = await User.findOne({ email: decodedData.email });

  if(!user){
    return res.status(404).json({
      message: "No user with this email "
    })
  }
  
  // this is for when using this link user has changed the password and this check is for restricting the user to not reset the password again from the same link.
  if(user.resetPasswordExpire === null){
    return res.status(400).json({
      message: "Token Expired",
    })
  }

  if(user.resetPasswordExpire < Date.now()){
    return res.status(400).json({
      message: "Token Expired"
    })
  }

  // the new password we get , we will bcrypt it.
  const newPassword = await bcrypt.hash(req.body.password, 10);

  // ASSIGN NEW PASSWORD TO THE USER
  user.password = newPassword;

  // Assign resetPasswordExpire to null
  user.resetPasswordExpire = null;

  // save all the changes done in the user.
  await user.save();
  return res.status(200).json({
    message: "Password reset"
  })

})