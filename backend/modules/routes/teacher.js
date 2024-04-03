'use strict';
const express = require('express');
const router = express.Router();
const fileUpload = require('../helpers/file-upload');
const { GetAllTeacher, countTeacher,GetSingleTeacher, CreateTeacher, UpdateTeacher, ChangeStatus, DeleteTeacher, GetTeacherPagination, TeacherPermission } = require('../controllers/teacher');
const { isAdminAuth } = require('../middleware/admin-auth');

router.get('/teacher-count',countTeacher);
router.get('/', GetAllTeacher);
router.post('/teacher-pagination', GetTeacherPagination);
router.get('/:id', GetSingleTeacher);
router.post('/', isAdminAuth, fileUpload.teacherImage.single('image'), CreateTeacher);
router.put('/permission/:id', TeacherPermission);
router.put('/:id', isAdminAuth, UpdateTeacher);
router.put('/status/:id', ChangeStatus);
router.delete('/:id', isAdminAuth, DeleteTeacher);



module.exports = router;