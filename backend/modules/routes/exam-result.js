'use strict';
const express = require('express');
const router = express.Router();
const {GetSingleStudentExamResult,GetSingleStudentExamResultById,GetAllStudentExamResultByClass,CreateExamResult,CreateBulkExamResult} = require('../controllers/exam-result');

router.get('/student/:id',GetSingleStudentExamResultById);
router.get('/class/:id',GetAllStudentExamResultByClass);
router.post('/',CreateExamResult);
router.post('/bulk-exam-result',CreateBulkExamResult);
router.post('/result',GetSingleStudentExamResult);
module.exports = router;