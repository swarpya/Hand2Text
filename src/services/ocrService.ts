export async function processImage(imageData: string | File): Promise<string> {
  const apiKey = localStorage.getItem('huggingface_api_key');
  if (!apiKey) {
    throw new Error('Please set your HuggingFace API key first');
  }

  try {
    let base64Image: string;
    
    if (typeof imageData === 'string') {
      base64Image = imageData.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
    } else {
      base64Image = await fileToBase64(imageData);
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/trocr-large-handwritten",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ 
          inputs: base64Image,
          options: {
            wait_for_model: true,
            use_cache: false,
            preprocessing: {
              resize: true,
              normalize: true,
              threshold: "otsu",
              pad: true
            }
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Response:', errorData);
      throw new Error(
        `API request failed: ${response.statusText}${
          errorData.error ? ` - ${errorData.error}` : ''
        }`
      );
    }

    const result = await response.json();
    console.log('OCR Result:', result);
    
    if (Array.isArray(result) && result.length > 0) {
      return result[0].generated_text || '';
    }
    
    if (typeof result === 'object' && result.generated_text) {
      return result.generated_text;
    }

    throw new Error('No text was detected in the image');
  } catch (error) {
    console.error('OCR Error:', error);
    if (error instanceof Error) {
      throw new Error(`OCR processing failed: ${error.message}`);
    }
    throw new Error('OCR processing failed');
  }
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, '');
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}