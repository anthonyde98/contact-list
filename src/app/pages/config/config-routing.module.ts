import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTES } from 'src/app/constants/routes.constants';

import { ConfigPage } from './config.page';

const routes: Routes = [
  {
    path: ROUTES.normalRoutes.index,
    component: ConfigPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigPageRoutingModule {}
