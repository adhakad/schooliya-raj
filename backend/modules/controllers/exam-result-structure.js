'use strict';
const ExamResultStructureModel = require('../models/exam-result-structure');
const ExamResultModel = require('../models/exam-result');
const NotificationModel = require('../models/notification');
const classModel = require('../models/class');

let GetSingleClassExamResultStructure = async (req, res, next) => {
    let className = req.params.id;
    try {
        const singleExamResultStructureStr = await ExamResultStructureModel.find({ class: className });
        return res.status(200).json(singleExamResultStructureStr);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}

let GetSingleClassExamResultStructureByStream = async (req, res, next) => {
    let className = req.params.class;
    let stream = req.params.stream;
    let examType = req.params.exam;
    if (stream === "stream") {
        stream = "N/A";
    }
    let streamMsg = `${stream} stream`;
    try {
        const singleExamResultStructureStr = await ExamResultStructureModel.findOne({ class: className, stream: stream, examType: examType });
        if (!singleExamResultStructureStr) {
            if (stream === "N/A") {

                streamMsg = ``;
            }
            return res.status(404).json(`Class ${className} ${streamMsg} ${examType} exam not found !`);
        }
        return res.status(200).json(singleExamResultStructureStr);
    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}

let CreateExamResultStructure = async (req, res, next) => {
    let className = req.body.class;
    let { examType, stream } = req.body;
    let { theoryMaxMarks, theoryPassMarks, practicalMaxMarks, practicalPassMarks, gradeMinMarks, gradeMaxMarks } = req.body.type;
    if (stream === "stream") {
        stream = "N/A";
    }
    try {
        const checkExamExist = await ExamResultStructureModel.findOne({ class: className, examType: examType, stream: stream });
        if (checkExamExist) {
            return res.status(400).json(`This class ${examType} exam structure already exist !`);
        }
        let examResultStructureData = {
            class: className,
            examType: examType,
            stream: stream,
            theoryMaxMarks: theoryMaxMarks,
            theoryPassMarks: theoryPassMarks,
        };
        if (practicalMaxMarks) {
            examResultStructureData.practicalMaxMarks = practicalMaxMarks;
            examResultStructureData.practicalPassMarks = practicalPassMarks;
        }
        if (gradeMaxMarks) {
            examResultStructureData.gradeMinMarks = gradeMinMarks;
            examResultStructureData.gradeMaxMarks = gradeMaxMarks;
        }

        let examResultStructure = await ExamResultStructureModel.create(examResultStructureData);

        return res.status(200).json('Exam result structure structure add successfully.');

    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}

let DeleteResultStructure = async (req, res, next) => {
    try {
        const id = req.params.id;
        const resultStr = await ExamResultStructureModel.findOne({ _id: id });
        const { class: className, stream, examType } = resultStr;
        const deleteResultStructure = await ExamResultStructureModel.findByIdAndRemove(id);
        if (deleteResultStructure) {
            const result = await ExamResultModel.findOne({ class: className, stream: stream, examType: examType });
            if (!result) {
                return res.status(200).json('Exam Result structure delete successfully.');
            }
            const deleteResult = await ExamResultModel.deleteMany({ class: className, stream: stream, examType: examType });
            if (deleteResult) {
                return res.status(200).json('Exam Result structure delete successfully.');
            }
        }
    } catch (error) {
        return res.status(500).json('Internal Server Error !');;
    }
}
let ChangeResultPublishStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const examResultStr = await ExamResultStructureModel.findOne({ _id: id });
        if (!examResultStr) {
            return res.status(200).json('Exam result structure not found !');
        }
        const findResultPublishStatus = await examResultStr.resultPublishStatus;
        const cls = await examResultStr.class;
        const stream = await examResultStr.stream;
        const examType = await examResultStr.examType;

        const isExamResultExist = await ExamResultModel.findOne({ class: cls, stream: stream, examType: examType });
        if(!isExamResultExist && findResultPublishStatus==false){
            return res.status(404).json('Exam result not found !');
        }
        let title='';
        let message ='';
        if (findResultPublishStatus == false) {
            let className;
            if(cls==1){
                className = `${cls}st`
            }
            if(cls==2){
                className = `${cls}nd`
            }
            if(cls==3){
                className = `${cls}rd`
            }
            if(cls >= 4 && cls <= 12){
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
            title = `Class ${className} ${examType} exam results announcement : Check Online and Download Your Results`;
            message = `All class ${className} students are informed that the online results for their ${examType} exams are being announced. You can check your results by visiting the school's website and download them online using the credentials provided by your school. We wish you the best of luck in achieving good results.`
        }
        const { resultPublishStatus } = req.body;
        const resultPublishData = {
            resultPublishStatus: resultPublishStatus
        }
        const updateStatus = await ExamResultStructureModel.findByIdAndUpdate(id, { $set: resultPublishData }, { new: true });
        if (updateStatus) {
            const notification = await NotificationModel.findOne({ class: cls, title: title });
            if (!notification && title!=='') {
                const notificationData = {
                    title: title,
                    message: message,
                    role: 'Student',
                    class: cls,
                    date: Date.now(),
                }
                let createNotification = await NotificationModel.create(notificationData);
                if (createNotification) {
                    return res.status(200).json('Exam result publish status update successfully.');
                }
            }
            return res.status(200).json('Exam result publish status update successfully.');
        }

    } catch (error) {
        return res.status(500).json('Internal Server Error !');
    }
}

module.exports = {
    GetSingleClassExamResultStructure,
    GetSingleClassExamResultStructureByStream,
    CreateExamResultStructure,
    ChangeResultPublishStatus,
    DeleteResultStructure

}