import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

const accepted_extensions = ['jpg', 'jpeg', 'png', 'gif'];

export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB upload limit
    files: 1, // 1 file
  },
  fileFilter: (req, file, cb) => {
    // if the file extension is in our accepted list
    if (
      accepted_extensions.some(ext => file.originalname.endsWith(`.${ext}`))
    ) {
      return cb(null, true);
    }

    // otherwise, return error
    return cb(
      // new Error(`Only ${accepted_extensions.join(', ')} files are allowed!`)
      {
        field: 'banner',
        message: `Only ${accepted_extensions.join(', ')} files are allowed!`,
      }
    );
  },
};
