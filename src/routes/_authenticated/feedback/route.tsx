import { createFileRoute } from '@tanstack/react-router';
import { UserFeedback } from '@/components/user-feedback';

export const Route = createFileRoute('/_authenticated/feedback')({
  component: Feedback,
});

function Feedback() {
  return (
    <div className="p-6">
      <UserFeedback />
    </div>
  );
}