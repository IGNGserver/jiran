# Code signing policy

Free code signing provided by [SignPath.io](https://signpath.io/), certificate by [SignPath Foundation](https://signpath.org/).

## Signed artifacts

The current release workflow Authenticode-signs Jiran's Windows application executable, installer (`Jiran-Setup-*.exe`), and portable build (`Jiran-*.exe`). The expected publisher is **SignPath Foundation**.

## Verify a download

In Windows Explorer, right-click the `.exe`, select **Properties**, then open **Digital Signatures**. The signer should be SignPath Foundation and Windows should report that the signature is valid.

You can also inspect both downloads in PowerShell:

```powershell
Get-AuthenticodeSignature ".\Jiran-Setup-<version>.exe", ".\Jiran-<version>.exe" | Format-List Path, Status, SignerCertificate, TimeStamperCertificate
```

A genuine Jiran release should show `Valid` status, SignPath Foundation as the signer, and timestamp information.

After installation, the same check can be run against `Jiran.exe` in the application's installation directory.

## Signing controls

- Signing requests originate from the repository's [release workflow](../.github/workflows/release.yml), which builds on GitHub-hosted runners.
- Every production signing request requires manual approval in SignPath.
- The version-controlled [application](../.github/signpath/application-artifact-configuration.xml) and [release artifact](../.github/signpath/artifact-configuration.xml) configurations restrict signed files by exact path, product name, and product version.
- The application executable is signed before packaging; the resulting installer and portable wrapper are signed afterward.
- Before publishing, the release workflow verifies all three signatures, their signer, and their timestamps.

## Team roles

- Committers and reviewers: [@IGNGserver](https://github.com/IGNGserver)
- Approvers: [@IGNGserver](https://github.com/IGNGserver)

## Privacy

- Privacy policy: [Jiran privacy policy](privacy.md)

