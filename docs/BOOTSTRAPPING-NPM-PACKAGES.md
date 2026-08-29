# Bootstrapping a new npm package

Normal npm releases use GitHub Actions OIDC trusted publishing. npm does not allow a trusted
publisher to be configured until the package exists, so each new package needs one maintainer-run
bootstrap publish. This is the only manual publish; do not add an npm token to the release workflow.

## Steps

1. Add the package's Changeset and merge its source pull request normally. Its `repository.url`
   must be `https://github.com/toolpath/ui-packages.git`.
2. Wait for the release-metadata pull request. CI recognizes that the package is new, leaves this
   PR open, and comments with the command to run. It assigns the package's initial version.
3. Check out that release-metadata PR locally and run:

   ```sh
   gh pr checkout <release-pr-number>
   pnpm install --frozen-lockfile
   npm login
   pnpm bootstrap:npm-package @toolpath/tool-scraper
   ```

   The command builds and publishes the version in that release PR, then configures npm trusted
   publishing for `toolpath/ui-packages` and `.github/workflows/release.yml`.

4. Merge the release-metadata PR. CI recognizes that version as already published. Every later
   release uses trusted publishing automatically.

The bootstrap command refuses to publish version `0.0.0` or a package with a repository URL that
does not match `origin`. If its version is already published, it skips publishing and only sets up
trusted publishing.
