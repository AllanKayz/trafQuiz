import { Component, inject, signal, computed, ViewChild, ElementRef, effect, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MessagesService } from './messages.service';
import { Conversation, Message } from '../../trafquiz';
import { TraffiquizService } from '../../traffiquiz.service';

@Component({
    selector: 'app-messages',
    imports: [CommonModule, FormsModule, MatListModule, MatIconModule, MatButtonModule, MatInputModule, MatCardModule, MatProgressSpinnerModule, MatTooltipModule],
    templateUrl: './messages.component.html',
    styleUrl: './messages.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MessagesComponent {
    private messagesService = inject(MessagesService);
    public mainService = inject(TraffiquizService);

    conversations = signal<Conversation[]>([]);
    selectedConversation = signal<Conversation | null>(null);
    messages = signal<Message[]>([]);
    reply = '';
    readonly MESSAGE_LIMIT = 1000;
    loading = signal(false);
    searchText = signal('');

    // Advanced features
    showRecipientInfo = signal(false);
    recipientData = signal<any>(null);
    isRecordingSignal = signal(false);
    mediaRecorder: MediaRecorder | null = null;
    audioChunks: any[] = [];

    // Emoji Picker
    showEmojiPicker = signal(false);
    emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', 'wv', '😤', '😢', '😭', '😱',
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
        '👆', '👇', '🙏', '🤝', '🙌', '👏', '🎉', '✨', '🔥', '❤️'
    ];

    @ViewChild('scrollContainer') scrollContainer?: ElementRef;

    allUsers = computed(() => {
        const students = (this.mainService.studentsSignal() || []).map(s => ({
            id: s.id,
            userId: (s as any).userId || s.id, // Fallback to id if userId missing
            name: `${s.firstName} ${s.lastName}`,
            email: s.email,
            role: 'student'
        }));
        const instructors = (this.mainService.instructorsSignal() || []).map(i => ({
            id: i.id,
            userId: (i as any).userId || i.id,
            name: `${i.firstName} ${i.lastName}`,
            email: i.email,
            role: 'instructor'
        }));
        return [...students, ...instructors];
    });

    displayList = computed(() => {
        const text = this.searchText().toLowerCase().trim();
        const convs = this.conversations();

        if (!text) return convs.map(c => ({ ...c, displayType: 'conversation' }));

        const filteredConvs = convs.filter(c =>
            (c.name || '').toLowerCase().includes(text) ||
            (c.lastMessage || '').toLowerCase().includes(text)
        ).map(c => ({ ...c, displayType: 'conversation' }));

        // Search for people not in conversations
        const filteredPeople = this.allUsers().filter(u =>
            (u.name || '').toLowerCase().includes(text) &&
            !convs.some(c => (c.name || '').toLowerCase() === (u.name || '').toLowerCase())
        ).map(u => ({
            id: -(u.userId + 1000), // dummy negative ID
            name: u.name,
            role: u.role,
            partnerId: u.userId,
            displayType: 'person',
            lastMessage: 'Start a new conversation',
            unread: 0
        }));

        return [...filteredConvs, ...filteredPeople] as any[];
    });

    constructor() {
        this.loadConversations();

        // Listen for new messages
        if (window.electronAPI && window.electronAPI.on) {
            window.electronAPI.on('data-change', (payload: any) => {
                if (payload.entity === 'messages' && payload.action === 'new-message') {
                    const msg = payload.data;
                    if (this.selectedConversation()?.id === msg.conversation_id) {
                        this.messages.update(list => [...list, msg]);
                        setTimeout(() => this.scrollToBottom(), 50);
                    } else {
                        // Refresh conversations to show unread/last message
                        this.loadConversations();
                    }
                }
            });
        }

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

    openConversation(conv: any) {
        this.showEmojiPicker.set(false);
        if (conv.displayType === 'person') {
            const existing = this.conversations().find(c => c.name === conv.name);
            if (existing) {
                this.selectActualConversation(existing);
            } else {
                this.selectedConversation.set(conv);
                this.messages.set([]);
                this.showRecipientInfo.set(false);
                this.recipientData.set(null);
            }
            return;
        }
        this.selectActualConversation(conv);
    }

    private selectActualConversation(conv: Conversation) {
        this.selectedConversation.set(conv);
        this.showRecipientInfo.set(false);
        this.recipientData.set(null);

        const updated = this.conversations().map(c => c.id === conv.id ? { ...c, unread: 0 } : c);
        this.conversations.set(updated);

        this.loadMessages();
    }

    toggleRecipientInfo() {
        this.showEmojiPicker.set(false);
        this.showRecipientInfo.update(v => !v);
        if (this.showRecipientInfo() && !this.recipientData()) {
            this.fetchRecipientInfo();
        }
    }

    toggleEmojiPicker() {
        this.showRecipientInfo.set(false);
        this.showEmojiPicker.update(v => !v);
    }

    addEmoji(emoji: string) {
        this.reply += emoji;
        this.showEmojiPicker.set(false);
    }

    fetchRecipientInfo() {
        const conv = this.selectedConversation();
        if (!conv) return;

        // Find partner ID
        const currentUserId = this.mainService.currentUser()?.id;
        // In this implementation, conversations should ideally have the partner's user ID directly.
        // For now, we'll try to find it or assume it's stored in the conversation if we enriched it.
        // Assuming the backend enrichment added it.
        const partnerId = (conv as any).partnerId || 0; // Fix: We should have partnerId
        if (partnerId) {
            this.messagesService.getRecipientInfo(partnerId).subscribe(data => {
                this.recipientData.set(data);
            });
        }
    }

    onFileSelected(event: any, type: string = 'file') {
        const file = event.target.files[0];
        if (!file) return;

        this.loading.set(true);
        this.messagesService.uploadAttachment(file).subscribe(res => {
            if (res.success) {
                const attachment = {
                    url: res.url,
                    name: res.name,
                    type: res.type
                };
                this.messagesService.sendMessage(this.selectedConversation()?.id!, '', type === 'image' ? 'image' : 'file', attachment).subscribe(msg => {
                    this.loadMessages();
                    this.loading.set(false);
                });
            }
        }, () => this.loading.set(false));
    }

    loadMessages() {
        const conv = this.selectedConversation();
        if (!conv) return;
        if ((conv as any).displayType === 'person') return;

        this.loading.set(true);
        this.messagesService.getMessages(conv.id).subscribe(msgs => {
            this.messages.set(msgs);
            this.loading.set(false);
        }, () => this.loading.set(false));
    }

    startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            this.isRecordingSignal.set(true);
            this.mediaRecorder = new MediaRecorder(stream);
            this.audioChunks = [];
            this.mediaRecorder.ondataavailable = (event) => this.audioChunks.push(event.data);
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                const file = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });
                this.messagesService.uploadAttachment(file).subscribe(res => {
                    this.messagesService.sendMessage(this.selectedConversation()?.id!, '', 'voice', { url: res.url, duration: 0 }).subscribe(() => {
                        this.loadMessages();
                    });
                });
            };
            this.mediaRecorder.start();
        });
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecordingSignal()) {
            this.mediaRecorder.stop();
            this.isRecordingSignal.set(false);
        }
    }

    initiateCall(video: boolean = false) {
        const type = video ? 'video' : 'voice';
        this.mainService.showNotification(`Initiating ${type} call...`, 'info');
        this.messagesService.sendMessage(this.selectedConversation()?.id!, 'Started a call', 'call', { call_status: 'missed' }).subscribe(() => {
            this.loadMessages();
        });
    }

    openImage(url: string) {
        if (!url) return;
        // In local mode, we might need a different way to open images
        // For now, if it's a full URL use it, else try to handle it as local
        if (url.startsWith('http') || url.startsWith('data:')) {
            window.open(url, '_blank');
        } else {
            // Placeholder: Should ideally be handled via a custom protocol or relative path

        }
    }

    sendReply() {
        const conv = this.selectedConversation();
        if (!conv) return;
        const text = this.reply.trim();
        if (!text) return;

        const isNew = (conv as any).displayType === 'person';
        const conversationId = isNew ? null : conv.id;
        const recipientId = isNew ? (conv as any).partnerId : null;

        this.messagesService.sendMessage(conversationId, text, 'text', null, recipientId).subscribe(res => {
            if (isNew && res.conversationId) {
                // If it was a new conversation, we need to refresh the list 
                // and select the newly created actual conversation.
                this.messagesService.getConversations().subscribe(list => {
                    this.conversations.set(list);
                    const newConv = list.find(c => c.id === res.conversationId);
                    if (newConv) {
                        this.selectedConversation.set(newConv);
                    }
                    this.loadMessages();
                });
            } else {
                this.loadMessages();
            }

            this.reply = '';
            const textarea = document.querySelector('.input-area textarea') as HTMLTextAreaElement;
            if (textarea) textarea.style.height = '44px';
        });
    }

    onInput(event: any) {
        const textarea = event.target;
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
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
