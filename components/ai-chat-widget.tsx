"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  IconRobot,
  IconSend,
  IconX,
  IconSparkles,
  IconChartBar,
  IconUsers,
  IconCash,
  IconMessageCircle,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatStats {
  totalTransactions: number;
  totalRevenue: number;
  totalMembers: number;
  todayTransactions: number;
  monthTransactions: number;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👋 Halo! Saya AI Assistant SmartLaundry. Saya bisa membantu Anda dengan:\n\n• Statistik bisnis real-time\n• Analisis performa outlet\n• Informasi transaksi\n• Rekomendasi bisnis\n\nAda yang bisa saya bantu?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick action suggestions
  const quickActions = [
    {
      icon: IconChartBar,
      label: "Total Transaksi",
      query: "Berapa total transaksi?",
    },
    { icon: IconCash, label: "Revenue", query: "Berapa total revenue?" },
    { icon: IconUsers, label: "Top Member", query: "Siapa member terbaik?" },
  ];

  useEffect(() => {
    // Auto scroll ke bawah saat ada message baru
    if (scrollAreaRef.current) {
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim();

    if (!textToSend) return;

    // Add user message
    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        if (data.stats) {
          setStats(data.stats);
        }
      } else {
        toast.error(data.error || "Gagal mendapatkan respons dari AI");

        // Tampilkan pesan error dari AI di chat juga
        const errorMessage: Message = {
          role: "assistant",
          content: `⚠️ Maaf, terjadi kesalahan: ${
            data.error || "Gagal mendapatkan respons"
          }\n\n${
            data.details
              ? `Detail: ${data.details}`
              : "Pastikan API key sudah dikonfigurasi dengan benar."
          }`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Terjadi kesalahan saat mengirim pesan");

      // Tampilkan error di chat
      const errorMessage: Message = {
        role: "assistant",
        content:
          "⚠️ Terjadi kesalahan koneksi. Pastikan:\n\n1. API key sudah ada di file .env\n2. Server sudah di-restart\n3. Internet connection aktif\n\nCek console browser (F12) untuk detail error.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    sendMessage(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
      {/* Chat Widget */}
      {isOpen && (
        <Card className="w-[calc(100vw-2rem)] h-[calc(100vh-5rem)] sm:w-[400px] sm:h-[600px] mb-4 shadow-2xl border animate-in slide-in-from-bottom-5 duration-300 flex flex-col">
          <CardHeader className="border-b bg-primary text-primary-foreground shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mt-4">
                <div className="bg-primary-foreground/10 p-1 rounded-lg backdrop-blur-sm">
                  <IconRobot className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    AI Assistant
                    <IconSparkles className="h-4 w-4 animate-pulse" />
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80 text-xs">
                    Powered by Gemini AI
                  </CardDescription>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            {stats && (
              <div className="grid grid-cols-3 gap-2 mt-1 text-xs">
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-primary-foreground/70">Transaksi</div>
                  <div className="font-bold">{stats.totalTransactions}</div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-primary-foreground/70">Member</div>
                  <div className="font-bold">{stats.totalMembers}</div>
                </div>
                <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-2">
                  <div className="text-primary-foreground/70">Hari Ini</div>
                  <div className="font-bold">{stats.todayTransactions}</div>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-3 sm:p-4 flex flex-col flex-1 overflow-hidden">
            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto pr-2 sm:pr-4 scroll-smooth"
              ref={scrollAreaRef}
            >
              <div className="space-y-4 pb-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                        <IconRobot className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-[80%] break-words",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-1 opacity-70",
                          message.role === "user"
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 animate-in fade-in">
                    <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center">
                      <IconRobot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="space-y-2 mb-3 sm:mb-4">
                <p className="text-xs text-muted-foreground">Quick Actions:</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickAction(action.query)}
                      className="text-xs"
                    >
                      <action.icon className="h-3 w-3 mr-1" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2 mt-3 sm:mt-4 shrink-0 border-t pt-3">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanya sesuatu..."
                disabled={isLoading}
                className="flex-1 text-sm sm:text-base"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                size="icon"
                className="shrink-0"
              >
                <IconSend className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-2xl transition-all duration-300",
          "hover:scale-110 active:scale-95",
          isOpen && "rotate-0"
        )}
      >
        {isOpen ? (
          <IconX className="h-6 w-6" />
        ) : (
          <div className="relative">
            <IconMessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </Button>

      {/* Badge "AI" */}
      {!isOpen && (
        <div className="absolute -top-2 -left-2 animate-in zoom-in duration-300">
          <Badge className="bg-primary text-primary-foreground border-0 shadow-lg">
            <IconSparkles className="h-3 w-3 mr-1" />
            AI
          </Badge>
        </div>
      )}
    </div>
  );
}
