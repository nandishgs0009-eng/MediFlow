# Testing Role-Based Access Control

## Prerequisites
- Server running on `http://localhost:5000`
- Admin account: `gsnandish@gmail.com` / `Gsnandish`
- Patient account: Create one or use existing test account

---

## Test Scenarios

### Scenario 1: Admin Cannot Access Patient Routes
**Steps:**
1. Login with admin credentials:
   - Email: `gsnandish@gmail.com`
   - Password: `Gsnandish`
2. Manually type in browser: `http://localhost:5000/patient/dashboard`
3. Press Enter

**Expected Result:**
- ✅ Immediately redirects to `/admin/dashboard`
- ✅ Admin dashboard is displayed
- ✅ Patient menu items are NOT visible in sidebar

**Verification:**
- Check browser console for any 401/403 errors (should have none)
- Check Network tab for GET /api/treatments (should not be called)

---

### Scenario 2: Patient Cannot Access Admin Routes
**Steps:**
1. Create a patient account or login with existing patient
2. After login, manually type: `http://localhost:5000/admin/dashboard`
3. Press Enter

**Expected Result:**
- ✅ Immediately redirects to `/patient/overview`
- ✅ Patient dashboard is displayed
- ✅ Admin menu items are NOT visible in sidebar

**Verification:**
- Check browser console for 403 errors (should have none if frontend protection works)
- Check Network tab for GET /api/admin/stats (should not be called)

---

### Scenario 3: API Security - Unauthorized Admin Call
**Steps:**
1. Login as a patient
2. Open Browser DevTools (F12) → Console tab
3. Paste and run:
```javascript
fetch('/api/admin/stats', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log(d))
```
4. Press Enter

**Expected Result:**
- ✅ Response: `{"error": "Forbidden"}`
- ✅ Status: 403
- ✅ No admin stats are returned

**Verification:**
- Backend logs should show: `GET /api/admin/stats 403`

---

### Scenario 4: Patient Cannot Call Admin APIs
**Steps:**
1. Login as patient
2. Open Browser DevTools → Console
3. Try to access detailed patient list:
```javascript
fetch('/api/admin/patients/detailed/all', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected Result:**
- ✅ Response: `{"error": "Forbidden"}`
- ✅ Status: 403

---

### Scenario 5: Session Hijacking Prevention
**Steps:**
1. Open Two Browser Windows Side-by-Side:
   - Window A: Login as Admin
   - Window B: Login as Patient (different browser or private window)
2. In Window A, manually type: `/patient/recovery-reports`
3. In Window B, manually type: `/admin/patients`

**Expected Result:**
- Window A: Redirects to `/admin/dashboard` ✅
- Window B: Redirects to `/patient/overview` ✅
- Each maintains their own authenticated session

---

## Checklist

- [ ] Admin cannot access any `/patient/*` routes
- [ ] Patient cannot access any `/admin/*` routes
- [ ] Browser automatically redirects to appropriate dashboard
- [ ] Sidebar shows only role-appropriate menu items
- [ ] Admin API endpoints return 403 to patients
- [ ] Patient API endpoints work fine for authenticated patients
- [ ] No console errors or warnings about unauthorized access
- [ ] Login/Logout works smoothly
- [ ] Session persists correctly across page reloads
- [ ] Multiple tabs maintain consistent role authorization

---

## Debugging Tips

**If Redirect Isn't Working:**
1. Check browser console (F12 → Console)
2. Look for errors related to navigation
3. Check if `/api/auth/me` is returning correct role
4. Clear browser cache and retry

**If Still Seeing Unauthorized Content:**
1. Open DevTools → Network tab
2. Check all API calls - should see 403 for unauthorized routes
3. Check if ProtectedRoute component is rendering
4. Verify role value in console: `console.log(document.location)`

**Check User Role:**
```javascript
// In browser console
fetch('/api/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(u => console.log('Role:', u.role))
```

---

## Success Criteria

✅ All tests pass
✅ No 401/403 errors in browser console (expected 403 only from API test)
✅ Admin cannot see or access patient features
✅ Patient cannot see or access admin features
✅ All redirects are instant (no lag)
✅ Each role can only call their authorized APIs
