import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import CaseByDate from '../../interfaces/casebydate';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  #http = inject(HttpClient);   

  #data = signal<CaseByDate[]>([]) ;

  constructor() { 
    this.#http.get<CaseByDate[]>('https://biostatistics.salud.pr.gov/cases/covid-19/grouped-by-earliest-positive-diagnostic-date')
             .subscribe(res => this.#data.update(value => [...res] )  );    
  }

  getDataValue(): CaseByDate[]{
    return this.#data();
  }

  getDataSize(): number{
    return this.#data().length;
  }
}
