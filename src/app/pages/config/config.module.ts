import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfigPageRoutingModule } from './config-routing.module';

import { ConfigPage } from './config.page';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { BtnTopModule } from 'src/app/components/btn-top/btn-top.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfigPageRoutingModule,
    BtnTopModule
  ],
  declarations: [ConfigPage],
  providers: [
    BarcodeScanner
  ]
})
export class ConfigPageModule {}
