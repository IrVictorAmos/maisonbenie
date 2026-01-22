import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-install-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Bouton d'installation flottant sur mobile -->
    <button
      *ngIf="showInstallButton() && isMobile()"
      (click)="openInstallModal()"
      class="fixed bottom-6 right-6 p-4 rounded-full shadow-lg z-40 animate-bounce-slow transition-all hover:scale-110 active:scale-95"
      style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%); color: white; box-shadow: 0 8px 24px rgba(94, 234, 212, 0.3);"
      title="Installer l'application"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
      </svg>
    </button>

    <!-- Modal d'installation -->
    <div
      *ngIf="showInstallModal() && isMobile()"
      class="fixed inset-0 z-50 flex items-end"
      style="background-color: rgba(0, 0, 0, 0.5);"
      (click)="closeInstallModal()"
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

          <!-- Texte -->
          <h2 class="text-2xl font-bold mb-2" style="color: #E0E0E0;">Installer Maison Bénie</h2>
          <p class="text-sm mb-2" style="color: #A3A3A3;">
            Accédez à l'application directement depuis votre écran d'accueil
          </p>
          <p class="text-xs" style="color: #6B6B6B;">
            Pas besoin de passer par le navigateur à chaque fois
          </p>
        </div>

        <!-- Avantages -->
        <div class="space-y-3 mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #5EEAD4;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-sm" style="color: #E0E0E0;">Accès rapide depuis l'écran d'accueil</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #5EEAD4;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-sm" style="color: #E0E0E0;">Fonctionne hors ligne</span>
          </div>
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #5EEAD4;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span class="text-sm" style="color: #E0E0E0;">Mises à jour automatiques</span>
          </div>
        </div>

        <!-- Boutons -->
        <div class="flex gap-3">
          <button
            (click)="closeInstallModal()"
            class="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all"
            style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid #3A3A3A; color: #E0E0E0;"
          >
            Plus tard
          </button>
          <button
            (click)="installApp()"
            class="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%); color: white;"
          >
            Installer maintenant
          </button>
        </div>

        <!-- Texte d'aide -->
        <p class="text-xs text-center mt-4" style="color: #6B6B6B;">
          Vous pourrez toujours désinstaller depuis les paramètres de votre appareil
        </p>
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

    @keyframes bounceSlow {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-8px);
      }
    }

    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }

    .animate-bounce-slow {
      animation: bounceSlow 2s infinite;
    }
  `]
})
export class InstallButtonComponent implements OnInit {
  showInstallButton = signal(true);
  showInstallModal = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Vérifier si l'utilisateur a déjà rejeté l'installation
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      this.showInstallButton.set(false);
    }
  }

  /**
   * Vérifier si on est sur mobile
   */
  isMobile(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return window.innerWidth < 768;
  }

  /**
   * Ouvrir le modal d'installation
   */
  openInstallModal(): void {
    this.showInstallModal.set(true);
  }

  /**
   * Fermer le modal d'installation
   */
  closeInstallModal(): void {
    this.showInstallModal.set(false);
  }

  /**
   * Installer l'application
   */
  installApp(): void {
    this.pwaService.installApp();
    this.closeInstallModal();
    this.showInstallButton.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
  }
}
