# useEffect Infinite Loop Fix

## Issue Fixed
**Error:** "Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."

## Root Cause
The infinite loop was caused in `/src/app/debug/page.tsx` where:

1. `useEffect` had `callCount` in its dependency array
2. Inside the same `useEffect`, `callCount` was being updated via `setCallCount`
3. This created an infinite cycle: useEffect runs → updates callCount → triggers useEffect again

## Fix Applied

### Before (Infinite Loop):
```tsx
const [callCount, setCallCount] = useState(0)

useEffect(() => {
  setCallCount(prev => prev + 1)  // ❌ Updates dependency
  loadCourts()
}, [callCount, loading]) // ❌ callCount is a dependency
```

### After (Fixed):
```tsx
const [callCount, setCallCount] = useState(0)

useEffect(() => {
  loadCourts()
}, []) // ✅ Empty dependency array - runs once on mount

const loadCourts = async () => {
  setCallCount(prev => prev + 1) // ✅ Update counter when function actually runs
  // ... rest of function
}
```

## Best Practices to Prevent This Issue

### 1. Be Careful with Dependencies
```tsx
// ❌ Don't do this
useEffect(() => {
  setSomeState(prev => prev + 1)
}, [someState])

// ✅ Do this instead
useEffect(() => {
  // Logic that should run once
}, [])
```

### 2. Use useCallback for Functions in Dependencies
```tsx
// ✅ Memoize functions used in useEffect
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependency1, dependency2])

useEffect(() => {
  fetchData()
}, [fetchData])
```

### 3. Consider useRef for Values That Don't Need Re-renders
```tsx
// ✅ Use useRef for counters that don't affect rendering
const callCountRef = useRef(0)

useEffect(() => {
  callCountRef.current += 1
  loadCourts()
}, [])
```

### 4. Split useEffect When Needed
```tsx
// ✅ Separate effects for different purposes
useEffect(() => {
  // Initialize on mount
  initialize()
}, [])

useEffect(() => {
  // React to prop changes
  handlePropChange()
}, [someProp])
```

### 5. Use ESLint Rules
Enable the React Hooks ESLint plugin to catch these issues:
```json
{
  "extends": ["plugin:react-hooks/recommended"]
}
```

## Debugging Tips

1. **Console Logs**: Add logs to identify which useEffect is causing loops
2. **React DevTools**: Use Profiler to see which components re-render
3. **Dependency Analysis**: Check if objects/functions in dependencies are created new each render
4. **State Updates**: Ensure state updates don't trigger the same useEffect

## Files Modified
- `/src/app/debug/page.tsx` - Fixed infinite loop in useEffect

## Verification
- ✅ All tests passing
- ✅ No TypeScript errors
- ✅ Build successful
- ✅ Console error should be resolved