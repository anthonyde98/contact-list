import { Component, Input, OnInit } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { ICONS } from 'src/app/constants/icons.constants';

@Component({
  selector: 'app-btn-top',
  templateUrl: './btn-top.component.html',
  styleUrls: ['./btn-top.component.scss'],
})
export class BtnTopComponent implements OnInit {

  @Input() private content: IonContent;
  private icons = ICONS;

  constructor() { }

  ngOnInit() {}

  private goToTop(){
    this.content.scrollToTop(400);
  }
}
