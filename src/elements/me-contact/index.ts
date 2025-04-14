
import { html, LitElement } from 'lit';
import { customElement, property, query, queryAll } from 'lit/decorators.js';
import KemetField from 'kemet-ui/dist/components/kemet-field/kemet-field';
import MeLoader from '../me-loader';

import 'kemet-ui/dist/components/kemet-field/kemet-field';
import 'kemet-ui/dist/components/kemet-input/kemet-input';
import 'kemet-ui/dist/components/kemet-textarea/kemet-textarea';
import 'kemet-ui/dist/components/kemet-button/kemet-button';
import '../me-loader';
import styles from './styles';



interface IData {
  message: string;
  code: number;
};

@customElement('me-contact')
export class MeContact extends LitElement {
  static styles = [styles];

  @property()
  formMessage: string = '';

  @query('form')
  form!: HTMLFormElement;

  @query('me-loader')
  loader!: MeLoader;

  @queryAll('kemet-field')
  fields!: KemetField[];

  render() {
    return html`
      <form @submit=${(event: any) => this.sendMessage(event)}>
        <fieldset>
          <kemet-field label="Your Name" message="Your name is required.">
            <kemet-input slot="input" name="user" required></kemet-input>
          </kemet-field>
          <kemet-field label="Your Phone">
            <kemet-input slot="input" name="phone"></kemet-input>
          </kemet-field>
          <kemet-field label="Your Email" message="Your email is required.">
            <kemet-input slot="input" name="email" required></kemet-input>
          </kemet-field>
          <kemet-field label="What's on your mind?" message="Please leave a message.">
            <kemet-textarea slot="input" name="message" required></kemet-textarea>
          </kemet-field>
        </fieldset>
        <p><me-loader></me-loader></p>
        <p>${this.formMessage}</p>
        <kemet-button variant="rounded">Send me a message</kemet-button>
      </form>
    `
  }

  sendMessage(event: any) {
    event.preventDefault();
    this.loader.loading = true;

    setTimeout(async () => {
      const hasError = Array.from(this.fields).some(field => field.status === 'error');

      if (hasError) {
        this.formMessage = "Please fix the errors on the form!"
      } else {
        const form = new FormData(this.form);
        const url = '/api/contact';

        const bodyData = {
          user: form.get('user'),
          phone: form.get('phone'),
          email: form.get('email'),
          message: form.get('message'),
        };

        const config = {
          method: 'POST',
          body: JSON.stringify(bodyData),
          headers: {
            'Content-Type': 'application/json'
          }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json() as IData;

            this.loader.loading = false;

            if (data.message = 'SUCCESS') {
              this.formMessage = 'Your message was sent successfully!'
            } else {
              this.formMessage = 'There was a problem sending your message.'
            }
        } catch (error) {
          console.error(error);
        }
      }
    }, 1);

  }
}
