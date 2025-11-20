"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import CodeEditor from "@/components/code-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileData {
  fileName: string;
  content: string;
  _id: string;
}

interface Smell {
  smellType: string;
  fileName: string;
  filePath: string;
  startLine: number;
  endLine: number;
  category: string;
  weight: number;
  _id: string;
}

interface CodeInfo {
  title: string;
  fileData: FileData[];
  smells: Smell[];
}

export default function CodeEditorPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CodeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }
    setIsAuthenticated(true);
    fetchCodeInfo();
  }, [id, router]);

  const fetchCodeInfo = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<CodeInfo>(
        `/api/v1/projects/getcodeinfo/${id}`,
        { auth: true }
      );
      if (response.ok && response.data) {
        setData(response.data);
      } else {
        throw new Error("Failed to load code information");
      }
    } catch (err) {
      console.error("Error fetching code info:", err);
      setError("Failed to load code information");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] p-6">
        <div className="mb-4">
          <Skeleton className="h-10 w-40 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
        </div>
        <div className="flex gap-4 h-[calc(100vh-120px)]">
          {/* File List Skeleton */}
          <div className="w-64 bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-4 space-y-2">
            <Skeleton className="h-6 w-32 mb-4 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton
                key={i}
                className="h-8 w-full bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]"
              />
            ))}
          </div>
          {/* Code View Skeleton */}
          <div className="flex-1 bg-white dark:bg-[rgb(10,10,10)] border-[1.3px] border-[rgb(237,237,237)] dark:border-[rgb(237,237,237)]/15 rounded-lg p-6">
            <Skeleton className="h-8 w-48 mb-4 bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton
                  key={i}
                  className="h-4 w-full bg-[rgb(220,220,220)] dark:bg-[rgb(30,30,30)]"
                  style={{ width: `${Math.random() * 40 + 60}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)] p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "No data available"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgb(237,237,237)] dark:bg-[rgb(0,0,0)]">
      <CodeEditor fileData={data.fileData} smells={data.smells} />
    </div>
  );
}
