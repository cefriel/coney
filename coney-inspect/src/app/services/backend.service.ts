import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class BackendService {

  url = environment.baseUrl + "/coney-api";

  constructor(private http: HttpClient) { 
  }

  getRequest(endpoint: string) {
    return this.http.get(this.url + endpoint, {responseType: 'text'});
  }

  postRequest(endpoint: string, json: JSON): Observable<JSON> {
    return this.http.post<JSON>(this.url + endpoint, json);
  }

  deleteObject(endpoint: string) {
    return this.http.delete(this.url + endpoint);
  }

}
