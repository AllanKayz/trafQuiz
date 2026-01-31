import { Injectable, inject } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Conversation, Message } from '../../trafquiz';
import { TraffiquizService } from '../../traffiquiz.service';

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private mainService = inject(TraffiquizService);

  getConversations(): Observable<Conversation[]> {
    const userId = this.mainService.currentUser()?.id;
    return from(window.electronAPI.invoke('get-conversations', { userId })).pipe(
      map((res: any) => {
        if (res.success) return res.data as Conversation[];
        return [] as Conversation[];
      }),
      catchError(() => of([] as Conversation[]))
    );
  }

  getMessages(conversationId: number): Observable<Message[]> {
    return from(window.electronAPI.invoke('get-messages', { conversationId })).pipe(
      map((res: any) => {
        if (res.success) return res.data as Message[];
        return [] as Message[];
      }),
      catchError(() => of([] as Message[]))
    );
  }

  sendMessage(conversationId: number | null, text: string, type: string = 'text', attachment: any = null, recipientId: number | null = null): Observable<any> {
    const user = this.mainService.currentUser();
    const senderName = user?.name || (user?.firstName ? `${user.firstName} ${user.lastName}` : (user?.username || 'User'));
    const body = {
      conversationId,
      text,
      type,
      attachment,
      recipientId,
      senderId: user?.id,
      senderName: senderName
    };
    return from(window.electronAPI.invoke('send-message', body));
  }

  uploadAttachment(file: File): Observable<any> {
    const reader = new FileReader();
    return new Observable(observer => {
      reader.onload = () => {
        const buffer = reader.result;
        from(window.electronAPI.invoke('upload-attachment', {
          name: file.name,
          type: file.type,
          data: buffer
        })).subscribe(res => {
          observer.next(res);
          observer.complete();
        }, err => observer.error(err));
      };
      reader.onerror = (err) => observer.error(err);
      reader.readAsArrayBuffer(file);
    });
  }

  getRecipientInfo(id: number): Observable<any> {
    // Fetch user info from UserModel via IPC
    return from(window.electronAPI.invoke('get-user-info', { id }));
  }

  markAsRead(conversationId: number): Observable<any> {
    const userId = this.mainService.currentUser()?.id;
    return from(window.electronAPI.invoke('mark-messages-read', { conversationId, userId }));
  }
}
