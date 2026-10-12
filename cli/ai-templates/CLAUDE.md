# Mample notification instructions

After completing a task, send a brief notification using the globally installed
CLI. The CLI must be installed and paired with the mobile app first.

## Message format

Always put the notification message inside double quotes:

```bash
mample "Task completed"
```

Use empty double quotes to send the default notification message configured in
the mobile app:

```bash
mample ""
```

If the user asks to be notified when input is needed, send a brief Mample
notification before asking the question, when command execution is permitted.

## Terminal permission: user setup

The user should enable persistent terminal permission for Mample commands in
their assistant, if supported. Review the proposed command and choose
"Always allow" for Mample when available. Permission settings vary by assistant.

Approving an entire command such as mample "Task completed" may permit only
that exact message. To allow different messages without repeated prompts, the
user must configure a command-level permission in the assistant's settings,
if supported. Quoting a message does not broaden permission. Already granted
permission may mean no prompt appears.

These instructions do not grant permission. The assistant must follow the
environment's normal approval process; do not modify permission settings or
bypass assistant, editor, sandbox or operating-system policies.

## Execution and reporting

Prefer the global command instead of a local script path. On Windows, use
mample.cmd with the same quoted arguments if the PowerShell launcher is blocked.
Do not put secrets or private project content in notification messages.
If sending fails or is blocked by permission, report it. A successful CLI response
confirms server acceptance, not independently verified delivery to the phone.
