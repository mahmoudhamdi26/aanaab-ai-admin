"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Eye } from "lucide-react";

interface SyncJob {
  job_id: string;
  status: string;
  syncType?: string;
  percent_complete: number;
  total_courses: number;
  completed_courses: number;
  failed_courses: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export function SyncJobsPanel() {
  const [jobs, setJobs] = useState<SyncJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/sync");
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error("Failed to fetch sync jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const startSync = async (syncType: string) => {
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          syncType,
          config: {
            batchSize: 100,
            maxConcurrent: 5,
            enableRAGProcessing: true,
          },
        }),
      });

      if (response.ok) {
        fetchJobs(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to start sync:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "running":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading sync jobs...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Jobs Management</CardTitle>
          <CardDescription>
            Monitor and manage synchronization processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Button onClick={() => startSync("full")} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Full Sync
            </Button>
            <Button onClick={() => startSync("incremental")} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Incremental Sync
            </Button>
            <Button onClick={() => startSync("phased")} variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Phased Sync
            </Button>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No sync jobs found
              </div>
            ) : (
              jobs.map((job) => (
                <Card key={job.job_id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{job.syncType || 'Unknown'} Sync</h3>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Job ID: {job.job_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        Created: {new Date(job.created_at).toLocaleString()}
                      </p>
                      {job.error_message && (
                        <p className="text-sm text-red-600">
                          Error: {job.error_message}
                        </p>
                      )}
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-sm text-gray-500">
                        {job.completed_courses} / {job.total_courses} courses
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${job.percent_complete}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {job.percent_complete.toFixed(1)}% complete
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
