import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SchoolService {
  url = `${environment.API_URL}/v1/school`;
  constructor(private http: HttpClient) { }
  getSchoolNameLogo() {
    return this.http.get<any>(`${this.url}/name-logo`);
  }
  addSchool(schoolData: any) {
    return this.http.post(this.url, schoolData);
  }
  getSchool() {
    return this.http.get<any>(this.url);
  }
  updateSchool(schoolData: any) {
    return this.http.put(`${this.url}/${schoolData._id}`, schoolData);
  }
  deleteSchool(id: String) {
    return this.http.delete(`${this.url}/${id}`);
  }
}
