import { Token } from '@angular/compiler';
import { Component, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { SignupUserRequest } from 'src/app/models/interfaces/user/SignupUserRequest';
import { AuthRequest } from 'src/app/models/interfaces/user/auth/AuthRequest';
import { UserService } from 'src/app/services/user/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  loginCard = true;

  loginForm = this.formBuilder.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  })

  sigupForm = this.formBuilder.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  })

  constructor(private formBuilder: FormBuilder, private userServicer: UserService, private cookieService: CookieService, private messageService: MessageService, private router: Router) {}

  onSubmitLoginForm(): void {
    if(this.loginForm.value && this.loginForm.valid) {
      this.userServicer.authUser(this.loginForm.value as AuthRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.cookieService.set('USER_INFO', response?.token);
          this.loginForm.reset();
          this.router.navigate(['/dashboard'])
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Bem vindo de volta ${response?.name}!`,
            life: 2000,
          })
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Erro ao fazer login!`,
            life: 2000,
          })
        },
      })
    }

  }

  onSubmitSignupForm(): void {
    if(this.sigupForm.value && this.sigupForm.valid) {
      this.userServicer.signupUser(this.sigupForm.value as SignupUserRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if(response) {
            this.sigupForm.reset();
            this.loginCard = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: `Usuario criado com sucesso!`,
              life: 2000,
            })
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: `Erro ao fazer login!`,
            life: 2000,
          })
        },
      });

    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
