import { NextRequest, NextResponse } from 'next/server';
import { PatientService } from '@/services/patientService';
import { CreatePatientInput } from '@/types/patient';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreatePatientInput;
    const patient = await PatientService.registerPatient(body);
    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to register patient' },
      { status: 400 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const abha = searchParams.get('abha');
    const phone = searchParams.get('phone');
    const id = searchParams.get('id');

    let patient = null;
    if (id) {
      patient = await PatientService.getPatientById(id);
    } else if (abha) {
      patient = await PatientService.getPatientByAbha(abha);
    } else if (phone) {
      patient = await PatientService.getPatientByPhone(phone);
    }

    if (!patient) {
      return NextResponse.json({ success: false, message: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: patient });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching patient' },
      { status: 500 }
    );
  }
}
