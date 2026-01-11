import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Conversation, Message } from '../../trafquiz';
import { TraffiquizService } from '../../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private http = inject(HttpClient);
  private mainService = inject(TraffiquizService);
  private baseUrl = 'http://localhost:84/trafQuiz/public/api/messages';

  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>('http://localhost:84/trafQuiz/public/api/conversations');
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return this.http.get<Message[]>(this.baseUrl, { params: { conversationId: conversationId.toString() } });
  }

  sendMessage(conversationId: number | null, text: string, type: string = 'text', attachment: any = null, recipientId: number | null = null): Observable<any> {
    const body = { conversationId, text, type, attachment, recipientId };
    return this.http.post(this.baseUrl + '/send', body);
  }

  uploadAttachment(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(this.baseUrl + '/upload', formData);
  }

  private getHeaders() {
    const token = localStorage.getItem('token');
    const user = this.mainService.currentUser();
    let headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    if (user?.id) {
      headers = headers.set('X-User-Id', user.id.toString());
    }
    return headers;
  }

  getRecipientInfo(id: number): Observable<any> {
    return this.http.get(this.baseUrl + '/recipient', { params: { id: id.toString() } });
  }
}
