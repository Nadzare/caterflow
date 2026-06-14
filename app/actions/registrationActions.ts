'use server'

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function submitRegistrationRequest(data: {
  companyName: string;
  picName: string;
  email: string;
  phone: string;
}) {
  try {
    const emailLower = data.email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      throw new Error('Email ini sudah terdaftar sebagai pengguna sistem.');
    }

    const existingRequest = await prisma.registrationRequest.findUnique({
      where: { email: emailLower },
    });
    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        throw new Error('Permohonan pendaftaran Anda sedang diproses. Mohon tunggu.');
      } else if (existingRequest.status === 'APPROVED') {
        throw new Error('Permohonan Anda sudah disetujui. Silakan langsung masuk/mendaftar.');
      }
    }

    return await prisma.registrationRequest.create({
      data: {
        companyName: data.companyName,
        picName: data.picName,
        email: emailLower,
        phone: data.phone,
        status: 'PENDING',
      },
    });
  } catch (error: any) {
    console.error('Failed to submit registration request:', error);
    throw new Error(error.message || 'Gagal mengirimkan permohonan.');
  }
}

export async function getRegistrationRequests() {
  try {
    return await prisma.registrationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch registration requests:', error);
    return [];
  }
}

export async function approveRegistrationRequest(id: string) {
  try {
    const request = await prisma.registrationRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new Error('Permohonan tidak ditemukan.');
    }

    // Create tenant for this catering company
    const tenant = await prisma.tenant.create({
      data: {
        name: request.companyName,
      },
    });

    // Update status in request
    await prisma.registrationRequest.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // Create user placeholder in Prisma user table
    const existingUser = await prisma.user.findUnique({
      where: { email: request.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: request.email,
          name: request.picName,
          phone: request.phone,
          role: Role.OWNER, // The creator is the OWNER of this catering tenant
          activated: false, // Will be activated on first sync
          tenantId: tenant.id,
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Failed to approve registration request:', error);
    throw new Error(error.message || 'Gagal menyetujui permohonan.');
  }
}

export async function rejectRegistrationRequest(id: string) {
  try {
    await prisma.registrationRequest.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to reject registration request:', error);
    throw new Error('Gagal menolak permohonan.');
  }
}
