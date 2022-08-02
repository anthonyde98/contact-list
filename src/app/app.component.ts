import { Component, HostListener } from '@angular/core';
import { App } from '@capacitor/app';
import { DeviceService } from './services/device.service';
import { BackButtonEvent} from '@ionic/angular';
import { Router } from '@angular/router';
import { CacheService } from './services/cache.service';
import { AuthService } from './services/auth.service';
import { ROUTES } from './constants/routes.constants';
import { GLOBAL } from './constants/global.constants';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  private global = GLOBAL;
  private routes = ROUTES;

  constructor(private deviceService: DeviceService, private router: Router, private cacheService: CacheService,
    private auth: AuthService) {
  }

  async ngOnInit(){
    this.headerDisplay();
    this.handlerState()
    this.handlerBackButton();
    let value = await this.deviceService.getConfigAIO();

    if(value == 'true'){
      await this.fingerPrintAuth()
    }
    else{
      await this.getToken()
    }
  }
  
  private headerDisplay(){
    this.deviceService.scroll.subscribe(scroll => {
      let style = `display: ${scroll ? "none" : "block"};`
      document.getElementById("header").setAttribute("style", style);
    })
    
  }

  private async fingerPrintAuth() {
    await this.auth.fingerPrintAuth();
  }

  private async getToken(){
    await this.auth.tokenAuth();
  }

  private handlerBackButton(){
    document.addEventListener(this.global.events.backBtnHandler, (ev: BackButtonEvent) => {
      const path = location.pathname;
      ev.detail.register(-1, () => {
        if(path == this.routes.barraRoutes.list || path == this.routes.normalRoutes.index){
          this.cacheService.getDataFromFirestore()
          App.minimizeApp();
        }
        else{
          this.deviceService.scroll.emit(false)
          document.getElementById("header").removeAttribute("style");
          this.router.navigateByUrl(this.routes.barraRoutes.list, { replaceUrl: true });
        }
      })
    })
  }

  private handlerState(){
    App.addListener('appStateChange', ({ isActive }) => {
      if(!isActive){
        this.cacheService.getDataFromFirestore();
      }
    });
  }

}

