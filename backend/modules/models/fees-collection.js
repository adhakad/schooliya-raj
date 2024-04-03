'use strict';
const mongoose = require('mongoose');
const FeesCollectionModel = mongoose.model('fees-collection', {
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
  admissionFees: {
    type: Number,
    required: true,
    trim: true,
    default: 0
  },
  admissionFeesPayable: {
    type: Boolean,
    required: true,
    trim: true,
  },
  admissionFeesReceiptNo: {
    type: Number,
    required: true,
    trim: true,
    default: 0
  },
  admissionFeesPaymentDate: {
    type: String,
    required: true,
    trim: true,
    default: 'empty'
  },
  totalFees: {
    type: Number,
    required: true,
    trim: true,
  },
  paidFees: {
    type: Number,
    required: true,
    trim: true,
  },
  dueFees: {
    type: Number,
    required: true,
    trim: true,
  },
  installment: {},
  receipt: {},
  paymentDate: {},
  createdBy: {}
});

module.exports = FeesCollectionModel;