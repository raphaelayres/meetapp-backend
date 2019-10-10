import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import authMidleware from './app/middlewares/auth';
import errorMiddleware from './app/middlewares/error';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import MyMeetupController from './app/controllers/MyMeetupController';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/sessions', SessionController.store);

routes.use(authMidleware);

routes.put('/users', UserController.update);

routes.post(
  '/files',
  upload.single('file'),
  errorMiddleware,
  FileController.storage
);

routes.get('/mymeetups', MyMeetupController.index);
routes.post('/mymeetups', MyMeetupController.store);
routes.put('/mymeetups/:id', MyMeetupController.update);

routes.get('/meetups', MeetupController.index);
routes.post('/meetups', MeetupController.store);
routes.put('/meetups/:id', MeetupController.update);

export default routes;
