/**
 * A report that cannot be turned into a `PartModel`.
 *
 * Contract mismatches are caught at normalization rather than deep in the
 * renderer. A region table that does not tile the mesh would otherwise surface
 * as mysterious mis-picking — that is, as a *shader* bug — hours away from its
 * cause.
 */
export class PartReportFormatError extends Error {
  override readonly name = 'PartReportFormatError'
  /** Every problem found, not just the first. */
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(
      issues.length === 1
        ? `Malformed part report: ${issues[0]}`
        : `Malformed part report (${issues.length} problems):\n- ${issues.join('\n- ')}`,
    )
    this.issues = issues
  }
}

/**
 * A report from a kernel older than the one this package targets.
 *
 * `0.2.0` identified features by a dense `featureIndex` and published no
 * `regions[]`; `0.3.0` replaced that with an opaque `featureTag` and a region
 * table. The two are mutually incompatible on feature identity, so this package
 * targets one version and fails loudly rather than carrying a permanent
 * compatibility shim.
 */
export class UnsupportedKernelVersionError extends Error {
  override readonly name = 'UnsupportedKernelVersionError'
  readonly kernelVersion: string
  readonly minimumKernelVersion: string

  constructor(kernelVersion: string, minimumKernelVersion: string) {
    super(
      `Part report is from kernel ${kernelVersion}; @toolpath/viewer requires ` +
        `${minimumKernelVersion} or newer, which is the first version to publish ` +
        `regions[] and featureTag. Re-analyze the part on a current engine.`,
    )
    this.kernelVersion = kernelVersion
    this.minimumKernelVersion = minimumKernelVersion
  }
}
