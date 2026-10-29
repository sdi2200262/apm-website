---
id: security-guide
slug: /security
sidebar_label: Security Guide
sidebar_position: 11
---

# Security Guide

APM installs templates that guide your agents' work. Review their source and instructions before using them.

## Trust Model

APM installs from two sources:

- **Official** (`apm init`) - Templates from the [APM repository](https://github.com/sdi2200262/agentic-project-management), reviewed by its maintainers.
- **Custom** (`apm custom`) - Templates from any GitHub repository, which APM's maintainers have not reviewed.

Both use the same extraction process. See [CLI versioning](CLI_Guide.md#versioning) for release compatibility.

## Bundle Contents and Limits

A bundle is a ZIP archive extracted into your project. It can overwrite project files and install instructions that tell an agent to run harmful commands or expose data. Official bundles use `.agents/`, `.claude/` and `.apm/` by convention; custom bundles can use other project paths.

The CLI checks extracted paths and blocks entries that resolve outside the project. It does not scan content or verify release signatures. Installation extracts files without running bundle scripts, but agents may act on those instructions later. Updates and archives also move session files and remove installed files recorded in metadata.

## The Security Disclaimer

Installing, adding or updating from a custom repository requires your acknowledgement that its templates are unreviewed. Saving the repository with `skipDisclaimer` enabled suppresses that prompt on later use. This setting does not verify the repository or warn if it is later compromised.

To manage saved repositories:

```bash
apm custom --list              # Review saved repos and disclaimer status
apm custom --remove-repo owner/repo   # Remove a saved repo (re-enables disclaimer)
apm custom --clear             # Remove all saved repos
```

## Mitigation Strategies

1. **Review the source and instructions.** Check the repository's README and history, and inspect its skills and guides before agents use them.
2. **Choose and confirm a release.** Pin a known release with `--tag` and check the repository and version in `.apm/metadata.json`.
3. **Review saved repositories.** Check `apm custom --list`. Remove a saved source to restore its acknowledgement prompt.

## Reporting Security Issues

Report vulnerabilities through [GitHub Issues](https://github.com/sdi2200262/agentic-project-management/issues) or contact the maintainers directly. Share sensitive details privately until the issue is addressed.

## Related Docs

- [CLI Guide](CLI_Guide.md#apm-custom) - Manage saved repositories and their settings
- [Customisation Guide](Customisation_Guide.md) - Build and share custom templates
