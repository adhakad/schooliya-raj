'use strict';
const mongoose = require('mongoose');

const AdminModel = mongoose.model('admin-users', {
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        trim: true,
        required: true,
        enum: ['Active', 'Inactive'],
    }
});

module.exports = AdminModel;
