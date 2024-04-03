'use strict';
const mongoose = require('mongoose');

const AdmissionEnquiryModel = mongoose.model('admission-enquiry', {
    session: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
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
    dob: {
        type: String,
        required: true,
        trim: true,
    },
    doae: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
        trim: true,
    },
    religion: {
        type: String,
        required: true,
        trim: true,
    },
    nationality: {
        type: String,
        required: true,
        trim: true,
    },
    contact: {
        type: Number,
        required: true,
        trim: true,
    },
    address: {
        type: String,
        required: true,
        trim: true,
    },
    lastSchool: {
        type: String,
        trim: true,
    },
    fatherName: {
        type: String,
        required: true,
        trim: true,
    },
    fatherQualification: {
        type: String,
        required: true,
        trim: true,
    },
    motherName: {
        type: String,
        required: true,
        trim: true,
    },
    motherQualification: {
        type: String,
        required: true,
        trim: true,
    },
    parentsOccupation: {
        type: String,
        required: true,
        trim: true
    },
    parentsContact: {
        type: Number,
        required: true,
        trim: true
    },
    parentsAnnualIncome: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        required: true,
        trim: true,
        enum: ['Pending', 'Complete'],
        default: 'Pending',
    },
});
module.exports = AdmissionEnquiryModel;