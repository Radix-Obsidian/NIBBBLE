'use client';

import React from 'react';
import { Loader2, Brain, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { VideoProcessingStatus } from '@/types';

interface ProcessingIndicatorProps {
  status: VideoProcessingStatus;
  className?: string;
}

export default function ProcessingIndicator({ status, className = '' }: ProcessingIndicatorProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'uploading':
        return <Video className="w-6 h-6 text-blue-500" />;
      case 'processing':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'extracting':
        return <Brain className="w-6 h-6 text-purple-500 animate-pulse" />;
      case 'analyzing':
        return <Brain className="w-6 h-6 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getStatusTextColor = () => {
    switch (status.status) {
      case 'completed':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      default:
        return 'text-blue-800';
    }
  };

  const getProgressBarColor = () => {
    switch (status.status) {
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  const getStatusMessages = () => {
    switch (status.status) {
      case 'uploading':
        return [
          '📤 Uploading your video...',
          '🚀 Almost there...',
          '✨ Video uploaded successfully!'
        ];
      case 'processing':
        return [
          '🎬 Processing video...',
          '🔧 Extracting audio...',
          '🎵 Preparing for analysis...'
        ];
      case 'extracting':
        return [
          '🧠 AI is analyzing your video...',
          '🔍 Looking for ingredients...',
          '📝 Extracting cooking steps...'
        ];
      case 'analyzing':
        return [
          '⚡ Calculating nutrition...',
          '📊 Estimating servings...',
          '🎯 Finalizing recipe...'
        ];
      case 'completed':
        return [
          '✅ Recipe extracted successfully!',
          '🎉 Your cooking video is ready!',
          '👨‍🍳 Time to start cooking!'
        ];
      case 'error':
        return [
          '❌ Something went wrong...',
          '🔄 Please try again',
          '📞 Contact support if the problem persists'
        ];
      default:
        return ['Processing...'];
    }
  };

  const currentMessage = getStatusMessages()[0];

  return (
    <div className={`rounded-lg border p-6 ${getStatusColor()} ${className}`}>
      <div className="flex items-center space-x-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className={`font-semibold ${getStatusTextColor()}`}>
            {currentMessage}
          </h3>
          {status.message && (
            <p className={`text-sm mt-1 ${getStatusTextColor()}`}>
              {status.message}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {status.progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className={getStatusTextColor()}>Progress</span>
            <span className={getStatusTextColor()}>{Math.round(status.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
              style={{ width: `${status.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Details */}
      {status.status === 'error' && status.error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">
            <strong>Error:</strong> {status.error}
          </p>
        </div>
      )}

      {/* Processing Steps */}
      {status.status !== 'completed' && status.status !== 'error' && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span>Processing step {status.status}</span>
          </div>
        </div>
      )}

      {/* Success Actions */}
      {status.status === 'completed' && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            🎉 Your recipe has been successfully extracted! You can now view, edit, and share it.
          </p>
        </div>
      )}
    </div>
  );
}

// Enhanced version with step-by-step progress
export function StepByStepProcessingIndicator({ status, className = '' }: ProcessingIndicatorProps) {
  const steps = [
    { key: 'uploading', label: 'Upload Video', icon: Video },
    { key: 'processing', label: 'Process Video', icon: Video },
    { key: 'extracting', label: 'Extract Recipe', icon: Brain },
    { key: 'analyzing', label: 'Calculate Nutrition', icon: Brain },
    { key: 'completed', label: 'Complete', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === status.status);
  const isCompleted = status.status === 'completed';
  const hasError = status.status === 'error';

  return (
    <div className={`rounded-lg border p-6 ${className}`}>
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.key === status.status;
          const isPast = index < currentStepIndex;
          const isFuture = index > currentStepIndex;

          let stepClasses = 'flex items-center space-x-3 p-3 rounded-lg';
          let iconClasses = 'w-6 h-6';
          let textClasses = 'font-medium';

          if (isActive) {
            stepClasses += ' bg-blue-50 border border-blue-200';
            iconClasses += ' text-blue-500';
            textClasses += ' text-blue-700';
          } else if (isPast) {
            stepClasses += ' bg-green-50 border border-green-200';
            iconClasses += ' text-green-500';
            textClasses += ' text-green-700';
          } else if (isFuture) {
            stepClasses += ' bg-gray-50 border border-gray-200';
            iconClasses += ' text-gray-400';
            textClasses += ' text-gray-500';
          }

          return (
            <div key={step.key} className={stepClasses}>
              <div className="flex-shrink-0">
                {isActive ? (
                  <Loader2 className={`${iconClasses} animate-spin`} />
                ) : isPast ? (
                  <CheckCircle className={iconClasses} />
                ) : (
                  <Icon className={iconClasses} />
                )}
              </div>
              <div className="flex-1">
                <p className={textClasses}>{step.label}</p>
                {isActive && status.message && (
                  <p className="text-sm text-blue-600 mt-1">{status.message}</p>
                )}
              </div>
              {isActive && status.progress !== undefined && (
                <div className="flex-shrink-0 w-16">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Error State */}
      {hasError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="font-medium text-red-700">Processing Error</span>
          </div>
          {status.error && (
            <p className="text-sm text-red-600 mt-2">{status.error}</p>
          )}
        </div>
      )}

      {/* Success State */}
      {isCompleted && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="font-medium text-green-700">Recipe Successfully Extracted!</span>
          </div>
          <p className="text-sm text-green-600 mt-2">
            Your cooking video has been processed and the recipe has been extracted. You can now view and edit the recipe details.
          </p>
        </div>
      )}
    </div>
  );
}
