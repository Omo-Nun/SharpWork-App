'use client';

import { useParams } from 'next/navigation';
import { ChatInterface } from '../../../../../components/ChatInterface';
import { RequireArtisanAuth } from '../../../../../components/RequireArtisanAuth';

export default function ArtisanChatPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  return (
    <RequireArtisanAuth>
      <div className="pt-6">
        <ChatInterface bookingId={bookingId} currentRole="ARTISAN" />
      </div>
    </RequireArtisanAuth>
  );
}
