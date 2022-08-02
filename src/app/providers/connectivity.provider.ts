import { Injectable } from '@angular/core';
import { ConnectionStatus } from '@capacitor/network';
import { Network } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConnectivityProvider {
  private status = new BehaviorSubject<ConnectionStatus>(null);

  constructor() {
    Network.addListener("networkStatusChange", (status) => {
      this.sendStatusChangeMsg(status);
    });
  }

  public async getNetWorkStatus() {
    return await Network.getStatus();
  }
  
  public getStatus(): Observable<ConnectionStatus> {
    return this.status.asObservable();
  }

  private sendStatusChangeMsg(status: ConnectionStatus): void {
    this.status.next(status);
  }

    
}