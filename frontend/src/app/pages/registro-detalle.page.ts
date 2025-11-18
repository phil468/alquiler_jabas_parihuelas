import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, Registro } from '../services/api.service';

@Component({
  selector: 'app-registro-detalle',
  templateUrl: './registro-detalle.page.html',
  styleUrls: ['./registro-detalle.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class RegistroDetallePage implements OnInit {
  registro: Registro | null = null;
  loading = true;
  registroId: number = 0;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.registroId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarRegistro();
  }

  async cargarRegistro() {
    this.loading = true;
    try {
      const response = await this.apiService
        .getRegistro(this.registroId)
        .toPromise();
      this.registro = response?.data || null;
    } catch (error) {
      console.error('Error al cargar registro:', error);
      this.mostrarError('No se pudo cargar el registro');
    } finally {
      this.loading = false;
    }
  }

  async aprobar() {
    const alert = await this.alertController.create({
      header: 'Aprobar Registro',
      message: '¿Estás seguro de aprobar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Aprobar',
          handler: async () => {
            try {
              await this.apiService
                .cambiarEstadoRegistro(this.registroId, 'aprobado')
                .toPromise();

              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Registro aprobado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.cargarRegistro();
            } catch (error) {
              this.mostrarError('Error al aprobar el registro');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async rechazar() {
    const alert = await this.alertController.create({
      header: 'Rechazar Registro',
      message:
        'Por favor, indica el motivo del rechazo. Este comentario será visible para el usuario que creó el registro.',
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Ejemplo: Faltan firmas, datos incorrectos, etc.',
          attributes: {
            rows: 4,
            maxlength: 500,
          },
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
        },
        {
          text: 'Rechazar',
          cssClass: 'danger',
          handler: async (data) => {
            if (!data.motivo || data.motivo.trim().length < 10) {
              this.mostrarError('El motivo debe tener al menos 10 caracteres');
              return false;
            }

            try {
              await this.apiService
                .cambiarEstadoRegistro(
                  this.registroId,
                  'rechazado',
                  data.motivo.trim()
                )
                .toPromise();

              const successAlert = await this.alertController.create({
                header: 'Registro Rechazado',
                message: 'El registro ha sido rechazado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.cargarRegistro();
            } catch (error) {
              this.mostrarError('Error al rechazar el registro');
            }
            return true;
          },
        },
      ],
    });

    await alert.present();
  }

  async verImagen() {
    if (this.registro?.imagen_path) {
      // TODO: Implementar modal para ver imagen
      const imageUrl = `${this.apiService['apiUrl'].replace(
        '/api/v1',
        ''
      )}/storage/${this.registro.imagen_path}`;
      window.open(imageUrl, '_blank');
    }
  }

  async descargarPDF() {
    try {
      const blob = await this.apiService
        .generarPdfRegistro(this.registroId)
        .toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Registro_${
          this.registro?.numero_registro || this.registroId
        }.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      this.mostrarError('Error al generar el PDF');
    }
  }

  async adjuntarPDF() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/pdf';

    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.type !== 'application/pdf') {
        this.mostrarError('Únicamente se permiten archivos PDF');
        return;
      }

      // Confirmar adjuntar
      const confirmAlert = await this.alertController.create({
        header: 'Adjuntar Guía de Remisión',
        message: `¿Deseas adjuntar el archivo "${file.name}"? El sistema intentará extraer automáticamente el número y serie de la guía.`,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Adjuntar',
            handler: async () => {
              try {
                const loadingAlert = await this.alertController.create({
                  message: 'Subiendo PDF y extrayendo datos...',
                  backdropDismiss: false,
                });
                await loadingAlert.present();

                await this.apiService
                  .adjuntarPdfRegistro(this.registroId, file)
                  .toPromise();
                await loadingAlert.dismiss();

                const successAlert = await this.alertController.create({
                  header: 'Éxito',
                  message: 'PDF adjuntado y datos extraídos correctamente',
                  buttons: ['OK'],
                });
                await successAlert.present();

                this.cargarRegistro();
              } catch (error) {
                this.mostrarError('Error al adjuntar el PDF');
              }
            },
          },
        ],
      });

      await confirmAlert.present();
    };

    input.click();
  }

  async compartir() {
    // TODO: Implementar compartir
    // this.mostrarError('Función en desarrollo');
  }

  async eliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.apiService.deleteRegistro(this.registroId);

              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Registro eliminado correctamente',
                buttons: ['OK'],
              });
              await successAlert.present();

              this.router.navigate(['/registro-lista']);
            } catch (error) {
              this.mostrarError('Error al eliminar el registro');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  getEstadoColor(estado: string): string {
    switch (estado) {
      case 'por_aprobar':
        return 'medium';
      case 'aprobado':
        return 'success';
      case 'rechazado':
        return 'danger';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'por_aprobar':
        return 'Por Aprobar';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return estado;
    }
  }

  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }

  volver() {
    this.router.navigate(['/registro-lista']);
  }

  getImageUrl(imagePath: string): string {
    return `${this.apiService['apiUrl'].replace(
      '/api/v1',
      ''
    )}/storage/${imagePath}`;
  }
}
