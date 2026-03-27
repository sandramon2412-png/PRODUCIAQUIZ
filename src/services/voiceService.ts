export class VoiceService {
  private recognition: any;
  private synth: SpeechSynthesis;

  constructor() {
    this.synth = window.speechSynthesis;
    
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'es-ES';
      this.recognition.interimResults = false;
    }
  }

  startListening(onResult: (text: string) => void, onEnd: () => void) {
    if (!this.recognition) return;

    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      onResult(text);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    this.recognition.start();
  }

  stopListening() {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  speak(text: string) {
    if (!this.synth) return;
    
    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    this.synth.speak(utterance);
  }
}

export const voiceService = new VoiceService();
