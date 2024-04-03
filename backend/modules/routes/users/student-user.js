'use strict';
const express = require('express');
const router = express.Router();
const {SignupStudent,LoginStudent,RefreshToken, VarifyForgotStudent, VarifyForgotOtp, ResetForgotStudent} = require('../../controllers/users/student-user');

router.post('/signup',SignupStudent);
router.post('/login',LoginStudent);
router.post('/refresh',RefreshToken);

router.post('/varify-student',VarifyForgotStudent);
router.post('/varify-otp',VarifyForgotOtp);
router.post('/reset-username-password',ResetForgotStudent);



module.exports = router;