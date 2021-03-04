import { html, css, internalProperty, query } from 'lit-element';
import { Router } from '@vaadin/router';
import { EveesHttp } from '@uprtcl/evees-http';
import { styles, UprtclTextField } from '@uprtcl/common-ui';
import { Logger, SearchResult } from '@uprtcl/evees';

import { ConnectedElement } from '../services/connected.element';
import { GettingStarted } from '../constants/routeNames';

import { sharedStyles } from '../styles';

interface SectionData {
  id: string;
  title: string;
  draggingOver: boolean;
}

export class DevelopElement extends ConnectedElement {
  logger = new Logger('Develop');

  @internalProperty()
  loading = true;

  @internalProperty()
  isLogged = false;

  @internalProperty()
  searchResults: string[] = [];

  @internalProperty()
  blogFeedIds: string[] = [];

  @internalProperty()
  userBlogId: string;

  @query('#user-id-input')
  userIdElement: UprtclTextField;

  @query('#levels')
  levels: any;

  remote: EveesHttp;

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  async firstUpdated() {
    this.remote = this.evees.getRemote() as EveesHttp;
    this.isLogged = await this.remote.isLogged();

    if (this.isLogged) {
      await this.appManager.checkStructure();
      this.render();
    } else {
      Router.go(GettingStarted);
    }

    this.loading = false;
  }

  async login() {
    await this.remote.login();
    this.isLogged = await this.remote.isLogged();
  }

  async getUserBlogId() {
    const el = this.userIdElement;
    this.userBlogId = await this.appManager.getBlogIdOf(el.value);
  }

  async searchBlog() {
    const userId = localStorage.getItem('AUTH0_USER_ID');
    const el = this.userIdElement;
    this.searchResults = await (await this.appManager.getBlogFeed(0, 10, el.value, userId)).perspectiveIds;
  }

  render() {
    if (this.loading) return html` <uprtcl-loading></uprtcl-loading> `;

    return html`
      <div style="padding: 10%;">
        <h2>Testing UI tools for development</h2>
        <hr />
        <div>
            <uprtcl-textfield id="user-id-input" label="userid or search text"></uprtcl-textfield>
            <uprtcl-button @click=${() => this.searchBlog()} style="margin:5%;">search</uprtcl-button>
            <uprtcl-button @click=${() => this.getUserBlogId()} style="margin:5%;">get user</uprtcl-button>
        </div>
        <div style="padding: 5%;">
            <h3>Fetch results from previous tools</h3>
            <hr />
            <h4>By user</h4>
            <uprtcl-list>
                ${this.blogFeedIds.map(
                    (id) => html`<uprtcl-list-item>${id}</uprtcl-list-item>`
                )}
            </uprtcl-list>
            <hr />
            <h4>By text</h4>
            <uprtcl-list>
                ${this.searchResults.map(
                (id) => html`<uprtcl-list-item>${id}</uprtcl-list-item>`
                )}
            </uprtcl-list>
        </div>
      </div>
    `;
  }

  static get styles() {
    return [
      styles,
      sharedStyles,
      css`

      `,
    ];
  }
}
