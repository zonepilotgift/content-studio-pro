// Content Studio Pro - Complete JavaScript Functionality

// ============================================
// INITIALIZATION & THEME MANAGEMENT
// ============================================

const themeToggle = document.getElementById('themeToggle');
const themeToggleMobile = document.getElementById('themeToggleMobile');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
if (themeToggleMobile) {
    themeToggleMobile.addEventListener('click', toggleTheme);
}

function updateThemeIcon(theme) {
    const icon = theme === 'light' ? '🌙' : '☀️';
    themeToggle.textContent = icon;
    if (themeToggleMobile) {
        themeToggleMobile.textContent = icon;
    }
}

// ============================================
// NAVIGATION SYSTEM
// ============================================

const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.getAttribute('data-page');
        navigateTo(targetPage);
    });
});

function navigateTo(pageName) {
    // Update nav items
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update pages
    pages.forEach(page => {
        if (page.id === pageName) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });
    
    // Update URL hash
    window.location.hash = pageName;
}

// Handle initial page load from URL hash
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash) {
        navigateTo(hash);
    }
    updateDashboardStats();
});

// ============================================
// DATA STORAGE & MANAGEMENT
// ============================================

class ContentStudio {
    constructor() {
        this.data = this.loadData();
    }
    
    loadData() {
        const stored = localStorage.getItem('contentStudioData');
        return stored ? JSON.parse(stored) : {
            ideas: [],
            content: [],
            scheduled: [],
            analytics: {
                totalIdeas: 0,
                totalContent: 0,
                scheduledPosts: 0,
                avgSeoScore: 0
            }
        };
    }
    
    saveData() {
        localStorage.setItem('contentStudioData', JSON.stringify(this.data));
        updateDashboardStats();
    }
    
    addIdea(idea) {
        this.data.ideas.push({...idea, timestamp: Date.now()});
        this.data.analytics.totalIdeas++;
        this.saveData();
    }
    
    addContent(content) {
        this.data.content.push({...content, timestamp: Date.now()});
        this.data.analytics.totalContent++;
        this.saveData();
    }
    
    schedulePost(post) {
        this.data.scheduled.push({...post, timestamp: Date.now()});
        this.data.analytics.scheduledPosts++;
        this.saveData();
    }
    
    updateSeoScore(score) {
        const scores = this.data.content.map(c => c.seoScore || 0).filter(s => s > 0);
        scores.push(score);
        this.data.analytics.avgSeoScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        this.saveData();
    }
}

const studio = new ContentStudio();

// ============================================
// DASHBOARD
// ============================================

function updateDashboardStats() {
    document.getElementById('totalIdeas').textContent = studio.data.analytics.totalIdeas;
    document.getElementById('totalContent').textContent = studio.data.analytics.totalContent;
    document.getElementById('scheduledPosts').textContent = studio.data.analytics.scheduledPosts;
    document.getElementById('avgSeoScore').textContent = studio.data.analytics.avgSeoScore;
}

// ============================================
// IDEA GENERATOR
// ============================================

const generateIdeasBtn = document.getElementById('generateIdeasBtn');
const ideasOutput = document.getElementById('ideasOutput');

generateIdeasBtn.addEventListener('click', generateIdeas);

async function generateIdeas() {
    const filters = {
        writers: document.getElementById('filterWriters').checked,
        creators: document.getElementById('filterCreators').checked,
        business: document.getElementById('filterBusiness').checked
    };
    
    if (!filters.writers && !filters.creators && !filters.business) {
        showToast('Please select at least one audience!', 'error');
        return;
    }
    
    ideasOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Generating ideas...</p></div>';
    
    try {
        const searchQueries = buildSearchQueries(filters);
        const searchResults = await Promise.all(
            searchQueries.map(query => searchWeb(query))
        );
        
        setTimeout(() => {
            const ideas = createContentIdeas(searchResults.flat(), filters);
            displayIdeas(ideas);
            ideas.forEach(idea => studio.addIdea(idea));
            showToast('5 fresh ideas generated! 🎉');
        }, 1000);
    } catch (error) {
        const ideas = createContentIdeas([], filters);
        displayIdeas(ideas);
        showToast('Ideas generated!');
    }
}

function buildSearchQueries(filters) {
    const queries = [];
    const year = new Date().getFullYear();
    
    if (filters.writers) {
        queries.push(`writing trends ${year}`);
    }
    if (filters.creators) {
        queries.push(`content creation trends ${year}`);
    }
    if (filters.business) {
        queries.push(`business content marketing ${year}`);
    }
    
    return queries;
}

// Configuration: Set your backend URL here
// For Render: https://your-app-name.onrender.com
// For Railway: https://your-app-name.railway.app
// For ngrok: https://your-ngrok-url.ngrok.io
// Leave empty for template-based generation (no backend)
const BACKEND_URL = ''; // Set this to your backend URL

async function searchWeb(query) {
    // If no backend URL is configured, use template-based generation
    if (!BACKEND_URL) {
        console.log('No backend configured - using template-based generation');
        return [];
    }
    
    try {
        console.log('Searching web for:', query);
        const response = await fetch(`${BACKEND_URL}/api/web-search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                num_results: 5
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('Search results received:', data.results?.length || 0);
            return data.results || [];
        } else {
            console.error('Search failed:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to template-based generation on error
        return [];
    }
}

function createContentIdeas(searchResults, filters) {
    const year = new Date().getFullYear();
    const ideas = [];
    const templates = getIdeaTemplates(filters, year);
    
    const shuffled = templates.sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(5, shuffled.length); i++) {
        ideas.push({
            id: Date.now() + i,
            ...shuffled[i]
        });
    }
    
    return ideas;
}

function getIdeaTemplates(filters, year) {
    const templates = [];
    
    if (filters.writers) {
        templates.push(
            {
                title: `AI Writing Tools: Complete Guide for ${year}`,
                description: `Explore how AI is transforming writing workflows, from ideation to editing. Compare top tools and learn integration strategies.`,
                value: `Essential for modern writers. AI adoption in writing increased 300% this year.`,
                category: 'Writers',
                tags: ['AI', 'Tools', 'Productivity']
            },
            {
                title: `Monetizing Your Writing: 7 Proven Strategies`,
                description: `Break down diverse income streams including newsletters, courses, and consulting with real revenue examples.`,
                value: `Provides concrete financial strategies. Freelance writing market growing 15% annually.`,
                category: 'Writers',
                tags: ['Monetization', 'Business', 'Income']
            }
        );
    }
    
    if (filters.creators) {
        templates.push(
            {
                title: `Platform Algorithm Updates: What Changed in ${year}`,
                description: `Analyze recent algorithm changes across LinkedIn, Instagram, TikTok, and YouTube with adaptation strategies.`,
                value: `Helps creators maintain visibility. Algorithm understanding is #1 success factor.`,
                category: 'Content Creators',
                tags: ['Algorithms', 'Social Media', 'Strategy']
            },
            {
                title: `Multi-Platform Content Strategy That Works`,
                description: `Framework for creating once and distributing everywhere with platform-specific optimization tactics.`,
                value: `Maximizes ROI and reduces burnout. Top creators repurpose 80% of content.`,
                category: 'Content Creators',
                tags: ['Strategy', 'Efficiency', 'Growth']
            }
        );
    }
    
    if (filters.business) {
        templates.push(
            {
                title: `Content Marketing ROI: Metrics That Matter`,
                description: `Track conversions, brand awareness, and customer value beyond vanity metrics with proven frameworks.`,
                value: `Justifies content investments. Companies with strategy see 3x better results.`,
                category: 'Business',
                tags: ['ROI', 'Metrics', 'Analytics']
            },
            {
                title: `B2B Content That Actually Converts`,
                description: `Real campaign examples that drove pipeline with breakdown of successful elements.`,
                value: `Actionable B2B insights. Buyers consume 13 pieces before purchasing.`,
                category: 'Business',
                tags: ['B2B', 'Conversion', 'Sales']
            }
        );
    }
    
    return templates;
}

function displayIdeas(ideas) {
    const container = document.createElement('div');
    container.className = 'ideas-container';
    
    ideas.forEach((idea, index) => {
        const card = document.createElement('div');
        card.className = 'idea-card';
        card.innerHTML = `
            <div class="idea-number">${index + 1}</div>
            <h3 class="idea-title">${idea.title}</h3>
            <p class="idea-description">${idea.description}</p>
            <div class="idea-value">
                <div class="idea-value-title">💎 Why It's Valuable</div>
                <div class="idea-value-text">${idea.value}</div>
            </div>
            <div class="idea-meta">
                <span class="idea-tag category">${idea.category}</span>
                ${idea.tags.map(tag => `<span class="idea-tag">${tag}</span>`).join('')}
            </div>
            <div class="idea-actions">
                <button class="idea-btn" onclick="copyText('${idea.title}')">📋 Copy</button>
                <button class="idea-btn" onclick="useInWriter('${idea.title}')">✍️ Write</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    ideasOutput.innerHTML = '';
    ideasOutput.appendChild(container);
}

// ============================================
// CONTENT WRITER
// ============================================

const generateContentBtn = document.getElementById('generateContentBtn');
const writerOutput = document.getElementById('writerOutput');
const copyContentBtn = document.getElementById('copyContentBtn');
const downloadContentBtn = document.getElementById('downloadContentBtn');
const analyzeContentBtn = document.getElementById('analyzeContentBtn');

let currentContent = '';

generateContentBtn.addEventListener('click', generateContent);
copyContentBtn.addEventListener('click', () => copyText(currentContent));
downloadContentBtn.addEventListener('click', downloadContent);
analyzeContentBtn.addEventListener('click', analyzeCurrentContent);

async function generateContent() {
    const topic = document.getElementById('writerTopic').value;
    const contentType = document.getElementById('writerContentType').value;
    const tone = document.getElementById('writerTone').value;
    const length = document.getElementById('writerLength').value;
    const keywords = document.getElementById('writerKeywords').value;
    
    if (!topic.trim()) {
        showToast('Please enter a topic!', 'error');
        return;
    }
    
    writerOutput.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Writing your content...</p></div>';
    
    try {
        const searchResults = await searchWeb(topic);
        
        setTimeout(() => {
            const content = createFullContent(topic, contentType, tone, length, keywords, searchResults);
            currentContent = content;
            displayContent(content);
            studio.addContent({ topic, contentType, tone, length, content });
            showToast('Content created! 🎉');
        }, 2000);
    } catch (error) {
        const content = createFullContent(topic, contentType, tone, length, keywords, []);
        currentContent = content;
        displayContent(content);
        showToast('Content created!');
    }
}

function createFullContent(topic, type, tone, length, keywords, searchResults) {
    const wordTarget = length === 'short' ? 400 : length === 'medium' ? 750 : 1500;
    
    let content = `# ${topic}\n\n`;
    content += `*${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}*\n\n`;
    
    // Introduction
    content += `## Introduction\n\n`;
    content += `In today's rapidly evolving landscape, ${topic.toLowerCase()} has become increasingly important. `;
    content += `This comprehensive guide explores the key aspects, practical applications, and future implications of this critical subject.\n\n`;
    
    // Main content sections
    content += `## Understanding ${topic}\n\n`;
    content += `${topic} represents a significant development in its field. Let's break down the essential elements:\n\n`;
    
    content += `### Key Concepts\n\n`;
    content += `1. **Foundation**: The core principles that underpin ${topic.toLowerCase()}\n`;
    content += `2. **Application**: How these principles translate to real-world scenarios\n`;
    content += `3. **Impact**: The broader implications for individuals and organizations\n\n`;
    
    // Add data if available
    if (searchResults.length > 0) {
        content += `## Current Insights\n\n`;
        content += `Recent research and analysis reveal important trends:\n\n`;
        const facts = extractFacts(searchResults);
        facts.slice(0, 3).forEach((fact, i) => {
            content += `${i + 1}. ${fact}\n`;
        });
        content += `\n`;
    }
    
    content += `## Practical Applications\n\n`;
    content += `Understanding theory is important, but practical application is where real value emerges. Here are proven strategies:\n\n`;
    
    content += `### Implementation Steps\n\n`;
    content += `1. **Assessment**: Evaluate your current situation and identify opportunities\n`;
    content += `2. **Planning**: Develop a structured approach with clear objectives\n`;
    content += `3. **Execution**: Implement systematically with regular progress checks\n`;
    content += `4. **Optimization**: Continuously refine based on results and feedback\n\n`;
    
    if (length === 'long') {
        content += `## Advanced Strategies\n\n`;
        content += `For those looking to go beyond the basics, these advanced techniques can provide significant advantages:\n\n`;
        content += `- **Integration**: Combine multiple approaches for synergistic effects\n`;
        content += `- **Automation**: Leverage technology to scale your efforts\n`;
        content += `- **Personalization**: Tailor your approach to specific contexts\n`;
        content += `- **Innovation**: Experiment with new methods and stay ahead of trends\n\n`;
        
        content += `## Common Challenges and Solutions\n\n`;
        content += `Every journey has obstacles. Here's how to navigate common challenges:\n\n`;
        content += `**Challenge 1: Getting Started**\n`;
        content += `Solution: Begin with small, manageable steps and build momentum gradually.\n\n`;
        content += `**Challenge 2: Maintaining Consistency**\n`;
        content += `Solution: Establish routines and systems that support regular practice.\n\n`;
        content += `**Challenge 3: Measuring Progress**\n`;
        content += `Solution: Define clear metrics and track them systematically.\n\n`;
    }
    
    content += `## Looking Ahead\n\n`;
    content += `The future of ${topic.toLowerCase()} is promising. As technology advances and our understanding deepens, `;
    content += `we can expect continued innovation and new opportunities to emerge.\n\n`;
    
    content += `## Conclusion\n\n`;
    content += `${topic} represents both an opportunity and a responsibility. By understanding the fundamentals, `;
    content += `applying proven strategies, and staying informed about developments, you can achieve significant success.\n\n`;
    
    content += `The key is to start now, remain consistent, and continuously adapt your approach based on results and new insights.\n\n`;
    
    if (keywords) {
        content += `---\n\n`;
        content += `*Keywords: ${keywords}*\n`;
    }
    
    return content;
}

function extractFacts(searchResults) {
    const facts = [];
    searchResults.forEach(result => {
        if (result.content) {
            const sentences = result.content.split(/[.!?]+/);
            sentences.forEach(sentence => {
                const trimmed = sentence.trim();
                if (trimmed.length > 40 && trimmed.length < 150) {
                    facts.push(trimmed);
                }
            });
        }
    });
    return facts.slice(0, 10);
}

function displayContent(content) {
    writerOutput.innerHTML = `<div class="content-output"><pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.8;">${content}</pre></div>`;
}

function downloadContent() {
    if (!currentContent) {
        showToast('Generate content first!', 'error');
        return;
    }
    
    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Content downloaded! 💾');
}

function analyzeCurrentContent() {
    if (!currentContent) {
        showToast('Generate content first!', 'error');
        return;
    }
    
    document.getElementById('seoContent').value = currentContent;
    navigateTo('seo');
    showToast('Content loaded in SEO Analyzer!', 'info');
}

window.useInWriter = function(title) {
    document.getElementById('writerTopic').value = title;
    navigateTo('writer');
    showToast('Idea loaded in writer!', 'info');
};

// ============================================
// SEO ANALYZER
// ============================================

const analyzeSeoBtn = document.getElementById('analyzeSeoBtn');
const seoResults = document.getElementById('seoResults');

analyzeSeoBtn.addEventListener('click', analyzeSeo);

function analyzeSeo() {
    const content = document.getElementById('seoContent').value;
    const keyword = document.getElementById('seoKeyword').value;
    const focusKeywords = document.getElementById('seoFocusKeywords').value;
    
    if (!content.trim()) {
        showToast('Please paste content to analyze!', 'error');
        return;
    }
    
    const analysis = performSeoAnalysis(content, keyword, focusKeywords);
    displaySeoResults(analysis);
    studio.updateSeoScore(analysis.score);
    showToast('SEO analysis complete! 🎯');
}

function performSeoAnalysis(content, keyword, focusKeywords) {
    const words = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);
    
    let score = 0;
    const recommendations = [];
    
    // Word count check
    if (words >= 300 && words <= 2000) {
        score += 20;
    } else if (words < 300) {
        recommendations.push({
            icon: '⚠️',
            text: 'Content is too short. Aim for at least 300 words for better SEO.'
        });
    } else {
        recommendations.push({
            icon: '💡',
            text: 'Content is quite long. Consider breaking into multiple pieces.'
        });
    }
    
    // Keyword density
    if (keyword) {
        const keywordCount = (content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
        const density = (keywordCount / words * 100).toFixed(2);
        
        if (density >= 1 && density <= 3) {
            score += 25;
        } else if (density < 1) {
            recommendations.push({
                icon: '⚠️',
                text: `Keyword "${keyword}" appears too few times. Aim for 1-3% density.`
            });
        } else {
            recommendations.push({
                icon: '⚠️',
                text: `Keyword "${keyword}" appears too often. Reduce to 1-3% density.`
            });
        }
    } else {
        recommendations.push({
            icon: '💡',
            text: 'Add a target keyword for better optimization.'
        });
    }
    
    // Headings check
    const headings = (content.match(/^#{1,6}\s/gm) || []).length;
    if (headings >= 3) {
        score += 20;
    } else {
        recommendations.push({
            icon: '💡',
            text: 'Add more headings (H2, H3) to improve structure and readability.'
        });
    }
    
    // Paragraph length
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const avgParaLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;
    if (avgParaLength <= 150) {
        score += 15;
    } else {
        recommendations.push({
            icon: '💡',
            text: 'Break up long paragraphs for better readability.'
        });
    }
    
    // Links check
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    if (links >= 2) {
        score += 10;
    } else {
        recommendations.push({
            icon: '💡',
            text: 'Add internal and external links to improve SEO.'
        });
    }
    
    // Readability
    const avgWordLength = content.replace(/[^a-zA-Z\s]/g, '').split(/\s+/).reduce((sum, word) => sum + word.length, 0) / words;
    let readability = 'Good';
    if (avgWordLength > 6) {
        readability = 'Complex';
        recommendations.push({
            icon: '💡',
            text: 'Use simpler words to improve readability.'
        });
    } else {
        score += 10;
    }
    
    if (recommendations.length === 0) {
        recommendations.push({
            icon: '✅',
            text: 'Great job! Your content is well-optimized.'
        });
    }
    
    return {
        score: Math.min(score, 100),
        wordCount: words,
        readingTime,
        keywordDensity: keyword ? ((content.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length / words * 100).toFixed(2) : 0,
        readability,
        recommendations
    };
}

function displaySeoResults(analysis) {
    seoResults.style.display = 'block';
    
    document.getElementById('seoScoreValue').textContent = analysis.score;
    document.getElementById('wordCount').textContent = analysis.wordCount;
    document.getElementById('readingTime').textContent = analysis.readingTime + ' min';
    document.getElementById('keywordDensity').textContent = analysis.keywordDensity + '%';
    document.getElementById('readability').textContent = analysis.readability;
    
    // Color code the score
    const scoreCircle = document.getElementById('seoScoreCircle');
    if (analysis.score >= 80) {
        scoreCircle.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else if (analysis.score >= 60) {
        scoreCircle.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    } else {
        scoreCircle.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
    }
    
    // Display recommendations
    const recsContainer = document.getElementById('seoRecommendations');
    recsContainer.innerHTML = '';
    analysis.recommendations.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <div class="recommendation-icon">${rec.icon}</div>
            <div class="recommendation-text">${rec.text}</div>
        `;
        recsContainer.appendChild(item);
    });
}

// ============================================
// MULTI-PLATFORM FORMATTER
// ============================================

const formatContentBtn = document.getElementById('formatContentBtn');
const formattedOutput = document.getElementById('formattedOutput');

formatContentBtn.addEventListener('click', formatForPlatforms);

function formatForPlatforms() {
    const source = document.getElementById('sourceContent').value;
    
    if (!source.trim()) {
        showToast('Please paste content to format!', 'error');
        return;
    }
    
    const platforms = {
        linkedin: document.getElementById('platformLinkedIn').checked,
        twitter: document.getElementById('platformTwitter').checked,
        instagram: document.getElementById('platformInstagram').checked,
        facebook: document.getElementById('platformFacebook').checked
    };
    
    const formatted = {};
    
    if (platforms.linkedin) {
        formatted.LinkedIn = formatForLinkedIn(source);
    }
    if (platforms.twitter) {
        formatted.Twitter = formatForTwitter(source);
    }
    if (platforms.instagram) {
        formatted.Instagram = formatForInstagram(source);
    }
    if (platforms.facebook) {
        formatted.Facebook = formatForFacebook(source);
    }
    
    displayFormattedContent(formatted);
    showToast('Content formatted for platforms! 🔄');
}

function formatForLinkedIn(content) {
    const lines = content.split('\n').filter(l => l.trim());
    let formatted = lines[0] + '\n\n';
    formatted += lines.slice(1, 4).join('\n\n') + '\n\n';
    formatted += '#LinkedIn #ContentMarketing #ProfessionalDevelopment';
    return formatted.substring(0, 3000);
}

function formatForTwitter(content) {
    const lines = content.split('\n').filter(l => l.trim());
    let formatted = lines[0];
    if (formatted.length > 250) {
        formatted = formatted.substring(0, 247) + '...';
    }
    formatted += '\n\n#ContentCreation #Marketing';
    return formatted;
}

function formatForInstagram(content) {
    const lines = content.split('\n').filter(l => l.trim());
    let formatted = lines[0] + '\n\n';
    formatted += lines.slice(1, 3).join('\n\n') + '\n\n';
    formatted += '.\n.\n.\n';
    formatted += '#content #creator #marketing #business #entrepreneur #success #motivation #inspiration #growth';
    return formatted.substring(0, 2200);
}

function formatForFacebook(content) {
    const lines = content.split('\n').filter(l => l.trim());
    return lines.slice(0, 6).join('\n\n');
}

function displayFormattedContent(formatted) {
    formattedOutput.innerHTML = '';
    
    Object.entries(formatted).forEach(([platform, content]) => {
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.innerHTML = `
            <div class="platform-header">
                <div class="platform-name">${getPlatformIcon(platform)} ${platform}</div>
                <button class="btn btn-secondary" onclick="copyText(\`${content.replace(/`/g, '\\`')}\`)">📋 Copy</button>
            </div>
            <div class="platform-content">${content}</div>
        `;
        formattedOutput.appendChild(card);
    });
}

function getPlatformIcon(platform) {
    const icons = {
        LinkedIn: '💼',
        Twitter: '🐦',
        Instagram: '📸',
        Facebook: '👥'
    };
    return icons[platform] || '📱';
}

// ============================================
// HASHTAG GENERATOR
// ============================================

const generateHashtagsBtn = document.getElementById('generateHashtagsBtn');
const hashtagOutput = document.getElementById('hashtagOutput');

generateHashtagsBtn.addEventListener('click', generateHashtags);

function generateHashtags() {
    const topic = document.getElementById('hashtagTopic').value;
    const platform = document.getElementById('hashtagPlatform').value;
    const count = parseInt(document.getElementById('hashtagCount').value);
    
    if (!topic.trim()) {
        showToast('Please enter a topic!', 'error');
        return;
    }
    
    const hashtags = createHashtags(topic, platform, count);
    displayHashtags(hashtags);
    showToast('Hashtags generated! #️⃣');
}

function createHashtags(topic, platform, count) {
    const words = topic.toLowerCase().split(' ');
    const hashtags = {
        primary: [],
        secondary: [],
        trending: []
    };
    
    // Primary hashtags from topic
    words.forEach(word => {
        if (word.length > 3) {
            hashtags.primary.push('#' + word.charAt(0).toUpperCase() + word.slice(1));
        }
    });
    
    // Platform-specific hashtags
    const platformTags = {
        linkedin: ['#LinkedIn', '#ProfessionalDevelopment', '#CareerGrowth', '#BusinessStrategy', '#Leadership'],
        instagram: ['#InstaGood', '#PhotoOfTheDay', '#InstaDaily', '#PicOfTheDay', '#InstaMood'],
        twitter: ['#Twitter', '#Trending', '#Viral', '#Thread', '#TweetThis'],
        tiktok: ['#TikTok', '#ForYou', '#FYP', '#Viral', '#Trending']
    };
    
    hashtags.secondary = platformTags[platform] || [];
    
    // Trending/popular hashtags
    hashtags.trending = ['#ContentCreation', '#DigitalMarketing', '#SocialMedia', '#ContentStrategy', '#Marketing', '#Business', '#Entrepreneur', '#Success', '#Motivation', '#Growth'];
    
    // Combine and limit
    const all = [...hashtags.primary, ...hashtags.secondary, ...hashtags.trending];
    const unique = [...new Set(all)];
    
    return {
        primary: hashtags.primary.slice(0, Math.ceil(count * 0.3)),
        secondary: hashtags.secondary.slice(0, Math.ceil(count * 0.3)),
        trending: hashtags.trending.slice(0, Math.ceil(count * 0.4))
    };
}

function displayHashtags(hashtags) {
    hashtagOutput.innerHTML = '<div class="hashtag-groups"></div>';
    const container = hashtagOutput.querySelector('.hashtag-groups');
    
    Object.entries(hashtags).forEach(([category, tags]) => {
        if (tags.length > 0) {
            const group = document.createElement('div');
            group.className = 'hashtag-group';
            group.innerHTML = `
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)} Hashtags</h4>
                <div class="hashtag-list">
                    ${tags.map(tag => `<span class="hashtag-item" onclick="copyText('${tag}')">${tag}</span>`).join('')}
                </div>
            `;
            container.appendChild(group);
        }
    });
    
    // Add copy all button
    const allTags = [...hashtags.primary, ...hashtags.secondary, ...hashtags.trending].join(' ');
    const copyAllBtn = document.createElement('button');
    copyAllBtn.className = 'btn btn-primary btn-block';
    copyAllBtn.style.marginTop = '20px';
    copyAllBtn.innerHTML = '📋 Copy All Hashtags';
    copyAllBtn.onclick = () => copyText(allTags);
    container.appendChild(copyAllBtn);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

window.copyText = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard! 📋');
    }).catch(() => {
        showToast('Failed to copy', 'error');
    });
};

function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
    toast.innerHTML = `
        <span>${icon}</span>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

console.log('🎨 Content Studio Pro loaded!');
console.log('✨ All features ready!');