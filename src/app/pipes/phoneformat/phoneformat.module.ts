import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';
import { PhoneFormatPipe } from './phoneformat.pipe'; 

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [PhoneFormatPipe],
  exports: [PhoneFormatPipe]
})
export class PhoneFormatModule {}
