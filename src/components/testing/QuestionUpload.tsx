"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Copy, Download, AlertCircle, CheckCircle } from "lucide-react";

export interface Question {
  id: string;
  query: string;
  courseId: string;
  courseName: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
}

interface QuestionUploadProps {
  onQuestionsChange: (questions: Question[]) => void;
  initialQuestions?: Question[];
}

const TEMPLATE_JSON = {
  questions: [
    {
      "query": "What is this course about?",
      "courseId": "89",
      "courseName": "Educational Games Course",
      "category": "COURSE_OVERVIEW",
      "complexity": "low"
    },
    {
      "query": "How can teachers use games to enhance learning?",
      "courseId": "89",
      "courseName": "Educational Games Course",
      "category": "PRACTICAL_APPLICATION",
      "complexity": "medium"
    }
  ]
};

const TEMPLATE_CSV = `query,courseId,courseName,category,complexity
"What is this course about?","89","Educational Games Course","COURSE_OVERVIEW","low"
"How can teachers use games to enhance learning?","89","Educational Games Course","PRACTICAL_APPLICATION","medium"`;

export function QuestionUpload({ onQuestionsChange, initialQuestions = [] }: QuestionUploadProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [textInput, setTextInput] = useState("");
  const [uploadMode, setUploadMode] = useState<'text' | 'file'>('text');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseTextQuestions = (text: string): Question[] => {
    const lines = text.split('\n').filter(line => line.trim());
    return lines.map((line, index) => ({
      id: `custom_${Date.now()}_${index}`,
      query: line.trim(),
      courseId: "89", // Default course ID
      courseName: "Custom Questions",
      category: "CUSTOM",
      complexity: "medium" as const
    }));
  };

  const parseFileContent = (content: string, filename: string): Question[] => {
    try {
      if (filename.endsWith('.json')) {
        const data = JSON.parse(content);
        if (data.questions && Array.isArray(data.questions)) {
          return data.questions.map((q: any, index: number) => ({
            id: `file_${Date.now()}_${index}`,
            query: q.query || q.question || q.text || '',
            courseId: q.courseId || q.course_id || "89",
            courseName: q.courseName || q.course_name || "Custom Questions",
            category: q.category || "CUSTOM",
            complexity: q.complexity || "medium"
          }));
        }
        throw new Error('Invalid JSON format. Expected { "questions": [...] }');
      } else if (filename.endsWith('.csv')) {
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) throw new Error('CSV must have at least a header and one data row');

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const queryIndex = headers.findIndex(h => h.toLowerCase().includes('query') || h.toLowerCase().includes('question'));

        if (queryIndex === -1) throw new Error('CSV must have a "query" or "question" column');

        return lines.slice(1).map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return {
            id: `file_${Date.now()}_${index}`,
            query: values[queryIndex] || '',
            courseId: values[headers.findIndex(h => h.toLowerCase().includes('courseid'))] || "89",
            courseName: values[headers.findIndex(h => h.toLowerCase().includes('coursename'))] || "Custom Questions",
            category: values[headers.findIndex(h => h.toLowerCase().includes('category'))] || "CUSTOM",
            complexity: (values[headers.findIndex(h => h.toLowerCase().includes('complexity'))] as any) || "medium"
          };
        });
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }
    } catch (error) {
      throw new Error(`File parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const validateAndSetQuestions = async (newQuestions: Question[]) => {
    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(false);

    try {
      // Basic validation
      if (newQuestions.length === 0) {
        throw new Error('No questions found');
      }

      const invalidQuestions = newQuestions.filter(q => !q.query.trim());
      if (invalidQuestions.length > 0) {
        throw new Error(`${invalidQuestions.length} questions are empty or invalid`);
      }

      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setQuestions(newQuestions);
      onQuestionsChange(newQuestions);
      setValidationSuccess(true);
      setTimeout(() => setValidationSuccess(false), 3000);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) return;
    const newQuestions = parseTextQuestions(textInput);
    validateAndSetQuestions(newQuestions);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const newQuestions = parseFileContent(content, file.name);
        validateAndSetQuestions(newQuestions);
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : 'File processing failed');
        setIsValidating(false);
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = (format: 'json' | 'csv') => {
    const content = format === 'json' ? JSON.stringify(TEMPLATE_JSON, null, 2) : TEMPLATE_CSV;
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `questions_template.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearQuestions = () => {
    setQuestions([]);
    setTextInput("");
    onQuestionsChange([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Questions Upload
        </CardTitle>
        <CardDescription className="text-gray-600">
          Upload your own questions or use predefined test scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Status */}
        {validationError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{validationError}</span>
          </div>
        )}

        {validationSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Successfully loaded {questions.length} questions</span>
          </div>
        )}

        {/* Upload Tabs */}
        <Tabs value={uploadMode} onValueChange={(value) => setUploadMode(value as 'text' | 'file')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Quick Text Input</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questions-text">Questions (one per line)</Label>
              <Textarea
                id="questions-text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Enter your questions here, one per line:&#10;&#10;What is this course about?&#10;How can teachers use games to enhance learning?&#10;What are the different types of educational games?"
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Each line will be treated as a separate question. Course ID will default to "89".
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleTextSubmit}
                disabled={!textInput.trim() || isValidating}
                className="flex-1"
              >
                {isValidating ? 'Validating...' : 'Load Questions'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setTextInput('')}
                disabled={!textInput.trim()}
              >
                Clear
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload JSON or CSV file</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isValidating}
                >
                  Choose File
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('json')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  JSON Template
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadTemplate('csv')}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  CSV Template
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Current Questions Summary */}
        {questions.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Loaded Questions ({questions.length})</h4>
              <Button variant="outline" size="sm" onClick={clearQuestions}>
                Clear All
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {questions.slice(0, 5).map((q, index) => (
                <div key={q.id} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {index + 1}. {q.query.length > 80 ? `${q.query.substring(0, 80)}...` : q.query}
                </div>
              ))}
              {questions.length > 5 && (
                <div className="text-sm text-gray-500 text-center py-1">
                  ... and {questions.length - 5} more questions
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
