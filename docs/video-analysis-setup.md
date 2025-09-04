# Video Analysis Setup Guide

## Overview

PantryPals uses an intelligent video analysis system that extracts recipe information from cooking videos without requiring external AI services. The system analyzes video frames to understand cooking processes and generate detailed recipe information.

## How It Works

### 1. **Video Frame Analysis (Primary Method)**
- Extracts 8 strategic frames from your video
- Analyzes visual content for cooking stages
- Identifies ingredients, actions, and cooking techniques
- Generates comprehensive recipe descriptions

### 2. **Web Speech API (Fallback)**
- Browser-based speech recognition
- Requires HTTPS or localhost
- Falls back to video analysis if unavailable

### 3. **AI Recipe Generation**
- Uses your local Ollama MiniCPM-o 2.6 model
- Processes video analysis results
- Generates detailed recipe titles and instructions
- No external API costs or dependencies

## System Requirements

### **Development Environment**
- Localhost (for Web Speech API testing)
- Modern browser with video support
- Ollama running locally with MiniCPM-o 2.6 model

### **Production Environment**
- HTTPS required for Web Speech API
- Video processing capabilities
- Ollama server accessible

## Setup Instructions

### 1. **Install Ollama**
```bash
# Download and install Ollama from https://ollama.ai
# Pull the MiniCPM-o 2.6 model
ollama pull minicpm-o2.6:latest
```

### 2. **Verify Ollama Installation**
```bash
# Check if Ollama is running
ollama list

# Test the model
ollama run minicpm-o2.6:latest "Hello, can you see this?"
```

### 3. **Environment Variables**
```bash
# Required
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434

# Optional (for Web Speech API in production)
# HTTPS must be enabled for Web Speech API to work
```

## How Video Analysis Works

### **Frame Extraction Process**
1. **Strategic Sampling**: Extracts 8 frames at key intervals
2. **Performance Optimization**: Limits canvas size to 800px max dimension
3. **Quality Balance**: JPEG quality set to 0.85 for optimal size/quality ratio

### **Visual Analysis Stages**
1. **Preparation Stage** (0-30% of video)
   - Ingredient preparation
   - Chopping and measuring
   - Initial setup

2. **Cooking Stage** (30-70% of video)
   - Active cooking process
   - Stirring and heating
   - Sauce and seasoning addition

3. **Presentation Stage** (70-100% of video)
   - Plating and garnishing
   - Final touches
   - Serving presentation

### **AI Processing**
- MiniCPM-o 2.6 analyzes extracted frames
- Generates recipe titles based on visual content
- Creates detailed cooking instructions
- Identifies key ingredients and techniques

## Performance Optimizations

### **Frame Extraction**
- Reduced from 10 to 8 frames for better performance
- Optimized canvas dimensions (max 800px)
- Strategic frame timing for better coverage

### **Memory Management**
- Efficient canvas usage
- Optimized image quality settings
- Proper cleanup of video elements

### **Processing Speed**
- Parallel frame processing where possible
- Optimized thumbnail generation
- Reduced unnecessary operations

## Troubleshooting

### **Web Speech API Issues**
```
Error: Speech recognition error: network
```
**Solution**: This is normal in development. The system automatically falls back to video analysis.

### **Video Processing Errors**
```
Error: Failed to extract video frames
```
**Solutions**:
- Ensure video file is valid and not corrupted
- Check browser video codec support
- Verify file size is under 50MB limit

### **Ollama Connection Issues**
```
Error: connect ECONNREFUSED 127.0.0.1:11434
```
**Solutions**:
- Ensure Ollama is running: `ollama serve`
- Check if port 11434 is available
- Verify firewall settings

## Expected Results

### **Recipe Generation**
- **Titles**: Descriptive names based on visual content
- **Ingredients**: Identified from cooking stages
- **Instructions**: Step-by-step process from video analysis
- **Confidence**: 0.7+ for video analysis, 0.8+ for speech

### **Performance Metrics**
- **Frame Extraction**: 2-5 seconds for typical videos
- **Analysis Processing**: 3-8 seconds with Ollama
- **Total Processing**: 5-15 seconds end-to-end

## Cost Considerations

### **Local Processing (Current Setup)**
- **Zero external API costs**
- **No network dependencies**
- **Unlimited video processing**
- **Privacy-focused (all processing local)**

### **Alternative Options (Not Currently Used)**
- **Whisper API**: $0.006 per minute of audio
- **Google Vision API**: $1.50 per 1000 requests
- **Azure Computer Vision**: $1.00 per 1000 transactions

## Best Practices

### **Video Quality**
- Use clear, well-lit videos
- Ensure ingredients are visible
- Show cooking process clearly
- Keep camera steady during key moments

### **Content Optimization**
- Focus on ingredient preparation
- Show cooking techniques clearly
- Include plating and presentation
- Keep videos under 2 minutes for best results

### **Performance Tips**
- Upload during off-peak hours
- Ensure stable internet connection
- Close unnecessary browser tabs
- Use modern browsers for best performance

## Future Enhancements

### **Planned Improvements**
- Enhanced computer vision integration
- Better ingredient recognition
- Cooking technique classification
- Recipe difficulty assessment

### **Advanced Features**
- Multi-language support
- Dietary restriction detection
- Nutritional information extraction
- Recipe difficulty scoring

## Support

For technical support or questions about video analysis:
- Check the console logs for detailed processing information
- Verify Ollama model availability
- Ensure proper environment configuration
- Review browser compatibility requirements
