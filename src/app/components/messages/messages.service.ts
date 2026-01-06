import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';

export interface Conversation {
  id: number;
  name: string;
  unread?: number;
  lastMessage?: string;
  lastTime?: string;
}

export interface Message {
  id: number;
  conversationId: number;
  from: string;
  to?: string;
  body: string;
  timestamp: string; // ISO
  outgoing?: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 1, name: 'Admin', unread: 2, lastMessage: 'Please confirm schedule', lastTime: new Date().toISOString() },
  { id: 2, name: 'Instructor - Jane', unread: 0, lastMessage: 'Thanks for the update', lastTime: new Date().toISOString() },
  { id: 3, name: 'Student - Mark', unread: 1, lastMessage: 'I missed the lesson', lastTime: new Date().toISOString() }
];

const MOCK_MESSAGES: Record<number, Message[]> = {
  1: [
    { id: 1, conversationId: 1, from: 'Admin', body: 'Welcome to the platform.', timestamp: new Date().toISOString(), outgoing: false },
    { id: 2, conversationId: 1, from: 'You', body: 'Thanks — noted.', timestamp: new Date().toISOString(), outgoing: true }
  ],
  2: [
    { id: 3, conversationId: 2, from: 'Instructor - Jane', body: 'Please see the notes.', timestamp: new Date().toISOString(), outgoing: false },
    { id: 4, conversationId: 2, from: 'You', body: 'Received, thanks.', timestamp: new Date().toISOString(), outgoing: true }
  ],
  3: [
    { id: 5, conversationId: 3, from: 'Student - Mark', body: 'I missed the lesson today.', timestamp: new Date().toISOString(), outgoing: false }
  ]
};

@Injectable({ providedIn: 'root' })
export class MessagesService {
  private baseUrl = 'http://localhost:84/trafQuiz/public/api/';

  constructor(private http: HttpClient) {}

  // Returns the list of conversations. Attempts to fetch from server, falls back to mock.
  getConversations() {
    // Example of real API call (uncomment if server supports it):
    // return this.http.get<Conversation[]>(this.baseUrl + 'conversations').pipe(catchError(() => of(MOCK_CONVERSATIONS)));

    return of(MOCK_CONVERSATIONS).pipe(delay(200));
  }

  // Returns messages for a given conversation id.
  getMessages(conversationId: number) {
    // Real API call example:
    // return this.http.get<Message[]>(this.baseUrl + `conversations/${conversationId}/messages`).pipe(catchError(() => of(MOCK_MESSAGES[conversationId] || [])));

    return of(MOCK_MESSAGES[conversationId] ? [...MOCK_MESSAGES[conversationId]] : []).pipe(delay(200));
  }

  // Sends a message (mock implementation). Returns an observable for the created message or server response.
  sendMessage(conversationId: number, body: string) {
    // Real API: return this.http.post(this.baseUrl + `conversations/${conversationId}/messages`, { body });

    const newMsg: Message = {
      id: Date.now(),
      conversationId,
      from: 'You',
      body,
      timestamp: new Date().toISOString(),
      outgoing: true
    };

    // Update mock store so subsequent getMessages returns it
    if (!MOCK_MESSAGES[conversationId]) MOCK_MESSAGES[conversationId] = [];
    MOCK_MESSAGES[conversationId].push(newMsg);

    return of(newMsg).pipe(delay(150));
  }
}
