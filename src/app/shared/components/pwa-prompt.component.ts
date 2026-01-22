import { Component, OnInit, signal, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Notification de mise à jour -->
    <div
      *ngIf="pwaService.updateAvailable()"
      class="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border z-50 animate-slide-up max-w-sm"
      style="background-color: #1E1E1E; border-color: #3A3A3A; color: #E0E0E0;"
    >
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <p class="font-semibold text-sm">Mise à jour disponible</p>
          <p class="text-xs" style="color: #A3A3A3;">Une nouvelle version est prête à être installée</p>
        </div>
        <button
          (click)="pwaService.applyUpdate()"
          class="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:scale-105 flex-shrink-0"
          style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%); color: white;"
        >
          Mettre à jour
        </button>
      </div>
    </div>

    <!-- Prompt d'installation - Version Desktop -->
    <div
      *ngIf="pwaService.installPromptAvailable() && !isMobile()"
      class="fixed bottom-4 left-4 p-4 rounded-lg shadow-lg border z-50 animate-slide-up max-w-sm"
      style="background-color: #1E1E1E; border-color: #3A3A3A; color: #E0E0E0;"
    >
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <p class="font-semibold text-sm">Installer l'application</p>
          <p class="text-xs" style="color: #A3A3A3;">Accédez à Maison Bénie directement depuis votre écran d'accueil</p>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button
            (click)="dismissInstallPrompt()"
            class="px-3 py-2 rounded-lg font-semibold text-sm transition-all hover:scale-105"
            style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid #3A3A3A; color: #E0E0E0;"
          >
            Plus tard
          </button>
          <button
            (click)="pwaService.installApp()"
            class="px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all hover:scale-105"
            style="background: linear-gradient(135deg, #5EEAD4 0%, #C084FC 100%); color: white;"
          >
            Installer
          </button>
        </div>
      </div>
    </div>

    <!-- Prompt d'installation - Version Mobile (Plus visible) -->
    <div
      *ngIf="pwaService.installPromptAvailable() && isMobile() && showMobilePrompt()"
      class="fixed inset-0 z-50 flex items-end"
      style="background-color: rgba(0, 0, 0, 0.5);"
    >
      <div
        class="w-full p-6 rounded-t-3xl shadow-2xl animate-slide-up"
        style="background-color: #1E1E1E; border-color: #3A3A3A;"
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
            (click)="dismissMobilePrompt()"
            class="flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all"
            style="background-color: rgba(255, 255, 255, 0.05); border: 1px solid #3A3A3A; color: #E0E0E0;"
          >
            Plus tard
          </button>
          <button
            (click)="installAndDismiss()"
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

    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }

    @media (max-width: 640px) {
      .max-w-sm {
        max-width: 100%;
      }
    }
  `]
})
export class PwaPromptComponent implements OnInit {
  showMobilePrompt = signal(true);
  showManualInstallButton = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor(public pwaService: PwaService) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Le service est déjà initialisé
    // Vérifier si l'utilisateur a déjà rejeté le prompt
    const dismissed = localStorage.getItem('pwa_install_dismissed');
    if (dismissed) {
      this.showMobilePrompt.set(false);
    }

    // Afficher le bouton d'installation manuel sur mobile
    if (this.isMobile()) {
      this.showManualInstallButton.set(true);
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
   * Rejeter le prompt mobile
   */
  dismissMobilePrompt(): void {
    this.showMobilePrompt.set(false);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
  }

  /**
   * Rejeter le prompt desktop
   */
  dismissInstallPrompt(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('pwa_install_dismissed', 'true');
    }
  }

  /**
   * Installer et fermer le prompt
   */
  installAndDismiss(): void {
    this.pwaService.installApp();
    this.dismissMobilePrompt();
  }

  /**
   * Afficher le modal d'installation manuel
   */
  showInstallModal(): void {
    this.showMobilePrompt.set(true);
  }
}
