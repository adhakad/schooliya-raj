'use strict';
const StudentModel = require('../models/student');
const StudentUserModel = require('../models/users/student-user');
const FeesCollectionModel = require('../models/fees-collection');
const AdmitCardModel = require('../models/admit-card');
const ExamResultModel = require('../models/exam-result');
const IssuedTransferCertificateModel = require('../models/issued-transfer-certificate');

let countIssuedTransferCertificate = async (req, res, next) => {
    let countStudent = await StudentModel.count();
    return res.status(200).json({ countStudent });
}

let GetIssuedTransferCertificatePagination = async (req, res, next) => {
    let searchText = req.body.filters.searchText;
    
    let searchObj = {};
    if (searchText) {
        searchObj = /^(?:\d*\.\d{1,2}|\d+)$/.test(searchText)
            ? {
                $or: [{ contact: searchText }],
            }
            : { name: new RegExp(`${searchText.toString().trim()}`, 'i') };
    }
    try {
        let limit = (req.body.limit) ? parseInt(req.body.limit) : 10;
        let page = req.body.page || 1;
        const issuedTransferCertificateList = await IssuedTransferCertificateModel.find(searchObj).sort({ _id: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
        const countIssuedTransferCertificate = await IssuedTransferCertificateModel.count();
        let issuedTransferCertificateData = { countIssuedTransferCertificate: 0 };
        issuedTransferCertificateData.issuedTransferCertificateList = issuedTransferCertificateList;
        issuedTransferCertificateData.countIssuedTransferCertificate = countIssuedTransferCertificate;
        return res.json(issuedTransferCertificateData);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let CreateIssuedTransferCertificate = async (req, res, next) => {
    let {serialNo,name, rollNumber, aadharNumber, janAadharNumber,udiseNumber, session, stream, admissionNo, dob,doa, gender, category, religion, nationality, contact, address,bankAccountNo,bankIfscCode, fatherName, fatherQualification, parentsOccupation, parentsContact, parentsAnnualIncome, motherName, motherQualification } = req.body;
    let id = req.body._id;
    let className = req.body.class;
    
    if (stream === "stream") {
        stream = "N/A";
    }

    const studentData = {
        serialNo:serialNo,name, rollNumber, aadharNumber, janAadharNumber,udiseNumber,class:className, session, stream, admissionNo, dob,doa, gender, category, religion, nationality, contact, address,bankAccountNo,bankIfscCode, fatherName, fatherQualification, parentsOccupation, parentsContact, parentsAnnualIncome, motherName, motherQualification,
    }
    try {
        const checkAadharNumber = await IssuedTransferCertificateModel.findOne({ aadharNumber: aadharNumber });
        if (checkAadharNumber) {
            return res.status(400).json(`This aadhar card number holder student TC already issued !`);
        }
        const checkjanAadharNumber = await IssuedTransferCertificateModel.findOne({ janAadharNumber: janAadharNumber });
        if (checkjanAadharNumber) {
            return res.status(400).json(`This samagra id holder student TC already issued !`);
        }
        const checkAdmissionNo = await IssuedTransferCertificateModel.findOne({ admissionNo:admissionNo });
        if (checkAdmissionNo) {
            return res.status(400).json(`This admission number student TC already issued !`);
        }
        if(udiseNumber){
            const checkUdiseNumber = await IssuedTransferCertificateModel.findOne({ udiseNumber: udiseNumber });
        if (checkUdiseNumber) {
            return res.status(400).json(`This udise number holder student TC already issued !`);
        }
        }
        const deleteStudent = await StudentModel.findByIdAndRemove(id);
        if (deleteStudent) {
            const [deleteStudentUser, deleteAdmitCard, deleteExamResult, deleteFeesCollection] = await Promise.all([
                StudentUserModel.deleteOne({ studentId: id }),
                AdmitCardModel.deleteOne({ studentId: id }),
                ExamResultModel.deleteOne({ studentId: id }),
                FeesCollectionModel.deleteOne({ studentId: id }),
            ]);
            if (deleteStudentUser || deleteAdmitCard || deleteExamResult || deleteFeesCollection) {
                let createIssuedTransferCertificate = await IssuedTransferCertificateModel.create(studentData);
                if (createIssuedTransferCertificate) {
                    return res.status(200).json('IssueTransferCertificate');
                }
            }
            let createIssuedTransferCertificate = await IssuedTransferCertificateModel.create(studentData);
            if (createIssuedTransferCertificate) {
                return res.status(200).json('IssueTransferCertificate');
            }
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let DeleteIssuedTransferCertificate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const lastIssuedTC = await IssuedTransferCertificateModel.findOne({}).sort({_id:-1});
        const objectId = lastIssuedTC._id;
        if(id==objectId){
            return res.status(400).json('Last issued transfer certificate detail delete not possible !');
        }
        
        const issuedTransferCertificate = await IssuedTransferCertificateModel.findByIdAndRemove(id);
        return res.status(200).json('Issued transfer certificate detail delete successfully.');
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    // countIssuedTransferCertificate,
    GetIssuedTransferCertificatePagination,
    CreateIssuedTransferCertificate,
    DeleteIssuedTransferCertificate
}