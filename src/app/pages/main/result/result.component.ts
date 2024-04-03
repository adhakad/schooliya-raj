import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ExamResultService } from 'src/app/services/exam-result.service';
import { ClassService } from 'src/app/services/class.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { SchoolService } from 'src/app/services/school.service';


@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {
  @ViewChild('content') content!: ElementRef;
  errorMsg: string = '';
  examResultForm: FormGroup;
  schoolInfo: any;
  classInfo: any;
  studentInfo: any;
  examResultInfo: any;
  resultStructureInfo: any;
  processedData: any[] = [];
  loader: Boolean = false;

  constructor(private fb: FormBuilder, private schoolService: SchoolService, private printPdfService: PrintPdfService, private examResultService: ExamResultService, private classService: ClassService) {
    this.examResultForm = this.fb.group({
      admissionNo: ['72190868', Validators.required],
      class: ['201', Validators.required],
      rollNumber: ['27610208', Validators.required],
    })
  }
  ngOnInit(): void {
    this.getClass();
    this.getSchool();
  }


  printContent() {
    this.printPdfService.printElement(this.content.nativeElement);
  }

  downloadPDF() {
    this.printPdfService.generatePDF(this.content.nativeElement, "Result.pdf");
  }

  getSchool() {
    this.schoolService.getSchool().subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  examResult() {
    this.examResultService.singleStudentExamResult(this.examResultForm.value).subscribe((res: any) => {
      if (res) {
        this.loader =true;
        this.studentInfo = res.studentInfo;
        let examResult = res.examResult;
        this.resultStructureInfo = res.examResultStructure;
        function countSubjectsBelowPassingMarks(passMarks: any, actualMarks: any): number {
          let subjectsBelowPassingMarks: number = 0;
          for (let i = 0; i < passMarks.length; i++) {
            const passMarkSubject = passMarks[i];
            const actualMarkSubject = actualMarks[i];
            const subject = Object.keys(passMarkSubject)[0];
            const passMark = parseInt(passMarkSubject[subject]);
            const actualMark = parseInt(actualMarkSubject[subject]);
            if (actualMark < passMark) {
              subjectsBelowPassingMarks++;
            }
          }
          return subjectsBelowPassingMarks;
        }
        const count = countSubjectsBelowPassingMarks(this.resultStructureInfo.theoryPassMarks, examResult.theoryMarks);
        let resultStatus: string;
        if (count === 0) {
          resultStatus = 'PASS';
        } else if (count <= 2) {
          resultStatus = 'SUPPLY';
        } else {
          resultStatus = 'FAIL';
        }


        let grandTotalMarks = 0;
        let percentileGrade: string = "";
        let percentile: number = 0;
        if (examResult.practicalMarks) {
          this.examResultInfo = {};
          const totalTheoryMaxMarks: number = this.resultStructureInfo.theoryMaxMarks.reduce((total: number, subjectMarks: any) => {
            const subjectName: string = Object.keys(subjectMarks)[0];
            const maxMarksObject: any = this.resultStructureInfo.theoryMaxMarks.find((maxMarks: any) => Object.keys(maxMarks)[0] === subjectName);
            const maxMarks: number = maxMarksObject ? parseFloat(maxMarksObject[subjectName]) : 0;

            return total + maxMarks;
          }, 0);

          const totalPracticalMaxMarks: number = this.resultStructureInfo.practicalMaxMarks.reduce((total: number, subjectMarks: any) => {
            const subjectName: string = Object.keys(subjectMarks)[0];

            const maxMarksObject: any = this.resultStructureInfo.practicalMaxMarks.find((maxMarks: any) => Object.keys(maxMarks)[0] === subjectName);
            const maxMarks: number = maxMarksObject ? parseFloat(maxMarksObject[subjectName]) : 0;

            return total + maxMarks;
          }, 0);

          const totalMaxMarks: number = totalTheoryMaxMarks + totalPracticalMaxMarks;


          this.examResultInfo = {
            class: examResult.class,
            examType: examResult.examType,
            rollNumber: examResult.rollNumber,
            admissionNo: examResult.admissionNo,
            marks: examResult.theoryMarks.map((subjectMarks: any) => {
              const subjectName = Object.keys(subjectMarks)[0];
              const theoryMarks = parseFloat(subjectMarks[subjectName]);
              const practicalMarkObject = examResult.practicalMarks.find((practicalMark: any) => Object.keys(practicalMark)[0] === subjectName);
              const practicalMark = practicalMarkObject ? parseFloat(practicalMarkObject[subjectName]) : 0;
              const totalMarks = theoryMarks + practicalMark;

              const theoryMaxMarks = this.resultStructureInfo.theoryMaxMarks.find((theoryMaxMarks:any) => theoryMaxMarks.hasOwnProperty(subjectName))[subjectName];
              const practicalMaxMarkObject = this.resultStructureInfo.practicalMaxMarks.find((practicalMaxMark: any) => Object.keys(practicalMaxMark)[0] === subjectName);
              const practicalMaxMark = practicalMaxMarkObject ? parseFloat(practicalMaxMarkObject[subjectName]) : 0;
              const totalMaxMark = parseFloat(theoryMaxMarks) + practicalMaxMark;
              const totalGettingMarksPercentile = (totalMarks/totalMaxMark)*100;
              const fixedTotalGettingMarksPercentile =  totalGettingMarksPercentile.toFixed(0)
              let grade = '';
              const gradeMaxMarks = this.resultStructureInfo.gradeMaxMarks;
              const gradeMinMarks = this.resultStructureInfo.gradeMinMarks;
              for (let i = 0; i < gradeMaxMarks.length; i++) {
                const gradeRange: any = Object.values(gradeMaxMarks[i])[0];
                if (fixedTotalGettingMarksPercentile >= gradeMinMarks[i][Object.keys(gradeMinMarks[i])[0]] &&
                  fixedTotalGettingMarksPercentile <= gradeRange) {
                  grade = Object.keys(gradeMaxMarks[i])[0];
                  break;
                }
              }
              return {
                subject: subjectName,
                theoryMarks: theoryMarks,
                practicalMarks: practicalMark,
                totalMarks: totalMarks,
                grade: grade,
              };
            })
          };

          grandTotalMarks = this.examResultInfo.marks.reduce((total: number, item: any) => {
            return total + item.totalMarks;
          }, 0);
          percentile = (grandTotalMarks / totalMaxMarks) * 100;
          percentile = parseFloat(percentile.toFixed(2));
          const basePercentile = parseFloat(percentile.toFixed(0));
          for (let i = 0; i < this.resultStructureInfo.gradeMaxMarks.length; i++) {
            const gradeMax: number = parseFloat(String(Object.values(this.resultStructureInfo.gradeMaxMarks[i])[0]));
            const gradeMin: number = parseFloat(String(Object.values(this.resultStructureInfo.gradeMinMarks[i])[0]));
            if (!isNaN(gradeMax) && !isNaN(gradeMin)) {
              if (basePercentile >= gradeMin && basePercentile <= gradeMax) {
                percentileGrade = Object.keys(this.resultStructureInfo.gradeMaxMarks[i])[0];
                break;
              }
            }
          }

          this.examResultInfo.grandTotalMarks = grandTotalMarks;
          this.examResultInfo.totalMaxMarks = totalMaxMarks;
          this.examResultInfo.percentile = percentile;
          this.examResultInfo.percentileGrade = percentileGrade;
          this.examResultInfo.resultStatus = resultStatus;
        }
        if (!examResult.practicalMarks) {
          this.examResultInfo = {};

          const totalTheoryMaxMarks: number = this.resultStructureInfo.theoryMaxMarks.reduce((total: number, subjectMarks: any) => {
            const subjectName: string = Object.keys(subjectMarks)[0];
            const maxMarksObject: any = this.resultStructureInfo.theoryMaxMarks.find((maxMarks: any) => Object.keys(maxMarks)[0] === subjectName);
            const maxMarks: number = maxMarksObject ? parseFloat(maxMarksObject[subjectName]) : 0;

            return total + maxMarks;
          }, 0);
          const totalPracticalMaxMarks: number = 0;
          const totalMaxMarks: number = totalTheoryMaxMarks + totalPracticalMaxMarks;
          this.examResultInfo = {
            class: examResult.class,
            examType: examResult.examType,
            rollNumber: examResult.rollNumber,
            admissionNo: examResult.admissionNo,
            marks: examResult.theoryMarks.map((subjectMarks: any) => {
              const subjectName = Object.keys(subjectMarks)[0];
              const theoryMarks = parseFloat(subjectMarks[subjectName])
              const practicalMark = 0;
              const totalMarks = theoryMarks + practicalMark;
              let grade = '';
              const gradeMaxMarks = this.resultStructureInfo.gradeMaxMarks;
              const gradeMinMarks = this.resultStructureInfo.gradeMinMarks;
              for (let i = 0; i < gradeMaxMarks.length; i++) {
                const gradeRange: any = Object.values(gradeMaxMarks[i])[0];
                if (totalMarks >= gradeMinMarks[i][Object.keys(gradeMinMarks[i])[0]] &&
                  totalMarks <= gradeRange) {
                  grade = Object.keys(gradeMaxMarks[i])[0];
                  break;
                }
              }
              return {
                subject: subjectName,
                theoryMarks: theoryMarks,
                practicalMarks: practicalMark,
                totalMarks: totalMarks,
                grade: grade,
              };
            })
          };
          grandTotalMarks = this.examResultInfo.marks.reduce((total: number, item: any) => {
            return total + item.totalMarks;
          }, 0);
          percentile = (grandTotalMarks / totalMaxMarks) * 100;
          percentile = parseFloat(percentile.toFixed(2));
          const basePercentile = parseFloat(percentile.toFixed(0));
          for (let i = 0; i < this.resultStructureInfo.gradeMaxMarks.length; i++) {
            const gradeMax: number = parseFloat(String(Object.values(this.resultStructureInfo.gradeMaxMarks[i])[0]));
            const gradeMin: number = parseFloat(String(Object.values(this.resultStructureInfo.gradeMinMarks[i])[0]));
            if (!isNaN(gradeMax) && !isNaN(gradeMin)) {
              if (basePercentile >= gradeMin && basePercentile <= gradeMax) {
                percentileGrade = Object.keys(this.resultStructureInfo.gradeMaxMarks[i])[0];
                break;
              }
            }
          }
          this.examResultInfo.grandTotalMarks = grandTotalMarks;
          this.examResultInfo.totalMaxMarks = totalMaxMarks;
          this.examResultInfo.percentile = percentile;
          this.examResultInfo.percentileGrade = percentileGrade;
          this.examResultInfo.resultStatus = resultStatus;
        }
        setTimeout(() => {
          this.loader = false;
        }, 1500)

      }
    }, err => {
      this.errorMsg = err.error.errorMsg;
    })
  }
}