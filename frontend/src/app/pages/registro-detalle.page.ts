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
  imports: [IonicModule, CommonModule]
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
      const response = await this.apiService.getRegistro(this.registroId).toPromise();
      this.registro = response?.data || null;
    } catch (error) {
      console.error('Error al cargar registro:', error);
      this.mostrarError('No se pudo cargar el registro');
    } finally {
      this.loading = false;
    }
  }

  async cambiarEstado() {
    const alert = await this.alertController.create({
      header: 'Cambiar Estado',
      message: '¿Qué acción deseas realizar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprobar',
          handler: () => {
            this.aprobar();
          }
        },
        {
          text: 'Rechazar',
          handler: () => {
            this.rechazar();
          }
        }
      ]
    });

    await alert.present();
  }

  async aprobar() {
    try {
      await this.apiService.cambiarEstadoRegistro(this.registroId, 'aprobado');
      
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Registro aprobado correctamente',
        buttons: ['OK']
      });
      await alert.present();
      
      this.cargarRegistro();
    } catch (error) {
      this.mostrarError('Error al aprobar el registro');
    }
  }

  async rechazar() {
    const alert = await this.alertController.create({
      header: 'Rechazar Registro',
      message: 'Indica el motivo del rechazo:',
      inputs: [
        {
          name: 'motivo',
          type: 'textarea',
          placeholder: 'Motivo del rechazo...'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rechazar',
          handler: async (data) => {
            if (!data.motivo) {
              this.mostrarError('Debes indicar un motivo');
              return false;
            }
            
            try {
              await this.apiService.cambiarEstadoRegistro(this.registroId,
                'rechazado',
                data.motivo
              );
              
              const successAlert = await this.alertController.create({
                header: 'Éxito',
                message: 'Registro rechazado correctamente',
                buttons: ['OK']
              });
              await successAlert.present();
              
              this.cargarRegistro();
            } catch (error) {
              this.mostrarError('Error al rechazar el registro');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  async verImagen() {
    if (this.registro?.imagen_path) {
      // TODO: Implementar modal para ver imagen
      const imageUrl = `${this.apiService['apiUrl'].replace('/api/v1', '')}/storage/${this.registro.imagen_path}`;
      window.open(imageUrl, '_blank');
    }
  }

  async descargarPDF() {
    try {
      const blob = await this.apiService.generarPdfRegistro(this.registroId).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Registro_${this.registro?.numero_registro || this.registroId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      this.mostrarError('Error al generar el PDF');
    }
  }

  async adjuntarPDF() {
    // TODO: Implementar subida de PDF
    this.mostrarError('Función en desarrollo');
  }

  async compartir() {
    // TODO: Implementar compartir
    this.mostrarError('Función en desarrollo');
  }

  async eliminar() {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: '¿Estás seguro de eliminar este registro?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
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
                buttons: ['OK']
              });
              await successAlert.present();
              
              this.router.navigate(['/registro-lista']);
            } catch (error) {
              this.mostrarError('Error al eliminar el registro');
            }
          }
        }
      ]
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
      buttons: ['OK']
    });
    await alert.present();
  }

  volver() {
    this.router.navigate(['/registro-lista']);
  }
}
