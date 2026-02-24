import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { AlertController } from '@ionic/angular/standalone';
import { Browser } from '@capacitor/browser';

export interface AppVersion {
  version: string;
  versionCode: number;
  downloadUrl: string;
  forceUpdate: boolean;
  releaseNotes: string[];
}

export interface VersionResponse {
  success: boolean;
  data: AppVersion;
}

@Injectable({
  providedIn: 'root',
})
export class VersionCheckService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private alertController: AlertController,
  ) {}

  /**
   * Verificar si hay una nueva versión disponible
   */
  async checkForUpdates(): Promise<void> {
    // Solo verificar en plataforma nativa (móvil)
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // Obtener versión actual de la app instalada
      const appInfo = await App.getInfo();
      const currentVersion = appInfo.version;
      const currentVersionCode = parseInt(appInfo.build);

      console.log(
        'Versión actual instalada:',
        currentVersion,
        'Build:',
        currentVersionCode,
      );

      // Obtener versión disponible en el servidor
      this.getLatestVersion().subscribe({
        next: async (response) => {
          if (response.success && response.data) {
            const latestVersion = response.data;

            console.log(
              'Versión disponible:',
              latestVersion.version,
              'Build:',
              latestVersion.versionCode,
            );

            // Comparar versiones (por versionCode es más confiable)
            if (latestVersion.versionCode > currentVersionCode) {
              await this.showUpdateAlert(latestVersion, currentVersion);
            } else {
              console.log('App actualizada a la última versión');
            }
          }
        },
        error: (error) => {
          console.error('Error al verificar actualizaciones:', error);
        },
      });
    } catch (error) {
      console.error('Error obteniendo info de la app:', error);
    }
  }

  /**
   * Obtener la versión más reciente del servidor
   */
  private getLatestVersion(): Observable<VersionResponse> {
    return this.http.get<VersionResponse>(`${this.apiUrl}/app/version`).pipe(
      catchError((error) => {
        console.error('Error en getLatestVersion:', error);
        return of({ success: false, data: null as any });
      }),
    );
  }

  /**
   * Mostrar alerta de actualización disponible
   */
  private async showUpdateAlert(
    latestVersion: AppVersion,
    currentVersion: string,
  ): Promise<void> {
    // Crear mensaje con formato simple
    const novedades = latestVersion.releaseNotes
      .map((note) => `• ${note}`)
      .join('\n');

    const alert = await this.alertController.create({
      header: '🎉 Nueva versión disponible',
      subHeader: `Versión ${latestVersion.version} (actual: ${currentVersion})`,
      message: `Novedades:\n\n${novedades}`,
      cssClass: 'update-alert',
      backdropDismiss: !latestVersion.forceUpdate,
      buttons: [
        {
          text: latestVersion.forceUpdate ? 'Actualizar ahora' : 'Más tarde',
          role: latestVersion.forceUpdate ? undefined : 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Descargar',
          cssClass: 'primary',
          handler: async () => {
            // Abrir URL de descarga en el navegador
            await Browser.open({
              url: latestVersion.downloadUrl,
              presentationStyle: 'popover',
            });
          },
        },
      ],
    });

    await alert.present();

    // Si es actualización forzada, no permitir cerrar el diálogo
    if (latestVersion.forceUpdate) {
      alert.onDidDismiss().then(() => {
        // Volver a mostrar si intenta cerrar
        this.showUpdateAlert(latestVersion, currentVersion);
      });
    }
  }
}
