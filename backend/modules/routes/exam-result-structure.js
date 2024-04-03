'use strict';
const express = require('express');
const router = express.Router();
const {GetSingleClassExamResultStructure,GetSingleClassExamResultStructureByStream,CreateExamResultStructure,DeleteResultStructure, ChangeResultPublishStatus} = require('../controllers/exam-result-structure');

router.post('/',CreateExamResultStructure);
router.get('/:id',GetSingleClassExamResultStructure);
router.get('/class/:class/stream/:stream/exam/:exam',GetSingleClassExamResultStructureByStream);
router.put('/result-publish-status/:id', ChangeResultPublishStatus);
router.delete('/:id',DeleteResultStructure);

module.exports = router;