import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Progress } from "../models/Progress.js";
import { User } from "../models/user.js";
import crypto from 'crypto'


// Getting all courses
export const getAllCourses = TryCatch( async (req, res) => {
  const courses = await Courses.find()

  return res.json({
    message: "Courses fetched successfully",
    courses,
  })
})


// Getting course by _id
export const getSingleCourse = TryCatch( async (req, res) => {
  const course = await Courses.findById(req.params.id)

  res.json({
    message: "Course fetched successfully",
    course,
  })
})


// for fetching lectures you need to be an User that means you need to be authenticated.
export const fetchLectures = TryCatch( async (req, res) => {
  // fetch lectures by course id
  // then get user by id
  // if user is admin then it will fetch all lectures
  const course_id = req.params.id
  const lectures = await Lecture.find({
    course: course_id // this is course -> _id
  }) 

  const user = await User.findById(req.user._id);
  if(user.role === "admin"){
    return res.json({
      message: "Lectures fetched successfully by Admin",
      lectures,
    })
  }

  // course_id not in subscriptions
  if(!user.subscription.includes(course_id)){
    return res.status(400).json({
      message: "You have not subscribed to this course."
    })
  }

  res.json({ 
    message: "Lectures fetched by subscribed Users",
    lectures 
  })
})




export const fetchLecture = TryCatch( async ( req, res ) =>{
  const lecture_id = req.params.id
  const lecture = await Lecture.findById(lecture_id) 

  const user = await User.findById(req.user._id);
  if(user.role === "admin"){
    return res.json({
      message: "Lecture fetched successfully by Admin",
      lecture,
    })
  }
  
  const course_id = lecture.course;
  // course_id not in subscriptions
  if(!user.subscription.includes(course_id)){
    return res.status(400).json({
      message: "You have not subscribed to this course."
    })
  }

  res.json({ 
    message: "Lecture fetched by subscribed Users",
    lecture
  })
})

 
// you can use this without being admin
export const getMyCourses = TryCatch(async (req, res)=>{

  const courses = await Courses.find({_id: req.user.subscription})

  return res.json({
    courses,
  })
})



export const checkout = TryCatch( async (req, res) => {
  // Fetch the user using the id from the authenticated request.
  const user = await User.findById(req.user._id)

  // Find the course the user want to purchase--> id will be the course id
  const course = await Courses.findById(req.params.id)

  // check is the user has already subscribed to this course
  if(user.subscription.includes(course._id)){
    return res.status(400).json({
      message: "You already have this course"
    })
  }

  // if course not present
  user.subscription.push(course._id);
  // When you buy the course at that time only progress tracker will start tracking the progress.

  // When you buy course, Progress object gets created.
  await Progress.create({
    course: course._id, // the course_id that bought
    completedLectures: [], // as course just bought so progress is empty array
    user: req.user._id, // current user
  });

  await user.save()

  res.status(200).json({
    message: `${course.title} purchased successfully`,
    course: course,
  })
})


export const addProgress = TryCatch( async (req, res)=>{
  const progress = await Progress.findOne({
    user: req.user._id,
    course: req.query.course,
  });
  const { lectureId } = req.query;

  if(progress.completedLectures.includes(lectureId)){
    return res.json({
      message: "Progress recoreded"
    });
  }

  // Intial progression stage.. Starting the course
  progress.completedLectures.push(lectureId)
  await progress.save()

  return res.status(201).json({
    message: "new Progress added",
  }); 
});

export const getYourProgress = TryCatch( async ( req, res)=>{
  const progress = await Progress.find({
    user: req.user._id,
    course: req.query.course,
  });

  if(!progress) return res.status(404).json({message: "null"});
  

  // All lecture length: get number of lectures of a particular course using course_id from query parameter.
  const allLectures = (await Lecture.find({course: req.query.course})).length;
  
  // All completed lectures length: get number of completed lectures
  const completedLectures = progress[0].completedLectures.length;

  const courseProgressPercentage = Math.floor((completedLectures * 100) / allLectures);

  return res.json({
    courseProgressPercentage,
    completedLectures,
    allLectures,
    progress,
  })
})