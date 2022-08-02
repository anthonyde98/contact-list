import { Component, OnInit, ViewChild } from '@angular/core';
import { ContactoService } from 'src/app/services/contacto.service';
import { Storage } from '@capacitor/storage';
import { FingerprintAIO } from '@ionic-native/fingerprint-aio/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { version as uuidVersion } from 'uuid';
import { validate as uuidValidate } from 'uuid';
import { IonContent } from '@ionic/angular';
import { AlertService } from 'src/app/services/alert.service';
import { ToastService } from 'src/app/services/toast.service';
import { ICONS } from 'src/app/constants/icons.constants'
import { DeviceService } from 'src/app/services/device.service';
import { ConnectivityProvider } from 'src/app/providers/connectivity.provider';
import { EMPTY, GESTURES, INFO, KEYS, MESSAGES, STATES } from 'src/app/constants/global.constants';
import { Clipboard } from '@capacitor/clipboard';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
})
export class ConfigPage implements OnInit {
  private icons = ICONS;
  private gestures = GESTURES;
  private empty = EMPTY;
  private keys = KEYS;
  private states = STATES;
  private messages = MESSAGES;
  private info = INFO;
  private gesturesElement = [
    {elemento: this.gestures.config.elements.slide, otro: this.gestures.config.otro, animacion: this.gestures.config.animations.slide},
    {elemento: this.gestures.config.elements.shake, otro: this.empty, animacion: this.gestures.config.animations.shake},
    {elemento: this.gestures.config.elements.contact.tap, otro: this.empty, animacion: this.gestures.config.animations.contact.tap},
    {elemento: this.gestures.config.elements.pointer.tap, otro: this.empty, animacion: this.gestures.config.animations.pointer.tap},
    {elemento: this.gestures.config.elements.pointer.doubleTap, otro: this.empty, animacion: this.gestures.config.animations.pointer.doubleTap},
    {elemento: this.gestures.config.elements.contact.doubleTap, otro: this.empty, animacion: this.gestures.config.animations.contact.doubleTap},
  ]
  private dispositivos: any = [];
  private interval: any;
  private actived: boolean;
  private available: boolean;
  private color: boolean;
  private btnTop: boolean = false;
  private sectionsBtns: any;
  
  @ViewChild(IonContent) private content: IonContent;
  
  constructor(private contactoService: ContactoService, private faio: FingerprintAIO, 
    private scanner: BarcodeScanner, private alert: AlertService, private toast: ToastService, 
    private deviceService: DeviceService, private conn: ConnectivityProvider) {
      this.sectionsBtns = {
        bioAuth: false,
        platforms: false,
        menu: false,
        internetAccions: false,
        noInternetAccions: false,
        OtherFeatures: false
      }
    }

  ngOnInit() {
    this.availableButton();
    this.setButton();
  }

  ngAfterViewInit(){
    this.obtenerDispositivos();
    this.deviceService.scroll.emit(false);
  }

  private async setButton(){
    const { value } = await Storage.get({ key: this.keys.fingerPrint });
  
    if(value == "true"){
      this.actived = true;
    }
    else
      this.actived = false;
  }

  private async availableButton(){
    this.faio.isAvailable().then((result: any) => {      
      this.available = true;
      this.setButton()
    })
    .catch((error: any) => {
      this.available = false;
    });
  }

  private async infoConfig(event){
    if(event.detail.checked){
      this.actived = true;
      
      await Storage.remove({ key: this.keys.fingerPrint });

      await Storage.set({
        key: this.keys.fingerPrint,
        value: 'true'
      });
    }
    else{
      const { value } = await Storage.get({ key: this.keys.fingerPrint });

      if(value){
        await Storage.remove({ key: this.keys.fingerPrint });
      }

      this.actived = false;
    }
  }

  private obtenerDispositivos(){
    this.contactoService.obtenerDispositivos().subscribe((data: any) => {
      this.dispositivos = data.usuarios
    })
  }

  private async eliminarDispositivo(dispositivo){
    let net = await this.conn.getNetWorkStatus();
    if(net.connected){
      this.contactoService.eliminarDispositivo(dispositivo).then(() => {
        this.toast.show(this.messages.success.deviceDeleted, this.states.success.exact, 3000);
      })
    }
    else{
      this.toast.show(this.messages.warning.needInternet, this.states.warning.exact, 3000);
    }
  }

  private uuidValidateV4(uuid){
    return uuidValidate(uuid) && uuidVersion(uuid) === this.info.device.uuidVersion;
  }

  private scan() {
    this.scanner.scan().then(async (data) => {
      if(!data.cancelled){
        if(data.format !== this.info.device.qrFormatCode){
          this.alert.show(this.messages.error.incorrectCode.title, this.messages.error.incorrectCode.text, this.states.error.exact);
        }
        else{
          let datos = JSON.parse(data.text);

          if(this.uuidValidateV4(datos[this.info.device.codigo]))
          {
            let net = await this.conn.getNetWorkStatus();
            if(net.connected){
              this.contactoService.agregarAGrupo(datos[this.info.device.codigo], datos[this.info.device.nombre], datos[this.info.device.tipo], datos[this.info.device.plataforma], datos[this.info.device.navegador]).then(() => {
                this.toast.show(this.messages.success.deviceAdded, this.states.success.exact, 4000);
              }, error => {
                this.alert.show(this.messages.error.title, error, this.states.error.exact)
              })
            }
            else{
              this.toast.show(this.messages.warning.needInternet, this.states.warning.exact, 3000);
            }
          }
          else{
            this.alert.show(this.messages.error.incorrectCode.title, this.messages.error.incorrectCode.text, this.states.error.exact)
          }

          await Clipboard.write({
            string: " "
          })
        }
      }
    }).catch(error => {
      this.alert.show(this.messages.error.title, error, this.states.error.exact)
    });
  }

  private gestos(){
    if(!this.interval){
      
      this.gesturesElement.forEach(objeto => {
        this.setAnimation(objeto);
      })
      this.interval = setInterval(() => {
        this.gesturesElement.forEach(objeto => {
          this.setAnimation(objeto);
        })
      }, 4500)
    }
    else{
      clearInterval(this.interval);
      this.interval = undefined;
      setTimeout(() => {
        document.getElementById(this.gesturesElement[0].elemento)
      .setAttribute("style", "opacity: 1;");
      }, 4000);
    }
  }

  private setAnimation(objeto){
    document.getElementById(objeto.elemento).setAttribute("style", `animation: ${objeto.animacion}; ${objeto.otro}`);

    setTimeout(() => {
      document.getElementById(objeto.elemento).setAttribute("style", `${objeto.otro}`);
    }, 4000);
  }

  private setScroll(event){
    this.btnTop = event.detail.scrollTop > 0;
    if(event.detail.scrollTop < 60){
      this.deviceService.scroll.emit(false)
    }
    else{
      this.deviceService.scroll.emit(true)
    }
  }

  ngOnDestroy() {
    this.deviceService.scroll.emit(false);
    if(this.interval){
      this.gestos()
    }
  }
}
