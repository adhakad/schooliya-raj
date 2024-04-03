import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from 'src/app/services/auth/admin-auth.service';


@Component({
  selector: 'app-admin-forgot',
  templateUrl: './admin-forgot.component.html',
  styleUrls: ['./admin-forgot.component.css']
})
export class AdminForgotComponent implements OnInit {
  errorMsg: string = '';
  successMsg: String = '';
  varifyForm: FormGroup;
  resetForm: FormGroup;
  formType: String = 'Varify';
  varifiedAdminInfo:any;
  constructor(private fb: FormBuilder, private router: Router,private adminAuthService: AdminAuthService,) { 
    this.varifyForm = this.fb.group({
      productKey: ['', [Validators.required,Validators.maxLength(40)]],
    })
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30),Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(30)]],
      productKey: [''],
    })
  }

  ngOnInit(): void {
  }

  adminVarify() {
    if (this.varifyForm.valid) {
      this.adminAuthService.adminVarify(this.varifyForm.value).subscribe((res: any) => {
        if (res) {
          this.errorMsg = '';
          this.varifiedAdminInfo = res.varifiedAdminInfo;
          this.formType = 'Reset';
        }
      }, err => {
        this.errorMsg = err.error.errorMsg;
      })
    }
  }

  usernamePasswordReset() {
    this.resetForm.value.productKey = this.varifiedAdminInfo.productKey;
    this.adminAuthService.usernamePasswordReset(this.resetForm.value).subscribe((res: any) => {
      if (res) {
        this.errorMsg = '';
        this.formType = 'ResetSuccsess';
        if(this.formType=='ResetSuccsess'){
          this.successMsg = res.successMsg;
        }
      }
    }, err => {
      this.errorMsg = err.error.errorMsg;
    })
  }

}
