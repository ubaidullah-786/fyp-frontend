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
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-[600px] w-full" />
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
