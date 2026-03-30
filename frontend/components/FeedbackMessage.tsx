'use client';

import { FeedbackState } from '@/lib/types';

interface FeedbackMessageProps {
  feedback: FeedbackState | null;
}

export default function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback) {
    return null;
  }

  return (
    <p className={feedback.type === 'success' ? 'feedback success' : 'feedback error'}>
      {feedback.text}
    </p>
  );
}
