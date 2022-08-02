import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { BtnTopComponent } from 'src/app/components/btn-top/btn-top.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [BtnTopComponent],
  exports: [BtnTopComponent]
})
export class BtnTopModule {}
