import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, DescripcionJaba } from '../../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-descripciones-lista',
  templateUrl: './descripciones-lista.page.html',
  styleUrls: ['./descripciones-lista.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DescripcionesListaPage implements OnInit {
  descripciones: DescripcionJaba[] = [];
  descripcionesFiltradas: DescripcionJaba[] = [];
  searchTerm = '';
  loading = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.cargarDescripciones();
  }

  ionViewWillEnter() {
    this.cargarDescripciones();
  }

  async cargarDescripciones() {
    this.loading = true;
    try {
      const response = await this.apiService
        .getDescripcionesJabas()
        .toPromise();
      if (response) {
        this.descripciones = response;
        this.aplicarFiltros();
      }
    } catch (error) {
      console.error('Error al cargar descripciones:', error);
      this.mostrarError('Error al cargar las descripciones');
    } finally {
      this.loading = false;
    }
  }

  filtrar(event: any) {
    this.searchTerm = event.target.value?.toLowerCase() || '';
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    if (!this.searchTerm) {
      this.descripcionesFiltradas = [...this.descripciones];
      return;
    }

    this.descripcionesFiltradas = this.descripciones.filter(
      (desc) =>
        desc.codigo?.toLowerCase().includes(this.searchTerm) ||
        desc.descripcion?.toLowerCase().includes(this.searchTerm) ||
        desc.color?.toLowerCase().includes(this.searchTerm) ||
        desc.material?.toLowerCase().includes(this.searchTerm)
    );
  }

  async toggleEstado(descripcion: DescripcionJaba) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        descripcion.activo ? 'desactivar' : 'activar'
      } esta descripción?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Confirmar',
          handler: async () => {
            await this.cambiarEstado(descripcion);
          },
        },
      ],
    });

    await alert.present();
  }

  async cambiarEstado(descripcion: DescripcionJaba) {
    try {
      const data = { ...descripcion, activo: !descripcion.activo };
      await this.apiService
        .updateDescripcionJaba(descripcion.id, data)
        .toPromise();
      await this.cargarDescripciones();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      this.mostrarError('Error al cambiar el estado');
    }
  }

  async eliminar(descripcion: DescripcionJaba) {
    const alert = await this.alertController.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar "${descripcion.descripcion}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.eliminarDescripcion(descripcion.id);
          },
        },
      ],
    });

    await alert.present();
  }

  async eliminarDescripcion(id: number) {
    try {
      await this.apiService.deleteDescripcionJaba(id).toPromise();
      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: 'Descripción eliminada correctamente',
        buttons: ['OK'],
      });
      await successAlert.present();
      await this.cargarDescripciones();
    } catch (error) {
      console.error('Error al eliminar descripción:', error);
      this.mostrarError('Error al eliminar la descripción');
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

  nuevo() {
    this.router.navigate(['/descripciones/nuevo']);
  }

  editar(descripcion: DescripcionJaba) {
    this.router.navigate(['/descripciones/editar', descripcion.id]);
  }

  volver() {
    this.router.navigate(['/home']);
  }
}
