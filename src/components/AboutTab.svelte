<!--
  AboutTab: app metadata and links for the settings window.

  Props:
  - `version` (string): the app version, shown below the app name.
-->
<script lang="ts">
  import { invoke } from '@tauri-apps/api/core';
  import { t } from '../lib/i18n';

  const releaseNotesUrl = 'https://github.com/ronenrozner/cheat-sheet-app/releases';
  const sourceCodeUrl = 'https://github.com/ronenrozner/cheat-sheet-app';
  const iconCreditUrl = 'https://www.flaticon.com/free-icons/parchment';

  let { version = '' } = $props<{ version?: string }>();

  function openExternal(event: MouseEvent, url: string): void {
    event.preventDefault();
    void invoke('open_external_url', { url }).catch((error) => {
      console.error('failed to open external URL', error);
    });
  }
</script>

<section class="about" aria-label={t('settings.about')}>
  <div class="hero">
    <img class="app-icon" src="/app-icon.png" width="60" height="60" alt="" aria-hidden="true" />
    <div class="identity">
      <h2>{t('app.title')}</h2>
      {#if version}
        <p>{t('settings.version')} {version}</p>
      {/if}
    </div>
  </div>

  <nav class="link-card" aria-label={t('settings.aboutLinks')}>
    <a
      href={releaseNotesUrl}
      data-url={releaseNotesUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={t('settings.releaseNotes')}
      onclick={(event) => openExternal(event, releaseNotesUrl)}
    >
      <span>{t('settings.releaseNotes')}</span>
      <span aria-hidden="true">↗</span>
    </a>
    <a
      href={sourceCodeUrl}
      data-url={sourceCodeUrl}
      target="_blank"
      rel="noreferrer"
      aria-label={t('settings.sourceCode')}
      onclick={(event) => openExternal(event, sourceCodeUrl)}
    >
      <span>{t('settings.sourceCode')}</span>
      <span aria-hidden="true">↗</span>
    </a>
  </nav>

  <div class="footer">
    <a
      href={iconCreditUrl}
      target="_blank"
      rel="noreferrer"
      onclick={(event) => openExternal(event, iconCreditUrl)}
    >
      {t('settings.parchmentIconCredit')}
    </a>
    <p>{t('settings.builtWithText')}</p>
    <p>{t('settings.licenseAndCopyright')}</p>
  </div>
</section>

<style>
  .about {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    gap: 1.5rem;
    padding: 0.9rem 1rem;
  }

  .hero {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .app-icon {
    flex: 0 0 auto;
    box-sizing: border-box;
    width: 3.75rem;
    height: 3.75rem;
    padding: 0.35rem;
    border-radius: 50%;
    overflow: hidden;
    background: color-mix(in srgb, var(--cs-selected-bg, #7d9ad4) 22%, transparent);
    object-fit: contain;
  }

  .identity {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .identity h2 {
    margin: 0;
    color: var(--cs-accent, #7d9ad4);
    font-size: 1.35rem;
    font-weight: 600;
  }

  .identity p {
    margin: 0;
    font-size: 0.85rem;
    opacity: 0.78;
  }

  .link-card {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--cs-border, #44475a);
    border-radius: 6px;
  }

  .link-card a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.8rem 1rem;
    color: var(--cs-fg, #cdd6f4);
    text-decoration: none;
  }

  .link-card a + a {
    border-top: 1px solid var(--cs-border, #44475a);
  }

  .link-card a:hover {
    background: var(--cs-hover-bg, #282c3f);
  }

  .footer {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 0.78rem;
    opacity: 0.62;
  }

  .footer p,
  .footer a {
    margin: 0;
  }

  .footer a {
    color: inherit;
  }
</style>
