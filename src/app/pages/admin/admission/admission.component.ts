import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { StudentService } from 'src/app/services/student.service';
import { ClassService } from 'src/app/services/class.service';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { PrintPdfService } from 'src/app/services/print-pdf/print-pdf.service';
import { SchoolService } from 'src/app/services/school.service';


@Component({
  selector: 'app-admission',
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css']
})
export class AdmissionComponent implements OnInit {
  @ViewChild('receipt') receipt!: ElementRef;
  studentForm: FormGroup;
  showModal: boolean = false;
  showAdmissionPrintModal:boolean = false;
  updateMode: boolean = false;
  deleteMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  classInfo: any[] = [];
  studentInfo: any[] = [];
  recordLimit: number = 10;
  filters: any = {};
  number: number = 0;
  paginationValues: Subject<any> = new Subject();
  page: Number = 0;

  sessions: any;
  categorys: any;
  religions: any;
  qualifications: any;
  occupations: any;
  stream: string = '';
  notApplicable: String = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  cls: number = 0;
  rollNumberType: string = '';
  admissionFeesPaymentType: string = '';
  clsFeesStructure: any;
  schoolInfo: any;
  admissionrReceiptInfo: any;
  singleStudentInfo:any;
  receiptMode: boolean = false;
  baseURL!: string;
  loader: Boolean = true;
  constructor(private fb: FormBuilder, private schoolService: SchoolService, private printPdfService: PrintPdfService, private classService: ClassService, private studentService: StudentService, private feesStructureService: FeesStructureService) {
    this.studentForm = this.fb.group({
      _id: [''],
      session: ['', Validators.required],
      admissionNo: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      admissionFees: ['', Validators.required],
      admissionFeesPaymentType: ['', Validators.required],
      rollNumberType: ['', Validators.required],
      rollNumber: ['', [Validators.required, Validators.maxLength(8), Validators.pattern('^[0-9]+$')]],
      class: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      dob: ['', Validators.required],
      aadharNumber: ['', [Validators.required, Validators.pattern('^\\d{12}$')]],
      janAadharNumber: ['', [Validators.required, Validators.pattern('^\\d{10}$')]],
      udiseNumber:['', [ Validators.pattern('^\\d{11}$')]],
      bankAccountNo:['', [ Validators.minLength(9),Validators.maxLength(18), Validators.pattern('^[0-9]+$')]],
      bankIfscCode:['', [Validators.minLength(11),Validators.maxLength(11)]],
      gender: ['', Validators.required],
      category: ['', Validators.required],
      religion: ['', Validators.required],
      nationality: ['', Validators.required],
      contact: ['', [Validators.required, Validators.pattern('^[6789]\\d{9}$')]],
      address: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$'), Validators.maxLength(50)]],
      lastSchool: ['', [Validators.pattern('^[a-zA-Z\\s]+$'), Validators.maxLength(50)]],
      fatherName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      fatherQualification: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      motherName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      motherQualification: ['', Validators.required],
      parentsOccupation: ['', Validators.required],
      parentsContact: ['', [Validators.required, Validators.pattern('^[6789]\\d{9}$')]],
      parentsAnnualIncome: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      createdBy: [''],

    })
  }

  ngOnInit(): void {
    this.getSchool();
    let load: any = this.getStudentsByAdmission({ page: 1 });
    this.getClass();
    this.allOptions();
    if (load) {
      setTimeout(() => {
        this.loader = false;
      }, 1000);
    }
    var currentURL = window.location.href;
    this.baseURL = new URL(currentURL).origin;
  }
  printReceipt() {
    this.printPdfService.printElement(this.receipt.nativeElement);
    this.closeModal();
  }
  printStudentData() {
    const printContent = this.getPrintContent();
    this.printPdfService.printContent(printContent);
    this.closeModal();
  }
  
  private getPrintContent(): string {
    let schoolName = this.schoolInfo.schoolName;
    let city = this.schoolInfo.city;
    let printHtml = '<html>';
    printHtml += '<head>';
    printHtml += '<style>';
    printHtml += 'body { margin: 0; padding: 0; }';
    printHtml += 'div { margin: 0; padding: 0;}';
    printHtml += '.custom-container {font-family: Arial, sans-serif;overflow: auto;}';
    printHtml += '.table-container {background-color: #fff;border: none;}';
    printHtml += '.school-name {display: flex; align-items: center; justify-content: center; text-align: center; }';
    printHtml += '.address{margin-left:130px;margin-top: -65px;}';
    printHtml += '.address p{margin-top: -5px !important;}';
    printHtml += '.logo { height: 100px;margin-right:10px; }';
    printHtml += '.school-name h3 { color: #2e2d6a !important; font-size: 20px !important; margin-left: 15px;margin-top:-65px !important; margin-bottom: 0 !important; }';
    // printHtml += '.info-table {width:100%;color: #2e2d6a !important;border: none;font-size: 12px;letter-spacing: .25px;margin-top: 5vh;margin-bottom: 5vh;display: inline-table;}';
    // printHtml += '.info-table th{border:1px solid #2e2d6a;}';
    // printHtml += '.info-table tr{height:38px;}';
    // printHtml += '.info-table {border:1px solid #2e2d6a;}';
    printHtml += '.table-container .info-table th, .table-container .info-table td{color: #2e2d6a !important;text-align:center}';
    printHtml += '.title-lable {max-height: 45px;text-align: center;margin-bottom: 15px;border:1px solid #2e2d6a;border-radius: 5px;margin-top: 25px;}';
    printHtml += '.title-lable p {color: #2e2d6a !important;font-size: 15px;font-weight: 500;letter-spacing: 1px;}';
    printHtml += '.custom-table {width: 100%;margin-top:30px;color: #2e2d6a !important;border-collapse:collapse;font-size: 12px;letter-spacing: .25px;margin-bottom: 20px;display: inline-table;border-radius:5px}';
    printHtml += '.custom-table th{border:1px solid #2e2d6a;}';
    printHtml += '.custom-table tr{height:35px;}';
    printHtml += '.custom-table td {padding-left:25px;border:1px solid #2e2d6a;}';
    printHtml += '.text-bold { font-weight: bold;}';
    printHtml += 'p {color: #2e2d6a !important;font-size:12px;}'
    printHtml += 'h4 {color: #2e2d6a !important;}'
    printHtml += '@media print {';
    printHtml += '  body::before {';
    printHtml += `    content: "${schoolName}, ${city}";`;
    printHtml += '    position: fixed;';
    printHtml += '    top: 45%;';
    printHtml += '    left:10%;';
    printHtml += '    font-size: 20px;';
    printHtml += '    font-weight: bold;';
    printHtml += '    font-family: Arial, sans-serif;';
    printHtml += '    color: rgba(0, 0, 0, 0.08);';
    printHtml += '    pointer-events: none;';
    printHtml += '  }';
    printHtml += '}';
    printHtml += '</style>';
    printHtml += '</head>';
    printHtml += '<body>';
      const studentElement = document.getElementById(`student`);
      if (studentElement) {
        printHtml += studentElement.outerHTML;
      }
    printHtml += '</body></html>';
    return printHtml;
  }

  getSchool() {
    this.schoolService.getSchool().subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  addPrintModal(student:any){
    this.singleStudentInfo = student;
    this.showAdmissionPrintModal = true;
  }
  chooseClass(event: any) {
    this.errorCheck = false;
    this.errorMsg = '';
    this.cls = 0;
    this.clsFeesStructure = {};
    if (event) {
      if (this.stream) {
        this.studentForm.get('stream')?.setValue(null);
      }
      this.cls = event.value;
      if (this.cls) {
        this.studentForm.get('admissionFees')?.setValue(null);
        const cls = this.cls;
        this.feesStructureByClass(cls);
      }
    }
  }
  chooseStream(event: any) {
    this.stream = event.value;
  }
  feesStructureByClass(cls: any) {
    this.feesStructureService.feesStructureByClass(cls).subscribe((res: any) => {
      if (res) {
        res.feesType = [{ Admission: res.admissionFees }, ...res.feesType];
        this.clsFeesStructure = res;
      }
    }, err => {
      this.errorCheck = true;
      this.errorMsg = err.error;
    })
  }

  chooseAdmissionFeesPayment(event: any) {
    if (event) {
      if (event.value == 'Immediate') {
        this.admissionFeesPaymentType = event.value;
        if (this.clsFeesStructure) {
          const admissionFees = this.clsFeesStructure.admissionFees;
          this.studentForm.get('admissionFees')?.setValue(admissionFees);
        }
      }
      if (event.value == 'Later') {
        this.admissionFeesPaymentType = event.value;
        const admissionFees = 0;
        this.studentForm.get('admissionFees')?.setValue(admissionFees);
      }
    }
  }
  chooseRollNumberType(event: any) {
    if (event) {
      if (event.value == 'generate') {
        this.rollNumberType = event.value;
        const rollNumber = Math.floor(Math.random() * 89999999 + 10000000);
        this.studentForm.get('rollNumber')?.setValue(rollNumber);

      }
      if (event.value == 'manualFill') {
        this.rollNumberType = event.value;
        this.studentForm.get('rollNumber')?.setValue(null);
      }
    }
  }

  date(e: any) {
    var convertDate = new Date(e.target.value).toISOString().substring(0, 10);
    this.studentForm.get('dob')?.setValue(convertDate, {
      onlyself: true,
    });
  }

  closeModal() {
    this.showModal = false;
    this.showAdmissionPrintModal = false;
    this.updateMode = false;
    this.deleteMode = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.stream = '';
    this.cls = 0;
    this.rollNumberType = '';
    this.receiptMode = false;
    this.admissionrReceiptInfo=null;
    this.studentForm.reset();
  }
  addStudentModel() {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = false;
    this.studentForm.reset();
    const admissionNo = Math.floor(Math.random() * 89999999 + 10000000);
    this.studentForm.get('admissionNo')?.setValue(admissionNo);
  }
  updateStudentModel(student: any) {
    this.showModal = true;
    this.deleteMode = false;
    this.updateMode = true;
    this.studentForm.patchValue(student);
  }
  deleteStudentModel(id: String) {
    this.showModal = true;
    this.updateMode = false;
    this.deleteMode = true;
    this.deleteById = id;
  }

  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getStudentsByAdmission({ page: this.page });
    }, 1000)
  }

  getStudentsByAdmission($event: any) {
    this.page = $event.page
    return new Promise((resolve, reject) => {
      let params: any = {
        filters: {},
        page: $event.page,
        limit: $event.limit ? $event.limit : this.recordLimit
      };
      this.recordLimit = params.limit;
      if (this.filters.searchText) {
        params["filters"]["searchText"] = this.filters.searchText.trim();
      }

      this.studentService.studentPaginationByAdmission(params).subscribe((res: any) => {
        if (res) {
          this.studentInfo = res.studentList;
          this.number = params.page;
          this.paginationValues.next({ type: 'page-init', page: params.page, totalTableRecords: res.countStudent });
          return resolve(true);
        }
      });
    });
  }

  studentAddUpdate() {
    if (this.studentForm.valid) {
      this.studentForm.value.admissionType = 'New';
      this.studentForm.value.createdBy = 'Admin';
      this.studentService.addStudent(this.studentForm.value).subscribe((res: any) => {
        if (res) {
          if (res.studentAdmissionData.admissionType == "New" && res.studentAdmissionData.admissionFeesPaymentType == 'Immediate') {
            this.receiptMode = true;
            this.admissionrReceiptInfo = res.studentAdmissionData;
          }
          if (res.studentAdmissionData.admissionType == "New" && res.studentAdmissionData.admissionFeesPaymentType == 'Later') {
            this.successDone();
            this.successMsg = res.successMsg;
          }
        }
      }, err => {
        this.errorCheck = true;
        this.errorMsg = err.error;
      })
    }
  }

  allOptions() {
    this.sessions = [{ year: '2023-24' }, { year: '2024-25' }, { year: '2025-26' }, { year: '2026-27' }, { year: '2027-28' }, { year: '2028-29' }, { year: '2029-30' }]
    this.categorys = [{ category: 'General' }, { category: 'OBC' }, { category: 'SC' }, { category: 'ST' }, { category: 'Other' }]
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' },{ religion: 'Muslim' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
  }
}
