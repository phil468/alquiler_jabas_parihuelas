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
import { ApiService, DescripcionJaba } from '../../services/api.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-descripcion-form',
  templateUrl: './descripcion-form.page.html',
  styleUrls: ['./descripcion-form.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class DescripcionFormPage implements OnInit {
  descripcionForm: FormGroup;
  descripcionId: number | null = null;
  isEditMode = false;
  loading = false;

  colores = [
    'Azul',
    'Rojo',
    'Verde',
    'Amarillo',
    'Negro',
    'Blanco',
    'Naranja',
    'Gris',
    'Otro',
  ];
  materiales = ['Plástico', 'Madera', 'Metal', 'Cartón', 'Otro'];

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private alertController: AlertController
  ) {
    this.descripcionForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      descripcion: ['', [Validators.required, Validators.maxLength(255)]],
      color: [''],
      material: [''],
      capacidad: [''],
      activo: [true],
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.descripcionId = parseInt(id);
      this.isEditMode = true;
      this.cargarDescripcion();
    }
  }

  async cargarDescripcion() {
    if (!this.descripcionId) return;

    this.loading = true;
    try {
      const response = await this.apiService
        .getDescripcionJaba(this.descripcionId)
        .toPromise();
      if (response?.data) {
        this.descripcionForm.patchValue(response.data);
      }
    } catch (error) {
      console.error('Error al cargar descripción:', error);
      this.mostrarError('Error al cargar los datos de la descripción');
      this.volver();
    } finally {
      this.loading = false;
    }
  }

  async guardar() {
    if (this.descripcionForm.invalid) {
      Object.keys(this.descripcionForm.controls).forEach((key) => {
        this.descripcionForm.get(key)?.markAsTouched();
      });
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas ${
        this.isEditMode ? 'actualizar' : 'crear'
      } esta descripción?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: async () => {
            await this.guardarDescripcion();
          },
        },
      ],
    });

    await alert.present();
  }

  async guardarDescripcion() {
    this.loading = true;
    try {
      const data = this.descripcionForm.value;

      if (this.isEditMode && this.descripcionId) {
        await this.apiService
          .updateDescripcionJaba(this.descripcionId, data)
          .toPromise();
      } else {
        await this.apiService.createDescripcionJaba(data).toPromise();
      }

      const successAlert = await this.alertController.create({
        header: 'Éxito',
        message: `Descripción ${
          this.isEditMode ? 'actualizada' : 'creada'
        } correctamente`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.volver();
    } catch (error: any) {
      console.error('Error al guardar descripción:', error);
      let mensaje = 'Error al guardar la descripción';

      if (error?.error?.message) {
        mensaje = error.error.message;
      }

      this.mostrarError(mensaje);
    } finally {
      this.loading = false;
    }
  }

  async cancelar() {
    if (this.descripcionForm.dirty) {
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
    this.router.navigate(['/descripciones']);
  }

  getErrorMessage(field: string): string {
    const control = this.descripcionForm.get(field);

    if (!control?.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['maxLength']) {
      return 'Longitud máxima excedida';
    }

    return '';
  }
}
