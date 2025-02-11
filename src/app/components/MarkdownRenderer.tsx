'use client'

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (code: string, language: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(language);
      setTimeout(() => setCopied(null), 2000); // Ẩn thông báo sau 2 giây
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        p: ({ children, ...props }: { children?: React.ReactNode }) => {
          return <p {...props}>{children}</p>;
        },

        code: ({
          inline = false,
          className,
          children,
          ...props
        }: {
          inline?: boolean;
          className?: string;
          children?: React.ReactNode;
        }) => {
          const match = /language-(\w+)/.exec(className || "");
          const codeContent = String(children).trim();

          return !inline && match ? (
            <div style={{ position: "relative" }}>
              {/* Nút Copy */}
              <button
                onClick={() => copyToClipboard(codeContent, match[1])}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "#fff",
                  border: "none",
                  padding: "5px 10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                {copied === match[1] ? "Copied!" : "Copy"}
              </button>

              {/* Hiển thị code */}
              <SyntaxHighlighter
                style={atomDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  maxWidth: "100%",
                  overflowX: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: "15px",
                  borderRadius: "8px",
                  fontSize: "14px",
                }}
                {...props}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
