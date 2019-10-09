import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMidleware from './app/middlewares/auth';
import errorMiddleware from './app/middlewares/error';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidleware);

routes.put('/users', UserController.update);

routes.post('/files', upload.single('file'), FileController.storage);

routes.post(
  '/meetups',
  upload.single('banner'),
  errorMiddleware,
  MeetupController.store
);

export default routes;
