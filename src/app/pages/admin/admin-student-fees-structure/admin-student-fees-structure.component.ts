import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { FeesStructureService } from 'src/app/services/fees-structure.service';
import { SchoolService } from 'src/app/services/school.service';

@Component({
  selector: 'app-admin-student-fees-structure',
  templateUrl: './admin-student-fees-structure.component.html',
  styleUrls: ['./admin-student-fees-structure.component.css']
})
export class AdminStudentFeesStructureComponent implements OnInit {
  disabled = true;
  installment: boolean = false;
  monthly: boolean = false;


  cls: any;
  feesForm: FormGroup;
  showModal: boolean = false;
  showFeesStructureModal: boolean = false
  deleteMode: boolean = false;
  updateMode: boolean = false;
  deleteById: String = '';
  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;

  totalFees: number = 0;

  selectedFeesType: any[] = [];
  selectedFeesPayType: any[] = [];
  checkFeesPayType: boolean = false;
  feesTypeMode: boolean = false;
  feesMode: boolean = false;
  clsFeesStructure: any;
  particularsAdmissionFees: any[] = [];
  feePerticulars: any[] = ['Registration', 'Tution', 'Books', 'Uniform', 'Examination','Sports','Library','Transport'];
  schoolInfo: any;
  loader: Boolean = true;
  constructor(private fb: FormBuilder, public activatedRoute: ActivatedRoute,private schoolService: SchoolService, private feesStructureService: FeesStructureService) {
    this.feesForm = this.fb.group({
      admissionFees: ['', Validators.required],
      type: this.fb.group({
        feesType: this.fb.array([], [Validators.required]),
        feesPayType: this.fb.array([], [Validators.required]),
      }),
    });
  }

  ngOnInit(): void {
    this.getSchool();
    this.cls = this.activatedRoute.snapshot.paramMap.get('id');
    this.getFeesStructureByClass(this.cls);
    setTimeout(() => {
      this.loader = false;
    }, 1000);
  }
  getSchool() {
    this.schoolService.getSchool().subscribe((res: any) => {
      if (res) {
        this.schoolInfo = res;
      }
    })
  }
  getFeesStructureByClass(cls: any) {
    this.feesStructureService.feesStructureByClass(cls).subscribe((res: any) => {
      if (res) {
        this.clsFeesStructure = res;
        this.particularsAdmissionFees = [{ Admission: res.admissionFees }, ...res.feesType];
      }
    })
  }
  installmentPayment() {
    this.checkFeesPayType = true;
    this.monthly = false;
    this.installment = true;
    this.selectedFeesPayType = [];
    this.selectedFeesPayType = ['First', 'Second', 'Third'];
  }
  monthlyPayment() {
    this.checkFeesPayType = true;
    this.installment = false;
    this.monthly = true;
    this.selectedFeesPayType = [];
    this.selectedFeesPayType = ['July', 'August', 'September', 'October', 'November', 'December', 'January', 'Fabruary', 'March', 'April'];
  }
  addFeesModel() {
    this.showModal = true;
    this.feesTypeMode = true;
    this.feesForm.reset();
  }
  openFeesStructureModal(){
    this.showFeesStructureModal = true;
  }
  selectFeesStructure() {
    this.feesTypeMode = false;
    this.feesMode = true;
    this.patch();
  }

  falseAllValue() {
    this.installment = false;
    this.monthly = false;

    this.totalFees = 0;
    this.selectedFeesType = [];
    this.selectedFeesPayType = [];
    const controlOne = <FormArray>this.feesForm.get('type.feesType');
    const controlSecond = <FormArray>this.feesForm.get('type.feesPayType');
    controlOne.clear();
    controlSecond.clear();
    this.checkFeesPayType = false;
    this.feesTypeMode = false;
    this.feesMode = false;

  }

  closeModal() {
    this.falseAllValue();
    this.showModal = false;
    this.deleteMode = false;
    this.errorMsg = '';
    this.errorCheck = false
    this.showFeesStructureModal = false;
    this.feesForm.reset();
  }
  deleteFeesStructureModel(id: String) {
    this.showModal = true;
    this.deleteMode = true;
    this.deleteById = id;
  }

  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
      this.getFeesStructureByClass(this.cls);
      console.log(this.cls)
    }, 1000)
  }


  feesType(option: any) {
    const index = this.selectedFeesType.indexOf(option);
    if (index > -1) {
      this.selectedFeesType.splice(index, 1);
    } else {
      this.selectedFeesType.push(option)
    }
  }

  patch() {
    const controlOne = <FormArray>this.feesForm.get('type.feesType');
    this.selectedFeesType.forEach((x: any) => {
      controlOne.push(this.patchFeesTypeValues(x))
      this.feesForm.reset();
    })

    const controlSecond = <FormArray>this.feesForm.get('type.feesPayType');
    this.selectedFeesPayType.forEach((x: any) => {
      controlSecond.push(this.patchFeesPayTypeValues(x))
      this.feesForm.reset();
    })

  }

  patchFeesTypeValues(selectedFeesType: any) {
    return this.fb.group({
      [selectedFeesType]: [selectedFeesType]
    })
  }
  patchFeesPayTypeValues(selectedFeesPayType: any) {
    return this.fb.group({
      [selectedFeesPayType]: [selectedFeesPayType]
    })
  }

  feesStructureAddUpdate() {
    this.feesForm.value.class = this.cls;
    this.feesForm.value.totalFees = this.totalFees;
    let feesTypeObj = this.feesForm.value.type.feesType;
    let feesPayTypeObj = this.feesForm.value.type.feesPayType;
    let containsFeesTypeNull = feesTypeObj.some((item: any) => Object.values(item).includes(null));
    let containsFeesPayTypeNull = feesPayTypeObj.some((item: any) => Object.values(item).includes(null));
    if (containsFeesTypeNull || containsFeesPayTypeNull) {
      this.errorCheck = true;
      this.errorMsg = 'Please fill all fields';
    }
    if (!containsFeesTypeNull && !containsFeesPayTypeNull) {
      this.feesStructureService.addFeesStructure(this.feesForm.value).subscribe((res: any) => {
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
  feesStructureDelete(id: String) {
    this.feesStructureService.deleteFeesStructure(id).subscribe((res: any) => {
      if (res) {
        this.successDone();
        this.getFeesStructureByClass(this.cls);
        this.successMsg = res;
        this.deleteById = '';
      }
    })
  }

}
