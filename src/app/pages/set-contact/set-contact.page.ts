import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectivityProvider } from 'src/app/providers/connectivity.provider';
import { CacheService } from 'src/app/services/cache.service';
import { Contacto, ContactoService } from 'src/app/services/contacto.service';
import { DeviceService } from 'src/app/services/device.service';
import { ToastService } from 'src/app/services/toast.service';
import { ICONS } from 'src/app/constants/icons.constants';
import { ROUTES } from 'src/app/constants/routes.constants';
import { COLORS, EMPTY, INFO, MESSAGES, STATES } from 'src/app/constants/global.constants';

@Component({
  selector: 'app-set-contact',
  templateUrl: './set-contact.page.html',
  styleUrls: ['./set-contact.page.scss'],
})
export class SetContactPage implements OnInit {
  private icons = ICONS;
  private routes = ROUTES;
  private info = INFO;
  private empty = EMPTY;
  private colors = COLORS; 
  private messages = MESSAGES;
  private states = STATES; 
  private id: string;
  private colores = [
    this.colors.grey.light, this.colors.red.dark, this.colors.orange, 
    this.colors.blue.light, this.colors.green.light, this.colors.yellow, 
    this.colors.green.dark, this.colors.blue.dark, this.colors.pink, 
    this.colors.red.light, this.colors.purple, this.colors.grey.dark
  ];
  private relacion = [
    {id: this.info.contacto.relaciones.familiar.key, nombre: this.info.contacto.relaciones.familiar.value}, 
    {id: this.info.contacto.relaciones.amistad.key, nombre: this.info.contacto.relaciones.amistad.value}, 
    {id: this.info.contacto.relaciones.conocido.key, nombre: this.info.contacto.relaciones.conocido.value}, 
    {id: this.info.contacto.relaciones.trabajo.key, nombre: this.info.contacto.relaciones.trabajo.value},
    {id: this.info.contacto.relaciones.otro.key, nombre: this.info.contacto.relaciones.otro.value}
  ];
  private relacionSelected = this.relacion[0].nombre;
  private colorDefault = this.empty;
  private colorSelected = this.empty;
  private contactForm: FormGroup;
  private accion = this.empty;        

  constructor(private fb: FormBuilder, private toast: ToastService, private rutaActiva: ActivatedRoute,
    private contactoService: ContactoService, private router: Router, private connectivity: ConnectivityProvider,
    private deviceService: DeviceService, private cacheService: CacheService) {
    this.id = this.rutaActiva.snapshot.paramMap.get('id');
    this.accion = this.id ? "Editar" : "Agregar";
    this.contactForm = this.fb.group({
      nombre: [this.empty, [Validators.required]],
      descripcion: [this.empty, [Validators.required]],
      numeros: this.fb.array([this.crearInputTelefono()]),
      correo: [this.empty, [Validators.required, Validators.email]]
    })
  }

  async ngOnInit() {
    await this.setForm();
  }

  ngAfterViewInit(){
    this.deviceService.scroll.emit(false);
  }

  private async setContacto(){
    const info: Contacto = this.contactForm.value;
    info.relacion = this.relacionSelected;
    info.color = this.colorSelected;

    let net = await this.connectivity.getNetWorkStatus()

    if(this.id){
      await this.editarContacto(net, info);
    }
    else{
      await this.agregarContacto(net, info);
    }

    this.deviceService.scroll.emit(false)
    this.router.navigateByUrl(this.routes.barraRoutes.list, { replaceUrl: true })
  }
  
  private setDatosEdit(contacto) {
    if(contacto){
      for(let i = 1; i < contacto.numeros.length; i++)
      {
        this.agregarInputTelefono();
      }

      this.contactForm.patchValue({
        nombre: contacto.nombre,
        descripcion: contacto.descripcion,
        numeros: contacto.numeros,
        correo: contacto.correo,
      })
      
      this.relacionSelected = contacto.relacion;
      this.colorDefault = contacto.color;
      this.colorSelected = this.colorDefault;
    }
    else{
      this.toast.show(this.messages.error.couldntGetContactInformation, this.states.error.exact, 3000);
      this.router.navigateByUrl(this.routes.barraRoutes.list, {replaceUrl: true})
    }
  }

  private async agregarContacto(network, contacto){
    if(!network.connected){
      let response = await this.cacheService.saveContacto(contacto);
      let response2;
      
      if(response){
        contacto.id = await this.deviceService.createRandomDataId();
        contacto.status = true;
        contacto.fecha = this.contactoService.FirestoreFormatDate();
        contacto.groupId = this.contactoService.getToken();
        response2 = await this.cacheService.saveContactoOffline(contacto);
      }
      
      if(response && response2){
        this.toast.show(this.messages.success.contactAddedOffline, this.states.success.exact, 3000);  
        this.deviceService.changeView.emit(true);
      }
      else{
        this.toast.show(this.messages.error.errorAddingContact, this.states.error.result, 3000);
      }
    }
    else{
      await this.contactoService.agregarContacto(contacto);
      this.toast.show(this.messages.success.contactAddedOnline, this.states.success.exact, 3000);
    }
  }

  private async editarContacto(network, contacto){
    if(!network.connected){
      let response = await this.cacheService.editContacto(this.id, contacto);
      let response2;
      
      if(response){
        response2 = await this.cacheService.editContactoOffline(this.id, contacto);
      }

      if(response && response2){
        this.toast.show(this.messages.success.contactEditedOffline, this.states.success.exact, 3000);
        this.deviceService.changeView.emit(true);
      }
      else{
        this.toast.show(this.messages.error.errorEditingContact, this.states.error.result, 3000);
      }
    }
    else{
      await this.contactoService.actualizarContacto(contacto, this.id);
      this.toast.show(this.messages.success.contactEditedOnline, this.states.success.exact, 3000);
    }
  }

  private async setForm(){
    let status = await this.connectivity.getNetWorkStatus();

    if(this.id){
      if(!status.connected)
      {
        this.cacheService.getContacto(this.id).then((contacto: Contacto) => {
          this.setDatosEdit(contacto)
        })
      }
      else{
        this.contactoService.obtenerContacto(this.id).then((contacto: Contacto) => {
          this.setDatosEdit(contacto)
        })
      }
    }
    else{
      this.colorDefault = this.colores[0];
      this.colorSelected = this.colorDefault;
    }
  }
  
  private get contactFormGroups() {
    return this.contactForm.get(this.info.contacto.numeros.plural) as FormArray
  }

  private crearInputTelefono(): FormGroup{
    return new FormGroup({
      numero: new FormControl(this.empty, [Validators.pattern(/[8][0|2|4][9][0-9]{7}$/), Validators.required])
    })
  }

  private agregarInputTelefono(){
    const numeros = this.contactForm.get(this.info.contacto.numeros.plural) as FormArray;
    numeros.push(this.crearInputTelefono());
  }

  private eliminarInputTelefono(i: number){
    const numeros = this.contactForm.get(this.info.contacto.numeros.plural) as FormArray;
    if(numeros.length > 1){
      numeros.removeAt(i);
    }
    else{
      numeros.reset();
    }
  }

  private changeSelectValue(value){
    this.relacionSelected = value;
  }

  private getColorValue(value){
    this.colorSelected = value;
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

  /*private fixedKeyboardBug(){
    let mb;

    Keyboard.addListener('keyboardWillShow', (info: any) => {
      mb = document.getElementById("content").style.marginBottom;
      document.getElementById("content").style.marginBottom = info.keyboardHeight + "px";
    });
    
    Keyboard.addListener('keyboardWillHide', () => {
      document.getElementById("content").style.marginBottom = mb;
    });
  }*/

}
