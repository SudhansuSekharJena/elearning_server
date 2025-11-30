import multer from 'multer'
import {v4 as uuid} from 'uuid'

//.diskStorage: This configures how and where file should be stored on the disk
// multer.diskStorage() returns a storage engine configuration object.Tells where and how to store uploaded files.
// ARGS: -> A OBJECT WITH TWO KEY FUNCTIONS...
// 1. destination function -->where the uploaded files will be saved
// 2. filename function --> what the name if the file should be when it is stored.


// destination: a function that specifies where the uploaded files will be saved. In this case it is stored in uploads
// ARGS: req, file, cb


// filename: fun determines the name of the saved file. used  uuid to create random id, extract extension from the uploaded file and merged them to create new file name to save it.
// ARGS: req, file, cb

// file metadata --> file.originalname, file.mimetype

// cb --> callback --> cb is called to pass values(destination path or filename), 
// cb takes 2 attributes error and filename or destination path.


// 1. CONFIGURE MULTER STORAGE ENGINE ( provide storage engine ) --> defines storage options
const storage  = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads")
  },
  filename: (req, file, cb) =>{
    const id = uuid() // generate random id for file

    const extName = file.originalname.split(".").pop();
    const fileName = `${id}.${extName}`;

    cb(null, fileName)
  }

})



export const uploadFiles = multer({storage}).single("file")
// multer ==> is a middleware that handles 'multipart/form-data', used for file uploads
// storage ==> this configure storage options for multer
// .single("file") ==> This should handle only a single file upload for a form field named "file"
// export const uploadFiles = multer({storage}).single("file") ==> export multer middleware with storage



