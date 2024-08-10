import { Component, computed, inject, signal } from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule,MatDatepickerInputEvent} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ApiService } from '../services/api/api.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatProgressSpinner,CommonModule,MatButtonModule,MatDatepickerModule,MatFormFieldModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
}) 
export class TableComponent {
  public covidCases = inject(ApiService);
  pageSize: number = 10;
  currentPage = signal(1);
  dataByPage = computed(()=>{
    let startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.covidCases.getDataValue().slice(startIndex,startIndex + this.pageSize);
  });

  rangeDate = signal<Date[]>([]);
  
  constructor(){    
                
  }

  next(){
    this.currentPage.update(page => page + 1);
  }

  prev(){
    this.currentPage.update(page => page - 1);
  }

  getDataByRangeDate(target:string, event: MatDatepickerInputEvent<Date>){     
    if (event.value !== null) {
      let value: Date = event.value as Date;
      this.rangeDate.update(range => [...range,value]);
    }        
    if (this.rangeDate().length == 2) {
      let diff = this.rangeDate()[1].getTime() - this.rangeDate()[0].getTime();     
      if (diff < 0) {       
        this.rangeDate.update(range => {
          let result: Date[] = range;
          result.shift();
          return [...result];
        });        
      }else{
        const week = 1000 * 60 * 60 * 24 * 7;
        if (diff > week) {
          alert("You can only select a week's worth of date at a time");
        } else {
          this.covidCases.setDateByDateRange(this.rangeDate()[0].toISOString(),this.rangeDate()[1].toISOString());
        }          
        
        this.rangeDate.update(range => []); 
      }     
               
    }  

  }

}
