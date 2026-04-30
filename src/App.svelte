<script lang="ts">
  import { OPFSStorage } from './lib/services/storage.js';
  import { NotesStore } from './lib/stores/notes.svelte.js';
  import { SyncStore } from './lib/stores/sync.svelte.js';
  import { SettingsStore } from './lib/stores/settings.svelte.js';
  import AppShell from './components/layout/AppShell.svelte';
  import Sidebar from './components/layout/Sidebar.svelte';
  import DetailPanel from './components/layout/DetailPanel.svelte';
  import NoteEditor from './components/notes/NoteEditor.svelte';
  import LockedNote from './components/notes/LockedNote.svelte';
  import EmptyState from './components/notes/EmptyState.svelte';
  import SettingsSheet from './components/settings/SettingsSheet.svelte';
  import RenameDialog from './components/dialogs/RenameDialog.svelte';
  import DeleteConfirm from './components/dialogs/DeleteConfirm.svelte';
  import PasswordPrompt from './components/dialogs/PasswordPrompt.svelte';
  import SetPasswordDialog from './components/dialogs/SetPasswordDialog.svelte';
  import { t } from './lib/i18n/index.svelte.js';

  // --- Core instances ---
  const storage = new OPFSStorage();
  const notesStore = new NotesStore();
  const syncStore = new SyncStore();
  const settingsStore = new SettingsStore();

  // --- Responsive state ---
  let isMobile = $state(window.matchMedia('(max-width: 767px)').matches);
  const mql = window.matchMedia('(max-width: 767px)');
  mql.addEventListener('change', (e) => { isMobile = e.matches; });

  // --- UI state ---
  let ready = $state(false);
  let settingsOpen = $state(false);
  let renameOpen = $state(false);
  let deleteOpen = $state(false);
  let setPasswordOpen = $state(false);
  let changePasswordOpen = $state(false);

  // --- Derived ---
  let showDetail = $derived(notesStore.selectedNoteId != null);
  let noteIsLocked = $derived(
    notesStore.loadedNote?.isEncrypted === true && notesStore.decryptedContent == null
  );

  // --- Init ---
  async function init() {
    await storage.init();
    await settingsStore.init(storage);
    syncStore.afterSync = () => notesStore.reloadIndex();
    await notesStore.init(storage, () => {
      syncStore.scheduleSync(storage, notesStore.selectedNoteId);
    });

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      // Always clean the OAuth code from URL to prevent retry loops on failure
      window.history.replaceState({}, '', window.location.pathname);
      try {
        await syncStore.handleOAuthCallback(code);
        await syncStore.sync(storage, notesStore.selectedNoteId);
      } catch (err) {
        console.error('OAuth callback failed:', err);
      }
    } else if (syncStore.isConnected) {
      // Auto-sync on app load
      syncStore.sync(storage, notesStore.selectedNoteId);
    }

    ready = true;
  }

  init();

  // --- Visibility change: flush saves & sync ---
  function handleVisibilityChange() {
    if (document.hidden) {
      notesStore.flushPendingSave();
    } else if (syncStore.isConnected) {
      syncStore.sync(storage, notesStore.selectedNoteId);
    }
  }

  // --- Handlers ---
  async function handleCreateNote() {
    await notesStore.createNewNote();
  }

  async function handleSelectNote(id: string) {
    await notesStore.selectNote(id);
  }

  function handleBack() {
    notesStore.flushPendingSave();
    notesStore.selectNote(null);
  }

  async function handleRename(title: string) {
    await notesStore.renameNote(title);
  }

  async function handleDelete() {
    await notesStore.deleteNote();
  }

  async function handleSetPassword(password: string) {
    await notesStore.setPassword(password);
  }

  async function handleChangePassword(currentPwd: string, newPwd: string): Promise<boolean> {
    return await notesStore.changePassword(currentPwd, newPwd);
  }

  async function handleRemovePassword() {
    await notesStore.removePassword();
  }
</script>

<svelte:document onvisibilitychange={handleVisibilityChange} />

{#if !ready}
  <div class="flex h-full items-center justify-center bg-ios-bg-secondary dark:bg-ios-bg-grouped-dark">
    <div class="h-8 w-8 animate-spin rounded-full border-2 border-ios-gray3 border-t-ios-blue"></div>
  </div>
{:else}
  <AppShell {isMobile} {showDetail}>
    {#snippet sidebar()}
      <Sidebar
        store={notesStore}
        onCreateNote={handleCreateNote}
        onSelectNote={handleSelectNote}
        onOpenSettings={() => settingsOpen = true}
      />
    {/snippet}

    {#snippet detail()}
      <DetailPanel>
        {#if !notesStore.loadedNote}
          <EmptyState />
        {:else if noteIsLocked}
          <LockedNote store={notesStore} {isMobile} onback={handleBack} />
        {:else}
          <NoteEditor
            store={notesStore}
            {isMobile}
            onback={handleBack}
            onRename={() => renameOpen = true}
            onDelete={() => deleteOpen = true}
            onSetPassword={() => setPasswordOpen = true}
            onChangePassword={() => changePasswordOpen = true}
            onRemovePassword={handleRemovePassword}
          />
        {/if}
      </DetailPanel>
    {/snippet}
  </AppShell>

  <!-- Dialogs -->
  <SettingsSheet
    open={settingsOpen}
    onclose={() => settingsOpen = false}
    {settingsStore}
    {syncStore}
    {storage}
    activeNoteId={notesStore.selectedNoteId}
  />

  <RenameDialog
    open={renameOpen}
    currentTitle={notesStore.loadedNote?.title ?? ''}
    onclose={() => renameOpen = false}
    onrename={handleRename}
  />

  <DeleteConfirm
    open={deleteOpen}
    onclose={() => deleteOpen = false}
    onconfirm={handleDelete}
  />

  <PasswordPrompt
    open={setPasswordOpen}
    title={t('setPassword')}
    onclose={() => setPasswordOpen = false}
    onsubmit={handleSetPassword}
    showConfirm={true}
  />

  <SetPasswordDialog
    open={changePasswordOpen}
    onclose={() => changePasswordOpen = false}
    onsubmit={handleChangePassword}
  />
{/if}
