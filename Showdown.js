/*************************************************************************************************
/ Author: Daniel Hearn
/ Email: daniel.hearn@gmail.com
/ Date: 5 September 2024
/
/ Description: Wrapper around the showdownjs library which is used to render markdown as html
/     for display in the UI. In addition, the github markdown css is used to style the raw
/     html.
/
/ Showdownjs Documentation: https://showdownjs.com/docs/configuration/
/
*************************************************************************************************/
eval(UrlFetchApp.fetch(`https://cdn.rawgit.com/showdownjs/showdown/2.1.0/dist/showdown.min.js`).getContentText());


/*************************************************************************************************
/ RenderMarkdown
/ 
/ @param {string} mdText - a string of well-formed github flavored markdown (GFM) text.
/ @returns {string} - a string containing the rendered markdown as html including the CSS.
*************************************************************************************************/
function RenderMarkdown (mdText) {

  s = new showdown.Converter({completeHTMLDocument: true});
  s.setFlavor('github');

  html = s.makeHtml(mdText);

  const $ = Cheerio.load(html);

  head = 
  `  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown-dark.css">
  <style>
    .markdown-body {
      box-sizing: border-box;
      min-width: 200px;
      max-width: 980px;
      margin: 0 auto;
      padding: 45px;
      }

    @media (max-width: 767px) {
      .markdown-body {
      padding: 15px;
      }
    }
  </style>`;

  $('head').html(head)
  $('body').attr('style', 'background-color:#34343d;');
  $('body').wrapInner(`<article class="markdown-body"></article>`);

  csshtml = $('*').html();
  return csshtml
}