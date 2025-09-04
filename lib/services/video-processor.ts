import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import { VideoProcessingResult, VideoIngredient } from '@/types';

interface ProcessingQueueItem {
  id: string;
  videoPath: string;
  priority: 'high' | 'normal' | 'low';
  timestamp: number;
}

export interface ProcessingOptions {
  maxDuration?: number; // in seconds
  quality?: 'low' | 'medium' | 'high';
  extractAudio?: boolean;
  generateThumbnail?: boolean;
}

export interface OllamaResponse {
  ingredients: VideoIngredient[];
  servings: number;
  prepTime: number;
  cookTime: number;
  instructions?: string[];
  description?: string;
}

export class VideoProcessor {
  private ffmpegPath: string;
  private ollamaUrl: string;
  private tempDir: string;
  private processingQueue: ProcessingQueueItem[] = [];
  private isProcessing = false;
  private maxVideoDuration = 120; // 2 minutes in seconds
  private maxFileSize = 100 * 1024 * 1024; // 100MB

  constructor(
    ffmpegPath: string = 'ffmpeg',
    ollamaUrl: string = 'http://localhost:11434',
    tempDir: string = './temp'
  ) {
    this.ffmpegPath = ffmpegPath;
    this.ollamaUrl = ollamaUrl;
    this.tempDir = tempDir;
  }

  /**
   * Validate video constraints for alpha launch
   */
  async validateVideoConstraints(file: File): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size (${(file.size / 1024 / 1024).toFixed(1)}MB) exceeds maximum allowed size of 100MB`);
    }

    // Check file type
    if (!file.type.startsWith('video/')) {
      errors.push('File must be a video format');
    }

    // Check duration (we'll need to extract this with FFmpeg)
    try {
      const duration = await this.getVideoDuration(file);
      if (duration > this.maxVideoDuration) {
        errors.push(`Video duration (${Math.ceil(duration / 60)}m ${duration % 60}s) exceeds maximum allowed duration of 2 minutes`);
      }
    } catch (error) {
      errors.push('Unable to determine video duration');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get video duration using FFmpeg
   */
  private async getVideoDuration(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      // Create a temporary URL for the file
      const videoUrl = URL.createObjectURL(file);
      
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        videoUrl
      ]);

      let output = '';
      let errorOutput = '';

      ffprobe.stdout.on('data', (data) => {
        output += data.toString();
      });

      ffprobe.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffprobe.on('close', (code) => {
        URL.revokeObjectURL(videoUrl);
        
        if (code === 0) {
          const duration = parseFloat(output.trim());
          resolve(duration);
        } else {
          reject(new Error(`FFprobe failed: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Compress video to meet alpha constraints
   */
  async compressVideo(inputPath: string, outputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',        // H.264 codec
        '-preset', 'fast',        // Fast encoding
        '-crf', '28',             // Quality (23-28 is good, higher = smaller file)
        '-c:a', 'aac',            // Audio codec
        '-b:a', '128k',           // Audio bitrate
        '-movflags', '+faststart', // Optimize for web
        '-y',                     // Overwrite output
        outputPath
      ]);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`FFmpeg compression failed: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Add video to processing queue
   */
  addToQueue(videoPath: string, priority: 'high' | 'normal' | 'low' = 'normal'): string {
    const id = `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.processingQueue.push({
      id,
      videoPath,
      priority,
      timestamp: Date.now()
    });

    // Sort queue by priority and timestamp
    this.sortQueue();
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Sort queue by priority and timestamp
   */
  private sortQueue(): void {
    const priorityOrder = { high: 3, normal: 2, low: 1 };
    
    this.processingQueue.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Process queue items
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.processingQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.processingQueue.length > 0) {
      const item = this.processingQueue.shift();
      if (!item) continue;

      try {
        // Process the video
        await this.processVideo(item.videoPath);
        console.log(`Processed video: ${item.id}`);
      } catch (error) {
        console.error(`Failed to process video ${item.id}:`, error);
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get queue status
   */
  getQueueStatus(): { 
    total: number; 
    processing: boolean; 
    nextItem?: ProcessingQueueItem 
  } {
    return {
      total: this.processingQueue.length,
      processing: this.isProcessing,
      nextItem: this.processingQueue[0]
    };
  }

  /**
   * Remove item from queue
   */
  removeFromQueue(id: string): boolean {
    const index = this.processingQueue.findIndex(item => item.id === id);
    if (index > -1) {
      this.processingQueue.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Main video processing method
   */
  async processVideo(videoPath: string): Promise<VideoProcessingResult> {
    try {
      // Extract audio from video
      const audioPath = await this.extractAudio(videoPath);
      
      // Transcribe audio to text
      const transcript = await this.transcribeAudio(audioPath);
      
      // Extract recipe information using AI
      const recipeData = await this.extractRecipeWithAI(transcript);
      
      return recipeData;
    } catch (error) {
      throw new Error(`Video processing failed: ${error}`);
    }
  }

  /**
   * Extract audio from video using FFmpeg
   */
  private async extractAudio(videoPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = videoPath.replace(/\.[^/.]+$/, '.wav');
      
      const ffmpeg = spawn('ffmpeg', [
        '-i', videoPath,
        '-vn',                    // No video
        '-acodec', 'pcm_s16le',  // PCM 16-bit
        '-ar', '16000',           // Sample rate 16kHz
        '-ac', '1',               // Mono audio
        '-y',                     // Overwrite output
        outputPath
      ]);

      let errorOutput = '';

      ffmpeg.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      ffmpeg.on('close', (code) => {
        if (code === 0) {
          resolve(outputPath);
        } else {
          reject(new Error(`Audio extraction failed: ${errorOutput}`));
        }
      });
    });
  }

  /**
   * Transcribe audio to text
   * Note: In production, this would use Web Speech API or a proper STT service
   */
  private async transcribeAudio(audioPath: string): Promise<string> {
    // For alpha launch, we'll use a mock transcription
    // In production, integrate with Web Speech API or a service like Whisper
    
    // Mock transcription for demonstration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Add 2 cups of flour to a mixing bowl. Mix in 1 cup of sugar and 2 eggs. Bake at 350°F for 25 minutes.");
      }, 2000);
    });
  }

  /**
   * Extract recipe information using local Ollama Llama 3.1
   */
  private async extractRecipeWithAI(transcript: string): Promise<VideoProcessingResult> {
    try {
      const prompt = `
        You are a recipe extraction expert. Analyze the following cooking video transcript and extract structured recipe information.
        
        Transcript: "${transcript}"
        
        Return a JSON object with the following structure:
        {
          "ingredients": [
            {
              "name": "ingredient name",
              "amount": number,
              "unit": "unit of measurement",
              "notes": "optional additional notes"
            }
          ],
          "servings": number,
          "prepTime": number,
          "cookTime": number,
          "instructions": ["step 1", "step 2", "step 3"],
          "description": "brief recipe description"
        }
        
        Ensure all amounts are numeric and units are standardized (cups, tablespoons, teaspoons, grams, ounces, etc.).
        Only return valid JSON, no additional text.
      `;

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openbmb/minicpm-o2.6:latest',
          prompt: prompt,
          stream: false
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const aiResponse = data.response;
      
      // Parse AI response
      try {
        const recipeData = JSON.parse(aiResponse);
        return this.validateAndTransformAIResponse(recipeData);
      } catch (parseError) {
        throw new Error(`Failed to parse AI response: ${parseError}`);
      }
    } catch (error) {
      console.error('AI extraction failed, using fallback:', error);
      return this.getFallbackRecipe(transcript);
    }
  }

  /**
   * Validate and transform AI response
   */
  private validateAndTransformAIResponse(data: any): VideoProcessingResult {
    // Validate required fields
    if (!data.ingredients || !Array.isArray(data.ingredients)) {
      throw new Error('Invalid ingredients data');
    }

    if (!data.servings || typeof data.servings !== 'number') {
      throw new Error('Invalid servings data');
    }

    // Transform and validate ingredients
    const ingredients = data.ingredients.map((ing: any) => ({
      name: ing.name || 'Unknown ingredient',
      amount: parseFloat(ing.amount) || 0,
      unit: ing.unit || 'unit',
      notes: ing.notes || undefined
    }));

    return {
      ingredients,
      servings: data.servings,
      prepTime: data.prepTime || 0,
      cookTime: data.cookTime || 0,
      instructions: data.instructions || [],
      description: data.description || ''
    };
  }

  /**
   * Fallback recipe extraction when AI fails
   */
  private getFallbackRecipe(transcript: string): VideoProcessingResult {
    // Simple keyword-based extraction as fallback
    const commonIngredients = [
      { name: 'flour', unit: 'cups' },
      { name: 'sugar', unit: 'cups' },
      { name: 'eggs', unit: 'pieces' },
      { name: 'milk', unit: 'cups' },
      { name: 'butter', unit: 'tablespoons' },
      { name: 'salt', unit: 'teaspoons' }
    ];

    const ingredients: VideoIngredient[] = [];
    
    commonIngredients.forEach(ing => {
      if (transcript.toLowerCase().includes(ing.name)) {
        ingredients.push({
          name: ing.name,
          amount: 1,
          unit: ing.unit
        });
      }
    });

    return {
      ingredients,
      servings: 4,
      prepTime: 15,
      cookTime: 30,
      instructions: ['Follow the video instructions'],
      description: 'Recipe extracted from video'
    };
  }

  /**
   * Ensure temporary directory exists
   */
  private async ensureTempDir(): Promise<void> {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  /**
   * Clean up temporary files
   */
  private async cleanup(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to delete temporary file ${filePath}:`, error);
      }
    }
  }

  /**
   * Check if FFmpeg is available
   */
  async checkFFmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
      const ffmpeg = spawn(this.ffmpegPath, ['-version']);
      
      ffmpeg.on('close', (code) => {
        resolve(code === 0);
      });

      ffmpeg.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Check if Ollama is available
   */
  async checkOllama(): Promise<boolean> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export a singleton instance
export const videoProcessor = new VideoProcessor();
