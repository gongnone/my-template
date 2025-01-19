'use client';

import { useState, useEffect } from 'react';
import { useDeepgram } from '@/lib/contexts/DeepgramContext';
import { addDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSubscription } from '@/lib/hooks/useSubscription';
import Link from 'next/link';

// SVG Icons as components
const MicrophoneIcon = () => (
  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
    />
  </svg>
);

const StopIcon = () => (
  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect x="6" y="6" width="12" height="12" fill="currentColor" />
  </svg>
);

interface VoiceNote {
  id: string;
  text: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  userId: string;
}

export default function VoiceNotes() {
  const { user } = useAuth();
  const { status: subscriptionStatus, planType } = useSubscription();
  const [isRecording, setIsRecording] = useState(false);
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const { connectToDeepgram, disconnectFromDeepgram, realtimeTranscript } = useDeepgram();

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'voiceNotes'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id } as VoiceNote))
        .filter(note => note.userId === user.uid);
      setNotes(notesList);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    setCurrentTranscript(realtimeTranscript);
  }, [realtimeTranscript]);

  const handleStartRecording = () => {
    setIsRecording(true);
    connectToDeepgram();
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    disconnectFromDeepgram();
    
    if (currentTranscript && user) {
      await addDoc(collection(db, 'voiceNotes'), {
        text: currentTranscript,
        createdAt: new Date(),
        userId: user.uid
      });
      setCurrentTranscript('');
    }
  };

  const formatDate = (timestamp: VoiceNote['createdAt']) => {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  // Add limits based on subscription
  const getNotesLimit = () => {
    switch (planType) {
      case 'AGENCY':
        return 1000;
      case 'PRO':
        return 100;
      default:
        return 3; // Free tier
    }
  };

  const isAtLimit = notes.length >= getNotesLimit();

  return (
    <div className="space-y-8">
      {/* Recording button - disabled if at limit */}
      <div className="flex flex-col items-center space-y-6">
        <button
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={!isRecording && isAtLimit}
          className={`
            group relative w-24 h-24 rounded-full shadow-lg
            transition-all duration-300 transform hover:scale-105
            flex items-center justify-center
            ${isRecording 
              ? 'bg-red-500 hover:bg-red-600'
              : isAtLimit
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }
          `}
        >
          {isRecording ? <StopIcon /> : <MicrophoneIcon />}
          <span className={`
            absolute w-full h-full rounded-full
            ${isRecording ? 'animate-ping bg-red-400/75' : ''}
          `} />
        </button>
        <p className="text-gray-600 font-medium">
          {isAtLimit 
            ? `Reached limit of ${getNotesLimit()} notes. Please upgrade to continue.`
            : isRecording ? 'Recording...' : 'Click to Start Recording'
          }
        </p>
      </div>

      {/* Usage counter */}
      <div className="text-center text-sm text-gray-500">
        {notes.length} / {getNotesLimit()} notes used
      </div>

      {currentTranscript && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
          <h3 className="text-sm font-medium text-blue-500 uppercase tracking-wide mb-3">
            Current Transcript
          </h3>
          <p className="text-gray-800 text-lg leading-relaxed">
            {currentTranscript}
          </p>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">
          Your Voice Notes
        </h2>
        {notes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MicrophoneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No voice notes yet. Start recording to create your first note!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md
                  transition-all border border-gray-100"
              >
                <p className="text-gray-800 text-lg mb-3 leading-relaxed">
                  {note.text}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                    />
                  </svg>
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 