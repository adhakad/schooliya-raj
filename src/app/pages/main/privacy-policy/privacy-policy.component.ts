import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/services/school.service';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.css']
})
export class PrivacyPolicyComponent implements OnInit {

  schoolInfo:any;
  loader:Boolean=true;
  constructor(private schoolService:SchoolService) { }

  ngOnInit(): void {
    this.getSchool();
  }
  getSchool(){
    this.schoolService.getSchool().subscribe((res:any)=>{
      if(res){
        this.schoolInfo = res;
        setTimeout(() => {
          this.loader = false;
        }, 1000)
      }
    })
  }

}
