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

Both use the same extraction process. Official releases also use the CLI's major-version filter; custom releases do not.

## Bundle Contents and Limits

A bundle is a ZIP archive extracted into your project. It can overwrite project files and install instructions that tell an agent to run harmful commands or expose data. Official bundles use `.agents/`, `.claude/` and `.apm/` by convention; custom bundles can use other project paths.

The CLI checks extracted paths and blocks entries that resolve outside the project. It does not scan content or verify release signatures. Installation extracts files without running bundle scripts, but agents may act on those instructions later. Updates and archives also move session files and remove installed files recorded in metadata.

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
