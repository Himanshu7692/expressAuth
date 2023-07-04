import express from "express";
const router=express.Router();
import UserController from "../controllers/useController.js";
import checkUserAuth from '../middlewares/auth-middleware.js';

router.use('/changepassword', checkUserAuth)
router.use('/logeuser', checkUserAuth)


router.post('/register',UserController.userRegistration)
router.post('/login',UserController.userLogin)
router.post('/send-reset-password-email', UserController.sendUserPasswordResetEmail)
router.post('/reset-password/:id/:token', UserController.userPasswordReset)



router.post('/changepassword', UserController.changeUserPassword)
router.get('/logeuser', UserController.loggeUser)

export default router;
