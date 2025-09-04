import { VideoProcessor } from '../lib/services/video-processor';
import { VideoProcessingResult, VideoIngredient } from '../types';

// Mock child_process.spawn
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Mock fetch for Ollama API calls
global.fetch = jest.fn();

describe('VideoProcessor', () => {
  let videoProcessor: VideoProcessor;
  let mockSpawn: jest.Mocked<any>;

  beforeEach(() => {
    videoProcessor = new VideoProcessor();
    jest.clearAllMocks();
    
    // Get the mocked spawn function
    const { spawn } = require('child_process');
    mockSpawn = spawn;
  });

  const mockVideoFile = new File(['mock video content'], 'test-video.mp4', {
    type: 'video/mp4'
  });

  describe('validateVideoConstraints', () => {
    it('should validate video file constraints successfully', async () => {
      // Mock a valid video file
      const validFile = new File(['content'], 'test.mp4', {
        type: 'video/mp4'
      });
      Object.defineProperty(validFile, 'size', { value: 50 * 1024 * 1024 }); // 50MB

      // Mock FFprobe duration check
      mockSpawn.mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success
          }
        })
      });

      const result = await videoProcessor.validateVideoConstraints(validFile);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject files exceeding size limit', async () => {
      const largeFile = new File(['content'], 'large.mp4', {
        type: 'video/mp4'
      });
      Object.defineProperty(largeFile, 'size', { value: 150 * 1024 * 1024 }); // 150MB

      const result = await videoProcessor.validateVideoConstraints(largeFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('exceeds maximum allowed size of 100MB')
      );
    });

    it('should reject non-video files', async () => {
      const textFile = new File(['content'], 'document.txt', {
        type: 'text/plain'
      });

      const result = await videoProcessor.validateVideoConstraints(textFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('File must be a video format');
    });

    it('should reject videos exceeding duration limit', async () => {
      const longVideo = new File(['content'], 'long.mp4', {
        type: 'video/mp4'
      });
      Object.defineProperty(longVideo, 'size', { value: 50 * 1024 * 1024 });

      // Mock FFprobe to return duration > 2 minutes
      mockSpawn.mockReturnValue({
        stdout: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback('150.5'); // 2.5 minutes
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0);
          }
        })
      });

      const result = await videoProcessor.validateVideoConstraints(longVideo);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        expect.stringContaining('exceeds maximum allowed duration of 2 minutes')
      );
    });

    it('should handle FFprobe failures gracefully', async () => {
      const videoFile = new File(['content'], 'test.mp4', {
        type: 'video/mp4'
      });
      Object.defineProperty(videoFile, 'size', { value: 50 * 1024 * 1024 });

      // Mock FFprobe failure
      mockSpawn.mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Error
          }
        })
      });

      const result = await videoProcessor.validateVideoConstraints(videoFile);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Unable to determine video duration');
    });
  });

  describe('compressVideo', () => {
    it('should compress video successfully', async () => {
      const inputPath = '/path/to/input.mp4';
      const outputPath = '/path/to/output.mp4';

      mockSpawn.mockReturnValue({
        stderr: { on: jest.fn() },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(0); // Success
          }
        })
      });

      const result = await videoProcessor.compressVideo(inputPath, outputPath);

      expect(result).toBe(outputPath);
      expect(mockSpawn).toHaveBeenCalledWith('ffmpeg', [
        '-i', inputPath,
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '28',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-movflags', '+faststart',
        '-y',
        outputPath
      ]);
    });

    it('should handle compression failures', async () => {
      const inputPath = '/path/to/input.mp4';
      const outputPath = '/path/to/output.mp4';

      mockSpawn.mockReturnValue({
        stderr: { 
          on: jest.fn((event, callback) => {
            if (event === 'data') {
              callback('Error: Invalid input file');
            }
          })
        },
        on: jest.fn((event, callback) => {
          if (event === 'close') {
            callback(1); // Error
          }
        })
      });

      await expect(
        videoProcessor.compressVideo(inputPath, outputPath)
      ).rejects.toThrow('FFmpeg compression failed: Error: Invalid input file');
    });
  });

  describe('Processing Queue', () => {
    it('should add videos to processing queue', () => {
      const videoPath = '/path/to/video.mp4';
      const queueId = videoProcessor.addToQueue(videoPath, 'high');

      expect(queueId).toMatch(/^proc_\d+_[a-z0-9]+$/);
      
      const status = videoProcessor.getQueueStatus();
      expect(status.total).toBe(1);
      expect(status.processing).toBe(false);
    });

    it('should prioritize high priority videos', () => {
      videoProcessor.addToQueue('/path/to/low.mp4', 'low');
      videoProcessor.addToQueue('/path/to/high.mp4', 'high');
      videoProcessor.addToQueue('/path/to/normal.mp4', 'normal');

      const status = videoProcessor.getQueueStatus();
      expect(status.nextItem?.priority).toBe('high');
    });

    it('should process queue items in order', async () => {
      const videoPath = '/path/to/video.mp4';
      videoProcessor.addToQueue(videoPath, 'normal');

      // Mock the processVideo method to avoid actual processing
      jest.spyOn(videoProcessor as any, 'processVideo').mockResolvedValue({
        ingredients: [],
        servings: 4,
        prepTime: 10,
        cookTime: 20,
        instructions: [],
        description: ''
      });

      // Start processing
      await (videoProcessor as any).processQueue();

      const status = videoProcessor.getQueueStatus();
      expect(status.total).toBe(0);
      expect(status.processing).toBe(false);
    });

    it('should remove items from queue', () => {
      const videoPath = '/path/to/video.mp4';
      const queueId = videoProcessor.addToQueue(videoPath, 'normal');

      expect(videoProcessor.getQueueStatus().total).toBe(1);

      const removed = videoProcessor.removeFromQueue(queueId);
      expect(removed).toBe(true);
      expect(videoProcessor.getQueueStatus().total).toBe(0);
    });

    it('should handle removing non-existent items', () => {
      const removed = videoProcessor.removeFromQueue('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('extractRecipeWithAI', () => {
    it('should extract recipe successfully from AI response', async () => {
      const mockTranscript = "Mix 2 cups of flour with 1 cup of sugar and 2 eggs. Bake for 25 minutes.";
      const mockAIResponse = {
        response: JSON.stringify({
          ingredients: [
            { name: 'Flour', amount: 2, unit: 'cups', notes: 'All-purpose' },
            { name: 'Sugar', amount: 1, unit: 'cup', notes: 'Granulated' },
            { name: 'Eggs', amount: 2, unit: 'large', notes: 'Room temperature' }
          ],
          servings: 4,
          prepTime: 15,
          cookTime: 25,
          instructions: [
            'Mix flour and sugar',
            'Add eggs',
            'Bake for 25 minutes'
          ],
          description: 'Simple cake recipe'
        })
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIResponse
      });

      const result = await (videoProcessor as any).extractRecipeWithAI(mockTranscript);

      expect(result.ingredients).toHaveLength(3);
      expect(result.servings).toBe(4);
      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(25);
      expect(result.instructions).toHaveLength(3);
      expect(result.description).toBe('Simple cake recipe');
    });

    it('should handle malformed AI responses', async () => {
      const mockTranscript = "Mix ingredients and bake.";
      const mockAIResponse = {
        response: "This is not valid JSON"
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIResponse
      });

      await expect(
        (videoProcessor as any).extractRecipeWithAI(mockTranscript)
      ).rejects.toThrow('Failed to parse AI response');
    });

    it('should handle missing required fields in AI response', async () => {
      const mockTranscript = "Mix ingredients and bake.";
      const mockAIResponse = {
        response: JSON.stringify({
          ingredients: [], // Missing required fields
          servings: 0
        })
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAIResponse
      });

      await expect(
        (videoProcessor as any).extractRecipeWithAI(mockTranscript)
      ).rejects.toThrow('Invalid ingredients data');
    });

    it('should use fallback when AI extraction fails', async () => {
      const mockTranscript = "Mix flour and sugar with eggs.";
      
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await (videoProcessor as any).extractRecipeWithAI(mockTranscript);

      expect(result.ingredients).toHaveLength(3); // flour, sugar, eggs
      expect(result.servings).toBe(4);
      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(30);
    });

    it('should handle Ollama API errors', async () => {
      const mockTranscript = "Mix ingredients and bake.";
      
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await (videoProcessor as any).extractRecipeWithAI(mockTranscript);

      // Should fall back to fallback recipe
      expect(result.ingredients).toHaveLength(3);
      expect(result.servings).toBe(4);
    });
  });

  describe('validateAndTransformAIResponse', () => {
    it('should validate and transform valid AI response', () => {
      const mockData = {
        ingredients: [
          { name: 'Flour', amount: 2, unit: 'cups' },
          { name: 'Sugar', amount: 1, unit: 'cup' }
        ],
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        instructions: ['Mix ingredients', 'Bake'],
        description: 'Test recipe'
      };

      const result = (videoProcessor as any).validateAndTransformAIResponse(mockData);

      expect(result.ingredients).toHaveLength(2);
      expect(result.ingredients[0]).toEqual({
        name: 'Flour',
        amount: 2,
        unit: 'cups',
        notes: undefined
      });
      expect(result.servings).toBe(4);
      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(25);
    });

    it('should handle missing optional fields', () => {
      const mockData = {
        ingredients: [
          { name: 'Flour', amount: 2, unit: 'cups' }
        ],
        servings: 4
        // Missing prepTime, cookTime, instructions, description
      };

      const result = (videoProcessor as any).validateAndTransformAIResponse(mockData);

      expect(result.prepTime).toBe(0);
      expect(result.cookTime).toBe(0);
      expect(result.instructions).toEqual([]);
      expect(result.description).toBe('');
    });

    it('should handle string amounts in ingredients', () => {
      const mockData = {
        ingredients: [
          { name: 'Flour', amount: '2', unit: 'cups' }
        ],
        servings: 4
      };

      const result = (videoProcessor as any).validateAndTransformAIResponse(mockData);

      expect(result.ingredients[0].amount).toBe(2);
    });

    it('should handle invalid amount values', () => {
      const mockData = {
        ingredients: [
          { name: 'Flour', amount: 'invalid', unit: 'cups' }
        ],
        servings: 4
      };

      const result = (videoProcessor as any).validateAndTransformAIResponse(mockData);

      expect(result.ingredients[0].amount).toBe(0);
    });
  });

  describe('getFallbackRecipe', () => {
    it('should extract common ingredients from transcript', () => {
      const transcript = "Mix 2 cups of flour with sugar and 3 eggs. Add milk and butter.";
      
      const result = (videoProcessor as any).getFallbackRecipe(transcript);

      expect(result.ingredients).toHaveLength(5); // flour, sugar, eggs, milk, butter
      expect(result.ingredients.some(ing => ing.name === 'Flour')).toBe(true);
      expect(result.ingredients.some(ing => ing.name === 'Sugar')).toBe(true);
      expect(result.ingredients.some(ing => ing.name === 'Eggs')).toBe(true);
      expect(result.ingredients.some(ing => ing.name === 'Milk')).toBe(true);
      expect(result.ingredients.some(ing => ing.name === 'Butter')).toBe(true);
    });

    it('should return default values for transcript without common ingredients', () => {
      const transcript = "Mix some ingredients and cook them.";
      
      const result = (videoProcessor as any).getFallbackRecipe(transcript);

      expect(result.ingredients).toHaveLength(0);
      expect(result.servings).toBe(4);
      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(30);
      expect(result.instructions).toEqual(['Follow the video instructions']);
    });
  });

  describe('Integration Tests', () => {
    it('should process video end-to-end successfully', async () => {
      // Mock all the dependencies
      jest.spyOn(videoProcessor, 'validateVideoConstraints').mockResolvedValue({
        valid: true,
        errors: []
      });

      jest.spyOn(videoProcessor as any, 'extractAudio').mockResolvedValue('/path/to/audio.wav');
      jest.spyOn(videoProcessor as any, 'transcribeAudio').mockResolvedValue('Mix flour and sugar');
      jest.spyOn(videoProcessor as any, 'extractRecipeWithAI').mockResolvedValue({
        ingredients: [{ name: 'Flour', amount: 2, unit: 'cups' }],
        servings: 4,
        prepTime: 15,
        cookTime: 25,
        instructions: ['Mix ingredients'],
        description: 'Test recipe'
      });

      const result = await videoProcessor.processVideo('/path/to/video.mp4');

      expect(result.ingredients).toHaveLength(1);
      expect(result.servings).toBe(4);
      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(25);
    });

    it('should handle processing errors gracefully', async () => {
      jest.spyOn(videoProcessor as any, 'extractAudio').mockRejectedValue(
        new Error('Audio extraction failed')
      );

      await expect(
        videoProcessor.processVideo('/path/to/video.mp4')
      ).rejects.toThrow('Video processing failed: Error: Audio extraction failed');
    });
  });
});
