'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getMenus(tenantId?: string) {
  try {
    const menus = await prisma.menu.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { orderItems: true }
        }
      }
    });
    return menus;
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return [];
  }
}

export async function createMenu(data: {
  name: string;
  category: string;
  basePrice: number;
  allergenLabels?: string[];
}, tenantId?: string) {
  try {
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        category: data.category,
        basePrice: data.basePrice,
        allergenLabels: data.allergenLabels || [],
        tenantId: tenantId || null,
      },
    });
    revalidatePath('/menus');
    revalidatePath('/orders');
    return { success: true, menu };
  } catch (error) {
    console.error('Failed to create menu:', error);
    return { success: false, error: 'Failed to create menu' };
  }
}

export async function updateMenu(
  id: string,
  data: {
    name: string;
    category: string;
    basePrice: number;
    allergenLabels?: string[];
  }
) {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        basePrice: data.basePrice,
        allergenLabels: data.allergenLabels || [],
      },
    });
    revalidatePath('/menus');
    revalidatePath('/orders');
    return { success: true, menu };
  } catch (error) {
    console.error('Failed to update menu:', error);
    return { success: false, error: 'Failed to update menu' };
  }
}

export async function deleteMenu(id: string) {
  try {
    // Delete associated order items to avoid FK constraints
    await prisma.orderItem.deleteMany({
      where: { menuId: id }
    });

    const menu = await prisma.menu.delete({
      where: { id },
    });
    revalidatePath('/menus');
    revalidatePath('/orders');
    revalidatePath('/dashboard');
    return { success: true, menu };
  } catch (error) {
    console.error('Failed to delete menu:', error);
    return { success: false, error: 'Failed to delete menu' };
  }
}
