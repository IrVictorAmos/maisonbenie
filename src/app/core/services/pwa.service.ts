import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  updateAvailable = signal(false);
  private deferredPrompt: any = null;
  installPromptAvailable = signal(false);
  isInstalled = signal(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private swUpdate: SwUpdate) {
    if (isPlatformBrowser(this.platformId)) {
      this.checkForUpdates();
      this.setupInstallPrompt();
      this.checkIfInstalled();
      this.registerServiceWorker();
    }
  }

  /**
   * Enregistrer le Service Worker
   */
  private registerServiceWorker(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js', { scope: '/' })
        .then((registration) => {
          console.log('✅ Service Worker enregistré:', registration);
        })
        .catch((error) => {
          console.error('❌ Erreur Service Worker:', error);
        });
    }
  }

  /**
   * Vérifier les mises à jour du service worker
   */
  private checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.set(true);
        }
      });
    }
  }

  /**
   * Appliquer la mise à jour
   */
  applyUpdate(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.swUpdate.isEnabled) {
      this.swUpdate.activateUpdate().then(() => {
        window.location.reload();
      });
    }
  }

  /**
   * Configurer le prompt d'installation PWA
   */
  private setupInstallPrompt(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    window.addEventListener('beforeinstallprompt', (event: any) => {
      console.log('📱 beforeinstallprompt déclenché');
      event.preventDefault();
      this.deferredPrompt = event;
      this.installPromptAvailable.set(true);
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ Application installée');
      this.installPromptAvailable.set(false);
      this.isInstalled.set(true);
      this.deferredPrompt = null;
      localStorage.setItem('pwa_installed', 'true');
    });
  }

  /**
   * Vérifier si l'app est déjà installée
   */
  private checkIfInstalled(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const installed = localStorage.getItem('pwa_installed');
    if (installed) {
      this.isInstalled.set(true);
    }

    // Vérifier aussi le mode standalone
    if (this.isPwaMode()) {
      this.isInstalled.set(true);
      localStorage.setItem('pwa_installed', 'true');
    }
  }

  /**
   * Afficher le prompt d'installation
   */
  installApp(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.deferredPrompt) {
      console.log('🚀 Affichage du prompt d\'installation');
      this.deferredPrompt.prompt();
      
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ Utilisateur a accepté l\'installation');
          this.isInstalled.set(true);
          localStorage.setItem('pwa_installed', 'true');
        } else {
          console.log('❌ Utilisateur a rejeté l\'installation');
        }
        this.deferredPrompt = null;
        this.installPromptAvailable.set(false);
      });
    } else {
      console.warn('⚠️ Prompt d\'installation non disponible');
      this.showManualInstallInstructions();
    }
  }

  /**
   * Afficher les instructions d'installation manuelle
   */
  private showManualInstallInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      instructions = `
📱 Installation sur iOS:
1. Appuyez sur le bouton Partager (carré avec flèche)
2. Sélectionnez "Sur l'écran d'accueil"
3. Appuyez sur "Ajouter"
      `;
    } else if (userAgent.includes('android')) {
      instructions = `
📱 Installation sur Android:
1. Appuyez sur le menu (3 points)
2. Sélectionnez "Installer l'application"
3. Confirmez l'installation
      `;
    } else {
      instructions = `
💻 Installation sur Desktop:
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Confirmez l'installation
      `;
    }

    console.log(instructions);
    alert(instructions);
  }

  /**
   * Vérifier si l'app est en mode PWA
   */
  isPwaMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;

    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  /**
   * Obtenir les informations de débogage
   */
  getDebugInfo(): string {
    if (!isPlatformBrowser(this.platformId)) return 'SSR Mode';

    return `
🔍 Informations PWA:
- Service Worker: ${('serviceWorker' in navigator) ? '✅' : '❌'}
- Manifest: ${document.querySelector('link[rel="manifest"]') ? '✅' : '❌'}
- HTTPS: ${window.location.protocol === 'https:' ? '✅' : '❌ (localhost OK)'}
- Mode PWA: ${this.isPwaMode() ? '✅' : '❌'}
- Installée: ${this.isInstalled() ? '✅' : '❌'}
- Prompt disponible: ${this.installPromptAvailable() ? '✅' : '❌'}
    `;
  }
}
