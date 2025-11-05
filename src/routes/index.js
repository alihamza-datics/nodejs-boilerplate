import express from 'express';
import auth from '../middlewares/auth';
import UserController from './user/user.controller';
import { extentUser } from '../middlewares/extendUser';

const router = express.Router();

export const aclExcludedRoutes = [
  '/api/users/login',
  /^\/api-docs\/.*/,
];

router.use(auth.required.unless({ path: aclExcludedRoutes }));
router.use(extentUser);

router.use('/users', UserController.getRouter());

export default router;
