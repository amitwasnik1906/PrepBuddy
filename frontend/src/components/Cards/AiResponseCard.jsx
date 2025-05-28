import React from 'react'
import ReactMarkdown from 'react-markdown';

function AiResponseCard({ text }) {
    return (
        <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            <ReactMarkdown
                components={{
                    code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="my-4 rounded-md overflow-hidden bg-gray-50 border border-gray-200">
                                <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs text-gray-600 font-mono">
                                    {match[1]}
                                </div>
                                <pre className="p-4 overflow-x-auto">
                                    <code className={`language-${match[1]}`} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono">
                                {children}
                            </code>
                        );
                    }
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    )
}

export default AiResponseCard