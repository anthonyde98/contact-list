import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListPageRoutingModule } from './list-routing.module';

import { ListPage } from './list.page';
import { BtnTopModule } from 'src/app/components/btn-top/btn-top.module';
import { PhoneFormatModule } from 'src/app/pipes/phoneformat/phoneformat.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListPageRoutingModule,
    BtnTopModule,
    PhoneFormatModule
  ],
  declarations: [ListPage]
})
export class ListPageModule {}
