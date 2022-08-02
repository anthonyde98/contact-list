import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { MESSAGES, STATES } from '../constants/global.constants';
import { ICONS } from '../constants/icons.constants';
import { ConnectivityProvider } from '../providers/connectivity.provider';
import { CacheService } from './cache.service';
import { ContactoService } from './contacto.service';
import { DeviceService } from './device.service';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private icons = ICONS;
  private messages = MESSAGES;
  private states = STATES;

  constructor(private toastCtrl: ToastController, private contactoService: ContactoService,
    private cacheService: CacheService, private conn: ConnectivityProvider, private deviceService: DeviceService) { }

  show(mensaje: string, tipo: string, duracion: number) {
    let toast = this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      position: "bottom",
      color: tipo
    }).then((toastData) => {
      toastData.present();
    });
  }

  showOptionRecover(mensaje: string, tipo: string, duracion: number, id: string) {
    const toast = this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      color: tipo,
      position: 'bottom',
      buttons: [
        {
          side: 'end',
          icon: this.icons.global.arrows.recover,
          text: 'Recuperar',
          handler: async () => {
            let status = await this.conn.getNetWorkStatus();
            if(!status.connected){
              let response = await this.cacheService.reverseDeleteContacto()
              let response2;

              if(response){
                response2 = await this.cacheService.deleteOrRecoverContacto(id, true);
              }

              if(!response || !response2){
                this.show(this.messages.error.errorRecoveringContact, this.states.error.result, 3000);
              }
              else{ 
                this.deviceService.changeView.emit(true);
              }
            }
            else{
              this.contactoService.actualizarContacto({status: true}, id)
            }
          }
        }
      ]
    }).then((toastData) => {
      toastData.present();
    });
  }

  showOptionNumberCopy(mensaje: string, tipo: string, duracion: number, number: string) {
    const toast = this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      color: tipo,
      position: 'bottom',
      buttons: [
        {
          side: 'end',
          icon: this.icons.global.keypad,
          text: 'Llamar',
          handler: () => {
            window.open(`tel:${number}`);
          }
        }
      ]
    }).then((toastData) => {
      toastData.present();
    });
  }

  showOptionCorreoCopy(mensaje: string, tipo: string, duracion: number, correo: string) {
    const toast = this.toastCtrl.create({
      message: mensaje,
      duration: duracion,
      color: tipo,
      position: 'bottom',
      buttons: [
        {
          side: 'end',
          icon: this.icons.global.letter,
          text: 'Enviar correo',
          handler: () => {
            window.open(`mailTo:${correo}`);
          }
        }
      ]
    }).then((toastData) => {
      toastData.present();
    });
  }
}

