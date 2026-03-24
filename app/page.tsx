"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "next-themes";

type Message = { role: "user" | "ai"; content: string };
type Movie = { title: string; director: string; reason: string; streamingLink?: string | null };

export default function Home() {
  const { setTheme } = useTheme();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const currentHour = new Date().getHours();

    // 1. Look for our custom flag instead of the default theme storage
    const isManual = localStorage.getItem("theme-manually-set");

    // Only apply the time logic if the user hasn't clicked the toggle yet
    if (!isManual) {
      const isNightTime = currentHour >= 18 || currentHour < 6;
      setTheme(isNightTime ? "dark" : "light");
    }

    // 2. Dynamic Greeting Logic
    let greeting = "Good evening"; 
    if (currentHour >= 5 && currentHour < 12) {
      greeting = "Good morning";   
    } else if (currentHour >= 12 && currentHour < 18) {
      greeting = "Good afternoon"; 
    }

    setMessages([
      { role: "ai", content: `${greeting}! I'm your AI movie expert. What kind of movie are you looking for today?` }
    ]);
  }, [setTheme]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsLoading(true);

    try {
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
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center py-12 px-4 transition-colors duration-300">
      
      <div className="absolute top-4 right-4 md:top-8 md:right-8">
        <ModeToggle />
      </div>

      <div className="max-w-3xl w-full space-y-8 mt-8">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Gemini Movie Recommender</h1>
          <p className="text-muted-foreground mt-2">Powered by Gemini 2.5 Flash</p>
        </div>

        <Card className="w-full shadow-lg border-border">
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
                      m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="px-4 py-2 rounded-lg bg-muted text-muted-foreground animate-pulse">
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
                className="bg-background"
              />
              <Button type="submit" disabled={isLoading || !input.trim() || movies.length > 0}>
                Send
              </Button>
            </form>
          </CardContent>
        </Card>

        {movies.length > 0 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold">Your Recommendations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movies.map((movie, idx) => (
                <Card key={idx} className="border-2 border-border flex flex-col justify-between">
                  <div>
                    <CardHeader>
                      <CardTitle className="text-xl">{movie.title}</CardTitle>
                      <CardDescription>Directed by {movie.director}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{movie.reason}</p>
                    </CardContent>
                  </div>
                  <CardFooter>
                    {movie.streamingLink ? (
                      <Button asChild className="w-full" variant="default">
                        <a href={movie.streamingLink} target="_blank" rel="noopener noreferrer">
                          Watch on JustWatch
                        </a>
                      </Button>
                    ) : (
                      <Button disabled variant="outline" className="w-full">
                        Not available to stream
                      </Button>
                    )}
                  </CardFooter>
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