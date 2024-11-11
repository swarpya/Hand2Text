export interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  recordDate: string;
  content: string;
}

export interface OCRResponse {
  generated_text: string;
}