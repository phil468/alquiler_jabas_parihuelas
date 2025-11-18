import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonApp,
  IonRouterOutlet,
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonMenuToggle,
  IonAvatar,
  IonNote,
  AlertController,
} from '@ionic/angular/standalone';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    IonApp,
    IonRouterOutlet,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonMenuToggle,
    IonAvatar,
    IonNote,
  ],
})
export class AppComponent {
  user: any = null;

  menuItems = [
    {
      title: 'Inicio',
      url: '/home',
      icon: 'home',
    },
    {
      title: 'Nuevo Registro',
      url: '/registro-form',
      icon: 'add-circle',
    },
    {
      title: 'Lista de Registros',
      url: '/registro-lista',
      icon: 'list',
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: 'stats-chart',
    },
    {
      title: 'Configuración',
      url: '/configuracion',
      icon: 'settings',
      divider: true,
    },
    {
      title: 'Clientes',
      url: '/clientes',
      icon: 'people',
    },
    {
      title: 'Choferes',
      url: '/choferes',
      icon: 'person',
    },
    {
      title: 'Placas',
      url: '/placas',
      icon: 'car',
    },
    {
      title: 'Jabas',
      url: '/descripciones',
      icon: 'cube',
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController
  ) {
    // Suscribirse a cambios del usuario autenticado
    this.authService.currentUser$.subscribe((user) => {
      this.user = user;
    });
  }

  async logout() {
    console.log('[AppComponent] Logout initiated');
    try {
      const alert = await this.alertController.create({
        header: 'Cerrar sesión',
        message: '¿Estás seguro que deseas cerrar sesión?',
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
          },
          {
            text: 'Cerrar sesión',
            role: 'confirm',
          },
        ],
      });

      console.log('[AppComponent] Alert created successfully');
      await alert.present();
      console.log('[AppComponent] Alert presented');

      const { role } = await alert.onDidDismiss();
      console.log('[AppComponent] Alert dismissed with role:', role);

      if (role == 'confirm') {
        console.log(
          '[AppComponent] User confirmed logout, calling authService.logout()'
        );
        await this.authService.logout();
        console.log('[AppComponent] authService.logout() completed');
      }

      if (role == 'cancel') {
        console.log('[AppComponent] User cancelled logout');
      }
    } catch (error) {
      console.error('[AppComponent] Error in logout:', error);
    }
  }
}
