import { Component, OnInit } from '@angular/core';
import { STATES } from 'src/app/constants/global.constants';
import { ICONS } from 'src/app/constants/icons.constants';
import { ConnectivityProvider } from 'src/app/providers/connectivity.provider';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private net: any;
  private icons = ICONS;
  private states = STATES;

  constructor(private conn: ConnectivityProvider) {
    this.net = {name: "", color: ""}
   }

  async ngOnInit() {
    let data = await this.conn.getNetWorkStatus();
    this.net.name = data.connected ? this.icons.global.cloud.online : this.icons.global.cloud.offline;
    this.net.color = data.connected ? this.states.success.exact : this.states.error.result;
    this.getConnection();
  }

  getConnection(){
    this.conn.getStatus().subscribe(data => {
      this.net.name = data === null ? this.net.name : data.connected ? this.icons.global.cloud.online : this.icons.global.cloud.offline;
      this.net.color = data === null ? this.net.color : data.connected ? this.states.success.exact : this.states.error.result;
    })
  }
}
