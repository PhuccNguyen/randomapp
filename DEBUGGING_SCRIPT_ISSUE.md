# 🔧 Debugging DirectorScriptSection CRUD Issue

I've added comprehensive console logging throughout the script management system. Follow these steps to identify the problem:

## 📋 Step-by-Step Debugging Process

### Phase 1: Test Add Button

1. **Open DevTools Console** (F12 → Console tab)
2. **Click "Thêm" button** in DirectorScriptSection (left panel)
3. **Look for these console messages in order:**

```
🔹 DirectorScriptSection: Adding new script item
🔹 DirectorScriptSection: New item: { step: 1, contestant: '', ... }
🔹 DirectorScriptSection: New script array length: 1
🔵 ControlPanel: Script state changed, length: 1
🔵 ControlPanel: Script data: [{ step: 1, ... }]
🔵 ControlPanel: Syncing script to socket via updateScript
📜 Control: Update script
```

**Expected Behavior:**
- Edit form should appear below "Thêm" button
- Fields: Thí sinh, Giám khảo, Câu hỏi should be editable
- Input fields should be empty (ready for user input)

**If NOT working:**
- ❌ No messages → Button not firing handler
- ❌ Only first message → state.script not updating
- ❌ No "ControlPanel" message → onScriptChange callback not working

---

### Phase 2: Test Edit Button

1. **Add a script item first** (complete Phase 1)
2. **Fill in the edit form:**
   - Thí sinh: "Nguyễn Văn A"
   - Giám khảo: Select one from dropdown
   - Câu hỏi: "Test question?"
3. **Click ✓ (Check) button to save**
4. **Look for these messages:**

```
🔹 DirectorScriptSection: Saving edit at index: 0
🔹 DirectorScriptSection: Edited item: { step: 1, contestant: 'Nguyễn Văn A', ... }
🔹 DirectorScriptSection: Updated script: [{ step: 1, contestant: 'Nguyễn Văn A', ... }]
🔵 ControlPanel: Script state changed, length: 1
🔵 ControlPanel: Script data: [{ step: 1, contestant: 'Nguyễn Văn A', ... }]
📜 Control: Update script
```

**Expected Behavior:**
- Edit form disappears
- Item shows as a card with filled information
- ✓ badge appears if it's the current step
- Edit/Delete buttons visible on the card

**If NOT working:**
- ❌ Only first message → onScriptChange not called
- ❌ No state update messages → callback missing

---

### Phase 3: Test Persistence (Save to Database)

1. **Complete at least one script item edit** (Phase 2)
2. **Click 💾 Lưu Kịch Bản button** at bottom of left panel
3. **Look for these messages:**

```
💾 ControlPanel: saveScript called
💾 ControlPanel: Current script: [{ step: 1, contestant: 'Nguyễn Văn A', ... }]
💾 ControlPanel: Sending payload to API: { director_script: [...] }
💾 ControlPanel: API response: { success: true, campaign: {...} }
💾 ControlPanel: Script saved successfully
```

**You should also see:**
- ✅ Green success message: "✅ Lưu kịch bản thành công!"
- Message should disappear after 3 seconds

**If NOT working:**
- ❌ No messages → Button click not detected
- ❌ API response shows error → Check network tab for response
- ❌ 401/403 error → Token missing/invalid

---

### Phase 4: Test Delete Button

1. **Have at least 2 script items**
2. **Click 🗑️ (trash icon) on second item**
3. **Confirm deletion**
4. **Look for:**

```
🔹 DirectorScriptSection: Deleting item at index: 1
🔹 DirectorScriptSection: Updated script after delete: [{ step: 1, ... }]
🔵 ControlPanel: Script state changed, length: 1
```

**Expected Behavior:**
- Item disappears from list
- Remaining items are renumbered (step 1, step 2 → step 1)
- Item count updates in header "Kịch Bản Đạo Diễn (1 bước)"

---

### Phase 5: Verify Socket Sync

1. **Add/Edit a script item** (from Phase 1-2)
2. **Open two browser windows:**
   - Window A: Control Panel (port 3000/control)
   - Window B: Display Page (port 3000/display/guest)
3. **Check Console in Window A for:**

```
📜 Control: Update script
```

4. **Check Console in Window B for:**

```
🎰 Display: Received state update
🎰 Display: Script received: [...]
```

**Expected Behavior:**
- Changes in Control Panel immediately sync to Display Page
- Script questions appear in winner modal when wheel stops

---

## 🔍 Common Issues & Solutions

### Issue 1: "Thêm" button doesn't add item

**Symptoms:** No console messages, form doesn't appear

**Check:**
```js
// In Console, verify DirectorScriptSection is receiving props:
// Look for this message at component mount:
// "🔹 DirectorScriptSection: Adding new script item"
```

**Solution:**
- Refresh page (F5)
- Check if judges list is populated (should have at least 1 judge)
- Verify component is not hidden by CSS

---

### Issue 2: Edit form doesn't save

**Symptoms:** Form appears but ✓ button doesn't work, or changes lost

**Check:**
1. Click edit button → should see "Saving edit at index: X"
2. Fill form and click ✓
3. Check if message "Updated script" appears

**Solution:**
- Verify `saveEdit()` is calling `onScriptChange(newScript)`
- Ensure `setEditingIndex(null)` is resetting state

---

### Issue 3: Script not saving to database

**Symptoms:** 💾 button exists but doesn't save, no success message

**Check:**
1. Click 💾 button
2. Open DevTools Network tab
3. Look for PUT request to `/api/campaigns/[campaignId]`
4. Check response status (should be 200)

**Solution:**
- If 401: Token expired, login again
- If 400/422: Check payload format in console
- If 500: Check server error logs

---

### Issue 4: Display page doesn't show questions

**Symptoms:** Winner modal shows name/image but not question

**Check:**
1. When wheel stops, check Console in Display page:
   ```
   🎰 Display: Script received: [...]
   ```
2. Verify question_content field has value
3. Check if `winner.question` is rendered

**Solution:**
- Field name is `question_content` in data but may need mapping to `question`
- Verify socket receives scriptInfo from control panel
- Check CSS in `page.module.css` if question div is hidden

---

## 🛠️ Quick Debug Commands

Run these in Browser Console to check state:

```js
// Check if script is in DOM
document.querySelector('[class*="scriptList"]')

// Check window dimensions (for modal visibility)
window.innerWidth, window.innerHeight

// Force refresh display
window.location.reload()

// Check localStorage for campaign ID
localStorage.getItem('currentCampaignId')
```

---

## 📊 Data Flow Diagram

```
User clicks "Thêm"
    ↓
DirectorScriptSection.addScriptItem()
    ↓ calls
onScriptChange([...script, newItem])
    ↓ (which is setScript in ControlPanel)
ControlPanel state updates
    ↓ triggers
useEffect hook
    ↓ calls
updateScript(script)
    ↓ emits
socket.emit('control:update-script')
    ↓ syncs to
backend socket handler
    ↓ broadcasts to
Display page via state:update
    ↓ shows
winner modal with question
```

---

## 📝 Next Steps

1. **Test Phase 1** (Add button) and note which step fails
2. **Report console messages** showing where it breaks
3. **Check Network tab** if API calls are made
4. **Verify judges list** is populated in ControlPanel

Once you complete these steps, we can pinpoint the exact issue!

---

**Console Output Format:**
- 🔹 = DirectorScriptSection logs
- 🔵 = ControlPanel logs
- 💾 = SaveScript logs
- 📜 = Socket logs
- 🎰 = Display page logs
