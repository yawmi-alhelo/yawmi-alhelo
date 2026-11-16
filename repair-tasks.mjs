import fs from 'node:fs';

const file = 'src/stores/useTasks.ts';
if (!fs.existsSync(file)) process.exit(1);

let s = fs.readFileSync(file, 'utf8');
const original = s;

function replaceSection(startMarker, endMarker, replacement, label) {
  const start = s.indexOf(startMarker);
  const end = s.indexOf(endMarker, start + startMarker.length);

  if (start < 0 || end < 0 || end <= start) {
    throw new Error('تعذر تحديد الدالة: ' + label);
  }

  s = s.slice(0, start) + replacement + '\n' + s.slice(end);
  console.log('تم إصلاح: ' + label);
}

try {
  s = s.replace(
    'await saveBackupToCloud(s.syncUsername, s.syncPassword).catch(() => {});',
    `await saveBackupToCloud(s.syncUsername, s.syncPassword).catch(error => {
      console.error('[CloudSync] فشل حفظ النسخة السحابية:', error);
    });`
  );

  replaceSection(
    '  update: async (id, patch) => {',
    '  remove: async (id) => {',
`  update: async (id, patch) => {
    const prevTask = get().tasks.find(t => t.id === id);
    const wasCompleted = prevTask?.completed;

    const patchWithDate = { ...patch };
    if (patch.completed && !wasCompleted) {
      patchWithDate.completedAt = new Date().toISOString();
    }

    const updated = await TasksRepo.updateTask(id, patchWithDate);
    if (!updated) {
      await get().load();
      return;
    }

    await cancelTaskReminder(id);

    const settings = useSettings.getState().settings;
    if (!updated.completed && settings.soundsEnabled) {
      await scheduleTaskReminder(updated, settings.notificationSound);
    }

    if (updated.completed && !wasCompleted) {
      try {
        await useRewards.getState().complete();
      } catch (e) {
        console.error('[Rewards] فشل:', e);
      }
    }

    await get().load();
    void triggerCloudSave();
  },`,
    'تحديث المهمة والتذكير'
  );

  replaceSection(
    '  remove: async (id) => {',
    '  toggle: async (id) => {',
`  remove: async (id) => {
    await TasksRepo.deleteTask(id);
    await cancelTaskReminder(id);
    await get().load();
    void triggerCloudSave();
  },`,
    'حذف المهمة'
  );

  replaceSection(
    '  toggle: async (id) => {',
    '  defer: async (id, newDate) => {',
`  toggle: async (id) => {
    const prevTask = get().tasks.find(t => t.id === id);
    const updated = await TasksRepo.toggleTask(id);

    if (!updated) {
      await get().load();
      return;
    }

    if (updated.completed) {
      await cancelTaskReminder(id);

      if (!prevTask?.completed) {
        try {
          await useRewards.getState().complete();
          console.log('[Rewards] +10 نقطة، المجموع:', useRewards.getState().state.points);
        } catch (e) {
          console.error('[Rewards] فشل:', e);
        }

        const settings = useSettings.getState().settings;
        if (settings.groupId && settings.deviceId) {
          try {
            await updateMyActivity(settings.groupId, settings.deviceId);
          } catch (e) {
            console.warn('[activity] فشل:', e);
          }
        }
      }
    } else {
      const settings = useSettings.getState().settings;
      if (settings.soundsEnabled) {
        await scheduleTaskReminder(updated, settings.notificationSound);
      }
    }

    await get().load();
    void triggerCloudSave();
  },`,
    'تبديل حالة المهمة'
  );

  replaceSection(
    '  defer: async (id, newDate) => {',
    '\n}));',
`  defer: async (id, newDate) => {
    const t = get().tasks.find(x => x.id === id);
    if (!t) return;

    const updated = await TasksRepo.updateTask(id, {
      date: newDate,
      deferred: true,
      deferredFrom: t.deferredFrom ?? t.date
    });

    if (!updated) {
      await get().load();
      return;
    }

    await cancelTaskReminder(id);

    const settings = useSettings.getState().settings;
    if (settings.soundsEnabled) {
      await scheduleTaskReminder(updated, settings.notificationSound);
    }

    await get().load();
    void triggerCloudSave();
  },`,
    'تأجيل المهمة والحفاظ على تاريخها الأصلي'
  );

  if (s === original) {
    throw new Error('لم يحدث أي تغيير في الملف');
  }

  const backup = `${file}.before-repair-${Date.now()}.bak`;
  fs.copyFileSync(file, backup);
  fs.writeFileSync(file, s);

  console.log('\nاكتمل الإصلاح بنجاح.');
  console.log('النسخة الاحتياطية:', backup);
} catch (error) {
  console.error('\nتوقف الإصلاح دون تغيير الملف:', error.message);
  process.exit(1);
}
