import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login } from "@/lib/auth";
import { Play, Key } from "lucide-react";

export default function Login() {
  const [secretKey, setSecretKey] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ['/api/auth/status'] });
        setLocation("/");
        toast({
          title: "Login Successful",
          description: "Welcome to StreamVault Pro",
        });
      } else {
        toast({
          title: "Login Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid secret key",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(secretKey);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-slate-grey border-gray-700">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-light-slate mb-2">StreamVault Pro</h1>
            <p className="text-gray-400">Secure Video Management Platform</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Key className="inline w-4 h-4 mr-2" />
                Secret Access Key
              </label>
              <Input
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter secret key..."
                className="bg-dark-slate border-gray-600 text-light-slate placeholder-gray-400 focus:ring-primary-indigo focus:border-primary-indigo"
                required
              />
            </div>
            
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full gradient-primary text-white font-medium py-3 transform hover:scale-105 transition-all duration-200"
            >
              {loginMutation.isPending ? "Authenticating..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
