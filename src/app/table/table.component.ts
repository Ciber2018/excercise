import { Component, inject } from '@angular/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import { ApiService } from '../services/api/api.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatProgressSpinner,CommonModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
}) 
export class TableComponent {
  public covidCases = inject(ApiService);
  
  constructor(){    
    
  }
}
