import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonNote,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  LoadingController,
  ToastController,
  AlertController,
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import {
  ApiService,
  Cliente,
  Chofer,
  Placa,
  DescripcionJaba,
} from '../services/api.service';
import { addIcons } from 'ionicons';
import {
  cameraOutline,
  saveOutline,
  closeOutline,
  createOutline,
} from 'ionicons/icons';
import { ModalController } from '@ionic/angular';
import { FirmaPadComponent } from '../components/firma-pad.component';

@Component({
  selector: 'app-registro-form',
  templateUrl: './registro-form.page.html',
  styleUrls: ['./registro-form.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonTextarea,
    IonNote,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    IonSpinner,
  ],
})
export class RegistroFormPage implements OnInit {
  registroForm!: FormGroup;

  clientes: Cliente[] = [];
  choferes: Chofer[] = [];
  placas: Placa[] = [];
  descripcionesJabas: DescripcionJaba[] = [];

  imagenCapturada: string | null = null;
  firmaEntregado: string | null = null;
  firmaRepresentante: string | null = null;

  loading = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({ cameraOutline, saveOutline, closeOutline, createOutline });
  }

  ngOnInit() {
    this.initForm();
    this.loadData();
  }

  initForm() {
    this.registroForm = this.fb.group({
      cliente_id: ['', Validators.required],
      representante_cliente: ['', Validators.required],
      chofer_id: ['', Validators.required],
      placa_1_id: [''],
      placa_2_id: [''],
      descripcion_jaba_1_id: [''],
      descripcion_jaba_2_id: [''],
      cantidad_jabas_1: [0, [Validators.required, Validators.min(0)]],
      cantidad_jabas_2: [0, Validators.min(0)],
      cantidad_parihuelas: [0, [Validators.required, Validators.min(0)]],
      observaciones: [''],
    });
  }

  async loadData() {
    const loading = await this.loadingCtrl.create({
      message: 'Cargando datos...',
    });
    await loading.present();

    try {
      // Cargar todas las opciones para los dropdowns
      this.clientes =
        (await this.apiService.getClientesActivos().toPromise()) || [];
      this.choferes =
        (await this.apiService.getChoferesActivos().toPromise()) || [];
      this.placas =
        (await this.apiService.getPlacasActivas().toPromise()) || [];
      this.descripcionesJabas =
        (await this.apiService.getDescripcionesJabasActivas().toPromise()) ||
        [];
    } catch (error) {
      console.error('Error loading data:', error);
      const toast = await this.toastCtrl.create({
        message: 'Error al cargar los datos',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    } finally {
      await loading.dismiss();
    }
  }

  async capturarFoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      this.imagenCapturada = image.dataUrl || null;
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }

  async confirmarGuardar() {
    if (this.registroForm.invalid) {
      const toast = await this.toastCtrl.create({
        message: 'Por favor complete todos los campos requeridos',
        duration: 3000,
        color: 'warning',
      });
      await toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: '¿Guardar Registro?',
      message: 'Se creará un nuevo registro de alquiler. ¿Desea continuar?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Guardar',
          handler: () => {
            this.guardarRegistro();
          },
        },
      ],
    });

    await alert.present();
  }

  async abrirFirmaEntregado() {
    const modal = await this.modalCtrl.create({
      component: FirmaPadComponent,
      cssClass: 'firma-modal',
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.firmaEntregado = result.data;
      }
    });

    await modal.present();

    // Escuchar eventos del componente
    const { data } = await modal.onWillDismiss();
  }

  async abrirFirmaRepresentante() {
    const modal = await this.modalCtrl.create({
      component: FirmaPadComponent,
      cssClass: 'firma-modal',
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.firmaRepresentante = result.data;
      }
    });

    await modal.present();
  }

  async guardarRegistro() {
    const loading = await this.loadingCtrl.create({
      message: 'Guardando registro...',
    });
    await loading.present();

    try {
      const formData = new FormData();

      // Agregar campos del formulario
      Object.keys(this.registroForm.value).forEach((key) => {
        const value = this.registroForm.value[key];
        if (value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      // Agregar imagen si existe
      if (this.imagenCapturada) {
        const blob = await this.dataUrlToBlob(this.imagenCapturada);
        formData.append('imagen', blob, 'registro.jpg');
      }

      // Agregar firmas
      if (this.firmaEntregado) {
        formData.append('firma_entregado', this.firmaEntregado);
      }

      if (this.firmaRepresentante) {
        formData.append('firma_representante', this.firmaRepresentante);
      }

      const response = await this.apiService
        .createRegistro(formData)
        .toPromise();

      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: 'Registro creado exitosamente',
        duration: 3000,
        color: 'success',
      });
      await toast.present();

      this.router.navigate(['/registros']);
    } catch (error: any) {
      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: error.error?.message || 'Error al guardar el registro',
        duration: 3000,
        color: 'danger',
      });
      await toast.present();
    }
  }

  async dataUrlToBlob(dataUrl: string): Promise<Blob> {
    const response = await fetch(dataUrl);
    return await response.blob();
  }

  cancelar() {
    this.router.navigate(['/']);
  }
}
