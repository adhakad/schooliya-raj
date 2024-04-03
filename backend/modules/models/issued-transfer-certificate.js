'use strict';
const mongoose = require('mongoose');

const IssuedTransferCertificateModel = mongoose.model('issued-transfer-certificate', {
    serialNo: {
        type: Number,
        required: true,
        trim: true,
        unique: true
    },
    session: {
        type: String,
        required: true,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    class: {
        type: Number,
        required: true,
        trim: true
    },
    // admissionClass:{
    //     type: Number,
    //     required: true,
    //     trim: true
    // },
    admissionNo: {
        type: Number,
        required: true,
        trim: true,
        unique:true
    },
    rollNumber: {
        type: Number,
        required: true,
        trim: true,
    },
    stream: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: String,
        required: true,
        trim: true
    },
    doa: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    religion: {
        type: String,
        required: true,
        trim: true
    },
    nationality: {
        type: String,
        required: true,
        trim: true
    },
    aadharNumber: {
        type: Number,
        trim: true,
        required: true,
        unique: true,

    },
    janAadharNumber: {
        type: Number,
        trim: true,
        required: true,
        unique: true,

    },
    udiseNumber: {
        type: Number,
        trim: true,
        unique:true,

    },
    bankAccountNo:{
        type: Number,
        trim: true  
    },
    bankIfscCode:{
        type:String,
        trim: true  
    },
    contact: {
        type: Number,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    lastSchool: {
        type: String,
        trim: true
    },
    fatherName: {
        type: String,
        required: true,
        trim: true
    },
    fatherQualification: {
        type: String,
        required: true,
        trim: true
    },
    motherName: {
        type: String,
        required: true,
        trim: true
    },
    motherQualification: {
        type: String,
        required: true,
        trim: true
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
});
module.exports = IssuedTransferCertificateModel;