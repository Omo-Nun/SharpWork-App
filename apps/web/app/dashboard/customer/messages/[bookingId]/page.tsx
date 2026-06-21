'use client';

import { useParams } from 'next/navigation';
import { ChatInterface } from '../../../../../components/ChatInterface';
import { RequireCustomerAuth } from '../../../../../components/RequireCustomerAuth';

export default function CustomerChatPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  return (
    <RequireCustomerAuth>
      <div className="pt-6">
        <ChatInterface bookingId={bookingId} currentRole="CUSTOMER" />
      </div>
    </RequireCustomerAuth>
  );
}
