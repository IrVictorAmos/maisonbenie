import { Component, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-install-instructions-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal d'instructions -->
    <div
      *ngIf="showModal()"
      class="fixed inset-0 z-50 flex items-end"
      style="background-color: rgba(0, 0, 0, 0.5);"
      (click)="closeModal()"
    >
      <div
        class="w-full p-6 rounded-t-3xl shadow-2xl animate-slide-up"
        style="background-color: #1E1E1E; border-color: #3A3A3A;"
        (click)="$event.stopPropagation()"
      >
        <!-- Barre de fermeture -->
        <div class="flex justify-center mb-4">
          <div class="w-12 h-1 rounded-full" style="background-color: #3A3A3A;"></div>
        </div>

        <!-- Contenu -->
        <div class="text-center mb-6">
          <!-- Icône -->
          <div class="flex justify-center mb-4">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center"
              style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%);"
            >
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </div>
          </div>

          <!-- Titre -->
          <h2 class="text-2xl font-bold mb-4" style="color: #E0E0E0;">{{ title }}</h2>

          <!-- Instructions -->
          <div
            class="text-left p-4 rounded-lg mb-6 whitespace-pre-wrap text-sm leading-relaxed"
            style="background-color: #2D2D2D; color: #E0E0E0; border-left: 4px solid #5EEAD4;"
          >
            {{ instructions }}
          </div>
        </div>

        <!-- Bouton de fermeture -->
        <button
          (click)="closeModal()"
          class="w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all"
          style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%); color: white;"
        >
          J'ai compris
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
  `]
})
export class InstallInstructionsModalComponent implements OnInit {
  showModal = signal(false);
  title = '';
  instructions = '';
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Écouter l'événement personnalisé du service PWA
    window.addEventListener('pwa-install-instructions', (event: any) => {
      this.title = event.detail.title;
      this.instructions = event.detail.instructions;
      this.showModal.set(true);
    });
  }

  /**
   * Fermer la modal
   */
  closeModal(): void {
    this.showModal.set(false);
  }
}
