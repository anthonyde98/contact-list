import { EventEmitter, Injectable } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { AlertService } from './alert.service';
import { Device } from '@capacitor/device';
import { Contacto } from './contacto.service';
import { EMPTY, GLOBAL, KEYS, MESSAGES, STATES } from '../constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private empty = EMPTY;
  private keys = KEYS;
  private messages = MESSAGES;
  private states = STATES;
  private global = GLOBAL;
  
  token = new EventEmitter<string>();
  scroll = new EventEmitter<boolean>();
  changeView = new EventEmitter<boolean>();

  constructor(private alert: AlertService) {
  }

  async getId(){

    return await (await Device.getId()).uuid;
  }

  async getDeviceInfo(){
    return await Device.getInfo()
  }

  async saveTokenGroupToStorage(token){

    await Storage.set({
      key: this.keys.tokenGroup,
      value: token,
    }).catch((error: any) => {
      this.alert.showWithFunction(this.messages.error.title, this.messages.error.errorSettingToken, 
        this.states.error.exact, this.global.exitFunction)
    });

    return token;
  }

  async getTokenGroupFromStorage(){
    const { value } = await Storage.get({ key: this.keys.tokenGroup });

    return value;
  }

  async getConfigAIO(){
    const { value } = await Storage.get({ key: this.keys.fingerPrint });

    return value;
  }

  async createRandomDataId(): Promise<string>{
    let id = this.empty;

    do{
      const dataId = () => {
        const random = () => {
          return Math.random().toString(36).substring(0);
        };
      
        const tokenId = () => {
            return random() + random();
        };

        return tokenId();
      }

      id = dataId();
    }
    while(await this.hasId(id));

    return id;
  }
  
  async hasId(id): Promise<boolean>{
    const { value } = await Storage.get({ key: this.keys.dataContactos });
    let datos = JSON.parse(value);

    
    let contactos: Contacto[] = datos.filter(value => value.status === true);
    let index = contactos.findIndex(value => value.id == id);
    let response = false;
    
    if(index >= 0){
      response = true;
    }

    return response;
  }

}
