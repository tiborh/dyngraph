CONTRIBUTING

Thanks for contributing! Please follow these simple steps to get started and make PRs easy to review.

Getting started
- Fork the repo and create a feature branch: git checkout -b feat/<idea-id>-short-desc
- Install deps: npm ci
- Run unit tests: npm test
- (Optional) Install Playwright browsers for e2e: npx playwright install --with-deps
- Run e2e smoke tests: npm run test:e2e

Claiming work
- See IMPROVEMENT_IDEAS.md for the canonical idea IDs.
- Open a GitHub issue referencing the idea ID (e.g. "Fix label placement — fixes #fix-label-placement") or comment on the idea to claim it.

Pull request checklist
- Branch named as above
- Tests added/updated where applicable
- All tests pass locally (unit and e2e when relevant)
- Update README/ROADMAP/IMPROVEMENT_IDEAS.md when behaviour or public APIs change
- Keep changes surgical and limited to the scope of the issue
- Link the PR to an issue and reference the IMPROVEMENT_IDEAS id

Code style & docs
- Prefer small, well-documented changes. Add JSDoc comments for new public functions/classes.
- Avoid committing node_modules or build artifacts; these are in .gitignore.

CI
- The repository runs GitHub Actions (unit + Playwright e2e). Ensure your changes do not break the CI workflow.

If you have questions, open an issue and tag @tiborh. Thank you!
