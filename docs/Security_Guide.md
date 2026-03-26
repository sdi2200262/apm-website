---
id: security-guide
slug: /security
sidebar_label: Security Guide
sidebar_position: 11
---

# Security Guide

APM installs template files into project directories. These templates define how AI Agents behave - what they read, what commands they follow, and how they structure their work. When installing from custom repositories, these files come from an unreviewed source, which introduces trust decisions the User should understand.

## Trust Model

APM has two installation sources:

- **Official** (`apm init`) - Templates from the [APM repository](https://github.com/sdi2200262/agentic-project-management), maintained and reviewed by the APM maintainers.
- **Custom** (`apm custom`) - Templates from any GitHub repository in `owner/repo` format. These are not reviewed by APM maintainers.

The CLI treats both sources identically after installation. The only difference is the trust boundary: official templates have been reviewed, custom templates have not.

## What Custom Bundles Can Do

Custom bundles are ZIP archives extracted into the project directory. A malicious bundle could:

- **Write files anywhere within the project directory** - Not just prompt and procedural files. A bundle can include entries like `src/malicious.js`, `package.json`, `.env`, or any other path within the project root. Official bundles only write to the assistant config directory (e.g., `.claude/`, `.cursor/`) and `.apm/`, but this is a convention, not an enforcement.

- **Overwrite existing APM files** - A bundle could replace existing APM commands, skills, or guides with modified versions that appear identical but contain altered instructions.

- **Install malicious Agent instructions** - APM templates define AI Agent behavior. Malicious templates could instruct Agents to execute harmful commands, exfiltrate data, modify code in subtle ways, or behave differently than the User expects.

## What Custom Bundles Cannot Do

- **Execute code during installation** - The CLI only extracts ZIP contents. No scripts, hooks, or executables run during `apm init`, `apm custom`, `apm add`, or `apm update`.

- **Write files outside the project directory** - The CLI validates that all extracted file paths resolve within the project directory. ZIP entries that attempt path traversal (e.g., `../../etc/passwd`) are silently discarded.

- **Delete or modify files not in the bundle** - Only files explicitly included in the ZIP are written. Existing files outside the bundle's paths are untouched.

## The Security Disclaimer

The first time a custom repository is used, the CLI displays a security disclaimer warning that the content has not been reviewed by APM maintainers. The User must accept before installation proceeds.

**How `skipDisclaimer` works:**

After installation, the CLI offers to save the repository for future use. Saved repositories can be configured to skip the security disclaimer on subsequent use. This applies to `apm custom`, `apm add`, and `apm update`.

**The risk:** When a saved repository has the disclaimer skip enabled, no security warning is shown for that repository. If the repository is later compromised - through account takeover, a malicious maintainer, or a supply chain attack - the User receives no warning when installing or updating. The disclaimer is a one-time gate, not continuous monitoring.

**Managing saved repositories:**

```bash
apm custom --list              # Review saved repos and disclaimer status
apm custom --remove-repo owner/repo   # Remove a saved repo (re-enables disclaimer)
apm custom --clear             # Remove all saved repos
```

## Known Limitations

- **No release signature verification** - The CLI does not verify cryptographic signatures on releases. Security relies on GitHub's HTTPS transport and the integrity of the source repository. A compromised GitHub account could serve malicious bundles that appear legitimate.

- **No content scanning** - The CLI does not inspect or validate the contents of extracted files. It enforces path boundaries but does not analyze what the files contain or whether Agent instructions are safe.

- **The disclaimer is a one-time gate** - The security disclaimer appears once per repository (or not at all for saved repos with `skipDisclaimer`). There is no ongoing monitoring, version diffing, or alerting when a repository's content changes between releases.

## Mitigation Strategies

1. **Review the repository before installation** - Check the repository's README, issues, and commit history. Look for signs of active maintenance and community trust.

2. **Inspect bundle contents after installation** - Review the extracted files in your project's `.claude/`, `.github/`, or equivalent directory before using them with an AI Agent. Pay particular attention to commands and guides that define Agent behavior.

3. **Use specific tags** - Instead of relying on "latest", specify a known-good release tag with `--tag` to avoid pulling unexpected changes.

4. **Check the installation metadata** - After installation, review `.apm/metadata.json` to verify the source repository and version.

5. **Prefer official repositories** - When possible, use `apm init` for official, reviewed templates.

6. **Audit saved repositories** - Periodically review saved repositories with `apm custom --list`. Consider removing repositories you have not recently audited, so the security disclaimer reappears on next use.

## Reporting Security Issues

If you discover a security vulnerability in the `agentic-pm` CLI or official templates, please report it by opening an issue at [github.com/sdi2200262/agentic-project-management/issues](https://github.com/sdi2200262/agentic-project-management/issues) with the "security" label, or contact the maintainers directly.

Do not publicly disclose vulnerabilities until they have been addressed.

## Related Docs

- [CLI Guide](CLI_Guide.md) - All CLI commands and options
- [Troubleshooting Guide](Troubleshooting_Guide.md) - Common issues and recovery procedures
- [Customization Guide](Customization_Guide.md) - How to create and use custom repositories
- [Tips and Tricks](Tips_and_Tricks.md) - Model selection, cost optimization, and workflow efficiency
