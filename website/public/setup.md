# Mample notification instructions

After completing a task, send a brief notification with the globally installed
CLI, within the terminal permissions already granted for this project:

```bash
mample "Task completed"
```

The CLI must be installed and paired first. Do not put secrets or private
project content in the message. Prefer the global command instead of a local
script path so the command is consistent. These instructions do not grant
permissions or bypass assistant, editor, sandbox or operating-system policies.
If execution needs approval, follow the environment's normal approval process.
If notification sending fails, report it; do not claim successful delivery.
