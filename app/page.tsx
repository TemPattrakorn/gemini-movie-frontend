"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Types for our state
type Message = { role: "user" | "ai"; content: string };
type Movie = { title: string; director: string; reason: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hi! I'm your AI movie expert. What kind of movie are you looking for today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);

  // Auto-scroll to bottom of chat
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
      // Send the request to your live Render Backend
      const res = await fetch("https://gemini-movie-recommender.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          session_id: sessionId,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch response from API");

      const data = await res.json();
      
      // Save the session ID so the AI remembers the conversation
      setSessionId(data.session_id);

      const result = data.result;

      if (result.status === "clarifying") {
        setMessages((prev) => [...prev, { role: "ai", content: result.message }]);
      } else if (result.status === "success") {
        setMessages((prev) => [...prev, { role: "ai", content: "Here is what I recommend!" }]);
        setMovies(result.movies);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: "Oops, something went wrong with the AI format." }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "ai", content: "Error connecting to the server. Is it awake?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">Gemini Movie Recommender</h1>
          <p className="text-slate-500 mt-2">Powered by Gemini 2.5 Flash & FastAPI</p>
        </div>

        {/* Chat Interface */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle>Chat with your AI Guide</CardTitle>
            <CardDescription>Keep answering questions until it finds the perfect match.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full pr-4 mb-4" ref={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      m.role === "user" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <form onSubmit={sendMessage} className="flex gap-2">
              <Input 
                placeholder="Type your answer..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || movies.length > 0}
              />
              <Button type="submit" disabled={isLoading || !input.trim() || movies.length > 0}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Movie Recommendations Display */}
        {movies.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900">Your Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movies.map((movie, idx) => (
                <Card key={idx} className="border-2 border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-xl">{movie.title}</CardTitle>
                    <CardDescription>Directed by {movie.director}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{movie.reason}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => {
                setMovies([]);
                setMessages([{ role: "ai", content: "Let's find another movie! What are you in the mood for now?" }]);
                setSessionId(null);
              }}
            >
              Start Over
            </Button>
          </div>
        )}

      </div>
    </main>
  );
}