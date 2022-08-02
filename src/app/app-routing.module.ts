import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { ROUTES } from './constants/routes.constants';

const routes: Routes = [
  {
    path: ROUTES.normalRoutes.list,
    loadChildren: () => import('./pages/list/list.module').then( m => m.ListPageModule)
  },
  {
    path: ROUTES.normalRoutes.index,
    redirectTo: ROUTES.normalRoutes.list,
    pathMatch: ROUTES.exact
  },
  {
    path: ROUTES.normalRoutesWithId.detail,
    loadChildren: () => import('./pages/detail/detail.module').then( m => m.DetailPageModule)
  },
  {
    path: ROUTES.normalRoutesWithId.setContact,
    loadChildren: () => import('./pages/set-contact/set-contact.module').then( m => m.SetContactPageModule)
  },
  {
    path: ROUTES.normalRoutes.config,
    loadChildren: () => import('./pages/config/config.module').then( m => m.ConfigPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
