#!/usr/bin/env node

// require fetch api
import fetch from 'node-fetch';

import vscodeLanguageserver from 'vscode-languageserver';

const connection = vscodeLanguageserver.createConnection(vscodeLanguageserver.ProposedFeatures.all);

const documents = new vscodeLanguageserver.TextDocuments();

let hasWorkspaceFolderCapability = false;

function puts(message) {
  console.log(message);
}

connection.onInitialize((params) => {
    if (params.capabilities.workspace && params.capabilities.workspace.workspaceFolders) {
        hasWorkspaceFolderCapability = Boolean(params.capabilities.workspace.workspaceFolders.supported);
    }
    return {
        capabilities: {
            textDocumentSync: documents.syncKind,
            completionProvider: {
                triggerCharacters: ['.']
            }
        }
    };
});

connection.onInitialized(() => {
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders(_event => {
            puts('Workspace folder change event received.');
        });
    }
});

connection.onCompletion(
    async (_textDocumentPosition) => {
      try {
        const response = await fetch('http://localhost:9001/dragon/lsp/pulse');
        const json = await response.json();
        puts(json)
      } catch(error) {
        throw new Error("DragonRuby Game Toolkit doesn't appear to be running.");
      }

      try {
        const response = await fetch('http://localhost:9001/dragon/lsp/completion', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            position: _textDocumentPosition.position,
            uri: _textDocumentPosition.textDocument.uri,
          }),
        });

        const json = await response.json();
        let results = json.result.map(item => {
          if (item.kind === 'method') {
            return {
              label: item.label,
              kind: vscodeLanguageserver.CompletionItemKind.Method,
            };
          } else {
            throw new Error('Unknown kind: ' + item.kind);
          }
        });

        return results;
      } catch(error) {
        throw error;
      }
    }
);

documents.onDidChangeContent(change => {
    connection.console.log(`We received an change event from ${change.document.uri}`);
});

puts("server started/reloaded");

documents.listen(connection);

connection.listen();
