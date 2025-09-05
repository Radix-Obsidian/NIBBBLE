# Ollama Setup Guide for NIBBBLE

## Overview

NIBBBLE uses Ollama to run local AI models for recipe generation and video analysis. This guide will help you set up Ollama with the MiniCPM-o 2.6 model for optimal performance.

## What is Ollama?

Ollama is a local large language model (LLM) runner that allows you to run AI models on your own machine without sending data to external services. This provides:

- **Privacy**: All data stays on your machine
- **Cost**: No API fees or usage limits
- **Performance**: Fast local processing
- **Reliability**: No network dependencies

## Required Model

### **MiniCPM-o 2.6 (Primary Model)**
- **Model Name**: `minicpm-o2.6:latest`
- **Type**: Multimodal LLM (vision, speech, video understanding)
- **Size**: ~2.6GB
- **Capabilities**: 
  - Video content analysis
  - Recipe generation
  - Ingredient recognition
  - Cooking instruction creation

## Installation Steps

### 1. **Install Ollama**

#### Windows
1. Download from [ollama.ai](https://ollama.ai)
2. Run the installer
3. Ollama will be installed to: `C:\Users\[username]\AppData\Local\Programs\Ollama\`

#### macOS
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. **Start Ollama Service**

#### Windows
```powershell
# Navigate to Ollama directory
cd "C:\Users\autre\AppData\Local\Programs\Ollama"

# Start Ollama service
.\ollama.exe serve
```

#### macOS/Linux
```bash
ollama serve
```

### 3. **Pull the Required Model**

```bash
# Pull MiniCPM-o 2.6 model
ollama pull minicpm-o2.6:latest
```

### 4. **Verify Installation**

```bash
# List available models
ollama list

# Test the model
ollama run minicpm-o2.6:latest "Hello, can you see this?"
```

## Configuration

### **Environment Variables**

Add to your `.env.local` file:

```bash
# Ollama server URL (default)
NEXT_PUBLIC_OLLAMA_URL=http://localhost:11434
```

### **NIBBBLE Configuration**

The system is configured to use MiniCPM-o 2.6 as the primary model:

```typescript
// lib/ollama/client.ts
export const ollamaClient = {
  primaryModel: 'minicpm-o2.6:latest',
  // No fallback models - using only MiniCPM-o 2.6
}
```

## Testing Your Setup

### 1. **Check Ollama Status**

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags
```

Expected response:
```json
{
  "models": [
    {
      "name": "minicpm-o2.6:latest",
      "size": 2760000000,
      "modified_at": "2024-01-XX..."
    }
  ]
}
```

### 2. **Test Model Response**

```bash
# Test basic functionality
ollama run minicpm-o2.6:latest "What can you help me with?"
```

### 3. **Test Video Analysis**

1. Upload a cooking video in NIBBBLE
2. Watch the console for processing logs
3. Verify recipe generation completes successfully

## Troubleshooting

### **Common Issues**

#### 1. **Ollama Not Found**
```bash
Error: 'ollama' is not recognized as an internal or external command
```

**Solution**: Add Ollama to your PATH or use full path:
```powershell
# Windows
& "C:\Users\autre\AppData\Local\Programs\Ollama\ollama.exe" list
```

#### 2. **Port Already in Use**
```bash
Error: listen tcp 127.0.0.1:11434: bind: Only one usage of each socket address...
```

**Solution**: Ollama is already running. Check status:
```bash
curl http://localhost:11434/api/tags
```

#### 3. **Model Not Found**
```bash
Error: model 'minicpm-o2.6:latest' not found
```

**Solution**: Pull the model:
```bash
ollama pull minicpm-o2.6:latest
```

#### 4. **Connection Refused**
```bash
Error: connect ECONNREFUSED 127.0.0.1:11434
```

**Solution**: Start Ollama service:
```bash
ollama serve
```

### **Performance Issues**

#### **Slow Model Loading**
- Ensure sufficient RAM (8GB+ recommended)
- Close unnecessary applications
- Use SSD storage if possible

#### **Slow Response Times**
- Check CPU usage during processing
- Ensure Ollama has sufficient resources
- Consider model size vs. performance needs

## Model Management

### **Available Commands**

```bash
# List models
ollama list

# Remove a model
ollama rm minicpm-o2.6:latest

# Remove all models
ollama rm --all

# Show model info
ollama show minicpm-o2.6:latest
```

### **Model Updates**

```bash
# Pull latest version
ollama pull minicpm-o2.6:latest

# Remove old version (optional)
ollama rm minicpm-o2.6:latest
```

## Security Considerations

### **Local Processing**
- All data stays on your machine
- No external API calls
- No data sent to cloud services

### **Network Access**
- Ollama runs on localhost only
- No external network access required
- Firewall can block port 11434 if desired

## Performance Optimization

### **System Requirements**
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for models
- **CPU**: Modern multi-core processor
- **GPU**: Optional, for faster processing

### **Optimization Tips**
- Close unnecessary applications
- Use SSD storage for models
- Ensure adequate cooling
- Monitor system resources

## Integration with NIBBBLE

### **How It Works**
1. User uploads cooking video
2. System extracts video frames
3. MiniCPM-o 2.6 analyzes visual content
4. AI generates recipe details
5. Results displayed to user

### **Expected Performance**
- **Frame Extraction**: 2-5 seconds
- **AI Analysis**: 3-8 seconds
- **Total Processing**: 5-15 seconds
- **Recipe Quality**: High accuracy based on visual content

## Support and Maintenance

### **Regular Tasks**
- Monitor Ollama service status
- Check for model updates
- Verify system performance
- Clean up old models if needed

### **Getting Help**
- Check Ollama logs: `ollama logs`
- Verify model status: `ollama list`
- Test connectivity: `curl http://localhost:11434/api/tags`
- Review system resources

## Future Enhancements

### **Planned Features**
- Model performance monitoring
- Automatic model updates
- Enhanced error handling
- Performance analytics

### **Model Improvements**
- Larger context windows
- Better video understanding
- Enhanced recipe generation
- Multi-language support

---

## Quick Reference

```bash
# Start Ollama
ollama serve

# Check status
curl http://localhost:11434/api/tags

# List models
ollama list

# Test model
ollama run minicpm-o2.6:latest "Test message"

# Stop Ollama
# Use Ctrl+C in the terminal running ollama serve
```

Your NIBBBLE setup is now optimized for local AI processing with MiniCPM-o 2.6!
