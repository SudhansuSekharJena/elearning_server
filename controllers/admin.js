import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs"
import { promisify} from 'util'
import fs from 'fs'
import { User } from "../models/user.js";

// title, description, category
export const createCourse = TryCatch( async (req, res) => {
  const {title, description, category, createdBy, duration, price} = req.body;

  const image = req.file

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  })
});

export const addLecture = TryCatch( async ( req, res )=>{

  // get the course in which you want to add lectures
  const course_id = req.params.id
  const course = await Courses.findById(course_id) // this is course fetched using the id sent in url for checking only ki course is present or not

  if(!course){
    return res.status(404).json({
      message: "No course with this id"
    })
  }

  // if get course
  const { title, description } = req.body

  const file = req.file

  const lecture = await Lecture.create({
    title,
    description,
    video: file?.path ,// if file present-> path sent
    course: course._id,
    } 
  )

  res.status(201).json({
    message: "Lecture Added",
    lecture
  })
  
})

// DELETE LECTURE by using lecture ._id
export const deleteLecture = TryCatch( async ( req, res ) => {
  // needed lecture_id from frontend 
  const lecture_id = req.params.id
  

  // lecture is searched using the lecture_id backend got from frontend.
  const lecture = await Lecture.findById(lecture_id)
  console.log(`Lecture: ${lecture}`)

  // delete video from the file
  rm(lecture.video, ()=>{
    console.log("Video deleted")
  })

  // delete the lecture from the Lecture database
  // deleted by deleteOne() function.
  await lecture.deleteOne()

  return res.json({message: "Lecture Deleted"})
   
})


// fs.unlink in default work in call back architecture so to make it work in promise architecture we use promisify to make it promise
const unlinkAsync = promisify(fs.unlink)

export const deleteCourse = TryCatch( async (req, res)=>{
  const course_id = req.params.id;

  const course = await Courses.findById(course_id)
  const lectures = await Lecture.find({course: course_id})

  // Delete All Lectures...(All its videos)
  // Promise.all takes array of promises and returns single promise.
  await Promise.all(
    lectures.map(async(lecture) => {
       await unlinkAsync(lecture.video);
       console.log("Video deleted")
    })
  )

  // Delete thumbnail of course(image deleted)
  rm(course.image, ()=>{
    console.log("image deleted")
  })

  // Delete lecture from database
  await Lecture.find({course: course_id}).deleteMany()

  // Delete Course from database
  await course.deleteOne()

  // Remove the course from Users's subscription
  // this is Mongoose function to delete the target data
  await User.updateMany({}, {$pull: {subscription: req.params.id }})


  res.json({
    message: "Courses Deleted"
  })
})


export const getAllStats = TryCatch( async (req, res) =>{
  const totalCourses = (await Courses.find()).length

  const totalLectures = (await Lecture.find()).length

  const totalUsers = (await User.find()).length

  const stats = {
    totalCourses,
    totalLectures,
    totalUsers
  }

  return res.json({
    message: "Stats",
    stats
  })
})

export const getAllUsers = TryCatch( async (req, res)=>{
  // get all the users except me and also give all details except password $ne means not-equal to
  const users = await User.find({_id: {$ne: req.user._id}}).select("-password");

  res.json({users});

})

export const updateRole = TryCatch( async(req, res)=>{
  const user = await User.findById(req.params.id);

  if(user.role === "user"){
    user.role = "admin"
    user.save();

    return res.status(200).json({message: "Role updated to admin"})
  }

  if(user.role === "admin"){
    user.role = "user"
    user.save();

    return res.status(200).json({message: "Role updated to user"})
  }
})