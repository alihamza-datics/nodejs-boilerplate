import express from 'express';
import auth from '../middlewares/auth';
import UserController from './user/user.controller';

const router = express.Router();

export const aclExcludedRoutes = [
  '/api/users/login',
  { url: '/api/users', methods: ['POST'] },
  /^\/api-docs\/.*/,
];

router.use(auth.required.unless({ path: aclExcludedRoutes }));

router.use('/users', UserController.getRouter());

export default router;
