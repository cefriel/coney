import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  username = ''
  password = ''
  invalidLogin = false;
  isLogging = false;

  constructor(private router: Router,
    private loginservice: AuthenticationService) { }

  ngOnInit() {
    if(!environment.enterprise){
      this.router.navigate(['']);
    }
  }

  checkLogin() {
    this.invalidLogin = false;
    this.isLogging = true;
    (this.loginservice.authenticate(this.username, this.password).subscribe(
      data => {
        this.isLogging = false;
        this.router.navigate([''])
        this.invalidLogin = false
      },
      error => {
        this.isLogging = false;
        this.invalidLogin = true

      }
    )
    );

  }
}
