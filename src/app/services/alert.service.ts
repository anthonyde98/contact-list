import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { GLOBAL, STATES } from '../constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private global = GLOBAL;
  private states = STATES;
  
  constructor(private alert: AlertController) { }

  async show(title, msg, type){
    const alert = await this.alert.create({
      header: title,
      message: msg,
      buttons: ['OK'],
      cssClass: this.setColor(type)
    });

    return await alert.present();
  }

  async showWithFunction(title, msg, type, funcion){
    const alert = await this.alert.create({
      header: title,
      message: msg,
      buttons: [{
        text: 'OK',
        role: 'cancel',
        handler: funcion
      }],
      cssClass: this.setColor(type)
    });
    alert.style.cssText = "z-index: 50123;";

    return await alert.present();
  }

  private setColor(type){
    return type == this.states.error.exact ? 
    this.global.customAlerts.error : type == this.states.warning.exact ? 
    this.global.customAlerts.warning : type ==this.states.info.exact ? 
    this.global.customAlerts.info : this.global.customAlerts.success;
  }
}