import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { PatientAuthProvider } from '@/context/PatientAuthContext';
import { PatientSessionProvider } from '@/context/PatientSessionContext';
import { DoctorAuthProvider } from '@/context/DoctorAuthContext';

export const metadata: Metadata = {
  title: 'MediKiosk — AI-Powered Clinical Intake Platform',
  description: 'Hospital patient self-service clinical intake kiosk for preliminary clinical history recording, ABHA integration, and structured summary generation.',
};

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
            <PatientAuthProvider>
              <PatientSessionProvider>
                <DoctorAuthProvider>
                  {children}
                </DoctorAuthProvider>
              </PatientSessionProvider>
            </PatientAuthProvider>
          </AccessibilityProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
