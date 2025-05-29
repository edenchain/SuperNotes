/**
 * 超级便签应用
 * 支持基本文本编辑、Markdown格式、主题切换等功能
 */

// 应用状态
let currentNoteId = null;
let notes = [];

// DOM元素
let editor;
let noteList;
let newNoteBtn;
let saveNoteBtn;
let themeToggleBtn;
let toolbarButtons;

// 初始化DOM元素
function initDOMElements() {
    console.log('初始化DOM元素...');
    
    editor = document.getElementById('editor');
    noteList = document.getElementById('note-list');
    newNoteBtn = document.getElementById('new-note');
    saveNoteBtn = document.getElementById('save-note');
    themeToggleBtn = document.getElementById('theme-toggle');
    toolbarButtons = document.querySelectorAll('.tool-btn');
    
    // 新增DOM元素
    shareNoteBtn = document.getElementById('share-note');
    themePanel = document.getElementById('theme-panel');
    shareDialog = document.getElementById('share-dialog');
    
    console.log('DOM元素初始化完成');
}

// 添加新的全局变量
let shareNoteBtn;
let themePanel;
let shareDialog;

// 初始化应用
function initApp() {
    // 首先初始化DOM元素
    initDOMElements();
    
    loadNotes();
    renderNoteList();
    setupEventListeners();
    checkTheme();
    
    // 如果有便签，加载第一个便签
    if (notes.length > 0) {
        loadNote(notes[0].id);
    } else {
        // 否则创建一个新便签
        createNewNote();
    }
    
    console.log("应用初始化完成");
}

// emoji数据


const emojiData = {
    smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
    people: ['👋', '🤚', '👌', '✋', '🖖', '👍', '🤏', '✌', '🤞', '🤟', '🤘', '🤙', '👈', '👉'],
    animals: ['🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'],
    food: ['🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
    travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍'],
    activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍'],
    objects: ['💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖', '🪜'],
    symbols: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣', '💕', '💞', '💓'],
    flags: ['🏁', '🚩', '🎌', '🏴', '🏳', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲']
};
    

// 设置事件监听器
function setupEventListeners() {
    console.log('设置事件监听器...');
    
    // 新建便签按钮
    if (newNoteBtn) {
        newNoteBtn.addEventListener('click', createNewNote);
    }
    
    // 保存便签按钮
    if (saveNoteBtn) {
        saveNoteBtn.addEventListener('click', saveCurrentNote);
    }
    
    // 主题切换按钮
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // 工具栏按钮
    if (toolbarButtons) {
        toolbarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.getAttribute('data-command');
                executeCommand(command);
            });
        });
    }
    
    // 设置皮肤面板
    setupThemePanel();
    
    // 设置分享功能
    setupShareFeature();
    
    // 设置Emoji选择器
    setupEmojiPicker();
    
    // 设置图片上传
    setupImageUpload();
    
    // 设置搜索功能
    setupSearchFeature();
    
    console.log('事件监听器设置完成');

    // Emoji选择器相关事件
    setupEmojiPicker();

    // 图片上传相关事件
    setupImageUpload();
    
    // 编辑器输入事件
    editor.addEventListener('input', debounce(() => {
        if (currentNoteId) {
            // 自动保存草稿
            const noteIndex = notes.findIndex(note => note.id === currentNoteId);
            if (noteIndex !== -1) {
                notes[noteIndex].content = editor.innerHTML;
                notes[noteIndex].lastModified = new Date().toISOString();
                saveNotesToStorage();
            }
        }
        
        // 保存当前选区
        if (window.getSelection().rangeCount > 0) {
            savedEditorSelection = saveSelection(editor);
            console.log('输入时保存选区位置');
        }
    }, 500));
    
    // 编辑器键盘事件，处理Tab键
    editor.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    });

    // 编辑器焦点事件
    editor.addEventListener('focus', () => {
        // 获取焦点时保存选区
        if (window.getSelection().rangeCount > 0) {
            savedEditorSelection = saveSelection(editor);
            console.log('编辑器获得焦点，保存选区位置');
        }
    });

    // 编辑器点击事件
    editor.addEventListener('click', () => {
        // 点击时保存选区
        if (window.getSelection().rangeCount > 0) {
            savedEditorSelection = saveSelection(editor);
            console.log('点击编辑器，保存选区位置');
        }
    });

    // 编辑器选择事件
    editor.addEventListener('select', () => {
        // 选择文本时保存选区
        if (window.getSelection().rangeCount > 0) {
            savedEditorSelection = saveSelection(editor);
            console.log('选择文本，保存选区位置');
        }
    });
}

// 创建新便签
function createNewNote() {
    const newNote = {
        id: generateId(),
        title: '新便签',
        content: '',
        created: new Date().toISOString(),
        lastModified: new Date().toISOString()
    };
    
    notes.unshift(newNote);
    saveNotesToStorage();
    renderNoteList();
    loadNote(newNote.id);
}

// 加载便签到编辑器
function loadNote(noteId) {
    const note = notes.find(note => note.id === noteId);
    if (note) {
        currentNoteId = note.id;
        editor.innerHTML = note.content;
        
        // 高亮当前选中的便签
        const noteItems = document.querySelectorAll('.note-item');
        noteItems.forEach(item => {
            if (item.getAttribute('data-id') === noteId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// 保存当前便签
function saveCurrentNote() {
    if (!currentNoteId) return;
    
    const content = editor.innerHTML;
    const title = extractTitle(content) || '无标题便签';
    
    const noteIndex = notes.findIndex(note => note.id === currentNoteId);
    if (noteIndex !== -1) {
        notes[noteIndex].title = title;
        notes[noteIndex].content = content;
        notes[noteIndex].lastModified = new Date().toISOString();
        
        saveNotesToStorage();
        renderNoteList();
        
        // 显示保存成功提示
        showNotification('便签已保存');
    }
}

// 删除便签
function deleteNote(noteId) {
    if (confirm('确定要删除这个便签吗？')) {
        notes = notes.filter(note => note.id !== noteId);
        saveNotesToStorage();
        renderNoteList();
        
        // 如果删除的是当前便签，加载另一个便签或创建新便签
        if (noteId === currentNoteId) {
            if (notes.length > 0) {
                loadNote(notes[0].id);
            } else {
                createNewNote();
            }
        }
    }
}

// 渲染便签列表
function renderNoteList() {
    noteList.innerHTML = '';
    
    if (notes.length === 0) {
        noteList.innerHTML = '<div class="empty-state">没有便签，点击"新建"创建一个便签</div>';
        return;
    }
    
    notes.forEach(note => {
        const noteItem = document.createElement('div');
        noteItem.className = 'note-item';
        noteItem.setAttribute('data-id', note.id);
        
        // 格式化日期
        const date = new Date(note.lastModified);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        noteItem.innerHTML = `
            <h3>${note.title}</h3>
            <p>${stripHtml(note.content).substring(0, 100)}${stripHtml(note.content).length > 100 ? '...' : ''}</p>
            <span class="note-date">${formattedDate}</span>
            <button class="delete-btn" title="删除便签"><i class="bi bi-trash"></i></button>
        `;
        
        // 点击便签加载内容
        noteItem.addEventListener('click', (e) => {
            if (!e.target.closest('.delete-btn')) {
                loadNote(note.id);
            }
        });
        
        // 删除按钮
        const deleteBtn = noteItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteNote(note.id);
        });
        
        noteList.appendChild(noteItem);
    });
}

// 执行编辑命令
function executeCommand(command) {
    switch (command) {
        case 'bold':
            document.execCommand('bold', false, null);
            break;
        case 'italic':
            document.execCommand('italic', false, null);
            break;
        case 'heading':
            insertHeading();
            break;
        case 'list-ul':
            document.execCommand('insertUnorderedList', false, null);
            break;
        case 'list-ol':
            document.execCommand('insertOrderedList', false, null);
            break;
        case 'link':
            insertLink();
            break;
        case 'code':
            insertCode();
            break;
        case 'emoji':
            toggleEmojiPicker();
            break;
        case 'image':
            showImageDialog();
            break;
        default:
            break;
    }
    
    // 编辑器获取焦点
    editor.focus();
}

// 设置Emoji选择器
function setupEmojiPicker() {
    console.log('设置Emoji选择器...');
    
    const emojiPicker = document.getElementById('emoji-picker');
    const closeEmojiBtn = document.getElementById('close-emoji-picker');
    const emojiList = document.getElementById('emoji-list');
    const emojiSearchInput = document.getElementById('emoji-search-input');
    const categoryButtons = document.querySelectorAll('.emoji-categories button');
    
    if (!emojiPicker || !closeEmojiBtn || !emojiList || !emojiSearchInput) {
        console.error('Emoji选择器的必要元素未找到');
        return;
    }
    
    console.log('Emoji选择器元素已找到，设置事件监听器...');

    // 关闭Emoji选择器
    closeEmojiBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        console.log('关闭Emoji选择器');
        emojiPicker.classList.remove('active');
        editor.focus(); // 恢复编辑器焦点
    });

    // 阻止Emoji选择器内的点击事件冒泡
    emojiPicker.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 点击外部关闭Emoji选择器
    document.addEventListener('click', (e) => {
        if (emojiPicker.classList.contains('active') && 
            !emojiPicker.contains(e.target) && 
            !e.target.closest('[data-command="emoji"]')) {
            console.log('点击外部，关闭Emoji选择器');
            emojiPicker.classList.remove('active');
            editor.focus(); // 恢复编辑器焦点
        }
    });

    // 切换分类
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            const category = button.getAttribute('data-category');
            console.log('切换Emoji分类:', category);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderEmojiList(category);
        });
    });

    // 搜索Emoji
    emojiSearchInput.addEventListener('input', debounce((e) => {
        e.stopPropagation(); // 阻止事件冒泡
        const searchTerm = emojiSearchInput.value.toLowerCase();
        console.log('搜索Emoji:', searchTerm);
        if (searchTerm) {
            const allEmojis = Object.values(emojiData).flat();
            const filteredEmojis = allEmojis.filter(emoji => 
                emoji.toLowerCase().includes(searchTerm)
            );
            renderEmojiList('search', filteredEmojis);
        } else {
            renderEmojiList('smileys');
        }
    }, 300));

    // 防止搜索框的键盘事件影响编辑器
    emojiSearchInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
    });

    console.log('Emoji选择器设置完成');
}

// 渲染Emoji列表
function renderEmojiList(category, customEmojis = null) {
    console.log('渲染Emoji列表，分类:', category);
    
    const emojiList = document.getElementById('emoji-list');
    if (!emojiList) {
        console.error('Emoji列表元素未找到');
        return;
    }
    
    emojiList.innerHTML = '';

    const emojis = customEmojis || emojiData[category];
    if (!emojis) {
        console.error('未找到该分类的Emoji:', category);
        return;
    }

    console.log(`为分类 ${category} 渲染 ${emojis.length} 个emoji`);

    emojis.forEach(emoji => {
        const emojiItem = document.createElement('div');
        emojiItem.className = 'emoji-item';
        emojiItem.textContent = emoji;
        emojiItem.title = emoji;
        
        // 添加点击事件处理
        emojiItem.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            e.preventDefault(); // 阻止默认行为
            
            console.log('选择Emoji:', emoji);
            
            // 在插入表情之前保存当前选区
            if (window.getSelection().rangeCount > 0) {
                savedEditorSelection = saveSelection(editor);
                console.log('保存当前选区位置');
            }
            
            // 插入表情
            insertEmoji(emoji);
            
            // 关闭选择器
            const emojiPicker = document.getElementById('emoji-picker');
            if (emojiPicker) {
                emojiPicker.classList.remove('active');
            }
            
            // 恢复编辑器焦点
            editor.focus();
        });
        
        // 添加鼠标悬停效果
        emojiItem.addEventListener('mouseenter', () => {
            emojiItem.style.backgroundColor = 'var(--hover-color)';
        });
        
        emojiItem.addEventListener('mouseleave', () => {
            emojiItem.style.backgroundColor = '';
        });
        
        emojiList.appendChild(emojiItem);
    });
}

// 全局变量，用于保存选区
let savedEditorSelection = null;

// 切换Emoji选择器显示状态
function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emoji-picker');
    if (!emojiPicker) {
        console.error('Emoji选择器元素未找到');
        return;
    }

    // 切换选择器显示状态
    const isActive = emojiPicker.classList.toggle('active');
    console.log('Emoji选择器状态已切换:', isActive);

    if (isActive) {
        // 如果是显示选择器，保存当前选区
        try {
            if (window.getSelection().rangeCount > 0) {
                savedEditorSelection = saveSelection(editor);
                console.log('已保存编辑器选区位置');
            }
        } catch (e) {
            console.error('保存选区失败:', e);
        }

        // 确保第一个分类被选中
        const firstCategory = document.querySelector('.emoji-categories button');
        if (firstCategory) {
            firstCategory.click();
        }
    } else {
        // 如果是隐藏选择器，恢复编辑器焦点
        editor.focus();
        
        // 尝试恢复之前保存的选区
        if (savedEditorSelection) {
            try {
                restoreSelection(editor, savedEditorSelection);
                console.log('已恢复编辑器选区位置');
            } catch (e) {
                console.error('恢复选区失败:', e);
            }
        }
    }
}

// 保存选区位置
function saveSelection(containerEl) {
    try {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            return null;
        }
        
        const range = selection.getRangeAt(0);
        
        // 检查选区是否在编辑器内
        let container = range.commonAncestorContainer;
        let isInEditor = false;
        
        while (container) {
            if (container === containerEl) {
                isInEditor = true;
                break;
            }
            container = container.parentNode;
        }
        
        if (!isInEditor) {
            console.log('选区不在编辑器内，不保存选区');
            return null;
        }
        
        // 保存选区信息
        return {
            startContainer: range.startContainer,
            startOffset: range.startOffset,
            endContainer: range.endContainer,
            endOffset: range.endOffset,
            collapsed: range.collapsed
        };
    } catch (e) {
        console.error('保存选区失败:', e);
        return null;
    }
}

// 恢复选区位置
function restoreSelection(containerEl, savedSel) {
    if (!savedSel) {
        console.log('没有保存的选区可恢复');
        return false;
    }
    
    try {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // 设置选区范围
        range.setStart(savedSel.startContainer, savedSel.startOffset);
        
        if (savedSel.collapsed) {
            range.collapse(true);
        } else {
            range.setEnd(savedSel.endContainer, savedSel.endOffset);
        }
        
        // 应用选区
        selection.removeAllRanges();
        selection.addRange(range);
        console.log('选区已成功恢复');
        return true;
    } catch (e) {
        console.error('恢复选区失败:', e);
        
        // 如果恢复失败，尝试将光标放在编辑器末尾
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(containerEl);
            range.collapse(false); // 折叠到末尾
            selection.removeAllRanges();
            selection.addRange(range);
            console.log('无法恢复精确选区，已将光标放在编辑器末尾');
            return true;
        } catch (fallbackError) {
            console.error('备用选区恢复也失败:', fallbackError);
            return false;
        }
    }
}

// 插入Emoji
function insertEmoji(emoji) {
    console.log('开始插入表情:', emoji);
    
    // 确保编辑器获得焦点
    editor.focus();
    
    // 创建文本节点
    const textNode = document.createTextNode(emoji);
    
    try {
        // 检查是否有保存的选区
        if (!savedEditorSelection) {
            console.log('没有保存的选区，尝试获取当前选区');
            if (window.getSelection().rangeCount > 0) {
                savedEditorSelection = saveSelection(editor);
            }
        }
        
        // 尝试恢复选区
        let selectionRestored = false;
        if (savedEditorSelection) {
            selectionRestored = restoreSelection(editor, savedEditorSelection);
            console.log('选区恢复状态:', selectionRestored);
        }
        
        // 获取当前选区
        const selection = window.getSelection();
        let range;
        
        if (selection.rangeCount > 0) {
            range = selection.getRangeAt(0);
            
            // 验证选区是否在编辑器内
            let container = range.commonAncestorContainer;
            let isInEditor = false;
            
            while (container) {
                if (container === editor) {
                    isInEditor = true;
                    break;
                }
                container = container.parentNode;
            }
            
            if (!isInEditor) {
                console.log('选区不在编辑器内，创建新选区');
                range = document.createRange();
                range.selectNodeContents(editor);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        } else {
            console.log('没有活动选区，创建新选区');
            range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
        
        // 获取最新的范围
        range = selection.getRangeAt(0);
        
        // 删除任何选中的内容
        range.deleteContents();
        
        // 插入表情
        range.insertNode(textNode);
        console.log('表情已插入到选区位置');
        
        // 将光标移动到表情后面
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 保存新的选区位置
        savedEditorSelection = saveSelection(editor);
        console.log('新的选区位置已保存');
        
    } catch (error) {
        console.error('插入表情时出错:', error);
        
        // 使用备用方法：在末尾插入
        try {
            const selection = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(editor);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
            
            range.insertNode(textNode);
            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            console.log('使用备用方法在末尾插入表情');
            
            // 保存新的选区位置
            savedEditorSelection = saveSelection(editor);
        } catch (fallbackError) {
            console.error('备用插入方法也失败:', fallbackError);
            // 最后的尝试：直接追加到编辑器
            editor.appendChild(textNode);
            console.log('使用最后方法：直接追加到编辑器');
        }
    }
    
    // 隐藏表情选择器
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker && emojiPicker.classList.contains('active')) {
        emojiPicker.classList.remove('active');
    }
    
    // 触发input事件以保存更改
    editor.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true
    }));
    
    // 确保编辑器保持焦点
    editor.focus();
}

// 设置图片上传
function setupImageUpload() {
    console.log('设置图片上传...');
    
    const imageDialog = document.getElementById('image-upload-dialog');
    const closeImageBtn = document.getElementById('close-image-dialog');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('image-file-input');
    const imagePreview = document.getElementById('image-preview');
    const previewImage = document.getElementById('preview-image');
    const removeImageBtn = document.getElementById('remove-image');
    const insertImageBtn = document.getElementById('insert-image');
    const cancelImageBtn = document.getElementById('cancel-image');
    const imageUrlInput = document.getElementById('image-url-input');
    const tabButtons = document.querySelectorAll('.tab-btn');

    // 检查必要元素是否存在
    if (!imageDialog || !closeImageBtn || !uploadArea || !fileInput || 
        !imagePreview || !previewImage || !removeImageBtn || 
        !insertImageBtn || !cancelImageBtn || !imageUrlInput) {
        console.error('图片上传对话框的必要元素未找到');
        return;
    }
    
    console.log('图片上传元素已找到，设置事件监听器...');

    let currentFile = null;

    // 标签切换
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            console.log('切换到标签:', tab);
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            const tabContent = document.getElementById(`${tab}-tab`);
            if (tabContent) {
                tabContent.style.display = 'block';
            } else {
                console.error(`未找到标签内容: ${tab}-tab`);
            }
        });
    });

    // 关闭对话框
    closeImageBtn.addEventListener('click', () => {
        console.log('点击关闭按钮');
        closeImageDialog();
    });
    
    cancelImageBtn.addEventListener('click', () => {
        console.log('点击取消按钮');
        closeImageDialog();
    });

    // 处理拖放
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--accent-color)';
        console.log('拖动文件到上传区域');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-color)';
        console.log('拖动文件离开上传区域');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-color)';
        console.log('文件已放置到上传区域');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            console.log('拖放的文件是图片:', file.name);
            handleImageFile(file);
        } else {
            console.error('拖放的文件不是图片');
        }
    });

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        console.log('点击上传区域，触发文件选择');
        fileInput.click();
    });

    // 处理文件选择
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            console.log('选择了文件:', file.name);
            handleImageFile(file);
        }
    });

    // 移除预览图片
    removeImageBtn.addEventListener('click', () => {
        console.log('移除预览图片');
        currentFile = null;
        imagePreview.classList.remove('active');
        uploadArea.style.display = 'block';
    });

    // 插入图片
    insertImageBtn.addEventListener('click', () => {
        console.log('点击插入图片按钮');
        
        const activeTabBtn = document.querySelector('.tab-btn.active');
        if (!activeTabBtn) {
            console.error('未找到活动标签');
            return;
        }
        
        const activeTab = activeTabBtn.getAttribute('data-tab');
        console.log('当前活动标签:', activeTab);
        
        if (activeTab === 'upload' && currentFile) {
            console.log('从本地文件插入图片');
            const reader = new FileReader();
            reader.onload = (e) => {
                insertImageToEditor(e.target.result);
                closeImageDialog();
            };
            reader.readAsDataURL(currentFile);
        } else if (activeTab === 'url') {
            const imageUrl = imageUrlInput.value.trim();
            if (imageUrl) {
                console.log('从URL插入图片:', imageUrl);
                insertImageToEditor(imageUrl);
                closeImageDialog();
            } else {
                console.error('URL为空');
            }
        }
    });

    // 处理图片文件
    function handleImageFile(file) {
        if (file.type.startsWith('image/')) {
            console.log('处理图片文件:', file.name);
            currentFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('图片文件已读取，显示预览');
                previewImage.src = e.target.result;
                imagePreview.classList.add('active');
                uploadArea.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else {
            console.error('文件不是图片类型');
        }
    }
    
    console.log('图片上传设置完成');
}

// 显示图片上传对话框
function showImageDialog() {
    const imageDialog = document.getElementById('image-upload-dialog');
    if (!imageDialog) {
        console.error('图片上传对话框元素未找到');
        return;
    }
    
    imageDialog.classList.add('active');
    
    // 重置对话框状态
    const urlInput = document.getElementById('image-url-input');
    const imagePreview = document.getElementById('image-preview');
    const uploadArea = document.getElementById('upload-area');
    const uploadTab = document.querySelector('.tab-btn[data-tab="upload"]');
    
    if (urlInput) urlInput.value = '';
    if (imagePreview) imagePreview.classList.remove('active');
    if (uploadArea) uploadArea.style.display = 'block';
    if (uploadTab) uploadTab.click();
    
    console.log('图片上传对话框已显示');
}

// 关闭图片上传对话框
function closeImageDialog() {
    const imageDialog = document.getElementById('image-upload-dialog');
    if (!imageDialog) {
        console.error('图片上传对话框元素未找到');
        return;
    }
    
    imageDialog.classList.remove('active');
    console.log('图片上传对话框已关闭');
}

// 插入图片到编辑器
function insertImageToEditor(src) {
    // 确保编辑器获得焦点
    editor.focus();
    
    // 创建图片容器
    const container = document.createElement('div');
    container.className = 'image-container';
    container.style.margin = '10px 0';
    container.style.textAlign = 'center';
    
    // 创建图片元素
    const img = document.createElement('img');
    img.src = src;
    img.style.maxWidth = '100%';
    img.style.height = 'auto';
    img.style.display = 'inline-block';
    
    // 将图片添加到容器中
    container.appendChild(img);
    
    // 在图片后添加一个换行
    const br = document.createElement('br');
    container.appendChild(br);
    
    // 获取当前选区
    const selection = window.getSelection();
    if (selection.rangeCount === 0) {
        // 如果没有选区，在编辑器末尾插入
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(container);
    
    // 将光标移动到图片后面
    range.setStartAfter(container);
    range.setEndAfter(container);
    selection.removeAllRanges();
    selection.addRange(range);
    
    // 触发input事件以保存更改
    editor.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true
    }));
    
    // 图片加载完成后再次触发保存
    img.onload = () => {
        editor.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true
        }));
    };
}

// 插入标题
function insertHeading() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
            // 获取当前选中文本的父元素
            const parentElement = range.commonAncestorContainer.parentElement;
            
            // 检查是否已经是标题
            if (parentElement.tagName && parentElement.tagName.match(/^H[1-6]$/)) {
                // 如果已经是标题，转换为段落
                document.execCommand('formatBlock', false, 'p');
            } else {
                // 否则转换为h2标题
                document.execCommand('formatBlock', false, 'h2');
            }
        } else {
            // 如果没有选中文本，插入一个新的标题
            document.execCommand('formatBlock', false, 'h2');
        }
    }
}

// 插入链接
function insertLink() {
    const url = prompt('请输入链接地址:', 'http://');
    if (url) {
        document.execCommand('createLink', false, url);
        
        // 为新创建的链接添加target="_blank"属性
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const links = editor.querySelectorAll('a');
            links.forEach(link => {
                if (link.href === url) {
                    link.setAttribute('target', '_blank');
                }
            });
        }
    }
}

// 插入代码
function insertCode() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText) {
            // 行内代码
            const codeElement = document.createElement('code');
            codeElement.textContent = selectedText;
            
            range.deleteContents();
            range.insertNode(codeElement);
        } else {
            // 代码块
            const codeBlock = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = '在这里输入代码';
            codeBlock.appendChild(code);
            
            range.deleteContents();
            range.insertNode(codeBlock);
        }
    }
}

// 从内容中提取标题
function extractTitle(content) {
    // 尝试从内容中提取第一个标题
    const headingMatch = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i);
    if (headingMatch && headingMatch[1]) {
        return stripHtml(headingMatch[1]);
    }
    
    // 如果没有标题，提取第一行文本
    const firstLine = stripHtml(content).split('\n')[0].trim();
    return firstLine.substring(0, 30) || '无标题便签';
}

// 切换主题面板
function toggleTheme() {
    const themePanel = document.getElementById('theme-panel');
    if (themePanel) {
        themePanel.classList.toggle('active');
        console.log('主题面板状态已切换:', themePanel.classList.contains('active'));
    } else {
        console.error('主题面板元素未找到');
    }
}

// 检查并应用保存的主题
function checkTheme() {
    const savedTheme = localStorage.getItem('noteTheme') || 'light';
    applyTheme(savedTheme);
    console.log('应用保存的主题:', savedTheme);
}

// 应用主题
function applyTheme(theme) {
    // 移除所有主题类
    document.body.classList.remove(
        'dark-theme', 
        'sepia-theme', 
        'forest-theme', 
        'ocean-theme', 
        'sunset-theme'
    );
    
    // 应用选择的主题
    if (theme !== 'light') {
        document.body.classList.add(`${theme}-theme`);
    }
    
    // 保存主题设置
    localStorage.setItem('noteTheme', theme);
    console.log('主题已切换为:', theme);
}

// 设置主题面板
function setupThemePanel() {
    console.log('设置主题面板...');
    
    const themePanel = document.getElementById('theme-panel');
    const closeThemeBtn = document.getElementById('close-theme-panel');
    const themeItems = document.querySelectorAll('.theme-item');
    
    if (!themePanel || !closeThemeBtn) {
        console.error('主题面板的必要元素未找到');
        return;
    }
    
    // 关闭主题面板
    closeThemeBtn.addEventListener('click', () => {
        themePanel.classList.remove('active');
        console.log('主题面板已关闭');
    });
    
    // 点击外部关闭主题面板
    document.addEventListener('click', (e) => {
        if (themePanel.classList.contains('active') && 
            !themePanel.contains(e.target) && 
            !e.target.closest('#theme-toggle')) {
            themePanel.classList.remove('active');
            console.log('点击外部，关闭主题面板');
        }
    });
    
    // 选择主题
    themeItems.forEach(item => {
        item.addEventListener('click', () => {
            const theme = item.getAttribute('data-theme');
            applyTheme(theme);
            themePanel.classList.remove('active');
        });
    });
    
    console.log('主题面板设置完成');
}

// 设置分享功能
function setupShareFeature() {
    console.log('设置分享功能...');
    
    const shareBtn = document.getElementById('share-note');
    const shareDialog = document.getElementById('share-dialog');
    const closeShareBtn = document.getElementById('close-share-dialog');
    const copyTextBtn = document.getElementById('copy-text');
    const copyHtmlBtn = document.getElementById('copy-html');
    const copyMarkdownBtn = document.getElementById('copy-markdown');
    const saveImageBtn = document.getElementById('save-image');
    const previewContent = document.getElementById('preview-content');
    
    if (!shareBtn || !shareDialog || !closeShareBtn || !previewContent) {
        console.error('分享功能的必要元素未找到');
        return;
    }
    
    // 显示分享对话框
    shareBtn.addEventListener('click', () => {
        if (!currentNoteId) {
            showNotification('请先保存便签');
            return;
        }
        
        const note = notes.find(note => note.id === currentNoteId);
        if (note) {
            // 显示预览
            previewContent.innerHTML = note.content;
            shareDialog.classList.add('active');
            console.log('分享对话框已显示');
        }
    });
    
    // 关闭分享对话框
    closeShareBtn.addEventListener('click', () => {
        shareDialog.classList.remove('active');
        console.log('分享对话框已关闭');
    });
    
    // 点击外部关闭分享对话框
    shareDialog.addEventListener('click', (e) => {
        if (e.target === shareDialog) {
            shareDialog.classList.remove('active');
            console.log('点击外部，关闭分享对话框');
        }
    });
    
    // 复制文本
    if (copyTextBtn) {
        copyTextBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                const plainText = stripHtml(note.content);
                copyToClipboard(plainText);
                showNotification('文本已复制到剪贴板');
            }
        });
    }
    
    // 复制HTML
    if (copyHtmlBtn) {
        copyHtmlBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                copyToClipboard(note.content);
                showNotification('HTML已复制到剪贴板');
            }
        });
    }
    
    // 复制Markdown
    if (copyMarkdownBtn) {
        copyMarkdownBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                const markdown = htmlToMarkdown(note.content);
                copyToClipboard(markdown);
                showNotification('Markdown已复制到剪贴板');
            }
        });
    }

    // 导出Markdown文件
    const saveMarkdownBtn = document.getElementById('save-markdown');
    if (saveMarkdownBtn) {
        saveMarkdownBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                const markdown = htmlToMarkdown(note.content);
                const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${note.title || 'note'}.md`;
                link.click();
                URL.revokeObjectURL(url);
                showNotification('Markdown文件已下载');
            }
        });
    }

    // 导出PDF
    const savePdfBtn = document.getElementById('save-pdf');
    if (savePdfBtn) {
        savePdfBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                exportToPdf(previewContent, note.title);
            }
        });
    }
    
    // PDF导出功能
    async function exportToPdf(content, title) {
        try {
            // 创建一个临时容器来设置PDF内容的样式
            const container = document.createElement('div');
            container.innerHTML = content.innerHTML;
            container.style.padding = '20px';
            container.style.color = '#000';
            container.style.backgroundColor = '#fff';
            
            // 配置PDF选项
            const opt = {
                margin: [10, 10],
                filename: `${title || 'note'}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };

            // 显示加载提示
            showNotification('正在生成PDF...');

            // 生成PDF
            await html2pdf().set(opt).from(container).save();
            
            // 显示成功提示
            showNotification('PDF已生成并下载');
        } catch (error) {
            console.error('PDF生成失败:', error);
            showNotification('PDF生成失败，请重试', 'error');
        }
    }

    // 保存为图片
    if (saveImageBtn) {
        saveImageBtn.addEventListener('click', () => {
            const note = notes.find(note => note.id === currentNoteId);
            if (note) {
                saveAsImage(previewContent, note.title);
            }
        });
    }
    
    console.log('分享功能设置完成');
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('内容已复制到剪贴板');
        })
        .catch(err => {
            console.error('复制失败:', err);
        });
}

// HTML转Markdown (简化版)
function htmlToMarkdown(html) {
    let markdown = html;
    
    // 替换标题
    markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    
    // 替换段落
    markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    
    // 替换加粗和斜体
    markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    
    // 替换链接
    markdown = markdown.replace(/<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    
    // 替换列表
    markdown = markdown.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, function(match, content) {
        return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
    });
    
    markdown = markdown.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, function(match, content) {
        let index = 1;
        return content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, function(match, item) {
            return (index++) + '. ' + item + '\n';
        });
    });
    
    // 替换代码
    markdown = markdown.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n\n');
    markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    
    // 替换图片
    markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*>/gi, '![]($1)');
    
    // 清理HTML标签
    markdown = markdown.replace(/<[^>]+>/g, '');
    
    // 清理多余空行
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return markdown;
}

// 保存为图片
function saveAsImage(element, filename) {
    if (!element) {
        console.error('元素未找到');
        return;
    }
    
    // 使用html2canvas库将DOM元素转换为canvas
    try {
        // 检查是否已加载html2canvas
        if (typeof html2canvas === 'undefined') {
            // 如果未加载，动态加载脚本
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.onload = function() {
                console.log('html2canvas已加载');
                convertToImage();
            };
            script.onerror = function() {
                console.error('加载html2canvas失败');
                showNotification('无法加载图片转换库，请检查网络连接');
            };
            document.head.appendChild(script);
        } else {
            convertToImage();
        }
    } catch (error) {
        console.error('保存图片时出错:', error);
        showNotification('保存图片失败');
    }
    
    function convertToImage() {
        // 创建一个包装元素，设置固定宽度和背景色
        const wrapper = document.createElement('div');
        wrapper.style.width = '800px';
        wrapper.style.padding = '20px';
        wrapper.style.backgroundColor = 'white';
        wrapper.style.position = 'fixed';
        wrapper.style.top = '-9999px';
        wrapper.style.left = '-9999px';
        
        // 克隆内容到包装元素
        const clone = element.cloneNode(true);
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        
        // 转换为canvas
        html2canvas(wrapper, {
            scale: 2, // 提高分辨率
            useCORS: true, // 允许加载跨域图片
            backgroundColor: 'white'
        }).then(canvas => {
            // 转换为图片并下载
            const imgData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = (filename || 'note') + '.png';
            link.href = imgData;
            link.click();
            
            // 清理临时元素
            document.body.removeChild(wrapper);
            showNotification('图片已保存');
        }).catch(error => {
            console.error('转换为图片时出错:', error);
            document.body.removeChild(wrapper);
            showNotification('保存图片失败');
        });
    }
}

// 从本地存储加载便签
function loadNotes() {
    const storedNotes = localStorage.getItem('superNotes');
    if (storedNotes) {
        try {
            notes = JSON.parse(storedNotes);
        } catch (e) {
            console.error('Failed to parse notes from localStorage:', e);
            notes = [];
        }
    }
}

// 保存便签到本地存储
function saveNotesToStorage() {
    localStorage.setItem('superNotes', JSON.stringify(notes));
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 添加样式
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '10px 20px';
    notification.style.backgroundColor = 'var(--accent-color)';
    notification.style.color = 'white';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 8px var(--shadow-color)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // 显示通知
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // 3秒后隐藏通知
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // 移除元素
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 辅助函数：生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 辅助函数：去除HTML标签
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// 设置搜索功能
function setupSearchFeature() {
    console.log('设置搜索功能...');
    
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const closeSearchBtn = document.getElementById('close-search-btn');
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const searchCount = document.getElementById('search-count');
    
    if (!searchInput || !searchBtn || !clearSearchBtn || !closeSearchBtn || !searchResults || !searchResultsList) {
        console.error('搜索功能的必要元素未找到');
        return;
    }
    
    // 搜索输入框事件
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim();
        clearSearchBtn.style.display = query ? 'block' : 'none';
        
        if (query.length >= 1) {
            performSearch(query);
        } else {
            closeSearchResults();
        }
    }, 300));
    
    // 搜索按钮点击事件
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    });
    
    // 回车触发搜索
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }
    });
    
    // 清除搜索
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        closeSearchResults();
    });
    
    // 关闭搜索结果
    closeSearchBtn.addEventListener('click', closeSearchResults);
    
    // 搜索结果点击事件
    searchResultsList.addEventListener('click', (e) => {
        const resultItem = e.target.closest('.search-result-item');
        if (resultItem) {
            const noteId = resultItem.dataset.noteId;
            if (noteId) {
                loadNote(noteId);
                closeSearchResults();
            }
        }
    });
}

// 执行搜索
function performSearch(query) {
    console.log('执行搜索:', query);
    
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const searchCount = document.getElementById('search-count');
    
    if (!searchResults || !searchResultsList || !searchCount) {
        console.error('搜索结果元素未找到');
        return;
    }
    
    // 转换查询为小写以进行不区分大小写的搜索
    const queryLower = query.toLowerCase();
    
    // 搜索便签
    const results = notes.filter(note => {
        const titleLower = stripHtml(note.title).toLowerCase();
        const contentLower = stripHtml(note.content).toLowerCase();
        return titleLower.includes(queryLower) || contentLower.includes(queryLower);
    });
    
    // 更新搜索结果计数
    searchCount.textContent = results.length;
    
    // 显示搜索结果区域
    searchResults.style.display = 'block';
    
    // 清空并重新填充结果列表
    searchResultsList.innerHTML = '';
    
    if (results.length === 0) {
        searchResultsList.innerHTML = '<div class="no-results">没有找到匹配的便签</div>';
        return;
    }
    
    // 渲染搜索结果
    results.forEach(note => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        resultItem.dataset.noteId = note.id;
        
        // 获取标题和内容的纯文本
        const title = stripHtml(note.title);
        const content = stripHtml(note.content);
        
        // 高亮显示匹配的文本
        const highlightedTitle = highlightText(title, query);
        const highlightedContent = highlightText(getContextAroundMatch(content, query), query);
        
        // 格式化日期
        const date = new Date(note.lastModified);
        const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        resultItem.innerHTML = `
            <h3>${highlightedTitle}</h3>
            <p>${highlightedContent}</p>
            <div class="result-date">${formattedDate}</div>
        `;
        
        searchResultsList.appendChild(resultItem);
    });
}

// 关闭搜索结果
function closeSearchResults() {
    const searchResults = document.getElementById('search-results');
    if (searchResults) {
        searchResults.style.display = 'none';
    }
}

// 高亮显示匹配的文本
function highlightText(text, query) {
    if (!query) return text;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const parts = [];
    let lastIndex = 0;
    
    let index = textLower.indexOf(queryLower);
    while (index !== -1) {
        // 添加不匹配的部分
        if (index > lastIndex) {
            parts.push(text.substring(lastIndex, index));
        }
        
        // 添加高亮的匹配部分
        parts.push(`<span class="highlight">${text.substring(index, index + query.length)}</span>`);
        
        lastIndex = index + query.length;
        index = textLower.indexOf(queryLower, lastIndex);
    }
    
    // 添加剩余的文本
    if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
    }
    
    return parts.join('');
}

// 获取匹配周围的上下文
function getContextAroundMatch(text, query) {
    const contextLength = 50; // 匹配前后显示的字符数
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    
    if (index === -1) {
        // 如果没有找到匹配，返回开头的一部分文本
        return text.substring(0, contextLength * 2) + (text.length > contextLength * 2 ? '...' : '');
    }
    
    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + query.length + contextLength);
    
    let result = '';
    if (start > 0) {
        result += '...';
    }
    result += text.substring(start, end);
    if (end < text.length) {
        result += '...';
    }
    
    return result;
}

// 辅助函数：清除HTML标签
function stripHtml(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// 辅助函数：防抖
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);