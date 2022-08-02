import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Contacto, ContactoService } from 'src/app/services/contacto.service';
import { ToastService } from 'src/app/services/toast.service';
import { Clipboard } from '@capacitor/clipboard';
import { DeviceService } from 'src/app/services/device.service';
import { CacheService } from 'src/app/services/cache.service';
import { ConnectivityProvider } from 'src/app/providers/connectivity.provider';
import { ICONS } from 'src/app/constants/icons.constants';
import { ROUTES } from 'src/app/constants/routes.constants';
import { EMPTY, INFO, MESSAGES, STATES } from 'src/app/constants/global.constants';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  private contacto: Contacto;
  private id: string;
  private icons = ICONS;
  private routes = ROUTES;
  private empty = EMPTY;
  private messages = MESSAGES;
  private states = STATES;
  private info = INFO;
  
  constructor(private rutaActiva: ActivatedRoute, private contactoService: ContactoService,
    private toast: ToastService, private router: Router, private deviceService: DeviceService,
    private cacheService: CacheService, private conn: ConnectivityProvider) {
    this.id = this.rutaActiva.snapshot.paramMap.get('id');

    this.contacto = {
      nombre: this.empty,
      relacion: this.empty,
      numeros: [this.empty],
      color: this.empty,
      descripcion: this.empty,
      correo: this.empty
    }
   }

  async ngOnInit() {
    let status = await this.conn.getNetWorkStatus();
    if(!status.connected)
    {
      await this.getContactoFromCache();
    }
    else{
      await this.getContacto();
    }
  }

  ngAfterViewInit(){
    setTimeout(() => {
      this.deviceService.scroll.emit(false);
    }, 100);
  }

  private async getContacto(){
    this.contactoService.obtenerContacto(this.id).then((contacto: Contacto) => {
      if(contacto){
        this.contacto = contacto;
      }
      else{
        this.toast.show(this.messages.error.couldntGetContactInformation, this.states.error.result, 3000);
        this.router.navigateByUrl(this.routes.barraRoutes.list, {replaceUrl: true})
      }
    })
  }

  private async getContactoFromCache(){
    this.cacheService.getContacto(this.id).then((contacto: Contacto) => {
      if(contacto){
        this.contacto = contacto;
      }
      else{
        this.toast.show(this.messages.error.couldntGetContactInformation, this.states.error.result, 3000);
        this.router.navigateByUrl(this.routes.barraRoutes.list, {replaceUrl: true})
      }
    })
  }

  async clipboard(text, id, tipo?){
    document.getElementById(id).setAttribute("style", "width:max-content; padding: 2px; box-shadow: 0 1px 1px rgba(0,0,0,0.400); border-radius: 5px; background-color: rgb(152, 180, 212, 0.500)");
    setTimeout(() => {
      document.getElementById(id).removeAttribute("style");
    }, 4000);
    if(tipo == this.info.contacto.numeros.singular)
      this.toast.showOptionNumberCopy(this.messages.info.wannaCall, this.states.info.result, 4000, text);
    else if(id == this.info.contacto.correo)
      this.toast.showOptionCorreoCopy(this.messages.info.wannaMail, this.states.info.result, 4000, text);
    else
      this.toast.show(this.messages.info.textCopied, this.states.info.result, 4000)

    await Clipboard.write({
      string: text
    });
  }

  private setScroll(event){
    if(event.detail.scrollTop < 60){
      this.deviceService.scroll.emit(false)
    }
    else{
      this.deviceService.scroll.emit(true)
    }
  }

  ngOnDestroy() {
    this.deviceService.scroll.emit(false);
  }
}
