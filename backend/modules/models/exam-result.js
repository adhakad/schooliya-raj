'use strict';
const mongoose = require('mongoose');
const ExamResultModel = mongoose.model('exam-result', {
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  class: {
    type: Number,
    required: true,
    trim: true,
  },
  stream: {
    type: String,
    required: true,
    trim: true,
  },
  examType: {
    type: String,
    required: true,
    trim: true,
  },
  theoryMarks: {},
  practicalMarks: {},
  createdBy: {
    type: String,
    required: true,
    trim: true,
  }
});

module.exports = ExamResultModel;