import { Component, computed, inject, signal } from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatButtonModule} from '@angular/material/button';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatFormFieldModule} from '@angular/material/form-field';
import { ApiService } from '../services/api/api.service';
import { CommonModule } from '@angular/common';
import { debounceTime, Subject } from 'rxjs';


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
  totalPage = computed(()=> this.covidCases.getDataSize() <= this.pageSize ? 1 : Math.ceil(this.covidCases.getDataSize() / this.pageSize));
  currentPage = signal(1); 
  dataByPage = computed(()=>{
    let startIndex = (this.currentPage() - 1) * this.pageSize;
    return this.covidCases.getDataValue().slice(startIndex,startIndex + this.pageSize);
  }); 
  rangeDate = signal<Date[]>([]); 
  

  private userDatesInputSubject = new Subject<[string,string]>();
  
  constructor(){   
      this.userDatesInputSubject.pipe(debounceTime(750)).subscribe((param:[string,string])=>{
        if (param[1] == '') {
          this.covidCases.getAllCases(false);
        } else {
          if (!isNaN(new Date(param[1]).getTime())) { 
            this.getDataByRangeDate(param[0],param[1]);
            return;          
          }else{
            alert('Wrong date format');
            return;
          }
        }        
      })       
  }

  next(){
    this.currentPage.update(page => page + 1);
  }

  prev(){
    this.currentPage.update(page => page - 1);
  }

  inputValue(id:string,value: string):void{
      if (this.rangeDate().length == 2) {         
        this.trackDateSelected(id,value);                                    
      } else {
        if (value != null) {
          if (this.rangeDate().filter(item => item.getTime() == new Date(value).getTime()).length == 0) {
            this.rangeDate.update(range => [...range,new Date(value)]);
          }        
        }        
      } 
  }

  trackDateSelected(id:string,value: string):void{
    if (value != null) {
      this.rangeDate.update(range => []);          
      this.rangeDate.update(range => [...range,new Date(value)])
    }

    if (id == 'endDateField') {
      if (value == null) {
        this.rangeDate.update(range => {
          let result: Date[] = range;
          result.pop();
          return [...result];
        });
      } else {
        if (this.rangeDate().filter(item => item.getTime() == new Date(value).getTime()).length == 0) {
          this.rangeDate.update(range => [...range,new Date(value)]);
        }  
      }
    }
  }

  checkDatesDiff(range:Date[]): number{
      return new Date(range[1]).getTime() - new Date(range[0]).getTime() ;
  }

  isDateOrdered():boolean{    
    return new Date(this.rangeDate()[0]).getTime() <= new Date(this.rangeDate()[1]).getTime();    
  }

  getDataByUserInput(id:string,value: string){
    this.userDatesInputSubject.next([id,value]);
  }

  getDataByRangeDate(id:string,value: string){ 
    this.inputValue(id,value); 
    console.log(this.rangeDate());    
    if (this.rangeDate().length == 2) {
      if (!this.isDateOrdered()) {
        this.rangeDate.update(range => {
          let result: Date[] = range;
          result.shift();
          return [...result];
        });
        alert('Wrong selection of dates or dates are incompletes');
      } else {
        if (this.checkDatesDiff(this.rangeDate()) <= (1000 * 60 * 60 * 24 * 7)) {
          this.covidCases.setDateByDateRange(this.rangeDate()[0].toISOString(),this.rangeDate()[1].toISOString());          
        } else {
          alert("You can only select a week's worth of date at a time");
          this.covidCases.updateData([],false);               
        }
      }     
    }
  }

}
