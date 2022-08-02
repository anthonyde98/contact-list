import { Injectable } from '@angular/core';
import { collection, addDoc, Firestore, collectionData, query, CollectionReference, updateDoc, doc, getDoc, docData, DocumentReference, serverTimestamp, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { FieldValue, orderBy, where } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { EMPTY, INFO } from '../constants/global.constants';
import { DeviceService } from './device.service';

export interface Contacto{
  grupoId?: string,
  id?: string,
  nombre: string,
  relacion: string,
  numeros: Array<string>,
  descripcion: string,
  color: string,
  correo: string,
  status?: boolean,
  fecha?: FieldValue;
}

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private empty = EMPTY;
  private info = INFO;
  private token = this.empty;
  
  constructor(private fire: Firestore, private deviceService: DeviceService) {
    this.deviceService.token.subscribe(value => {
      this.token = value;
    })
  }
  
  getToken(){
    return this.token;
  }

  async agregarContacto(contacto: Contacto){
    let col = collection(this.fire, this.info.contacto.contacto);
    
    await addDoc(col, {...contacto, groupId: this.token, status: true, fecha: serverTimestamp()});
  }

  obtenerContactosConFiltro(filtro: any): Observable<Contacto[]>{
    let contactos = collectionData<Contacto>( 
      query<Contacto>(
        collection(this.fire, this.info.contacto.contacto) as CollectionReference<Contacto>, 
        where('groupId', '==', this.token), 
        orderBy("fecha"),
        where("status", "==", true)
      ), {idField: 'id'} 
    );

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
  
  obtenerContactos(): Observable<Contacto[]>{
    return collectionData<Contacto>(
      query<Contacto>(
        collection(this.fire, this.info.contacto.contacto) as CollectionReference<Contacto>, 
        where('groupId', '==', this.token), 
        orderBy("fecha"),
        where("status", "==", true)
      ), {idField: 'id'}
    );
  }

  obtenerContactosParaCache(): Observable<Contacto[]>{
    return collectionData<Contacto>(
      query<Contacto>(
        collection(this.fire, this.info.contacto.contacto) as CollectionReference<Contacto>, 
        where('groupId', '==', this.token), 
        orderBy("fecha")
      ), {idField: 'id'}
    );
  }

  async actualizarContacto(datos: any, id: string){
    let documento = doc(this.fire, this.info.contacto.contacto, id);

    await updateDoc(documento, datos);
  }

  async obtenerContacto(id: string){
    let documento = doc(this.fire, this.info.contacto.contacto, id);

    let docSnap = await getDoc(documento);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return false;
    }
  }

  async agregarUsuario(usuario, deviceInfo){
    let col = collection(this.fire, this.info.device.usuario);

    return await (await addDoc(col, {usuarios: [{nombre: this.info.device.principalDeviceName, codigo: usuario, dispositivo: deviceInfo}]})).id;
  }

  async obtenerUsuario(id: string){
    let documento = doc(this.fire, this.info.device.usuario, id);

    let docSnap = await getDoc(documento);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return false;
    }
  }

  async agregarAGrupo(usuarioId, device, tipo, plataforma, navegador){
    let documento = doc(this.fire, this.info.device.usuario, this.token);
    
    await updateDoc(documento, {usuarios: arrayUnion({nombre: device, tipo: tipo, codigo: usuarioId, 
      plataforma: plataforma, navegador: navegador})});
  }

  obtenerDispositivos(): Observable<any[]>{
    return docData<any>(
      doc(this.fire, this.info.device.usuario, this.token) as DocumentReference<any>
    );
  }

  async eliminarDispositivo(dispositivo){
    let documento = doc(this.fire, this.info.device.usuario, this.token);
    
    await updateDoc(documento, {usuarios: arrayRemove(dispositivo)})
  }

  obtenerGrupo(usuarioId: string){
    let usuarios = collectionData<any>(
      query<any>(
        collection(this.fire, this.info.device.usuario)
      ), {idField: 'id'}
    );

    return usuarios.pipe(
      map(usuario => {
        let us = [];
        for(let i = 0; i < usuario.length; i++){
          for(let j = 0; j < usuario[i].usuarios.length; j++){
            if(usuario[i].usuarios[j].codigo == usuarioId)
              us.push({usuario: usuario[i].usuarios[j], grupoId: usuario[i].id});
          }
        }
        return us;
      })
    );
  }

  FirestoreFormatDate(): FieldValue{
    return serverTimestamp();
  }
  
}
