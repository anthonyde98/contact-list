import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTES } from 'src/app/constants/routes.constants';

import { DetailPage } from './detail.page';

const routes: Routes = [
  {
    path: ROUTES.normalRoutes.index,
    component: DetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailPageRoutingModule {}
