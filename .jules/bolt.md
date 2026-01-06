## 2024-05-23 - Frontend Memoization
**Learning:** React components processing large datasets client-side (like filtering and mapping nested arrays) without memoization can lead to significant performance bottlenecks, especially when the component re-renders frequently due to local state changes (e.g. date pickers).
**Action:** Always verify if expensive data transformations in React components are memoized using `useMemo`, especially when derived from large props like `students` list with nested `incidents`.
