interface VisualSearchResult {
  productId: string;
  name: string;
  image: string;
  price: string;
  similarity: number;
  category: string;
}

interface ColorInfo {
  dominant: string[];
  palette: string[];
}

interface ObjectDetection {
  objects: Array<{
    name: string;
    confidence: number;
    bbox: number[];
  }>;
}

class FrontendVisualSearchService {
  private apiBase = '/api/search/visual';

  async searchByImage(imageFile: File): Promise<VisualSearchResult[]> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(this.apiBase, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Visual search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Visual search error:', error);
      return [];
    }
  }

  async extractColors(imageFile: File): Promise<ColorInfo> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiBase}/colors`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Color extraction failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Color extraction error:', error);
      return { dominant: [], palette: [] };
    }
  }

  async detectObjects(imageFile: File): Promise<ObjectDetection> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiBase}/objects`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Object detection failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Object detection error:', error);
      return { objects: [] };
    }
  }

  async getSimilarProducts(productId: string): Promise<VisualSearchResult[]> {
    try {
      const response = await fetch(`${this.apiBase}/similar/${productId}`);

      if (!response.ok) {
        throw new Error('Similar products search failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Similar products error:', error);
      return [];
    }
  }

  async analyzeImage(imageFile: File) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${this.apiBase}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Image analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Image analysis error:', error);
      return null;
    }
  }

  async getCapabilities() {
    try {
      const response = await fetch(`${this.apiBase}/capabilities`);

      if (!response.ok) {
        throw new Error('Failed to get capabilities');
      }

      return await response.json();
    } catch (error) {
      console.error('Capabilities error:', error);
      return null;
    }
  }
}

export default FrontendVisualSearchService;