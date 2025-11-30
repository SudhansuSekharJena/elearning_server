import mongoose from 'mongoose'

// In schema we define collection and in collection we define doucments which are fields with type and required and other things
const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  }, 
  description: {
    type: String,
    required: true,
  },
  image:{
    type: String,
    required: true,
  },
  price:{
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true 
  },
  category: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

// Schema is ready now export the model


export const Courses = mongoose.model("Courses", schema)