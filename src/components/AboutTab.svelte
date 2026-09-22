<!--
  AboutTab: app metadata and links for the settings window.

  Props:
  - `version` (string): the app version, shown below the app name.
-->
<script lang="ts">
  import { t } from '../lib/i18n';

  let { version = '' } = $props<{ version?: string }>();
</script>

<section class="about" aria-label={t('settings.about')}>
  <div class="hero">
    <div class="app-icon" aria-hidden="true">
      <span></span>
    </div>
    <div class="identity">
      <h2>{t('app.title')}</h2>
      {#if version}
        <p>{t('settings.version')} {version}</p>
      {/if}
    </div>
  </div>

  <nav class="link-card" aria-label={t('settings.aboutLinks')}>
    <a data-url="" aria-disabled="true" aria-label={t('settings.releaseNotes')}>
      <span>{t('settings.releaseNotes')}</span>
      <span aria-hidden="true">↗</span>
    </a>
    <a data-url="" aria-disabled="true" aria-label={t('settings.sourceCode')}>
      <span>{t('settings.sourceCode')}</span>
      <span aria-hidden="true">↗</span>
    </a>
  </nav>

  <div class="footer">
    <section aria-labelledby="built-with-title">
      <h3 id="built-with-title">{t('settings.builtWith')}</h3>
      <p>{t('settings.builtWithText')}</p>
    </section>
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.75rem;
    height: 3.75rem;
    flex: 0 0 auto;
    border-radius: 50%;
    background: color-mix(in srgb, var(--cs-selected-bg, #7d9ad4) 22%, transparent);
  }

  .app-icon span {
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    border: 0.55rem solid var(--cs-accent, #ff5f57);
    box-sizing: border-box;
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

  .link-card a[aria-disabled='true'] {
    cursor: default;
  }

  .link-card a:not([aria-disabled='true']):hover {
    background: var(--cs-hover-bg, #282c3f);
  }

  .footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    font-size: 0.78rem;
    opacity: 0.62;
  }

  .footer h3,
  .footer p {
    margin: 0;
  }

  .footer h3 {
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }
</style>
