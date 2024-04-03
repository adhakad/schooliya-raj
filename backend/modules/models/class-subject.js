'use strict';
const mongoose = require('mongoose');

const ClassSubjectModel = mongoose.model('class-subject', {
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
    subject: {},
});

module.exports = ClassSubjectModel;