import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MessagesService, Conversation, Message } from './messages.service';

@Component({
    selector: 'app-messages',
    imports: [CommonModule, FormsModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatCardModule],
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.css'
})
export class MessagesComponent {
    private messagesService = inject(MessagesService);

    conversations = signal<Conversation[]>([]);
    selectedConversation = signal<Conversation | null>(null);
    messages = signal<Message[]>([]);
    reply = '';
    loading = signal(false);

    constructor() {
        this.loadConversations();
    }

    loadConversations() {
        this.loading.set(true);
        this.messagesService.getConversations().subscribe(list => {
            this.conversations.set(list);
            this.loading.set(false);
        }, () => this.loading.set(false));
    }

    openConversation(conv: Conversation) {
        this.selectedConversation.set(conv);
        // mark as read in UI
        const updated = this.conversations().map(c => c.id === conv.id ? { ...c, unread: 0 } : c);
        this.conversations.set(updated);

        this.loading.set(true);
        this.messagesService.getMessages(conv.id).subscribe(msgs => {
            this.messages.set(msgs);
            this.loading.set(false);
        }, () => this.loading.set(false));
    }

    sendReply() {
        const conv = this.selectedConversation();
        if (!conv) return;
        const text = this.reply.trim();
        if (!text) return;

        this.messagesService.sendMessage(conv.id, text).subscribe(created => {
            this.messages.update(prev => [...prev, created]);
            this.reply = '';

            // update conversation last message/time
            const updated = this.conversations().map(c => c.id === conv.id ? { ...c, lastMessage: created.body, lastTime: created.timestamp } : c);
            this.conversations.set(updated);
        });
    }

    formatTime(iso: string) {
        try { return new Date(iso).toLocaleString(); } catch { return iso; }
    }
}
