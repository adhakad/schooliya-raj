'use strict';
const mongoose = require('mongoose');

const SchoolKeyModel = mongoose.model('school-key', {
    productKey:{
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    status: {
        type: String,
        trim: true,
        required: true,
        enum: ['Active', 'Inactive'],
        default: 'Inactive'
    }
});

module.exports = SchoolKeyModel;
