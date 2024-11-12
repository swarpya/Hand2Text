# Handwrite - Handwritten Text Recognition

This project is live on : https://swarpya.github.io/Hand2Text/

Handwrite is a sophisticated web application that transforms handwritten notes into digital text using advanced OCR technology. Built with React and TypeScript, it leverages the Microsoft TrOCR model through HuggingFace's API for accurate handwriting recognition.

## Key Features

- 🎯 **Smart Text Selection**: Interactive canvas tool for precise selection of text areas
- 📏 **Multi-line Support**: Innovative solution to handle multiple lines of text through area selection
- 🖼️ **Image Enhancement**: Automatic contrast adjustment and preprocessing for better recognition
- 🎨 **Beautiful UI**: Modern, Apple-inspired design with smooth animations
- 💾 **Instant Results**: Real-time processing and display of recognized text

## Technical Solution

### The Multi-line Challenge

The Microsoft TrOCR model (`microsoft/trocr-large-handwritten`) is optimized for single-line text recognition. However, real-world handwritten notes often contain multiple lines. We solved this limitation through:

1. **Interactive Selection System**: 
   - Users can draw rectangles around individual lines of text
   - Each selection is processed as a separate image
   - Results are combined in the correct order

2. **Image Preprocessing Pipeline**:
   - Automatic padding addition (10px) for better recognition
   - Grayscale conversion
   - Contrast enhancement (1.5x factor)
   - High-quality image processing with anti-aliasing

3. **Smart Image Processing**:
   ```typescript
   // Example of our enhancement pipeline
   const enhanceContrast = (imageData: ImageData): ImageData => {
     const data = imageData.data;
     const factor = 1.5;
     for (let i = 0; i < data.length; i += 4) {
       const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
       const newValue = Math.min(255, Math.max(0, ((avg - 128) * factor) + 128));
       data[i] = data[i + 1] = data[i + 2] = newValue;
     }
     return imageData;
   };
   ```

## Technology Stack

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **OCR**: Microsoft TrOCR (via HuggingFace)
- **Build Tool**: Vite

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Get your HuggingFace API key from [HuggingFace Settings](https://huggingface.co/settings/tokens)
4. Start the development server:
   ```bash
   npm run dev
   ```

## How It Works

1. **Upload**: Drag and drop or select your handwritten note
2. **Select**: Draw rectangles around text areas you want to digitize
3. **Process**: Click "Process Selected Areas" to convert to text
4. **Review**: View and copy your digitized text

## Best Practices for Optimal Results

- Ensure good lighting and contrast in your images
- Draw selection boxes closely around text lines
- Process one paragraph or section at a time for best results
- Use high-resolution images when possible

## Limitations

- Works best with clear, well-spaced handwriting
- Processing time may vary based on image size and complexity
- Requires an active internet connection for OCR processing
- API rate limits apply based on HuggingFace account type

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Microsoft for the TrOCR model
- HuggingFace for API access
- The React and TypeScript communities

---

Created with ❤️ by Swaroop Ingavale.
