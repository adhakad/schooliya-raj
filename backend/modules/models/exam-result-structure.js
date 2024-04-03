'use strict';
const mongoose = require('mongoose');
const ExamResultStructureModel = mongoose.model('exam-result-structure', {
  class: {
    type: Number,
    required: true,
    trim: true,
  },
  examType: {
    type: String,
    required: true,
    trim: true,
  },
  stream: {
    type: String,
    required: true,
    trim: true,
  },
  theoryMaxMarks: {},
  theoryPassMarks: {},
  practicalMaxMarks: {},
  practicalPassMarks: {},
  gradeMinMarks: {},
  gradeMaxMarks: {},
  resultPublishStatus: {
    type: Boolean,
    required: true,
    trim: true,
    enum: [true, false],
    default: false,
  }
});

module.exports = ExamResultStructureModel;