import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';

import { DEFAULT_FILTERS, type DishFilters } from '@/utils/dishFilters';

type FilterContextValue = {
  filters: DishFilters;
  setFilters: Dispatch<SetStateAction<DishFilters>>;
};

const FilterContext = createContext<FilterContextValue | null>(null);

// Điều kiện tìm kiếm, lọc, sắp xếp của màn hình danh sách. Đặt ở gốc ứng dụng thay vì trong màn hình
// nên mở chi tiết, thêm, sửa rồi quay về danh sách vẫn giữ nguyên các điều kiện đã chọn
export function FilterProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const value = useMemo(() => ({ filters, setFilters }), [filters]);
  return <FilterContext.Provider value={value}>{children}</FilterContext.Provider>;
}

export function useDishFilters() {
  const value = useContext(FilterContext);
  if (!value) throw new Error('useDishFilters must be used inside FilterProvider');
  return value;
}
