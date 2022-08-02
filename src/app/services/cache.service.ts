import { Injectable } from '@angular/core';
import { Contacto, ContactoService } from './contacto.service';
import { from, Observable } from 'rxjs';
import { Storage } from '@capacitor/storage';
import { map } from 'rxjs/operators';
import { ConnectivityProvider } from '../providers/connectivity.provider';
import { INFO, KEYS } from '../constants/global.constants';

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private keys = KEYS;
  private info = INFO;

  constructor(private contactoService: ContactoService, private connectivity: ConnectivityProvider) { }

  private async setData(data){
    await Storage.set({
      key: this.keys.dataContactos,
      value: data,
    })
  }
  
  private async getData(){
    const { value } = await Storage.get({ key: this.keys.dataContactos });
    let contactos = JSON.parse(value);

    return contactos.filter(value => value.status === true);
  }

  private async getAllData(){
    const { value } = await Storage.get({ key: this.keys.dataContactos });
    let contactos = JSON.parse(value);

    return contactos;
  }

  getDataFromFirestoreAfterNoInternet(){
    this.contactoService.obtenerContactosParaCache().subscribe(async (data) => {
      if(data.length > 0){
        await this.setData(JSON.stringify(data));
      }
    })
  }

  getDataFromFirestore(){
    this.contactoService.obtenerContactosParaCache().subscribe(async (data) => {
      const status = await this.connectivity.getNetWorkStatus();
      if(data.length > 0 && status.connected){
        await this.setData(JSON.stringify(data));
      }
    })
  }

  getContactos(): Observable<Contacto[]>{
    const value = from(Storage.get({ key: this.keys.dataContactos }));
    
    return value.pipe(
      map(contacto => {
        return JSON.parse(contacto.value).filter(value => value.status === true)
      })
    )
  }

  getContactosConFiltro(filtro): Observable<Contacto[]>{
    let contactos = this.getContactos();
    
    return contactos.pipe(
      map(contacto => {
        if(filtro.nombre == this.info.contacto.numeros.plural){
          return contacto.filter((value: any) => {
            for(let element of value[filtro.nombre]){
              if(element[this.info.contacto.numeros.singular].includes(filtro.dato)){
                return true;
              } 
            };
          })
        }
        else{
          return contacto.filter((value: any) => {
            return value[filtro.nombre].toLowerCase().indexOf(filtro.dato.toLowerCase()) > -1 
          })
        }
      })
    );
  }

  async getContacto(id): Promise<Contacto>{
    let contactos: Contacto[] = await this.getData();

    let contacto = contactos.find(value => value.id == id);

    return contacto;
  }

  async saveContactoOffline(contactoData): Promise<boolean>{
    let contactos: Contacto[] = await this.getData();
    let response = true;
    contactos.push(contactoData);
    await this.setData(JSON.stringify(contactos));
  
    return response;
  }

  async editContactoOffline(id, contactoData): Promise<boolean>{
    let contactos: Contacto[] = await this.getData();
    let index = contactos.findIndex(value => value.id == id);
    let response = false;
    
    if(index >= 0){
      response = true;
      contactos[index].color = contactoData.color;
      contactos[index].correo = contactoData.correo;
      contactos[index].descripcion = contactoData.descripcion;
      contactos[index].nombre = contactoData.nombre;
      contactos[index].numeros = contactoData.numeros;
      contactos[index].relacion = contactoData.relacion;
      await this.setData(JSON.stringify(contactos));
    }

    return response;
  }

  getNewContactoFromFirestore(){
    this.contactoService.obtenerContactosParaCache().subscribe(async (data) => {
      let contactos: Contacto[] = await this.getData();
      contactos.push(data[data.length - 1]);
      await this.setData(JSON.stringify(contactos));
    })
  }

  async deleteOrRecoverContacto(id, decision): Promise<boolean>{
    let contactos: Contacto[] = await this.getAllData();
    let index = contactos.findIndex(value => value.id === id);
    let response = false;
    
    if(index >= 0){
      response = true;
      contactos[index].status = decision;
      await this.setData(JSON.stringify(contactos));
    }

    return response;
  }

  async isThereAnyData(): Promise<any>{
    const variableNames = [this.keys.saveContactos, this.keys.editContactos, this.keys.deleteContactos];
    let accions = {accion: false, positions: []};
    for(let i = 0; i < variableNames.length; i++){
      const { value } = await Storage.get({ key: variableNames[i] });
      let data: any[] = JSON.parse(value) || [];

      if(data.length > 0){
        accions.positions.push(i);
      }
    }
    accions.accion = accions.positions.length > 0;
    return accions;
  }

  async saveContacto(contacto): Promise<boolean>{
    let response;
    try{
      const { value } = await Storage.get({ key: this.keys.saveContactos });
      let oldContactos: Contacto[] = JSON.parse(value) || [];

      oldContactos.push(contacto);

      let newContactos = JSON.stringify(oldContactos)

      await Storage.set({
        key: this.keys.saveContactos,
        value: newContactos,
      })

      response = true;
    }
    catch(error){
      response = false;
    }

    return response;
  }

  async editContacto(id, contacto): Promise<boolean>{
    let response;
    try{
      const { value } = await Storage.get({ key: this.keys.editContactos });
      let oldContactos: any[] = JSON.parse(value) || [];

      oldContactos.push({id: id, contacto: contacto});
      console.log(oldContactos)

      let newContactos = JSON.stringify(oldContactos)

      await Storage.set({
        key: this.keys.editContactos,
        value: newContactos,
      })

      response = true;
    }
    catch(error){
      response = false;
    }
    
    return response;
  }

  async deleteContacto(id): Promise<boolean>{
    let response;
    try{
      const { value } = await Storage.get({ key: this.keys.deleteContactos });
      let oldContactos: string[] = JSON.parse(value) || [];

      oldContactos.push(id);

      let newContactos = JSON.stringify(oldContactos)

      await Storage.set({
        key: this.keys.deleteContactos,
        value: newContactos,
      })

      response = true;
    }
    catch(error){
      response = false;
    }
    
    return response;
  }

  async reverseDeleteContacto(): Promise<boolean>{
    let response;
    try{
      const { value } = await Storage.get({ key: this.keys.deleteContactos });
      let oldContactos: string[] = JSON.parse(value) || [];

      oldContactos.pop();

      let newContactos = JSON.stringify(oldContactos)

      await Storage.set({
        key: this.keys.deleteContactos,
        value: newContactos,
      })

      response = true;
    }
    catch(error){
      response = false;
    }
    
    return response;
  }

  async getSaveContactos(): Promise<Contacto[]>{
    const { value } = await Storage.get({ key: this.keys.saveContactos });
    let contactos: Contacto[] = JSON.parse(value) || [];

    return contactos;
  }

  async getEditContactos(): Promise<any[]>{
    const { value } = await Storage.get({ key: this.keys.editContactos });
    let contactos: any[] = JSON.parse(value) || [];

    return contactos;
  }

  async getDeleteContactos(): Promise<string[]>{
    const { value } = await Storage.get({ key: this.keys.deleteContactos });
    let contactos: string[] = JSON.parse(value) || [];

    return contactos;
  }

  async setStorageVariable(variable, data){
    console.log(data)
    try{
      await Storage.set({
        key: variable,
        value: JSON.stringify(data),
      })
    }
    catch(error){
      console.log(error)
    }
  }
}
