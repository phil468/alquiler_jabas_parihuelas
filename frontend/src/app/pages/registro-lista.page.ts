import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { ApiService, Registro } from '../services/api.service';

@Component({
  selector: 'app-registro-lista',
  templateUrl: './registro-lista.page.html',
  styleUrls: ['./registro-lista.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class RegistroListaPage implements OnInit {
  registros: Registro[] = [];
  registrosFiltrados: Registro[] = [];
  loading = false;

  // Filtros
  fechaInicio: string = '';
  fechaFin: string = '';
  clienteId: number | null = null;
  estado: string = '';
  searchTerm: string = '';

  // Clientes para el filtro
  clientes: any[] = [];

  // Paginación
  currentPage = 1;
  totalPages = 1;
  perPage = 15;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit() {
    this.cargarClientes();
    this.cargarRegistros();
  }

  async cargarClientes() {
    try {
      this.apiService.getClientesActivos().subscribe({
        next: (response) => {
          this.clientes = response;
        },
        error: (error) => {
          console.error('Error al cargar clientes:', error);
        }
      });
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  }

  cargarRegistros() {
    this.loading = true;
    try {
      const filtros: any = {
        per_page: this.perPage,
        page: this.currentPage,
      };

      if (this.fechaInicio) filtros.fecha_inicio = this.fechaInicio;
      if (this.fechaFin) filtros.fecha_fin = this.fechaFin;
      if (this.clienteId) filtros.cliente_id = this.clienteId;
      if (this.estado) filtros.estado = this.estado;
      if (this.searchTerm) filtros.search = this.searchTerm;

      this.apiService.getRegistros(filtros).subscribe({
        next: (response) => {
          this.registros = response.data;
          this.registrosFiltrados = this.registros;
          this.totalPages = response.last_page;
          this.currentPage = response.current_page;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error al cargar registros:', error);
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error al cargar registros:', error);
      this.loading = false;
    }
  }

  aplicarFiltros() {
    this.currentPage = 1;
    this.cargarRegistros();
  }

  limpiarFiltros() {
    this.fechaInicio = '';
    this.fechaFin = '';
    this.clienteId = null;
    this.estado = '';
    this.searchTerm = '';
    this.cargarRegistros();
  }

  buscar(event: any) {
    this.searchTerm = event.target.value;
    if (this.searchTerm.length >= 3 || this.searchTerm.length === 0) {
      this.aplicarFiltros();
    }
  }

  verDetalle(id: number) {
    this.router.navigate(['/registro-detalle', id]);
  }

  nuevoRegistro() {
    this.router.navigate(['/registro-form']);
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

  async cambiarEstado(registro: Registro) {
    // Se implementará con el modal de cambio de estado
    console.log('Cambiar estado:', registro);
  }

  async verImagen(imagePath: string) {
    // Se implementará para abrir la imagen en modal
    console.log('Ver imagen:', imagePath);
  }

  async exportarExcel() {
    try {
      const filtros: any = {};

      if (this.fechaInicio) filtros.fecha_inicio = this.fechaInicio;
      if (this.fechaFin) filtros.fecha_fin = this.fechaFin;
      if (this.clienteId) filtros.cliente_id = this.clienteId;
      if (this.estado) filtros.estado = this.estado;

      const blob = await this.apiService.exportarRegistros(filtros).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Registros_${
          new Date().toISOString().split('T')[0]
        }.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Excel exportado exitosamente');
      }
    } catch (error) {
      console.error('Error al exportar:', error);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarRegistros();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarRegistros();
    }
  }

  doRefresh(event: any) {
    this.cargarRegistros();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }
}

  // doRefresh(event: any) {
  //   this.cargarRegistros().then(() => {
  //     event.target.complete();
  //   });
  // }
// }
