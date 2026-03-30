'use client';

import { Alert } from 'antd';
import { FeedbackState } from '@/lib/types';

interface FeedbackMessageProps {
  feedback: FeedbackState | null;
}

export default function FeedbackMessage({ feedback }: FeedbackMessageProps) {
  if (!feedback) {
    return null;
  }

  return (
    <Alert
      showIcon
      type={feedback.type}
      message={feedback.text}
      style={{ marginTop: 12 }}
    />
  );
}
