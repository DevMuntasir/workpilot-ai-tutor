'use client'

import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react";

export default function AdminPortalPage() {
    const [token, setToken] = useState<string | null>(null);
    useEffect(() => {
      const token = JSON.parse(localStorage.getItem('ai_tutora_auth_session') || 'null');
      console.log(token);
      
      if (!token) {
        window.location.href = '/login';
      }
      setToken(token?.access_token);
    }, []) 
  return (
    <div className="min-h-full bg-muted/40 p-4 md:p-6">
      <Button>
        <a href={`https://tutor-ai.up.railway.app/api/v1/docs/login?token=${token}`} target="_blank" rel="noopener noreferrer">
          Api Docs
        </a>
      </Button>
    </div>
  )
}
