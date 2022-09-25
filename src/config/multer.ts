import multer from 'multer'
import path from 'path'
import aws from 'aws-sdk'
import multerS3 from 'multer-s3'
import getUniqueSuffix from '../utils/getUniqueSuffix'

const storageTypes = {
  local: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.resolve(__dirname, '..', 'temp', 'uploads'))
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = getUniqueSuffix()

      cb(null, uniqueSuffix + file.originalname)
    },
  }),
  s3: multerS3({
    s3: new aws.S3(),
    bucket: process.env.AWS_BUCKET,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = getUniqueSuffix()

      cb(null, uniqueSuffix + file.originalname)
    },
  }),
}

const multerConfig = {
  dest: path.resolve(__dirname, '..', 'temp', 'uploads'),
  storage: storageTypes[process.env.STORAGE_TYPE],
  limits: {
    fileSize: 6 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg',  'image/pjpeg', 'image/png', 'image/gif']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
}

export default multerConfig
