import { Pipe, PipeTransform } from '@angular/core';
import { EMPTY } from 'src/app/constants/global.constants';
  
@Pipe({
  name: 'phoneFormat'
})
export class PhoneFormatPipe implements PipeTransform {
  private empty = EMPTY;
  
  transform(number = this.empty) {
    let formated = "(";
    
    formated += number.slice(0,3) + ") " + number.slice(3,6) + "-" + number.slice(6);
    return formated;
  }
  
} 