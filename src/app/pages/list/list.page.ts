import { Component, ElementRef, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, GestureController, IonCard, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { ConnectivityProvider } from 'src/app/providers/connectivity.provider';
import { CacheService } from 'src/app/services/cache.service';
import { Contacto, ContactoService } from 'src/app/services/contacto.service';
import { DeviceService } from 'src/app/services/device.service';
import { ToastService } from 'src/app/services/toast.service';
import { ICONS } from 'src/app/constants/icons.constants';
import { ROUTES } from 'src/app/constants/routes.constants';
import { EMPTY, GESTURES, GLOBAL, INFO, KEYS, MESSAGES, STATES } from 'src/app/constants/global.constants';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  private icons = ICONS;
  private routes = ROUTES;
  private empty = EMPTY;
  private info = INFO;
  private keys = KEYS;
  private global = GLOBAL;
  private gesturesConst = GESTURES;
  private messages = MESSAGES;
  private states = STATES;
  private busquedaCard = false;
  private btnTop = false;
  private filtro = this.empty;
  private radioSelected: string = this.info.contacto.nombre;
  private noContactos = true;
  private internetBefore = false;
  private noInternetCardUsing: any;
  private scrollPosition: number = 0;

  @ViewChild(IonContent) private content: IonContent;
  @ViewChildren(IonCard, {read: ElementRef}) private cards: QueryList<ElementRef>;

  private contactos: Observable<Contacto[]> 

  constructor(private gestureCtrl: GestureController, private router: Router,
    private contactoService: ContactoService, private toast: ToastService,
    private load: LoadingController, private deviceService: DeviceService,
    private connectivity: ConnectivityProvider, private cacheService: CacheService,
    private renderer: Renderer2) {}

  async ngOnInit() {
    const load = await this.load.create();
    await load.present()
    
    let intervalId = setInterval(async () => {
      let status = await this.connectivity.getNetWorkStatus()
      if(this.contactoService.getToken().length > 0){
        if(!status.connected){
          this.getContactosFromCache();
          load.dismiss().then(() => {
            this.contactos.subscribe(contactos => {
              this.afterNoInternet();
            })
            clearInterval(intervalId);
          })
        }
        else{
          await this.subirDatos();
          this.getContactos();
          load.dismiss().then(() => {
            this.after();
            this.cacheService.getDataFromFirestore();
            clearInterval(intervalId);
          })
        }
        this.changeNoInternetView();
      }
    }, 500)

    this.connectivity.getStatus().subscribe(async (data) => {
      let status = await this.connectivity.getNetWorkStatus();
      if(data){
        if(status.connected){
          if(!this.internetBefore){
            await this.subirDatos();
            let intervalId = setInterval(async () => {
              const path = location.pathname;
              if(path == this.routes.barraRoutes.list || path == this.routes.normalRoutes.index){
                status = await this.connectivity.getNetWorkStatus();
                if(data && status.connected){
                  this.getContactosConFiltro();
                  this.internetBefore = true
                  clearInterval(intervalId);
                }
              }
            })
          }
        }
        else{
          if(this.internetBefore){
            this.cacheService.getDataFromFirestoreAfterNoInternet()
            let intervalId = setInterval(async () => {
              const path = location.pathname;
              if(path == this.routes.barraRoutes.list || path == this.routes.normalRoutes.index){
                status = await this.connectivity.getNetWorkStatus();
                if(data && !status.connected && this.internetBefore){
                  this.getContactosFromCache().subscribe(contactos => {
                    setTimeout(() => {
                      this.afterNoInternet();
                    }, 1000);
                  });
                  this.internetBefore = false;
                  clearInterval(intervalId);
                }
              }
            })
          }
        }
      }
    })

    let status = await this.connectivity.getNetWorkStatus();
    this.internetBefore = status.connected;
  }

  private async subirDatos(){
    let isThereAnyData = await this.cacheService.isThereAnyData();

    if(isThereAnyData.accion){
      for (let position of isThereAnyData.positions) {
        console.log(position)
        switch(position){
          case 0: 
            let saveContactos = await this.cacheService.getSaveContactos();
            console.log(saveContactos)
            let cantidadSaveContactos = saveContactos.length;
            for (let i = 0; i < cantidadSaveContactos; i++){
              let net = await this.connectivity.getNetWorkStatus();
              if(net.connected){
                await this.contactoService.agregarContacto(saveContactos[i]);
                saveContactos.splice(i, 1);
                cantidadSaveContactos--;
                i--;
              }
            }
            await this.cacheService.setStorageVariable(this.keys.saveContactos, saveContactos);
            break;
          case 1:
            let editContactos = await this.cacheService.getEditContactos();
            let cantidadEditContactos = editContactos.length;
            for (let i = 0; i < cantidadEditContactos; i++){
              let net = await this.connectivity.getNetWorkStatus();
              if(net.connected){
                await this.contactoService.actualizarContacto(editContactos[i].contacto, editContactos[i].id);
                editContactos.splice(i, 1);
                cantidadEditContactos--;
                i--;
              }
            }
            await this.cacheService.setStorageVariable(this.keys.editContactos, editContactos);
            break;
          case 2:
            let deleteContactos = await this.cacheService.getDeleteContactos(); 
            console.log(deleteContactos)
            let cantidadDeleteContactos = deleteContactos.length;   
            for (let i = 0; i < deleteContactos.length; i++){
              let net = await this.connectivity.getNetWorkStatus();
              if(net.connected){
                await this.contactoService.actualizarContacto({status: false}, deleteContactos[i]);
                deleteContactos.splice(i, 1);
                cantidadDeleteContactos--;
                i--;
              }
            }
            await this.cacheService.setStorageVariable(this.keys.deleteContactos, deleteContactos);
            break;
        }
      }
    }
  }

  private async busqueda(){
    let net = await this.connectivity.getNetWorkStatus();

    if(net.connected){
      this.getContactosConFiltro();
    }
    else{
      await this.getContactosFromCacheConFiltro();
    }
  }

  private selectRadio(type){
    this.radioSelected = type;
  }

  private changeNoInternetView(){
    this.deviceService.changeView.subscribe(change => {
      if(change){
        this.getContactosFromCache().subscribe(contactos => {
          setTimeout(() => {
            console.log(contactos)
            this.afterNoInternet();
            this.deviceService.changeView.emit(false);
          }, 1000);
        });
      }
    })
  }

  private after(){
    this.contactos.subscribe(contactos => {
      let interval = setInterval(() => {
        const path = location.pathname;
        if(path == this.routes.barraRoutes.list || path == this.routes.normalRoutes.index){
          const cardArray = this.cards.toArray();
          this.gestures(cardArray);

          this.noContactos = contactos.length === 0;
          this.cacheService.getDataFromFirestore();
          clearInterval(interval)
        }
      })
    })
  }

  private afterNoInternet(){
    this.contactos.subscribe(contactos => {
      const cardArray = this.cards.toArray();
      this.setCajaBtnsClick(cardArray);
      this.noContactos = contactos.length === 0;
    })
  }

  private getContactosFromCache(){
    return this.contactos = this.cacheService.getContactos();
  }

  private getContactos(){
    this.contactos = this.contactoService.obtenerContactos();
  }

  private getContactosConFiltro(){
    this.contactos = this.contactoService.obtenerContactosConFiltro({
      nombre: this.radioSelected,
      dato: this.filtro
    });

    this.contactos.subscribe(contactos => {
      this.after();
    });
  }

  private getContactosFromCacheConFiltro(){
    this.contactos = this.cacheService.getContactosConFiltro({
      nombre: this.radioSelected,
      dato: this.filtro
    });

    this.contactos.subscribe(contactos => {
      setTimeout(() => {
        this.afterNoInternet();
      }, 500);
    });
  }

  private gestures(cardArray){
    for(let i = 0; i < cardArray.length; i++){
      const card = cardArray[i];

      const gestureX = this.gestureCtrl.create({
        el: card.nativeElement,
        gestureName: this.gesturesConst.list.principal.name,
        onMove: ev => {
          if(ev.deltaX > 0){
            card.nativeElement.style.transform = `translate(${ev.deltaX}px)`;
            setCardOpacity(ev.deltaX, card.nativeElement);
          }
        },
        onEnd: ev => {
          card.nativeElement.style.transition = this.gesturesConst.list.principal.transition;

          if(ev.deltaX > 130){
            this.eliminarContacto(card.nativeElement.id);
          }
          else if(ev.deltaX < -80){
            card.nativeElement.style.animation = this.gesturesConst.config.animations.shake;
            setTimeout(() => {
              this.realizarLlamada(this.removePhoneFormat(card.nativeElement.lastChild.lastChild.lastChild.innerText));
              reset(card);
            }, 400);
          }
          else{
            reset(card);
          }
        }
      }, true);
    
      gestureX.enable();
    }
    const reset = (card) => {
      card.nativeElement.style.transform = this.empty;
      card.nativeElement.style.animation = this.empty;
      card.nativeElement.style.opacity = 1;
    }

    const setCardOpacity = (x, card) => {
      const abs = Math.abs(x);
      const min = Math.min((abs/150), 1)
      const opacity = 1 - min;

      card.style.opacity = opacity;
    }
  }

  private setScroll(event){
    this.scrollPosition = event.detail.scrollTop;
    this.btnTop = event.detail.scrollTop > 0;
    if(event.detail.scrollTop < 60){
      this.deviceService.scroll.emit(false)
    }
    else{
      this.deviceService.scroll.emit(true)
    }
  }

  private goToTop(){
    this.content.scrollToTop(500);
  }

  private click: number = 0;
  private eventGo(i, id){
    this.click++;

    setTimeout(async () => {
      if(this.click == 1){
        this.click = 0;
        let net = await this.connectivity.getNetWorkStatus();
        if(!net.connected){
          this.crearCajaOpcionesNoInternet(this.cards.toArray()[i]);
        }
        else{
        this.cards.toArray()[i].nativeElement.style.animation = this.gesturesConst.list.principal.animation.detail;
        setTimeout(() => { 
          this.deviceService.scroll.emit(false);
          this.router.navigateByUrl(`${this.routes.normalRoutes.detail}/${id}`).finally(() => {
            setTimeout(() => {
              this.cards.toArray()[i].nativeElement.style.animation = this.empty;
            }, 500);
          });
        }, 200);
        }
      }
      else{
        this.cards.toArray()[i].nativeElement.style.animation = this.gesturesConst.list.principal.animation.setContact;
        this.click = 0;
        setTimeout(() => { 
          this.deviceService.scroll.emit(false);
          this.router.navigateByUrl(`${this.routes.normalRoutes.setContact}/${id}`).finally(() => { 
            setTimeout(() => {
              this.cards.toArray()[i].nativeElement.style.animation = this.empty;
            }, 500);
          });
        }, 200);
      }
    }, 300);
  }

  private removeOpciones(){
    this.noInternetCardUsing.card.nativeElement.lastChild.lastChild.remove();
    clearTimeout(this.noInternetCardUsing.timeOut);
    this.noInternetCardUsing = null;
  }

  private crearCajaOpcionesNoInternet(card){
    if(this.noInternetCardUsing) {
      if(this.noInternetCardUsing.card !== card){
        this.removeOpciones(); 
      }
      else{
        return;
      }
    }

    let styleBtnContainer = 
    `background-color: rgba(240, 248, 255, 0.234);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.400);
    padding: 4px;
    margin-top: 5px;
    border-radius: 20px;
    display: flex;
    flex-wrap: wrap;`;

    const opcionesContenedor = document.createElement("div");
    opcionesContenedor.id = "btn-opciones";
    opcionesContenedor.setAttribute("style", styleBtnContainer);
    
    let styleBtns = 
    `flex-grow: 1;
    margin: 0 2.5px;
    height: 17px;
    width: 17px;
    padding: 7.5px 0;
    border-radius: 30px;
    background-color: rgba(240, 248, 255, 0.234);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.400);`;

    opcionesContenedor.innerHTML = 
    `<ion-icon id='llamar' style='${styleBtns + 'color: green'}' data-numero=
    ${this.removePhoneFormat(card.nativeElement.lastChild.lastChild.lastChild.innerText)} name="call"></ion-icon>
    <ion-icon id='detalle' style='${styleBtns + 'color: rgb(43, 107, 209)'}' data-id=${card.nativeElement.id} name="person"></ion-icon>
    <ion-icon id='borrar' style='${styleBtns + 'color: rgba(195, 63, 63, 0.815)'}' data-id=${card.nativeElement.id} name="trash"></ion-icon>`

    card.nativeElement.lastChild.append(opcionesContenedor);

    const timeOut = setTimeout(() => {
      this.removeOpciones(); 
    }, 5000);

    this.noInternetCardUsing = {card: card, timeOut:timeOut};
  }

  private setCajaBtnsClick(cards){
    cards.forEach(card => {
      this.renderer.listen(card.nativeElement, this.global.events.click, ($event: any) => this.checkBtnsClick($event)); 
    });
  }

  private checkBtnsClick($event: any){
    if($event.target.id === this.global.btnAccions.call){
      this.noInternetCardUsing.card.nativeElement.style.animation = this.gesturesConst.config.animations.shake;
      setTimeout(() => {
        this.noInternetCardUsing.card.nativeElement.style.animation = this.empty;
        this.realizarLlamada(this.removePhoneFormat($event.target.dataset.numero));
        this.removeOpciones(); 
      }, 700);
    }
    else if($event.target.id === this.global.btnAccions.detail){
      this.deviceService.scroll.emit(false);
      this.noInternetCardUsing.card.nativeElement.style.animation = this.gesturesConst.list.principal.animation.detail;
      setTimeout(() => {
        this.noInternetCardUsing.card.nativeElement.style.animation = this.empty;
        this.removeOpciones(); 
        this.router.navigateByUrl(`${this.routes.normalRoutes.detail}/${$event.target.dataset.id}`);
      }, 500);
    }
    else if($event.target.id === this.global.btnAccions.delete){
      this.noInternetCardUsing.card.nativeElement.style.animation = this.gesturesConst.list.principal.animation.delete;
      setTimeout(async () => { 
        await this.eliminarContacto($event.target.dataset.id);
      }, 100);
    }
  }

  private async eliminarContacto(id: string){
    let status = await this.connectivity.getNetWorkStatus();
    let response = true;
    if(!status.connected){
      response = await this.cacheService.deleteContacto(id);
      let response2;

      if(response){
        response2 = await this.cacheService.deleteOrRecoverContacto(id, false);
      }

      if(!response || !response2){
        response = false;
      }
      else{
        this.deviceService.changeView.emit(true);
        setTimeout(() => {
        this.removeOpciones();
        }, 500);
      }
    }
    else{
      this.contactoService.actualizarContacto({status: false}, id);
    }

    if(response){
      this.toast.showOptionRecover(this.messages.info.wannaRecoverContact, this.states.info.result, 4000, id);
    }
    else{
      this.toast.show(this.messages.error.title, this.states.error.result, 3000);
    }
  }

  private realizarLlamada(numero){
    window.open(`tel:${numero}`);
  }

  private removePhoneFormat(numero){
    return numero.replace(/[^0-9]/g, this.empty);
  }
}