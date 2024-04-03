'use strict';
const FeesCollectionModel = require('../models/fees-collection');
const FeesStructureModel = require('../models/fees-structure');
const StudentModel = require('../models/student');
const { DateTime } = require('luxon');

let GetSingleStudentFeesCollectionById = async (req, res, next) => {
    let studentId = req.params.studentId;

    try {
        const student = await StudentModel.find({ _id: studentId }, '_id session admissionNo name rollNumber class fatherName motherName dob');
        if (!student) {
            return res.status(404).json('Student not found !')
        }
        const studentFeesCollection = await FeesCollectionModel.findOne({ studentId: studentId });
        return res.status(200).json({ studentInfo: student, studentFeesCollection: studentFeesCollection });
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let GetAllStudentFeesCollectionByClass = async (req, res, next) => {
    let className = req.params.class;
    try {
        const student = await StudentModel.find({ class: className }, '_id session admissionNo name rollNumber class fatherName dob');
        if (!student) {
            return res.status(404).json('Student not found !')
        }
        const studentFeesCollection = await FeesCollectionModel.find({ class: className });
        if (!studentFeesCollection) {
            return res.status(404).json('Student fees collection not found !')
        }
        return res.status(200).json({ studentFeesCollection: studentFeesCollection, studentInfo: student });
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateFeesCollection = async (req, res, next) => {
    let className = req.body.class;
    let { studentId, feesInstallment, feesAmount,createdBy } = req.body;
    let receiptNo = Math.floor(Math.random() * 899999 + 100000);
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd-MM-yyyy hh:mm:ss a');
    try {

        const checkFeesStructure = await FeesStructureModel.findOne({ class: className });
        if (!checkFeesStructure) {
            return res.status(404).json(`Class ${className} fees structure not found !`);
        }
        const checkFeesCollection = await FeesCollectionModel.findOne({ studentId: studentId, class: className });
        if (!checkFeesCollection) {
            return res.status(404).json(`Fees record not found !`);
        }

        const feesStructureInstallment = checkFeesStructure.installment.find(item => Object.keys(item)[0] === feesInstallment);
        const paidFeesInstallment = checkFeesCollection.installment.find(item => Object.keys(item)[0] === feesInstallment);
        if (feesStructureInstallment[feesInstallment] === paidFeesInstallment[feesInstallment]) {
            return res.status(400).json(`${feesInstallment} fees installment already paid !`);
        }
        const id = checkFeesCollection._id;
        const totalFees = checkFeesCollection.totalFees;
        const installments = checkFeesCollection.installment;
        const admissionFees = checkFeesCollection.admissionFees;
        const totalInstallment = installments.reduce((acc, installment) => {
            const value = Object.values(installment)[0];
            return acc + value;
        }, 0);
        const paidFees = totalInstallment + feesAmount + admissionFees;
        const dueFees = totalFees - paidFees;
        if (totalFees < paidFees) {
            return res.status(400).json(`All fees installment already paid !`);
        }
        const installment = {
            class: className,
            receiptNo: receiptNo,
            studentId: studentId,
            totalFees: totalFees,
            paidFees: paidFees,
            dueFees: dueFees,
            feesInstallment: feesInstallment,
            feesAmount: feesAmount,
            paymentDate: istDateTimeString,
            createdBy:createdBy
        }
        const updatedDocument = await FeesCollectionModel.findOneAndUpdate(
            { _id: id, 'installment': { $elemMatch: { [feesInstallment]: { $exists: true } } }, 'receipt': { $elemMatch: { [feesInstallment]: { $exists: true } } }, 'paymentDate': { $elemMatch: { [feesInstallment]: { $exists: true } } },'createdBy': { $elemMatch: { [feesInstallment]: { $exists: true } } } },
            { $set: { [`installment.$.${feesInstallment}`]: feesAmount, [`receipt.$.${feesInstallment}`]: receiptNo, [`paymentDate.$.${feesInstallment}`]: istDateTimeString,[`createdBy.$.${feesInstallment}`]: createdBy, paidFees: paidFees, dueFees: dueFees } },
            { new: true }
        );
        if (updatedDocument) {
            return res.status(200).json(installment);
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateAdmissionFeesCollection = async (req, res, next) => {
    let className = req.body.class;
    let { studentId, feesInstallment, feesAmount } = req.body;
    let receiptNo = Math.floor(Math.random() * 899999 + 100000);
    const currentDateIst = DateTime.now().setZone('Asia/Kolkata');
    const istDateTimeString = currentDateIst.toFormat('dd-MM-yyyy hh:mm:ss a');
    try {

        const checkFeesStructure = await FeesStructureModel.findOne({ class: className });
        if (!checkFeesStructure) {
            return res.status(404).json(`Class ${className} fees structure not found !`);
        }
        const checkFeesCollection = await FeesCollectionModel.findOne({ studentId: studentId, class: className });
        if (!checkFeesCollection) {
            return res.status(404).json(`Fees record not found !`);
        }


        if (checkFeesCollection.admissionFees > 0) {
            return res.status(400).json(`Admission fees already paid !`);
        }
        const id = checkFeesCollection._id;
        const totalFees = checkFeesCollection.totalFees;
        const paidFees = feesAmount;
        const dueFees = totalFees - paidFees;
        const admissionFeesData = {
            studentId: studentId,
            class: className,
            admissionFees: feesAmount,
            totalFees: totalFees,
            paidFees: paidFees,
            dueFees: dueFees,
            admissionFeesReceiptNo: receiptNo,
            admissionFeesPaymentDate: istDateTimeString
        }
        const updatedDocument = await FeesCollectionModel.findOneAndUpdate({_id:id}, { $set: admissionFeesData }, { new: true });
        if (updatedDocument) {
            return res.status(200).json(admissionFeesData);
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    GetAllStudentFeesCollectionByClass,
    GetSingleStudentFeesCollectionById,
    CreateFeesCollection,
    CreateAdmissionFeesCollection

}