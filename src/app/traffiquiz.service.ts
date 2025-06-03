import { Injectable, inject} from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraffiquizService {

  private apiUrl = 'http://localhost:84/allankayz/api.php';
  private http: HttpClient = inject(HttpClient);
  
  login (payload: any):Observable<any> {
    return this.http.get(this.apiUrl);
  }
}
