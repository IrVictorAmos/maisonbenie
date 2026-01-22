import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  updateAvailable = signal(false);
  private deferredPrompt: any = null;
  installPromptAvailable = signal(true); // Toujours true pour afficher le bouton
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

    // Essayer d'abord avec le prompt natif
    if (this.deferredPrompt) {
      console.log('🚀 Affichage du prompt d\'installation natif');
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
      // Fallback : utiliser la Web App Install API ou instructions
      console.warn('⚠️ Prompt natif non disponible, utilisation du fallback');
      this.installAppFallback();
    }
  }

  /**
   * Installation fallback (sans prompt natif)
   */
  private installAppFallback(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userAgent = navigator.userAgent.toLowerCase();
    
    // Vérifier si on peut utiliser la Web Share API
    if (navigator.share && navigator.canShare) {
      this.shareInstallInstructions();
    } else {
      // Afficher les instructions selon le navigateur
      this.showPlatformSpecificInstructions(userAgent);
    }
  }

  /**
   * Partager les instructions d'installation
   */
  private shareInstallInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase();
    let title = 'Installer Maison Bénie';
    let text = '';
    let url = window.location.href;

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      text = `Installez Maison Bénie sur votre écran d'accueil:\n1. Appuyez sur Partager\n2. Sélectionnez "Sur l'écran d'accueil"\n3. Appuyez sur "Ajouter"`;
    } else if (userAgent.includes('android')) {
      text = `Installez Maison Bénie:\n1. Appuyez sur le menu (3 points)\n2. Sélectionnez "Installer l'application"\n3. Confirmez`;
    } else {
      text = `Installez Maison Bénie sur votre ordinateur`;
    }

    if (navigator.canShare({ title, text, url })) {
      navigator.share({ title, text, url }).catch((err) => {
        console.log('Partage annulé:', err);
      });
    }
  }

  /**
   * Afficher les instructions spécifiques à la plateforme
   */
  private showPlatformSpecificInstructions(userAgent: string): void {
    let instructions = '';
    let title = 'Installation de Maison Bénie';

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
      instructions = `
📱 Installation sur iOS:

1️⃣ Appuyez sur le bouton Partager
   (carré avec flèche en bas)

2️⃣ Faites défiler et sélectionnez
   "Sur l'écran d'accueil"

3️⃣ Appuyez sur "Ajouter"

4️⃣ Confirmez le nom de l'application

✅ L'app apparaîtra sur votre écran d'accueil!
      `;
    } else if (userAgent.includes('android')) {
      instructions = `
📱 Installation sur Android:

1️⃣ Appuyez sur le menu (3 points)
   en haut à droite

2️⃣ Sélectionnez "Installer l'application"

3️⃣ Confirmez l'installation

✅ L'app s'installera automatiquement!
      `;
    } else {
      instructions = `
💻 Installation sur Desktop:

1️⃣ Cherchez l'icône d'installation
   dans la barre d'adresse

2️⃣ Cliquez dessus

3️⃣ Confirmez l'installation

✅ L'app s'installera sur votre ordinateur!
      `;
    }

    // Afficher dans une modal au lieu d'une alerte
    this.showInstructionsModal(title, instructions);
  }

  /**
   * Afficher une modal avec les instructions
   */
  private showInstructionsModal(title: string, instructions: string): void {
    // Créer un événement personnalisé pour afficher la modal
    const event = new CustomEvent('pwa-install-instructions', {
      detail: { title, instructions }
    });
    window.dispatchEvent(event);
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
- beforeinstallprompt: ${this.deferredPrompt ? '✅' : '❌'}
    `;
  }
}
