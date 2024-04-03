'use strict';
const express = require('express');
const router = express.Router();
const {GetAllSubject,countSubject,GetSingleSubject,GetSingleSubjectBySubject,CreateSubject,UpdateSubject,DeleteSubject, GetSubjectPagination} = require('../controllers/subject');

router.get('/subject-count',countSubject);
router.get('/',GetAllSubject);
router.post('/subject-pagination',GetSubjectPagination);
router.get('/:id',GetSingleSubject);
router.get('/subject/:id',GetSingleSubjectBySubject);
router.post('/',CreateSubject);
router.put('/:id',UpdateSubject);
router.delete('/:id',DeleteSubject);



module.exports = router;