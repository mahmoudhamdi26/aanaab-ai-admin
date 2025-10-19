"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Pause, RotateCcw, Upload, Eye, Download, Settings } from "lucide-react";
import { QuestionUpload } from "./QuestionUpload";

export interface TestScenario {
  id: string;
  query: string;
  courseId: string;
  courseName: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
}

interface BatchTestingProps {
  scenarios: TestScenario[];
  selectedScenarios: string[];
  onSelectedScenariosChange: (selected: string[]) => void;
  selectedCourseFilter: string;
  onCourseFilterChange: (filter: string) => void;
  isRunning: boolean;
  batchProgress: { current: number; total: number };
  onRunBatch: () => void;
  onClearResults: () => void;
  showQuestionUpload: boolean;
  onToggleQuestionUpload: () => void;
  testResults: any[];
  onGeneratePreview: () => void;
  onExportResults: () => void;
  customQuestions: any[];
  useCustomQuestions: boolean;
  onToggleQuestionSource: () => void;
  onQuestionsChange: (questions: any[]) => void;
}

export function BatchTesting({
  scenarios,
  selectedScenarios,
  onSelectedScenariosChange,
  selectedCourseFilter,
  onCourseFilterChange,
  isRunning,
  batchProgress,
  onRunBatch,
  onClearResults,
  showQuestionUpload,
  onToggleQuestionUpload,
  testResults,
  onGeneratePreview,
  onExportResults,
  customQuestions,
  useCustomQuestions,
  onToggleQuestionSource,
  onQuestionsChange
}: BatchTestingProps) {
  const availableCourses = Array.from(new Set(scenarios.map(s => s.courseId))).map(courseId => {
    const scenario = scenarios.find(s => s.courseId === courseId);
    return { id: courseId, name: scenario?.courseName || courseId };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const getFilteredScenarios = () => {
    if (selectedCourseFilter === "all") {
      return scenarios;
    }
    return scenarios.filter(scenario => scenario.courseId === selectedCourseFilter);
  };

  const filteredScenarios = getFilteredScenarios();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedScenariosChange(filteredScenarios.map(s => s.id));
    } else {
      onSelectedScenariosChange([]);
    }
  };

  const handleScenarioToggle = (scenarioId: string, checked: boolean) => {
    if (checked) {
      onSelectedScenariosChange([...selectedScenarios, scenarioId]);
    } else {
      onSelectedScenariosChange(selectedScenarios.filter(id => id !== scenarioId));
    }
  };

  const allSelected = filteredScenarios.length > 0 && filteredScenarios.every(s => selectedScenarios.includes(s.id));
  const someSelected = selectedScenarios.some(id => filteredScenarios.some(s => s.id === id));

  return (
    <div className="space-y-4">
      {/* Question Upload Section - Collapsible */}
      {showQuestionUpload && (
        <QuestionUpload
          onQuestionsChange={onQuestionsChange}
          initialQuestions={customQuestions}
        />
      )}

      {/* Question Source Toggle */}
      <Card className="bg-white border border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Question Source</h3>
              <p className="text-sm text-gray-600">
                {useCustomQuestions
                  ? `Using ${customQuestions.length} custom questions`
                  : `Using ${scenarios.length} predefined scenarios`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleQuestionUpload}
              >
                <Upload className="h-4 w-4 mr-2" />
                {showQuestionUpload ? 'Hide Upload' : 'Upload Questions'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleQuestionSource}
                disabled={customQuestions.length === 0}
              >
                {useCustomQuestions ? 'Use Predefined' : 'Use Custom Questions'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Batch Testing Card */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">Batch Testing</CardTitle>
          <CardDescription className="text-gray-600">
            Select multiple test scenarios to run in batch. Filter by course to focus on specific subjects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Filter */}
          <div className="space-y-2">
            <Label>Filter by Course</Label>
            <Select value={selectedCourseFilter} onValueChange={onCourseFilterChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses ({scenarios.length})</SelectItem>
                {availableCourses.map(course => {
                  const count = scenarios.filter(s => s.courseId === course.id).length;
                  return (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Progress Indicator */}
          {isRunning && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Running Tests</span>
                <span className="text-sm text-blue-700">
                  {batchProgress.current} / {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Scenario Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected && !allSelected;
                  }}
                />
                <Label htmlFor="select-all" className="font-medium">
                  Select All ({filteredScenarios.length} scenarios)
                </Label>
              </div>
              <div className="text-sm text-gray-500">
                {selectedScenarios.length} selected
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-lg p-3">
              {filteredScenarios.map((scenario) => (
                <div key={scenario.id} className="flex items-start space-x-2">
                  <Checkbox
                    id={scenario.id}
                    checked={selectedScenarios.includes(scenario.id)}
                    onCheckedChange={(checked) => handleScenarioToggle(scenario.id, checked as boolean)}
                  />
                  <div className="flex-1 min-w-0">
                    <Label htmlFor={scenario.id} className="text-sm cursor-pointer">
                      <div className="font-medium text-gray-900">{scenario.query}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {scenario.courseName} • {scenario.category} • {scenario.complexity}
                      </div>
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={onRunBatch}
              disabled={isRunning || selectedScenarios.length === 0}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Running... ({batchProgress.current}/{batchProgress.total})
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Selected Tests ({selectedScenarios.length})
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onClearResults}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Actions Footer */}
      {testResults.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Results Actions
            </CardTitle>
            <CardDescription className="text-gray-600">
              Generate preview and export test results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={onGeneratePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview Results
              </Button>
              <Button onClick={onExportResults} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
