"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Github, Brain, ArrowRight, RefreshCw, Code, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const API_BASE = "https://git-master-backend.vercel.app"

export default function HomePage() {
  const [repositoryUrl, setRepositoryUrl] = useState("")
  const [isCreatingSession, setIsCreatingSession] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (!repositoryUrl.trim()) {
      toast({
        title: "Repository URL Required",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      })
      return
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/
    if (!githubUrlPattern.test(repositoryUrl.trim())) {
      toast({
        title: "Invalid URL Format",
        description: "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)",
        variant: "destructive",
      })
      return
    }

    try {
      // Step 1: Create session
      setIsCreatingSession(true)
      const sessionResponse = await fetch(`${API_BASE}/create-session`, {
        method: "POST",
      })

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session")
      }

      const sessionData = await sessionResponse.json()
      const newSessionId = sessionData.session_id

      setSessionId(newSessionId)
      setIsCreatingSession(false)

      toast({
        title: "Session Created",
        description: "Starting repository analysis...",
      })

      // Step 2: Analyze repository
      setIsAnalyzing(true)
      const analyzeResponse = await fetch(`${API_BASE}/analyze/${newSessionId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          github_url: repositoryUrl.trim(),
        }),
      })

      if (!analyzeResponse.ok) {
        throw new Error("Failed to analyze repository")
      }

      toast({
        title: "Analysis Complete!",
        description: "Repository analyzed successfully. Redirecting to chat...",
      })

      // Step 3: Redirect to chat page
      setTimeout(() => {
        router.push(`/chat/${newSessionId}?repo=${encodeURIComponent(repositoryUrl.trim())}`)
      }, 1500)
    } catch (error) {
      setIsCreatingSession(false)
      setIsAnalyzing(false)
      setSessionId(null)

      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const isLoading = isCreatingSession || isAnalyzing

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse" />
      </div>

      {/* RGB Animated Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-x" />

      <div className="absolute top-20 left-10 w-2 h-2 bg-blue-500 rounded-full animate-pulse-slow" />
      <div
        className="absolute top-40 right-20 w-2 h-2 bg-purple-500 rounded-full animate-pulse-slow"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-40 left-20 w-2 h-2 bg-pink-500 rounded-full animate-pulse-slow"
        style={{ animationDelay: "2s" }}
      />

      <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-blob" />
      <div
        className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/5 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "4s" }}
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center transform rotate-3 hover:rotate-6 transition-transform duration-300 animate-gradient">
              <Github className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                GitMaster
              </h1>
              <p className="text-gray-400 text-sm">AI-Powered Repository Analysis</p>
            </div>
          </div>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Unlock the secrets of any GitHub repository with AI-powered analysis and intelligent Q&A
          </p>
        </header>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group hover:border-blue-500/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  Smart Analysis
                </h3>
                <p className="text-gray-400 text-sm">Deep code understanding with AI insights</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group hover:border-purple-500/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  Code Insights
                </h3>
                <p className="text-gray-400 text-sm">Understand complex codebases instantly</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-300 group hover:border-pink-500/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors">
                  Deep Context
                </h3>
                <p className="text-gray-400 text-sm">Get answers with full repository context</p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Form */}
          <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />

            <CardHeader className="text-center relative z-10">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Github className="w-6 h-6" />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Analyze Repository
                </span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter a GitHub repository URL to start the AI-powered analysis
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
              {/* URL Input */}
              <div className="space-y-2">
                <Input
                  placeholder="https://github.com/username/repository"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 h-12 text-lg focus:border-purple-500 focus:ring-purple-500/20 transition-colors"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isLoading) {
                      handleAnalyze()
                    }
                  }}
                />
              </div>

              {/* Status Display */}
              {sessionId && (
                <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-sm text-gray-300">Session Created</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-gray-600 text-gray-300 font-mono bg-gradient-to-r from-blue-500/10 to-purple-500/10"
                    >
                      {sessionId.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={handleAnalyze}
                disabled={isLoading || !repositoryUrl.trim()}
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-70"
              >
                {isCreatingSession ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Creating Session...
                  </>
                ) : isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    Start Analysis
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Progress Steps */}
              {isLoading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-gray-400">{isCreatingSession ? "1/2" : "2/2"}</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: isCreatingSession ? "50%" : "100%" }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    {isCreatingSession ? "Setting up analysis session..." : "Processing repository structure..."}
                  </div>
                </div>
              )}

              {/* Example URLs */}
              <div className="pt-4 border-t border-gray-800">
                <p className="text-sm text-gray-400 mb-3">Try these example repositories:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "https://github.com/vercel/next.js",
                    "https://github.com/facebook/react",
                    "https://github.com/microsoft/vscode",
                  ].map((url, index) => (
                    <button
                      key={url}
                      onClick={() => setRepositoryUrl(url)}
                      disabled={isLoading}
                      className={`text-xs px-3 py-1 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                        ${
                          index === 0
                            ? "bg-blue-500/30 hover:bg-blue-500/50"
                            : index === 1
                              ? "bg-purple-500/30 hover:bg-purple-500/50"
                              : "bg-pink-500/30 hover:bg-pink-500/50"
                        }`}
                    >
                      {url.split("/").slice(-2).join("/")}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
