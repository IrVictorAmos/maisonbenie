import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { PwaService } from '../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-debug',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Bouton de débogage (visible en développement) -->
    <button
      *ngIf="isDevelopment()"
      (click)="toggleDebugInfo()"
      class="fixed top-4 left-4 p-2 rounded-lg text-xs font-mono z-40 transition-all"
      style="background-color: #2D2D2D; color: #5EEAD4; border: 1px solid #3A3A3A;"
      title="PWA Debug Info"
    >
      🔍 PWA
    </button>

    <!-- Panneau de débogage -->
    <div
      *ngIf="showDebugInfo"
      class="fixed top-16 left-4 p-4 rounded-lg text-xs font-mono z-40 max-w-sm overflow-auto max-h-96"
      style="background-color: #1E1E1E; color: #5EEAD4; border: 1px solid #3A3A3A; white-space: pre-wrap; word-break: break-word;"
    >
      {{ pwaService.getDebugInfo() }}
      
      <div class="mt-4 space-y-2">
        <button
          (click)="testServiceWorker()"
          class="block w-full py-1 px-2 rounded text-center transition-all"
          style="background-color: #2D2D2D; color: #5EEAD4; border: 1px solid #3A3A3A;"
        >
          Test SW
        </button>
        <button
          (click)="clearCache()"
          class="block w-full py-1 px-2 rounded text-center transition-all"
          style="background-color: #2D2D2D; color: #EF5350; border: 1px solid #3A3A3A;"
        >
          Clear Cache
        </button>
      </div>
    </div>
  `
})
export class PwaDebugComponent implements OnInit {
  showDebugInfo = false;
  private platformId = inject(PLATFORM_ID);

  constructor(public pwaService: PwaService) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      console.log(this.pwaService.getDebugInfo());
    }
  }

  /**
   * Vérifier si on est en développement
   */
  isDevelopment(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !window.location.hostname.includes('prod');
  }

  /**
   * Basculer l'affichage des infos de débogage
   */
  toggleDebugInfo(): void {
    this.showDebugInfo = !this.showDebugInfo;
  }

  /**
   * Tester le Service Worker
   */
  testServiceWorker(): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        console.log('Service Workers enregistrés:', registrations);
        alert(`${registrations.length} Service Worker(s) trouvé(s)`);
      });
    }
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    if ('caches' in window) {
      caches.keys().then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.delete(cacheName);
        });
        alert(`${cacheNames.length} cache(s) supprimé(s)`);
        window.location.reload();
      });
    }
  }
}
