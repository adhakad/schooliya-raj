'use strict';
const mongoose = require('mongoose');

const SubjectModel = mongoose.model('subject', {
    subject: {
        type: String,
        required: true,
        trim: true,
    },
});

module.exports = SubjectModel;
