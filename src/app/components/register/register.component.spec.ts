import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(waitForAsync(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    TestBed.configureTestingModule({
      imports: [
        RegisterComponent,
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when fields are empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should have valid form when fields are correctly filled', () => {
    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('Password123!');
    expect(component.registerForm.valid).toBeTruthy();
  });

  it('should display error message when form is invalid and submitted', () => {
    component.register();
    expect(component.errorMessage).toBe('Please check your form');
  });

  it('should set errorMessage on registration failure', () => {
    const errorResponse = { error: { message: 'Registration failed' } };
    authService.register.and.returnValue(throwError(() => errorResponse));

    component.registerForm.controls['email'].setValue('test@example.com');
    component.registerForm.controls['password'].setValue('Password123!');
    component.register();

    expect(authService.register).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(component.errorMessage).toBe('Registration failed');
  });
});
