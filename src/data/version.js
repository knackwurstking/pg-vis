import { html } from "ui";

export const version = "v1.0.0";

/**
 * A new Build will trigger a Dialog
 */
export const build = 8;

export const info = html`
  <ui-container
    class="no-scrollbar info-dialog"
    style="height: 100%; overflow: hidden; overflow-y: auto;"
  >
    <h2 id="v1-0-0-2024-08-12">v1.0.0 — 2024-08-12</h2>
    <ul>
      <li>
        <a href="https://github.com/knackwurstking/ui">ui version v0.2.16</a>
      </li>
    </ul>
    <p><strong>General</strong>:</p>
    <ul>
      <li>
        Removed &quot;date&quot; from types <code>AlertList</code>,
        <code>MetalSheetList</code>, <code>VisList</code> and
        <code>VisData</code>
      </li>
      <li>Improved error handling</li>
      <li>Added validation for <code>VisData</code> files</li>
      <li>
        Changed <code>&lt;ul&gt;</code> click handling for
        &quot;alert-lists&quot;
      </li>
      <li>
        Changed <code>&lt;ul&gt;</code> click handling for &quot;vis&quot;
      </li>
      <li>
        Changed <code>&lt;ul&gt;</code> click handling for &quot;vis-lists&quot;
      </li>
      <li>
        Changed <code>&lt;ul&gt;</code> click handling for &quot;vis-data&quot;
      </li>
      <li>Added some German translations</li>
      <li>Enabled edit icon for vis-data (rename lists)</li>
      <li>Added the vis product page to vis-data</li>
      <li>Added gist handler for the vis-data group (drawer)</li>
      <li>Checking for build numbers after each app start</li>
      <li>Added some preview for active vis-data &quot;filters&quot;</li>
      <li>Added sorting for vis-data (drawer and page)</li>
      <li>Changed vis filenames (download)</li>
      <li>Added drag and drop for vis-lists</li>
      <li>Code clean up</li>
    </ul>
    <p><strong>Fixes</strong>:</p>
    <ul>
      <li>Fixed bookmarks dialog sorting</li>
      <li>Fixed error handling</li>
      <li>
        Fixed <code>VisDataEntryPage</code> submit, original entries will now be
        removed
      </li>
      <li>Fixed product page rendering</li>
      <li>Fixed drag and drop for metal-sheets</li>
    </ul>
  </ui-container>
`;
