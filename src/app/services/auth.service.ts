import { Injectable } from '@angular/core';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { ConnectivityProvider } from '../providers/connectivity.provider';
import { ContactoService } from './contacto.service';
import { DeviceService } from './device.service';
import { AlertService } from './alert.service';
import { App } from '@capacitor/app';
import { GLOBAL, MESSAGES, STATES } from '../constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private global = GLOBAL;
  private states = STATES;
  private messages = MESSAGES;

  constructor(private deviceService: DeviceService, private faio: FingerprintAIO,
    private contactoService: ContactoService, private connectivity: ConnectivityProvider, private alert: AlertService) { }

  async uploadToken(deviceId){
    const deviceInfo = await this.deviceService.getDeviceInfo();
    await this.contactoService.agregarUsuario(deviceId, deviceInfo);
    await this.tokenAuth();
  }

  checkDeviceToken(deviceId){
    this.contactoService.obtenerGrupo(deviceId).subscribe(async (data) => {
      if(data){
        if(data.length === 1){
          await this.deviceService.saveTokenGroupToStorage(data[0].grupoId);
          this.deviceService.token.emit(data[0].grupoId);
        }
        else{
          await this.uploadToken(deviceId);
        }
      }
      else{
        await this.uploadToken(deviceId);
      }
    })
  }

  async noToken(){
    const deviceId = await this.deviceService.getId();
    const conn = await this.connectivity.getNetWorkStatus();
    
    if(conn.connected){
      this.checkDeviceToken(deviceId)
    }
    else{
      await this.alert.showWithFunction(this.messages.info.needInternetToInit.title, this.messages.info.needInternetToInit.text, 
      this.states.info.exact, this.global.exitFunction);
    }
  }

  async tokenAuth(){
    const token = await this.deviceService.getTokenGroupFromStorage();
    
    if(token){
      this.deviceService.token.emit(token);
    }
    else{
      await this.noToken();
    }
  }

  async fingerPrintAuth(){
    this.faio.isAvailable().then((result: any) => {

      this.faio.show({
        cancelButtonTitle: this.global.fingerprint.cancelBtnComponent,
        description: this.global.fingerprint.descriptionComponent,
        disableBackup: false,
        title: this.global.fingerprint.titleComponent,
        fallbackButtonTitle: this.global.fingerprint.backUpBtn
      })
      .then(async () => {
          await this.tokenAuth();
      })
      .catch((error: any) => {
        console.log(error)
        if(error.code == this.global.fingerprint.errorCode.lockedOut){
          this.alert.showWithFunction(this.messages.error.mannyAttends.title, this.messages.error.mannyAttends.text,
          this.states.error.exact, this.global.exitFunction);
        }
        else if(error.code == this.global.fingerprint.errorCode.bioDismiss || error.code == this.global.fingerprint.errorCode.pinPatternDismiss){
          App.exitApp();
        }
      });
    })
    .catch((error: any) => {
      console.log(error);
      App.exitApp();
    });
  }
}
