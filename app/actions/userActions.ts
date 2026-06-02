'use server'

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function syncUserInDb(id: string, email: string, name: string, phone?: string) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.id !== id) {
        // If the ID is different (e.g. pre-seeded user has a different UUID),
        // we recreate the user using the Supabase UUID to keep them aligned,
        // preserving their role and marking them as activated.
        const role = existing.role;
        const existingName = existing.name;
        const existingPhone = existing.phone;
        await prisma.user.delete({
          where: { email },
        });
        
        return await prisma.user.create({
          data: {
            id,
            email,
            name: existingName || name || 'CaterFlow Staff',
            phone: existingPhone || phone || null,
            role,
            activated: true,
          },
        });
      } else {
        // Update existing profile fields if matching ID
        return await prisma.user.update({
          where: { id },
          data: {
            name: name || existing.name,
            phone: phone || existing.phone || null,
            activated: true,
          },
        });
      }
    } else {
      // Reject public registration syncs!
      throw new Error('Email Anda belum terdaftar dalam sistem. Hubungi Owner/Admin untuk didaftarkan.');
    }
  } catch (error) {
    console.error('Failed to sync user in DB:', error);
    throw error;
  }
}

export async function getUserProfile(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return null;
  }
}

export async function updateUserProfile(id: string, name: string, phone: string) {
  try {
    return await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
      },
    });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    throw new Error('Failed to update profile');
  }
}

export async function checkInvitation(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      return { allowed: false, reason: 'not_invited' };
    }
    if (user.activated) {
      return { allowed: false, reason: 'already_activated' };
    }
    return { allowed: true };
  } catch (error) {
    console.error('Error checking invitation:', error);
    return { allowed: false, reason: 'error' };
  }
}

export async function getTeamMembers() {
  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });
  } catch (error) {
    console.error('Failed to fetch team members:', error);
    return [];
  }
}

export async function addTeamMember(email: string, name: string, role: Role, phone?: string) {
  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new Error('Email ini sudah terdaftar sebagai anggota tim.');
    }
    return await prisma.user.create({
      data: {
        email,
        name,
        role,
        phone: phone || null,
        activated: false,
      },
    });
  } catch (error: any) {
    console.error('Failed to add team member:', error);
    throw new Error(error.message || 'Gagal menambahkan anggota tim.');
  }
}

export async function removeTeamMember(id: string) {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to remove team member:', error);
    throw new Error('Gagal menghapus anggota tim.');
  }
}

export async function updateTeamMemberRole(id: string, role: Role) {
  try {
    return await prisma.user.update({
      where: { id },
      data: { role },
    });
  } catch (error) {
    console.error('Failed to update team member role:', error);
    throw new Error('Gagal memperbarui role anggota tim.');
  }
}
