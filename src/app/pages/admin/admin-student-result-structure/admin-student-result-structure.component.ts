import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ClassSubjectService } from 'src/app/services/class-subject.service';
import { ExamResultStructureService } from 'src/app/services/exam-result-structure.service';


@Component({
  selector: 'app-admin-student-result-structure',
  templateUrl: './admin-student-result-structure.component.html',
  styleUrls: ['./admin-student-result-structure.component.css']
})
export class AdminStudentResultStructureComponent implements OnInit {
  examResultForm: FormGroup;
  disabled = true;
  showModal: boolean = false;
  showExamResultStructureModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  cls: any;
  classSubject: any[] = [];
  examResultStr: any;
  examResultInfo: any;
  processedTheoryData: any[] = [];
  processedPracticalData: any[] = [];
  marksTypeMode: boolean = false;
  marksMode: boolean = false;
  theoryMarks: boolean = false;
  practicalMarks: boolean = false;
  gradeRange: boolean = true;
  stream: string = '';
  notApplicable: String = "stream";
  theoryMaxMarks: any[] = [100,90,85,80,75,70,60,50,40,35,30,25];
  theoryPassMarks: any[] = [33,30,28,27,25,23,20,17,13,12,10,8];
  practicalMaxMarks: any[] = [75,70,65,60,30,25,20,15,10];
  practicalPassMarks: any[] = [25,23,22,20,10,8,7,5,3];
  gradeMinMarks: any = [{ "A": 86 }, { "B": 71 }, { "C": 51 }, { "D": 31 }, { "E": 0 }];
  gradeMaxMarks: any = [{ "A": 100 }, { "B": 85 }, { "C": 70 }, { "D": 50 }, { "E": 30 }];
  examType: any[] = ["quarterly", "half yearly", "final"];
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  loader: Boolean = true;
  isChecked!: Boolean;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute, private classSubjectService: ClassSubjectService, private examResultStructureService: ExamResultStructureService) {
    this.examResultForm = this.fb.group({
      class: [''],
      examType: ['', Validators.required],
      stream: [''],
      type: this.fb.group({
        theoryMaxMarks: this.fb.array([], [Validators.required]),
        theoryPassMarks: this.fb.array([], [Validators.required]),
        practicalMaxMarks: this.fb.array([]),
        practicalPassMarks: this.fb.array([]),
        gradeMinMarks: [''],
        gradeMaxMarks: ['']
      }),
    });
  }

  ngOnInit(): void {
    this.cls = this.activatedRoute.snapshot.paramMap.get('id');
    this.getExamResultStructureByClass(this.cls);
  }

  processData(examResult: any) {
    for (let i = 0; i < examResult.theoryMaxMarks.length; i++) {
      const subject = Object.keys(examResult.theoryMaxMarks[i])[0];
      const theoryMaxMarks = Object.values(examResult.theoryMaxMarks[i])[0];
      const theoryPassMarks = Object.values(examResult.theoryPassMarks[i])[0];
      this.processedTheoryData.push({
        subject,
        theoryMaxMarks,
        theoryPassMarks,
      });
    }
    for (let i = 0; i < examResult.practicalMaxMarks.length; i++) {
      const subject = Object.keys(examResult.practicalMaxMarks[i])[0];
      const practicalMaxMarks = Object.values(examResult.practicalMaxMarks[i])[0];
      const practicalPassMarks = Object.values(examResult.practicalPassMarks[i])[0];
      this.processedPracticalData.push({
        subject,
        practicalMaxMarks,
        practicalPassMarks,
      });
    }
    
  }

  addExamResultModel() {
    this.showModal = true;
    this.marksTypeMode = true;
    this.examResultForm.reset();
  }
  openExamResultStructureModal(examResult: any) {
    this.showExamResultStructureModal = true;
    this.examResultInfo = examResult;
    this.processData(examResult);
  }
  deleteResultStructureModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  falseFormValue() {
    const controlOne = <FormArray>this.examResultForm.get('type.theoryMaxMarks');
    const controlTwo = <FormArray>this.examResultForm.get('type.theoryPassMarks');
    const controlThree = <FormArray>this.examResultForm.get('type.practicalMaxMarks');
    const controlFour = <FormArray>this.examResultForm.get('type.practicalPassMarks');
    controlOne.clear();
    controlTwo.clear();
    controlThree.clear();
    controlFour.clear();
    this.examResultForm.reset();
  }
  falseAllValue() {
    this.falseFormValue();
    this.marksTypeMode = false;
    this.marksMode = false;
    this.practicalMarks = false;
    this.theoryMarks = false;
    this.stream = '';
    this.classSubject = [];
  }
  closeModal() {
    this.falseAllValue();
    this.showModal = false;
    this.errorMsg = '';
    this.deleteMode = false;
    this.deleteById = '';
    this.successMsg = '';
    this.showExamResultStructureModal = false;
    this.examResultInfo;
    this.processedTheoryData = [];
    this.processedPracticalData = [];
    this.examResultForm.reset();
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getExamResultStructureByClass(this.cls)
    }, 1000)
  }
  getExamResultStructureByClass(cls: any) {
    this.examResultStructureService.examResultStructureByClass(cls).subscribe((res: any) => {
      if (res) {
        this.examResultStr = res;
        setTimeout(() => {
          this.loader = false;
        }, 1000);
      }
    })
  }

  chooseStream(stream: any) {
    this.falseFormValue();
    if (stream) {
      this.stream = stream;
      this.theoryMarks = true;
      let params = {
        cls: this.cls,
        stream: stream
      }
      if (this.theoryMarks) {
        this.getSingleClassSubjectByStream(params)
      }
    }
  }

  getSingleClassSubjectByStream(params: any) {
    this.classSubjectService.getSingleClassSubjectByStream(params).subscribe((res: any) => {
      if (res) {
        this.classSubject = res.subject;
        if (this.classSubject) {
          if (this.theoryMarks) {
            this.patchTheoryMarks();
          }
          if (this.practicalMarks) {
            this.patchPracticalMarks();
          }
        }
      }
      if (!res) {
        this.classSubject = [];
        this.theoryMarks = false;
      }
    })
  }

  practical(practicalMarks: boolean) {
    if (practicalMarks === false) {
      this.practicalMarks = true;
    }
    if (practicalMarks === true) {
      this.practicalMarks = false;
    }
  }

  selectExamResultStructure() {
    this.marksTypeMode = false;
    this.marksMode = true;
  }



  patchTheoryMarks() {
    const controlOne = <FormArray>this.examResultForm.get('type.theoryMaxMarks');
    this.classSubject.forEach((x: any) => {
      controlOne.push(this.patchTheoryMaxMarks(x.subject))
      this.examResultForm.reset();
    })

    const controlTwo = <FormArray>this.examResultForm.get('type.theoryPassMarks');
    this.classSubject.forEach((x: any) => {
      controlTwo.push(this.patchTheoryPassMarks(x.subject))
      this.examResultForm.reset();
    })
  }

  patchPracticalMarks() {
    const controlThree = <FormArray>this.examResultForm.get('type.practicalMaxMarks');
    this.classSubject.forEach((x: any) => {
      controlThree.push(this.patchPracticalMaxMarks(x.subject))
      this.examResultForm.reset();
    })
    const controlFour = <FormArray>this.examResultForm.get('type.practicalPassMarks');
    this.classSubject.forEach((x: any) => {
      controlFour.push(this.patchPracticalPassMarks(x.subject))
      this.examResultForm.reset();
    })
  }




  patchTheoryMaxMarks(theoryMaxMarks: any) {
    return this.fb.group({
      [theoryMaxMarks]: [theoryMaxMarks],
    })
  }
  patchTheoryPassMarks(theoryPassMarks: any) {
    return this.fb.group({
      [theoryPassMarks]: [theoryPassMarks],
    })
  }

  patchPracticalMaxMarks(practicalMaxMarks: any) {
    return this.fb.group({
      [practicalMaxMarks]: [practicalMaxMarks],
    })
  }
  patchPracticalPassMarks(practicalPassMarks: any) {
    return this.fb.group({
      [practicalPassMarks]: [practicalPassMarks],
    })
  }

  examResultAddUpdate() {
    this.examResultForm.value.class = this.cls;
    this.examResultForm.value.stream = this.stream;
    if (this.gradeRange) {
      this.examResultForm.value.type.gradeMinMarks = this.gradeMinMarks;
      this.examResultForm.value.type.gradeMaxMarks = this.gradeMaxMarks;
    }
    if (this.practicalMarks) {
      let practicalMaxMarksObj = this.examResultForm.value.type.practicalMaxMarks;
      let practicalPassMarksObj = this.examResultForm.value.type.practicalPassMarks;
      this.examResultForm.value.type.practicalMaxMarks = practicalMaxMarksObj.filter((subject: any) => {
        const value = Object.values(subject)[0];
        return value !== null && value !== undefined;
      });
      this.examResultForm.value.type.practicalPassMarks = practicalPassMarksObj.filter((subject: any) => {
        const value = Object.values(subject)[0];
        return value !== null && value !== undefined;
      });
      let containsPracticalMaxMarksNull = practicalMaxMarksObj.some((item: any) => Object.values(item).includes(null));
      let containsPracticalPassMarksNull = practicalPassMarksObj.some((item: any) => Object.values(item).includes(null));
    }
    if (!this.practicalMarks) {
      delete this.examResultForm.value.type.practicalMaxMarks;
      delete this.examResultForm.value.type.practicalPassMarks;
    }

    let theoryMaxMarksObj = this.examResultForm.value.type.theoryMaxMarks;
    let theoryPassMarksObj = this.examResultForm.value.type.theoryPassMarks;
    let containsTheoryMaxMarksNull = theoryMaxMarksObj.some((item: any) => Object.values(item).includes(null));
    let containsTheoryPassMarksNull = theoryPassMarksObj.some((item: any) => Object.values(item).includes(null));
    if (containsTheoryMaxMarksNull || containsTheoryPassMarksNull) {
      this.errorCheck = true;
      this.errorMsg = 'Please fill all fields';
    }
    if (!containsTheoryMaxMarksNull && !containsTheoryPassMarksNull) {

      this.examResultStructureService.addExamResultStructure(this.examResultForm.value).subscribe((res: any) => {
        if (res) {
          this.successDone();
          this.successMsg = res;
        }
      }, err => {
        this.errorCheck = true;
        this.errorMsg = err.error;
      })
    }

  }

  onToggleChange(id: any, resultPublishStatus: any) {
    let params = {
      id: id,
      resultPublishStatus: resultPublishStatus
    }
    this.examResultStructureService.changeResultPublishStatus(params)
      .subscribe(
        (response: any) => {
        },
        error => {
          this.getExamResultStructureByClass(this.cls);
        }
      );
  }

  resultStructureDelete(id: String) {
    this.examResultStructureService.deleteResultStructure(id).subscribe((res: any) => {
      if (res) {
        this.successDone();
        this.successMsg = res;
        this.deleteById = '';
      }
    })
  }

}
