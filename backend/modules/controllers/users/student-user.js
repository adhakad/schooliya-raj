'use strict';
const bcrypt = require('bcrypt');
const tokenService = require('../../services/student-token');
const StudentUserModel = require('../../models/users/student-user');
const StudentModel = require('../../models/student');

let SignupStudent = async (req, res, next) => {
    const { email, password, rollNumber, otp } = req.body;
    try {
        const checkUser = await StudentUserModel.findOne({ email: email });
        if (checkUser) {
            return res.status(400).json("Username already exist !");
        }
        const student = await StudentModel.findOne({ rollNumber: rollNumber, class: req.body.class });
        if (!student) {
            return res.status(404).json("Student not exist in this institute !");
        }
        const studentId = student._id;
        const checkStudentId = await StudentUserModel.findOne({ studentId: studentId });
        if (checkStudentId) {
            return res.status(400).json("Roll number and class are invalid !");
        }
        const checkOtp = await student.otp;
        if (otp !== checkOtp) {
            return res.status(400).json("Your otp is invalid !");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        let studentData = {
            studentId: studentId,
            email: email,
            password: hashedPassword
        }
        const createSignupStudent = await StudentUserModel.create(studentData);
        if (createSignupStudent) {
            return res.status(200).json('Student register successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let LoginStudent = async (req, res, next) => {
    let otp = Math.floor(Math.random() * 899999 + 100000);
    const studentData = { otp: otp };
    try {
        let student = await StudentUserModel.findOne({ email: req.body.email });
        if (!student) {
            return res.status(404).json({ errorMsg: 'Username or password invalid !' });
        }
        const passwordMatch = await bcrypt.compare(req.body.password, student.password);

        if (!passwordMatch) {
            return res.status(404).json({ errorMsg: 'Username or password invalid !' });
        }

        let studentId = student.studentId;
        let studentInfo = await StudentModel.findOne({ _id: studentId });
        if (studentInfo.status == "Inactive") {
            return res.status(400).json({ errorMsg: 'Login permission blocked, please contact school administration !' });
        }
        if (studentInfo.status == "Active") {
            const payload = { id: studentInfo._id, name: studentInfo.name, email: student.email, class: studentInfo.class, rollNumber: studentInfo.rollNumber };
            const accessToken = await tokenService.getAccessToken(payload);
            const refreshToken = await tokenService.getRefreshToken(payload);
            const updateOtp = await StudentModel.findByIdAndUpdate(studentId, { $set: studentData }, { new: true });
            if (updateOtp && accessToken) {
                return res.status(200).json({ studentInfo: studentInfo, accessToken, refreshToken });
            }
        }
        return res.status(400).json({ errorMsg: 'Login error !' });
    } catch (error) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

let RefreshToken = async (req, res, next) => {
    try {
        const { token } = req.body
        if (token) {
            const payload = await tokenService.verifyRefreshToken(token)
            const accessToken = await tokenService.getAccessToken(payload)
            res.send({ accessToken })
        }
        else {
            res.status(403).send('token Unavailable!!')
        }
    } catch (err) {
        return res.status(500).json({ errorMsg: 'Internal Server Error !' });
    }
}

let VarifyForgotStudent = async (req, res, next) => {
    const { rollNumber } = req.body;
    const className = req.body.class;
    const varifiedStudentInfo = {
        class: className,
        rollNumber: rollNumber
    }
    try {
        const student = await StudentModel.findOne({ rollNumber: rollNumber, class: className });
        if (!student) {
            return res.status(404).json("Student not exist in this school !");
        }
        const studentId = student._id;
        const checkStudentId = await StudentUserModel.findOne({ studentId: studentId });
        if (!checkStudentId) {
            return res.status(404).json("Student not exist in this school !");
        }
        if (checkStudentId) {
            return res.status(200).json({ varifiedStudentInfo: varifiedStudentInfo });
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let VarifyForgotOtp = async (req, res, next) => {
    const { rollNumber, otp } = req.body;
    const className = req.body.class;
    const varifiedOtpInfo = {
        class: className,
        rollNumber: rollNumber,
        otp: otp
    }
    try {
        const student = await StudentModel.findOne({ rollNumber: rollNumber, class: className, otp: otp });
        if (!student) {
            return res.status(404).json("Invalid OTP !");
        }
        const studentId = student._id;
        const checkStudentId = await StudentUserModel.findOne({ studentId: studentId });
        if (!checkStudentId) {
            return res.status(404).json("Student not exist in this school !");
        }
        if (checkStudentId) {
            return res.status(200).json({ varifiedOtpInfo: varifiedOtpInfo });
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let ResetForgotStudent = async (req, res, next) => {
    const { rollNumber, otp, email, password } = req.body;
    const className = req.body.class;
    try {
        const student = await StudentModel.findOne({ rollNumber: rollNumber, class: className, otp: otp });
        if (!student) {
            return res.status(404).json("Student not exist in this school !");
        }
        const studentId = student._id;
        const checkStudent = await StudentUserModel.findOne({ studentId: studentId });
        if (!checkStudent) {
            return res.status(404).json("Student not exist in this school !");
        }
        const checkUser = await StudentUserModel.findOne({ email: email });
        if (checkUser) {
            return res.status(400).json("Username already exist !");
        }
        const objectId = checkStudent._id;
        const hashedPassword = await bcrypt.hash(password, 10);
        const resetStudentUserInfo = {
            email: email,
            password: hashedPassword
        }
        const updateStudentUser = await StudentUserModel.findByIdAndUpdate(objectId, { $set: resetStudentUserInfo }, { new: true });
        if (updateStudentUser) {
            return res.status(200).json('Username and password reset successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    SignupStudent,
    LoginStudent,
    RefreshToken,
    VarifyForgotStudent,
    VarifyForgotOtp,
    ResetForgotStudent
}