import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment'
import { Params, Router, ActivatedRoute } from '@angular/router';

export class User {
    constructor(
        public status: string,
    ) { }

}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {

    url = environment.baseUrl + "/coney-api";

    constructor(private router: Router, 
        private route: ActivatedRoute, 
        private http: HttpClient) {}

    authenticate(username, password) {
        const headers = new HttpHeaders({ Authorization: username + ':' + password });
        return this.http.post<any>(this.url + '/authenticate', {}, { headers }).pipe(
            map(
                userData => {
                    sessionStorage.setItem('username', username);
                    let tokenStr = 'Bearer ' + userData.token;
                    sessionStorage.setItem('token', tokenStr);
                    return userData;
                }
            )
        );
    }


    isUserLoggedIn() {
        let user = sessionStorage.getItem('username')
        return !(user === null)
    }

    logOut() {
        sessionStorage.removeItem('username')
    }
}