import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
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
    path: 'registro-form',
    loadComponent: () =>
      import('./pages/registro-form.page').then((m) => m.RegistroFormPage),
  },
  {
    path: 'registro-lista',
    loadComponent: () =>
      import('./pages/registro-lista.page').then((m) => m.RegistroListaPage),
  },
  {
    path: 'registro-detalle/:id',
    loadComponent: () =>
      import('./pages/registro-detalle.page').then(
        (m) => m.RegistroDetallePage
      ),
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
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/clientes-lista.page').then(
        (m) => m.ClientesListaPage
      ),
  },
  {
    path: 'clientes/nuevo',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
  },
  {
    path: 'clientes/editar/:id',
    loadComponent: () =>
      import('./pages/clientes/cliente-form.page').then(
        (m) => m.ClienteFormPage
      ),
  },
  {
    path: 'choferes',
    loadComponent: () =>
      import('./pages/choferes/choferes-lista.page').then(
        (m) => m.ChoferesListaPage
      ),
  },
  {
    path: 'choferes/nuevo',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
  },
  {
    path: 'choferes/editar/:id',
    loadComponent: () =>
      import('./pages/choferes/chofer-form.page').then((m) => m.ChoferFormPage),
  },
  {
    path: 'placas',
    loadComponent: () =>
      import('./pages/placas/placas-lista.page').then((m) => m.PlacasListaPage),
  },
  {
    path: 'placas/nuevo',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
  },
  {
    path: 'placas/editar/:id',
    loadComponent: () =>
      import('./pages/placas/placa-form.page').then((m) => m.PlacaFormPage),
  },
  {
    path: 'descripciones',
    loadComponent: () =>
      import('./pages/descripciones/descripciones-lista.page').then(
        (m) => m.DescripcionesListaPage
      ),
  },
  {
    path: 'descripciones/nuevo',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
  },
  {
    path: 'descripciones/editar/:id',
    loadComponent: () =>
      import('./pages/descripciones/descripcion-form.page').then(
        (m) => m.DescripcionFormPage
      ),
  },
];
