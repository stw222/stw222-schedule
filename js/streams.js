// All Streams Page
class AllStreams {
    constructor() {
        this.scheduleData = null;
        this.currentFilter = {
            category: 'all',
            time: 'upcoming'
        };
        this.init();
    }

    async init() {
        try {
            await this.loadSchedule();
            this.renderStreamerInfo();
            this.setupFilters();
            this.renderStreams();
        } catch (error) {
            console.error('Failed to load schedule:', error);
            this.showError('Failed to load streams. Please try again later.');
        }
    }

    async loadSchedule() {
        const response = await fetch('data/schedule.json');
        if (!response.ok) {
            throw new Error('Failed to fetch schedule data');
        }
        this.scheduleData = await response.json();
    }

    renderStreamerInfo() {
        const { streamer } = this.scheduleData;

        document.getElementById('streamer-name').textContent = streamer.displayName;
        document.getElementById('streamer-description').textContent = streamer.description;
        document.title = `All Streams - ${streamer.displayName}`;

        const socialLinksContainer = document.getElementById('social-links');
        const socialIcons = {
            twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
            twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
            discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`,
            youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
        };

        socialLinksContainer.innerHTML = Object.entries(streamer.socials)
            .map(([platform, url]) => `
                <a href="${url}" target="_blank" rel="noopener noreferrer" class="social-link">
                    ${socialIcons[platform] || ''}
                    ${platform.charAt(0).toUpperCase() + platform.slice(1)}
                </a>
            `).join('');
    }

    setupFilters() {
        // Populate category filter
        const categoryFilter = document.getElementById('category-filter');
        const categories = [...new Set(this.scheduleData.streams.map(s => s.category))];

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
            categoryFilter.appendChild(option);
        });

        // Event listeners
        categoryFilter.addEventListener('change', (e) => {
            this.currentFilter.category = e.target.value;
            this.renderStreams();
        });

        document.getElementById('time-filter').addEventListener('change', (e) => {
            this.currentFilter.time = e.target.value;
            this.renderStreams();
        });
    }

    getFilteredStreams() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let streams = [...this.scheduleData.streams];

        // Filter by category
        if (this.currentFilter.category !== 'all') {
            streams = streams.filter(s => s.category === this.currentFilter.category);
        }

        // Filter by time
        if (this.currentFilter.time === 'upcoming') {
            streams = streams.filter(s => this.parseLocalDate(s.date) >= today);
            streams.sort((a, b) => this.parseLocalDate(a.date) - this.parseLocalDate(b.date));
        } else if (this.currentFilter.time === 'past') {
            streams = streams.filter(s => this.parseLocalDate(s.date) < today);
            streams.sort((a, b) => this.parseLocalDate(b.date) - this.parseLocalDate(a.date));
        } else {
            streams.sort((a, b) => this.parseLocalDate(a.date) - this.parseLocalDate(b.date));
        }

        return streams;
    }

    // Parse date string as local date (not UTC)
    parseLocalDate(dateStr) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    getCategoryConfig(category) {
        const catConfig = this.scheduleData.categories?.[category];
        if (!catConfig) return { color: '#9147ff', icon: 'help-circle' };
        const color = catConfig.color.startsWith('#') ? catConfig.color : `#${catConfig.color}`;
        return { color, icon: catConfig.icon || 'help-circle' };
    }

    formatDescription(text) {
        return text.replace(/\n/g, '<br>');
    }

    renderStreams() {
        const streamsList = document.getElementById('streams-list');
        const streams = this.getFilteredStreams();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        document.getElementById('stream-count').textContent =
            `${streams.length} stream${streams.length !== 1 ? 's' : ''} found`;

        if (streams.length === 0) {
            streamsList.innerHTML = '<p class="no-streams">No streams match your filters</p>';
            return;
        }

        streamsList.innerHTML = streams.map(stream => {
            const streamDate = this.parseLocalDate(stream.date);
            const isToday = streamDate.getTime() === today.getTime();
            const isPast = streamDate < today;
            const { color, icon } = this.getCategoryConfig(stream.category);

            return `
                <div class="stream-card ${isToday ? 'today' : ''} ${isPast ? 'past' : ''}" style="border-left: 4px solid ${color}">
                    <div class="stream-card-date">
                        <span class="stream-day">${streamDate.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span class="stream-date-num">${streamDate.getDate()}</span>
                        <span class="stream-month">${streamDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                        ${isToday ? '<span class="today-badge">Today</span>' : ''}
                    </div>
                    <div class="stream-card-content">
                        <span class="category-badge" style="background-color: ${color}20; color: ${color}">
                            <i class="mdi mdi-${icon}"></i> ${stream.category}
                        </span>
                        <h3 class="stream-card-title">${stream.title}</h3>
                        <p class="stream-card-time">${this.formatTime(stream.startTime)}</p>
                        <p class="stream-card-description">${this.formatDescription(stream.description)}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    formatTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    showError(message) {
        const streamsList = document.getElementById('streams-list');
        streamsList.innerHTML = `<div class="error">${message}</div>`;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new AllStreams();
});
