# 🎯 DirectorScript Debugging Checklist

## ✨ What's Been Done

### Console Logging Added ✅
- [x] DirectorScriptSection.tsx - addScriptItem()
- [x] DirectorScriptSection.tsx - startEditing()
- [x] DirectorScriptSection.tsx - saveEdit()
- [x] DirectorScriptSection.tsx - deleteScriptItem()
- [x] ControlPanel.tsx - useEffect hook
- [x] ControlPanel.tsx - saveScript()
- [x] app/display/guest/page.tsx - socket handler
- [x] app/display/guest/page.tsx - handleSpinComplete()

### Documentation Created ✅
- [x] TEST_SCRIPT_CRUD.md (5 quick tests)
- [x] DEBUGGING_SCRIPT_ISSUE.md (detailed guide)
- [x] DEBUGGING_SUMMARY.md (overview)
- [x] SCRIPT_DATA_FLOW.md (diagrams)
- [x] README_DEBUGGING.md (start here)
- [x] THIS FILE (checklist)

### Code Analysis Done ✅
- [x] Verified DirectorScriptSection receives props correctly
- [x] Verified onScriptChange callback is connected
- [x] Verified ControlPanel.setScript is updating state
- [x] Verified useEffect hook has correct dependencies
- [x] Verified socket.emit calls are correct
- [x] Verified backend handlers exist and store script
- [x] Verified field names match (question_content → question)
- [x] Verified display page receives scriptInfo correctly

---

## 🧪 Tests You Should Run

### Test 1: Add Button (🔹)
```
Expected: 🔹 DirectorScriptSection: Adding new script item
Status: [  ] PASS  [  ] FAIL
Notes: _________________________________
```

### Test 2: Edit Form (🔹)
```
Expected: 🔹 DirectorScriptSection: Saving edit at index: 0
Status: [  ] PASS  [  ] FAIL
Notes: _________________________________
```

### Test 3: Database Save (💾)
```
Expected: 💾 ControlPanel: Script saved successfully
Status: [  ] PASS  [  ] FAIL
Notes: _________________________________
```

### Test 4: Socket Sync (📜🎰)
```
Expected: 📜 Control: Update script
          🎰 Display: Received scriptInfo
Status: [  ] PASS  [  ] FAIL
Notes: _________________________________
```

### Test 5: Display Question (❓)
```
Expected: Question appears in winner modal
Status: [  ] PASS  [  ] FAIL
Notes: _________________________________
```

---

## 📊 Issues & Solutions

### Issue: Button doesn't fire (No 🔹)

**Checklist:**
- [ ] Is page fully loaded? (try Ctrl+F5 refresh)
- [ ] Is judges list populated? (check if dropdown shows judges)
- [ ] Is DirectorScriptSection visible? (not hidden off-screen)
- [ ] Any red errors in console? (screenshot them)
- [ ] Try clicking button again? (sometimes React needs time)

**If still broken:**
- [ ] Check browser dev tools > Elements tab > search "DirectorScriptSection"
- [ ] Verify button has correct onClick handler
- [ ] Check if component is wrapped in correct React context

---

### Issue: State not updating (No 🔵)

**Checklist:**
- [ ] Did 🔹 message appear? (button must fire first)
- [ ] Check if onScriptChange is being called
- [ ] Verify ControlPanel receives script prop
- [ ] Check if setScript is defined in ControlPanel
- [ ] Look for any TypeScript errors in console

**If still broken:**
- [ ] Add manual log in ControlPanel.tsx: `console.log('Script prop:', script);`
- [ ] Verify parent component is passing correct props
- [ ] Check if state hook is correctly initialized

---

### Issue: Database not saving (No 💾)

**Checklist:**
- [ ] Did 🔵 message appear? (state must update first)
- [ ] Check Network tab > XHR > find PUT request
- [ ] Verify request status: 200 (success) or 401/500 (error)
- [ ] Check request headers: Authorization header present?
- [ ] Check request body: director_script array included?

**If 401 error:**
- [ ] Token expired - login again
- [ ] Run: `localStorage.getItem('token')` in console

**If 500 error:**
- [ ] Check server terminal for error messages
- [ ] Verify campaign ID is valid
- [ ] Check if MongoDB connection is working

**If network error (no request sent):**
- [ ] Verify saveScript() is being called
- [ ] Check if fetch API is working
- [ ] Look for JavaScript errors blocking the call

---

### Issue: Question not displaying (No ❓)

**Checklist:**
- [ ] Did you fill question field before spinning? (must have value)
- [ ] Check Network tab: is scriptInfo sent in payload?
- [ ] Check Display page console: 🎰 message appearing?
- [ ] Verify question_content field in DirectorScript has value
- [ ] Check if Display page is on same campaign as Control

**If scriptInfo not sent:**
- [ ] Verify script array has items in state
- [ ] Check if currentStep is valid index
- [ ] Verify script[currentStep] exists and has question_content

**If scriptInfo not received:**
- [ ] Refresh Display page
- [ ] Check socket connection (should show connection message)
- [ ] Verify both pages on same campaign ID

**If scriptInfo received but question not displayed:**
- [ ] Check CSS - is winnerQuestion div hidden?
- [ ] Check if question field is null/empty in winner object
- [ ] Verify field name is 'question' not 'question_content'

---

## 🔧 Quick Debug Commands

Run these in browser console:

```js
// Check if script state has data
// (watch console when you interact with buttons)

// Check components exist
document.querySelector('[class*="scriptList"]')     // Should exist
document.querySelector('[class*="addButton"]')      // Should exist
document.querySelector('[class*="saveButton"]')     // Should exist

// Check token validity
localStorage.getItem('token')                       // Should have value

// Check socket connection
typeof io                                          // Should be 'function'

// Check campaign ID
new URL(window.location).pathname                  // Should contain campaign ID
```

---

## 📝 Progress Tracking

### Week 1: Debugging Phase
- [ ] Run Test 1 (Add button)
- [ ] Run Test 2 (Edit form)
- [ ] Run Test 3 (Database save)
- [ ] Run Test 4 (Socket sync)
- [ ] Run Test 5 (Display question)

### Week 2: Fix Phase
- [ ] Fix any failing tests
- [ ] Remove console.log statements (or keep as debug)
- [ ] Verify all tests pass
- [ ] Test edge cases (empty fields, delete, etc.)

### Week 3: Polish Phase
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Test with real data
- [ ] Performance optimization

---

## 📞 Support Template

When reporting issues, use this format:

```
ISSUE: [Brief description]
TEST FAILING: [1/2/3/4/5]
CONSOLE SHOWS:
- [Paste 🔹 messages]
- [Paste 🔵 messages]
- [Paste 💾 messages]
- [Paste any red errors]

NETWORK TAB:
- Status: [200/401/500/etc]
- Request size: [bytes]
- Response: [error message if any]

ACTION TAKEN:
- [What did you try?]
- [What worked?]
- [What didn't?]

NEXT STEP:
- [What should I test?]
```

---

## ✅ Success Criteria

All tests complete when:

✅ Test 1: 🔹 message appears when clicking "Thêm"  
✅ Test 2: 🔹 message appears when clicking ✓ after edit  
✅ Test 3: 💾 message appears + green success message  
✅ Test 4: 📜🎰 messages appear in both consoles  
✅ Test 5: Question displays in modal without field names cut off  

**All 5 tests passing = Feature complete!** 🎉

---

## 🚀 Final Checklist

Before we consider this complete:

- [ ] Add button creates new script item
- [ ] Edit button allows field modification
- [ ] Delete button removes items (with confirmation)
- [ ] Save button persists to database
- [ ] Socket syncs script to display page
- [ ] Winner modal shows question field
- [ ] Auto-generation creates test data
- [ ] Import/Export works for backup
- [ ] All edge cases handled (empty values, etc.)
- [ ] No console errors when using features

---

## 📚 Documentation Map

```
Start here ─────→ README_DEBUGGING.md
                       ↓
            Quick tests? → TEST_SCRIPT_CRUD.md
                       ↓
            Detailed help? → DEBUGGING_SCRIPT_ISSUE.md
                       ↓
            Understand flow? → SCRIPT_DATA_FLOW.md
                       ↓
            Full overview? → DEBUGGING_SUMMARY.md
                       ↓
            Tracking progress? → THIS FILE (CHECKLIST.md)
```

---

**Status: 🟢 READY FOR TESTING**  
**Files Created: 6 documentation + 3 code changes**  
**Expected Duration: 15-30 minutes to debug**  
**Support Available: Yes - full debug logs added**

**Next Action: Open TEST_SCRIPT_CRUD.md and start Test 1!** 🎯
