import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { read, utils, writeFile } from 'xlsx';
import { FeesService } from 'src/app/services/fees.service';
import { MatRadioChange } from '@angular/material/radio';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { SchoolService } from 'src/app/services/school.service';
import { TeacherAuthService } from 'src/app/services/auth/teacher-auth.service';
import { TeacherService } from 'src/app/services/teacher.service';

@Component({
  selector: 'app-teacher-fees-collection',
  templateUrl: './teacher-fees-collection.component.html',
  styleUrls: ['./teacher-fees-collection.component.css']
})
export class TeacherFeesCollectionComponent implements OnInit {

  @ViewChild('receipt') receipt!: ElementRef;
  feesForm: FormGroup;
  showModal: boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  feesInfo: any[] = [1, 2, 3, 4, 5];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;
  cls: any;
  classSubject: any;
  showBulkFeesModal: boolean = false;
  movies: any[] = [];
  selectedValue: number = 0;
  fileChoose: boolean = false;
  existRollnumber: number[] = [];
  clsFeesStructure: any;

  schoolInfo: any;
  studentList: any[] = [];
  singleStudent: any;
  paybleInstallment: any;
  payNow: boolean = false;
  receiptInstallment: any = {};
  receiptMode: boolean = false;
  teacherInfo:any;
  createdBy:String='';
  loader:Boolean=true;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute,private teacherAuthService:TeacherAuthService,private teacherService:TeacherService, private schoolService: SchoolService, private printPdfService: PrintPdfService, private feesService: FeesService, private feesStructureService: FeesStructureService) {
    this.feesForm = this.fb.group({
      class: [''],
      studentId: [''],
      feesAmount: [''],
      feesInstallment: [''],
      createdBy:[''],
    });
  }



  ngOnInit(): void {
    this.getSchool();
    // this.getFees({ page: 1 });
    this.cls = this.activatedRoute.snapshot.paramMap.get('id');
    this.teacherInfo = this.teacherAuthService.getLoggedInTeacherInfo();
    if(this.teacherInfo){
      this.getTeacherById(this.teacherInfo.id)
    }
    this.feesStructureByClass(this.cls);
    this.getAllStudentFeesCollectionByClass(this.cls);
  }
  getTeacherById(id:string){
    this.teacherService.getTeacherById(id).subscribe((res:any)=> {
      if(res){
        this.createdBy = `${res.name} (${res.teacherUserId})`;
      }

    })
  }

  printReceipt() {
    this.printPdfService.printElement(this.receipt.nativeElement);
    this.closeModal();
  }

  getSchool() {
    this.schoolService.getSchool().subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }

  getAllStudentFeesCollectionByClass(cls: any) {
    this.feesService.getAllStudentFeesCollectionByClass(cls).subscribe((res: any) => {
      if (res) {
        let studentFeesCollection = res.studentFeesCollection;
        let studentInfo = res.studentInfo;
        const studentMap: any = new Map(studentInfo.map((student: any) => [student._id, student]));
        const combinedData = studentFeesCollection.map((feeCollection: any) => ({
          ...studentMap.get(feeCollection.studentId),
          ...feeCollection
        }));

        this.studentList = combinedData;
        setTimeout(()=>{
          this.loader = false;
        },1000)
      }
    })
  }

  feesStructureByClass(cls: any) {
    this.feesStructureService.feesStructureByClass(cls).subscribe((res: any) => {
      if (res) {
        this.clsFeesStructure = res;
      }
    })
  }


  closeModal() {
    this.showModal = false;
    this.showBulkFeesModal = false;
    this.updateMode = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.payNow = false;
    this.paybleInstallment = [];
    this.paybleInstallment = [0, 0];
    this.receiptInstallment = {};
    this.receiptMode = false;
    this.getAllStudentFeesCollectionByClass(this.cls)
  }
  feesPay(pay: boolean) {
    if (pay === false) {
      this.payNow = true;
    }
    if (pay === true) {
      this.payNow = false;
    }
  }
  studentFeesPay(student: any) {
    this.singleStudent = student;
    const admissionFees = student.admissionFees;
    const admissionFeesAmount = this.clsFeesStructure.admissionFees;
    const admissionFeesPayable = student.admissionFeesPayable;
    if ("Admission" in this.clsFeesStructure.feesType[0]) {
      this.clsFeesStructure.feesType.shift();
    }
    if (admissionFeesPayable == true) {
      this.clsFeesStructure.feesType = [{ Admission: this.clsFeesStructure.admissionFees }, ...this.clsFeesStructure.feesType];
    }
    
    if (admissionFees == 0 && admissionFeesPayable == true) {
      this.paybleInstallment = [["Admission Fees", admissionFeesAmount]];
    }

    if (admissionFees > 0 && admissionFeesPayable == true || admissionFees == 0 && admissionFeesPayable == false) {
      const installment = this.singleStudent.installment;
      const result = installment.find((installment: any) => {
        const [key, value] = Object.entries(installment)[0];
        return value === 0;
      });
      if (result) {
        const [key, value] = Object.entries(result)[0];
        this.paybleInstallment = this.clsFeesStructure.installment.flatMap((item: any) => Object.entries(item).filter(([keys, values]) => keys === key));
      } else {
        this.paybleInstallment = [0, 0];
      }
    }
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.feesForm.reset();

  }
  updateFeesModel(fees: any) {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = true;
  }
  deleteFeesModel(id: String) {
    this.showModal = true;
    this.updateMode = false;
    this.deleteMode = true;
    this.deleteById = id;
  }


  // getFees($event: any) {
  //   this.page = $event.page
  //   return new Promise((resolve, reject) => {
  //     let params: any = {
  //       filters: {},
  //       page: $event.page,
  //       limit: $event.limit ? $event.limit : this.recordLimit,
  //       class: this.cls
  //     };
  //     this.recordLimit = params.limit;
  //     if (this.filters.searchText) {
  //       params["filters"]["searchText"] = this.filters.searchText.trim();
  //     }

  //     this.feesService.feesPaginationList(params).subscribe((res: any) => {
  //       if (res) {
  //         this.feesInfo = res.feesList;
  //         this.number = params.page;
  //         this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countFees });
  //         return resolve(true);
  //       }
  //     });
  //   });
  // }

  feesAddUpdate() {
    if (this.feesForm.valid) {
      if (this.updateMode) {
        this.feesService.updateFees(this.feesForm.value).subscribe((res: any) => {
          if (res) {
            this.closeModal();
            this.successMsg = res;
          }
        }, err => {
          this.errorCheck = true;
          this.errorMsg = err.error;
        })
      } else {
        this.feesForm.value.class = this.singleStudent.class;
        this.feesForm.value.createdBy = this.createdBy;
        this.feesForm.value.studentId = this.singleStudent.studentId;
        this.feesForm.value.feesInstallment = this.paybleInstallment[0][0];
        this.feesForm.value.feesAmount = this.paybleInstallment[0][1];
        if (this.paybleInstallment[0][0] == "Admission Fees") {
          this.feesService.addAdmissionFees(this.feesForm.value).subscribe((res: any) => {
            if (res) {
              this.receiptMode = true;
              this.receiptInstallment = {
                class: res.className,
                receiptNo: res.admissionFeesReceiptNo,
                studentId: res.studentId,
                totalFees: res.totalFees,
                paidFees: res.paidFees,
                dueFees: res.dueFees,
                feesInstallment: 'Admission Fees',
                feesAmount: res.admissionFees,
                paymentDate: res.admissionFeesPaymentDate
              };
            }
          }, err => {
            this.errorCheck = true;
            this.errorMsg = err.error;
          })
        } else {
          console.log(this.feesForm.value)
          this.feesService.addFees(this.feesForm.value).subscribe((res: any) => {
            if (res) {
              this.receiptMode = true;
              this.receiptInstallment = res;
            }
          }, err => {
            this.errorCheck = true;
            this.errorMsg = err.error;
          })
        }
      }
    }
  }



  handleImport($event: any) {
    this.fileChoose = true;
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const wb = read(event.target.fees);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          this.movies = rows;
        }
      }
      reader.readAsArrayBuffer(file);
    }

  }

  onChange(event: MatRadioChange) {
    this.selectedValue = event.value;
  }
  addBulkFeesModel() {
    this.showBulkFeesModal = true;
  }
  addBulkFees() {
    this.feesService.addBulkFees(this.movies).subscribe((res: any) => {
      if (res) {
        this.successMsg = res;
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error.errMsg;
      this.existRollnumber = err.error.existRollnumber;
    })
  }


}
