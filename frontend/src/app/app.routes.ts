import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./pages/auth-callback/auth-callback.page').then(
        (m) => m.AuthCallbackPage
      ),
  },
  {
    path: 'registro-form',
    loadComponent: () =>
      import('./pages/registro-form.page').then((m) => m.RegistroFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'registro-lista',
    loadComponent: () =>
      import('./pages/registro-lista.page').then((m) => m.RegistroListaPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'registro-detalle/:id',
    loadComponent: () =>
      import('./pages/registro-detalle.page').then(
        (m) => m.RegistroDetallePage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'registro/nuevo',
    redirectTo: 'registro-form',
    pathMatch: 'full',
  },
  {
    path: 'configuracion',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.page').then(
        (m) => m.ConfiguracionPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes-lista.page').then(
        (m) => m.ClientesListaPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'clientes/editar/:id',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'choferes',
    loadComponent: () =>
      import('./pages/choferes/choferes-lista.page').then(
        (m) => m.ChoferesListaPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'choferes/nuevo',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'choferes/editar/:id',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'placas',
    loadComponent: () =>
      import('./pages/placas/placas-lista.page').then((m) => m.PlacasListaPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'placas/nuevo',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'placas/editar/:id',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
    canActivate: [AuthGuard],
  },
  {
    path: 'descripciones',
    loadComponent: () =>
      import('./pages/descripciones/descripciones-lista.page').then(
        (m) => m.DescripcionesListaPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'descripciones/nuevo',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'descripciones/editar/:id',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./pages/usuarios/usuarios-lista.page').then(
        (m) => m.UsuariosListaPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios/nuevo',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'usuarios/editar/:id',
    loadComponent: () =>
      import('./pages/usuarios/usuario-form.page').then(
        (m) => m.UsuarioFormPage
      ),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '/login',
    pathMatch: 'full',
  },
];
