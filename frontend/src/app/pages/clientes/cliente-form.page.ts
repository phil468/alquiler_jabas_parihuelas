import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, Cliente } from '../../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.page.html',
  styleUrls: ['./cliente-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class ClienteFormPage implements OnInit {
  clienteForm: FormGroup;
  clienteId: number | null = null;
  isEditMode = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.clienteForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      ruc: ['', [Validators.pattern(/^\d{11}$/)]],
      direccion: ['', [Validators.maxLength(255)]],
      telefono: ['', [Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(255)]],
      activo: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId = parseInt(id);
      this.isEditMode = true;
      this.cargarCliente();
    }
  }

  async cargarCliente() {
    if (!this.clienteId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getCliente(this.clienteId)
        .toPromise();
      if (response?.data) {
        this.clienteForm.patchValue(response.data);
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      this.mostrarError('Error al cargar los datos del cliente');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.clienteForm.invalid) {
      Object.keys(this.clienteForm.controls).forEach((key) => {
        this.clienteForm.get(key)?.markAsTouched();
      });
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } este cliente?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarCliente();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarCliente() {
    this.loading = true;
    try {
      const data = this.clienteForm.value;

      if (this.isEditMode && this.clienteId) {
        await this.apiService.updateCliente(this.clienteId, data).toPromise();
      } else {
        await this.apiService.createCliente(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Cliente ${
          this.isEditMode ? 'actualizado' : 'creado'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar cliente:', error);
      let mensaje = 'Error al guardar el cliente';

      if (error?.error?.message) {
        mensaje = error.error.message;
      }

      this.mostrarError(mensaje);
    } finally {
      this.loading = false;
    }
  }

  async cancelar() {
    if (this.clienteForm.dirty) {
      const alert = await this.alertController.create({
        header: 'Confirmar',
        message: '¿Deseas descartar los cambios?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
          },
          {
            text: 'Sí',
            handler: () => {
              this.volver();
            },
          },
        ],
      });

      await alert.present();
    } else {
      this.volver();
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
    this.router.navigate(['/clientes']);
  }

  getErrorMessage(field: string): string {
    const control = this.clienteForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['email']) {
      return 'Email inválido';
    }
    if (control.errors['pattern']) {
      return 'RUC debe tener 11 dígitos';
    }
    if (control.errors['maxLength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }
}
