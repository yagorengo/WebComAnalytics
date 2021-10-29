import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { sp } from "@pnp/sp/presets/all";
import * as strings from 'AnalyticsApplicationCustomizerStrings';

const LOG_SOURCE: string = 'AnalyticsApplicationCustomizer';

/**
 
 */
export interface IAnalyticsApplicationCustomizerProperties {
  // This is an example; replace with your own property
  trackingId: string;
  disableAsync: boolean;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class AnalyticsApplicationCustomizer
  extends BaseApplicationCustomizer<IAnalyticsApplicationCustomizerProperties> {

  @override
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);
    sp.setup({
      spfxContext: this.context
    });
    // Retrieve properties to configure the extension
    const {  disableAsync } = this.properties;
    const trackingId = "UA-195302794-5"
    // Check that we have the mandatory tracking ID
    if (!trackingId) {
      // If there was no Google Tracking ID provided, we can stop here
      Log.info(LOG_SOURCE, `No tracking ID provided`);
      return Promise.resolve();
    }
    let scriptTag: HTMLScriptElement = document.createElement("script");
    scriptTag.nodeValue = 
    scriptTag.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(scriptTag);

    let html: string = '';

      
      if (disableAsync === true) {
        // Using legacy mode
        html += `
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
          (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
          m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
          })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  
          ga('create', '${trackingId}', 'auto');
          ga('send', 'pageview');
          `;
          //ga('set', '${idUser.Id}', 'USER_ID');
      } else {
        // Using modern browser async approach
        html = `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
          ga('create', '${trackingId}', 'auto');
          ga('send', 'pageview');
          `;
      }
    // })

    // Create an element at the end of the document
    const body: HTMLElement = document.documentElement;
    const script: HTMLScriptElement = document.createElement("script");
    script.type = "text/javascript";

    try {
      script.appendChild(document.createTextNode(html));
      body.insertAdjacentElement("beforeend", script);
      console.log('Adding Google Analytics',script );
    }
    catch (e) {
      console.log('Error adding Google Analytics', e);
    }

    // If we're using the async method, we also want to refer to the Google Analytics JavaScript file
    // asynchronously -- of course
    if (disableAsync !== true) {
      // Create an async script link
      let scriptLink = document.createElement("script");
      scriptLink.type = "text/javascript";
      scriptLink.async = true;
      scriptLink.src = "https://www.google-analytics.com/analytics.js";
      body.insertAdjacentElement("beforeend", scriptLink);
    }

    return Promise.resolve();
  }

  public getCurrentUser():Promise<any>{
    return sp.web.currentUser()
  }
}
