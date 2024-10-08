import express from 'express'

import { registerUser,loginUser, getUserDetail,resetPassword,forgetPassword, getUserProfileById,logoutUser } from '../Controller/authcontroller.js';
const router= express.Router()

router.post('/login',loginUser)
router.post('/register',registerUser)
router.get('/getuser',getUserDetail)
router.put('/reset-password/:token', resetPassword);
router.post('/forget-password',forgetPassword)
//router.put('/update',updateUserProfile)
router.get('/:id', getUserProfileById)
router.post('/logout', logoutUser);



export default router;
