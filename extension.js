// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require("vscode");

//---------------------------------------------------------------------------------------

//# rikimaru specific imports
const rikimaru = require("./src/riki-core.js");
const async = require("async");
//# rikimaru specific imports

//---------------------------------------------------------------------------------------

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "rikimaru" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("rikimaru.search", function() {
    // The code you place here will be executed every time your command is executed

    //# async series used to design the control flow pipeline for rikimaru
    async.series(
      [
        callback => {
          // Welcome message for the user
          vscode.window
            .showInformationMessage("Rikimaru at your service. Enter the search term to continue...")
            .then(callback);
        },
        () => {
          //# rikimaru search invoked
          vscode.window
            .showInputBox({
              placeHolder: "Enter your search string here.",
              prompt: "rikimaru at your service.",
              value: "dfs",
              ignoreFocusOut: true
            })
            .then(value => rikimaru.search(value), reason => vscode.window.showErrorMessage(reason + ""));
        }
      ],
      (err, results) => {
        // in case the pipeline fails
        console.log(`Error:: ${JSON.stringify(err, null, 4)}, Results: ${JSON.stringify(results, null, 4)}`);
      }
    );
    //# async series used to design the control flow pipeline for rikimaru
  });

  context.subscriptions.push(disposable);
}

//---------------------------------------------------------------------------------------

// this method is called when your extension is deactivated
function deactivate() {}

//---------------------------------------------------------------------------------------

exports.activate = activate;
exports.deactivate = deactivate;

//---------------------------------------------------------------------------------------
