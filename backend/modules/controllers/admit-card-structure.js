'use strict';
const AdmitCardStructureModel = require('../models/admit-card-structure');
const AdmitCardModel = require("../models/admit-card");
const StudentModel = require('../models/student');
const NotificationModel = require('../models/notification');

let GetSingleClassAdmitCardStructure = async (req, res, next) => {
    let className = req.params.id;
    try {
        const singleAdmitCardStr = await AdmitCardStructureModel.find({ class: className });
        if(!singleAdmitCardStr){
            return res.status(404).json('Fees structure not found !');
        }
        return res.status(200).json(singleAdmitCardStr);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}
let CreateAdmitCardStructure = async (req, res, next) => {
    let className = req.body.class;
    let { examType, stream } = req.body;
    let { examDate, startTime, endTime } = req.body.type;
    if (stream === "stream") {
        stream = "N/A";
    }
    let streamMsg = `${stream} stream`;

    try {
        const checkExamExist = await AdmitCardStructureModel.findOne({ class: className, stream: stream });
        if (checkExamExist) {
            if (stream === "N/A") {
                streamMsg = ``;
            }
            let cls;
            if (className == 1) {
                cls = `${className}st`
            }
            if (className == 2) {
                cls = `${className}nd`
            }
            if (cls == 3) {
                cls = `${className}rd`
            }
            if (className >= 4 && className <= 12) {
                cls = `${className}th`
            }
            if(className==200){
                cls = `Nursery`;
            }
            if (className == 201) {
                cls = `LKG`;
            }
            if (className == 202) {
                cls = `UKG`;
            }
            return res.status(400).json(`Class ${cls} ${streamMsg} exam admit card structure already exist !`);
        }
        let admitCardStructureData = {
            class: className,
            examType: examType,
            stream: stream,
            examDate: examDate,
            examStartTime: startTime,
            examEndTime: endTime,
        }
        const studentData = await StudentModel.find({ class: className, stream: stream });
        const checkStudent = await StudentModel.findOne({ class: className, stream: stream });
        if(!checkStudent){
            return res.status(404).json('Student not found , please add students then create admit card structure !')
        }
        let studentAdmitCardData = [];
        for (const student of studentData) {
            studentAdmitCardData.push({
                studentId: student._id,
                class: className,
                stream: stream,
                examType: examType,
            });
        }
        let admitCardStructure = await AdmitCardStructureModel.create(admitCardStructureData);
        let studentAdmitCard = await AdmitCardModel.create(studentAdmitCardData);
        if (admitCardStructure && studentAdmitCard) {
            return res.status(200).json('Admit card structure add successfully.');
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}
let DeleteAdmitCardStructure = async (req, res, next) => {
    try {
        const id = req.params.id;
        const admitCard = await AdmitCardStructureModel.findOne({ _id: id });
        const className = admitCard.class;
        const stream = admitCard.stream;
        const examType = admitCard.examType;
        const deleteAdmitCard = await AdmitCardModel.deleteMany({ class: className, stream: stream, examType: examType });
        const deleteAdmitCardStructure = await AdmitCardStructureModel.findByIdAndRemove(id);
        if (deleteAdmitCard && deleteAdmitCardStructure) {
            return res.status(200).json('Admit card structure delete successfully.');
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

let ChangeAdmitCardPublishStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const admitCardStr = await AdmitCardStructureModel.findOne({ _id: id });
        if (!admitCardStr) {
            return res.status(200).json('Admit card structure not found !');
        }
        const findAdmitCardPublishStatus = await admitCardStr.admitCardPublishStatus;
        const cls = await admitCardStr.class;
        const stream = await admitCardStr.stream;
        const examType = await admitCardStr.examType;
        let title = '';
        let message = '';
        if (findAdmitCardPublishStatus == false) {
            let className;
            if (cls == 1) {
                className = `${cls}st`
            }
            if (cls == 2) {
                className = `${cls}nd`
            }
            if (cls == 3) {
                className = `${cls}rd`
            }
            if (cls >= 4 && cls <= 12) {
                className = `${cls}th`
            }
            if(cls==200){
                className = `Nursery`;
            }
            if (cls == 201) {
                className = `LKG`;
            }
            if (cls == 202) {
                className = `UKG`;
            }
            title = `Class ${className} ${examType} exam online admit cards released - Download Now`;
            message = `All class ${className} students are informed that the online admit cards for your ${examType} exams have been issued on the school's website. You can download them online using the credentials provided by your school. Best of luck for your upcoming exams.`
        }
        const { admitCardPublishStatus } = req.body;
        const admitCardPublishData = {
            admitCardPublishStatus: admitCardPublishStatus
        }
        const updateStatus = await AdmitCardStructureModel.findByIdAndUpdate(id, { $set: admitCardPublishData }, { new: true });
        if (updateStatus) {
            const notification = await NotificationModel.findOne({ class: cls, title: title });
            if (!notification && title !== '') {
                const notificationData = {
                    title: title,
                    message: message,
                    role: 'Student',
                    class: cls,
                    date: Date.now(),
                }
                let createNotification = await NotificationModel.create(notificationData);
                if (createNotification) {
                    return res.status(200).json('Admit card publish status update successfully.');
                }
            }
            return res.status(200).json('Admit card publish status update successfully.');
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    GetSingleClassAdmitCardStructure,
    CreateAdmitCardStructure,
    DeleteAdmitCardStructure,
    ChangeAdmitCardPublishStatus
}