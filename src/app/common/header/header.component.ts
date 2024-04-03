import { Component, OnInit, OnDestroy, } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from "rxjs";
import { AdminAuthService } from "src/app/services/auth/admin-auth.service";
import { TeacherAuthService } from "src/app/services/auth/teacher-auth.service";
import { StudentAuthService } from "src/app/services/auth/student-auth.service";
import { environment } from "src/environments/environment";
import { ClassService } from "src/app/services/class.service";
import { StudentService } from "src/app/services/student.service";
import { CookieService } from "ngx-cookie-service";
import { NotificationService } from "src/app/services/notification.service";


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  showModal: boolean = false;
  studentForm: FormGroup;
  public schoolName = environment.SCHOOL_NAME;
  nav: boolean = false;
  panelOpenState: boolean = false

  token: string = '';
  isAdminAuthenticated = false;
  isTeacherAuthenticated = false;
  isStudentAuthenticated = false;
  private authListenerSubs: Subscription | undefined;

  enteredButton = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  prevButtonTrigger: any;
  modulesList: any;

  notification: any;
  notificationCount: any;
  notificationCookie: any;

  successMsg: String = '';
  errorMsg: String = '';
  errorCheck: Boolean = false;
  classInfo: any[] = [];
  sessions: any;
  categorys: any;
  religions: any;
  qualifications: any;
  occupations: any;
  stream: string = '';
  notApplicable: String = "stream";
  streamMainSubject: any[] = ['Mathematics(Science)', 'Biology(Science)', 'History(Arts)', 'Sociology(Arts)', 'Political Science(Arts)', 'Accountancy(Commerce)', 'Economics(Commerce)', 'Agriculture', 'Home Science'];
  cls: number = 0;

  // ModulesList: any = [{
  //   label: 'User',
  //   children: [{
  //     label: 'User 1',
  //   }, {
  //     label: 'User 2',
  //   }, {
  //     label: 'User 3'
  //   }, {
  //     label: 'User 4'
  //   }]
  // }, {
  //   label: 'Management',
  //   children: [{
  //     label: 'Management 1',
  //   }]
  // }, {
  //   label: 'Admin',
  //   children: [{
  //     label: 'Admin 1'
  //   }, {
  //     label: 'Admin 2'
  //   }, {
  //     label: 'Admin 3'
  //   }, {
  //     label: 'Admin 4'
  //   }]
  // }];


  constructor(private fb: FormBuilder, private notificationService: NotificationService, private cookieService: CookieService, private classService: ClassService, private adminAuthService: AdminAuthService, private teacherAuthService: TeacherAuthService, private studentAuthService: StudentAuthService, private studentService: StudentService,) {
    // this.modulesList = this.ModulesList;
    this.studentForm = this.fb.group({
      _id: [''],
      session: ['', Validators.required],
      class: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      stream: ['', Validators.required],
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]+$')]],
      dob: ['', Validators.required],
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
    })
  }



  ngOnInit() {
    let userDetail = this.studentAuthService.getLoggedInStudentInfo();
    if (userDetail) {
    }

    this.adminAuthService.autoAuthAdmin();
    this.isAdminAuthenticated = this.adminAuthService.getIsAuth();
    this.authListenerSubs = this.adminAuthService
      .getAuthStatusListener()
      .subscribe(isAdminAuthenticated => {
        this.isAdminAuthenticated = isAdminAuthenticated;
      });

    this.teacherAuthService.autoAuthTeacher();
    this.isTeacherAuthenticated = this.teacherAuthService.getIsAuth();
    this.authListenerSubs = this.teacherAuthService
      .getAuthStatusListener()
      .subscribe(isTeacherAuthenticated => {
        this.isTeacherAuthenticated = isTeacherAuthenticated;
      });

    this.studentAuthService.autoAuthStudent();
    this.isStudentAuthenticated = this.studentAuthService.getIsAuth();
    this.authListenerSubs = this.studentAuthService
      .getAuthStatusListener()
      .subscribe(isStudentAuthenticated => {
        this.isStudentAuthenticated = isStudentAuthenticated;
      });

    this.getNotification();
    this.getClass();
    this.allOptions();
  }
  hamburgerMenu(val: boolean) {
    if (val == true) {
      this.nav = true;
    } else if (val == false) {
      this.nav = false;
    }
  }

  // onLogout(user: string) {
  //   if (user === 'admin') {
  //     this.adminAuthService.logout();
  //   } else if (user === 'teacher') {
  //     this.teacherAuthService.logout();
  //   } else {
  //     this.studentAuthService.logout();
  //   }
  // }
  getNotification() {
    this.notificationService.getNotificationList().subscribe((res: any) => {
      if (res) {
        this.notification = res;
        if (this.cookieService.get("_vN")) {
          this.notificationCookie = JSON.parse(this.cookieService.get("_vN"));
          let filterNotification = this.notification.filter(({ _id: id1 }: any) => this.notificationCookie.some(({ _id: id2 }: any) => id2 === id1))
            .map((item: any) => {
              return { "_id": item._id }
            });
          let checkCookie = this.notificationCookie.filter(({ _id: id1 }: any) => !filterNotification.some(({ _id: id2 }: any) => id2 === id1))
          if (checkCookie.length > 0) {
            this.notificationService.storeViewNotification(filterNotification);
          }
          this.notificationCount = this.notification.length - filterNotification?.length;
          return;
        }
        this.notificationCount = this.notification.length;
      }
    })
  }

  viewNotification() {
    if (this.notification) {
      console.log(this.notification);
      let data: any = [];
      if (this.notificationCookie) {
        let filterNotification = this.notification.filter(({ _id: id1 }: any) => !this.notificationCookie.some(({ _id: id2 }: any) => id2 === id1));
        console.log(filterNotification)
        for (let i = 0; i < filterNotification.length; i++) {
          let newNotification = { "_id": filterNotification[i]._id };
          data.push(newNotification, ...this.notificationCookie)
        }
        if (data.length > 0) {
          this.notificationService.storeViewNotification(data)
        }
        return
      }
      data = this.notification.map((item: any) => {
        return { "_id": item._id };
      })
      this.notificationService.storeViewNotification(data)
    }
  }
  closeModal() {
    this.showModal = false;
    this.successMsg = '';
    this.errorMsg = '';
    this.errorCheck = false;
    this.studentForm.reset();
  }
  admissionModel() {
    this.nav = false;
    this.showModal = true;
  }
  chooseClass(event: any) {
    if (event) {
      if (this.stream) {
        this.studentForm.get('stream')?.setValue(null);
      }
      this.cls = event.value;
      if (this.cls) {
        const cls = this.cls;
      }
    }
  }
  getClass() {
    this.classService.getClassList().subscribe((res: any) => {
      if (res) {
        this.classInfo = res;
      }
    })
  }
  chooseStream(event: any) {
    this.stream = event.value;
  }
  allOptions() {
    this.sessions = [{ year: '2023-24' }, { year: '2024-25' }, { year: '2025-26' }, { year: '2026-27' }, { year: '2027-28' }, { year: '2028-29' }, { year: '2029-30' }]
    this.categorys = [{ category: 'General' }, { category: 'OBC' }, { category: 'SC' }, { category: 'ST' }, { category: 'Other' }]
    this.religions = [{ religion: 'Hinduism' }, { religion: 'Buddhism' }, { religion: 'Christanity' }, { religion: 'Jainism' }, { religion: 'Sikhism' }, { religion: 'Muslim' }, { religion: 'Other' }]
    this.qualifications = [{ qualification: 'Doctoral Degree' }, { qualification: 'Masters Degree' }, { qualification: 'Graduate Diploma' }, { qualification: 'Graduate Certificate' }, { qualification: 'Graduate Certificate' }, { qualification: 'Bachelor Degree' }, { qualification: 'Advanced Diploma' }, { qualification: 'Primary School' }, { qualification: 'High School' }, { qualification: 'Higher Secondary School' }, { qualification: 'Illiterate' }, { qualification: 'Other' }]
    this.occupations = [{ occupation: 'Agriculture(Farmer)' }, { occupation: 'Laborer' }, { occupation: 'Self Employed' }, { occupation: 'Private Job' }, { occupation: 'State Govt. Employee' }, { occupation: 'Central Govt. Employee' }, { occupation: 'Military Job' }, { occupation: 'Para-Military Job' }, { occupation: 'PSU Employee' }, { occupation: 'Other' }]
  }
  successDone() {
    setTimeout(() => {
      this.closeModal();
      this.successMsg = '';
    }, 5000)
  }
  studentAddUpdate() {
    if (this.studentForm.valid) {

      this.studentService.addOnlineAdmission(this.studentForm.value).subscribe((res: any) => {
        if (res) {

          if (res) {
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
  ngOnDestroy() {
    this.authListenerSubs?.unsubscribe();
  }

}
