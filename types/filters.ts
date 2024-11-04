export type DateFilterType = 'day' | 'week' | 'month' | 'year' | 'all';
export type SortByType = 'created' | 'plays';

export const DATE_FILTERS: DateFilterType[] = ['day', 'week', 'month', 'year', 'all'];
export const SORT_TYPES: Record<string, SortByType> = {
  date: 'created',
  popular: 'plays'
};