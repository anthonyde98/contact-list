import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTES } from 'src/app/constants/routes.constants';

import { ListPage } from './list.page';

const routes: Routes = [
  {
    path: ROUTES.normalRoutes.index,
    component: ListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListPageRoutingModule {}
