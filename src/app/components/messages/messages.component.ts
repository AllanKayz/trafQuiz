import { Component, inject, signal, computed, ViewChild, ElementRef, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MessagesService, Conversation, Message } from './messages.service';

@Component({
    selector: 'app-messages',
    imports: [FormsModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatCardModule, MatProgressSpinnerModule],
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
    searchText = signal('');

    @ViewChild('scrollContainer') scrollContainer?: ElementRef;

    filteredConversations = computed(() => {
        const text = this.searchText().toLowerCase();
        if (!text) return this.conversations();
        return this.conversations().filter(c =>
            c.name.toLowerCase().includes(text) ||
            c.lastMessage?.toLowerCase().includes(text)
        );
    });

    constructor() {
        this.loadConversations();
        effect(() => {
            // trigger scroll on messages change
            if (this.messages().length > 0) {
                setTimeout(() => this.scrollToBottom(), 50);
            }
        });
    }

    scrollToBottom() {
        if (this.scrollContainer) {
            this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
        }
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

    getInitials(name: string) {
        if (!name) return '?';
        const parts = name.split(' ');
        if (parts.length > 1) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }

    formatTime(iso: string) {
        if (!iso) return '';
        try {
            const date = new Date(iso);
            const now = new Date();
            const diff = now.getTime() - date.getTime();
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));

            if (days === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (days === 1) return 'Yesterday';
            if (days < 7) return date.toLocaleDateString([], { weekday: 'short' });
            return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch { return iso; }
    }
}
