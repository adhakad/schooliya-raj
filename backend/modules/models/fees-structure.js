'use strict';
const mongoose = require('mongoose');
const FeesModel = mongoose.model('fees-structure', {
  class: {
    type: Number,
    required: true,
    trim: true,
  },
  admissionFees: {
    type: Number,
    required: true,
    trim: true,
  },
  totalFees: {
    type: Number,
    required: true,
    trim: true,
  },
  feesType: {},
  installment: {}

});

module.exports = FeesModel;