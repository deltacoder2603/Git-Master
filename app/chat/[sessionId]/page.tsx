"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Github, MessageSquare, Send, Home, RefreshCw, Bot, User, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import ReactMarkdown with no SSR
const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false })

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

const API_BASE = "https://git-master-backend.vercel.app"

// Custom code block component that doesn't nest inside <p>
const CodeBlock = ({ className, children }: { className?: string; children: React.ReactNode }) => {
  const language = className ? className.replace("language-", "") : ""
  return (
    <div className="relative rounded-md my-4">
      <div className="absolute top-0 right-0 bg-gray-800 px-2 py-1 text-xs rounded-bl text-gray-400 z-10">
        {language || "code"}
      </div>
      <pre className="bg-gray-900 p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-300 border border-gray-700">
        <code>{children}</code>
      </pre>
    </div>
  )
}

export default function ChatPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const sessionId = params.sessionId as string
  const repositoryUrl = searchParams.get("repo")

  const [messages, setMessages] = useState<Message[]>([])
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSessionValid, setIsSessionValid] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-delete session when user leaves the page
  useEffect(() => {
    const handleBeforeUnload = async () => {
      // Use sendBeacon for reliable cleanup on page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(`${API_BASE}/session/${sessionId}`, JSON.stringify({ method: "DELETE" }))
      } else {
        // Fallback for browsers that don't support sendBeacon
        try {
          await fetch(`${API_BASE}/session/${sessionId}`, {
            method: "DELETE",
            keepalive: true,
          })
        } catch (error) {
          // Ignore errors during cleanup
        }
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        handleBeforeUnload()
      }
    }

    // Listen for page unload events
    window.addEventListener("beforeunload", handleBeforeUnload)
    window.addEventListener("pagehide", handleBeforeUnload)
    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      window.removeEventListener("pagehide", handleBeforeUnload)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [sessionId])

  useEffect(() => {
    // Validate session on mount
    validateSession()
  }, [sessionId])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const validateSession = async () => {
    try {
      const response = await fetch(`${API_BASE}/session-status/${sessionId}`)
      if (!response.ok) {
        setIsSessionValid(false)
        toast({
          title: "Invalid Session",
          description: "This session has expired or doesn't exist",
          variant: "destructive",
        })
      }
    } catch (error) {
      setIsSessionValid(false)
      toast({
        title: "Connection Error",
        description: "Unable to validate session",
        variant: "destructive",
      })
    }
  }

  const askQuestion = async (questionText?: string) => {
    const currentQuestion = questionText || question.trim()

    if (!currentQuestion || !isSessionValid) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentQuestion,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setQuestion("")
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE}/ask/${sessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: currentQuestion,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.answer || data.message || "I couldn't process that question. Please try again.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  if (!isSessionValid) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <Card className="bg-gray-900 border-gray-800 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Session Not Found</h2>
            <p className="text-gray-400 mb-6">This session has expired or doesn't exist.</p>
            <Button onClick={() => router.push("/")} className="bg-white text-black hover:bg-gray-200">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center animate-gradient">
                  <Github className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h1 className="text-lg font-bold">GitMaster Chat</h1>
                  {repositoryUrl && <p className="text-sm text-gray-400 truncate max-w-[300px]">{repositoryUrl}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Card - Full Screen */}
        <Card className="bg-gray-900/50 border-gray-800 bg-gradient-to-br from-gray-900 to-black flex-1 flex flex-col m-4 overflow-hidden">
          <CardHeader className="border-b border-gray-800 flex-shrink-0">
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Repository Analysis Chat
              </span>
            </CardTitle>
          </CardHeader>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Bot className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Ready to Help!
                  </h3>
                  <p className="text-sm">Ask me anything about the repository</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {message.type === "assistant" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-gray-300" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                          : "bg-gray-800 text-white border border-gray-700"
                      }`}
                    >
                      {message.type === "assistant" ? (
                        <div className="markdown-content text-sm leading-relaxed">
<ReactMarkdown
                          components={{
                            // Code block
                            pre: ({ children }) => (
                              <div className="my-4">
                                <pre className="bg-gray-800 p-4 rounded-md overflow-x-auto text-sm text-gray-100 font-mono">
                                  {children}
                                </pre>
                              </div>
                            ),
                            code: ({ node, className, children, ...props }) => {
                              return (
                                <code
                                  className={`bg-gray-800 px-1 py-0.5 rounded text-sm text-gray-100 ${className || ""}`}
                                >
                                  {children}
                                </code>
                              )
                            },
                            // Headings
                            h1: ({ children }) => <h1 className="text-xl font-semibold mt-6 mb-2">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-lg font-semibold mt-5 mb-2">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>,
                            h4: ({ children }) => <h4 className="text-base mt-3 mb-1 font-medium">{children}</h4>,
                            h5: ({ children }) => <h5 className="text-sm mt-2 mb-1 font-medium">{children}</h5>,
                            h6: ({ children }) => <h6 className="text-sm mt-2 mb-1 text-gray-400">{children}</h6>,
                            // Paragraph
                            p: ({ children }) => <p className="mb-2">{children}</p>,
                            // List
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                            li: ({ children }) => <li className="ml-4">{children}</li>,
                            // Blockquote
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-gray-300 mb-4">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                    </div>

                    {message.type === "user" && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div
                            className="w-2 h-2 rounded-full bg-blue-400 animate-bounce"
                            style={{ animationDelay: "0s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                        <span className="text-sm text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Fixed Input Area */}
          <div className="border-t border-gray-800 bg-gray-900/90 backdrop-blur-sm p-6 flex-shrink-0">
            <div className="flex gap-3">
              <Textarea
                ref={textareaRef}
                placeholder="Ask a question about the repository..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={() => askQuestion()}
                disabled={!question.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white self-end px-4 transition-all duration-300"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            <p className="text-xs text-gray-500 mt-2">Press Enter to send, Shift+Enter for new line</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
