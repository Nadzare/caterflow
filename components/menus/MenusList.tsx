/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { createMenu, updateMenu, deleteMenu } from '@/app/actions/menuActions';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/AuthContext';

interface Menu {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  allergenLabels: unknown;
  _count?: {
    orderItems: number;
  };
}

interface MenusListProps {
  initialMenus: Menu[];
}

const PRESET_CATEGORIES = [
  'Nasi Box',
  'Tumpeng',
  'Main Course',
  'Soup',
  'Beverage',
  'Dessert',
  'Sampingan',
  'Pencuci Mulut'
];

const COMMON_ALLERGENS = ['Gluten', 'Soy', 'Peanut', 'Dairy', 'Seafood', 'Egg', 'Nut', 'Poultry', 'Coconut'];

// Helper function to extract allergens array from different database JSON formats
function getAllergensArray(allergenLabels: unknown): string[] {
  if (!allergenLabels) return [];
  let parsed: any = allergenLabels;
  if (typeof allergenLabels === 'string') {
    try {
      parsed = JSON.parse(allergenLabels);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed)) {
    return parsed;
  }
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.contains)) {
    return parsed.contains;
  }
  return [];
}

export function MenusList({ initialMenus }: MenusListProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [menus, setMenus] = useState<Menu[]>(initialMenus);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedAllergenFilter, setSelectedAllergenFilter] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);

  // Actions Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<Menu | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [allergens, setAllergens] = useState<string[]>([]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedMenu(null);
    setName('');
    setCategory(PRESET_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setBasePrice(0);
    setAllergens([]);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (menu: Menu) => {
    setModalMode('edit');
    setSelectedMenu(menu);
    setName(menu.name);
    setBasePrice(menu.basePrice);
    setAllergens(getAllergensArray(menu.allergenLabels));

    // Handle Category preset vs custom
    if (PRESET_CATEGORIES.includes(menu.category)) {
      setCategory(menu.category);
      setIsCustomCategory(false);
      setCustomCategoryName('');
    } else {
      setCategory('OTHER');
      setIsCustomCategory(true);
      setCustomCategoryName(menu.category);
    }

    setModalOpen(true);
    setActiveMenuId(null);
  };

  // Open delete dialog
  const handleOpenDelete = (menu: Menu) => {
    setMenuToDelete(menu);
    setDeleteOpen(true);
    setActiveMenuId(null);
  };

  // Submit Menu Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = isCustomCategory ? customCategoryName.trim() : category;
    if (!finalCategory) {
      toast('Please specify a menu category', 'error');
      return;
    }

    if (basePrice < 0) {
      toast('Price cannot be negative', 'error');
      return;
    }

    const payload = {
      name: name.trim(),
      category: finalCategory,
      basePrice,
      allergenLabels: allergens
    };

    if (modalMode === 'create') {
      const res = await createMenu(payload, profile?.tenantId || undefined);
      if (res.success && res.menu) {
        toast(`Menu "${name}" created successfully!`, 'success');
        const newMenuWithCount: Menu = {
          ...res.menu,
          _count: { orderItems: 0 }
        };
        setMenus(prev => [...prev, newMenuWithCount]);
        setModalOpen(false);
      } else {
        toast(res.error || 'Failed to create menu', 'error');
      }
    } else if (modalMode === 'edit' && selectedMenu) {
      const res = await updateMenu(selectedMenu.id, payload);
      if (res.success && res.menu) {
        toast(`Menu "${name}" updated successfully!`, 'success');
        setMenus(prev => prev.map(m => m.id === selectedMenu.id ? { ...m, ...res.menu } : m));
        setModalOpen(false);
      } else {
        toast(res.error || 'Failed to update menu', 'error');
      }
    }
  };

  // Confirm delete menu item
  const handleDeleteConfirm = async () => {
    if (!menuToDelete) return;

    const res = await deleteMenu(menuToDelete.id);
    if (res.success) {
      toast(`Menu "${menuToDelete.name}" deleted successfully!`, 'success');
      setMenus(prev => prev.filter(m => m.id !== menuToDelete.id));
      setDeleteOpen(false);
      setMenuToDelete(null);
    } else {
      toast(res.error || 'Failed to delete menu', 'error');
    }
  };

  // Toggle allergen in form
  const toggleFormAllergen = (allergen: string) => {
    setAllergens(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  // Toggle allergen filter
  const toggleAllergenFilter = (allergen: string) => {
    setSelectedAllergenFilter(prev =>
      prev.includes(allergen)
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  // List of active categories in this menu dataset (for filter dropdown)
  const activeCategories = useMemo(() => {
    const categoriesSet = new Set(menus.map(m => m.category));
    return Array.from(categoriesSet).sort();
  }, [menus]);

  // Client-side search and filters
  const filteredMenus = useMemo(() => {
    return menus.filter(m => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
      if (!matchSearch) return false;

      // 2. Category Filter
      if (selectedCategoryFilter !== 'ALL' && m.category !== selectedCategoryFilter) {
        return false;
      }

      // 3. Allergen Filters (Shows items that DO NOT contain excluded allergens)
      const itemAllergens = getAllergensArray(m.allergenLabels).map(a => a.toLowerCase());
      for (const excludedAllergen of selectedAllergenFilter) {
        if (itemAllergens.includes(excludedAllergen.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [menus, searchQuery, selectedCategoryFilter, selectedAllergenFilter]);

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Catering Menus</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Configure and publish your catering packages and dishes.</p>
        </div>
        <button onClick={handleOpenCreate} className="flat-button">
          <i className="fa-solid fa-plus mr-1.5" /> Add New Menu
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 relative">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search menus by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flat-input w-full pl-11 py-2.5 focus:shadow-sm"
          />
        </div>

        {/* Preset Category filter dropdown */}
        <div className="relative">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="flat-input py-2.5 px-4 cursor-pointer pr-8 text-sm bg-white dark:bg-[#1A1715] font-semibold border-[var(--border)]"
          >
            <option value="ALL">All Categories</option>
            {activeCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Allergen Filters Panel Toggle */}
        <div ref={filterDropdownRef} className="relative">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`px-4 py-2.5 rounded-xl border ${filterOpen || selectedAllergenFilter.length > 0 ? 'border-[var(--primary)] bg-orange-50/50 dark:bg-orange-950/10 text-[var(--primary)]' : 'border-[var(--border)] bg-white dark:bg-[#1A1715] text-slate-700 dark:text-stone-200'} text-sm font-semibold flex items-center gap-2 transition-colors duration-200 cursor-pointer`}
          >
            <i className="fa-solid fa-triangle-exclamation text-slate-400 mr-1.5" /> Allergen Safety
            {selectedAllergenFilter.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>

          {/* Allergen exclusion panel */}
          {filterOpen && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-2xl shadow-xl w-64 z-40 p-4.5 animate-fade-in-up">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Filter Out Allergen-Containing Dishes</h4>
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {COMMON_ALLERGENS.map((allergen) => (
                  <label key={allergen} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAllergenFilter.includes(allergen)}
                      onChange={() => toggleAllergenFilter(allergen)}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    Exclude {allergen}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menus Table */}
      <div className="flat-card p-0 overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Dish Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Base Price</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Allergen Safety Labels</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-right">Order Items</th>
                <th className="py-4 px-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredMenus.map((menu) => {
                const itemAllergens = getAllergensArray(menu.allergenLabels);
                return (
                  <tr key={menu.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-stone-100 text-sm">
                      {menu.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-stone-300 text-sm font-semibold">
                      <span className="px-2.5 py-1 text-slate-600 dark:text-stone-300 bg-slate-100 dark:bg-stone-800/80 rounded-lg text-xs font-bold">
                        {menu.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-800 dark:text-stone-200 text-sm font-extrabold">
                      Rp {menu.basePrice.toLocaleString()}
                    </td>
                    <td className="py-4 px-6">
                      {itemAllergens.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {itemAllergens.map((a) => (
                            <span key={a} className="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <i className="fa-solid fa-triangle-exclamation text-[10px] text-rose-500 mr-1" /> {a.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-100/50 dark:border-emerald-900/20">Allergen Checked ✓</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-slate-500 dark:text-stone-400">
                      {menu._count?.orderItems || 0}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === menu.id ? null : menu.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 transition-colors duration-150 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis w-4 h-4 flex items-center justify-center" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === menu.id && (
                        <div ref={actionsMenuRef} className="absolute right-6 mt-1 w-32 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-fade-in-up text-left">
                          <button
                            onClick={() => handleOpenEdit(menu)}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#24201D] flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square w-3.5 h-3.5 flex items-center justify-center text-slate-400 text-xs" /> Edit Menu
                          </button>
                          <button
                            onClick={() => handleOpenDelete(menu)}
                            className="w-full px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can w-3.5 h-3.5 flex items-center justify-center text-red-400 text-xs" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredMenus.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-stone-500">
                    No menu items match the search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Menu Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-lg w-full p-6 shadow-2xl animate-fade-in-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-stone-100">
                {modalMode === 'create' ? 'Add New Menu Item' : 'Edit Menu Details'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Dish Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Dish Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flat-input w-full"
                  placeholder="e.g. Soto Ayam Madura"
                />
              </div>

              {/* Category selector & custom input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCategory(val);
                      if (val === 'OTHER') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                      }
                    }}
                    className="flat-input w-full cursor-pointer"
                  >
                    {PRESET_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="OTHER">Lainnya (Tulis Sendiri)</option>
                  </select>
                </div>
                {isCustomCategory && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Custom Category Name</label>
                    <input
                      type="text"
                      required
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      className="flat-input w-full"
                      placeholder="e.g. Minuman Tradisional"
                    />
                  </div>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Base Price (IDR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-extrabold text-slate-400 dark:text-stone-500">Rp</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basePrice === 0 ? '' : basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="flat-input w-full pl-9"
                    placeholder="e.g. 35000"
                  />
                </div>
              </div>

              {/* Allergen Labels */}
              <div className="border-t border-[var(--border)] pt-3.5">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Allergen Safety Labels</span>
                <p className="text-[10px] text-slate-400 dark:text-stone-500 leading-relaxed mb-3">Mark any food allergens contained in this dish for automated compliance matching.</p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGENS.map((allergen) => {
                    const active = allergens.includes(allergen);
                    return (
                      <button
                        type="button"
                        key={allergen}
                        onClick={() => toggleFormAllergen(allergen)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 cursor-pointer ${active ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' : 'bg-slate-50 dark:bg-stone-900 border-[var(--border)] text-slate-600 dark:text-stone-400'}`}
                      >
                        {allergen}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 justify-end border-t border-[var(--border)] pt-4 mt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flat-button text-xs py-2.5 px-5"
              >
                {modalMode === 'create' ? 'Add Menu' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-sm w-full p-6 shadow-2xl text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50 dark:border-red-900/20">
              <i className="fa-solid fa-triangle-exclamation text-xl" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-1.5">Delete Menu Item</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Are you sure you want to delete menu item <span className="font-bold text-slate-700 dark:text-stone-200">&quot;{menuToDelete?.name}&quot;</span>? 
              <br /><br />
              <span className="text-red-500 font-semibold font-bold">WARNING:</span> This will permanently remove the item from all historical and pending orders. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow duration-200"
              >
                <i className="fa-solid fa-trash-can text-xs mr-1.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
