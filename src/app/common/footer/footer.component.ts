import { Component, OnInit } from '@angular/core';
import { SchoolService } from 'src/app/services/school.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  public schoolName = environment.SCHOOL_NAME;
  currentYear: any;
  schoolInfo:any;
  facebook!:string;
  linkedin!:string;
  instagram!:string;
  youtube!:string;
  softwareCompanyLink:string='https://schooliya.in';
  constructor(private schoolService:SchoolService) { }

  ngOnInit(): void {
    this.getSchool();
    this.currentYear = (new Date()).getFullYear();
  }
  socialMediaRedirect(link:string){
    const sanitizedLink = encodeURI(link);
    window.location.href = sanitizedLink;
  }
  softwareCompany(link:string){
    const sanitizedLink = encodeURI(link);
    window.location.href = sanitizedLink;
  }
  getSchool(){
    this.schoolService.getSchool().subscribe((res:any)=> {
      if(res){
        this.schoolInfo = res;
        this.facebook = res.facebookLink;
        this.linkedin = res.linkedinLink;
        this.instagram = res.instagramLink;
        this.youtube = res.youtubeLink;
        
      }
    })
  }

}
