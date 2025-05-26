/**
 * 简单的Markdown解析器
 * 支持基本的Markdown语法：标题、加粗、斜体、列表、链接、代码块等
 */
class MarkdownParser {
    constructor() {
        // 定义Markdown语法的正则表达式
        this.rules = [
            // 标题 (# 标题)
            { pattern: /^(#{1,6})\s+(.+)$/gm, replacement: (match, hashes, content) => {
                const level = hashes.length;
                return `<h${level}>${content}</h${level}>`;
            }},
            
            // 加粗 (**文本** 或 __文本__)
            { pattern: /(\*\*|__)(.*?)\1/g, replacement: (match, wrapper, content) => {
                return `<strong>${content}</strong>`;
            }},
            
            // 斜体 (*文本* 或 _文本_)
            { pattern: /(\*|_)(.*?)\1/g, replacement: (match, wrapper, content) => {
                return `<em>${content}</em>`;
            }},
            
            // 无序列表 (- 项目 或 * 项目)
            { pattern: /^([\s]*)([-*])\s+(.+)$/gm, replacement: (match, indent, bullet, content) => {
                const indentLevel = indent.length;
                return `${indent}<li>${content}</li>`;
            }},
            
            // 有序列表 (1. 项目)
            { pattern: /^([\s]*)(\d+\.)\s+(.+)$/gm, replacement: (match, indent, number, content) => {
                const indentLevel = indent.length;
                return `${indent}<li>${content}</li>`;
            }},
            
            // 链接 [文本](URL)
            { pattern: /\[([^\]]+)\]\(([^)]+)\)/g, replacement: (match, text, url) => {
                return `<a href="${url}" target="_blank">${text}</a>`;
            }},
            
            // 行内代码 (`代码`)
            { pattern: /`([^`]+)`/g, replacement: (match, code) => {
                return `<code>${code}</code>`;
            }},
            
            // 代码块 (```代码```)
            { pattern: /```([\s\S]*?)```/g, replacement: (match, code) => {
                return `<pre><code>${code}</code></pre>`;
            }},
            
            // 引用 (> 文本)
            { pattern: /^>\s+(.+)$/gm, replacement: (match, content) => {
                return `<blockquote>${content}</blockquote>`;
            }},
            
            // 水平线 (--- 或 *** 或 ___)
            { pattern: /^([-*_]){3,}$/gm, replacement: () => {
                return `<hr>`;
            }},
            
            // 段落 (将连续的文本行转换为段落)
            { pattern: /^(?!<[a-z]|\s*$)(.+)$/gm, replacement: (match, content) => {
                return `<p>${content}</p>`;
            }}
        ];
    }

    /**
     * 将Markdown文本转换为HTML
     * @param {string} text - Markdown格式的文本
     * @returns {string} - 转换后的HTML
     */
    parse(text) {
        if (!text) return '';
        
        let html = text;
        
        // 预处理：处理列表
        html = this.preprocessLists(html);
        
        // 应用所有规则
        this.rules.forEach(rule => {
            html = html.replace(rule.pattern, rule.replacement);
        });
        
        // 后处理：清理和修复HTML
        html = this.postprocess(html);
        
        return html;
    }
    
    /**
     * 预处理列表，将连续的列表项包装在<ul>或<ol>标签中
     * @param {string} text - 原始文本
     * @returns {string} - 处理后的文本
     */
    preprocessLists(text) {
        // 处理无序列表
        text = text.replace(/(?:^|\n)([\s]*[-*]\s+.+)(?:\n(?:\1)|$)+/g, (match) => {
            const items = match.split('\n').filter(item => item.trim());
            const indent = items[0].match(/^[\s]*/)[0].length;
            return `\n<ul>\n${match}\n</ul>\n`;
        });
        
        // 处理有序列表
        text = text.replace(/(?:^|\n)([\s]*\d+\.\s+.+)(?:\n(?:\1)|$)+/g, (match) => {
            const items = match.split('\n').filter(item => item.trim());
            const indent = items[0].match(/^[\s]*/)[0].length;
            return `\n<ol>\n${match}\n</ol>\n`;
        });
        
        return text;
    }
    
    /**
     * 后处理HTML，修复可能的问题
     * @param {string} html - 转换后的HTML
     * @returns {string} - 修复后的HTML
     */
    postprocess(html) {
        // 修复嵌套标签问题
        html = html.replace(/<\/([a-z]+)>\s*<\/([a-z]+)>/g, (match, inner, outer) => {
            if (inner === 'li' && (outer === 'ul' || outer === 'ol')) {
                return `</li></${outer}>`;
            }
            return match;
        });
        
        // 修复段落内的其他标签
        html = html.replace(/<p>(<[a-z][^>]*>)/g, '$1');
        html = html.replace(/(<\/[a-z][^>]*>)<\/p>/g, '$1');
        
        return html;
    }
}

// 创建全局实例
const markdownParser = new MarkdownParser();