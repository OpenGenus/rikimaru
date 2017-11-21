/**
* riki-core.js
* @author Sidharth Mishra
* @description rikimaru core logic
* @created Wed Nov 15 2017 19:41:28 GMT-0800 (PST)
* @copyright 2017 Sidharth Mishra
* @last-modified Wed Nov 15 2017 19:41:28 GMT-0800 (PST)
*/

//---------------------------------------------------------------------------------------

//# imports commonjs style
const http = require("http");
const Request = require("request");
const async = require("async");
const _ = require("lodash");
const path = require("path");
const vscode = require("vscode");
//# imports commonjs style
const rikiBrowser = require("./riki-browser");
//---------------------------------------------------------------------------------------

// The default search string
let defaultSearchString = "dfs";

// Request URL
//`https://api.github.com/search/code?q=${searchString}+in:file+language:${languageName+repo:OpenGenus/cosmos`;

//---------------------------------------------------------------------------------------

/**
 * fetchResults
 * ~~~~~~~~~~~~~~~
 * Queries GitHub's Search API and fetches the search results.
 * 
 * @param {string} searchString The search string entered by user
 * @param {(string) => any} callback The callback function to be called after this fetches the search results from GitHub
 */
function fetchResults(searchString, callback) {
  //# user's configurations
  const username = vscode.workspace.getConfiguration("rikimaru").get("user.github.name");
  const userToken = vscode.workspace
    .getConfiguration("rikimaru")
    .get("user.github.personal-token");
  //# user's configurations

  if (!searchString) searchString = defaultSearchString;

  //# cleanse searchString of `-` sign, since it is reserved for queries
  searchString = searchString.replace("-", "+");

  //# Data fetch
  Request.get(
    `https://api.github.com/search/code?q=${encodeURIComponent(
      searchString
    )}+in:file+repo:OpenGenus/cosmos`,
    {
      auth: {
        user: username,
        password: userToken
      },
      headers: {
        "User-Agent": "request"
      }
    },
    (error, response, body) => {
      // console.log(`${JSON.stringify(response)}`);
      callback(null, body);
      if (error) console.log(`Error: ${JSON.stringify(error)}`);
    }
  );
  //# Data fetch
}

//---------------------------------------------------------------------------------------

/**
 * processResults
 * ~~~~~~~~~~~~~~~~~
 * Processes the search results obtained from GitHub.
 * 
 * @param {string} results the results obtained from GitHub's search API
 * @param {(string) => any} callback the callback to be called after the results are processed
 */
function processResults(results, callback) {
  let pResults_temp = JSON.parse(results);

  //# no items found scenario
  if (
    !pResults_temp["items"] ||
    (pResults_temp["items"] && pResults_temp["items"].length === 0)
  )
    return callback("No items to display!");
  //# no items found scenario

  //# data cleansing
  let pResults = pResults_temp["items"].map(item => {
    return {
      name: item.name,
      path: item.path,
      url: item.html_url
    };
  });
  //# data cleansing

  callback(null, pResults);
}

//---------------------------------------------------------------------------------------

/**
 * displayResults
 * ~~~~~~~~~~~~~~~~
 * Displays the processed results to the user using the vscode.window.showQuickPick component.
 * 
 * @param {[object]} pResults The processed results to be shown to the user
 */
function displayResults(pResults, callback) {
  //# UNABLE TO RENDER BROWSER INSIDE VS-CODE FOR NOW :(
  // console.log(JSON.stringify(pResults, null, 4));
  //# handler for https:// and http:// protocols
  // let provider = {
  //   provideTextDocumentContent: (uri, token) => {
  //     // console.log(`URI:: ${uri}`);
  //     const s = `
  //     <!DOCTYPE html>
  //     <html lang="en">
  //     <head>
  //       <meta charset="UTF-8">
  //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
  //       <meta http-equiv="X-UA-Compatible" content="ie=edge">
  //       <title>Document</title>
  //     </head>
  //     <body>
  //       <iframe src="${uri}" frameBorder="0" style="width: 800px; height: 800px;" />
  //     </body>
  //     </html>`;
  //     console.log(s);
  //     return s;
  //   }
  // };
  //# handler for https:// and http:// protocols

  // Handle http:// and https://.
  // let registrationHTTPS = vscode.workspace.registerTextDocumentContentProvider("https", provider);
  // let registrationHTTP = vscode.workspace.registerTextDocumentContentProvider("http", provider);
  //# UNABLE TO RENDER BROWSER INSIDE VS-CODE FOR NOW :(

  //# display waterfall pipeline
  async.waterfall(
    [
      /**
       * showQuickPickToUser
       * ~~~~~~~~~~~~~~~~~~~~~~
       * Shows the quick pick menu to the user and then executes the callback after the User selects an item from it.
       * 
       * @param {function} callback The callback function that needs to be executed after the user selects an item.
       */
      function showQuickPickToUser(callback) {
        //# let the user select the option
        vscode.window
          .showQuickPick(
            pResults.map(
              p => `${p["name"]} located at: ${path.join("cosmos", p["path"])}`
            )
          )
          .then(value => callback(null, value), reason => console.log(reason));
        //# let the user select the option
      },

      /**
       * openSelectedResouceInDefaultBrowser
       * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
       * 
       * Opens the page selected by the user in the default browser
       * @param {string} result The result from previous stage
       * @param {function} callback The callback to execute after this
       */
      function openSelectedResouceInDefaultBrowser(result, callback) {
        //# open user's selection in the default browser
        // console.log("result = ", result);
        if (!result || (result && result.length === 0)) return; // base case

        const [name, resourcePath] = result.split(" located at: "); // find the path, the path is unique, name isn't

        if (resourcePath.split("/").length < 2) return; // base case #2 --- unexpected

        const resourcePathSansCosmosInitial = resourcePath
          .split("/")
          .splice(1)
          .join("/");

        // console.log(name, resourcePath, resourcePathSansCosmosInitial);

        const matchingResouces = pResults.filter(
          r => r["path"] === resourcePathSansCosmosInitial
        );

        if (matchingResouces.length < 1) return; // base case #3 --- unexpected

        const resourceURL = matchingResouces[0]["url"]; // the URL to open in the browser

        // console.log(resourceURL);
        // const { spawnSync } = require("child_process");
        // let node_modules_path = __dirname.split(path.sep);
        // node_modules_path.splice(-1);
        // node_modules_path = node_modules_path.join(path.sep) + path.sep + "node_modules";
        // const electron_spawn = spawnSync(
        //   path.join(node_modules_path, "electron", "cli.js"),
        //   [path.join(__dirname, "riki-browser.js")]
        // );
        // rikiBrowser.appInit();
        // rikiBrowser.createWindow(resourceURL);

        vscode.commands
          .executeCommand(
            "vscode.open",
            vscode.Uri.parse(resourceURL),
            vscode.window.activeTextEditor
              ? vscode.window.activeTextEditor.viewColumn
              : vscode.ViewColumn.One
          ) //"vscode.previewHtml", --- was planning to use it, but the API is not clear - super muddy
          .then(success => {}, (err, reason) => console.log(err, reason));
        //# open user's selection in the default browser
      }
    ],
    (err, reason) => console.log(err, reason)
  );
  //# display waterfall pipeline
}

//---------------------------------------------------------------------------------------

/**
 * search
 * ~~~~~~~~~
 * The rikimaru search entry point
 */
function search(searchString) {
  if (!searchString || (searchString && searchString.length === 0)) {
    vscode.window.showErrorMessage("No search string was entered.");
    return;
  }

  //# async waterfall for control flow
  async.waterfall(
    [
      callback => callback(null, searchString),
      fetchResults,
      processResults,
      displayResults
    ],
    (err, result) =>
      console.log(
        `Error: ${JSON.stringify(err, null, 4)}, Result: ${JSON.stringify(
          result,
          null,
          4
        )}`
      )
  );
  //# async waterfall for control flow
}

//---------------------------------------------------------------------------------------

//# export search
module.exports.search = search;
//# export search

//---------------------------------------------------------------------------------------
