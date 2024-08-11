import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import CaseByDate from '../../interfaces/casebydate';
import { Results } from '../../types/shared-types';

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  #http = inject(HttpClient);   

  #data = signal<Results>({
    value: [],
    isLoading: false
  });  

  constructor() {    
     this.getAllCases(true);
  }

  getDataValue(): CaseByDate[]{
    return this.#data().value;
  }

  getDataSize(): number{
    return this.#data().value.length;
  } 

  isCurrentLoading(): boolean{
    return this.#data().isLoading;
  } 

  updateData(val:CaseByDate[],loading:boolean): void{
    this.#data.update(values => {
      let result: Results = values;
      result.value = val; 
      result.isLoading = loading;     
      return {...result};
    });
  }

  setDateByDateRange(startDate:string,endDate:string): void{
    let startDateFormated = startDate.replaceAll(':','%3A');
    let endDateFormated = endDate.replaceAll(':','%3A');          
    this.#http.get<CaseByDate[]>(`https://biostatistics.salud.pr.gov/cases/covid-19/grouped-by-earliest-positive-diagnostic-date?StartDate=${startDateFormated}&EndDate=${endDateFormated}`)
              .subscribe(res =>  this.updateData(res,false));
  }

  getAllCases(withSpinner: boolean): void{
    if (withSpinner) {
      this.updateData([],true);
    }    
    this.#http.get<CaseByDate[]>('https://biostatistics.salud.pr.gov/cases/covid-19/grouped-by-earliest-positive-diagnostic-date')
             .subscribe(res => {
              this.updateData(res,false)});
  }

 
}
