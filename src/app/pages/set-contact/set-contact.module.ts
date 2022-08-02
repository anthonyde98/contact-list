import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SetContactPageRoutingModule } from './set-contact-routing.module';

import { SetContactPage } from './set-contact.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SetContactPageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [SetContactPage]
})
export class SetContactPageModule {}
