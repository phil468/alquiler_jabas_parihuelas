import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-auth-callback',
  templateUrl: './auth-callback.page.html',
  styleUrls: ['./auth-callback.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule],
})
export class AuthCallbackPage implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController
  ) {}

  async ngOnInit() {
    const loading = await this.loadingController.create({
      message: 'Completando autenticación...',
    });
    await loading.present();

    this.route.queryParams.subscribe(async (params) => {
      const token = params['token'];
      const userEncoded = params['user'];

      if (token && userEncoded) {
        try {
          // Decodificar datos del usuario
          const user = JSON.parse(atob(userEncoded));

          // Guardar en localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));

          await loading.dismiss();

          // Redirigir al home sin historial
          this.router.navigate(['/home'], { replaceUrl: true });
        } catch (error) {
          console.error('Error procesando callback:', error);
          await loading.dismiss();
          this.router.navigate(['/login'], { replaceUrl: true });
        }
      } else {
        await loading.dismiss();
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    });
  }
}
