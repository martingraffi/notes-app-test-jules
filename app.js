class KeepApp {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];

        // Form elements
        this.$form = document.querySelector('#note-form');
        this.$noteTitle = document.querySelector('#note-title');
        this.$noteText = document.querySelector('#note-text');
        this.$formCloseBtn = document.querySelector('#form-close-btn');
        this.$notesGrid = document.querySelector('#notes-grid');

        // Modal elements
        this.$modalOverlay = document.querySelector('#modal-overlay');
        this.$modalForm = document.querySelector('#modal-form');
        this.$modalNoteId = document.querySelector('#modal-note-id');
        this.$modalNoteTitle = document.querySelector('#modal-note-title');
        this.$modalNoteText = document.querySelector('#modal-note-text');
        this.$modalCloseBtn = document.querySelector('#modal-close-btn');

        this.addEventListeners();
        this.render();
    }

    addEventListeners() {
        // Main form events
        document.body.addEventListener('click', event => {
            this.handleFormClick(event);
        });

        this.$form.addEventListener('submit', event => {
            event.preventDefault();
            this.addNote();
        });

        this.$formCloseBtn.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            this.addNote();
        });

        // Auto-resize textareas
        this.$noteText.addEventListener('input', () => this.autoResize(this.$noteText));
        this.$modalNoteText.addEventListener('input', () => this.autoResize(this.$modalNoteText));

        // Note actions (delete, edit)
        this.$notesGrid.addEventListener('click', event => {
            if (event.target.closest('.delete-btn')) {
                const id = event.target.closest('.note-card').dataset.id;
                this.deleteNote(id);
                return;
            }
            if (event.target.closest('.note-card') && !event.target.closest('.icon-btn')) {
                const id = event.target.closest('.note-card').dataset.id;
                this.openModal(id);
            }
        });

        // Modal events
        this.$modalCloseBtn.addEventListener('click', () => {
            this.closeModal();
        });

        this.$modalOverlay.addEventListener('click', event => {
            if (event.target === this.$modalOverlay) {
                this.closeModal();
            }
        });
    }

    handleFormClick(event) {
        const isFormClicked = this.$form.contains(event.target);
        const titleHasText = this.$noteTitle.value.trim().length > 0;
        const textHasText = this.$noteText.value.trim().length > 0;

        if (isFormClicked) {
            this.openForm();
        } else if (titleHasText || textHasText) {
            this.addNote();
        } else {
            this.closeForm();
        }
    }

    openForm() {
        this.$form.classList.add('is-expanded');
    }

    closeForm() {
        this.$form.classList.remove('is-expanded');
        this.$noteTitle.value = '';
        this.$noteText.value = '';
        this.$noteText.style.height = 'auto';
    }

    autoResize(element) {
        element.style.height = 'auto';
        element.style.height = element.scrollHeight + 'px';
    }

    addNote() {
        const title = this.$noteTitle.value.trim();
        const text = this.$noteText.value.trim();

        if (title || text) {
            const newNote = {
                id: Date.now().toString(),
                title,
                text
            };
            this.notes.unshift(newNote);
            this.saveNotes();
            this.render();
        }
        this.closeForm();
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
        this.render();
    }

    openModal(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;

        this.$modalNoteId.value = note.id;
        this.$modalNoteTitle.value = note.title;
        this.$modalNoteText.value = note.text;

        this.$modalOverlay.classList.add('is-open');
        this.autoResize(this.$modalNoteText);
    }

    closeModal() {
        const id = this.$modalNoteId.value;
        const title = this.$modalNoteTitle.value.trim();
        const text = this.$modalNoteText.value.trim();

        if (title || text) {
            this.editNote(id, title, text);
        } else {
            this.deleteNote(id);
        }

        this.$modalOverlay.classList.remove('is-open');
    }

    editNote(id, title, text) {
        this.notes = this.notes.map(note =>
            note.id === id ? { ...note, title, text } : note
        );
        this.saveNotes();
        this.render();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    render() {
        this.$notesGrid.innerHTML = this.notes.map(note => `
            <div class="note-card" data-id="${note.id}">
                ${note.title ? `<div class="note-card-title">${this.escapeHTML(note.title)}</div>` : ''}
                ${note.text ? `<div class="note-card-text">${this.escapeHTML(note.text)}</div>` : ''}
                <div class="note-card-actions">
                    <button class="icon-btn delete-btn" title="Delete note">
                        <span class="material-icons">delete</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new KeepApp();
});
