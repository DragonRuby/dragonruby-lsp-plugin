(lsp-register-client
 (make-lsp-client :new-connection (lsp-stdio-connection '("/opt/homebrew/bin/nodemon" "/Users/amiralirajan/projects/lsp-ruby-test/dragonruby-lsp/server.js" "--stdio"))
                  :major-modes '(ruby-mode)
                  :server-id 'dragonruby-lsp))
