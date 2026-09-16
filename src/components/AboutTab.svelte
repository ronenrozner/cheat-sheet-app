<!--
  AboutTab: placeholder for future about content (Task 19).

  Props:
  - `version` (string): the app version, shown in the about section.
-->
<script lang="ts">
  import { t } from '../lib/i18n';

  let { version = '' } = $props<{ version?: string }>();
</script>

<div class="about">
  <h2 class="about-title">{t('settings.about')}</h2>
  {#if version}
    <p class="about-version">{t('settings.version')} {version}</p>
  {/if}
  <p class="about-note">{t('settings.aboutNote')}</p>
</div>

<style>
  .about {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .about-title {
    font-size: 1rem;
    margin: 0;
  }
  .about-version {
    font-size: 0.85rem;
    opacity: 0.8;
    margin: 0;
  }
  .about-note {
    font-size: 0.85rem;
    opacity: 0.7;
    margin: 0;
  }
</style>
