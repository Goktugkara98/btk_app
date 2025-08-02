/**
 * Haber Editörü Ana JavaScript Dosyası
 * Modüler yapı kullanarak organize edilmiş
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM elementlerini al
    const elements = {
        form: document.getElementById('newsForm'),
        resultArea: document.getElementById('resultArea'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        copyBtn: document.getElementById('copyBtn'),
        downloadBtn: document.getElementById('downloadBtn'),
        refreshBtn: document.getElementById('refreshBtn'),
        clearBtn: document.getElementById('clearBtn'),
        originalNewsTextarea: document.getElementById('originalNews'),
        charCount: document.getElementById('charCount'),
        resultStats: document.getElementById('resultStats'),
        wordCount: document.getElementById('wordCount'),
        lineCount: document.getElementById('lineCount'),
        charCountResult: document.getElementById('charCountResult'),
        historyBtn: document.getElementById('historyBtn'),
        searchInput: document.getElementById('searchInput'),
        searchBtn: document.getElementById('searchBtn'),
        historyList: document.getElementById('historyList'),
        clearHistoryBtn: document.getElementById('clearHistoryBtn'),
        geminiBtn: document.getElementById('geminiBtn')
    };

    // Modal instance'larını oluştur
    const modals = {
        historyModal: new bootstrap.Modal(document.getElementById('historyModal')),
        newsDetailModal: new bootstrap.Modal(document.getElementById('newsDetailModal'))
    };

    // Global değişkenler
    let currentNewsId = null;
    let currentProcessedPrompt = null;
    let currentPage = 1;
    let currentSearchTerm = '';

    // Event listener'ları ekle
    initializeEventListeners();

    /**
     * Tüm event listener'ları başlatır
     */
    function initializeEventListeners() {
        // Form submit
        elements.form.addEventListener('submit', handleFormSubmit);

        // Butonlar
        elements.clearBtn.addEventListener('click', handleClear);
        elements.refreshBtn.addEventListener('click', handleRefresh);
        elements.historyBtn.addEventListener('click', handleHistoryClick);
        elements.searchBtn.addEventListener('click', handleSearch);
        elements.clearHistoryBtn.addEventListener('click', handleClearHistory);

        // Kopyalama butonları
        elements.copyBtn.addEventListener('click', () => handleCopy(elements.resultArea.textContent, 'Prompt panoya kopyalandı!'));
        elements.downloadBtn.addEventListener('click', handleDownload);

        // AI yanıtı kopyalama butonları
        document.getElementById('copyTitleBtn')?.addEventListener('click', () => {
            const text = document.getElementById('copyTitleBtn').getAttribute('data-text');
            handleCopy(text, 'Başlık panoya kopyalandı!');
        });
        
        document.getElementById('copySummaryBtn')?.addEventListener('click', () => {
            const text = document.getElementById('copySummaryBtn').getAttribute('data-text');
            // Özet için HTML formatını koru
            handleCopy(text, 'Özet panoya kopyalandı!');
        });
        
        document.getElementById('copyContentBtn')?.addEventListener('click', () => {
            const text = document.getElementById('copyContentBtn').getAttribute('data-text');
            // İçerik için HTML formatını koru
            handleCopy(text, 'İçerik panoya kopyalandı!');
        });
        
        document.getElementById('copyCategoryBtn')?.addEventListener('click', () => {
            const text = document.getElementById('copyCategoryBtn').getAttribute('data-text');
            handleCopy(text, 'Kategori panoya kopyalandı!');
        });
        
        document.getElementById('copyTagsBtn')?.addEventListener('click', () => {
            const text = document.getElementById('copyTagsBtn').getAttribute('data-text');
            handleCopy(text, 'Etiketler panoya kopyalandı!');
        });

        // Gemini butonu
        elements.geminiBtn.addEventListener('click', handleGeminiSend);

            // Karakter sayacı - debounce ile performans iyileştirmesi
    let charCountTimeout;
    elements.originalNewsTextarea.addEventListener('input', (e) => {
        clearTimeout(charCountTimeout);
        charCountTimeout = setTimeout(() => handleCharCount.call(e.target), 100);
    });

    // Enter tuşu ile arama
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    }

    /**
     * Form submit işleyicisi
     */
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const originalNews = elements.originalNewsTextarea.value.trim();
        
        if (!originalNews) {
            showError('Lütfen orijinal haber metnini girin.');
            return;
        }

        // UI durumunu güncelle
        setLoadingState(true);
        showError('');

        try {
            const result = await window.newsAPI.processNews(originalNews);
            
            if (result.success) {
                // Başarılı sonuç
                elements.resultArea.textContent = result.updated_prompt;
                elements.copyBtn.style.display = 'inline-block';
                elements.downloadBtn.style.display = 'inline-block';
                elements.geminiBtn.style.display = 'inline-block';
                elements.resultStats.style.display = 'block';
                
                // Global değişkenleri güncelle
                currentNewsId = result.news_id;
                currentProcessedPrompt = result.updated_prompt;
                
                // İstatistikleri güncelle
                updateStats(result.updated_prompt);
                
                showSuccess('Metin başarıyla işlendi!');
            } else {
                showError(result.error || 'Bilinmeyen bir hata oluştu.');
                elements.resultArea.innerHTML = `
                    <div class="text-center text-danger">
                        <i class="fas fa-exclamation-triangle fa-2x mb-3"></i>
                        <p>Hata oluştu...</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            showError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.');
            elements.resultArea.innerHTML = `
                <div class="text-center text-danger">
                    <i class="fas fa-wifi fa-2x mb-3"></i>
                    <p>Bağlantı hatası...</p>
                </div>
            `;
        } finally {
            setLoadingState(false);
        }
    }

    /**
     * Gemini'ye gönderme işleyicisi
     */
    async function handleGeminiSend() {
        if (!currentNewsId || !currentProcessedPrompt) {
            showError('Önce metni işlemeniz gerekiyor.');
            return;
        }

        // UI durumunu güncelle
        elements.geminiBtn.disabled = true;
        elements.geminiBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Prompt Gönderiliyor...';

        let result = null;
        try {
            console.log('Sending to Gemini...');
            result = await window.newsAPI.sendToGemini(currentNewsId, currentProcessedPrompt);
            console.log('Gemini response:', result);
            
            if (result.success) {
                console.log('Gemini success - updating button');
                showSuccess('Prompt gönderildi ve cevap geldi!');
                
                // Buton metnini güncelle ve event handler'ı değiştir
                elements.geminiBtn.innerHTML = '<i class="fas fa-eye me-1"></i>Modal\'da Görüntüle';
                elements.geminiBtn.removeEventListener('click', handleGeminiSend);
                elements.geminiBtn.addEventListener('click', showGeminiResponseModal);
                console.log('Button updated to show modal');
            } else {
                console.error('Gemini API Error:', result.error);
                showError(result.error || 'Gemini\'ye gönderirken hata oluştu.');
            }
        } catch (error) {
            console.error('Gemini Network Error:', error);
            showError('Gemini bağlantı hatası oluştu. Lütfen tekrar deneyin.');
        } finally {
            console.log('Finally block - result:', result);
            // UI durumunu geri yükle
            elements.geminiBtn.disabled = false;
            
            // Sadece başarısız durumda butonu geri yükle
            if (result && !result.success) {
                console.log('Resetting button to original state');
                elements.geminiBtn.innerHTML = '<i class="fas fa-robot me-1"></i>Gemini\'ye Gönder';
                elements.geminiBtn.removeEventListener('click', showGeminiResponseModal);
                elements.geminiBtn.addEventListener('click', handleGeminiSend);
            }
        }
    }

    /**
     * Geçmiş butonu işleyicisi
     */
    function handleHistoryClick() {
        // Modal'ı önce aç, sonra veriyi yükle
        modals.historyModal.show();
        
        // Kısa bir gecikme ile veriyi yükle (modal animasyonu için)
        setTimeout(() => {
            loadHistory();
        }, 100);
    }

    /**
     * Geçmiş yükleme
     */
    async function loadHistory(page = 1, searchTerm = '') {
        try {
            let result;
            if (searchTerm) {
                result = await window.newsAPI.searchNews(searchTerm, 10);
            } else {
                result = await window.newsAPI.getHistory(page, 10);
            }
            
            if (result.success) {
                displayHistory(result.history || result.results || []);
                currentPage = page;
                currentSearchTerm = searchTerm;
            } else {
                showError('Geçmiş yüklenirken hata oluştu');
            }
        } catch (error) {
            showError('Geçmiş yüklenirken hata oluştu');
        }
    }

    /**
     * Geçmiş gösterme
     */
    function displayHistory(history) {
        // Loading göstergesi
        elements.historyList.innerHTML = `
            <div class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                Yükleniyor...
            </div>
        `;
        
        // DOM manipülasyonunu optimize etmek için requestAnimationFrame kullan
        requestAnimationFrame(() => {
            if (history.length === 0) {
                elements.historyList.innerHTML = `
                    <div class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-3x mb-3"></i>
                        <p>Henüz kayıt bulunmuyor</p>
                    </div>
                `;
                return;
            }
            
            // DocumentFragment kullanarak performansı artır
            const fragment = document.createDocumentFragment();
            
            // Performans için batch processing
            const batchSize = 10;
            let processed = 0;
            
            function processBatch() {
                const end = Math.min(processed + batchSize, history.length);
                
                for (let i = processed; i < end; i++) {
                    const item = history[i];
                    const hasGeminiResponse = item.gemini_response && item.gemini_response.trim() !== '';
                    const geminiIcon = hasGeminiResponse ? '<i class="fas fa-robot text-warning me-1" title="Gemini yanıtı mevcut"></i>' : '';
                    
                    // Gemini yanıtından başlık ve özeti çıkar (lazy loading)
                    let geminiInfo = {};
                    if (hasGeminiResponse) {
                        try {
                            geminiInfo = window.FormatterUtils.extractGeminiInfo(item.gemini_response);
                        } catch (e) {
                            console.warn('Gemini info extraction failed:', e);
                        }
                    }
                    
                    const historyItem = document.createElement('div');
                    historyItem.className = 'card mb-2 history-item';
                    historyItem.setAttribute('data-news-id', item.news_id);
                    historyItem.innerHTML = `
                        <div class="card-body py-2">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <div class="fw-bold text-truncate">
                                        ${geminiIcon}${item.news_id}
                                    </div>
                                    ${hasGeminiResponse && geminiInfo.title ? `
                                    <div class="text-success small text-truncate mb-1">
                                        <i class="fas fa-robot text-warning me-1"></i><strong>Gemini Başlığı:</strong> ${geminiInfo.title}
                                    </div>
                                    ` : ''}
                                    ${hasGeminiResponse && geminiInfo.summary ? `
                                    <div class="text-info small text-truncate mb-1">
                                        <i class="fas fa-robot text-info me-1"></i><strong>Özet:</strong> ${geminiInfo.summary}
                                    </div>
                                    ` : ''}
                                    <div class="text-muted small text-truncate">${window.FormatterUtils.truncateText(item.original_news, 100)}</div>
                                    <div class="text-muted small">
                                        <i class="fas fa-calendar me-1"></i>${window.FormatterUtils.formatDate(item.created_at)}
                                        ${hasGeminiResponse ? `<i class="fas fa-robot text-warning ms-2" title="Gemini yanıtı: ${window.FormatterUtils.formatDate(item.gemini_sent_at)}"></i>` : ''}
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-primary btn-sm view-detail-btn" data-news-id="${item.news_id}">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm delete-news-btn" data-news-id="${item.news_id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    
                    fragment.appendChild(historyItem);
                }
                
                processed = end;
                
                if (processed < history.length) {
                    // Daha fazla batch işle
                    requestAnimationFrame(processBatch);
                } else {
                    // Tüm batch'ler tamamlandı, DOM'a ekle
                    elements.historyList.innerHTML = '';
                    elements.historyList.appendChild(fragment);
                    
                    // Event listener'ları ekle
                    addHistoryEventListeners();
                }
            }
            
            // İlk batch'i başlat
            processBatch();
        });
    }

    /**
     * Geçmiş event listener'larını ekler
     */
    function addHistoryEventListeners() {
        // Event delegation kullanarak performansı artır
        elements.historyList.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const newsId = target.getAttribute('data-news-id');
            if (!newsId) return;
            
            if (target.classList.contains('view-detail-btn')) {
                loadNewsDetail(newsId);
            } else if (target.classList.contains('delete-news-btn')) {
                deleteNews(newsId);
            }
        });
    }

    /**
     * AI yanıtını parse et
     */
    function parseAIResponse(response) {
        const result = {
            title: '',
            summary: '',
            content: '',
            category: '',
            tags: ''
        };
        
        try {
            // ===BAŞLIK=== bölümünü bul
            const titleMatch = response.match(/===BAŞLIK===\s*([\s\S]*?)(?===|$)/);
            if (titleMatch) {
                result.title = titleMatch[1].trim();
            }
            
            // ===ÖZET=== bölümünü bul
            const summaryMatch = response.match(/===ÖZET===\s*([\s\S]*?)(?===|$)/);
            if (summaryMatch) {
                result.summary = summaryMatch[1].trim();
            }
            
            // ===İÇERİK=== bölümünü bul
            const contentMatch = response.match(/===İÇERİK===\s*([\s\S]*?)(?===|$)/);
            if (contentMatch) {
                result.content = contentMatch[1].trim();
            }
            
            // ===KATEGORİ=== bölümünü bul
            const categoryMatch = response.match(/===KATEGORİ===\s*([\s\S]*?)(?===|$)/);
            if (categoryMatch) {
                result.category = categoryMatch[1].trim();
            }
            
            // ===ETİKETLER=== bölümünü bul
            const tagsMatch = response.match(/===ETİKETLER===\s*([\s\S]*?)(?===|$)/);
            if (tagsMatch) {
                result.tags = tagsMatch[1].trim();
            }
        } catch (error) {
            console.error('AI yanıtı parse edilirken hata:', error);
        }
        
        return result;
    }

    /**
     * Haber detayı yükleme
     */
    async function loadNewsDetail(newsId) {
        try {
            const result = await window.newsAPI.getNewsDetail(newsId);
            
            if (result.success) {
                const news = result.news;
                
                // DOM manipülasyonlarını batch halinde yapmak için requestAnimationFrame kullan
                requestAnimationFrame(() => {
                    // Temel bilgileri güncelle
                    document.getElementById('newsIdDetail').textContent = news.news_id;
                    document.getElementById('createdAtDetail').textContent = window.FormatterUtils.formatDate(news.created_at);
                    document.getElementById('originalNewsDetail').textContent = news.original_news;
                    document.getElementById('processedPromptDetail').textContent = news.processed_prompt;
                    
                    // AI yanıtını göster (eğer varsa)
                    const geminiDetailRow = document.getElementById('geminiDetailRow');
                    
                    if (news.gemini_response && news.gemini_response.trim() !== '') {
                        // AI yanıtını parse et (performans için ayrı frame'de)
                        requestAnimationFrame(() => {
                            const parsedResponse = parseAIResponse(news.gemini_response);
                            
                            // Tüm DOM güncellemelerini tek seferde yap
                            const updates = [
                                { id: 'titleDetail', content: parsedResponse.title || 'Başlık bulunamadı', type: 'text' },
                                { id: 'summaryDetail', content: parsedResponse.summary || 'Özet bulunamadı', type: 'html' },
                                { id: 'contentDetail', content: parsedResponse.content || 'İçerik bulunamadı', type: 'html' },
                                { id: 'categoryDetail', content: parsedResponse.category || 'Kategori bulunamadı', type: 'text' },
                                { id: 'tagsDetail', content: parsedResponse.tags || 'Etiketler bulunamadı', type: 'text' }
                            ];
                            
                            updates.forEach(update => {
                                const element = document.getElementById(update.id);
                                if (element) {
                                    if (update.type === 'html') {
                                        element.innerHTML = update.content;
                                    } else {
                                        element.textContent = update.content;
                                    }
                                }
                            });
                            
                            // Kopyalama butonları için verileri sakla
                            const copyButtons = [
                                { id: 'copyTitleBtn', data: parsedResponse.title || '' },
                                { id: 'copySummaryBtn', data: parsedResponse.summary || '' },
                                { id: 'copyContentBtn', data: parsedResponse.content || '' },
                                { id: 'copyCategoryBtn', data: parsedResponse.category || '' },
                                { id: 'copyTagsBtn', data: parsedResponse.tags || '' }
                            ];
                            
                            copyButtons.forEach(btn => {
                                const element = document.getElementById(btn.id);
                                if (element) {
                                    element.setAttribute('data-text', btn.data);
                                }
                            });
                            
                            geminiDetailRow.style.display = 'block';
                        });
                    } else {
                        geminiDetailRow.style.display = 'none';
                    }
                    
                    // Silme butonu için news_id'yi sakla
                    document.getElementById('deleteNewsBtn').setAttribute('data-news-id', news.news_id);
                    
                    // Modal'ı göster
                    requestAnimationFrame(() => {
                        modals.newsDetailModal.show();
                    });
                });
            } else {
                showError('Haber detayı yüklenirken hata oluştu');
            }
        } catch (error) {
            showError('Haber detayı yüklenirken hata oluştu');
        }
    }

    /**
     * Haber silme
     */
    async function deleteNews(newsId) {
        if (!confirm('Bu haberi silmek istediğinizden emin misiniz?')) {
            return;
        }
        
        try {
            const result = await window.newsAPI.deleteNews(newsId);
            
            if (result.success) {
                showSuccess('Haber başarıyla silindi');
                loadHistory(currentPage, currentSearchTerm);
            } else {
                showError('Haber silinirken hata oluştu');
            }
        } catch (error) {
            showError('Haber silinirken hata oluştu');
        }
    }

    /**
     * Arama işleyicisi
     */
    function handleSearch() {
        const searchTerm = elements.searchInput.value.trim();
        if (searchTerm) {
            loadHistory(1, searchTerm);
        } else {
            loadHistory(1);
        }
    }

    /**
     * Tümünü temizle işleyicisi
     */
    function handleClearHistory() {
        if (confirm('Tüm geçmişi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
            showError('Bu özellik henüz mevcut değil');
        }
    }

    /**
     * Temizle butonu işleyicisi
     */
    function handleClear() {
        elements.originalNewsTextarea.value = '';
        elements.charCount.textContent = '0';
        elements.charCount.classList.remove('text-primary');
        elements.resultArea.innerHTML = `
            <div class="text-center text-muted">
                <i class="fas fa-arrow-left fa-2x mb-3"></i>
                <p>Orijinal haber metnini girin ve "Metni İşle" butonuna tıklayın...</p>
            </div>
        `;
        elements.copyBtn.style.display = 'none';
        elements.downloadBtn.style.display = 'none';
        elements.geminiBtn.style.display = 'none';
        elements.geminiBtn.innerHTML = '<i class="fas fa-robot me-1"></i>Gemini\'ye Gönder';
        elements.geminiBtn.removeEventListener('click', showGeminiResponseModal);
        elements.geminiBtn.addEventListener('click', handleGeminiSend);
        elements.resultStats.style.display = 'none';
        
        // Global değişkenleri temizle
        currentNewsId = null;
        currentProcessedPrompt = null;
    }

    /**
     * Yenile butonu işleyicisi
     */
    function handleRefresh() {
        if (confirm('Tüm alanları temizlemek istediğinizden emin misiniz?')) {
            handleClear();
            showSuccess('Sayfa yenilendi!');
        }
    }

    /**
     * Karakter sayacı işleyicisi
     */
    function handleCharCount() {
        const count = this.value.length;
        elements.charCount.textContent = count;
        
        // Dinamik renk değişimi
        if (count > 0) {
            elements.charCount.classList.add('text-primary');
        } else {
            elements.charCount.classList.remove('text-primary');
        }
    }

    /**
     * Kopyalama işleyicisi
     */
    async function handleCopy(textToCopy, successMessage) {
        const success = await window.ClipboardUtils.copyWithButtonFeedback(
            this, 
            textToCopy, 
            '<i class="fas fa-check me-1"></i>Kopyalandı!'
        );
        
        if (success) {
            showSuccess(successMessage);
        }
    }

    /**
     * İndirme işleyicisi
     */
    function handleDownload() {
        const textToDownload = elements.resultArea.textContent;
        window.FormatterUtils.downloadFile(textToDownload, 'haber_prompt.txt');
        showSuccess('Dosya indirildi!');
    }

    /**
     * İstatistikleri günceller
     */
    function updateStats(text) {
        const stats = window.FormatterUtils.calculateStats(text);
        elements.wordCount.textContent = stats.words;
        elements.lineCount.textContent = stats.lines;
        elements.charCountResult.textContent = stats.chars;
    }

    /**
     * Loading durumunu ayarlar
     */
    function setLoadingState(isLoading) {
        elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
        elements.copyBtn.style.display = 'none';
        elements.downloadBtn.style.display = 'none';
        elements.resultStats.style.display = 'none';
        
        if (isLoading) {
            elements.resultArea.innerHTML = `
                <div class="text-center text-muted">
                    <div class="spinner-border spinner-border-sm me-2" role="status"></div>
                    İşleniyor...
                </div>
            `;
        }
    }

    /**
     * Hata mesajı gösterir
     */
    function showError(message) {
        showNotification(message, 'error');
    }

    /**
     * Gemini yanıtını modal'da gösterir
     */
    function showGeminiResponseModal() {
        if (!currentNewsId) {
            showError('Haber bilgisi bulunamadı.');
            return;
        }
        
        console.log('Opening Gemini response modal for news_id:', currentNewsId);
        
        // Mevcut haber detayını yükle ve modal'ı aç
        loadNewsDetail(currentNewsId);
    }

    /**
     * Başarı mesajı gösterir
     */
    function showSuccess(message) {
        showNotification(message, 'success');
    }

    /**
     * Modern bildirim sistemi
     */
    function showNotification(message, type = 'info', duration = 5000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        // Bildirim öğesini oluştur
        const notification = document.createElement('div');
        notification.className = `notification-item ${type}`;
        
        // Başlık belirle
        let title = 'Bilgi';
        let icon = 'fas fa-info-circle';
        
        switch (type) {
            case 'success':
                title = 'Başarılı';
                icon = 'fas fa-check-circle';
                break;
            case 'error':
                title = 'Hata';
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                title = 'Uyarı';
                icon = 'fas fa-exclamation-triangle';
                break;
        }

        notification.innerHTML = `
            <div class="notification-header">
                <h6 class="notification-title">
                    <i class="${icon} me-1"></i>${title}
                </h6>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove(); updateNotificationCount();">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <p class="notification-message">${message}</p>
            <div class="notification-progress"></div>
        `;

        // Container'a ekle
        container.appendChild(notification);

        // Animasyon için setTimeout kullan
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Progress bar animasyonu
        const progressBar = notification.querySelector('.notification-progress');
        if (progressBar && duration > 0) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
            
            requestAnimationFrame(() => {
                progressBar.style.width = '0%';
            });
        }

        // Otomatik kaldırma
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.add('hide');
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                            updateNotificationCount();
                        }
                    }, 300);
                }
            }, duration);
        }

        // Bildirim sayısını güncelle
        updateNotificationCount();
    }

    /**
     * Bildirim sayısını günceller ve gerekirse "tümünü temizle" butonu ekler
     */
    function updateNotificationCount() {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notifications = container.querySelectorAll('.notification-item');
        const count = notifications.length;

        // Mevcut "tümünü temizle" butonunu kaldır
        const existingClearAll = container.querySelector('.notification-clear-all');
        if (existingClearAll) {
            existingClearAll.remove();
        }

        // Eğer 3'ten fazla bildirim varsa "tümünü temizle" butonu ekle
        if (count > 3) {
            const clearAllBtn = document.createElement('div');
            clearAllBtn.className = 'notification-clear-all';
            clearAllBtn.innerHTML = `
                <button class="btn btn-outline-secondary btn-sm w-100" onclick="clearAllNotifications()">
                    <i class="fas fa-times me-1"></i>Tümünü Temizle (${count})
                </button>
            `;
            container.appendChild(clearAllBtn);
        }

        // Container'ı scroll edilebilir yap (eğer çok fazla bildirim varsa)
        if (count > 3) {
            container.scrollTop = container.scrollHeight;
        }
    }

    /**
     * Tüm bildirimleri temizler
     */
    function clearAllNotifications() {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notifications = container.querySelectorAll('.notification-item');
        notifications.forEach(notification => {
            notification.classList.add('hide');
        });

        setTimeout(() => {
            container.innerHTML = '';
        }, 300);
    }

    // Global fonksiyonları window objesine ekle
    window.clearAllNotifications = clearAllNotifications;
    window.updateNotificationCount = updateNotificationCount;
}); 