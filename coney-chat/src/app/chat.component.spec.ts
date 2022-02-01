import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChatComponent } from './chat.component';

describe('ChatComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ],
      declarations: [
        ChatComponent
      ],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'coney-chat'`, () => {
    const fixture = TestBed.createComponent(ChatComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('coney-chat');
  });

  it('should render title in a h1 tag', () => {
    const fixture = TestBed.createComponent(ChatComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to coney-chat!');
  });
});
