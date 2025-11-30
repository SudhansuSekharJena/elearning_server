import jwt from "jsonwebtoken"
import { User } from "../models/user.js";

// this middlwware check for authentication before accessing profile

// when client makes some request (like to /myProfile ROUTE), it sends the token to request headers.
// server will decode the token to extract the user._id, verify its integrity using the same secret( Jwt_Secret ), and then use the _id to identify the user

export const isAuth = async (req, res, next) =>{
  try {
    // token contains: { payload, SecretKey, option }
    // 1. payload: {_id: user._id}
    // 2. Secret_key: 
    // 3. option: { expiresIn: "15d"}
    const token = req.headers.token;
    // No token means he hasent't logged in
    if(!token){
      return res.status(401).json({message: "Please login to access this route."})
    }

    const decodedData = jwt.verify(token, process.env.Jwt_Secret);

    // got the user by fetching from User model using decodedData._id
    // when we do Authentication
    req.user = await User.findById(decodedData._id);

    next()
  } catch (error) {
    return  res.status(500).json({message: "Login First"});
  }
}

export const isAdmin = async (req, res, next) =>{
  try {
    if(req.user.role !== "admin"){
      return res.status(403).json({
        message: "You are not admin"
      })
    }
      
    next()
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

export const isSuperAdmin = async ( req, res, next ) =>{
  try {
    if(req.user.mainrole !== "superAdmin"){
      return res.status(403).json({
        message: "You are not Super Admin"
      })
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    })
  }
}
