import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { PatientSessionProvider } from '@/context/PatientSessionContext';

export const metadata: Metadata = {
  title: 'MediKiosk — AI-Powered Clinical Intake Platform',
  description: 'Hospital patient self-service clinical intake kiosk for preliminary clinical history recording, ABHA integration, and structured summary generation.',
};

import { DoctorAuthProvider } from '@/context/DoctorAuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LanguageProvider>
          <AccessibilityProvider>
            <PatientSessionProvider>
              <DoctorAuthProvider>
                {children}
              </DoctorAuthProvider>
            </PatientSessionProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
