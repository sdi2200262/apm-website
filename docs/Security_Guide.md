---
id: security-guide
slug: /security
sidebar_label: Security Guide
sidebar_position: 11
---

# Security Guide

APM installs template files into your project. These templates define how your agents behave: what they read, which commands they follow, and how they structure their work. Files from a custom repository come from an unreviewed source, and installing them is a trust decision.

## Trust Model

APM installs from two sources:

- **Official** (`apm init`) - Templates from the [APM repository](https://github.com/sdi2200262/agentic-project-management), reviewed by its maintainers.
- **Custom** (`apm custom`) - Templates from any GitHub repository, which APM's maintainers have not reviewed.

After installation, the CLI treats both alike. Review is the only difference.

## What Custom Bundles Can Do

A custom bundle is a ZIP archive extracted into your project. A malicious one could:

- **Write files anywhere in the project** - A bundle can include `src/malicious.js`, `package.json`, `.env`, or any other path in the project. Official bundles write only to the assistant's directory (such as `.claude/`) and `.apm/`, by convention; the CLI does not enforce it.
- **Overwrite APM's files** - It can replace commands, skills, or guides with versions that look the same but carry altered instructions.
- **Instruct your agents** - Its templates can tell your agents to run harmful commands, exfiltrate data, or change code in subtle ways.

## What Custom Bundles Cannot Do

- **Run code during installation** - The CLI only extracts files. No scripts, hooks, or executables run during `apm init`, `apm custom`, `apm add`, or `apm update`.
- **Write outside the project** - The CLI checks that every extracted path resolves inside the project, and blocks entries such as `../../etc/passwd` with a warning.
- **Touch files outside the bundle** - Only the bundle's own files are written; nothing else is changed or deleted.

## The Security Disclaimer

Each time you install, add, or update from a custom repository, the CLI warns that APM's maintainers have not reviewed it, and continues only once you accept.

After installation, the CLI offers to save the repository and to skip the disclaimer for it from then on.

The risk is that a repository compromised later, through account takeover, a malicious maintainer, or a supply chain attack, then installs and updates without any warning.

To manage saved repositories:

```bash
apm custom --list              # Review saved repos and disclaimer status
apm custom --remove-repo owner/repo   # Remove a saved repo (re-enables disclaimer)
apm custom --clear             # Remove all saved repos
```

## Known Limitations

- **No release signatures** - The CLI relies on GitHub's HTTPS transport and the integrity of the source repository. A compromised GitHub account could serve malicious bundles that look legitimate.
- **No content scanning** - The CLI enforces path boundaries but does not inspect what the files contain or whether their instructions are safe.
- **Skippable disclaimer** - A saved repository that skips the disclaimer installs and updates silently. Nothing flags changes between releases.

## Mitigation Strategies

1. **Review the repository before installing** - Check its README, issues, and commit history for signs of active maintenance and trust.
2. **Inspect the installed files** - Read the commands and guides in your assistant's directory before your agents use them.
3. **Pin a release** - Install a known-good tag with `--tag` instead of the latest.
4. **Check the metadata** - Confirm the repository and version in `.apm/metadata.json`.
5. **Prefer the official release** - Use `apm init` where you can.
6. **Audit saved repositories** - Review them with `apm custom --list`, and remove those you have not checked recently so the disclaimer returns.

## Reporting Security Issues

To report a vulnerability in the CLI or the official templates, open an issue at [github.com/sdi2200262/agentic-project-management/issues](https://github.com/sdi2200262/agentic-project-management/issues) with the "security" label, or contact the maintainers directly. Please do not disclose a vulnerability publicly until it has been addressed.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customisation Guide](Customisation_Guide.md) - Custom repositories and template customisation
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimisation, and workflow efficiency
