import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PwaPromptComponent } from './shared/components/pwa-prompt.component';
import { InstallButtonComponent } from './shared/components/install-button.component';
import { PwaDebugComponent } from './shared/components/pwa-debug.component';
import { InstallInstructionsModalComponent } from './shared/components/install-instructions-modal.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PwaPromptComponent, InstallButtonComponent, PwaDebugComponent, InstallInstructionsModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('maison_benie_f');
}
