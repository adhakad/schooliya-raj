import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/services/school.service';

@Component({
  selector: 'app-terms-conditions',
  templateUrl: './terms-conditions.component.html',
  styleUrls: ['./terms-conditions.component.css']
})
export class TermsConditionsComponent implements OnInit {
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
