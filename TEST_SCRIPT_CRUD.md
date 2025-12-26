# 🎯 Quick Test Checklist for DirectorScriptSection

## What I've Added

I've added detailed console logging (with colored emoji markers) throughout the script management system to help diagnose exactly where the issue occurs. The logging traces the complete data flow:

1. **DirectorScriptSection.tsx** - Logs when user clicks add/edit/delete buttons
2. **ControlPanel.tsx** - Logs when state updates and sync to socket occurs
3. **useSocket.ts** - Already had logging for socket emissions

---

## 🧪 Test Sequence (5 minutes)

### Test 1: Can you add a script item?

```
1. Open http://localhost:3000/control
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Click "Thêm" button in left panel
5. DO YOU SEE "🔹 DirectorScriptSection: Adding new script item" message?
   - YES → Go to Test 2
   - NO → Button not firing, likely CSS/DOM issue
```

### Test 2: Does the edit form appear?

```
1. After clicking "Thêm", does an edit form appear below?
2. Does it have input fields:
   - Thí sinh (text input)
   - Giám khảo (dropdown)
   - Câu hỏi (textarea)
   - Ghi chú (text input)
3. Can you type in the fields?
   - YES → Go to Test 3
   - NO → Component rendering issue
```

### Test 3: Can you save an edit?

```
1. Fill in the form:
   - Thí sinh: "Test Student"
   - Giám khảo: (select one)
   - Câu hỏi: "Test question?"
2. Click ✓ (check button)
3. DO YOU SEE in Console:
   - "🔹 DirectorScriptSection: Saving edit at index: 0"
   - "🔵 ControlPanel: Script state changed"
   - Edit form disappears and shows as a card
   - YES → Go to Test 4
   - NO → saveEdit() not executing properly
```

### Test 4: Can you save to database?

```
1. Click 💾 "Lưu Kịch Bản" button
2. DO YOU SEE in Console:
   - "💾 ControlPanel: saveScript called"
   - "💾 ControlPanel: Sending payload to API"
3. DO YOU SEE green success message at top?
   - YES → Go to Test 5
   - NO → API call failing or token issue
```

### Test 5: Does display page show the question?

```
1. Open Display page: http://localhost:3000/display/guest (in new window)
2. In Control page, click Manual Spin mode
3. Select a judge override (or let it be random)
4. Click "Quay" button
5. When wheel stops, does winner modal show:
   - Winner name ✓
   - Contestant name ✓
   - Judge name ✓
   - Question (Câu hỏi) ✓
   - YES → Everything works!
   - NO → Question not syncing through socket
```

---

## 📱 Console Message Legend

| Marker | Component | Meaning |
|--------|-----------|---------|
| 🔹 | DirectorScriptSection | Add/Edit/Delete button handlers |
| 🔵 | ControlPanel | State changes and sync |
| 💾 | SaveScript function | Database operations |
| 📜 | Socket.emit | Real-time sync messages |
| 🎰 | Display page | Receiving updates |

---

## 🔴 If Test Fails At Any Point

### Failed Test 1 (Add button not working)
- Check if DirectorScriptSection component is visible
- Verify judges list has at least 1 judge
- Refresh page (Ctrl+F5)
- Check for JavaScript errors in console

### Failed Test 2 (Edit form not appearing)
- Check if `editingIndex` state is updating
- Verify CSS not hiding the form
- Inspect element to see if form exists in DOM

### Failed Test 3 (Save edit not working)
- Verify all form fields are filled
- Check if `onScriptChange` callback is being called
- Ensure parent component receives the update

### Failed Test 4 (Database save failing)
- Check Network tab for API request
- Look for 401 (token expired) or 500 (server error)
- Verify campaign ID is correct

### Failed Test 5 (Question not showing)
- Check if script synced to socket correctly
- Verify `question_content` field has value
- Check Display page console for sync messages

---

## 💡 What To Tell Me

After running these tests, please tell me:

1. **Which test number fails?** (1, 2, 3, 4, or 5)
2. **What console messages do you see?** (copy-paste them)
3. **What console messages are MISSING?** (which emoji markers don't appear)
4. **Any error messages?** (red text in console)
5. **Network errors?** (check Network tab for failed requests)

With this information, I can pinpoint the exact issue and fix it!

---

## 🚀 Expected Console Output (Full Success)

Here's what you SHOULD see when everything works:

```
🔹 DirectorScriptSection: Adding new script item
🔹 DirectorScriptSection: New item: {step: 1, contestant: '', target_judge_id: '...', question_content: '', notes: ''}
🔹 DirectorScriptSection: New script array length: 1
🔵 ControlPanel: Script state changed, length: 1
🔵 ControlPanel: Script data: [{...}]
🔵 ControlPanel: Syncing script to socket via updateScript
📜 Control: Update script

[User fills form and clicks save]

🔹 DirectorScriptSection: Saving edit at index: 0
🔹 DirectorScriptSection: Edited item: {step: 1, contestant: 'Test', ...}
🔹 DirectorScriptSection: Updated script: [{step: 1, contestant: 'Test', ...}]
🔵 ControlPanel: Script state changed, length: 1
🔵 ControlPanel: Script data: [{step: 1, contestant: 'Test', ...}]
📜 Control: Update script

[User clicks save button]

💾 ControlPanel: saveScript called
💾 ControlPanel: Current script: [{step: 1, contestant: 'Test', ...}]
💾 ControlPanel: Sending payload to API: {director_script: [...]}
💾 ControlPanel: API response: {success: true, campaign: {...}}
💾 ControlPanel: Script saved successfully
```

---

**Start with Test 1 and report back with the results!** 🎯
