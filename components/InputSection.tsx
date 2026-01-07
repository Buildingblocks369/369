
import React, { useState, useRef } from 'react';
import { Mic, Image as ImageIcon, Send, X, Loader2, Square } from 'lucide-react';

interface InputSectionProps {
  onProcess: (text: string, images: string[], audio?: string) => void;
  isProcessing: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({ onProcess, isProcessing }) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required for voice notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudio = () => {
    setAudioBase64(null);
  };

  const handleSubmit = () => {
    if (!text.trim() && images.length === 0 && !audioBase64) return;
    onProcess(text, images, audioBase64 || undefined);
    setText('');
    setImages([]);
    setAudioBase64(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 transition-all">
      <h2 className="text-xl font-bold font-outfit text-slate-800 mb-4 flex items-center gap-2">
        <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">🧠</span>
        Brain Dump
      </h2>
      <p className="text-sm text-slate-500 mb-4">
        Throw everything at me: messy thoughts, screenshots, or just speak your mind. I'll organize it all.
      </p>
      
      <div className="relative">
        <textarea
          className="w-full min-h-[140px] p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all placeholder:text-slate-400"
          placeholder="I need to call the vet, don't forget the laundry, my boss sent that email about the project..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2 mt-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
              <img src={img} alt="Input" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {audioBase64 && (
            <div className="relative group w-20 h-20 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mic size={24} />
              <div className="absolute bottom-1 text-[8px] font-bold">VOICE NOTE</div>
              <button
                onClick={removeAudio}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition-all"
            >
              <ImageIcon size={24} />
              <span className="text-[10px] mt-1 font-medium">Add Photo</span>
            </button>
            
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                isRecording 
                ? 'bg-rose-50 border-rose-300 text-rose-500 animate-pulse' 
                : 'border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-400'
              }`}
            >
              {isRecording ? <Square size={24} /> : <Mic size={24} />}
              <span className="text-[10px] mt-1 font-medium">{isRecording ? 'Stop' : 'Voice Note'}</span>
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={isProcessing || isRecording || (!text && images.length === 0 && !audioBase64)}
          className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold transition-all shadow-md active:scale-95 ${
            isProcessing 
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
            : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Organizing...
            </>
          ) : (
            <>
              <Send size={18} />
              Organize My Chaos
            </>
          )}
        </button>
      </div>
    </div>
  );
};
