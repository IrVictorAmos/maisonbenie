import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaPromptComponent } from './shared/components/pwa-prompt.component';
import { InstallButtonComponent } from './shared/components/install-button.component';
import { PwaDebugComponent } from './shared/components/pwa-debug.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaPromptComponent, InstallButtonComponent, PwaDebugComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('maison_benie_f');
}
